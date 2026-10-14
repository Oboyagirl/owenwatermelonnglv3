import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  Maximize2, 
  Minimize2,
  Bookmark, 
  Copy, 
  Check, 
  Server,
  Sparkles,
  Zap,
  Loader2,
  AlertTriangle,
  Settings,
  X
} from 'lucide-react';

import { ThemeConfig } from '../services/themeStore';

interface ProxyViewProps {
  initialUrl?: string;
  onOpenInTab?: (title: string, url: string, icon?: string) => void;
  activeTheme?: ThemeConfig;
}

export type ProxyEngine = 'google_proxy' | 'server' | 'codetabs' | 'wayback' | 'direct';

interface UnblockedBookmark {
  name: string;
  url: string;
  icon: string;
  category: string;
  description: string;
  recommendedEngine?: ProxyEngine;
}

const DEFAULT_PROXY_HOME = 'about:home';
const PROXY_CUSTOM_SERVER_KEY = 'owen_custom_proxy_server_url';

const UNBLOCKED_BOOKMARKS: UnblockedBookmark[] = [
  { name: 'DuckDuckGo Search', url: 'https://html.duckduckgo.com/html/', icon: '🦆', category: 'Search', description: 'Fast, private unblocked search engine', recommendedEngine: 'google_proxy' },
  { name: 'Wikipedia Mobile', url: 'https://en.m.wikipedia.org/', icon: '📚', category: 'Knowledge', description: 'Free encyclopedia formatted for embed and mobile', recommendedEngine: 'direct' },
  { name: 'Scratch MIT', url: 'https://scratch.mit.edu/explore/projects/all', icon: '🐱', category: 'Coding', description: 'Play games, stories, and animations', recommendedEngine: 'direct' },
  { name: 'CoolMath Games', url: 'https://www.coolmathgames.com/', icon: '📐', category: 'Games', description: 'Classic strategy, puzzle, and skill games', recommendedEngine: 'google_proxy' },
  { name: 'Wayback Machine', url: 'https://web.archive.org/', icon: '🏛️', category: 'Archive', description: 'Explore over 800 billion saved web pages', recommendedEngine: 'wayback' },
  { name: 'GitHub Explore', url: 'https://github.com/explore', icon: '🐙', category: 'Dev', description: 'Discover open source code & software projects', recommendedEngine: 'google_proxy' },
  { name: 'Brave Search', url: 'https://search.brave.com', icon: '🦁', category: 'Search', description: 'Independent private search engine', recommendedEngine: 'google_proxy' },
  { name: 'Reddit Lite', url: 'https://old.reddit.com/r/all', icon: '🤖', category: 'Community', description: 'Lightweight text-first community discussions', recommendedEngine: 'google_proxy' },
  { name: 'Lichess Online', url: 'https://lichess.org/', icon: '♟️', category: 'Games', description: 'Free open-source chess with puzzles', recommendedEngine: 'direct' },
  { name: 'Desmos Calculator', url: 'https://www.desmos.com/calculator', icon: '🔢', category: 'Math', description: 'Fast interactive graphing calculator', recommendedEngine: 'direct' }
];

export const ProxyView: React.FC<ProxyViewProps> = ({ initialUrl, onOpenInTab, activeTheme }) => {
  const isGithubPages = typeof window !== 'undefined' && (
    window.location.hostname.endsWith('github.io') || 
    window.location.hostname.includes('github')
  );

  const [hasServerProxy, setHasServerProxy] = useState<boolean>(!isGithubPages);
  const [customServerUrl, setCustomServerUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(PROXY_CUSTOM_SERVER_KEY) || '';
    } catch {
      return '';
    }
  });

  // Starting URL
  const startingUrl = (!initialUrl || initialUrl.includes('google.com/webhp') || initialUrl.includes('duckduckgo.com/lite'))
    ? DEFAULT_PROXY_HOME
    : initialUrl;

  const [inputUrl, setInputUrl] = useState(startingUrl === 'about:home' ? '' : startingUrl);
  const [currentUrl, setCurrentUrl] = useState(startingUrl);
  const [proxyEngine, setProxyEngine] = useState<ProxyEngine>(isGithubPages ? 'google_proxy' : 'server');
  const [history, setHistory] = useState<string[]>([startingUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background ping to verify if local Node.js /api/proxy backend is reachable
  useEffect(() => {
    let isMounted = true;
    const testServer = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('/api/proxy?url=https%3A%2F%2Fexample.com', {
          method: 'HEAD',
          signal: controller.signal
        });
        clearTimeout(timer);
        if (isMounted) {
          if (res.ok) {
            setHasServerProxy(true);
          } else {
            setHasServerProxy(false);
            if (proxyEngine === 'server') {
              setProxyEngine('google_proxy');
            }
          }
        }
      } catch {
        if (isMounted) {
          setHasServerProxy(false);
          if (proxyEngine === 'server') {
            setProxyEngine('google_proxy');
          }
        }
      }
    };

    if (!isGithubPages) {
      testServer();
    } else {
      setHasServerProxy(false);
    }

    return () => { isMounted = false; };
  }, [isGithubPages]);

  // Synchronize initialUrl if passed from parent
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl && !initialUrl.includes('google.com/webhp')) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  const saveCustomServer = (url: string) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    setCustomServerUrl(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem(PROXY_CUSTOM_SERVER_KEY, trimmed);
      } else {
        localStorage.removeItem(PROXY_CUSTOM_SERVER_KEY);
      }
    } catch {}
  };

  const resolveProxyUrl = (targetUrl: string, engine: ProxyEngine) => {
    if (!targetUrl || targetUrl === 'about:home' || targetUrl === 'about:blank') return '';

    let formatted = targetUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }

    if (engine === 'direct') {
      return formatted;
    }

    if (engine === 'wayback') {
      return `https://web.archive.org/web/${formatted}`;
    }

    if (engine === 'codetabs') {
      return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(formatted)}`;
    }

    if (engine === 'server') {
      if (customServerUrl) {
        return `${customServerUrl}/api/proxy?url=${encodeURIComponent(formatted)}`;
      }
      if (hasServerProxy) {
        return `/api/proxy?url=${encodeURIComponent(formatted)}`;
      }
      // If server unavailable on GitHub Pages, fallback to Google proxy mirror
      return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(formatted)}`;
    }

    // Default 'google_proxy': Google Translate mirror acts as a full web proxy,
    // rewrites hyperlinks and assets, bypasses school firewalls (Securly/GoGuardian)
    // and explicitly permits iframe embedding with zero white screen.
    return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(formatted)}`;
  };

  const navigateTo = (url: string, engineOverride?: ProxyEngine) => {
    let clean = url.trim();
    if (!clean) return;

    if (engineOverride) {
      setProxyEngine(engineOverride);
    }

    if (clean === 'about:home' || clean === 'home') {
      setInputUrl('');
      setCurrentUrl('about:home');
      setIsLoading(false);
      setLoadError(false);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), 'about:home']);
      setHistoryIndex(prev => prev + 1);
      return;
    }

    // Check if user entered a search query or a valid URL
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/i.test(clean);

    let destination = clean;
    if (!isUrl) {
      // Direct query to DuckDuckGo HTML
      destination = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(clean)}`;
    } else if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = 'https://' + destination;
    }

    setInputUrl(destination);
    setCurrentUrl(destination);
    setIsLoading(true);
    setLoadError(false);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), destination]);
    setHistoryIndex(prev => prev + 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    navigateTo(inputUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      const target = history[prev];
      setCurrentUrl(target);
      setInputUrl(target === 'about:home' ? '' : target);
      if (target !== 'about:home') setIsLoading(true);
      setLoadError(false);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      const target = history[next];
      setCurrentUrl(target);
      setInputUrl(target === 'about:home' ? '' : target);
      if (target !== 'about:home') setIsLoading(true);
      setLoadError(false);
    }
  };

  const handleReload = () => {
    if (currentUrl === 'about:home') return;
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  };

  const handleHome = () => {
    navigateTo('about:home');
  };

  const handleCopyLink = () => {
    const textToCopy = currentUrl === 'about:home' ? window.location.href : currentUrl;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Opens unblocked page in about:blank tab with Google Docs camouflage
  const handleOpenAboutBlank = (targetOverride?: string) => {
    const rawTarget = targetOverride || (currentUrl === 'about:home' ? 'https://html.duckduckgo.com/html/' : currentUrl);
    let target = rawTarget.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    try {
      const win = window.open('about:blank', '_blank');
      if (win) {
        const doc = win.document;
        doc.open();

        let activeEmbedSrc = target;
        if (proxyEngine === 'google_proxy' || (!hasServerProxy && !customServerUrl)) {
          activeEmbedSrc = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(target)}`;
        } else if (proxyEngine === 'server' && (hasServerProxy || customServerUrl)) {
          activeEmbedSrc = customServerUrl 
            ? `${customServerUrl}/api/proxy?url=${encodeURIComponent(target)}`
            : `/api/proxy?url=${encodeURIComponent(target)}`;
        } else if (proxyEngine === 'codetabs') {
          activeEmbedSrc = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`;
        }

        const pageDomain = target.replace(/https?:\/\//, '').split('/')[0];

        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Untitled document - Google Docs</title>
              <link rel="icon" href="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico">
              <style>
                * { box-sizing: border-box; }
                html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#080f1d; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                #stealth-bar {
                  height: 42px; background: #040914; border-bottom: 1px solid rgba(255,255,255,0.1);
                  display: flex; align-items: center; justify-content: space-between; padding: 0 16px; color: #94a3b8; font-size: 12px;
                }
                #stealth-bar button {
                  color: #38bdf8; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.3);
                  padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.2s;
                }
                #stealth-bar button:hover { background: rgba(56,189,248,0.25); color: #fff; }
                iframe { width:100%; height: calc(100% - 42px); border:0; background: #080f1d; }
              </style>
            </head>
            <body>
              <div id="stealth-bar">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow: 0 0 8px #10b981;"></span>
                  <span style="color:#f8fafc; font-weight:700;">Stealth Tab:</span>
                  <span style="color:#cbd5e1; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pageDomain}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <button onclick="document.getElementById('stealth-frame').src='https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(target)}'">🌐 Google Relay</button>
                  <button onclick="document.getElementById('stealth-frame').src='${target}'">🔗 Direct</button>
                  <button onclick="window.close()" style="color:#f87171; border-color:rgba(248,113,113,0.3); background:rgba(248,113,113,0.1);">✕ Close</button>
                </div>
              </div>
              <iframe id="stealth-frame" src="${activeEmbedSrc}" allow="autoplay; fullscreen; camera; microphone; gamepad; encrypted-media; picture-in-picture"></iframe>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.warn("About:blank error:", e);
      window.open(target, '_blank');
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const isHome = currentUrl === 'about:home';
  const resolvedIframeSrc = isHome ? '' : resolveProxyUrl(currentUrl, proxyEngine);

  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';
  const accent = activeTheme?.accent || '#38bdf8';

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-2' : 'min-h-screen p-3 md:p-6'} text-slate-100`}
      style={{ backgroundColor: activeTheme?.bgPrimary || '#020810' }}
    >
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-4">
        
        {/* OwenWatermelon Omnibar & Browser Control Header */}
        <div 
          className="p-3 md:p-4 rounded-2xl border shadow-2xl flex flex-col gap-3"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleBack}
                disabled={historyIndex <= 0}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Forward"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleReload}
                disabled={isHome}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Reload Frame"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <button
                onClick={handleHome}
                className={`p-2 rounded-xl ${isHome ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'} transition-all cursor-pointer border border-white/5`}
                title="Unblocker Home Portal"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>

            {/* Omnibar Input Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 min-w-[260px] relative">
              <div className="flex items-center w-full bg-black/60 border border-white/10 hover:border-cyan-500/50 focus-within:border-cyan-400 rounded-xl px-3.5 py-1.5 transition-all shadow-inner">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Search web or enter website URL (e.g. scratch.mit.edu, coolmathgames.com)..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[11px] font-bold border border-cyan-500/40 ml-2 transition-all cursor-pointer shrink-0"
                >
                  Go
                </button>
              </div>
            </form>

            {/* Actions: Engine Selector, Cloak, Settings, Fullscreen */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Proxy Engine Dropdown */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
                <Server className="w-3.5 h-3.5 text-cyan-400 ml-1.5 shrink-0" />
                <select
                  value={proxyEngine}
                  onChange={(e) => setProxyEngine(e.target.value as ProxyEngine)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none py-0.5 px-1.5 cursor-pointer"
                  title="Select proxy routing engine"
                >
                  <option value="google_proxy" className="bg-[#080f1d] text-white">🌐 Google Relay (GitHub Safe)</option>
                  {(hasServerProxy || customServerUrl) && (
                    <option value="server" className="bg-[#080f1d] text-white">⚡ Node Stream Proxy</option>
                  )}
                  <option value="codetabs" className="bg-[#080f1d] text-white">🚀 CodeTabs Mirror</option>
                  <option value="wayback" className="bg-[#080f1d] text-white">🏛️ Wayback Machine</option>
                  <option value="direct" className="bg-[#080f1d] text-white">🔗 Direct Embed</option>
                </select>
              </div>

              {/* About:Blank Cloaker Button */}
              <button
                onClick={() => handleOpenAboutBlank()}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                title="Launch page in an about:blank tab with Google Docs disguise (Securly & GoGuardian immune)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">about:blank Cloak</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(prev => !prev)}
                className={`p-2 rounded-xl ${showSettings ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'} border border-white/10 transition-all cursor-pointer`}
                title="Proxy Engine & Server Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Copy current URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Browser"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Bookmarks Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-cyan-400" />
              Quick Unblocked:
            </span>
            {UNBLOCKED_BOOKMARKS.slice(0, 8).map(bm => (
              <button
                key={bm.name}
                onClick={() => navigateTo(bm.url, bm.recommendedEngine)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{bm.icon}</span>
                <span>{bm.name}</span>
              </button>
            ))}
          </div>

          {/* Settings Drawer (Collapsible) */}
          {showSettings && (
            <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30 flex flex-col gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  Proxy Connection & Backend Configuration
                </span>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                <div className="flex-1">
                  <p className="text-slate-400 mb-2 leading-relaxed">
                    <strong>Hosting Environment:</strong> {isGithubPages ? 'GitHub Pages (Static Hosting)' : hasServerProxy ? 'Full-Stack Node Server' : 'Client-Side Mode'}.
                    On GitHub Pages, web proxying is automatically routed via the <strong>Google Relay Proxy</strong> or <strong>about:blank Cloak</strong> without requiring a Node backend.
                  </p>
                  
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Custom Proxy Server URL (Optional for Render, Railway, or local):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customServerUrl}
                      onChange={(e) => saveCustomServer(e.target.value)}
                      placeholder="e.g. https://my-proxy-server.onrender.com"
                      className="flex-1 bg-black/60 border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                    {customServerUrl && (
                      <button
                        onClick={() => saveCustomServer('')}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-1 min-w-[200px]">
                  <span className="font-semibold text-slate-300">Active Engine:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {proxyEngine === 'google_proxy' ? 'Google Web Relay' :
                     proxyEngine === 'server' ? (customServerUrl ? 'Custom Backend' : 'Node Streaming Server') :
                     proxyEngine === 'codetabs' ? 'CodeTabs Mirror' :
                     proxyEngine === 'wayback' ? 'Wayback Machine' : 'Direct Embed'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Frame Ancestor Safe • Zero White Screen
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Web View Frame Container - Permanent Dark Background to Prevent White Screens */}
        <div className="flex-1 w-full min-h-[650px] bg-[#080f1d] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col">
          
          {/* Top Loading Progress Line */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/30 z-20 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 animate-[pulse_1s_infinite] w-full" />
            </div>
          )}

          {/* Home Portal Screen (Shown when on about:home) */}
          {isHome ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto">
              <div className="max-w-3xl w-full flex flex-col items-center text-center gap-6">
                
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OwenWatermelon Web Unblocker</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30">
                    {isGithubPages ? 'GitHub Pages Ready' : 'Active'}
                  </span>
                </div>

                {/* Big Search Header */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    Browse the Web <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Unfiltered</span>
                  </h1>
                  <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
                    Search anything or visit blocked websites through high-speed relay mirrors with filter bypass and about:blank stealth camouflage.
                  </p>
                </div>

                {/* Big Central Search Bar */}
                <form 
                  onSubmit={handleFormSubmit}
                  className="w-full max-w-2xl relative mt-2"
                >
                  <div className="flex items-center w-full bg-black/60 border border-white/15 hover:border-cyan-400/80 focus-within:border-cyan-400 rounded-2xl px-5 py-3.5 shadow-2xl transition-all">
                    <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Search with DuckDuckGo or enter any URL (e.g. scratch.mit.edu)..."
                      className="w-full bg-transparent text-sm md:text-base text-white placeholder-slate-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-xs md:text-sm rounded-xl ml-3 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
                    >
                      Browse
                    </button>
                  </div>
                </form>

                {/* Quick Unblocked Grid */}
                <div className="w-full mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Popular Unblocked Destinations
                    </span>
                    <button 
                      onClick={() => handleOpenAboutBlank()}
                      className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Open about:blank Cloak
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
                    {UNBLOCKED_BOOKMARKS.map((bm) => (
                      <button
                        key={bm.name}
                        onClick={() => navigateTo(bm.url, bm.recommendedEngine)}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer group text-center gap-2"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{bm.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors leading-tight">{bm.name}</span>
                          <span className="text-[10px] text-slate-500">{bm.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features Pill Banner */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-2 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Securly & GoGuardian Bypass</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>X-Frame-Options Stripped</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    <span>GitHub Pages Compatible</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <>
              {/* Active Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#080f1d]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <div className="text-xs font-semibold text-slate-300">
                    Establishing unblocked connection via {
                      proxyEngine === 'google_proxy' ? 'Google Relay' :
                      proxyEngine === 'server' ? 'Node Streaming Proxy' :
                      proxyEngine === 'codetabs' ? 'CodeTabs Mirror' :
                      proxyEngine === 'wayback' ? 'Wayback Machine' : 'Direct Embed'
                    }...
                  </div>
                </div>
              )}

              {/* In-Frame Control Header Bar */}
              <div className="h-10 bg-[#040914] border-b border-white/10 flex items-center justify-between px-4 text-xs z-10 shrink-0">
                <div className="flex items-center gap-2 truncate max-w-[60%]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
                  <span className="text-slate-400 font-mono text-[11px] truncate">
                    {currentUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenAboutBlank()}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-semibold flex items-center gap-1 border border-purple-500/30 cursor-pointer transition-all"
                    title="Launch this page in an about:blank stealth tab"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Stealth Tab</span>
                  </button>

                  <button
                    onClick={() => {
                      const nextEngine = proxyEngine === 'google_proxy' ? 'codetabs' : 'google_proxy';
                      setProxyEngine(nextEngine);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-white/10 cursor-pointer transition-all"
                    title="Switch Relay Engine"
                  >
                    <RotateCcw className="w-3 h-3 text-cyan-400" />
                    <span>Switch Relay</span>
                  </button>

                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-all"
                    title="Open directly in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Embedded Web View Frame - Permanent dark background, no white flash */}
              <iframe
                ref={iframeRef}
                key={resolvedIframeSrc}
                src={resolvedIframeSrc}
                title="OwenWatermelonV3 Web Proxy Frame"
                className="w-full flex-1 min-h-[600px] border-0 bg-[#080f1d]"
                allow="autoplay; fullscreen; camera; microphone; gamepad; encrypted-media; picture-in-picture"
                onLoad={() => {
                  setIsLoading(false);
                  setLoadError(false);
                }}
                onError={() => {
                  setIsLoading(false);
                  setLoadError(true);
                }}
              />
            </>
          )}

          {/* Load error recovery prompt */}
          {loadError && !isHome && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#0a1020]/95 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200 shadow-2xl z-30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-white">Embed Blocked by Target Website</span>
                  <span className="text-[11px] text-slate-300">
                    This domain restricts direct iframe embedding. Launch in stealth tab or switch to Google relay mirror to bypass restriction.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenAboutBlank()}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Open Stealth Tab</span>
                </button>
                <button
                  onClick={() => setProxyEngine('google_proxy')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  Try Google Relay
                </button>
                <button
                  onClick={handleHome}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Home
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Status & Help Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-2 py-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>
              Engine: {
                proxyEngine === 'google_proxy' ? 'Google Web Relay (GitHub Pages Safe)' :
                proxyEngine === 'server' ? (customServerUrl ? 'Custom Backend Relay' : 'Node Streaming Proxy') :
                proxyEngine === 'codetabs' ? 'CodeTabs CORS Mirror' :
                proxyEngine === 'wayback' ? 'Wayback Machine Archive' : 'Direct Embed'
              }
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Tip: Click "about:blank Cloak" to open any unblocked page disguised as Google Docs</span>
          </div>
        </div>

      </div>
    </div>
  );
};
