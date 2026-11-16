export type ArcadeGameType =
  | 'connect4'
  | 'checkers'
  | 'reversi'
  | 'dots-and-boxes'
  | 'gomoku'
  | 'ultimate-ttt'
  | 'mancala'
  | 'tictactoe';

export type ArcadePlayer = 'p1' | 'p2';
export type ArcadeWinner = ArcadePlayer | 'draw' | null;

export interface ArcadeGameMeta {
  id: ArcadeGameType;
  name: string;
  tagline: string;
  emoji: string;
  avgTime: string;
  accentColor: string;
  rulesSummary: string;
  p1Label: string;
  p2Label: string;
}

export const ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: 'connect4',
    name: 'Connect 4',
    tagline: 'Drop discs & connect four in a row',
    emoji: '🔴',
    avgTime: '2 min',
    accentColor: '#f43f5e',
    rulesSummary: 'Take turns dropping discs into the 7×6 rack. First player to line up 4 horizontally, vertically, or diagonally wins.',
    p1Label: 'Red',
    p2Label: 'Yellow'
  },
  {
    id: 'checkers',
    name: 'Checkers',
    tagline: 'Multi-jump chains & king promotions',
    emoji: '🏁',
    avgTime: '5 min',
    accentColor: '#f59e0b',
    rulesSummary: 'Move diagonally on dark squares. Captures are mandatory and chain automatically; reach the back rank to crown a King.',
    p1Label: 'Red',
    p2Label: 'White'
  },
  {
    id: 'reversi',
    name: 'Othello / Reversi',
    tagline: 'Flip your rival’s discs across 64 squares',
    emoji: '⚪',
    avgTime: '4 min',
    accentColor: '#10b981',
    rulesSummary: 'Place a disc to flank one or more opponent discs in any straight line. Highest disc count when the board locks wins.',
    p1Label: 'Dark',
    p2Label: 'Light'
  },
  {
    id: 'dots-and-boxes',
    name: 'Dots & Boxes',
    tagline: 'Close boxes to score bonus turns',
    emoji: '🟦',
    avgTime: '3 min',
    accentColor: '#38bdf8',
    rulesSummary: 'Draw lines between adjacent dots. Completing the 4th side of any box claims it and immediately grants another turn!',
    p1Label: 'Cyan',
    p2Label: 'Amber'
  },
  {
    id: 'gomoku',
    name: 'Gomoku (5-in-a-Row)',
    tagline: '15×15 tactical stone-linking duel',
    emoji: '⚫',
    avgTime: '4 min',
    accentColor: '#a855f7',
    rulesSummary: 'Place stones on the 15×15 grid. First player to build an unbroken line of 5 stones wins instantly.',
    p1Label: 'Black',
    p2Label: 'White'
  },
  {
    id: 'ultimate-ttt',
    name: 'Ultimate Tic-Tac-Toe',
    tagline: '9 linked mini-boards, next-level tactics',
    emoji: '❌',
    avgTime: '4 min',
    accentColor: '#ec4899',
    rulesSummary: 'Each cell you play sends your opponent to that corresponding mini-board. Win 3 mini-boards in a row to claim victory.',
    p1Label: 'X (Neon)',
    p2Label: 'O (Gold)'
  },
  {
    id: 'mancala',
    name: 'Mancala',
    tagline: 'Sow seeds, capture pits & chain turns',
    emoji: '🪨',
    avgTime: '4 min',
    accentColor: '#14b8a6',
    rulesSummary: 'Pick a pit on your row to sow seeds counter-clockwise. Land in your store for a free turn or in an empty pit to capture opposite seeds!',
    p1Label: 'Bottom',
    p2Label: 'Top'
  },
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    tagline: 'Lightning-fast classic 3×3 rounds',
    emoji: '⭕',
    avgTime: '30 sec',
    accentColor: '#22c55e',
    rulesSummary: 'Fast 3×3 showdown. Great for instant rematches and quick reflex rounds with room codes.',
    p1Label: 'X',
    p2Label: 'O'
  }
];

export function isValidArcadeGameType(val: unknown): val is ArcadeGameType {
  return ARCADE_GAMES.some(g => g.id === val);
}

export function getArcadeGameMeta(gameType: ArcadeGameType): ArcadeGameMeta {
  return ARCADE_GAMES.find(g => g.id === gameType) || ARCADE_GAMES[0];
}

// ---------------- GAME STATE DEFINITIONS ----------------

export interface CheckersPiece {
  owner: ArcadePlayer;
  king: boolean;
}

export interface Connect4State {
  gameType: 'connect4';
  board: (ArcadePlayer | null)[][]; // 6 rows x 7 cols
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  winLine: [number, number][] | null;
  lastCell: [number, number] | null;
  moveCount: number;
}

export interface CheckersState {
  gameType: 'checkers';
  board: (CheckersPiece | null)[][]; // 8 x 8
  turn: ArcadePlayer;
  chainFrom: [number, number] | null;
  winner: ArcadeWinner;
  lastMove: [[number, number], [number, number]] | null;
  moveCount: number;
}

export interface ReversiState {
  gameType: 'reversi';
  board: (ArcadePlayer | null)[][]; // 8 x 8
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  lastCell: [number, number] | null;
  flippedCells: [number, number][];
  passedLastTurn: boolean;
  counts: { p1: number; p2: number };
  moveCount: number;
}

export interface DotsAndBoxesState {
  gameType: 'dots-and-boxes';
  hLines: (ArcadePlayer | null)[][]; // 5 rows x 4 cols
  vLines: (ArcadePlayer | null)[][]; // 4 rows x 5 cols
  boxes: (ArcadePlayer | null)[][]; // 4 rows x 4 cols
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  scores: { p1: number; p2: number };
  lastEdge: string | null;
  claimedThisMove: [number, number][];
  moveCount: number;
}

export interface GomokuState {
  gameType: 'gomoku';
  board: (ArcadePlayer | null)[][]; // 15 x 15
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  winLine: [number, number][] | null;
  lastCell: [number, number] | null;
  moveCount: number;
}

export interface UltimateTTTState {
  gameType: 'ultimate-ttt';
  cells: (ArcadePlayer | null)[][]; // 9 x 9
  miniWinners: (ArcadePlayer | 'draw' | null)[]; // length 9
  activeMini: number | null; // 0..8 or null (any unfinished mini-board)
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  winMetaLine: number[] | null;
  lastCell: [number, number] | null;
  moveCount: number;
}

export interface MancalaState {
  gameType: 'mancala';
  pits: number[]; // 14 slots: 0..5 p1 pits, 6 p1 store, 7..12 p2 pits, 13 p2 store
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  lastPit: number | null;
  capturedPit: number | null;
  extraTurn: boolean;
  moveCount: number;
}

export interface TicTacToeState {
  gameType: 'tictactoe';
  board: (ArcadePlayer | null)[]; // length 9
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  winLine: number[] | null;
  lastCell: number | null;
  moveCount: number;
}

export type ArcadeState =
  | Connect4State
  | CheckersState
  | ReversiState
  | DotsAndBoxesState
  | GomokuState
  | UltimateTTTState
  | MancalaState
  | TicTacToeState;

export interface ApplyArcadeResult {
  valid: boolean;
  nextState: ArcadeState;
  extraTurn: boolean;
  capturedOrScored: boolean;
}

// ---------------- INITIAL STATE CREATORS ----------------

export function createInitialArcadeState(gameType: ArcadeGameType): ArcadeState {
  switch (gameType) {
    case 'connect4':
      return {
        gameType: 'connect4',
        board: Array.from({ length: 6 }, () => Array<ArcadePlayer | null>(7).fill(null)),
        turn: 'p1',
        winner: null,
        winLine: null,
        lastCell: null,
        moveCount: 0
      };

    case 'checkers': {
      const board: (CheckersPiece | null)[][] = Array.from({ length: 8 }, () =>
        Array<CheckersPiece | null>(8).fill(null)
      );
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if ((r + c) % 2 === 1) {
            if (r < 3) board[r][c] = { owner: 'p2', king: false };
            else if (r > 4) board[r][c] = { owner: 'p1', king: false };
          }
        }
      }
      return {
        gameType: 'checkers',
        board,
        turn: 'p1',
        chainFrom: null,
        winner: null,
        lastMove: null,
        moveCount: 0
      };
    }

    case 'reversi': {
      const board: (ArcadePlayer | null)[][] = Array.from({ length: 8 }, () =>
        Array<ArcadePlayer | null>(8).fill(null)
      );
      board[3][3] = 'p2';
      board[3][4] = 'p1';
      board[4][3] = 'p1';
      board[4][4] = 'p2';
      return {
        gameType: 'reversi',
        board,
        turn: 'p1',
        winner: null,
        lastCell: null,
        flippedCells: [],
        passedLastTurn: false,
        counts: { p1: 2, p2: 2 },
        moveCount: 0
      };
    }

    case 'dots-and-boxes':
      return {
        gameType: 'dots-and-boxes',
        hLines: Array.from({ length: 5 }, () => Array<ArcadePlayer | null>(4).fill(null)),
        vLines: Array.from({ length: 4 }, () => Array<ArcadePlayer | null>(5).fill(null)),
        boxes: Array.from({ length: 4 }, () => Array<ArcadePlayer | null>(4).fill(null)),
        turn: 'p1',
        winner: null,
        scores: { p1: 0, p2: 0 },
        lastEdge: null,
        claimedThisMove: [],
        moveCount: 0
      };

    case 'gomoku':
      return {
        gameType: 'gomoku',
        board: Array.from({ length: 15 }, () => Array<ArcadePlayer | null>(15).fill(null)),
        turn: 'p1',
        winner: null,
        winLine: null,
        lastCell: null,
        moveCount: 0
      };

    case 'ultimate-ttt':
      return {
        gameType: 'ultimate-ttt',
        cells: Array.from({ length: 9 }, () => Array<ArcadePlayer | null>(9).fill(null)),
        miniWinners: Array<ArcadePlayer | 'draw' | null>(9).fill(null),
        activeMini: null,
        turn: 'p1',
        winner: null,
        winMetaLine: null,
        lastCell: null,
        moveCount: 0
      };

    case 'mancala':
      return {
        gameType: 'mancala',
        pits: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
        turn: 'p1',
        winner: null,
        lastPit: null,
        capturedPit: null,
        extraTurn: false,
        moveCount: 0
      };

    case 'tictactoe':
      return {
        gameType: 'tictactoe',
        board: Array<ArcadePlayer | null>(9).fill(null),
        turn: 'p1',
        winner: null,
        winLine: null,
        lastCell: null,
        moveCount: 0
      };
  }
}

// ---------------- HELPERS PER ENGINE ----------------

const TTT_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function checkLineWin(
  board: (ArcadePlayer | null)[][],
  rows: number,
  cols: number,
  needed: number,
  player: ArcadePlayer
): [number, number][] | null {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < needed; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
          if (board[nr][nc] !== player) break;
          line.push([nr, nc]);
        }
        if (line.length === needed) return line;
      }
    }
  }
  return null;
}

const REVERSI_DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export function getReversiFlips(
  board: (ArcadePlayer | null)[][],
  r: number,
  c: number,
  player: ArcadePlayer
): [number, number][] {
  if (r < 0 || r >= 8 || c < 0 || c >= 8 || board[r][c] !== null) return [];
  const opp: ArcadePlayer = player === 'p1' ? 'p2' : 'p1';
  const flips: [number, number][] = [];
  for (const [dr, dc] of REVERSI_DIRS) {
    const ray: [number, number][] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opp) {
      ray.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    if (ray.length > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
      flips.push(...ray);
    }
  }
  return flips;
}

export interface CheckersMoveOption {
  from: [number, number];
  to: [number, number];
  capture: [number, number] | null;
  action: string;
}

export function getCheckersLegalMoves(state: CheckersState): CheckersMoveOption[] {
  if (state.winner) return [];
  const { board, turn, chainFrom } = state;
  const jumps: CheckersMoveOption[] = [];
  const steps: CheckersMoveOption[] = [];

  const rowMin = chainFrom ? chainFrom[0] : 0;
  const rowMax = chainFrom ? chainFrom[0] : 7;
  const colMin = chainFrom ? chainFrom[1] : 0;
  const colMax = chainFrom ? chainFrom[1] : 7;

  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      const piece = board[r][c];
      if (!piece || piece.owner !== turn) continue;
      const dirs = piece.king
        ? [-1, 1]
        : piece.owner === 'p1'
        ? [-1]
        : [1];

      for (const dr of dirs) {
        for (const dc of [-1, 1]) {
          const jr = r + dr * 2;
          const jc = c + dc * 2;
          const mr = r + dr;
          const mc = c + dc;
          if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8) {
            const mid = board[mr][mc];
            if (mid && mid.owner !== turn && board[jr][jc] === null) {
              jumps.push({
                from: [r, c],
                to: [jr, jc],
                capture: [mr, mc],
                action: `${r},${c}>${jr},${jc}`
              });
            }
          }
          if (!chainFrom && mr >= 0 && mr < 8 && mc >= 0 && mc < 8 && board[mr][mc] === null) {
            steps.push({
              from: [r, c],
              to: [mr, mc],
              capture: null,
              action: `${r},${c}>${mr},${mc}`
            });
          }
        }
      }
    }
  }

  return jumps.length > 0 ? jumps : steps;
}

// ---------------- LEGAL ACTIONS LIST ----------------

export function getLegalArcadeActions(state: ArcadeState): string[] {
  if (state.winner) return [];

  switch (state.gameType) {
    case 'connect4': {
      const cols: string[] = [];
      for (let c = 0; c < 7; c++) {
        if (state.board[0][c] === null) cols.push(`c:${c}`);
      }
      return cols;
    }

    case 'checkers':
      return getCheckersLegalMoves(state).map(m => m.action);

    case 'reversi': {
      const moves: string[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (getReversiFlips(state.board, r, c, state.turn).length > 0) {
            moves.push(`${r},${c}`);
          }
        }
      }
      return moves;
    }

    case 'dots-and-boxes': {
      const edges: string[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 4; c++) {
          if (!state.hLines[r][c]) edges.push(`h:${r},${c}`);
        }
      }
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          if (!state.vLines[r][c]) edges.push(`v:${r},${c}`);
        }
      }
      return edges;
    }

    case 'gomoku': {
      const cells: string[] = [];
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          if (!state.board[r][c]) cells.push(`${r},${c}`);
        }
      }
      return cells;
    }

    case 'ultimate-ttt': {
      const moves: string[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const miniIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
          if (state.miniWinners[miniIdx] !== null) continue;
          if (state.activeMini !== null && state.activeMini !== miniIdx) continue;
          if (state.cells[r][c] === null) {
            moves.push(`${r},${c}`);
          }
        }
      }
      return moves;
    }

    case 'mancala': {
      const start = state.turn === 'p1' ? 0 : 7;
      const pits: string[] = [];
      for (let i = 0; i < 6; i++) {
        if (state.pits[start + i] > 0) pits.push(`p:${start + i}`);
      }
      return pits;
    }

    case 'tictactoe': {
      const cells: string[] = [];
      for (let i = 0; i < 9; i++) {
        if (!state.board[i]) cells.push(`i:${i}`);
      }
      return cells;
    }
  }
}

// ---------------- APPLY ACTION ----------------

export function applyArcadeAction(state: ArcadeState, rawAction: string): ApplyArcadeResult {
  const action = String(rawAction || '').trim();
  const invalid: ApplyArcadeResult = {
    valid: false,
    nextState: state,
    extraTurn: false,
    capturedOrScored: false
  };
  if (state.winner) return invalid;

  const opp: ArcadePlayer = state.turn === 'p1' ? 'p2' : 'p1';

  switch (state.gameType) {
    case 'connect4': {
      const m = /^c:([0-6])$/.exec(action);
      if (!m) return invalid;
      const col = Number(m[1]);
      let targetRow = -1;
      for (let r = 5; r >= 0; r--) {
        if (state.board[r][col] === null) {
          targetRow = r;
          break;
        }
      }
      if (targetRow === -1) return invalid;

      const nextBoard = state.board.map(row => [...row]);
      nextBoard[targetRow][col] = state.turn;
      const winLine = checkLineWin(nextBoard, 6, 7, 4, state.turn);
      const isFull = nextBoard[0].every(cell => cell !== null);
      const winner: ArcadeWinner = winLine ? state.turn : isFull ? 'draw' : null;

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: Boolean(winLine),
        nextState: {
          gameType: 'connect4',
          board: nextBoard,
          turn: winner ? state.turn : opp,
          winner,
          winLine,
          lastCell: [targetRow, col],
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'checkers': {
      const legal = getCheckersLegalMoves(state).find(m => m.action === action);
      if (!legal) return invalid;

      const nextBoard = state.board.map(row => row.map(cell => (cell ? { ...cell } : null)));
      const moving = nextBoard[legal.from[0]][legal.from[1]]!;
      nextBoard[legal.from[0]][legal.from[1]] = null;
      if (legal.capture) {
        nextBoard[legal.capture[0]][legal.capture[1]] = null;
      }

      const becomesKing =
        !moving.king &&
        ((moving.owner === 'p1' && legal.to[0] === 0) ||
          (moving.owner === 'p2' && legal.to[0] === 7));
      nextBoard[legal.to[0]][legal.to[1]] = {
        owner: moving.owner,
        king: moving.king || becomesKing
      };

      // Check chain jump if capture happened and piece did not just crown
      let nextChainFrom: [number, number] | null = null;
      if (legal.capture && !becomesKing) {
        const probeState: CheckersState = {
          ...state,
          board: nextBoard,
          chainFrom: legal.to
        };
        const followUps = getCheckersLegalMoves(probeState);
        if (followUps.length > 0 && followUps.some(f => f.capture !== null)) {
          nextChainFrom = legal.to;
        }
      }

      const nextTurn = nextChainFrom ? state.turn : opp;
      let winner: ArcadeWinner = null;

      if (!nextChainFrom) {
        // Count opponent pieces or check legal moves for opponent
        let oppPieces = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (nextBoard[r][c]?.owner === opp) oppPieces++;
          }
        }
        if (oppPieces === 0) {
          winner = state.turn;
        } else {
          const oppMoves = getCheckersLegalMoves({
            gameType: 'checkers',
            board: nextBoard,
            turn: opp,
            chainFrom: null,
            winner: null,
            lastMove: null,
            moveCount: state.moveCount + 1
          });
          if (oppMoves.length === 0) winner = state.turn;
        }
      }

      return {
        valid: true,
        extraTurn: Boolean(nextChainFrom),
        capturedOrScored: Boolean(legal.capture),
        nextState: {
          gameType: 'checkers',
          board: nextBoard,
          turn: winner ? state.turn : nextTurn,
          chainFrom: nextChainFrom,
          winner,
          lastMove: [legal.from, legal.to],
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'reversi': {
      const m = /^([0-7]),([0-7])$/.exec(action);
      if (!m) return invalid;
      const r = Number(m[1]);
      const c = Number(m[2]);
      const flips = getReversiFlips(state.board, r, c, state.turn);
      if (flips.length === 0) return invalid;

      const nextBoard = state.board.map(row => [...row]);
      nextBoard[r][c] = state.turn;
      for (const [fr, fc] of flips) {
        nextBoard[fr][fc] = state.turn;
      }

      let p1Count = 0;
      let p2Count = 0;
      for (let rr = 0; rr < 8; rr++) {
        for (let cc = 0; cc < 8; cc++) {
          if (nextBoard[rr][cc] === 'p1') p1Count++;
          else if (nextBoard[rr][cc] === 'p2') p2Count++;
        }
      }

      const hasMoves = (player: ArcadePlayer) => {
        for (let rr = 0; rr < 8; rr++) {
          for (let cc = 0; cc < 8; cc++) {
            if (getReversiFlips(nextBoard, rr, cc, player).length > 0) return true;
          }
        }
        return false;
      };

      const oppHasMove = hasMoves(opp);
      const selfHasMove = oppHasMove ? true : hasMoves(state.turn);
      let nextTurn = state.turn;
      let passedLastTurn = false;
      let winner: ArcadeWinner = null;

      if (oppHasMove) {
        nextTurn = opp;
      } else if (selfHasMove) {
        nextTurn = state.turn;
        passedLastTurn = true;
      } else {
        winner = p1Count > p2Count ? 'p1' : p2Count > p1Count ? 'p2' : 'draw';
      }

      return {
        valid: true,
        extraTurn: !winner && nextTurn === state.turn,
        capturedOrScored: flips.length > 0,
        nextState: {
          gameType: 'reversi',
          board: nextBoard,
          turn: nextTurn,
          winner,
          lastCell: [r, c],
          flippedCells: flips,
          passedLastTurn,
          counts: { p1: p1Count, p2: p2Count },
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'dots-and-boxes': {
      const m = /^(h|v):([0-4]),([0-4])$/.exec(action);
      if (!m) return invalid;
      const kind = m[1];
      const r = Number(m[2]);
      const c = Number(m[3]);

      const hLines = state.hLines.map(row => [...row]);
      const vLines = state.vLines.map(row => [...row]);
      const boxes = state.boxes.map(row => [...row]);
      const claimedThisMove: [number, number][] = [];

      if (kind === 'h') {
        if (r < 0 || r >= 5 || c < 0 || c >= 4 || hLines[r][c] !== null) return invalid;
        hLines[r][c] = state.turn;
      } else {
        if (r < 0 || r >= 4 || c < 0 || c >= 5 || vLines[r][c] !== null) return invalid;
        vLines[r][c] = state.turn;
      }

      const checkBox = (br: number, bc: number) => {
        if (br < 0 || br >= 4 || bc < 0 || bc >= 4) return;
        if (boxes[br][bc] !== null) return;
        if (hLines[br][bc] && hLines[br + 1][bc] && vLines[br][bc] && vLines[br][bc + 1]) {
          boxes[br][bc] = state.turn;
          claimedThisMove.push([br, bc]);
        }
      };

      if (kind === 'h') {
        checkBox(r - 1, c);
        checkBox(r, c);
      } else {
        checkBox(r, c - 1);
        checkBox(r, c);
      }

      let p1Score = 0;
      let p2Score = 0;
      for (let br = 0; br < 4; br++) {
        for (let bc = 0; bc < 4; bc++) {
          if (boxes[br][bc] === 'p1') p1Score++;
          else if (boxes[br][bc] === 'p2') p2Score++;
        }
      }

      const totalClaimed = p1Score + p2Score;
      let winner: ArcadeWinner = null;
      if (totalClaimed >= 16) {
        winner = p1Score > p2Score ? 'p1' : p2Score > p1Score ? 'p2' : 'draw';
      }

      const gotExtraTurn = !winner && claimedThisMove.length > 0;
      return {
        valid: true,
        extraTurn: gotExtraTurn,
        capturedOrScored: claimedThisMove.length > 0,
        nextState: {
          gameType: 'dots-and-boxes',
          hLines,
          vLines,
          boxes,
          turn: winner ? state.turn : gotExtraTurn ? state.turn : opp,
          winner,
          scores: { p1: p1Score, p2: p2Score },
          lastEdge: action,
          claimedThisMove,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'gomoku': {
      const m = /^(\d{1,2}),(\d{1,2})$/.exec(action);
      if (!m) return invalid;
      const r = Number(m[1]);
      const c = Number(m[2]);
      if (r < 0 || r >= 15 || c < 0 || c >= 15 || state.board[r][c] !== null) return invalid;

      const nextBoard = state.board.map(row => [...row]);
      nextBoard[r][c] = state.turn;
      const winLine = checkLineWin(nextBoard, 15, 15, 5, state.turn);
      const isFull = state.moveCount + 1 >= 225;
      const winner: ArcadeWinner = winLine ? state.turn : isFull ? 'draw' : null;

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: Boolean(winLine),
        nextState: {
          gameType: 'gomoku',
          board: nextBoard,
          turn: winner ? state.turn : opp,
          winner,
          winLine,
          lastCell: [r, c],
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'ultimate-ttt': {
      const m = /^([0-8]),([0-8])$/.exec(action);
      if (!m) return invalid;
      const r = Number(m[1]);
      const c = Number(m[2]);
      const miniR = Math.floor(r / 3);
      const miniC = Math.floor(c / 3);
      const miniIdx = miniR * 3 + miniC;
      const subR = r % 3;
      const subC = c % 3;
      const subIdx = subR * 3 + subC;

      if (state.miniWinners[miniIdx] !== null) return invalid;
      if (state.activeMini !== null && state.activeMini !== miniIdx) return invalid;
      if (state.cells[r][c] !== null) return invalid;

      const nextCells = state.cells.map(row => [...row]);
      nextCells[r][c] = state.turn;
      const nextMiniWinners = [...state.miniWinners];

      // Evaluate local 3x3 mini-board
      const flatMini: (ArcadePlayer | null)[] = [];
      for (let sr = 0; sr < 3; sr++) {
        for (let sc = 0; sc < 3; sc++) {
          flatMini.push(nextCells[miniR * 3 + sr][miniC * 3 + sc]);
        }
      }
      let miniWon = false;
      for (const [a, b, d] of TTT_LINES) {
        if (flatMini[a] && flatMini[a] === flatMini[b] && flatMini[a] === flatMini[d]) {
          nextMiniWinners[miniIdx] = flatMini[a];
          miniWon = true;
          break;
        }
      }
      if (!miniWon && flatMini.every(x => x !== null)) {
        nextMiniWinners[miniIdx] = 'draw';
      }

      // Evaluate meta 3x3 board
      let winner: ArcadeWinner = null;
      let winMetaLine: number[] | null = null;
      for (const line of TTT_LINES) {
        const [a, b, d] = line;
        const va = nextMiniWinners[a];
        if ((va === 'p1' || va === 'p2') && va === nextMiniWinners[b] && va === nextMiniWinners[d]) {
          winner = va;
          winMetaLine = line;
          break;
        }
      }
      if (!winner && nextMiniWinners.every(w => w !== null)) {
        winner = 'draw';
      }

      const nextActiveMini = winner
        ? null
        : nextMiniWinners[subIdx] === null
        ? subIdx
        : null;

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: miniWon,
        nextState: {
          gameType: 'ultimate-ttt',
          cells: nextCells,
          miniWinners: nextMiniWinners,
          activeMini: nextActiveMini,
          turn: winner ? state.turn : opp,
          winner,
          winMetaLine,
          lastCell: [r, c],
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'mancala': {
      const m = /^p:(\d{1,2})$/.exec(action);
      if (!m) return invalid;
      const pitIdx = Number(m[1]);
      if (state.turn === 'p1' && (pitIdx < 0 || pitIdx > 5)) return invalid;
      if (state.turn === 'p2' && (pitIdx < 7 || pitIdx > 12)) return invalid;
      if (state.pits[pitIdx] <= 0) return invalid;

      const pits = [...state.pits];
      let seeds = pits[pitIdx];
      pits[pitIdx] = 0;

      const ownStore = state.turn === 'p1' ? 6 : 13;
      const oppStore = state.turn === 'p1' ? 13 : 6;
      let idx = pitIdx;

      while (seeds > 0) {
        idx = (idx + 1) % 14;
        if (idx === oppStore) continue;
        pits[idx]++;
        seeds--;
      }

      const landedOwnStore = idx === ownStore;
      let capturedPit: number | null = null;
      const landedOwnEmptyPit =
        !landedOwnStore &&
        ((state.turn === 'p1' && idx >= 0 && idx <= 5) ||
          (state.turn === 'p2' && idx >= 7 && idx <= 12)) &&
        pits[idx] === 1;

      if (landedOwnEmptyPit) {
        const oppositeIdx = 12 - idx;
        if (pits[oppositeIdx] > 0) {
          pits[ownStore] += pits[oppositeIdx] + 1;
          pits[oppositeIdx] = 0;
          pits[idx] = 0;
          capturedPit = oppositeIdx;
        }
      }

      // Check end-game sweep
      let p1Sum = 0;
      let p2Sum = 0;
      for (let i = 0; i <= 5; i++) p1Sum += pits[i];
      for (let i = 7; i <= 12; i++) p2Sum += pits[i];

      let winner: ArcadeWinner = null;
      if (p1Sum === 0 || p2Sum === 0) {
        for (let i = 0; i <= 5; i++) {
          pits[6] += pits[i];
          pits[i] = 0;
        }
        for (let i = 7; i <= 12; i++) {
          pits[13] += pits[i];
          pits[i] = 0;
        }
        winner = pits[6] > pits[13] ? 'p1' : pits[13] > pits[6] ? 'p2' : 'draw';
      }

      const gotExtraTurn = !winner && landedOwnStore;
      return {
        valid: true,
        extraTurn: gotExtraTurn,
        capturedOrScored: capturedPit !== null || landedOwnStore,
        nextState: {
          gameType: 'mancala',
          pits,
          turn: winner ? state.turn : gotExtraTurn ? state.turn : opp,
          winner,
          lastPit: pitIdx,
          capturedPit,
          extraTurn: gotExtraTurn,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'tictactoe': {
      const m = /^i:([0-8])$/.exec(action);
      if (!m) return invalid;
      const idx = Number(m[1]);
      if (state.board[idx] !== null) return invalid;

      const nextBoard = [...state.board];
      nextBoard[idx] = state.turn;
      let winLine: number[] | null = null;
      for (const line of TTT_LINES) {
        const [a, b, d] = line;
        if (nextBoard[a] && nextBoard[a] === nextBoard[b] && nextBoard[a] === nextBoard[d]) {
          winLine = line;
          break;
        }
      }
      const isFull = nextBoard.every(x => x !== null);
      const winner: ArcadeWinner = winLine ? state.turn : isFull ? 'draw' : null;

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: Boolean(winLine),
        nextState: {
          gameType: 'tictactoe',
          board: nextBoard,
          turn: winner ? state.turn : opp,
          winner,
          winLine,
          lastCell: idx,
          moveCount: state.moveCount + 1
        }
      };
    }
  }
}

// ---------------- INCREMENTAL REPLAY ----------------

export function replayArcadeMoves(
  gameType: ArcadeGameType,
  rawMoves: string[],
  cachedBase?: { gameType: ArcadeGameType; moves: string[]; state: ArcadeState }
): ArcadeState {
  let state: ArcadeState;
  let startIndex = 0;

  if (
    cachedBase &&
    cachedBase.gameType === gameType &&
    rawMoves.length >= cachedBase.moves.length
  ) {
    let prefixMatch = true;
    for (let i = 0; i < cachedBase.moves.length; i++) {
      if (cachedBase.moves[i] !== rawMoves[i]) {
        prefixMatch = false;
        break;
      }
    }
    if (prefixMatch) {
      state = cachedBase.state;
      startIndex = cachedBase.moves.length;
    } else {
      state = createInitialArcadeState(gameType);
    }
  } else {
    state = createInitialArcadeState(gameType);
  }

  for (let i = startIndex; i < rawMoves.length; i++) {
    const res = applyArcadeAction(state, rawMoves[i]);
    if (res.valid) {
      state = res.nextState;
    }
  }
  return state;
}

// ---------------- SMART BOT ENGINE ----------------

export function pickBotArcadeAction(state: ArcadeState): string | null {
  const legal = getLegalArcadeActions(state);
  if (legal.length === 0) return null;
  const bot = state.turn;
  const opp: ArcadePlayer = bot === 'p1' ? 'p2' : 'p1';

  // 1. Immediate win check (applicable to most games)
  for (const act of legal) {
    const res = applyArcadeAction(state, act);
    if (res.valid && res.nextState.winner === bot) return act;
  }

  switch (state.gameType) {
    case 'connect4': {
      // Block opponent immediate win
      for (const act of legal) {
        const simState: Connect4State = { ...state, turn: opp };
        const oppRes = applyArcadeAction(simState, act);
        if (oppRes.valid && oppRes.nextState.winner === opp) return act;
      }
      // Prefer center columns without gifting win directly above
      const order = ['c:3', 'c:2', 'c:4', 'c:1', 'c:5', 'c:0', 'c:6'].filter(c => legal.includes(c));
      const safe = order.filter(act => {
        const after = applyArcadeAction(state, act).nextState as Connect4State;
        return !getLegalArcadeActions(after).some(
          reply => applyArcadeAction(after, reply).nextState.winner === opp
        );
      });
      return safe[0] || order[0] || legal[0];
    }

    case 'checkers': {
      let best = legal[0];
      let bestScore = -9999;
      for (const act of legal) {
        const after = applyArcadeAction(state, act).nextState as CheckersState;
        let score = 0;
        if (after.turn === bot) score += 30; // chain jump
        const [, toPart] = act.split('>');
        const [tr, tc] = toPart.split(',').map(Number);
        if (after.board[tr][tc]?.king) score += 20;
        if (tc === 0 || tc === 7) score += 4;
        score += Math.random() * 2;
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'reversi': {
      const weights = [
        [100, -25, 10, 5, 5, 10, -25, 100],
        [-25, -40, -2, -2, -2, -2, -40, -25],
        [10, -2, 4, 2, 2, 4, -2, 10],
        [5, -2, 2, 1, 1, 2, -2, 5],
        [5, -2, 2, 1, 1, 2, -2, 5],
        [10, -2, 4, 2, 2, 4, -2, 10],
        [-25, -40, -2, -2, -2, -2, -40, -25],
        [100, -25, 10, 5, 5, 10, -25, 100]
      ];
      let best = legal[0];
      let bestScore = -9999;
      for (const act of legal) {
        const [r, c] = act.split(',').map(Number);
        const res = applyArcadeAction(state, act).nextState as ReversiState;
        const flipBonus = res.flippedCells.length;
        const score = weights[r][c] + flipBonus * 0.5 + (res.turn === bot ? 15 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'dots-and-boxes': {
      // Take box-completing edge first
      for (const act of legal) {
        const res = applyArcadeAction(state, act);
        if (res.capturedOrScored) return act;
      }
      // Avoid creating a 3-sided box for opponent
      const safe = legal.filter(act => {
        const after = applyArcadeAction(state, act).nextState as DotsAndBoxesState;
        return !getLegalArcadeActions(after).some(reply => applyArcadeAction(after, reply).capturedOrScored);
      });
      const pool = safe.length > 0 ? safe : legal;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    case 'gomoku': {
      // Block immediate opp win or extend near existing stones
      for (const act of legal) {
        const oppSim: GomokuState = { ...state, turn: opp };
        if (applyArcadeAction(oppSim, act).nextState.winner === opp) return act;
      }
      let best = '7,7';
      if (!legal.includes(best)) {
        let bestScore = -1;
        const dirs = [[0,1],[1,0],[1,1],[1,-1]];
        for (const act of legal) {
          const [r, c] = act.split(',').map(Number);
          let score = 0;
          for (const [dr, dc] of dirs) {
            for (const sign of [-1, 1]) {
              let runSelf = 0;
              let runOpp = 0;
              for (let k = 1; k <= 4; k++) {
                const nr = r + dr * k * sign;
                const nc = c + dc * k * sign;
                if (nr < 0 || nr >= 15 || nc < 0 || nc >= 15) break;
                const cell = state.board[nr][nc];
                if (cell === bot && runOpp === 0) runSelf++;
                else if (cell === opp && runSelf === 0) runOpp++;
                else break;
              }
              score += runSelf * runSelf * 6 + runOpp * runOpp * 5;
            }
          }
          // Slight center preference
          score += Math.max(0, 7 - (Math.abs(r - 7) + Math.abs(c - 7))) * 0.25;
          if (score > bestScore) {
            bestScore = score;
            best = act;
          }
        }
      }
      return best;
    }

    case 'ultimate-ttt': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const after = applyArcadeAction(state, act).nextState as UltimateTTTState;
        let score = 0;
        const [r, c] = act.split(',').map(Number);
        const miniIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        if (after.miniWinners[miniIdx] === bot) score += 45;
        if (after.activeMini === null) score -= 18; // avoid gifting free choice
        if (r % 3 === 1 && c % 3 === 1) score += 6;
        score += Math.random() * 2;
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'mancala': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const res = applyArcadeAction(state, act);
        const after = res.nextState as MancalaState;
        const storeIdx = bot === 'p1' ? 6 : 13;
        const gain = after.pits[storeIdx] - state.pits[storeIdx];
        const score = gain * 4 + (res.extraTurn ? 20 : 0) + (after.capturedPit !== null ? 15 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'tictactoe': {
      for (const act of legal) {
        const oppSim: TicTacToeState = { ...state, turn: opp };
        if (applyArcadeAction(oppSim, act).nextState.winner === opp) return act;
      }
      const pref = ['i:4', 'i:0', 'i:2', 'i:6', 'i:8', 'i:1', 'i:3', 'i:5', 'i:7'];
      return pref.find(p => legal.includes(p)) || legal[0];
    }
  }
}
