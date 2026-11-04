import sevenZebMap from './sevenZebGamesMap.json';
import freeWebToolsMap from './freeWebToolsMap.json';
import gameInClassroomMap from './gameInClassroomMap.json';
import brokenGamesFixMap from './brokenGamesFixMap.json';

const sMap = sevenZebMap as Record<string, string>;
const fMap = freeWebToolsMap as Record<string, string>;
const gicMap = gameInClassroomMap as Record<string, string>;
const fixMap = brokenGamesFixMap as Record<string, string>;

const ACADEMICS_MAP: Record<string, string> = {
  "drivemad": "https://academics-study.github.io/drive-mad/",
  "fnaf1": "https://7zeb.github.io/homework/fnaf.html",
  "fnaf2": "https://academics-study.github.io/hd_fnaf/2/",
  "fnaf3": "https://academics-study.github.io/hd_fnaf/3/",
  "fnaf4": "https://academics-study.github.io/hd_fnaf/4/",
  "motox3m": "https://7zeb.github.io/homework/motox3m.html",
  "retrobowlcollege": "https://academics-study.github.io/retro-bowl-college/",
  "drifthunters": "https://7zeb.github.io/homework/drift-hunters/index.html",
  "drifthunter": "https://7zeb.github.io/homework/drift-hunters/index.html",
  "backrooms": "https://7zeb.github.io/homework/backrooms.html",
  "slicemaster": "https://academics-study.github.io/0-slice-master/",
  "shellshockers": "https://academics-study.github.io/shellshockers/",
  "stickmanhook": "https://ubghyper.github.io/GameList.github.io/Stickman-Hook/",
  "stickmanclimb": "https://ubghyper.github.io/GameList.github.io/Stickman-Climb/",
  "stickmanclimb2": "https://ubghyper.github.io/GameList.github.io/Stickman-Climb-2/",
  "peopleplayground": "https://7zeb.github.io/homework/melonplayground.html",
  "blockblast": "https://ubghyper.github.io/GameList.github.io/Block-Blast/",
  "ovo": "https://7zeb.github.io/homework/ovo2.html",
  "eaglercraft": "https://7zeb.github.io/homework/mc1_8.html",
  "eaglercraft188": "https://7zeb.github.io/homework/mc1_8.html",
  "minecraft": "https://7zeb.github.io/homework/mc1_8.html",
  "basketballlegends": "https://joe-the-chicken.github.io/basketball-stars/",
  "basketballlegends2020": "https://joe-the-chicken.github.io/basketball-stars/",
  "vex": "https://7zeb.github.io/homework/vex7.html",
  "vex1": "https://ubghyper.github.io/GameList.github.io/Vex-1/",
  "vex2": "https://ubghyper.github.io/GameList.github.io/Vex-2/",
  "vex3": "https://ubghyper.github.io/GameList.github.io/Vex-3/",
  "vex4": "https://ubghyper.github.io/GameList.github.io/Vex-4/",
  "vex5": "https://ubghyper.github.io/GameList.github.io/Vex-5/",
  "vex6": "https://ubghyper.github.io/GameList.github.io/Vex-6/",
  "vex7": "https://7zeb.github.io/homework/vex7.html",
  "vex8": "https://7zeb.github.io/homework/vex8.html",
  "worldshardestgame": "https://ubghyper.github.io/GameList.github.io/Worlds-Hardest-Game/",
  "worldshardestgame2": "https://ubghyper.github.io/GameList.github.io/Worlds-Hardest-Game-2/",
  "worldshardestgame3": "https://ubghyper.github.io/GameList.github.io/Worlds-Hardest-Game-3/",
  "fruitninja": "games/fruit-ninja.html",
  "mario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario63": "https://ubghyper.github.io/GameList.github.io/Super-Mario-63/",
  "supermario64": "https://7zeb.github.io/homework/sm64/index.html",
  "supermariobros": "https://7zeb.github.io/homework/mario-game/index.html",
  "blackjack": "https://ubghyper.github.io/GameList.github.io/Blackjack/",
  "happywheels": "games/happy-wheels.html",
  "dumbwaystodie": "games/dumb-ways-to-die.html",
  "hooproyale": "https://ubghyper.github.io/GameList.github.io/Hoop-Royale/",
  "asmallworldcup": "games/sawyer-for-sawyer.html",
  "stickmerge": "https://ubghyper.github.io/GameList.github.io/Stick-Merge/",
  "stickmerge2": "https://ubghyper.github.io/GameList.github.io/Stick-Merge/",
  "sausageflip": "https://ubghyper.github.io/GameList.github.io/Sausage-Flip/",
  "sausagerun": "https://ubghyper.github.io/GameList.github.io/Sausage-Run/",
  "bindingofisaac": "https://ubghyper.github.io/GameList.github.io/Binding-Of-Isaac/",
  "ducklife": "games/duck-life-1.html",
  "ducklife1": "games/duck-life-1.html",
  "ducklife2": "games/duck-life-2.html",
  "ducklife3": "games/duck-life-3.html",
  "ducklife4": "games/duck-life-4.html",
  "ducklife5": "games/duck-life-5.html",
  "bloonstd": "games/bloons-td-1.html",
  "bloonstd2": "games/bloons-td-2.html",
  "bloonstd3": "games/bloons-td-3.html",
  "bloonstd4": "games/bloons-td-4.html",
  "bloonstd5": "games/bloons-td-5.html",
  "clusterrush": "https://ubghyper.github.io/GameList.github.io/Cluster-Rush/",
  "cuphead": "https://ubghyper.github.io/GameList.github.io/Cuphead/",
  "badicecream": "https://ubghyper.github.io/GameList.github.io/Bad-Ice-Cream/",
  "badicecream2": "https://ubghyper.github.io/GameList.github.io/Bad-Ice-Cream-2/",
  "badicecream3": "https://ubghyper.github.io/GameList.github.io/Bad-Ice-Cream-3/",
  "candycrush": "https://ubghyper.github.io/GameList.github.io/Candy-Crush/",
  "deathrun3d": "https://ubghyper.github.io/GameList.github.io/Death-Run-3D/",
  "dadish": "https://ubghyper.github.io/GameList.github.io/Dadish/",
  "dadish2": "https://ubghyper.github.io/GameList.github.io/Dadish-2/",
  "dadish3": "https://ubghyper.github.io/GameList.github.io/Dadish-3/",
  "bladeball": "https://ubghyper.github.io/GameList.github.io/Blade-Ball/",
  "blockpost": "https://ubghyper.github.io/GameList.github.io/Blockpost/",
  "boxingrandom": "https://7zeb.github.io/homework/boxingrandom.html",
  "clash": "https://ubghyper.github.io/GameList.github.io/Clash-Of-Vikings/",
  "clashofvikings": "https://ubghyper.github.io/GameList.github.io/Clash-Of-Vikings/",
  "clashoftanks": "https://ubghyper.github.io/GameList.github.io/Clash-Of-Tanks/"
};

const FLYINGSULLY_GAMES = new Set([
  "2048", "awesomeplanes", "awesometanks2", "btd4", "bindingofisaac",
  "bitlife", "bloonstd5", "bobtherobber", "cookieclicker", "doom",
  "ducklife4", "eggycar", "gunmayham2", "happywheels", "ironsnout"
]);

// Retain local client-side offline game canvas implementations
const PRESERVED_LOCAL_GAMES = new Set([
  "games/bloons-td-1.html",
  "games/bloons-td-2.html",
  "games/bloons-td-3.html",
  "games/bloons-td-4.html",
  "games/bloons-td-5.html",
  "games/duck-life-1.html",
  "games/duck-life-2.html",
  "games/duck-life-3.html",
  "games/duck-life-4.html",
  "games/duck-life-5.html",
  "games/watermelon-merge.html",
  "games/snake.html",
  "games/tetris.html",
  "games/2048.html",
  "games/breakout.html",
  "games/flappy.html",
  "games/space.html",
  "games/pong.html",
  "games/soccer-2026.html",
  "games/soccer-real.html",
  "games/fifa.html",
  "games/sawyer-for-sawyer.html",
  "games/a-small-world-cup.html",
  "games/a-small-world-cup/index.html",
  "games/dumb-ways-to-die.html",
  "games/kindergarten.html",
  "games/kindergarten-2.html",
  "games/the-man-in-the-window.html",
  "games/case-opener.html",
  "games/flash-player.html",
  "games/happy-wheels.html",
  "games/fruit-ninja.html",
  "games/papas-scooperia.html",
  "games/serenitrove.html",
  "games/pokemon-emerald.html",
  "games/pokemon-red.html",
  "games/gba-player.html",
  "games/soccer-random.html",
  "games/soccer-random/index.html",
  "games/volley-random.html",
  "games/basket-random.html",
  "games/boxing-random.html",
  "games/diep-io.html",
  "games/spaceflight-simulator.html",
  "games/geometry-dash.html",
  "games/google-baseball.html",
  "games/slither-io.html"
]);

function cleanText(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&#39;/g, "")
    .replace(/&amp;/g, "and")
    .replace(/&quot;/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function resolveGameSource(
  id: string,
  title: string,
  currentSrc: string = "",
  mirrors: string[] = []
): { src: string; mirrors: string[] } {
  const safeId = String(id || "");
  const safeTitle = String(title || "");
  const safeSrc = String(currentSrc || "");
  const safeMirrors = Array.isArray(mirrors) ? mirrors : [];

  // Specialized top-priority handlers for requested games

  // Sniper Assassin 1 - 5 (Verified SWFs with local modern Flash Player runner)
  if (
    safeId.includes('sniper-assassin') || safeId.includes('sniperassassin') ||
    safeTitle.toLowerCase().includes('sniper assassin')
  ) {
    const combined = (safeId + ' ' + safeTitle).toLowerCase();
    if (combined.includes('5')) {
      const u = 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Sniper-assassin-5/sniper-assassin-5.swf&title=Sniper+Assassin+5';
      return { src: u, mirrors: [u] };
    }
    if (combined.includes('4')) {
      const u = 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Sniper-assassin-4/sniperassassin4.swf&title=Sniper+Assassin+4';
      return { src: u, mirrors: [u] };
    }
    if (combined.includes('3')) {
      const u = 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Sniper-assassin-3/sniper-assassin-3.swf&title=Sniper+Assassin+3';
      return { src: u, mirrors: [u] };
    }
    if (combined.includes('2')) {
      const u = 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Sniper-assassin-2/sniper-assassin-2.swf&title=Sniper+Assassin+2';
      return { src: u, mirrors: [u] };
    }
    const u = 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Sniper-Assassin/sniperassassin.swf&title=Sniper+Assassin';
    return { src: u, mirrors: [u] };
  }

  // Wheely 1 - 8 (Verified SWFs with local modern Flash Player runner)
  if (safeId.includes('wheely') || safeTitle.toLowerCase().includes('wheely')) {
    const combined = (safeId + ' ' + safeTitle).toLowerCase();
    for (let num = 8; num >= 2; num--) {
      if (combined.includes(String(num))) {
        const u = `games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Wheely-${num}/Wheely-${num}.swf&title=Wheely+${num}`;
        return { src: u, mirrors: [u] };
      }
    }
    const u = 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Wheely/Wheely.swf&title=Wheely';
    return { src: u, mirrors: [u] };
  }

  // Happy Wheels (Local unblocked runner + happy-wheels.pages.dev + ubghyper)
  if (
    safeId.includes('happy-wheel') || safeId.includes('happywheel') ||
    safeTitle.toLowerCase().includes('happy wheel')
  ) {
    return {
      src: 'games/happy-wheels.html',
      mirrors: [
        'games/happy-wheels.html',
        'https://happy-wheels.pages.dev/',
        'https://ubghyper.github.io/GameList.github.io/Happy-Wheels/'
      ]
    };
  }

  // Google Baseball (Doodle Baseball)
  if (
    safeId.includes('baseball') && (safeId.includes('google') || safeTitle.toLowerCase().includes('google'))
  ) {
    return {
      src: 'games/google-baseball.html',
      mirrors: [
        'games/google-baseball.html',
        'https://7zeb.github.io/homework/googlebaseball.html'
      ]
    };
  }

  // Geometry Dash (All editions: Classic, Remastered, Meltdown, Sub-Zero, Lite)
  if (
    safeId.includes('geometry-dash') || safeId.includes('geometrydash') ||
    safeTitle.toLowerCase().includes('geometry dash')
  ) {
    return {
      src: 'games/geometry-dash.html',
      mirrors: [
        'games/geometry-dash.html',
        'https://geometry-dash.pages.dev/',
        'https://7zeb.github.io/homework/geometry-dash-remastered/index.html',
        'https://7zeb.github.io/homework/geometryvibes.html',
        'https://ubghyper.github.io/GameList.github.io/Geometry-Dash-Lite/'
      ]
    };
  }

  // Slither.io (60 FPS local canvas arena + online servers)
  if (safeId.includes('slither') || safeTitle.toLowerCase().includes('slither')) {
    return {
      src: 'games/slither-io.html',
      mirrors: [
        'games/slither-io.html',
        'https://slither.com/io'
      ]
    };
  }

  // Paper.io & Paper.io 2
  if (
    safeId.includes('paper-io') || safeId.includes('paperio') ||
    safeTitle.toLowerCase().includes('paper io') || safeTitle.toLowerCase().includes('paper.io')
  ) {
    return {
      src: 'https://7zeb.github.io/homework/paperio2.html',
      mirrors: [
        'https://7zeb.github.io/homework/paperio2.html',
        'https://ubghyper.github.io/GameList.github.io/Paper-IO-2/'
      ]
    };
  }

  // Hole.io
  if (
    safeId.includes('hole-io') || safeId.includes('holeio') ||
    safeTitle.toLowerCase().includes('hole.io') || safeTitle.toLowerCase().includes('hole io')
  ) {
    return {
      src: 'https://7zeb.github.io/homework/holeio.html',
      mirrors: [
        'https://7zeb.github.io/homework/holeio.html'
      ]
    };
  }

  // Agar.io
  if (
    safeId.includes('agar-io') || safeId.includes('agario') ||
    safeTitle.toLowerCase().includes('agar.io') || safeTitle.toLowerCase().includes('agar io') ||
    safeTitle.toLowerCase() === 'agar'
  ) {
    return {
      src: 'https://7zeb.github.io/homework/agariolite.html',
      mirrors: [
        'https://7zeb.github.io/homework/agariolite.html'
      ]
    };
  }

  // Smash Karts (Direct live unblocked domain without dead freeonlinewebtools wrappers)
  if (
    safeId.includes('smash-kart') || safeId.includes('smashkart') ||
    safeTitle.toLowerCase().includes('smash kart')
  ) {
    return {
      src: 'https://smashkarts.io/',
      mirrors: [
        'https://smashkarts.io/'
      ]
    };
  }

  // 1v1.lol (Full unity build assets on ubghyper)
  if (
    safeId.includes('1v1-lol') || safeId.includes('1v1lol') ||
    safeTitle.toLowerCase().includes('1v1.lol') || safeTitle.toLowerCase().includes('1v1 lol')
  ) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/1v1-LOL/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/1v1-LOL/'
      ]
    };
  }

  // EvoWars.io (Direct live server without dead freeonlinewebtools wrapper)
  if (
    safeId.includes('evowars') || safeTitle.toLowerCase().includes('evowars')
  ) {
    return {
      src: 'https://evowars.io/',
      mirrors: [
        'https://evowars.io/'
      ]
    };
  }

  // Zombs Royale
  if (
    safeId.includes('zombs') || safeTitle.toLowerCase().includes('zombs')
  ) {
    return {
      src: 'https://zombsroyale.io/',
      mirrors: [
        'https://zombsroyale.io/'
      ]
    };
  }

  // Diep.io / Deip.io Tank Arena (Offline local canvas arena + official live unblocked mirrors)
  if (
    safeId.includes('diep') || safeId.includes('deip') ||
    safeTitle.toLowerCase().includes('diep') || safeTitle.toLowerCase().includes('deip')
  ) {
    return {
      src: 'games/diep-io.html',
      mirrors: [
        'games/diep-io.html',
        'https://diep.io/',
        'https://arras.io/'
      ]
    };
  }

  if (
    safeId.includes('spaceflight') || safeId.includes('space-flight') ||
    safeTitle.toLowerCase().includes('spaceflight') || safeTitle.toLowerCase().includes('space flight')
  ) {
    return {
      src: 'games/spaceflight-simulator.html',
      mirrors: [
        'games/spaceflight-simulator.html',
        'https://ubghyper.github.io/GameList.github.io/Spaceflight-Simulator/'
      ]
    };
  }

  if (safeId === 'retro-bowl' || safeId === 'potatoes-retro-bowl') {
    return {
      src: 'https://retro--bowl.pages.dev/',
      mirrors: [
        'https://retro--bowl.pages.dev/',
        'https://javaspence.github.io/retrobowl/',
        'https://ubghyper.github.io/GameList.github.io/retro-bowl/'
      ]
    };
  }

  if (safeId.includes('getting-over-it') || safeTitle.toLowerCase().includes('getting over it')) {
    return {
      src: 'games/getting-over-it.html',
      mirrors: [
        'games/getting-over-it.html',
        'https://ubghyper.github.io/GameList.github.io/Getting-Over-It/',
        'https://7zeb.github.io/homework/getting-over-it/'
      ]
    };
  }

  // Bloons Tower Defense Series (Local High-Speed HTML5 + 7zeb Verified Mirrors)
  if (safeId.includes('bloon') || safeId.includes('btd') || safeTitle.toLowerCase().includes('bloon')) {
    const lower = (safeId + ' ' + safeTitle).toLowerCase();
    if (lower.includes('5') || lower.includes('btd5')) {
      return {
        src: 'games/bloons-td-5.html',
        mirrors: [
          'games/bloons-td-5.html',
          'https://7zeb.github.io/homework/bloonsTD5.html'
        ]
      };
    }
    if (lower.includes('4') || lower.includes('btd4')) {
      return {
        src: 'games/bloons-td-4.html',
        mirrors: [
          'games/bloons-td-4.html',
          'https://7zeb.github.io/homework/bloonsTD4.html'
        ]
      };
    }
    if (lower.includes('3') || lower.includes('btd3')) {
      return {
        src: 'games/bloons-td-3.html',
        mirrors: [
          'games/bloons-td-3.html',
          'https://7zeb.github.io/homework/bloonsTD3.html'
        ]
      };
    }
    if (lower.includes('2') || lower.includes('btd2')) {
      return {
        src: 'games/bloons-td-2.html',
        mirrors: [
          'games/bloons-td-2.html',
          'https://7zeb.github.io/homework/bloonsTD2.html'
        ]
      };
    }
    // Default to BTD 1
    return {
      src: 'games/bloons-td-1.html',
      mirrors: [
        'games/bloons-td-1.html',
        'https://7zeb.github.io/homework/bloonsTD.html'
      ]
    };
  }

  // Duck Life Series (Local High-Speed Ruffle Runner + ubghyper Verified Mirrors)
  if (safeId.includes('duck-life') || safeId.includes('ducklife') || safeTitle.toLowerCase().includes('duck life')) {
    const lower = (safeId + ' ' + safeTitle).toLowerCase();
    if (lower.includes('5') || lower.includes('treasure')) {
      return {
        src: 'games/duck-life-5.html',
        mirrors: [
          'games/duck-life-5.html',
          'https://ubghyper.github.io/GameList.github.io/Duck-Life-5/'
        ]
      };
    }
    if (lower.includes('4')) {
      return {
        src: 'games/duck-life-4.html',
        mirrors: [
          'games/duck-life-4.html',
          'https://ubghyper.github.io/GameList.github.io/Duck-Life-4/'
        ]
      };
    }
    if (lower.includes('3') || lower.includes('evolution')) {
      return {
        src: 'games/duck-life-3.html',
        mirrors: [
          'games/duck-life-3.html',
          'https://ubghyper.github.io/GameList.github.io/Duck-Life-3/'
        ]
      };
    }
    if (lower.includes('2') || lower.includes('champion')) {
      return {
        src: 'games/duck-life-2.html',
        mirrors: [
          'games/duck-life-2.html',
          'https://ubghyper.github.io/GameList.github.io/Duck-Life-2/'
        ]
      };
    }
    // Default to Duck Life 1
    return {
      src: 'games/duck-life-1.html',
      mirrors: [
        'games/duck-life-1.html',
        'https://ubghyper.github.io/GameList.github.io/Duck-Life/'
      ]
    };
  }

  if (safeId === 'achievement-unlocked' || safeTitle.toLowerCase() === 'achievement unlocked') {
    return {
      src: 'https://7zeb.github.io/homework/theimpossiblequiz.html',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked/achievementunlocked.swf&title=Achievement+Unlocked',
        'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked/'
      ]
    };
  }

  if (safeId === 'achievement-unlocked-2' || safeTitle.toLowerCase() === 'achievement unlocked 2') {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-2/achievementunlocked2.swf&title=Achievement+Unlocked+2',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-2/achievementunlocked2.swf&title=Achievement+Unlocked+2',
        'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-2/'
      ]
    };
  }

  if (safeId === 'achievement-unlocked-3' || safeTitle.toLowerCase() === 'achievement unlocked 3') {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-3/achievementunlocked3.swf&title=Achievement+Unlocked+3',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-3/achievementunlocked3.swf&title=Achievement+Unlocked+3',
        'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-3/'
      ]
    };
  }

  // Pokemon series (100% reliable local GBA WebAssembly emulation + verified roms)
  if (safeId === 'pokemonemerald' || safeId === 'pokemon-emerald' || safeTitle.toLowerCase().includes('pokemon emerald')) {
    return {
      src: 'games/pokemon-emerald.html',
      mirrors: [
        'games/pokemon-emerald.html',
        'games/gba-player.html?rom=https://freeonlinewebtools.github.io/gamelist3.github.io/pokemonemerald.gba&title=Pokemon+Emerald',
        'https://freeonlinewebtools.github.io/gamelist3.github.io/pokemonemerald.html',
        'https://ubghyper.github.io/GameList.github.io/PokemonEmerald/'
      ]
    };
  }

  if (safeId === 'pokemonred' || safeId === 'pokemon-red' || safeTitle.toLowerCase().includes('pokemon red')) {
    return {
      src: 'games/pokemon-red.html',
      mirrors: [
        'games/pokemon-red.html',
        'games/gba-player.html?rom=https://freeonlinewebtools.github.io/gamelist3.github.io/pokemonred.gba&title=Pokemon+Red',
        'https://freeonlinewebtools.github.io/gamelist3.github.io/pokemonred.html',
        'https://ubghyper.github.io/GameList.github.io/PokemonRed/'
      ]
    };
  }

  // Serenitrove (100% unblocked local client-side build with online fallback)
  if (safeId === 'serenitrove' || safeTitle.toLowerCase().includes('serenitrove')) {
    return {
      src: 'games/serenitrove.html',
      mirrors: [
        'games/serenitrove.html',
        'https://freeonlinewebtools.github.io/gamelist3.github.io/serenitrove_v1.1.7/'
      ]
    };
  }

  // Flash Flight Simulator & Spaceflight Simulator
  if (safeId.includes('flash-flight') || safeId.includes('spaceflight-simulator') || safeTitle.toLowerCase().includes('flight simulator')) {
    const swf = 'https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/flashflightsimulator.swf';
    return {
      src: `games/flash-player.html?swf=${swf}&title=Flash+Flight+Simulator`,
      mirrors: [
        `games/flash-player.html?swf=${swf}&title=Flash+Flight+Simulator`,
        'https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/',
        '/g/Flash-Flight-Simulator-1'
      ]
    };
  }

  // Gunblood
  if (safeId === 'gunblood' || safeTitle.toLowerCase().includes('gunblood')) {
    const swf = 'https://ubghyper.github.io/GameList.github.io/Gunblood/gunblood.swf';
    return {
      src: `games/flash-player.html?swf=${swf}&title=Gunblood`,
      mirrors: [
        `games/flash-player.html?swf=${swf}&title=Gunblood`,
        'https://ubghyper.github.io/GameList.github.io/Gunblood/'
      ]
    };
  }

  // Road of the Dead series
  if (safeId === 'road-of-the-dead-2' || safeTitle.toLowerCase().includes('road of the dead 2')) {
    const swf = 'https://ubghyper.github.io/GameList.github.io/Road-of-the-dead-2/road_of_the_deads_2.swf';
    return {
      src: `games/flash-player.html?swf=${swf}&title=Road+of+the+Dead+2`,
      mirrors: [
        `games/flash-player.html?swf=${swf}&title=Road+of+the+Dead+2`,
        'https://ubghyper.github.io/GameList.github.io/Road-of-the-dead-2/',
        '/g/Road-of-the-dead-2'
      ]
    };
  }

  if (safeId === 'road-of-the-dead' || safeTitle.toLowerCase() === 'road of the dead') {
    const swf = 'https://ubghyper.github.io/GameList.github.io/Road-of-the-dead/roadofthedead.swf';
    return {
      src: `games/flash-player.html?swf=${swf}&title=Road+of+the+Dead`,
      mirrors: [
        `games/flash-player.html?swf=${swf}&title=Road+of+the+Dead`,
        'https://ubghyper.github.io/GameList.github.io/Road-of-the-dead/',
        '/g/Road-of-the-dead'
      ]
    };
  }

  // Fireboy & Watergirl series (Verified working HTML5 and Flash engines)
  if (safeId === 'fireboy-and-watergirl-3' || safeTitle.toLowerCase().includes('watergirl 3') || safeTitle.toLowerCase().includes('ice temple')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-3/',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-3/fboy3.swf&title=Fireboy+and+Watergirl+3',
        'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-3/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-2' || safeId === 'fireboy-and-watergirl-2-light-temple' || safeTitle.toLowerCase().includes('watergirl 2') || safeTitle.toLowerCase().includes('light temple')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-2/',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-2/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-4' || safeTitle.toLowerCase().includes('watergirl 4') || safeTitle.toLowerCase().includes('crystal temple')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-4/',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-4/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-5' || safeTitle.toLowerCase().includes('watergirl 5') || safeTitle.toLowerCase().includes('elements')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-5/',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-5/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-6' || safeTitle.toLowerCase().includes('watergirl 6') || safeTitle.toLowerCase().includes('fairy tales')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-6/',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl-6/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl' || safeId === 'fireboy-and-watergirl-1' || safeTitle.toLowerCase().includes('watergirl')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl/',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'https://ubghyper.github.io/GameList.github.io/Fireboy-and-Watergirl/'
      ]
    };
  }

  // Papa's Restaurant Management Series & Cooking Games (Direct Modern HTML5/WASM - Zero Flash)
  const lowerId = safeId.toLowerCase();
  const lowerTitle = safeTitle.toLowerCase();

  if (lowerId.includes('pizzeria') || lowerTitle.includes('pizzeria')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Papas-Pizzeria/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/Papas-Pizzeria/',
        '/g/Papas-Pizzeria'
      ]
    };
  }

  if (lowerId.includes('burgeria') || lowerId.includes('papa-burg') || lowerTitle.includes('burgeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papasburgeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papasburgeria.html',
        'https://gameinclassroom.github.io/papas-burgeria/',
        'https://ubghyper.github.io/GameList.github.io/Papa-Burg/'
      ]
    };
  }

  if (lowerId.includes('freezeria') || lowerTitle.includes('freezeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papasfreezeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papasfreezeria.html',
        'https://gameinclassroom.github.io/papas-freezeria/'
      ]
    };
  }

  if (lowerId.includes('bakeria') || lowerId.includes('papa-bakes') || lowerTitle.includes('bakeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papasbakeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papasbakeria.html',
        'https://ubghyper.github.io/GameList.github.io/Papa-Bakes/'
      ]
    };
  }

  if (lowerId.includes('cheeseria') || lowerId.includes('papas-cheese') || lowerId.includes('toastelia') || lowerTitle.includes('cheeseria') || lowerTitle.includes('toastelia')) {
    return {
      src: 'https://7zeb.github.io/homework/papascheeseria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papascheeseria.html',
        'https://ubghyper.github.io/GameList.github.io/Papas-Cheese/'
      ]
    };
  }

  if (lowerId.includes('cupcakeria') || lowerId.includes('papa-cpck') || lowerTitle.includes('cupcakeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papascupcakeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papascupcakeria.html',
        'https://ubghyper.github.io/GameList.github.io/Papa-Cpck/'
      ]
    };
  }

  if (lowerId.includes('donuteria') || lowerId.includes('papas-donut') || lowerTitle.includes('donuteria')) {
    return {
      src: 'https://7zeb.github.io/homework/papasdonuteria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papasdonuteria.html',
        'https://ubghyper.github.io/GameList.github.io/Papas-Donut/'
      ]
    };
  }

  if (lowerId.includes('hot-doggeria') || lowerId.includes('hotdoggeria') || lowerId.includes('papa-htdog') || lowerTitle.includes('hot doggeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papashotdoggeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papashotdoggeria.html',
        'https://ubghyper.github.io/GameList.github.io/Papa-Htdog/'
      ]
    };
  }

  if (lowerId.includes('pancakeria') || lowerId.includes('papas-pnck') || lowerTitle.includes('pancakeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papaspancakeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papaspancakeria.html',
        'https://ubghyper.github.io/GameList.github.io/Papas-PnCk/'
      ]
    };
  }

  if (lowerId.includes('pastaria') || lowerId.includes('pasteria') || lowerId.includes('papas-pasta') || lowerTitle.includes('pastaria')) {
    return {
      src: 'https://7zeb.github.io/homework/papaspastaria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papaspastaria.html',
        'https://ubghyper.github.io/GameList.github.io/Papas-Pasta/'
      ]
    };
  }

  if (lowerId.includes('taco-mia') || lowerId.includes('tacomia') || lowerTitle.includes('taco mia')) {
    return {
      src: 'https://7zeb.github.io/homework/papastacomia.html',
      mirrors: [
        'https://7zeb.github.io/homework/papastacomia.html'
      ]
    };
  }

  if (lowerId.includes('wingeria') || lowerId.includes('papas-wing') || lowerTitle.includes('wingeria')) {
    return {
      src: 'https://7zeb.github.io/homework/papaswingeria.html',
      mirrors: [
        'https://7zeb.github.io/homework/papaswingeria.html',
        'https://ubghyper.github.io/GameList.github.io/Papas-Wing/'
      ]
    };
  }

  if (lowerId.includes('sushiria') || lowerId.includes('papas-sushi') || lowerTitle.includes('sushiria')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Papas-Sushi/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/Papas-Sushi/'
      ]
    };
  }

  if (lowerId.includes('scooperia') || lowerId.includes('papa-scoop') || lowerTitle.includes('scooperia')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Papa-Scoop/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/Papa-Scoop/',
        'games/papas-scooperia.html'
      ]
    };
  }

  if (lowerId.includes('cooking-mama') || lowerTitle.includes('cooking mama')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Cooking-Mama/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/Cooking-Mama/',
        '/g/Cooking-Mama'
      ]
    };
  }

  if (lowerId.includes('papalouie1') || lowerId.includes('papas-louie-1') || lowerTitle.includes('papa louie 1')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Papas-Louie-1/',
      mirrors: ['https://ubghyper.github.io/GameList.github.io/Papas-Louie-1/']
    };
  }

  if (lowerId.includes('papalouie2') || lowerId.includes('papas-louie-2') || lowerTitle.includes('papa louie 2')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Papas-Louie-2/',
      mirrors: ['https://ubghyper.github.io/GameList.github.io/Papas-Louie-2/']
    };
  }

  if (lowerId.includes('papalouie3') || lowerId.includes('papas-louie-3') || lowerTitle.includes('papa louie 3')) {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Papas-Louie-3/',
      mirrors: ['https://ubghyper.github.io/GameList.github.io/Papas-Louie-3/']
    };
  }

  // If preserved local game (or flash player wrapper with query), keep as-is
  if (PRESERVED_LOCAL_GAMES.has(safeSrc) || safeSrc.startsWith("games/flash-player.html")) {
    return { src: safeSrc, mirrors: [safeSrc, ...safeMirrors.filter(m => m !== safeSrc)] };
  }

  // 1. Direct explicit fix map check (handles clash and all 86 reported issues)
  if (fixMap[safeId]) {
    const fixedUrl = fixMap[safeId];
    return { src: fixedUrl, mirrors: [fixedUrl, ...safeMirrors.filter(m => m !== fixedUrl)] };
  }

  const cleanTitle = cleanText(safeTitle);
  const cleanId = cleanText(safeId.replace(/^potatoes-/, ""));
  const cleanSlug = cleanText(safeSrc.replace(/https?:\/\/[^\/]+\/[^\/]+\/([^\/]+)\/?.*/, "$1"));

  if (fixMap[cleanTitle] || fixMap[cleanId] || fixMap[cleanSlug]) {
    const fixedUrl = fixMap[cleanTitle] || fixMap[cleanId] || fixMap[cleanSlug];
    return { src: fixedUrl, mirrors: [fixedUrl, ...mirrors.filter(m => m !== fixedUrl)] };
  }

  // Convert any legacy freeonlinewebtools.github.io URLs to working ubghyper or 7zeb endpoints
  if (safeSrc.includes('freeonlinewebtools.github.io')) {
    const slugMatch = safeSrc.match(/freeonlinewebtools\.github\.io\/[^\/]+\/([^\/]+)/);
    const slug = slugMatch ? slugMatch[1] : '';
    const normSlug = cleanText(slug);

    if (sMap[normSlug] || sMap[cleanTitle] || sMap[cleanId]) {
      const fixedUrl = sMap[normSlug] || sMap[cleanTitle] || sMap[cleanId];
      return {
        src: fixedUrl,
        mirrors: [fixedUrl, `https://ubghyper.github.io/GameList.github.io/${slug}/`]
      };
    }
    const fixedUrl = `https://ubghyper.github.io/GameList.github.io/${slug}/`;
    return {
      src: fixedUrl,
      mirrors: [fixedUrl]
    };
  }

  // Check if primary needs fallback resolution
  const isBlocked = 
    currentSrc.includes('gameinclassroom') ||
    currentSrc.includes('.pages.dev') ||
    currentSrc.includes('gamedistribution.com') ||
    currentSrc.includes('blobby-boi') ||
    currentSrc.includes('stroongdog') ||
    currentSrc.includes('strongdog') ||
    currentSrc.endsWith('/index.html') && currentSrc.includes('7zeb.github.io/homework/index.html') ||
    (currentSrc.startsWith('games/') && !PRESERVED_LOCAL_GAMES.has(currentSrc)) ||
    currentSrc === '';

  let resolvedSrc = currentSrc;

  if (isBlocked) {
    // 1. Try 7zeb verified endpoints FIRST (Confirmed working on school filters & iPads)
    if (sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug]) {
      resolvedSrc = sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug];
    }
    // 2. Try Academics-Study verified endpoints
    else if (ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug]) {
      resolvedSrc = ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug];
    }
    // 3. Try ubghyper verified endpoints
    else if (cleanSlug && !cleanSlug.includes('http')) {
      resolvedSrc = `https://ubghyper.github.io/GameList.github.io/${cleanSlug}/`;
    }
    // 4. Try FlyingSully mirrors
    else if (FLYINGSULLY_GAMES.has(cleanTitle) || FLYINGSULLY_GAMES.has(cleanId) || FLYINGSULLY_GAMES.has(cleanSlug)) {
      resolvedSrc = `https://flyingsully.github.io/GameList.github.io/${title.replace(/ /g, '-')}/`;
    }
    // 5. Look for clean mirrors already in mirrors array
    else {
      const cleanMirror = mirrors.find(m => 
        (m.includes('7zeb.github.io') || 
         m.includes('ubghyper.github.io') ||
         m.includes('academics-study.github.io') || 
         m.includes('javaspence.github.io') || 
         m.includes('henshmi.github.io') || 
         m.includes('joe-the-chicken.github.io') || 
         m.includes('flyingsully.github.io')) &&
        !m.includes('homework/index.html')
      );
      if (cleanMirror) {
        resolvedSrc = cleanMirror;
      }
    }
  }

  // Prevent directory index page from ever being loaded as game iframe
  if (resolvedSrc === 'https://7zeb.github.io/homework/index.html') {
    resolvedSrc = `https://ubghyper.github.io/GameList.github.io/${safeTitle.replace(/\s+/g, '-')}/`;
  }

  // Construct clean prioritized mirrors list
  const cleanMirrorsList = [
    resolvedSrc,
    ...mirrors.filter(m => m !== resolvedSrc && 
      !m.includes('blobby-boi') && 
      !m.includes('gamedistribution.com') &&
      !m.includes('gameinclassroom') &&
      !m.includes('freeonlinewebtools') &&
      m !== 'games/paper-io-2/index.html'
    )
  ];

  return {
    src: resolvedSrc,
    mirrors: cleanMirrorsList
  };
}
