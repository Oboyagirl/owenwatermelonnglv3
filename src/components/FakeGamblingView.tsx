import React, { useState, useRef, useEffect } from 'react';
import { 
  Coins, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  ShieldAlert, 
  Play, 
  Layers, 
  Bomb, 
  Gem, 
  Dices, 
  Maximize2, 
  ExternalLink,
  Info,
  Check,
  ChevronRight,
  Zap,
  DollarSign
} from 'lucide-react';
import { ThemeConfig } from '../services/themeStore';
import { Game } from '../types/game';

interface FakeGamblingViewProps {
  activeTheme?: ThemeConfig;
  onPlayGame?: (game: Game) => void;
}

interface FakeStakeGameItem {
  id: string;
  title: string;
  category: 'Originals' | 'Slots' | 'Table Games' | 'Cases';
  url: string;
  description: string;
  thumbnail: string;
  multiplier: string;
  plays: string;
}

const FAKESTAKE_GAMES: FakeStakeGameItem[] = [
  {
    id: 'plinko-orig',
    title: 'Plinko (Original)',
    category: 'Originals',
    url: 'https://freeonlinewebtools.github.io/gamelist4.github.io/Free-Plinko-Game-Online/',
    description: 'Drop balls down the peg pyramid into high multiplier buckets. Realistic physics with big multipliers!',
    thumbnail: 'https://raw.githubusercontent.com/ubghyper/GameList.github.io/main/Free-Plinko-Game-Online/Free-Plinko-Game-Online.png',
    multiplier: 'Up to 1,000x',
    plays: '289K Plays'
  },
  {
    id: 'fs-plinko',
    title: 'FakeStake Plinko',
    category: 'Originals',
    url: 'https://fakestake.fun/plinko',
    description: 'Official FakeStake Plinko with 8-16 rows, Low/Medium/High risk levels, and 1,000x max multiplier.',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 1,000x',
    plays: '195K Plays'
  },
  {
    id: 'fs-mines',
    title: 'FakeStake Mines',
    category: 'Originals',
    url: 'https://fakestake.fun/mines',
    description: '5x5 grid Mines simulator. Uncover gems, dodge hidden explosives, and cash out anytime.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 2,475x',
    plays: '182K Plays'
  },
  {
    id: 'fs-crash',
    title: 'FakeStake Crash',
    category: 'Originals',
    url: 'https://fakestake.fun/crash',
    description: 'Watch the multiplier rocket take off. Bail out with your winnings before the rocket crashes!',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 10,000x',
    plays: '210K Plays'
  },
  {
    id: 'fs-dice',
    title: 'FakeStake Dice',
    category: 'Originals',
    url: 'https://fakestake.fun/dice',
    description: 'Set your probability and roll Over or Under on the smooth 0-100 target slider.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 990x',
    plays: '98K Plays'
  },
  {
    id: 'fs-limbo',
    title: 'FakeStake Limbo',
    category: 'Originals',
    url: 'https://fakestake.fun/limbo',
    description: 'Shoot for astronomical target multipliers up to 1,000,000x in this instant multiplier game.',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 1,000,000x',
    plays: '87K Plays'
  },
  {
    id: 'fs-roulette',
    title: 'FakeStake Roulette',
    category: 'Table Games',
    url: 'https://fakestake.fun/roulette',
    description: 'European roulette wheel. Bet on Red, Black, Green Zero, columns, and single numbers.',
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 36x',
    plays: '112K Plays'
  },
  {
    id: 'fs-blackjack',
    title: 'FakeStake Blackjack',
    category: 'Table Games',
    url: 'https://fakestake.fun/blackjack',
    description: 'Classic 21 rules! Hit, Stand, Double Down, or Split against the dealer.',
    thumbnail: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    multiplier: '3:2 Blackjack',
    plays: '135K Plays'
  },
  {
    id: 'fs-dragontower',
    title: 'FakeStake Dragon Tower',
    category: 'Originals',
    url: 'https://fakestake.fun/dragontower',
    description: 'Climb each floor of the dragon tower by choosing safe dragon eggs.',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 600x',
    plays: '74K Plays'
  },
  {
    id: 'fs-flip',
    title: 'FakeStake Coin Flip',
    category: 'Originals',
    url: 'https://fakestake.fun/flip',
    description: 'Call Heads or Tails and build winning streaks with multiplying returns.',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Streak Multiplier',
    plays: '62K Plays'
  },
  {
    id: 'fs-keno',
    title: 'FakeStake Keno',
    category: 'Originals',
    url: 'https://fakestake.fun/keno',
    description: 'Pick your lucky numbers on the board and match drawn numbers for massive payouts.',
    thumbnail: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 1,000x',
    plays: '58K Plays'
  },
  {
    id: 'fs-hilo',
    title: 'FakeStake Hilo',
    category: 'Table Games',
    url: 'https://fakestake.fun/hilo',
    description: 'Guess if the next card is higher or lower. Cash out anytime.',
    thumbnail: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Streak Multiplier',
    plays: '51K Plays'
  },
  {
    id: 'fs-wheel',
    title: 'FakeStake Wheel',
    category: 'Originals',
    url: 'https://fakestake.fun/wheel',
    description: 'Spin the segmented prize wheel with configurable risk and segments.',
    thumbnail: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 50x',
    plays: '49K Plays'
  },
  {
    id: 'fs-chicken',
    title: 'FakeStake Chicken',
    category: 'Originals',
    url: 'https://fakestake.fun/chicken',
    description: 'Dodge sizzling hazards and walk the chicken across the course.',
    thumbnail: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 1,000x',
    plays: '68K Plays'
  },
  {
    id: 'fs-cases',
    title: 'FakeStake CS2 Cases',
    category: 'Cases',
    url: 'https://fakestake.fun/cases',
    description: 'Open weapon cases and spin for rare covert knives and gloves.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Rare Special Item',
    plays: '145K Plays'
  },
  {
    id: 'fs-olympus',
    title: 'Gates of Olympus 1000',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/gates-of-olympus-1000',
    description: 'Zeus strikes with up to 1,000x winged orb multipliers and tumbling reels.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 5,000x',
    plays: '230K Plays'
  },
  {
    id: 'fs-bonanza',
    title: 'Sweet Bonanza 1000',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/sweet-bonanza-1000',
    description: 'Tumbling candy symbols with up to 1,000x rainbow sugar bomb multipliers.',
    thumbnail: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 25,000x',
    plays: '175K Plays'
  },
  {
    id: 'fs-sugar',
    title: 'Sugar Rush 1000',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/sugar-rush-1000',
    description: 'Cluster pays with multiplier spots growing up to 1,024x on every cell.',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 25,000x',
    plays: '160K Plays'
  },
  {
    id: 'fs-wanted',
    title: 'Wanted Dead or a Wild',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/wanted-dead-or-wild',
    description: 'Western showdown with VS multipliers, Dead Man\x27s Hand, and Great Train Robbery.',
    thumbnail: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 12,500x',
    plays: '198K Plays'
  },
  {
    id: 'fs-lebandit',
    title: 'Le Bandit',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/le-bandit',
    description: 'Raccoon thief collecting gold coins and pot of gold pots in 1920s Paris.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 10,000x',
    plays: '142K Plays'
  },
  {
    id: 'fs-ripcity',
    title: 'RIP City',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/rip-city',
    description: 'Cat and mouse noir comic slot with Ro$$, Maxx, wild expanding cat jaws, and huge bonus rounds.',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 12,500x',
    plays: '138K Plays'
  },
  {
    id: 'fs-chaoscrew',
    title: 'Chaos Crew 2',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/chaos-crew-2',
    description: 'Punk graffiti chaos with Cranky Cat and Sketchy Skull multipliers reaching thousands of times bet.',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 20,000x',
    plays: '154K Plays'
  },
  {
    id: 'fs-dorkunit',
    title: 'Dork Unit',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/dork-unit',
    description: 'Quirky clown show slot with gift boxes containing wild multipliers and Dork streak spins.',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 10,000x',
    plays: '119K Plays'
  },
  {
    id: 'fs-bigbass',
    title: 'Big Bass Splash',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/big-bass-splash',
    description: 'Reel in massive fish money symbols with the Fisherman wild and monster truck multipliers.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 5,000x',
    plays: '215K Plays'
  },
  {
    id: 'fs-tome',
    title: 'Tome of Madness',
    category: 'Slots',
    url: 'https://fakestake.fun/slots/tome-of-madness',
    description: 'Lovecraftian occult grid slot with cascading symbols, void portals, and the Mega Wild Cthulhu.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 2,000x',
    plays: '108K Plays'
  },
  {
    id: 'fs-baccarat',
    title: 'FakeStake Baccarat',
    category: 'Table Games',
    url: 'https://fakestake.fun/baccarat',
    description: 'Punto Banco Baccarat. Bet on Player, Banker, or Tie with authentic Macau style table cards.',
    thumbnail: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&auto=format&fit=crop&q=80',
    multiplier: '8:1 Tie Multiplier',
    plays: '83K Plays'
  },
  {
    id: 'fs-diamonds',
    title: 'FakeStake Diamonds',
    category: 'Originals',
    url: 'https://fakestake.fun/diamonds',
    description: 'Color match gems and diamonds for instant multiplier payouts up to 50x in single rolls.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    multiplier: 'Up to 50x',
    plays: '77K Plays'
  },
  {
    id: 'fs-videopoker',
    title: 'FakeStake Video Poker',
    category: 'Table Games',
    url: 'https://fakestake.fun/videopoker',
    description: 'Jacks or Better video poker. Hold cards and draw for Full Houses, Four of a Kinds, and Royal Flushes.',
    thumbnail: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80',
    multiplier: '800x Royal Flush',
    plays: '91K Plays'
  }
];

export const FakeGamblingView: React.FC<FakeGamblingViewProps> = ({
  activeTheme,
  onPlayGame
}) => {
  // Virtual Bankroll State
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('owen_fake_gambling_balance');
      return saved ? Number(saved) : 1000;
    } catch {
      return 1000;
    }
  });

  const [activeTab, setActiveTab] = useState<'all' | 'originals' | 'slots' | 'table' | 'interactive'>('all');
  const [selectedGameUrl, setSelectedGameUrl] = useState<string>('https://freeonlinewebtools.github.io/gamelist4.github.io/Free-Plinko-Game-Online/');
  const [activeGameTitle, setActiveGameTitle] = useState<string>('Plinko (Original)');
  const [refillNotification, setRefillNotification] = useState<boolean>(false);

  // Plinko Interactive Simulator State
  const [plinkoBet, setPlinkoBet] = useState<number>(10);
  const [plinkoRisk, setPlinkoRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [plinkoRows, setPlinkoRows] = useState<number>(16);
  const [recentMultipliers, setRecentMultipliers] = useState<number[]>([2, 0.2, 4, 0.2, 9, 2]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ballsRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; id: number }[]>([]);

  const accent = activeTheme?.accent || '#10b981';
  const cardBg = activeTheme?.bgCard || '#080f1d';
  const border = activeTheme?.border || 'rgba(255, 255, 255, 0.1)';

  const saveBalance = (newBal: number) => {
    setBalance(newBal);
    try {
      localStorage.setItem('owen_fake_gambling_balance', String(newBal));
    } catch {}
  };

  const handleRefillBalance = () => {
    const newBal = balance + 1000;
    saveBalance(newBal);
    setRefillNotification(true);
    setTimeout(() => setRefillNotification(false), 2000);
  };

  const handleResetBalance = () => {
    saveBalance(1000);
  };

  const handleLaunchGamePlayer = (gameItem: FakeStakeGameItem) => {
    if (!onPlayGame) return;
    const gameObj: Game = {
      id: gameItem.id,
      title: gameItem.title,
      description: gameItem.description,
      source: 'unblocked',
      category: 'Fake Gambling',
      secondaryCategory: gameItem.category,
      thumbnail: gameItem.thumbnail,
      banner: gameItem.thumbnail,
      iframeSrc: gameItem.url,
      iframeCode: `<iframe class="game-iframe" id="game-area" title="${gameItem.title}" src="${gameItem.url}" allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope" allowfullscreen=""></iframe>`,
      tags: ['FakeStake', 'Casino', 'Fake Gambling', gameItem.title, 'Unblocked'],
      rating: 5.0,
      plays: 180000,
      featured: true,
      mirrors: [gameItem.url]
    };
    onPlayGame(gameObj);
  };

  // Plinko Multipliers config
  const getMultipliers = (rows: number, risk: 'low' | 'medium' | 'high') => {
    if (rows === 16) {
      if (risk === 'high') {
        return [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
      } else if (risk === 'medium') {
        return [110, 41, 10, 5, 3, 1.5, 1, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
      } else {
        return [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16];
      }
    } else {
      if (risk === 'high') {
        return [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29];
      } else if (risk === 'medium') {
        return [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];
      } else {
        return [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6];
      }
    }
  };

  // Canvas Plinko animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Pegboard setup
      const rows = plinkoRows;
      const startY = 40;
      const bottomY = height - 55;
      const rowSpacing = (bottomY - startY) / rows;
      const pegs: { x: number; y: number; r: number }[] = [];

      for (let r = 0; r < rows; r++) {
        const count = r + 3;
        const spacing = (width - 40) / (rows + 3);
        const startX = (width - (count - 1) * spacing) / 2;
        const y = startY + r * rowSpacing;

        for (let c = 0; c < count; c++) {
          const x = startX + c * spacing;
          pegs.push({ x, y, r: 3.5 });

          // Draw peg with neon glow
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#94a3b8';
          ctx.shadowColor = accent;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Multiplier buckets at bottom
      const multipliers = getMultipliers(rows, plinkoRisk);
      const bucketCount = multipliers.length;
      const bucketWidth = (width - 20) / bucketCount;

      for (let i = 0; i < bucketCount; i++) {
        const mult = multipliers[i];
        const bx = 10 + i * bucketWidth;
        const by = height - 40;

        let bucketColor = '#10b981'; // Green
        if (mult >= 100) bucketColor = '#ef4444'; // Red for 100x+
        else if (mult >= 10) bucketColor = '#f59e0b'; // Amber for 10x+
        else if (mult >= 2) bucketColor = '#06b6d4'; // Cyan
        else if (mult < 1) bucketColor = '#64748b'; // Slate

        ctx.fillStyle = bucketColor;
        ctx.beginPath();
        ctx.roundRect(bx + 1, by, bucketWidth - 2, 28, 6);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mult}x`, bx + bucketWidth / 2, by + 14);
      }

      // Physics & Ball rendering
      const gravity = 0.22;
      const bounce = 0.55;

      ballsRef.current.forEach((ball, bIdx) => {
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Collision with pegs
        pegs.forEach(peg => {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ball.radius + peg.r) {
            // Deflect ball with random jitter
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) * bounce;
            const spread = (Math.random() - 0.5) * 0.4;
            ball.vx = Math.cos(angle + spread) * (speed + 0.5);
            ball.vy = Math.abs(Math.sin(angle) * speed) + 0.2;
            ball.x = peg.x + Math.cos(angle) * (ball.radius + peg.r + 0.5);
            ball.y = peg.y + Math.sin(angle) * (ball.radius + peg.r + 0.5);
          }
        });

        // Walls bounce
        if (ball.x - ball.radius < 10) {
          ball.x = 10 + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.6;
        } else if (ball.x + ball.radius > width - 10) {
          ball.x = width - 10 - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.6;
        }

        // Draw ball with bright glow
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Check if ball landed in bucket
        if (ball.y >= height - 45) {
          const clampedX = Math.max(10, Math.min(width - 10, ball.x));
          const bucketIndex = Math.min(
            bucketCount - 1,
            Math.max(0, Math.floor((clampedX - 10) / bucketWidth))
          );
          const hitMult = multipliers[bucketIndex] || 1;
          const winnings = Math.round(plinkoBet * hitMult * 100) / 100;

          // Award virtual balance
          setBalance(prev => {
            const next = Math.round((prev + winnings) * 100) / 100;
            try { localStorage.setItem('owen_fake_gambling_balance', String(next)); } catch {}
            return next;
          });

          setRecentMultipliers(prev => [hitMult, ...prev.slice(0, 7)]);
          ballsRef.current.splice(bIdx, 1);
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [plinkoRows, plinkoRisk, plinkoBet]);

  const dropBall = (count = 1) => {
    if (balance < plinkoBet * count) {
      handleRefillBalance();
      return;
    }

    // Deduct bet
    saveBalance(Math.max(0, balance - plinkoBet * count));

    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 440;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offset = (Math.random() - 0.5) * 12;
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        ballsRef.current.push({
          x: width / 2 + offset,
          y: 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: Math.random() * 0.8 + 0.5,
          radius: 5.5,
          color: chosenColor,
          id: Date.now() + Math.random()
        });
      }, i * 140);
    }
  };

  const filteredGames = FAKESTAKE_GAMES.filter(g => {
    if (activeTab === 'all') return true;
    if (activeTab === 'originals') return g.category === 'Originals';
    if (activeTab === 'slots') return g.category === 'Slots';
    if (activeTab === 'table') return g.category === 'Table Games';
    if (activeTab === 'interactive') return g.id.includes('plinko');
    return true;
  });

  return (
    <div 
      className="flex-1 flex flex-col min-h-screen text-slate-100 p-4 md:p-6 lg:p-8"
      style={{ backgroundColor: activeTheme?.bgPrimary || '#020810' }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">

        {/* Top Header & Virtual Bankroll Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl border shadow-2xl relative overflow-hidden"
          style={{
            backgroundColor: cardBg,
            borderColor: border
          }}
        >
          <div className="flex flex-col gap-1.5 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                style={{
                  backgroundColor: activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)',
                  borderColor: accent,
                  color: accent
                }}
              >
                <span>🎰</span>
                <span>FakeStake.fun Casino & Simulator</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                100% Free Virtual Currency
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono">
                No Real Money Involved
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Fake Gambling & Stake Originals
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Play authentic Plinko, Mines, Crash, Dice, and high-multiplier Pragmatic slots with replenishable fake cash. Listen to real MP3 music uninterrupted while you play!
            </p>
          </div>

          {/* Virtual Wallet Box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto z-10">
            <div 
              className="p-3.5 px-5 rounded-2xl border flex items-center gap-3 w-full sm:w-auto shadow-inner"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: accent
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
                style={{ backgroundColor: accent, color: '#000000' }}
              >
                $
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Virtual Balance
                </span>
                <span className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefillBalance}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl font-black text-xs text-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                style={{ backgroundColor: accent }}
                title="Claim $1,000 free virtual cash"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>+ $1,000 Cash</span>
              </button>

              <button
                onClick={handleResetBalance}
                className="p-3 rounded-2xl border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset Bankroll to $1,000"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Refill toast */}
          {refillNotification && (
            <div className="absolute top-3 right-4 px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl animate-bounce">
              +$1,000.00 Fake Cash Added!
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between border-b pb-4 gap-4 flex-wrap" style={{ borderColor: border }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Games', icon: '🎰' },
              { id: 'interactive', label: 'Interactive Plinko', icon: '⚡' },
              { id: 'originals', label: 'FakeStake Originals', icon: '💎' },
              { id: 'slots', label: 'Pragmatic Slots', icon: '🍒' },
              { id: 'table', label: 'Table Games', icon: '🃏' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-black shadow-lg font-extrabold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? accent : cardBg,
                  borderColor: activeTab === tab.id ? accent : border
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              {filteredGames.length} FakeStake Games
            </span>
          </div>
        </div>

        {/* Feature 1: Built-in Interactive Plinko Simulator */}
        {(activeTab === 'all' || activeTab === 'interactive') && (
          <div 
            className="p-6 md:p-8 rounded-3xl border shadow-2xl flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden"
            style={{
              backgroundColor: cardBg,
              borderColor: border
            }}
          >
            {/* Plinko Board Canvas */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden bg-[#040814] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                width={420}
                height={520}
                className="w-full h-full object-contain select-none"
              />
              {/* Overlay quick stats */}
              <div className="absolute top-3 left-4 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 font-bold">
                  Physics Engine: Active
                </span>
              </div>
            </div>

            {/* Plinko Controls Dashboard */}
            <div className="flex-1 w-full flex flex-col gap-5">
              <div className="flex items-center justify-between border-b pb-3 border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
                    <h3 className="text-2xl font-black text-white">Interactive Plinko Board</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Realistic gravity & peg bouncing. Pick bet, drop balls, and hit big multipliers!
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-slate-400">Recent:</span>
                  <div className="flex items-center gap-1">
                    {recentMultipliers.slice(0, 4).map((m, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: m >= 10 ? '#ef444430' : m >= 2 ? '#10b98130' : '#64748b30',
                          color: m >= 10 ? '#f87171' : m >= 2 ? '#34d399' : '#94a3b8'
                        }}
                      >
                        {m}x
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bet Amount Controls */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                  <span>Bet Amount (Virtual $)</span>
                  <span className="text-emerald-400">${plinkoBet}.00</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                    <input 
                      type="number"
                      min={1}
                      max={1000}
                      value={plinkoBet}
                      onChange={(e) => setPlinkoBet(Math.max(1, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border bg-black/40 text-xs font-mono text-white focus:outline-none"
                      style={{ borderColor: border }}
                    />
                  </div>
                  <button 
                    onClick={() => setPlinkoBet(b => Math.max(1, Math.floor(b / 2)))}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 border border-white/5 cursor-pointer"
                  >
                    1/2
                  </button>
                  <button 
                    onClick={() => setPlinkoBet(b => Math.min(1000, b * 2))}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 border border-white/5 cursor-pointer"
                  >
                    2x
                  </button>
                  <button 
                    onClick={() => setPlinkoBet(100)}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 border border-white/5 cursor-pointer"
                  >
                    $100
                  </button>
                </div>
              </div>

              {/* Risk Level Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-300 font-bold">Risk Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setPlinkoRisk(r)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        plinkoRisk === r 
                          ? 'text-black shadow-md font-extrabold' 
                          : 'text-slate-400 hover:text-white bg-white/5 border-white/5'
                      }`}
                      style={{
                        backgroundColor: plinkoRisk === r ? accent : undefined,
                        borderColor: plinkoRisk === r ? accent : undefined
                      }}
                    >
                      {r} Risk
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                  <span>Pyramid Rows</span>
                  <span className="text-cyan-400">{plinkoRows} Rows</span>
                </label>
                <div className="flex items-center gap-2">
                  {[8, 10, 12, 14, 16].map(rw => (
                    <button
                      key={rw}
                      onClick={() => setPlinkoRows(rw)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        plinkoRows === rw 
                          ? 'text-white border-cyan-400 bg-cyan-500/20' 
                          : 'text-slate-400 hover:text-white bg-white/5 border-white/5'
                      }`}
                    >
                      {rw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => dropBall(1)}
                  className="flex-1 py-4 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 shadow-2xl transition-all cursor-pointer hover:scale-105"
                  style={{ backgroundColor: accent }}
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                  <span>Drop Ball (${plinkoBet})</span>
                </button>

                <button
                  onClick={() => dropBall(5)}
                  className="px-5 py-4 rounded-2xl border text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-white/10 transition-all cursor-pointer"
                  style={{ borderColor: accent, color: accent }}
                  title="Drop 5 balls simultaneously"
                >
                  <Flame className="w-4 h-4" />
                  <span>Drop 5x</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature 2: Active Embedded Player / Stage */}
        <div 
          className="rounded-3xl border overflow-hidden shadow-2xl flex flex-col"
          style={{ backgroundColor: cardBg, borderColor: border }}
        >
          <div 
            className="h-12 px-4 flex items-center justify-between border-b text-xs text-slate-300"
            style={{ backgroundColor: activeTheme?.bgHeader || '#040a14', borderColor: border }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
              <span className="font-extrabold text-white text-sm">{activeGameTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Simulator
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onPlayGame && (
                <button
                  onClick={() => {
                    const found = FAKESTAKE_GAMES.find(g => g.url === selectedGameUrl) || {
                      id: 'custom-gambling-' + Date.now(),
                      title: activeGameTitle,
                      category: 'Originals' as const,
                      url: selectedGameUrl,
                      description: 'Live Fake Gambling Game with in-game background music controls.',
                      thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
                      multiplier: 'Up to 1000x',
                      plays: '100K'
                    };
                    handleLaunchGamePlayer(found);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
                  style={{ backgroundColor: accent }}
                  title="Play in dedicated Game Player with in-game music controls"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Game Player</span>
                </button>
              )}

              <a
                href={selectedGameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 border border-white/10 transition-colors"
              >
                <span>Direct Window</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="w-full aspect-video min-h-[500px] md:min-h-[640px] bg-black relative">
            <iframe
              src={selectedGameUrl}
              title={activeGameTitle}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; focus-without-user-activation *; gamepad; keyboard-map *; accelerometer; gyroscope"
              allowFullScreen
            />
          </div>
        </div>

        {/* Feature 3: Full FakeStake.fun Game Carousel & Catalog */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>All FakeStake.fun Games Catalog</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Click any game card to launch immediately in the simulator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => {
              const isSelected = selectedGameUrl === game.url;
              return (
                <div
                  key={game.id}
                  onClick={() => {
                    setSelectedGameUrl(game.url);
                    setActiveGameTitle(game.title);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col gap-3 group hover:scale-[1.02] shadow-xl ${
                    isSelected ? 'shadow-2xl' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? activeTheme?.accentBadge || 'rgba(16, 185, 129, 0.15)' : cardBg,
                    borderColor: isSelected ? accent : border
                  }}
                >
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 border border-white/5">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-2xl font-bold hover:scale-110 transition-transform"
                        style={{ backgroundColor: accent }}
                      >
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-emerald-400 font-bold border border-white/10">
                      {game.multiplier}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {game.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {game.plays}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGameUrl(game.url);
                          setActiveGameTitle(game.title);
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                        style={{ backgroundColor: accent }}
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Play Live</span>
                      </button>

                      {onPlayGame && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchGamePlayer(game);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1 transition-all cursor-pointer border border-white/10"
                          title="Open in dedicated game player with in-game music controls"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
