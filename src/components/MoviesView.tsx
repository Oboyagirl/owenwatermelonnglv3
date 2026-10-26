import React, { useState, useMemo, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Star, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Tv, 
  Sparkles, 
  Maximize2, 
  X, 
  Server, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Info,
  Shield,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { 
  MOVIES_CATALOG, 
  MovieItem, 
  MovieServer, 
  MOVIE_SERVERS, 
  MOVIE_CATEGORIES, 
  getMovieSourceUrl,
  getDirectMovyUrl
} from '../data/moviesData';
import { ThemeConfig } from '../services/themeStore';

const WATCHLIST_STORAGE_KEY = 'owen_watermelon_watchlist_ids';

interface MoviesViewProps {
  activeTheme?: ThemeConfig;
}

export const MoviesView: React.FC<MoviesViewProps> = ({ activeTheme }) => {
  const accent = activeTheme?.accent || '#38bdf8';
  const borderCol = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  // Watchlist state (saved in localStorage)
  const [watchlistIds, setWatchlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [533535, 569094, 693134];
    } catch {
      return [533535, 569094];
    }
  });

  const toggleWatchlist = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlistIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'year'>('popular');

  // Hero Carousel Index (Featured Movies)
  const featuredMovies = useMemo(() => {
    return MOVIES_CATALOG.filter(m => m.featured || m.is4k).slice(0, 5);
  }, []);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const currentHero = featuredMovies[heroIndex] || MOVIES_CATALOG[0];

  // Auto-advance hero carousel every 8s if idle
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  // Active Cinema Modal Player state
  const [activeMovie, setActiveMovie] = useState<MovieItem | null>(null);
  const [selectedServer, setSelectedServer] = useState<MovieServer>('vidlink');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);

  // Client-side ad-shield to block inappropriate popup ads from external streams
  useEffect(() => {
    if (!activeMovie) return;
    const originalOpen = window.open;
    window.open = function(url, target, features) {
      if (typeof url === 'string') {
        const u = url.toLowerCase();
        if (
          u.includes('bet') || 
          u.includes('casino') || 
          u.includes('dating') || 
          u.includes('adult') || 
          u.includes('adsterra') ||
          u.includes('popads') ||
          u.includes('traffic') ||
          u.includes('trk')
        ) {
          console.warn('[AdShield] Blocked inappropriate ad popup:', url);
          return null;
        }
      }
      return originalOpen.apply(window, [url, target, features] as any);
    };

    return () => {
      window.open = originalOpen;
    };
  }, [activeMovie]);

  const openMoviePlayer = (movie: MovieItem) => {
    setActiveMovie(movie);
    setSelectedServer('vidlink');
    setSelectedSeason(1);
    setSelectedEpisode(1);
  };

  const closeMoviePlayer = () => {
    setActiveMovie(null);
  };

  // Filtered & Sorted Catalog
  const filteredCatalog = useMemo(() => {
    return MOVIES_CATALOG.filter(item => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesGenre = item.genres.some(g => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesGenre) return false;
      }

      // Media filter
      if (mediaFilter !== 'all' && item.mediaType !== mediaFilter) {
        return false;
      }

      // Category tab
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Trending') return item.trending;
      if (selectedCategory === '4K Ultra HD') return item.is4k;
      if (selectedCategory === 'TV Series') return item.mediaType === 'tv';
      if (selectedCategory === 'Watchlist') return watchlistIds.includes(item.id);
      
      // Genre match
      return item.genres.some(g => g.toLowerCase() === selectedCategory.toLowerCase());
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.year - a.year;
      return 0; // Default curated order
    });
  }, [searchQuery, mediaFilter, selectedCategory, watchlistIds, sortBy]);

  const activeStreamUrl = useMemo(() => {
    if (!activeMovie) return '';
    return getMovieSourceUrl(activeMovie, selectedServer, selectedSeason, selectedEpisode);
  }, [activeMovie, selectedServer, selectedSeason, selectedEpisode]);

  return (
    <div className="w-full min-h-screen pb-28 text-white select-none">
      
      {/* Top Original Cinema Hero Spotlight */}
      {currentHero && (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[560px] overflow-hidden rounded-3xl border border-white/10 mb-8 shadow-2xl group">
          {/* Dynamic Backdrop Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 group-hover:scale-100"
            style={{ backgroundImage: `url(${currentHero.backdrop})` }}
          />

          {/* Cinematic Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-[#040914]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040914] via-[#040914]/75 to-transparent w-full md:w-3/4" />

          {/* Hero Content Overlay */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 md:p-14 max-w-3xl">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span 
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                style={{ backgroundColor: `${accent}25`, color: accent, borderColor: `${accent}40` }}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Featured on Movy.sx</span>
              </span>

              {currentHero.is4k && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
                  4K Ultra HD
                </span>
              )}

              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300 text-[10px] font-mono">
                {currentHero.year}
              </span>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/15 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentHero.rating}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-lg">
              {currentHero.title}
            </h1>

            {/* Overview / Synopsis */}
            <p className="text-sm sm:text-base text-slate-300 line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl leading-relaxed drop-shadow">
              {currentHero.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => openMoviePlayer(currentHero)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-black font-extrabold text-sm shadow-xl transition-all hover:scale-105 cursor-pointer"
                style={{ backgroundColor: accent }}
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Stream Now</span>
              </button>

              <button
                onClick={(e) => toggleWatchlist(currentHero.id, e)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all cursor-pointer backdrop-blur-md"
              >
                {watchlistIds.includes(currentHero.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {featuredMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === heroIndex ? 'w-6' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                style={{ backgroundColor: idx === heroIndex ? accent : undefined }}
                title={`Featured slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Filter & Navigation Bar */}
      <div className="flex flex-col gap-4 mb-8">
        
        {/* Top Category Tabs Rail */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 pt-1">
          {MOVIE_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected 
                    ? 'text-black shadow-lg scale-105' 
                    : 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                }`}
                style={{
                  backgroundColor: isSelected ? accent : undefined,
                  borderColor: isSelected ? accent : undefined
                }}
              >
                {cat === 'Watchlist' && <Bookmark className="w-3.5 h-3.5 inline mr-1" />}
                {cat}
                {cat === 'Watchlist' && watchlistIds.length > 0 && ` (${watchlistIds.length})`}
              </button>
            );
          })}
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, TV shows, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
              style={{ borderColor: searchQuery ? accent : undefined }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Media Type & Sort */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Media Type Filter */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/15 text-xs">
              <button
                onClick={() => setMediaFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  mediaFilter === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMediaFilter('movie')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  mediaFilter === 'movie' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setMediaFilter('tv')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  mediaFilter === 'tv' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                TV Series
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/40 border border-white/15 text-xs text-slate-300 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-white/25"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="year">Newest Year</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid Results Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-cyan-400" />
          <span>{selectedCategory} Catalog</span>
          <span className="text-xs font-mono text-slate-400 font-normal">({filteredCatalog.length} titles)</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sources powered by Movy.sx & VidSrc</span>
        </span>
      </div>

      {/* Movies Grid */}
      {filteredCatalog.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/5 border border-white/10 rounded-3xl">
          <Film className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No movies or shows found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Try adjusting your search query, selecting another category, or resetting filters.
          </p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setMediaFilter('all'); }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black cursor-pointer shadow-lg"
            style={{ backgroundColor: accent }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredCatalog.map(movie => {
            const isBookmarked = watchlistIds.includes(movie.id);
            return (
              <div
                key={movie.id}
                onClick={() => openMoviePlayer(movie)}
                className="group relative flex flex-col bg-slate-900/40 rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer"
              >
                {/* Poster Artwork Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
                    }}
                  />

                  {/* Gradient Vignette on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-slate-200">
                      {movie.is4k ? '4K' : movie.mediaType === 'tv' ? 'TV' : 'HD'}
                    </span>

                    <button
                      onClick={(e) => toggleWatchlist(movie.id, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        isBookmarked 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-black/50 hover:bg-black/80 text-white/70 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove from watchlist' : 'Save to watchlist'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Play Hover Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                      style={{ backgroundColor: accent }}
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Rating on Poster */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-3 flex flex-col flex-1 justify-between gap-1">
                  <div>
                    <h3 className="font-extrabold text-xs text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span className="truncate">{movie.genres[0] || 'Movie'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Original Watermelon Cinema Player Modal */}
      {activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          
          <div 
            className={`w-full bg-[#080d1a] border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
              isTheaterMode ? 'max-w-[98vw] max-h-[96vh]' : 'max-w-6xl max-h-[92vh]'
            }`}
          >
            {/* Cinema Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-extrabold text-base shadow"
                  style={{ backgroundColor: accent }}
                >
                  🎬
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <span>{activeMovie.title}</span>
                    <span className="text-xs font-mono text-slate-400 font-normal">({activeMovie.year})</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">● Streaming Active</span>
                    <span>•</span>
                    <span>{activeMovie.genres.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Window Controls & Badges */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-mono font-medium">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ad-Shield Active</span>
                </div>

                <a
                  href={getDirectMovyUrl(activeMovie, selectedSeason, selectedEpisode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="Launch directly on movy.sx in an unblocked tab"
                >
                  <span>Movy.sx</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setIsTheaterMode(prev => !prev)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                  title={isTheaterMode ? 'Standard View' : 'Theater View'}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={closeMoviePlayer}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer border border-white/10 hover:border-rose-500/30"
                  title="Close player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Server & Stream Source Switcher */}
            <div className="px-4 sm:px-6 py-2.5 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>Server:</span>
                </span>
                {MOVIE_SERVERS.map(srv => {
                  const isActive = selectedServer === srv.id;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => setSelectedServer(srv.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
                        isActive 
                          ? 'bg-white text-black shadow-md scale-102 border-white' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      <span>{srv.name}</span>
                      <span className={`text-[9px] px-1 rounded font-mono ${isActive ? 'bg-black/15 text-black' : 'bg-white/10 text-slate-400'}`}>
                        {srv.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* TV Episode Selector (Only when mediaType === 'tv') */}
              {activeMovie.mediaType === 'tv' && (
                <div className="flex items-center gap-2">
                  {/* Season */}
                  <select
                    value={selectedSeason}
                    onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(1); }}
                    className="bg-black/60 border border-white/20 text-xs text-white rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(s => (
                      <option key={s} value={s}>Season {s}</option>
                    ))}
                  </select>

                  {/* Episode */}
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="bg-black/60 border border-white/20 text-xs text-white rounded-lg px-2 py-1 outline-none cursor-pointer"
                  >
                    {Array.from({ length: 16 }, (_, i) => i + 1).map(ep => (
                      <option key={ep} value={ep}>Ep {ep}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Video Iframe Viewport */}
            <div className={`relative w-full bg-black flex-1 overflow-hidden ${isTheaterMode ? 'h-[75vh]' : 'h-[50vh] sm:h-[60vh]'}`}>
              <iframe
                key={`${activeMovie.id}-${selectedServer}-${selectedSeason}-${selectedEpisode}`}
                src={activeStreamUrl}
                title={activeMovie.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Bottom Meta & Recommendations */}
            <div className="p-4 sm:p-6 bg-[#040814] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{activeMovie.title}</span>
                  <span className="text-xs text-slate-400">• {activeMovie.year}</span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> {activeMovie.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {activeMovie.overview}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => toggleWatchlist(activeMovie.id, e)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    watchlistIds.includes(activeMovie.id)
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{watchlistIds.includes(activeMovie.id) ? 'Saved' : 'Add to Watchlist'}</span>
                </button>

                <button
                  onClick={() => setSelectedServer('movy_proxy')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all cursor-pointer"
                  title="Switch to unblock proxy server"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Movy Proxy</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
