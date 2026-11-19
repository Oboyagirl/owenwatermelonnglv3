import {
  ANAGRAM_WORDS,
  BATCH2_ARCADE_GAMES,
  BOGGLE_BOARDS,
  EMOJI_STORY_LIST,
  MATH_BLITZ_PUZZLES,
  NMM_ADJ,
  NMM_MILLS,
  SUDOKU_4X4_BASES,
  SYMMETRY_BOT_TEMPLATES,
  SYMMETRY_WORDS,
  TRIVIA_BANK,
  canSpellBoggleWord,
  evalMathBlitzOp,
  hasAnyFarkleScore,
  pokerDiceRank,
  scoreFarkleDice
} from './arcadeBatch2Types.ts';
import type {
  AmazonsMiniState,
  AnagramScrambleState,
  Batch2ArcadeGameType,
  Batch2ArcadeState,
  Batch2Player,
  Batch2Winner,
  CoinRowState,
  ColorMatchState,
  EmojiStoryState,
  FarkleDuelState,
  FoxAndHoundsState,
  GoFishState,
  GoMiniState,
  GobbletMiniState,
  GobbletPiece,
  HighNoonDuelState,
  IsolaState,
  KnightDuelState,
  LiarsDiceState,
  MathBlitzState,
  NineMensMorrisState,
  PenteState,
  PokerDiceState,
  QuoridorState,
  SantoriniLiteState,
  ShogiPieceKind,
  ShogiPocketPiece,
  ShogiPocketState,
  SimonDuelState,
  SplatterTurfState,
  SudokuDuelState,
  SymmetryArtState,
  TakCellPiece,
  TakDuelState,
  TriviaShowdownState,
  TronTurnState,
  UnoCard,
  UnoColor,
  UnoDuelState
} from './arcadeBatch2Types.ts';

export interface Batch2BotProfile {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface Batch2ApplyResult {
  valid: boolean;
  nextState: Batch2ArcadeState;
  extraTurn: boolean;
  capturedOrScored: boolean;
}

const BATCH2_GAME_SET = new Set<string>(BATCH2_ARCADE_GAMES.map(g => g.id));

export function isBatch2ArcadeGameType(val: unknown): val is Batch2ArcadeGameType {
  return typeof val === 'string' && BATCH2_GAME_SET.has(val);
}

function oppOf(p: Batch2Player): Batch2Player {
  return p === 'p1' ? 'p2' : 'p1';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededPrng(seed: number): () => number {
  let s = (Math.abs(Math.floor(seed)) || 1) % 2147483647;
  if (s <= 0) s = 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const rng = seededPrng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scrambleWord(word: string, seed: number): string {
  const letters = shuffleWithSeed(word.split(''), seed + 17);
  if (letters.join('') === word && letters.length >= 2) {
    [letters[0], letters[letters.length - 1]] = [letters[letters.length - 1], letters[0]];
  }
  return letters.join('');
}

function makeTargetRgb(seed: number, round: number): [number, number, number] {
  const rng = seededPrng(seed + round * 131);
  return [
    Math.floor(rng() * 216) + 20,
    Math.floor(rng() * 216) + 20,
    Math.floor(rng() * 216) + 20
  ];
}

function computeColorAccuracy(target: [number, number, number], guess: [number, number, number]): number {
  const dr = target[0] - guess[0];
  const dg = target[1] - guess[1];
  const db = target[2] - guess[2];
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  const maxDist = Math.sqrt(255 * 255 * 3);
  return Math.max(0, Math.min(100, Math.round((1 - dist / maxDist) * 100)));
}

function computeGuessHint(target: string, guess: string): string {
  const t = target.toLowerCase();
  const g = guess.toLowerCase();
  let overlap = 0;
  const used = new Set<number>();
  for (const ch of g) {
    for (let i = 0; i < t.length; i++) {
      if (!used.has(i) && t[i] === ch) {
        used.add(i);
        overlap++;
        break;
      }
    }
  }
  return `${t.length} letters · starts with "${t[0].toUpperCase()}" · ${overlap} matching chars`;
}

function getSymmetryWordChoices(round: number, seed = 0): string[] {
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    out.push(SYMMETRY_WORDS[(round * 3 + seed + i) % SYMMETRY_WORDS.length]);
  }
  return out;
}

function getStoryChoices(round: number, seed = 0): string[] {
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    out.push(EMOJI_STORY_LIST[(round * 3 + seed + i) % EMOJI_STORY_LIST.length].answer);
  }
  return out;
}

function buildUnoDeck(seed: number): UnoCard[] {
  const colors: UnoColor[] = ['R', 'B', 'G', 'Y'];
  const cards: UnoCard[] = [];
  for (const color of colors) {
    cards.push({ color, value: '0' });
    for (let n = 1; n <= 9; n++) {
      cards.push({ color, value: String(n) });
      cards.push({ color, value: String(n) });
    }
    cards.push({ color, value: 'SKIP' });
    cards.push({ color, value: 'SKIP' });
    cards.push({ color, value: '+2' });
    cards.push({ color, value: '+2' });
  }
  for (let i = 0; i < 4; i++) {
    cards.push({ color: 'W', value: 'WILD' });
  }
  return shuffleWithSeed(cards, seed);
}

function buildGoFishPond(seed: number): string[] {
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9'];
  const cards: string[] = [];
  for (const r of ranks) {
    cards.push(r, r, r, r);
  }
  return shuffleWithSeed(cards, seed);
}

function extractGoFishBooks(hand: string[]): { nextHand: string[]; newBooks: string[] } {
  const counts = new Map<string, number>();
  for (const c of hand) counts.set(c, (counts.get(c) || 0) + 1);
  const newBooks: string[] = [];
  const nextHand: string[] = [];
  for (const [rank, count] of counts.entries()) {
    const pairs = Math.floor(count / 2);
    for (let i = 0; i < pairs; i++) newBooks.push(rank);
    if (count % 2 === 1) nextHand.push(rank);
  }
  nextHand.sort();
  return { nextHand, newBooks };
}

function buildSudokuPuzzle(seed: number): {
  solution: number[][];
  grid: (number | null)[][];
  fixed: boolean[][];
} {
  const base = SUDOKU_4X4_BASES[Math.abs(seed) % SUDOKU_4X4_BASES.length];
  const perm = shuffleWithSeed([1, 2, 3, 4], seed + 7);
  const mapVal = (v: number) => perm[v - 1];
  const solution = base.solution.map(row => row.map(mapVal));
  const fixed = base.mask.map(row => [...row]);
  const grid = solution.map((row, r) => row.map((val, c) => (fixed[r][c] ? val : null)));
  return { solution, grid, fixed };
}

// ---------------- QUORIDOR HELPERS ----------------

function quoridorCanStep(
  hWalls: boolean[][],
  vWalls: boolean[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number
): boolean {
  if (r2 < 0 || r2 >= 7 || c2 < 0 || c2 >= 7) return false;
  if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return false;
  if (r2 === r1 + 1) {
    // Moving down across edge between r1 and r1+1 at col c1
    if (c1 < 6 && hWalls[r1][c1]) return false;
    if (c1 > 0 && hWalls[r1][c1 - 1]) return false;
    return true;
  }
  if (r2 === r1 - 1) {
    if (c1 < 6 && hWalls[r2][c1]) return false;
    if (c1 > 0 && hWalls[r2][c1 - 1]) return false;
    return true;
  }
  if (c2 === c1 + 1) {
    if (r1 < 6 && vWalls[r1][c1]) return false;
    if (r1 > 0 && vWalls[r1 - 1][c1]) return false;
    return true;
  }
  if (c2 === c1 - 1) {
    if (r1 < 6 && vWalls[r1][c2]) return false;
    if (r1 > 0 && vWalls[r1 - 1][c2]) return false;
    return true;
  }
  return false;
}

function quoridorShortestDist(
  hWalls: boolean[][],
  vWalls: boolean[][],
  start: [number, number],
  goalRow: number
): number {
  const visited = Array.from({ length: 7 }, () => Array<boolean>(7).fill(false));
  const queue: [number, number, number][] = [[start[0], start[1], 0]];
  visited[start[0]][start[1]] = true;
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let head = 0;
  while (head < queue.length) {
    const [r, c, d] = queue[head++];
    if (r === goalRow) return d;
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7 && !visited[nr][nc]) {
        if (quoridorCanStep(hWalls, vWalls, r, c, nr, nc)) {
          visited[nr][nc] = true;
          queue.push([nr, nc, d + 1]);
        }
      }
    }
  }
  return -1;
}

export function getQuoridorPawnMoves(state: QuoridorState, player: Batch2Player): [number, number][] {
  const [r, c] = state.pawns[player];
  const [or, oc] = state.pawns[oppOf(player)];
  const out: [number, number][] = [];
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (!quoridorCanStep(state.hWalls, state.vWalls, r, c, nr, nc)) continue;
    if (nr === or && nc === oc) {
      // Jump straight over opponent if possible
      const jr = nr + dr;
      const jc = nc + dc;
      if (quoridorCanStep(state.hWalls, state.vWalls, nr, nc, jr, jc)) {
        out.push([jr, jc]);
      } else {
        // Side steps from opponent square
        for (const [sdr, sdc] of dirs) {
          if (Math.abs(sdr) === Math.abs(dr)) continue;
          const sr = nr + sdr;
          const sc = nc + sdc;
          if (quoridorCanStep(state.hWalls, state.vWalls, nr, nc, sr, sc)) {
            out.push([sr, sc]);
          }
        }
      }
    } else {
      out.push([nr, nc]);
    }
  }
  return out;
}

export function canPlaceQuoridorWall(
  state: QuoridorState,
  orient: 'h' | 'v',
  r: number,
  c: number
): boolean {
  if (r < 0 || r >= 6 || c < 0 || c >= 6) return false;
  if (state.hWalls[r][c] || state.vWalls[r][c]) return false;
  if (orient === 'h') {
    if ((c > 0 && state.hWalls[r][c - 1]) || (c < 5 && state.hWalls[r][c + 1])) return false;
    const nextH = state.hWalls.map(row => [...row]);
    nextH[r][c] = true;
    return (
      quoridorShortestDist(nextH, state.vWalls, state.pawns.p1, 0) !== -1 &&
      quoridorShortestDist(nextH, state.vWalls, state.pawns.p2, 6) !== -1
    );
  }
  if ((r > 0 && state.vWalls[r - 1][c]) || (r < 5 && state.vWalls[r + 1][c])) return false;
  const nextV = state.vWalls.map(row => [...row]);
  nextV[r][c] = true;
  return (
    quoridorShortestDist(state.hWalls, nextV, state.pawns.p1, 0) !== -1 &&
    quoridorShortestDist(state.hWalls, nextV, state.pawns.p2, 6) !== -1
  );
}

// ---------------- NINE MEN'S MORRIS HELPERS ----------------

function isNodeInMill(board: (Batch2Player | null)[], idx: number, player: Batch2Player): boolean {
  return NMM_MILLS.some(
    ([a, b, c]) => (a === idx || b === idx || c === idx) && board[a] === player && board[b] === player && board[c] === player
  );
}

function getNmmRemovableIndices(board: (Batch2Player | null)[], opp: Batch2Player): number[] {
  const allOpp: number[] = [];
  const nonMillOpp: number[] = [];
  for (let i = 0; i < 24; i++) {
    if (board[i] === opp) {
      allOpp.push(i);
      if (!isNodeInMill(board, i, opp)) nonMillOpp.push(i);
    }
  }
  return nonMillOpp.length > 0 ? nonMillOpp : allOpp;
}

// ---------------- SHOGI POCKET HELPERS ----------------

function getShogiTargets(
  board: (ShogiPocketPiece | null)[][],
  r: number,
  c: number,
  piece: ShogiPocketPiece
): [number, number][] {
  const dir = piece.owner === 'p1' ? -1 : 1;
  let deltas: [number, number][] = [];
  switch (piece.kind) {
    case 'L':
      deltas = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      break;
    case 'G':
      deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      break;
    case 'E':
      deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      break;
    case 'C':
      deltas = [[dir, 0]];
      break;
    case 'H':
      deltas = [[-1, 0], [1, 0], [0, -1], [0, 1], [dir, -1], [dir, 1]];
      break;
  }
  const out: [number, number][] = [];
  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 3) {
      const target = board[nr][nc];
      if (!target || target.owner !== piece.owner) {
        out.push([nr, nc]);
      }
    }
  }
  return out;
}

function findShogiLion(board: (ShogiPocketPiece | null)[][], owner: Batch2Player): [number, number] | null {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const p = board[r][c];
      if (p && p.owner === owner && p.kind === 'L') return [r, c];
    }
  }
  return null;
}

function isShogiSquareAttacked(
  board: (ShogiPocketPiece | null)[][],
  tr: number,
  tc: number,
  attacker: Batch2Player
): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const p = board[r][c];
      if (p && p.owner === attacker) {
        if (getShogiTargets(board, r, c, p).some(([ar, ac]) => ar === tr && ac === tc)) {
          return true;
        }
      }
    }
  }
  return false;
}

// ---------------- GO MINI (7x7) HELPERS ----------------

function getGoGroupAndLiberties(
  board: (Batch2Player | null)[][],
  sr: number,
  sc: number
): { group: [number, number][]; liberties: number } {
  const color = board[sr][sc];
  if (!color) return { group: [], liberties: 0 };
  const visited = Array.from({ length: 7 }, () => Array<boolean>(7).fill(false));
  const libSeen = new Set<string>();
  const group: [number, number][] = [];
  const stack: [number, number][] = [[sr, sc]];
  visited[sr][sc] = true;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    group.push([r, c]);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= 7 || nc < 0 || nc >= 7) continue;
      if (board[nr][nc] === null) {
        libSeen.add(`${nr},${nc}`);
      } else if (board[nr][nc] === color && !visited[nr][nc]) {
        visited[nr][nc] = true;
        stack.push([nr, nc]);
      }
    }
  }
  return { group, liberties: libSeen.size };
}

function boardKeyGo(board: (Batch2Player | null)[][]): string {
  return board.map(row => row.map(c => (c === 'p1' ? '1' : c === 'p2' ? '2' : '.')).join('')).join('');
}

function simulateGoPlacement(
  board: (Batch2Player | null)[][],
  r: number,
  c: number,
  player: Batch2Player,
  prevBoardKey: string | null
): { valid: boolean; nextBoard: (Batch2Player | null)[][]; captured: number } {
  if (r < 0 || r >= 7 || c < 0 || c >= 7 || board[r][c] !== null) {
    return { valid: false, nextBoard: board, captured: 0 };
  }
  const opp = oppOf(player);
  const next = board.map(row => [...row]);
  next[r][c] = player;
  let captured = 0;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7 && next[nr][nc] === opp) {
      const { group, liberties } = getGoGroupAndLiberties(next, nr, nc);
      if (liberties === 0) {
        for (const [gr, gc] of group) {
          next[gr][gc] = null;
          captured++;
        }
      }
    }
  }
  const selfGroup = getGoGroupAndLiberties(next, r, c);
  if (selfGroup.liberties === 0) {
    return { valid: false, nextBoard: board, captured: 0 };
  }
  if (prevBoardKey && boardKeyGo(next) === prevBoardKey) {
    return { valid: false, nextBoard: board, captured: 0 };
  }
  return { valid: true, nextBoard: next, captured };
}

function scoreGoMini(
  board: (Batch2Player | null)[][],
  captures: { p1: number; p2: number }
): { p1: number; p2: number } {
  let p1Area = 0;
  let p2Area = 0;
  const visited = Array.from({ length: 7 }, () => Array<boolean>(7).fill(false));
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] === 'p1') p1Area++;
      else if (board[r][c] === 'p2') p2Area++;
      else if (!visited[r][c]) {
        const region: [number, number][] = [];
        const stack: [number, number][] = [[r, c]];
        visited[r][c] = true;
        let touchesP1 = false;
        let touchesP2 = false;
        while (stack.length > 0) {
          const [cr, cc] = stack.pop()!;
          region.push([cr, cc]);
          for (const [dr, dc] of dirs) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr < 0 || nr >= 7 || nc < 0 || nc >= 7) continue;
            if (board[nr][nc] === 'p1') touchesP1 = true;
            else if (board[nr][nc] === 'p2') touchesP2 = true;
            else if (!visited[nr][nc]) {
              visited[nr][nc] = true;
              stack.push([nr, nc]);
            }
          }
        }
        if (touchesP1 && !touchesP2) p1Area += region.length;
        else if (touchesP2 && !touchesP1) p2Area += region.length;
      }
    }
  }
  return {
    p1: p1Area + captures.p1,
    p2: p2Area + captures.p2 + 3.5
  };
}

// ---------------- TAK DUEL HELPERS ----------------

function hasTakRoadWin(board: TakCellPiece[][][], player: Batch2Player): boolean {
  const isOwnFlat = (r: number, c: number) => {
    const stack = board[r][c];
    if (stack.length === 0) return false;
    const top = stack[stack.length - 1];
    return top.owner === player && top.kind === 'flat';
  };

  // Top to bottom
  const checkTopBottom = () => {
    const visited = Array.from({ length: 5 }, () => Array<boolean>(5).fill(false));
    const stack: [number, number][] = [];
    for (let c = 0; c < 5; c++) {
      if (isOwnFlat(0, c)) {
        visited[0][c] = true;
        stack.push([0, c]);
      }
    }
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      if (r === 4) return true;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && !visited[nr][nc] && isOwnFlat(nr, nc)) {
          visited[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
    }
    return false;
  };

  // Left to right
  const checkLeftRight = () => {
    const visited = Array.from({ length: 5 }, () => Array<boolean>(5).fill(false));
    const stack: [number, number][] = [];
    for (let r = 0; r < 5; r++) {
      if (isOwnFlat(r, 0)) {
        visited[r][0] = true;
        stack.push([r, 0]);
      }
    }
    while (stack.length > 0) {
      const [r, c] = stack.pop()!;
      if (c === 4) return true;
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && !visited[nr][nc] && isOwnFlat(nr, nc)) {
          visited[nr][nc] = true;
          stack.push([nr, nc]);
        }
      }
    }
    return false;
  };

  return checkTopBottom() || checkLeftRight();
}

// ---------------- AMAZONS / PENTE / GOBBLET HELPERS ----------------

function getQueenRays(board: unknown[][], r: number, c: number, isBlocked: (cell: unknown) => boolean): [number, number][] {
  const out: [number, number][] = [];
  const n = board.length;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      let nr = r + dr;
      let nc = c + dc;
      while (nr >= 0 && nr < n && nc >= 0 && nc < n && !isBlocked(board[nr][nc])) {
        out.push([nr, nc]);
        nr += dr;
        nc += dc;
      }
    }
  }
  return out;
}

function checkGobbletWin(board: GobbletPiece[][][], player: Batch2Player): [number, number][] | null {
  const topOwner = (r: number, c: number): Batch2Player | null => {
    const st = board[r][c];
    return st.length > 0 ? st[st.length - 1].owner : null;
  };
  const lines: [number, number][][] = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];
  for (const line of lines) {
    if (line.every(([r, c]) => topOwner(r, c) === player)) return line;
  }
  return null;
}

function checkLineWin9(board: (Batch2Player | null)[][], needed: number, player: Batch2Player): [number, number][] | null {
  const rows = board.length;
  const cols = board[0].length;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of dirs) {
        const line: [number, number][] = [[r, c]];
        for (let k = 1; k < needed; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || board[nr][nc] !== player) break;
          line.push([nr, nc]);
        }
        if (line.length === needed) return line;
      }
    }
  }
  return null;
}

// ---------------- INITIAL STATE CREATORS ----------------

export function createBatch2InitialState(gameType: Batch2ArcadeGameType): Batch2ArcadeState {
  switch (gameType) {
    case 'symmetry-art':
      return {
        gameType: 'symmetry-art',
        round: 1,
        maxRounds: 4,
        phase: 'pick',
        drawer: 'p1',
        guesser: 'p2',
        wordChoices: getSymmetryWordChoices(1, 0),
        word: null,
        mirrorMode: '4',
        grid: Array.from({ length: 8 }, () => Array<number>(8).fill(0)),
        guesses: [],
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'color-match':
      return {
        gameType: 'color-match',
        round: 1,
        maxRounds: 5,
        seed: 421,
        targetRgb: makeTargetRgb(421, 1),
        pendingP1: null,
        scores: { p1: 0, p2: 0 },
        history: [],
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'emoji-story':
      return {
        gameType: 'emoji-story',
        round: 1,
        maxRounds: 4,
        phase: 'pick',
        director: 'p1',
        guesser: 'p2',
        choices: getStoryChoices(1, 0),
        answer: null,
        panels: ['', '', ''],
        guesses: [],
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'quoridor':
      return {
        gameType: 'quoridor',
        pawns: { p1: [6, 3], p2: [0, 3] },
        wallsLeft: { p1: 6, p2: 6 },
        hWalls: Array.from({ length: 6 }, () => Array<boolean>(6).fill(false)),
        vWalls: Array.from({ length: 6 }, () => Array<boolean>(6).fill(false)),
        lastActionNote: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'pente':
      return {
        gameType: 'pente',
        board: Array.from({ length: 9 }, () => Array<Batch2Player | null>(9).fill(null)),
        captures: { p1: 0, p2: 0 },
        lastCell: null,
        lastCaptured: [],
        winLine: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'nine-mens-morris':
      return {
        gameType: 'nine-mens-morris',
        board: Array<Batch2Player | null>(24).fill(null),
        phase: 'place',
        toPlace: { p1: 9, p2: 9 },
        lastMove: null,
        lastNote: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'santorini-lite':
      return {
        gameType: 'santorini-lite',
        levels: Array.from({ length: 5 }, () => Array<number>(5).fill(0)),
        builders: { p1: [[3, 1], [3, 3]], p2: [[1, 1], [1, 3]] },
        phase: 'move',
        movedBuilderIdx: null,
        lastHighlight: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'fox-and-hounds':
      return {
        gameType: 'fox-and-hounds',
        fox: [7, 4],
        hounds: [[0, 1], [0, 3], [0, 5], [0, 7]],
        lastMove: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'isola':
      return {
        gameType: 'isola',
        destroyed: Array.from({ length: 6 }, () => Array<boolean>(6).fill(false)),
        pawns: { p1: [5, 2], p2: [0, 3] },
        phase: 'move',
        lastHighlight: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'tak-duel':
      return {
        gameType: 'tak-duel',
        board: Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => [] as TakCellPiece[])),
        wallsLeft: { p1: 3, p2: 3 },
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'go-mini':
      return {
        gameType: 'go-mini',
        board: Array.from({ length: 7 }, () => Array<Batch2Player | null>(7).fill(null)),
        captures: { p1: 0, p2: 0 },
        consecutivePasses: 0,
        prevBoardKey: null,
        lastMove: null,
        finalScore: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'amazons-mini': {
      const board: ('p1' | 'p2' | 'arrow' | null)[][] = Array.from({ length: 6 }, () =>
        Array<'p1' | 'p2' | 'arrow' | null>(6).fill(null)
      );
      board[5][1] = 'p1';
      board[5][4] = 'p1';
      board[0][1] = 'p2';
      board[0][4] = 'p2';
      return {
        gameType: 'amazons-mini',
        board,
        phase: 'move',
        activeQueen: null,
        lastHighlight: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'tron-turn': {
      const grid: ('p1' | 'p2' | 't1' | 't2' | null)[][] = Array.from({ length: 8 }, () =>
        Array<'p1' | 'p2' | 't1' | 't2' | null>(8).fill(null)
      );
      grid[4][1] = 'p1';
      grid[3][6] = 'p2';
      return {
        gameType: 'tron-turn',
        grid,
        heads: { p1: [4, 1], p2: [3, 6] },
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'shogi-pocket': {
      const board: (ShogiPocketPiece | null)[][] = Array.from({ length: 4 }, () =>
        Array<ShogiPocketPiece | null>(3).fill(null)
      );
      board[0][0] = { owner: 'p2', kind: 'G' };
      board[0][1] = { owner: 'p2', kind: 'L' };
      board[0][2] = { owner: 'p2', kind: 'E' };
      board[1][1] = { owner: 'p2', kind: 'C' };
      board[2][1] = { owner: 'p1', kind: 'C' };
      board[3][0] = { owner: 'p1', kind: 'E' };
      board[3][1] = { owner: 'p1', kind: 'L' };
      board[3][2] = { owner: 'p1', kind: 'G' };
      return {
        gameType: 'shogi-pocket',
        board,
        hands: { p1: [], p2: [] },
        tryPendingFor: null,
        lastMove: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'gobblet-mini':
      return {
        gameType: 'gobblet-mini',
        board: Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => [] as GobbletPiece[])),
        reserves: { p1: [2, 2, 2], p2: [2, 2, 2] },
        winLine: null,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'splatter-turf':
      return {
        gameType: 'splatter-turf',
        board: Array.from({ length: 7 }, () => Array<Batch2Player | null>(7).fill(null)),
        bombsLeft: { p1: 2, p2: 2 },
        maxTurns: 24,
        lastSplash: null,
        scores: { p1: 0, p2: 0 },
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'knight-duel': {
      const burned = Array.from({ length: 6 }, () => Array<boolean>(6).fill(false));
      burned[5][1] = true;
      burned[0][4] = true;
      return {
        gameType: 'knight-duel',
        burned,
        knights: { p1: [5, 1], p2: [0, 4] },
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'anagram-scramble': {
      const word = ANAGRAM_WORDS[0];
      return {
        gameType: 'anagram-scramble',
        round: 1,
        maxRounds: 5,
        seed: 211,
        word,
        scrambled: scrambleWord(word, 211),
        revealedCount: 0,
        attempts: [],
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'trivia-showdown':
      return {
        gameType: 'trivia-showdown',
        round: 1,
        maxRounds: 7,
        seed: 317,
        questionIndices: Array.from({ length: 7 }, (_, i) => i % TRIVIA_BANK.length),
        pendingP1Choice: null,
        scores: { p1: 0, p2: 0 },
        history: [],
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'math-blitz':
      return {
        gameType: 'math-blitz',
        round: 1,
        maxRounds: 6,
        seed: 503,
        puzzleIdx: 0,
        attemptsThisRound: [],
        scores: { p1: 0, p2: 0 },
        lastSummary: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'simon-duel':
      return {
        gameType: 'simon-duel',
        sequence: [0, 2],
        maxLength: 12,
        lastAddedBy: null,
        lastNote: 'Repeat the 2-pad pattern & add +1 more pad!',
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'boggle-duel':
      return {
        gameType: 'boggle-duel',
        boardIdx: 0,
        claimed: [],
        scores: { p1: 0, p2: 0 },
        turnsLeft: 10,
        consecutivePasses: 0,
        lastError: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'sudoku-duel': {
      const { solution, grid, fixed } = buildSudokuPuzzle(101);
      return {
        gameType: 'sudoku-duel',
        seed: 101,
        solution,
        grid,
        fixed,
        scores: { p1: 0, p2: 0 },
        lastNote: null,
        lastCell: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
    }

    case 'uno-duel':
      return {
        gameType: 'uno-duel',
        deck: [],
        deckPos: 0,
        hands: { p1: [], p2: [] },
        topCard: { color: 'R', value: '5' },
        activeColor: 'R',
        lastNote: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'go-fish':
      return {
        gameType: 'go-fish',
        pond: [],
        hands: { p1: [], p2: [] },
        books: { p1: [], p2: [] },
        lastNote: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'poker-dice':
      return {
        gameType: 'poker-dice',
        round: 1,
        maxRounds: 5,
        dice: [0, 0, 0, 0, 0],
        held: [false, false, false, false, false],
        rollsLeft: 3,
        roundResults: [],
        pendingP1: null,
        scores: { p1: 0, p2: 0 },
        lastNote: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'liars-dice':
      return {
        gameType: 'liars-dice',
        seed: 0,
        diceCounts: { p1: 4, p2: 4 },
        pools: { p1: [], p2: [] },
        currentBid: null,
        lastReveal: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'farkle-duel':
      return {
        gameType: 'farkle-duel',
        target: 1500,
        scores: { p1: 0, p2: 0 },
        turnBank: 0,
        activeDice: [],
        waitingToRollCount: 6,
        lastEvent: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'coin-row':
      return {
        gameType: 'coin-row',
        seed: 701,
        coins: [6, 10, 3, 8, 5, 12, 4, 9, 2, 7],
        scores: { p1: 0, p2: 0 },
        lastPick: null,
        turn: 'p1',
        winner: null,
        moveCount: 0
      };

    case 'high-noon-duel':
      return {
        gameType: 'high-noon-duel',
        round: 1,
        hp: { p1: 3, p2: 3 },
        ammo: { p1: 0, p2: 0 },
        pendingP1: null,
        history: [],
        turn: 'p1',
        winner: null,
        moveCount: 0
      };
  }
}

// ---------------- LEGAL ACTIONS ----------------

export function getBatch2LegalActions(state: Batch2ArcadeState): string[] {
  if (state.winner) return [];

  switch (state.gameType) {
    case 'symmetry-art':
      if (state.phase === 'pick') return state.wordChoices.map(w => `w:${w}`);
      if (state.phase === 'draw') {
        const hasPaint = state.grid.some(row => row.some(v => v !== 0));
        return hasPaint ? ['done'] : ['p:1,2,2', 'done'];
      }
      return state.word ? [`g:${state.word}`, 'giveup'] : ['giveup'];

    case 'color-match':
      return [`mix:${state.targetRgb.join(',')}`];

    case 'emoji-story':
      if (state.phase === 'pick') return state.choices.map(c => `p:${c}`);
      if (state.phase === 'build') {
        if (state.panels.every(Boolean)) return ['go'];
        const idx = state.panels.findIndex(p => !p);
        return [`s:${idx},🚀`];
      }
      return state.answer ? [`g:${state.answer}`, 'giveup'] : ['giveup'];

    case 'quoridor': {
      const moves = getQuoridorPawnMoves(state, state.turn).map(([r, c]) => `m:${r},${c}`);
      if (state.wallsLeft[state.turn] > 0) {
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            if (canPlaceQuoridorWall(state, 'h', r, c)) moves.push(`wh:${r},${c}`);
            if (canPlaceQuoridorWall(state, 'v', r, c)) moves.push(`wv:${r},${c}`);
          }
        }
      }
      return moves;
    }

    case 'pente': {
      const moves: string[] = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (state.board[r][c] === null) moves.push(`p:${r},${c}`);
        }
      }
      return moves;
    }

    case 'nine-mens-morris': {
      if (state.phase === 'place') {
        const out: string[] = [];
        for (let i = 0; i < 24; i++) if (state.board[i] === null) out.push(`pl:${i}`);
        return out;
      }
      if (state.phase === 'remove') {
        return getNmmRemovableIndices(state.board, oppOf(state.turn)).map(i => `rm:${i}`);
      }
      const ownNodes: number[] = [];
      for (let i = 0; i < 24; i++) if (state.board[i] === state.turn) ownNodes.push(i);
      const canFly = ownNodes.length <= 3;
      const out: string[] = [];
      for (const from of ownNodes) {
        if (canFly) {
          for (let to = 0; to < 24; to++) {
            if (state.board[to] === null) out.push(`mv:${from}>${to}`);
          }
        } else {
          for (const to of NMM_ADJ[from]) {
            if (state.board[to] === null) out.push(`mv:${from}>${to}`);
          }
        }
      }
      return out;
    }

    case 'santorini-lite': {
      if (state.phase === 'move') {
        const out: string[] = [];
        const mine = state.builders[state.turn];
        const occ = new Set([
          ...state.builders.p1.map(([r, c]) => `${r},${c}`),
          ...state.builders.p2.map(([r, c]) => `${r},${c}`)
        ]);
        mine.forEach(([r, c], idx) => {
          const curLv = state.levels[r][c];
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && !occ.has(`${nr},${nc}`)) {
                const lv = state.levels[nr][nc];
                if (lv < 4 && lv <= curLv + 1) out.push(`m:${idx},${nr},${nc}`);
              }
            }
          }
        });
        return out;
      }
      const idx = state.movedBuilderIdx ?? 0;
      const [r, c] = state.builders[state.turn][idx];
      const occ = new Set([
        ...state.builders.p1.map(([br, bc]) => `${br},${bc}`),
        ...state.builders.p2.map(([br, bc]) => `${br},${bc}`)
      ]);
      const out: string[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && !occ.has(`${nr},${nc}`) && state.levels[nr][nc] < 4) {
            out.push(`b:${nr},${nc}`);
          }
        }
      }
      return out;
    }

    case 'fox-and-hounds': {
      const occ = new Set([
        `${state.fox[0]},${state.fox[1]}`,
        ...state.hounds.map(([hr, hc]) => `${hr},${hc}`)
      ]);
      const out: string[] = [];
      if (state.turn === 'p1') {
        const [r, c] = state.fox;
        for (const dr of [-1, 1]) {
          for (const dc of [-1, 1]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !occ.has(`${nr},${nc}`)) {
              out.push(`m:${r},${c}>${nr},${nc}`);
            }
          }
        }
      } else {
        for (const [r, c] of state.hounds) {
          for (const dc of [-1, 1]) {
            const nr = r + 1;
            const nc = c + dc;
            if (nr < 8 && nc >= 0 && nc < 8 && !occ.has(`${nr},${nc}`)) {
              out.push(`m:${r},${c}>${nr},${nc}`);
            }
          }
        }
      }
      return out;
    }

    case 'isola': {
      if (state.phase === 'move') {
        const [r, c] = state.pawns[state.turn];
        const [or, oc] = state.pawns[oppOf(state.turn)];
        const out: string[] = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && !state.destroyed[nr][nc] && !(nr === or && nc === oc)) {
              out.push(`m:${nr},${nc}`);
            }
          }
        }
        return out;
      }
      const out: string[] = [];
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          const isPawn =
            (state.pawns.p1[0] === r && state.pawns.p1[1] === c) ||
            (state.pawns.p2[0] === r && state.pawns.p2[1] === c);
          if (!state.destroyed[r][c] && !isPawn) out.push(`d:${r},${c}`);
        }
      }
      return out;
    }

    case 'tak-duel': {
      const out: string[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const st = state.board[r][c];
          if (st.length === 0) {
            out.push(`f:${r},${c}`);
            if (state.wallsLeft[state.turn] > 0) out.push(`w:${r},${c}`);
          } else if (st[st.length - 1].owner === state.turn) {
            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
                const dst = state.board[nr][nc];
                if (dst.length === 0 || dst[dst.length - 1].kind === 'flat') {
                  out.push(`s:${r},${c}>${nr},${nc}`);
                }
              }
            }
          }
        }
      }
      return out;
    }

    case 'go-mini': {
      const out: string[] = [];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (simulateGoPlacement(state.board, r, c, state.turn, state.prevBoardKey).valid) {
            out.push(`g:${r},${c}`);
          }
        }
      }
      out.push('pass');
      return out;
    }

    case 'amazons-mini': {
      if (state.phase === 'move') {
        const out: string[] = [];
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            if (state.board[r][c] === state.turn) {
              for (const [tr, tc] of getQueenRays(state.board, r, c, v => v !== null)) {
                out.push(`m:${r},${c}>${tr},${tc}`);
              }
            }
          }
        }
        return out;
      }
      const [qr, qc] = state.activeQueen || [0, 0];
      return getQueenRays(state.board, qr, qc, v => v !== null).map(([ar, ac]) => `a:${ar},${ac}`);
    }

    case 'tron-turn': {
      const [r, c] = state.heads[state.turn];
      const out: string[] = [];
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && state.grid[nr][nc] === null) {
          out.push(`t:${nr},${nc}`);
        }
      }
      return out;
    }

    case 'shogi-pocket': {
      const out: string[] = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          const p = state.board[r][c];
          if (p && p.owner === state.turn) {
            for (const [nr, nc] of getShogiTargets(state.board, r, c, p)) {
              out.push(`m:${r},${c}>${nr},${nc}`);
            }
          }
        }
      }
      const uniqueHand = Array.from(new Set(state.hands[state.turn]));
      for (const kind of uniqueHand) {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 3; c++) {
            if (state.board[r][c] === null) {
              out.push(`d:${kind},${r},${c}`);
            }
          }
        }
      }
      return out;
    }

    case 'gobblet-mini': {
      const out: string[] = [];
      const res = state.reserves[state.turn];
      for (let sizeIdx = 0; sizeIdx < 3; sizeIdx++) {
        if (res[sizeIdx] <= 0) continue;
        const size = (sizeIdx + 1) as 1 | 2 | 3;
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const st = state.board[r][c];
            if (st.length === 0 || st[st.length - 1].size < size) {
              out.push(`p:${size},${r},${c}`);
            }
          }
        }
      }
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const st = state.board[r][c];
          if (st.length > 0 && st[st.length - 1].owner === state.turn) {
            const size = st[st.length - 1].size;
            for (let tr = 0; tr < 3; tr++) {
              for (let tc = 0; tc < 3; tc++) {
                if (tr === r && tc === c) continue;
                const dst = state.board[tr][tc];
                if (dst.length === 0 || dst[dst.length - 1].size < size) {
                  out.push(`m:${r},${c}>${tr},${tc}`);
                }
              }
            }
          }
        }
      }
      return out;
    }

    case 'splatter-turf': {
      const out: string[] = [];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          out.push(`p:${r},${c}`);
          if (state.bombsLeft[state.turn] > 0) out.push(`b:${r},${c}`);
        }
      }
      return out;
    }

    case 'knight-duel': {
      const [r, c] = state.knights[state.turn];
      const [or, oc] = state.knights[oppOf(state.turn)];
      const deltas = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      const out: string[] = [];
      for (const [dr, dc] of deltas) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 6 && !state.burned[nr][nc] && !(nr === or && nc === oc)) {
          out.push(`k:${nr},${nc}`);
        }
      }
      return out;
    }

    case 'anagram-scramble':
      return [`g:${state.word}`, 'clue'];

    case 'trivia-showdown':
      return ['a:0', 'a:1', 'a:2', 'a:3'];

    case 'math-blitz': {
      const puz = MATH_BLITZ_PUZZLES[state.puzzleIdx];
      const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];
      const out: string[] = [];
      for (const op1 of ops) {
        for (const op2 of ops) {
          for (const grp of ['L', 'R'] as ('L' | 'R')[]) {
            if (evalMathBlitzOp(puz.nums, op1, op2, grp) === puz.target) {
              out.push(`eq:${op1},${op2},${grp}`);
            }
          }
        }
      }
      return out.length > 0 ? out : ['eq:+,+,L'];
    }

    case 'simon-duel':
      return [0, 1, 2, 3].map(pad => `s:${[...state.sequence, pad].join(',')}`);

    case 'boggle-duel': {
      const used = new Set(state.claimed.map(c => c.word));
      const avail = BOGGLE_BOARDS[state.boardIdx].words.filter(w => !used.has(w)).slice(0, 12);
      return [...avail.map(w => `w:${w}`), 'pass'];
    }

    case 'sudoku-duel': {
      const out: string[] = [];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (state.grid[r][c] === null) {
            out.push(`c:${r},${c},${state.solution[r][c]}`);
          }
        }
      }
      return out;
    }

    case 'uno-duel': {
      if (state.hands.p1.length === 0 && state.hands.p2.length === 0) return ['deal:409'];
      const hand = state.hands[state.turn];
      const out: string[] = [];
      hand.forEach((card, idx) => {
        if (card.value === 'WILD') {
          out.push(`p:${idx}:R`, `p:${idx}:B`, `p:${idx}:G`, `p:${idx}:Y`);
        } else if (card.color === state.activeColor || card.value === state.topCard.value) {
          out.push(`p:${idx}`);
        }
      });
      out.push('draw');
      return out;
    }

    case 'go-fish': {
      if (state.hands.p1.length === 0 && state.hands.p2.length === 0) return ['deal:517'];
      const ranks = Array.from(new Set(state.hands[state.turn]));
      return ranks.length > 0 ? ranks.map(r => `ask:${r}`) : ['draw'];
    }

    case 'poker-dice': {
      if (state.rollsLeft === 3) return ['roll:711'];
      const out = ['bank'];
      if (state.rollsLeft > 0) out.push('roll:919');
      return out;
    }

    case 'liars-dice': {
      if (state.pools.p1.length === 0) return ['roll:823'];
      const out: string[] = [];
      if (state.currentBid) {
        out.push('liar');
        const { qty, face } = state.currentBid;
        for (let f = face + 1; f <= 6; f++) out.push(`bid:${qty},${f}`);
        const total = state.diceCounts.p1 + state.diceCounts.p2;
        if (qty < total) {
          for (let f = 1; f <= 6; f++) out.push(`bid:${qty + 1},${f}`);
        }
      } else {
        out.push('bid:1,3', 'bid:1,4', 'bid:2,2', 'bid:2,5');
      }
      return out;
    }

    case 'farkle-duel': {
      if (state.activeDice.length === 0) return ['roll:613'];
      const out: string[] = [];
      const n = state.activeDice.length;
      for (let mask = 1; mask < 1 << n; mask++) {
        const subset = state.activeDice.filter((_, idx) => Boolean(mask & (1 << idx)));
        if (scoreFarkleDice(subset).allUsed) {
          const bits = Array.from({ length: n }, (_, idx) => (mask & (1 << idx) ? '1' : '0')).join('');
          out.push(`keep:${bits}`);
          if (out.length >= 16) break;
        }
      }
      return out;
    }

    case 'coin-row':
      return state.coins.length > 0 ? ['left', 'right'] : [];

    case 'high-noon-duel': {
      const out = ['a:reload', 'a:shield'];
      if (state.ammo[state.turn] > 0) out.push('a:shoot');
      return out;
    }
  }
}

// ---------------- APPLY ACTION ENGINE ----------------

export function applyBatch2ArcadeAction(state: Batch2ArcadeState, rawAction: string): Batch2ApplyResult {
  const action = String(rawAction || '').trim();
  const fail = (): Batch2ApplyResult => ({
    valid: false,
    nextState: state,
    extraTurn: false,
    capturedOrScored: false
  });
  if (state.winner || !action) return fail();

  const p = state.turn;
  const opp = oppOf(p);

  switch (state.gameType) {
    // 1. SYMMETRY ART
    case 'symmetry-art': {
      const finishRound = (guessed: boolean, ptsG: number, ptsD: number): Batch2ApplyResult => {
        const scores = { ...state.scores };
        if (guessed) {
          scores[state.guesser] += ptsG;
          scores[state.drawer] += ptsD;
        }
        const summary = guessed
          ? `Round ${state.round}: "${state.word?.toUpperCase()}" guessed (+${ptsG} pts)!`
          : `Round ${state.round}: Missed — the art was "${state.word?.toUpperCase()}".`;
        if (state.round >= state.maxRounds) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: guessed,
            nextState: {
              ...state,
              scores,
              lastSummary: summary,
              winner: scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw',
              moveCount: state.moveCount + 1
            }
          };
        }
        const nr = state.round + 1;
        const nd = oppOf(state.drawer);
        const ng = oppOf(nd);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: guessed,
          nextState: {
            ...state,
            round: nr,
            phase: 'pick',
            drawer: nd,
            guesser: ng,
            wordChoices: getSymmetryWordChoices(nr, state.moveCount),
            word: null,
            grid: Array.from({ length: 8 }, () => Array<number>(8).fill(0)),
            guesses: [],
            scores,
            lastSummary: summary,
            turn: nd,
            moveCount: state.moveCount + 1
          }
        };
      };

      if (state.phase === 'pick') {
        if (!action.startsWith('w:')) return fail();
        const word = action.slice(2).toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 20);
        if (word.length < 2) return fail();
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, phase: 'draw', word, moveCount: state.moveCount + 1 }
        };
      }
      if (state.phase === 'draw') {
        if (action === 'sym:h' || action === 'sym:4') {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, mirrorMode: action === 'sym:h' ? 'h' : '4', moveCount: state.moveCount + 1 }
          };
        }
        if (action === 'clear') {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: {
              ...state,
              grid: Array.from({ length: 8 }, () => Array<number>(8).fill(0)),
              moveCount: state.moveCount + 1
            }
          };
        }
        if (action === 'done') {
          if (!state.grid.some(row => row.some(v => v !== 0))) return fail();
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: { ...state, phase: 'guess', turn: state.guesser, moveCount: state.moveCount + 1 }
          };
        }
        if (action.startsWith('tpl:')) {
          const w = action.slice(4);
          const tpl = SYMMETRY_BOT_TEMPLATES[w];
          if (!tpl) return fail();
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: {
              ...state,
              grid: tpl.map(row => [...row]),
              phase: 'guess',
              turn: state.guesser,
              moveCount: state.moveCount + 1
            }
          };
        }
        const m = /^p:([0-7]),([0-7]),([0-9])$/.exec(action);
        if (!m) return fail();
        const r = Number(m[1]);
        const c = Number(m[2]);
        const col = Number(m[3]);
        const nextGrid = state.grid.map(row => [...row]);
        nextGrid[r][c] = col;
        nextGrid[r][7 - c] = col;
        if (state.mirrorMode === '4') {
          nextGrid[7 - r][c] = col;
          nextGrid[7 - r][7 - c] = col;
        }
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, grid: nextGrid, moveCount: state.moveCount + 1 }
        };
      }
      if (action === 'giveup') return finishRound(false, 0, 0);
      if (action.startsWith('g:')) {
        const guess = action.slice(2).toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 24);
        if (!guess) return fail();
        const target = (state.word || '').toLowerCase();
        if (guess === target) return finishRound(true, Math.max(60, 120 - state.guesses.length * 30), 60);
        const guesses = [...state.guesses, { text: guess, hit: false, hint: computeGuessHint(target, guess) }];
        if (guesses.length >= 3) return finishRound(false, 0, 0);
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, guesses, moveCount: state.moveCount + 1 }
        };
      }
      return fail();
    }

    // 2. COLOR MATCH DUEL
    case 'color-match': {
      const m = /^mix:(\d+),(\d+),(\d+)(?::(\d+))?$/.exec(action);
      if (!m) return fail();
      const rgb: [number, number, number] = [
        Math.min(255, Math.max(0, Number(m[1]))),
        Math.min(255, Math.max(0, Number(m[2]))),
        Math.min(255, Math.max(0, Number(m[3])))
      ];
      let seed = state.seed;
      let target = state.targetRgb;
      if (state.moveCount === 0 && m[4]) {
        seed = Number(m[4]) || state.seed;
        target = makeTargetRgb(seed, 1);
      }

      if (state.turn === 'p1') {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            seed,
            targetRgb: target,
            pendingP1: rgb,
            turn: 'p2',
            moveCount: state.moveCount + 1
          }
        };
      }
      const p1Mix = state.pendingP1 || [128, 128, 128];
      const acc1 = computeColorAccuracy(target, p1Mix);
      const acc2 = computeColorAccuracy(target, rgb);
      const scores = { p1: state.scores.p1 + acc1, p2: state.scores.p2 + acc2 };
      const history = [
        ...state.history,
        { round: state.round, target, p1: p1Mix, p2: rgb, acc1, acc2 }
      ];
      const done = state.round >= state.maxRounds;
      const nextRound = done ? state.round : state.round + 1;
      const winner: Batch2Winner = done
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
          round: nextRound,
          seed,
          targetRgb: done ? target : makeTargetRgb(seed, nextRound),
          pendingP1: null,
          scores,
          history,
          turn: 'p1',
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 3. EMOJI STORY
    case 'emoji-story': {
      const finishRound = (guessed: boolean, ptsG: number, ptsD: number): Batch2ApplyResult => {
        const scores = { ...state.scores };
        if (guessed) {
          scores[state.guesser] += ptsG;
          scores[state.director] += ptsD;
        }
        const summary = guessed
          ? `Round ${state.round}: "${state.answer}" cracked (+${ptsG} pts)!`
          : `Round ${state.round}: Story was "${state.answer}".`;
        if (state.round >= state.maxRounds) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: guessed,
            nextState: {
              ...state,
              scores,
              lastSummary: summary,
              winner: scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw',
              moveCount: state.moveCount + 1
            }
          };
        }
        const nr = state.round + 1;
        const nd = oppOf(state.director);
        const ng = oppOf(nd);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: guessed,
          nextState: {
            ...state,
            round: nr,
            phase: 'pick',
            director: nd,
            guesser: ng,
            choices: getStoryChoices(nr, state.moveCount),
            answer: null,
            panels: ['', '', ''],
            guesses: [],
            scores,
            lastSummary: summary,
            turn: nd,
            moveCount: state.moveCount + 1
          }
        };
      };

      if (state.phase === 'pick') {
        if (!action.startsWith('p:')) return fail();
        const ans = action.slice(2).toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 32);
        if (ans.length < 2) return fail();
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, phase: 'build', answer: ans, moveCount: state.moveCount + 1 }
        };
      }
      if (state.phase === 'build') {
        if (action.startsWith('s:')) {
          const parts = action.slice(2).split(',');
          const idx = Number(parts[0]);
          const em = (parts[1] || '').trim().slice(0, 12);
          if (!Number.isInteger(idx) || idx < 0 || idx > 2 || !em) return fail();
          const panels: [string, string, string] = [...state.panels] as [string, string, string];
          panels[idx] = em;
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: false,
            nextState: { ...state, panels, moveCount: state.moveCount + 1 }
          };
        }
        if (action === 'go') {
          if (!state.panels.every(Boolean)) return fail();
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: { ...state, phase: 'guess', turn: state.guesser, moveCount: state.moveCount + 1 }
          };
        }
        return fail();
      }
      if (action === 'giveup') return finishRound(false, 0, 0);
      if (action.startsWith('g:')) {
        const guess = action.slice(2).toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 32);
        if (!guess) return fail();
        const target = (state.answer || '').toLowerCase();
        if (guess === target) return finishRound(true, Math.max(60, 120 - state.guesses.length * 30), 60);
        const guesses = [...state.guesses, { text: guess, hit: false, hint: computeGuessHint(target, guess) }];
        if (guesses.length >= 3) return finishRound(false, 0, 0);
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, guesses, moveCount: state.moveCount + 1 }
        };
      }
      return fail();
    }

    // 4. QUORIDOR
    case 'quoridor': {
      const mMove = /^m:([0-6]),([0-6])$/.exec(action);
      if (mMove) {
        const r = Number(mMove[1]);
        const c = Number(mMove[2]);
        const legal = getQuoridorPawnMoves(state, p);
        if (!legal.some(([lr, lc]) => lr === r && lc === c)) return fail();
        const pawns = { ...state.pawns, [p]: [r, c] as [number, number] };
        const won = (p === 'p1' && r === 0) || (p === 'p2' && r === 6);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: won,
          nextState: {
            ...state,
            pawns,
            lastActionNote: `Moved to (${r + 1}, ${c + 1})`,
            turn: won ? p : opp,
            winner: won ? p : null,
            moveCount: state.moveCount + 1
          }
        };
      }
      const mWall = /^w(h|v):([0-5]),([0-5])$/.exec(action);
      if (mWall) {
        if (state.wallsLeft[p] <= 0) return fail();
        const orient = mWall[1] as 'h' | 'v';
        const r = Number(mWall[2]);
        const c = Number(mWall[3]);
        if (!canPlaceQuoridorWall(state, orient, r, c)) return fail();
        const hWalls = state.hWalls.map(row => [...row]);
        const vWalls = state.vWalls.map(row => [...row]);
        if (orient === 'h') hWalls[r][c] = true;
        else vWalls[r][c] = true;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            wallsLeft: { ...state.wallsLeft, [p]: state.wallsLeft[p] - 1 },
            hWalls,
            vWalls,
            lastActionNote: `Placed ${orient === 'h' ? 'horizontal' : 'vertical'} wall`,
            turn: opp,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    // 5. PENTE
    case 'pente': {
      const m = /^p:([0-8]),([0-8])$/.exec(action);
      if (!m) return fail();
      const r = Number(m[1]);
      const c = Number(m[2]);
      if (state.board[r][c] !== null) return fail();
      const board = state.board.map(row => [...row]);
      board[r][c] = p;
      const capturedCells: [number, number][] = [];
      let pairsAdded = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r1 = r + dr, c1 = c + dc;
          const r2 = r + dr * 2, c2 = c + dc * 2;
          const r3 = r + dr * 3, c3 = c + dc * 3;
          if (r3 >= 0 && r3 < 9 && c3 >= 0 && c3 < 9) {
            if (board[r1][c1] === opp && board[r2][c2] === opp && board[r3][c3] === p) {
              board[r1][c1] = null;
              board[r2][c2] = null;
              capturedCells.push([r1, c1], [r2, c2]);
              pairsAdded++;
            }
          }
        }
      }
      const captures = { ...state.captures, [p]: state.captures[p] + pairsAdded };
      const winLine = checkLineWin9(board, 5, p);
      const isFull = board.every(row => row.every(v => v !== null));
      const winner: Batch2Winner =
        winLine || captures[p] >= 5 ? p : isFull ? 'draw' : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: pairsAdded > 0 || Boolean(winLine),
        nextState: {
          ...state,
          board,
          captures,
          lastCell: [r, c],
          lastCaptured: capturedCells,
          winLine,
          turn: winner ? p : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 6. NINE MEN'S MORRIS
    case 'nine-mens-morris': {
      const board = [...state.board];
      if (state.phase === 'place') {
        const m = /^pl:(\d+)$/.exec(action);
        if (!m) return fail();
        const idx = Number(m[1]);
        if (idx < 0 || idx >= 24 || board[idx] !== null) return fail();
        board[idx] = p;
        const toPlace = { ...state.toPlace, [p]: state.toPlace[p] - 1 };
        const formedMill = isNodeInMill(board, idx, p);
        if (formedMill) {
          return {
            valid: true,
            extraTurn: true,
            capturedOrScored: true,
            nextState: {
              ...state,
              board,
              phase: 'remove',
              toPlace,
              lastMove: { from: null, to: idx },
              lastNote: 'Mill formed! Remove an enemy piece.',
              moveCount: state.moveCount + 1
            }
          };
        }
        const bothPlaced = toPlace.p1 === 0 && toPlace.p2 === 0;
        const nextPhase = bothPlaced ? 'move' : 'place';
        const nextStateBase: NineMensMorrisState = {
          ...state,
          board,
          phase: nextPhase,
          toPlace,
          lastMove: { from: null, to: idx },
          lastNote: null,
          turn: opp,
          winner: null,
          moveCount: state.moveCount + 1
        };
        if (nextPhase === 'move' && getBatch2LegalActions(nextStateBase).length === 0) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: { ...nextStateBase, winner: p, lastNote: 'Opponent blocked!' }
          };
        }
        return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextStateBase };
      }

      if (state.phase === 'remove') {
        const m = /^rm:(\d+)$/.exec(action);
        if (!m) return fail();
        const idx = Number(m[1]);
        const allowed = getNmmRemovableIndices(board, opp);
        if (!allowed.includes(idx)) return fail();
        board[idx] = null;
        const oppCount = board.filter(v => v === opp).length;
        const bothPlaced = state.toPlace.p1 === 0 && state.toPlace.p2 === 0;
        if (bothPlaced && oppCount < 3) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              board,
              phase: 'move',
              lastNote: 'Opponent reduced below 3 pieces!',
              winner: p,
              moveCount: state.moveCount + 1
            }
          };
        }
        const nextPhase = bothPlaced ? 'move' : 'place';
        const nextStateBase: NineMensMorrisState = {
          ...state,
          board,
          phase: nextPhase,
          lastNote: 'Piece removed!',
          turn: opp,
          winner: null,
          moveCount: state.moveCount + 1
        };
        if (nextPhase === 'move' && getBatch2LegalActions(nextStateBase).length === 0) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: { ...nextStateBase, winner: p, lastNote: 'Opponent has no moves!' }
          };
        }
        return { valid: true, extraTurn: false, capturedOrScored: true, nextState: nextStateBase };
      }

      // phase === 'move'
      const m = /^mv:(\d+)>(\d+)$/.exec(action);
      if (!m) return fail();
      const from = Number(m[1]);
      const to = Number(m[2]);
      if (from < 0 || from >= 24 || to < 0 || to >= 24) return fail();
      if (board[from] !== p || board[to] !== null) return fail();
      const ownCount = board.filter(v => v === p).length;
      if (ownCount > 3 && !NMM_ADJ[from].includes(to)) return fail();
      board[from] = null;
      board[to] = p;
      if (isNodeInMill(board, to, p)) {
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: true,
          nextState: {
            ...state,
            board,
            phase: 'remove',
            lastMove: { from, to },
            lastNote: 'Mill formed! Remove an enemy piece.',
            moveCount: state.moveCount + 1
          }
        };
      }
      const nextStateBase: NineMensMorrisState = {
        ...state,
        board,
        phase: 'move',
        lastMove: { from, to },
        lastNote: null,
        turn: opp,
        winner: state.moveCount >= 140 ? 'draw' : null,
        moveCount: state.moveCount + 1
      };
      if (!nextStateBase.winner && getBatch2LegalActions(nextStateBase).length === 0) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: { ...nextStateBase, winner: p, lastNote: 'Opponent blocked!' }
        };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextStateBase };
    }

    // 7. SANTORINI LITE
    case 'santorini-lite': {
      if (state.phase === 'move') {
        const m = /^m:([01]),([0-4]),([0-4])$/.exec(action);
        if (!m) return fail();
        const idx = Number(m[1]);
        const nr = Number(m[2]);
        const nc = Number(m[3]);
        const legal = getBatch2LegalActions(state);
        if (!legal.includes(action)) return fail();
        const builders = {
          p1: state.builders.p1.map(b => [...b] as [number, number]),
          p2: state.builders.p2.map(b => [...b] as [number, number])
        };
        builders[p][idx] = [nr, nc];
        if (state.levels[nr][nc] === 3) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              builders,
              lastHighlight: [nr, nc],
              winner: p,
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
            builders,
            phase: 'build',
            movedBuilderIdx: idx,
            lastHighlight: [nr, nc],
            moveCount: state.moveCount + 1
          }
        };
      }
      const m = /^b:([0-4]),([0-4])$/.exec(action);
      if (!m) return fail();
      if (!getBatch2LegalActions(state).includes(action)) return fail();
      const br = Number(m[1]);
      const bc = Number(m[2]);
      const levels = state.levels.map(row => [...row]);
      levels[br][bc] = Math.min(4, levels[br][bc] + 1);
      const nextBase: SantoriniLiteState = {
        ...state,
        levels,
        phase: 'move',
        movedBuilderIdx: null,
        lastHighlight: [br, bc],
        turn: opp,
        winner: null,
        moveCount: state.moveCount + 1
      };
      if (getBatch2LegalActions(nextBase).length === 0) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: { ...nextBase, winner: p }
        };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextBase };
    }

    // 8. FOX & HOUNDS
    case 'fox-and-hounds': {
      const m = /^m:([0-7]),([0-7])>([0-7]),([0-7])$/.exec(action);
      if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
      const fr = Number(m[1]), fc = Number(m[2]);
      const tr = Number(m[3]), tc = Number(m[4]);
      let fox = [...state.fox] as [number, number];
      const hounds = state.hounds.map(h => [...h] as [number, number]);
      if (p === 'p1') {
        fox = [tr, tc];
        if (tr === 0) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              fox,
              lastMove: [[fr, fc], [tr, tc]],
              winner: 'p1',
              moveCount: state.moveCount + 1
            }
          };
        }
      } else {
        const idx = hounds.findIndex(([hr, hc]) => hr === fr && hc === fc);
        if (idx === -1) return fail();
        hounds[idx] = [tr, tc];
      }
      const nextBase: FoxAndHoundsState = {
        ...state,
        fox,
        hounds,
        lastMove: [[fr, fc], [tr, tc]],
        turn: opp,
        winner: state.moveCount >= 80 ? 'draw' : null,
        moveCount: state.moveCount + 1
      };
      if (!nextBase.winner && getBatch2LegalActions(nextBase).length === 0) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: { ...nextBase, winner: p }
        };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextBase };
    }

    // 9. ISOLA
    case 'isola': {
      if (state.phase === 'move') {
        const m = /^m:([0-5]),([0-5])$/.exec(action);
        if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
        const nr = Number(m[1]), nc = Number(m[2]);
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            pawns: { ...state.pawns, [p]: [nr, nc] },
            phase: 'destroy',
            lastHighlight: [nr, nc],
            moveCount: state.moveCount + 1
          }
        };
      }
      const m = /^d:([0-5]),([0-5])$/.exec(action);
      if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
      const dr = Number(m[1]), dc = Number(m[2]);
      const destroyed = state.destroyed.map(row => [...row]);
      destroyed[dr][dc] = true;
      const nextBase: IsolaState = {
        ...state,
        destroyed,
        phase: 'move',
        lastHighlight: [dr, dc],
        turn: opp,
        winner: null,
        moveCount: state.moveCount + 1
      };
      if (getBatch2LegalActions(nextBase).length === 0) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: { ...nextBase, winner: p }
        };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextBase };
    }

    // 10. TAK DUEL
    case 'tak-duel': {
      const board = state.board.map(row => row.map(cell => cell.map(piece => ({ ...piece }))));
      const wallsLeft = { ...state.wallsLeft };
      let lastCell: [number, number] | null = null;

      const mf = /^(f|w):([0-4]),([0-4])$/.exec(action);
      const ms = /^s:([0-4]),([0-4])>([0-4]),([0-4])$/.exec(action);
      if (mf) {
        const kind = mf[1] === 'w' ? 'wall' : 'flat';
        const r = Number(mf[2]), c = Number(mf[3]);
        if (board[r][c].length > 0) return fail();
        if (kind === 'wall') {
          if (wallsLeft[p] <= 0) return fail();
          wallsLeft[p]--;
        }
        board[r][c].push({ owner: p, kind });
        lastCell = [r, c];
      } else if (ms) {
        const r1 = Number(ms[1]), c1 = Number(ms[2]);
        const r2 = Number(ms[3]), c2 = Number(ms[4]);
        if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return fail();
        const src = board[r1][c1];
        const dst = board[r2][c2];
        if (src.length === 0 || src[src.length - 1].owner !== p) return fail();
        if (dst.length > 0 && dst[dst.length - 1].kind === 'wall') return fail();
        const piece = src.pop()!;
        dst.push(piece);
        lastCell = [r2, c2];
      } else {
        return fail();
      }

      const pWin = hasTakRoadWin(board, p);
      const oppWin = hasTakRoadWin(board, opp);
      let winner: Batch2Winner = pWin ? p : oppWin ? opp : null;
      const isFull = board.every(row => row.every(st => st.length > 0));
      if (!winner && (isFull || state.moveCount >= 80)) {
        let p1Flats = 0;
        let p2Flats = 0;
        for (const row of board) {
          for (const st of row) {
            if (st.length > 0 && st[st.length - 1].kind === 'flat') {
              if (st[st.length - 1].owner === 'p1') p1Flats++;
              else p2Flats++;
            }
          }
        }
        winner = p1Flats > p2Flats ? 'p1' : p2Flats > p1Flats ? 'p2' : 'draw';
      }

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: Boolean(winner),
        nextState: {
          ...state,
          board,
          wallsLeft,
          lastCell,
          turn: winner ? p : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 11. MINI GO (7x7)
    case 'go-mini': {
      if (action === 'pass') {
        const passes = state.consecutivePasses + 1;
        if (passes >= 2 || state.moveCount >= 90) {
          const finalScore = scoreGoMini(state.board, state.captures);
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              consecutivePasses: passes,
              lastMove: 'pass',
              finalScore,
              winner: finalScore.p1 > finalScore.p2 ? 'p1' : 'p2',
              moveCount: state.moveCount + 1
            }
          };
        }
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            consecutivePasses: passes,
            lastMove: 'pass',
            turn: opp,
            moveCount: state.moveCount + 1
          }
        };
      }
      const m = /^g:([0-6]),([0-6])$/.exec(action);
      if (!m) return fail();
      const r = Number(m[1]), c = Number(m[2]);
      const sim = simulateGoPlacement(state.board, r, c, p, state.prevBoardKey);
      if (!sim.valid) return fail();
      const captures = { ...state.captures, [p]: state.captures[p] + sim.captured };
      const done = state.moveCount + 1 >= 90;
      const finalScore = done ? scoreGoMini(sim.nextBoard, captures) : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: sim.captured > 0 || done,
        nextState: {
          ...state,
          board: sim.nextBoard,
          captures,
          consecutivePasses: 0,
          prevBoardKey: boardKeyGo(state.board),
          lastMove: [r, c],
          finalScore,
          turn: done ? p : opp,
          winner: finalScore ? (finalScore.p1 > finalScore.p2 ? 'p1' : 'p2') : null,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 12. AMAZONS MINI
    case 'amazons-mini': {
      if (state.phase === 'move') {
        const m = /^m:([0-5]),([0-5])>([0-5]),([0-5])$/.exec(action);
        if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
        const r1 = Number(m[1]), c1 = Number(m[2]);
        const r2 = Number(m[3]), c2 = Number(m[4]);
        const board = state.board.map(row => [...row]);
        board[r1][c1] = null;
        board[r2][c2] = p;
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            board,
            phase: 'shoot',
            activeQueen: [r2, c2],
            lastHighlight: [r2, c2],
            moveCount: state.moveCount + 1
          }
        };
      }
      const m = /^a:([0-5]),([0-5])$/.exec(action);
      if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
      const ar = Number(m[1]), ac = Number(m[2]);
      const board = state.board.map(row => [...row]);
      board[ar][ac] = 'arrow';
      const nextBase: AmazonsMiniState = {
        ...state,
        board,
        phase: 'move',
        activeQueen: null,
        lastHighlight: [ar, ac],
        turn: opp,
        winner: null,
        moveCount: state.moveCount + 1
      };
      if (getBatch2LegalActions(nextBase).length === 0) {
        return { valid: true, extraTurn: false, capturedOrScored: true, nextState: { ...nextBase, winner: p } };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextBase };
    }

    // 13. TRON TURN
    case 'tron-turn': {
      const m = /^t:([0-7]),([0-7])$/.exec(action);
      if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
      const nr = Number(m[1]), nc = Number(m[2]);
      const [cr, cc] = state.heads[p];
      const grid = state.grid.map(row => [...row]);
      grid[cr][cc] = p === 'p1' ? 't1' : 't2';
      grid[nr][nc] = p;
      const nextBase: TronTurnState = {
        ...state,
        grid,
        heads: { ...state.heads, [p]: [nr, nc] },
        turn: opp,
        winner: null,
        moveCount: state.moveCount + 1
      };
      if (getBatch2LegalActions(nextBase).length === 0) {
        return { valid: true, extraTurn: false, capturedOrScored: true, nextState: { ...nextBase, winner: p } };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextBase };
    }

    // 14. SHOGI POCKET (3x4 ANIMAL SHOGI)
    case 'shogi-pocket': {
      const board = state.board.map(row => row.map(cell => (cell ? { ...cell } : null)));
      const hands = { p1: [...state.hands.p1], p2: [...state.hands.p2] };
      let wonImmediately = false;
      let moveDesc = '';

      const mm = /^m:([0-3]),([0-2])>([0-3]),([0-2])$/.exec(action);
      const md = /^d:(G|E|C),([0-3]),([0-2])$/.exec(action);
      if (mm) {
        const r1 = Number(mm[1]), c1 = Number(mm[2]);
        const r2 = Number(mm[3]), c2 = Number(mm[4]);
        const piece = board[r1][c1];
        if (!piece || piece.owner !== p) return fail();
        if (!getShogiTargets(board, r1, c1, piece).some(([tr, tc]) => tr === r2 && tc === c2)) return fail();
        const target = board[r2][c2];
        if (target) {
          if (target.kind === 'L') wonImmediately = true;
          else {
            const capKind: ShogiPieceKind = target.kind === 'H' ? 'C' : target.kind;
            hands[p].push(capKind);
          }
        }
        const promotedKind: ShogiPieceKind =
          piece.kind === 'C' && ((p === 'p1' && r2 === 0) || (p === 'p2' && r2 === 3))
            ? 'H'
            : piece.kind;
        board[r1][c1] = null;
        board[r2][c2] = { owner: p, kind: promotedKind };
        moveDesc = `${piece.kind} → (${r2 + 1},${c2 + 1})`;
      } else if (md) {
        const kind = md[1] as ShogiPieceKind;
        const r = Number(md[2]), c = Number(md[3]);
        const idx = hands[p].indexOf(kind);
        if (idx === -1 || board[r][c] !== null) return fail();
        hands[p].splice(idx, 1);
        board[r][c] = { owner: p, kind };
        moveDesc = `Drop ${kind} @ (${r + 1},${c + 1})`;
      } else {
        return fail();
      }

      if (wonImmediately) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            board,
            hands,
            lastMove: `${moveDesc} — Lion Captured!`,
            winner: p,
            moveCount: state.moveCount + 1
          }
        };
      }

      // If opponent had a Try Lion pending and active player didn't capture it, opponent wins!
      if (state.tryPendingFor === opp && findShogiLion(board, opp)) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            board,
            hands,
            lastMove: `${opp.toUpperCase()} Lion Try succeeded!`,
            winner: opp,
            moveCount: state.moveCount + 1
          }
        };
      }

      // Check if active player moved Lion onto opposite back rank
      let tryPendingFor: Batch2Player | null = null;
      const myLion = findShogiLion(board, p);
      if (myLion) {
        const goalRow = p === 'p1' ? 0 : 3;
        if (myLion[0] === goalRow) {
          if (!isShogiSquareAttacked(board, myLion[0], myLion[1], opp)) {
            return {
              valid: true,
              extraTurn: false,
              capturedOrScored: true,
              nextState: {
                ...state,
                board,
                hands,
                lastMove: `${moveDesc} — Safe Lion Try!`,
                winner: p,
                moveCount: state.moveCount + 1
              }
            };
          }
          tryPendingFor = p;
        }
      }

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          board,
          hands,
          tryPendingFor,
          lastMove: moveDesc,
          turn: opp,
          winner: state.moveCount + 1 >= 90 ? 'draw' : null,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 15. GOBBLET MINI
    case 'gobblet-mini': {
      const board = state.board.map(row => row.map(st => st.map(pc => ({ ...pc }))));
      const reserves = {
        p1: [...state.reserves.p1] as [number, number, number],
        p2: [...state.reserves.p2] as [number, number, number]
      };
      let lastCell: [number, number] | null = null;
      const mp = /^p:([1-3]),([0-2]),([0-2])$/.exec(action);
      const mm = /^m:([0-2]),([0-2])>([0-2]),([0-2])$/.exec(action);
      if (mp) {
        const size = Number(mp[1]) as 1 | 2 | 3;
        const r = Number(mp[2]), c = Number(mp[3]);
        if (reserves[p][size - 1] <= 0) return fail();
        const dst = board[r][c];
        if (dst.length > 0 && dst[dst.length - 1].size >= size) return fail();
        reserves[p][size - 1]--;
        dst.push({ owner: p, size });
        lastCell = [r, c];
      } else if (mm) {
        const r1 = Number(mm[1]), c1 = Number(mm[2]);
        const r2 = Number(mm[3]), c2 = Number(mm[4]);
        if (r1 === r2 && c1 === c2) return fail();
        const src = board[r1][c1];
        const dst = board[r2][c2];
        if (src.length === 0 || src[src.length - 1].owner !== p) return fail();
        const piece = src[src.length - 1];
        if (dst.length > 0 && dst[dst.length - 1].size >= piece.size) return fail();
        src.pop();
        dst.push(piece);
        lastCell = [r2, c2];
      } else {
        return fail();
      }

      const oppWin = checkGobbletWin(board, opp);
      const selfWin = checkGobbletWin(board, p);
      const winner: Batch2Winner = selfWin ? p : oppWin ? opp : state.moveCount + 1 >= 70 ? 'draw' : null;
      const winLine = selfWin || oppWin || null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: Boolean(winner),
        nextState: {
          ...state,
          board,
          reserves,
          winLine,
          lastCell,
          turn: winner ? p : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 16. SPLATTER TURF
    case 'splatter-turf': {
      const mp = /^(p|b):([0-6]),([0-6])$/.exec(action);
      if (!mp) return fail();
      const isBomb = mp[1] === 'b';
      const r = Number(mp[2]), c = Number(mp[3]);
      if (isBomb && state.bombsLeft[p] <= 0) return fail();
      const board = state.board.map(row => [...row]);
      const bombsLeft = { ...state.bombsLeft };
      if (isBomb) {
        bombsLeft[p]--;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) board[nr][nc] = p;
          }
        }
      } else {
        for (const [dr, dc] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 7 && nc >= 0 && nc < 7) board[nr][nc] = p;
        }
      }
      let p1Count = 0;
      let p2Count = 0;
      for (const row of board) {
        for (const cell of row) {
          if (cell === 'p1') p1Count++;
          else if (cell === 'p2') p2Count++;
        }
      }
      const nextMove = state.moveCount + 1;
      const done = nextMove >= state.maxTurns;
      const winner: Batch2Winner = done
        ? p1Count > p2Count
          ? 'p1'
          : p2Count > p1Count
          ? 'p2'
          : 'draw'
        : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: isBomb || done,
        nextState: {
          ...state,
          board,
          bombsLeft,
          lastSplash: [r, c],
          scores: { p1: p1Count, p2: p2Count },
          turn: winner ? p : opp,
          winner,
          moveCount: nextMove
        }
      };
    }

    // 17. KNIGHT DUEL
    case 'knight-duel': {
      const m = /^k:([0-5]),([0-5])$/.exec(action);
      if (!m || !getBatch2LegalActions(state).includes(action)) return fail();
      const nr = Number(m[1]), nc = Number(m[2]);
      const burned = state.burned.map(row => [...row]);
      burned[nr][nc] = true;
      const nextBase: KnightDuelState = {
        ...state,
        burned,
        knights: { ...state.knights, [p]: [nr, nc] },
        turn: opp,
        winner: null,
        moveCount: state.moveCount + 1
      };
      if (getBatch2LegalActions(nextBase).length === 0) {
        return { valid: true, extraTurn: false, capturedOrScored: true, nextState: { ...nextBase, winner: p } };
      }
      return { valid: true, extraTurn: false, capturedOrScored: false, nextState: nextBase };
    }

    // 18. ANAGRAM SCRAMBLE
    case 'anagram-scramble': {
      const advanceRound = (scores: { p1: number; p2: number }, summary: string, seedBase: number): Batch2ApplyResult => {
        if (state.round >= state.maxRounds) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              scores,
              lastSummary: summary,
              winner: scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw',
              moveCount: state.moveCount + 1
            }
          };
        }
        const nr = state.round + 1;
        const word = ANAGRAM_WORDS[(seedBase + nr * 7) % ANAGRAM_WORDS.length];
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            round: nr,
            seed: seedBase,
            word,
            scrambled: scrambleWord(word, seedBase + nr * 19),
            revealedCount: 0,
            attempts: [],
            scores,
            lastSummary: summary,
            turn: nr % 2 === 1 ? 'p1' : 'p2',
            moveCount: state.moveCount + 1
          }
        };
      };

      if (action === 'clue') {
        if (state.revealedCount >= 3) return fail();
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            revealedCount: state.revealedCount + 1,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (!action.startsWith('g:')) return fail();
      const parts = action.slice(2).split(':');
      const guess = parts[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12);
      if (!guess) return fail();
      const seedBase = state.moveCount === 0 && parts[1] ? Number(parts[1]) || state.seed : state.seed;
      const correct = guess === state.word;
      if (correct) {
        const scores = { ...state.scores, [p]: state.scores[p] + 2 };
        return advanceRound(scores, `${p === 'p1' ? 'P1' : 'P2'} unscrambled "${state.word}" (+2 pts)!`, seedBase);
      }
      const attempts = [...state.attempts, { by: p, guess, correct: false }];
      if (attempts.length >= 4) {
        return advanceRound(state.scores, `Nobody got it — word was "${state.word}".`, seedBase);
      }
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          seed: seedBase,
          attempts,
          turn: opp,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 19. TRIVIA SHOWDOWN
    case 'trivia-showdown': {
      const m = /^a:([0-3])(?::(\d+))?$/.exec(action);
      if (!m) return fail();
      const choice = Number(m[1]);
      let seed = state.seed;
      let questionIndices = state.questionIndices;
      if (state.moveCount === 0 && m[2]) {
        seed = Number(m[2]) || state.seed;
        const pool = shuffleWithSeed(
          Array.from({ length: TRIVIA_BANK.length }, (_, i) => i),
          seed
        );
        questionIndices = [questionIndices[0], ...pool.filter(i => i !== questionIndices[0]).slice(0, 6)];
      }

      if (state.turn === 'p1') {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            seed,
            questionIndices,
            pendingP1Choice: choice,
            turn: 'p2',
            moveCount: state.moveCount + 1
          }
        };
      }
      const qIdx = questionIndices[state.round - 1];
      const correctAns = TRIVIA_BANK[qIdx].ans;
      const p1Choice = state.pendingP1Choice ?? 0;
      const scores = {
        p1: state.scores.p1 + (p1Choice === correctAns ? 10 : 0),
        p2: state.scores.p2 + (choice === correctAns ? 10 : 0)
      };
      const history = [...state.history, { qIdx, p1Choice, p2Choice: choice, correctAns }];
      const done = state.round >= state.maxRounds;
      const winner: Batch2Winner = done
        ? scores.p1 > scores.p2
          ? 'p1'
          : scores.p2 > scores.p1
          ? 'p2'
          : 'draw'
        : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: p1Choice === correctAns || choice === correctAns,
        nextState: {
          ...state,
          round: done ? state.round : state.round + 1,
          seed,
          questionIndices,
          pendingP1Choice: null,
          scores,
          history,
          turn: 'p1',
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 20. MATH BLITZ
    case 'math-blitz': {
      const m = /^eq:(\+|\-|\*),(\+|\-|\*),(L|R)(?::(\d+))?$/.exec(action);
      if (!m) return fail();
      const op1 = m[1] as '+' | '-' | '*';
      const op2 = m[2] as '+' | '-' | '*';
      const grp = m[3] as 'L' | 'R';
      const seed = state.moveCount === 0 && m[4] ? Number(m[4]) || state.seed : state.seed;
      const puz = MATH_BLITZ_PUZZLES[state.puzzleIdx];
      const result = evalMathBlitzOp(puz.nums, op1, op2, grp);
      const hit = result === puz.target;
      const [a, b, c] = puz.nums;
      const sOp1 = op1 === '*' ? '×' : op1;
      const sOp2 = op2 === '*' ? '×' : op2;
      const expr = grp === 'L' ? `(${a} ${sOp1} ${b}) ${sOp2} ${c}` : `${a} ${sOp1} (${b} ${sOp2} ${c})`;
      const attempts = [...state.attemptsThisRound, { by: p, expr, result, hit }];

      if (hit || attempts.length >= 2) {
        const scores = hit ? { ...state.scores, [p]: state.scores[p] + 2 } : state.scores;
        const summary = hit
          ? `Round ${state.round}: ${p === 'p1' ? 'P1' : 'P2'} hit ${puz.target} with ${expr}!`
          : `Round ${state.round}: Target ${puz.target} missed (${puz.sample}).`;
        if (state.round >= state.maxRounds) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: hit,
            nextState: {
              ...state,
              seed,
              scores,
              lastSummary: summary,
              winner: scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : 'draw',
              moveCount: state.moveCount + 1
            }
          };
        }
        const nr = state.round + 1;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: hit,
          nextState: {
            ...state,
            round: nr,
            seed,
            puzzleIdx: (seed + nr * 3) % MATH_BLITZ_PUZZLES.length,
            attemptsThisRound: [],
            scores,
            lastSummary: summary,
            turn: nr % 2 === 1 ? 'p1' : 'p2',
            moveCount: state.moveCount + 1
          }
        };
      }

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          seed,
          attemptsThisRound: attempts,
          turn: opp,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 21. SIMON DUEL
    case 'simon-duel': {
      const m = /^s:([0-3](?:,[0-3])*)$/.exec(action);
      if (!m) return fail();
      const seq = m[1].split(',').map(Number);
      const expected = state.sequence;
      const matchesPrefix =
        seq.length === expected.length + 1 && expected.every((v, idx) => seq[idx] === v);
      if (!matchesPrefix) {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            lastNote: `${p === 'p1' ? 'P1' : 'P2'} broke the pattern!`,
            winner: opp,
            moveCount: state.moveCount + 1
          }
        };
      }
      const reachedMax = seq.length >= state.maxLength;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: reachedMax,
        nextState: {
          ...state,
          sequence: seq,
          lastAddedBy: p,
          lastNote: reachedMax
            ? `Full ${state.maxLength}-step pattern mastered! ${p === 'p1' ? 'P1' : 'P2'} wins!`
            : `${p === 'p1' ? 'P1' : 'P2'} copied ${expected.length} pads & added +1 (${seq.length} total)!`,
          turn: reachedMax ? p : opp,
          winner: reachedMax ? p : null,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 22. BOGGLE DUEL
    case 'boggle-duel': {
      const boardSpec = BOGGLE_BOARDS[state.boardIdx];
      if (action === 'pass') {
        const cp = state.consecutivePasses + 1;
        const turnsLeft = state.turnsLeft - 1;
        const done = cp >= 2 || turnsLeft <= 0;
        const winner: Batch2Winner = done
          ? state.scores.p1 > state.scores.p2
            ? 'p1'
            : state.scores.p2 > state.scores.p1
            ? 'p2'
            : 'draw'
          : null;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            turnsLeft,
            consecutivePasses: cp,
            lastError: null,
            turn: winner ? p : opp,
            winner,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (!action.startsWith('w:')) return fail();
      const rawWord = action.slice(2).trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 16);
      if (rawWord.length < 3) return fail();
      if (state.claimed.some(c => c.word === rawWord)) return fail();
      if (!canSpellBoggleWord(boardSpec.grid, rawWord)) return fail();
      // Validate against verified board dictionary OR accept valid-length board words >= 3 in dictionary
      if (!boardSpec.words.includes(rawWord)) {
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            lastError: `"${rawWord}" not in this board's word list.`,
            moveCount: state.moveCount + 1
          }
        };
      }
      const pts = rawWord.length >= 6 ? 6 : rawWord.length === 5 ? 4 : rawWord.length === 4 ? 2 : 1;
      const claimed = [...state.claimed, { word: rawWord, by: p, pts }];
      const scores = { ...state.scores, [p]: state.scores[p] + pts };
      const turnsLeft = state.turnsLeft - 1;
      const done = turnsLeft <= 0;
      const winner: Batch2Winner = done
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
          claimed,
          scores,
          turnsLeft,
          consecutivePasses: 0,
          lastError: null,
          turn: winner ? p : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 23. SUDOKU DUEL 4x4
    case 'sudoku-duel': {
      const m = /^c:([0-3]),([0-3]),([1-4])$/.exec(action);
      if (!m) return fail();
      const r = Number(m[1]), c = Number(m[2]), v = Number(m[3]);
      if (state.grid[r][c] !== null) return fail();
      const correct = state.solution[r][c] === v;
      const grid = state.grid.map(row => [...row]);
      if (correct) grid[r][c] = v;
      const scores = {
        ...state.scores,
        [p]: state.scores[p] + (correct ? 10 : -5)
      };
      const allSolved = grid.every(row => row.every(cell => cell !== null));
      const winner: Batch2Winner = allSolved
        ? scores.p1 > scores.p2
          ? 'p1'
          : scores.p2 > scores.p1
          ? 'p2'
          : 'draw'
        : null;
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: correct,
        nextState: {
          ...state,
          grid,
          scores,
          lastNote: correct
            ? `${p === 'p1' ? 'P1' : 'P2'} placed ${v} (+10 pts)`
            : `${p === 'p1' ? 'P1' : 'P2'} missed with ${v} (−5 pts)`,
          lastCell: [r, c],
          turn: winner ? p : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 24. UNO DUEL
    case 'uno-duel': {
      if (action.startsWith('deal:')) {
        if (state.hands.p1.length > 0 || state.hands.p2.length > 0) return fail();
        const seed = Number(action.slice(5)) || 409;
        const deck = buildUnoDeck(seed);
        const p1 = deck.slice(0, 7);
        const p2 = deck.slice(7, 14);
        let topCard = deck[14];
        let deckPos = 15;
        if (topCard.color === 'W') topCard = { color: 'R', value: '5' };
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            deck,
            deckPos,
            hands: { p1, p2 },
            topCard,
            activeColor: topCard.color as UnoColor,
            lastNote: 'Cards dealt! Match color, value, or drop a Wild.',
            moveCount: state.moveCount + 1
          }
        };
      }
      if (state.hands.p1.length === 0 && state.hands.p2.length === 0) return fail();
      const hand = [...state.hands[p]];
      const oppHand = [...state.hands[opp]];
      let deckPos = state.deckPos;

      if (action === 'draw') {
        const drawn = state.deck[deckPos % state.deck.length];
        deckPos++;
        hand.push(drawn);
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: {
            ...state,
            deckPos,
            hands: { ...state.hands, [p]: hand },
            lastNote: `${p === 'p1' ? 'P1' : 'P2'} drew a card.`,
            turn: opp,
            winner: state.moveCount + 1 >= 180 ? (hand.length < oppHand.length ? p : oppHand.length < hand.length ? opp : 'draw') : null,
            moveCount: state.moveCount + 1
          }
        };
      }

      const m = /^p:(\d+)(?::(R|B|G|Y))?$/.exec(action);
      if (!m) return fail();
      const idx = Number(m[1]);
      if (idx < 0 || idx >= hand.length) return fail();
      const card = hand[idx];
      if (card.value === 'WILD') {
        if (!m[2]) return fail();
      } else if (card.color !== state.activeColor && card.value !== state.topCard.value) {
        return fail();
      }
      hand.splice(idx, 1);
      const nextColor: UnoColor = card.value === 'WILD' ? (m[2] as UnoColor) : (card.color as UnoColor);
      let nextTurn = opp;
      let extraTurn = false;
      let note = `${p === 'p1' ? 'P1' : 'P2'} played ${card.value}`;

      if (card.value === 'SKIP') {
        nextTurn = p;
        extraTurn = true;
        note = `${p === 'p1' ? 'P1' : 'P2'} played SKIP — goes again!`;
      } else if (card.value === '+2') {
        oppHand.push(state.deck[deckPos % state.deck.length], state.deck[(deckPos + 1) % state.deck.length]);
        deckPos += 2;
        nextTurn = p;
        extraTurn = true;
        note = `${p === 'p1' ? 'P1' : 'P2'} dropped +2! Opponent drew 2 cards.`;
      } else if (card.value === 'WILD') {
        note = `${p === 'p1' ? 'P1' : 'P2'} played WILD → Color ${nextColor}!`;
      }

      const won = hand.length === 0;
      return {
        valid: true,
        extraTurn: !won && extraTurn,
        capturedOrScored: won,
        nextState: {
          ...state,
          deckPos,
          hands: { ...state.hands, [p]: hand, [opp]: oppHand },
          topCard: card,
          activeColor: nextColor,
          lastNote: won ? `${p === 'p1' ? 'P1' : 'P2'} played their final card!` : note,
          turn: won ? p : nextTurn,
          winner: won ? p : null,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 25. GO FISH
    case 'go-fish': {
      if (action.startsWith('deal:')) {
        if (state.hands.p1.length > 0 || state.hands.p2.length > 0) return fail();
        const seed = Number(action.slice(5)) || 517;
        const deck = buildGoFishPond(seed);
        const r1 = extractGoFishBooks(deck.slice(0, 5));
        const r2 = extractGoFishBooks(deck.slice(5, 10));
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            pond: deck.slice(10),
            hands: { p1: r1.nextHand, p2: r2.nextHand },
            books: { p1: r1.newBooks, p2: r2.newBooks },
            lastNote: 'Hands dealt! Ask your rival for a matching rank.',
            moveCount: state.moveCount + 1
          }
        };
      }

      const pond = [...state.pond];
      const hands = { p1: [...state.hands.p1], p2: [...state.hands.p2] };
      const books = { p1: [...state.books.p1], p2: [...state.books.p2] };
      let nextTurn = opp;
      let extraTurn = false;
      let note = '';

      if (action === 'draw') {
        if (hands[p].length > 0 || pond.length === 0) return fail();
        hands[p].push(pond.shift()!);
        note = `${p === 'p1' ? 'P1' : 'P2'} drew a fresh card from the pond.`;
      } else if (action.startsWith('ask:')) {
        const rank = action.slice(4);
        if (!hands[p].includes(rank)) return fail();
        const matching = hands[opp].filter(c => c === rank);
        if (matching.length > 0) {
          hands[opp] = hands[opp].filter(c => c !== rank);
          hands[p].push(...matching);
          nextTurn = p;
          extraTurn = true;
          note = `Hit! ${p === 'p1' ? 'P1' : 'P2'} took ${matching.length}× "${rank}" & goes again!`;
        } else if (pond.length > 0) {
          const fished = pond.shift()!;
          hands[p].push(fished);
          if (fished === rank) {
            nextTurn = p;
            extraTurn = true;
            note = `Go Fish! Drew matching "${fished}" from the pond — bonus turn!`;
          } else {
            note = `Go Fish! No "${rank}" — drew from the pond.`;
          }
        } else {
          note = `Go Fish! No "${rank}" and pond is empty.`;
        }
      } else {
        return fail();
      }

      const extP = extractGoFishBooks(hands[p]);
      hands[p] = extP.nextHand;
      books[p].push(...extP.newBooks);

      // Refill empty hand from pond if available
      if (hands[p].length === 0 && pond.length > 0) hands[p].push(pond.shift()!);
      if (hands[opp].length === 0 && pond.length > 0) hands[opp].push(pond.shift()!);

      const done = pond.length === 0 && hands.p1.length === 0 && hands.p2.length === 0;
      const deadlock = !done && hands[nextTurn].length === 0 && pond.length === 0;
      let winner: Batch2Winner = null;
      if (done || deadlock || state.moveCount + 1 >= 160) {
        winner = books.p1.length > books.p2.length ? 'p1' : books.p2.length > books.p1.length ? 'p2' : 'draw';
      }

      return {
        valid: true,
        extraTurn: !winner && extraTurn,
        capturedOrScored: extP.newBooks.length > 0,
        nextState: {
          ...state,
          pond,
          hands,
          books,
          lastNote: note,
          turn: winner ? p : nextTurn,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 26. POKER DICE
    case 'poker-dice': {
      if (action.startsWith('toggle:')) {
        if (state.rollsLeft === 3 || state.rollsLeft === 0) return fail();
        const idx = Number(action.slice(7));
        if (!Number.isInteger(idx) || idx < 0 || idx > 4) return fail();
        const held = [...state.held];
        held[idx] = !held[idx];
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: { ...state, held, moveCount: state.moveCount + 1 }
        };
      }
      if (action.startsWith('roll:')) {
        if (state.rollsLeft <= 0) return fail();
        const seed = Number(action.slice(5)) || (state.moveCount + 3) * 971;
        const rng = seededPrng(seed);
        const dice = state.dice.map((d, i) => (state.held[i] && d > 0 ? d : Math.floor(rng() * 6) + 1));
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            dice,
            rollsLeft: state.rollsLeft - 1,
            moveCount: state.moveCount + 1
          }
        };
      }
      if (action === 'bank') {
        if (state.rollsLeft === 3) return fail();
        const handEval = pokerDiceRank(state.dice);
        if (p === 'p1') {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: true,
            nextState: {
              ...state,
              dice: [0, 0, 0, 0, 0],
              held: [false, false, false, false, false],
              rollsLeft: 3,
              pendingP1: { pts: handEval.pts, name: handEval.name },
              lastNote: `P1 banked ${handEval.name} (${handEval.pts} pts)!`,
              turn: 'p2',
              moveCount: state.moveCount + 1
            }
          };
        }
        const p1Res = state.pendingP1 || { pts: 0, name: 'None' };
        const roundResults = [
          ...state.roundResults,
          {
            round: state.round,
            p1Pts: p1Res.pts,
            p1Name: p1Res.name,
            p2Pts: handEval.pts,
            p2Name: handEval.name
          }
        ];
        const scores = { p1: state.scores.p1 + p1Res.pts, p2: state.scores.p2 + handEval.pts };
        const done = state.round >= state.maxRounds;
        const winner: Batch2Winner = done
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
            round: done ? state.round : state.round + 1,
            dice: [0, 0, 0, 0, 0],
            held: [false, false, false, false, false],
            rollsLeft: 3,
            roundResults,
            pendingP1: null,
            scores,
            lastNote: `P2 banked ${handEval.name} (${handEval.pts} pts)!`,
            turn: 'p1',
            winner,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    // 27. LIAR'S DICE
    case 'liars-dice': {
      const rollPools = (seed: number, c1: number, c2: number): { p1: number[]; p2: number[] } => {
        const rng = seededPrng(seed);
        return {
          p1: Array.from({ length: c1 }, () => Math.floor(rng() * 6) + 1).sort((a, b) => a - b),
          p2: Array.from({ length: c2 }, () => Math.floor(rng() * 6) + 1).sort((a, b) => a - b)
        };
      };

      if (action.startsWith('roll:')) {
        if (state.pools.p1.length > 0) return fail();
        const seed = Number(action.slice(5)) || (state.moveCount + 5) * 613;
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: false,
          nextState: {
            ...state,
            seed,
            pools: rollPools(seed, state.diceCounts.p1, state.diceCounts.p2),
            moveCount: state.moveCount + 1
          }
        };
      }

      if (state.pools.p1.length === 0) return fail();
      if (action === 'liar') {
        if (!state.currentBid) return fail();
        const { qty, face, by } = state.currentBid;
        const allDice = [...state.pools.p1, ...state.pools.p2];
        const actualCount = allDice.filter(d => d === face).length;
        const bidValid = actualCount >= qty;
        const loser: Batch2Player = bidValid ? p : by;
        const nextCounts = { ...state.diceCounts, [loser]: state.diceCounts[loser] - 1 };
        const roundWinner = nextCounts[loser] <= 0 ? oppOf(loser) : null;
        const nextSeed = state.seed + (state.moveCount + 1) * 97;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            seed: nextSeed,
            diceCounts: nextCounts,
            pools: roundWinner ? state.pools : rollPools(nextSeed, nextCounts.p1, nextCounts.p2),
            currentBid: null,
            lastReveal: {
              bidQty: qty,
              bidFace: face,
              actualCount,
              p1Dice: state.pools.p1,
              p2Dice: state.pools.p2,
              loser
            },
            turn: roundWinner ? p : oppOf(loser),
            winner: roundWinner,
            moveCount: state.moveCount + 1
          }
        };
      }

      const mb = /^bid:(\d+),([1-6])$/.exec(action);
      if (!mb) return fail();
      const qty = Number(mb[1]);
      const face = Number(mb[2]);
      const maxDice = state.diceCounts.p1 + state.diceCounts.p2;
      if (qty < 1 || qty > maxDice) return fail();
      if (state.currentBid) {
        const cur = state.currentBid;
        const strictlyHigher = qty > cur.qty || (qty === cur.qty && face > cur.face);
        if (!strictlyHigher) return fail();
      }
      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: false,
        nextState: {
          ...state,
          currentBid: { qty, face, by: p },
          turn: opp,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 28. FARKLE DUEL
    case 'farkle-duel': {
      if (action.startsWith('roll:')) {
        if (state.activeDice.length > 0) return fail();
        const seed = Number(action.slice(5)) || (state.moveCount + 7) * 829;
        const rng = seededPrng(seed);
        const count = state.waitingToRollCount || 6;
        const rolled = Array.from({ length: count }, () => Math.floor(rng() * 6) + 1);
        if (!hasAnyFarkleScore(rolled)) {
          return {
            valid: true,
            extraTurn: false,
            capturedOrScored: false,
            nextState: {
              ...state,
              turnBank: 0,
              activeDice: [],
              waitingToRollCount: 6,
              lastEvent: `FARKLE! [${rolled.join(', ')}] had zero scorers — turn lost!`,
              turn: opp,
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
            activeDice: rolled,
            lastEvent: `Rolled [${rolled.join(', ')}] — select scoring dice!`,
            moveCount: state.moveCount + 1
          }
        };
      }

      if (action.startsWith('keep:')) {
        if (state.activeDice.length === 0) return fail();
        const bits = action.slice(5);
        if (bits.length !== state.activeDice.length || !/^[01]+$/.test(bits)) return fail();
        const chosen = state.activeDice.filter((_, i) => bits[i] === '1');
        const evalRes = scoreFarkleDice(chosen);
        if (!evalRes.allUsed || evalRes.pts <= 0) return fail();
        const remaining = state.activeDice.length - chosen.length;
        const nextCount = remaining === 0 ? 6 : remaining;
        return {
          valid: true,
          extraTurn: true,
          capturedOrScored: true,
          nextState: {
            ...state,
            turnBank: state.turnBank + evalRes.pts,
            activeDice: [],
            waitingToRollCount: nextCount,
            lastEvent: `Kept ${evalRes.label} · Bank: ${state.turnBank + evalRes.pts}${remaining === 0 ? ' (HOT DICE!)' : ''}`,
            moveCount: state.moveCount + 1
          }
        };
      }

      if (action === 'bank') {
        if (state.activeDice.length > 0 || state.turnBank <= 0) return fail();
        const nextScore = state.scores[p] + state.turnBank;
        const scores = { ...state.scores, [p]: nextScore };
        const won = nextScore >= state.target;
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: true,
          nextState: {
            ...state,
            scores,
            turnBank: 0,
            activeDice: [],
            waitingToRollCount: 6,
            lastEvent: `${p === 'p1' ? 'P1' : 'P2'} banked +${state.turnBank} pts!`,
            turn: won ? p : opp,
            winner: won ? p : null,
            moveCount: state.moveCount + 1
          }
        };
      }
      return fail();
    }

    // 29. COIN ROW
    case 'coin-row': {
      if (action !== 'left' && action !== 'right') return fail();
      if (state.coins.length === 0) return fail();
      const coins = [...state.coins];
      const value = action === 'left' ? coins.shift()! : coins.pop()!;
      const scores = { ...state.scores, [p]: state.scores[p] + value };
      const done = coins.length === 0;
      const winner: Batch2Winner = done
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
          coins,
          scores,
          lastPick: { by: p, side: action, value },
          turn: winner ? p : opp,
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }

    // 30. HIGH NOON DUEL
    case 'high-noon-duel': {
      const m = /^a:(reload|shoot|shield)$/.exec(action);
      if (!m) return fail();
      const choice = m[1] as 'reload' | 'shoot' | 'shield';
      if (choice === 'shoot' && state.ammo[p] <= 0) return fail();

      if (state.turn === 'p1') {
        return {
          valid: true,
          extraTurn: false,
          capturedOrScored: false,
          nextState: { ...state, pendingP1: choice, turn: 'p2', moveCount: state.moveCount + 1 }
        };
      }

      const c1 = state.pendingP1 || 'reload';
      const c2 = choice;
      const hp = { ...state.hp };
      const ammo = { ...state.ammo };
      if (c1 === 'reload') ammo.p1 = Math.min(3, ammo.p1 + 1);
      if (c2 === 'reload') ammo.p2 = Math.min(3, ammo.p2 + 1);
      if (c1 === 'shoot') ammo.p1 = Math.max(0, ammo.p1 - 1);
      if (c2 === 'shoot') ammo.p2 = Math.max(0, ammo.p2 - 1);

      let note = 'Both cowboys stood steady.';
      if (c1 === 'shoot' && c2 === 'shoot') {
        note = 'Bullets collided mid-air in a spark!';
      } else if (c1 === 'shoot' && c2 === 'reload') {
        hp.p2 -= 1;
        note = 'Sheriff caught Outlaw reloading (−1 HP)!';
      } else if (c2 === 'shoot' && c1 === 'reload') {
        hp.p1 -= 1;
        note = 'Outlaw caught Sheriff reloading (−1 HP)!';
      } else if (c1 === 'shoot' && c2 === 'shield') {
        note = 'Outlaw deflected Sheriff’s bullet!';
      } else if (c2 === 'shoot' && c1 === 'shield') {
        note = 'Sheriff deflected Outlaw’s bullet!';
      } else if (c1 === 'reload' && c2 === 'reload') {
        note = 'Both cowboys loaded up +1 ammo.';
      }

      let winner: Batch2Winner = null;
      if (hp.p1 <= 0 && hp.p2 <= 0) winner = 'draw';
      else if (hp.p2 <= 0) winner = 'p1';
      else if (hp.p1 <= 0) winner = 'p2';
      else if (state.round >= 15) winner = hp.p1 > hp.p2 ? 'p1' : hp.p2 > hp.p1 ? 'p2' : 'draw';

      return {
        valid: true,
        extraTurn: false,
        capturedOrScored: hp.p1 !== state.hp.p1 || hp.p2 !== state.hp.p2,
        nextState: {
          ...state,
          round: winner ? state.round : state.round + 1,
          hp,
          ammo,
          pendingP1: null,
          history: [...state.history, { round: state.round, p1: c1, p2: c2, note }],
          turn: 'p1',
          winner,
          moveCount: state.moveCount + 1
        }
      };
    }
  }
}

// ---------------- BOT AI ENGINE (ALL 4 DIFFICULTIES) ----------------

export function pickBatch2BotAction(
  state: Batch2ArcadeState,
  botProfile: Batch2BotProfile
): string | null {
  if (state.winner) return null;
  const bot = state.turn;
  const opp = oppOf(bot);
  const diff = botProfile.difficulty;
  const seed = Math.floor(Math.random() * 90000) + 101;

  // Custom handling for creative / puzzle / hidden-dice games
  if (state.gameType === 'symmetry-art') {
    if (state.phase === 'pick') {
      const known = state.wordChoices.filter(w => Boolean(SYMMETRY_BOT_TEMPLATES[w]));
      return `w:${pickRandom(known.length > 0 ? known : state.wordChoices)}`;
    }
    if (state.phase === 'draw') {
      const target = state.word && SYMMETRY_BOT_TEMPLATES[state.word] ? state.word : 'heart';
      return `tpl:${target}`;
    }
    const hitChance = diff === 'expert' ? 0.88 : diff === 'hard' ? 0.72 : diff === 'medium' ? 0.52 : 0.3;
    if (state.word && Math.random() < hitChance) return `g:${state.word}`;
    const decoys = SYMMETRY_WORDS.filter(w => w !== state.word && !state.guesses.some(g => g.text === w));
    return `g:${pickRandom(decoys.length > 0 ? decoys : SYMMETRY_WORDS)}`;
  }

  if (state.gameType === 'color-match') {
    const spread = diff === 'expert' ? 12 : diff === 'hard' ? 24 : diff === 'medium' ? 42 : 70;
    const jitter = () => Math.floor((Math.random() * 2 - 1) * spread);
    const [tr, tg, tb] = state.targetRgb;
    const r = Math.max(0, Math.min(255, tr + jitter()));
    const g = Math.max(0, Math.min(255, tg + jitter()));
    const b = Math.max(0, Math.min(255, tb + jitter()));
    return state.moveCount === 0 ? `mix:${r},${g},${b}:${seed}` : `mix:${r},${g},${b}`;
  }

  if (state.gameType === 'emoji-story') {
    if (state.phase === 'pick') return `p:${pickRandom(state.choices)}`;
    if (state.phase === 'build') {
      const match = EMOJI_STORY_LIST.find(x => x.answer === state.answer) || EMOJI_STORY_LIST[0];
      const nextEmpty = state.panels.findIndex(p => !p);
      if (nextEmpty !== -1) return `s:${nextEmpty},${match.panels[nextEmpty]}`;
      return 'go';
    }
    const hitChance = diff === 'expert' ? 0.85 : diff === 'hard' ? 0.68 : diff === 'medium' ? 0.45 : 0.25;
    if (state.answer && Math.random() < hitChance) return `g:${state.answer}`;
    const decoys = EMOJI_STORY_LIST.map(x => x.answer).filter(a => a !== state.answer);
    return `g:${pickRandom(decoys)}`;
  }

  if (state.gameType === 'trivia-showdown') {
    const q = TRIVIA_BANK[state.questionIndices[state.round - 1]];
    const acc = diff === 'expert' ? 0.92 : diff === 'hard' ? 0.78 : diff === 'medium' ? 0.58 : 0.35;
    const choice = Math.random() < acc ? q.ans : pickRandom([0, 1, 2, 3].filter(i => i !== q.ans));
    return state.moveCount === 0 ? `a:${choice}:${seed}` : `a:${choice}`;
  }

  if (state.gameType === 'anagram-scramble') {
    const acc = diff === 'expert' ? 0.9 : diff === 'hard' ? 0.75 : diff === 'medium' ? 0.52 : 0.28;
    if (Math.random() < acc) return state.moveCount === 0 ? `g:${state.word}:${seed}` : `g:${state.word}`;
    const fake = ANAGRAM_WORDS.filter(w => w !== state.word)[0] || 'PUZZLE';
    return state.moveCount === 0 ? `g:${fake}:${seed}` : `g:${fake}`;
  }

  if (state.gameType === 'math-blitz') {
    const legal = getBatch2LegalActions(state);
    const acc = diff === 'expert' ? 0.92 : diff === 'hard' ? 0.78 : diff === 'medium' ? 0.55 : 0.32;
    const picked = Math.random() < acc ? pickRandom(legal) : pickRandom(['eq:+,+,L', 'eq:*,-,L', 'eq:+,*,R']);
    return state.moveCount === 0 ? `${picked}:${seed}` : picked;
  }

  if (state.gameType === 'simon-duel') {
    const failChance = diff === 'expert' ? 0.04 : diff === 'hard' ? 0.1 : diff === 'medium' ? 0.2 : 0.34;
    if (state.sequence.length >= 4 && Math.random() < failChance) {
      const wrong = [...state.sequence];
      wrong[0] = (wrong[0] + 1) % 4;
      return `s:${wrong.join(',')}`;
    }
    return `s:${[...state.sequence, Math.floor(Math.random() * 4)].join(',')}`;
  }

  if (state.gameType === 'poker-dice') {
    if (state.rollsLeft === 3 || (state.rollsLeft > 0 && pokerDiceRank(state.dice).rank < 2)) {
      return `roll:${seed}`;
    }
    return 'bank';
  }

  if (state.gameType === 'farkle-duel') {
    if (state.activeDice.length === 0) {
      if (state.turnBank > 0) {
        const thresh = diff === 'expert' ? 400 : diff === 'hard' ? 350 : 250;
        if (state.scores[bot] + state.turnBank >= state.target || state.turnBank >= thresh || state.waitingToRollCount <= 2) {
          return 'bank';
        }
      }
      return `roll:${seed}`;
    }
    const legal = getBatch2LegalActions(state);
    let best = legal[0];
    let bestPts = -1;
    for (const act of legal) {
      const bits = act.slice(5);
      const chosen = state.activeDice.filter((_, i) => bits[i] === '1');
      const s = scoreFarkleDice(chosen).pts + chosen.length * 10;
      if (s > bestPts) {
        bestPts = s;
        best = act;
      }
    }
    return best;
  }

  if (state.gameType === 'liars-dice') {
    if (state.pools.p1.length === 0) return `roll:${seed}`;
    const myDice = state.pools[bot];
    const totalDice = state.diceCounts.p1 + state.diceCounts.p2;
    if (!state.currentBid) {
      const counts = [0, 0, 0, 0, 0, 0, 0];
      myDice.forEach(d => counts[d]++);
      let bestFace = 3;
      for (let f = 1; f <= 6; f++) if (counts[f] >= counts[bestFace]) bestFace = f;
      const qty = Math.max(1, counts[bestFace] + (Math.random() < 0.4 ? 1 : 0));
      return `bid:${Math.min(totalDice, qty)},${bestFace}`;
    }
    const cur = state.currentBid;
    const myMatches = myDice.filter(d => d === cur.face).length;
    const oppDiceCount = state.diceCounts[opp];
    const expectedTotal = myMatches + oppDiceCount / 6;
    if (cur.qty > expectedTotal + (diff === 'easy' ? 1.5 : 0.7)) {
      return 'liar';
    }
    const legal = getBatch2LegalActions(state).filter(a => a.startsWith('bid:'));
    if (legal.length === 0) return 'liar';
    return legal[0];
  }

  const legal = getBatch2LegalActions(state);
  if (legal.length === 0) return null;

  if (state.gameType === 'uno-duel') {
    if (legal[0].startsWith('deal:')) return `deal:${seed}`;
  }
  if (state.gameType === 'go-fish') {
    if (legal[0].startsWith('deal:')) return `deal:${seed}`;
  }

  // Easy bot: spots immediate wins half the time, else relaxed pick
  if (diff === 'easy') {
    if (Math.random() < 0.55) {
      for (const act of legal.slice(0, 60)) {
        if (applyBatch2ArcadeAction(state, act).nextState.winner === bot) return act;
      }
    }
    return pickRandom(legal);
  }

  // Medium/Hard/Expert always take immediate wins
  for (const act of legal.slice(0, 120)) {
    if (applyBatch2ArcadeAction(state, act).nextState.winner === bot) return act;
  }

  // Game-specific smart heuristics
  switch (state.gameType) {
    case 'quoridor': {
      const goalRow = bot === 'p1' ? 0 : 6;
      const oppGoal = opp === 'p1' ? 0 : 6;
      const myDist = quoridorShortestDist(state.hWalls, state.vWalls, state.pawns[bot], goalRow);
      const oppDist = quoridorShortestDist(state.hWalls, state.vWalls, state.pawns[opp], oppGoal);

      let bestAct = legal[0];
      let bestScore = -9999;
      for (const act of legal) {
        const res = applyBatch2ArcadeAction(state, act).nextState as QuoridorState;
        const dMe = quoridorShortestDist(res.hWalls, res.vWalls, res.pawns[bot], goalRow);
        const dOpp = quoridorShortestDist(res.hWalls, res.vWalls, res.pawns[opp], oppGoal);
        const progress = (myDist - dMe) * 14 + (dOpp - oppDist) * (oppDist <= 3 ? 16 : 9);
        const wallPenalty = act.startsWith('w') ? -3 : 0;
        const sc = progress + wallPenalty + Math.random() * 0.4;
        if (sc > bestScore) {
          bestScore = sc;
          bestAct = act;
        }
      }
      return bestAct;
    }

    case 'pente': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const res = applyBatch2ArcadeAction(state, act);
        const next = res.nextState as PenteState;
        const [r, c] = act.slice(2).split(',').map(Number);
        let sc = (next.captures[bot] - state.captures[bot]) * 40;
        // Center preference + adjacency
        sc += Math.max(0, 5 - (Math.abs(r - 4) + Math.abs(c - 4))) * 2;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && state.board[nr][nc]) {
              sc += state.board[nr][nc] === bot ? 6 : 4;
            }
          }
        }
        if (sc > bestScore) {
          bestScore = sc;
          best = act;
        }
      }
      return best;
    }

    case 'nine-mens-morris': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const res = applyBatch2ArcadeAction(state, act);
        let sc = res.capturedOrScored ? 35 : 0;
        if (res.nextState.turn === bot) sc += 25;
        sc += Math.random() * 2;
        if (sc > bestScore) {
          bestScore = sc;
          best = act;
        }
      }
      return best;
    }

    case 'santorini-lite': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const next = applyBatch2ArcadeAction(state, act).nextState as SantoriniLiteState;
        let sc = 0;
        if (state.phase === 'move') {
          const parts = act.slice(2).split(',').map(Number);
          sc = next.levels[parts[1]][parts[2]] * 18;
        } else {
          const [br, bc] = act.slice(2).split(',').map(Number);
          const nearMine = next.builders[bot].some(([mr, mc]) => Math.abs(mr - br) <= 1 && Math.abs(mc - bc) <= 1);
          sc = next.levels[br][bc] === 3 && !nearMine ? 25 : nearMine ? 10 : 2;
        }
        if (sc > bestScore) {
          bestScore = sc;
          best = act;
        }
      }
      return best;
    }

    case 'fox-and-hounds': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const next = applyBatch2ArcadeAction(state, act).nextState as FoxAndHoundsState;
        const oppMoves = getBatch2LegalActions(next).length;
        let sc = bot === 'p1' ? (7 - next.fox[0]) * 12 + oppMoves : -oppMoves * 10;
        if (bot === 'p2') {
          const avgRow = next.hounds.reduce((s, h) => s + h[0], 0);
          sc += avgRow * 2;
        }
        sc += Math.random() * 1.5;
        if (sc > bestScore) {
          bestScore = sc;
          best = act;
        }
      }
      return best;
    }

    case 'coin-row': {
      // Exact minimax / DP lookahead for optimal coin picking!
      if (diff === 'hard' || diff === 'expert') {
        const memo = new Map<string, number>();
        const solve = (l: number, r: number): number => {
          if (l > r) return 0;
          const k = `${l},${r}`;
          if (memo.has(k)) return memo.get(k)!;
          const pickL = state.coins[l] - solve(l + 1, r);
          const pickR = state.coins[r] - solve(l, r - 1);
          const best = Math.max(pickL, pickR);
          memo.set(k, best);
          return best;
        };
        const n = state.coins.length;
        if (n >= 2) {
          const lVal = state.coins[0] - solve(1, n - 1);
          const rVal = state.coins[n - 1] - solve(0, n - 2);
          return lVal >= rVal ? 'left' : 'right';
        }
      }
      return state.coins[0] >= state.coins[state.coins.length - 1] ? 'left' : 'right';
    }

    case 'go-mini': {
      const nonPass = legal.filter(a => a !== 'pass');
      if (nonPass.length === 0 || state.moveCount >= 68) return 'pass';
      let best = nonPass[0];
      let bestScore = -999;
      for (const act of nonPass.slice(0, 35)) {
        const res = applyBatch2ArcadeAction(state, act);
        const [r, c] = act.slice(2).split(',').map(Number);
        let sc = (res.capturedOrScored ? 40 : 0) + (3 - Math.abs(r - 3)) + (3 - Math.abs(c - 3)) + Math.random() * 2;
        if (sc > bestScore) {
          bestScore = sc;
          best = act;
        }
      }
      return best;
    }

    case 'splatter-turf': {
      let best = legal[0];
      let bestScore = -999;
      for (const act of legal) {
        const next = applyBatch2ArcadeAction(state, act).nextState as SplatterTurfState;
        const diffScore = next.scores[bot] - next.scores[opp] - (act.startsWith('b:') ? 3 : 0);
        if (diffScore > bestScore) {
          bestScore = diffScore;
          best = act;
        }
      }
      return best;
    }

    case 'high-noon-duel': {
      if (state.ammo[bot] === 0 && state.ammo[opp] === 0) return 'a:reload';
      if (state.ammo[bot] >= 2) return Math.random() < 0.7 ? 'a:shoot' : 'a:shield';
      if (state.ammo[opp] > 0 && Math.random() < 0.45) return 'a:shield';
      return pickRandom(legal);
    }

    default: {
      // Score remaining board & duel games via 1-ply mobility / capture / goal heuristic
      let best = legal[0];
      let bestScore = -9999;
      for (const act of legal.slice(0, 60)) {
        const res = applyBatch2ArcadeAction(state, act);
        let sc = res.capturedOrScored ? 25 : 0;
        if (res.extraTurn) sc += 15;
        if (!res.nextState.winner) {
          const oppChoices = getBatch2LegalActions(res.nextState).length;
          if (state.gameType === 'isola' || state.gameType === 'amazons-mini' || state.gameType === 'tron-turn' || state.gameType === 'knight-duel') {
            sc -= oppChoices * 2;
          }
        }
        sc += Math.random() * 1.5;
        if (sc > bestScore) {
          bestScore = sc;
          best = act;
        }
      }
      return best;
    }
  }
}
