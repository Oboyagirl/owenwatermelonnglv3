import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { openAboutBlankGame } from '../services/gamesStore';

export const WebProxy: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('https://en.wikipedia.org/wiki/Portal:Current_events');
  const [currentUrl, setCurrentUrl] = useState('https://en.wikipedia.org/wiki/Portal:Current_events');
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const quickBookmarks = [
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Random' },
    { name: 'DuckDuckGo Lite', url: 'https://lite.duckduckgo.com/lite/' },
    { name: 'HTML5 Games Hub', url: 'https://html5.gamedistribution.com/' },
    { name: 'Retro Games', url: 'https://archive.org/details/softwarelibrary_msdos_games' },
    { name: 'Scratch Web', url: 'https://scratch.mit.edu/explore/projects/all' },
    { name: 'CrazyGames Mirror', url: 'https://crazygames.com' }
  ];

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = inputUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Search DuckDuckGo if not a URL
        url = `https://duckduckgo.com/html/?q=${encodeURIComponent(url)}`;
      }
    }

    setInputUrl(url);
    setCurrentUrl(url);
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  };

  const handleSelectBookmark = (url: string) => {
    setInputUrl(url);
    setCurrentUrl(url);
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  };

  const proxySrc = `/api/proxy?url=${encodeURIComponent(currentUrl)}`;

  const handleLaunchStealth = () => {
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
          <iframe src="${window.location.origin}${proxySrc}" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>
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
              <span>SECURLY & FILTER BYPASS PROXY TUNNEL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Anti-Filter Web Proxy
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Browse any website, unblocked mirror, or online web tool directly through the server proxy. Filter extensions cannot inspect inside the encrypted stream.
            </p>
          </div>

          <button
            onClick={handleLaunchStealth}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-emerald-300 border border-[#10b981]/40 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md shrink-0"
            title="Open proxied session in a disguised about:blank window"
          >
            <ExternalLink className="w-4 h-4 text-[#10b981]" />
            <span>Launch in Stealth Window</span>
          </button>
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
                placeholder="Enter any URL (e.g. wikipedia.org, crazygames.com) or search term..."
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
            <span className="font-mono text-[11px] text-emerald-400 font-semibold">TUNNEL SECURE</span>
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
          <iframe
            key={reloadKey}
            src={proxySrc}
            title="Proxy Viewport"
            className="w-full h-full border-0 block"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals allow-downloads"
            allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write; microphone; camera"
            onLoad={() => setIsLoading(false)}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-[#07130c]/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
              <div className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-emerald-400">Loading through Proxy Tunnel...</span>
            </div>
          )}
        </div>

        {/* Viewport Status Footer */}
        <div className="px-4 py-2 bg-[#08160f] border-t border-[#16402a] flex items-center justify-between text-[11px] text-slate-400">
          <div className="truncate max-w-md">
            Routing: <span className="font-mono text-slate-300">{currentUrl}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Stripped X-Frame-Options & CSP</span>
            <span>Server Proxy Edge Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
