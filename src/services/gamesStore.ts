import { useState, useEffect } from 'react';
import { Game } from '../types/game';
import { DEFAULT_GAMES, formatUBGIframe, STANDARD_UBG_SANDBOX } from '../data/defaultGames';

const STORAGE_KEY = 'owen_watermelon_v3_games_v29';
const FAVORITES_KEY = 'owen_watermelon_v3_favorites';

export function resolveAssetUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const clean = url.startsWith('/') ? url.slice(1) : url;

  // On GitHub Pages (static hosting without Express backend), fallback /g/:slug to ubghyper direct shell
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    if (clean.startsWith('g/')) {
      const slug = clean.replace(/^g\//, '').replace(/\/$/, '');
      return `https://ubghyper.github.io/GameList.github.io/${slug}/`;
    }
  }

  const base = import.meta.env.BASE_URL || './';
  if (base.endsWith('/')) {
    return `${base}${clean}`;
  }
  return `${base}/${clean}`;
}

export function deduplicateGames(list: Game[]): Game[] {
  const seen = new Set<string>();
  const unique: Game[] = [];
  for (const game of list) {
    if (!game || !game.id) continue;
    if (!seen.has(game.id)) {
      seen.add(game.id);
      unique.push(game);
    }
  }
  return unique;
}

const defaultGamesMap = new Map(DEFAULT_GAMES.map(g => [g.id, g]));

function sanitizeGame(game: Game): Game {
  const authoritative = defaultGamesMap.get(game.id);
  if (authoritative) {
    return {
      ...game,
      thumbnail: authoritative.thumbnail,
      banner: authoritative.banner,
      iframeSrc: authoritative.iframeSrc,
      sandbox: STANDARD_UBG_SANDBOX,
      iframeCode: formatUBGIframe(authoritative.title, authoritative.iframeSrc),
      source: authoritative.source || game.source || 'unblocked',
      secondaryCategory: authoritative.secondaryCategory || game.secondaryCategory || 'Potato Classics',
      mirrors: authoritative.mirrors || game.mirrors,
      controls: authoritative.controls || game.controls
    };
  }

  let thumb = game.thumbnail || '';
  if (thumb.includes('arcade_hero_banner') || thumb.includes('watermelon_logo') || thumb.includes('retro_bowl_thumb') || thumb.includes('granny_horror_thumb')) {
    thumb = 'https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Slope/slope.jpg';
  }

  let iframeSrc = game.iframeSrc || '';
  if (iframeSrc.startsWith('/g/')) {
    const slug = iframeSrc.replace(/^\/g\//, '').replace(/\/$/, '');
    iframeSrc = `https://ubghyper.github.io/GameList.github.io/${slug}/`;
  } else if (iframeSrc && iframeSrc.startsWith('/games/')) {
    iframeSrc = iframeSrc.slice(1);
  }

  return { 
    ...game, 
    thumbnail: thumb, 
    iframeSrc, 
    sandbox: STANDARD_UBG_SANDBOX,
    iframeCode: formatUBGIframe(game.title, iframeSrc),
    source: game.source || 'unblocked',
    secondaryCategory: game.secondaryCategory || 'Potato Classics'
  };
}

export function useGamesStore() {
  const [games, setGames] = useState<Game[]>(() => {
    // Clean up older storage keys that might have stored duplicate game IDs or old paths
    try {
      [
        'owen_watermelon_v3_games_v1', 
        'owen_watermelon_v3_games_v2', 
        'owen_watermelon_v3_games_v10', 
        'owen_watermelon_v3_games_v11', 
        'owen_watermelon_v3_games_v12', 
        'owen_watermelon_v3_games_v13',
        'owen_watermelon_v3_games_v27',
        'owen_watermelon_v3_games_v28'
      ].forEach(k => {
        localStorage.removeItem(k);
      });
    } catch {}

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed: Game[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = deduplicateGames(parsed.map(sanitizeGame));
          const existingIds = new Set(sanitized.map(g => g.id));
          const missingDefaults = DEFAULT_GAMES.filter(dg => !existingIds.has(dg.id));
          if (missingDefaults.length > 0) {
            return deduplicateGames([...sanitized, ...missingDefaults]);
          }
          return sanitized;
        }
      }
    } catch (e) {
      console.error('Failed to parse cached games', e);
    }
    return DEFAULT_GAMES;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem(FAVORITES_KEY);
      return cached ? JSON.parse(cached) : ['watermelon-merge', 'basket-random', 'retro-bowl'];
    } catch {
      return ['watermelon-merge', 'basket-random', 'retro-bowl'];
    }
  });

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      console.error('Failed to save games to localStorage', e);
    }
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }, [favorites]);

  const toggleFavorite = (gameId: string) => {
    setFavorites(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const recordPlay = (gameId: string) => {
    setGames(prev =>
      prev.map(g => (g.id === gameId ? { ...g, plays: g.plays + 1 } : g))
    );
  };

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames(prev =>
      prev.map(g => (g.id === gameId ? { ...g, ...updates } : g))
    );
    if (selectedGame?.id === gameId) {
      setSelectedGame(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const addGame = (newGame: Game) => {
    setGames(prev => [newGame, ...prev]);
  };

  const deleteGame = (gameId: string) => {
    setGames(prev => prev.filter(g => g.id !== gameId));
    if (selectedGame?.id === gameId) {
      setSelectedGame(null);
    }
  };

  const resetGames = () => {
    setGames(DEFAULT_GAMES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GAMES));
    } catch {}
  };

  return {
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
  };
}

export function openAboutBlankGame(game: Game) {
  try {
    const win = window.open('about:blank', '_blank');
    if (!win) return;

    win.document.title = game.title;
    const doc = win.document;
    doc.body.style.margin = '0';
    doc.body.style.height = '100vh';
    doc.body.style.overflow = 'hidden';
    doc.body.style.backgroundColor = '#08140e';

    const iframe = doc.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.margin = '0';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'autoplay; fullscreen; gamepad; pointer-lock');

    if (game.customHtml) {
      iframe.srcdoc = game.customHtml;
    } else if (game.iframeSrc.startsWith('http') || game.iframeSrc.startsWith('data:') || game.iframeSrc.startsWith('blob:')) {
      iframe.src = game.iframeSrc;
    } else {
      const rel = resolveAssetUrl(game.iframeSrc);
      iframe.src = window.location.origin + (rel.startsWith('/') ? rel : '/' + rel);
    }

    doc.body.appendChild(iframe);
  } catch (err) {
    console.error('Failed to open about:blank window', err);
  }
}
