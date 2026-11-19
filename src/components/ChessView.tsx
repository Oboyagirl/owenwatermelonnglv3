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
  X,
  Clock,
  BarChart3,
  BookOpen,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Activity,
  Gamepad2,
  Play,
  Send,
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
import {
  AnalysisLine,
  BotMoveDecision,
  CHESS_BOTS,
  ChessBot,
  ChessMove,
  ChessState,
  MoveQuality,
  MoveRecord,
  Piece,
  PieceColor,
  PositionAnalysis,
  PromotionPieceType,
  Square,
  TIME_CONTROLS,
  TimeControlOption,
  analyzePosition,
  applyMove,
  chooseAIMove,
  chooseBotMove,
  classifyMoveQuality,
  computeMaterialAndCaptures,
  createInitialState,
  detectOpening,
  evaluatePositionForSide,
  getBotById,
  getLegalMoves,
  getPremoveTargets,
  getTimeControlById,
  hasOnlyInsufficientMaterialForSide,
  pickBotVoiceline
} from '../utils/chessEngine';
import {
  ChessAuthRequiredError,
  ChessRoomViewPayload,
  claimFirestoreChessTimeout,
  createFirestoreChessRoom,
  joinFirestoreChessRoom,
  leaveFirestoreChessRoom,
  resignFirestoreChessRoom,
  sanitizeRoomCode,
  sendFirestoreChessMove,
  signInGoogleForChess,
  subscribeFirestoreChessRoom,
  voteFirestoreChessRematch
} from '../services/chessRoomService';

interface ChessViewProps {
  activeTheme: ThemeConfig;
}

type GameMode = 'ai' | 'pvp' | 'online';
type PlayerSidePref = 'w' | 'b' | 'random';
type BoardPaletteId =
  | 'wood'
  | 'tournament'
  | 'walnut'
  | 'slate'
  | 'ocean'
  | 'midnight'
  | 'watermelon'
  | 'rose'
  | 'obsidian'
  | 'amber';

interface Premove {
  from: Square;
  to: Square;
}

interface OnlineSeatInfo {
  uid?: string;
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

const CHESS_PALETTE_STORAGE_KEY = 'owen_chess_board_palette';
const CHESS_ACTIVE_MATCH_KEY = 'owen_chess_active_match_v1';

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
    id: 'walnut',
    label: 'Royal Walnut',
    light: '#e6ccb2',
    dark: '#7f5539',
    coordLight: '#5e3c24',
    coordDark: '#f3e5d8'
  },
  {
    id: 'slate',
    label: 'Cyber Slate',
    light: '#cbd5e1',
    dark: '#475569',
    coordLight: '#334155',
    coordDark: '#e2e8f0'
  },
  {
    id: 'ocean',
    label: 'Ocean Cobalt',
    light: '#dbeafe',
    dark: '#2563eb',
    coordLight: '#1e40af',
    coordDark: '#eff6ff'
  },
  {
    id: 'midnight',
    label: 'Midnight Indigo',
    light: '#c7d2fe',
    dark: '#3730a3',
    coordLight: '#312e81',
    coordDark: '#e0e7ff'
  },
  {
    id: 'watermelon',
    label: 'Watermelon',
    light: '#fce7f3',
    dark: '#15803d',
    coordLight: '#166534',
    coordDark: '#fdf2f8'
  },
  {
    id: 'rose',
    label: 'Rose Quartz',
    light: '#fdf2f8',
    dark: '#be185d',
    coordLight: '#9d174d',
    coordDark: '#fdf2f8'
  },
  {
    id: 'obsidian',
    label: 'Obsidian Gold',
    light: '#d6d3d1',
    dark: '#292524',
    coordLight: '#1c1917',
    coordDark: '#e7e5e4'
  },
  {
    id: 'amber',
    label: 'Sunset Amber',
    light: '#fef3c7',
    dark: '#b45309',
    coordLight: '#92400e',
    coordDark: '#fffbeb'
  }
];

const DIFFICULTY_LABELS: Record<ChessBot['difficulty'], string> = {
  easy: 'Beginner',
  medium: 'Club',
  hard: 'Master',
  expert: 'Grandmaster'
};

function formatClockMs(ms: number): string {
  const safe = Math.max(0, ms);
  if (safe < 20_000) {
    const secs = Math.floor(safe / 1000);
    const tenths = Math.floor((safe % 1000) / 100);
    return `0:${String(secs).padStart(2, '0')}.${tenths}`;
  }
  const totalSec = Math.ceil(safe / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatEvalScore(scoreCp: number, mateIn: number | null): string {
  if (mateIn !== null) {
    if (mateIn === 0) return scoreCp >= 0 ? 'M' : '-M';
    return mateIn > 0 ? `M${mateIn}` : `-M${Math.abs(mateIn)}`;
  }
  const pawns = scoreCp / 100;
  if (Math.abs(pawns) < 0.05) return '0.0';
  return `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
}

function getWhiteEvalBarPct(scoreCp: number, mateIn: number | null): number {
  if (mateIn !== null) {
    return scoreCp >= 0 ? 100 : 0;
  }
  const clamped = Math.max(-1600, Math.min(1600, scoreCp));
  const pct = 50 + 50 * (2 / (1 + Math.exp(-0.0038 * clamped)) - 1);
  return Math.max(4, Math.min(96, pct));
}

const QUALITY_META: Record<
  MoveQuality,
  { label: string; short: string; color: string }
> = {
  best: { label: 'Best', short: '★', color: '#22c55e' },
  excellent: { label: 'Excellent', short: '!', color: '#4ade80' },
  good: { label: 'Good', short: '✓', color: '#38bdf8' },
  inaccuracy: { label: 'Inaccuracy', short: '?!', color: '#facc15' },
  mistake: { label: 'Mistake', short: '?', color: '#fb923c' },
  blunder: { label: 'Blunder', short: '??', color: '#f43f5e' }
};

interface GameReviewState {
  status: 'idle' | 'running' | 'done';
  progress: number;
  total: number;
  qualities: Record<number, MoveQuality>;
  whiteAccuracy: number | null;
  blackAccuracy: number | null;
}

const EMPTY_REVIEW: GameReviewState = {
  status: 'idle',
  progress: 0,
  total: 0,
  qualities: {},
  whiteAccuracy: null,
  blackAccuracy: null
};

type OnlineTransport = 'ws' | 'firestore';

function shouldPreferLocalWs(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function getLocalChessWsUrl(): string {
  if (typeof window === 'undefined' || !shouldPreferLocalWs()) return '';
  const host = window.location.host;
  if (!host) return '';
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${host}/ws/chess`;
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

interface DragSession {
  pointerId: number;
  from: Square;
  piece: Piece;
  mode: 'move' | 'premove';
  startX: number;
  startY: number;
  clientX: number;
  clientY: number;
  isDragging: boolean;
  hoverSquare: Square | null;
  squareSize: number;
}

interface SavedLocalChessMatch {
  mode: 'ai' | 'pvp';
  selectedBotId: string;
  sidePref: PlayerSidePref;
  humanColor: PieceColor;
  timeControlId: string;
  moves: ChessMove[];
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  whiteTimeMs: number;
  blackTimeMs: number;
}

function loadSavedLocalChessMatch(): {
  mode: 'ai' | 'pvp';
  selectedBotId: string;
  sidePref: PlayerSidePref;
  humanColor: PieceColor;
  timeControlId: string;
  state: ChessState;
  history: MoveRecord[];
  snapshots: HistorySnapshot[];
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  whiteTimeMs: number;
  blackTimeMs: number;
} | null {
  try {
    const raw = localStorage.getItem(CHESS_ACTIVE_MATCH_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedLocalChessMatch;
    if (!saved || (saved.mode !== 'ai' && saved.mode !== 'pvp') || !Array.isArray(saved.moves)) {
      return null;
    }
    let state = createInitialState();
    const history: MoveRecord[] = [];
    const snapshots: HistorySnapshot[] = [];
    for (const m of saved.moves) {
      snapshots.push({ state, history: [...history] });
      const res = applyMove(state, m);
      state = res.nextState;
      history.push(res.record);
    }
    const tc = getTimeControlById(saved.timeControlId || 'none');
    return {
      mode: saved.mode,
      selectedBotId: saved.selectedBotId || 'clara',
      sidePref: saved.sidePref || 'w',
      humanColor: saved.humanColor === 'b' ? 'b' : 'w',
      timeControlId: tc.id,
      state,
      history,
      snapshots,
      resignedWinner: saved.resignedWinner || null,
      timeoutWinner: saved.timeoutWinner || null,
      whiteTimeMs: typeof saved.whiteTimeMs === 'number' ? saved.whiteTimeMs : tc.baseMs,
      blackTimeMs: typeof saved.blackTimeMs === 'number' ? saved.blackTimeMs : tc.baseMs
    };
  } catch {
    return null;
  }
}

export const ChessView: React.FC<ChessViewProps> = ({ activeTheme }) => {
  const { user, profile } = useAuth();
  const {
    pendingChessJoinCode,
    clearPendingChessJoinCode,
    trackedChessRoom,
    setTrackedChessRoom,
    pushTurnToast,
    contacts,
    directoryProfiles,
    allInvites,
    incomingInvites,
    lastAcceptedInvite,
    acceptGameInvite,
    declineGameInvite
  } = useNotifications();
  const initialRestoredMatch = useMemo(() => loadSavedLocalChessMatch(), []);

  // Match Configuration
  const [mode, setMode] = useState<GameMode>(() => initialRestoredMatch?.mode || 'ai');
  const [selectedBotId, setSelectedBotId] = useState<string>(() => initialRestoredMatch?.selectedBotId || 'clara');
  const [botTierFilter, setBotTierFilter] = useState<'all' | ChessBot['difficulty']>('all');
  const [sidePref, setSidePref] = useState<PlayerSidePref>(() => initialRestoredMatch?.sidePref || 'w');
  const [humanColor, setHumanColor] = useState<PieceColor>(() => initialRestoredMatch?.humanColor || 'w');
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
    pickBotVoiceline(getBotById(initialRestoredMatch?.selectedBotId || 'clara'), 'gameStart')
  );
  const [activeOpening, setActiveOpening] = useState<string | null>(null);
  const lastOpeningCommentedRef = useRef<boolean>(false);

  // Visual & Fullscreen Preferences
  const [paletteId, setPaletteId] = useState<BoardPaletteId>(() => {
    try {
      const saved = localStorage.getItem(CHESS_PALETTE_STORAGE_KEY) as BoardPaletteId | null;
      if (saved && BOARD_PALETTES.some(p => p.id === saved)) return saved;
    } catch {}
    return 'wood';
  });
  const [isFlipped, setIsFlipped] = useState(
    () => initialRestoredMatch?.mode === 'ai' && initialRestoredMatch?.humanColor === 'b'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const studioRef = useRef<HTMLDivElement | null>(null);

  // Game State & Timeline
  const [gameState, setGameState] = useState<ChessState>(() => initialRestoredMatch?.state || createInitialState());
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>(() => initialRestoredMatch?.history || []);
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>(() => initialRestoredMatch?.snapshots || []);
  const [resignedWinner, setResignedWinner] = useState<PieceColor | null>(
    () => initialRestoredMatch?.resignedWinner || null
  );
  const [timeoutWinner, setTimeoutWinner] = useState<PieceColor | 'draw' | null>(
    () => initialRestoredMatch?.timeoutWinner || null
  );
  const [showEndOverlay, setShowEndOverlay] = useState(true);

  // Time Control / Chess Clock State
  const [timeControlId, setTimeControlId] = useState<string>(() => initialRestoredMatch?.timeControlId || 'none');
  const [onlineTimeControlId, setOnlineTimeControlId] = useState<string | null>(null);
  const [whiteTimeMs, setWhiteTimeMs] = useState<number>(() => initialRestoredMatch?.whiteTimeMs || 0);
  const [blackTimeMs, setBlackTimeMs] = useState<number>(() => initialRestoredMatch?.blackTimeMs || 0);
  const clockAnchorRef = useRef<{
    whiteMs: number;
    blackMs: number;
    activeColor: PieceColor | null;
    anchoredAt: number;
  }>({
    whiteMs: initialRestoredMatch?.whiteTimeMs || 0,
    blackMs: initialRestoredMatch?.blackTimeMs || 0,
    activeColor:
      initialRestoredMatch &&
      initialRestoredMatch.history.length > 0 &&
      !initialRestoredMatch.resignedWinner &&
      !initialRestoredMatch.timeoutWinner &&
      initialRestoredMatch.state.status !== 'checkmate'
        ? initialRestoredMatch.state.turn
        : null,
    anchoredAt: Date.now()
  });

  // Optional Analysis & Move Explorer State (OFF by default)
  const [analysisEnabled, setAnalysisEnabled] = useState<boolean>(false);
  const [showBestArrow, setShowBestArrow] = useState<boolean>(true);
  const [viewPly, setViewPly] = useState<number | null>(null);
  const [positionAnalysis, setPositionAnalysis] = useState<PositionAnalysis | null>(null);
  const [isAnalyzingPos, setIsAnalyzingPos] = useState<boolean>(false);
  const [gameReview, setGameReview] = useState<GameReviewState>(EMPTY_REVIEW);
  const reviewTokenRef = useRef<number>(0);

  // Interaction, Pointer Drag-to-Place & Premove State
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<ChessMove | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [dragOverlay, setDragOverlay] = useState<DragSession | null>(null);
  const boardGridRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);
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
  const [onlineAuthNeeded, setOnlineAuthNeeded] = useState(false);
  const [onlineSigningIn, setOnlineSigningIn] = useState(false);
  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);
  const [invitingFriendUid, setInvitingFriendUid] = useState<string | null>(null);
  const [invitedFriendUids, setInvitedFriendUids] = useState<Set<string>>(() => new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const firestoreUnsubRef = useRef<(() => void) | null>(null);
  const activeTransportRef = useRef<OnlineTransport>(
    shouldPreferLocalWs() ? 'ws' : 'firestore'
  );
  const pendingAuthActionRef = useRef<
    { kind: 'create' } | { kind: 'join'; code: string } | null
  >(null);
  const timeoutClaimedPlyRef = useRef<number>(-1);
  const lastOnlineHistoryLenRef = useRef<number>(0);
  const lastOnlineRoomRef = useRef<string | null>(null);
  const pendingOnlineMoveRef = useRef<{
    code: string;
    expectedMoveIndex: number;
    rollbackState: ChessState;
    rollbackHistory: MoveRecord[];
    rollbackClockAnchor: {
      whiteMs: number;
      blackMs: number;
      activeColor: PieceColor | null;
      anchoredAt: number;
    };
  } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const moveListRef = useRef<HTMLDivElement | null>(null);

  const palette = useMemo(
    () => BOARD_PALETTES.find(p => p.id === paletteId) || BOARD_PALETTES[0],
    [paletteId]
  );

  const effectiveTimeControl: TimeControlOption = useMemo(() => {
    if (mode === 'online' && onlineRoomCode && onlineTimeControlId) {
      return getTimeControlById(onlineTimeControlId);
    }
    return getTimeControlById(timeControlId);
  }, [mode, onlineRoomCode, onlineTimeControlId, timeControlId]);

  // Persist board palette choice
  const handleSelectPalette = useCallback((nextId: BoardPaletteId) => {
    setPaletteId(nextId);
    try {
      localStorage.setItem(CHESS_PALETTE_STORAGE_KEY, nextId);
    } catch {}
  }, []);

  // Persist active local AI / PvP chess match progress automatically
  useEffect(() => {
    if (mode !== 'ai' && mode !== 'pvp') return;
    try {
      const payload: SavedLocalChessMatch = {
        mode,
        selectedBotId,
        sidePref,
        humanColor,
        timeControlId,
        moves: moveHistory.map(rec => rec.move),
        resignedWinner,
        timeoutWinner,
        whiteTimeMs,
        blackTimeMs
      };
      localStorage.setItem(CHESS_ACTIVE_MATCH_KEY, JSON.stringify(payload));
    } catch {}
  }, [
    mode,
    selectedBotId,
    sidePref,
    humanColor,
    timeControlId,
    moveHistory,
    resignedWinner,
    timeoutWinner,
    whiteTimeMs,
    blackTimeMs
  ]);

  // Keep default name synced to signed-in profile if still generic
  useEffect(() => {
    const preferred = profile?.displayName || user?.displayName;
    if (preferred && (playerName === 'Player' || !playerName.trim())) {
      setPlayerName(preferred.slice(0, 24));
    }
  }, [profile?.displayName, user?.displayName, playerName]);

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
    Boolean(timeoutWinner) ||
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
    (viewPly === null || viewPly === moveHistory.length) &&
    (mode === 'pvp'
      ? true
      : mode === 'ai'
      ? gameState.turn === humanColor
      : Boolean(onlineRoomCode) &&
        (onlineMyColor === 'w' || onlineMyColor === 'b') &&
        gameState.turn === onlineMyColor);

  const canPremove =
    !isGameOver &&
    (viewPly === null || viewPly === moveHistory.length) &&
    playerControlledColor !== null &&
    gameState.turn !== playerControlledColor &&
    (mode === 'ai' || (mode === 'online' && Boolean(onlineRoomCode)));

  const speakAsBot = useCallback(
    (bot: ChessBot, event: Parameters<typeof pickBotVoiceline>[1]) => {
      setBotQuote(prev => pickBotVoiceline(bot, event, prev));
    },
    []
  );

  // Online Room Connection Management (Local WebSocket on localhost, Firestore Real-Time everywhere else)
  const closeFirestoreRoom = useCallback(() => {
    if (firestoreUnsubRef.current) {
      try {
        firestoreUnsubRef.current();
      } catch {}
      firestoreUnsubRef.current = null;
    }
  }, []);

  const closeWebSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setWsStatus('disconnected');
  }, []);

  const applyOnlineRoomSync = useCallback(
    (msg: ChessRoomViewPayload) => {
      setOnlineError(null);
      setOnlineAuthNeeded(false);
      setWsStatus('connected');

      const nextHistory: MoveRecord[] = Array.isArray(msg.history) ? msg.history : [];
      const nextState: ChessState = msg.state;
      const endedByEvent =
        Boolean(msg.resignedWinner) ||
        Boolean(msg.timeoutWinner || msg.clock?.timeoutWinner);

      const pending = pendingOnlineMoveRef.current;
      if (pending && pending.code === msg.code) {
        if (!endedByEvent && nextHistory.length < pending.expectedMoveIndex + 1) {
          // Ignore stale pre-move snapshot while our optimistic move is in flight
          setOnlineMyColor(msg.myColor || 'spectator');
          setOnlinePlayers(msg.players || { w: null, b: null });
          setOnlineRematchVotes(Array.isArray(msg.rematchVotes) ? msg.rematchVotes : []);
          return;
        }
        pendingOnlineMoveRef.current = null;
      }

      const prevRoom = lastOnlineRoomRef.current;
      const prevLen = lastOnlineHistoryLenRef.current;

      const roomChanged = prevRoom !== msg.code;
      const boardChanged =
        roomChanged ||
        nextHistory.length !== prevLen ||
        (nextHistory.length === 0 && prevLen > 0) ||
        endedByEvent;

      lastOnlineRoomRef.current = msg.code;
      lastOnlineHistoryLenRef.current = nextHistory.length;

      setOnlineRoomCode(msg.code);
      setOnlineMyColor(msg.myColor || 'spectator');
      setOnlinePlayers(msg.players || { w: null, b: null });
      setOnlineRematchVotes(Array.isArray(msg.rematchVotes) ? msg.rematchVotes : []);
      setGameState(nextState);
      setMoveHistory(nextHistory);
      if (boardChanged) {
        setSnapshots([]);
        setViewPly(null);
        reviewTokenRef.current += 1;
        setGameReview(EMPTY_REVIEW);
        setSelectedSquare(null);
        setPendingPromotion(null);
        setHintMove(null);
      }
      setResignedWinner(msg.resignedWinner || null);
      setTimeoutWinner(msg.timeoutWinner || msg.clock?.timeoutWinner || null);
      setIsAIThinking(false);

      if (msg.clock) {
        const wMs = Number(msg.clock.whiteTimeMs ?? 0);
        const bMs = Number(msg.clock.blackTimeMs ?? 0);
        setOnlineTimeControlId(msg.clock.timeControlId || 'none');
        setWhiteTimeMs(wMs);
        setBlackTimeMs(bMs);
        clockAnchorRef.current = {
          whiteMs: wMs,
          blackMs: bMs,
          activeColor: msg.clock.activeColor || null,
          anchoredAt: Date.now()
        };
      }

      if (roomChanged) {
        timeoutClaimedPlyRef.current = -1;
        setIsFlipped(msg.myColor === 'b');
        setShowEndOverlay(true);
        setPremove(null);
        setPremoveFrom(null);
      } else {
        const ended =
          endedByEvent ||
          nextState.status === 'checkmate' ||
          nextState.status === 'stalemate' ||
          nextState.status.startsWith('draw_');

        if (nextHistory.length === 0 && prevLen > 0) {
          timeoutClaimedPlyRef.current = -1;
          setIsFlipped(msg.myColor === 'b');
          setShowEndOverlay(true);
          setPremove(null);
          setPremoveFrom(null);
        } else if (
          ended &&
          (nextHistory.length > prevLen || endedByEvent)
        ) {
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

          if (
            (msg.myColor === 'w' || msg.myColor === 'b') &&
            nextState.turn === msg.myColor &&
            typeof document !== 'undefined' &&
            document.visibilityState === 'hidden'
          ) {
            const opp = msg.myColor === 'w' ? msg.players?.b?.name : msg.players?.w?.name;
            pushTurnToast({
              space: 'chess',
              title: "It's your turn in Chess!",
              body: `${opp || 'Opponent'} moved in room ${msg.code}.`,
              roomCode: msg.code
            });
          }
        }
      }
    },
    [playSound, pushTurnToast]
  );

  const startFirestoreRoomSubscription = useCallback(
    (code: string, uid: string) => {
      closeFirestoreRoom();
      activeTransportRef.current = 'firestore';
      firestoreUnsubRef.current = subscribeFirestoreChessRoom({
        code,
        uid,
        playerId,
        onSync: (payload) => {
          applyOnlineRoomSync(payload);
        },
        onError: (err) => {
          setWsStatus('disconnected');
          setOnlineError(err.message || 'Could not sync online room.');
        }
      });
    },
    [closeFirestoreRoom, playerId, applyOnlineRoomSync]
  );

  const createOnlineViaFirestore = useCallback(async () => {
    setOnlineError(null);
    setOnlineAuthNeeded(false);
    setWsStatus('connecting');
    pendingOnlineMoveRef.current = null;
    closeWebSocket();
    closeFirestoreRoom();
    activeTransportRef.current = 'firestore';

    try {
      const { code, uid } = await createFirestoreChessRoom({
        playerId,
        playerName: playerName.trim() || 'Player',
        preferredColor: sidePref,
        timeControlId
      });
      pendingAuthActionRef.current = null;
      startFirestoreRoomSubscription(code, uid);
    } catch (err) {
      setWsStatus('disconnected');
      if (err instanceof ChessAuthRequiredError) {
        pendingAuthActionRef.current = { kind: 'create' };
        setOnlineAuthNeeded(true);
        setOnlineError(err.message);
      } else {
        setOnlineError(
          err instanceof Error ? err.message : 'Failed to create online room.'
        );
      }
    }
  }, [
    playerId,
    playerName,
    sidePref,
    timeControlId,
    closeWebSocket,
    closeFirestoreRoom,
    startFirestoreRoomSubscription
  ]);

  const joinOnlineViaFirestore = useCallback(
    async (cleanCode: string) => {
      setOnlineError(null);
      setOnlineAuthNeeded(false);
      setWsStatus('connecting');
      pendingOnlineMoveRef.current = null;
      closeWebSocket();
      closeFirestoreRoom();
      activeTransportRef.current = 'firestore';

      try {
        const { code, uid, payload } = await joinFirestoreChessRoom({
          code: cleanCode,
          playerId,
          playerName: playerName.trim() || 'Player'
        });
        pendingAuthActionRef.current = null;
        applyOnlineRoomSync(payload);
        startFirestoreRoomSubscription(code, uid);
      } catch (err) {
        setWsStatus('disconnected');
        if (err instanceof ChessAuthRequiredError) {
          pendingAuthActionRef.current = { kind: 'join', code: cleanCode };
          setOnlineAuthNeeded(true);
          setOnlineError(err.message);
        } else {
          setTrackedChessRoom(null);
          setOnlineError(
            err instanceof Error ? err.message : `Could not join room "${cleanCode}".`
          );
        }
      }
    },
    [
      playerId,
      playerName,
      closeWebSocket,
      closeFirestoreRoom,
      applyOnlineRoomSync,
      startFirestoreRoomSubscription,
      setTrackedChessRoom
    ]
  );

  const connectAndSendWs = useCallback(
    (payload?: Record<string, unknown>, onUnavailable?: () => void) => {
      const url = getLocalChessWsUrl();
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
          existing.onopen = (ev) => {
            prevOnOpen?.call(existing, ev);
            sendPayload(existing);
          };
        }
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
          const pending = pendingOnlineMoveRef.current;
          if (pending) {
            pendingOnlineMoveRef.current = null;
            lastOnlineHistoryLenRef.current = pending.rollbackHistory.length;
            setGameState(pending.rollbackState);
            setMoveHistory(pending.rollbackHistory);
            clockAnchorRef.current = { ...pending.rollbackClockAnchor };
            setWhiteTimeMs(pending.rollbackClockAnchor.whiteMs);
            setBlackTimeMs(pending.rollbackClockAnchor.blackMs);
          }
          setOnlineError(String(msg.message || 'Room error occurred.'));
          return;
        }

        if (msg.type === 'room:sync') {
          applyOnlineRoomSync(msg as ChessRoomViewPayload);
        }
      };

      ws.onerror = () => {
        if (wsRef.current === ws) {
          closeWebSocket();
        }
        if (onUnavailable) {
          onUnavailable();
        } else {
          setOnlineError('Connection interrupted. Check your network and try again.');
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
          setWsStatus('disconnected');
        }
      };
    },
    [playerId, playerName, applyOnlineRoomSync, closeWebSocket]
  );

  // Heartbeat keep-alive while local WebSocket is open
  useEffect(() => {
    if (mode !== 'online' || activeTransportRef.current !== 'ws') return;
    const interval = window.setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
    return () => window.clearInterval(interval);
  }, [mode]);

  // Cleanup WebSocket and Firestore subscriptions on unmount
  useEffect(() => {
    return () => {
      closeWebSocket();
      closeFirestoreRoom();
    };
  }, [closeWebSocket, closeFirestoreRoom]);

  // Auto-join ?chessRoom=CODE from URL or rejoin tracked Firestore room on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('chessRoom');
      if (roomParam) {
        const cleanCode = sanitizeRoomCode(roomParam);
        if (cleanCode) {
          setMode('online');
          setJoinCodeInput(cleanCode);
          if (shouldPreferLocalWs()) {
            connectAndSendWs(
              {
                type: 'room:join',
                code: cleanCode,
                playerId,
                playerName: playerName.trim() || 'Player'
              },
              () => {
                void joinOnlineViaFirestore(cleanCode);
              }
            );
          } else {
            void joinOnlineViaFirestore(cleanCode);
          }
          return;
        }
      }
      if (!pendingChessJoinCode && trackedChessRoom?.code && !onlineRoomCode) {
        setMode('online');
        setJoinCodeInput(trackedChessRoom.code);
        void joinOnlineViaFirestore(trackedChessRoom.code);
      }
    } catch {}
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-join when clicking "Accept" on a game invite or "Jump to Match" on a turn notification
  useEffect(() => {
    if (!pendingChessJoinCode) return;
    const cleanCode = sanitizeRoomCode(pendingChessJoinCode);
    clearPendingChessJoinCode();
    if (!cleanCode) return;
    setMode('online');
    setJoinCodeInput(cleanCode);
    void joinOnlineViaFirestore(cleanCode);
  }, [pendingChessJoinCode, clearPendingChessJoinCode, joinOnlineViaFirestore]);

  // Keep global background turn watcher synced for Firestore chess rooms
  useEffect(() => {
    if (
      mode === 'online' &&
      activeTransportRef.current === 'firestore' &&
      onlineRoomCode &&
      (onlineMyColor === 'w' || onlineMyColor === 'b') &&
      !isGameOver
    ) {
      setTrackedChessRoom({ code: onlineRoomCode, mySide: onlineMyColor });
    } else if (isGameOver) {
      setTrackedChessRoom(null);
    }
  }, [mode, onlineRoomCode, onlineMyColor, isGameOver, setTrackedChessRoom]);

  // Reset invite sent badges when room resets
  useEffect(() => {
    if (!onlineRoomCode) {
      setInvitedFriendUids(new Set());
    }
  }, [onlineRoomCode]);

  const handleGoogleSignInForOnline = async () => {
    setOnlineSigningIn(true);
    setOnlineError(null);
    try {
      await signInGoogleForChess();
      setOnlineAuthNeeded(false);
      const pending = pendingAuthActionRef.current;
      pendingAuthActionRef.current = null;
      if (pending?.kind === 'create') {
        await createOnlineViaFirestore();
      } else if (pending?.kind === 'join') {
        await joinOnlineViaFirestore(pending.code);
      }
    } catch (err) {
      setOnlineError(
        err instanceof Error ? err.message : 'Google sign-in could not be completed.'
      );
    } finally {
      setOnlineSigningIn(false);
    }
  };

  const handleCreateRoom = () => {
    if (shouldPreferLocalWs()) {
      connectAndSendWs(
        {
          type: 'room:create',
          playerId,
          playerName: playerName.trim() || 'Player',
          preferredColor: sidePref,
          timeControlId
        },
        () => {
          void createOnlineViaFirestore();
        }
      );
    } else {
      void createOnlineViaFirestore();
    }
  };

  const handleJoinRoom = (codeOverride?: string) => {
    const cleanCode = sanitizeRoomCode(codeOverride ?? joinCodeInput);
    if (!cleanCode) {
      setOnlineError('Enter a room code to join.');
      return;
    }
    if (shouldPreferLocalWs()) {
      connectAndSendWs(
        {
          type: 'room:join',
          code: cleanCode,
          playerId,
          playerName: playerName.trim() || 'Player'
        },
        () => {
          void joinOnlineViaFirestore(cleanCode);
        }
      );
    } else {
      void joinOnlineViaFirestore(cleanCode);
    }
  };

  const handleLeaveRoom = () => {
    const codeToLeave = onlineRoomCode;
    setTrackedChessRoom(null);
    if (codeToLeave) {
      if (activeTransportRef.current === 'ws') {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: 'room:leave', code: codeToLeave, playerId })
          );
        }
      } else {
        void leaveFirestoreChessRoom(codeToLeave);
      }
    }
    closeFirestoreRoom();
    pendingOnlineMoveRef.current = null;
    lastOnlineRoomRef.current = null;
    lastOnlineHistoryLenRef.current = 0;
    timeoutClaimedPlyRef.current = -1;
    setOnlineRoomCode(null);
    setOnlineTimeControlId(null);
    setOnlinePlayers({ w: null, b: null });
    setOnlineRematchVotes([]);
    setOnlineError(null);
    setOnlineAuthNeeded(false);
    setWsStatus('disconnected');
    setLastEloResult(null);
    setPremove(null);
    setPremoveFrom(null);
    setGameState(createInitialState());
    setMoveHistory([]);
    setViewPly(null);
    reviewTokenRef.current += 1;
    setGameReview(EMPTY_REVIEW);
    setResignedWinner(null);
    setTimeoutWinner(null);
    const tc = getTimeControlById(timeControlId);
    setWhiteTimeMs(tc.baseMs);
    setBlackTimeMs(tc.baseMs);
    clockAnchorRef.current = {
      whiteMs: tc.baseMs,
      blackMs: tc.baseMs,
      activeColor: null,
      anchoredAt: Date.now()
    };
  };

  const myFirebaseUid =
    user?.uid && auth.currentUser?.uid === user.uid ? user.uid : auth.currentUser?.uid || '';

  const invitableChessPlayers = useMemo(() => {
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

  const incomingChessInvites = useMemo(
    () => incomingInvites.filter(inv => inv.gameKind === 'chess'),
    [incomingInvites]
  );

  const activeChessRoomInvite = useMemo(() => {
    if (!onlineRoomCode) return null;
    const match = allInvites.find(
      inv => inv.gameKind === 'chess' && inv.roomCode === onlineRoomCode
    );
    if (match) return match;
    if (
      lastAcceptedInvite &&
      lastAcceptedInvite.gameKind === 'chess' &&
      lastAcceptedInvite.roomCode === onlineRoomCode
    ) {
      return lastAcceptedInvite;
    }
    return null;
  }, [onlineRoomCode, allInvites, lastAcceptedInvite]);

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
        uid && activeChessRoomInvite
          ? activeChessRoomInvite.fromUid === uid
            ? { name: activeChessRoomInvite.fromName, avatarId: activeChessRoomInvite.fromAvatarId }
            : activeChessRoomInvite.toUid === uid
            ? { name: activeChessRoomInvite.toName, avatarId: contact?.avatarId || dir?.avatarId }
            : null
          : null;

      const cleanFallback =
        fallbackName &&
        fallbackName !== 'Player' &&
        fallbackName !== 'White' &&
        fallbackName !== 'Black'
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
      activeChessRoomInvite,
      resolveAvatarIcon
    ]
  );

  const handleInviteFriendToChess = async (target: { uid: string; name: string }) => {
    setOnlineError(null);
    setInvitingFriendUid(target.uid);
    try {
      let roomToShare =
        onlineRoomCode && activeTransportRef.current === 'firestore' ? onlineRoomCode : '';
      let senderUid = myFirebaseUid;

      if (!roomToShare) {
        closeWebSocket();
        closeFirestoreRoom();
        setWsStatus('connecting');
        const created = await createFirestoreChessRoom({
          playerId,
          playerName: playerName.trim() || profile?.displayName || user?.displayName || 'Player',
          preferredColor: sidePref,
          timeControlId
        });
        roomToShare = created.code;
        senderUid = created.uid;
        startFirestoreRoomSubscription(created.code, created.uid);
      }

      if (!senderUid || auth.currentUser?.uid !== senderUid) {
        throw new ChessAuthRequiredError('Sign in with Google once to invite friends directly.');
      }

      await sendGameInvite({
        fromUid: senderUid,
        fromName: playerName.trim() || profile?.displayName || user?.displayName || 'Player',
        fromAvatarId: profile?.avatarId || 'melon_classic',
        toUid: target.uid,
        toName: target.name,
        gameKind: 'chess',
        gameType: 'chess',
        gameTitle: 'Chess',
        roomCode: roomToShare
      });

      setInvitedFriendUids(prev => {
        const next = new Set(prev);
        next.add(target.uid);
        return next;
      });
    } catch (err) {
      if (err instanceof ChessAuthRequiredError) {
        setOnlineAuthNeeded(true);
      }
      setOnlineError(err instanceof Error ? err.message : 'Could not send invite.');
    } finally {
      setInvitingFriendUid(null);
    }
  };

  const sendWsMove = useCallback(
    (move: ChessMove, expectedMoveIndex: number) => {
      if (!onlineRoomCode) return;
      if (activeTransportRef.current === 'firestore') {
        void sendFirestoreChessMove({
          code: onlineRoomCode,
          move,
          expectedMoveIndex
        }).catch(err => {
          const pending = pendingOnlineMoveRef.current;
          if (pending && pending.code === onlineRoomCode && pending.expectedMoveIndex === expectedMoveIndex) {
            pendingOnlineMoveRef.current = null;
            lastOnlineHistoryLenRef.current = pending.rollbackHistory.length;
            setGameState(pending.rollbackState);
            setMoveHistory(pending.rollbackHistory);
            clockAnchorRef.current = { ...pending.rollbackClockAnchor };
            setWhiteTimeMs(pending.rollbackClockAnchor.whiteMs);
            setBlackTimeMs(pending.rollbackClockAnchor.blackMs);
          }
          setOnlineError(err instanceof Error ? err.message : 'Failed to send move.');
        });
        return;
      }
      connectAndSendWs({
        type: 'room:move',
        code: onlineRoomCode,
        playerId,
        moveIndex: expectedMoveIndex,
        move
      });
    },
    [onlineRoomCode, playerId, connectAndSendWs]
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
      botOverride: ChessBot = selectedBot,
      tcIdOverride: string = timeControlId
    ) => {
      if (nextMode === 'online') {
        if (onlineRoomCode) {
          if (activeTransportRef.current === 'firestore') {
            void voteFirestoreChessRematch(onlineRoomCode).catch(err => {
              setOnlineError(err instanceof Error ? err.message : 'Could not request rematch.');
            });
          } else {
            connectAndSendWs({
              type: 'room:rematch',
              code: onlineRoomCode,
              playerId
            });
          }
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

      const tc = getTimeControlById(tcIdOverride);
      setHumanColor(resolvedSide);
      setIsFlipped(nextMode === 'ai' && resolvedSide === 'b');
      setGameState(createInitialState());
      setMoveHistory([]);
      setSnapshots([]);
      setViewPly(null);
      reviewTokenRef.current += 1;
      setGameReview(EMPTY_REVIEW);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setPremove(null);
      setPremoveFrom(null);
      setResignedWinner(null);
      setTimeoutWinner(null);
      setWhiteTimeMs(tc.baseMs);
      setBlackTimeMs(tc.baseMs);
      clockAnchorRef.current = {
        whiteMs: tc.baseMs,
        blackMs: tc.baseMs,
        activeColor: null,
        anchoredAt: Date.now()
      };
      setShowEndOverlay(true);
      setIsAIThinking(false);
      setActiveOpening(null);
      lastOpeningCommentedRef.current = false;
      if (nextMode === 'ai') {
        speakAsBot(botOverride, 'gameStart');
      }
    },
    [
      mode,
      sidePref,
      selectedBot,
      timeControlId,
      speakAsBot,
      onlineRoomCode,
      connectAndSendWs,
      playerId
    ]
  );

  const commitMove = useCallback(
    (move: ChessMove, decisionMeta?: BotMoveDecision) => {
      if (mode === 'online') {
        const expectedMoveIndex = moveHistory.length;
        const rollbackClockAnchor = { ...clockAnchorRef.current };
        const { nextState, record } = applyMove(gameState, move);
        const gameEndedNow =
          nextState.status === 'checkmate' ||
          nextState.status === 'stalemate' ||
          nextState.status.startsWith('draw_');

        if (onlineRoomCode) {
          pendingOnlineMoveRef.current = {
            code: onlineRoomCode,
            expectedMoveIndex,
            rollbackState: gameState,
            rollbackHistory: moveHistory,
            rollbackClockAnchor
          };
          lastOnlineHistoryLenRef.current = expectedMoveIndex + 1;
        }

        // Optimistic immediate UI + clock + audio update (0ms local latency)
        setGameState(nextState);
        setMoveHistory(prev => [...prev, record]);
        setSelectedSquare(null);
        setPendingPromotion(null);
        setHintMove(null);
        setViewPly(null);
        setShowEndOverlay(true);

        if (effectiveTimeControl.baseMs > 0) {
          const moverColor = gameState.turn;
          const now = Date.now();
          const wasRunning =
            expectedMoveIndex >= 1 && clockAnchorRef.current.activeColor === moverColor;
          let wMs = clockAnchorRef.current.whiteMs;
          let bMs = clockAnchorRef.current.blackMs;
          if (wasRunning) {
            const elapsed = Math.max(0, now - clockAnchorRef.current.anchoredAt);
            if (moverColor === 'w') {
              wMs = Math.max(0, wMs - elapsed) + effectiveTimeControl.incMs;
            } else {
              bMs = Math.max(0, bMs - elapsed) + effectiveTimeControl.incMs;
            }
          }
          clockAnchorRef.current = {
            whiteMs: wMs,
            blackMs: bMs,
            activeColor: gameEndedNow ? null : nextState.turn,
            anchoredAt: now
          };
          setWhiteTimeMs(wMs);
          setBlackTimeMs(bMs);
        }

        if (gameEndedNow) {
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

        sendWsMove(move, expectedMoveIndex);
        return;
      }

      const evalBefore =
        mode === 'ai' ? evaluatePositionForSide(gameState.board, aiColor) : 0;

      const tc = getTimeControlById(timeControlId);
      const moverColor = gameState.turn;
      const now = Date.now();
      const wasRunning = tc.baseMs > 0 && moveHistory.length >= 1 && clockAnchorRef.current.activeColor === moverColor;

      setSnapshots(prev => [...prev, { state: gameState, history: moveHistory }]);
      const { nextState, record } = applyMove(gameState, move);
      setGameState(nextState);
      setMoveHistory(prev => [...prev, record]);
      setViewPly(null);
      reviewTokenRef.current += 1;
      setGameReview(EMPTY_REVIEW);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setShowEndOverlay(true);

      const gameEndedNow =
        nextState.status === 'checkmate' ||
        nextState.status === 'stalemate' ||
        nextState.status.startsWith('draw_');

      if (tc.baseMs > 0) {
        let wMs = clockAnchorRef.current.whiteMs;
        let bMs = clockAnchorRef.current.blackMs;
        if (wasRunning) {
          const elapsed = Math.max(0, now - clockAnchorRef.current.anchoredAt);
          if (moverColor === 'w') {
            wMs = Math.max(0, wMs - elapsed) + tc.incMs;
          } else {
            bMs = Math.max(0, bMs - elapsed) + tc.incMs;
          }
        }
        clockAnchorRef.current = {
          whiteMs: wMs,
          blackMs: bMs,
          activeColor: gameEndedNow ? null : nextState.turn,
          anchoredAt: now
        };
        setWhiteTimeMs(wMs);
        setBlackTimeMs(bMs);
      }

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

      if (gameEndedNow) {
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
      timeControlId,
      effectiveTimeControl,
      onlineRoomCode,
      autoFlipPvp,
      playSound,
      speakAsBot,
      sendWsMove
    ]
  );

  // Live 100ms chess clock tick (local AI/PvP flag enforcement + online display interpolation)
  useEffect(() => {
    if (effectiveTimeControl.baseMs <= 0 || isGameOver) return;
    if (moveHistory.length === 0) return;

    const timer = window.setInterval(() => {
      const anchor = clockAnchorRef.current;
      if (!anchor.activeColor) return;
      const elapsed = Math.max(0, Date.now() - anchor.anchoredAt);

      if (anchor.activeColor === 'w') {
        const rem = Math.max(0, anchor.whiteMs - elapsed);
        setWhiteTimeMs(rem);
        if (rem <= 0) {
          if (mode === 'online') {
            if (
              activeTransportRef.current === 'firestore' &&
              onlineRoomCode &&
              timeoutClaimedPlyRef.current !== moveHistory.length
            ) {
              timeoutClaimedPlyRef.current = moveHistory.length;
              void claimFirestoreChessTimeout(onlineRoomCode);
            }
          } else {
            anchor.whiteMs = 0;
            anchor.activeColor = null;
            const result: PieceColor | 'draw' = hasOnlyInsufficientMaterialForSide(
              gameState.board,
              'b'
            )
              ? 'draw'
              : 'b';
            setTimeoutWinner(result);
            setShowEndOverlay(true);
            playSound('gameover');
            if (mode === 'ai') {
              speakAsBot(
                selectedBot,
                result === 'draw' ? 'draw' : result === aiColor ? 'botWin' : 'botLose'
              );
            }
          }
        }
      } else {
        const rem = Math.max(0, anchor.blackMs - elapsed);
        setBlackTimeMs(rem);
        if (rem <= 0) {
          if (mode === 'online') {
            if (
              activeTransportRef.current === 'firestore' &&
              onlineRoomCode &&
              timeoutClaimedPlyRef.current !== moveHistory.length
            ) {
              timeoutClaimedPlyRef.current = moveHistory.length;
              void claimFirestoreChessTimeout(onlineRoomCode);
            }
          } else {
            anchor.blackMs = 0;
            anchor.activeColor = null;
            const result: PieceColor | 'draw' = hasOnlyInsufficientMaterialForSide(
              gameState.board,
              'w'
            )
              ? 'draw'
              : 'w';
            setTimeoutWinner(result);
            setShowEndOverlay(true);
            playSound('gameover');
            if (mode === 'ai') {
              speakAsBot(
                selectedBot,
                result === 'draw' ? 'draw' : result === aiColor ? 'botWin' : 'botLose'
              );
            }
          }
        }
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [
    effectiveTimeControl.baseMs,
    isGameOver,
    moveHistory.length,
    mode,
    onlineRoomCode,
    gameState.board,
    aiColor,
    selectedBot,
    playSound,
    speakAsBot
  ]);

  // Trigger AI turn automatically when it's AI's move
  useEffect(() => {
    if (mode !== 'ai' || isGameOver || gameState.turn !== aiColor) {
      setIsAIThinking(false);
      return;
    }

    setIsAIThinking(true);
    const botClockMs =
      effectiveTimeControl.baseMs > 0
        ? aiColor === 'w'
          ? clockAnchorRef.current.whiteMs
          : clockAnchorRef.current.blackMs
        : undefined;
    const baseDelay =
      selectedBot.difficulty === 'easy'
        ? 280
        : selectedBot.difficulty === 'medium'
        ? 350
        : 400;
    const delayMs =
      typeof botClockMs === 'number' && botClockMs < 15_000
        ? Math.min(140, baseDelay)
        : baseDelay;

    const timer = window.setTimeout(() => {
      const decision = chooseBotMove(gameState, selectedBot, moveHistory, botClockMs);
      setIsAIThinking(false);
      if (decision.move) {
        commitMove(decision.move, decision);
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [
    mode,
    isGameOver,
    gameState,
    aiColor,
    selectedBot,
    moveHistory,
    effectiveTimeControl.baseMs,
    commitMove
  ]);

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

    if (mode === 'online') {
      // Zero-delay optimistic execution in online multiplayer
      commitMove(chosen);
      return;
    }

    const execTimer = window.setTimeout(() => {
      commitMove(chosen);
    }, 35);

    return () => window.clearTimeout(execTimer);
  }, [
    premove,
    isGameOver,
    playerControlledColor,
    gameState,
    mode,
    commitMove
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

  const tryMoveToSquareRef = useRef(tryMoveToSquare);
  tryMoveToSquareRef.current = tryMoveToSquare;
  const tryQueuePremoveRef = useRef(tryQueuePremove);
  tryQueuePremoveRef.current = tryQueuePremove;
  const isFlippedRef = useRef(isFlipped);
  isFlippedRef.current = isFlipped;

  const getBoardSquareFromPoint = useCallback((clientX: number, clientY: number): Square | null => {
    const el = boardGridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    const visCol = Math.max(0, Math.min(7, Math.floor(((clientX - rect.left) / rect.width) * 8)));
    const visRow = Math.max(0, Math.min(7, Math.floor(((clientY - rect.top) / rect.height) * 8)));
    const flipped = isFlippedRef.current;
    return {
      r: flipped ? 7 - visRow : visRow,
      c: flipped ? 7 - visCol : visCol
    };
  }, []);

  // Unified Pointer Drag-to-Place handler (works seamlessly on iPad touch + desktop mouse/trackpad)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const session = dragSessionRef.current;
      if (!session || e.pointerId !== session.pointerId) return;

      const dist = Math.hypot(e.clientX - session.startX, e.clientY - session.startY);
      if (!session.isDragging && dist > 6) {
        session.isDragging = true;
        if (session.mode === 'move') {
          setSelectedSquare(session.from);
        } else {
          setPremoveFrom(session.from);
        }
      }

      if (!session.isDragging) return;
      if (e.cancelable) e.preventDefault();

      session.clientX = e.clientX;
      session.clientY = e.clientY;
      session.hoverSquare = getBoardSquareFromPoint(e.clientX, e.clientY);
      setDragOverlay({ ...session });
    };

    const finishDrag = (e: PointerEvent, cancelled: boolean) => {
      const session = dragSessionRef.current;
      if (!session || e.pointerId !== session.pointerId) return;

      dragSessionRef.current = null;
      setDragOverlay(null);

      if (!session.isDragging || cancelled) return;

      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 120);

      const dropSq = getBoardSquareFromPoint(e.clientX, e.clientY);
      if (dropSq && (dropSq.r !== session.from.r || dropSq.c !== session.from.c)) {
        if (session.mode === 'move') {
          const moved = tryMoveToSquareRef.current(session.from, dropSq);
          if (!moved) {
            setSelectedSquare(null);
          }
        } else {
          const queued = tryQueuePremoveRef.current(session.from, dropSq);
          if (!queued) {
            setPremoveFrom(null);
          }
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => finishDrag(e, false);
    const handlePointerCancel = (e: PointerEvent) => finishDrag(e, true);
    const handleWindowBlur = () => {
      dragSessionRef.current = null;
      setDragOverlay(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [getBoardSquareFromPoint]);

  const handleSquareClick = (r: number, c: number) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
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
    setViewPly(null);
    reviewTokenRef.current += 1;
    setGameReview(EMPTY_REVIEW);
    setSelectedSquare(null);
    setPendingPromotion(null);
    setHintMove(null);
    setPremove(null);
    setPremoveFrom(null);
    setResignedWinner(null);
    setTimeoutWinner(null);
    setShowEndOverlay(true);

    const tc = getTimeControlById(timeControlId);
    if (tc.baseMs > 0 && snap.history.length === 0) {
      clockAnchorRef.current = {
        whiteMs: tc.baseMs,
        blackMs: tc.baseMs,
        activeColor: null,
        anchoredAt: Date.now()
      };
      setWhiteTimeMs(tc.baseMs);
      setBlackTimeMs(tc.baseMs);
    } else if (tc.baseMs > 0) {
      clockAnchorRef.current = {
        ...clockAnchorRef.current,
        activeColor: snap.state.turn,
        anchoredAt: Date.now()
      };
    }

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
        if (activeTransportRef.current === 'firestore') {
          void resignFirestoreChessRoom(onlineRoomCode).catch(err => {
            setOnlineError(err instanceof Error ? err.message : 'Failed to resign.');
          });
        } else {
          connectAndSendWs({
            type: 'room:resign',
            code: onlineRoomCode,
            playerId
          });
        }
      }
      return;
    }

    const losingColor = mode === 'ai' ? humanColor : gameState.turn;
    clockAnchorRef.current.activeColor = null;
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
      closeFirestoreRoom();
    }
    setMode(nextMode);
    if (nextMode === 'online') {
      setGameState(createInitialState());
      setMoveHistory([]);
      setSnapshots([]);
      setViewPly(null);
      reviewTokenRef.current += 1;
      setGameReview(EMPTY_REVIEW);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setPremove(null);
      setPremoveFrom(null);
      setResignedWinner(null);
      setTimeoutWinner(null);
      setOnlineError(null);
      setOnlineAuthNeeded(false);
      const tc = getTimeControlById(timeControlId);
      setWhiteTimeMs(tc.baseMs);
      setBlackTimeMs(tc.baseMs);
      if (shouldPreferLocalWs()) {
        connectAndSendWs(undefined, () => {
          activeTransportRef.current = 'firestore';
          setWsStatus('disconnected');
          setOnlineError(null);
        });
      } else {
        activeTransportRef.current = 'firestore';
        setWsStatus('disconnected');
      }
    } else {
      startNewGame(nextMode, sidePref, selectedBot, timeControlId);
    }
  };

  const handleSelectBot = (bot: ChessBot) => {
    setSelectedBotId(bot.id);
    if (mode === 'online') {
      handleLeaveRoom();
      closeWebSocket();
      closeFirestoreRoom();
    }
    if (mode !== 'ai') {
      setMode('ai');
    }
    startNewGame('ai', sidePref, bot, timeControlId);
  };

  const handleSidePrefChange = (nextPref: PlayerSidePref) => {
    setSidePref(nextPref);
    if (mode === 'ai') {
      startNewGame('ai', nextPref, selectedBot, timeControlId);
    }
  };

  const handleTimeControlSelect = (nextTcId: string) => {
    setTimeControlId(nextTcId);
    if (mode !== 'online') {
      startNewGame(mode, sidePref, selectedBot, nextTcId);
    }
  };

  // Reconstruct full timeline of states for Move Explorer & Optional Analysis
  const timelineStates = useMemo(() => {
    const list: ChessState[] = [createInitialState()];
    let cur = list[0];
    for (const rec of moveHistory) {
      try {
        cur = applyMove(cur, rec.move).nextState;
        list.push(cur);
      } catch {
        break;
      }
    }
    return list;
  }, [moveHistory]);

  const displayedPly =
    viewPly === null ? moveHistory.length : Math.max(0, Math.min(viewPly, moveHistory.length));
  const isViewingLive = displayedPly === moveHistory.length;
  const displayedState = timelineStates[displayedPly] || gameState;
  const displayedHistory = useMemo(
    () => (isViewingLive ? moveHistory : moveHistory.slice(0, displayedPly)),
    [isViewingLive, moveHistory, displayedPly]
  );

  // Real-time ECO Opening Detection on the right panel (always active from move 1)
  const detectedOpening = useMemo(
    () => detectOpening(displayedHistory.map(m => m.san)),
    [displayedHistory]
  );

  // Optional live position analysis (runs only when analysisEnabled === true)
  useEffect(() => {
    if (!analysisEnabled) {
      setPositionAnalysis(null);
      setIsAnalyzingPos(false);
      return;
    }

    let cancelled = false;
    setIsAnalyzingPos(true);
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const result = analyzePosition(displayedState, 190);
      if (!cancelled) {
        setPositionAnalysis(result);
        setIsAnalyzingPos(false);
      }
    }, 20);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [analysisEnabled, displayedState]);

  const runFullGameReview = useCallback(() => {
    if (moveHistory.length === 0) return;
    if (!analysisEnabled) setAnalysisEnabled(true);

    const token = reviewTokenRef.current + 1;
    reviewTokenRef.current = token;

    const total = moveHistory.length;
    const qualities: Record<number, MoveQuality> = {};
    const whiteLosses: number[] = [];
    const blackLosses: number[] = [];

    setGameReview({
      status: 'running',
      progress: 0,
      total,
      qualities: {},
      whiteAccuracy: null,
      blackAccuracy: null
    });

    let idx = 0;
    const step = () => {
      if (reviewTokenRef.current !== token) return;
      if (idx >= total) {
        const avgLoss = (arr: number[]) =>
          arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
        const toAcc = (loss: number) =>
          Math.max(5, Math.min(100, Math.round(100 * Math.exp(-0.0032 * loss))));

        setGameReview({
          status: 'done',
          progress: total,
          total,
          qualities: { ...qualities },
          whiteAccuracy: whiteLosses.length > 0 ? toAcc(avgLoss(whiteLosses)) : null,
          blackAccuracy: blackLosses.length > 0 ? toAcc(avgLoss(blackLosses)) : null
        });
        return;
      }

      const preState = timelineStates[idx];
      const playedRec = moveHistory[idx];
      const postState = timelineStates[idx + 1];

      const beforeEval = analyzePosition(preState, 110);
      const mover = playedRec.color;
      const bestMoverCp = mover === 'w' ? beforeEval.scoreCp : -beforeEval.scoreCp;
      const isBestMove =
        Boolean(beforeEval.bestMove) &&
        beforeEval.bestMove!.from.r === playedRec.move.from.r &&
        beforeEval.bestMove!.from.c === playedRec.move.from.c &&
        beforeEval.bestMove!.to.r === playedRec.move.to.r &&
        beforeEval.bestMove!.to.c === playedRec.move.to.c &&
        beforeEval.bestMove!.promotion === playedRec.move.promotion;

      let playedMoverCp = bestMoverCp;
      if (!isBestMove && postState) {
        const afterEval = analyzePosition(postState, 90);
        playedMoverCp = mover === 'w' ? afterEval.scoreCp : -afterEval.scoreCp;
      }

      const quality = classifyMoveQuality(bestMoverCp, playedMoverCp, isBestMove);
      qualities[idx] = quality;

      const cpLoss = isBestMove
        ? 0
        : Math.max(
            0,
            Math.max(-1200, Math.min(1200, bestMoverCp)) -
              Math.max(-1200, Math.min(1200, playedMoverCp))
          );
      if (mover === 'w') whiteLosses.push(cpLoss);
      else blackLosses.push(cpLoss);

      idx += 1;
      setGameReview(prev => ({
        ...prev,
        progress: idx,
        qualities: { ...qualities }
      }));

      window.setTimeout(step, 10);
    };

    window.setTimeout(step, 10);
  }, [moveHistory, timelineStates, analysisEnabled]);

  const material = useMemo(
    () => computeMaterialAndCaptures(displayedHistory, displayedState.board),
    [displayedHistory, displayedState.board]
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
  ): { name: string; elo: number | null; connected?: boolean; avatarIcon?: string | null } => {
    if (mode === 'pvp') {
      return {
        name: color === 'w' ? 'Player 1 (White)' : 'Player 2 (Black)',
        elo: null
      };
    }
    if (mode === 'online') {
      const seat = color === 'w' ? onlinePlayers.w : onlinePlayers.b;
      if (!seat) {
        // Show invited peer name if we created the room and invited a friend
        if (activeChessRoomInvite && activeChessRoomInvite.fromUid === myFirebaseUid) {
          const peer = resolvePersonByUid(
            activeChessRoomInvite.toUid,
            activeChessRoomInvite.toName
          );
          return {
            name: `Waiting for ${peer.name}...`,
            elo: null,
            connected: false,
            avatarIcon: peer.avatarIcon
          };
        }
        if (activeChessRoomInvite && activeChessRoomInvite.toUid === myFirebaseUid) {
          const inviter = resolvePersonByUid(
            activeChessRoomInvite.fromUid,
            activeChessRoomInvite.fromName
          );
          return {
            name: inviter.name,
            elo: null,
            connected: false,
            avatarIcon: inviter.avatarIcon
          };
        }
        return {
          name: onlineRoomCode ? 'Waiting for opponent...' : color === 'w' ? 'White' : 'Black',
          elo: null,
          connected: false
        };
      }
      const isMe = onlineMyColor === color;
      const resolved = resolvePersonByUid(seat.uid, seat.name);
      return {
        name: isMe ? `${resolved.name} (You)` : resolved.name,
        elo: seat.elo,
        connected: seat.connected,
        avatarIcon: resolved.avatarIcon
      };
    }
    if (color === humanColor) {
      return {
        name:
          (playerName && playerName !== 'Player' ? playerName.trim() : '') ||
          profile?.displayName ||
          user?.displayName ||
          'You',
        elo: 1200,
        avatarIcon: resolveAvatarIcon(profile?.avatarId)
      };
    }
    return { name: selectedBot.name, elo: selectedBot.rating };
  };

  const { startCall, callPhase } = useCall();
  const { navigateSpace } = useNotifications();
  const [lastEloResult, setLastEloResult] = useState<SettledEloResult | null>(null);
  const settledChessMatchRef = useRef<Set<string>>(new Set());

  const onlineOpponentInfo = useMemo(() => {
    if (mode !== 'online' || !onlineRoomCode) return null;
    if (onlineMyColor === 'w' || onlineMyColor === 'b') {
      const oppColor: PieceColor = onlineMyColor === 'w' ? 'b' : 'w';
      const oppSeat = oppColor === 'w' ? onlinePlayers.w : onlinePlayers.b;
      if (oppSeat) {
        const person = resolvePersonByUid(oppSeat.uid, oppSeat.name);
        return {
          uid: oppSeat.uid || '',
          name: person.name,
          avatarIcon: person.avatarIcon,
          avatarId:
            directoryProfiles.find(p => p.userId === oppSeat.uid)?.avatarId ||
            contacts.find(c => c.contactUid === oppSeat.uid)?.avatarId ||
            'melon_classic',
          seated: true,
          color: oppColor
        };
      }
      if (activeChessRoomInvite) {
        const peerUid =
          activeChessRoomInvite.fromUid === myFirebaseUid
            ? activeChessRoomInvite.toUid
            : activeChessRoomInvite.fromUid;
        const peerName =
          activeChessRoomInvite.fromUid === myFirebaseUid
            ? activeChessRoomInvite.toName
            : activeChessRoomInvite.fromName;
        const person = resolvePersonByUid(peerUid, peerName);
        return {
          uid: peerUid || '',
          name: person.name,
          avatarIcon: person.avatarIcon,
          avatarId:
            directoryProfiles.find(p => p.userId === peerUid)?.avatarId ||
            contacts.find(c => c.contactUid === peerUid)?.avatarId ||
            'melon_classic',
          seated: false,
          color: oppColor
        };
      }
    }
    return null;
  }, [
    mode,
    onlineRoomCode,
    onlineMyColor,
    onlinePlayers,
    activeChessRoomInvite,
    myFirebaseUid,
    resolvePersonByUid,
    directoryProfiles,
    contacts
  ]);

  // Automatically record online PvP Chess results & ELO ratings when a room match ends
  useEffect(() => {
    if (
      !isGameOver ||
      mode !== 'online' ||
      !onlineRoomCode ||
      activeTransportRef.current !== 'firestore'
    ) {
      return;
    }
    const wUid = onlinePlayers.w?.uid || '';
    const bUid = onlinePlayers.b?.uid || '';
    if (!wUid || !bUid || wUid === bUid) return;
    if (myFirebaseUid !== wUid && myFirebaseUid !== bUid) return;

    const winnerSide: 'w' | 'b' | 'draw' =
      resignedWinner ||
      (timeoutWinner === 'draw' ? 'draw' : timeoutWinner) ||
      (gameState.status === 'checkmate' && gameState.winner ? gameState.winner : 'draw');
    const winnerSeat: 'p1' | 'p2' | 'draw' =
      winnerSide === 'w' ? 'p1' : winnerSide === 'b' ? 'p2' : 'draw';

    const matchId = buildMatchId({
      sourceType: 'chessRoom',
      roomCode: onlineRoomCode,
      moveCount: moveHistory.length,
      winnerSeat,
      p1Uid: wUid,
      p2Uid: bUid,
      movesSample: moveHistory
        .slice(-4)
        .map(m => m.san)
        .join('')
    });

    if (settledChessMatchRef.current.has(matchId)) return;
    settledChessMatchRef.current.add(matchId);

    const wDir = directoryProfiles.find(p => p.userId === wUid);
    const bDir = directoryProfiles.find(p => p.userId === bUid);
    const wName = onlinePlayers.w?.name || wDir?.displayName || 'White';
    const bName = onlinePlayers.b?.name || bDir?.displayName || 'Black';

    void settleOnlinePvpMatchElo({
      matchId,
      sourceType: 'chessRoom',
      roomCode: onlineRoomCode,
      gameKind: 'chess',
      gameType: 'chess',
      gameTitle: 'Chess',
      p1Uid: wUid,
      p1Name: wName,
      p1AvatarId: (wUid === myFirebaseUid ? profile?.avatarId : wDir?.avatarId) || 'melon_classic',
      p2Uid: bUid,
      p2Name: bName,
      p2AvatarId: (bUid === myFirebaseUid ? profile?.avatarId : bDir?.avatarId) || 'melon_classic',
      winnerSeat
    })
      .then(res => {
        if (res) setLastEloResult(res);
      })
      .catch(() => {});
  }, [
    isGameOver,
    mode,
    onlineRoomCode,
    onlinePlayers.w?.uid,
    onlinePlayers.w?.name,
    onlinePlayers.b?.uid,
    onlinePlayers.b?.name,
    myFirebaseUid,
    resignedWinner,
    timeoutWinner,
    gameState.status,
    gameState.winner,
    moveHistory,
    directoryProfiles,
    profile?.avatarId
  ]);

  const getEndBannerCopy = () => {
    const wName = getPlayerInfo('w').name.replace(/ \(You\)$/, '');
    const bName = getPlayerInfo('b').name.replace(/ \(You\)$/, '');
    if (resignedWinner) {
      const winnerName = resignedWinner === 'w' ? wName : bName;
      const loserName = resignedWinner === 'w' ? bName : wName;
      return {
        title: `${winnerName} Wins`,
        subtitle: `${loserName} resigned the match.`
      };
    }
    if (timeoutWinner) {
      if (timeoutWinner === 'draw') {
        return {
          title: 'Draw · Timeout vs Insufficient Material',
          subtitle: 'Clock expired, but opponent has insufficient material to mate.'
        };
      }
      const winnerName = timeoutWinner === 'w' ? wName : bName;
      if (mode === 'ai') {
        return timeoutWinner === humanColor
          ? {
              title: 'Victory on Time',
              subtitle: `${selectedBot.name}'s clock expired!`
            }
          : {
              title: `${selectedBot.name} Wins on Time`,
              subtitle: `${winnerName} won after time ran out.`
            };
      }
      return {
        title: `${winnerName} Wins on Time`,
        subtitle: `${timeoutWinner === 'w' ? bName : wName} ran out of time.`
      };
    }
    if (gameState.status === 'checkmate') {
      const winnerName = gameState.winner === 'w' ? wName : bName;
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

  // Clean, compact player strip with Elo beside name + inline captured material + Chess Clock
  const renderPlayerStrip = (color: PieceColor) => {
    const isTurn = isViewingLive && !isGameOver && gameState.turn === color;
    const isBotHere = mode === 'ai' && color === aiColor;
    const isThinkingHere = isViewingLive && isBotHere && isAIThinking;
    const capturedPieces = color === 'w' ? material.capturedByWhite : material.capturedByBlack;
    const advantage = color === 'w' ? material.whiteAdvantage : material.blackAdvantage;
    const inCheck = displayedState.inCheckColor === color && displayedState.status !== 'checkmate';
    const info = getPlayerInfo(color);
    const hasPremoveHere = isViewingLive && Boolean(premove) && playerControlledColor === color;

    const showClock = effectiveTimeControl.baseMs > 0;
    const clockMs = color === 'w' ? whiteTimeMs : blackTimeMs;
    const isClockActive = showClock && isTurn && moveHistory.length >= 1;
    const isLowTime = showClock && clockMs < 20_000 && clockMs > 0;
    const isFlagged = showClock && clockMs <= 0;

    return (
      <div
        className="w-full px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 transition-colors"
        style={{
          backgroundColor: isTurn ? activeTheme.bgCard : activeTheme.bgSecondary,
          borderColor: isTurn ? activeTheme.borderActive : activeTheme.border
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-md border flex items-center justify-center shrink-0 text-sm relative"
            style={{
              backgroundColor: isBotHere
                ? `${selectedBot.accentColor}22`
                : info.avatarIcon
                ? 'rgba(15, 23, 42, 0.7)'
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
            ) : info.avatarIcon ? (
              <span aria-hidden="true">{info.avatarIcon}</span>
            ) : (
              <ChessPieceSvg piece={{ color, type: 'k' }} className="w-5 h-5" />
            )}
          </div>

          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
                color === 'w' ? 'bg-slate-100 border-slate-400' : 'bg-slate-900 border-slate-500'
              }`}
              title={color === 'w' ? 'White pieces' : 'Black pieces'}
            />
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {info.name}
            </span>
            {info.elo !== null && (
              <span
                className="text-[11px] font-mono font-bold tabular-nums shrink-0"
                style={{
                  color: isBotHere ? selectedBot.accentColor : '#94a3b8'
                }}
              >
                ({info.elo})
              </span>
            )}
            {inCheck && (
              <span className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-extrabold shrink-0 leading-none">
                CHECK
              </span>
            )}
            {isThinkingHere && (
              <span
                className="text-[10px] font-semibold shrink-0"
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
                className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold flex items-center gap-0.5 cursor-pointer hover:bg-rose-500/30 shrink-0 leading-none"
                title="Click to cancel premove"
              >
                <span>Premove</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}
            {capturedPieces.length > 0 && (
              <div className="flex items-center gap-0.5 ml-1">
                {capturedPieces.slice(0, 10).map((cp, idx) => (
                  <div key={`${cp.type}-${idx}`} className="w-3 h-3 -mr-0.5">
                    <ChessPieceSvg piece={cp} className="w-3 h-3" />
                  </div>
                ))}
                {capturedPieces.length > 10 && (
                  <span className="text-[9px] text-slate-400 ml-0.5">+{capturedPieces.length - 10}</span>
                )}
                {advantage > 0 && (
                  <span className="text-[10px] font-mono font-bold text-slate-300 ml-1 tabular-nums">
                    +{advantage}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {mode === 'online' && info.connected === false && onlineRoomCode && (
            <span className="text-[10px] font-semibold text-amber-400">offline</span>
          )}
          {showClock ? (
            <div
              className={`px-2 py-0.5 rounded-md border font-mono text-xs font-extrabold tabular-nums flex items-center gap-1 transition-colors ${
                isFlagged
                  ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                  : isLowTime && isClockActive
                  ? 'bg-rose-500/25 border-rose-400 text-rose-100 animate-pulse'
                  : isClockActive
                  ? 'text-white shadow-sm'
                  : 'text-slate-400 bg-black/25'
              }`}
              style={{
                backgroundColor:
                  isClockActive && !isLowTime && !isFlagged ? activeTheme.accentBadge : undefined,
                borderColor:
                  isClockActive && !isLowTime && !isFlagged
                    ? activeTheme.borderActive
                    : !isFlagged && !isLowTime
                    ? activeTheme.border
                    : undefined
              }}
              aria-label={`${color === 'w' ? 'White' : 'Black'} clock`}
            >
              <Clock className="w-3 h-3 opacity-80" />
              <span>{formatClockMs(clockMs)}</span>
            </div>
          ) : (
            <span
              className="w-2 h-2 rounded-sm transition-opacity"
              style={{
                backgroundColor: isTurn
                  ? isBotHere
                    ? selectedBot.accentColor
                    : activeTheme.accent
                  : 'rgba(148,163,184,0.22)'
              }}
              aria-label={isTurn ? 'Active turn' : 'Waiting'}
            />
          )}
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
          ? 'fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 text-slate-100'
          : 'flex-1 flex flex-col min-h-full p-2 sm:p-3 text-slate-100'
      }
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div
        className={`${
          isFullscreen ? 'max-w-7xl' : 'max-w-5xl'
        } mx-auto w-full flex flex-col gap-2.5`}
      >
        {/* Top-Level Incoming Chess Invites Banner (visible in ALL modes) */}
        {incomingChessInvites.length > 0 && (
          <div className="w-full rounded-xl border border-sky-400/50 bg-sky-500/15 px-3 py-2 flex flex-col gap-1.5 shadow-lg">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span>Chess Game Invites ({incomingChessInvites.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {incomingChessInvites.map(inv => {
                const inviter = resolvePersonByUid(inv.fromUid, inv.fromName);
                const icon = inviter.avatarIcon || resolveAvatarIcon(inv.fromAvatarId);
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 bg-black/35 px-2.5 py-1.5 rounded-lg border border-white/15 flex-1 min-w-[230px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white truncate">
                          {inviter.name} invited you to Chess
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
                        className="px-2.5 py-1 rounded-md bg-sky-400 hover:bg-sky-300 text-black text-[11px] font-extrabold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void declineGameInvite(inv)}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
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

      <div
        className="w-full flex flex-col lg:flex-row gap-3 items-start justify-center"
      >
        {/* Left Column: Compact Focused Main Board that fits viewport without zooming */}
        <div
          className="flex flex-col items-center gap-1.5 mx-auto lg:mx-0 shrink-0"
          style={{
            width: isFullscreen
              ? `min(100%, ${analysisEnabled ? 726 : 700}px, calc(100vh - 150px))`
              : `min(100%, ${analysisEnabled ? 536 : 510}px, calc(100vh - 224px))`
          }}
        >
          {/* Slim Top Utility Strip + Explicit Inviter/Opponent Info */}
          <div className="w-full flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              {mode === 'online' && onlineRoomCode ? (
                <>
                  <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1 shrink-0">
                    <Globe className="w-3 h-3" style={{ color: activeTheme.accent }} />
                    Room <span className="text-white">{onlineRoomCode}</span>
                  </span>
                  {onlineOpponentInfo && (
                    <span className="text-[11px] font-bold text-white flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/15 truncate">
                      <span>{onlineOpponentInfo.seated ? 'Playing vs' : 'Waiting for'}</span>
                      {onlineOpponentInfo.avatarIcon && <span>{onlineOpponentInfo.avatarIcon}</span>}
                      <span className="truncate">{onlineOpponentInfo.name}</span>
                    </span>
                  )}
                  {onlineOpponentInfo?.uid && onlineOpponentInfo.uid !== myFirebaseUid && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={callPhase !== 'idle'}
                        onClick={() =>
                          void startCall({
                            peerUid: onlineOpponentInfo.uid,
                            peerName: onlineOpponentInfo.name,
                            peerAvatarId: onlineOpponentInfo.avatarId,
                            mode: 'audio',
                            contextLabel: `Chess · Room ${onlineRoomCode}`
                          })
                        }
                        className="p-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 cursor-pointer disabled:opacity-40"
                        title={`Voice call ${onlineOpponentInfo.name}`}
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={callPhase !== 'idle'}
                        onClick={() =>
                          void startCall({
                            peerUid: onlineOpponentInfo.uid,
                            peerName: onlineOpponentInfo.name,
                            peerAvatarId: onlineOpponentInfo.avatarId,
                            mode: 'video',
                            contextLabel: `Chess · Room ${onlineRoomCode}`
                          })
                        }
                        className="p-1 rounded-md bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/35 text-violet-300 cursor-pointer disabled:opacity-40"
                        title={`Video call ${onlineOpponentInfo.name}`}
                      >
                        <Video className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {activeChessRoomInvite && (
                    <span className="text-[10px] font-semibold text-sky-300 truncate">
                      {activeChessRoomInvite.fromUid === myFirebaseUid
                        ? `(Invited ${resolvePersonByUid(activeChessRoomInvite.toUid, activeChessRoomInvite.toName).name})`
                        : `(Invited by ${resolvePersonByUid(activeChessRoomInvite.fromUid, activeChessRoomInvite.fromName).name})`}
                    </span>
                  )}
                  {onlineMyColor === 'spectator' && (
                    <span className="text-[11px] text-amber-300 font-bold">(Spectating)</span>
                  )}
                </>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400 truncate">
                  {isGameOver
                    ? endBanner.title
                    : gameState.turn === 'w'
                    ? 'White to move'
                    : 'Black to move'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => navigateSpace('leaderboard')}
                className="px-2 py-1 rounded-md border text-[10px] font-bold text-amber-300 hover:text-amber-200 hover:bg-white/5 cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: activeTheme.bgSecondary,
                  borderColor: activeTheme.border
                }}
                title="Open PvP ELO Leaderboard"
              >
                <Trophy className="w-3 h-3" />
                <span className="hidden sm:inline">Ranks</span>
              </button>
              <button
                type="button"
                onClick={() => setAnalysisEnabled(a => !a)}
                className={`px-2 py-1 rounded-md border text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                  analysisEnabled ? 'text-black' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: analysisEnabled ? activeTheme.accent : activeTheme.bgSecondary,
                  borderColor: analysisEnabled ? activeTheme.accent : activeTheme.border
                }}
                title="Toggle Optional Engine Analysis"
              >
                <BarChart3 className="w-3 h-3" />
                <span>{analysisEnabled ? 'Eval On' : 'Analyze'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(f => !f)}
                className="px-2 py-1 rounded-md border text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: activeTheme.bgSecondary,
                  borderColor: activeTheme.border
                }}
                title="Flip Board"
              >
                <FlipVertical2 className="w-3 h-3" />
                <span className="hidden sm:inline">Flip</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-2 py-1 rounded-md border text-[10px] font-bold text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1"
                style={{
                  backgroundColor: isFullscreen ? activeTheme.accentBadge : activeTheme.bgSecondary,
                  borderColor: isFullscreen ? activeTheme.borderActive : activeTheme.border
                }}
                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Board'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3 h-3" style={{ color: activeTheme.accent }} />
                    <span>Exit</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" style={{ color: activeTheme.accent }} />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {renderPlayerStrip(topColor)}

          {/* Board Row (+ Optional Evaluation Bar) */}
          <div className="w-full flex items-stretch gap-1.5">
            {analysisEnabled && (
              <div
                className="w-5 rounded-lg border overflow-hidden shrink-0 flex flex-col justify-between relative select-none"
                style={{
                  backgroundColor: '#18181b',
                  borderColor: activeTheme.border
                }}
                title={`Engine Evaluation: ${
                  positionAnalysis
                    ? formatEvalScore(positionAnalysis.scoreCp, positionAnalysis.mateIn)
                    : '...'
                }`}
              >
                {(() => {
                  const whitePct = positionAnalysis
                    ? getWhiteEvalBarPct(positionAnalysis.scoreCp, positionAnalysis.mateIn)
                    : 50;
                  const evalLabel = positionAnalysis
                    ? formatEvalScore(positionAnalysis.scoreCp, positionAnalysis.mateIn)
                    : '...';
                  const whiteAdvantage = (positionAnalysis?.scoreCp ?? 0) >= 0;
                  return (
                    <>
                      <div
                        className="w-full transition-all duration-300"
                        style={{
                          height: `${isFlipped ? whitePct : 100 - whitePct}%`,
                          backgroundColor: isFlipped ? '#f8fafc' : '#18181b'
                        }}
                      />
                      <div
                        className="w-full transition-all duration-300"
                        style={{
                          height: `${isFlipped ? 100 - whitePct : whitePct}%`,
                          backgroundColor: isFlipped ? '#18181b' : '#f8fafc'
                        }}
                      />
                      <span
                        className={`absolute left-0 right-0 text-center font-mono text-[9px] font-extrabold leading-none pointer-events-none ${
                          whiteAdvantage
                            ? isFlipped
                              ? 'top-1.5 text-slate-900'
                              : 'bottom-1.5 text-slate-900'
                            : isFlipped
                            ? 'bottom-1.5 text-slate-100'
                            : 'top-1.5 text-slate-100'
                        }`}
                      >
                        {evalLabel}
                      </span>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Chessboard Container */}
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedSquare(null);
                setPremove(null);
                setPremoveFrom(null);
              }}
              className="flex-1 aspect-square rounded-2xl overflow-hidden border-2 shadow-2xl relative select-none"
              style={{
                borderColor: activeTheme.borderActive,
                boxShadow: `0 20px 50px rgba(0, 0, 0, 0.55), 0 0 28px ${activeTheme.accentGlow}`
              }}
            >
              <div
                ref={boardGridRef}
                className="grid grid-cols-8 grid-rows-8 w-full h-full touch-none select-none"
                style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
              >
                {rows.map((r, visualRowIdx) =>
                  cols.map((c, visualColIdx) => {
                    const isLightSquare = (r + c) % 2 === 0;
                    const piece = displayedState.board[r][c];
                    const isSelected =
                      isViewingLive && selectedSquare?.r === r && selectedSquare?.c === c;
                    const isPremoveOriginSelected =
                      isViewingLive && premoveFrom?.r === r && premoveFrom?.c === c;
                    const isQueuedPremoveSq =
                      isViewingLive &&
                      ((premove?.from.r === r && premove?.from.c === c) ||
                        (premove?.to.r === r && premove?.to.c === c));
                    const isLastMoveFrom =
                      displayedState.lastMove?.from.r === r &&
                      displayedState.lastMove?.from.c === c;
                    const isLastMoveTo =
                      displayedState.lastMove?.to.r === r &&
                      displayedState.lastMove?.to.c === c;
                    const isHintSquare =
                      isViewingLive &&
                      hintMove &&
                      ((hintMove.from.r === r && hintMove.from.c === c) ||
                        (hintMove.to.r === r && hintMove.to.c === c));
                    const legalTarget = isViewingLive
                      ? legalMovesForSelected.find(m => m.to.r === r && m.to.c === c)
                      : undefined;
                    const isPremoveTarget =
                      isViewingLive && premoveTargetSquares.some(sq => sq.r === r && sq.c === c);
                    const isKingInCheckHere =
                      piece?.type === 'k' &&
                      piece.color === displayedState.inCheckColor &&
                      displayedState.status !== 'checkmate';
                    const isDragOriginHere =
                      dragOverlay?.isDragging &&
                      dragOverlay.from.r === r &&
                      dragOverlay.from.c === c;
                    const isDragHoveredHere =
                      dragOverlay?.isDragging &&
                      dragOverlay.hoverSquare?.r === r &&
                      dragOverlay.hoverSquare?.c === c;

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
                      isViewingLive &&
                      Boolean(piece) &&
                      !isGameOver &&
                      !pendingPromotion &&
                      ((isHumanTurn && piece?.color === gameState.turn) ||
                        (canPremove && piece?.color === playerControlledColor));

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        draggable={false}
                        onClick={() => {
                          if (isViewingLive) handleSquareClick(r, c);
                        }}
                        onPointerDown={(e) => {
                          if (!canDragThisPiece || !piece) return;
                          if (e.pointerType === 'mouse' && e.button !== 0) return;
                          const dragMode: 'move' | 'premove' =
                            isHumanTurn && piece.color === gameState.turn ? 'move' : 'premove';
                          const rect = boardGridRef.current?.getBoundingClientRect();
                          const sqSize = rect && rect.width > 0 ? rect.width / 8 : 64;
                          dragSessionRef.current = {
                            pointerId: e.pointerId,
                            from: { r, c },
                            piece,
                            mode: dragMode,
                            startX: e.clientX,
                            startY: e.clientY,
                            clientX: e.clientX,
                            clientY: e.clientY,
                            isDragging: false,
                            hoverSquare: { r, c },
                            squareSize: sqSize
                          };
                        }}
                        className={`relative w-full h-full flex items-center justify-center focus:outline-none transition-colors duration-100 touch-none select-none ${
                          canDragThisPiece ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                        }`}
                        style={{
                          backgroundColor: squareBg,
                          WebkitUserSelect: 'none',
                          WebkitTouchCallout: 'none'
                        }}
                        aria-label={`${FILES[c]}${8 - r}`}
                      >
                        {/* Drop Target Hover Highlight while dragging */}
                        {isDragHoveredHere && (
                          <div
                            className="absolute inset-0 pointer-events-none border-[3px]"
                            style={{
                              borderColor:
                                dragOverlay?.mode === 'premove' ? '#fb7185' : '#ffffff',
                              backgroundColor: 'rgba(255, 255, 255, 0.16)'
                            }}
                          />
                        )}

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
                            draggable={false}
                            className={`w-full h-full flex items-center justify-center transition-transform duration-150 pointer-events-none select-none ${
                              isDragOriginHere
                                ? 'opacity-20 scale-90'
                                : isSelected || isPremoveOriginSelected
                                ? 'scale-108'
                                : isViewingLive
                                ? 'hover:scale-105'
                                : ''
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

              {/* Optional Analysis Best-Move SVG Arrow Overlay */}
              {analysisEnabled &&
                showBestArrow &&
                positionAnalysis?.bestMove &&
                !isAnalyzingPos && (() => {
                  const bm = positionAnalysis.bestMove;
                  const x1 = (isFlipped ? 7 - bm.from.c : bm.from.c) * 100 + 50;
                  const y1 = (isFlipped ? 7 - bm.from.r : bm.from.r) * 100 + 50;
                  const x2 = (isFlipped ? 7 - bm.to.c : bm.to.c) * 100 + 50;
                  const y2 = (isFlipped ? 7 - bm.to.r : bm.to.r) * 100 + 50;
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const len = Math.hypot(dx, dy) || 1;
                  const ux = dx / len;
                  const uy = dy / len;
                  const startX = x1 + ux * 18;
                  const startY = y1 + uy * 18;
                  const endX = x2 - ux * 20;
                  const endY = y2 - uy * 20;
                  return (
                    <svg
                      viewBox="0 0 800 800"
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      aria-hidden="true"
                    >
                      <defs>
                        <marker
                          id="chess-best-arrowhead"
                          markerWidth="5"
                          markerHeight="5"
                          refX="2.5"
                          refY="2.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 5 2.5, 0 5" fill="rgba(16, 185, 129, 0.88)" />
                        </marker>
                      </defs>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="rgba(16, 185, 129, 0.85)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        markerEnd="url(#chess-best-arrowhead)"
                      />
                    </svg>
                  );
                })()}

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
              {isGameOver && showEndOverlay && isViewingLive && (
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
                    {mode === 'online' && lastEloResult && (
                      <button
                        type="button"
                        onClick={() => navigateSpace('leaderboard')}
                        className="px-3 py-1 rounded-xl border text-[11px] font-mono font-extrabold flex items-center gap-1.5 cursor-pointer hover:brightness-110"
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
                          Chess ELO: {lastEloResult.myNewCategoryElo} (
                          {lastEloResult.myCategoryDelta >= 0 ? '+' : ''}
                          {lastEloResult.myCategoryDelta})
                        </span>
                      </button>
                    )}
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
          </div>

          {!isViewingLive && (
            <div
              className="w-full px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.borderActive
              }}
            >
              <span className="text-slate-300 font-semibold tabular-nums">
                Reviewing move {displayedPly} of {moveHistory.length}
              </span>
              <button
                type="button"
                onClick={() => setViewPly(null)}
                className="font-extrabold cursor-pointer hover:underline"
                style={{ color: activeTheme.accent }}
              >
                Return to Live
              </button>
            </div>
          )}

          {renderPlayerStrip(bottomColor)}

          {/* Compact Action Strip Directly Under Board */}
          <div className="w-full grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={mode === 'online' || snapshots.length === 0 || isAIThinking}
              className="py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title={mode === 'online' ? 'Undo unavailable online' : 'Undo Move'}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            <button
              type="button"
              onClick={handleHint}
              disabled={mode === 'online' || !isHumanTurn || isGameOver}
              className="py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title={mode === 'online' ? 'Hint unavailable online' : 'Suggest Strong Move'}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(f => !f)}
              className="py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title="Flip Board"
            >
              <FlipVertical2 className="w-3.5 h-3.5" />
              <span>Flip</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(s => !s)}
              className="py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{soundEnabled ? 'SFX' : 'Muted'}</span>
            </button>

            <button
              type="button"
              onClick={handleResign}
              disabled={
                isGameOver ||
                (mode === 'online' && (!onlineRoomCode || onlineMyColor === 'spectator'))
              }
              className="py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-500/10 text-rose-400"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title="Resign Match"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Resign</span>
            </button>
          </div>
        </div>

        {/* Right Column: Compact Match Setup, Opening, Clocks, Bots/Room, Themes & Move Explorer */}
        <div
          className="w-full lg:w-[340px] xl:w-[360px] shrink-0 rounded-xl border p-3 flex flex-col gap-2 shadow-xl"
          style={{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.border
          }}
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <h1 className="text-sm font-extrabold text-white tracking-tight shrink-0">Chess Studio</h1>
              <span className="text-[11px] text-slate-400 truncate">
                {mode === 'ai'
                  ? `vs ${selectedBot.name} (${selectedBot.rating})`
                  : mode === 'online'
                  ? onlineRoomCode
                    ? `Room ${onlineRoomCode}`
                    : 'Online Room'
                  : 'Pass & Play'}
              </span>
            </div>
            {mode !== 'online' && (
              <button
                type="button"
                onClick={() => startNewGame()}
                className="px-2.5 py-1 rounded-lg text-black font-extrabold text-[11px] cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 shadow-sm hover:opacity-95"
                style={{ backgroundColor: activeTheme.accent }}
              >
                <RotateCcw className="w-3 h-3" />
                New Game
              </button>
            )}
          </div>

          {/* 3-Mode Toggle: vs AI | Pass & Play | Room Code */}
          <div
            className="grid grid-cols-3 gap-1 p-0.5 rounded-lg border"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              borderColor: activeTheme.border
            }}
          >
            <button
              type="button"
              onClick={() => handleModeChange('ai')}
              className={`py-1 px-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'ai' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'ai' ? activeTheme.accent : undefined }}
            >
              <Bot className="w-3 h-3" />
              vs AI
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('pvp')}
              className={`py-1 px-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'pvp' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'pvp' ? activeTheme.accent : undefined }}
            >
              <Users className="w-3 h-3" />
              2P Local
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('online')}
              className={`py-1 px-1.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'online' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'online' ? activeTheme.accent : undefined }}
            >
              <Globe className="w-3 h-3" />
              Room Code
            </button>
          </div>

          {/* Live Detected Opening Card (compact single row) */}
          <div
            className="px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              borderColor: activeTheme.border
            }}
            title={detectedOpening.variation || detectedOpening.name}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.accent }} />
              <div className="text-[11px] font-bold text-white truncate">
                {detectedOpening.name}
                {detectedOpening.variation ? (
                  <span className="font-normal text-slate-400"> · {detectedOpening.variation}</span>
                ) : null}
              </div>
            </div>
            <span
              className="px-1.5 py-0.5 rounded border font-mono text-[10px] font-extrabold shrink-0 tabular-nums leading-none"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive,
                color: activeTheme.accent
              }}
            >
              {detectedOpening.eco}
            </span>
          </div>

          {/* Chess Clock / Time Control Bar (compact inline row) */}
          {(mode !== 'online' || !onlineRoomCode) ? (
            <div
              className="px-2 py-1.5 rounded-lg border flex items-center justify-between gap-1.5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              <select
                aria-label="Chess time control"
                value={timeControlId}
                onChange={e => handleTimeControlSelect(e.target.value)}
                className="px-1.5 py-0.5 rounded border bg-black/35 text-[11px] font-bold text-white focus:outline-none cursor-pointer max-w-[118px] truncate"
                style={{ borderColor: activeTheme.border }}
              >
                {TIME_CONTROLS.map(tc => (
                  <option key={tc.id} value={tc.id} className="bg-slate-900 text-white">
                    {tc.id === 'none'
                      ? 'No Clock'
                      : `${tc.label} (${tc.category[0].toUpperCase()}${tc.category.slice(1)})`}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-5 gap-1 flex-1">
                {(['none', '1+0', '3+2', '5+0', '10+0'] as const).map(presetId => {
                  const preset = getTimeControlById(presetId);
                  const active = timeControlId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleTimeControlSelect(preset.id)}
                      className={`py-0.5 px-1 rounded border text-[10px] font-bold cursor-pointer truncate transition-colors ${
                        active ? 'text-black' : 'text-slate-300 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: active ? activeTheme.accent : 'rgba(0,0,0,0.2)',
                        borderColor: active ? activeTheme.accent : activeTheme.border
                      }}
                    >
                      {preset.id === 'none' ? '∞' : preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className="px-2.5 py-1 rounded-lg border flex items-center justify-between text-[11px]"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: activeTheme.accent }} />
                Room Clock
              </span>
              <span className="font-mono font-bold text-white">{effectiveTimeControl.label}</span>
            </div>
          )}

          {/* Mode-Specific Panel */}
          {mode === 'ai' ? (
            <div className="flex flex-col gap-1.5">
              {/* Compact Bot Quote Row */}
              <div
                className="px-2.5 py-1.5 rounded-lg border flex items-center gap-2"
                style={{
                  backgroundColor: activeTheme.bgSecondary,
                  borderColor: activeTheme.border
                }}
              >
                <div
                  className="w-7 h-7 rounded-md border flex items-center justify-center text-sm shrink-0"
                  style={{
                    backgroundColor: `${selectedBot.accentColor}20`,
                    borderColor: `${selectedBot.accentColor}55`
                  }}
                >
                  <span aria-hidden="true">{selectedBot.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="font-bold truncate" style={{ color: selectedBot.accentColor }}>
                      {selectedBot.name} ({selectedBot.rating})
                    </span>
                    <span className="truncate font-mono text-slate-400 max-w-[48%]">
                      {activeOpening ? activeOpening : selectedBot.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-tight truncate" title={botQuote}>
                    &ldquo;{botQuote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Filter Tiers + Random + Play As on a tight bar */}
              <div className="flex items-center gap-1">
                <div className="grid grid-cols-5 gap-0.5 flex-1">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'easy', label: 'Beg' },
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
                        className={`py-1 px-1 rounded border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate transition-colors ${
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
                    const targetPool = pool.length > 0 ? pool : CHESS_BOTS;
                    const randomBot = targetPool[Math.floor(Math.random() * targetPool.length)];
                    handleSelectBot(randomBot);
                  }}
                  className="px-1.5 py-1 rounded border text-[10px] font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center gap-0.5 shrink-0"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.border
                  }}
                  title="Pick Random Bot"
                >
                  <Shuffle className="w-3 h-3" style={{ color: activeTheme.accent }} />
                </button>
                <div className="flex items-center gap-0.5 shrink-0">
                  {(
                    [
                      { id: 'w', label: 'W' },
                      { id: 'b', label: 'B' },
                      { id: 'random', label: '?' }
                    ] as { id: PlayerSidePref; label: string }[]
                  ).map(opt => {
                    const active = sidePref === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSidePrefChange(opt.id)}
                        className={`w-6 py-1 rounded border text-[10px] font-bold cursor-pointer transition-all ${
                          active ? 'text-black' : 'text-slate-300 hover:text-white'
                        }`}
                        style={{
                          backgroundColor: active
                            ? activeTheme.accent
                            : activeTheme.bgSecondary,
                          borderColor: active ? activeTheme.accent : activeTheme.border
                        }}
                        title={`Play as ${opt.id === 'w' ? 'White' : opt.id === 'b' ? 'Black' : 'Random'}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact Bot List */}
              <div
                className={`${
                  analysisEnabled ? 'h-24' : 'h-32'
                } overflow-y-auto pr-0.5 flex flex-col gap-1`}
              >
                {filteredBots.map(bot => {
                  const active = bot.id === selectedBot.id;
                  return (
                    <button
                      key={bot.id}
                      type="button"
                      onClick={() => handleSelectBot(bot)}
                      className={`w-full px-2 py-1 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 ${
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
                        className="w-6 h-6 rounded border flex items-center justify-center text-xs shrink-0"
                        style={{
                          backgroundColor: `${bot.accentColor}22`,
                          borderColor: `${bot.accentColor}55`
                        }}
                      >
                        <span aria-hidden="true">{bot.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-extrabold truncate">{bot.name}</span>
                        <span
                          className="text-[10px] font-mono font-bold tabular-nums shrink-0"
                          style={{ color: bot.accentColor }}
                        >
                          {bot.rating} · {DIFFICULTY_LABELS[bot.difficulty]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : mode === 'online' ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="chess-player-name"
                  className="text-[11px] font-bold text-slate-300 shrink-0"
                >
                  Name
                </label>
                <input
                  id="chess-player-name"
                  type="text"
                  maxLength={24}
                  value={playerName}
                  onChange={e => handlePlayerNameChange(e.target.value)}
                  placeholder="Player"
                  className="flex-1 px-2 py-1 rounded-md border bg-black/30 text-xs text-white focus:outline-none"
                  style={{ borderColor: activeTheme.border }}
                />
              </div>

              {onlineError && (
                <div className="px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 text-[11px] text-rose-200 flex flex-col gap-1.5">
                  <span>{onlineError}</span>
                  {onlineAuthNeeded && (
                    <button
                      type="button"
                      onClick={handleGoogleSignInForOnline}
                      disabled={onlineSigningIn}
                      className="w-full py-1.5 px-2.5 rounded-md text-black font-extrabold text-[11px] cursor-pointer hover:opacity-95 disabled:opacity-60"
                      style={{ backgroundColor: activeTheme.accent }}
                    >
                      {onlineSigningIn ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                  )}
                </div>
              )}

              {!onlineRoomCode ? (
                <div
                  className="p-2.5 rounded-lg border flex flex-col gap-2"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.border
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-200">Host Side</span>
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
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
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
                    className="w-full py-1.5 px-3 rounded-lg text-black font-extrabold text-xs cursor-pointer shadow-sm hover:opacity-95 disabled:opacity-60"
                    style={{ backgroundColor: activeTheme.accent }}
                  >
                    {wsStatus === 'connecting' ? 'Connecting...' : 'Create Room Code'}
                  </button>

                  <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                    <input
                      type="text"
                      maxLength={8}
                      value={joinCodeInput}
                      onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleJoinRoom();
                      }}
                      placeholder="Enter Room Code"
                      className="flex-1 px-2 py-1.5 rounded-md border bg-black/30 text-xs font-mono font-bold tracking-widest uppercase text-white focus:outline-none"
                      style={{ borderColor: activeTheme.border }}
                    />
                    <button
                      type="button"
                      onClick={() => handleJoinRoom()}
                      disabled={wsStatus === 'connecting' || !joinCodeInput.trim()}
                      className="px-3 py-1.5 rounded-md border text-xs font-extrabold text-white hover:bg-white/10 cursor-pointer disabled:opacity-40 shrink-0"
                      style={{ borderColor: activeTheme.borderActive }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="p-2.5 rounded-lg border flex flex-col gap-2"
                  style={{
                    backgroundColor: activeTheme.bgSecondary,
                    borderColor: activeTheme.borderActive
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400">Room Code</div>
                      <div className="text-lg font-mono font-extrabold tracking-widest text-white select-all">
                        {onlineRoomCode}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyRoom('code')}
                        className="px-2 py-1 rounded border text-[10px] font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center gap-1"
                        style={{ borderColor: activeTheme.border }}
                        title="Copy Room Code"
                      >
                        {copiedType === 'code' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedType === 'code' ? 'Copied' : 'Code'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyRoom('link')}
                        className="px-2 py-1 rounded border text-[10px] font-bold text-slate-200 hover:bg-white/10 cursor-pointer flex items-center gap-1"
                        style={{ borderColor: activeTheme.border }}
                        title="Copy Direct Invite Link"
                      >
                        {copiedType === 'link' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Link2 className="w-3 h-3" />
                        )}
                        <span>{copiedType === 'link' ? 'Copied' : 'Link'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-300 flex items-center justify-between pt-1 border-t border-white/10">
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

              {/* Pending Direct Chess Invites */}
              {incomingChessInvites.length > 0 && (
                <div className="p-2 rounded-lg border border-sky-400/40 bg-sky-500/10 flex flex-col gap-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" />
                    <span>Chess Invites ({incomingChessInvites.length})</span>
                  </div>
                  {incomingChessInvites.map(inv => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between gap-2 bg-black/25 px-2 py-1.5 rounded-md border border-white/10"
                    >
                      <span className="text-[11px] font-bold text-white truncate">
                        {(AVATAR_PRESETS.find(a => a.id === inv.fromAvatarId) || AVATAR_PRESETS[0]).icon}{' '}
                        {inv.fromName}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => void acceptGameInvite(inv)}
                          className="px-2 py-0.5 rounded bg-sky-400 hover:bg-sky-300 text-black text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void declineGameInvite(inv)}
                          className="p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
                          title="Decline"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 1-Click Direct Friend Invites (No Code Needed) */}
              {(!onlineRoomCode || !(onlinePlayers.w && onlinePlayers.b)) && invitableChessPlayers.length > 0 && (
                <div
                  className="p-2 rounded-lg border flex flex-col gap-1.5"
                  style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Invite Friend (No Code)</span>
                    <span className="font-mono text-emerald-400">
                      {invitableChessPlayers.filter(p => p.online).length} online
                    </span>
                  </div>
                  <div className="max-h-28 overflow-y-auto flex flex-col gap-1 pr-0.5">
                    {invitableChessPlayers.map(person => {
                      const alreadyInvited = invitedFriendUids.has(person.uid);
                      const isSendingThis = invitingFriendUid === person.uid;
                      const icon = (AVATAR_PRESETS.find(a => a.id === person.avatarId) || AVATAR_PRESETS[0]).icon;
                      return (
                        <div
                          key={person.uid}
                          className="flex items-center justify-between gap-2 px-2 py-1 rounded-md bg-black/25 border border-white/5"
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
                            onClick={() => void handleInviteFriendToChess(person)}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer transition-colors disabled:opacity-65 ${
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
          ) : (
            <div
              className="flex items-center justify-between px-2.5 py-2 rounded-lg border"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white">Auto-Flip Board</span>
                <span className="text-[10px] text-slate-400">
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
                className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                  autoFlipPvp ? 'text-black' : 'text-slate-300 bg-white/10'
                }`}
                style={{ backgroundColor: autoFlipPvp ? activeTheme.accent : undefined }}
              >
                {autoFlipPvp ? 'On' : 'Off'}
              </button>
            </div>
          )}

          {/* Compact Single-Row Board Theme Swatches */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Palette className="w-3 h-3" />
              {palette.label.split(' ')[0]}
            </span>
            <div className="grid grid-cols-10 gap-1 flex-1">
              {BOARD_PALETTES.map(bp => {
                const active = paletteId === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => handleSelectPalette(bp.id)}
                    className={`h-5 rounded border cursor-pointer transition-transform ${
                      active ? 'scale-110 ring-1 ring-white' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${bp.light} 50%, ${bp.dark} 50%)`,
                      borderColor: active ? activeTheme.accent : 'rgba(0,0,0,0.35)'
                    }}
                    title={bp.label}
                    aria-label={bp.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Game Status Strip when overlay hidden or active */}
          {isGameOver && !showEndOverlay && (
            <div
              className="px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-white truncate">{endBanner.title}</div>
                <div className="text-[10px] text-slate-300 truncate">{endBanner.subtitle}</div>
              </div>
              {mode === 'online' ? (
                onlineMyColor !== 'spectator' && (
                  <button
                    type="button"
                    onClick={() => startNewGame('online')}
                    disabled={hasVotedRematch}
                    className="px-2.5 py-1 rounded text-black text-[11px] font-extrabold cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
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
                  className="px-2.5 py-1 rounded text-black text-[11px] font-extrabold cursor-pointer whitespace-nowrap shrink-0"
                  style={{ backgroundColor: activeTheme.accent }}
                >
                  Rematch
                </button>
              )}
            </div>
          )}

          {/* Optional Analysis Panel (only visible when Analysis toggle is On) */}
          {analysisEnabled && (
            <div
              className="p-2 rounded-lg border flex flex-col gap-1.5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.borderActive
              }}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: activeTheme.accent }} />
                  <span className="text-[11px] font-extrabold text-white">Eval</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/35 font-mono text-[10px] font-extrabold text-white tabular-nums">
                    {isAnalyzingPos || !positionAnalysis
                      ? '...'
                      : formatEvalScore(positionAnalysis.scoreCp, positionAnalysis.mateIn)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowBestArrow(v => !v)}
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                      showBestArrow ? 'text-black' : 'text-slate-300 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: showBestArrow ? activeTheme.accent : undefined,
                      borderColor: showBestArrow ? activeTheme.accent : activeTheme.border
                    }}
                  >
                    Arrow
                  </button>
                  <button
                    type="button"
                    onClick={runFullGameReview}
                    disabled={moveHistory.length === 0 || gameReview.status === 'running'}
                    className="px-1.5 py-0.5 rounded border text-[10px] font-extrabold text-white hover:bg-white/10 cursor-pointer disabled:opacity-40"
                    style={{ borderColor: activeTheme.borderActive }}
                  >
                    {gameReview.status === 'running'
                      ? `${gameReview.progress}/${gameReview.total}`
                      : 'Review'}
                  </button>
                </div>
              </div>

              {positionAnalysis && positionAnalysis.lines.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {positionAnalysis.lines.map((line: AnalysisLine, idx: number) => (
                    <div
                      key={`${line.san}-${idx}`}
                      className="px-1.5 py-0.5 rounded border bg-black/25 font-mono text-[10px] flex items-center gap-1 tabular-nums"
                      style={{ borderColor: idx === 0 ? activeTheme.borderActive : activeTheme.border }}
                    >
                      <span className="text-slate-400">#{idx + 1}</span>
                      <span className="font-bold text-white">{line.san}</span>
                      <span
                        className="font-bold"
                        style={{
                          color: line.scoreCp >= 0 ? '#4ade80' : '#fb7185'
                        }}
                      >
                        {formatEvalScore(line.scoreCp, line.mateIn)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {gameReview.status === 'done' &&
                (gameReview.whiteAccuracy !== null || gameReview.blackAccuracy !== null) && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/10 text-[10px]">
                    <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                      <span className="text-slate-300 font-semibold">White Acc</span>
                      <span className="font-mono font-extrabold text-white tabular-nums">
                        {gameReview.whiteAccuracy ?? '—'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-white/5">
                      <span className="text-slate-300 font-semibold">Black Acc</span>
                      <span className="font-mono font-extrabold text-white tabular-nums">
                        {gameReview.blackAccuracy ?? '—'}%
                      </span>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Compact Move History Log & Explorer */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 gap-1.5">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" style={{ color: activeTheme.accent }} />
                Moves
              </span>

              {moveHistory.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setViewPly(0)}
                    disabled={displayedPly === 0}
                    className="p-0.5 rounded border text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    style={{ borderColor: activeTheme.border }}
                    title="Start position"
                  >
                    <ChevronFirst className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPly(Math.max(0, displayedPly - 1))}
                    disabled={displayedPly === 0}
                    className="p-0.5 rounded border text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    style={{ borderColor: activeTheme.border }}
                    title="Previous move"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = displayedPly + 1;
                      setViewPly(next >= moveHistory.length ? null : next);
                    }}
                    disabled={isViewingLive}
                    className="p-0.5 rounded border text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    style={{ borderColor: activeTheme.border }}
                    title="Next move"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPly(null)}
                    disabled={isViewingLive}
                    className="p-0.5 rounded border text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    style={{ borderColor: activeTheme.border }}
                    title="Live position"
                  >
                    <ChevronLast className="w-3 h-3" />
                  </button>
                </div>
              )}

              <span className="font-mono tabular-nums text-[10px]">
                {moveHistory.length} {moveHistory.length === 1 ? 'ply' : 'plies'}
              </span>
            </div>

            <div
              ref={moveListRef}
              className={`${
                analysisEnabled ? 'h-24' : 'h-28'
              } overflow-y-auto rounded-lg border p-1.5 font-mono text-[11px] tabular-nums`}
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              {pairedMoves.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 font-sans text-[11px] text-center px-3">
                  Drag or tap pieces to play. Tap your piece on opponent&apos;s turn to premove.
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {pairedMoves.map(pair => {
                    const whitePly = (pair.moveNumber - 1) * 2 + 1;
                    const blackPly = whitePly + 1;
                    const whiteQual = gameReview.qualities[whitePly - 1];
                    const blackQual = gameReview.qualities[blackPly - 1];
                    const isWhiteSelected = displayedPly === whitePly;
                    const isBlackSelected = displayedPly === blackPly;
                    return (
                      <div
                        key={pair.moveNumber}
                        className="grid grid-cols-[1.8rem_1fr_1fr] items-center px-1 py-0.5 rounded"
                      >
                        <span className="text-slate-500">{pair.moveNumber}.</span>
                        <button
                          type="button"
                          onClick={() =>
                            setViewPly(whitePly >= moveHistory.length ? null : whitePly)
                          }
                          className={`text-left px-1 py-0.5 rounded cursor-pointer flex items-center justify-between gap-1 font-semibold hover:bg-white/10 ${
                            isWhiteSelected ? 'bg-white/10 text-white' : 'text-slate-200'
                          }`}
                          style={{
                            color: isWhiteSelected ? activeTheme.accent : undefined
                          }}
                        >
                          <span>{pair.white?.san}</span>
                          {whiteQual && (
                            <span
                              className="text-[9px] font-extrabold"
                              style={{ color: QUALITY_META[whiteQual].color }}
                              title={QUALITY_META[whiteQual].label}
                            >
                              {QUALITY_META[whiteQual].short}
                            </span>
                          )}
                        </button>
                        {pair.black ? (
                          <button
                            type="button"
                            onClick={() =>
                              setViewPly(blackPly >= moveHistory.length ? null : blackPly)
                            }
                            className={`text-left px-1 py-0.5 rounded cursor-pointer flex items-center justify-between gap-1 font-semibold hover:bg-white/10 ${
                              isBlackSelected ? 'bg-white/10 text-white' : 'text-slate-300'
                            }`}
                            style={{
                              color: isBlackSelected ? activeTheme.accent : undefined
                            }}
                          >
                            <span>{pair.black.san}</span>
                            {blackQual && (
                              <span
                                className="text-[9px] font-extrabold"
                                style={{ color: QUALITY_META[blackQual].color }}
                                title={QUALITY_META[blackQual].label}
                              >
                                {QUALITY_META[blackQual].short}
                              </span>
                            )}
                          </button>
                        ) : (
                          <span />
                        )}
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

      {/* Floating Dragged Piece Overlay (rendered outside overflow-hidden board for unrestricted touch/mouse drag) */}
      {dragOverlay?.isDragging && (
        <div
          className="fixed pointer-events-none z-[90] flex items-center justify-center"
          style={{
            left: dragOverlay.clientX,
            top: dragOverlay.clientY,
            width: dragOverlay.squareSize,
            height: dragOverlay.squareSize,
            transform: 'translate(-50%, -58%) scale(1.16)',
            filter: 'drop-shadow(0 12px 18px rgba(0, 0, 0, 0.55))'
          }}
          aria-hidden="true"
        >
          <ChessPieceSvg piece={dragOverlay.piece} className="w-[88%] h-[88%]" />
        </div>
      )}
    </div>
  );
};
