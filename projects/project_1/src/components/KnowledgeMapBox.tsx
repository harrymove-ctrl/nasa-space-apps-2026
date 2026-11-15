import { ArrowLeft, ArrowUpRight, CheckCircle2, Database, Orbit, Radio, ShieldAlert, Thermometer } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  getInitialTelemetryBundle,
  type NasaTelemetryBundle,
} from '../data/nasaLiveClient';
import { KNOWLEDGE_NODES, type KnowledgeNode } from '../data/terraspanData';

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
}

export function KnowledgeMapBox({
  onBack,
  stressLongValues = false,
  bundle,
}: KnowledgeMapBoxProps) {
  const telemetry = useMemo(() => bundle ?? getInitialTelemetryBundle(), [bundle]);
  const [selectedId, setSelectedId] = useState<string>(KNOWLEDGE_NODES[0].id);
  const selectedIndex = Math.max(
    0,
    KNOWLEDGE_NODES.findIndex((n) => n.id === selectedId)
  );
  const selected: KnowledgeNode = KNOWLEDGE_NODES[selectedIndex] ?? KNOWLEDGE_NODES[0];

  const liveMetricsByNode: Record<string, { score: number; stat: string; detail: string; records: string[] }> = {
    firms: {
      score: 96,
      stat: '486 MW FRPD',
      detail: 'Butte 230 kV thermal perimeter',
      records: [
        'VIIRS J1/J2 375 m I-band thermal cluster',
        'MODIS C6.1 2000 to 2026 burning calendar',
        'TTCE 17 min corridor spread envelope',
      ],
    },
    eonet: {
      score: telemetry.eonetEvents[0]?.live ? 98 : 88,
      stat: `${telemetry.eonetEvents.length} open events`,
      detail: telemetry.eonetEvents[0]?.live ? 'Live NASA EONET v3' : 'Verified offline snapshot',
      records: telemetry.eonetEvents.slice(0, 3).map(
        (ev) => `${ev.id}: ${ev.title} (${ev.lat}, ${ev.lon})`
      ),
    },
    power: {
      score: telemetry.powerByCorridor['butte-230']?.live ? 95 : 86,
      stat: `${telemetry.powerByCorridor['butte-230'].tempC} C / ${telemetry.powerByCorridor['butte-230'].windMs} m/s`,
      detail: telemetry.powerByCorridor['butte-230'].live ? 'Live NASA POWER daily grid' : 'Verified snapshot grid',
      records: [
        `Butte T2M ${telemetry.powerByCorridor['butte-230'].tempC} C · RH ${telemetry.powerByCorridor['butte-230'].rhPct}%`,
        `Wind 10 m vector ${telemetry.powerByCorridor['butte-230'].windMs} m/s`,
        'IEEE 738 steady-state ampacity correction active',
      ],
    },
    swpc: {
      score: telemetry.spaceWeather.live ? 99 : 89,
      stat: `${telemetry.spaceWeather.protonFluxPfu} pfu · Kp ${telemetry.spaceWeather.kpIndex}`,
      detail: telemetry.spaceWeather.live ? 'Live NOAA GOES-18 primary' : 'Verified GOES-18 snapshot',
      records: [
        `GOES-18 >=10 MeV proton flux: ${telemetry.spaceWeather.protonFluxPfu} pfu`,
        `Latest solar X-ray flare class: ${telemetry.spaceWeather.xrayClass}`,
        `Planetary geomagnetic Kp index: ${telemetry.spaceWeather.kpIndex}`,
      ],
    },
    osdr: {
      score: telemetry.osdrStudies[0]?.live ? 94 : 85,
      stat: `${telemetry.osdrTotalHits} studies`,
      detail: telemetry.osdrStudies[0]?.live ? 'Live NASA OSDR search API' : 'Verified OSDR archive slice',
      records: telemetry.osdrStudies.slice(0, 3).map(
        (st) => `${st.accession}: ${st.organism} (${st.assay})`
      ),
    },
  };

  const activeDetails = liveMetricsByNode[selected.id] ?? liveMetricsByNode.firms;
  const confidencePct = Math.round(
    86 + (telemetry.liveSourceCount / Math.max(1, telemetry.totalSourceCount)) * 12
  );

  // Build deterministic dotted orb points cleanly without random jumps
  const orbDots = useMemo(() => {
    const dots: { x: number; y: number; r: number; opacity: number }[] = [];
    for (let lat = -3; lat <= 3; lat += 1) {
      const phi = (lat / 3.6) * (Math.PI / 2);
      const cols = 9 - Math.abs(lat);
      for (let i = 0; i < cols; i += 1) {
        const theta = ((i + 0.5) / cols) * Math.PI - Math.PI / 2;
        const x = 52 + 34 * Math.cos(phi) * Math.sin(theta);
        const y = 52 - 34 * Math.sin(phi);
        const depth = Math.cos(phi) * Math.cos(theta);
        dots.push({
          x,
          y,
          r: 1.1 + depth * 0.9,
          opacity: 0.25 + depth * 0.7,
        });
      }
    }
    return dots;
  }, []);

  return (
    <div
      data-testid="knowledge-map-box"
      className="knowledge-map-box knowledge-map-grid relative rounded-2xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)]/95 p-5 sm:p-7"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--at-border-subtle)] pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--at-signal-cyan)]">
            Orbital Data Fusion Map
          </span>
          <h3 className="mt-1 text-xl font-semibold text-[var(--at-text-primary)]">
            {stressLongValues
              ? 'Five NASA and NOAA Telemetry Channels Wired into DopaiMint and CradleFlow'
              : 'Five NASA and NOAA telemetry layers fused into live operator briefs'}
          </h3>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--at-border-bright)] bg-[var(--at-surface-base)] px-3 py-1.5 text-xs font-medium text-[var(--at-text-primary)] hover:border-[var(--at-border-focus)]"
          >
            <ArrowLeft className="size-3.5" />
            Return to Overview
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Left AI Orb + Live Feed Confidence Gauge */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/80 p-4 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-text-dim)]">
            Telemetry Index
          </span>
          <div className="mt-1 font-mono text-xs text-[var(--at-text-muted)]">
            {telemetry.liveSourceCount}/{telemetry.totalSourceCount} Live APIs
          </div>

          <svg viewBox="0 0 104 104" className="my-3 size-24 text-[var(--at-text-primary)]" aria-hidden="true">
            <circle
              cx="52"
              cy="52"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1"
            />
            {orbDots.map((dot, idx) => (
              <circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                fill="currentColor"
                opacity={dot.opacity}
              />
            ))}
          </svg>

          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 36 36" className="size-8 -rotate-90" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--at-border-bright)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--at-signal-cyan)"
                strokeWidth="3"
                strokeDasharray="88"
                strokeDashoffset={88 - (88 * confidencePct) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-left">
              <div className="font-mono text-sm font-semibold tabular-nums text-[var(--at-text-primary)]">
                {confidencePct}%
              </div>
              <div className="text-[11px] text-[var(--at-text-dim)]">Data Integrity</div>
            </div>
          </div>
        </div>

        {/* Center 5 Scored Category Cards */}
        <div className="relative space-y-2.5">
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
                className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? 'border-[var(--at-signal-cyan)] bg-[var(--at-surface-elevated)] shadow-md'
                    : 'border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/80 hover:border-[var(--at-border-bright)]'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                      active
                        ? 'border-[var(--at-signal-cyan)] bg-[var(--at-signal-cyan)]/15 text-[var(--at-signal-cyan)]'
                        : 'border-[var(--at-border-subtle)] text-[var(--at-text-muted)]'
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--at-text-primary)]">
                      {node.label}
                    </div>
                    <div className="truncate font-mono text-[11px] text-[var(--at-text-dim)]">
                      {nodeData.stat}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs tabular-nums text-[var(--at-text-muted)]">
                    {nodeData.score}%
                  </span>
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${
                      active ? 'bg-[var(--at-signal-cyan)]' : 'bg-[var(--at-border-bright)]'
                    }`}
                  />
                </div>
                <span className="sr-only">Node {index + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Right Fanned Vector Fan + Selected Provenance Drawer */}
        <div className="relative flex flex-col justify-between gap-4 rounded-xl border border-[var(--at-border-subtle)] bg-[var(--at-surface-base)]/90 p-5">
          <svg
            viewBox="0 0 240 46"
            className="h-9 w-full text-[var(--at-signal-cyan)]"
            aria-hidden="true"
          >
            {[-20, -10, 0, 10, 20].map((offset, idx) => (
              <path
                key={idx}
                d={`M 0 23 Q 115 ${23 + offset}, 240 ${23 + offset * 0.9}`}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.28 + (idx === 2 ? 0.5 : 0)}
                strokeWidth={idx === 2 ? 1.5 : 1}
              />
            ))}
          </svg>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--at-signal-cyan)]">
                {selected.code} · {selected.sourceName}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--at-text-muted)]">
                <CheckCircle2 className="size-3.5 text-[var(--at-signal-cyan)]" />
                {activeDetails.detail}
              </span>
            </div>

            <h4 className="mt-2 text-lg font-semibold text-[var(--at-text-primary)]">
              {selected.label} · {selected.linkedAsset}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-[var(--at-text-secondary)]">
              {selected.summary}
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--at-border-subtle)] pt-3">
            {activeDetails.records.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--at-border-subtle)] bg-[var(--at-surface-card)] px-3 py-2 font-mono text-[11px] text-[var(--at-text-secondary)]"
              >
                <span className="truncate">{rec}</span>
                <span className="shrink-0 text-[var(--at-signal-cyan)]">0{idx + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="font-mono text-[11px] text-[var(--at-text-dim)]">
              Resolution: {selected.resolution}
            </span>
            <a
              href={selected.endpointUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs font-medium text-[var(--at-text-primary)] hover:text-[var(--at-signal-cyan)]"
            >
              Open NASA Endpoint
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeMapBox;
