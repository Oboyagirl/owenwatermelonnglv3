import {
  BATCH2_ARCADE_GAMES,
  EXTENDED_ARCADE_GAMES
} from './arcadeExtendedTypes.ts';
import type {
  ArcadeBot,
  ArcadeBotDifficulty,
  ArcadeGameCategory,
  ArcadeGameMeta,
  ArcadeGameType,
  ArcadePlayer,
  ArcadeWinner,
  BaseArcadeGameType,
  Batch2ArcadeState,
  ExtendedArcadeGameType,
  ExtendedArcadeState
} from './arcadeExtendedTypes.ts';
import {
  applyExtendedArcadeAction,
  createExtendedInitialState,
  getExtendedLegalActions,
  isExtendedArcadeGameType,
  pickExtendedBotAction
} from './arcadeExtendedEngines.ts';
import {
  applyBatch2ArcadeAction,
  createBatch2InitialState,
  getBatch2LegalActions,
  isBatch2ArcadeGameType,
  pickBatch2BotAction
} from './arcadeBatch2Engines.ts';

export {
  BATCH2_ARCADE_GAMES,
  PIXEL_DRAW_COLORS,
  PIXEL_WORD_BANK,
  EMOJI_CHARADES_LIST,
  EMOJI_PALETTE,
  WORDLE_5_WORDS,
  HANGMAN_WORDS,
  MASTERMIND_COLORS,
  WORD_CHAIN_SEEDS,
  WORD_CHAIN_BOT_DICT,
  EXTENDED_ARCADE_GAMES
} from './arcadeExtendedTypes.ts';
export type {
  Batch2ArcadeGameType,
  Batch2ArcadeState,
  BaseArcadeGameType,
  ExtendedArcadeGameType,
  ArcadeGameType,
  ArcadePlayer,
  ArcadeWinner,
  ArcadeBotDifficulty,
  ArcadeGameCategory,
  ArcadeGameMeta,
  ArcadeBot,
  PixelGuessState,
  EmojiCharadesState,
  NimState,
  MisereNimState,
  ChompState,
  HexState,
  GridLink4State,
  OrderChaosState,
  MisereTTTState,
  Gravity5State,
  SnortState,
  ColClashState,
  DomineeringState,
  CramState,
  ObstructionState,
  AtaxxState,
  BreakthroughState,
  KingsEscapeState,
  WordleDuelState,
  HangmanDuelState,
  MastermindState,
  HiLoTargetState,
  WordChainState,
  Blackjack21State,
  YachtDiceState,
  TugOfWarState,
  RpsChoice,
  RpsArenaState,
  PenaltyKickState,
  MinesDuelState,
  SosGridState,
  ExtendedArcadeState
} from './arcadeExtendedTypes.ts';
export {
  isExtendedArcadeGameType,
  createExtendedInitialState,
  getExtendedLegalActions,
  applyExtendedArcadeAction,
  pickExtendedBotAction,
  PIXEL_BOT_TEMPLATES,
  cardValue21,
  formatCardLabel,
  scoreYachtCategory
} from './arcadeExtendedEngines.ts';
export {
  isBatch2ArcadeGameType,
  createBatch2InitialState,
  getBatch2LegalActions,
  applyBatch2ArcadeAction,
  pickBatch2BotAction
} from './arcadeBatch2Engines.ts';

export const BASE_ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: 'connect4',
    name: 'Connect 4',
    tagline: 'Drop discs & connect four in a row',
    emoji: '🔴',
    avgTime: '2 min',
    accentColor: '#f43f5e',
    category: 'Strategy',
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
    category: 'Territory & Pawns',
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
    category: 'Territory & Pawns',
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
    category: 'Territory & Pawns',
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
    category: 'Strategy',
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
    category: 'Strategy',
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
    category: 'Strategy',
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
    category: 'Strategy',
    rulesSummary: 'Fast 3×3 showdown. Great for instant rematches and quick reflex rounds with room codes.',
    p1Label: 'X',
    p2Label: 'O'
  },
  {
    id: 'draw-guess',
    name: 'Draw & Guess',
    tagline: 'Sketch clues live & guess the secret word',
    emoji: '🎨',
    avgTime: '4 min',
    accentColor: '#f472b6',
    category: 'Drawing & Creative',
    rulesSummary: '6 rounds of Pictionary-style sketching! Pick or type a secret word, draw it on the canvas, and send it to your opponent to guess in up to 3 tries.',
    p1Label: 'Artist P1',
    p2Label: 'Artist P2'
  },
  {
    id: 'battleship',
    name: 'Battleship',
    tagline: 'Hide your fleet & hunt enemy ships on 8×8 waters',
    emoji: '🚢',
    avgTime: '4 min',
    accentColor: '#0ea5e9',
    category: 'Territory & Pawns',
    rulesSummary: 'Place 4 ships (sizes 4, 3, 2, 2) on your 8×8 grid, then trade salvos! First commander to sink all 11 enemy hull segments wins.',
    p1Label: 'Admiral 1',
    p2Label: 'Admiral 2'
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    tagline: 'Flip pairs & streak bonus turns on a 4×4 deck',
    emoji: '🃏',
    avgTime: '2 min',
    accentColor: '#c084fc',
    category: 'Word & Code',
    rulesSummary: 'Take turns flipping 2 cards from the 4×4 deck. Finding a matching pair scores a point and grants another turn!',
    p1Label: 'Player 1',
    p2Label: 'Player 2'
  },
  {
    id: 'dice-duel',
    name: 'Dice Sprint',
    tagline: 'Push-your-luck dice race to 50 points',
    emoji: '🎲',
    avgTime: '2 min',
    accentColor: '#fb923c',
    category: 'Dice & Duel',
    rulesSummary: 'Roll to add points to your turn bank, or Hold to lock them in. Rolling a 1 busts your turn bank! First to 50 points wins.',
    p1Label: 'Roller 1',
    p2Label: 'Roller 2'
  }
];

export const ARCADE_GAMES: ArcadeGameMeta[] = [
  ...BASE_ARCADE_GAMES,
  ...EXTENDED_ARCADE_GAMES,
  ...BATCH2_ARCADE_GAMES
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

export interface DrawStroke {
  colorIdx: number;
  sizeIdx: number;
  pts: [number, number][]; // logical coordinates: x in 0..200, y in 0..150
}

export interface DrawGuessEntry {
  text: string;
  hit: boolean;
  hint?: string;
}

export interface DrawGuessState {
  gameType: 'draw-guess';
  round: number;
  maxRounds: number;
  phase: 'pick' | 'draw' | 'guess';
  drawer: ArcadePlayer;
  guesser: ArcadePlayer;
  turn: ArcadePlayer;
  rerollCount: number;
  wordChoices: string[];
  word: string | null;
  strokes: DrawStroke[];
  guesses: DrawGuessEntry[];
  scores: { p1: number; p2: number };
  lastRoundResult: {
    round: number;
    word: string;
    guessed: boolean;
    points: number;
    guesser: ArcadePlayer;
  } | null;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface BattleshipShipSpec {
  r: number;
  c: number;
  dir: 'h' | 'v';
  size: number;
}

export interface BattleshipState {
  gameType: 'battleship';
  phase: 'setup' | 'battle';
  fleets: {
    p1: BattleshipShipSpec[] | null;
    p2: BattleshipShipSpec[] | null;
  };
  shots: {
    p1: ('hit' | 'miss' | null)[][]; // shots fired by p1 onto p2's grid
    p2: ('hit' | 'miss' | null)[][]; // shots fired by p2 onto p1's grid
  };
  hitsCount: { p1: number; p2: number };
  sunkBy: { p1: number[]; p2: number[] };
  lastShot: { shooter: ArcadePlayer; r: number; c: number; result: 'hit' | 'miss' | 'sunk' } | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface MemoryMatchState {
  gameType: 'memory-match';
  deck: number[]; // length 16, symbol indices 0..7
  matchedBy: (ArcadePlayer | null)[]; // length 16
  openIndices: number[]; // 0 or 1 currently revealed card
  lastPair: { idxA: number; idxB: number; matched: boolean; by: ArcadePlayer } | null;
  seenIndices: number[];
  scores: { p1: number; p2: number };
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface DiceDuelState {
  gameType: 'dice-duel';
  target: number;
  scores: { p1: number; p2: number };
  turnBank: number;
  lastRoll: number | null;
  bustedBy: ArcadePlayer | null;
  lastEvent: string | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
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
  | TicTacToeState
  | DrawGuessState
  | BattleshipState
  | MemoryMatchState
  | DiceDuelState
  | ExtendedArcadeState
  | Batch2ArcadeState;

export interface ApplyArcadeResult {
  valid: boolean;
  nextState: ArcadeState;
  extraTurn: boolean;
  capturedOrScored: boolean;
}

// ---------------- INITIAL STATE CREATORS ----------------

export function createInitialArcadeState(gameType: ArcadeGameType): ArcadeState {
  if (isExtendedArcadeGameType(gameType)) {
    return createExtendedInitialState(gameType);
  }
  if (isBatch2ArcadeGameType(gameType)) {
    return createBatch2InitialState(gameType);
  }
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

    case 'draw-guess':
      return {
        gameType: 'draw-guess',
        round: 1,
        maxRounds: 6,
        phase: 'pick',
        drawer: 'p1',
        guesser: 'p2',
        turn: 'p1',
        rerollCount: 0,
        wordChoices: getDrawWordChoices(1, 0),
        word: null,
        strokes: [],
        guesses: [],
        scores: { p1: 0, p2: 0 },
        lastRoundResult: null,
        winner: null,
        moveCount: 0
      };

    case 'battleship':
      return {
        gameType: 'battleship',
        phase: 'setup',
        fleets: { p1: null, p2: null },
        shots: {
          p1: Array.from({ length: 8 }, () => Array<'hit' | 'miss' | null>(8).fill(null)),
          p2: Array.from({ length: 8 }, () => Array<'hit' | 'miss' | null>(8).fill(null))
        },
        hitsCount: { p1: 0, p2: 0 },
        sunkBy: { p1: [], p2: [] },
        lastShot: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'memory-match':
      return {
        gameType: 'memory-match',
        deck: buildMemoryDeck(101),
        matchedBy: Array<ArcadePlayer | null>(16).fill(null),
        openIndices: [],
        lastPair: null,
        seenIndices: [],
        scores: { p1: 0, p2: 0 },
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'dice-duel':
      return {
        gameType: 'dice-duel',
        target: 50,
        scores: { p1: 0, p2: 0 },
        turnBank: 0,
        lastRoll: null,
        bustedBy: null,
        lastEvent: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
  }
}

// ---------------- DRAW & GUESS / BATTLESHIP / MEMORY SHARED DATA ----------------

export const DRAW_COLORS = [
  '#0f172a', // 0: Ink Black
  '#ef4444', // 1: Red
  '#f97316', // 2: Orange
  '#eab308', // 3: Yellow
  '#22c55e', // 4: Green
  '#3b82f6', // 5: Blue
  '#a855f7', // 6: Purple
  '#ec4899', // 7: Pink
  '#92400e', // 8: Brown
  '#ffffff'  // 9: Eraser (White)
];

export const DRAW_BRUSH_SIZES = [4, 9, 16];

export const DRAW_WORD_BANK: string[] = [
  'house',
  'sun',
  'tree',
  'cat',
  'fish',
  'rocket',
  'car',
  'boat',
  'crown',
  'heart',
  'star',
  'flower',
  'apple',
  'pizza',
  'robot',
  'ghost',
  'guitar',
  'snowman',
  'umbrella',
  'diamond',
  'mountain',
  'moon',
  'watermelon',
  'trophy',
  'glasses',
  'key',
  'cake',
  'kite',
  'lightning',
  'smiley'
];

// Multi-stroke recognizable vector drawings (200x150 logical canvas) for AI Bots
const BOT_DRAW_PATHS: Record<string, { colorIdx: number; sizeIdx: number; pts: [number, number][] }[]> = {
  house: [
    { colorIdx: 0, sizeIdx: 1, pts: [[55, 70], [145, 70], [145, 130], [55, 130], [55, 70]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[45, 72], [100, 26], [155, 72]] },
    { colorIdx: 8, sizeIdx: 1, pts: [[90, 130], [90, 96], [110, 96], [110, 130]] },
    { colorIdx: 5, sizeIdx: 0, pts: [[66, 84], [82, 84], [82, 100], [66, 100], [66, 84]] }
  ],
  sun: [
    { colorIdx: 3, sizeIdx: 2, pts: [[100, 48], [120, 56], [128, 75], [120, 95], [100, 103], [80, 95], [72, 75], [80, 56], [100, 48]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[100, 20], [100, 38]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[100, 113], [100, 132]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[44, 75], [62, 75]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[138, 75], [156, 75]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[60, 36], [73, 49]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[127, 101], [140, 114]] }
  ],
  tree: [
    { colorIdx: 8, sizeIdx: 2, pts: [[94, 86], [94, 134], [106, 134], [106, 86]] },
    { colorIdx: 4, sizeIdx: 2, pts: [[100, 24], [134, 52], [126, 88], [74, 88], [66, 52], [100, 24]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[88, 56], [90, 58]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[112, 64], [114, 66]] }
  ],
  cat: [
    { colorIdx: 0, sizeIdx: 1, pts: [[68, 52], [62, 24], [86, 42], [114, 42], [138, 24], [132, 52], [140, 82], [126, 106], [74, 106], [60, 82], [68, 52]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[84, 68], [86, 70]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[114, 68], [116, 70]] },
    { colorIdx: 7, sizeIdx: 1, pts: [[96, 80], [104, 80], [100, 86], [96, 80]] },
    { colorIdx: 0, sizeIdx: 0, pts: [[46, 76], [72, 82]] },
    { colorIdx: 0, sizeIdx: 0, pts: [[154, 76], [128, 82]] }
  ],
  fish: [
    { colorIdx: 5, sizeIdx: 1, pts: [[56, 75], [84, 46], [126, 54], [142, 75], [126, 96], [84, 104], [56, 75]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[142, 75], [166, 50], [166, 100], [142, 75]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[74, 68], [76, 70]] },
    { colorIdx: 5, sizeIdx: 0, pts: [[38, 58], [40, 56]] },
    { colorIdx: 5, sizeIdx: 0, pts: [[28, 44], [31, 42]] }
  ],
  rocket: [
    { colorIdx: 5, sizeIdx: 1, pts: [[100, 20], [118, 52], [118, 108], [82, 108], [82, 52], [100, 20]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[82, 86], [62, 114], [82, 108]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[118, 86], [138, 114], [118, 108]] },
    { colorIdx: 2, sizeIdx: 2, pts: [[90, 112], [100, 138], [110, 112]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[100, 62], [106, 68], [100, 74], [94, 68], [100, 62]] }
  ],
  car: [
    { colorIdx: 1, sizeIdx: 1, pts: [[40, 86], [56, 86], [70, 60], [128, 60], [142, 86], [162, 86], [162, 110], [40, 110], [40, 86]] },
    { colorIdx: 0, sizeIdx: 2, pts: [[64, 110], [74, 118], [64, 126], [54, 118], [64, 110]] },
    { colorIdx: 0, sizeIdx: 2, pts: [[136, 110], [146, 118], [136, 126], [126, 118], [136, 110]] },
    { colorIdx: 5, sizeIdx: 0, pts: [[74, 66], [124, 66], [134, 84], [64, 84], [74, 66]] }
  ],
  boat: [
    { colorIdx: 8, sizeIdx: 1, pts: [[44, 92], [156, 92], [136, 122], [64, 122], [44, 92]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[100, 92], [100, 26]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[100, 30], [144, 80], [100, 80]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[26, 130], [60, 124], [100, 132], [140, 124], [174, 130]] }
  ],
  crown: [
    { colorIdx: 3, sizeIdx: 2, pts: [[48, 108], [44, 52], [74, 78], [100, 38], [126, 78], [156, 52], [152, 108], [48, 108]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[100, 84], [102, 86]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[68, 88], [70, 90]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[132, 88], [134, 90]] }
  ],
  heart: [
    { colorIdx: 1, sizeIdx: 2, pts: [[100, 56], [82, 34], [54, 42], [52, 74], [100, 124], [148, 74], [146, 42], [118, 34], [100, 56]] }
  ],
  star: [
    { colorIdx: 3, sizeIdx: 2, pts: [[100, 22], [116, 62], [158, 64], [124, 90], [136, 130], [100, 106], [64, 130], [76, 90], [42, 64], [84, 62], [100, 22]] }
  ],
  flower: [
    { colorIdx: 4, sizeIdx: 1, pts: [[100, 86], [100, 136]] },
    { colorIdx: 4, sizeIdx: 1, pts: [[100, 114], [124, 102]] },
    { colorIdx: 7, sizeIdx: 2, pts: [[100, 44], [118, 30], [130, 50], [144, 66], [124, 82], [100, 88], [76, 82], [56, 66], [70, 50], [82, 30], [100, 44]] },
    { colorIdx: 3, sizeIdx: 2, pts: [[100, 56], [110, 66], [100, 76], [90, 66], [100, 56]] }
  ],
  apple: [
    { colorIdx: 1, sizeIdx: 2, pts: [[100, 46], [130, 44], [144, 72], [132, 114], [100, 124], [68, 114], [56, 72], [70, 44], [100, 46]] },
    { colorIdx: 8, sizeIdx: 1, pts: [[100, 46], [104, 24]] },
    { colorIdx: 4, sizeIdx: 1, pts: [[102, 32], [124, 24], [118, 38], [102, 32]] }
  ],
  pizza: [
    { colorIdx: 2, sizeIdx: 2, pts: [[56, 40], [144, 40], [100, 130], [56, 40]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[64, 50], [136, 50]] },
    { colorIdx: 1, sizeIdx: 2, pts: [[88, 68], [92, 72]] },
    { colorIdx: 1, sizeIdx: 2, pts: [[112, 66], [116, 70]] },
    { colorIdx: 1, sizeIdx: 2, pts: [[98, 96], [102, 100]] }
  ],
  robot: [
    { colorIdx: 5, sizeIdx: 1, pts: [[68, 44], [132, 44], [132, 92], [68, 92], [68, 44]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[100, 44], [100, 24]] },
    { colorIdx: 1, sizeIdx: 1, pts: [[100, 22], [102, 22]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[84, 62], [88, 62]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[112, 62], [116, 62]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[82, 78], [118, 78]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[74, 92], [126, 92], [126, 132], [74, 132], [74, 92]] }
  ],
  ghost: [
    { colorIdx: 6, sizeIdx: 1, pts: [[64, 124], [64, 60], [82, 32], [118, 32], [136, 60], [136, 124], [118, 110], [100, 126], [82, 110], [64, 124]] },
    { colorIdx: 0, sizeIdx: 2, pts: [[86, 66], [88, 68]] },
    { colorIdx: 0, sizeIdx: 2, pts: [[114, 66], [116, 68]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[94, 88], [106, 88]] }
  ],
  guitar: [
    { colorIdx: 8, sizeIdx: 2, pts: [[82, 74], [116, 74], [128, 100], [116, 132], [82, 132], [70, 100], [82, 74]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[99, 74], [99, 20]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[92, 20], [106, 20]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[99, 98], [105, 104], [99, 110], [93, 104], [99, 98]] }
  ],
  snowman: [
    { colorIdx: 5, sizeIdx: 1, pts: [[100, 82], [126, 94], [130, 118], [100, 134], [70, 118], [74, 94], [100, 82]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[100, 44], [118, 54], [118, 72], [100, 82], [82, 72], [82, 54], [100, 44]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[76, 44], [124, 44]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[86, 44], [86, 26], [114, 26], [114, 44]] },
    { colorIdx: 2, sizeIdx: 1, pts: [[100, 62], [116, 65]] }
  ],
  umbrella: [
    { colorIdx: 6, sizeIdx: 2, pts: [[48, 78], [66, 42], [100, 32], [134, 42], [152, 78], [126, 72], [100, 78], [74, 72], [48, 78]] },
    { colorIdx: 0, sizeIdx: 1, pts: [[100, 32], [100, 122], [114, 128], [120, 118]] }
  ],
  diamond: [
    { colorIdx: 5, sizeIdx: 1, pts: [[68, 44], [132, 44], [154, 68], [100, 128], [46, 68], [68, 44]] },
    { colorIdx: 5, sizeIdx: 0, pts: [[46, 68], [154, 68]] },
    { colorIdx: 5, sizeIdx: 0, pts: [[68, 44], [100, 128], [132, 44]] }
  ],
  mountain: [
    { colorIdx: 8, sizeIdx: 2, pts: [[34, 124], [84, 40], [124, 124]] },
    { colorIdx: 8, sizeIdx: 2, pts: [[94, 124], [134, 54], [170, 124]] },
    { colorIdx: 5, sizeIdx: 1, pts: [[70, 64], [84, 68], [98, 62]] }
  ],
  moon: [
    { colorIdx: 3, sizeIdx: 2, pts: [[118, 30], [80, 44], [68, 76], [82, 110], [118, 124], [94, 102], [90, 76], [96, 48], [118, 30]] }
  ],
  watermelon: [
    { colorIdx: 4, sizeIdx: 2, pts: [[46, 66], [70, 112], [100, 124], [130, 112], [154, 66]] },
    { colorIdx: 1, sizeIdx: 2, pts: [[54, 66], [146, 66], [124, 104], [76, 104], [54, 66]] },
    { colorIdx: 0, sizeIdx: 0, pts: [[84, 78], [86, 82]] },
    { colorIdx: 0, sizeIdx: 0, pts: [[102, 86], [104, 90]] },
    { colorIdx: 0, sizeIdx: 0, pts: [[116, 76], [118, 80]] }
  ],
  trophy: [
    { colorIdx: 3, sizeIdx: 2, pts: [[68, 36], [132, 36], [122, 86], [78, 86], [68, 36]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[100, 86], [100, 118]] },
    { colorIdx: 8, sizeIdx: 2, pts: [[76, 120], [124, 120]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[68, 44], [50, 52], [58, 72], [74, 72]] },
    { colorIdx: 3, sizeIdx: 1, pts: [[132, 44], [150, 52], [142, 72], [126, 72]] }
  ]
};

export const MEMORY_SYMBOLS = ['🍉', '🚀', '💎', '🦊', '👑', '⚡', '🎸', '🌈'];

export function buildMemoryDeck(seedInput: number): number[] {
  const deck = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
  let seed = (Math.abs(Math.floor(seedInput)) || 101) % 2147483647;
  if (seed <= 0) seed += 2147483646;
  for (let i = deck.length - 1; i > 0; i--) {
    seed = (seed * 48271) % 2147483647;
    const j = seed % (i + 1);
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

function getDrawWordChoices(round: number, rerollCount: number): string[] {
  const drawableKeys = Object.keys(BOT_DRAW_PATHS);
  const start = ((round - 1) * 3 + rerollCount * 5) % drawableKeys.length;
  return [
    drawableKeys[start % drawableKeys.length],
    drawableKeys[(start + 7) % drawableKeys.length],
    drawableKeys[(start + 13) % drawableKeys.length]
  ];
}

function computeGuessHint(secret: string, attempt: string): string {
  const a = secret.toLowerCase().trim();
  const b = attempt.toLowerCase().trim();
  if (!a || !b) return '';
  if (Math.abs(a.length - b.length) <= 2) {
    // Simple Levenshtein check
    const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
      Array<number>(b.length + 1).fill(0)
    );
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    if (dp[a.length][b.length] <= 2) return 'Very close!';
  }
  if (a[0] === b[0]) return `Starts with "${a[0].toUpperCase()}"!`;
  return `Word has ${a.length} letters`;
}

export function serializeDrawStrokeAction(stroke: DrawStroke): string {
  const colorIdx = Math.max(0, Math.min(DRAW_COLORS.length - 1, Math.round(stroke.colorIdx)));
  const sizeIdx = Math.max(0, Math.min(DRAW_BRUSH_SIZES.length - 1, Math.round(stroke.sizeIdx)));
  const ptsStr = stroke.pts
    .map(([x, y]) => `${Math.max(0, Math.min(200, Math.round(x)))},${Math.max(0, Math.min(150, Math.round(y)))}`)
    .join(';');
  return `ds:${colorIdx}:${sizeIdx}:${ptsStr}`.slice(0, 760);
}

export const BATTLESHIP_SIZES = [4, 3, 2, 2] as const;

export function getShipCells(ship: BattleshipShipSpec): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < ship.size; i++) {
    out.push(ship.dir === 'h' ? [ship.r, ship.c + i] : [ship.r + i, ship.c]);
  }
  return out;
}

export function validateBattleshipFleet(specs: BattleshipShipSpec[]): boolean {
  if (specs.length !== BATTLESHIP_SIZES.length) return false;
  const occupied = new Set<string>();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    if (s.size !== BATTLESHIP_SIZES[i]) return false;
    if (s.dir !== 'h' && s.dir !== 'v') return false;
    for (const [r, c] of getShipCells(s)) {
      if (r < 0 || r >= 8 || c < 0 || c >= 8) return false;
      const key = `${r},${c}`;
      if (occupied.has(key)) return false;
      occupied.add(key);
    }
  }
  return true;
}

export function parseBattleshipFleetAction(action: string): BattleshipShipSpec[] | null {
  if (!action.startsWith('f:')) return null;
  const parts = action.slice(2).split(';');
  if (parts.length !== BATTLESHIP_SIZES.length) return null;
  const specs: BattleshipShipSpec[] = [];
  for (let i = 0; i < parts.length; i++) {
    const m = /^([0-7]),([0-7]),(h|v)$/.exec(parts[i]);
    if (!m) return null;
    specs.push({
      r: Number(m[1]),
      c: Number(m[2]),
      dir: m[3] as 'h' | 'v',
      size: BATTLESHIP_SIZES[i]
    });
  }
  return validateBattleshipFleet(specs) ? specs : null;
}

export function serializeBattleshipFleetAction(specs: BattleshipShipSpec[]): string {
  return `f:${specs.map(s => `${s.r},${s.c},${s.dir}`).join(';')}`;
}

export function generateRandomBattleshipFleet(): BattleshipShipSpec[] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const occupied = new Set<string>();
    const specs: BattleshipShipSpec[] = [];
    let ok = true;
    for (const size of BATTLESHIP_SIZES) {
      let placed = false;
      for (let tries = 0; tries < 60; tries++) {
        const dir: 'h' | 'v' = Math.random() < 0.5 ? 'h' : 'v';
        const maxR = dir === 'v' ? 8 - size : 7;
        const maxC = dir === 'h' ? 8 - size : 7;
        const r = Math.floor(Math.random() * (maxR + 1));
        const c = Math.floor(Math.random() * (maxC + 1));
        const cand: BattleshipShipSpec = { r, c, dir, size };
        const cells = getShipCells(cand);
        if (cells.every(([cr, cc]) => !occupied.has(`${cr},${cc}`))) {
          cells.forEach(([cr, cc]) => occupied.add(`${cr},${cc}`));
          specs.push(cand);
          placed = true;
          break;
        }
      }
      if (!placed) {
        ok = false;
        break;
      }
    }
    if (ok && validateBattleshipFleet(specs)) return specs;
  }
  return [
    { r: 0, c: 0, dir: 'h', size: 4 },
    { r: 2, c: 1, dir: 'v', size: 3 },
    { r: 5, c: 3, dir: 'h', size: 2 },
    { r: 7, c: 5, dir: 'h', size: 2 }
  ];
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
  if (isExtendedArcadeGameType(state.gameType)) {
    return getExtendedLegalActions(state as ExtendedArcadeState);
  }
  if (isBatch2ArcadeGameType(state.gameType)) {
    return getBatch2LegalActions(state as Batch2ArcadeState);
  }

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

    case 'draw-guess': {
      if (state.phase === 'pick') {
        return state.wordChoices.map(w => `dw:${w}`);
      }
      if (state.phase === 'draw') {
        if (state.strokes.length > 0) return ['dp'];
        const targetStrokes = BOT_DRAW_PATHS[state.word || ''] || BOT_DRAW_PATHS.house;
        return [serializeDrawStrokeAction(targetStrokes[0])];
      }
      return state.word ? [`dg:${state.word}`, 'dq'] : ['dq'];
    }

    case 'battleship': {
      if (state.phase === 'setup') {
        return [serializeBattleshipFleetAction(generateRandomBattleshipFleet())];
      }
      const myShots = state.shots[state.turn];
      const moves: string[] = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (myShots[r][c] === null) moves.push(`s:${r},${c}`);
        }
      }
      return moves;
    }

    case 'memory-match': {
      const moves: string[] = [];
      for (let i = 0; i < 16; i++) {
        if (state.matchedBy[i] === null && !state.openIndices.includes(i)) {
          moves.push(state.moveCount === 0 ? `m:${i}:${Math.floor(Math.random() * 900000) + 100}` : `m:${i}`);
        }
      }
      return moves;
    }

    case 'dice-duel': {
      const moves = [`r:${Math.floor(Math.random() * 6) + 1}`];
      if (state.turnBank > 0) moves.push('h');
      return moves;
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
  if (isExtendedArcadeGameType(state.gameType)) {
    return applyExtendedArcadeAction(state as ExtendedArcadeState, action);
  }
  if (isBatch2ArcadeGameType(state.gameType)) {
    return applyBatch2ArcadeAction(state as Batch2ArcadeState, action);
  }

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

    case 'draw-guess': {
      const finishRound = (guessed: boolean, ptsGuesser: number, ptsDrawer: number): ApplyArcadeResult => {
        const nextScores = { ...state.scores };
        if (guessed) {
          nextScores[state.guesser] += ptsGuesser;
          nextScores[state.drawer] += ptsDrawer;
        }
        const roundResult = {
          round: state.round,
          word: state.word || 'mystery',
          guessed,
          points: ptsGuesser,
          guesser: state.guesser
        };
        if (state.round >= state.maxRounds) {
          const winner: ArcadeWinner =
            nextScores.p1 > nextScores.p2 ? 'p1' : nextScores.p2 > nextScores.p1 ? 'p2' : 'draw';
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: guessed,
            nextState: {
              ...state,
              scores: nextScores,
              lastRoundResult: roundResult,
              winner,
              moveCount: state.moveCount + 1
            }
          };
        }
        const nextRound = state.round + 1;
        const nextDrawer: ArcadePlayer = state.drawer === 'p1' ? 'p2' : 'p1';
        const nextGuesser: ArcadePlayer = nextDrawer === 'p1' ? 'p2' : 'p1';
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: guessed,
          nextState: {
            gameType: 'draw-guess',
            round: nextRound,
            maxRounds: state.maxRounds,
            phase: 'pick',
            drawer: nextDrawer,
            guesser: nextGuesser,
            turn: nextDrawer,
            rerollCount: 0,
            wordChoices: getDrawWordChoices(nextRound, 0),
            word: null,
            strokes: [],
            guesses: [],
            scores: nextScores,
            lastRoundResult: roundResult,
            winner: null,
            moveCount: state.moveCount + 1
          }
        };
      };

      if (state.phase === 'pick') {
        if (action === 'dr') {
          if (state.rerollCount >= 3) return invalid;
          const nextReroll = state.rerollCount + 1;
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              rerollCount: nextReroll,
              wordChoices: getDrawWordChoices(state.round, nextReroll),
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action.startsWith('dw:')) {
          const chosen = action.slice(3).toLowerCase().trim().replace(/[^a-z ]/g, '').slice(0, 20).trim();
          if (chosen.length < 2) return invalid;
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              phase: 'draw',
              word: chosen,
              strokes: [],
              guesses: [],
              turn: state.drawer,
              moveCount: state.moveCount + 1
            }
          };
        }
        return invalid;
      }

      if (state.phase === 'draw') {
        if (action.startsWith('ds:')) {
          const parts = action.split(':');
          if (parts.length < 4) return invalid;
          const colorIdx = Number(parts[1]);
          const sizeIdx = Number(parts[2]);
          if (
            !Number.isInteger(colorIdx) ||
            colorIdx < 0 ||
            colorIdx >= DRAW_COLORS.length ||
            !Number.isInteger(sizeIdx) ||
            sizeIdx < 0 ||
            sizeIdx >= DRAW_BRUSH_SIZES.length
          ) {
            return invalid;
          }
          const rawPts = parts.slice(3).join(':').split(';').filter(Boolean);
          if (rawPts.length === 0 || rawPts.length > 140) return invalid;
          const pts: [number, number][] = [];
          for (const pair of rawPts) {
            const [xs, ys] = pair.split(',');
            const x = Number(xs);
            const y = Number(ys);
            if (!Number.isFinite(x) || !Number.isFinite(y)) return invalid;
            pts.push([Math.max(0, Math.min(200, Math.round(x))), Math.max(0, Math.min(150, Math.round(y)))]);
          }
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              strokes: [...state.strokes, { colorIdx, sizeIdx, pts }],
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action === 'du') {
          if (state.strokes.length === 0) return invalid;
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              strokes: state.strokes.slice(0, -1),
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action === 'dc') {
          if (state.strokes.length === 0) return invalid;
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              strokes: [],
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action === 'dp') {
          if (state.strokes.length === 0) return invalid;
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: {
              ...state,
              phase: 'guess',
              turn: state.guesser,
              moveCount: state.moveCount + 1
            }
          };
        }
        return invalid;
      }

      // phase === 'guess'
      if (action === 'dn') {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            phase: 'draw',
            turn: state.drawer,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (action === 'dq') {
        return finishRound(false, 0, 0);
      }
      if (action.startsWith('dg:')) {
        const guess = action.slice(3).toLowerCase().trim().replace(/[^a-z ]/g, '').slice(0, 24).trim();
        if (!guess) return invalid;
        const target = (state.word || '').toLowerCase().trim();
        const hit = guess === target;
        if (hit) {
          const ptsGuesser = Math.max(60, 120 - state.guesses.length * 30);
          return finishRound(true, ptsGuesser, 60);
        }
        const hint = computeGuessHint(target, guess);
        const nextGuesses = [...state.guesses, { text: guess, hit: false, hint }];
        if (nextGuesses.length >= 3) {
          return finishRound(false, 0, 0);
        }
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            guesses: nextGuesses,
            moveCount: state.moveCount + 1
          }
        };
      }
      return invalid;
    }

    case 'battleship': {
      if (state.phase === 'setup') {
        const specs = parseBattleshipFleetAction(action);
        if (!specs) return invalid;
        if (state.fleets[state.turn] !== null) return invalid;
        const nextFleets = { ...state.fleets, [state.turn]: specs };
        const bothReady = nextFleets.p1 !== null && nextFleets.p2 !== null;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            phase: bothReady ? 'battle' : 'setup',
            fleets: nextFleets,
            turn: bothReady ? 'p1' : opp,
            moveCount: state.moveCount + 1
          }
        };
      }

      const m = /^s:([0-7]),([0-7])$/.exec(action);
      if (!m) return invalid;
      const r = Number(m[1]);
      const c = Number(m[2]);
      const targetFleet = state.fleets[opp];
      if (!targetFleet) return invalid;
      if (state.shots[state.turn][r][c] !== null) return invalid;

      const myShotsGrid = state.shots[state.turn].map(row => [...row]);
      let hitShipIdx = -1;
      for (let i = 0; i < targetFleet.length; i++) {
        if (getShipCells(targetFleet[i]).some(([sr, sc]) => sr === r && sc === c)) {
          hitShipIdx = i;
          break;
        }
      }

      const isHit = hitShipIdx !== -1;
      myShotsGrid[r][c] = isHit ? 'hit' : 'miss';

      const nextShots = { ...state.shots, [state.turn]: myShotsGrid };
      const nextHitsCount = {
        ...state.hitsCount,
        [state.turn]: state.hitsCount[state.turn] + (isHit ? 1 : 0)
      };

      let resultKind: 'hit' | 'miss' | 'sunk' = isHit ? 'hit' : 'miss';
      const nextSunk = [...state.sunkBy[state.turn]];
      if (isHit && !nextSunk.includes(hitShipIdx)) {
        const sunkNow = getShipCells(targetFleet[hitShipIdx]).every(
          ([sr, sc]) => myShotsGrid[sr][sc] === 'hit'
        );
        if (sunkNow) {
          nextSunk.push(hitShipIdx);
          resultKind = 'sunk';
        }
      }

      const totalHull = BATTLESHIP_SIZES.reduce((a, b) => a + b, 0);
      const winner: ArcadeWinner = nextHitsCount[state.turn] >= totalHull ? state.turn : null;

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: isHit,
        nextState: {
          ...state,
          shots: nextShots,
          hitsCount: nextHitsCount,
          sunkBy: { ...state.sunkBy, [state.turn]: nextSunk },
          lastShot: { shooter: state.turn, r, c, result: resultKind },
          turn: winner ? state.turn : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'memory-match': {
      const m = /^m:(\d{1,2})(?::(\d{1,7}))?$/.exec(action);
      if (!m) return invalid;
      const idx = Number(m[1]);
      if (idx < 0 || idx >= 16) return invalid;
      if (state.matchedBy[idx] !== null || state.openIndices.includes(idx)) return invalid;

      const deck =
        state.moveCount === 0 && m[2] ? buildMemoryDeck(Number(m[2])) : state.deck;
      const nextSeen = state.seenIndices.includes(idx)
        ? state.seenIndices
        : [...state.seenIndices, idx];

      if (state.openIndices.length === 0) {
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            deck,
            openIndices: [idx],
            lastPair: null,
            seenIndices: nextSeen,
            moveCount: state.moveCount + 1
          }
        };
      }

      // Second card flipped
      const firstIdx = state.openIndices[0];
      const isMatch = deck[firstIdx] === deck[idx];
      const nextMatched = [...state.matchedBy];
      const nextScores = { ...state.scores };

      if (isMatch) {
        nextMatched[firstIdx] = state.turn;
        nextMatched[idx] = state.turn;
        nextScores[state.turn] += 1;
      }

      const allClaimed = nextMatched.every(x => x !== null);
      const winner: ArcadeWinner = allClaimed
        ? nextScores.p1 > nextScores.p2
          ? 'p1'
          : nextScores.p2 > nextScores.p1
          ? 'p2'
          : 'draw'
        : null;

      return {
        valid: true,
        extraTurn: !winner && isMatch,
        capturedOrScored: isMatch,
        nextState: {
          ...state,
          deck,
          matchedBy: nextMatched,
          openIndices: [],
          lastPair: { idxA: firstIdx, idxB: idx, matched: isMatch, by: state.turn },
          seenIndices: nextSeen,
          scores: nextScores,
          turn: winner ? state.turn : isMatch ? state.turn : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'dice-duel': {
      if (action === 'h') {
        if (state.turnBank <= 0) return invalid;
        const nextScores = {
          ...state.scores,
          [state.turn]: state.scores[state.turn] + state.turnBank
        };
        const winner: ArcadeWinner = nextScores[state.turn] >= state.target ? state.turn : null;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            scores: nextScores,
            turnBank: 0,
            bustedBy: null,
            lastEvent: `Banked +${state.turnBank} pts!`,
            turn: winner ? state.turn : opp,
            winner,
            moveCount: state.moveCount + 1
          }
        };
      }

      const m = /^r:([1-6])$/.exec(action);
      if (!m) return invalid;
      const roll = Number(m[1]);
      if (roll === 1) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            turnBank: 0,
            lastRoll: 1,
            bustedBy: state.turn,
            lastEvent: 'Rolled a 1 — turn bank busted!',
            turn: opp,
            moveCount: state.moveCount + 1
          }
        };
      }

      const nextBank = state.turnBank + roll;
      if (state.scores[state.turn] + nextBank >= state.target) {
        const nextScores = {
          ...state.scores,
          [state.turn]: state.scores[state.turn] + nextBank
        };
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            scores: nextScores,
            turnBank: 0,
            lastRoll: roll,
            bustedBy: null,
            lastEvent: `Rolled ${roll} and crossed ${state.target}!`,
            turn: state.turn,
            winner: state.turn,
            moveCount: state.moveCount + 1
          }
        };
      }

      return {
        valid: true,
        extraTurn: true,
        capturedOrScored: false,
        nextState: {
          ...state,
          turnBank: nextBank,
          lastRoll: roll,
          bustedBy: null,
          lastEvent: `Rolled ${roll} (+${roll} in bank)`,
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

// ---------------- MULTI-BOT ROSTER & DIFFICULTY ENGINES ----------------

export const ARCADE_BOTS: ArcadeBot[] = [
  {
    id: 'melon-sprout',
    name: 'Sprout',
    avatar: '🌱',
    rating: 650,
    difficulty: 'easy',
    title: 'Casual Sprout',
    tagline: 'Playful warm-up bot — great for learning rules',
    accentColor: '#4ade80',
    voicelines: {
      start: ['Let’s have a chill round!', 'Still learning the ropes — your move!'],
      bonus: ['Ooh, nice combo!', 'Wait, I got a lucky break!'],
      win: ['Whoa, I actually won that one!', 'Good game! Want a rematch?'],
      lose: ['You crushed me — nice tactics!', 'Oof, I didn’t even see that coming!']
    }
  },
  {
    id: 'sunny-chips',
    name: 'Sunny Chips',
    avatar: '☀️',
    rating: 850,
    difficulty: 'easy',
    title: 'Arcade Rookie',
    tagline: 'Spots obvious wins, keeps things fun and breezy',
    accentColor: '#facc15',
    voicelines: {
      start: ['Sun’s out, game’s on!', 'I’ll go easy... maybe!'],
      bonus: ['Boom! Bonus move!', 'Lucky bounce right there!'],
      win: ['Sunny victory!', 'Haha, caught you sleeping!'],
      lose: ['Well played! Run it back?', 'You outplayed me cleanly!']
    }
  },
  {
    id: 'orbit-bot',
    name: 'Orbit',
    avatar: '🛰️',
    rating: 1120,
    difficulty: 'medium',
    title: 'Club Tactician',
    tagline: 'Solid fundamentals — blocks threats and plays clean shapes',
    accentColor: '#38bdf8',
    voicelines: {
      start: ['Orbit telemetry locked. Good luck.', 'Scanning optimal opening lines...'],
      bonus: ['Trajectory aligned. Bonus action.', 'Tactical advantage secured.'],
      win: ['Mission accomplished.', 'Trajectory converged on victory.'],
      lose: ['Signal lost — strong finish!', 'Recalibrating after that defeat.']
    }
  },
  {
    id: 'pixel-ninja',
    name: 'Pixel Ninja',
    avatar: '🥷',
    rating: 1320,
    difficulty: 'medium',
    title: 'Combo Hunter',
    tagline: 'Loves double-jumps, captures, and sneaky bonus turns',
    accentColor: '#a855f7',
    voicelines: {
      start: ['Silent steps, sharp strikes.', 'Watch your flanks!'],
      bonus: ['Shadow combo! Again!', 'Blink and you’ll miss it.'],
      win: ['Strike from the shadows!', 'Clean tactical takedown.'],
      lose: ['A worthy rival! Respect.', 'You saw through my feint!']
    }
  },
  {
    id: 'crimson-fox',
    name: 'Crimson Fox',
    avatar: '🦊',
    rating: 1580,
    difficulty: 'hard',
    title: 'Sharp Strategist',
    tagline: 'Multi-move lookahead & trap setups',
    accentColor: '#fb7185',
    voicelines: {
      start: ['Try not to fall into my trap.', 'I already planned three turns ahead.'],
      bonus: ['Walked right into it!', 'Momentum is mine now.'],
      win: ['Check the board — outfoxed!', 'That trap snapped shut perfectly.'],
      lose: ['Clever escape... I’ll get you next game.', 'Sharp eye! Impressive defense.']
    }
  },
  {
    id: 'neon-viper',
    name: 'Neon Viper',
    avatar: '🐍',
    rating: 1760,
    difficulty: 'hard',
    title: 'Counter-Puncher',
    tagline: 'Punishes careless moves with fast minimax lookahead',
    accentColor: '#2dd4bf',
    voicelines: {
      start: ['One slip and I strike.', 'Show me your best opening.'],
      bonus: ['Swift counter-strike!', 'Tightening the coils...'],
      win: ['Venomous finish!', 'No room left to breathe.'],
      lose: ['You slipped the strike — well played!', 'Tough opponent. Rematch!']
    }
  },
  {
    id: 'titan-core',
    name: 'Titan Core',
    avatar: '🤖',
    rating: 2050,
    difficulty: 'expert',
    title: 'Deep Search AI',
    tagline: 'Deep alpha-beta minimax & ruthless positional defense',
    accentColor: '#60a5fa',
    voicelines: {
      start: ['Search depth maximized. Your move.', 'Calculating winning trees...'],
      bonus: ['Forced continuation found.', 'Evaluation climbing rapidly.'],
      win: ['Solved the endgame.', 'Optimal play achieved.'],
      lose: ['Anomalous human brilliance detected!', 'Impressive — you beat the core engine!']
    }
  },
  {
    id: 'melon-gm',
    name: 'Melon GM',
    avatar: '🍉',
    rating: 2300,
    difficulty: 'expert',
    title: 'Apex Grandmaster',
    tagline: 'Unforgiving top-tier engine across every board game',
    accentColor: '#10b981',
    voicelines: {
      start: ['Welcome to the Championship table.', 'Every move counts from turn one.'],
      bonus: ['Grandmaster precision!', 'Chain sequence unlocked.'],
      win: ['Crown stays with Melon GM!', 'Clean conversion from start to finish.'],
      lose: ['Legendary play! You beat the Melon Grandmaster!', 'Hats off — pure mastery!']
    }
  }
];

export function getArcadeBotById(botId?: string | null): ArcadeBot {
  return ARCADE_BOTS.find(b => b.id === botId) || ARCADE_BOTS[2]; // Orbit default
}

export function pickArcadeBotVoiceline(
  bot: ArcadeBot,
  event: keyof ArcadeBot['voicelines'],
  prev?: string
): string {
  const pool = bot.voicelines[event];
  if (!pool || pool.length === 0) return '';
  if (pool.length === 1) return pool[0];
  const filtered = prev ? pool.filter(line => line !== prev) : pool;
  const pickFrom = filtered.length > 0 ? filtered : pool;
  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Connect 4 Alpha-Beta Evaluator ---
function scoreConnect4Window(board: (ArcadePlayer | null)[][], bot: ArcadePlayer, opp: ArcadePlayer): number {
  let score = 0;
  // Center column weight
  for (let r = 0; r < 6; r++) {
    if (board[r][3] === bot) score += 6;
    else if (board[r][3] === opp) score -= 6;
  }
  const evalFour = (cells: (ArcadePlayer | null)[]) => {
    let b = 0;
    let o = 0;
    let e = 0;
    for (const c of cells) {
      if (c === bot) b++;
      else if (c === opp) o++;
      else e++;
    }
    if (b === 4) return 10000;
    if (o === 4) return -10000;
    if (b === 3 && e === 1) return 22;
    if (b === 2 && e === 2) return 5;
    if (o === 3 && e === 1) return -26;
    if (o === 2 && e === 2) return -5;
    return 0;
  };
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c <= 3; c++) {
      score += evalFour([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
    }
  }
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c < 7; c++) {
      score += evalFour([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
    }
  }
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c <= 3; c++) {
      score += evalFour([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
    }
  }
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c <= 3; c++) {
      score += evalFour([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]]);
    }
  }
  return score;
}

function searchConnect4(
  state: Connect4State,
  depth: number,
  alpha: number,
  beta: number,
  bot: ArcadePlayer,
  opp: ArcadePlayer,
  budget: { nodes: number }
): { score: number; action: string | null } {
  budget.nodes++;
  if (state.winner === bot) return { score: 100000 + depth * 100, action: null };
  if (state.winner === opp) return { score: -100000 - depth * 100, action: null };
  if (state.winner === 'draw') return { score: 0, action: null };
  const legal = ['c:3', 'c:2', 'c:4', 'c:1', 'c:5', 'c:0', 'c:6'].filter(act => {
    const col = Number(act.slice(2));
    return state.board[0][col] === null;
  });
  if (depth === 0 || legal.length === 0 || budget.nodes > 5500) {
    return { score: scoreConnect4Window(state.board, bot, opp), action: legal[0] || null };
  }

  const maximizing = state.turn === bot;
  let bestAct = legal[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const act of legal) {
    const next = applyArcadeAction(state, act).nextState as Connect4State;
    const res = searchConnect4(next, depth - 1, alpha, beta, bot, opp, budget);
    if (maximizing) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
  }
  return { score: bestScore, action: bestAct };
}

// --- Tic-Tac-Toe Exact Minimax ---
function searchTicTacToe(
  state: TicTacToeState,
  depth: number,
  bot: ArcadePlayer,
  opp: ArcadePlayer
): { score: number; action: string | null } {
  if (state.winner === bot) return { score: 100 - depth, action: null };
  if (state.winner === opp) return { score: depth - 100, action: null };
  if (state.winner === 'draw') return { score: 0, action: null };

  const legal = getLegalArcadeActions(state);
  const maximizing = state.turn === bot;
  let bestScore = maximizing ? -Infinity : Infinity;
  let bestMoves: string[] = [];

  for (const act of legal) {
    const next = applyArcadeAction(state, act).nextState as TicTacToeState;
    const { score } = searchTicTacToe(next, depth + 1, bot, opp);
    if (maximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [act];
      } else if (score === bestScore) {
        bestMoves.push(act);
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMoves = [act];
      } else if (score === bestScore) {
        bestMoves.push(act);
      }
    }
  }
  return {
    score: bestScore,
    action: bestMoves.length > 0 ? pickRandom(bestMoves) : legal[0] || null
  };
}

// --- Checkers Evaluator ---
function evalCheckersState(state: CheckersState, bot: ArcadePlayer, opp: ArcadePlayer): number {
  if (state.winner === bot) return 10000;
  if (state.winner === opp) return -10000;
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      const val = p.king ? 34 : 15;
      const advance = p.owner === 'p1' ? 7 - r : r;
      const centerBonus = c >= 2 && c <= 5 && r >= 2 && r <= 5 ? 3 : 0;
      const total = val + (p.king ? 0 : advance * 0.8) + centerBonus;
      score += p.owner === bot ? total : -total;
    }
  }
  if (state.chainFrom && state.turn === bot) score += 12;
  if (state.chainFrom && state.turn === opp) score -= 12;
  return score;
}

function searchCheckers(
  state: CheckersState,
  depth: number,
  alpha: number,
  beta: number,
  bot: ArcadePlayer,
  opp: ArcadePlayer,
  budget: { nodes: number }
): { score: number; action: string | null } {
  budget.nodes++;
  if (state.winner || depth === 0 || budget.nodes > 2500) {
    return { score: evalCheckersState(state, bot, opp), action: null };
  }
  const legal = getLegalArcadeActions(state);
  if (legal.length === 0) return { score: evalCheckersState(state, bot, opp), action: null };

  const maximizing = state.turn === bot;
  let bestAct = legal[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const act of legal) {
    const next = applyArcadeAction(state, act).nextState as CheckersState;
    const nextDepth = next.turn === state.turn ? depth : depth - 1;
    const res = searchCheckers(next, Math.max(0, nextDepth), alpha, beta, bot, opp, budget);
    if (maximizing) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
  }
  return { score: bestScore, action: bestAct };
}

// --- Reversi Evaluator ---
const REVERSI_WEIGHTS = [
  [120, -25, 14, 6, 6, 14, -25, 120],
  [-25, -45, -3, -2, -2, -3, -45, -25],
  [14, -3, 5, 2, 2, 5, -3, 14],
  [6, -2, 2, 1, 1, 2, -2, 6],
  [6, -2, 2, 1, 1, 2, -2, 6],
  [14, -3, 5, 2, 2, 5, -3, 14],
  [-25, -45, -3, -2, -2, -3, -45, -25],
  [120, -25, 14, 6, 6, 14, -25, 120]
];

function evalReversiState(state: ReversiState, bot: ArcadePlayer, opp: ArcadePlayer): number {
  if (state.winner === bot) return 10000;
  if (state.winner === opp) return -10000;
  if (state.winner === 'draw') return 0;
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = state.board[r][c];
      if (!cell) continue;
      score += cell === bot ? REVERSI_WEIGHTS[r][c] : -REVERSI_WEIGHTS[r][c];
    }
  }
  const totalDiscs = state.counts.p1 + state.counts.p2;
  if (totalDiscs > 48) {
    const myDiscs = bot === 'p1' ? state.counts.p1 : state.counts.p2;
    const oppDiscs = bot === 'p1' ? state.counts.p2 : state.counts.p1;
    score += (myDiscs - oppDiscs) * 4;
  }
  return score;
}

function searchReversi(
  state: ReversiState,
  depth: number,
  alpha: number,
  beta: number,
  bot: ArcadePlayer,
  opp: ArcadePlayer,
  budget: { nodes: number }
): { score: number; action: string | null } {
  budget.nodes++;
  if (state.winner || depth === 0 || budget.nodes > 2200) {
    return { score: evalReversiState(state, bot, opp), action: null };
  }
  const legal = getLegalArcadeActions(state);
  if (legal.length === 0) return { score: evalReversiState(state, bot, opp), action: null };

  const maximizing = state.turn === bot;
  let bestAct = legal[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const act of legal) {
    const next = applyArcadeAction(state, act).nextState as ReversiState;
    const res = searchReversi(next, depth - 1, alpha, beta, bot, opp, budget);
    if (maximizing) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
  }
  return { score: bestScore, action: bestAct };
}

// --- Mancala Deep Alpha-Beta ---
function evalMancalaState(state: MancalaState, bot: ArcadePlayer): number {
  const myStore = bot === 'p1' ? 6 : 13;
  const oppStore = bot === 'p1' ? 13 : 6;
  if (state.winner === bot) return 10000 + (state.pits[myStore] - state.pits[oppStore]);
  if (state.winner && state.winner !== 'draw') return -10000;
  let mySeeds = 0;
  let oppSeeds = 0;
  for (let i = 0; i < 6; i++) {
    mySeeds += state.pits[(bot === 'p1' ? 0 : 7) + i];
    oppSeeds += state.pits[(bot === 'p1' ? 7 : 0) + i];
  }
  return (state.pits[myStore] - state.pits[oppStore]) * 12 + (mySeeds - oppSeeds) * 2;
}

function searchMancala(
  state: MancalaState,
  depth: number,
  alpha: number,
  beta: number,
  bot: ArcadePlayer,
  budget: { nodes: number }
): { score: number; action: string | null } {
  budget.nodes++;
  if (state.winner || depth === 0 || budget.nodes > 3500) {
    return { score: evalMancalaState(state, bot), action: null };
  }
  const legal = getLegalArcadeActions(state);
  if (legal.length === 0) return { score: evalMancalaState(state, bot), action: null };

  const maximizing = state.turn === bot;
  let bestAct = legal[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const act of legal) {
    const resMove = applyArcadeAction(state, act);
    const next = resMove.nextState as MancalaState;
    const nextDepth = resMove.extraTurn ? depth : depth - 1;
    const res = searchMancala(next, Math.max(0, nextDepth), alpha, beta, bot, budget);
    if (maximizing) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
  }
  return { score: bestScore, action: bestAct };
}

// --- Dots & Boxes Chain-Length Evaluator ---
function countOpponentBoxCascade(after: DotsAndBoxesState): number {
  let sim = after;
  let cascade = 0;
  const mover = after.turn;
  while (cascade < 16) {
    const moves = getLegalArcadeActions(sim);
    const scoringMove = moves.find(m => applyArcadeAction(sim, m).capturedOrScored);
    if (!scoringMove) break;
    const res = applyArcadeAction(sim, scoringMove);
    sim = res.nextState as DotsAndBoxesState;
    if (sim.turn !== mover) break;
    cascade += sim.claimedThisMove.length;
  }
  return cascade;
}

// --- Ultimate TTT Heuristic & Search ---
function evalUltimateTTT(state: UltimateTTTState, bot: ArcadePlayer, opp: ArcadePlayer): number {
  if (state.winner === bot) return 10000;
  if (state.winner === opp) return -10000;
  if (state.winner === 'draw') return 0;

  let score = 0;
  for (let i = 0; i < 9; i++) {
    const mw = state.miniWinners[i];
    const centerMult = i === 4 ? 1.5 : i === 0 || i === 2 || i === 6 || i === 8 ? 1.2 : 1;
    if (mw === bot) score += 60 * centerMult;
    else if (mw === opp) score -= 60 * centerMult;
  }
  for (const [a, b, c] of TTT_LINES) {
    const line = [state.miniWinners[a], state.miniWinners[b], state.miniWinners[c]];
    const bc = line.filter(x => x === bot).length;
    const oc = line.filter(x => x === opp).length;
    const ec = line.filter(x => x === null).length;
    if (bc === 2 && ec === 1) score += 90;
    if (oc === 2 && ec === 1) score -= 95;
  }
  if (state.activeMini === null) {
    score += state.turn === bot ? 24 : -24;
  }
  return score;
}

function searchUltimateTTT(
  state: UltimateTTTState,
  depth: number,
  alpha: number,
  beta: number,
  bot: ArcadePlayer,
  opp: ArcadePlayer,
  budget: { nodes: number }
): { score: number; action: string | null } {
  budget.nodes++;
  if (state.winner || depth === 0 || budget.nodes > 2000) {
    return { score: evalUltimateTTT(state, bot, opp), action: null };
  }
  const legal = getLegalArcadeActions(state);
  if (legal.length === 0) return { score: evalUltimateTTT(state, bot, opp), action: null };

  // Prioritize capturing mini-boards and avoiding giving free choice when branching > 9
  const sortedLegal =
    legal.length > 10
      ? legal
          .map(act => {
            const after = applyArcadeAction(state, act).nextState as UltimateTTTState;
            return { act, q: evalUltimateTTT(after, bot, opp) };
          })
          .sort((a, b) => (state.turn === bot ? b.q - a.q : a.q - b.q))
          .slice(0, 9)
          .map(x => x.act)
      : legal;

  const maximizing = state.turn === bot;
  let bestAct = sortedLegal[0];
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const act of sortedLegal) {
    const next = applyArcadeAction(state, act).nextState as UltimateTTTState;
    const res = searchUltimateTTT(next, depth - 1, alpha, beta, bot, opp, budget);
    if (maximizing) {
      if (res.score > bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) break;
    } else {
      if (res.score < bestScore) {
        bestScore = res.score;
        bestAct = act;
      }
      beta = Math.min(beta, bestScore);
      if (alpha >= beta) break;
    }
  }
  return { score: bestScore, action: bestAct };
}

function scoreGomokuCell(board: (ArcadePlayer | null)[][], r: number, c: number, bot: ArcadePlayer, opp: ArcadePlayer): number {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let score = 0;

  const evalForPlayer = (player: ArcadePlayer) => {
    let total = 0;
    for (const [dr, dc] of dirs) {
      let count = 1;
      let openEnds = 0;
      for (const sign of [-1, 1]) {
        let k = 1;
        while (k <= 4) {
          const nr = r + dr * k * sign;
          const nc = c + dc * k * sign;
          if (nr < 0 || nr >= 15 || nc < 0 || nc >= 15) break;
          const cell = board[nr][nc];
          if (cell === player) {
            count++;
            k++;
          } else {
            if (cell === null) openEnds++;
            break;
          }
        }
      }
      if (count >= 5) total += 100000;
      else if (count === 4 && openEnds === 2) total += 15000;
      else if (count === 4 && openEnds === 1) total += 3200;
      else if (count === 3 && openEnds === 2) total += 2400;
      else if (count === 3 && openEnds === 1) total += 300;
      else if (count === 2 && openEnds === 2) total += 140;
      else if (count === 2 && openEnds === 1) total += 25;
      else if (openEnds === 2) total += 6;
    }
    return total;
  };

  score += evalForPlayer(bot) * 1.15 + evalForPlayer(opp);
  score += Math.max(0, 7 - (Math.abs(r - 7) + Math.abs(c - 7))) * 0.5;
  return score;
}

export function pickBotArcadeAction(
  state: ArcadeState,
  botOrId?: ArcadeBot | string
): string | null {
  if (state.winner) return null;

  const botProfile =
    typeof botOrId === 'string'
      ? getArcadeBotById(botOrId)
      : botOrId || ARCADE_BOTS[2];
  const difficulty = botProfile.difficulty;
  const bot = state.turn;
  const opp: ArcadePlayer = bot === 'p1' ? 'p2' : 'p1';

  if (isExtendedArcadeGameType(state.gameType)) {
    return pickExtendedBotAction(state as ExtendedArcadeState, botProfile);
  }
  if (isBatch2ArcadeGameType(state.gameType)) {
    return pickBatch2BotAction(state as Batch2ArcadeState, botProfile);
  }

  // Handle draw-guess explicitly so easy bots still draw real strokes and guess words instead of forfeiting
  if (state.gameType === 'draw-guess') {
    if (state.phase === 'pick') {
      const known = state.wordChoices.filter(w => Boolean(BOT_DRAW_PATHS[w]));
      return `dw:${pickRandom(known.length > 0 ? known : state.wordChoices)}`;
    }
    if (state.phase === 'draw') {
      const targetStrokes = BOT_DRAW_PATHS[state.word || ''] || BOT_DRAW_PATHS.house;
      const idx = state.strokes.length;
      if (idx < targetStrokes.length) {
        return serializeDrawStrokeAction(targetStrokes[idx]);
      }
      return 'dp';
    }
    const secret = state.word || 'house';
    const attempt = state.guesses.length;
    const hitChance =
      difficulty === 'expert'
        ? attempt === 0 ? 0.82 : 0.96
        : difficulty === 'hard'
        ? attempt === 0 ? 0.62 : 0.88
        : difficulty === 'medium'
        ? attempt === 0 ? 0.38 : attempt === 1 ? 0.68 : 0.82
        : attempt === 0 ? 0.22 : attempt === 1 ? 0.42 : 0.58;

    if (Math.random() < hitChance) {
      return `dg:${secret}`;
    }
    const decoys = DRAW_WORD_BANK.filter(
      w => w !== secret && !state.guesses.some(g => g.text === w)
    );
    return `dg:${pickRandom(decoys.length > 0 ? decoys : DRAW_WORD_BANK)}`;
  }

  const legal = getLegalArcadeActions(state);
  if (legal.length === 0) return null;

  // Sprout / Sunny Chips (easy): casual play with ~42% relaxed/playful randomness
  if (difficulty === 'easy') {
    // Spot immediate win ~60% of the time
    if (Math.random() < 0.6) {
      for (const act of legal) {
        if (applyArcadeAction(state, act).nextState.winner === bot) return act;
      }
    }
    if (Math.random() < 0.42) {
      return pickRandom(legal);
    }
  } else {
    // Medium/Hard/Expert always take immediate 1-move wins
    for (const act of legal) {
      if (applyArcadeAction(state, act).nextState.winner === bot) return act;
    }
  }

  switch (state.gameType) {
    case 'connect4': {
      if (difficulty === 'hard') {
        return (
          searchConnect4(state, 3, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      if (difficulty === 'expert') {
        return (
          searchConnect4(state, 5, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      for (const act of legal) {
        const oppSim: Connect4State = { ...state, turn: opp };
        if (applyArcadeAction(oppSim, act).nextState.winner === opp) return act;
      }
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
      if (difficulty === 'hard') {
        return (
          searchCheckers(state, 2, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      if (difficulty === 'expert') {
        return (
          searchCheckers(state, 4, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      let best = legal[0];
      let bestScore = -9999;
      for (const act of legal) {
        const after = applyArcadeAction(state, act).nextState as CheckersState;
        let score = 0;
        if (after.turn === bot) score += 30;
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
      if (difficulty === 'hard') {
        return (
          searchReversi(state, 2, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      if (difficulty === 'expert') {
        return (
          searchReversi(state, 3, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      let best = legal[0];
      let bestScore = -9999;
      for (const act of legal) {
        const [r, c] = act.split(',').map(Number);
        const res = applyArcadeAction(state, act).nextState as ReversiState;
        const score =
          REVERSI_WEIGHTS[r][c] + res.flippedCells.length * 0.6 + (res.turn === bot ? 15 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'dots-and-boxes': {
      for (const act of legal) {
        if (applyArcadeAction(state, act).capturedOrScored) return act;
      }
      const safe = legal.filter(act => {
        const after = applyArcadeAction(state, act).nextState as DotsAndBoxesState;
        return !getLegalArcadeActions(after).some(
          reply => applyArcadeAction(after, reply).capturedOrScored
        );
      });
      if (safe.length > 0) {
        return pickRandom(safe);
      }
      if (difficulty === 'hard' || difficulty === 'expert') {
        let bestAct = legal[0];
        let minCascade = Infinity;
        for (const act of legal) {
          const after = applyArcadeAction(state, act).nextState as DotsAndBoxesState;
          const cascade = countOpponentBoxCascade(after);
          if (cascade < minCascade) {
            minCascade = cascade;
            bestAct = act;
          }
        }
        return bestAct;
      }
      return pickRandom(legal);
    }

    case 'gomoku': {
      for (const act of legal) {
        const oppSim: GomokuState = { ...state, turn: opp };
        if (applyArcadeAction(oppSim, act).nextState.winner === opp) return act;
      }
      if (state.moveCount === 0 && legal.includes('7,7')) return '7,7';

      const scored = legal
        .map(act => {
          const [r, c] = act.split(',').map(Number);
          return {
            act,
            score: scoreGomokuCell(state.board, r, c, bot, opp)
          };
        })
        .sort((a, b) => b.score - a.score);

      if (difficulty === 'expert' && scored.length > 1) {
        // 2-ply lookahead over top 8 tactical candidates
        let bestAct = scored[0].act;
        let bestEval = -Infinity;
        for (const cand of scored.slice(0, 8)) {
          const next = applyArcadeAction(state, cand.act).nextState as GomokuState;
          if (next.winner === bot) return cand.act;
          let oppBestThreat = 0;
          for (const reply of getLegalArcadeActions(next).slice(0, 120)) {
            const [rr, rc] = reply.split(',').map(Number);
            const t = scoreGomokuCell(next.board, rr, rc, opp, bot);
            if (t > oppBestThreat) oppBestThreat = t;
          }
          const net = cand.score - oppBestThreat * 0.72;
          if (net > bestEval) {
            bestEval = net;
            bestAct = cand.act;
          }
        }
        return bestAct;
      }

      return scored[0]?.act || legal[0];
    }

    case 'ultimate-ttt': {
      if (difficulty === 'hard') {
        return (
          searchUltimateTTT(state, 2, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      if (difficulty === 'expert') {
        return (
          searchUltimateTTT(state, 3, -Infinity, Infinity, bot, opp, { nodes: 0 }).action ||
          legal[0]
        );
      }
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const after = applyArcadeAction(state, act).nextState as UltimateTTTState;
        let score = 0;
        const [r, c] = act.split(',').map(Number);
        const miniIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        if (after.miniWinners[miniIdx] === bot) score += 45;
        if (after.activeMini === null) score -= 18;
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
      if (difficulty === 'hard') {
        return (
          searchMancala(state, 3, -Infinity, Infinity, bot, { nodes: 0 }).action || legal[0]
        );
      }
      if (difficulty === 'expert') {
        return (
          searchMancala(state, 5, -Infinity, Infinity, bot, { nodes: 0 }).action || legal[0]
        );
      }
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const res = applyArcadeAction(state, act);
        const after = res.nextState as MancalaState;
        const storeIdx = bot === 'p1' ? 6 : 13;
        const gain = after.pits[storeIdx] - state.pits[storeIdx];
        const score =
          gain * 4 + (res.extraTurn ? 20 : 0) + (after.capturedPit !== null ? 15 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'tictactoe': {
      if (difficulty === 'expert' || (difficulty === 'hard' && Math.random() < 0.85)) {
        return searchTicTacToe(state, 0, bot, opp).action || legal[0];
      }
      for (const act of legal) {
        const oppSim: TicTacToeState = { ...state, turn: opp };
        if (applyArcadeAction(oppSim, act).nextState.winner === opp) return act;
      }
      const pref = ['i:4', 'i:0', 'i:2', 'i:6', 'i:8', 'i:1', 'i:3', 'i:5', 'i:7'];
      return pref.find(p => legal.includes(p)) || legal[0];
    }

    case 'battleship': {
      if (state.phase === 'setup') {
        return serializeBattleshipFleetAction(generateRandomBattleshipFleet());
      }
      const myShots = state.shots[bot];
      const targetFleet = state.fleets[opp] || [];
      const sunkSet = new Set(state.sunkBy[bot]);

      // Cells belonging to already-sunk ships should not attract target-mode pursuit
      const sunkCells = new Set<string>();
      targetFleet.forEach((ship, i) => {
        if (sunkSet.has(i)) {
          getShipCells(ship).forEach(([sr, sc]) => sunkCells.add(`${sr},${sc}`));
        }
      });

      if (difficulty !== 'easy') {
        const adjacentTargets: string[] = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (myShots[r][c] === 'hit' && !sunkCells.has(`${r},${c}`)) {
              const neighbors: [number, number][] = [
                [r - 1, c],
                [r + 1, c],
                [r, c - 1],
                [r, c + 1]
              ];
              for (const [nr, nc] of neighbors) {
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && myShots[nr][nc] === null) {
                  adjacentTargets.push(`s:${nr},${nc}`);
                }
              }
            }
          }
        }
        if (adjacentTargets.length > 0) {
          return pickRandom(adjacentTargets);
        }
      }

      if (difficulty === 'hard' || difficulty === 'expert') {
        const parity = legal.filter(act => {
          const [r, c] = act.slice(2).split(',').map(Number);
          return (r + c) % 2 === 0;
        });
        if (parity.length > 0) return pickRandom(parity);
      }

      return pickRandom(legal);
    }

    case 'memory-match': {
      const memoryChance =
        difficulty === 'expert' ? 1 : difficulty === 'hard' ? 0.85 : difficulty === 'medium' ? 0.55 : 0.2;

      const knownBySymbol = new Map<number, number[]>();
      for (const idx of state.seenIndices) {
        if (state.matchedBy[idx] === null && Math.random() <= memoryChance) {
          const sym = state.deck[idx];
          const arr = knownBySymbol.get(sym) || [];
          arr.push(idx);
          knownBySymbol.set(sym, arr);
        }
      }

      if (state.openIndices.length === 1) {
        const openIdx = state.openIndices[0];
        const sym = state.deck[openIdx];
        const known = knownBySymbol.get(sym) || [];
        const partner = known.find(i => i !== openIdx);
        if (partner !== undefined) return `m:${partner}`;
        return pickRandom(legal);
      }

      // First flip: pick a known pair if bot remembers both cards
      for (const arr of knownBySymbol.values()) {
        if (arr.length >= 2) {
          const act = state.moveCount === 0 ? `m:${arr[0]}:${Math.floor(Math.random() * 900000) + 100}` : `m:${arr[0]}`;
          return act;
        }
      }
      // Otherwise prefer unseen cards to gather info
      const unseen = legal.filter(act => {
        const idx = Number(act.split(':')[1]);
        return !state.seenIndices.includes(idx);
      });
      return pickRandom(unseen.length > 0 ? unseen : legal);
    }

    case 'dice-duel': {
      if (state.turnBank > 0) {
        if (state.scores[bot] + state.turnBank >= state.target) return 'h';
        const oppAhead = state.scores[opp] - state.scores[bot];
        const baseThreshold =
          difficulty === 'easy'
            ? 25
            : difficulty === 'medium'
            ? 15
            : difficulty === 'hard'
            ? 19
            : 20 + Math.min(8, Math.max(0, Math.floor(oppAhead / 4)));
        if (state.turnBank >= baseThreshold) return 'h';
      }
      return `r:${Math.floor(Math.random() * 6) + 1}`;
    }
  }
}

