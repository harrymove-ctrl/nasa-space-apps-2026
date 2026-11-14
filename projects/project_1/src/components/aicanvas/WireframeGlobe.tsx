import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const N_LATS = 42;
const N_STEPS = 240;
const WAVE_PHI = 0.28;
const WAVE_FREQ_T = 2.0;
const WAVE_FREQ_P = 1.8;
const WAVE_SPEED_IDLE = 0.003;
const WAVE_SPEED_HOVER = 0.012;
const ROT_SPEED_IDLE = 0.003;
const ROT_SPEED_HOVER = 0.012;
const BACK_A = 0.06;
const ALPHA_MIN = 0.14;
const ALPHA_MAX = 0.48;
const LW_MIN = 0.4;
const LW_MAX = 1.05;
const BAND_SIGMA = 0.35;
const BAND_FREQ = 2.5;
const HOVER_RADIUS = 90;
const HOVER_AMP = 0.45;
const TWO_PI = Math.PI * 2;

export function WireframeGlobe({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  useEffect(() => {
    const syncTheme = () => {
      const next = document.documentElement.classList.contains('dark');
      isDarkRef.current = next;
      setIsDark(next);
    };
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return () => observer.disconnect();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return () => observer.disconnect();
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cw = container.clientWidth || 320;
    let ch = container.clientHeight || 320;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      cw = container.clientWidth || 320;
      ch = container.clientHeight || 320;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(cw * dpr));
      canvas.height = Math.max(1, Math.floor(ch * dpr));
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const xs = new Float32Array(N_STEPS + 1);
    const ys = new Float32Array(N_STEPS + 1);
    let t = 0;
    let rot = 0.35;
    let hoverStr = 0;
    let alive = true;
    let rafId = 0;

    const draw = () => {
      if (!alive) return;
      const mouse = mouseRef.current;
      const hasHover = mouse !== null;
      hoverStr += ((hasHover ? 1 : 0) - hoverStr) * (hasHover ? 0.03 : 0.015);
      if (!reduceMotion) {
        t += WAVE_SPEED_IDLE + hoverStr * (WAVE_SPEED_HOVER - WAVE_SPEED_IDLE);
        rot += ROT_SPEED_IDLE + hoverStr * (ROT_SPEED_HOVER - ROT_SPEED_IDLE);
      }

      const bandCenter = Math.sin(t * BAND_FREQ) * (Math.PI * 0.4);
      const dotRGB = isDarkRef.current ? '241,237,228' : '14,20,30';
      const R = Math.min(cw, ch) * 0.43;
      const cx = cw / 2;
      const cy = ch / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, TWO_PI);
      ctx.clip();

      for (let i = 0; i < N_LATS; i += 1) {
        const phi = -Math.PI / 2 + ((i + 1) * Math.PI) / (N_LATS + 1);
        const depth = Math.cos(phi);
        const lineA = ALPHA_MIN + depth * (ALPHA_MAX - ALPHA_MIN);
        const lw = LW_MIN + depth * (LW_MAX - LW_MIN);
        const dist = phi - bandCenter;
        const autoEnv = Math.exp(-(dist * dist) / (2 * BAND_SIGMA * BAND_SIGMA));
        const autoAmp = WAVE_PHI * autoEnv;

        for (let j = 0; j <= N_STEPS; j += 1) {
          const theta = (j * TWO_PI) / N_STEPS;
          const tR = theta + rot;
          const autoDPhi =
            autoAmp *
            (Math.sin(tR * WAVE_FREQ_T + phi * WAVE_FREQ_P + t) +
              0.45 * Math.sin(tR * WAVE_FREQ_T * 1.7 + phi * WAVE_FREQ_P * 1.3 + t * 1.4));

          let localDPhi = 0;
          if (mouse && hoverStr > 0.01) {
            const sx = cx + R * Math.cos(phi) * Math.cos(tR);
            const sy = cy - R * Math.sin(phi);
            const dx = sx - mouse.x;
            const dy = sy - mouse.y;
            const localEnv = Math.exp(-(dx * dx + dy * dy) / (HOVER_RADIUS * HOVER_RADIUS));
            localDPhi =
              HOVER_AMP * localEnv * hoverStr * Math.sin(tR * 3 + phi * 2 + t * 6);
          }

          const phiD = phi + autoDPhi + localDPhi;
          xs[j] = cx + R * Math.cos(phiD) * Math.cos(tR);
          ys[j] = cy - R * Math.sin(phiD);
        }

        ctx.strokeStyle = `rgba(${dotRGB},${BACK_A})`;
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        const midX0 = (xs[N_STEPS - 1] + xs[0]) * 0.5;
        const midY0 = (ys[N_STEPS - 1] + ys[0]) * 0.5;
        ctx.moveTo(midX0, midY0);
        for (let j = 0; j < N_STEPS; j += 1) {
          const next = (j + 1) % N_STEPS;
          ctx.quadraticCurveTo(xs[j], ys[j], (xs[j] + xs[next]) * 0.5, (ys[j] + ys[next]) * 0.5);
        }
        ctx.closePath();
        ctx.stroke();

        let startJ = 0;
        for (let j = 0; j < N_STEPS; j += 1) {
          if (Math.sin((j * TWO_PI) / N_STEPS + rot) < 0) {
            startJ = j;
            break;
          }
        }

        ctx.strokeStyle = `rgba(${dotRGB},${lineA.toFixed(3)})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        let inFront = false;
        let prevX = 0;
        let prevY = 0;
        for (let jj = 0; jj <= N_STEPS; jj += 1) {
          const j = (startJ + jj) % N_STEPS;
          const x = xs[j];
          const y = ys[j];
          const isFront = Math.sin((j * TWO_PI) / N_STEPS + rot) >= 0;
          if (isFront) {
            if (!inFront) {
              ctx.moveTo(x, y);
              inFront = true;
            } else {
              ctx.quadraticCurveTo(prevX, prevY, (prevX + x) * 0.5, (prevY + y) * 0.5);
            }
          } else if (inFront) {
            ctx.lineTo(prevX, prevY);
            inFront = false;
          }
          prevX = x;
          prevY = y;
        }
        if (inFront) ctx.lineTo(prevX, prevY);
        ctx.stroke();
      }

      ctx.restore();
      if (!reduceMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      alive = false;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-diagram="wireframe-globe"
      aria-hidden="true"
      className={cn('relative h-full w-full overflow-hidden', className)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }}
      onMouseLeave={() => {
        mouseRef.current = null;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export default WireframeGlobe;
