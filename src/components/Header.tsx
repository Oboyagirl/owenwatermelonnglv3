import React from 'react';
import { 
  ShieldAlert, 
  Palette, 
  Lock, 
  Search, 
  X, 
  Menu, 
  Dices, 
  EyeOff,
  Cloud,
  User as UserIcon
} from 'lucide-react';
import { triggerPanic } from '../data/cloakPresets';
import { SiteSettings } from '../types/game';
import { ThemeConfig } from '../services/themeStore';
import { useAuth } from '../context/AuthContext';
import { AVATAR_PRESETS } from '../services/cloudSaveService';

export const REQUEST_GAME_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScEvS0_M84dApQkx9FOJCDq1kYtCwRHw1BWcJkGemU-fsLAkw/viewform';

interface HeaderProps {
  currentTab: 'games' | 'cloaker';
  onSelectTab: (tab: 'games' | 'cloaker') => void;
  siteSettings: SiteSettings;
  activeTheme: ThemeConfig;
  onOpenThemeModal: () => void;
  onOpenAccountModal?: () => void;
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
  onOpenAccountModal,
  onLockSite,
  searchTerm = '',
  onSearchChange,
  onToggleMobileSidebar,
  onRandomGame
}) => {
  const { user, profile, saves, isGuest } = useAuth();
  const currentAvatar = AVATAR_PRESETS.find(a => a.id === (profile?.avatarId || 'melon_classic')) || AVATAR_PRESETS[0];
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
          <span>{siteSettings.announcementText}</span>
        </div>
      )}

      {/* Browser Chrome Header */}
      <header 
        className="sticky top-0 z-40 w-full backdrop-blur-xl border-b px-3 sm:px-5 py-2.5 transition-colors"
        style={{
          backgroundColor: activeTheme.bgHeader,
          borderColor: activeTheme.border,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="w-full mx-auto flex items-center justify-between gap-3">
          
          {/* Left Controls: Mobile Menu Toggle + Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white transition-colors border cursor-pointer"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Toggle Menu"
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
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm shadow-xs transition-transform group-hover:scale-105 shrink-0"
                style={{
                  backgroundColor: activeTheme.accentBadge,
                  borderColor: activeTheme.borderActive
                }}
              >
                {activeTheme.emoji || '🍉'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-tight">
                  Owen <span style={{ color: activeTheme.accent }}>V3</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Unblocked Arcade
                </span>
              </div>
            </button>
          </div>

          {/* Center: Search Field */}
          {onSearchChange && (
            <div className="flex-1 max-w-lg mx-auto">
              <div 
                className="relative flex items-center w-full rounded-xl border transition-all duration-200 group focus-within:ring-1"
                style={{
                  backgroundColor: activeTheme.bgPrimary,
                  borderColor: activeTheme.border,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
                }}
              >
                <div className="pl-3 pr-2 pointer-events-none flex items-center gap-1.5 text-slate-400">
                  <Search className="w-3.5 h-3.5" style={{ color: searchTerm ? activeTheme.accent : undefined }} />
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search games, 2-player, genres..."
                  className="w-full py-1.5 text-xs text-white placeholder-slate-500 bg-transparent focus:outline-none font-medium"
                />

                {searchTerm ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-1 mr-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="pr-2.5 hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 pointer-events-none">
                    <kbd className="px-1 py-0.5 rounded border border-white/10 bg-white/5">⌘K</kbd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Tools Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Random Game */}
            {onRandomGame && (
              <button
                onClick={onRandomGame}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-slate-300 hover:text-white"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Shuffle Random Game"
              >
                <Dices className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                <span>Random</span>
              </button>
            )}

            {/* Tab Cloaker */}
            <button
              onClick={() => onSelectTab(currentTab === 'cloaker' ? 'games' : 'cloaker')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer"
              style={{
                backgroundColor: currentTab === 'cloaker' ? activeTheme.accentBadge : activeTheme.bgCard,
                borderColor: currentTab === 'cloaker' ? activeTheme.borderActive : activeTheme.border,
                color: currentTab === 'cloaker' ? activeTheme.accent : '#94a3b8'
              }}
              title="Tab Cloaker & Stealth Camouflage"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{currentTab === 'cloaker' ? 'Cloaker Active' : 'Cloak'}</span>
            </button>

            {/* Gamer Account & Cloud Saves Vault */}
            {onOpenAccountModal && (
              <button
                onClick={onOpenAccountModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer relative"
                style={{
                  backgroundColor: user ? activeTheme.accentBadge : activeTheme.bgCard,
                  borderColor: user ? activeTheme.borderActive : activeTheme.border,
                  color: user ? activeTheme.accent : '#cbd5e1'
                }}
                title={user ? `Signed in as ${profile?.displayName || 'Gamer'} (${saves.length} cloud saves synced)` : 'Sign in to sync game saves across devices'}
              >
                {user ? (
                  <>
                    <span className="text-sm leading-none">{currentAvatar.icon}</span>
                    <span className="hidden md:inline font-bold max-w-[100px] truncate">
                      {profile?.displayName || 'Gamer'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" title="Cloud Sync Active" />
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline font-medium">Cloud Saves</span>
                  </>
                )}
              </button>
            )}

            {/* Theme Selector */}
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer hover:border-white/20"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border,
                color: '#ffffff'
              }}
              title="Change Theme"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span className="hidden sm:inline font-medium" style={{ color: activeTheme.accent }}>
                {activeTheme.name.split(' ')[0]}
              </span>
            </button>

            {/* Lock Site */}
            {onLockSite && (
              <button
                onClick={onLockSite}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg border transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Lock with passcode"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Panic Button */}
            <button
              onClick={triggerPanic}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-[#ff2d55] hover:bg-[#e11d48] rounded-lg transition-colors cursor-pointer"
              title="Emergency Panic: Instantly disguise tab to Google Classroom"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Panic</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
