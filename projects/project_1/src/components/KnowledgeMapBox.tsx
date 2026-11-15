import { MotionConfig } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Database,
  Orbit,
  Radio,
  RefreshCw,
  ShieldAlert,
  Thermometer,
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
import { KNOWLEDGE_NODES, type KnowledgeNode } from '../data/terraspanData';
import { Endpoint } from '@/registry/default/endpoint/endpoint';
import { GraphCheck } from '@/registry/default/graph-check/graph-check';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';
import { GraphStat } from '@/registry/default/graph-stat/graph-stat';

const ICON_MAP: Record<string, typeof Orbit> = {
  firms: Radio,
  eonet: ShieldAlert,
  power: Thermometer,
  swpc: Orbit,
  osdr: Database,
};

interface KnowledgeMapBoxProps {
  onBack?: () => void;
  stressLongValues?: boolean;
  bundle?: NasaTelemetryBundle;
  firms?: FirmsBundle;
  sar?: AsfSarBundle;
  activeCorridor?: CorridorPreset;
  selectedCorridorId?: string;
  onSelectCorridor?: (id: string) => void;
  syncing?: boolean;
  lastSyncMs?: number;
  onRefreshTelemetry?: () => void;
}

export function KnowledgeMapBox({
  onBack,
  stressLongValues = false,
  bundle,
  firms,
  sar,
  activeCorridor,
  selectedCorridorId,
  onSelectCorridor,
  syncing = false,
  lastSyncMs = 0,
  onRefreshTelemetry,
}: KnowledgeMapBoxProps) {
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
  const corridorWeather =
    telemetry.powerByCorridor[corridor.id] ?? telemetry.powerByCorridor['butte-230'];
  const corridorPhysics = computeIeee738Physics(corridor, corridorWeather);

  const [selectedId, setSelectedId] = useState<string>(KNOWLEDGE_NODES[0].id);
  const selectedIndex = Math.max(
    0,
    KNOWLEDGE_NODES.findIndex((n) => n.id === selectedId)
  );
  const selected: KnowledgeNode = KNOWLEDGE_NODES[selectedIndex] ?? KNOWLEDGE_NODES[0];

  const handleCorridorClick = (id: string) => {
    setInternalCorridorId(id);
    onSelectCorridor?.(id);
  };

  const firstHotspot = firmsData.regionalMatches[0];
  const firstSar = sarData.bursts[0];
  const firstEvent = telemetry.eonetEvents[0];
  const firstOsdr = telemetry.osdrStudies[0];

  const liveMetricsByNode: Record<
    string,
    {
      score: number;
      stat: string;
      statusNote: string;
      methodPath: string;
      params: { name: string; type?: string; required?: boolean; description?: string }[];
      sampleCode: string;
      records: string[];
    }
  > = {
    firms: {
      score: firmsData.live ? 98 : 96,
      stat: `${corridor.frpdMw} MW FRPD · ${firmsData.global24hCount} 24h`,
      statusNote: firmsData.live
        ? `Live FIRMS CSV (${firmsData.latencyMs} ms)`
        : 'Verified FIRMS Snapshot',
      methodPath: '/proxy/firms/data/active_fire/modis-c6.1/csv/...24h.csv',
      params: [
        { name: 'lat_lon', type: 'bbox', required: true, description: `${corridor.lat}, ${corridor.lon} (+/- 4.5 deg)` },
        { name: 'sensor', type: 'string', description: 'MODIS C6.1 1 km + VIIRS J1 375 m' },
        {
          name: 'sar',
          type: 'granule',
          description: `${firstSar?.platform ?? 'Sentinel-1A'} ${firstSar?.beamMode ?? 'IW'} ${firstSar?.polarization ?? 'VV+VH'}`,
        },
      ],
      sampleCode: JSON.stringify(
        {
          corridor: corridor.label,
          global24hRows: firmsData.global24hCount,
          maxRegionalFrpMw: firmsData.regionalMaxFrpMw,
          nearestHotspot: firstHotspot ?? null,
          sarGranule: firstSar?.granuleName ?? null,
        },
        null,
        2
      ),
      records: [
        `FIRMS 24h US/HI detections: ${firmsData.global24hCount.toLocaleString()} (${firmsData.live ? 'live CSV' : 'snapshot'})`,
        `ASF SAR granule: ${firstSar?.granuleName ?? 'S1A_IW_GRDH'} (${firstSar?.polarization ?? 'VV+VH'})`,
        `TTCE ${corridorPhysics.ttceMinutes} min spread envelope across ${corridor.label}`,
      ],
    },
    eonet: {
      score: firstEvent?.live ? 98 : 88,
      stat: `${telemetry.eonetEvents.length} open events`,
      statusNote: firstEvent?.live ? 'Live NASA EONET v3' : 'Verified offline snapshot',
      methodPath: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=8',
      params: [
        { name: 'status', type: 'enum', required: true, description: 'open hazard feed (no key)' },
        { name: 'limit', type: 'number', description: '8 active wildfire/storm polygons' },
      ],
      sampleCode: JSON.stringify(
        telemetry.eonetEvents.slice(0, 2).map((ev) => ({
          id: ev.id,
          title: ev.title,
          category: ev.category,
          coords: [ev.lat, ev.lon],
          live: ev.live,
        })),
        null,
        2
      ),
      records: telemetry.eonetEvents.slice(0, 3).map(
        (ev) => `${ev.id}: ${ev.title} (${ev.lat}, ${ev.lon})`
      ),
    },
    power: {
      score: corridorWeather.live ? 97 : 86,
      stat: `${corridorWeather.tempC} C / ${corridorWeather.windMs} m/s`,
      statusNote: corridorWeather.live ? 'Live NASA POWER daily grid' : `Verified grid (${corridorWeather.date})`,
      methodPath: `/api/temporal/daily/point?lon=${corridor.lon}&lat=${corridor.lat}`,
      params: [
        { name: 'parameters', type: 'csv', required: true, description: 'T2M, WS10M, RH2M, PRECTOTCORR' },
        { name: 'community', type: 'enum', required: true, description: 'RE (Renewable Energy)' },
      ],
      sampleCode: JSON.stringify(
        {
          corridor: corridor.label,
          t2mC: corridorWeather.tempC,
          ws10mMs: corridorWeather.windMs,
          rhPct: corridorWeather.rhPct,
          ieee738SafeAmps: corridorPhysics.deratedAmps,
          ttceMinutes: corridorPhysics.ttceMinutes,
        },
        null,
        2
      ),
      records: [
        `${corridor.label} T2M ${corridorWeather.tempC} C · RH ${corridorWeather.rhPct}%`,
        `10 m wind cooling: ${corridorWeather.windMs} m/s (${corridorPhysics.windKmh} km/h)`,
        `IEEE 738 safe limit: ${corridorPhysics.deratedAmps} A (${corridorPhysics.riskLevel})`,
      ],
    },
    swpc: {
      score: telemetry.spaceWeather.live ? 99 : 89,
      stat: `${telemetry.spaceWeather.protonFluxPfu} pfu · Kp ${telemetry.spaceWeather.kpIndex}`,
      statusNote: telemetry.spaceWeather.live ? 'Live NOAA GOES-18 primary' : 'Verified GOES-18 snapshot',
      methodPath: 'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json',
      params: [
        { name: 'energy', type: 'band', required: true, description: '>=10 MeV integral proton flux' },
        { name: 'kp', type: 'index', description: `Planetary Kp = ${telemetry.spaceWeather.kpIndex}` },
      ],
      sampleCode: JSON.stringify(
        {
          protonFluxPfu: telemetry.spaceWeather.protonFluxPfu,
          xrayClass: telemetry.spaceWeather.xrayClass,
          kpIndex: telemetry.spaceWeather.kpIndex,
          observedAt: telemetry.spaceWeather.observedAt,
          live: telemetry.spaceWeather.live,
        },
        null,
        2
      ),
      records: [
        `GOES-18 >=10 MeV proton flux: ${telemetry.spaceWeather.protonFluxPfu} pfu`,
        `Latest solar X-ray flare class: ${telemetry.spaceWeather.xrayClass}`,
        `Planetary geomagnetic Kp index: ${telemetry.spaceWeather.kpIndex}`,
      ],
    },
    osdr: {
      score: firstOsdr?.live ? 96 : 85,
      stat: `${telemetry.osdrTotalHits} studies`,
      statusNote: firstOsdr?.live ? 'Live NASA OSDR search API' : 'Verified OSDR archive slice',
      methodPath: '/proxy/osdr/osdr/data/search?term=radiation&size=5&type=cgene',
      params: [
        { name: 'term', type: 'query', required: true, description: 'radiation' },
        { name: 'type', type: 'repo', description: 'cgene (Open Science Data Repository)' },
      ],
      sampleCode: JSON.stringify(
        {
          totalHits: telemetry.osdrTotalHits,
          topStudies: telemetry.osdrStudies.slice(0, 2).map((s) => ({
            accession: s.accession,
            organism: s.organism,
            assay: s.assay,
          })),
        },
        null,
        2
      ),
      records: telemetry.osdrStudies.slice(0, 3).map(
        (st) => `${st.accession}: ${st.organism} (${st.assay})`
      ),
    },
  };

  const activeDetails = liveMetricsByNode[selected.id] ?? liveMetricsByNode.firms;
  const confidencePct = Math.round(
    86 + (telemetry.liveSourceCount / Math.max(1, telemetry.totalSourceCount)) * 12
  );

  return (
    <MotionConfig reducedMotion="always">
      <Graph
        title="ORBITAL DATA FUSION MAP"
        data-testid="knowledge-map-box"
        className="knowledge-map-box mdxcn-surface-card"
      >
        <GraphBody className="space-y-6">
          {/* Header & Corridor Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-[var(--graph-frame)] pb-4">
            <div className="min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--graph-accent)]">
                Orbital Data Fusion Map · {corridor.label}
              </div>
              <h3 className="mt-1 font-sans text-xl font-semibold text-[var(--at-text-primary)]">
                {stressLongValues
                  ? 'Five NASA and NOAA Telemetry Channels Wired into DopaiMint and CradleFlow'
                  : 'Five NASA and NOAA telemetry layers fused into live operator briefs'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="graph-frame mdxcn-surface-base px-2.5 py-1.5 text-[11px] text-[var(--graph-muted)]">
                ascii.rest // radar
              </span>
              {onRefreshTelemetry && (
                <button
                  type="button"
                  data-testid="map-pull-live-nasa"
                  onClick={onRefreshTelemetry}
                  disabled={syncing}
                  className="inline-flex cursor-pointer items-center gap-1.5 border border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] px-3 py-1.5 text-[11px] font-medium text-[var(--at-text-primary)] disabled:cursor-default disabled:opacity-60"
                >
                  <RefreshCw
                    className={`size-3 text-[var(--at-signal-cyan)] ${syncing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>
                    {syncing
                      ? 'Syncing...'
                      : `Pull Live NASA${lastSyncMs ? ` (${lastSyncMs} ms)` : ''}`}
                  </span>
                </button>
              )}
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="graph-frame mdxcn-surface-base inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--at-text-primary)] hover:text-[var(--graph-accent)]"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Return to Overview
                </button>
              )}
            </div>
          </div>

          {/* Corridor Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CORRIDOR_PRESETS.map((preset) => {
              const active = preset.id === corridor.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`map-corridor-${preset.id}`}
                  onClick={() => handleCorridorClick(preset.id)}
                  className={`cursor-pointer border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    active
                      ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] font-semibold text-[var(--at-text-primary)]'
                      : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)] text-[var(--at-text-muted)] hover:border-[var(--at-border-bright)]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Top Telemetry KPI Strip */}
          <GraphStat
            title="TELEMETRY INDEX"
            className="mdxcn-surface-base"
            items={[
              {
                value: `${telemetry.liveSourceCount}/${telemetry.totalSourceCount}`,
                label: 'Live NASA Feeds',
                hint: 'Keyless public APIs',
                accent: true,
              },
              {
                value: `${confidencePct}%`,
                label: 'Data Integrity',
                hint: `${corridor.sensorBadge}`,
              },
              {
                value: firmsData.global24hCount.toLocaleString(),
                label: '24h FIRMS Rows',
                hint: firmsData.live ? `${firmsData.latencyMs} ms CSV` : 'Baseline cache',
              },
              {
                value: `${activeDetails.score}%`,
                label: 'Active Layer Score',
                hint: activeDetails.statusNote,
              },
            ]}
          />

          {/* Main 2-Column Split */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
            <Graph title="FIVE NASA & NOAA LAYERS" className="mdxcn-surface-base">
              <GraphBody className="space-y-2.5 px-4 py-5 sm:px-5">
                {KNOWLEDGE_NODES.map((node, index) => {
                  const Icon = ICON_MAP[node.id] ?? Orbit;
                  const active = node.id === selected.id;
                  const nodeData = liveMetricsByNode[node.id] ?? liveMetricsByNode.firms;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => setSelectedId(node.id)}
                      data-testid={`knowledge-node-${node.id}`}
                      data-active={active}
                      className={`graph-frame flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                        active
                          ? 'bg-[var(--at-surface-elevated)] ring-1 ring-[var(--at-signal-cyan)]'
                          : 'mdxcn-surface-card hover:bg-[var(--at-surface-elevated)]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center border ${
                            active
                              ? 'border-[var(--at-signal-cyan)] bg-[var(--at-signal-cyan)]/15 text-[var(--at-signal-cyan)]'
                              : 'border-[var(--at-border-subtle)] text-[var(--at-text-muted)]'
                          }`}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-sans text-sm font-semibold text-[var(--at-text-primary)]">
                            {node.label}
                          </div>
                          <div className="truncate font-mono text-[11px] text-[var(--graph-muted)]">
                            {nodeData.stat}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-xs tabular-nums text-[var(--at-text-primary)]">
                          {nodeData.score}%
                        </span>
                        <span
                          aria-hidden="true"
                          className="font-mono text-xs text-[var(--at-signal-cyan)]"
                        >
                          {active ? '[*]' : '[ ]'}
                        </span>
                      </div>
                      <span className="sr-only">Node {index + 1}</span>
                    </button>
                  );
                })}
              </GraphBody>
            </Graph>

            <div className="min-w-0 space-y-5">
              <Endpoint
                key={`${selected.id}-${corridor.id}`}
                title={`${selected.code} · ${selected.sourceName}`}
                method="GET"
                path={activeDetails.methodPath}
                params={activeDetails.params}
                blocks={[{ label: `${corridor.label} · ${activeDetails.statusNote}`, code: activeDetails.sampleCode }]}
                className="mdxcn-surface-base"
              />

              <GraphCheck
                key={`chk-${selected.id}-${corridor.id}`}
                title="VERIFIED STREAM RECORDS"
                className="mdxcn-surface-base"
                items={activeDetails.records.map((rec) => ({
                  label: rec,
                  done: true,
                }))}
              />

              <div className="graph-frame mdxcn-surface-base flex flex-wrap items-center justify-between gap-3 px-4 py-3 font-mono text-xs">
                <span className="text-[var(--graph-muted)]">
                  Resolution: {selected.resolution}
                </span>
                <a
                  href={selected.endpointUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[var(--at-text-primary)] hover:text-[var(--at-signal-cyan)] hover:underline"
                >
                  Open NASA Endpoint
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </GraphBody>
      </Graph>
    </MotionConfig>
  );
}

export default KnowledgeMapBox;
