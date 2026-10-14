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
  X,
  BookOpen,
  FileText,
  ChevronRight,
  Compass
} from 'lucide-react';

import { ThemeConfig } from '../services/themeStore';

interface ProxyViewProps {
  initialUrl?: string;
  onOpenInTab?: (title: string, url: string, icon?: string) => void;
  activeTheme?: ThemeConfig;
}

export type ProxyEngine = 'server' | 'search' | 'direct' | 'unblocker' | 'wayback';

interface UnblockedBookmark {
  name: string;
  url: string;
  icon: string;
  category: string;
  description: string;
  recommendedEngine: ProxyEngine;
  canEmbedDirectly?: boolean;
}

interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  source?: string;
  isWiki?: boolean;
}

interface InstantAnswer {
  heading: string;
  abstract: string;
  imageUrl?: string;
  url?: string;
  source?: string;
}

const DEFAULT_PROXY_HOME = 'about:home';
const PROXY_CUSTOM_SERVER_KEY = 'owen_custom_proxy_server_url';

const UNBLOCKED_BOOKMARKS: UnblockedBookmark[] = [
  { name: 'Wikipedia Mobile', url: 'https://en.m.wikipedia.org/', icon: '📚', category: 'Knowledge', description: 'Free encyclopedia formatted for mobile and direct embedding', recommendedEngine: 'direct', canEmbedDirectly: true },
  { name: 'Scratch MIT', url: 'https://scratch.mit.edu/explore/projects/all', icon: '🐱', category: 'Coding', description: 'Play community games, animations & interactive stories', recommendedEngine: 'direct', canEmbedDirectly: true },
  { name: 'Desmos Calculator', url: 'https://www.desmos.com/calculator', icon: '🔢', category: 'Math', description: 'Fast interactive graphing & scientific calculator', recommendedEngine: 'direct', canEmbedDirectly: true },
  { name: 'Lichess Online', url: 'https://lichess.org/', icon: '♟️', category: 'Games', description: 'Free open-source chess with puzzles & multiplayer', recommendedEngine: 'direct', canEmbedDirectly: true },
  { name: 'Wayback Machine', url: 'https://web.archive.org/', icon: '🏛️', category: 'Archive', description: 'Explore over 800 billion saved snapshots of the web', recommendedEngine: 'wayback', canEmbedDirectly: true },
  { name: 'CoolMath Games', url: 'https://www.coolmathgames.com/', icon: '📐', category: 'Games', description: 'Classic strategy, puzzle, and skill games', recommendedEngine: 'unblocker' },
  { name: 'DuckDuckGo Lite', url: 'https://duckduckgo.com/lite/', icon: '🦆', category: 'Search', description: 'Lightweight, ultra-fast search engine', recommendedEngine: 'search' },
  { name: 'GitHub Explore', url: 'https://github.com/explore', icon: '🐙', category: 'Dev', description: 'Discover open source code, trends & repos', recommendedEngine: 'unblocker' },
  { name: 'Reddit Lite', url: 'https://old.reddit.com/r/all', icon: '🤖', category: 'Community', description: 'Lightweight text-first community forum', recommendedEngine: 'unblocker' },
  { name: 'GeoFS Flight Sim', url: 'https://www.geo-fs.com/geofs.php', icon: '✈️', category: 'Sim', description: 'Free online 3D flight simulator in browser', recommendedEngine: 'direct', canEmbedDirectly: true }
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

  // Determine starting destination
  const startingUrl = (!initialUrl || initialUrl.includes('google.com/webhp') || initialUrl.includes('about:blank'))
    ? DEFAULT_PROXY_HOME
    : initialUrl;

  const [inputUrl, setInputUrl] = useState(startingUrl === 'about:home' ? '' : startingUrl);
  const [currentUrl, setCurrentUrl] = useState(startingUrl);
  
  // Default engine: Server proxy if available, otherwise native search & knowledge browser
  const [proxyEngine, setProxyEngine] = useState<ProxyEngine>(isGithubPages ? 'search' : 'server');
  
  const [history, setHistory] = useState<string[]>([startingUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Search Engine & Live Knowledge State
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [instantAnswer, setInstantAnswer] = useState<InstantAnswer | null>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // In-App Wikipedia Article Reader
  const [wikiArticleTitle, setWikiArticleTitle] = useState<string | null>(null);
  const [wikiArticleHtml, setWikiArticleHtml] = useState<string | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const omnibarRef = useRef<HTMLDivElement>(null);

  // Background ping to check if local Node.js /api/proxy backend is reachable
  useEffect(() => {
    let isMounted = true;
    const testServer = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2000);
        const res = await fetch('/api/proxy?url=https%3A%2F%2Fexample.com', {
          method: 'HEAD',
          signal: controller.signal
        });
        clearTimeout(timer);
        if (isMounted) {
          if (res.ok) {
            setHasServerProxy(true);
            setProxyEngine('server');
          } else {
            setHasServerProxy(false);
            setProxyEngine('search');
          }
        }
      } catch {
        if (isMounted) {
          setHasServerProxy(false);
          setProxyEngine('search');
        }
      }
    };

    if (!isGithubPages) {
      testServer();
    } else {
      setHasServerProxy(false);
      setProxyEngine('search');
    }

    return () => { isMounted = false; };
  }, [isGithubPages]);

  // Synchronize initialUrl if passed from outside
  useEffect(() => {
    if (initialUrl && initialUrl !== currentUrl && !initialUrl.includes('google.com/webhp')) {
      navigateTo(initialUrl);
    }
  }, [initialUrl]);

  // Autocomplete suggestions as user types
  useEffect(() => {
    const trimmed = inputUrl.trim();
    if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('.') || trimmed === 'about:home') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(trimmed)}&type=list`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && Array.isArray(data[1])) {
            setSuggestions(data[1].slice(0, 6));
            setShowSuggestions(true);
          }
        }
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputUrl]);

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

  // Perform client-side live search via DuckDuckGo and Wikipedia CORS APIs
  const performSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setSearchQuery(clean);
    setIsSearching(true);
    setSearchLoading(true);
    setInstantAnswer(null);
    setSearchResults([]);
    setShowSuggestions(false);
    setWikiArticleTitle(null);

    // Update history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), `search:${clean}`]);
    setHistoryIndex(prev => prev + 1);
    setCurrentUrl(`search:${clean}`);

    try {
      // 1. DuckDuckGo Instant Answers API
      const ddgPromise = fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(clean)}&format=json&no_html=1`)
        .then(r => r.json())
        .catch(() => null);

      // 2. Wikipedia OpenSearch API (Has Access-Control-Allow-Origin: *)
      const wikiPromise = fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(clean)}&limit=6&namespace=0&format=json&origin=*`)
        .then(r => r.json())
        .catch(() => null);

      const [ddgData, wikiData] = await Promise.all([ddgPromise, wikiPromise]);

      // Parse Instant Answer
      if (ddgData && (ddgData.AbstractText || ddgData.Heading)) {
        setInstantAnswer({
          heading: ddgData.Heading || clean,
          abstract: ddgData.AbstractText || ddgData.Definition || '',
          imageUrl: ddgData.Image ? (ddgData.Image.startsWith('http') ? ddgData.Image : `https://duckduckgo.com${ddgData.Image}`) : undefined,
          url: ddgData.AbstractURL || undefined,
          source: ddgData.AbstractSource || 'DuckDuckGo Instant'
        });
      }

      const results: SearchResultItem[] = [];

      // Add Wikipedia results
      if (wikiData && Array.isArray(wikiData[1])) {
        const titles = wikiData[1] as string[];
        const snippets = (wikiData[2] || []) as string[];
        const urls = (wikiData[3] || []) as string[];

        titles.forEach((title, idx) => {
          results.push({
            title,
            snippet: snippets[idx] || `Read comprehensive encyclopedia article on "${title}" from Wikipedia.`,
            url: urls[idx] || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
            source: 'Wikipedia',
            isWiki: true
          });
        });
      }

      // Add DDG related topics if present
      if (ddgData && Array.isArray(ddgData.RelatedTopics)) {
        ddgData.RelatedTopics.slice(0, 5).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 40),
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'Web Topic'
            });
          }
        });
      }

      setSearchResults(results);
    } catch (err) {
      console.warn('Search fetch error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch full Wikipedia article directly via CORS API
  const openWikiArticle = async (title: string) => {
    setWikiArticleTitle(title);
    setWikiLoading(true);
    setWikiArticleHtml(null);

    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (res.ok) {
        const data = await res.json();
        setWikiArticleHtml(`
          <div class="wiki-content p-4 text-slate-200">
            <h1 class="text-2xl font-bold text-white mb-2">${data.title}</h1>
            <p class="text-sm text-cyan-400 font-mono mb-4">${data.description || 'Wikipedia Encyclopedia'}</p>
            ${data.thumbnail ? `<img src="${data.thumbnail.source}" class="max-w-[280px] rounded-xl float-right ml-4 mb-4 border border-white/10" alt="${data.title}" />` : ''}
            <div class="text-slate-300 text-sm leading-relaxed whitespace-pre-line">${data.extract}</div>
            <div class="clear-both mt-6 pt-4 border-t border-white/10 flex gap-3">
              <a href="${data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-300 hover:underline">
                View Full Article on Wikipedia &rarr;
              </a>
            </div>
          </div>
        `);
      } else {
        setWikiArticleHtml(`<div class="p-4 text-slate-400">Unable to load article summary. <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(title)}" target="_blank" class="text-cyan-400 underline">Open on Wikipedia</a></div>`);
      }
    } catch {
      setWikiArticleHtml(`<div class="p-4 text-rose-400">Network error fetching Wikipedia summary.</div>`);
    } finally {
      setWikiLoading(false);
    }
  };

  // URL resolution for iframe embeds
  const resolveProxyUrl = (targetUrl: string, engine: ProxyEngine): string => {
    if (!targetUrl || targetUrl === 'about:home' || targetUrl.startsWith('search:')) return '';

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

    if (engine === 'server') {
      if (customServerUrl) {
        return `${customServerUrl}/api/proxy?url=${encodeURIComponent(formatted)}`;
      }
      if (hasServerProxy) {
        return `/api/proxy?url=${encodeURIComponent(formatted)}`;
      }
      return formatted;
    }

    // For 'unblocker' or 'search' fallback, return formatted
    return formatted;
  };

  const navigateTo = (url: string, engineOverride?: ProxyEngine) => {
    let clean = url.trim();
    if (!clean) return;

    setShowSuggestions(false);
    setWikiArticleTitle(null);

    if (engineOverride) {
      setProxyEngine(engineOverride);
    }

    if (clean === 'about:home' || clean === 'home') {
      setInputUrl('');
      setCurrentUrl('about:home');
      setIsSearching(false);
      setIsLoading(false);
      setLoadError(false);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), 'about:home']);
      setHistoryIndex(prev => prev + 1);
      return;
    }

    // Check if query is a URL
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/i.test(clean);

    if (!isUrl) {
      // It's a search term!
      setInputUrl(clean);
      performSearch(clean);
      return;
    }

    // It's a web destination
    let destination = clean;
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = 'https://' + destination;
    }

    setIsSearching(false);
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
      if (target.startsWith('search:')) {
        const query = target.replace('search:', '');
        setInputUrl(query);
        performSearch(query);
      } else {
        setIsSearching(false);
        setInputUrl(target === 'about:home' ? '' : target);
        if (target !== 'about:home') setIsLoading(true);
      }
      setLoadError(false);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      const target = history[next];
      setCurrentUrl(target);
      if (target.startsWith('search:')) {
        const query = target.replace('search:', '');
        setInputUrl(query);
        performSearch(query);
      } else {
        setIsSearching(false);
        setInputUrl(target === 'about:home' ? '' : target);
        if (target !== 'about:home') setIsLoading(true);
      }
      setLoadError(false);
    }
  };

  const handleReload = () => {
    if (currentUrl === 'about:home') return;
    if (isSearching) {
      performSearch(searchQuery);
      return;
    }
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

  // Real working stealth cloaker in about:blank disguised as Google Docs
  const handleOpenAboutBlank = (targetOverride?: string) => {
    const rawTarget = targetOverride || (currentUrl === 'about:home' || currentUrl.startsWith('search:') ? 'https://en.m.wikipedia.org' : currentUrl);
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
        if (proxyEngine === 'server' && (hasServerProxy || customServerUrl)) {
          activeEmbedSrc = customServerUrl 
            ? `${customServerUrl}/api/proxy?url=${encodeURIComponent(target)}`
            : `/api/proxy?url=${encodeURIComponent(target)}`;
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
                html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#080f1d; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f8fafc; }
                #stealth-bar {
                  height: 44px; background: #040914; border-bottom: 1px solid rgba(255,255,255,0.1);
                  display: flex; align-items: center; justify-content: space-between; padding: 0 16px; font-size: 12px;
                }
                .docs-badge { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #e2e8f0; }
                .docs-badge img { width: 16px; height: 16px; }
                .url-badge { color: #38bdf8; font-family: monospace; font-size: 11px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: rgba(56,189,248,0.1); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(56,189,248,0.2); }
                .action-btns { display: flex; align-items: center; gap: 8px; }
                .btn {
                  color: #cbd5e1; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
                  padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;
                }
                .btn:hover { background: rgba(255,255,255,0.18); color: #fff; }
                .btn-panic { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.1); }
                .btn-panic:hover { background: rgba(248,113,113,0.25); color: #fff; }
                .btn-proxy { color: #34d399; border-color: rgba(52,211,153,0.3); background: rgba(52,211,153,0.1); }
                .btn-proxy:hover { background: rgba(52,211,153,0.25); }
                #content-container { width: 100%; height: calc(100% - 44px); position: relative; }
                iframe { width:100%; height: 100%; border:0; background: #080f1d; }
              </style>
            </head>
            <body>
              <div id="stealth-bar">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div class="docs-badge">
                    <img src="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" alt="Docs" />
                    <span>Untitled document</span>
                  </div>
                  <div class="url-badge">${pageDomain}</div>
                </div>
                <div class="action-btns">
                  <a href="https://proxyium.com/" target="_blank" rel="noopener" class="btn btn-proxy" title="Open high-speed web proxy to unblock video/interactive sites">⚡ Proxyium</a>
                  <a href="https://www.croxyproxy.com/" target="_blank" rel="noopener" class="btn" title="Open CroxyProxy web unblocker">🌐 CroxyProxy</a>
                  <a href="https://web.archive.org/web/${target}" target="_blank" rel="noopener" class="btn" title="View historical archive snapshot">🏛️ Wayback</a>
                  <button onclick="window.location.href='https://classroom.google.com/'" class="btn btn-panic" title="Panic button: instantly camouflage as Google Classroom">🚨 Panic (Classroom)</button>
                  <button onclick="window.close()" class="btn">✕ Close</button>
                </div>
              </div>
              <div id="content-container">
                <iframe id="stealth-frame" src="${activeEmbedSrc}" allow="autoplay; fullscreen; camera; microphone; gamepad; encrypted-media; picture-in-picture"></iframe>
              </div>
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

  // Instant launcher for external public unblockers (Proxyium, CroxyProxy, Blockaway)
  const openExternalUnblocker = (type: 'proxyium' | 'croxyproxy' | 'blockaway' | 'wayback', targetUrl?: string) => {
    const rawTarget = targetUrl || (currentUrl === 'about:home' || currentUrl.startsWith('search:') ? 'https://google.com' : currentUrl);
    let target = rawTarget.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    if (type === 'proxyium') {
      window.open(`https://proxyium.com/`, '_blank', 'noopener,noreferrer');
    } else if (type === 'croxyproxy') {
      window.open(`https://www.croxyproxy.com/`, '_blank', 'noopener,noreferrer');
    } else if (type === 'blockaway') {
      window.open(`https://www.blockaway.net/`, '_blank', 'noopener,noreferrer');
    } else if (type === 'wayback') {
      window.open(`https://web.archive.org/web/${target}`, '_blank', 'noopener,noreferrer');
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
  const resolvedIframeSrc = (isHome || isSearching) ? '' : resolveProxyUrl(currentUrl, proxyEngine);

  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  return (
    <div 
      ref={containerRef}
      className={`flex-1 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 p-2' : 'min-h-screen p-3 md:p-6'} text-slate-100`}
      style={{ backgroundColor: activeTheme?.bgPrimary || '#020810' }}
    >
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-4">
        
        {/* OwenWatermelon Omnibar & Browser Control Header */}
        <div 
          className="p-3 md:p-4 rounded-2xl border shadow-2xl flex flex-col gap-3 relative z-30"
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
                title="Reload"
              >
                <RotateCcw className={`w-4 h-4 ${(isLoading || searchLoading) ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
              <button
                onClick={handleHome}
                className={`p-2 rounded-xl ${isHome ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'} transition-all cursor-pointer border border-white/5`}
                title="Proxy & Search Home Portal"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>

            {/* Omnibar Input Form with Autocomplete Dropdown */}
            <div ref={omnibarRef} className="flex-1 min-w-[260px] relative">
              <form onSubmit={handleFormSubmit} className="w-full">
                <div className="flex items-center w-full bg-black/60 border border-white/10 hover:border-cyan-500/50 focus-within:border-cyan-400 rounded-xl px-3.5 py-1.5 transition-all shadow-inner">
                  {isSearching ? (
                    <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-2" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-2" />
                  )}
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    placeholder="Search the web (DuckDuckGo/Wikipedia) or enter URL (scratch.mit.edu, etc.)..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  {inputUrl && (
                    <button
                      type="button"
                      onClick={() => { setInputUrl(''); setShowSuggestions(false); }}
                      className="text-slate-500 hover:text-slate-300 p-0.5 mr-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 hover:from-cyan-500/50 hover:to-emerald-500/50 text-cyan-300 rounded-lg text-[11px] font-bold border border-cyan-500/40 ml-1 transition-all cursor-pointer shrink-0"
                  >
                    Go
                  </button>
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#050b17] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputUrl(sug);
                        setShowSuggestions(false);
                        performSearch(sug);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-cyan-500/10 flex items-center gap-2 border-b border-white/5 last:border-0 cursor-pointer"
                    >
                      <Search className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  {(hasServerProxy || customServerUrl) && (
                    <option value="server" className="bg-[#080f1d] text-white">⚡ Node Stream Proxy</option>
                  )}
                  <option value="search" className="bg-[#080f1d] text-white">🔍 Built-in Search & Knowledge</option>
                  <option value="direct" className="bg-[#080f1d] text-white">🔗 Direct Embed (Wikipedia/Scratch)</option>
                  <option value="unblocker" className="bg-[#080f1d] text-white">🛡️ Web Unblocker Gateway</option>
                  <option value="wayback" className="bg-[#080f1d] text-white">🏛️ Wayback Machine</option>
                </select>
              </div>

              {/* About:Blank Cloaker Button */}
              <button
                onClick={() => handleOpenAboutBlank()}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                title="Launch page in an about:blank tab disguised as Google Docs (Securly & GoGuardian immune)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">about:blank Cloak</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(prev => !prev)}
                className={`p-2 rounded-xl ${showSettings ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'} border border-white/10 transition-all cursor-pointer`}
                title="Proxy & Server Settings"
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
              Quick Web:
            </span>
            {UNBLOCKED_BOOKMARKS.map(bm => (
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
            <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 flex flex-col gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  Proxy Engine & Backend Server Configuration
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
                    <br />
                    On GitHub Pages, you can browse seamlessly using <strong>Built-in Search & Knowledge</strong>, launch arbitrary sites via the <strong>about:blank Cloak</strong> or <strong>Proxyium/CroxyProxy</strong>, or connect a custom backend proxy below.
                  </p>
                  
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Custom Proxy Server URL (Render, Railway, or VPS):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customServerUrl}
                      onChange={(e) => saveCustomServer(e.target.value)}
                      placeholder="e.g. https://my-proxy-backend.onrender.com"
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

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-1 min-w-[220px]">
                  <span className="font-semibold text-slate-300">Active Engine:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {proxyEngine === 'server' ? (customServerUrl ? 'Custom Backend Proxy' : 'Node Streaming Proxy') :
                     proxyEngine === 'search' ? 'Built-in Search & Knowledge' :
                     proxyEngine === 'direct' ? 'Direct Embed' :
                     proxyEngine === 'unblocker' ? 'Web Unblocker Gateway' : 'Wayback Machine'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Works on GitHub Pages • Zero White Screens
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Web View Frame Container */}
        <div className="flex-1 w-full min-h-[650px] bg-[#080f1d] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative flex flex-col">
          
          {/* Top Loading Progress Line */}
          {(isLoading || searchLoading) && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/30 z-30 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 animate-[pulse_1s_infinite] w-full" />
            </div>
          )}

          {/* HOME PORTAL SCREEN */}
          {isHome ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-y-auto">
              <div className="max-w-3xl w-full flex flex-col items-center text-center gap-6">
                
                {/* Brand Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OwenWatermelon Web Unblocker & Search</span>
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
                    Search instant live answers, read encyclopedia articles in-app, or unblock external sites through stealth about:blank camouflage.
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
                      placeholder="Search Wikipedia, topics, or enter URL (e.g. scratch.mit.edu)..."
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
                      Popular Unblocked Destinations & Games
                    </span>
                    <button 
                      onClick={() => handleOpenAboutBlank()}
                      className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition-all cursor-pointer font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      about:blank Cloak
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

                {/* Web Unblocker Launchpad Cards */}
                <div className="w-full mt-2 pt-4 border-t border-white/5 flex flex-col gap-3">
                  <span className="text-xs text-slate-400 font-semibold self-start flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Web Unblocker Services (For YouTube, Discord & Filtered Sites):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <button
                      onClick={() => openExternalUnblocker('proxyium')}
                      className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        ⚡
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300">Proxyium Free</span>
                        <span className="text-[10px] text-slate-400">Fast SSL web proxy for videos</span>
                      </div>
                    </button>

                    <button
                      onClick={() => openExternalUnblocker('croxyproxy')}
                      className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                        🌐
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300">CroxyProxy</span>
                        <span className="text-[10px] text-slate-400">Advanced audio/video unblocker</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleOpenAboutBlank()}
                      className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
                        🛡️
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300">about:blank Cloak</span>
                        <span className="text-[10px] text-slate-400">Google Docs disguise tab</span>
                      </div>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          ) : isSearching ? (
            /* LIVE IN-APP SEARCH RESULTS VIEW */
            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto">
              <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">
                
                {/* Search Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h2 className="text-lg font-bold text-white">Search results for "{searchQuery}"</h2>
                      <span className="text-xs text-slate-400">Direct live web & Wikipedia knowledge</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAboutBlank(`https://duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}`)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Search in Stealth Tab</span>
                    </button>
                    <button
                      onClick={() => openExternalUnblocker('proxyium')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>⚡ Proxyium</span>
                    </button>
                  </div>
                </div>

                {/* Instant Answer Knowledge Card */}
                {instantAnswer && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-cyan-500/30 flex flex-col md:flex-row gap-5 items-start">
                    {instantAnswer.imageUrl && (
                      <img 
                        src={instantAnswer.imageUrl} 
                        alt={instantAnswer.heading} 
                        className="w-28 h-28 object-cover rounded-xl border border-white/10 shrink-0" 
                      />
                    )}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-cyan-300">{instantAnswer.heading}</span>
                        {instantAnswer.source && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-0.5 rounded-md bg-white/5">
                            {instantAnswer.source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {instantAnswer.abstract}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => openWikiArticle(instantAnswer.heading)}
                          className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Full Article in App</span>
                        </button>
                        {instantAnswer.url && (
                          <a
                            href={instantAnswer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Source Web</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* In-App Wikipedia Reader Overlay Modal */}
                {wikiArticleTitle && (
                  <div className="p-5 rounded-2xl bg-[#0b1329] border border-cyan-400/40 shadow-2xl flex flex-col gap-3 relative animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                        <BookOpen className="w-4 h-4" />
                        <span>In-App Article Reader: {wikiArticleTitle}</span>
                      </div>
                      <button 
                        onClick={() => setWikiArticleTitle(null)}
                        className="text-slate-400 hover:text-white cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {wikiLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                        <span className="text-xs text-slate-400">Loading encyclopedia article...</span>
                      </div>
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{ __html: wikiArticleHtml || '' }} 
                        className="overflow-y-auto max-h-[400px]"
                      />
                    )}
                  </div>
                )}

                {/* List of Search Results */}
                {searchLoading ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="text-xs text-slate-400">Searching web and knowledge base...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-slate-400">Web & Encyclopedia Results:</span>
                    {searchResults.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex flex-col gap-2 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-[11px] text-cyan-400/80 font-mono truncate max-w-md">
                              {item.url}
                            </span>
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {item.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.isWiki ? (
                              <button
                                onClick={() => openWikiArticle(item.title)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                title="Read directly inside the app without opening new tab"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Read in App</span>
                              </button>
                            ) : null}
                            <button
                              onClick={() => handleOpenAboutBlank(item.url)}
                              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                              title="Open disguised as Google Docs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Cloak</span>
                            </button>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                              title="Open in new browser tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                    <Compass className="w-10 h-10 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-300">No instant results found for "{searchQuery}"</span>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Try searching with a different term, or launch unblocked web search via DuckDuckGo Lite.
                    </p>
                    <button
                      onClick={() => handleOpenAboutBlank(`https://duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}`)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 cursor-pointer mt-2"
                    >
                      Launch in DuckDuckGo Lite &rarr;
                    </button>
                  </div>
                )}

              </div>
            </div>

          ) : (
            /* ACTIVE WEB VIEW / IFRAME DISPLAY */
            <>
              {/* Active Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#080f1d]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <div className="text-xs font-semibold text-slate-300">
                    Connecting to {currentUrl}...
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
                    onClick={() => openExternalUnblocker('proxyium')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 border border-emerald-500/30 cursor-pointer transition-all"
                    title="Launch via Proxyium unblocker"
                  >
                    <span>⚡ Proxyium</span>
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

              {/* Embedded Web View Frame */}
              <iframe
                ref={iframeRef}
                key={resolvedIframeSrc}
                src={resolvedIframeSrc}
                title="OwenWatermelonV3 Web View Frame"
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
          {loadError && !isHome && !isSearching && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#0a1020]/95 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200 shadow-2xl z-30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-white">Target Website Blocks Direct Embedding</span>
                  <span className="text-[11px] text-slate-300">
                    This domain restricts iframes (X-Frame-Options). Launch via stealth tab or high-speed web unblocker to bypass restriction!
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
                  onClick={() => openExternalUnblocker('proxyium')}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
                >
                  ⚡ Open with Proxyium
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
                proxyEngine === 'server' ? (customServerUrl ? 'Custom Backend Relay' : 'Node Streaming Proxy') :
                proxyEngine === 'search' ? 'Built-in Search & Knowledge (Live Web)' :
                proxyEngine === 'direct' ? 'Direct Embed' :
                proxyEngine === 'unblocker' ? 'Web Unblocker Gateway' : 'Wayback Machine Archive'
              }
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Tip: Click "about:blank Cloak" to open pages disguised as Google Docs with no school history</span>
          </div>
        </div>

      </div>
    </div>
  );
};
