import React, { useState } from 'react';
import { Play, Heart, Star } from 'lucide-react';
import { Game } from '../types/game';
import { resolveAssetUrl } from '../services/gamesStore';
import { ThemeConfig, THEMES } from '../services/themeStore';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlay: (game: Game) => void;
  activeTheme?: ThemeConfig;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onPlay,
  activeTheme = THEMES.original
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fallbackThumbnail = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" fill="%230c2016"/><circle cx="200" cy="120" r="45" fill="%2316402a"/><text x="200" y="130" font-size="34" font-family="sans-serif" text-anchor="middle" fill="%2310b981">🎮</text></svg>`;

  const resolvedThumb = imgError || !game.thumbnail
    ? fallbackThumbnail
    : resolveAssetUrl(game.thumbnail);

  return (
    <div
      onClick={() => onPlay(game)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none border"
      style={{
        backgroundColor: activeTheme.bgCard,
        borderColor: isHovered ? activeTheme.borderActive : activeTheme.border,
        boxShadow: isHovered ? `0 12px 24px ${activeTheme.accentGlow}` : undefined
      }}
    >
      {/* Thumbnail Container */}
      <div 
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ backgroundColor: activeTheme.bgPrimary }}
      >
        <img
          src={resolvedThumb}
          alt={game.title}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[80%]">
            <span 
              className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase border rounded-md backdrop-blur-xs shadow-xs"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.border,
                color: activeTheme.kicker
              }}
            >
              {game.category}
            </span>
            {game.secondaryCategory && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#ff2d55]/20 text-[#ff7597] border border-[#ff2d55]/30 rounded-md backdrop-blur-xs shadow-xs">
                {game.secondaryCategory}
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            className={`p-1.5 rounded-full transition-all duration-200 pointer-events-auto cursor-pointer shadow-sm ${
              isFavorite
                ? 'bg-[#ff2d55] text-white scale-110'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
            }`}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Play Overlay Button on Hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
            style={{
              backgroundColor: activeTheme.accent,
              color: activeTheme.accentText,
              boxShadow: `0 0 20px ${activeTheme.accentGlow}`
            }}
          >
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="font-bold text-sm text-slate-100 transition-colors line-clamp-1 leading-snug"
              style={{
                color: isHovered ? activeTheme.kicker : '#f1f5f9'
              }}
            >
              {game.title}
            </h3>
            {game.rating && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono shrink-0">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{game.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {game.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {game.description}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div 
          className="flex items-center justify-between pt-1 border-t text-[11px] text-slate-400 font-mono"
          style={{ borderColor: activeTheme.border }}
        >
          <div className="flex items-center gap-2">
            {game.plays ? (
              <span>{game.plays.toLocaleString()} plays</span>
            ) : (
              <span>Unblocked</span>
            )}
          </div>

          <span 
            className="flex items-center gap-1 font-semibold text-[11px] transition-colors"
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
