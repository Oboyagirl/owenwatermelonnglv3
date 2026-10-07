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

  const fallbackThumbnail = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" fill="%230c141f"/><circle cx="200" cy="120" r="45" fill="%231a2638"/><text x="200" y="130" font-size="34" font-family="sans-serif" text-anchor="middle" fill="%2338bdf8">🎮</text></svg>`;

  const resolvedThumb = imgError || !game.thumbnail
    ? fallbackThumbnail
    : resolveAssetUrl(game.thumbnail);

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
        <img
          src={resolvedThumb}
          alt={game.title}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

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
          {/* Quiet Category Kicker */}
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

          {/* Clean 1-Line Description */}
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
