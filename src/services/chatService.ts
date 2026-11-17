import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

const CHAT_PROFILES_COLLECTION = 'chatProfiles';
const CHAT_THREADS_COLLECTION = 'chatThreads';
const FRIEND_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DISCOVERABLE_PREF_KEY = 'owen_chat_discoverable';
const ONLINE_FRESHNESS_MS = 4 * 60 * 1000;

// Tracks threadIds confirmed to exist in Firestore so sendDirectMessage skips blocking pre-read RPCs
const knownExistingThreads = new Set<string>();

export function createChatMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface ChatProfile {
  userId: string;
  displayName: string;
  friendCode: string;
  avatarId: string;
  discoverable: boolean;
  isOnline: boolean;
  lastSeenAt: unknown;
  updatedAt: unknown;
}

export interface UserContact {
  contactUid: string;
  displayName: string;
  friendCode: string;
  avatarId: string;
  nickname?: string | null;
  addedAt: unknown;
}

export interface ChatThread {
  threadId: string;
  userAUid: string;
  userBUid: string;
  participantUids: [string, string];
  userAName: string;
  userBName: string;
  userAAvatarId: string;
  userBAvatarId: string;
  lastMessageText: string;
  lastMessageSenderUid: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderUid: string;
  senderName: string;
  senderAvatarId: string;
  participantUids: [string, string];
  text: string;
  createdAt: unknown;
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

export function deriveFriendCode(uid: string): string {
  const clean = String(uid || 'USER').trim();
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2 ^ ch, 0x85ebca6b) >>> 0);
  }
  let code = '';
  let combined = (BigInt(h1) << 32n) | BigInt(h2);
  const base = BigInt(FRIEND_CODE_ALPHABET.length);
  for (let i = 0; i < 6; i++) {
    const idx = Number(combined % base);
    code += FRIEND_CODE_ALPHABET[idx];
    combined = combined / base;
  }
  return `WM-${code}`;
}

export function getDiscoverablePreference(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return true;
  try {
    return localStorage.getItem(DISCOVERABLE_PREF_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setDiscoverablePreference(discoverable: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(DISCOVERABLE_PREF_KEY, String(discoverable));
  } catch {}
}

export function timestampToMs(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const t = Date.parse(val);
    return Number.isNaN(t) ? 0 : t;
  }
  if (typeof val === 'object') {
    const ts = val as { toMillis?: () => number; seconds?: number };
    if (typeof ts.toMillis === 'function') {
      try {
        return ts.toMillis();
      } catch {
        return 0;
      }
    }
    if (typeof ts.seconds === 'number') {
      return ts.seconds * 1000;
    }
  }
  return 0;
}

export function isProfileOnlineNow(profile: Pick<ChatProfile, 'isOnline' | 'lastSeenAt'>): boolean {
  if (!profile.isOnline) return false;
  const ms = timestampToMs(profile.lastSeenAt);
  if (!ms) return true; // serverTimestamp pending locally
  return Date.now() - ms < ONLINE_FRESHNESS_MS;
}

export function formatChatTimestamp(val: unknown): string {
  const ms = timestampToMs(val);
  if (!ms) return 'Now';
  try {
    const d = new Date(ms);
    const diffMs = Date.now() - ms;
    if (diffMs < 60_000) return 'Just now';
    const isToday = new Date().toDateString() === d.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function getCanonicalThreadMeta(uid1: string, uid2: string): {
  threadId: string;
  userAUid: string;
  userBUid: string;
  participantUids: [string, string];
} {
  const sorted = [uid1, uid2].sort();
  const userAUid = sorted[0];
  const userBUid = sorted[1];
  return {
    threadId: `${userAUid}_${userBUid}`,
    userAUid,
    userBUid,
    participantUids: [userAUid, userBUid]
  };
}

function sanitizeDisplayName(name: string | null | undefined, fallbackUid: string): string {
  const clean = String(name || '').trim().slice(0, 64);
  return clean || `Player_${fallbackUid.slice(0, 5)}`;
}

function sanitizeAvatarId(avatarId: string | null | undefined): string {
  const clean = String(avatarId || '').trim().slice(0, 64);
  return clean || 'melon_classic';
}

export async function syncMyChatProfile(params: {
  uid: string;
  displayName?: string | null;
  avatarId?: string | null;
  isOnline: boolean;
  discoverable?: boolean;
}): Promise<ChatProfile | null> {
  if (!auth.currentUser || auth.currentUser.uid !== params.uid) {
    return null;
  }

  const uid = params.uid;
  const path = `${CHAT_PROFILES_COLLECTION}/${uid}`;
  const ref = doc(db, CHAT_PROFILES_COLLECTION, uid);
  const friendCode = deriveFriendCode(uid);
  const discoverable =
    typeof params.discoverable === 'boolean'
      ? params.discoverable
      : getDiscoverablePreference();

  const payload = {
    userId: uid,
    displayName: sanitizeDisplayName(params.displayName, uid),
    friendCode,
    avatarId: sanitizeAvatarId(params.avatarId),
    discoverable,
    isOnline: params.isOnline,
    lastSeenAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, {
        displayName: payload.displayName,
        friendCode: payload.friendCode,
        avatarId: payload.avatarId,
        discoverable: payload.discoverable,
        isOnline: payload.isOnline,
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await setDoc(ref, payload);
    }

    return {
      ...payload,
      lastSeenAt: Date.now(),
      updatedAt: Date.now()
    };
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    console.warn('syncMyChatProfile warning:', err);
    return null;
  }
}

export async function setMyChatOffline(uid: string): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return;
  const ref = doc(db, CHAT_PROFILES_COLLECTION, uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    await updateDoc(ref, {
      isOnline: false,
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch {
    // Non-fatal offline cleanup during sign-out
  }
}

export function subscribeDiscoverableProfiles(
  onUpdate: (profiles: ChatProfile[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!auth.currentUser) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, CHAT_PROFILES_COLLECTION),
    where('discoverable', '==', true),
    limit(80)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as ChatProfile);
      list.sort((a, b) => {
        const aOnline = isProfileOnlineNow(a) ? 1 : 0;
        const bOnline = isProfileOnlineNow(b) ? 1 : 0;
        if (aOnline !== bOnline) return bOnline - aOnline;
        return timestampToMs(b.lastSeenAt) - timestampToMs(a.lastSeenAt);
      });
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, CHAT_PROFILES_COLLECTION);
        } catch (wrapped) {
          onError?.(wrapped as Error);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}

export function subscribeMyContacts(
  myUid: string,
  onUpdate: (contacts: UserContact[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) {
    onUpdate([]);
    return () => {};
  }

  const path = `users/${myUid}/contacts`;
  const coll = collection(db, 'users', myUid, 'contacts');

  return onSnapshot(
    coll,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as UserContact);
      list.sort((a, b) =>
        (a.nickname || a.displayName || '').localeCompare(b.nickname || b.displayName || '')
      );
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError?.(wrapped as Error);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}

export async function addFriendContact(
  myUid: string,
  target: Pick<ChatProfile, 'userId' | 'displayName' | 'friendCode' | 'avatarId'>
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) {
    throw new Error('Sign in to Firebase first to add friends.');
  }
  if (!target.userId || target.userId === myUid) {
    throw new Error('You cannot add yourself as a friend.');
  }

  const path = `users/${myUid}/contacts/${target.userId}`;
  const ref = doc(db, 'users', myUid, 'contacts', target.userId);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        displayName: sanitizeDisplayName(target.displayName, target.userId),
        friendCode: target.friendCode || deriveFriendCode(target.userId),
        avatarId: sanitizeAvatarId(target.avatarId)
      });
    } else {
      await setDoc(ref, {
        contactUid: target.userId,
        displayName: sanitizeDisplayName(target.displayName, target.userId),
        friendCode: target.friendCode || deriveFriendCode(target.userId),
        avatarId: sanitizeAvatarId(target.avatarId),
        addedAt: serverTimestamp()
      });
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    throw err;
  }
}

export async function removeFriendContact(myUid: string, contactUid: string): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) return;
  const path = `users/${myUid}/contacts/${contactUid}`;
  const ref = doc(db, 'users', myUid, 'contacts', contactUid);
  try {
    await deleteDoc(ref);
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
    throw err;
  }
}

export async function findChatProfileByCodeOrUid(
  rawQuery: string,
  directory: ChatProfile[]
): Promise<ChatProfile | null> {
  const clean = String(rawQuery || '').trim();
  if (!clean) return null;

  const upperCode = clean.toUpperCase();
  const normalizedCode = upperCode.replace(/[^A-Z0-9]/g, '');

  const fromDirectory = directory.find((p) => {
    const pCode = (p.friendCode || '').toUpperCase();
    const pNorm = pCode.replace(/[^A-Z0-9]/g, '');
    return (
      p.userId === clean ||
      pCode === upperCode ||
      (normalizedCode.length >= 4 && pNorm === normalizedCode)
    );
  });
  if (fromDirectory) return fromDirectory;

  if (/^[a-zA-Z0-9_-]{12,128}$/.test(clean) && auth.currentUser) {
    const path = `${CHAT_PROFILES_COLLECTION}/${clean}`;
    try {
      const snap = await getDoc(doc(db, CHAT_PROFILES_COLLECTION, clean));
      if (snap.exists()) {
        return snap.data() as ChatProfile;
      }
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  }

  return null;
}

export function subscribeMyChatThreads(
  myUid: string,
  onUpdate: (threads: ChatThread[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!auth.currentUser || auth.currentUser.uid !== myUid) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, CHAT_THREADS_COLLECTION),
    where('participantUids', 'array-contains', myUid),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const t = d.data() as ChatThread;
        if (t?.threadId) knownExistingThreads.add(t.threadId);
        return t;
      });
      list.sort((a, b) => timestampToMs(b.updatedAt) - timestampToMs(a.updatedAt));
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, CHAT_THREADS_COLLECTION);
        } catch (wrapped) {
          onError?.(wrapped as Error);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}

export function subscribeThreadMessages(
  threadId: string,
  myUid: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!auth.currentUser || auth.currentUser.uid !== myUid || !threadId) {
    onUpdate([]);
    return () => {};
  }

  const path = `${CHAT_THREADS_COLLECTION}/${threadId}/messages`;
  const q = query(
    collection(db, CHAT_THREADS_COLLECTION, threadId, 'messages'),
    where('participantUids', 'array-contains', myUid),
    limit(300)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as ChatMessage);
      list.sort((a, b) => timestampToMs(a.createdAt) - timestampToMs(b.createdAt));
      onUpdate(list);
    },
    (err) => {
      if (isPermissionDeniedError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (wrapped) {
          onError?.(wrapped as Error);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
}

export async function openOrCreateDirectThread(params: {
  myProfile: Pick<ChatProfile, 'userId' | 'displayName' | 'avatarId'>;
  targetProfile: Pick<ChatProfile, 'userId' | 'displayName' | 'avatarId'>;
}): Promise<string> {
  const { myProfile, targetProfile } = params;
  if (!auth.currentUser || auth.currentUser.uid !== myProfile.userId) {
    throw new Error('Sign in to Firebase first to open a chat.');
  }
  if (myProfile.userId === targetProfile.userId) {
    throw new Error('Cannot open a chat with yourself.');
  }

  const meta = getCanonicalThreadMeta(myProfile.userId, targetProfile.userId);
  const path = `${CHAT_THREADS_COLLECTION}/${meta.threadId}`;
  const threadRef = doc(db, CHAT_THREADS_COLLECTION, meta.threadId);

  const isMeA = meta.userAUid === myProfile.userId;
  const userA = isMeA ? myProfile : targetProfile;
  const userB = isMeA ? targetProfile : myProfile;

  try {
    const snap = await getDoc(threadRef);
    if (!snap.exists()) {
      await setDoc(threadRef, {
        threadId: meta.threadId,
        userAUid: meta.userAUid,
        userBUid: meta.userBUid,
        participantUids: meta.participantUids,
        userAName: sanitizeDisplayName(userA.displayName, meta.userAUid),
        userBName: sanitizeDisplayName(userB.displayName, meta.userBUid),
        userAAvatarId: sanitizeAvatarId(userA.avatarId),
        userBAvatarId: sanitizeAvatarId(userB.avatarId),
        lastMessageText: '',
        lastMessageSenderUid: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    knownExistingThreads.add(meta.threadId);
    return meta.threadId;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    throw err;
  }
}

export async function sendDirectMessage(params: {
  myProfile: Pick<ChatProfile, 'userId' | 'displayName' | 'avatarId'>;
  targetProfile: Pick<ChatProfile, 'userId' | 'displayName' | 'avatarId'>;
  text: string;
  clientMessageId?: string;
}): Promise<string> {
  const cleanText = String(params.text || '').trim().slice(0, 1000);
  if (!cleanText) return '';

  const { myProfile, targetProfile } = params;
  if (!auth.currentUser || auth.currentUser.uid !== myProfile.userId) {
    throw new Error('Sign in to Firebase first to send messages.');
  }
  if (myProfile.userId === targetProfile.userId) {
    throw new Error('Cannot send a message to yourself.');
  }

  const meta = getCanonicalThreadMeta(myProfile.userId, targetProfile.userId);
  const threadRef = doc(db, CHAT_THREADS_COLLECTION, meta.threadId);
  const messageId = params.clientMessageId || createChatMessageId();
  const messageRef = doc(db, CHAT_THREADS_COLLECTION, meta.threadId, 'messages', messageId);

  const isMeA = meta.userAUid === myProfile.userId;
  const userA = isMeA ? myProfile : targetProfile;
  const userB = isMeA ? targetProfile : myProfile;

  const previewText = cleanText.slice(0, 300);
  const userAName = sanitizeDisplayName(userA.displayName, meta.userAUid);
  const userBName = sanitizeDisplayName(userB.displayName, meta.userBUid);
  const userAAvatarId = sanitizeAvatarId(userA.avatarId);
  const userBAvatarId = sanitizeAvatarId(userB.avatarId);

  const messagePayload = {
    id: messageId,
    threadId: meta.threadId,
    senderUid: myProfile.userId,
    senderName: sanitizeDisplayName(myProfile.displayName, myProfile.userId),
    senderAvatarId: sanitizeAvatarId(myProfile.avatarId),
    participantUids: meta.participantUids,
    text: cleanText,
    createdAt: serverTimestamp()
  };

  const path = `${CHAT_THREADS_COLLECTION}/${meta.threadId}/messages/${messageId}`;

  const commitAsUpdate = async () => {
    const batch = writeBatch(db);
    batch.update(threadRef, {
      userAName,
      userBName,
      userAAvatarId,
      userBAvatarId,
      lastMessageText: previewText,
      lastMessageSenderUid: myProfile.userId,
      updatedAt: serverTimestamp()
    });
    batch.set(messageRef, messagePayload);
    await batch.commit();
  };

  const commitWithExistenceCheck = async () => {
    const existingThreadSnap = await getDoc(threadRef);
    const batch = writeBatch(db);

    if (existingThreadSnap.exists()) {
      batch.update(threadRef, {
        userAName,
        userBName,
        userAAvatarId,
        userBAvatarId,
        lastMessageText: previewText,
        lastMessageSenderUid: myProfile.userId,
        updatedAt: serverTimestamp()
      });
    } else {
      batch.set(threadRef, {
        threadId: meta.threadId,
        userAUid: meta.userAUid,
        userBUid: meta.userBUid,
        participantUids: meta.participantUids,
        userAName,
        userBName,
        userAAvatarId,
        userBAvatarId,
        lastMessageText: previewText,
        lastMessageSenderUid: myProfile.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    batch.set(messageRef, messagePayload);
    await batch.commit();
    knownExistingThreads.add(meta.threadId);
  };

  try {
    if (knownExistingThreads.has(meta.threadId)) {
      try {
        await commitAsUpdate();
        return messageId;
      } catch (err) {
        const code = (err as { code?: string } | null)?.code;
        if (code === 'not-found') {
          knownExistingThreads.delete(meta.threadId);
          await commitWithExistenceCheck();
          return messageId;
        }
        throw err;
      }
    }

    await commitWithExistenceCheck();
    return messageId;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    throw err;
  }
}
