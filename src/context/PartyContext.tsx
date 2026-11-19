import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { auth, formatFriendlyFirestoreError } from '../services/firebase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { timestampToMs } from '../services/chatService';
import {
  createParty,
  joinPartyByCode,
  kickPartyMember,
  launchPartyRoom,
  leaveParty,
  PartyDoc,
  PartyGameKind,
  PartyInvite,
  PartyOpponentMode,
  PartyTeam,
  respondToPartyInvite,
  returnPartyToLobby,
  subscribeMyParty,
  subscribeMyPartyInvites,
  switchPartyMemberTeam,
  updatePartySettings
} from '../services/partyService';
import type { TeamMode } from '../utils/teamModes';

const PARTY_PLAYER_ID_KEY = 'owen_arcade_pid_v1';

function getLocalPartyPlayerId(): string {
  try {
    const existing = sessionStorage.getItem(PARTY_PLAYER_ID_KEY) || localStorage.getItem(PARTY_PLAYER_ID_KEY);
    if (existing) return existing;
    const next = `p_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(PARTY_PLAYER_ID_KEY, next);
    localStorage.setItem(PARTY_PLAYER_ID_KEY, next);
    return next;
  } catch {
    return `p_${Math.random().toString(36).slice(2, 10)}`;
  }
}

interface PartyContextValue {
  myParty: PartyDoc | null;
  partyInvites: PartyInvite[];
  incomingPartyInvites: PartyInvite[];
  isPartyModalOpen: boolean;
  setPartyModalOpen: (open: boolean) => void;
  openPartyModal: (preset?: {
    gameKind?: PartyGameKind;
    gameType?: string;
    gameTitle?: string;
    matchMode?: TeamMode;
    opponentMode?: PartyOpponentMode;
  }) => void;
  partyStatusNote: string | null;
  clearPartyStatusNote: () => void;
  isBusy: boolean;
  hostNewParty: (opts?: {
    matchMode?: TeamMode;
    opponentMode?: PartyOpponentMode;
    gameKind?: PartyGameKind;
    gameType?: string;
    gameTitle?: string;
    botId?: string;
  }) => Promise<PartyDoc | null>;
  joinPartyWithCode: (code: string) => Promise<void>;
  leaveCurrentParty: () => Promise<void>;
  kickMember: (uid: string) => Promise<void>;
  switchMyTeam: (team: PartyTeam) => Promise<void>;
  updateSettings: (
    patch: Partial<Pick<PartyDoc, 'matchMode' | 'opponentMode' | 'gameKind' | 'gameType' | 'gameTitle' | 'botId'>>
  ) => Promise<void>;
  inviteFriendsToParty: (targets: Array<{ uid: string; name: string }>) => Promise<number>;
  acceptPartyInvite: (invite: PartyInvite) => Promise<void>;
  declinePartyInvite: (invite: PartyInvite) => Promise<void>;
  launchPartyMatch: () => Promise<void>;
  backToPartyLobby: () => Promise<void>;
}

const PartyContext = createContext<PartyContextValue | undefined>(undefined);

export const PartyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { openGameRoom, pushCustomToast } = useNotifications();

  const isFirebaseReady = Boolean(user?.uid && auth.currentUser?.uid === user.uid);
  const myUid = isFirebaseReady ? user!.uid : '';
  const myName = useMemo(
    () =>
      (profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Player')
        .trim()
        .slice(0, 24) || 'Player',
    [profile?.displayName, user?.displayName, user?.email]
  );
  const myAvatarId = profile?.avatarId || 'melon_classic';
  const [playerId] = useState<string>(() => getLocalPartyPlayerId());

  const [myParty, setMyParty] = useState<PartyDoc | null>(null);
  const [partyInvites, setPartyInvites] = useState<PartyInvite[]>([]);
  const [isPartyModalOpen, setPartyModalOpen] = useState(false);
  const [partyStatusNote, setPartyStatusNote] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handledLaunchIdRef = useRef<string | null>(null);
  const seenPartyInvIdsRef = useRef<Set<string>>(new Set());
  const partyInvInitializedRef = useRef(false);

  const clearPartyStatusNote = useCallback(() => setPartyStatusNote(null), []);

  // Subscribe to current active party
  useEffect(() => {
    if (!isFirebaseReady || !myUid) {
      setMyParty(null);
      handledLaunchIdRef.current = null;
      return;
    }

    const unsub = subscribeMyParty(myUid, (party) => {
      setMyParty(party);
    });
    return () => unsub();
  }, [isFirebaseReady, myUid]);

  // Auto-navigate all party members into a newly launched match room
  useEffect(() => {
    if (!myParty || !myUid) return;
    if (
      myParty.status !== 'in_game' ||
      !myParty.activeRoomCode ||
      !myParty.activeLaunchId ||
      !myParty.activeGameKind
    ) {
      return;
    }

    const launchKey = `${myParty.code}:${myParty.activeLaunchId}`;
    if (handledLaunchIdRef.current === launchKey) return;
    try {
      if (sessionStorage.getItem(`owen_party_launch_${myParty.code}`) === myParty.activeLaunchId) {
        handledLaunchIdRef.current = launchKey;
        return;
      }
      sessionStorage.setItem(`owen_party_launch_${myParty.code}`, myParty.activeLaunchId);
    } catch {}

    handledLaunchIdRef.current = launchKey;
    const myMember = myParty.members.find(m => m.uid === myUid);
    const space = myParty.activeGameKind === 'chess' ? 'chess' : 'rooms';
    const preferredTeam =
      space === 'chess'
        ? myMember?.team === 'B'
          ? 'b'
          : 'w'
        : myMember?.team === 'B'
        ? 'p2'
        : 'p1';

    setPartyModalOpen(false);
    openGameRoom(space, myParty.activeRoomCode, preferredTeam);
  }, [myParty, myUid, openGameRoom]);

  const acceptPartyInvite = useCallback(
    async (invite: PartyInvite) => {
      if (!myUid) return;
      setIsBusy(true);
      setPartyStatusNote(null);
      try {
        if (myParty && myParty.code !== invite.partyCode) {
          await leaveParty(myParty.code);
        }
        await respondToPartyInvite({
          invite,
          status: 'accepted',
          playerId,
          displayName: myName,
          avatarId: myAvatarId
        });
        setPartyModalOpen(true);
      } catch (err) {
        setPartyStatusNote(formatFriendlyFirestoreError(err, 'Party lobby could not be joined.'));
      } finally {
        setIsBusy(false);
      }
    },
    [myUid, myParty, playerId, myName, myAvatarId]
  );

  const declinePartyInvite = useCallback(
    async (invite: PartyInvite) => {
      if (!myUid) return;
      try {
        await respondToPartyInvite({
          invite,
          status: 'declined',
          playerId,
          displayName: myName,
          avatarId: myAvatarId
        });
      } catch {
        // Ignore
      }
    },
    [myUid, playerId, myName, myAvatarId]
  );

  // Subscribe to Party Invites & push interactive toast when a friend invites us
  useEffect(() => {
    if (!isFirebaseReady || !myUid) {
      setPartyInvites([]);
      seenPartyInvIdsRef.current.clear();
      partyInvInitializedRef.current = false;
      return;
    }

    const unsub = subscribeMyPartyInvites(myUid, (list) => {
      setPartyInvites(list);

      const triggerInviteToast = (inv: PartyInvite) => {
        pushCustomToast(
          {
            kind: 'party_invite',
            title: `${inv.fromName} invited you to a ${inv.matchMode.toUpperCase()} Party!`,
            body: `${inv.gameTitle} (${inv.opponentMode === 'bots' ? 'vs AI Bots' : 'vs Players'}) — tap Accept to join.`,
            avatarId: inv.fromAvatarId,
            roomCode: inv.partyCode,
            acceptLabel: 'Join Party',
            onAcceptCustom: () => {
              void acceptPartyInvite(inv);
            },
            onDeclineCustom: () => {
              void declinePartyInvite(inv);
            }
          },
          18000
        );
      };

      if (!partyInvInitializedRef.current) {
        partyInvInitializedRef.current = true;
        const now = Date.now();
        for (const inv of list) {
          seenPartyInvIdsRef.current.add(inv.id);
          const age = now - (timestampToMs(inv.createdAt) || now);
          if (inv.toUid === myUid && inv.status === 'pending' && age < 120_000) {
            triggerInviteToast(inv);
          }
        }
        return;
      }

      for (const inv of list) {
        if (
          inv.toUid === myUid &&
          inv.status === 'pending' &&
          !seenPartyInvIdsRef.current.has(inv.id)
        ) {
          seenPartyInvIdsRef.current.add(inv.id);
          triggerInviteToast(inv);
        }
      }
    });

    return () => unsub();
  }, [isFirebaseReady, myUid, pushCustomToast, acceptPartyInvite, declinePartyInvite]);

  const incomingPartyInvites = useMemo(
    () => partyInvites.filter(inv => inv.toUid === myUid && inv.status === 'pending'),
    [partyInvites, myUid]
  );

  const hostNewParty = useCallback(
    async (opts?: {
      matchMode?: TeamMode;
      opponentMode?: PartyOpponentMode;
      gameKind?: PartyGameKind;
      gameType?: string;
      gameTitle?: string;
      botId?: string;
    }) => {
      if (!myUid) {
        setPartyStatusNote('Sign in with Google first to create a Party.');
        return null;
      }
      setIsBusy(true);
      setPartyStatusNote(null);
      try {
        if (myParty) {
          await leaveParty(myParty.code);
        }
        const created = await createParty({
          playerId,
          displayName: myName,
          avatarId: myAvatarId,
          ...opts
        });
        setMyParty(created);
        return created;
      } catch (err) {
        setPartyStatusNote(formatFriendlyFirestoreError(err, 'Could not start a party right now.'));
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [myUid, myParty, playerId, myName, myAvatarId]
  );

  const openPartyModal = useCallback(
    (preset?: {
      gameKind?: PartyGameKind;
      gameType?: string;
      gameTitle?: string;
      matchMode?: TeamMode;
      opponentMode?: PartyOpponentMode;
    }) => {
      setPartyStatusNote(null);
      setPartyModalOpen(true);
      if (preset && myParty && myParty.leaderUid === myUid) {
        void updatePartySettings(myParty.code, preset);
      }
    },
    [myParty, myUid]
  );

  const joinPartyWithCode = useCallback(
    async (code: string) => {
      if (!myUid) {
        setPartyStatusNote('Sign in with Google first to join a Party.');
        return;
      }
      setIsBusy(true);
      setPartyStatusNote(null);
      try {
        if (myParty && myParty.code !== code.toUpperCase()) {
          await leaveParty(myParty.code);
        }
        const joined = await joinPartyByCode({
          code,
          playerId,
          displayName: myName,
          avatarId: myAvatarId
        });
        setMyParty(joined);
      } catch (err) {
        setPartyStatusNote(formatFriendlyFirestoreError(err, 'Could not find that party code.'));
      } finally {
        setIsBusy(false);
      }
    },
    [myUid, myParty, playerId, myName, myAvatarId]
  );

  const leaveCurrentParty = useCallback(async () => {
    if (!myParty) return;
    setIsBusy(true);
    setPartyStatusNote(null);
    try {
      await leaveParty(myParty.code);
      setMyParty(null);
    } finally {
      setIsBusy(false);
    }
  }, [myParty]);

  const kickMember = useCallback(
    async (targetUid: string) => {
      if (!myParty) return;
      await kickPartyMember(myParty.code, targetUid);
    },
    [myParty]
  );

  const switchMyTeam = useCallback(
    async (team: PartyTeam) => {
      if (!myParty) return;
      await switchPartyMemberTeam(myParty.code, team);
    },
    [myParty]
  );

  const updateSettings = useCallback(
    async (
      patch: Partial<Pick<PartyDoc, 'matchMode' | 'opponentMode' | 'gameKind' | 'gameType' | 'gameTitle' | 'botId'>>
    ) => {
      if (!myParty) return;
      await updatePartySettings(myParty.code, patch);
    },
    [myParty]
  );

  const inviteFriendsToParty = useCallback(
    async (targets: Array<{ uid: string; name: string }>) => {
      if (!myParty) return 0;
      const { inviteMultipleToParty } = await import('../services/partyService');
      const sent = await inviteMultipleToParty({
        party: myParty,
        fromName: myName,
        fromAvatarId: myAvatarId,
        targets
      });
      if (sent > 0) {
        setPartyStatusNote(`Sent ${sent} party ${sent === 1 ? 'invite' : 'invites'}!`);
      }
      return sent;
    },
    [myParty, myName, myAvatarId]
  );

  const launchPartyMatch = useCallback(async () => {
    if (!myParty) return;
    setIsBusy(true);
    setPartyStatusNote(null);
    try {
      const launched = await launchPartyRoom({
        party: myParty,
        playerId,
        displayName: myName
      });
      const launchKey = `${myParty.code}:${launched.launchId}`;
      handledLaunchIdRef.current = launchKey;
      try {
        sessionStorage.setItem(`owen_party_launch_${myParty.code}`, launched.launchId);
      } catch {}

      const myMember = myParty.members.find(m => m.uid === myUid);
      const space = launched.gameKind === 'chess' ? 'chess' : 'rooms';
      const preferredTeam =
        space === 'chess'
          ? myMember?.team === 'B'
            ? 'b'
            : 'w'
          : myMember?.team === 'B'
          ? 'p2'
          : 'p1';

      setPartyModalOpen(false);
      openGameRoom(space, launched.roomCode, preferredTeam);
    } catch (err) {
      setPartyStatusNote(formatFriendlyFirestoreError(err, 'Could not launch match — please try again.'));
    } finally {
      setIsBusy(false);
    }
  }, [myParty, playerId, myName, myUid, openGameRoom]);

  const backToPartyLobby = useCallback(async () => {
    if (!myParty) return;
    await returnPartyToLobby(myParty.code);
  }, [myParty]);

  const value = useMemo<PartyContextValue>(
    () => ({
      myParty,
      partyInvites,
      incomingPartyInvites,
      isPartyModalOpen,
      setPartyModalOpen,
      openPartyModal,
      partyStatusNote,
      clearPartyStatusNote,
      isBusy,
      hostNewParty,
      joinPartyWithCode,
      leaveCurrentParty,
      kickMember,
      switchMyTeam,
      updateSettings,
      inviteFriendsToParty,
      acceptPartyInvite,
      declinePartyInvite,
      launchPartyMatch,
      backToPartyLobby
    }),
    [
      myParty,
      partyInvites,
      incomingPartyInvites,
      isPartyModalOpen,
      openPartyModal,
      partyStatusNote,
      clearPartyStatusNote,
      isBusy,
      hostNewParty,
      joinPartyWithCode,
      leaveCurrentParty,
      kickMember,
      switchMyTeam,
      updateSettings,
      inviteFriendsToParty,
      acceptPartyInvite,
      declinePartyInvite,
      launchPartyMatch,
      backToPartyLobby
    ]
  );

  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>;
};

export function useParty(): PartyContextValue {
  const ctx = useContext(PartyContext);
  if (!ctx) {
    throw new Error('useParty must be used inside PartyProvider');
  }
  return ctx;
}
