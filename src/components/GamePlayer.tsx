import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  Heart, 
  ArrowLeft, 
  Copy, 
  Check, 
  Sparkles,
  Info,
  Tv,
  Code,
  Save,
  Undo2,
  Server,
  RefreshCw,
  ShieldCheck,
  Scan,
  Cloud,
  Zap,
  Music,
  Play,
  Pause,
  SkipForward,
  Disc3,
  Volume2,
  VolumeX,
  Shuffle
} from 'lucide-react';
import { Game } from '../types/game';
import { openAboutBlankGame, resolveAssetUrl } from '../services/gamesStore';
import { ThemeConfig, THEMES } from '../services/themeStore';
import { CloudSaveModal } from './CloudSaveModal';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { captureUniversalGameState, captureBrowserGameState } from '../services/cloudSaveService';

interface GamePlayerProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
  onSelectGame: (game: Game) => void;
  allGames: Game[];
  onUpdateGame?: (gameId: string, updates: Partial<Game>) => void;
  activeTheme?: ThemeConfig;
  onOpenMusicSpace?: () => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectGame,
  allGames,
  onUpdateGame,
  activeTheme = THEMES.original,
  onOpenMusicSpace
}) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute 
  } = useMusic();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
  const [viewRatio, setViewRatio] = useState<'fit' | '16:9' | 'fill'>('fit');

  const cycleViewRatio = () => {
    setViewRatio(prev => {
      if (prev === 'fit') return '16:9';
      if (prev === '16:9') return 'fill';
      return 'fit';
    });
  };

  // Guard against missing game object
  const safeTitle = game?.title || 'Game';
  const safeSrc = game?.iframeSrc || '';

  // Live Iframe HTML Replacement State
  const defaultIframeCode = game?.iframeCode || `<iframe class="game-iframe" id="game-area" title="${safeTitle}" src="${safeSrc}" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`;
  const [showIframeEditor, setShowIframeEditor] = useState(false);
  const [showCloudSaveModal, setShowCloudSaveModal] = useState(false);
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [quickSaved, setQuickSaved] = useState(false);
  const { user, profile, deviceLabel, saveCurrentGame, getSavesForGame } = useAuth();
  const gameSaves = (typeof getSavesForGame === 'function' && game?.id ? getSavesForGame(game.id) : []) || [];

  const handleQuickSave = async () => {
    if (typeof saveCurrentGame !== 'function' || !game?.id) return;
    setIsQuickSaving(true);
    try {
      const contentWindow = iframeRef.current?.contentWindow || null;
      const dataToSave = await captureUniversalGameState(game.id, contentWindow);
      await saveCurrentGame(game.id, 'slot1', {
        title: safeTitle,
        saveData: dataToSave,
        saveType: 'universal',
        deviceLabel
      });
      setQuickSaved(true);
      setTimeout(() => setQuickSaved(false), 3000);
    } catch (e) {
      console.error("Quick save error:", e);
    } finally {
      setIsQuickSaving(false);
    }
  };
  const [iframeHtmlInput, setIframeHtmlInput] = useState(defaultIframeCode);
  const [activeIframeSrc, setActiveIframeSrc] = useState(safeSrc);
  const [activeCustomHtml, setActiveCustomHtml] = useState<string | undefined>(game?.customHtml);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Alternative working mirrors support
  const mirrorsList = Array.isArray(game?.mirrors) && game.mirrors.length > 0 ? game.mirrors : [safeSrc];
  const [currentMirrorIndex, setCurrentMirrorIndex] = useState(0);

  const isLocalGame = !activeIframeSrc || (!activeIframeSrc.startsWith('http://') && !activeIframeSrc.startsWith('https://') && !activeIframeSrc.startsWith('data:') && !activeIframeSrc.startsWith('blob:'));

  const isSecurlyWhitelisted = Boolean(
    activeIframeSrc && (
      activeIframeSrc.includes('academics-study.github.io') ||
      activeIframeSrc.includes('javaspence.github.io') ||
      activeIframeSrc.includes('henshmi.github.io') ||
      activeIframeSrc.includes('joe-the-chicken.github.io') ||
      activeIframeSrc.includes('gameinclassroom.github.io') ||
      activeIframeSrc.includes('pages.dev')
    )
  );

  // By default, games load directly for full speed and complete asset/WebGL compatibility.
  // Securly unblock proxy can be toggled on-demand if a user is behind a strict filter.
  const [useSecurlyProxy, setUseSecurlyProxy] = useState(false);

  const resolvedIframeSrc = (() => {
    if (activeCustomHtml) return undefined;
    if (isLocalGame) {
      return resolveAssetUrl(activeIframeSrc);
    }
    // Static GitHub Pages fallback
    if (typeof window !== 'undefined' && (window.location.hostname.endsWith('github.io') || window.location.hostname.includes('github'))) {
      return activeIframeSrc;
    }
    if (useSecurlyProxy) {
      return `/api/proxy?url=${encodeURIComponent(activeIframeSrc)}`;
    }
    return activeIframeSrc;
  })();

  // Sync state whenever the selected game changes
  useEffect(() => {
    const src = game?.iframeSrc || '';
    const title = game?.title || 'Game';
    const code = game?.iframeCode || `<iframe class="game-iframe" id="game-area" title="${title}" src="${src}" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`;
    setIframeHtmlInput(code);
    setActiveIframeSrc(src);
    setActiveCustomHtml(game?.customHtml);
    setShowIframeEditor(false);
    setSavedSuccess(false);
    setCurrentMirrorIndex(0);
    setUseSecurlyProxy(false);
  }, [game?.id, game?.iframeSrc, game?.iframeCode, game?.customHtml]);

  const handleNextMirror = () => {
    if (mirrorsList.length <= 1) {
      handleReload();
      return;
    }
    const nextIdx = (currentMirrorIndex + 1) % mirrorsList.length;
    setCurrentMirrorIndex(nextIdx);
    const nextSrc = mirrorsList[nextIdx];
    setActiveIframeSrc(nextSrc);
    setActiveCustomHtml(undefined);
    setIframeHtmlInput(`<iframe class="game-iframe" id="game-area" title="${safeTitle}" src="${nextSrc}" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`);
    setKeyCounter(prev => prev + 1);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Exit fullscreen failed', err);
      });
    }
  };

  const handleReload = () => {
    setKeyCounter(prev => prev + 1);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(iframeHtmlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyIframeHtml = (saveToStorage: boolean = false) => {
    const raw = iframeHtmlInput.trim();
    if (!raw) return;

    let newSrc = raw;
    let newCustomHtml: string | undefined = undefined;

    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      newSrc = srcMatch[1];
    } else if (raw.includes('<iframe') || raw.includes('<html') || raw.includes('<script') || raw.includes('<canvas')) {
      newCustomHtml = raw;
    } else if (!raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('/')) {
      newSrc = 'https://' + raw;
    }

    setActiveIframeSrc(newSrc);
    setActiveCustomHtml(newCustomHtml);
    setKeyCounter(prev => prev + 1);

    if (saveToStorage && onUpdateGame) {
      onUpdateGame(game.id, {
        iframeSrc: newSrc,
        iframeCode: raw,
        customHtml: newCustomHtml
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleResetIframe = () => {
    const origCode = game?.iframeCode || `<iframe src="${safeSrc}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`;
    setIframeHtmlInput(origCode);
    setActiveIframeSrc(safeSrc);
    setActiveCustomHtml(game?.customHtml);
    setKeyCounter(prev => prev + 1);
  };

  const relatedGames = Array.isArray(allGames)
    ? Array.from(
        new Map(allGames.filter(g => g && g.id && g.id !== (game?.id || '')).map(g => [g.id, g])).values()
      ).slice(0, 4)
    : [];

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6 ${isTheater ? 'max-w-none px-2 lg:px-4' : ''}`}>
      {/* Top action navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Games</span>
        </button>

        {/* Clean breadcrumb metadata */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>{game.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-white font-medium">{game.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* In-Game Real MP3 Music Controller */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-sm transition-all text-xs"
            style={{
              backgroundColor: isPlaying ? activeTheme.accentBadge : activeTheme.bgCard,
              borderColor: isPlaying ? activeTheme.accent : activeTheme.border
            }}
          >
            <button
              onClick={() => {
                if (onOpenMusicSpace) onOpenMusicSpace();
                else togglePlay();
              }}
              className="flex items-center gap-1.5 font-bold hover:underline cursor-pointer max-w-[120px] sm:max-w-[170px] truncate"
              style={{ color: isPlaying ? activeTheme.accent : '#ffffff' }}
              title={isPlaying ? `Now Playing: ${currentTrack?.title} by ${currentTrack?.artist} (Click to open Music Studio)` : 'Click to listen to real MP3 music while gaming'}
            >
              <Disc3 className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
              <span className="truncate">
                {isPlaying ? currentTrack?.title : 'Listen to Music'}
              </span>
            </button>

            <button
              onClick={togglePlay}
              className="p-1 rounded-md text-black flex items-center justify-center shrink-0 cursor-pointer shadow-sm hover:scale-105 transition-all"
              style={{ backgroundColor: activeTheme.accent }}
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer shrink-0"
              title="Next song"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Random Game Button */}
          <button
            onClick={() => {
              if (!allGames || allGames.length <= 1) return;
              const others = allGames.filter(g => g && g.id && g.id !== game?.id);
              if (others.length > 0) {
                const pick = others[Math.floor(Math.random() * others.length)];
                onSelectGame(pick);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border shadow-sm hover:scale-105 active:scale-95"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.accent,
              color: activeTheme.accent
            }}
            title="Pick and play a random game"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Game</span>
          </button>

          <button
            onClick={() => setShowCloudSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border relative"
            style={{
              backgroundColor: gameSaves.length > 0 ? activeTheme.accentBadge : activeTheme.bgCard,
              borderColor: gameSaves.length > 0 ? activeTheme.accent : activeTheme.border,
              color: gameSaves.length > 0 ? activeTheme.accent : activeTheme.kicker
            }}
            title="Cross-Device Cloud Saves: Save progress across school Chromebooks and home computers"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cloud Saves {gameSaves.length > 0 ? `(${gameSaves.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Main Game Player Frame Container */}
      <div 
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col border transition-colors ${
          isTheater ? 'h-[85vh]' : 'h-[620px] lg:h-[700px]'
        }`}
        style={{
          backgroundColor: activeTheme.bgPrimary,
          borderColor: activeTheme.border
        }}
      >
        {/* In-player top toolbar */}
        <div 
          className="h-12 border-b px-4 flex items-center justify-between select-none shrink-0 z-10 transition-colors"
          style={{
            backgroundColor: activeTheme.bgHeader,
            borderColor: activeTheme.border
          }}
        >
          <div className="flex items-center gap-3">
            <span 
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: activeTheme.accent }}
            />
            <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {game.title}
            </h2>
            <span className="hidden md:inline text-xs text-slate-500">·</span>
            <span className="hidden md:inline text-xs text-slate-400">{game.author}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {mirrorsList.length > 1 && (
              <button
                onClick={handleNextMirror}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border,
                  color: activeTheme.kicker
                }}
                title="Switch between alternative game servers/mirrors"
              >
                <Server className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                <span className="hidden sm:inline">Server</span> {currentMirrorIndex + 1}/{mirrorsList.length}
              </button>
            )}


            {/* 1-Click Quick Save Button */}
            <button
              onClick={handleQuickSave}
              disabled={isQuickSaving}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border"
              style={{
                backgroundColor: quickSaved ? 'rgba(16, 185, 129, 0.25)' : activeTheme.bgCard,
                borderColor: quickSaved ? '#10b981' : activeTheme.border,
                color: quickSaved ? '#34d399' : activeTheme.kicker
              }}
              title="1-Click Quick Save: Snapshot progress to Slot 1 instantly"
            >
              {quickSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Quick Save</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowCloudSaveModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border"
              style={{
                backgroundColor: gameSaves.length > 0 ? 'rgba(16, 185, 129, 0.15)' : activeTheme.bgCard,
                borderColor: gameSaves.length > 0 ? '#10b981' : activeTheme.border,
                color: gameSaves.length > 0 ? '#34d399' : activeTheme.kicker
              }}
              title="Cross-Device Cloud Saves: Save progress across school Chromebooks and home computers"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cloud Save</span>
            </button>

            {/* In-Player Real MP3 Music Toggle */}
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border"
              style={{
                backgroundColor: isPlaying ? activeTheme.accentBadge : activeTheme.bgCard,
                borderColor: isPlaying ? activeTheme.accent : activeTheme.border,
                color: isPlaying ? activeTheme.accent : activeTheme.kicker
              }}
              title={isPlaying ? `Background Music: ${currentTrack?.title} (Click to pause)` : 'Listen to real MP3 music while playing'}
            >
              <Disc3 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} style={{ color: activeTheme.accent }} />
              <span className="hidden sm:inline">{isPlaying ? 'Music: ON' : '🎵 Music'}</span>
            </button>

            <button
              onClick={() => onToggleFavorite(game.id)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isFavorite ? 'text-[#ff2d55] bg-[#ff2d55]/15' : 'text-slate-400 hover:text-white'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleReload}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsTheater(!isTheater)}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{
                color: isTheater ? activeTheme.accent : '#94a3b8',
                backgroundColor: isTheater ? activeTheme.accentBadge : undefined
              }}
              title="Theater Mode"
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={cycleViewRatio}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors cursor-pointer border"
              style={{
                backgroundColor: viewRatio !== 'fit' ? activeTheme.accentBadge : undefined,
                borderColor: viewRatio !== 'fit' ? activeTheme.borderActive : 'transparent',
                color: viewRatio !== 'fit' ? activeTheme.accent : '#94a3b8'
              }}
              title={`Screen Framing: ${viewRatio.toUpperCase()} (Click to cycle: Auto Fit / 16:9 / Fill Screen)`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase font-bold hidden sm:inline">{viewRatio}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* The Game Iframe - Universal Unrestricted Embed Format */}
        <div 
          className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: activeTheme.bgPrimary }}
        >
          <iframe
            key={`${game.id}-${keyCounter}-${useSecurlyProxy ? 'proxied' : 'direct'}`}
            ref={iframeRef}
            id="game-area"
            className={`border-0 block game-iframe transition-all duration-200 ${
              viewRatio === '16:9'
                ? 'w-full aspect-video max-h-full max-w-full m-auto'
                : viewRatio === 'fit'
                ? 'w-full h-full object-contain max-h-full max-w-full'
                : 'w-full h-full'
            }`}
            title={game.title}
            src={resolvedIframeSrc}
            srcDoc={activeCustomHtml || undefined}
            allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope"
            allowFullScreen
          />
        </div>
      </div>

      {/* Quick Troubleshooting & Server Switcher Bar */}
      <div 
        className="w-full rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border transition-colors"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border,
          color: '#cbd5e1'
        }}
      >
        <div className="flex items-center gap-2">
          {isLocalGame ? (
            <span 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs border"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.border,
                color: activeTheme.kicker
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span>⚡ 100% Unblocked Local Server (Safe like Soccer REAL & 2026)</span>
            </span>
          ) : isSecurlyWhitelisted ? (
            <span 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs border"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.border,
                color: activeTheme.accent
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span>🎓 Educational Whitelisted Domain (Safe like Drive Mad)</span>
            </span>
          ) : (
            <span 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs border"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.border,
                color: activeTheme.accent
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span>🛡️ Securly Bypass Engine: {useSecurlyProxy ? 'Active (Same-Origin)' : 'Direct'}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isLocalGame && (
            <button
              onClick={() => {
                setUseSecurlyProxy(!useSecurlyProxy);
                setKeyCounter(prev => prev + 1);
              }}
              className="px-2.5 py-1 font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5"
              style={{
                backgroundColor: useSecurlyProxy ? activeTheme.accent : activeTheme.bgCard,
                borderColor: useSecurlyProxy ? activeTheme.accent : activeTheme.border,
                color: useSecurlyProxy ? activeTheme.accentText : activeTheme.kicker
              }}
              title="Toggle Securly unblock engine to route game same-origin"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{useSecurlyProxy ? '🛡️ Securly Bypass: ON' : '🛡️ Direct Mirror'}</span>
            </button>
          )}

          {mirrorsList.length > 1 && (
            <button
              onClick={handleNextMirror}
              className="px-2.5 py-1 font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border,
                color: activeTheme.kicker
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
              <span>Switch Server ({currentMirrorIndex + 1}/{mirrorsList.length})</span>
            </button>
          )}

          <button
            onClick={() => openAboutBlankGame({
              ...game,
              iframeSrc: resolvedIframeSrc || activeIframeSrc,
              customHtml: activeCustomHtml
            })}
            className="px-2.5 py-1 font-medium rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5"
            style={{
              backgroundColor: activeTheme.accentBadge,
              borderColor: activeTheme.border,
              color: activeTheme.kicker
            }}
            title="Opens game in an unblocked about:blank popup that circumvents extension blockers"
          >
            <ExternalLink className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
            <span>Launch Stealth Window</span>
          </button>
        </div>
      </div>

      {/* Game Information & Controls Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Description & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div 
            className="rounded-2xl p-6 border transition-colors"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.border
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: activeTheme.border }}>
              <div>
                <h3 className="text-xl font-bold text-white">{game.title}</h3>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1.5">
                  <span 
                    className="px-2 py-0.5 rounded-md font-semibold border"
                    style={{
                      backgroundColor: activeTheme.accentBadge,
                      borderColor: activeTheme.border,
                      color: activeTheme.kicker
                    }}
                  >
                    {game.category}
                  </span>
                  {game.secondaryCategory && (
                    <span className="px-2 py-0.5 rounded-md bg-[#8b5cf6]/20 text-[#c4b5fd] font-semibold border border-[#8b5cf6]/30">
                      {game.secondaryCategory}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{(typeof game?.plays === 'number' && !isNaN(game.plays) ? game.plays : 0).toLocaleString()} plays</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300">Rating: ★ {typeof game?.rating === 'number' && !isNaN(game.rating) ? game.rating.toFixed(1) : '5.0'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIframeEditor(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border"
                  style={{
                    backgroundColor: activeTheme.bgPrimary,
                    borderColor: activeTheme.border,
                    color: activeTheme.kicker
                  }}
                  title="Replace iframe HTML for this game"
                >
                  <Code className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                  <span>Replace Iframe HTML</span>
                </button>
                <button
                  onClick={handleCopyEmbed}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer border"
                  style={{
                    backgroundColor: activeTheme.bgPrimary,
                    borderColor: activeTheme.border
                  }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied HTML!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              {game.description}
            </p>

            {/* Embedded Iframe Preview Box */}
            <div 
              className="mt-5 p-3.5 rounded-xl border"
              style={{
                backgroundColor: activeTheme.bgPrimary,
                borderColor: activeTheme.border
              }}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono font-semibold flex items-center gap-1.5" style={{ color: activeTheme.accent }}>
                  <Code className="w-3.5 h-3.5" /> Active Iframe HTML:
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-xs">{activeIframeSrc}</span>
              </div>
              <pre 
                className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all p-2 rounded-lg border bg-black/40"
                style={{ borderColor: activeTheme.border }}
              >
                {iframeHtmlInput}
              </pre>
            </div>

            {/* Controls table */}
            {game.controls && game.controls.length > 0 && (
              <div className="mt-6 pt-5 border-t" style={{ borderColor: activeTheme.border }}>
                <h4 
                  className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: activeTheme.kicker }}
                >
                  <Info className="w-3.5 h-3.5" />
                  How to Play & Controls
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {game.controls.map((ctrl, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-lg border"
                      style={{
                        backgroundColor: activeTheme.bgPrimary,
                        borderColor: activeTheme.border
                      }}
                    >
                      <span className="text-xs text-slate-300">{ctrl.action}</span>
                      <kbd 
                        className="px-2 py-0.5 text-xs font-mono rounded border"
                        style={{
                          backgroundColor: activeTheme.bgCard,
                          borderColor: activeTheme.border,
                          color: activeTheme.accent
                        }}
                      >
                        {ctrl.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {game.tags && game.tags.length > 0 && (
              <div className="mt-5 pt-4 border-t flex items-center gap-2 text-xs text-slate-400" style={{ borderColor: activeTheme.border }}>
                <span className="text-slate-500">Tags:</span>
                {game.tags.map((tag, idx) => (
                  <React.Fragment key={`${tag}-${idx}`}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span className="text-slate-300">{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Related Games */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: activeTheme.accent }} />
            More Games from Catalog
          </h4>
          <div className="flex flex-col gap-3">
            {relatedGames.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectGame(rel)}
                className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all group border hover:scale-[1.01]"
                style={{
                  backgroundColor: activeTheme.bgCard,
                  borderColor: activeTheme.border
                }}
              >
                <img
                  src={rel.thumbnail}
                  alt={rel.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-black/40"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="flex flex-col overflow-hidden">
                  <span 
                    className="text-xs font-bold text-white transition-colors truncate"
                    style={{
                      color: '#ffffff'
                    }}
                  >
                    {rel.title}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <span>{rel.category || 'Arcade'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">★ {typeof rel?.rating === 'number' && !isNaN(rel.rating) ? rel.rating.toFixed(1) : '5.0'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cloud Saves Modal */}
      <CloudSaveModal
        game={game}
        isOpen={showCloudSaveModal}
        onClose={() => setShowCloudSaveModal(false)}
        onReloadGame={handleReload}
        theme={activeTheme}
        contentWindow={iframeRef.current?.contentWindow || null}
      />
    </div>
  );
};
