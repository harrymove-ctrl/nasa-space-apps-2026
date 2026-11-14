import { ArrowUpRight, BookOpenText, CheckCircle2, Clock } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  computeIeee738Physics,
  type CorridorPreset,
  type NasaTelemetryBundle,
} from '../../data/nasaLiveClient';

export type SourceVerdict = 'live' | 'cached' | 'derived';

export interface CitedSentence {
  text: string;
  cites?: number[];
}

export interface CitedSourceRecord {
  id: number;
  title: string;
  domain: string;
  verdict: SourceVerdict;
  quote: string;
  highlightPhrase: string;
  locator: string;
  href: string;
}

export interface TelemetryBriefQuestion {
  id: string;
  question: string;
  sentences: CitedSentence[];
  sources: CitedSourceRecord[];
}

const VERDICT_LABEL: Record<SourceVerdict, string> = {
  live: 'Live Feed',
  cached: 'Snapshot',
  derived: 'Computed',
};

function renderHighlightedQuote(quote: string, phrase: string) {
  const idx = quote.indexOf(phrase);
  if (idx < 0 || !phrase) return quote;
  return (
    <>
      {quote.slice(0, idx)}
      <mark className="rounded bg-[var(--at-signal-cyan)]/20 px-1 text-[var(--at-text-primary)]">
        {quote.slice(idx, idx + phrase.length)}
      </mark>
      {quote.slice(idx + phrase.length)}
    </>
  );
}

export function SourceRail({
  bundle,
  preset,
}: {
  bundle: NasaTelemetryBundle;
  preset: CorridorPreset;
}) {
  const weather = bundle.powerByCorridor[preset.id];
  const physics = useMemo(
    () => computeIeee738Physics(preset, weather),
    [preset, weather]
  );
  const topEvent = bundle.eonetEvents[0];
  const topStudy = bundle.osdrStudies[0];

  const questions: TelemetryBriefQuestion[] = useMemo(
    () => [
      {
        id: 'ampacity',
        question: `Why did ${preset.label} ampacity shift to ${physics.deratedAmps} A?`,
        sentences: [
          {
            text: `NASA POWER meteorological grid reports ${weather.tempC} C ambient temperature and ${weather.windMs} m/s crosswind (${physics.windKmh} km/h) over ${preset.region}.`,
            cites: [1],
          },
          {
            text: `IEEE 738 thermal balance reduces continuous conductor rating by ${Math.max(0, physics.marginAmps)} A below the ${preset.nominalAmps} A nameplate limit to hold conductor temperature below 75 C.`,
            cites: [2],
          },
          {
            text: `${preset.sensorBadge} places the active ${preset.frpdMw} MW head ${preset.distanceKm} km upwind with ${physics.ttceMinutes} min estimated corridor closure.`,
            cites: [3],
          },
        ],
        sources: [
          {
            id: 1,
            title: `NASA POWER Point Grid (${weather.lat}, ${weather.lon})`,
            domain: 'power.larc.nasa.gov',
            verdict: weather.live ? 'live' : 'cached',
            quote: `Sample ${weather.date}: T2M=${weather.tempC} C, WS10M=${weather.windMs} m/s, RH2M=${weather.rhPct}% across ${preset.region}.`,
            highlightPhrase: `T2M=${weather.tempC} C, WS10M=${weather.windMs} m/s`,
            locator: weather.live ? 'POWER daily JSON · live' : `Verified cache · ${weather.date}`,
            href: 'https://power.larc.nasa.gov/api/temporal/daily/point',
          },
          {
            id: 2,
            title: 'IEEE 738 Steady-State Thermal Balance',
            domain: 'terraspan.physics',
            verdict: 'derived',
            quote: `Convective cooling at ${physics.windKmh} km/h and ${weather.tempC} C yields ${physics.deratedAmps} A rating from ${preset.nominalAmps} A baseline.`,
            highlightPhrase: `${physics.deratedAmps} A rating from ${preset.nominalAmps} A baseline`,
            locator: 'Derived · T_max=75 C',
            href: '#telemetry',
          },
          {
            id: 3,
            title: 'NASA FIRMS MODIS + VIIRS Hotspot Archive',
            domain: 'firms.modaps.eosdis.nasa.gov',
            verdict: 'cached',
            quote: `${preset.sensorBadge} fire radiative power density ${preset.frpdMw} MW across ${preset.distanceKm} km buffer gives TTCE ${physics.ttceMinutes} min.`,
            highlightPhrase: `${preset.frpdMw} MW across ${preset.distanceKm} km buffer`,
            locator: `Baseline · ${preset.sensorBadge}`,
            href: 'https://firms.modaps.eosdis.nasa.gov/active_fire/',
          },
        ],
      },
      {
        id: 'eonet',
        question: 'Which open NASA EONET hazard events are verified right now?',
        sentences: [
          {
            text: `EONET v3 currently tracks ${bundle.eonetEvents.length} open events led by ${topEvent.title} at ${topEvent.lat}, ${topEvent.lon}.`,
            cites: [1],
          },
          {
            text: `Each geometry vector feeds TerraSpan corridor watch queues alongside NASA POWER wind alignment checks.`,
            cites: [2],
          },
        ],
        sources: [
          {
            id: 1,
            title: `${topEvent.id}: ${topEvent.title}`,
            domain: 'eonet.gsfc.nasa.gov',
            verdict: topEvent.live ? 'live' : 'cached',
            quote: `Category ${topEvent.category} recorded at (${topEvent.lat}, ${topEvent.lon}) on ${topEvent.date.slice(0, 10)}.`,
            highlightPhrase: `${topEvent.category} recorded at (${topEvent.lat}, ${topEvent.lon})`,
            locator: topEvent.live ? 'EONET v3 · live' : 'EONET v3 · cache',
            href: topEvent.link,
          },
          {
            id: 2,
            title: 'NASA POWER Regional Surface Wind',
            domain: 'power.larc.nasa.gov',
            verdict: weather.live ? 'live' : 'cached',
            quote: `Ambient wind vector ${weather.windMs} m/s with relative humidity ${weather.rhPct}% shapes downwind ember spread.`,
            highlightPhrase: `wind vector ${weather.windMs} m/s`,
            locator: `Region · ${preset.label}`,
            href: 'https://power.larc.nasa.gov/',
          },
        ],
      },
      {
        id: 'space',
        question: 'Do current GOES-18 readings require EVA shelter lock?',
        sentences: [
          {
            text: `GOES-18 primary sensors measure >=10 MeV proton flux at ${bundle.spaceWeather.protonFluxPfu} pfu, X-ray class ${bundle.spaceWeather.xrayClass}, and Kp ${bundle.spaceWeather.kpIndex}.`,
            cites: [1],
          },
          {
            text: `When protons cross 10 pfu or Kp reaches 5, CradleFlow triggers Shackleton shelter protocols grounded in ${bundle.osdrTotalHits} NASA OSDR biological studies including ${topStudy.accession}.`,
            cites: [2],
          },
        ],
        sources: [
          {
            id: 1,
            title: `NOAA SWPC GOES-18 (${bundle.spaceWeather.observedAt.slice(0, 16)}Z)`,
            domain: 'services.swpc.noaa.gov',
            verdict: bundle.spaceWeather.live ? 'live' : 'cached',
            quote: `GOES-18 proton flux ${bundle.spaceWeather.protonFluxPfu} pfu (>=10 MeV), flare class ${bundle.spaceWeather.xrayClass}, planetary Kp ${bundle.spaceWeather.kpIndex}.`,
            highlightPhrase: `proton flux ${bundle.spaceWeather.protonFluxPfu} pfu`,
            locator: bundle.spaceWeather.live ? 'SWPC GOES-18 · live' : 'SWPC GOES-18 · snapshot',
            href: 'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json',
          },
          {
            id: 2,
            title: `${topStudy.accession}: ${topStudy.title}`,
            domain: 'osdr.nasa.gov',
            verdict: topStudy.live ? 'live' : 'cached',
            quote: `${topStudy.organism} radiation benchmark (${topStudy.assay}) among ${bundle.osdrTotalHits} matched OSDR assays.`,
            highlightPhrase: `${topStudy.organism} radiation benchmark`,
            locator: topStudy.live ? 'OSDR search · live' : 'OSDR catalog · snapshot',
            href: 'https://osdr.nasa.gov/osdr/data/search?term=radiation',
          },
        ],
      },
    ],
    [bundle, physics, preset, topEvent, topStudy, weather]
  );

  const [questionIdx, setQuestionIdx] = useState(0);
  const currentQ = questions[questionIdx] ?? questions[0];
  const [activeCite, setActiveCite] = useState<{ sentence: number; sourceId: number }>({
    sentence: 0,
    sourceId: currentQ.sources[0].id,
  });

  useEffect(() => {
    setActiveCite({ sentence: 0, sourceId: 1 });
  }, [questionIdx, preset.id]);

  const activeSource =
    currentQ.sources.find((s) => s.id === activeCite.sourceId) ?? currentQ.sources[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '[') {
        const prevIdx = Math.max(0, activeCite.sentence - 1);
        const src = currentQ.sentences[prevIdx]?.cites?.[0] ?? currentQ.sources[0].id;
        setActiveCite({ sentence: prevIdx, sourceId: src });
      } else if (e.key === ']') {
        const nextIdx = Math.min(currentQ.sentences.length - 1, activeCite.sentence + 1);
        const src = currentQ.sentences[nextIdx]?.cites?.[0] ?? currentQ.sources[0].id;
        setActiveCite({ sentence: nextIdx, sourceId: src });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCite.sentence, currentQ]);

  return (
    <div
      data-testid="source-rail-panel"
      className="rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] p-5 sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--at-border-subtle)] pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--at-signal-cyan)]">
            Cited Evidence Rail
          </span>
          <h3 className="mt-1 text-lg font-semibold text-[var(--at-text-primary)]">
            {currentQ.question}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setQuestionIdx(idx)}
              data-testid={`source-question-${q.id}`}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                questionIdx === idx
                  ? 'border-[var(--at-border-focus)] bg-[var(--at-surface-elevated)] text-[var(--at-text-primary)]'
                  : 'border-[var(--at-border-subtle)] text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]'
              }`}
            >
              Query 0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-3 text-[15px] leading-relaxed text-[var(--at-text-secondary)]">
            {currentQ.sentences.map((sentence, idx) => {
              const isSelected = activeCite.sentence === idx;
              return (
                <p
                  key={idx}
                  className={`rounded-lg px-2.5 py-1.5 transition-colors ${
                    isSelected ? 'bg-[var(--at-surface-elevated)] text-[var(--at-text-primary)]' : ''
                  }`}
                >
                  {sentence.text}{' '}
                  {sentence.cites?.map((citeId) => (
                    <Fragment key={citeId}>
                      <button
                        type="button"
                        onClick={() => setActiveCite({ sentence: idx, sourceId: citeId })}
                        className={`ml-1 inline-flex h-5 cursor-pointer items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-semibold transition-colors ${
                          activeCite.sourceId === citeId && isSelected
                            ? 'bg-[var(--at-signal-cyan)] text-[#081016]'
                            : 'border border-[var(--at-border-bright)] bg-[var(--at-surface-base)] text-[var(--at-text-primary)]'
                        }`}
                      >
                        [{citeId}]
                      </button>{' '}
                    </Fragment>
                  ))}
                </p>
              );
            })}
          </div>

          <div className="rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] p-4">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--at-signal-cyan)]">
                <BookOpenText className="size-3.5" />
                Quoted Passage · [{activeSource.id}]
              </span>
              <span className="font-mono text-[11px] text-[var(--at-text-dim)]">
                Keys [ and ] step claims
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--at-text-secondary)]">
              {renderHighlightedQuote(activeSource.quote, activeSource.highlightPhrase)}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {currentQ.sources.map((src) => {
            const active = src.id === activeSource.id;
            return (
              <div
                key={src.id}
                onClick={() => {
                  const sIdx = Math.max(
                    0,
                    currentQ.sentences.findIndex((s) => s.cites?.includes(src.id))
                  );
                  setActiveCite({ sentence: sIdx, sourceId: src.id });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const sIdx = Math.max(
                      0,
                      currentQ.sentences.findIndex((s) => s.cites?.includes(src.id))
                    );
                    setActiveCite({ sentence: sIdx, sourceId: src.id });
                  }
                }}
                className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                  active
                    ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)]'
                    : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] hover:border-[var(--at-border-bright)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 min-w-6 items-center justify-center rounded-md border border-[var(--at-border-bright)] px-1 font-mono text-[11px] text-[var(--at-text-primary)]">
                      S{src.id}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[var(--at-text-primary)]">
                        {src.title}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--at-text-dim)]">
                        {src.domain} · {src.locator}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase ${
                      src.verdict === 'live'
                        ? 'bg-[var(--at-signal-cyan)]/15 text-[var(--at-signal-cyan)]'
                        : 'bg-[var(--at-surface-card)] text-[var(--at-text-muted)]'
                    }`}
                  >
                    {src.verdict === 'live' ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <Clock className="size-3" />
                    )}
                    {VERDICT_LABEL[src.verdict]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <a
                    href={src.href}
                    target={src.href.startsWith('http') ? '_blank' : undefined}
                    rel={src.href.startsWith('http') ? 'noreferrer' : undefined}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--at-text-muted)] hover:text-[var(--at-text-primary)]"
                  >
                    Source
                    <ArrowUpRight className="size-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SourceRail;
