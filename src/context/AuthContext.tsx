import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  UserProfile, 
  GameSave, 
  saveGameSlot, 
  deleteGameSlot, 
  subscribeToUserGameSaves,
  getLocalBackups,
  getOrCreateLocalGuest,
  detectDeviceLabel
} from '../services/cloudSaveService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  saves: GameSave[];
  deviceLabel: string;
  isGuest: boolean;
  loginGoogle: () => Promise<void>;
  loginGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateGamerProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteSave: (gameIdOrId: string, slot?: string) => Promise<void>;
  getSavesForGame: (gameId: string) => GameSave[];
  saveCurrentGame: (gameId: string, slot: string, data: { title?: string; saveData: string; saveType?: string; deviceLabel?: string; score?: number; level?: string }) => Promise<GameSave>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
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

  // Track Firebase Auth State
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) {
          setProfile(prev => {
            const nextProf: UserProfile = {
              userId: u.uid,
              displayName: u.displayName || prev?.displayName || 'Melon Gamer',
              photoURL: u.photoURL || prev?.photoURL || undefined,
              avatarId: prev?.avatarId || 'melon_classic'
            };
            try {
              localStorage.setItem('owen_gamer_profile', JSON.stringify(nextProf));
            } catch {}
            return nextProf;
          });
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth state listener warning:", e);
    }
  }, []);

  // Subscribe to real-time Cloud Saves from Firestore and local mirror
  useEffect(() => {
    const activeUid = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;
    const unsub = subscribeToUserGameSaves(activeUid, (updatedSaves) => {
      setSaves(updatedSaves);
    });
    return () => unsub();
  }, [user?.uid, profile?.userId]);

  const loginGoogle = async () => {
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      const newProfile: UserProfile = {
        userId: res.user.uid,
        displayName: res.user.displayName || 'Melon Player',
        photoURL: res.user.photoURL || undefined,
        avatarId: 'melon_classic'
      };
      setProfile(newProfile);
      localStorage.setItem('owen_gamer_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.warn("Google sign-in fallback to guest:", e);
      await loginGuest();
    }
  };

  const loginGuest = async (name: string = 'Guest Player') => {
    try {
      const res = await signInAnonymously(auth);
      setUser(res.user);
      const guestProf: UserProfile = {
        userId: res.user.uid,
        displayName: name,
        avatarId: 'melon_classic'
      };
      setProfile(guestProf);
      localStorage.setItem('owen_gamer_profile', JSON.stringify(guestProf));
    } catch {
      const localGuest = getOrCreateLocalGuest(name);
      const guestProf: UserProfile = {
        userId: localGuest.uid,
        displayName: name,
        avatarId: 'melon_classic'
      };
      setProfile(guestProf);
      localStorage.setItem('owen_gamer_profile', JSON.stringify(guestProf));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
    localStorage.removeItem('owen_gamer_profile');
  };

  const updateGamerProfile = async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = prev ? { ...prev, ...updates } : { userId: currentUserId, displayName: 'Player', ...updates };
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getSavesForGame = (gameId: string): GameSave[] => {
    if (!gameId) return [];
    const cleanGameId = gameId.replace(/[^a-zA-Z0-9_\-]/g, '_');
    return saves
      .filter(s => s.gameId === gameId || s.gameId === cleanGameId || s.id.startsWith(`${cleanGameId}_`))
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  };

  const saveCurrentGame = async (
    gameId: string, 
    slot: string, 
    data: { title?: string; saveData: string; saveType?: string; deviceLabel?: string; score?: number; level?: string }
  ): Promise<GameSave> => {
    const activeUid = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;
    const savedDoc = await saveGameSlot(activeUid, gameId, slot, {
      ...data,
      deviceLabel: data.deviceLabel || deviceLabel
    });

    setSaves(prev => {
      const filtered = prev.filter(s => s.id !== savedDoc.id);
      return [savedDoc, ...filtered];
    });

    return savedDoc;
  };

  const deleteSave = async (gameIdOrId: string, slot?: string) => {
    const activeUid = user?.uid || profile?.userId || getOrCreateLocalGuest().uid;
    let targetGameId = gameIdOrId;
    let targetSlot = slot || 'slot1';

    if (gameIdOrId.includes('_') && !slot) {
      const parts = gameIdOrId.split('_');
      targetSlot = parts.pop() || 'slot1';
      targetGameId = parts.join('_');
    }

    await deleteGameSlot(activeUid, targetGameId, targetSlot);

    setSaves(prev => {
      return prev.filter(s => {
        if (slot) {
          return !(s.gameId === targetGameId && s.slot === targetSlot);
        }
        return s.id !== gameIdOrId && s.gameId !== gameIdOrId;
      });
    });
  };

  const isGuest = !user || user.isAnonymous;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      saves,
      deviceLabel,
      isGuest,
      loginGoogle,
      loginGuest,
      logout,
      updateGamerProfile,
      deleteSave,
      getSavesForGame,
      saveCurrentGame
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      profile: { userId: 'guest', displayName: 'Gamer', avatarId: 'melon_classic' },
      saves: [],
      deviceLabel: 'School Device',
      isGuest: true,
      loginGoogle: async () => {},
      loginGuest: async () => {},
      logout: async () => {},
      updateGamerProfile: async () => {},
      deleteSave: async () => {},
      getSavesForGame: () => [],
      saveCurrentGame: async () => {}
    };
  }
  return context;
};
