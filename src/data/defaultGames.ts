import { Game } from '../types/game';
import ubgGamesList from './ubgFilteredGames.json';
import strongdogGamesList from './strongdogGames.json';
import { TRIPPLE_POTATOES_GAMES } from './tripplePotatoesGames';
import { resolveGameSource } from './unblockedResolver';
import sevenZebMap from './sevenZebGamesMap.json';

const CURATED_GAMES: Game[] = [
  {
    id: "spaceflight-simulator",
    source: "unblocked",
    title: "Spaceflight Simulator",
    description: "Build multi-stage rockets, manage staging and throttle, escape Earth's atmosphere, and navigate orbital trajectories to reach the Moon in this realistic physics space simulator!",
    category: "Simulation",
    secondaryCategory: "Owen Watermelon OG’s",
    thumbnail: "https://images.unsplash.com/photo-1517976487507-5b3b4b45f942?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517976487507-5b3b4b45f942?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "games/spaceflight-simulator.html",
      "https://astronautag.github.io/spaceflight-simulator/",
      "https://7zeb.github.io/homework/3Dflightsimulator.html",
      "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/flashflightsimulator.swf&title=Flash+Flight+Simulator"
    ],
    tags: ["Space", "Rocket", "Simulation", "Spaceflight Simulator", "SFS", "Physics", "Orbit", "Trending", "Unblocked"],
    rating: 5.0,
    plays: 342000,
    author: "Stefo Mai Morojna",
    featured: true,
    iframeSrc: "games/spaceflight-simulator.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Spaceflight Simulator" src="games/spaceflight-simulator.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Space", action: "Stage Rocket / Ignite Boosters" },
      { key: "A / D or ← / →", action: "Steer Rocket / Gimbal" },
      { key: "Shift / Ctrl or Slider", action: "Throttle Up / Down" },
      { key: "M", action: "Toggle Orbit Map / Cockpit View" }
    ]
  },
  {
    id: "diep-io",
    source: "unblocked",
    title: "Diep.io",
    description: "Pilot your custom tank, destroy polygonal shapes to earn XP, upgrade 8 vital stats, and evolve through 45 levels of twin, sniper, destroyer, and machine gun classes!",
    category: "Action",
    secondaryCategory: "Owen Watermelon OG’s",
    thumbnail: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "https://diep.io",
      "https://ilancosman.github.io/diepio-clone/",
      "https://priswall.github.io/diepio-clone/",
      "/api/proxy/game?url=https://diep.io",
      "games/diep-io.html"
    ],
    tags: ["Diep.io", "Tank", "Multiplayer", "Shooter", "IO Games", "Action", "Trending", "Unblocked"],
    rating: 5.0,
    plays: 489000,
    author: "Matheus Valadares",
    featured: true,
    iframeSrc: "https://diep.io",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Diep.io" src="https://diep.io" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "WASD / Arrow Keys", action: "Move Tank" },
      { key: "Mouse Move & Left Click", action: "Aim & Shoot" },
      { key: "1 - 8 Keys", action: "Upgrade Stats" },
      { key: "E / C", action: "Toggle Auto-Fire / Auto-Spin" }
    ]
  },
  {
    id: "agar-io",
    source: "unblocked",
    title: "Agar.io",
    description: "The world-famous mass-eating battle royale! Control your cell, consume pellets, split to hunt other players, avoid spiky green viruses, and dominate the leaderboard!",
    category: "Action",
    secondaryCategory: "Owen Watermelon OG’s",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "https://7zeb.github.io/homework/agariolite.html",
      "/api/proxy/game?url=https://7zeb.github.io/homework/agariolite.html",
      "games/agar-io.html"
    ],
    tags: ["Agar.io", "Blob", "Multiplayer", "IO Games", "Action", "Survival", "Trending", "Unblocked"],
    rating: 5.0,
    plays: 520000,
    author: "Matheus Valadares",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/agariolite.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Agar.io" src="https://7zeb.github.io/homework/agariolite.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Move", action: "Glide Cell Direction" },
      { key: "Space", action: "Split Cell in Half (Launch Attack)" },
      { key: "W", action: "Eject Mass (Feed Teammate / Virus)" }
    ]
  },
  {
    id: "free-plinko-game-online",
    source: "unblocked",
    title: "Plinko",
    description: "Drop balls down the classic pegboard pyramid into glowing high-multiplier buckets. Real physics with up to 1000x multiplier payouts!",
    category: "Arcade",
    secondaryCategory: "Casual",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Free-Plinko-Game-Online/Free-Plinko-Game-Online.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Free-Plinko-Game-Online/Free-Plinko-Game-Online.png",
    mirrors: [
      "https://freeonlinewebtools.github.io/gamelist4.github.io/Free-Plinko-Game-Online/",
      "https://ubghyper.github.io/GameList.github.io/Free-Plinko-Game-Online/",
      "https://fakestake.fun/plinko"
    ],
    tags: ["Plinko", "Pegs", "Multiplier", "Physics", "Arcade", "Trending", "Unblocked"],
    rating: 5.0,
    plays: 289400,
    author: "FreeWebTools",
    featured: true,
    iframeSrc: "https://freeonlinewebtools.github.io/gamelist4.github.io/Free-Plinko-Game-Online/",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Plinko" src="https://freeonlinewebtools.github.io/gamelist4.github.io/Free-Plinko-Game-Online/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Click / Tap", action: "Drop Ball / Select Risk & Rows" },
      { key: "Space", action: "Rapid Drop" }
    ]
  },
  {
    id: "fakestake-plinko",
    source: "unblocked",
    title: "FakeStake Plinko",
    description: "Play official FakeStake.fun Plinko with 8-16 rows, Low/Medium/High risk, and multipliers reaching 1,000x with 100% free virtual currency.",
    category: "Arcade",
    secondaryCategory: "Casual",
    thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "https://fakestake.fun/plinko",
      "https://freeonlinewebtools.github.io/gamelist4.github.io/Free-Plinko-Game-Online/"
    ],
    tags: ["Plinko", "Pegs", "Multiplier", "Physics", "Arcade", "Originals", "Unblocked"],
    rating: 4.9,
    plays: 195000,
    author: "FakeStake.fun",
    featured: true,
    iframeSrc: "https://fakestake.fun/plinko",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="FakeStake Plinko" src="https://fakestake.fun/plinko" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Click", action: "Place Bet & Drop Plinko Ball" }
    ]
  },
  {
    id: "sawyer-for-sawyer",
    source: "unblocked",
    title: "A Small World Cup (Sawyer For Sawyer)",
    description: "Launch your ragdoll player across the pitch, headbutt the soccer ball, and score thrilling goals in the explosive A Small World Cup tournament!",
    category: "Sawyer For Sawyer",
    secondaryCategory: "2 Player Games",
    thumbnail: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "games/a-small-world-cup.html",
      "https://gameinclassroom.github.io/a-small-world-cup/",
      "games/sawyer-for-sawyer.html",
      "/api/proxy/game?url=https://gameinclassroom.github.io/a-small-world-cup/"
    ],
    tags: ["Sawyer For Sawyer", "A Small World Cup", "2 Player", "2 Player Games", "Two Player", "Soccer", "Ragdoll", "Physics", "Tournament", "Unblocked"],
    rating: 5.0,
    plays: 142000,
    author: "Rasto",
    featured: true,
    iframeSrc: "games/a-small-world-cup.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="A Small World Cup (Sawyer For Sawyer)" src="games/a-small-world-cup.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Drag & Release", action: "Aim & Sling Player" },
      { key: "Touch & Flick", action: "Launch Ragdoll" }
    ]
  },
  {
    id: "soccer-2026",
    source: "unblocked",
    title: "Soccer 2026",
    description: "Lead your national team onto the pitch, pass, tackle, and strike spectacular goals in this full 3D tournament soccer game.",
    category: "Sports",
    thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "games/soccer-2026.html"
    ],
    tags: ["Soccer", "Football", "3D", "Sports", "World Cup", "Tournament", "Unblocked"],
    rating: 4.9,
    plays: 104200,
    author: "Playgama",
    featured: true,
    iframeSrc: "games/soccer-2026.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Soccer 2026" src="games/soccer-2026.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Move Player" },
      { key: "Space / X", action: "Shoot / Slide Tackle" },
      { key: "C", action: "Pass / Switch Player" }
    ]
  },
  {
    id: "soccer-real",
    source: "unblocked",
    title: "Soccer REAL",
    description: "Realistic 3D soccer simulation featuring agile dribbling, precision penalty kicks, and dynamic stadium action powered by Three.js.",
    category: "Sports",
    thumbnail: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&auto=format&fit=crop&q=80",
    mirrors: [
      "games/soccer-real.html"
    ],
    tags: ["Soccer", "Football", "Realistic", "3D", "Three.js", "Sports", "Unblocked"],
    rating: 4.9,
    plays: 98700,
    author: "Zambi",
    featured: true,
    iframeSrc: "games/soccer-real.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Soccer REAL" src="games/soccer-real.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "WASD / Arrows", action: "Move Player" },
      { key: "K / Space", action: "Shoot Ball" },
      { key: "J", action: "Pass Ball" }
    ]
  },
  {
    id: "pool-ball",
    source: "unblocked",
    title: "Classic 8-Ball Pool",
    description: "Line up your cue stick, control English spin, and sink solids or stripes in this authentic billiards simulator.",
    category: "Sports",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/8-Ball-Pool/8-ball-pool.png",
    mirrors: [
      "https://henshmi.github.io/Classic-8-Ball-Pool/dist/"
    ],
    tags: ["Pool", "8-Ball", "Billiards", "Sports", "Unblocked"],
    rating: 4.8,
    plays: 89400,
    author: "Henshmi",
    featured: true,
    iframeSrc: "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Classic 8-Ball Pool" src="https://henshmi.github.io/Classic-8-Ball-Pool/dist/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Drag / Touch", action: "Aim Cue & Set Power" },
      { key: "Release", action: "Shoot Ball" }
    ]
  },
  {
    id: "basket-random",
    source: "unblocked",
    title: "Basket Random",
    description: "Wacky ragdoll two-player basketball with physics-defying players, changing balls, and unpredictable courts.",
    category: "Sports",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Basket-Random/basketrandom.jpg",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Basket-Random/splash.jpeg",
    mirrors: [
      "https://7zeb.github.io/basket-random/",
      "https://baseinfinite.github.io/basket-random/"
    ],
    tags: ["Basketball", "2 Player", "Ragdoll", "Sports", "Multiplayer", "Unblocked"],
    rating: 4.9,
    plays: 95400,
    author: "RHM Interactive",
    featured: true,
    iframeSrc: "https://7zeb.github.io/basket-random/",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Basket Random" src="https://7zeb.github.io/basket-random/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "W", action: "Player 1 Jump & Shoot" },
      { key: "Up Arrow", action: "Player 2 Jump & Shoot" }
    ]
  },
  {
    id: "retro-bowl",
    source: "unblocked",
    title: "Retro Bowl",
    description: "Manage your NFL team, call tactical audibles, pass bullet balls, and lead your franchise to victory in this beloved 8-bit retro football sim.",
    category: "Sports",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Retro-Bowl/retrobowl.jpg",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Retro-Bowl/html5game/splash.png",
    mirrors: [
        "https://retro--bowl.pages.dev/",
        "https://javaspence.github.io/retrobowl/",
        "https://ubghyper.github.io/GameList.github.io/retro-bowl/"
      ],
    tags: ["Football", "Sports", "Pixel", "NFL", "Retro Bowl", "Unblocked"],
    rating: 4.9,
    plays: 128920,
    author: "New Star Games",
    featured: true,
    iframeSrc: "https://retro--bowl.pages.dev/",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://retro--bowl.pages.dev/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Drag & Release", action: "Pass & Aim Football" },
      { key: "W / S or Up / Down", action: "Dodge Tackles & Stiff Arm" },
      { key: "Click / Tap", action: "Dive & Snap" }
    ]
  },
  {
    id: "drive-mad",
    source: "unblocked",
    title: "Drive Mad",
    description: "Navigate tricky obstacle courses in this physics-based driving game! Balance your truck carefully to reach the finish line without flipping.",
    category: "Racing",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Drive-Mad/logo.jpg",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Drive-Mad/webapp/cover.jpg",
    mirrors: [
        "https://academics-study.github.io/drive-mad/"
      ],
    tags: ["Racing", "Physics", "Truck", "Driving", "Popular", "Unblocked"],
    rating: 4.9,
    plays: 114400,
    author: "Martin Magni",
    featured: true,
    iframeSrc: "https://academics-study.github.io/drive-mad/",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://academics-study.github.io/drive-mad/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "W / D or Up / Right", action: "Drive Forward / Steer" },
      { key: "S / A or Down / Left", action: "Brake / Reverse" }
    ]
  },
  {
    id: "slope",
    source: "unblocked",
    title: "Slope",
    description: "Roll an ultra-fast ball down a futuristic 3D neon tunnel course. Dodge obstacles, adjust your speed, and test your lightning-quick reflexes!",
    category: "Action",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Slope/slope.jpg",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Slope/slope.jpg",
    mirrors: [
        "https://7zeb.github.io/homework/slope.html"
      ],
    tags: ["3D", "Runner", "Reflex", "Neon", "Arcade", "Unblocked"],
    rating: 4.9,
    plays: 165200,
    author: "Rob Kay",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/slope.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/slope.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "A / D or ← / →", action: "Steer Ball Left & Right" }
    ]
  },
  {
    id: "fnaf-1",
    source: "unblocked",
    title: "Five Nights at Freddy's (FNAF 1)",
    description: "Survive the night shift as the security guard at Freddy Fazbear's Pizza. Monitor surveillance cameras and conserve power before animatronics enter the office!",
    category: "Action",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/FNAF-1/FNAF-1.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/FNAF-1/FNAF-1.png",
    mirrors: [
        "https://7zeb.github.io/homework/fnaf.html",
        "https://academics-study.github.io/hd_fnaf/1/"
      ],
    tags: ["Horror", "Survival", "FNAF", "Strategy", "Classic", "Unblocked"],
    rating: 4.9,
    plays: 142500,
    author: "Scott Cawthon",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/fnaf.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/fnaf.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Move", action: "Pan Office Left & Right" },
      { key: "Mouse Hover Bottom", action: "Open Surveillance Monitor" },
      { key: "Door Buttons", action: "Toggle Red Doors & Hall Lights" }
    ]
  },
  {
    id: "fnaf-2",
    source: "unblocked",
    title: "Five Nights at Freddy's 2",
    description: "Welcome back to the new and improved Freddy Fazbear's Pizza! Put on your Freddy Fazbear head to deceive the night creatures.",
    category: "Action",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/FNAF-1/FNAF-1.png",
    mirrors: [
        "https://academics-study.github.io/hd_fnaf/2/"
      ],
    tags: ["Horror", "FNAF", "Survival", "Strategy"],
    rating: 4.9,
    plays: 98100,
    author: "Scott Cawthon",
    featured: false,
    iframeSrc: "https://academics-study.github.io/hd_fnaf/2/",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://academics-study.github.io/hd_fnaf/2/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Hover", action: "Pan Office" },
      { key: "Space / Ctrl", action: "Flashlight" },
      { key: "Bottom Hover", action: "Wear Mask / Monitor" }
    ]
  },
  {
    id: "fnaf-3",
    source: "unblocked",
    title: "Five Nights at Freddy's 3",
    description: "Thirty years after Freddy Fazbear's Pizza closed its doors, the events that took place there have become nothing more than a rumor.",
    category: "Action",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/FNAF-1/FNAF-1.png",
    mirrors: [
        "https://academics-study.github.io/hd_fnaf/3/"
      ],
    tags: ["Horror", "FNAF", "Survival", "Strategy"],
    rating: 4.8,
    plays: 87400,
    author: "Scott Cawthon",
    featured: false,
    iframeSrc: "https://academics-study.github.io/hd_fnaf/3/",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://academics-study.github.io/hd_fnaf/3/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Hover", action: "Pan Office" },
      { key: "Monitor / Reboot", action: "Fix Ventilation & Audio" }
    ]
  },
  {
    id: "fnaf-4",
    source: "unblocked",
    title: "Five Nights at Freddy's 4",
    description: "The fear has followed you home! Defend yourself against Freddy Fazbear, Chica, Bonnie, Foxy, and even worse things lurking in the shadows.",
    category: "Action",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/FNAF-1/FNAF-1.png",
    mirrors: [
        "https://academics-study.github.io/hd_fnaf/4/",
        "https://freeonlinewebtools.github.io/gamelist6.github.io/FNAF-4/"
      ],
    tags: ["Horror", "FNAF", "Survival", "Strategy"],
    rating: 4.8,
    plays: 91200,
    author: "Scott Cawthon",
    featured: false,
    iframeSrc: "https://academics-study.github.io/hd_fnaf/4/",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://academics-study.github.io/hd_fnaf/4/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Hover", action: "Move to Doors / Bed / Closet" },
      { key: "Ctrl / Space", action: "Flashlight" },
      { key: "Shift", action: "Hold Door Shut" }
    ]
  },
  {
    id: "kindergarten",
    source: "unblocked",
    title: "Kindergarten",
    description: "An abstract puzzle adventure game! You play as a student in a school that is a little bit... off. Figure out how to survive the day!",
    category: "Adventure",
    thumbnail: "https://freeonlinewebtools.github.io/gamelist6.github.io/Kindergarten/Kindergarten.png",
    mirrors: [
      "https://freeonlinewebtools.github.io/gamelist6.github.io/Kindergarten/"
    ],
    tags: ["Horror", "Puzzle", "Adventure", "Kindergarten", "Unblocked"],
    rating: 4.9,
    plays: 86400,
    author: "Con Man Games & SmashGames",
    featured: true,
    iframeSrc: "https://freeonlinewebtools.github.io/gamelist6.github.io/Kindergarten/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Kindergarten — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://freeonlinewebtools.github.io/gamelist6.github.io/Kindergarten/"></iframe>`,
    controls: [
      { key: "WASD / Arrow Keys", action: "Move Student" },
      { key: "E / Space", action: "Interact / Talk" }
    ]
  },
  {
    id: "kindergarten-2",
    source: "unblocked",
    title: "Kindergarten 2",
    description: "Welcome to a whole new Tuesday at a new school! Solve intricate mysteries, help classmates, and avoid trouble with the teachers.",
    category: "Adventure",
    thumbnail: "https://freeonlinewebtools.github.io/gamelist8.github.io/Kindergarten-2/Kindergarten-2.png",
    mirrors: [
      "https://freeonlinewebtools.github.io/gamelist8.github.io/Kindergarten-2/"
    ],
    tags: ["Horror", "Puzzle", "Adventure", "Kindergarten", "Unblocked"],
    rating: 4.9,
    plays: 89300,
    author: "Con Man Games & SmashGames",
    featured: true,
    iframeSrc: "https://freeonlinewebtools.github.io/gamelist8.github.io/Kindergarten-2/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Kindergarten 2 — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://freeonlinewebtools.github.io/gamelist8.github.io/Kindergarten-2/"></iframe>`,
    controls: [
      { key: "WASD / Arrow Keys", action: "Move Student" },
      { key: "E / Space", action: "Interact / Talk" }
    ]
  },
  {
    id: "kindergarten3port",
    source: "unblocked",
    title: "Kindergarten 3 (Port)",
    description: "The third chapter of the beloved Kindergarten mystery adventure! Navigate class schedules, talk to classmates, and collect items.",
    category: "Adventure",
    thumbnail: "https://freeonlinewebtools.github.io/gamelist7.github.io/Kindergarten3Port/Kindergarten3Port.png",
    mirrors: [
      "https://freeonlinewebtools.github.io/gamelist7.github.io/Kindergarten3Port/"
    ],
    tags: ["Horror", "Puzzle", "Adventure", "Kindergarten", "Unblocked"],
    rating: 4.9,
    plays: 94200,
    author: "Con Man Games & SmashGames",
    featured: true,
    iframeSrc: "https://freeonlinewebtools.github.io/gamelist7.github.io/Kindergarten3Port/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Kindergarten 3 (Port) — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://freeonlinewebtools.github.io/gamelist7.github.io/Kindergarten3Port/"></iframe>`,
    controls: [
      { key: "WASD / Arrow Keys", action: "Move Student" },
      { key: "E / Space", action: "Interact / Talk" }
    ]
  },
  {
    id: "friday-night-funkin-lullaby",
    source: "unblocked",
    title: "Friday Night Funkin: Lullaby",
    description: "High-energy rhythm game featuring intense spooky tracks! Hit the rhythm arrows in time with the music to out-sing your opponent.",
    category: "Music",
    thumbnail: "https://freeonlinewebtools.github.io/gamelist7.github.io/Friday-Night-Funkin-Lullaby/Friday-Night-Funkin-Lullaby.png",
    mirrors: [
      "https://freeonlinewebtools.github.io/gamelist7.github.io/Friday-Night-Funkin-Lullaby/"
    ],
    tags: ["FNF", "Rhythm", "Music", "Spooky", "Unblocked"],
    rating: 4.9,
    plays: 104500,
    author: "Banbuds & Team",
    featured: true,
    iframeSrc: "https://freeonlinewebtools.github.io/gamelist7.github.io/Friday-Night-Funkin-Lullaby/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Friday Night Funkin: Lullaby — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://freeonlinewebtools.github.io/gamelist7.github.io/Friday-Night-Funkin-Lullaby/"></iframe>`,
    controls: [
      { key: "DFJK / Arrow Keys", action: "Hit Rhythm Notes" },
      { key: "Space", action: "Special Note Action" }
    ]
  },
  {
    id: "cookie-clicker",
    source: "unblocked",
    title: "Cookie Clicker",
    description: "Bake billions of cookies! Hire grandmas, construct factories, open portals, and ascend to cookie godhood in the classic incremental clicker.",
    category: "Casual",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Cookie-Clicker/img/perfectCookie.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Cookie-Clicker/img/perfectCookie.png",
    mirrors: [
        "https://7zeb.github.io/homework/cookieclicker.html"
      ],
    tags: ["Clicker", "Idle", "Casual", "Addictive", "Unblocked"],
    rating: 4.9,
    plays: 135000,
    author: "Orteil",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/cookieclicker.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/cookieclicker.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Mouse Click", action: "Click the Big Cookie & Buy Upgrades" }
    ]
  },
  {
    id: "subway-surfers",
    source: "unblocked",
    title: "Subway Surfers",
    description: "Dash as fast as you can through subway tracks, dodge trains, jump over barriers, and surf on hoverboards in the world-famous endless runner!",
    category: "Racing",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Subway-Surfers/Subway-Surfers.png",
    mirrors: [
        "https://7zeb.github.io/homework/subway-surfers/index.html"
      ],
    tags: ["Runner", "Endless", "Surfer", "Popular", "Unblocked"],
    rating: 4.9,
    plays: 198000,
    author: "SYBO & Kiloo",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/subway-surfers/index.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/subway-surfers/index.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "WASD / Arrow Keys", action: "Dodge, Jump & Slide" },
      { key: "Space", action: "Activate Hoverboard" }
    ]
  },
  {
    id: "monkey-mart",
    source: "unblocked",
    title: "Monkey Mart",
    description: "Manage your very own supermarket! Plant bananas, stock shelves, serve monkey customers, hire staff, and grow your supermarket empire.",
    category: "Casual",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Monkey-Mart/assets/images/monkeymart.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Monkey-Mart/assets/images/monkeymart.png",
    mirrors: [
        "https://7zeb.github.io/homework/monkey-mart/index.html"
      ],
    tags: ["Management", "Sim", "Monkey", "Cute", "Shop", "Unblocked"],
    rating: 4.9,
    plays: 126000,
    author: "TinyDobbins",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/monkey-mart/index.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/monkey-mart/index.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "WASD / Arrow Keys", action: "Move Monkey Manager" }
    ]
  },
  {
    id: "snow-rider-3d",
    source: "unblocked",
    title: "Snow Rider 3D",
    description: "Sled down snowy mountains at breakneck speed! Dodge trees, leap over giant chasms, collect gift packages, and unlock cool sleds.",
    category: "Racing",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Snow-Rider-3D/snow-rider-3d.jpg",
    mirrors: [
        "https://7zeb.github.io/homework/snowrider.html"
      ],
    tags: ["Sled", "Winter", "3D", "Runner", "Racing", "Unblocked"],
    rating: 4.8,
    plays: 148525,
    author: "Ashima Prabhakar",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/snowrider.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/snowrider.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "A / D or ← / →", action: "Steer Sled Left & Right" },
      { key: "Space or W", action: "Jump Over Chasms" }
    ]
  },
  {
    id: "drift-boss",
    source: "unblocked",
    title: "Drift Boss",
    description: "One-button drifting thrills! Time your turns perfectly to drift around sharp 3D platform corners and collect coins without falling off.",
    category: "Racing",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Drift-Boss/drift-boss.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Drift-Boss/drift-boss.png",
    mirrors: [
      "https://www.mathplayground.com/drift-boss-v3/index.html",
      "https://html5.gamedistribution.com/0a8b51e5eaee42e7b4db83ca00afc92e/"
    ],
    tags: ["Drifting", "One Button", "Cars", "Casual", "Unblocked"],
    rating: 4.8,
    plays: 92300,
    author: "MarketJS",
    featured: false,
    iframeSrc: "https://www.mathplayground.com/drift-boss-v3/index.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Drift Boss — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://www.mathplayground.com/drift-boss-v3/index.html"></iframe>`,
    controls: [
      { key: "Space / Click / Hold", action: "Drift Right (Release to go Straight)" }
    ]
  },
  {
    id: "basketball-stars",
    source: "unblocked",
    title: "Basketball Stars",
    description: "Play 1v1 or 2v2 basketball tournaments with legendary bobblehead players. Perform epic dunks, steal the ball, and shoot three-pointers!",
    category: "Sports",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Basketball-Stars/basketball-stars.png",
    mirrors: [
      "https://joe-the-chicken.github.io/basketball-stars/",
      "https://7zeb.github.io/homework/basketballstars.html"
    ],
    tags: ["Basketball", "Sports", "2 Player", "Multiplayer", "Unblocked"],
    rating: 4.8,
    plays: 104000,
    author: "Madpuffers",
    featured: false,
    iframeSrc: "https://joe-the-chicken.github.io/basketball-stars/",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Basketball Stars" src="https://joe-the-chicken.github.io/basketball-stars/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "WASD", action: "Player 1 Move / Jump / Steal" },
      { key: "Arrow Keys", action: "Player 2 Move / Jump / Steal" }
    ]
  },
  {
    id: "moto3xm",
    source: "unblocked",
    title: "Moto X3M Bike Race",
    description: "Flip and race your dirt bike through extreme stunt obstacle tracks, loop-de-loops, and explosive ramps!",
    category: "Racing",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Moto3XM/moto3xm.png",
    mirrors: [
      "https://moto-x3m.pages.dev/"
    ],
    tags: ["Motorcycle", "Stunt", "Racing", "Physics", "Unblocked"],
    rating: 4.9,
    plays: 132000,
    author: "Madpuffers",
    featured: true,
    iframeSrc: "https://moto-x3m.pages.dev/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Moto X3M Bike Race — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://moto-x3m.pages.dev/"></iframe>`,
    controls: [
      { key: "↑ / W", action: "Accelerate Gas" },
      { key: "↓ / S", action: "Brake / Reverse" },
      { key: "← / → / A / D", action: "Tilt & Backflip / Frontflip" }
    ]
  },
  {
    id: "crossy-road",
    source: "unblocked",
    title: "Crossy Road",
    description: "Why did the chicken cross the road? Dodge high-speed trains, roaring trucks, and hopping rivers in this voxel arcade smash hit.",
    category: "Arcade",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Crossy-Road/crossyroad.png",
    mirrors: [
      "https://crossy-road.pages.dev/"
    ],
    tags: ["Voxel", "Runner", "Casual", "Crossy", "Unblocked"],
    rating: 4.9,
    plays: 118000,
    author: "Hipster Whale",
    featured: true,
    iframeSrc: "https://crossy-road.pages.dev/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Crossy Road — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://crossy-road.pages.dev/"></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Hop Forward, Left, Right & Back" }
    ]
  },
  {
    id: "1v1-lol",
    source: "unblocked",
    title: "1v1.LOL",
    description: "Fast-paced third-person building and shooting combat simulator. Practice your ramps, 90s, and shotgun duels in online arena matches.",
    category: "Action",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/1v1-LOL/1v1lol.png",
    mirrors: [
        "https://7zeb.github.io/homework/1v1-lol/index.html"
      ],
    tags: ["Action", "Shooter", "Building", "Multiplayer", "Unblocked"],
    rating: 4.8,
    plays: 167000,
    author: "JustPlay.LOL",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/1v1-lol/index.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://7zeb.github.io/homework/1v1-lol/index.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "WASD", action: "Move & Strafe" },
      { key: "Left Click", action: "Shoot / Build" },
      { key: "Z / X / C / V", action: "Wall / Floor / Stairs / Roof" }
    ]
  },
  {
    id: "tiny-fishing",
    source: "unblocked",
    title: "Tiny Fishing",
    description: "Cast your fishing line into deep waters, hook exotic underwater fish, and upgrade your gear to haul in legendary treasure!",
    category: "Casual",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Tiny-Fishing/tinyfishing.png",
    mirrors: [
      "https://tiny-fishing.pages.dev/"
    ],
    tags: ["Fishing", "Idle", "Casual", "Upgrade", "Unblocked"],
    rating: 4.8,
    plays: 87500,
    author: "Madpuffers",
    featured: false,
    iframeSrc: "https://tiny-fishing.pages.dev/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Tiny Fishing — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://tiny-fishing.pages.dev/"></iframe>`,
    controls: [
      { key: "Mouse Drag / Swipe", action: "Cast & Hook Fish" }
    ]
  },
  {
    id: "doodle-jump",
    source: "unblocked",
    title: "Doodle Jump",
    description: "Bounce the four-legged Doodler higher and higher on moving, breakable platforms while dodging monsters and black holes!",
    category: "Arcade",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Doodle-Jump/doodle.png",
    mirrors: [
      "https://doodle-jump.pages.dev/"
    ],
    tags: ["Jump", "Endless", "Arcade", "Retro", "Unblocked"],
    rating: 4.7,
    plays: 74200,
    author: "Lima Sky",
    featured: false,
    iframeSrc: "https://doodle-jump.pages.dev/",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Doodle Jump — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="https://doodle-jump.pages.dev/"></iframe>`,
    controls: [
      { key: "← / → or A / D", action: "Move Left & Right" }
    ]
  },
  {
    id: "watermelon-merge",
    source: "original",
    title: "Watermelon Merge (Suika)",
    description: "Drop and merge delicious fruits to evolve from tiny cherries all the way to the Giant Watermelon in this relaxing physics puzzler.",
    category: "Puzzle",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/SuikaGame/suika.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/SuikaGame/suika.png",
    tags: ["Physics", "Merge", "Watermelon", "Casual", "Suika"],
    rating: 4.9,
    plays: 48900,
    author: "Owen Watermelon Studios",
    featured: true,
    iframeSrc: "games/watermelon-merge.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Watermelon Merge (Suika) — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/watermelon-merge.html"></iframe>`,
    controls: [
      { key: "Mouse / Touch", action: "Aim & Drop Fruit" }
    ]
  },
  {
    id: "cyber-snake",
    source: "original",
    title: "Cyber Snake 3000",
    description: "Navigate the neon grid, hunt glowing watermelon bites, and grow into an unstoppable cyber serpent without hitting the walls.",
    category: "Arcade",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23092015'/><rect x='20' y='40' width='16' height='16' fill='%2310b981'/><rect x='40' y='40' width='16' height='16' fill='%2310b981'/><rect x='60' y='40' width='16' height='16' fill='%2334d399'/><text x='50' y='85' font-size='20' text-anchor='middle'>🐍</text></svg>",
    tags: ["Retro", "Classic", "Reflex", "Snake"],
    rating: 4.8,
    plays: 28430,
    author: "Retro Arcade Labs",
    featured: false,
    iframeSrc: "games/snake.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Cyber Snake 3000 — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/snake.html"></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Change Direction" },
      { key: "Space", action: "Restart" }
    ]
  },
  {
    id: "tetrix-blocks",
    source: "original",
    title: "Tetrix Block Fall",
    description: "The quintessential falling tetromino blocks challenge with clean neon rendering, soft drop, and hard drop.",
    category: "Puzzle",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2308160f'/><rect x='30' y='30' width='18' height='18' fill='%2306b6d4'/><rect x='50' y='30' width='18' height='18' fill='%2306b6d4'/><rect x='50' y='50' width='18' height='18' fill='%23ff2d55'/><rect x='30' y='70' width='18' height='18' fill='%2310b981'/></svg>",
    tags: ["Tetris", "Blocks", "Logic", "Strategy"],
    rating: 4.9,
    plays: 41200,
    author: "Pixel Block Syndicate",
    featured: false,
    iframeSrc: "games/tetris.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Tetrix Block Fall — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/tetris.html"></iframe>`,
    controls: [
      { key: "← / →", action: "Move Piece" },
      { key: "↑ / W", action: "Rotate" },
      { key: "↓ / S", action: "Soft Drop" },
      { key: "Space", action: "Hard Drop" }
    ]
  },
  {
    id: "neon-2048",
    source: "original",
    title: "2048 Neon Watermelon",
    description: "Slide the numbers, double your power, and combine tiles until you unlock the mythical 2048 block.",
    category: "Puzzle",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230c2016'/><rect x='15' y='15' width='70' height='70' rx='12' fill='%2310b981'/><text x='50' y='58' font-size='26' font-family='sans-serif' font-weight='bold' text-anchor='middle' fill='%23064e3b'>2048</text></svg>",
    tags: ["Numbers", "Brain", "Math", "Casual"],
    rating: 4.7,
    plays: 26800,
    author: "Gabriele Cirulli & Owen",
    featured: false,
    iframeSrc: "games/2048.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="2048 Neon Watermelon — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/2048.html"></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Slide Tiles" },
      { key: "Swipe", action: "Touch Screen Slide" }
    ]
  },
  {
    id: "brick-smasher",
    source: "original",
    title: "Watermelon Breakout",
    description: "Smash layers of juicy neon bricks, bounce the high-velocity orb, and test your paddle coordination.",
    category: "Arcade",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2308160f'/><rect x='15' y='20' width='30' height='12' fill='%23ff2d55'/><rect x='52' y='20' width='30' height='12' fill='%23fb923c'/><circle cx='50' cy='55' r='8' fill='%2310b981'/><rect x='30' y='80' width='40' height='10' fill='%23ff2d55'/></svg>",
    tags: ["Brick", "Breakout", "Paddle", "Action"],
    rating: 4.6,
    plays: 24320,
    author: "Atari Inspired",
    featured: false,
    iframeSrc: "games/breakout.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Watermelon Breakout — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/breakout.html"></iframe>`,
    controls: [
      { key: "Mouse / Touch", action: "Move Paddle" }
    ]
  },
  {
    id: "flappy-melon",
    source: "original",
    title: "Flappy Melon Flight",
    description: "Flap your watermelon slice through dangerous bamboo vines and avoid crashing to claim the high score.",
    category: "Casual",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23092015'/><text x='50' y='60' font-size='48' text-anchor='middle'>🍉</text></svg>",
    tags: ["Flappy", "Skill", "Hard", "Casual"],
    rating: 4.5,
    plays: 32100,
    author: "Dong Nguyen Homage",
    featured: false,
    iframeSrc: "games/flappy.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Flappy Melon Flight — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/flappy.html"></iframe>`,
    controls: [
      { key: "Space / Tap", action: "Flap Wings" }
    ]
  },
  {
    id: "space-defender",
    source: "original",
    title: "Space Defender 8-Bit",
    description: "Defend the sector against alien invaders and rogue asteroids in this classic top-down space blaster.",
    category: "Action",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2306110b'/><polygon points='50,20 30,70 70,70' fill='%2310b981'/><circle cx='50' cy='50' r='5' fill='%23ff2d55'/><text x='50' y='92' font-size='14' text-anchor='middle'>👾</text></svg>",
    tags: ["Space", "Shooter", "Retro", "Aliens"],
    rating: 4.8,
    plays: 28900,
    author: "Galactic Studios",
    featured: false,
    iframeSrc: "games/space.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Space Defender 8-Bit — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/space.html"></iframe>`,
    controls: [
      { key: "← / → / WASD", action: "Move Starship" },
      { key: "Space", action: "Fire Laser Blaster" }
    ]
  },
  {
    id: "cyber-pong",
    source: "original",
    title: "Cyber Pong (1P & 2P)",
    description: "The grandfather of electronic games revamped with neon watermelon aesthetics and 2-player local battle mode.",
    category: "Sports",
    thumbnail: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%2306110b'/><line x1='50' y1='10' x2='50' y2='90' stroke='%2316402a' stroke-dasharray='5,5'/><rect x='15' y='35' width='6' height='30' fill='%2310b981'/><rect x='80' y='45' width='6' height='30' fill='%23ff2d55'/><circle cx='40' cy='50' r='4' fill='%23fff'/></svg>",
    tags: ["2 Player", "Sports", "Arcade", "Multiplayer"],
    rating: 4.7,
    plays: 18400,
    author: "Owen Watermelon",
    featured: false,
    iframeSrc: "games/pong.html",
    iframeCode: `<iframe id="plyIframe" class="ply-iframe" title="Cyber Pong (1P & 2P) — UBGHyper" allow="fullscreen; autoplay" allowfullscreen="" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-top-navigation-by-user-activation allow-popups" src="games/pong.html"></iframe>`,
    controls: [
      { key: "W / S or Mouse", action: "Player 1 Paddle" },
      { key: "↑ / ↓", action: "Player 2 Paddle" }
    ]
  },
  {
    id: "bloons-tower-defence",
    source: "unblocked",
    title: "Bloons Tower Defence",
    description: "The legendary original monkey tower defense game! Place dart monkeys, tack shooters, bomb towers, and ice towers along the winding path to pop all balloons before they reach the end.",
    category: "Strategy",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/btd1.jpg",
    mirrors: [
      "https://7zeb.github.io/homework/bloonsTD.html",
      "https://gameinclassroom.github.io/bloons-tower-defense-1/",
      "/api/proxy/game?url=https://gameinclassroom.github.io/bloons-tower-defense-1/",
      "https://ubghyper.github.io/GameList.github.io/Bloons-Tower-Defense/"
    ],
    tags: ["Bloons", "BTD", "Bloons TD", "Tower Defense", "Strategy", "Classic", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 198000,
    author: "Ninja Kiwi",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/bloonsTD.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Bloons Tower Defence" src="https://7zeb.github.io/homework/bloonsTD.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Left Click", action: "Select & Place Towers" },
      { key: "Click Tower", action: "Upgrade & Target Strategy" }
    ]
  },
  {
    id: "bloons-tower-defence-2",
    source: "unblocked",
    title: "Bloons Tower Defence 2",
    description: "Bloons TD 2 introduces brand new tracks, boomerang throwers, road spikes, monkey glue, and treacherous lead balloons!",
    category: "Strategy",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/btd2.jpg",
    mirrors: [
      "https://7zeb.github.io/homework/bloonsTD2.html",
      "/api/proxy/game?url=https://7zeb.github.io/homework/bloonsTD2.html",
      "https://ubghyper.github.io/GameList.github.io/Bloonstd-2/"
    ],
    tags: ["Bloons", "BTD", "Bloons TD 2", "Tower Defense", "Strategy", "Classic", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 231000,
    author: "Ninja Kiwi",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/bloonsTD2.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Bloons Tower Defence 2" src="https://7zeb.github.io/homework/bloonsTD2.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Left Click", action: "Select & Place Towers" },
      { key: "Click Tower", action: "Upgrade / Sell" }
    ]
  },
  {
    id: "bloons-tower-defence-3",
    source: "unblocked",
    title: "Bloons Tower Defence 3",
    description: "Bloons TD 3 brings 8 challenging tracks, spiked ball factories, super monkeys, pineapple bombs, and the menacing MOAB airship!",
    category: "Strategy",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/btd3.jpg",
    mirrors: [
      "https://7zeb.github.io/homework/bloonsTD3.html",
      "/api/proxy/game?url=https://7zeb.github.io/homework/bloonsTD3.html",
      "https://ubghyper.github.io/GameList.github.io/Bloonstd-3/"
    ],
    tags: ["Bloons", "BTD", "Bloons TD 3", "Tower Defense", "Strategy", "Classic", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 265000,
    author: "Ninja Kiwi",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/bloonsTD3.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Bloons Tower Defence 3" src="https://7zeb.github.io/homework/bloonsTD3.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Left Click", action: "Select & Place Towers" },
      { key: "Click Tower", action: "Upgrade / Sell" }
    ]
  },
  {
    id: "btd-4",
    source: "unblocked",
    title: "Bloons TD 4",
    description: "Bloons TD 4 delivers crisp graphics, monkey aces, mortar towers, monkey apprentices, career ranks, and multiple difficulty modes.",
    category: "Strategy",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/btd4.jpg",
    mirrors: [
      "https://7zeb.github.io/homework/bloonsTD4.html",
      "/api/proxy/game?url=https://7zeb.github.io/homework/bloonsTD4.html",
      "https://ubghyper.github.io/GameList.github.io/Bloonstd-4/"
    ],
    tags: ["Bloons", "BTD", "Bloons TD 4", "Tower Defense", "Strategy", "Classic", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 312000,
    author: "Ninja Kiwi",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/bloonsTD4.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Bloons TD 4" src="https://7zeb.github.io/homework/bloonsTD4.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Left Click", action: "Select & Place Towers" },
      { key: "Click Tower", action: "Upgrade / Target Mode" }
    ]
  },
  {
    id: "bloons-td-5",
    source: "unblocked",
    title: "Bloons TD 5",
    description: "Bloons TD 5 features 21 powerful towers with activated abilities, two upgrade paths, special missions, and daily challenges in glorious 60 FPS HTML5!",
    category: "Strategy",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/btd5.png",
    mirrors: [
      "https://7zeb.github.io/homework/bloonsTD5.html",
      "/api/proxy/game?url=https://7zeb.github.io/homework/bloonsTD5.html",
      "https://ubghyper.github.io/GameList.github.io/Bloonstd-5/"
    ],
    tags: ["Bloons", "BTD", "Bloons TD 5", "Tower Defense", "Strategy", "Classic", "Owen OG", "Unblocked"],
    rating: 5.0,
    plays: 450000,
    author: "Ninja Kiwi",
    featured: true,
    iframeSrc: "https://7zeb.github.io/homework/bloonsTD5.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Bloons TD 5" src="https://7zeb.github.io/homework/bloonsTD5.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Left Click", action: "Select & Place Towers" },
      { key: "Click Tower", action: "Upgrade Ability / Target" },
      { key: "Space", action: "Start / Fast Forward Round" }
    ]
  },
  {
    id: "duck-life",
    source: "unblocked",
    title: "Duck Life",
    description: "Train your baby duckling in running, swimming, and flying to win races and save your farm! Eat seed to boost energy and level up your duck skills.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife1.jpg",
    mirrors: [
      "games/duck-life-1.html",
      "games/flash-player.html?swf=games/swfs/ducklife1.swf&title=Duck+Life",
      "/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/Duck-Life/"
    ],
    tags: ["Duck Life", "Duck", "Racing", "Training", "Animal", "Casual", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 280000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-1.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life" src="games/duck-life-1.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "↑ / W", action: "Jump (Running Mode)" },
      { key: "← / → / A / D", action: "Move Left & Right (Swimming / Flying)" }
    ]
  },
  {
    id: "duck-life-2",
    source: "unblocked",
    title: "Duck Life 2: World Champion",
    description: "The championship expands worldwide! Train running, flying, swimming, and climbing to compete against elite ducks in England, Egypt, Hawaii, and Japan.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife2.jpg",
    mirrors: [
      "games/duck-life-2.html",
      "games/flash-player.html?swf=games/swfs/ducklife2.swf&title=Duck+Life+2",
      "/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/Duck-Life-2/"
    ],
    tags: ["Duck Life", "Duck Life 2", "Duck", "Racing", "Training", "Animal", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 295000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-2.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life 2: World Champion" src="games/duck-life-2.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "↑ / W", action: "Jump / Climb" },
      { key: "← / → / A / D", action: "Steer Duck" }
    ]
  },
  {
    id: "duck-life-3",
    source: "unblocked",
    title: "Duck Life 3: Evolution",
    description: "Genetically evolve your duck into distinct breeds! Choose between strength, agility, speed, or flying specializations and race through the Amateur, Advanced, and Professional leagues.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife3.jpg",
    mirrors: [
      "games/duck-life-3.html",
      "games/flash-player.html?swf=games/swfs/ducklife3.swf&title=Duck+Life+3",
      "/api/proxy/game?url=https://freeonlinewebtools.github.io/gamelist3.github.io/Duck-Life-3/"
    ],
    tags: ["Duck Life", "Duck Life 3", "Duck", "Evolution", "Racing", "Training", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 310000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-3.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life 3: Evolution" src="games/duck-life-3.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Control Duck in Training & Races" },
      { key: "Space", action: "Action / Jump" }
    ]
  },
  {
    id: "duck-life-4",
    source: "unblocked",
    title: "Duck Life 4",
    description: "Embark on an open-world adventure across 6 vibrant worlds! Buy new ducks, challenge boss ducks, train stamina, jump, flying, and swimming, and conquer the volcano.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife4.jpg",
    mirrors: [
      "games/duck-life-4.html",
      "games/flash-player.html?swf=games/swfs/ducklife4.swf&title=Duck+Life+4",
      "https://flyingsully.github.io/GameList.github.io/Duck-Life-4/"
    ],
    tags: ["Duck Life", "Duck Life 4", "Duck", "Adventure", "Racing", "Training", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 350000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-4.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life 4" src="games/duck-life-4.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Move Duck / Navigate World" },
      { key: "Space / Mouse", action: "Jump / Interact" }
    ]
  },
  {
    id: "duck-life-5",
    source: "unblocked",
    title: "Duck Life 5: Treasure Hunt",
    description: "Explore the mysterious underground volcano cave! Dash, bounce, fly with jetpacks, collect rare coins, and discover ancient treasures.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife5.png",
    mirrors: [
      "games/duck-life-5.html",
      "games/flash-player.html?swf=games/swfs/ducklife5.swf&title=Duck+Life+5"
    ],
    tags: ["Duck Life", "Duck Life 5", "Treasure Hunt", "Duck", "Platformer", "Casual", "Owen OG", "Unblocked"],
    rating: 4.8,
    plays: 180000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-5.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life 5: Treasure Hunt" src="games/duck-life-5.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Move & Jump" },
      { key: "Space", action: "Activate Gadget" }
    ]
  },
  {
    id: "duck-life-space",
    source: "unblocked",
    title: "Duck Life: Space",
    description: "Launch your champion duck into outer space! Travel across planets, master zero-G gravity races, and upgrade your duck skills across the galaxy.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife4.jpg",
    mirrors: [
      "games/duck-life-4.html",
      "games/flash-player.html?swf=games/swfs/ducklife4.swf&title=Duck+Life+Space"
    ],
    tags: ["Duck Life", "Space", "Duck", "Racing", "Training", "Animal", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 210000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-4.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life: Space" src="games/duck-life-4.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Control Duck" },
      { key: "Space", action: "Jump / Boost" }
    ]
  },
  {
    id: "duck-life-battle",
    source: "unblocked",
    title: "Duck Life: Battle",
    description: "The ultimate duck showdown! Train strength, defense, speed, and health, equip special weapons and hats, and battle rogue ducks in arena tournaments.",
    category: "Casual",
    secondaryCategory: "Potato Classics",
    thumbnail: "thumbnails/ducklife3.jpg",
    mirrors: [
      "games/duck-life-3.html",
      "games/flash-player.html?swf=games/swfs/ducklife3.swf&title=Duck+Life+Battle"
    ],
    tags: ["Duck Life", "Battle", "Duck", "Combat", "Training", "Animal", "Owen OG", "Unblocked"],
    rating: 4.9,
    plays: 240000,
    author: "Wix Games",
    featured: true,
    iframeSrc: "games/duck-life-3.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="Duck Life: Battle" src="games/duck-life-3.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Move Duck / Navigate Arena" },
      { key: "Mouse Click", action: "Select Attacks & Items" }
    ]
  }
];

export const STANDARD_ALLOW_PERMISSIONS = "autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope";

export function formatGameIframe(title: string, src: string): string {
  return `<iframe class="game-iframe" id="game-area" title="${title}" src="${src}" allow="${STANDARD_ALLOW_PERMISSIONS}" allowfullscreen=""></iframe>`;
}

export function formatUBGIframe(title: string, src: string): string {
  return formatGameIframe(title, src);
}

export const URL_OVERRIDES: Record<string, string> = {
  // Random Games Series (Unblocked Local & Clean GitHub Hosts)
  "basket-random": "games/basket-random.html",
  "potatoes-basket-random": "games/basket-random.html",
  "soccer-random": "games/soccer-random/index.html",
  "soccer-random-1": "games/soccer-random/index.html",
  "potatoes-soccer-random": "games/soccer-random/index.html",
  "potatoes-soccer-skils": "games/soccer-random/index.html",
  "potatoes-fifa-2002": "games/fifa.html",
  "fifa-2002": "games/fifa.html",
  "fifa": "games/fifa.html",
  "volley-random": "games/volley-random.html",
  "potatoes-volley-random": "games/volley-random.html",
  "boxing-random": "games/boxing-random.html",
  "potatoes-boxing-random": "games/boxing-random.html",
  "potatoes-rag-doll-games-boxing": "games/boxing-random.html",

  // Road of the Dead 1 & 2 (Clean Modern Flash Player with shadowRoot error suppression & proxy streaming)
  "road-of-the-dead": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Road-of-the-dead/roadofthedead.swf&title=Road+of+the+Dead",
  "road-of-the-dead-2": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Road-of-the-dead-2/road_of_the_deads_2.swf&title=Road+of+the+Dead+2",
  "strikeforce-heroes": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Strikeforce-Heroes/strikeforceheroes.swf&title=Strikeforce+Heroes",
  "crush-the-castle": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Crush-The-Castle/crushthecastle.swf&title=Crush+The+Castle",
  "crush-the-castle-2": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Crush-The-Castle-2/crushthecastle2.swf&title=Crush+The+Castle+2",

  // Pokemon Series (Dedicated Local GBA Engine)
  "pokemonemerald": "games/pokemon-emerald.html",
  "pokemon-emerald": "games/pokemon-emerald.html",
  "pokemonred": "games/pokemon-red.html",
  "pokemon-red": "games/pokemon-red.html",

  // Flight Simulators & Gunblood
  "flash-flight-simulator-1": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/flashflightsimulator.swf&title=Flash+Flight+Simulator",
  "flash-flight-simulator": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/flashflightsimulator.swf&title=Flash+Flight+Simulator",
  "spaceflight-simulator": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Flash-Flight-Simulator-1/flashflightsimulator.swf&title=Flash+Flight+Simulator",
  "gunblood": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Gunblood/gunblood.swf&title=Gunblood",

  // Fireboy and Watergirl Series (Native HTML5 Engines)
  "fireboy-and-watergirl": "https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/",
  "fireboy-and-watergirl-1": "https://gameinclassroom.github.io/fireboy-and-watergirl-forest-temple/",
  "fireboy-and-watergirl-2": "https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/",
  "fireboy-and-watergirl-2-light-temple": "https://gameinclassroom.github.io/fireboy-and-watergirl-2-light-temple/",
  "fireboy-and-watergirl-3": "https://gameinclassroom.github.io/fireboy-watergirl-3-ice-temple/",
  "fireboy-and-watergirl-4": "https://gameinclassroom.github.io/fireboy-and-watergirl-4-crystal-temple/",
  "fireboy-and-watergirl-5": "https://gameinclassroom.github.io/fireboy-and-watergirl-5-elements/",
  "fireboy-and-watergirl-6": "https://gameinclassroom.github.io/fireboy-watergirl-6-fairy-tales/",

  // Serenitrove (Relaxing Digging Game)
  "serenitrove": "games/serenitrove.html",

  // .io Games (Confirmed Real Working Game Engines & Unblocked Mirrors)
  "agar-io": "https://7zeb.github.io/homework/agariolite.html",
  "potatoes-agar-io": "https://7zeb.github.io/homework/agariolite.html",
  "agariolite": "https://7zeb.github.io/homework/agariolite.html",
  "7zeb-agariolite": "https://7zeb.github.io/homework/agariolite.html",
  "strongdog-agario": "https://7zeb.github.io/homework/agariolite.html",
  "potatoes-io-games": "https://7zeb.github.io/homework/agariolite.html",
  "diep-io": "https://diep.io",
  "diepio": "https://diep.io",
  "potatoes-diep-io": "https://diep.io",
  "slither-io": "https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/",
  "slitherio": "https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/",
  "potatoes-slither-io": "https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/",
  "strongdog-slitherio": "https://freeonlinewebtools.github.io/gamelist3.github.io/slitherio/",
  "paper-io": "https://7zeb.github.io/homework/paperio2.html",
  "paper-io-2": "https://7zeb.github.io/homework/paperio2.html",
  "potatoes-paper-io": "https://7zeb.github.io/homework/paperio2.html",
  "potatoes-paper-io-3d": "https://7zeb.github.io/homework/paperio2.html",
  "hole-io": "https://7zeb.github.io/homework/holeio.html",
  "potatoes-hole-io": "https://7zeb.github.io/homework/holeio.html",
  "strongdog-holeio": "https://7zeb.github.io/homework/holeio.html",
  "smash-karts": "https://freeonlinewebtools.github.io/gamelist8.github.io/Smash-Karts/",
  "tanks-io": "https://7zeb.github.io/homework/awesometanks2.html",
  "potatoes-tanks-io": "https://7zeb.github.io/homework/awesometanks2.html",
  "shell-shockers-io": "https://academics-study.github.io/shellshockers/",
  "potatoes-shell-shockers-io": "https://academics-study.github.io/shellshockers/",
  "shellshockers": "https://academics-study.github.io/shellshockers/",
  "potatoes-aquapark-io": "https://gameinclassroom.github.io/aquaparkio/",
  "aquapark-io": "https://gameinclassroom.github.io/aquaparkio/",
  "potatoes-just-fall-lol": "https://gameinclassroom.github.io/just-fall-lol/",
  "just-fall": "https://gameinclassroom.github.io/just-fall-lol/",
  "potatoes-1v1-lol": "https://gameinclassroom.github.io/1v1-lol/",
  "1v1-lol": "https://gameinclassroom.github.io/1v1-lol/",
  "potatoes-zombs-royale": "https://gameinclassroom.github.io/zombs-royale-io/",
  "zombs-royale": "https://gameinclassroom.github.io/zombs-royale-io/",
  "strongdog-zombsroyale": "https://gameinclassroom.github.io/zombs-royale-io/",
  "snowbattleio": "https://7zeb.github.io/homework/snowballio.html",
  "snow-battle-io": "https://7zeb.github.io/homework/snowballio.html",
  "snowballio": "https://7zeb.github.io/homework/snowballio.html",
  "7zeb-snowballio": "https://7zeb.github.io/homework/snowballio.html",
  "strongdog-snowbattleio": "https://7zeb.github.io/homework/snowballio.html",
  "territorialio": "https://7zeb.github.io/homework/territorialio.html",
  "territorial-io": "https://7zeb.github.io/homework/territorialio.html",
  "7zeb-territorialio": "https://7zeb.github.io/homework/territorialio.html",
  "cleanupio": "https://7zeb.github.io/homework/cleanupio.html",
  "7zeb-cleanupio": "https://7zeb.github.io/homework/cleanupio.html",
  "stateio": "https://7zeb.github.io/homework/stateio.html",
  "7zeb-stateio": "https://7zeb.github.io/homework/stateio.html",
  "evowarsio": "https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/",
  "evowars-io": "https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/",
  "brawlguysio": "https://freeonlinewebtools.github.io/gamelist4.github.io/BrawlGuysio/",
  "brawlguys-io": "https://freeonlinewebtools.github.io/gamelist4.github.io/BrawlGuysio/",
  "strongdog-brawlguysio": "https://freeonlinewebtools.github.io/gamelist4.github.io/BrawlGuysio/",
  "tallio": "https://freeonlinewebtools.github.io/gamelist4.github.io/Tallio/",
  "tall-io": "https://freeonlinewebtools.github.io/gamelist4.github.io/Tallio/",
  "potatoes-basket-bros": "https://gameinclassroom.github.io/basket-bros/",
  "basket-bros": "https://gameinclassroom.github.io/basket-bros/",
  "potatoes-stick-slashers": "https://gameinclassroom.github.io/stick-merge/",
  "stick-merge": "https://gameinclassroom.github.io/stick-merge/",
  "shapez": "https://freeonlinewebtools.github.io/gamelist8.github.io/Shapez/",
  "potatoes-gartic-io": "https://7zeb.github.io/homework/agariolite.html",
  "potatoes-fliphero-io": "https://7zeb.github.io/homework/holeio.html",
  "potatoes-eat-io": "https://7zeb.github.io/homework/holeio.html",
  "strongdog-eatio": "https://7zeb.github.io/homework/holeio.html",
  "potatoes-biters-io": "https://gameinclassroom.github.io/blocky-snakes/",
  "potatoes-fall-boys": "https://gameinclassroom.github.io/just-fall-lol/",

  // Wheely Series (Flash Player Runner with unblocked jsDelivr SWFs)
  "wheely": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely/Wheely.swf&title=Wheely",
  "wheely-2": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-2/Wheely-2.swf&title=Wheely+2",
  "wheely-3": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-3/Wheely-3.swf&title=Wheely+3",
  "wheely-4": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-4/Wheely-4.swf&title=Wheely+4",
  "wheely-5": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-5/Wheely-5.swf&title=Wheely+5",
  "wheely-6": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-6/Wheely-6.swf&title=Wheely+6",
  "wheely-7": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-7/Wheely-7.swf&title=Wheely+7",
  "wheely-8": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely-8/Wheely-8.swf&title=Wheely+8",
  "potatoes-wheely": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Wheely/Wheely.swf&title=Wheely",

  // Happy Wheels & The Binding of Isaac (Unblocked Clean HTML5 / Working Runners)
  "happy-wheels": "games/happy-wheels.html",
  "the-binding-of-isaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "binding-of-isaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "potatoes-the-binding-of-isaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",

  // Fruit Ninja (Clean Local HTML5 Engine)
  "fruit-ninja": "games/fruit-ninja.html",
  "fruitninja": "games/fruit-ninja.html",

  // Bloons Tower Defence Series (Clean HTML5 WebAssembly / Canvas Engines)
  "bloons-tower-defence": "https://7zeb.github.io/homework/bloonsTD.html",
  "bloonstd": "https://7zeb.github.io/homework/bloonsTD.html",
  "bloonstowerdefence": "https://7zeb.github.io/homework/bloonsTD.html",
  "bloonstowerdefense": "https://7zeb.github.io/homework/bloonsTD.html",
  "bloons-tower-defence-2": "https://7zeb.github.io/homework/bloonsTD2.html",
  "bloonstd2": "https://7zeb.github.io/homework/bloonsTD2.html",
  "bloons-tower-defence-3": "https://7zeb.github.io/homework/bloonsTD3.html",
  "bloonstd3": "https://7zeb.github.io/homework/bloonsTD3.html",
  "btd3": "https://7zeb.github.io/homework/bloonsTD3.html",
  "bloons-td-4": "https://7zeb.github.io/homework/bloonsTD4.html",
  "btd-4": "https://7zeb.github.io/homework/bloonsTD4.html",
  "btd4": "https://7zeb.github.io/homework/bloonsTD4.html",
  "bloonstd4": "https://7zeb.github.io/homework/bloonsTD4.html",
  "bloons-td-5": "https://7zeb.github.io/homework/bloonsTD5.html",
  "bloonstd5": "https://7zeb.github.io/homework/bloonsTD5.html",
  "btd5": "https://7zeb.github.io/homework/bloonsTD5.html",

  // Papa's Cooking Series (Modern Native HTML5 / WebAssembly Ports - Zero Flash)
  "papas-pizzeria": "https://ubghyper.github.io/GameList.github.io/Papas-Pizzeria/",
  "potatoes-papa-39-s-pizzeria": "https://ubghyper.github.io/GameList.github.io/Papas-Pizzeria/",
  "papa-burg": "https://7zeb.github.io/homework/papasburgeria.html",
  "potatoes-papa-39-s-burgeria": "https://7zeb.github.io/homework/papasburgeria.html",
  "papas-freezeria": "https://7zeb.github.io/homework/papasfreezeria.html",
  "potatoes-papa-39-s-freezeria": "https://7zeb.github.io/homework/papasfreezeria.html",
  "papas-cheese": "https://7zeb.github.io/homework/papascheeseria.html",
  "potatoes-papa-39-s-cheeseria": "https://7zeb.github.io/homework/papascheeseria.html",
  "toastelia": "https://7zeb.github.io/homework/papascheeseria.html",
  "papas-donut": "https://7zeb.github.io/homework/papasdonuteria.html",
  "potatoes-papa-39-s-donuteria": "https://7zeb.github.io/homework/papasdonuteria.html",
  "papa-htdog": "https://7zeb.github.io/homework/papashotdoggeria.html",
  "potatoes-papa-39-s-hot-doggeria": "https://7zeb.github.io/homework/papashotdoggeria.html",
  "papas-pasta": "https://7zeb.github.io/homework/papaspastaria.html",
  "potatoes-papa-39-s-pastaria": "https://7zeb.github.io/homework/papaspastaria.html",
  "papas-sushi": "https://gameinclassroom.github.io/papas-sushiria/",
  "potatoes-papa-39-s-sushiria": "https://gameinclassroom.github.io/papas-sushiria/",
  "potatoes-papa-39-s-taco-mia": "https://7zeb.github.io/homework/papastacomia.html",
  "papas-taco-mia": "https://7zeb.github.io/homework/papastacomia.html",
  "papas-wing": "https://7zeb.github.io/homework/papaswingeria.html",
  "papaswingeria": "https://7zeb.github.io/homework/papaswingeria.html",
  "papa-bakes": "https://7zeb.github.io/homework/papasbakeria.html",
  "potatoes-papa-39-s-bakeria": "https://7zeb.github.io/homework/papasbakeria.html",
  "potatoes-papa-s-bakeria": "https://7zeb.github.io/homework/papasbakeria.html",
  "papa-cpck": "https://7zeb.github.io/homework/papascupcakeria.html",
  "potatoes-papa-39-s-cupcakeria": "https://7zeb.github.io/homework/papascupcakeria.html",
  "papas-pnck": "https://7zeb.github.io/homework/papaspancakeria.html",
  "potatoes-papa-39-s-pancakeria": "https://7zeb.github.io/homework/papaspancakeria.html",
  "papa-scoop": "https://ubghyper.github.io/GameList.github.io/Papa-Scoop/",
  "papa-scoop-alt": "https://ubghyper.github.io/GameList.github.io/Papa-Scoop/",
  "potatoes-papa-39-s-scooperia": "https://ubghyper.github.io/GameList.github.io/Papa-Scoop/",
  "cooking-mama": "https://ubghyper.github.io/GameList.github.io/Cooking-Mama/",
  "papas-louie-1": "https://ubghyper.github.io/GameList.github.io/Papas-Louie-1/",
  "papas-louie-2": "https://ubghyper.github.io/GameList.github.io/Papas-Louie-2/",
  "papas-louie-3": "https://ubghyper.github.io/GameList.github.io/Papas-Louie-3/",

  // Basketball Stars & Sports
  "basketball-stars": "https://joe-the-chicken.github.io/basketball-stars/",
  "potatoes-basketball-stars": "https://joe-the-chicken.github.io/basketball-stars/",

  // Pool Ball / 8-Ball Pool (Clean HTML5 Canvas)
  "pool-ball": "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",
  "potatoes-pool-ball": "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",
  "8-ball-pool": "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",

  // Geometry Dash (7zeb Remastered Godot Build)
  "geometry-dash": "https://7zeb.github.io/homework/geometry-dash-remastered/index.html",
  "potatoes-geometry-dash": "https://7zeb.github.io/homework/geometry-dash-remastered/index.html",
  "potatoes-geometry-dash-sub-zero": "https://7zeb.github.io/homework/geometry-dash-remastered/index.html",
  "potatoes-geometry-dash-meltdown": "https://7zeb.github.io/homework/geometryvibes.html",

  // Snow Rider 3D & Monkey Mart: 7zeb host
  "snow-rider-3d": "https://7zeb.github.io/homework/snowrider.html",
  "monkey-mart": "https://7zeb.github.io/homework/monkey-mart/index.html",

  // FNAF Series (7zeb & academics-study clean ports)
  "fnaf-1": "https://7zeb.github.io/homework/fnaf.html",
  "fnaf-2": "https://academics-study.github.io/hd_fnaf/2/",
  "fnaf-3": "https://academics-study.github.io/hd_fnaf/3/",
  "fnaf-4": "https://academics-study.github.io/hd_fnaf/4/",
  "potatoes-fnaf-browser": "https://7zeb.github.io/homework/fnaf.html",
  "fnaf-world": "https://irv77.github.io/hd_fnaf/w/",
  "fnaf-sister-location": "https://irv77.github.io/hd_fnaf/sl/",
  "fnaf-5": "https://irv77.github.io/hd_fnaf/sl/",
  "five-nights-at-freddys-pizzeria-simulator": "https://irv77.github.io/hd_fnaf/ps/",
  "fnaf-pizzasim": "https://irv77.github.io/hd_fnaf/ps/",
  "fnaf-ucn": "https://irv77.github.io/hd_fnaf/ucn/",

  // Top Games on 7zeb, Academics-Study, and JavaSpence (Zero Securly blocks)
  "retro-bowl": "https://retro--bowl.pages.dev/",
  "potatoes-retro-bowl": "https://retro--bowl.pages.dev/",
  "slope": "https://7zeb.github.io/homework/slope.html",
  "subway-surfers": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers-havana": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers-hong-kong": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers-iceland": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "drive-mad": "https://academics-study.github.io/drive-mad/",
  "cookie-clicker": "https://7zeb.github.io/homework/cookieclicker.html",
  "moto3xm": "https://7zeb.github.io/homework/motox3m.html",
  "potatoes-moto-x3m": "https://7zeb.github.io/homework/motox3m.html",
  "crossy-road": "https://7zeb.github.io/homework/crossyroad.html",
  "potatoes-crossy-road": "https://7zeb.github.io/homework/crossyroad.html",
  "tiny-fishing": "https://7zeb.github.io/homework/tinyfishing.html",
  "doodle-jump": "https://7zeb.github.io/homework/doodlejump.html",
  "drift-boss": "https://7zeb.github.io/homework/driftboss.html",
  "bitlife": "https://7zeb.github.io/homework/bit-life/index.html",
  "2048": "games/2048.html",
  "flappy-bird": "games/flappy.html",
  "potatoes-flappy-bird": "games/flappy.html",
  "tetris": "games/tetris.html",
  "potatoes-tetris": "games/tetris.html",
  "potatoes-the-impossible-quiz": "https://7zeb.github.io/homework/theimpossiblequiz.html",
  "potatoes-rooftop-snipers": "https://7zeb.github.io/homework/rooftopsnipers.html",
  "potatoes-run-3": "https://7zeb.github.io/homework/run3.html",
  "potatoes-jetpack-joyride": "https://7zeb.github.io/homework/jetpackjoyride.html",
  "potatoes-pacman": "https://7zeb.github.io/homework/pacman.html",
  "potatoes-eggy-car": "https://7zeb.github.io/homework/eggycar.html",
  "potatoes-granny": "https://7zeb.github.io/homework/granny.html",
  "potatoes-granny-2": "https://7zeb.github.io/homework/granny2.html",
  "potatoes-red-ball-4": "https://7zeb.github.io/homework/redball4vol1.html",
  "potatoes-temple-run-2": "https://7zeb.github.io/homework/templerun2.html",
  "potatoes-vex-7": "https://7zeb.github.io/homework/vex7.html",
  "potatoes-vex-8": "https://7zeb.github.io/homework/vex8.html",
  "potatoes-tunnel-rush": "https://7zeb.github.io/homework/tunnelrush.html",
  "getting-over-it": "https://gameinclassroom.github.io/getting-over-it/",
  "potatoes-getting-over-it": "https://gameinclassroom.github.io/getting-over-it/",
  "achievement-unlocked": "https://gameinclassroom.github.io/achievement-unlocked/",
  "achievement-unlocked-2": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-2/achievementunlocked2.swf&title=Achievement+Unlocked+2",
  "achievement-unlocked-3": "games/flash-player.html?swf=https://ubghyper.github.io/GameList.github.io/Achievement-Unlocked-3/achievementunlocked3.swf&title=Achievement+Unlocked+3",
  "potatoes-rooftop-sniper-2": "https://gameinclassroom.github.io/rooftop-snipers-2/",
  "kindergarten": "games/kindergarten.html",
  "kindergarten-2": "games/kindergarten-2.html",
  "the-man-in-the-window": "games/the-man-in-the-window.html",
  "themanfromthewindow": "games/the-man-in-the-window.html",
  "case-opener": "games/case-opener.html",
  "minecraft-case-simulator": "games/case-opener.html",

  // Other essential games
  "sawyer-for-sawyer": "games/a-small-world-cup.html",
  "a-small-world-cup": "games/a-small-world-cup.html",
  "asmallworldcup": "games/a-small-world-cup.html",
  "duck-life": "games/duck-life-1.html",
  "ducklife": "games/duck-life-1.html",
  "duck-life-1": "games/duck-life-1.html",
  "ducklife1": "games/duck-life-1.html",
  "duck-life-2": "games/duck-life-2.html",
  "ducklife2": "games/duck-life-2.html",
  "strongdog-ducklife2": "games/duck-life-2.html",
  "duck-life-3": "games/duck-life-3.html",
  "ducklife3": "games/duck-life-3.html",
  "strongdog-ducklife3": "games/duck-life-3.html",
  "duck-life-4": "games/duck-life-4.html",
  "ducklife4": "games/duck-life-4.html",
  "duck-life-5": "games/duck-life-5.html",
  "ducklife5": "games/duck-life-5.html",
  "duck-life-space": "games/duck-life-4.html",
  "ducklifespace": "games/duck-life-4.html",
  "duck-life-battle": "games/duck-life-3.html",
  "ducklifebattle": "games/duck-life-3.html",
  "jacksmith": "https://ubghyper.github.io/GameList.github.io/Jacksmith/",
  "learntofly": "https://gameinclassroom.github.io/learn-to-fly/",
  "learntofly2": "https://ubghyper.github.io/GameList.github.io/Learn-To-Fly-2/",
  "raft-wars": "https://gameinclassroom.github.io/raft-wars/",
  "raft-wars-2": "https://gameinclassroom.github.io/raft-wars-2/",
  "potatoes-raft-wars-2": "https://gameinclassroom.github.io/raft-wars-2/",
  "potatoes-friday-night-funkin-vs-miku": "https://gameinclassroom.github.io/fnf-hatsune-miku/",
  "potatoes-cookie-clicker-scratch": "https://7zeb.github.io/homework/cookieclicker.html",
  "potatoes-tanuki-sunset": "https://gameinclassroom.github.io/tanuki-sunset/",
  "potatoes-slope-alt": "https://7zeb.github.io/homework/slope.html",
  "potatoes-time-shooter-2": "https://gameinclassroom.github.io/time-shooter-2/",
  "potatoes-stick-war-infinity-duel": "https://freeonlinewebtools.github.io/gamelist3.github.io/Stickman-Duel/",
  "the-impossible-quiz-deluxe": "https://7zeb.github.io/homework/theimpossiblequiz.html",

  // Real Authentic Game Overrides (Zero fraudulent redirects)
  "dumb-ways-to-die": "games/dumb-ways-to-die.html",
  "dumbwaystodie": "games/dumb-ways-to-die.html",
  "potatoes-dumb-ways-to-die": "games/dumb-ways-to-die.html",
  "happywheels": "https://gameinclassroom.github.io/happy-wheels/",
  "potatoes-happy-wheels": "https://gameinclassroom.github.io/happy-wheels/",
  "thebindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "bindingofisaac": "https://flyingsully.github.io/GameList.github.io/Binding-Of-Isaac/",
  "hoop-royale": "https://ubghyper.github.io/GameList.github.io/Hoop-Royale/",
  "super-mario-64": "https://gameinclassroom.github.io/super-mario-64/",
  "supermario64": "https://gameinclassroom.github.io/super-mario-64/",
  "super-mario-63": "https://ubghyper.github.io/GameList.github.io/Super-Mario-63/",
  "supermario63": "https://ubghyper.github.io/GameList.github.io/Super-Mario-63/",
  "vex-1": "https://ubghyper.github.io/GameList.github.io/Vex-1/",
  "vex-2": "https://ubghyper.github.io/GameList.github.io/Vex-2/",
  "vex-3": "https://gameinclassroom.github.io/vex-3/",
  "potatoes-vex-3": "https://gameinclassroom.github.io/vex-3/",
  "apple-shooter": "https://7zeb.github.io/homework/steal-a-brainrot/go/apple-shooter.html",
  "potatoes-apple-shooter": "https://7zeb.github.io/homework/steal-a-brainrot/go/apple-shooter.html",
  "donkey-kong": "games/flash-player.html?swf=https://raw.githubusercontent.com/BinBashBanana/gstore/master/donkeykong.swf&title=Donkey+Kong",
  "potatoes-donkey-kong": "games/flash-player.html?swf=https://raw.githubusercontent.com/BinBashBanana/gstore/master/donkeykong.swf&title=Donkey+Kong",
  "jelly-truck": "games/flash-player.html?swf=https://raw.githubusercontent.com/BinBashBanana/gstore/master/jellytruck.swf&title=Jelly+Truck",
  "worlds-hardest-game": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Worlds-Hardest-Game/Worlds-Hardest-Game.swf&title=The+World%27s+Hardest+Game",
  "the-worlds-hardest-game": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Worlds-Hardest-Game/Worlds-Hardest-Game.swf&title=The+World%27s+Hardest+Game",
  "worlds-hardest-game-3": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Worlds-Hardest-Game-3/Worlds-Hardest-Game-3.swf&title=The+World%27s+Hardest+Game+3",
  "cursed-treasure-2": "games/flash-player.html?swf=https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/Cursed-Treasure-2/cursedtreasure2.swf&title=Cursed+Treasure+2",
  "death-run-3d": "https://7zeb.github.io/homework/steal-a-brainrot/go/death-run-3d.html",
  "potatoes-death-run": "https://7zeb.github.io/homework/steal-a-brainrot/go/death-run-3d.html",
  "vex-4": "https://gameinclassroom.github.io/vex-4/",
  "potatoes-vex-4": "https://gameinclassroom.github.io/vex-4/",
  "vex-5": "https://gameinclassroom.github.io/vex-5/",
  "potatoes-vex-5": "https://gameinclassroom.github.io/vex-5/",
  "vex-6": "https://gameinclassroom.github.io/vex-6/",
  "potatoes-vex-6": "https://gameinclassroom.github.io/vex-6/",
  "sausage-flip": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "sausage-run": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "potatoes-sausage-run": "https://7zeb.github.io/homework/steal-a-brainrot/go/sausage-flip.html",
  "extreme-air-hockey": "https://7zeb.github.io/homework/steal-a-brainrot/go/air-hockey-championship-deluxe.html",
  "potatoes-extreme-air-hockey": "https://7zeb.github.io/homework/steal-a-brainrot/go/air-hockey-championship-deluxe.html",
  "marble-run": "https://7zeb.github.io/homework/steal-a-brainrot/go/marble-dash.html",
  "potatoes-marble-run": "https://7zeb.github.io/homework/steal-a-brainrot/go/marble-dash.html",
  "gta-for-browser": "https://7zeb.github.io/homework/GTAA.html",
  "potatoes-gta-for-browser": "https://7zeb.github.io/homework/GTAA.html",
  "room-clicker": "https://7zeb.github.io/homework/steal-a-brainrot/go/happy-room.html",
  "potatoes-room-clicker": "https://7zeb.github.io/homework/steal-a-brainrot/go/happy-room.html",
  "people-playground": "https://freeonlinewebtools.github.io/gamelist2.github.io/people-playground/",
  "peopleplayground": "https://freeonlinewebtools.github.io/gamelist2.github.io/people-playground/"
};

const FRAUDULENT_MISMATCHED_IDS = new Set([
  "--test",
  "potatoes-bob-against-the-world",
  "potatoes-elastic-morty",
  "potatoes-how-to-get-fortnite",
  "potatoes-sus",
  "potatoes-ultimate-bro-workout",
  "potatoes-3-little-heroes",
  "potatoes-tiny-castle",
  "potatoes-squid-game-2",
  "potatoes-fall-boys",
  "potatoes-stumble-guys",
  "potatoes-poppy-playtime",
  "potatoes-huggy-wuggy-horror",
  "potatoes-do-not-open-horror-game",
  "potatoes-five-nights-at-winstons",
  "potatoes-burning-rubber-5-xs",
  "potatoes-spiral-roll",
  "potatoes-color-road",
  "potatoes-fliphero-io",
  "potatoes-html5-2d-games",
  "potatoes-mr-fight",
  "potatoes-knife-hit",
  "potatoes-cycle-extreme",
  "potatoes-idle-miners-tycoon",
  "potatoes-random-stuff",
  "potatoes-dune",
  "potatoes-shards",
  "potatoes-acid-bunny",
  "potatoes-acid-bunny-2",
  "potatoes-io-games",
  "potatoes-gartic-io",
  "potatoes-eat-io",
  "potatoes-biters-io",
  "potatoes-agar-io",
  "potatoes-roblox",
  "potatoes-craftmine",
  "potatoes-cube-craft-survival",
  "potatoes-mine-shooter",
  "potatoes-pixel-craft",
  "potatoes-gangsters",
  "potatoes-tanks-vs-zombies",
  "potatoes-stick-slashers",
  "potatoes-zombie-killer",
  "potatoes-tower-builder",
  "potatoes-dino-run-3"
]);

export function getCanonicalGameKey(g: { id?: string; title?: string }): string {
  if (!g) return '';
  const id = (g.id || '').toLowerCase().trim();
  if (FRAUDULENT_MISMATCHED_IDS.has(id)) return '__skip__';
  if (id === 'soccer-random-1') return 'soccerrandom';
  if (id === 'papa-scoop-alt') return 'papasscooperia';
  if (id === 'themanfromthewindow') return 'themaninthewindow';

  const cleanTitle = (g.title || '')
    .toLowerCase()
    .replace(/&#39;/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/&quot;/g, '')
    .replace(/[^a-z0-9]/g, '');

  const cleanId = id
    .replace(/^potatoes-/, '')
    .replace(/-alt$/, '')
    .replace(/^7zeb-/, '')
    .replace(/[^a-z0-9]/g, '');

  // Bloons TD canonical keys
  if (cleanId === 'bloonstd' || cleanId === 'bloonstowerdefence' || cleanTitle === 'bloonstowerdefence' || cleanTitle === 'bloonstd' || cleanTitle === 'bloonstowerdefence1') return 'bloonstd1';
  if (cleanId === 'bloonstd2' || cleanId === 'bloonstowerdefence2' || cleanTitle === 'bloonstowerdefence2' || cleanTitle === 'bloonstd2') return 'bloonstd2';
  if (cleanId === 'bloonstd3' || cleanId === 'bloonstowerdefence3' || cleanTitle === 'bloonstowerdefence3' || cleanTitle === 'bloonstd3') return 'bloonstd3';
  if (cleanId === 'bloonstd4' || cleanTitle === 'bloonstd4') return 'bloonstd4';
  if (cleanId === 'bloonstd5' || cleanTitle === 'bloonstd5' || cleanTitle === 'bloonstd5') return 'bloonstd5';

  // Duck Life canonical keys
  if (cleanId === 'ducklife' || cleanTitle === 'ducklife') return 'ducklife1';
  if (cleanId === 'ducklife2' || cleanTitle === 'ducklife2' || cleanTitle === 'ducklife2worldchampion') return 'ducklife2';
  if (cleanId === 'ducklife3' || cleanTitle === 'ducklife3' || cleanTitle === 'ducklife3evolution') return 'ducklife3';
  if (cleanId === 'ducklife4' || cleanTitle === 'ducklife4') return 'ducklife4';
  if (cleanId === 'ducklife5' || cleanTitle === 'ducklife5' || cleanTitle === 'ducklife5treasurehunt') return 'ducklife5';
  if (cleanId === 'ducklifespace' || cleanTitle === 'ducklifespace') return 'ducklifespace';
  if (cleanId === 'ducklifebattle' || cleanTitle === 'ducklifebattle') return 'ducklifebattle';

  // Spaceflight, Diep, Agar canonical keys
  if (cleanId.includes('spaceflightsimulator') || cleanTitle.includes('spaceflightsimulator')) return 'spaceflightsimulator';
  if (cleanId === 'diepio' || cleanTitle === 'diepio') return 'diepio';
  if (cleanId === 'agario' || cleanTitle === 'agario') return 'agario';

  return cleanTitle || cleanId;
}

const SEVEN_ZEB_METADATA: Record<string, { title: string; category: string; description: string; author?: string; thumbnail?: string }> = {
  "112": { title: "Minecraft 1.12", category: "Adventure", description: "Experience classic Minecraft Java Edition version 1.12 with world generation, crafting, and survival.", thumbnail: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&auto=format&fit=crop&q=80" },
  "1v1lol1": { title: "1v1.LOL", category: "Action", description: "Battle Royale building and shooting simulator. Out-build and out-gun your opponent in fast-paced 1v1 combat.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "2048cupcakes": { title: "2048 Cupcakes", category: "Puzzle", description: "Delicious cupcake-themed edition of 2048. Slide sweet pastries to combine them into the ultimate cupcake confection!", thumbnail: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80" },
  "3dflightsimulator": { title: "3D Flight Simulator", category: "Simulation", description: "Take controls of realistic aircraft, cruise through clear skies, navigate airport runways, and master authentic flight physics.", thumbnail: "https://images.unsplash.com/photo-1517976487507-5b3b4b45f942?w=600&auto=format&fit=crop&q=80" },
  "alpha126": { title: "Minecraft Alpha 1.2.6", category: "Adventure", description: "Step back into the historic Halloween update of Minecraft Alpha 1.2.6 with early biomes, Nether portals, and nostalgic mechanics.", thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80" },
  "beta13": { title: "Minecraft Beta 1.3", category: "Adventure", description: "Relive Minecraft Beta 1.3 featuring smooth lighting, beds, repeaters, redstone logic, and classic terrain generation.", thumbnail: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&auto=format&fit=crop&q=80" },
  "gtaa": { title: "Grand Theft Auto Advance", category: "Action", description: "Top-down retro open-world crime thriller set in Liberty City with vehicles, missions, and action.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "hhbrowse": { title: "H&H Browse", category: "Arcade", description: "Explore the H&H interactive browser portal and web arcade showcase.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "hhcrossy": { title: "H&H Crossy Road", category: "Arcade", description: "Hop, dodge, and cross endless busy highways, raging rivers, and railroad tracks without getting hit!", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80" },
  "hopterroyale": { title: "Hopter Royale", category: "Action", description: "Multiplayer aerial helicopter battle arena. Shoot rival choppers, collect powerups, and rule the skies.", thumbnail: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80" },
  "indev": { title: "Minecraft Indev", category: "Adventure", description: "Explore Minecraft Indev 0.31, the pioneering development phase with floating islands and custom world types.", thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80" },
  "agariolite": { title: "Agar.io Lite", category: "Action", description: "Smooth lightweight edition of Agar.io. Eat nutrient orbs, split strategically, and grow to dominate the cell arena.", thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80" },
  "angrybirds": { title: "Angry Birds", category: "Arcade", description: "Launch the flock with precision trajectory! Demolish piggy structures and reclaim stolen eggs across dozens of levels.", thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
  "angrybirdsshowdown": { title: "Angry Birds Showdown", category: "Arcade", description: "Competitive high-speed slingshot duels against rival bird masters in intense physics destruction challenges.", thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80" },
  "angrybirdsspace": { title: "Angry Birds Space", category: "Arcade", description: "Catapult the birds through cosmic gravitational fields, planetary orbits, and zero-G space environments!", thumbnail: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80" },
  "brawlstarsprojectlaser": { title: "Brawl Stars: Project Laser", category: "Action", description: "The original retro Project Laser 8-bit space shooter prototype from Supercell's universe.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "cardrawing": { title: "Draw Climber / Car Drawing", category: "Casual", description: "Draw custom wheels and legs to guide your vehicle over hills, ramps, and obstacle-filled tracks.", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80" },
  "carkingarena": { title: "Car King Arena", category: "Action", description: "Smash, ram, and outmaneuver enemy cars in a demolition derby battle royale to claim the crown!", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "chess": { title: "Master Chess", category: "Strategy", description: "Play the timeless game of strategy against challenging chess engines with multi-level AI.", thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80" },
  "chinesefortnite": { title: "Chinese Fortnite (Mini Battle)", category: "Action", description: "Fast-paced top-down mini battle royale shooter featuring loot chests, storm circles, and multiplayer action.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "cleanupio": { title: "Clean Up IO", category: "Action", description: "Vacuum up trash, furniture, vehicles, and entire city blocks to expand your cleaning vacuum.", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
  "crazycrashlanding": { title: "Crash Landing 3D", category: "Simulation", description: "Pilot damaged aircraft under extreme emergency conditions and perform emergency crash landings safely.", thumbnail: "https://images.unsplash.com/photo-1517976487507-5b3b4b45f942?w=600&auto=format&fit=crop&q=80" },
  "crazymotorcycle": { title: "Crazy Motorcycle", category: "Sports", description: "Perform heart-stopping stunts, backflips, and 360 air-spins across dangerous stunt courses on a motorcycle.", thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80" },
  "dkcountry": { title: "Donkey Kong Country", category: "Adventure", description: "The groundbreaking SNES platformer starring Donkey Kong and Diddy Kong collecting bananas across DK Island.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "dkcountry2": { title: "Donkey Kong Country 2: Diddy's Kong Quest", category: "Adventure", description: "Embark on Crocodile Isle to rescue DK with Diddy and Dixie Kong's helicopter hair spin.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "dkcountry3": { title: "Donkey Kong Country 3: Dixie Kong's Double Trouble", category: "Adventure", description: "Join Dixie Kong and baby Kiddy Kong exploring the Northern Kremisphere in classic 16-bit beauty.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "eagleride": { title: "Eagle Ride", category: "Arcade", description: "Soar through a dense pine forest at extreme speeds as a majestic eagle avoiding trees and rocks.", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80" },
  "fifa7": { title: "FIFA 07", category: "Sports", description: "Classic EA Sports FIFA 07 soccer. Pick your world football club and score unforgettable goals.", thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80" },
  "fnaf": { title: "Five Nights at Freddy's", category: "Action", description: "Survive your night shift at Freddy Fazbear's Pizza while monitoring security cameras and preserving power.", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
  "footballbros": { title: "Football Bros", category: "Sports", description: "Multiplayer arcade American football with quick passing, fierce tackles, and touchdown celebrations.", thumbnail: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&auto=format&fit=crop&q=80" },
  "footballlegends": { title: "Football Legends 2021", category: "Sports", description: "Play 1v1 and 2v2 big-head soccer matches with special super shots, headers, and tournament cups.", thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80" },
  "gameoflife": { title: "Conway's Game of Life", category: "Simulation", description: "Explore cellular automaton patterns, gliders, oscillators, and emergent behavior in this interactive simulator.", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
  "geometrydashremastered": { title: "Geometry Dash Remastered", category: "Arcade", description: "Jump and fly your way through danger in this rhythm-based platformer synced to pulsing techno soundtracks.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "geometryvibes": { title: "Geometry Vibes", category: "Arcade", description: "A chill rhythmic geometric runner packed with neon aesthetics, obstacle timings, and smooth beats.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "googledino": { title: "Chrome Dino Game", category: "Arcade", description: "The beloved offline T-Rex runner! Leap over cacti and duck beneath pterodactyls in high-speed infinite desert runs.", thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80" },
  "gta1": { title: "Grand Theft Auto (Classic)", category: "Action", description: "The iconic original top-down 1997 crime epic that started the Grand Theft Auto revolution.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "hanger2": { title: "Hanger 2", category: "Action", description: "Swing through treacherous obstacle courses using your grappling rope without losing limbs!", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80" },
  "highwaytraffic": { title: "Highway Traffic Racer", category: "Racing", description: "Weave through bumper-to-bumper city highway traffic at breakneck speeds without crashing.", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "jumpingshell": { title: "Jumping Shell", category: "Puzzle", description: "A clever thinking platformer where you shed layers of shells to squeeze through narrow passageways.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "kartbros": { title: "Kart Bros", category: "Racing", description: "Hilarious multiplayer go-kart racing packed with banana peels, turbo boosts, and drift corners.", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "mariogame": { title: "Super Mario Bros.", category: "Adventure", description: "The legendary NES platformer by Nintendo! Stomp Goombas, enter warp pipes, and rescue Princess Peach.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "mc18": { title: "Minecraft 1.8.8 (Eaglercraft)", category: "Adventure", description: "Full browser-playable Minecraft 1.8.8 with multiplayer server support, survival, creative mode, and custom skins.", thumbnail: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&auto=format&fit=crop&q=80" },
  "minesweeper": { title: "Minesweeper Classic", category: "Puzzle", description: "Clear the minefield using logic deduction, flags, and number clues without detonating a bomb.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "motox3mspookyland": { title: "Moto X3M 6: Spooky Land", category: "Sports", description: "Ride through terrifying haunted trials, bone tracks, witch cauldrons, and fiery pumpkin hazards!", thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80" },
  "noobminer": { title: "Noob Miner: Jailbreak", category: "Adventure", description: "Dig, mine ores, trade with merchants, and upgrade pickaxes to orchestrate your great escape from prison.", thumbnail: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&auto=format&fit=crop&q=80" },
  "oppositeday": { title: "Opposite Day Game", category: "Puzzle", description: "Nothing is as it seems! Think backwards and break conventional game logic to solve bizarre puzzles.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "parkingfury": { title: "Parking Fury", category: "Casual", description: "Maneuver sports cars and trucks into tight parking spots without scratching the paintwork.", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "parkingfury2": { title: "Parking Fury 2", category: "Casual", description: "Navigate crowded nighttime parking lots under rainy city lights with precision steering.", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "parkingfury3": { title: "Parking Fury 3", category: "Casual", description: "Steer luxury sedans and heavy rigs into challenging target bays in bustling multi-level garages.", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "pixelspeedrun": { title: "Pixel Speedrun", category: "Arcade", description: "Test your twitch reflexes in micro-second platforming sprints filled with spikes and springs.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "plantsvszombies": { title: "Plants vs Zombies", category: "Strategy", description: "Defend your suburban lawn from hilarious zombies using pea shooters, wall-nuts, cherry bombs, and sunflowers!", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" },
  "ragdollhit": { title: "Ragdoll Hit", category: "Action", description: "Kick, punch, and smash floppy ragdoll enemies across physics-based combat arenas.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "ragdollsoccer": { title: "Ragdoll Soccer 2 Player", category: "Sports", description: "Hilarious floppy ragdoll soccer physics with bouncy balls, overhead kicks, and unpredictable goals.", thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80" },
  "redball4vol1": { title: "Red Ball 4: Vol 1", category: "Adventure", description: "Roll and bounce through verdant hills to stop the evil gray squares from turning the round world square!", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "rocketleague2d": { title: "Rocket League 2D", category: "Sports", description: "High-flying rocket cars meet soccer in this awesome side-scrolling aerial aerial-goal arena.", thumbnail: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80" },
  "rocketsoccerderby": { title: "Rocket Soccer Derby", category: "Sports", description: "3D vehicular soccer championship! Boost into supersonic speeds, launch off walls, and slam the ball into the net.", thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80" },
  "sandgame": { title: "Falling Sand Game", category: "Simulation", description: "Experiment with physics sand, water, fire, plant life, gun powder, acid, and oil in a relaxing sandbox.", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
  "shortlife": { title: "Short Life", category: "Action", description: "Guide your clumsy hero past razor-sharp spikes, swinging pendulum blades, and explosive mines.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "slope3": { title: "Slope 3", category: "Arcade", description: "Roll a high-velocity neon sphere down infinite 3D downhill ramps, navigating twists, jumps, and tunnels.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "sm64": { title: "Super Mario 64 (HTML5)", category: "Adventure", description: "The revolutionary 3D platforming masterpiece! Triple jump, ground pound, and collect Power Stars inside Princess Peach's castle.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "snowballio": { title: "Snowball.io", category: "Action", description: "Roll massive snowballs and blast rival players off the icy floating iceberg to become the ultimate snow champion.", thumbnail: "https://images.unsplash.com/photo-1517867065801-e20f409696b0?w=600&auto=format&fit=crop&q=80" },
  "snowrider": { title: "Snow Rider 3D", category: "Sports", description: "Slide down snowy mountain peaks on a toboggan sled, collecting gifts and avoiding boulders and trees.", thumbnail: "https://images.unsplash.com/photo-1517867065801-e20f409696b0?w=600&auto=format&fit=crop&q=80" },
  "snowroad": { title: "Snow Road", category: "Sports", description: "Speed through winter wonderlands on a fast snowmobile with jumps, ramps, and obstacles.", thumbnail: "https://images.unsplash.com/photo-1517867065801-e20f409696b0?w=600&auto=format&fit=crop&q=80" },
  "sonicoriginal": { title: "Sonic The Hedgehog (Original)", category: "Adventure", description: "Spin-dash through Green Hill Zone at supersonic speed with Sega's legendary blue blur Sonic!", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "source1v1lolreloadedcom": { title: "1v1.LOL Reloaded", category: "Action", description: "Community edition of 1v1.LOL featuring custom weapon loadouts, build practice, and snappy aim trainers.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "stack": { title: "Stack Tower 3D", category: "Arcade", description: "Timing is everything! Stack colored geometric blocks as high as possible without shaving off edges.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "stateio": { title: "State.io - Conquer the World", category: "Strategy", description: "Dispatch troop armies across borders, capture neutral territories, and conquer enemy nations in real-time tactical war.", thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80" },
  "stealabrainrot": { title: "Steal a Brainrot", category: "Casual", description: "Collect quirky brainrot memes, trade rare icons, and laugh through funny viral internet mini-games.", thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80" },
  "subwaysurfersny": { title: "Subway Surfers: New York", category: "Arcade", description: "Dash through the iconic New York City subway tunnels, grind gleaming train tracks, and dodge the grumpy inspector!", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "subwaysurfersbeijing": { title: "Subway Surfers: Beijing", category: "Arcade", description: "Sprint through Beijing's scenic subway tracks adorned with dragon lanterns and bustling neon stations.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "subwaysurferssanfrancisco": { title: "Subway Surfers: San Francisco", category: "Arcade", description: "Surf along the hilly tracks and cable-car rails under the golden arches of San Francisco.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "taproad": { title: "Tap Road", category: "Arcade", description: "Switch lanes with instantaneous precision to survive high-speed neon cyber raceways.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "theescape": { title: "The Escape", category: "Puzzle", description: "Search for hidden clues, decipher cryptic riddles, and escape complex locked containment facilities.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "trapthecat": { title: "Trap The Cat (Chat Noir)", category: "Puzzle", description: "Block hexagons on a grid to encircle the sly black cat before it escapes off the edges.", thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80" },
  "triviacrack": { title: "Trivia Crack", category: "Casual", description: "Spin the wheel and test your intellect across science, entertainment, history, geography, sports, and art!", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "unicyclehero": { title: "Unicycle Hero", category: "Sports", description: "Balance precariously on a unicycle while hurling javelins, throwing shot puts, and jumping hurdles.", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "wartheknights": { title: "War of the Knights", category: "Action", description: "Clash in epic medieval sword duels, parry heavy swings, and conquer ancient castle fortifications.", thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
  "wheeliebike": { title: "Wheelie Bike", category: "Sports", description: "Maintain the wheelie angle for as long as possible without letting your front wheel touch the ground.", thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80" },
  "wordleunlimited": { title: "Wordle Unlimited", category: "Puzzle", description: "Guess the hidden 5-letter word in six tries with color-coded tile feedback. Play unlimited words daily!", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80" },
  "zombierush": { title: "Zombie Rush", category: "Action", description: "Fend off relentless waves of bloodthirsty zombies with shotguns, assault rifles, and barricades.", thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80" }
};

function buildDefaultGames(): Game[] {
  const seenIds = new Set<string>();
  const gamesByKey = new Map<string, Game>();
  const games: Game[] = [];

  const normalizeGame = (g: Game, defaultCategory: string): Game => {
    let initialSrc = g.iframeSrc || '';
    if (URL_OVERRIDES[g.id]) {
      initialSrc = URL_OVERRIDES[g.id];
    } else if (initialSrc.startsWith('/g/')) {
      const slug = initialSrc.replace(/^\/g\//, '').replace(/\/$/, '');
      initialSrc = `https://ubghyper.github.io/GameList.github.io/${slug}/`;
    }

    const { src, mirrors } = resolveGameSource(g.id, g.title, initialSrc, g.mirrors);

    // Decode any HTML entities in title
    const cleanTitle = (g.title || '')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');

    return {
      ...g,
      title: cleanTitle,
      iframeSrc: src,
      mirrors,
      sandbox: undefined, // Unrestricted so Unity and HTML5 games load without sandbox errors
      iframeCode: formatGameIframe(cleanTitle, src),
      secondaryCategory: g.secondaryCategory || defaultCategory
    };
  };

  const addGameCandidate = (rawGame: Game, defaultCategory: string) => {
    if (!rawGame || !rawGame.id) return;
    const key = getCanonicalGameKey(rawGame);
    if (!key || key === '__skip__') return;

    if (gamesByKey.has(key) || seenIds.has(rawGame.id)) {
      // Replicate detected! Deduplicate and merge tags/mirrors into existing
      const existing = gamesByKey.get(key) || games.find(g => g.id === rawGame.id);
      if (existing) {
        if (Array.isArray(rawGame.tags)) {
          const tagSet = new Set(existing.tags || []);
          rawGame.tags.forEach(t => tagSet.add(t));
          if (rawGame.secondaryCategory === 'Potato Classics' || rawGame.id.startsWith('potatoes-')) {
            tagSet.add('Potato Classics');
          }
          existing.tags = Array.from(tagSet);
        }
        if (Array.isArray(rawGame.mirrors)) {
          const mirrorSet = new Set(existing.mirrors || []);
          rawGame.mirrors.forEach(m => mirrorSet.add(m));
          existing.mirrors = Array.from(mirrorSet);
        }
      }
      return;
    }

    const game = normalizeGame(rawGame, defaultCategory);
    gamesByKey.set(key, game);
    seenIds.add(game.id);
    games.push(game);
  };

  // Add curated games first (highest priority)
  for (const g of CURATED_GAMES) {
    addGameCandidate(g, 'Potato Classics');
  }

  // Add all games from TrippleThePotatoes collection (deduplicated against curated)
  for (const g of TRIPPLE_POTATOES_GAMES) {
    addGameCandidate(g, 'Potato Classics');
  }

  // Add ubg filtered games (deduplicated against curated and potatoes)
  for (const g of (ubgGamesList as unknown as Game[])) {
    addGameCandidate(g, 'Unblocked Archive');
  }

  // Add all StrongDog XP games (deduplicated against all above with tag & mirror merge)
  for (const g of (strongdogGamesList as unknown as Game[])) {
    addGameCandidate(g, 'StrongDog XP');
  }

  // Add all unblocked 7zeb games
  for (const [key, url] of Object.entries(sevenZebMap as Record<string, string>)) {
    if (key === 'crazytaxi' || url.includes('crazy-taxi')) continue;

    const meta = SEVEN_ZEB_METADATA[key] || {
      title: key.charAt(0).toUpperCase() + key.slice(1),
      category: 'Arcade',
      description: `Play unblocked ${key} with smooth 60 FPS performance, verified unblocked school mirrors, and full audio support.`,
      thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"
    };

    const newGame: Game = {
      id: `7zeb-${key}`,
      source: 'unblocked',
      title: meta.title,
      description: meta.description,
      category: meta.category,
      secondaryCategory: "Owen Watermelon OG’s",
      thumbnail: meta.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      mirrors: [
        url,
        `/api/proxy/game?url=${encodeURIComponent(url)}`
      ],
      tags: [meta.title, '7zeb', 'Unblocked', 'Owen OG', meta.category],
      rating: 4.9,
      plays: Math.floor(150000 + (key.length * 12345) % 150000),
      author: meta.author || 'Owen OG',
      featured: false,
      iframeSrc: url,
      iframeCode: `<iframe class="game-iframe" id="game-area" title="${meta.title}" src="${url}" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`
    };

    addGameCandidate(newGame, "Owen Watermelon OG’s");
  }

  return games;
}

export const DEFAULT_GAMES: Game[] = buildDefaultGames();
