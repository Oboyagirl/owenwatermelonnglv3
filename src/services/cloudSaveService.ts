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
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';

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

// ---------------- LOCAL MIRROR STORAGE HELPERS ----------------
function getLocalVaultKey(userId: string): string {
  return `owen_cloud_vault_${userId}`;
}

export function getLocalBackups(userId: string): GameSave[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(getLocalVaultKey(userId));
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalBackup(userId: string, save: GameSave): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getLocalBackups(userId);
    const filtered = existing.filter(s => s.id !== save.id);
    const updated = [save, ...filtered];
    localStorage.setItem(getLocalVaultKey(userId), JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to write local backup:', e);
  }
}

export function deleteLocalBackup(userId: string, saveId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = getLocalBackups(userId);
    const updated = existing.filter(s => s.id !== saveId);
    localStorage.setItem(getLocalVaultKey(userId), JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete local backup:', e);
  }
}

export function syncLocalBackups(userId: string, saves: GameSave[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(getLocalVaultKey(userId), JSON.stringify(saves));
  } catch (e) {
    console.warn('Failed to sync local backups:', e);
  }
}

function mergeSaves(local: GameSave[], remote: GameSave[]): GameSave[] {
  const map = new Map<string, GameSave>();
  // Put local first
  for (const s of local) {
    map.set(s.id, s);
  }
  // Remote overwrites or adds
  for (const s of remote) {
    const loc = map.get(s.id);
    if (!loc) {
      map.set(s.id, s);
    } else {
      // If remote has newer or equal updatedAt, take remote
      const locTime = loc.updatedAt ? new Date(loc.updatedAt).getTime() : 0;
      const remTime = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
      if (remTime >= locTime) {
        map.set(s.id, s);
      }
    }
  }
  return Array.from(map.values());
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

const GUEST_STORAGE_KEY = 'owen_local_guest_session';

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
    const cred = await signInWithPopup(auth, googleProvider);
    const appUser: AppUser = {
      uid: cred.user.uid,
      displayName: cred.user.displayName,
      email: cred.user.email,
      photoURL: cred.user.photoURL,
      isAnonymous: false
    };
    await syncInitialProfile(appUser);
    return appUser;
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
}

export async function loginAsGuest(customName?: string): Promise<AppUser> {
  // Try Firebase anonymous login, and if project has admin-only restriction, fallback to local guest session
  try {
    const cred = await signInAnonymously(auth);
    const generatedName = customName?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    const appUser: AppUser = {
      uid: cred.user.uid,
      displayName: cred.user.displayName || generatedName,
      email: null,
      photoURL: null,
      isAnonymous: true
    };
    await syncInitialProfile(appUser, generatedName);
    return appUser;
  } catch (err: any) {
    console.warn("Using instant local guest session (Firebase anonymous auth bypassed):", err?.message || err);
    const localGuest = getOrCreateLocalGuest(customName);
    await syncInitialProfile(localGuest, customName);
    return localGuest;
  }
}

export async function logoutUser(): Promise<void> {
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
  try {
    const raw = localStorage.getItem(localProfKey);
    if (raw) localProf = JSON.parse(raw);
  } catch (e) {}

  const displayName = user.displayName || fallbackName || localProf?.displayName || `Player_${user.uid.slice(0, 5)}`;
  const newProfile: UserProfile = {
    userId: user.uid,
    displayName: displayName.slice(0, 60),
    photoURL: (user.photoURL || localProf?.photoURL || '').slice(0, 500),
    avatarId: localProf?.avatarId || 'melon_classic',
    favoriteGameIds: localProf?.favoriteGameIds || [],
    recentGameIds: localProf?.recentGameIds || [],
    createdAt: localProf?.createdAt || new Date().toISOString(),
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
        return snap.data() as UserProfile;
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

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const localProfKey = `owen_profile_${userId}`;
  let existing = await getUserProfile(userId) || {
    userId,
    displayName: 'Player',
    createdAt: new Date().toISOString()
  };

  const finalProfile: UserProfile = {
    ...existing,
    ...updates,
    userId,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(localProfKey, JSON.stringify(finalProfile));
  } catch (e) {}

  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const ref = doc(db, 'users', userId);
      await setDoc(ref, finalProfile);
    } catch (e) {
      console.warn("Firestore updateUserProfile warning:", e);
    }
  }
}

// ---------------- CLOUD GAME SAVES METHODS ----------------

export async function getUserGameSaves(userId: string): Promise<GameSave[]> {
  const localSaves = getLocalBackups(userId);
  const path = `users/${userId}/saves`;
  try {
    const coll = collection(db, 'users', userId, 'saves');
    const snap = await getDocs(coll);
    const remoteSaves = snap.docs.map(d => d.data() as GameSave);
    const merged = mergeSaves(localSaves, remoteSaves);
    syncLocalBackups(userId, merged);
    return merged;
  } catch (error) {
    console.warn("getUserGameSaves using local cache fallback:", error);
    return localSaves;
  }
}

export function subscribeToUserGameSaves(userId: string, callback: (saves: GameSave[]) => void) {
  const path = `users/${userId}/saves`;
  const coll = collection(db, 'users', userId, 'saves');

  // Immediately feed current local saves so the UI has instant reactivity with zero delay
  const initialLocal = getLocalBackups(userId);
  callback(initialLocal);

  return onSnapshot(
    coll,
    (snapshot) => {
      const remoteSaves = snapshot.docs.map(doc => doc.data() as GameSave);
      const currentLocal = getLocalBackups(userId);
      const merged = mergeSaves(currentLocal, remoteSaves);
      syncLocalBackups(userId, merged);
      callback(merged);
    },
    (error) => {
      console.warn("subscribeToUserGameSaves snapshot warning, using local mirror:", error);
      callback(getLocalBackups(userId));
    }
  );
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
  }
): Promise<GameSave> {
  // Sanitize saveId to conform strictly to isValidId regex ^[a-zA-Z0-9_\-]+$
  const cleanGameId = (gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60)) || 'game';
  const cleanSlot = (slot.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 20)) || 'slot1';
  const saveId = `${cleanGameId}_${cleanSlot}`;
  const path = `users/${userId}/saves/${saveId}`;

  // Ensure payload string does not exceed 490,000 chars
  const truncatedData = (payload.saveData && payload.saveData.length > 490000)
    ? payload.saveData.slice(0, 490000) 
    : (payload.saveData || '');

  const now = new Date().toISOString();
  
  // Construct clean document without any undefined or null properties
  const saveDoc: GameSave = {
    id: saveId,
    userId,
    gameId,
    slot,
    title: (payload.title || gameId).slice(0, 120),
    saveData: truncatedData,
    saveType: payload.saveType || 'state',
    deviceLabel: payload.deviceLabel || detectDeviceLabel(),
    createdAt: now,
    updatedAt: now
  };

  if (typeof payload.score === 'number' && !Number.isNaN(payload.score)) {
    saveDoc.score = payload.score;
  }
  if (typeof payload.level === 'string' && payload.level.trim().length > 0) {
    saveDoc.level = payload.level.trim().slice(0, 60);
  }

  // 1. Instantly save to local persistent mirror so it NEVER disappears
  saveLocalBackup(userId, saveDoc);

  // 2. Synchronize to Firestore database
  try {
    const ref = doc(db, 'users', userId, 'saves', saveId);
    await setDoc(ref, saveDoc);
  } catch (error) {
    console.warn("Firestore saveGameSlot remote sync warning:", error);
  }

  return saveDoc;
}

export async function deleteGameSlot(userId: string, gameId: string, slot: string): Promise<void> {
  const cleanGameId = (gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60)) || 'game';
  const cleanSlot = (slot.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 20)) || 'slot1';
  const saveId = `${cleanGameId}_${cleanSlot}`;
  const path = `users/${userId}/saves/${saveId}`;

  // 1. Delete from local persistent mirror immediately
  deleteLocalBackup(userId, saveId);

  // 2. Delete from Firestore
  try {
    const ref = doc(db, 'users', userId, 'saves', saveId);
    await deleteDoc(ref);
  } catch (error) {
    console.warn("Firestore deleteGameSlot remote warning:", error);
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
  'search_history'
]);

function isAppInternalKey(key: string): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  if (APP_INTERNAL_KEYS.has(lower)) return true;
  if (
    lower.startsWith('auth_') ||
    lower.startsWith('guest_profile') ||
    lower.startsWith('local_backup') ||
    lower.startsWith('local_backups_') ||
    lower.startsWith('firebase:') ||
    lower.startsWith('loglevel:')
  ) {
    return true;
  }
  return false;
}

/**
 * Serializes IndexedDB record values into JSON-safe representations
 */
function serializeIDBValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (val instanceof ArrayBuffer) {
    return { __idbType: 'ArrayBuffer', data: uint8ArrayToBase64(new Uint8Array(val)) };
  }
  if (ArrayBuffer.isView(val)) {
    return { __idbType: 'Uint8Array', data: uint8ArrayToBase64(new Uint8Array(val.buffer, val.byteOffset, val.byteLength)) };
  }
  if (typeof Blob !== 'undefined' && val instanceof Blob) {
    return { __idbType: 'Blob', mime: val.type, data: '' };
  }
  if (typeof val === 'object') {
    try {
      const copy: Record<string, any> = Array.isArray(val) ? [] : {};
      for (const [k, v] of Object.entries(val)) {
        copy[k] = serializeIDBValue(v);
      }
      return copy;
    } catch {
      return val;
    }
  }
  return val;
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
  return new Promise((resolve) => {
    try {
      const req = idbFactory.open(dbName);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
      req.onsuccess = async () => {
        const db = req.result;
        const storeNames = Array.from(db.objectStoreNames);
        if (!storeNames.length) {
          db.close();
          return resolve(null);
        }

        const stores: IDBStoreSnapshot[] = [];
        for (const storeName of storeNames) {
          try {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const records: IDBStoreRecord[] = await new Promise((resStore) => {
              const recs: IDBStoreRecord[] = [];
              const cursorReq = store.openCursor();
              cursorReq.onsuccess = (e: any) => {
                const cursor = e.target.result;
                if (cursor) {
                  // Cap records per store to avoid gigantic memory usage
                  if (recs.length < 250) {
                    recs.push({
                      key: cursor.key,
                      value: serializeIDBValue(cursor.value)
                    });
                  }
                  cursor.continue();
                } else {
                  resStore(recs);
                }
              };
              cursorReq.onerror = () => resStore(recs);
            });
            if (records.length > 0) {
              stores.push({ storeName, records });
            }
          } catch (e) {
            // skip failed store
          }
        }
        db.close();
        resolve(stores.length ? { dbName, version: db.version, stores } : null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Snapshots relevant IndexedDB databases (e.g. EmulatorJS saves/states, Unity, Construct)
 */
async function snapshotIndexedDB(targetWindow: Window | null): Promise<IDBDatabaseSnapshot[]> {
  if (!targetWindow || !targetWindow.indexedDB) return [];
  const results: IDBDatabaseSnapshot[] = [];

  try {
    const dbNamesToInspect = new Set<string>([
      'EmulatorJS-saves',
      'EmulatorJS-states',
      'EmulatorJS-roms',
      'EJS_SAVES',
      'keyval-store',
      'idbfs',
      'localforage',
      'ruffle',
      'ruffle_storage'
    ]);

    if (typeof targetWindow.indexedDB.databases === 'function') {
      try {
        const dbs = await targetWindow.indexedDB.databases();
        for (const d of dbs) {
          if (d.name) dbNamesToInspect.add(d.name);
        }
      } catch (e) {
        // databases() enumeration may be blocked or restricted, continue with known set
      }
    }

    for (const name of Array.from(dbNamesToInspect)) {
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

/**
 * Universal Game State Capture Engine:
 * Intelligently captures progress across ALL game engines:
 * - GBA / EmulatorJS WebAssembly memory states & .sav battery saves (Pokemon Emerald, Pokemon Red, etc.)
 * - Flash Player / Ruffle Local Shared Objects (.sol files in localStorage)
 * - HTML5 game storage in localStorage, sessionStorage, and IndexedDB
 * - Custom iframe environments
 */
export async function captureUniversalGameState(
  gameId: string,
  contentWindow?: Window | null
): Promise<string> {
  const collectedStorage: Record<string, string> = {};
  const collectedSession: Record<string, string> = {};
  let emulatorData: UniversalSavePayload['emulator'] | undefined = undefined;

  const targetWindows: Window[] = [];
  if (typeof window !== 'undefined') targetWindows.push(window);
  if (contentWindow && contentWindow !== window) targetWindows.push(contentWindow);

  // 1. Capture LocalStorage from parent and iframe
  for (const win of targetWindows) {
    try {
      const storage = win.localStorage;
      if (!storage) continue;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key || isAppInternalKey(key)) continue;

        try {
          const val = storage.getItem(key);
          if (val !== null) {
            collectedStorage[key] = val;
          }
        } catch (e) {}
      }
    } catch (e) {
      // Cross-origin iframe or blocked storage
    }

    // 2. Capture SessionStorage
    try {
      const sess = win.sessionStorage;
      if (sess) {
        for (let i = 0; i < sess.length; i++) {
          const key = sess.key(i);
          if (!key || isAppInternalKey(key)) continue;
          try {
            const val = sess.getItem(key);
            if (val !== null) {
              collectedSession[key] = val;
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  // 3. Capture EmulatorJS Live State (e.g. Pokemon Emerald, Pokemon Red)
  const inspectEmulator = async (win: any) => {
    if (!win) return;
    try {
      const ejs = win.EJS_emulator;
      if (ejs && ejs.gameManager) {
        const gm = ejs.gameManager;
        let stateBase64: string | undefined = undefined;
        let saveFileBase64: string | undefined = undefined;

        // In-game battery save (.sav)
        try {
          if (typeof gm.getSaveFile === 'function') {
            const rawSave = await gm.getSaveFile();
            if (rawSave && rawSave.byteLength > 0) {
              saveFileBase64 = uint8ArrayToBase64(new Uint8Array(rawSave));
            }
          }
        } catch (e) {
          console.warn("EJS getSaveFile warning:", e);
        }

        // Live memory save state
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

  if (contentWindow) await inspectEmulator(contentWindow);
  if (typeof window !== 'undefined' && !emulatorData) await inspectEmulator(window);

  // 4. Capture IndexedDB databases (e.g. Unity WebGL, Construct, EmulatorJS caches)
  let idbSnapshots: IDBDatabaseSnapshot[] = [];
  try {
    const parentSnaps = await snapshotIndexedDB(typeof window !== 'undefined' ? window : null);
    idbSnapshots.push(...parentSnaps);
    if (contentWindow && contentWindow !== window) {
      const iframeSnaps = await snapshotIndexedDB(contentWindow);
      for (const s of iframeSnaps) {
        if (!idbSnapshots.some(existing => existing.dbName === s.dbName)) {
          idbSnapshots.push(s);
        }
      }
    }
  } catch (e) {
    console.warn("IDB snapshot warning:", e);
  }

  // 5. Assemble universal payload
  const keysCount = Object.keys(collectedStorage).length + (emulatorData ? 1 : 0) + idbSnapshots.length;

  const payload: UniversalSavePayload = {
    version: 2,
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    keysCount,
    storage: {
      localStorage: collectedStorage,
      sessionStorage: Object.keys(collectedSession).length > 0 ? collectedSession : undefined
    },
    // Maintain backwards compatibility with legacy readers
    localStorageSnapshot: collectedStorage,
    indexedDB: idbSnapshots.length > 0 ? idbSnapshots : undefined,
    emulator: emulatorData
  };

  let jsonStr = JSON.stringify(payload);

  // Firestore hard limit protection: if payload exceeds 450,000 characters,
  // prune large non-critical IndexedDB caches while preserving pure save RAM and localStorage
  if (jsonStr.length > 450000) {
    payload.indexedDB = undefined;
    jsonStr = JSON.stringify(payload);
  }

  return jsonStr;
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
    // If not JSON, it might be a raw export string (Cookie Clicker, Retro Bowl, etc.)
    return false;
  }

  let anyRestored = false;
  const targetWindows: Window[] = [];
  if (typeof window !== 'undefined') targetWindows.push(window);
  if (contentWindow && contentWindow !== window) targetWindows.push(contentWindow);

  // 1. Restore LocalStorage
  const storageData = parsed.storage?.localStorage || parsed.localStorageSnapshot;
  if (storageData && typeof storageData === 'object') {
    for (const win of targetWindows) {
      try {
        const targetStorage = win.localStorage;
        if (targetStorage) {
          for (const [k, v] of Object.entries(storageData)) {
            if (typeof v === 'string') {
              try {
                targetStorage.setItem(k, v);
                anyRestored = true;
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }
  }

  // 2. Restore SessionStorage
  const sessionData = parsed.storage?.sessionStorage;
  if (sessionData && typeof sessionData === 'object') {
    for (const win of targetWindows) {
      try {
        const targetSess = win.sessionStorage;
        if (targetSess) {
          for (const [k, v] of Object.entries(sessionData)) {
            if (typeof v === 'string') {
              try {
                targetSess.setItem(k, v);
                anyRestored = true;
              } catch (e) {}
            }
          }
        }
      } catch (e) {}
    }
  }

  // 3. Restore IndexedDB databases
  if (Array.isArray(parsed.indexedDB) && parsed.indexedDB.length > 0) {
    for (const win of targetWindows) {
      try {
        if (win.indexedDB) {
          for (const snap of parsed.indexedDB) {
            await restoreSingleIDB(win.indexedDB, snap);
            anyRestored = true;
          }
        }
      } catch (e) {}
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

          // Battery save file (.sav)
          if (parsed.emulator.saveFileBase64 && gm.FS) {
            try {
              const bytes = base64ToUint8Array(parsed.emulator.saveFileBase64);
              const path = typeof gm.getSaveFilePath === 'function' ? gm.getSaveFilePath() : null;
              if (path && bytes.byteLength > 0) {
                try { gm.FS.unlink(path); } catch (err) {}
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

          // Live state
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

          return true;
        }
      } catch (e) {
        console.warn("EJS restore warning:", e);
      }
      return false;
    };

    if (contentWindow && applyToEmulator(contentWindow)) {
      anyRestored = true;
    } else if (typeof window !== 'undefined' && applyToEmulator(window)) {
      anyRestored = true;
    }
  }

  // 5. Broadcast postMessage for custom game shells
  if (contentWindow) {
    try {
      contentWindow.postMessage({
        type: 'UNIVERSAL_GAME_RESTORE',
        gameId,
        payload: parsed
      }, '*');
    } catch (e) {}
  }

  return anyRestored || Boolean(storageData);
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

