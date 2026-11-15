import {
  CHESS_BOTS,
  UNIVERSAL_DEFENSE_LINES,
  getBotById,
  pickBotVoiceline
} from './chessBots.ts';
import type {
  BotStyle,
  BotVoicelineEvent,
  ChessBot,
  OpeningBookLine
} from './chessBots.ts';
import { detectOpening } from './chessOpenings.ts';
import type { DetectedOpening } from './chessOpenings.ts';

export {
  CHESS_BOTS,
  UNIVERSAL_DEFENSE_LINES,
  detectOpening,
  getBotById,
  pickBotVoiceline
};
export type {
  BotStyle,
  BotVoicelineEvent,
  ChessBot,
  DetectedOpening,
  OpeningBookLine
};

export type TimeControlCategory = 'untimed' | 'bullet' | 'blitz' | 'rapid';

export interface TimeControlOption {
  id: string;
  label: string;
  category: TimeControlCategory;
  baseMs: number;
  incMs: number;
}

export const TIME_CONTROLS: TimeControlOption[] = [
  { id: 'none', label: 'No Clock', category: 'untimed', baseMs: 0, incMs: 0 },
  { id: '1+0', label: '1 min', category: 'bullet', baseMs: 60_000, incMs: 0 },
  { id: '1+1', label: '1 | 1', category: 'bullet', baseMs: 60_000, incMs: 1_000 },
  { id: '2+1', label: '2 | 1', category: 'bullet', baseMs: 120_000, incMs: 1_000 },
  { id: '3+0', label: '3 min', category: 'blitz', baseMs: 180_000, incMs: 0 },
  { id: '3+2', label: '3 | 2', category: 'blitz', baseMs: 180_000, incMs: 2_000 },
  { id: '5+0', label: '5 min', category: 'blitz', baseMs: 300_000, incMs: 0 },
  { id: '5+3', label: '5 | 3', category: 'blitz', baseMs: 300_000, incMs: 3_000 },
  { id: '10+0', label: '10 min', category: 'rapid', baseMs: 600_000, incMs: 0 },
  { id: '15+10', label: '15 | 10', category: 'rapid', baseMs: 900_000, incMs: 10_000 },
  { id: '30+0', label: '30 min', category: 'rapid', baseMs: 1_800_000, incMs: 0 }
];

export function getTimeControlById(id?: string | null): TimeControlOption {
  if (!id) return TIME_CONTROLS[0];
  return TIME_CONTROLS.find(tc => tc.id === id) || TIME_CONTROLS[0];
}

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PromotionPieceType = 'q' | 'r' | 'b' | 'n';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export interface Square {
  r: number; // 0 = rank 8, 7 = rank 1
  c: number; // 0 = file a, 7 = file h
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PromotionPieceType;
  isCapture?: boolean;
  isEnPassant?: boolean;
  isCastle?: 'K' | 'Q';
}

export type GameStatus =
  | 'playing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw_repetition'
  | 'draw_fifty_move'
  | 'draw_insufficient_material';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ChessState {
  board: (Piece | null)[][];
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: Square | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  positionCounts: Record<string, number>;
  lastMove?: ChessMove;
  status: GameStatus;
  winner: PieceColor | 'draw' | null;
  inCheckColor: PieceColor | null;
}

export interface MoveRecord {
  san: string;
  move: ChessMove;
  color: PieceColor;
  moveNumber: number;
  captured?: Piece | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function squareToAlgebraic(sq: Square): string {
  return `${FILES[sq.c]}${8 - sq.r}`;
}

export function oppositeColor(color: PieceColor): PieceColor {
  return color === 'w' ? 'b' : 'w';
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function getInitialBoard(): (Piece | null)[][] {
  const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));

  for (let c = 0; c < 8; c++) {
    board[0][c] = { color: 'b', type: backRank[c] };
    board[1][c] = { color: 'b', type: 'p' };
    board[6][c] = { color: 'w', type: 'p' };
    board[7][c] = { color: 'w', type: backRank[c] };
  }

  return board;
}

function hasLegalEnPassantCapture(
  board: (Piece | null)[][],
  turn: PieceColor,
  ep: Square | null
): boolean {
  if (!ep) return false;
  const pawnRow = turn === 'w' ? ep.r + 1 : ep.r - 1;
  if (pawnRow < 0 || pawnRow > 7) return false;
  for (const dc of [-1, 1]) {
    const nc = ep.c + dc;
    if (nc >= 0 && nc < 8) {
      const p = board[pawnRow][nc];
      if (p && p.color === turn && p.type === 'p') {
        return true;
      }
    }
  }
  return false;
}

export function getPositionKey(
  board: (Piece | null)[][],
  turn: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Square | null
): string {
  let rows = '';
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) {
        empty++;
      } else {
        if (empty > 0) {
          rows += String(empty);
          empty = 0;
        }
        rows += p.color === 'w' ? p.type.toUpperCase() : p.type;
      }
    }
    if (empty > 0) rows += String(empty);
    if (r < 7) rows += '/';
  }

  const castleStr =
    (castling.wK ? 'K' : '') +
    (castling.wQ ? 'Q' : '') +
    (castling.bK ? 'k' : '') +
    (castling.bQ ? 'q' : '') || '-';

  const epStr =
    enPassantTarget && hasLegalEnPassantCapture(board, turn, enPassantTarget)
      ? squareToAlgebraic(enPassantTarget)
      : '-';

  return `${rows} ${turn} ${castleStr} ${epStr}`;
}

export function createInitialState(): ChessState {
  const board = getInitialBoard();
  const castling: CastlingRights = { wK: true, wQ: true, bK: true, bQ: true };
  const key = getPositionKey(board, 'w', castling, null);
  return {
    board,
    turn: 'w',
    castling,
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    positionCounts: { [key]: 1 },
    status: 'playing',
    winner: null,
    inCheckColor: null
  };
}

export function findKing(board: (Piece | null)[][], color: PieceColor): Square | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === 'k') {
        return { r, c };
      }
    }
  }
  return null;
}

const KNIGHT_DELTAS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];
const KING_DELTAS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function isSquareAttacked(
  board: (Piece | null)[][],
  targetR: number,
  targetC: number,
  byColor: PieceColor
): boolean {
  // Pawn attacks (if attacker is white, pawns sit on targetR + 1; if black, targetR - 1)
  const pawnAttackRow = byColor === 'w' ? targetR + 1 : targetR - 1;
  if (pawnAttackRow >= 0 && pawnAttackRow < 8) {
    for (const dc of [-1, 1]) {
      const nc = targetC + dc;
      if (nc >= 0 && nc < 8) {
        const p = board[pawnAttackRow][nc];
        if (p && p.color === byColor && p.type === 'p') return true;
      }
    }
  }

  // Knight attacks
  for (const [dr, dc] of KNIGHT_DELTAS) {
    const nr = targetR + dr;
    const nc = targetC + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'n') return true;
    }
  }

  // King attacks
  for (const [dr, dc] of KING_DELTAS) {
    const nr = targetR + dr;
    const nc = targetC + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p && p.color === byColor && p.type === 'k') return true;
    }
  }

  // Diagonal rays (Bishop / Queen)
  for (const [dr, dc] of BISHOP_DIRS) {
    let nr = targetR + dr;
    let nc = targetC + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Orthogonal rays (Rook / Queen)
  for (const [dr, dc] of ROOK_DIRS) {
    let nr = targetR + dr;
    let nc = targetC + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

export function isKingInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  return isSquareAttacked(board, king.r, king.c, oppositeColor(color));
}

function generatePseudoMoves(
  board: (Piece | null)[][],
  turn: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Square | null
): ChessMove[] {
  const moves: ChessMove[] = [];
  const enemy = oppositeColor(turn);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== turn) continue;

      if (piece.type === 'p') {
        const dir = turn === 'w' ? -1 : 1;
        const startRow = turn === 'w' ? 6 : 1;
        const promoRow = turn === 'w' ? 0 : 7;

        const oneR = r + dir;
        if (oneR >= 0 && oneR < 8 && !board[oneR][c]) {
          if (oneR === promoRow) {
            for (const promo of ['q', 'r', 'b', 'n'] as PromotionPieceType[]) {
              moves.push({ from: { r, c }, to: { r: oneR, c }, promotion: promo });
            }
          } else {
            moves.push({ from: { r, c }, to: { r: oneR, c } });
            const twoR = r + dir * 2;
            if (r === startRow && !board[twoR][c]) {
              moves.push({ from: { r, c }, to: { r: twoR, c } });
            }
          }
        }

        // Captures & en passant
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nc < 0 || nc >= 8 || oneR < 0 || oneR >= 8) continue;
          const target = board[oneR][nc];
          if (target && target.color === enemy) {
            if (oneR === promoRow) {
              for (const promo of ['q', 'r', 'b', 'n'] as PromotionPieceType[]) {
                moves.push({
                  from: { r, c },
                  to: { r: oneR, c: nc },
                  promotion: promo,
                  isCapture: true
                });
              }
            } else {
              moves.push({
                from: { r, c },
                to: { r: oneR, c: nc },
                isCapture: true
              });
            }
          } else if (
            enPassantTarget &&
            enPassantTarget.r === oneR &&
            enPassantTarget.c === nc
          ) {
            moves.push({
              from: { r, c },
              to: { r: oneR, c: nc },
              isCapture: true,
              isEnPassant: true
            });
          }
        }
      } else if (piece.type === 'n') {
        for (const [dr, dc] of KNIGHT_DELTAS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) continue;
          const target = board[nr][nc];
          if (!target || target.color === enemy) {
            moves.push({
              from: { r, c },
              to: { r: nr, c: nc },
              isCapture: Boolean(target)
            });
          }
        }
      } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
        const dirs =
          piece.type === 'b'
            ? BISHOP_DIRS
            : piece.type === 'r'
            ? ROOK_DIRS
            : [...BISHOP_DIRS, ...ROOK_DIRS];
        for (const [dr, dc] of dirs) {
          let nr = r + dr;
          let nc = c + dc;
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = board[nr][nc];
            if (!target) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } });
            } else {
              if (target.color === enemy) {
                moves.push({
                  from: { r, c },
                  to: { r: nr, c: nc },
                  isCapture: true
                });
              }
              break;
            }
            nr += dr;
            nc += dc;
          }
        }
      } else if (piece.type === 'k') {
        for (const [dr, dc] of KING_DELTAS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) continue;
          const target = board[nr][nc];
          if (!target || target.color === enemy) {
            moves.push({
              from: { r, c },
              to: { r: nr, c: nc },
              isCapture: Boolean(target)
            });
          }
        }

        // Castling
        const homeRow = turn === 'w' ? 7 : 0;
        if (r === homeRow && c === 4 && !isSquareAttacked(board, homeRow, 4, enemy)) {
          const canK = turn === 'w' ? castling.wK : castling.bK;
          if (
            canK &&
            !board[homeRow][5] &&
            !board[homeRow][6] &&
            board[homeRow][7]?.color === turn &&
            board[homeRow][7]?.type === 'r' &&
            !isSquareAttacked(board, homeRow, 5, enemy) &&
            !isSquareAttacked(board, homeRow, 6, enemy)
          ) {
            moves.push({
              from: { r: homeRow, c: 4 },
              to: { r: homeRow, c: 6 },
              isCastle: 'K'
            });
          }

          const canQ = turn === 'w' ? castling.wQ : castling.bQ;
          if (
            canQ &&
            !board[homeRow][1] &&
            !board[homeRow][2] &&
            !board[homeRow][3] &&
            board[homeRow][0]?.color === turn &&
            board[homeRow][0]?.type === 'r' &&
            !isSquareAttacked(board, homeRow, 3, enemy) &&
            !isSquareAttacked(board, homeRow, 2, enemy)
          ) {
            moves.push({
              from: { r: homeRow, c: 4 },
              to: { r: homeRow, c: 2 },
              isCastle: 'Q'
            });
          }
        }
      }
    }
  }

  return moves;
}

function executeMoveOnBoard(
  board: (Piece | null)[][],
  move: ChessMove
): (Piece | null)[][] {
  const next = cloneBoard(board);
  const movingPiece = next[move.from.r][move.from.c];
  if (!movingPiece) return next;

  next[move.from.r][move.from.c] = null;

  if (move.isEnPassant) {
    next[move.from.r][move.to.c] = null;
  }

  if (move.isCastle === 'K') {
    const row = move.from.r;
    next[row][5] = next[row][7];
    next[row][7] = null;
  } else if (move.isCastle === 'Q') {
    const row = move.from.r;
    next[row][3] = next[row][0];
    next[row][0] = null;
  }

  next[move.to.r][move.to.c] = move.promotion
    ? { color: movingPiece.color, type: move.promotion }
    : movingPiece;

  return next;
}

export function getLegalMovesForBoard(
  board: (Piece | null)[][],
  turn: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Square | null
): ChessMove[] {
  const pseudo = generatePseudoMoves(board, turn, castling, enPassantTarget);
  return pseudo.filter(move => {
    const nextBoard = executeMoveOnBoard(board, move);
    return !isKingInCheck(nextBoard, turn);
  });
}

export function getLegalMoves(state: ChessState, from?: Square): ChessMove[] {
  if (
    state.status === 'checkmate' ||
    state.status === 'stalemate' ||
    state.status === 'draw_fifty_move' ||
    state.status === 'draw_insufficient_material' ||
    state.status === 'draw_repetition'
  ) {
    return [];
  }
  const all = getLegalMovesForBoard(
    state.board,
    state.turn,
    state.castling,
    state.enPassantTarget
  );
  if (!from) return all;
  return all.filter(m => m.from.r === from.r && m.from.c === from.c);
}

export function hasInsufficientMaterial(board: (Piece | null)[][]): boolean {
  const pieces: { color: PieceColor; type: PieceType; r: number; c: number }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type !== 'k') {
        pieces.push({ ...p, r, c });
      }
    }
  }

  if (pieces.length === 0) return true; // K vs K
  if (pieces.length === 1) {
    return pieces[0].type === 'n' || pieces[0].type === 'b'; // K+N vs K or K+B vs K
  }
  if (pieces.length === 2) {
    // K+B vs K+B on same-colored squares
    if (
      pieces[0].type === 'b' &&
      pieces[1].type === 'b' &&
      pieces[0].color !== pieces[1].color
    ) {
      const sqColor0 = (pieces[0].r + pieces[0].c) % 2;
      const sqColor1 = (pieces[1].r + pieces[1].c) % 2;
      return sqColor0 === sqColor1;
    }
  }
  return false;
}

// Used for timeout adjudication: a player cannot win on time if they only have K, K+N, K+B, or same-color bishops
export function hasOnlyInsufficientMaterialForSide(
  board: (Piece | null)[][],
  color: PieceColor
): boolean {
  const pieces: { type: PieceType; r: number; c: number }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type !== 'k') {
        pieces.push({ type: p.type, r, c });
      }
    }
  }
  if (pieces.length === 0) return true;
  if (pieces.length === 1) {
    return pieces[0].type === 'n' || pieces[0].type === 'b';
  }
  if (pieces.every(p => p.type === 'b')) {
    const firstSqColor = (pieces[0].r + pieces[0].c) % 2;
    return pieces.every(p => (p.r + p.c) % 2 === firstSqColor);
  }
  return false;
}

function buildSan(
  prevState: ChessState,
  move: ChessMove,
  allLegalPrevMoves: ChessMove[],
  nextInCheck: boolean,
  nextIsCheckmate: boolean
): string {
  if (move.isCastle === 'K') {
    return 'O-O' + (nextIsCheckmate ? '#' : nextInCheck ? '+' : '');
  }
  if (move.isCastle === 'Q') {
    return 'O-O-O' + (nextIsCheckmate ? '#' : nextInCheck ? '+' : '');
  }

  const piece = prevState.board[move.from.r][move.from.c];
  if (!piece) return squareToAlgebraic(move.to);

  const dest = squareToAlgebraic(move.to);
  const captureChar = move.isCapture ? 'x' : '';
  let san = '';

  if (piece.type === 'p') {
    if (move.isCapture) {
      san += FILES[move.from.c] + 'x';
    }
    san += dest;
    if (move.promotion) {
      san += '=' + move.promotion.toUpperCase();
    }
  } else {
    san += piece.type.toUpperCase();
    // Disambiguate if another piece of same type can move to same destination
    const ambiguous = allLegalPrevMoves.filter(
      m =>
        m.to.r === move.to.r &&
        m.to.c === move.to.c &&
        (m.from.r !== move.from.r || m.from.c !== move.from.c) &&
        prevState.board[m.from.r][m.from.c]?.type === piece.type &&
        prevState.board[m.from.r][m.from.c]?.color === piece.color
    );

    if (ambiguous.length > 0) {
      const sameFile = ambiguous.some(m => m.from.c === move.from.c);
      const sameRank = ambiguous.some(m => m.from.r === move.from.r);
      if (!sameFile) {
        san += FILES[move.from.c];
      } else if (!sameRank) {
        san += String(8 - move.from.r);
      } else {
        san += FILES[move.from.c] + String(8 - move.from.r);
      }
    }

    san += captureChar + dest;
  }

  if (nextIsCheckmate) san += '#';
  else if (nextInCheck) san += '+';

  return san;
}

function updateCastlingRights(
  castling: CastlingRights,
  move: ChessMove,
  movingPiece: Piece
): CastlingRights {
  const next = { ...castling };

  if (movingPiece.type === 'k') {
    if (movingPiece.color === 'w') {
      next.wK = false;
      next.wQ = false;
    } else {
      next.bK = false;
      next.bQ = false;
    }
  }

  if (movingPiece.type === 'r') {
    if (move.from.r === 7 && move.from.c === 0) next.wQ = false;
    if (move.from.r === 7 && move.from.c === 7) next.wK = false;
    if (move.from.r === 0 && move.from.c === 0) next.bQ = false;
    if (move.from.r === 0 && move.from.c === 7) next.bK = false;
  }

  // If a rook on its home corner was captured
  if (move.to.r === 7 && move.to.c === 0) next.wQ = false;
  if (move.to.r === 7 && move.to.c === 7) next.wK = false;
  if (move.to.r === 0 && move.to.c === 0) next.bQ = false;
  if (move.to.r === 0 && move.to.c === 7) next.bK = false;

  return next;
}

export function applyMove(
  state: ChessState,
  move: ChessMove
): { nextState: ChessState; record: MoveRecord } {
  const movingPiece = state.board[move.from.r][move.from.c];
  if (!movingPiece) {
    throw new Error('No piece on source square');
  }

  const allLegalPrevMoves = getLegalMoves(state);
  const capturedPiece: Piece | null = move.isEnPassant
    ? state.board[move.from.r][move.to.c]
    : state.board[move.to.r][move.to.c];

  const nextBoard = executeMoveOnBoard(state.board, move);
  const nextTurn = oppositeColor(state.turn);
  const nextCastling = updateCastlingRights(state.castling, move, movingPiece);

  let nextEp: Square | null = null;
  if (movingPiece.type === 'p' && Math.abs(move.to.r - move.from.r) === 2) {
    nextEp = {
      r: (move.from.r + move.to.r) / 2,
      c: move.from.c
    };
  }

  const nextHalfmove =
    movingPiece.type === 'p' || Boolean(capturedPiece) ? 0 : state.halfmoveClock + 1;
  const nextFullmove = state.turn === 'b' ? state.fullmoveNumber + 1 : state.fullmoveNumber;

  const posKey = getPositionKey(nextBoard, nextTurn, nextCastling, nextEp);
  const nextPositionCounts = {
    ...state.positionCounts,
    [posKey]: (state.positionCounts[posKey] || 0) + 1
  };

  const inCheck = isKingInCheck(nextBoard, nextTurn);
  const opponentMoves = getLegalMovesForBoard(nextBoard, nextTurn, nextCastling, nextEp);

  let status: GameStatus = inCheck ? 'check' : 'playing';
  let winner: PieceColor | 'draw' | null = null;

  if (opponentMoves.length === 0) {
    if (inCheck) {
      status = 'checkmate';
      winner = state.turn;
    } else {
      status = 'stalemate';
      winner = 'draw';
    }
  } else if (nextPositionCounts[posKey] >= 3) {
    status = 'draw_repetition';
    winner = 'draw';
  } else if (nextHalfmove >= 100) {
    status = 'draw_fifty_move';
    winner = 'draw';
  } else if (hasInsufficientMaterial(nextBoard)) {
    status = 'draw_insufficient_material';
    winner = 'draw';
  }

  const san = buildSan(
    state,
    move,
    allLegalPrevMoves,
    inCheck,
    status === 'checkmate'
  );

  const nextState: ChessState = {
    board: nextBoard,
    turn: nextTurn,
    castling: nextCastling,
    enPassantTarget: nextEp,
    halfmoveClock: nextHalfmove,
    fullmoveNumber: nextFullmove,
    positionCounts: nextPositionCounts,
    lastMove: move,
    status,
    winner,
    inCheckColor: inCheck ? nextTurn : null
  };

  const record: MoveRecord = {
    san,
    move,
    color: state.turn,
    moveNumber: state.fullmoveNumber,
    captured: capturedPiece
  };

  return { nextState, record };
}

export function computeMaterialAndCaptures(history: MoveRecord[], board: (Piece | null)[][]) {
  const values: Record<PieceType, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0
  };

  let whiteMaterial = 0;
  let blackMaterial = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (p.color === 'w') whiteMaterial += values[p.type];
      else blackMaterial += values[p.type];
    }
  }

  const capturedByWhite: Piece[] = [];
  const capturedByBlack: Piece[] = [];
  for (const item of history) {
    if (item.captured) {
      if (item.color === 'w') capturedByWhite.push(item.captured);
      else capturedByBlack.push(item.captured);
    }
  }

  const sortOrder: Record<PieceType, number> = { q: 0, r: 1, b: 2, n: 3, p: 4, k: 5 };
  capturedByWhite.sort((a, b) => sortOrder[a.type] - sortOrder[b.type]);
  capturedByBlack.sort((a, b) => sortOrder[a.type] - sortOrder[b.type]);

  return {
    whiteAdvantage: Math.max(0, whiteMaterial - blackMaterial),
    blackAdvantage: Math.max(0, blackMaterial - whiteMaterial),
    capturedByWhite,
    capturedByBlack
  };
}

// ================================
// Chess AI Engine (Minimax + Alpha-Beta + Quiescence + PST)
// ================================

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Piece-square tables (from White's perspective, row 0 = rank 8)
const PAWN_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 27, 27, 10,  5,  5],
  [0,  0,  0, 24, 24,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-22,-22, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 12, 16, 16, 12,  0,-30],
  [-30,  5, 16, 22, 22, 16,  5,-30],
  [-30,  0, 16, 22, 22, 16,  0,-30],
  [-30,  5, 12, 16, 16, 12,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  8, 12, 12,  8,  0,-10],
  [-10,  6,  6, 12, 12,  6,  6,-10],
  [-10,  0, 12, 12, 12, 12,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  6,  0,  0,  0,  0,  6,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [8, 12, 12, 12, 12, 12, 12,  8],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  6,  6,  0,  0,  0]
];

const QUEEN_PST = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,   0,  5,  5,  5,  5,  0, -5],
  [0,    0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MID_PST = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20,  20,  0,  0,  0,  0, 20, 20],
  [20,  30, 10,  0,  0, 10, 30, 20]
];

const KING_END_PST = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

export function getPremoveTargets(
  board: (Piece | null)[][],
  from: Square,
  color: PieceColor
): Square[] {
  const piece = board[from.r][from.c];
  if (!piece || piece.color !== color) return [];

  const targets: Square[] = [];
  const push = (r: number, c: number) => {
    if (r >= 0 && r < 8 && c >= 0 && c < 8 && (r !== from.r || c !== from.c)) {
      targets.push({ r, c });
    }
  };

  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    push(from.r + dir, from.c);
    if (from.r === startRow) {
      push(from.r + dir * 2, from.c);
    }
    push(from.r + dir, from.c - 1);
    push(from.r + dir, from.c + 1);
  } else if (piece.type === 'n') {
    for (const [dr, dc] of KNIGHT_DELTAS) {
      push(from.r + dr, from.c + dc);
    }
  } else if (piece.type === 'k') {
    for (const [dr, dc] of KING_DELTAS) {
      push(from.r + dr, from.c + dc);
    }
    const homeRow = color === 'w' ? 7 : 0;
    if (from.r === homeRow && from.c === 4) {
      push(homeRow, 6);
      push(homeRow, 2);
    }
  } else {
    const dirs =
      piece.type === 'b'
        ? BISHOP_DIRS
        : piece.type === 'r'
        ? ROOK_DIRS
        : [...BISHOP_DIRS, ...ROOK_DIRS];
    for (const [dr, dc] of dirs) {
      let nr = from.r + dr;
      let nc = from.c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        push(nr, nc);
        nr += dr;
        nc += dc;
      }
    }
  }

  return targets;
}

const PASSED_PAWN_BONUS = [0, 14, 24, 38, 60, 92, 135, 0];

function evaluateBoard(board: (Piece | null)[][], aggressionBias = 0): number {
  let score = 0;
  let nonKingMaterial = 0;
  let wBishops = 0;
  let bBishops = 0;
  let wMinorUndeveloped = 0;
  let bMinorUndeveloped = 0;
  let wHasQueen = false;
  let bHasQueen = false;
  const wPawnsOnFile = [0, 0, 0, 0, 0, 0, 0, 0];
  const bPawnsOnFile = [0, 0, 0, 0, 0, 0, 0, 0];
  const wPawnRows: number[] = [];
  const bPawnRows: number[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.type === 'k') continue;
      nonKingMaterial += PIECE_VALUES[p.type];
      if (p.type === 'p') {
        if (p.color === 'w') {
          wPawnsOnFile[c]++;
          wPawnRows.push(r * 8 + c);
        } else {
          bPawnsOnFile[c]++;
          bPawnRows.push(r * 8 + c);
        }
      } else if (p.type === 'b') {
        if (p.color === 'w') wBishops++;
        else bBishops++;
      } else if (p.type === 'q') {
        if (p.color === 'w') wHasQueen = true;
        else bHasQueen = true;
      }
      if (p.type === 'n' || p.type === 'b') {
        if (p.color === 'w' && r === 7) wMinorUndeveloped++;
        if (p.color === 'b' && r === 0) bMinorUndeveloped++;
      }
    }
  }

  const isEndgame = nonKingMaterial <= 2600;
  const isOpeningPhase = nonKingMaterial >= 5200;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const pstR = p.color === 'w' ? r : 7 - r;
      let pstBonus = 0;

      switch (p.type) {
        case 'p':
          pstBonus = PAWN_PST[pstR][c];
          if (p.color === 'w' && wPawnsOnFile[c] > 1) pstBonus -= 10;
          if (p.color === 'b' && bPawnsOnFile[c] > 1) pstBonus -= 10;
          break;
        case 'n':
          pstBonus = KNIGHT_PST[pstR][c];
          break;
        case 'b':
          pstBonus = BISHOP_PST[pstR][c];
          break;
        case 'r':
          pstBonus = ROOK_PST[pstR][c];
          if (p.color === 'w') {
            if (wPawnsOnFile[c] === 0) {
              pstBonus += bPawnsOnFile[c] === 0 ? 18 : 10;
            }
            if (r === 1) pstBonus += 20;
          } else {
            if (bPawnsOnFile[c] === 0) {
              pstBonus += wPawnsOnFile[c] === 0 ? 18 : 10;
            }
            if (r === 6) pstBonus += 20;
          }
          break;
        case 'q':
          pstBonus = QUEEN_PST[pstR][c];
          if (isOpeningPhase) {
            const minorsBack = p.color === 'w' ? wMinorUndeveloped : bMinorUndeveloped;
            const homeRank = p.color === 'w' ? 7 : 0;
            if (minorsBack >= 2 && Math.abs(r - homeRank) >= 2) {
              pstBonus -= 22;
            }
          }
          break;
        case 'k':
          pstBonus = isEndgame ? KING_END_PST[pstR][c] : KING_MID_PST[pstR][c];
          if (!isEndgame) {
            const enemyHasQueen = p.color === 'w' ? bHasQueen : wHasQueen;
            const homeRank = p.color === 'w' ? 7 : 0;
            if (enemyHasQueen && r === homeRank && c >= 3 && c <= 5) {
              pstBonus -= 18;
            }
            // Pawn shield bonus for castled king
            if (r === homeRank && (c <= 2 || c >= 6)) {
              const shieldRow = p.color === 'w' ? 6 : 1;
              for (let sc = Math.max(0, c - 1); sc <= Math.min(7, c + 1); sc++) {
                const sp = board[shieldRow][sc];
                if (sp && sp.color === p.color && sp.type === 'p') {
                  pstBonus += 9;
                }
              }
            }
          }
          break;
      }

      // Style aggression: reward pieces advanced into enemy half
      let advanceBonus = 0;
      if (aggressionBias !== 0 && p.type !== 'k') {
        const enemyHalfDepth = p.color === 'w' ? Math.max(0, 4 - r) : Math.max(0, r - 3);
        advanceBonus = Math.round(enemyHalfDepth * aggressionBias);
      }

      const val = PIECE_VALUES[p.type] + pstBonus + advanceBonus;
      score += p.color === 'w' ? val : -val;
    }
  }

  // Passed pawn bonus
  for (const sq of wPawnRows) {
    const r = Math.floor(sq / 8);
    const c = sq % 8;
    let passed = true;
    for (const bsq of bPawnRows) {
      const br = Math.floor(bsq / 8);
      const bc = bsq % 8;
      if (Math.abs(bc - c) <= 1 && br < r) {
        passed = false;
        break;
      }
    }
    if (passed) {
      score += PASSED_PAWN_BONUS[7 - r] || 0;
    }
  }
  for (const sq of bPawnRows) {
    const r = Math.floor(sq / 8);
    const c = sq % 8;
    let passed = true;
    for (const wsq of wPawnRows) {
      const wr = Math.floor(wsq / 8);
      const wc = wsq % 8;
      if (Math.abs(wc - c) <= 1 && wr > r) {
        passed = false;
        break;
      }
    }
    if (passed) {
      score -= PASSED_PAWN_BONUS[r] || 0;
    }
  }

  if (wBishops >= 2) score += 35;
  if (bBishops >= 2) score -= 35;

  if (isOpeningPhase) {
    score -= wMinorUndeveloped * 10;
    score += bMinorUndeveloped * 10;
  }

  return score;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sameMove(a?: ChessMove | null, b?: ChessMove | null): boolean {
  if (!a || !b) return false;
  return (
    a.from.r === b.from.r &&
    a.from.c === b.from.c &&
    a.to.r === b.to.r &&
    a.to.c === b.to.c &&
    a.promotion === b.promotion
  );
}

function scoreMoveForOrdering(
  board: (Piece | null)[][],
  move: ChessMove,
  killer1?: ChessMove | null,
  killer2?: ChessMove | null
): number {
  let score = 0;
  const attacker = board[move.from.r][move.from.c];
  const victim = move.isEnPassant
    ? ({ color: oppositeColor(attacker?.color || 'w'), type: 'p' } as Piece)
    : board[move.to.r][move.to.c];

  if (victim && attacker) {
    // MVV-LVA
    score += 100000 + PIECE_VALUES[victim.type] * 10 - PIECE_VALUES[attacker.type];
  }
  if (move.promotion) {
    score += 80000 + PIECE_VALUES[move.promotion];
  }
  if (!victim && sameMove(move, killer1)) {
    score += 65000;
  } else if (!victim && sameMove(move, killer2)) {
    score += 60000;
  }
  if (move.isCastle) {
    score += 75;
  }
  // Slight center preference
  const centerDist = Math.abs(3.5 - move.to.r) + Math.abs(3.5 - move.to.c);
  score += Math.round((7 - centerDist) * 4);
  return score;
}

function orderMoves(
  board: (Piece | null)[][],
  moves: ChessMove[],
  bestMove?: ChessMove | null,
  killer1?: ChessMove | null,
  killer2?: ChessMove | null
): ChessMove[] {
  return [...moves].sort((a, b) => {
    if (bestMove) {
      if (sameMove(a, bestMove)) return -1;
      if (sameMove(b, bestMove)) return 1;
    }
    return (
      scoreMoveForOrdering(board, b, killer1, killer2) -
      scoreMoveForOrdering(board, a, killer1, killer2)
    );
  });
}

interface TTEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lower' | 'upper';
  bestMove?: ChessMove;
}

interface SearchContext {
  deadline: number;
  nodes: number;
  aborted: boolean;
  aggressionBias: number;
  tt: Map<string, TTEntry> | null;
  killers: [ChessMove | null, ChessMove | null][];
  allowCheckExtension: boolean;
}

function toTTScore(score: number, ply: number): number {
  if (score > 40000) return score + ply;
  if (score < -40000) return score - ply;
  return score;
}

function fromTTScore(score: number, ply: number): number {
  if (score > 40000) return score - ply;
  if (score < -40000) return score + ply;
  return score;
}

function recordKiller(ctx: SearchContext, ply: number, move: ChessMove) {
  if (ply < 0 || ply >= ctx.killers.length || move.isCapture || move.promotion) return;
  const slot = ctx.killers[ply];
  if (!sameMove(slot[0], move)) {
    slot[1] = slot[0];
    slot[0] = move;
  }
}

function quiescence(
  board: (Piece | null)[][],
  turn: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Square | null,
  alpha: number,
  beta: number,
  qDepth: number,
  ctx: SearchContext
): number {
  ctx.nodes++;
  if ((ctx.nodes & 255) === 0 && Date.now() > ctx.deadline) {
    ctx.aborted = true;
    return 0;
  }

  const rawEval = evaluateBoard(board, ctx.aggressionBias);
  const standPat = turn === 'w' ? rawEval : -rawEval;

  if (qDepth <= 0) return standPat;
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  const moves = getLegalMovesForBoard(board, turn, castling, enPassantTarget);
  const captures = orderMoves(
    board,
    moves.filter(m => m.isCapture || m.promotion)
  );

  for (const move of captures) {
    const nextBoard = executeMoveOnBoard(board, move);
    const score = -quiescence(
      nextBoard,
      oppositeColor(turn),
      castling,
      null,
      -beta,
      -alpha,
      qDepth - 1,
      ctx
    );
    if (ctx.aborted) return 0;
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

function negamax(
  board: (Piece | null)[][],
  turn: PieceColor,
  castling: CastlingRights,
  enPassantTarget: Square | null,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  quiescenceDepth: number,
  ctx: SearchContext
): number {
  ctx.nodes++;
  if ((ctx.nodes & 255) === 0 && Date.now() > ctx.deadline) {
    ctx.aborted = true;
    return 0;
  }

  const origAlpha = alpha;
  const ttKey = ctx.tt ? getPositionKey(board, turn, castling, enPassantTarget) : '';
  let ttBestMove: ChessMove | undefined;

  if (ctx.tt && ttKey) {
    const entry = ctx.tt.get(ttKey);
    if (entry) {
      ttBestMove = entry.bestMove;
      if (entry.depth >= depth) {
        const cachedScore = fromTTScore(entry.score, ply);
        if (entry.flag === 'exact') return cachedScore;
        if (entry.flag === 'lower' && cachedScore > alpha) alpha = cachedScore;
        else if (entry.flag === 'upper' && cachedScore < beta) beta = cachedScore;
        if (alpha >= beta) return cachedScore;
      }
    }
  }

  const moves = getLegalMovesForBoard(board, turn, castling, enPassantTarget);
  const inCheck = isKingInCheck(board, turn);

  if (moves.length === 0) {
    if (inCheck) {
      return -50000 + ply;
    }
    return 0;
  }

  // Check extension for apex/deep search so tactical mates are never missed on the horizon
  const effectiveDepth =
    ctx.allowCheckExtension && inCheck && depth === 0 && ply < 8 ? 1 : depth;

  if (effectiveDepth <= 0) {
    if (quiescenceDepth > 0) {
      return quiescence(board, turn, castling, enPassantTarget, alpha, beta, quiescenceDepth, ctx);
    }
    const rawEval = evaluateBoard(board, ctx.aggressionBias);
    return turn === 'w' ? rawEval : -rawEval;
  }

  const kPair = ply < ctx.killers.length ? ctx.killers[ply] : [null, null];
  const ordered = orderMoves(board, moves, ttBestMove, kPair[0], kPair[1]);

  let bestScore = -Infinity;
  let bestMove: ChessMove | undefined = ordered[0];

  for (const move of ordered) {
    const movingPiece = board[move.from.r][move.from.c];
    if (!movingPiece) continue;
    const nextBoard = executeMoveOnBoard(board, move);
    const nextCastling = updateCastlingRights(castling, move, movingPiece);
    const nextEp =
      movingPiece.type === 'p' && Math.abs(move.to.r - move.from.r) === 2
        ? { r: (move.from.r + move.to.r) / 2, c: move.from.c }
        : null;

    const score = -negamax(
      nextBoard,
      oppositeColor(turn),
      nextCastling,
      nextEp,
      effectiveDepth - 1,
      ply + 1,
      -beta,
      -alpha,
      quiescenceDepth,
      ctx
    );

    if (ctx.aborted) return 0;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    if (score > alpha) {
      alpha = score;
    }
    if (alpha >= beta) {
      recordKiller(ctx, ply, move);
      break;
    }
  }

  if (ctx.tt && ttKey && !ctx.aborted && ctx.tt.size < 45000) {
    let flag: TTEntry['flag'] = 'exact';
    if (bestScore <= origAlpha) flag = 'upper';
    else if (bestScore >= beta) flag = 'lower';
    ctx.tt.set(ttKey, {
      depth: effectiveDepth,
      score: toTTScore(bestScore, ply),
      flag,
      bestMove
    });
  }

  return bestScore;
}

export function evaluatePositionForSide(board: (Piece | null)[][], side: PieceColor): number {
  const raw = evaluateBoard(board, 0);
  return side === 'w' ? raw : -raw;
}

function pickVariedMoveFromScored(
  scored: { move: ChessMove; score: number }[],
  varietyWindow: number
): ChessMove {
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const best = sorted[0];

  // Always execute immediate forced checkmate or strict apex top-move without random deviations
  if (best.score > 40000 || varietyWindow <= 0 || sorted.length === 1) {
    return best.move;
  }

  const threshold = best.score - varietyWindow;
  const pool = sorted.filter(item => item.score >= threshold);
  if (pool.length <= 1) {
    return best.move;
  }

  // Weight candidates so top moves remain preferred while strong alternatives appear frequently
  const temp = Math.max(12, varietyWindow * 0.65);
  const weights = pool.map(item => Math.exp((item.score - best.score) / temp));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let roll = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      return pool[i].move;
    }
  }
  return pool[0].move;
}

export function chooseAIMove(
  state: ChessState,
  difficulty: AIDifficulty,
  timeBudgetMs = 950,
  options?: {
    aggressionBias?: number;
    jitter?: number;
    varietyWindow?: number;
    apexMode?: boolean;
  }
): ChessMove | null {
  const rawLegalMoves = getLegalMoves(state);
  if (rawLegalMoves.length === 0) return null;
  if (rawLegalMoves.length === 1) return rawLegalMoves[0];

  const isApex = Boolean(options?.apexMode);
  const legalMoves = isApex ? orderMoves(state.board, rawLegalMoves) : fisherYatesShuffle(rawLegalMoves);

  const turn = state.turn;
  const aggressionBias = options?.aggressionBias ?? 0;
  const ctx: SearchContext = {
    deadline: Date.now() + timeBudgetMs,
    nodes: 0,
    aborted: false,
    aggressionBias,
    tt: difficulty === 'hard' || difficulty === 'expert' || isApex ? new Map() : null,
    killers: Array.from({ length: 16 }, () => [null, null] as [ChessMove | null, ChessMove | null]),
    allowCheckExtension: isApex || difficulty === 'expert'
  };

  if (difficulty === 'easy') {
    const jitterScale = options?.jitter ?? 180;
    const varietyWindow = options?.varietyWindow ?? 110;
    const scored = legalMoves.map(move => {
      const next = applyMove(state, move).nextState;
      if (next.status === 'checkmate') {
        return { move, score: 50000 };
      }
      const quickScore = -quiescence(
        next.board,
        next.turn,
        next.castling,
        next.enPassantTarget,
        -60000,
        60000,
        1,
        ctx
      );
      let perspective = Number.isFinite(quickScore)
        ? quickScore
        : turn === 'w'
        ? evaluateBoard(next.board, aggressionBias)
        : -evaluateBoard(next.board, aggressionBias);
      if (next.inCheckColor && aggressionBias > 0) perspective += aggressionBias * 4;
      const noise = (Math.random() - 0.5) * jitterScale;
      return { move, score: perspective + noise };
    });
    return pickVariedMoveFromScored(scored, varietyWindow);
  }

  const maxDepth = isApex ? 6 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4;
  const qDepth = isApex ? 5 : difficulty === 'medium' ? 3 : difficulty === 'hard' ? 3 : 4;
  const defaultWindow = isApex ? 0 : difficulty === 'medium' ? 40 : difficulty === 'hard' ? 22 : 14;
  const varietyWindow = isApex ? 0 : (options?.varietyWindow ?? defaultWindow);

  let globalBestMove: ChessMove = legalMoves[0];
  let bestCompletedScores: { move: ChessMove; score: number }[] = legalMoves.map(m => ({ move: m, score: 0 }));

  // Iterative deepening up to maxDepth
  for (let depth = 1; depth <= maxDepth; depth++) {
    ctx.aborted = false;
    const orderedRoot =
      depth === 1 ? legalMoves : orderMoves(state.board, legalMoves, globalBestMove);
    let bestAtDepth = orderedRoot[0];
    let bestScoreAtDepth = -Infinity;
    const scoresAtDepth: { move: ChessMove; score: number }[] = [];

    for (const move of orderedRoot) {
      const movingPiece = state.board[move.from.r][move.from.c];
      if (!movingPiece) continue;

      const { nextState } = applyMove(state, move);
      let score: number;

      if (nextState.status === 'checkmate') {
        score = 50000;
      } else if (nextState.winner === 'draw') {
        const curRaw = evaluateBoard(state.board, aggressionBias);
        const curPerspective = turn === 'w' ? curRaw : -curRaw;
        score = curPerspective > 50 ? -150 : 50;
      } else {
        const searchAlpha =
          bestScoreAtDepth > -Infinity
            ? varietyWindow > 0
              ? bestScoreAtDepth - varietyWindow - 40
              : bestScoreAtDepth
            : -Infinity;
        score = -negamax(
          nextState.board,
          nextState.turn,
          nextState.castling,
          nextState.enPassantTarget,
          depth - 1,
          1,
          -Infinity,
          searchAlpha === -Infinity ? Infinity : -searchAlpha,
          qDepth,
          ctx
        );
      }

      if (ctx.aborted) break;

      if (aggressionBias > 0 && nextState.inCheckColor) {
        score += aggressionBias * 3;
      } else if (aggressionBias < 0 && move.isCastle) {
        score += Math.abs(aggressionBias) * 4;
      }

      const jitter = isApex ? 0 : (options?.jitter ?? (difficulty === 'medium' ? 18 : 4));
      if (jitter > 0) {
        score += (Math.random() - 0.5) * jitter;
      }

      scoresAtDepth.push({ move, score });

      if (score > bestScoreAtDepth) {
        bestScoreAtDepth = score;
        bestAtDepth = move;
      }
    }

    if (!ctx.aborted && scoresAtDepth.length === orderedRoot.length) {
      globalBestMove = bestAtDepth;
      bestCompletedScores = scoresAtDepth;
      if (bestScoreAtDepth > 45000) break; // Forced mate found
    } else {
      break;
    }
  }

  return isApex ? globalBestMove : pickVariedMoveFromScored(bestCompletedScores, varietyWindow);
}

function stripSanSuffix(san: string): string {
  return san.replace(/[+#!?]+$/g, '');
}

export interface BotMoveDecision {
  move: ChessMove | null;
  openingName: string | null;
  usedBook: boolean;
}

function findMatchingBookCandidates(
  lines: OpeningBookLine[],
  turn: PieceColor,
  playedSans: string[]
): { lineName: string; targetSan: string }[] {
  const candidates: { lineName: string; targetSan: string }[] = [];

  for (const line of lines) {
    if (line.color !== turn) continue;
    if (line.moves.length <= playedSans.length) continue;

    let prefixMatches = true;
    for (let i = 0; i < playedSans.length; i++) {
      if (stripSanSuffix(line.moves[i]) !== playedSans[i]) {
        prefixMatches = false;
        break;
      }
    }
    if (prefixMatches) {
      candidates.push({
        lineName: line.name,
        targetSan: stripSanSuffix(line.moves[playedSans.length])
      });
    }
  }

  return candidates;
}

export interface AnalysisLine {
  move: ChessMove;
  san: string;
  scoreCp: number; // Always from White's POV (+ = White advantage, - = Black advantage)
  mateIn: number | null; // Positive = White mates in N moves, Negative = Black mates in N moves
}

export interface PositionAnalysis {
  scoreCp: number; // White's POV
  mateIn: number | null;
  bestMove: ChessMove | null;
  bestSan: string | null;
  lines: AnalysisLine[];
  depth: number;
}

export type MoveQuality =
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

function extractMatePlies(rawScoreFromMover: number): number | null {
  if (rawScoreFromMover > 40000) {
    return Math.max(1, 50000 - rawScoreFromMover);
  }
  if (rawScoreFromMover < -40000) {
    return -Math.max(1, 50000 + rawScoreFromMover);
  }
  return null;
}

export function analyzePosition(
  state: ChessState,
  timeBudgetMs = 220
): PositionAnalysis {
  if (state.status === 'checkmate') {
    const whiteWins = state.winner === 'w';
    return {
      scoreCp: whiteWins ? 50000 : -50000,
      mateIn: whiteWins ? 0 : 0,
      bestMove: null,
      bestSan: null,
      lines: [],
      depth: 0
    };
  }

  if (
    state.status === 'stalemate' ||
    state.status === 'draw_repetition' ||
    state.status === 'draw_fifty_move' ||
    state.status === 'draw_insufficient_material'
  ) {
    return {
      scoreCp: 0,
      mateIn: null,
      bestMove: null,
      bestSan: null,
      lines: [],
      depth: 0
    };
  }

  const legalMoves = orderMoves(state.board, getLegalMoves(state));
  if (legalMoves.length === 0) {
    return {
      scoreCp: 0,
      mateIn: null,
      bestMove: null,
      bestSan: null,
      lines: [],
      depth: 0
    };
  }

  const turn = state.turn;
  const ctx: SearchContext = {
    deadline: Date.now() + timeBudgetMs,
    nodes: 0,
    aborted: false,
    aggressionBias: 0,
    tt: new Map(),
    killers: Array.from({ length: 16 }, () => [null, null] as [ChessMove | null, ChessMove | null]),
    allowCheckExtension: true
  };

  let completedDepth = 0;
  let lastOrdered = legalMoves;
  let completedResults: { move: ChessMove; san: string; moverScore: number }[] = [];

  for (let depth = 1; depth <= 4; depth++) {
    ctx.aborted = false;
    const depthResults: { move: ChessMove; san: string; moverScore: number }[] = [];

    for (const move of lastOrdered) {
      const { nextState, record } = applyMove(state, move);
      let moverScore: number;

      if (nextState.status === 'checkmate') {
        moverScore = 49999; // Mate in 1 move (1 ply)
      } else if (nextState.winner === 'draw') {
        moverScore = 0;
      } else {
        moverScore = -negamax(
          nextState.board,
          nextState.turn,
          nextState.castling,
          nextState.enPassantTarget,
          depth - 1,
          1,
          -Infinity,
          Infinity,
          3,
          ctx
        );
      }

      if (ctx.aborted) break;
      depthResults.push({ move, san: record.san, moverScore });
    }

    if (!ctx.aborted && depthResults.length === lastOrdered.length) {
      depthResults.sort((a, b) => b.moverScore - a.moverScore);
      completedResults = depthResults;
      lastOrdered = depthResults.map(r => r.move);
      completedDepth = depth;
      if (depthResults[0] && depthResults[0].moverScore > 45000 && depth >= 2) {
        break;
      }
    } else {
      break;
    }
  }

  if (completedResults.length === 0) {
    // Immediate depth-1 fallback if budget expired mid-loop
    completedResults = legalMoves.map(move => {
      const { nextState, record } = applyMove(state, move);
      const rawWhite =
        nextState.status === 'checkmate'
          ? turn === 'w'
            ? 49999
            : -49999
          : nextState.winner === 'draw'
          ? 0
          : evaluateBoard(nextState.board, 0);
      const moverScore = turn === 'w' ? rawWhite : -rawWhite;
      return { move, san: record.san, moverScore };
    });
    completedResults.sort((a, b) => b.moverScore - a.moverScore);
    completedDepth = 1;
  }

  const lines: AnalysisLine[] = completedResults.slice(0, 3).map(item => {
    const whiteCp = turn === 'w' ? item.moverScore : -item.moverScore;
    const pliesFromMover = extractMatePlies(item.moverScore);
    let mateIn: number | null = null;
    if (pliesFromMover !== null) {
      const fullMoves = Math.ceil(Math.abs(pliesFromMover) / 2);
      const whiteMates =
        (turn === 'w' && pliesFromMover > 0) ||
        (turn === 'b' && pliesFromMover < 0);
      mateIn = whiteMates ? fullMoves : -fullMoves;
    }
    return {
      move: item.move,
      san: item.san,
      scoreCp: whiteCp,
      mateIn
    };
  });

  const top = lines[0];
  return {
    scoreCp: top ? top.scoreCp : 0,
    mateIn: top ? top.mateIn : null,
    bestMove: top ? top.move : null,
    bestSan: top ? top.san : null,
    lines,
    depth: completedDepth
  };
}

export function classifyMoveQuality(
  bestCpForMover: number,
  playedCpForMover: number,
  isBestMove: boolean
): MoveQuality {
  if (isBestMove) return 'best';
  const clampedBest = Math.max(-1500, Math.min(1500, bestCpForMover));
  const clampedPlayed = Math.max(-1500, Math.min(1500, playedCpForMover));
  const cpLoss = Math.max(0, clampedBest - clampedPlayed);

  if (cpLoss <= 15) return 'best';
  if (cpLoss <= 45) return 'excellent';
  if (cpLoss <= 95) return 'good';
  if (cpLoss <= 190) return 'inaccuracy';
  if (cpLoss <= 360) return 'mistake';
  return 'blunder';
}

export function chooseBotMove(
  state: ChessState,
  bot: ChessBot,
  history: MoveRecord[] = [],
  remainingClockMs?: number
): BotMoveDecision {
  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) {
    return { move: null, openingName: null, usedBook: false };
  }

  const playedSans = history.map(h => stripSanSuffix(h.san));

  // 1. Check bot's personal multi-branch opening lines first
  let candidates = findMatchingBookCandidates(bot.openingLines, state.turn, playedSans);

  // 2. If player stepped outside bot's signature book, check broad defensive/counter repertoire (for effective rating >= 900)
  const effectiveRating = bot.secretRating ?? bot.rating;
  if (candidates.length === 0 && effectiveRating >= 900 && playedSans.length > 0 && playedSans.length <= 8) {
    candidates = findMatchingBookCandidates(UNIVERSAL_DEFENSE_LINES, state.turn, playedSans);
  }

  if (candidates.length > 0) {
    // Shuffle candidate book lines so bots vary between multiple openings from game to game
    const shuffled = fisherYatesShuffle(candidates);
    for (const picked of shuffled) {
      for (const legal of legalMoves) {
        const { record } = applyMove(state, legal);
        if (stripSanSuffix(record.san) === picked.targetSan) {
          return {
            move: legal,
            openingName: picked.lineName,
            usedBook: true
          };
        }
      }
    }
  }

  const budgetMs =
    typeof remainingClockMs === 'number' && remainingClockMs > 0
      ? Math.min(bot.timeBudgetMs, Math.max(80, Math.floor(remainingClockMs * 0.12)))
      : bot.timeBudgetMs;

  const aiMove = chooseAIMove(state, bot.difficulty, budgetMs, {
    aggressionBias: bot.aggressionBias,
    jitter: bot.jitter,
    varietyWindow: bot.varietyWindow,
    apexMode: bot.apexMode
  });

  return {
    move: aiMove,
    openingName: null,
    usedBook: false
  };
}
