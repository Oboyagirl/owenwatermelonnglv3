import {
  applyArcadeAction,
  createInitialArcadeState
} from './arcadeEngines.ts';
import type {
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState
} from './arcadeEngines.ts';

export type TeamMode = '1v1' | '2v2';
export type TeamSeatKind = 'open' | 'human' | 'bot';

export interface TeamSeat {
  kind: TeamSeatKind;
  uid: string | null;
  playerId: string | null;
  name: string | null;
  botId: string | null;
}

const CHESS_BOT_CATALOG: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'mittens', name: 'Mittens' },
  { id: 'barnaby', name: 'Barnaby' },
  { id: 'toby', name: 'Toby' },
  { id: 'gus', name: 'Gus' },
  { id: 'penny', name: 'Penny' },
  { id: 'nora', name: 'Nora' },
  { id: 'crumb', name: 'Crumb' },
  { id: 'milo', name: 'Milo' },
  { id: 'billy', name: 'Billy' },
  { id: 'saffron', name: 'Saffron' },
  { id: 'clara', name: 'Clara' },
  { id: 'doyle', name: 'Doyle' },
  { id: 'maya', name: 'Maya' },
  { id: 'mateo', name: 'Mateo' },
  { id: 'hans', name: 'Hans' },
  { id: 'zara', name: 'Zara' },
  { id: 'viktor', name: 'Viktor' },
  { id: 'marcel', name: 'Marcel' },
  { id: 'kira', name: 'Kira' },
  { id: 'sora', name: 'Sora' },
  { id: 'emmett', name: 'Emmett' },
  { id: 'valeria', name: 'Valeria' },
  { id: 'aurelia', name: 'Aurelia' },
  { id: 'baron', name: 'Baron' },
  { id: 'kaito', name: 'Kaito' },
  { id: 'artemis', name: 'Artemis' },
  { id: 'melon', name: 'GM Melon' },
  { id: 'vivienne', name: 'Vivienne' },
  { id: 'magnus', name: 'Magnus' },
  { id: 'valkyrie', name: 'Valkyrie' },
  { id: 'solon', name: 'Solon' },
  { id: 'omni', name: 'OMNI-9000' },
  { id: 'chronos', name: 'CHRONOS' }
];

const ARCADE_BOT_CATALOG: ReadonlyArray<{ id: string; name: string }> = [
  { id: 'melon-sprout', name: 'Sprout' },
  { id: 'sunny-chips', name: 'Sunny' },
  { id: 'orbit-bot', name: 'Orbit' },
  { id: 'pixel-ninja', name: 'Pixel' },
  { id: 'crimson-fox', name: 'Crimson' },
  { id: 'neon-viper', name: 'Viper' },
  { id: 'titan-core', name: 'Titan' },
  { id: 'melon-gm', name: 'Melon GM' }
];

function sanitizeShortStr(raw: unknown, maxLen: number): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeTeamMode(raw: unknown): TeamMode {
  return raw === '2v2' ? '2v2' : '1v1';
}

export function getTeamSize(teamMode: TeamMode): number {
  return teamMode === '2v2' ? 2 : 1;
}

export function createOpenSeat(): TeamSeat {
  return {
    kind: 'open',
    uid: null,
    playerId: null,
    name: null,
    botId: null
  };
}

export function createEmptySeats(teamMode: TeamMode): TeamSeat[] {
  const size = getTeamSize(teamMode);
  return Array.from({ length: size }, () => createOpenSeat());
}

export function createHumanSeat(params: {
  uid: string | null;
  playerId: string;
  name: string;
}): TeamSeat {
  return {
    kind: 'human',
    uid: sanitizeShortStr(params.uid, 128),
    playerId: sanitizeShortStr(params.playerId, 64) || 'player',
    name: sanitizeShortStr(params.name, 24) || 'Player',
    botId: null
  };
}

export function createBotSeat(botId: string, name: string): TeamSeat {
  const cleanName = sanitizeShortStr(name, 20) || 'Bot';
  return {
    kind: 'bot',
    uid: null,
    playerId: null,
    name: cleanName.includes('Bot') ? cleanName.slice(0, 24) : `${cleanName} Bot`.slice(0, 24),
    botId: sanitizeShortStr(botId, 32) || 'orbit-bot'
  };
}

export function sanitizeSeatList(
  rawSeats: unknown,
  teamSize: number,
  legacyLead: {
    uid?: string | null;
    playerId?: string | null;
    name?: string | null;
  } | null
): TeamSeat[] {
  const out: TeamSeat[] = [];
  const src = Array.isArray(rawSeats) ? rawSeats : [];

  for (let i = 0; i < teamSize; i++) {
    const item = src[i] as Partial<TeamSeat> | undefined;
    if (item && typeof item === 'object') {
      if (item.kind === 'human') {
        const uid = sanitizeShortStr(item.uid, 128);
        const playerId = sanitizeShortStr(item.playerId, 64) || uid;
        if (uid || playerId) {
          out.push({
            kind: 'human',
            uid,
            playerId,
            name: sanitizeShortStr(item.name, 24) || 'Player',
            botId: null
          });
          continue;
        }
      } else if (item.kind === 'bot') {
        const botId = sanitizeShortStr(item.botId, 32) || 'orbit-bot';
        out.push({
          kind: 'bot',
          uid: null,
          playerId: null,
          name: sanitizeShortStr(item.name, 24) || 'Bot',
          botId
        });
        continue;
      }
    }
    out.push(createOpenSeat());
  }

  // Upgrade legacy 1v1 fields into seat[0] when rawSeats wasn't provided
  if (!Array.isArray(rawSeats) && legacyLead && (legacyLead.uid || legacyLead.playerId)) {
    out[0] = createHumanSeat({
      uid: legacyLead.uid || null,
      playerId: legacyLead.playerId || legacyLead.uid || 'player',
      name: legacyLead.name || 'Player'
    });
  }

  return out;
}

export function areAllSeatsFilled(seatsA: TeamSeat[], seatsB: TeamSeat[]): boolean {
  return (
    seatsA.length > 0 &&
    seatsB.length > 0 &&
    seatsA.every(s => s.kind !== 'open') &&
    seatsB.every(s => s.kind !== 'open')
  );
}

export function collectParticipantUids(seatsA: TeamSeat[], seatsB: TeamSeat[]): string[] {
  const seen = new Set<string>();
  for (const s of [...seatsA, ...seatsB]) {
    if (s.kind === 'human' && s.uid) {
      seen.add(s.uid);
    }
  }
  return Array.from(seen);
}

export function getFirstHumanInSeats(seats: TeamSeat[]): TeamSeat | null {
  for (const s of seats) {
    if (s.kind === 'human' && (s.uid || s.playerId)) {
      return s;
    }
  }
  return null;
}

export function findSeatForUser(
  seatsA: TeamSeat[],
  seatsB: TeamSeat[],
  uid: string | null,
  playerId: string | null
): { side: 'A' | 'B'; index: number; seat: TeamSeat } | null {
  const matchSeat = (s: TeamSeat) => {
    if (s.kind !== 'human') return false;
    if (uid && s.uid === uid) return true;
    if (playerId && s.playerId === playerId) return true;
    return false;
  };

  for (let i = 0; i < seatsA.length; i++) {
    if (matchSeat(seatsA[i])) {
      return { side: 'A', index: i, seat: seatsA[i] };
    }
  }
  for (let i = 0; i < seatsB.length; i++) {
    if (matchSeat(seatsB[i])) {
      return { side: 'B', index: i, seat: seatsB[i] };
    }
  }
  return null;
}

export function getActiveChessSeatIndex(
  moveCount: number,
  turn: 'w' | 'b',
  teamSize: number
): number {
  if (teamSize <= 1) return 0;
  const sideTurnsCompleted =
    turn === 'w'
      ? Math.floor(Math.max(0, moveCount) / 2)
      : Math.floor(Math.max(0, moveCount - 1) / 2);
  return sideTurnsCompleted % teamSize;
}

export function getActiveArcadeSeatIndex(
  teamTurnCounts: { p1: number; p2: number },
  turn: ArcadePlayer,
  teamSize: number
): number {
  if (teamSize <= 1) return 0;
  const count = turn === 'p1' ? teamTurnCounts.p1 : teamTurnCounts.p2;
  return Math.max(0, count) % teamSize;
}

function pickChessBotEntry(primaryBotId: string, offset: number): { id: string; name: string } {
  const idx = CHESS_BOT_CATALOG.findIndex(b => b.id === primaryBotId);
  const baseIdx = idx >= 0 ? idx : CHESS_BOT_CATALOG.findIndex(b => b.id === 'clara');
  const safeBase = baseIdx >= 0 ? baseIdx : 0;
  const pickIdx = (safeBase + offset) % CHESS_BOT_CATALOG.length;
  return CHESS_BOT_CATALOG[pickIdx];
}

function pickArcadeBotEntry(primaryBotId: string, offset: number): { id: string; name: string } {
  const idx = ARCADE_BOT_CATALOG.findIndex(b => b.id === primaryBotId);
  const safeBase = idx >= 0 ? idx : 2;
  const pickIdx = (safeBase + offset) % ARCADE_BOT_CATALOG.length;
  return ARCADE_BOT_CATALOG[pickIdx];
}

export function fillOpenSeatsWithChessBots(
  whiteSeats: TeamSeat[],
  blackSeats: TeamSeat[],
  primaryBotId = 'clara'
): { whiteSeats: TeamSeat[]; blackSeats: TeamSeat[] } {
  let offset = 0;
  const fillList = (list: TeamSeat[]) =>
    list.map(seat => {
      if (seat.kind !== 'open') return { ...seat };
      const bot = pickChessBotEntry(primaryBotId, offset);
      offset += 1;
      return createBotSeat(bot.id, bot.name);
    });
  return {
    whiteSeats: fillList(whiteSeats),
    blackSeats: fillList(blackSeats)
  };
}

export function fillOpenSeatsWithArcadeBots(
  team1Seats: TeamSeat[],
  team2Seats: TeamSeat[],
  primaryBotId = 'orbit-bot'
): { team1Seats: TeamSeat[]; team2Seats: TeamSeat[] } {
  let offset = 0;
  const fillList = (list: TeamSeat[]) =>
    list.map(seat => {
      if (seat.kind !== 'open') return { ...seat };
      const bot = pickArcadeBotEntry(primaryBotId, offset);
      offset += 1;
      return createBotSeat(bot.id, bot.name);
    });
  return {
    team1Seats: fillList(team1Seats),
    team2Seats: fillList(team2Seats)
  };
}

export function clearBotSeats(seats: TeamSeat[]): TeamSeat[] {
  return seats.map(seat => (seat.kind === 'bot' ? createOpenSeat() : { ...seat }));
}

export function summarizeTeamDisplayName(seats: TeamSeat[], fallback: string): string {
  const names = seats
    .filter(s => s.kind !== 'open')
    .map(s => (s.name || (s.kind === 'bot' ? 'Bot' : 'Player')).trim())
    .filter(Boolean);

  if (names.length === 0) return fallback.slice(0, 24);
  if (names.length === 1) return names[0].slice(0, 24);

  const firstShort = names[0].split(/\s+/)[0].slice(0, 10) || names[0].slice(0, 10);
  const secondShort = names[1].split(/\s+/)[0].slice(0, 10) || names[1].slice(0, 10);
  const combined = `${firstShort} & ${secondShort}`;
  if (combined.length <= 24) return combined;
  return `${firstShort.slice(0, 9)}&${secondShort.slice(0, 9)}`.slice(0, 24);
}

export function getBotRunnerUid(
  participantUids: string[],
  creatorAuthUid?: string
): string | null {
  if (!participantUids || participantUids.length === 0) return null;
  if (creatorAuthUid && participantUids.includes(creatorAuthUid)) {
    return creatorAuthUid;
  }
  const sorted = [...participantUids].sort();
  return sorted[0] || null;
}

export function replayArcadeMovesWithTeams(
  gameType: ArcadeGameType,
  moves: string[],
  cached?: {
    gameType: ArcadeGameType;
    moves: string[];
    state: ArcadeState;
    teamTurnCounts: { p1: number; p2: number };
  }
): {
  state: ArcadeState;
  teamTurnCounts: { p1: number; p2: number };
} {
  let state: ArcadeState;
  let teamTurnCounts: { p1: number; p2: number };
  let startIndex = 0;

  if (
    cached &&
    cached.gameType === gameType &&
    cached.moves.length <= moves.length
  ) {
    let prefixMatch = true;
    for (let i = 0; i < cached.moves.length; i++) {
      if (cached.moves[i] !== moves[i]) {
        prefixMatch = false;
        break;
      }
    }
    if (prefixMatch) {
      if (cached.moves.length === moves.length) {
        return {
          state: cached.state,
          teamTurnCounts: { ...cached.teamTurnCounts }
        };
      }
      state = cached.state;
      teamTurnCounts = { ...cached.teamTurnCounts };
      startIndex = cached.moves.length;
    } else {
      state = createInitialArcadeState(gameType);
      teamTurnCounts = { p1: 0, p2: 0 };
    }
  } else {
    state = createInitialArcadeState(gameType);
    teamTurnCounts = { p1: 0, p2: 0 };
  }

  for (let i = startIndex; i < moves.length; i++) {
    const prevTurn = state.turn;
    const res = applyArcadeAction(state, moves[i]);
    if (!res.valid) continue;
    state = res.nextState;
    if (res.nextState.turn !== prevTurn) {
      teamTurnCounts[prevTurn] += 1;
    }
  }

  return { state, teamTurnCounts };
}
