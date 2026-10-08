import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuth,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  getUserProfile,
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
      setUser(currentUser);
      if (currentUser) {
        try {
          const prof = await getUserProfile(currentUser.uid);
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
        setProfile(null);
        setSaves([]);
        if (unsubscribeSaves) {
          unsubscribeSaves();
          unsubscribeSaves = null;
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
      const prof = await getUserProfile(loggedUser.uid);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  };

  const loginGuest = async (name?: string) => {
    setLoading(true);
    try {
      const loggedUser = await loginAsGuest(name);
      const prof = await getUserProfile(loggedUser.uid);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
      setSaves([]);
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
    data: { title?: string; saveData: string; saveType?: string; score?: number; level?: string }
  ) => {
    if (!user) {
      throw new Error("You must be signed in to save games to the cloud.");
    }
    const saved = await saveGameSlot(user.uid, gameId, slot, {
      ...data,
      deviceLabel
    });
    return saved;
  };

  const deleteSave = async (gameId: string, slot: string) => {
    if (!user) return;
    await deleteGameSlot(user.uid, gameId, slot);
  };

  const getSavesForGame = (gameId: string) => {
    return saves.filter(s => s.gameId === gameId);
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
