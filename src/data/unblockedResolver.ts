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
  "stickmanhook": "https://freeonlinewebtools.github.io/gamelist3.github.io/Stickman-Hook/",
  "stickmanclimb": "https://gameinclassroom.github.io/stickman-climb-2/",
  "stickmanclimb2": "https://gameinclassroom.github.io/stickman-climb-2/",
  "peopleplayground": "https://7zeb.github.io/homework/melonplayground.html",
  "blockblast": "https://freeonlinewebtools.github.io/blockblastunblockedgames.github.io/",
  "ovo": "https://7zeb.github.io/homework/ovo2.html",
  "eaglercraft": "https://7zeb.github.io/homework/mc1_8.html",
  "eaglercraft188": "https://7zeb.github.io/homework/mc1_8.html",
  "minecraft": "https://7zeb.github.io/homework/mc1_8.html",
  "basketballlegends": "https://joe-the-chicken.github.io/basketball-stars/",
  "basketballlegends2020": "https://joe-the-chicken.github.io/basketball-stars/",
  "vex": "https://gameinclassroom.github.io/vex-3/",
  "vex1": "https://ubghyper.github.io/GameList.github.io/Vex-1/",
  "vex2": "https://ubghyper.github.io/GameList.github.io/Vex-2/",
  "vex3": "https://gameinclassroom.github.io/vex-3/",
  "vex4": "https://gameinclassroom.github.io/vex-4/",
  "vex5": "https://gameinclassroom.github.io/vex-5/",
  "vex6": "https://gameinclassroom.github.io/vex-6/",
  "vex7": "https://7zeb.github.io/homework/vex7.html",
  "vex8": "https://7zeb.github.io/homework/vex8.html",
  "worldshardestgame": "https://freeonlinewebtools.github.io/gamelist3.github.io/Worlds-Hardest-Game/",
  "worldshardestgame2": "https://freeonlinewebtools.github.io/gamelist3.github.io/Worlds-Hardest-Game-2/",
  "worldshardestgame3": "https://freeonlinewebtools.github.io/gamelist3.github.io/Worlds-Hardest-Game-3/",
  "fruitninja": "games/fruit-ninja.html",
  "mario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario63": "https://ubghyper.github.io/GameList.github.io/Super-Mario-63/",
  "supermario64": "https://7zeb.github.io/homework/sm64/",
  "supermariobros": "https://7zeb.github.io/homework/mario-game/index.html",
  "blackjack": "https://flyingsully.github.io/GameList.github.io/Blackjack/",
  "happywheels": "https://gameinclassroom.github.io/happy-wheels/",
  "dumbwaystodie": "games/dumb-ways-to-die.html",
  "hooproyale": "https://ubghyper.github.io/GameList.github.io/Hoop-Royale/",
  "asmallworldcup": "games/a-small-world-cup.html",
  "stickmerge": "https://gameinclassroom.github.io/stick-merge/",
  "stickmerge2": "https://gameinclassroom.github.io/stick-merge/",
  "sausageflip": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "sausagerun": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "bindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "ducklife4": "games/duck-life-4.html",
  "clusterrush": "https://gameinclassroom.github.io/cluster-rush/",
  "cuphead": "https://freeonlinewebtools.github.io/gamelist2.github.io/Cuphead/",
  "badicecream": "https://freeonlinewebtools.github.io/gamelist8.github.io/Bad-Ice-Cream/",
  "badicecream2": "https://freeonlinewebtools.github.io/gamelist8.github.io/Bad-Ice-Cream-2/",
  "badicecream3": "https://freeonlinewebtools.github.io/gamelist8.github.io/Bad-Ice-Cream-3/",
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
  "games/boxing-random.html",
  "games/spaceflight-simulator.html",
  "games/duck-life-1.html",
  "games/duck-life-2.html",
  "games/duck-life-3.html",
  "games/duck-life-4.html",
  "games/duck-life-5.html",
  "games/sawyer-for-sawyer.html",
  "games/a-small-world-cup.html"
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
      src: 'https://7zeb.github.io/homework/paperio2.html',
      mirrors: [
        'https://7zeb.github.io/homework/paperio2.html',
        'https://gameinclassroom.github.io/paper-io-2/'
      ]
    };
  }

  if (safeId.includes('getting-over-it') || safeTitle.toLowerCase().includes('getting over it')) {
    return {
      src: 'https://gameinclassroom.github.io/getting-over-it/',
      mirrors: [
        'https://gameinclassroom.github.io/getting-over-it/',
        'games/getting-over-it.html',
        'https://freeonlinewebtools.github.io/gamelist6.github.io/Getting-Over-It/'
      ]
    };
  }

  if (safeId === 'achievement-unlocked' || safeTitle.toLowerCase() === 'achievement unlocked') {
    return {
      src: 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Achievement-Unlocked/achievementunlocked.swf&title=Achievement+Unlocked',
      mirrors: [
        'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Achievement-Unlocked/achievementunlocked.swf&title=Achievement+Unlocked'
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

  // Space Flight Simulator (HTML5 local physics + multi-tier mirrors)
  if (safeId.includes('spaceflight-simulator') || safeId.includes('space-flight-simulator') || safeId === 'spaceflightsim' || safeTitle.toLowerCase().includes('spaceflight simulator') || safeTitle.toLowerCase().includes('space flight sim')) {
    return {
      src: 'games/spaceflight-simulator.html',
      mirrors: [
        'games/spaceflight-simulator.html',
        'https://astronautag.github.io/spaceflight-simulator/',
        'https://7zeb.github.io/homework/3Dflightsimulator.html',
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/flashflightsimulator.swf&title=Flash+Flight+Simulator'
      ]
    };
  }

  // Diep.io (Real official game + verified clones & school proxy)
  if (safeId === 'diep-io' || safeId === 'diepio' || safeTitle.toLowerCase().includes('diep.io') || safeTitle.toLowerCase().includes('diep io')) {
    return {
      src: 'https://diep.io',
      mirrors: [
        'https://diep.io',
        'https://ilancosman.github.io/diepio-clone/',
        'https://priswall.github.io/diepio-clone/',
        '/api/proxy/game?url=https://diep.io',
        'games/diep-io.html'
      ]
    };
  }

  // Agar.io (Real Agar.io engine + bots, mass, split mechanics & proxy)
  if (safeId === 'agar-io' || safeId === 'agario' || safeTitle.toLowerCase().includes('agar.io') || safeTitle.toLowerCase().includes('agar io')) {
    return {
      src: 'https://7zeb.github.io/homework/agariolite.html',
      mirrors: [
        'https://7zeb.github.io/homework/agariolite.html',
        '/api/proxy/game?url=https://7zeb.github.io/homework/agariolite.html',
        'games/agar-io.html'
      ]
    };
  }

  // Slither.io (Real official client + unblocked mirror & proxy)
  if (safeId.includes('slither') || safeTitle.toLowerCase().includes('slither')) {
    return {
      src: 'https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/',
      mirrors: [
        'https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/',
        '/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/',
        'games/slither-io.html'
      ]
    };
  }

  // Hole.io
  if (safeId.includes('hole-io') || safeId.includes('holeio') || safeTitle.toLowerCase().includes('hole io') || safeTitle.toLowerCase().includes('hole.io')) {
    return {
      src: 'https://7zeb.github.io/homework/holeio.html',
      mirrors: [
        'https://7zeb.github.io/homework/holeio.html',
        'https://gameinclassroom.github.io/hole-io/',
        '/api/proxy/game?url=https://7zeb.github.io/homework/holeio.html'
      ]
    };
  }

  // Snowball.io / Snowbattle
  if (safeId.includes('snowball') || safeId.includes('snowbattle') || safeTitle.toLowerCase().includes('snowball')) {
    return {
      src: 'https://7zeb.github.io/homework/snowballio.html',
      mirrors: [
        'https://7zeb.github.io/homework/snowballio.html',
        '/api/proxy/game?url=https://7zeb.github.io/homework/snowballio.html'
      ]
    };
  }

  // Territorial.io
  if (safeId.includes('territorial') || safeTitle.toLowerCase().includes('territorial')) {
    return {
      src: 'https://7zeb.github.io/homework/territorialio.html',
      mirrors: [
        'https://7zeb.github.io/homework/territorialio.html',
        '/api/proxy/game?url=https://7zeb.github.io/homework/territorialio.html'
      ]
    };
  }

  // State.io
  if (safeId.includes('state-io') || safeId.includes('stateio') || safeTitle.toLowerCase().includes('state io') || safeTitle.toLowerCase().includes('state.io')) {
    return {
      src: 'https://7zeb.github.io/homework/stateio.html',
      mirrors: [
        'https://7zeb.github.io/homework/stateio.html',
        '/api/proxy/game?url=https://7zeb.github.io/homework/stateio.html'
      ]
    };
  }

  // Clean Up IO
  if (safeId.includes('cleanup') || safeId.includes('clean-up') || safeTitle.toLowerCase().includes('clean up')) {
    return {
      src: 'https://7zeb.github.io/homework/cleanupio.html',
      mirrors: [
        'https://7zeb.github.io/homework/cleanupio.html',
        '/api/proxy/game?url=https://7zeb.github.io/homework/cleanupio.html'
      ]
    };
  }

  // EvoWars.io
  if (safeId.includes('evowars') || safeTitle.toLowerCase().includes('evowars')) {
    return {
      src: 'https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/',
      mirrors: [
        'https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/',
        '/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/'
      ]
    };
  }

  // Zombs Royale
  if (safeId.includes('zombs') || safeTitle.toLowerCase().includes('zombs')) {
    return {
      src: 'https://gameinclassroom.github.io/zombs-royale-io/',
      mirrors: [
        'https://gameinclassroom.github.io/zombs-royale-io/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/zombs-royale-io/'
      ]
    };
  }

  // Shell Shockers
  if (safeId.includes('shellshocker') || safeId.includes('shell-shocker') || safeTitle.toLowerCase().includes('shell shock')) {
    return {
      src: 'https://academics-study.github.io/shellshockers/',
      mirrors: [
        'https://academics-study.github.io/shellshockers/',
        '/api/proxy/game?url=https://academics-study.github.io/shellshockers/'
      ]
    };
  }

  // BrawlGuys.io
  if (safeId.includes('brawlguys') || safeTitle.toLowerCase().includes('brawlguys')) {
    return {
      src: 'https://gameinclassroom.github.io/brawlguys-io/',
      mirrors: [
        'https://gameinclassroom.github.io/brawlguys-io/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/brawlguys-io/'
      ]
    };
  }

  // Tall.io
  if (safeId.includes('tall-io') || safeId.includes('tallio') || safeTitle.toLowerCase().includes('tall.io') || safeTitle.toLowerCase().includes('tall io')) {
    return {
      src: 'https://gameinclassroom.github.io/tall-io/',
      mirrors: [
        'https://gameinclassroom.github.io/tall-io/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/tall-io/'
      ]
    };
  }

  // Bloons TD Series (100% Guaranteed 7zeb Unblocked HTML5/WASM)
  if (safeId === 'bloons-tower-defence' || safeId === 'bloonstd' || safeId === 'btd-1' || safeTitle.toLowerCase() === 'bloons tower defence' || safeTitle.toLowerCase() === 'bloons td') {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD.html',
        'https://gameinclassroom.github.io/bloons-tower-defense-1/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/bloons-tower-defense-1/',
        'https://ubghyper.github.io/GameList.github.io/Bloons-Tower-Defense/'
      ]
    };
  }

  if (safeId === 'bloons-tower-defence-2' || safeId === 'bloonstd2' || safeId === 'btd-2' || safeTitle.toLowerCase().includes('bloons tower defence 2') || safeTitle.toLowerCase().includes('bloons td 2')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD2.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD2.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-2/',
        '/api/proxy/game?url=https://ubghyper.github.io/GameList.github.io/Bloonstd-2/'
      ]
    };
  }

  if (safeId === 'bloons-tower-defence-3' || safeId === 'bloonstd3' || safeId === 'btd-3' || safeTitle.toLowerCase().includes('bloons tower defence 3') || safeTitle.toLowerCase().includes('bloons td 3')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD3.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD3.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-3/',
        '/api/proxy/game?url=https://ubghyper.github.io/GameList.github.io/Bloonstd-3/'
      ]
    };
  }

  if (safeId === 'btd-4' || safeId === 'bloons-td-4' || safeId === 'bloonstd4' || safeTitle.toLowerCase().includes('bloons td 4')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD4.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD4.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-4/',
        '/api/proxy/game?url=https://ubghyper.github.io/GameList.github.io/Bloonstd-4/'
      ]
    };
  }

  if (safeId === 'bloons-td-5' || safeId === 'bloonstd5' || safeId === 'btd-5' || safeTitle.toLowerCase().includes('bloons td 5')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD5.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD5.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-5/',
        '/api/proxy/game?url=https://ubghyper.github.io/GameList.github.io/Bloonstd-5/'
      ]
    };
  }

  // Duck Life Series (100% Reliable Local Ruffle WebAssembly Engines with Local SWFs)
  if (safeId === 'duck-life' || safeId === 'ducklife' || safeId === 'duck-life-1' || safeTitle.toLowerCase() === 'duck life') {
    return {
      src: 'games/duck-life-1.html',
      mirrors: [
        'games/duck-life-1.html',
        'games/flash-player.html?swf=games/swfs/ducklife1.swf&title=Duck+Life',
        '/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/Duck-Life/'
      ]
    };
  }

  if (safeId === 'duck-life-2' || safeId === 'ducklife2' || safeTitle.toLowerCase().includes('duck life 2') || safeTitle.toLowerCase().includes('ducklife 2')) {
    return {
      src: 'games/duck-life-2.html',
      mirrors: [
        'games/duck-life-2.html',
        'games/flash-player.html?swf=games/swfs/ducklife2.swf&title=Duck+Life+2',
        '/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/Duck-Life-2/'
      ]
    };
  }

  if (safeId === 'duck-life-3' || safeId === 'ducklife3' || safeTitle.toLowerCase().includes('duck life 3') || safeTitle.toLowerCase().includes('ducklife 3')) {
    return {
      src: 'games/duck-life-3.html',
      mirrors: [
        'games/duck-life-3.html',
        'games/flash-player.html?swf=games/swfs/ducklife3.swf&title=Duck+Life+3',
        '/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/Duck-Life-3/'
      ]
    };
  }

  if (safeId === 'duck-life-4' || safeId === 'ducklife4' || safeTitle.toLowerCase().includes('duck life 4') || safeTitle.toLowerCase().includes('ducklife 4')) {
    return {
      src: 'games/duck-life-4.html',
      mirrors: [
        'games/duck-life-4.html',
        'games/flash-player.html?swf=games/swfs/ducklife4.swf&title=Duck+Life+4',
        'https://flyingsully.github.io/GameList.github.io/Duck-Life-4/'
      ]
    };
  }

  if (safeId === 'duck-life-5' || safeId === 'ducklife5' || safeTitle.toLowerCase().includes('duck life 5') || safeTitle.toLowerCase().includes('treasure hunt')) {
    return {
      src: 'games/duck-life-5.html',
      mirrors: [
        'games/duck-life-5.html',
        'games/flash-player.html?swf=games/swfs/ducklife5.swf&title=Duck+Life+5'
      ]
    };
  }

  if (safeId.includes('duck-life-space') || safeTitle.toLowerCase().includes('duck life space')) {
    return {
      src: 'games/duck-life-4.html',
      mirrors: [
        'games/duck-life-4.html',
        'games/flash-player.html?swf=games/swfs/ducklife4.swf&title=Duck+Life+Space'
      ]
    };
  }

  if (safeId.includes('duck-life-battle') || safeTitle.toLowerCase().includes('duck life battle')) {
    return {
      src: 'games/duck-life-3.html',
      mirrors: [
        'games/duck-life-3.html',
        'games/flash-player.html?swf=games/swfs/ducklife3.swf&title=Duck+Life+Battle'
      ]
    };
  }

  // A Small World Cup (Sawyer For Sawyer)
  if (safeId === 'sawyer-for-sawyer' || safeId.includes('small-world-cup') || safeTitle.toLowerCase().includes('small world cup') || safeTitle.toLowerCase().includes('sawyer for sawyer')) {
    return {
      src: 'games/a-small-world-cup.html',
      mirrors: [
        'games/a-small-world-cup.html',
        'https://gameinclassroom.github.io/a-small-world-cup/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/a-small-world-cup/'
      ]
    };
  }

  // Flash Flight Simulator
  if (safeId.includes('flash-flight') || safeTitle.toLowerCase().includes('flash flight simulator')) {
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

  // Fireboy & Watergirl series (Verified working HTML5 engines)
  if (safeId === 'fireboy-and-watergirl-3' || safeTitle.toLowerCase().includes('watergirl 3') || safeTitle.toLowerCase().includes('ice temple')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-watergirl-3-ice-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-watergirl-3-ice-temple/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/fireboy-watergirl-3-ice-temple/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-2' || safeId === 'fireboy-and-watergirl-2-light-temple' || safeTitle.toLowerCase().includes('watergirl 2') || safeTitle.toLowerCase().includes('light temple')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-4' || safeTitle.toLowerCase().includes('watergirl 4') || safeTitle.toLowerCase().includes('crystal temple')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-5' || safeTitle.toLowerCase().includes('watergirl 5') || safeTitle.toLowerCase().includes('elements')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-6' || safeTitle.toLowerCase().includes('watergirl 6') || safeTitle.toLowerCase().includes('fairy tales')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/'
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl' || safeId === 'fireboy-and-watergirl-1' || safeTitle.toLowerCase().includes('watergirl')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/'
      ]
    };
  }

  // Papa's Restaurant Management Series & Cooking Games (Direct Modern HTML5/WASM - Zero Flash)
  const lowerId = safeId.toLowerCase();
  const lowerTitle = safeTitle.toLowerCase();

  if (lowerId.includes('pizzeria') || lowerTitle.includes('pizzeria') || lowerId.includes('pizzaria') || lowerTitle.includes('pizzaria')) {
    return {
      src: 'https://gameinclassroom.github.io/papas-pizzaria/',
      mirrors: [
        'https://gameinclassroom.github.io/papas-pizzaria/',
        '/api/proxy/game?url=https://gameinclassroom.github.io/papas-pizzaria/',
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Pizzeria/papaspizzeria.swf&title=Papas+Pizzeria'
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
      src: 'https://gameinclassroom.github.io/papas-sushiria/',
      mirrors: [
        'https://gameinclassroom.github.io/papas-sushiria/',
        'https://ubghyper.github.io/GameList.github.io/Papas-Sushi/'
      ]
    };
  }

  if (lowerId.includes('scooperia') || lowerId.includes('papa-scoop') || lowerTitle.includes('scooperia')) {
    return {
      src: 'games/papas-scooperia.html',
      mirrors: [
        'games/papas-scooperia.html',
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papa-Scoop/papasscooperia.swf&title=Papas+Scooperia'
      ]
    };
  }

  if (lowerId.includes('cooking-mama') || lowerTitle.includes('cooking mama')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Cooking-Mama/cooking-mama.swf&title=Cooking+Mama',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Cooking-Mama/cooking-mama.swf&title=Cooking+Mama',
        '/api/proxy/game?url=https://ubghyper.github.io/GameList.github.io/Cooking-Mama/'
      ]
    };
  }

  if (lowerId.includes('papalouie1') || lowerId.includes('papas-louie-1') || lowerTitle.includes('papa louie 1')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Louie-1/papalouie.swf&title=Papa+Louie',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Louie-1/papalouie.swf&title=Papa+Louie'
      ]
    };
  }

  if (lowerId.includes('papalouie2') || lowerId.includes('papas-louie-2') || lowerTitle.includes('papa louie 2')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Louie-2/papalouie2.swf&title=Papa+Louie+2',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Louie-2/papalouie2.swf&title=Papa+Louie+2'
      ]
    };
  }

  if (lowerId.includes('papalouie3') || lowerId.includes('papas-louie-3') || lowerTitle.includes('papa louie 3')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Louie-3/papalouie3.swf&title=Papa+Louie+3',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Papas-Louie-3/papalouie3.swf&title=Papa+Louie+3'
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

  // Check if primary is blocked or unreliable (contains ubg keyword, pages.dev, gamedistribution, or broken games/)
  const isBlocked = 
    currentSrc.includes('ubghyper') ||
    currentSrc.includes('.pages.dev') ||
    currentSrc.includes('gamedistribution.com') ||
    currentSrc.includes('blobby-boi') ||
    currentSrc.includes('stroongdog') ||
    currentSrc.includes('strongdog') ||
    (currentSrc.startsWith('games/') && !PRESERVED_LOCAL_GAMES.has(currentSrc)) ||
    currentSrc === '';

  let resolvedSrc = currentSrc;

  // 1. Prioritize verified 7zeb unblocked endpoints FIRST if matched
  if (sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug]) {
    resolvedSrc = sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug];
  } else if (isBlocked) {
    if (gicMap[cleanTitle] || gicMap[cleanId] || gicMap[cleanSlug]) {
      resolvedSrc = gicMap[cleanTitle] || gicMap[cleanId] || gicMap[cleanSlug];
    } else if (fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug]) {
      resolvedSrc = fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug];
    } else if (ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug]) {
      resolvedSrc = ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug];
    } else if (FLYINGSULLY_GAMES.has(cleanTitle) || FLYINGSULLY_GAMES.has(cleanId) || FLYINGSULLY_GAMES.has(cleanSlug)) {
      resolvedSrc = `https://flyingsully.github.io/GameList.github.io/${title.replace(/ /g, '-')}/`;
    } else {
      const cleanMirror = mirrors.find(m => 
        (m.includes('7zeb.github.io') || 
         m.includes('gameinclassroom.github.io') ||
         m.includes('freeonlinewebtools.github.io') ||
         m.includes('academics-study.github.io') || 
         m.includes('javaspence.github.io') || 
         m.includes('henshmi.github.io') || 
         m.includes('joe-the-chicken.github.io') || 
         m.includes('flyingsully.github.io')) &&
        !m.includes('ubghyper') &&
        !m.includes('index.html')
      );
      if (cleanMirror) {
        resolvedSrc = cleanMirror;
      }
    }
  }

  // Construct clean prioritized mirrors list (with automatic unblocked server proxy fallback)
  const validMirrors = [
    resolvedSrc,
    ...mirrors.filter(m => m !== resolvedSrc && 
      !m.includes('blobby-boi') && 
      !m.includes('gamedistribution.com') &&
      m !== 'games/paper-io-2/index.html' &&
      m !== 'games/retro-bowl/index.html'
    )
  ];

  // If the primary source is an external HTTP(S) URL, add the universal school-filter proxy mirror
  if (resolvedSrc.startsWith('http://') || resolvedSrc.startsWith('https://')) {
    const proxyMirror = `/api/proxy/game?url=${encodeURIComponent(resolvedSrc)}`;
    if (!validMirrors.includes(proxyMirror)) {
      validMirrors.push(proxyMirror);
    }
  }

  return {
    src: resolvedSrc,
    mirrors: validMirrors
  };
}
