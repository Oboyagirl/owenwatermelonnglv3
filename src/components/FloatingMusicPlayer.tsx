import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Disc3, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Music, 
  Maximize2,
  ExternalLink,
  Shuffle,
  Repeat,
  Mic2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ThemeConfig } from '../services/themeStore';
import { resolveAssetUrl } from '../utils/assetUrl';
import { SyncedLyricsView } from './SyncedLyricsView';

interface FloatingMusicPlayerProps {
  activeTheme?: ThemeConfig;
  activeSpace: string;
  isGameActive: boolean;
  onOpenMusicSpace: () => void;
}

export const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  activeTheme,
  activeSpace,
  isGameActive,
  onOpenMusicSpace
}) => {
  const {
    currentTrack,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    duration,
    isShuffle,
    isLoop,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleLoop,
    isMiniPlayerOpen,
    isMiniPlayerCollapsed,
    setIsMiniPlayerOpen,
    setIsMiniPlayerCollapsed
  } = useMusic();

  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [showLyrics, setShowLyrics] = useState(false);

  // Hide floating player if user is actively in full Music Studio view
  if (activeSpace === 'music' || !isMiniPlayerOpen || !currentTrack) {
    return null;
  }

  const accent = activeTheme?.accent || '#10b981';
  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.15)';

  const formatTime = (secs: number) => {
    if (Number.isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 pointer-events-auto ${
        position === 'right' ? 'right-4 sm:right-6' : 'left-4 sm:left-6'
      } ${
        isGameActive ? 'bottom-4' : 'bottom-5'
      }`}
    >
      {isMiniPlayerCollapsed ? (
        /* Collapsed Floating Pill */
        <div 
          className="flex items-center gap-2.5 p-2 pr-3.5 rounded-full border shadow-2xl backdrop-blur-xl group hover:scale-105 transition-all cursor-pointer"
          style={{
            backgroundColor: 'rgba(8, 15, 29, 0.92)',
            borderColor: isPlaying ? accent : border,
            boxShadow: isPlaying ? `0 0 20px -3px ${accent}40` : undefined
          }}
          onClick={() => setIsMiniPlayerCollapsed(false)}
          title="Click to expand music player"
        >
          {/* Spinning Vinyl Album Art */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-md">
            <img 
              src={resolveAssetUrl(currentTrack.cover)} 
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '6s' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
              }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Track Info */}
          <div className="flex flex-col max-w-[130px] sm:max-w-[180px] overflow-hidden leading-tight text-left">
            <span className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
              {currentTrack.title}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {currentTrack.artist}
            </span>
          </div>

          {/* Quick Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-7 h-7 rounded-full text-black flex items-center justify-center shrink-0 shadow-md cursor-pointer hover:scale-110 transition-all"
            style={{ backgroundColor: accent }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Next song"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Expand Arrow */}
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
        </div>
      ) : (
        /* Expanded Floating Music Card */
        <div 
          className="w-80 sm:w-96 rounded-3xl border shadow-2xl backdrop-blur-2xl p-4 sm:p-5 flex flex-col gap-3.5 transition-all text-white animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: 'rgba(8, 15, 29, 0.95)',
            borderColor: isPlaying ? accent : border,
            boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px -5px ${accent}30`
          }}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: isPlaying ? accent : '#94a3b8' }}
              />
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
                <Music className="w-3 h-3" style={{ color: accent }} />
                <span>Background Music {isGameActive ? '· In-Game' : ''}</span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Position switcher */}
              <button
                onClick={() => setPosition(p => p === 'right' ? 'left' : 'right')}
                className="p-1 text-[10px] text-slate-400 hover:text-white rounded hover:bg-white/10"
                title={`Move player to ${position === 'right' ? 'left' : 'right'}`}
              >
                {position === 'right' ? '← Left' : 'Right →'}
              </button>
              {/* Synced Lyrics Button */}
              <button
                onClick={() => setShowLyrics(true)}
                className="p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                title="Open Apple Music-style kinetic synchronized lyrics"
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold hidden sm:inline">Lyrics</span>
              </button>
              {/* Open full studio */}
              <button
                onClick={onOpenMusicSpace}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Open Full Music Studio"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              {/* Minimize to pill */}
              <button
                onClick={() => setIsMiniPlayerCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimize player"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {/* Hide player */}
              <button
                onClick={() => setIsMiniPlayerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                title="Close floating player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Track Details with Album Art */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0 group">
              <img 
                src={resolveAssetUrl(currentTrack.cover)} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : ''}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div 
                className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[8px] font-mono border bg-black/70"
                style={{ color: accent, borderColor: accent }}
              >
                MP3
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span className="text-[10px] font-mono text-slate-400 truncate">
                {currentTrack.album}
              </span>
              <h4 className="text-sm font-extrabold text-white truncate leading-snug">
                {currentTrack.title}
              </h4>
              <p className="text-xs font-semibold truncate" style={{ color: accent }}>
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Equalizer animation mini bars */}
          <div className="h-4 flex items-end gap-1 px-1">
            {[40, 75, 45, 90, 60, 100, 50, 80, 95, 65, 85, 40, 70, 90, 55, 75, 95, 50].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isPlaying ? accent : '#334155',
                  height: isPlaying ? `${Math.max(20, h * 0.9)}%` : '20%',
                  opacity: isPlaying ? 0.9 : 0.25
                }}
              />
            ))}
          </div>

          {/* Audio Scrubber */}
          <div className="flex flex-col gap-1">
            <input
              type="range"
              min={0}
              max={duration || 180}
              step={0.5}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: accent }}
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls & Volume Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Playback buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isShuffle ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={{ color: isShuffle ? accent : undefined }}
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={prevTrack}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/5"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full text-black flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105"
                style={{ backgroundColor: accent }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-black" />
                ) : (
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/5"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleLoop}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLoop ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={{ color: isLoop ? accent : undefined }}
                title="Repeat track"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Game / Music Balance Volume */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/5">
              <button
                onClick={toggleMute}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: accent }}
                title="Music volume"
              />
            </div>
          </div>

          {/* Quick Jump to Music Studio Bar */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">
              Plays in background while gaming
            </span>
            <button
              onClick={onOpenMusicSpace}
              className="text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
              style={{ color: accent }}
            >
              <span>Browse Catalog (24 Songs)</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Full Apple Music-style Synced Lyrics Modal */}
      {showLyrics && (
        <SyncedLyricsView 
          onClose={() => setShowLyrics(false)} 
          activeTheme={activeTheme} 
        />
      )}
    </div>
  );
};
