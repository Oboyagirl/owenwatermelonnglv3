import {
  EMOJI_CHARADES_LIST,
  HANGMAN_WORDS,
  MASTERMIND_COLORS,
  PIXEL_WORD_BANK,
  WORDLE_5_WORDS,
  WORD_CHAIN_BOT_DICT,
  WORD_CHAIN_SEEDS
} from './arcadeExtendedTypes.ts';
import type {
  ArcadeBot,
  ArcadePlayer,
  ArcadeWinner,
  AtaxxState,
  Blackjack21State,
  BreakthroughState,
  ChompState,
  ColClashState,
  CramState,
  DomineeringState,
  EmojiCharadesState,
  ExtendedArcadeGameType,
  ExtendedArcadeState,
  Gravity5State,
  GridLink4State,
  HangmanDuelState,
  HexState,
  HiLoTargetState,
  KingsEscapeState,
  MastermindState,
  MinesDuelState,
  MisereNimState,
  MisereTTTState,
  NimState,
  ObstructionState,
  OrderChaosState,
  PenaltyKickState,
  PixelGuessState,
  RpsArenaState,
  RpsChoice,
  SnortState,
  SosGridState,
  TugOfWarState,
  WordChainState,
  WordleDuelState,
  YachtDiceState
} from './arcadeExtendedTypes.ts';

export interface ExtendedApplyResult {
  valid: boolean;
  nextState: ExtendedArcadeState;
  extraTurn: boolean;
  capturedOrScored: boolean;
}

const EXTENDED_GAME_SET = new Set<string>([
  'pixel-guess',
  'emoji-charades',
  'nim',
  'misere-nim',
  'chomp',
  'hex',
  'grid-link-4',
  'order-chaos',
  'misere-ttt',
  'gravity-5',
  'snort',
  'col-clash',
  'domineering',
  'cram',
  'obstruction',
  'ataxx',
  'breakthrough',
  'kings-escape',
  'wordle-duel',
  'hangman-duel',
  'mastermind',
  'hilo-target',
  'word-chain',
  'blackjack-21',
  'yacht-dice',
  'tug-of-war',
  'rps-arena',
  'penalty-kick',
  'mines-duel',
  'sos-grid'
]);

export function isExtendedArcadeGameType(val: unknown): val is ExtendedArcadeGameType {
  return typeof val === 'string' && EXTENDED_GAME_SET.has(val);
}

function oppOf(p: ArcadePlayer): ArcadePlayer {
  return p === 'p1' ? 'p2' : 'p1';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededPrng(seed: number): () => number {
  let s = (Math.abs(Math.floor(seed)) || 1337) % 2147483647;
  if (s <= 0) s = 1337;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getDeterministicThreeChoices(pool: string[], seedOffset: number): string[] {
  const n = pool.length;
  const picks: string[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.abs(seedOffset * 7 + i * 5) % n;
    const w = pool[idx];
    if (!picks.includes(w)) picks.push(w);
    else picks.push(pool[(idx + i + 1) % n]);
  }
  return picks;
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// 18 recognizable 10x10 pixel art templates for bots in Pixel Pictionary
export const PIXEL_BOT_TEMPLATES: Record<string, number[]> = {
  heart: [
    0,0,0,0,0,0,0,0,0,0,
    0,2,2,0,0,0,0,2,2,0,
    2,2,2,2,0,0,2,2,2,2,
    2,2,1,2,2,2,2,2,2,2,
    2,2,2,2,2,2,2,2,2,2,
    0,2,2,2,2,2,2,2,2,0,
    0,0,2,2,2,2,2,2,0,0,
    0,0,0,2,2,2,2,0,0,0,
    0,0,0,0,2,2,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  tree: [
    0,0,0,0,5,5,0,0,0,0,
    0,0,0,5,5,5,5,0,0,0,
    0,0,5,5,5,5,5,5,0,0,
    0,5,5,5,5,5,5,5,5,0,
    0,0,5,5,5,5,5,5,0,0,
    0,5,5,5,5,5,5,5,5,0,
    0,0,0,0,9,9,0,0,0,0,
    0,0,0,0,9,9,0,0,0,0,
    0,0,5,5,9,9,5,5,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  house: [
    0,0,0,0,2,2,0,0,0,0,
    0,0,0,2,2,2,2,0,0,0,
    0,0,2,2,2,2,2,2,0,0,
    0,2,2,2,2,2,2,2,2,0,
    0,1,1,1,1,1,1,1,1,0,
    0,1,6,6,1,1,6,6,1,0,
    0,1,6,6,1,1,6,6,1,0,
    0,1,1,1,9,9,1,1,1,0,
    0,1,1,1,9,9,1,1,1,0,
    0,5,5,5,5,5,5,5,5,0
  ],
  sun: [
    0,4,0,0,4,4,0,0,4,0,
    0,0,4,0,0,0,0,4,0,0,
    0,0,0,4,4,4,4,0,0,0,
    4,0,4,4,3,3,4,4,0,4,
    0,0,4,3,4,4,3,4,0,0,
    0,0,4,3,4,4,3,4,0,0,
    4,0,4,4,3,3,4,4,0,4,
    0,0,0,4,4,4,4,0,0,0,
    0,0,4,0,0,0,0,4,0,0,
    0,4,0,0,4,4,0,0,4,0
  ],
  star: [
    0,0,0,0,4,4,0,0,0,0,
    0,0,0,0,4,4,0,0,0,0,
    0,0,0,4,4,4,4,0,0,0,
    4,4,4,4,4,4,4,4,4,4,
    0,4,4,4,4,4,4,4,4,0,
    0,0,4,4,4,4,4,4,0,0,
    0,0,4,4,4,4,4,4,0,0,
    0,4,4,4,0,0,4,4,4,0,
    4,4,0,0,0,0,0,0,4,4,
    0,0,0,0,0,0,0,0,0,0
  ],
  rocket: [
    0,0,0,0,2,2,0,0,0,0,
    0,0,0,2,2,2,2,0,0,0,
    0,0,0,1,1,1,1,0,0,0,
    0,0,0,1,6,6,1,0,0,0,
    0,0,0,1,6,6,1,0,0,0,
    0,0,2,1,1,1,1,2,0,0,
    0,2,2,1,1,1,1,2,2,0,
    0,2,0,0,3,3,0,0,2,0,
    0,0,0,3,4,4,3,0,0,0,
    0,0,0,0,4,4,0,0,0,0
  ],
  melon: [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,2,2,2,2,2,2,2,2,0,
    0,2,0,2,2,2,0,2,2,0,
    0,2,2,2,0,2,2,2,2,0,
    0,1,2,2,2,2,2,2,1,0,
    0,5,1,1,1,1,1,1,5,0,
    0,0,5,5,5,5,5,5,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  crown: [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,2,2,0,0,0,0,
    0,4,0,0,4,4,0,0,4,0,
    0,4,4,0,4,4,0,4,4,0,
    0,4,4,4,4,4,4,4,4,0,
    0,4,6,4,4,4,4,2,4,0,
    0,4,4,4,4,4,4,4,4,0,
    0,3,3,3,3,3,3,3,3,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  ghost: [
    0,0,0,1,1,1,1,0,0,0,
    0,0,1,1,1,1,1,1,0,0,
    0,1,1,1,1,1,1,1,1,0,
    0,1,6,6,1,1,6,6,1,0,
    0,1,6,6,1,1,6,6,1,0,
    0,1,1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1,1,0,
    0,1,0,1,1,0,1,1,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  cat: [
    0,3,0,0,0,0,0,0,3,0,
    0,3,3,0,0,0,0,3,3,0,
    0,3,8,3,3,3,3,8,3,0,
    0,3,3,3,3,3,3,3,3,0,
    0,3,5,3,3,3,3,5,3,0,
    0,3,3,3,8,8,3,3,3,0,
    0,1,3,3,3,3,3,3,1,0,
    0,0,3,3,3,3,3,3,0,0,
    0,0,0,3,3,3,3,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  fish: [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,6,6,0,0,0,0,
    0,0,0,6,6,6,6,0,0,6,
    0,0,6,6,1,6,6,6,6,6,
    0,6,6,6,6,6,6,6,6,6,
    0,0,6,6,6,6,6,6,6,6,
    0,0,0,6,6,6,6,0,0,6,
    0,0,0,0,6,6,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  smile: [
    0,0,0,4,4,4,4,0,0,0,
    0,0,4,4,4,4,4,4,0,0,
    0,4,4,4,4,4,4,4,4,0,
    0,4,4,0,4,4,0,4,4,0,
    0,4,4,0,4,4,0,4,4,0,
    0,4,4,4,4,4,4,4,4,0,
    0,4,0,4,4,4,4,0,4,0,
    0,4,4,0,0,0,0,4,4,0,
    0,0,4,4,4,4,4,4,0,0,
    0,0,0,4,4,4,4,0,0,0
  ],
  sword: [
    0,0,0,0,0,0,0,1,1,0,
    0,0,0,0,0,0,1,6,1,0,
    0,0,0,0,0,1,6,1,0,0,
    0,0,0,0,1,6,1,0,0,0,
    0,4,0,1,6,1,0,0,0,0,
    0,0,4,6,1,0,0,0,0,0,
    0,0,9,4,0,0,0,0,0,0,
    0,9,0,0,4,0,0,0,0,0,
    4,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  flower: [
    0,0,0,8,8,0,8,8,0,0,
    0,0,8,8,8,8,8,8,8,0,
    0,0,8,8,4,4,8,8,8,0,
    0,0,8,8,4,4,8,8,0,0,
    0,0,0,8,8,8,8,0,0,0,
    0,0,0,0,5,5,0,0,0,0,
    0,0,5,5,5,5,0,0,0,0,
    0,0,0,0,5,5,5,5,0,0,
    0,0,0,0,5,5,0,0,0,0,
    0,0,0,5,5,5,5,0,0,0
  ],
  apple: [
    0,0,0,0,0,5,5,0,0,0,
    0,0,0,0,9,5,0,0,0,0,
    0,0,2,2,9,2,2,0,0,0,
    0,2,1,2,2,2,2,2,0,0,
    0,2,1,2,2,2,2,2,0,0,
    0,2,2,2,2,2,2,2,0,0,
    0,2,2,2,2,2,2,2,0,0,
    0,0,2,2,2,2,2,0,0,0,
    0,0,0,2,0,2,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  cup: [
    0,0,0,0,0,0,0,0,0,0,
    0,0,1,1,1,1,1,0,0,0,
    0,0,1,9,9,9,1,1,1,0,
    0,0,1,1,1,1,1,0,1,0,
    0,0,1,6,6,6,1,1,1,0,
    0,0,1,1,1,1,1,0,0,0,
    0,0,1,1,1,1,1,0,0,0,
    0,0,0,1,1,1,0,0,0,0,
    0,1,1,1,1,1,1,1,0,0,
    0,0,0,0,0,0,0,0,0,0
  ],
  robot: [
    0,0,0,0,2,2,0,0,0,0,
    0,0,0,0,6,6,0,0,0,0,
    0,0,6,6,6,6,6,6,0,0,
    0,0,6,4,6,6,4,6,0,0,
    0,0,6,6,6,6,6,6,0,0,
    0,0,6,1,1,1,1,6,0,0,
    0,0,0,0,6,6,0,0,0,0,
    0,6,6,6,6,6,6,6,6,0,
    0,0,6,6,2,2,6,6,0,0,
    0,0,6,0,0,0,0,6,0,0
  ],
  duck: [
    0,0,0,0,0,0,0,0,0,0,
    0,0,4,4,4,0,0,0,0,0,
    0,4,0,4,4,4,0,0,0,0,
    3,3,4,4,4,4,0,0,0,0,
    0,0,0,4,4,4,4,4,4,0,
    0,0,4,4,4,4,4,4,4,4,
    0,0,4,4,4,4,4,4,4,0,
    0,0,0,4,4,4,4,4,0,0,
    0,0,0,0,3,0,3,0,0,0,
    0,0,0,3,3,0,3,3,0,0
  ]
};

// ---------------- SHARED HELPERS ----------------

function checkLineGrid(
  cells: (ArcadePlayer | null)[],
  rows: number,
  cols: number,
  need: number
): { winner: ArcadePlayer; line: number[] } | null {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = cells[r * cols + c];
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        const line = [r * cols + c];
        let ok = true;
        for (let k = 1; k < need; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || cells[nr * cols + nc] !== p) {
            ok = false;
            break;
          }
          line.push(nr * cols + nc);
        }
        if (ok) return { winner: p, line };
      }
    }
  }
  return null;
}

function findHexWinPath(board: (ArcadePlayer | null)[][], player: ArcadePlayer): [number, number][] | null {
  const size = board.length;
  const dirs = [
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0]
  ];
  const visited = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const parent = new Map<string, [number, number] | null>();
  const queue: [number, number][] = [];

  for (let i = 0; i < size; i++) {
    const r = player === 'p1' ? i : 0;
    const c = player === 'p1' ? 0 : i;
    if (board[r][c] === player) {
      visited[r][c] = true;
      parent.set(`${r},${c}`, null);
      queue.push([r, c]);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const [r, c] = queue[head++];
    if ((player === 'p1' && c === size - 1) || (player === 'p2' && r === size - 1)) {
      const path: [number, number][] = [];
      let cur: [number, number] | null = [r, c];
      while (cur) {
        path.push(cur);
        cur = parent.get(`${cur[0]},${cur[1]}`) ?? null;
      }
      return path.reverse();
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc] && board[nr][nc] === player) {
        visited[nr][nc] = true;
        parent.set(`${nr},${nc}`, [r, c]);
        queue.push([nr, nc]);
      }
    }
  }
  return null;
}

function checkOrderChaosLine(board: ('X' | 'O' | null)[][]): [number, number][] | null {
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const ch = board[r][c];
      if (!ch) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        let ok = true;
        for (let k = 1; k < 5; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= 6 || nc < 0 || nc >= 6 || board[nr][nc] !== ch) {
            ok = false;
            break;
          }
          line.push([nr, nc]);
        }
        if (ok) return line;
      }
    }
  }
  return null;
}

function checkGravity5Win(board: (ArcadePlayer | null)[][]): [number, number][] | null {
  const rows = 7;
  const cols = 9;
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = board[r][c];
      if (!p) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        let ok = true;
        for (let k = 1; k < 5; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || board[nr][nc] !== p) {
            ok = false;
            break;
          }
          line.push([nr, nc]);
        }
        if (ok) return line;
      }
    }
  }
  return null;
}

function evaluateWordleGuess(secret: string, guess: string): ('correct' | 'present' | 'absent')[] {
  const marks: ('correct' | 'present' | 'absent')[] = ['absent', 'absent', 'absent', 'absent', 'absent'];
  const counts: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === secret[i]) {
      marks[i] = 'correct';
    } else {
      counts[secret[i]] = (counts[secret[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] === 'correct') continue;
    const ch = guess[i];
    if (counts[ch] && counts[ch] > 0) {
      marks[i] = 'present';
      counts[ch]--;
    }
  }
  return marks;
}

function evalMastermind(secret: number[], guess: number[]): { exact: number; close: number } {
  let exact = 0;
  const sCounts = Array<number>(6).fill(0);
  const gCounts = Array<number>(6).fill(0);
  for (let i = 0; i < 4; i++) {
    if (secret[i] === guess[i]) {
      exact++;
    } else {
      sCounts[secret[i]]++;
      gCounts[guess[i]]++;
    }
  }
  let close = 0;
  for (let c = 0; c < 6; c++) {
    close += Math.min(sCounts[c], gCounts[c]);
  }
  return { exact, close };
}

export function cardValue21(cards: number[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    const rank = (c % 13) + 1;
    if (rank === 1) {
      aces++;
      total += 11;
    } else if (rank >= 10) {
      total += 10;
    } else {
      total += rank;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function formatCardLabel(c: number): { rank: string; suit: string; red: boolean } {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];
  const suitIdx = Math.floor(c / 13) % 4;
  return {
    rank: ranks[c % 13],
    suit: suits[suitIdx],
    red: suitIdx === 1 || suitIdx === 2
  };
}

export function scoreYachtCategory(
  dice: number[],
  cat: 'pair' | 'trips' | 'full' | 'straight' | 'yacht'
): number {
  const counts = Array<number>(7).fill(0);
  let sum = 0;
  for (const d of dice) {
    if (d >= 1 && d <= 6) {
      counts[d]++;
      sum += d;
    }
  }
  const vals = counts.slice(1);
  switch (cat) {
    case 'pair': {
      for (let f = 6; f >= 1; f--) {
        if (counts[f] >= 2) return f * 2;
      }
      return 0;
    }
    case 'trips': {
      for (let f = 6; f >= 1; f--) {
        if (counts[f] >= 3) return f * 3;
      }
      return 0;
    }
    case 'full': {
      const has3 = vals.includes(3);
      const has2 = vals.includes(2);
      const has5 = vals.includes(5);
      return (has3 && has2) || has5 ? Math.max(25, sum) : 0;
    }
    case 'straight': {
      const uniq = Array.from(new Set(dice)).sort((a, b) => a - b).join(',');
      if (uniq === '1,2,3,4,5' || uniq === '2,3,4,5,6') return 40;
      const set = new Set(dice);
      if (
        ([1, 2, 3, 4].every(n => set.has(n))) ||
        ([2, 3, 4, 5].every(n => set.has(n))) ||
        ([3, 4, 5, 6].every(n => set.has(n)))
      ) {
        return 25;
      }
      return 0;
    }
    case 'yacht':
      return vals.includes(5) ? 50 : 0;
  }
}

function getKingsEscapeKingMoves(state: KingsEscapeState): [number, number][] {
  const [kr, kc] = state.king;
  const occ = new Set(state.chasers.map(([r, c]) => `${r},${c}`));
  const moves: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = kr + dr;
      const nc = kc + dc;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && !occ.has(`${nr},${nc}`)) {
        moves.push([nr, nc]);
      }
    }
  }
  return moves;
}

function getKingsEscapeChaserMoves(state: KingsEscapeState): { idx: number; to: [number, number] }[] {
  const occ = new Set<string>([
    `${state.king[0]},${state.king[1]}`,
    ...state.chasers.map(([r, c]) => `${r},${c}`)
  ]);
  const res: { idx: number; to: [number, number] }[] = [];
  state.chasers.forEach(([r, c], idx) => {
    for (const [dr, dc] of [
      [-1, -1],
      [-1, 1],
      [0, -1],
      [0, 1]
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && !occ.has(`${nr},${nc}`)) {
        res.push({ idx, to: [nr, nc] });
      }
    }
  });
  return res;
}

// ---------------- INITIAL STATE CREATORS ----------------

export function createExtendedInitialState(gameType: ExtendedArcadeGameType): ExtendedArcadeState {
  switch (gameType) {
    case 'pixel-guess':
      return {
        gameType: 'pixel-guess',
        round: 1,
        maxRounds: 6,
        phase: 'pick',
        drawer: 'p1',
        guesser: 'p2',
        turn: 'p1',
        wordChoices: getDeterministicThreeChoices(PIXEL_WORD_BANK, 1),
        word: null,
        grid: Array<number>(100).fill(0),
        guesses: [],
        scores: { p1: 0, p2: 0 },
        lastRoundResult: null,
        winner: null,
        moveCount: 0
      };

    case 'emoji-charades':
      return {
        gameType: 'emoji-charades',
        round: 1,
        maxRounds: 6,
        phase: 'pick',
        sender: 'p1',
        guesser: 'p2',
        turn: 'p1',
        promptChoices: getDeterministicThreeChoices(EMOJI_CHARADES_LIST.map(e => e.answer), 2),
        secret: null,
        emojis: [],
        guesses: [],
        scores: { p1: 0, p2: 0 },
        lastRoundResult: null,
        winner: null,
        moveCount: 0
      };

    case 'nim':
      return {
        gameType: 'nim',
        heaps: [1, 3, 5, 7],
        turn: 'p1',
        lastTake: null,
        winner: null,
        moveCount: 0
      };

    case 'misere-nim':
      return {
        gameType: 'misere-nim',
        heaps: [1, 3, 5, 7],
        turn: 'p1',
        lastTake: null,
        winner: null,
        moveCount: 0
      };

    case 'chomp':
      return {
        gameType: 'chomp',
        rows: 5,
        cols: 6,
        eaten: Array.from({ length: 5 }, () => Array<boolean>(6).fill(false)),
        lastBite: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'hex':
      return {
        gameType: 'hex',
        size: 7,
        board: Array.from({ length: 7 }, () => Array<ArcadePlayer | null>(7).fill(null)),
        lastCell: null,
        winPath: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'grid-link-4':
      return {
        gameType: 'grid-link-4',
        board: Array<ArcadePlayer | null>(16).fill(null),
        winLine: null,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'order-chaos':
      return {
        gameType: 'order-chaos',
        board: Array.from({ length: 6 }, () => Array<'X' | 'O' | null>(6).fill(null)),
        winLine: null,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'misere-ttt':
      return {
        gameType: 'misere-ttt',
        board: Array<ArcadePlayer | null>(9).fill(null),
        loseLine: null,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'gravity-5':
      return {
        gameType: 'gravity-5',
        board: Array.from({ length: 7 }, () => Array<ArcadePlayer | null>(9).fill(null)),
        winLine: null,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'snort':
      return {
        gameType: 'snort',
        board: Array.from({ length: 5 }, () => Array<ArcadePlayer | null>(5).fill(null)),
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'col-clash':
      return {
        gameType: 'col-clash',
        board: Array.from({ length: 5 }, () => Array<ArcadePlayer | null>(5).fill(null)),
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'domineering':
      return {
        gameType: 'domineering',
        board: Array.from({ length: 6 }, () => Array<ArcadePlayer | null>(6).fill(null)),
        lastDomino: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'cram':
      return {
        gameType: 'cram',
        board: Array.from({ length: 6 }, () => Array<ArcadePlayer | null>(6).fill(null)),
        lastDomino: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'obstruction':
      return {
        gameType: 'obstruction',
        board: Array.from({ length: 6 }, () => Array<ArcadePlayer | 'blocked' | null>(6).fill(null)),
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'ataxx': {
      const board: (ArcadePlayer | null)[][] = Array.from({ length: 6 }, () =>
        Array<ArcadePlayer | null>(6).fill(null)
      );
      board[0][0] = 'p1';
      board[5][5] = 'p1';
      board[0][5] = 'p2';
      board[5][0] = 'p2';
      return {
        gameType: 'ataxx',
        board,
        counts: { p1: 2, p2: 2 },
        lastMove: null,
        passedLastTurn: false,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'breakthrough': {
      const board: (ArcadePlayer | null)[][] = Array.from({ length: 6 }, () =>
        Array<ArcadePlayer | null>(6).fill(null)
      );
      for (let c = 0; c < 6; c++) {
        board[0][c] = 'p2';
        board[1][c] = 'p2';
        board[4][c] = 'p1';
        board[5][c] = 'p1';
      }
      return {
        gameType: 'breakthrough',
        board,
        lastMove: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'kings-escape':
      return {
        gameType: 'kings-escape',
        king: [0, 2],
        chasers: [
          [5, 0],
          [5, 2],
          [5, 4],
          [4, 3]
        ],
        lastEvent: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'wordle-duel':
      return {
        gameType: 'wordle-duel',
        round: 1,
        setter: 'p1',
        guesser: 'p2',
        phase: 'set',
        secret: null,
        guesses: [],
        roundScores: { p1: null, p2: null },
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'hangman-duel':
      return {
        gameType: 'hangman-duel',
        round: 1,
        maxRounds: 4,
        setter: 'p1',
        guesser: 'p2',
        phase: 'set',
        secret: null,
        guessedLetters: [],
        misses: 0,
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'mastermind':
      return {
        gameType: 'mastermind',
        round: 1,
        setter: 'p1',
        breaker: 'p2',
        phase: 'set',
        secret: null,
        rows: [],
        scores: { p1: null, p2: null },
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'hilo-target':
      return {
        gameType: 'hilo-target',
        target: 57,
        lowBound: 1,
        highBound: 100,
        history: [],
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'word-chain':
      return {
        gameType: 'word-chain',
        words: [{ word: 'melon', by: 'p2', pts: 0 }],
        requiredLetter: 'n',
        scores: { p1: 0, p2: 0 },
        maxTurns: 12,
        lastError: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'blackjack-21':
      return {
        gameType: 'blackjack-21',
        round: 1,
        maxRounds: 5,
        deck: [],
        deckPos: 0,
        hands: { p1: [], p2: [] },
        stood: { p1: false, p2: false },
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'yacht-dice':
      return {
        gameType: 'yacht-dice',
        round: 1,
        dice: [0, 0, 0, 0, 0],
        held: [false, false, false, false, false],
        rollsLeft: 3,
        usedCats: { p1: {}, p2: {} },
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'tug-of-war':
      return {
        gameType: 'tug-of-war',
        round: 1,
        ropePos: 0,
        energy: { p1: 30, p2: 30 },
        pendingP1Bid: null,
        lastRound: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'rps-arena':
      return {
        gameType: 'rps-arena',
        round: 1,
        maxRounds: 7,
        pendingP1: null,
        scores: { p1: 0, p2: 0 },
        lastRound: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'penalty-kick':
      return {
        gameType: 'penalty-kick',
        kickNumber: 1,
        shooter: 'p1',
        keeper: 'p2',
        pendingShot: null,
        scores: { p1: 0, p2: 0 },
        history: [],
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'mines-duel':
      return {
        gameType: 'mines-duel',
        size: 6,
        mines: Array<boolean>(36).fill(false),
        revealedBy: Array<ArcadePlayer | null>(36).fill(null),
        adjCounts: Array<number>(36).fill(0),
        scores: { p1: 0, p2: 0 },
        targetFlags: 6,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'sos-grid':
      return {
        gameType: 'sos-grid',
        board: Array.from({ length: 5 }, () => Array<'S' | 'O' | null>(5).fill(null)),
        scores: { p1: 0, p2: 0 },
        completedLines: [],
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
  }
}

// ---------------- LEGAL MOVES ----------------

export function getExtendedLegalActions(state: ExtendedArcadeState): string[] {
  if (state.winner) return [];

  switch (state.gameType) {
    case 'pixel-guess':
      if (state.phase === 'pick') return state.wordChoices.map(w => `pw:${w}`);
      if (state.phase === 'draw') {
        if (state.grid.some(v => v !== 0)) return ['pd'];
        const tmpl = PIXEL_BOT_TEMPLATES[state.word || 'heart'] || PIXEL_BOT_TEMPLATES.heart;
        return [`pb:${tmpl.join('')}`, 'pd'];
      }
      return PIXEL_WORD_BANK
        .filter(w => !state.guesses.some(g => g.text === w))
        .map(w => `pg:${w}`);

    case 'emoji-charades':
      if (state.phase === 'pick') return state.promptChoices.map(p => `ew:${p}`);
      if (state.phase === 'clue') {
        if (state.emojis.length > 0) return ['es'];
        const match = EMOJI_CHARADES_LIST.find(e => e.answer === state.secret);
        const clue = match ? match.sample : ['✨', '🎯', '❓'];
        return [`ep:${clue.join('|')}`];
      }
      return EMOJI_CHARADES_LIST
        .map(e => e.answer)
        .filter(w => !state.guesses.some(g => g.text === w))
        .map(w => `eg:${w}`);

    case 'nim':
    case 'misere-nim': {
      const res: string[] = [];
      state.heaps.forEach((h, i) => {
        for (let k = 1; k <= h; k++) res.push(`n:${i}:${k}`);
      });
      return res;
    }

    case 'chomp': {
      const res: string[] = [];
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          if (!state.eaten[r][c]) res.push(`ch:${r},${c}`);
        }
      }
      return res;
    }

    case 'hex': {
      const res: string[] = [];
      for (let r = 0; r < state.size; r++) {
        for (let c = 0; c < state.size; c++) {
          if (state.board[r][c] === null) res.push(`hx:${r},${c}`);
        }
      }
      return res;
    }

    case 'grid-link-4': {
      const res: string[] = [];
      state.board.forEach((v, i) => {
        if (v === null) res.push(`gl:${i}`);
      });
      return res;
    }

    case 'order-chaos': {
      const res: string[] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (state.board[r][c] === null) {
            res.push(`oc:${r},${c},X`, `oc:${r},${c},O`);
          }
        }
      }
      return res;
    }

    case 'misere-ttt': {
      const res: string[] = [];
      state.board.forEach((v, i) => {
        if (v === null) res.push(`mt:${i}`);
      });
      return res;
    }

    case 'gravity-5': {
      const res: string[] = [];
      for (let c = 0; c < 9; c++) {
        if (state.board[0][c] === null) res.push(`g5:${c}`);
      }
      return res;
    }

    case 'snort': {
      const opp = oppOf(state.turn);
      const res: string[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (state.board[r][c] !== null) continue;
          const adjOpp = [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
          ].some(([nr, nc]) => nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && state.board[nr][nc] === opp);
          if (!adjOpp) res.push(`sn:${r},${c}`);
        }
      }
      return res;
    }

    case 'col-clash': {
      const res: string[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (state.board[r][c] !== null) continue;
          const adjSelf = [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
          ].some(
            ([nr, nc]) => nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && state.board[nr][nc] === state.turn
          );
          if (!adjSelf) res.push(`cc:${r},${c}`);
        }
      }
      return res;
    }

    case 'domineering': {
      const res: string[] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (state.board[r][c] !== null) continue;
          if (state.turn === 'p1' && r + 1 < 6 && state.board[r + 1][c] === null) {
            res.push(`dm:${r},${c}`);
          } else if (state.turn === 'p2' && c + 1 < 6 && state.board[r][c + 1] === null) {
            res.push(`dm:${r},${c}`);
          }
        }
      }
      return res;
    }

    case 'cram': {
      const res: string[] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (state.board[r][c] !== null) continue;
          if (c + 1 < 6 && state.board[r][c + 1] === null) res.push(`cr:${r},${c},h`);
          if (r + 1 < 6 && state.board[r + 1][c] === null) res.push(`cr:${r},${c},v`);
        }
      }
      return res;
    }

    case 'obstruction': {
      const res: string[] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (state.board[r][c] === null) res.push(`ob:${r},${c}`);
        }
      }
      return res;
    }

    case 'ataxx': {
      const res: string[] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (state.board[r][c] !== state.turn) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && state.board[nr][nc] === null) {
                res.push(`ax:${r},${c}-${nr},${nc}`);
              }
            }
          }
        }
      }
      return res;
    }

    case 'breakthrough': {
      const res: string[] = [];
      const dir = state.turn === 'p1' ? -1 : 1;
      const opp = oppOf(state.turn);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (state.board[r][c] !== state.turn) continue;
          const nr = r + dir;
          if (nr < 0 || nr >= 6) continue;
          if (state.board[nr][c] === null) res.push(`bt:${r},${c}-${nr},${c}`);
          for (const dc of [-1, 1]) {
            const nc = c + dc;
            if (nc >= 0 && nc < 6 && (state.board[nr][nc] === null || state.board[nr][nc] === opp)) {
              res.push(`bt:${r},${c}-${nr},${nc}`);
            }
          }
        }
      }
      return res;
    }

    case 'kings-escape': {
      if (state.turn === 'p1') {
        return getKingsEscapeKingMoves(state).map(([r, c]) => `ke:k,${r},${c}`);
      }
      return getKingsEscapeChaserMoves(state).map(m => `ke:${m.idx},${m.to[0]},${m.to[1]}`);
    }

    case 'wordle-duel': {
      if (state.phase === 'set') return WORDLE_5_WORDS.slice(0, 12).map(w => `wds:${w}`);
      const used = new Set(state.guesses.map(g => g.word));
      const cands = WORDLE_5_WORDS.filter(w => !used.has(w));
      if (state.secret && !used.has(state.secret) && !cands.includes(state.secret)) {
        cands.unshift(state.secret);
      }
      return (cands.length > 0 ? cands : [state.secret || 'melon']).map(w => `wdg:${w}`);
    }

    case 'hangman-duel':
      if (state.phase === 'set') return HANGMAN_WORDS.slice(0, 12).map(w => `hms:${w}`);
      return 'abcdefghijklmnopqrstuvwxyz'
        .split('')
        .filter(ch => !state.guessedLetters.includes(ch))
        .map(ch => `hml:${ch}`);

    case 'mastermind':
      if (state.phase === 'set') return ['mms:0123', 'mms:2415', 'mms:3502'];
      return [`mmg:${(state.secret || [0, 1, 2, 3]).join('')}`, 'mmg:0123', 'mmg:1234', 'mmg:2345', 'mmg:3450'];

    case 'hilo-target': {
      const mid = Math.floor((state.lowBound + state.highBound) / 2);
      return [`hl:${mid}`];
    }

    case 'word-chain': {
      const used = new Set(state.words.map(w => w.word));
      const letter = state.requiredLetter || 'a';
      const dict = WORD_CHAIN_BOT_DICT[letter] || [];
      const cands = Array.from(new Set([...dict, ...WORD_CHAIN_SEEDS])).filter(
        w => w.startsWith(letter) && !used.has(w)
      );
      if (cands.length > 0) return cands.map(w => `wc:${w}`);
      const fallbackSuffixes = ['eon', 'ova', 'est', 'ark', 'aze', 'ora', 'ion', 'urn', 'ix', 'aft'];
      for (const suf of fallbackSuffixes) {
        const w = `${letter}${suf}`;
        if (!used.has(w)) return [`wc:${w}`];
      }
      return [`wc:${letter}alphabet`];
    }

    case 'blackjack-21':
      if (state.hands.p1.length === 0) return ['bj:deal'];
      return ['bj:hit', 'bj:stand'];

    case 'yacht-dice': {
      const used = state.usedCats[state.turn];
      const cats = (['pair', 'trips', 'full', 'straight', 'yacht'] as const).filter(
        c => used[c] === undefined
      );
      if (state.rollsLeft === 3) return ['yd:roll'];
      const out = cats.map(c => `yd:score:${c}`);
      if (state.rollsLeft > 0) out.unshift('yd:roll');
      return out;
    }

    case 'tug-of-war': {
      const avail = state.energy[state.turn];
      if (avail <= 0) return ['tw:0'];
      const maxBid = Math.min(6, avail);
      const res: string[] = [];
      for (let b = 1; b <= maxBid; b++) res.push(`tw:${b}`);
      return res;
    }

    case 'rps-arena':
      return ['rp:rock', 'rp:paper', 'rp:scissors', 'rp:lizard', 'rp:spock'];

    case 'penalty-kick':
      return ['pk:0', 'pk:1', 'pk:2', 'pk:3', 'pk:4'];

    case 'mines-duel': {
      const res: string[] = [];
      for (let i = 0; i < 36; i++) {
        if (state.revealedBy[i] === null) res.push(`mn:${i}`);
      }
      return res;
    }

    case 'sos-grid': {
      const res: string[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (state.board[r][c] === null) {
            res.push(`so:${r},${c},S`, `so:${r},${c},O`);
          }
        }
      }
      return res;
    }
  }
}

// ---------------- APPLY ACTION ----------------

export function applyExtendedArcadeAction(
  state: ExtendedArcadeState,
  rawAction: string
): ExtendedApplyResult {
  const fail = (): ExtendedApplyResult => ({
    valid: false,
    nextState: state,
    extraTurn: false,
    capturedOrScored: false
  });
  if (state.winner) return fail();
  const action = String(rawAction || '').trim();
  if (!action) return fail();

  switch (state.gameType) {
    case 'pixel-guess': {
      if (state.phase === 'pick') {
        if (action === 'pr') {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              wordChoices: getDeterministicThreeChoices(PIXEL_WORD_BANK, state.moveCount + state.round + 3),
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action.startsWith('pw:')) {
          const w = action.slice(3).trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 20);
          if (w.length < 2) return fail();
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              phase: 'draw',
              word: w,
              grid: Array<number>(100).fill(0),
              guesses: [],
              moveCount: state.moveCount + 1
            }
          };
        }
        return fail();
      }

      if (state.phase === 'draw') {
        if (action === 'pc') {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, grid: Array<number>(100).fill(0), moveCount: state.moveCount + 1 }
          };
        }
        if (action.startsWith('px:')) {
          const [, idxS, colS] = action.split(':');
          const idx = Number(idxS);
          const col = Number(colS);
          if (!Number.isInteger(idx) || idx < 0 || idx >= 100 || !Number.isInteger(col) || col < 0 || col > 9) {
            return fail();
          }
          const grid = [...state.grid];
          grid[idx] = col;
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, grid, moveCount: state.moveCount + 1 }
          };
        }
        if (action.startsWith('pb:')) {
          const digits = action.slice(3);
          if (digits.length !== 100 || /[^0-9]/.test(digits)) return fail();
          const grid = digits.split('').map(Number);
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, grid, moveCount: state.moveCount + 1 }
          };
        }
        if (action === 'pd') {
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
        return fail();
      }

      if (state.phase === 'guess' && action.startsWith('pg:')) {
        const guess = action.slice(3).trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 24);
        if (!guess) return fail();
        const target = (state.word || '').toLowerCase();
        const hit = guess === target;
        const hint = !hit && target && editDistance(guess, target) <= 2 ? 'Super close!' : undefined;
        const guesses = [...state.guesses, { text: guess, hit, hint }];
        if (!hit && guesses.length < 3) {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, guesses, moveCount: state.moveCount + 1 }
          };
        }
        const points = hit ? Math.max(1, 4 - guesses.length) : 0;
        const scores = { ...state.scores };
        if (hit) {
          scores[state.guesser] += points;
          scores[state.drawer] += 1;
        }
        const lastRoundResult = { round: state.round, word: target, guessed: hit, points };
        if (state.round >= state.maxRounds) {
          const winner: ArcadeWinner =
            scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw';
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: hit,
            nextState: {
              ...state,
              guesses,
              scores,
              lastRoundResult,
              winner,
              moveCount: state.moveCount + 1
            }
          };
        }
        const nextDrawer = oppOf(state.drawer);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: hit,
          nextState: {
            ...state,
            round: state.round + 1,
            phase: 'pick',
            drawer: nextDrawer,
            guesser: oppOf(nextDrawer),
            turn: nextDrawer,
            wordChoices: getDeterministicThreeChoices(PIXEL_WORD_BANK, state.moveCount + state.round + 5),
            word: null,
            grid: Array<number>(100).fill(0),
            guesses: [],
            scores,
            lastRoundResult,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    case 'emoji-charades': {
      if (state.phase === 'pick') {
        if (action === 'er') {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              promptChoices: getDeterministicThreeChoices(
                EMOJI_CHARADES_LIST.map(e => e.answer),
                state.moveCount + state.round + 4
              ),
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action.startsWith('ew:')) {
          const secret = action.slice(3).trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 28);
          if (secret.length < 2) return fail();
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              phase: 'clue',
              secret,
              emojis: [],
              guesses: [],
              moveCount: state.moveCount + 1
            }
          };
        }
        return fail();
      }

      if (state.phase === 'clue') {
        if (action === 'ed') {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              emojis: state.emojis.slice(0, -1),
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action.startsWith('ea:')) {
          if (state.emojis.length >= 6) return fail();
          const em = action.slice(3).trim().slice(0, 8);
          if (!em) return fail();
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              emojis: [...state.emojis, em],
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action.startsWith('ep:')) {
          const list = action.slice(3).split('|').filter(Boolean).slice(0, 6);
          if (list.length === 0) return fail();
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: {
              ...state,
              phase: 'guess',
              emojis: list,
              turn: state.guesser,
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action === 'es') {
          if (state.emojis.length === 0) return fail();
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
        return fail();
      }

      if (state.phase === 'guess' && action.startsWith('eg:')) {
        const guess = action.slice(3).trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 32);
        if (!guess) return fail();
        const target = (state.secret || '').toLowerCase();
        const hit = guess === target;
        const hint = !hit && target && editDistance(guess, target) <= 3 ? 'Close match!' : undefined;
        const guesses = [...state.guesses, { text: guess, hit, hint }];
        if (!hit && guesses.length < 3) {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, guesses, moveCount: state.moveCount + 1 }
          };
        }
        const points = hit ? Math.max(1, 4 - guesses.length) : 0;
        const scores = { ...state.scores };
        if (hit) {
          scores[state.guesser] += points;
          scores[state.sender] += 1;
        }
        const lastRoundResult = { round: state.round, secret: target, guessed: hit, points };
        if (state.round >= state.maxRounds) {
          const winner: ArcadeWinner =
            scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw';
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: hit,
            nextState: {
              ...state,
              guesses,
              scores,
              lastRoundResult,
              winner,
              moveCount: state.moveCount + 1
            }
          };
        }
        const nextSender = oppOf(state.sender);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: hit,
          nextState: {
            ...state,
            round: state.round + 1,
            phase: 'pick',
            sender: nextSender,
            guesser: oppOf(nextSender),
            turn: nextSender,
            promptChoices: getDeterministicThreeChoices(
              EMOJI_CHARADES_LIST.map(e => e.answer),
              state.moveCount + state.round + 7
            ),
            secret: null,
            emojis: [],
            guesses: [],
            scores,
            lastRoundResult,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    case 'nim':
    case 'misere-nim': {
      if (!action.startsWith('n:')) return fail();
      const [, heapS, countS] = action.split(':');
      const heap = Number(heapS);
      const count = Number(countS);
      if (
        !Number.isInteger(heap) ||
        heap < 0 ||
        heap >= state.heaps.length ||
        !Number.isInteger(count) ||
        count < 1 ||
        count > state.heaps[heap]
      ) {
        return fail();
      }
      const heaps = [...state.heaps];
      heaps[heap] -= count;
      const total = heaps.reduce((a, b) => a + b, 0);
      const winner: ArcadeWinner =
        total === 0 ? (state.gameType === 'nim' ? state.turn : oppOf(state.turn)) : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          heaps,
          lastTake: { heap, count, by: state.turn },
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'chomp': {
      if (!action.startsWith('ch:')) return fail();
      const [br, bc] = action.slice(3).split(',').map(Number);
      if (
        !Number.isInteger(br) ||
        !Number.isInteger(bc) ||
        br < 0 ||
        br >= state.rows ||
        bc < 0 ||
        bc >= state.cols ||
        state.eaten[br][bc]
      ) {
        return fail();
      }
      const eaten = state.eaten.map(row => [...row]);
      for (let r = br; r < state.rows; r++) {
        for (let c = bc; c < state.cols; c++) {
          eaten[r][c] = true;
        }
      }
      const atePoison = br === 0 && bc === 0;
      const winner: ArcadeWinner = atePoison ? oppOf(state.turn) : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          eaten,
          lastBite: [br, bc],
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'hex': {
      if (!action.startsWith('hx:')) return fail();
      const [r, c] = action.slice(3).split(',').map(Number);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= state.size || c < 0 || c >= state.size) {
        return fail();
      }
      if (state.board[r][c] !== null) return fail();
      const board = state.board.map(row => [...row]);
      board[r][c] = state.turn;
      const winPath = findHexWinPath(board, state.turn);
      const winner: ArcadeWinner = winPath ? state.turn : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          lastCell: [r, c],
          winPath,
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'grid-link-4': {
      if (!action.startsWith('gl:')) return fail();
      const idx = Number(action.slice(3));
      if (!Number.isInteger(idx) || idx < 0 || idx >= 16 || state.board[idx] !== null) return fail();
      const board = [...state.board];
      board[idx] = state.turn;
      const lineWin = checkLineGrid(board, 4, 4, 4);
      let winLine: number[] | null = lineWin?.line || null;
      if (!winLine) {
        // Also check 2x2 square win
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const sq = [r * 4 + c, r * 4 + c + 1, (r + 1) * 4 + c, (r + 1) * 4 + c + 1];
            if (sq.every(i => board[i] === state.turn)) {
              winLine = sq;
              break;
            }
          }
          if (winLine) break;
        }
      }
      const winner: ArcadeWinner = winLine
        ? state.turn
        : board.every(v => v !== null)
        ? 'draw'
        : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          winLine,
          lastCell: idx,
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'order-chaos': {
      if (!action.startsWith('oc:')) return fail();
      const [rS, cS, sym] = action.slice(3).split(',');
      const r = Number(rS);
      const c = Number(cS);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 6 || c < 0 || c >= 6) return fail();
      if (sym !== 'X' && sym !== 'O') return fail();
      if (state.board[r][c] !== null) return fail();
      const board = state.board.map(row => [...row]);
      board[r][c] = sym;
      const winLine = checkOrderChaosLine(board);
      const full = board.every(row => row.every(cell => cell !== null));
      const winner: ArcadeWinner = winLine ? 'p1' : full ? 'p2' : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          winLine,
          lastCell: [r, c],
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'misere-ttt': {
      if (!action.startsWith('mt:')) return fail();
      const idx = Number(action.slice(3));
      if (!Number.isInteger(idx) || idx < 0 || idx >= 9 || state.board[idx] !== null) return fail();
      const board = [...state.board];
      board[idx] = state.turn;
      const three = checkLineGrid(board, 3, 3, 3);
      const winner: ArcadeWinner = three
        ? oppOf(three.winner)
        : board.every(v => v !== null)
        ? 'draw'
        : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          loseLine: three?.line || null,
          lastCell: idx,
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'gravity-5': {
      if (!action.startsWith('g5:')) return fail();
      const col = Number(action.slice(3));
      if (!Number.isInteger(col) || col < 0 || col >= 9) return fail();
      let targetRow = -1;
      for (let r = 6; r >= 0; r--) {
        if (state.board[r][col] === null) {
          targetRow = r;
          break;
        }
      }
      if (targetRow === -1) return fail();
      const board = state.board.map(row => [...row]);
      board[targetRow][col] = state.turn;
      const winLine = checkGravity5Win(board);
      const full = board[0].every(v => v !== null);
      const winner: ArcadeWinner = winLine ? state.turn : full ? 'draw' : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          winLine,
          lastCell: [targetRow, col],
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'snort': {
      if (!action.startsWith('sn:')) return fail();
      const [r, c] = action.slice(3).split(',').map(Number);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 5 || c < 0 || c >= 5) return fail();
      if (state.board[r][c] !== null) return fail();
      const opp = oppOf(state.turn);
      const adjOpp = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ].some(([nr, nc]) => nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && state.board[nr][nc] === opp);
      if (adjOpp) return fail();
      const board = state.board.map(row => [...row]);
      board[r][c] = state.turn;
      const nextState: SnortState = {
        ...state,
        board,
        lastCell: [r, c],
        turn: opp,
        moveCount: state.moveCount + 1
      };
      const oppLegal = getExtendedLegalActions(nextState);
      if (oppLegal.length === 0) {
        nextState.winner = state.turn;
        nextState.turn = state.turn;
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState };
    }

    case 'col-clash': {
      if (!action.startsWith('cc:')) return fail();
      const [r, c] = action.slice(3).split(',').map(Number);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 5 || c < 0 || c >= 5) return fail();
      if (state.board[r][c] !== null) return fail();
      const adjSelf = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ].some(([nr, nc]) => nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && state.board[nr][nc] === state.turn);
      if (adjSelf) return fail();
      const opp = oppOf(state.turn);
      const board = state.board.map(row => [...row]);
      board[r][c] = state.turn;
      const nextState: ColClashState = {
        ...state,
        board,
        lastCell: [r, c],
        turn: opp,
        moveCount: state.moveCount + 1
      };
      if (getExtendedLegalActions(nextState).length === 0) {
        nextState.winner = state.turn;
        nextState.turn = state.turn;
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState };
    }

    case 'domineering': {
      if (!action.startsWith('dm:')) return fail();
      const [r, c] = action.slice(3).split(',').map(Number);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 6 || c < 0 || c >= 6) return fail();
      const r2 = state.turn === 'p1' ? r + 1 : r;
      const c2 = state.turn === 'p2' ? c + 1 : c;
      if (r2 >= 6 || c2 >= 6 || state.board[r][c] !== null || state.board[r2][c2] !== null) return fail();
      const board = state.board.map(row => [...row]);
      board[r][c] = state.turn;
      board[r2][c2] = state.turn;
      const opp = oppOf(state.turn);
      const nextState: DomineeringState = {
        ...state,
        board,
        lastDomino: [
          [r, c],
          [r2, c2]
        ],
        turn: opp,
        moveCount: state.moveCount + 1
      };
      if (getExtendedLegalActions(nextState).length === 0) {
        nextState.winner = state.turn;
        nextState.turn = state.turn;
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState };
    }

    case 'cram': {
      if (!action.startsWith('cr:')) return fail();
      const [rS, cS, dir] = action.slice(3).split(',');
      const r = Number(rS);
      const c = Number(cS);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 6 || c < 0 || c >= 6) return fail();
      if (dir !== 'h' && dir !== 'v') return fail();
      const r2 = dir === 'v' ? r + 1 : r;
      const c2 = dir === 'h' ? c + 1 : c;
      if (r2 >= 6 || c2 >= 6 || state.board[r][c] !== null || state.board[r2][c2] !== null) return fail();
      const board = state.board.map(row => [...row]);
      board[r][c] = state.turn;
      board[r2][c2] = state.turn;
      const opp = oppOf(state.turn);
      const nextState: CramState = {
        ...state,
        board,
        lastDomino: [
          [r, c],
          [r2, c2]
        ],
        turn: opp,
        moveCount: state.moveCount + 1
      };
      if (getExtendedLegalActions(nextState).length === 0) {
        nextState.winner = state.turn;
        nextState.turn = state.turn;
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState };
    }

    case 'obstruction': {
      if (!action.startsWith('ob:')) return fail();
      const [r, c] = action.slice(3).split(',').map(Number);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 6 || c < 0 || c >= 6) return fail();
      if (state.board[r][c] !== null) return fail();
      const board = state.board.map(row => [...row]);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && board[nr][nc] === null) {
            board[nr][nc] = dr === 0 && dc === 0 ? state.turn : 'blocked';
          }
        }
      }
      board[r][c] = state.turn;
      const hasMore = board.some(row => row.some(cell => cell === null));
      const winner: ArcadeWinner = hasMore ? null : state.turn;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          lastCell: [r, c],
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'ataxx': {
      if (!action.startsWith('ax:')) return fail();
      const [fromS, toS] = action.slice(3).split('-');
      if (!fromS || !toS) return fail();
      const [fr, fc] = fromS.split(',').map(Number);
      const [tr, tc] = toS.split(',').map(Number);
      if (
        !Number.isInteger(fr) ||
        !Number.isInteger(fc) ||
        !Number.isInteger(tr) ||
        !Number.isInteger(tc) ||
        fr < 0 ||
        fr >= 6 ||
        fc < 0 ||
        fc >= 6 ||
        tr < 0 ||
        tr >= 6 ||
        tc < 0 ||
        tc >= 6
      ) {
        return fail();
      }
      if (state.board[fr][fc] !== state.turn || state.board[tr][tc] !== null) return fail();
      const dist = Math.max(Math.abs(tr - fr), Math.abs(tc - fc));
      if (dist < 1 || dist > 2) return fail();
      const board = state.board.map(row => [...row]);
      if (dist === 2) board[fr][fc] = null;
      board[tr][tc] = state.turn;
      const opp = oppOf(state.turn);
      let converted = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = tr + dr;
          const nc = tc + dc;
          if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && board[nr][nc] === opp) {
            board[nr][nc] = state.turn;
            converted++;
          }
        }
      }
      let p1 = 0;
      let p2 = 0;
      let empty = 0;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (board[r][c] === 'p1') p1++;
          else if (board[r][c] === 'p2') p2++;
          else empty++;
        }
      }
      let winner: ArcadeWinner = null;
      let nextTurn = opp;
      let passedLastTurn = false;
      if (p1 === 0) winner = 'p2';
      else if (p2 === 0) winner = 'p1';
      else if (empty === 0) winner = p1 > p2 ? 'p1' : p2 > p1 ? 'p2' : 'draw';
      else {
        const probe: AtaxxState = {
          ...state,
          board,
          counts: { p1, p2 },
          turn: opp,
          winner: null
        };
        if (getExtendedLegalActions(probe).length === 0) {
          // Check if current player has moves
          const selfProbe = { ...probe, turn: state.turn };
          if (getExtendedLegalActions(selfProbe).length === 0) {
            winner = p1 > p2 ? 'p1' : p2 > p1 ? 'p2' : 'draw';
          } else {
            nextTurn = state.turn;
            passedLastTurn = true;
          }
        }
      }
      return {
        valid: true,
        extraTurn: nextTurn === state.turn && !winner,
        capturedOrScored: converted > 0,
        nextState: {
          ...state,
          board,
          counts: { p1, p2 },
          lastMove: [
            [fr, fc],
            [tr, tc]
          ],
          passedLastTurn,
          turn: winner ? state.turn : nextTurn,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'breakthrough': {
      if (!action.startsWith('bt:')) return fail();
      const [fromS, toS] = action.slice(3).split('-');
      if (!fromS || !toS) return fail();
      const [fr, fc] = fromS.split(',').map(Number);
      const [tr, tc] = toS.split(',').map(Number);
      if (
        !Number.isInteger(fr) ||
        !Number.isInteger(fc) ||
        !Number.isInteger(tr) ||
        !Number.isInteger(tc) ||
        tr < 0 ||
        tr >= 6 ||
        tc < 0 ||
        tc >= 6
      ) {
        return fail();
      }
      if (state.board[fr][fc] !== state.turn) return fail();
      const dir = state.turn === 'p1' ? -1 : 1;
      if (tr !== fr + dir || Math.abs(tc - fc) > 1) return fail();
      if (tc === fc && state.board[tr][tc] !== null) return fail();
      if (tc !== fc && state.board[tr][tc] === state.turn) return fail();

      const captured = state.board[tr][tc] === oppOf(state.turn);
      const board = state.board.map(row => [...row]);
      board[fr][fc] = null;
      board[tr][tc] = state.turn;

      let oppCount = 0;
      const opp = oppOf(state.turn);
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if (board[r][c] === opp) oppCount++;
        }
      }
      const reachedGoal = (state.turn === 'p1' && tr === 0) || (state.turn === 'p2' && tr === 5);
      const winner: ArcadeWinner = reachedGoal || oppCount === 0 ? state.turn : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: captured,
        nextState: {
          ...state,
          board,
          lastMove: [
            [fr, fc],
            [tr, tc]
          ],
          turn: winner ? state.turn : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'kings-escape': {
      if (!action.startsWith('ke:')) return fail();
      const parts = action.slice(3).split(',');
      if (parts.length !== 3) return fail();
      const tr = Number(parts[1]);
      const tc = Number(parts[2]);
      if (!Number.isInteger(tr) || !Number.isInteger(tc) || tr < 0 || tr >= 6 || tc < 0 || tc >= 6) {
        return fail();
      }
      if (state.turn === 'p1' && parts[0] === 'k') {
        const legal = getKingsEscapeKingMoves(state);
        if (!legal.some(([r, c]) => r === tr && c === tc)) return fail();
        const next: KingsEscapeState = {
          ...state,
          king: [tr, tc],
          lastEvent: `King stepped to (${tr + 1}, ${tc + 1})`,
          turn: 'p2',
          winner: tr === 5 ? 'p1' : null,
          moveCount: state.moveCount + 1
        };
        if (!next.winner && getKingsEscapeChaserMoves(next).length === 0) {
          next.winner = 'p1';
        }
        return { valid: true, extraTurn: false, capturedOrScored: false, nextState: next };
      }
      if (state.turn === 'p2') {
        const idx = Number(parts[0]);
        const legal = getKingsEscapeChaserMoves(state);
        if (!legal.some(m => m.idx === idx && m.to[0] === tr && m.to[1] === tc)) return fail();
        const chasers = state.chasers.map(p => [...p] as [number, number]);
        chasers[idx] = [tr, tc];
        const next: KingsEscapeState = {
          ...state,
          chasers,
          lastEvent: `Blocker #${idx + 1} moved to (${tr + 1}, ${tc + 1})`,
          turn: 'p1',
          winner: null,
          moveCount: state.moveCount + 1
        };
        if (getKingsEscapeKingMoves(next).length === 0) {
          next.winner = 'p2';
          next.turn = 'p2';
        }
        return { valid: true, extraTurn: false, capturedOrScored: false, nextState: next };
      }
      return fail();
    }

    case 'wordle-duel': {
      if (state.phase === 'set' && action.startsWith('wds:')) {
        let word = action.slice(4).trim().toLowerCase();
        if (word.startsWith('auto:')) {
          const seed = Number(word.slice(5)) || 17;
          word = WORDLE_5_WORDS[Math.abs(seed) % WORDLE_5_WORDS.length];
        }
        word = word.replace(/[^a-z]/g, '');
        if (word.length !== 5) return fail();
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            phase: 'guess',
            secret: word,
            guesses: [],
            turn: state.guesser,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (state.phase === 'guess' && action.startsWith('wdg:')) {
        const word = action.slice(4).trim().toLowerCase().replace(/[^a-z]/g, '');
        if (word.length !== 5 || !state.secret) return fail();
        const marks = evaluateWordleGuess(state.secret, word);
        const guesses = [...state.guesses, { word, marks }];
        const solved = word === state.secret;
        if (!solved && guesses.length < 6) {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, guesses, moveCount: state.moveCount + 1 }
          };
        }
        const roundScores = { ...state.roundScores };
        roundScores[state.guesser] = solved ? guesses.length : 7;
        if (state.round === 1) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: solved,
            nextState: {
              ...state,
              round: 2,
              setter: 'p2',
              guesser: 'p1',
              phase: 'set',
              secret: null,
              guesses: [],
              roundScores,
              turn: 'p2',
              moveCount: state.moveCount + 1
            }
          };
        }
        const s1 = roundScores.p1 ?? 7;
        const s2 = roundScores.p2 ?? 7;
        const winner: ArcadeWinner = s1 < s2 ? 'p1' : s2 < s1 ? 'p2' : 'draw';
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: solved,
          nextState: {
            ...state,
            guesses,
            roundScores,
            winner,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    case 'hangman-duel': {
      if (state.phase === 'set' && action.startsWith('hms:')) {
        let word = action.slice(4).trim().toLowerCase();
        if (word.startsWith('auto:')) {
          const seed = Number(word.slice(5)) || 23;
          word = HANGMAN_WORDS[Math.abs(seed) % HANGMAN_WORDS.length];
        }
        word = word.replace(/[^a-z]/g, '').slice(0, 14);
        if (word.length < 3) return fail();
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            phase: 'guess',
            secret: word,
            guessedLetters: [],
            misses: 0,
            turn: state.guesser,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (state.phase === 'guess' && action.startsWith('hml:')) {
        const ch = action.slice(4).trim().toLowerCase().slice(0, 1);
        if (!/^[a-z]$/.test(ch) || !state.secret || state.guessedLetters.includes(ch)) return fail();
        const guessedLetters = [...state.guessedLetters, ch];
        const hit = state.secret.includes(ch);
        const misses = hit ? state.misses : state.misses + 1;
        const solved = state.secret.split('').every(c => guessedLetters.includes(c));
        const failed = misses >= 6;
        if (!solved && !failed) {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: hit,
            nextState: {
              ...state,
              guessedLetters,
              misses,
              moveCount: state.moveCount + 1
            }
          };
        }
        const scores = { ...state.scores };
        if (solved) scores[state.guesser] += Math.max(1, 6 - misses);
        else scores[state.setter] += 2;
        const lastSummary = solved
          ? `Round ${state.round}: Solved "${state.secret.toUpperCase()}"!`
          : `Round ${state.round}: Missed! Word was "${state.secret.toUpperCase()}".`;
        if (state.round >= state.maxRounds) {
          const winner: ArcadeWinner =
            scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw';
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: solved,
            nextState: {
              ...state,
              guessedLetters,
              misses,
              scores,
              lastSummary,
              winner,
              moveCount: state.moveCount + 1
            }
          };
        }
        const nextSetter = oppOf(state.setter);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: solved,
          nextState: {
            ...state,
            round: state.round + 1,
            setter: nextSetter,
            guesser: oppOf(nextSetter),
            phase: 'set',
            secret: null,
            guessedLetters: [],
            misses: 0,
            scores,
            lastSummary,
            turn: nextSetter,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    case 'mastermind': {
      if (state.phase === 'set' && action.startsWith('mms:')) {
        let codeStr = action.slice(4).trim();
        let code: number[] = [];
        if (codeStr.startsWith('auto:')) {
          const rng = seededPrng(Number(codeStr.slice(5)) || 99);
          code = [0, 1, 2, 3].map(() => Math.floor(rng() * 6));
        } else {
          if (codeStr.length !== 4 || /[^0-5]/.test(codeStr)) return fail();
          code = codeStr.split('').map(Number);
        }
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            phase: 'guess',
            secret: code,
            rows: [],
            turn: state.breaker,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (state.phase === 'guess' && action.startsWith('mmg:')) {
        const codeStr = action.slice(4).trim();
        if (codeStr.length !== 4 || /[^0-5]/.test(codeStr) || !state.secret) return fail();
        const code = codeStr.split('').map(Number);
        const { exact, close } = evalMastermind(state.secret, code);
        const rows = [...state.rows, { code, exact, close }];
        const solved = exact === 4;
        if (!solved && rows.length < 8) {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: exact > 0,
            nextState: { ...state, rows, moveCount: state.moveCount + 1 }
          };
        }
        const scores = { ...state.scores };
        scores[state.breaker] = solved ? rows.length : 9;
        if (state.round === 1) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: solved,
            nextState: {
              ...state,
              round: 2,
              setter: 'p2',
              breaker: 'p1',
              phase: 'set',
              secret: null,
              rows: [],
              scores,
              turn: 'p2',
              moveCount: state.moveCount + 1
            }
          };
        }
        const s1 = scores.p1 ?? 9;
        const s2 = scores.p2 ?? 9;
        const winner: ArcadeWinner = s1 < s2 ? 'p1' : s2 < s1 ? 'p2' : 'draw';
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: solved,
          nextState: { ...state, rows, scores, winner, moveCount: state.moveCount + 1 }
        };
      }
      return fail();
    }

    case 'hilo-target': {
      if (!action.startsWith('hl:')) return fail();
      const parts = action.slice(3).split(':');
      const guess = Number(parts[0]);
      if (!Number.isInteger(guess) || guess < 1 || guess > 100) return fail();
      let target = state.target;
      if (state.moveCount === 0 && parts[1]) {
        const seed = Number(parts[1]);
        if (Number.isFinite(seed)) target = (Math.abs(Math.floor(seed)) % 100) + 1;
      }
      const hint: 'higher' | 'lower' | 'exact' =
        guess === target ? 'exact' : guess < target ? 'higher' : 'lower';
      const lowBound = hint === 'higher' ? Math.max(state.lowBound, guess + 1) : state.lowBound;
      const highBound = hint === 'lower' ? Math.min(state.highBound, guess - 1) : state.highBound;
      const winner: ArcadeWinner = hint === 'exact' ? state.turn : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: hint === 'exact',
        nextState: {
          ...state,
          target,
          lowBound,
          highBound,
          history: [...state.history, { by: state.turn, guess, hint }],
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'word-chain': {
      if (!action.startsWith('wc:')) return fail();
      const word = action.slice(3).trim().toLowerCase().replace(/[^a-z]/g, '').slice(0, 20);
      if (word.length < 3 || word[0] !== state.requiredLetter) return fail();
      if (state.words.some(w => w.word === word)) return fail();
      const pts = word.length + (word.length >= 6 ? 2 : 0);
      const words = [...state.words, { word, by: state.turn, pts }];
      const scores = { ...state.scores, [state.turn]: state.scores[state.turn] + pts };
      const done = state.moveCount + 1 >= state.maxTurns;
      const winner: ArcadeWinner = done
        ? scores.p1 > scores.p2
          ? 'p1'
          : scores.p2 > scores.p1
          ? 'p2'
          : 'draw'
        : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: true,
        nextState: {
          ...state,
          words,
          requiredLetter: word[word.length - 1],
          scores,
          lastError: null,
          turn: winner ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'blackjack-21': {
      if (action.startsWith('bj:deal')) {
        if (state.hands.p1.length > 0) return fail();
        const seed = Number(action.split(':')[2]) || (state.moveCount + 1) * 7919;
        const rng = seededPrng(seed);
        const deck = Array.from({ length: 52 }, (_, i) => i);
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            deck,
            deckPos: 4,
            hands: { p1: [deck[0], deck[2]], p2: [deck[1], deck[3]] },
            stood: { p1: false, p2: false },
            turn: 'p1',
            moveCount: state.moveCount + 1
          }
        };
      }

      if (state.hands.p1.length === 0) return fail();
      const p = state.turn;
      if (action === 'bj:hit') {
        const card = state.deck[state.deckPos % 52];
        const hands = { ...state.hands, [p]: [...state.hands[p], card] };
        const total = cardValue21(hands[p]);
        const nextDeckPos = state.deckPos + 1;

        if (total > 21) {
          // Bust! Opponent wins round immediately
          const rw = oppOf(p);
          const scores = { ...state.scores, [rw]: state.scores[rw] + 1 };
          const summary = `Round ${state.round}: ${p.toUpperCase()} busted (${total})! ${rw.toUpperCase()} wins hand.`;
          if (state.round >= state.maxRounds) {
            return {
              valid: true,
              extraTurn: false,
              capturedOrScored: true,
              nextState: {
                ...state,
                hands,
                deckPos: nextDeckPos,
                scores,
                lastSummary: summary,
                winner: scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw',
                moveCount: state.moveCount + 1
              }
            };
          }
          // Deal next round immediately from remaining deck
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              round: state.round + 1,
              deckPos: nextDeckPos + 4,
              hands: {
                p1: [state.deck[nextDeckPos % 52], state.deck[(nextDeckPos + 2) % 52]],
                p2: [state.deck[(nextDeckPos + 1) % 52], state.deck[(nextDeckPos + 3) % 52]]
              },
              stood: { p1: false, p2: false },
              scores,
              lastSummary: summary,
              turn: 'p1',
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
            deckPos: nextDeckPos,
            hands,
            moveCount: state.moveCount + 1
          }
        };
      }

      if (action === 'bj:stand') {
        const stood = { ...state.stood, [p]: true };
        if (!stood.p2 && p === 'p1') {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: { ...state, stood, turn: 'p2', moveCount: state.moveCount + 1 }
          };
        }
        // Both stood — score round!
        const t1 = cardValue21(state.hands.p1);
        const t2 = cardValue21(state.hands.p2);
        const scores = { ...state.scores };
        let summary = `Round ${state.round}: Tie at ${t1}!`;
        if (t1 > t2) {
          scores.p1 += 1;
          summary = `Round ${state.round}: Seat 1 (${t1}) beats Seat 2 (${t2})!`;
        } else if (t2 > t1) {
          scores.p2 += 1;
          summary = `Round ${state.round}: Seat 2 (${t2}) beats Seat 1 (${t1})!`;
        }
        if (state.round >= state.maxRounds) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              stood,
              scores,
              lastSummary: summary,
              winner: scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw',
              moveCount: state.moveCount + 1
            }
          };
        }
        const dp = state.deckPos;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            round: state.round + 1,
            deckPos: dp + 4,
            hands: {
              p1: [state.deck[dp % 52], state.deck[(dp + 2) % 52]],
              p2: [state.deck[(dp + 1) % 52], state.deck[(dp + 3) % 52]]
            },
            stood: { p1: false, p2: false },
            scores,
            lastSummary: summary,
            turn: 'p1',
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    case 'yacht-dice': {
      if (action.startsWith('yd:toggle:')) {
        if (state.rollsLeft === 3 || state.rollsLeft === 0) return fail();
        const idx = Number(action.slice(10));
        if (!Number.isInteger(idx) || idx < 0 || idx >= 5) return fail();
        const held = [...state.held];
        held[idx] = !held[idx];
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, held, moveCount: state.moveCount + 1 }
        };
      }
      if (action.startsWith('yd:roll')) {
        if (state.rollsLeft <= 0) return fail();
        const payload = action.split(':')[2] || '';
        let newDice: number[];
        if (payload.length === 5 && /^[1-6]{5}$/.test(payload)) {
          newDice = payload.split('').map((ch, i) => (state.held[i] && state.dice[i] > 0 ? state.dice[i] : Number(ch)));
        } else {
          const rng = seededPrng(Number(payload) || (state.moveCount + 11) * 977);
          newDice = state.dice.map((d, i) => (state.held[i] && d > 0 ? d : Math.floor(rng() * 6) + 1));
        }
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            dice: newDice,
            rollsLeft: state.rollsLeft - 1,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (action.startsWith('yd:score:')) {
        if (state.rollsLeft === 3) return fail();
        const cat = action.slice(9) as 'pair' | 'trips' | 'full' | 'straight' | 'yacht';
        if (!['pair', 'trips', 'full', 'straight', 'yacht'].includes(cat)) return fail();
        if (state.usedCats[state.turn][cat] !== undefined) return fail();
        const pts = scoreYachtCategory(state.dice, cat);
        const usedCats = {
          ...state.usedCats,
          [state.turn]: { ...state.usedCats[state.turn], [cat]: pts }
        };
        const scores = { ...state.scores, [state.turn]: state.scores[state.turn] + pts };
        const p1Done = Object.keys(usedCats.p1).length >= 5;
        const p2Done = Object.keys(usedCats.p2).length >= 5;
        const nextTurn = oppOf(state.turn);
        const nextRound = nextTurn === 'p1' ? state.round + 1 : state.round;
        const done = p1Done && p2Done;
        const winner: ArcadeWinner = done
          ? scores.p1 > scores.p2
            ? 'p1'
            : scores.p2 > scores.p1
            ? 'p2'
            : 'draw'
          : null;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: pts > 0,
          nextState: {
            ...state,
            round: done ? state.round : nextRound,
            dice: [0, 0, 0, 0, 0],
            held: [false, false, false, false, false],
            rollsLeft: 3,
            usedCats,
            scores,
            lastSummary: `${state.turn === 'p1' ? 'P1' : 'P2'} scored +${pts} in ${cat.toUpperCase()}`,
            turn: winner ? state.turn : nextTurn,
            winner,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    case 'tug-of-war': {
      if (!action.startsWith('tw:')) return fail();
      const bid = Number(action.slice(3));
      const avail = state.energy[state.turn];
      if (!Number.isInteger(bid) || bid < 0 || bid > 6 || bid > avail) return fail();
      if (avail > 0 && bid < 1) return fail();

      if (state.turn === 'p1') {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            pendingP1Bid: bid,
            turn: 'p2',
            moveCount: state.moveCount + 1
          }
        };
      }

      const p1Bid = state.pendingP1Bid ?? 0;
      const p2Bid = bid;
      const energy = {
        p1: Math.max(0, state.energy.p1 - p1Bid),
        p2: Math.max(0, state.energy.p2 - p2Bid)
      };
      let ropePos = state.ropePos;
      let rw: ArcadePlayer | 'draw' = 'draw';
      if (p1Bid > p2Bid) {
        ropePos = Math.max(-3, ropePos - 1);
        rw = 'p1';
      } else if (p2Bid > p1Bid) {
        ropePos = Math.min(3, ropePos + 1);
        rw = 'p2';
      }
      let winner: ArcadeWinner = null;
      if (ropePos <= -3) winner = 'p1';
      else if (ropePos >= 3) winner = 'p2';
      else if (state.round >= 9) winner = ropePos < 0 ? 'p1' : ropePos > 0 ? 'p2' : 'draw';

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: rw !== 'draw',
        nextState: {
          ...state,
          round: winner ? state.round : state.round + 1,
          ropePos,
          energy,
          pendingP1Bid: null,
          lastRound: { round: state.round, p1Bid, p2Bid, winner: rw },
          turn: winner ? 'p2' : 'p1',
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'rps-arena': {
      if (!action.startsWith('rp:')) return fail();
      const choice = action.slice(3) as RpsChoice;
      if (!['rock', 'paper', 'scissors', 'lizard', 'spock'].includes(choice)) return fail();
      if (state.turn === 'p1') {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            pendingP1: choice,
            turn: 'p2',
            moveCount: state.moveCount + 1
          }
        };
      }
      const p1 = state.pendingP1 || 'rock';
      const p2 = choice;
      const beats: Record<RpsChoice, RpsChoice[]> = {
        rock: ['scissors', 'lizard'],
        paper: ['rock', 'spock'],
        scissors: ['paper', 'lizard'],
        lizard: ['paper', 'spock'],
        spock: ['rock', 'scissors']
      };
      let rw: ArcadePlayer | 'draw' = 'draw';
      let note = `Tie (${p1} vs ${p2})`;
      if (p1 !== p2) {
        if (beats[p1].includes(p2)) {
          rw = 'p1';
          note = `${p1.toUpperCase()} beats ${p2.toUpperCase()}!`;
        } else {
          rw = 'p2';
          note = `${p2.toUpperCase()} beats ${p1.toUpperCase()}!`;
        }
      }
      const scores = { ...state.scores };
      if (rw === 'p1') scores.p1 += 1;
      else if (rw === 'p2') scores.p2 += 1;
      let winner: ArcadeWinner = null;
      if (scores.p1 >= 4) winner = 'p1';
      else if (scores.p2 >= 4) winner = 'p2';
      else if (state.round >= state.maxRounds) {
        winner = scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw';
      }
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: rw !== 'draw',
        nextState: {
          ...state,
          round: winner ? state.round : state.round + 1,
          pendingP1: null,
          scores,
          lastRound: { p1, p2, winner: rw, note },
          turn: winner ? 'p2' : 'p1',
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'penalty-kick': {
      if (!action.startsWith('pk:')) return fail();
      const zone = Number(action.slice(3));
      if (!Number.isInteger(zone) || zone < 0 || zone > 4) return fail();
      if (state.pendingShot === null) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            pendingShot: zone,
            turn: state.keeper,
            moveCount: state.moveCount + 1
          }
        };
      }
      const shot = state.pendingShot;
      const dive = zone;
      const goal = shot !== dive;
      const scores = { ...state.scores };
      if (goal) scores[state.shooter] += 1;
      const history = [...state.history, { shooter: state.shooter, shot, dive, goal }];
      const nextKick = state.kickNumber + 1;
      const done = state.kickNumber >= 10;
      const winner: ArcadeWinner = done
        ? scores.p1 > scores.p2
          ? 'p1'
          : scores.p2 > scores.p1
          ? 'p2'
          : 'draw'
        : null;
      const nextShooter = oppOf(state.shooter);
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: goal,
        nextState: {
          ...state,
          kickNumber: done ? state.kickNumber : nextKick,
          shooter: nextShooter,
          keeper: oppOf(nextShooter),
          pendingShot: null,
          scores,
          history,
          turn: winner ? state.turn : nextShooter,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'mines-duel': {
      if (!action.startsWith('mn:')) return fail();
      const parts = action.slice(3).split(':');
      const idx = Number(parts[0]);
      if (!Number.isInteger(idx) || idx < 0 || idx >= 36) return fail();
      if (state.revealedBy[idx] !== null) return fail();

      let mines = state.mines;
      let adjCounts = state.adjCounts;
      if (state.moveCount === 0) {
        const seed = Number(parts[1]) || 4049;
        const rng = seededPrng(seed);
        const indices = Array.from({ length: 36 }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        mines = Array<boolean>(36).fill(false);
        for (let k = 0; k < 11; k++) mines[indices[k]] = true;
        adjCounts = Array<number>(36).fill(0);
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            let cnt = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && mines[nr * 6 + nc]) cnt++;
              }
            }
            adjCounts[r * 6 + c] = cnt;
          }
        }
      }

      const revealedBy = [...state.revealedBy];
      const scores = { ...state.scores };
      const hitMine = mines[idx];
      if (hitMine) {
        revealedBy[idx] = state.turn;
        scores[state.turn] += 1;
      } else {
        // Flood-fill 0-cells
        const queue = [idx];
        while (queue.length > 0) {
          const cur = queue.shift()!;
          if (revealedBy[cur] !== null || mines[cur]) continue;
          revealedBy[cur] = state.turn;
          if (adjCounts[cur] === 0) {
            const cr = Math.floor(cur / 6);
            const cc = cur % 6;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = cr + dr;
                const nc = cc + dc;
                if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
                  const nidx = nr * 6 + nc;
                  if (revealedBy[nidx] === null && !mines[nidx]) queue.push(nidx);
                }
              }
            }
          }
        }
      }

      const unrevealedMines = mines.filter((m, i) => m && revealedBy[i] === null).length;
      let winner: ArcadeWinner = null;
      if (scores.p1 >= state.targetFlags) winner = 'p1';
      else if (scores.p2 >= state.targetFlags) winner = 'p2';
      else if (unrevealedMines === 0) {
        winner = scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw';
      }

      return {
        valid: true,
        extraTurn: hitMine && !winner,
        capturedOrScored: hitMine,
        nextState: {
          ...state,
          mines,
          adjCounts,
          revealedBy,
          scores,
          lastCell: idx,
          turn: winner ? state.turn : hitMine ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    case 'sos-grid': {
      if (!action.startsWith('so:')) return fail();
      const [rS, cS, ch] = action.slice(3).split(',');
      const r = Number(rS);
      const c = Number(cS);
      if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= 5 || c < 0 || c >= 5) return fail();
      if ((ch !== 'S' && ch !== 'O') || state.board[r][c] !== null) return fail();

      const board = state.board.map(row => [...row]);
      board[r][c] = ch;
      const newLines: [number, number][][] = [];
      const dirs = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
      ];
      const inB = (rr: number, cc: number) => rr >= 0 && rr < 5 && cc >= 0 && cc < 5;

      if (ch === 'O') {
        for (const [dr, dc] of dirs) {
          if (inB(r - dr, c - dc) && inB(r + dr, c + dc) && board[r - dr][c - dc] === 'S' && board[r + dr][c + dc] === 'S') {
            newLines.push([
              [r - dr, c - dc],
              [r, c],
              [r + dr, c + dc]
            ]);
          }
        }
      } else {
        for (const [dr, dc] of [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
          [1, 1],
          [-1, -1],
          [1, -1],
          [-1, 1]
        ]) {
          if (
            inB(r + dr, c + dc) &&
            inB(r + dr * 2, c + dc * 2) &&
            board[r + dr][c + dc] === 'O' &&
            board[r + dr * 2][c + dc * 2] === 'S'
          ) {
            newLines.push([
              [r, c],
              [r + dr, c + dc],
              [r + dr * 2, c + dc * 2]
            ]);
          }
        }
      }

      const scored = newLines.length;
      const scores = { ...state.scores, [state.turn]: state.scores[state.turn] + scored };
      const full = board.every(row => row.every(cell => cell !== null));
      const winner: ArcadeWinner = full
        ? scores.p1 > scores.p2
          ? 'p1'
          : scores.p2 > scores.p1
          ? 'p2'
          : 'draw'
        : null;

      return {
        valid: true,
        extraTurn: scored > 0 && !winner,
        capturedOrScored: scored > 0,
        nextState: {
          ...state,
          board,
          scores,
          completedLines: [...state.completedLines, ...newLines],
          lastCell: [r, c],
          turn: winner ? state.turn : scored > 0 ? state.turn : oppOf(state.turn),
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }
  }
}

// ---------------- SMART BOT AI FOR ALL 30 EXTENDED GAMES ----------------

export function pickExtendedBotAction(state: ExtendedArcadeState, botObj: ArcadeBot): string | null {
  if (state.winner) return null;
  const bot = state.turn;
  const opp = oppOf(bot);
  const diff = botObj.difficulty;
  const legal = getExtendedLegalActions(state);

  switch (state.gameType) {
    case 'pixel-guess': {
      if (state.phase === 'pick') {
        const known = state.wordChoices.filter(w => Boolean(PIXEL_BOT_TEMPLATES[w]));
        return `pw:${pickRandom(known.length > 0 ? known : state.wordChoices)}`;
      }
      if (state.phase === 'draw') {
        const tmpl = PIXEL_BOT_TEMPLATES[state.word || 'heart'] || PIXEL_BOT_TEMPLATES.heart;
        const alreadyPainted = state.grid.some(v => v !== 0);
        if (!alreadyPainted) return `pb:${tmpl.join('')}`;
        return 'pd';
      }
      const target = state.word || 'heart';
      const chance = diff === 'expert' ? 0.85 : diff === 'hard' ? 0.68 : diff === 'medium' ? 0.45 : 0.25;
      if (Math.random() < chance) return `pg:${target}`;
      const decoys = PIXEL_WORD_BANK.filter(w => w !== target && !state.guesses.some(g => g.text === w));
      return `pg:${pickRandom(decoys.length > 0 ? decoys : PIXEL_WORD_BANK)}`;
    }

    case 'emoji-charades': {
      if (state.phase === 'pick') return `ew:${pickRandom(state.promptChoices)}`;
      if (state.phase === 'clue') {
        const match = EMOJI_CHARADES_LIST.find(e => e.answer === state.secret);
        const clue = match ? match.sample : ['✨', '🎯', '❓'];
        return `ep:${clue.join('|')}`;
      }
      const secret = state.secret || 'pizza party';
      const chance = diff === 'expert' ? 0.85 : diff === 'hard' ? 0.65 : diff === 'medium' ? 0.45 : 0.25;
      if (Math.random() < chance) return `eg:${secret}`;
      const decoys = EMOJI_CHARADES_LIST.map(e => e.answer).filter(
        w => w !== secret && !state.guesses.some(g => g.text === w)
      );
      return `eg:${pickRandom(decoys.length > 0 ? decoys : ['space rocket'])}`;
    }

    case 'nim':
    case 'misere-nim': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (diff !== 'easy') {
        const isMisere = state.gameType === 'misere-nim';
        const xorAll = state.heaps.reduce((a, b) => a ^ b, 0);
        if (isMisere) {
          // Misere Nim: play normal Nim until all remaining heaps would be size <= 1
          const gt1 = state.heaps.filter(h => h > 1).length;
          if (gt1 <= 1) {
            for (const act of legal) {
              const after = applyExtendedArcadeAction(state, act).nextState as MisereNimState;
              const ones = after.heaps.filter(h => h === 1).length;
              const bigs = after.heaps.filter(h => h > 1).length;
              if (bigs === 0 && ones % 2 === 1) return act;
            }
          }
        }
        if (xorAll !== 0) {
          for (const act of legal) {
            const after = applyExtendedArcadeAction(state, act).nextState as NimState;
            if (after.heaps.reduce((a, b) => a ^ b, 0) === 0) return act;
          }
        }
      }
      return pickRandom(legal);
    }

    case 'chomp': {
      // Never take poison if avoidable
      const safe = legal.filter(a => a !== 'ch:0,0');
      if (safe.length === 0) return 'ch:0,0';
      if (diff !== 'easy') {
        // Leave only [0,0] for instant win!
        for (const act of safe) {
          const after = applyExtendedArcadeAction(state, act).nextState as ChompState;
          if (getExtendedLegalActions(after).length === 1) return act;
        }
        // Symmetric L-shape strategy on (r === c) or reducing big blocks
        for (const act of safe) {
          const after = applyExtendedArcadeAction(state, act).nextState as ChompState;
          const rem = after.eaten.flat().filter(e => !e).length;
          if (rem === 3 && !after.eaten[0][1] && !after.eaten[1][0]) return act; // golden L of 3!
        }
      }
      return pickRandom(safe);
    }

    case 'hex': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (diff === 'easy') return pickRandom(legal);
      // Score proximity to center & connecting own bridges
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const [r, c] = act.slice(3).split(',').map(Number);
        let s = (3 - Math.abs(r - 3)) + (3 - Math.abs(c - 3));
        // Bridge / neighbor bonus
        for (const [dr, dc] of [
          [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]
        ]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) {
            if (state.board[nr][nc] === bot) s += 4.2;
            else if (state.board[nr][nc] === opp) s += 1.6;
          }
        }
        if (bot === 'p1') s += (3 - Math.abs(c - 3)) * 0.5;
        else s += (3 - Math.abs(r - 3)) * 0.5;
        if (diff === 'medium') s += Math.random() * 4;
        if (s > bestScore) {
          bestScore = s;
          best = act;
        }
      }
      return best;
    }

    case 'grid-link-4':
    case 'misere-ttt': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (state.gameType === 'misere-ttt') {
        const nonLosing = legal.filter(act => applyExtendedArcadeAction(state, act).nextState.winner !== opp);
        const pool = nonLosing.length > 0 ? nonLosing : legal;
        if (diff !== 'easy' && pool.includes('mt:4')) return 'mt:4';
        return pickRandom(pool);
      }
      if (diff !== 'easy') {
        for (const act of legal) {
          const oppSim = { ...state, turn: opp };
          if (applyExtendedArcadeAction(oppSim, act).nextState.winner === opp) return act;
        }
      }
      return pickRandom(legal);
    }

    case 'order-chaos': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (diff !== 'easy') {
        // Order looks for line extensions; Chaos disrupts 3-in-a-rows
        let best = legal[0];
        let bestScore = -999;
        const dirs = [
          [0, 1],
          [1, 0],
          [1, 1],
          [1, -1]
        ];
        for (const act of legal.slice(0, 48)) {
          const [rS, cS, sym] = act.slice(3).split(',');
          const r = Number(rS);
          const c = Number(cS);
          let s = (3 - Math.abs(r - 2.5)) + (3 - Math.abs(c - 2.5));
          for (const [dr, dc] of dirs) {
            let same = 0;
            let other = 0;
            for (const dir of [-1, 1]) {
              for (let k = 1; k <= 2; k++) {
                const nr = r + dr * k * dir;
                const nc = c + dc * k * dir;
                if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
                  if (state.board[nr][nc] === sym) same++;
                  else if (state.board[nr][nc] !== null) other++;
                }
              }
            }
            if (bot === 'p1') s += other === 0 ? same * 4 : -same;
            else s += other * 3.5 - same * 1.5;
          }
          if (s > bestScore) {
            bestScore = s;
            best = act;
          }
        }
        return best;
      }
      return pickRandom(legal);
    }

    case 'gravity-5': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (diff !== 'easy') {
        for (const act of legal) {
          const oppSim = { ...state, turn: opp };
          if (applyExtendedArcadeAction(oppSim, act).nextState.winner === opp) return act;
        }
        const pref = ['g5:4', 'g5:3', 'g5:5', 'g5:2', 'g5:6'];
        const match = pref.find(p => legal.includes(p));
        if (match && Math.random() < 0.7) return match;
      }
      return pickRandom(legal);
    }

    case 'snort':
    case 'col-clash':
    case 'domineering':
    case 'cram':
    case 'obstruction': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (diff === 'easy') return pickRandom(legal);
      let best = legal[0];
      let bestScore = -9999;
      for (const act of legal.slice(0, 32)) {
        const after = applyExtendedArcadeAction(state, act).nextState;
        const oppMoves = getExtendedLegalActions(after).length;
        const selfNext = getExtendedLegalActions({ ...after, turn: bot } as ExtendedArcadeState).length;
        const score = (selfNext - oppMoves * 1.3) + (diff === 'medium' ? Math.random() * 2 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'ataxx': {
      if (diff === 'easy') return pickRandom(legal);
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const res = applyExtendedArcadeAction(state, act);
        const after = res.nextState as AtaxxState;
        const gain = after.counts[bot] - state.counts[bot];
        const score = gain * 5 + (res.nextState.winner === bot ? 1000 : 0) + Math.random() * 0.5;
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'breakthrough': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (diff === 'easy') return pickRandom(legal);
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const res = applyExtendedArcadeAction(state, act);
        const toRow = Number(act.split('-')[1].split(',')[0]);
        const progress = bot === 'p1' ? 5 - toRow : toRow;
        const score =
          progress * 4 + (res.capturedOrScored ? 14 : 0) + (diff === 'medium' ? Math.random() * 4 : 0);
        if (score > bestScore) {
          bestScore = score;
          best = act;
        }
      }
      return best;
    }

    case 'kings-escape': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).nextState.winner === bot) return act;
      }
      if (bot === 'p1') {
        return legal.sort((a, b) => Number(b.split(',')[1]) - Number(a.split(',')[1]))[0] || legal[0];
      }
      // Chasers try to minimize distance to the king
      let best = legal[0];
      let bestScore = -999;
      const [kr, kc] = state.king;
      for (const act of legal) {
        const [, trS, tcS] = act.split(',');
        const tr = Number(trS);
        const tc = Number(tcS);
        const dist = Math.abs(tr - kr) + Math.abs(tc - kc);
        const s = -dist + (tr > kr ? 2 : 0) + Math.random() * 0.5;
        if (s > bestScore) {
          bestScore = s;
          best = act;
        }
      }
      return best;
    }

    case 'wordle-duel': {
      if (state.phase === 'set') return `wds:${pickRandom(WORDLE_5_WORDS)}`;
      const secret = state.secret || 'melon';
      const used = new Set(state.guesses.map(g => g.word));
      if (state.guesses.length >= (diff === 'expert' ? 2 : diff === 'hard' ? 3 : 4) && !used.has(secret)) {
        return `wdg:${secret}`;
      }
      const cands = WORDLE_5_WORDS.filter(w => !used.has(w));
      return `wdg:${pickRandom(cands.length > 0 ? cands : WORDLE_5_WORDS)}`;
    }

    case 'hangman-duel': {
      if (state.phase === 'set') return `hms:${pickRandom(HANGMAN_WORDS)}`;
      const freqOrder = 'eariotnslcudpmhgbfywkvxzjq'.split('');
      const hitLetters = freqOrder.filter(
        ch => !state.guessedLetters.includes(ch) && state.secret?.includes(ch)
      );
      const missLetters = freqOrder.filter(
        ch => !state.guessedLetters.includes(ch) && !state.secret?.includes(ch)
      );
      const hitChance = diff === 'expert' ? 0.85 : diff === 'hard' ? 0.72 : diff === 'medium' ? 0.55 : 0.35;
      if (hitLetters.length > 0 && (Math.random() < hitChance || missLetters.length === 0)) {
        return `hml:${hitLetters[0]}`;
      }
      return pickRandom(legal);
    }

    case 'mastermind': {
      if (state.phase === 'set') {
        return `mms:${[0, 1, 2, 3].map(() => Math.floor(Math.random() * 6)).join('')}`;
      }
      const secret = state.secret || [0, 1, 2, 3];
      if (state.rows.length >= (diff === 'expert' ? 3 : diff === 'hard' ? 4 : 6)) {
        return `mmg:${secret.join('')}`;
      }
      return `mmg:${[0, 1, 2, 3].map(() => Math.floor(Math.random() * 6)).join('')}`;
    }

    case 'hilo-target': {
      const span = state.highBound - state.lowBound;
      const mid = Math.floor((state.lowBound + state.highBound) / 2);
      const guess =
        diff === 'easy'
          ? state.lowBound + Math.floor(Math.random() * Math.max(1, span + 1))
          : Math.min(state.highBound, Math.max(state.lowBound, mid + (diff === 'medium' ? Math.floor(Math.random() * 5) - 2 : 0)));
      return state.moveCount === 0 ? `hl:${guess}:${Math.floor(Math.random() * 900) + 1}` : `hl:${guess}`;
    }

    case 'word-chain': {
      const used = new Set(state.words.map(w => w.word));
      const letter = state.requiredLetter || 'a';
      const dict = WORD_CHAIN_BOT_DICT[letter] || [];
      const pool = Array.from(new Set([...dict, ...WORD_CHAIN_SEEDS])).filter(
        w => w[0] === letter && !used.has(w)
      );
      if (pool.length > 0) {
        pool.sort((a, b) => (diff === 'easy' ? a.length - b.length : b.length - a.length));
        return `wc:${pool[0]}`;
      }
      const suffixes = ['eon', 'ova', 'est', 'ark', 'aze', 'ora', 'ion', 'urn', 'ix', 'aft'];
      for (const suf of suffixes) {
        const cand = `${letter}${suf}`;
        if (!used.has(cand)) return `wc:${cand}`;
      }
      const codeAlpha = 'abcdefghijklmnopqrstuvwxyz';
      for (let i = 0; i < 26; i++) {
        const cand = `${letter}${codeAlpha[i]}a`;
        if (!used.has(cand)) return `wc:${cand}`;
      }
      return `wc:${letter}win`;
    }

    case 'blackjack-21': {
      if (state.hands.p1.length === 0) return `bj:deal:${Math.floor(Math.random() * 90000) + 100}`;
      const myVal = cardValue21(state.hands[bot]);
      const p1Val = state.stood.p1 ? cardValue21(state.hands.p1) : 17;
      if (bot === 'p2' && state.stood.p1) {
        if (myVal > p1Val) return 'bj:stand';
        if (myVal < 17 || myVal < p1Val) return 'bj:hit';
        return 'bj:stand';
      }
      return myVal < (diff === 'easy' ? 15 : 17) ? 'bj:hit' : 'bj:stand';
    }

    case 'yacht-dice': {
      if (state.rollsLeft === 3) {
        const d = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1).join('');
        return `yd:roll:${d}`;
      }
      const used = state.usedCats[bot];
      const cats = (['yacht', 'straight', 'full', 'trips', 'pair'] as const).filter(c => used[c] === undefined);
      let bestCat = cats[0] || 'pair';
      let bestPts = -1;
      for (const c of cats) {
        const pts = scoreYachtCategory(state.dice, c);
        if (pts > bestPts) {
          bestPts = pts;
          bestCat = c;
        }
      }
      if (bestPts >= 20 || state.rollsLeft === 0) {
        return `yd:score:${bestCat}`;
      }
      const d = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1).join('');
      return `yd:roll:${d}`;
    }

    case 'tug-of-war':
      return pickRandom(legal);

    case 'rps-arena':
      return pickRandom(legal);

    case 'penalty-kick':
      return pickRandom(legal);

    case 'mines-duel': {
      if (state.moveCount === 0) {
        const idx = Math.floor(Math.random() * 36);
        return `mn:${idx}:${Math.floor(Math.random() * 90000) + 100}`;
      }
      // Check revealed clues to deduce guaranteed mines!
      if (diff !== 'easy') {
        for (let i = 0; i < 36; i++) {
          if (state.revealedBy[i] !== null && !state.mines[i] && state.adjCounts[i] > 0) {
            const r = Math.floor(i / 6);
            const c = i % 6;
            const hidden: number[] = [];
            let knownMines = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6) {
                  const nidx = nr * 6 + nc;
                  if (state.revealedBy[nidx] === null) hidden.push(nidx);
                  else if (state.mines[nidx]) knownMines++;
                }
              }
            }
            if (hidden.length > 0 && hidden.length === state.adjCounts[i] - knownMines) {
              return `mn:${hidden[0]}`;
            }
          }
        }
      }
      return pickRandom(legal);
    }

    case 'sos-grid': {
      for (const act of legal) {
        if (applyExtendedArcadeAction(state, act).capturedOrScored) return act;
      }
      if (diff !== 'easy') {
        const safe = legal.filter(act => {
          const after = applyExtendedArcadeAction(state, act).nextState as SosGridState;
          return !getExtendedLegalActions(after).some(r => applyExtendedArcadeAction(after, r).capturedOrScored);
        });
        if (safe.length > 0) return pickRandom(safe);
      }
      return pickRandom(legal);
    }
  }
}
