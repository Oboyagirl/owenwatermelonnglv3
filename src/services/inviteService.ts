import {
  collection,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  doc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { timestampToMs } from './chatService';
import type { ArcadeGameType } from '../utils/arcadeEngines';

const GAME_INVITES_COLLECTION = 'gameInvites';

export type InviteGameKind = 'chess' | 'arcade';
export type InviteGameType = 'chess' | ArcadeGameType;
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface GameInvite {
  id: string;
  fromUid: string;
  fromName: string;
  fromAvatarId: string;
  toUid: string;
  toName: string;
  participantUids: [string, string];
  gameKind: InviteGameKind;
  gameType: InviteGameType;
  gameTitle: string;
  roomCode: string;
  status: InviteStatus;
  createdAt: unknown;
  updatedAt: unknown;
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

export async function sendGameInvite(params: {
  fromUid: string;
  fromName: string;
  fromAvatarId: string;
  toUid: string;
  toName: string;
  gameKind: InviteGameKind;
  gameType: InviteGameType;
  gameTitle: string;
  roomCode: string;
}): Promise<string> {
  if (!auth.currentUser || auth.currentUser.uid !== params.fromUid) {
    throw new Error('Sign in with Firebase first to invite friends directly.');
  }
  if (!params.toUid || params.toUid === params.fromUid) {
    throw new Error('Select a friend to invite.');
  }

  const cleanRoomCode = String(params.roomCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  if (cleanRoomCode.length < 4) {
    throw new Error('Room code must be ready before sending an invite.');
  }

  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `${GAME_INVITES_COLLECTION}/${inviteId}`;
  const ref = doc(db, GAME_INVITES_COLLECTION, inviteId);

  const payload = {
    id: inviteId,
    fromUid: params.fromUid,
    fromName: String(params.fromName || 'Player').trim().slice(0, 64) || 'Player',
    fromAvatarId: String(params.fromAvatarId || 'melon_classic').trim().slice(0, 64) || 'melon_classic',
    toUid: params.toUid,
    toName: String(params.toName || 'Friend').trim().slice(0, 64) || 'Friend',
    participantUids: [params.fromUid, params.toUid] as [string, string],
    gameKind: params.gameKind,
    gameType: params.gameType,
    gameTitle: String(params.gameTitle || 'Game').trim().slice(0, 64) || 'Game',
    roomCode: cleanRoomCode,
    status: 'pending' as InviteStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(ref, payload);
    return inviteId;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
    throw err;
  }
}

export async function respondToGameInvite(
  inviteId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  if (!auth.currentUser?.uid) {
    throw new Error('Sign in with Firebase first to respond to invites.');
  }
  const path = `${GAME_INVITES_COLLECTION}/${inviteId}`;
  const ref = doc(db, GAME_INVITES_COLLECTION, inviteId);

  try {
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
    throw err;
  }
}

export async function cancelGameInvite(inviteId: string): Promise<void> {
  if (!auth.currentUser?.uid) return;
  const path = `${GAME_INVITES_COLLECTION}/${inviteId}`;
  const ref = doc(db, GAME_INVITES_COLLECTION, inviteId);

  try {
    await updateDoc(ref, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
}

export function subscribeMyGameInvites(
  myUid: string,
  onUpdate: (invites: GameInvite[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, GAME_INVITES_COLLECTION),
    where('participantUids', 'array-contains', myUid),
    limit(40)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const cutoffMs = Date.now() - 12 * 60 * 60 * 1000;
      const list = snapshot.docs
        .map((d) => d.data() as GameInvite)
        .filter((inv) => {
          const ts = timestampToMs(inv.updatedAt) || timestampToMs(inv.createdAt);
          return !ts || ts >= cutoffMs;
        });
      list.sort(
        (a, b) =>
          (timestampToMs(b.updatedAt) || timestampToMs(b.createdAt)) -
          (timestampToMs(a.updatedAt) || timestampToMs(a.createdAt))
      );
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, GAME_INVITES_COLLECTION);
        } catch (wrapped) {
          onError?.(wrapped as Error);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}
