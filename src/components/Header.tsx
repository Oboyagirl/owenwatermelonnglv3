import React from 'react';
import { ShieldAlert, ExternalLink, Sparkles, Palette, Lock } from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  siteSettings,
  activeTheme,
  onOpenThemeModal,
  onLockSite
}) => {
  return (
    <>
      {/* Top Announcement Banner if enabled */}
      {siteSettings.announcementActive && siteSettings.announcementText && (
        <div 
          className="w-full border-b px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 transition-colors"
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

      <header 
        className="sticky top-0 z-40 w-full backdrop-blur-md border-b px-4 lg:px-8 py-3.5 transition-colors"
        style={{
          backgroundColor: activeTheme.bgHeader,
          borderColor: activeTheme.border
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Wordmark */}
          <div 
            onClick={() => onSelectTab('games')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div 
              className="w-8 h-8 rounded-lg border flex items-center justify-center text-lg shadow-sm transition-colors select-none"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.border
              }}
            >
              {activeTheme.emoji}
            </div>
            <span className="text-lg lg:text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
              {siteSettings.siteTitle || 'Owen Watermelon'}{' '}
              <span style={{ color: activeTheme.accent }}>V3</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <button
              onClick={() => onSelectTab('games')}
              className="transition-colors whitespace-nowrap cursor-pointer font-semibold"
              style={{
                color: currentTab === 'games' ? activeTheme.accent : '#cbd5e1'
              }}
            >
              Arcade Hub
            </button>
            <button
              onClick={() => onSelectTab('cloaker')}
              className="transition-colors whitespace-nowrap cursor-pointer"
              style={{
                color: currentTab === 'cloaker' ? activeTheme.accent : '#cbd5e1'
              }}
            >
              Tab Cloaker
            </button>
            <a
              href={REQUEST_GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Request Game</span>
              <ExternalLink className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme Selector Button */}
            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer hover:scale-105"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.borderActive,
                color: '#ffffff'
              }}
              title="Change theme (Nebula, Sky, Original, Cyberpunk, etc.)"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-extrabold" style={{ color: activeTheme.accent }}>
                {activeTheme.emoji} {activeTheme.name.split(' ')[0]}
              </span>
            </button>

            {/* Request Game Link */}
            <a
              href={REQUEST_GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-md font-sans"
              style={{
                backgroundColor: activeTheme.accent,
                color: activeTheme.accentText
              }}
              title="Request a new game to be added"
            >
              <span>Request Game</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Lock Site Button */}
            {onLockSite && (
              <button
                onClick={onLockSite}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border transition-all whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
                title="Lock site with passcode (owenpan2244)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}

            {/* Emergency Panic Key Button */}
            <button
              onClick={triggerPanic}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#ff2d55] hover:bg-[#e11d48] rounded-lg shadow-sm shadow-[#ff2d55]/30 transition-all whitespace-nowrap cursor-pointer"
              title="Emergency Panic: Immediately disguises tab to Google Classroom"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              <span>Panic (Esc)</span>
            </button>
          </div>
        </div>

        {/* Mobile sub-nav bar */}
        <div 
          className="md:hidden flex items-center justify-around pt-3 border-t mt-2.5 text-xs"
          style={{ borderColor: activeTheme.border }}
        >
          <button
            onClick={() => onSelectTab('games')}
            className="cursor-pointer font-bold"
            style={{ color: currentTab === 'games' ? activeTheme.accent : '#94a3b8' }}
          >
            Arcade Hub
          </button>
          <button
            onClick={() => onSelectTab('cloaker')}
            className="cursor-pointer"
            style={{ color: currentTab === 'cloaker' ? activeTheme.accent : '#94a3b8' }}
          >
            Tab Cloaker
          </button>
          <button
            onClick={onOpenThemeModal}
            className="cursor-pointer flex items-center gap-1"
            style={{ color: activeTheme.accent }}
          >
            <span>{activeTheme.emoji}</span>
            <span>Themes</span>
          </button>
        </div>
      </header>
    </>
  );
};
