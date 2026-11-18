import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { REAL_MUSIC_CATALOG, MusicTrack } from '../data/musicData';
import { resolveAssetUrl } from '../utils/assetUrl';
import albumSourceUrls from '../data/albumSourceUrls.json';

export interface CustomTrack extends MusicTrack {
  isCustom?: boolean;
}

export type StreamMode = 'auto' | 'apple';
export type ActiveStreamSource = 'proxy' | 'apple' | 'direct' | 'local';

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
  streamMode: StreamMode;
  activeStreamSource: ActiveStreamSource;
  setStreamMode: (mode: StreamMode) => void;
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
const STREAM_MODE_KEY = 'owen_music_stream_mode_v2';
const APPLE_CACHE_KEY = 'owen_apple_cdn_cache_v1';

// Live Cloud Run proxy URL used when running from static hosts (e.g. GitHub Pages) where /api/* isn't local
const CLOUD_PROXY_BASE = 'https://ais-pre-7ylqt33cxq7bzpzpildi3y-58002627990.us-east1.run.app';

function detectStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location?.hostname || '';
  if (
    host.endsWith('github.io') ||
    host.endsWith('pages.dev') ||
    host.endsWith('netlify.app') ||
    host.endsWith('vercel.app') ||
    window.location?.protocol === 'file:'
  ) {
    return true;
  }
  return false;
}

function cleanQueryTerm(str: string): string {
  return str
    .replace(/\([^)]*feat[^)]*\)/gi, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*remaster[^)]*\)/gi, '')
    .replace(/\([^)]*explicit[^)]*\)/gi, '')
    .replace(/\([^)]*clean[^)]*\)/gi, '')
    .trim();
}

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);
  const activeTrackRef = useRef<CustomTrack | null>(null);
  const playAttemptRef = useRef<number>(0);
  const nextTrackRef = useRef<() => void>(() => {});
  const prevTrackRef = useRef<() => void>(() => {});
  const isPlayingRef = useRef<boolean>(false);

  // Apple iTunes CDN cache (used only when user selects 30s Apple preview mode or all full URLs are blocked)
  const appleCacheRef = useRef<Record<string, string>>({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem(APPLE_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          appleCacheRef.current = parsed;
        }
      }
    } catch {}
  }, []);

  const persistAppleCacheEntry = useCallback((trackId: string, url: string) => {
    appleCacheRef.current[trackId] = url;
    try {
      const entries = Object.entries(appleCacheRef.current);
      if (entries.length > 250) {
        appleCacheRef.current = Object.fromEntries(entries.slice(-200));
      }
      localStorage.setItem(APPLE_CACHE_KEY, JSON.stringify(appleCacheRef.current));
    } catch {}
  }, []);

  const [streamMode, setStreamModeState] = useState<StreamMode>(() => {
    try {
      const saved = localStorage.getItem(STREAM_MODE_KEY);
      if (saved === 'apple' || saved === 'auto') return saved;
    } catch {}
    return 'auto';
  });

  const setStreamMode = useCallback((mode: StreamMode) => {
    setStreamModeState(mode);
    setAudioError(null);
    try {
      localStorage.setItem(STREAM_MODE_KEY, mode);
    } catch {}
  }, []);

  const [activeStreamSource, setActiveStreamSource] = useState<ActiveStreamSource>('proxy');

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
      return saved
        ? JSON.parse(saved)
        : ['track-tyler-see-you-again', 'track-alex-g-mary', 'track-kanye-stronger', 'track-kendrick-not-like-us'];
    } catch {
      return ['track-tyler-see-you-again', 'track-alex-g-mary', 'track-kanye-stronger'];
    }
  });

  const allTracks: CustomTrack[] = useMemo(() => {
    return [...customTracks, ...REAL_MUSIC_CATALOG];
  }, [customTracks]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const currentTrack: CustomTrack = allTracks[currentTrackIndex] || REAL_MUSIC_CATALOG[0];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  isPlayingRef.current = isPlaying;
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

  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(true);
  const [isMiniPlayerCollapsed, setIsMiniPlayerCollapsed] = useState<boolean>(false);

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

  // Resolve an unblocked Apple iTunes CDN AAC stream (.m4a on audio-ssl.itunes.apple.com)
  const resolveAppleCdnUrl = useCallback(
    async (track: CustomTrack): Promise<string | null> => {
      if (track.audioSrc?.includes('audio-ssl.itunes.apple.com')) {
        return track.audioSrc;
      }
      const cached = appleCacheRef.current[track.id];
      if (cached) return cached;

      const cleanTitle = cleanQueryTerm(track.title);
      const cleanArtist = track.artist.split(',')[0].split('&')[0].trim();
      const query = `${cleanArtist} ${cleanTitle}`.trim();

      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (res.ok) {
          const data: any = await res.json();
          const results: any[] = Array.isArray(data?.results) ? data.results : [];
          const titleLower = cleanTitle.toLowerCase();
          const best =
            results.find(
              r =>
                r.previewUrl &&
                String(r.trackName || '').toLowerCase().includes(titleLower)
            ) || results.find(r => r.previewUrl);
          if (best?.previewUrl) {
            persistAppleCacheEntry(track.id, best.previewUrl);
            return best.previewUrl;
          }
        }
      } catch {}

      // Secondary fallback via our backend /api/music/resolve if fullstack
      if (!detectStaticHost()) {
        try {
          const r = await fetch(
            `/api/music/resolve?artist=${encodeURIComponent(cleanArtist)}&title=${encodeURIComponent(cleanTitle)}`,
            { signal: AbortSignal.timeout(6000) }
          );
          if (r.ok) {
            const j: any = await r.json();
            if (j?.streamUrl) {
              persistAppleCacheEntry(track.id, j.streamUrl);
              return j.streamUrl;
            }
          }
        } catch {}
      }

      return null;
    },
    [persistAppleCacheEntry]
  );

  // Build ordered candidate URLs for a track (always puts synchronous unblocked option first!)
  const buildProxyUrl = useCallback((rawUrl: string, track: CustomTrack, base = '') => {
    return `${base}/api/music/proxy?url=${encodeURIComponent(rawUrl)}&artist=${encodeURIComponent(track.artist)}&title=${encodeURIComponent(track.title)}`;
  }, []);

  const updateMediaSession = useCallback((track: CustomTrack) => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      const coverUrl = resolveAssetUrl(track.cover);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [{ src: coverUrl, sizes: '512x512', type: 'image/jpeg' }]
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
        prevTrackRef.current();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrackRef.current();
      });
      navigator.mediaSession.setActionHandler('seekto', details => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    } catch {}
  }, []);

  const resolveFullRemoteUrl = useCallback((target: CustomTrack): string | null => {
    const src = target.audioSrc;
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    const cleanName = src.replace(/^(\.\/|\/)+/, '').replace(/^music\//, '');
    return (albumSourceUrls as Record<string, string>)[cleanName] || null;
  }, []);

  const getImmediatePlayUrl = useCallback(
    (target: CustomTrack): { url: string; source: ActiveStreamSource } | null => {
      const src = target.audioSrc;
      const isRemote = src.startsWith('http://') || src.startsWith('https://');
      const isLocalAudio =
        !isRemote &&
        (src.startsWith('./music/') ||
          src.startsWith('/music/') ||
          src.startsWith('music/') ||
          src.startsWith('blob:') ||
          src.startsWith('data:'));

      if (isLocalAudio) {
        if (src.startsWith('blob:') || src.startsWith('data:')) {
          return { url: src, source: 'local' };
        }
        const cleanName = src.replace(/^(\.\/|\/)+/, '').replace(/^music\//, '');
        const mappedRemote = (albumSourceUrls as Record<string, string>)[cleanName];
        if (!mappedRemote) {
          return { url: resolveAssetUrl(src), source: 'local' };
        }
        if (streamMode === 'apple') {
          if (appleCacheRef.current[target.id]) {
            return { url: appleCacheRef.current[target.id], source: 'apple' };
          }
          return null;
        }
        const base = detectStaticHost() ? CLOUD_PROXY_BASE : '';
        return { url: buildProxyUrl(mappedRemote, target, base), source: 'proxy' };
      }

      if (src.includes('audio-ssl.itunes.apple.com')) {
        return { url: src, source: 'apple' };
      }

      if (streamMode === 'apple') {
        const cachedApple = appleCacheRef.current[target.id];
        if (cachedApple) {
          return { url: cachedApple, source: 'apple' };
        }
        return null; // Caller will async-resolve Apple URL
      }

      const base = detectStaticHost() ? CLOUD_PROXY_BASE : '';
      return { url: buildProxyUrl(src, target, base), source: 'proxy' };
    },
    [streamMode, buildProxyUrl]
  );

  // Attempt playing a specific URL; preserves synchronous gesture when called first!
  const attemptAudioUrl = useCallback(
    async (
      url: string,
      source: ActiveStreamSource,
      target: CustomTrack,
      attemptId: number
    ): Promise<'ok' | 'gesture' | 'failed'> => {
      const audio = audioRef.current;
      if (!audio || playAttemptRef.current !== attemptId) return 'failed';

      try {
        const targetHref = new URL(url, window.location.href).href;
        if (audio.src !== targetHref) {
          audio.src = targetHref;
        }
        audio.muted = isMuted;
        audio.volume = volume;
        setActiveStreamSource(source);
        currentTrackIdRef.current = target.id;
        await audio.play();
        if (playAttemptRef.current !== attemptId) return 'failed';
        setIsPlaying(true);
        setAudioError(null);
        updateMediaSession(target);
        return 'ok';
      } catch (err: any) {
        if (playAttemptRef.current !== attemptId) return 'failed';
        if (err && err.name === 'NotAllowedError') {
          setIsPlaying(false);
          return 'gesture';
        }
        return 'failed';
      }
    },
    [isMuted, volume, updateMediaSession]
  );

  const playTrack = useCallback(
    async (target: CustomTrack) => {
      if (!audioRef.current || !target || !target.audioSrc) return;
      const attemptId = ++playAttemptRef.current;
      setAudioError(null);
      activeTrackRef.current = target;

      const foundIdx = allTracks.findIndex(t => t.id === target.id);
      if (foundIdx !== -1) {
        setCurrentTrackIndex(foundIdx);
      }

      // 1. Try immediate full-length stream first (/api/music/proxy or explicit mode)
      const immediate = getImmediatePlayUrl(target);
      if (immediate) {
        const result = await attemptAudioUrl(immediate.url, immediate.source, target, attemptId);
        if (playAttemptRef.current !== attemptId) return;
        if (result === 'ok') return;
        if (result === 'gesture') {
          setAudioError(`Tap Play to start "${target.title}" on your device.`);
          return;
        }
      }

      // 2. Fallback: Direct full-length Archive URL before ever downgrading to a 30s preview
      const fullRemoteUrl = resolveFullRemoteUrl(target);
      if (
        streamMode !== 'apple' &&
        fullRemoteUrl &&
        !fullRemoteUrl.includes('audio-ssl.itunes.apple.com')
      ) {
        const directRes = await attemptAudioUrl(fullRemoteUrl, 'direct', target, attemptId);
        if (playAttemptRef.current !== attemptId) return;
        if (directRes === 'ok') return;
        if (directRes === 'gesture') {
          setAudioError(`Tap Play to start "${target.title}".`);
          return;
        }
      }

      // 3. Last-resort fallback: Apple iTunes CDN preview (only if full-length streams are blocked/unreachable or Apple mode chosen)
      const appleUrl = await resolveAppleCdnUrl(target);
      if (playAttemptRef.current !== attemptId) return;

      if (appleUrl) {
        const appleResult = await attemptAudioUrl(appleUrl, 'apple', target, attemptId);
        if (playAttemptRef.current !== attemptId) return;
        if (appleResult === 'ok') return;
        if (appleResult === 'gesture') {
          setAudioError(`Stream ready for "${target.title}" — tap Play!`);
          return;
        }
      }

      setIsPlaying(false);
      setAudioError(`Could not stream "${target.title}". Tap Retry Full Audio to try again.`);
    },
    [allTracks, streamMode, getImmediatePlayUrl, resolveFullRemoteUrl, attemptAudioUrl, resolveAppleCdnUrl]
  );

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;
    setAudioError(null);
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Synchronous direct resume if loaded cleanly for this track
    if (
      audio.src &&
      audio.src !== 'about:blank' &&
      !audio.error &&
      currentTrackIdRef.current === currentTrack.id
    ) {
      try {
        audio.muted = isMuted;
        audio.volume = volume;
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
        updateMediaSession(currentTrack);
        return;
      } catch (resumeErr: any) {
        if (resumeErr && resumeErr.name === 'NotAllowedError') {
          setIsPlaying(false);
          setAudioError('Tap Play once more to unlock iPad audio.');
          return;
        }
      }
    }

    await playTrack(currentTrack);
  }, [currentTrack, isPlaying, isMuted, volume, playTrack, updateMediaSession]);

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

  nextTrackRef.current = nextTrack;
  prevTrackRef.current = prevTrack;

  const seek = useCallback((secs: number) => {
    setCurrentTime(secs);
    if (audioRef.current) {
      audioRef.current.currentTime = secs;
    }
  }, []);

  const toggleLikeTrack = useCallback((id: string) => {
    setLikedTrackIds(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try {
        localStorage.setItem(LIKED_MUSIC_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const uploadCustomFiles = useCallback(
    (files: FileList | File[]) => {
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
          const serialized = next.map(t => ({
            ...t,
            audioSrc: t.audioSrc.startsWith('blob:') ? '' : t.audioSrc
          }));
          localStorage.setItem(CUSTOM_MUSIC_KEY, JSON.stringify(serialized.slice(0, 10)));
        } catch {}
        return next;
      });

      if (newTracks.length > 0) {
        setCurrentTrackIndex(0);
        playTrack(newTracks[0]);
      }
    },
    [playTrack]
  );

  const deleteCustomTrack = useCallback((id: string) => {
    setCustomTracks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initialize initial audio src on mount so tapping Play immediately resumes synchronously
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const audio = audioRef.current;
    if (!audio.src || audio.src === 'about:blank' || audio.src === window.location.href) {
      const pref = getImmediatePlayUrl(currentTrack);
      if (pref?.url) {
        audio.src = new URL(pref.url, window.location.href).href;
        setActiveStreamSource(pref.source);
        currentTrackIdRef.current = currentTrack.id;
      }
    }
  }, [currentTrack, getImmediatePlayUrl]);

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
        streamMode,
        activeStreamSource,
        setStreamMode,
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
      <audio
        ref={audioRef}
        playsInline
        loop={isLoop}
        preload="none"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || currentTrack.durationSec || 180);
          }
        }}
        onEnded={nextTrack}
        onError={async () => {
          const audio = audioRef.current;
          if (!audio || !audio.src || audio.src === 'about:blank' || audio.src === window.location.href) {
            return;
          }
          if (audio.error && audio.error.code === 1) {
            return;
          }

          const activeTrack = activeTrackRef.current || currentTrack;
          if (!activeTrack) return;

          const attemptId = playAttemptRef.current;
          const fullRemoteUrl = resolveFullRemoteUrl(activeTrack);

          // 1. If proxy URL errored, try direct full-length URL before falling back to 30s preview
          if (
            audio.src.includes('/api/music/proxy') &&
            fullRemoteUrl &&
            !fullRemoteUrl.includes('audio-ssl.itunes.apple.com')
          ) {
            audio.src = fullRemoteUrl;
            setActiveStreamSource('direct');
            audio.load();
            if (isPlayingRef.current) {
              try {
                await audio.play();
                if (playAttemptRef.current === attemptId) {
                  setIsPlaying(true);
                  setAudioError(null);
                }
                return;
              } catch {}
            }
            return;
          }

          // 2. Last-resort fallback onto Apple iTunes CDN preview
          if (!audio.src.includes('audio-ssl.itunes.apple.com')) {
            const appleUrl = await resolveAppleCdnUrl(activeTrack);
            if (playAttemptRef.current !== attemptId) return;

            if (appleUrl && audio.src !== appleUrl) {
              audio.src = appleUrl;
              setActiveStreamSource('apple');
              audio.load();
              if (isPlayingRef.current) {
                audio
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    setAudioError(null);
                  })
                  .catch(() => {
                    setIsPlaying(false);
                    setAudioError(`Stream ready for "${activeTrack.title}" — tap Play!`);
                  });
              }
              return;
            }
          }

          setIsPlaying(false);
          setAudioError(`Could not stream "${activeTrack.title}". Tap Play to retry.`);
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
