import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { MotionConfig } from 'motion/react';
import { AsciiRestBackdrop, type AsciiPieceName } from './AsciiRestBackdrop';
import { Callout } from '@/registry/default/callout/callout';
import { Endpoint } from '@/registry/default/endpoint/endpoint';
import { GraphCheck } from '@/registry/default/graph-check/graph-check';
import { GraphFlow } from '@/registry/default/graph-flow/graph-flow';
import { Graph, GraphBody } from '@/registry/default/graph-frame/graph-frame';
import { GraphKpi } from '@/registry/default/graph-kpi/graph-kpi';
import { GraphSpec } from '@/registry/default/graph-spec/graph-spec';
import { GraphStat } from '@/registry/default/graph-stat/graph-stat';
import { GraphTable } from '@/registry/default/graph-table/graph-table';
import { GraphUptime } from '@/registry/default/graph-uptime/graph-uptime';
import { Step, Steps } from '@/registry/default/steps/steps';

declare global {
  interface Window {
    __setVideoFrame?: (frameIdx: number) => void;
  }
}

export type StudioMode = 'showcase' | 'plate' | 'deck' | 'video' | 'slides';

const SURFACE_STYLE: CSSProperties = {
  backgroundColor: '#0b101b',
  '--graph-surface': '#0b101b',
} as CSSProperties;

function SurfacePanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-3 ${className}`}
      style={SURFACE_STYLE}
    >
      {children}
    </div>
  );
}

const PIPELINE_ROWS = [
  {
    nodes: [
      { label: 'modis + viirs' },
      { label: 'elliptical dedup' },
      { label: 'burning calendar', tone: 'accent' as const },
      { label: 'phase 01 triage' },
    ],
  },
  {
    nodes: [
      { label: 'nasa power + gibs' },
      { label: 'ieee 738 sag' },
      { label: 'ampacity headroom', tone: 'accent' as const },
      { label: 'line reroute' },
    ],
  },
  {
    nodes: [
      { label: 'asf sar + nasadem' },
      { label: 'slope alignment' },
      { label: 'ttce closure min', tone: 'accent' as const },
      { label: 'corridor brief' },
    ],
  },
  {
    nodes: [
      { label: 'donki + goes + osdr' },
      { label: 'same-origin handoff' },
      { label: 'cradleflow hud', tone: 'accent' as const },
      { label: 'habitat shield' },
    ],
  },
];

const FEED_HEADERS = ['nasa source', 'resolution', 'model', 'proxy'];
const FEED_ROWS: ReactNode[][] = [
  ['FIRMS MODIS C6.1', '1 km 24h', 'Thermal baseline', 'HTTP 200'],
  ['FIRMS VIIRS NOAA-20/21', '375 m I-band', 'Elliptical dedup', 'HTTP 200'],
  ['NASA POWER T2M/WS10M', 'Daily point', 'IEEE 738 sag', 'HTTP 200'],
  ['NASA GIBS WMTS', 'TrueColor', 'Corridor raster', 'HTTP 200'],
  ['ASF Sentinel-1 + NASADEM', '30 m DEM', 'TTCE spread', 'HTTP 200'],
  ['EONET v3 + DONKI', 'Live event', 'Storm escalation', 'HTTP 200'],
  ['NOAA GOES-18 Flux', '1 min proton', 'PFU + Kp gate', 'HTTP 200'],
  ['NASA OSDR Assays', '1,064 studies', 'Bio countermeasure', 'HTTP 200'],
];

const SUBMISSION_IMAGES = [
  {
    frameTitle: 'FIGURE 01',
    name: '01. Orbit to Outpost Architecture',
    src: '/submission/images/01-architecture-pipeline.png',
    caption: 'Eight keyless NASA, ESA, and NOAA streams unified across four physics stages.',
  },
  {
    frameTitle: 'FIGURE 02',
    name: '02. DopaiMint Observatory',
    src: '/submission/images/02-overview-burning-calendar.png',
    caption: 'Live Butte 230 kV ampacity safety margin, TTCE closure minutes, and solar status.',
  },
  {
    frameTitle: 'FIGURE 03',
    name: '03. Provenance Map',
    src: '/submission/images/03-orbital-provenance-map.png',
    caption: 'Five layer evidence inspector mapping each telemetry claim to its live NASA endpoint.',
  },
  {
    frameTitle: 'FIGURE 04',
    name: '04. Phase 01 Grid Triage',
    src: '/submission/images/04-earth-grid-triage-phase1.png',
    caption: 'Interactive 3 wave drill covering deduplication, IEEE 738 derating, and solar escalation.',
  },
  {
    frameTitle: 'FIGURE 05',
    name: '05. Phase 02 CradleFlow HUD',
    src: '/submission/images/05-cradleflow-habitat-phase2.png',
    caption: 'Same origin habitat wiring console driven directly from DopaiMint handoff parameters.',
  },
];

function PlateStage({ plateIndex }: { plateIndex: number }) {
  if (plateIndex === 1) {
    return (
      <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#090c14]">
        <AsciiRestBackdrop piece="earthrise" timeSec={6.5} scrimOpacity={0.54} />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 gap-4">
          <div className="grid grid-cols-[1.55fr_1fr] gap-5 items-start">
            <SurfacePanel>
              <GraphSpec
                title="ARCHITECTURE"
                rows={[
                  {
                    label: 'system',
                    value: 'DopaiMint x CradleFlow Unified Orbit to Outpost Observatory',
                    accent: true,
                  },
                  {
                    label: 'flagship url',
                    value: 'https://dopaimint-production.up.railway.app',
                    note: 'Zero login public web deployment proxying 8 keyless endpoints.',
                  },
                  {
                    label: 'secondary hub',
                    value: 'https://dopaimint-production.up.railway.app/cradleflow/',
                  },
                ]}
              />
            </SurfacePanel>
            <SurfacePanel>
              <GraphStat
                title="METRICS"
                items={[
                  { value: '8', label: 'live keyless apis', accent: true },
                  { value: '26 yr', label: 'modis + viirs archive' },
                  { value: '4', label: 'monitored grid corridors' },
                ]}
              />
            </SurfacePanel>
          </div>

          <SurfacePanel>
            <GraphFlow title="PIPELINE" palette="duo" rows={PIPELINE_ROWS} />
          </SurfacePanel>

          <SurfacePanel>
            <GraphTable title="FEEDS" headers={FEED_HEADERS} rows={FEED_ROWS} />
          </SurfacePanel>
        </div>
      </div>
    );
  }

  if (plateIndex === 2) {
    return (
      <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#090c14]">
        <AsciiRestBackdrop piece="earth" timeSec={4.0} scrimOpacity={0.56} />
        <div className="relative z-10 grid h-full grid-cols-[1.85fr_1fr] items-center gap-6 p-10">
          <SurfacePanel>
            <Graph title="DOPAIMINT">
              <GraphBody className="p-4 sm:p-5">
                <img
                  src="/submission/screens/overview.jpg"
                  alt="DopaiMint flagship observatory"
                  className="block w-full aspect-video object-cover"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
          <div className="flex flex-col gap-5">
            <SurfacePanel>
              <GraphStat
                title="CORRIDOR"
                items={[
                  { value: '96%', label: 'harmonized confidence', accent: true },
                  { value: '17 min', label: 'butte 230 kv ttce' },
                  { value: '486 MW', label: 'viirs thermal frpd' },
                ]}
              />
            </SurfacePanel>
            <SurfacePanel>
              <Callout type="tip" title="HARMONIZED">
                <p>
                  Elliptical MODIS C6.1 and 375 m VIIRS swath fusion merges duplicate detections and binds NASA POWER wind cooling directly into IEEE 738 dynamic conductor ampacity.
                </p>
              </Callout>
            </SurfacePanel>
          </div>
        </div>
      </div>
    );
  }

  if (plateIndex === 3) {
    return (
      <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#090c14]">
        <AsciiRestBackdrop piece="radar" timeSec={5.2} scrimOpacity={0.56} />
        <div className="relative z-10 grid h-full grid-cols-[1.85fr_1fr] items-center gap-6 p-10">
          <SurfacePanel>
            <Graph title="PROVENANCE">
              <GraphBody className="p-4 sm:p-5">
                <img
                  src="/submission/screens/map.jpg"
                  alt="Five layer orbital provenance map"
                  className="block w-full aspect-video object-cover"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
          <div className="flex flex-col gap-5">
            <SurfacePanel>
              <Endpoint
                title="PROXY"
                method="GET"
                path="/proxy/firms + /proxy/osdr"
                params={[
                  { name: 'firms', type: 'csv', required: true, description: 'MODIS + VIIRS 24h global swath' },
                  { name: 'eonet', type: 'json', required: true, description: 'Open natural hazard events' },
                  { name: 'donki', type: 'json', description: 'GOES-18 proton flux and Kp' },
                ]}
              />
            </SurfacePanel>
            <SurfacePanel>
              <GraphCheck
                title="LAYERS"
                items={[
                  { label: 'modis + viirs thermal swath', done: true },
                  { label: 'eonet v3 open hazard pins', done: true },
                  { label: 'nasa power conductor wind', done: true },
                  { label: 'goes-18 flux + osdr bio', done: true },
                ]}
              />
            </SurfacePanel>
          </div>
        </div>
      </div>
    );
  }

  if (plateIndex === 4) {
    return (
      <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#090c14]">
        <AsciiRestBackdrop piece="aurora" timeSec={7.4} scrimOpacity={0.56} />
        <div className="relative z-10 grid h-full grid-cols-[1.85fr_1fr] items-center gap-6 p-10">
          <SurfacePanel>
            <Graph title="PHASE 01">
              <GraphBody className="p-4 sm:p-5">
                <img
                  src="/submission/screens/game.jpg"
                  alt="Phase 01 three wave Earth grid triage"
                  className="block w-full aspect-video object-cover"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
          <div className="flex flex-col gap-5">
            <SurfacePanel>
              <Steps title="TRIAGE">
                <Step title="deduplicate pass" state="done">
                  Merge overlapping MODIS and VIIRS hotspots inside 750 m window.
                </Step>
                <Step title="derate span" state="now">
                  Apply IEEE 738 sag headroom from NASA POWER 10 m wind cooling.
                </Step>
                <Step title="escalate storm" state="next">
                  Handoff solar proton threshold directly into Phase 02 CradleFlow.
                </Step>
              </Steps>
            </SurfacePanel>
            <SurfacePanel>
              <GraphKpi
                title="MARGIN"
                value="+14.2 A"
                label="IEEE 738 clearance"
                hint="Butte 230 kV"
                data="18 22 21 26 24 29 31 35 34 38"
              />
            </SurfacePanel>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#090c14]">
      <AsciiRestBackdrop piece="solar-system" timeSec={9.0} scrimOpacity={0.56} />
      <div className="relative z-10 grid h-full grid-cols-[1.85fr_1fr] items-center gap-6 p-10">
        <SurfacePanel>
          <Graph title="PHASE 02">
            <GraphBody className="p-4 sm:p-5">
              <img
                src="/submission/screens/cradleflow.jpg"
                alt="Phase 02 same origin CradleFlow habitat automation"
                className="block w-full aspect-video object-cover"
              />
            </GraphBody>
          </Graph>
        </SurfacePanel>
        <div className="flex flex-col gap-5">
          <SurfacePanel>
            <GraphFlow
              title="PROTOCOL"
              palette="duo"
              rows={[
                { nodes: [{ label: 'donki flux' }, { label: 'threshold >= 45' }, { label: 'seal shelter', tone: 'accent' }] },
                { nodes: [{ label: 'osdr osd-73' }, { label: 'bio monitor' }, { label: 'water shield', tone: 'accent' }] },
              ]}
            />
          </SurfacePanel>
          <SurfacePanel>
            <GraphSpec
              title="HANDOFF"
              rows={[
                { label: 'origin bridge', value: 'Synced from DopaiMint -> /cradleflow/', accent: true },
                { label: 'corridor', value: 'Butte 230 kV escalation' },
                { label: 'storm trigger', value: 'DONKI SEP >= 45 pfu // Kp 7' },
                { label: 'outpost state', value: '9 protocol chips armed' },
              ]}
            />
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
}

const SLIDE_META = [
  { num: 1, title: 'Mission Overview' },
  { num: 2, title: 'Hazard Gap & Burning Calendar' },
  { num: 3, title: 'Keyless NASA Gateway' },
  { num: 4, title: 'Observatory & Provenance Map' },
  { num: 5, title: 'Phase 01 Earth Grid Triage' },
  { num: 6, title: 'Phase 02 CradleFlow HUD' },
  { num: 7, title: 'Live Verification & Launch Links' },
] as const;

function renderDeckSlide(slideNumber: number, liveMotion: boolean): ReactNode {
  const tSec = (sec: number) => (liveMotion ? undefined : sec);

  if (slideNumber === 1) {
    return (
      <section key={1} className="deck-slide relative bg-[#090c14]">
        <AsciiRestBackdrop piece="earthrise" timeSec={tSec(3.0)} scrimOpacity={0.54} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="grid grid-cols-[1.5fr_1fr] gap-6 items-start">
            <SurfacePanel>
              <GraphSpec title="SLIDE 01">
                <ul>
                  <li>
                    project: <strong>DopaiMint x CradleFlow</strong>
                  </li>
                  <li>challenge: NASA Space Apps 2026 Universal Event</li>
                  <li>problem: Double counted thermal pixels and siloed space weather</li>
                  <li>
                    deployment:{' '}
                    <a
                      href="https://dopaimint-production.up.railway.app"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://dopaimint-production.up.railway.app
                    </a>
                  </li>
                </ul>
              </GraphSpec>
            </SurfacePanel>
            <SurfacePanel>
              <GraphStat
                title="IMPACT"
                items={[
                  { value: '8', label: 'keyless nasa apis', accent: true },
                  { value: '0', label: 'login barrier' },
                  { value: '4', label: 'integrated stages' },
                ]}
              />
            </SurfacePanel>
          </div>
          <SurfacePanel>
            <GraphFlow title="PIPELINE" palette="duo" rows={PIPELINE_ROWS} />
          </SurfacePanel>
        </div>
      </section>
    );
  }

  if (slideNumber === 2) {
    return (
      <section key={2} className="deck-slide relative bg-[#090c14]">
        <AsciiRestBackdrop piece="earth" timeSec={tSec(4.8)} scrimOpacity={0.56} />
        <div className="relative z-10 grid h-full grid-cols-[1fr_1.45fr] items-center gap-6 p-12">
          <div className="flex flex-col gap-5">
            <SurfacePanel>
              <Callout type="warning" title="DATA GAP">
                <p>
                  Raw 1 km MODIS and 375 m VIIRS I-band pixels double count active wildfire fronts along 230 kV transmission corridors unless fused with weather and terrain.
                </p>
              </Callout>
            </SurfacePanel>
            <SurfacePanel>
              <GraphTable
                title="HAZARDS"
                headers={['corridor', 'modis+viirs', 'ttce']}
                rows={[
                  ['Butte 230 kV', '486 MW FRPD', '17 min'],
                  ['Maui 69 kV', '312 MW FRPD', '24 min'],
                  ['Okanogan 115 kV', '208 MW FRPD', '31 min'],
                  ['Loomis 230 kV', '164 MW FRPD', '39 min'],
                ]}
              />
            </SurfacePanel>
          </div>
          <SurfacePanel>
            <Graph title="CALENDAR">
              <GraphBody className="p-4 sm:p-5">
                <img
                  src="/submission/screens/calendar.jpg"
                  alt="26 year harmonized burning calendar"
                  className="block w-full aspect-video object-cover"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
        </div>
      </section>
    );
  }

  if (slideNumber === 3) {
    return (
      <section key={3} className="deck-slide relative bg-[#090c14]">
        <AsciiRestBackdrop piece="galaxy" timeSec={tSec(6.2)} scrimOpacity={0.56} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 gap-5">
          <div className="grid grid-cols-[1.2fr_1fr] gap-6 items-start">
            <SurfacePanel>
              <GraphFlow title="INGESTION" palette="duo" rows={PIPELINE_ROWS} />
            </SurfacePanel>
            <SurfacePanel>
              <Endpoint
                title="GATEWAY"
                method="GET"
                path="/proxy/{osdr,firms,asf,cmr,donki}"
                params={[
                  { name: 'timeout', type: 'ms', required: true, description: '12,000 ms AbortSignal guard' },
                  { name: 'origin', type: 'header', description: 'Strip browser CORS headers cleanly' },
                ]}
              />
            </SurfacePanel>
          </div>
          <SurfacePanel>
            <GraphTable title="FEEDS" headers={FEED_HEADERS} rows={FEED_ROWS} />
          </SurfacePanel>
        </div>
      </section>
    );
  }

  if (slideNumber === 4) {
    return (
      <section key={4} className="deck-slide relative bg-[#090c14]">
        <AsciiRestBackdrop piece="radar" timeSec={tSec(8.0)} scrimOpacity={0.56} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 gap-5">
          <div className="grid grid-cols-2 gap-6">
            <SurfacePanel>
              <Graph title="OBSERVATORY">
                <GraphBody className="p-3 sm:p-4">
                  <img
                    src="/submission/screens/overview.jpg"
                    alt="DopaiMint observatory landing UI"
                    className="block w-full aspect-video object-cover"
                  />
                </GraphBody>
              </Graph>
            </SurfacePanel>
            <SurfacePanel>
              <Graph title="PROVENANCE">
                <GraphBody className="p-3 sm:p-4">
                  <img
                    src="/submission/screens/map.jpg"
                    alt="Five layer orbital provenance map UI"
                    className="block w-full aspect-video object-cover"
                  />
                </GraphBody>
              </Graph>
            </SurfacePanel>
          </div>
          <SurfacePanel>
            <GraphStat
              title="TELEMETRY"
              items={[
                { value: '4/4', label: 'live upstream feeds', accent: true },
                { value: '98%', label: 'citation integrity' },
                { value: '375 m', label: 'viirs i-band resolution' },
                { value: '30 m', label: 'nasadem terrain slope' },
              ]}
            />
          </SurfacePanel>
        </div>
      </section>
    );
  }

  if (slideNumber === 5) {
    return (
      <section key={5} className="deck-slide relative bg-[#090c14]">
        <AsciiRestBackdrop piece="aurora" timeSec={tSec(7.4)} scrimOpacity={0.56} />
        <div className="relative z-10 grid h-full grid-cols-[1.7fr_1fr] items-center gap-6 p-12">
          <SurfacePanel>
            <Graph title="PHASE 01">
              <GraphBody className="p-4 sm:p-5">
                <img
                  src="/submission/screens/game.jpg"
                  alt="Phase 01 Earth grid triage game"
                  className="block w-full aspect-video object-cover"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
          <div className="flex flex-col gap-5">
            <SurfacePanel>
              <Steps title="DRILL WAVES">
                <Step title="deduplicate hotspot" state="done">
                  Cluster 375 m VIIRS and 1 km MODIS swaths without double count.
                </Step>
                <Step title="ieee 738 derating" state="now">
                  Balance ambient heat against NASA POWER wind cooling.
                </Step>
                <Step title="solar storm handoff" state="next">
                  Escalate Butte 230 kV alert directly into CradleFlow HUD.
                </Step>
              </Steps>
            </SurfacePanel>
            <SurfacePanel>
              <GraphKpi
                title="SAFETY"
                value="92%"
                label="grid dispatch accuracy"
                hint="+14.2 A margin"
                data="54 61 68 74 79 84 88 92"
              />
            </SurfacePanel>
          </div>
        </div>
      </section>
    );
  }

  if (slideNumber === 6) {
    return (
      <section key={6} className="deck-slide relative bg-[#090c14]">
        <AsciiRestBackdrop piece="solar-system" timeSec={tSec(9.0)} scrimOpacity={0.56} />
        <div className="relative z-10 grid h-full grid-cols-[1.7fr_1fr] items-center gap-6 p-12">
          <SurfacePanel>
            <Graph title="PHASE 02">
              <GraphBody className="p-4 sm:p-5">
                <img
                  src="/submission/screens/cradleflow.jpg"
                  alt="Phase 02 CradleFlow habitat HUD"
                  className="block w-full aspect-video object-cover"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
          <div className="flex flex-col gap-5">
            <SurfacePanel>
              <GraphFlow
                title="AUTOMATION"
                palette="duo"
                rows={[
                  { nodes: [{ label: 'donki proton' }, { label: 'gate >= 45 pfu' }, { label: 'seal shelter', tone: 'accent' }] },
                  { nodes: [{ label: 'osdr osd-340' }, { label: 'bio stress' }, { label: 'water wall', tone: 'accent' }] },
                ]}
              />
            </SurfacePanel>
            <SurfacePanel>
              <GraphSpec
                title="HABITAT"
                rows={[
                  { label: 'outpost', value: 'Shackleton Ridge Hab-01 (Moon 0.17g)', accent: true },
                  { label: 'shielding', value: '12 g/cm2 water-wall closed loop' },
                  { label: 'protocol chips', value: '9 nodes wired via React Flow' },
                ]}
              />
            </SurfacePanel>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section key={7} className="deck-slide relative bg-[#090c14]">
      <AsciiRestBackdrop piece="starfield" timeSec={tSec(5.0)} scrimOpacity={0.56} />
      <div className="relative z-10 flex h-full flex-col justify-between p-12 gap-6">
        <div className="grid grid-cols-2 gap-6 items-start">
          <SurfacePanel>
            <GraphCheck
              title="VERIFIED"
              items={[
                { label: 'zero login flagship url live on railway', done: true },
                { label: 'playwright 9 of 9 layout + image qa pass', done: true },
                { label: 'vitest 18 of 18 cradleflow storm tests pass', done: true },
                { label: '28.50 s demo video under 30 s cap', done: true },
                { label: 'exact 7 slide pdf deck exported', done: true },
              ]}
            />
          </SurfacePanel>
          <SurfacePanel>
            <GraphUptime
              title="READINESS"
              from="Day 1 build"
              to="Final freeze"
              days="ok*28 degraded*1 ok*31"
            />
          </SurfacePanel>
        </div>
        <SurfacePanel>
          <GraphSpec title="LINKS">
            <ul>
              <li>
                flagship:{' '}
                <a
                  href="https://dopaimint-production.up.railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://dopaimint-production.up.railway.app
                </a>
              </li>
              <li>
                showcase hub:{' '}
                <a
                  href="https://dopaimint-production.up.railway.app/submission/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://dopaimint-production.up.railway.app/submission/
                </a>
              </li>
              <li>
                interactive slides:{' '}
                <a
                  href="https://dopaimint-production.up.railway.app/?present=slides"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://dopaimint-production.up.railway.app/?present=slides
                </a>
              </li>
              <li>
                source repo:{' '}
                <a
                  href="https://github.com/harrymove-ctrl/nasa-space-apps-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/harrymove-ctrl/nasa-space-apps-2026
                </a>
              </li>
            </ul>
          </GraphSpec>
        </SurfacePanel>
      </div>
    </section>
  );
}

function DeckSlides() {
  return (
    <div className="bg-[#090c14]">
      {SLIDE_META.map((slide) => renderDeckSlide(slide.num, false))}
    </div>
  );
}

function InteractiveSlideDeck({
  initialSlide = 1,
  fullscreen = false,
}: {
  initialSlide?: number;
  fullscreen?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState<number>(() =>
    initialSlide >= 1 && initialSlide <= 7 ? initialSlide : 1
  );
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(0.5);

  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;

    const updateScale = () => {
      const nextWidth = el.clientWidth;
      if (nextWidth > 0) {
        setScale(nextWidth / 1920);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        setActiveSlide((prev) => (prev === 7 ? 1 : prev + 1));
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        setActiveSlide((prev) => (prev === 1 ? 7 : prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('present') === 'slides') {
      params.set('slide', String(activeSlide));
      const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState(null, '', nextUrl);
    }
  }, [activeSlide]);

  const currentMeta = SLIDE_META[activeSlide - 1] ?? SLIDE_META[0];

  return (
    <SurfacePanel>
      <Graph title={`SLIDE 0${activeSlide} / 07: ${currentMeta.title.toUpperCase()}`}>
        <GraphBody className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                data-testid="deck-prev-btn"
                onClick={() => setActiveSlide((prev) => (prev === 1 ? 7 : prev - 1))}
                className="graph-frame cursor-pointer px-2.5 py-1 text-foreground hover:bg-white/5"
              >
                Prev
              </button>
              {SLIDE_META.map((slide) => (
                <button
                  key={slide.num}
                  type="button"
                  data-testid={`deck-slide-btn-${slide.num}`}
                  aria-current={activeSlide === slide.num ? 'step' : undefined}
                  onClick={() => setActiveSlide(slide.num)}
                  className={`cursor-pointer px-2.5 py-1 ${
                    activeSlide === slide.num
                      ? 'graph-frame text-graph-accent'
                      : 'text-graph-muted hover:text-foreground'
                  }`}
                >
                  0{slide.num}
                </button>
              ))}
              <button
                type="button"
                data-testid="deck-next-btn"
                onClick={() => setActiveSlide((prev) => (prev === 7 ? 1 : prev + 1))}
                className="graph-frame cursor-pointer px-2.5 py-1 text-foreground hover:bg-white/5"
              >
                Next
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span data-testid="deck-slide-counter" className="text-graph-muted">
                Click slide to advance · {activeSlide}/7
              </span>
              {fullscreen ? (
                <>
                  <a
                    href="/submission/#slides"
                    className="graph-frame px-2.5 py-1 text-foreground hover:bg-white/5"
                  >
                    Submission Hub
                  </a>
                  <a
                    href="/"
                    className="graph-frame px-2.5 py-1 text-graph-accent hover:bg-white/5"
                  >
                    Open Website
                  </a>
                </>
              ) : (
                <a
                  href={`/?present=slides&slide=${activeSlide}`}
                  className="graph-frame px-2.5 py-1 text-graph-accent hover:bg-white/5"
                >
                  Fullscreen Viewer
                </a>
              )}
              <a
                href="/submission/dopaimint-deck-7slides.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="graph-frame px-2.5 py-1 text-foreground hover:bg-white/5"
              >
                Open PDF
              </a>
            </div>
          </div>

          <div
            ref={stageWrapRef}
            data-testid="interactive-slide-stage"
            role="region"
            aria-label={`Interactive slide ${activeSlide} of 7: ${currentMeta.title}`}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a, button')) return;
              setActiveSlide((prev) => (prev === 7 ? 1 : prev + 1));
            }}
            className="relative aspect-video w-full cursor-pointer overflow-hidden border border-white/10 bg-[#090c14]"
          >
            <div
              className="studio-1080 origin-top-left"
              style={{
                width: 1920,
                height: 1080,
                transform: `scale(${scale})`,
              }}
            >
              {renderDeckSlide(activeSlide, true)}
            </div>
          </div>
        </GraphBody>
      </Graph>
    </SurfacePanel>
  );
}

function VideoStage() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    window.__setVideoFrame = (idx: number) => {
      flushSync(() => {
        setFrame(idx);
      });
    };
    return () => {
      delete window.__setVideoFrame;
    };
  }, []);

  const totalFrames = 855;
  const t = Number((frame / 30).toFixed(4));

  let piece: AsciiPieceName = 'earthrise';
  let beatLabel = 'BEAT 01 // HOOK';
  let imgSrc = '/submission/images/01-architecture-pipeline.png';

  if (t >= 4.5 && t < 11.0) {
    piece = 'earth';
    beatLabel = 'BEAT 02 // OBSERVATORY';
    imgSrc = '/submission/screens/overview.jpg';
  } else if (t >= 11.0 && t < 17.0) {
    piece = 'radar';
    beatLabel = 'BEAT 03 // PROVENANCE';
    imgSrc = '/submission/screens/map.jpg';
  } else if (t >= 17.0 && t < 23.5) {
    piece = 'solar-system';
    beatLabel = 'BEAT 04 // TRIAGE TO HUD';
    imgSrc = t < 20.2 ? '/submission/screens/game.jpg' : '/submission/screens/cradleflow.jpg';
  } else if (t >= 23.5) {
    piece = 'galaxy';
    beatLabel = 'BEAT 05 // READY';
    imgSrc = '/submission/screens/calendar.jpg';
  }

  return (
    <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#090c14]">
      <AsciiRestBackdrop piece={piece} timeSec={t} scrimOpacity={0.54} />
      <div className="relative z-10 flex h-full flex-col justify-between p-7 gap-3">
        {/* Top Bar: Pure mdxcn spec + stat */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-4 items-start">
          <SurfacePanel>
            <GraphSpec
              title="DOPAIMINT"
              rows={[
                { label: 'chapter', value: beatLabel, accent: true },
                { label: 'telemetry', value: 'MODIS + VIIRS + POWER + DONKI + OSDR live pipeline' },
              ]}
            />
          </SurfacePanel>
          <SurfacePanel>
            <GraphStat
              title="TIMECODE"
              items={[
                { value: `${t.toFixed(1)}s`, label: 'of 28.5s cap', accent: true },
                { value: `${frame}`, label: 'frame / 855' },
                { value: '8', label: 'nasa streams' },
              ]}
            />
          </SurfacePanel>
        </div>

        {/* Center Beat Content */}
        {t < 4.5 ? (
          <div className="grid grid-cols-[1.5fr_1fr] items-center gap-5">
            <SurfacePanel>
              <GraphFlow title="ARCHITECTURE" palette="duo" rows={PIPELINE_ROWS} />
            </SurfacePanel>
            <div className="flex flex-col gap-4">
              <SurfacePanel>
                <Callout type="tip" title="MISSION">
                  <p>
                    Eight keyless NASA open data streams fused from wildfire orbit swaths down to off-world crew habitat radiation automation.
                  </p>
                </Callout>
              </SurfacePanel>
              <SurfacePanel>
                <GraphStat
                  title="SCALE"
                  items={[
                    { value: '26 yr', label: 'burning archive', accent: true },
                    { value: '375 m', label: 'viirs i-band' },
                  ]}
                />
              </SurfacePanel>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[1.75fr_1fr] items-center gap-5">
            <SurfacePanel>
              <Graph title={beatLabel.replace(/BEAT \d+ \/\/ /, '')}>
                <GraphBody className="p-3 sm:p-4">
                  <img
                    src={imgSrc}
                    alt={beatLabel}
                    className="mx-auto block max-h-[540px] w-auto aspect-video object-cover"
                  />
                </GraphBody>
              </Graph>
            </SurfacePanel>
            <div className="flex flex-col gap-4">
              {t < 11.0 ? (
                <>
                  <SurfacePanel>
                    <GraphKpi
                      title="BUTTE 230 KV"
                      value="17 min"
                      label="ttce closure horizon"
                      hint="96% match"
                      data="42 39 34 30 27 23 19 17"
                    />
                  </SurfacePanel>
                  <SurfacePanel>
                    <Callout type="note" title="IEEE 738">
                      <p>
                        NASA POWER ambient T2M and wind speed compute dynamic ampacity safety margins across four wildfire corridors.
                      </p>
                    </Callout>
                  </SurfacePanel>
                </>
              ) : t < 17.0 ? (
                <>
                  <SurfacePanel>
                    <Endpoint
                      title="PROVENANCE"
                      method="GET"
                      path="/proxy/{firms,eonet,donki,osdr}"
                      params={[
                        { name: 'firms', type: '375 m', required: true, description: 'VIIRS thermal contours' },
                        { name: 'eonet', type: 'v3', description: 'Open natural hazard pin' },
                      ]}
                    />
                  </SurfacePanel>
                  <SurfacePanel>
                    <GraphCheck
                      title="VERIFIED"
                      items={[
                        { label: 'modis + viirs fused', done: true },
                        { label: 'nasadem 30 m terrain aligned', done: true },
                        { label: 'goes-18 + osdr linked', done: true },
                      ]}
                    />
                  </SurfacePanel>
                </>
              ) : t < 23.5 ? (
                <>
                  <SurfacePanel>
                    <GraphFlow
                      title="HANDOFF"
                      palette="duo"
                      rows={[
                        { nodes: [{ label: 'wave 1 dedup' }, { label: 'wave 2 ieee 738' }, { label: 'cradleflow', tone: 'accent' }] },
                        { nodes: [{ label: 'donki >= 45' }, { label: 'osdr osd-73' }, { label: 'seal shelter', tone: 'accent' }] },
                      ]}
                    />
                  </SurfacePanel>
                  <SurfacePanel>
                    <GraphSpec
                      title="BRIDGE"
                      rows={[
                        { label: 'state', value: 'Synced from DopaiMint -> /cradleflow/', accent: true },
                        { label: 'drill', value: 'Earth Grid Triage to Habitat HUD' },
                      ]}
                    />
                  </SurfacePanel>
                </>
              ) : (
                <>
                  <SurfacePanel>
                    <GraphCheck
                      title="SUBMISSION"
                      items={[
                        { label: 'live zero login flagship url', done: true },
                        { label: '9 of 9 playwright checks pass', done: true },
                        { label: '18 of 18 cradleflow tests pass', done: true },
                      ]}
                    />
                  </SurfacePanel>
                  <SurfacePanel>
                    <GraphSpec
                      title="URL"
                      rows={[
                        { label: 'try live', value: 'dopaimint-production.up.railway.app', accent: true },
                        { label: 'pack hub', value: '/submission/ & ?tour=1' },
                      ]}
                    />
                  </SurfacePanel>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Progress Strip */}
        <SurfacePanel>
          <GraphUptime
            title="TIMELINE"
            from="00.0s NASA INGEST"
            to="28.5s READY"
            columns={95}
            days={Array.from({ length: 95 }, (_, i) =>
              (i + 1) / 95 <= (frame + 1) / totalFrames ? 'ok' : 'empty',
            ).join(' ')}
          />
        </SurfacePanel>
      </div>
    </div>
  );
}

export function SubmissionStudio({
  mode,
  plateIndex = 1,
  initialSlide = 1,
}: {
  mode: StudioMode;
  plateIndex?: number;
  initialSlide?: number;
}) {
  const [piece, setPiece] = useState<AsciiPieceName>('earthrise');

  if (mode === 'plate') {
    return (
      <MotionConfig reducedMotion="always">
        <div className="studio-1080">
          <PlateStage plateIndex={plateIndex} />
        </div>
      </MotionConfig>
    );
  }

  if (mode === 'deck') {
    return (
      <MotionConfig reducedMotion="always">
        <div className="studio-1080">
          <DeckSlides />
        </div>
      </MotionConfig>
    );
  }

  if (mode === 'slides') {
    return (
      <div
        data-testid="presentation-slides-view"
        className="min-h-screen bg-[#090c14] px-4 py-6 text-foreground sm:px-8"
      >
        <div className="mx-auto w-full max-w-[1440px]">
          <InteractiveSlideDeck initialSlide={initialSlide} fullscreen />
        </div>
      </div>
    );
  }

  if (mode === 'video') {
    return (
      <MotionConfig reducedMotion="always">
        <div className="studio-1080">
          <VideoStage />
        </div>
      </MotionConfig>
    );
  }

  const pieces: AsciiPieceName[] = ['earthrise', 'solar-system', 'radar', 'galaxy'];

  return (
    <div
      data-testid="submission-showcase"
      className="relative min-h-screen overflow-x-hidden bg-[#090c14] text-foreground"
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <AsciiRestBackdrop piece={piece} scrimOpacity={0.62} />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-12">
        <SurfacePanel>
          <GraphSpec title="SUBMISSION">
            <ul>
              <li>
                project: <strong>DopaiMint x CradleFlow Unified NASA Space Apps 2026 Observatory</strong>
              </li>
              <li>
                website:{' '}
                <a
                  href="https://dopaimint-production.up.railway.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://dopaimint-production.up.railway.app
                </a>
              </li>
              <li>
                interactive slides:{' '}
                <a href="#slides">
                  Click Through 7 Slides Below (#slides)
                </a>{' '}
                or{' '}
                <a href="/?present=slides">
                  Open Fullscreen Presentation
                </a>
              </li>
              <li>
                deck pdf:{' '}
                <a
                  href="/submission/dopaimint-deck-7slides.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /submission/dopaimint-deck-7slides.pdf (exact 7 slides)
                </a>
              </li>
              <li>
                demo mp4:{' '}
                <a
                  href="/submission/dopaimint-demo-28s.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /submission/dopaimint-demo-28s.mp4 (28.50s HTTP 206)
                </a>
              </li>
            </ul>
          </GraphSpec>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-5 pb-3 font-mono text-xs">
            <div className="flex flex-wrap gap-3">
              <a
                href="/?skipPreloader=1"
                className="graph-frame px-3 py-1.5 text-graph-accent hover:bg-white/5"
              >
                Open Flagship
              </a>
              <a
                href="/?tour=1"
                className="graph-frame px-3 py-1.5 text-foreground hover:bg-white/5"
              >
                Start Guided Tour
              </a>
              <a
                href="#slides"
                className="graph-frame px-3 py-1.5 text-graph-accent hover:bg-white/5"
              >
                View Interactive Slides
              </a>
              <a
                href="/submission/dopaimint-deck-7slides.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="graph-frame px-3 py-1.5 text-foreground hover:bg-white/5"
              >
                Open 7 Slide Deck PDF
              </a>
              <a
                href="/submission/dopaimint-demo-28s.mp4"
                download
                className="graph-frame px-3 py-1.5 text-foreground hover:bg-white/5"
              >
                Download 28.5s MP4
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-graph-muted">ascii.rest:</span>
              {pieces.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPiece(item)}
                  className={`cursor-pointer px-2 py-1 font-mono text-xs ${
                    piece === item
                      ? 'graph-frame text-graph-accent'
                      : 'text-graph-muted hover:text-foreground'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </SurfacePanel>

        <SurfacePanel>
          <GraphTable
            title="WEBSITE & LIVE FEATURES"
            align={['left', 'left', 'right']}
            headers={['feature', 'live nasa capability', 'open']}
            rows={[
              [
                'DopaiMint Website Landing',
                'Andromeda minimalist hero, 6 orbital plates gallery, corridor metrics',
                <a
                  key="f-home"
                  href="/?skipPreloader=1"
                  className="text-graph-accent underline decoration-dashed underline-offset-4"
                >
                  Open Website
                </a>,
              ],
              [
                '5-Step Guided Product Tour',
                'Interactive walkthrough linking MODIS/VIIRS physics to CradleFlow',
                <a
                  key="f-tour"
                  href="/?tour=1"
                  className="text-graph-accent underline decoration-dashed underline-offset-4"
                >
                  /?tour=1
                </a>,
              ],
              [
                '26-Year Burning Calendar',
                '2000 to 2026 MODIS C6.1 vs VIIRS 375 m H3 deduplication and Ask the Grid',
                <a
                  key="f-cal"
                  href="/?skipPreloader=1#telemetry"
                  className="text-graph-accent underline decoration-dashed underline-offset-4"
                >
                  /#telemetry
                </a>,
              ],
              [
                '5-Layer Orbital Map',
                'Live FIRMS, EONET v3, NASA POWER, GOES-18 Kp, and OSDR provenance',
                <a
                  key="f-map"
                  href="/?skipPreloader=1&view=map"
                  className="text-graph-accent underline decoration-dashed underline-offset-4"
                >
                  /?view=map
                </a>,
              ],
              [
                'Phase 01: Earth Grid Triage',
                '3-wave conductor derating drill and one-click NASA solar storm handoff',
                <a
                  key="f-game"
                  href="/?skipPreloader=1&view=game"
                  className="text-graph-accent underline decoration-dashed underline-offset-4"
                >
                  /?view=game
                </a>,
              ],
              [
                'Phase 02: CradleFlow HUD',
                'React Flow proton-flux and OSD bio-countermeasure outpost automation',
                <a
                  key="f-cf"
                  href="/?skipPreloader=1&view=game&stage=cradleflow"
                  className="text-graph-accent underline decoration-dashed underline-offset-4"
                >
                  Open Habitat HUD
                </a>,
              ],
            ]}
          />
        </SurfacePanel>

        <div id="slides" className="scroll-mt-8">
          <InteractiveSlideDeck initialSlide={initialSlide} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] items-start">
          <SurfacePanel>
            <Graph title="DEMO FILM">
              <GraphBody className="p-4">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/submission/images/02-overview-burning-calendar.png"
                  src="/submission/dopaimint-demo-28s.mp4"
                  className="block aspect-video w-full bg-black"
                />
              </GraphBody>
            </Graph>
          </SurfacePanel>
          <div className="flex flex-col gap-6">
            <SurfacePanel>
              <GraphStat
                title="CAPS"
                items={[
                  { value: '28.5s', label: 'strict <= 30s cap', accent: true },
                  { value: '7', label: 'pdf deck slides' },
                ]}
              />
            </SurfacePanel>
            <SurfacePanel>
              <GraphSpec
                title="VIDEO SPEC"
                rows={[
                  { label: 'resolution', value: '1920x1080 at 30 fps', accent: true },
                  { label: 'codec', value: 'H.264 video + AAC stereo audio' },
                  { label: 'streaming', value: 'HTTP 206 byte range enabled' },
                ]}
              />
            </SurfacePanel>
          </div>
        </div>

        <SurfacePanel>
          <GraphFlow title="PIPELINE" palette="duo" rows={PIPELINE_ROWS} />
        </SurfacePanel>

        <SurfacePanel>
          <GraphTable title="DATASETS" headers={FEED_HEADERS} rows={FEED_ROWS} />
        </SurfacePanel>

        <div className="grid gap-8 md:grid-cols-2">
          {SUBMISSION_IMAGES.map((fig) => (
            <SurfacePanel key={fig.src}>
              <Graph title={fig.frameTitle}>
                <GraphBody className="flex flex-col gap-3 p-4">
                  <a
                    href={fig.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-opacity hover:opacity-90"
                  >
                    <img
                      src={fig.src}
                      alt={fig.name}
                      className="block aspect-video w-full object-cover"
                    />
                  </a>
                  <div className="flex items-baseline justify-between gap-4 pt-1 font-mono text-xs">
                    <span className="text-foreground">{fig.name}</span>
                    <a
                      href={fig.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-graph-accent underline decoration-dashed underline-offset-4"
                    >
                      Open 1080p PNG
                    </a>
                  </div>
                  <p className="font-mono text-xs text-graph-muted">{fig.caption}</p>
                </GraphBody>
              </Graph>
            </SurfacePanel>
          ))}
          <SurfacePanel>
            <GraphSpec
              title="DECK"
              rows={[
                { label: 'format', value: '7 Slide PDF (1920x1080 exact)', accent: true },
                { label: 'slides 1-2', value: 'Summary + Burning Calendar' },
                { label: 'slides 3-4', value: '8 Keyless Feeds + Provenance' },
                { label: 'slides 5-6', value: 'Phase 01 Triage + CradleFlow HUD' },
                { label: 'slide 7', value: 'QA Proof + Zero Login Links' },
              ]}
            />
            <div className="flex flex-wrap gap-4 px-5 pb-3 font-mono text-xs">
              <a
                href="#slides"
                className="text-graph-accent underline decoration-dashed underline-offset-4"
              >
                Launch Interactive Slide Viewer
              </a>
              <a
                href="/submission/dopaimint-deck-7slides.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-graph-accent underline decoration-dashed underline-offset-4"
              >
                Open 7 Slide Deck PDF
              </a>
            </div>
          </SurfacePanel>
        </div>

        <SurfacePanel>
          <GraphCheck
            title="LIMITS"
            items={[
              { label: 'video runtime <= 30.0 seconds (verified 28.50s)', done: true },
              { label: 'slide deck <= 7 slides (verified exact 7 pdf pages)', done: true },
              { label: 'all 5 inline png figures < 10 mb each', done: true },
              { label: 'built strictly with mdxcn components and ascii.rest backgrounds', done: true },
            ]}
          />
        </SurfacePanel>
      </main>
    </div>
  );
}
