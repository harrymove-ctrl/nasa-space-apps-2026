import { MotionConfig } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import {
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
import { NASA_OPEN_PARTNERS } from '../data/terraspanData';
import { AskTheGridCopilot } from './aicanvas/AskTheGridCopilot';
import { GlassDock } from './aicanvas/GlassDock';
import { SourceRail } from './aicanvas/SourceRail';
import { HowItWorksSection } from './HowItWorksSection';
import { KnowledgeMapBox } from './KnowledgeMapBox';
import { MissionGameBox } from './MissionGameBox';
import { BurningCalendarPanel } from './obsidian/BurningCalendarPanel';
import { FeatureDocsPreview } from './obsidian/feature-docs-preview';
import { FlipText } from './obsidian/flip-text';
import { InteractiveHoverButton } from './obsidian/interactive-hover-button';
import { SplitShowcase } from './obsidian/split-showcase';
import { StatusBars } from './obsidian/status-bars';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';
import { GraphStat } from '@/registry/default/graph-stat/graph-stat';

interface MinimalLandingSectionsProps {
  bundle: NasaTelemetryBundle;
  firms?: FirmsBundle;
  sar?: AsfSarBundle;
  activeCorridor: CorridorPreset;
  selectedCorridorId: string;
  onSelectCorridor: (id: string) => void;
  syncing?: boolean;
  lastSyncMs?: number;
  onRefreshTelemetry?: () => void;
  onOpenKnowledgeMap: () => void;
  onOpenMissionGame: () => void;
  onOpenCradleFlow: () => void;
  onStartTour: () => void;
  stressLongValues?: boolean;
}

export function MinimalLandingSections({
  bundle,
  firms: firmsProp,
  sar: sarProp,
  activeCorridor,
  selectedCorridorId,
  onSelectCorridor,
  syncing = false,
  lastSyncMs = 0,
  onRefreshTelemetry,
  onOpenKnowledgeMap,
  onOpenMissionGame,
  onOpenCradleFlow,
  onStartTour,
  stressLongValues = false,
}: MinimalLandingSectionsProps) {
  const weather = bundle.powerByCorridor[activeCorridor.id];
  const physics = computeIeee738Physics(activeCorridor, weather);
  const firms = firmsProp ?? getInitialFirmsSnapshot(activeCorridor);
  const sar = sarProp ?? getInitialSarSnapshot(activeCorridor);

  return (
    <>
      <HowItWorksSection
        bundle={bundle}
        activeCorridor={activeCorridor}
        onOpenKnowledgeMap={onOpenKnowledgeMap}
        onOpenMissionGame={onOpenMissionGame}
        onStartTour={onStartTour}
      />

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
              Drag horizontally or focus a plate and use Left and Right keys to step across calibrated NASA Earth observation, lunar habitat, and radiation biology captures.
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

          <MotionConfig reducedMotion="always">
            <Graph
              title={`CORRIDOR TELEMETRY · ${activeCorridor.label.toUpperCase()}`}
              data-testid="corridor-physics-summary"
              className="mdxcn-surface-card"
            >
              <GraphBody className="px-5 py-6 sm:px-7">
                <GraphStat
                  frame="none"
                  items={[
                    {
                      value: activeCorridor.label,
                      label: 'Selected Span',
                      hint: `${activeCorridor.region} · ${activeCorridor.sensorBadge}`,
                    },
                    {
                      value: `${weather.tempC} C`,
                      label: 'NASA POWER Weather',
                      hint: `${weather.windMs} m/s · RH ${weather.rhPct}% · ${weather.live ? 'Live API' : `Snapshot ${weather.date}`}`,
                    },
                    {
                      value: `${physics.deratedAmps} A`,
                      label: 'IEEE 738 Safe Limit',
                      hint:
                        physics.marginAmps > 0
                          ? `Down ${physics.marginAmps} A below ${activeCorridor.nominalAmps} A`
                          : physics.marginAmps < 0
                            ? `+${Math.abs(physics.marginAmps)} A headroom over ${activeCorridor.nominalAmps} A`
                            : `At ${activeCorridor.nominalAmps} A nameplate ceiling`,
                      accent: true,
                    },
                    {
                      value: `${physics.ttceMinutes} min`,
                      label: 'Head Spread Closure',
                      hint: `${activeCorridor.frpdMw} MW FRPD · ${activeCorridor.distanceKm} km offset`,
                    },
                  ]}
                />
              </GraphBody>
            </Graph>

            <BurningCalendarPanel preset={activeCorridor} firms={firms} sar={sar} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {bundle.feedHealth.map((feed) => (
                <Graph key={feed.id} title={feed.label} className="mdxcn-surface-card">
                  <GraphBody className="px-5 py-6">
                    <StatusBars
                      days={feed.days}
                      label={feed.label}
                      current={feed.current}
                      maxDays={45}
                    />
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-[var(--graph-frame)] pt-2.5 font-mono text-[11px] text-[var(--graph-muted)]">
                      <span className="truncate">{feed.endpoint}</span>
                      <span>
                        {feed.latencyMs} ms · {feed.recordsCount} items
                      </span>
                    </div>
                  </GraphBody>
                </Graph>
              ))}
            </div>
          </MotionConfig>
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
          <KnowledgeMapBox
            bundle={bundle}
            firms={firms}
            sar={sar}
            activeCorridor={activeCorridor}
            selectedCorridorId={selectedCorridorId}
            onSelectCorridor={onSelectCorridor}
            syncing={syncing}
            lastSyncMs={lastSyncMs}
            onRefreshTelemetry={onRefreshTelemetry}
            stressLongValues={stressLongValues}
          />
          <SourceRail bundle={bundle} preset={activeCorridor} />
        </div>
      </section>

      <section className="lp-section scroll-mt-20 border-t border-[var(--at-border-subtle)]" id="trainer">
        <div className="lp-container space-y-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--at-signal-fire)]">
                UNIFIED EARTH TO ORBIT WORKSPACE
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--at-text-primary)] sm:text-4xl">
                From Corridor Fire Triage to Habitat Storm Automation
              </h2>
            </div>

            <InteractiveHoverButton onClick={onOpenCradleFlow}>
              Open Phase 02: CradleFlow Canvas
            </InteractiveHoverButton>
          </div>

          <SplitShowcase
            items={[
              {
                id: 'dopaimint-card',
                title: (
                  <div className="space-y-1">
                    <div className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--at-signal-fire)]">
                      Phase 01 · Earth Grid Triage
                    </div>
                    <div className="text-2xl font-semibold text-[var(--at-text-primary)]">
                      DopaiMint
                    </div>
                  </div>
                ),
                description:
                  '26-year MODIS C6.1 and VIIRS 375 m hotspot harmonization paired with NASA POWER IEEE 738 ampacity derating.',
                tag: 'Open Phase 01 Drill',
                onClick: onOpenMissionGame,
                ariaLabel: 'Launch Phase 01 DopaiMint Drill',
              },
              {
                id: 'cradleflow-card',
                title: (
                  <div className="space-y-1">
                    <div className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--at-signal-cyan)]">
                      Phase 02 · Habitat Automation
                    </div>
                    <div className="text-2xl font-semibold text-[var(--at-text-primary)]">
                      CradleFlow
                    </div>
                  </div>
                ),
                description:
                  'Live React Flow station builder synced with corridor GOES-18 flux, NASA DONKI CMEs, and 1,064+ NASA OSDR bio-assays.',
                tag: 'Open Phase 02 Canvas',
                onClick: onOpenCradleFlow,
                ariaLabel: 'Open Phase 02 CradleFlow Habitat Automation Canvas',
              },
            ]}
          />

          <MissionGameBox
            bundle={bundle}
            firms={firms}
            sar={sar}
            activeCorridor={activeCorridor}
            selectedCorridorId={selectedCorridorId}
            onSelectCorridor={onSelectCorridor}
            syncing={syncing}
            lastSyncMs={lastSyncMs}
            onRefreshTelemetry={onRefreshTelemetry}
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
              DopaiMint and CradleFlow Unified Platform for NASA Space Apps Challenge 2026
            </div>
            <p className="font-mono text-xs text-[var(--at-text-dim)]">
              Open public data attribution: {NASA_OPEN_PARTNERS.join(' | ')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/submission/"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[var(--at-text-secondary)] hover:text-[var(--at-text-primary)] hover:underline"
            >
              Interactive 7-Slide Deck &amp; Pack
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onOpenCradleFlow}
              className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-medium text-[var(--at-signal-cyan)] hover:underline"
            >
              Open Phase 02: CradleFlow Simulator
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
