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

export async function waitForAuthReady(): Promise<User | null> {
  try {
    await auth.authStateReady();
  } catch {}
  return auth.currentUser;
}

export async function ensureAuthPersistence(): Promise<void> {
  try {
    await setPersistence(auth, indexedDBLocalPersistence);
  } catch {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {}
  }
  await waitForAuthReady();
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
