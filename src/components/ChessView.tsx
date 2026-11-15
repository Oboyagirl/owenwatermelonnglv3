import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Undo2,
  FlipVertical2,
  Volume2,
  VolumeX,
  Lightbulb,
  Flag,
  Bot,
  Users,
  Globe,
  Trophy,
  Sparkles,
  Palette,
  RefreshCw,
  Eye,
  Shuffle,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Link2,
  LogOut,
  X
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import {
  BotMoveDecision,
  CHESS_BOTS,
  ChessBot,
  ChessMove,
  ChessState,
  MoveRecord,
  Piece,
  PieceColor,
  PromotionPieceType,
  Square,
  applyMove,
  chooseAIMove,
  chooseBotMove,
  computeMaterialAndCaptures,
  createInitialState,
  evaluatePositionForSide,
  getBotById,
  getLegalMoves,
  getPremoveTargets,
  pickBotVoiceline
} from '../utils/chessEngine';

interface ChessViewProps {
  activeTheme: ThemeConfig;
}

type GameMode = 'ai' | 'pvp' | 'online';
type PlayerSidePref = 'w' | 'b' | 'random';
type BoardPaletteId = 'wood' | 'tournament' | 'slate';

interface Premove {
  from: Square;
  to: Square;
}

interface OnlineSeatInfo {
  name: string;
  elo: number;
  connected: boolean;
}

interface OnlineRoomPlayers {
  w: OnlineSeatInfo | null;
  b: OnlineSeatInfo | null;
}

type WsConnStatus = 'disconnected' | 'connecting' | 'connected';

interface BoardPalette {
  id: BoardPaletteId;
  label: string;
  light: string;
  dark: string;
  coordLight: string;
  coordDark: string;
}

const BOARD_PALETTES: BoardPalette[] = [
  {
    id: 'wood',
    label: 'Classic Wood',
    light: '#ecd9b9',
    dark: '#a57146',
    coordLight: '#825530',
    coordDark: '#ecd9b9'
  },
  {
    id: 'tournament',
    label: 'Tournament Green',
    light: '#eeeed2',
    dark: '#769656',
    coordLight: '#5a783d',
    coordDark: '#eeeed2'
  },
  {
    id: 'slate',
    label: 'Cyber Slate',
    light: '#cbd5e1',
    dark: '#475569',
    coordLight: '#334155',
    coordDark: '#e2e8f0'
  }
];

const DIFFICULTY_LABELS: Record<ChessBot['difficulty'], string> = {
  easy: 'Beginner',
  medium: 'Club',
  hard: 'Master',
  expert: 'Grandmaster'
};

const CLOUD_RUN_HOST = 'ais-pre-7ylqt33cxq7bzpzpildi3y-58002627990.us-east1.run.app';

function getChessWsUrl(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.host;
  const hostname = window.location.hostname;
  const isLocalOrRun =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.run.app');
  if (isLocalOrRun && host) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${host}/ws/chess`;
  }
  return `wss://${CLOUD_RUN_HOST}/ws/chess`;
}

function getOrCreatePlayerId(): string {
  try {
    const existing = sessionStorage.getItem('owen_chess_player_id');
    if (existing) return existing;
    const generated = `p_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    sessionStorage.setItem('owen_chess_player_id', generated);
    return generated;
  } catch {
    return `p_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Crisp inline SVG Staunton-inspired chess pieces
const ChessPieceSvg: React.FC<{ piece: Piece; className?: string }> = ({
  piece,
  className = 'w-[84%] h-[84%]'
}) => {
  const isWhite = piece.color === 'w';
  const fill = isWhite ? '#f8fafc' : '#18181b';
  const stroke = isWhite ? '#1e293b' : '#e2e8f0';
  const detail = isWhite ? '#334155' : '#94a3b8';

  switch (piece.type) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12.5 36.5h20" stroke={detail} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
          <g fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <path d="M34 14l-3 3H14l-3-3" />
            <path d="M31 17v12.5H14V17" />
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <path d="M11 14h23" fill="none" stroke={detail} strokeWidth="1.2" />
          </g>
        </svg>
      );

    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
          <g fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
            <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
            <circle cx="15" cy="15.5" r="1" fill={detail} stroke="none" />
            <path d="M15 36.5h22" stroke={detail} strokeWidth="1.3" />
          </g>
        </svg>
      );

    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
          <g fill={fill} stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <circle cx="22.5" cy="8" r="2.5" />
            <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke={detail} strokeWidth="1.4" />
          </g>
        </svg>
      );

    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="14" cy="9" r="2.5" />
            <circle cx="22.5" cy="8" r="2.5" />
            <circle cx="31" cy="9" r="2.5" />
            <circle cx="39" cy="12" r="2.5" />
            <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" />
            <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke={detail} strokeWidth="1.3" />
          </g>
        </svg>
      );

    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className} aria-hidden="true">
          <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={stroke} strokeWidth="2" />
            <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
            <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
            <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" stroke={detail} strokeWidth="1.3" />
          </g>
        </svg>
      );
  }
};

interface HistorySnapshot {
  state: ChessState;
  history: MoveRecord[];
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const ChessView: React.FC<ChessViewProps> = ({ activeTheme }) => {
  // Match Configuration
  const [mode, setMode] = useState<GameMode>('ai');
  const [selectedBotId, setSelectedBotId] = useState<string>('clara');
  const [botTierFilter, setBotTierFilter] = useState<'all' | ChessBot['difficulty']>('all');
  const [sidePref, setSidePref] = useState<PlayerSidePref>('w');
  const [humanColor, setHumanColor] = useState<PieceColor>('w');
  const [autoFlipPvp, setAutoFlipPvp] = useState(false);

  const selectedBot: ChessBot = useMemo(() => getBotById(selectedBotId), [selectedBotId]);
  const filteredBots = useMemo(
    () =>
      botTierFilter === 'all'
        ? CHESS_BOTS
        : CHESS_BOTS.filter(b => b.difficulty === botTierFilter),
    [botTierFilter]
  );

  // Bot Personality Speech & Opening State
  const [botQuote, setBotQuote] = useState<string>(() =>
    pickBotVoiceline(getBotById('clara'), 'gameStart')
  );
  const [activeOpening, setActiveOpening] = useState<string | null>(null);
  const lastOpeningCommentedRef = useRef<boolean>(false);

  // Visual & Fullscreen Preferences
  const [paletteId, setPaletteId] = useState<BoardPaletteId>('wood');
  const [isFlipped, setIsFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const studioRef = useRef<HTMLDivElement | null>(null);

  // Game State & Timeline
  const [gameState, setGameState] = useState<ChessState>(() => createInitialState());
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  const [resignedWinner, setResignedWinner] = useState<PieceColor | null>(null);
  const [showEndOverlay, setShowEndOverlay] = useState(true);

  // Interaction & Premove State
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<ChessMove | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [dragFrom, setDragFrom] = useState<Square | null>(null);
  const [premove, setPremove] = useState<Premove | null>(null);
  const [premoveFrom, setPremoveFrom] = useState<Square | null>(null);

  // Online Room Multiplayer State
  const [playerId] = useState<string>(() => getOrCreatePlayerId());
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('owen_chess_player_name') || 'Player';
    } catch {
      return 'Player';
    }
  });
  const [wsStatus, setWsStatus] = useState<WsConnStatus>('disconnected');
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [onlineMyColor, setOnlineMyColor] = useState<PieceColor | 'spectator'>('w');
  const [onlinePlayers, setOnlinePlayers] = useState<OnlineRoomPlayers>({ w: null, b: null });
  const [onlineRematchVotes, setOnlineRematchVotes] = useState<PieceColor[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const lastOnlineHistoryLenRef = useRef<number>(0);
  const lastOnlineRoomRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const moveListRef = useRef<HTMLDivElement | null>(null);

  const palette = useMemo(
    () => BOARD_PALETTES.find(p => p.id === paletteId) || BOARD_PALETTES[0],
    [paletteId]
  );

  // Persist player name
  const handlePlayerNameChange = (val: string) => {
    const trimmed = val.slice(0, 24);
    setPlayerName(trimmed);
    try {
      localStorage.setItem('owen_chess_player_name', trimmed);
    } catch {}
  };

  // Fullscreen toggle (hybrid fixed overlay + best-effort native Fullscreen API)
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const next = !prev;
      try {
        if (next) {
          studioRef.current?.requestFullscreen?.()?.catch(() => {});
        } else if (document.fullscreenElement) {
          document.exitFullscreen?.()?.catch(() => {});
        }
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen?.()?.catch(() => {});
          }
        } catch {}
      }
    };
    const onFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        // Keep overlay state only if user did not hit native Exit Fullscreen
        // Wait: if native fullscreen exited via browser ESC, sync state cleanly
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('fullscreenchange', onFsChange);
    };
  }, [isFullscreen]);

  // Synthesized Web Audio sound effects (zero external MP3 needed)
  const playSound = useCallback(
    (type: 'move' | 'capture' | 'check' | 'castle' | 'gameover') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const tone = (
          freq: number,
          dur: number,
          startOffset = 0,
          vol = 0.14,
          wave: OscillatorType = 'triangle'
        ) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = wave;
          osc.frequency.setValueAtTime(freq, now + startOffset);
          gain.gain.setValueAtTime(vol, now + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + startOffset);
          osc.stop(now + startOffset + dur);
        };

        if (type === 'move') {
          tone(210, 0.06, 0, 0.14, 'triangle');
          tone(130, 0.05, 0.015, 0.1, 'sine');
        } else if (type === 'capture') {
          tone(340, 0.07, 0, 0.18, 'sawtooth');
          tone(150, 0.09, 0.02, 0.16, 'triangle');
        } else if (type === 'castle') {
          tone(220, 0.05, 0, 0.14, 'triangle');
          tone(260, 0.06, 0.08, 0.14, 'triangle');
        } else if (type === 'check') {
          tone(520, 0.12, 0, 0.16, 'sine');
          tone(680, 0.16, 0.06, 0.14, 'triangle');
        } else if (type === 'gameover') {
          tone(392, 0.15, 0, 0.14, 'triangle');
          tone(493.88, 0.15, 0.12, 0.14, 'triangle');
          tone(587.33, 0.3, 0.24, 0.16, 'triangle');
        }
      } catch {
        // Ignore audio context issues in restricted frames
      }
    },
    [soundEnabled]
  );

  // Scroll move list to bottom when new moves arrive
  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  const isGameOver =
    Boolean(resignedWinner) ||
    gameState.status === 'checkmate' ||
    gameState.status === 'stalemate' ||
    gameState.status === 'draw_repetition' ||
    gameState.status === 'draw_fifty_move' ||
    gameState.status === 'draw_insufficient_material';

  const aiColor: PieceColor = humanColor === 'w' ? 'b' : 'w';

  const playerControlledColor: PieceColor | null =
    mode === 'ai'
      ? humanColor
      : mode === 'online' && onlineRoomCode && (onlineMyColor === 'w' || onlineMyColor === 'b')
      ? onlineMyColor
      : null;

  const isHumanTurn =
    !isGameOver &&
    (mode === 'pvp'
      ? true
      : mode === 'ai'
      ? gameState.turn === humanColor
      : Boolean(onlineRoomCode) &&
        (onlineMyColor === 'w' || onlineMyColor === 'b') &&
        gameState.turn === onlineMyColor);

  const canPremove =
    !isGameOver &&
    playerControlledColor !== null &&
    gameState.turn !== playerControlledColor &&
    (mode === 'ai' || (mode === 'online' && Boolean(onlineRoomCode)));

  const speakAsBot = useCallback(
    (bot: ChessBot, event: Parameters<typeof pickBotVoiceline>[1]) => {
      setBotQuote(prev => pickBotVoiceline(bot, event, prev));
    },
    []
  );

  // WebSocket Connection Management for Online Rooms
  const closeWebSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setWsStatus('disconnected');
  }, []);

  const connectAndSend = useCallback(
    (payload?: Record<string, unknown>) => {
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
          existing.onopen = (ev) => {
            prevOnOpen?.call(existing, ev);
            sendPayload(existing);
          };
        }
        return;
      }

      const url = getChessWsUrl();
      if (!url) {
        setOnlineError('WebSocket is unavailable in this environment.');
        return;
      }

      setOnlineError(null);
      setWsStatus('connecting');

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        setOnlineError(null);
        if (payload) {
          sendPayload(ws);
        } else if (lastOnlineRoomRef.current) {
          ws.send(
            JSON.stringify({
              type: 'room:join',
              code: lastOnlineRoomRef.current,
              playerId,
              playerName: playerName.trim() || 'Player'
            })
          );
        }
      };

      ws.onmessage = (event) => {
        let msg: any;
        try {
          msg = JSON.parse(String(event.data));
        } catch {
          return;
        }
        if (!msg || typeof msg.type !== 'string') return;

        if (msg.type === 'room:error') {
          setOnlineError(String(msg.message || 'Room error occurred.'));
          return;
        }

        if (msg.type === 'room:sync') {
          setOnlineError(null);
          const nextHistory: MoveRecord[] = Array.isArray(msg.history) ? msg.history : [];
          const nextState: ChessState = msg.state;
          const prevRoom = lastOnlineRoomRef.current;
          const prevLen = lastOnlineHistoryLenRef.current;

          const roomChanged = prevRoom !== msg.code;
          lastOnlineRoomRef.current = msg.code;
          lastOnlineHistoryLenRef.current = nextHistory.length;

          setOnlineRoomCode(msg.code);
          setOnlineMyColor(msg.myColor || 'spectator');
          setOnlinePlayers(msg.players || { w: null, b: null });
          setOnlineRematchVotes(Array.isArray(msg.rematchVotes) ? msg.rematchVotes : []);
          setGameState(nextState);
          setMoveHistory(nextHistory);
          setSnapshots([]);
          setResignedWinner(msg.resignedWinner || null);
          setSelectedSquare(null);
          setPendingPromotion(null);
          setHintMove(null);
          setIsAIThinking(false);

          if (roomChanged) {
            setIsFlipped(msg.myColor === 'b');
            setShowEndOverlay(true);
            setPremove(null);
            setPremoveFrom(null);
          } else {
            // Check sound notifications on new move or game over
            const ended =
              Boolean(msg.resignedWinner) ||
              nextState.status === 'checkmate' ||
              nextState.status === 'stalemate' ||
              nextState.status.startsWith('draw_');

            if (nextHistory.length === 0 && prevLen > 0) {
              // Rematch started! Orient to new color
              setIsFlipped(msg.myColor === 'b');
              setShowEndOverlay(true);
              setPremove(null);
              setPremoveFrom(null);
            } else if (ended && (nextHistory.length > prevLen || msg.resignedWinner)) {
              setShowEndOverlay(true);
              playSound('gameover');
            } else if (nextHistory.length > prevLen) {
              const latest = nextHistory[nextHistory.length - 1];
              if (nextState.status === 'check') {
                playSound('check');
              } else if (latest?.move?.isCastle) {
                playSound('castle');
              } else if (latest?.move?.isCapture) {
                playSound('capture');
              } else {
                playSound('move');
              }
            }
          }
        }
      };

      ws.onerror = () => {
        setOnlineError('Connection interrupted. Check your network and try again.');
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          setWsStatus('disconnected');
        }
      };
    },
    [playerId, playerName, playSound]
  );

  // Heartbeat keep-alive while WebSocket is open
  useEffect(() => {
    if (mode !== 'online') return;
    const interval = window.setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
    return () => window.clearInterval(interval);
  }, [mode]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      closeWebSocket();
    };
  }, [closeWebSocket]);

  // Auto-join ?chessRoom=CODE from URL on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('chessRoom');
      if (roomParam) {
        const cleanCode = roomParam.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        if (cleanCode) {
          setMode('online');
          setJoinCodeInput(cleanCode);
          connectAndSend({
            type: 'room:join',
            code: cleanCode,
            playerId,
            playerName: playerName.trim() || 'Player'
          });
        }
      }
    } catch {}
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRoom = () => {
    connectAndSend({
      type: 'room:create',
      playerId,
      playerName: playerName.trim() || 'Player',
      preferredColor: sidePref
    });
  };

  const handleJoinRoom = (codeOverride?: string) => {
    const cleanCode = (codeOverride ?? joinCodeInput)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (!cleanCode) {
      setOnlineError('Enter a room code to join.');
      return;
    }
    connectAndSend({
      type: 'room:join',
      code: cleanCode,
      playerId,
      playerName: playerName.trim() || 'Player'
    });
  };

  const handleLeaveRoom = () => {
    if (onlineRoomCode && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'room:leave', code: onlineRoomCode, playerId })
      );
    }
    lastOnlineRoomRef.current = null;
    lastOnlineHistoryLenRef.current = 0;
    setOnlineRoomCode(null);
    setOnlinePlayers({ w: null, b: null });
    setOnlineRematchVotes([]);
    setOnlineError(null);
    setPremove(null);
    setPremoveFrom(null);
    setGameState(createInitialState());
    setMoveHistory([]);
    setResignedWinner(null);
  };

  const sendWsMove = useCallback(
    (move: ChessMove, expectedMoveIndex: number) => {
      if (!onlineRoomCode) return;
      connectAndSend({
        type: 'room:move',
        code: onlineRoomCode,
        playerId,
        moveIndex: expectedMoveIndex,
        move
      });
    },
    [onlineRoomCode, playerId, connectAndSend]
  );

  const handleCopyRoom = (kind: 'code' | 'link') => {
    if (!onlineRoomCode) return;
    const text =
      kind === 'code'
        ? onlineRoomCode
        : `${window.location.origin}${window.location.pathname}?chessRoom=${onlineRoomCode}`;
    try {
      navigator.clipboard?.writeText(text);
    } catch {}
    setCopiedType(kind);
    window.setTimeout(() => setCopiedType(null), 1800);
  };

  const startNewGame = useCallback(
    (
      nextMode: GameMode = mode,
      nextPref: PlayerSidePref = sidePref,
      botOverride: ChessBot = selectedBot
    ) => {
      if (nextMode === 'online') {
        if (onlineRoomCode) {
          connectAndSend({
            type: 'room:rematch',
            code: onlineRoomCode,
            playerId
          });
        }
        return;
      }

      const resolvedSide: PieceColor =
        nextMode === 'pvp'
          ? 'w'
          : nextPref === 'random'
          ? Math.random() < 0.5
            ? 'w'
            : 'b'
          : nextPref;

      setHumanColor(resolvedSide);
      setIsFlipped(nextMode === 'ai' && resolvedSide === 'b');
      setGameState(createInitialState());
      setMoveHistory([]);
      setSnapshots([]);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setPremove(null);
      setPremoveFrom(null);
      setResignedWinner(null);
      setShowEndOverlay(true);
      setIsAIThinking(false);
      setActiveOpening(null);
      lastOpeningCommentedRef.current = false;
      if (nextMode === 'ai') {
        speakAsBot(botOverride, 'gameStart');
      }
    },
    [mode, sidePref, selectedBot, speakAsBot, onlineRoomCode, connectAndSend, playerId]
  );

  const commitMove = useCallback(
    (move: ChessMove, decisionMeta?: BotMoveDecision) => {
      if (mode === 'online') {
        sendWsMove(move, moveHistory.length);
        setSelectedSquare(null);
        setPendingPromotion(null);
        setHintMove(null);
        return;
      }

      const evalBefore =
        mode === 'ai' ? evaluatePositionForSide(gameState.board, aiColor) : 0;

      setSnapshots(prev => [...prev, { state: gameState, history: moveHistory }]);
      const { nextState, record } = applyMove(gameState, move);
      setGameState(nextState);
      setMoveHistory(prev => [...prev, record]);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setShowEndOverlay(true);

      if (decisionMeta?.openingName) {
        setActiveOpening(decisionMeta.openingName);
      }

      // Contextual bot reactions
      if (mode === 'ai') {
        const moverWasBot = gameState.turn === aiColor;
        const evalAfter = evaluatePositionForSide(nextState.board, aiColor);

        if (nextState.status === 'checkmate') {
          speakAsBot(selectedBot, nextState.winner === aiColor ? 'botWin' : 'botLose');
        } else if (nextState.winner === 'draw') {
          speakAsBot(selectedBot, 'draw');
        } else if (moverWasBot) {
          if (nextState.inCheckColor === humanColor) {
            speakAsBot(selectedBot, 'check');
          } else if (
            decisionMeta?.usedBook &&
            !lastOpeningCommentedRef.current &&
            Math.random() < 0.75
          ) {
            lastOpeningCommentedRef.current = true;
            speakAsBot(selectedBot, 'opening');
          } else if (record.captured) {
            speakAsBot(selectedBot, 'capture');
          }
        } else {
          if (nextState.inCheckColor === aiColor) {
            speakAsBot(selectedBot, 'inCheck');
          } else if (evalAfter - evalBefore >= 260) {
            speakAsBot(selectedBot, 'playerBlunder');
          } else if (record.captured) {
            speakAsBot(selectedBot, 'captured');
          }
        }
      }

      if (
        nextState.status === 'checkmate' ||
        nextState.status === 'stalemate' ||
        nextState.status.startsWith('draw_')
      ) {
        playSound('gameover');
      } else if (nextState.status === 'check') {
        playSound('check');
      } else if (move.isCastle) {
        playSound('castle');
      } else if (move.isCapture) {
        playSound('capture');
      } else {
        playSound('move');
      }

      if (mode === 'pvp' && autoFlipPvp && nextState.status !== 'checkmate') {
        setIsFlipped(nextState.turn === 'b');
      }
    },
    [
      gameState,
      moveHistory,
      mode,
      aiColor,
      humanColor,
      selectedBot,
      autoFlipPvp,
      playSound,
      speakAsBot,
      sendWsMove
    ]
  );

  // Trigger AI turn automatically when it's AI's move
  useEffect(() => {
    if (mode !== 'ai' || isGameOver || gameState.turn !== aiColor) {
      setIsAIThinking(false);
      return;
    }

    setIsAIThinking(true);
    const delayMs =
      selectedBot.difficulty === 'easy'
        ? 300
        : selectedBot.difficulty === 'medium'
        ? 380
        : 440;
    const timer = window.setTimeout(() => {
      const decision = chooseBotMove(gameState, selectedBot, moveHistory);
      setIsAIThinking(false);
      if (decision.move) {
        commitMove(decision.move, decision);
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [mode, isGameOver, gameState, aiColor, selectedBot, moveHistory, commitMove]);

  // Execute queued premove automatically when turn arrives for playerControlledColor
  useEffect(() => {
    if (!premove || isGameOver || playerControlledColor === null) return;
    if (gameState.turn !== playerControlledColor) return;

    const queued = premove;
    setPremove(null);
    setPremoveFrom(null);

    const candidates = getLegalMoves(gameState, queued.from).filter(
      m => m.to.r === queued.to.r && m.to.c === queued.to.c
    );
    if (candidates.length === 0) return;

    const chosen =
      candidates.find(m => m.promotion === 'q') || candidates[0];

    const execTimer = window.setTimeout(() => {
      if (mode === 'online') {
        sendWsMove(chosen, moveHistory.length);
      } else {
        commitMove(chosen);
      }
    }, 65);

    return () => window.clearTimeout(execTimer);
  }, [
    premove,
    isGameOver,
    playerControlledColor,
    gameState,
    mode,
    moveHistory.length,
    commitMove,
    sendWsMove
  ]);

  // Clear stale premove if game ends
  useEffect(() => {
    if (isGameOver && (premove || premoveFrom)) {
      setPremove(null);
      setPremoveFrom(null);
    }
  }, [isGameOver, premove, premoveFrom]);

  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !isHumanTurn) return [];
    return getLegalMoves(gameState, selectedSquare);
  }, [gameState, selectedSquare, isHumanTurn]);

  const premoveTargetSquares = useMemo(() => {
    if (!premoveFrom || !canPremove || playerControlledColor === null) return [];
    return getPremoveTargets(gameState.board, premoveFrom, playerControlledColor);
  }, [premoveFrom, canPremove, playerControlledColor, gameState.board]);

  const tryMoveToSquare = useCallback(
    (from: Square, to: Square) => {
      const candidates = getLegalMoves(gameState, from).filter(
        m => m.to.r === to.r && m.to.c === to.c
      );
      if (candidates.length === 0) return false;

      if (candidates.some(m => m.promotion)) {
        setPendingPromotion({ from, to });
        return true;
      }

      commitMove(candidates[0]);
      return true;
    },
    [gameState, commitMove]
  );

  const tryQueuePremove = useCallback(
    (from: Square, to: Square) => {
      if (!canPremove || playerControlledColor === null) return false;
      const targets = getPremoveTargets(gameState.board, from, playerControlledColor);
      if (targets.some(sq => sq.r === to.r && sq.c === to.c)) {
        setPremove({ from, to });
        setPremoveFrom(null);
        return true;
      }
      return false;
    },
    [canPremove, playerControlledColor, gameState.board]
  );

  const handleSquareClick = (r: number, c: number) => {
    if (pendingPromotion || isGameOver) return;

    const clickedPiece = gameState.board[r][c];

    // Premove interaction while waiting for opponent
    if (canPremove && playerControlledColor) {
      if (premoveFrom) {
        if (premoveFrom.r === r && premoveFrom.c === c) {
          setPremoveFrom(null);
          setPremove(null);
          return;
        }
        if (tryQueuePremove(premoveFrom, { r, c })) {
          return;
        }
        if (clickedPiece && clickedPiece.color === playerControlledColor) {
          setPremoveFrom({ r, c });
          return;
        }
        setPremoveFrom(null);
        setPremove(null);
        return;
      }

      if (clickedPiece && clickedPiece.color === playerControlledColor) {
        setPremoveFrom({ r, c });
      } else if (premove) {
        setPremove(null);
      }
      return;
    }

    if (!isHumanTurn) return;

    if (selectedSquare) {
      if (selectedSquare.r === r && selectedSquare.c === c) {
        setSelectedSquare(null);
        return;
      }

      if (tryMoveToSquare(selectedSquare, { r, c })) {
        return;
      }

      if (clickedPiece && clickedPiece.color === gameState.turn) {
        setSelectedSquare({ r, c });
        return;
      }

      setSelectedSquare(null);
      return;
    }

    if (clickedPiece && clickedPiece.color === gameState.turn) {
      setSelectedSquare({ r, c });
    }
  };

  const handlePromotionChoice = (promoType: PromotionPieceType) => {
    if (!pendingPromotion) return;
    const match = getLegalMoves(gameState, pendingPromotion.from).find(
      m =>
        m.to.r === pendingPromotion.to.r &&
        m.to.c === pendingPromotion.to.c &&
        m.promotion === promoType
    );
    if (match) {
      commitMove(match);
    } else {
      setPendingPromotion(null);
    }
  };

  const handleUndo = () => {
    if (mode === 'online' || snapshots.length === 0 || isAIThinking) return;

    let targetIndex = snapshots.length - 1;
    if (mode === 'ai') {
      if (snapshots[targetIndex].state.turn !== humanColor && targetIndex > 0) {
        targetIndex -= 1;
      }
      if (snapshots[targetIndex].state.turn !== humanColor) return;
    }

    const snap = snapshots[targetIndex];
    setGameState(snap.state);
    setMoveHistory(snap.history);
    setSnapshots(prev => prev.slice(0, targetIndex));
    setSelectedSquare(null);
    setPendingPromotion(null);
    setHintMove(null);
    setPremove(null);
    setPremoveFrom(null);
    setResignedWinner(null);
    setShowEndOverlay(true);

    if (mode === 'pvp' && autoFlipPvp) {
      setIsFlipped(snap.state.turn === 'b');
    }
  };

  const handleHint = () => {
    if (mode === 'online' || !isHumanTurn || isGameOver) return;
    const suggestion = chooseAIMove(gameState, 'hard', 450);
    if (suggestion) {
      setHintMove(suggestion);
      setSelectedSquare(suggestion.from);
    }
  };

  const handleResign = () => {
    if (isGameOver) return;
    if (mode === 'online') {
      if (onlineRoomCode && (onlineMyColor === 'w' || onlineMyColor === 'b')) {
        connectAndSend({
          type: 'room:resign',
          code: onlineRoomCode,
          playerId
        });
      }
      return;
    }

    const losingColor = mode === 'ai' ? humanColor : gameState.turn;
    setResignedWinner(losingColor === 'w' ? 'b' : 'w');
    setShowEndOverlay(true);
    if (mode === 'ai') {
      speakAsBot(selectedBot, 'botWin');
    }
    playSound('gameover');
  };

  const handleModeChange = (nextMode: GameMode) => {
    if (nextMode === mode) return;
    if (mode === 'online' && nextMode !== 'online') {
      handleLeaveRoom();
      closeWebSocket();
    }
    setMode(nextMode);
    if (nextMode === 'online') {
      setGameState(createInitialState());
      setMoveHistory([]);
      setSnapshots([]);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setPremove(null);
      setPremoveFrom(null);
      setResignedWinner(null);
      connectAndSend();
    } else {
      startNewGame(nextMode, sidePref, selectedBot);
    }
  };

  const handleSelectBot = (bot: ChessBot) => {
    setSelectedBotId(bot.id);
    if (mode === 'online') {
      handleLeaveRoom();
      closeWebSocket();
    }
    if (mode !== 'ai') {
      setMode('ai');
    }
    startNewGame('ai', sidePref, bot);
  };

  const handleSidePrefChange = (nextPref: PlayerSidePref) => {
    setSidePref(nextPref);
    if (mode === 'ai') {
      startNewGame('ai', nextPref, selectedBot);
    }
  };

  const material = useMemo(
    () => computeMaterialAndCaptures(moveHistory, gameState.board),
    [moveHistory, gameState.board]
  );

  // Pair moves into [moveNumber, whiteMove, blackMove?]
  const pairedMoves = useMemo(() => {
    const pairs: { moveNumber: number; white?: MoveRecord; black?: MoveRecord }[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: moveHistory[i],
        black: moveHistory[i + 1]
      });
    }
    return pairs;
  }, [moveHistory]);

  const topColor: PieceColor = isFlipped ? 'w' : 'b';
  const bottomColor: PieceColor = isFlipped ? 'b' : 'w';

  const getPlayerInfo = (
    color: PieceColor
  ): { name: string; elo: number | null; connected?: boolean } => {
    if (mode === 'pvp') {
      return {
        name: color === 'w' ? 'Player 1' : 'Player 2',
        elo: null
      };
    }
    if (mode === 'online') {
      const seat = color === 'w' ? onlinePlayers.w : onlinePlayers.b;
      if (!seat) {
        return {
          name: onlineRoomCode ? 'Waiting for opponent...' : color === 'w' ? 'White' : 'Black',
          elo: null,
          connected: false
        };
      }
      const isMe = onlineMyColor === color;
      return {
        name: isMe ? `${seat.name} (You)` : seat.name,
        elo: seat.elo,
        connected: seat.connected
      };
    }
    if (color === humanColor) {
      return { name: playerName.trim() || 'You', elo: 1200 };
    }
    return { name: selectedBot.name, elo: selectedBot.rating };
  };

  const getEndBannerCopy = () => {
    if (resignedWinner) {
      const winnerName = resignedWinner === 'w' ? 'White' : 'Black';
      return {
        title: `${winnerName} Wins`,
        subtitle: `${resignedWinner === 'w' ? 'Black' : 'White'} resigned the match.`
      };
    }
    if (gameState.status === 'checkmate') {
      const winnerName = gameState.winner === 'w' ? 'White' : 'Black';
      if (mode === 'ai') {
        return gameState.winner === humanColor
          ? {
              title: 'Victory by Checkmate',
              subtitle: `You defeated ${selectedBot.name} (${selectedBot.rating})!`
            }
          : {
              title: `${selectedBot.name} Wins`,
              subtitle: `${winnerName} delivered checkmate.`
            };
      }
      return {
        title: `${winnerName} Wins by Checkmate`,
        subtitle: 'King has no legal escape.'
      };
    }
    if (gameState.status === 'stalemate') {
      return {
        title: 'Draw by Stalemate',
        subtitle: 'No legal moves available and king is not in check.'
      };
    }
    if (gameState.status === 'draw_repetition') {
      return {
        title: 'Draw by Repetition',
        subtitle: 'The same position occurred three times.'
      };
    }
    if (gameState.status === 'draw_fifty_move') {
      return {
        title: 'Draw · 50-Move Rule',
        subtitle: 'Fifty moves played without a capture or pawn move.'
      };
    }
    if (gameState.status === 'draw_insufficient_material') {
      return {
        title: 'Draw · Insufficient Material',
        subtitle: 'Neither side has enough pieces to checkmate.'
      };
    }
    return { title: 'Game Over', subtitle: '' };
  };

  // Clean, uncluttered player strip with Elo right beside the name
  const renderPlayerStrip = (color: PieceColor) => {
    const isTurn = !isGameOver && gameState.turn === color;
    const isBotHere = mode === 'ai' && color === aiColor;
    const isThinkingHere = isBotHere && isAIThinking;
    const capturedPieces = color === 'w' ? material.capturedByWhite : material.capturedByBlack;
    const advantage = color === 'w' ? material.whiteAdvantage : material.blackAdvantage;
    const inCheck = gameState.inCheckColor === color && !isGameOver;
    const info = getPlayerInfo(color);
    const hasPremoveHere = Boolean(premove) && playerControlledColor === color;

    return (
      <div
        className="w-full px-3 py-2 rounded-xl border flex items-center justify-between gap-2.5 transition-colors"
        style={{
          backgroundColor: isTurn ? activeTheme.bgCard : activeTheme.bgSecondary,
          borderColor: isTurn ? activeTheme.borderActive : activeTheme.border
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-base relative"
            style={{
              backgroundColor: isBotHere
                ? `${selectedBot.accentColor}22`
                : color === 'w'
                ? '#e2e8f0'
                : '#0f172a',
              borderColor: isTurn
                ? isBotHere
                  ? selectedBot.accentColor
                  : activeTheme.accent
                : 'rgba(255,255,255,0.14)'
            }}
          >
            {isBotHere ? (
              <span aria-hidden="true">{selectedBot.avatar}</span>
            ) : (
              <ChessPieceSvg piece={{ color, type: 'k' }} className="w-6 h-6" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {info.name}
              </span>
              {info.elo !== null && (
                <span
                  className="text-xs font-mono font-bold tabular-nums shrink-0"
                  style={{
                    color: isBotHere ? selectedBot.accentColor : '#94a3b8'
                  }}
                >
                  ({info.elo})
                </span>
              )}
              {inCheck && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold shrink-0">
                  CHECK
                </span>
              )}
              {isThinkingHere && (
                <span
                  className="text-[11px] font-semibold shrink-0"
                  style={{ color: selectedBot.accentColor }}
                >
                  thinking...
                </span>
              )}
              {hasPremoveHere && (
                <button
                  type="button"
                  onClick={() => {
                    setPremove(null);
                    setPremoveFrom(null);
                  }}
                  className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer hover:bg-rose-500/30 shrink-0"
                  title="Click to cancel premove"
                >
                  <span>Premove</span>
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {capturedPieces.length > 0 && (
              <div className="flex items-center gap-0.5 min-h-[16px] mt-0.5 flex-wrap">
                {capturedPieces.map((cp, idx) => (
                  <div key={`${cp.type}-${idx}`} className="w-3.5 h-3.5 -mr-0.5">
                    <ChessPieceSvg piece={cp} className="w-3.5 h-3.5" />
                  </div>
                ))}
                {advantage > 0 && (
                  <span className="text-[11px] font-mono font-bold text-slate-300 ml-1 tabular-nums">
                    +{advantage}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mode === 'online' && info.connected === false && onlineRoomCode && (
            <span className="text-[10px] font-semibold text-amber-400">offline</span>
          )}
          <span
            className="w-2.5 h-2.5 rounded-sm transition-opacity"
            style={{
              backgroundColor: isTurn
                ? isBotHere
                  ? selectedBot.accentColor
                  : activeTheme.accent
                : 'rgba(148,163,184,0.22)'
            }}
            aria-label={isTurn ? 'Active turn' : 'Waiting'}
          />
        </div>
      </div>
    );
  };

  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const endBanner = getEndBannerCopy();
  const hasVotedRematch =
    (onlineMyColor === 'w' || onlineMyColor === 'b') &&
    onlineRematchVotes.includes(onlineMyColor);

  return (
    <div
      ref={studioRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 overflow-y-auto p-3 sm:p-5 lg:p-6 text-slate-100'
          : 'flex-1 flex flex-col min-h-full p-3 sm:p-5 lg:p-6 text-slate-100'
      }
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div
        className={`${
          isFullscreen ? 'max-w-7xl' : 'max-w-6xl'
        } mx-auto w-full flex flex-col lg:flex-row gap-5 items-start`}
      >
        {/* Left Column: Simple, Focused Main Board */}
        <div
          className={`w-full lg:flex-1 flex flex-col items-center gap-2 mx-auto ${
            isFullscreen ? 'max-w-[min(78vh,720px)]' : 'max-w-[610px]'
          }`}
        >
          {/* Slim Top Utility Strip (Fullscreen & Online Code if active) */}
          <div className="w-full flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2 min-w-0">
              {mode === 'online' && onlineRoomCode ? (
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                  Room <span className="text-white">{onlineRoomCode}</span>
                  {onlineMyColor === 'spectator' && (
                    <span className="text-amber-300">(Spectating)</span>
                  )}
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  {isGameOver
                    ? endBanner.title
                    : gameState.turn === 'w'
                    ? 'White to move'
                    : 'Black to move'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsFlipped(f => !f)}
                className="px-2 py-1 rounded-lg border text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: activeTheme.bgSecondary,
                  borderColor: activeTheme.border
                }}
                title="Flip Board"
              >
                <FlipVertical2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flip</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-bold text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: isFullscreen ? activeTheme.accentBadge : activeTheme.bgSecondary,
                  borderColor: isFullscreen ? activeTheme.borderActive : activeTheme.border
                }}
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Board'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {renderPlayerStrip(topColor)}

          {/* Chessboard Container */}
          <div
            onContextMenu={(e) => {
              e.preventDefault();
              setSelectedSquare(null);
              setPremove(null);
              setPremoveFrom(null);
            }}
            className="w-full aspect-square rounded-2xl overflow-hidden border-2 shadow-2xl relative select-none"
            style={{
              borderColor: activeTheme.borderActive,
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.55), 0 0 28px ${activeTheme.accentGlow}`
            }}
          >
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {rows.map((r, visualRowIdx) =>
                cols.map((c, visualColIdx) => {
                  const isLightSquare = (r + c) % 2 === 0;
                  const piece = gameState.board[r][c];
                  const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
                  const isPremoveOriginSelected = premoveFrom?.r === r && premoveFrom?.c === c;
                  const isQueuedPremoveSq =
                    (premove?.from.r === r && premove?.from.c === c) ||
                    (premove?.to.r === r && premove?.to.c === c);
                  const isLastMoveFrom =
                    gameState.lastMove?.from.r === r && gameState.lastMove?.from.c === c;
                  const isLastMoveTo =
                    gameState.lastMove?.to.r === r && gameState.lastMove?.to.c === c;
                  const isHintSquare =
                    hintMove &&
                    ((hintMove.from.r === r && hintMove.from.c === c) ||
                      (hintMove.to.r === r && hintMove.to.c === c));
                  const legalTarget = legalMovesForSelected.find(
                    m => m.to.r === r && m.to.c === c
                  );
                  const isPremoveTarget = premoveTargetSquares.some(
                    sq => sq.r === r && sq.c === c
                  );
                  const isKingInCheckHere =
                    piece?.type === 'k' &&
                    piece.color === gameState.inCheckColor &&
                    !isGameOver;

                  let squareBg = isLightSquare ? palette.light : palette.dark;
                  if (isQueuedPremoveSq) {
                    squareBg = isLightSquare ? '#fda4af' : '#e11d48';
                  } else if (isPremoveOriginSelected) {
                    squareBg = '#fb7185';
                  } else if (isSelected) {
                    squareBg = '#facc15';
                  } else if (isLastMoveFrom || isLastMoveTo) {
                    squareBg = isLightSquare ? '#f5e68c' : '#baca44';
                  }

                  const coordColor = isLightSquare ? palette.coordLight : palette.coordDark;
                  const showRankLabel = visualColIdx === 0;
                  const showFileLabel = visualRowIdx === 7;
                  const canDragThisPiece =
                    Boolean(piece) &&
                    !isGameOver &&
                    ((isHumanTurn && piece?.color === gameState.turn) ||
                      (canPremove && piece?.color === playerControlledColor));

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleSquareClick(r, c)}
                      onDragOver={(e) => {
                        if (dragFrom && (isHumanTurn || canPremove)) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!dragFrom) return;
                        if (dragFrom.r !== r || dragFrom.c !== c) {
                          if (isHumanTurn) {
                            tryMoveToSquare(dragFrom, { r, c });
                          } else if (canPremove) {
                            tryQueuePremove(dragFrom, { r, c });
                          }
                        }
                        setDragFrom(null);
                      }}
                      className="relative w-full h-full flex items-center justify-center focus:outline-none cursor-pointer transition-colors duration-100"
                      style={{
                        backgroundColor: squareBg
                      }}
                      aria-label={`${FILES[c]}${8 - r}`}
                    >
                      {/* Check Radial Alert */}
                      {isKingInCheckHere && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'radial-gradient(circle, rgba(239,68,68,0.85) 15%, rgba(220,38,38,0.4) 65%, transparent 100%)'
                          }}
                        />
                      )}

                      {/* Hint Highlight */}
                      {isHintSquare && !isSelected && (
                        <div
                          className="absolute inset-0 pointer-events-none border-[3px]"
                          style={{ borderColor: activeTheme.accent }}
                        />
                      )}

                      {/* Rank Coordinate (1-8) */}
                      {showRankLabel && (
                        <span
                          className="absolute top-0.5 left-1 text-[10px] font-bold leading-none pointer-events-none"
                          style={{ color: coordColor }}
                        >
                          {8 - r}
                        </span>
                      )}

                      {/* File Coordinate (a-h) */}
                      {showFileLabel && (
                        <span
                          className="absolute bottom-0.5 right-1 text-[10px] font-bold leading-none pointer-events-none"
                          style={{ color: coordColor }}
                        >
                          {FILES[c]}
                        </span>
                      )}

                      {/* Legal Empty Move Dot */}
                      {legalTarget && !piece && !legalTarget.isEnPassant && (
                        <span className="w-[30%] h-[30%] rounded-full bg-black/25 pointer-events-none" />
                      )}

                      {/* Legal Capture / En Passant Ring */}
                      {legalTarget && (piece || legalTarget.isEnPassant) && (
                        <span className="absolute inset-[6%] rounded-full border-[4px] border-black/30 pointer-events-none" />
                      )}

                      {/* Premove Candidate Indicators */}
                      {isPremoveTarget && !piece && (
                        <span className="w-[26%] h-[26%] rounded-full bg-rose-600/45 pointer-events-none" />
                      )}
                      {isPremoveTarget && piece && (
                        <span className="absolute inset-[6%] rounded-full border-[4px] border-rose-600/55 pointer-events-none" />
                      )}

                      {/* Chess Piece */}
                      {piece && (
                        <div
                          draggable={canDragThisPiece}
                          onDragStart={() => {
                            if (!canDragThisPiece) return;
                            setDragFrom({ r, c });
                            if (canPremove) {
                              setPremoveFrom({ r, c });
                            } else {
                              setSelectedSquare({ r, c });
                            }
                          }}
                          onDragEnd={() => setDragFrom(null)}
                          className={`w-full h-full flex items-center justify-center transition-transform duration-150 ${
                            isSelected || isPremoveOriginSelected ? 'scale-108' : 'hover:scale-105'
                          }`}
                        >
                          <ChessPieceSvg piece={piece} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Pawn Promotion Picker Modal */}
            {pendingPromotion && (
              <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div
                  className="p-5 rounded-2xl border shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.borderActive
                  }}
                >
                  <h3 className="text-sm font-extrabold text-white">Choose Promotion Piece</h3>
                  <div className="grid grid-cols-4 gap-2 w-full">
                    {(['q', 'r', 'b', 'n'] as PromotionPieceType[]).map(pType => (
                      <button
                        key={pType}
                        type="button"
                        onClick={() => handlePromotionChoice(pType)}
                        className="aspect-square rounded-xl border bg-white/5 hover:bg-white/15 flex flex-col items-center justify-center p-2 cursor-pointer transition-transform hover:scale-105"
                        style={{ borderColor: activeTheme.border }}
                        title={
                          pType === 'q'
                            ? 'Queen'
                            : pType === 'r'
                            ? 'Rook'
                            : pType === 'b'
                            ? 'Bishop'
                            : 'Knight'
                        }
                      >
                        <ChessPieceSvg
                          piece={{ color: gameState.turn, type: pType }}
                          className="w-10 h-10"
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingPromotion(null)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* End Game Result Overlay */}
            {isGameOver && showEndOverlay && (
              <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div
                  className="p-6 rounded-2xl border shadow-2xl flex flex-col items-center text-center gap-3 max-w-sm w-full"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.borderActive
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: activeTheme.accentBadge }}
                  >
                    <Trophy className="w-6 h-6" style={{ color: activeTheme.accent }} />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{endBanner.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{endBanner.subtitle}</p>
                  <div className="flex items-center gap-2.5 w-full mt-2">
                    {mode === 'online' ? (
                      onlineMyColor !== 'spectator' && (
                        <button
                          type="button"
                          onClick={() => startNewGame('online')}
                          disabled={hasVotedRematch}
                          className="flex-1 py-2.5 px-4 rounded-xl text-black font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-60"
                          style={{ backgroundColor: activeTheme.accent }}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          {hasVotedRematch
                            ? `Waiting (${onlineRematchVotes.length}/2)`
                            : onlineRematchVotes.length > 0
                            ? 'Accept Rematch (1/2)'
                            : 'Rematch'}
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => startNewGame()}
                        className="flex-1 py-2.5 px-4 rounded-xl text-black font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                        style={{ backgroundColor: activeTheme.accent }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Play Again
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowEndOverlay(false)}
                      className="py-2.5 px-4 rounded-xl border text-xs font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                      style={{ borderColor: activeTheme.border }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Board
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {renderPlayerStrip(bottomColor)}
        </div>

        {/* Right Column: Match Setup, Bots / Room Code, Controls & Move History */}
        <div
          className="w-full lg:w-88 xl:w-96 rounded-2xl border p-4 flex flex-col gap-3.5 shadow-xl"
          style={{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.border
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">Chess Studio</h1>
              <p className="text-xs text-slate-400">
                {mode === 'ai'
                  ? `vs ${selectedBot.name} (${selectedBot.rating})`
                  : mode === 'online'
                  ? onlineRoomCode
                    ? `Online Room · ${onlineRoomCode}`
                    : 'Online Room Match'
                  : 'Pass & Play · 2 Players'}
              </p>
            </div>
            {mode !== 'online' && (
              <button
                type="button"
                onClick={() => startNewGame()}
                className="px-3 py-2 rounded-xl text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md hover:opacity-95 transition-opacity"
                style={{ backgroundColor: activeTheme.accent }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Match
              </button>
            )}
          </div>

          {/* 3-Mode Toggle: vs AI | Pass & Play | Online Room */}
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-xl border"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              borderColor: activeTheme.border
            }}
          >
            <button
              type="button"
              onClick={() => handleModeChange('ai')}
              className={`py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'ai' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'ai' ? activeTheme.accent : undefined }}
            >
              <Bot className="w-3.5 h-3.5" />
              vs AI
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('pvp')}
              className={`py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'pvp' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'pvp' ? activeTheme.accent : undefined }}
            >
              <Users className="w-3.5 h-3.5" />
              Pass &amp; Play
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('online')}
              className={`py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'online' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'online' ? activeTheme.accent : undefined }}
            >
              <Globe className="w-3.5 h-3.5" />
              Room Code
            </button>
          </div>

          {/* Mode-Specific Panel */}
          {mode === 'ai' ? (
            <div className="flex flex-col gap-3">
              {/* Compact Bot Quote Card inside sidebar */}
              <div
                className="px-3 py-2.5 rounded-xl border flex items-start gap-2.5"
                style={{
                  backgroundColor: activeTheme.bgSecondary,
                  borderColor: activeTheme.border
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${selectedBot.accentColor}20`,
                    borderColor: `${selectedBot.accentColor}55`
                  }}
                >
                  <span aria-hidden="true">{selectedBot.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold truncate" style={{ color: selectedBot.accentColor }}>
                      {selectedBot.name} ({selectedBot.rating})
                    </span>
                    <span className="truncate font-mono text-slate-400 text-[10px] max-w-[46%]">
                      {activeOpening ? `Book: ${activeOpening}` : selectedBot.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 leading-snug">
                    &ldquo;{botQuote}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-300">
                    Choose Bot ({CHESS_BOTS.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const pool = filteredBots.filter(b => b.id !== selectedBot.id);
                      const targetPool = pool.length > 0 ? pool : CHESS_BOTS;
                      const randomBot = targetPool[Math.floor(Math.random() * targetPool.length)];
                      handleSelectBot(randomBot);
                    }}
                    className="px-2 py-1 rounded-lg border text-[11px] font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
                    style={{
                      backgroundColor: activeTheme.bgSecondary,
                      borderColor: activeTheme.border
                    }}
                    title="Pick Random Bot"
                  >
                    <Shuffle className="w-3 h-3" style={{ color: activeTheme.accent }} />
                    Random
                  </button>
                </div>

                {/* Tier Filter */}
                <div className="grid grid-cols-5 gap-1">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'easy', label: 'Beginner' },
                      { id: 'medium', label: 'Club' },
                      { id: 'hard', label: 'Master' },
                      { id: 'expert', label: 'GM' }
                    ] as { id: 'all' | ChessBot['difficulty']; label: string }[]
                  ).map(tier => {
                    const active = botTierFilter === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setBotTierFilter(tier.id)}
                        className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate transition-colors ${
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

                <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-1.5">
                  {filteredBots.map(bot => {
                    const active = bot.id === selectedBot.id;
                    return (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => handleSelectBot(bot)}
                        className={`w-full px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          active ? 'text-white shadow-sm' : 'text-slate-300 hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: active
                            ? activeTheme.accentBadge
                            : activeTheme.bgSecondary,
                          borderColor: active ? bot.accentColor : activeTheme.border
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0"
                          style={{
                            backgroundColor: `${bot.accentColor}22`,
                            borderColor: `${bot.accentColor}55`
                          }}
                        >
                          <span aria-hidden="true">{bot.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-extrabold truncate">{bot.name}</span>
                            <span
                              className="text-[11px] font-mono font-bold tabular-nums shrink-0"
                              style={{ color: bot.accentColor }}
                            >
                              ({bot.rating})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {DIFFICULTY_LABELS[bot.difficulty]} · {bot.signatureOpening}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                  {selectedBot.bio}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300">Play As</span>
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'w', label: 'White' },
                      { id: 'b', label: 'Black' },
                      { id: 'random', label: 'Random' }
                    ] as { id: PlayerSidePref; label: string }[]
                  ).map(opt => {
                    const active = sidePref === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSidePrefChange(opt.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                          active ? 'text-black' : 'text-slate-300 hover:text-white'
                        }`}
                        style={{
                          backgroundColor: active
                            ? activeTheme.accent
                            : activeTheme.bgSecondary,
                          borderColor: active ? activeTheme.accent : activeTheme.border
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : mode === 'online' ? (
            <div className="flex flex-col gap-3">
              {/* Nickname input */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="chess-player-name"
                  className="text-xs font-bold text-slate-300 shrink-0"
                >
                  Your Name
                </label>
                <input
                  id="chess-player-name"
                  type="text"
                  maxLength={24}
                  value={playerName}
                  onChange={e => handlePlayerNameChange(e.target.value)}
                  placeholder="Player"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border bg-black/30 text-xs text-white focus:outline-none"
                  style={{ borderColor: activeTheme.border }}
                />
              </div>

              {onlineError && (
                <div className="px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/15 text-xs text-rose-200">
                  {onlineError}
                </div>
              )}

              {!onlineRoomCode ? (
                <div
                  className="p-3 rounded-xl border flex flex-col gap-3"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.border
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">Host Side</span>
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'w', label: 'White' },
                          { id: 'b', label: 'Black' },
                          { id: 'random', label: 'Random' }
                        ] as { id: PlayerSidePref; label: string }[]
                      ).map(opt => {
                        const active = sidePref === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSidePref(opt.id)}
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              active ? 'text-black' : 'text-slate-300 hover:text-white'
                            }`}
                            style={{
                              backgroundColor: active ? activeTheme.accent : undefined,
                              borderColor: active ? activeTheme.accent : activeTheme.border
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateRoom}
                    disabled={wsStatus === 'connecting'}
                    className="w-full py-2.5 px-3 rounded-xl text-black font-extrabold text-xs cursor-pointer shadow-md hover:opacity-95 disabled:opacity-60"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    {wsStatus === 'connecting' ? 'Connecting...' : 'Create Room Code'}
                  </button>

                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                    <input
                      type="text"
                      maxLength={8}
                      value={joinCodeInput}
                      onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleJoinRoom();
                      }}
                      placeholder="Enter Room Code"
                      className="flex-1 px-2.5 py-2 rounded-lg border bg-black/30 text-xs font-mono font-bold tracking-widest uppercase text-white focus:outline-none"
                      style={{ borderColor: activeTheme.border }}
                    />
                    <button
                      type="button"
                      onClick={() => handleJoinRoom()}
                      disabled={wsStatus === 'connecting' || !joinCodeInput.trim()}
                      className="px-3.5 py-2 rounded-lg border text-xs font-extrabold text-white hover:bg-white/10 cursor-pointer disabled:opacity-40 shrink-0"
                      style={{ borderColor: activeTheme.borderActive }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-3 rounded-xl border flex flex-col gap-2.5"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.borderActive
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-slate-400">Share Room Code</div>
                      <div className="text-xl font-mono font-extrabold tracking-widest text-white select-all">
                        {onlineRoomCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopyRoom('code')}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center gap-1"
                        style={{ borderColor: activeTheme.border }}
                        title="Copy Room Code"
                      >
                        {copiedType === 'code' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedType === 'code' ? 'Copied' : 'Code'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyRoom('link')}
                        className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center gap-1"
                        style={{ borderColor: activeTheme.border }}
                        title="Copy Direct Invite Link"
                      >
                        {copiedType === 'link' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedType === 'link' ? 'Copied' : 'Link'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/10">
                    <span>
                      {onlinePlayers.w && onlinePlayers.b
                        ? 'Both players connected'
                        : 'Waiting for friend to join...'}
                    </span>
                    <button
                      type="button"
                      onClick={handleLeaveRoom}
                      className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      Leave
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Auto-Flip Board</span>
                <span className="text-[11px] text-slate-400">
                  Rotate after each turn for pass-and-play
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !autoFlipPvp;
                  setAutoFlipPvp(next);
                  if (next) setIsFlipped(gameState.turn === 'b');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                  autoFlipPvp ? 'text-black' : 'text-slate-300 bg-white/10'
                }`}
                style={{ backgroundColor: autoFlipPvp ? activeTheme.accent : undefined }}
              >
                {autoFlipPvp ? 'On' : 'Off'}
              </button>
            </div>
          )}

          {/* Board Theme Picker */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Board Style
            </span>
            <div className="flex items-center gap-1.5">
              {BOARD_PALETTES.map(bp => {
                const active = paletteId === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => setPaletteId(bp.id)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      active ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: active ? activeTheme.accentBadge : activeTheme.bgSecondary,
                      borderColor: active ? activeTheme.accent : activeTheme.border
                    }}
                    title={bp.label}
                  >
                    <span
                      className="w-3 h-3 rounded-sm border border-black/30 shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${bp.light} 50%, ${bp.dark} 50%)`
                      }}
                    />
                    <span>{bp.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="grid grid-cols-5 gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={mode === 'online' || snapshots.length === 0 || isAIThinking}
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title={mode === 'online' ? 'Undo unavailable online' : 'Undo Move'}
            >
              <Undo2 className="w-4 h-4" />
              <span className="text-[10px]">Undo</span>
            </button>

            <button
              type="button"
              onClick={handleHint}
              disabled={mode === 'online' || !isHumanTurn || isGameOver}
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title={mode === 'online' ? 'Hint unavailable online' : 'Suggest Strong Move'}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-[10px]">Hint</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(f => !f)}
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title="Flip Board"
            >
              <FlipVertical2 className="w-4 h-4" />
              <span className="text-[10px]">Flip</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(s => !s)}
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" style={{ color: activeTheme.accent }} />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-[10px]">{soundEnabled ? 'Sound' : 'Muted'}</span>
            </button>

            <button
              type="button"
              onClick={handleResign}
              disabled={
                isGameOver ||
                (mode === 'online' && (!onlineRoomCode || onlineMyColor === 'spectator'))
              }
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500/10 text-rose-400"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title="Resign Match"
            >
              <Flag className="w-4 h-4" />
              <span className="text-[10px]">Resign</span>
            </button>
          </div>

          {/* Game Status Strip when overlay hidden or active */}
          {isGameOver && !showEndOverlay && (
            <div
              className="px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-white truncate">{endBanner.title}</div>
                <div className="text-[11px] text-slate-300 truncate">{endBanner.subtitle}</div>
              </div>
              {mode === 'online' ? (
                onlineMyColor !== 'spectator' && (
                  <button
                    type="button"
                    onClick={() => startNewGame('online')}
                    disabled={hasVotedRematch}
                    className="px-3 py-1.5 rounded-lg text-black text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    {hasVotedRematch
                      ? `Wait (${onlineRematchVotes.length}/2)`
                      : 'Rematch'}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => startNewGame()}
                  className="px-3 py-1.5 rounded-lg text-black text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
                  style={{ backgroundColor: activeTheme.accent }}
                >
                  Rematch
                </button>
              )}
            </div>
          )}

          {/* Move History Log */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                Move History
              </span>
              <span className="font-mono tabular-nums text-[11px]">
                {moveHistory.length} {moveHistory.length === 1 ? 'ply' : 'plies'}
              </span>
            </div>

            <div
              ref={moveListRef}
              className="h-44 overflow-y-auto rounded-xl border p-2 font-mono text-xs tabular-nums"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              {pairedMoves.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 font-sans text-xs text-center px-4">
                  Make a move on the board to start the game. Click your piece on opponent&apos;s turn to premove.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {pairedMoves.map(pair => {
                    const isLastPair = pair.moveNumber === pairedMoves.length;
                    return (
                      <div
                        key={pair.moveNumber}
                        className="grid grid-cols-[2.2rem_1fr_1fr] items-center px-2 py-1 rounded-lg hover:bg-white/5"
                      >
                        <span className="text-slate-500">{pair.moveNumber}.</span>
                        <span
                          className={`font-semibold ${
                            isLastPair && !pair.black ? 'text-white' : 'text-slate-200'
                          }`}
                          style={{
                            color: isLastPair && !pair.black ? activeTheme.accent : undefined
                          }}
                        >
                          {pair.white?.san}
                        </span>
                        <span
                          className={`font-semibold ${
                            isLastPair && pair.black ? 'text-white' : 'text-slate-300'
                          }`}
                          style={{
                            color: isLastPair && pair.black ? activeTheme.accent : undefined
                          }}
                        >
                          {pair.black?.san || ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
