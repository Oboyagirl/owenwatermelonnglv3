import React from 'react';
import { X, Check, Palette, Sparkles, RotateCcw } from 'lucide-react';
import { PRESET_THEMES, ThemeColors } from '../services/themeStore';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: string;
  onSelectTheme: (id: string) => void;
  customTheme: ThemeColors;
  onUpdateCustomTheme: (updates: Partial<ThemeColors>) => void;
  onResetCustomTheme: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  customTheme,
  onUpdateCustomTheme,
  onResetCustomTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#080f1d] border border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Theme Studio</h2>
              <p className="text-xs text-slate-400">Choose from {PRESET_THEMES.length} aesthetic palettes or customize your colors</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Themes Scroll Area */}
        <div className="flex flex-col gap-3 overflow-hidden flex-1 min-h-0">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 shrink-0">
            Preset Palettes ({PRESET_THEMES.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1.5 max-h-[45vh] scrollbar-thin">
            {PRESET_THEMES.map(theme => {
              const isSelected = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-all text-left cursor-pointer ${
                    isSelected ? 'border-emerald-500 bg-emerald-500/10 shadow-lg' : 'border-white/5 bg-slate-900/40 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{theme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.bgPrimary }} />
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }} />
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.borderActive }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Theme Accent Picker */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Custom Accent Color
            </span>
            <button 
              onClick={onResetCustomTheme}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="color" 
              value={customTheme.accent}
              onChange={(e) => onUpdateCustomTheme({ 
                accent: e.target.value,
                borderActive: e.target.value,
                accentGlow: e.target.value + '40'
              })}
              className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-300">{customTheme.accent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
