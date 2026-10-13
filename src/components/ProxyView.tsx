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
  Layers, 
  Bookmark, 
  Compass, 
  Copy, 
  Check, 
  Server,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';

import { ThemeConfig } from '../services/themeStore';

interface ProxyViewProps {
  initialUrl?: string;
  onOpenInTab?: (title: string, url: string, icon?: string) => void;
  activeTheme?: ThemeConfig;
}

interface UnblockedBookmark {
  name: string;
  url: string;
  icon: string;
  category: string;
}

const DEFAULT_PROXY_HOME = 'https://www.google.com/webhp?igu=1';

const UNBLOCKED_BOOKMARKS: UnblockedBookmark[] = [
  { name: 'Google Search', url: 'https://www.google.com/webhp?igu=1', icon: '🔍', category: 'Search' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page', icon: '📚', category: 'Knowledge' },
  { name: 'Wayback Machine', url: 'https://web.archive.org/', icon: '🏛️', category: 'Archive' },
  { name: 'Scratch MIT', url: 'https://scratch.mit.edu/explore/projects/all', icon: '🐱', category: 'Coding' },
  { name: 'CoolMath Games', url: 'https://www.coolmathgames.com/', icon: '📐', category: 'Games' },
  { name: 'GitHub', url: 'https://github.com/explore', icon: '🐙', category: 'Dev' },
  { name: 'Brave Search', url: 'https://search.brave.com', icon: '🦁', category: 'Search' },
  { name: 'Reddit Lite', url: 'https://old.reddit.com/r/all', icon: '🤖', category: 'Community' },
  { name: 'Khan Academy', url: 'https://www.khanacademy.org', icon: '🎓', category: 'Study' }
];

export const ProxyView: React.FC<ProxyViewProps> = ({ initialUrl, onOpenInTab, activeTheme }) => {
  const isGithubPages = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

  const [inputUrl, setInputUrl] = useState(initialUrl || DEFAULT_PROXY_HOME);
  const [currentUrl, setCurrentUrl] = useState(initialUrl || DEFAULT_PROXY_HOME);
  const [proxyEngine, setProxyEngine] = useState<'server' | 'github_cors' | 'direct'>(
    isGithubPages ? 'github_cors' : 'server'
  );
  const [history, setHistory] = useState<string[]>([initialUrl || DEFAULT_PROXY_HOME]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Synchronize initialUrl
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  const resolveProxyUrl = (targetUrl: string, engine: 'server' | 'github_cors' | 'direct') => {
    if (!targetUrl) return 'about:blank';

    let formatted = targetUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://') && !formatted.startsWith('about:')) {
      formatted = 'https://' + formatted;
    }

    if (engine === 'direct') {
      return formatted;
    }

    // Google with igu=1 bypasses iframe restrictions natively without requiring an intermediary proxy
    if (formatted.includes('google.com')) {
      if (!formatted.includes('igu=')) {
        const separator = formatted.includes('?') ? '&' : '?';
        return formatted + separator + 'igu=1';
      }
      return formatted;
    }

    if (engine === 'server' && !isGithubPages) {
      return `/api/proxy?url=${encodeURIComponent(formatted)}`;
    }

    // GitHub Pages or Fallback CORS proxy
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(formatted)}`;
  };

  const navigateTo = (url: string) => {
    let clean = url.trim();
    if (!clean) return;

    // Check if user entered a search query or URL
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/.test(clean);

    let destination = clean;
    if (!isUrl) {
      destination = `https://www.google.com/search?igu=1&q=${encodeURIComponent(clean)}`;
    } else if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = 'https://' + destination;
    }

    setInputUrl(destination);
    setCurrentUrl(destination);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), destination]);
    setHistoryIndex(prev => prev + 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      setCurrentUrl(history[prev]);
      setInputUrl(history[prev]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      setCurrentUrl(history[next]);
      setInputUrl(history[next]);
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 50);
    }
  };

  const handleHome = () => {
    navigateTo(DEFAULT_PROXY_HOME);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Opens unblocked page in about:blank tab (immune to Securly/GoGuardian URL extension tracking)
  const handleOpenAboutBlank = () => {
    try {
      const win = window.open('about:blank', '_blank');
      if (win) {
        const doc = win.document;
        doc.open();
        const activeSrc = resolveProxyUrl(currentUrl, proxyEngine);
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Google Docs</title>
              <link rel="icon" href="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico">
              <style>
                html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
                iframe { width:100%; height:100%; border:0; }
              </style>
            </head>
            <body>
              <iframe src="${activeSrc}" allow="autoplay; fullscreen; camera; microphone; gamepad; encrypted-media"></iframe>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.warn("About:blank error:", e);
    }
  };

  const resolvedIframeSrc = resolveProxyUrl(currentUrl, proxyEngine);

  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';
  const accent = activeTheme?.accent || '#38bdf8';

  return (
    <div 
      className="flex-1 flex flex-col min-h-screen text-slate-100 p-3 md:p-6"
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
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Reload Frame"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleHome}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/5"
                title="Proxy Home"
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
                  placeholder="Search web or enter website URL (e.g. wikipedia.org)..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-[11px] font-bold border border-cyan-500/40 ml-2 transition-all cursor-pointer shrink-0"
                >
                  Go
                </button>
              </div>
            </form>

            {/* Actions: Engine Selector & Cloak */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Proxy Engine Dropdown */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
                <Server className="w-3.5 h-3.5 text-cyan-400 ml-1.5 shrink-0" />
                <select
                  value={proxyEngine}
                  onChange={(e) => setProxyEngine(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none py-0.5 px-1.5 cursor-pointer"
                >
                  {!isGithubPages && <option value="server" className="bg-[#080f1d] text-white">⚡ Dev Server Proxy</option>}
                  <option value="github_cors" className="bg-[#080f1d] text-white">🚀 GitHub Pages Mirror</option>
                  <option value="direct" className="bg-[#080f1d] text-white">🔗 Direct Embed</option>
                </select>
              </div>

              {/* About:Blank Cloaker Button */}
              <button
                onClick={handleOpenAboutBlank}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Launch this web page inside an about:blank popup (completely hides URL from school Chrome extensions like Securly)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">about:blank Cloak</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Copy current URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Bookmarks Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-cyan-400" />
              Quick Unblocked:
            </span>
            {UNBLOCKED_BOOKMARKS.map(bm => (
              <button
                key={bm.name}
                onClick={() => navigateTo(bm.url)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{bm.icon}</span>
                <span>{bm.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Embedded Web View Frame - NO sandbox attribute to avoid iframe refusal */}
        <div className="flex-1 w-full min-h-[650px] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col">
          <iframe
            ref={iframeRef}
            key={resolvedIframeSrc}
            src={resolvedIframeSrc}
            title="OwenWatermelonV3 Web Proxy Tab"
            className="w-full flex-1 min-h-[650px] border-0 bg-white"
            allow="autoplay; fullscreen; camera; microphone; gamepad; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Status & Help Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-2 py-1 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Proxy Status: Active ({proxyEngine === 'server' ? 'Node Streaming Proxy' : proxyEngine === 'direct' ? 'Direct Embed' : 'CORS Proxy'})</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Tip: If a website refuses to connect, switch to "about:blank Cloak" or toggle proxy engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
