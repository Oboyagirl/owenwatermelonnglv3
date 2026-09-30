import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';
import { triggerPanic } from '../data/cloakPresets';

interface PasscodeGateProps {
  onUnlock: (isCreator?: boolean) => void;
}

export const REQUIRED_PASSCODE = 'owenpan2244';
export const CREATOR_PASSCODE = 'owenpanedit2244';
export const PASSCODE_STORAGE_KEY = 'owen_watermelon_passcode_auth';

export const PasscodeGate: React.FC<PasscodeGateProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCreatorUnlocked, setIsCreatorUnlocked] = useState(false);

  // Allow global panic key on the gate screen as well
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim().toLowerCase();

    if (!cleanCode) {
      setError(true);
      setErrorMessage('Please enter the access code');
      return;
    }

    const isCreator = cleanCode === CREATOR_PASSCODE.toLowerCase();
    const isNormal = cleanCode === REQUIRED_PASSCODE.toLowerCase();

    if (isCreator || isNormal) {
      setIsSuccess(true);
      if (isCreator) {
        setIsCreatorUnlocked(true);
        try {
          localStorage.setItem('owen_creator_mode_active', 'true');
        } catch {}
      }
      setError(false);
      setErrorMessage('');

      try {
        if (rememberMe) {
          localStorage.setItem(PASSCODE_STORAGE_KEY, 'unlocked');
        } else {
          sessionStorage.setItem(PASSCODE_STORAGE_KEY, 'unlocked');
        }
      } catch {}

      setTimeout(() => {
        onUnlock(isCreator);
      }, 500);
    } else {
      setError(true);
      setErrorMessage('Incorrect code. Access denied.');
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-[#07130c] text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-[#ff2d55]/30 selection:text-white">
      {/* Background ambient neon glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#ff2d55]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="bg-[#0c2016]/95 border border-[#16402a] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
          
          {/* Logo badge with glowing ring */}
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10b981]/20 via-[#0c2016] to-[#ff2d55]/20 border-2 border-[#10b981] shadow-lg shadow-[#10b981]/20 flex items-center justify-center text-4xl select-none">
              🍉
            </div>
            <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border transition-colors ${
              isSuccess 
                ? 'bg-[#10b981] border-[#34d399] text-[#064e3b]' 
                : 'bg-[#ff2d55] border-[#fb7185] text-white shadow-md'
            }`}>
              {isSuccess ? <Unlock className="w-4 h-4 animate-bounce" /> : <Lock className="w-4 h-4" />}
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-black tracking-tight text-white mb-1.5">
            Owen Watermelon <span className="text-[#ff2d55]">V3</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
            This site is protected. Enter the access code to unlock unblocked games, stealth cloaker, and tools.
          </p>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-[#10b981]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                placeholder="Enter passcode..."
                className={`w-full pl-10 pr-11 py-3 bg-[#08160f] rounded-xl text-sm font-medium text-white placeholder-slate-500 border transition-all focus:outline-none ${
                  error
                    ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20 animate-shake'
                    : isSuccess
                    ? 'border-[#10b981] ring-2 ring-[#10b981]/20'
                    : 'border-[#16402a] focus:border-[#10b981]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg py-2 px-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-lg py-2 px-3 animate-pulse">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#10b981]" />
                <span>Code verified! Unlocking arcade...</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#16402a] bg-[#08160f] text-[#10b981] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
              <span className="text-[11px] text-slate-500">Security Gate</span>
            </div>

            <button
              type="submit"
              disabled={isSuccess}
              className="w-full py-3 px-4 bg-[#10b981] hover:bg-[#34d399] active:scale-[0.99] text-[#064e3b] font-bold text-sm rounded-xl shadow-lg shadow-[#10b981]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1"
            >
              {isSuccess ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Unlock Site</span>
                </>
              )}
            </button>
          </form>

          {/* Discreet footer note */}
          <div className="mt-6 pt-5 border-t border-[#16402a]/60 w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Passcode verification enabled</span>
          </div>

        </div>
      </div>
    </div>
  );
};
