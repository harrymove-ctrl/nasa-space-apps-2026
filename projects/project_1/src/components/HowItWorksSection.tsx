import { Compass, Flame, GitMerge, ShieldCheck } from 'lucide-react';
import {
  computeIeee738Physics,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';

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
      step: '01 / Ingest',
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
      step: '02 / Harmonize',
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
      step: '03 / Derate & Cite',
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
      step: '04 / Train',
      title: '3-Wave Triage & CradleFlow Twin',
      metric: `${bundle.osdrTotalHits || bundle.osdrStudies.length} OSDR bio records`,
      summary:
        'Connects wildfire corridor triage drills with the standalone CradleFlow lunar and Mars astronaut shelter simulator.',
      actionLabel: 'Run 3-Wave Drill',
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
      <div className="lp-container space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-cyan)]">
              SYSTEM PIPELINE
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
              How TerraSpan Turns Orbital Feeds into Grid Decisions
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stages.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.08em]"
                      style={{ color: item.accent }}
                    >
                      {item.step}
                    </span>
                    <Icon className="size-4 shrink-0" style={{ color: item.accent }} aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-[var(--at-text-primary)]">
                    {item.title}
                  </h3>
                  <div className="font-mono text-[11px] text-[var(--at-text-secondary)]">
                    {item.metric}
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--at-text-muted)]">
                    {item.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={item.onAction}
                  className="cursor-pointer self-start rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-3 py-1.5 font-mono text-[11px] font-medium text-[var(--at-text-primary)] transition-colors hover:border-[var(--at-border-focus)]"
                >
                  {item.actionLabel}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
