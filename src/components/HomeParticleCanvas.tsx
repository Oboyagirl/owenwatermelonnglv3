import React, { useEffect, useRef } from 'react';

interface HomeParticleCanvasProps {
  accent?: string;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  tintMix: number;
}

function parseColorToRgb(color?: string): RgbColor {
  const fallback: RgbColor = { r: 16, g: 185, b: 129 };
  if (!color) return fallback;
  const trimmed = color.trim();

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b };
      }
    } else if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b };
      }
    }
  }

  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, Number(rgbMatch[1]))),
      g: Math.min(255, Math.max(0, Number(rgbMatch[2]))),
      b: Math.min(255, Math.max(0, Number(rgbMatch[3])))
    };
  }

  return fallback;
}

export const HomeParticleCanvas: React.FC<HomeParticleCanvasProps> = ({ accent }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const accentRgbRef = useRef<RgbColor>(parseColorToRgb(accent));

  useEffect(() => {
    accentRgbRef.current = parseColorToRgb(accent);
  }, [accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let rafId: number | null = null;
    let lastTime = performance.now();

    const pointer = {
      x: -9999,
      y: -9999,
      active: false
    };

    const createParticles = (w: number, h: number): Particle[] => {
      const area = Math.max(1, w * h);
      const count = Math.min(42, Math.max(20, Math.round(area / 38000)));
      const list: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.08 + Math.random() * 0.22;
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.04,
          radius: 1.0 + Math.random() * 1.6,
          baseAlpha: 0.12 + Math.random() * 0.18,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.008 + Math.random() * 0.014,
          tintMix: Math.random() * 0.45
        });
      }
      return list;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
      const nextW = Math.max(1, Math.floor(rect.width));
      const nextH = Math.max(1, Math.floor(rect.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);

      if (nextW === width && nextH === height && nextDpr === dpr) return;

      const prevW = width;
      const prevH = height;
      width = nextW;
      height = nextH;
      dpr = nextDpr;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        particles = createParticles(width, height);
      } else if (prevW > 0 && prevH > 0) {
        const scaleX = width / prevW;
        const scaleY = height / prevH;
        for (const p of particles) {
          p.x *= scaleX;
          p.y *= scaleY;
        }
      }
    };

    const drawFrame = (dtScale: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const { r, g, b } = accentRgbRef.current;
      const linkDist = 118;
      const linkDistSq = linkDist * linkDist;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (animate) {
          p.phase += p.phaseSpeed * dtScale;
          p.x += (p.vx + Math.sin(p.phase) * 0.06) * dtScale;
          p.y += (p.vy + Math.cos(p.phase * 0.85) * 0.05) * dtScale;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const dSq = dx * dx + dy * dy;
            if (dSq > 1 && dSq < 18000) {
              const dist = Math.sqrt(dSq);
              const force = ((134 - dist) / 134) * 0.035 * dtScale;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          if (p.x < -16) p.x = width + 16;
          else if (p.x > width + 16) p.x = -16;
          if (p.y < -16) p.y = height + 16;
          else if (p.y > height + 16) p.y = -16;
        }
      }

      // Faint proximity connections
      ctx.lineWidth = 0.85;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const bPart = particles[j];
          const dx = a.x - bPart.x;
          const dy = a.y - bPart.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < linkDistSq) {
            const alpha = (1 - Math.sqrt(dSq) / linkDist) * 0.065;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(4)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(bPart.x, bPart.y);
            ctx.stroke();
          }
        }
      }

      // Soft ambient motes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const shimmer = 0.72 + 0.28 * Math.sin(p.phase * 1.4);
        const alpha = p.baseAlpha * shimmer;
        const pr = Math.round(r + (226 - r) * p.tintMix);
        const pg = Math.round(g + (232 - g) * p.tintMix);
        const pb = Math.round(b + (240 - b) * p.tintMix);

        const glowRadius = p.radius * 4.2;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${(alpha * 0.65).toFixed(4)})`);
        grad.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha.toFixed(4)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const tick = (now: number) => {
      const elapsed = Math.min(48, Math.max(4, now - lastTime));
      lastTime = now;
      drawFrame(elapsed / 16.667, true);
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      stopLoop();
      if (document.hidden) return;
      if (reduceMotion) {
        drawFrame(1, false);
        return;
      }
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
      startLoop();
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    resize();
    startLoop();

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize();
            if (reduceMotion) drawFrame(1, false);
          })
        : null;

    if (observer && canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    const handleWindowResize = () => {
      resize();
      if (reduceMotion) drawFrame(1, false);
    };

    window.addEventListener('resize', handleWindowResize, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      stopLoop();
      observer?.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
