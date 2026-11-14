import { ArrowUpRight, Calendar, Layers, Radio, Satellite } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import {
  buildBurningCalendar,
  getGibsReflectanceTile,
  type AnnualBurnRecord,
  type AsfSarBundle,
  type BurningSensorMode,
  type FirmsBundle,
} from '../../data/nasaExtendedClient';
import type { CorridorPreset } from '../../data/nasaLiveClient';

const SENSOR_TABS: { id: BurningSensorMode; label: string; hint: string }[] = [
  { id: 'harmonized', label: 'H3 Harmonized', hint: 'Hexagon deduplicated 2000 to 2026 baseline' },
  { id: 'merged_naive', label: 'Raw MODIS+VIIRS', hint: 'Shows 2012 VIIRS 375 m step artifact' },
  { id: 'modis_only', label: 'MODIS 1 km', hint: 'Single Terra+Aqua C6.1 optical series' },
];

function metricForMode(row: AnnualBurnRecord, mode: BurningSensorMode): number {
  if (mode === 'harmonized') return row.harmonizedH3Index;
  if (mode === 'merged_naive') return row.naiveMergedCount;
  return row.modis1kmCount;
}

export function BurningCalendarPanel({
  preset,
  firms,
  sar,
}: {
  preset: CorridorPreset;
  firms: FirmsBundle;
  sar: AsfSarBundle;
}) {
  const reduceMotion = !!useReducedMotion();
  const [sensorMode, setSensorMode] = useState<BurningSensorMode>('harmonized');
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [gibsSrc, setGibsSrc] = useState<string>(() => getGibsReflectanceTile(preset).tileUrl);

  const calendar = useMemo(() => buildBurningCalendar(preset.id), [preset.id]);
  const gibsTile = useMemo(() => getGibsReflectanceTile(preset), [preset]);

  useEffect(() => {
    setGibsSrc(gibsTile.tileUrl);
  }, [gibsTile.tileUrl]);

  useEffect(() => {
    const peak = [...calendar].sort((a, b) => b.harmonizedH3Index - a.harmonizedH3Index)[0];
    if (peak) setSelectedYear(peak.year);
  }, [calendar]);

  const maxValue = useMemo(
    () => Math.max(1, ...calendar.map((row) => metricForMode(row, sensorMode))),
    [calendar, sensorMode]
  );

  const activeYearRow =
    calendar.find((row) => row.year === selectedYear) ?? calendar[calendar.length - 1];
  const primaryBurst = sar.bursts[0];

  return (
    <div
      data-testid="burning-calendar-panel"
      className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
    >
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--at-signal-cyan)]">
              <Calendar className="size-3.5" />
              2000 to 2026 Corridor Fire Baseline
            </div>
            <h3 className="mt-1 text-base font-semibold text-[var(--at-text-primary)]">
              H3 MODIS and VIIRS Cross Calibration ({preset.label})
            </h3>
          </div>

          <div
            role="tablist"
            aria-label="Sensor harmonization mode"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-1"
          >
            {SENSOR_TABS.map((tab) => {
              const active = sensorMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`calendar-mode-${tab.id}`}
                  onClick={() => setSensorMode(tab.id)}
                  className={`relative cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'text-[var(--at-surface-base)]'
                      : 'text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={reduceMotion ? undefined : 'burning-sensor-pill'}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-[var(--at-text-primary)]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4">
          <div
            className="flex h-32 items-end gap-1"
            role="listbox"
            aria-label="Annual burning activity bars from 2000 to 2026"
          >
            {calendar.map((row) => {
              const val = metricForMode(row, sensorMode);
              const pct = Math.max(8, Math.round((val / maxValue) * 100));
              const isSelected = row.year === activeYearRow.year;
              const isViirsStep = sensorMode === 'merged_naive' && row.year >= 2012;
              return (
                <button
                  key={row.year}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Year ${row.year}: index ${val}`}
                  data-testid={`calendar-year-${row.year}`}
                  onClick={() => setSelectedYear(row.year)}
                  className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--at-focus-ring)]"
                >
                  <span
                    style={{ height: `${pct}%` }}
                    className={`w-full rounded-t-sm transition-colors ${
                      isSelected
                        ? 'bg-[var(--at-signal-fire)]'
                        : isViirsStep
                          ? 'bg-amber-400/75 group-hover:bg-amber-300'
                          : 'bg-[var(--at-signal-cyan)]/60 group-hover:bg-[var(--at-signal-cyan)]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[var(--at-text-dim)]">
            <span>2000 MODIS Launch</span>
            <span>2012 Suomi NPP VIIRS</span>
            <span>2026 Current</span>
          </div>
        </div>

        <div
          data-testid="calendar-year-detail"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] px-4 py-3 text-xs"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-[var(--at-signal-fire)]">
                {activeYearRow.year}
              </span>
              <span className="font-semibold text-[var(--at-text-primary)]">
                H3 Index {activeYearRow.harmonizedH3Index}
              </span>
              <span className="font-mono text-[11px] text-[var(--at-text-muted)]">
                Raw Sum {activeYearRow.naiveMergedCount}
              </span>
            </div>
            <p className="text-[var(--at-text-muted)]">
              {activeYearRow.peakSeasonNote ??
                (activeYearRow.year < 2012
                  ? 'Pre-VIIRS era recorded exclusively by Terra and Aqua MODIS 1 km passes.'
                  : 'H3 Resolution 7 deduplication removes sub-kilometer VIIRS 375 m swath overlap.')}
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--at-text-dim)]">
            MODIS {activeYearRow.modis1kmCount} · VIIRS {activeYearRow.viirs375mCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--at-signal-cyan)]">
            <Satellite className="size-3.5" />
            Active Orbital Streams
          </div>
          <span className="font-mono text-[11px] text-[var(--at-text-dim)]">
            Z{gibsTile.z}/{gibsTile.y}/{gibsTile.x}
          </span>
        </div>

        <ul className="divide-y divide-[var(--at-border-subtle)] overflow-hidden rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]">
          <li className="flex items-start gap-3 px-3.5 py-2.5">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] text-[var(--at-signal-fire)]">
              <Radio className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--at-text-primary)]">
                  NASA FIRMS MODIS 24h
                </span>
                <span className="font-mono text-[11px] text-[var(--at-status-success-text)]">
                  {firms.live ? 'Live CSV' : 'Snapshot'} · {firms.latencyMs} ms
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--at-text-muted)]">
                {firms.global24hCount} CONUS+HI detections · {firms.regionalMatches.length} in sector
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3 px-3.5 py-2.5">
            <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] text-[var(--at-signal-cyan)]">
              <Layers className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--at-text-primary)]">
                  ASF Sentinel-1 SAR
                </span>
                <span className="font-mono text-[11px] text-[var(--at-signal-cyan)]">
                  {sar.live ? 'Live CMR' : 'Archive'} · {primaryBurst.polarization}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--at-text-muted)]">
                {primaryBurst.granuleName}
              </p>
            </div>
          </li>
        </ul>

        <div className="overflow-hidden rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]">
          <div className="flex items-center justify-between border-b border-[var(--at-border-subtle)] px-3.5 py-2 text-xs">
            <span className="font-medium text-[var(--at-text-primary)]">
              GIBS Terra TrueColor ({gibsTile.date})
            </span>
            <a
              href={gibsTile.worldviewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--at-signal-cyan)] hover:underline"
            >
              Worldview
              <ArrowUpRight className="size-3" />
            </a>
          </div>
          <div className="grid grid-cols-[minmax(0,220px)_minmax(0,1fr)] items-center gap-3 p-3">
            <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)]">
              <img
                src={gibsSrc}
                alt={`NASA GIBS MODIS Terra reflectance tile over ${preset.region}`}
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                onError={() => setGibsSrc('/nasa-gallery/sar-interferometry-corridor.webp')}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="min-w-0 space-y-2 text-xs">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]">
                MODIS Terra Swath
              </div>
              <p className="text-[var(--at-text-muted)]">
                Native 256 px WMTS sector tile aligned to {preset.lat.toFixed(2)}, {preset.lon.toFixed(2)}.
              </p>
              <div className="font-mono text-[11px] text-[var(--at-text-dim)]">
                Matrix Level 9 · Z{gibsTile.z}/{gibsTile.y}/{gibsTile.x}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
