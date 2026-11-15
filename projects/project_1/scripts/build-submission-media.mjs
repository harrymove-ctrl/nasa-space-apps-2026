import { execFileSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'submission');
const IMG_DIR = path.join(OUT_DIR, 'images');
const SCRATCH_ROOT =
  '/Users/harryphan/.gemini/antigravity/brain/3ccece75-188a-4c72-af68-df1fd73b80b6/scratch';
const FRAMES_DIR = path.join(SCRATCH_ROOT, 'video-frames');
const MOTION_SHEET_PATH = path.join(SCRATCH_ROOT, 'submission-motion-frames.png');
const DECK_SHEET_PATH = path.join(SCRATCH_ROOT, 'submission-deck-7slides-sheet.png');

const FPS = 30;
const DURATION_SEC = 28.5;
const TOTAL_FRAMES = Math.round(FPS * DURATION_SEC); // 855 frames = 28.50s

fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    '/Volumes/Dev/near-ai-chat/node_modules/playwright',
    '/Volumes/Dev/nimbus/node_modules/playwright',
  ];
  for (const modPath of candidates) {
    if (fs.existsSync(modPath)) {
      return require(modPath);
    }
  }
  throw new Error('Playwright not found in /Volumes/Dev/near-ai-chat or /Volumes/Dev/nimbus');
}

async function waitForHealth(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry until ready
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for server health at ${url}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pngDataUri(filePath) {
  const b64 = fs.readFileSync(filePath).toString('base64');
  return `data:image/png;base64,${b64}`;
}

function generateWavAudio(wavPath) {
  const sampleRate = 48000;
  const numChannels = 2;
  const totalSamples = Math.round(sampleRate * DURATION_SEC);
  const dataSize = totalSamples * numChannels * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28);
  buffer.writeUInt16LE(numChannels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const chordA = [65.41, 130.81, 196.0, 293.66, 392.0]; // C minor 9 open observatory voicings
  const chordB = [58.27, 116.54, 174.61, 261.63, 349.23]; // Bb sus
  const chordC = [77.78, 155.56, 233.08, 349.23, 466.16]; // Eb maj9
  const cueTimes = [0.05, 4.5, 11.0, 17.0, 23.5];
  const cueFreqs = [587.33, 659.25, 783.99, 880.0, 1046.5];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Harmonic progression over the 5 beats
    let freqs = chordA;
    if (t >= 11.0 && t < 17.0) freqs = chordB;
    else if (t >= 17.0) freqs = chordC;

    // Smooth global envelope
    let env = 1.0;
    if (t < 0.5) env = t / 0.5;
    else if (t > DURATION_SEC - 0.9) env = Math.max(0, (DURATION_SEC - t) / 0.9);

    // 120 BPM subtle pulse (2 Hz)
    const beatPhase = (t * 2.0) % 1.0;
    const pulse = 0.78 + 0.22 * Math.exp(-beatPhase * 4.5);

    let padL = 0;
    let padR = 0;
    for (let k = 0; k < freqs.length; k++) {
      const f = freqs[k];
      const shimmer = 1.0 + 0.0018 * Math.sin(2 * Math.PI * (0.25 + k * 0.07) * t);
      const amp = (k === 0 ? 0.24 : 0.14 / (k * 0.65)) * pulse;
      padL += amp * Math.sin(2 * Math.PI * f * shimmer * t + k * 0.4);
      padR += amp * Math.sin(2 * Math.PI * f * (2.0 - shimmer) * t + k * 0.9);
    }

    // Crisp harmonic chime cues on chapter turns
    let cueSig = 0;
    for (let c = 0; c < cueTimes.length; c++) {
      const dt = t - cueTimes[c];
      if (dt >= 0 && dt < 1.15) {
        const cf = cueFreqs[c];
        const bellEnv = Math.exp(-dt * 4.2) * Math.min(1, dt / 0.012);
        cueSig +=
          0.16 *
          bellEnv *
          (Math.sin(2 * Math.PI * cf * dt) + 0.35 * Math.sin(2 * Math.PI * cf * 2.0 * dt));
      }
    }

    const left = Math.max(-0.92, Math.min(0.92, (padL * 0.45 + cueSig * 0.55) * env));
    const right = Math.max(-0.92, Math.min(0.92, (padR * 0.45 + cueSig * 0.5) * env));

    const offset = 44 + i * 4;
    buffer.writeInt16LE(Math.round(left * 32767), offset);
    buffer.writeInt16LE(Math.round(right * 32767), offset + 2);
  }

  fs.writeFileSync(wavPath, buffer);
}

function buildArchitectureHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: #090c14;
    color: #f5f2ea;
    font-family: 'Manrope', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .canvas {
    position: relative;
    width: 1920px;
    height: 1080px;
    padding: 54px 64px 48px;
    background:
      radial-gradient(circle at 18% 12%, rgba(56, 189, 248, 0.14), transparent 46%),
      radial-gradient(circle at 86% 82%, rgba(249, 115, 22, 0.12), transparent 44%),
      linear-gradient(180deg, #090c14 0%, #0d1322 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(245, 242, 234, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(245, 242, 234, 0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
  .header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid rgba(245, 242, 234, 0.16);
    padding-bottom: 22px;
  }
  .eyebrow {
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 16px;
    letter-spacing: 0.18em;
    color: #38bdf8;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  h1 {
    font-size: 38px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #f5f2ea;
  }
  .badges {
    display: flex;
    gap: 12px;
  }
  .badge {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 15px;
    padding: 9px 16px;
    border-radius: 6px;
    border: 1px solid rgba(56, 189, 248, 0.42);
    background: rgba(16, 22, 34, 0.88);
    color: #bae6fd;
  }
  .badge.green {
    border-color: rgba(52, 211, 153, 0.45);
    color: #a7f3d0;
  }
  .columns {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 36px;
    flex: 1;
    margin: 34px 0;
  }
  .col {
    background: rgba(16, 22, 34, 0.88);
    border: 1px solid rgba(245, 242, 234, 0.16);
    border-radius: 14px;
    padding: 24px 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
  }
  .col.c1 { border-top: 4px solid #38bdf8; }
  .col.c2 { border-top: 4px solid #f97316; }
  .col.c3 { border-top: 4px solid #34d399; }
  .col.c4 { border-top: 4px solid #a78bfa; }
  .col-num {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 13px;
    letter-spacing: 0.14em;
    color: #94a3b8;
    text-transform: uppercase;
  }
  .col-title {
    font-size: 23px;
    font-weight: 700;
    color: #f5f2ea;
    margin-bottom: 6px;
  }
  .node {
    background: rgba(9, 12, 20, 0.82);
    border: 1px solid rgba(245, 242, 234, 0.14);
    border-radius: 10px;
    padding: 13px 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .node.accent-cyan { border-color: rgba(56, 189, 248, 0.45); }
  .node.accent-amber { border-color: rgba(249, 115, 22, 0.48); }
  .node.accent-green { border-color: rgba(52, 211, 153, 0.48); }
  .node-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .node-title {
    font-size: 16px;
    font-weight: 700;
    color: #f5f2ea;
  }
  .tag {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 4px;
    background: rgba(56, 189, 248, 0.14);
    color: #7dd3fc;
    white-space: nowrap;
  }
  .tag.amber { background: rgba(249, 115, 22, 0.16); color: #fdba74; }
  .tag.green { background: rgba(52, 211, 153, 0.16); color: #6ee7b7; }
  .tag.violet { background: rgba(167, 139, 250, 0.18); color: #ddd6fe; }
  .node-desc {
    font-size: 13.5px;
    line-height: 1.42;
    color: #cbd5e1;
  }
  .formula {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 12.5px;
    color: #fde68a;
    background: rgba(249, 115, 22, 0.08);
    padding: 6px 9px;
    border-radius: 5px;
    margin-top: 2px;
  }
  .arrows-overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }
  .footer {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(245, 242, 234, 0.16);
    padding-top: 18px;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 14px;
    color: #cbd5e1;
  }
  .footer strong { color: #f5f2ea; }
</style>
</head>
<body>
  <div class="canvas">
    <div class="grid-bg"></div>

    <div class="header">
      <div>
        <div class="eyebrow">TerraSpan x CradleFlow // End to End Telemetry Architecture</div>
        <h1>Unified Orbit to Outpost NASA Open Data Pipeline</h1>
      </div>
      <div class="badges">
        <div class="badge">Same Origin Reverse Proxy Core</div>
        <div class="badge green">HTTP 200 Keyless Ingestion</div>
      </div>
    </div>

    <div class="columns">
      <div class="col c1">
        <div class="col-num">Layer 01 // Sources</div>
        <div class="col-title">8 Live Keyless Feeds</div>
        <div class="node accent-cyan">
          <div class="node-head"><span class="node-title">NASA FIRMS MODIS C6.1</span><span class="tag">1 km CSV</span></div>
          <div class="node-desc">24 hour global thermal anomalies via Terra and Aqua Channel 21 brightness.</div>
        </div>
        <div class="node accent-cyan">
          <div class="node-head"><span class="node-title">VIIRS NOAA 20 and 21</span><span class="tag">375 m CSV</span></div>
          <div class="node-desc">I4 band subpixel active thermal contours from J1 and J2 polar passes.</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">NASA POWER Meteorology</span><span class="tag">Daily API</span></div>
          <div class="node-desc">Ambient T2M, 10 m wind WS10M, humidity RH2M, and irradiance feeds.</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">NASA GIBS WMTS Tiles</span><span class="tag">TrueColor</span></div>
          <div class="node-desc">MODIS Terra native reflectance rasters aligned to grid corridors.</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">ASF Sentinel 1 + NISAR SAR</span><span class="tag">CMR Slope</span></div>
          <div class="node-desc">VV and VH radar bursts paired with CMR NASADEM_HGT 30 m elevation.</div>
        </div>
        <div class="node accent-amber">
          <div class="node-head"><span class="node-title">EONET + DONKI + GOES 18 + OSDR</span><span class="tag amber">Space Rx</span></div>
          <div class="node-desc">Open Earth hazards, solar proton flux, Kp index, and 1,064 bio studies.</div>
        </div>
      </div>

      <div class="col c2">
        <div class="col-num">Layer 02 // Physics</div>
        <div class="col-title">Harmonization Core</div>
        <div class="node accent-amber">
          <div class="node-head"><span class="node-title">Elliptical Footprint Model</span><span class="tag amber">Geometry</span></div>
          <div class="node-desc">Projects oriented off nadir scan and track footprints per detection.</div>
          <div class="formula">area_km2 = pi * (scan / 2) * (track / 2)</div>
        </div>
        <div class="node accent-amber">
          <div class="node-head"><span class="node-title">Spatiotemporal Deduplication</span><span class="tag amber">750 m / 180 m</span></div>
          <div class="node-desc">Merges overlapping MODIS and VIIRS passes into single clusters without double counting.</div>
          <div class="formula">FRPD = frp / area_km2 (MW/km2) | NTAS (0..100)</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">IEEE 738 Dynamic Rating</span><span class="tag">Thermal Balance</span></div>
          <div class="node-desc">Fuses NASA POWER wind cooling, solar gain, and radiant fire heat flux into conductor headroom.</div>
          <div class="formula">Safe Ampacity Margin & Ground Clearance Sag</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">TTCE Spread Closure</span><span class="tag">Minutes</span></div>
          <div class="node-desc">Calculates Time to Corridor Encroachment using slope alignment and RH2M damping.</div>
          <div class="formula">Butte 230 kV | Maui 69 kV | Okanogan 115 kV</div>
        </div>
      </div>

      <div class="col c3">
        <div class="col-num">Layer 03 // Earth Twin</div>
        <div class="col-title">Stage 01 and Stage 02</div>
        <div class="node accent-green">
          <div class="node-head"><span class="node-title">26 Year Burning Calendar</span><span class="tag green">2000 to 2026</span></div>
          <div class="node-desc">Compares Raw MODIS plus VIIRS double counts against harmonized H3 baseline per span.</div>
        </div>
        <div class="node accent-green">
          <div class="node-head"><span class="node-title">5 Layer Provenance Map</span><span class="tag green">?view=map</span></div>
          <div class="node-desc">Binds every KPI to MODIS+VIIRS, EONET v3, POWER, GOES 18, and OSDR endpoint inspection.</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">Ask the Grid Cited Copilot</span><span class="tag">Evidence Rail</span></div>
          <div class="node-desc">Interactive reasoning trace and tool ledger grounded in 4 monitored utility corridors.</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">6 Calibrated Orbital Plates</span><span class="tag">ParallaxSlider</span></div>
          <div class="node-desc">Keyboard navigable 9:16 and 16:9 archival survey gallery over ASCII Earthrise ground.</div>
        </div>
      </div>

      <div class="col c4">
        <div class="col-num">Layer 04 // Escalation</div>
        <div class="col-title">Stage 03 and Stage 04</div>
        <div class="node">
          <div class="node-head"><span class="node-title">Phase 01: 3 Wave Triage</span><span class="tag violet">?view=game</span></div>
          <div class="node-desc">Operator clears hotspot deduplication, IEEE 738 line reroutes, and GOES 18 solar alerts.</div>
        </div>
        <div class="node">
          <div class="node-head"><span class="node-title">Same Origin Query Handoff</span><span class="tag violet">Telemetry Bridge</span></div>
          <div class="node-desc">Transfers corridor name, proton flux, Kp index, and score via URL query parameters.</div>
          <div class="formula">SYNCED FROM TERRASPAN -> /cradleflow/</div>
        </div>
        <div class="node accent-green">
          <div class="node-head"><span class="node-title">Phase 02: CradleFlow HUD</span><span class="tag green">React Flow</span></div>
          <div class="node-desc">Automates DONKI solar storm protocols, Seal Storm Shelter, and Water Wall Shield nodes.</div>
        </div>
        <div class="node accent-green">
          <div class="node-head"><span class="node-title">OSDR Bio Countermeasures</span><span class="tag green">OSD 73..714</span></div>
          <div class="node-desc">Links real NASA Open Science biological radiation responses directly to outpost power shedding.</div>
        </div>
      </div>
    </div>

    <svg class="arrows-overlay" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none">
      <defs>
        <marker id="arrowCyan" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrowAmber" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" fill="#f97316" />
        </marker>
        <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,1 L9,5 L0,9 Z" fill="#34d399" />
        </marker>
      </defs>
      <line x1="484" y1="530" x2="520" y2="530" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />
      <line x1="942" y1="530" x2="978" y2="530" stroke="#f97316" stroke-width="3" marker-end="url(#arrowAmber)" />
      <line x1="1400" y1="530" x2="1436" y2="530" stroke="#34d399" stroke-width="3" marker-end="url(#arrowGreen)" />
    </svg>

    <div class="footer">
      <div><strong>Flagship Zero Login URL:</strong> https://terraspan-production.up.railway.app</div>
      <div><strong>Direct Mirror:</strong> https://cradleflow-production.up.railway.app</div>
      <div><strong>Source:</strong> https://github.com/harrymove-ctrl/nasa-space-apps-2026</div>
    </div>
  </div>
</body>
</html>`;
}

function buildDeckHtml(images) {
  const slides = [
    {
      num: '01 / 07',
      eyebrow: 'NASA Space Apps Challenge 2026 // Official Project Brief',
      title: 'TerraSpan Digital Twin Unifies 26 Years of Orbital Fire Data Into Live Grid Action',
      body: [
        'Team Name: TerraSpan Digital Twin (Solo Team)',
        'Team Member: Harry Phan',
        'Challenge Brief: Harmonization of MODIS and VIIRS Hot Spots',
        'Live Flagship: https://terraspan-production.up.railway.app',
      ],
      metricA: ['4', 'Stage Unified Workflow'],
      metricB: ['2000 to 2026', 'Harmonized Archive'],
      image: images.overview,
      caption: 'Stage 01 Live Observatory Twin with IEEE 738 Sag Margin and Corridor Presets',
    },
    {
      num: '02 / 07',
      eyebrow: 'Operational Gap // Problem Statement',
      title: 'Separate 1 km MODIS and 375 m VIIRS Streams Double Count Hotspots and Miss Line Sag Cascades',
      body: [
        'Utilities reading raw MODIS and VIIRS counts double count single fire fronts across staggered satellite overpasses.',
        'Thick smoke blinds optical inspection while off nadir pixel stretch distorts perimeter distance to high voltage towers.',
        'Solar proton storms simultaneously degrade Earth grid stability and lunar orbital habitat radiation safety.',
        'Operators monitor four real spans: Butte 230 kV, Maui West 69 kV, Okanogan 115 kV, and Siskiyou Tie.',
      ],
      metricA: ['1 km vs 375 m', 'Pixel Scale Mismatch'],
      metricB: ['180 min', 'Deduplication Window'],
      image: images.calendar,
      caption: '26 Year MODIS C6.1 vs VIIRS 375 m Burning Activity Comparison (Butte 230 kV)',
    },
    {
      num: '03 / 07',
      eyebrow: 'Scientific Validity // Physics & Harmonization Core',
      title: 'Elliptical Footprint Clustering Harmonizes MODIS C6.1 and VIIRS J1 and J2 Into FRPD and IEEE 738 Ratings',
      body: [
        'Oriented Ellipses: area_km2 equals pi * (scan / 2) * (track / 2) to preserve off nadir pixel geometry.',
        'Spatiotemporal Merge: clusters within 750 m and 180 min into unified FRPD (MW/km2) and NTAS (0 to 100) metrics.',
        'Dynamic Line Rating: feeds NASA POWER ambient T2M, WS10M wind speed, and radiative fire heat flux into IEEE 738.',
        'Encroachment Timing: computes Time to Corridor Encroachment (TTCE) with NASADEM 30 m terrain slope factors.',
      ],
      metricA: ['486 MW/km2', 'FRPD Peak Cluster'],
      metricB: ['17 min TTCE', 'Corridor Closure Lead'],
      image: images.arch,
      caption: 'Four Stage Ingestion, Harmonization, Provenance Map, and Escalation Pipeline',
    },
    {
      num: '04 / 07',
      eyebrow: 'Stage 02 Interactive Twin // Provenance & Ask the Grid',
      title: 'Five Layer Orbital Data Fusion Links Every Corridor Alert to Live Keyless NASA Endpoints',
      body: [
        'Five Layer Map (?view=map) inspects MODIS+VIIRS, EONET v3, POWER Meteorology, GOES 18+Kp, and OSDR assays.',
        'Same origin server reverse proxies (/proxy/firms, /proxy/asf, /proxy/cmr, /proxy/osdr, /proxy/donki) return HTTP 200 live.',
        'Ask the Grid Copilot runs verifiable reasoning traces with source claim evidence rails.',
        'Operators switch between warm archival print light theme and deep obsidian night mode with zero login barriers.',
      ],
      metricA: ['5 Layers', 'Verified Claim Provenance'],
      metricB: ['Zero Login', 'Public Proxy Architecture'],
      image: images.map,
      caption: 'Stage 02 Five Layer Orbital Provenance Map (?view=map)',
    },
    {
      num: '05 / 07',
      eyebrow: 'Stage 03 Operator Training // Phase 01 Earth Grid Triage',
      title: 'Three Wave Operator Drills Validate Hotspot Deduplication and Conductor Derating Under Live Telemetry',
      body: [
        'Wave 01 calibrates MODIS C6.1 and VIIRS 375 m scan footprints so duplicated alerts collapse cleanly.',
        'Wave 02 adjusts IEEE 738 conductor ampacity headroom when ambient heat and headwind speed drop simultaneously.',
        'Wave 03 catches concurrent GOES 18 geomagnetic Kp spikes and triggers safe corridor load transfer.',
        'Clearing triage arms direct telemetry escalation from Earth grid corridors to deep space crew safety.',
      ],
      metricA: ['3 Waves', 'Interactive Physics Drills'],
      metricB: ['425 A Safe', 'IEEE 738 Line Limit'],
      image: images.game,
      caption: 'Stage 03 Three Wave Earth Grid Triage Simulation (?view=game)',
    },
    {
      num: '06 / 07',
      eyebrow: 'Stage 04 Space Weather Continuity // Phase 02 CradleFlow',
      title: 'Escalated GOES 18 and NASA DONKI Proton Storms Drive Automated OSDR Habitat Shielding',
      body: [
        'Same origin handoff transfers active Earth corridor, GOES 18 flux, Kp index, and score straight into /cradleflow/.',
        'Verified SYNCED FROM TERRASPAN banner proves live state continuity inside one unified browser workspace.',
        'Junior astronauts wire Threshold Gates to Seal Storm Shelter, Water Wall Shield, and Shed Hydroponics Load actuators.',
        'Real NASA OSDR studies (OSD 73 through OSD 714) calibrate biological stress curves inside the React Flow canvas.',
      ],
      metricA: ['Same Origin', 'Query Telemetry Handoff'],
      metricB: ['9 Protocol', 'React Flow Chips Armed'],
      image: images.cradleflow,
      caption: 'Stage 04 Phase 02 CradleFlow Embedded Inside Unified Route (?view=game&stage=cradleflow)',
    },
    {
      num: '07 / 07',
      eyebrow: 'Data Attribution & Engineering Proof // Ready for Global Judging',
      title: 'Eight Verified NASA, ESA, and NOAA Open Datasets Power Production Tested Resilience',
      body: [
        'NASA Open Data: FIRMS MODIS C6.1, FIRMS VIIRS J1/J2, GIBS WMTS, POWER API, ASF SAR, CMR NASADEM, EONET v3, DONKI, OSDR.',
        'Space Agency & Standards: ESA Copernicus Sentinel 1, NOAA SWPC GOES 18 proton/Kp feeds, IEEE Std 738, OpenInfraMap, Ask the Grid.',
        'Quality Gates: 18/18 CradleFlow Vitest unit tests, 9 Playwright visual and responsive passes, 0 px horizontal overflow.',
        'Public Access: https://terraspan-production.up.railway.app | Repo: https://github.com/harrymove-ctrl/nasa-space-apps-2026',
      ],
      metricA: ['8 Feeds', 'NASA + ESA + NOAA Cited'],
      metricB: ['18/18 + 9 QA', 'All Automated Gates Pass'],
      image: images.arch,
      caption: 'End to End Verification & Public Open Source Repository Topology',
    },
  ];

  const slidesHtml = slides
    .map(
      (s) => `
    <section class="slide">
      <div class="top-bar">
        <div class="eyebrow">${escapeHtml(s.eyebrow)}</div>
        <div class="slide-num">${escapeHtml(s.num)}</div>
      </div>
      <h2>${escapeHtml(s.title)}</h2>
      <div class="main-grid">
        <div class="left-pane">
          <div class="bullets">
            ${s.body
              .map(
                (line, idx) => `
              <div class="bullet-card">
                <div class="bullet-idx">0${idx + 1}</div>
                <div class="bullet-text">${escapeHtml(line)}</div>
              </div>`,
              )
              .join('')}
          </div>
          <div class="metrics-row">
            <div class="metric-box">
              <div class="metric-val">${escapeHtml(s.metricA[0])}</div>
              <div class="metric-lbl">${escapeHtml(s.metricA[1])}</div>
            </div>
            <div class="metric-box amber">
              <div class="metric-val">${escapeHtml(s.metricB[0])}</div>
              <div class="metric-lbl">${escapeHtml(s.metricB[1])}</div>
            </div>
          </div>
        </div>
        <div class="right-pane">
          <div class="frame-shell">
            <img src="${s.image}" alt="${escapeHtml(s.caption)}" />
          </div>
          <div class="caption">${escapeHtml(s.caption)}</div>
        </div>
      </div>
      <div class="deck-footer">
        <span>TerraSpan Digital Twin // NASA Space Apps Challenge 2026</span>
        <span>https://terraspan-production.up.railway.app</span>
      </div>
    </section>`,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  @page { size: 1920px 1080px; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1920px;
    background: #090c14;
    color: #f5f2ea;
    font-family: 'Manrope', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .slide {
    width: 1920px;
    height: 1080px;
    padding: 52px 68px 44px;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 14% 12%, rgba(56, 189, 248, 0.14), transparent 44%),
      radial-gradient(circle at 90% 85%, rgba(249, 115, 22, 0.11), transparent 42%),
      #090c14;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .slide:not(:last-child) {
    break-after: page;
    page-break-after: always;
  }
  .slide:last-child {
    break-after: avoid;
    page-break-after: avoid;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .eyebrow {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 16px;
    letter-spacing: 0.16em;
    color: #38bdf8;
    text-transform: uppercase;
  }
  .slide-num {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 16px;
    padding: 6px 14px;
    border: 1px solid rgba(245, 242, 234, 0.24);
    border-radius: 6px;
    color: #f5f2ea;
  }
  h2 {
    font-size: 40px;
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #f5f2ea;
    margin-top: 10px;
    max-width: 1680px;
  }
  .main-grid {
    display: grid;
    grid-template-columns: 740px 1fr;
    gap: 44px;
    align-items: center;
    flex: 1;
    margin: 24px 0;
  }
  .left-pane {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    gap: 20px;
  }
  .bullets {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .bullet-card {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 14px;
    align-items: start;
    background: rgba(16, 22, 34, 0.9);
    border: 1px solid rgba(245, 242, 234, 0.15);
    border-radius: 10px;
    padding: 18px 20px;
  }
  .bullet-idx {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 15px;
    font-weight: 700;
    color: #38bdf8;
    padding-top: 2px;
  }
  .bullet-text {
    font-size: 19px;
    line-height: 1.42;
    color: #e2e8f0;
  }
  .metrics-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .metric-box {
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.4);
    border-radius: 10px;
    padding: 18px 20px;
  }
  .metric-box.amber {
    background: rgba(249, 115, 22, 0.1);
    border-color: rgba(249, 115, 22, 0.42);
  }
  .metric-val {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 28px;
    font-weight: 700;
    color: #f5f2ea;
  }
  .metric-lbl {
    font-size: 14px;
    color: #cbd5e1;
    margin-top: 4px;
  }
  .right-pane {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .frame-shell {
    width: 100%;
    height: 585px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(56, 189, 248, 0.35);
    background: #0d1322;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  }
  .frame-shell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .caption {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 14px;
    color: #94a3b8;
    text-align: right;
  }
  .deck-footer {
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 14px;
    color: #94a3b8;
    border-top: 1px solid rgba(245, 242, 234, 0.15);
    padding-top: 14px;
  }
</style>
</head>
<body>
${slidesHtml}
</body>
</html>`;
}

function buildVideoHtml(images) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background: #090c14;
    color: #f5f2ea;
    font-family: 'Manrope', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  #stage {
    position: relative;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    background:
      radial-gradient(circle at 20% 15%, rgba(56, 189, 248, 0.14), transparent 48%),
      radial-gradient(circle at 82% 85%, rgba(249, 115, 22, 0.12), transparent 46%),
      #090c14;
  }
  .dot-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(245, 242, 234, 0.12) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.35;
  }
  .layer {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
  }
  /* Beat 1: Hook & Wordmark */
  #hook-layer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 180px;
    text-align: center;
  }
  .pill {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 18px;
    letter-spacing: 0.18em;
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.42);
    background: rgba(16, 22, 34, 0.85);
    padding: 10px 22px;
    border-radius: 999px;
    margin-bottom: 34px;
    text-transform: uppercase;
  }
  .hook-headline {
    font-size: 66px;
    line-height: 1.14;
    font-weight: 700;
    letter-spacing: -0.025em;
    max-width: 1380px;
  }
  .hook-accent { color: #f97316; }
  .hook-sub {
    margin-top: 26px;
    font-size: 26px;
    color: #cbd5e1;
    max-width: 1080px;
  }
  #brand-lockup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .wordmark-row {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .wordmark-chip {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 56px;
    font-weight: 800;
    letter-spacing: 0.08em;
    padding: 20px 36px;
    border-radius: 14px;
    background: #101622;
    border: 2px solid rgba(56, 189, 248, 0.5);
    color: #f5f2ea;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  }
  .wordmark-chip.fire {
    border-color: rgba(249, 115, 22, 0.65);
    color: #fed7aa;
  }
  .wordmark-sub {
    margin-top: 26px;
    font-size: 28px;
    color: #bae6fd;
    letter-spacing: 0.04em;
  }
  /* Beat 2..4: 3D Browser Showcase Rig */
  #rig-layer {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 48px;
    perspective: 1700px;
  }
  #browser-rig {
    width: 1376px;
    height: 814px;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(245, 242, 234, 0.24);
    background: #0d1322;
    box-shadow: 0 36px 90px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(56, 189, 248, 0.22);
    position: relative;
    transform-origin: center center;
  }
  .rig-chrome {
    height: 40px;
    background: #111827;
    border-bottom: 1px solid rgba(245, 242, 234, 0.14);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 13px;
    color: #94a3b8;
  }
  .dots { display: flex; gap: 7px; }
  .dot { width: 10px; height: 10px; border-radius: 999px; background: rgba(245, 242, 234, 0.26); }
  .rig-viewport {
    position: relative;
    width: 1376px;
    height: 774px;
    overflow: hidden;
  }
  .shot-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
  }
  .arch-inset {
    position: absolute;
    right: 26px;
    top: 26px;
    width: 440px;
    height: 248px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #38bdf8;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    opacity: 0;
  }
  .arch-inset img { width: 100%; height: 100%; object-fit: cover; display: block; }
  #cursor-ring {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 3px solid #38bdf8;
    background: rgba(56, 189, 248, 0.18);
    box-shadow: 0 0 24px rgba(56, 189, 248, 0.55);
    transform: translate(-50%, -50%);
    opacity: 0;
    z-index: 8;
  }
  /* Safe bottom band strictly outside rig viewport */
  #callout-bar {
    position: absolute;
    left: 220px;
    right: 220px;
    bottom: 42px;
    height: 112px;
    background: rgba(16, 22, 34, 0.96);
    border: 1px solid rgba(56, 189, 248, 0.42);
    border-radius: 14px;
    padding: 20px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    opacity: 0;
    z-index: 10;
  }
  .callout-chapter {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 14px;
    letter-spacing: 0.14em;
    color: #38bdf8;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .callout-text { flex: 1; }
  .callout-line1 {
    font-size: 25px;
    font-weight: 700;
    color: #f5f2ea;
    line-height: 1.25;
  }
  .callout-line2 {
    font-size: 18px;
    color: #cbd5e1;
    margin-top: 4px;
  }
  /* Beat 5: Impact Finale */
  #finale-layer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 140px;
  }
  .finale-title {
    font-size: 54px;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-align: center;
    margin-bottom: 42px;
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 26px;
    width: 100%;
    max-width: 1580px;
  }
  .kpi-card {
    background: rgba(16, 22, 34, 0.94);
    border: 1px solid rgba(56, 189, 248, 0.36);
    border-radius: 16px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .kpi-card.amber { border-color: rgba(249, 115, 22, 0.45); }
  .kpi-card.green { border-color: rgba(52, 211, 153, 0.45); }
  .kpi-num {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 46px;
    font-weight: 800;
    color: #f5f2ea;
  }
  .kpi-name {
    font-size: 20px;
    font-weight: 700;
    color: #38bdf8;
  }
  .kpi-card.amber .kpi-name { color: #fdba74; }
  .kpi-card.green .kpi-name { color: #6ee7b7; }
  .kpi-sub {
    font-size: 16px;
    line-height: 1.4;
    color: #cbd5e1;
  }
  .cta-url {
    margin-top: 44px;
    padding: 18px 36px;
    border-radius: 12px;
    border: 1px solid rgba(56, 189, 248, 0.55);
    background: rgba(16, 22, 34, 0.96);
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 26px;
    color: #bae6fd;
  }
  #progress-track {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 6px;
    background: rgba(245, 242, 234, 0.08);
    z-index: 20;
  }
  #progress-fill {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #38bdf8 0%, #f97316 55%, #34d399 100%);
  }
</style>
</head>
<body>
  <div id="stage">
    <div class="dot-grid"></div>

    <div id="hook-layer" class="layer">
      <div class="pill">NASA Space Apps Challenge 2026</div>
      <div class="hook-headline">
        Wildfire plumes, sagged 230 kV lines, and solar proton storms <span class="hook-accent">outpace disconnected satellite feeds</span>.
      </div>
      <div class="hook-sub">
        Give grid crews and orbital teams one verified NASA physics pipeline with zero login delay.
      </div>
    </div>

    <div id="brand-lockup" class="layer">
      <div class="pill">Harmonization of MODIS and VIIRS Hot Spots</div>
      <div class="wordmark-row">
        <div class="wordmark-chip">TERRASPAN</div>
        <div class="wordmark-chip fire">CRADLEFLOW</div>
      </div>
      <div class="wordmark-sub">26 Year MODIS C6.1 + VIIRS 375 m Digital Twin to Space Weather Shielding</div>
    </div>

    <div id="rig-layer" class="layer">
      <div id="browser-rig">
        <div class="rig-chrome">
          <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
          <div id="rig-url">https://terraspan-production.up.railway.app</div>
          <div>ZERO LOGIN // LIVE TELEMETRY</div>
        </div>
        <div class="rig-viewport">
          <img id="img-overview" class="shot-img" src="${images.overview}" alt="" />
          <img id="img-calendar" class="shot-img" src="${images.calendar}" alt="" />
          <img id="img-map" class="shot-img" src="${images.map}" alt="" />
          <img id="img-game" class="shot-img" src="${images.game}" alt="" />
          <img id="img-cradle" class="shot-img" src="${images.cradleflow}" alt="" />
          <div id="arch-inset" class="arch-inset"><img src="${images.arch}" alt="" /></div>
          <div id="cursor-ring"></div>
        </div>
      </div>
    </div>

    <div id="callout-bar">
      <div id="callout-ch" class="callout-chapter">Stage 01 // Harmonize</div>
      <div class="callout-text">
        <div id="callout-l1" class="callout-line1"></div>
        <div id="callout-l2" class="callout-line2"></div>
      </div>
    </div>

    <div id="finale-layer" class="layer">
      <div class="pill">Verified Physics & Open NASA Data</div>
      <div class="finale-title">Tested Orbit to Outpost Resilience Open Now</div>
      <div class="kpi-grid">
        <div class="kpi-card amber">
          <div class="kpi-num">486 MW</div>
          <div class="kpi-name">FRPD Peak Cluster</div>
          <div class="kpi-sub">Elliptical MODIS 1 km and VIIRS 375 m footprint deduplication across 2000 to 2026.</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">17 min</div>
          <div class="kpi-name">TTCE Spread Warning</div>
          <div class="kpi-sub">Combines NASADEM 30 m terrain slope and NASA POWER wind alignment per span.</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-num">18.4%</div>
          <div class="kpi-name">IEEE 738 Margin Saved</div>
          <div class="kpi-sub">Real time conductor ampacity headroom before hazardous transmission sag occurs.</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">8 Feeds</div>
          <div class="kpi-name">NASA + ESA + NOAA</div>
          <div class="kpi-sub">FIRMS, GIBS, POWER, ASF SAR, CMR, EONET v3, DONKI, GOES 18, and OSDR assays.</div>
        </div>
      </div>
      <div class="cta-url">https://terraspan-production.up.railway.app</div>
    </div>

    <div id="progress-track"><div id="progress-fill"></div></div>
  </div>

  <script>
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
    const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

    window.__setFrame = function(frame) {
      const total = ${TOTAL_FRAMES};
      const t = frame / ${FPS};

      const hook = document.getElementById('hook-layer');
      const brand = document.getElementById('brand-lockup');
      const rigLayer = document.getElementById('rig-layer');
      const rig = document.getElementById('browser-rig');
      const rigUrl = document.getElementById('rig-url');
      const callout = document.getElementById('callout-bar');
      const ch = document.getElementById('callout-ch');
      const l1 = document.getElementById('callout-l1');
      const l2 = document.getElementById('callout-l2');
      const finale = document.getElementById('finale-layer');
      const archInset = document.getElementById('arch-inset');
      const cursor = document.getElementById('cursor-ring');
      const fill = document.getElementById('progress-fill');

      const imgs = {
        overview: document.getElementById('img-overview'),
        calendar: document.getElementById('img-calendar'),
        map: document.getElementById('img-map'),
        game: document.getElementById('img-game'),
        cradle: document.getElementById('img-cradle'),
      };

      fill.style.width = ((frame / (total - 1)) * 100).toFixed(2) + '%';

      // Reset visibilities
      hook.style.opacity = '0';
      brand.style.opacity = '0';
      rigLayer.style.opacity = '0';
      callout.style.opacity = '0';
      finale.style.opacity = '0';
      archInset.style.opacity = '0';
      cursor.style.opacity = '0';
      Object.values(imgs).forEach((el) => { el.style.opacity = '0'; });

      // Beat 1A: 0.00s .. 2.60s (Frames 0..77) Hook
      if (t < 2.6) {
        const inP = easeOut(t / 0.35);
        const outP = t > 2.25 ? 1 - (t - 2.25) / 0.35 : 1;
        hook.style.opacity = String(clamp(inP * outP, 0, 1));
        hook.style.transform = 'translateY(' + lerp(22, 0, inP).toFixed(1) + 'px)';
        return;
      }

      // Beat 1B: 2.60s .. 4.50s (Frames 78..134) Brand Lockup
      if (t < 4.5) {
        const local = t - 2.6;
        const inP = easeOut(local / 0.4);
        const outP = t > 4.15 ? 1 - (t - 4.15) / 0.35 : 1;
        brand.style.opacity = String(clamp(inP * outP, 0, 1));
        brand.style.transform = 'scale(' + lerp(0.92, 1.0, inP).toFixed(4) + ')';
        return;
      }

      // Beats 2..4: 4.50s .. 23.50s (Frames 135..704)
      if (t < 23.5) {
        const rigOut = t > 23.1 ? 1 - (t - 23.1) / 0.4 : 1;
        rigLayer.style.opacity = String(clamp(rigOut, 0, 1));

        // Beat 2: 4.50s .. 11.00s Overview + Burning Calendar
        if (t < 11.0) {
          const lt = t - 4.5;
          const tiltP = easeOut(lt / 1.4);
          const rx = lerp(9, 0, tiltP);
          const ry = lerp(-6, 0, tiltP);
          const sc = lerp(0.95, 1.0, tiltP);
          rig.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
          rigUrl.textContent = 'https://terraspan-production.up.railway.app/#telemetry';

          const calBlend = clamp((lt - 3.1) / 0.55, 0, 1);
          imgs.overview.style.opacity = String(1 - calBlend);
          imgs.calendar.style.opacity = String(calBlend);
          archInset.style.opacity = lt > 1.2 && lt < 5.8 ? String(easeOut((lt - 1.2) / 0.4)) : '0';

          callout.style.opacity = String(easeOut(lt / 0.45));
          ch.textContent = 'Beat 02 // Harmonized Archive';
          l1.textContent = 'MODIS 1 km + VIIRS 375 m Elliptical Harmonization';
          l2.textContent = 'Deduplicates 2000 to 2026 hotspots into FRPD and IEEE 738 sag margins';
          return;
        }

        // Beat 3: 11.00s .. 17.00s Five Layer Provenance Map
        if (t < 17.0) {
          const lt = t - 11.0;
          const tiltP = easeOut(lt / 1.1);
          rig.style.transform = 'rotateX(' + lerp(7, 0, tiltP).toFixed(2) + 'deg) rotateY(' + lerp(5, 0, tiltP).toFixed(2) + 'deg)';
          rigUrl.textContent = 'https://terraspan-production.up.railway.app/?view=map';
          imgs.map.style.opacity = '1';

          cursor.style.opacity = '1';
          const cx = lerp(520, 620, easeOut(lt / 3.0));
          const cy = lt < 2.8 ? lerp(280, 320, lt / 2.8) : lerp(320, 540, easeOut((lt - 2.8) / 2.0));
          cursor.style.left = cx.toFixed(1) + 'px';
          cursor.style.top = cy.toFixed(1) + 'px';

          callout.style.opacity = String(easeOut(lt / 0.4));
          ch.textContent = 'Beat 03 // Claim Provenance';
          l1.textContent = 'Five Live Keyless NASA, ESA, and NOAA Feeds';
          l2.textContent = 'Trace every corridor derate and TTCE alert directly to raw HTTP 200 telemetry';
          return;
        }

        // Beat 4: 17.00s .. 23.50s Phase 01 Triage -> Phase 02 Same Origin CradleFlow
        const lt = t - 17.0;
        const switchBlend = clamp((lt - 2.6) / 0.55, 0, 1);
        imgs.game.style.opacity = String(1 - switchBlend);
        imgs.cradle.style.opacity = String(switchBlend);
        const tiltP = easeOut(lt / 1.0);
        rig.style.transform = 'rotateX(' + lerp(6, 0, tiltP).toFixed(2) + 'deg)';
        rigUrl.textContent =
          switchBlend > 0.5
            ? 'https://terraspan-production.up.railway.app/?view=game&stage=cradleflow'
            : 'https://terraspan-production.up.railway.app/?view=game';

        cursor.style.opacity = lt < 4.5 ? '1' : '0';
        cursor.style.left = lerp(380, 560, easeOut(lt / 2.5)).toFixed(1) + 'px';
        cursor.style.top = lerp(240, 265, easeOut(lt / 2.5)).toFixed(1) + 'px';

        callout.style.opacity = String(easeOut(lt / 0.4) * rigOut);
        ch.textContent = 'Beat 04 // Unified Escalation';
        l1.textContent = 'Earth Grid Triage to Orbital Shelter Automation';
        l2.textContent = 'Live GOES 18 and DONKI proton spikes arm OSDR habitat shields in one flow';
        return;
      }

      // Beat 5: 23.50s .. 28.50s (Frames 705..854) Finale Metrics & URL
      const lt = t - 23.5;
      const inP = easeOut(lt / 0.45);
      finale.style.opacity = String(inP);
      finale.style.transform = 'translateY(' + lerp(18, 0, inP).toFixed(1) + 'px)';
    };
  </script>
</body>
</html>`;
}

function buildShowcaseHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>TerraSpan x CradleFlow // NASA Space Apps 2026 Submission Media</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    background: #090c14;
    color: #f5f2ea;
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.55;
    overflow-x: hidden;
  }
  .wrap {
    max-width: 1180px;
    margin: 0 auto;
    padding: 40px 24px 72px;
  }
  .top-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(245, 242, 234, 0.16);
  }
  .eyebrow {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    letter-spacing: 0.14em;
    color: #38bdf8;
    text-transform: uppercase;
  }
  h1 {
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 700;
    margin-top: 8px;
    letter-spacing: -0.02em;
  }
  .sub {
    color: #cbd5e1;
    max-width: 760px;
    margin-top: 10px;
    font-size: 16px;
  }
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 22px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid rgba(245, 242, 234, 0.24);
    color: #f5f2ea;
    background: #101622;
  }
  .btn.primary {
    background: #f5f2ea;
    color: #090c14;
    border-color: #f5f2ea;
  }
  .btn.accent {
    border-color: rgba(56, 189, 248, 0.55);
    color: #bae6fd;
  }
  .section {
    margin-top: 42px;
  }
  .section h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 14px;
  }
  .video-shell {
    background: #101622;
    border: 1px solid rgba(56, 189, 248, 0.35);
    border-radius: 14px;
    overflow: hidden;
  }
  video {
    width: 100%;
    aspect-ratio: 16 / 9;
    display: block;
    background: #000;
  }
  .meta-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 13px;
    color: #cbd5e1;
    border-top: 1px solid rgba(245, 242, 234, 0.12);
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
  }
  .card {
    background: #101622;
    border: 1px solid rgba(245, 242, 234, 0.14);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .card img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    display: block;
  }
  .card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .card-title { font-size: 16px; font-weight: 700; }
  .card-desc { font-size: 13.5px; color: #cbd5e1; }
  .card-link {
    margin-top: 8px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 12.5px;
    color: #38bdf8;
    text-decoration: none;
  }
</style>
</head>
<body>
  <main class="wrap">
    <header class="top-nav">
      <div>
        <div class="eyebrow">NASA Space Apps Challenge 2026 // Official Judge Media Hub</div>
        <h1>TerraSpan x CradleFlow Submission Pack</h1>
        <p class="sub">
          Public zero login showcase containing the 28.5 second official demo cut, the 7 slide overview PDF deck, and five high resolution PNG figures ready for inline Project Page viewing.
        </p>
        <div class="btn-row">
          <a class="btn primary" href="/">Open Live Flagship</a>
          <a class="btn accent" href="/?tour=1">Start Guided Judge Tour</a>
          <a class="btn" href="/submission/terraspan-deck-7slides.pdf" target="_blank" rel="noopener">Open 7 Slide Deck PDF</a>
          <a class="btn" href="/submission/terraspan-demo-28s.mp4" download>Download 28.5s MP4</a>
        </div>
      </div>
    </header>

    <section class="section">
      <h2>Official Demo Film (28.50s // Under 30 Second Cap)</h2>
      <div class="video-shell">
        <video controls playsinline preload="metadata" poster="/submission/images/02-overview-burning-calendar.png" src="/submission/terraspan-demo-28s.mp4"></video>
        <div class="meta-bar">
          <span>Runtime: 28.50 seconds (855 frames at 30 fps)</span>
          <span>Resolution: 1920x1080 H.264 + AAC Instrumental</span>
          <span>Status: Zero Login Public Stream</span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Curated PNG Figures (1920x1080 // Under 10 MB Each)</h2>
      <div class="cards">
        <article class="card">
          <img src="/submission/images/01-architecture-pipeline.png" alt="Four column architecture diagram showing NASA feeds, harmonization math, Stage 01 to 04 flow" />
          <div class="card-body">
            <div class="card-title">01. Orbit to Outpost Architecture Pipeline</div>
            <div class="card-desc">Eight keyless NASA, ESA, and NOAA streams feeding elliptical MODIS+VIIRS deduplication, IEEE 738 sag ratings, and Stage 04 escalation.</div>
            <a class="card-link" href="/submission/images/01-architecture-pipeline.png" target="_blank" rel="noopener">Open Full 1080p PNG</a>
          </div>
        </article>
        <article class="card">
          <img src="/submission/images/02-overview-burning-calendar.png" alt="TerraSpan Overview landing view showing corridor readout and thermal contour swath" />
          <div class="card-body">
            <div class="card-title">02. Flagship Observatory &amp; Corridor Readout</div>
            <div class="card-desc">Live Butte 230 kV ampacity safety margin, TTCE closure minutes, and GOES 18 solar flare readiness.</div>
            <a class="card-link" href="/submission/images/02-overview-burning-calendar.png" target="_blank" rel="noopener">Open Full 1080p PNG</a>
          </div>
        </article>
        <article class="card">
          <img src="/submission/images/03-orbital-provenance-map.png" alt="Five layer orbital provenance map inspecting NASA FIRMS, EONET, POWER, GOES 18, and OSDR" />
          <div class="card-body">
            <div class="card-title">03. Five Layer Orbital Provenance Map</div>
            <div class="card-desc">Direct claim to endpoint traceability uniting MODIS+VIIRS, EONET v3, POWER meteorology, GOES 18+Kp, and OSDR assays.</div>
            <a class="card-link" href="/submission/images/03-orbital-provenance-map.png" target="_blank" rel="noopener">Open Full 1080p PNG</a>
          </div>
        </article>
        <article class="card">
          <img src="/submission/images/04-earth-grid-triage-phase1.png" alt="Phase 01 Earth Grid Triage three wave drill simulation" />
          <div class="card-body">
            <div class="card-title">04. Phase 01 Three Wave Earth Grid Triage</div>
            <div class="card-desc">Interactive simulation validating hotspot deduplication, IEEE 738 thermal derating, and solar storm escalation.</div>
            <a class="card-link" href="/submission/images/04-earth-grid-triage-phase1.png" target="_blank" rel="noopener">Open Full 1080p PNG</a>
          </div>
        </article>
        <article class="card">
          <img src="/submission/images/05-cradleflow-habitat-phase2.png" alt="Phase 02 CradleFlow embedded inside TerraSpan showing Synced From TerraSpan banner" />
          <div class="card-body">
            <div class="card-title">05. Phase 02 Same Origin CradleFlow HUD</div>
            <div class="card-desc">Live DONKI and OSDR node wiring automation triggered directly from Earth triage handoff telemetry.</div>
            <a class="card-link" href="/submission/images/05-cradleflow-habitat-phase2.png" target="_blank" rel="noopener">Open Full 1080p PNG</a>
          </div>
        </article>
      </div>
    </section>
  </main>
</body>
</html>`;
}

async function run() {
  const { chromium } = loadPlaywright();
  const port = 4189;
  const baseUrl = `http://127.0.0.1:${port}`;

  const server = spawn('bun', ['server.mjs'], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForHealth(`${baseUrl}/healthz`);
    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      // 1. Capture Overview + Burning Calendar section
      await page.goto(`${baseUrl}/?skipPreloader=1`, { waitUntil: 'load' });
      await page.waitForTimeout(2600);
      const overviewPath = path.join(IMG_DIR, '02-overview-burning-calendar.png');
      await page.screenshot({ path: overviewPath });

      // Also capture Burning Activity Calendar band in memory/scratch for Video & Slide 02
      await page.locator('#telemetry').scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const el = document.querySelector('#telemetry');
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 68;
          window.scrollTo({ top, behavior: 'instant' });
        }
      });
      await page.waitForTimeout(900);
      const calendarScratchPath = path.join(FRAMES_DIR, 'calendar-section.png');
      await page.screenshot({ path: calendarScratchPath });

      // 2. Capture 5-Layer Provenance Map
      await page.goto(`${baseUrl}/?skipPreloader=1&view=map`, { waitUntil: 'load' });
      await page.getByTestId('knowledge-map-box').waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(2400);
      const mapPath = path.join(IMG_DIR, '03-orbital-provenance-map.png');
      await page.screenshot({ path: mapPath });

      // 3. Capture Phase 01 Earth Grid Triage
      await page.goto(`${baseUrl}/?skipPreloader=1&view=game`, { waitUntil: 'load' });
      await page.getByTestId('mission-game-box').waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(1800);
      const gamePath = path.join(IMG_DIR, '04-earth-grid-triage-phase1.png');
      await page.screenshot({ path: gamePath });

      // 4. Capture Phase 02 Same-Origin CradleFlow Habitat Automation
      await page.goto(`${baseUrl}/?skipPreloader=1&view=game&stage=cradleflow`, {
        waitUntil: 'load',
      });
      await page.getByTestId('cradleflow-embed-frame').waitFor({ state: 'visible', timeout: 10000 });
      const cradleFrame = page.frameLocator('[data-testid="cradleflow-embed-frame"]');
      await cradleFrame.getByTestId('terraspan-handoff-banner').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2000);
      const cradlePath = path.join(IMG_DIR, '05-cradleflow-habitat-phase2.png');
      await page.screenshot({ path: cradlePath });

      // 5. Render Bespoke Architecture Pipeline PNG
      const archPath = path.join(IMG_DIR, '01-architecture-pipeline.png');
      await page.setContent(buildArchitectureHtml(), { waitUntil: 'load' });
      await page.waitForTimeout(300);
      const archCheck = await page.evaluate(() => ({
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      }));
      if (archCheck.w > 1920 || archCheck.h > 1080) {
        throw new Error(`Architecture SVG canvas overflow: ${JSON.stringify(archCheck)}`);
      }
      await page.screenshot({ path: archPath });

      // Assert all 5 official PNG plates are under 10 MB
      const pngPaths = [archPath, overviewPath, mapPath, gamePath, cradlePath];
      for (const p of pngPaths) {
        const size = fs.statSync(p).size;
        if (size <= 0 || size >= 10 * 1024 * 1024) {
          throw new Error(`PNG size out of bounds for ${p}: ${size} bytes`);
        }
      }

      // Data URIs for Deck & Video
      const imageUris = {
        arch: pngDataUri(archPath),
        overview: pngDataUri(overviewPath),
        calendar: pngDataUri(calendarScratchPath),
        map: pngDataUri(mapPath),
        game: pngDataUri(gamePath),
        cradleflow: pngDataUri(cradlePath),
      };

      // 6. Export Exact 7-Slide PDF Deck
      const deckHtml = buildDeckHtml(imageUris);
      await page.setContent(deckHtml, { waitUntil: 'load' });
      await page.waitForTimeout(400);
      const slideChecks = await page.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.slide'));
        return {
          count: slides.length,
          overflowSlides: slides.filter((el) => el.scrollWidth > 1920 || el.scrollHeight > 1080).length,
        };
      });
      if (slideChecks.count !== 7 || slideChecks.overflowSlides > 0) {
        throw new Error(`Slide deck layout validation failed: ${JSON.stringify(slideChecks)}`);
      }

      // Capture visual deck verification thumbnails & contact sheet
      const slideShots = [];
      const slideLocators = page.locator('.slide');
      for (let i = 0; i < 7; i++) {
        const sPath = path.join(FRAMES_DIR, `slide-${i + 1}.png`);
        await slideLocators.nth(i).screenshot({ path: sPath });
        slideShots.push(sPath);
      }

      const pdfPath = path.join(OUT_DIR, 'terraspan-deck-7slides.pdf');
      await page.pdf({
        path: pdfPath,
        width: '1920px',
        height: '1080px',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        preferCSSPageSize: true,
      });

      let pdfRaw = fs.readFileSync(pdfPath, 'latin1');
      let pageCount = (pdfRaw.match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
      if (pageCount !== 7) {
        await page.addStyleTag({ content: '.slide { height: 1079px !important; }' });
        await page.pdf({
          path: pdfPath,
          width: '1920px',
          height: '1080px',
          printBackground: true,
          margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
          preferCSSPageSize: true,
        });
        pdfRaw = fs.readFileSync(pdfPath, 'latin1');
        pageCount = (pdfRaw.match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
      }
      if (pageCount !== 7) {
        throw new Error(`Expected exact 7 PDF pages, got ${pageCount}`);
      }

      // 7. Render Audio + Deterministic 855 Video Frames (28.50s @ 30fps)
      const audioPath = path.join(FRAMES_DIR, 'audio.wav');
      generateWavAudio(audioPath);

      await page.setContent(buildVideoHtml(imageUris), { waitUntil: 'load' });
      await page.waitForTimeout(300);

      for (let f = 0; f < TOTAL_FRAMES; f++) {
        await page.evaluate((idx) => window.__setFrame(idx), f);
        const frameFile = path.join(FRAMES_DIR, `frame-${String(f).padStart(4, '0')}.jpg`);
        await page.screenshot({ path: frameFile, type: 'jpeg', quality: 94 });
      }

      const mp4Path = path.join(OUT_DIR, 'terraspan-demo-28s.mp4');
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-framerate',
          String(FPS),
          '-i',
          path.join(FRAMES_DIR, 'frame-%04d.jpg'),
          '-i',
          audioPath,
          '-c:v',
          'libx264',
          '-preset',
          'medium',
          '-crf',
          '22',
          '-pix_fmt',
          'yuv420p',
          '-r',
          String(FPS),
          '-af',
          'loudnorm=I=-16:TP=-1.5:LRA=11',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-movflags',
          '+faststart',
          '-t',
          DURATION_SEC.toFixed(2),
          mp4Path,
        ],
        { stdio: 'pipe' },
      );

      // Verify duration, codecs, blackdetect
      const probeJson = execFileSync(
        'ffprobe',
        ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', mp4Path],
        { encoding: 'utf8' },
      );
      const probe = JSON.parse(probeJson);
      const duration = Number(probe.format?.duration || 0);
      if (duration < 28.0 || duration > 29.0) {
        throw new Error(`Video duration out of safe window (must be <= 29.0s): ${duration}s`);
      }

      const blackRun = spawnSync(
        'ffmpeg',
        ['-i', mp4Path, '-vf', 'blackdetect=d=0.5:pix_th=0.05', '-f', 'null', '-'],
        { encoding: 'utf8' },
      );
      if (blackRun.status !== 0) {
        throw new Error(`ffmpeg blackdetect failed: ${blackRun.stderr}`);
      }
      const blackDetectOut = `${blackRun.stdout || ''}\n${blackRun.stderr || ''}`;

      // Export 6x2 video contact sheet & 4x2 deck contact sheet for visual verification
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          mp4Path,
          '-vf',
          'fps=12/28.5,scale=480:270,tile=4x3',
          '-frames:v',
          '1',
          MOTION_SHEET_PATH,
        ],
        { stdio: 'pipe' },
      );

      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          path.join(FRAMES_DIR, 'slide-%d.png'),
          '-vf',
          'scale=480:270,tile=4x2',
          '-frames:v',
          '1',
          DECK_SHEET_PATH,
        ],
        { stdio: 'pipe' },
      );

      // 8. Write Zero-Login Showcase Page (/submission/index.html)
      const showcasePath = path.join(OUT_DIR, 'index.html');
      fs.writeFileSync(showcasePath, buildShowcaseHtml(), 'utf8');

      // Summary metrics
      const stats = {
        status: 'PASS',
        videoDurationSec: Number(duration.toFixed(2)),
        videoBytes: fs.statSync(mp4Path).size,
        pdfPages: pageCount,
        pdfBytes: fs.statSync(pdfPath).size,
        blackSegmentsDetected: /black_start/.test(blackDetectOut),
        motionContactSheet: MOTION_SHEET_PATH,
        deckContactSheet: DECK_SHEET_PATH,
        images: pngPaths.map((p) => ({
          file: path.basename(p),
          bytes: fs.statSync(p).size,
          mb: Number((fs.statSync(p).size / (1024 * 1024)).toFixed(2)),
        })),
      };
      console.log(JSON.stringify(stats, null, 2));
    } finally {
      await browser.close();
      fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
    }
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('BUILD SUBMISSION MEDIA FAILED:', err);
  process.exit(1);
});
