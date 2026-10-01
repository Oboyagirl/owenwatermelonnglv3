import sevenZebMap from './sevenZebGamesMap.json';
import freeWebToolsMap from './freeWebToolsMap.json';

const sMap = sevenZebMap as Record<string, string>;
const fMap = freeWebToolsMap as Record<string, string>;

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
  "stickmanhook": "https://7zeb.github.io/homework/steal-a-brainrot/go/stickman-hook.html",
  "blockblast": "https://freeonlinewebtools.github.io/blockblastunblockedgames.github.io/",
  "ovo": "https://7zeb.github.io/homework/ovo2.html",
  "eaglercraft": "https://7zeb.github.io/homework/mc1_8.html",
  "eaglercraft188": "https://7zeb.github.io/homework/mc1_8.html",
  "minecraft": "https://7zeb.github.io/homework/mc1_8.html",
  "basketballlegends": "https://joe-the-chicken.github.io/basketball-stars/",
  "basketballlegends2020": "https://joe-the-chicken.github.io/basketball-stars/",
  "vex": "https://7zeb.github.io/homework/vex7.html",
  "vex1": "https://7zeb.github.io/homework/vex7.html",
  "vex2": "https://7zeb.github.io/homework/vex7.html",
  "vex3": "https://7zeb.github.io/homework/vex7.html",
  "vex4": "https://7zeb.github.io/homework/steal-a-brainrot/go/vex-4.html",
  "vex5": "https://7zeb.github.io/homework/steal-a-brainrot/go/vex-5.html",
  "vex6": "https://7zeb.github.io/homework/steal-a-brainrot/go/vex-6.html",
  "vex7": "https://7zeb.github.io/homework/vex7.html",
  "vex8": "https://7zeb.github.io/homework/vex8.html",
  "worldshardestgame": "https://7zeb.github.io/homework/steal-a-brainrot/go/worlds-hardest-game-2.html",
  "worldshardestgame2": "https://7zeb.github.io/homework/steal-a-brainrot/go/worlds-hardest-game-2.html",
  "worldshardestgame3": "https://7zeb.github.io/homework/steal-a-brainrot/go/worlds-hardest-game-3.html",
  "fruitninja": "https://freeonlinewebtools.github.io/gamelist4.github.io/Fruit-Ninja/",
  "mario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario63": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario64": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermariobros": "https://7zeb.github.io/homework/mario-game/index.html",
  "blackjack": "https://flyingsully.github.io/GameList.github.io/Blackjack/",
  "happywheels": "https://flyingsully.github.io/GameList.github.io/Happy-Wheels/",
  "stickmerge": "https://7zeb.github.io/homework/steal-a-brainrot/go/stick-merge.html",
  "stickmerge2": "https://7zeb.github.io/homework/steal-a-brainrot/go/stick-merge.html",
  "bindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "ducklife4": "https://flyingsully.github.io/GameList.github.io/Duck-Life-4/",
  "cluster-rush": "https://freeonlinewebtools.github.io/gamelist2.github.io/Cluster-Rush/",
  "clusterrush": "https://freeonlinewebtools.github.io/gamelist2.github.io/Cluster-Rush/",
  "cuphead": "https://freeonlinewebtools.github.io/gamelist2.github.io/Cuphead/",
  "badicecream": "https://freeonlinewebtools.github.io/gamelist2.github.io/Bad-Ice-Cream/",
  "badicecream2": "https://freeonlinewebtools.github.io/gamelist3.github.io/Bad-Ice-Cream-2/",
  "badicecream3": "https://freeonlinewebtools.github.io/gamelist3.github.io/Bad-Ice-Cream-3/",
  "candycrush": "https://freeonlinewebtools.github.io/gamelist3.github.io/Candy-Crush/",
  "deathrun3d": "https://freeonlinewebtools.github.io/gamelist3.github.io/Death-Run-3D/",
  "dadish": "https://freeonlinewebtools.github.io/gamelist3.github.io/Dadish/",
  "dadish2": "https://freeonlinewebtools.github.io/gamelist2.github.io/Dadish-2/",
  "dadish3": "https://freeonlinewebtools.github.io/gamelist2.github.io/Dadish-3/",
  "bladeball": "https://freeonlinewebtools.github.io/gamelist3.github.io/Blade-Ball/",
  "blockpost": "https://freeonlinewebtools.github.io/gamelist3.github.io/Blockpost/",
  "boxingrandom": "https://freeonlinewebtools.github.io/gamelist3.github.io/Boxing-Random/"
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
  "games/pong.html"
]);

export function resolveGameSource(
  id: string,
  title: string,
  currentSrc: string,
  mirrors: string[] = []
): { src: string; mirrors: string[] } {
  // If preserved local game, keep as-is
  if (PRESERVED_LOCAL_GAMES.has(currentSrc)) {
    return { src: currentSrc, mirrors: [currentSrc, ...mirrors.filter(m => m !== currentSrc)] };
  }

  // Check if primary is blocked by Securly (contains ubg keyword, pages.dev, gamedistribution, or broken games/)
  const isBlocked = 
    currentSrc.includes('ubghyper') ||
    currentSrc.includes('.pages.dev') ||
    currentSrc.includes('gamedistribution.com') ||
    currentSrc.includes('blobby-boi') ||
    (currentSrc.startsWith('games/') && !PRESERVED_LOCAL_GAMES.has(currentSrc)) ||
    currentSrc === '';

  let resolvedSrc = currentSrc;

  if (isBlocked) {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanId = id.replace(/^potatoes-/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSlug = currentSrc.replace(/https?:\/\/[^\/]+\/[^\/]+\/([^\/]+)\/?.*/, '$1').toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Try Academics-Study verified endpoints
    if (ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug]) {
      resolvedSrc = ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug];
    }
    // 2. Try 7zeb verified endpoints (proven to work on school iPads)
    else if (sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug]) {
      resolvedSrc = sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug];
    }
    // 3. Try freeonlinewebtools verified gamelist (proven to work for Kindergarten)
    else if (fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug]) {
      resolvedSrc = fMap[cleanTitle] || fMap[cleanId] || fMap[cleanSlug];
    }
    // 4. Try FlyingSully mirrors
    else if (FLYINGSULLY_GAMES.has(cleanTitle) || FLYINGSULLY_GAMES.has(cleanId) || FLYINGSULLY_GAMES.has(cleanSlug)) {
      resolvedSrc = `https://flyingsully.github.io/GameList.github.io/${title.replace(/ /g, '-')}/`;
    }
    // 5. Look for clean mirrors already in mirrors array
    else {
      const cleanMirror = mirrors.find(m => 
        m.includes('7zeb.github.io') || 
        m.includes('freeonlinewebtools.github.io') || 
        m.includes('academics-study.github.io') || 
        m.includes('javaspence.github.io') || 
        m.includes('henshmi.github.io') || 
        m.includes('joe-the-chicken.github.io') || 
        m.includes('gameinclassroom.github.io') ||
        m.includes('flyingsully.github.io')
      );
      if (cleanMirror) {
        resolvedSrc = cleanMirror;
      }
    }
  }

  // Construct clean prioritized mirrors list
  const cleanMirrorsList = [
    resolvedSrc,
    ...mirrors.filter(m => m !== resolvedSrc && !m.includes('ubghyper') && !m.includes('blobby-boi') && !m.includes('gamedistribution.com'))
  ];

  return {
    src: resolvedSrc,
    mirrors: cleanMirrorsList
  };
}
