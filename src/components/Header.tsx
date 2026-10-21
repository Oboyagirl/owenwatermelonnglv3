import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Lock, 
  Search, 
  Columns, 
  ShieldCheck, 
  Maximize2, 
  Menu, 
  Palette,
  Server,
  Disc3,
  Play,
  Pause,
  SkipForward,
  Music
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { AVATAR_PRESETS } from '../services/cloudSaveService';
import { triggerPanic } from '../data/cloakPresets';

export const REQUEST_GAME_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScEvS0_M84dApQkx9FOJCDq1kYtCwRHw1BWcJkGemU-fsLAkw/viewform';

interface HeaderProps {
  onBack?: () => void;
  onForward?: () => void;
  onReload?: () => void;
  onHome?: () => void;
  onOpenMusic?: () => void;
  omnibarValue?: string;
  onOmnibarSubmit?: (query: string) => void;
  onToggleSplit?: () => void;
  isSplitActive?: boolean;
  onOpenCloakerModal?: () => void;
  onOpenAccountModal?: () => void;
  onOpenThemeModal?: () => void;
  onToggleMobileSidebar?: () => void;
  activeTheme?: ThemeConfig;
  siteSettings?: any;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  onForward,
  onReload,
  onHome,
  onOpenMusic,
  omnibarValue = '',
  onOmnibarSubmit,
  onToggleSplit,
  isSplitActive,
  onOpenCloakerModal,
  onOpenAccountModal,
  onOpenThemeModal,
  onToggleMobileSidebar,
  activeTheme
}) => {
  const [inputValue, setInputValue] = useState(omnibarValue);
  const isGithubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  const { profile } = useAuth();
  const { currentTrack, isPlaying, togglePlay, nextTrack } = useMusic();
  const currentAvatar = AVATAR_PRESETS.find(a => a.id === (profile?.avatarId || 'melon_classic')) || AVATAR_PRESETS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onOmnibarSubmit && inputValue.trim()) {
      onOmnibarSubmit(inputValue.trim());
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const accentColor = activeTheme?.accent || '#06b6d4';
  const borderColor = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b px-3 md:px-5 py-2.5 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3 transition-colors"
      style={{
        backgroundColor: activeTheme?.bgHeader || '#040a14',
        borderColor: borderColor
      }}
    >
      {/* Left Navigation Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onBack}
          className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onForward}
          className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
          title="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onReload}
          className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
          title="Reload"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onHome}
          className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
          title="Home"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Center Omnibar Search & Address Input */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl relative">
        <div 
          className="flex items-center w-full rounded-2xl px-3.5 py-1.5 transition-all shadow-inner border"
          style={{
            backgroundColor: activeTheme?.bgCard || '#080f1d',
            borderColor: borderColor
          }}
        >
          <Lock className="w-3.5 h-3.5 mr-2.5 shrink-0" style={{ color: accentColor }} />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search games, websites, music, or enter URL..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="p-1 rounded-lg border transition-all cursor-pointer shrink-0 ml-1.5"
            style={{
              backgroundColor: activeTheme?.accentBadge || 'rgba(6, 182, 212, 0.2)',
              borderColor: activeTheme?.borderActive || accentColor,
              color: accentColor
            }}
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Right Browser Action Buttons */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {/* Environment Badge */}
        <div 
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] text-slate-300"
          style={{ backgroundColor: activeTheme?.bgCard, borderColor }}
        >
          <Server className="w-3 h-3" style={{ color: accentColor }} />
          <span>{isGithubPages ? 'GitHub Pages' : 'OwenV3 Server'}</span>
        </div>

        {/* Global Music Status Pill */}
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-xl border transition-all text-xs font-bold"
          style={{
            backgroundColor: isPlaying ? activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: isPlaying ? accentColor : borderColor,
            color: isPlaying ? accentColor : 'rgb(203, 213, 225)'
          }}
        >
          <button
            onClick={() => onOpenMusic ? onOpenMusic() : togglePlay()}
            className="flex items-center gap-1.5 hover:underline cursor-pointer max-w-[90px] sm:max-w-[130px] truncate"
            title={isPlaying ? `Now Playing: ${currentTrack?.title} by ${currentTrack?.artist} (Click to open Music)` : 'Click to open Music Studio'}
          >
            <Disc3 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline truncate text-[11px]">
              {isPlaying ? currentTrack?.title : 'MP3 Music'}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-white" />
            ) : (
              <Play className="w-3 h-3 fill-white ml-0.5" />
            )}
          </button>

          {isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextTrack();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer shrink-0 hidden sm:block"
              title="Next song"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Theme Modal Shortcut */}
        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            style={{
              backgroundColor: activeTheme?.accentBadge || 'rgba(255, 255, 255, 0.05)',
              borderColor: activeTheme?.borderActive || borderColor,
              color: accentColor
            }}
            title="Change Theme & Custom Colors"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden xl:inline">{activeTheme?.name || 'Theme'}</span>
          </button>
        )}

        {/* Split Screen Toggle */}
        {onToggleSplit && (
          <button
            onClick={onToggleSplit}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSplitActive 
                ? 'shadow-md' 
                : 'hover:text-white'
            }`}
            style={{
              backgroundColor: isSplitActive ? activeTheme?.accentBadge : 'rgba(255, 255, 255, 0.05)',
              borderColor: isSplitActive ? accentColor : borderColor,
              color: isSplitActive ? accentColor : 'rgb(203, 213, 225)'
            }}
            title="Toggle Split Screen View"
          >
            <Columns className="w-4 h-4" />
          </button>
        )}

        {/* Tab Cloaker Quick Trigger */}
        {onOpenCloakerModal && (
          <button
            onClick={onOpenCloakerModal}
            className="p-2 rounded-xl border transition-all cursor-pointer text-purple-300"
            style={{
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              borderColor: 'rgba(168, 85, 247, 0.3)'
            }}
            title="Disguise Tab (Google Classroom / Drive Cloaker)"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border transition-all cursor-pointer"
          style={{ borderColor }}
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Top Right Panic Button */}
        <button
          onClick={triggerPanic}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105 bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 hover:text-white shrink-0 ml-1"
          title="Emergency Panic Key (Esc) - Instantly disguise and redirect to Google Classroom"
        >
          <span className="text-sm">🚨</span>
          <span className="font-extrabold uppercase tracking-wide">Panic</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-black/40 rounded border border-white/10 text-slate-300">Esc</kbd>
        </button>

        {/* Profile Avatar */}
        {onOpenAccountModal && (
          <button
            onClick={onOpenAccountModal}
            className="w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow-md transition-all cursor-pointer hover:scale-105 ml-1"
            style={{
              backgroundColor: activeTheme?.accentBadge || 'rgba(6, 182, 212, 0.2)',
              borderColor: activeTheme?.borderActive || accentColor
            }}
            title="User Account"
          >
            {currentAvatar.icon || '🍉'}
          </button>
        )}
      </div>
    </header>
  );
};
