import {
  ARCADE_BOTS,
  ArcadeBot,
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState,
  applyArcadeAction,
  createInitialArcadeState,
  getArcadeBotById
} from './arcadeEngines';
import { CHESS_BOTS, ChessBot, PieceColor, getBotById } from './chessEngine';

export type TeamMode = '1v1' | '2v2' | '3v3';
export type TeamSeatKind = 'open' | 'human' | 'bot';

export interface TeamSeat {
  kind: TeamSeatKind;
  uid: string | null;
  playerId: string | null;
  name: string | null;
  botId: string | null;
}

export function normalizeTeamMode(raw: unknown): TeamMode {
  if (raw === '2v2' || raw === '3v3') return raw;
  return '1v1';
}

export function getTeamSize(teamMode?: TeamMode | null): number {
  if (teamMode === '3v3') return 3;
  if (teamMode === '2v2') return 2;
  return 1;
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

export function createHumanSeat(params: {
  uid?: string | null;
  playerId?: string | null;
  name: string;
}): TeamSeat {
  return {
    kind: 'human',
    uid: params.uid ?? null,
    playerId: params.playerId ?? null,
    name: String(params.name || 'Player').trim().slice(0, 24) || 'Player',
    botId: null
  };
}

export function createBotSeat(bot: { id: string; name: string }): TeamSeat {
  return {
    kind: 'bot',
    uid: null,
    playerId: null,
    name: String(bot.name || 'Bot').trim().slice(0, 24) || 'Bot',
    botId: bot.id
  };
}

export function createEmptySeats(teamMode: TeamMode): TeamSeat[] {
  const size = getTeamSize(teamMode);
  return Array.from({ length: size }, () => createOpenSeat());
}

/**
 * Picks complementary Arcade bots for ally/enemy team slots without duplicates where possible.
 */
export function pickArcadeSquadBots(
  primaryBotId: string,
  count: number,
  excludeIds: string[] = []
): ArcadeBot[] {
  const primary = getArcadeBotById(primaryBotId);
  const used = new Set<string>(excludeIds);
  const result: ArcadeBot[] = [];

  if (!used.has(primary.id) && count > 0) {
    result.push(primary);
    used.add(primary.id);
  }

  // Prefer bots close in rating to the primary bot
  const sortedCandidates = [...ARCADE_BOTS]
    .filter(b => !used.has(b.id))
    .sort((a, b) => Math.abs(a.rating - primary.rating) - Math.abs(b.rating - primary.rating));

  for (const bot of sortedCandidates) {
    if (result.length >= count) break;
    result.push(bot);
    used.add(bot.id);
  }

  while (result.length < count) {
    result.push(ARCADE_BOTS[result.length % ARCADE_BOTS.length]);
  }

  return result;
}

/**
 * Picks complementary Chess bots for ally/enemy team slots without duplicates where possible.
 */
export function pickChessSquadBots(
  primaryBotId: string,
  count: number,
  excludeIds: string[] = []
): ChessBot[] {
  const primary = getBotById(primaryBotId);
  const used = new Set<string>(excludeIds);
  const result: ChessBot[] = [];

  if (!used.has(primary.id) && count > 0) {
    result.push(primary);
    used.add(primary.id);
  }

  const sortedCandidates = [...CHESS_BOTS]
    .filter(b => !used.has(b.id))
    .sort((a, b) => Math.abs(a.rating - primary.rating) - Math.abs(b.rating - primary.rating));

  for (const bot of sortedCandidates) {
    if (result.length >= count) break;
    result.push(bot);
    used.add(bot.id);
  }

  while (result.length < count) {
    result.push(CHESS_BOTS[result.length % CHESS_BOTS.length]);
  }

  return result;
}

export function fillOpenSeatsWithArcadeBots(
  team1Seats: TeamSeat[],
  team2Seats: TeamSeat[],
  primaryBotId = 'orbit-bot'
): { team1Seats: TeamSeat[]; team2Seats: TeamSeat[] } {
  const usedBotIds = new Set<string>();
  for (const s of [...team1Seats, ...team2Seats]) {
    if (s.kind === 'bot' && s.botId) usedBotIds.add(s.botId);
  }

  const openTotal =
    team1Seats.filter(s => s.kind === 'open').length +
    team2Seats.filter(s => s.kind === 'open').length;
  const pool = pickArcadeSquadBots(primaryBotId, Math.max(openTotal, 1), Array.from(usedBotIds));
  let poolIdx = 0;

  const fillList = (seats: TeamSeat[]) =>
    seats.map(seat => {
      if (seat.kind !== 'open') return { ...seat };
      const bot = pool[poolIdx % pool.length] || getArcadeBotById(primaryBotId);
      poolIdx += 1;
      return createBotSeat(bot);
    });

  return {
    team1Seats: fillList(team1Seats),
    team2Seats: fillList(team2Seats)
  };
}

export function fillOpenSeatsWithChessBots(
  whiteSeats: TeamSeat[],
  blackSeats: TeamSeat[],
  primaryBotId = 'pixel'
): { whiteSeats: TeamSeat[]; blackSeats: TeamSeat[] } {
  const usedBotIds = new Set<string>();
  for (const s of [...whiteSeats, ...blackSeats]) {
    if (s.kind === 'bot' && s.botId) usedBotIds.add(s.botId);
  }

  const openTotal =
    whiteSeats.filter(s => s.kind === 'open').length +
    blackSeats.filter(s => s.kind === 'open').length;
  const pool = pickChessSquadBots(primaryBotId, Math.max(openTotal, 1), Array.from(usedBotIds));
  let poolIdx = 0;

  const fillList = (seats: TeamSeat[]) =>
    seats.map(seat => {
      if (seat.kind !== 'open') return { ...seat };
      const bot = pool[poolIdx % pool.length] || getBotById(primaryBotId);
      poolIdx += 1;
      return createBotSeat(bot);
    });

  return {
    whiteSeats: fillList(whiteSeats),
    blackSeats: fillList(blackSeats)
  };
}

export function clearBotSeats(seats: TeamSeat[]): TeamSeat[] {
  return seats.map(seat => (seat.kind === 'bot' ? createOpenSeat() : { ...seat }));
}

export function sanitizeSeatList(
  raw: unknown,
  teamSize: number,
  legacyHuman?: { uid?: string | null; playerId?: string | null; name?: string | null } | null
): TeamSeat[] {
  const out: TeamSeat[] = [];
  if (Array.isArray(raw)) {
    for (let i = 0; i < teamSize; i++) {
      const item = raw[i] as Partial<TeamSeat> | undefined;
      if (item && (item.kind === 'human' || item.kind === 'bot' || item.kind === 'open')) {
        out.push({
          kind: item.kind,
          uid: typeof item.uid === 'string' && item.uid ? item.uid.slice(0, 128) : null,
          playerId: typeof item.playerId === 'string' && item.playerId ? item.playerId.slice(0, 64) : null,
          name: typeof item.name === 'string' && item.name ? item.name.slice(0, 24) : null,
          botId: typeof item.botId === 'string' && item.botId ? item.botId.slice(0, 32) : null
        });
      } else {
        out.push(createOpenSeat());
      }
    }
  } else {
    for (let i = 0; i < teamSize; i++) {
      out.push(createOpenSeat());
    }
    if (legacyHuman && (legacyHuman.uid || legacyHuman.playerId)) {
      out[0] = createHumanSeat({
        uid: legacyHuman.uid || null,
        playerId: legacyHuman.playerId || null,
        name: legacyHuman.name || 'Player'
      });
    }
  }
  return out;
}

export function collectParticipantUids(seatsA: TeamSeat[], seatsB: TeamSeat[]): string[] {
  const seen = new Set<string>();
  for (const s of [...seatsA, ...seatsB]) {
    if (s.kind === 'human' && s.uid) {
      seen.add(s.uid);
    }
  }
  return Array.from(seen).slice(0, 6);
}

export function areAllSeatsFilled(seatsA: TeamSeat[], seatsB: TeamSeat[]): boolean {
  return [...seatsA, ...seatsB].every(s => s.kind !== 'open');
}

export function findSeatForUser(
  seatsA: TeamSeat[],
  seatsB: TeamSeat[],
  uid?: string | null,
  playerId?: string | null
): { side: 'A' | 'B'; index: number; seat: TeamSeat } | null {
  for (let i = 0; i < seatsA.length; i++) {
    const s = seatsA[i];
    if (s.kind === 'human' && ((uid && s.uid === uid) || (playerId && s.playerId === playerId))) {
      return { side: 'A', index: i, seat: s };
    }
  }
  for (let i = 0; i < seatsB.length; i++) {
    const s = seatsB[i];
    if (s.kind === 'human' && ((uid && s.uid === uid) || (playerId && s.playerId === playerId))) {
      return { side: 'B', index: i, seat: s };
    }
  }
  return null;
}

export function getFirstHumanInSeats(seats: TeamSeat[]): TeamSeat | null {
  return seats.find(s => s.kind === 'human' && (s.uid || s.playerId)) || null;
}

export function summarizeTeamDisplayName(seats: TeamSeat[], fallbackLabel: string): string {
  const filled = seats.filter(s => s.kind !== 'open');
  if (filled.length === 0) return fallbackLabel;
  if (filled.length === 1) {
    const s = filled[0];
    return s.kind === 'bot' ? `${s.name || 'Bot'}` : s.name || fallbackLabel;
  }
  const names = filled.map(s => (s.name || (s.kind === 'bot' ? 'Bot' : 'Player')).split(' ')[0]);
  return names.join(' & ').slice(0, 24) || fallbackLabel;
}

// ---------------- DETERMINISTIC TEAM TURN TRACKING ----------------

export interface ArcadeReplayWithTeamsResult {
  state: ArcadeState;
  teamTurnCounts: { p1: number; p2: number };
}

export function replayArcadeMovesWithTeams(
  gameType: ArcadeGameType,
  rawMoves: string[],
  cachedBase?: {
    gameType: ArcadeGameType;
    moves: string[];
    state: ArcadeState;
    teamTurnCounts: { p1: number; p2: number };
  }
): ArcadeReplayWithTeamsResult {
  let state: ArcadeState;
  let teamTurnCounts: { p1: number; p2: number };
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
      teamTurnCounts = { ...cachedBase.teamTurnCounts };
      startIndex = cachedBase.moves.length;
    } else {
      state = createInitialArcadeState(gameType);
      teamTurnCounts = { p1: 0, p2: 0 };
    }
  } else {
    state = createInitialArcadeState(gameType);
    teamTurnCounts = { p1: 0, p2: 0 };
  }

  for (let i = startIndex; i < rawMoves.length; i++) {
    const prevTurn = state.turn;
    const res = applyArcadeAction(state, rawMoves[i]);
    if (res.valid) {
      state = res.nextState;
      if (res.nextState.turn !== prevTurn) {
        teamTurnCounts[prevTurn] += 1;
      }
    }
  }

  return { state, teamTurnCounts };
}

export function getActiveArcadeSeatIndex(
  teamTurnCounts: { p1: number; p2: number },
  turn: ArcadePlayer,
  teamSize: number
): number {
  if (teamSize <= 1) return 0;
  return teamTurnCounts[turn] % teamSize;
}

export function getChessTeamSeatIndices(
  moveCount: number,
  teamSize: number
): { w: number; b: number } {
  if (teamSize <= 1) return { w: 0, b: 0 };
  return {
    w: Math.ceil(moveCount / 2) % teamSize,
    b: Math.floor(moveCount / 2) % teamSize
  };
}

export function getActiveChessSeatIndex(
  moveCount: number,
  turn: PieceColor,
  teamSize: number
): number {
  const indices = getChessTeamSeatIndices(moveCount, teamSize);
  return indices[turn];
}

export function getBotRunnerUid(participantUids: string[], creatorAuthUid?: string | null): string | null {
  if (creatorAuthUid && participantUids.includes(creatorAuthUid)) {
    return creatorAuthUid;
  }
  const sorted = [...participantUids].sort();
  return sorted[0] || null;
}
