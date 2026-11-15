import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, RotateCcw, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CORRIDOR_PRESETS,
  getInitialTelemetryBundle,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';
import { CRADLEFLOW_URL, DEFENSE_MODULES, MISSION_WAVES } from '../data/terraspanData';

interface MissionGameBoxProps {
  bundle?: NasaTelemetryBundle;
  activeCorridor?: CorridorPreset;
  stage?: 'triage' | 'cradleflow';
  onStageChange?: (stage: 'triage' | 'cradleflow') => void;
  embedded?: boolean;
  onBack?: () => void;
  onOpenKnowledgeMap?: () => void;
  stressLongValues?: boolean;
}

export function MissionGameBox({
  bundle,
  activeCorridor,
  stage,
  onStageChange,
  embedded = false,
  onBack,
  onOpenKnowledgeMap,
  stressLongValues = false,
}: MissionGameBoxProps) {
  const telemetry = useMemo(() => bundle ?? getInitialTelemetryBundle(), [bundle]);
  const [waveIndex, setWaveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [internalStage, setInternalStage] = useState<'triage' | 'cradleflow'>('triage');

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

  const corridor = activeCorridor ?? CORRIDOR_PRESETS[0];
  const liveWeather =
    telemetry.powerByCorridor[corridor.id] ?? telemetry.powerByCorridor['butte-230'];

  const handoffQuery = new URLSearchParams({
    corridor: corridor.label,
    flux: String(telemetry.spaceWeather.protonFluxPfu),
    kp: String(telemetry.spaceWeather.kpIndex),
    waves: `${clearedCount}/${MISSION_WAVES.length}`,
  });
  const embedSrc = `${CRADLEFLOW_URL}?embedded=1&${handoffQuery.toString()}`;
  const fullscreenHref = `${CRADLEFLOW_URL}?${handoffQuery.toString()}&returnUrl=${encodeURIComponent('/?skipPreloader=1&view=game')}`;

  return (
    <div
      data-testid="mission-game-box"
      className="mission-game-box rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)]/95 p-5 sm:p-7"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--at-border-subtle)] pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--at-signal-fire)]">
            Interactive Triage Drill · {clearedCount}/{MISSION_WAVES.length} Cleared
          </span>
          <h3 className="mt-1 text-xl font-semibold text-[var(--at-text-primary)]">
            {stressLongValues
              ? 'Three-Wave Corridor Clearance, IEEE 738 Derating, and GOES-18 Radiation Drill'
              : 'Execute Three Corridor and Deep Space Decisions'}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setWaveIndex(0);
            }}
            data-testid="drill-reset-btn"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--at-border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)] hover:text-[var(--at-text-primary)]"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>

          {!embedded && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--at-border-bright)] px-3 py-1.5 text-xs font-medium text-[var(--at-text-primary)]"
            >
              <ArrowLeft className="size-3.5" />
              Back to Overview
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="mission-phase-triage"
          onClick={() => selectStage('triage')}
          className={`cursor-pointer rounded-xl border px-3.5 py-2 font-mono text-xs transition-colors ${
            currentStage === 'triage'
              ? 'border-[var(--at-signal-fire)] bg-[var(--at-surface-elevated)] font-semibold text-[var(--at-text-primary)]'
              : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/80 text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)]'
          }`}
        >
          Phase 01 · Earth Grid Triage ({clearedCount}/{MISSION_WAVES.length})
        </button>

        <button
          type="button"
          data-testid="mission-phase-cradleflow"
          onClick={() => selectStage('cradleflow')}
          className={`cursor-pointer rounded-xl border px-3.5 py-2 font-mono text-xs transition-colors ${
            currentStage === 'cradleflow'
              ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] font-semibold text-[var(--at-text-primary)]'
              : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/80 text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)]'
          }`}
        >
          Phase 02 · CradleFlow Habitat Automation
        </button>
      </div>

      {currentStage === 'triage' ? (
        <>
          <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MISSION_WAVES.map((wave, idx) => {
              const picked = answers[wave.id];
              const passed = wave.options.some((opt) => opt.id === picked && opt.correct);
              return (
                <button
                  key={wave.id}
                  type="button"
                  onClick={() => setWaveIndex(idx)}
                  data-testid={`drill-wave-${wave.wave}`}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    waveIndex === idx
                      ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)]'
                      : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/80'
                  }`}
                >
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
                      Wave 0{wave.wave}
                    </div>
                    <div className="text-sm font-semibold text-[var(--at-text-primary)]">
                      {wave.title}
                    </div>
                  </div>
                  <CheckCircle2
                    className={`size-4 shrink-0 ${
                      passed ? 'text-[var(--at-signal-cyan)]' : 'text-[var(--at-border-bright)]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4">
                <div className="font-mono text-xs text-[var(--at-signal-fire)]">
                  TRIGGER · {activeWave.trigger}
                </div>
                <p className="mt-1.5 font-mono text-xs text-[var(--at-text-secondary)]">
                  {activeWave.wave === 2
                    ? `LIVE POWER READOUT (${corridor.label}): ${liveWeather.tempC} C · ${liveWeather.windMs} m/s · Nominal ${corridor.nominalAmps} A`
                    : activeWave.wave === 3
                      ? `LIVE GOES-18 READOUT: ${telemetry.spaceWeather.protonFluxPfu} pfu · Flare ${telemetry.spaceWeather.xrayClass} · Kp ${telemetry.spaceWeather.kpIndex}`
                      : activeWave.telemetryReading}
                </p>
              </div>

              <div className="space-y-2.5">
                {activeWave.options.map((opt) => {
                  const active = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [activeWave.id]: opt.id }))}
                      data-testid={`drill-option-${opt.id}`}
                      className={`w-full cursor-pointer rounded-xl border p-4 text-left transition-colors ${
                        active
                          ? opt.correct
                            ? 'border-[var(--at-signal-cyan)] bg-[var(--at-signal-cyan)]/10'
                            : 'border-[var(--at-signal-fire)] bg-[var(--at-signal-fire)]/10'
                          : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] hover:border-[var(--at-border-bright)]'
                      }`}
                    >
                      <div className="text-sm font-semibold text-[var(--at-text-primary)]">{opt.label}</div>
                      <div className="mt-1 text-xs text-[var(--at-text-muted)]">{opt.detail}</div>
                    </button>
                  );
                })}
              </div>

              {selectedOption && (
                <div
                  data-testid="drill-outcome"
                  className={`rounded-xl border p-4 text-sm ${
                    selectedOption.correct
                      ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] text-[var(--at-text-primary)]'
                      : 'border-[var(--at-signal-fire)] bg-[var(--at-surface-elevated)] text-[var(--at-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.06em]">
                    <ShieldCheck className="size-4 text-[var(--at-signal-cyan)]" />
                    {selectedOption.correct ? 'Protocol Verified' : 'Correction Needed'}
                  </div>
                  <p className="mt-1.5 text-sm text-[var(--at-text-secondary)]">
                    {selectedOption.outcome}
                  </p>
                  {activeWave.wave === 3 && selectedOption.correct ? (
                    <button
                      type="button"
                      onClick={() => selectStage('cradleflow')}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--at-signal-cyan)] bg-[var(--at-surface-base)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--at-signal-cyan)]"
                    >
                      Continue to Phase 02: CradleFlow
                      <ArrowRight className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-5">
              <div className="space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
                  Underlying Physical Models
                </div>
                {DEFENSE_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    className="rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-3"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-[var(--at-signal-cyan)]">
                      <span>{mod.tag}</span>
                      <span>{mod.title}</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-[var(--at-text-primary)]">
                      {mod.formula}
                    </div>
                    <p className="mt-1 text-xs text-[var(--at-text-muted)]">{mod.summary}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--at-border-subtle)] pt-3">
                {onOpenKnowledgeMap && (
                  <button
                    type="button"
                    onClick={onOpenKnowledgeMap}
                    className="cursor-pointer font-mono text-xs text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]"
                  >
                    Inspect Map
                  </button>
                )}
                <button
                  type="button"
                  data-testid="escalate-to-cradleflow-btn"
                  onClick={() => selectStage('cradleflow')}
                  className="inline-flex cursor-pointer items-center gap-1 font-mono text-xs font-semibold text-[var(--at-signal-cyan)] hover:underline"
                >
                  Escalate to Phase 02: CradleFlow Canvas
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-4 py-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3 text-[var(--at-text-secondary)]">
              <span className="text-[var(--at-signal-cyan)]">TELEMETRY HANDOFF</span>
              <span>{corridor.label}</span>
              <span>
                POWER {liveWeather.tempC} C · {liveWeather.windMs} m/s
              </span>
              <span>
                GOES-18 {telemetry.spaceWeather.protonFluxPfu} pfu · Kp {telemetry.spaceWeather.kpIndex}
              </span>
              <span className="text-[var(--at-signal-fire)]">
                Phase 01 Triage {clearedCount}/{MISSION_WAVES.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => selectStage('triage')}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--at-border-subtle)] px-2.5 py-1 text-[var(--at-text-primary)] hover:border-[var(--at-border-bright)]"
              >
                <ArrowLeft className="size-3" />
                Return to Phase 01 Triage
              </button>
              <a
                href={fullscreenHref}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--at-signal-cyan)] px-2.5 py-1 text-[var(--at-signal-cyan)] hover:underline"
              >
                Open Fullscreen HUD
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          <iframe
            data-testid="cradleflow-embed-frame"
            title="CradleFlow Habitat Automation Simulator"
            src={embedSrc}
            className="h-[680px] w-full rounded-xl border border-[var(--at-border-subtle)] bg-[#060302] sm:h-[740px]"
          />
        </div>
      )}
    </div>
  );
}

export default MissionGameBox;
