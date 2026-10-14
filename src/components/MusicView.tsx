import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Disc3, 
  Heart, 
  Search, 
  Shuffle, 
  Repeat, 
  ListMusic, 
  AlertCircle,
  Upload,
  FolderOpen,
  Music2,
  Trash2,
  Sparkles,
  Album as AlbumIcon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { REAL_MUSIC_CATALOG, POPULAR_ARTISTS, POPULAR_ALBUMS, MusicTrack, MusicAlbum } from '../data/musicData';
import { ThemeConfig } from '../services/themeStore';
import { resolveAssetUrl } from '../utils/assetUrl';

interface MusicViewProps {
  activeTheme?: ThemeConfig;
}

interface CustomTrack extends MusicTrack {
  isCustom?: boolean;
}

const DEFAULT_COVER_FALLBACK = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60';

export const MusicView: React.FC<MusicViewProps> = ({ activeTheme }) => {
  const [selectedArtist, setSelectedArtist] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums'>('tracks');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [playerMode, setPlayerMode] = useState<'stream' | 'spotify' | 'youtube'>('stream');
  const [showSpotifyAlbumEmbed, setShowSpotifyAlbumEmbed] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>(() => {
    try {
      const saved = localStorage.getItem('owen_custom_music_list');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Guard: Only keep tracks that have a non-empty audio source
      return Array.isArray(parsed) 
        ? parsed.filter(t => t && typeof t.audioSrc === 'string' && t.audioSrc.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  });

  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('owen_liked_music');
      return saved ? JSON.parse(saved) : ['album-flower-boy-track-4', 'album-trick-track-12', 'album-graduation-track-8'];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine real catalog with custom uploaded tracks
  const allTracks: CustomTrack[] = useMemo(() => {
    return [...customTracks, ...REAL_MUSIC_CATALOG];
  }, [customTracks]);

  // Selected Album details object
  const selectedAlbum = useMemo(() => {
    if (!selectedAlbumId) return null;
    return POPULAR_ALBUMS.find(a => a.id === selectedAlbumId) || null;
  }, [selectedAlbumId]);

  // Filtered albums
  const filteredAlbums = useMemo(() => {
    return POPULAR_ALBUMS.filter(a => {
      if (selectedArtist !== 'All' && selectedArtist !== 'My Uploads') {
        if (!a.artist.toLowerCase().includes(selectedArtist.toLowerCase())) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q)
      );
    });
  }, [selectedArtist, searchQuery]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    let result = allTracks.filter(t => {
      if (selectedAlbumId) {
        if (t.albumId !== selectedAlbumId && t.album.toLowerCase() !== selectedAlbumId.toLowerCase()) {
          const albumObj = POPULAR_ALBUMS.find(a => a.id === selectedAlbumId);
          if (!albumObj || t.album.toLowerCase() !== albumObj.title.toLowerCase()) {
            return false;
          }
        }
      } else {
        if (selectedArtist === 'My Uploads') {
          if (!t.isCustom) return false;
        } else if (selectedArtist !== 'All') {
          if (!t.artist.toLowerCase().includes(selectedArtist.toLowerCase())) return false;
        }
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
      );
    });

    if (selectedAlbumId) {
      result = [...result].sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
    }
    return result;
  }, [allTracks, selectedArtist, searchQuery, selectedAlbumId]);

  const currentTrack: CustomTrack = filteredTracks[currentTrackIndex] || allTracks[0] || REAL_MUSIC_CATALOG[0];

  const accent = activeTheme?.accent || '#10b981';
  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  // Sync audio source attribute when currentTrack changes without interrupting active playback
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    const sourceUrl = resolveAssetUrl(currentTrack.audioSrc);
    if (!sourceUrl) return;

    const isMatching = audio.src.endsWith(currentTrack.audioSrc) || audio.src.endsWith(sourceUrl) || audio.src === sourceUrl;
    if (!isMatching) {
      audio.src = sourceUrl;
    }
  }, [currentTrack]);

  const toggleLikeTrack = (id: string) => {
    setLikedTrackIds(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try { localStorage.setItem('owen_liked_music', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const playTrack = async (target: CustomTrack) => {
    if (!audioRef.current || !target || !target.audioSrc) return;
    setAudioError(null);
    const audio = audioRef.current;
    const targetSource = resolveAssetUrl(target.audioSrc);

    try {
      if (!audio.src.endsWith(target.audioSrc) && audio.src !== targetSource) {
        audio.src = targetSource;
        audio.load();
      }
      await audio.play();
      setIsPlaying(true);
      setAudioError(null);
    } catch (err: any) {
      console.warn("Primary play failed, trying fallback:", err);
      // Fallback 1: try direct relative ./music/ path
      try {
        const cleanPath = './' + target.audioSrc.replace(/^(\.\/|\/)/, '');
        if (audio.src !== cleanPath) {
          audio.src = cleanPath;
          audio.load();
        }
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        return;
      } catch (e2) {
        // Fallback 2: if full-stack server is running with Express /api/music/
        if (target.audioSrc.includes('music/')) {
          try {
            const filename = target.audioSrc.split('/').pop();
            const serverUrl = '/api/music/' + filename;
            audio.src = serverUrl;
            audio.load();
            await audio.play();
            setIsPlaying(true);
            setAudioError(null);
            return;
          } catch (e3) {
            console.warn("All playback attempts failed:", e3);
          }
        }
      }
      setIsPlaying(false);
      setAudioError("Tap ▶ Play to start playback.");
    }
  };

  const handleTogglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;
    setAudioError(null);
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    await playTrack(currentTrack);
  };

  const handleNext = () => {
    if (filteredTracks.length <= 1) return;
    setAudioError(null);
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * filteredTracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % filteredTracks.length;
    }
    setCurrentTrackIndex(nextIndex);
    const target = filteredTracks[nextIndex];
    if (target) {
      playTrack(target);
    }
  };

  const handlePrev = () => {
    if (filteredTracks.length <= 1) return;
    setAudioError(null);
    const prevIndex = (currentTrackIndex - 1 + filteredTracks.length) % filteredTracks.length;
    setCurrentTrackIndex(prevIndex);
    const target = filteredTracks[prevIndex];
    if (target) {
      playTrack(target);
    }
  };

  const handleSelectTrack = (index: number) => {
    setAudioError(null);
    setCurrentTrackIndex(index);
    const target = filteredTracks[index];
    if (target) {
      playTrack(target);
    }
  };

  const handleOpenAlbum = (album: MusicAlbum, autoPlay: boolean = false) => {
    setSelectedAlbumId(album.id);
    setSelectedArtist('All');
    setActiveTab('tracks');
    setCurrentTrackIndex(0);
    setShowSpotifyAlbumEmbed(false);
    if (autoPlay) {
      const albumTracks = allTracks.filter(t => t.albumId === album.id || t.album.toLowerCase() === album.title.toLowerCase());
      const first = albumTracks.sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0))[0];
      if (first) {
        playTrack(first);
      }
    }
  };

  const handlePlayAlbum = (album: MusicAlbum) => {
    handleOpenAlbum(album, true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Upload custom downloaded MP3 file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: CustomTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const blobUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const parts = cleanName.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Downloaded Audio';
      const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : cleanName;

      const newTrack: CustomTrack = {
        id: 'custom-' + Date.now() + '-' + i,
        title,
        artist,
        album: 'My Downloads',
        year: new Date().getFullYear(),
        duration: '3:30',
        durationSec: 210,
        cover: './music/covers/tyler_flower_boy.jpg',
        genre: 'Local Audio',
        audioSrc: blobUrl,
        isCustom: true
      };
      newTracks.push(newTrack);
    }

    setCustomTracks(prev => {
      const next = [...newTracks, ...prev];
      try {
        const serialized = next.map(t => ({ ...t, audioSrc: t.audioSrc.startsWith('blob:') ? '' : t.audioSrc }));
        localStorage.setItem('owen_custom_music_list', JSON.stringify(serialized.slice(0, 10)));
      } catch {}
      return next;
    });

    if (newTracks.length > 0) {
      setSelectedArtist('All');
      setSelectedAlbumId(null);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const handleDeleteCustomTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTracks(prev => prev.filter(t => t.id !== id));
  };

  const formatTime = (secs: number) => {
    if (Number.isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const artistTabs = useMemo(() => {
    return ['All', ...(customTracks.length > 0 ? ['My Uploads'] : []), ...POPULAR_ARTISTS.filter(a => a !== 'All')];
  }, [customTracks]);

  return (
    <div 
      className="flex-1 flex flex-col min-h-screen text-slate-100 p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: activeTheme?.bgPrimary || '#020810' }}
    >
      {/* Hidden file input for uploading downloaded MP3s */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        multiple
        className="hidden"
      />

      {/* Persistent HTML5 Audio Element with byte-range MP3 streaming */}
      <audio
        ref={audioRef}
        loop={isLoop}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || currentTrack.durationSec || 180);
          }
        }}
        onEnded={handleNext}
        onError={() => {
          const audio = audioRef.current;
          if (!audio || !audio.src || audio.src === 'about:blank' || audio.src === window.location.href) {
            return;
          }
          if (audio.error && audio.error.code === 1) {
            // MEDIA_ERR_ABORTED: Normal when skipping or switching tracks
            return;
          }
          console.warn("Audio playback error encountered on:", audio.src, audio.error);
          if (currentTrack?.isCustom && currentTrack.audioSrc.startsWith('blob:')) {
            setAudioError("This local audio is no longer loaded in memory. Please tap '+ Load My MP3 File'.");
          } else {
            setAudioError("Click ▶ Play to start playback.");
          }
          setIsPlaying(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setAudioError(null);
        }}
        onPause={() => setIsPlaying(false)}
      />

      <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                style={{
                  backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)',
                  borderColor: activeTheme?.borderActive || accent,
                  color: accent
                }}
              >
                <span>{activeTheme?.emoji || '🍉'}</span>
                <span>OwenWatermelonV3 Music Studio</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                Real Downloaded MP3s
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono flex items-center gap-1">
                <AlbumIcon className="w-3 h-3" />
                {POPULAR_ALBUMS.length} Official Albums
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono flex items-center gap-1">
                <ListMusic className="w-3 h-3" />
                {allTracks.length} Full Album Tracks
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Real Popular Music & Official Albums
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Featuring genuine album artwork & full albums for Tyler, The Creator, Alex G, Kanye West, Drake, Kendrick Lamar, Travis Scott, Frank Ocean, Steve Lacy, The Weeknd & Billie Eilish.
            </p>
          </div>

          {/* Action Buttons & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-2xl border text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105 shrink-0"
              style={{
                backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)',
                borderColor: accent,
                color: accent
              }}
              title="Select any downloaded MP3 from your device (iPad, Chromebook, PC)"
            >
              <Upload className="w-4 h-4" />
              <span>Load My MP3 File</span>
            </button>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, albums, artists..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs text-white placeholder-slate-500 focus:outline-none shadow-md"
                style={{
                  backgroundColor: cardBg,
                  borderColor: border
                }}
              />
            </div>
          </div>
        </div>

        {/* View Switcher: Tracks vs Albums */}
        <div className="flex items-center justify-between border-b pb-4 gap-4 flex-wrap" style={{ borderColor: border }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('tracks'); setSelectedAlbumId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === 'tracks'
                  ? 'text-black shadow-lg font-extrabold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'tracks' ? accent : cardBg,
                borderColor: activeTab === 'tracks' ? accent : border
              }}
            >
              <ListMusic className="w-4 h-4" />
              <span>Songs Catalog ({filteredTracks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === 'albums'
                  ? 'text-black shadow-lg font-extrabold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
              style={{
                backgroundColor: activeTab === 'albums' ? accent : cardBg,
                borderColor: activeTab === 'albums' ? accent : border
              }}
            >
              <AlbumIcon className="w-4 h-4" />
              <span>Official Albums ({filteredAlbums.length})</span>
            </button>
          </div>

          {selectedAlbumId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-400 font-mono">
                Filtered by album: {POPULAR_ALBUMS.find(a => a.id === selectedAlbumId)?.title}
              </span>
              <button
                onClick={() => setSelectedAlbumId(null)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Artist Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {artistTabs.map(artist => (
            <button
              key={artist}
              onClick={() => {
                setSelectedArtist(artist);
                setSelectedAlbumId(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                selectedArtist === artist
                  ? 'text-black shadow-lg font-extrabold'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
              style={{
                backgroundColor: selectedArtist === artist ? accent : cardBg,
                borderColor: selectedArtist === artist ? accent : border
              }}
            >
              {artist}
            </button>
          ))}
        </div>

        {/* Featured Music Player Showcase Card */}
        <div 
          className="p-6 md:p-8 rounded-3xl border shadow-2xl flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden"
          style={{
            backgroundColor: cardBg,
            borderColor: border
          }}
        >
          {/* Album Cover with Vinyl Spin Effect */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl shrink-0 border border-white/10 group">
            <img
              src={resolveAssetUrl(currentTrack.cover)}
              alt={currentTrack.title}
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER_FALLBACK; }}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <button
              onClick={() => toggleLikeTrack(currentTrack.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white transition-all hover:scale-110 cursor-pointer"
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${likedTrackIds.includes(currentTrack.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
            </button>

            <div 
              className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                borderColor: accent,
                color: accent
              }}
            >
              {currentTrack.year} · MP3 Stereo
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className="flex-1 flex flex-col gap-5 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span 
                  className="text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold"
                  style={{ color: accent }}
                >
                  <Disc3 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
                  {currentTrack.trackNumber ? `Track ${currentTrack.trackNumber} · ` : ''}{currentTrack.genre} · {currentTrack.album}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {currentTrack.title}
                </h2>
                <div className="flex items-center gap-2.5 flex-wrap mt-1">
                  <p className="text-sm md:text-base font-semibold text-slate-300">
                    {currentTrack.artist}
                  </p>
                  {currentTrack.hasLocalAudio ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      🎧 Downloaded Studio MP3
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                        🎵 Studio Stream
                      </span>
                      {currentTrack.youtubeId && playerMode !== 'youtube' && (
                        <button
                          onClick={() => setPlayerMode('youtube')}
                          className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-red-300" />
                          <span>Switch to YouTube Player</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Badges */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setPlayerMode('stream')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    playerMode === 'stream' ? 'text-black shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  style={{ backgroundColor: playerMode === 'stream' ? accent : 'transparent' }}
                >
                  Local MP3
                </button>
                {currentTrack.spotifyId && (
                  <button
                    onClick={() => setPlayerMode('spotify')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerMode === 'spotify' ? 'bg-[#1DB954] text-black shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Spotify
                  </button>
                )}
                {currentTrack.youtubeId && (
                  <button
                    onClick={() => setPlayerMode('youtube')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerMode === 'youtube' ? 'bg-[#FF0000] text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    YouTube
                  </button>
                )}
              </div>
            </div>

            {audioError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{audioError}</span>
              </div>
            )}

            {/* Mode-specific embed or audio scrubber */}
            {playerMode === 'spotify' && currentTrack.spotifyId ? (
              <div className="w-full h-24 rounded-2xl overflow-hidden border border-white/10">
                <iframe
                  src={`https://open.spotify.com/embed/track/${currentTrack.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="100%"
                  className="border-0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ) : playerMode === 'youtube' && currentTrack.youtubeId ? (
              <div className="w-full aspect-video max-h-52 rounded-2xl overflow-hidden border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1`}
                  title={currentTrack.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <>
                {/* Audio Progress Scrubber */}
                <div className="flex flex-col gap-1.5">
                  <input
                    type="range"
                    min={0}
                    max={duration || 180}
                    step={0.5}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: accent }}
                  />
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Animated Equalizer Waveform bars */}
                <div className="h-8 flex items-end gap-1 px-1">
                  {[35, 65, 45, 80, 55, 95, 40, 75, 90, 60, 85, 50, 70, 90, 45, 60, 75, 40, 85, 55, 95, 65, 30, 80].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: isPlaying ? accent : '#334155',
                        height: isPlaying ? `${Math.max(15, h * 0.9)}%` : '15%',
                        opacity: isPlaying ? 0.9 : 0.3
                      }}
                    />
                  ))}
                </div>

                {/* Playback Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isShuffle ? 'shadow-md' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isShuffle ? activeTheme?.accentBadge : undefined,
                        borderColor: isShuffle ? accent : undefined,
                        color: isShuffle ? accent : undefined
                      }}
                      title="Shuffle playlist"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePrev}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10"
                      title="Previous track"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleTogglePlay}
                      className="w-14 h-14 rounded-full text-black flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-105"
                      style={{ backgroundColor: accent }}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10"
                      title="Next track"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsLoop(!isLoop)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isLoop ? 'shadow-md' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isLoop ? activeTheme?.accentBadge : undefined,
                        borderColor: isLoop ? accent : undefined,
                        color: isLoop ? accent : undefined
                      }}
                      title="Loop track"
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = !isMuted;
                        setIsMuted(next);
                        if (audioRef.current) audioRef.current.muted = next;
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: accent }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Albums Carousel / Section */}
        {activeTab === 'albums' ? (
          /* Full Albums Grid View */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <AlbumIcon className="w-4 h-4" style={{ color: accent }} />
                Official Albums by Popular Artists ({filteredAlbums.length})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Click any album to explore all full tracks
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAlbums.map((album) => {
                const isSelected = selectedAlbumId === album.id;
                return (
                  <div
                    key={album.id}
                    onClick={() => handleOpenAlbum(album, false)}
                    className="p-4 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 group hover:scale-[1.02] shadow-xl"
                    style={{
                      backgroundColor: isSelected ? activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)' : cardBg,
                      borderColor: isSelected ? accent : border
                    }}
                  >
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg bg-black border border-white/5">
                      <img
                        src={resolveAssetUrl(album.cover)}
                        alt={album.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER_FALLBACK; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayAlbum(album);
                          }}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-xl font-bold cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: accent }}
                          title="Play album from Track 1"
                        >
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white border border-white/10">
                        {album.year}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider line-clamp-1" style={{ color: accent }}>
                        {album.artist}
                      </span>
                      <h3 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                        {album.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-2 border-t border-white/5">
                        <span>{album.genre}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 font-bold text-white">
                          {album.tracksCount} Full Tracks
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayAlbum(album);
                          }}
                          className="flex-1 py-1.5 rounded-xl text-[11px] font-bold text-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                          style={{ backgroundColor: accent }}
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>Play Album</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAlbum(album, false);
                          }}
                          className="flex-1 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Tracklist</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Tracks View */
          <div className="flex flex-col gap-8">
            
            {/* If an album is selected, show Dedicated Album Showcase Header */}
            {selectedAlbum ? (
              <div 
                className="p-6 md:p-8 rounded-3xl border shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
                style={{ backgroundColor: cardBg, borderColor: border }}
              >
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/10 group">
                  <img
                    src={resolveAssetUrl(selectedAlbum.cover)}
                    alt={selectedAlbum.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER_FALLBACK; }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white border border-white/10">
                    {selectedAlbum.year}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2.5 text-center md:text-left w-full">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                      style={{ backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)', borderColor: accent, color: accent }}
                    >
                      Complete Official Album
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedAlbum.year} · {selectedAlbum.genre}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono font-bold">
                      {filteredTracks.length} Complete Tracks
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                    {selectedAlbum.title}
                  </h2>
                  <button 
                    onClick={() => setSelectedArtist(selectedAlbum.artist)}
                    className="text-base font-bold text-slate-300 hover:underline w-fit mx-auto md:mx-0 cursor-pointer"
                    style={{ color: accent }}
                  >
                    {selectedAlbum.artist}
                  </button>

                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl">
                    {selectedAlbum.description}
                  </p>

                  <div className="flex items-center justify-center md:justify-start gap-3 pt-3 flex-wrap">
                    <button
                      onClick={() => {
                        if (filteredTracks.length > 0) {
                          handleSelectTrack(0);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl font-bold text-black text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                      style={{ backgroundColor: accent }}
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Play Full Album (Track 1)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsShuffle(true);
                        handleNext();
                      }}
                      className="px-4 py-2.5 rounded-xl font-bold text-white text-xs flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4" />
                      <span>Shuffle Album</span>
                    </button>

                    {selectedAlbum.spotifyAlbumId && (
                      <button
                        onClick={() => setShowSpotifyAlbumEmbed(!showSpotifyAlbumEmbed)}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-[#1DB954]/40 bg-[#1DB954]/15 text-[#1DB954] hover:bg-[#1DB954]/25"
                      >
                        <Disc3 className="w-4 h-4" />
                        <span>{showSpotifyAlbumEmbed ? 'Hide Spotify Embed' : 'Spotify Full Album Player'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedAlbumId(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 transition-all cursor-pointer md:ml-auto"
                    >
                      ✕ View All Songs & Albums
                    </button>
                  </div>

                  {showSpotifyAlbumEmbed && selectedAlbum.spotifyAlbumId && (
                    <div className="w-full mt-4 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                      <iframe
                        src={`https://open.spotify.com/embed/album/${selectedAlbum.spotifyAlbumId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="100%"
                        className="border-0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Quick Albums Shelf when browsing all tracks */
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlbumIcon className="w-3.5 h-3.5" style={{ color: accent }} />
                    Albums by {selectedArtist === 'All' ? 'Artists' : selectedArtist}
                  </span>
                  <button
                    onClick={() => setActiveTab('albums')}
                    className="text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    style={{ color: accent }}
                  >
                    <span>View All Albums</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {filteredAlbums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => handleOpenAlbum(album, false)}
                      className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl border transition-all cursor-pointer hover:bg-white/5 shrink-0"
                      style={{
                        backgroundColor: selectedAlbumId === album.id ? activeTheme?.accentBadge : cardBg,
                        borderColor: selectedAlbumId === album.id ? accent : border
                      }}
                    >
                      <img
                        src={resolveAssetUrl(album.cover)}
                        alt={album.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER_FALLBACK; }}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md border border-white/5"
                      />
                      <div className="flex flex-col max-w-[130px]">
                        <span className="text-xs font-bold text-white truncate">{album.title}</span>
                        <span className="text-[10px] text-slate-400 truncate">{album.artist}</span>
                        <span className="text-[9px] font-mono text-cyan-400">{album.tracksCount} Tracks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracks List */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4" style={{ color: accent }} />
                  {selectedAlbum 
                    ? `${selectedAlbum.title} — Full Album Tracklist (${filteredTracks.length} Songs)`
                    : selectedArtist === 'All' 
                      ? `Complete Songs Catalog (${filteredTracks.length})` 
                      : `${selectedArtist} Tracks (${filteredTracks.length})`
                  }
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
                  style={{ color: accent }}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>+ Add Your Downloaded MP3s</span>
                </button>
              </div>

              {/* Numbered Tracklist for Album view vs Grid for All songs */}
              {selectedAlbum ? (
                /* Sleek Numbered Album Tracklist Table */
                <div 
                  className="rounded-3xl border overflow-hidden shadow-2xl flex flex-col"
                  style={{ backgroundColor: cardBg, borderColor: border }}
                >
                  {filteredTracks.map((track, idx) => {
                    const isSelected = track.id === currentTrack.id;
                    const isLiked = likedTrackIds.includes(track.id);
                    const trackNum = track.trackNumber || (idx + 1);

                    return (
                      <div
                        key={track.id}
                        onClick={() => handleSelectTrack(idx)}
                        className={`p-3 md:p-4 border-b last:border-b-0 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isSelected 
                            ? 'text-white' 
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: isSelected ? activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          borderColor: border
                        }}
                      >
                        <div className="flex items-center gap-3 md:gap-4 truncate">
                          {/* Track Number / Play state indicator */}
                          <div className="w-8 flex items-center justify-center shrink-0">
                            {isSelected && isPlaying ? (
                              <div className="w-4 h-4 flex items-end justify-center gap-0.5">
                                <span className="w-1 bg-current h-full animate-bounce" style={{ color: accent }} />
                                <span className="w-1 bg-current h-2/3 animate-bounce [animation-delay:0.15s]" style={{ color: accent }} />
                                <span className="w-1 bg-current h-4/5 animate-bounce [animation-delay:0.3s]" style={{ color: accent }} />
                              </div>
                            ) : (
                              <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                                {trackNum}
                              </span>
                            )}
                            <Play className={`w-4 h-4 hidden group-hover:block ml-0.5 ${isSelected ? 'fill-current' : 'text-slate-300'}`} style={{ color: isSelected ? accent : undefined }} />
                          </div>

                          <div className="flex flex-col truncate">
                            <span 
                              className="text-xs md:text-sm font-bold truncate"
                              style={{ color: isSelected ? accent : '#ffffff' }}
                            >
                              {track.title}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate">
                              {track.artist}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {track.hasLocalAudio ? (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                              Real MP3
                            </span>
                          ) : (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 text-[10px] font-mono">
                              Studio Stream
                            </span>
                          )}

                          <span className="text-xs font-mono text-slate-400">
                            {track.duration}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLikeTrack(track.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Favorite song"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* All Songs Catalog Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTracks.map((track, idx) => {
                    const isSelected = track.id === currentTrack.id;
                    const isLiked = likedTrackIds.includes(track.id);
                    return (
                      <div
                        key={track.id}
                        onClick={() => handleSelectTrack(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isSelected 
                            ? 'text-white shadow-lg' 
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: isSelected ? activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)' : cardBg,
                          borderColor: isSelected ? activeTheme?.borderActive || accent : border
                        }}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/5">
                            <img 
                              src={resolveAssetUrl(track.cover)} 
                              alt={track.title} 
                              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER_FALLBACK; }}
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="flex flex-col truncate">
                            <span 
                              className="text-xs md:text-sm font-bold truncate"
                              style={{ color: isSelected ? accent : '#ffffff' }}
                            >
                              {track.title}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate">
                              {track.artist} · {track.album}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-slate-500">
                            {track.duration}
                          </span>
                          {track.isCustom ? (
                            <button
                              onClick={(e) => handleDeleteCustomTrack(track.id, e)}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="Remove track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeTrack(track.id);
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
