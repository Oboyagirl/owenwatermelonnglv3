import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import {
  auth,
  ensureAuthPersistence,
  waitForAuthReady,
  backupFirebaseAuthSession,
  restoreFirebaseAuthSessionIfNeeded,
  clearFirebaseAuthBackup
} from '../services/firebase';
import {
  UserProfile,
  GameSave,
  SaveSlotResult,
  RememberedAccount,
  RememberedSessionMode,
  saveGameSlotWithStatus,
  deleteGameSlot,
  subscribeToUserGameSaves,
  getLocalBackups,
  getOrCreateLocalGuest,
  detectDeviceLabel,
  loginWithGoogle as firebaseLoginWithGoogle,
  syncInitialProfile,
  updateUserProfile,
  getUserProfile,
  migrateLocalGuestSavesToUser,
  markRememberedLogin,
  getRememberedLogin,
  clearRememberedLogin
} from '../services/cloudSaveService';
import {
  syncMyChatProfile,
  setMyChatOffline
} from '../services/chatService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  saves: GameSave[];
  deviceLabel: string;
  isAuthReady: boolean;
  isSignedIn: boolean;
  isGuest: boolean;
  isCloudSynced: boolean;
  hasRememberedSession: boolean;
  rememberedMode: RememberedSessionMode | null;
  rememberedAccount: RememberedAccount | null;
  authError: string | null;
  clearAuthError: () => void;
  loginGoogle: () => Promise<void>;
  loginGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateGamerProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteSave: (gameIdOrId: string, slot?: string) => Promise<void>;
  getSavesForGame: (gameId: string) => GameSave[];
  saveCurrentGame: (
    gameId: string,
    slot: string,
    data: { title?: string; saveData: string; saveType?: string; deviceLabel?: string; score?: number; level?: string }
  ) => Promise<GameSave>;
  saveCurrentGameWithStatus: (
    gameId: string,
    slot: string,
    data: { title?: string; saveData: string; saveType?: string; deviceLabel?: string; score?: number; level?: string }
  ) => Promise<SaveSlotResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code || '';
  const msg = err instanceof Error ? err.message : String(err || '');
  if (code === 'auth/popup-blocked') {
    return 'Google Sign-In pop-up was blocked by your browser. Allow pop-ups for this site and try again.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google Sign-In was closed before finishing.';
  }
  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return `Domain "${host}" must be added to Firebase Console → Authentication → Settings → Authorized domains for Google Sign-In.`;
  }
  return msg || 'Could not complete Google Sign-In.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(() => Boolean(auth.currentUser));
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberedState, setRememberedState] = useState(() => getRememberedLogin());
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('owen_gamer_profile');
      if (saved) return JSON.parse(saved);
      const { mode, account } = getRememberedLogin();
      if (mode && mode !== 'signed_out' && account?.uid) {
        return {
          userId: account.uid,
          displayName: account.displayName || 'Player',
          photoURL: account.photoURL || '',
          avatarId: account.avatarId || 'melon_classic'
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [deviceLabel] = useState<string>(() => detectDeviceLabel());
  const autoGuestRestoreAttemptedRef = useRef(false);

  const currentUserId = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;

  const [saves, setSaves] = useState<GameSave[]>(() => {
    return getLocalBackups(currentUserId);
  });

  // Track Firebase Auth State & synchronize remote profile + persistent session continuity
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    const syncSignedInUser = async (u: User) => {
      const guestSessionUid = getOrCreateLocalGuest().uid;
      const prevRemembered = getRememberedLogin();
      let cachedGlobalProf: UserProfile | null = null;
      try {
        const rawCached = localStorage.getItem('owen_gamer_profile');
        if (rawCached) cachedGlobalProf = JSON.parse(rawCached) as UserProfile;
      } catch {}

      setUser(u);
      try {
        sessionStorage.removeItem('owen_fb_session_restored');
      } catch {}
      void backupFirebaseAuthSession();

      try {
        if (!u.isAnonymous && guestSessionUid && guestSessionUid !== u.uid) {
          await migrateLocalGuestSavesToUser(guestSessionUid, u.uid);
        }
        if (prevRemembered.account?.uid && prevRemembered.account.uid !== u.uid) {
          await migrateLocalGuestSavesToUser(prevRemembered.account.uid, u.uid);
        }
        if (cachedGlobalProf?.userId && cachedGlobalProf.userId !== u.uid) {
          await migrateLocalGuestSavesToUser(cachedGlobalProf.userId, u.uid);
        }
        const syncedProf = await syncInitialProfile({
          uid: u.uid,
          displayName:
            u.displayName ||
            prevRemembered.account?.displayName ||
            cachedGlobalProf?.displayName ||
            null,
          email: u.email,
          photoURL: u.photoURL,
          isAnonymous: u.isAnonymous
        });
        markRememberedLogin(
          {
            uid: u.uid,
            displayName: syncedProf.displayName || u.displayName,
            email: u.email,
            photoURL: u.photoURL || syncedProf.photoURL || null,
            isAnonymous: u.isAnonymous
          },
          syncedProf.avatarId
        );
        if (!active) return;
        setRememberedState(getRememberedLogin());
        setProfile(syncedProf);
        try {
          localStorage.setItem('owen_gamer_profile', JSON.stringify(syncedProf));
        } catch {}
        void backupFirebaseAuthSession();
      } catch (e) {
        console.warn('Auth profile sync warning:', e);
      }
    };

    const bootstrapAuth = async () => {
      await waitForAuthReady();
      if (!active) return;

      if (auth.currentUser) {
        setUser(auth.currentUser);
        setIsAuthReady(true);
        void backupFirebaseAuthSession();
      }

      unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (!active) return;

        if (u) {
          setUser(u);
          if (active) setIsAuthReady(true);
          await syncSignedInUser(u);
          return;
        }

        // Wait until Firebase finishes restoring persisted state before handling null
        await waitForAuthReady();
        if (!active) return;
        if (auth.currentUser) {
          setUser(auth.currentUser);
          if (active) setIsAuthReady(true);
          await syncSignedInUser(auth.currentUser);
          return;
        }

        const remembered = getRememberedLogin();
        if (remembered.mode !== 'signed_out') {
          try {
            const alreadyTriedRestore = sessionStorage.getItem('owen_fb_session_restored') === '1';
            if (!alreadyTriedRestore) {
              const restored = await restoreFirebaseAuthSessionIfNeeded();
              if (!active) return;
              if (restored) {
                sessionStorage.setItem('owen_fb_session_restored', '1');
                window.location.reload();
                return;
              }
            }
          } catch {}
        }

        setUser(null);
        const guestSessionUid = getOrCreateLocalGuest().uid;
        let existingLocal: UserProfile | null = null;
        try {
          const cached = localStorage.getItem('owen_gamer_profile');
          if (cached) existingLocal = JSON.parse(cached) as UserProfile;
        } catch {}
        if (!existingLocal) {
          existingLocal = await getUserProfile(guestSessionUid);
        }
        if (!active) return;

        const shouldAutoRestoreGuest =
          remembered.mode === 'guest' ||
          (remembered.mode !== 'signed_out' && Boolean(existingLocal) && remembered.mode !== 'google');

        if (shouldAutoRestoreGuest && !autoGuestRestoreAttemptedRef.current) {
          autoGuestRestoreAttemptedRef.current = true;
          try {
            await ensureAuthPersistence();
            const res = await signInAnonymously(auth);
            if (!active) return;
            if (res.user) {
              if (existingLocal?.userId && existingLocal.userId !== res.user.uid) {
                await migrateLocalGuestSavesToUser(existingLocal.userId, res.user.uid);
              }
              await syncSignedInUser(res.user);
              if (active) setIsAuthReady(true);
              return;
            }
          } catch {
            // Anonymous auth disabled or offline — keep local guest profile seamlessly
          }
        }

        if (existingLocal && remembered.mode !== 'signed_out') {
          setProfile(existingLocal);
        } else if (remembered.mode === 'google' && remembered.account) {
          setProfile({
            userId: remembered.account.uid,
            displayName: remembered.account.displayName || 'Player',
            photoURL: remembered.account.photoURL || '',
            avatarId: remembered.account.avatarId || 'melon_classic'
          });
        }

        if (active) setIsAuthReady(true);
      });
    };

    void bootstrapAuth();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Subscribe to real-time Cloud Saves (IndexedDB + Firestore when signed in)
  useEffect(() => {
    const activeUid = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;
    const unsub = subscribeToUserGameSaves(activeUid, (updatedSaves) => {
      setSaves(updatedSaves);
    });
    return () => unsub();
  }, [user?.uid, profile?.userId]);

  // Automatically register & keep public /chatProfiles/{uid} presence live for Firebase-signed-in users
  useEffect(() => {
    if (!user?.uid || !auth.currentUser || auth.currentUser.uid !== user.uid) {
      return;
    }
    const uid = user.uid;
    const displayName = profile?.displayName || user.displayName || `Player_${uid.slice(0, 5)}`;
    const avatarId = profile?.avatarId || 'melon_classic';

    void syncMyChatProfile({
      uid,
      displayName,
      avatarId,
      isOnline: true
    }).catch(() => {});

    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncMyChatProfile({
          uid,
          displayName,
          avatarId,
          isOnline: true
        }).catch(() => {});
      }
    }, 60_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncMyChatProfile({
          uid,
          displayName,
          avatarId,
          isOnline: true
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.uid, user?.displayName, profile?.displayName, profile?.avatarId]);

  const loginGoogle = async () => {
    setAuthError(null);
    const guestBeforeLogin = profile?.userId || getOrCreateLocalGuest().uid;
    try {
      const appUser = await firebaseLoginWithGoogle();
      if (guestBeforeLogin && guestBeforeLogin !== appUser.uid) {
        await migrateLocalGuestSavesToUser(guestBeforeLogin, appUser.uid);
      }
      const syncedProf = await syncInitialProfile(appUser);
      markRememberedLogin(appUser, syncedProf.avatarId);
      void backupFirebaseAuthSession();
      setRememberedState(getRememberedLogin());
      setProfile(syncedProf);
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(syncedProf));
      } catch {}
    } catch (e) {
      const friendly = formatAuthErrorMessage(e);
      setAuthError(friendly);
      console.warn('Google sign-in failed:', e);
      throw new Error(friendly);
    }
  };

  const loginGuest = async (name: string = 'Guest Player') => {
    setAuthError(null);
    const cleanName = (name || '').trim() || 'Guest Player';
    await ensureAuthPersistence();
    try {
      const existingFbUser = auth.currentUser;
      const targetUser = existingFbUser || (await signInAnonymously(auth)).user;
      setUser(targetUser);
      const guestProf = await updateUserProfile(targetUser.uid, {
        displayName: cleanName,
        avatarId: profile?.avatarId || 'melon_classic'
      });
      markRememberedLogin(
        {
          uid: targetUser.uid,
          displayName: cleanName,
          email: targetUser.email,
          photoURL: targetUser.photoURL,
          isAnonymous: targetUser.isAnonymous
        },
        guestProf.avatarId
      );
      void backupFirebaseAuthSession();
      setRememberedState(getRememberedLogin());
      setProfile(guestProf);
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(guestProf));
      } catch {}
    } catch {
      const localGuest = getOrCreateLocalGuest(cleanName);
      const guestProf = await updateUserProfile(localGuest.uid, {
        displayName: cleanName,
        avatarId: profile?.avatarId || 'melon_classic'
      });
      markRememberedLogin(localGuest, guestProf.avatarId);
      setRememberedState(getRememberedLogin());
      setProfile(guestProf);
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(guestProf));
      } catch {}
    }
  };

  const logout = async () => {
    setAuthError(null);
    clearRememberedLogin();
    clearFirebaseAuthBackup();
    setRememberedState(getRememberedLogin());
    if (user?.uid && auth.currentUser?.uid === user.uid) {
      await setMyChatOffline(user.uid);
    }
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem('owen_gamer_profile');
      localStorage.removeItem('owen_local_guest_session');
      sessionStorage.removeItem('owen_fb_session_restored');
    } catch {}
  };

  const updateGamerProfile = async (updates: Partial<UserProfile>) => {
    const activeUid = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;
    const savedProfile = await updateUserProfile(activeUid, updates);
    setProfile(savedProfile);
    try {
      localStorage.setItem('owen_gamer_profile', JSON.stringify(savedProfile));
    } catch {}
    if (user) {
      markRememberedLogin(
        {
          uid: user.uid,
          displayName: savedProfile.displayName,
          email: user.email,
          photoURL: savedProfile.photoURL || user.photoURL || null,
          isAnonymous: user.isAnonymous
        },
        savedProfile.avatarId
      );
      setRememberedState(getRememberedLogin());
    }
    if (user?.uid && auth.currentUser?.uid === user.uid) {
      void syncMyChatProfile({
        uid: user.uid,
        displayName: savedProfile.displayName,
        avatarId: savedProfile.avatarId || 'melon_classic',
        isOnline: true
      }).catch(() => {});
    }
  };

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const getSavesForGame = useCallback((gameId: string): GameSave[] => {
    if (!gameId) return [];
    const cleanGameId = gameId.replace(/[^a-zA-Z0-9_\-]/g, '_');
    return saves
      .filter(s => s.gameId === gameId || s.gameId === cleanGameId || s.id.startsWith(`${cleanGameId}_`))
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [saves]);

  const activeUserId = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;

  const saveCurrentGameWithStatus = useCallback(async (
    gameId: string,
    slot: string,
    data: { title?: string; saveData: string; saveType?: string; deviceLabel?: string; score?: number; level?: string }
  ): Promise<SaveSlotResult> => {
    const result = await saveGameSlotWithStatus(activeUserId, gameId, slot, {
      ...data,
      deviceLabel: data.deviceLabel || deviceLabel
    });

    setSaves(prev => {
      const filtered = prev.filter(s => s.id !== result.save.id);
      return [result.save, ...filtered];
    });

    return result;
  }, [activeUserId, deviceLabel]);

  const saveCurrentGame = useCallback(async (
    gameId: string,
    slot: string,
    data: { title?: string; saveData: string; saveType?: string; deviceLabel?: string; score?: number; level?: string }
  ): Promise<GameSave> => {
    const result = await saveCurrentGameWithStatus(gameId, slot, data);
    return result.save;
  }, [saveCurrentGameWithStatus]);

  const deleteSave = useCallback(async (gameIdOrId: string, slot?: string) => {
    let targetGameId = gameIdOrId;
    let targetSlot = slot || 'slot1';

    if (gameIdOrId.includes('_') && !slot) {
      const parts = gameIdOrId.split('_');
      targetSlot = parts.pop() || 'slot1';
      targetGameId = parts.join('_');
    }

    await deleteGameSlot(activeUserId, targetGameId, targetSlot);

    setSaves(prev => {
      return prev.filter(s => {
        if (slot) {
          return !(s.gameId === targetGameId && s.slot === targetSlot);
        }
        return s.id !== gameIdOrId && s.gameId !== gameIdOrId;
      });
    });
  }, [activeUserId]);

  const hasRememberedSession = Boolean(
    user ||
      (rememberedState.mode !== 'signed_out' && (rememberedState.mode === 'google' || rememberedState.mode === 'guest' || profile))
  );
  const isGuest = user ? user.isAnonymous : rememberedState.mode !== 'google';
  const isCloudSynced = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid);
  const isSignedIn = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid && !user.isAnonymous);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        saves,
        deviceLabel,
        isAuthReady,
        isSignedIn,
        isGuest,
        isCloudSynced,
        hasRememberedSession,
        rememberedMode: rememberedState.mode,
        rememberedAccount: rememberedState.account,
        authError,
        clearAuthError,
        loginGoogle,
        loginGuest,
        logout,
        updateGamerProfile,
        deleteSave,
        getSavesForGame,
        saveCurrentGame,
        saveCurrentGameWithStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      profile: { userId: 'guest', displayName: 'Gamer', avatarId: 'melon_classic' },
      saves: [],
      deviceLabel: 'School Device',
      isAuthReady: true,
      isSignedIn: false,
      isGuest: true,
      isCloudSynced: false,
      hasRememberedSession: false,
      rememberedMode: null,
      rememberedAccount: null,
      authError: null,
      clearAuthError: () => {},
      loginGoogle: async () => {},
      loginGuest: async () => {},
      logout: async () => {},
      updateGamerProfile: async () => {},
      deleteSave: async () => {},
      getSavesForGame: () => [],
      saveCurrentGame: async () => ({
        id: 'empty',
        userId: 'guest',
        gameId: 'empty',
        slot: 'slot1',
        saveData: '{}'
      }),
      saveCurrentGameWithStatus: async () => ({
        save: {
          id: 'empty',
          userId: 'guest',
          gameId: 'empty',
          slot: 'slot1',
          saveData: '{}'
        },
        cloudSynced: false
      })
    };
  }
  return context;
};
