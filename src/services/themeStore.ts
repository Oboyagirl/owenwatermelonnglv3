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
  },
  {
    id: 'midnight-amoled',
    name: 'Midnight AMOLED',
    bgPrimary: '#000000',
    bgSecondary: '#080808',
    bgCard: 'rgba(18, 18, 18, 0.85)',
    bgHeader: 'rgba(10, 10, 10, 0.95)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(255, 255, 255, 0.6)',
    accent: '#f8fafc',
    accentHover: '#e2e8f0',
    accentBadge: 'rgba(255, 255, 255, 0.15)',
    accentGlow: 'rgba(255, 255, 255, 0.3)',
    starColors: ['#ffffff', '#cbd5e1', '#94a3b8'],
    emoji: '🌑',
    accentText: '#f8fafc',
    kicker: 'MIDNIGHT AMOLED'
  },
  {
    id: 'emerald-matrix',
    name: 'Matrix Hacker',
    bgPrimary: '#021206',
    bgSecondary: '#041f0a',
    bgCard: 'rgba(6, 36, 14, 0.75)',
    bgHeader: 'rgba(3, 20, 8, 0.9)',
    border: 'rgba(34, 197, 94, 0.15)',
    borderActive: 'rgba(34, 197, 94, 0.6)',
    accent: '#22c55e',
    accentHover: '#16a34a',
    accentBadge: 'rgba(34, 197, 94, 0.2)',
    accentGlow: 'rgba(34, 197, 94, 0.4)',
    starColors: ['#22c55e', '#4ade80', '#86efac'],
    emoji: '💻',
    accentText: '#22c55e',
    kicker: 'MATRIX HACKER'
  },
  {
    id: 'solar-sunset',
    name: 'Solar Flare Sunset',
    bgPrimary: '#140502',
    bgSecondary: '#240a04',
    bgCard: 'rgba(48, 14, 8, 0.75)',
    bgHeader: 'rgba(28, 8, 4, 0.9)',
    border: 'rgba(249, 115, 22, 0.15)',
    borderActive: 'rgba(249, 115, 22, 0.6)',
    accent: '#f97316',
    accentHover: '#ea580c',
    accentBadge: 'rgba(249, 115, 22, 0.2)',
    accentGlow: 'rgba(249, 115, 22, 0.4)',
    starColors: ['#f97316', '#fb923c', '#fde047'],
    emoji: '🌅',
    accentText: '#f97316',
    kicker: 'SOLAR FLARE'
  },
  {
    id: 'royal-void',
    name: 'Royal Void Purple',
    bgPrimary: '#0b0417',
    bgSecondary: '#16082e',
    bgCard: 'rgba(33, 12, 65, 0.75)',
    bgHeader: 'rgba(18, 6, 36, 0.9)',
    border: 'rgba(168, 85, 247, 0.15)',
    borderActive: 'rgba(168, 85, 247, 0.6)',
    accent: '#a855f7',
    accentHover: '#9333ea',
    accentBadge: 'rgba(168, 85, 247, 0.2)',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    starColors: ['#a855f7', '#c084fc', '#e9d5ff'],
    emoji: '🔮',
    accentText: '#a855f7',
    kicker: 'ROYAL VOID'
  },
  {
    id: 'sakura-blossom',
    name: 'Sakura Blossom',
    bgPrimary: '#17060f',
    bgSecondary: '#2b0c1c',
    bgCard: 'rgba(55, 16, 37, 0.75)',
    bgHeader: 'rgba(32, 9, 22, 0.9)',
    border: 'rgba(244, 114, 182, 0.15)',
    borderActive: 'rgba(244, 114, 182, 0.6)',
    accent: '#f472b6',
    accentHover: '#ec4899',
    accentBadge: 'rgba(244, 114, 182, 0.2)',
    accentGlow: 'rgba(244, 114, 182, 0.4)',
    starColors: ['#f472b6', '#fbcfe8', '#fda4af'],
    emoji: '🌸',
    accentText: '#f472b6',
    kicker: 'SAKURA BLOSSOM'
  },
  {
    id: 'crimson-vampire',
    name: 'Crimson Vampire',
    bgPrimary: '#140205',
    bgSecondary: '#240409',
    bgCard: 'rgba(48, 8, 16, 0.75)',
    bgHeader: 'rgba(28, 4, 10, 0.9)',
    border: 'rgba(239, 68, 68, 0.15)',
    borderActive: 'rgba(239, 68, 68, 0.6)',
    accent: '#ef4444',
    accentHover: '#dc2626',
    accentBadge: 'rgba(239, 68, 68, 0.2)',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    starColors: ['#ef4444', '#f87171', '#fca5a5'],
    emoji: '🩸',
    accentText: '#ef4444',
    kicker: 'CRIMSON VAMPIRE'
  },
  {
    id: 'golden-luxury',
    name: 'Golden Luxury',
    bgPrimary: '#0f0c02',
    bgSecondary: '#1f1804',
    bgCard: 'rgba(45, 36, 8, 0.75)',
    bgHeader: 'rgba(25, 20, 4, 0.9)',
    border: 'rgba(234, 179, 8, 0.15)',
    borderActive: 'rgba(234, 179, 8, 0.6)',
    accent: '#eab308',
    accentHover: '#ca8a04',
    accentBadge: 'rgba(234, 179, 8, 0.2)',
    accentGlow: 'rgba(234, 179, 8, 0.4)',
    starColors: ['#eab308', '#facc15', '#fef08a'],
    emoji: '👑',
    accentText: '#eab308',
    kicker: 'GOLDEN LUXURY'
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Glacier Frost',
    bgPrimary: '#031019',
    bgSecondary: '#062030',
    bgCard: 'rgba(10, 40, 60, 0.75)',
    bgHeader: 'rgba(5, 22, 35, 0.9)',
    border: 'rgba(6, 182, 212, 0.15)',
    borderActive: 'rgba(6, 182, 212, 0.6)',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    accentBadge: 'rgba(6, 182, 212, 0.2)',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    starColors: ['#06b6d4', '#67e8f9', '#cffafe'],
    emoji: '❄️',
    accentText: '#06b6d4',
    kicker: 'ARCTIC GLACIER'
  },
  {
    id: 'toxic-retro',
    name: 'Toxic Retro Arcade',
    bgPrimary: '#0a0f02',
    bgSecondary: '#142004',
    bgCard: 'rgba(26, 44, 8, 0.75)',
    bgHeader: 'rgba(15, 26, 4, 0.9)',
    border: 'rgba(132, 204, 22, 0.15)',
    borderActive: 'rgba(132, 204, 22, 0.6)',
    accent: '#84cc16',
    accentHover: '#65a30d',
    accentBadge: 'rgba(132, 204, 22, 0.2)',
    accentGlow: 'rgba(132, 204, 22, 0.4)',
    starColors: ['#84cc16', '#a3e635', '#d9f99d'],
    emoji: '☣️',
    accentText: '#84cc16',
    kicker: 'TOXIC RETRO'
  },
  {
    id: 'nord-arctic',
    name: 'Nordic Blue Dusk',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgCard: 'rgba(30, 41, 59, 0.75)',
    bgHeader: 'rgba(15, 23, 42, 0.9)',
    border: 'rgba(148, 163, 184, 0.15)',
    borderActive: 'rgba(56, 189, 248, 0.5)',
    accent: '#38bdf8',
    accentHover: '#0ea5e9',
    accentBadge: 'rgba(56, 189, 248, 0.2)',
    accentGlow: 'rgba(56, 189, 248, 0.3)',
    starColors: ['#38bdf8', '#818cf8', '#e2e8f0'],
    emoji: '🏔️',
    accentText: '#38bdf8',
    kicker: 'NORDIC DUSK'
  },
  {
    id: 'dracula-gothic',
    name: 'Dracula Gothic',
    bgPrimary: '#110c1f',
    bgSecondary: '#1d1533',
    bgCard: 'rgba(40, 30, 68, 0.75)',
    bgHeader: 'rgba(20, 14, 38, 0.9)',
    border: 'rgba(192, 132, 252, 0.15)',
    borderActive: 'rgba(192, 132, 252, 0.6)',
    accent: '#c084fc',
    accentHover: '#a855f7',
    accentBadge: 'rgba(192, 132, 252, 0.2)',
    accentGlow: 'rgba(192, 132, 252, 0.4)',
    starColors: ['#c084fc', '#f472b6', '#38bdf8', '#facc15'],
    emoji: '🧛',
    accentText: '#c084fc',
    kicker: 'DRACULA GOTHIC'
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy Dream',
    bgPrimary: '#13081e',
    bgSecondary: '#231038',
    bgCard: 'rgba(48, 22, 75, 0.75)',
    bgHeader: 'rgba(26, 11, 42, 0.9)',
    border: 'rgba(236, 72, 153, 0.2)',
    borderActive: 'rgba(56, 189, 248, 0.6)',
    accent: '#38bdf8',
    accentHover: '#0ea5e9',
    accentBadge: 'rgba(236, 72, 153, 0.25)',
    accentGlow: 'rgba(56, 189, 248, 0.4)',
    starColors: ['#f472b6', '#38bdf8', '#c084fc'],
    emoji: '🍬',
    accentText: '#38bdf8',
    kicker: 'COTTON CANDY'
  },
  {
    id: 'mocha-coffee',
    name: 'Mocha Espresso Warmth',
    bgPrimary: '#140c08',
    bgSecondary: '#24160f',
    bgCard: 'rgba(48, 30, 20, 0.75)',
    bgHeader: 'rgba(28, 17, 11, 0.9)',
    border: 'rgba(217, 119, 6, 0.15)',
    borderActive: 'rgba(217, 119, 6, 0.6)',
    accent: '#d97706',
    accentHover: '#b45309',
    accentBadge: 'rgba(217, 119, 6, 0.2)',
    accentGlow: 'rgba(217, 119, 6, 0.4)',
    starColors: ['#d97706', '#f59e0b', '#fde68a'],
    emoji: '☕',
    accentText: '#d97706',
    kicker: 'MOCHA ESPRESSO'
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
