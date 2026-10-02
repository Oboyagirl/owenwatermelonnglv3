import React, { useRef } from 'react';
import { Play, Flame, Search, Check, ChevronLeft, ChevronRight, Sparkles, Palette } from 'lucide-react';
import { Game } from '../types/game';
import { ThemeId, ThemeConfig, THEMES } from '../services/themeStore';

export interface CategoryCardMeta {
  name: string;
  image: string;
  emoji: string;
  badge?: string;
  accent: string;
}

export const CATEGORY_CARDS_DATA: Record<string, CategoryCardMeta> = {
  'All': {
    name: 'All',
    emoji: '🌐',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    accent: '#10b981',
    badge: 'Complete Hub'
  },
  'Owen Watermelon OG’s': {
    name: 'Owen Watermelon OG’s',
    emoji: '🍉',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
    accent: '#10b981',
    badge: 'OG Hall of Fame'
  },
  'Favorites': {
    name: 'Favorites',
    emoji: '⭐',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    accent: '#ff2d55',
    badge: 'Your Starred'
  },
  'Potato Classics': {
    name: 'Potato Classics',
    emoji: '🥔',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    accent: '#f59e0b',
    badge: 'TripplePotato'
  },
  'Sports': {
    name: 'Sports',
    emoji: '⚽',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=80',
    accent: '#3b82f6',
    badge: 'Athletics'
  },
  'Action': {
    name: 'Action',
    emoji: '💥',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    accent: '#ef4444',
    badge: 'Combat & FPS'
  },
  'Racing': {
    name: 'Racing',
    emoji: '🏎️',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=80',
    accent: '#f97316',
    badge: 'High Speed'
  },
  'Cooking Sim': {
    name: 'Cooking Sim',
    emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=80',
    accent: '#eab308',
    badge: "Papa's Diner"
  },
  'Multiplayer': {
    name: 'Multiplayer',
    emoji: '👥',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    accent: '#8b5cf6',
    badge: '2-Player Arena'
  },
  'Arcade': {
    name: 'Arcade',
    emoji: '🕹️',
    image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=500&auto=format&fit=crop&q=80',
    accent: '#06b6d4',
    badge: 'Retro Coin-op'
  },
  'Puzzle': {
    name: 'Puzzle',
    emoji: '🧩',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    accent: '#14b8a6',
    badge: 'Brain Logic'
  },
  'Horror': {
    name: 'Horror',
    emoji: '👻',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    accent: '#a855f7',
    badge: 'Spooky & Jumpscare'
  },
  'Retro': {
    name: 'Retro',
    emoji: '👾',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
    accent: '#ec4899',
    badge: '8-Bit & 16-Bit'
  },
  'Casual': {
    name: 'Casual',
    emoji: '🎮',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    accent: '#10b981',
    badge: 'Quick Fun'
  }
};

interface HeroBannerProps {
  featuredGame?: Game;
  onPlay: (game: Game) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  totalGames: number;
  categoryCounts?: Record<string, number>;
  activeTheme?: ThemeConfig;
  activeThemeId?: ThemeId;
  onSelectTheme?: (id: ThemeId) => void;
  onOpenThemeGallery?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredGame,
  onPlay,
  searchTerm,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  categories,
  totalGames,
  categoryCounts = {},
  activeTheme = THEMES.original,
  activeThemeId = 'original',
  onSelectTheme,
  onOpenThemeGallery
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const heroArt = featuredGame?.banner || featuredGame?.thumbnail || '';

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const isOgCategory = (cat: string) => {
    const c = cat.toLowerCase();
    return c.includes('owen') && c.includes('og');
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Featured Banner Card */}
      {featuredGame && (
        <div 
          className="relative w-full rounded-3xl overflow-hidden border shadow-2xl transition-colors duration-300"
          style={{
            backgroundColor: activeTheme.bgSecondary,
            borderColor: activeTheme.border
          }}
        >
          {heroArt && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={heroArt}
                alt={featuredGame.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-20 scale-105 blur-[1px]"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          )}

          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-4xl">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: activeTheme.accent }}>
                <Flame className="w-4 h-4 text-[#ff2d55]" />
                <span>Featured Game · Owen Watermelon V3</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
                {featuredGame.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                {featuredGame.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1">
                <span 
                  className="px-2.5 py-1 rounded-md font-semibold border"
                  style={{
                    backgroundColor: activeTheme.accentBadge,
                    borderColor: activeTheme.border,
                    color: activeTheme.kicker
                  }}
                >
                  {featuredGame.category}
                </span>
                {featuredGame.secondaryCategory && (
                  <span className="px-2.5 py-1 rounded-md bg-[#8b5cf6]/20 text-[#c4b5fd] font-semibold border border-[#8b5cf6]/30">
                    {featuredGame.secondaryCategory}
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 font-medium">★ {featuredGame.rating.toFixed(1)} Rating</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{featuredGame.plays.toLocaleString()} Plays</span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => onPlay(featuredGame)}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: activeTheme.accentText,
                    boxShadow: `0 10px 25px ${activeTheme.accentGlow}`
                  }}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Featured Now</span>
                </button>
              </div>
            </div>

            <div 
              onClick={() => onPlay(featuredGame)}
              className="hidden lg:block relative w-56 aspect-[4/3] rounded-2xl overflow-hidden border-2 shadow-2xl shrink-0 cursor-pointer group"
              style={{ borderColor: activeTheme.accent }}
            >
              <img
                src={featuredGame.thumbnail}
                alt={featuredGame.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: activeTheme.accent,
                    color: activeTheme.accentText
                  }}
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK THEME CHANGER BAR */}
      <div 
        className="w-full p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg transition-colors"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border
        }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <Palette className="w-4 h-4" style={{ color: activeTheme.accent }} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Active Theme:
          </span>
          <span className="text-xs font-extrabold" style={{ color: activeTheme.accent }}>
            {activeTheme.emoji} {activeTheme.name}
          </span>
        </div>

        {/* Quick Theme Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {Object.values(THEMES).map((th: ThemeConfig) => {
            const isSelected = activeThemeId === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => onSelectTheme && onSelectTheme(th.id)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 hover:scale-105"
                style={{
                  backgroundColor: isSelected ? th.accent : 'rgba(0, 0, 0, 0.4)',
                  borderColor: isSelected ? th.accent : th.border,
                  color: isSelected ? th.accentText : '#cbd5e1',
                  boxShadow: isSelected ? `0 0 12px ${th.accentGlow}` : undefined
                }}
                title={th.description}
              >
                <span>{th.emoji}</span>
                <span>{th.name.split(' ')[0]}</span>
              </button>
            );
          })}

          {onOpenThemeGallery && (
            <button
              onClick={onOpenThemeGallery}
              className="px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ml-1"
              style={{
                backgroundColor: activeTheme.accentBadge,
                color: activeTheme.kicker
              }}
            >
              Gallery...
            </button>
          )}
        </div>
      </div>

      {/* PICTURE-BASED CATEGORIES SHOWCASE */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: activeTheme.accent }} />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Browse by Category
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({categories.length} sections)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              className="p-1.5 rounded-lg border text-slate-400 hover:text-white transition-colors cursor-pointer"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              aria-label="Scroll categories right"
              className="p-1.5 rounded-lg border text-slate-400 hover:text-white transition-colors cursor-pointer"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Category Cards Carousel */}
        <div 
          ref={scrollContainerRef}
          className="flex items-stretch gap-3.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scroll-smooth"
        >
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const meta = CATEGORY_CARDS_DATA[cat] || {
              name: cat,
              emoji: '🎮',
              image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
              accent: activeTheme.accent,
              badge: 'Games'
            };
            const count = categoryCounts[cat] ?? 0;
            const isOg = isOgCategory(cat);

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`group relative shrink-0 w-44 sm:w-48 h-32 rounded-2xl overflow-hidden text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'ring-2 shadow-lg scale-[1.02]'
                    : isOg
                    ? 'border-2 shadow-md hover:scale-[1.02]'
                    : 'border hover:scale-[1.01]'
                }`}
                style={{
                  borderColor: isActive 
                    ? activeTheme.borderActive 
                    : isOg 
                    ? activeTheme.accent 
                    : activeTheme.border,
                  boxShadow: isActive ? `0 0 18px ${activeTheme.accentGlow}` : undefined
                }}
              >
                {/* Background Picture */}
                <img
                  src={meta.image}
                  alt={cat}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 filter brightness-[0.7] group-hover:brightness-[0.85]"
                />

                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 transition-opacity ${
                  isActive
                    ? 'bg-gradient-to-t from-black/95 via-black/60 to-transparent'
                    : isOg
                    ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent'
                    : 'bg-gradient-to-t from-black/90 via-black/50 to-transparent'
                }`} />

                {/* Content Overlay */}
                <div className="relative h-full p-3.5 flex flex-col justify-between z-10">
                  {/* Top Row: Emoji / Badge / Active Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl filter drop-shadow">
                      {meta.emoji}
                    </span>

                    {isActive ? (
                      <span 
                        className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow"
                        style={{
                          backgroundColor: activeTheme.accent,
                          color: activeTheme.accentText
                        }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        Active
                      </span>
                    ) : meta.badge ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${
                        isOg 
                          ? 'bg-[#10b981]/30 text-[#a7f3d0] border border-[#10b981]/40' 
                          : 'bg-black/50 text-slate-200 border border-white/10'
                      }`}>
                        {meta.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom Row: Title and Game Count */}
                  <div className="flex flex-col gap-0.5">
                    <span 
                      className="text-sm font-extrabold tracking-tight truncate text-white"
                      style={{
                        color: isActive ? activeTheme.kicker : isOg ? '#a7f3d0' : '#ffffff'
                      }}
                    >
                      {cat}
                    </span>
                    <span className="text-[11px] font-medium text-slate-300/80 font-mono">
                      {count} {count === 1 ? 'Game' : 'Games'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND QUICK PILL BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={`Search ${totalGames} unblocked games...`}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors border"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.border
            }}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Compact Category Pills */}
        <div 
          className="flex items-center gap-1.5 p-1 rounded-xl overflow-x-auto scrollbar-none border"
          style={{
            backgroundColor: activeTheme.bgCard,
            borderColor: activeTheme.border
          }}
        >
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const isOg = isOgCategory(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? activeTheme.accent : undefined,
                  color: isActive ? activeTheme.accentText : isOg ? activeTheme.kicker : '#cbd5e1'
                }}
              >
                <span>{CATEGORY_CARDS_DATA[cat]?.emoji || '🎮'}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
