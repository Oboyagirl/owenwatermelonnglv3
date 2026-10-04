import { useState, useEffect } from 'react';

export type ThemeId =
  | 'petezah'
  | 'original'
  | 'custom'
  | 'nebula'
  | 'sky'
  | 'cyberpunk'
  | 'sunset'
  | 'midnight'
  | 'ocean'
  | 'vaporwave'
  | 'crimson'
  | 'emerald'
  | 'amethyst'
  | 'autumn'
  | 'cherry-blossom';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'Space' | 'Nature' | 'Retro' | 'Vibrant' | 'Dark';
  emoji: string;
  description: string;
  // Core theme colors
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgHeader: string;
  border: string;
  borderActive: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentBadge: string;
  accentGlow: string;
  starColors: string[];
  kicker: string;
}

export const THEMES: Record<Exclude<ThemeId, 'custom'>, ThemeConfig> = {
  petezah: {
    id: 'petezah',
    name: 'PeteZah Obsidian',
    category: 'Dark',
    emoji: '🍕',
    description: 'The ultra-sleek PeteZah chrome portal style with obsidian glass and electric cyan.',
    bgPrimary: '#020810',
    bgSecondary: '#07101c',
    bgCard: '#0c1626',
    bgHeader: 'rgba(8, 14, 24, 0.88)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: '#38bdf8',
    accent: '#38bdf8',
    accentHover: '#60a5fa',
    accentText: '#020810',
    accentBadge: 'rgba(56, 189, 248, 0.15)',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    starColors: ['#38bdf8', '#60a5fa', '#93c5fd', '#ffffff', '#0284c7'],
    kicker: '#38bdf8'
  },
  original: {
    id: 'original',
    name: 'Original Watermelon',
    category: 'Vibrant',
    emoji: '🍉',
    description: 'The iconic deep emerald gaming aesthetic with juicy watermelon accents.',
    bgPrimary: '#07130c',
    bgSecondary: '#092015',
    bgCard: '#0c2016',
    bgHeader: 'rgba(8, 22, 15, 0.92)',
    border: '#16402a',
    borderActive: '#10b981',
    accent: '#10b981',
    accentHover: '#34d399',
    accentText: '#064e3b',
    accentBadge: 'rgba(16, 185, 129, 0.2)',
    accentGlow: 'rgba(16, 185, 129, 0.3)',
    starColors: ['#10b981', '#34d399', '#ffffff', '#ff2d55', '#a7f3d0'],
    kicker: '#10b981'
  },
  nebula: {
    id: 'nebula',
    name: 'Nebula Space',
    category: 'Space',
    emoji: '🌌',
    description: 'Deep cosmic violet space with glowing stellar dust and starlight cyan.',
    bgPrimary: '#090514',
    bgSecondary: '#130a2a',
    bgCard: '#1a0e38',
    bgHeader: 'rgba(11, 6, 26, 0.92)',
    border: '#311b61',
    borderActive: '#a855f7',
    accent: '#8b5cf6',
    accentHover: '#a78bfa',
    accentText: '#1e0842',
    accentBadge: 'rgba(139, 92, 246, 0.25)',
    accentGlow: 'rgba(139, 92, 246, 0.35)',
    starColors: ['#a855f7', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff'],
    kicker: '#c084fc'
  },
  sky: {
    id: 'sky',
    name: 'Sky Azure',
    category: 'Nature',
    emoji: '☁️',
    description: 'Open airy troposphere blue with crisp cloud highlights and bright cyan.',
    bgPrimary: '#071526',
    bgSecondary: '#0c223c',
    bgCard: '#0f2c4c',
    bgHeader: 'rgba(7, 21, 38, 0.92)',
    border: '#194572',
    borderActive: '#38bdf8',
    accent: '#0284c7',
    accentHover: '#38bdf8',
    accentText: '#ffffff',
    accentBadge: 'rgba(56, 189, 248, 0.25)',
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    starColors: ['#38bdf8', '#7dd3fc', '#ffffff', '#bae6fd', '#60a5fa'],
    kicker: '#38bdf8'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Retro',
    emoji: '⚡',
    description: 'Electric cybernetic yellow, hot neon pink and matrix obsidian black.',
    bgPrimary: '#0b090e',
    bgSecondary: '#18121f',
    bgCard: '#1f1629',
    bgHeader: 'rgba(11, 9, 14, 0.94)',
    border: '#3f254e',
    borderActive: '#facc15',
    accent: '#facc15',
    accentHover: '#fde047',
    accentText: '#181204',
    accentBadge: 'rgba(250, 204, 21, 0.2)',
    accentGlow: 'rgba(250, 204, 21, 0.4)',
    starColors: ['#facc15', '#ec4899', '#06b6d4', '#ffffff'],
    kicker: '#facc15'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Twilight',
    category: 'Nature',
    emoji: '🌅',
    description: 'Warm glowing twilight gradient with rich coral and golden amber.',
    bgPrimary: '#140817',
    bgSecondary: '#240d21',
    bgCard: '#2d1127',
    bgHeader: 'rgba(20, 8, 23, 0.92)',
    border: '#531b41',
    borderActive: '#f97316',
    accent: '#f97316',
    accentHover: '#fb923c',
    accentText: '#ffffff',
    accentBadge: 'rgba(249, 115, 22, 0.25)',
    accentGlow: 'rgba(249, 115, 22, 0.35)',
    starColors: ['#f97316', '#fbbf24', '#f43f5e', '#ffffff'],
    kicker: '#fb923c'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight OLED',
    category: 'Dark',
    emoji: '🌑',
    description: 'Ultra-pure obsidian black with crisp ice blue accents and silver lines.',
    bgPrimary: '#030508',
    bgSecondary: '#0a0e14',
    bgCard: '#101620',
    bgHeader: 'rgba(3, 5, 8, 0.95)',
    border: '#1e293b',
    borderActive: '#38bdf8',
    accent: '#0ea5e9',
    accentHover: '#38bdf8',
    accentText: '#ffffff',
    accentBadge: 'rgba(14, 165, 233, 0.2)',
    accentGlow: 'rgba(56, 189, 248, 0.3)',
    starColors: ['#ffffff', '#94a3b8', '#38bdf8', '#e2e8f0'],
    kicker: '#38bdf8'
  },
  ocean: {
    id: 'ocean',
    name: 'Abyssal Ocean',
    category: 'Nature',
    emoji: '🌊',
    description: 'Deep nautical marine navy with luminescent aqua currents.',
    bgPrimary: '#041018',
    bgSecondary: '#081c2b',
    bgCard: '#0d283c',
    bgHeader: 'rgba(4, 16, 24, 0.92)',
    border: '#133e5c',
    borderActive: '#14b8a6',
    accent: '#14b8a6',
    accentHover: '#2dd4bf',
    accentText: '#042f2e',
    accentBadge: 'rgba(20, 184, 166, 0.25)',
    accentGlow: 'rgba(20, 184, 166, 0.35)',
    starColors: ['#14b8a6', '#2dd4bf', '#38bdf8', '#ffffff'],
    kicker: '#2dd4bf'
  },
  vaporwave: {
    id: 'vaporwave',
    name: 'Vaporwave 80s',
    category: 'Retro',
    emoji: '🌴',
    description: 'Dreamy pastel synthwave purple with neon pink and mint turquoise.',
    bgPrimary: '#12071f',
    bgSecondary: '#200e36',
    bgCard: '#2b1348',
    bgHeader: 'rgba(18, 7, 31, 0.92)',
    border: '#4c227e',
    borderActive: '#f472b6',
    accent: '#ec4899',
    accentHover: '#f472b6',
    accentText: '#ffffff',
    accentBadge: 'rgba(236, 72, 153, 0.25)',
    accentGlow: 'rgba(236, 72, 153, 0.35)',
    starColors: ['#f472b6', '#2dd4bf', '#c084fc', '#fde047'],
    kicker: '#f472b6'
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Velvet',
    category: 'Vibrant',
    emoji: '🍷',
    description: 'Rich dark gothic burgundy with fiery blood ruby highlights.',
    bgPrimary: '#140509',
    bgSecondary: '#230b12',
    bgCard: '#300f19',
    bgHeader: 'rgba(20, 5, 9, 0.92)',
    border: '#571727',
    borderActive: '#e11d48',
    accent: '#e11d48',
    accentHover: '#f43f5e',
    accentText: '#ffffff',
    accentBadge: 'rgba(225, 29, 72, 0.25)',
    accentGlow: 'rgba(225, 29, 72, 0.35)',
    starColors: ['#e11d48', '#f43f5e', '#fb7185', '#ffffff'],
    kicker: '#f43f5e'
  },
  emerald: {
    id: 'emerald',
    name: 'Imperial Emerald',
    category: 'Nature',
    emoji: '🌲',
    description: 'Majestic deep evergreen forest with luminous royal jade crystal.',
    bgPrimary: '#04140b',
    bgSecondary: '#082516',
    bgCard: '#0d321f',
    bgHeader: 'rgba(4, 20, 11, 0.92)',
    border: '#154e32',
    borderActive: '#059669',
    accent: '#059669',
    accentHover: '#10b981',
    accentText: '#ffffff',
    accentBadge: 'rgba(5, 150, 105, 0.25)',
    accentGlow: 'rgba(5, 150, 105, 0.35)',
    starColors: ['#059669', '#10b981', '#34d399', '#ffffff'],
    kicker: '#34d399'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst Crystal',
    category: 'Vibrant',
    emoji: '🔮',
    description: 'Deep royal mystical quartz with bright radiant violet luminescence.',
    bgPrimary: '#0e051c',
    bgSecondary: '#190a33',
    bgCard: '#240f47',
    bgHeader: 'rgba(14, 5, 28, 0.92)',
    border: '#411c79',
    borderActive: '#9333ea',
    accent: '#9333ea',
    accentHover: '#a855f7',
    accentText: '#ffffff',
    accentBadge: 'rgba(147, 51, 234, 0.25)',
    accentGlow: 'rgba(147, 51, 234, 0.35)',
    starColors: ['#a855f7', '#c084fc', '#e9d5ff', '#ffffff'],
    kicker: '#c084fc'
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn Harvest',
    category: 'Nature',
    emoji: '🍂',
    description: 'Warm cozy maple forest with rich toasted pumpkin and golden honey.',
    bgPrimary: '#140a04',
    bgSecondary: '#241308',
    bgCard: '#2f1a0c',
    bgHeader: 'rgba(20, 10, 4, 0.92)',
    border: '#532d16',
    borderActive: '#d97706',
    accent: '#d97706',
    accentHover: '#f59e0b',
    accentText: '#ffffff',
    accentBadge: 'rgba(217, 119, 6, 0.25)',
    accentGlow: 'rgba(217, 119, 6, 0.35)',
    starColors: ['#d97706', '#f59e0b', '#ea580c', '#ffffff'],
    kicker: '#f59e0b'
  },
  'cherry-blossom': {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    category: 'Nature',
    emoji: '🌸',
    description: 'Nightfall sakura garden with delicate petal pink and rose mist.',
    bgPrimary: '#140710',
    bgSecondary: '#240d1e',
    bgCard: '#301328',
    bgHeader: 'rgba(20, 7, 16, 0.92)',
    border: '#542045',
    borderActive: '#f43f5e',
    accent: '#f43f5e',
    accentHover: '#fb7185',
    accentText: '#ffffff',
    accentBadge: 'rgba(244, 63, 94, 0.25)',
    accentGlow: 'rgba(244, 63, 94, 0.35)',
    starColors: ['#f43f5e', '#fb7185', '#fda4af', '#ffffff'],
    kicker: '#fb7185'
  }
};

export interface CustomThemeData {
  name: string;
  emoji: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  border: string;
  borderActive: string;
  accent: string;
  accentHover: string;
  starColor1: string;
  starColor2: string;
}

export const DEFAULT_CUSTOM_THEME: CustomThemeData = {
  name: 'My Custom Theme',
  emoji: '✨',
  bgPrimary: '#080812',
  bgSecondary: '#0f1020',
  bgCard: '#15172b',
  border: '#282b4a',
  borderActive: '#a855f7',
  accent: '#a855f7',
  accentHover: '#c084fc',
  starColor1: '#a855f7',
  starColor2: '#38bdf8'
};

export function buildCustomThemeConfig(custom: CustomThemeData): ThemeConfig {
  return {
    id: 'custom',
    name: custom.name || 'Custom Theme',
    category: 'Vibrant',
    emoji: custom.emoji || '✨',
    description: 'Your own personalized custom theme created with the Theme Studio.',
    bgPrimary: custom.bgPrimary,
    bgSecondary: custom.bgSecondary,
    bgCard: custom.bgCard,
    bgHeader: 'rgba(8, 10, 20, 0.92)',
    border: custom.border,
    borderActive: custom.borderActive || custom.accent,
    accent: custom.accent,
    accentHover: custom.accentHover || custom.accent,
    accentText: '#ffffff',
    accentBadge: custom.accent + '33',
    accentGlow: custom.accent + '44',
    starColors: [custom.starColor1, custom.starColor2, '#ffffff', custom.accent],
    kicker: custom.accent
  };
}

const THEME_STORAGE_KEY = 'owen_watermelon_active_theme_v2';
const CUSTOM_THEME_STORAGE_KEY = 'owen_custom_theme_v2';

export function useThemeStore() {
  const [customTheme, setCustomTheme] = useState<CustomThemeData>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CUSTOM_THEME, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_CUSTOM_THEME;
  });

  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && (saved === 'custom' || (saved in THEMES))) return saved;
    } catch {}
    return 'petezah';
  });

  const activeTheme = themeId === 'custom' 
    ? buildCustomThemeConfig(customTheme) 
    : (THEMES[themeId as Exclude<ThemeId, 'custom'>] || THEMES.petezah);

  const setTheme = (id: ThemeId) => {
    if (id === 'custom' || (id in THEMES)) {
      setThemeId(id);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {}
    }
  };

  const updateCustomTheme = (updates: Partial<CustomThemeData>) => {
    setCustomTheme(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetCustomTheme = () => {
    setCustomTheme(DEFAULT_CUSTOM_THEME);
    try {
      localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_THEME));
    } catch {}
  };

  const allThemes: ThemeConfig[] = [
    buildCustomThemeConfig(customTheme),
    ...Object.values(THEMES)
  ];

  return {
    themeId,
    activeTheme,
    setTheme,
    allThemes,
    customTheme,
    updateCustomTheme,
    resetCustomTheme
  };
}
