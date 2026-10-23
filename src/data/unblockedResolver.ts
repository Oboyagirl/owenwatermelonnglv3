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
  "backrooms": "https://academics-study.github.io/backrooms/",
  "slicemaster": "https://academics-study.github.io/0-slice-master/",
  "shellshockers": "https://academics-study.github.io/shellshockers/",
  "stickmanhook": "https://7zeb.github.io/homework/index.html",
  "stickmanclimb": "https://7zeb.github.io/homework/index.html",
  "stickmanclimb2": "https://7zeb.github.io/homework/index.html",
  "peopleplayground": "https://7zeb.github.io/homework/melonplayground.html",
  "blockblast": "https://freeonlinewebtools.github.io/blockblastunblockedgames.github.io/",
  "ovo": "https://7zeb.github.io/homework/ovo2.html",
  "eaglercraft": "https://7zeb.github.io/homework/mc1_8.html",
  "eaglercraft188": "https://7zeb.github.io/homework/mc1_8.html",
  "minecraft": "https://7zeb.github.io/homework/mc1_8.html",
  "basketballlegends": "https://joe-the-chicken.github.io/basketball-stars/",
  "basketballlegends2020": "https://joe-the-chicken.github.io/basketball-stars/",
  "vex": "https://7zeb.github.io/homework/index.html",
  "vex1": "https://ubghyper.github.io/GameList.github.io/Vex-1/",
  "vex2": "https://ubghyper.github.io/GameList.github.io/Vex-2/",
  "vex3": "https://7zeb.github.io/homework/index.html",
  "vex4": "https://7zeb.github.io/homework/index.html",
  "vex5": "https://7zeb.github.io/homework/index.html",
  "vex6": "https://7zeb.github.io/homework/index.html",
  "vex7": "https://7zeb.github.io/homework/vex7.html",
  "vex8": "https://7zeb.github.io/homework/vex8.html",
  "worldshardestgame": "https://7zeb.github.io/homework/index.html",
  "worldshardestgame2": "https://7zeb.github.io/homework/index.html",
  "worldshardestgame3": "https://7zeb.github.io/homework/index.html",
  "fruitninja": "games/fruit-ninja.html",
  "mario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario63": "https://ubghyper.github.io/GameList.github.io/Super-Mario-63/",
  "supermario64": "https://7zeb.github.io/homework/index.html",
  "supermariobros": "https://7zeb.github.io/homework/mario-game/index.html",
  "blackjack": "https://flyingsully.github.io/GameList.github.io/Blackjack/",
  "happywheels": "https://7zeb.github.io/homework/index.html",
  "dumbwaystodie": "games/dumb-ways-to-die.html",
  "hooproyale": "https://ubghyper.github.io/GameList.github.io/Hoop-Royale/",
  "asmallworldcup": "games/sawyer-for-sawyer.html",
  "stickmerge": "https://7zeb.github.io/homework/index.html",
  "stickmerge2": "https://7zeb.github.io/homework/index.html",
  "sausageflip": "https://7zeb.github.io/homework/index.html",
  "sausagerun": "https://7zeb.github.io/homework/index.html",
  "bindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "ducklife4": "https://flyingsully.github.io/GameList.github.io/Duck-Life-4/",
  "clusterrush": "https://7zeb.github.io/homework/index.html",
  "cuphead": "https://freeonlinewebtools.github.io/gamelist2.github.io/Cuphead/",
  "badicecream": "https://freeonlinewebtools.github.io/gamelist8.github.io/Bad-Ice-Cream/",
  "badicecream2": "https://7zeb.github.io/homework/index.html",
  "badicecream3": "https://7zeb.github.io/homework/index.html",
  "candycrush": "https://freeonlinewebtools.github.io/gamelist3.github.io/Candy-Crush/",
  "deathrun3d": "https://freeonlinewebtools.github.io/gamelist3.github.io/Death-Run-3D/",
  "dadish": "https://freeonlinewebtools.github.io/gamelist3.github.io/Dadish/",
  "dadish2": "https://freeonlinewebtools.github.io/gamelist2.github.io/Dadish-2/",
  "dadish3": "https://freeonlinewebtools.github.io/gamelist2.github.io/Dadish-3/",
  "bladeball": "https://freeonlinewebtools.github.io/gamelist3.github.io/Blade-Ball/",
  "blockpost": "https://freeonlinewebtools.github.io/gamelist3.github.io/Blockpost/",
  "boxingrandom": "https://7zeb.github.io/homework/boxingrandom.html",
  "clash": "https://freeonlinewebtools.github.io/gamelist3.github.io/Clash-Of-Vikings/",
  "clashofvikings": "https://freeonlinewebtools.github.io/gamelist3.github.io/Clash-Of-Vikings/",
  "clashoftanks": "https://freeonlinewebtools.github.io/gamelist3.github.io/Clash-Of-Vikings/"
};

const FLYINGSULLY_GAMES = new Set([
  "2048", "awesomeplanes", "awesometanks2", "btd4", "bindingofisaac",
  "bitlife", "bloonstd5", "bobtherobber", "cookieclicker", "doom",
  "ducklife4", "eggycar", "gunmayham2", "happywheels", "ironsnout"
]);

// Retain local client-side offline game canvas implementations
const PRESERVED_LOCAL_GAMES = new Set([
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
  "games/boxing-random.html"
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

  if (safeId.includes('paper-io') || safeTitle.toLowerCase().includes('paper io') || safeTitle.toLowerCase().includes('paper.io')) {
    return {
      src: 'https://7zeb.github.io/homework/index.html',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'https://ubghyper.github.io/GameList.github.io/Paper-IO-2/'
      ]
    };
  }

  if (safeId.includes('getting-over-it') || safeTitle.toLowerCase().includes('getting over it')) {
    return {
      src: 'https://7zeb.github.io/homework/index.html',
      mirrors: [
        'https://7zeb.github.io/homework/index.html',
        'games/getting-over-it.html',
        'https://freeonlinewebtools.github.io/gamelist6.github.io/Getting-Over-It/',
        'https://ubg98.github.io/GettingOverIt/'
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

  // Papa's Restaurant Management Series
  if (safeId.includes('papas-scooperia') || safeId.includes('papa-scoop')) {
    return {
      src: 'games/papas-scooperia.html',
      mirrors: [
        'games/papas-scooperia.html',
        'games/flash-player.html?swf=https://raw.githubusercontent.com/sz-games/Games9/main/papasscooperia.swf&title=Papa%27s+Scooperia'
      ]
    };
  }

  if (safeId.includes('freezeria')) {
    return {
      src: 'games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasfreezeria.swf&title=Papa%27s+Freezeria',
      mirrors: [
        'games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasfreezeria.swf&title=Papa%27s+Freezeria',
        'https://7zeb.github.io/homework/papasfreezeria.html'
      ]
    };
  }

  if (safeId.includes('burgeria')) {
    return {
      src: 'games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasburgeria.swf&title=Papa%27s+Burgeria',
      mirrors: [
        'games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasburgeria.swf&title=Papa%27s+Burgeria',
        'https://7zeb.github.io/homework/papasburgeria.html'
      ]
    };
  }

  if (safeId.includes('sushiria')) {
    return {
      src: 'games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papassushiria.swf&title=Papa%27s+Sushiria',
      mirrors: [
        'games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papassushiria.swf&title=Papa%27s+Sushiria',
        'https://7zeb.github.io/homework/index.html'
      ]
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

  // Check if primary is blocked by Securly (contains ubg keyword, pages.dev, gamedistribution, or broken games/)
  const isBlocked = 
    currentSrc.includes('gameinclassroom') ||
    currentSrc.includes('ubghyper') ||
    currentSrc.includes('.pages.dev') ||
    currentSrc.includes('gamedistribution.com') ||
    currentSrc.includes('blobby-boi') ||
    currentSrc.includes('stroongdog') ||
    currentSrc.includes('strongdog') ||
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
    // 5. Try freeonlinewebtools verified gamelist
    else if (fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug]) {
      resolvedSrc = fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug];
    }
    // 6. Try FlyingSully mirrors
    else if (FLYINGSULLY_GAMES.has(cleanTitle) || FLYINGSULLY_GAMES.has(cleanId) || FLYINGSULLY_GAMES.has(cleanSlug)) {
      resolvedSrc = `https://flyingsully.github.io/GameList.github.io/${title.replace(/ /g, '-')}/`;
    }
    // 7. Look for clean mirrors already in mirrors array
    else {
      const cleanMirror = mirrors.find(m => 
        (m.includes('7zeb.github.io') || 
         
         m.includes('academics-study.github.io') || 
         m.includes('javaspence.github.io') || 
         m.includes('henshmi.github.io') || 
         m.includes('joe-the-chicken.github.io') || 
         m.includes('flyingsully.github.io')) &&
        !m.includes('ubghyper')
      );
      if (cleanMirror) {
        resolvedSrc = cleanMirror;
      }
    }
  }

  // Construct clean prioritized mirrors list
  const cleanMirrorsList = [
    resolvedSrc,
    ...mirrors.filter(m => m !== resolvedSrc && 
      !m.includes('blobby-boi') && 
      !m.includes('gamedistribution.com') &&
      !m.includes('gameinclassroom') &&
      m !== 'games/paper-io-2/index.html' &&
      m !== 'games/retro-bowl/index.html'
    )
  ];

  return {
    src: resolvedSrc,
    mirrors: cleanMirrorsList
  };
}
