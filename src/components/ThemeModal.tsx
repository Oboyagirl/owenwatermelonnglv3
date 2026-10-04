import React, { useState, useEffect } from 'react';
import { X, Check, Palette, Sparkles, Sliders, RefreshCw, Wand2 } from 'lucide-react';
import { 
  ThemeId, 
  ThemeConfig, 
  THEMES, 
  CustomThemeData, 
  DEFAULT_CUSTOM_THEME,
  buildCustomThemeConfig 
} from '../services/themeStore';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  customTheme?: CustomThemeData;
  onUpdateCustomTheme?: (updates: Partial<CustomThemeData>) => void;
  onResetCustomTheme?: () => void;
  initialTab?: 'gallery' | 'studio';
}

const PRESET_CUSTOM_PALETTES = [
  {
    name: 'Toxic Cyber',
    emoji: '☣️',
    accent: '#22c55e',
    bgPrimary: '#051108',
    bgCard: '#0d2315',
    border: '#1b4d2b',
    star1: '#22c55e',
    star2: '#86efac'
  },
  {
    name: 'Royal Gold',
    emoji: '👑',
    accent: '#f59e0b',
    bgPrimary: '#120d04',
    bgCard: '#251a09',
    border: '#573d12',
    star1: '#fbbf24',
    star2: '#ffffff'
  },
  {
    name: 'Neon Violet',
    emoji: '🔮',
    accent: '#a855f7',
    bgPrimary: '#0b0416',
    bgCard: '#1a0d31',
    border: '#3b1c6e',
    star1: '#c084fc',
    star2: '#38bdf8'
  },
  {
    name: 'Blood Moon',
    emoji: '🩸',
    accent: '#ef4444',
    bgPrimary: '#160407',
    bgCard: '#2b090f',
    border: '#5a1320',
    star1: '#f87171',
    star2: '#ffffff'
  },
  {
    name: 'Iceberg Cyan',
    emoji: '🧊',
    accent: '#06b6d4',
    bgPrimary: '#041216',
    bgCard: '#0a232b',
    border: '#154a5c',
    star1: '#22d3ee',
    star2: '#67e8f9'
  },
  {
    name: 'Sakura Candy',
    emoji: '🌸',
    accent: '#ec4899',
    bgPrimary: '#160410',
    bgCard: '#2b0a20',
    border: '#5a1544',
    star1: '#f472b6',
    star2: '#fbcfe8'
  }
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  customTheme = DEFAULT_CUSTOM_THEME,
  onUpdateCustomTheme,
  onResetCustomTheme,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'studio'>(
    initialTab || (activeThemeId === 'custom' ? 'studio' : 'gallery')
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || (activeThemeId === 'custom' ? 'studio' : 'gallery'));
    }
  }, [isOpen, initialTab, activeThemeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme = activeThemeId === 'custom' 
    ? buildCustomThemeConfig(customTheme) 
    : (THEMES[activeThemeId] || THEMES.petezah);

  const previewCustomConfig = buildCustomThemeConfig(customTheme);

  const applyPalette = (p: typeof PRESET_CUSTOM_PALETTES[0]) => {
    if (onUpdateCustomTheme) {
      onUpdateCustomTheme({
        name: p.name,
        emoji: p.emoji,
        accent: p.accent,
        accentHover: p.accent,
        bgPrimary: p.bgPrimary,
        bgSecondary: p.bgCard,
        bgCard: p.bgCard,
        border: p.border,
        borderActive: p.accent,
        starColor1: p.star1,
        starColor2: p.star2
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-all"
        style={{
          backgroundColor: currentTheme.bgSecondary,
          borderColor: currentTheme.border
        }}
      >
        {/* Header */}
        <div 
          className="p-5 sm:p-6 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: currentTheme.border }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
              style={{ backgroundColor: currentTheme.accentBadge }}
            >
              <Palette className="w-5 h-5" style={{ color: currentTheme.accent }} />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>Theme Gallery & Custom Studio</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a pre-made portal theme or craft your own personalized design.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close theme gallery"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'gallery'
                ? 'shadow-md text-white'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'gallery' ? currentTheme.accentBadge : undefined,
              borderColor: activeTab === 'gallery' ? currentTheme.borderActive : undefined,
              color: activeTab === 'gallery' ? currentTheme.accent : undefined
            }}
          >
            <Palette className="w-4 h-4" />
            <span>Preset Themes ({Object.keys(THEMES).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'studio'
                ? 'shadow-md text-white'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'studio' ? currentTheme.accentBadge : undefined,
              borderColor: activeTab === 'studio' ? currentTheme.borderActive : undefined,
              color: activeTab === 'studio' ? currentTheme.accent : undefined
            }}
          >
            <Sliders className="w-4 h-4" />
            <span>✨ Custom Theme Studio</span>
            {activeThemeId === 'custom' && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Presets Gallery */}
        {activeTab === 'gallery' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 custom-scrollbar">
            {/* Custom Theme Card shortcut */}
            <div
              onClick={() => {
                onSelectTheme('custom');
                setActiveTab('studio');
              }}
              className="p-4 rounded-2xl border-2 border-dashed text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group hover:scale-[1.02]"
              style={{
                backgroundColor: previewCustomConfig.bgCard,
                borderColor: activeThemeId === 'custom' ? previewCustomConfig.borderActive : 'rgba(255,255,255,0.2)',
                boxShadow: activeThemeId === 'custom' ? `0 0 20px ${previewCustomConfig.accentGlow}` : undefined
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{customTheme.emoji || '✨'}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{customTheme.name || 'My Custom Theme'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300 font-bold">
                        Studio
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Fully customizable color scheme
                    </span>
                  </div>
                </div>

                {activeThemeId === 'custom' ? (
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: previewCustomConfig.accent, color: previewCustomConfig.accentText }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-sky-400 font-bold group-hover:underline">
                    Customize →
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-5 h-5 rounded-md border" style={{ backgroundColor: customTheme.accent, borderColor: customTheme.border }} />
                <span className="w-5 h-5 rounded-md border" style={{ backgroundColor: customTheme.bgPrimary, borderColor: customTheme.border }} />
                <span className="w-5 h-5 rounded-md border" style={{ backgroundColor: customTheme.bgCard, borderColor: customTheme.border }} />
                <span className="text-[11px] text-slate-400 font-mono ml-auto">Click to edit</span>
              </div>
            </div>

            {/* All Built-in Themes */}
            {Object.values(THEMES).map((theme: ThemeConfig) => {
              const isActive = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme.id)}
                  className="group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 overflow-hidden"
                  style={{
                    backgroundColor: theme.bgCard,
                    borderColor: isActive ? theme.borderActive : theme.border,
                    boxShadow: isActive ? `0 0 20px ${theme.accentGlow}` : undefined,
                    transform: isActive ? 'scale(1.02)' : undefined
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl filter drop-shadow">{theme.emoji}</span>
                      <div>
                        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span>{theme.name}</span>
                          <span 
                            className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase border"
                            style={{ 
                              backgroundColor: theme.accentBadge, 
                              borderColor: theme.border,
                              color: theme.kicker 
                            }}
                          >
                            {theme.category}
                          </span>
                        </h3>
                      </div>
                    </div>

                    {isActive && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-150"
                        style={{ backgroundColor: theme.accent, color: theme.accentText }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {theme.description}
                  </p>

                  <div className="flex items-center gap-1.5 pt-2 border-t" style={{ borderColor: theme.border }}>
                    <div className="w-5 h-5 rounded-md border shadow-xs" style={{ backgroundColor: theme.accent, borderColor: theme.borderActive }} />
                    <div className="w-5 h-5 rounded-md border shadow-xs" style={{ backgroundColor: theme.bgPrimary, borderColor: theme.border }} />
                    <div className="w-5 h-5 rounded-md border shadow-xs" style={{ backgroundColor: theme.bgCard, borderColor: theme.border }} />
                    <div className="flex items-center gap-1 ml-auto">
                      {theme.starColors.slice(0, 3).map((c, i) => (
                        <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Theme Studio */}
        {activeTab === 'studio' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6 custom-scrollbar">
            {/* Quick Inspiration Palettes */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
                <span>1-Click Preset Palettes</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {PRESET_CUSTOM_PALETTES.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPalette(p)}
                    className="p-2.5 rounded-xl border flex flex-col items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                    style={{
                      backgroundColor: p.bgCard,
                      borderColor: p.border
                    }}
                    title={`Apply ${p.name}`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-[11px] font-bold text-white truncate max-w-full">
                      {p.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accent }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.star1 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Theme Form Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name & Emoji */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Theme Name</label>
                <input
                  type="text"
                  value={customTheme.name}
                  onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ name: e.target.value })}
                  placeholder="e.g. Laser Neon"
                  className="px-3.5 py-2 rounded-xl text-xs text-white border bg-black/40 focus:outline-none"
                  style={{ borderColor: currentTheme.border }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Emoji Icon</label>
                <input
                  type="text"
                  value={customTheme.emoji}
                  onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ emoji: e.target.value })}
                  placeholder="e.g. ⚡, 🍉, 🚀"
                  className="px-3.5 py-2 rounded-xl text-xs text-white border bg-black/40 focus:outline-none"
                  style={{ borderColor: currentTheme.border }}
                />
              </div>

              {/* Accent Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Primary Accent Color</span>
                  <span className="font-mono text-[10px] text-slate-400">{customTheme.accent}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customTheme.accent}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ 
                      accent: e.target.value,
                      accentHover: e.target.value,
                      borderActive: e.target.value
                    })}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customTheme.accent}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ 
                      accent: e.target.value,
                      accentHover: e.target.value,
                      borderActive: e.target.value
                    })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white border bg-black/40 focus:outline-none"
                    style={{ borderColor: currentTheme.border }}
                  />
                </div>
              </div>

              {/* Primary Background Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Deep Background</span>
                  <span className="font-mono text-[10px] text-slate-400">{customTheme.bgPrimary}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customTheme.bgPrimary}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ 
                      bgPrimary: e.target.value,
                      bgSecondary: e.target.value
                    })}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customTheme.bgPrimary}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ 
                      bgPrimary: e.target.value,
                      bgSecondary: e.target.value
                    })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white border bg-black/40 focus:outline-none"
                    style={{ borderColor: currentTheme.border }}
                  />
                </div>
              </div>

              {/* Card Surface Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Card Surface Glass</span>
                  <span className="font-mono text-[10px] text-slate-400">{customTheme.bgCard}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customTheme.bgCard}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ bgCard: e.target.value })}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customTheme.bgCard}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ bgCard: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white border bg-black/40 focus:outline-none"
                    style={{ borderColor: currentTheme.border }}
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Border Outline</span>
                  <span className="font-mono text-[10px] text-slate-400">{customTheme.border}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customTheme.border}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ border: e.target.value })}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customTheme.border}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ border: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white border bg-black/40 focus:outline-none"
                    style={{ borderColor: currentTheme.border }}
                  />
                </div>
              </div>

              {/* Star Color 1 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Starfield Accent 1</span>
                  <span className="font-mono text-[10px] text-slate-400">{customTheme.starColor1}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customTheme.starColor1}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ starColor1: e.target.value })}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customTheme.starColor1}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ starColor1: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white border bg-black/40 focus:outline-none"
                    style={{ borderColor: currentTheme.border }}
                  />
                </div>
              </div>

              {/* Star Color 2 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Starfield Accent 2</span>
                  <span className="font-mono text-[10px] text-slate-400">{customTheme.starColor2}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customTheme.starColor2}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ starColor2: e.target.value })}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customTheme.starColor2}
                    onChange={e => onUpdateCustomTheme && onUpdateCustomTheme({ starColor2: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono text-white border bg-black/40 focus:outline-none"
                    style={{ borderColor: currentTheme.border }}
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: currentTheme.border }}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Interactive Preview
              </span>
              <div 
                className="p-5 rounded-2xl border shadow-xl flex flex-col gap-3.5 transition-colors"
                style={{
                  backgroundColor: previewCustomConfig.bgPrimary,
                  borderColor: previewCustomConfig.border
                }}
              >
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: previewCustomConfig.border }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{previewCustomConfig.emoji}</span>
                    <span className="font-extrabold text-sm text-white">{previewCustomConfig.name}</span>
                  </div>
                  <span 
                    className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase"
                    style={{
                      backgroundColor: previewCustomConfig.accentBadge,
                      color: previewCustomConfig.accent
                    }}
                  >
                    Preview Mode
                  </span>
                </div>

                <div 
                  className="p-3.5 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: previewCustomConfig.bgCard,
                    borderColor: previewCustomConfig.borderActive
                  }}
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">Sample Arcade Card</h4>
                    <p className="text-[11px] text-slate-400">How games and surfaces will appear</p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-md cursor-pointer"
                    style={{
                      backgroundColor: previewCustomConfig.accent,
                      color: previewCustomConfig.accentText
                    }}
                  >
                    Play Sample
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onResetCustomTheme}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                style={{ borderColor: currentTheme.border }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTheme('custom');
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                style={{
                  backgroundColor: previewCustomConfig.accent,
                  color: previewCustomConfig.accentText,
                  boxShadow: `0 8px 20px ${previewCustomConfig.accentGlow}`
                }}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save & Apply Custom Theme</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
