import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronLeft,
  Sparkles,
  Music2,
  Check,
  Disc3,
  Heart
} from 'lucide-react';
import { useMusic, CustomTrack } from '../context/MusicContext';
import { fetchLyricsForTrack, LyricLine, SongLyrics } from '../services/lyricsService';
import { resolveAssetUrl } from '../utils/assetUrl';
import { ThemeConfig } from '../services/themeStore';

interface SyncedLyricsViewProps {
  onClose: () => void;
  activeTheme?: ThemeConfig;
}

export const SyncedLyricsView: React.FC<SyncedLyricsViewProps> = ({ onClose, activeTheme }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    isShuffle,
    isLoop,
    toggleShuffle,
    toggleLoop,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    likedTrackIds,
    toggleLikeTrack
  } = useMusic();

  const [lyricsData, setLyricsData] = useState<SongLyrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const accent = activeTheme?.accent || '#38bdf8';

  // Fetch or retrieve lyrics whenever currentTrack changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetchLyricsForTrack(currentTrack.artist, currentTrack.title, currentTrack.durationSec || duration || 180)
      .then(res => {
        if (!isCancelled) {
          setLyricsData(res);
          setLoading(false);
          setUserScrolled(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack.id, currentTrack.artist, currentTrack.title, duration]);

  // Determine active lyric line index based on currentTime
  const activeIndex = React.useMemo(() => {
    if (!lyricsData || !lyricsData.lines || lyricsData.lines.length === 0) return -1;
    const lines = lyricsData.lines;

    // Find the last line where line.time <= currentTime
    for (let i = lines.length - 1; i >= 0; i--) {
      if (currentTime >= lines[i].time) {
        return i;
      }
    }
    return 0;
  }, [lyricsData, currentTime]);

  // Auto-scroll active lyric into center view (unless user just scrolled manually)
  useEffect(() => {
    if (userScrolled) return;
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, userScrolled]);

  const handleManualScroll = () => {
    setUserScrolled(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    // Resume auto-scroll after 4 seconds of idle
    scrollTimeoutRef.current = setTimeout(() => {
      setUserScrolled(false);
    }, 4000);
  };

  const handleLineClick = (time: number) => {
    seek(time);
    setUserScrolled(false);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRemainingTime = (curr: number, dur: number) => {
    const remaining = Math.max(0, dur - curr);
    return `-${formatTime(remaining)}`;
  };

  const coverUrl = resolveAssetUrl(currentTrack.cover) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b14] text-white select-none overflow-hidden animate-in fade-in duration-300">
      {/* Dynamic Ambient Blurred Cover Art Backdrop (Apple Music Style) */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl scale-125 opacity-25 transition-all duration-1000 pointer-events-none"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/85 to-[#070b14] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/10 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer border border-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Player</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Synced Lyrics</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
            Dolby Atmos
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
          title="Close lyrics"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Apple Music-Style Split Layout */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 px-6 sm:px-10 lg:px-16 py-6 overflow-hidden items-center">
        
        {/* Left Column: Big Album Card, Track Details & Controls */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start max-w-md mx-auto w-full">
          {/* Big Rounded Artwork */}
          <div className="relative w-56 sm:w-72 md:w-80 lg:w-96 aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/15 group">
            <img
              src={coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <button
              onClick={() => toggleLikeTrack(currentTrack.id)}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white transition-all hover:scale-110 cursor-pointer shadow-lg"
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${likedTrackIds.includes(currentTrack.id) ? 'fill-rose-500 text-rose-500' : 'text-white/80'}`} />
            </button>
          </div>

          {/* Track Info */}
          <div className="w-full mt-6 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight line-clamp-1">
              {currentTrack.title}
            </h1>
            <p className="text-base sm:text-lg font-medium text-slate-300 mt-1 line-clamp-1">
              {currentTrack.artist} — {currentTrack.album}
            </p>

            {/* Apple Music Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mt-2">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                Lossless Real MP3
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                Dolby Atmos
              </span>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full mt-6 flex flex-col gap-1.5">
            <input
              type="range"
              min={0}
              max={duration || 180}
              step={0.5}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: accent }}
            />
            <div className="flex justify-between text-xs font-mono text-slate-400 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatRemainingTime(currentTime, duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="w-full mt-4 flex items-center justify-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isShuffle ? 'text-cyan-400 bg-white/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/10"
                title="Previous track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full text-black flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-105"
                style={{ backgroundColor: accent }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
              </button>

              <button
                onClick={nextTrack}
                className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer border border-white/10"
                title="Next track"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={toggleLoop}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isLoop ? 'text-cyan-400 bg-white/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Loop"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Volume control */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: accent }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Auto-scrolling Synced Lyrics Typography Stream */}
        <div className="lg:col-span-7 flex flex-col h-[60vh] lg:h-[75vh] relative overflow-hidden">
          {/* Top Fade Gradient Mask */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#070b14] via-[#070b14]/70 to-transparent z-10" />

          {/* Lyrics Scrollable Stream */}
          <div
            ref={lyricsContainerRef}
            onScroll={handleManualScroll}
            className="flex-1 overflow-y-auto scrollbar-none py-32 px-4 sm:px-8 flex flex-col gap-6 sm:gap-8"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Disc3 className="w-8 h-8 animate-spin" style={{ color: accent }} />
                <span className="text-sm font-medium">Syncing lyrics...</span>
              </div>
            ) : !lyricsData || lyricsData.lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-center">
                <Music2 className="w-10 h-10 stroke-1 text-slate-500" />
                <p className="text-base font-semibold text-slate-300">Instrumental track or lyrics unavailable</p>
                <p className="text-xs text-slate-500">Enjoy the full real MP3 playback</p>
              </div>
            ) : (
              lyricsData.lines.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;

                return (
                  <div
                    key={`${line.time}-${idx}`}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => handleLineClick(line.time)}
                    className={`transition-all duration-300 cursor-pointer text-left select-none group ${
                      isActive
                        ? 'text-white font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight drop-shadow-md scale-[1.02] origin-left'
                        : isPast
                        ? 'text-white/30 hover:text-white/70 font-semibold text-xl sm:text-2xl lg:text-3xl leading-snug'
                        : 'text-white/40 hover:text-white/80 font-semibold text-xl sm:text-2xl lg:text-3xl leading-snug'
                    }`}
                  >
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      {line.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Fade Gradient Mask */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-transparent z-10" />
        </div>

      </div>
    </div>
  );
};
