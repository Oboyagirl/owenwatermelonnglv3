import React, { useEffect } from 'react';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { ThemeId, ThemeConfig, THEMES } from '../services/themeStore';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme
}) => {
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

  const currentTheme = THEMES[activeThemeId] || THEMES.original;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl border flex flex-col overflow-hidden shadow-2xl transition-all"
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
                <span>Theme Gallery</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold" style={{ backgroundColor: currentTheme.accentBadge, color: currentTheme.accent }}>
                  13 Themes
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch visual styles, colorways, and animated starfield ambiances.
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

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 scrollbar-thin">
          {Object.values(THEMES).map((theme: ThemeConfig) => {
            const isActive = activeThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onSelectTheme(theme.id);
                }}
                className="group relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 overflow-hidden"
                style={{
                  backgroundColor: theme.bgCard,
                  borderColor: isActive ? theme.borderActive : theme.border,
                  boxShadow: isActive ? `0 0 20px ${theme.accentGlow}` : undefined,
                  transform: isActive ? 'scale(1.02)' : undefined
                }}
              >
                {/* Visual Swatches Header */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl filter drop-shadow">{theme.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                        {theme.name}
                        {isActive && (
                          <span 
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase"
                            style={{ backgroundColor: theme.accent, color: theme.accentText }}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            Active
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {theme.category}
                      </span>
                    </div>
                  </div>

                  {/* Palette Preview Bubbles */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.bgPrimary }}
                      title="Background"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.bgCard }}
                      title="Card Surface"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.accent }}
                      title="Accent"
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/80 leading-relaxed">
                  {theme.description}
                </p>

                {/* Bottom preview bar */}
                <div 
                  className="h-1.5 w-full rounded-full overflow-hidden flex"
                  style={{ backgroundColor: theme.border }}
                >
                  <div className="h-full w-1/3" style={{ backgroundColor: theme.accent }} />
                  <div className="h-full w-1/3" style={{ backgroundColor: theme.accentHover }} />
                  <div className="h-full w-1/3" style={{ backgroundColor: theme.borderActive }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div 
          className="p-4 sm:p-5 border-t flex items-center justify-between shrink-0 bg-black/20"
          style={{ borderColor: currentTheme.border }}
        >
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
            <span>Theme auto-saves to your browser preferences</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.accentText
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
