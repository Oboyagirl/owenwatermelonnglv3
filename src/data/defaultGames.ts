import { Game } from '../types/game';
import ubgGamesList from './ubgFilteredGames.json';
import { TRIPPLE_POTATOES_GAMES } from './tripplePotatoesGames';

const CURATED_GAMES: Game[] = [
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
        "https://javaspence.github.io/retrobowl/"
      ],
    tags: ["Football", "Sports", "Pixel", "NFL", "Retro Bowl", "Unblocked"],
    rating: 4.9,
    plays: 128920,
    author: "New Star Games",
    featured: true,
    iframeSrc: "https://javaspence.github.io/retrobowl/",
    iframeCode: `<iframe class="game-iframe" id="game-area" src="https://javaspence.github.io/retrobowl/" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
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
  // Basket Random: clean 7zeb host
  "basket-random": "https://7zeb.github.io/basket-random/",
  "potatoes-basket-random": "https://7zeb.github.io/basket-random/",

  // Basketball Stars (Clean unblocked hosts)
  "basketball-stars": "https://joe-the-chicken.github.io/basketball-stars/",
  "potatoes-basketball-stars": "https://joe-the-chicken.github.io/basketball-stars/",
  "potatoes-basket-bros": "https://7zeb.github.io/homework/basketbros.html",

  // Pool Ball / 8-Ball Pool (Clean HTML5 Canvas)
  "pool-ball": "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",
  "potatoes-pool-ball": "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",
  "8-ball-pool": "https://henshmi.github.io/Classic-8-Ball-Pool/dist/",

  // Soccer Random (Clean GitHub hosts)
  "soccer-random": "https://gameinclassroom.github.io/soccer-random/",
  "potatoes-soccer-random": "https://gameinclassroom.github.io/soccer-random/",
  "potatoes-soccer-skils": "https://gameinclassroom.github.io/soccer-random/",

  // Volley Random (Clean GitHub hosts)
  "volley-random": "https://gameinclassroom.github.io/volley-random/",
  "potatoes-volley-random": "https://gameinclassroom.github.io/volley-random/",

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
  "retro-bowl": "https://javaspence.github.io/retrobowl/",
  "potatoes-retro-bowl": "https://javaspence.github.io/retrobowl/",
  "slope": "https://7zeb.github.io/homework/slope.html",
  "subway-surfers": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers-havana": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers-hong-kong": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "potatoes-subway-surfers-iceland": "https://7zeb.github.io/homework/subway-surfers/index.html",
  "drive-mad": "https://academics-study.github.io/drive-mad/",
  "cookie-clicker": "https://7zeb.github.io/homework/cookieclicker.html",
  "1v1-lol": "https://7zeb.github.io/homework/1v1-lol/index.html",
  "flappy-bird": "https://7zeb.github.io/homework/flappy-bird/index.html",
  "potatoes-flappy-bird": "https://7zeb.github.io/homework/flappy-bird/index.html",
  "moto3xm": "https://7zeb.github.io/homework/motox3m.html",
  "potatoes-moto-x3m": "https://7zeb.github.io/homework/motox3m.html",
  "crossy-road": "https://7zeb.github.io/homework/crossyroad.html",
  "potatoes-crossy-road": "https://7zeb.github.io/homework/crossyroad.html",
  "tiny-fishing": "https://7zeb.github.io/homework/tinyfishing.html",
  "doodle-jump": "https://7zeb.github.io/homework/doodlejump.html",
  "drift-boss": "https://7zeb.github.io/homework/driftboss.html",
  "bitlife": "https://7zeb.github.io/homework/bit-life/index.html",
  "2048": "https://7zeb.github.io/homework/2048.html",
  "potatoes-paper-io": "https://7zeb.github.io/homework/paperio2.html",
  "potatoes-hole-io": "https://7zeb.github.io/homework/holeio.html",
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
  "potatoes-tunnel-rush": "https://7zeb.github.io/homework/tunnelrush.html"
};

function buildDefaultGames(): Game[] {
  const seen = new Set<string>();
  const games: Game[] = [];

  const normalizeGame = (g: Game, defaultCategory: string): Game => {
    let src = g.iframeSrc || '';
    if (URL_OVERRIDES[g.id]) {
      src = URL_OVERRIDES[g.id];
    } else if (src.startsWith('/g/')) {
      const slug = src.replace(/^\/g\//, '').replace(/\/$/, '');
      src = `https://ubghyper.github.io/GameList.github.io/${slug}/`;
    }

    // Automatically prefer non-Securly clean mirrors if primary is blocked
    if (src.includes('ubghyper') || src.includes('pages.dev') || src.includes('gamedistribution.com') || (src.startsWith('games/') && !src.startsWith('games/watermelon') && !src.startsWith('games/snake') && !src.startsWith('games/tetris') && !src.startsWith('games/2048') && !src.startsWith('games/breakout') && !src.startsWith('games/flappy') && !src.startsWith('games/space') && !src.startsWith('games/pong'))) {
      const cleanMirror = (g.mirrors || []).find(m => 
        m.includes('freeonlinewebtools.github.io') || 
        m.includes('7zeb.github.io') || 
        m.includes('academics-study.github.io') ||
        m.includes('javaspence.github.io') ||
        m.includes('henshmi.github.io') ||
        m.includes('joe-the-chicken.github.io') ||
        m.includes('gameinclassroom.github.io')
      );
      if (cleanMirror) {
        src = cleanMirror;
      }
    }

    const mirrors = [src, ...(g.mirrors || []).filter(m => m !== src)];

    return {
      ...g,
      iframeSrc: src,
      mirrors,
      sandbox: undefined, // Unrestricted so Unity and HTML5 games load without sandbox errors
      iframeCode: formatGameIframe(g.title, src),
      secondaryCategory: g.secondaryCategory || defaultCategory
    };
  };

  // Add curated games first (priority)
  for (const g of CURATED_GAMES) {
    if (g && g.id && !seen.has(g.id)) {
      seen.add(g.id);
      games.push(normalizeGame(g, 'Potato Classics'));
    }
  }

  // Add all games from TrippleThePotatoes collection
  for (const g of TRIPPLE_POTATOES_GAMES) {
    if (g && g.id && !seen.has(g.id)) {
      seen.add(g.id);
      games.push(normalizeGame(g, 'Potato Classics'));
    }
  }

  // Add ubg filtered games only if not already present
  for (const g of (ubgGamesList as unknown as Game[])) {
    if (g && g.id && !seen.has(g.id)) {
      seen.add(g.id);
      games.push(normalizeGame(g, 'Unblocked Archive'));
    }
  }

  return games;
}

export const DEFAULT_GAMES: Game[] = buildDefaultGames();
