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
  applyArcadeAction,
  createInitialArcadeState,
  isValidArcadeGameType,
  replayArcadeMoves
} from '../utils/arcadeEngines';
import type {
  ArcadeGameType,
  ArcadePlayer,
  ArcadeState,
  ArcadeWinner
} from '../utils/arcadeEngines';

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ARCADE_ROOMS_COLLECTION = 'arcadeRooms';

export interface FirestoreArcadeRoomDoc {
  code: string;
  gameType: ArcadeGameType;
  creatorAuthUid: string;
  status: 'waiting' | 'active' | 'finished';
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
  rematchVotes: ArcadePlayer[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ArcadeRoomViewPayload {
  code: string;
  gameType: ArcadeGameType;
  mySeat: ArcadePlayer | 'spectator';
  state: ArcadeState;
  moves: string[];
  resignedWinner: ArcadePlayer | null;
  rematchVotes: ArcadePlayer[];
  players: {
    p1: { name: string; connected: boolean } | null;
    p2: { name: string; connected: boolean } | null;
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
): ArcadeState {
  const moves: string[] = [];
  if (Array.isArray(rawMoves)) {
    for (const item of rawMoves) {
      if (typeof item === 'string') moves.push(item);
    }
  }

  if (moves.length === 0) {
    const fresh = createInitialArcadeState(gameType);
    if (roomCode) {
      arcadeReplayCache.set(roomCode, { gameType, moves: [], state: fresh });
    }
    return fresh;
  }

  const cached = roomCode ? arcadeReplayCache.get(roomCode) : undefined;
  const state = replayArcadeMoves(gameType, moves, cached);

  if (roomCode) {
    arcadeReplayCache.set(roomCode, {
      gameType,
      moves: moves.slice(),
      state
    });
  }
  return state;
}

function isRoomDocGameOver(docData: FirestoreArcadeRoomDoc, state: ArcadeState): boolean {
  return (
    docData.status === 'finished' ||
    Boolean(docData.resignedWinner) ||
    Boolean(docData.winner) ||
    state.winner !== null
  );
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
  const state = replayCachedArcadeMoves(safeGameType, moves, docData.code);

  let mySeat: ArcadePlayer | 'spectator' = 'spectator';
  if (
    docData.p1AuthUid === currentAuthUid ||
    (docData.p1PlayerId && docData.p1PlayerId === playerId)
  ) {
    mySeat = 'p1';
  } else if (
    docData.p2AuthUid === currentAuthUid ||
    (docData.p2PlayerId && docData.p2PlayerId === playerId)
  ) {
    mySeat = 'p2';
  }

  return {
    code: docData.code,
    gameType: safeGameType,
    mySeat,
    state,
    moves,
    resignedWinner: docData.resignedWinner || null,
    rematchVotes: Array.isArray(docData.rematchVotes) ? docData.rematchVotes : [],
    players: {
      p1: docData.p1AuthUid
        ? { name: docData.p1Name || 'Player 1', connected: true }
        : null,
      p2: docData.p2AuthUid
        ? { name: docData.p2Name || 'Player 2', connected: true }
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
}): Promise<{ code: string; uid: string }> {
  const uid = await ensureArcadeFirebaseUid();
  const safeName = sanitizeArcadePlayerName(params.playerName);
  const safePlayerId = String(params.playerId || uid).trim().slice(0, 64) || uid;
  const resolvedSeat: ArcadePlayer =
    params.preferredSeat === 'p2'
      ? 'p2'
      : params.preferredSeat === 'random'
      ? Math.random() < 0.5
        ? 'p1'
        : 'p2'
      : 'p1';

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
          status: 'waiting',
          p1AuthUid: resolvedSeat === 'p1' ? uid : null,
          p1PlayerId: resolvedSeat === 'p1' ? safePlayerId : null,
          p1Name: resolvedSeat === 'p1' ? safeName : null,
          p2AuthUid: resolvedSeat === 'p2' ? uid : null,
          p2PlayerId: resolvedSeat === 'p2' ? safePlayerId : null,
          p2Name: resolvedSeat === 'p2' ? safeName : null,
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

      if (data.p1AuthUid === uid) {
        tx.update(roomRef, {
          p1PlayerId: safePlayerId,
          p1Name: safeName,
          updatedAt: serverTimestamp()
        });
        return { ...data, p1PlayerId: safePlayerId, p1Name: safeName };
      }

      if (data.p2AuthUid === uid) {
        tx.update(roomRef, {
          p2PlayerId: safePlayerId,
          p2Name: safeName,
          updatedAt: serverTimestamp()
        });
        return { ...data, p2PlayerId: safePlayerId, p2Name: safeName };
      }

      if (!data.p1AuthUid) {
        const nextStatus = data.p2AuthUid ? 'active' : 'waiting';
        tx.update(roomRef, {
          p1AuthUid: uid,
          p1PlayerId: safePlayerId,
          p1Name: safeName,
          status: nextStatus,
          updatedAt: serverTimestamp()
        });
        return {
          ...data,
          p1AuthUid: uid,
          p1PlayerId: safePlayerId,
          p1Name: safeName,
          status: nextStatus
        } as FirestoreArcadeRoomDoc;
      }

      if (!data.p2AuthUid) {
        const nextStatus = data.p1AuthUid ? 'active' : 'waiting';
        tx.update(roomRef, {
          p2AuthUid: uid,
          p2PlayerId: safePlayerId,
          p2Name: safeName,
          status: nextStatus,
          updatedAt: serverTimestamp()
        });
        return {
          ...data,
          p2AuthUid: uid,
          p2PlayerId: safePlayerId,
          p2Name: safeName,
          status: nextStatus
        } as FirestoreArcadeRoomDoc;
      }

      return data;
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
          params.onError(wrapped as Error);
        }
      } else {
        params.onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}

function computeArcadeMoveUpdatePayload(
  data: FirestoreArcadeRoomDoc,
  uid: string,
  action: string,
  expectedMoveIndex: number,
  roomCode: string
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

  const currentState = replayCachedArcadeMoves(safeGameType, existingMoves, roomCode);
  if (isRoomDocGameOver(data, currentState)) {
    return { kind: 'noop' };
  }

  const activeUid = currentState.turn === 'p1' ? data.p1AuthUid : data.p2AuthUid;
  if (activeUid !== uid) {
    throw new Error('Not your turn.');
  }

  const cleanAction = String(action || '').trim().slice(0, 32);
  const res = applyArcadeAction(currentState, cleanAction);
  if (!res.valid) {
    throw new Error('Illegal move rejected.');
  }

  const nextMoves = [...existingMoves, cleanAction];
  const gameEndedNow = res.nextState.winner !== null;
  const nextStatus: FirestoreArcadeRoomDoc['status'] = gameEndedNow
    ? 'finished'
    : data.p1AuthUid && data.p2AuthUid
    ? 'active'
    : 'waiting';

  const fields = {
    moves: nextMoves,
    turn: res.nextState.turn,
    status: nextStatus,
    winner: res.nextState.winner,
    rematchVotes: [] as ArcadePlayer[],
    updatedAt: serverTimestamp()
  };

  return {
    kind: 'update',
    fields,
    nextDoc: {
      ...data,
      moves: nextMoves,
      turn: res.nextState.turn,
      status: nextStatus,
      winner: res.nextState.winner,
      rematchVotes: []
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

  // Fast single-RPC path using cached live room snapshot + direct updateDoc
  const cachedDoc = latestArcadeRoomDocCache.get(cleanCode);
  if (cachedDoc && cachedDoc.moves.length === params.expectedMoveIndex) {
    const computed = computeArcadeMoveUpdatePayload(
      cachedDoc,
      uid,
      params.action,
      params.expectedMoveIndex,
      cleanCode
    );
    if (computed.kind === 'noop') return;

    try {
      await updateDoc(roomRef, computed.fields);
      latestArcadeRoomDocCache.set(cleanCode, computed.nextDoc);
      return;
    } catch {
      // Fall back to authoritative transaction if cache was stale or contended
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
      latestArcadeRoomDocCache.set(cleanCode, committedDoc);
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
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
      const state = replayCachedArcadeMoves(data.gameType, data.moves, cleanCode);
      if (isRoomDocGameOver(data, state)) return;

      const mySeat: ArcadePlayer | null =
        data.p1AuthUid === uid ? 'p1' : data.p2AuthUid === uid ? 'p2' : null;
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
      const state = replayCachedArcadeMoves(data.gameType, data.moves, cleanCode);
      if (!isRoomDocGameOver(data, state)) return;
      if (data.status !== 'finished') return;

      const mySeat: ArcadePlayer | null =
        data.p1AuthUid === uid ? 'p1' : data.p2AuthUid === uid ? 'p2' : null;
      if (!mySeat) return;

      const existingVotes = Array.isArray(data.rematchVotes) ? data.rematchVotes : [];
      const nextVotes = existingVotes.includes(mySeat)
        ? existingVotes
        : [...existingVotes, mySeat];

      const bothPresent = Boolean(data.p1AuthUid && data.p2AuthUid);
      if ((bothPresent && nextVotes.length >= 2) || (!bothPresent && nextVotes.length >= 1)) {
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

      if (fresh.p1AuthUid === uid) {
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
        opponentJoined: Boolean(oppUid),
        opponentName: oppName || null
      });
    },
    () => {
      // Background watcher errors are non-fatal
    }
  );
}
