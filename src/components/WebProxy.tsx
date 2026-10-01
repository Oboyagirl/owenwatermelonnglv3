import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ArrowRight, 
  RotateCw, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  Bookmark, 
  Search,
  Sparkles,
  AlertCircle,
  Cpu,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';

type ProxyEngine = 'google' | 'srcdoc' | 'cloud' | 'direct';

export const WebProxy: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org/wiki/Portal:Current_events');
  const [currentUrl, setCurrentUrl] = useState('https://en.wikipedia.org/wiki/Portal:Current_events');
  const [activeEngine, setActiveEngine] = useState<ProxyEngine>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [srcDocContent, setSrcDocContent] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const quickBookmarks = [
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Random' },
    { name: 'DuckDuckGo Lite', url: 'https://lite.duckduckgo.com/lite/' },
    { name: 'Desmos Calculator', url: 'https://www.desmos.com/calculator' },
    { name: 'Scratch MIT', url: 'https://scratch.mit.edu/explore/projects/all' },
    { name: 'Mathway', url: 'https://www.mathway.com' },
    { name: 'Internet Archive', url: 'https://archive.org' }
  ];

  const normalizeUrl = (raw: string): string => {
    let url = raw.trim();
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = `https://duckduckgo.com/html/?q=${encodeURIComponent(url)}`;
      }
    }
    return url;
  };

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalUrl = normalizeUrl(inputUrl);
    if (!finalUrl) return;

    setInputUrl(finalUrl);
    setCurrentUrl(finalUrl);
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  };

  const handleSelectBookmark = (url: string) => {
    setInputUrl(url);
    setCurrentUrl(url);
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  };

  // Fetch HTML content if srcDoc engine is active
  useEffect(() => {
    if (activeEngine !== 'srcdoc') {
      setSrcDocContent('');
      setFetchError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setFetchError(null);

    const fetchViaCors = async () => {
      try {
        // Try allorigins first
        const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(currentUrl)}`);
        if (!res.ok) throw new Error('Primary CORS relay failed');
        const text = await res.text();
        if (isMounted) {
          // Inject base tag so relative links & styles resolve
          const baseTag = `<base href="${currentUrl}">`;
          const injected = text.includes('<head>') 
            ? text.replace('<head>', `<head>${baseTag}`)
            : `${baseTag}${text}`;
          setSrcDocContent(injected);
          setIsLoading(false);
        }
      } catch (err) {
        // Fallback to codetabs
        try {
          const res2 = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(currentUrl)}`);
          if (!res2.ok) throw new Error('Backup CORS relay failed');
          const text2 = await res2.text();
          if (isMounted) {
            const baseTag = `<base href="${currentUrl}">`;
            const injected2 = text2.includes('<head>') 
              ? text2.replace('<head>', `<head>${baseTag}`)
              : `${baseTag}${text2}`;
            setSrcDocContent(injected2);
            setIsLoading(false);
          }
        } catch (e) {
          if (isMounted) {
            setFetchError('Failed to fetch via srcDoc engine. Try switching to Google Web Gateway or Cloud Engine.');
            setIsLoading(false);
          }
        }
      }
    };

    fetchViaCors();

    return () => {
      isMounted = false;
    };
  }, [currentUrl, activeEngine, reloadKey]);

  // Compute iframe target URL according to active engine
  const getIframeSrc = (): string | undefined => {
    if (activeEngine === 'srcdoc') return undefined; // rendered via srcDoc

    if (activeEngine === 'google') {
      return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(currentUrl)}`;
    }

    if (activeEngine === 'cloud') {
      return `https://tomp.app/service/gateway?url=${encodeURIComponent(currentUrl)}`;
    }

    // Direct
    return currentUrl;
  };

  const handleLaunchStealth = () => {
    const targetUrl = activeEngine === 'google' 
      ? `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(currentUrl)}`
      : currentUrl;

    const stealthWin = window.open('about:blank', '_blank');
    if (!stealthWin) {
      alert('Popup was blocked by your browser. Please allow popups for stealth mode.');
      return;
    }

    const doc = stealthWin.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Classroom</title>
          <link rel="icon" href="https://ssl.gstatic.com/classroom/favicon.png">
          <style>
            html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#000; }
            iframe { width:100%; height:100%; border:none; display:block; }
          </style>
        </head>
        <body>
          <iframe src="${targetUrl}" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
      
      {/* Top Banner */}
      <div className="bg-[#0c2016] border border-[#16402a] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#10b981] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span>100% CLIENT-SIDE ANTI-FILTER WEB PROXY (NO 404 SERVER ERROR)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Anti-Filter Web Proxy
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Engineered for school iPads & Chromebooks. Routes websites through verified unblocked gateways without requiring a server backend.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLaunchStealth}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-emerald-300 border border-[#10b981]/40 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              title="Open proxied session in a disguised about:blank window"
            >
              <ExternalLink className="w-4 h-4 text-[#10b981]" />
              <span>Launch in Stealth Window</span>
            </button>
          </div>
        </div>
      </div>

      {/* Engine Selection Bar */}
      <div className="bg-[#091b12] border border-[#16402a] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5 pl-1">
            <Cpu className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Select Proxy Engine:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setActiveEngine('google');
                setIsLoading(true);
                setReloadKey(k => k + 1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeEngine === 'google'
                  ? 'bg-[#10b981] text-[#064e3b] shadow-md shadow-[#10b981]/20'
                  : 'bg-[#0c2016] text-slate-300 hover:text-white border border-[#16402a]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🛡️ Google Gateway (School WiFi Safe)</span>
            </button>

            <button
              onClick={() => {
                setActiveEngine('srcdoc');
                setIsLoading(true);
                setReloadKey(k => k + 1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeEngine === 'srcdoc'
                  ? 'bg-[#10b981] text-[#064e3b] shadow-md shadow-[#10b981]/20'
                  : 'bg-[#0c2016] text-slate-300 hover:text-white border border-[#16402a]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ HTML srcDoc (Zero 404)</span>
            </button>

            <button
              onClick={() => {
                setActiveEngine('cloud');
                setIsLoading(true);
                setReloadKey(k => k + 1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeEngine === 'cloud'
                  ? 'bg-[#10b981] text-[#064e3b] shadow-md shadow-[#10b981]/20'
                  : 'bg-[#0c2016] text-slate-300 hover:text-white border border-[#16402a]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>🚀 Ultraviolet Cloud</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono pr-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>iPad & Static Safe</span>
        </div>
      </div>

      {/* Address Bar Browser Chrome */}
      <div className="flex flex-col bg-[#0c2016] border border-[#16402a] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* URL Input Bar */}
        <div className="px-4 py-3 bg-[#091b12] border-b border-[#16402a] flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setIsLoading(true);
              setReloadKey(prev => prev + 1);
            }}
            className="p-2 text-slate-300 hover:text-white hover:bg-[#16402a] rounded-lg transition-colors cursor-pointer"
            title="Reload Page"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#10b981]' : ''}`} />
          </button>

          <form onSubmit={handleNavigate} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                placeholder="Enter any URL (e.g. wikipedia.org, desmos.com) or search query..."
                className="w-full pl-9 pr-4 py-2 bg-[#07130c] border border-[#16402a] focus:border-[#10b981] rounded-xl text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shrink-0"
            >
              <span>Go</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-mono text-[11px] text-emerald-400 font-semibold">
              {activeEngine.toUpperCase()} ENGINE
            </span>
          </div>
        </div>

        {/* Quick Bookmarks Bar */}
        <div className="px-4 py-2 bg-[#08160f] border-b border-[#16402a]/60 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-[#10b981]" />
            <span>Shortcuts:</span>
          </span>
          {quickBookmarks.map(bm => (
            <button
              key={bm.name}
              onClick={() => handleSelectBookmark(bm.url)}
              className="px-2.5 py-1 rounded-lg bg-[#0c2016] hover:bg-[#16402a] text-slate-300 hover:text-white border border-[#16402a] transition-colors cursor-pointer whitespace-nowrap text-[11px]"
            >
              {bm.name}
            </button>
          ))}
        </div>

        {/* Browser Viewport Frame */}
        <div className="relative w-full h-[72vh] bg-[#07130c]">
          {activeEngine === 'srcdoc' ? (
            srcDocContent ? (
              <iframe
                key={reloadKey}
                srcDoc={srcDocContent}
                title="Proxy Viewport (srcDoc)"
                className="w-full h-full border-0 block bg-white"
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                onLoad={() => setIsLoading(false)}
              />
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center text-slate-300">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <p className="text-sm font-semibold">{fetchError}</p>
                <button
                  onClick={() => setActiveEngine('google')}
                  className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Switch to Google Web Gateway
                </button>
              </div>
            ) : null
          ) : (
            <iframe
              key={reloadKey}
              src={getIframeSrc()}
              title="Proxy Viewport"
              className="w-full h-full border-0 block bg-white"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads"
              allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; microphone; camera"
              onLoad={() => setIsLoading(false)}
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-[#07130c]/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-emerald-400">Loading through {activeEngine.toUpperCase()} Gateway...</span>
            </div>
          )}
        </div>

        {/* Viewport Status Footer */}
        <div className="px-4 py-2 bg-[#08160f] border-t border-[#16402a] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="truncate max-w-md">
            Target: <span className="font-mono text-slate-300">{currentUrl}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Engine: {activeEngine === 'google' ? 'Google Translate Web Gateway' : activeEngine === 'srcdoc' ? 'CORS srcDoc In-Memory' : 'Ultraviolet Cloud'}</span>
            <span className="text-emerald-400">✓ No 404 Server Errors</span>
          </div>
        </div>

      </div>
    </div>
  );
};
