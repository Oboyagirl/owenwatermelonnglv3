import React, { useState } from 'react';
import { EyeOff, ShieldAlert, Check, Copy, Bookmark, ExternalLink } from 'lucide-react';
import { CLOAK_PRESETS, applyCloak } from '../data/cloakPresets';
import { CloakPreset } from '../types/game';
import { ThemeConfig, THEMES } from '../services/themeStore';

interface TabCloakerProps {
  activeTheme?: ThemeConfig;
}

export const TabCloaker: React.FC<TabCloakerProps> = ({
  activeTheme = THEMES.original
}) => {
  const [activeId, setActiveId] = useState<string>(() => {
    try {
      return localStorage.getItem('owen_active_cloak') || 'default';
    } catch {
      return 'default';
    }
  });
  const [customTitle, setCustomTitle] = useState('');
  const [customFavicon, setCustomFavicon] = useState('');
  const [panicUrl, setPanicUrl] = useState(() => {
    try {
      return localStorage.getItem('owen_panic_url') || 'https://classroom.google.com';
    } catch {
      return 'https://classroom.google.com';
    }
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSelectPreset = (preset: CloakPreset) => {
    applyCloak(preset);
    setActiveId(preset.id);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    const customPreset: CloakPreset = {
      id: 'custom',
      name: 'Custom Cloak',
      title: customTitle,
      icon: '🎭',
      faviconUrl: customFavicon.trim() || 'https://www.google.com/favicon.ico'
    };
    applyCloak(customPreset);
    setActiveId('custom');
  };

  const handleSavePanicUrl = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('owen_panic_url', panicUrl);
    alert('Panic redirect URL updated to: ' + panicUrl);
  };

  const bookmarklets = [
    {
      name: 'Stealth Tab Cloaker',
      desc: 'Instantly changes current tab title to Google Classroom and sets the icon.',
      code: "javascript:(function(){document.title='Home';var link=document.querySelector(\"link[rel*='icon']\")||document.createElement('link');link.type='image/x-icon';link.rel='shortcut icon';link.href='https://ssl.gstatic.com/classroom/favicon.png';document.head.appendChild(link);})();"
    },
    {
      name: 'about:blank Game Shield',
      desc: 'Launches the current web page embedded in an about:blank stealth window.',
      code: "javascript:(function(){var url=window.location.href;var win=window.open('about:blank','_blank');win.document.write('<style>body{margin:0;overflow:hidden;background:#000;}</style><iframe src=\"'+url+'\" style=\"width:100%;height:100vh;border:none;\"></iframe>');win.document.close();})();"
    },
    {
      name: 'Instant Panic Button',
      desc: 'Immediately replaces the current browser tab with Google Classroom.',
      code: "javascript:(function(){window.location.replace('https://classroom.google.com');})();"
    },
    {
      name: 'Quick Dark Mode Inverter',
      desc: 'Inverts high-contrast dark theme on any webpage without extensions.',
      code: "javascript:(function(){var el=document.documentElement;el.style.filter=el.style.filter==='invert(1) hue-rotate(180deg)'?'':'invert(1) hue-rotate(180deg)';})();"
    }
  ];

  const copyBookmarklet = (name: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <EyeOff className="w-6 h-6" style={{ color: activeTheme.accent }} />
          <span>Tab Cloaker & Stealth Camouflage</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Disguise the Owen Watermelon tab with authentic titles and icons like Google Classroom, Google Drive, or Canvas.
        </p>
      </div>

      {/* Simulated Tab Bar Preview */}
      <div 
        className="rounded-2xl p-5 border flex flex-col gap-3 transition-colors"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border
        }}
      >
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Live Browser Tab Simulation
        </span>
        <div 
          className="rounded-xl p-3 flex items-center gap-3 border"
          style={{
            backgroundColor: activeTheme.bgPrimary,
            borderColor: activeTheme.border
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border max-w-xs shadow-inner"
            style={{
              backgroundColor: activeTheme.bgCard,
              borderColor: activeTheme.border
            }}
          >
            <span className="text-base">
              {CLOAK_PRESETS.find(p => p.id === activeId)?.icon || '🍉'}
            </span>
            <span className="text-xs font-medium text-white truncate">
              {document.title}
            </span>
          </div>
          <span 
            className="text-[11px] ml-auto font-bold hidden sm:inline"
            style={{ color: activeTheme.accent }}
          >
            Active Disguise Applied ✓
          </span>
        </div>
      </div>

      {/* Preset Cloaks Grid */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          One-Click Cloak Presets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CLOAK_PRESETS.map(preset => {
            const isActive = activeId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? activeTheme.accentBadge : activeTheme.bgCard,
                  borderColor: isActive ? activeTheme.borderActive : activeTheme.border,
                  boxShadow: isActive ? `0 0 12px ${activeTheme.accentGlow}` : undefined,
                  transform: isActive ? 'scale(1.02)' : undefined
                }}
              >
                <span className="text-2xl">{preset.icon}</span>
                <div className="flex flex-col overflow-hidden flex-1">
                  <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                  <span className="text-[11px] text-slate-400 truncate">Title: "{preset.title}"</span>
                </div>
                {isActive && <Check className="w-4 h-4 shrink-0" style={{ color: activeTheme.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Title & Favicon */}
      <div 
        className="rounded-2xl p-6 border flex flex-col gap-4 transition-colors"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border
        }}
      >
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Custom Disguise Configuration
        </h3>
        <form onSubmit={handleApplyCustom} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Tab Title</label>
            <input
              type="text"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              placeholder="e.g. Science Homework - Period 4"
              className="w-full px-3 py-2 border rounded-xl text-sm text-white focus:outline-none"
              style={{
                backgroundColor: activeTheme.bgPrimary,
                borderColor: activeTheme.border
              }}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Favicon URL (Optional)</label>
            <input
              type="text"
              value={customFavicon}
              onChange={e => setCustomFavicon(e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="w-full px-3 py-2 border rounded-xl text-sm text-white focus:outline-none"
              style={{
                backgroundColor: activeTheme.bgPrimary,
                borderColor: activeTheme.border
              }}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              style={{
                backgroundColor: activeTheme.accent,
                color: activeTheme.accentText
              }}
            >
              Apply Custom Disguise
            </button>
          </div>
        </form>
      </div>

      {/* Emergency Panic Key Configuration */}
      <div 
        className="rounded-2xl p-6 border flex flex-col gap-4 transition-colors"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.border
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#ff2d55]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Emergency Panic Button & Esc Key
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Pressing the <kbd className="px-2 py-0.5 rounded font-mono border" style={{ backgroundColor: activeTheme.bgPrimary, borderColor: activeTheme.border, color: activeTheme.accent }}>Esc</kbd> key or clicking the top Panic Button immediately redirects your active tab to this safety URL with zero trace.
        </p>
        <form onSubmit={handleSavePanicUrl} className="flex gap-2">
          <input
            type="text"
            value={panicUrl}
            onChange={e => setPanicUrl(e.target.value)}
            placeholder="https://classroom.google.com"
            className="flex-1 px-3.5 py-2.5 border rounded-xl text-sm text-white focus:outline-none"
            style={{
              backgroundColor: activeTheme.bgPrimary,
              borderColor: activeTheme.border
            }}
          />
          <button
            type="submit"
            className="px-5 py-2.5 font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
            style={{
              backgroundColor: activeTheme.accent,
              color: activeTheme.accentText
            }}
          >
            Save Panic URL
          </button>
        </form>
      </div>

      {/* Stealth Bookmarklets */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4" style={{ color: activeTheme.accent }} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Unblocker Bookmarklets
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Drag these buttons to your browser bookmarks bar or copy the javascript snippet to bypass classroom filters on any site.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {bookmarklets.map((b) => (
            <div 
              key={b.name}
              className="p-4 rounded-xl border flex flex-col justify-between gap-3"
              style={{
                backgroundColor: activeTheme.bgCard,
                borderColor: activeTheme.border
              }}
            >
              <div>
                <span className="text-xs font-bold text-white block">{b.name}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed">{b.desc}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: activeTheme.border }}>
                <a
                  href={b.code}
                  onClick={(e) => e.preventDefault()}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none"
                  style={{
                    backgroundColor: activeTheme.accentBadge,
                    borderColor: activeTheme.border,
                    color: activeTheme.kicker
                  }}
                  title="Drag this link directly to your browser Bookmarks Bar"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Drag to Bar</span>
                </a>
                <button
                  type="button"
                  onClick={() => copyBookmarklet(b.name, b.code)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ml-auto border"
                  style={{
                    backgroundColor: activeTheme.bgPrimary,
                    borderColor: activeTheme.border,
                    color: '#94a3b8'
                  }}
                >
                  {copiedKey === b.name ? (
                    <>
                      <Check className="w-3.5 h-3.5" style={{ color: activeTheme.accent }} />
                      <span style={{ color: activeTheme.accent }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
