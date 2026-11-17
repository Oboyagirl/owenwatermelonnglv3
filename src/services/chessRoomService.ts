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
  googleProvider,
  handleFirestoreError,
  OperationType,
  waitForAuthReady
} from './firebase';
import { markRememberedLogin } from './cloudSaveService';
import {
  applyMove,
  createInitialState,
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

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CHESS_ROOMS_COLLECTION = 'chessRooms';

export interface FirestoreChessRoomDoc {
  code: string;
  creatorAuthUid: string;
  status: 'waiting' | 'active' | 'finished';
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
  rematchVotes: PieceColor[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ChessRoomViewPayload {
  code: string;
  myColor: PieceColor | 'spectator';
  state: ChessState;
  history: MoveRecord[];
  resignedWinner: PieceColor | null;
  timeoutWinner: PieceColor | 'draw' | null;
  rematchVotes: PieceColor[];
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
  players: {
    w: { name: string; elo: number; connected: boolean } | null;
    b: { name: string; elo: number; connected: boolean } | null;
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

export function roomDocToViewPayload(
  docData: FirestoreChessRoomDoc,
  currentAuthUid: string,
  playerId: string
): ChessRoomViewPayload {
  const { state, history } = decodeAndReplayMoves(docData.moves, docData.code);

  let myColor: PieceColor | 'spectator' = 'spectator';
  if (docData.whiteAuthUid === currentAuthUid || (docData.whitePlayerId && docData.whitePlayerId === playerId)) {
    myColor = 'w';
  } else if (docData.blackAuthUid === currentAuthUid || (docData.blackPlayerId && docData.blackPlayerId === playerId)) {
    myColor = 'b';
  }

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
    myColor,
    state,
    history,
    resignedWinner: docData.resignedWinner || null,
    timeoutWinner: docData.timeoutWinner || null,
    rematchVotes: Array.isArray(docData.rematchVotes) ? docData.rematchVotes : [],
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
    players: {
      w: docData.whiteAuthUid
        ? {
            name: docData.whiteName || 'White',
            elo: docData.whiteElo || 1200,
            connected: true
          }
        : null,
      b: docData.blackAuthUid
        ? {
            name: docData.blackName || 'Black',
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

/**
 * Ensures Firebase Auth has an active UID before interacting with Firestore chessRooms.
 * Uses existing session if present, attempts anonymous sign-in silently, and raises
 * ChessAuthRequiredError if Firebase requires explicit Google sign-in.
 */
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
}): Promise<{ code: string; uid: string }> {
  const uid = await ensureChessFirebaseUid();
  const safeName = sanitizePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;
  const tc = getTimeControlById(params.timeControlId || 'none');
  const resolvedColor: PieceColor =
    params.preferredColor === 'b'
      ? 'b'
      : params.preferredColor === 'random'
      ? Math.random() < 0.5
        ? 'w'
        : 'b'
      : 'w';

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
          status: 'waiting',
          timeControlId: tc.id.slice(0, 16),
          baseMs,
          incMs,
          whiteAuthUid: resolvedColor === 'w' ? uid : null,
          whitePlayerId: resolvedColor === 'w' ? safePlayerId : null,
          whiteName: resolvedColor === 'w' ? safeName : null,
          whiteElo: 1200,
          blackAuthUid: resolvedColor === 'b' ? uid : null,
          blackPlayerId: resolvedColor === 'b' ? safePlayerId : null,
          blackName: resolvedColor === 'b' ? safeName : null,
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

      if (data.whiteAuthUid === uid) {
        tx.update(roomRef, {
          whitePlayerId: safePlayerId,
          whiteName: safeName,
          updatedAt: serverTimestamp()
        });
        return { ...data, whitePlayerId: safePlayerId, whiteName: safeName };
      }

      if (data.blackAuthUid === uid) {
        tx.update(roomRef, {
          blackPlayerId: safePlayerId,
          blackName: safeName,
          updatedAt: serverTimestamp()
        });
        return { ...data, blackPlayerId: safePlayerId, blackName: safeName };
      }

      if (!data.whiteAuthUid) {
        const nextStatus = data.blackAuthUid ? 'active' : 'waiting';
        tx.update(roomRef, {
          whiteAuthUid: uid,
          whitePlayerId: safePlayerId,
          whiteName: safeName,
          status: nextStatus,
          updatedAt: serverTimestamp()
        });
        return {
          ...data,
          whiteAuthUid: uid,
          whitePlayerId: safePlayerId,
          whiteName: safeName,
          status: nextStatus
        } as FirestoreChessRoomDoc;
      }

      if (!data.blackAuthUid) {
        const nextStatus = data.whiteAuthUid ? 'active' : 'waiting';
        tx.update(roomRef, {
          blackAuthUid: uid,
          blackPlayerId: safePlayerId,
          blackName: safeName,
          status: nextStatus,
          updatedAt: serverTimestamp()
        });
        return {
          ...data,
          blackAuthUid: uid,
          blackPlayerId: safePlayerId,
          blackName: safeName,
          status: nextStatus
        } as FirestoreChessRoomDoc;
      }

      // Both seats occupied -> join as spectator (read-only)
      return data;
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
          params.onError(wrapped as Error);
        }
      } else {
        params.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}

function computeMoveUpdatePayload(
  data: FirestoreChessRoomDoc,
  uid: string,
  move: ChessMove,
  expectedMoveIndex: number,
  roomCode: string
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

  const activeUid = replayed.state.turn === 'w' ? data.whiteAuthUid : data.blackAuthUid;
  if (activeUid !== uid) {
    throw new Error('Not your turn.');
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
    : data.whiteAuthUid && data.blackAuthUid
    ? 'active'
    : 'waiting';

  const fields = {
    moves: nextMoves,
    turn: nextState.turn,
    status: nextStatus,
    whiteTimeMs,
    blackTimeMs,
    clockAnchorMs: nextAnchorMs,
    rematchVotes: [] as PieceColor[],
    updatedAt: serverTimestamp()
  };

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
      rematchVotes: []
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

  // Fast single-RPC path: use cached live room snapshot + direct updateDoc
  // (avoids 2 extra BeginTransaction + BatchGet round-trips per move while Firestore rules enforce turn & move count)
  const cachedDoc = latestRoomDocCache.get(cleanCode);
  if (cachedDoc && cachedDoc.moves.length === params.expectedMoveIndex) {
    const computed = computeMoveUpdatePayload(
      cachedDoc,
      uid,
      params.move,
      params.expectedMoveIndex,
      cleanCode
    );
    if (computed.kind === 'noop') return;

    try {
      await updateDoc(roomRef, computed.fields);
      latestRoomDocCache.set(cleanCode, computed.nextDoc);
      return;
    } catch {
      // Fall back to authoritative transaction if cache was stale or contended
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
        cleanCode
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
      if (data.whiteAuthUid !== uid && data.blackAuthUid !== uid) return;

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

      const myColor: PieceColor | null =
        data.whiteAuthUid === uid ? 'w' : data.blackAuthUid === uid ? 'b' : null;
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

      const myColor: PieceColor | null =
        data.whiteAuthUid === uid ? 'w' : data.blackAuthUid === uid ? 'b' : null;
      if (!myColor) return;

      // Ensure status is recorded as 'finished' before rematch transition if somehow not yet marked
      if (data.status !== 'finished') {
        return;
      }

      const existingVotes = Array.isArray(data.rematchVotes) ? data.rematchVotes : [];
      const nextVotes = existingVotes.includes(myColor)
        ? existingVotes
        : [...existingVotes, myColor];

      const bothPresent = Boolean(data.whiteAuthUid && data.blackAuthUid);
      if ((bothPresent && nextVotes.length >= 2) || (!bothPresent && nextVotes.length >= 1)) {
        const baseMs = Math.max(0, Math.round(data.baseMs));
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

      if (fresh.whiteAuthUid === uid) {
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
        opponentJoined: Boolean(oppUid),
        opponentName: oppName || null
      });
    },
    () => {
      // Background watcher errors are non-fatal
    }
  );
}
