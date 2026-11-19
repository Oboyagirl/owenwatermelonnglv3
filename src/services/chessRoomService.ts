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
  applyMove,
  chooseBotMove,
  createInitialState,
  getBotById,
  getLegalMoves,
  getTimeControlById,
  hasOnlyInsufficientMaterialForSide
} from '../utils/chessEngine';
import type {
  ChessMove,
  ChessState,
  MoveRecord,
  PieceColor,
  PromotionPieceType
} from '../utils/chessEngine';
import {
  areAllSeatsFilled,
  clearBotSeats,
  collectParticipantUids,
  createEmptySeats,
  createHumanSeat,
  fillOpenSeatsWithChessBots,
  findSeatForUser,
  getActiveChessSeatIndex,
  getBotRunnerUid,
  getFirstHumanInSeats,
  getTeamSize,
  normalizeTeamMode,
  sanitizeSeatList,
  summarizeTeamDisplayName,
  TeamMode,
  TeamSeat,
  TeamSeatKind
} from '../utils/teamModes';

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CHESS_ROOMS_COLLECTION = 'chessRooms';

export interface FirestoreChessRoomDoc {
  code: string;
  creatorAuthUid: string;
  status: 'waiting' | 'active' | 'finished';
  teamMode?: TeamMode;
  whiteSeats?: TeamSeat[];
  blackSeats?: TeamSeat[];
  participantUids?: string[];
  activeSeatKind?: TeamSeatKind;
  activeSeatUid?: string | null;
  timeControlId: string;
  baseMs: number;
  incMs: number;
  whiteAuthUid: string | null;
  whitePlayerId: string | null;
  whiteName: string | null;
  whiteElo: number;
  blackAuthUid: string | null;
  blackPlayerId: string | null;
  blackName: string | null;
  blackElo: number;
  moves: string[];
  turn: PieceColor;
  whiteTimeMs: number;
  blackTimeMs: number;
  clockAnchorMs: number | null;
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  rematchVotes: string[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ChessRoomViewPayload {
  code: string;
  teamMode: TeamMode;
  myColor: PieceColor | 'spectator';
  mySeatIndex: number | null;
  state: ChessState;
  history: MoveRecord[];
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  rematchVotes: string[];
  participantUids: string[];
  whiteSeats: TeamSeat[];
  blackSeats: TeamSeat[];
  activeSeatIndex: number;
  activeSeat: TeamSeat | null;
  botRunnerUid: string | null;
  clock: {
    timeControlId: string;
    baseMs: number;
    incMs: number;
    whiteTimeMs: number;
    blackTimeMs: number;
    activeColor: PieceColor | null;
    serverNow: number;
    timeoutWinner: PieceColor | 'draw' | null;
  };
  creatorAuthUid?: string;
  players: {
    w: { uid?: string; name: string; elo: number; connected: boolean } | null;
    b: { uid?: string; name: string; elo: number; connected: boolean } | null;
  };
}

export class ChessAuthRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChessAuthRequiredError';
  }
}

export function sanitizeRoomCode(raw: unknown): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

export function sanitizePlayerName(raw: unknown): string {
  const s = String(raw || '').trim().slice(0, 24);
  return s || 'Player';
}

export function generateCandidateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)];
  }
  return code;
}

export function encodeChessMove(move: ChessMove): string {
  const base = `${move.from.r},${move.from.c}->${move.to.r},${move.to.c}`;
  return move.promotion ? `${base}=${move.promotion}` : base;
}

export function parseEncodedChessMove(
  encoded: string
): { from: { r: number; c: number }; to: { r: number; c: number }; promotion?: PromotionPieceType } | null {
  const match = /^([0-7]),([0-7])->([0-7]),([0-7])(?:=([qrbn]))?$/.exec(String(encoded || '').trim());
  if (!match) return null;
  return {
    from: { r: Number(match[1]), c: Number(match[2]) },
    to: { r: Number(match[3]), c: Number(match[4]) },
    promotion: match[5] as PromotionPieceType | undefined
  };
}

interface CachedRoomReplay {
  moves: string[];
  state: ChessState;
  history: MoveRecord[];
}

const roomReplayCache = new Map<string, CachedRoomReplay>();
const latestRoomDocCache = new Map<string, FirestoreChessRoomDoc>();

export function clearChessRoomCache(code?: string) {
  if (code) {
    const clean = sanitizeRoomCode(code);
    roomReplayCache.delete(clean);
    latestRoomDocCache.delete(clean);
  } else {
    roomReplayCache.clear();
    latestRoomDocCache.clear();
  }
}

export function decodeAndReplayMoves(
  rawMoves: unknown,
  roomCode?: string
): {
  state: ChessState;
  history: MoveRecord[];
} {
  if (!Array.isArray(rawMoves) || rawMoves.length === 0) {
    const fresh = { state: createInitialState(), history: [] as MoveRecord[] };
    if (roomCode) {
      roomReplayCache.set(roomCode, { moves: [], state: fresh.state, history: [] });
    }
    return fresh;
  }

  const moves: string[] = [];
  for (const item of rawMoves) {
    if (typeof item !== 'string') break;
    moves.push(item);
  }

  const cached = roomCode ? roomReplayCache.get(roomCode) : undefined;
  let state: ChessState;
  let history: MoveRecord[];
  let startIndex = 0;

  if (cached && cached.moves.length <= moves.length) {
    let prefixMatch = true;
    for (let i = 0; i < cached.moves.length; i++) {
      if (cached.moves[i] !== moves[i]) {
        prefixMatch = false;
        break;
      }
    }
    if (prefixMatch) {
      if (cached.moves.length === moves.length) {
        return { state: cached.state, history: cached.history };
      }
      state = cached.state;
      history = cached.history.slice();
      startIndex = cached.moves.length;
    } else {
      state = createInitialState();
      history = [];
    }
  } else {
    state = createInitialState();
    history = [];
  }

  for (let i = startIndex; i < moves.length; i++) {
    const parsed = parseEncodedChessMove(moves[i]);
    if (!parsed) break;
    const legal = getLegalMoves(state, parsed.from).find(
      m =>
        m.to.r === parsed.to.r &&
        m.to.c === parsed.to.c &&
        (m.promotion ? m.promotion === (parsed.promotion || 'q') : !parsed.promotion)
    );
    if (!legal) break;
    const res = applyMove(state, legal);
    state = res.nextState;
    history.push(res.record);
  }

  if (roomCode) {
    roomReplayCache.set(roomCode, {
      moves: moves.slice(0, history.length),
      state,
      history
    });
  }

  return { state, history };
}

function isRoomDocGameOver(docData: FirestoreChessRoomDoc, state: ChessState): boolean {
  return (
    docData.status === 'finished' ||
    Boolean(docData.resignedWinner) ||
    Boolean(docData.timeoutWinner) ||
    state.status === 'checkmate' ||
    state.status === 'stalemate' ||
    state.status.startsWith('draw_')
  );
}

function resolveChessDocSeats(docData: FirestoreChessRoomDoc): {
  teamMode: TeamMode;
  whiteSeats: TeamSeat[];
  blackSeats: TeamSeat[];
} {
  const teamMode = normalizeTeamMode(docData.teamMode);
  const teamSize = getTeamSize(teamMode);
  const whiteSeats = sanitizeSeatList(
    docData.whiteSeats,
    teamSize,
    docData.whiteAuthUid || docData.whitePlayerId
      ? { uid: docData.whiteAuthUid, playerId: docData.whitePlayerId, name: docData.whiteName }
      : null
  );
  const blackSeats = sanitizeSeatList(
    docData.blackSeats,
    teamSize,
    docData.blackAuthUid || docData.blackPlayerId
      ? { uid: docData.blackAuthUid, playerId: docData.blackPlayerId, name: docData.blackName }
      : null
  );
  return { teamMode, whiteSeats, blackSeats };
}

function computeChessMetaFields(params: {
  teamMode: TeamMode;
  whiteSeats: TeamSeat[];
  blackSeats: TeamSeat[];
  turn: PieceColor;
  moveCount: number;
  gameEnded?: boolean;
}) {
  const teamSize = getTeamSize(params.teamMode);
  const activeSeatIndex = getActiveChessSeatIndex(params.moveCount, params.turn, teamSize);
  const activeList = params.turn === 'w' ? params.whiteSeats : params.blackSeats;
  const activeSeat = activeList[activeSeatIndex] || null;
  const participantUids = collectParticipantUids(params.whiteSeats, params.blackSeats);
  const wLead = getFirstHumanInSeats(params.whiteSeats);
  const bLead = getFirstHumanInSeats(params.blackSeats);
  const status: FirestoreChessRoomDoc['status'] = params.gameEnded
    ? 'finished'
    : areAllSeatsFilled(params.whiteSeats, params.blackSeats)
    ? 'active'
    : 'waiting';

  return {
    teamMode: params.teamMode,
    whiteSeats: params.whiteSeats,
    blackSeats: params.blackSeats,
    participantUids,
    activeSeatKind: (activeSeat?.kind || 'open') as TeamSeatKind,
    activeSeatUid: activeSeat?.kind === 'human' ? activeSeat.uid || null : null,
    whiteAuthUid: wLead?.uid || null,
    whitePlayerId: wLead?.playerId || null,
    whiteName: params.whiteSeats.some(s => s.kind !== 'open')
      ? summarizeTeamDisplayName(params.whiteSeats, 'White')
      : null,
    blackAuthUid: bLead?.uid || null,
    blackPlayerId: bLead?.playerId || null,
    blackName: params.blackSeats.some(s => s.kind !== 'open')
      ? summarizeTeamDisplayName(params.blackSeats, 'Black')
      : null,
    status
  };
}

export function roomDocToViewPayload(
  docData: FirestoreChessRoomDoc,
  currentAuthUid: string,
  playerId: string
): ChessRoomViewPayload {
  const { state, history } = decodeAndReplayMoves(docData.moves, docData.code);
  const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(docData);
  const teamSize = getTeamSize(teamMode);

  const match = findSeatForUser(whiteSeats, blackSeats, currentAuthUid, playerId);
  const myColor: PieceColor | 'spectator' = match
    ? match.side === 'A'
      ? 'w'
      : 'b'
    : 'spectator';
  const mySeatIndex = match ? match.index : null;

  const activeSeatIndex = getActiveChessSeatIndex(history.length, state.turn, teamSize);
  const activeList = state.turn === 'w' ? whiteSeats : blackSeats;
  const activeSeat = activeList[activeSeatIndex] || null;
  const participantUids = collectParticipantUids(whiteSeats, blackSeats);

  const wLead = getFirstHumanInSeats(whiteSeats);
  const bLead = getFirstHumanInSeats(blackSeats);
  const wHasAny = whiteSeats.some(s => s.kind !== 'open');
  const bHasAny = blackSeats.some(s => s.kind !== 'open');

  const now = Date.now();
  let whiteTimeMs = docData.whiteTimeMs;
  let blackTimeMs = docData.blackTimeMs;
  const ended = isRoomDocGameOver(docData, state);
  const isRunning =
    docData.baseMs > 0 &&
    !ended &&
    history.length >= 1 &&
    docData.clockAnchorMs !== null;

  if (isRunning && docData.clockAnchorMs !== null) {
    const elapsed = Math.max(0, now - docData.clockAnchorMs);
    if (state.turn === 'w') {
      whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
    } else {
      blackTimeMs = Math.max(0, blackTimeMs - elapsed);
    }
  }

  return {
    code: docData.code,
    teamMode,
    myColor,
    mySeatIndex,
    state,
    history,
    resignedWinner: docData.resignedWinner || null,
    timeoutWinner: docData.timeoutWinner || null,
    rematchVotes: Array.isArray(docData.rematchVotes) ? docData.rematchVotes : [],
    participantUids,
    whiteSeats,
    blackSeats,
    activeSeatIndex,
    activeSeat,
    botRunnerUid: getBotRunnerUid(participantUids, docData.creatorAuthUid),
    clock: {
      timeControlId: docData.timeControlId || 'none',
      baseMs: docData.baseMs || 0,
      incMs: docData.incMs || 0,
      whiteTimeMs,
      blackTimeMs,
      activeColor: isRunning ? state.turn : null,
      serverNow: now,
      timeoutWinner: docData.timeoutWinner || null
    },
    creatorAuthUid: docData.creatorAuthUid || undefined,
    players: {
      w: wHasAny
        ? {
            uid: wLead?.uid || undefined,
            name: summarizeTeamDisplayName(whiteSeats, docData.whiteName || 'White'),
            elo: docData.whiteElo || 1200,
            connected: true
          }
        : null,
      b: bHasAny
        ? {
            uid: bLead?.uid || undefined,
            name: summarizeTeamDisplayName(blackSeats, docData.blackName || 'Black'),
            elo: docData.blackElo || 1200,
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

export async function ensureChessFirebaseUid(): Promise<string> {
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
    // Anonymous Auth may be disabled in Firebase Console; fall through to prompt Google Sign-In
  }
  throw new ChessAuthRequiredError(
    'Sign in with Google once to create or join online chess rooms across devices.'
  );
}

export async function signInGoogleForChess(): Promise<string> {
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
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in was cancelled. Click Sign in with Google to continue.');
    }
    throw err instanceof Error ? err : new Error('Could not complete Google sign-in.');
  }
}

export async function createFirestoreChessRoom(params: {
  playerId: string;
  playerName: string;
  preferredColor: 'w' | 'b' | 'random';
  timeControlId: string;
  teamMode?: TeamMode;
  fillBots?: boolean;
  primaryBotId?: string;
  presetWhiteSeats?: TeamSeat[];
  presetBlackSeats?: TeamSeat[];
}): Promise<{ code: string; uid: string }> {
  const uid = await ensureChessFirebaseUid();
  const safeName = sanitizePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;
  const tc = getTimeControlById(params.timeControlId || 'none');
  const teamMode = normalizeTeamMode(params.teamMode);
  const teamSize = getTeamSize(teamMode);
  const resolvedColor: PieceColor =
    params.preferredColor === 'b'
      ? 'b'
      : params.preferredColor === 'random'
      ? Math.random() < 0.5
        ? 'w'
        : 'b'
      : 'w';

  let whiteSeats = params.presetWhiteSeats
    ? sanitizeSeatList(params.presetWhiteSeats, teamSize, null)
    : createEmptySeats(teamMode);
  let blackSeats = params.presetBlackSeats
    ? sanitizeSeatList(params.presetBlackSeats, teamSize, null)
    : createEmptySeats(teamMode);

  if (!findSeatForUser(whiteSeats, blackSeats, uid, safePlayerId)) {
    const creatorSeat = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
    if (resolvedColor === 'w') {
      const idx = whiteSeats.findIndex(s => s.kind === 'open');
      whiteSeats[idx >= 0 ? idx : 0] = creatorSeat;
    } else {
      const idx = blackSeats.findIndex(s => s.kind === 'open');
      blackSeats[idx >= 0 ? idx : 0] = creatorSeat;
    }
  }

  if (params.fillBots) {
    const filled = fillOpenSeatsWithChessBots(whiteSeats, blackSeats, params.primaryBotId || 'clara');
    whiteSeats = filled.whiteSeats;
    blackSeats = filled.blackSeats;
  }

  const meta = computeChessMetaFields({
    teamMode,
    whiteSeats,
    blackSeats,
    turn: 'w',
    moveCount: 0
  });

  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateCandidateRoomCode();
    const roomRef = doc(db, CHESS_ROOMS_COLLECTION, code);
    const path = `${CHESS_ROOMS_COLLECTION}/${code}`;

    try {
      const created = await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (snap.exists()) return false;

        const baseMs = Math.max(0, Math.min(3600000, Math.round(tc.baseMs)));
        const incMs = Math.max(0, Math.min(120000, Math.round(tc.incMs)));

        const payload = {
          code,
          creatorAuthUid: uid,
          ...meta,
          timeControlId: tc.id.slice(0, 16),
          baseMs,
          incMs,
          whiteElo: 1200,
          blackElo: 1200,
          moves: [],
          turn: 'w',
          whiteTimeMs: baseMs,
          blackTimeMs: baseMs,
          clockAnchorMs: null,
          resignedWinner: null,
          timeoutWinner: null,
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

export async function joinFirestoreChessRoom(params: {
  code: string;
  playerId: string;
  playerName: string;
  preferredTeam?: PieceColor;
}): Promise<{ code: string; uid: string; payload: ChessRoomViewPayload }> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(params.code);
  if (cleanCode.length < 4) {
    throw new Error(`Room "${cleanCode || '?'}" not found. Check the code or create a new room.`);
  }

  const safeName = sanitizePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    const finalDoc = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error(`Room "${cleanCode}" not found. Check the code or create a new room.`);
      }

      const data = snap.data() as FirestoreChessRoomDoc;
      if (data.status === 'finished') {
        return data;
      }

      const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const moveCount = Array.isArray(data.moves) ? data.moves.length : 0;

      const existingMatch = findSeatForUser(whiteSeats, blackSeats, uid, safePlayerId);
      if (existingMatch) {
        if (existingMatch.side === 'A') {
          whiteSeats[existingMatch.index] = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
        } else {
          blackSeats[existingMatch.index] = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
        }
        const meta = computeChessMetaFields({
          teamMode,
          whiteSeats,
          blackSeats,
          turn: data.turn,
          moveCount
        });
        tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
        return { ...data, ...meta } as FirestoreChessRoomDoc;
      }

      const wOpen = whiteSeats.findIndex(s => s.kind === 'open');
      const bOpen = blackSeats.findIndex(s => s.kind === 'open');
      const wFilled = whiteSeats.filter(s => s.kind !== 'open').length;
      const bFilled = blackSeats.filter(s => s.kind !== 'open').length;

      let chosenColor: PieceColor | null = null;
      let chosenIdx = -1;

      if (params.preferredTeam === 'w' && wOpen >= 0) {
        chosenColor = 'w';
        chosenIdx = wOpen;
      } else if (params.preferredTeam === 'b' && bOpen >= 0) {
        chosenColor = 'b';
        chosenIdx = bOpen;
      } else if (wOpen >= 0 && bOpen >= 0) {
        if (bFilled <= wFilled) {
          chosenColor = 'b';
          chosenIdx = bOpen;
        } else {
          chosenColor = 'w';
          chosenIdx = wOpen;
        }
      } else if (wOpen >= 0) {
        chosenColor = 'w';
        chosenIdx = wOpen;
      } else if (bOpen >= 0) {
        chosenColor = 'b';
        chosenIdx = bOpen;
      } else if (moveCount === 0) {
        const bBot = blackSeats.findIndex(s => s.kind === 'bot');
        const wBot = whiteSeats.findIndex(s => s.kind === 'bot');
        if (params.preferredTeam === 'w' && wBot >= 0) {
          chosenColor = 'w';
          chosenIdx = wBot;
        } else if (bBot >= 0) {
          chosenColor = 'b';
          chosenIdx = bBot;
        } else if (wBot >= 0) {
          chosenColor = 'w';
          chosenIdx = wBot;
        }
      }

      if (!chosenColor || chosenIdx < 0) {
        return data;
      }

      const newSeat = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
      if (chosenColor === 'w') whiteSeats[chosenIdx] = newSeat;
      else blackSeats[chosenIdx] = newSeat;

      const meta = computeChessMetaFields({
        teamMode,
        whiteSeats,
        blackSeats,
        turn: data.turn,
        moveCount
      });
      tx.update(roomRef, { ...meta, updatedAt: serverTimestamp() });
      return { ...data, ...meta } as FirestoreChessRoomDoc;
    });

    latestRoomDocCache.set(cleanCode, finalDoc);

    return {
      code: cleanCode,
      uid,
      payload: roomDocToViewPayload(finalDoc, uid, safePlayerId)
    };
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function switchFirestoreChessTeam(params: {
  code: string;
  playerId: string;
  playerName: string;
  targetColor: PieceColor;
}): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(params.code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;
  const safeName = sanitizePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      if (data.status === 'finished' || (data.moves?.length || 0) > 0) return;

      const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const current = findSeatForUser(whiteSeats, blackSeats, uid, safePlayerId);
      const targetList = params.targetColor === 'w' ? whiteSeats : blackSeats;
      const openIdx = targetList.findIndex(s => s.kind === 'open' || s.kind === 'bot');
      if (openIdx < 0) return;

      if (current) {
        if ((current.side === 'A' ? 'w' : 'b') === params.targetColor) return;
        if (current.side === 'A') {
          whiteSeats[current.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        } else {
          blackSeats[current.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        }
      }

      targetList[openIdx] = createHumanSeat({ uid, playerId: safePlayerId, name: safeName });
      const meta = computeChessMetaFields({
        teamMode,
        whiteSeats,
        blackSeats,
        turn: data.turn,
        moveCount: 0
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

export async function fillFirestoreChessBots(
  code: string,
  primaryBotId = 'clara'
): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      if (data.status === 'finished') return;

      const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const participantUids = collectParticipantUids(whiteSeats, blackSeats);
      if (!participantUids.includes(uid)) return;

      const filled = fillOpenSeatsWithChessBots(whiteSeats, blackSeats, primaryBotId);
      const meta = computeChessMetaFields({
        teamMode,
        whiteSeats: filled.whiteSeats,
        blackSeats: filled.blackSeats,
        turn: data.turn,
        moveCount: Array.isArray(data.moves) ? data.moves.length : 0
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

export async function clearFirestoreChessBots(code: string): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      if (data.status === 'finished' || (data.moves?.length || 0) > 0) return;

      const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const participantUids = collectParticipantUids(whiteSeats, blackSeats);
      if (!participantUids.includes(uid)) return;

      const meta = computeChessMetaFields({
        teamMode,
        whiteSeats: clearBotSeats(whiteSeats),
        blackSeats: clearBotSeats(blackSeats),
        turn: data.turn,
        moveCount: 0
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

export function subscribeFirestoreChessRoom(params: {
  code: string;
  uid: string;
  playerId: string;
  onSync: (payload: ChessRoomViewPayload) => void;
  onError: (err: Error) => void;
}): Unsubscribe {
  const cleanCode = sanitizeRoomCode(params.code);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        clearChessRoomCache(cleanCode);
        params.onError(new Error(`Room "${cleanCode}" was closed or does not exist.`));
        return;
      }
      const data = snapshot.data() as FirestoreChessRoomDoc;
      latestRoomDocCache.set(cleanCode, data);
      params.onSync(roomDocToViewPayload(data, params.uid, params.playerId));
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

function computeMoveUpdatePayload(
  data: FirestoreChessRoomDoc,
  uid: string,
  move: ChessMove,
  expectedMoveIndex: number,
  roomCode: string,
  asBot = false
):
  | { kind: 'noop' }
  | { kind: 'update'; fields: Record<string, unknown>; nextDoc: FirestoreChessRoomDoc } {
  const replayed = decodeAndReplayMoves(data.moves, roomCode);

  if (replayed.history.length !== expectedMoveIndex) {
    return { kind: 'noop' };
  }
  if (isRoomDocGameOver(data, replayed.state)) {
    return { kind: 'noop' };
  }

  const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
  const teamSize = getTeamSize(teamMode);
  const participantUids = collectParticipantUids(whiteSeats, blackSeats);
  const activeIdx = getActiveChessSeatIndex(replayed.history.length, replayed.state.turn, teamSize);
  const activeSeat = (replayed.state.turn === 'w' ? whiteSeats : blackSeats)[activeIdx] || null;

  if (asBot) {
    if (!activeSeat || activeSeat.kind !== 'bot') {
      return { kind: 'noop' };
    }
    if (!participantUids.includes(uid)) {
      throw new Error('Only room participants can step bot teammates.');
    }
  } else {
    const fallbackUid = replayed.state.turn === 'w' ? data.whiteAuthUid : data.blackAuthUid;
    const expectedUid = activeSeat ? (activeSeat.kind === 'human' ? activeSeat.uid : null) : fallbackUid;
    if (expectedUid !== uid) {
      throw new Error('Not your turn.');
    }
  }

  const now = Math.round(Date.now());
  let whiteTimeMs = Math.max(0, Math.round(data.whiteTimeMs));
  let blackTimeMs = Math.max(0, Math.round(data.blackTimeMs));
  const wasClockRunning =
    data.baseMs > 0 && replayed.history.length >= 1 && data.clockAnchorMs !== null;

  if (wasClockRunning && data.clockAnchorMs !== null) {
    const elapsed = Math.max(0, now - data.clockAnchorMs);
    if (replayed.state.turn === 'w') {
      whiteTimeMs = Math.max(0, whiteTimeMs - elapsed);
      if (whiteTimeMs <= 0) {
        const winner: PieceColor | 'draw' = hasOnlyInsufficientMaterialForSide(
          replayed.state.board,
          'b'
        )
          ? 'draw'
          : 'b';
        const fields = {
          status: 'finished' as const,
          timeoutWinner: winner,
          whiteTimeMs: 0,
          blackTimeMs,
          clockAnchorMs: null,
          updatedAt: serverTimestamp()
        };
        return {
          kind: 'update',
          fields,
          nextDoc: { ...data, ...fields }
        };
      }
    } else {
      blackTimeMs = Math.max(0, blackTimeMs - elapsed);
      if (blackTimeMs <= 0) {
        const winner: PieceColor | 'draw' = hasOnlyInsufficientMaterialForSide(
          replayed.state.board,
          'w'
        )
          ? 'draw'
          : 'w';
        const fields = {
          status: 'finished' as const,
          timeoutWinner: winner,
          whiteTimeMs,
          blackTimeMs: 0,
          clockAnchorMs: null,
          updatedAt: serverTimestamp()
        };
        return {
          kind: 'update',
          fields,
          nextDoc: { ...data, ...fields }
        };
      }
    }
  }

  const legal = getLegalMoves(replayed.state).find(
    m =>
      m.from.r === move.from.r &&
      m.from.c === move.from.c &&
      m.to.r === move.to.r &&
      m.to.c === move.to.c &&
      (m.promotion ? m.promotion === move.promotion : true)
  );
  if (!legal) {
    throw new Error('Illegal move rejected.');
  }

  const moverColor = replayed.state.turn;
  const { nextState } = applyMove(replayed.state, legal);
  const nextMoves = [...data.moves, encodeChessMove(legal)];
  const gameEndedNow =
    nextState.status === 'checkmate' ||
    nextState.status === 'stalemate' ||
    nextState.status.startsWith('draw_');

  let nextAnchorMs: number | null = null;
  if (data.baseMs > 0) {
    if (wasClockRunning && data.incMs > 0) {
      if (moverColor === 'w') {
        whiteTimeMs = Math.min(3600000, whiteTimeMs + Math.round(data.incMs));
      } else {
        blackTimeMs = Math.min(3600000, blackTimeMs + Math.round(data.incMs));
      }
    }
    nextAnchorMs = gameEndedNow ? null : now;
  }

  const nextStatus: FirestoreChessRoomDoc['status'] = gameEndedNow
    ? 'finished'
    : areAllSeatsFilled(whiteSeats, blackSeats)
    ? 'active'
    : 'waiting';

  const nextActiveIdx = getActiveChessSeatIndex(nextMoves.length, nextState.turn, teamSize);
  const nextActiveSeat = (nextState.turn === 'w' ? whiteSeats : blackSeats)[nextActiveIdx] || null;

  const fields: Record<string, unknown> = {
    moves: nextMoves,
    turn: nextState.turn,
    status: nextStatus,
    whiteTimeMs,
    blackTimeMs,
    clockAnchorMs: nextAnchorMs,
    rematchVotes: [] as string[],
    updatedAt: serverTimestamp()
  };

  if (data.teamMode || data.whiteSeats) {
    fields.activeSeatKind = nextActiveSeat?.kind || 'open';
    fields.activeSeatUid = nextActiveSeat?.kind === 'human' ? nextActiveSeat.uid || null : null;
  }

  return {
    kind: 'update',
    fields,
    nextDoc: {
      ...data,
      moves: nextMoves,
      turn: nextState.turn,
      status: nextStatus,
      whiteTimeMs,
      blackTimeMs,
      clockAnchorMs: nextAnchorMs,
      rematchVotes: [],
      ...(data.teamMode || data.whiteSeats
        ? {
            activeSeatKind: nextActiveSeat?.kind || 'open',
            activeSeatUid: nextActiveSeat?.kind === 'human' ? nextActiveSeat.uid || null : null
          }
        : {})
    }
  };
}

export async function sendFirestoreChessMove(params: {
  code: string;
  move: ChessMove;
  expectedMoveIndex: number;
}): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(params.code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  const cachedDoc = latestRoomDocCache.get(cleanCode);
  if (cachedDoc && cachedDoc.moves.length === params.expectedMoveIndex) {
    const computed = computeMoveUpdatePayload(
      cachedDoc,
      uid,
      params.move,
      params.expectedMoveIndex,
      cleanCode,
      false
    );
    if (computed.kind === 'noop') return;

    try {
      await updateDoc(roomRef, computed.fields);
      latestRoomDocCache.set(cleanCode, computed.nextDoc);
      return;
    } catch {
      // Fall back to authoritative transaction
    }
  }

  try {
    let committedDoc: FirestoreChessRoomDoc | null = null;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error('Room session expired or missing.');
      }
      const data = snap.data() as FirestoreChessRoomDoc;
      const computed = computeMoveUpdatePayload(
        data,
        uid,
        params.move,
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
      latestRoomDocCache.set(cleanCode, committedDoc);
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function sendFirestoreChessBotMove(params: {
  code: string;
  expectedMoveIndex: number;
}): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(params.code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    let committedDoc: FirestoreChessRoomDoc | null = null;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      const replayed = decodeAndReplayMoves(data.moves, cleanCode);
      if (replayed.history.length !== params.expectedMoveIndex) return;
      if (isRoomDocGameOver(data, replayed.state)) return;

      const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const teamSize = getTeamSize(teamMode);
      const activeIdx = getActiveChessSeatIndex(replayed.history.length, replayed.state.turn, teamSize);
      const activeSeat = (replayed.state.turn === 'w' ? whiteSeats : blackSeats)[activeIdx];
      if (!activeSeat || activeSeat.kind !== 'bot') return;

      const bot = getBotById(activeSeat.botId || 'clara');
      const remainingMs =
        data.baseMs > 0
          ? replayed.state.turn === 'w'
            ? data.whiteTimeMs
            : data.blackTimeMs
          : undefined;
      const decision = chooseBotMove(replayed.state, bot, replayed.history, remainingMs);
      if (!decision.move) return;

      const computed = computeMoveUpdatePayload(
        data,
        uid,
        decision.move,
        params.expectedMoveIndex,
        cleanCode,
        true
      );
      if (computed.kind === 'noop') return;
      tx.update(roomRef, computed.fields);
      committedDoc = computed.nextDoc;
    });
    if (committedDoc) {
      latestRoomDocCache.set(cleanCode, committedDoc);
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
}

export async function claimFirestoreChessTimeout(code: string): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      const { whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const participants = collectParticipantUids(whiteSeats, blackSeats);
      if (data.whiteAuthUid !== uid && data.blackAuthUid !== uid && !participants.includes(uid)) return;

      const replayed = decodeAndReplayMoves(data.moves);
      if (
        isRoomDocGameOver(data, replayed.state) ||
        data.baseMs <= 0 ||
        replayed.history.length < 1 ||
        data.clockAnchorMs === null
      ) {
        return;
      }

      const now = Math.round(Date.now());
      const elapsed = Math.max(0, now - data.clockAnchorMs);
      let whiteTimeMs = Math.max(0, Math.round(data.whiteTimeMs));
      let blackTimeMs = Math.max(0, Math.round(data.blackTimeMs));

      if (replayed.state.turn === 'w') {
        if (whiteTimeMs - elapsed > 0) return;
        whiteTimeMs = 0;
        const winner: PieceColor | 'draw' = hasOnlyInsufficientMaterialForSide(
          replayed.state.board,
          'b'
        )
          ? 'draw'
          : 'b';
        tx.update(roomRef, {
          status: 'finished',
          timeoutWinner: winner,
          whiteTimeMs,
          blackTimeMs,
          clockAnchorMs: null,
          updatedAt: serverTimestamp()
        });
      } else {
        if (blackTimeMs - elapsed > 0) return;
        blackTimeMs = 0;
        const winner: PieceColor | 'draw' = hasOnlyInsufficientMaterialForSide(
          replayed.state.board,
          'w'
        )
          ? 'draw'
          : 'w';
        tx.update(roomRef, {
          status: 'finished',
          timeoutWinner: winner,
          whiteTimeMs,
          blackTimeMs,
          clockAnchorMs: null,
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
}

export async function resignFirestoreChessRoom(code: string): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      const replayed = decodeAndReplayMoves(data.moves);
      if (isRoomDocGameOver(data, replayed.state)) return;

      const { whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const match = findSeatForUser(whiteSeats, blackSeats, uid, null);
      const myColor: PieceColor | null = match
        ? match.side === 'A'
          ? 'w'
          : 'b'
        : data.whiteAuthUid === uid
        ? 'w'
        : data.blackAuthUid === uid
        ? 'b'
        : null;
      if (!myColor) return;

      tx.update(roomRef, {
        status: 'finished',
        resignedWinner: myColor === 'w' ? 'b' : 'w',
        clockAnchorMs: null,
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

export async function voteFirestoreChessRematch(code: string): Promise<void> {
  const uid = await ensureChessFirebaseUid();
  const cleanCode = sanitizeRoomCode(code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  const path = `${CHESS_ROOMS_COLLECTION}/${cleanCode}`;

  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const data = snap.data() as FirestoreChessRoomDoc;
      const replayed = decodeAndReplayMoves(data.moves);

      if (!isRoomDocGameOver(data, replayed.state)) return;
      if (data.status !== 'finished') return;

      const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(data);
      const match = findSeatForUser(whiteSeats, blackSeats, uid, null);
      if (!match) return;

      const myColor: PieceColor = match.side === 'A' ? 'w' : 'b';
      const voteToken = teamMode === '1v1' && !data.teamMode ? myColor : `${myColor}:${match.index}`;

      const existingVotes = Array.isArray(data.rematchVotes) ? data.rematchVotes : [];
      const nextVotes = existingVotes.includes(voteToken)
        ? existingVotes
        : [...existingVotes, voteToken];

      const participantUids = collectParticipantUids(whiteSeats, blackSeats);
      const requiredVotes = Math.max(1, participantUids.length);

      if (nextVotes.length >= requiredVotes) {
        const baseMs = Math.max(0, Math.round(data.baseMs));
        if (data.teamMode || data.whiteSeats) {
          const meta = computeChessMetaFields({
            teamMode,
            whiteSeats: blackSeats,
            blackSeats: whiteSeats,
            turn: 'w',
            moveCount: 0
          });
          tx.update(roomRef, {
            ...meta,
            moves: [],
            turn: 'w',
            whiteTimeMs: baseMs,
            blackTimeMs: baseMs,
            clockAnchorMs: null,
            resignedWinner: null,
            timeoutWinner: null,
            rematchVotes: [],
            updatedAt: serverTimestamp()
          });
        } else {
          const bothPresent = Boolean(data.whiteAuthUid && data.blackAuthUid);
          tx.update(roomRef, {
            whiteAuthUid: data.blackAuthUid,
            whitePlayerId: data.blackPlayerId,
            whiteName: data.blackName,
            blackAuthUid: data.whiteAuthUid,
            blackPlayerId: data.whitePlayerId,
            blackName: data.whiteName,
            moves: [],
            turn: 'w',
            status: bothPresent ? 'active' : 'waiting',
            whiteTimeMs: baseMs,
            blackTimeMs: baseMs,
            clockAnchorMs: null,
            resignedWinner: null,
            timeoutWinner: null,
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

export async function leaveFirestoreChessRoom(code: string): Promise<void> {
  if (!auth.currentUser?.uid) return;
  const uid = auth.currentUser.uid;
  const cleanCode = sanitizeRoomCode(code);
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);

  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreChessRoomDoc;
    if (data.status === 'finished' || data.moves.length > 0) return;

    await runTransaction(db, async (tx) => {
      const freshSnap = await tx.get(roomRef);
      if (!freshSnap.exists()) return;
      const fresh = freshSnap.data() as FirestoreChessRoomDoc;
      if (fresh.status === 'finished' || fresh.moves.length > 0) return;

      if (fresh.teamMode || fresh.whiteSeats) {
        const { teamMode, whiteSeats, blackSeats } = resolveChessDocSeats(fresh);
        const match = findSeatForUser(whiteSeats, blackSeats, uid, null);
        if (!match) return;
        if (match.side === 'A') {
          whiteSeats[match.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        } else {
          blackSeats[match.index] = { kind: 'open', uid: null, playerId: null, name: null, botId: null };
        }
        const meta = computeChessMetaFields({
          teamMode,
          whiteSeats,
          blackSeats,
          turn: fresh.turn,
          moveCount: 0
        });
        tx.update(roomRef, { ...meta, status: 'waiting', updatedAt: serverTimestamp() });
      } else if (fresh.whiteAuthUid === uid) {
        tx.update(roomRef, {
          whiteAuthUid: null,
          whitePlayerId: null,
          whiteName: null,
          status: 'waiting',
          updatedAt: serverTimestamp()
        });
      } else if (fresh.blackAuthUid === uid) {
        tx.update(roomRef, {
          blackAuthUid: null,
          blackPlayerId: null,
          blackName: null,
          status: 'waiting',
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch {
    // Non-fatal cleanup on room exit
  }
}

export interface ChessRoomTurnSummary {
  code: string;
  status: 'waiting' | 'active' | 'finished';
  turn: PieceColor;
  moveCount: number;
  opponentJoined: boolean;
  opponentName: string | null;
}

export function watchChessRoomSummary(
  code: string,
  mySide: PieceColor,
  onSummary: (summary: ChessRoomTurnSummary) => void
): Unsubscribe {
  const cleanCode = sanitizeRoomCode(code);
  if (!cleanCode || !auth.currentUser?.uid) return () => {};
  const roomRef = doc(db, CHESS_ROOMS_COLLECTION, cleanCode);
  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as FirestoreChessRoomDoc;
      const moves = Array.isArray(data.moves) ? data.moves : [];
      const oppName = mySide === 'w' ? data.blackName : data.whiteName;
      const oppUid = mySide === 'w' ? data.blackAuthUid : data.whiteAuthUid;
      onSummary({
        code: cleanCode,
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
