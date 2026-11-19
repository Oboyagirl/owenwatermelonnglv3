import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Bot,
  Check,
  Copy,
  Crown,
  Flag,
  Globe,
  Link2,
  LogOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Gamepad2,
  Play,
  Send,
  X,
  Eraser,
  Eye,
  EyeOff,
  Undo2,
  Trash2,
  RotateCw,
  Dices,
  Anchor,
  ArrowLeft,
  Search,
  Phone,
  Video
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useCall } from '../context/CallContext';
import { auth } from '../services/firebase';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { isProfileOnlineNow } from '../services/chatService';
import { sendGameInvite } from '../services/inviteService';
import {
  SettledEloResult,
  buildMatchId,
  settleOnlinePvpMatchElo
} from '../services/leaderboardService';
import { ExtendedArcadeBoard } from './ExtendedArcadeBoards';
import { Batch2ArcadeBoard } from './Batch2ArcadeBoards';
import {
  ARCADE_BOTS,
  ARCADE_GAMES,
  ArcadeBot,
  ArcadeBotDifficulty,
  ArcadeGameCategory,
  ArcadeGameMeta,
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState,
  BATTLESHIP_SIZES,
  BattleshipShipSpec,
  BattleshipState,
  Batch2ArcadeState,
  CheckersState,
  Connect4State,
  DRAW_BRUSH_SIZES,
  DRAW_COLORS,
  DiceDuelState,
  DotsAndBoxesState,
  DrawGuessState,
  DrawStroke,
  ExtendedArcadeState,
  GomokuState,
  MEMORY_SYMBOLS,
  MancalaState,
  MemoryMatchState,
  ReversiState,
  TicTacToeState,
  UltimateTTTState,
  applyArcadeAction,
  createInitialArcadeState,
  generateRandomBattleshipFleet,
  getArcadeBotById,
  getArcadeGameMeta,
  getCheckersLegalMoves,
  getReversiFlips,
  getShipCells,
  isBatch2ArcadeGameType,
  isExtendedArcadeGameType,
  pickArcadeBotVoiceline,
  pickBotArcadeAction,
  serializeBattleshipFleetAction,
  serializeDrawStrokeAction,
  validateBattleshipFleet
} from '../utils/arcadeEngines';
import {
  ArcadeAuthRequiredError,
  ArcadeRoomViewPayload,
  clearArcadeRoomCache,
  createFirestoreArcadeRoom,
  joinFirestoreArcadeRoom,
  leaveFirestoreArcadeRoom,
  resignFirestoreArcadeRoom,
  sanitizeArcadeRoomCode,
  sendFirestoreArcadeMove,
  signInGoogleForArcade,
  subscribeFirestoreArcadeRoom,
  voteFirestoreArcadeRematch
} from '../services/arcadeRoomService';

interface MultiplayerArcadeViewProps {
  activeTheme: ThemeConfig;
}

type PlayMode = 'online' | 'ai' | 'pvp';
type SeatPref = 'p1' | 'p2' | 'random';
type ConnStatus = 'disconnected' | 'connecting' | 'connected';

interface OnlinePlayersInfo {
  p1: { uid?: string; name: string; connected: boolean } | null;
  p2: { uid?: string; name: string; connected: boolean } | null;
}

const SELECTED_GAME_KEY = 'owen_arcade_selected_game_v1';
const SELECTED_BOT_KEY = 'owen_arcade_bot_id_v1';

const DIFFICULTY_LABELS: Record<ArcadeBotDifficulty, string> = {
  easy: 'Beginner',
  medium: 'Club',
  hard: 'Master',
  expert: 'GM'
};

function getLocalArcadeWsUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws/arcade`;
  }
  return null;
}

function getOrCreateArcadePlayerId(): string {
  try {
    const existing =
      localStorage.getItem('owen_chess_player_id') ||
      localStorage.getItem('owen_arcade_player_id');
    if (existing) return existing;
    const created = `ar_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    localStorage.setItem('owen_arcade_player_id', created);
    return created;
  } catch {
    return `ar_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export const MultiplayerArcadeView: React.FC<MultiplayerArcadeViewProps> = ({ activeTheme }) => {
  const { user, profile } = useAuth();
  const {
    pendingArcadeJoinCode,
    clearPendingArcadeJoinCode,
    trackedArcadeRoom,
    setTrackedArcadeRoom,
    pushTurnToast,
    contacts,
    directoryProfiles,
    allInvites,
    incomingInvites,
    lastAcceptedInvite,
    acceptGameInvite,
    declineGameInvite
  } = useNotifications();

  const studioRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const firestoreUnsubRef = useRef<(() => void) | null>(null);
  const activeTransportRef = useRef<'ws' | 'firestore'>('firestore');
  const pendingAuthActionRef = useRef<{ kind: 'create' } | { kind: 'join'; code: string } | null>(null);

  const pendingMoveRef = useRef<{
    code: string;
    expectedMoveIndex: number;
    rollbackState: ArcadeState;
    rollbackMoves: string[];
  } | null>(null);

  const lastRoomRef = useRef<string | null>(null);
  const lastMoveLenRef = useRef<number>(0);

  const [playerId] = useState<string>(() => getOrCreateArcadePlayerId());

  const [selectedGame, setSelectedGame] = useState<ArcadeGameType>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_GAME_KEY) as ArcadeGameType | null;
      if (saved && ARCADE_GAMES.some(g => g.id === saved)) return saved;
    } catch {}
    return 'connect4';
  });

  const [selectedBotId, setSelectedBotId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_BOT_KEY);
      if (saved && ARCADE_BOTS.some(b => b.id === saved)) return saved;
    } catch {}
    return 'orbit-bot';
  });
  const [botTierFilter, setBotTierFilter] = useState<'all' | ArcadeBotDifficulty>('all');

  const selectedBot: ArcadeBot = useMemo(() => getArcadeBotById(selectedBotId), [selectedBotId]);
  const filteredBots = useMemo(
    () =>
      botTierFilter === 'all'
        ? ARCADE_BOTS
        : ARCADE_BOTS.filter(b => b.difficulty === botTierFilter),
    [botTierFilter]
  );

  const [botQuote, setBotQuote] = useState<string>(() =>
    pickArcadeBotVoiceline(getArcadeBotById(selectedBotId), 'start')
  );

  const [mode, setMode] = useState<PlayMode>('online');
  const [humanSeat, setHumanSeat] = useState<ArcadePlayer>('p1');
  const [seatPref, setSeatPref] = useState<SeatPref>('p1');
  const [gameState, setGameState] = useState<ArcadeState>(() => createInitialArcadeState(selectedGame));
  const [moves, setMoves] = useState<string[]>([]);
  const [resignedWinner, setResignedWinner] = useState<ArcadePlayer | null>(null);

  // Online room state
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('owen_chess_player_name');
      if (saved) return saved;
    } catch {}
    return 'Player';
  });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [mySeat, setMySeat] = useState<ArcadePlayer | 'spectator' | null>(null);
  const [players, setPlayers] = useState<OnlinePlayersInfo>({ p1: null, p2: null });
  const [rematchVotes, setRematchVotes] = useState<ArcadePlayer[]>([]);
  const [connStatus, setConnStatus] = useState<ConnStatus>('disconnected');
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [onlineAuthNeeded, setOnlineAuthNeeded] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);
  const [invitingFriendUid, setInvitingFriendUid] = useState<string | null>(null);
  const [invitedFriendUids, setInvitedFriendUids] = useState<Set<string>>(() => new Set());

  // Hub directory vs active game board stage (always starts on All Minigames page unless deep-linked)
  const [viewStage, setViewStage] = useState<'hub' | 'play'>('hub');
  const [hubSearch, setHubSearch] = useState('');
  const [hubCategory, setHubCategory] = useState<'All' | ArcadeGameCategory>('All');

  // UI/UX controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [checkersFrom, setCheckersFrom] = useState<[number, number] | null>(null);
  const [hoveredC4Col, setHoveredC4Col] = useState<number | null>(null);
  const [hoveredReversi, setHoveredReversi] = useState<[number, number] | null>(null);

  // Keep default name synced to signed-in profile if still generic
  useEffect(() => {
    const preferred = profile?.displayName || user?.displayName;
    if (preferred && (playerName === 'Player' || !playerName.trim())) {
      setPlayerName(preferred.slice(0, 24));
    }
  }, [profile?.displayName, user?.displayName, playerName]);

  const handlePlayerNameChange = (val: string) => {
    const clean = val.slice(0, 24);
    setPlayerName(clean);
    try {
      localStorage.setItem('owen_chess_player_name', clean);
    } catch {}
  };

  // Synthesized Web Audio feedback (zero latency, no external files)
  const playSfx = useCallback(
    (kind: 'move' | 'capture' | 'bonus' | 'win') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;

        const blip = (freq: number, dur: number, offset = 0, vol = 0.13, wave: OscillatorType = 'triangle') => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = wave;
          osc.frequency.setValueAtTime(freq, now + offset);
          gain.gain.setValueAtTime(vol, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + dur);
        };

        if (kind === 'move') {
          blip(260, 0.055, 0, 0.13, 'triangle');
          blip(180, 0.045, 0.015, 0.09, 'sine');
        } else if (kind === 'capture') {
          blip(380, 0.07, 0, 0.15, 'triangle');
          blip(520, 0.08, 0.04, 0.12, 'sine');
        } else if (kind === 'bonus') {
          blip(440, 0.08, 0, 0.13, 'sine');
          blip(660, 0.11, 0.06, 0.14, 'triangle');
        } else if (kind === 'win') {
          blip(392, 0.14, 0, 0.14, 'triangle');
          blip(523.25, 0.14, 0.1, 0.14, 'triangle');
          blip(659.25, 0.28, 0.2, 0.16, 'triangle');
        }
      } catch {}
    },
    [soundEnabled]
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      try {
        if (next) studioRef.current?.requestFullscreen?.()?.catch(() => {});
        else if (document.fullscreenElement) document.exitFullscreen?.()?.catch(() => {});
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && isFullscreen) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, [isFullscreen]);

  const closeFirestore = useCallback(() => {
    if (firestoreUnsubRef.current) {
      try {
        firestoreUnsubRef.current();
      } catch {}
      firestoreUnsubRef.current = null;
    }
  }, []);

  const closeWs = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setConnStatus('disconnected');
  }, []);

  const applyOnlineSync = useCallback(
    (msg: ArcadeRoomViewPayload) => {
      setOnlineError(null);
      setOnlineAuthNeeded(false);
      setConnStatus('connected');

      const nextMoves = Array.isArray(msg.moves) ? msg.moves : [];
      const endedByEvent = Boolean(msg.resignedWinner) || msg.state.winner !== null;

      const pending = pendingMoveRef.current;
      if (pending && pending.code === msg.code) {
        if (!endedByEvent && nextMoves.length < pending.expectedMoveIndex + 1) {
          // Ignore stale snapshot before our optimistic write lands
          setMySeat(msg.mySeat || 'spectator');
          setPlayers(msg.players || { p1: null, p2: null });
          setRematchVotes(Array.isArray(msg.rematchVotes) ? msg.rematchVotes : []);
          return;
        }
        pendingMoveRef.current = null;
      }

      const prevCode = lastRoomRef.current;
      const prevLen = lastMoveLenRef.current;
      const roomChanged = prevCode !== msg.code;

      lastRoomRef.current = msg.code;
      lastMoveLenRef.current = nextMoves.length;
      if (roomChanged || (nextMoves.length === 0 && prevLen > 0)) {
        setLastEloResult(null);
      }

      setRoomCode(msg.code);
      setViewStage('play');
      setSelectedGame(msg.gameType);
      try {
        localStorage.setItem(SELECTED_GAME_KEY, msg.gameType);
      } catch {}
      setMySeat(msg.mySeat || 'spectator');
      setPlayers(msg.players || { p1: null, p2: null });
      setRematchVotes(Array.isArray(msg.rematchVotes) ? msg.rematchVotes : []);
      setGameState(msg.state);
      setMoves(nextMoves);
      setResignedWinner(msg.resignedWinner || null);

      // Keep checkers multi-jump selection synced to chainFrom automatically
      if (msg.state.gameType === 'checkers' && msg.state.chainFrom) {
        setCheckersFrom(msg.state.chainFrom);
      } else if (roomChanged || nextMoves.length !== prevLen) {
        setCheckersFrom(null);
      }

      if (!roomChanged && nextMoves.length > prevLen) {
        if (endedByEvent) {
          playSfx('win');
        } else {
          playSfx('move');
          if (
            (msg.mySeat === 'p1' || msg.mySeat === 'p2') &&
            msg.state.turn === msg.mySeat &&
            typeof document !== 'undefined' &&
            document.visibilityState === 'hidden'
          ) {
            const gameMeta = getArcadeGameMeta(msg.gameType);
            const oppName = msg.mySeat === 'p1' ? msg.players?.p2?.name : msg.players?.p1?.name;
            pushTurnToast({
              space: 'rooms',
              title: `It's your turn in ${gameMeta.name}!`,
              body: `${oppName || 'Opponent'} moved in room ${msg.code}.`,
              roomCode: msg.code
            });
          }
        }
      } else if (!roomChanged && msg.resignedWinner) {
        playSfx('win');
      }
    },
    [playSfx, pushTurnToast]
  );

  const startFirestoreSub = useCallback(
    (code: string, uid: string) => {
      closeFirestore();
      activeTransportRef.current = 'firestore';
      firestoreUnsubRef.current = subscribeFirestoreArcadeRoom({
        code,
        uid,
        playerId,
        onSync: applyOnlineSync,
        onError: err => {
          setConnStatus('disconnected');
          setOnlineError(err.message || 'Could not sync room.');
        }
      });
    },
    [closeFirestore, playerId, applyOnlineSync]
  );

  const createViaFirestore = useCallback(
    async (targetGame: ArcadeGameType) => {
      setOnlineError(null);
      setOnlineAuthNeeded(false);
      setConnStatus('connecting');
      pendingMoveRef.current = null;
      closeWs();
      closeFirestore();
      activeTransportRef.current = 'firestore';

      try {
        const { code, uid } = await createFirestoreArcadeRoom({
          gameType: targetGame,
          playerId,
          playerName: playerName.trim() || 'Player',
          preferredSeat: seatPref
        });
        pendingAuthActionRef.current = null;
        startFirestoreSub(code, uid);
      } catch (err) {
        setConnStatus('disconnected');
        if (err instanceof ArcadeAuthRequiredError) {
          pendingAuthActionRef.current = { kind: 'create' };
          setOnlineAuthNeeded(true);
          setOnlineError(err.message);
        } else {
          setOnlineError(err instanceof Error ? err.message : 'Failed to create room.');
        }
      }
    },
    [playerId, playerName, seatPref, closeWs, closeFirestore, startFirestoreSub]
  );

  const joinViaFirestore = useCallback(
    async (cleanCode: string) => {
      setOnlineError(null);
      setOnlineAuthNeeded(false);
      setConnStatus('connecting');
      pendingMoveRef.current = null;
      closeWs();
      closeFirestore();
      activeTransportRef.current = 'firestore';

      try {
        const { code, uid, payload } = await joinFirestoreArcadeRoom({
          code: cleanCode,
          playerId,
          playerName: playerName.trim() || 'Player'
        });
        pendingAuthActionRef.current = null;
        applyOnlineSync(payload);
        startFirestoreSub(code, uid);
      } catch (err) {
        setConnStatus('disconnected');
        if (err instanceof ArcadeAuthRequiredError) {
          pendingAuthActionRef.current = { kind: 'join', code: cleanCode };
          setOnlineAuthNeeded(true);
          setOnlineError(err.message);
        } else {
          setTrackedArcadeRoom(null);
          setOnlineError(err instanceof Error ? err.message : `Could not join room "${cleanCode}".`);
        }
      }
    },
    [playerId, playerName, closeWs, closeFirestore, applyOnlineSync, startFirestoreSub, setTrackedArcadeRoom]
  );

  const connectAndSendWs = useCallback(
    (payload?: Record<string, unknown>, onUnavailable?: () => void) => {
      const url = getLocalArcadeWsUrl();
      if (!url) {
        onUnavailable?.();
        return;
      }
      activeTransportRef.current = 'ws';

      const sendPayload = (ws: WebSocket) => {
        if (payload && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(payload));
        }
      };

      const existing = wsRef.current;
      if (existing && existing.readyState === WebSocket.OPEN) {
        sendPayload(existing);
        return;
      }

      if (existing && existing.readyState === WebSocket.CONNECTING) {
        if (payload) {
          const prevOnOpen = existing.onopen;
          existing.onopen = ev => {
            prevOnOpen?.call(existing, ev);
            sendPayload(existing);
          };
        }
        return;
      }

      setOnlineError(null);
      setConnStatus('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnStatus('connected');
        setOnlineError(null);
        if (payload) sendPayload(ws);
      };

      ws.onmessage = event => {
        let msg: any;
        try {
          msg = JSON.parse(String(event.data));
        } catch {
          return;
        }
        if (!msg || typeof msg.type !== 'string') return;

        if (msg.type === 'room:error') {
          const pending = pendingMoveRef.current;
          if (pending) {
            pendingMoveRef.current = null;
            lastMoveLenRef.current = pending.rollbackMoves.length;
            setGameState(pending.rollbackState);
            setMoves(pending.rollbackMoves);
          }
          setOnlineError(String(msg.message || 'Room error occurred.'));
          return;
        }

        if (msg.type === 'room:sync') {
          applyOnlineSync(msg as ArcadeRoomViewPayload);
        }
      };

      ws.onerror = () => {
        if (wsRef.current === ws) closeWs();
        if (onUnavailable) onUnavailable();
        else setOnlineError('Connection interrupted. Check your network and try again.');
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          setConnStatus('disconnected');
        }
      };
    },
    [applyOnlineSync, closeWs]
  );

  // WS heartbeat
  useEffect(() => {
    if (mode !== 'online' || activeTransportRef.current !== 'ws') return;
    const id = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
    return () => window.clearInterval(id);
  }, [mode]);

  useEffect(() => {
    return () => {
      closeWs();
      closeFirestore();
    };
  }, [closeWs, closeFirestore]);

  const handleCreateRoom = useCallback(
    (targetGame?: ArcadeGameType) => {
      const gType = targetGame || selectedGame;
      setMode('online');
      setViewStage('play');
      setOnlineError(null);
      const wsUrl = getLocalArcadeWsUrl();
      if (wsUrl) {
        connectAndSendWs(
          {
            type: 'room:create',
            gameType: gType,
            playerId,
            playerName: playerName.trim() || 'Player',
            preferredSeat: seatPref
          },
          () => {
            createViaFirestore(gType);
          }
        );
      } else {
        createViaFirestore(gType);
      }
    },
    [selectedGame, playerId, playerName, seatPref, connectAndSendWs, createViaFirestore]
  );

  const handleJoinRoom = useCallback(
    (rawCode?: string) => {
      const clean = sanitizeArcadeRoomCode(rawCode ?? joinCodeInput);
      if (clean.length < 4) {
        setOnlineError('Enter a valid 6-character room code.');
        return;
      }
      setMode('online');
      setViewStage('play');
      setOnlineError(null);
      const wsUrl = getLocalArcadeWsUrl();
      if (wsUrl) {
        connectAndSendWs(
          {
            type: 'room:join',
            code: clean,
            playerId,
            playerName: playerName.trim() || 'Player'
          },
          () => {
            joinViaFirestore(clean);
          }
        );
      } else {
        joinViaFirestore(clean);
      }
    },
    [joinCodeInput, playerId, playerName, connectAndSendWs, joinViaFirestore]
  );

  const handleLeaveRoom = useCallback(() => {
    const leavingCode = roomCode;
    setTrackedArcadeRoom(null);
    if (leavingCode) {
      if (activeTransportRef.current === 'ws' && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'room:leave', code: leavingCode, playerId }));
      } else if (activeTransportRef.current === 'firestore') {
        leaveFirestoreArcadeRoom(leavingCode).catch(() => {});
      }
      clearArcadeRoomCache(leavingCode);
    }
    closeWs();
    closeFirestore();
    pendingMoveRef.current = null;
    lastRoomRef.current = null;
    lastMoveLenRef.current = 0;
    setRoomCode(null);
    setMySeat(null);
    setPlayers({ p1: null, p2: null });
    setRematchVotes([]);
    setOnlineError(null);
    setResignedWinner(null);
    setGameState(createInitialArcadeState(selectedGame));
    setMoves([]);
    setCheckersFrom(null);
    setLastEloResult(null);
  }, [roomCode, playerId, selectedGame, closeWs, closeFirestore, setTrackedArcadeRoom]);

  const handleSelectGameType = (gameType: ArcadeGameType) => {
    setSelectedGame(gameType);
    setViewStage('play');
    try {
      localStorage.setItem(SELECTED_GAME_KEY, gameType);
    } catch {}
    if (mode === 'online' && roomCode) {
      // Leave current room cleanly when switching to another game type
      handleLeaveRoom();
    } else {
      setResignedWinner(null);
      setGameState(createInitialArcadeState(gameType));
      setMoves([]);
      setCheckersFrom(null);
      setBotQuote(prev => pickArcadeBotVoiceline(selectedBot, 'start', prev));
    }
  };

  const handleBackToHub = () => {
    if (mode === 'online' && roomCode) {
      handleLeaveRoom();
    }
    setOnlineError(null);
    setViewStage('hub');
  };

  // Check URL ?arcadeRoom=CODE on mount, or rejoin tracked Firestore room when returning via tab
  const deepLinkedRef = useRef(false);
  useEffect(() => {
    if (deepLinkedRef.current) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const paramCode = sanitizeArcadeRoomCode(params.get('arcadeRoom'));
      if (paramCode.length >= 4) {
        deepLinkedRef.current = true;
        setMode('online');
        setViewStage('play');
        setJoinCodeInput(paramCode);
        setTimeout(() => {
          handleJoinRoom(paramCode);
        }, 80);
        return;
      }
      if (!pendingArcadeJoinCode && trackedArcadeRoom?.code && !roomCode) {
        deepLinkedRef.current = true;
        setMode('online');
        setViewStage('play');
        setJoinCodeInput(trackedArcadeRoom.code);
        void joinViaFirestore(trackedArcadeRoom.code);
      }
    } catch {}
  }, [handleJoinRoom, pendingArcadeJoinCode, trackedArcadeRoom, roomCode, joinViaFirestore]);

  // Auto-join when user clicks "Accept" on invite toast or "Jump to Match" on turn toast
  useEffect(() => {
    if (!pendingArcadeJoinCode) return;
    const clean = sanitizeArcadeRoomCode(pendingArcadeJoinCode);
    clearPendingArcadeJoinCode();
    if (clean.length < 4) return;
    setMode('online');
    setViewStage('play');
    setJoinCodeInput(clean);
    void joinViaFirestore(clean);
  }, [pendingArcadeJoinCode, clearPendingArcadeJoinCode, joinViaFirestore]);

  // Sync background turn watcher when seated in a Firestore arcade room
  useEffect(() => {
    const activeWinner = resignedWinner || gameState.winner;
    if (
      mode === 'online' &&
      activeTransportRef.current === 'firestore' &&
      roomCode &&
      (mySeat === 'p1' || mySeat === 'p2') &&
      !activeWinner
    ) {
      setTrackedArcadeRoom({
        code: roomCode,
        mySide: mySeat,
        gameType: gameState.gameType,
        gameTitle: getArcadeGameMeta(gameState.gameType).name
      });
    } else if (activeWinner) {
      setTrackedArcadeRoom(null);
    }
  }, [mode, roomCode, mySeat, resignedWinner, gameState.winner, gameState.gameType, setTrackedArcadeRoom]);

  useEffect(() => {
    if (!roomCode) {
      setInvitedFriendUids(new Set());
    }
  }, [roomCode]);

  const myFirebaseUid =
    user?.uid && auth.currentUser?.uid === user.uid ? user.uid : auth.currentUser?.uid || '';

  const invitableArcadePlayers = useMemo(() => {
    const byUid = new Map<
      string,
      { uid: string; name: string; avatarId: string; isFriend: boolean; online: boolean }
    >();
    const dirMap = new Map(directoryProfiles.map(p => [p.userId, p]));

    for (const c of contacts) {
      if (!c.contactUid || c.contactUid === myFirebaseUid) continue;
      const live = dirMap.get(c.contactUid);
      byUid.set(c.contactUid, {
        uid: c.contactUid,
        name: live?.displayName || c.nickname || c.displayName,
        avatarId: live?.avatarId || c.avatarId || 'melon_classic',
        isFriend: true,
        online: live ? isProfileOnlineNow(live) : false
      });
    }

    for (const p of directoryProfiles) {
      if (!p.userId || p.userId === myFirebaseUid || byUid.has(p.userId)) continue;
      byUid.set(p.userId, {
        uid: p.userId,
        name: p.displayName,
        avatarId: p.avatarId || 'melon_classic',
        isFriend: false,
        online: isProfileOnlineNow(p)
      });
    }

    return Array.from(byUid.values())
      .sort((a, b) => Number(b.online) - Number(a.online) || Number(b.isFriend) - Number(a.isFriend))
      .slice(0, 12);
  }, [contacts, directoryProfiles, myFirebaseUid]);

  const incomingArcadeInvites = useMemo(
    () => incomingInvites.filter(inv => inv.gameKind === 'arcade'),
    [incomingInvites]
  );

  const activeArcadeRoomInvite = useMemo(() => {
    if (!roomCode) return null;
    const match = allInvites.find(
      inv => inv.gameKind === 'arcade' && inv.roomCode === roomCode
    );
    if (match) return match;
    if (
      lastAcceptedInvite &&
      lastAcceptedInvite.gameKind === 'arcade' &&
      lastAcceptedInvite.roomCode === roomCode
    ) {
      return lastAcceptedInvite;
    }
    return null;
  }, [roomCode, allInvites, lastAcceptedInvite]);

  const resolveAvatarIcon = useCallback((avatarId?: string | null) => {
    return (AVATAR_PRESETS.find(a => a.id === avatarId) || AVATAR_PRESETS[0]).icon;
  }, []);

  const resolvePersonByUid = useCallback(
    (uid?: string | null, fallbackName?: string | null) => {
      if (uid && uid === myFirebaseUid) {
        const myName =
          playerName && playerName !== 'Player'
            ? playerName
            : profile?.displayName || user?.displayName || fallbackName || 'You';
        return {
          name: myName,
          avatarIcon: resolveAvatarIcon(profile?.avatarId)
        };
      }
      const contact = uid ? contacts.find(c => c.contactUid === uid) : undefined;
      const dir = uid ? directoryProfiles.find(p => p.userId === uid) : undefined;
      const matchedInv =
        uid && activeArcadeRoomInvite
          ? activeArcadeRoomInvite.fromUid === uid
            ? { name: activeArcadeRoomInvite.fromName, avatarId: activeArcadeRoomInvite.fromAvatarId }
            : activeArcadeRoomInvite.toUid === uid
            ? { name: activeArcadeRoomInvite.toName, avatarId: contact?.avatarId || dir?.avatarId }
            : null
          : null;

      const cleanFallback =
        fallbackName &&
        fallbackName !== 'Player' &&
        fallbackName !== 'Player 1' &&
        fallbackName !== 'Player 2'
          ? fallbackName
          : '';

      const resolvedName =
        contact?.nickname ||
        dir?.displayName ||
        contact?.displayName ||
        matchedInv?.name ||
        cleanFallback ||
        fallbackName ||
        'Player';

      const avatarId = dir?.avatarId || contact?.avatarId || matchedInv?.avatarId;
      return {
        name: resolvedName,
        avatarIcon: avatarId ? resolveAvatarIcon(avatarId) : null
      };
    },
    [
      myFirebaseUid,
      playerName,
      profile?.displayName,
      profile?.avatarId,
      user?.displayName,
      contacts,
      directoryProfiles,
      activeArcadeRoomInvite,
      resolveAvatarIcon
    ]
  );

  const handleInviteFriendToArcade = async (target: { uid: string; name: string }) => {
    setOnlineError(null);
    setInvitingFriendUid(target.uid);
    try {
      let roomToShare =
        roomCode && activeTransportRef.current === 'firestore' ? roomCode : '';
      let targetGame = gameState.gameType || selectedGame;
      let senderUid = myFirebaseUid;

      if (!roomToShare) {
        closeWs();
        closeFirestore();
        setConnStatus('connecting');
        const created = await createFirestoreArcadeRoom({
          gameType: selectedGame,
          playerId,
          playerName: playerName.trim() || profile?.displayName || user?.displayName || 'Player',
          preferredSeat: seatPref
        });
        roomToShare = created.code;
        senderUid = created.uid;
        targetGame = selectedGame;
        startFirestoreSub(created.code, created.uid);
      }

      if (!senderUid || auth.currentUser?.uid !== senderUid) {
        throw new ArcadeAuthRequiredError('Sign in with Google once to invite friends directly.');
      }

      await sendGameInvite({
        fromUid: senderUid,
        fromName: playerName.trim() || profile?.displayName || user?.displayName || 'Player',
        fromAvatarId: profile?.avatarId || 'melon_classic',
        toUid: target.uid,
        toName: target.name,
        gameKind: 'arcade',
        gameType: targetGame,
        gameTitle: getArcadeGameMeta(targetGame).name,
        roomCode: roomToShare
      });

      setInvitedFriendUids(prev => {
        const next = new Set(prev);
        next.add(target.uid);
        return next;
      });
    } catch (err) {
      if (err instanceof ArcadeAuthRequiredError) {
        setOnlineAuthNeeded(true);
      }
      setOnlineError(err instanceof Error ? err.message : 'Could not send invite.');
    } finally {
      setInvitingFriendUid(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setOnlineError(null);
    try {
      await signInGoogleForArcade();
      setOnlineAuthNeeded(false);
      const pending = pendingAuthActionRef.current;
      pendingAuthActionRef.current = null;
      if (pending?.kind === 'create') {
        await createViaFirestore(selectedGame);
      } else if (pending?.kind === 'join') {
        await joinViaFirestore(pending.code);
      }
    } catch (err) {
      setOnlineError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const resetLocalMatch = (
    nextGameType: ArcadeGameType = selectedGame,
    nextHumanSeat: ArcadePlayer = humanSeat,
    botOverride: ArcadeBot = selectedBot
  ) => {
    setGameState(createInitialArcadeState(nextGameType));
    setMoves([]);
    setResignedWinner(null);
    setCheckersFrom(null);
    setHumanSeat(nextHumanSeat);
    setBotQuote(prev => pickArcadeBotVoiceline(botOverride, 'start', prev));
  };

  const handleSelectBot = (bot: ArcadeBot) => {
    setSelectedBotId(bot.id);
    try {
      localStorage.setItem(SELECTED_BOT_KEY, bot.id);
    } catch {}
    resetLocalMatch(selectedGame, humanSeat, bot);
  };

  const effectiveWinner = resignedWinner || gameState.winner;
  const isGameOver = Boolean(effectiveWinner);
  const botSeat: ArcadePlayer = humanSeat === 'p1' ? 'p2' : 'p1';

  const canActNow =
    !isGameOver &&
    (mode === 'pvp'
      ? true
      : mode === 'ai'
      ? gameState.turn === humanSeat
      : Boolean(roomCode) && (mySeat === 'p1' || mySeat === 'p2') && gameState.turn === mySeat);

  // Execute any validated move with 0ms local latency across all 3 modes
  const performAction = useCallback(
    (action: string) => {
      if (isGameOver) return;
      if (mode === 'ai' && gameState.turn !== humanSeat) return;
      if (mode === 'online') {
        if (!roomCode || (mySeat !== 'p1' && mySeat !== 'p2') || gameState.turn !== mySeat) return;
      }

      const res = applyArcadeAction(gameState, action);
      if (!res.valid) return;

      // Instant audio cue
      if (res.nextState.winner) {
        playSfx('win');
        if (mode === 'ai' && res.nextState.winner === humanSeat) {
          setBotQuote(prev => pickArcadeBotVoiceline(selectedBot, 'lose', prev));
        }
      } else if (res.extraTurn) {
        playSfx('bonus');
      } else if (res.capturedOrScored) {
        playSfx('capture');
      } else {
        playSfx('move');
      }

      const prevState = gameState;
      const prevMoves = moves;
      const expectedMoveIndex = prevMoves.length;
      const nextMoves = [...prevMoves, action];

      // Optimistic local state update (0ms input delay)
      setGameState(res.nextState);
      setMoves(nextMoves);

      if (res.nextState.gameType === 'checkers') {
        setCheckersFrom(res.nextState.chainFrom);
      } else {
        setCheckersFrom(null);
      }

      if (mode === 'online' && roomCode) {
        lastMoveLenRef.current = nextMoves.length;
        pendingMoveRef.current = {
          code: roomCode,
          expectedMoveIndex,
          rollbackState: prevState,
          rollbackMoves: prevMoves
        };

        if (activeTransportRef.current === 'ws') {
          connectAndSendWs({
            type: 'room:move',
            code: roomCode,
            playerId,
            action,
            moveIndex: expectedMoveIndex
          });
        } else {
          sendFirestoreArcadeMove({
            code: roomCode,
            action,
            expectedMoveIndex
          }).catch(err => {
            const pending = pendingMoveRef.current;
            if (pending && pending.code === roomCode && pending.expectedMoveIndex === expectedMoveIndex) {
              pendingMoveRef.current = null;
              lastMoveLenRef.current = pending.rollbackMoves.length;
              setGameState(pending.rollbackState);
              setMoves(pending.rollbackMoves);
            }
            setOnlineError(err instanceof Error ? err.message : 'Failed to send move.');
          });
        }
      }
    },
    [
      isGameOver,
      mode,
      gameState,
      moves,
      humanSeat,
      selectedBot,
      roomCode,
      mySeat,
      playerId,
      playSfx,
      connectAndSendWs
    ]
  );

  // Selected AI Bot turn automation across all 8 arcade games
  useEffect(() => {
    if (mode !== 'ai' || isGameOver || gameState.turn !== botSeat) return;
    const timer = window.setTimeout(() => {
      const act = pickBotArcadeAction(gameState, selectedBot);
      if (!act) return;
      const res = applyArcadeAction(gameState, act);
      if (!res.valid) return;
      if (res.nextState.winner) {
        playSfx('win');
        if (res.nextState.winner === botSeat) {
          setBotQuote(prev => pickArcadeBotVoiceline(selectedBot, 'win', prev));
        } else if (res.nextState.winner === humanSeat) {
          setBotQuote(prev => pickArcadeBotVoiceline(selectedBot, 'lose', prev));
        }
      } else if (res.extraTurn) {
        playSfx('bonus');
        setBotQuote(prev => pickArcadeBotVoiceline(selectedBot, 'bonus', prev));
      } else if (res.capturedOrScored) {
        playSfx('capture');
      } else {
        playSfx('move');
      }
      setGameState(res.nextState);
      setMoves(prev => [...prev, act]);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [mode, isGameOver, gameState, botSeat, humanSeat, selectedBot, playSfx]);

  const handleCopy = (text: string, type: 'code' | 'link') => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch {}
  };

  const handleResign = () => {
    if (isGameOver) return;
    if (mode === 'online' && roomCode) {
      if (activeTransportRef.current === 'ws') {
        connectAndSendWs({ type: 'room:resign', code: roomCode, playerId });
      } else {
        resignFirestoreArcadeRoom(roomCode).catch(err => {
          setOnlineError(err instanceof Error ? err.message : 'Could not resign.');
        });
      }
    } else {
      setResignedWinner(gameState.turn === 'p1' ? 'p2' : 'p1');
      playSfx('win');
    }
  };

  const handleRematch = () => {
    if (mode === 'online' && roomCode) {
      if (activeTransportRef.current === 'ws') {
        connectAndSendWs({ type: 'room:rematch', code: roomCode, playerId });
      } else {
        voteFirestoreArcadeRematch(roomCode).catch(err => {
          setOnlineError(err instanceof Error ? err.message : 'Could not vote for rematch.');
        });
      }
    } else {
      resetLocalMatch(selectedGame, humanSeat);
    }
  };

  const meta: ArcadeGameMeta = useMemo(() => getArcadeGameMeta(gameState.gameType), [gameState.gameType]);

  const botLabel = `${selectedBot.avatar} ${selectedBot.name}`;

  const p1Resolved = useMemo(() => {
    if (mode !== 'online') return null;
    if (players.p1) return resolvePersonByUid(players.p1.uid, players.p1.name);
    if (activeArcadeRoomInvite) {
      if (activeArcadeRoomInvite.fromUid === myFirebaseUid && mySeat === 'p1') {
        return resolvePersonByUid(myFirebaseUid, playerName);
      }
      if (activeArcadeRoomInvite.toUid === myFirebaseUid && mySeat === 'p2') {
        return resolvePersonByUid(activeArcadeRoomInvite.fromUid, activeArcadeRoomInvite.fromName);
      }
      if (activeArcadeRoomInvite.fromUid === myFirebaseUid) {
        return resolvePersonByUid(activeArcadeRoomInvite.toUid, activeArcadeRoomInvite.toName);
      }
    }
    return null;
  }, [mode, players.p1, activeArcadeRoomInvite, myFirebaseUid, mySeat, playerName, resolvePersonByUid]);

  const p2Resolved = useMemo(() => {
    if (mode !== 'online') return null;
    if (players.p2) return resolvePersonByUid(players.p2.uid, players.p2.name);
    if (activeArcadeRoomInvite) {
      if (activeArcadeRoomInvite.fromUid === myFirebaseUid && mySeat === 'p1') {
        return resolvePersonByUid(activeArcadeRoomInvite.toUid, activeArcadeRoomInvite.toName);
      }
      if (activeArcadeRoomInvite.fromUid === myFirebaseUid && mySeat === 'p2') {
        return resolvePersonByUid(myFirebaseUid, playerName);
      }
    }
    return null;
  }, [mode, players.p2, activeArcadeRoomInvite, myFirebaseUid, mySeat, playerName, resolvePersonByUid]);

  const p1Display =
    mode === 'online'
      ? players.p1
        ? p1Resolved?.name || players.p1.name
        : mySeat === 'p1'
        ? playerName
        : p1Resolved
        ? `Waiting for ${p1Resolved.name}...`
        : 'Waiting for P1...'
      : mode === 'ai'
      ? humanSeat === 'p1'
        ? `${(playerName && playerName !== 'Player' ? playerName : '') || profile?.displayName || user?.displayName || 'You'}`
        : botLabel
      : `Player 1 (${meta.p1Label})`;

  const p2Display =
    mode === 'online'
      ? players.p2
        ? p2Resolved?.name || players.p2.name
        : mySeat === 'p2'
        ? playerName
        : p2Resolved
        ? `Waiting for ${p2Resolved.name}...`
        : 'Waiting for P2...'
      : mode === 'ai'
      ? humanSeat === 'p2'
        ? `${(playerName && playerName !== 'Player' ? playerName : '') || profile?.displayName || user?.displayName || 'You'}`
        : botLabel
      : `Player 2 (${meta.p2Label})`;

  const p1Avatar =
    mode === 'online'
      ? p1Resolved?.avatarIcon || null
      : mode === 'ai'
      ? humanSeat === 'p1'
        ? resolveAvatarIcon(profile?.avatarId)
        : selectedBot.avatar
      : null;

  const p2Avatar =
    mode === 'online'
      ? p2Resolved?.avatarIcon || null
      : mode === 'ai'
      ? humanSeat === 'p2'
        ? resolveAvatarIcon(profile?.avatarId)
        : selectedBot.avatar
      : null;

  const { navigateSpace } = useNotifications();
  const { startCall, callPhase } = useCall();
  const [lastEloResult, setLastEloResult] = useState<SettledEloResult | null>(null);
  const settledArcadeMatchRef = useRef<Set<string>>(new Set());

  const onlineOpponentCallTarget = useMemo(() => {
    if (mode !== 'online' || !roomCode) return null;
    if (mySeat !== 'p1' && mySeat !== 'p2') return null;
    const oppSeat = mySeat === 'p1' ? players.p2 : players.p1;
    const resolved = mySeat === 'p1' ? p2Resolved : p1Resolved;
    const uid = oppSeat?.uid || '';
    if (!uid || uid === myFirebaseUid) return null;
    const dirMatch = directoryProfiles.find(p => p.userId === uid);
    const contactMatch = contacts.find(c => c.contactUid === uid);
    return {
      uid,
      name: resolved?.name || oppSeat?.name || 'Opponent',
      avatarId: dirMatch?.avatarId || contactMatch?.avatarId || 'melon_classic'
    };
  }, [mode, roomCode, mySeat, players.p1, players.p2, p1Resolved, p2Resolved, myFirebaseUid, directoryProfiles, contacts]);

  // Automatically record PvP ELO ratings when an online Firestore arcade match ends
  useEffect(() => {
    if (
      !isGameOver ||
      mode !== 'online' ||
      !roomCode ||
      activeTransportRef.current !== 'firestore'
    ) {
      return;
    }
    const p1Uid = players.p1?.uid || '';
    const p2Uid = players.p2?.uid || '';
    if (!p1Uid || !p2Uid || p1Uid === p2Uid) return;
    if (myFirebaseUid !== p1Uid && myFirebaseUid !== p2Uid) return;

    const finalWinner = (resignedWinner || gameState.winner || 'draw') as 'p1' | 'p2' | 'draw';
    const matchId = buildMatchId({
      sourceType: 'arcadeRoom',
      roomCode,
      moveCount: moves.length,
      winnerSeat: finalWinner,
      p1Uid,
      p2Uid,
      movesSample: moves.slice(-4).join('|')
    });

    if (settledArcadeMatchRef.current.has(matchId)) return;
    settledArcadeMatchRef.current.add(matchId);

    const p1Dir = directoryProfiles.find(p => p.userId === p1Uid);
    const p2Dir = directoryProfiles.find(p => p.userId === p2Uid);

    void settleOnlinePvpMatchElo({
      matchId,
      sourceType: 'arcadeRoom',
      roomCode,
      gameKind: 'arcade',
      gameType: gameState.gameType,
      gameTitle: meta.name,
      p1Uid,
      p1Name: players.p1?.name || p1Dir?.displayName || 'Player 1',
      p1AvatarId: (p1Uid === myFirebaseUid ? profile?.avatarId : p1Dir?.avatarId) || 'melon_classic',
      p2Uid,
      p2Name: players.p2?.name || p2Dir?.displayName || 'Player 2',
      p2AvatarId: (p2Uid === myFirebaseUid ? profile?.avatarId : p2Dir?.avatarId) || 'melon_classic',
      winnerSeat: finalWinner
    })
      .then(res => {
        if (res) setLastEloResult(res);
      })
      .catch(() => {});
  }, [
    isGameOver,
    mode,
    roomCode,
    players.p1?.uid,
    players.p1?.name,
    players.p2?.uid,
    players.p2?.name,
    myFirebaseUid,
    resignedWinner,
    gameState.winner,
    gameState.gameType,
    meta.name,
    moves,
    directoryProfiles,
    profile?.avatarId
  ]);

  const statusHeadline = useMemo(() => {
    if (effectiveWinner === 'draw') return 'Match Drawn!';
    if (effectiveWinner === 'p1') return `${p1Display} Wins!`;
    if (effectiveWinner === 'p2') return `${p2Display} Wins!`;
    if (mode === 'online' && roomCode && (!players.p1 || !players.p2)) {
      return `Room ${roomCode} ready — share code to start!`;
    }
    if (gameState.gameType === 'checkers' && gameState.chainFrom) {
      return `${gameState.turn === 'p1' ? p1Display : p2Display} has a mandatory multi-jump!`;
    }
    if (gameState.gameType === 'reversi' && gameState.passedLastTurn) {
      return `Opponent had no valid flips — ${gameState.turn === 'p1' ? p1Display : p2Display} goes again!`;
    }
    if (gameState.gameType === 'mancala' && gameState.extraTurn) {
      return `Store landing! ${gameState.turn === 'p1' ? p1Display : p2Display} gets an extra turn!`;
    }
    if (mode === 'online' && (mySeat === 'p1' || mySeat === 'p2')) {
      return gameState.turn === mySeat ? 'Your Turn — Instant Move' : `Waiting for ${gameState.turn === 'p1' ? p1Display : p2Display}...`;
    }
    return `${gameState.turn === 'p1' ? p1Display : p2Display}’s Turn`;
  }, [effectiveWinner, p1Display, p2Display, mode, roomCode, players, gameState, mySeat]);

  const inviteUrl = useMemo(() => {
    if (!roomCode || typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?arcadeRoom=${roomCode}`;
  }, [roomCode]);

  const hasVotedRematch =
    mode === 'online' && (mySeat === 'p1' || mySeat === 'p2') && rematchVotes.includes(mySeat);

  const hubCategories: ('All' | ArcadeGameCategory)[] = [
    'All',
    'Drawing & Creative',
    'Strategy',
    'Territory & Pawns',
    'Word & Code',
    'Dice & Duel'
  ];

  const filteredHubGames = useMemo(() => {
    const q = hubSearch.trim().toLowerCase();
    return ARCADE_GAMES.filter(g => {
      if (hubCategory !== 'All' && g.category !== hubCategory) return false;
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.tagline.toLowerCase().includes(q) ||
        (g.category || '').toLowerCase().includes(q)
      );
    });
  }, [hubSearch, hubCategory]);

  return (
    <div
      ref={studioRef}
      className={`${
        isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto' : 'flex-1'
      } flex flex-col p-3 md:p-4 text-slate-100 select-none`}
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-3">
        {/* Top-Level Incoming Arcade Invites Banner (visible in ALL modes) */}
        {incomingArcadeInvites.length > 0 && (
          <div className="w-full rounded-2xl border border-sky-400/50 bg-sky-500/15 px-3.5 py-2.5 flex flex-col gap-2 shadow-lg">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span>Game Invites Waiting ({incomingArcadeInvites.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {incomingArcadeInvites.map(inv => {
                const inviter = resolvePersonByUid(inv.fromUid, inv.fromName);
                const icon = inviter.avatarIcon || resolveAvatarIcon(inv.fromAvatarId);
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 bg-black/35 px-3 py-2 rounded-xl border border-white/15 flex-1 min-w-[240px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white truncate">
                          {inviter.name} invited you to {inv.gameTitle}
                        </div>
                        <div className="text-[10px] text-sky-200/80 font-mono">
                          Room {inv.roomCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void acceptGameInvite(inv)}
                        className="px-3 py-1 rounded-lg bg-sky-400 hover:bg-sky-300 text-black text-xs font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void declineGameInvite(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                        title="Decline invite"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewStage === 'hub' ? (
          <div className="flex flex-col gap-3">
            {/* All Minigames Hub Header + Quick Room Join */}
            <div
              className="rounded-2xl border p-4 shadow-xl flex flex-col gap-3.5"
              style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 shrink-0" style={{ color: activeTheme.accent }} />
                    <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                      All Minigames
                    </h2>
                    <span className="text-xs font-mono text-slate-400">
                      · {ARCADE_GAMES.length} Room-Code & Bot Games
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pick any minigame below to open its arena, invite friends with 1 click, or battle {ARCADE_BOTS.length} AI bots.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Room Code Join right from All Minigames */}
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleJoinRoom();
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="Room code..."
                      maxLength={8}
                      className="w-28 sm:w-32 px-2.5 py-2 rounded-xl border text-xs font-mono uppercase tracking-widest text-white focus:outline-none"
                      style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                    />
                    <button
                      type="submit"
                      disabled={connStatus === 'connecting'}
                      className="px-3 py-2 rounded-xl text-black font-extrabold text-xs cursor-pointer hover:brightness-110 disabled:opacity-50"
                      style={{ backgroundColor: activeTheme.accent }}
                    >
                      Join
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = mode === 'ai' ? 'online' : 'ai';
                      setMode(nextMode);
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      mode === 'ai' ? 'text-black' : 'text-slate-100 hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: mode === 'ai' ? activeTheme.accent : activeTheme.bgSecondary,
                      borderColor: mode === 'ai' ? activeTheme.accent : activeTheme.border
                    }}
                    title="Toggle playing minigames solo against 8 AI Bots"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{mode === 'ai' ? 'vs Bots: ON' : 'vs Bots'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const pick = ARCADE_GAMES[Math.floor(Math.random() * ARCADE_GAMES.length)];
                      handleSelectGameType(pick.id);
                    }}
                    className="px-3 py-2 rounded-xl border text-xs font-bold text-slate-100 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                  >
                    <Shuffle className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                    <span>Random</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateSpace('leaderboard')}
                    className="px-3 py-2 rounded-xl border text-xs font-extrabold text-amber-300 hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                    title="View PvP ELO Leaderboard"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Leaderboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundEnabled(s => !s)}
                    className="p-2 rounded-xl border text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                    style={{ borderColor: activeTheme.border }}
                    title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              {onlineError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-200 flex items-center justify-between gap-2">
                  <span>{onlineError}</span>
                  {onlineAuthNeeded && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="px-3 py-1 rounded-lg bg-white text-slate-900 font-extrabold text-xs cursor-pointer shrink-0"
                    >
                      {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                  )}
                </div>
              )}

              {/* Search & Category Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={hubSearch}
                    onChange={e => setHubSearch(e.target.value)}
                    placeholder={`Search all ${ARCADE_GAMES.length} minigames...`}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs text-white placeholder-slate-500 focus:outline-none"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                  />
                  {hubSearch && (
                    <button
                      type="button"
                      onClick={() => setHubSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {hubCategories.map(cat => {
                    const active = hubCategory === cat;
                    const count =
                      cat === 'All'
                        ? ARCADE_GAMES.length
                        : ARCADE_GAMES.filter(g => g.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setHubCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                          active ? 'text-black' : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: active ? activeTheme.accent : activeTheme.bgSecondary,
                          borderColor: active ? activeTheme.accent : activeTheme.border
                        }}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minigames Directory Grid */}
            {filteredHubGames.length === 0 ? (
              <div
                className="rounded-2xl border p-10 text-center flex flex-col items-center gap-2"
                style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
              >
                <span className="text-3xl">🕹️</span>
                <p className="text-sm font-bold text-white">No minigames matched &ldquo;{hubSearch}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => {
                    setHubSearch('');
                    setHubCategory('All');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-black cursor-pointer mt-1"
                  style={{ backgroundColor: activeTheme.accent }}
                >
                  Show All {ARCADE_GAMES.length} Games
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {filteredHubGames.map(g => {
                  const isLastPlayed = selectedGame === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSelectGameType(g.id)}
                      className="group p-3.5 rounded-2xl border text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between gap-2.5"
                      style={{
                        backgroundColor: activeTheme.bgCard,
                        borderColor: isLastPlayed ? g.accentColor : activeTheme.border
                      }}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              backgroundColor: `${g.accentColor}20`,
                              borderColor: `${g.accentColor}55`
                            }}
                          >
                            <span>{g.emoji}</span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-extrabold text-white truncate group-hover:text-emerald-300 transition-colors">
                              {g.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{g.tagline}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t text-[11px]" style={{ borderColor: activeTheme.border }}>
                        <span className="text-slate-400 font-medium truncate">
                          {g.category || 'Arcade'} · <span className="font-mono">{g.avgTime}</span>
                        </span>
                        <span
                          className="font-extrabold shrink-0 flex items-center gap-1"
                          style={{ color: g.accentColor }}
                        >
                          <span>Open</span>
                          <Play className="w-3 h-3 fill-current" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
        <>
        {/* Active Game Top Bar with Back to All Minigames */}
        <div
          className="rounded-2xl border px-3 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-2"
          style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBackToHub}
              className="px-3 py-1.5 rounded-xl border text-xs font-extrabold text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.borderActive }}
            >
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span>All Minigames</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">{meta.emoji}</span>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-extrabold text-white truncate leading-tight">
                  {meta.name}
                </h2>
                <div className="text-[11px] text-slate-400 truncate">
                  {meta.category || 'Arcade'} · {meta.tagline}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onlineOpponentCallTarget && (
              <>
                <button
                  type="button"
                  disabled={callPhase !== 'idle'}
                  onClick={() =>
                    void startCall({
                      peerUid: onlineOpponentCallTarget.uid,
                      peerName: onlineOpponentCallTarget.name,
                      peerAvatarId: onlineOpponentCallTarget.avatarId,
                      mode: 'audio',
                      contextLabel: `${meta.name} · Room ${roomCode}`
                    })
                  }
                  className="px-2.5 py-2 rounded-xl border bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title={`Voice call ${onlineOpponentCallTarget.name}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </button>
                <button
                  type="button"
                  disabled={callPhase !== 'idle'}
                  onClick={() =>
                    void startCall({
                      peerUid: onlineOpponentCallTarget.uid,
                      peerName: onlineOpponentCallTarget.name,
                      peerAvatarId: onlineOpponentCallTarget.avatarId,
                      mode: 'video',
                      contextLabel: `${meta.name} · Room ${roomCode}`
                    })
                  }
                  className="px-2.5 py-2 rounded-xl border bg-violet-500/15 hover:bg-violet-500/25 border-violet-500/35 text-violet-300 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title={`Video call ${onlineOpponentCallTarget.name}`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => navigateSpace('leaderboard')}
              className="p-2 rounded-xl border text-amber-300 hover:text-amber-200 hover:bg-white/10 transition-colors cursor-pointer"
              style={{ borderColor: activeTheme.border }}
              title="Open PvP ELO Leaderboard"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(s => !s)}
              className="p-2 rounded-xl border text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              style={{ borderColor: activeTheme.border }}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              style={{ borderColor: activeTheme.border }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Arcade'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Workspace: Compact Board + Controls Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left / Center Stage: Active Game Board */}
          <div
            className="lg:col-span-8 rounded-2xl border p-3 md:p-4 shadow-2xl flex flex-col gap-3"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            {/* Compact Player Versus Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: activeTheme.border }}>
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    !isGameOver && gameState.turn === 'p1' ? 'ring-2 ring-emerald-400/70 text-white' : 'text-slate-300'
                  }`}
                  style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  {p1Avatar && <span className="shrink-0">{p1Avatar}</span>}
                  <span className="truncate max-w-[130px]">{p1Display}</span>
                  {mySeat === 'p1' && mode === 'online' && <span className="text-[9px] font-mono text-emerald-400">YOU</span>}
                </div>

                <span className="text-[10px] font-extrabold text-slate-500 uppercase">VS</span>

                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    !isGameOver && gameState.turn === 'p2' ? 'ring-2 ring-amber-400/70 text-white' : 'text-slate-300'
                  }`}
                  style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  {p2Avatar && <span className="shrink-0">{p2Avatar}</span>}
                  <span className="truncate max-w-[130px]">{p2Display}</span>
                  {mySeat === 'p2' && mode === 'online' && <span className="text-[9px] font-mono text-emerald-400">YOU</span>}
                </div>

                {mode === 'online' && activeArcadeRoomInvite && (
                  <span className="text-[10px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-400/25 px-2 py-0.5 rounded-md truncate">
                    {activeArcadeRoomInvite.fromUid === myFirebaseUid
                      ? `Invited ${resolvePersonByUid(activeArcadeRoomInvite.toUid, activeArcadeRoomInvite.toName).name}`
                      : `Invited by ${resolvePersonByUid(activeArcadeRoomInvite.fromUid, activeArcadeRoomInvite.fromName).name}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-200">{statusHeadline}</span>
              </div>
            </div>

            {/* Game Canvas / Board Stage */}
            <div className="relative flex flex-col items-center justify-center py-1 min-h-[340px]">
              {gameState.gameType === 'connect4' && (
                <Connect4Board
                  state={gameState}
                  canAct={canActNow}
                  hoveredCol={hoveredC4Col}
                  onHoverCol={setHoveredC4Col}
                  onDrop={col => performAction(`c:${col}`)}
                />
              )}

              {gameState.gameType === 'checkers' && (
                <CheckersBoard
                  state={gameState}
                  canAct={canActNow}
                  flipped={mode === 'online' ? mySeat === 'p2' : mode === 'ai' ? humanSeat === 'p2' : false}
                  selectedFrom={checkersFrom}
                  onSelectFrom={setCheckersFrom}
                  onMove={action => performAction(action)}
                />
              )}

              {gameState.gameType === 'reversi' && (
                <ReversiBoard
                  state={gameState}
                  canAct={canActNow}
                  hoveredCell={hoveredReversi}
                  onHoverCell={setHoveredReversi}
                  onPlace={(r, c) => performAction(`${r},${c}`)}
                />
              )}

              {gameState.gameType === 'dots-and-boxes' && (
                <DotsAndBoxesBoard
                  state={gameState}
                  canAct={canActNow}
                  onSelectEdge={action => performAction(action)}
                />
              )}

              {gameState.gameType === 'gomoku' && (
                <GomokuBoard
                  state={gameState}
                  canAct={canActNow}
                  onPlace={(r, c) => performAction(`${r},${c}`)}
                />
              )}

              {gameState.gameType === 'ultimate-ttt' && (
                <UltimateTTTBoard
                  state={gameState}
                  canAct={canActNow}
                  onPlace={(r, c) => performAction(`${r},${c}`)}
                />
              )}

              {gameState.gameType === 'mancala' && (
                <MancalaBoard
                  state={gameState}
                  canAct={canActNow}
                  perspective={mode === 'online' && mySeat === 'p2' ? 'p2' : 'p1'}
                  onPickPit={idx => performAction(`p:${idx}`)}
                />
              )}

              {gameState.gameType === 'tictactoe' && (
                <TicTacToeBoard
                  state={gameState}
                  canAct={canActNow}
                  onPickCell={idx => performAction(`i:${idx}`)}
                />
              )}

              {gameState.gameType === 'draw-guess' && (
                <DrawGuessBoard
                  state={gameState}
                  canAct={canActNow}
                  viewerRole={
                    mode === 'online' && (mySeat === 'p1' || mySeat === 'p2')
                      ? mySeat
                      : mode === 'ai'
                      ? humanSeat
                      : 'local'
                  }
                  p1Name={p1Display}
                  p2Name={p2Display}
                  onAction={performAction}
                />
              )}

              {gameState.gameType === 'battleship' && (
                <BattleshipBoard
                  state={gameState}
                  canAct={canActNow}
                  viewer={
                    mode === 'online' && mySeat === 'p2'
                      ? 'p2'
                      : mode === 'ai'
                      ? humanSeat
                      : mode === 'pvp'
                      ? gameState.turn
                      : 'p1'
                  }
                  isLocalPvp={mode === 'pvp'}
                  onAction={performAction}
                />
              )}

              {gameState.gameType === 'memory-match' && (
                <MemoryMatchBoard
                  state={gameState}
                  canAct={canActNow}
                  p1Name={p1Display}
                  p2Name={p2Display}
                  onFlip={idx =>
                    performAction(
                      gameState.moveCount === 0
                        ? `m:${idx}:${Math.floor(Math.random() * 900000) + 100}`
                        : `m:${idx}`
                    )
                  }
                />
              )}

              {gameState.gameType === 'dice-duel' && (
                <DiceSprintBoard
                  state={gameState}
                  canAct={canActNow}
                  p1Name={p1Display}
                  p2Name={p2Display}
                  onAction={performAction}
                />
              )}

              {isExtendedArcadeGameType(gameState.gameType) && (
                <ExtendedArcadeBoard
                  state={gameState as ExtendedArcadeState}
                  canAct={canActNow}
                  viewerRole={
                    mode === 'online'
                      ? mySeat === 'p1' || mySeat === 'p2'
                        ? mySeat
                        : 'spectator'
                      : mode === 'ai'
                      ? humanSeat
                      : 'local'
                  }
                  p1Name={p1Display}
                  p2Name={p2Display}
                  onAction={performAction}
                />
              )}

              {isBatch2ArcadeGameType(gameState.gameType) && (
                <Batch2ArcadeBoard
                  state={gameState as Batch2ArcadeState}
                  canAct={canActNow}
                  viewerRole={
                    mode === 'online'
                      ? mySeat === 'p1' || mySeat === 'p2'
                        ? mySeat
                        : 'spectator'
                      : mode === 'ai'
                      ? humanSeat
                      : 'local'
                  }
                  p1Name={p1Display}
                  p2Name={p2Display}
                  onAction={performAction}
                />
              )}
            </div>

            {/* Bottom Match Action Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs" style={{ borderColor: activeTheme.border }}>
              <div className="flex items-center gap-2 text-slate-400 flex-wrap">
                <span className="font-mono">Moves: {moves.length}</span>
                {mode === 'online' && roomCode && (
                  <span className="font-mono text-emerald-400">
                    · {connStatus === 'connected' ? 'Live Sync' : 'Syncing...'}
                  </span>
                )}
                {isGameOver && mode === 'online' && lastEloResult && (
                  <button
                    type="button"
                    onClick={() => navigateSpace('leaderboard')}
                    className="px-2.5 py-0.5 rounded-lg border font-mono font-extrabold text-[11px] flex items-center gap-1 cursor-pointer hover:brightness-110"
                    style={{
                      backgroundColor:
                        lastEloResult.myCategoryDelta >= 0
                          ? 'rgba(16, 185, 129, 0.16)'
                          : 'rgba(244, 63, 94, 0.16)',
                      borderColor:
                        lastEloResult.myCategoryDelta >= 0
                          ? 'rgba(16, 185, 129, 0.45)'
                          : 'rgba(244, 63, 94, 0.45)',
                      color: lastEloResult.myCategoryDelta >= 0 ? '#6ee7b7' : '#fda4af'
                    }}
                  >
                    <Trophy className="w-3 h-3" />
                    <span>
                      Arcade ELO: {lastEloResult.myNewCategoryElo} (
                      {lastEloResult.myCategoryDelta >= 0 ? '+' : ''}
                      {lastEloResult.myCategoryDelta})
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isGameOver && (mode !== 'online' || (roomCode && (mySeat === 'p1' || mySeat === 'p2'))) && (
                  <button
                    onClick={handleResign}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-bold cursor-pointer transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Resign</span>
                  </button>
                )}

                {isGameOver && (
                  <button
                    onClick={handleRematch}
                    disabled={Boolean(hasVotedRematch)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-black font-extrabold cursor-pointer transition-transform hover:scale-105 disabled:opacity-60"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {mode === 'online'
                        ? hasVotedRematch
                          ? `Rematch Ready (${rematchVotes.length}/2)`
                          : rematchVotes.length > 0
                          ? `Accept Rematch (${rematchVotes.length}/2)`
                          : 'Vote Rematch'
                        : 'Play Again'}
                    </span>
                  </button>
                )}

                {mode !== 'online' && !isGameOver && (
                  <button
                    onClick={() => resetLocalMatch(selectedGame, humanSeat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-slate-200 hover:bg-white/10 font-bold cursor-pointer transition-colors"
                    style={{ borderColor: activeTheme.border }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Room Codes & Mode Controls */}
          <div
            className="lg:col-span-4 rounded-2xl border p-3.5 shadow-xl flex flex-col gap-3"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border" style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}>
              <button
                onClick={() => setMode('online')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'online' ? 'text-black shadow' : 'text-slate-300 hover:text-white'
                }`}
                style={{ backgroundColor: mode === 'online' ? activeTheme.accent : undefined }}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Room Code</span>
              </button>
              <button
                onClick={() => {
                  if (roomCode) handleLeaveRoom();
                  setMode('ai');
                  resetLocalMatch(selectedGame, humanSeat);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'ai' ? 'text-black shadow' : 'text-slate-300 hover:text-white'
                }`}
                style={{ backgroundColor: mode === 'ai' ? activeTheme.accent : undefined }}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>vs Bots</span>
              </button>
              <button
                onClick={() => {
                  if (roomCode) handleLeaveRoom();
                  setMode('pvp');
                  resetLocalMatch(selectedGame, 'p1');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'pvp' ? 'text-black shadow' : 'text-slate-300 hover:text-white'
                }`}
                style={{ backgroundColor: mode === 'pvp' ? activeTheme.accent : undefined }}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Local 2P</span>
              </button>
            </div>

            {/* Online Room Code Lobby / Active Room Panel */}
            {mode === 'online' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={e => handlePlayerNameChange(e.target.value)}
                    maxLength={24}
                    placeholder="Your nickname"
                    className="w-full px-3 py-2 rounded-xl border text-xs text-white focus:outline-none"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                  />
                </div>

                {onlineError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-200 flex flex-col gap-2">
                    <span>{onlineError}</span>
                    {onlineAuthNeeded && (
                      <button
                        onClick={handleGoogleSignIn}
                        disabled={isSigningIn}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-extrabold text-xs cursor-pointer hover:bg-slate-100 self-start"
                      >
                        {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
                      </button>
                    )}
                  </div>
                )}

                {!roomCode ? (
                  <>
                    {/* Seat Preference for Create */}
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Starting Seat ({meta.name})
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['p1', 'p2', 'random'] as SeatPref[]).map(opt => (
                          <button
                            key={opt}
                            onClick={() => setSeatPref(opt)}
                            className={`py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                              seatPref === opt ? 'text-white' : 'text-slate-400 hover:text-white'
                            }`}
                            style={{
                              backgroundColor: seatPref === opt ? activeTheme.accentBadge : activeTheme.bgSecondary,
                              borderColor: seatPref === opt ? activeTheme.borderActive : activeTheme.border
                            }}
                          >
                            {opt === 'p1' ? `P1 (${meta.p1Label})` : opt === 'p2' ? `P2 (${meta.p2Label})` : 'Random'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCreateRoom(selectedGame)}
                      disabled={connStatus === 'connecting'}
                      className="w-full py-2.5 rounded-xl text-black font-extrabold text-xs shadow-lg cursor-pointer transition-transform hover:scale-[1.01] disabled:opacity-60"
                      style={{ backgroundColor: activeTheme.accent }}
                    >
                      {connStatus === 'connecting'
                        ? 'Connecting Room...'
                        : `Create ${meta.name} Room Code`}
                    </button>

                    <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: activeTheme.border }}>
                      <input
                        type="text"
                        value={joinCodeInput}
                        onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                        placeholder="Enter 6-char code"
                        maxLength={8}
                        className="flex-1 px-3 py-2 rounded-xl border text-xs font-mono uppercase tracking-widest text-white focus:outline-none"
                        style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                      />
                      <button
                        onClick={() => handleJoinRoom()}
                        disabled={connStatus === 'connecting'}
                        className="px-3.5 py-2 rounded-xl border font-bold text-xs text-white hover:bg-white/10 cursor-pointer transition-colors"
                        style={{ borderColor: activeTheme.borderActive, backgroundColor: activeTheme.accentBadge }}
                      >
                        Join
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className="p-3 rounded-xl border flex flex-col gap-2.5"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.borderActive }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active Room Code
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {players.p1 && players.p2 ? '2/2 Seated' : '1/2 Waiting'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-black/30 px-3 py-2 rounded-xl border border-white/10">
                      <span className="font-mono text-xl font-black tracking-[0.22em] text-white">
                        {roomCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(roomCode, 'code')}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          title="Copy room code"
                        >
                          {copiedType === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(inviteUrl, 'link')}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                          title="Copy invite link"
                        >
                          {copiedType === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      Works cross-device between GitHub Pages and AI Studio! Share the 6-letter code or invite link.
                    </p>

                    <button
                      onClick={handleLeaveRoom}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/15 text-xs font-bold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Leave Room</span>
                    </button>
                  </div>
                )}

                {/* Pending Direct Arcade Invites */}
                {incomingArcadeInvites.length > 0 && (
                  <div className="p-2.5 rounded-xl border border-sky-400/40 bg-sky-500/10 flex flex-col gap-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Game Invites ({incomingArcadeInvites.length})</span>
                    </div>
                    {incomingArcadeInvites.map(inv => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between gap-2 bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/10"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">
                            {(AVATAR_PRESETS.find(a => a.id === inv.fromAvatarId) || AVATAR_PRESETS[0]).icon}{' '}
                            {inv.fromName}
                          </div>
                          <div className="text-[10px] text-sky-200/80 truncate">{inv.gameTitle}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => void acceptGameInvite(inv)}
                            className="px-2.5 py-1 rounded-lg bg-sky-400 hover:bg-sky-300 text-black text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void declineGameInvite(inv)}
                            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                            title="Decline invite"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 1-Click Direct Friend Invites (No Code Needed) */}
                {(!roomCode || !(players.p1 && players.p2)) && invitableArcadePlayers.length > 0 && (
                  <div
                    className="p-2.5 rounded-xl border flex flex-col gap-1.5"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Invite Friend to {meta.name}</span>
                      <span className="font-mono text-emerald-400">
                        {invitableArcadePlayers.filter(p => p.online).length} online
                      </span>
                    </div>
                    <div className="max-h-32 overflow-y-auto flex flex-col gap-1 pr-0.5">
                      {invitableArcadePlayers.map(person => {
                        const alreadyInvited = invitedFriendUids.has(person.uid);
                        const isSendingThis = invitingFriendUid === person.uid;
                        const icon = (AVATAR_PRESETS.find(a => a.id === person.avatarId) || AVATAR_PRESETS[0]).icon;
                        return (
                          <div
                            key={person.uid}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-black/30 border border-white/5"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs shrink-0">{icon}</span>
                              <span className="text-[11px] font-bold text-white truncate">{person.name}</span>
                              {person.online && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Online now" />
                              )}
                            </div>
                            <button
                              type="button"
                              disabled={Boolean(invitingFriendUid) || alreadyInvited}
                              onClick={() => void handleInviteFriendToArcade(person)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer transition-colors disabled:opacity-65 ${
                                alreadyInvited
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'text-black hover:brightness-110'
                              }`}
                              style={!alreadyInvited ? { backgroundColor: activeTheme.accent } : undefined}
                            >
                              {alreadyInvited ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Invited</span>
                                </>
                              ) : isSendingThis ? (
                                <span>Sending...</span>
                              ) : (
                                <>
                                  <Send className="w-2.5 h-2.5" />
                                  <span>Invite</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Multi-Bot AI Opponent Selector */}
            {mode === 'ai' && (
              <div className="flex flex-col gap-2">
                {/* Active Bot Quote Card */}
                <div
                  className="p-2.5 rounded-xl border flex items-center gap-2.5"
                  style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                >
                  <div
                    className="w-9 h-9 rounded-lg border flex items-center justify-center text-lg shrink-0"
                    style={{
                      backgroundColor: `${selectedBot.accentColor}22`,
                      borderColor: `${selectedBot.accentColor}66`
                    }}
                  >
                    <span aria-hidden="true">{selectedBot.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-extrabold truncate" style={{ color: selectedBot.accentColor }}>
                        {selectedBot.name} ({selectedBot.rating})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {selectedBot.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-tight truncate mt-0.5" title={botQuote}>
                      &ldquo;{botQuote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Difficulty Tier Filter + Random Bot */}
                <div className="flex items-center gap-1">
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'easy', label: 'Beg' },
                        { id: 'medium', label: 'Club' },
                        { id: 'hard', label: 'Master' },
                        { id: 'expert', label: 'GM' }
                      ] as { id: 'all' | ArcadeBotDifficulty; label: string }[]
                    ).map(tier => {
                      const active = botTierFilter === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setBotTierFilter(tier.id)}
                          className={`py-1 px-1 rounded-lg border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate transition-colors ${
                            active ? 'text-black' : 'text-slate-400 hover:text-white'
                          }`}
                          style={{
                            backgroundColor: active ? activeTheme.accent : activeTheme.bgSecondary,
                            borderColor: active ? activeTheme.accent : activeTheme.border
                          }}
                        >
                          {tier.label}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const pool = filteredBots.filter(b => b.id !== selectedBot.id);
                      const source = pool.length > 0 ? pool : ARCADE_BOTS;
                      const randomPick = source[Math.floor(Math.random() * source.length)];
                      handleSelectBot(randomPick);
                    }}
                    className="p-1.5 rounded-lg border text-slate-200 hover:bg-white/10 cursor-pointer shrink-0"
                    style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                    title="Pick a random AI bot"
                  >
                    <Shuffle className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                  </button>
                </div>

                {/* Scrollable Bot Roster */}
                <div className="max-h-40 overflow-y-auto pr-0.5 flex flex-col gap-1">
                  {filteredBots.map(bot => {
                    const active = bot.id === selectedBot.id;
                    return (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => handleSelectBot(bot)}
                        className={`w-full px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          active ? 'text-white shadow-sm' : 'text-slate-300 hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: active ? activeTheme.accentBadge : activeTheme.bgSecondary,
                          borderColor: active ? bot.accentColor : activeTheme.border
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg border flex items-center justify-center text-sm shrink-0"
                          style={{
                            backgroundColor: `${bot.accentColor}22`,
                            borderColor: `${bot.accentColor}55`
                          }}
                        >
                          <span aria-hidden="true">{bot.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11px] font-extrabold truncate">{bot.name}</span>
                            <span
                              className="text-[10px] font-mono font-bold tabular-nums shrink-0"
                              style={{ color: bot.accentColor }}
                            >
                              {bot.rating} · {DIFFICULTY_LABELS[bot.difficulty]}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{bot.tagline}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Play As Switch */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => resetLocalMatch(selectedGame, 'p1')}
                    className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      humanSeat === 'p1' ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: humanSeat === 'p1' ? activeTheme.accentBadge : activeTheme.bgSecondary,
                      borderColor: humanSeat === 'p1' ? activeTheme.borderActive : activeTheme.border
                    }}
                  >
                    Play 1st ({meta.p1Label})
                  </button>
                  <button
                    onClick={() => resetLocalMatch(selectedGame, 'p2')}
                    className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      humanSeat === 'p2' ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: humanSeat === 'p2' ? activeTheme.accentBadge : activeTheme.bgSecondary,
                      borderColor: humanSeat === 'p2' ? activeTheme.borderActive : activeTheme.border
                    }}
                  >
                    Play 2nd ({meta.p2Label})
                  </button>
                </div>
              </div>
            )}

            {/* Quick Rules Summary Card */}
            <div
              className="p-3 rounded-xl border flex flex-col gap-1.5"
              style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>{meta.emoji}</span>
                  <span>{meta.name}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">{meta.avgTime}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{meta.rulesSummary}</p>
            </div>

            {effectiveWinner && (
              <div className="p-3 rounded-xl border border-amber-400/40 bg-amber-500/10 flex items-center gap-2.5 text-amber-200">
                <Trophy className="w-5 h-5 shrink-0 text-amber-400" />
                <div className="text-xs font-bold">{statusHeadline}</div>
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

// ---------------- GAME BOARDS ----------------

const Connect4Board: React.FC<{
  state: Connect4State;
  canAct: boolean;
  hoveredCol: number | null;
  onHoverCol: (c: number | null) => void;
  onDrop: (col: number) => void;
}> = ({ state, canAct, hoveredCol, onHoverCol, onDrop }) => {
  const winSet = useMemo(() => {
    const s = new Set<string>();
    state.winLine?.forEach(([r, c]) => s.add(`${r},${c}`));
    return s;
  }, [state.winLine]);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[440px]">
      {/* Hover drop preview row */}
      <div className="grid grid-cols-7 gap-2 px-3 w-full">
        {[0, 1, 2, 3, 4, 5, 6].map(col => {
          const isOpen = state.board[0][col] === null;
          const showPreview = canAct && isOpen && hoveredCol === col;
          return (
            <div key={col} className="h-6 flex items-center justify-center">
              {showPreview && (
                <div
                  className={`w-6 h-6 rounded-full shadow-lg animate-bounce ${
                    state.turn === 'p1' ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Rack */}
      <div className="bg-blue-700/90 border-2 border-blue-500/60 p-2.5 sm:p-3 rounded-2xl shadow-2xl w-full">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {state.board.map((row, r) =>
            row.map((cell, c) => {
              const colOpen = state.board[0][c] === null;
              const isWin = winSet.has(`${r},${c}`);
              const isLast = state.lastCell?.[0] === r && state.lastCell?.[1] === c;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!canAct || !colOpen}
                  onMouseEnter={() => onHoverCol(c)}
                  onMouseLeave={() => onHoverCol(null)}
                  onClick={() => onDrop(c)}
                  aria-label={`Column ${c + 1}`}
                  className={`aspect-square rounded-full flex items-center justify-center transition-transform ${
                    canAct && colOpen ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                  } ${
                    cell === 'p1'
                      ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-inner'
                      : cell === 'p2'
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner'
                      : 'bg-slate-950/90 shadow-inner'
                  } ${isWin ? 'ring-4 ring-white animate-pulse' : isLast ? 'ring-2 ring-white/70' : ''}`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const CheckersBoard: React.FC<{
  state: CheckersState;
  canAct: boolean;
  flipped: boolean;
  selectedFrom: [number, number] | null;
  onSelectFrom: (sq: [number, number] | null) => void;
  onMove: (action: string) => void;
}> = ({ state, canAct, flipped, selectedFrom, onSelectFrom, onMove }) => {
  const legal = useMemo(() => (canAct ? getCheckersLegalMoves(state) : []), [canAct, state]);

  const activeFrom = state.chainFrom || selectedFrom;
  const targetsForSelected = useMemo(() => {
    if (!activeFrom) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const m of legal) {
      if (m.from[0] === activeFrom[0] && m.from[1] === activeFrom[1]) {
        map.set(`${m.to[0]},${m.to[1]}`, m.action);
      }
    }
    return map;
  }, [activeFrom, legal]);

  const movableSources = useMemo(() => {
    const s = new Set<string>();
    for (const m of legal) s.add(`${m.from[0]},${m.from[1]}`);
    return s;
  }, [legal]);

  const indices = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="w-full max-w-[400px] aspect-square rounded-xl overflow-hidden border-2 border-amber-900/60 shadow-2xl grid grid-cols-8 grid-rows-8">
      {indices.map(r =>
        indices.map(c => {
          const isDark = (r + c) % 2 === 1;
          const piece = state.board[r][c];
          const key = `${r},${c}`;
          const targetAction = targetsForSelected.get(key);
          const isSelected = activeFrom?.[0] === r && activeFrom?.[1] === c;
          const isLastFrom = state.lastMove?.[0][0] === r && state.lastMove?.[0][1] === c;
          const isLastTo = state.lastMove?.[1][0] === r && state.lastMove?.[1][1] === c;
          const canSelectPiece = canAct && movableSources.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!canAct) return;
                if (targetAction) {
                  onMove(targetAction);
                  return;
                }
                if (!state.chainFrom && canSelectPiece) {
                  onSelectFrom(isSelected ? null : [r, c]);
                }
              }}
              className={`relative flex items-center justify-center ${
                isDark ? 'bg-[#7c4d2b]' : 'bg-[#ecd9b9]'
              } ${isLastFrom || isLastTo ? 'ring-inset ring-2 ring-amber-300/70' : ''} ${
                canSelectPiece || targetAction ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {targetAction && (
                <div className="w-4 h-4 rounded-full bg-emerald-400/80 ring-2 ring-white shadow-md z-10" />
              )}
              {piece && (
                <div
                  className={`w-[78%] h-[78%] rounded-full flex items-center justify-center shadow-lg border-2 transition-transform ${
                    piece.owner === 'p1'
                      ? 'bg-gradient-to-br from-rose-500 to-rose-700 border-rose-300/80'
                      : 'bg-gradient-to-br from-slate-100 to-slate-300 border-slate-500/70'
                  } ${isSelected ? 'scale-110 ring-2 ring-emerald-400' : ''}`}
                >
                  {piece.king && (
                    <Crown
                      className={`w-4 h-4 ${
                        piece.owner === 'p1' ? 'text-amber-300' : 'text-amber-600'
                      }`}
                    />
                  )}
                </div>
              )}
            </button>
          );
        })
      )}
    </div>
  );
};

const ReversiBoard: React.FC<{
  state: ReversiState;
  canAct: boolean;
  hoveredCell: [number, number] | null;
  onHoverCell: (cell: [number, number] | null) => void;
  onPlace: (r: number, c: number) => void;
}> = ({ state, canAct, hoveredCell, onHoverCell, onPlace }) => {
  const validMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!canAct) return map;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const flips = getReversiFlips(state.board, r, c, state.turn);
        if (flips.length > 0) map.set(`${r},${c}`, flips.length);
      }
    }
    return map;
  }, [canAct, state]);

  return (
    <div className="flex flex-col items-center gap-2.5 w-full max-w-[400px]">
      <div className="flex items-center justify-between w-full px-2 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-white/40" />
          <span>Dark: {state.counts.p1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Light: {state.counts.p2}</span>
          <span className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-slate-400" />
        </div>
      </div>

      <div className="w-full aspect-square bg-emerald-800 border-2 border-emerald-500/40 rounded-xl p-1 grid grid-cols-8 grid-rows-8 gap-0.5 shadow-2xl">
        {state.board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const flipCount = validMap.get(key) || 0;
            const isValid = flipCount > 0;
            const isHovered = hoveredCell?.[0] === r && hoveredCell?.[1] === c;
            const isLast = state.lastCell?.[0] === r && state.lastCell?.[1] === c;

            return (
              <button
                key={key}
                type="button"
                disabled={!isValid}
                onMouseEnter={() => onHoverCell([r, c])}
                onMouseLeave={() => onHoverCell(null)}
                onClick={() => onPlace(r, c)}
                className={`relative bg-emerald-700/90 rounded-sm flex items-center justify-center ${
                  isValid ? 'cursor-pointer hover:bg-emerald-600' : 'cursor-default'
                }`}
              >
                {cell && (
                  <div
                    className={`w-[78%] h-[78%] rounded-full shadow-md transition-all ${
                      cell === 'p1'
                        ? 'bg-gradient-to-br from-slate-800 to-black border border-white/20'
                        : 'bg-gradient-to-br from-white to-slate-200 border border-slate-400'
                    } ${isLast ? 'ring-2 ring-amber-300' : ''}`}
                  />
                )}
                {isValid && (
                  <span
                    className={`text-[10px] font-extrabold rounded-full flex items-center justify-center ${
                      isHovered
                        ? 'w-5 h-5 bg-amber-300 text-black'
                        : 'w-2.5 h-2.5 bg-white/45 text-transparent'
                    }`}
                  >
                    {isHovered ? `+${flipCount}` : ''}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const DotsAndBoxesBoard: React.FC<{
  state: DotsAndBoxesState;
  canAct: boolean;
  onSelectEdge: (action: string) => void;
}> = ({ state, canAct, onSelectEdge }) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[380px]">
      <div className="flex items-center justify-between w-full px-3 text-xs font-extrabold">
        <span className="text-sky-400">P1 Boxes: {state.scores.p1}</span>
        <span className="text-slate-400 font-mono">{state.scores.p1 + state.scores.p2}/16 claimed</span>
        <span className="text-amber-400">P2 Boxes: {state.scores.p2}</span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 shadow-2xl">
        <div
          className="grid items-center justify-items-center"
          style={{
            gridTemplateColumns: '16px 58px 16px 58px 16px 58px 16px 58px 16px',
            gridTemplateRows: '16px 58px 16px 58px 16px 58px 16px 58px 16px'
          }}
        >
          {Array.from({ length: 9 }).map((_, gr) =>
            Array.from({ length: 9 }).map((__, gc) => {
              const isDot = gr % 2 === 0 && gc % 2 === 0;
              const isHoriz = gr % 2 === 0 && gc % 2 === 1;
              const isVert = gr % 2 === 1 && gc % 2 === 0;

              if (isDot) {
                return <div key={`${gr}-${gc}`} className="w-3.5 h-3.5 rounded-full bg-slate-200 shadow" />;
              }

              if (isHoriz) {
                const r = gr / 2;
                const c = (gc - 1) / 2;
                const owner = state.hLines[r][c];
                const act = `h:${r},${c}`;
                const isLast = state.lastEdge === act;
                return (
                  <button
                    key={`${gr}-${gc}`}
                    type="button"
                    disabled={!canAct || owner !== null}
                    onClick={() => onSelectEdge(act)}
                    aria-label={`Horizontal line ${r},${c}`}
                    className={`w-full h-6 flex items-center justify-center group ${
                      canAct && !owner ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`w-full h-2.5 rounded-full transition-all ${
                        owner === 'p1'
                          ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                          : owner === 'p2'
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : canAct
                          ? 'bg-white/10 group-hover:bg-white/45'
                          : 'bg-white/10'
                      } ${isLast ? 'ring-2 ring-white' : ''}`}
                    />
                  </button>
                );
              }

              if (isVert) {
                const r = (gr - 1) / 2;
                const c = gc / 2;
                const owner = state.vLines[r][c];
                const act = `v:${r},${c}`;
                const isLast = state.lastEdge === act;
                return (
                  <button
                    key={`${gr}-${gc}`}
                    type="button"
                    disabled={!canAct || owner !== null}
                    onClick={() => onSelectEdge(act)}
                    aria-label={`Vertical line ${r},${c}`}
                    className={`w-6 h-full flex items-center justify-center group ${
                      canAct && !owner ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`h-full w-2.5 rounded-full transition-all ${
                        owner === 'p1'
                          ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                          : owner === 'p2'
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : canAct
                          ? 'bg-white/10 group-hover:bg-white/45'
                          : 'bg-white/10'
                      } ${isLast ? 'ring-2 ring-white' : ''}`}
                    />
                  </button>
                );
              }

              // Box cell
              const br = (gr - 1) / 2;
              const bc = (gc - 1) / 2;
              const owner = state.boxes[br][bc];
              return (
                <div
                  key={`${gr}-${gc}`}
                  className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-black transition-all ${
                    owner === 'p1'
                      ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50'
                      : owner === 'p2'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                      : 'bg-transparent'
                  }`}
                >
                  {owner === 'p1' ? 'P1' : owner === 'p2' ? 'P2' : ''}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const GomokuBoard: React.FC<{
  state: GomokuState;
  canAct: boolean;
  onPlace: (r: number, c: number) => void;
}> = ({ state, canAct, onPlace }) => {
  const winSet = useMemo(() => {
    const s = new Set<string>();
    state.winLine?.forEach(([r, c]) => s.add(`${r},${c}`));
    return s;
  }, [state.winLine]);

  return (
    <div className="w-full max-w-[420px] aspect-square bg-[#d9b37c] border-2 border-[#8c6239] rounded-xl p-1.5 shadow-2xl grid grid-cols-15 grid-rows-15">
      {state.board.map((row, r) =>
        row.map((cell, c) => {
          const isLast = state.lastCell?.[0] === r && state.lastCell?.[1] === c;
          const isWin = winSet.has(`${r},${c}`);
          const isStar =
            (r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11);

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              disabled={!canAct || cell !== null}
              onClick={() => onPlace(r, c)}
              className={`relative flex items-center justify-center ${
                canAct && !cell ? 'cursor-pointer hover:bg-black/10' : 'cursor-default'
              }`}
            >
              {/* Grid lines */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#6e4b26]/55 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#6e4b26]/55 pointer-events-none" />
              {isStar && !cell && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#523519] z-0" />
              )}
              {cell && (
                <div
                  className={`w-[84%] h-[84%] rounded-full z-10 shadow-md ${
                    cell === 'p1'
                      ? 'bg-gradient-to-br from-slate-700 to-black border border-slate-600'
                      : 'bg-gradient-to-br from-white to-slate-200 border border-slate-400'
                  } ${isWin ? 'ring-2 ring-emerald-400' : isLast ? 'ring-2 ring-rose-500' : ''}`}
                />
              )}
            </button>
          );
        })
      )}
    </div>
  );
};

const UltimateTTTBoard: React.FC<{
  state: UltimateTTTState;
  canAct: boolean;
  onPlace: (r: number, c: number) => void;
}> = ({ state, canAct, onPlace }) => {
  return (
    <div className="w-full max-w-[400px] aspect-square grid grid-cols-3 grid-rows-3 gap-2 p-2 rounded-2xl bg-slate-950/80 border border-white/10 shadow-2xl">
      {Array.from({ length: 9 }).map((_, miniIdx) => {
        const miniR = Math.floor(miniIdx / 3);
        const miniC = miniIdx % 3;
        const miniWin = state.miniWinners[miniIdx];
        const isMetaWin = state.winMetaLine?.includes(miniIdx);
        const isTarget =
          !state.winner &&
          miniWin === null &&
          (state.activeMini === null || state.activeMini === miniIdx);

        return (
          <div
            key={miniIdx}
            className={`relative rounded-xl p-1 grid grid-cols-3 grid-rows-3 gap-1 border transition-all ${
              isMetaWin
                ? 'border-emerald-400 bg-emerald-500/20'
                : isTarget
                ? 'border-pink-400/80 bg-pink-500/10 ring-1 ring-pink-400/50'
                : 'border-white/10 bg-white/5 opacity-80'
            }`}
          >
            {Array.from({ length: 9 }).map((__, subIdx) => {
              const sr = Math.floor(subIdx / 3);
              const sc = subIdx % 3;
              const r = miniR * 3 + sr;
              const c = miniC * 3 + sc;
              const cell = state.cells[r][c];
              const isLast = state.lastCell?.[0] === r && state.lastCell?.[1] === c;
              const legal = canAct && isTarget && cell === null;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  disabled={!legal}
                  onClick={() => onPlace(r, c)}
                  className={`rounded flex items-center justify-center text-xs sm:text-sm font-black transition-colors ${
                    legal
                      ? 'bg-slate-900/90 hover:bg-slate-800 cursor-pointer'
                      : 'bg-slate-900/50 cursor-default'
                  } ${isLast ? 'ring-1 ring-white/70' : ''}`}
                >
                  {cell === 'p1' && <span className="text-pink-400">X</span>}
                  {cell === 'p2' && <span className="text-amber-400">O</span>}
                </button>
              );
            })}

            {miniWin && (
              <div className="absolute inset-0 rounded-xl bg-slate-950/75 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <span
                  className={`text-4xl font-black ${
                    miniWin === 'p1'
                      ? 'text-pink-400'
                      : miniWin === 'p2'
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}
                >
                  {miniWin === 'p1' ? 'X' : miniWin === 'p2' ? 'O' : '—'}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MancalaBoard: React.FC<{
  state: MancalaState;
  canAct: boolean;
  perspective: ArcadePlayer;
  onPickPit: (idx: number) => void;
}> = ({ state, canAct, perspective, onPickPit }) => {
  // Bottom row is always the viewing perspective's pits, going left -> right counter-clockwise toward right store
  const bottomPits = perspective === 'p1' ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
  const topPits = perspective === 'p1' ? [12, 11, 10, 9, 8, 7] : [5, 4, 3, 2, 1, 0];
  const rightStore = perspective === 'p1' ? 6 : 13;
  const leftStore = perspective === 'p1' ? 13 : 6;

  const isOwnedByTurn = (idx: number) =>
    (state.turn === 'p1' && idx >= 0 && idx <= 5) ||
    (state.turn === 'p2' && idx >= 7 && idx <= 12);

  return (
    <div className="w-full max-w-[540px] bg-gradient-to-b from-[#6b4423] to-[#4e3018] border-2 border-[#8c5a32] rounded-3xl p-3 sm:p-4 shadow-2xl">
      <div className="grid grid-cols-8 gap-2 items-stretch">
        {/* Left Store */}
        <div className="row-span-2 rounded-2xl bg-black/35 border border-amber-200/15 flex flex-col items-center justify-center p-2 min-h-[140px]">
          <span className="text-[10px] font-bold uppercase text-amber-200/70 mb-1">
            {perspective === 'p1' ? 'P2' : 'P1'}
          </span>
          <span className="text-2xl font-black font-mono text-white">{state.pits[leftStore]}</span>
          <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-[36px]">
            {Array.from({ length: Math.min(12, state.pits[leftStore]) }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-teal-300/80" />
            ))}
          </div>
        </div>

        {/* Top Row (6 pits) */}
        {topPits.map(idx => {
          const seeds = state.pits[idx];
          const clickable = canAct && isOwnedByTurn(idx) && seeds > 0;
          const isLast = state.lastPit === idx;
          return (
            <button
              key={idx}
              type="button"
              disabled={!clickable}
              onClick={() => onPickPit(idx)}
              className={`rounded-2xl bg-black/40 border p-1.5 flex flex-col items-center justify-center min-h-[68px] transition-all ${
                clickable
                  ? 'border-amber-300/60 hover:bg-black/25 hover:scale-105 cursor-pointer'
                  : 'border-amber-200/10 cursor-default'
              } ${isLast ? 'ring-2 ring-emerald-400' : ''}`}
            >
              <span className="text-base font-black font-mono text-white">{seeds}</span>
              <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-[30px]">
                {Array.from({ length: Math.min(8, seeds) }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-300/80" />
                ))}
              </div>
            </button>
          );
        })}

        {/* Right Store */}
        <div className="row-span-2 rounded-2xl bg-black/35 border border-emerald-300/30 flex flex-col items-center justify-center p-2 min-h-[140px]">
          <span className="text-[10px] font-bold uppercase text-emerald-300 mb-1">
            {perspective === 'p1' ? 'P1' : 'P2'}
          </span>
          <span className="text-2xl font-black font-mono text-white">{state.pits[rightStore]}</span>
          <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-[36px]">
            {Array.from({ length: Math.min(12, state.pits[rightStore]) }).map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-300/80" />
            ))}
          </div>
        </div>

        {/* Bottom Row (6 pits) */}
        {bottomPits.map(idx => {
          const seeds = state.pits[idx];
          const clickable = canAct && isOwnedByTurn(idx) && seeds > 0;
          const isLast = state.lastPit === idx;
          return (
            <button
              key={idx}
              type="button"
              disabled={!clickable}
              onClick={() => onPickPit(idx)}
              className={`rounded-2xl bg-black/40 border p-1.5 flex flex-col items-center justify-center min-h-[68px] transition-all ${
                clickable
                  ? 'border-emerald-400/70 hover:bg-black/25 hover:scale-105 cursor-pointer'
                  : 'border-amber-200/10 cursor-default'
              } ${isLast ? 'ring-2 ring-emerald-400' : ''}`}
            >
              <span className="text-base font-black font-mono text-white">{seeds}</span>
              <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-[30px]">
                {Array.from({ length: Math.min(8, seeds) }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-300/80" />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TicTacToeBoard: React.FC<{
  state: TicTacToeState;
  canAct: boolean;
  onPickCell: (idx: number) => void;
}> = ({ state, canAct, onPickCell }) => {
  return (
    <div className="w-full max-w-[300px] aspect-square grid grid-cols-3 grid-rows-3 gap-2.5 p-3 rounded-2xl bg-slate-950/75 border border-white/10 shadow-2xl">
      {state.board.map((cell, idx) => {
        const isWin = state.winLine?.includes(idx);
        const clickable = canAct && cell === null;
        return (
          <button
            key={idx}
            type="button"
            disabled={!clickable}
            onClick={() => onPickCell(idx)}
            className={`rounded-xl border flex items-center justify-center text-4xl font-black transition-all ${
              isWin
                ? 'bg-emerald-500/25 border-emerald-400 scale-105'
                : clickable
                ? 'bg-slate-900/90 border-white/15 hover:bg-slate-800 cursor-pointer'
                : 'bg-slate-900/60 border-white/10 cursor-default'
            }`}
          >
            {cell === 'p1' && <span className="text-emerald-400">X</span>}
            {cell === 'p2' && <span className="text-amber-400">O</span>}
          </button>
        );
      })}
    </div>
  );
};

// ---------------- NEW MINIGAME BOARDS ----------------

const DrawGuessBoard: React.FC<{
  state: DrawGuessState;
  canAct: boolean;
  viewerRole: ArcadePlayer | 'local';
  p1Name: string;
  p2Name: string;
  onAction: (act: string) => void;
}> = ({ state, canAct, viewerRole, p1Name, p2Name, onAction }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(1);
  const [customWord, setCustomWord] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [hideLocalWord, setHideLocalWord] = useState(false);
  const activePtsRef = useRef<[number, number][]>([]);
  const isDrawingRef = useRef(false);

  const isDrawerViewer = viewerRole === 'local' ? state.turn === state.drawer : viewerRole === state.drawer;
  const isGuesserViewer = viewerRole === 'local' ? state.turn === state.guesser : viewerRole === state.guesser;
  const canDrawOnCanvas = canAct && state.phase === 'draw' && isDrawerViewer;

  const drawerName = state.drawer === 'p1' ? p1Name : p2Name;
  const guesserName = state.guesser === 'p1' ? p1Name : p2Name;

  const renderStrokes = useCallback((livePts?: [number, number][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawPath = (stroke: DrawStroke) => {
      if (stroke.pts.length === 0) return;
      ctx.save();
      ctx.strokeStyle = DRAW_COLORS[stroke.colorIdx] || '#0f172a';
      ctx.fillStyle = DRAW_COLORS[stroke.colorIdx] || '#0f172a';
      ctx.lineWidth = DRAW_BRUSH_SIZES[stroke.sizeIdx] || 9;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (stroke.pts.length === 1) {
        const [x, y] = stroke.pts[0];
        ctx.beginPath();
        ctx.arc(x * 2, y * 2, (ctx.lineWidth || 6) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.pts[0][0] * 2, stroke.pts[0][1] * 2);
        for (let i = 1; i < stroke.pts.length; i++) {
          ctx.lineTo(stroke.pts[i][0] * 2, stroke.pts[i][1] * 2);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    for (const s of state.strokes) {
      drawPath(s);
    }
    if (livePts && livePts.length > 0) {
      drawPath({ colorIdx: selectedColor, sizeIdx: selectedSize, pts: livePts });
    }
  }, [state.strokes, selectedColor, selectedSize]);

  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  const toLogicalPoint = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / Math.max(1, rect.width);
    const ry = (e.clientY - rect.top) / Math.max(1, rect.height);
    return [
      Math.max(0, Math.min(200, Math.round(rx * 200))),
      Math.max(0, Math.min(150, Math.round(ry * 150)))
    ];
  };

  const commitActiveStroke = () => {
    const pts = activePtsRef.current;
    isDrawingRef.current = false;
    activePtsRef.current = [];
    if (pts.length === 0) return;

    // Split long strokes safely into <= 65-point chunks so every action stays well inside size limit
    const CHUNK = 65;
    if (pts.length <= CHUNK) {
      onAction(serializeDrawStrokeAction({ colorIdx: selectedColor, sizeIdx: selectedSize, pts }));
    } else {
      for (let i = 0; i < pts.length; i += CHUNK - 1) {
        const slice = pts.slice(i, i + CHUNK);
        if (slice.length > 0) {
          onAction(serializeDrawStrokeAction({ colorIdx: selectedColor, sizeIdx: selectedSize, pts: slice }));
        }
      }
    }
  };

  const maskedWord = state.word
    ? state.word
        .split('')
        .map(ch => (ch === ' ' ? '  ' : '_'))
        .join(' ')
    : '';

  return (
    <div className="w-full max-w-[520px] flex flex-col gap-2.5">
      {/* Round & Score Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs">
        <span className="font-extrabold text-pink-300 font-mono">
          Round {state.round}/{state.maxRounds}
        </span>
        <div className="flex items-center gap-3 font-mono font-bold">
          <span className="text-rose-300">{p1Name}: {state.scores.p1}</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300">{p2Name}: {state.scores.p2}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-300">
          {state.phase === 'pick'
            ? `🎨 ${drawerName} picking word`
            : state.phase === 'draw'
            ? `✏️ ${drawerName} drawing`
            : `💬 ${guesserName} guessing`}
        </span>
      </div>

      {/* Previous Round Outcome Banner */}
      {state.lastRoundResult && (
        <div
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            state.lastRoundResult.guessed
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
              : 'bg-slate-800/80 border-white/10 text-slate-300'
          }`}
        >
          <span>
            Round {state.lastRoundResult.round}: word was &ldquo;{state.lastRoundResult.word.toUpperCase()}&rdquo;
          </span>
          <span className="font-mono">
            {state.lastRoundResult.guessed ? `+${state.lastRoundResult.points} pts!` : 'Missed (0 pts)'}
          </span>
        </div>
      )}

      {/* Phase 1: Word Selection */}
      {state.phase === 'pick' ? (
        <div className="p-4 rounded-2xl bg-slate-950/75 border border-white/10 flex flex-col items-center gap-3 text-center">
          {canAct && isDrawerViewer ? (
            <>
              <div className="text-sm font-extrabold text-white">
                Choose a secret word to draw for {guesserName}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {state.wordChoices.map(word => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => onAction(`dw:${word}`)}
                    className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/50 text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer transition-transform hover:scale-105"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-sm pt-1">
                {state.rerollCount < 3 && (
                  <button
                    type="button"
                    onClick={() => onAction('dr')}
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>New Words</span>
                  </button>
                )}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const clean = customWord.toLowerCase().trim().replace(/[^a-z ]/g, '').trim();
                    if (clean.length >= 2) {
                      onAction(`dw:${clean}`);
                      setCustomWord('');
                    }
                  }}
                  className="flex items-center gap-1.5 flex-1 min-w-[180px]"
                >
                  <input
                    type="text"
                    maxLength={20}
                    value={customWord}
                    onChange={e => setCustomWord(e.target.value)}
                    placeholder="Or type custom word..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-white/15 bg-black/40 text-xs text-white focus:outline-none focus:border-pink-400"
                  />
                  <button
                    type="submit"
                    disabled={customWord.trim().length < 2}
                    className="px-2.5 py-1.5 rounded-lg bg-pink-400 text-black text-xs font-extrabold cursor-pointer disabled:opacity-40"
                  >
                    Draw
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center gap-2">
              <span className="text-3xl">🎨</span>
              <div className="text-sm font-extrabold text-white">
                Waiting for {drawerName} to pick a word...
              </div>
              <div className="text-xs text-slate-400">
                Get ready to guess as soon as they sketch!
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Active Secret Word / Hint Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/75 border border-white/10">
            {isDrawerViewer && state.word ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-slate-400">Your Word:</span>
                <span className="text-sm font-black tracking-widest uppercase text-pink-300">
                  {viewerRole === 'local' && hideLocalWord ? '••••••' : state.word}
                </span>
                {viewerRole === 'local' && (
                  <button
                    type="button"
                    onClick={() => setHideLocalWord(h => !h)}
                    className="p-1 rounded bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    title="Hide/Show secret word for Local 2P"
                  >
                    {hideLocalWord ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-slate-400">Clue:</span>
                <span className="font-mono text-sm font-black tracking-widest text-amber-300">
                  {maskedWord}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({(state.word || '').replace(/ /g, '').length} letters)
                </span>
              </div>
            )}

            <span className="text-[11px] font-mono text-slate-400">
              Strokes: {state.strokes.length}
            </span>
          </div>

          {/* Drawing Canvas */}
          <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#f8fafc] shadow-2xl">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              onPointerDown={e => {
                if (!canDrawOnCanvas) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                isDrawingRef.current = true;
                const pt = toLogicalPoint(e);
                activePtsRef.current = [pt];
                renderStrokes(activePtsRef.current);
              }}
              onPointerMove={e => {
                if (!canDrawOnCanvas || !isDrawingRef.current) return;
                const pt = toLogicalPoint(e);
                const prev = activePtsRef.current[activePtsRef.current.length - 1];
                if (!prev || Math.hypot(pt[0] - prev[0], pt[1] - prev[1]) >= 2) {
                  activePtsRef.current.push(pt);
                  renderStrokes(activePtsRef.current);
                }
              }}
              onPointerUp={() => {
                if (isDrawingRef.current) commitActiveStroke();
              }}
              onPointerCancel={() => {
                if (isDrawingRef.current) commitActiveStroke();
              }}
              className={`w-full aspect-[4/3] block touch-none ${
                canDrawOnCanvas ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />
          </div>

          {/* Drawer Palette & Finish Sketch Controls */}
          {canDrawOnCanvas && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              <div className="flex items-center gap-1.5 flex-wrap">
                {DRAW_COLORS.map((hex, idx) => {
                  const isEraser = idx === 9;
                  const active = selectedColor === idx;
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setSelectedColor(idx)}
                      aria-label={isEraser ? 'Eraser' : `Color ${idx + 1}`}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform ${
                        active ? 'scale-115 ring-2 ring-white border-black' : 'border-white/30'
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {isEraser && <Eraser className="w-3 h-3 text-slate-900" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                {DRAW_BRUSH_SIZES.map((sz, idx) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(idx)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center cursor-pointer ${
                      selectedSize === idx
                        ? 'border-pink-400 bg-pink-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                    title={`Brush size ${['Small', 'Medium', 'Large'][idx]}`}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{ width: idx === 0 ? 4 : idx === 1 ? 8 : 13, height: idx === 0 ? 4 : idx === 1 ? 8 : 13 }}
                    />
                  </button>
                ))}

                <button
                  type="button"
                  disabled={state.strokes.length === 0}
                  onClick={() => onAction('du')}
                  className="px-2 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 cursor-pointer disabled:opacity-40"
                  title="Undo last stroke"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={state.strokes.length === 0}
                  onClick={() => onAction('dc')}
                  className="px-2 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 cursor-pointer disabled:opacity-40"
                  title="Clear canvas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={state.strokes.length === 0}
                  onClick={() => onAction('dp')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-extrabold cursor-pointer disabled:opacity-40 whitespace-nowrap"
                >
                  Ready to Guess!
                </button>
              </div>
            </div>
          )}

          {/* Guesser Controls & Past Guesses */}
          {state.phase === 'guess' && (
            <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-white/10">
              {state.guesses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {state.guesses.map((g, idx) => (
                    <span
                      key={`${g.text}-${idx}`}
                      className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-400/30 text-[11px] font-bold text-rose-200"
                    >
                      ✗ {g.text} {g.hint ? `· ${g.hint}` : ''}
                    </span>
                  ))}
                </div>
              )}

              {canAct && isGuesserViewer ? (
                <div className="flex flex-wrap items-center gap-2">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const clean = guessInput.toLowerCase().trim().replace(/[^a-z ]/g, '').trim();
                      if (clean) {
                        onAction(`dg:${clean}`);
                        setGuessInput('');
                      }
                    }}
                    className="flex items-center gap-1.5 flex-1 min-w-[200px]"
                  >
                    <input
                      type="text"
                      maxLength={24}
                      value={guessInput}
                      onChange={e => setGuessInput(e.target.value)}
                      placeholder={`Guess (${3 - state.guesses.length} tries left)...`}
                      className="flex-1 px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="submit"
                      disabled={!guessInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-extrabold cursor-pointer disabled:opacity-40"
                    >
                      Guess
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => onAction('dn')}
                    className="px-2.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    More Drawing
                  </button>
                  <button
                    type="button"
                    onClick={() => onAction('dq')}
                    className="px-2.5 py-2 rounded-xl border border-rose-400/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-200 cursor-pointer whitespace-nowrap"
                  >
                    Skip Round
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-300 font-semibold text-center py-1">
                  Waiting for {guesserName} to guess ({3 - state.guesses.length} tries left)...
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const BattleshipBoard: React.FC<{
  state: BattleshipState;
  canAct: boolean;
  viewer: ArcadePlayer;
  isLocalPvp: boolean;
  onAction: (act: string) => void;
}> = ({ state, canAct, viewer, isLocalPvp, onAction }) => {
  const [draftFleet, setDraftFleet] = useState<BattleshipShipSpec[]>(() =>
    generateRandomBattleshipFleet()
  );
  const [selectedShipIdx, setSelectedShipIdx] = useState(0);
  const [placeDir, setPlaceDir] = useState<'h' | 'v'>('h');
  const [showLocalOwnFleet, setShowLocalOwnFleet] = useState(false);

  const opp: ArcadePlayer = viewer === 'p1' ? 'p2' : 'p1';
  const myFleet = state.fleets[viewer];

  const draftCellMap = useMemo(() => {
    const map = new Map<string, number>();
    draftFleet.forEach((s, idx) => {
      getShipCells(s).forEach(([r, c]) => map.set(`${r},${c}`, idx));
    });
    return map;
  }, [draftFleet]);

  const myFleetCellSet = useMemo(() => {
    const set = new Set<string>();
    (myFleet || []).forEach(s => {
      getShipCells(s).forEach(([r, c]) => set.add(`${r},${c}`));
    });
    return set;
  }, [myFleet]);

  const handlePlaceSelectedShip = (r: number, c: number) => {
    const size = BATTLESHIP_SIZES[selectedShipIdx];
    const cand: BattleshipShipSpec = { r, c, dir: placeDir, size };
    const next = draftFleet.map((s, idx) => (idx === selectedShipIdx ? cand : s));
    if (validateBattleshipFleet(next)) {
      setDraftFleet(next);
      setSelectedShipIdx(idx => (idx + 1) % BATTLESHIP_SIZES.length);
    }
  };

  if (state.phase === 'setup') {
    const iNeedToPlace = myFleet === null && canAct;
    return (
      <div className="w-full max-w-[440px] flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-sky-300">
            <Anchor className="w-4 h-4" />
            <span>{iNeedToPlace ? `Place Your Fleet (${state.turn.toUpperCase()})` : 'Waiting for opponent fleet...'}</span>
          </span>
          <span className="font-mono text-slate-400">Ships: 4, 3, 2, 2</span>
        </div>

        {iNeedToPlace ? (
          <>
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
              {BATTLESHIP_SIZES.map((sz, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedShipIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                    selectedShipIdx === idx
                      ? 'border-sky-400 bg-sky-500/25 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  Ship #{idx + 1} ({sz})
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPlaceDir(d => (d === 'h' ? 'v' : 'h'))}
                className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>{placeDir === 'h' ? 'Horiz' : 'Vert'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDraftFleet(generateRandomBattleshipFleet())}
                className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3 h-3" />
                <span>Randomize</span>
              </button>
            </div>

            <div className="w-full max-w-[330px] aspect-square grid grid-cols-8 grid-rows-8 gap-1 p-2 rounded-2xl bg-sky-950/75 border-2 border-sky-500/40 shadow-2xl">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((__, c) => {
                  const shipIdx = draftCellMap.get(`${r},${c}`);
                  const hasShip = shipIdx !== undefined;
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handlePlaceSelectedShip(r, c)}
                      className={`rounded-md border text-[10px] font-black transition-all cursor-pointer ${
                        hasShip
                          ? shipIdx === selectedShipIdx
                            ? 'bg-sky-400 border-white text-slate-950'
                            : 'bg-sky-600 border-sky-300/70 text-white'
                          : 'bg-sky-900/50 border-sky-400/20 hover:bg-sky-700/60'
                      }`}
                    >
                      {hasShip ? BATTLESHIP_SIZES[shipIdx] : ''}
                    </button>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => onAction(serializeBattleshipFleetAction(draftFleet))}
              className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-black text-xs font-extrabold cursor-pointer shadow-lg"
            >
              Lock Fleet & Start Battle
            </button>
          </>
        ) : (
          <div className="py-12 text-center text-sm font-bold text-slate-300">
            Your fleet is locked! Waiting for opponent to deploy ships...
          </div>
        )}
      </div>
    );
  }

  const myShots = state.shots[viewer];
  const enemyShots = state.shots[opp];

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      {state.lastShot && (
        <div className="px-3 py-1 rounded-xl bg-black/30 border border-white/10 text-xs font-bold text-slate-200">
          Last salvo by {state.lastShot.shooter.toUpperCase()}:{' '}
          <span
            className={
              state.lastShot.result === 'sunk'
                ? 'text-rose-400'
                : state.lastShot.result === 'hit'
                ? 'text-amber-300'
                : 'text-sky-300'
            }
          >
            {state.lastShot.result.toUpperCase()}!
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-[640px]">
        {/* Target Waters */}
        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/75 border border-sky-400/30">
          <div className="flex items-center justify-between w-full text-[11px] font-extrabold px-1">
            <span className="text-sky-300">Enemy Waters ({canAct ? 'Tap to Fire!' : 'Wait'})</span>
            <span className="font-mono text-slate-300">
              Hits {state.hitsCount[viewer]}/11 · Sunk {state.sunkBy[viewer].length}/4
            </span>
          </div>
          <div className="w-full max-w-[260px] aspect-square grid grid-cols-8 grid-rows-8 gap-1">
            {myShots.map((row, r) =>
              row.map((cell, c) => {
                const clickable = canAct && cell === null;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={!clickable}
                    onClick={() => onAction(`s:${r},${c}`)}
                    className={`rounded border flex items-center justify-center text-xs font-black transition-all ${
                      cell === 'hit'
                        ? 'bg-rose-500/80 border-rose-300 text-white'
                        : cell === 'miss'
                        ? 'bg-slate-800/80 border-white/10 text-slate-400'
                        : clickable
                        ? 'bg-sky-900/50 border-sky-400/30 hover:bg-sky-500/40 cursor-pointer'
                        : 'bg-sky-950/60 border-white/10 cursor-default'
                    }`}
                  >
                    {cell === 'hit' ? '💥' : cell === 'miss' ? '•' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Own Fleet Waters */}
        <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/75 border border-white/10">
          <div className="flex items-center justify-between w-full text-[11px] font-extrabold px-1">
            <span className="text-slate-300">My Fleet</span>
            {isLocalPvp ? (
              <button
                type="button"
                onClick={() => setShowLocalOwnFleet(v => !v)}
                className="text-[10px] font-bold text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                {showLocalOwnFleet ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showLocalOwnFleet ? 'Hide Ships' : 'Peek Ships'}</span>
              </button>
            ) : (
              <span className="font-mono text-slate-400">Lost {state.hitsCount[opp]}/11</span>
            )}
          </div>
          <div className="w-full max-w-[260px] aspect-square grid grid-cols-8 grid-rows-8 gap-1">
            {enemyShots.map((row, r) =>
              row.map((cell, c) => {
                const hasShip = myFleetCellSet.has(`${r},${c}`) && (!isLocalPvp || showLocalOwnFleet);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`rounded border flex items-center justify-center text-xs font-black ${
                      cell === 'hit'
                        ? 'bg-rose-600/85 border-rose-300 text-white'
                        : cell === 'miss'
                        ? 'bg-slate-800/80 border-white/10 text-slate-500'
                        : hasShip
                        ? 'bg-sky-600/75 border-sky-300/60'
                        : 'bg-slate-900/60 border-white/10'
                    }`}
                  >
                    {cell === 'hit' ? '💥' : cell === 'miss' ? '•' : ''}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoryMatchBoard: React.FC<{
  state: MemoryMatchState;
  canAct: boolean;
  p1Name: string;
  p2Name: string;
  onFlip: (idx: number) => void;
}> = ({ state, canAct, p1Name, p2Name, onFlip }) => {
  const [peekMismatch, setPeekMismatch] = useState<{ idxA: number; idxB: number } | null>(null);

  useEffect(() => {
    if (state.lastPair && !state.lastPair.matched && state.openIndices.length === 0) {
      setPeekMismatch({ idxA: state.lastPair.idxA, idxB: state.lastPair.idxB });
      const id = window.setTimeout(() => setPeekMismatch(null), 1050);
      return () => window.clearTimeout(id);
    }
    setPeekMismatch(null);
  }, [state.lastPair, state.openIndices.length]);

  return (
    <div className="w-full max-w-[380px] flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs font-extrabold">
        <span className="text-rose-300">{p1Name}: {state.scores.p1} pairs</span>
        <span className="text-slate-400 font-mono">{state.scores.p1 + state.scores.p2}/8</span>
        <span className="text-amber-300">{p2Name}: {state.scores.p2} pairs</span>
      </div>

      <div className="w-full aspect-square grid grid-cols-4 grid-rows-4 gap-2 p-2.5 rounded-2xl bg-slate-950/75 border border-white/10 shadow-2xl">
        {state.deck.map((symIdx, idx) => {
          const owner = state.matchedBy[idx];
          const isOpen = state.openIndices.includes(idx);
          const isMismatchPeek = peekMismatch?.idxA === idx || peekMismatch?.idxB === idx;
          const revealed = owner !== null || isOpen || isMismatchPeek;
          const clickable = canAct && owner === null && !isOpen;

          return (
            <button
              key={idx}
              type="button"
              disabled={!clickable}
              onClick={() => onFlip(idx)}
              className={`rounded-xl border flex items-center justify-center text-3xl transition-all ${
                owner === 'p1'
                  ? 'bg-rose-500/20 border-rose-400/60'
                  : owner === 'p2'
                  ? 'bg-amber-500/20 border-amber-400/60'
                  : isOpen
                  ? 'bg-purple-500/25 border-purple-400 scale-105'
                  : isMismatchPeek
                  ? 'bg-slate-800 border-rose-400/50'
                  : clickable
                  ? 'bg-slate-900 border-white/15 hover:bg-slate-800 hover:scale-[1.03] cursor-pointer'
                  : 'bg-slate-900/70 border-white/10 cursor-default'
              }`}
            >
              {revealed ? MEMORY_SYMBOLS[symIdx] : <span className="text-lg text-slate-500 font-black">?</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DiceSprintBoard: React.FC<{
  state: DiceDuelState;
  canAct: boolean;
  p1Name: string;
  p2Name: string;
  onAction: (act: string) => void;
}> = ({ state, canAct, p1Name, p2Name, onAction }) => {
  const pipMap: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };
  const face = state.lastRoll || 6;
  const activePips = pipMap[face] || pipMap[1];

  return (
    <div className="w-full max-w-[440px] flex flex-col items-center gap-4 p-4 rounded-2xl bg-slate-950/75 border border-white/10 shadow-2xl">
      {/* Race to 50 Scorebars */}
      <div className="w-full flex flex-col gap-2.5">
        <div>
          <div className="flex justify-between text-xs font-extrabold mb-1">
            <span className="text-rose-300">{p1Name}</span>
            <span className="font-mono text-white">{state.scores.p1} / {state.target}</span>
          </div>
          <div className="h-3 rounded-full bg-black/50 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (state.scores.p1 / state.target) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-extrabold mb-1">
            <span className="text-amber-300">{p2Name}</span>
            <span className="font-mono text-white">{state.scores.p2} / {state.target}</span>
          </div>
          <div className="h-3 rounded-full bg-black/50 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(100, (state.scores.p2 / state.target) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Die Visual + Turn Bank */}
      <div className="flex items-center gap-6 py-2">
        <div
          className={`w-24 h-24 rounded-2xl border-2 p-3 grid grid-cols-3 grid-rows-3 gap-1.5 shadow-2xl ${
            state.bustedBy
              ? 'bg-rose-500/20 border-rose-400'
              : 'bg-slate-100 border-white'
          }`}
        >
          {Array.from({ length: 9 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {activePips.includes(idx) && (
                <span
                  className={`w-3.5 h-3.5 rounded-full ${
                    state.bustedBy ? 'bg-rose-400' : 'bg-slate-900'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Turn Bank
          </span>
          <span className="text-4xl font-black font-mono text-orange-300 tabular-nums">
            +{state.turnBank}
          </span>
          <span className="text-xs text-slate-300 min-h-[18px]">
            {state.lastEvent || 'Roll a 2–6 to build points'}
          </span>
        </div>
      </div>

      {/* Roll / Hold Controls */}
      <div className="flex items-center gap-2.5 w-full">
        <button
          type="button"
          disabled={!canAct}
          onClick={() => onAction(`r:${Math.floor(Math.random() * 6) + 1}`)}
          className="flex-1 py-3 rounded-xl bg-orange-400 hover:bg-orange-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 shadow-lg transition-transform hover:scale-[1.01]"
        >
          <Dices className="w-4 h-4" />
          <span>Roll Dice</span>
        </button>
        <button
          type="button"
          disabled={!canAct || state.turnBank <= 0}
          onClick={() => onAction('h')}
          className="flex-1 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-lg transition-transform hover:scale-[1.01]"
        >
          <Check className="w-4 h-4" />
          <span>Hold (+{state.turnBank})</span>
        </button>
      </div>
    </div>
  );
};

