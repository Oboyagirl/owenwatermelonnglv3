import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  decay: number;
  color: string;
}

interface StarfieldBackgroundProps {
  speedMultiplier?: number;
  densityMultiplier?: number;
  shootingStarsEnabled?: boolean;
  starColors?: string[];
  paused?: boolean;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  speedMultiplier = 1,
  densityMultiplier = 1,
  shootingStarsEnabled = true,
  starColors: customStarColors,
  paused = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (paused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener('resize', handleResize);

    // Star color palette (supports custom theme star colors)
    const defaultStarColors = [
      '#ffffff',
      '#e2e8f0',
      '#a7f3d0',
      '#6ee7b7',
      '#bae6fd'
    ];
    const starColors = (customStarColors && customStarColors.length > 0) ? customStarColors : defaultStarColors;

    let stars: Star[] = [];
    // Lightweight count: 40-75 stars max (anti-bloat, ultra smooth on Chromebooks)
    const starCount = Math.max(35, Math.min(80, Math.floor(50 * densityMultiplier)));

    function initStars() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() < 0.85 ? 0.9 : 1.4,
          baseAlpha: Math.random() * 0.5 + 0.25,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.1 * speedMultiplier,
          vy: -(Math.random() * 0.15 + 0.05) * speedMultiplier,
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }
    }

    initStars();

    let shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + Math.random() * 5000 + 4000;

    const maybeSpawnShootingStar = (now: number) => {
      if (!shootingStarsEnabled) return;
      if (now >= nextShootingStarTime && shootingStars.length < 2) {
        const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2;
        shootingStars.push({
          x: Math.random() * (width * 0.8),
          y: Math.random() * (height * 0.3),
          length: Math.random() * 60 + 50,
          speed: Math.random() * 5 + 6 * speedMultiplier,
          angle,
          alpha: 0.9,
          decay: Math.random() * 0.025 + 0.02,
          color: Math.random() < 0.6 ? '#6ee7b7' : '#ffffff'
        });
        nextShootingStarTime = now + Math.random() * 8000 + 6000;
      }
    };

    // Animation Loop
    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render crisp stars without expensive shadowBlur
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = Math.max(0.15, Math.min(0.9, s.baseAlpha + Math.sin(s.twinklePhase) * 0.35));

        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      }

      // Render shooting stars
      maybeSpawnShootingStar(Date.now());

      for (let j = shootingStars.length - 1; j >= 0; j--) {
        const ss = shootingStars[j];

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = ss.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = ss.alpha;
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= ss.decay;

        if (ss.alpha <= 0 || ss.x > width + 50 || ss.y > height + 50) {
          shootingStars.splice(j, 1);
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [speedMultiplier, densityMultiplier, shootingStarsEnabled, paused]);

  if (paused) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
