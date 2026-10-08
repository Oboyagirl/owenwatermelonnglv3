import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuth,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  getUserProfile,
  syncInitialProfile,
  updateUserProfile,
  subscribeToUserGameSaves,
  saveGameSlot,
  deleteGameSlot,
  UserProfile,
  GameSave,
  detectDeviceLabel
} from '../services/cloudSaveService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  saves: GameSave[];
  deviceLabel: string;
  isGuest: boolean;
  loginGoogle: () => Promise<void>;
  loginGuest: (name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateGamerProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveCurrentGame: (gameId: string, slot: string, data: { title?: string; saveData: string; saveType?: string; score?: number; level?: string; deviceLabel?: string }) => Promise<GameSave>;
  deleteSave: (gameId: string, slot: string) => Promise<void>;
  getSavesForGame: (gameId: string) => GameSave[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceLabel, setDeviceLabel] = useState('Detecting device...');

  useEffect(() => {
    setDeviceLabel(detectDeviceLabel());
  }, []);

  useEffect(() => {
    let unsubscribeSaves: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuth(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          let prof = await getUserProfile(currentUser.uid);
          if (!prof) {
            prof = await syncInitialProfile(currentUser);
          }
          setProfile(prof);

          // Real-time subscribe to this user's cloud saves
          if (unsubscribeSaves) unsubscribeSaves();
          unsubscribeSaves = subscribeToUserGameSaves(currentUser.uid, (userSaves) => {
            setSaves(userSaves);
          });
        } catch (err) {
          console.warn('Failed to load user profile or saves:', err);
        }
      } else {
        // Automatically initialize guest profile so saves work instantly on any computer or Chromebook
        try {
          const guestUser = await loginAsGuest();
          setUser(guestUser);
          const prof = await syncInitialProfile(guestUser);
          setProfile(prof);
          if (unsubscribeSaves) unsubscribeSaves();
          unsubscribeSaves = subscribeToUserGameSaves(guestUser.uid, (userSaves) => {
            setSaves(userSaves);
          });
        } catch (guestErr) {
          console.warn('Guest auto-login skipped:', guestErr);
          setProfile(null);
          setSaves([]);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSaves) unsubscribeSaves();
    };
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      const prof = await syncInitialProfile(loggedUser);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  };

  const loginGuest = async (name?: string) => {
    setLoading(true);
    try {
      const loggedUser = await loginAsGuest(name);
      setUser(loggedUser);
      const prof = await syncInitialProfile(loggedUser);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      const newGuest = await loginAsGuest();
      setUser(newGuest);
      const prof = await syncInitialProfile(newGuest);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  };

  const updateGamerProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, updates);
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const saveCurrentGame = async (
    gameId: string, 
    slot: string, 
    data: { title?: string; saveData: string; saveType?: string; score?: number; level?: string; deviceLabel?: string }
  ): Promise<GameSave> => {
    let activeUser = user;
    if (!activeUser) {
      activeUser = await loginAsGuest();
      setUser(activeUser);
    }
    const saved = await saveGameSlot(activeUser.uid, gameId, slot, {
      ...data,
      deviceLabel: data.deviceLabel || deviceLabel
    });
    // Optimistically update saves list immediately so it NEVER disappears
    setSaves(prev => {
      const filtered = prev.filter(s => s.id !== saved.id);
      return [saved, ...filtered];
    });
    return saved;
  };

  const deleteSave = async (gameId: string, slot: string) => {
    if (!user) return;
    const cleanGameId = (gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60)) || 'game';
    const cleanSlot = (slot.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 20)) || 'slot1';
    const saveId = `${cleanGameId}_${cleanSlot}`;

    await deleteGameSlot(user.uid, gameId, slot);
    setSaves(prev => prev.filter(s => s.id !== saveId));
  };

  const getSavesForGame = (gameId: string) => {
    const cleanId = (gameId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 60)).toLowerCase();
    const rawLower = gameId.toLowerCase();
    return saves.filter(s => 
      s.gameId === gameId || 
      s.gameId.toLowerCase() === rawLower ||
      s.id.toLowerCase().startsWith(`${cleanId}_`)
    );
  };

  const isGuest = !!(user && user.isAnonymous);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        saves,
        deviceLabel,
        isGuest,
        loginGoogle,
        loginGuest,
        logout,
        updateGamerProfile,
        saveCurrentGame,
        deleteSave,
        getSavesForGame
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
