import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Gamepad2, 
  Globe, 
  Sparkles, 
  LayoutGrid, 
  Radio, 
  ShieldCheck, 
  Play, 
  Flame, 
  Star, 
  ChevronRight,
  Palette,
  Cloud,
  Bot
} from 'lucide-react';
import { Game } from '../types/game';
import { ThemeConfig } from '../services/themeStore';

interface HomeDashboardProps {
  onNavigateTab: (tab: 'home' | 'games' | 'proxy' | 'ai' | 'apps' | 'music' | 'gambling' | 'tools' | 'saved') => void;
  onSelectGame: (game: Game) => void;
  featuredGames: Game[];
  trendingGames: Game[];
  onSearchSubmit: (query: string) => void;
  onOpenThemeModal?: () => void;
  activeTheme?: ThemeConfig;
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
  const [currentTime, setCurrentTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'games' | 'web'>('all');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    if (searchCategory === 'web') {
      onNavigateTab('proxy');
    } else {
      onSearchSubmit(q);
      onNavigateTab('games');
    }
  };

  const spotlightGame = featuredGames[0] || trendingGames[0];
  const accent = activeTheme?.accent || '#10b981';
  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  return (
    <div className="flex-1 flex flex-col min-h-screen text-slate-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
        
        {/* Top Clock & Brand Greeting */}
        <div className="flex flex-col items-center text-center gap-3 pt-4 md:pt-8 animate-fadeIn">
          <button 
            onClick={onOpenThemeModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest shadow-lg cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)',
              borderColor: activeTheme?.borderActive || accent,
              color: accent
            }}
            title="Click to open Themes & Color Studio"
          >
            <span>{activeTheme?.emoji || '🍉'}</span>
            <span>OwenWatermelonV3 OS</span>
            <span className="text-[10px] opacity-80">· {activeTheme?.name || 'Theme'}</span>
            <Palette className="w-3.5 h-3.5 ml-1" />
          </button>

          <h1 
            className="text-6xl md:text-8xl font-black font-mono tracking-tight text-white"
            style={{
              textShadow: `0 0 50px ${accent}40`
            }}
          >
            {currentTime || '12:00'}
          </h1>
          <p className="text-sm md:text-base text-slate-300 font-medium max-w-lg">
            Unblocked Games, Web Proxy, Music Studio & Cloud Saves. Optimized for school iPads, Chromebooks & desktop.
          </p>

          {/* Central Omnibar Search */}
          <form 
            onSubmit={handleSearch}
            className="w-full max-w-2xl mt-4"
          >
            <div 
              className="relative flex items-center rounded-2xl border p-2 shadow-2xl transition-all focus-within:ring-2"
              style={{
                backgroundColor: cardBg,
                borderColor: border,
                boxShadow: `0 0 30px ${accent}15`
              }}
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games, websites, music, or enter URL..."
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchCategory('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    searchCategory === 'all' ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: searchCategory === 'all' ? accent : undefined
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setSearchCategory('games')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    searchCategory === 'games' ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: searchCategory === 'games' ? accent : undefined
                  }}
                >
                  Games
                </button>
                <button
                  type="button"
                  onClick={() => setSearchCategory('web')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    searchCategory === 'web' ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: searchCategory === 'web' ? accent : undefined
                  }}
                >
                  Proxy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-2xl text-black font-extrabold text-xs shadow-lg transition-all cursor-pointer ml-1"
                  style={{
                    backgroundColor: accent
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Spaces Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          <button
            onClick={() => onNavigateTab('games')}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
              style={{ backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.2)' }}
            >
              🎮
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-emerald-300">Games</span>
            <span className="text-[10px] text-slate-400">800+ Unblocked</span>
          </button>

          <button
            onClick={() => onNavigateTab('gambling')}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🎰
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-amber-300">Fake Gambling</span>
            <span className="text-[10px] text-slate-400">FakeStake & Plinko</span>
          </button>

          <button
            onClick={() => onNavigateTab('proxy')}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🌐
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-sky-300">Web Proxy</span>
            <span className="text-[10px] text-slate-400">Unblocked Browsing</span>
          </button>

          <button
            onClick={() => onNavigateTab('music')}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🎵
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-rose-300">Music</span>
            <span className="text-[10px] text-slate-400">Real MP3 Studio</span>
          </button>

          <button
            onClick={() => onNavigateTab('ai')}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🤖
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-amber-300">AI Chat</span>
            <span className="text-[10px] text-slate-400">Gemini Assistant</span>
          </button>

          <button
            onClick={() => onNavigateTab('tools')}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🛠️
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-purple-300">Tab Cloaker</span>
            <span className="text-[10px] text-slate-400">Google Camouflage</span>
          </button>

          <button
            onClick={onOpenThemeModal}
            className="group p-4 md:p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-2.5 cursor-pointer shadow-lg hover:-translate-y-1"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
              style={{ backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.2)' }}
            >
              🎨
            </div>
            <span className="text-xs md:text-sm font-bold text-white group-hover:text-emerald-300">Themes</span>
            <span className="text-[10px] text-slate-400">Custom Studio</span>
          </button>
        </div>

        {/* Spotlight Game & Trending Games Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spotlight Featured Game */}
          {spotlightGame && (
            <div 
              onClick={() => {
                onSelectGame(spotlightGame);
                onNavigateTab('games');
              }}
              className="lg:col-span-1 rounded-3xl overflow-hidden border p-5 flex flex-col justify-between shadow-xl cursor-pointer group relative"
              style={{
                backgroundColor: cardBg,
                borderColor: border
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Featured Spotlight
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  Popular Pick
                </span>
              </div>

              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden my-2 bg-slate-900">
                <img
                  src={spotlightGame.thumbnail}
                  alt={spotlightGame.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white truncate">{spotlightGame.title}</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg font-bold">
                    <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                {spotlightGame.description || 'Jump right into this fan-favorite unblocked game instantly in your browser.'}
              </p>
            </div>
          )}

          {/* Trending Games Shelf */}
          <div 
            className="lg:col-span-2 rounded-3xl border p-5 flex flex-col justify-between shadow-xl"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Trending Games</span>
              </div>
              <button
                onClick={() => onNavigateTab('games')}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
                style={{ color: accent }}
              >
                <span>View All Games</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(trendingGames.length > 0 ? trendingGames.slice(0, 4) : featuredGames.slice(0, 4)).map(g => (
                <div
                  key={g.id}
                  onClick={() => {
                    onSelectGame(g);
                    onNavigateTab('games');
                  }}
                  className="group flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-400/50 transition-all cursor-pointer p-2.5 gap-2 hover:-translate-y-1"
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 relative">
                    <img src={g.thumbnail} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                    {g.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {g.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
