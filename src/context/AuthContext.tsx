import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  UserProfile,
  GameSave,
  SaveSlotResult,
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
  migrateLocalGuestSavesToUser
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
  isGuest: boolean;
  isCloudSynced: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('owen_gamer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [deviceLabel] = useState<string>(() => detectDeviceLabel());

  const currentUserId = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;

  const [saves, setSaves] = useState<GameSave[]>(() => {
    return getLocalBackups(currentUserId);
  });

  // Track Firebase Auth State & synchronize remote profile + guest saves
  useEffect(() => {
    let active = true;
    try {
      const unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (!active) return;
        const guestSessionUid = getOrCreateLocalGuest().uid;
        setUser(u);

        if (u) {
          try {
            if (!u.isAnonymous && guestSessionUid && guestSessionUid !== u.uid) {
              await migrateLocalGuestSavesToUser(guestSessionUid, u.uid);
            }
            const syncedProf = await syncInitialProfile({
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              isAnonymous: u.isAnonymous
            });
            if (!active) return;
            setProfile(syncedProf);
            try {
              localStorage.setItem('owen_gamer_profile', JSON.stringify(syncedProf));
            } catch {}
          } catch (e) {
            console.warn('Auth profile sync warning:', e);
          }
        } else {
          const existingLocal = await getUserProfile(guestSessionUid);
          if (!active) return;
          if (existingLocal) {
            setProfile(existingLocal);
          }
        }
      });
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (e) {
      console.warn('Auth state listener warning:', e);
      return () => {
        active = false;
      };
    }
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
    const guestBeforeLogin = getOrCreateLocalGuest().uid;
    try {
      const appUser = await firebaseLoginWithGoogle();
      if (guestBeforeLogin && guestBeforeLogin !== appUser.uid) {
        await migrateLocalGuestSavesToUser(guestBeforeLogin, appUser.uid);
      }
      const syncedProf = await syncInitialProfile(appUser);
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
    try {
      const res = await signInAnonymously(auth);
      setUser(res.user);
      const guestProf = await updateUserProfile(res.user.uid, {
        displayName: cleanName,
        avatarId: 'melon_classic'
      });
      setProfile(guestProf);
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(guestProf));
      } catch {}
    } catch {
      const localGuest = getOrCreateLocalGuest(cleanName);
      const guestProf = await updateUserProfile(localGuest.uid, {
        displayName: cleanName,
        avatarId: 'melon_classic'
      });
      setProfile(guestProf);
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(guestProf));
      } catch {}
    }
  };

  const logout = async () => {
    setAuthError(null);
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
    } catch {}
  };

  const updateGamerProfile = async (updates: Partial<UserProfile>) => {
    const activeUid = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;
    const savedProfile = await updateUserProfile(activeUid, updates);
    setProfile(savedProfile);
    try {
      localStorage.setItem('owen_gamer_profile', JSON.stringify(savedProfile));
    } catch {}
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

  const isGuest = !user || user.isAnonymous;
  const isCloudSynced = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        saves,
        deviceLabel,
        isGuest,
        isCloudSynced,
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
      isGuest: true,
      isCloudSynced: false,
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
