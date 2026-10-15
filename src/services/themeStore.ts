import { useState } from 'react';

export interface ThemeColors {
  id: string;
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgHeader: string;
  border: string;
  borderActive: string;
  accent: string;
  accentHover: string;
  accentBadge: string;
  accentGlow: string;
  starColors?: string[];
  emoji?: string;
  accentText?: string;
  kicker?: string;
}

export type ThemeConfig = ThemeColors;

export const PRESET_THEMES: ThemeColors[] = [
  {
    id: 'cyber-watermelon',
    name: 'Cyber Watermelon (Default)',
    bgPrimary: '#020813',
    bgSecondary: '#051329',
    bgCard: 'rgba(8, 20, 42, 0.75)',
    bgHeader: 'rgba(4, 12, 28, 0.85)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(16, 185, 129, 0.5)',
    accent: '#10b981',
    accentHover: '#059669',
    accentBadge: 'rgba(16, 185, 129, 0.15)',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    starColors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff'],
    emoji: '🍉',
    accentText: '#10b981',
    kicker: 'CYBER WATERMELON'
  },
  {
    id: 'neon-synthwave',
    name: 'Neon Synthwave',
    bgPrimary: '#0f051d',
    bgSecondary: '#1a0b33',
    bgCard: 'rgba(32, 14, 60, 0.75)',
    bgHeader: 'rgba(20, 8, 40, 0.85)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderActive: 'rgba(236, 72, 153, 0.6)',
    accent: '#ec4899',
    accentHover: '#db2777',
    accentBadge: 'rgba(236, 72, 153, 0.2)',
    accentGlow: 'rgba(236, 72, 153, 0.4)',
    starColors: ['#ec4899', '#a855f7', '#38bdf8', '#ffffff'],
    emoji: '👾',
    accentText: '#ec4899',
    kicker: 'NEON SYNTHWAVE'
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean Blue',
    bgPrimary: '#030d1a',
    bgSecondary: '#071830',
    bgCard: 'rgba(10, 30, 60, 0.75)',
    bgHeader: 'rgba(5, 18, 38, 0.85)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(56, 189, 248, 0.5)',
    accent: '#38bdf8',
    accentHover: '#0284c7',
    accentBadge: 'rgba(56, 189, 248, 0.15)',
    accentGlow: 'rgba(56, 189, 248, 0.3)',
    starColors: ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff'],
    emoji: '🌊',
    accentText: '#38bdf8',
    kicker: 'DEEP OCEAN'
  }
];

export const THEMES: Record<string, ThemeColors> = {
  original: PRESET_THEMES[0],
  cyber: PRESET_THEMES[0],
  synthwave: PRESET_THEMES[1],
  ocean: PRESET_THEMES[2],
  ...Object.fromEntries(PRESET_THEMES.map(t => [t.id, t]))
};

export function useThemeStore() {
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem('owen_theme_id') || 'cyber-watermelon';
    } catch {
      return 'cyber-watermelon';
    }
  });

  const [customTheme, setCustomTheme] = useState<ThemeColors>(() => {
    try {
      const saved = localStorage.getItem('owen_custom_theme');
      return saved ? JSON.parse(saved) : PRESET_THEMES[0];
    } catch {
      return PRESET_THEMES[0];
    }
  });

  const activeTheme = themeId === 'custom' 
    ? customTheme 
    : (PRESET_THEMES.find(t => t.id === themeId) || PRESET_THEMES[0]);

  const setTheme = (id: string) => {
    setThemeId(id);
    try {
      localStorage.setItem('owen_theme_id', id);
    } catch {}
  };

  const updateCustomTheme = (updates: Partial<ThemeColors>) => {
    const updated = { ...customTheme, ...updates, id: 'custom' };
    setCustomTheme(updated);
    setThemeId('custom');
    try {
      localStorage.setItem('owen_custom_theme', JSON.stringify(updated));
      localStorage.setItem('owen_theme_id', 'custom');
    } catch {}
  };

  const resetCustomTheme = () => {
    setCustomTheme(PRESET_THEMES[0]);
    setThemeId('cyber-watermelon');
  };

  return {
    themeId,
    activeTheme,
    setTheme,
    customTheme,
    updateCustomTheme,
    resetCustomTheme
  };
}
