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

// ---------------- LOCALSTORAGE SNAPSHOT & INJECTION ENGINE ----------------

/**
 * Searches the browser's localStorage for state keys matching the game or common patterns
 * (e.g. cookie clicker, slope, bitlife, retro bowl, custom overrides)
 */
export function captureBrowserGameState(gameId: string): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return JSON.stringify({ timestamp: Date.now(), empty: true });
  }

  const collected: Record<string, string> = {};
  const lowerGameId = gameId.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const lowerKey = key.toLowerCase();

    // Check if key belongs to this game or common save signatures
    if (
      lowerKey.includes(lowerGameId) ||
      (gameId.includes('cookie') && (lowerKey.includes('cookie') || lowerKey.includes('cc_'))) ||
      (gameId.includes('slope') && lowerKey.includes('slope')) ||
      (gameId.includes('retro-bowl') && lowerKey.includes('retro')) ||
      (gameId.includes('bitlife') && lowerKey.includes('bitlife')) ||
      (gameId.includes('moto') && lowerKey.includes('moto')) ||
      (gameId.includes('drive-mad') && lowerKey.includes('drive'))
    ) {
      try {
        const val = localStorage.getItem(key);
        if (val) collected[key] = val;
      } catch (e) {
        // skip if blocked
      }
    }
  }

  return JSON.stringify({
    capturedAt: new Date().toISOString(),
    gameId,
    device: detectDeviceLabel(),
    localStorageSnapshot: collected,
    keysCount: Object.keys(collected).length
  }, null, 2);
}

/**
 * Injects a captured save state back into the browser's localStorage
 */
export function restoreBrowserGameState(gameId: string, rawData: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    const parsed = JSON.parse(rawData);
    if (parsed.localStorageSnapshot && typeof parsed.localStorageSnapshot === 'object') {
      for (const [k, v] of Object.entries(parsed.localStorageSnapshot)) {
        if (typeof v === 'string') {
          localStorage.setItem(k, v);
        }
      }
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Could not parse save snapshot as JSON, attempting raw injection", e);
    return false;
  }
}
