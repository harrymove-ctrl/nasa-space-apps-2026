import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Radio } from 'lucide-react';
import SmearTypeCard from '@/components/smear-type/card';
import { CornerMarkers } from '@/components/CornerFrame';

interface PreloaderOverlayProps {
  holdMode: boolean;
  onComplete: () => void;
}

const PRELOADER_DURATION_MS = 2650;
const PRELOADER_LINES = ['TERRASPAN', 'ORBIT TO GRID'] as const;

export function PreloaderOverlay({ holdMode, onComplete }: PreloaderOverlayProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(holdMode ? 68 : 4);
  const finishedRef = useRef(false);

  const beginExit = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    setClosing(true);

    const el = backdropRef.current;
    if (el) {
      await new Promise((r) => setTimeout(r, 20));
      const animations = el.getAnimations?.() ?? [];
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => setTimeout(r, 460)),
        ]);
      } else {
        await new Promise((r) => setTimeout(r, 320));
      }
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        void beginExit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [beginExit]);

  useEffect(() => {
    if (holdMode) {
      setProgress(68);
      return;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const totalMs = reducedMotion ? 650 : PRELOADER_DURATION_MS;
    const start = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const ratio = Math.min(1, (now - start) / totalMs);
      const eased = 1 - Math.pow(1 - ratio, 2.2);
      setProgress(Math.round(eased * 100));
      if (ratio < 1) {
        raf = requestAnimationFrame(step);
      } else {
        void beginExit();
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [holdMode, beginExit]);

  return (
    <div
      ref={backdropRef}
      data-slot="preloader"
      data-closing={closing ? '' : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="TerraSpan mission preloader"
      className="preloader-backdrop fixed inset-0 z-50 flex flex-col items-center justify-center px-4 py-6"
      style={{ backgroundColor: '#0c1317', color: '#f4f5f7' }}
    >
      <div className="w-full max-w-[460px] flex flex-col gap-5 items-center">
        <div className="flex w-full items-center justify-between text-xs font-mono-tech tracking-wider uppercase text-[color:var(--at-text-muted)]">
          <span className="inline-flex items-center gap-2 text-[#5eead4]">
            <Radio className="size-3.5" aria-hidden="true" />
            NASA Space Apps 2026
          </span>
          <span>Smear-Type WebGL Boot</span>
        </div>

        {/* Fixed 1/1 box required by smear-type workflow so canvas never shifts */}
        <div
          className="relative w-full aspect-square max-w-[420px] rounded-[var(--andromeda-radius-frame)] border border-[color:var(--at-border-base)] overflow-visible"
          style={{ backgroundColor: '#0c1317' }}
        >
          <CornerMarkers size={22} offset={-7} />
          <div className="size-full overflow-hidden rounded-[var(--andromeda-radius-frame)]">
            <SmearTypeCard lines={PRELOADER_LINES} />
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-[color:var(--at-text-secondary)]">
              Calibrating MODIS C6.1 + VIIRS J1/J2 footprints
            </span>
            <span className="text-[#5eead4] tabular-nums font-medium">{progress}%</span>
          </div>

          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'oklch(0.227 0.002 286.2)' }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full transition-[width] duration-75"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2ba6b5, #ff6a2b)',
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono-tech text-[color:var(--at-text-faint)]">
              Zero-Login Public Access · H3 Harmonization
            </span>
            <button
              type="button"
              onClick={() => void beginExit()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--andromeda-radius-frame)] border border-[color:var(--at-border-base)] bg-[color:var(--at-surface-raised)] text-[color:var(--at-text-primary)] hover:border-[color:var(--at-action-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--at-focus-ring)] cursor-pointer"
            >
              Skip intro [Esc]
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
