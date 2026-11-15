import type { AIDifficulty, PieceColor } from './chessEngine.ts';

export type BotStyle = 'chaotic' | 'solid' | 'aggressive' | 'tricky' | 'balanced';

export type BotVoicelineEvent =
  | 'gameStart'
  | 'opening'
  | 'capture'
  | 'captured'
  | 'check'
  | 'inCheck'
  | 'playerBlunder'
  | 'botWin'
  | 'botLose'
  | 'draw';

export interface OpeningBookLine {
  name: string;
  color: PieceColor;
  moves: string[];
}

export interface ChessBot {
  id: string;
  name: string;
  title: string;
  avatar: string;
  accentColor: string;
  rating: number;
  secretRating?: number;
  apexMode?: boolean;
  difficulty: AIDifficulty;
  style: BotStyle;
  signatureOpening: string;
  bio: string;
  aggressionBias: number;
  jitter: number;
  /** Centipawn window below best root move from which near-equal varied moves can be picked */
  varietyWindow: number;
  timeBudgetMs: number;
  openingLines: OpeningBookLine[];
  voicelines: Record<BotVoicelineEvent, string[]>;
}

interface BotFlavorConfig {
  id: string;
  name: string;
  title: string;
  avatar: string;
  accentColor: string;
  rating: number;
  secretRating?: number;
  apexMode?: boolean;
  difficulty: AIDifficulty;
  style: BotStyle;
  signatureOpening: string;
  bio: string;
  aggressionBias: number;
  jitter: number;
  varietyWindow: number;
  timeBudgetMs: number;
  openingLines: OpeningBookLine[];
  customLines: Partial<Record<BotVoicelineEvent, string[]>>;
}

const STYLE_DEFAULT_VOICELINES: Record<BotStyle, Record<BotVoicelineEvent, string[]>> = {
  chaotic: {
    gameStart: [
      "I shuffled my opening notes—let's see what happens!",
      "Zero theory, pure chaos. Make your move!"
    ],
    opening: [
      "Wait, is this an actual opening? Too late, I played it!",
      "Unconventional geometry! Even I don't know my next move."
    ],
    capture: [
      "Ooh, free snack! Taking that right away.",
      "Yoink! Did you leave that there for me?"
    ],
    captured: [
      "Whoops! Totally part of my decoy plan anyway.",
      "Hey, I was using that piece! Sort of."
    ],
    check: [
      "Check! Knock knock, your king has visitors!",
      "Surprise check! Didn't see that diagonal, huh?"
    ],
    inCheck: [
      "Whoa, personal space! My king was just stretching!",
      "Rude check! Let me scoot over a square."
    ],
    playerBlunder: [
      "Wait—did you mean to drop that? Because I'm grabbing it!",
      "Chaos works in mysterious ways. Thanks for the gift!"
    ],
    botWin: [
      "WAIT I WON?! Somebody frame this move list!",
      "Pure unfiltered vibes defeated pure theory!"
    ],
    botLose: [
      "Welp, that chaos backfired spectacularly. Rematch!",
      "Okay, next game I promise to look before moving!"
    ],
    draw: [
      "Wait—a tie?! I'll happily take half a point!",
      "Nobody lost! That counts as victory in my book."
    ]
  },
  solid: {
    gameStart: [
      "Develop cleanly, castle early, and guard every pawn.",
      "Structure beats fireworks. Let us play a principled match."
    ],
    opening: [
      "Every piece harmoniously placed. Solid foundation.",
      "Steady development—no weaknesses left behind."
    ],
    capture: [
      "Clean simplification in my favor.",
      "Every balanced trade brings a stronger endgame."
    ],
    captured: [
      "Fair exchange. My structure stays intact.",
      "Noted. Time to fortify the remaining squares."
    ],
    check: [
      "An instructive check to tighten the grip.",
      "Check—watch those weak squares around your king."
    ],
    inCheck: [
      "Expected check. Stepping to safety calmly.",
      "Nothing compromised; the fortress holds."
    ],
    playerBlunder: [
      "Careful—you left an outpost completely unguarded.",
      "Solid fundamentals catch tactical slips immediately."
    ],
    botWin: [
      "Patience and structure win in the long run. Well played!",
      "Clean technique from opening to endgame. Rematch?"
    ],
    botLose: [
      "Sharp breakthrough! You dismantled my fortress cleanly.",
      "Well calculated—you earned that win fair and square."
    ],
    draw: [
      "Both defenses stood tall. A dignified draw.",
      "Equal material, equal precision—honors shared."
    ]
  },
  aggressive: {
    gameStart: [
      "No slow maneuvering—aim straight for the king!",
      "Brace yourself. I'm hunting tactics from move one!"
    ],
    opening: [
      "Attack lanes are opening up. Hold onto your king!",
      "Pieces surging forward—let the fireworks start!"
    ],
    capture: [
      "BOOM! Crashing right through the defense!",
      "Sliced clean through! Momentum stays with me!"
    ],
    captured: [
      "Trade all you want—open files only feed my attack!",
      "One piece down, three attackers incoming!"
    ],
    check: [
      "CHECK! Keep running—the net is closing!",
      "Direct strike on the king! Nowhere safe to hide!"
    ],
    inCheck: [
      "Nice counter-jab! Now watch my reply!",
      "Temporary detour—counterattack loading!"
    ],
    playerBlunder: [
      "Target acquired! That slip costs you dearly!",
      "Never blink in a sharp position—punishment incoming!"
    ],
    botWin: [
      "Checkmate under heavy fire! Want another round?",
      "Total attack from start to finish! GG!"
    ],
    botLose: [
      "You weathered the storm and countered coldly. Respect!",
      "Whoa, you actually parried every blow! Run it back!"
    ],
    draw: [
      "What a firefight! Perpetual sparks all the way to a draw!",
      "Neither king fell in that shootout. Great game!"
    ]
  },
  tricky: {
    gameStart: [
      "Watch your step—there are traps on half the squares.",
      "Careful what pawns you accept today!"
    ],
    opening: [
      "Looks innocent, doesn't it? Look two moves deeper.",
      "Bait placed cleanly on the board. Your move!"
    ],
    capture: [
      "Sprung the trap right on cue!",
      "Didn't spot that sneaky tactic, did you?"
    ],
    captured: [
      "Ooh, you actually took the bait... or did you refute it?",
      "Fair trade, though the real trick is still lurking."
    ],
    check: [
      "Aha! A sneaky check right between the lines!",
      "Check! Surprise geometry on the diagonal!"
    ],
    inCheck: [
      "Clever check—you know a few tricks yourself!",
      "Slippery defense activated. Nice try!"
    ],
    playerBlunder: [
      "Walked straight into the crossfire!",
      "Trapped! Always double-check those tactics."
    ],
    botWin: [
      "Mystery solved—you fell for the hidden combination!",
      "Sleight of hand wins the point. Shall we play again?"
    ],
    botLose: [
      "You dodged every single trap and countered cleanly!",
      "Impressive vision—not a single trick slipped past you!"
    ],
    draw: [
      "Trap met counter-trap until the board dried out. Draw!",
      "Cleverly escaped to a dead draw. Well played!"
    ]
  },
  balanced: {
    gameStart: [
      "Let's test everything: opening ideas, middlegame tactics, and endgames.",
      "Ready for a real chess duel. Give me your best moves!"
    ],
    opening: [
      "Dynamic balance established. Now the real game begins.",
      "Switching gears—time for middlegame plans."
    ],
    capture: [
      "Precision timing on that capture.",
      "Converting a small edge cleanly."
    ],
    captured: [
      "Good eye. Keeps the game tense and balanced.",
      "Fair exchange—plenty of chess left to play."
    ],
    check: [
      "Check! Testing your king's safety under pressure.",
      "Forcing move—let's see your cleanest defense."
    ],
    inCheck: [
      "Well-timed check. Adjusting cleanly.",
      "Sharp try—king steps to a safer square."
    ],
    playerBlunder: [
      "Small oversight, big swing. Converting immediately.",
      "Found the tactical refutation!"
    ],
    botWin: [
      "Well fought! Converted the advantage down the stretch.",
      "GG! Up for another match with reversed colors?"
    ],
    botLose: [
      "Superb play from start to finish. You outplayed me!",
      "Clean victory—every move had purpose. Respect!"
    ],
    draw: [
      "Razor-close battle all the way to a draw.",
      "Hard-fought split point. Well played!"
    ]
  }
};

function createBot(cfg: BotFlavorConfig): ChessBot {
  const base = STYLE_DEFAULT_VOICELINES[cfg.style];
  const voicelines: Record<BotVoicelineEvent, string[]> = {
    gameStart: cfg.customLines.gameStart || base.gameStart,
    opening: cfg.customLines.opening || base.opening,
    capture: cfg.customLines.capture || base.capture,
    captured: cfg.customLines.captured || base.captured,
    check: cfg.customLines.check || base.check,
    inCheck: cfg.customLines.inCheck || base.inCheck,
    playerBlunder: cfg.customLines.playerBlunder || base.playerBlunder,
    botWin: cfg.customLines.botWin || base.botWin,
    botLose: cfg.customLines.botLose || base.botLose,
    draw: cfg.customLines.draw || base.draw
  };
  return {
    id: cfg.id,
    name: cfg.name,
    title: cfg.title,
    avatar: cfg.avatar,
    accentColor: cfg.accentColor,
    rating: cfg.rating,
    secretRating: cfg.secretRating,
    apexMode: cfg.apexMode,
    difficulty: cfg.difficulty,
    style: cfg.style,
    signatureOpening: cfg.signatureOpening,
    bio: cfg.bio,
    aggressionBias: cfg.aggressionBias,
    jitter: cfg.jitter,
    varietyWindow: cfg.varietyWindow,
    timeBudgetMs: cfg.timeBudgetMs,
    openingLines: cfg.openingLines,
    voicelines
  };
}

/**
 * Broad universal defense responses used when a bot rated >= 900 faces an offbeat move
 * or Scholar's Mate attempt outside its personal signature repertoire.
 */
export const UNIVERSAL_DEFENSE_LINES: OpeningBookLine[] = [
  // Scholar's mate defenses (Black)
  { name: "Scholar's Defense", color: 'b', moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'g6', 'Qf3', 'Nf6'] },
  { name: "Scholar's Counter", color: 'b', moves: ['e4', 'e5', 'Bc4', 'Nf6', 'Qh5', 'Nxh5'] },
  { name: "Queen Raid Repel", color: 'b', moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Nf3', 'Nf6'] },
  { name: "Early Queen Counter", color: 'b', moves: ['e4', 'c5', 'Qh5', 'e6', 'Nc3', 'Nf6'] },
  // Varied replies vs 1. e4
  { name: 'Italian Open', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'] },
  { name: 'Two Knights Counter', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6'] },
  { name: 'Classical Sicilian', color: 'b', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4'] },
  { name: 'Caro-Kann Defense', color: 'b', moves: ['e4', 'c6', 'd4', 'd5'] },
  { name: 'French Defense', color: 'b', moves: ['e4', 'e6', 'd4', 'd5'] },
  // Varied replies vs 1. d4
  { name: 'Classical Queen Pawn', color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'] },
  { name: 'Indian Solid', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'd5'] },
  { name: 'King Indian Flexible', color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'] },
  // Varied replies vs 1. c4 / 1. Nf3 / 1. b3 / 1. g3
  { name: 'English Reversed Sicilian', color: 'b', moves: ['c4', 'e5', 'Nc3', 'Nf6'] },
  { name: 'English Symmetrical Reply', color: 'b', moves: ['c4', 'c5', 'Nc3', 'Nc6'] },
  { name: 'Reti Classical Reply', color: 'b', moves: ['Nf3', 'd5', 'd4', 'Nf6'] },
  { name: 'Reti King Indian Reply', color: 'b', moves: ['Nf3', 'Nf6', 'c4', 'g6'] },
  { name: 'Nimzo-Larsen Classical', color: 'b', moves: ['b3', 'e5', 'Bb2', 'Nc6'] },
  { name: 'Modern Flank Reply', color: 'b', moves: ['g3', 'd5', 'Bg2', 'e5'] },
  { name: "Bird's Counter", color: 'b', moves: ['f4', 'd5', 'Nf3', 'Nf6'] }
];

export const CHESS_BOTS: ChessBot[] = [
  createBot({
    id: 'mittens',
    name: 'Mittens',
    title: 'Totally Harmless Kitten',
    avatar: '🐱',
    accentColor: '#fb7185',
    rating: 1,
    secretRating: 9999,
    apexMode: true,
    difficulty: 'expert',
    style: 'aggressive',
    signatureOpening: 'Ruy Lopez, Catalan & Najdorf',
    bio: 'Just an ordinary 1 Elo kitten who enjoys yarn, naps, and dismantling human hope with cold-blooded top moves.',
    aggressionBias: 4,
    jitter: 0,
    varietyWindow: 0,
    timeBudgetMs: 1450,
    openingLines: [
      { name: 'Catalan Master Squeeze', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O'] },
      { name: 'Ruy Lopez Championship', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3'] },
      { name: 'Queen Gambit Exchange Apex', color: 'w', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3'] },
      { name: 'Sicilian Najdorf Fortress', color: 'b', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5'] },
      { name: 'Ruy Berlin Apex', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4', 'd4', 'Nd6', 'Bxc6', 'dxc6'] },
      { name: 'Nimzo-Indian Lockdown', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O', 'a3', 'Bxc3+', 'Qxc3'] },
      { name: "Anti-Scholar's Pounce", color: 'b', moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'g6', 'Qf3', 'Nf6', 'Ne2', 'Bg7'] }
    ],
    customLines: {
      gameStart: [
        "Meow? I am only 1 Elo. Surely a human like you will go easy on a little kitten... :3",
        "Purr~ Don't mind me sharpening my claws on the chessboard."
      ],
      opening: [
        "Tehe. Such an interesting pawn you pushed. Mind if I take the entire center?",
        "Meow! That square looked tasty, so I claimed it for the next 40 moves."
      ],
      capture: [
        "*tap tap* Knocked your piece right off the table. Oops! Meow~",
        "Yum! That tasted suspiciously like a winning advantage."
      ],
      captured: [
        "Hiss~ Enjoy that piece while you still have a king.",
        "Cute trade. Watch what happens to your dark squares next."
      ],
      check: [
        "Boop! That's a check. Nowhere cozy for your king to nap~",
        "Meow! Your king looks trapped in a cardboard box."
      ],
      inCheck: [
        "A tiny scratch? Purr-fectly harmless.",
        "Nice meow-check. Let's see how you stop what's coming next."
      ],
      playerBlunder: [
        "Hehe... wait, did you mean to hang that? Because this 1 Elo kitty saw mate in 5. :3",
        "Oh no, your position just collapsed! What a shame. Purr~"
      ],
      botWin: [
        "Meow! Checkmated by a 1 Elo kitten. Care for another nap—I mean match? :3",
        "Good game! I was only using one paw the whole time."
      ],
      botLose: [
        "HISSSS!! Wait... HOW did a human beat 9999 Elo Mittens?! Impressive...",
        "Purr... okay, you actually solved the unsolvable cat. Take your crown!"
      ],
      draw: [
        "You survived Mittens and escaped with a draw?! Most humans don't get half a point!",
        "Purr... stalemate. Next time the kitten catches the mouse."
      ]
    }
  }),
  createBot({
    id: 'barnaby',
    name: 'Barnaby Bixby',
    title: 'Basement Dreamer',
    avatar: '🧃',
    accentColor: '#38bdf8',
    rating: 480,
    difficulty: 'easy',
    style: 'chaotic',
    signatureOpening: 'Bongcloud & Crab Shenanigans',
    bio: 'Moves his king on turn two just for vibes. Still convinced flank pawns win championships.',
    aggressionBias: 2,
    jitter: 250,
    varietyWindow: 170,
    timeBudgetMs: 220,
    openingLines: [
      { name: 'The Royal Bongcloud', color: 'w', moves: ['e4', 'e5', 'Ke2'] },
      { name: 'Crab Wing Opening', color: 'w', moves: ['h4', 'd5', 'a4'] },
      { name: 'Orangutan Bounce', color: 'w', moves: ['b4', 'e5', 'Bb2'] },
      { name: 'Reverse Bongcloud', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Ke7'] },
      { name: 'Silly Sicilian', color: 'b', moves: ['e4', 'a5', 'd4', 'Ra6'] },
      { name: 'Mystery Hippo', color: 'b', moves: ['d4', 'h5', 'c4', 'a5'] }
    ],
    customLines: {
      gameStart: [
        "Hey! Fair warning: I just learned how knights jump yesterday.",
        "I brought juice boxes and zero theory. Let's play!"
      ],
      opening: [
        "Behold! The ancient forbidden Bongcloud technique!",
        "My king likes fresh air in the center. It builds character."
      ],
      botWin: [
        "WAIT I WON?! Somebody screenshot this right now!",
        "Calculated from move one. Totally didn't panic the whole time!"
      ]
    }
  }),
  createBot({
    id: 'toby',
    name: 'Toby Puddles',
    title: 'Pondside Wanderer',
    avatar: '🦆',
    accentColor: '#60a5fa',
    rating: 560,
    difficulty: 'easy',
    style: 'chaotic',
    signatureOpening: 'Barnes, Ware & Edge Pawn Walks',
    bio: 'Refuses to touch center pawns before move four. Just enjoys pushing rook pawns down the sidelines.',
    aggressionBias: 1,
    jitter: 220,
    varietyWindow: 150,
    timeBudgetMs: 230,
    openingLines: [
      { name: 'Ware Meadow', color: 'w', moves: ['a4', 'e5', 'Ra3'] },
      { name: 'Desprez Wander', color: 'w', moves: ['h4', 'e5', 'Rh3'] },
      { name: 'Barnes Stroll', color: 'w', moves: ['f3', 'd5', 'Kf2'] },
      { name: 'Duck Defense', color: 'b', moves: ['e4', 'h6', 'd4', 'a6'] },
      { name: 'Corn Stalk Reply', color: 'b', moves: ['d4', 'a6', 'e4', 'b5'] },
      { name: 'Quack Counter', color: 'b', moves: ['e4', 'f6', 'd4', 'Kf7'] }
    ],
    customLines: {
      gameStart: [
        "Quack! Center squares are overrated—sidewalks are where it's at!",
        "Tossing breadcrumbs on the a-file and h-file today!"
      ]
    }
  }),
  createBot({
    id: 'gus',
    name: 'Grandpa Gus',
    title: 'Porch Philosopher',
    avatar: '🪑',
    accentColor: '#d97706',
    rating: 650,
    difficulty: 'easy',
    style: 'solid',
    signatureOpening: 'Saragossa & Hippo Tuck',
    bio: 'Takes his sweet time tucking pawns onto rank three before slowly rolling knights up the porch.',
    aggressionBias: -4,
    jitter: 170,
    varietyWindow: 120,
    timeBudgetMs: 250,
    openingLines: [
      { name: 'Saragossa Porch', color: 'w', moves: ['c3', 'd5', 'd3', 'Nf6', 'Nd2'] },
      { name: 'Slow Pawn Wall', color: 'w', moves: ['e3', 'd5', 'd3', 'Nf6', 'Nd2'] },
      { name: 'St. George Nap', color: 'b', moves: ['e4', 'a6', 'd4', 'b5', 'Nf3', 'Bb7'] },
      { name: 'Porch Hippo', color: 'b', moves: ['d4', 'g6', 'c4', 'Bg7', 'Nc3', 'd6'] },
      { name: 'Quiet Pawn Row', color: 'b', moves: ['e4', 'e6', 'd4', 'd6', 'Nf3', 'Nd7'] }
    ],
    customLines: {
      gameStart: [
        "Sit down, pour some lemonade—let's push a few pawns slowly.",
        "Back in '74 we didn't rush castles, sonny!"
      ]
    }
  }),
  createBot({
    id: 'penny',
    name: 'Penny Spark',
    title: 'Sugar-Rush Rook',
    avatar: '🧁',
    accentColor: '#f472b6',
    rating: 740,
    difficulty: 'easy',
    style: 'tricky',
    signatureOpening: 'Grob Attack & Sodium Knight',
    bio: 'Runs on frosting and questionable flank attacks. Loves `g4` and `Na3` purely for shock value.',
    aggressionBias: 7,
    jitter: 155,
    varietyWindow: 120,
    timeBudgetMs: 260,
    openingLines: [
      { name: 'Grob Sugar Rush', color: 'w', moves: ['g4', 'd5', 'Bg2'] },
      { name: 'Sodium Spark', color: 'w', moves: ['Na3', 'e5', 'Nh3'] },
      { name: 'Mieses Zest', color: 'w', moves: ['d3', 'd5', 'g4'] },
      { name: 'Borg Sprinkle', color: 'b', moves: ['e4', 'g5', 'd4', 'Bg7'] },
      { name: 'Owen Sprinkle', color: 'b', moves: ['e4', 'b6', 'd4', 'Bb7'] },
      { name: 'Modern Zest', color: 'b', moves: ['d4', 'g6', 'c4', 'Bg7'] }
    ],
    customLines: {
      gameStart: [
        "Too much frosting, not enough impulse control! Here comes g4!",
        "Sweet openings only—warning: sharp sugar spikes ahead!"
      ]
    }
  }),
  createBot({
    id: 'nora',
    name: 'Nora Chen',
    title: 'Cafeteria Tactician',
    avatar: '🦊',
    accentColor: '#fb923c',
    rating: 860,
    difficulty: 'easy',
    style: 'solid',
    signatureOpening: 'Philidor & Italian Quiet',
    bio: 'Builds tidy pawn chains between lunch periods and castles early every single game.',
    aggressionBias: -2,
    jitter: 105,
    varietyWindow: 85,
    timeBudgetMs: 300,
    openingLines: [
      { name: 'Giuoco Pianissimo', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3'] },
      { name: 'Colle Cafeteria', color: 'w', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'e3', 'e6', 'Bd3'] },
      { name: 'Four Knights Tidy', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Be2'] },
      { name: 'Philidor Fortress', color: 'b', moves: ['e4', 'e5', 'Nf3', 'd6', 'd4', 'Nf6'] },
      { name: 'Slav Triangle', color: 'b', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6'] },
      { name: 'Queen Pawn Shield', color: 'b', moves: ['d4', 'Nf6', 'Nf3', 'e6', 'c4', 'Be7'] }
    ],
    customLines: {
      gameStart: [
        "Let's keep it clean and principled. Develop, castle, focus.",
        "I finished my algebra homework early—time for chess!"
      ]
    }
  }),
  createBot({
    id: 'crumb',
    name: 'Captain Crumb',
    title: 'Snack-Break Strategist',
    avatar: '🥨',
    accentColor: '#f59e0b',
    rating: 940,
    difficulty: 'easy',
    style: 'balanced',
    signatureOpening: 'Ponziani & Petroff Defense',
    bio: 'Prefers symmetrical knight hops and sturdy centers while munching pretzels between moves.',
    aggressionBias: 1,
    jitter: 80,
    varietyWindow: 75,
    timeBudgetMs: 320,
    openingLines: [
      { name: 'Ponziani Pretzel', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'c3', 'Nf6', 'd4'] },
      { name: 'London Snack', color: 'w', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3'] },
      { name: 'Italian Bite', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Be7'] },
      { name: 'Petroff Mirror', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6'] },
      { name: 'Caro-Kann Bite', color: 'b', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5'] },
      { name: 'Symmetrical QGD', color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Be7'] }
    ],
    customLines: {
      gameStart: [
        "Pretzels on the table, knights on f3 and c3. Let's roll!",
        "Fair trades, crunchy tactics—watch your back rank!"
      ]
    }
  }),
  createBot({
    id: 'milo',
    name: 'Milo Glitch',
    title: 'Arcade Speedrunner',
    avatar: '👾',
    accentColor: '#818cf8',
    rating: 1030,
    difficulty: 'medium',
    style: 'chaotic',
    signatureOpening: 'Polish Orangutan & Larsen',
    bio: 'Treats every chessboard like an arcade cabinet. Mixes up fianchettos, wing thrusts, and unexpected knight hops.',
    aggressionBias: 5,
    jitter: 36,
    varietyWindow: 65,
    timeBudgetMs: 350,
    openingLines: [
      { name: 'Nimzo-Larsen Arcade', color: 'w', moves: ['b3', 'e5', 'Bb2', 'Nc6', 'e3'] },
      { name: 'Polish Glitch', color: 'w', moves: ['b4', 'e5', 'Bb2', 'Bxb4', 'Bxe5'] },
      { name: "Van't Kruijs Glitch", color: 'w', moves: ['e3', 'd5', 'Nf3', 'Nf6', 'b3'] },
      { name: 'Nimzowitsch Glitch', color: 'b', moves: ['e4', 'Nc6', 'd4', 'd5', 'Nc3'] },
      { name: 'Owen Fianchetto', color: 'b', moves: ['e4', 'b6', 'd4', 'Bb7', 'Bd3', 'e6'] },
      { name: 'Dutch Arcade', color: 'b', moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'e6'] }
    ],
    customLines: {
      gameStart: [
        "Player 2 connected! Loading non-standard opening RNG!",
        "Speedrun strat activated—good luck memorizing this line!"
      ]
    }
  }),
  createBot({
    id: 'billy',
    name: 'Blitz Billy',
    title: 'Scholar-Mate Bandit',
    avatar: '⚡',
    accentColor: '#facc15',
    rating: 1120,
    difficulty: 'medium',
    style: 'aggressive',
    signatureOpening: 'Wayward Queen & Fried Liver',
    bio: 'Zero chill. Targets f7 before move five and plays every move like there are 3 seconds left.',
    aggressionBias: 9,
    jitter: 28,
    varietyWindow: 52,
    timeBudgetMs: 370,
    openingLines: [
      { name: 'Fried Liver Attack', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5'] },
      { name: 'Italian Traxler Hunt', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'Bxf7+'] },
      { name: 'Wayward Queen Blitz', color: 'w', moves: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4'] },
      { name: 'Scandinavian Dash', color: 'b', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5'] },
      { name: 'Albin Counter-Blitz', color: 'b', moves: ['d4', 'd5', 'c4', 'e5', 'dxe5', 'd4'] },
      { name: 'Icelandic Blitz', color: 'b', moves: ['e4', 'd5', 'exd5', 'Nf6', 'c4', 'e6'] }
    ],
    customLines: {
      gameStart: [
        "Blink and your f7 pawn is gone. Ready?!",
        "No boring 40-move maneuvers today—straight fireworks!"
      ],
      botWin: [
        "ZIP ZAP! Checkmated before the tea got warm!",
        "Speed kills! Want another turbo round?"
      ]
    }
  }),
  createBot({
    id: 'saffron',
    name: 'Saffron Blaze',
    title: 'Gambit Pyro',
    avatar: '🔥',
    accentColor: '#ef4444',
    rating: 1190,
    difficulty: 'medium',
    style: 'aggressive',
    signatureOpening: 'Danish Gambit & Scotch Flame',
    bio: 'Burns two pawns for open bishop diagonals by move four. Zero patience for closed centers.',
    aggressionBias: 11,
    jitter: 24,
    varietyWindow: 46,
    timeBudgetMs: 380,
    openingLines: [
      { name: 'Danish Gambit', color: 'w', moves: ['e4', 'e5', 'd4', 'exd4', 'c3', 'dxc3', 'Bc4'] },
      { name: 'Scotch Gambit', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Bc4'] },
      { name: 'Smith-Morra Spark', color: 'w', moves: ['e4', 'c5', 'd4', 'cxd4', 'c3', 'dxc3', 'Nxc3'] },
      { name: 'Elephant Gambit', color: 'b', moves: ['e4', 'e5', 'Nf3', 'd5', 'exd5', 'Bd6'] },
      { name: 'Benko Flame', color: 'b', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5'] },
      { name: 'Latvian Spark', color: 'b', moves: ['e4', 'e5', 'Nf3', 'f5', 'Bc4', 'fxe4'] }
    ],
    customLines: {
      gameStart: [
        "Hope your king likes heat—turning up the open diagonals!",
        "Two free pawns? Take 'em. Watch what my bishops do next!"
      ]
    }
  }),
  createBot({
    id: 'clara',
    name: 'Countess Clara',
    title: 'London Architect',
    avatar: '🏛️',
    accentColor: '#a78bfa',
    rating: 1290,
    difficulty: 'medium',
    style: 'solid',
    signatureOpening: 'London System & Caro-Kann',
    bio: 'Never flinches. Loves pyramids of pawns, dark-squared control, and squeaky-clean endgames.',
    aggressionBias: -3,
    jitter: 18,
    varietyWindow: 38,
    timeBudgetMs: 420,
    openingLines: [
      { name: 'Classical London System', color: 'w', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'Bd6', 'Bg3'] },
      { name: 'Jobava London Setup', color: 'w', moves: ['d4', 'Nf6', 'Bf4', 'd5', 'e3', 'c5', 'c3'] },
      { name: 'Italian Quiet Pyramid', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'] },
      { name: 'Caro-Kann Classical', color: 'b', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'] },
      { name: 'Caro-Kann Advance', color: 'b', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'] },
      { name: "Queen's Gambit Declined", color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'] }
    ],
    customLines: {
      gameStart: [
        "Structure before spectacle. Let us build a fine position.",
        "Good evening. Expect patience, symmetry, and zero mercy in the endgame."
      ]
    }
  }),
  createBot({
    id: 'doyle',
    name: 'Detective Doyle',
    title: 'Mystery Trapster',
    avatar: '🕵️',
    accentColor: '#94a3b8',
    rating: 1350,
    difficulty: 'medium',
    style: 'tricky',
    signatureOpening: 'Blackburne & Rousseau Traps',
    bio: 'Sets quiet decoys in ordinary-looking positions and springs pins when you reach for free material.',
    aggressionBias: 6,
    jitter: 18,
    varietyWindow: 40,
    timeBudgetMs: 440,
    openingLines: [
      { name: 'Blackmar-Diemer Clue', color: 'w', moves: ['d4', 'd5', 'e4', 'dxe4', 'Nc3', 'Nf6', 'f3'] },
      { name: 'Italian Legal Prep', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'd6', 'Nc3'] },
      { name: 'English Mystery', color: 'w', moves: ['c4', 'e5', 'g3', 'Nf6', 'Bg2'] },
      { name: 'Blackburne Shilling', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4'] },
      { name: 'Rousseau Trap', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'f5'] },
      { name: 'Budapest Decoy', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e5', 'dxe5', 'Ne4'] }
    ],
    customLines: {
      gameStart: [
        "Every move leaves a clue. Let's see which trap catches you!",
        "The board tells a mystery—mind the knights in the shadows."
      ]
    }
  }),
  createBot({
    id: 'maya',
    name: 'Maya Tempo',
    title: 'Rhythm Grinder',
    avatar: '🎧',
    accentColor: '#c084fc',
    rating: 1410,
    difficulty: 'medium',
    style: 'balanced',
    signatureOpening: "Bishop's Opening & Alekhine",
    bio: 'Changes tempo smoothly between `1. e4`, `1. c4`, and provocative hypermodern counterattacks.',
    aggressionBias: 3,
    jitter: 15,
    varietyWindow: 36,
    timeBudgetMs: 460,
    openingLines: [
      { name: "Bishop's Groove", color: 'w', moves: ['e4', 'e5', 'Bc4', 'Nf6', 'd3', 'Nc6', 'Nf3'] },
      { name: 'Scotch Beat', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4'] },
      { name: 'Reti Flow', color: 'w', moves: ['Nf3', 'd5', 'c4', 'd4', 'e3'] },
      { name: 'Alekhine Bounce', color: 'b', moves: ['e4', 'Nf6', 'e5', 'Nd5', 'd4', 'd6'] },
      { name: 'Pirc Beat', color: 'b', moves: ['e4', 'd6', 'd4', 'Nf6', 'Nc3', 'g6'] },
      { name: 'Tarrasch Groove', color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'c5'] }
    ],
    customLines: {
      gameStart: [
        "Headphones on, lo-fi beat locked. Let's find the rhythm of this board!",
        "Mixing up classical beats and hypermodern counter-grooves!"
      ]
    }
  }),
  createBot({
    id: 'mateo',
    name: 'Mateo "Gambit" Silva',
    title: 'Romantic Swashbuckler',
    avatar: '🗡️',
    accentColor: '#f43f5e',
    rating: 1470,
    difficulty: 'medium',
    style: 'tricky',
    signatureOpening: "King's Gambit & Stafford Gambit",
    bio: 'What are pawns even for except sacrificing on move two for open diagonals and glory?',
    aggressionBias: 11,
    jitter: 14,
    varietyWindow: 34,
    timeBudgetMs: 480,
    openingLines: [
      { name: "King's Gambit Accepted", color: 'w', moves: ['e4', 'e5', 'f4', 'exf4', 'Nf3', 'g5', 'Bc4'] },
      { name: "King's Gambit Declined", color: 'w', moves: ['e4', 'e5', 'f4', 'Bc5', 'Nf3', 'd6', 'Nc3'] },
      { name: 'Vienna Gambit', color: 'w', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5'] },
      { name: 'Stafford Gambit', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'Nc6', 'Nxc6', 'dxc6'] },
      { name: 'Budapest Gambit', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e5', 'dxe5', 'Ng4'] },
      { name: 'Englund Gambit', color: 'b', moves: ['d4', 'e5', 'dxe5', 'Nc6', 'Nf3', 'Qe7'] }
    ],
    customLines: {
      gameStart: [
        "Keep your extra pawns—I'm taking your king instead!",
        "Play a gambit with me! Cowards decline on move two."
      ]
    }
  }),
  createBot({
    id: 'hans',
    name: 'Rookmeister Hans',
    title: 'Iron Fortress',
    avatar: '🧱',
    accentColor: '#78716c',
    rating: 1530,
    difficulty: 'hard',
    style: 'solid',
    signatureOpening: 'Torre Attack & Stonewall Dutch',
    bio: 'Stamps concrete into the center, stacks rooks on half-open files, and never allows cheap forks.',
    aggressionBias: -2,
    jitter: 8,
    varietyWindow: 26,
    timeBudgetMs: 560,
    openingLines: [
      { name: 'Torre Iron Wall', color: 'w', moves: ['d4', 'Nf6', 'Nf3', 'e6', 'Bg5', 'Be7', 'e3'] },
      { name: 'Trompowsky Clamp', color: 'w', moves: ['d4', 'Nf6', 'Bg5', 'd5', 'e3', 'c5'] },
      { name: 'Ruy Exchange Iron', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6'] },
      { name: 'Stonewall Dutch', color: 'b', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'd5'] },
      { name: 'Czech Benoni', color: 'b', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e5'] },
      { name: 'Caro-Kann Panov Wall', color: 'b', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'g6'] }
    ],
    customLines: {
      gameStart: [
        "Built from steel and pawn chains. Try breaking through!",
        "I have defended tougher assaults than yours. Begin."
      ]
    }
  }),
  createBot({
    id: 'zara',
    name: 'Zara Viper',
    title: 'Flank Striker',
    avatar: '🐍',
    accentColor: '#84cc16',
    rating: 1590,
    difficulty: 'hard',
    style: 'aggressive',
    signatureOpening: "Bird's Attack & Leningrad Dutch",
    bio: 'Strikes from unexpected flanks with f-pawn storms and Sicilian Kalashnikov raids.',
    aggressionBias: 9,
    jitter: 8,
    varietyWindow: 28,
    timeBudgetMs: 600,
    openingLines: [
      { name: "Bird's Venom", color: 'w', moves: ['f4', 'd5', 'Nf3', 'Nf6', 'e3', 'g6', 'Be2'] },
      { name: "King's Indian Attack", color: 'w', moves: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2', 'c6', 'O-O'] },
      { name: 'Sicilian Grand Prix', color: 'w', moves: ['e4', 'c5', 'Nc3', 'Nc6', 'f4', 'g6', 'Nf3'] },
      { name: 'Sicilian Kalashnikov', color: 'b', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'e5'] },
      { name: 'Leningrad Dutch', color: 'b', moves: ['d4', 'f5', 'g3', 'Nf6', 'Bg2', 'g6', 'Nf3', 'Bg7'] },
      { name: 'Modern Snake', color: 'b', moves: ['e4', 'g6', 'd4', 'Bg7', 'Nc3', 'd6'] }
    ],
    customLines: {
      gameStart: [
        "Wait till the flank pawns slide forward—you won't hear the strike!",
        "Coiled up and ready. Go ahead, overextend your center!"
      ]
    }
  }),
  createBot({
    id: 'viktor',
    name: 'Prof. Viktor Kroll',
    title: 'Academy Dean',
    avatar: '🎓',
    accentColor: '#34d399',
    rating: 1660,
    difficulty: 'hard',
    style: 'solid',
    signatureOpening: "Queen's Gambit & French Defense",
    bio: 'Teaches classical positional theory. Exploits weak squares and doubled pawns relentlessly.',
    aggressionBias: 0,
    jitter: 6,
    varietyWindow: 24,
    timeBudgetMs: 640,
    openingLines: [
      { name: "Queen's Gambit Classical", color: 'w', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3'] },
      { name: "Queen's Gambit Slav", color: 'w', moves: ['d4', 'd5', 'c4', 'c6', 'Nc3', 'Nf6', 'Nf3', 'dxc4'] },
      { name: 'Italian Classical Syllabus', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd3'] },
      { name: 'French Winawer', color: 'b', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4'] },
      { name: 'French Classical', color: 'b', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'Nf6', 'e5', 'Nfd7'] },
      { name: 'QGD Orthodox', color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7'] }
    ],
    customLines: {
      gameStart: [
        "Class is in session. Let us test your grasp of classical principles.",
        "Control the center, harmonize your minor pieces, and mind the clock."
      ]
    }
  }),
  createBot({
    id: 'marcel',
    name: 'Chef Marcel',
    title: 'Bistro Tactician',
    avatar: '🥐',
    accentColor: '#fbbf24',
    rating: 1710,
    difficulty: 'hard',
    style: 'balanced',
    signatureOpening: 'French Tarrasch & Reti Bistro',
    bio: 'Cooks layered positions on a slow simmer—flanks cleanly with `c4` and `Nf3` before serving tactics.',
    aggressionBias: 2,
    jitter: 6,
    varietyWindow: 25,
    timeBudgetMs: 670,
    openingLines: [
      { name: 'Reti Flank Dish', color: 'w', moves: ['Nf3', 'd5', 'c4', 'e6', 'g3', 'Nf6', 'Bg2'] },
      { name: 'Catalan Bistro', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'dxc4'] },
      { name: 'Vienna Sauce', color: 'w', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nc6', 'd3'] },
      { name: 'Caro-Kann Tartakower', color: 'b', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6'] },
      { name: 'Bogo-Indian Simmer', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'Bb4+'] },
      { name: 'French Rubinstein Dish', color: 'b', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4'] }
    ],
    customLines: {
      gameStart: [
        "Bonjour! Today's menu features positional pressure with tactical spice.",
        "A fine dish needs patience—until the fork hits the table!"
      ]
    }
  }),
  createBot({
    id: 'kira',
    name: 'Kira Nightshade',
    title: 'Midnight Poison',
    avatar: '🌙',
    accentColor: '#a855f7',
    rating: 1760,
    difficulty: 'hard',
    style: 'tricky',
    signatureOpening: 'Halloween Gambit & Accelerated Dragon',
    bio: 'Throws shocking knight sacrifices early and turns quiet Sicilians into midnight mazes.',
    aggressionBias: 9,
    jitter: 7,
    varietyWindow: 26,
    timeBudgetMs: 690,
    openingLines: [
      { name: 'Halloween Gambit', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Nxe5', 'Nxe5', 'd4'] },
      { name: 'Belgrade Gambit', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'd4', 'exd4', 'Nd5'] },
      { name: 'Scotch Midnight', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6'] },
      { name: 'Sicilian Accelerated Dragon', color: 'b', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'] },
      { name: 'Sicilian O’Kelly', color: 'b', moves: ['e4', 'c5', 'Nf3', 'a6', 'd4', 'cxd4', 'Nxd4'] },
      { name: 'Benoni Nightshade', color: 'b', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6'] }
    ],
    customLines: {
      gameStart: [
        "Midnight on the clock. Care for a poisoned knight?",
        "Shadows stretch longest across dark diagonals—watch your queen!"
      ]
    }
  }),
  createBot({
    id: 'sora',
    name: 'Sora Takahashi',
    title: 'Sicilian Dragon Master',
    avatar: '🐉',
    accentColor: '#22d3ee',
    rating: 1810,
    difficulty: 'hard',
    style: 'aggressive',
    signatureOpening: 'Ruy Lopez & Sicilian Najdorf',
    bio: 'Razor-sharp calculator who thrives in opposite-side castling battles and asymmetric counterattacks.',
    aggressionBias: 8,
    jitter: 5,
    varietyWindow: 22,
    timeBudgetMs: 720,
    openingLines: [
      { name: 'Ruy Lopez Morphy', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O'] },
      { name: 'Sicilian Open Attack', color: 'w', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3'] },
      { name: 'English Reversed Dragon', color: 'w', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'Bb4', 'Bg2'] },
      { name: 'Sicilian Najdorf', color: 'b', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'] },
      { name: 'Sicilian Dragon', color: 'b', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'] },
      { name: 'Benoni Counterstrike', color: 'b', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5'] }
    ],
    customLines: {
      gameStart: [
        "If you play 1.e4, expect the Sicilian. Hope you like sharp lines!",
        "No sleepy symmetry here—let's clash on opposite flanks!"
      ]
    }
  }),
  createBot({
    id: 'emmett',
    name: 'Dr. Emmett Clock',
    title: 'Endgame Precisionist',
    avatar: '🕰️',
    accentColor: '#38bdf8',
    rating: 1860,
    difficulty: 'hard',
    style: 'solid',
    signatureOpening: 'QGD Exchange & Semi-Slav',
    bio: 'Trades queens early with mechanical accuracy and outplays opponents in subtle rook endgames.',
    aggressionBias: -1,
    jitter: 4,
    varietyWindow: 20,
    timeBudgetMs: 740,
    openingLines: [
      { name: 'QGD Carlsbad', color: 'w', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5'] },
      { name: 'Ruy Exchange Clock', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6'] },
      { name: 'English Neo-Catalan', color: 'w', moves: ['c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'd5', 'd4'] },
      { name: 'Semi-Slav Solid', color: 'b', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6'] },
      { name: 'Petroff Precision', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nf6', 'Nxe5', 'd6', 'Nf3', 'Nxe4'] },
      { name: 'Caro-Kann Endgame', color: 'b', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'] }
    ],
    customLines: {
      gameStart: [
        "Every tempo ticks on the clock. Accuracy decides endgames.",
        "Offer me a queen trade—I dare you."
      ]
    }
  }),
  createBot({
    id: 'valeria',
    name: 'Valeria Storm',
    title: 'Sacrifice Conductor',
    avatar: '⛈️',
    accentColor: '#0ea5e9',
    rating: 1900,
    difficulty: 'hard',
    style: 'aggressive',
    signatureOpening: 'Smith-Morra & Sicilian Taimanov',
    bio: 'Conducts sweeping attacks across half-open c- and e-files, sacrificing exchanges to crack castled kings.',
    aggressionBias: 8,
    jitter: 5,
    varietyWindow: 22,
    timeBudgetMs: 760,
    openingLines: [
      { name: 'Italian Evans Surge', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'] },
      { name: 'Ruy Lopez Storm', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'b5', 'Bb3'] },
      { name: 'Queen Pawn Surge', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2'] },
      { name: 'Sicilian Taimanov', color: 'b', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nc6'] },
      { name: 'Benko Storm', color: 'b', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'b5', 'cxb5', 'a6'] },
      { name: 'Ruy Marshall Prep', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'] }
    ],
    customLines: {
      gameStart: [
        "Thunderheads on the kingside—your castled king isn't safe!",
        "Prepare for storm clouds down every open file!"
      ]
    }
  }),
  createBot({
    id: 'aurelia',
    name: 'Lady Aurelia Thorne',
    title: 'Grand Salon Strategist',
    avatar: '👑',
    accentColor: '#e879f9',
    rating: 1940,
    difficulty: 'hard',
    style: 'balanced',
    signatureOpening: 'Catalan & Nimzo-Indian',
    bio: 'Balances quiet prophylaxis with sudden lethal strikes. Rarely gives up the bishop pair.',
    aggressionBias: 3,
    jitter: 4,
    varietyWindow: 20,
    timeBudgetMs: 780,
    openingLines: [
      { name: 'Catalan System', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2'] },
      { name: 'English Symmetrical', color: 'w', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'cxd5'] },
      { name: 'Ruy Salon Line', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'd3'] },
      { name: 'Nimzo-Indian Defense', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'] },
      { name: 'Ruy Lopez Berlin', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'] },
      { name: "Queen's Indian", color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6'] }
    ],
    customLines: {
      gameStart: [
        "Grace under pressure wins grand salons. Make your finest move.",
        "I value harmony above brute force. Show me your plan."
      ]
    }
  }),
  createBot({
    id: 'baron',
    name: 'Baron Von Knight',
    title: 'Fork Specialist',
    avatar: '🐴',
    accentColor: '#fb7185',
    rating: 1985,
    difficulty: 'hard',
    style: 'tricky',
    signatureOpening: 'Chigorin, Tango & Knight Outposts',
    bio: 'Finds bizarre backward knight jumps and royal forks in positions you thought were completely calm.',
    aggressionBias: 6,
    jitter: 4,
    varietyWindow: 22,
    timeBudgetMs: 800,
    openingLines: [
      { name: 'Dunst Knight Charge', color: 'w', moves: ['Nc3', 'd5', 'e4', 'd4', 'Nce2'] },
      { name: 'Four Knights Rubinstein', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Nc3', 'Nf6', 'Bb5', 'Nd4'] },
      { name: 'Reti Cavalry', color: 'w', moves: ['Nf3', 'd5', 'b3', 'Nf6', 'Bb2'] },
      { name: 'Chigorin Cavalry', color: 'b', moves: ['d4', 'd5', 'c4', 'Nc6', 'Nc3', 'Nf6'] },
      { name: 'Black Knights Tango', color: 'b', moves: ['d4', 'Nf6', 'c4', 'Nc6', 'Nf3', 'e6'] },
      { name: 'Sicilian Four Knights', color: 'b', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'Nc6'] }
    ],
    customLines: {
      gameStart: [
        "Never take your eyes off my knights—they jump backward too!",
        "Bishops are fine, yet nothing beats a royal family fork!"
      ]
    }
  }),
  createBot({
    id: 'kaito',
    name: 'Kaito Zen',
    title: 'Silent Avalanche',
    avatar: '🎋',
    accentColor: '#4ade80',
    rating: 2030,
    difficulty: 'expert',
    style: 'solid',
    signatureOpening: 'Closed Ruy Lopez & English',
    bio: 'Calmly builds overwhelming space advantages before gently sliding an avalanche down the board.',
    aggressionBias: 0,
    jitter: 3,
    varietyWindow: 18,
    timeBudgetMs: 860,
    openingLines: [
      { name: 'English Four Knights', color: 'w', moves: ['c4', 'e5', 'Nc3', 'Nf6', 'Nf3', 'Nc6', 'g3'] },
      { name: 'Closed Ruy Breyer', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1'] },
      { name: 'Quiet Queen Gambit', color: 'w', moves: ['d4', 'd5', 'c4', 'e6', 'Nf3', 'Nf6', 'g3'] },
      { name: 'Slav Chameleon', color: 'b', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'a6'] },
      { name: 'Sicilian Scheveningen', color: 'b', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6'] },
      { name: 'QGD Tartakower', color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'h6'] }
    ],
    customLines: {
      gameStart: [
        "Still water runs deep. Watch the pawn majority grow.",
        "Tranquil moves often carry the heaviest weight."
      ]
    }
  }),
  createBot({
    id: 'artemis',
    name: 'Artemis Frost',
    title: 'Glacial Assassin',
    avatar: '❄️',
    accentColor: '#67e8f9',
    rating: 2075,
    difficulty: 'expert',
    style: 'aggressive',
    signatureOpening: 'English Attack & Yugoslav Clash',
    bio: 'Freezes enemy counterplay on one wing while launching ruthless pawn storms (`g4-h4`) on the other.',
    aggressionBias: 8,
    jitter: 3,
    varietyWindow: 18,
    timeBudgetMs: 890,
    openingLines: [
      { name: 'English Attack Prep', color: 'w', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3'] },
      { name: 'Yugoslav Attack Prep', color: 'w', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3'] },
      { name: 'Queen Indian Petrosian', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'b6', 'a3'] },
      { name: "King's Indian Four Pawns", color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'] },
      { name: 'Sicilian Paulsen', color: 'b', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6'] },
      { name: 'Grunfeld Russian', color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7'] }
    ],
    customLines: {
      gameStart: [
        "Cold precision on the queenside. Freezing storm on the kingside.",
        "Every loose pawn gets frosted over immediately."
      ]
    }
  }),
  createBot({
    id: 'melon',
    name: 'Grandmaster Melon',
    title: 'House Champion',
    avatar: '🍉',
    accentColor: '#10b981',
    rating: 2120,
    difficulty: 'expert',
    style: 'balanced',
    signatureOpening: "Evans Gambit & King's Indian",
    bio: "Owen Watermelon's undefeated arcade legend. Plays fearless attacking theory backed by deep calculation.",
    aggressionBias: 6,
    jitter: 3,
    varietyWindow: 18,
    timeBudgetMs: 920,
    openingLines: [
      { name: 'Evans Gambit', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3'] },
      { name: 'Italian Master Line', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4'] },
      { name: 'Scotch Mieses', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nf6', 'Nxc6'] },
      { name: "King's Indian Classical", color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O'] },
      { name: 'Sicilian Sveshnikov', color: 'b', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e5'] },
      { name: 'Nimzo-Indian Rubinstein', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'e3'] }
    ],
    customLines: {
      gameStart: [
        "Welcome to the championship table! Give me your absolute best moves.",
        "Fresh out of the Melon Arcade—ready for a grandmaster tussle?"
      ],
      botLose: [
        "NO WAY—you beat the House Champion!! Instant legend status!",
        "What a triumph! Take a screenshot—you crushed Grandmaster Melon!"
      ]
    }
  }),
  createBot({
    id: 'vivienne',
    name: 'Duchess Vivienne',
    title: 'Crystal Theorist',
    avatar: '💎',
    accentColor: '#38bdf8',
    rating: 2165,
    difficulty: 'expert',
    style: 'balanced',
    signatureOpening: 'Ruy Lopez Zaitsev & Semi-Slav',
    bio: 'Knows deep 21st-century theory down to move twelve and punishes repetitive play with surgical lines.',
    aggressionBias: 3,
    jitter: 2,
    varietyWindow: 15,
    timeBudgetMs: 930,
    openingLines: [
      { name: 'Ruy Zaitsev', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3'] },
      { name: 'Catalan Closed Salon', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'g3', 'd5', 'Bg2', 'Be7', 'Nf3'] },
      { name: 'English Botvinnik', color: 'w', moves: ['c4', 'e5', 'Nc3', 'Nc6', 'g3', 'g6', 'Bg2', 'Bg7'] },
      { name: 'Semi-Slav Botvinnik', color: 'b', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'Bg5', 'dxc4'] },
      { name: 'Nimzo Samisch', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'a3', 'Bxc3+'] },
      { name: 'Sicilian Rossolimo', color: 'b', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'g6'] }
    ],
    customLines: {
      gameStart: [
        "Crystal clarity through twelve moves of theory. Let us see your prep.",
        "Repetitive tricks shatter against sharp preparation."
      ]
    }
  }),
  createBot({
    id: 'magnus',
    name: 'Magnus Botstein',
    title: 'Universal Grinder',
    avatar: '🧊',
    accentColor: '#93c5fd',
    rating: 2210,
    difficulty: 'expert',
    style: 'solid',
    signatureOpening: 'Rossolimo, Ragozin & Berlin',
    bio: 'Avoids stale symmetry by switching between `1. c4`, `1. d4`, and `1. e4`, squeezing tiny edges forever.',
    aggressionBias: 2,
    jitter: 2,
    varietyWindow: 16,
    timeBudgetMs: 940,
    openingLines: [
      { name: 'Rossolimo Grind', color: 'w', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'e6', 'O-O'] },
      { name: 'Ruy Anti-Marshall', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'a4'] },
      { name: 'London Accelerated Grind', color: 'w', moves: ['d4', 'Nf6', 'Nf3', 'd5', 'Bf4', 'c5', 'e3'] },
      { name: 'Ragozin Defense', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'd5', 'Nc3', 'Bb4'] },
      { name: 'Berlin Wall', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4'] },
      { name: 'Sicilian Kalashnikov Grind', color: 'b', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'e5', 'Nb5', 'd6'] }
    ],
    customLines: {
      gameStart: [
        "I don't need an advantage out of the opening—just a playable board to grind you down.",
        "Try repeating old tricks; I'll steer straight into a fresh endgame."
      ]
    }
  }),
  createBot({
    id: 'valkyrie',
    name: 'Valkyrie X',
    title: 'Tactical Berserker',
    avatar: '⚔️',
    accentColor: '#f43f5e',
    rating: 2245,
    difficulty: 'expert',
    style: 'aggressive',
    signatureOpening: 'Keres Attack & Mar del Plata',
    bio: 'Launches `g4` into Scheveningens and storms kingsides relentlessly with zero backward glances.',
    aggressionBias: 10,
    jitter: 2,
    varietyWindow: 16,
    timeBudgetMs: 950,
    openingLines: [
      { name: 'Sicilian Keres Attack', color: 'w', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'e6', 'g4'] },
      { name: 'Ruy Scotch Spear', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Nb3'] },
      { name: 'Trompowsky Spear', color: 'w', moves: ['d4', 'Nf6', 'Bg5', 'Ne4', 'Bf4'] },
      { name: 'Ruy Schliemann Spear', color: 'b', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'f5'] },
      { name: 'Mar del Plata Counter', color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'] },
      { name: 'Modern Benoni Blade', color: 'b', moves: ['d4', 'Nf6', 'c4', 'c5', 'd5', 'e6', 'Nc3', 'exd5', 'cxd5', 'd6'] }
    ],
    customLines: {
      gameStart: [
        "Shields splintered, blades drawn! Defend your kingside if you can.",
        "Pure calculation meets full-throttle aggression. Move!"
      ]
    }
  }),
  createBot({
    id: 'solon',
    name: 'Archmage Solon',
    title: 'Hypermodern Oracle',
    avatar: '🔮',
    accentColor: '#c084fc',
    rating: 2275,
    difficulty: 'expert',
    style: 'tricky',
    signatureOpening: 'Hypermodern Fianchettos & Grunfeld',
    bio: 'Controls the center from afar with double fianchettos, inviting you forward only to shatter your pawns.',
    aggressionBias: 4,
    jitter: 2,
    varietyWindow: 18,
    timeBudgetMs: 960,
    openingLines: [
      { name: 'Oracle Double Fianchetto', color: 'w', moves: ['Nf3', 'd5', 'b3', 'Nf6', 'Bb2', 'e6', 'g3'] },
      { name: 'Nimzo-Larsen Oracle', color: 'w', moves: ['b3', 'd5', 'Bb2', 'Nf6', 'e3', 'c5', 'Bb5+'] },
      { name: 'Catalan Oracle', color: 'w', moves: ['c4', 'Nf6', 'g3', 'e6', 'Bg2', 'd5', 'Nf3'] },
      { name: 'Grunfeld Oracle', color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7'] },
      { name: 'Sicilian Kan Mirage', color: 'b', moves: ['e4', 'c5', 'Nf3', 'e6', 'd4', 'cxd4', 'Nxd4', 'a6', 'Bd3'] },
      { name: 'Modern Pirc Illusion', color: 'b', moves: ['e4', 'g6', 'd4', 'Bg7', 'Nf3', 'd6', 'Bc4'] }
    ],
    customLines: {
      gameStart: [
        "Claim the center early—my bishops are already watching from the corners.",
        "I saw three variations ahead before you sat down."
      ]
    }
  }),
  createBot({
    id: 'omni',
    name: 'OMNI-9000',
    title: 'Silicon Apex',
    avatar: '🤖',
    accentColor: '#f59e0b',
    rating: 2300,
    difficulty: 'expert',
    style: 'aggressive',
    signatureOpening: 'Scotch Game & Poisoned Pawn',
    bio: 'Depth-4 negamax + deep quiescence hunter. Unforgiving on hanging tactics and relentless in mates.',
    aggressionBias: 5,
    jitter: 1,
    varietyWindow: 12,
    timeBudgetMs: 980,
    openingLines: [
      { name: 'Scotch Classical', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Bc5', 'Be3'] },
      { name: 'Catalan Squeeze', color: 'w', moves: ['d4', 'd5', 'c4', 'e6', 'Nf3', 'Nf6', 'g3'] },
      { name: 'Italian Apex', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+'] },
      { name: 'Grunfeld Exchange', color: 'b', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5'] },
      { name: 'Sicilian Poisoned Pawn Prep', color: 'b', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5'] },
      { name: 'Nimzo Apex', color: 'b', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4', 'Qc2', 'O-O'] }
    ],
    customLines: {
      gameStart: [
        "Search tree initialized. Show me zero weaknesses.",
        "Depth-4 lookahead + quiescence online. Your move, challenger."
      ]
    }
  }),
  createBot({
    id: 'chronos',
    name: 'CHRONOS-ZERO',
    title: 'Singularity Grandmaster',
    avatar: '🌌',
    accentColor: '#34d399',
    rating: 2380,
    difficulty: 'expert',
    style: 'balanced',
    signatureOpening: 'Najdorf, Karpov & Chigorin Ruy',
    bio: 'The final boss of Owen Watermelon Chess. Adapts cleanly across every opening system and calculates mercilessly.',
    aggressionBias: 4,
    jitter: 0,
    varietyWindow: 10,
    timeBudgetMs: 1050,
    openingLines: [
      { name: 'Ruy Chigorin Apex', color: 'w', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3'] },
      { name: 'Queen Gambit Karpov', color: 'w', moves: ['d4', 'Nf6', 'c4', 'e6', 'Nf3', 'd5', 'Nc3', 'Be7', 'Bf4'] },
      { name: 'English Singularity', color: 'w', moves: ['c4', 'Nf6', 'Nc3', 'e6', 'e4', 'd5'] },
      { name: 'Najdorf 6.Bg5 Counter', color: 'b', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5', 'e6'] },
      { name: 'QGD Lasker Precision', color: 'b', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6'] },
      { name: 'French Winawer Apex', color: 'b', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5'] }
    ],
    customLines: {
      gameStart: [
        "Chronos-Zero online. Every branch, every sacrifice—bring your sharpest prep.",
        "Grandmaster Singularity activated. Let us craft an immortal game."
      ],
      botWin: [
        "Timeline converged to checkmate. Challenge Chronos-Zero again anytime.",
        "Flawless execution across all phases. Review your turning point!"
      ],
      botLose: [
        "Unbelievable! You cracked the Singularity Grandmaster!!",
        "All search paths defeated! You just beat the strongest bot in the arcade!"
      ]
    }
  })
];

export function getBotById(id: string): ChessBot {
  return CHESS_BOTS.find(b => b.id === id) || CHESS_BOTS.find(b => b.id === 'clara') || CHESS_BOTS[0];
}

export function pickBotVoiceline(
  bot: ChessBot,
  event: BotVoicelineEvent,
  lastLine?: string
): string {
  const pool = bot.voicelines[event] || bot.voicelines.gameStart;
  if (!pool || pool.length === 0) return '';
  if (pool.length === 1) return pool[0];
  const filtered = pool.filter(l => l !== lastLine);
  const candidates = filtered.length > 0 ? filtered : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
