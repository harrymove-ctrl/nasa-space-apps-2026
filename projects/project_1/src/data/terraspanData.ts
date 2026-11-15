import type { ParallaxSlide } from '../components/obsidian/parallax-slider';

export const CRADLEFLOW_URL =
  import.meta.env.VITE_CRADLEFLOW_URL || '/cradleflow/index.html';

export const NASA_OPEN_PARTNERS = [
  'NASA EONET v3',
  'MODIS C6.1 1 km',
  'VIIRS J1 375 m',
  'NASA POWER',
  'ASF NISAR SAR',
  'NOAA GOES-18',
  'NASA OSDR',
] as const;

export interface SpaceGalleryPlate extends ParallaxSlide {
  id: string;
  missionTag: string;
  instrument: string;
  telemetryNote: string;
}

export const NASA_GALLERY_SLIDES: readonly SpaceGalleryPlate[] = [
  {
    id: 'earthrise-orbital-pass',
    title: 'Terra + Suomi NPP Thermal Contour Pass',
    image: '/nasa-gallery/earthrise-orbital-pass.webp',
    alt: 'Halftone print plate showing an Earth observation satellite scanning curved thermal wildfire contour bands across the horizon',
    focus: '50% 45%',
    missionTag: 'MODIS + VIIRS',
    instrument: '375 m I-band + 1 km C6.1',
    telemetryNote: '26-year harmonized fire archive crossing 4.8 km line buffers',
    href: '#telemetry',
  },
  {
    id: 'sar-interferometry-corridor',
    title: 'NISAR + Sentinel Transmission Phase Swath',
    image: '/nasa-gallery/sar-interferometry-corridor.webp',
    alt: 'Editorial print showing high-voltage transmission pylons across a mountain ridge intersected by radar swath contours and smoke',
    focus: '52% 48%',
    missionTag: 'ASF SAR + NASADEM',
    instrument: 'L-band & C-band coherence',
    telemetryNote: 'Smoke-penetrating conductor clearance and terrain slope mapping',
    href: '#corridors',
  },
  {
    id: 'solar-storm-magnetosphere',
    title: 'GOES-18 Magnetosphere Flare Bowshock',
    image: '/nasa-gallery/solar-storm-magnetosphere.webp',
    alt: 'Risograph observatory plate depicting a solar flare coronal wave compressing Earth magnetic dipole lines',
    focus: '48% 50%',
    missionTag: 'NOAA SWPC GOES-18',
    instrument: 'Proton flux >=10 MeV + Kp',
    telemetryNote: 'Live geomagnetic storm tracking linked to orbital crew safety',
    href: '#corridors',
  },
  {
    id: 'shackleton-lunar-station',
    title: 'Shackleton Rim Habitat & Solar Tower',
    image: '/nasa-gallery/shackleton-lunar-station.webp',
    alt: 'Cutaway architectural diorama of an Artemis lunar south pole station beside a vertical solar collector tower',
    focus: '45% 50%',
    missionTag: 'Artemis Outpost',
    instrument: 'Shackleton Power Telemetry',
    telemetryNote: 'Peak-of-eternal-light array simulation in CradleFlow trainer',
    href: '#trainer',
  },
  {
    id: 'galaxy-deep-field',
    title: 'Gravitational Lensing Deep Field Survey',
    image: '/nasa-gallery/galaxy-deep-field.webp',
    alt: 'Astronomical halftone survey plate of a barred spiral galaxy cluster and gravitational lensing arcs on observatory slate',
    focus: '50% 50%',
    missionTag: 'Deep Space Catalog',
    instrument: 'Optical + IR Coordinate Grid',
    telemetryNote: 'Calibrated sky coordinate registration across multi-epoch passes',
    href: '#gallery',
  },
  {
    id: 'osdr-orbital-botany',
    title: 'EVA Helmet & OSDR Hydroponics Chamber',
    image: '/nasa-gallery/osdr-orbital-botany.webp',
    alt: 'Editorial halftone illustration of an astronaut EVA pressure helmet beside an orbital hydroponics seedling chamber',
    focus: '50% 50%',
    missionTag: 'NASA OSDR Bio-Archive',
    instrument: '1,064+ Radiation Studies',
    telemetryNote: 'Arabidopsis and vascular repair transcripts mapped to shelter windows',
    href: '#trainer',
  },
];

export interface KnowledgeNode {
  id: string;
  code: string;
  label: string;
  sourceName: string;
  resolution: string;
  metric: string;
  score: number;
  summary: string;
  endpointUrl: string;
  linkedAsset: string;
}

export const KNOWLEDGE_NODES: readonly KnowledgeNode[] = [
  {
    id: 'firms',
    code: 'N-01',
    label: 'MODIS + VIIRS Thermal',
    sourceName: 'NASA FIRMS C6.1 & J1/J2',
    resolution: '375 m / 1 km harmonized',
    metric: '486 MW FRPD',
    score: 96,
    summary:
      'Harmonizes 2000 to 2026 Terra, Aqua, and Suomi NPP thermal hotspots into a single Burning Activity Calendar without double-counting.',
    endpointUrl: 'https://firms.modaps.eosdis.nasa.gov/active_fire/',
    linkedAsset: 'Butte 230 kV span',
  },
  {
    id: 'eonet',
    code: 'N-02',
    label: 'EONET v3 Hazards',
    sourceName: 'NASA Earth Observatory Natural Event Tracker',
    resolution: 'Keyless REST live feed',
    metric: 'Active wildland events',
    score: 94,
    summary:
      'Streams open global wildfire and storm event geometries directly into corridor triage cards without authentication keys.',
    endpointUrl: 'https://eonet.gsfc.nasa.gov/api/v3/events',
    linkedAsset: 'Corridor alert queue',
  },
  {
    id: 'power',
    code: 'N-03',
    label: 'POWER Meteorology',
    sourceName: 'NASA POWER Daily Grid',
    resolution: 'T2M / WS10M / RH2M',
    metric: '34.2 C / 9.8 m/s wind',
    score: 92,
    summary:
      'Drives IEEE 738 conductor thermal ampacity calculations using daily satellite-derived ambient temperature and wind cooling.',
    endpointUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    linkedAsset: 'IEEE 738 derate model',
  },
  {
    id: 'swpc',
    code: 'N-04',
    label: 'GOES-18 + Kp Flux',
    sourceName: 'NOAA SWPC GOES-R Series',
    resolution: '1-minute proton & flare feed',
    metric: '>=10 MeV pfu + X-ray',
    score: 95,
    summary:
      'Monitors real-time GOES-18 solar particle radiation and planetary geomagnetic Kp disturbance for EVA shelter and grid geomagnetics.',
    endpointUrl: 'https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json',
    linkedAsset: 'CradleFlow EVA shelter',
  },
  {
    id: 'osdr',
    code: 'N-05',
    label: 'OSDR Bio-Assays',
    sourceName: 'NASA Open Science Data Repository',
    resolution: '1,064+ indexed studies',
    metric: 'OSD-73 / OSD-340 / OSD-714',
    score: 91,
    summary:
      'Ties simulated radiation storm dosages inside CradleFlow to peer-reviewed spaceflight gene expression and cellular stress archives.',
    endpointUrl: 'https://osdr.nasa.gov/osdr/data/search?term=radiation',
    linkedAsset: 'CradleFlow Bio Lab',
  },
];

export interface DefenseModule {
  id: string;
  tag: string;
  title: string;
  formula: string;
  summary: string;
}

export interface MissionWave {
  id: string;
  wave: number;
  title: string;
  trigger: string;
  telemetryReading: string;
  options: {
    id: string;
    label: string;
    detail: string;
    correct: boolean;
    outcome: string;
  }[];
}

export const DEFENSE_MODULES: readonly DefenseModule[] = [
  {
    id: 'frpd',
    tag: 'MODULE 01',
    title: 'FRPD Thermal Density',
    formula: 'FRPD = Sum(FRP MW) / Polygon km^2',
    summary: 'Separates wide low-grade agricultural burns from concentrated crown fronts approaching high-voltage spans.',
  },
  {
    id: 'ieee738',
    tag: 'MODULE 02',
    title: 'IEEE 738 Conductor Limit',
    formula: 'Ampacity = f(T2M, WS10M, Solar, T_max=75 C)',
    summary: 'Derates line current capacity dynamically when satellite T2M ambient heat climbs and smoke traps convective cooling.',
  },
  {
    id: 'eva-shelter',
    tag: 'MODULE 03',
    title: 'GOES-18 + OSDR Shelter Rule',
    formula: 'Shelter when >=10 MeV > 10 pfu or Kp >= 5',
    summary: 'Pairs live NOAA proton flux with NASA OSDR cellular repair baselines so crews seal storm shelters before peak flare arrival.',
  },
];

export const MISSION_WAVES: readonly MissionWave[] = [
  {
    id: 'wave-1',
    wave: 1,
    title: 'Verify Corridor Hotspots',
    trigger: 'Butte 230 kV thermal anomaly',
    telemetryReading: 'VIIRS 375 m cluster 4.8 km upwind · MODIS C6.1 baseline matches 2018 Camp scar',
    options: [
      {
        id: 'harmonize',
        label: 'Cross-check MODIS 2000 to 2026 baseline + VIIRS FRPD',
        detail: 'Confirm crown-fire intensity before clearing dispatch',
        correct: true,
        outcome: 'Confirmed: 486 MW FRPD active head with wind alignment along the 230 kV right-of-way.',
      },
      {
        id: 'ignore',
        label: 'Discard single-pass VIIRS pixel as ground flare clutter',
        detail: 'Wait 12 hours for next daytime Aqua pass',
        correct: false,
        outcome: 'Delayed warning: crown fire crossed the ridge gap before the afternoon overpass.',
      },
    ],
  },
  {
    id: 'wave-2',
    wave: 2,
    title: 'Apply IEEE 738 Ampacity Derate',
    trigger: 'NASA POWER T2M spikes + convective cooling drops',
    telemetryReading: 'Nominal 400 A rating · 34.2 C ambient · TTCE 17 min to corridor perimeter',
    options: [
      {
        id: 'derate',
        label: 'Derate Butte 230 kV from 400 A to 285 A and shift load',
        detail: 'Hold conductor below 75 C sag limit while keeping substations powered',
        correct: true,
        outcome: 'Grid stabilized: sag clearance preserved without triggering an unscheduled customer blackout.',
      },
      {
        id: 'hold',
        label: 'Hold 400 A steady and rely on line-fuse trip only',
        detail: 'Prioritize full feeder throughput during red-flag wind',
        correct: false,
        outcome: 'Thermal sag violation: hot conductor dropped toward dry timber beneath span 14.',
      },
    ],
  },
  {
    id: 'wave-3',
    wave: 3,
    title: 'Enforce Deep-Space Radiation Hold',
    trigger: 'GOES-18 telemetry surge linked to CradleFlow EVA schedule',
    telemetryReading: 'Proton >=10 MeV rising · OSDR OSD-73 & OSD-340 oxidative stress threshold flagged',
    options: [
      {
        id: 'seal',
        label: 'Seal EVA crew in Shackleton shelter and log OSDR biomarker window',
        detail: 'Transfer outpost telemetry into CradleFlow drill loop',
        correct: true,
        outcome: 'Zero crew exceedance: CradleFlow scenario cleared with documented NASA OSDR biological margins.',
      },
      {
        id: 'proceed',
        label: 'Extend unshielded surface EVA to finish solar mast splice',
        detail: 'Bypass particle alert until visible aurora onset',
        correct: false,
        outcome: 'Dosimetry breach: high-energy protons arrive minutes before visible optical geomagnetic storms.',
      },
    ],
  },
];
