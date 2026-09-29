import React from 'react';
import { ShieldAlert, ExternalLink, Lock, Globe, Sparkles, Sliders } from 'lucide-react';
import { triggerPanic } from '../data/cloakPresets';
import { SiteSettings } from '../types/game';

export const REQUEST_GAME_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScEvS0_M84dApQkx9FOJCDq1kYtCwRHw1BWcJkGemU-fsLAkw/viewform';

interface HeaderProps {
  currentTab: 'games' | 'cloaker' | 'proxy';
  onSelectTab: (tab: 'games' | 'cloaker' | 'proxy') => void;
  onLockSite?: () => void;
  activeCloakTitle?: string;
  siteSettings: SiteSettings;
  isCreatorMode: boolean;
  onOpenEditor: () => void;
  onPromptPasswordForEditor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onLockSite,
  siteSettings,
  isCreatorMode,
  onOpenEditor,
  onPromptPasswordForEditor
}) => {
  return (
    <>
      {/* Top Announcement Banner if enabled */}
      {siteSettings.announcementActive && siteSettings.announcementText && (
        <div className="w-full bg-gradient-to-r from-[#0c2016] via-[#10b981]/20 to-[#0c2016] border-b border-[#10b981]/30 px-4 py-1.5 text-center text-xs font-medium text-emerald-300 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#10b981] animate-pulse" />
          <span>{siteSettings.announcementText}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full bg-[#08160f]/90 backdrop-blur-md border-b border-[#16402a] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Zone 1: Single text element brand wordmark */}
          <div 
            onClick={() => onSelectTab('games')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-lg shadow-sm group-hover:border-[#10b981] transition-colors select-none">
              🍉
            </div>
            <span className="text-lg lg:text-xl font-extrabold tracking-tight text-white group-hover:text-[#10b981] transition-colors whitespace-nowrap">
              {siteSettings.siteTitle || 'Owen Watermelon'}{' '}
              <span className="text-[#ff2d55]">V3</span>
            </span>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <button
              onClick={() => onSelectTab('games')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'games' ? 'text-[#10b981] font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Arcade Hub
            </button>
            <button
              onClick={() => onSelectTab('proxy')}
              className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'proxy' ? 'text-[#10b981] font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Proxy</span>
            </button>
            <button
              onClick={() => onSelectTab('cloaker')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                currentTab === 'cloaker' ? 'text-[#10b981] font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Tab Cloaker
            </button>
            <a
              href={REQUEST_GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-[#10b981] transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Request Game</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#10b981]" />
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Creator Mode / Site Editor Button */}
            {isCreatorMode ? (
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#064e3b] bg-[#10b981] hover:bg-[#34d399] rounded-lg shadow-md shadow-[#10b981]/25 transition-all whitespace-nowrap cursor-pointer animate-pulse"
                title="Superadmin Creator Mode (Unlocked by owenpanedit2244)"
              >
                <Sliders className="w-3.5 h-3.5 fill-current" />
                <span>Creator Studio</span>
              </button>
            ) : (
              <button
                onClick={onPromptPasswordForEditor}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0c2016] hover:bg-[#16402a] border border-[#16402a] rounded-lg transition-all whitespace-nowrap cursor-pointer"
                title="Enter owenpanedit2244 to unlock site editing"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Edit Site</span>
              </button>
            )}

            <a
              href={REQUEST_GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#064e3b] bg-[#10b981]/90 hover:bg-[#34d399] rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-md font-sans"
              title="Request a new game to be added"
            >
              <span>Request Game</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onLockSite && (
              <button
                onClick={onLockSite}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0c2016] hover:bg-[#16402a] border border-[#16402a] rounded-lg transition-all whitespace-nowrap cursor-pointer"
                title="Lock site with passcode"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}

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
        <div className="md:hidden flex items-center justify-around pt-3 border-t border-[#16402a] mt-2.5 text-xs">
          <button
            onClick={() => onSelectTab('games')}
            className={`cursor-pointer ${currentTab === 'games' ? 'text-[#10b981] font-bold' : 'text-slate-400'}`}
          >
            Arcade Hub
          </button>
          <button
            onClick={() => onSelectTab('proxy')}
            className={`cursor-pointer flex items-center gap-1 ${currentTab === 'proxy' ? 'text-[#10b981] font-bold' : 'text-slate-400'}`}
          >
            <Globe className="w-3 h-3" />
            <span>Proxy</span>
          </button>
          <button
            onClick={() => onSelectTab('cloaker')}
            className={`cursor-pointer ${currentTab === 'cloaker' ? 'text-[#10b981] font-bold' : 'text-slate-400'}`}
          >
            Tab Cloaker
          </button>
        </div>
      </header>
    </>
  );
};
