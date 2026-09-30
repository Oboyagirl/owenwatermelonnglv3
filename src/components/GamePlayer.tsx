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
  ShieldCheck
} from 'lucide-react';
import { Game } from '../types/game';
import { openAboutBlankGame, resolveAssetUrl } from '../services/gamesStore';

interface GamePlayerProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onBack: () => void;
  onSelectGame: (game: Game) => void;
  allGames: Game[];
  onUpdateGame?: (gameId: string, updates: Partial<Game>) => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  game,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectGame,
  allGames,
  onUpdateGame
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);

  // Live Iframe HTML Replacement State
  const defaultIframeCode = game.iframeCode || `<iframe id="plyIframe" class="ply-iframe" title="${game.title} — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="${game.iframeSrc}"></iframe>`;
  const [showIframeEditor, setShowIframeEditor] = useState(false);
  const [iframeHtmlInput, setIframeHtmlInput] = useState(defaultIframeCode);
  const [activeIframeSrc, setActiveIframeSrc] = useState(game.iframeSrc);
  const [activeCustomHtml, setActiveCustomHtml] = useState<string | undefined>(game.customHtml);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Alternative working mirrors support
  const mirrorsList = game.mirrors && game.mirrors.length > 0 ? game.mirrors : [game.iframeSrc];
  const [currentMirrorIndex, setCurrentMirrorIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(false);

  const isLocalGame = !activeIframeSrc.startsWith('http://') && !activeIframeSrc.startsWith('https://') && !activeIframeSrc.startsWith('data:') && !activeIframeSrc.startsWith('blob:');

  const resolvedIframeSrc = (() => {
    if (activeCustomHtml) return undefined;
    if (isLocalGame) {
      return resolveAssetUrl(activeIframeSrc);
    }
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(activeIframeSrc)}`;
    }
    return activeIframeSrc;
  })();

  // Sync state whenever the selected game changes
  useEffect(() => {
    const code = game.iframeCode || `<iframe id="plyIframe" class="ply-iframe" title="${game.title} — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="${game.iframeSrc}"></iframe>`;
    setIframeHtmlInput(code);
    setActiveIframeSrc(game.iframeSrc);
    setActiveCustomHtml(game.customHtml);
    setShowIframeEditor(false);
    setSavedSuccess(false);
    setCurrentMirrorIndex(0);
    setUseProxy(false);
  }, [game.id, game.iframeSrc, game.iframeCode, game.customHtml]);

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
    setIframeHtmlInput(`<iframe id="plyIframe" class="ply-iframe" title="${game.title} — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="${nextSrc}"></iframe>`);
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

  // Parse and apply new iframe HTML or URL
  const handleApplyIframeHtml = (saveToStorage: boolean = false) => {
    const raw = iframeHtmlInput.trim();
    if (!raw) return;

    let newSrc = raw;
    let newCustomHtml: string | undefined = undefined;

    if (raw.includes('<iframe') && raw.includes('src=')) {
      // Extract src attribute from iframe HTML
      const match = raw.match(/src=["'](.*?)["']/i);
      if (match && match[1]) {
        newSrc = match[1];
      }
    } else if (raw.includes('<html') || raw.includes('<!DOCTYPE') || raw.includes('<script') || raw.includes('<div')) {
      // Entire HTML snippet
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
    const origCode = game.iframeCode || `<iframe src="${game.iframeSrc}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`;
    setIframeHtmlInput(origCode);
    setActiveIframeSrc(game.iframeSrc);
    setActiveCustomHtml(game.customHtml);
    setKeyCounter(prev => prev + 1);
  };

  const relatedGames = Array.from(
    new Map(allGames.filter(g => g.id !== game.id).map(g => [g.id, g])).values()
  ).slice(0, 4);

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
          <button
            onClick={() => setShowIframeEditor(!showIframeEditor)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
              showIframeEditor 
                ? 'bg-[#10b981] text-[#064e3b] border-[#10b981]' 
                : 'text-emerald-400 bg-[#16402a]/60 hover:bg-[#16402a] border-[#16402a]'
            }`}
            title="Replace game with custom iframe HTML"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showIframeEditor ? 'Close Iframe Editor' : 'Replace Iframe HTML'}</span>
          </button>

          <button
            onClick={() => openAboutBlankGame({
              ...game,
              iframeSrc: activeIframeSrc,
              customHtml: activeCustomHtml
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#10b981] bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/30 rounded-lg transition-colors cursor-pointer"
            title="Open in stealth about:blank window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Stealth Window</span>
          </button>
        </div>
      </div>

      {/* Slide-down Iframe HTML Editor / Replacer */}
      {showIframeEditor && (
        <div className="bg-[#0b1f14] border border-[#10b981]/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#16402a] pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-sm font-bold text-white">Replace Game Iframe HTML</h3>
              <span className="text-xs text-slate-400">
                (Paste any working <code>&lt;iframe&gt;</code> embed, raw HTML, or game link)
              </span>
            </div>
            {savedSuccess && (
              <span className="text-xs text-[#34d399] font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved to your catalog!
              </span>
            )}
          </div>

          <textarea
            value={iframeHtmlInput}
            onChange={(e) => setIframeHtmlInput(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 bg-[#06140d] border border-[#16402a] focus:border-[#10b981] rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-[#10b981] resize-y"
            placeholder={`<iframe src="https://..." width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApplyIframeHtml(false)}
                className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Apply & Test Now
              </button>
              {onUpdateGame && (
                <button
                  onClick={() => handleApplyIframeHtml(true)}
                  className="px-3.5 py-2 bg-[#16402a] hover:bg-[#255238] text-emerald-300 border border-[#2d6a4f] font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Permanently</span>
                </button>
              )}
              <button
                onClick={handleResetIframe}
                className="px-3 py-2 bg-[#0c2016] hover:bg-[#16402a] text-slate-400 hover:text-white text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>

            <button
              onClick={handleCopyEmbed}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#08160f] hover:bg-[#16402a] text-slate-300 text-xs font-medium rounded-lg border border-[#16402a] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML!' : 'Copy Current HTML'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Game Player Frame Container */}
      <div 
        ref={containerRef}
        className={`relative w-full bg-[#050d09] border border-[#16402a] rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
          isTheater ? 'h-[85vh]' : 'h-[620px] lg:h-[700px]'
        }`}
      >
        {/* In-player top toolbar */}
        <div className="h-12 bg-[#08160f] border-b border-[#16402a] px-4 flex items-center justify-between select-none shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {game.title}
            </h2>
            <span className="hidden md:inline text-xs text-slate-500">·</span>
            <span className="hidden md:inline text-xs text-slate-400">{game.author}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setUseProxy(!useProxy);
                setKeyCounter(prev => prev + 1);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                useProxy
                  ? 'bg-[#10b981] text-[#064e3b] border-[#10b981] shadow-sm'
                  : 'text-emerald-400 bg-[#16402a] hover:bg-[#255238] border border-[#10b981]/30'
              }`}
              title="Toggle Google Cloud Run Proxy to bypass school iPad web filters (Securly, GoGuardian, Lightspeed)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{useProxy ? 'iPad Unblock: ON' : '⚡ iPad Unblock'}</span>
              <span className="sm:hidden">{useProxy ? 'ON' : 'Unblock'}</span>
            </button>

            {mirrorsList.length > 1 && (
              <button
                onClick={handleNextMirror}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-[#16402a] hover:bg-[#255238] border border-[#10b981]/30 rounded-lg transition-colors cursor-pointer"
                title="Switch between alternative game servers/mirrors"
              >
                <Server className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="hidden sm:inline">Server</span> {currentMirrorIndex + 1}/{mirrorsList.length}
              </button>
            )}

            <button
              onClick={() => setShowIframeEditor(!showIframeEditor)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showIframeEditor ? 'text-[#10b981] bg-[#10b981]/20' : 'text-slate-400 hover:text-white hover:bg-[#16402a]'
              }`}
              title="Replace or Edit Iframe HTML"
            >
              <Code className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleFavorite(game.id)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isFavorite ? 'text-[#ff2d55] bg-[#ff2d55]/15' : 'text-slate-400 hover:text-white hover:bg-[#16402a]'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleReload}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#16402a] transition-colors cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsTheater(!isTheater)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isTheater ? 'text-[#10b981] bg-[#10b981]/20' : 'text-slate-400 hover:text-white hover:bg-[#16402a]'
              }`}
              title="Theater Mode"
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#16402a] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* The Game Iframe - Exact UBGHyper Embed Format */}
        <div className="relative flex-1 w-full h-full bg-[#08160f] overflow-hidden">
          <iframe
            key={`${game.id}-${keyCounter}-${useProxy ? 'proxied' : 'direct'}`}
            ref={iframeRef}
            id="plyIframe"
            className="w-full h-full border-0 block ply-iframe"
            title={`${game.title} — UBGHyper`}
            src={resolvedIframeSrc}
            srcDoc={activeCustomHtml || undefined}
            allow="fullscreen; autoplay"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups"
          />
        </div>
      </div>

      {/* Quick Troubleshooting & Server Switcher Bar */}
      <div className="w-full bg-[#0c2016]/90 border border-[#16402a] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {isLocalGame ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#10b981]/15 border border-[#10b981]/40 rounded-lg text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              <span>⚡ 100% Unblocked Local Server (Securly Safe)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-300">
              <Info className="w-4 h-4 text-[#10b981] shrink-0" />
              <span>Game blocked or black screen? Try unblocking options:</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isLocalGame && (
            <button
              onClick={() => {
                setUseProxy(!useProxy);
                setKeyCounter(prev => prev + 1);
              }}
              className={`px-2.5 py-1 font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                useProxy
                  ? 'bg-[#10b981] text-[#064e3b] border-[#10b981]'
                  : 'bg-[#16402a] hover:bg-[#255238] text-emerald-300 border-[#2d6a4f]'
              }`}
              title="Route game through secure proxy to bypass Securly or GoGuardian"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{useProxy ? '🛡️ Anti-Securly: Active' : '🛡️ Anti-Securly Proxy'}</span>
            </button>
          )}

          {mirrorsList.length > 1 && (
            <button
              onClick={handleNextMirror}
              className="px-2.5 py-1 bg-[#16402a] hover:bg-[#255238] text-emerald-300 font-medium rounded-lg border border-[#2d6a4f] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Switch Mirror ({currentMirrorIndex + 1}/{mirrorsList.length})</span>
            </button>
          )}

          <button
            onClick={() => openAboutBlankGame({
              ...game,
              iframeSrc: resolvedIframeSrc || activeIframeSrc,
              customHtml: activeCustomHtml
            })}
            className="px-2.5 py-1 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-emerald-300 font-medium rounded-lg border border-[#10b981]/30 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Opens game in an unblocked about:blank popup that circumvents extension blockers"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Launch Stealth Window</span>
          </button>
        </div>
      </div>

      {/* Game Information & Controls Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Description & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#0c2016] border border-[#16402a] rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#16402a]">
              <div>
                <h3 className="text-xl font-bold text-white">{game.title}</h3>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#10b981]/20 text-[#a7f3d0] font-semibold border border-[#10b981]/30">{game.category}</span>
                  {game.secondaryCategory && (
                    <span className="px-2 py-0.5 rounded-md bg-[#8b5cf6]/20 text-[#c4b5fd] font-semibold border border-[#8b5cf6]/30">{game.secondaryCategory}</span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{game.plays.toLocaleString()} plays</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-300">Rating: ★ {game.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIframeEditor(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-white bg-[#16402a] hover:bg-[#255238] rounded-lg transition-colors cursor-pointer border border-[#2d6a4f]"
                  title="Replace iframe HTML for this game"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Replace Iframe HTML</span>
                </button>
                <button
                  onClick={handleCopyEmbed}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#16402a]/60 hover:bg-[#16402a] rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied HTML!' : 'Copy Iframe Code'}</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-300 mt-4 leading-relaxed">
              {game.description}
            </p>

            {/* Embedded Iframe Preview Box */}
            <div className="mt-5 p-3.5 rounded-xl bg-[#06140d] border border-[#16402a]">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" /> Active Iframe HTML:
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-xs">{activeIframeSrc}</span>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all p-2 bg-[#040c08] rounded-lg border border-[#0d2919]">
                {iframeHtmlInput}
              </pre>
            </div>

            {/* Controls table */}
            {game.controls && game.controls.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#16402a]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6ee7b7] mb-3 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  How to Play & Controls
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {game.controls.map((ctrl, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#08160f] border border-[#16402a]"
                    >
                      <span className="text-xs text-slate-300">{ctrl.action}</span>
                      <kbd className="px-2 py-0.5 text-xs font-mono text-[#a7f3d0] bg-[#16402a] rounded border border-[#2d6a4f]">
                        {ctrl.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags (Anti-slop: clean unboxed text) */}
            {game.tags && game.tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#16402a] flex items-center gap-2 text-xs text-slate-400">
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
            <Sparkles className="w-4 h-4 text-[#10b981]" />
            More Games from Catalog
          </h4>
          <div className="flex flex-col gap-3">
            {relatedGames.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectGame(rel)}
                className="flex items-center gap-3 p-2.5 bg-[#0c2016] border border-[#16402a] hover:border-[#10b981]/50 rounded-xl cursor-pointer transition-colors group"
              >
                <img
                  src={rel.thumbnail}
                  alt={rel.title}
                  className="w-14 h-14 rounded-lg object-cover bg-[#08160f] shrink-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white group-hover:text-[#10b981] transition-colors truncate">
                    {rel.title}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <span>{rel.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>★ {rel.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
