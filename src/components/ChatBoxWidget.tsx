import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageCircle,
  UserPlus,
  Users,
  Send,
  X,
  Check,
  Copy,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Trash2,
  LogIn,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pin,
  PinOff,
  Gamepad2,
  Play,
  Maximize2,
  Minimize2,
  Phone,
  Video
} from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth, ensureAuthPersistence, backupFirebaseAuthSession } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCall } from '../context/CallContext';
import { AVATAR_PRESETS, markRememberedLogin } from '../services/cloudSaveService';
import { ThemeConfig, THEMES } from '../services/themeStore';
import { ARCADE_GAMES, ArcadeGameType } from '../utils/arcadeEngines';
import { createFirestoreChessRoom } from '../services/chessRoomService';
import { createFirestoreArcadeRoom } from '../services/arcadeRoomService';
import { sendGameInvite } from '../services/inviteService';
import {
  ChatMessage,
  ChatProfile,
  ChatThread,
  addFriendContact,
  createChatMessageId,
  deriveFriendCode,
  findChatProfileByCodeOrUid,
  formatChatTimestamp,
  getDiscoverablePreference,
  isProfileOnlineNow,
  openOrCreateDirectThread,
  removeFriendContact,
  sendDirectMessage,
  setDiscoverablePreference,
  subscribeMyChatThreads,
  subscribeThreadMessages,
  syncMyChatProfile,
  getCanonicalThreadMeta
} from '../services/chatService';

interface ChatBoxWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  activeTheme?: ThemeConfig;
  onOnlineCountChange?: (count: number) => void;
  musicDock?: { side: 'right' | 'left'; topClearancePx: number };
  isPinnedOpen?: boolean;
  onTogglePinOpen?: () => void;
}

interface PartnerTarget {
  userId: string;
  displayName: string;
  friendCode: string;
  avatarId: string;
}

function getAvatarPreset(avatarId?: string | null) {
  return AVATAR_PRESETS.find((a) => a.id === avatarId) || AVATAR_PRESETS[0];
}

function formatFriendlyChatError(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const errMsg = typeof parsed?.error === 'string' ? parsed.error : '';
      if (errMsg.toLowerCase().includes('missing or insufficient permissions')) {
        return 'Chat permissions denied — please refresh or sign out and back in.';
      }
      if (errMsg) return errMsg;
    } catch {}
  }
  return trimmed;
}

export const ChatBoxWidget: React.FC<ChatBoxWidgetProps> = ({
  isOpen,
  onToggle,
  onClose,
  activeTheme = THEMES.original,
  onOnlineCountChange,
  musicDock = { side: 'right', topClearancePx: 84 },
  isPinnedOpen = false,
  onTogglePinOpen
}) => {
  const [isBarHidden, setIsBarHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsBarHidden(false);
    } else {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isFullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const activeEl = document.activeElement as HTMLElement | null;
      const tag = (activeEl?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || activeEl?.isContentEditable) {
        return;
      }
      e.stopPropagation();
      e.stopImmediatePropagation();
      setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isOpen, isFullscreen]);
  const { user, profile, isAuthReady, loginGoogle, authError, clearAuthError } = useAuth();
  const isFirebaseConnected = Boolean(user?.uid && auth.currentUser && auth.currentUser.uid === user.uid);

  const myUid = isFirebaseConnected ? user!.uid : '';
  const myDisplayName = profile?.displayName || user?.displayName || (myUid ? `Player_${myUid.slice(0, 5)}` : 'Player');
  const myAvatarId = profile?.avatarId || 'melon_classic';
  const myFriendCode = myUid ? deriveFriendCode(myUid) : '';
  const myAvatar = getAvatarPreset(myAvatarId);

  const {
    contacts,
    directoryProfiles: directory,
    incomingInvites,
    pendingChatTarget,
    clearPendingChatTarget,
    setChatOpenState,
    openGameRoom,
    acceptGameInvite,
    declineGameInvite
  } = useNotifications();
  const { startCall, callPhase } = useCall();

  const [activeTab, setActiveTab] = useState<'chats' | 'people'>('chats');
  const [discoverable, setDiscoverable] = useState<boolean>(() => getDiscoverablePreference());
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activePartner, setActivePartner] = useState<PartnerTarget | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isAddingUid, setIsAddingUid] = useState<string | null>(null);
  const [isSigningInGuest, setIsSigningInGuest] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [showInvitePicker, setShowInvitePicker] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [invitingGameKey, setInvitingGameKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync open/active partner state to NotificationContext so active chats suppress duplicate banners
  useEffect(() => {
    setChatOpenState(isOpen, activePartner?.userId || null);
  }, [isOpen, activePartner?.userId, setChatOpenState]);

  // Subscribe to recent chat threads (directory & contacts are shared via NotificationContext)
  useEffect(() => {
    if (!isFirebaseConnected || !myUid) {
      setThreads([]);
      onOnlineCountChange?.(0);
      return;
    }

    const unsubThreads = subscribeMyChatThreads(
      myUid,
      (list) => {
        setThreads(list);
      },
      (err) => {
        setChatError(err.message);
      }
    );

    return () => {
      unsubThreads();
    };
  }, [isFirebaseConnected, myUid]);

  // Report live online peer count up to parent / header badge
  const otherProfiles = useMemo(() => {
    return directory.filter((p) => p.userId !== myUid);
  }, [directory, myUid]);

  const onlinePeersCount = useMemo(() => {
    return otherProfiles.filter((p) => isProfileOnlineNow(p)).length;
  }, [otherProfiles]);

  useEffect(() => {
    onOnlineCountChange?.(onlinePeersCount);
  }, [onlinePeersCount, onOnlineCountChange]);

  // Subscribe to active thread messages
  const activeThreadId = useMemo(() => {
    if (!myUid || !activePartner?.userId) return '';
    return getCanonicalThreadMeta(myUid, activePartner.userId).threadId;
  }, [myUid, activePartner?.userId]);

  useEffect(() => {
    if (!isFirebaseConnected || !myUid || !activeThreadId) {
      setMessages([]);
      return;
    }

    const unsubMsgs = subscribeThreadMessages(
      activeThreadId,
      myUid,
      (msgs) => {
        setMessages(msgs);
        const confirmedIds = new Set(msgs.map((m) => m.id));
        setOptimisticMessages((prev) => prev.filter((m) => !confirmedIds.has(m.id)));
      },
      (err) => {
        setChatError(err.message);
      }
    );

    return () => unsubMsgs();
  }, [isFirebaseConnected, myUid, activeThreadId]);

  const displayedMessages = useMemo(() => {
    if (!activeThreadId) return messages;
    const confirmedIds = new Set(messages.map((m) => m.id));
    const pending = optimisticMessages.filter(
      (m) => m.threadId === activeThreadId && !confirmedIds.has(m.id)
    );
    return pending.length > 0 ? [...messages, ...pending] : messages;
  }, [messages, optimisticMessages, activeThreadId]);

  // Scroll to bottom when messages arrive
  useEffect(() => {
    if (activePartner && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedMessages.length, activePartner?.userId]);

  const directoryByUid = useMemo(() => {
    const map = new Map<string, ChatProfile>();
    for (const p of directory) {
      map.set(p.userId, p);
    }
    return map;
  }, [directory]);

  const contactUidSet = useMemo(() => {
    return new Set(contacts.map((c) => c.contactUid));
  }, [contacts]);

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = otherProfiles;
    if (!q) return list;
    return list.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.friendCode.toLowerCase().includes(q) ||
        p.userId.toLowerCase().includes(q)
    );
  }, [otherProfiles, searchQuery]);

  const onlineDirectory = useMemo(
    () => filteredDirectory.filter((p) => isProfileOnlineNow(p)),
    [filteredDirectory]
  );

  const recentDirectory = useMemo(
    () => filteredDirectory.filter((p) => !isProfileOnlineNow(p)),
    [filteredDirectory]
  );

  const handleCopyFriendCode = async () => {
    if (!myFriendCode) return;
    try {
      await navigator.clipboard.writeText(myFriendCode);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  const handleToggleDiscoverable = async () => {
    if (!isFirebaseConnected || !myUid) return;
    const next = !discoverable;
    setDiscoverable(next);
    setDiscoverablePreference(next);
    try {
      await syncMyChatProfile({
        uid: myUid,
        displayName: myDisplayName,
        avatarId: myAvatarId,
        isOnline: true,
        discoverable: next
      });
      setChatNotice(next ? 'You are now visible in Add People.' : 'Hidden from public directory.');
      window.setTimeout(() => setChatNotice(null), 2500);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not update visibility.');
    }
  };

  const handleOpenChatWithTarget = async (target: PartnerTarget) => {
    if (!isFirebaseConnected || !myUid) return;
    setChatError(null);
    setShowInvitePicker(false);
    setActivePartner(target);
    setActiveTab('chats');

    try {
      await syncMyChatProfile({
        uid: myUid,
        displayName: myDisplayName,
        avatarId: myAvatarId,
        isOnline: true
      });
      await openOrCreateDirectThread({
        myProfile: {
          userId: myUid,
          displayName: myDisplayName,
          avatarId: myAvatarId
        },
        targetProfile: target
      });
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not open conversation.');
    }
  };

  // Auto-open chat thread when triggered from a notification toast ("___ texted you")
  useEffect(() => {
    if (!pendingChatTarget || !isFirebaseConnected || !myUid) return;
    const target = pendingChatTarget;
    clearPendingChatTarget();
    void handleOpenChatWithTarget(target);
  }, [pendingChatTarget, isFirebaseConnected, myUid]);

  const handleAddFriend = async (target: PartnerTarget, openChatAfter: boolean = false) => {
    if (!isFirebaseConnected || !myUid) return;
    setChatError(null);
    setIsAddingUid(target.userId);
    try {
      await addFriendContact(myUid, target);
      setChatNotice(`Added ${target.displayName} to Friends!`);
      window.setTimeout(() => setChatNotice(null), 2500);
      if (openChatAfter) {
        await handleOpenChatWithTarget(target);
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not add friend.');
    } finally {
      setIsAddingUid(null);
    }
  };

  const handleLookupAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setChatError(null);
    try {
      const found = await findChatProfileByCodeOrUid(searchQuery.trim(), otherProfiles);
      if (!found) {
        setChatError('No logged-in Firebase user matched that Friend Code or User ID.');
        return;
      }
      if (found.userId === myUid) {
        setChatError('That is your own Friend Code!');
        return;
      }
      await handleAddFriend(found, true);
      setSearchQuery('');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Lookup failed.');
    }
  };

  const handleRemoveFriend = async (contactUid: string) => {
    if (!myUid) return;
    setChatError(null);
    try {
      await removeFriendContact(myUid, contactUid);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not remove friend.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePartner || !myUid) return;
    const draft = messageInput.trim();
    if (!draft) return;

    const partner = activePartner;
    const clientMessageId = createChatMessageId();
    const threadId = getCanonicalThreadMeta(myUid, partner.userId).threadId;

    setMessageInput('');
    setChatError(null);

    // 0ms optimistic append so rapid texting never stalls
    setOptimisticMessages((prev) => [
      ...prev,
      {
        id: clientMessageId,
        threadId,
        senderUid: myUid,
        senderName: myDisplayName,
        senderAvatarId: myAvatarId,
        participantUids: [myUid, partner.userId],
        text: draft,
        createdAt: Date.now()
      }
    ]);

    try {
      await sendDirectMessage({
        myProfile: {
          userId: myUid,
          displayName: myDisplayName,
          avatarId: myAvatarId
        },
        targetProfile: partner,
        text: draft,
        clientMessageId
      });
    } catch (err) {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== clientMessageId));
      setMessageInput((curr) => curr || draft);
      setChatError(err instanceof Error ? err.message : 'Failed to send message.');
    }
  };

  const handleInvitePartnerToGame = async (gameOption: {
    gameKind: 'chess' | 'arcade';
    gameType: 'chess' | ArcadeGameType;
    gameTitle: string;
  }) => {
    if (!activePartner || !myUid || invitingGameKey) return;
    setChatError(null);
    setInvitingGameKey(gameOption.gameType);

    try {
      const playerId = myUid;
      let code = '';
      if (gameOption.gameKind === 'chess') {
        const res = await createFirestoreChessRoom({
          playerId,
          playerName: myDisplayName,
          preferredColor: 'w',
          timeControlId: 'none'
        });
        code = res.code;
      } else {
        const res = await createFirestoreArcadeRoom({
          gameType: gameOption.gameType as ArcadeGameType,
          playerId,
          playerName: myDisplayName,
          preferredSeat: 'p1'
        });
        code = res.code;
      }

      await sendGameInvite({
        fromUid: myUid,
        fromName: myDisplayName,
        fromAvatarId: myAvatarId,
        toUid: activePartner.userId,
        toName: activePartner.displayName,
        gameKind: gameOption.gameKind,
        gameType: gameOption.gameType,
        gameTitle: gameOption.gameTitle,
        roomCode: code
      });

      const inviteMsgId = createChatMessageId();
      await sendDirectMessage({
        myProfile: {
          userId: myUid,
          displayName: myDisplayName,
          avatarId: myAvatarId
        },
        targetProfile: activePartner,
        text: `🎮 Invited you to play ${gameOption.gameTitle}! Tap Accept on the invite notification to join.`,
        clientMessageId: inviteMsgId
      }).catch(() => {});

      setShowInvitePicker(false);
      setIsFullscreen(false);
      setChatNotice(`Invited ${activePartner.displayName} to ${gameOption.gameTitle}!`);
      window.setTimeout(() => setChatNotice(null), 2600);
      openGameRoom(gameOption.gameKind === 'chess' ? 'chess' : 'rooms', code);
      if (!isPinnedOpen) {
        onClose();
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Could not send game invite.');
    } finally {
      setInvitingGameKey(null);
    }
  };

  const handleGuestChatSignIn = async () => {
    setChatError(null);
    clearAuthError();
    setIsSigningInGuest(true);
    try {
      await ensureAuthPersistence();
      if (!auth.currentUser) {
        const cred = await signInAnonymously(auth);
        if (cred.user) {
          markRememberedLogin({
            uid: cred.user.uid,
            displayName: profile?.displayName || cred.user.displayName,
            email: null,
            photoURL: null,
            isAnonymous: true
          });
          void backupFirebaseAuthSession();
        }
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed') {
        setChatError('Guest sign-in is disabled on Firebase — click Sign in with Google above to chat!');
      } else {
        setChatError(err?.message || 'Could not start Firebase guest session. Try Google Sign-In.');
      }
    } finally {
      setIsSigningInGuest(false);
    }
  };

  const accentColor = activeTheme?.accent || '#10b981';
  const borderColor = activeTheme?.border || 'rgba(255, 255, 255, 0.12)';
  const bgPrimary = activeTheme?.bgPrimary || '#070f1d';
  const bgCard = activeTheme?.bgCard || '#0d192e';
  const bgHeader = activeTheme?.bgHeader || '#0b1528';

  const activePartnerLiveProfile = activePartner ? directoryByUid.get(activePartner.userId) : undefined;
  const isActivePartnerOnline = activePartnerLiveProfile ? isProfileOnlineNow(activePartnerLiveProfile) : false;

  const sideClass = musicDock.side === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6';
  const bottomOffsetPx = Math.max(16, musicDock.topClearancePx);
  const friendlyError = formatFriendlyChatError(chatError || authError);

  if (!isOpen) {
    if (isBarHidden) {
      return null;
    }
    return (
      <div
        className={`fixed ${sideClass} z-40 transition-all duration-300 flex items-center gap-1.5`}
        style={{ bottom: `${bottomOffsetPx}px` }}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
          style={{
            backgroundColor: bgHeader,
            borderColor: accentColor,
            boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5)`
          }}
          title="Expand Firebase Friends & Chatbox"
        >
          <div className="relative">
            <MessageCircle className="w-4 h-4" style={{ color: accentColor }} />
            {isFirebaseConnected && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#0b1528]" />
            )}
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-xs font-extrabold text-white leading-tight flex items-center gap-1.5">
              <span>Chatbox</span>
              {isPinnedOpen && <Pin className="w-2.5 h-2.5 text-emerald-300" />}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {isFirebaseConnected
                ? `${onlinePeersCount} online · ${contacts.length} friends`
                : !isAuthReady
                ? 'Restoring session...'
                : 'Sign in to chat'}
            </span>
          </div>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
        <button
          type="button"
          onClick={() => setIsBarHidden(true)}
          className="p-1.5 rounded-xl border text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer backdrop-blur-xl"
          style={{ backgroundColor: bgHeader, borderColor }}
          title="Hide floating chatbox bar (reopen from top header)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[70] w-screen h-[100dvh] rounded-none border-0 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn transition-all duration-300'
          : `fixed ${sideClass} z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[480px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn transition-all duration-300`
      }
      style={{
        bottom: isFullscreen ? undefined : `${bottomOffsetPx}px`,
        maxHeight: isFullscreen ? undefined : `calc(100vh - ${bottomOffsetPx + 16}px)`,
        backgroundColor: bgPrimary,
        borderColor: isFullscreen ? undefined : isPinnedOpen ? accentColor : borderColor
      }}
    >
      {/* Top Header */}
      <div
        className={`border-b flex items-center justify-between gap-2 shrink-0 ${
          isFullscreen ? 'px-4 sm:px-6 py-3' : 'px-3.5 py-2.5'
        }`}
        style={{ backgroundColor: bgHeader, borderColor }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center text-base shrink-0"
            style={{
              backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)',
              borderColor: accentColor
            }}
          >
            {myAvatar.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white truncate max-w-[130px]">
                {isFirebaseConnected ? myDisplayName : 'Firebase Chatbox'}
              </span>
              {isFirebaseConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected to Firebase" />
              )}
            </div>
            {isFirebaseConnected ? (
              <button
                type="button"
                onClick={handleCopyFriendCode}
                className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 hover:text-emerald-200 cursor-pointer"
                title="Copy your Friend Code to share with friends"
              >
                <span>Code: {myFriendCode}</span>
                {copiedCode ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Cross-site Firebase Messenger</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isFirebaseConnected && (
            <button
              type="button"
              onClick={handleToggleDiscoverable}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                discoverable
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title={discoverable ? 'Visible in Add People directory (Click to hide)' : 'Hidden from directory (Click to make visible)'}
            >
              {discoverable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{discoverable ? 'Visible' : 'Hidden'}</span>
            </button>
          )}
          {onTogglePinOpen && (
            <button
              type="button"
              onClick={onTogglePinOpen}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                isPinnedOpen
                  ? 'bg-sky-500/20 border-sky-400/40 text-sky-200'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={isPinnedOpen ? 'Keeping chatbox open across tabs & Esc (Click to unkeep)' : 'Keep chatbox open while browsing or gaming'}
            >
              {isPinnedOpen ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
              <span>{isPinnedOpen ? 'Kept' : 'Keep'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
              isFullscreen
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isFullscreen ? 'Exit fullscreen chatbox (Esc)' : 'Expand chatbox to fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen chatbox' : 'Expand chatbox to fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFullscreen && <span className="hidden sm:inline">Exit Full</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimize chatbox"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsFullscreen(false);
              setIsBarHidden(true);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="Hide chatbox (reopen anytime from header)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feedback banners */}
      {friendlyError && (
        <div className="mx-3 mt-2.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-200 text-[11px] flex items-start gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span className="flex-1 break-words">{friendlyError}</span>
          <button
            type="button"
            onClick={() => {
              setChatError(null);
              clearAuthError();
            }}
            className="text-rose-300 hover:text-white cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {chatNotice && (
        <div className="mx-3 mt-2.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[11px] flex items-center gap-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{chatNotice}</span>
        </div>
      )}

      {/* Main Content */}
      {!isFirebaseConnected && !isAuthReady ? (
        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center animate-pulse"
            style={{ backgroundColor: bgCard, borderColor: accentColor }}
          >
            <Users className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <p className="text-xs font-bold text-white">Restoring your session...</p>
          <p className="text-[11px] text-slate-400">Keeping you signed in automatically.</p>
        </div>
      ) : !isFirebaseConnected ? (
        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl border flex items-center justify-center"
            style={{ backgroundColor: bgCard, borderColor: accentColor }}
          >
            <Users className="w-7 h-7" style={{ color: accentColor }} />
          </div>
          <div className="max-w-xs">
            <h3 className="text-sm font-extrabold text-white">Connect Firebase Chat</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Sign in once to see other logged-in players across GitHub Pages and desktop/iPad, add friends, and chat in real time — you&apos;ll stay signed in automatically.
            </p>
          </div>
          <div className="w-full max-w-xs flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setChatError(null);
                void loginGoogle().catch(() => {});
              }}
              className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGuestChatSignIn}
              disabled={isSigningInGuest}
              className="w-full py-2 px-4 rounded-xl font-bold text-xs text-slate-200 border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <span>{isSigningInGuest ? 'Connecting...' : 'Quick Guest Firebase Chat'}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mode Tabs */}
          {!activePartner && (
            <div className={`shrink-0 ${isFullscreen ? 'px-4 sm:px-6 pt-3 pb-1 max-w-4xl w-full mx-auto' : 'px-3 pt-2.5 pb-1'}`}>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('chats')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'chats'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chats & Friends ({contacts.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('people')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'people'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add People ({onlinePeersCount} online)</span>
                </button>
              </div>
            </div>
          )}

          {/* Active 1-on-1 Chat View */}
          {activePartner ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Partner Bar */}
              <div
                className={`border-b shrink-0 ${isFullscreen ? 'px-4 sm:px-6 py-2.5' : 'px-3 py-2'}`}
                style={{ backgroundColor: bgCard, borderColor }}
              >
                <div className={`flex items-center justify-between gap-2 w-full ${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvitePicker(false);
                      setActivePartner(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    title="Back to chats"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="relative text-base shrink-0">
                    <span>{getAvatarPreset(activePartnerLiveProfile?.avatarId || activePartner.avatarId).icon}</span>
                    {isActivePartnerOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d192e]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {activePartnerLiveProfile?.displayName || activePartner.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                      <span>{isActivePartnerOnline ? 'Online now' : 'Firebase User'}</span>
                      <span>·</span>
                      <span className="font-mono">{activePartner.friendCode}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={callPhase !== 'idle'}
                    onClick={() =>
                      void startCall({
                        peerUid: activePartner.userId,
                        peerName: activePartnerLiveProfile?.displayName || activePartner.displayName,
                        peerAvatarId: activePartnerLiveProfile?.avatarId || activePartner.avatarId,
                        mode: 'audio',
                        contextLabel: 'Direct Voice Call'
                      })
                    }
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 cursor-pointer disabled:opacity-40"
                    title={`Voice call ${activePartner.displayName}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={callPhase !== 'idle'}
                    onClick={() =>
                      void startCall({
                        peerUid: activePartner.userId,
                        peerName: activePartnerLiveProfile?.displayName || activePartner.displayName,
                        peerAvatarId: activePartnerLiveProfile?.avatarId || activePartner.avatarId,
                        mode: 'video',
                        contextLabel: 'Direct Video Call'
                      })
                    }
                    className="p-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/35 text-violet-300 cursor-pointer disabled:opacity-40"
                    title={`Video call ${activePartner.displayName}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvitePicker((v) => !v)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      showInvitePicker
                        ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                        : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/35 text-sky-300'
                    }`}
                    title={`Invite ${activePartner.displayName} to play a 2-player game`}
                  >
                    <Gamepad2 className="w-3 h-3" />
                    <span>Play</span>
                  </button>
                  {!contactUidSet.has(activePartner.userId) && (
                    <button
                      type="button"
                      onClick={() => handleAddFriend(activePartner, false)}
                      disabled={isAddingUid === activePartner.userId}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  )}
                </div>
                </div>
              </div>

              {/* 1-Click Direct Game Challenge Picker */}
              {showInvitePicker && (
                <div
                  className="px-3 py-2.5 border-b flex flex-col gap-2 shrink-0"
                  style={{ backgroundColor: bgHeader, borderColor }}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    <span>Invite {activePartner.displayName} ({ARCADE_GAMES.length + 1} Games)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInvitePicker(false);
                        setInviteSearch('');
                      }}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={inviteSearch}
                      onChange={(e) => setInviteSearch(e.target.value)}
                      placeholder={`Filter ${ARCADE_GAMES.length} minigames & chess...`}
                      className="w-full pl-7 pr-2.5 py-1 rounded-lg border border-white/10 bg-black/40 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className={`grid gap-1.5 overflow-y-auto pr-0.5 ${isFullscreen ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-h-64' : 'grid-cols-2 max-h-48'}`}>
                    {(!inviteSearch.trim() || 'chess'.includes(inviteSearch.trim().toLowerCase())) && (
                      <button
                        type="button"
                        disabled={Boolean(invitingGameKey)}
                        onClick={() =>
                          void handleInvitePartnerToGame({
                            gameKind: 'chess',
                            gameType: 'chess',
                            gameTitle: 'Chess'
                          })
                        }
                        className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 truncate cursor-pointer disabled:opacity-50"
                      >
                        <span>♟️</span>
                        <span className="truncate">{invitingGameKey === 'chess' ? 'Starting...' : 'Chess'}</span>
                      </button>
                    )}
                    {ARCADE_GAMES.filter((g) => {
                      const q = inviteSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        g.name.toLowerCase().includes(q) ||
                        (g.category || '').toLowerCase().includes(q)
                      );
                    }).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        disabled={Boolean(invitingGameKey)}
                        onClick={() =>
                          void handleInvitePartnerToGame({
                            gameKind: 'arcade',
                            gameType: g.id,
                            gameTitle: g.name
                          })
                        }
                        className="px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 truncate cursor-pointer disabled:opacity-50"
                      >
                        <span>{g.emoji}</span>
                        <span className="truncate">
                          {invitingGameKey === g.id ? 'Starting...' : g.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages Feed */}
              <div className={`flex-1 overflow-y-auto flex flex-col gap-2.5 ${isFullscreen ? 'p-4 sm:p-6 max-w-4xl w-full mx-auto' : 'p-3'}`}>
                {displayedMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-400 px-6">
                    <MessageCircle className="w-8 h-8 text-slate-600 mb-2" />
                    <p>Say hi to {activePartner.displayName}! Messages sync live across Firebase.</p>
                  </div>
                ) : (
                  displayedMessages.map((msg) => {
                    const isMine = msg.senderUid === myUid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFullscreen ? 'max-w-[70%]' : 'max-w-[82%]'} ${isMine ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`px-3 py-2 rounded-2xl leading-relaxed break-words select-text ${
                            isFullscreen ? 'text-sm px-4 py-2.5' : 'text-xs'
                          } ${
                            isMine
                              ? 'text-black font-medium rounded-br-sm'
                              : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-sm'
                          }`}
                          style={isMine ? { backgroundColor: accentColor } : undefined}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                          {isMine ? 'You' : msg.senderName} · {formatChatTimestamp(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSendMessage}
                className={`border-t flex items-center gap-2 shrink-0 ${isFullscreen ? 'px-4 sm:px-6 py-3' : 'p-2.5'}`}
                style={{ backgroundColor: bgHeader, borderColor }}
              >
                <div className={`flex items-center gap-2 w-full ${isFullscreen ? 'max-w-4xl mx-auto' : ''}`}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  maxLength={1000}
                  placeholder={`Message ${activePartner.displayName}...`}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 rounded-xl text-black font-bold flex items-center justify-center cursor-pointer disabled:opacity-40 transition-all"
                  style={{ backgroundColor: accentColor }}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'chats' ? (
            /* Friends & Recent Threads View */
            <div className={`flex-1 overflow-y-auto flex flex-col gap-4 ${isFullscreen ? 'p-4 sm:p-6 max-w-4xl w-full mx-auto' : 'p-3'}`}>
              {/* Pending Game Invites */}
              {incomingInvites.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-1 flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Game Invites ({incomingInvites.length})</span>
                  </span>
                  {incomingInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-2.5 rounded-xl border border-sky-400/40 bg-sky-500/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{getAvatarPreset(inv.fromAvatarId).icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {inv.fromName} → {inv.gameTitle}
                          </div>
                          <div className="text-[10px] text-sky-200/80 truncate">
                            Direct invite · No code needed
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFullscreen(false);
                            void acceptGameInvite(inv);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-400 hover:bg-sky-300 text-black font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void declineGameInvite(inv)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                          title="Decline invite"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Friends
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('people')}
                    className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Find People</span>
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <div
                    className="p-4 rounded-xl border border-dashed text-center flex flex-col items-center gap-2"
                    style={{ backgroundColor: bgCard, borderColor }}
                  >
                    <p className="text-xs text-slate-400">No friends added yet.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('people')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-black cursor-pointer"
                      style={{ backgroundColor: accentColor }}
                    >
                      Add Logged-In Firebase Players
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {contacts.map((c) => {
                      const live = directoryByUid.get(c.contactUid);
                      const online = live ? isProfileOnlineNow(live) : false;
                      const display = live?.displayName || c.nickname || c.displayName;
                      const avatarId = live?.avatarId || c.avatarId;
                      return (
                        <div
                          key={c.contactUid}
                          className="p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors hover:border-white/25"
                          style={{ backgroundColor: bgCard, borderColor }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenChatWithTarget({
                                userId: c.contactUid,
                                displayName: display,
                                friendCode: c.friendCode,
                                avatarId
                              })
                            }
                            className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <div className="relative text-lg shrink-0">
                              <span>{getAvatarPreset(avatarId).icon}</span>
                              {online && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d192e]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate">{display}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span className={online ? 'text-emerald-400 font-semibold' : ''}>
                                  {online ? 'Online' : 'Offline'}
                                </span>
                                <span>·</span>
                                <span className="font-mono">{c.friendCode}</span>
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenChatWithTarget({
                                  userId: c.contactUid,
                                  displayName: display,
                                  friendCode: c.friendCode,
                                  avatarId
                                })
                              }
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black cursor-pointer"
                              style={{ backgroundColor: accentColor }}
                            >
                              Chat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFriend(c.contactUid)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                              title="Remove friend"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Conversations */}
              {threads.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Recent Messages
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {threads.map((t) => {
                      const isMeA = t.userAUid === myUid;
                      const partnerUid = isMeA ? t.userBUid : t.userAUid;
                      const live = directoryByUid.get(partnerUid);
                      const partnerName = live?.displayName || (isMeA ? t.userBName : t.userAName);
                      const partnerAvatar = live?.avatarId || (isMeA ? t.userBAvatarId : t.userAAvatarId);
                      const online = live ? isProfileOnlineNow(live) : false;
                      return (
                        <button
                          key={t.threadId}
                          type="button"
                          onClick={() =>
                            handleOpenChatWithTarget({
                              userId: partnerUid,
                              displayName: partnerName,
                              friendCode: live?.friendCode || deriveFriendCode(partnerUid),
                              avatarId: partnerAvatar
                            })
                          }
                          className="p-2.5 rounded-xl border flex items-center justify-between gap-2.5 text-left transition-colors hover:border-white/25 cursor-pointer"
                          style={{ backgroundColor: bgCard, borderColor }}
                        >
                          <div className="relative text-lg shrink-0">
                            <span>{getAvatarPreset(partnerAvatar).icon}</span>
                            {online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d192e]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white truncate">{partnerName}</span>
                              <span className="text-[10px] text-slate-500 shrink-0">
                                {formatChatTimestamp(t.updatedAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {t.lastMessageText
                                ? `${t.lastMessageSenderUid === myUid ? 'You: ' : ''}${t.lastMessageText}`
                                : 'Tap to send first message'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Add People (Live Firebase Directory + Friend Code Lookup) */
            <div className={`flex-1 overflow-y-auto flex flex-col gap-3 ${isFullscreen ? 'p-4 sm:p-6 max-w-4xl w-full mx-auto' : 'p-3'}`}>
              <form onSubmit={handleLookupAndAdd} className="flex items-center gap-1.5 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or Friend Code (WM-...)..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs cursor-pointer shrink-0"
                >
                  Add Code
                </button>
              </form>

              {filteredDirectory.length === 0 ? (
                <div
                  className="p-6 rounded-xl border border-dashed text-center flex flex-col items-center gap-2"
                  style={{ backgroundColor: bgCard, borderColor }}
                >
                  <Users className="w-7 h-7 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-300">No other players found yet</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Share your Friend Code (<span className="font-mono text-emerald-300">{myFriendCode}</span>) or have a friend sign in to Firebase on GitHub Pages or web.
                  </p>
                </div>
              ) : (
                <>
                  {onlineDirectory.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Logged In Now ({onlineDirectory.length})</span>
                      </span>
                      {onlineDirectory.map((person) => {
                        const isFriend = contactUidSet.has(person.userId);
                        return (
                          <div
                            key={person.userId}
                            className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                            style={{ backgroundColor: bgCard, borderColor }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative text-lg shrink-0">
                                <span>{getAvatarPreset(person.avatarId).icon}</span>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0d192e]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{person.displayName}</div>
                                <div className="text-[10px] font-mono text-slate-400">{person.friendCode}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isFriend ? (
                                <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                  Friend
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddFriend(person, false)}
                                  disabled={isAddingUid === person.userId}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenChatWithTarget(person)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black cursor-pointer"
                                style={{ backgroundColor: accentColor }}
                              >
                                Chat
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {recentDirectory.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                        Recently Active Firebase Players ({recentDirectory.length})
                      </span>
                      {recentDirectory.map((person) => {
                        const isFriend = contactUidSet.has(person.userId);
                        return (
                          <div
                            key={person.userId}
                            className="p-2.5 rounded-xl border flex items-center justify-between gap-2 opacity-90"
                            style={{ backgroundColor: bgCard, borderColor }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-lg shrink-0">{getAvatarPreset(person.avatarId).icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">{person.displayName}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                  <span className="font-mono">{person.friendCode}</span>
                                  <span>·</span>
                                  <span>{formatChatTimestamp(person.lastSeenAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isFriend ? (
                                <span className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                  Friend
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddFriend(person, false)}
                                  disabled={isAddingUid === person.userId}
                                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenChatWithTarget(person)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black cursor-pointer"
                                style={{ backgroundColor: accentColor }}
                              >
                                Chat
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
