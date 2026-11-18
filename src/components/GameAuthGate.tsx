import React, { useState } from 'react';
import { Lock, LogIn, ShieldCheck, Gamepad2, Cloud, Users, X, AlertCircle } from 'lucide-react';
import { ThemeConfig, THEMES } from '../services/themeStore';
import { useAuth } from '../context/AuthContext';

interface GameAuthGateProps {
  activeTheme?: ThemeConfig;
  spaceLabel?: string;
  description?: string;
  pendingGameTitle?: string | null;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const GameAuthGate: React.FC<GameAuthGateProps> = ({
  activeTheme = THEMES.original,
  spaceLabel = 'Games',
  description = 'Sign in with your Google account to launch games, sync cloud saves across devices, and play with friends.',
  pendingGameTitle = null,
  isModal = false,
  onCloseModal
}) => {
  const { isAuthReady, loginGoogle, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const accent = activeTheme.accent || '#10b981';

  const handleSignIn = async () => {
    clearAuthError();
    setIsSigningIn(true);
    try {
      await loginGoogle();
    } catch {
      // authError is displayed via AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

  const cardContent = (
    <div
      className="relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl animate-fadeIn"
      style={{
        backgroundColor: activeTheme.bgCard || '#080f1d',
        borderColor: activeTheme.borderActive || accent,
        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.65), 0 0 36px ${activeTheme.accentGlow || 'rgba(16,185,129,0.2)'}`
      }}
    >
      {isModal && onCloseModal && (
        <button
          type="button"
          onClick={onCloseModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div
        className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 shadow-lg"
        style={{
          backgroundColor: activeTheme.accentBadge || 'rgba(16, 185, 129, 0.15)',
          borderColor: activeTheme.borderActive || accent
        }}
      >
        <Lock className="w-7 h-7" style={{ color: accent }} />
      </div>

      {!isAuthReady ? (
        <>
          <h2 className="text-xl font-black text-white tracking-tight">Checking Sign-In Session...</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            Restoring your Firebase account automatically so you stay signed in across updates.
          </p>
        </>
      ) : (
        <>
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border mb-2"
            style={{
              backgroundColor: activeTheme.accentBadge || 'rgba(16, 185, 129, 0.15)',
              borderColor: activeTheme.borderActive || accent,
              color: accent
            }}
          >
            Account Required
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {pendingGameTitle ? `Sign in to play ${pendingGameTitle}` : `Sign in to access ${spaceLabel}`}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm leading-relaxed">
            {description}
          </p>

          <div className="w-full grid grid-cols-3 gap-2 my-5 text-[11px] text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
              <Gamepad2 className="w-4 h-4" style={{ color: accent }} />
              <span className="font-semibold">All Games</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">Cloud Saves</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-1">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Multiplayer</span>
            </div>
          </div>

          {authError && (
            <div className="w-full mb-4 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-400/35 text-rose-200 text-xs text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="flex-1">{authError}</span>
              <button
                type="button"
                onClick={clearAuthError}
                className="text-rose-300 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleSignIn()}
            disabled={isSigningIn}
            className="w-full py-3.5 px-5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-60"
            style={{
              backgroundColor: accent,
              color: activeTheme.accentText || '#000000',
              boxShadow: `0 10px 28px ${activeTheme.accentGlow || 'rgba(16,185,129,0.28)'}`
            }}
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>{isSigningIn ? 'Signing In...' : 'Sign in with Google to Play'}</span>
          </button>

          <div className="mt-4 pt-3 border-t w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400" style={{ borderColor: activeTheme.border }}>
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: accent }} />
            <span>You stay signed in automatically across updates</span>
          </div>
        </>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-[65] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onCloseModal}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex items-center justify-center p-6 min-h-[75vh]"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      {cardContent}
    </div>
  );
};
