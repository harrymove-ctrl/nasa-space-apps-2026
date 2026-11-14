# NASA Space Apps Challenge 2026: Pre-Event Data, Community & Winner Playbook

1. **Workspace Mode**: Pre-event research only until Saturday, November 14, 2026 at 09:00 AM local time (`2026-11-14T09:00:00+07:00`).
2. **Official Challenge Hub**: https://www.spaceappschallenge.org/2026/challenges/
3. **Team & Primary Challenge**: **TerraSpan Digital Twin** (Solo Closed Team) anchored on `Harmonization of MODIS and VIIRS Hot Spots`, cross-linked with `Dancing with the SARs` and `Earth System Trend Detective`.
4. **Saved UX & Stack References**: [IDEA_INFRASTRUCTURE_TWIN.md](IDEA_INFRASTRUCTURE_TWIN.md), `https://askthegrid.com/`, `https://openinframap.org/`, and [`../reference-list/references.json`](../reference-list/references.json).

## 1. Verified Live Keyless NASA Endpoints (Probed HTTP 200 on Nov 13, 2026)

All endpoints below were directly probed and verified live on November 13, 2026 without requiring paid keys or gated OAuth tokens for initial ingestion:

| Dataset / Feed | Live Keyless Endpoint & Format | Verified Payload / Gotcha Notes |
| :--- | :--- | :--- |
| **NASA FIRMS MODIS Collection 6.1 (1 km, Global 24h CSV)** | `https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv` | Live 888 KB feed (`HTTP 200`). Columns: `latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight`. |
| **NASA FIRMS VIIRS NOAA-20 / J1 (375 m, Global 24h CSV)** | `https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv` | Live 5.13 MB feed (`HTTP 200`). Columns: `latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,confidence,version,bright_ti5,frp,daynight`. |
| **NASA FIRMS VIIRS NOAA-21 / J2 (375 m, Global 24h CSV)** | `https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_Global_24h.csv` | Live 5.23 MB feed (`HTTP 200`). *(Gotcha: `SUOMI_VIIRS_C2_Global_24h.csv` currently returns a 112-byte header only; always ingest `J1_VIIRS_C2_Global_24h.csv` and `J2_VIIRS_C2_Global_24h.csv` alongside `MODIS_C6_1_Global_24h.csv`.)* |
| **NASA GIBS WMTS / XYZ Raster & Vector Tiles** | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{Layer}/default/{Time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png` | Keyless slippy-map layers: `VIIRS_NOAA20_Thermal_Anomalies_375m_All`, `MODIS_Combined_Thermal_Anomalies_All`, and `VIIRS_SNPP_CorrectedReflectance_TrueColor` (`.jpg`). Vector `.mvt` tiles also supported. |
| **NASA EONET v3 Natural Hazard Events API** | `https://eonet.gsfc.nasa.gov/api/v3/events?limit=50&status=open` | Live JSON/GeoJSON feed (`HTTP 200`) tracking open wildfires, severe storms, floods, volcanoes, and landslides globally. |
| **NASA POWER Meteorology & Solar API** | `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,WS10M,WD10M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN&community=RE&longitude={lon}&latitude={lat}&start={YYYYMMDD}&end={YYYYMMDD}&format=JSON` | Live GeoJSON (`HTTP 200`) returning ambient temperature (`T2M`), 10m wind speed (`WS10M`), wind direction (`WD10M`), precipitation (`PRECTOTCORR`), relative humidity (`RH2M`), and solar irradiance for `IEEE 738` line rating and fire spread. |
| **NASA ASF DAAC SAR Search API** | `https://api.daac.asf.alaska.edu/services/search/param?dataset=SENTINEL-1,OPERA-S1,NISAR&intersectsWith=POLYGON(...)&maxResults=25&output=geojson` | Live GeoJSON/JSON-lite (`HTTP 200`) returning `Sentinel-1D`, `OPERA-S1`, and `NISAR` InSAR surface deformation granules (`canInSAR: true`). |
| **NASA Earthdata CMR Granule Search API** | `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=NASADEM_HGT&bounding_box={west},{south},{east},{north}&page_size=10` | Live JSON (`HTTP 200`) returning 30m `NASADEM_HGT` elevation granule bounds and metadata. |

*(Optional Regional Bounding Box API for FIRMS: Register a free `MAP_KEY` at `https://firms.modaps.eosdis.nasa.gov/api/map_key/` to query `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_NOAA20_NRT/{BBOX}/{DAYS}` or WFS GeoJSON via `mapserver/wfs`.)*

## 2. MODIS + VIIRS Harmonization Physics & PostGIS Algorithm

To stand out scientifically rather than plotting duplicate dots on a map, the Rust digital twin and PostGIS engine harmonize `MODIS` and `VIIRS` into one unified physical hazard layer:

1. **Elliptical Pixel Footprint Modeling**:
   1. Both sensors measure along-scan (`scan` km) and along-track (`track` km) dimensions that expand away from nadir.
   2. Each hotspot observation is projected in PostGIS as an oriented footprint polygon (`area_km2 = pi * (scan / 2) * (track / 2)`), preserving the `1.0 km` nominal nadir scale of `MODIS` (`MODIS_C6_1`) versus the `375 m` nominal nadir scale of `VIIRS` (`J1`/`J2`).
2. **Spatiotemporal Clustering & Deduplication**:
   1. PostGIS clusters detections across `MODIS` (`Terra`/`Aqua`) and `VIIRS` (`NOAA-20`/`NOAA-21`) using `ST_DWithin(geom, candidate_geom, 750)` (750 meters) and `ABS(EXTRACT(EPOCH FROM (ts1-ts2))) <= 10800` (within 180 minutes).
   2. Overlapping detections merge into a single **Harmonized Thermal Cluster** that keeps `VIIRS` 375 m sub-pixel centroid precision while fusing multi-pass `MODIS` diurnal history and confidence provenance.
3. **Radiometric Harmonization & Unified Metrics**:
   1. `MODIS` reports Channel 21/22 brightness (`brightness`, 3.96 um), Channel 31 background temperature (`bright_t31`, 11.0 um), and numeric confidence (`0 to 100`).
   2. `VIIRS` reports I-4 brightness (`bright_ti4`, 3.74 um), I-5 background temperature (`bright_ti5`, 11.45 um), and categorical confidence (`low` mapped to `30`, `nominal` mapped to `70`, `high` mapped to `95`).
   3. Both harmonize into two dimensionless operator decision metrics: **Fire Radiative Power Density (`FRPD = frp / area_km2`, MW/km2)** and **Normalized Thermal Anomaly Score (`NTAS`, 0 to 100)** weighted by delta-T above background (`T_fire minus T_bg`), sensor confidence, and scan-angle distortion penalty.
4. **Infrastructure Impact Physics (`TTCE` & `IEEE 738`)**:
   1. **Time-to-Corridor-Encroachment (`TTCE`, hours)**: Combines `ST_Distance` from cluster perimeter to the infrastructure `LINESTRING`/`POLYGON` with `NASA POWER` 10m wind speed (`WS10M`), wind direction alignment (`WD10M`), relative humidity (`RH2M`), and `NASADEM` terrain slope factor.
   2. **IEEE 738 Dynamic Line Rating & Conductor Sag Risk**: Feeds `NASA POWER` ambient temperature (`T2M`), wind speed (`WS10M`), solar irradiance (`ALLSKY_SFC_SW_DWN`), and radiative fire heat flux from nearby `FRPD` clusters into a Rust `IEEE 738` thermal balance solver to compute ampacity derating and ground-clearance sag margin per transmission span.

## 3. Reddit (`r/spaceapps`), X & Past Global Winner Playbook (2024 & 2025)

Research across `r/spaceapps`, organizer guidelines, and the 2024 and 2025 NASA Space Apps Global Winners highlights four decisive execution rules:

1. **The Strict 30-Second Showcase Video (`<= 0:30`) or 7-Slide Rule**:
   1. Global judging enforces a strict **30-second maximum** on the primary Project Tab showcase video (or 7-slide summary deck) because judges review hundreds of entries.
   2. **Winning 30-Second Beat Structure**: `0 to 5s` Problem hook (zero intro fluff or team bios), `5 to 20s` Live app action explicitly calling out the harmonized NASA datasets (`MODIS + VIIRS + POWER + ASF SAR + GIBS`), and `20 to 30s` Quantitative impact metric (`TTCE`, `IEEE 738` ampacity derating, dam creep mm/yr) plus dataset citations. Put longer technical walkthroughs in the GitHub README.
2. **Lessons from 2024 & 2025 Global Winners**:
   1. **Waterwise (2024 Best Use of Data, Team GaamaRamma)**: Turned complex NASA OpenET and rainfall series into immediate field-level irrigation indicators and 7-day charts. *Lesson*: Translate raw satellite CSVs into clear operator metrics (`NTAS`, `TTCE`, `IEEE 738 Sag Margin`).
   2. **SkySense (2025 Best Use of Technology, Team Twisters)**: Blended multiple NASA satellite and weather feeds through a robust data pipeline into clean probability indicators. *Lesson*: Show real data pipeline fusion (`Rust + PostGIS + NATS + Redis`) with instant probability and risk gauges.
   3. **42 QuakeHeroes (2024 Best Use of Technology) & Resonant Exoplanets (2025 Best Use of Data)**: Combined automated signal detection with transparent, verifiable scientific reasoning. *Lesson*: Expose every formula, confidence weight, and NASA source attribution directly in the UI inspector.
3. **Zero-Friction Judge UX (`Ask the Grid` + `OpenInfraMap` Pattern)**:
   1. Deploy a zero-auth live web URL with **1-Click Corridor Presets** so a judge sees live harmonized NASA alerts intersecting real transmission lines, dams, pipelines, and mines within 2 seconds of opening the link, plus an `Ask the Grid` conversational query bar.

## 4. Pre-Start Compliance Checklist (Before Nov 14, 09:00 AM ICT)

1. `projects/project_1/src/` remains strictly empty (`0` source files) until **Saturday, November 14, 2026 at 09:00 AM ICT**.
2. Team registration (`TerraSpan Digital Twin`) is confirmed complete on `https://www.spaceappschallenge.org/2026/`.
3. At `09:00 AM ICT` tomorrow, unlock `projects/project_1` and build the complete Rust + TS/Bun/Hono + TanStack/React + PostGIS + NATS + Redis + k8s stack against these live verified NASA endpoints.
