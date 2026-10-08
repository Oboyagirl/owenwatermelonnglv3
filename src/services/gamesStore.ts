import { useState, useEffect } from 'react';
import { Game } from '../types/game';
import { DEFAULT_GAMES, formatGameIframe, URL_OVERRIDES, getCanonicalGameKey } from '../data/defaultGames';

const OVERRIDES_STORAGE_KEY = 'owen_game_overrides_v2';
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
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const unique: Game[] = [];

  for (const game of list) {
    if (!game || !game.id) continue;
    const key = getCanonicalGameKey(game);
    if (!key || key === '__skip__') continue;
    if (seenIds.has(game.id) || seenKeys.has(key)) continue;

    seenIds.add(game.id);
    seenKeys.add(key);
    unique.push(game);
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
      sandbox: undefined,
      iframeCode: formatGameIframe(authoritative.title, authoritative.iframeSrc),
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
  if (URL_OVERRIDES[game.id]) {
    iframeSrc = URL_OVERRIDES[game.id];
  } else if (iframeSrc.startsWith('/g/')) {
    const slug = iframeSrc.replace(/^\/g\//, '').replace(/\/$/, '');
    iframeSrc = `https://ubghyper.github.io/GameList.github.io/${slug}/`;
  } else if (iframeSrc.includes('.pages.dev')) {
    const match = iframeSrc.match(/https:\/\/([^.]+)\.pages\.dev/);
    if (match) {
      iframeSrc = `https://ubghyper.github.io/GameList.github.io/${match[1]}/`;
    }
  } else if (iframeSrc && iframeSrc.startsWith('/games/')) {
    iframeSrc = iframeSrc.slice(1);
  }

  return { 
    ...game, 
    thumbnail: thumb, 
    iframeSrc, 
    sandbox: undefined,
    iframeCode: formatGameIframe(game.title, iframeSrc),
    source: game.source || 'unblocked',
    secondaryCategory: game.secondaryCategory || 'Potato Classics'
  };
}

export function useGamesStore() {
  // Overrides map: gameId -> partial game fields (e.g. customized plays, custom iframe, custom html)
  const [overrides, setOverrides] = useState<Record<string, Partial<Game>>>(() => {
    // Purge legacy multi-megabyte keys to immediately free browser memory & quota
    try {
      for (let i = 1; i <= 55; i++) {
        localStorage.removeItem(`owen_watermelon_v3_games_v${i}`);
      }
    } catch {}

    try {
      const cached = localStorage.getItem(OVERRIDES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached game overrides', e);
    }
    return {};
  });

  const [games, setGames] = useState<Game[]>(() => {
    // Read any existing overrides directly
    let initialOverrides: Record<string, Partial<Game>> = {};
    try {
      const cached = localStorage.getItem(OVERRIDES_STORAGE_KEY);
      if (cached) {
        initialOverrides = JSON.parse(cached) || {};
      }
    } catch {}

    if (Object.keys(initialOverrides).length === 0) {
      return DEFAULT_GAMES;
    }

    return DEFAULT_GAMES.map(g => {
      const mod = initialOverrides[g.id];
      return mod ? { ...g, ...mod } : g;
    });
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

  // Sync ONLY the tiny overrides dictionary to localStorage (a few KB, never multi-megabytes)
  useEffect(() => {
    try {
      if (Object.keys(overrides).length > 0) {
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
      } else {
        localStorage.removeItem(OVERRIDES_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save game overrides', e);
    }
  }, [overrides]);

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
    setOverrides(prev => {
      const curr = prev[gameId] || {};
      const baseGame = defaultGamesMap.get(gameId);
      const newPlays = ((curr.plays !== undefined) ? curr.plays : (baseGame?.plays || 0)) + 1;
      return { ...prev, [gameId]: { ...curr, plays: newPlays } };
    });
  };

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames(prev =>
      prev.map(g => (g.id === gameId ? { ...g, ...updates } : g))
    );
    setOverrides(prev => ({
      ...prev,
      [gameId]: { ...(prev[gameId] || {}), ...updates }
    }));
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
    setOverrides({});
    try {
      localStorage.removeItem(OVERRIDES_STORAGE_KEY);
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
