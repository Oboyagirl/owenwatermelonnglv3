export type Batch2ArcadeGameType =
  | 'symmetry-art'
  | 'color-match'
  | 'emoji-story'
  | 'quoridor'
  | 'pente'
  | 'nine-mens-morris'
  | 'santorini-lite'
  | 'fox-and-hounds'
  | 'isola'
  | 'tak-duel'
  | 'go-mini'
  | 'amazons-mini'
  | 'tron-turn'
  | 'shogi-pocket'
  | 'gobblet-mini'
  | 'splatter-turf'
  | 'knight-duel'
  | 'anagram-scramble'
  | 'trivia-showdown'
  | 'math-blitz'
  | 'simon-duel'
  | 'boggle-duel'
  | 'sudoku-duel'
  | 'uno-duel'
  | 'go-fish'
  | 'poker-dice'
  | 'liars-dice'
  | 'farkle-duel'
  | 'coin-row'
  | 'high-noon-duel';

export type Batch2Player = 'p1' | 'p2';
export type Batch2Winner = Batch2Player | 'draw' | null;
export type Batch2Category =
  | 'Drawing & Creative'
  | 'Strategy'
  | 'Territory & Pawns'
  | 'Word & Code'
  | 'Dice & Duel';

export interface Batch2GameMeta {
  id: Batch2ArcadeGameType;
  name: string;
  tagline: string;
  emoji: string;
  avgTime: string;
  accentColor: string;
  category: Batch2Category;
  rulesSummary: string;
  p1Label: string;
  p2Label: string;
}

// ---------------- BATCH 2 CURATED CONTENT & HELPERS ----------------

export const SYMMETRY_WORDS = [
  'butterfly',
  'crown',
  'rocket',
  'heart',
  'flower',
  'castle',
  'mask',
  'trophy',
  'diamond',
  'spaceship',
  'shield',
  'leaf'
];

// 8x8 color index templates (0 = empty, 1..9 match PIXEL_DRAW_COLORS)
export const SYMMETRY_BOT_TEMPLATES: Record<string, number[][]> = {
  butterfly: [
    [0, 8, 8, 0, 0, 8, 8, 0],
    [8, 6, 8, 1, 1, 8, 6, 8],
    [8, 4, 8, 1, 1, 8, 4, 8],
    [0, 8, 7, 1, 1, 7, 8, 0],
    [0, 7, 7, 1, 1, 7, 7, 0],
    [8, 4, 7, 1, 1, 7, 4, 8],
    [8, 8, 0, 1, 1, 0, 8, 8],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  crown: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [4, 0, 0, 4, 4, 0, 0, 4],
    [4, 4, 0, 4, 4, 0, 4, 4],
    [4, 2, 4, 6, 6, 4, 2, 4],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  rocket: [
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 2, 1, 1, 2, 0, 0],
    [0, 0, 1, 6, 6, 1, 0, 0],
    [0, 0, 1, 6, 6, 1, 0, 0],
    [0, 2, 1, 1, 1, 1, 2, 0],
    [2, 2, 1, 1, 1, 1, 2, 2],
    [0, 0, 3, 4, 4, 3, 0, 0],
    [0, 0, 4, 2, 2, 4, 0, 0]
  ],
  heart: [
    [0, 2, 2, 0, 0, 2, 2, 0],
    [2, 8, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  flower: [
    [0, 0, 8, 8, 8, 8, 0, 0],
    [0, 8, 8, 4, 4, 8, 8, 0],
    [0, 8, 4, 4, 4, 4, 8, 0],
    [0, 0, 8, 8, 8, 8, 0, 0],
    [0, 0, 0, 5, 5, 0, 0, 0],
    [0, 5, 0, 5, 5, 0, 5, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ],
  castle: [
    [7, 0, 7, 0, 0, 7, 0, 7],
    [7, 7, 7, 7, 7, 7, 7, 7],
    [0, 1, 6, 1, 1, 6, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 9, 9, 1, 1, 0],
    [0, 1, 1, 9, 9, 1, 1, 0],
    [5, 5, 5, 9, 9, 5, 5, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  mask: [
    [0, 7, 7, 7, 7, 7, 7, 0],
    [7, 7, 4, 7, 7, 4, 7, 7],
    [7, 0, 0, 7, 7, 0, 0, 7],
    [7, 0, 0, 7, 7, 0, 0, 7],
    [7, 7, 7, 7, 7, 7, 7, 7],
    [0, 7, 8, 7, 7, 8, 7, 0],
    [0, 0, 7, 7, 7, 7, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  trophy: [
    [4, 4, 4, 4, 4, 4, 4, 4],
    [4, 0, 4, 1, 4, 4, 0, 4],
    [4, 0, 4, 4, 4, 4, 0, 4],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 3, 3, 3, 3, 3, 3, 0]
  ],
  diamond: [
    [0, 0, 0, 6, 6, 0, 0, 0],
    [0, 0, 6, 1, 1, 6, 0, 0],
    [0, 6, 1, 6, 6, 1, 6, 0],
    [6, 1, 6, 6, 6, 6, 1, 6],
    [6, 6, 6, 6, 6, 6, 6, 6],
    [0, 6, 6, 6, 6, 6, 6, 0],
    [0, 0, 6, 6, 6, 6, 0, 0],
    [0, 0, 0, 6, 6, 0, 0, 0]
  ],
  spaceship: [
    [0, 0, 0, 6, 6, 0, 0, 0],
    [0, 0, 6, 1, 1, 6, 0, 0],
    [0, 1, 1, 6, 6, 1, 1, 0],
    [7, 7, 1, 1, 1, 1, 7, 7],
    [7, 4, 7, 7, 7, 7, 4, 7],
    [0, 0, 3, 0, 0, 3, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  shield: [
    [0, 6, 6, 6, 6, 6, 6, 0],
    [0, 6, 4, 6, 6, 4, 6, 0],
    [0, 6, 6, 4, 4, 6, 6, 0],
    [0, 6, 6, 4, 4, 6, 6, 0],
    [0, 6, 4, 6, 6, 4, 6, 0],
    [0, 0, 6, 6, 6, 6, 0, 0],
    [0, 0, 0, 6, 6, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  leaf: [
    [0, 0, 0, 5, 5, 0, 0, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 5, 5, 4, 4, 5, 5, 0],
    [0, 5, 5, 4, 4, 5, 5, 0],
    [0, 5, 5, 4, 4, 5, 5, 0],
    [0, 0, 5, 9, 9, 5, 0, 0],
    [0, 0, 0, 9, 9, 0, 0, 0],
    [0, 0, 0, 9, 9, 0, 0, 0]
  ]
};

export const EMOJI_STORY_LIST: { answer: string; panels: [string, string, string] }[] = [
  { answer: 'alien invasion', panels: ['🌙', '🛸', '👽'] },
  { answer: 'treasure hunt', panels: ['🗺️', '⛵', '💎'] },
  { answer: 'bank heist', panels: ['🕵️', '💰', '🚓'] },
  { answer: 'space rescue', panels: ['🚀', '☄️', '🧑‍🚀'] },
  { answer: 'dragon knight', panels: ['🛡️', '🐉', '🏆'] },
  { answer: 'chef disaster', panels: ['👨‍🍳', '🔥', '🍕'] },
  { answer: 'zombie apocalypse', panels: ['🏚️', '🧟', '🔦'] },
  { answer: 'time travel', panels: ['⏰', '⚡', '🦕'] },
  { answer: 'pirate battle', panels: ['🏴‍☠️', '💣', '🪙'] },
  { answer: 'ninja mission', panels: ['🥷', '🌙', '📜'] },
  { answer: 'robot uprising', panels: ['🤖', '⚡', '🏙️'] },
  { answer: 'magic school', panels: ['🧙', '🪄', '🦉'] },
  { answer: 'ocean storm', panels: ['⛵', '⛈️', '🏝️'] },
  { answer: 'haunted hotel', panels: ['🏨', '👻', '😱'] },
  { answer: 'snow rescue', panels: ['🏔️', '❄️', '🚁'] },
  { answer: 'cupid romance', panels: ['💘', '🌹', '💍'] }
];

export const STORY_EMOJI_PALETTE = [
  '🌙', '🛸', '👽', '🗺️', '⛵', '💎', '🕵️', '💰',
  '🚓', '🚀', '☄️', '🧑‍🚀', '🛡️', '🐉', '🏆', '👨‍🍳',
  '🔥', '🍕', '🏚️', '🧟', '🔦', '⏰', '⚡', '🦕',
  '🏴‍☠️', '💣', '🪙', '🥷', '📜', '🤖', '🏙️', '🧙',
  '🪄', '🦉', '⛈️', '🏝️', '🏨', '👻', '😱', '🏔️',
  '❄️', '🚁', '💘', '🌹', '💍', '👑', '🎉', '🌊'
];

// Nine Men's Morris 24-node adjacency & mill triples
export const NMM_ADJ: number[][] = [
  [1, 9],           // 0
  [0, 2, 4],        // 1
  [1, 14],          // 2
  [4, 10],          // 3
  [1, 3, 5, 7],     // 4
  [4, 13],          // 5
  [7, 11],          // 6
  [4, 6, 8],        // 7
  [7, 12],          // 8
  [0, 10, 21],      // 9
  [3, 9, 11, 18],   // 10
  [6, 10, 15],      // 11
  [8, 13, 17],      // 12
  [5, 12, 14, 20],  // 13
  [2, 13, 23],      // 14
  [11, 16],         // 15
  [15, 17, 19],     // 16
  [12, 16],         // 17
  [10, 19],         // 18
  [16, 18, 20, 22], // 19
  [13, 19],         // 20
  [9, 22],          // 21
  [19, 21, 23],     // 22
  [14, 22]          // 23
];

export const NMM_MILLS: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [9, 10, 11], [12, 13, 14],
  [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15],
  [1, 4, 7], [16, 19, 22],
  [8, 12, 17], [5, 13, 20], [2, 14, 23]
];

export const NMM_COORDS: [number, number][] = [
  [0, 0], [3, 0], [6, 0],
  [1, 1], [3, 1], [5, 1],
  [2, 2], [3, 2], [4, 2],
  [0, 3], [1, 3], [2, 3],
  [4, 3], [5, 3], [6, 3],
  [2, 4], [3, 4], [4, 4],
  [1, 5], [3, 5], [5, 5],
  [0, 6], [3, 6], [6, 6]
];

export const ANAGRAM_WORDS = [
  'PLANET', 'CASTLE', 'BRIDGE', 'ROCKET', 'ORANGE', 'SILVER',
  'JUNGLE', 'DRAGON', 'MIRROR', 'PUZZLE', 'PIRATE', 'CANDLE',
  'FOREST', 'GUITAR', 'KNIGHT', 'WINTER', 'SUMMER', 'GARDEN',
  'BOTTLE', 'CAMERA', 'FLIGHT', 'TROPHY', 'PENCIL', 'SHADOW',
  'ISLAND', 'HUNTER', 'SHIELD', 'GALAXY', 'MAGNET', 'STREAM'
];

export interface TriviaQuestion {
  q: string;
  options: [string, string, string, string];
  ans: number;
  tag: string;
}

export const TRIVIA_BANK: TriviaQuestion[] = [
  { q: 'Which planet in our solar system has the most moons?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], ans: 1, tag: 'Space' },
  { q: 'In Chess, which piece can only move diagonally?', options: ['Rook', 'Knight', 'Bishop', 'Queen'], ans: 2, tag: 'Games' },
  { q: 'What is the chemical symbol for Gold?', options: ['Gd', 'Go', 'Ag', 'Au'], ans: 3, tag: 'Science' },
  { q: 'Which ocean is the deepest on Earth?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], ans: 2, tag: 'Geography' },
  { q: 'How many sides does a standard dodecagon have?', options: ['10', '12', '14', '20'], ans: 1, tag: 'Math' },
  { q: 'Which video game character collects rings at supersonic speed?', options: ['Mario', 'Crash', 'Sonic', 'Kirby'], ans: 2, tag: 'Gaming' },
  { q: 'What gas makes up roughly 78% of Earth’s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Argon', 'Nitrogen'], ans: 3, tag: 'Science' },
  { q: 'In music, how many semitones are in one octave?', options: ['8', '10', '12', '16'], ans: 2, tag: 'Music' },
  { q: 'Which country is home to the ancient city of Petra?', options: ['Egypt', 'Jordan', 'Greece', 'Morocco'], ans: 1, tag: 'History' },
  { q: 'What is the only even prime number?', options: ['0', '2', '4', '6'], ans: 1, tag: 'Math' },
  { q: 'Which instrument has 88 keys on a standard concert model?', options: ['Harpsichord', 'Accordion', 'Piano', 'Organ'], ans: 2, tag: 'Music' },
  { q: 'Which element has atomic number 1?', options: ['Helium', 'Hydrogen', 'Lithium', 'Carbon'], ans: 1, tag: 'Science' },
  { q: 'How many squares are on a standard chessboard?', options: ['48', '56', '64', '72'], ans: 2, tag: 'Games' },
  { q: 'Which continent has the most countries?', options: ['Asia', 'Europe', 'South America', 'Africa'], ans: 3, tag: 'Geography' },
  { q: 'What speed of light vacuum constant is denoted by which letter?', options: ['v', 'c', 'k', 's'], ans: 1, tag: 'Physics' },
  { q: 'In bowling, what is three strikes in a row called?', options: ['Eagle', 'Hat Trick', 'Turkey', 'Triple Crown'], ans: 2, tag: 'Sports' },
  { q: 'Which programming language shares its name with an Indonesian island?', options: ['Python', 'Ruby', 'Java', 'Swift'], ans: 2, tag: 'Tech' },
  { q: 'What is the hardest naturally occurring mineral on Earth?', options: ['Quartz', 'Topaz', 'Ruby', 'Diamond'], ans: 3, tag: 'Science' },
  { q: 'Which Tetris piece is shaped like a 4-block straight line?', options: ['I-piece', 'T-piece', 'L-piece', 'O-piece'], ans: 0, tag: 'Gaming' },
  { q: 'Who painted The Starry Night?', options: ['Monet', 'Picasso', 'Van Gogh', 'Da Vinci'], ans: 2, tag: 'Art' },
  { q: 'How many players are on a standard soccer pitch for one team?', options: ['9', '10', '11', '12'], ans: 2, tag: 'Sports' },
  { q: 'Which mammal is capable of true sustained flight?', options: ['Flying Squirrel', 'Sugar Glider', 'Bat', 'Colugo'], ans: 2, tag: 'Nature' },
  { q: 'What is the capital city of Japan?', options: ['Kyoto', 'Osaka', 'Tokyo', 'Yokohama'], ans: 2, tag: 'Geography' },
  { q: 'How many bits make up one byte?', options: ['4', '8', '16', '32'], ans: 1, tag: 'Tech' },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Mercury', 'Jupiter'], ans: 1, tag: 'Space' },
  { q: 'In Uno, how many cards does a standard Draw Four force?', options: ['2', '3', '4', '6'], ans: 2, tag: 'Games' },
  { q: 'What is the square root of 144?', options: ['11', '12', '13', '14'], ans: 1, tag: 'Math' },
  { q: 'Which animal is featured on the World Wildlife Fund logo?', options: ['Tiger', 'Koala', 'Giant Panda', 'Polar Bear'], ans: 2, tag: 'Nature' }
];

export interface MathBlitzPuzzle {
  nums: [number, number, number];
  target: number;
  sample: string;
}

export const MATH_BLITZ_PUZZLES: MathBlitzPuzzle[] = [
  { nums: [4, 7, 2], target: 26, sample: '(4 × 7) - 2' },
  { nums: [6, 5, 3], target: 27, sample: '(6 × 5) - 3' },
  { nums: [8, 3, 4], target: 20, sample: '(8 × 3) - 4' },
  { nums: [5, 4, 3], target: 35, sample: '5 × (4 + 3)' },
  { nums: [9, 2, 7], target: 25, sample: '(9 × 2) + 7' },
  { nums: [7, 6, 4], target: 14, sample: '7 × (6 - 4)' },
  { nums: [3, 8, 5], target: 19, sample: '(3 × 8) - 5' },
  { nums: [6, 4, 2], target: 36, sample: '6 × (4 + 2)' },
  { nums: [9, 5, 2], target: 27, sample: '9 × (5 - 2)' },
  { nums: [4, 9, 6], target: 30, sample: '(4 × 9) - 6' },
  { nums: [7, 3, 5], target: 26, sample: '(7 × 3) + 5' },
  { nums: [8, 5, 2], target: 24, sample: '8 × (5 - 2)' },
  { nums: [6, 7, 9], target: 33, sample: '(6 × 7) - 9' },
  { nums: [5, 8, 3], target: 43, sample: '(5 × 8) + 3' },
  { nums: [9, 4, 5], target: 31, sample: '(9 × 4) - 5' },
  { nums: [3, 6, 7], target: 39, sample: '3 × (6 + 7)' },
  { nums: [8, 6, 5], target: 43, sample: '(8 × 6) - 5' },
  { nums: [7, 5, 4], target: 31, sample: '(7 × 5) - 4' },
  { nums: [4, 6, 3], target: 27, sample: '(4 × 6) + 3' },
  { nums: [5, 9, 7], target: 38, sample: '(5 × 9) - 7' }
];

export function evalMathBlitzOp(
  nums: [number, number, number],
  op1: '+' | '-' | '*',
  op2: '+' | '-' | '*',
  grp: 'L' | 'R'
): number {
  const apply = (x: number, op: '+' | '-' | '*', y: number): number =>
    op === '+' ? x + y : op === '-' ? x - y : x * y;
  if (grp === 'L') {
    return apply(apply(nums[0], op1, nums[1]), op2, nums[2]);
  }
  return apply(nums[0], op1, apply(nums[1], op2, nums[2]));
}

export interface BoggleBoardSpec {
  grid: string[]; // 16 uppercase letters
  words: string[]; // verified reachable 3+ letter words
}

export const BOGGLE_BOARDS: BoggleBoardSpec[] = [
  {
    grid: ['S', 'T', 'A', 'R', 'P', 'L', 'E', 'S', 'O', 'I', 'N', 'D', 'G', 'M', 'A', 'T'],
    words: [
      'STAR', 'STARE', 'STARS', 'TARE', 'TALE', 'TALES', 'PLATE', 'PLATES', 'LINE', 'LINES',
      'LATE', 'LATER', 'RATE', 'RATES', 'REAL', 'SEAT', 'SENT', 'SEND', 'MIND', 'MINDS',
      'MAT', 'MAN', 'MAIN', 'MAINS', 'SALE', 'SALT', 'LEND', 'LENDS', 'DEN', 'DENS',
      'TEN', 'TENS', 'NET', 'NETS', 'EAR', 'EARS', 'ERA', 'TAR', 'PIN', 'PINS',
      'PINE', 'PINES', 'SPIN', 'SPINE', 'END', 'ENDS', 'AND'
    ]
  },
  {
    grid: ['C', 'A', 'R', 'D', 'H', 'O', 'M', 'E', 'B', 'L', 'I', 'N', 'T', 'S', 'K', 'G'],
    words: [
      'CARD', 'CARE', 'CARED', 'HARD', 'HARM', 'HOME', 'COME', 'CHARM', 'LIME', 'LINE',
      'MINE', 'BLINK', 'LINK', 'LINKS', 'SINK', 'SKIN', 'KING', 'SING', 'SIN', 'KIN',
      'INK', 'MILK', 'SILK', 'SLIM', 'CAR', 'ARM', 'ARE', 'ERA', 'OAR'
    ]
  },
  {
    grid: ['F', 'I', 'R', 'E', 'W', 'A', 'T', 'S', 'N', 'O', 'L', 'D', 'P', 'U', 'C', 'K'],
    words: [
      'FIRE', 'FIRES', 'WIRE', 'WIRES', 'TIRE', 'TIRES', 'WATER', 'WATERS', 'WAIT', 'WAITS',
      'FAIR', 'FAIRS', 'RATE', 'RATES', 'LATE', 'FATE', 'STAR', 'STARE', 'WAR', 'WARS',
      'RAW', 'LAW', 'NOW', 'WON', 'OWN', 'LOW', 'SLOW', 'COLD', 'TOLD', 'OLD',
      'LUCK', 'PUCK', 'LOCK', 'STOCK', 'CUP', 'PUN', 'NOT', 'LOT', 'POT'
    ]
  },
  {
    grid: ['G', 'R', 'O', 'W', 'S', 'H', 'I', 'P', 'T', 'E', 'A', 'M', 'B', 'N', 'D', 'L'],
    words: [
      'GROW', 'SHOW', 'SHOP', 'SHIP', 'TEAM', 'STEAM', 'SEAM', 'BEST', 'NEST', 'HAND',
      'LAND', 'SEND', 'BEND', 'TEND', 'END', 'AND', 'ANT', 'ANTS', 'PANT', 'HIP',
      'RIP', 'HOP'
    ]
  }
];

export function canSpellBoggleWord(grid: string[], word: string): boolean {
  const clean = word.trim().toUpperCase();
  if (clean.length < 3 || clean.length > 16) return false;
  const visited = Array<boolean>(16).fill(false);

  const dfs = (idx: number, pos: number): boolean => {
    if (grid[idx] !== clean[pos]) return false;
    if (pos === clean.length - 1) return true;
    visited[idx] = true;
    const r = Math.floor(idx / 4);
    const c = idx % 4;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
          const nidx = nr * 4 + nc;
          if (!visited[nidx] && dfs(nidx, pos + 1)) {
            visited[idx] = false;
            return true;
          }
        }
      }
    }
    visited[idx] = false;
    return false;
  };

  for (let i = 0; i < 16; i++) {
    if (dfs(i, 0)) return true;
  }
  return false;
}

export const SUDOKU_4X4_BASES: { solution: number[][]; mask: boolean[][] }[] = [
  {
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1]
    ],
    mask: [
      [true, false, false, true],
      [false, true, true, false],
      [false, true, false, false],
      [true, false, true, false]
    ]
  },
  {
    solution: [
      [2, 4, 1, 3],
      [1, 3, 2, 4],
      [4, 2, 3, 1],
      [3, 1, 4, 2]
    ],
    mask: [
      [false, true, false, true],
      [true, false, false, false],
      [false, false, true, true],
      [true, false, false, false]
    ]
  },
  {
    solution: [
      [3, 1, 4, 2],
      [4, 2, 3, 1],
      [1, 3, 2, 4],
      [2, 4, 1, 3]
    ],
    mask: [
      [true, false, true, false],
      [false, true, false, false],
      [false, false, true, false],
      [true, false, false, true]
    ]
  }
];

export type UnoColor = 'R' | 'B' | 'G' | 'Y';
export interface UnoCard {
  color: UnoColor | 'W';
  value: string; // '0'..'9' | 'SKIP' | '+2' | 'WILD'
}

export function formatUnoCard(c: UnoCard): string {
  const colorMap: Record<string, string> = { R: 'Red', B: 'Blue', G: 'Green', Y: 'Yellow', W: 'Wild' };
  if (c.value === 'WILD') return 'Wild';
  return `${colorMap[c.color]} ${c.value}`;
}

export function pokerDiceRank(dice: number[]): { rank: number; name: string; pts: number } {
  const counts = new Map<number, number>();
  for (const d of dice) counts.set(d, (counts.get(d) || 0) + 1);
  const freqs = Array.from(counts.values()).sort((a, b) => b - a);
  const sum = dice.reduce((a, b) => a + b, 0);
  const sortedUnique = Array.from(counts.keys()).sort((a, b) => a - b);
  const isStraight =
    sortedUnique.length === 5 &&
    ((sortedUnique[0] === 1 && sortedUnique[4] === 5) || (sortedUnique[0] === 2 && sortedUnique[4] === 6));

  if (freqs[0] === 5) return { rank: 7, name: 'Five of a Kind', pts: 60 + sum };
  if (freqs[0] === 4) return { rank: 6, name: 'Four of a Kind', pts: 45 + sum };
  if (freqs[0] === 3 && freqs[1] === 2) return { rank: 5, name: 'Full House', pts: 38 + sum };
  if (isStraight) return { rank: 4, name: 'Straight', pts: 32 + sum };
  if (freqs[0] === 3) return { rank: 3, name: 'Three of a Kind', pts: 24 + sum };
  if (freqs[0] === 2 && freqs[1] === 2) return { rank: 2, name: 'Two Pair', pts: 16 + sum };
  if (freqs[0] === 2) return { rank: 1, name: 'One Pair', pts: 8 + sum };
  return { rank: 0, name: 'High Card', pts: sum };
}

export function scoreFarkleDice(selectedDice: number[]): { pts: number; allUsed: boolean; label: string } {
  if (selectedDice.length === 0) return { pts: 0, allUsed: false, label: 'None' };
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of selectedDice) {
    if (d < 1 || d > 6) return { pts: 0, allUsed: false, label: 'Invalid' };
    counts[d]++;
  }
  const n = selectedDice.length;
  // 6-dice straight
  if (n === 6 && [1, 2, 3, 4, 5, 6].every(v => counts[v] === 1)) {
    return { pts: 1500, allUsed: true, label: 'Straight (1500)' };
  }
  // 3 pairs
  if (n === 6 && counts.slice(1).filter(c => c === 2).length === 3) {
    return { pts: 750, allUsed: true, label: 'Three Pairs (750)' };
  }
  // Two triplets
  if (n === 6 && counts.slice(1).filter(c => c === 3).length === 2) {
    return { pts: 2500, allUsed: true, label: 'Two Triplets (2500)' };
  }

  let pts = 0;
  let used = 0;
  for (let face = 1; face <= 6; face++) {
    const c = counts[face];
    if (c >= 3) {
      const base = face === 1 ? 1000 : face * 100;
      const mult = c === 3 ? 1 : c === 4 ? 2 : c === 5 ? 4 : 8;
      pts += base * mult;
      used += c;
    } else if (face === 1) {
      pts += c * 100;
      used += c;
    } else if (face === 5) {
      pts += c * 50;
      used += c;
    }
  }
  if (used !== n || pts === 0) {
    return { pts: 0, allUsed: false, label: 'Invalid combo' };
  }
  return { pts, allUsed: true, label: `+${pts}` };
}

export function hasAnyFarkleScore(dice: number[]): boolean {
  if (dice.length === 0) return false;
  if (dice.includes(1) || dice.includes(5)) return true;
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d]++;
  if (counts.some(c => c >= 3)) return true;
  if (dice.length === 6) {
    if ([1, 2, 3, 4, 5, 6].every(v => counts[v] === 1)) return true;
    if (counts.slice(1).filter(c => c === 2).length === 3) return true;
  }
  return false;
}

// ---------------- GAME STATE DEFINITIONS (30 GAMES) ----------------

export interface SymmetryArtState {
  gameType: 'symmetry-art';
  round: number;
  maxRounds: number;
  phase: 'pick' | 'draw' | 'guess';
  drawer: Batch2Player;
  guesser: Batch2Player;
  wordChoices: string[];
  word: string | null;
  mirrorMode: 'h' | '4';
  grid: number[][]; // 8x8
  guesses: { text: string; hit: boolean; hint: string }[];
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface ColorMatchState {
  gameType: 'color-match';
  round: number;
  maxRounds: number;
  seed: number;
  targetRgb: [number, number, number];
  pendingP1: [number, number, number] | null;
  scores: { p1: number; p2: number }; // cumulative % points
  history: {
    round: number;
    target: [number, number, number];
    p1: [number, number, number];
    p2: [number, number, number];
    acc1: number;
    acc2: number;
  }[];
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface EmojiStoryState {
  gameType: 'emoji-story';
  round: number;
  maxRounds: number;
  phase: 'pick' | 'build' | 'guess';
  director: Batch2Player;
  guesser: Batch2Player;
  choices: string[];
  answer: string | null;
  panels: [string, string, string]; // 3 comic storyboard frames
  guesses: { text: string; hit: boolean; hint: string }[];
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface QuoridorState {
  gameType: 'quoridor';
  pawns: { p1: [number, number]; p2: [number, number] }; // 7x7 grid: p1 starts [6,3]->0, p2 starts [0,3]->6
  wallsLeft: { p1: number; p2: number };
  hWalls: boolean[][]; // 6x6 horizontal blocker top-left coords (blocks [r,c]-[r+1,c] and [r,c+1]-[r+1,c+1])
  vWalls: boolean[][]; // 6x6 vertical blocker top-left coords (blocks [r,c]-[r,c+1] and [r+1,c]-[r+1,c+1])
  lastActionNote: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface PenteState {
  gameType: 'pente';
  board: (Batch2Player | null)[][]; // 9x9
  captures: { p1: number; p2: number }; // number of pairs captured (5 pairs wins!)
  lastCell: [number, number] | null;
  lastCaptured: [number, number][];
  winLine: [number, number][] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface NineMensMorrisState {
  gameType: 'nine-mens-morris';
  board: (Batch2Player | null)[]; // 24 nodes
  phase: 'place' | 'move' | 'remove';
  toPlace: { p1: number; p2: number };
  lastMove: { from: number | null; to: number } | null;
  lastNote: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface SantoriniLiteState {
  gameType: 'santorini-lite';
  levels: number[][]; // 5x5 (0..4 where 4 = dome)
  builders: { p1: [number, number][]; p2: [number, number][] };
  phase: 'move' | 'build';
  movedBuilderIdx: number | null;
  lastHighlight: [number, number] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface FoxAndHoundsState {
  gameType: 'fox-and-hounds';
  fox: [number, number];
  hounds: [number, number][]; // 4 hounds
  lastMove: [[number, number], [number, number]] | null;
  turn: Batch2Player; // p1 = Fox, p2 = Hounds
  winner: Batch2Winner;
  moveCount: number;
}

export interface IsolaState {
  gameType: 'isola';
  destroyed: boolean[][]; // 6x6
  pawns: { p1: [number, number]; p2: [number, number] };
  phase: 'move' | 'destroy';
  lastHighlight: [number, number] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface TakCellPiece {
  owner: Batch2Player;
  kind: 'flat' | 'wall';
}

export interface TakDuelState {
  gameType: 'tak-duel';
  board: TakCellPiece[][][]; // 5x5 stacks
  wallsLeft: { p1: number; p2: number };
  lastCell: [number, number] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface GoMiniState {
  gameType: 'go-mini';
  board: (Batch2Player | null)[][]; // 7x7
  captures: { p1: number; p2: number };
  consecutivePasses: number;
  prevBoardKey: string | null;
  lastMove: [number, number] | 'pass' | null;
  finalScore: { p1: number; p2: number } | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface AmazonsMiniState {
  gameType: 'amazons-mini';
  board: ('p1' | 'p2' | 'arrow' | null)[][]; // 6x6
  phase: 'move' | 'shoot';
  activeQueen: [number, number] | null;
  lastHighlight: [number, number] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface TronTurnState {
  gameType: 'tron-turn';
  grid: ('p1' | 'p2' | 't1' | 't2' | null)[][]; // 8x8
  heads: { p1: [number, number]; p2: [number, number] };
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export type ShogiPieceKind = 'L' | 'G' | 'E' | 'C' | 'H';
export interface ShogiPocketPiece {
  owner: Batch2Player;
  kind: ShogiPieceKind;
}

export interface ShogiPocketState {
  gameType: 'shogi-pocket';
  board: (ShogiPocketPiece | null)[][]; // 4 rows x 3 cols
  hands: { p1: ShogiPieceKind[]; p2: ShogiPieceKind[] };
  tryPendingFor: Batch2Player | null;
  lastMove: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface GobbletPiece {
  owner: Batch2Player;
  size: 1 | 2 | 3;
}

export interface GobbletMiniState {
  gameType: 'gobblet-mini';
  board: GobbletPiece[][][]; // 3x3 stacks
  reserves: { p1: [number, number, number]; p2: [number, number, number] };
  winLine: [number, number][] | null;
  lastCell: [number, number] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface SplatterTurfState {
  gameType: 'splatter-turf';
  board: (Batch2Player | null)[][]; // 7x7
  bombsLeft: { p1: number; p2: number };
  maxTurns: number;
  lastSplash: [number, number] | null;
  scores: { p1: number; p2: number };
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface KnightDuelState {
  gameType: 'knight-duel';
  burned: boolean[][]; // 6x6
  knights: { p1: [number, number]; p2: [number, number] };
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface AnagramScrambleState {
  gameType: 'anagram-scramble';
  round: number;
  maxRounds: number;
  seed: number;
  word: string;
  scrambled: string;
  revealedCount: number;
  attempts: { by: Batch2Player; guess: string; correct: boolean }[];
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface TriviaShowdownState {
  gameType: 'trivia-showdown';
  round: number;
  maxRounds: number;
  seed: number;
  questionIndices: number[];
  pendingP1Choice: number | null;
  scores: { p1: number; p2: number };
  history: { qIdx: number; p1Choice: number; p2Choice: number; correctAns: number }[];
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface MathBlitzState {
  gameType: 'math-blitz';
  round: number;
  maxRounds: number;
  seed: number;
  puzzleIdx: number;
  attemptsThisRound: { by: Batch2Player; expr: string; result: number; hit: boolean }[];
  scores: { p1: number; p2: number };
  lastSummary: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface SimonDuelState {
  gameType: 'simon-duel';
  sequence: number[]; // indices 0..3 (R, B, G, Y)
  maxLength: number;
  lastAddedBy: Batch2Player | null;
  lastNote: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface BoggleDuelState {
  gameType: 'boggle-duel';
  boardIdx: number;
  claimed: { word: string; by: Batch2Player; pts: number }[];
  scores: { p1: number; p2: number };
  turnsLeft: number;
  consecutivePasses: number;
  lastError: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface SudokuDuelState {
  gameType: 'sudoku-duel';
  seed: number;
  solution: number[][]; // 4x4
  grid: (number | null)[][]; // 4x4
  fixed: boolean[][];
  scores: { p1: number; p2: number };
  lastNote: string | null;
  lastCell: [number, number] | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface UnoDuelState {
  gameType: 'uno-duel';
  deck: UnoCard[];
  deckPos: number;
  hands: { p1: UnoCard[]; p2: UnoCard[] };
  topCard: UnoCard;
  activeColor: UnoColor;
  lastNote: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface GoFishState {
  gameType: 'go-fish';
  pond: string[]; // ranks '2'..'9'
  hands: { p1: string[]; p2: string[] };
  books: { p1: string[]; p2: string[] };
  lastNote: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface PokerDiceState {
  gameType: 'poker-dice';
  round: number;
  maxRounds: number;
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  roundResults: { round: number; p1Pts: number; p1Name: string; p2Pts: number; p2Name: string }[];
  pendingP1: { pts: number; name: string } | null;
  scores: { p1: number; p2: number };
  lastNote: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface LiarsDiceState {
  gameType: 'liars-dice';
  seed: number;
  diceCounts: { p1: number; p2: number };
  pools: { p1: number[]; p2: number[] };
  currentBid: { qty: number; face: number; by: Batch2Player } | null;
  lastReveal: {
    bidQty: number;
    bidFace: number;
    actualCount: number;
    p1Dice: number[];
    p2Dice: number[];
    loser: Batch2Player;
  } | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface FarkleDuelState {
  gameType: 'farkle-duel';
  target: number;
  scores: { p1: number; p2: number };
  turnBank: number;
  activeDice: number[]; // dice rolled waiting to pick keepers
  waitingToRollCount: number; // how many dice left to roll (6 initially)
  lastEvent: string | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface CoinRowState {
  gameType: 'coin-row';
  seed: number;
  coins: number[];
  scores: { p1: number; p2: number };
  lastPick: { by: Batch2Player; side: 'left' | 'right'; value: number } | null;
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export interface HighNoonDuelState {
  gameType: 'high-noon-duel';
  round: number;
  hp: { p1: number; p2: number };
  ammo: { p1: number; p2: number };
  pendingP1: 'reload' | 'shoot' | 'shield' | null;
  history: {
    round: number;
    p1: 'reload' | 'shoot' | 'shield';
    p2: 'reload' | 'shoot' | 'shield';
    note: string;
  }[];
  turn: Batch2Player;
  winner: Batch2Winner;
  moveCount: number;
}

export type Batch2ArcadeState =
  | SymmetryArtState
  | ColorMatchState
  | EmojiStoryState
  | QuoridorState
  | PenteState
  | NineMensMorrisState
  | SantoriniLiteState
  | FoxAndHoundsState
  | IsolaState
  | TakDuelState
  | GoMiniState
  | AmazonsMiniState
  | TronTurnState
  | ShogiPocketState
  | GobbletMiniState
  | SplatterTurfState
  | KnightDuelState
  | AnagramScrambleState
  | TriviaShowdownState
  | MathBlitzState
  | SimonDuelState
  | BoggleDuelState
  | SudokuDuelState
  | UnoDuelState
  | GoFishState
  | PokerDiceState
  | LiarsDiceState
  | FarkleDuelState
  | CoinRowState
  | HighNoonDuelState;

export const BATCH2_ARCADE_GAMES: Batch2GameMeta[] = [
  {
    id: 'symmetry-art',
    name: 'Mirror Art Guess',
    tagline: 'Paint mirrored pixel art for your rival to guess',
    emoji: '🪞',
    avgTime: '3 min',
    accentColor: '#f472b6',
    category: 'Drawing & Creative',
    rulesSummary: 'Every brushstroke automatically mirrors symmetrically across the 8×8 grid! Pick a prompt, craft your mirrored masterpiece, and challenge your opponent to guess it.',
    p1Label: 'Mirror P1',
    p2Label: 'Mirror P2'
  },
  {
    id: 'color-match',
    name: 'Color Mixer Duel',
    tagline: 'Mix RGB sliders to nail the target color swatch',
    emoji: '🎨',
    avgTime: '2 min',
    accentColor: '#fb7185',
    category: 'Drawing & Creative',
    rulesSummary: 'Across 5 rounds, both players secretly tune Red, Green, and Blue sliders to recreate the target color swatch. Closest average accuracy wins!',
    p1Label: 'Mixer 1',
    p2Label: 'Mixer 2'
  },
  {
    id: 'emoji-story',
    name: 'Comic Strip Guess',
    tagline: 'Direct a 3-panel emoji comic & guess the title',
    emoji: '🎭',
    avgTime: '3 min',
    accentColor: '#c084fc',
    category: 'Drawing & Creative',
    rulesSummary: 'Pick a movie or adventure title, fill all 3 comic panels (Setup, Twist, Finale) with scene emojis, and let your opponent crack the story!',
    p1Label: 'Director 1',
    p2Label: 'Director 2'
  },
  {
    id: 'quoridor',
    name: 'Quoridor Walls',
    tagline: 'Race your pawn across & block rivals with walls',
    emoji: '🧱',
    avgTime: '5 min',
    accentColor: '#f59e0b',
    category: 'Strategy',
    rulesSummary: '7×7 labyrinth race! Move your pawn toward the opposite row OR drop a 2-tile wall (6 walls max). Walls can never completely seal off a player’s path!',
    p1Label: 'South Pawn',
    p2Label: 'North Pawn'
  },
  {
    id: 'pente',
    name: 'Pente Capture',
    tagline: 'Line up 5 stones or flank & capture 5 pairs',
    emoji: '💠',
    avgTime: '4 min',
    accentColor: '#38bdf8',
    category: 'Strategy',
    rulesSummary: '9×9 intersection battle! Win by connecting 5 stones in a row OR capturing 5 enemy pairs (10 stones) by flanking two contiguous rival stones.',
    p1Label: 'Sapphire',
    p2Label: 'Amber'
  },
  {
    id: 'nine-mens-morris',
    name: 'Nine Men’s Morris',
    tagline: 'Form 3-in-a-row mills to eliminate enemy pieces',
    emoji: '🏛️',
    avgTime: '5 min',
    accentColor: '#eab308',
    category: 'Strategy',
    rulesSummary: 'Place 9 pieces, then slide along connected rings (fly anywhere at 3 pieces left). Every 3-in-a-row Mill removes an opponent piece!',
    p1Label: 'White',
    p2Label: 'Slate'
  },
  {
    id: 'santorini-lite',
    name: 'Tower Builders',
    tagline: 'Move & construct 3D floors — climb Level 3 to win',
    emoji: '🗼',
    avgTime: '4 min',
    accentColor: '#60a5fa',
    category: 'Strategy',
    rulesSummary: 'Each turn, move one of your 2 builders (up at most 1 level) and build +1 floor on an adjacent tile. First builder to stand on Level 3 wins!',
    p1Label: 'Blue Builders',
    p2Label: 'Coral Builders'
  },
  {
    id: 'fox-and-hounds',
    name: 'Fox & Hounds',
    tagline: 'Asymmetric 1v4 diagonal hunt across dark squares',
    emoji: '🦊',
    avgTime: '3 min',
    accentColor: '#f97316',
    category: 'Strategy',
    rulesSummary: 'Fox moves diagonally any direction trying to reach the top row. 4 Hounds move only diagonally forward trying to corner the Fox with zero moves!',
    p1Label: 'Fox',
    p2Label: 'Hounds'
  },
  {
    id: 'isola',
    name: 'Isola',
    tagline: 'Step like a Queen & shatter a board tile every turn',
    emoji: '🏝️',
    avgTime: '3 min',
    accentColor: '#14b8a6',
    category: 'Strategy',
    rulesSummary: 'Move your pawn 1 square in any of 8 directions, then sink any empty tile into the ocean. Trap your opponent with no open neighbor to win!',
    p1Label: 'Explorer 1',
    p2Label: 'Explorer 2'
  },
  {
    id: 'tak-duel',
    name: 'Path Stack (5×5)',
    tagline: 'Stack tiles & standing walls to forge an edge road',
    emoji: '🪨',
    avgTime: '4 min',
    accentColor: '#a855f7',
    category: 'Strategy',
    rulesSummary: 'Place flat roads, block paths with standing walls, or slide your top stone onto adjacent stacks. Connect opposite edges with flat-topped roads!',
    p1Label: 'Gold Stone',
    p2Label: 'Obsidian'
  },
  {
    id: 'go-mini',
    name: 'Mini Go (7×7)',
    tagline: 'Surround stones, capture liberties & claim territory',
    emoji: '⚫',
    avgTime: '5 min',
    accentColor: '#94a3b8',
    category: 'Territory & Pawns',
    rulesSummary: 'Authentic 7×7 Go with group liberty captures and Ko guard. Surround enemy groups with zero liberties to capture; P2 receives +3.5 komi.',
    p1Label: 'Black',
    p2Label: 'White (+3.5)'
  },
  {
    id: 'amazons-mini',
    name: 'Amazons Hunt (6×6)',
    tagline: 'Slide Queens across rays & fire blocking arrows',
    emoji: '🏹',
    avgTime: '4 min',
    accentColor: '#10b981',
    category: 'Territory & Pawns',
    rulesSummary: 'Move one of your 2 Queens along any unobstructed line, then shoot a burning arrow along a straight ray to seal off squares!',
    p1Label: 'Emerald',
    p2Label: 'Crimson'
  },
  {
    id: 'tron-turn',
    name: 'Light-Cycle Grid',
    tagline: '8×8 neon laser trail duel — box in your opponent',
    emoji: '🏍️',
    avgTime: '2 min',
    accentColor: '#06b6d4',
    category: 'Territory & Pawns',
    rulesSummary: 'Steer your cycle 1 step orthogonally each turn, leaving an impassable energy trail behind. First rider trapped with no open move crashes!',
    p1Label: 'Cyan Cycle',
    p2Label: 'Orange Cycle'
  },
  {
    id: 'shogi-pocket',
    name: 'Animal Shogi (3×4)',
    tagline: 'Mini Lion/Giraffe/Elephant tactical capture & drop',
    emoji: '🦁',
    avgTime: '3 min',
    accentColor: '#fbbf24',
    category: 'Territory & Pawns',
    rulesSummary: 'Capture enemy pieces to drop them back onto the 3×4 board on your side! Capture the enemy Lion or reach the far back rank safely to win.',
    p1Label: 'South Pride',
    p2Label: 'North Pride'
  },
  {
    id: 'gobblet-mini',
    name: 'Gobblet Stack (3×3)',
    tagline: 'Tic-Tac-Toe where larger pieces gobble smaller ones',
    emoji: '🪆',
    avgTime: '2 min',
    accentColor: '#ec4899',
    category: 'Territory & Pawns',
    rulesSummary: 'Place Small/Medium/Large pieces or move pieces already on the board—larger sizes can swallow smaller ones! Line up 3 visible tops to win.',
    p1Label: 'Magenta',
    p2Label: 'Cyan'
  },
  {
    id: 'splatter-turf',
    name: 'Splatter Turf (7×7)',
    tagline: 'Paint splash crosses & mega-bombs across 24 turns',
    emoji: '💦',
    avgTime: '3 min',
    accentColor: '#22d3ee',
    category: 'Territory & Pawns',
    rulesSummary: 'Splash paint in cross patterns (+5 tiles) or unleash 2 Mega-Bombs (3×3 burst) to overwrite rival turf. Most painted squares after 24 turns wins!',
    p1Label: 'Pink Paint',
    p2Label: 'Cyan Paint'
  },
  {
    id: 'knight-duel',
    name: 'Knight’s Joust (6×6)',
    tagline: 'Chess knights leap across burning squares until trapped',
    emoji: '♞',
    avgTime: '2 min',
    accentColor: '#6366f1',
    category: 'Territory & Pawns',
    rulesSummary: 'Leap in L-shapes across a 6×6 chessboard. Every square you vacate burns away forever! Force your rival into zero legal jumps to win.',
    p1Label: 'Azure Knight',
    p2Label: 'Amber Knight'
  },
  {
    id: 'anagram-scramble',
    name: 'Anagram Clash',
    tagline: 'Unscramble 6-letter mystery words across 5 rounds',
    emoji: '🔤',
    avgTime: '2 min',
    accentColor: '#a855f7',
    category: 'Word & Code',
    rulesSummary: 'Race through 5 rounds of jumbled 6-letter words! Decode the hidden word first to earn +2 points, or reveal a clue letter for free.',
    p1Label: 'Solver 1',
    p2Label: 'Solver 2'
  },
  {
    id: 'trivia-showdown',
    name: 'Trivia Showdown',
    tagline: '7-round pop culture, science & gaming quiz duel',
    emoji: '🧠',
    avgTime: '3 min',
    accentColor: '#38bdf8',
    category: 'Word & Code',
    rulesSummary: 'Lock in your multiple-choice answers secretly across 7 curated rounds covering space, games, science, music, and history (+10 pts per right answer)!',
    p1Label: 'Contender 1',
    p2Label: 'Contender 2'
  },
  {
    id: 'math-blitz',
    name: 'Target Math Duel',
    tagline: 'Combine 3 numbers with +, −, × to hit the exact target',
    emoji: '🧮',
    avgTime: '2 min',
    accentColor: '#34d399',
    category: 'Word & Code',
    rulesSummary: '6 rounds of crisp mental arithmetic! Pick operators (+, −, ×) and parentheses grouping to make the 3 given numbers equal the target value.',
    p1Label: 'Calc 1',
    p2Label: 'Calc 2'
  },
  {
    id: 'simon-duel',
    name: 'Pattern Copy Duel',
    tagline: 'Repeat the glowing sequence & add +1 more pad',
    emoji: '🔴',
    avgTime: '2 min',
    accentColor: '#f43f5e',
    category: 'Word & Code',
    rulesSummary: 'Watch the 4-color sequence, tap every pad back in exact order, AND append 1 extra pad to extend the challenge! One wrong tap loses immediately.',
    p1Label: 'Memory 1',
    p2Label: 'Memory 2'
  },
  {
    id: 'boggle-duel',
    name: 'Boggle 4×4 Hunt',
    tagline: 'Trace adjacent letter paths to claim unique words',
    emoji: '🔠',
    avgTime: '3 min',
    accentColor: '#fb923c',
    category: 'Word & Code',
    rulesSummary: 'Tap adjacent tiles on the 4×4 letter grid to trace 3+ letter words over 10 alternating turns. Longer unique words score bonus points!',
    p1Label: 'Hunter 1',
    p2Label: 'Hunter 2'
  },
  {
    id: 'sudoku-duel',
    name: 'Mini Sudoku 4×4 Race',
    tagline: 'Score +10 for valid digits; −5 for mistakes',
    emoji: '🔢',
    avgTime: '3 min',
    accentColor: '#2dd4bf',
    category: 'Word & Code',
    rulesSummary: 'Complete the 4×4 Sudoku grid together competitively! Accurate digits lock onto the board (+10 pts); wrong numbers deduct −5 pts.',
    p1Label: 'Solver 1',
    p2Label: 'Solver 2'
  },
  {
    id: 'uno-duel',
    name: 'Uno Color Duel',
    tagline: 'Match colors, drop Skips & +2s, shed your hand first',
    emoji: '🃏',
    avgTime: '3 min',
    accentColor: '#ef4444',
    category: 'Dice & Duel',
    rulesSummary: 'Classic color & number shedding duel with Skip, +2 Draw Two, and Wild cards! First player to empty their entire hand wins.',
    p1Label: 'Seat 1',
    p2Label: 'Seat 2'
  },
  {
    id: 'go-fish',
    name: 'Go Fish Pairs',
    tagline: 'Ask rivals for matching ranks & collect the most pairs',
    emoji: '🐟',
    avgTime: '3 min',
    accentColor: '#0ea5e9',
    category: 'Dice & Duel',
    rulesSummary: 'Ask your opponent for a rank in your hand! If they hold it, take their cards and go again; otherwise draw from the pond. Most pairs wins!',
    p1Label: 'Angler 1',
    p2Label: 'Angler 2'
  },
  {
    id: 'poker-dice',
    name: 'Poker Dice 5-Roll',
    tagline: 'Lock dice over 3 rolls to score Full Houses & 5-of-a-Kind',
    emoji: '🎰',
    avgTime: '3 min',
    accentColor: '#eab308',
    category: 'Dice & Duel',
    rulesSummary: '5 rounds of Poker Dice! Roll 5 dice up to 3 times per turn while holding keepers, then bank your highest Poker hand score.',
    p1Label: 'Roller 1',
    p2Label: 'Roller 2'
  },
  {
    id: 'liars-dice',
    name: 'Liar’s Dice Bluff',
    tagline: 'Raise dice quantity bids or call Liar to expose bluffs',
    emoji: '🤥',
    avgTime: '3 min',
    accentColor: '#f97316',
    category: 'Dice & Duel',
    rulesSummary: 'Both players hide 4 dice. Bid the total count of a face across ALL dice on the table, or call LIAR! Loser of each reveal loses 1 die.',
    p1Label: 'Bluffer 1',
    p2Label: 'Bluffer 2'
  },
  {
    id: 'farkle-duel',
    name: 'Farkle 1500',
    tagline: 'Push your luck with 6 dice — 1s, 5s, triples & hot dice',
    emoji: '🎲',
    avgTime: '4 min',
    accentColor: '#22c55e',
    category: 'Dice & Duel',
    rulesSummary: 'Roll 6 dice, lock scoring dice (1s=100, 5s=50, 3-of-a-kind=100×face), then Risk a reroll or Bank! Rolling no scorers busts your turn.',
    p1Label: 'Roller 1',
    p2Label: 'Roller 2'
  },
  {
    id: 'coin-row',
    name: 'Coins From Ends',
    tagline: 'Pick left or right coins to out-earn your rival',
    emoji: '🪙',
    avgTime: '2 min',
    accentColor: '#fbbf24',
    category: 'Dice & Duel',
    rulesSummary: '10 coins lie in a row. Alternate grabbing either the leftmost or rightmost coin—calculate ahead to block high coins! Highest stash wins.',
    p1Label: 'Collector 1',
    p2Label: 'Collector 2'
  },
  {
    id: 'high-noon-duel',
    name: 'Wild West Standoff',
    tagline: 'Secretly pick Reload, Shoot, or Shield at High Noon',
    emoji: '🤠',
    avgTime: '2 min',
    accentColor: '#ea580c',
    category: 'Dice & Duel',
    rulesSummary: 'Both cowboys start with 3 HP & 0 Ammo. Pick Reload (+1 Ammo), Shoot (spend 1 Ammo for 1 DMG), or Shield (block Shot) simultaneously!',
    p1Label: 'Sheriff',
    p2Label: 'Outlaw'
  }
];
