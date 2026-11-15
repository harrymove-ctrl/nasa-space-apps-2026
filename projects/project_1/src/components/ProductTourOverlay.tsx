import { MotionConfig } from 'motion/react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Compass, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';

type TourView = 'landing' | 'map' | 'game';

interface TourStep {
  title: string;
  target: string;
  detail: string;
  view: TourView;
  sectionHash?: string;
}

const TOUR_STEPS: readonly TourStep[] = [
  {
    title: 'Step 1 of 5: 4-Stage Orbital Pipeline',
    target: '#how-it-works',
    detail:
      'Review how MODIS C6.1, VIIRS 375 m, NASA POWER, ASF SAR, and GOES-18 flow from raw ingestion into IEEE 738 line limits and training drills.',
    view: 'landing',
    sectionHash: '#how-it-works',
  },
  {
    title: 'Step 2 of 5: Calibrated Orbital Survey Plates',
    target: '#gallery',
    detail:
      'Drag horizontally or focus any plate and press Left or Right keys to inspect Earthrise, transmission SAR contours, GOES-18 flare, and OSDR plates.',
    view: 'landing',
    sectionHash: '#gallery',
  },
  {
    title: 'Step 3 of 5: 2000 to 2026 Burning Calendar & IEEE 738',
    target: '#telemetry',
    detail:
      'Switch corridors in the dock and toggle H3 Harmonized vs Naive Merged sensor modes to inspect the 2012 VIIRS launch artifact and ampacity drop.',
    view: 'landing',
    sectionHash: '#telemetry',
  },
  {
    title: 'Step 4 of 5: Five-Layer NASA Data Fusion Map',
    target: '?view=map',
    detail:
      'Step across all five live NASA and NOAA layers inside the centered workstation to verify endpoints, physics equations, and record integrity.',
    view: 'map',
  },
  {
    title: 'Step 5 of 5: 3-Wave Operator Triage & CradleFlow',
    target: '?view=game',
    detail:
      'Clear Phase 01 corridor and GOES-18 triage, then escalate live orbital telemetry directly into Phase 02 CradleFlow shelter automation in-app.',
    view: 'game',
  },
];

interface ProductTourOverlayProps {
  open: boolean;
  onClose: () => void;
  onSwitchView: (nextView: TourView) => void;
  onNavigateSection: (hash: string) => void;
  onOpenCradleFlow: () => void;
}

export function ProductTourOverlay({
  open,
  onClose,
  onSwitchView,
  onNavigateSection,
  onOpenCradleFlow,
}: ProductTourOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const activateStep = (index: number) => {
    const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
    setStepIndex(clamped);
    const step = TOUR_STEPS[clamped];
    if (step.view === 'landing' && step.sectionHash) {
      onNavigateSection(step.sectionHash);
    } else {
      onSwitchView(step.view);
    }
  };

  useEffect(() => {
    if (!open) return;
    setCollapsed(false);
    activateStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('.obsidian-parallax-slider__viewport'))
      ) {
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setStepIndex((prev) => {
          const next = Math.min(TOUR_STEPS.length - 1, prev + 1);
          const step = TOUR_STEPS[next];
          if (step.view === 'landing' && step.sectionHash) {
            onNavigateSection(step.sectionHash);
          } else {
            onSwitchView(step.view);
          }
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        setStepIndex((prev) => {
          const next = Math.max(0, prev - 1);
          const step = TOUR_STEPS[next];
          if (step.view === 'landing' && step.sectionHash) {
            onNavigateSection(step.sectionHash);
          } else {
            onSwitchView(step.view);
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, onNavigateSection, onSwitchView]);

  if (!open) return null;

  const current = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  return (
    <aside
      data-testid="product-tour-card"
      aria-label="Interactive Product Tour"
      className="fixed bottom-3 right-3 z-40 w-[min(92vw,24rem)]"
    >
      <MotionConfig reducedMotion="always">
        <Graph
          title={`GUIDED TOUR · ${current.target}`}
          className="mdxcn-surface-card shadow-2xl"
        >
          <GraphBody className="px-4 py-4 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--graph-accent)]">
                  <Compass className="size-3.5" aria-hidden="true" />
                  <span>Interactive Walkthrough</span>
                </div>
                <h3 className="mt-0.5 font-sans text-sm font-semibold text-[var(--at-text-primary)]">
                  {current.title}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => !c)}
                  aria-label={collapsed ? 'Expand guided tour' : 'Minimize guided tour'}
                  className="inline-flex size-7 cursor-pointer items-center justify-center border border-[var(--at-border-subtle)] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)] hover:text-[var(--at-text-primary)]"
                >
                  {collapsed ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
                <button
                  type="button"
                  data-testid="tour-close-btn"
                  onClick={onClose}
                  aria-label="Close guided tour"
                  className="inline-flex size-7 cursor-pointer items-center justify-center border border-[var(--at-border-subtle)] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)] hover:text-[var(--at-text-primary)]"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {!collapsed && (
              <>
                <p className="mt-2 font-sans text-xs leading-relaxed text-[var(--at-text-secondary)]">
                  {current.detail}
                </p>

                <div className="mt-2.5 flex items-center gap-1">
                  {TOUR_STEPS.map((item, idx) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => activateStep(idx)}
                      aria-label={`Jump to ${item.title}`}
                      className="h-1.5 flex-1 cursor-pointer transition-colors"
                      style={{
                        background:
                          idx === stepIndex
                            ? 'var(--at-signal-cyan)'
                            : idx < stepIndex
                              ? 'var(--at-border-focus)'
                              : 'var(--at-border-subtle)',
                      }}
                    />
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[var(--graph-frame)] pt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="tour-prev-btn"
                      onClick={() => activateStep(stepIndex - 1)}
                      disabled={stepIndex === 0}
                      className="inline-flex cursor-pointer items-center gap-1 border border-[var(--at-border-subtle)] px-2.5 py-1 font-mono text-[11px] text-[var(--at-text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="size-3" aria-hidden="true" />
                      Prev
                    </button>
                    <button
                      type="button"
                      data-testid="tour-next-btn"
                      onClick={() => {
                        if (isLast) onClose();
                        else activateStep(stepIndex + 1);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 bg-[var(--at-text-primary)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--at-surface-base)]"
                    >
                      {isLast ? 'Finish Tour' : 'Next'}
                      {!isLast ? <ArrowRight className="size-3" aria-hidden="true" /> : null}
                    </button>
                  </div>

                  {isLast ? (
                    <button
                      type="button"
                      data-testid="tour-launch-cradleflow"
                      onClick={() => {
                        onClose();
                        onOpenCradleFlow();
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] font-medium text-[var(--at-signal-cyan)] hover:underline"
                    >
                      Open Phase 02: CradleFlow
                    </button>
                  ) : (
                    <span className="font-mono text-[10px] text-[var(--graph-muted)]">
                      Arrows step · Esc closes
                    </span>
                  )}
                </div>
              </>
            )}
          </GraphBody>
        </Graph>
      </MotionConfig>
    </aside>
  );
}
