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
import { useGamesStore } from './services/gamesStore';
import { useSiteSettingsStore } from './services/siteSettingsStore';
import { useThemeStore } from './services/themeStore';
import { Game } from './types/game';
import { triggerPanic } from './data/cloakPresets';
import { Heart, Sparkles, ExternalLink, Palette } from 'lucide-react';

export function isOwenWatermelonOG(game: Game): boolean {
  if (!game) return false;
  const id = (game.id || '').toLowerCase();
  const title = (game.title || '').toLowerCase();
  const tags = Array.isArray(game.tags) ? game.tags.map(t => String(t).toLowerCase()) : [];
  const sec = (game.secondaryCategory || '').toLowerCase();

  if (sec.includes('owen') && sec.includes('og')) return true;
  if (tags.some(t => t.includes('owen') && t.includes('og')) || tags.includes('og')) return true;

  // Explicitly requested games:
  // 1. "the games we just added":
  if (id === 'soccer-2026' || id === 'soccer-real') return true;
  if (id.includes('stickman-climb') || title.includes('stickman climb')) return true;
  if (id.includes('people-playground') || id.includes('melon-playground') || title.includes('playground')) return true;
  if (id.includes('getting-over-it') || title.includes('getting over it')) return true;

  // 2. Foundation watermelon title:
  if (id === 'watermelon-merge' || title.includes('watermelon')) return true;

  // 3. "Basket Random":
  if (id.includes('basket-random') || title.includes('basket random')) return true;

  // 4. "Ovo, Ovo 2":
  if (id.startsWith('ovo') || title.startsWith('ovo')) return true;

  // 5. "all the Duck Life’s":
  if (id.includes('duck-life') || title.includes('duck life') || title.includes('ducklife')) return true;

  // 6. "cut the rope":
  if (id.includes('cut-the-rope') || title.includes('cut the rope')) return true;

  // 7. "and yeah" (core hall-of-fame student OGs):
  const ogList = [
    'retro-bowl', 'retro-bowl-college', '1v1-lol', 'slope', 'slope-2',
    'cookie-clicker', 'drift-hunters', 'subway-surfers', 'bitlife',
    'crossy-road', 'flappy-bird', 'flappy-melon', 'stickman-hook', 'stick-merge',
    'worlds-hardest-game', 'vex7', 'vex-4', 'smash-karts', 'drive-mad',
    'happywheels', 'happy-wheels', 'basket-bros', 'getaway-shootout',
    'rooftop-snipers', 'snow-rider-3d', 'tunnel-rush'
  ];
  if (ogList.some(k => id === k || id.startsWith(k + '-') || id.endsWith('-' + k))) {
    return true;
  }

  return false;
}

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
  const { themeId, activeTheme, setTheme } = useThemeStore();

  // Sync document root background and CSS custom properties when theme changes
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--theme-bg-primary', activeTheme.bgPrimary);
      root.style.setProperty('--theme-bg-secondary', activeTheme.bgSecondary);
      root.style.setProperty('--theme-bg-card', activeTheme.bgCard);
      root.style.setProperty('--theme-border', activeTheme.border);
      root.style.setProperty('--theme-border-active', activeTheme.borderActive);
      root.style.setProperty('--theme-accent', activeTheme.accent);
      root.style.setProperty('--theme-accent-hover', activeTheme.accentHover);
      root.style.setProperty('--theme-accent-text', activeTheme.accentText);
      root.style.setProperty('--theme-kicker', activeTheme.kicker);
      document.body.style.backgroundColor = activeTheme.bgPrimary;
      root.style.backgroundColor = activeTheme.bgPrimary;
    } catch {}
  }, [activeTheme]);

  const [currentTab, setCurrentTab] = useState<'games' | 'cloaker'>('games');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(48);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setVisibleCount(48);
  }, [searchTerm, selectedCategory]);

  // Global Panic Key Listener (Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedGame && !isThemeModalOpen) {
        triggerPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame, isThemeModalOpen]);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    recordPlay(game.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    setSelectedGame(null);
  };

  // Categories include primary categories + popular secondaries
  const categories = [
    'All',
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

  const filteredGames = games.filter(g => {
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
    
    // Special handling for Owen Watermelon OG's category
    if (catLower.includes('owen') && catLower.includes('og')) {
      return isOwenWatermelonOG(g);
    }

    // Special handling for Potato Classics category
    if (catLower === 'potato classics') {
      return (
        secCatLower === 'potato classics' ||
        (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && (t.toLowerCase().includes('potato') || t.toLowerCase().includes('tripplethepotatoes')))) ||
        (typeof g.id === 'string' && g.id.startsWith('potatoes-'))
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: games.length,
      Favorites: favorites.length,
      'Owen Watermelon OG’s': games.filter(isOwenWatermelonOG).length,
    };
    for (const cat of categories) {
      if (counts[cat] !== undefined) continue;
      const catLower = cat.toLowerCase();
      if (catLower === 'potato classics') {
        counts[cat] = games.filter(g => 
          (g.secondaryCategory || '').toLowerCase() === 'potato classics' ||
          (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && (t.toLowerCase().includes('potato') || t.toLowerCase().includes('tripplethepotatoes')))) ||
          (typeof g.id === 'string' && g.id.startsWith('potatoes-'))
        ).length;
      } else if (catLower === 'cooking sim') {
        counts[cat] = games.filter(g =>
          (g.secondaryCategory || '').toLowerCase() === 'cooking sim' ||
          (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && (t.toLowerCase().includes('cooking') || t.toLowerCase().includes('papa louie'))))
        ).length;
      } else {
        counts[cat] = games.filter(g =>
          (g.category || '').toLowerCase() === catLower ||
          (g.secondaryCategory || '').toLowerCase() === catLower ||
          (Array.isArray(g.tags) && g.tags.some(t => typeof t === 'string' && t.toLowerCase() === catLower))
        ).length;
      }
    }
    return counts;
  }, [games, favorites, categories]);

  const featuredGame = games.find(g => g.featured) || games[0];
  const favoriteGamesList = games.filter(g => favorites.includes(g.id));

  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col relative transition-colors duration-300"
      style={{ backgroundColor: activeTheme.bgPrimary }}
    >
      {/* Animated Starfield Background Layer across the entire site */}
      <StarfieldBackground
        speedMultiplier={siteSettings.starSpeed}
        densityMultiplier={siteSettings.starDensity}
        shootingStarsEnabled={siteSettings.shootingStarsEnabled}
        starColors={activeTheme.starColors}
      />

      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setSelectedGame(null);
        }}
        siteSettings={siteSettings}
        activeTheme={activeTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16 relative z-10">
        {/* GAME PLAYER VIEW */}
        {selectedGame ? (
          <GamePlayer
            game={selectedGame}
            isFavorite={favorites.includes(selectedGame.id)}
            onToggleFavorite={toggleFavorite}
            onBack={handleBackToHub}
            onSelectGame={handleSelectGame}
            allGames={games}
            onUpdateGame={(id, updates) => updateGame(id, updates)}
            activeTheme={activeTheme}
          />
        ) : (
          <>
            {/* ARCADE GAMES HUB */}
            {currentTab === 'games' && (
              <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-10">
                {/* Hero Spotlight & Filters */}
                <HeroBanner
                  featuredGame={featuredGame}
                  onPlay={handleSelectGame}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activeCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categories={categories}
                  totalGames={games.length}
                  categoryCounts={categoryCounts}
                  activeTheme={activeTheme}
                  activeThemeId={themeId}
                  onSelectTheme={setTheme}
                  onOpenThemeGallery={() => setIsThemeModalOpen(true)}
                />

                {/* Quick Favorites Section if any */}
                {selectedCategory === 'All' && !searchTerm && favoriteGamesList.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#ff2d55] fill-current" />
                        <h2 className="text-lg font-bold text-white tracking-tight">
                          Your Starred Favorites
                        </h2>
                      </div>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {favoriteGamesList.length} {favoriteGamesList.length === 1 ? 'game' : 'games'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {favoriteGamesList.slice(0, 4).map(game => (
                        <GameCard
                          key={game.id}
                          game={game}
                          isFavorite={true}
                          onToggleFavorite={toggleFavorite}
                          onPlay={handleSelectGame}
                          activeTheme={activeTheme}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Filtered Games Grid */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: activeTheme.accent }} />
                      <span>{selectedCategory === 'All' ? 'Complete Games Catalog' : `${selectedCategory} Games`}</span>
                    </h2>
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      Showing {Math.min(visibleCount, filteredGames.length)} of {filteredGames.length} {filteredGames.length === games.length ? 'games' : `(from ${games.length} total)`}
                    </span>
                  </div>

                  {filteredGames.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filteredGames.slice(0, visibleCount).map(game => (
                          <GameCard
                            key={game.id}
                            game={game}
                            isFavorite={favorites.includes(game.id)}
                            onToggleFavorite={toggleFavorite}
                            onPlay={handleSelectGame}
                            activeTheme={activeTheme}
                          />
                        ))}
                      </div>

                      {visibleCount < filteredGames.length && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 pb-2">
                          <button
                            onClick={() => setVisibleCount(prev => Math.min(prev + 48, filteredGames.length))}
                            className="px-6 py-3 font-bold text-sm rounded-xl transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                            style={{
                              backgroundColor: activeTheme.accent,
                              color: activeTheme.accentText,
                              boxShadow: `0 10px 25px ${activeTheme.accentGlow}`
                            }}
                          >
                            <span>Load More Games (+48)</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-black/20">
                              {filteredGames.length - visibleCount} left
                            </span>
                          </button>
                          <button
                            onClick={() => setVisibleCount(filteredGames.length)}
                            className="px-5 py-3 border font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                            style={{
                              backgroundColor: activeTheme.bgCard,
                              borderColor: activeTheme.border,
                              color: activeTheme.kicker
                            }}
                          >
                            Show All {filteredGames.length} Games
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div 
                      className="p-12 text-center border rounded-2xl flex flex-col items-center justify-center gap-3"
                      style={{
                        backgroundColor: activeTheme.bgCard,
                        borderColor: activeTheme.border
                      }}
                    >
                      <span className="text-4xl">{activeTheme.emoji}</span>
                      <h3 className="text-base font-bold text-white">No matching games found</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Try adjusting your search query or request a game to be added.
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                          className="px-4 py-2 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                          style={{
                            backgroundColor: activeTheme.accent,
                            color: activeTheme.accentText
                          }}
                        >
                          Clear Filters
                        </button>
                        <a
                          href={REQUEST_GAME_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                          style={{
                            backgroundColor: activeTheme.bgSecondary,
                            borderColor: activeTheme.border,
                            color: activeTheme.kicker
                          }}
                        >
                          <span>Request This Game</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CLOAKER & CAMOUFLAGE TAB */}
            {currentTab === 'cloaker' && <TabCloaker activeTheme={activeTheme} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="w-full border-t px-4 lg:px-8 py-8 mt-auto relative z-10 backdrop-blur-xs transition-colors"
        style={{
          backgroundColor: activeTheme.bgHeader,
          borderColor: activeTheme.border
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{siteSettings.siteTitle || 'Owen Watermelon V3'}</span>
            <span>·</span>
            <span>Unblocked Games Catalog & Tab Cloaker</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              style={{ color: activeTheme.accent }}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme: {activeTheme.name}</span>
            </button>

            <a
              href={REQUEST_GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
              style={{ color: activeTheme.accent }}
            >
              <span>Request Game</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Theme Gallery Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeThemeId={themeId}
        onSelectTheme={setTheme}
      />
    </div>
  );
}
