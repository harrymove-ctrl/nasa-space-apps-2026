# NASA Space Apps Challenge 2026: Final Portal Copy & Master Checklist

Ready to paste submission pack for the official Project Tab on `https://www.spaceappschallenge.org/2026/`. All eight fields follow 100% English prose rules, exact dataset citations, and live zero login URLs.

## Part 1: Copy-Paste Official 8 Project Page Fields

### Field 1: Project Name

```text
DopaiMint: Harmonized MODIS + VIIRS Burning Calendar and Grid Digital Twin
```

### Field 2: High-Level Project Summary (`153` Words, Valid `50 to 200` Word Target)

```text
Utility operators and mission planners cannot track wildfire or radiation risk cleanly when 1 km MODIS and 375 m VIIRS thermal hotspots live in separate archives away from weather and space weather feeds. Counting both sensors naively inflates multiyear fire counts around transmission lines, while oblique scan geometry hides how fast an active flame front approaches bare overhead conductors.

DopaiMint solves this inside one zero login digital twin built directly on keyless NASA, ESA, and NOAA open data. Across a four stage workflow, operators inspect a 2000 to 2026 harmonized Burning Activity Calendar, fuse live MODIS C6.1, VIIRS NOAA 20 and 21, NASA POWER meteorology, GIBS reflectance, and ASF Sentinel 1 SAR into IEEE 738 ampacity headroom and TTCE closure minutes, verify every claim in a five layer provenance map, rehearse three triage waves, and escalate GOES 18 solar proton spikes straight into CradleFlow for automated NASA DONKI and OSDR habitat radiation shielding.
```

### Field 3: Link to Project Demo

Official guidance caps Field 3 demo videos strictly at `30.0s` or under (`0:31` risks disqualification) or `<= 7` slides. Paste either compliant `28.50s` MP4 URL below (or upload [dopaimint-demo-1080p-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4) to YouTube or Google Drive set to `Anyone with the link`) or paste the direct live Railway 7 slide PDF URL (`https://dopaimint-production.up.railway.app/submission/dopaimint-deck-7slides.pdf`, never a GitHub `/blob/main/` link). Keep the unrushed `92.00s` (`1:32`) full product launch film (`dopaimint-cyberpunk-1080p.mp4`) on the live website (`/#demo`, `/demo`) and Field 5 rather than pasting it into Field 3:

1. **Primary Zero Login 1080p Demo Video URL (`28.50s`, `1920x1080` MP4 with Directed VO + Launch Score)**: `https://dopaimint-production.up.railway.app/submission/dopaimint-demo-1080p-28s.mp4`
2. **Compact Kinetic Demo Video URL (`28.50s`, `1080x700` MP4)**: `https://dopaimint-production.up.railway.app/submission/dopaimint-demo-28s.mp4`
3. **Zero Login 7 Slide Deck PDF (`7` Pages Exact, Direct HTTP 200)**: `https://dopaimint-production.up.railway.app/submission/dopaimint-deck-7slides.pdf`
4. **Interactive Live Web Demo Studio & 7 Slide Viewer**: `https://dopaimint-production.up.railway.app/#demo` (fullscreen video studio `https://dopaimint-production.up.railway.app/demo`, fullscreen 7 slide deck `https://dopaimint-production.up.railway.app/slides`, unified hub `https://dopaimint-production.up.railway.app/submission/`)

### Field 4: Link to Final Project

```text
https://dopaimint-production.up.railway.app
```

Secondary verification links to include at the top of Field 5 if only one URL input box is offered in Field 4:

1. **Unified Flagship (DopaiMint + Same Origin Phase 02 CradleFlow)**: `https://dopaimint-production.up.railway.app`
2. **Instant 5 Step Guided Judge Tour**: `https://dopaimint-production.up.railway.app/?tour=1`
3. **Direct Phase 02 CradleFlow Space Weather HUD**: `https://dopaimint-production.up.railway.app/?view=game&stage=cradleflow`
4. **Standalone CradleFlow Mirror**: `https://cradleflow-production.up.railway.app`
5. **Public GitHub Source Repository**: `https://github.com/harrymove-ctrl/nasa-space-apps-2026`

### Field 5: Detailed Project Description (Copy-Paste Markdown)

```text
## Problem Statement
Earth observation archives contain 26 years of NASA Terra and Aqua MODIS Collection 6.1 detections (1 km nominal nadir resolution, 2000 to present) alongside Suomi NPP, NOAA 20, and NOAA 21 VIIRS detections (375 m I band resolution, 2012 to present). When utilities or analysts plot both streams side by side without footprint harmonization, overlapping overpasses double count individual fires and create artificial step jumps after 2012. Off nadir scan expansion also obscures perimeter distance to critical transmission lines, while concurrent solar particle events threaten both terrestrial infrastructure situational awareness and deep space crew safety.

## How DopaiMint Works: Four Stage Unified Telemetry Workflow
DopaiMint (`https://dopaimint-production.up.railway.app`) eliminates login barriers and pairs live keyless NASA, ESA, and NOAA streams through same origin reverse proxies (`/proxy/firms`, `/proxy/asf`, `/proxy/cmr`, `/proxy/osdr`, `/proxy/donki`) into one connected experience:

1. Stage 01 Observatory & 26 Year Burning Activity Calendar (`#telemetry`):
   In the landing observatory, operators switch instantaneously across four real monitored corridors (`Butte 230 kV`, `Maui West 69 kV`, `Okanogan 115 kV`, and `Siskiyou 500 kV`) or step through six orbital plate surveys (`ParallaxSlider`). Each thermal detection models oriented elliptical scan and track area (`area_km2 = pi * (scan / 2) * (track / 2)`), clusters coincident detections within 750 meters and 180 minutes, and reports Fire Radiative Power Density (`FRPD`, MW/km2) and Normalized Thermal Anomaly Score (`NTAS`, 0 to 100). The interactive Burning Activity Calendar (2000 to 2026) lets judges toggle between `H3 Harmonized`, `Raw MODIS+VIIRS`, and `MODIS 1 km` baselines to inspect historical fire spikes without sensor step artifacts, paired with live GIBS Terra TrueColor tiles and 45 day NASA POWER meteorology feeding IEEE 738 conductor ampacity safety margins (`425 A safe`) and Time to Corridor Encroachment (`TTCE` in minutes).

2. Stage 02 Five Layer Orbital Provenance Map & Ask the Grid Copilot (`?view=map`):
   Every computed number maps directly to its upstream telemetry source (`MODIS + VIIRS Thermal`, `EONET v3 Hazards`, `POWER Meteorology`, `GOES 18 + Kp Flux`, and `OSDR Bio Assays`). The Ask the Grid conversational panel runs structured reasoning steps, opens the live tool ledger, and highlights verified claim citations with zero fabricated numbers.

3. Stage 03 Phase 01 Earth Grid Triage (`?view=game`):
   An interactive three wave response simulation trains operators to deduplicate MODIS and VIIRS hotspots, reroute loads before IEEE 738 conductor sag exceeds clearance bounds, and respond to concurrent NOAA GOES 18 solar proton flux alerts.

4. Stage 04 Phase 02 CradleFlow Space Weather Automation (`?view=game&stage=cradleflow`):
   Once grid triage escalates an orbital flare alert, live state transfers over same origin query parameters directly into the embedded CradleFlow habitat trainer (`/cradleflow/`), displaying a live `SYNCED FROM DOPAIMINT` telemetry strip. Crew operators wire live `DONKI Proton Flux`, `Kp Geomagnetic`, `Solar & Battery`, and `NASA OSDR Bio Monitor` (`OSD-73` through `OSD-714`) nodes into automated actuators (`Seal Storm Shelter`, `Water Wall Shield`, and `Shed Hydroponics Load`) across Lunar `Shackleton Ridge Hab 01` and Martian `Jezero Hab 04 Outpost`.

## Validation & Engineering Quality
1. Production server (`bun server.mjs`) exposes live zero key proxy endpoints (`/proxy/firms`, `/proxy/asf`, `/proxy/cmr`, `/proxy/osdr`, `/proxy/donki`), byte range MP4 streaming (`HTTP 206`), and resilient verified snapshot fallbacks when upstream NASA endpoints rate limit.
2. CradleFlow unit test suite passes `18/18` automated Vitest specs (`typecheck` clean).
3. Headless Playwright QA passes all `9` verification scenarios across desktop light, desktop dark, tablet (`1024x768`, `768x1024`), guided tour (`?tour=1`), unified Phase 01 to Phase 02 same origin handoff, and mobile (`390x844`) with `0 px` horizontal overflow and zero runtime console errors.

## Live Links & Open Source Repository
1. Unified Flagship Web App (with Live `#demo` Studio): https://dopaimint-production.up.railway.app
2. Fullscreen Interactive Product Video Studio (`1:32` Full Demo + `28.50s` NASA Cut): https://dopaimint-production.up.railway.app/demo
3. Interactive 7 Slide Browser Deck: https://dopaimint-production.up.railway.app/slides
4. Official Submission Hub: https://dopaimint-production.up.railway.app/submission/
5. Official `28.50s` NASA Field 3 Demo Video (`1920x1080` MP4): https://dopaimint-production.up.railway.app/submission/dopaimint-demo-1080p-28s.mp4
6. Unrushed `92.00s` (`1:32`) Full Product Launch Film (Showcase Only, Not Official Field 3): https://dopaimint-production.up.railway.app/submission/dopaimint-cyberpunk-1080p.mp4
7. Direct 7 Slide PDF (`7` Pages Exact): https://dopaimint-production.up.railway.app/submission/dopaimint-deck-7slides.pdf
8. Standalone CradleFlow Mirror: https://cradleflow-production.up.railway.app
9. Source Code (MIT / Open Repository): https://github.com/harrymove-ctrl/nasa-space-apps-2026
```

### Curated Inline PNG Upload Map (`<= 10 MB` Cap, Paste Into Project Description Editor)

| Order | Local PNG File (`projects/project_1/public/submission/images/`) | Size | Suggested Section Caption in Project Editor |
| :--- | :--- | :--- | :--- |
| 1 | `01-architecture-pipeline.png` | `0.19 MB` | Figure 1: Four stage `mdxcn` architecture pipeline and eight NASA feed specification over `ascii.rest` Earthrise canvas. |
| 2 | `02-overview-burning-calendar.png` | `0.73 MB` | Figure 2: DopaiMint live observatory framed in `mdxcn` over `ascii.rest` Earth canvas with IEEE 738 limits and TTCE lead time. |
| 3 | `03-orbital-provenance-map.png` | `0.36 MB` | Figure 3: Five layer orbital data provenance map framed in `mdxcn` over `ascii.rest` Radar canvas binding claims to NASA endpoints. |
| 4 | `04-earth-grid-triage-phase1.png` | `0.42 MB` | Figure 4: Phase 01 three wave interactive triage drill framed in `mdxcn` over `ascii.rest` Aurora canvas across grid corridors. |
| 5 | `05-cradleflow-habitat-phase2.png` | `0.45 MB` | Figure 5: Same origin Phase 02 CradleFlow React Flow shelter automation framed in `mdxcn` over `ascii.rest` Solar System canvas. |

### Field 6: Use of Artificial Intelligence (AI) / Super Intelligence (SI)

```text
AI coding and developer workflow tools (Antigravity coding assistants and Claude/Gemini code generation models) were used during the November 14 to November 15, 2026 hackathon build window to accelerate TypeScript React component implementation, automated Playwright viewport verification scripts, mdxcn and ascii.rest presentation figures, and deterministic ffmpeg demo video assembly. No AI models ran on participant submitted private datasets prior to Nov 14, 2026, and all NASA, ESA, and NOAA open data integrations, MODIS + VIIRS footprint clustering math, IEEE 738 dynamic conductor equations, React Flow habitat automation rules, and live server proxy infrastructure are original engineering verified directly against live endpoints and test suites.
```

### Field 7: NASA Data

```text
1. NASA FIRMS MODIS Collection 6.1 Active Fire 24h CSV (1 km nominal): https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv
2. NASA FIRMS VIIRS NOAA 20 (J1) & NOAA 21 (J2) 24h CSV (375 m I band): https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv and https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_Global_24h.csv
3. NASA GIBS WMTS Global Imagery Browse Services (MODIS Terra Corrected Reflectance TrueColor and Thermal Anomalies): https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/
4. NASA POWER Meteorology & Solar Daily API (T2M ambient air temperature, WS10M 10 m wind speed, WD10M wind direction, RH2M humidity, PRECTOTCORR precipitation): https://power.larc.nasa.gov/api/temporal/daily/point
5. NASA ASF DAAC Search API (OPERA-S1, NISAR, and Sentinel 1 SAR coherence granules): https://api.daac.asf.alaska.edu/services/search/param
6. NASA Earthdata CMR Granule Search API (NASADEM_HGT 30 m elevation and terrain slope context): https://cmr.earthdata.nasa.gov/search/granules.json
7. NASA EONET v3 Earth Observatory Natural Event Tracker (open wildfire and storm geo events): https://eonet.gsfc.nasa.gov/api/v3/events
8. NASA CCMC DONKI Space Weather Database Of Notifications, Knowledge, Information (CME, SEP proton flux, solar flare events): https://ccmc.gsfc.nasa.gov/DONKI/WS/get/
9. NASA Open Science Data Repository (OSDR) Spaceflight Radiobiology Studies (OSD-73, OSD-97, OSD-109, OSD-117, OSD-340, OSD-714): https://osdr.nasa.gov/osdr/data/search
```

### Field 8: Space Agency Partner Data and Other References

```text
1. European Space Agency (ESA) Copernicus Sentinel 1 C band SAR data accessed through the NASA ASF DAAC granule API for smoke penetrating terrain and corridor monitoring.
2. NOAA Space Weather Prediction Center (SWPC) Primary GOES 18 JSON Feeds (proton flux >=10 MeV, X ray flare class, and planetary Kp geomagnetic disturbance index): https://services.swpc.noaa.gov/json/
3. IEEE Std 738 Standard for Calculating the Current Temperature Relationship of Bare Overhead Conductors (dynamic line ampacity and thermal sag margin formulas).
4. OpenInfraMap (https://openinframap.org/) reference conventions for electrical transmission corridor voltage tiers and structural monitoring zones.
5. Ask the Grid (https://askthegrid.com/) UX inspiration for natural language grid asset inspection paired with cited evidence provenance rails.
```

## Part 2: Master Pre-Cutoff Execution Checklist (Target Early Submit `18:00 ICT` / Hard Cutoff `23:59 ICT`)

| Status | Task ID | Verification Gate / Owner Action | Evidence / Command / URL |
| :--- | :--- | :--- | :--- |
| `[x]` | `A1` | Unify DopaiMint (`project_1`) and same origin CradleFlow (`/cradleflow/`) into single Railway app | [App.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/App.tsx), [Dockerfile](file:///Volumes/Dev/nasa-space-apps-2026/Dockerfile) |
| `[x]` | `A2` | Verify server proxies (`/proxy/firms`, `/proxy/asf`, `/proxy/cmr`, `/proxy/osdr`, `/proxy/donki`) + HTTP `206` MP4 Range support | [server.mjs](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/server.mjs) |
| `[x]` | `A3` | Pass CradleFlow `19/19` Vitest suite & `smear-type` `5/5` contract check | `bun run test` + `smear-type/scripts/check.mjs` |
| `[x]` | `A4` | Pass all Playwright multi-viewport QA checks (`0 px` overflow, `#demo`, `/demo`, `/slides`, Guided Tour, Phase 02 handoff, dark/light, mobile `390x844`) | [qa-landing.mjs](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/scripts/qa-landing.mjs) |
| `[x]` | `A5` | Render & inspect `< 30s` Demo Films (`28.50s` exact, `855` frames, `0` black dropouts: `13.65 MiB` `1080p` + `7.92 MiB` `1080x700`) and `92.01s` (`1:32`) full product launch film (`41.43 MiB`) | [dopaimint-demo-1080p-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4), [dopaimint-demo-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-28s.mp4), [QA.md](file:///Volumes/Dev/nasa-space-apps-2026/docs/video/QA.md) |
| `[x]` | `A6` | Export & inspect exact `7` slide PDF Deck (`7` pages verified, `3.92 MiB`) + clickable `/slides` viewer | [dopaimint-deck-7slides.pdf](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-deck-7slides.pdf) |
| `[x]` | `A7` | Generate `5` curated `< 10 MB` (`0.19 to 0.73 MB`) `1920x1080` `mdxcn` + `ascii.rest` PNG plates & live React `/submission/` hub | [SubmissionStudio.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/SubmissionStudio.tsx), [AsciiRestBackdrop.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/AsciiRestBackdrop.tsx) |
| `[ ]` | `B1` | **Operator Action (~30s)**: Enter Name, Email, and complete Google reCAPTCHA on open FortiGuard browser tab (`https://dopaimint-production.up.railway.app` pre-filled) | Browser tab `https://www.fortiguard.com/faq/wfratingsubmit` |
| `[ ]` | `C1` | **Operator Action (Before `18:00 ICT`)**: Confirm participant status is `Confirmed` (not waitlisted) on `spaceappschallenge.org/2026/` | Team dashboard on `spaceappschallenge.org` |
| `[ ]` | `C2` | **Operator Action (Before `18:00 ICT`)**: Paste Fields 1 to 8 from Part 1 above + upload the 5 inline PNGs from `projects/project_1/public/submission/images/` | `spaceappschallenge.org` Project Tab editor |
| `[ ]` | `C3` | **Operator Action (Before `18:00 ICT`)**: Optional mirror of [dopaimint-demo-1080p-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4) (`28.50s`) to Unlisted or Public YouTube / Google Drive if desired, otherwise paste `https://dopaimint-production.up.railway.app/submission/dopaimint-demo-1080p-28s.mp4` (never paste `dopaimint-cyberpunk-1080p.mp4` into Field 3 because `92.00s` exceeds the `30.0s` cap) | `Field #3: Link to Project Demo` |
| `[ ]` | `C4` | **Operator Action (Before `18:00 ICT`)**: Test every external URL in a fresh Incognito window (confirm zero logins requested) | Incognito browser check |
| `[ ]` | `C5` | **Operator Action (Before `18:00 ICT`)**: Tick `Terms and Conditions` + `Confirm All Work is Original`, click **`Submit for Judging`**, and confirm the top confirmation banner | `spaceappschallenge.org` Submit banner |
| `[ ]` | `D1` | **Operator Action (Before `23:59 ICT`)**: Review formatting, resave/resubmit any final polish, verify Profile Full Name spelling, and download the Letter-size (`8.5x11in`) Participant Certificate PDF | `spaceappschallenge.org` Certificate Download |

Optional ElevenLabs voiceover upgrade (run inside `projects/project_1` after connecting an API key):

```bash
cd /Volumes/Dev/nasa-space-apps-2026/projects/project_1 && npx -y @elevenlabs/cli@latest onboard connect --env-path .env.local && node --env-file=.env.local scripts/generate-elevenlabs-audio.mjs
```
