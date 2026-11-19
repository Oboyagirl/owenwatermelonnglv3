import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Unsubscribe,
  updateDoc
} from 'firebase/firestore';
import { signInAnonymously, signInWithPopup } from 'firebase/auth';
import {
  auth,
  db,
  ensureAuthPersistence,
  formatFriendlyFirestoreError,
  googleProvider,
  handleFirestoreError,
  OperationType,
  waitForAuthReady
} from './firebase';
import { markRememberedLogin } from './cloudSaveService';
import {
  applyArcadeAction,
  createInitialArcadeState,
  getArcadeBotById,
  isValidArcadeGameType,
  pickBotArcadeAction
} from '../utils/arcadeEngines';
import type {
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState,
  ArcadeWinner
} from '../utils/arcadeEngines';
import {
  areAllSeatsFilled,
  clearBotSeats,
  collectParticipantUids,
  createEmptySeats,
  createHumanSeat,
  fillOpenSeatsWithArcadeBots,
  findSeatForUser,
  getActiveArcadeSeatIndex,
  getBotRunnerUid,
  getFirstHumanInSeats,
  getTeamSize,
  normalizeTeamMode,
  replayArcadeMovesWithTeams,
  sanitizeSeatList,
  summarizeTeamDisplayName,
  TeamMode,
  TeamSeat,
  TeamSeatKind
} from '../utils/teamModes';

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ARCADE_ROOMS_COLLECTION = 'arcadeRooms';

export interface FirestoreArcadeRoomDoc {
  code: string;
  gameType: ArcadeGameType;
  creatorAuthUid: string;
  status: 'waiting' | 'active' | 'finished';
  teamMode?: TeamMode;
  team1Seats?: TeamSeat[];
  team2Seats?: TeamSeat[];
  participantUids?: string[];
  team1TurnCount?: number;
  team2TurnCount?: number;
  activeSeatKind?: TeamSeatKind;
  activeSeatUid?: string | null;
  p1AuthUid: string | null;
  p1PlayerId: string | null;
  p1Name: string | null;
  p2AuthUid: string | null;
  p2PlayerId: string | null;
  p2Name: string | null;
  moves: string[];
  turn: ArcadePlayer;
  winner: ArcadeWinner;
  resignedWinner: ArcadePlayer | null;
  rematchVotes: string[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ArcadeRoomViewPayload {
  code: string;
  gameType: ArcadeGameType;
  teamMode: TeamMode;
  mySeat: ArcadePlayer | 'spectator';
  mySeatIndex: number | null;
  state: ArcadeState;
  moves: string[];
  resignedWinner: ArcadePlayer | null;
  rematchVotes: string[];
  creatorAuthUid?: string;
  participantUids: string[];
  team1Seats: TeamSeat[];
  team2Seats: TeamSeat[];
  teamTurnCounts: { p1: number; p2: number };
  activeSeatIndex: number;
  activeSeat: TeamSeat | null;
  botRunnerUid: string | null;
  players: {
    p1: { uid?: string; name: string; connected: boolean } | null;
    p2: { uid?: string; name: string; connected: boolean } | null;
  };
}

export class ArcadeAuthRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArcadeAuthRequiredError';
  }
}

export function sanitizeArcadeRoomCode(raw: unknown): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

export function sanitizeArcadePlayerName(raw: unknown): string {
  const s = String(raw || '').trim().slice(0, 24);
  return s || 'Player';
}

export function generateCandidateArcadeRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return code;
}

interface CachedArcadeReplay {
  gameType: ArcadeGameType;
  moves: string[];
  state: ArcadeState;
  teamTurnCounts: { p1: number; p2: number };
}

const arcadeReplayCache = new Map<string, CachedArcadeReplay>();
const latestArcadeRoomDocCache = new Map<string, FirestoreArcadeRoomDoc>();

export function clearArcadeRoomCache(code?: string) {
  if (code) {
    const clean = sanitizeArcadeRoomCode(code);
    arcadeReplayCache.delete(clean);
    latestArcadeRoomDocCache.delete(clean);
  } else {
    arcadeReplayCache.clear();
    latestArcadeRoomDocCache.clear();
  }
}

export function replayCachedArcadeMoves(
  gameType: ArcadeGameType,
  rawMoves: unknown,
  roomCode?: string
): { state: ArcadeState; teamTurnCounts: { p1: number; p2: number } } {
  const moves: string[] = [];
  if (Array.isArray(rawMoves)) {
    for (const item of rawMoves) {
      if (typeof item === 'string') moves.push(item);
    }
  }

  if (moves.length === 0) {
    const fresh = createInitialArcadeState(gameType);
    const counts = { p1: 0, p2: 0 };
    if (roomCode) {
      arcadeReplayCache.set(roomCode, { gameType, moves: [], state: fresh, teamTurnCounts: counts });
    }
    return { state: fresh, teamTurnCounts: counts };
  }

  const cached = roomCode ? arcadeReplayCache.get(roomCode) : undefined;
  const replayed = replayArcadeMovesWithTeams(gameType, moves, cached);

  if (roomCode) {
    arcadeReplayCache.set(roomCode, {
      gameType,
      moves: moves.slice(),
      state: replayed.state,
      teamTurnCounts: replayed.teamTurnCounts
    });
  }
  return replayed;
}

function isRoomDocGameOver(docData: FirestoreArcadeRoomDoc, state: ArcadeState): boolean {
  return (
    docData.status === 'finished' ||
    Boolean(docData.resignedWinner) ||
    Boolean(docData.winner) ||
    state.winner !== null
  );
}

function resolveDocSeats(docData: FirestoreArcadeRoomDoc): {
  teamMode: TeamMode;
  team1Seats: TeamSeat[];
  team2Seats: TeamSeat[];
} {
  const teamMode = normalizeTeamMode(docData.teamMode);
  const teamSize = getTeamSize(teamMode);
  const team1Seats = sanitizeSeatList(
    docData.team1Seats,
    teamSize,
    docData.p1AuthUid || docData.p1PlayerId
      ? { uid: docData.p1AuthUid, playerId: docData.p1PlayerId, name: docData.p1Name }
      : null
  );
  const team2Seats = sanitizeSeatList(
    docData.team2Seats,
    teamSize,
    docData.p2AuthUid || docData.p2PlayerId
      ? { uid: docData.p2AuthUid, playerId: docData.p2PlayerId, name: docData.p2Name }
      : null
  );
  return { teamMode, team1Seats, team2Seats };
}

function computeArcadeMetaFields(params: {
  teamMode: TeamMode;
  team1Seats: TeamSeat[];
  team2Seats: TeamSeat[];
  turn: ArcadePlayer;
  teamTurnCounts: { p1: number; p2: number };
  gameEnded?: boolean;
}) {
  const teamSize = getTeamSize(params.teamMode);
  const activeSeatIndex = getActiveArcadeSeatIndex(params.teamTurnCounts, params.turn, teamSize);
  const activeList = params.turn === 'p1' ? params.team1Seats : params.team2Seats;
  const activeSeat = activeList[activeSeatIndex] || null;
  const participantUids = collectParticipantUids(params.team1Seats, params.team2Seats);
  const p1Lead = getFirstHumanInSeats(params.team1Seats);
  const p2Lead = getFirstHumanInSeats(params.team2Seats);
  const status: FirestoreArcadeRoomDoc['status'] = params.gameEnded
    ? 'finished'
    : areAllSeatsFilled(params.team1Seats, params.team2Seats)
    ? 'active'
    : 'waiting';

  return {
    teamMode: params.teamMode,
    team1Seats: params.team1Seats,
    team2Seats: params.team2Seats,
    participantUids,
    team1TurnCount: params.teamTurnCounts.p1,
    team2TurnCount: params.teamTurnCounts.p2,
    activeSeatKind: (activeSeat?.kind || 'open') as TeamSeatKind,
    activeSeatUid: activeSeat?.kind === 'human' ? activeSeat.uid || null : null,
    p1AuthUid: p1Lead?.uid || null,
    p1PlayerId: p1Lead?.playerId || null,
    p1Name: params.team1Seats.some(s => s.kind !== 'open')
      ? summarizeTeamDisplayName(params.team1Seats, 'Team 1')
      : null,
    p2AuthUid: p2Lead?.uid || null,
    p2PlayerId: p2Lead?.playerId || null,
    p2Name: params.team2Seats.some(s => s.kind !== 'open')
      ? summarizeTeamDisplayName(params.team2Seats, 'Team 2')
      : null,
    status
  };
}

export function arcadeDocToViewPayload(
  docData: FirestoreArcadeRoomDoc,
  currentAuthUid: string,
  playerId: string
): ArcadeRoomViewPayload {
  const safeGameType: ArcadeGameType = isValidArcadeGameType(docData.gameType)
    ? docData.gameType
    : 'connect4';
  const moves = Array.isArray(docData.moves) ? docData.moves : [];
  const { state, teamTurnCounts } = replayCachedArcadeMoves(safeGameType, moves, docData.code);
  const { teamMode, team1Seats, team2Seats } = resolveDocSeats(docData);
  const teamSize = getTeamSize(teamMode);

  const match = findSeatForUser(team1Seats, team2Seats, currentAuthUid, playerId);
  const mySeat: ArcadePlayer | 'spectator' = match
    ? match.side === 'A'
      ? 'p1'
      : 'p2'
    : 'spectator';
  const mySeatIndex = match ? match.index : null;

  const activeSeatIndex = getActiveArcadeSeatIndex(teamTurnCounts, state.turn, teamSize);
  const activeList = state.turn === 'p1' ? team1Seats : team2Seats;
  const activeSeat = activeList[activeSeatIndex] || null;
  const participantUids = collectParticipantUids(team1Seats, team2Seats);

  const p1Lead = getFirstHumanInSeats(team1Seats);
  const p2Lead = getFirstHumanInSeats(team2Seats);
  const p1HasAny = team1Seats.some(s => s.kind !== 'open');
  const p2HasAny = team2Seats.some(s => s.kind !== 'open');

  return {
    code: docData.code,
    gameType: safeGameType,
    teamMode,
    mySeat,
    mySeatIndex,
    state,
    moves,
    resignedWinner: docData.resignedWinner || null,
    rematchVotes: Array.isArray(docData.rematchVotes) ? docData.rematchVotes : [],
    creatorAuthUid: docData.creatorAuthUid || undefined,
    participantUids,
    team1Seats,
    team2Seats,
    teamTurnCounts,
    activeSeatIndex,
    activeSeat,
    botRunnerUid: getBotRunnerUid(participantUids, docData.creatorAuthUid),
    players: {
      p1: p1HasAny
        ? {
            uid: p1Lead?.uid || undefined,
            name: summarizeTeamDisplayName(team1Seats, docData.p1Name || 'Team 1'),
            connected: true
          }
        : null,
      p2: p2HasAny
        ? {
            uid: p2Lead?.uid || undefined,
            name: summarizeTeamDisplayName(team2Seats, docData.p2Name || 'Team 2'),
            connected: true
          }
        : null
    }
  };
}

function isPermissionDeniedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === 'permission-denied' ||
    (typeof e.message === 'string' &&
      e.message.toLowerCase().includes('missing or insufficient permissions'))
  );
}

export async function ensureArcadeFirebaseUid(): Promise<string> {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  await waitForAuthReady();
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  try {
    await ensureAuthPersistence();
    if (auth.currentUser?.uid) {
      return auth.currentUser.uid;
    }
    const cred = await signInAnonymously(auth);
    if (cred.user?.uid) {
      markRememberedLogin({
        uid: cred.user.uid,
        displayName: cred.user.displayName,
        email: cred.user.email,
        photoURL: cred.user.photoURL,
        isAnonymous: true
      });
      return cred.user.uid;
    }
  } catch {
    // Anonymous Auth may be disabled in Firebase Console; prompt Google sign-in
  }
  throw new ArcadeAuthRequiredError(
    'Sign in with Google once to create or join online game rooms across devices.'
  );
}

export async function signInGoogleForArcade(): Promise<string> {
  try {
    await ensureAuthPersistence();
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      return auth.currentUser.uid;
    }
    const cred = await signInWithPopup(auth, googleProvider);
    markRememberedLogin({
      uid: cred.user.uid,
      displayName: cred.user.displayName,
      email: cred.user.email,
      photoURL: cred.user.photoURL,
      isAnonymous: false
    });
    return cred.user.uid;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/unauthorized-domain') {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      throw new Error(
        `Domain "${host}" needs to be added to Firebase Console -> Authentication -> Settings -> Authorized domains.`
      );
    }
    if (code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Allow popups and try again.');
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in was cancelled. Click Sign in with Google to continue.');
    }
    throw err instanceof Error ? err : new Error('Could not complete Google sign-in.');
  }
}

export async function createFirestoreArcadeRoom(params: {
  gameType: ArcadeGameType;
  playerId: string;
  playerName: string;
  preferredSeat: 'p1' | 'p2' | 'random';
  teamMode?: TeamMode;
  fillBots?: boolean;
  primaryBotId?: string;
  presetTeam1Seats?: TeamSeat[];
  presetTeam2Seats?: TeamSeat[];
}): Promise<{ code: string; uid: string }> {
  const uid = await ensureArcadeFirebaseUid();
  const safeName = sanitizeArcadePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;
  const teamMode = normalizeTeamMode(params.teamMode);
  const teamSize = getTeamSize(teamMode);
  const resolvedSeat: ArcadePlayer =
    params.preferredSeat === 'p2'
      ? 'p2'
      : params.preferredSeat === 'random'
      ? Math.random() < 0.5
        ? 'p1'
        : 'p2'
      : 'p1';

  let team1Seats = params.presetTeam1Seats
    ? sanitizeSeatList(params.presetTeam1Seats, teamSize, null)
    : createEmptySeats(teamMode);
  let team2Seats = params.presetTeam2Seats
    ? sanitizeSeatList(params.presetTeam2Seats, teamSize, null)
    : createEmptySeats(teamMode);

  if (!findSeatForUser(team1Seats, team2Seats, uid, safePlayerId)) {
    const creatorSeat = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
    if (resolvedSeat === 'p1') {
      const idx = team1Seats.findIndex(s => s.kind === 'open');
      team1Seats[idx >= 0 ? idx : 0] = creatorSeat;
    } else {
      const idx = team2Seats.findIndex(s => s.kind === 'open');
      team2Seats[idx >= 0 ? idx : 0] = creatorSeat;
    }
  }

  if (params.fillBots) {
    const filled = fillOpenSeatsWithArcadeBots(team1Seats, team2Seats, params.primaryBotId || 'orbit-bot');
    team1Seats = filled.team1Seats;
    team2Seats = filled.team2Seats;
  }

  const meta = computeArcadeMetaFields({
    teamMode,
    team1Seats,
    team2Seats,
    turn: 'p1',
    teamTurnCounts: { p1: 0, p2: 0 }
  });

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateCandidateArcadeRoomCode();
    const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, code);
    const path = `${ARCADE_ROOMS_COLLECTION}/${code}`;

    try {
      const created = await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (snap.exists()) return false;

        const payload = {
          code,
          gameType: params.gameType,
          creatorAuthUid: uid,
          ...meta,
          moves: [],
          turn: 'p1',
          winner: null,
          resignedWinner: null,
          rematchVotes: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        tx.set(roomRef, payload);
        return true;
      });

      if (created) {
        return { code, uid };
      }
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
      throw err;
    }
  }

  throw new Error('Could not allocate a fresh room code. Please try again.');
}

export async function joinFirestoreArcadeRoom(params: {
  code: string;
  playerId: string;
  playerName: string;
  preferredTeam?: ArcadePlayer;
}): Promise<{ code: string; uid: string; payload: ArcadeRoomViewPayload }> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(params.code);
  if (cleanCode.length < 4) {
    throw new Error(`Room "${cleanCode || '?'}" not found. Check the code or create a new room.`);
  }

  const safeName = sanitizeArcadePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    const finalDoc = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error(`Room "${cleanCode}" not found. Check the code or create a new room.`);
      }

      const data = snap.data() as FirestoreArcadeRoomDoc;
      if (data.status === 'finished') {
        return data;
      }

      const safeGameType: ArcadeGameType = isValidArcadeGameType(data.gameType)
        ? data.gameType
        : 'connect4';
      const { teamTurnCounts } = replayCachedArcadeMoves(safeGameType, data.moves || [], cleanCode);
      const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);

      // Existing participant reconnect
      const existingMatch = findSeatForUser(team1Seats, team2Seats, uid, safePlayerId);
      if (existingMatch) {
        if (existingMatch.side === 'A') {
          team1Seats[existingMatch.index] = createHumanSeat({
            uid,
            playerId: safePlayerId,
            name: safeName
          });
        } else {
          team2Seats[existingMatch.index] = createHumanSeat({
            uid,
            playerId: safePlayerId,
            name: safeName
          });
        }
        const meta = computeArcadeMetaFields({
          teamMode,
          team1Seats,
          team2Seats,
          turn: data.turn,
          teamTurnCounts
        });
        tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
        return { ...data, ...meta } as FirestoreArcadeRoomDoc;
      }

      const t1Open = team1Seats.findIndex(s => s.kind === 'open');
      const t2Open = team2Seats.findIndex(s => s.kind === 'open');
      const t1Filled = team1Seats.filter(s => s.kind !== 'open').length;
      const t2Filled = team2Seats.filter(s => s.kind !== 'open').length;

      let chosenTeam: ArcadePlayer | null = null;
      let chosenIdx = -1;

      if (params.preferredTeam === 'p1' && t1Open >= 0) {
        chosenTeam = 'p1';
        chosenIdx = t1Open;
      } else if (params.preferredTeam === 'p2' && t2Open >= 0) {
        chosenTeam = 'p2';
        chosenIdx = t2Open;
      } else if (t1Open >= 0 && t2Open >= 0) {
        if (t2Filled <= t1Filled) {
          chosenTeam = 'p2';
          chosenIdx = t2Open;
        } else {
          chosenTeam = 'p1';
          chosenIdx = t1Open;
        }
      } else if (t1Open >= 0) {
        chosenTeam = 'p1';
        chosenIdx = t1Open;
      } else if (t2Open >= 0) {
        chosenTeam = 'p2';
        chosenIdx = t2Open;
      } else if ((data.moves?.length || 0) === 0) {
        // Before move 1, allow a joining human to take over a bot slot (prefer Team 2 first)
        const t2Bot = team2Seats.findIndex(s => s.kind === 'bot');
        const t1Bot = team1Seats.findIndex(s => s.kind === 'bot');
        if (params.preferredTeam === 'p1' && t1Bot >= 0) {
          chosenTeam = 'p1';
          chosenIdx = t1Bot;
        } else if (t2Bot >= 0) {
          chosenTeam = 'p2';
          chosenIdx = t2Bot;
        } else if (t1Bot >= 0) {
          chosenTeam = 'p1';
          chosenIdx = t1Bot;
        }
      }

      if (!chosenTeam || chosenIdx < 0) {
        return data;
      }

      const newSeat = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
      if (chosenTeam === 'p1') {
        team1Seats[chosenIdx] = newSeat;
      } else {
        team2Seats[chosenIdx] = newSeat;
      }

      const meta = computeArcadeMetaFields({
        teamMode,
        team1Seats,
        team2Seats,
        turn: data.turn,
        teamTurnCounts
      });
      tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
      return { ...data, ...meta } as FirestoreArcadeRoomDoc;
    });

    latestArcadeRoomDocCache.set(cleanCode, finalDoc);

    return {
      code: cleanCode,
      uid,
      payload: arcadeDocToViewPayload(finalDoc, uid, safePlayerId)
    };
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function switchFirestoreArcadeTeam(params: {
  code: string;
  playerId: string;
  playerName: string;
  targetTeam: ArcadePlayer;
}): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(params.code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;
  const safeName = sanitizeArcadePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreArcadeRoomDoc;
      if (data.status === 'finished' || (data.moves?.length || 0) > 0) return;

      const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);
      const current = findSeatForUser(team1Seats, team2Seats, uid, safePlayerId);
      const targetList = params.targetTeam === 'p1' ? team1Seats : team2Seats;
      const openIdx = targetList.findIndex(s => s.kind === 'open' || s.kind === 'bot');
      if (openIdx < 0) return;

      if (current) {
        if ((current.side === 'A' ? 'p1' : 'p2') === params.targetTeam) return;
        if (current.side === 'A') {
          team1Seats[current.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        } else {
          team2Seats[current.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        }
      }

      targetList[openIdx] = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
      const meta = computeArcadeMetaFields({
        teamMode,
        team1Seats,
        team2Seats,
        turn: data.turn,
        teamTurnCounts: { p1: 0, p2: 0 }
      });
      tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function fillFirestoreArcadeBots(
  code: string,
  primaryBotId = 'orbit-bot'
): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreArcadeRoomDoc;
      if (data.status === 'finished') return;

      const safeGameType: ArcadeGameType = isValidArcadeGameType(data.gameType)
        ? data.gameType
        : 'connect4';
      const { teamTurnCounts } = replayCachedArcadeMoves(safeGameType, data.moves || [], cleanCode);
      const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);
      const participantUids = collectParticipantUids(team1Seats, team2Seats);
      if (!participantUids.includes(uid)) return;

      const filled = fillOpenSeatsWithArcadeBots(team1Seats, team2Seats, primaryBotId);
      const meta = computeArcadeMetaFields({
        teamMode,
        team1Seats: filled.team1Seats,
        team2Seats: filled.team2Seats,
        turn: data.turn,
        teamTurnCounts
      });
      tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function clearFirestoreArcadeBots(code: string): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreArcadeRoomDoc;
      if (data.status === 'finished' || (data.moves?.length || 0) > 0) return;

      const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);
      const participantUids = collectParticipantUids(team1Seats, team2Seats);
      if (!participantUids.includes(uid)) return;

      const meta = computeArcadeMetaFields({
        teamMode,
        team1Seats: clearBotSeats(team1Seats),
        team2Seats: clearBotSeats(team2Seats),
        turn: data.turn,
        teamTurnCounts: { p1: 0, p2: 0 }
      });
      tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export function subscribeFirestoreArcadeRoom(params: {
  code: string;
  uid: string;
  playerId: string;
  onSync: (payload: ArcadeRoomViewPayload) => void;
  onError: (err: Error) => void;
}): Unsubscribe {
  const cleanCode = sanitizeArcadeRoomCode(params.code);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        clearArcadeRoomCache(cleanCode);
        params.onError(new Error(`Room "${cleanCode}" was closed or does not exist.`));
        return;
      }
      const data = snapshot.data() as FirestoreArcadeRoomDoc;
      latestArcadeRoomDocCache.set(cleanCode, data);
      params.onSync(arcadeDocToViewPayload(data, params.uid, params.playerId));
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.GET, path);
        } catch (wrapped) {
          params.onError(new Error(formatFriendlyFirestoreError(wrapped)));
        }
      } else {
        params.onError(new Error(formatFriendlyFirestoreError(err)));
      }
    }
  );
}

function computeArcadeMoveUpdatePayload(
  data: FirestoreArcadeRoomDoc,
  uid: string,
  action: string,
  expectedMoveIndex: number,
  roomCode: string,
  asBot = false
):
  | { kind: 'noop' }
  | { kind: 'update'; fields: Record<string, unknown>; nextDoc: FirestoreArcadeRoomDoc } {
  const safeGameType: ArcadeGameType = isValidArcadeGameType(data.gameType)
    ? data.gameType
    : 'connect4';
  const existingMoves = Array.isArray(data.moves) ? data.moves : [];
  if (existingMoves.length !== expectedMoveIndex) {
    return { kind: 'noop' };
  }

  const { state: currentState, teamTurnCounts } = replayCachedArcadeMoves(
    safeGameType,
    existingMoves,
    roomCode
  );
  if (isRoomDocGameOver(data, currentState)) {
    return { kind: 'noop' };
  }

  const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);
  const teamSize = getTeamSize(teamMode);
  const participantUids = collectParticipantUids(team1Seats, team2Seats);
  const activeIdx = getActiveArcadeSeatIndex(teamTurnCounts, currentState.turn, teamSize);
  const activeSeatList = currentState.turn === 'p1' ? team1Seats : team2Seats;
  const activeSeat = activeSeatList[activeIdx] || null;

  if (asBot) {
    if (!activeSeat || activeSeat.kind !== 'bot') {
      return { kind: 'noop' };
    }
    if (!participantUids.includes(uid)) {
      throw new Error('Only room participants can step bot teammates.');
    }
  } else {
    const fallbackUid = currentState.turn === 'p1' ? data.p1AuthUid : data.p2AuthUid;
    const expectedUid = activeSeat ? (activeSeat.kind === 'human' ? activeSeat.uid : null) : fallbackUid;
    if (expectedUid !== uid) {
      throw new Error('Not your turn.');
    }
  }

  const cleanAction = String(action || '').trim().slice(0, 800);
  const res = applyArcadeAction(currentState, cleanAction);
  if (!res.valid) {
    throw new Error('Illegal move rejected.');
  }

  const nextCounts = { ...teamTurnCounts };
  if (res.nextState.turn !== currentState.turn) {
    nextCounts[currentState.turn] += 1;
  }

  const nextMoves = [...existingMoves, cleanAction];
  const gameEndedNow = res.nextState.winner !== null;
  const nextActiveIdx = getActiveArcadeSeatIndex(nextCounts, res.nextState.turn, teamSize);
  const nextActiveList = res.nextState.turn === 'p1' ? team1Seats : team2Seats;
  const nextActiveSeat = nextActiveList[nextActiveIdx] || null;

  const nextStatus: FirestoreArcadeRoomDoc['status'] = gameEndedNow
    ? 'finished'
    : areAllSeatsFilled(team1Seats, team2Seats)
    ? 'active'
    : 'waiting';

  const fields: Record<string, unknown> = {
    moves: nextMoves,
    turn: res.nextState.turn,
    status: nextStatus,
    winner: res.nextState.winner,
    rematchVotes: [] as string[],
    updatedAt: serverTimestamp()
  };

  // Update team counters when room has team schema (always on new rooms; also safe if already present)
  if (data.teamMode || data.team1Seats) {
    fields.team1TurnCount = nextCounts.p1;
    fields.team2TurnCount = nextCounts.p2;
    fields.activeSeatKind = nextActiveSeat?.kind || 'open';
    fields.activeSeatUid = nextActiveSeat?.kind === 'human' ? nextActiveSeat.uid || null : null;
  }

  return {
    kind: 'update',
    fields,
    nextDoc: {
      ...data,
      moves: nextMoves,
      turn: res.nextState.turn,
      status: nextStatus,
      winner: res.nextState.winner,
      rematchVotes: [],
      ...(data.teamMode || data.team1Seats
        ? {
            team1TurnCount: nextCounts.p1,
            team2TurnCount: nextCounts.p2,
            activeSeatKind: nextActiveSeat?.kind || 'open',
            activeSeatUid: nextActiveSeat?.kind === 'human' ? nextActiveSeat.uid || null : null
          }
        : {})
    }
  };
}

export async function sendFirestoreArcadeMove(params: {
  code: string;
  action: string;
  expectedMoveIndex: number;
}): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(params.code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  const cachedDoc = latestArcadeRoomDocCache.get(cleanCode);
  if (cachedDoc && cachedDoc.moves.length === params.expectedMoveIndex) {
    const computed = computeArcadeMoveUpdatePayload(
      cachedDoc,
      uid,
      params.action,
      params.expectedMoveIndex,
      cleanCode,
      false
    );
    if (computed.kind === 'noop') return;

    try {
      await updateDoc(roomRef, computed.fields);
      latestArcadeRoomDocCache.set(cleanCode, computed.nextDoc);
      return;
    } catch {
      // Fall back to authoritative transaction
    }
  }

  try {
    let committedDoc: FirestoreArcadeRoomDoc | null = null;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error('Room session expired or missing.');
      }
      const data = snap.data() as FirestoreArcadeRoomDoc;
      const computed = computeArcadeMoveUpdatePayload(
        data,
        uid,
        params.action,
        params.expectedMoveIndex,
        cleanCode,
        false
      );
      if (computed.kind === 'noop') {
        committedDoc = data;
        return;
      }
      tx.update(roomRef, computed.fields);
      committedDoc = computed.nextDoc;
    });
    if (committedDoc) {
      latestArcadeRoomDocCache.set(cleanCode, committedDoc);
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function sendFirestoreArcadeBotMove(params: {
  code: string;
  expectedMoveIndex: number;
}): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(params.code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    let committedDoc: FirestoreArcadeRoomDoc | null = null;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreArcadeRoomDoc;
      if ((data.moves?.length || 0) !== params.expectedMoveIndex) return;

      const safeGameType: ArcadeGameType = isValidArcadeGameType(data.gameType)
        ? data.gameType
        : 'connect4';
      const { state: currentState, teamTurnCounts } = replayCachedArcadeMoves(
        safeGameType,
        data.moves || [],
        cleanCode
      );
      if (isRoomDocGameOver(data, currentState)) return;

      const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);
      const teamSize = getTeamSize(teamMode);
      const activeIdx = getActiveArcadeSeatIndex(teamTurnCounts, currentState.turn, teamSize);
      const activeSeat = (currentState.turn === 'p1' ? team1Seats : team2Seats)[activeIdx];
      if (!activeSeat || activeSeat.kind !== 'bot') return;

      const bot = getArcadeBotById(activeSeat.botId);
      const action = pickBotArcadeAction(currentState, bot);
      if (!action) return;

      const computed = computeArcadeMoveUpdatePayload(
        data,
        uid,
        action,
        params.expectedMoveIndex,
        cleanCode,
        true
      );
      if (computed.kind === 'noop') return;
      tx.update(roomRef, computed.fields);
      committedDoc = computed.nextDoc;
    });
    if (committedDoc) {
      latestArcadeRoomDocCache.set(cleanCode, committedDoc);
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
}

export async function resignFirestoreArcadeRoom(code: string): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreArcadeRoomDoc;
      const { state } = replayCachedArcadeMoves(data.gameType, data.moves, cleanCode);
      if (isRoomDocGameOver(data, state)) return;

      const { team1Seats, team2Seats } = resolveDocSeats(data);
      const match = findSeatForUser(team1Seats, team2Seats, uid, null);
      const mySeat: ArcadePlayer | null = match
        ? match.side === 'A'
          ? 'p1'
          : 'p2'
        : data.p1AuthUid === uid
        ? 'p1'
        : data.p2AuthUid === uid
        ? 'p2'
        : null;
      if (!mySeat) return;

      tx.update(roomRef, {
        status: 'finished',
        resignedWinner: mySeat === 'p1' ? 'p2' : 'p1',
        updatedAt: serverTimestamp()
      });
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function voteFirestoreArcadeRematch(code: string): Promise<void> {
  const uid = await ensureArcadeFirebaseUid();
  const cleanCode = sanitizeArcadeRoomCode(code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  const path = `${ARCADE_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreArcadeRoomDoc;
      const { state } = replayCachedArcadeMoves(data.gameType, data.moves, cleanCode);
      if (!isRoomDocGameOver(data, state)) return;
      if (data.status !== 'finished') return;

      const { teamMode, team1Seats, team2Seats } = resolveDocSeats(data);
      const match = findSeatForUser(team1Seats, team2Seats, uid, null);
      if (!match) return;

      const mySide: ArcadePlayer = match.side === 'A' ? 'p1' : 'p2';
      const voteToken = teamMode === '1v1' && !data.teamMode ? mySide : `${mySide}:${match.index}`;

      const existingVotes = Array.isArray(data.rematchVotes) ? data.rematchVotes : [];
      const nextVotes = existingVotes.includes(voteToken)
        ? existingVotes
        : [...existingVotes, voteToken];

      const participantUids = collectParticipantUids(team1Seats, team2Seats);
      const requiredVotes = Math.max(1, participantUids.length);

      if (nextVotes.length >= requiredVotes) {
        const swappedTeam1 = team2Seats;
        const swappedTeam2 = team1Seats;
        if (data.teamMode || data.team1Seats) {
          const meta = computeArcadeMetaFields({
            teamMode,
            team1Seats: swappedTeam1,
            team2Seats: swappedTeam2,
            turn: 'p1',
            teamTurnCounts: { p1: 0, p2: 0 }
          });
          tx.update(roomRef, {
            ...meta,
            moves: [],
            turn: 'p1',
            winner: null,
            resignedWinner: null,
            rematchVotes: [],
            updatedAt: serverTimestamp()
          });
        } else {
          const bothPresent = Boolean(data.p1AuthUid && data.p2AuthUid);
          tx.update(roomRef, {
            p1AuthUid: data.p2AuthUid,
            p1PlayerId: data.p2PlayerId,
            p1Name: data.p2Name,
            p2AuthUid: data.p1AuthUid,
            p2PlayerId: data.p1PlayerId,
            p2Name: data.p1Name,
            moves: [],
            turn: 'p1',
            status: bothPresent ? 'active' : 'waiting',
            winner: null,
            resignedWinner: null,
            rematchVotes: [],
            updatedAt: serverTimestamp()
          });
        }
      } else if (nextVotes.length !== existingVotes.length) {
        tx.update(roomRef, {
          rematchVotes: nextVotes,
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function leaveFirestoreArcadeRoom(code: string): Promise<void> {
  if (!auth.currentUser?.uid) return;
  const uid = auth.currentUser.uid;
  const cleanCode = sanitizeArcadeRoomCode(code);
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);

  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreArcadeRoomDoc;
    if (data.status === 'finished' || data.moves.length > 0) return;

    await runTransaction(db, async (tx) => {
      const freshSnap = await tx.get(roomRef);
      if (!freshSnap.exists()) return;
      const fresh = freshSnap.data() as FirestoreArcadeRoomDoc;
      if (fresh.status === 'finished' || fresh.moves.length > 0) return;

      if (fresh.teamMode || fresh.team1Seats) {
        const { teamMode, team1Seats, team2Seats } = resolveDocSeats(fresh);
        const match = findSeatForUser(team1Seats, team2Seats, uid, null);
        if (!match) return;
        if (match.side === 'A') {
          team1Seats[match.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        } else {
          team2Seats[match.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        }
        const meta = computeArcadeMetaFields({
          teamMode,
          team1Seats,
          team2Seats,
          turn: fresh.turn,
          teamTurnCounts: { p1: 0, p2: 0 }
        });
        tx.update(roomRef, { ...meta, status: 'waiting', updatedAt: serverTimestamp() });
      } else if (fresh.p1AuthUid === uid) {
        tx.update(roomRef, {
          p1AuthUid: null,
          p1PlayerId: null,
          p1Name: null,
          status: 'waiting',
          updatedAt: serverTimestamp()
        });
      } else if (fresh.p2AuthUid === uid) {
        tx.update(roomRef, {
          p2AuthUid: null,
          p2PlayerId: null,
          p2Name: null,
          status: 'waiting',
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch {
    // Non-fatal cleanup on room exit
  }
}

export interface ArcadeRoomTurnSummary {
  code: string;
  gameType: ArcadeGameType;
  status: 'waiting' | 'active' | 'finished';
  turn: ArcadePlayer;
  moveCount: number;
  opponentJoined: boolean;
  opponentName: string | null;
}

export function watchArcadeRoomSummary(
  code: string,
  mySide: ArcadePlayer,
  onSummary: (summary: ArcadeRoomTurnSummary) => void
): Unsubscribe {
  const cleanCode = sanitizeArcadeRoomCode(code);
  if (!cleanCode || !auth.currentUser?.uid) return () => {};
  const roomRef = doc(db, ARCADE_ROOMS_COLLECTION, cleanCode);
  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as FirestoreArcadeRoomDoc;
      const moves = Array.isArray(data.moves) ? data.moves : [];
      const oppName = mySide === 'p1' ? data.p2Name : data.p1Name;
      const oppUid = mySide === 'p1' ? data.p2AuthUid : data.p1AuthUid;
      onSummary({
        code: cleanCode,
        gameType: isValidArcadeGameType(data.gameType) ? data.gameType : 'connect4',
        status: data.status,
        turn: data.turn,
        moveCount: moves.length,
        opponentJoined: Boolean(oppUid || oppName),
        opponentName: oppName || null
      });
    },
    () => {
      // Background watcher errors are non-fatal
    }
  );
}
