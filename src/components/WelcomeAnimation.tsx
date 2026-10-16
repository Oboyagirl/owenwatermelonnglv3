import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Play } from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';

interface WelcomeAnimationProps {
  onComplete: () => void;
  activeTheme: ThemeConfig;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
  onComplete,
  activeTheme
}) => {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 0: Initial flash & unlock sound visualization
    const t0 = setTimeout(() => setStage(1), 100);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 70);

    // Stage 2: Main title punch
    const t1 = setTimeout(() => setStage(2), 600);

    // Stage 3: Subtitle & status glow
    const t2 = setTimeout(() => setStage(3), 1400);

    // Fade out and complete
    const t3 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2800);

    const t4 = setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 250);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: activeTheme.bgPrimary || '#050c08',
      }}
    >
      {/* Background Radial Glow & Animated Rings */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
      >
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 animate-pulse transition-all duration-1000"
          style={{ backgroundColor: activeTheme.accent || '#10b981' }}
        />
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-[90px] opacity-30"
          style={{ backgroundColor: activeTheme.kicker || '#ff2d55' }}
        />

        {/* Cyber Grid Lines */}
        <div 
          className="absolute inset-0 opacity-[0.07]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${activeTheme.accent || '#10b981'} 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />

        {/* Expanding Energy Shockwaves */}
        <div 
          className="absolute w-[220px] h-[220px] rounded-full border border-dashed animate-ping opacity-25"
          style={{ borderColor: activeTheme.accent || '#10b981', animationDuration: '3s' }}
        />
        <div 
          className="absolute w-[440px] h-[440px] rounded-full border opacity-20 animate-pulse"
          style={{ borderColor: activeTheme.borderActive || '#10b981' }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">
        
        {/* Animated Watermelon Emblem Icon with Orbital Aura */}
        <div className="relative mb-6">
          <div 
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border flex items-center justify-center text-5xl sm:text-6xl shadow-2xl transition-all duration-700 transform ${
              stage >= 1 ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-12 opacity-0'
            }`}
            style={{
              backgroundColor: activeTheme.accentBadge || 'rgba(16, 185, 129, 0.15)',
              borderColor: activeTheme.borderActive || '#10b981',
              boxShadow: `0 0 50px ${activeTheme.accentGlow || 'rgba(16, 185, 129, 0.5)'}, 0 20px 40px rgba(0,0,0,0.8)`
            }}
          >
            <span className="drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
              {activeTheme.emoji || '🍉'}
            </span>
          </div>

          {/* Floating Sparkle Particles */}
          <Sparkles 
            className="absolute -top-3 -right-3 w-7 h-7 animate-spin text-emerald-400"
            style={{ color: activeTheme.accent, animationDuration: '6s' }}
          />
          <Zap 
            className="absolute -bottom-2 -left-3 w-6 h-6 animate-pulse text-rose-400"
            style={{ color: activeTheme.kicker }}
          />
        </div>

        {/* Security Decryption Tagline */}
        <div 
          className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase border mb-4 transition-all duration-500 ${
            stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{
            backgroundColor: activeTheme.accentBadge,
            borderColor: activeTheme.borderActive,
            color: activeTheme.accent
          }}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PASSCODE ACCEPTED • SYSTEM ONLINE</span>
        </div>

        {/* The Exact User Requested Title: "Welcome To The WatermelonBase" */}
        <h1 
          className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white transition-all duration-700 transform ${
            stage >= 2 ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-6 opacity-0'
          }`}
          style={{
            textShadow: `0 0 40px ${activeTheme.accentGlow || 'rgba(16, 185, 129, 0.6)'}, 0 4px 12px rgba(0,0,0,0.8)`
          }}
        >
          Welcome To The{' '}
          <span 
            className="inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-rose-400 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${activeTheme.accent}, #ffffff, ${activeTheme.kicker})`
            }}
          >
            WatermelonBase
          </span>
        </h1>

        {/* Subtitle & Catalog Status */}
        <p 
          className={`mt-4 text-xs sm:text-base text-slate-300 font-medium max-w-lg transition-all duration-500 ${
            stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          830+ Unblocked Games, Arcade Classics & Cloaking Tools Initialized
        </p>

        {/* Glowing Progress / Loading Bar */}
        <div 
          className={`w-full max-w-xs mt-8 h-2 rounded-full overflow-hidden border border-white/10 bg-black/40 p-0.5 transition-all duration-500 ${
            stage >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="h-full rounded-full transition-all duration-100 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: activeTheme.accent,
              boxShadow: `0 0 12px ${activeTheme.accent}`
            }}
          />
        </div>

        <div className="flex items-center justify-between w-full max-w-xs mt-2 text-[10px] font-mono text-slate-400">
          <span>INITIALIZING</span>
          <span style={{ color: activeTheme.accent }}>{progress}%</span>
        </div>

        {/* Skip Tip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="mt-8 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5 hover:border-white/20 hover:bg-white/5"
        >
          <span>Click to enter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
