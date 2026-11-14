import { ArrowLeft, ArrowUpRight, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getInitialTelemetryBundle, type NasaTelemetryBundle } from '../data/nasaLiveClient';
import { CRADLEFLOW_URL, DEFENSE_MODULES, MISSION_WAVES } from '../data/terraspanData';

interface MissionGameBoxProps {
  bundle?: NasaTelemetryBundle;
  embedded?: boolean;
  onBack?: () => void;
  onOpenKnowledgeMap?: () => void;
  stressLongValues?: boolean;
}

export function MissionGameBox({
  bundle,
  embedded = false,
  onBack,
  onOpenKnowledgeMap,
  stressLongValues = false,
}: MissionGameBoxProps) {
  const telemetry = useMemo(() => bundle ?? getInitialTelemetryBundle(), [bundle]);
  const [waveIndex, setWaveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const activeWave = MISSION_WAVES[waveIndex] ?? MISSION_WAVES[0];
  const selectedOptionId = answers[activeWave.id];
  const selectedOption = activeWave.options.find((opt) => opt.id === selectedOptionId);

  const clearedCount = MISSION_WAVES.filter((wave) => {
    const pick = answers[wave.id];
    return wave.options.some((opt) => opt.id === pick && opt.correct);
  }).length;

  const liveWeather = telemetry.powerByCorridor['butte-230'];

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
                ? `LIVE POWER READOUT: ${liveWeather.tempC} C · ${liveWeather.windMs} m/s · Nominal 400 A`
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
            <a
              href={CRADLEFLOW_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[var(--at-signal-cyan)] hover:underline"
            >
              Sync with CradleFlow
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionGameBox;
