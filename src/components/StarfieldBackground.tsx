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
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  speedMultiplier = 1,
  densityMultiplier = 1,
  shootingStarsEnabled = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
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

    // Star color palette (deep space with neon watermelon accents)
    const starColors = [
      '#ffffff', // Crisp pure white
      '#e2e8f0', // Cool starlight
      '#a7f3d0', // Emerald mint glow
      '#6ee7b7', // Vibrant watermelon green
      '#bae6fd', // Soft cosmic cyan
      '#fecdd3', // Soft starlight pink
      '#fef08a'  // Subtle warm gold
    ];

    let stars: Star[] = [];
    const baseCount = Math.floor((width * height) / 7500);
    const starCount = Math.max(60, Math.min(300, Math.floor(baseCount * densityMultiplier)));

    function initStars() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const radius = Math.random() < 0.8 ? Math.random() * 1.2 + 0.5 : Math.random() * 1.8 + 1.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha: Math.random() * 0.6 + 0.3,
          twinkleSpeed: Math.random() * 0.04 + 0.015,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.15 * speedMultiplier,
          vy: -(Math.random() * 0.25 + 0.05) * speedMultiplier, // gentle upward drift
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }
    }

    initStars();

    // Shooting stars state
    let shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + Math.random() * 3000 + 2000;

    const maybeSpawnShootingStar = (now: number) => {
      if (!shootingStarsEnabled) return;
      if (now >= nextShootingStarTime && shootingStars.length < 3) {
        const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // ~45 degrees diagonal
        shootingStars.push({
          x: Math.random() * (width * 0.8),
          y: Math.random() * (height * 0.4),
          length: Math.random() * 100 + 80,
          speed: Math.random() * 7 + 8 * speedMultiplier,
          angle,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          color: Math.random() < 0.6 ? '#6ee7b7' : '#ffffff'
        });
        nextShootingStarTime = now + Math.random() * 6000 + 4000;
      }
    };

    // Animation Loop
    let lastTime = performance.now();
    const render = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render cosmic background stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Twinkle calculation
        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = Math.max(0.1, Math.min(1, s.baseAlpha + Math.sin(s.twinklePhase) * 0.4));

        // Drift
        s.x += s.vx;
        s.y += s.vy;

        // Wrap around borders
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Draw star
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = s.radius > 1.4 ? 6 : 0;
        ctx.fill();
      }

      // Render shooting stars / meteors
      maybeSpawnShootingStar(Date.now());

      for (let j = shootingStars.length - 1; j >= 0; j--) {
        const ss = shootingStars[j];

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, ss.color);
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.globalAlpha = Math.max(0, ss.alpha);
        ctx.shadowColor = ss.color;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Star head spark
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.max(0, ss.alpha);
        ctx.fill();

        // Advance shooting star
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= ss.decay;

        if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          shootingStars.splice(j, 1);
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [speedMultiplier, densityMultiplier, shootingStarsEnabled]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep cosmic ambient gradient nebulae */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#10b981]/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#ff2d55]/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-[#059669]/[0.03] blur-[140px] pointer-events-none" />

      {/* Canvas rendering stars */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
