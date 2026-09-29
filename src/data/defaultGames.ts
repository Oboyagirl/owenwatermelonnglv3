import { Game } from '../types/game';
import ubgGamesList from './ubgFilteredGames.json';
import { TRIPPLE_POTATOES_GAMES } from './tripplePotatoesGames';

const CURATED_GAMES: Game[] = [
  {
    id: "basket-random",
    source: "unblocked",
    title: "Basket Random",
    description: "Wacky ragdoll two-player basketball with physics-defying players, changing balls, and unpredictable courts.",
    category: "Sports",
    thumbnail: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Basket-Random/basketrandom.jpg",
    banner: "https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Basket-Random/splash.jpeg",
    mirrors: [
      "https://ubghyper.github.io/GameList.github.io/Basket-Random/",
      "https://html5.gamedistribution.com/bf1268dccb5d43e7970bb3edaa54afc8/"
    ],
    tags: ["Basketball", "2 Player", "Ragdoll", "Sports", "Multiplayer", "Unblocked"],
    rating: 4.9,
    plays: 95400,
    author: "RHM Interactive",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Basket-Random/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Basket-Random/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Retro-Bowl/"
    ],
    tags: ["Football", "Sports", "Pixel", "NFL", "Retro Bowl", "Unblocked"],
    rating: 4.9,
    plays: 128920,
    author: "New Star Games",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Retro-Bowl/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Retro-Bowl/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Drive-Mad/"
    ],
    tags: ["Racing", "Physics", "Truck", "Driving", "Popular", "Unblocked"],
    rating: 4.9,
    plays: 114400,
    author: "Martin Magni",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Drive-Mad/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Drive-Mad/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Slope/"
    ],
    tags: ["3D", "Runner", "Reflex", "Neon", "Arcade", "Unblocked"],
    rating: 4.9,
    plays: 165200,
    author: "Rob Kay",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Slope/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Slope/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://sussygamedeveloper.github.io/FNAF1/"
    ],
    tags: ["Horror", "Survival", "FNAF", "Strategy", "Classic", "Unblocked"],
    rating: 4.9,
    plays: 142500,
    author: "Scott Cawthon",
    featured: true,
    iframeSrc: "https://sussygamedeveloper.github.io/FNAF1/",
    iframeCode: `<iframe src="https://sussygamedeveloper.github.io/FNAF1/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://sussygamedeveloper.github.io/FNAF2/",
      "https://sussygamedeveloper.github.io/FNAF1/"
    ],
    tags: ["Horror", "FNAF", "Survival", "Strategy"],
    rating: 4.9,
    plays: 98100,
    author: "Scott Cawthon",
    featured: false,
    iframeSrc: "https://sussygamedeveloper.github.io/FNAF2/",
    iframeCode: `<iframe src="https://sussygamedeveloper.github.io/FNAF2/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
    controls: [
      { key: "Mouse Hover", action: "Pan Office" },
      { key: "Space / Ctrl", action: "Flashlight" },
      { key: "Bottom Hover", action: "Wear Mask / Monitor" }
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
      "https://ubghyper.github.io/GameList.github.io/Cookie-Clicker/"
    ],
    tags: ["Clicker", "Idle", "Casual", "Addictive", "Unblocked"],
    rating: 4.9,
    plays: 135000,
    author: "Orteil",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Cookie-Clicker/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Cookie-Clicker/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
    controls: [
      { key: "Mouse Click", action: "Click the Big Cookie & Buy Upgrades" }
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
    tags: ["Management", "Sim", "Monkey", "Cute", "Shop"],
    rating: 4.9,
    plays: 126000,
    author: "TinyDobbins",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Monkey-Mart/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Monkey-Mart/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Snow-Rider-3D/"
    ],
    tags: ["Sled", "Winter", "3D", "Runner", "Racing", "Unblocked"],
    rating: 4.8,
    plays: 148525,
    author: "Ashima Prabhakar",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Snow-Rider-3D/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Snow-Rider-3D/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Drift-Boss/"
    ],
    tags: ["Drifting", "One Button", "Cars", "Casual", "Unblocked"],
    rating: 4.8,
    plays: 92300,
    author: "MarketJS",
    featured: false,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Drift-Boss/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Drift-Boss/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Basketball-Stars/"
    ],
    tags: ["Basketball", "Sports", "2 Player", "Multiplayer", "Unblocked"],
    rating: 4.8,
    plays: 104000,
    author: "Madpuffers",
    featured: false,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Basketball-Stars/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Basketball-Stars/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Moto3XM/"
    ],
    tags: ["Motorcycle", "Stunt", "Racing", "Physics", "Unblocked"],
    rating: 4.9,
    plays: 132000,
    author: "Madpuffers",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Moto3XM/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Moto3XM/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; gamepad; pointer-lock" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Crossy-Road/"
    ],
    tags: ["Voxel", "Runner", "Casual", "Crossy", "Unblocked"],
    rating: 4.9,
    plays: 118000,
    author: "Hipster Whale",
    featured: true,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Crossy-Road/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Crossy-Road/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
    controls: [
      { key: "Arrow Keys / WASD", action: "Hop Forward, Left, Right & Back" }
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
      "https://ubghyper.github.io/GameList.github.io/Tiny-Fishing/"
    ],
    tags: ["Fishing", "Idle", "Casual", "Upgrade", "Unblocked"],
    rating: 4.8,
    plays: 87500,
    author: "Madpuffers",
    featured: false,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Tiny-Fishing/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Tiny-Fishing/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
      "https://ubghyper.github.io/GameList.github.io/Doodle-Jump/"
    ],
    tags: ["Jump", "Endless", "Arcade", "Retro", "Unblocked"],
    rating: 4.7,
    plays: 74200,
    author: "Lima Sky",
    featured: false,
    iframeSrc: "https://ubghyper.github.io/GameList.github.io/Doodle-Jump/",
    iframeCode: `<iframe src="https://ubghyper.github.io/GameList.github.io/Doodle-Jump/" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/watermelon-merge.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/snake.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/tetris.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/2048.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/breakout.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/flappy.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/space.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
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
    iframeCode: `<iframe src="/games/pong.html" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`,
    controls: [
      { key: "W / S or Mouse", action: "Player 1 Paddle" },
      { key: "↑ / ↓", action: "Player 2 Paddle" }
    ]
  }
];

function buildDefaultGames(): Game[] {
  const seen = new Set<string>();
  const games: Game[] = [];

  // Add curated games first (priority)
  for (const g of CURATED_GAMES) {
    if (g && g.id && !seen.has(g.id)) {
      seen.add(g.id);
      games.push({
        ...g,
        secondaryCategory: g.secondaryCategory || 'Potato Classics'
      });
    }
  }

  // Add all games from TrippleThePotatoes collection
  for (const g of TRIPPLE_POTATOES_GAMES) {
    if (g && g.id && !seen.has(g.id)) {
      seen.add(g.id);
      games.push(g);
    }
  }

  // Add ubg filtered games only if not already present
  for (const g of (ubgGamesList as unknown as Game[])) {
    if (g && g.id && !seen.has(g.id)) {
      seen.add(g.id);
      games.push({
        ...g,
        secondaryCategory: g.secondaryCategory || 'Unblocked Archive'
      });
    }
  }

  return games;
}

export const DEFAULT_GAMES: Game[] = buildDefaultGames();
