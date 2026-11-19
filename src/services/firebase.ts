import { initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  browserPopupRedirectResolver,
  setPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  Firestore,
  doc, 
  getDocFromServer, 
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      { experimentalForceLongPolling: true },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

function createAuthInstance(): Auth {
  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence
      ],
      popupRedirectResolver: browserPopupRedirectResolver
    });
  } catch {
    return getAuth(app);
  }
}

// CRITICAL: Must use firestoreDatabaseId specified in firebase-applet-config.json
export const db = createFirestoreInstance();
export const auth = createAuthInstance();
export const googleProvider = new GoogleAuthProvider();

const FB_AUTH_IDB_NAME = 'firebaseLocalStorageDb';
const FB_AUTH_IDB_STORE = 'firebaseLocalStorage';
const FB_AUTH_BACKUP_KEY = 'owen_fb_auth_backup_v1';

export async function waitForAuthReady(): Promise<User | null> {
  try {
    await auth.authStateReady();
  } catch {}
  return auth.currentUser;
}

export async function ensureAuthPersistence(): Promise<void> {
  await waitForAuthReady();
  if (auth.currentUser) return;
  try {
    await setPersistence(auth, indexedDBLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {}
  }
}

export async function backupFirebaseAuthSession(): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage || !window.indexedDB) return;
  try {
    if (!auth.currentUser) return;
    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      const timer = window.setTimeout(done, 1500);
      try {
        const req = window.indexedDB.open(FB_AUTH_IDB_NAME);
        req.onerror = () => {
          window.clearTimeout(timer);
          done();
        };
        req.onsuccess = () => {
          const idb = req.result;
          try {
            if (!idb.objectStoreNames.contains(FB_AUTH_IDB_STORE)) {
              idb.close();
              window.clearTimeout(timer);
              done();
              return;
            }
            const tx = idb.transaction(FB_AUTH_IDB_STORE, 'readonly');
            const store = tx.objectStore(FB_AUTH_IDB_STORE);
            const allReq = store.getAll();
            allReq.onsuccess = () => {
              try {
                const rows = Array.isArray(allReq.result) ? allReq.result : [];
                const authRows = rows.filter(
                  (r: any) => r && typeof r.fbase_key === 'string' && r.fbase_key.startsWith('firebase:authUser:') && r.value
                );
                if (authRows.length > 0) {
                  localStorage.setItem(FB_AUTH_BACKUP_KEY, JSON.stringify(authRows));
                }
              } catch {}
            };
            tx.oncomplete = () => {
              try { idb.close(); } catch {}
              window.clearTimeout(timer);
              done();
            };
            tx.onerror = () => {
              try { idb.close(); } catch {}
              window.clearTimeout(timer);
              done();
            };
          } catch {
            try { idb.close(); } catch {}
            window.clearTimeout(timer);
            done();
          }
        };
      } catch {
        window.clearTimeout(timer);
        done();
      }
    });
  } catch {}
}

export async function restoreFirebaseAuthSessionIfNeeded(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.localStorage || !window.indexedDB) return false;
  try {
    if (auth.currentUser) return false;
    if (localStorage.getItem('owen_session_mode') === 'signed_out') return false;
    const rawBackup = localStorage.getItem(FB_AUTH_BACKUP_KEY);
    if (!rawBackup) return false;
    const parsed = JSON.parse(rawBackup);
    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    const validRows = parsed.filter(
      (r: any) => r && typeof r.fbase_key === 'string' && r.fbase_key.startsWith('firebase:authUser:') && r.value
    );
    if (validRows.length === 0) return false;

    return await new Promise<boolean>((resolve) => {
      let settled = false;
      const done = (val: boolean) => {
        if (!settled) {
          settled = true;
          resolve(val);
        }
      };
      const timer = window.setTimeout(() => done(false), 1800);
      try {
        const req = window.indexedDB.open(FB_AUTH_IDB_NAME, 1);
        req.onupgradeneeded = () => {
          try {
            const dbInst = req.result;
            if (!dbInst.objectStoreNames.contains(FB_AUTH_IDB_STORE)) {
              dbInst.createObjectStore(FB_AUTH_IDB_STORE, { keyPath: 'fbase_key' });
            }
          } catch {}
        };
        req.onerror = () => {
          window.clearTimeout(timer);
          done(false);
        };
        req.onsuccess = () => {
          const idb = req.result;
          try {
            if (!idb.objectStoreNames.contains(FB_AUTH_IDB_STORE)) {
              idb.close();
              window.clearTimeout(timer);
              done(false);
              return;
            }
            const tx = idb.transaction(FB_AUTH_IDB_STORE, 'readwrite');
            const store = tx.objectStore(FB_AUTH_IDB_STORE);
            const existingReq = store.getAll();
            let restored = false;
            existingReq.onsuccess = () => {
              const existingRows = Array.isArray(existingReq.result) ? existingReq.result : [];
              const hasAuth = existingRows.some(
                (r: any) => r && typeof r.fbase_key === 'string' && r.fbase_key.startsWith('firebase:authUser:') && r.value
              );
              if (!hasAuth) {
                for (const row of validRows) {
                  try {
                    store.put(row);
                    restored = true;
                  } catch {}
                }
              }
            };
            tx.oncomplete = () => {
              try { idb.close(); } catch {}
              window.clearTimeout(timer);
              done(restored);
            };
            tx.onerror = () => {
              try { idb.close(); } catch {}
              window.clearTimeout(timer);
              done(false);
            };
          } catch {
            try { idb.close(); } catch {}
            window.clearTimeout(timer);
            done(false);
          }
        };
      } catch {
        window.clearTimeout(timer);
        done(false);
      }
    });
  } catch {
    return false;
  }
}

export function clearFirebaseAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(FB_AUTH_BACKUP_KEY);
  } catch {}
}

// Error Handling Infrastructure conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore notice:', errInfo.error, operationType, path);
  throw new Error(JSON.stringify(errInfo));
}

export function extractRawErrorMessage(err: unknown): string {
  if (!err) return '';
  let raw = err instanceof Error ? err.message : String(err);
  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as { error?: unknown };
      if (parsed && typeof parsed.error === 'string') {
        raw = parsed.error;
      }
    } catch {
      // Keep original string if not JSON
    }
  }
  return raw.trim();
}

export function isIgnorableFirestoreError(err: unknown): boolean {
  const lower = extractRawErrorMessage(err).toLowerCase();
  if (!lower) return true;
  return (
    lower.includes('aborted') ||
    lower.includes('already-exists') ||
    lower.includes('cancelled') ||
    lower.includes('canceled') ||
    lower.includes('popup-closed-by-user') ||
    lower.includes('cancelled-popup-request')
  );
}

export function formatFriendlyFirestoreError(
  err: unknown,
  fallback = 'Syncing with room — please try again.'
): string {
  const raw = extractRawErrorMessage(err);
  const lower = raw.toLowerCase();
  if (!lower) return fallback;
  if (
    lower.includes('missing or insufficient permissions') ||
    lower.includes('permission-denied') ||
    lower.includes('permission denied')
  ) {
    return 'Session permission refreshed — please try again.';
  }
  if (lower.includes('offline') || lower.includes('network') || lower.includes('unavailable')) {
    return 'Reconnecting to server — please check your connection.';
  }
  if (lower.includes('not-found') || lower.includes('does not exist') || lower.includes('was closed')) {
    return 'Room or party is no longer active.';
  }
  if (lower.includes('not your turn')) {
    return 'Waiting for the active teammate or opponent to move.';
  }
  if (lower.includes('aborted') || lower.includes('failed-precondition')) {
    return 'Game state updated — synced to latest move.';
  }
  if (raw.startsWith('{') || raw.includes('authInfo')) {
    return fallback;
  }
  return raw;
}

// CRITICAL CONSTRAINT: Test connection on app startup
export async function testConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    const message = error instanceof Error ? error.message : String(error || '');
    if (code === 'unavailable' || message.includes('the client is offline')) {
      console.warn('Firestore client is temporarily offline or network restricted.');
      return false;
    }
    // Permissions error or non-existent doc is expected for 'test/connection'
    return true;
  }
}

// Auto-run connection check quietly after auth/network settle on initial app boot
if (typeof window !== 'undefined') {
  const scheduleConnectionCheck = () => {
    void waitForAuthReady().then(() => {
      setTimeout(() => {
        testConnection().catch(() => {});
      }, 300);
    });
  };
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    window.addEventListener('online', scheduleConnectionCheck, { once: true });
  } else {
    scheduleConnectionCheck();
  }
}
