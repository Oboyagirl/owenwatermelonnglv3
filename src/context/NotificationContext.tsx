import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { auth } from '../services/firebase';
import { useAuth } from './AuthContext';
import {
  ChatProfile,
  ChatThread,
  UserContact,
  deriveFriendCode,
  subscribeDiscoverableProfiles,
  subscribeMyChatThreads,
  subscribeMyContacts,
  timestampToMs
} from '../services/chatService';
import {
  GameInvite,
  respondToGameInvite,
  subscribeMyGameInvites
} from '../services/inviteService';
import { watchChessRoomSummary } from '../services/chessRoomService';
import { watchArcadeRoomSummary } from '../services/arcadeRoomService';
import type { PieceColor } from '../utils/chessEngine';
import type { ArcadeGameType, ArcadePlayer } from '../utils/arcadeEngines';
import { getArcadeGameMeta } from '../utils/arcadeEngines';

export type AppSpaceType = 'home' | 'games' | 'apps' | 'music' | 'chess' | 'rooms' | 'leaderboard' | 'tools' | 'saved';

export interface ChatPeerTarget {
  userId: string;
  displayName: string;
  friendCode: string;
  avatarId: string;
}

export interface TrackedChessRoom {
  code: string;
  mySide: PieceColor;
}

export interface TrackedArcadeRoom {
  code: string;
  mySide: ArcadePlayer;
  gameType: ArcadeGameType;
  gameTitle: string;
}

export type AppToastKind = 'chat' | 'turn' | 'invite' | 'info';

export interface AppToast {
  id: string;
  kind: AppToastKind;
  title: string;
  body: string;
  avatarId?: string;
  createdAt: number;
  chatTarget?: ChatPeerTarget;
  targetSpace?: 'chess' | 'rooms';
  roomCode?: string;
  invite?: GameInvite;
}

interface NotificationContextValue {
  toasts: AppToast[];
  dismissToast: (id: string) => void;
  contacts: UserContact[];
  directoryProfiles: ChatProfile[];
  allInvites: GameInvite[];
  incomingInvites: GameInvite[];
  outgoingInvites: GameInvite[];
  lastAcceptedInvite: GameInvite | null;
  pendingChessJoinCode: string | null;
  clearPendingChessJoinCode: () => void;
  pendingArcadeJoinCode: string | null;
  clearPendingArcadeJoinCode: () => void;
  pendingChatTarget: ChatPeerTarget | null;
  clearPendingChatTarget: () => void;
  setChatOpenState: (open: boolean, activePartnerUid: string | null) => void;
  trackedChessRoom: TrackedChessRoom | null;
  setTrackedChessRoom: (room: TrackedChessRoom | null) => void;
  trackedArcadeRoom: TrackedArcadeRoom | null;
  setTrackedArcadeRoom: (room: TrackedArcadeRoom | null) => void;
  openChatWithPeer: (peer: ChatPeerTarget) => void;
  openGameRoom: (space: 'chess' | 'rooms', code?: string) => void;
  navigateSpace: (space: AppSpaceType) => void;
  acceptGameInvite: (invite: GameInvite) => Promise<void>;
  declineGameInvite: (invite: GameInvite) => Promise<void>;
  pushTurnToast: (params: { space: 'chess' | 'rooms'; title: string; body: string; roomCode?: string }) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  activeSpace: AppSpaceType;
  onNavigateSpace: (space: AppSpaceType) => void;
  onOpenChat: () => void;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  activeSpace,
  onNavigateSpace,
  onOpenChat
}) => {
  const { user } = useAuth();
  const isFirebaseReady = Boolean(user?.uid && auth.currentUser?.uid === user.uid);
  const myUid = isFirebaseReady ? user!.uid : '';

  const [toasts, setToasts] = useState<AppToast[]>([]);
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [directoryProfiles, setDirectoryProfiles] = useState<ChatProfile[]>([]);
  const [invites, setInvites] = useState<GameInvite[]>([]);

  const [pendingChessJoinCode, setPendingChessJoinCode] = useState<string | null>(null);
  const [pendingArcadeJoinCode, setPendingArcadeJoinCode] = useState<string | null>(null);
  const [pendingChatTarget, setPendingChatTarget] = useState<ChatPeerTarget | null>(null);
  const [lastAcceptedInvite, setLastAcceptedInvite] = useState<GameInvite | null>(null);

  const [trackedChessRoom, setTrackedChessRoomState] = useState<TrackedChessRoom | null>(null);
  const [trackedArcadeRoom, setTrackedArcadeRoomState] = useState<TrackedArcadeRoom | null>(null);

  const chatOpenRef = useRef<{ isOpen: boolean; partnerUid: string | null }>({
    isOpen: false,
    partnerUid: null
  });
  const activeSpaceRef = useRef<AppSpaceType>(activeSpace);
  activeSpaceRef.current = activeSpace;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastChimeMsRef = useRef<number>(0);

  const threadVersionMapRef = useRef<Map<string, number>>(new Map());
  const threadsInitializedRef = useRef(false);

  const seenInviteIdsRef = useRef<Set<string>>(new Set());
  const outgoingStatusRef = useRef<Map<string, string>>(new Map());
  const invitesInitializedRef = useRef(false);

  const chessWatchStateRef = useRef<{ code: string; turn: PieceColor; moveCount: number; opponentJoined: boolean } | null>(null);
  const arcadeWatchStateRef = useRef<{ code: string; turn: ArcadePlayer; moveCount: number; opponentJoined: boolean } | null>(null);

  const playNotificationChime = useCallback((kind: AppToastKind) => {
    const nowMs = Date.now();
    if (nowMs - lastChimeMsRef.current < 900) return;
    lastChimeMsRef.current = nowMs;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const playTone = (freq: number, dur: number, offset: number, vol = 0.08) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);
        gain.gain.setValueAtTime(vol, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + dur);
      };
      if (kind === 'invite') {
        playTone(587.33, 0.09, 0, 0.09);
        playTone(880, 0.14, 0.08, 0.1);
      } else if (kind === 'turn') {
        playTone(523.25, 0.08, 0, 0.08);
        playTone(659.25, 0.12, 0.07, 0.09);
      } else {
        playTone(660, 0.07, 0, 0.07);
        playTone(784, 0.09, 0.06, 0.07);
      }
    } catch {}
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<AppToast, 'id' | 'createdAt'>, ttlMs = 8000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const full: AppToast = {
        ...toast,
        id,
        createdAt: Date.now()
      };
      setToasts(prev => {
        // Replace older toast of same room/invite/sender to keep tray clean
        const filtered = prev.filter(item => {
          if (toast.invite && item.invite?.id === toast.invite.id) return false;
          if (toast.chatTarget && item.chatTarget?.userId === toast.chatTarget.userId) return false;
          if (toast.roomCode && item.roomCode === toast.roomCode && item.kind === toast.kind) return false;
          return true;
        });
        return [full, ...filtered].slice(0, 4);
      });
      playNotificationChime(toast.kind);
      if (ttlMs > 0) {
        window.setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, ttlMs);
      }
    },
    [playNotificationChime]
  );

  // Subscribe to directory, contacts, chat threads (for "____ texted you"), and game invites
  useEffect(() => {
    if (!isFirebaseReady || !myUid) {
      setContacts([]);
      setDirectoryProfiles([]);
      setInvites([]);
      threadsInitializedRef.current = false;
      threadVersionMapRef.current.clear();
      invitesInitializedRef.current = false;
      seenInviteIdsRef.current.clear();
      outgoingStatusRef.current.clear();
      return;
    }

    const unsubDir = subscribeDiscoverableProfiles(
      list => setDirectoryProfiles(list),
      () => {}
    );

    const unsubContacts = subscribeMyContacts(
      myUid,
      list => setContacts(list),
      () => {}
    );

    const unsubThreads = subscribeMyChatThreads(
      myUid,
      (threadList: ChatThread[]) => {
        if (!threadsInitializedRef.current) {
          threadsInitializedRef.current = true;
          for (const t of threadList) {
            threadVersionMapRef.current.set(t.threadId, timestampToMs(t.updatedAt));
          }
          return;
        }

        for (const t of threadList) {
          const prevMs = threadVersionMapRef.current.get(t.threadId) || 0;
          const nextMs = timestampToMs(t.updatedAt) || Date.now();
          if (nextMs <= prevMs) continue;
          threadVersionMapRef.current.set(t.threadId, nextMs);

          const senderUid = t.lastMessageSenderUid;
          if (!senderUid || senderUid === myUid || !t.lastMessageText) continue;

          const viewingSameChat =
            chatOpenRef.current.isOpen &&
            chatOpenRef.current.partnerUid === senderUid &&
            (typeof document === 'undefined' || document.visibilityState === 'visible');
          if (viewingSameChat) continue;

          const isMeA = t.userAUid === myUid;
          const senderName = isMeA ? t.userBName : t.userAName;
          const senderAvatar = isMeA ? t.userBAvatarId : t.userAAvatarId;

          pushToast(
            {
              kind: 'chat',
              title: `${senderName} texted you`,
              body: t.lastMessageText,
              avatarId: senderAvatar,
              chatTarget: {
                userId: senderUid,
                displayName: senderName,
                friendCode: deriveFriendCode(senderUid),
                avatarId: senderAvatar
              }
            },
            8000
          );
        }
      },
      () => {}
    );

    const unsubInvites = subscribeMyGameInvites(
      myUid,
      (list: GameInvite[]) => {
        setInvites(list);

        if (!invitesInitializedRef.current) {
          invitesInitializedRef.current = true;
          const now = Date.now();
          for (const inv of list) {
            seenInviteIdsRef.current.add(inv.id);
            if (inv.fromUid === myUid) {
              outgoingStatusRef.current.set(inv.id, inv.status);
            }
            // Surface very recent pending invites (< 2 min old) right away on connect
            const ageMs = now - (timestampToMs(inv.createdAt) || now);
            if (inv.toUid === myUid && inv.status === 'pending' && ageMs < 120_000) {
              pushToast(
                {
                  kind: 'invite',
                  title: `${inv.fromName} invited you to play ${inv.gameTitle}!`,
                  body: 'Tap Accept to jump right into the match — no code needed.',
                  avatarId: inv.fromAvatarId,
                  invite: inv
                },
                16000
              );
            }
          }
          return;
        }

        for (const inv of list) {
          if (inv.toUid === myUid && inv.status === 'pending' && !seenInviteIdsRef.current.has(inv.id)) {
            seenInviteIdsRef.current.add(inv.id);
            pushToast(
              {
                kind: 'invite',
                title: `${inv.fromName} invited you to play ${inv.gameTitle}!`,
                body: 'Tap Accept to join immediately.',
                avatarId: inv.fromAvatarId,
                invite: inv
              },
              16000
            );
          } else if (inv.fromUid === myUid) {
            const prevStatus = outgoingStatusRef.current.get(inv.id);
            outgoingStatusRef.current.set(inv.id, inv.status);
            if (prevStatus === 'pending' && inv.status === 'accepted') {
              const targetSpace = inv.gameKind === 'chess' ? 'chess' : 'rooms';
              pushToast(
                {
                  kind: 'turn',
                  title: `${inv.toName} accepted your ${inv.gameTitle} invite!`,
                  body: 'Your opponent is entering the room now.',
                  targetSpace,
                  roomCode: inv.roomCode
                },
                8000
              );
            }
          }
        }
      },
      () => {}
    );

    return () => {
      unsubDir();
      unsubContacts();
      unsubThreads();
      unsubInvites();
    };
  }, [isFirebaseReady, myUid, pushToast]);

  // Background Chess Turn Watcher (fires when user browses outside Chess tab)
  useEffect(() => {
    if (!trackedChessRoom || !isFirebaseReady || activeSpace === 'chess') {
      chessWatchStateRef.current = null;
      return;
    }

    const unsub = watchChessRoomSummary(
      trackedChessRoom.code,
      trackedChessRoom.mySide,
      summary => {
        const prev = chessWatchStateRef.current;
        chessWatchStateRef.current = {
          code: summary.code,
          turn: summary.turn,
          moveCount: summary.moveCount,
          opponentJoined: summary.opponentJoined
        };
        if (!prev || prev.code !== summary.code) return;

        if (!prev.opponentJoined && summary.opponentJoined) {
          pushToast(
            {
              kind: 'turn',
              title: `${summary.opponentName || 'Opponent'} joined Chess!`,
              body: `Room ${summary.code} is ready.`,
              targetSpace: 'chess',
              roomCode: summary.code
            },
            9000
          );
          return;
        }

        const becameMyTurn =
          summary.status !== 'finished' &&
          summary.turn === trackedChessRoom.mySide &&
          (prev.turn !== trackedChessRoom.mySide || summary.moveCount > prev.moveCount);

        if (becameMyTurn) {
          pushToast(
            {
              kind: 'turn',
              title: "It's your turn in Chess!",
              body: `${summary.opponentName || 'Opponent'} just moved in room ${summary.code}.`,
              targetSpace: 'chess',
              roomCode: summary.code
            },
            9000
          );
        }
      }
    );

    return () => unsub();
  }, [trackedChessRoom, isFirebaseReady, activeSpace, pushToast]);

  // Background Arcade Turn Watcher (fires when user browses outside Rooms tab)
  useEffect(() => {
    if (!trackedArcadeRoom || !isFirebaseReady || activeSpace === 'rooms') {
      arcadeWatchStateRef.current = null;
      return;
    }

    const unsub = watchArcadeRoomSummary(
      trackedArcadeRoom.code,
      trackedArcadeRoom.mySide,
      summary => {
        const prev = arcadeWatchStateRef.current;
        arcadeWatchStateRef.current = {
          code: summary.code,
          turn: summary.turn,
          moveCount: summary.moveCount,
          opponentJoined: summary.opponentJoined
        };
        if (!prev || prev.code !== summary.code) return;

        const gameName = getArcadeGameMeta(summary.gameType).name || trackedArcadeRoom.gameTitle;

        if (!prev.opponentJoined && summary.opponentJoined) {
          pushToast(
            {
              kind: 'turn',
              title: `${summary.opponentName || 'Opponent'} joined ${gameName}!`,
              body: `Match ${summary.code} is live.`,
              targetSpace: 'rooms',
              roomCode: summary.code
            },
            9000
          );
          return;
        }

        const becameMyTurn =
          summary.status !== 'finished' &&
          summary.turn === trackedArcadeRoom.mySide &&
          (prev.turn !== trackedArcadeRoom.mySide || summary.moveCount > prev.moveCount);

        if (becameMyTurn) {
          pushToast(
            {
              kind: 'turn',
              title: `It's your turn in ${gameName}!`,
              body: `${summary.opponentName || 'Opponent'} made a move.`,
              targetSpace: 'rooms',
              roomCode: summary.code
            },
            9000
          );
        }
      }
    );

    return () => unsub();
  }, [trackedArcadeRoom, isFirebaseReady, activeSpace, pushToast]);

  const setChatOpenState = useCallback((open: boolean, activePartnerUid: string | null) => {
    chatOpenRef.current = { isOpen: open, partnerUid: activePartnerUid };
  }, []);

  const setTrackedChessRoom = useCallback((room: TrackedChessRoom | null) => {
    setTrackedChessRoomState(prev => {
      if (prev?.code === room?.code && prev?.mySide === room?.mySide) return prev;
      return room;
    });
  }, []);

  const setTrackedArcadeRoom = useCallback((room: TrackedArcadeRoom | null) => {
    setTrackedArcadeRoomState(prev => {
      if (
        prev?.code === room?.code &&
        prev?.mySide === room?.mySide &&
        prev?.gameType === room?.gameType
      ) {
        return prev;
      }
      return room;
    });
  }, []);

  const openChatWithPeer = useCallback(
    (peer: ChatPeerTarget) => {
      setPendingChatTarget(peer);
      onOpenChat();
    },
    [onOpenChat]
  );

  const openGameRoom = useCallback(
    (space: 'chess' | 'rooms', code?: string) => {
      if (code) {
        if (space === 'chess') setPendingChessJoinCode(code);
        else setPendingArcadeJoinCode(code);
      }
      onNavigateSpace(space);
    },
    [onNavigateSpace]
  );

  const acceptGameInvite = useCallback(
    async (invite: GameInvite) => {
      dismissToast(`toast_${invite.id}`);
      setToasts(prev => prev.filter(t => t.invite?.id !== invite.id));
      setLastAcceptedInvite(invite);
      try {
        await respondToGameInvite(invite.id, 'accepted');
      } catch {}
      if (invite.gameKind === 'chess') {
        setPendingChessJoinCode(invite.roomCode);
        onNavigateSpace('chess');
      } else {
        setPendingArcadeJoinCode(invite.roomCode);
        onNavigateSpace('rooms');
      }
    },
    [dismissToast, onNavigateSpace]
  );

  const declineGameInvite = useCallback(async (invite: GameInvite) => {
    setToasts(prev => prev.filter(t => t.invite?.id !== invite.id));
    try {
      await respondToGameInvite(invite.id, 'declined');
    } catch {}
  }, []);

  const pushTurnToast = useCallback(
    (params: { space: 'chess' | 'rooms'; title: string; body: string; roomCode?: string }) => {
      if (activeSpaceRef.current === params.space && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        return;
      }
      pushToast(
        {
          kind: 'turn',
          title: params.title,
          body: params.body,
          targetSpace: params.space,
          roomCode: params.roomCode
        },
        8000
      );
    },
    [pushToast]
  );

  const incomingInvites = useMemo(
    () => invites.filter(inv => inv.toUid === myUid && inv.status === 'pending'),
    [invites, myUid]
  );

  const outgoingInvites = useMemo(
    () => invites.filter(inv => inv.fromUid === myUid && inv.status === 'pending'),
    [invites, myUid]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      toasts,
      dismissToast,
      contacts,
      directoryProfiles,
      allInvites: invites,
      incomingInvites,
      outgoingInvites,
      lastAcceptedInvite,
      pendingChessJoinCode,
      clearPendingChessJoinCode: () => setPendingChessJoinCode(null),
      pendingArcadeJoinCode,
      clearPendingArcadeJoinCode: () => setPendingArcadeJoinCode(null),
      pendingChatTarget,
      clearPendingChatTarget: () => setPendingChatTarget(null),
      setChatOpenState,
      trackedChessRoom,
      setTrackedChessRoom,
      trackedArcadeRoom,
      setTrackedArcadeRoom,
      openChatWithPeer,
      openGameRoom,
      navigateSpace: onNavigateSpace,
      acceptGameInvite,
      declineGameInvite,
      pushTurnToast
    }),
    [
      toasts,
      dismissToast,
      contacts,
      directoryProfiles,
      invites,
      incomingInvites,
      outgoingInvites,
      lastAcceptedInvite,
      pendingChessJoinCode,
      pendingArcadeJoinCode,
      pendingChatTarget,
      setChatOpenState,
      trackedChessRoom,
      setTrackedChessRoom,
      trackedArcadeRoom,
      setTrackedArcadeRoom,
      openChatWithPeer,
      openGameRoom,
      onNavigateSpace,
      acceptGameInvite,
      declineGameInvite,
      pushTurnToast
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return ctx;
}
