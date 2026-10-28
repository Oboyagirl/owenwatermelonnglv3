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

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);
  const activeTrackRef = useRef<CustomTrack | null>(null);

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

  // Play a specific track with robust streaming (every song plays its own audio)
  const playTrack = useCallback(async (target: CustomTrack) => {
    if (!audioRef.current || !target || !target.audioSrc) return;
    setAudioError(null);
    activeTrackRef.current = target;
    const audio = audioRef.current;

    // Update current index if found in catalog
    const foundIdx = allTracks.findIndex(t => t.id === target.id);
    if (foundIdx !== -1) {
      setCurrentTrackIndex(foundIdx);
    }

    const isLocalAudio = target.hasLocalAudio || 
      target.audioSrc.startsWith('./music/') || 
      target.audioSrc.startsWith('/music/') ||
      target.audioSrc.startsWith('blob:') ||
      target.audioSrc.startsWith('data:');

    // For local tracks, play direct relative asset URL
    if (isLocalAudio) {
      const localUrl = resolveAssetUrl(target.audioSrc);
      const targetHref = new URL(localUrl, window.location.href).href;
      if (audio.src !== targetHref) {
        audio.src = targetHref;
      }
      try {
        await audio.play();
        setIsPlaying(true);
        currentTrackIdRef.current = target.id;
        updateMediaSession(target);
      } catch (err: any) {
        if (err && err.name === "NotAllowedError") {
          setIsPlaying(false);
        } else {
          setAudioError(`Could not play "${target.title}". Tap to retry.`);
        }
      }
      return;
    }

    // For remote tracks:
    // When running fullstack (dev/preview), use same-origin /api/music/proxy (unblocked, supports byte ranges)
    // On static hosting (like GitHub Pages where /api/ doesn't exist), use direct archive.org CDN URL
    const isStaticHost = typeof window !== 'undefined' && 
      (window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:');

    const directUrl = target.audioSrc;
    const proxiedUrl = `/api/music/proxy?url=${encodeURIComponent(directUrl)}`;

    const primaryUrl = isStaticHost ? directUrl : proxiedUrl;
    const secondaryUrl = isStaticHost ? proxiedUrl : directUrl;

    const trySource = async (url: string): Promise<boolean> => {
      try {
        const targetHref = new URL(url, window.location.href).href;
        if (audio.src !== targetHref) {
          audio.src = targetHref;
        }
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        currentTrackIdRef.current = target.id;
        updateMediaSession(target);
        return true;
      } catch (err: any) {
        if (err && err.name === "NotAllowedError") {
          setIsPlaying(false);
          return true;
        }
        return false;
      }
    };

    // 1. Try primary stream
    const directOk = await trySource(primaryUrl);
    if (directOk) return;

    // 2. Try secondary stream fallback
    const proxyOk = await trySource(secondaryUrl);
    if (proxyOk) return;

    // 3. If stream cannot be loaded, show error without playing a different song
    setIsPlaying(false);
    setAudioError(`Could not stream "${target.title}". Tap play to retry.`);
  }, [allTracks, updateMediaSession]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;
    setAudioError(null);
    const audio = audioRef.current;

    // Pausing: simply pause the audio element and keep currentTime intact!
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Unpausing / Resuming: If the track is already loaded on the audio element, resume directly!
    if (
      audio.src && 
      audio.src !== "about:blank" && 
      !audio.error && 
      currentTrackIdRef.current === currentTrack.id
    ) {
      try {
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        updateMediaSession(currentTrack);
        return;
      } catch (resumeErr: any) {
        if (resumeErr && resumeErr.name === "NotAllowedError") {
          setIsPlaying(false);
          return;
        }
        console.warn("Direct resume hit error, will reload track:", resumeErr);
      }
    }

    // Otherwise load and play the track
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

  // Initialize initial audio src only on mount if empty (never reset when pausing)
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    if (!audio.src || audio.src === "about:blank" || audio.src === window.location.href) {
      const isRemoteUrl = currentTrack.audioSrc.startsWith('http://') || currentTrack.audioSrc.startsWith('https://');
      const isStaticHost = typeof window !== 'undefined' && 
        (window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:');

      const initialUrl = isRemoteUrl
        ? currentTrack.audioSrc
        : resolveAssetUrl(currentTrack.audioSrc);

      if (initialUrl) {
        audio.src = initialUrl;
        currentTrackIdRef.current = currentTrack.id;
      }
    }
  }, [currentTrack]);

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
        preload="none"
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

          const activeTrack = activeTrackRef.current || currentTrack;
          if (!activeTrack) return;

          // If current stream failed and was using proxy, try direct URL
          if (
            audio.src.includes('/api/music/proxy') && 
            (activeTrack.audioSrc.startsWith('http://') || activeTrack.audioSrc.startsWith('https://'))
          ) {
            const directHref = new URL(activeTrack.audioSrc, window.location.origin).href;
            if (audio.src !== directHref) {
              console.log("Proxy stream failed, retrying direct URL for:", activeTrack.title);
              audio.src = directHref;
              if (isPlaying) {
                audio.play().catch(() => {});
              }
              return;
            }
          }

          // If direct remote failed, retry via same-origin proxy
          if (
            !audio.src.includes('/api/music/proxy') && 
            (activeTrack.audioSrc.startsWith('http://') || activeTrack.audioSrc.startsWith('https://'))
          ) {
            const proxyUrl = `/api/music/proxy?url=${encodeURIComponent(activeTrack.audioSrc)}`;
            const proxyHref = new URL(proxyUrl, window.location.origin).href;
            if (audio.src !== proxyHref) {
              console.log("Direct remote failed, retrying via same-origin proxy:", activeTrack.title);
              audio.src = proxyHref;
              if (isPlaying) {
                audio.play().catch(() => {});
              }
              return;
            }
          }

          setIsPlaying(false);
          setAudioError(`Audio connection error on "${activeTrack.title}". Tap to retry.`);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setAudioError(null);
          updateMediaSession(activeTrackRef.current || currentTrack);
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
