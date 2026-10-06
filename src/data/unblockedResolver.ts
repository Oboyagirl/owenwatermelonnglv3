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
  "stickmanhook": "https://gameinclassroom.github.io/stickman-hook/",
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
  "vex": "https://7zeb.github.io/homework/vex7.html",
  "vex1": "https://7zeb.github.io/homework/vex7.html",
  "vex2": "https://7zeb.github.io/homework/vex7.html",
  "vex3": "https://7zeb.github.io/homework/vex7.html",
  "vex4": "https://7zeb.github.io/homework/vex7.html",
  "vex5": "https://7zeb.github.io/homework/vex7.html",
  "vex6": "https://7zeb.github.io/homework/vex7.html",
  "vex7": "https://7zeb.github.io/homework/vex7.html",
  "vex8": "https://7zeb.github.io/homework/vex8.html",
  "worldshardestgame": "https://gameinclassroom.github.io/worlds-hardest-game-2/",
  "worldshardestgame2": "https://gameinclassroom.github.io/worlds-hardest-game-2/",
  "worldshardestgame3": "https://gameinclassroom.github.io/worlds-hardest-game-2/",
  "fruitninja": "https://gameinclassroom.github.io/fruit-ninja/",
  "mario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario63": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermario64": "https://7zeb.github.io/homework/mario-game/index.html",
  "supermariobros": "https://7zeb.github.io/homework/mario-game/index.html",
  "blackjack": "https://flyingsully.github.io/GameList.github.io/Blackjack/",
  "happywheels": "https://flyingsully.github.io/GameList.github.io/Happy-Wheels/",
  "stickmerge": "https://gameinclassroom.github.io/stick-merge/",
  "stickmerge2": "https://gameinclassroom.github.io/stick-merge/",
  "sausageflip": "https://gameinclassroom.github.io/sausage-flip/",
  "sausagerun": "https://gameinclassroom.github.io/sausage-flip/",
  "bindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "ducklife4": "https://flyingsully.github.io/GameList.github.io/Duck-Life-4/",
  "clusterrush": "https://gameinclassroom.github.io/cluster-rush/",
  "cuphead": "https://freeonlinewebtools.github.io/gamelist2.github.io/Cuphead/",
  "badicecream": "https://freeonlinewebtools.github.io/gamelist8.github.io/Bad-Ice-Cream/",
  "badicecream2": "https://gameinclassroom.github.io/bad-ice-cream-2/",
  "badicecream3": "https://gameinclassroom.github.io/bad-ice-cream-3/",
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
  "games/a-small-world-cup/index.html",
  "games/getting-over-it.html",
  "games/kindergarten.html",
  "games/kindergarten-2.html",
  "games/the-man-in-the-window.html",
  "games/case-opener.html",
  "games/flash-player.html",
  "games/fruit-ninja.html",
  "games/papas-scooperia.html",
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
    currentSrc.includes('ubghyper') ||
    currentSrc.includes('.pages.dev') ||
    currentSrc.includes('gamedistribution.com') ||
    currentSrc.includes('blobby-boi') ||
    (currentSrc.startsWith('games/') && !PRESERVED_LOCAL_GAMES.has(currentSrc)) ||
    currentSrc === '';

  let resolvedSrc = currentSrc;

  if (isBlocked) {
    // 2. Try Academics-Study verified endpoints
    if (ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug]) {
      resolvedSrc = ACADEMICS_MAP[cleanTitle] || ACADEMICS_MAP[cleanId] || ACADEMICS_MAP[cleanSlug];
    }
    // 3. Try 7zeb verified endpoints (proven to work on school iPads)
    else if (sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug]) {
      resolvedSrc = sMap[cleanTitle] || sMap[cleanId] || sMap[cleanSlug];
    }
    // 4. Try gameinclassroom verified endpoints (580 repos)
    else if (gicMap[cleanTitle] || gicMap[cleanId] || gicMap[cleanSlug]) {
      resolvedSrc = gicMap[cleanTitle] || gicMap[cleanId] || gicMap[cleanSlug];
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
         m.includes('gameinclassroom.github.io') ||
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
    ...mirrors.filter(m => m !== resolvedSrc && !m.includes('ubghyper') && !m.includes('blobby-boi') && !m.includes('gamedistribution.com'))
  ];

  return {
    src: resolvedSrc,
    mirrors: cleanMirrorsList
  };
}
