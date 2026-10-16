import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile, GameSave } from '../services/cloudSaveService';

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
  const [saves, setSaves] = useState<GameSave[]>(() => {
    try {
      const saved = localStorage.getItem('owen_cloud_saves');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deviceLabel] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Browser Device';
    const ua = navigator.userAgent;
    if (/iPad|iPhone/i.test(ua)) return 'School iPad';
    if (/CrOS/i.test(ua)) return 'School Chromebook';
    if (/Mac/i.test(ua)) return 'MacBook';
    if (/Windows/i.test(ua)) return 'Windows PC';
    return 'Web Device';
  });

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u && !profile) {
          setProfile({
            userId: u.uid,
            displayName: u.displayName || 'Melon Gamer',
            avatarId: 'melon_classic'
          });
        }
      });
      return () => unsubscribe();
    } catch {
      // Firebase auth listener fallback
    }
  }, [profile]);

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
      const localGuest: UserProfile = {
        userId: 'guest-' + Date.now(),
        displayName: name,
        avatarId: 'melon_classic'
      };
      setProfile(localGuest);
      localStorage.setItem('owen_gamer_profile', JSON.stringify(localGuest));
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
      const next = prev ? { ...prev, ...updates } : { userId: 'local', displayName: 'Player', ...updates };
      try {
        localStorage.setItem('owen_gamer_profile', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const deleteSave = async (gameIdOrId: string, slot?: string) => {
    setSaves(prev => {
      const next = prev.filter(s => {
        if (slot) {
          return !(s.gameId === gameIdOrId && s.slot === slot);
        }
        return s.id !== gameIdOrId && s.gameId !== gameIdOrId;
      });
      try {
        localStorage.setItem('owen_cloud_saves', JSON.stringify(next));
      } catch {}
      return next;
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
      deleteSave
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
      deleteSave: async () => {}
    };
  }
  return context;
};
