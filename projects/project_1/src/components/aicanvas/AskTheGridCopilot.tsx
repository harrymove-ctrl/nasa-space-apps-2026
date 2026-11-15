import {
  ChevronDown,
  ChevronRight,
  Cpu,
  Send,
  Sparkles,
  Square,
  Terminal,
  Wrench,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildBurningCalendar,
  executeAskTheGrid,
  type AsfSarBundle,
  type FirmsBundle,
  type GridCopilotResult,
} from '../../data/nasaExtendedClient';
import type { CorridorPreset, NasaTelemetryBundle } from '../../data/nasaLiveClient';

const PRESET_PROMPTS = [
  {
    id: 'ieee',
    label: 'IEEE 738 derating',
    text: 'Compute IEEE 738 thermal ampacity derating and fire arrival TTCE for this span.',
  },
  {
    id: 'sar',
    label: 'Smoke + ASF SAR',
    text: 'How do Sentinel-1 SAR bursts inspect this corridor under dense smoke cover?',
  },
  {
    id: 'h3',
    label: '2012 H3 baseline',
    text: 'Why does naive MODIS+VIIRS addition spike in 2012 and how does H3 harmonization correct it?',
  },
  {
    id: 'space',
    label: 'GOES-18 + OSDR',
    text: 'Correlate live NOAA GOES-18 Kp flare status with NASA OSDR radiation shelter biology.',
  },
];

export function AskTheGridCopilot({
  preset,
  bundle,
  firms,
  sar,
}: {
  preset: CorridorPreset;
  bundle: NasaTelemetryBundle;
  firms: FirmsBundle;
  sar: AsfSarBundle;
}) {
  const reduceMotion = !!useReducedMotion();
  const [input, setInput] = useState(PRESET_PROMPTS[0].text);
  const [busy, setBusy] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const calendar = useMemo(() => buildBurningCalendar(preset.id), [preset.id]);

  const [result, setResult] = useState<GridCopilotResult>(() =>
    executeAskTheGrid(PRESET_PROMPTS[0].text, preset, bundle, firms, sar, calendar)
  );

  useEffect(() => {
    setResult(executeAskTheGrid(input, preset, bundle, firms, sar, calendar));
  }, [preset, bundle, firms, sar, calendar]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const runPrompt = (promptText: string) => {
    const cleaned = promptText.trim();
    if (!cleaned) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setBusy(true);
    setInput(cleaned);
    const delay = reduceMotion ? 30 : 220;
    timerRef.current = window.setTimeout(() => {
      setResult(executeAskTheGrid(cleaned, preset, bundle, firms, sar, calendar));
      setBusy(false);
      timerRef.current = null;
    }, delay);
  };

  const stopRun = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setBusy(false);
  };

  const maxActionMs = Math.max(1, ...result.actions.map((a) => a.durationMs));

  const statusLabel = busy
    ? 'Streaming'
    : !input.trim()
      ? 'Ready for Query'
      : bundle.liveSourceCount > 0
        ? 'Live NASA + NOAA'
        : 'Offline Snapshot';

  return (
    <div
      data-testid="ask-grid-copilot"
      className="space-y-4 rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--at-signal-cyan)]" />
          <h3 className="text-base font-semibold text-[var(--at-text-primary)]">
            Ask the Grid
          </h3>
          <span
            data-testid="copilot-status-pill"
            className="rounded bg-[var(--at-surface-elevated)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]"
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_PROMPTS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              data-testid={`copilot-chip-${chip.id}`}
              onClick={() => runPrompt(chip.text)}
              className="cursor-pointer rounded-full border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-2.5 py-1 text-[11px] font-medium text-[var(--at-text-secondary)] transition-colors hover:border-[var(--at-border-focus)] hover:text-[var(--at-text-primary)]"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-[var(--at-border-base)] bg-[var(--at-surface-base)] p-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="ask-grid-input" className="sr-only">
            Ask a corridor telemetry or orbital question
          </label>
          <textarea
            id="ask-grid-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                runPrompt(input);
              }
            }}
            placeholder="Ask about IEEE 738 ampacity limits, 2012 VIIRS spikes, Sentinel-1 SAR cover, or GOES-18 Kp..."
            className="w-full resize-none bg-transparent text-xs leading-relaxed text-[var(--at-text-primary)] placeholder:text-[var(--at-text-faint)] focus:outline-none"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] text-[var(--at-text-dim)]">
            {preset.label}
          </span>
          {busy ? (
            <button
              type="button"
              onClick={stopRun}
              aria-label="Stop query"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg bg-[var(--at-signal-fire)] text-white"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              data-testid="copilot-send-btn"
              disabled={!input.trim()}
              onClick={() => runPrompt(input)}
              aria-label="Run Ask the Grid query"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg bg-[var(--at-text-primary)] text-[var(--at-surface-base)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      {!input.trim() ? (
        <p className="font-mono text-[11px] text-[var(--at-text-dim)]">
          Enter a corridor query or choose a preset prompt above to run live IEEE 738 and NASA trace resolution.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4">
          <button
            type="button"
            onClick={() => setTraceOpen((prev) => !prev)}
            data-testid="reasoning-trace-toggle"
            aria-expanded={traceOpen}
            className="flex w-full cursor-pointer items-center justify-between gap-2 text-left text-xs"
          >
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]">
              <Cpu className="size-3.5" />
              {busy ? 'Resolving live feeds...' : `Reasoning trace · ${result.elapsedMs} ms`}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--at-text-dim)]">
              {result.steps.length} steps
              {traceOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {traceOpen && (
              <motion.ol
                data-testid="reasoning-trace-steps"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden border-l border-[var(--at-border-bright)] pl-3 text-xs"
              >
                {result.steps.map((step) => (
                  <li key={step.headline} className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[var(--at-text-primary)]">
                        {step.headline}
                      </span>
                      {step.sources.map((src) => (
                        <span
                          key={src}
                          className="rounded border border-[var(--at-border-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--at-signal-cyan)]"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                    <p className="text-[var(--at-text-muted)]">{step.body}</p>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>

          <p
            data-testid="copilot-answer-text"
            className="border-t border-[var(--at-border-subtle)] pt-3 text-xs leading-relaxed text-[var(--at-text-secondary)]"
          >
            {result.answer}
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
              <Wrench className="size-3.5 text-[var(--at-signal-fire)]" />
              Tool Ledger ({result.actions.length} calls)
            </span>
            <span className="font-mono text-[10px] text-[var(--at-text-dim)]">
              Click row to inspect I/O
            </span>
          </div>

          <ul className="space-y-1.5">
            {result.actions.map((action) => {
              const expanded = expandedActionId === action.id;
              const barPct = Math.max(12, Math.round((action.durationMs / maxActionMs) * 100));
              return (
                <li
                  key={action.id}
                  className="rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)]"
                >
                  <button
                    type="button"
                    data-testid={`tool-ledger-${action.id}`}
                    onClick={() =>
                      setExpandedActionId((prev) => (prev === action.id ? null : action.id))
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-xs"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Terminal className="size-3.5 shrink-0 text-[var(--at-signal-cyan)]" />
                      <span className="truncate font-medium text-[var(--at-text-primary)]">
                        {action.doneLabel}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                      <span className="hidden text-[var(--at-text-muted)] sm:inline">
                        {action.outcome}
                      </span>
                      <span className="text-[var(--at-text-dim)]">{action.durationMs} ms</span>
                    </span>
                  </button>

                  <div className="mx-3 mb-2 h-1 overflow-hidden rounded-full bg-[var(--at-surface-elevated)]">
                    <div
                      style={{ width: `${barPct}%` }}
                      className={`h-full rounded-full ${
                        action.tone === 'warn'
                          ? 'bg-[var(--at-signal-fire)]'
                          : 'bg-[var(--at-signal-cyan)]'
                      }`}
                    />
                  </div>

                  {expanded && (
                    <div className="space-y-1 border-t border-[var(--at-border-subtle)] px-3 py-2 font-mono text-[10px] text-[var(--at-text-muted)]">
                      <div className="truncate">
                        <span className="text-[var(--at-text-dim)]">IN: </span>
                        {action.input}
                      </div>
                      <div className="truncate text-[var(--at-text-secondary)]">
                        <span className="text-[var(--at-text-dim)]">OUT: </span>
                        {action.output}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
