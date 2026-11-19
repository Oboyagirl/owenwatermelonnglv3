import { BATCH2_ARCADE_GAMES } from './arcadeBatch2Types.ts';
import type { Batch2ArcadeGameType, Batch2ArcadeState } from './arcadeBatch2Types.ts';

export { BATCH2_ARCADE_GAMES };
export type { Batch2ArcadeGameType, Batch2ArcadeState };

export type BaseArcadeGameType =
  | 'connect4'
  | 'checkers'
  | 'reversi'
  | 'dots-and-boxes'
  | 'gomoku'
  | 'ultimate-ttt'
  | 'mancala'
  | 'tictactoe'
  | 'draw-guess'
  | 'battleship'
  | 'memory-match'
  | 'dice-duel';

export type ExtendedArcadeGameType =
  | 'pixel-guess'
  | 'emoji-charades'
  | 'nim'
  | 'misere-nim'
  | 'chomp'
  | 'hex'
  | 'grid-link-4'
  | 'order-chaos'
  | 'misere-ttt'
  | 'gravity-5'
  | 'snort'
  | 'col-clash'
  | 'domineering'
  | 'cram'
  | 'obstruction'
  | 'ataxx'
  | 'breakthrough'
  | 'kings-escape'
  | 'wordle-duel'
  | 'hangman-duel'
  | 'mastermind'
  | 'hilo-target'
  | 'word-chain'
  | 'blackjack-21'
  | 'yacht-dice'
  | 'tug-of-war'
  | 'rps-arena'
  | 'penalty-kick'
  | 'mines-duel'
  | 'sos-grid';

export type ArcadeGameType = BaseArcadeGameType | ExtendedArcadeGameType | Batch2ArcadeGameType;
export type ArcadePlayer = 'p1' | 'p2';
export type ArcadeWinner = ArcadePlayer | 'draw' | null;
export type ArcadeBotDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type ArcadeGameCategory =
  | 'Drawing & Creative'
  | 'Strategy'
  | 'Territory & Pawns'
  | 'Word & Code'
  | 'Dice & Duel';

export interface ArcadeGameMeta {
  id: ArcadeGameType;
  name: string;
  tagline: string;
  emoji: string;
  avgTime: string;
  accentColor: string;
  category?: ArcadeGameCategory;
  rulesSummary: string;
  p1Label: string;
  p2Label: string;
}

export interface ArcadeBot {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  difficulty: ArcadeBotDifficulty;
  title: string;
  tagline: string;
  accentColor: string;
  voicelines: {
    start: string[];
    bonus: string[];
    win: string[];
    lose: string[];
  };
}

// ---------------- WORD / ART / CARD CONSTANTS ----------------

export const PIXEL_DRAW_COLORS = [
  '#0f172a', // 0: empty / erase
  '#f8fafc', // 1: white
  '#ef4444', // 2: red
  '#f97316', // 3: orange
  '#eab308', // 4: yellow
  '#22c55e', // 5: green
  '#38bdf8', // 6: sky
  '#6366f1', // 7: indigo
  '#ec4899', // 8: pink
  '#a16207'  // 9: brown
];

export const PIXEL_WORD_BANK = [
  'heart', 'tree', 'house', 'sun', 'star', 'rocket',
  'melon', 'cat', 'fish', 'crown', 'ghost', 'sword',
  'flower', 'apple', 'cup', 'robot', 'smile', 'duck'
];

export const EMOJI_CHARADES_LIST: { answer: string; sample: string[] }[] = [
  { answer: 'pizza party', sample: ['🍕', '🎉', '🎈'] },
  { answer: 'space rocket', sample: ['🚀', '🌙', '⭐'] },
  { answer: 'soccer goal', sample: ['⚽', '🥅', '🏆'] },
  { answer: 'snow day', sample: ['❄️', '⛄', '🧣'] },
  { answer: 'beach vacation', sample: ['🏖️', '☀️', '🌊'] },
  { answer: 'movie night', sample: ['🎬', '🍿', '🛋️'] },
  { answer: 'birthday cake', sample: ['🎂', '🕯️', '🎁'] },
  { answer: 'rainbow storm', sample: ['⛈️', '🌧️', '🌈'] },
  { answer: 'treasure island', sample: ['🏴‍☠️', '🏝️', '💎'] },
  { answer: 'camp fire', sample: ['⛺', '🔥', '🌲'] },
  { answer: 'ice cream', sample: ['🍦', '🍓', '😋'] },
  { answer: 'video game', sample: ['🎮', '🕹️', '👾'] },
  { answer: 'music concert', sample: ['🎸', '🎤', '🎵'] },
  { answer: 'fast car', sample: ['🏎️', '💨', '🏁'] },
  { answer: 'haunted house', sample: ['👻', '🏚️', '🦇'] },
  { answer: 'breakfast time', sample: ['🥞', '🥓', '☕'] },
  { answer: 'basketball dunk', sample: ['🏀', '🔥', '🏅'] },
  { answer: 'ocean shark', sample: ['🌊', '🦈', '🐠'] }
];

export const EMOJI_PALETTE = [
  '🍕', '🎉', '🚀', '🌙', '⭐', '⚽', '🥅', '🏆',
  '❄️', '⛄', '🏖️', '☀️', '🌊', '🎬', '🍿', '🎂',
  '🎁', '⛈️', '🌈', '🏴‍☠️', '🏝️', '💎', '⛺', '🔥',
  '🌲', '🍦', '🍓', '🎮', '🕹️', '👾', '🎸', '🎤',
  '🎵', '🏎️', '💨', '🏁', '👻', '🏚️', '🦇', '🥞',
  '☕', '🏀', '🦈', '🐠', '🍎', '🍉', '👑', '❤️'
];

export const WORDLE_5_WORDS = [
  'apple', 'brain', 'chair', 'cloud', 'crane', 'dream', 'earth', 'flame',
  'ghost', 'grape', 'house', 'juice', 'light', 'magic', 'melon', 'music',
  'night', 'ocean', 'paint', 'party', 'piano', 'pizza', 'plant', 'power',
  'queen', 'river', 'robot', 'shark', 'smile', 'snake', 'solar', 'space',
  'spark', 'stone', 'storm', 'sugar', 'sunny', 'sword', 'table', 'tiger',
  'train', 'water', 'whale', 'world', 'zebra'
];

export const HANGMAN_WORDS = [
  'watermelon', 'astronaut', 'basketball', 'pineapple', 'chocolate',
  'dragonfly', 'mountain', 'submarine', 'skateboard', 'butterfly',
  'controller', 'lightning', 'headphones', 'microscope', 'skyscraper',
  'volleyball', 'penguin', 'treasure', 'fireplace', 'compass',
  'tornado', 'backpack', 'pyramid', 'dolphin'
];

export const MASTERMIND_COLORS = [
  { id: 0, name: 'Red', hex: '#ef4444' },
  { id: 1, name: 'Amber', hex: '#f59e0b' },
  { id: 2, name: 'Emerald', hex: '#10b981' },
  { id: 3, name: 'Sky', hex: '#0ea5e9' },
  { id: 4, name: 'Violet', hex: '#8b5cf6' },
  { id: 5, name: 'Pink', hex: '#ec4899' }
];

export const WORD_CHAIN_SEEDS = [
  'apple', 'tiger', 'robot', 'planet', 'ocean', 'melon', 'spark', 'guitar', 'rocket', 'castle'
];

export const WORD_CHAIN_BOT_DICT: Record<string, string[]> = {
  a: ['apple', 'acorn', 'anchor', 'avocado', 'aurora', 'atlas', 'amber', 'arrow'],
  b: ['banana', 'beacon', 'blossom', 'breeze', 'bridge', 'bronze', 'bubble', 'butter'],
  c: ['castle', 'cactus', 'canyon', 'candle', 'comet', 'copper', 'coral', 'crystal'],
  d: ['dragon', 'diamond', 'dolphin', 'desert', 'daisy', 'domino', 'drifter', 'dusk'],
  e: ['eagle', 'ember', 'emerald', 'echo', 'engine', 'energy', 'eclipse', 'elm'],
  f: ['flame', 'falcon', 'forest', 'fossil', 'fountain', 'frost', 'fruit', 'feather'],
  g: ['guitar', 'galaxy', 'garden', 'glacier', 'golden', 'grape', 'griffin', 'gravity'],
  h: ['harbor', 'horizon', 'honey', 'hammer', 'harvest', 'helmet', 'hazel', 'hydra'],
  i: ['island', 'icicle', 'ignite', 'indigo', 'ivory', 'iris', 'impact', 'igloo'],
  j: ['jungle', 'jasper', 'jester', 'jigsaw', 'journey', 'jupiter', 'jewel', 'juniper'],
  k: ['kangaroo', 'kayak', 'kettle', 'kingdom', 'kite', 'knight', 'koala', 'krypton'],
  l: ['lantern', 'lemon', 'leopard', 'lightning', 'lotus', 'lunar', 'lagoon', 'lapis'],
  m: ['melon', 'mango', 'marble', 'meadow', 'meteor', 'mirror', 'mountain', 'mystic'],
  n: ['nectar', 'neon', 'night', 'ninja', 'notebook', 'nebula', 'north', 'nugget'],
  o: ['ocean', 'olive', 'opal', 'orange', 'orbit', 'orchid', 'otter', 'oasis'],
  p: ['planet', 'panda', 'peach', 'pebble', 'penguin', 'phoenix', 'piano', 'prism'],
  q: ['quartz', 'queen', 'quest', 'quiver', 'quokka', 'quasar', 'quiet', 'quill'],
  r: ['robot', 'rocket', 'rainbow', 'river', 'ruby', 'radar', 'raven', 'ripple'],
  s: ['spark', 'safari', 'sapphire', 'shadow', 'silver', 'solar', 'starlight', 'storm'],
  t: ['tiger', 'temple', 'thunder', 'topaz', 'tornado', 'tower', 'treasure', 'tulip'],
  u: ['umbrella', 'unicorn', 'union', 'uplift', 'uranium', 'urban', 'utopia', 'ultraviolet'],
  v: ['valley', 'velvet', 'venus', 'vertex', 'violet', 'volcano', 'vortex', 'voyage'],
  w: ['whale', 'walnut', 'waterfall', 'whisper', 'willow', 'winter', 'wizard', 'wonder'],
  x: ['xenon', 'xylem', 'xylophone', 'xerox', 'xenia', 'xeric'],
  y: ['yellow', 'yacht', 'yonder', 'yogurt', 'yarrow', 'yeast', 'young', 'yucca'],
  z: ['zebra', 'zenith', 'zephyr', 'zero', 'zigzag', 'zinc', 'zodiac', 'zombie']
};

// ---------------- 30 EXTENDED STATE DEFINITIONS ----------------

export interface PixelGuessState {
  gameType: 'pixel-guess';
  round: number;
  maxRounds: number;
  phase: 'pick' | 'draw' | 'guess';
  drawer: ArcadePlayer;
  guesser: ArcadePlayer;
  turn: ArcadePlayer;
  wordChoices: string[];
  word: string | null;
  grid: number[]; // 10x10 = 100 color indices
  guesses: { text: string; hit: boolean; hint?: string }[];
  scores: { p1: number; p2: number };
  lastRoundResult: { round: number; word: string; guessed: boolean; points: number } | null;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface EmojiCharadesState {
  gameType: 'emoji-charades';
  round: number;
  maxRounds: number;
  phase: 'pick' | 'clue' | 'guess';
  sender: ArcadePlayer;
  guesser: ArcadePlayer;
  turn: ArcadePlayer;
  promptChoices: string[];
  secret: string | null;
  emojis: string[];
  guesses: { text: string; hit: boolean; hint?: string }[];
  scores: { p1: number; p2: number };
  lastRoundResult: { round: number; secret: string; guessed: boolean; points: number } | null;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface NimState {
  gameType: 'nim';
  heaps: number[]; // [1, 3, 5, 7]
  turn: ArcadePlayer;
  lastTake: { heap: number; count: number; by: ArcadePlayer } | null;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface MisereNimState {
  gameType: 'misere-nim';
  heaps: number[]; // [1, 3, 5, 7]
  turn: ArcadePlayer;
  lastTake: { heap: number; count: number; by: ArcadePlayer } | null;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface ChompState {
  gameType: 'chomp';
  rows: number;
  cols: number;
  eaten: boolean[][]; // 5 x 6
  lastBite: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface HexState {
  gameType: 'hex';
  size: number; // 7
  board: (ArcadePlayer | null)[][]; // 7x7, p1 links left-right, p2 links top-bottom
  lastCell: [number, number] | null;
  winPath: [number, number][] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface GridLink4State {
  gameType: 'grid-link-4';
  board: (ArcadePlayer | null)[]; // 16 cells (4x4)
  winLine: number[] | null;
  lastCell: number | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface OrderChaosState {
  gameType: 'order-chaos';
  // p1 = Order (make 5 in a row of either X or O), p2 = Chaos (prevent 5 in a row)
  board: ('X' | 'O' | null)[][]; // 6x6
  winLine: [number, number][] | null;
  lastCell: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface MisereTTTState {
  gameType: 'misere-ttt';
  board: (ArcadePlayer | null)[]; // 9 cells
  loseLine: number[] | null;
  lastCell: number | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface Gravity5State {
  gameType: 'gravity-5';
  board: (ArcadePlayer | null)[][]; // 7 rows x 9 cols
  winLine: [number, number][] | null;
  lastCell: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface SnortState {
  gameType: 'snort';
  board: (ArcadePlayer | null)[][]; // 5x5
  lastCell: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface ColClashState {
  gameType: 'col-clash';
  board: (ArcadePlayer | null)[][]; // 5x5
  lastCell: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface DomineeringState {
  gameType: 'domineering';
  board: (ArcadePlayer | null)[][]; // 6x6, p1 = vertical, p2 = horizontal
  lastDomino: [[number, number], [number, number]] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface CramState {
  gameType: 'cram';
  board: (ArcadePlayer | null)[][]; // 6x6, either player places H or V domino
  lastDomino: [[number, number], [number, number]] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface ObstructionState {
  gameType: 'obstruction';
  board: (ArcadePlayer | 'blocked' | null)[][]; // 6x6
  lastCell: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface AtaxxState {
  gameType: 'ataxx';
  board: (ArcadePlayer | null)[][]; // 6x6
  counts: { p1: number; p2: number };
  lastMove: [[number, number], [number, number]] | null;
  passedLastTurn: boolean;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface BreakthroughState {
  gameType: 'breakthrough';
  board: (ArcadePlayer | null)[][]; // 6x6, p1 bottom (rows 4,5 -> 0), p2 top (rows 0,1 -> 5)
  lastMove: [[number, number], [number, number]] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface KingsEscapeState {
  gameType: 'kings-escape';
  // p1 = Runner King at [kr, kc] starting top center trying to reach row 5
  // p2 = 4 Chasers starting near bottom moving diagonally up/down? Better: King starts (0,2) tries to reach row 5, Chasers start on row 5 (5,0),(5,2),(5,4) + (4,1) and move 1 diag up-left/up-right!
  king: [number, number];
  chasers: [number, number][];
  lastEvent: string | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface WordleDuelState {
  gameType: 'wordle-duel';
  round: number; // 1 or 2
  setter: ArcadePlayer;
  guesser: ArcadePlayer;
  phase: 'set' | 'guess';
  secret: string | null;
  guesses: { word: string; marks: ('correct' | 'present' | 'absent')[] }[];
  roundScores: { p1: number | null; p2: number | null }; // guesses used (7 = failed)
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface HangmanDuelState {
  gameType: 'hangman-duel';
  round: number;
  maxRounds: number;
  setter: ArcadePlayer;
  guesser: ArcadePlayer;
  phase: 'set' | 'guess';
  secret: string | null;
  guessedLetters: string[];
  misses: number;
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface MastermindState {
  gameType: 'mastermind';
  round: number; // 1 or 2
  setter: ArcadePlayer;
  breaker: ArcadePlayer;
  phase: 'set' | 'guess';
  secret: number[] | null; // length 4, values 0..5
  rows: { code: number[]; exact: number; close: number }[];
  scores: { p1: number | null; p2: number | null }; // attempts used (9 = fail)
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface HiLoTargetState {
  gameType: 'hilo-target';
  target: number; // 1..100 seeded on move 0
  lowBound: number;
  highBound: number;
  history: { by: ArcadePlayer; guess: number; hint: 'higher' | 'lower' | 'exact' }[];
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface WordChainState {
  gameType: 'word-chain';
  words: { word: string; by: ArcadePlayer; pts: number }[];
  requiredLetter: string;
  scores: { p1: number; p2: number };
  maxTurns: number;
  lastError: string | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface Blackjack21State {
  gameType: 'blackjack-21';
  round: number;
  maxRounds: number;
  deck: number[]; // values 0..51
  deckPos: number;
  hands: { p1: number[]; p2: number[] };
  stood: { p1: boolean; p2: boolean };
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface YachtDiceState {
  gameType: 'yacht-dice';
  round: number; // 1..5
  dice: number[]; // length 5
  held: boolean[]; // length 5
  rollsLeft: number; // 0..3 (starts 3 each turn)
  usedCats: {
    p1: Partial<Record<'pair' | 'trips' | 'full' | 'straight' | 'yacht', number>>;
    p2: Partial<Record<'pair' | 'trips' | 'full' | 'straight' | 'yacht', number>>;
  };
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface TugOfWarState {
  gameType: 'tug-of-war';
  round: number; // 1..9
  ropePos: number; // -3 (p1 wins) to +3 (p2 wins)
  energy: { p1: number; p2: number };
  pendingP1Bid: number | null;
  lastRound: { round: number; p1Bid: number; p2Bid: number; winner: ArcadePlayer | 'draw' } | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export type RpsChoice = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock';

export interface RpsArenaState {
  gameType: 'rps-arena';
  round: number;
  maxRounds: number;
  pendingP1: RpsChoice | null;
  scores: { p1: number; p2: number };
  lastRound: { p1: RpsChoice; p2: RpsChoice; winner: ArcadePlayer | 'draw'; note: string } | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface PenaltyKickState {
  gameType: 'penalty-kick';
  kickNumber: number; // 1..10 (5 each)
  shooter: ArcadePlayer;
  keeper: ArcadePlayer;
  pendingShot: number | null; // zone 0..4 (TL, TC, TR, BL, BR)
  scores: { p1: number; p2: number };
  history: { shooter: ArcadePlayer; shot: number; dive: number; goal: boolean }[];
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface MinesDuelState {
  gameType: 'mines-duel';
  size: number; // 6
  mines: boolean[]; // length 36, 11 mines
  revealedBy: (ArcadePlayer | null)[]; // length 36
  adjCounts: number[]; // length 36
  scores: { p1: number; p2: number };
  targetFlags: number; // 6
  lastCell: number | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export interface SosGridState {
  gameType: 'sos-grid';
  board: ('S' | 'O' | null)[][]; // 5x5
  scores: { p1: number; p2: number };
  completedLines: [number, number][][];
  lastCell: [number, number] | null;
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  moveCount: number;
}

export type ExtendedArcadeState =
  | PixelGuessState
  | EmojiCharadesState
  | NimState
  | MisereNimState
  | ChompState
  | HexState
  | GridLink4State
  | OrderChaosState
  | MisereTTTState
  | Gravity5State
  | SnortState
  | ColClashState
  | DomineeringState
  | CramState
  | ObstructionState
  | AtaxxState
  | BreakthroughState
  | KingsEscapeState
  | WordleDuelState
  | HangmanDuelState
  | MastermindState
  | HiLoTargetState
  | WordChainState
  | Blackjack21State
  | YachtDiceState
  | TugOfWarState
  | RpsArenaState
  | PenaltyKickState
  | MinesDuelState
  | SosGridState;

export const EXTENDED_ARCADE_GAMES: ArcadeGameMeta[] = [
  {
    id: 'pixel-guess',
    name: 'Pixel Pictionary',
    tagline: 'Paint 10×10 pixel art & guess the clue',
    emoji: '🖌️',
    avgTime: '3 min',
    accentColor: '#f43f5e',
    category: 'Drawing & Creative',
    rulesSummary: '6 rounds of crisp pixel painting! Pick a word, paint it on the 10×10 canvas, and send it for your opponent to guess.',
    p1Label: 'Pixel P1',
    p2Label: 'Pixel P2'
  },
  {
    id: 'emoji-charades',
    name: 'Emoji Charades',
    tagline: 'Describe secret phrases using only emojis',
    emoji: '😎',
    avgTime: '3 min',
    accentColor: '#facc15',
    category: 'Drawing & Creative',
    rulesSummary: 'Pick a secret phrase, build an emoji clue sequence (up to 6 emojis), and challenge your friend to guess it in 3 tries.',
    p1Label: 'Sender 1',
    p2Label: 'Sender 2'
  },
  {
    id: 'nim',
    name: 'Nim Stones',
    tagline: 'Classic 4-row pyramid — take last stone',
    emoji: '🪨',
    avgTime: '2 min',
    accentColor: '#f59e0b',
    category: 'Strategy',
    rulesSummary: 'Take 1 or more stones from any single row on your turn. The player who takes the very last stone wins!',
    p1Label: 'Player 1',
    p2Label: 'Player 2'
  },
  {
    id: 'misere-nim',
    name: 'Poison Last (Nim)',
    tagline: 'Force your opponent to take the final stone',
    emoji: '☠️',
    avgTime: '2 min',
    accentColor: '#a855f7',
    category: 'Strategy',
    rulesSummary: 'Just like Nim, take any stones from one row — except whoever is forced to take the last stone LOSES!',
    p1Label: 'Player 1',
    p2Label: 'Player 2'
  },
  {
    id: 'chomp',
    name: 'Chomp Chocolate',
    tagline: 'Bite squares, avoid the poisoned top-left piece',
    emoji: '🍫',
    avgTime: '2 min',
    accentColor: '#d97706',
    category: 'Strategy',
    rulesSummary: 'Click any piece of chocolate to eat it and everything below & right of it. Eating the top-left chili piece loses!',
    p1Label: 'Taster 1',
    p2Label: 'Taster 2'
  },
  {
    id: 'hex',
    name: 'Hex Bridge',
    tagline: '7×7 honeycomb connection — zero draws possible',
    emoji: '⬡',
    avgTime: '4 min',
    accentColor: '#38bdf8',
    category: 'Strategy',
    rulesSummary: 'Player 1 connects Left-to-Right; Player 2 connects Top-to-Bottom across the 7×7 hex grid. First unbroken bridge wins!',
    p1Label: 'Left↔Right',
    p2Label: 'Top↕Bottom'
  },
  {
    id: 'grid-link-4',
    name: '4×4 Grid Link',
    tagline: 'Connect 4 in a line OR a 2×2 square',
    emoji: '💠',
    avgTime: '2 min',
    accentColor: '#06b6d4',
    category: 'Strategy',
    rulesSummary: 'Fast tactical 4×4 duel: win by forming 4-in-a-row horizontally, vertically, diagonally, OR claiming any 2×2 block!',
    p1Label: 'Cyan',
    p2Label: 'Rose'
  },
  {
    id: 'order-chaos',
    name: 'Order & Chaos',
    tagline: 'Place X or O — create 5-in-a-row vs block it',
    emoji: '⚖️',
    avgTime: '4 min',
    accentColor: '#8b5cf6',
    category: 'Strategy',
    rulesSummary: 'Either player may place X OR O! Order (P1) wins by making any 5-in-a-row; Chaos (P2) wins if the 6×6 fills without 5.',
    p1Label: 'Order',
    p2Label: 'Chaos'
  },
  {
    id: 'misere-ttt',
    name: 'Reverse Tic-Tac-Toe',
    tagline: 'Do NOT make 3 in a row of your mark!',
    emoji: '🚫',
    avgTime: '1 min',
    accentColor: '#fb7185',
    category: 'Strategy',
    rulesSummary: 'Twisted 3×3 rules: if you complete 3-in-a-row of your own mark, you LOSE immediately! Fill the board safely to draw.',
    p1Label: 'X',
    p2Label: 'O'
  },
  {
    id: 'gravity-5',
    name: 'Gravity 5 (9×7)',
    tagline: 'Mega 9-column drop rack — connect 5 discs',
    emoji: '🟣',
    avgTime: '4 min',
    accentColor: '#c084fc',
    category: 'Strategy',
    rulesSummary: 'Expanded 9×7 gravity drop board. First player to link 5 discs horizontally, vertically, or diagonally wins!',
    p1Label: 'Purple',
    p2Label: 'Gold'
  },
  {
    id: 'snort',
    name: 'Fence Off (Snort)',
    tagline: 'Never touch an enemy neighbor tile — last move wins',
    emoji: '🚧',
    avgTime: '3 min',
    accentColor: '#ef4444',
    category: 'Territory & Pawns',
    rulesSummary: 'Claim open tiles on a 5×5 map, but you cannot place orthogonally next to an opponent tile. Last legal move wins!',
    p1Label: 'Red',
    p2Label: 'Blue'
  },
  {
    id: 'col-clash',
    name: 'Color Clash (Col)',
    tagline: 'Never place next to your own color',
    emoji: '🎭',
    avgTime: '3 min',
    accentColor: '#14b8a6',
    category: 'Territory & Pawns',
    rulesSummary: 'Map-coloring duel on a 5×5 grid: you cannot place orthogonally adjacent to your OWN color! Last legal move wins.',
    p1Label: 'Teal',
    p2Label: 'Amber'
  },
  {
    id: 'domineering',
    name: 'Domineering',
    tagline: 'Vertical vs Horizontal 2×1 dominoes on 6×6',
    emoji: '🁣',
    avgTime: '3 min',
    accentColor: '#3b82f6',
    category: 'Territory & Pawns',
    rulesSummary: 'P1 places Vertical 2×1 dominoes; P2 places Horizontal 1×2 dominoes on the 6×6 grid. First player out of space loses!',
    p1Label: 'Vertical',
    p2Label: 'Horizontal'
  },
  {
    id: 'cram',
    name: 'Cram Dominoes',
    tagline: 'Pack horizontal or vertical dominoes — last move wins',
    emoji: '🧱',
    avgTime: '3 min',
    accentColor: '#f97316',
    category: 'Territory & Pawns',
    rulesSummary: 'Either player can place a 2×1 OR 1×2 domino anywhere open on the 6×6 board. Last player able to fit a domino wins!',
    p1Label: 'Player 1',
    p2Label: 'Player 2'
  },
  {
    id: 'obstruction',
    name: 'Blockade',
    tagline: 'Each piece locks all 8 surrounding cells',
    emoji: '🛑',
    avgTime: '2 min',
    accentColor: '#f43f5e',
    category: 'Territory & Pawns',
    rulesSummary: 'Claim any open square on the 6×6 grid — it immediately blocks all 8 surrounding squares. Last valid move wins!',
    p1Label: 'P1 Guard',
    p2Label: 'P2 Guard'
  },
  {
    id: 'ataxx',
    name: 'Hexa-Clone',
    tagline: 'Clone nearby or leap 2 squares to infect rivals',
    emoji: '🦠',
    avgTime: '4 min',
    accentColor: '#22c55e',
    category: 'Territory & Pawns',
    rulesSummary: 'Move 1 step to clone your slime, or jump 2 steps to relocate. Landing converts all adjacent enemy slimes to yours!',
    p1Label: 'Emerald',
    p2Label: 'Violet'
  },
  {
    id: 'breakthrough',
    name: 'Breakthrough Pawns',
    tagline: '6×6 pawn rush — reach the enemy back row',
    emoji: '⚔️',
    avgTime: '4 min',
    accentColor: '#eab308',
    category: 'Territory & Pawns',
    rulesSummary: 'Advance pawns straight or diagonally forward 1 square; capture diagonally. First pawn to reach the opposite row wins!',
    p1Label: 'Gold',
    p2Label: 'Crimson'
  },
  {
    id: 'kings-escape',
    name: 'King’s Escape',
    tagline: 'Asymmetric chase — 1 King vs 4 Blockers',
    emoji: '👑',
    avgTime: '3 min',
    accentColor: '#fbbf24',
    category: 'Territory & Pawns',
    rulesSummary: 'P1’s King moves any direction 1 step trying to reach the bottom rank. P2’s 4 Blockers advance diagonally up to trap it!',
    p1Label: 'The King',
    p2Label: 'Blockers'
  },
  {
    id: 'wordle-duel',
    name: 'Wordle Duel',
    tagline: '2-round 5-letter secret word head-to-head',
    emoji: '🟩',
    avgTime: '4 min',
    accentColor: '#10b981',
    category: 'Word & Code',
    rulesSummary: 'Pick or auto-generate a 5-letter word, then swap roles! Solve in fewer guesses (green/yellow tiles) to win the match.',
    p1Label: 'Wordsmith 1',
    p2Label: 'Wordsmith 2'
  },
  {
    id: 'hangman-duel',
    name: 'Hangman Duel',
    tagline: '4 rounds of secret words & 6-miss gallows',
    emoji: '🔤',
    avgTime: '3 min',
    accentColor: '#60a5fa',
    category: 'Word & Code',
    rulesSummary: 'Set or roll a secret word, then guess letters A–Z before 6 misses! Earn points per solved round.',
    p1Label: 'Player 1',
    p2Label: 'Player 2'
  },
  {
    id: 'mastermind',
    name: 'Codebreaker',
    tagline: 'Crack the hidden 4-color cipher in 8 tries',
    emoji: '🔐',
    avgTime: '4 min',
    accentColor: '#818cf8',
    category: 'Word & Code',
    rulesSummary: '2 rounds: set or roll a 4-peg secret code, then deduce it using exact (⚫) and right-color (⚪) clues!',
    p1Label: 'Cipher P1',
    p2Label: 'Cipher P2'
  },
  {
    id: 'hilo-target',
    name: 'Hi-Lo Target (1–100)',
    tagline: 'Zero in on the mystery number first',
    emoji: '🎯',
    avgTime: '1 min',
    accentColor: '#f97316',
    category: 'Word & Code',
    rulesSummary: 'Alternating guesses between narrowed Lower/Higher bounds toward a hidden 1–100 target. First player to hit exact wins!',
    p1Label: 'Guesser 1',
    p2Label: 'Guesser 2'
  },
  {
    id: 'word-chain',
    name: 'Word Chain Rally',
    tagline: 'Start your word with the previous word’s last letter',
    emoji: '🔗',
    avgTime: '3 min',
    accentColor: '#2dd4bf',
    category: 'Word & Code',
    rulesSummary: '12-turn word rally! Play a valid 3+ letter English word beginning with the required letter — longer words earn higher points.',
    p1Label: 'Chain P1',
    p2Label: 'Chain P2'
  },
  {
    id: 'blackjack-21',
    name: 'Blackjack 21 Duel',
    tagline: 'Hit or Stand to 21 — Best of 5 hands',
    emoji: '🂡',
    avgTime: '3 min',
    accentColor: '#16a34a',
    category: 'Dice & Duel',
    rulesSummary: 'Hit for another card or Stand to lock your total. Closest to 21 without busting wins each hand (Best of 5)!',
    p1Label: 'Seat 1',
    p2Label: 'Seat 2'
  },
  {
    id: 'yacht-dice',
    name: 'Mini Yacht',
    tagline: 'Roll 5 dice, lock keepers & score combos',
    emoji: '🎲',
    avgTime: '4 min',
    accentColor: '#f59e0b',
    category: 'Dice & Duel',
    rulesSummary: 'Up to 3 rolls per turn! Lock favorite dice and bank into Pair, Trips, Full House, Straight, or Yacht over 5 rounds.',
    p1Label: 'Roller 1',
    p2Label: 'Roller 2'
  },
  {
    id: 'tug-of-war',
    name: 'Tug of War Bid',
    tagline: 'Spend 30 Energy wisely across rope rounds',
    emoji: '🪢',
    avgTime: '2 min',
    accentColor: '#ea580c',
    category: 'Dice & Duel',
    rulesSummary: 'Both sides start with 30 Energy and bid 1–6 per pull. Higher bid pulls the rope! Reach +3 pull or win after 9 rounds.',
    p1Label: 'Left Pull',
    p2Label: 'Right Pull'
  },
  {
    id: 'rps-arena',
    name: 'RPS-5 Arena',
    tagline: 'Rock Paper Scissors Lizard Spock (Best of 7)',
    emoji: '✌️',
    avgTime: '2 min',
    accentColor: '#ec4899',
    category: 'Dice & Duel',
    rulesSummary: 'Hidden picks revealed after both players lock in! First to 4 round wins (Best of 7) claims the arena crown.',
    p1Label: 'Fighter 1',
    p2Label: 'Fighter 2'
  },
  {
    id: 'penalty-kick',
    name: 'Penalty Shootout',
    tagline: '5-round keeper vs shooter soccer duel',
    emoji: '🥅',
    avgTime: '2 min',
    accentColor: '#22c55e',
    category: 'Dice & Duel',
    rulesSummary: 'Alternate taking penalty kicks and diving as goalkeeper across 5 goal zones! Most goals after 5 kicks each wins.',
    p1Label: 'Team 1',
    p2Label: 'Team 2'
  },
  {
    id: 'mines-duel',
    name: 'Minefield Hunter',
    tagline: 'Find 6 hidden mines before your opponent does',
    emoji: '💣',
    avgTime: '3 min',
    accentColor: '#f43f5e',
    category: 'Dice & Duel',
    rulesSummary: 'Competitive 6×6 Minesweeper! Use number clues to locate hidden mines — uncovering a mine scores +1 Flag and a free turn!',
    p1Label: 'Sweeper 1',
    p2Label: 'Sweeper 2'
  },
  {
    id: 'sos-grid',
    name: 'SOS 5×5',
    tagline: 'Place S or O — complete S-O-S for bonus turns',
    emoji: '🆘',
    avgTime: '3 min',
    accentColor: '#38bdf8',
    category: 'Word & Code',
    rulesSummary: 'Choose S or O on any open square of the 5×5 grid. Every S-O-S line formed scores +1 point and grants another turn!',
    p1Label: 'Player 1',
    p2Label: 'Player 2'
  }
];
