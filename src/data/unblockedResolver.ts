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
  "blockblast": "games/block-blast.html",
  "magictiles3": "games/magic-tiles-3.html",
  "speedstars": "games/speed-stars.html",
  "turbostars": "games/turbo-stars.html",
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
  "worldshardestgame": "games/worlds-hardest-game.html?edition=1",
  "worldshardestgame2": "games/worlds-hardest-game.html?edition=2",
  "worldshardestgame3": "games/worlds-hardest-game.html?edition=3",
  "worldshardestgame4": "games/worlds-hardest-game.html?edition=4",
  "fruitninja": "games/fruit-ninja.html",
  "mario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario63": "https://ubghyper.github.io/GameList.github.io/Super-Mario-63/",
  "supermario64": "https://7zeb.github.io/homework/sm64/",
  "supermariobros": "https://7zeb.github.io/homework/mario-game/index.html",
  "blackjack": "https://flyingsully.github.io/GameList.github.io/Blackjack/",
  "happywheels": "games/happy-wheels.html",
  "dumbwaystodie": "games/dumb-ways-to-die.html",
  "hooproyale": "https://ubghyper.github.io/GameList.github.io/Hoop-Royale/",
  "asmallworldcup": "games/a-small-world-cup.html",
  "stickmerge": "https://gameinclassroom.github.io/stick-merge/",
  "stickmerge2": "https://gameinclassroom.github.io/stick-merge/",
  "sausageflip": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "sausagerun": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "bindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "ducklife4": "https://gameinclassroom.github.io/duck-life-4/",
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
  "eggycar", "gunmayham2", "happywheels", "ironsnout"
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
  "games/buckshot-roulette.html",
  "games/worlds-hardest-game.html",
  "games/block-blast.html",
  "games/magic-tiles-3.html",
  "games/speed-stars.html",
  "games/turbo-stars.html",
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
      src: 'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked/',
        'https://freeonlinewebtools.github.io/gamelist3.github.io/Achievement-Unlocked/'
      ]
    };
  }

  if (safeId === 'achievement-unlocked-2' || safeTitle.toLowerCase() === 'achievement unlocked 2') {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-2/',
      mirrors: [
        'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-2/'
      ]
    };
  }

  if (safeId === 'achievement-unlocked-3' || safeTitle.toLowerCase() === 'achievement unlocked 3') {
    return {
      src: 'https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-3/',
      mirrors: [
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

  // Diep.io (Unblocked authentic local engine + clone fallbacks)
  if (safeId === 'diep-io' || safeId === 'diepio' || safeTitle.toLowerCase().includes('diep.io') || safeTitle.toLowerCase().includes('diep io')) {
    return {
      src: 'games/diep-io.html',
      mirrors: [
        'games/diep-io.html',
        'https://ilancosman.github.io/diepio-clone/',
        'https://priswall.github.io/diepio-clone/'
      ]
    };
  }

  // Happy Wheels (100% Unblocked Local Physics Runner + proxied external mirror)
  if (safeId.includes('happy-wheel') || safeId.includes('happywheel') || safeTitle.toLowerCase().includes('happy wheel')) {
    return {
      src: 'games/happy-wheels.html',
      mirrors: [
        'games/happy-wheels.html',
        'https://gameinclassroom.github.io/happy-wheels/'
      ]
    };
  }

  // Block Blast (100% Unblocked Local HTML5 8x8 Puzzle + Unity mirror)
  if (safeId.includes('block-blast') || safeId.includes('blockblast') || safeTitle.toLowerCase().includes('block blast')) {
    return {
      src: 'games/block-blast.html',
      mirrors: [
        'games/block-blast.html',
        'https://ubghyper.github.io/GameList.github.io/Block-Blast/'
      ]
    };
  }

  // Magic Tiles 3 (100% Unblocked Local HTML5 Piano Rhythm + mirror)
  if (safeId.includes('magic-tile') || safeId.includes('magictile') || safeTitle.toLowerCase().includes('magic tile')) {
    return {
      src: 'games/magic-tiles-3.html',
      mirrors: [
        'games/magic-tiles-3.html',
        'https://freeonlinewebtools.github.io/gamelist7.github.io/Magic-Tiles-3/'
      ]
    };
  }

  // Speed Stars (100% Unblocked Local HTML5 Sprint Track + mirror)
  if (safeId.includes('speed-star') || safeId.includes('speedstar') || safeTitle.toLowerCase().includes('speed star')) {
    return {
      src: 'games/speed-stars.html',
      mirrors: [
        'games/speed-stars.html',
        'https://freeonlinewebtools.github.io/gamelist6.github.io/Speed-Stars/'
      ]
    };
  }

  // Turbo Stars (100% Unblocked Local HTML5 Half-Pipe Racer + mirror)
  if (safeId.includes('turbo-star') || safeId.includes('turbostar') || safeTitle.toLowerCase().includes('turbo star')) {
    return {
      src: 'games/turbo-stars.html',
      mirrors: [
        'games/turbo-stars.html',
        'https://freeonlinewebtools.github.io/gamelist4.github.io/Turbo-Stars/'
      ]
    };
  }

  // The World's Hardest Game Series (Editions 1, 2, 3, 4 - Unblocked Local HTML5 + Ruffle SWF Mirrors)
  if (safeId.includes('worlds-hardest') || safeId.includes('worldshardest') || safeTitle.toLowerCase().includes("world's hardest") || safeTitle.toLowerCase().includes('worlds hardest')) {
    const lowerT = safeTitle.toLowerCase();
    const ed = (safeId.includes('4') || lowerT.includes('4')) ? 4
      : (safeId.includes('3') || lowerT.includes('3')) ? 3
      : (safeId.includes('2') || lowerT.includes('2')) ? 2
      : 1;
    const localUrl = `games/worlds-hardest-game.html?edition=${ed}`;
    const whgMirrors = [localUrl];
    if (ed === 1) whgMirrors.push('games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Worlds-Hardest-Game/Worlds-Hardest-Game.swf&title=The+World%27s+Hardest+Game');
    if (ed === 3) whgMirrors.push('games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Worlds-Hardest-Game-3/Worlds-Hardest-Game-3.swf&title=The+World%27s+Hardest+Game+3');
    if (ed === 4) whgMirrors.push('games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Worlds-Hardest-Game-4/Worlds-Hardest-Game-4.swf&title=The+World%27s+Hardest+Game+4');
    return { src: localUrl, mirrors: whgMirrors };
  }

  // Agar.io (Real Agar.io engine + bots, mass, split mechanics & proxy)
  if (safeId === 'agar-io' || safeId === 'agario' || safeTitle.toLowerCase().includes('agar.io') || safeTitle.toLowerCase().includes('agar io')) {
    return {
      src: 'https://7zeb.github.io/homework/agariolite.html',
      mirrors: [
        'https://7zeb.github.io/homework/agariolite.html',
        "https://7zeb.github.io/homework/agariolite.html",
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
        "https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/",
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
        "https://7zeb.github.io/homework/holeio.html"
      ]
    };
  }

  // Snowball.io / Snowbattle
  if (safeId.includes('snowball') || safeId.includes('snowbattle') || safeTitle.toLowerCase().includes('snowball')) {
    return {
      src: 'https://7zeb.github.io/homework/snowballio.html',
      mirrors: [
        'https://7zeb.github.io/homework/snowballio.html',
        "https://7zeb.github.io/homework/snowballio.html"
      ]
    };
  }

  // Territorial.io
  if (safeId.includes('territorial') || safeTitle.toLowerCase().includes('territorial')) {
    return {
      src: 'https://7zeb.github.io/homework/territorialio.html',
      mirrors: [
        'https://7zeb.github.io/homework/territorialio.html',
        "https://7zeb.github.io/homework/territorialio.html"
      ]
    };
  }

  // State.io
  if (safeId.includes('state-io') || safeId.includes('stateio') || safeTitle.toLowerCase().includes('state io') || safeTitle.toLowerCase().includes('state.io')) {
    return {
      src: 'https://7zeb.github.io/homework/stateio.html',
      mirrors: [
        'https://7zeb.github.io/homework/stateio.html',
        "https://7zeb.github.io/homework/stateio.html"
      ]
    };
  }

  // Clean Up IO
  if (safeId.includes('cleanup') || safeId.includes('clean-up') || safeTitle.toLowerCase().includes('clean up')) {
    return {
      src: 'https://7zeb.github.io/homework/cleanupio.html',
      mirrors: [
        'https://7zeb.github.io/homework/cleanupio.html',
        "https://7zeb.github.io/homework/cleanupio.html"
      ]
    };
  }

  // EvoWars.io
  if (safeId.includes('evowars') || safeTitle.toLowerCase().includes('evowars')) {
    return {
      src: 'https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/',
      mirrors: [
        'https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/',
        "https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/"
      ]
    };
  }

  // Zombs Royale
  if (safeId.includes('zombs') || safeTitle.toLowerCase().includes('zombs')) {
    return {
      src: 'https://gameinclassroom.github.io/zombs-royale-io/',
      mirrors: [
        'https://gameinclassroom.github.io/zombs-royale-io/',
        "https://gameinclassroom.github.io/zombs-royale-io/"
      ]
    };
  }

  // Shell Shockers
  if (safeId.includes('shellshocker') || safeId.includes('shell-shocker') || safeTitle.toLowerCase().includes('shell shock')) {
    return {
      src: 'https://academics-study.github.io/shellshockers/',
      mirrors: [
        'https://academics-study.github.io/shellshockers/',
        "https://academics-study.github.io/shellshockers/"
      ]
    };
  }

  // BrawlGuys.io
  if (safeId.includes('brawlguys') || safeTitle.toLowerCase().includes('brawlguys')) {
    return {
      src: 'https://gameinclassroom.github.io/brawlguys-io/',
      mirrors: [
        'https://gameinclassroom.github.io/brawlguys-io/',
        "https://gameinclassroom.github.io/brawlguys-io/"
      ]
    };
  }

  // Tall.io
  if (safeId.includes('tall-io') || safeId.includes('tallio') || safeTitle.toLowerCase().includes('tall.io') || safeTitle.toLowerCase().includes('tall io')) {
    return {
      src: 'https://gameinclassroom.github.io/tall-io/',
      mirrors: [
        'https://gameinclassroom.github.io/tall-io/',
        "https://gameinclassroom.github.io/tall-io/"
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
        "https://gameinclassroom.github.io/bloons-tower-defense-1/",
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
        "https://ubghyper.github.io/GameList.github.io/Bloonstd-2/"
      ]
    };
  }

  if (safeId === 'bloons-tower-defence-3' || safeId === 'bloonstd3' || safeId === 'btd-3' || safeTitle.toLowerCase().includes('bloons tower defence 3') || safeTitle.toLowerCase().includes('bloons td 3')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD3.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD3.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-3/',
        "https://ubghyper.github.io/GameList.github.io/Bloonstd-3/"
      ]
    };
  }

  if (safeId === 'btd-4' || safeId === 'bloons-td-4' || safeId === 'bloonstd4' || safeTitle.toLowerCase().includes('bloons td 4')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD4.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD4.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-4/',
        "https://ubghyper.github.io/GameList.github.io/Bloonstd-4/"
      ]
    };
  }

  if (safeId === 'bloons-td-5' || safeId === 'bloonstd5' || safeId === 'btd-5' || safeTitle.toLowerCase().includes('bloons td 5')) {
    return {
      src: 'https://7zeb.github.io/homework/bloonsTD5.html',
      mirrors: [
        'https://7zeb.github.io/homework/bloonsTD5.html',
        'https://ubghyper.github.io/GameList.github.io/Bloonstd-5/',
        "https://ubghyper.github.io/GameList.github.io/Bloonstd-5/"
      ]
    };
  }

  // Buckshot Roulette (Real Godot WebGL build with chunked jsDelivr loader + mirror fallbacks)
  if (
    safeId.includes('buckshot') ||
    safeTitle.toLowerCase().includes('buckshot')
  ) {
    return {
      src: 'games/buckshot-roulette.html',
      mirrors: [
        'games/buckshot-roulette.html',
        'https://freeonlinewebtools.github.io/gamelist2.github.io/buckshot-roulette/',
        'https://ubghyper.github.io/g/Buckshot-Roulete/'
      ]
    };
  }

  // Duck Life Series (Verified working Ruffle SWFs on jsDelivr CDN + fallbacks)
  if (safeId === 'duck-life' || safeId === 'ducklife' || safeId === 'duck-life-1' || safeTitle.toLowerCase() === 'duck life' || safeTitle.toLowerCase() === 'ducklife') {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/BinBashBanana/gstore@master/ducklife.swf&title=Duck+Life';
    return {
      src: swf,
      mirrors: [
        swf,
        'https://duck-life.pages.dev/',
        'https://gameinclassroom.github.io/duck-life/'
      ]
    };
  }

  if (safeId === 'duck-life-2' || safeId === 'ducklife2' || safeId === 'strongdog-ducklife2' || safeTitle.toLowerCase().includes('duck life 2') || safeTitle.toLowerCase().includes('ducklife 2')) {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-2/ducklife2.swf&title=Duck+Life+2';
    return {
      src: swf,
      mirrors: [
        swf,
        'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/BinBashBanana/gstore@master/ducklife2.swf&title=Duck+Life+2',
        'https://ubghyper.github.io/g/Duck-Life-2/'
      ]
    };
  }

  if (safeId === 'duck-life-3' || safeId === 'ducklife3' || safeId === 'strongdog-ducklife3' || safeTitle.toLowerCase().includes('duck life 3') || safeTitle.toLowerCase().includes('ducklife 3')) {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-3/ducklife3.swf&title=Duck+Life+3';
    return {
      src: swf,
      mirrors: [
        swf,
        'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/BinBashBanana/gstore@master/ducklife3.swf&title=Duck+Life+3',
        'https://ubghyper.github.io/g/Duck-Life-3/'
      ]
    };
  }

  if (safeId === 'duck-life-4' || safeId === 'ducklife4' || safeTitle.toLowerCase().includes('duck life 4') || safeTitle.toLowerCase().includes('ducklife 4')) {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-4/ducklife4.swf&title=Duck+Life+4';
    return {
      src: swf,
      mirrors: [
        swf,
        'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/BinBashBanana/gstore@master/ducklife4.swf&title=Duck+Life+4',
        'https://ubghyper.github.io/g/Duck-Life-4/'
      ]
    };
  }

  if (safeId === 'duck-life-5' || safeId === 'ducklife5' || safeTitle.toLowerCase().includes('duck life 5') || safeTitle.toLowerCase().includes('treasure hunt')) {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-5/Duck-Life-5.swf&title=Duck+Life+5+Treasure+Hunt';
    return {
      src: swf,
      mirrors: [
        swf,
        'https://ubghyper.github.io/g/Duck-Life-5/'
      ]
    };
  }

  if (safeId.includes('duck-life-space') || safeTitle.toLowerCase().includes('duck life: space') || safeTitle.toLowerCase().includes('duck life space')) {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-4/ducklife4.swf&title=Duck+Life+Space';
    return {
      src: swf,
      mirrors: [
        swf,
        'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-5/Duck-Life-5.swf&title=Duck+Life+Space'
      ]
    };
  }

  if (safeId.includes('duck-life-battle') || safeTitle.toLowerCase().includes('duck life: battle') || safeTitle.toLowerCase().includes('duck life battle')) {
    const swf = 'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-5/Duck-Life-5.swf&title=Duck+Life+Battle';
    return {
      src: swf,
      mirrors: [
        swf,
        'games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Duck-Life-3/ducklife3.swf&title=Duck+Life+Battle'
      ]
    };
  }

  // Deep Sleep Trilogy (Scriptwelder Classics - Clean Player Without Stuck Splash)
  if (safeId.includes('deep-sleep-3') || safeTitle.toLowerCase().includes('deep sleep 3')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Deep-Sleep-3/deep-sleep-3.swf&title=Deep+Sleep+3',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Deep-Sleep-3/deep-sleep-3.swf&title=Deep+Sleep+3'
      ]
    };
  }
  if (safeId.includes('deep-sleep-2') || safeTitle.toLowerCase().includes('deep sleep 2')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Deep-Sleep-2/deepsleep2.swf&title=Deep+Sleep+2',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Deep-Sleep-2/deepsleep2.swf&title=Deep+Sleep+2'
      ]
    };
  }
  if (safeId.includes('deep-sleep') || safeTitle.toLowerCase().includes('deep sleep')) {
    return {
      src: 'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Deep-Sleep-1/deepsleep1.swf&title=Deep+Sleep+1',
      mirrors: [
        'games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Deep-Sleep-1/deepsleep1.swf&title=Deep+Sleep+1'
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
        "https://gameinclassroom.github.io/fireboy-watergirl-3-ice-temple/"
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-2' || safeId === 'fireboy-and-watergirl-2-light-temple' || safeTitle.toLowerCase().includes('watergirl 2') || safeTitle.toLowerCase().includes('light temple')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/',
        "https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/"
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-4' || safeTitle.toLowerCase().includes('watergirl 4') || safeTitle.toLowerCase().includes('crystal temple')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/',
        "https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/"
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-5' || safeTitle.toLowerCase().includes('watergirl 5') || safeTitle.toLowerCase().includes('elements')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/',
        "https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/"
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl-6' || safeTitle.toLowerCase().includes('watergirl 6') || safeTitle.toLowerCase().includes('fairy tales')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/',
        "https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/"
      ]
    };
  }

  if (safeId === 'fireboy-and-watergirl' || safeId === 'fireboy-and-watergirl-1' || safeTitle.toLowerCase().includes('watergirl')) {
    return {
      src: 'https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/',
      mirrors: [
        'https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/',
        "https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/"
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
        "https://gameinclassroom.github.io/papas-pizzaria/",
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
        "https://ubghyper.github.io/GameList.github.io/Cooking-Mama/"
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

  // If preserved local game (or flash/WHG player wrapper with query), keep as-is
  if (
    PRESERVED_LOCAL_GAMES.has(safeSrc) ||
    safeSrc.startsWith("games/flash-player.html") ||
    safeSrc.startsWith("games/worlds-hardest-game.html")
  ) {
    return { src: safeSrc, mirrors: [safeSrc, ...safeMirrors.filter(m => m !== safeSrc)] };
  }

  // 1. Direct explicit fix map check (handles broken 404s, SWF upgrades, and local overrides)
  if (fixMap[safeId]) {
    const fixedUrl = fixMap[safeId];
    return { src: fixedUrl, mirrors: [fixedUrl, ...safeMirrors.filter(m => m !== fixedUrl)] };
  }

  const cleanTitle = cleanText(safeTitle);
  const cleanId = cleanText(safeId.replace(/^potatoes-/, ""));
  const cleanSlug = cleanText(safeSrc.replace(/https?:\/\/[^\/]+\/[^\/]+\/([^\/]+)\/?.*/, "$1"));

  if (fixMap[cleanTitle] || fixMap[cleanId] || fixMap[cleanSlug]) {
    const fixedUrl = fixMap[cleanTitle] || fixMap[cleanId] || fixMap[cleanSlug];
    return { src: fixedUrl, mirrors: [fixedUrl, ...safeMirrors.filter(m => m !== fixedUrl)] };
  }

  const isDead7zebMasterLoader =
    safeSrc.includes('7zeb.github.io/homework/speedstars.html') ||
    safeSrc.includes('7zeb.github.io/homework/crazy-taxi');

  // Check if primary is blocked or unreliable (ubghyper, pages.dev, freeonlinewebtools portals/jqrg, dead paths)
  const isBlocked =
    safeSrc.includes('ubghyper') ||
    safeSrc.includes('.pages.dev') ||
    safeSrc.includes('gamedistribution.com') ||
    safeSrc.includes('blobby-boi') ||
    safeSrc.includes('stroongdog') ||
    safeSrc.includes('strongdog') ||
    safeSrc.includes('blockblastunblockedgames') ||
    isDead7zebMasterLoader ||
    (safeSrc.startsWith('games/') && !PRESERVED_LOCAL_GAMES.has(safeSrc)) ||
    safeSrc === '';

  let resolvedSrc = safeSrc;

  // 1. Prioritize verified 7zeb unblocked endpoints FIRST if matched (excluding known 404/broken master-loader stubs)
  const szMatch = sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug];
  if (szMatch && !szMatch.includes('speedstars.html') && !szMatch.includes('crazy-taxi')) {
    resolvedSrc = szMatch;
  } else if (isBlocked) {
    if (gicMap[cleanTitle] || gicMap[cleanId] || gicMap[cleanSlug]) {
      resolvedSrc = gicMap[cleanTitle] || gicMap[cleanId] || gicMap[cleanSlug];
    } else if (fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug]) {
      resolvedSrc = fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug];
    } else if (ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug]) {
      resolvedSrc = ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug];
    } else if (FLYINGSULLY_GAMES.has(cleanTitle) || FLYINGSULLY_GAMES.has(cleanId) || FLYINGSULLY_GAMES.has(cleanSlug)) {
      resolvedSrc = `https://flyingsully.github.io/GameList.github.io/${safeTitle.replace(/ /g, '-')}/`;
    } else {
      const cleanMirror = safeMirrors.find(m =>
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

  // Construct clean prioritized mirrors list (with automatic unblocked server proxy when Express backend is present)
  const validMirrors = [
    resolvedSrc,
    ...safeMirrors.filter(m => m !== resolvedSrc &&
      !m.includes('blobby-boi') &&
      !m.includes('gamedistribution.com') &&
      m !== 'games/paper-io-2/index.html' &&
      m !== 'games/retro-bowl/index.html'
    )
  ];

  // Auto-prefer upgraded same-origin proxy FIRST on Express servers for commonly school-blocked or jqrg/githack/.br/pages.dev hosts
  const isStatic = typeof window !== 'undefined' && Boolean(window.location?.hostname?.endsWith('github.io') || window.location?.protocol === 'file:');
  const needsSchoolOrSdkProxy =
    resolvedSrc.includes('freeonlinewebtools.github.io') ||
    resolvedSrc.includes('ubghyper.github.io') ||
    resolvedSrc.includes('.pages.dev');

  let finalSrc = resolvedSrc;
  if (resolvedSrc.startsWith('http://') || resolvedSrc.startsWith('https://')) {
    const proxyMirror = !isStatic ? `/api/proxy/game?url=${encodeURIComponent(resolvedSrc)}` : resolvedSrc;
    if (!isStatic && needsSchoolOrSdkProxy) {
      finalSrc = proxyMirror;
      if (!validMirrors.includes(proxyMirror)) {
        validMirrors.unshift(proxyMirror);
      }
    } else if (!validMirrors.includes(proxyMirror)) {
      validMirrors.push(proxyMirror);
    }
  }

  return {
    src: finalSrc,
    mirrors: validMirrors
  };
}
