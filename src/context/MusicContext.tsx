import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { REAL_MUSIC_CATALOG, MusicTrack } from '../data/musicData';
import { resolveAssetUrl } from '../utils/assetUrl';

export interface CustomTrack extends MusicTrack {
  isCustom?: boolean;
}

interface MusicContextType {
  currentTrack: CustomTrack;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  isLoop: boolean;
  audioError: string | null;
  allTracks: CustomTrack[];
  customTracks: CustomTrack[];
  likedTrackIds: string[];
  currentTrackIndex: number;
  isMiniPlayerOpen: boolean;
  isMiniPlayerCollapsed: boolean;
  setIsMiniPlayerOpen: (open: boolean) => void;
  setIsMiniPlayerCollapsed: (collapsed: boolean) => void;
  playTrack: (track: CustomTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (secs: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  toggleLikeTrack: (id: string) => void;
  uploadCustomFiles: (files: FileList | File[]) => void;
  deleteCustomTrack: (id: string) => void;
  setCurrentTrackIndex: (index: number) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const CUSTOM_MUSIC_KEY = 'owen_custom_music_list';
const LIKED_MUSIC_KEY = 'owen_liked_music';
const MUSIC_VOL_KEY = 'owen_music_volume';


const FALLBACK_TRACKS_BY_ARTIST: Record<string, string> = {
  tyler: "./music/tyler_see_you_again.mp3",
  frank: "./music/frank_pink_white.mp3",
  kendrick: "./music/kendrick_humble.mp3",
  billie: "./music/billie_birds_of_a_feather.mp3",
  steve: "./music/steve_lacy_bad_habit.mp3",
  kanye: "./music/kanye_stronger.mp3",
  drake: "./music/drake_passionfruit.mp3",
  alex: "./music/alex_g_mary.mp3",
  weeknd: "./music/weeknd_blinding_lights.mp3",
  travis: "./music/travis_sicko_mode.mp3"
};

export function getSafeLocalFallback(artist?: string): string {
  const a = (artist || "").toLowerCase();
  for (const [key, path] of Object.entries(FALLBACK_TRACKS_BY_ARTIST)) {
    if (a.includes(key)) {
      return resolveAssetUrl(path);
    }
  }
  return resolveAssetUrl("./music/tyler_see_you_again.mp3");
}

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Custom uploaded tracks
  const [customTracks, setCustomTracks] = useState<CustomTrack[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_MUSIC_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) 
        ? parsed.filter(t => t && typeof t.audioSrc === 'string' && t.audioSrc.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  });

  // Liked tracks
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LIKED_MUSIC_KEY);
      return saved ? JSON.parse(saved) : ['track-tyler-see-you-again', 'track-alex-g-mary', 'track-kanye-stronger', 'track-kendrick-not-like-us'];
    } catch {
      return ['track-tyler-see-you-again', 'track-alex-g-mary', 'track-kanye-stronger'];
    }
  });

  // Combined tracks (custom uploads + real MP3 catalogue)
  const allTracks: CustomTrack[] = useMemo(() => {
    return [...customTracks, ...REAL_MUSIC_CATALOG];
  }, [customTracks]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const currentTrack: CustomTrack = allTracks[currentTrackIndex] || REAL_MUSIC_CATALOG[0];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(MUSIC_VOL_KEY);
      return saved !== null ? Number(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isLoop, setIsLoop] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Floating Mini-Player state
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(true);
  const [isMiniPlayerCollapsed, setIsMiniPlayerCollapsed] = useState<boolean>(false);

  // Sync volume with audio element
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
      setIsMuted(clamped === 0);
    }
    try {
      localStorage.setItem(MUSIC_VOL_KEY, String(clamped));
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLoop(prev => !prev);
  }, []);

  // Update MediaSession API for OS media notifications & keyboard keys
  const updateMediaSession = useCallback((track: CustomTrack) => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const coverUrl = resolveAssetUrl(track.cover);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    } catch (e) {
      // MediaSession error ignore
    }
  }, []);

  // Play a specific track with robust streaming
  const playTrack = useCallback(async (target: CustomTrack) => {
    if (!audioRef.current || !target || !target.audioSrc) return;
    setAudioError(null);
    const audio = audioRef.current;

    // Update current index if found in catalog
    const foundIdx = allTracks.findIndex(t => t.id === target.id);
    if (foundIdx !== -1) {
      setCurrentTrackIndex(foundIdx);
    }

    const isRemoteUrl = target.audioSrc.startsWith('http://') || target.audioSrc.startsWith('https://');
    const isStaticHost = typeof window !== 'undefined' && 
      (window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:');

    // On fullstack server, route remote full MP3s through /api/music/proxy to bypass school filters and provide instant byte-range streaming
    const preferredUrl = !isStaticHost && isRemoteUrl
      ? `/api/music/proxy?url=${encodeURIComponent(target.audioSrc)}`
      : resolveAssetUrl(target.audioSrc);

    const tryPlaySource = async (url: string): Promise<boolean> => {
      try {
        if (!url) return false;
        if (audio.src !== url && !audio.src.endsWith(url)) {
          audio.src = url;
          audio.load();
        }
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        updateMediaSession(target);
        return true;
      } catch (err: any) {
        if (err && err.name === "NotAllowedError") {
          setIsPlaying(false);
          setAudioError(null);
          return true;
        }
        return false;
      }
    };

    // 1. Try preferred same-origin proxy (exact full-length song, unblocked at school)
    const okPrimary = await tryPlaySource(preferredUrl);
    if (okPrimary) return;

    // 2. Direct fallback to original audioSrc (works on unfiltered connections)
    if (preferredUrl !== target.audioSrc) {
      const okDirect = await tryPlaySource(target.audioSrc);
      if (okDirect) return;
    }

    setAudioError(`Could not stream "${target.title}". Tap play to retry.`);
    setIsPlaying(false);
  }, [allTracks, updateMediaSession]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;
    setAudioError(null);
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // If audio element is already loaded, resume immediately!
    if (audio.src && audio.src !== "about:blank" && !audio.error) {
      try {
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        updateMediaSession(currentTrack);
        return;
      } catch (resumeErr) {
        console.warn("Direct resume failed, reloading track:", resumeErr);
      }
    }

    await playTrack(currentTrack);
  }, [currentTrack, isPlaying, playTrack, updateMediaSession]);
  const nextTrack = useCallback(() => {
    if (allTracks.length <= 1) return;
    setAudioError(null);
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * allTracks.length);
      if (nextIndex === currentTrackIndex && allTracks.length > 1) {
        nextIndex = (nextIndex + 1) % allTracks.length;
      }
    } else {
      nextIndex = (currentTrackIndex + 1) % allTracks.length;
    }
    setCurrentTrackIndex(nextIndex);
    const target = allTracks[nextIndex];
    if (target) {
      playTrack(target);
    }
  }, [allTracks, currentTrackIndex, isShuffle, playTrack]);

  const prevTrack = useCallback(() => {
    if (allTracks.length <= 1) return;
    setAudioError(null);
    const prevIndex = (currentTrackIndex - 1 + allTracks.length) % allTracks.length;
    setCurrentTrackIndex(prevIndex);
    const target = allTracks[prevIndex];
    if (target) {
      playTrack(target);
    }
  }, [allTracks, currentTrackIndex, playTrack]);

  const seek = useCallback((secs: number) => {
    setCurrentTime(secs);
    if (audioRef.current) {
      audioRef.current.currentTime = secs;
    }
  }, []);

  const toggleLikeTrack = useCallback((id: string) => {
    setLikedTrackIds(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try { localStorage.setItem(LIKED_MUSIC_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // Upload custom MP3 files
  const uploadCustomFiles = useCallback((files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const newTracks: CustomTrack[] = [];
    const filesArray = Array.from(files);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const blobUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const parts = cleanName.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Downloaded Audio';
      const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : cleanName;

      const newTrack: CustomTrack = {
        id: 'custom-' + Date.now() + '-' + i,
        title,
        artist,
        album: 'My MP3 Uploads',
        year: new Date().getFullYear(),
        duration: '3:30',
        durationSec: 210,
        cover: './music/covers/tyler_flower_boy.jpg',
        genre: 'User MP3',
        audioSrc: blobUrl,
        isCustom: true,
        hasLocalAudio: true
      };
      newTracks.push(newTrack);
    }

    setCustomTracks(prev => {
      const next = [...newTracks, ...prev];
      try {
        const serialized = next.map(t => ({ ...t, audioSrc: t.audioSrc.startsWith('blob:') ? '' : t.audioSrc }));
        localStorage.setItem(CUSTOM_MUSIC_KEY, JSON.stringify(serialized.slice(0, 10)));
      } catch {}
      return next;
    });

    if (newTracks.length > 0) {
      setCurrentTrackIndex(0);
      playTrack(newTracks[0]);
    }
  }, [playTrack]);

  const deleteCustomTrack = useCallback((id: string) => {
    setCustomTracks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync initial audio src on mount or track change if not already playing
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    const sourceUrl = resolveAssetUrl(currentTrack.audioSrc);
    if (!sourceUrl) return;

    const isMatching = audio.src.endsWith(currentTrack.audioSrc) || audio.src.endsWith(sourceUrl) || audio.src === sourceUrl;
    if (!isMatching && !isPlaying) {
      audio.src = sourceUrl;
    }
  }, [currentTrack, isPlaying]);

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMuted,
        volume,
        currentTime,
        duration,
        isShuffle,
        isLoop,
        audioError,
        allTracks,
        customTracks,
        likedTrackIds,
        currentTrackIndex,
        isMiniPlayerOpen,
        isMiniPlayerCollapsed,
        setIsMiniPlayerOpen,
        setIsMiniPlayerCollapsed,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleLoop,
        toggleLikeTrack,
        uploadCustomFiles,
        deleteCustomTrack,
        setCurrentTrackIndex
      }}
    >
      {/* Root persistent HTML5 Audio Element with byte-range MP3 streaming */}
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
        onEnded={nextTrack}
        onError={() => {
          const audio = audioRef.current;
          if (!audio || !audio.src || audio.src === "about:blank" || audio.src === window.location.href) {
            return;
          }
          if (audio.error && audio.error.code === 1) {
            return; // Aborted by user
          }
          console.warn("Audio element error on:", audio.src, audio.error);

          // If a proxied URL failed, try the direct remote URL
          if (audio.src.includes('/api/music/proxy?url=')) {
            try {
              const urlParam = new URL(audio.src, window.location.origin).searchParams.get('url');
              if (urlParam && audio.src !== urlParam) {
                console.log("Proxy retry with direct remote source:", urlParam);
                audio.src = urlParam;
                audio.load();
                if (isPlaying) {
                  audio.play().catch(() => {});
                }
                return;
              }
            } catch (e) {}
          }

          setIsPlaying(false);
          setAudioError(`Audio connection error on "${currentTrack?.title}". Tap to retry.`);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setAudioError(null);
          updateMediaSession(currentTrack);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
