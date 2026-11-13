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

function evaluateBoard(board: (Piece | null)[][]): number {
  let score = 0;
  let nonKingMaterial = 0;
  let wBishops = 0;
  let bBishops = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.type === 'k') continue;
      nonKingMaterial += PIECE_VALUES[p.type];
      if (p.type === 'b') {
        if (p.color === 'w') wBishops++;
        else bBishops++;
      }
    }
  }

  const isEndgame = nonKingMaterial <= 2600;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const pstR = p.color === 'w' ? r : 7 - r;
      let pstBonus = 0;

      switch (p.type) {
        case 'p':
          pstBonus = PAWN_PST[pstR][c];
          break;
        case 'n':
          pstBonus = KNIGHT_PST[pstR][c];
          break;
        case 'b':
          pstBonus = BISHOP_PST[pstR][c];
          break;
        case 'r':
          pstBonus = ROOK_PST[pstR][c];
          break;
        case 'q':
          pstBonus = QUEEN_PST[pstR][c];
          break;
        case 'k':
          pstBonus = isEndgame ? KING_END_PST[pstR][c] : KING_MID_PST[pstR][c];
          break;
      }

      const val = PIECE_VALUES[p.type] + pstBonus;
      score += p.color === 'w' ? val : -val;
    }
  }

  if (wBishops >= 2) score += 35;
  if (bBishops >= 2) score -= 35;

  return score;
}

function scoreMoveForOrdering(board: (Piece | null)[][], move: ChessMove): number {
  let score = 0;
  const attacker = board[move.from.r][move.from.c];
  const victim = move.isEnPassant
    ? ({ color: oppositeColor(attacker?.color || 'w'), type: 'p' } as Piece)
    : board[move.to.r][move.to.c];

  if (victim && attacker) {
    // MVV-LVA
    score += 10000 + PIECE_VALUES[victim.type] * 10 - PIECE_VALUES[attacker.type];
  }
  if (move.promotion) {
    score += 8000 + PIECE_VALUES[move.promotion];
  }
  if (move.isCastle) {
    score += 65;
  }
  // Slight center preference
  const centerDist = Math.abs(3.5 - move.to.r) + Math.abs(3.5 - move.to.c);
  score += Math.round((7 - centerDist) * 4);
  return score;
}

function orderMoves(board: (Piece | null)[][], moves: ChessMove[], bestMove?: ChessMove | null): ChessMove[] {
  return [...moves].sort((a, b) => {
    if (bestMove) {
      const aMatch =
        a.from.r === bestMove.from.r &&
        a.from.c === bestMove.from.c &&
        a.to.r === bestMove.to.r &&
        a.to.c === bestMove.to.c &&
        a.promotion === bestMove.promotion;
      if (aMatch) return -1;
      const bMatch =
        b.from.r === bestMove.from.r &&
        b.from.c === bestMove.from.c &&
        b.to.r === bestMove.to.r &&
        b.to.c === bestMove.to.c &&
        b.promotion === bestMove.promotion;
      if (bMatch) return 1;
    }
    return scoreMoveForOrdering(board, b) - scoreMoveForOrdering(board, a);
  });
}

interface SearchContext {
  deadline: number;
  nodes: number;
  aborted: boolean;
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

  const rawEval = evaluateBoard(board);
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

  const moves = getLegalMovesForBoard(board, turn, castling, enPassantTarget);
  if (moves.length === 0) {
    if (isKingInCheck(board, turn)) {
      return -50000 + ply; // Prefer faster checkmate
    }
    return 0; // Stalemate
  }

  if (depth <= 0) {
    if (quiescenceDepth > 0) {
      return quiescence(board, turn, castling, enPassantTarget, alpha, beta, quiescenceDepth, ctx);
    }
    const rawEval = evaluateBoard(board);
    return turn === 'w' ? rawEval : -rawEval;
  }

  const ordered = orderMoves(board, moves);
  let bestScore = -Infinity;

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
      depth - 1,
      ply + 1,
      -beta,
      -alpha,
      quiescenceDepth,
      ctx
    );

    if (ctx.aborted) return 0;

    if (score > bestScore) {
      bestScore = score;
    }
    if (score > alpha) {
      alpha = score;
    }
    if (alpha >= beta) {
      break;
    }
  }

  return bestScore;
}

export function chooseAIMove(
  state: ChessState,
  difficulty: AIDifficulty,
  timeBudgetMs = 950
): ChessMove | null {
  const legalMoves = getLegalMoves(state);
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  const turn = state.turn;
  const ctx: SearchContext = {
    deadline: Date.now() + timeBudgetMs,
    nodes: 0,
    aborted: false
  };

  if (difficulty === 'easy') {
    // Evaluate 1-ply with noticeable jitter and occasional casual suboptimal pick
    const scored = legalMoves.map(move => {
      const next = applyMove(state, move).nextState;
      if (next.status === 'checkmate') {
        return { move, score: 50000 };
      }
      const raw = evaluateBoard(next.board);
      const perspective = turn === 'w' ? raw : -raw;
      const noise = (Math.random() - 0.5) * 240;
      return { move, score: perspective + noise };
    });
    scored.sort((a, b) => b.score - a.score);
    const poolSize = Math.min(3, scored.length);
    const roll = Math.random();
    if (roll < 0.65 || scored[0].score > 40000) {
      return scored[0].move;
    }
    return scored[Math.floor(Math.random() * poolSize)].move;
  }

  const maxDepth = difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4;
  const qDepth = difficulty === 'medium' ? 0 : difficulty === 'hard' ? 2 : 3;

  let globalBestMove: ChessMove = legalMoves[0];

  // Iterative deepening up to maxDepth
  for (let depth = 1; depth <= maxDepth; depth++) {
    ctx.aborted = false;
    const orderedRoot = orderMoves(state.board, legalMoves, globalBestMove);
    let bestAtDepth = orderedRoot[0];
    let bestScoreAtDepth = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of orderedRoot) {
      const movingPiece = state.board[move.from.r][move.from.c];
      if (!movingPiece) continue;

      const { nextState } = applyMove(state, move);
      let score: number;

      if (nextState.status === 'checkmate') {
        score = 50000;
      } else if (nextState.winner === 'draw') {
        // Avoid accidental threefold draw if ahead, accept if behind
        const curRaw = evaluateBoard(state.board);
        const curPerspective = turn === 'w' ? curRaw : -curRaw;
        score = curPerspective > 50 ? -150 : 50;
      } else {
        score = -negamax(
          nextState.board,
          nextState.turn,
          nextState.castling,
          nextState.enPassantTarget,
          depth - 1,
          1,
          -beta,
          -alpha,
          qDepth,
          ctx
        );
      }

      if (ctx.aborted) break;

      // Tiny jitter on medium so openings vary
      if (difficulty === 'medium') {
        score += (Math.random() - 0.5) * 18;
      }

      if (score > bestScoreAtDepth) {
        bestScoreAtDepth = score;
        bestAtDepth = move;
      }
      if (score > alpha) {
        alpha = score;
      }
    }

    if (!ctx.aborted) {
      globalBestMove = bestAtDepth;
      if (bestScoreAtDepth > 45000) break; // Forced mate found
    } else {
      break;
    }
  }

  return globalBestMove;
}
