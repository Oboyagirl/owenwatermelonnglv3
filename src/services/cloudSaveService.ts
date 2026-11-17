import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider, ensureAuthPersistence, clearFirebaseAuthBackup, handleFirestoreError, OperationType } from './firebase';

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  avatarId?: string;
  favoriteGameIds?: string[];
  recentGameIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GameSave {
  id: string; // e.g. `${gameId}_${slot}`
  userId: string;
  gameId: string;
  slot: string; // "slot1", "slot2", "slot3", "auto", "manual"
  title?: string;
  saveData: string;
  saveType?: string; // "localstorage", "state", "json", "sol"
  score?: number;
  level?: string;
  deviceLabel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameStats {
  id: string;
  userId: string;
  gameId: string;
  playCount?: number;
  playTimeSeconds?: number;
  lastPlayedAt?: string;
  updatedAt?: string;
}

export const AVATAR_PRESETS = [
  { id: 'melon_classic', label: 'Classic Melon', icon: '🍉', color: '#10b981' },
  { id: 'melon_slice', label: 'Fresh Slice', icon: '🍈', color: '#06b6d4' },
  { id: 'ninja_gamer', label: 'Shadow Gamer', icon: '🥷', color: '#8b5cf6' },
  { id: 'arcade_star', label: 'Retro Joystick', icon: '🕹️', color: '#f59e0b' },
  { id: 'speed_runner', label: 'Speed Runner', icon: '⚡', color: '#ec4899' },
  { id: 'galaxy_melon', label: 'Space Watermelon', icon: '🚀', color: '#6366f1' },
  { id: 'crown_champ', label: 'High Score King', icon: '👑', color: '#eab308' },
  { id: 'stealth_spy', label: 'Stealth Agent', icon: '🕶️', color: '#64748b' }
];

export function detectDeviceLabel(): string {
  if (typeof window === 'undefined' || !window.navigator) return 'Web Browser';
  const ua = window.navigator.userAgent;
  let device = 'Computer';
  if (/CrOS/i.test(ua)) device = 'School Chromebook';
  else if (/Macintosh|Mac OS X/i.test(ua)) device = 'Mac';
  else if (/Windows NT/i.test(ua)) device = 'Windows PC';
  else if (/Android/i.test(ua)) device = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS Device';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  return `${device} (${browser})`;
}

// ---------------- INDEXEDDB + LOCAL MIRROR VAULT HELPERS ----------------
const VAULT_DB_NAME = 'owen_watermelon_cloud_vault';
const VAULT_STORE_NAME = 'saves';
const memoryVaultCache = new Map<string, GameSave[]>();

function getLocalVaultKey(userId: string): string {
  return `owen_cloud_vault_${userId}`;
}

function sortSavesDesc(list: GameSave[]): GameSave[] {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

function writeTinyLocalMirror(userId: string, saves: GameSave[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const serialized = JSON.stringify(saves);
    // Only keep mirror in localStorage when small enough not to crowd game quota
    if (serialized.length <= 120_000) {
      localStorage.setItem(getLocalVaultKey(userId), serialized);
    } else {
      localStorage.removeItem(getLocalVaultKey(userId));
    }
  } catch {
    // QuotaExceededError in localStorage is fine because IndexedDB holds the full vault
    try {
      localStorage.removeItem(getLocalVaultKey(userId));
    } catch {}
  }
}

function readLegacyLocalVault(userId: string): GameSave[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(getLocalVaultKey(userId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

let vaultWriteQueue: Promise<void> = Promise.resolve();

function withTimeoutFallback<T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(fallbackValue);
      }
    }, timeoutMs);

    promise.then(
      (val) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(val);
        }
      },
      () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(fallbackValue);
        }
      }
    );
  });
}

async function openVaultDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;
  const openPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const req = window.indexedDB.open(VAULT_DB_NAME, 1);
      req.onupgradeneeded = () => {
        try {
          const database = req.result;
          if (!database.objectStoreNames.contains(VAULT_STORE_NAME)) {
            database.createObjectStore(VAULT_STORE_NAME, { keyPath: 'userId' });
          }
        } catch {}
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return withTimeoutFallback(openPromise, 1500, null);
}

export async function loadVaultBackupsFromIDB(userId: string): Promise<GameSave[]> {
  const legacy = readLegacyLocalVault(userId);
  const database = await openVaultDB();
  if (!database) {
    const cached = memoryVaultCache.get(userId) || legacy;
    return sortSavesDesc(cached);
  }

  const readPromise = new Promise<GameSave[]>((resolve) => {
    let settled = false;
    const finish = (result: GameSave[]) => {
      if (settled) return;
      settled = true;
      try { database.close(); } catch {}
      resolve(result);
    };

    try {
      const tx = database.transaction(VAULT_STORE_NAME, 'readonly');
      tx.onabort = () => finish(sortSavesDesc(mergeSaves(memoryVaultCache.get(userId) || [], legacy)));
      tx.onerror = () => finish(sortSavesDesc(mergeSaves(memoryVaultCache.get(userId) || [], legacy)));
      const store = tx.objectStore(VAULT_STORE_NAME);
      const req = store.get(userId);
      req.onsuccess = () => {
        try {
          const record = req.result as { userId: string; saves?: GameSave[] } | undefined;
          const idbSaves = Array.isArray(record?.saves) ? record.saves : [];
          const merged = sortSavesDesc(mergeSaves(legacy, idbSaves));
          memoryVaultCache.set(userId, merged);
          if (legacy.length > 0 && idbSaves.length === 0) {
            void saveVaultBackupsToIDB(userId, merged);
          }
          finish(merged);
        } catch {
          finish(sortSavesDesc(mergeSaves(memoryVaultCache.get(userId) || [], legacy)));
        }
      };
      req.onerror = () => {
        finish(sortSavesDesc(mergeSaves(memoryVaultCache.get(userId) || [], legacy)));
      };
    } catch {
      finish(sortSavesDesc(mergeSaves(memoryVaultCache.get(userId) || [], legacy)));
    }
  });

  return withTimeoutFallback(
    readPromise,
    1800,
    sortSavesDesc(mergeSaves(memoryVaultCache.get(userId) || [], legacy))
  );
}

async function saveVaultBackupsToIDB(userId: string, saves: GameSave[]): Promise<void> {
  const sorted = sortSavesDesc(saves);
  memoryVaultCache.set(userId, sorted);
  writeTinyLocalMirror(userId, sorted);

  const runWrite = async () => {
    const database = await openVaultDB();
    if (!database) return;

    const writePromise = new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        try { database.close(); } catch {}
        resolve();
      };

      try {
        const tx = database.transaction(VAULT_STORE_NAME, 'readwrite');
        tx.oncomplete = finish;
        tx.onerror = finish;
        tx.onabort = finish;
        const store = tx.objectStore(VAULT_STORE_NAME);
        const putReq = store.put({ userId, saves: sorted, updatedAt: new Date().toISOString() });
        putReq.onerror = finish;
      } catch {
        finish();
      }
    });

    await withTimeoutFallback(writePromise, 2000, undefined);
  };

  vaultWriteQueue = vaultWriteQueue.then(runWrite, runWrite);
  await withTimeoutFallback(vaultWriteQueue, 2500, undefined);
}

export function getLocalBackups(userId: string): GameSave[] {
  const cached = memoryVaultCache.get(userId);
  const legacy = readLegacyLocalVault(userId);
  if (cached && cached.length > 0) {
    return sortSavesDesc(mergeSaves(legacy, cached));
  }
  if (legacy.length > 0) {
    memoryVaultCache.set(userId, legacy);
    return sortSavesDesc(legacy);
  }
  return [];
}

export function saveLocalBackup(userId: string, save: GameSave): void {
  const existing = getLocalBackups(userId);
  const filtered = existing.filter(s => s.id !== save.id);
  const updated = sortSavesDesc([save, ...filtered]);
  memoryVaultCache.set(userId, updated);
  writeTinyLocalMirror(userId, updated);
  void saveVaultBackupsToIDB(userId, updated);
}

export function deleteLocalBackup(userId: string, saveId: string): void {
  const existing = getLocalBackups(userId);
  const updated = existing.filter(s => s.id !== saveId);
  memoryVaultCache.set(userId, updated);
  writeTinyLocalMirror(userId, updated);
  void saveVaultBackupsToIDB(userId, updated);
}

export function syncLocalBackups(userId: string, saves: GameSave[]): void {
  const sorted = sortSavesDesc(saves);
  memoryVaultCache.set(userId, sorted);
  writeTinyLocalMirror(userId, sorted);
  void saveVaultBackupsToIDB(userId, sorted);
}

function mergeSaves(local: GameSave[], remote: GameSave[]): GameSave[] {
  const map = new Map<string, GameSave>();
  for (const s of local) {
    if (s && s.id) map.set(s.id, s);
  }
  for (const s of remote) {
    if (!s || !s.id) continue;
    const loc = map.get(s.id);
    if (!loc) {
      map.set(s.id, s);
    } else {
      const locTime = loc.updatedAt ? new Date(loc.updatedAt).getTime() : 0;
      const remTime = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
      if (remTime >= locTime) {
        map.set(s.id, s);
      }
    }
  }
  return sortSavesDesc(Array.from(map.values()));
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

const GUEST_STORAGE_KEY = 'owen_local_guest_session';
const SESSION_MODE_KEY = 'owen_session_mode';
const REMEMBERED_ACCOUNT_KEY = 'owen_remembered_account';

export type RememberedSessionMode = 'google' | 'guest' | 'signed_out';

export interface RememberedAccount {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  avatarId?: string;
  isAnonymous: boolean;
  lastSignedInAt: string;
}

export function markRememberedLogin(user: AppUser, avatarId?: string): void {
  if (typeof window === 'undefined' || !window.localStorage || !user?.uid) return;
  try {
    const mode: RememberedSessionMode = user.isAnonymous ? 'guest' : 'google';
    localStorage.setItem(SESSION_MODE_KEY, mode);
    const prevRaw = localStorage.getItem(REMEMBERED_ACCOUNT_KEY);
    let prevAvatar: string | undefined;
    if (prevRaw) {
      try {
        prevAvatar = (JSON.parse(prevRaw) as RememberedAccount).avatarId;
      } catch {}
    }
    const payload: RememberedAccount = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      avatarId: avatarId || prevAvatar || 'melon_classic',
      isAnonymous: Boolean(user.isAnonymous),
      lastSignedInAt: new Date().toISOString()
    };
    localStorage.setItem(REMEMBERED_ACCOUNT_KEY, JSON.stringify(payload));
  } catch {}
}

export function getRememberedLogin(): {
  mode: RememberedSessionMode | null;
  account: RememberedAccount | null;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { mode: null, account: null };
  }
  try {
    const rawMode = localStorage.getItem(SESSION_MODE_KEY) as RememberedSessionMode | null;
    const rawAcc = localStorage.getItem(REMEMBERED_ACCOUNT_KEY);
    const account = rawAcc ? (JSON.parse(rawAcc) as RememberedAccount) : null;
    const mode: RememberedSessionMode | null =
      rawMode === 'google' || rawMode === 'guest' || rawMode === 'signed_out' ? rawMode : null;
    return { mode, account };
  } catch {
    return { mode: null, account: null };
  }
}

export function clearRememberedLogin(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(SESSION_MODE_KEY, 'signed_out');
    localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
  } catch {}
}

export function getOrCreateLocalGuest(customName?: string): AppUser {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      uid: 'guest_default',
      displayName: customName || 'Player',
      email: null,
      photoURL: null,
      isAnonymous: true
    };
  }

  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppUser;
      if (customName && customName.trim()) {
        parsed.displayName = customName.trim();
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {}

  const newUid = `guest_${Math.random().toString(36).slice(2, 10)}`;
  const guestUser: AppUser = {
    uid: newUid,
    displayName: customName?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`,
    email: null,
    photoURL: null,
    isAnonymous: true
  };
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  } catch (e) {}
  return guestUser;
}

// ---------------- AUTHENTICATION METHODS ----------------

export async function loginWithGoogle(): Promise<AppUser> {
  try {
    await ensureAuthPersistence();
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      const existingUser: AppUser = {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL,
        isAnonymous: false
      };
      const prof = await syncInitialProfile(existingUser);
      markRememberedLogin(existingUser, prof.avatarId);
      return existingUser;
    }

    const cred = await signInWithPopup(auth, googleProvider);
    const appUser: AppUser = {
      uid: cred.user.uid,
      displayName: cred.user.displayName,
      email: cred.user.email,
      photoURL: cred.user.photoURL,
      isAnonymous: false
    };
    const prof = await syncInitialProfile(appUser);
    markRememberedLogin(appUser, prof.avatarId);
    return appUser;
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
}

export async function loginAsGuest(customName?: string): Promise<AppUser> {
  // Try Firebase anonymous login, and if project has admin-only restriction, fallback to local guest session
  await ensureAuthPersistence();
  try {
    const activeFbUser = auth.currentUser;
    if (activeFbUser) {
      const existingName = customName?.trim() || activeFbUser.displayName || `Player_${activeFbUser.uid.slice(0, 5)}`;
      const appUser: AppUser = {
        uid: activeFbUser.uid,
        displayName: existingName,
        email: activeFbUser.email,
        photoURL: activeFbUser.photoURL,
        isAnonymous: activeFbUser.isAnonymous
      };
      const prof = await syncInitialProfile(appUser, existingName);
      markRememberedLogin(appUser, prof.avatarId);
      return appUser;
    }

    const cred = await signInAnonymously(auth);
    const generatedName = customName?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    const appUser: AppUser = {
      uid: cred.user.uid,
      displayName: cred.user.displayName || generatedName,
      email: null,
      photoURL: null,
      isAnonymous: true
    };
    const prof = await syncInitialProfile(appUser, generatedName);
    markRememberedLogin(appUser, prof.avatarId);
    return appUser;
  } catch (err: any) {
    console.warn("Using instant local guest session (Firebase anonymous auth bypassed):", err?.message || err);
    const localGuest = getOrCreateLocalGuest(customName);
    const prof = await syncInitialProfile(localGuest, customName);
    markRememberedLogin(localGuest, prof.avatarId);
    return localGuest;
  }
}

export async function logoutUser(): Promise<void> {
  clearRememberedLogin();
  clearFirebaseAuthBackup();
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (e) {}
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  }
}

export function subscribeToAuth(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback({
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        isAnonymous: fbUser.isAnonymous
      });
    } else {
      const guest = getOrCreateLocalGuest();
      callback(guest);
    }
  });
}

// ---------------- USER PROFILE METHODS ----------------

export async function syncInitialProfile(user: AppUser, fallbackName?: string): Promise<UserProfile> {
  const localProfKey = `owen_profile_${user.uid}`;
  let localProf: UserProfile | null = null;
  let globalCachedProf: UserProfile | null = null;
  let rememberedProf: RememberedAccount | null = null;
  try {
    const raw = localStorage.getItem(localProfKey);
    if (raw) localProf = JSON.parse(raw);
  } catch (e) {}
  try {
    const rawGlobal = localStorage.getItem('owen_gamer_profile');
    if (rawGlobal) globalCachedProf = JSON.parse(rawGlobal);
  } catch (e) {}
  try {
    rememberedProf = getRememberedLogin().account;
  } catch (e) {}

  const previousProfileFallback =
    localProf ||
    (globalCachedProf && (!globalCachedProf.userId || globalCachedProf.userId === user.uid || user.isAnonymous)
      ? globalCachedProf
      : null);

  const displayName =
    (
      user.displayName ||
      fallbackName ||
      previousProfileFallback?.displayName ||
      rememberedProf?.displayName ||
      `Player_${user.uid.slice(0, 5)}`
    ).trim() || 'Player';
  const newProfile: UserProfile = {
    userId: user.uid,
    displayName: displayName.slice(0, 60),
    photoURL: (user.photoURL || previousProfileFallback?.photoURL || rememberedProf?.photoURL || '').slice(0, 500),
    avatarId: (previousProfileFallback?.avatarId || rememberedProf?.avatarId || 'melon_classic').slice(0, 64),
    favoriteGameIds: Array.isArray(previousProfileFallback?.favoriteGameIds)
      ? previousProfileFallback.favoriteGameIds.slice(0, 100)
      : [],
    recentGameIds: Array.isArray(previousProfileFallback?.recentGameIds)
      ? previousProfileFallback.recentGameIds.slice(0, 50)
      : [],
    createdAt:
      typeof previousProfileFallback?.createdAt === 'string'
        ? previousProfileFallback.createdAt.slice(0, 64)
        : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(localProfKey, JSON.stringify(newProfile));
  } catch (e) {}

  if (auth.currentUser && auth.currentUser.uid === user.uid) {
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const remote = snap.data() as UserProfile;
        try {
          localStorage.setItem(localProfKey, JSON.stringify(remote));
        } catch {}
        return remote;
      }
      await setDoc(ref, newProfile);
    } catch (e) {
      console.warn("Firestore profile sync warning:", e);
    }
  }

  return newProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const localProfKey = `owen_profile_${userId}`;
  let localProf: UserProfile | null = null;
  try {
    const raw = localStorage.getItem(localProfKey);
    if (raw) localProf = JSON.parse(raw);
  } catch (e) {}

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const remoteProf = snap.data() as UserProfile;
        try {
          localStorage.setItem(localProfKey, JSON.stringify(remoteProf));
        } catch (e) {}
        return remoteProf;
      }
    } catch (e) {
      console.warn("Firestore getUserProfile warning:", e);
    }
  }

  return localProf;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const localProfKey = `owen_profile_${userId}`;
  const existing = (await getUserProfile(userId)) || {
    userId,
    displayName: 'Player',
    avatarId: 'melon_classic',
    createdAt: new Date().toISOString()
  };

  const cleanPhotoUrl =
    updates.photoURL !== undefined
      ? updates.photoURL || ''
      : existing.photoURL || '';

  const finalProfile: UserProfile = {
    userId,
    displayName: (updates.displayName ?? existing.displayName ?? 'Player').trim().slice(0, 60) || 'Player',
    photoURL: cleanPhotoUrl.slice(0, 500),
    avatarId: (updates.avatarId ?? existing.avatarId ?? 'melon_classic').slice(0, 64),
    favoriteGameIds: Array.isArray(updates.favoriteGameIds)
      ? updates.favoriteGameIds.slice(0, 100)
      : existing.favoriteGameIds || [],
    recentGameIds: Array.isArray(updates.recentGameIds)
      ? updates.recentGameIds.slice(0, 50)
      : existing.recentGameIds || [],
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(localProfKey, JSON.stringify(finalProfile));
  } catch (e) {}

  if (auth.currentUser && auth.currentUser.uid === userId) {
    const path = `users/${userId}`;
    try {
      const ref = doc(db, 'users', userId);
      await setDoc(ref, finalProfile);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
      console.warn("Firestore updateUserProfile warning:", error);
    }
  }

  return finalProfile;
}

// ---------------- CLOUD GAME SAVES METHODS ----------------

export async function getUserGameSaves(userId: string): Promise<GameSave[]> {
  const idbLocal = await loadVaultBackupsFromIDB(userId);
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return idbLocal;
  }

  const path = `users/${userId}/saves`;
  try {
    const coll = collection(db, 'users', userId, 'saves');
    const snap = await getDocs(coll);
    const remoteSaves = snap.docs.map(d => d.data() as GameSave);
    const merged = mergeSaves(idbLocal, remoteSaves);
    await saveVaultBackupsToIDB(userId, merged);
    return merged;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.warn("getUserGameSaves using local cache fallback:", error);
    return idbLocal;
  }
}

export function subscribeToUserGameSaves(userId: string, callback: (saves: GameSave[]) => void) {
  let active = true;

  // Immediately feed current in-memory/legacy saves
  const initialLocal = getLocalBackups(userId);
  callback(initialLocal);

  // Hydrate full IndexedDB vault asynchronously
  void loadVaultBackupsFromIDB(userId).then((idbSaves) => {
    if (!active) return;
    const latestCached = getLocalBackups(userId);
    callback(mergeSaves(latestCached, idbSaves));
  });

  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {
      active = false;
    };
  }

  const path = `users/${userId}/saves`;
  const coll = collection(db, 'users', userId, 'saves');

  const unsubSnapshot = onSnapshot(
    coll,
    (snapshot) => {
      if (!active) return;
      const remoteSaves = snapshot.docs.map(d => d.data() as GameSave);
      const currentLocal = getLocalBackups(userId);
      const merged = mergeSaves(currentLocal, remoteSaves);
      syncLocalBackups(userId, merged);
      callback(merged);
    },
    (error) => {
      if (!active) return;
      console.warn("subscribeToUserGameSaves snapshot warning, using local mirror:", path, error);
      callback(getLocalBackups(userId));
    }
  );

  return () => {
    active = false;
    unsubSnapshot();
  };
}

export async function migrateLocalGuestSavesToUser(guestUid: string, targetUid: string): Promise<number> {
  if (!guestUid || !targetUid || guestUid === targetUid) return 0;
  const guestSaves = await loadVaultBackupsFromIDB(guestUid);
  if (guestSaves.length === 0) return 0;

  const targetSaves = await loadVaultBackupsFromIDB(targetUid);
  let migratedCount = 0;
  const updatedTarget = [...targetSaves];

  for (const gSave of guestSaves) {
    const migratedDoc: GameSave = {
      ...gSave,
      userId: targetUid
    };
    const existingIdx = updatedTarget.findIndex(s => s.id === migratedDoc.id);
    if (existingIdx >= 0) {
      const existingTime = new Date(updatedTarget[existingIdx].updatedAt || updatedTarget[existingIdx].createdAt || 0).getTime();
      const guestTime = new Date(migratedDoc.updatedAt || migratedDoc.createdAt || 0).getTime();
      if (guestTime <= existingTime) continue;
      updatedTarget[existingIdx] = migratedDoc;
    } else {
      updatedTarget.push(migratedDoc);
    }

    if (auth.currentUser && auth.currentUser.uid === targetUid) {
      try {
        const fitted = fitSavePayloadString(migratedDoc.saveData, 485000);
        const docToPush: GameSave = { ...migratedDoc, saveData: fitted };
        await setDoc(doc(db, 'users', targetUid, 'saves', docToPush.id), docToPush);
      } catch (err) {
        console.warn('Could not upload migrated guest save:', err);
      }
    }
    migratedCount++;
  }

  await saveVaultBackupsToIDB(targetUid, updatedTarget);
  return migratedCount;
}

export function formatExactTimestamp(isoString?: string): string {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return 'Recently';
  }
}

export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    const now = Date.now();
    const diffMs = now - d.getTime();
    if (diffMs < 0 || isNaN(diffMs)) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function formatSaveBytes(bytesOrChars: number): string {
  if (!bytesOrChars || bytesOrChars <= 0) return '0 B';
  if (bytesOrChars < 1024) return `${bytesOrChars} B`;
  const kb = bytesOrChars / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export interface SaveSlotResult {
  save: GameSave;
  cloudSynced: boolean;
  cloudError?: string;
}

function getUtf8ByteLength(str: string): number {
  if (!str) return 0;
  try {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str).length;
    }
  } catch {}
  return str.length;
}

function fitsSaveBudget(str: string, maxChars: number): boolean {
  return str.length <= maxChars && getUtf8ByteLength(str) <= maxChars;
}

/**
 * Compacts JSON save data without ever slicing mid-string and corrupting JSON.
 */
export function fitSavePayloadString(rawData: string, maxChars = 485000): string {
  const raw = rawData || '';
  if (fitsSaveBudget(raw, maxChars)) return raw;

  try {
    const obj = JSON.parse(raw) as Partial<UniversalSavePayload> & Record<string, any>;
    // 1. Remove duplicate legacy localStorageSnapshot if storage.localStorage already exists
    if (obj.storage?.localStorage && obj.localStorageSnapshot) {
      delete obj.localStorageSnapshot;
    }
    let candidate = JSON.stringify(obj);
    if (fitsSaveBudget(candidate, maxChars)) return candidate;

    // 2. Drop sessionStorage
    if (obj.storage?.sessionStorage) {
      delete obj.storage.sessionStorage;
      candidate = JSON.stringify(obj);
      if (fitsSaveBudget(candidate, maxChars)) return candidate;
    }

    // 3. Remove largest IndexedDB database snapshots one by one
    if (Array.isArray(obj.indexedDB) && obj.indexedDB.length > 0) {
      const sortedDbs = [...obj.indexedDB].sort(
        (a, b) => JSON.stringify(a).length - JSON.stringify(b).length
      );
      while (sortedDbs.length > 0 && !fitsSaveBudget(candidate, maxChars)) {
        sortedDbs.pop();
        obj.indexedDB = sortedDbs.length > 0 ? sortedDbs : undefined;
        candidate = JSON.stringify(obj);
      }
      if (fitsSaveBudget(candidate, maxChars)) return candidate;
    }

    // 4. Prune largest localStorage entries until within Firestore limit
    const ls = obj.storage?.localStorage;
    if (ls && typeof ls === 'object') {
      const keysBySize = Object.keys(ls).sort((a, b) => (ls[b]?.length || 0) - (ls[a]?.length || 0));
      for (const k of keysBySize) {
        if (fitsSaveBudget(candidate, maxChars)) break;
        delete ls[k];
        obj.keysCount = Object.keys(ls).length + (obj.emulator ? 1 : 0);
        candidate = JSON.stringify(obj);
      }
      if (fitsSaveBudget(candidate, maxChars)) return candidate;
    }

    return fitsSaveBudget(candidate, maxChars)
      ? candidate
      : JSON.stringify({
          version: 2,
          capturedAt: obj.capturedAt || new Date().toISOString(),
          gameId: obj.gameId || 'game',
          device: obj.device || detectDeviceLabel(),
          keysCount: 0,
          prunedTooLarge: true
        });
  } catch {
    throw new Error('Save data exceeds the 485 KB Cloud Save limit.');
  }
}

export async function saveGameSlotWithStatus(
  userId: string,
  gameId: string,
  slot: string,
  payload: {
    title?: string;
    saveData: string;
    saveType?: string;
    score?: number;
    level?: string;
    deviceLabel?: string;
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<SaveSlotResult> {
  // Sanitize saveId to conform strictly to isValidId regex ^[a-zA-Z0-9_\-]+$ and max 32 chars for slot
  const safeGameId = (typeof gameId === 'string' ? gameId.trim() : '') || 'game';
  const cleanGameId = (safeGameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60)) || 'game';
  const cleanSlot = ((typeof slot === 'string' ? slot : 'slot1').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 32)) || 'slot1';
  const saveId = `${cleanGameId}_${cleanSlot}`;
  const path = `users/${userId}/saves/${saveId}`;

  const safeCloudData = fitSavePayloadString(payload.saveData || '', 480000);
  const fullLocalData = payload.saveData || safeCloudData;

  const now = new Date().toISOString();
  const exactTimeStr = formatExactTimestamp(now);

  // Find if previous version existed to preserve initial createdAt
  const existingBackups = await loadVaultBackupsFromIDB(userId);
  const existing = existingBackups.find(s => s.id === saveId);

  const finalTitle =
    payload.title && payload.title.trim().length > 0 && payload.title !== safeGameId
      ? payload.title.trim()
      : `Checkpoint (${exactTimeStr})`;

  const rawCreatedAt =
    typeof payload.createdAt === 'string' && payload.createdAt
      ? payload.createdAt
      : typeof existing?.createdAt === 'string' && existing.createdAt
      ? existing.createdAt
      : now;

  // Local backup preserves full payload (can be larger than 480KB if needed)
  const localDoc: GameSave = {
    id: saveId,
    userId,
    gameId: safeGameId.slice(0, 128),
    slot: cleanSlot,
    title: finalTitle.slice(0, 120),
    saveData: fullLocalData,
    saveType: (payload.saveType || 'universal').slice(0, 32),
    deviceLabel: (payload.deviceLabel || detectDeviceLabel()).slice(0, 128),
    createdAt: rawCreatedAt.slice(0, 64),
    updatedAt: now.slice(0, 64)
  };

  if (typeof payload.score === 'number' && Number.isFinite(payload.score)) {
    localDoc.score = payload.score;
  }
  if (typeof payload.level === 'string' && payload.level.trim().length > 0) {
    localDoc.level = payload.level.trim().slice(0, 60);
  }

  // 1. Save to IndexedDB Vault immediately so progress persists on this device
  const updatedList = [localDoc, ...existingBackups.filter(s => s.id !== localDoc.id)];
  await saveVaultBackupsToIDB(userId, updatedList);

  // 2. Synchronize to Firestore database ONLY when authenticated with matching Firebase UID
  const isFirebaseSignedIn = Boolean(auth.currentUser && auth.currentUser.uid === userId);
  if (!isFirebaseSignedIn) {
    return {
      save: localDoc,
      cloudSynced: false,
      cloudError: 'Saved locally on this device. Sign in with Google to sync across devices.'
    };
  }

  const cloudDoc: GameSave = {
    ...localDoc,
    saveData: safeCloudData
  };

  try {
    const ref = doc(db, 'users', userId, 'saves', saveId);
    const writeRace = await Promise.race([
      setDoc(ref, cloudDoc).then(() => 'ok' as const),
      new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 6000))
    ]);

    if (writeRace === 'timeout') {
      return {
        save: localDoc,
        cloudSynced: false,
        cloudError: 'Saved to Device Vault. Cloud sync is still pending on this network.'
      };
    }

    return {
      save: localDoc,
      cloudSynced: true
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.warn("Firestore saveGameSlot remote sync warning:", error);
    return {
      save: localDoc,
      cloudSynced: false,
      cloudError: msg || 'Saved to device; cloud sync unavailable offline.'
    };
  }
}

export async function saveGameSlot(
  userId: string,
  gameId: string,
  slot: string,
  payload: {
    title?: string;
    saveData: string;
    saveType?: string;
    score?: number;
    level?: string;
    deviceLabel?: string;
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<GameSave> {
  const result = await saveGameSlotWithStatus(userId, gameId, slot, payload);
  return result.save;
}

export async function deleteGameSlot(userId: string, gameId: string, slot: string): Promise<void> {
  const cleanGameId = (gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60)) || 'game';
  const cleanSlot = (slot.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 32)) || 'slot1';
  const saveId = `${cleanGameId}_${cleanSlot}`;
  const path = `users/${userId}/saves/${saveId}`;

  // 1. Delete from IndexedDB + local mirror immediately
  const existing = await loadVaultBackupsFromIDB(userId);
  await saveVaultBackupsToIDB(userId, existing.filter(s => s.id !== saveId));

  // 2. Delete from Firestore if signed in
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const ref = doc(db, 'users', userId, 'saves', saveId);
      await deleteDoc(ref);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('insufficient')) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
      console.warn("Firestore deleteGameSlot remote warning:", error);
    }
  }
}

// ---------------- UNIVERSAL MULTI-ENGINE GAME STATE SYSTEM ----------------

export interface IDBStoreRecord {
  key: any;
  value: any;
}

export interface IDBStoreSnapshot {
  storeName: string;
  records: IDBStoreRecord[];
}

export interface IDBDatabaseSnapshot {
  dbName: string;
  version?: number;
  stores: IDBStoreSnapshot[];
}

export interface UniversalSavePayload {
  version: 2;
  capturedAt: string;
  gameId: string;
  device: string;
  keysCount: number;
  storage?: {
    localStorage: Record<string, string>;
    sessionStorage?: Record<string, string>;
  };
  // Legacy compatibility field
  localStorageSnapshot?: Record<string, string>;
  indexedDB?: IDBDatabaseSnapshot[];
  emulator?: {
    stateBase64?: string;
    saveFileBase64?: string;
    core?: string;
    gameName?: string;
  };
  manualCode?: string;
  saveFileName?: string;
  saveFileBase64?: string;
  bookmarkNote?: string;
  level?: string;
  score?: number;
  mirrorUrl?: string;
}

export function createCodeSavePayload(gameId: string, manualCode: string): string {
  const payload: UniversalSavePayload = {
    version: 2,
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    keysCount: 1,
    manualCode
  };
  return JSON.stringify(payload);
}

export function createFileSavePayload(gameId: string, saveFileName: string, saveFileBase64: string): string {
  const payload: UniversalSavePayload = {
    version: 2,
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    keysCount: 1,
    saveFileName,
    saveFileBase64
  };
  return JSON.stringify(payload);
}

export function createBookmarkSavePayload(
  gameId: string,
  options: {
    note?: string;
    level?: string;
    score?: number;
    mirrorUrl?: string;
  }
): string {
  const payload: UniversalSavePayload = {
    version: 2,
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    keysCount: 1,
    bookmarkNote: options.note?.trim() || 'Progress Bookmark',
    ...(options.level?.trim() ? { level: options.level.trim() } : {}),
    ...(typeof options.score === 'number' && Number.isFinite(options.score) ? { score: options.score } : {}),
    ...(options.mirrorUrl?.trim() ? { mirrorUrl: options.mirrorUrl.trim() } : {})
  };
  return JSON.stringify(payload);
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  try {
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  } catch (e) {
    console.warn("uint8ArrayToBase64 conversion error:", e);
    return '';
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.warn("base64ToUint8Array conversion error:", e);
    return new Uint8Array(0);
  }
}

const APP_INTERNAL_KEYS = new Set([
  'theme',
  'custom_theme',
  'custom_theme_config',
  'ubg_custom_theme',
  'ubg_theme',
  'gamer_profile',
  'user_favorites',
  'game_favorites',
  'recently_played_games',
  'recently_played',
  'custom_games',
  'custom_games_catalog',
  'pinned_games',
  'search_history',
  'owen_gamer_profile',
  'owen_local_guest_session',
  'owen_session_mode',
  'owen_remembered_account',
  'owen_fb_auth_backup_v1',
  'owen_site_explicitly_locked',
  'owen_chat_discoverable',
  'owen_chat_keep_open',
  'owen_autosave_enabled',
  'owen_game_overrides_v2',
  'owen_creator_mode_active',
  'owen_theme_id',
  'owen_custom_theme',
  'owen_active_cloak',
  'owen_panic_url',
  'owen_sidebar_collapsed',
  'owen_notes',
  'owen_custom_music_list',
  'owen_liked_music',
  'owen_music_volume',
  'owen_music_stream_mode',
  'owen_apple_cdn_cache_v1'
]);

const APP_INTERNAL_PREFIXES = [
  'owen_cloud_vault_',
  'owen_profile_',
  'owen_watermelon_',
  'owen_chess_',
  'auth_',
  'guest_profile',
  'local_backup',
  'local_backups_',
  'firebase:',
  'loglevel:',
  'petezah_'
];

export function isAppInternalKey(key: string): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  if (APP_INTERNAL_KEYS.has(lower)) return true;
  for (const prefix of APP_INTERNAL_PREFIXES) {
    if (lower.startsWith(prefix)) return true;
  }
  return false;
}

const EXCLUDED_IDB_NAMES = new Set([
  VAULT_DB_NAME,
  'firebaselocalstoragedb',
  'firebase-heartbeat-database',
  'firebase-installations-database',
  'unitycache',
  'emulatorjs-roms',
  'workbox-precache',
  'workbox-expiration'
]);

export function isExcludedIndexedDBName(name: string): boolean {
  if (!name) return true;
  const lower = name.toLowerCase();
  if (EXCLUDED_IDB_NAMES.has(lower)) return true;
  if (lower.startsWith('workbox-') || lower.startsWith('firebase')) return true;
  return false;
}

/**
 * Serializes IndexedDB record values into JSON-safe representations (cycle & depth guarded)
 */
function serializeIDBValue(val: any, depth = 0, seen?: WeakSet<object>): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  if (typeof val === 'bigint') return val.toString();
  if (typeof val === 'function' || typeof val === 'symbol') return undefined;
  if (depth > 10) return undefined;

  if (val instanceof Date) return val.toISOString();
  if (val instanceof ArrayBuffer) {
    if (val.byteLength > 2_000_000) return undefined;
    return { __idbType: 'ArrayBuffer', data: uint8ArrayToBase64(new Uint8Array(val)) };
  }
  if (ArrayBuffer.isView(val)) {
    if (val.byteLength > 2_000_000) return undefined;
    return { __idbType: 'Uint8Array', data: uint8ArrayToBase64(new Uint8Array(val.buffer, val.byteOffset, val.byteLength)) };
  }
  if (typeof Blob !== 'undefined' && val instanceof Blob) {
    return { __idbType: 'Blob', mime: val.type, data: '' };
  }
  if (typeof val === 'object') {
    const visited = seen || new WeakSet<object>();
    if (visited.has(val)) return undefined;
    visited.add(val);
    try {
      if (Array.isArray(val)) {
        return val.slice(0, 500).map((item) => serializeIDBValue(item, depth + 1, visited));
      }
      const copy: Record<string, any> = {};
      const entries = Object.entries(val).slice(0, 200);
      for (const [k, v] of entries) {
        const serialized = serializeIDBValue(v, depth + 1, visited);
        if (serialized !== undefined) {
          copy[k] = serialized;
        }
      }
      return copy;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Deserializes JSON representations back to original IndexedDB objects
 */
function deserializeIDBValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    if (val.__idbType === 'ArrayBuffer' && typeof val.data === 'string') {
      return base64ToUint8Array(val.data).buffer;
    }
    if (val.__idbType === 'Uint8Array' && typeof val.data === 'string') {
      return base64ToUint8Array(val.data);
    }
    if (Array.isArray(val)) {
      return val.map(deserializeIDBValue);
    }
    const copy: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      copy[k] = deserializeIDBValue(v);
    }
    return copy;
  }
  return val;
}

async function snapshotSingleIDB(idbFactory: IDBFactory, dbName: string): Promise<IDBDatabaseSnapshot | null> {
  const snapPromise = new Promise<IDBDatabaseSnapshot | null>((resolve) => {
    let settled = false;
    let openedDb: IDBDatabase | null = null;
    const finish = (res: IDBDatabaseSnapshot | null) => {
      if (settled) return;
      settled = true;
      try { openedDb?.close(); } catch {}
      resolve(res);
    };

    try {
      const req = idbFactory.open(dbName);
      req.onerror = () => finish(null);
      req.onblocked = () => finish(null);
      req.onupgradeneeded = () => {
        // Do NOT keep newly created empty DBs around; abort upgrade cleanly if DB did not exist
        try {
          req.transaction?.abort();
        } catch {}
        finish(null);
      };
      req.onsuccess = async () => {
        const db = req.result;
        openedDb = db;
        try {
          const storeNames = Array.from(db.objectStoreNames);
          if (!storeNames.length) {
            return finish(null);
          }

          const stores: IDBStoreSnapshot[] = [];
          for (const storeName of storeNames) {
            try {
              const tx = db.transaction(storeName, 'readonly');
              const store = tx.objectStore(storeName);
              const records: IDBStoreRecord[] = await new Promise((resStore) => {
                let storeSettled = false;
                const doneStore = (recs: IDBStoreRecord[]) => {
                  if (storeSettled) return;
                  storeSettled = true;
                  resStore(recs);
                };
                tx.onabort = () => doneStore([]);
                tx.onerror = () => doneStore([]);

                const recs: IDBStoreRecord[] = [];
                const cursorReq = store.openCursor();
                cursorReq.onsuccess = (e: any) => {
                  try {
                    const cursor = e.target?.result;
                    if (cursor && recs.length < 250) {
                      recs.push({
                        key: cursor.key,
                        value: serializeIDBValue(cursor.value)
                      });
                      cursor.continue();
                    } else {
                      doneStore(recs);
                    }
                  } catch {
                    doneStore(recs);
                  }
                };
                cursorReq.onerror = () => doneStore(recs);
              });
              if (records.length > 0) {
                stores.push({ storeName, records });
              }
            } catch {
              // skip failed store
            }
          }
          finish(stores.length ? { dbName, version: db.version, stores } : null);
        } catch {
          finish(null);
        }
      };
    } catch {
      finish(null);
    }
  });

  return withTimeoutFallback(snapPromise, 1500, null);
}

/**
 * Snapshots relevant IndexedDB databases (e.g. EmulatorJS saves/states, Unity, Construct)
 */
async function snapshotIndexedDB(targetWindow: Window | null): Promise<IDBDatabaseSnapshot[]> {
  if (!targetWindow || !targetWindow.indexedDB) return [];
  const results: IDBDatabaseSnapshot[] = [];

  try {
    const dbNamesToInspect = new Set<string>();
    let enumeratedViaApi = false;

    if (typeof targetWindow.indexedDB.databases === 'function') {
      try {
        const dbs = await withTimeoutFallback(
          targetWindow.indexedDB.databases().catch(() => []),
          1000,
          []
        );
        enumeratedViaApi = true;
        for (const d of dbs) {
          if (d.name && !isExcludedIndexedDBName(d.name)) {
            dbNamesToInspect.add(d.name);
          }
        }
      } catch {
        enumeratedViaApi = false;
      }
    }

    if (!enumeratedViaApi) {
      for (const fallbackName of [
        'EmulatorJS-saves',
        'EmulatorJS-states',
        'EJS_SAVES',
        'keyval-store',
        'idbfs',
        '/idbfs',
        'localforage',
        'ruffle',
        'ruffle_storage'
      ]) {
        dbNamesToInspect.add(fallbackName);
      }
    }

    for (const name of Array.from(dbNamesToInspect)) {
      if (isExcludedIndexedDBName(name)) continue;
      try {
        const snap = await snapshotSingleIDB(targetWindow.indexedDB, name);
        if (snap) results.push(snap);
      } catch {
        // skip
      }
    }
  } catch (err) {
    console.warn("snapshotIndexedDB error:", err);
  }
  return results;
}

/**
 * Restores an IndexedDB database snapshot
 */
async function restoreSingleIDB(idbFactory: IDBFactory, snapshot: IDBDatabaseSnapshot): Promise<boolean> {
  if (isExcludedIndexedDBName(snapshot.dbName)) return false;
  return new Promise((resolve) => {
    try {
      const openReq = idbFactory.open(snapshot.dbName, snapshot.version);
      openReq.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        for (const s of snapshot.stores) {
          if (!db.objectStoreNames.contains(s.storeName)) {
            db.createObjectStore(s.storeName);
          }
        }
      };
      openReq.onerror = () => resolve(false);
      openReq.onblocked = () => resolve(false);
      openReq.onsuccess = () => {
        const db = openReq.result;
        try {
          const validStores = snapshot.stores.filter(s => db.objectStoreNames.contains(s.storeName));
          if (!validStores.length) {
            db.close();
            return resolve(true);
          }
          const tx = db.transaction(validStores.map(s => s.storeName), 'readwrite');
          for (const s of validStores) {
            const store = tx.objectStore(s.storeName);
            try {
              store.clear();
            } catch {}
            for (const rec of s.records) {
              const deserialized = deserializeIDBValue(rec.value);
              try {
                if (store.keyPath) {
                  store.put(deserialized);
                } else {
                  store.put(deserialized, rec.key);
                }
              } catch (e) {
                // skip individual failed record
              }
            }
          }
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            resolve(false);
          };
        } catch {
          db.close();
          resolve(false);
        }
      };
    } catch {
      resolve(false);
    }
  });
}

export interface UniversalCaptureResult {
  saveData: string;
  capturedKeysCount: number;
  idbDatabasesCount: number;
  hasEmulatorState: boolean;
  crossOriginBlocked: boolean;
}

function canInspectWindow(win: Window | null | undefined): boolean {
  if (!win) return false;
  try {
    void win.localStorage.length;
    return true;
  } catch {
    return false;
  }
}

export function isWindowCrossOriginBlocked(win: Window | null | undefined): boolean {
  if (!win) return false;
  return !canInspectWindow(win);
}

async function tryPostMessageCapture(
  contentWindow: Window,
  gameId: string
): Promise<Record<string, string> | null> {
  if (typeof window === 'undefined') return null;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (res: Record<string, string> | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMsg);
      resolve(res);
    };

    const onMsg = (ev: MessageEvent) => {
      try {
        const d = ev.data;
        if (!d || typeof d !== 'object') return;
        if (d.type === 'UNIVERSAL_GAME_CAPTURE_RESPONSE' || d.type === 'GAME_SAVE_CAPTURE') {
          const storage = d.storage?.localStorage || d.localStorage || d.saveData;
          if (storage && typeof storage === 'object' && Object.keys(storage).length > 0) {
            const clean: Record<string, string> = {};
            for (const [k, v] of Object.entries(storage)) {
              clean[String(k)] = typeof v === 'string' ? v : JSON.stringify(v);
            }
            finish(clean);
          }
        }
      } catch {}
    };

    window.addEventListener('message', onMsg);
    try {
      contentWindow.postMessage({ type: 'UNIVERSAL_GAME_CAPTURE_REQUEST', gameId }, '*');
    } catch {}
    window.setTimeout(() => finish(null), 350);
  });
}

export async function captureUniversalGameStateDetailed(
  gameId: string,
  contentWindow?: Window | null
): Promise<UniversalCaptureResult> {
  const collectedStorage: Record<string, string> = {};
  const collectedSession: Record<string, string> = {};
  let emulatorData: UniversalSavePayload['emulator'] | undefined = undefined;

  const iframeWasProvided = Boolean(contentWindow);
  const iframeAccessible = contentWindow ? canInspectWindow(contentWindow) : false;
  const crossOriginBlocked = iframeWasProvided && !iframeAccessible;

  // If the iframe runs on an external cross-origin domain, attempt friendly postMessage capture first;
  // otherwise signal crossOriginBlocked cleanly without scraping unrelated parent-origin keys.
  if (crossOriginBlocked && contentWindow) {
    const pmStorage = await tryPostMessageCapture(contentWindow, gameId);
    if (pmStorage && Object.keys(pmStorage).length > 0) {
      const pmPayload: UniversalSavePayload = {
        version: 2,
        capturedAt: new Date().toISOString(),
        gameId,
        device: detectDeviceLabel(),
        keysCount: Object.keys(pmStorage).length,
        storage: { localStorage: pmStorage }
      };
      return {
        saveData: fitSavePayloadString(JSON.stringify(pmPayload), 480000),
        capturedKeysCount: Object.keys(pmStorage).length,
        idbDatabasesCount: 0,
        hasEmulatorState: false,
        crossOriginBlocked: false
      };
    }

    const blockedPayload: UniversalSavePayload = {
      version: 2,
      capturedAt: new Date().toISOString(),
      gameId,
      device: detectDeviceLabel(),
      keysCount: 0,
      storage: { localStorage: {} }
    };
    return {
      saveData: JSON.stringify(blockedPayload),
      capturedKeysCount: 0,
      idbDatabasesCount: 0,
      hasEmulatorState: false,
      crossOriginBlocked: true
    };
  }

  const targetWindows: Window[] = [];
  if (contentWindow && iframeAccessible) targetWindows.push(contentWindow);
  if (typeof window !== 'undefined' && !targetWindows.includes(window)) {
    targetWindows.push(window);
  }

  // 1. Capture LocalStorage & SessionStorage
  for (const win of targetWindows) {
    try {
      const storage = win.localStorage;
      if (storage) {
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key || isAppInternalKey(key)) continue;
          try {
            const val = storage.getItem(key);
            if (val !== null && collectedStorage[key] === undefined) {
              collectedStorage[key] = val;
            }
          } catch {}
        }
      }
    } catch {}

    try {
      const sess = win.sessionStorage;
      if (sess) {
        for (let i = 0; i < sess.length; i++) {
          const key = sess.key(i);
          if (!key || isAppInternalKey(key)) continue;
          try {
            const val = sess.getItem(key);
            if (val !== null && collectedSession[key] === undefined) {
              collectedSession[key] = val;
            }
          } catch {}
        }
      }
    } catch {}
  }

  // 2. Capture EmulatorJS Live State (e.g. Pokemon Emerald, Pokemon Red)
  const inspectEmulator = async (win: any) => {
    if (!win) return;
    try {
      const ejs = win.EJS_emulator;
      if (ejs && ejs.gameManager) {
        const gm = ejs.gameManager;
        let stateBase64: string | undefined = undefined;
        let saveFileBase64: string | undefined = undefined;

        try {
          if (typeof gm.getSaveFile === 'function') {
            const rawSave = await withTimeoutFallback(
              Promise.resolve(gm.getSaveFile()).catch(() => null),
              1500,
              null
            );
            if (rawSave && rawSave.byteLength > 0) {
              saveFileBase64 = uint8ArrayToBase64(new Uint8Array(rawSave));
            }
          }
        } catch (e) {
          console.warn("EJS getSaveFile warning:", e);
        }

        try {
          if (typeof gm.getState === 'function') {
            const rawState = gm.getState();
            if (rawState && rawState.byteLength > 0) {
              stateBase64 = uint8ArrayToBase64(new Uint8Array(rawState));
            }
          }
        } catch (e) {
          console.warn("EJS getState warning:", e);
        }

        if (stateBase64 || saveFileBase64) {
          emulatorData = {
            stateBase64,
            saveFileBase64,
            core: win.EJS_core || 'gba',
            gameName: win.EJS_gameName || gameId
          };
        }
      }
    } catch (e) {
      console.warn("EJS inspection warning:", e);
    }
  };

  if (contentWindow && iframeAccessible) await inspectEmulator(contentWindow);
  if (typeof window !== 'undefined' && !emulatorData) await inspectEmulator(window);

  // 3. Capture IndexedDB databases (excluding giant static ROM/asset caches & own vault)
  const idbSnapshots: IDBDatabaseSnapshot[] = [];
  try {
    let sameOriginAsParent = false;
    if (contentWindow && iframeAccessible && typeof window !== 'undefined') {
      try {
        sameOriginAsParent = contentWindow.location.origin === window.location.origin;
      } catch {}
    }

    if (contentWindow && iframeAccessible) {
      const iframeSnaps = await snapshotIndexedDB(contentWindow);
      idbSnapshots.push(...iframeSnaps);
    }
    if (!sameOriginAsParent && typeof window !== 'undefined') {
      const parentSnaps = await snapshotIndexedDB(window);
      for (const s of parentSnaps) {
        if (!idbSnapshots.some(existing => existing.dbName === s.dbName)) {
          idbSnapshots.push(s);
        }
      }
    }
  } catch (e) {
    console.warn("IDB snapshot warning:", e);
  }

  // 4. Assemble universal payload (without duplicating localStorageSnapshot)
  const lsCount = Object.keys(collectedStorage).length;
  const sessCount = Object.keys(collectedSession).length;
  const keysCount = lsCount + sessCount + (emulatorData ? 1 : 0) + idbSnapshots.length;

  const payload: UniversalSavePayload = {
    version: 2,
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    keysCount,
    storage: {
      localStorage: collectedStorage,
      sessionStorage: sessCount > 0 ? collectedSession : undefined
    },
    indexedDB: idbSnapshots.length > 0 ? idbSnapshots : undefined,
    emulator: emulatorData
  };

  const jsonStr = fitSavePayloadString(JSON.stringify(payload), 480000);

  return {
    saveData: jsonStr,
    capturedKeysCount: keysCount,
    idbDatabasesCount: idbSnapshots.length,
    hasEmulatorState: Boolean(emulatorData),
    crossOriginBlocked: false
  };
}

export async function captureUniversalGameState(
  gameId: string,
  contentWindow?: Window | null
): Promise<string> {
  const result = await captureUniversalGameStateDetailed(gameId, contentWindow);
  return result.saveData;
}

/**
 * Universal Game State Restore Engine:
 * Injects and applies saved progress across EmulatorJS, Flash Ruffle, IndexedDB, and localStorage
 */
export async function restoreUniversalGameState(
  gameId: string,
  rawData: string,
  contentWindow?: Window | null
): Promise<boolean> {
  if (!rawData || typeof rawData !== 'string') return false;

  let parsed: any = null;
  try {
    parsed = JSON.parse(rawData);
  } catch (e) {
    return false;
  }

  let anyRestored = false;
  const targetWindows: Window[] = [];
  if (typeof window !== 'undefined') targetWindows.push(window);
  if (contentWindow && contentWindow !== window && canInspectWindow(contentWindow)) {
    targetWindows.push(contentWindow);
  }

  // 1. Restore LocalStorage (skipping any app-internal keys if present in older saves)
  const storageData = parsed.storage?.localStorage || parsed.localStorageSnapshot;
  if (storageData && typeof storageData === 'object') {
    for (const win of targetWindows) {
      try {
        const targetStorage = win.localStorage;
        if (targetStorage) {
          for (const [k, v] of Object.entries(storageData)) {
            if (typeof v === 'string' && !isAppInternalKey(k)) {
              try {
                targetStorage.setItem(k, v);
                anyRestored = true;
              } catch {}
            }
          }
        }
      } catch {}
    }
  }

  // 2. Restore SessionStorage (skipping app-internal keys)
  const sessionData = parsed.storage?.sessionStorage;
  if (sessionData && typeof sessionData === 'object') {
    for (const win of targetWindows) {
      try {
        const targetSess = win.sessionStorage;
        if (targetSess) {
          for (const [k, v] of Object.entries(sessionData)) {
            if (typeof v === 'string' && !isAppInternalKey(k)) {
              try {
                targetSess.setItem(k, v);
                anyRestored = true;
              } catch {}
            }
          }
        }
      } catch {}
    }
  }

  // 3. Restore IndexedDB databases
  if (Array.isArray(parsed.indexedDB) && parsed.indexedDB.length > 0) {
    for (const win of targetWindows) {
      try {
        if (win.indexedDB) {
          for (const snap of parsed.indexedDB) {
            if (await restoreSingleIDB(win.indexedDB, snap)) {
              anyRestored = true;
            }
          }
        }
      } catch {}
    }
  }

  // 4. Restore EmulatorJS Live Memory State (Pokemon Emerald, etc.)
  if (parsed.emulator) {
    const applyToEmulator = (win: any) => {
      if (!win) return false;
      try {
        const ejs = win.EJS_emulator;
        if (ejs && ejs.gameManager) {
          const gm = ejs.gameManager;

          if (parsed.emulator.saveFileBase64 && gm.FS) {
            try {
              const bytes = base64ToUint8Array(parsed.emulator.saveFileBase64);
              const path = typeof gm.getSaveFilePath === 'function' ? gm.getSaveFilePath() : null;
              if (path && bytes.byteLength > 0) {
                try { gm.FS.unlink(path); } catch {}
                gm.FS.writeFile(path, bytes);
                if (typeof gm.loadSaveFiles === 'function') {
                  gm.loadSaveFiles();
                }
                anyRestored = true;
              }
            } catch (e) {
              console.warn("EJS restore saveFile error:", e);
            }
          }

          if (parsed.emulator.stateBase64 && typeof gm.loadState === 'function') {
            try {
              const bytes = base64ToUint8Array(parsed.emulator.stateBase64);
              if (bytes.byteLength > 0) {
                gm.loadState(bytes);
                anyRestored = true;
              }
            } catch (e) {
              console.warn("EJS restore loadState error:", e);
            }
          }

          return anyRestored;
        }
      } catch (e) {
        console.warn("EJS restore warning:", e);
      }
      return false;
    };

    if (contentWindow && canInspectWindow(contentWindow) && applyToEmulator(contentWindow)) {
      anyRestored = true;
    } else if (typeof window !== 'undefined' && applyToEmulator(window)) {
      anyRestored = true;
    }
  }

  // 5. If manual save code is present, copy to clipboard for instantaneous in-game paste
  if (parsed.manualCode && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(parsed.manualCode);
      anyRestored = true;
    } catch {}
  }

  // 6. Broadcast postMessage for custom game shells and HTML5 iframes
  if (contentWindow) {
    try {
      contentWindow.postMessage({
        type: 'UNIVERSAL_GAME_RESTORE',
        gameId,
        payload: parsed,
        saveData: parsed.manualCode || rawData
      }, '*');
      contentWindow.postMessage({
        type: 'RESTORE_GAME_STATE',
        gameId,
        saveData: parsed.manualCode || rawData
      }, '*');
    } catch {}
  }

  return (
    anyRestored ||
    Boolean(storageData && Object.keys(storageData).length > 0) ||
    Boolean(sessionData && Object.keys(sessionData).length > 0) ||
    Boolean(parsed.manualCode) ||
    Boolean(parsed.saveFileBase64) ||
    Boolean(parsed.bookmarkNote) ||
    Boolean(parsed.level) ||
    typeof parsed.score === 'number'
  );
}

/**
 * Backwards compatible synchronous / async facade for capture
 */
export function captureBrowserGameState(gameId: string, contentWindow?: Window | null): string {
  // Synchronous capture of local storage keys with comprehensive multi-game pattern matching
  if (typeof window === 'undefined') {
    return JSON.stringify({ timestamp: Date.now(), empty: true });
  }

  const collected: Record<string, string> = {};
  const lowerGameId = gameId.toLowerCase().replace(/[^a-z0-9]/g, '');

  const targetWindows: Window[] = [window];
  if (contentWindow && contentWindow !== window) {
    try {
      if (contentWindow.localStorage) targetWindows.push(contentWindow);
    } catch (e) {}
  }

  for (const win of targetWindows) {
    try {
      const storage = win.localStorage;
      if (!storage) continue;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key || isAppInternalKey(key)) continue;
        const lowerKey = key.toLowerCase();

        // Match game-specific tokens or universal game save patterns
        const isGameMatch =
          lowerKey.includes(lowerGameId) ||
          lowerGameId.includes(lowerKey) ||
          lowerKey.startsWith('sol:') ||
          lowerKey.includes('localhost') ||
          lowerKey.includes('save') ||
          lowerKey.includes('slot') ||
          lowerKey.includes('score') ||
          lowerKey.includes('level') ||
          lowerKey.includes('progress') ||
          lowerKey.includes('state') ||
          lowerKey.includes('data') ||
          lowerKey.includes('cookie') ||
          lowerKey.includes('slope') ||
          lowerKey.includes('retro') ||
          lowerKey.includes('bitlife') ||
          lowerKey.includes('moto') ||
          lowerKey.includes('drive') ||
          lowerKey.includes('fireboy') ||
          lowerKey.includes('watergirl') ||
          lowerKey.includes('emerald') ||
          lowerKey.includes('pokemon') ||
          lowerKey.includes('flight') ||
          lowerKey.includes('gunblood') ||
          lowerKey.includes('papa') ||
          lowerKey.includes('unity') ||
          lowerKey.includes('c2') ||
          lowerKey.includes('c3') ||
          lowerKey.includes('gdjs');

        if (isGameMatch || storage.length <= 40) {
          try {
            const val = storage.getItem(key);
            if (val !== null) collected[key] = val;
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  return JSON.stringify({
    version: 2,
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    storage: { localStorage: collected },
    localStorageSnapshot: collected,
    keysCount: Object.keys(collected).length
  }, null, 2);
}

/**
 * Backwards compatible synchronous / async facade for restore
 */
export function restoreBrowserGameState(
  gameId: string, 
  rawData: string,
  contentWindow?: Window | null
): boolean {
  if (!rawData || typeof rawData !== 'string') return false;

  try {
    const parsed = JSON.parse(rawData);
    const storageData = parsed.storage?.localStorage || parsed.localStorageSnapshot;

    if (storageData && typeof storageData === 'object') {
      const targetWindows: Window[] = [window];
      if (contentWindow && contentWindow !== window) {
        try {
          if (contentWindow.localStorage) targetWindows.push(contentWindow);
        } catch (e) {}
      }

      for (const win of targetWindows) {
        try {
          const st = win.localStorage;
          if (st) {
            for (const [k, v] of Object.entries(storageData)) {
              if (typeof v === 'string') {
                try { st.setItem(k, v); } catch (e) {}
              }
            }
          }
        } catch (e) {}
      }
      return true;
    }
  } catch (e) {
    console.warn("restoreBrowserGameState parsing error:", e);
  }
  return false;
}

