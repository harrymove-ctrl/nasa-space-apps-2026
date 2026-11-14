# Candidate Concept: TerraSpan Physical Infrastructure Satellite, Weather, Terrain & Sensor Digital Twin

1. **Workspace Status**: Pre-event research and architecture note only (`projects/project_1/src/` remains strictly locked at `0` files until explicit build execution begins).
2. **Primary UI & Interaction References**: **Ask the Grid** (`https://askthegrid.com/`) for interactive geospatial corridor mapping paired with plain-English conversational asset and risk queries, plus **OpenInfraMap** (`https://openinframap.org/`) for transmission, substation, and pipeline topology symbology.

## 1. Core Product Vision

Monitor critical physical infrastructure (**high-voltage transmission lines, oil/gas/water pipelines, hydroelectric and tailings dams, mines, and industrial plants**) by fusing **NASA Earth Observation satellites, weather feeds, 3D terrain models, optical cameras, automated drones, and ground IoT sensors** into one operator decision cockpit (**TerraSpan**).

Operators can inspect sprawling remote corridors on a live geospatial canvas, switch directly between a **Multi-Decade Harmonized Burning Activity Calendar (`2000 to 2026`)** and live sensor layers, detect harmonized thermal encroachment, ground deformation, or flood/landslide stress early, simulate cascading impact in a Rust digital twin (`TTCE` and `IEEE 738` dynamic line rating), and ask plain-English operational questions inspired by `https://askthegrid.com/`.

## 2. Multi-Decade Harmonized Burning Activity Calendar (`2000 to 2026`) & Region Inspector

To satisfy 100% of the `Harmonization of MODIS and VIIRS Hot Spots` prompt and score top marks on the **Relevance** and **Validity** criteria alongside infrastructure protection:

1. **Common Hexagonal Grid (`H3`) & Elliptical Footprint Calibration**: Reproject `MODIS` (`1 km` nadir) and `VIIRS` (`375 m` nadir) footprints onto unified `H3` resolution cells, applying sensor-overlap cross-calibration weights so switching from `MODIS` (`2000+`) to `VIIRS` (`2012+`) never introduces false step-change spikes in historical counts.
2. **Interactive Region & Date-Range Selector**: Let judges and scientists pick any preset corridor, draw a custom bounding box, or select a geographic region and date window (`2000 to 2026`) to inspect daily, monthly, and seasonal burning intensity heatmaps.
3. **Burning Activity Calendar & Anomaly Strip**: Render a GitHub-style multi-year daily burning calendar paired with seasonal anomaly baselines, `MODIS` versus `VIIRS` provenance toggles, and exportable CSV/GeoJSON summaries.

## 3. NASA Space Apps 2026 Challenge & Open Dataset Mapping

| Infrastructure Hazard | NASA Open Dataset / Sensor Feed | Monitored Assets | Matched 2026 Space Apps Brief |
| :--- | :--- | :--- | :--- |
| **Right-of-Way Wildfire, Thermal Hotspots & Multi-Decade Trends** | **NASA FIRMS (`MODIS C6.1` + `VIIRS J1/J2`)** active thermal anomalies + **NASA GIBS** multi-spectral imagery + **NASA EONET v3** | High-voltage transmission corridors, substations, tank farms, refineries, regional fire regimes | `Harmonization of MODIS and VIIRS Hot Spots` (Primary Brief) |
| **Millimeter Ground Subsidence, Slope Creep & Dam Deformation** | **NASA ASF (`Sentinel-1`, `OPERA-S1`, `NISAR`) InSAR** radar backscatter + **NASADEM / SRTM** 30m elevation & slope models | Tailings dams, hydroelectric embankments, buried pipelines, open-pit mine walls | `Dancing with the SARs` |
| **Extreme Precipitation, Soil Saturation & Wind Load** | **NASA POWER** meteorology (`T2M`, `WS10M`, `WD10M`, `PRECTOTCORR`, `RH2M`, `ALLSKY_SFC_SW_DWN`), **GPM IMERG**, and **Earthdata CMR** | Transmission towers, river pipeline crossings, mine haul roads | `Earth System Trend Detective` |
| **Close-Range Visual & Telemetry Verification** | Simulated + live **drone patrol video**, **fixed tower cameras**, and **IoT vibration/strain/pressure sensors** over **NATS JetStream** | Specific spans, valves, spillways, and industrial units flagged by satellite layers | Cross-cutting Digital Twin layer |

## 4. Target Engineering Stack (100% English Specification)

| Layer | Technology | Role in the 48-Hour Build (`Nov 14 to Nov 15`) |
| :--- | :--- | :--- |
| **Core Engine, Jobs & Digital Twin** | **Rust** (`tokio`) | High-throughput ingestion jobs (NASA FIRMS `MODIS` + `VIIRS J1/J2`, `EONET`, `POWER`, `ASF`, `CMR`), `MODIS/VIIRS` calendar harmonization, physics-informed asset risk simulators (`IEEE 738` line sag, `TTCE` fire encroachment, slope stability, dam seepage), and digital twin state workers. |
| **Backend-for-Frontend (`BFF`)** | **TypeScript + Bun + Hono** | Low-latency application gateway, typed REST/SSE endpoints, and Ask-the-Grid-style natural-language geospatial query orchestration. |
| **Operator Frontend** | **TanStack (`Router`, `Query`, `Table`) + Bun + React** | Interactive PostGIS/WebGL (`MapLibre GL`) corridor map, `2000 to 2026` Burning Activity Calendar, multi-layer NASA GIBS/FIRMS/SAR/weather/drone switcher, live telemetry timelines, and conversational operator copilot. |
| **Geospatial Database** | **PostgreSQL + PostGIS** | Spatial indexing (`GIST`) of transmission `LINESTRING` spans, dam/mine `POLYGON` perimeters, spatiotemporal `MODIS` + `VIIRS` clustering (`ST_DWithin` 750 m / 180 min), and corridor intersection alerts. |
| **Deployment & Local Stack** | **One-Command Containers + Public Hosting** | Zero-auth live deployment URL registered early on FortiGuard (`https://www.fortiguard.com/faq/wfratingsubmit`), backed by `NATS`/`Redis` or lightweight in-process async channels if needed for speed. |

## 5. Reference Analysis: Why `https://askthegrid.com/` & `https://openinframap.org/` Matter

1. **Map-First Situational Awareness**: `https://askthegrid.com/` and `https://openinframap.org/` turn dense transmission, substation, and nodal grid data into an immediately legible map interface rather than burying operators in static tables.
2. **Natural-Language Grid & Corridor Queries**: Pairing PostGIS spatial queries with a conversational panel lets an operator ask *"Which transmission spans within 5 km of harmonized VIIRS/MODIS hotspots also have NASA POWER wind gusts above 45 km/h or IEEE 738 sag margin under 1.2 m?"* and jump straight to the affected tower span and camera/drone feed.

## 6. Four Instant Judge Demo Presets (`1-Click Corridor Scenarios`)

Every judge landing on the live URL can trigger any of four instant scenarios plus the custom region Burning Activity Calendar with zero sign-up required:

1. **Corridor 1: High-Voltage 500 kV Transmission Right-of-Way**:
   1. Harmonizes live **NASA FIRMS `MODIS C6.1` (1 km) + `VIIRS J1/J2` (375 m)** thermal hotspots with **NASA POWER** wind vectors (`WS10M`, `WD10M`) and **NASADEM** terrain slope.
   2. Computes **Time-to-Corridor-Encroachment (`TTCE`)** and **IEEE 738 Dynamic Line Rating / Conductor Sag Margin**, flagging spans needing immediate load shedding or drone verification.
2. **Corridor 2: Hydroelectric & Tailings Dam Embankment**:
   1. Correlates **NASA ASF (`Sentinel-1` / `OPERA-S1` / `NISAR`) InSAR** millimeter displacement granules with **NASA POWER / GPM IMERG** cumulative precipitation (`PRECTOTCORR`) and pore-pressure telemetry.
   2. Displays dam embankment safety factor trends and spillway gate telemetry in the Rust digital twin inspector.
3. **Corridor 3: Cross-Country Energy & Water Pipeline**:
   1. Combines **VIIRS** 375 m thermal leak/flare anomaly clustering, **EONET v3** regional flood/landslide events, and **NASADEM** slope instability risk.
   2. Dispatches an automated drone patrol waypoint and renders optical + thermal camera verification frames.
4. **Corridor 4: Open-Pit Mine & Industrial Substation Complex**:
   1. Separates expected industrial process heat from anomalous thermal escalation using **Normalized Thermal Anomaly Score (`NTAS`, 0 to 100)** and **Fire Radiative Power Density (`FRPD`)**.
   2. Cross-references ground IoT vibration/strain sensors with satellite passes and `2000 to 2026` historical seasonal baselines to prevent false dispatches.

## 7. Global Judging 30-Second Video Beat Sheet (`<= 0:29`) & 7-Slide Companion Deck

Per the official November 13, 2026 NASA Space Apps Project Submission Guide, exceeding `30` seconds or `7` slides disqualifies the submission from Global Judging. Use the exact official 5-beat video pacing targeting **`0:29` total runtime**:

1. **30-Second Showcase Video (`0:00 to 0:29`, Strict `< 0:30` Cap)**:
   1. **`0:00 to 0:02` (Introduce Yourself)**: State speaker name and team name **`TerraSpan Digital Twin`**.
   2. **`0:02 to 0:05` (Lead Us In)**: State the challenge (**`Harmonization of MODIS and VIIRS Hot Spots`**) and inspiration: incompatible 1 km MODIS and 375 m VIIRS fire records leave utilities and responders blind to multi-decade trends and active grid threats.
   3. **`0:05 to 0:10` (Name Your Project)**: Flash **`TerraSpan`** title card and tagline: *"One harmonized orbital timeline and physical digital twin for Earth's critical infrastructure."*
   4. **`0:10 to 0:20` (Describe Your Idea & Prototype)**: Live screen capture toggling the **`2000 to 2026` Harmonized Burning Activity Calendar**, clicking **Corridor 1** on the MapLibre canvas, running an **`Ask the Grid`** query, and showing **NASA FIRMS + GIBS + POWER + ASF Sentinel-1/NISAR + NASADEM + EONET** calculating `FRPD`, `NTAS`, `TTCE`, and `IEEE 738` line sag.
   5. **`0:20 to 0:29` (Look Into the Future)**: Show all 4 infrastructure sectors (`Transmission`, `Dams`, `Pipelines`, `Mines`) plus global wildfire resilience impact and zero-auth public URL.
2. **7-Slide Companion Deck Outline (`<= 7` Slides Total, Public Zero-Login Link)**:
   1. **Slide 1 (Title & Mandatory Credits)**: Project Title (`TerraSpan`), **Team Name (`TerraSpan Digital Twin`)**, **Team Member Name(s)**, and **Selected Challenge (`Harmonization of MODIS and VIIRS Hot Spots`)**.
   2. **Slide 2 (The Problem & Blind Spot)**: Why mismatched `MODIS` (`1 km`) and `VIIRS` (`375 m`) records distort fire history and leave grids, pipelines, dams, and mines vulnerable.
   3. **Slide 3 (Scientific Core & Harmonization)**: Elliptical footprint calibration into `FRPD`, `NTAS`, `TTCE`, and `IEEE 738` line sag on unified `H3` cells.
   4. **Slide 4 (User Experience & Burning Activity Calendar)**: Screenshots of the `2000 to 2026` Burning Activity Calendar, region/date selector, and `Ask the Grid` conversational panel.
   5. **Slide 5 (NASA & Space Agency Partner Data Role)**: Exact architecture showing how **NASA FIRMS, GIBS, POWER, ASF SAR, NASADEM, EONET** and **ESA Sentinel-1** power the Rust + PostGIS + Bun/Hono + TanStack/React pipeline.
   6. **Slide 6 (1-Click Live Corridor Presets)**: Visual proof across the 4 corridors (`500 kV Lines`, `Dams`, `Pipelines`, `Mines`) with zero-auth judge access.
   7. **Slide 7 (Global Impact & Open Links)**: Future planetary resilience impact, public zero-login app URL, FortiGuard rating status, and open-source GitHub repository.
