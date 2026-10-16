/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header, REQUEST_GAME_URL } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { TabCloaker } from './components/TabCloaker';
import { StarfieldBackground } from './components/StarfieldBackground';
import { ThemeModal } from './components/ThemeModal';
import { UserAccountModal } from './components/UserAccountModal';
import { Sidebar, TabItem } from './components/Sidebar';
import { PasscodeGate, PASSCODE_STORAGE_KEY } from './components/PasscodeGate';
import { WelcomeAnimation } from './components/WelcomeAnimation';
import { HomeDashboard } from './components/HomeDashboard';
import { ProxyView } from './components/ProxyView';
import { AppsView } from './components/AppsView';
import { MusicView } from './components/MusicView';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { FakeGamblingView } from './components/FakeGamblingView';
import { AIChatView } from './components/AIChatView';
import { CloudSaveModal } from './components/CloudSaveModal';
import { useGamesStore } from './services/gamesStore';
import { useSiteSettingsStore } from './services/siteSettingsStore';
import { useThemeStore } from './services/themeStore';
import { Game } from './types/game';
import { triggerPanic } from './data/cloakPresets';
import { Heart, Gamepad2, ExternalLink, RotateCcw, Search, Sparkles, Flame, Globe, Bot, X } from 'lucide-react';

export function isOwenWatermelonOG(game: Game): boolean {
  if (!game) return false;
  const id = (game.id || '').toLowerCase();
  const title = (game.title || '').toLowerCase();
  const tags = Array.isArray(game.tags) ? game.tags.map(t => String(t).toLowerCase()) : [];
  const sec = (game.secondaryCategory || '').toLowerCase();

  if (sec.includes('owen') && sec.includes('og')) return true;
  if (tags.some(t => t.includes('owen') && t.includes('og')) || tags.includes('og')) return true;

  if (id === 'soccer-2026' || id === 'soccer-real') return true;
  if (id.includes('stickman-climb') || title.includes('stickman climb')) return true;
  if (id.includes('people-playground') || id.includes('melon-playground') || title.includes('playground')) return true;
  if (id.includes('getting-over-it') || title.includes('getting over it')) return true;
  if (id === 'watermelon-merge' || title.includes('watermelon')) return true;
  if (id.includes('basket-random') || title.includes('basket random')) return true;
  if (id.startsWith('ovo') || title.startsWith('ovo')) return true;
  if (id.includes('duck-life') || title.includes('duck life') || title.includes('ducklife')) return true;
  if (id.includes('cut-the-rope') || title.includes('cut the rope')) return true;

  const ogList = [
    'retro-bowl', 'retro-bowl-college', '1v1-lol', 'slope', 'slope-2',
    'cookie-clicker', 'drift-hunters', 'subway-surfers', 'bitlife',
    'crossy-road', 'flappy-bird', 'flappy-melon', 'stickman-hook', 'stick-merge',
    'worlds-hardest-game', 'vex7', 'vex-4', 'smash-karts', 'drive-mad',
    'happywheels', 'happy-wheels', 'basket-bros', 'getaway-shootout',
    'rooftop-snipers', 'snow-rider-3d', 'tunnel-rush'
  ];
  return ogList.some(k => id === k || id.startsWith(k + '-') || id.endsWith('-' + k));
}

export function isTwoPlayerGame(g: Game): boolean {
  if (!g) return false;
  const titleLower = (g.title || '').toLowerCase();
  const descLower = (g.description || '').toLowerCase();
  const mainCatLower = (g.category || '').toLowerCase();
  const secCatLower = (g.secondaryCategory || '').toLowerCase();
  const controlsStr = JSON.stringify(g.controls || []).toLowerCase();

  const twoPlayerKeywords = [
    "2 player", "2-player", "two player", "multiplayer", "co-op", "pvp", "versus", "vs",
    "fireboy", "watergirl", "pong", "tank trouble", "rooftop snipers", "basket random", "soccer random",
    "boxing random", "volley random", "bad ice cream", "getaway shootout", "1v1", "wrestle jump",
    "stickman duel", "house of hazards", "a small world cup", "sawyer", "gun mayhem", "super smash", "basketball stars",
    "basket bros", "football legends", "smash remix", "tag", "connect 4", "chess", "checkers", "air hockey"
  ];

  return (
    mainCatLower.includes('2 player') ||
    mainCatLower.includes('multiplayer') ||
    secCatLower.includes('2 player') ||
    secCatLower.includes('multiplayer') ||
    twoPlayerKeywords.some(k => 
      titleLower.includes(k) || 
      descLower.includes(k) || 
      (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(k)))
    ) ||
    controlsStr.includes('player 2') ||
    controlsStr.includes('p2')
  );
}

export function isSawyerGame(g: Game): boolean {
  if (!g) return false;
  const mainCatLower = (g.category || '').toLowerCase();
  const secCatLower = (g.secondaryCategory || '').toLowerCase();
  const titleLower = (g.title || '').toLowerCase();
  return (
    mainCatLower.includes('sawyer') ||
    secCatLower.includes('sawyer') ||
    (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('sawyer'))) ||
    g.id.includes('sawyer') ||
    titleLower.includes('sawyer') ||
    titleLower.includes('a small world cup')
  );
}

export function isTrendingGame(g: Game): boolean {
  if (!g) return false;
  const plays = g.plays || 0;
  return (
    plays >= 50000 || 
    !!g.featured || 
    (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('trending')))
  );
}

const APP_CATEGORIES = [
  'All',
  'Trending',
  'Fake Gambling',
  '2 Player Games',
  'Sawyer For Sawyer',
  'Owen Watermelon OG’s',
  'Favorites',
  'Potato Classics',
  'Sports',
  'Action',
  'Racing',
  'Cooking Sim',
  'Multiplayer',
  'Arcade',
  'Puzzle',
  'Horror',
  'Retro',
  'Casual'
];

type SpaceType = 'home' | 'games' | 'proxy' | 'ai' | 'apps' | 'music' | 'gambling' | 'tools' | 'saved';

export default function App() {
  const {
    games,
    favorites,
    selectedGame,
    setSelectedGame,
    toggleFavorite,
    updateGame,
    recordPlay
  } = useGamesStore();

  const { siteSettings } = useSiteSettingsStore();
  const { 
    themeId, 
    activeTheme, 
    setTheme, 
    customTheme, 
    updateCustomTheme, 
    resetCustomTheme 
  } = useThemeStore();

  // Root background and theme variables setup
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--theme-bg-primary', activeTheme.bgPrimary);
      root.style.setProperty('--theme-bg-secondary', activeTheme.bgSecondary);
      root.style.setProperty('--theme-bg-card', activeTheme.bgCard);
      root.style.setProperty('--theme-bg-header', activeTheme.bgHeader);
      root.style.setProperty('--theme-border', activeTheme.border);
      root.style.setProperty('--theme-border-active', activeTheme.borderActive);
      root.style.setProperty('--theme-accent', activeTheme.accent);
      root.style.setProperty('--theme-accent-hover', activeTheme.accentHover);
      root.style.setProperty('--theme-accent-badge', activeTheme.accentBadge);
      root.style.setProperty('--theme-accent-glow', activeTheme.accentGlow);
      document.body.style.backgroundColor = activeTheme.bgPrimary;
      root.style.backgroundColor = activeTheme.bgPrimary;
    } catch {}
  }, [activeTheme]);

  // Browser Tabs Management
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 'tab_home', title: 'Home', spaceType: 'home', icon: '🏠' },
    { id: 'tab_games', title: 'Games', spaceType: 'games', icon: '🎮' },
    { id: 'tab_proxy', title: 'Web Proxy', spaceType: 'proxy', icon: '🌐' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab_home');
  const [splitTabId, setSplitTabId] = useState<string | null>(null);

  // Active space corresponds to active tab's spaceType
  const currentTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const activeSpace = currentTab?.spaceType || 'home';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(48);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCloakerOpen, setIsCloakerOpen] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [proxyTargetUrl, setProxyTargetUrl] = useState<string>('about:home');

  // Passcode Gate (owenpan2244)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PASSCODE_STORAGE_KEY) === 'unlocked' ||
             sessionStorage.getItem(PASSCODE_STORAGE_KEY) === 'unlocked';
    } catch {
      return false;
    }
  });

  const handleUnlockSite = () => {
    setIsUnlocked(true);
    setShowWelcomeAnimation(true);
  };

  const handleLockSite = () => {
    try {
      localStorage.removeItem(PASSCODE_STORAGE_KEY);
      sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
    } catch {}
    setIsUnlocked(false);
    setShowWelcomeAnimation(false);
  };

  // Sidebar collapse & mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('owen_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('owen_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Keyboard shortcut listener: Cmd/Ctrl + K focuses omnibar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('header input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Panic Key Listener (Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedGame && !isThemeModalOpen && !isAccountModalOpen) {
        triggerPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame, isThemeModalOpen, isAccountModalOpen]);

  // Tab Switching & Mutation
  const handleSelectSpace = (space: SpaceType) => {
    // If a tab already matches this space, activate it
    const existing = tabs.find(t => t.spaceType === space);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const spaceEmojiMap: Record<SpaceType, string> = {
        home: '🏠',
        games: '🎮',
        gambling: '🎰',
        proxy: '🌐',
        ai: '🤖',
        apps: '📱',
        music: '🎵',
        tools: '🛠️',
        saved: '💾'
      };
      const spaceNameMap: Record<SpaceType, string> = {
        home: 'Home',
        games: 'Games',
        gambling: 'Fake Gambling',
        proxy: 'Web Proxy',
        ai: 'AI Assistant',
        apps: 'Apps',
        music: 'Music',
        tools: 'Tab Cloaker',
        saved: 'Cloud Saves'
      };
      const newTabItem: TabItem = {
        id: 'tab_' + Date.now(),
        title: spaceNameMap[space] || space,
        spaceType: space,
        icon: spaceEmojiMap[space] || '📄'
      };
      setTabs(prev => [...prev, newTabItem]);
      setActiveTabId(newTabItem.id);
    }

    if (space !== 'games') {
      setSelectedGame(null);
    }
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tab.spaceType !== 'games') {
      setSelectedGame(null);
    }
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter(t => t.id !== tabId);
    setTabs(remaining);
    if (splitTabId === tabId) setSplitTabId(null);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
    }
  };

  const handleNewTab = () => {
    const newTabItem: TabItem = {
      id: 'tab_' + Date.now(),
      title: 'New Tab',
      spaceType: 'home',
      icon: '🍉'
    };
    setTabs(prev => [...prev, newTabItem]);
    setActiveTabId(newTabItem.id);
    setSelectedGame(null);
  };

  const handleToggleSplit = (targetId?: string) => {
    if (!splitTabId) {
      // Find an alternate tab to split with
      const other = tabs.find(t => t.id !== (targetId || activeTabId));
      if (other) {
        setSplitTabId(other.id);
      }
    } else {
      setSplitTabId(null);
    }
  };

  const handleOmnibarSubmit = (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    // Detect if user typed a URL or domain
    const isUrl = /^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/.*)?$/.test(clean);
    if (isUrl || clean.startsWith('http')) {
      const url = clean.startsWith('http') ? clean : 'https://' + clean;
      setProxyTargetUrl(url);
      handleSelectSpace('proxy');
      return;
    }

    // Check if query matches a game title
    const gameMatch = games.find(g => g.title.toLowerCase().includes(clean.toLowerCase()));
    if (gameMatch) {
      setSearchTerm(clean);
      handleSelectSpace('games');
      return;
    }

    // Default to search proxy
    setProxyTargetUrl(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(clean)}`);
    handleSelectSpace('proxy');
  };

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    recordPlay(game.id);
    handleSelectSpace('games');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered games
  const filteredGames = useMemo(() => {
    const list = games.filter(g => {
      if (!g) return false;
      const title = (g.title || '').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      const cleanSearch = (searchTerm || '').toLowerCase();

      const matchesSearch = 
        title.includes(cleanSearch) ||
        desc.includes(cleanSearch) ||
        (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(cleanSearch)));

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Favorites') return favorites.includes(g.id);

      const catLower = (selectedCategory || '').toLowerCase();
      const secCatLower = (g.secondaryCategory || '').toLowerCase();
      const mainCatLower = (g.category || '').toLowerCase();

      if (catLower === 'trending') return isTrendingGame(g);
      if (catLower.includes('2 player') || catLower === '2 player games') return isTwoPlayerGame(g);
      if (catLower.includes('sawyer')) return isSawyerGame(g);
      if (catLower.includes('owen') && catLower.includes('og')) return isOwenWatermelonOG(g);
      if (catLower === 'potato classics') {
        return (
          secCatLower === 'potato classics' ||
          (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && (t.toLowerCase().includes('potato') || t.toLowerCase().includes('tripplethepotatoes')))) ||
          (typeof g.id === 'string' && g.id.startsWith('potatoes-'))
        );
      }
      if (catLower === 'fake gambling' || catLower.includes('gambling')) {
        return (
          mainCatLower.includes('gambling') ||
          secCatLower.includes('gambling') ||
          (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('gambling'))) ||
          (typeof g.id === 'string' && (g.id.includes('plinko') || g.id.startsWith('fakestake-'))) ||
          (typeof g.title === 'string' && g.title.toLowerCase().includes('plinko'))
        );
      }
      if (catLower === 'cooking sim') {
        return (
          secCatLower === 'cooking sim' ||
          (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && (t.toLowerCase().includes('cooking') || t.toLowerCase().includes('papa louie'))))
        );
      }

      return (
        mainCatLower === catLower ||
        secCatLower === catLower ||
        (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase() === catLower))
      );
    });

    if (selectedCategory === 'Trending') {
      return [...list].sort((a, b) => (b.plays || 0) - (a.plays || 0));
    }
    return list;
  }, [games, searchTerm, selectedCategory, favorites]);

  const featuredGamesList = useMemo(() => games.filter(g => g.featured).slice(0, 8), [games]);
  const trendingGamesList = useMemo(() => games.filter(isTrendingGame).slice(0, 8), [games]);

  // If site is locked with passcode, display PasscodeGate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col relative bg-[#020810]">
        <StarfieldBackground
          speedMultiplier={siteSettings.starSpeed}
          densityMultiplier={siteSettings.starDensity}
          shootingStarsEnabled={siteSettings.shootingStarsEnabled}
          starColors={activeTheme.starColors}
        />
        <PasscodeGate onUnlock={handleUnlockSite} activeTheme={activeTheme} />
      </div>
    );
  }

  // Render a specific space view
  const renderSpaceContent = (space: SpaceType) => {
    if (space === 'home') {
      return (
        <HomeDashboard
          onNavigateTab={handleSelectSpace}
          onSelectGame={handleSelectGame}
          featuredGames={featuredGamesList}
          trendingGames={trendingGamesList}
          onSearchSubmit={(q) => {
            setSearchTerm(q);
            handleSelectSpace('games');
          }}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          activeTheme={activeTheme}
        />
      );
    }

    if (space === 'proxy') {
      return (
        <ProxyView
          activeTheme={activeTheme}
          initialUrl={currentTab.url || proxyTargetUrl}
          onOpenInTab={(title, url, icon) => {
            const newTab: TabItem = {
              id: 'tab_' + Date.now(),
              title,
              spaceType: 'proxy',
              icon: icon || '🌐',
              url
            };
            setTabs(prev => [...prev, newTab]);
            setActiveTabId(newTab.id);
          }}
        />
      );
    }

    if (space === 'ai') {
      return (
        <AIChatView
          activeTheme={activeTheme}
          onSelectGameTitle={(title) => {
            setSearchTerm(title);
            handleSelectSpace('games');
          }}
        />
      );
    }

    if (space === 'apps') {
      return <AppsView activeTheme={activeTheme} />;
    }

    if (space === 'music') {
      return <MusicView activeTheme={activeTheme} />;
    }

    if (space === 'gambling') {
      return (
        <FakeGamblingView
          activeTheme={activeTheme}
          onPlayGame={(game) => {
            setSelectedGame(game);
            handleSelectSpace('games');
          }}
        />
      );
    }

    if (space === 'tools') {
      return (
        <div 
          className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full"
          style={{ backgroundColor: activeTheme.bgPrimary }}
        >
          <div 
            className="p-6 md:p-8 rounded-3xl border shadow-2xl flex flex-col gap-6"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Tab Cloaker & School Cloak Tools</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Disguise this browser tab to look like Google Classroom, Canvas, or Google Drive.
              </p>
            </div>
            <TabCloaker />
          </div>
        </div>
      );
    }

    if (space === 'saved') {
      return (
        <div 
          className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full"
          style={{ backgroundColor: activeTheme.bgPrimary }}
        >
          <div 
            className="p-6 md:p-8 rounded-3xl border shadow-2xl flex flex-col gap-6"
            style={{ backgroundColor: activeTheme.bgCard, borderColor: activeTheme.border }}
          >
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>Universal Cross-Device Cloud Saves</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your game saves automatically sync across school Chromebooks, iPads, and home PCs.
              </p>
            </div>
            <div 
              className="p-4 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: activeTheme.accentBadge,
                borderColor: activeTheme.borderActive
              }}
            >
              <div>
                <span className="text-sm font-bold text-white">Save Engine Status: Online</span>
                <p className="text-xs text-slate-400">Captures LocalStorage, SessionStorage, EmulatorJS RAM states, and IndexedDB snapshots.</p>
              </div>
              <button
                onClick={() => handleSelectSpace('games')}
                className="px-4 py-2 rounded-xl text-black font-extrabold text-xs cursor-pointer shadow-md"
                style={{ backgroundColor: activeTheme.accent }}
              >
                Go to Games
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default to Games catalog
    return (
      <div 
        className="flex-1 flex flex-col min-h-screen text-slate-100 p-4 md:p-6 lg:p-8"
        style={{ backgroundColor: activeTheme.bgPrimary }}
      >
        {selectedGame ? (
          <GamePlayer
            game={selectedGame}
            onBack={() => setSelectedGame(null)}
            onToggleFavorite={toggleFavorite}
            isFavorite={favorites.includes(selectedGame.id)}
            onUpdateGame={updateGame}
            allGames={games}
            onSelectGame={handleSelectGame}
            activeTheme={activeTheme}
            onOpenMusicSpace={() => handleSelectSpace('music')}
          />
        ) : (
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
            {/* Header Title & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                  <Gamepad2 className="w-7 h-7" style={{ color: activeTheme.accent }} />
                  <span>Unblocked Games Catalog</span>
                  <span 
                    className="text-xs font-mono px-2.5 py-1 rounded-full border ml-2"
                    style={{
                      backgroundColor: activeTheme.accentBadge,
                      borderColor: activeTheme.borderActive,
                      color: activeTheme.accent
                    }}
                  >
                    {filteredGames.length} Available
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Click any game card to launch with 1-Click Quick Save, full screen, and mirror fallbacks.
                </p>
              </div>

              {/* Game Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter games by title or tag..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs text-white placeholder-slate-500 focus:outline-none shadow-md"
                  style={{
                    backgroundColor: activeTheme.bgCard,
                    borderColor: activeTheme.border
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {APP_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'text-black shadow-lg font-extrabold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === cat ? activeTheme.accent : activeTheme.bgCard,
                    borderColor: selectedCategory === cat ? activeTheme.accent : activeTheme.border
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
              {filteredGames.slice(0, visibleCount).map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={handleSelectGame}
                  onToggleFavorite={toggleFavorite}
                  isFavorite={favorites.includes(game.id)}
                  activeTheme={activeTheme}
                />
              ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredGames.length && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => setVisibleCount(c => c + 48)}
                  className="px-6 py-2.5 rounded-2xl border text-xs font-bold text-white transition-all cursor-pointer shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: activeTheme.bgCard,
                    borderColor: activeTheme.border
                  }}
                >
                  Load More Games ({filteredGames.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const splitTab = tabs.find(t => t.id === splitTabId);

  return (
    <div 
      className="h-screen w-screen text-slate-100 flex overflow-hidden font-sans select-none"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      {/* Background Starfield */}
      <StarfieldBackground
        speedMultiplier={siteSettings.starSpeed}
        densityMultiplier={siteSettings.starDensity}
        shootingStarsEnabled={siteSettings.shootingStarsEnabled}
        starColors={activeTheme.starColors}
      />

      {/* Welcome Animation on First Unlock */}
      {showWelcomeAnimation && (
        <WelcomeAnimation
          activeTheme={activeTheme}
          onComplete={() => setShowWelcomeAnimation(false)}
        />
      )}

      {/* OwenWatermelon Left Sidebar */}
      <Sidebar
        activeSpace={activeSpace}
        onSelectSpace={handleSelectSpace}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        splitTabId={splitTabId}
        onToggleSplitTab={handleToggleSplit}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onLockSite={handleLockSite}
        activeTheme={activeTheme}
        totalGames={games.length}
      />

      {/* Main Browser Viewport */}
      <div 
        className="flex-1 flex flex-col h-screen overflow-hidden backdrop-blur-md"
        style={{ backgroundColor: activeTheme.bgPrimary }}
      >
        {/* Top Omnibar Header */}
        <Header
          onBack={() => {
            if (selectedGame) setSelectedGame(null);
            else handleSelectSpace('home');
          }}
          onForward={() => {}}
          onReload={() => window.location.reload()}
          onHome={() => {
            setSelectedGame(null);
            handleSelectSpace('home');
          }}
          onOpenMusic={() => handleSelectSpace('music')}
          omnibarValue={searchTerm}
          onOmnibarSubmit={handleOmnibarSubmit}
          onToggleSplit={() => handleToggleSplit()}
          isSplitActive={Boolean(splitTabId)}
          onOpenCloakerModal={() => setIsCloakerOpen(true)}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          activeTheme={activeTheme}
          siteSettings={siteSettings}
        />

        {/* Content Area with Split Screen Support */}
        <main className="flex-1 overflow-y-auto relative flex">
          {/* Primary Active Tab View */}
          <div className={`flex-1 flex flex-col ${splitTabId ? 'w-1/2 border-r' : 'w-full'}`} style={{ borderColor: activeTheme.border }}>
            {renderSpaceContent(activeSpace)}
          </div>

          {/* Secondary Split Screen Tab View */}
          {splitTabId && splitTab && (
            <div 
              className="w-1/2 flex flex-col relative border-l"
              style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}
            >
              <div 
                className="h-8 px-3 flex items-center justify-between border-b text-xs text-slate-300"
                style={{ backgroundColor: activeTheme.bgHeader, borderColor: activeTheme.border }}
              >
                <span className="font-bold flex items-center gap-1.5">
                  <span>{splitTab.icon || '📄'}</span>
                  <span>{splitTab.title}</span>
                </span>
                <button
                  onClick={() => setSplitTabId(null)}
                  className="p-1 hover:text-white text-slate-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderSpaceContent(splitTab.spaceType)}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Account & Profile Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        allGames={games}
        onSelectGame={handleSelectGame}
        theme={activeTheme}
      />

      {/* Theme Studio Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeThemeId={themeId}
        onSelectTheme={setTheme}
        customTheme={customTheme}
        onUpdateCustomTheme={updateCustomTheme}
        onResetCustomTheme={resetCustomTheme}
      />

      {/* Tab Cloaker Dialog Modal */}
      {isCloakerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#080f1d] border border-white/10 p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setIsCloakerOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">School Tab Cloaker</h2>
            <p className="text-xs text-slate-400 mb-6">Change tab title and favicon to look like school software.</p>
            <TabCloaker />
          </div>
        </div>
      )}

      {/* Persistent Background Floating Music Player (Available across all games and tabs) */}
      <FloatingMusicPlayer
        activeTheme={activeTheme}
        activeSpace={activeSpace}
        isGameActive={Boolean(selectedGame)}
        onOpenMusicSpace={() => handleSelectSpace('music')}
      />
    </div>
  );
}
