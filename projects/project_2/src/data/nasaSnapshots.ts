import type {
  DonkiStormEvent,
  MissionDrill,
  OsdrStudyRecord,
  OutpostId,
  OutpostProfile,
  TelemetryProvenance,
} from "../types/mission";

export const OUTPOST_PROFILES: Record<OutpostId, OutpostProfile> = {
  "lunar-south": {
    id: "lunar-south",
    name: "Shackleton Ridge Hab-01",
    code: "LUNAR // SOUTH POLE",
    locationLabel: "89.9 S, Shackleton Crater Rim",
    gravityG: 0.166,
    atmosphericShieldingGcm2: 0.0,
    solarPeakKw: 18.0,
    baseO2UsePerHour: 1.44,
    baseWaterUsePerHour: 1.15,
    basePowerDemandKw: 11.4,
    dustAttenuationBaseline: 1.0,
    description:
      "Vacuum surface habitat perched on Shackleton Ridge. Zero atmospheric column shielding leaves solar proton events unattenuated, while quasi-continuous rim sunlight supplies solar arrays.",
  },
  "mars-jezero": {
    id: "mars-jezero",
    name: "Jezero Hab-04 Outpost",
    code: "MARS // JEZERO DELTA",
    locationLabel: "18.38 N, 77.58 E, Jezero Crater",
    gravityG: 0.376,
    atmosphericShieldingGcm2: 18.0,
    solarPeakKw: 20.8,
    baseO2UsePerHour: 1.48,
    baseWaterUsePerHour: 1.25,
    basePowerDemandKw: 10.2,
    dustAttenuationBaseline: 0.84,
    description:
      "Pressurized regolith-bermed habitat under thin CO2 atmosphere (18 g/cm2 column shielding) powered by Kilopower + solar arrays. Dust attenuation lowers solar output while high-LET cosmic rays require internal shielding.",
  },
};

export const VERIFIED_DONKI_EVENTS: readonly DonkiStormEvent[] = [
  {
    id: "2026-10-10T15:00:00-GST-001",
    category: "GST",
    title: "Oct 2026 Severe Geomagnetic & Shockwave Event (Kp 7.0)",
    startTime: "2026-10-10T15:00:00Z",
    peakTime: "2026-10-10T21:00:00Z",
    speedKmS: 890,
    kpIndex: 7.0,
    protonFluxPfu: 185,
    xrayClass: "X1.4",
    doseRateMsvHr: 1.85,
    linkedInstruments: ["SOHO: LASCO/C2", "GOES-18: SEISS", "ACE: SWEPAM"],
    summary:
      "Verified NASA DONKI geomagnetic storm reaching Kp 7.0 (G3 Strong) with elevated solar energetic proton flux across lunar and cislunar latitudes.",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/view/GST/49066/-1",
    verifiedLive: true,
  },
  {
    id: "2024-05-11T00:00:00-G5-AR13664",
    category: "SEP",
    title: "AR 13664 Extreme G5 Superstorm & Proton Surge (Kp 9.0)",
    startTime: "2024-05-10T17:00:00Z",
    peakTime: "2024-05-11T04:00:00Z",
    speedKmS: 1355,
    kpIndex: 9.0,
    protonFluxPfu: 960,
    xrayClass: "X5.8",
    doseRateMsvHr: 5.4,
    linkedInstruments: ["SOHO: LASCO/C3", "STEREO A: SECCHI/COR2", "GOES: CCOR-1"],
    summary:
      "Benchmark extreme G5 storm cataloged in NASA DONKI (Kp 9.0, Dst -412 nT, halo CME 1355 km/s) capable of saturating unshielded lunar electronics and elevating crew tissue dose rapidly.",
    sourceUrl: "https://science.nasa.gov/sun/solar-storms-and-flares/",
    verifiedLive: true,
  },
  {
    id: "2026-10-31T18:00:00-GST-001",
    category: "CME",
    title: "Oct 31 Corridor CME & Geomagnetic Surge (Kp 6.0)",
    startTime: "2026-10-31T18:00:00Z",
    peakTime: "2026-11-01T02:00:00Z",
    speedKmS: 740,
    kpIndex: 6.0,
    protonFluxPfu: 92,
    xrayClass: "M6.2",
    doseRateMsvHr: 1.15,
    linkedInstruments: ["SOHO: LASCO/C2", "STEREO A: SECCHI/COR2"],
    summary:
      "Verified NASA DONKI late-October Earth-to-Moon corridor disturbance reaching Kp 6.0 with prolonged high-speed solar wind stream.",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/view/GST/49348/-1",
    verifiedLive: true,
  },
  {
    id: "2026-10-01T02:36:00-CME-001",
    category: "CME",
    title: "Oct 01 Coronal Mass Ejection (419 km/s)",
    startTime: "2026-10-01T02:36:00Z",
    peakTime: "2026-10-01T14:00:00Z",
    speedKmS: 419,
    kpIndex: 4.3,
    protonFluxPfu: 24,
    xrayClass: "M1.9",
    doseRateMsvHr: 0.45,
    linkedInstruments: ["SOHO: LASCO/C2", "SOHO: LASCO/C3", "GOES: CCOR-1"],
    summary:
      "Verified NASA DONKI CME catalog event analyzed at 419 km/s, 7 deg half-angle, 38 deg latitude, driving mild solar energetic particle background.",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/48912/-1",
    verifiedLive: true,
  },
  {
    id: "2026-10-04T18:00:00-GST-001",
    category: "GST",
    title: "Oct 04 High-Speed Stream + IPS Shock (Kp 5.67)",
    startTime: "2026-10-04T18:00:00Z",
    peakTime: "2026-10-05T00:00:00Z",
    speedKmS: 680,
    kpIndex: 5.67,
    protonFluxPfu: 64,
    xrayClass: "M4.1",
    doseRateMsvHr: 0.92,
    linkedInstruments: ["ACE: MAG", "DSCOVR: Faraday Cup"],
    summary:
      "Verified NASA DONKI geomagnetic disturbance triggered by combined interplanetary shock and coronal hole high-speed stream.",
    sourceUrl: "https://ccmc.gsfc.nasa.gov/DONKI/",
    verifiedLive: true,
  },
  {
    id: "2026-11-14T06:06:00-FLR-SWPC",
    category: "FLR",
    title: "Live GOES-18 C4.4 Solar Flare & Quiet Proton Baseline",
    startTime: "2026-11-14T06:02:00Z",
    peakTime: "2026-11-14T06:06:00Z",
    speedKmS: 380,
    kpIndex: 1.33,
    protonFluxPfu: 0.24,
    xrayClass: "C4.4",
    doseRateMsvHr: 0.14,
    linkedInstruments: ["GOES-18: XRS", "GOES-18: SEISS"],
    summary:
      "Observed live on NOAA SWPC GOES-18 on 2026-11-14: peak C4.4 flare at 06:06 UTC with 0.2407 pfu >=10 MeV baseline protons and Kp 1.33.",
    sourceUrl: "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json",
    verifiedLive: true,
  },
];

export const VERIFIED_OSDR_STUDIES: readonly OsdrStudyRecord[] = [
  {
    osdId: "OSD-109",
    title:
      "Delayed Cardiomyocyte Response to Total Body Particle Radiation Exposure: Regulatory Gene Network (Iron 56Fe)",
    organism: "Mus musculus",
    tissueOrCell: "Left ventricular cardiomyocytes",
    radiationType: "HZE_56FE",
    doseDescription: "15 cGy, 1 GeV/n 56Fe high-LET ions vs 90 cGy 1 GeV protons over 28 days",
    stressMultiplier: 1.55,
    bioHalfLifeHours: 14,
    keyPathways: ["p38 MAPK", "NFATc4", "GATA-4", "STAT-3", "NF-kB"],
    countermeasureHint:
      "High-LET 56Fe ions trigger persistent 28-day cardiac transcript remodeling even at 15 cGy. Pair polyethylene/water wall shielding with Bio-Countermeasure dosing.",
    summary:
      "Compares proton (1H) and iron (56Fe) exposure in cardiomyocytes: 56Fe triggers long-lasting gene modulation through p38 MAPK and NF-kB pathways far exceeding proton exposure.",
    osdrUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-109",
  },
  {
    osdId: "OSD-117",
    title:
      "Delayed Cardiomyocyte Response to Total Body Particle Radiation Exposure: Proton (1H) Baseline",
    organism: "Mus musculus",
    tissueOrCell: "Left ventricular cardiomyocytes",
    radiationType: "PROTON_1H",
    doseDescription: "90 cGy, 1 GeV proton (1H) particle exposure profile",
    stressMultiplier: 1.15,
    bioHalfLifeHours: 8,
    keyPathways: ["1H Proton Attenuation", "Acute Oxidative Buffering"],
    countermeasureHint:
      "1H solar protons are blocked efficiently by water-wall storm shelters and hydrogen-rich shielding (45+ g/cm2).",
    summary:
      "Demonstrates lower delayed transcript disruption under 1H proton irradiation than equivalent HZE 56Fe exposure, underscoring why SPE water-wall sheltering succeeds.",
    osdrUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-117",
  },
  {
    osdId: "OSD-73",
    title:
      "Transcriptome Profiles in Normal Human Bronchial Epithelial Cells after Gamma and HZE Exposure",
    organism: "Homo sapiens",
    tissueOrCell: "HBEC3KT bronchial epithelial cells",
    radiationType: "HZE_56FE",
    doseDescription: "Low-LET gamma vs high-LET HZE particles at 1h, 4h, 12h, and 24h",
    stressMultiplier: 1.38,
    bioHalfLifeHours: 10,
    keyPathways: ["DNA Damage Checkpoint", "Bronchial Oxidative Stress", "1h-24h Repair Curve"],
    countermeasureHint:
      "Human airway cells register rapid 1h to 4h transcriptional shock after HZE exposure. Boost O2 scrubber purity and seal dust/particulate locks early.",
    summary:
      "Tracks human bronchial epithelial cell RNA expression across 1h to 24h post-irradiation, separating acute particle stress signatures from control baseline.",
    osdrUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-73",
  },
  {
    osdId: "OSD-340",
    title:
      "Mlh1 Deficiency Increases Hematopoietic Malignancy Risk After Simulated Space Radiation",
    organism: "Mus musculus (Mlh1+/-)",
    tissueOrCell: "Hematopoietic stem cells (HSCs)",
    radiationType: "HZE_56FE",
    doseDescription: "High-LET 56Fe ion Mars-transit simulation in mismatch-repair-sensitive HSCs",
    stressMultiplier: 1.65,
    bioHalfLifeHours: 16,
    keyPathways: ["DNA Mismatch Repair (MLH1)", "Microsatellite Stability", "HSC Protection"],
    countermeasureHint:
      "Mars crews face chronic high-LET cosmic exposure demanding active DNA repair countermeasure protocols plus storm shelter triggers before bio-stress exceeds 55%.",
    summary:
      "Proves high-LET 56Fe ions sharply elevate hematopoietic stem cell mutation risk in DNA mismatch repair deficient models, highlighting Mars countermeasure urgency.",
    osdrUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-340",
  },
  {
    osdId: "OSD-97",
    title:
      "Gene-Expression Profiling of Saccharomyces cerevisiae Irradiated by High-LET Radiations",
    organism: "Saccharomyces cerevisiae",
    tissueOrCell: "Whole microbial / bioregenerative bioreactors",
    radiationType: "HZE_56FE",
    doseDescription: "Fast neutron, heavy ion (C), thermal neutron vs low-LET gamma comparison",
    stressMultiplier: 1.28,
    bioHalfLifeHours: 6,
    keyPathways: ["Oxidative Stress Response", "Ubiquitin-Proteasome Proteostasis"],
    countermeasureHint:
      "Bioreactor microbes and hydroponic cultures suffer protein denaturation under high-LET bursts. Shed excess lighting and isolate greenhouse bay during storm peaks.",
    summary:
      "Reveals severe oxidative stress and ubiquitin-proteasome protein damage in yeast under high-LET heavy ions compared with low-LET gamma photons.",
    osdrUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-97",
  },
  {
    osdId: "OSD-714",
    title:
      "Lunar Gravity (1/6 g) Prevents Skeletal Muscle Atrophy But Not Myofiber Type Shift",
    organism: "Mus musculus",
    tissueOrCell: "Soleus skeletal muscle (MARS centrifuge)",
    radiationType: "LUNAR_CENTRIFUGE",
    doseDescription: "Microgravity vs 1/6 g lunar partial gravity vs 1 g artificial gravity",
    stressMultiplier: 1.0,
    bioHalfLifeHours: 7,
    keyPathways: ["Proteostasis Maintenance", "Myofiber Transition Threshold"],
    countermeasureHint:
      "Lunar 1/6 g preserves muscle mass proteostasis but still requires periodic countermeasure loading; low-power bio protocols work cleanly at 1/6 g.",
    summary:
      "MARS centrifuge experiment demonstrating lunar 1/6 g stops soleus muscle atrophy while higher gravitational loading is needed to prevent myofiber type shift.",
    osdrUrl: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-714",
  },
];

export const MISSION_DRILLS: readonly MissionDrill[] = [
  {
    id: "drill-lunar-oct2026",
    title: "DRILL 01 // LUNAR SHOCKWAVE (Kp 7.0)",
    subtitle: "Shackleton Ridge during Oct 2026 DONKI Kp-7.0 + CME Proton Surge",
    defaultOutpost: "lunar-south",
    durationHours: 24,
    maxSafeDoseMsv: 12.0,
    minSafeO2Pct: 19.2,
    minSafeWaterPct: 35,
    minSafeHydroPct: 75,
    linkedStormId: "2026-10-10T15:00:00-GST-001",
    linkedOsdId: "OSD-73",
    timelineCurve: [
      0.08, 0.12, 0.18, 0.35, 0.68, 0.92, 1.0, 0.94, 0.82, 0.65, 0.48, 0.34,
      0.26, 0.42, 0.72, 0.88, 0.62, 0.38, 0.22, 0.16, 0.12, 0.1, 0.08, 0.08,
    ],
    juniorBriefing:
      "A two-peak Oct 2026 solar particle and geomagnetic shockwave hits Shackleton Ridge. Unshielded crew dose will cross 18 mSv unless your Frontier Flow automation seals the storm shelter, engages water-wall shielding when proton flux >= 50 pfu, and sheds hydroponics load before battery reserves drain.",
    recommendedWiringHint:
      "Connect [DONKI Proton Flux] -> [Threshold >= 45 pfu] -> [Seal Storm Shelter] AND [Water-Wall Shield]. Also wire [Solar & Battery Sensor] -> [Threshold <= 55%] -> [Shed Hydroponics Load].",
  },
  {
    id: "drill-mars-superstorm",
    title: "DRILL 02 // JEZERO G5 SUPERSTORM (AR 13664)",
    subtitle: "Mars Jezero Hab-04 under AR 13664 Kp-9.0 SEP + 56Fe Bio-Stress",
    defaultOutpost: "mars-jezero",
    durationHours: 24,
    maxSafeDoseMsv: 18.0,
    minSafeO2Pct: 19.0,
    minSafeWaterPct: 30,
    minSafeHydroPct: 68,
    linkedStormId: "2024-05-11T00:00:00-G5-AR13664",
    linkedOsdId: "OSD-340",
    timelineCurve: [
      0.02, 0.04, 0.14, 0.45, 0.82, 1.0, 0.96, 0.85, 0.72, 0.56, 0.42, 0.3,
      0.22, 0.16, 0.12, 0.08, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02,
    ],
    juniorBriefing:
      "AR 13664 fires an X5.8 flare and 960 pfu SEP surge toward Jezero Crater while atmospheric dust lowers solar output. High-LET OSD-340 hematopoietic stress rises rapidly unless both Storm Shelter AND Bio-Countermeasure are triggered via logic gates.",
    recommendedWiringHint:
      "Combine [DONKI Proton Flux] + [DONKI Kp Geomagnetic] into an [OR Gate] driving [Seal Storm Shelter] and [Active Magnetic Shield], plus [OSDR Bio Monitor] -> [OSDR Bio-Countermeasure] and [Habitat O2 Sensor] -> [Boost O2 Scrubber].",
  },
  {
    id: "drill-live-baseline",
    title: "DRILL 03 // LIVE NOAA + OSDR ENDURANCE",
    subtitle: "Continuous baseline operations seeded with today's GOES-18 + OSD-714 feed",
    defaultOutpost: "lunar-south",
    durationHours: 24,
    maxSafeDoseMsv: 8.0,
    minSafeO2Pct: 19.6,
    minSafeWaterPct: 45,
    minSafeHydroPct: 85,
    gustPeakPfu: 68,
    gustDoseRateMsvHr: 2.85,
    linkedStormId: "2026-11-14T06:06:00-FLR-SWPC",
    linkedOsdId: "OSD-714",
    timelineCurve: [
      0.06, 0.07, 0.08, 0.08, 0.09, 0.1, 0.1, 0.1, 0.12, 0.16, 0.32, 0.72,
      1.0, 0.92, 0.68, 0.28, 0.14, 0.1, 0.09, 0.08, 0.08, 0.07, 0.07, 0.07,
    ],
    juniorBriefing:
      "Nominal C4.4 flare baseline with one sharp mid-shift solar proton gust (~62 pfu). Avoid over-sealing or leaving shielding powered all day so hydroponics yield reaches >= 85% while keeping crew radiation below 8 mSv.",
    recommendedWiringHint:
      "Avoid always-on shielding! Gate [Active Magnetic Shield] or [Seal Storm Shelter] behind [Threshold >= 25 pfu] so hydroponics reaches >= 85% and O2 stays healthy during quiet hours.",
  },
];

export const BASELINE_PROVENANCE: TelemetryProvenance = {
  source: "VERIFIED_SNAPSHOT",
  lastSyncUtc: "2026-11-14T08:17:00Z",
  goesProton10Mev: 0.2407,
  goesProton100Mev: 0.2288,
  goesXrayClass: "C4.4",
  swpcKp: 1.33,
  donkiEventCount: VERIFIED_DONKI_EVENTS.length,
  osdrStudyCount: VERIFIED_OSDR_STUDIES.length,
  note: "Bundled verified snapshot active (GOES-18 + NASA DONKI Oct/Nov 2026 + 6 NASA OSDR studies). Click LIVE SYNC to pull fresh NOAA SWPC and NASA OSDR updates without any API key.",
};
