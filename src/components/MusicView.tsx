import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Music, 
  Search, 
  Radio, 
  ExternalLink, 
  Sparkles, 
  Disc3, 
  Heart, 
  Plus, 
  Trash2, 
  ArrowLeft,
  CheckCircle2,
  Headphones
} from 'lucide-react';
import { REAL_MUSIC_CATALOG, POPULAR_ARTISTS, POPULAR_ALBUMS, MusicTrack, MusicAlbum } from '../data/musicData';
import { resolveAssetUrl } from '../utils/assetUrl';

interface MusicViewProps {
  activeTheme?: any;
}

interface CustomTrack extends MusicTrack {
  isCustom?: boolean;
}

export const MusicView: React.FC<MusicViewProps> = ({ activeTheme }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArtist, setSelectedArtist] = useState<string>('All');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'favorites'>('tracks');
  const [playerMode, setPlayerMode] = useState<'local' | 'youtube' | 'spotify'>('local');
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('owen_liked_music');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showSpotifyAlbumEmbed, setShowSpotifyAlbumEmbed] = useState<boolean>(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>(() => {
    try {
      const saved = localStorage.getItem('owen_custom_music_list');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Combine real catalog with user custom tracks
  const allTracks = useMemo(() => {
    return [...REAL_MUSIC_CATALOG, ...customTracks];
  }, [customTracks]);

  // Selected album object
  const selectedAlbum = useMemo(() => {
    if (!selectedAlbumId) return null;
    return POPULAR_ALBUMS.find(a => a.id === selectedAlbumId) || null;
  }, [selectedAlbumId]);

  // Filtered tracks based on current filter/search/tab
  const filteredTracks = useMemo(() => {
    return allTracks.filter(track => {
      // Album filter
      if (selectedAlbumId) {
        const matchesAlbum = track.albumId === selectedAlbumId || 
          (selectedAlbum && track.album.toLowerCase().trim() === selectedAlbum.title.toLowerCase().trim());
        if (!matchesAlbum) return false;
      } else if (selectedArtist !== 'All') {
        if (!track.artist.toLowerCase().includes(selectedArtist.toLowerCase())) {
          return false;
        }
      }

      // Favorites tab
      if (activeTab === 'favorites' && !likedTrackIds.includes(track.id)) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = track.title.toLowerCase().includes(q);
        const matchesArtist = track.artist.toLowerCase().includes(q);
        const matchesAlbum = track.album.toLowerCase().includes(q);
        const matchesGenre = track.genre.toLowerCase().includes(q);
        return matchesTitle || matchesArtist || matchesAlbum || matchesGenre;
      }

      return true;
    }).sort((a, b) => {
      // When browsing an album, sort strictly by track number
      if (selectedAlbumId) {
        return (a.trackNumber || 999) - (b.trackNumber || 999);
      }
      return 0;
    });
  }, [allTracks, selectedArtist, selectedAlbumId, selectedAlbum, activeTab, likedTrackIds, searchQuery]);

  const currentTrack: CustomTrack | undefined = filteredTracks[currentTrackIndex] || allTracks[0];

  // Initialize audio element listeners
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleError = () => {
      console.warn("Audio element error on src:", audio.src);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Clean, robust play function preventing "The play() request was interrupted by a new load request"
  const playTrackSafe = async (target: CustomTrack) => {
    if (!audioRef.current || !target) return;
    const audio = audioRef.current;

    // If target has no local audio file, switch smoothly to official stream
    if (!target.hasLocalAudio || !target.audioSrc) {
      audio.pause();
      setIsPlaying(false);
      setPlayerMode(target.youtubeId ? 'youtube' : 'spotify');
      setAudioNotice(`Playing official stream for "${target.title}"`);
      setTimeout(() => setAudioNotice(null), 4000);
      return;
    }

    setPlayerMode('local');
    const targetSource = resolveAssetUrl(target.audioSrc);

    // Wait for any existing pending play promise to finish/catch before changing src
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Ignored aborted previous play
      }
    }

    try {
      const currentSrcPath = audio.src ? new URL(audio.src, window.location.href).pathname : '';
      const targetSrcPath = new URL(targetSource, window.location.href).pathname;

      if (currentSrcPath !== targetSrcPath) {
        audio.src = targetSource;
      }

      const p = audio.play();
      playPromiseRef.current = p;
      await p;
      setIsPlaying(true);
      setAudioNotice(null);
    } catch (err: any) {
      // AbortError is normal when switching tracks rapidly; do not spam or break
      if (err.name === 'AbortError') {
        return;
      }
      console.warn("Play attempt hit issue, attempting relative path fallback:", err);
      try {
        const cleanPath = './' + target.audioSrc.replace(/^(\.\/|\/)/, '');
        audio.src = cleanPath;
        const p2 = audio.play();
        playPromiseRef.current = p2;
        await p2;
        setIsPlaying(true);
      } catch (err2: any) {
        if (err2.name !== 'AbortError') {
          setIsPlaying(false);
        }
      }
    } finally {
      playPromiseRef.current = null;
    }
  };

  const handleTogglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentTrack.hasLocalAudio && currentTrack.audioSrc) {
      await playTrackSafe(currentTrack);
    } else {
      setPlayerMode('youtube');
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    const target = filteredTracks[index];
    if (target) {
      playTrackSafe(target);
    }
  };

  const handleNext = () => {
    if (filteredTracks.length <= 1) return;
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * filteredTracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % filteredTracks.length;
    }
    setCurrentTrackIndex(nextIndex);
    const target = filteredTracks[nextIndex];
    if (target) {
      playTrackSafe(target);
    }
  };

  const handlePrev = () => {
    if (filteredTracks.length <= 1) return;
    let prevIndex: number;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    prevIndex = (currentTrackIndex - 1 + filteredTracks.length) % filteredTracks.length;
    setCurrentTrackIndex(prevIndex);
    const target = filteredTracks[prevIndex];
    if (target) {
      playTrackSafe(target);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleLikeTrack = (id: string) => {
    setLikedTrackIds(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try { localStorage.setItem('owen_liked_music', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleOpenAlbum = (album: MusicAlbum, autoPlay: boolean = false) => {
    setSelectedAlbumId(album.id);
    setSelectedArtist('All');
    setActiveTab('tracks');
    setCurrentTrackIndex(0);
    setShowSpotifyAlbumEmbed(false);

    if (autoPlay) {
      setTimeout(() => {
        const albumSongs = allTracks
          .filter(t => t.albumId === album.id || t.album.toLowerCase().trim() === album.title.toLowerCase().trim())
          .sort((a, b) => (a.trackNumber || 999) - (b.trackNumber || 999));
        if (albumSongs.length > 0) {
          playTrackSafe(albumSongs[0]);
        }
      }, 50);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Color theme helpers
  const accent = '#10b981';
  const cardBg = 'rgba(15, 23, 42, 0.65)';
  const borderCol = 'rgba(255, 255, 255, 0.08)';

  // Handle user custom audio upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newCustomTracks: CustomTrack[] = [];
    Array.from(files).forEach((file, idx) => {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const objectUrl = URL.createObjectURL(file);
      newCustomTracks.push({
        id: `custom-${Date.now()}-${idx}`,
        title: cleanTitle,
        artist: 'My Uploads',
        album: 'Local Files',
        year: new Date().getFullYear(),
        duration: '3:00',
        durationSec: 180,
        cover: './favicon.svg',
        genre: 'Custom Audio',
        audioSrc: objectUrl,
        hasLocalAudio: true,
        isCustom: true
      });
    });

    const updated = [...customTracks, ...newCustomTracks];
    setCustomTracks(updated);
    try {
      localStorage.setItem('owen_custom_music_list', JSON.stringify(updated.map(t => ({ ...t, audioSrc: '' }))));
    } catch {}

    if (newCustomTracks.length > 0) {
      playTrackSafe(newCustomTracks[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
      {/* Hidden file input for uploading user MP3s */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="audio/*" 
        multiple 
        className="hidden" 
      />

      {/* Music Header & Badges */}
      <div 
        className="p-6 md:p-8 rounded-3xl border relative overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{ backgroundColor: cardBg, borderColor: borderCol }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Headphones className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Music Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium">
                HQ Audio
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Listen to full official albums and original tracks directly inside WatermelonBase
            </p>
          </div>
        </div>

        {/* Catalog Highlights */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 78 Studio MP3s
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-mono">
            25 Official Albums
          </span>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add My MP3
          </button>
        </div>
      </div>

      {/* Audio Notification Toast */}
      {audioNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{audioNotice}</span>
        </div>
      )}

      {/* Main Player Display Card */}
      <div 
        className="p-6 md:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: cardBg, borderColor: borderCol }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Album Cover Art */}
          <div className="relative w-44 h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 group bg-slate-900">
            <img 
              src={resolveAssetUrl(currentTrack?.cover)} 
              alt={currentTrack?.title || 'Album Art'} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {isPlaying && playerMode === 'local' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <Disc3 className="w-16 h-16 text-emerald-400 animate-spin [animation-duration:4s]" />
              </div>
            )}
          </div>

          {/* Track Info & Player Controls */}
          <div className="flex-1 w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="text-xs font-mono uppercase tracking-wider font-bold"
                    style={{ color: accent }}
                  >
                    {currentTrack?.genre || 'Studio Audio'}
                  </span>
                  {currentTrack?.trackNumber && (
                    <span className="text-xs font-mono text-slate-400">
                      • Track {currentTrack.trackNumber}
                    </span>
                  )}
                  {currentTrack?.hasLocalAudio ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      Original Studio MP3
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono">
                      Official Stream
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                {currentTrack && (
                  <button 
                    onClick={() => toggleLikeTrack(currentTrack.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Favorite track"
                  >
                    <Heart className={`w-5 h-5 ${likedTrackIds.includes(currentTrack.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight truncate">
                {currentTrack?.title || 'No track selected'}
              </h2>
              <p className="text-slate-300 text-base font-medium mt-1 truncate">
                {currentTrack?.artist} <span className="text-slate-500">•</span> {currentTrack?.album}
              </p>
            </div>

            {/* Embedded Player Switcher (when stream mode is active or user chooses YouTube/Spotify) */}
            {playerMode === 'youtube' && currentTrack?.youtubeId ? (
              <div className="mt-4 rounded-2xl overflow-hidden border border-red-500/20 bg-black/60 shadow-lg">
                <div className="p-2 px-3 bg-red-950/40 border-b border-red-500/20 flex items-center justify-between text-xs text-red-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Radio className="w-3.5 h-3.5" /> Official YouTube Music Video
                  </span>
                  {currentTrack.hasLocalAudio && (
                    <button 
                      onClick={() => playTrackSafe(currentTrack)} 
                      className="text-xs text-emerald-400 hover:underline cursor-pointer"
                    >
                      Switch to Local MP3
                    </button>
                  )}
                </div>
                <div className="aspect-video w-full max-h-48">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&rel=0`}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            ) : (
              /* Local MP3 Progress & Playback Bar */
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input 
                    type="range" 
                    min={0} 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek} 
                    className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                  />
                  <span className="text-xs font-mono text-slate-400 w-10">
                    {formatTime(duration || currentTrack?.durationSec || 0)}
                  </span>
                </div>

                {/* Primary Transport Controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsShuffle(!isShuffle)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${isShuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
                      title="Shuffle"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setIsRepeat(!isRepeat)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${isRepeat ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'}`}
                      title="Repeat"
                    >
                      <Repeat className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handlePrev}
                      className="p-3 text-slate-300 hover:text-white rounded-2xl hover:bg-white/5 transition-all cursor-pointer"
                      title="Previous"
                    >
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={handleTogglePlay}
                      className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </button>
                    <button 
                      onClick={handleNext}
                      className="p-3 text-slate-300 hover:text-white rounded-2xl hover:bg-white/5 transition-all cursor-pointer"
                      title="Next"
                    >
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input 
                      type="range" 
                      min={0} 
                      max={1} 
                      step={0.01} 
                      value={isMuted ? 0 : volume} 
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }} 
                      className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hidden sm:block" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* View Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-white/5">
          <button 
            onClick={() => { setActiveTab('tracks'); setSelectedAlbumId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'tracks' && !selectedAlbumId ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            All Tracks ({allTracks.length})
          </button>
          <button 
            onClick={() => { setActiveTab('albums'); setSelectedAlbumId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'albums' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Full Albums (25)
          </button>
          <button 
            onClick={() => { setActiveTab('favorites'); setSelectedAlbumId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'favorites' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Favorites ({likedTrackIds.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search song title, artist, album, genre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Artist Horizontal Filter Chips */}
      {!selectedAlbumId && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_ARTISTS.map(artist => {
            const isSelected = selectedArtist === artist;
            return (
              <button 
                key={artist}
                onClick={() => setSelectedArtist(artist)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {artist}
              </button>
            );
          })}
        </div>
      )}

      {/* Album Hero Showcase (when an album is selected) */}
      {selectedAlbum && (
        <div 
          className="p-6 md:p-8 rounded-3xl border backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col gap-6"
          style={{ backgroundColor: cardBg, borderColor: borderCol }}
        >
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedAlbumId(null)}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Albums
            </button>
            <div className="flex items-center gap-2">
              {selectedAlbum.spotifyAlbumId && (
                <button 
                  onClick={() => setShowSpotifyAlbumEmbed(!showSpotifyAlbumEmbed)}
                  className="px-3 py-1.5 rounded-xl bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] border border-[#1DB954]/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Disc3 className="w-3.5 h-3.5" />
                  {showSpotifyAlbumEmbed ? 'Hide Spotify Player' : 'Spotify Album Player'}
                </button>
              )}
              <button 
                onClick={() => handleOpenAlbum(selectedAlbum, true)}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Play Full Album
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img 
              src={resolveAssetUrl(selectedAlbum.cover)} 
              alt={selectedAlbum.title} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-2xl border border-white/10 shrink-0"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Official Studio Album • {selectedAlbum.year}
              </span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                {selectedAlbum.title}
              </h2>
              <p className="text-base font-semibold text-slate-300">
                {selectedAlbum.artist} <span className="text-slate-500">•</span> {selectedAlbum.genre} <span className="text-slate-500">•</span> {filteredTracks.length} Tracks
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {selectedAlbum.description}
              </p>
            </div>
          </div>

          {/* Spotify Full Album Embed (Optional Toggle) */}
          {showSpotifyAlbumEmbed && selectedAlbum.spotifyAlbumId && (
            <div className="w-full rounded-2xl overflow-hidden border border-[#1DB954]/30 shadow-xl mt-2">
              <iframe 
                src={`https://open.spotify.com/embed/album/${selectedAlbum.spotifyAlbumId}?utm_source=generator&theme=0`} 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Albums Grid View (when Albums tab is active and no single album is selected) */}
      {activeTab === 'albums' && !selectedAlbumId ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {POPULAR_ALBUMS.map(album => {
            return (
              <div 
                key={album.id}
                onClick={() => handleOpenAlbum(album)}
                className="p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 group hover:border-emerald-500/50 hover:bg-white/5"
                style={{ backgroundColor: cardBg, borderColor: borderCol }}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-md">
                  <img 
                    src={resolveAssetUrl(album.cover)} 
                    alt={album.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAlbum(album, true);
                      }}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      title="Play Album"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                    {album.title}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {album.artist} • {album.year}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400/80 mt-1">
                    {album.tracksCount} tracks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Numbered Tracklist View (for selected album or all tracks) */
        <div 
          className="rounded-3xl border overflow-hidden shadow-2xl flex flex-col"
          style={{ backgroundColor: cardBg, borderColor: borderCol }}
        >
          {filteredTracks.map((track, idx) => {
            const isCurrent = track.id === currentTrack?.id;
            const isLiked = likedTrackIds.includes(track.id);
            const trackNum = track.trackNumber || idx + 1;

            return (
              <div 
                key={track.id}
                onClick={() => handleSelectTrack(idx)}
                className={`p-3.5 md:p-4 border-b last:border-b-0 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                  isCurrent 
                    ? 'bg-emerald-500/15 text-white' 
                    : 'text-slate-300 hover:bg-white/5'
                }`}
                style={{ borderColor: borderCol }}
              >
                {/* Track Left: Number / Play Icon & Title */}
                <div className="flex items-center gap-3 md:gap-4 truncate">
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {isCurrent && isPlaying ? (
                      <div className="w-4 h-4 flex items-end justify-center gap-0.5">
                        <span className="w-1 bg-emerald-400 h-full animate-bounce" />
                        <span className="w-1 bg-emerald-400 h-2/3 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1 bg-emerald-400 h-4/5 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                          {trackNum}
                        </span>
                        <Play className="w-4 h-4 hidden group-hover:block ml-0.5 text-emerald-400 fill-current" />
                      </>
                    )}
                  </div>

                  {!selectedAlbumId && (
                    <img 
                      src={resolveAssetUrl(track.cover)} 
                      alt={track.title} 
                      className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-900 border border-white/5" 
                    />
                  )}

                  <div className="flex flex-col truncate">
                    <span className={`text-xs md:text-sm font-bold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                      {track.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {track.artist} {!selectedAlbumId && `• ${track.album}`}
                    </span>
                  </div>
                </div>

                {/* Track Right: Audio Type Badge & Duration & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {track.hasLocalAudio ? (
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                      Original MP3
                    </span>
                  ) : (
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 text-[10px] font-mono">
                      Official Stream
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
                    className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                    title="Favorite track"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {(track as any).isCustom && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomTracks(prev => prev.filter(t => t.id !== track.id));
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                      title="Delete upload"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
