import { Game } from '../types/game';
import { TRIPPLE_POTATOES_GAMES } from './tripplePotatoesGames';

export const DEFAULT_GAMES: Game[] = TRIPPLE_POTATOES_GAMES;

export const URL_OVERRIDES: Record<string, string> = {
  'watermelon-merge': 'games/watermelon-merge.html',
  'fruitninja': 'games/fruit-ninja.html',
  'asmallworldcup': 'games/sawyer-for-sawyer.html',
  'dumbwaystodie': 'games/dumb-ways-to-die.html',
  'fnaf4-halloween': 'games/fnaf4-halloween.html'
};

export function formatGameIframe(title: string, src: string): string {
  return `<iframe src="${src}" title="${title}" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen class="game-iframe"></iframe>`;
}

export function getCanonicalGameKey(game: Game): string {
  if (!game || !game.title) return '';
  const clean = game.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return game.id || '';
  return clean;
}
