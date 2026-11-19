import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export const CALL_SESSIONS_COLLECTION = 'callSessions';
export const CALL_CANDIDATES_SUBCOLLECTION = 'candidates';

export type CallMediaMode = 'audio' | 'video';
export type CallSessionStatus = 'ringing' | 'active' | 'ended' | 'declined' | 'missed';
export type CallCandidateType = 'offer-ice' | 'answer-ice' | 'ice';

export interface CallSessionDoc {
  id: string;
  callerUid: string;
  callerName: string;
  callerAvatarId: string;
  calleeUid: string;
  calleeName: string;
  calleeAvatarId: string;
  participantUids: [string, string];
  mode: CallMediaMode;
  status: CallSessionStatus;
  contextLabel: string | null;
  sdpOffer: string;
  sdpAnswer: string | null;
  createdAt?: Timestamp | unknown;
  updatedAt?: Timestamp | unknown;
  endedAt?: Timestamp | null | unknown;
}

export interface CallCandidateDoc {
  id: string;
  fromUid: string;
  toUid: string;
  type: CallCandidateType;
  candidate: string;
  createdAt?: Timestamp | unknown;
}

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

function isPermissionDeniedError(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  const msg = err instanceof Error ? err.message : String(err || '');
  return code === 'permission-denied' || msg.toLowerCase().includes('missing or insufficient permissions');
}

function clampString(val: unknown, fallback: string, maxLen: number): string {
  const str = typeof val === 'string' ? val.trim() : '';
  if (!str) return fallback;
  return str.slice(0, maxLen);
}

export function generateCallId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `call_${Date.now()}_${rand}`;
}

export function generateCandidateId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `ice_${Date.now()}_${rand}`;
}

export async function createCallSessionDoc(params: {
  callId: string;
  callerUid: string;
  callerName: string;
  callerAvatarId: string;
  calleeUid: string;
  calleeName: string;
  calleeAvatarId: string;
  mode: CallMediaMode;
  contextLabel?: string | null;
  sdpOffer: string;
}): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== params.callerUid) {
    throw new Error('Sign in with Google to start a voice or video call.');
  }
  const path = `${CALL_SESSIONS_COLLECTION}/${params.callId}`;
  const cleanContext = params.contextLabel ? clampString(params.contextLabel, '', 80) : null;
  const payload: CallSessionDoc = {
    id: params.callId,
    callerUid: params.callerUid,
    callerName: clampString(params.callerName, 'Player', 64),
    callerAvatarId: clampString(params.callerAvatarId, 'melon_classic', 64),
    calleeUid: params.calleeUid,
    calleeName: clampString(params.calleeName, 'Player', 64),
    calleeAvatarId: clampString(params.calleeAvatarId, 'melon_classic', 64),
    participantUids: [params.callerUid, params.calleeUid],
    mode: params.mode,
    status: 'ringing',
    contextLabel: cleanContext || null,
    sdpOffer: params.sdpOffer.slice(0, 24000),
    sdpAnswer: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    endedAt: null
  };

  try {
    await setDoc(doc(db, CALL_SESSIONS_COLLECTION, params.callId), payload);
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    throw err;
  }
}

export async function answerCallSessionDoc(callId: string, sdpAnswer: string): Promise<void> {
  const path = `${CALL_SESSIONS_COLLECTION}/${callId}`;
  try {
    await updateDoc(doc(db, CALL_SESSIONS_COLLECTION, callId), {
      status: 'active',
      sdpAnswer: sdpAnswer.slice(0, 24000),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function updateCallSessionStatus(
  callId: string,
  status: 'ended' | 'declined' | 'missed'
): Promise<void> {
  const path = `${CALL_SESSIONS_COLLECTION}/${callId}`;
  try {
    await updateDoc(doc(db, CALL_SESSIONS_COLLECTION, callId), {
      status,
      endedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      // Call might already be in a terminal state if peer hung up at the same instant
      console.warn('Could not update terminal call state cleanly:', err);
      return;
    }
    throw err;
  }
}

export async function addIceCandidateDoc(params: {
  callId: string;
  fromUid: string;
  toUid: string;
  type: CallCandidateType;
  candidateJson: string;
}): Promise<void> {
  const candidateId = generateCandidateId();
  const path = `${CALL_SESSIONS_COLLECTION}/${params.callId}/${CALL_CANDIDATES_SUBCOLLECTION}/${candidateId}`;
  try {
    await setDoc(
      doc(db, CALL_SESSIONS_COLLECTION, params.callId, CALL_CANDIDATES_SUBCOLLECTION, candidateId),
      {
        id: candidateId,
        fromUid: params.fromUid,
        toUid: params.toUid,
        type: params.type,
        candidate: params.candidateJson.slice(0, 4096),
        createdAt: serverTimestamp()
      }
    );
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    throw err;
  }
}

export function subscribeIncomingCalls(
  myUid: string,
  onUpdate: (sessions: CallSessionDoc[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = CALL_SESSIONS_COLLECTION;
  const q = query(
    collection(db, CALL_SESSIONS_COLLECTION),
    where('participantUids', 'array-contains', myUid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: CallSessionDoc[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as CallSessionDoc;
        if (data && data.id) items.push(data);
      });
      onUpdate(items);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
          return;
        }
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}

export function subscribeCallSession(
  callId: string,
  onUpdate: (session: CallSessionDoc | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `${CALL_SESSIONS_COLLECTION}/${callId}`;
  return onSnapshot(
    doc(db, CALL_SESSIONS_COLLECTION, callId),
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate(snap.data() as CallSessionDoc);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.GET, path);
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
          return;
        }
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}

export function subscribeCallCandidates(
  callId: string,
  myUid: string,
  onAdded: (candidate: CallCandidateDoc) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `${CALL_SESSIONS_COLLECTION}/${callId}/${CALL_CANDIDATES_SUBCOLLECTION}`;
  const q = query(
    collection(db, CALL_SESSIONS_COLLECTION, callId, CALL_CANDIDATES_SUBCOLLECTION),
    where('toUid', '==', myUid)
  );
  return onSnapshot(
    q,
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as CallCandidateDoc;
          if (data && data.candidate) onAdded(data);
        }
      });
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
          return;
        }
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}
