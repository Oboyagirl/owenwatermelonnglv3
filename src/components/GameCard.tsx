import React, { useState } from 'react';
import { Play, Heart, Star } from 'lucide-react';
import { Game } from '../types/game';
import { resolveAssetUrl } from '../services/gamesStore';
import { ThemeConfig, THEMES } from '../services/themeStore';

// In-memory session cache so loaded images render instantly with 0ms transition on filter/tab switch
const LOADED_IMAGE_CACHE = new Set<string>();

const CATEGORY_META: Record<string, { gradient: string; emoji: string }> = {
  'sports': { gradient: 'from-emerald-950 via-teal-950 to-slate-950', emoji: '⚽' },
  'arcade': { gradient: 'from-cyan-950 via-blue-950 to-slate-950', emoji: '🕹️' },
  'action': { gradient: 'from-rose-950 via-red-950 to-slate-950', emoji: '💥' },
  'racing': { gradient: 'from-amber-950 via-orange-950 to-slate-950', emoji: '🏎️' },
  'puzzle': { gradient: 'from-purple-950 via-indigo-950 to-slate-950', emoji: '🧩' },
  'multiplayer': { gradient: 'from-blue-950 via-indigo-950 to-slate-950', emoji: '👥' },
  '2 player games': { gradient: 'from-sky-950 via-indigo-950 to-slate-950', emoji: '⚔️' },
  'casual': { gradient: 'from-teal-950 via-slate-900 to-slate-950', emoji: '🎯' },
  'horror': { gradient: 'from-neutral-950 via-red-950 to-slate-950', emoji: '👻' },
  'retro': { gradient: 'from-fuchsia-950 via-purple-950 to-slate-950', emoji: '👾' },
  'cooking sim': { gradient: 'from-amber-950 via-yellow-950 to-slate-950', emoji: '🍕' },
  'strongdog xp': { gradient: 'from-amber-950 via-orange-950 to-slate-950', emoji: '🐕' },
  'potato classics': { gradient: 'from-amber-950 via-yellow-950 to-slate-950', emoji: '🥔' }
};

function getGamePlaceholder(category?: string) {
  const c = (category || '').toLowerCase();
  return CATEGORY_META[c] || { gradient: 'from-slate-900 via-slate-950 to-black', emoji: '🎮' };
}

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlay: (game: Game) => void;
  activeTheme?: ThemeConfig;
  priority?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onPlay,
  activeTheme = THEMES.original,
  priority = false
}) => {
  const resolvedThumb = game.thumbnail ? resolveAssetUrl(game.thumbnail) : '';
  const isPrecached = Boolean(resolvedThumb && LOADED_IMAGE_CACHE.has(resolvedThumb));

  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(isPrecached);
  const [isHovered, setIsHovered] = useState(false);

  const placeholder = getGamePlaceholder(game.category);

  return (
    <div
      onClick={() => onPlay(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer select-none border"
      style={{
        backgroundColor: activeTheme.bgCard,
        borderColor: isHovered ? activeTheme.borderActive : activeTheme.border,
        boxShadow: isHovered ? `0 8px 24px rgba(0, 0, 0, 0.4)` : undefined
      }}
    >
      {/* Thumbnail Container */}
      <div 
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ backgroundColor: activeTheme.bgPrimary }}
      >
        {/* Instant 0ms Visual Backdrop - Always visible immediately */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${placeholder.gradient} flex flex-col items-center justify-center p-3 select-none transition-opacity duration-300 ${
            isLoaded && !imgError ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner mb-1.5 backdrop-blur-xs">
            {placeholder.emoji}
          </div>
          <span className="text-[11px] font-bold text-white/90 text-center line-clamp-1 max-w-[90%]">
            {game.title}
          </span>
          {/* Subtle animated loading shimmer before network bytes land */}
          {!imgError && !isLoaded && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/10 overflow-hidden">
              <div className="w-1/2 h-full bg-cyan-400/60 animate-pulse" />
            </div>
          )}
        </div>

        {/* Real Thumbnail Image with high-priority streaming & instant cache */}
        {!imgError && resolvedThumb && (
          <img
            src={resolvedThumb}
            alt={game.title}
            onLoad={() => {
              LOADED_IMAGE_CACHE.add(resolvedThumb);
              setIsLoaded(true);
            }}
            onError={() => {
              setImgError(true);
              setIsLoaded(false);
            }}
            referrerPolicy="no-referrer"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            // @ts-expect-error fetchPriority is a valid standard modern attribute
            fetchpriority={priority ? 'high' : 'auto'}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        )}

        {/* Favorite Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 z-20 cursor-pointer ${
            isFavorite
              ? 'bg-[#ff2d55] text-white shadow-md'
              : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
          }`}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Play Overlay Button on Hover */}
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
            style={{
              backgroundColor: activeTheme.accent,
              color: activeTheme.accentText
            }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div className="flex flex-col gap-1">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <span className="truncate">{game.category}</span>
            {game.rating && (
              <span className="flex items-center gap-0.5 text-amber-300 font-bold shrink-0">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>{game.rating.toFixed(1)}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            className="font-bold text-xs sm:text-sm text-white line-clamp-1 transition-colors leading-tight"
            style={{
              color: isHovered ? activeTheme.kicker : '#ffffff'
            }}
          >
            {game.title}
          </h3>

          {/* Description */}
          {game.description && (
            <p className="text-[11px] text-slate-400 line-clamp-1 leading-normal">
              {game.description}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div 
          className="flex items-center justify-between pt-1.5 border-t text-[10px] font-mono text-slate-400"
          style={{ borderColor: activeTheme.border }}
        >
          <span>
            {game.plays ? `${game.plays.toLocaleString()} plays` : 'Unblocked'}
          </span>

          <span 
            className="font-semibold transition-colors flex items-center gap-1"
            style={{ color: activeTheme.accent }}
          >
            <span>Play</span>
            <Play className="w-2.5 h-2.5 fill-current" />
          </span>
        </div>
      </div>
    </div>
  );
};
