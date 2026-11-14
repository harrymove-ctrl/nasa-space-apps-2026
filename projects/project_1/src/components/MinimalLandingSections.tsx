import { ArrowUpRight, Radio, ShieldAlert, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchLiveAsfSar,
  fetchLiveFirmsHotspots,
  getInitialFirmsSnapshot,
  getInitialSarSnapshot,
  type AsfSarBundle,
  type FirmsBundle,
} from '../data/nasaExtendedClient';
import {
  computeIeee738Physics,
  CORRIDOR_PRESETS,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';
import { CRADLEFLOW_URL, NASA_OPEN_PARTNERS } from '../data/terraspanData';
import { AskTheGridCopilot } from './aicanvas/AskTheGridCopilot';
import { GlassDock } from './aicanvas/GlassDock';
import { SourceRail } from './aicanvas/SourceRail';
import { KnowledgeMapBox } from './KnowledgeMapBox';
import { MissionGameBox } from './MissionGameBox';
import { BurningCalendarPanel } from './obsidian/BurningCalendarPanel';
import { FeatureDocsPreview } from './obsidian/feature-docs-preview';
import { FlipText } from './obsidian/flip-text';
import { InteractiveHoverButton } from './obsidian/interactive-hover-button';
import { SplitShowcase } from './obsidian/split-showcase';
import { StatusBars } from './obsidian/status-bars';

interface MinimalLandingSectionsProps {
  bundle: NasaTelemetryBundle;
  activeCorridor: CorridorPreset;
  selectedCorridorId: string;
  onSelectCorridor: (id: string) => void;
  onOpenKnowledgeMap: () => void;
  onOpenMissionGame: () => void;
  stressLongValues?: boolean;
}

export function MinimalLandingSections({
  bundle,
  activeCorridor,
  selectedCorridorId,
  onSelectCorridor,
  onOpenKnowledgeMap,
  onOpenMissionGame,
  stressLongValues = false,
}: MinimalLandingSectionsProps) {
  const weather = bundle.powerByCorridor[activeCorridor.id];
  const physics = computeIeee738Physics(activeCorridor, weather);
  const [firms, setFirms] = useState<FirmsBundle>(() => getInitialFirmsSnapshot(activeCorridor));
  const [sar, setSar] = useState<AsfSarBundle>(() => getInitialSarSnapshot(activeCorridor));

  useEffect(() => {
    let active = true;
    setFirms(getInitialFirmsSnapshot(activeCorridor));
    setSar(getInitialSarSnapshot(activeCorridor));
    void fetchLiveFirmsHotspots(activeCorridor).then((next) => {
      if (active) setFirms(next);
    });
    void fetchLiveAsfSar(activeCorridor).then((next) => {
      if (active) setSar(next);
    });
    return () => {
      active = false;
    };
  }, [activeCorridor]);

  return (
    <>
      <section className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]" id="gallery">
        <div className="lp-container">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <FlipText
                className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--at-signal-cyan)]"
                duration={2.2}
                loop={false}
              >
                ORBITAL SURVEY PLATES
              </FlipText>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                Earth, Lunar, and Deep Space Inspection Plates
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--at-text-muted)]">
              Drag the strip, use Left and Right keys, switch 9:16 portrait or 16:9 landscape aspect framing, or open the component props table.
            </p>
          </div>

          <FeatureDocsPreview />
        </div>
      </section>

      <section className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]" id="telemetry">
        <div className="lp-container space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-fire)]">
                REAL-TIME TELEMETRY
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                NASA Feed Uptime and IEEE 738 Corridor Limits
              </h2>
            </div>

            <GlassDock
              presets={CORRIDOR_PRESETS}
              selectedId={selectedCorridorId}
              onSelect={onSelectCorridor}
            />
          </div>

          <div
            data-testid="corridor-physics-summary"
            className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5 md:grid-cols-4"
          >
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
                Selected Span
              </div>
              <div className="mt-1 text-lg font-semibold text-[var(--at-text-primary)]">
                {activeCorridor.label}
              </div>
              <div className="text-xs text-[var(--at-text-muted)]">
                {activeCorridor.region} · {activeCorridor.sensorBadge}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
                <Wind className="size-3.5 text-[var(--at-signal-cyan)]" />
                NASA POWER Weather
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-[var(--at-text-primary)]">
                {weather.tempC} C · {weather.windMs} m/s
              </div>
              <div className="text-xs text-[var(--at-text-muted)]">
                RH {weather.rhPct}% · {weather.live ? 'Live API' : `Snapshot ${weather.date}`}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
                <ShieldAlert className="size-3.5 text-[var(--at-signal-fire)]" />
                IEEE 738 Safe Limit
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-[var(--at-signal-fire)]">
                {physics.deratedAmps} A
              </div>
              <div className="text-xs text-[var(--at-text-muted)]">
                {physics.marginAmps > 0
                  ? `Down ${physics.marginAmps} A below ${activeCorridor.nominalAmps} A nameplate`
                  : physics.marginAmps < 0
                    ? `+${Math.abs(physics.marginAmps)} A ambient headroom over ${activeCorridor.nominalAmps} A`
                    : `At ${activeCorridor.nominalAmps} A nameplate ceiling`}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
                <Radio className="size-3.5 text-[var(--at-signal-cyan)]" />
                Head Spread Closure
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-[var(--at-text-primary)]">
                {physics.ttceMinutes} min TTCE
              </div>
              <div className="text-xs text-[var(--at-text-muted)]">
                {activeCorridor.frpdMw} MW FRPD · {activeCorridor.distanceKm} km offset
              </div>
            </div>
          </div>

          <BurningCalendarPanel preset={activeCorridor} firms={firms} sar={sar} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {bundle.feedHealth.map((feed) => (
              <div
                key={feed.id}
                className="rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5"
              >
                <StatusBars
                  days={feed.days}
                  label={feed.label}
                  current={feed.current}
                  maxDays={45}
                />
                <div className="mt-3 flex items-center justify-between border-t border-[var(--at-border-subtle)] pt-2.5 font-mono text-[11px] text-[var(--at-text-dim)]">
                  <span className="truncate">{feed.endpoint}</span>
                  <span>
                    {feed.latencyMs} ms · {feed.recordsCount} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]" id="corridors">
        <div className="lp-container space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-cyan)]">
                PROVENANCE GRAPH AND EVIDENCE
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                Every Corridor Claim Linked to Its Sensor Record
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenKnowledgeMap}
              className="lp-btn lp-btn--outline self-start md:self-auto"
            >
              Expand Full Map View
            </button>
          </div>

          <AskTheGridCopilot preset={activeCorridor} bundle={bundle} firms={firms} sar={sar} />
          <KnowledgeMapBox bundle={bundle} stressLongValues={stressLongValues} />
          <SourceRail bundle={bundle} preset={activeCorridor} />
        </div>
      </section>

      <section className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]" id="trainer">
        <div className="lp-container space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-fire)]">
                DUAL WORKSPACE MISSIONS
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                TerraSpan Earth Twin Paired with CradleFlow
              </h2>
            </div>

            <InteractiveHoverButton href={CRADLEFLOW_URL} target="_blank" rel="noreferrer">
              Open CradleFlow :5185
            </InteractiveHoverButton>
          </div>

          <SplitShowcase
            items={[
              {
                id: 'terraspan-card',
                title: (
                  <div className="space-y-1">
                    <div className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--at-signal-fire)]">
                      Earth Grid Twin
                    </div>
                    <div className="text-2xl font-semibold text-[var(--at-text-primary)]">
                      TerraSpan
                    </div>
                  </div>
                ),
                description:
                  '26-year MODIS C6.1 and VIIRS 375 m hotspot harmonization paired with NASA POWER IEEE 738 ampacity derating.',
                tag: 'Open Full Drill',
                onClick: onOpenMissionGame,
                ariaLabel: 'Launch 3-Wave TerraSpan Drill',
              },
              {
                id: 'cradleflow-card',
                title: (
                  <div className="space-y-1">
                    <div className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--at-signal-cyan)]">
                      Astronaut Trainer
                    </div>
                    <div className="text-2xl font-semibold text-[var(--at-text-primary)]">
                      CradleFlow
                    </div>
                  </div>
                ),
                description:
                  'Live React Flow station builder powered by NASA DONKI CMEs, GOES-18 protons, and 1,064 NASA OSDR radiation bio-studies.',
                tag: 'Open Live App :5185',
                href: CRADLEFLOW_URL,
                target: '_blank',
                rel: 'noreferrer',
                ariaLabel: 'Open CradleFlow Astronaut Mission Trainer',
              },
            ]}
          />

          <MissionGameBox
            bundle={bundle}
            embedded
            stressLongValues={stressLongValues}
            onOpenKnowledgeMap={onOpenKnowledgeMap}
          />
        </div>
      </section>

      <footer className="border-t border-[var(--at-border-subtle)] py-10" id="evidence">
        <div className="lp-container flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-[var(--at-text-primary)]">
              TerraSpan x CradleFlow · NASA Space Apps Challenge 2026
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-[var(--at-text-dim)]">
              {NASA_OPEN_PARTNERS.map((partner) => (
                <span key={partner}>{partner}</span>
              ))}
            </div>
          </div>

          <a
            href={CRADLEFLOW_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[var(--at-signal-cyan)] hover:underline"
          >
            CradleFlow Simulator ({CRADLEFLOW_URL})
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </footer>
    </>
  );
}
