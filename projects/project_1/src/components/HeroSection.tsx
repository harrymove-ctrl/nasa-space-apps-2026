import { Activity, Flame, Orbit } from 'lucide-react';
import {
  computeIeee738Physics,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';
import { WireframeGlobe } from './aicanvas/WireframeGlobe';
import { CornerMarkers } from './CornerFrame';
import { DiscoverButton } from './obsidian/discover-button';

interface HeroSectionProps {
  bundle: NasaTelemetryBundle;
  activeCorridor: CorridorPreset;
  onOpenKnowledgeMap: () => void;
  onOpenMissionGame: () => void;
}

export function HeroSection({
  bundle,
  activeCorridor,
  onOpenKnowledgeMap,
  onOpenMissionGame,
}: HeroSectionProps) {
  const weather = bundle.powerByCorridor[activeCorridor.id];
  const physics = computeIeee738Physics(activeCorridor, weather);
  const topEvent = bundle.eonetEvents[0];

  return (
    <section className="lp-hero" id="top">
      <div className="lp-container">
        <div className="lp-hero-copy">
          <div className="lp-hero-badges" data-testid="hero-fact-pill">
            <span className="whitespace-nowrap">26 Years MODIS + VIIRS</span>
            <span className="whitespace-nowrap">{activeCorridor.nominalAmps} A Line Rating</span>
            <span className="whitespace-nowrap">GOES-18 {bundle.spaceWeather.protonFluxPfu} pfu</span>
          </div>

          <h1 className="lp-hero-title">
            Orbital fire and solar risk telemetry for grid crews and space missions
          </h1>

          <p className="lp-hero-sub">
            TerraSpan pairs NASA MODIS C6.1 and VIIRS 375 m hotspots with IEEE 738 conductor derates and NOAA GOES-18 radiation alerts, open with zero login.
          </p>

          <div className="lp-hero-buttons">
            <DiscoverButton
              label="Inspect Live Twin"
              onClick={() => {
                document.getElementById('corridors')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <button
              type="button"
              onClick={onOpenMissionGame}
              data-testid="hero-mission-btn"
              className="lp-btn lp-btn--outline h-[52px] rounded-full px-6"
            >
              Run 3-Wave Drill
            </button>
          </div>
        </div>

        <div className="lp-hero-stage">
          <div className="lp-hero-grid">
            <div className="lp-hero-panel overflow-hidden border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)]/92 p-5">
              <CornerMarkers size={16} offset={-4} />
              <div className="pointer-events-none absolute inset-0 opacity-90">
                <WireframeGlobe />
              </div>

              <div className="relative z-10 flex h-full flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]">
                    <Orbit className="size-3.5" />
                    Live Corridor Readout
                  </span>
                  <span className="rounded border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/90 px-2 py-0.5 font-mono text-[10px] text-[var(--at-text-muted)]">
                    {bundle.liveSourceCount}/{bundle.totalSourceCount} APIs
                  </span>
                </div>

                <div className="space-y-2.5 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/88 p-3.5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--at-text-primary)]">
                      {activeCorridor.label}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--at-signal-fire)]">
                      {physics.deratedAmps} A safe
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-[var(--at-text-muted)]">
                    <div>
                      <div className="text-[10px] text-[var(--at-text-dim)]">T2M</div>
                      <div className="text-[var(--at-text-primary)]">{weather.tempC} C</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--at-text-dim)]">WIND</div>
                      <div className="text-[var(--at-text-primary)]">{weather.windMs} m/s</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--at-text-dim)]">TTCE</div>
                      <div className="text-[var(--at-signal-fire)]">{physics.ttceMinutes} min</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/88 px-3.5 py-2.5 text-xs backdrop-blur-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <Flame className="size-3.5 shrink-0 text-[var(--at-signal-fire)]" />
                    <span className="truncate font-medium text-[var(--at-text-primary)]">
                      {topEvent.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenKnowledgeMap}
                    className="shrink-0 cursor-pointer font-mono text-[11px] font-semibold text-[var(--at-signal-cyan)] hover:underline"
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>

            <div className="lp-hero-panel lp-hero-panel--picture overflow-hidden">
              <CornerMarkers size={16} offset={-4} />
              <img
                src="/nasa-gallery/earthrise-orbital-pass.webp"
                srcSet="/nasa-gallery/earthrise-orbital-pass-380.webp 380w, /nasa-gallery/earthrise-orbital-pass.webp 760w"
                sizes="(max-width: 719px) 360px, 680px"
                alt="Terra and Suomi NPP satellite thermal contour scan plate"
                width={760}
                height={568}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />

              <div
                className="lp-hero-float-surface absolute bottom-4 right-4 z-10 flex max-w-[290px] items-center gap-3 rounded-xl border border-[var(--at-border-bright)] bg-[var(--at-surface-base)]/94 px-3.5 py-2.5 backdrop-blur-md"
              >
                <Activity className="size-4 shrink-0 text-[var(--at-signal-cyan)]" />
                <div className="min-w-0 text-xs">
                  <div className="truncate font-semibold text-[var(--at-text-primary)]">
                    GOES-18 Flare {bundle.spaceWeather.xrayClass} · Kp {bundle.spaceWeather.kpIndex}
                  </div>
                  <div className="truncate font-mono text-[10px] text-[var(--at-text-muted)]">
                    {bundle.osdrTotalHits} OSDR radiation assays linked
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
