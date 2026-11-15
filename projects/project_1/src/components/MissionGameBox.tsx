import { MotionConfig } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  getInitialFirmsSnapshot,
  getInitialSarSnapshot,
  type AsfSarBundle,
  type FirmsBundle,
} from '../data/nasaExtendedClient';
import {
  computeIeee738Physics,
  CORRIDOR_PRESETS,
  getInitialTelemetryBundle,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';
import { CRADLEFLOW_URL, DEFENSE_MODULES, MISSION_WAVES } from '../data/terraspanData';
import { Callout } from '@/registry/default/callout/callout';
import { GraphCheck } from '@/registry/default/graph-check/graph-check';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';
import { GraphSpec } from '@/registry/default/graph-spec/graph-spec';
import { GraphStat } from '@/registry/default/graph-stat/graph-stat';

interface MissionGameBoxProps {
  bundle?: NasaTelemetryBundle;
  firms?: FirmsBundle;
  sar?: AsfSarBundle;
  activeCorridor?: CorridorPreset;
  selectedCorridorId?: string;
  onSelectCorridor?: (id: string) => void;
  syncing?: boolean;
  lastSyncMs?: number;
  onRefreshTelemetry?: () => void;
  stage?: 'triage' | 'cradleflow';
  onStageChange?: (stage: 'triage' | 'cradleflow') => void;
  embedded?: boolean;
  onBack?: () => void;
  onOpenKnowledgeMap?: () => void;
  stressLongValues?: boolean;
}

export function MissionGameBox({
  bundle,
  firms,
  sar,
  activeCorridor,
  selectedCorridorId,
  onSelectCorridor,
  syncing = false,
  lastSyncMs = 0,
  onRefreshTelemetry,
  stage,
  onStageChange,
  embedded = false,
  onBack,
  onOpenKnowledgeMap,
  stressLongValues = false,
}: MissionGameBoxProps) {
  const telemetry = useMemo(() => bundle ?? getInitialTelemetryBundle(), [bundle]);
  const [internalCorridorId, setInternalCorridorId] = useState<string>(
    selectedCorridorId ?? activeCorridor?.id ?? CORRIDOR_PRESETS[0].id
  );
  const currentCorridorId = selectedCorridorId ?? activeCorridor?.id ?? internalCorridorId;
  const corridor =
    CORRIDOR_PRESETS.find((c) => c.id === currentCorridorId) ??
    activeCorridor ??
    CORRIDOR_PRESETS[0];

  const firmsData = useMemo(() => firms ?? getInitialFirmsSnapshot(corridor), [firms, corridor]);
  const sarData = useMemo(() => sar ?? getInitialSarSnapshot(corridor), [sar, corridor]);

  const [waveIndex, setWaveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [internalStage, setInternalStage] = useState<'triage' | 'cradleflow'>('triage');

  // Interactive physics sandbox offsets (0 / null means pure unmodified live NASA telemetry)
  const [tempDeltaC, setTempDeltaC] = useState<number>(0);
  const [windOverrideMs, setWindOverrideMs] = useState<number | null>(null);
  const [fluxOverridePfu, setFluxOverridePfu] = useState<number | null>(null);

  const selectCorridor = (id: string) => {
    setInternalCorridorId(id);
    onSelectCorridor?.(id);
  };

  const currentStage = stage ?? internalStage;
  const selectStage = (next: 'triage' | 'cradleflow') => {
    setInternalStage(next);
    onStageChange?.(next);
  };

  const activeWave = MISSION_WAVES[waveIndex] ?? MISSION_WAVES[0];
  const selectedOptionId = answers[activeWave.id];
  const selectedOption = activeWave.options.find((opt) => opt.id === selectedOptionId);

  const clearedCount = MISSION_WAVES.filter((wave) => {
    const pick = answers[wave.id];
    return wave.options.some((opt) => opt.id === pick && opt.correct);
  }).length;

  const rawWeather =
    telemetry.powerByCorridor[corridor.id] ?? telemetry.powerByCorridor['butte-230'];
  const effectiveWeather = useMemo(
    () => ({
      ...rawWeather,
      tempC: Number((rawWeather.tempC + tempDeltaC).toFixed(1)),
      windMs: Number((windOverrideMs ?? rawWeather.windMs).toFixed(1)),
    }),
    [rawWeather, tempDeltaC, windOverrideMs]
  );

  const livePhysics = useMemo(
    () => computeIeee738Physics(corridor, effectiveWeather),
    [corridor, effectiveWeather]
  );

  const effectiveProtonPfu = Number(
    (fluxOverridePfu ?? telemetry.spaceWeather.protonFluxPfu).toFixed(3)
  );
  const effectiveKp =
    fluxOverridePfu !== null && fluxOverridePfu >= 10
      ? Number(Math.max(telemetry.spaceWeather.kpIndex, 6.5).toFixed(1))
      : telemetry.spaceWeather.kpIndex;

  const isSandboxModified =
    tempDeltaC !== 0 || windOverrideMs !== null || fluxOverridePfu !== null;

  const handoffQuery = new URLSearchParams({
    corridor: corridor.label,
    flux: String(effectiveProtonPfu),
    kp: String(effectiveKp),
    waves: `${clearedCount}/${MISSION_WAVES.length}`,
  });
  const embedSrc = `${CRADLEFLOW_URL}?embedded=1&${handoffQuery.toString()}`;
  const fullscreenHref = `${CRADLEFLOW_URL}?${handoffQuery.toString()}&returnUrl=${encodeURIComponent('/?skipPreloader=1&view=game')}`;

  const waveTriggerTitle = `Wave 0${activeWave.wave} Trigger · ${corridor.label}`;
  const waveTriggerLine =
    activeWave.wave === 1
      ? `${firmsData.live ? 'LIVE NASA FIRMS CSV' : 'SNAPSHOT FIRMS'}: ${firmsData.global24hCount.toLocaleString()} US/HI detections · Max ${firmsData.regionalMaxFrpMw} MW FRP · ASF ${sarData.bursts[0]?.granuleName ?? 'Sentinel-1A'}`
      : activeWave.wave === 2
        ? `${effectiveWeather.live && !isSandboxModified ? 'LIVE NASA POWER' : isSandboxModified ? 'SANDBOX OVERRIDE' : 'SNAPSHOT POWER'} (${corridor.label}): ${effectiveWeather.tempC} C ambient · ${effectiveWeather.windMs} m/s wind · Safe Limit ${livePhysics.deratedAmps} A (Nominal ${corridor.nominalAmps} A) · TTCE ${livePhysics.ttceMinutes} min`
        : `${telemetry.spaceWeather.live && fluxOverridePfu === null ? 'LIVE NOAA GOES-18' : 'RADIATION GATE'}: ${effectiveProtonPfu} pfu (>=10 MeV) · Flare ${telemetry.spaceWeather.xrayClass} · Kp ${effectiveKp} · ${telemetry.osdrTotalHits || telemetry.osdrStudies.length} OSDR studies`;

  return (
    <MotionConfig reducedMotion="always">
      <Graph
        title="INTERACTIVE TRIAGE DRILL"
        data-testid="mission-game-box"
        className="mission-game-box mdxcn-surface-card"
      >
        <GraphBody className="space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[var(--graph-frame)] pb-4">
            <div className="min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--at-signal-fire)]">
                Interactive Triage Drill · {clearedCount}/{MISSION_WAVES.length} Cleared
              </div>
              <h3 className="mt-1 font-sans text-xl font-semibold text-[var(--at-text-primary)]">
                {stressLongValues
                  ? 'Three-Wave Corridor Clearance, IEEE 738 Derating, and GOES-18 Radiation Drill'
                  : 'Execute Three Corridor and Deep Space Decisions'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="graph-frame mdxcn-surface-base px-2.5 py-1.5 text-[11px] text-[var(--graph-muted)]">
                ascii.rest // {currentStage === 'cradleflow' ? 'solar-system' : 'aurora'}
              </span>

              <button
                type="button"
                data-testid="drill-reset-btn"
                onClick={() => {
                  setAnswers({});
                  setWaveIndex(0);
                  setTempDeltaC(0);
                  setWindOverrideMs(null);
                  setFluxOverridePfu(null);
                }}
                className="graph-frame mdxcn-surface-base inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--at-text-primary)] hover:text-[var(--graph-accent)]"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Reset
              </button>

              {!embedded && onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="graph-frame mdxcn-surface-base inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--at-text-primary)] hover:text-[var(--graph-accent)]"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Back to Overview
                </button>
              )}
            </div>
          </div>

          {/* Live NASA Stream & Physics Playground Controller */}
          <Graph title="LIVE NASA STREAM CONTROLLER" className="mdxcn-surface-base">
            <GraphBody className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {CORRIDOR_PRESETS.map((preset) => {
                    const active = preset.id === corridor.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        data-testid={`game-corridor-${preset.id}`}
                        onClick={() => selectCorridor(preset.id)}
                        className={`cursor-pointer border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                          active
                            ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] font-semibold text-[var(--at-text-primary)]'
                            : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="game-pull-live-nasa"
                    onClick={() => onRefreshTelemetry?.()}
                    disabled={!onRefreshTelemetry || syncing}
                    className="inline-flex cursor-pointer items-center gap-1.5 border border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] px-3 py-1 font-mono text-[11px] font-medium text-[var(--at-text-primary)] disabled:cursor-default disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`size-3 text-[var(--at-signal-cyan)] ${syncing ? 'animate-spin' : ''}`}
                      aria-hidden="true"
                    />
                    <span>
                      {syncing
                        ? 'Pulling NASA...'
                        : `Pull Live NASA (${telemetry.liveSourceCount}/${telemetry.totalSourceCount})`}
                    </span>
                  </button>
                  {lastSyncMs > 0 && (
                    <span className="font-mono text-[11px] text-[var(--graph-muted)]">
                      {lastSyncMs} ms
                    </span>
                  )}
                </div>
              </div>

              <GraphStat
                frame="rule"
                items={[
                  {
                    value: firmsData.global24hCount.toLocaleString(),
                    label: '24h FIRMS Hotspots',
                    hint: firmsData.live ? `Live CSV (${firmsData.latencyMs} ms)` : 'Snapshot',
                  },
                  {
                    value: `${effectiveWeather.tempC} C`,
                    label: 'NASA POWER Ambient',
                    hint: `${effectiveWeather.windMs} m/s wind · ${isSandboxModified ? 'Sandbox' : rawWeather.live ? 'Live API' : rawWeather.date}`,
                  },
                  {
                    value: `${livePhysics.deratedAmps} A`,
                    label: 'IEEE 738 Safe Limit',
                    hint: `${livePhysics.ttceMinutes} min TTCE · ${livePhysics.riskLevel}`,
                    accent: true,
                  },
                  {
                    value: `${effectiveProtonPfu} pfu`,
                    label: 'GOES-18 Solar Gate',
                    hint: `Kp ${effectiveKp} · ${effectiveProtonPfu >= 10 || effectiveKp >= 5 ? 'SHELTER' : 'NOMINAL'}`,
                  },
                ]}
              />

              {/* Interactive Parameter Sliders so Judges & Users Can Stress Test Live NASA Physics */}
              <div className="space-y-2 border-t border-dashed border-[var(--graph-frame)] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-[var(--graph-accent)]">
                    <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                    PHYSICS SANDBOX (START WITH LIVE NASA, STRESS TEST LOCALLY)
                  </span>
                  {isSandboxModified && (
                    <button
                      type="button"
                      data-testid="game-sandbox-reset"
                      onClick={() => {
                        setTempDeltaC(0);
                        setWindOverrideMs(null);
                        setFluxOverridePfu(null);
                      }}
                      className="cursor-pointer border border-[var(--at-border-subtle)] px-2 py-0.5 text-[11px] text-[var(--at-text-primary)] hover:border-[var(--at-signal-cyan)]"
                    >
                      Restore Live NASA
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 font-mono text-[11px] md:grid-cols-3">
                  <label className="flex flex-col gap-1 border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-3 py-2">
                    <span className="flex items-center justify-between text-[var(--at-text-muted)]">
                      <span>Temp Offset (T2M)</span>
                      <span className="text-[var(--at-text-primary)]">
                        {tempDeltaC >= 0 ? `+${tempDeltaC}` : tempDeltaC} C ({effectiveWeather.tempC} C)
                      </span>
                    </span>
                    <input
                      type="range"
                      data-testid="sandbox-temp-slider"
                      min={-6}
                      max={16}
                      step={1}
                      value={tempDeltaC}
                      onChange={(e) => setTempDeltaC(Number(e.target.value))}
                      className="accent-[var(--at-signal-fire)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1 border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-3 py-2">
                    <span className="flex items-center justify-between text-[var(--at-text-muted)]">
                      <span>Cooling Wind (WS10M)</span>
                      <span className="text-[var(--at-text-primary)]">
                        {effectiveWeather.windMs} m/s
                      </span>
                    </span>
                    <input
                      type="range"
                      data-testid="sandbox-wind-slider"
                      min={1}
                      max={18}
                      step={0.5}
                      value={effectiveWeather.windMs}
                      onChange={(e) => setWindOverrideMs(Number(e.target.value))}
                      className="accent-[var(--at-signal-cyan)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1 border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-3 py-2">
                    <span className="flex items-center justify-between text-[var(--at-text-muted)]">
                      <span>GOES-18 Proton Flux</span>
                      <span className="text-[var(--at-text-primary)]">
                        {effectiveProtonPfu} pfu
                      </span>
                    </span>
                    <input
                      type="range"
                      data-testid="sandbox-flux-slider"
                      min={0.1}
                      max={45}
                      step={0.5}
                      value={effectiveProtonPfu}
                      onChange={(e) => setFluxOverridePfu(Number(e.target.value))}
                      className="accent-[var(--at-signal-cyan)]"
                    />
                  </label>
                </div>
              </div>
            </GraphBody>
          </Graph>

          {/* Phase Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="mission-phase-triage"
              onClick={() => selectStage('triage')}
              className={`cursor-pointer border px-3.5 py-2 font-mono text-xs transition-colors ${
                currentStage === 'triage'
                  ? 'border-[var(--at-signal-fire)] bg-[var(--at-surface-elevated)] font-semibold text-[var(--at-text-primary)]'
                  : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)]'
              }`}
            >
              Phase 01 · Earth Grid Triage ({clearedCount}/{MISSION_WAVES.length})
            </button>

            <button
              type="button"
              data-testid="mission-phase-cradleflow"
              onClick={() => selectStage('cradleflow')}
              className={`cursor-pointer border px-3.5 py-2 font-mono text-xs transition-colors ${
                currentStage === 'cradleflow'
                  ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] font-semibold text-[var(--at-text-primary)]'
                  : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)]'
              }`}
            >
              Phase 02 · CradleFlow Habitat Automation
            </button>
          </div>

          {currentStage === 'triage' ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MISSION_WAVES.map((wave, idx) => {
                  const picked = answers[wave.id];
                  const passed = wave.options.some((opt) => opt.id === picked && opt.correct);
                  return (
                    <button
                      key={wave.id}
                      type="button"
                      onClick={() => setWaveIndex(idx)}
                      data-testid={`drill-wave-${wave.wave}`}
                      className={`graph-frame mdxcn-surface-base flex cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors ${
                        waveIndex === idx
                          ? 'ring-1 ring-[var(--at-signal-cyan)]'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--graph-muted)]">
                          Wave 0{wave.wave}
                        </div>
                        <div className="font-sans text-sm font-semibold text-[var(--at-text-primary)]">
                          {wave.title}
                        </div>
                      </div>
                      <CheckCircle2
                        className={`size-4 shrink-0 ${
                          passed ? 'text-[var(--at-signal-cyan)]' : 'text-[var(--at-border-bright)]'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
                <div className="min-w-0 space-y-4">
                  <Callout
                    type="warning"
                    title={waveTriggerTitle}
                    className="mdxcn-surface-base"
                  >
                    <p className="font-semibold">{activeWave.trigger}</p>
                    <p className="mt-1 text-xs text-[var(--at-text-secondary)]">{waveTriggerLine}</p>
                  </Callout>

                  <div className="space-y-2.5">
                    {activeWave.options.map((opt) => {
                      const active = selectedOptionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAnswers((prev) => ({ ...prev, [activeWave.id]: opt.id }))}
                          data-testid={`drill-option-${opt.id}`}
                          className={`graph-frame w-full cursor-pointer p-4 text-left transition-colors ${
                            active
                              ? opt.correct
                                ? 'bg-[var(--at-signal-cyan)]/12 ring-1 ring-[var(--at-signal-cyan)]'
                                : 'bg-[var(--at-signal-fire)]/12 ring-1 ring-[var(--at-signal-fire)]'
                              : 'mdxcn-surface-base hover:bg-[var(--at-surface-elevated)]'
                          }`}
                        >
                          <div className="font-sans text-sm font-semibold text-[var(--at-text-primary)]">
                            {opt.label}
                          </div>
                          <div className="mt-1 text-xs text-[var(--at-text-muted)]">
                            {opt.detail}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption && (
                    <div data-testid="drill-outcome">
                      <Callout
                        type={selectedOption.correct ? 'tip' : 'danger'}
                        title={selectedOption.correct ? 'PROTOCOL VERIFIED' : 'CORRECTION NEEDED'}
                        className="mdxcn-surface-base"
                      >
                        <p>{selectedOption.outcome}</p>
                        {activeWave.wave === 3 && selectedOption.correct ? (
                          <p className="mt-2">
                            <button
                              type="button"
                              onClick={() => selectStage('cradleflow')}
                              className="inline-flex cursor-pointer items-center gap-1.5 border border-[var(--at-signal-cyan)] bg-[var(--at-surface-card)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--at-signal-cyan)]"
                            >
                              Continue to Phase 02: CradleFlow
                              <ArrowRight className="size-3.5" aria-hidden="true" />
                            </button>
                          </p>
                        ) : null}
                      </Callout>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-4">
                  <GraphSpec
                    title="UNDERLYING PHYSICAL MODELS"
                    className="mdxcn-surface-base"
                    rows={DEFENSE_MODULES.map((mod) => ({
                      label: `${mod.tag} · ${mod.title}`,
                      value: mod.formula,
                      accent: mod.id === 'ieee738',
                      note: mod.summary,
                    }))}
                  />

                  <GraphCheck
                    title="TRIAGE CHECKLIST"
                    className="mdxcn-surface-base"
                    items={MISSION_WAVES.map((w) => {
                      const picked = answers[w.id];
                      const done = w.options.some((o) => o.id === picked && o.correct);
                      return {
                        label: `Wave 0${w.wave}: ${w.title}`,
                        done,
                      };
                    })}
                  />

                  <div className="graph-frame mdxcn-surface-base flex flex-wrap items-center justify-between gap-2 px-4 py-3 font-mono text-xs">
                    {onOpenKnowledgeMap ? (
                      <button
                        type="button"
                        onClick={onOpenKnowledgeMap}
                        className="cursor-pointer text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]"
                      >
                        Inspect Map
                      </button>
                    ) : (
                      <span className="text-[var(--graph-muted)]">{corridor.sensorBadge}</span>
                    )}
                    <button
                      type="button"
                      data-testid="escalate-to-cradleflow-btn"
                      onClick={() => selectStage('cradleflow')}
                      className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[var(--at-signal-cyan)] hover:underline"
                    >
                      Escalate to Phase 02: CradleFlow Canvas
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Graph title="PHASE 02 · CRADLEFLOW HABITAT" className="mdxcn-surface-base">
              <GraphBody className="space-y-4 px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[var(--graph-frame)] pb-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-[var(--at-text-secondary)]">
                    <span className="text-[var(--at-signal-cyan)]">TELEMETRY HANDOFF</span>
                    <span>{corridor.label}</span>
                    <span>
                      POWER {effectiveWeather.tempC} C · {effectiveWeather.windMs} m/s
                    </span>
                    <span>
                      GOES-18 {effectiveProtonPfu} pfu · Kp {effectiveKp}
                    </span>
                    <span className="text-[var(--at-signal-fire)]">
                      Phase 01 Triage {clearedCount}/{MISSION_WAVES.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => selectStage('triage')}
                      className="inline-flex cursor-pointer items-center gap-1 border border-[var(--at-border-subtle)] px-2.5 py-1 text-[var(--at-text-primary)] hover:border-[var(--at-border-bright)]"
                    >
                      <ArrowLeft className="size-3" aria-hidden="true" />
                      Return to Phase 01 Triage
                    </button>
                    <a
                      href={fullscreenHref}
                      className="inline-flex items-center gap-1 border border-[var(--at-signal-cyan)] px-2.5 py-1 text-[var(--at-signal-cyan)] hover:underline"
                    >
                      Open Fullscreen HUD
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <iframe
                  data-testid="cradleflow-embed-frame"
                  title="CradleFlow Habitat Automation Simulator"
                  src={embedSrc}
                  className="graph-frame h-[680px] w-full bg-[#060302] sm:h-[740px]"
                />
              </GraphBody>
            </Graph>
          )}
        </GraphBody>
      </Graph>
    </MotionConfig>
  );
}

export default MissionGameBox;
