import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  RotateCcw, 
  Heart, 
  ExternalLink, 
  Share2, 
  Sparkles, 
  Gamepad2, 
  Layers 
} from 'lucide-react';
import { Game } from '../types/game';
import { resolveAssetUrl } from '../utils/assetUrl';

interface GamePlayerProps {
  game: Game;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  onUpdateGame?: (id: string, updates: Partial<Game>) => void;
  allGames?: Game[];
  onSelectGame?: (game: Game) => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  game,
  onBack,
  onToggleFavorite,
  isFavorite,
  allGames = [],
  onSelectGame
}) => {
  const [selectedMirror, setSelectedMirror] = useState<string>(game.iframeSrc);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);

  const toggleFullscreen = () => {
    const el = document.getElementById('game-frame-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleReload = () => {
    setKey(k => k + 1);
  };

  const mirrors = Array.from(new Set([game.iframeSrc, ...(game.mirrors || [])]));

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-7xl mx-auto w-full pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <h2 className="text-sm font-extrabold text-white truncate max-w-xs sm:max-w-md">
            {game.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Mirror Switcher */}
          {mirrors.length > 1 && (
            <select
              value={selectedMirror}
              onChange={(e) => setSelectedMirror(e.target.value)}
              className="bg-slate-800 text-xs text-white border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              {mirrors.map((m, idx) => (
                <option key={m} value={m}>
                  Mirror {idx + 1}
                </option>
              ))}
            </select>
          )}

          <button 
            onClick={handleReload}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
            title="Reload Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onToggleFavorite(game.id)}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 cursor-pointer"
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Iframe Container */}
      <div 
        id="game-frame-container"
        className="relative w-full aspect-[16/9] max-h-[75vh] rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center"
      >
        <iframe 
          key={key}
          src={resolveAssetUrl(selectedMirror)}
          title={game.title}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; gamepad; pointer-lock"
          allowFullScreen
        />
      </div>

      {/* Game Details & Controls Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium">
              {game.category}
            </span>
            {game.secondaryCategory && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs font-mono">
                {game.secondaryCategory}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white">{game.title}</h1>
          <p className="text-xs text-slate-400 leading-relaxed">{game.description}</p>
        </div>

        {/* Controls Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-emerald-400" /> Controls & Tips
          </h3>
          {game.controls && game.controls.length > 0 ? (
            <div className="flex flex-col gap-2 mt-1">
              {game.controls.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-b-0">
                  <span className="font-mono text-emerald-400">{c.key}</span>
                  <span className="text-slate-400">{c.action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Use Standard Keyboard Controls (WASD, Arrow Keys, Spacebar, Mouse).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
