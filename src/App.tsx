/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, REQUEST_GAME_URL } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { GameCard } from './components/GameCard';
import { GamePlayer } from './components/GamePlayer';
import { TabCloaker } from './components/TabCloaker';
import { WebProxy } from './components/WebProxy';
import { PasscodeGate, PASSCODE_STORAGE_KEY } from './components/PasscodeGate';
import { StarfieldBackground } from './components/StarfieldBackground';
import { SiteEditorModal } from './components/SiteEditorModal';
import { useGamesStore } from './services/gamesStore';
import { useSiteSettingsStore, CREATOR_PASSWORD } from './services/siteSettingsStore';
import { Game } from './types/game';
import { triggerPanic } from './data/cloakPresets';
import { Heart, Sparkles, ExternalLink, KeyRound, X, Sliders } from 'lucide-react';

export default function App() {
  const {
    games,
    favorites,
    selectedGame,
    setSelectedGame,
    toggleFavorite,
    updateGame,
    addGame,
    deleteGame,
    resetGames,
    recordPlay
  } = useGamesStore();

  const {
    siteSettings,
    isCreatorMode,
    unlockCreatorMode,
    lockCreatorMode,
    updateSiteSettings,
    resetSiteSettings
  } = useSiteSettingsStore();

  const [currentTab, setCurrentTab] = useState<'games' | 'cloaker' | 'proxy'>('games');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(48);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  
  // Prompt password state for Creator Edit mode
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [promptPasswordInput, setPromptPasswordInput] = useState('');
  const [promptError, setPromptError] = useState(false);

  // Authentication gate state with persistence
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) === 'unlocked' ||
           sessionStorage.getItem(PASSCODE_STORAGE_KEY) === 'unlocked';
  });

  const handleLockSite = () => {
    localStorage.removeItem(PASSCODE_STORAGE_KEY);
    sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
    setIsUnlocked(false);
  };

  // Reset pagination when filter/search changes
  useEffect(() => {
    setVisibleCount(48);
  }, [searchTerm, selectedCategory]);

  // Global Panic Key Listener (Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedGame) {
        triggerPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGame]);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
    recordPlay(game.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    setSelectedGame(null);
  };

  const handleUnlockSite = (isCreator?: boolean) => {
    setIsUnlocked(true);
    if (isCreator) {
      unlockCreatorMode(CREATOR_PASSWORD);
      setIsEditorModalOpen(true);
    }
  };

  const handlePromptPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptPasswordInput.trim().toLowerCase() === CREATOR_PASSWORD.toLowerCase()) {
      unlockCreatorMode(CREATOR_PASSWORD);
      setShowPasswordPrompt(false);
      setPromptPasswordInput('');
      setPromptError(false);
      setIsEditorModalOpen(true);
    } else {
      setPromptError(true);
    }
  };

  // Categories include primary categories + popular secondaries like "Potato Classics"
  const categories = [
    'All',
    'Favorites',
    'Potato Classics',
    'Action',
    'Racing',
    'Sports',
    'Cooking Sim',
    'Multiplayer',
    'Arcade',
    'Horror',
    'Puzzle',
    'Retro',
    'Casual'
  ];

  const filteredGames = games.filter(g => {
    const matchesSearch = 
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Favorites') return favorites.includes(g.id);

    const catLower = selectedCategory.toLowerCase();
    
    // Special handling for Potato Classics category
    if (catLower === 'potato classics') {
      return (
        g.secondaryCategory?.toLowerCase() === 'potato classics' ||
        (g.tags && g.tags.some(t => t.toLowerCase().includes('potato') || t.toLowerCase().includes('tripplethepotatoes'))) ||
        g.id.startsWith('potatoes-')
      );
    }

    if (catLower === 'cooking sim') {
      return (
        g.secondaryCategory?.toLowerCase() === 'cooking sim' ||
        (g.tags && g.tags.some(t => t.toLowerCase().includes('cooking') || t.toLowerCase().includes('papa louie')))
      );
    }

    return (
      g.category.toLowerCase() === catLower ||
      g.secondaryCategory?.toLowerCase() === catLower ||
      (g.tags && g.tags.some(t => t.toLowerCase() === catLower))
    );
  });

  const featuredGame = games.find(g => g.featured) || games[0];
  const favoriteGamesList = games.filter(g => favorites.includes(g.id));

  // If site is locked with access code, display the security gate screen
  if (!isUnlocked) {
    return <PasscodeGate onUnlock={handleUnlockSite} />;
  }

  return (
    <div className="min-h-screen bg-[#07130c] text-slate-100 flex flex-col relative selection:bg-[#ff2d55]/30 selection:text-white">
      {/* Animated Starfield Background Layer across the entire site */}
      <StarfieldBackground
        speedMultiplier={siteSettings.starSpeed}
        densityMultiplier={siteSettings.starDensity}
        shootingStarsEnabled={siteSettings.shootingStarsEnabled}
      />

      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setSelectedGame(null);
        }}
        onLockSite={handleLockSite}
        siteSettings={siteSettings}
        isCreatorMode={isCreatorMode}
        onOpenEditor={() => setIsEditorModalOpen(true)}
        onPromptPasswordForEditor={() => setShowPasswordPrompt(true)}
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
                          isCreatorMode={isCreatorMode}
                          onEditGame={() => setIsEditorModalOpen(true)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Filtered Games Grid */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#10b981]" />
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
                            isCreatorMode={isCreatorMode}
                            onEditGame={() => setIsEditorModalOpen(true)}
                          />
                        ))}
                      </div>

                      {visibleCount < filteredGames.length && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 pb-2">
                          <button
                            onClick={() => setVisibleCount(prev => Math.min(prev + 48, filteredGames.length))}
                            className="px-6 py-3 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-900/40 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                          >
                            <span>Load More Games (+48)</span>
                            <span className="text-xs bg-[#064e3b]/20 px-2 py-0.5 rounded-full font-mono">
                              {filteredGames.length - visibleCount} left
                            </span>
                          </button>
                          <button
                            onClick={() => setVisibleCount(filteredGames.length)}
                            className="px-5 py-3 bg-[#0c2016] hover:bg-[#122e20] text-emerald-400 border border-[#16402a] font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                          >
                            Show All {filteredGames.length} Games
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-12 text-center bg-[#0c2016]/90 border border-[#16402a] rounded-2xl flex flex-col items-center justify-center gap-3">
                      <span className="text-4xl">🍉</span>
                      <h3 className="text-base font-bold text-white">No matching games found</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Try adjusting your search query or request a game to be added.
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                          className="px-4 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                        <a
                          href={REQUEST_GAME_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#16402a] hover:bg-[#255238] text-emerald-300 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
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

            {/* WEB PROXY & UNBLOCKER TAB */}
            {currentTab === 'proxy' && <WebProxy />}

            {/* TAB CLOAKER & CAMOUFLAGE TAB */}
            {currentTab === 'cloaker' && <TabCloaker />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#050d09]/90 border-t border-[#16402a] px-4 lg:px-8 py-8 mt-auto relative z-10 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{siteSettings.siteTitle || 'Owen Watermelon V3'}</span>
            <span>·</span>
            <span>Unblocked Games & Anti-Filter Proxy</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={REQUEST_GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#10b981] hover:text-[#34d399] transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>Request a Game</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>·</span>
            <span className="text-slate-500 font-mono">Press Esc to Panic</span>
          </div>
        </div>
      </footer>

      {/* Password Prompt Modal for Unlocking Creator Edit Mode */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#0c2016] border-2 border-[#10b981] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 border border-[#10b981] flex items-center justify-center text-2xl mx-auto">
              🔑
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unlock Creator Edit Mode</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter the secret creator password to edit games, animated stars, banner, and site branding.
              </p>
            </div>

            <form onSubmit={handlePromptPasswordSubmit} className="flex flex-col gap-3">
              <input
                type="password"
                value={promptPasswordInput}
                onChange={e => {
                  setPromptPasswordInput(e.target.value);
                  setPromptError(false);
                }}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 bg-[#07130c] border border-[#16402a] focus:border-[#10b981] rounded-xl text-sm text-white focus:outline-none text-center font-mono"
                autoFocus
              />

              {promptError && (
                <p className="text-xs text-rose-400 font-semibold">
                  Incorrect password. Hint: owenpanedit2244
                </p>
              )}

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  className="flex-1 py-2 bg-[#16402a] hover:bg-[#255238] text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  Unlock & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creator Studio & Site Editor Full Modal */}
      <SiteEditorModal
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        siteSettings={siteSettings}
        onUpdateSiteSettings={updateSiteSettings}
        onResetSiteSettings={resetSiteSettings}
        games={games}
        onUpdateGame={(updated) => updateGame(updated.id, updated)}
        onAddGame={addGame}
        onDeleteGame={deleteGame}
        onResetGames={resetGames}
        onExitCreatorMode={lockCreatorMode}
      />
    </div>
  );
}
