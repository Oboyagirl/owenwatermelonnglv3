import React, { useEffect } from 'react';
import { ThemeColors } from '../services/themeStore';

interface WelcomeAnimationProps {
  activeTheme: ThemeColors;
  onComplete: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020813]/90 backdrop-blur-xl flex flex-col items-center justify-center animate-fadeIn">
      <div className="text-7xl md:text-8xl animate-bounce">🍉</div>
      <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-6">
        Owen Watermelon V3
      </h1>
      <p className="text-sm font-mono text-emerald-400 mt-2">
        Arcade & Unblocked Portal Initialized
      </p>
    </div>
  );
};
