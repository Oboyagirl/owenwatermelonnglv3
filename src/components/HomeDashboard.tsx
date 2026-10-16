import React from 'react';
import { 
  Gamepad2, 
  Globe, 
  Music, 
  Bot, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  Play, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { Game } from '../types/game';
import { ThemeColors } from '../services/themeStore';
import { resolveAssetUrl } from '../utils/assetUrl';

interface HomeDashboardProps {
  onNavigateTab: (space: any) => void;
  onSelectGame: (game: Game) => void;
  featuredGames: Game[];
  trendingGames: Game[];
  onSearchSubmit: (q: string) => void;
  onOpenThemeModal: () => void;
  activeTheme: ThemeColors;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigateTab,
  onSelectGame,
  featuredGames,
  trendingGames,
  onSearchSubmit,
  onOpenThemeModal,
  activeTheme
}) => {
  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">
      {/* Hero Welcome Banner */}
      <div 
        className="p-8 md:p-12 rounded-3xl border relative overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col justify-between min-h-[260px]"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border
        }}
      >
        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍉</span>
            <span className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: activeTheme.accent }}>
              Owen Watermelon V3
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-medium">
              Filter-Free Unblocked
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1">
            Play 830+ Games & Stream Studio Music
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
            School-friendly unblocked arcade with integrated Web Proxy, full album music player, tab cloaker, and cross-device cloud saves.
          </p>
        </div>

        {/* Quick Launch Action Pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6">
          <button 
            onClick={() => onNavigateTab('games')}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-slate-950 flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            style={{ backgroundColor: activeTheme.accent }}
          >
            <Gamepad2 className="w-4 h-4 fill-current" /> Browse Games
          </button>
          <button 
            onClick={() => onNavigateTab('music')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Music className="w-4 h-4 text-emerald-400" /> Open Music Studio
          </button>
          <button 
            onClick={() => onNavigateTab('proxy')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-sky-400" /> Web Proxy
          </button>
          <button 
            onClick={() => onNavigateTab('ai')}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-purple-400" /> Ask MelonBot
          </button>
        </div>
      </div>

      {/* Featured Games Section */}
      {featuredGames.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Featured Owen Hits</span>
            </h2>
            <button 
              onClick={() => onNavigateTab('games')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {featuredGames.slice(0, 6).map(game => (
              <div 
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 group hover:border-emerald-500/50 hover:bg-white/5"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                  <img 
                    src={resolveAssetUrl(game.thumbnail)} 
                    alt={game.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                    {game.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {game.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Games Section */}
      {trendingGames.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Trending & Popular</span>
            </h2>
            <button 
              onClick={() => onNavigateTab('games')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {trendingGames.slice(0, 6).map(game => (
              <div 
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 group hover:border-emerald-500/50 hover:bg-white/5"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                  <img 
                    src={resolveAssetUrl(game.thumbnail)} 
                    alt={game.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                    {game.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {game.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
