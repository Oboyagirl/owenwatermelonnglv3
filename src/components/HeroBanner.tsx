import React, { useRef, useState } from 'react';
import { 
  Play, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Gamepad2, 
  Users, 
  Trophy, 
  Sparkles, 
  Heart, 
  Dices, 
  Coffee, 
  Tv, 
  Puzzle, 
  Ghost, 
  Compass, 
  Award, 
  Monitor, 
  Car, 
  Swords, 
  Star,
  ChevronDown,
  ChevronUp,
  TrendingUp
} from 'lucide-react';
import { Game } from '../types/game';
import { ThemeId, ThemeConfig, THEMES } from '../services/themeStore';

export interface CategoryMeta {
  name: string;
  icon: React.ElementType;
  tagline: string;
  accent: string;
  badge?: string;
}

export const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  'All': {
    name: 'All',
    icon: Gamepad2,
    tagline: 'Complete Library',
    accent: '#10b981',
    badge: 'All'
  },
  'Trending': {
    name: 'Trending',
    icon: TrendingUp,
    tagline: 'Most Played Now',
    accent: '#f43f5e',
    badge: 'Hot'
  },
  '2 Player Games': {
    name: '2 Player Games',
    icon: Users,
    tagline: '1v1 & Co-Op',
    accent: '#8b5cf6',
    badge: '1v1'
  },
  'Sawyer For Sawyer': {
    name: 'Sawyer For Sawyer',
    icon: Trophy,
    tagline: 'World Cup',
    accent: '#38bdf8',
    badge: 'Cup'
  },
  'Owen Watermelon OG’s': {
    name: 'Owen Watermelon OG’s',
    icon: Sparkles,
    tagline: 'Classics',
    accent: '#10b981',
    badge: 'OG'
  },
  'Favorites': {
    name: 'Favorites',
    icon: Heart,
    tagline: 'Starred',
    accent: '#ff2d55',
    badge: 'Saved'
  },
  'Potato Classics': {
    name: 'Potato Classics',
    icon: Dices,
    tagline: 'Potato Vault',
    accent: '#f59e0b',
    badge: 'Retro'
  },
  'Sports': {
    name: 'Sports',
    icon: Award,
    tagline: 'Athletics & Ball Games',
    accent: '#3b82f6',
    badge: 'Sports'
  },
  'Action': {
    name: 'Action',
    icon: Flame,
    tagline: 'Combat & Adrenaline',
    accent: '#ef4444',
    badge: 'Action'
  },
  'Racing': {
    name: 'Racing',
    icon: Car,
    tagline: 'Speed & Drifting',
    accent: '#f97316',
    badge: 'Speed'
  },
  'Cooking Sim': {
    name: 'Cooking Sim',
    icon: Coffee,
    tagline: "Papa's & Cooking",
    accent: '#eab308',
    badge: 'Cook'
  },
  'Multiplayer': {
    name: 'Multiplayer',
    icon: Swords,
    tagline: 'PvP & Versus',
    accent: '#6366f1',
    badge: 'PvP'
  },
  'Arcade': {
    name: 'Arcade',
    icon: Tv,
    tagline: 'Coin-Op Hits',
    accent: '#06b6d4',
    badge: 'Arcade'
  },
  'Puzzle': {
    name: 'Puzzle',
    icon: Puzzle,
    tagline: 'Brain & Logic',
    accent: '#14b8a6',
    badge: 'Logic'
  },
  'Horror': {
    name: 'Horror',
    icon: Ghost,
    tagline: 'Survival & Jumpscares',
    accent: '#a855f7',
    badge: 'Spooky'
  },
  'Retro': {
    name: 'Retro',
    icon: Monitor,
    tagline: '8-Bit & 16-Bit',
    accent: '#ec4899',
    badge: 'Pixel'
  },
  'Casual': {
    name: 'Casual',
    icon: Compass,
    tagline: 'Pick Up & Play',
    accent: '#10b981',
    badge: 'Casual'
  }
};

interface HeroBannerProps {
  featuredGame?: Game;
  onPlay: (game: Game) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  totalGames: number;
  categoryCounts?: Record<string, number>;
  activeTheme?: ThemeConfig;
  activeThemeId?: ThemeId;
  onSelectTheme?: (id: ThemeId) => void;
  onOpenThemeGallery?: () => void;
  onOpenCustomThemeStudio?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredGame,
  onPlay,
  activeCategory,
  onSelectCategory,
  categories,
  totalGames,
  categoryCounts = {},
  activeTheme = THEMES.original
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSpotlightCollapsed, setIsSpotlightCollapsed] = useState(false);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Sleek, Simplified Featured Spotlight */}
      {featuredGame && (
        <div 
          className="relative w-full rounded-2xl overflow-hidden border transition-all duration-300"
          style={{
            backgroundColor: activeTheme.bgSecondary,
            borderColor: activeTheme.border,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Subtle Clean Ambient Backdrop */}
          {featuredGame.thumbnail && !isSpotlightCollapsed && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
              <img
                src={featuredGame.thumbnail}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          )}

          {/* Spotlight Header / Toggle Strip */}
          <div className="relative z-10 px-5 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: activeTheme.accent }}>
              <Flame className="w-3.5 h-3.5 text-[#ff2d55]" />
              <span className="font-bold tracking-tight">Spotlight</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">{featuredGame.category}</span>
            </div>

            <button
              onClick={() => setIsSpotlightCollapsed(prev => !prev)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
              title={isSpotlightCollapsed ? "Expand Spotlight" : "Collapse Spotlight"}
            >
              <span>{isSpotlightCollapsed ? "Show Spotlight" : "Minimize"}</span>
              {isSpotlightCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isSpotlightCollapsed && (
            <div className="relative z-10 p-5 md:p-6 pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex flex-col gap-2 max-w-2xl">
                {/* Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {featuredGame.title}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {featuredGame.description}
                </p>

                {/* Clean Typography Metadata (Zero-Pill Discipline) */}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    {featuredGame.rating.toFixed(1)}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{featuredGame.plays.toLocaleString()} plays</span>
                  {featuredGame.secondaryCategory && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300">{featuredGame.secondaryCategory}</span>
                    </>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onPlay(featuredGame)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
                    style={{
                      backgroundColor: activeTheme.accent,
                      color: activeTheme.accentText,
                      boxShadow: `0 4px 16px ${activeTheme.accentGlow}`
                    }}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>

              {/* Compact Thumbnail Preview */}
              <div 
                onClick={() => onPlay(featuredGame)}
                className="hidden md:block relative w-44 aspect-[16/10] rounded-xl overflow-hidden border shadow-lg shrink-0 cursor-pointer group"
                style={{ borderColor: activeTheme.borderActive }}
              >
                <img
                  src={featuredGame.thumbnail}
                  alt={featuredGame.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: activeTheme.accent,
                      color: activeTheme.accentText
                    }}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STREAMLINED, UN-AI CATEGORY FILTERS */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Filters & Categories
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({totalGames} games)
            </span>
          </div>

          {/* Clean Carousel Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={scrollLeft}
              aria-label="Scroll categories left"
              className="p-1.5 rounded-lg border text-slate-400 hover:text-white transition-colors cursor-pointer"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
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
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean, Unified Segmented Filter Bar (100% Vector SVG, Zero AI Images) */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-track-transparent scroll-smooth select-none"
        >
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const meta = CATEGORY_METADATA[cat] || {
              name: cat,
              icon: Gamepad2,
              tagline: 'Arcade',
              accent: activeTheme.accent,
              badge: 'Games'
            };
            const Icon = meta.icon;
            const count = categoryCounts[cat] ?? 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer border shrink-0 ${
                  isActive
                    ? 'shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
                }`}
                style={{
                  backgroundColor: isActive ? activeTheme.accentBadge : activeTheme.bgCard,
                  borderColor: isActive ? activeTheme.borderActive : activeTheme.border,
                  color: isActive ? activeTheme.accent : undefined
                }}
              >
                {/* Clean Un-AI Vector Icon Container */}
                <div 
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: isActive ? meta.accent : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#000000' : meta.accent
                  }}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>

                {/* Category Label */}
                <span className="font-semibold tracking-tight">
                  {cat}
                </span>

                {/* Quiet Monospace Count */}
                <span 
                  className="text-[11px] font-mono tabular-nums opacity-60 ml-0.5"
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
