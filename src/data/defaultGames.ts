import { Game } from '../types/game';
import ubgGamesList from './ubgFilteredGames.json';
import { TRIPPLE_POTATOES_GAMES } from './tripplePotatoesGames';
import { resolveGameSource } from './unblockedResolver';

const CURATED_GAMES: Game[] = [
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
      "games/sawyer-for-sawyer.html",
      "games/a-small-world-cup.html",
      "games/a-small-world-cup/index.html",
      "https://asmallworldcup.gitlab.io/file/"
    ],
    tags: ["Sawyer For Sawyer", "A Small World Cup", "2 Player", "2 Player Games", "Two Player", "Soccer", "Ragdoll", "Physics", "Tournament", "Unblocked"],
    rating: 5.0,
    plays: 142000,
    author: "Rasto",
    featured: true,
    iframeSrc: "games/sawyer-for-sawyer.html",
    iframeCode: `<iframe class="game-iframe" id="game-area" title="A Small World Cup (Sawyer For Sawyer)" src="games/sawyer-for-sawyer.html" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
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
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80",
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
    thumbnail: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80",
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
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Pool-Ball/logo.png",
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
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Cookie-Clicker/cookie.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Cookie-Clicker/cookie.png",
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
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Subway-Surfers/thumb.png",
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
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Monkey-Mart/logo.png",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Monkey-Mart/logo.png",
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
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Basketball-Stars/assets/images/basketball-stars.png",
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

  // .io Games (Direct Working Clones without ad/argix redirects)
  "agar-io": "https://7zeb.github.io/homework/agariolite.html",
  "potatoes-agar-io": "https://7zeb.github.io/homework/agariolite.html",
  "agariolite": "https://7zeb.github.io/homework/agariolite.html",
  "potatoes-io-games": "https://7zeb.github.io/homework/agariolite.html",
  "slither-io": "https://gameinclassroom.github.io/blocky-snakes/",
  "slitherio": "https://gameinclassroom.github.io/blocky-snakes/",
  "potatoes-slither-io": "https://gameinclassroom.github.io/blocky-snakes/",
  "paper-io": "https://gameinclassroom.github.io/paper-io-2/",
  "paper-io-2": "https://gameinclassroom.github.io/paper-io-2/",
  "potatoes-paper-io": "https://gameinclassroom.github.io/paper-io-2/",
  "potatoes-paper-io-3d": "https://gameinclassroom.github.io/paper-io-2/",
  "hole-io": "https://7zeb.github.io/homework/holeio.html",
  "potatoes-hole-io": "https://7zeb.github.io/homework/holeio.html",
  "smash-karts": "https://freeonlinewebtools.github.io/gamelist8.github.io/Smash-Karts/",
  "tanks-io": "https://7zeb.github.io/homework/awesometanks2.html",
  "potatoes-tanks-io": "https://7zeb.github.io/homework/awesometanks2.html",
  "shell-shockers-io": "https://academics-study.github.io/shellshockers/",
  "potatoes-shell-shockers-io": "https://academics-study.github.io/shellshockers/",
  "potatoes-aquapark-io": "https://gameinclassroom.github.io/aquaparkio/",
  "aquapark-io": "https://gameinclassroom.github.io/aquaparkio/",
  "potatoes-just-fall-lol": "https://gameinclassroom.github.io/just-fall-lol/",
  "just-fall": "https://gameinclassroom.github.io/just-fall-lol/",
  "potatoes-1v1-lol": "https://gameinclassroom.github.io/1v1-lol/",
  "1v1-lol": "https://gameinclassroom.github.io/1v1-lol/",
  "potatoes-zombs-royale": "https://gameinclassroom.github.io/zombs-royale-io/",
  "zombs-royale": "https://gameinclassroom.github.io/zombs-royale-io/",
  "snowbattleio": "https://gameinclassroom.github.io/snow-battle-io/",
  "snow-battle-io": "https://gameinclassroom.github.io/snow-battle-io/",
  "potatoes-basket-bros": "https://gameinclassroom.github.io/basket-bros/",
  "basket-bros": "https://gameinclassroom.github.io/basket-bros/",
  "potatoes-stick-slashers": "https://gameinclassroom.github.io/stick-merge/",
  "stick-merge": "https://gameinclassroom.github.io/stick-merge/",
  "evowarsio": "https://freeonlinewebtools.github.io/gamelist3.github.io/EvoWarsio/",
  "shapez": "https://freeonlinewebtools.github.io/gamelist8.github.io/Shapez/",
  "potatoes-gartic-io": "https://7zeb.github.io/homework/agariolite.html",
  "potatoes-fliphero-io": "https://7zeb.github.io/homework/holeio.html",
  "potatoes-eat-io": "https://7zeb.github.io/homework/holeio.html",
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

  // Bloons Tower Defence Series (Flash Player Runner with 200 OK SWF Endpoints)
  "bloons-tower-defence": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd.swf&title=Bloons+Tower+Defence",
  "bloonstd": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd.swf&title=Bloons+Tower+Defence",
  "bloons-tower-defence-2": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd2.swf&title=Bloons+Tower+Defence+2",
  "bloonstd2": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd2.swf&title=Bloons+Tower+Defence+2",
  "bloons-tower-defence-3": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd3.swf&title=Bloons+Tower+Defence+3",
  "bloonstd3": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd3.swf&title=Bloons+Tower+Defence+3",
  "bloons-td-4": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd4.swf&title=Bloons+TD+4",
  "btd-4": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd4.swf&title=Bloons+TD+4",
  "bloonstd4": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/bloonstd4.swf&title=Bloons+TD+4",
  "bloons-td-5": "games/flash-player.html?swf=https://raw.githubusercontent.com/sz-games/Games7/main/btd5.swf&title=Bloons+TD+5",
  "bloonstd5": "games/flash-player.html?swf=https://raw.githubusercontent.com/sz-games/Games7/main/btd5.swf&title=Bloons+TD+5",

  // Papa's Cooking Series (Complete, Playable Authentic SWFs with Flash Runner)
  "papas-pizzeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papaspizzeria.swf&title=Papa%27s+Pizzeria",
  "potatoes-papa-39-s-pizzeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papaspizzeria.swf&title=Papa%27s+Pizzeria",
  "papa-burg": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasburgeria.swf&title=Papa%27s+Burgeria",
  "potatoes-papa-39-s-burgeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasburgeria.swf&title=Papa%27s+Burgeria",
  "papas-freezeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasfreezeria.swf&title=Papa%27s+Freezeria",
  "potatoes-papa-39-s-freezeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasfreezeria.swf&title=Papa%27s+Freezeria",
  "papas-cheese": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papascheeseria_102.swf&title=Papa%27s+Cheeseria",
  "potatoes-papa-39-s-cheeseria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papascheeseria_102.swf&title=Papa%27s+Cheeseria",
  "papas-donut": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasdonuteria.swf&title=Papa%27s+Donuteria",
  "potatoes-papa-39-s-donuteria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papasdonuteria.swf&title=Papa%27s+Donuteria",
  "papa-htdog": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papashotdoggeria.swf&title=Papa%27s+Hot+Doggeria",
  "potatoes-papa-39-s-hot-doggeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papashotdoggeria.swf&title=Papa%27s+Hot+Doggeria",
  "papas-pasta": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papaspastaria.swf&title=Papa%27s+Pastaria",
  "potatoes-papa-39-s-pastaria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papaspastaria.swf&title=Papa%27s+Pastaria",
  "papas-sushi": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papassushiria.swf&title=Papa%27s+Sushiria",
  "potatoes-papa-39-s-sushiria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papassushiria.swf&title=Papa%27s+Sushiria",
  "potatoes-papa-39-s-taco-mia": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papastacomia.swf&title=Papa%27s+Taco+Mia",
  "papas-taco-mia": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papastacomia.swf&title=Papa%27s+Taco+Mia",
  "papas-wing": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papaswingeria.swf&title=Papa%27s+Wingeria",
  "papaswingeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/maxplayzreal/Flash-Games-SWF/main/papaswingeria.swf&title=Papa%27s+Wingeria",
  "papa-bakes": "games/flash-player.html?swf=https://raw.githubusercontent.com/G6F9/Papas-Bakeria/main/papasbakeria.swf&title=Papa%27s+Bakeria",
  "potatoes-papa-39-s-bakeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/G6F9/Papas-Bakeria/main/papasbakeria.swf&title=Papa%27s+Bakeria",
  "potatoes-papa-s-bakeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/G6F9/Papas-Bakeria/main/papasbakeria.swf&title=Papa%27s+Bakeria",
  "papa-cpck": "games/flash-player.html?swf=https://raw.githubusercontent.com/ubg89/PapasCupcakeria/gh-pages/8Yw2cUe3RMq8mx.swf&title=Papa%27s+Cupcakeria",
  "potatoes-papa-39-s-cupcakeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/ubg89/PapasCupcakeria/gh-pages/8Yw2cUe3RMq8mx.swf&title=Papa%27s+Cupcakeria",
  "papas-pnck": "games/flash-player.html?swf=https://raw.githubusercontent.com/AlexOpedia/PapasPancakeria/main/papaspancakeria.swf&title=Papa%27s+Pancakeria",
  "potatoes-papa-39-s-pancakeria": "games/flash-player.html?swf=https://raw.githubusercontent.com/AlexOpedia/PapasPancakeria/main/papaspancakeria.swf&title=Papa%27s+Pancakeria",
  "papa-scoop": "games/papas-scooperia.html",
  "papa-scoop-alt": "games/papas-scooperia.html",
  "potatoes-papa-39-s-scooperia": "games/papas-scooperia.html",
  "papas-louie-1": "games/flash-player.html?swf=https://raw.githubusercontent.com/BinBashBanana/gstore/master/papalouie.swf&title=Papa+Louie+1",
  "papas-louie-2": "games/flash-player.html?swf=https://raw.githubusercontent.com/BinBashBanana/gstore/master/papalouie2.swf&title=Papa+Louie+2",
  "papas-louie-3": "games/flash-player.html?swf=https://raw.githubusercontent.com/BinBashBanana/gstore/master/papalouie3.swf&title=Papa+Louie+3",

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
  "duck-life": "https://gameinclassroom.github.io/duck-life/",
  "duck-life-2": "https://gameinclassroom.github.io/duck-life-2-world-champion/",
  "duck-life-3": "https://gameinclassroom.github.io/duck-life-3-evolution/",
  "duck-life-4": "https://gameinclassroom.github.io/duck-life-4/",
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
    .replace(/[^a-z0-9]/g, '');

  return cleanTitle || cleanId;
}

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

  return games;
}

export const DEFAULT_GAMES: Game[] = buildDefaultGames();
