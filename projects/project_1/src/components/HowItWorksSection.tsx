import { MotionConfig } from 'motion/react';
import { Compass, Flame, GitMerge, ShieldCheck } from 'lucide-react';
import {
  computeIeee738Physics,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';
import { GraphFlow } from '@/registry/default/graph-flow/graph-flow';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';

interface HowItWorksSectionProps {
  bundle: NasaTelemetryBundle;
  activeCorridor: CorridorPreset;
  onOpenKnowledgeMap: () => void;
  onOpenMissionGame: () => void;
  onStartTour: () => void;
}

export function HowItWorksSection({
  bundle,
  activeCorridor,
  onOpenKnowledgeMap,
  onOpenMissionGame,
  onStartTour,
}: HowItWorksSectionProps) {
  const weather = bundle.powerByCorridor[activeCorridor.id];
  const physics = computeIeee738Physics(activeCorridor, weather);

  const stages = [
    {
      step: '01 / INGEST',
      title: 'MODIS C6.1 + VIIRS 375 m + GOES-18',
      metric: `${bundle.liveSourceCount}/${bundle.totalSourceCount} live feeds · ${bundle.spaceWeather.protonFluxPfu} pfu`,
      summary:
        'Queries public NASA EONET, FIRMS, POWER, ASF SAR, OSDR, and NOAA GOES-18 streams with zero API keys.',
      actionLabel: 'Inspect Live Feeds',
      icon: Flame,
      accent: 'var(--at-signal-fire)',
      onAction: () => {
        document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      step: '02 / HARMONIZE',
      title: '26-Year H3 Footprint Calibration',
      metric: 'MODIS 1 km + VIIRS 375 m',
      summary:
        'Cross-calibrates Terra, Aqua, Suomi NPP, and NOAA-20/21 elliptical ground footprints to eliminate the 2012 double-count spike.',
      actionLabel: 'View 2000 to 2026 Calendar',
      icon: GitMerge,
      accent: 'var(--at-signal-cyan)',
      onAction: () => {
        document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      step: '03 / DERATE',
      title: 'IEEE 738 Physics & Provenance Map',
      metric: `${physics.deratedAmps} A limit · ${physics.ttceMinutes} min TTCE`,
      summary:
        'Solves dynamic conductor ampacity derates from NASA POWER wind and temperature and links every claim to raw records.',
      actionLabel: 'Open Full Data Map',
      icon: ShieldCheck,
      accent: 'var(--at-signal-cyan)',
      onAction: onOpenKnowledgeMap,
    },
    {
      step: '04 / AUTOMATE',
      title: 'Phase 01 Triage -> Phase 02 CradleFlow',
      metric: `${bundle.osdrTotalHits || bundle.osdrStudies.length} OSDR bio records`,
      summary:
        'Phase 01 3-wave corridor and solar triage escalates live GOES-18, DONKI, and OSDR telemetry directly into Phase 02 CradleFlow shelter automation.',
      actionLabel: 'Open Unified Trainer',
      icon: Compass,
      accent: 'var(--at-signal-fire)',
      onAction: onOpenMissionGame,
    },
  ] as const;

  return (
    <section
      className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]"
      id="how-it-works"
      data-testid="how-it-works-section"
    >
      <MotionConfig reducedMotion="always">
        <div className="lp-container space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-cyan)]">
                SYSTEM PIPELINE
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                How One Orbital Pipeline Protects Earth Grids and Space Habitats
              </h2>
            </div>

            <button
              type="button"
              onClick={onStartTour}
              data-testid="start-product-tour"
              className="lp-btn lp-btn--primary self-start md:self-auto"
            >
              <Compass className="size-4" aria-hidden="true" />
              Start Guided Tour
            </button>
          </div>

          <GraphFlow
            title="ORBIT TO OUTPOST PIPELINE"
            className="mdxcn-surface-card"
            palette="duo"
            rows={[
              {
                nodes: [
                  { label: 'nasa firms + power + goes-18' },
                  { label: 'h3 footprint dedup' },
                  { label: 'ieee 738 sag & ttce', tone: 'accent' },
                  { label: 'phase 01 triage' },
                  { label: 'cradleflow hud', tone: 'accent' },
                ],
              },
            ]}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {stages.map((item) => {
              const Icon = item.icon;
              return (
                <Graph key={item.step} title={item.step} className="mdxcn-surface-card">
                  <GraphBody className="flex h-full flex-col justify-between gap-4 px-5 py-6">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-mono text-[11px] uppercase tracking-[0.08em]"
                          style={{ color: item.accent }}
                        >
                          {item.metric}
                        </span>
                        <Icon className="size-4 shrink-0" style={{ color: item.accent }} aria-hidden="true" />
                      </div>
                      <h3 className="font-sans text-base font-semibold leading-snug text-[var(--at-text-primary)]">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs leading-relaxed text-[var(--at-text-muted)]">
                        {item.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={item.onAction}
                      className="graph-frame mdxcn-surface-base cursor-pointer self-start px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--at-text-primary)] hover:text-[var(--graph-accent)]"
                    >
                      {item.actionLabel}
                    </button>
                  </GraphBody>
                </Graph>
              );
            })}
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
