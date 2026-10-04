import React from 'react';
import { 
  Gamepad2, 
  Flame, 
  Heart, 
  EyeOff, 
  Palette, 
  Dices, 
  Lock, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import { triggerPanic } from '../data/cloakPresets';
import { REQUEST_GAME_URL } from './Header';

interface SidebarProps {
  currentTab: 'games' | 'cloaker';
  onSelectTab: (tab: 'games' | 'cloaker') => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onRandomGame: () => void;
  onOpenThemeModal: () => void;
  onLockSite?: () => void;
  activeTheme: ThemeConfig;
  totalGames: number;
  favoriteCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeCategory,
  onSelectCategory,
  onRandomGame,
  onOpenThemeModal,
  onLockSite,
  activeTheme,
  totalGames,
  favoriteCount,
  isCollapsed,
  onToggleCollapse
}) => {
  const isGames = currentTab === 'games';

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 select-none z-30 transition-all duration-300 border-r backdrop-blur-xl ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
      style={{
        backgroundColor: activeTheme.bgHeader,
        borderColor: activeTheme.border
      }}
    >
      {/* Top Brand Area */}
      <div 
        className="h-16 px-4 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: activeTheme.border }}
      >
        <button
          onClick={() => {
            onSelectTab('games');
            onSelectCategory('All');
          }}
          className="flex items-center gap-3 cursor-pointer text-left overflow-hidden group"
          title="Return to Home"
        >
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border shadow-md transition-transform group-hover:scale-105"
            style={{
              backgroundColor: activeTheme.accentBadge,
              borderColor: activeTheme.borderActive
            }}
          >
            {activeTheme.emoji || '🍉'}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-sm text-white tracking-tight leading-tight flex items-center gap-1.5 truncate">
                <span>Owen</span>
                <span style={{ color: activeTheme.accent }}>V3</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {totalGames} unblocked
              </span>
            </div>
          )}
        </button>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-auto border border-transparent hover:border-white/10"
          style={{
            color: '#94a3b8'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Stack */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 flex flex-col gap-5 custom-scrollbar">
        {/* Core Sections */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Browse Portal
            </span>
          )}

          {/* All Games */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('All');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && activeCategory === 'All'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && activeCategory === 'All' ? activeTheme.accentBadge : undefined,
              borderColor: isGames && activeCategory === 'All' ? activeTheme.borderActive : undefined,
              color: isGames && activeCategory === 'All' ? activeTheme.accent : undefined
            }}
            title="All Games"
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>All Games</span>}
          </button>

          {/* Trending & Hot */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('Sports'); // Or trending view
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && activeCategory === 'Sports'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && activeCategory === 'Sports' ? activeTheme.accentBadge : undefined,
              borderColor: isGames && activeCategory === 'Sports' ? activeTheme.borderActive : undefined,
              color: isGames && activeCategory === 'Sports' ? activeTheme.accent : undefined
            }}
            title="Trending & Sports"
          >
            <Flame className="w-4 h-4 shrink-0 text-amber-400" />
            {!isCollapsed && <span>Trending & Hot</span>}
          </button>

          {/* Owen OG Hall of Fame */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('Owen Watermelon OG’s');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && activeCategory === 'Owen Watermelon OG’s'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && activeCategory === 'Owen Watermelon OG’s' ? activeTheme.accentBadge : undefined,
              borderColor: isGames && activeCategory === 'Owen Watermelon OG’s' ? activeTheme.borderActive : undefined,
              color: isGames && activeCategory === 'Owen Watermelon OG’s' ? activeTheme.accent : undefined
            }}
            title="Owen Watermelon OG's"
          >
            <span className="text-base shrink-0 leading-none">🍉</span>
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Owen OG's</span>
                <span 
                  className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase border"
                  style={{
                    backgroundColor: activeTheme.accentBadge,
                    borderColor: activeTheme.border,
                    color: activeTheme.accent
                  }}
                >
                  Hall
                </span>
              </div>
            )}
          </button>

          {/* Starred Favorites */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('Favorites');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && activeCategory === 'Favorites'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && activeCategory === 'Favorites' ? activeTheme.accentBadge : undefined,
              borderColor: isGames && activeCategory === 'Favorites' ? activeTheme.borderActive : undefined,
              color: isGames && activeCategory === 'Favorites' ? '#ff2d55' : undefined
            }}
            title="Starred Favorites"
          >
            <Heart className="w-4 h-4 shrink-0 text-[#ff2d55]" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Favorites</span>
                {favoriteCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-[#ff2d55]/20 text-[#ff7597] font-bold">
                    {favoriteCount}
                  </span>
                )}
              </div>
            )}
          </button>

          {/* Tab Cloaker & Stealth */}
          <button
            onClick={() => onSelectTab('cloaker')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              currentTab === 'cloaker'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: currentTab === 'cloaker' ? activeTheme.accentBadge : undefined,
              borderColor: currentTab === 'cloaker' ? activeTheme.borderActive : undefined,
              color: currentTab === 'cloaker' ? activeTheme.accent : undefined
            }}
            title="Tab Cloaker & Stealth Camouflage"
          >
            <EyeOff className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Tab Cloaker</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  Stealth
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Quick Utilities / PeteZah Tools */}
        <div className="flex flex-col gap-1 pt-2 border-t" style={{ borderColor: activeTheme.border }}>
          {!isCollapsed && (
            <span className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Utilities
            </span>
          )}

          {/* Random Game */}
          <button
            onClick={onRandomGame}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Launch Random Game"
          >
            <Dices className="w-4 h-4 shrink-0" style={{ color: activeTheme.accent }} />
            {!isCollapsed && <span>Random Game</span>}
          </button>

          {/* Theme Gallery */}
          <button
            onClick={onOpenThemeModal}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Themes & Customization"
          >
            <Palette className="w-4 h-4 shrink-0" style={{ color: activeTheme.accent }} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Themes</span>
                <span className="text-[10px] text-slate-400">{activeTheme.emoji}</span>
              </div>
            )}
          </button>

          {/* Request Game */}
          <a
            href={REQUEST_GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            title="Request a new game"
          >
            <ExternalLink className="w-4 h-4 shrink-0" style={{ color: activeTheme.accent }} />
            {!isCollapsed && <span>Request Game</span>}
          </a>
        </div>
      </div>

      {/* Bottom Footer Actions (Lock & Panic) */}
      <div 
        className="p-3 border-t flex flex-col gap-2 shrink-0"
        style={{ borderColor: activeTheme.border }}
      >
        {onLockSite && (
          <button
            onClick={onLockSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border transition-colors cursor-pointer"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.border
            }}
            title="Lock site with passcode (owenpan2244)"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            {!isCollapsed && <span>Lock Site</span>}
          </button>
        )}

        <button
          onClick={triggerPanic}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#ff2d55] hover:bg-[#e11d48] transition-colors cursor-pointer shadow-md shadow-[#ff2d55]/20"
          title="Emergency Panic: Immediately hides tab"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
          {!isCollapsed && <span>Panic (Esc)</span>}
        </button>
      </div>
    </aside>
  );
};
