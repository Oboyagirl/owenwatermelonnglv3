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
  ExternalLink,
  Users,
  TrendingUp
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
  onOpenCustomThemeStudio?: () => void;
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
  onOpenCustomThemeStudio,
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
        {/* Core Navigation */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          )}

          {/* Arcade Games Hub */}
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
            title="Arcade Hub"
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Arcade Hub</span>}
          </button>

          {/* Trending */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('Trending');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && activeCategory === 'Trending'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && activeCategory === 'Trending' ? activeTheme.accentBadge : undefined,
              borderColor: isGames && activeCategory === 'Trending' ? activeTheme.borderActive : undefined,
              color: isGames && activeCategory === 'Trending' ? '#f43f5e' : undefined
            }}
            title="Trending Games (Most Played)"
          >
            <TrendingUp className="w-4 h-4 shrink-0 text-[#f43f5e]" />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Trending</span>
                <span className="text-[10px] font-mono text-rose-400 font-bold">
                  Hot
                </span>
              </div>
            )}
          </button>

          {/* 2 Player Games */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('2 Player Games');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && (activeCategory === '2 Player Games' || activeCategory === '2 Player')
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && (activeCategory === '2 Player Games' || activeCategory === '2 Player') ? activeTheme.accentBadge : undefined,
              borderColor: isGames && (activeCategory === '2 Player Games' || activeCategory === '2 Player') ? activeTheme.borderActive : undefined,
              color: isGames && (activeCategory === '2 Player Games' || activeCategory === '2 Player') ? '#a78bfa' : undefined
            }}
            title="2 Player Games (Local 1v1 & Co-op)"
          >
            <Users className="w-4 h-4 shrink-0" style={{ color: '#a78bfa' }} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>2 Player Games</span>
                <span className="text-[10px] font-mono text-violet-300">
                  1v1
                </span>
              </div>
            )}
          </button>

          {/* Sawyer For Sawyer */}
          <button
            onClick={() => {
              onSelectTab('games');
              onSelectCategory('Sawyer For Sawyer');
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isGames && activeCategory === 'Sawyer For Sawyer'
                ? 'shadow-md'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isGames && activeCategory === 'Sawyer For Sawyer' ? activeTheme.accentBadge : undefined,
              borderColor: isGames && activeCategory === 'Sawyer For Sawyer' ? activeTheme.borderActive : undefined,
              color: isGames && activeCategory === 'Sawyer For Sawyer' ? '#38bdf8' : undefined
            }}
            title="Sawyer For Sawyer Category"
          >
            <span className="text-base shrink-0 leading-none">🏆</span>
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Sawyer For Sawyer</span>
                <span className="text-[10px] font-mono text-sky-300">
                  Cup
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
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Stealth
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Themes & Custom Creator */}
        <div className="flex flex-col gap-1 pt-2 border-t" style={{ borderColor: activeTheme.border }}>
          {!isCollapsed && (
            <span className="px-2.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Themes & Styles
            </span>
          )}

          {/* Make Custom Theme Button */}
          <button
            onClick={() => onOpenCustomThemeStudio ? onOpenCustomThemeStudio() : onOpenThemeModal()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-sm group hover:scale-[1.02]"
            style={{
              backgroundColor: activeTheme.accentBadge,
              borderColor: activeTheme.borderActive,
              color: activeTheme.kicker
            }}
            title="Create your own custom theme"
          >
            <Sparkles className="w-4 h-4 shrink-0 animate-pulse" style={{ color: activeTheme.accent }} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Custom Theme</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300 font-bold uppercase">
                  Studio
                </span>
              </div>
            )}
          </button>

          {/* Theme Gallery */}
          <button
            onClick={onOpenThemeModal}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Theme Gallery"
          >
            <Palette className="w-4 h-4 shrink-0" style={{ color: activeTheme.accent }} />
            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span>Theme Gallery</span>
                <span className="text-[10px] text-slate-400">{activeTheme.emoji}</span>
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
