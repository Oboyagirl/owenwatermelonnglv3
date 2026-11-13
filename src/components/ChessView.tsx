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
  Trophy,
  Sparkles,
  Palette,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import {
  AIDifficulty,
  ChessMove,
  ChessState,
  MoveRecord,
  Piece,
  PieceColor,
  PieceType,
  PromotionPieceType,
  Square,
  applyMove,
  chooseAIMove,
  computeMaterialAndCaptures,
  createInitialState,
  getLegalMoves
} from '../utils/chessEngine';

interface ChessViewProps {
  activeTheme: ThemeConfig;
}

type GameMode = 'ai' | 'pvp';
type PlayerSidePref = 'w' | 'b' | 'random';
type BoardPaletteId = 'wood' | 'tournament' | 'slate';

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

const DIFFICULTIES: { id: AIDifficulty; label: string; rating: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', rating: '~650', desc: 'Casual & forgiving' },
  { id: 'medium', label: 'Medium', rating: '~1200', desc: 'Solid club player' },
  { id: 'hard', label: 'Hard', rating: '~1650', desc: 'Tactical & sharp' },
  { id: 'expert', label: 'Expert', rating: '~2000', desc: 'Deep lookahead' }
];

// Crisp inline SVG Staunton-inspired chess pieces
const ChessPieceSvg: React.FC<{ piece: Piece; className?: string }> = ({ piece, className = 'w-[84%] h-[84%]' }) => {
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
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [sidePref, setSidePref] = useState<PlayerSidePref>('w');
  const [humanColor, setHumanColor] = useState<PieceColor>('w');
  const [autoFlipPvp, setAutoFlipPvp] = useState(false);

  // Visual Preferences
  const [paletteId, setPaletteId] = useState<BoardPaletteId>('wood');
  const [isFlipped, setIsFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game State & Timeline
  const [gameState, setGameState] = useState<ChessState>(() => createInitialState());
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([]);
  const [resignedWinner, setResignedWinner] = useState<PieceColor | null>(null);
  const [showEndOverlay, setShowEndOverlay] = useState(true);

  // Interaction State
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [hintMove, setHintMove] = useState<ChessMove | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [dragFrom, setDragFrom] = useState<Square | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const moveListRef = useRef<HTMLDivElement | null>(null);

  const palette = useMemo(
    () => BOARD_PALETTES.find(p => p.id === paletteId) || BOARD_PALETTES[0],
    [paletteId]
  );

  // Synthesized Web Audio sound effects (zero external MP3 needed)
  const playSound = useCallback(
    (type: 'move' | 'capture' | 'check' | 'castle' | 'gameover') => {
      if (!soundEnabled) return;
      try {
        const AudioCtx =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        const tone = (freq: number, dur: number, startOffset = 0, vol = 0.14, wave: OscillatorType = 'triangle') => {
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
  const isHumanTurn = !isGameOver && (mode === 'pvp' || gameState.turn === humanColor);

  const startNewGame = useCallback(
    (nextMode: GameMode = mode, nextPref: PlayerSidePref = sidePref) => {
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
      setResignedWinner(null);
      setShowEndOverlay(true);
      setIsAIThinking(false);
    },
    [mode, sidePref]
  );

  const commitMove = useCallback(
    (move: ChessMove) => {
      setSnapshots(prev => [...prev, { state: gameState, history: moveHistory }]);
      const { nextState, record } = applyMove(gameState, move);
      setGameState(nextState);
      setMoveHistory(prev => [...prev, record]);
      setSelectedSquare(null);
      setPendingPromotion(null);
      setHintMove(null);
      setShowEndOverlay(true);

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
    [gameState, moveHistory, mode, autoFlipPvp, playSound]
  );

  // Trigger AI turn automatically when it's AI's move
  useEffect(() => {
    if (mode !== 'ai' || isGameOver || gameState.turn !== aiColor) {
      setIsAIThinking(false);
      return;
    }

    setIsAIThinking(true);
    const delayMs = difficulty === 'easy' ? 320 : difficulty === 'medium' ? 380 : 420;
    const timer = window.setTimeout(() => {
      const budget = difficulty === 'expert' ? 950 : difficulty === 'hard' ? 650 : 350;
      const aiMove = chooseAIMove(gameState, difficulty, budget);
      setIsAIThinking(false);
      if (aiMove) {
        commitMove(aiMove);
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [mode, isGameOver, gameState, aiColor, difficulty, commitMove]);

  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !isHumanTurn) return [];
    return getLegalMoves(gameState, selectedSquare);
  }, [gameState, selectedSquare, isHumanTurn]);

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

  const handleSquareClick = (r: number, c: number) => {
    if (!isHumanTurn || pendingPromotion) return;

    const clickedPiece = gameState.board[r][c];

    if (selectedSquare) {
      if (selectedSquare.r === r && selectedSquare.c === c) {
        setSelectedSquare(null);
        return;
      }

      // Attempt move to clicked destination
      if (tryMoveToSquare(selectedSquare, { r, c })) {
        return;
      }

      // Switch selection if clicking another friendly piece
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
    if (snapshots.length === 0 || isAIThinking) return;

    // In AI mode, undo back to the human's previous turn (2 plies if AI already moved, or 1 if AI hasn't)
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
    setResignedWinner(null);
    setShowEndOverlay(true);

    if (mode === 'pvp' && autoFlipPvp) {
      setIsFlipped(snap.state.turn === 'b');
    }
  };

  const handleHint = () => {
    if (!isHumanTurn || isGameOver) return;
    const suggestion = chooseAIMove(gameState, 'hard', 450);
    if (suggestion) {
      setHintMove(suggestion);
      setSelectedSquare(suggestion.from);
    }
  };

  const handleResign = () => {
    if (isGameOver) return;
    const losingColor = mode === 'ai' ? humanColor : gameState.turn;
    setResignedWinner(losingColor === 'w' ? 'b' : 'w');
    setShowEndOverlay(true);
    playSound('gameover');
  };

  const handleModeChange = (nextMode: GameMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    startNewGame(nextMode, sidePref);
  };

  const handleDifficultyChange = (nextDiff: AIDifficulty) => {
    setDifficulty(nextDiff);
  };

  const handleSidePrefChange = (nextPref: PlayerSidePref) => {
    setSidePref(nextPref);
    startNewGame('ai', nextPref);
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

  const getPlayerLabel = (color: PieceColor) => {
    if (mode === 'pvp') {
      return color === 'w' ? 'Player 1 (White)' : 'Player 2 (Black)';
    }
    if (color === humanColor) {
      return `You (${color === 'w' ? 'White' : 'Black'})`;
    }
    const diffMeta = DIFFICULTIES.find(d => d.id === difficulty);
    return `Watermelon AI · ${diffMeta?.label || difficulty} (${color === 'w' ? 'White' : 'Black'})`;
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
          ? { title: 'Victory by Checkmate', subtitle: `You defeated ${difficulty.toUpperCase()} AI!` }
          : { title: 'Defeat by Checkmate', subtitle: `${winnerName} delivered checkmate.` };
      }
      return {
        title: `${winnerName} Wins by Checkmate`,
        subtitle: 'King has no legal escape.'
      };
    }
    if (gameState.status === 'stalemate') {
      return { title: 'Draw by Stalemate', subtitle: 'No legal moves available and king is not in check.' };
    }
    if (gameState.status === 'draw_repetition') {
      return { title: 'Draw by Repetition', subtitle: 'The same position occurred three times.' };
    }
    if (gameState.status === 'draw_fifty_move') {
      return { title: 'Draw · 50-Move Rule', subtitle: 'Fifty moves played without a capture or pawn move.' };
    }
    if (gameState.status === 'draw_insufficient_material') {
      return { title: 'Draw · Insufficient Material', subtitle: 'Neither side has enough pieces to checkmate.' };
    }
    return { title: 'Game Over', subtitle: '' };
  };

  const renderPlayerStrip = (color: PieceColor) => {
    const isTurn = !isGameOver && gameState.turn === color;
    const isThinkingHere = mode === 'ai' && color === aiColor && isAIThinking;
    const capturedPieces = color === 'w' ? material.capturedByWhite : material.capturedByBlack;
    const advantage = color === 'w' ? material.whiteAdvantage : material.blackAdvantage;
    const inCheck = gameState.inCheckColor === color && !isGameOver;

    return (
      <div
        className="w-full px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
        style={{
          backgroundColor: isTurn ? activeTheme.bgCard : activeTheme.bgSecondary,
          borderColor: isTurn ? activeTheme.borderActive : activeTheme.border
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              backgroundColor: color === 'w' ? '#e2e8f0' : '#0f172a',
              borderColor: isTurn ? activeTheme.accent : 'rgba(255,255,255,0.15)'
            }}
          >
            <ChessPieceSvg piece={{ color, type: 'k' }} className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-bold text-white truncate">
                {getPlayerLabel(color)}
              </span>
              {inCheck && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold shrink-0">
                  CHECK
                </span>
              )}
              {isThinkingHere && (
                <span
                  className="text-[11px] font-semibold shrink-0"
                  style={{ color: activeTheme.accent }}
                >
                  Thinking...
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 min-h-[18px] mt-0.5 flex-wrap">
              {capturedPieces.map((cp, idx) => (
                <div key={`${cp.type}-${idx}`} className="w-4 h-4 -mr-0.5">
                  <ChessPieceSvg piece={cp} className="w-4 h-4" />
                </div>
              ))}
              {advantage > 0 && (
                <span className="text-[11px] font-mono font-bold text-slate-300 ml-1 tabular-nums">
                  +{advantage}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
              isTurn ? 'text-black' : 'text-slate-400 bg-white/5'
            }`}
            style={{
              backgroundColor: isTurn ? activeTheme.accent : undefined
            }}
          >
            {isTurn ? 'Your Turn' : 'Waiting'}
          </span>
        </div>
      </div>
    );
  };

  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const endBanner = getEndBannerCopy();

  return (
    <div
      className="flex-1 flex flex-col min-h-full p-3 sm:p-5 lg:p-6 text-slate-100"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Board & Player Bars */}
        <div className="w-full lg:flex-1 flex flex-col items-center gap-2.5 max-w-[620px] mx-auto">
          {renderPlayerStrip(topColor)}

          {/* Chessboard Container */}
          <div
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
                  const isKingInCheckHere =
                    piece?.type === 'k' &&
                    piece.color === gameState.inCheckColor &&
                    !isGameOver;

                  let squareBg = isLightSquare ? palette.light : palette.dark;
                  if (isSelected) {
                    squareBg = '#facc15';
                  } else if (isLastMoveFrom || isLastMoveTo) {
                    squareBg = isLightSquare ? '#f5e68c' : '#baca44';
                  }

                  const coordColor = isLightSquare ? palette.coordLight : palette.coordDark;
                  const showRankLabel = visualColIdx === 0;
                  const showFileLabel = visualRowIdx === 7;
                  const canDragThisPiece =
                    Boolean(piece) && isHumanTurn && piece?.color === gameState.turn;

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleSquareClick(r, c)}
                      onDragOver={(e) => {
                        if (dragFrom && isHumanTurn) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!dragFrom || !isHumanTurn) return;
                        if (dragFrom.r !== r || dragFrom.c !== c) {
                          tryMoveToSquare(dragFrom, { r, c });
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

                      {/* Chess Piece */}
                      {piece && (
                        <div
                          draggable={canDragThisPiece}
                          onDragStart={() => {
                            if (!canDragThisPiece) return;
                            setDragFrom({ r, c });
                            setSelectedSquare({ r, c });
                          }}
                          onDragEnd={() => setDragFrom(null)}
                          className={`w-full h-full flex items-center justify-center transition-transform duration-150 ${
                            isSelected ? 'scale-108' : 'hover:scale-105'
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
                    <button
                      type="button"
                      onClick={() => startNewGame()}
                      className="flex-1 py-2.5 px-4 rounded-xl text-black font-extrabold text-xs cursor-pointer shadow-lg flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                      style={{ backgroundColor: activeTheme.accent }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Play Again
                    </button>
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

        {/* Right Column: Match Setup, Controls & Move History */}
        <div
          className="w-full lg:w-88 xl:w-96 rounded-2xl border p-4 flex flex-col gap-4 shadow-xl"
          style={{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.border
          }}
        >
          {/* Header & Mode Switch */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Chess Studio</span>
              </h1>
              <p className="text-xs text-slate-400">
                Full ruleset · {mode === 'ai' ? 'AI Opponent' : 'Local 2-Player'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => startNewGame()}
              className="px-3 py-2 rounded-xl text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md hover:opacity-95 transition-opacity"
              style={{ backgroundColor: activeTheme.accent }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Match
            </button>
          </div>

          {/* Mode Toggle: vs AI | Human vs Human */}
          <div
            className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border"
            style={{
              backgroundColor: activeTheme.bgSecondary,
              borderColor: activeTheme.border
            }}
          >
            <button
              type="button"
              onClick={() => handleModeChange('ai')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
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
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                mode === 'pvp' ? 'text-black shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: mode === 'pvp' ? activeTheme.accent : undefined }}
            >
              <Users className="w-3.5 h-3.5" />
              Human vs Human
            </button>
          </div>

          {/* AI Difficulty & Side Controls */}
          {mode === 'ai' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-300">AI Difficulty</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {DIFFICULTIES.map(d => {
                    const active = difficulty === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDifficultyChange(d.id)}
                        className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'text-white shadow-sm'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: active
                            ? activeTheme.accentBadge
                            : activeTheme.bgSecondary,
                          borderColor: active ? activeTheme.accent : activeTheme.border
                        }}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold">{d.label}</span>
                          <span
                            className="text-[11px] font-mono tabular-nums"
                            style={{ color: active ? activeTheme.accent : '#94a3b8' }}
                          >
                            {d.rating}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {d.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
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
              disabled={snapshots.length === 0 || isAIThinking}
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title="Undo Move"
            >
              <Undo2 className="w-4 h-4" />
              <span className="text-[10px]">Undo</span>
            </button>

            <button
              type="button"
              onClick={handleHint}
              disabled={!isHumanTurn || isGameOver}
              className="py-2 px-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
              title="Suggest Strong Move"
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
              disabled={isGameOver}
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
              <button
                type="button"
                onClick={() => startNewGame()}
                className="px-3 py-1.5 rounded-lg text-black text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
                style={{ backgroundColor: activeTheme.accent }}
              >
                Rematch
              </button>
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
              className="h-52 overflow-y-auto rounded-xl border p-2 font-mono text-xs tabular-nums"
              style={{
                backgroundColor: activeTheme.bgSecondary,
                borderColor: activeTheme.border
              }}
            >
              {pairedMoves.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 font-sans text-xs text-center px-4">
                  Make a move on the board to start the game.
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
