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

// ---------------- AUTHENTICATION METHODS ----------------

export async function loginWithGoogle(): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncInitialProfile(cred.user);
    return cred.user;
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
}

export async function loginAsGuest(customName?: string): Promise<User> {
  try {
    const cred = await signInAnonymously(auth);
    const generatedName = customName?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    await syncInitialProfile(cred.user, generatedName);
    return cred.user;
  } catch (err) {
    console.error("Guest login error:", err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ---------------- USER PROFILE METHODS ----------------

export async function syncInitialProfile(user: User, fallbackName?: string): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const newProfile: UserProfile = {
      userId: user.uid,
      displayName: user.displayName || fallbackName || `Player_${user.uid.slice(0, 5)}`,
      photoURL: user.photoURL || '',
      avatarId: 'melon_classic',
      favoriteGameIds: [],
      recentGameIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(ref, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const ref = doc(db, 'users', userId);
    const existingSnap = await getDoc(ref);
    const existing = existingSnap.exists() ? (existingSnap.data() as UserProfile) : {
      userId,
      displayName: 'Player',
      createdAt: new Date().toISOString()
    };

    const finalProfile: UserProfile = {
      ...existing,
      ...updates,
      userId, // keep immutable
      updatedAt: new Date().toISOString()
    };

    await setDoc(ref, finalProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ---------------- CLOUD GAME SAVES METHODS ----------------

export async function getUserGameSaves(userId: string): Promise<GameSave[]> {
  const path = `users/${userId}/saves`;
  try {
    const coll = collection(db, 'users', userId, 'saves');
    const snap = await getDocs(coll);
    return snap.docs.map(d => d.data() as GameSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToUserGameSaves(userId: string, callback: (saves: GameSave[]) => void) {
  const path = `users/${userId}/saves`;
  const coll = collection(db, 'users', userId, 'saves');
  return onSnapshot(
    coll,
    (snapshot) => {
      const saves = snapshot.docs.map(doc => doc.data() as GameSave);
      callback(saves);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
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
  // Sanitize saveId to conform to isValidId regex ^[a-zA-Z0-9_\-]+$
  const cleanGameId = gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60);
  const cleanSlot = slot.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 20);
  const saveId = `${cleanGameId}_${cleanSlot}`;
  const path = `users/${userId}/saves/${saveId}`;

  // Ensure payload string does not exceed 500,000 chars
  const truncatedData = payload.saveData.length > 490000 
    ? payload.saveData.slice(0, 490000) 
    : payload.saveData;

  const now = new Date().toISOString();
  const saveDoc: GameSave = {
    id: saveId,
    userId,
    gameId,
    slot,
    title: payload.title?.slice(0, 120) || gameId,
    saveData: truncatedData,
    saveType: payload.saveType || 'state',
    score: typeof payload.score === 'number' ? payload.score : undefined,
    level: payload.level?.slice(0, 60),
    deviceLabel: payload.deviceLabel || detectDeviceLabel(),
    createdAt: now,
    updatedAt: now
  };

  try {
    const ref = doc(db, 'users', userId, 'saves', saveId);
    await setDoc(ref, saveDoc);
    return saveDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGameSlot(userId: string, gameId: string, slot: string): Promise<void> {
  const cleanGameId = gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60);
  const cleanSlot = slot.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 20);
  const saveId = `${cleanGameId}_${cleanSlot}`;
  const path = `users/${userId}/saves/${saveId}`;

  try {
    const ref = doc(db, 'users', userId, 'saves', saveId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
