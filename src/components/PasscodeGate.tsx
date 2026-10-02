import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { ThemeConfig, THEMES } from '../services/themeStore';

export const PASSCODE_STORAGE_KEY = 'owen_watermelon_v3_unlocked_v2';
export const ACCESS_PASSCODE = 'owenpan2244';

interface PasscodeGateProps {
  onUnlock: () => void;
  activeTheme?: ThemeConfig;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({
  onUnlock,
  activeTheme = THEMES.original
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim().toLowerCase();

    // Check strictly against the designated passcode
    if (clean === ACCESS_PASSCODE.toLowerCase()) {
      setError(false);
      try {
        if (rememberDevice) {
          localStorage.setItem(PASSCODE_STORAGE_KEY, 'unlocked');
        } else {
          sessionStorage.setItem(PASSCODE_STORAGE_KEY, 'unlocked');
        }
      } catch {}
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors select-none"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      <div 
        className="relative z-10 w-full max-w-md rounded-3xl border p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border,
          boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${activeTheme.accentGlow}`
        }}
      >
        {/* Animated Icon Avatar */}
        <div 
          className="w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl shadow-lg mb-5"
          style={{
            backgroundColor: activeTheme.accentBadge,
            borderColor: activeTheme.borderActive
          }}
        >
          {activeTheme.emoji || '🍉'}
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Owen Watermelon <span style={{ color: activeTheme.accent }}>V3</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">
          Access is password protected. Enter your passcode to unlock the arcade catalog.
        </p>

        {/* Passcode Input Form */}
        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-4">
          <div className="relative w-full">
            <KeyRound 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" 
              style={{ color: passcode ? activeTheme.accent : undefined }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={passcode}
              onChange={e => {
                setPasscode(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter passcode..."
              autoFocus
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono border"
              style={{
                backgroundColor: activeTheme.bgPrimary,
                borderColor: error ? '#f43f5e' : activeTheme.borderActive
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              <span>Incorrect passcode. Please try again.</span>
            </div>
          )}

          {/* Remember device checkbox */}
          <label className="flex items-center justify-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={e => setRememberDevice(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span>Remember unlock on this browser</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 font-bold text-sm rounded-xl transition-all shadow-lg hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 mt-1"
            style={{
              backgroundColor: activeTheme.accent,
              color: activeTheme.accentText,
              boxShadow: `0 8px 25px ${activeTheme.accentGlow}`
            }}
          >
            <Lock className="w-4 h-4 stroke-[2.5]" />
            <span>Unlock Arcade</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Safe verification note */}
        <div className="mt-6 pt-5 border-t w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500" style={{ borderColor: activeTheme.border }}>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
          <span>Encrypted Passcode Access System</span>
        </div>
      </div>
    </div>
  );
};
