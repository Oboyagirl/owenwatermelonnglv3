import React from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  Sparkles, 
  Palette, 
  Lock, 
  Search, 
  X, 
  Menu, 
  Dices, 
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { triggerPanic } from '../data/cloakPresets';
import { SiteSettings } from '../types/game';
import { ThemeConfig } from '../services/themeStore';

export const REQUEST_GAME_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScEvS0_M84dApQkx9FOJCDq1kYtCwRHw1BWcJkGemU-fsLAkw/viewform';

interface HeaderProps {
  currentTab: 'games' | 'cloaker';
  onSelectTab: (tab: 'games' | 'cloaker') => void;
  siteSettings: SiteSettings;
  activeTheme: ThemeConfig;
  onOpenThemeModal: () => void;
  onLockSite?: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  onToggleMobileSidebar?: () => void;
  onRandomGame?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  siteSettings,
  activeTheme,
  onOpenThemeModal,
  onLockSite,
  searchTerm = '',
  onSearchChange,
  onToggleMobileSidebar,
  onRandomGame
}) => {
  return (
    <>
      {/* Top Announcement Banner if enabled */}
      {siteSettings.announcementActive && siteSettings.announcementText && (
        <div 
          className="w-full border-b px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 transition-colors z-50 relative"
          style={{ 
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.border,
            color: activeTheme.kicker
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: activeTheme.accent }} />
          <span>{siteSettings.announcementText}</span>
        </div>
      )}

      {/* PeteZah Browser Chrome Bar (.chrome-bar) */}
      <header 
        className="sticky top-0 z-40 w-full backdrop-blur-xl border-b px-3 sm:px-6 py-2.5 transition-colors"
        style={{
          backgroundColor: activeTheme.bgHeader,
          borderColor: activeTheme.border,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="w-full mx-auto flex items-center justify-between gap-3">
          
          {/* Left Controls: Mobile Menu Toggle + Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white transition-colors border cursor-pointer"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Toggle Navigation Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onSelectTab('games')}
              className="flex items-center gap-2.5 cursor-pointer select-none group text-left"
              title="Owen Watermelon V3"
            >
              <div 
                className="w-8 h-8 rounded-xl border flex items-center justify-center text-base shadow-sm transition-transform group-hover:scale-105 shrink-0"
                style={{
                  backgroundColor: activeTheme.accentBadge,
                  borderColor: activeTheme.borderActive
                }}
              >
                {activeTheme.emoji || '🍉'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-extrabold tracking-tight text-white leading-tight">
                  Owen <span style={{ color: activeTheme.accent }}>V3</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Arcade Browser
                </span>
              </div>
            </button>
          </div>

          {/* Center: PeteZah Browser Omnibar / Address Search Field */}
          {onSearchChange && (
            <div className="flex-1 max-w-xl mx-auto">
              <div 
                className="relative flex items-center w-full rounded-xl border transition-all duration-200 group focus-within:ring-1"
                style={{
                  backgroundColor: activeTheme.bgPrimary,
                  borderColor: activeTheme.border,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                <div className="pl-3.5 pr-2 pointer-events-none flex items-center gap-1.5 text-slate-500">
                  <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-sky-400 transition-colors" style={{ color: searchTerm ? activeTheme.accent : undefined }} />
                  <span className="text-[11px] font-mono text-slate-500 hidden lg:inline">owen://</span>
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search 288+ unblocked games, OGs, genres..."
                  className="w-full py-2 text-xs text-white placeholder-slate-500 bg-transparent focus:outline-none font-medium"
                />

                {searchTerm ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1.5 mr-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="pr-3 hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 pointer-events-none">
                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5">⌘K</kbd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Tools & Action Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Random Game Button */}
            {onRandomGame && (
              <button
                onClick={onRandomGame}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-slate-300 hover:text-white"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Shuffle Random Unblocked Game"
              >
                <Dices className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                <span>Random</span>
              </button>
            )}

            {/* Tab Cloaker Quick Switch */}
            <button
              onClick={() => onSelectTab(currentTab === 'cloaker' ? 'games' : 'cloaker')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer"
              style={{
                backgroundColor: currentTab === 'cloaker' ? activeTheme.accentBadge : activeTheme.bgCard,
                borderColor: currentTab === 'cloaker' ? activeTheme.borderActive : activeTheme.border,
                color: currentTab === 'cloaker' ? activeTheme.accent : '#94a3b8'
              }}
              title="Toggle Tab Cloaker & Stealth Camouflage"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{currentTab === 'cloaker' ? 'Cloaker Active' : 'Cloak'}</span>
            </button>

            {/* Theme Selector Button */}
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer hover:scale-105"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.borderActive,
                color: '#ffffff'
              }}
              title="Switch Themes"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span className="hidden sm:inline font-extrabold" style={{ color: activeTheme.accent }}>
                {activeTheme.emoji} {activeTheme.name.split(' ')[0]}
              </span>
            </button>

            {/* Lock Site Button */}
            {onLockSite && (
              <button
                onClick={onLockSite}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border transition-all whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Lock site with passcode (owenpan2244)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Lock</span>
              </button>
            )}

            {/* Emergency Panic Key Button */}
            <button
              onClick={triggerPanic}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#ff2d55] hover:bg-[#e11d48] rounded-xl shadow-sm shadow-[#ff2d55]/30 transition-all whitespace-nowrap cursor-pointer"
              title="Emergency Panic: Immediately hides tab to Google Classroom"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>Panic</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
