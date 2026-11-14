import NumberFlow from '@number-flow/react';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ComponentProps, PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/utils';
import './status-bars.css';

export type StatusLevel = 'up' | 'degraded' | 'down' | 'none';

export type StatusIncident = {
  title: string;
  minutes?: number;
  status?: 'degraded' | 'down';
};

export type StatusDay = {
  date: string;
  status?: StatusLevel;
  downtime?: number;
  degraded?: number;
  uptime?: number;
  incidents?: StatusIncident[];
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const TOOLTIP_SPRING = { type: 'spring', stiffness: 520, damping: 42, mass: 0.6 } as const;

const parseIsoDate = (iso: string) =>
  Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

const subscribeToNothing = () => () => {};
function useLocale(locale?: string) {
  const detected = useSyncExternalStore(
    subscribeToNothing,
    () => Intl.DateTimeFormat().resolvedOptions().locale,
    () => 'en-US'
  );
  return locale ?? detected;
}

export function getDayStatus(day: StatusDay): StatusLevel {
  if (day.status) return day.status;
  if ((day.downtime ?? 0) > 0) return 'down';
  if ((day.degraded ?? 0) > 0) return 'degraded';
  return 'up';
}

export const getDayUptime = (day: StatusDay) =>
  day.uptime ?? Math.max(0, 100 - ((day.downtime ?? 0) / 1440) * 100);

const BAR: Record<StatusLevel, string> = {
  up: 'bg-[var(--obsidian-status-up)]/80',
  degraded: 'bg-[var(--obsidian-status-degraded)]',
  down: 'bg-[var(--obsidian-status-down)]',
  none: 'bg-[var(--obsidian-status-empty)]',
};

const DOT: Record<StatusLevel, string> = {
  up: 'bg-[var(--obsidian-status-up)]',
  degraded: 'bg-[var(--obsidian-status-degraded)]',
  down: 'bg-[var(--obsidian-status-down)]',
  none: 'bg-[var(--at-text-muted)]/50',
};

const WORD: Record<StatusLevel, string> = {
  up: 'Operational',
  degraded: 'Fallback Cache',
  down: 'Outage',
  none: 'No data',
};

const CURRENT: Record<StatusLevel, string> = {
  up: 'Live NASA Feed',
  degraded: 'Snapshot Active',
  down: 'Outage',
  none: 'No data',
};

const formatDuration = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}`
    : `${Math.max(1, Math.round(minutes))}m`;

export type StatusBarsProps = Omit<ComponentProps<'div'>, 'children'> & {
  days: StatusDay[];
  label: string;
  current?: StatusLevel;
  maxDays?: number;
  minBarWidth?: number;
  compact?: boolean;
  loading?: boolean;
  locale?: string;
};

export function StatusBars({
  days,
  label,
  current,
  maxDays = 60,
  minBarWidth = 3,
  compact = false,
  loading = false,
  locale: localeProp,
  className,
  ...rest
}: StatusBarsProps) {
  const locale = useLocale(localeProp);
  const reduce = useReducedMotion();
  const uid = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const [keyboard, setKeyboard] = useState(false);

  useEffect(() => {
    const element = wrap.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const gap = 2;
  const fits = width ? Math.floor((width + gap) / (minBarWidth + gap)) : maxDays;
  const count =
    [maxDays, 45, 30].filter((n) => n <= maxDays).find((n) => n <= fits) ?? Math.max(1, fits);

  const shown = useMemo(() => {
    const tail = days.slice(-count);
    const pad = Array.from(
      { length: Math.max(0, count - tail.length) },
      (): StatusDay => ({ date: '', status: 'none' })
    );
    return [...pad, ...tail];
  }, [days, count]);

  const measured = shown.filter((day) => day.date && getDayStatus(day) !== 'none');
  const uptime = measured.length
    ? measured.reduce((sum, day) => sum + getDayUptime(day), 0) / measured.length
    : null;
  const today = days.length ? getDayStatus(days[days.length - 1]) : 'none';
  const now = current ?? today;

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    [locale]
  );
  const longFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    [locale]
  );
  const axisFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    [locale]
  );
  const percentFormat = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0 }),
    [locale]
  );

  const formatDate = (iso: string, format: Intl.DateTimeFormat) =>
    iso ? format.format(parseIsoDate(iso)) : '';
  const percent = (value: number) => `${percentFormat.format(Math.floor(value * 100) / 100)}%`;
  const firstDate = shown[0]?.date;

  const describe = (day: StatusDay) => {
    if (!day.date) return 'No data';
    const status = getDayStatus(day);
    const parts = [formatDate(day.date, longFormat), WORD[status]];
    if (status !== 'none') parts.push(`${percent(getDayUptime(day))} uptime`);
    for (const incident of day.incidents ?? []) {
      parts.push(
        incident.minutes ? `${incident.title} for ${formatDuration(incident.minutes)}` : incident.title
      );
    }
    return parts.join(', ');
  };

  const tooltipX = useMotionValue(0);
  const tooltipShift = useTransform(
    tooltipX,
    (x) => `${-Math.min(1, Math.max(0, x / (width || 1))) * 100}%`
  );
  const visible = useRef(false);
  const point = (index: number, instant: boolean) => {
    const x = ((index + 0.5) * (width + gap)) / shown.length - gap / 2;
    if (instant || !visible.current || reduce) tooltipX.jump(x);
    else animate(tooltipX, x, TOOLTIP_SPRING);
    visible.current = true;
    setActive(index);
  };
  const hide = () => {
    visible.current = false;
    setActive(null);
    setPinned(false);
    setKeyboard(false);
  };
  const indexAt = (event: ReactPointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.min(
      shown.length - 1,
      Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * shown.length))
    );
  };

  useEffect(() => {
    if (!pinned) return;
    const away = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) {
        visible.current = false;
        setActive(null);
        setPinned(false);
      }
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [pinned]);

  const tipDay = active !== null ? shown[active] : null;
  const tipStatus = tipDay?.date ? getDayStatus(tipDay) : 'none';
  const cellId = (index: number) => `${uid}-day-${index}`;

  return (
    <div
      data-slot="status-bars"
      data-state={loading ? 'loading' : now}
      aria-busy={loading || undefined}
      className={cn(
        'obsidian-status-bars flex w-full min-w-0 flex-col text-[var(--at-text-primary)]',
        className
      )}
      {...rest}
    >
      {!compact && (
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-[13px] font-semibold tracking-[-0.01em]">
            {label}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--at-text-muted)]">
            <span aria-hidden="true" className="relative grid size-2 place-items-center">
              {!loading && (now === 'down' || now === 'degraded') && (
                <span className={cn('obsidian-status-bars__ping absolute inset-0 rounded-full', DOT[now])} />
              )}
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  loading ? 'bg-[var(--at-text-muted)]/50' : DOT[now]
                )}
              />
            </span>
            {loading ? 'Checking' : CURRENT[now]}
          </span>
        </div>
      )}

      <div
        ref={wrap}
        className="relative"
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse' && !pinned && !keyboard) hide();
        }}
      >
        <div
          role="grid"
          aria-label={`${label}, last ${count} days${uptime !== null ? `, ${percent(uptime)} uptime` : ''}`}
          aria-readonly
          aria-activedescendant={keyboard && active !== null ? cellId(active) : undefined}
          tabIndex={loading ? -1 : 0}
          data-hovering={active !== null || undefined}
          onPointerMove={(event) => {
            if (loading || event.pointerType !== 'mouse' || pinned) return;
            const index = indexAt(event);
            if (index !== active) point(index, false);
          }}
          onPointerDown={(event) => {
            if (loading || event.pointerType === 'mouse') return;
            const index = indexAt(event);
            if (pinned && index === active) return hide();
            point(index, true);
            setPinned(true);
          }}
          onFocus={(event) => {
            if (!event.currentTarget.matches(':focus-visible') || loading) return;
            setKeyboard(true);
            point(active ?? shown.length - 1, true);
          }}
          onBlur={hide}
          onKeyDown={(event) => {
            if (loading) return;
            if (event.key === 'Escape') return hide();
            const last = shown.length - 1;
            const from = active ?? last;
            const to =
              event.key === 'ArrowLeft'
                ? Math.max(0, from - 1)
                : event.key === 'ArrowRight'
                  ? Math.min(last, from + 1)
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? last
                      : event.key === 'PageUp'
                        ? Math.max(0, from - 7)
                        : event.key === 'PageDown'
                          ? Math.min(last, from + 7)
                          : null;
            if (to === null) return;
            event.preventDefault();
            setKeyboard(true);
            point(to, true);
          }}
          className="group/strip flex h-8 rounded-[3px] outline-none focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--at-border-focus)]"
          style={{ gap }}
        >
          <div role="row" className="contents">
            {shown.map((day, index) => {
              const status = day.date ? getDayStatus(day) : 'none';
              return (
                <div
                  key={day.date || `pad-${index}`}
                  id={cellId(index)}
                  role="gridcell"
                  aria-label={describe(day)}
                  data-status={status}
                  data-active={active === index || undefined}
                  className={cn(
                    'min-w-0 flex-1 origin-bottom rounded-[2px] transition-[opacity,scale] duration-150 ease-out',
                    loading
                      ? 'obsidian-status-bars__pulse bg-[var(--obsidian-status-empty)]'
                      : BAR[status],
                    'group-data-[hovering]/strip:opacity-35 data-[active]:opacity-100 data-[active]:scale-y-[1.08] motion-reduce:data-[active]:scale-y-100'
                  )}
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {tipDay && !loading && (
            <motion.div
              key="tip"
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-20"
              style={{ x: tooltipX }}
              initial={{ opacity: 0, y: reduce ? 0 : 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.14, ease: EASE_OUT }}
            >
              <motion.div className="pointer-events-auto -translate-y-full pb-2.5" style={{ x: tooltipShift }}>
                <div className="w-max max-w-64 rounded-lg border border-[var(--at-border-bright)] bg-[var(--at-surface-elevated)] px-2.5 py-2 text-[12px] leading-4 text-[var(--at-text-primary)] shadow-lg">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">
                      {tipDay.date ? formatDate(tipDay.date, dateFormat) : 'Before tracking'}
                    </span>
                    {tipStatus !== 'none' && (
                      <span className="font-mono text-[11px] tabular-nums text-[var(--at-text-muted)]">
                        {percent(getDayUptime(tipDay))}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[var(--at-text-muted)]">
                    <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', DOT[tipStatus])} />
                    {WORD[tipStatus]}
                    {tipStatus === 'down' && tipDay.downtime && !tipDay.incidents?.length ? (
                      <span>· {formatDuration(tipDay.downtime)} down</span>
                    ) : null}
                    {tipStatus === 'degraded' && tipDay.degraded && !tipDay.incidents?.length ? (
                      <span>· {formatDuration(tipDay.degraded)}</span>
                    ) : null}
                  </div>
                  {tipStatus === 'up' && !tipDay.incidents?.length && (
                    <div className="mt-1 text-[var(--at-text-dim)]">Nominal cadence</div>
                  )}
                  {tipDay.incidents?.map((incident, index) => (
                    <div
                      key={index}
                      className="mt-1.5 border-t border-[var(--at-border-subtle)] pt-1.5 text-[var(--at-text-muted)] first-of-type:mt-2"
                    >
                      {incident.title}
                      {incident.minutes ? (
                        <span className="tabular-nums text-[var(--at-text-dim)]">
                          {' '}
                          · {formatDuration(incident.minutes)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-3 font-mono text-[11px] text-[var(--at-text-dim)]">
          <span className="shrink-0 tabular-nums">
            {firstDate ? formatDate(firstDate, axisFormat) : `${count}d window`}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-[var(--at-border-subtle)]" />
          <span className="shrink-0 tabular-nums text-[var(--at-text-muted)]">
            {loading ? (
              'Loading'
            ) : uptime === null ? (
              'No data yet'
            ) : (
              <>
                <NumberFlow
                  value={Math.floor(uptime * 100) / 10000}
                  locales={locale}
                  format={{ style: 'percent', maximumFractionDigits: 2 }}
                  animated={!reduce}
                  willChange
                />{' '}
                availability
              </>
            )}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-[var(--at-border-subtle)]" />
          <span className="shrink-0">Today</span>
        </div>
      )}
    </div>
  );
}

export default StatusBars;
