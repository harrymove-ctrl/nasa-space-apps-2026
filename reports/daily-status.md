# Twice-Daily Hackathon Status Snapshot: NASA Space Apps 2026 & Active Hackathons

1. **Last Checked (UTC)**: `2026-11-14T10:01:19.969Z` (`2026-11-14 17:01 ICT`)
2. **Workspace**: `/Volumes/Dev/nasa-space-apps-2026`
3. **Current Phase Gate**: LIVE HACKATHON BUILD WINDOW (**1d 7h** / ~31h until Nov 15, 2026 at 11:59 PM ICT)
4. **Candidate Idea Brief**: `docs/IDEA_INFRASTRUCTURE_TWIN.md` (Physical Infrastructure Satellite + Weather + Terrain + Camera/Drone/Sensor Digital Twin on **Rust + TS/Bun/Hono + TanStack/Bun/React + PostgreSQL/PostGIS + NATS + Redis + k8s**)
5. **Registration & Submission Close**: `2026-11-15T23:59:00+07:00` (**1d 7h left**, ~31 hours remaining)
6. **Official Site Reachability**: `ONLINE` (NASA Space Apps Challenge)
7. **Awards Model**: Global Recognition & 10 NASA Global Award Categories (No Verified Cash Pool)

## 1. NASA Space Apps Challenge 2026 Projects & Fair-Play Audit

| Project | Path | Source Files | Pre-Start Rule Audit | Status |
| :--- | :--- | :--- | :--- | :--- |
| `project_1` | `/Volumes/Dev/nasa-space-apps-2026/projects/project_1` | 33 | `LIVE BUILD WINDOW (33 source files)` | Phase 0 (Pre-Event Research Only; Locked Until Nov 14, 2026 09:00 AM Start) |
| `project_2` | `/Volumes/Dev/nasa-space-apps-2026/projects/project_2` | 25 | `LIVE BUILD WINDOW (25 source files)` | Phase 0 (Pre-Event Research Only; Locked Until Nov 14, 2026 09:00 AM Start) |

## 2. Saved Pre-Event References (`reference-list/`)

| Reference | Source / Doc | Stack / Role | Status |
| :--- | :--- | :--- | :--- |
| **Ask the Grid (Interactive Power Grid Map & Conversational Energy Intelligence)** | https://askthegrid.com/ | Primary UI/UX reference for geospatial transmission/pipeline corridor mapping and plain-English operator queries | `saved_for_nov_14_start` |
| **OpenInfraMap (Global Power Grid, Pipeline & Telecom Symbology)** | https://openinframap.org/ | Visual styling reference for voltage-tiered transmission lines, substations, and energy pipeline overlays | `saved_for_nov_14_start` |
| **NASA FIRMS 24h Global CSV Feeds (MODIS C6.1, VIIRS NOAA-20 J1, VIIRS NOAA-21 J2)** | https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv | Verified HTTP 200 keyless active thermal anomaly feeds for MODIS + VIIRS spatiotemporal harmonization | `verified_http_200_nov_13` |
| **NASA GIBS WMTS / XYZ Slippy-Map Raster & Vector Tiles** | https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_Thermal_Anomalies_375m_All/default/{Time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png | Keyless satellite imagery and thermal anomaly tile overlays for MapLibre GL frontend | `verified_keyless_nov_13` |
| **NASA EONET v3 Natural Hazard Events API** | https://eonet.gsfc.nasa.gov/api/v3/events?limit=50&status=open | Live keyless GeoJSON/JSON feed for active wildfires, severe storms, floods, volcanoes, and landslides | `verified_http_200_nov_13` |
| **NASA POWER Meteorology & Solar API** | https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,WS10M,WD10M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=-121.5&latitude=39.8&start=20250101&end=20250102&format=JSON | Keyless point meteorology (temperature, 10m wind vector, precipitation, RH, irradiance) for IEEE 738 dynamic line rating and TTCE | `verified_http_200_nov_13` |
| **NASA Alaska Satellite Facility (ASF) DAAC SAR Search API** | https://api.daac.asf.alaska.edu/services/search/param?dataset=SENTINEL-1&maxResults=10&output=geojson | Keyless GeoJSON search for Sentinel-1, OPERA-S1, and NISAR InSAR ground deformation granules | `verified_http_200_nov_13` |
| **NASA Earthdata CMR NASADEM 30m Elevation Granule Search** | https://cmr.earthdata.nasa.gov/search/granules.json?short_name=NASADEM_HGT&page_size=10 | Keyless terrain elevation metadata lookup for slope factor and line clearance modeling | `verified_http_200_nov_13` |
| **NASA Space Apps 2024 & 2025 Global Winners + Reddit/Judging Playbook** | https://www.spaceappschallenge.org/2025/awards/global-winners/ | Judging alignment, 30-second video beat structure, and 7-slide companion deck rubric | `saved_for_nov_14_start` |
| **Physical Infrastructure Satellite + Weather + Terrain + Drone/Sensor Digital Twin Architecture** | `/Volumes/Dev/nasa-space-apps-2026/docs/IDEA_INFRASTRUCTURE_TWIN.md` | Rust (jobs, simulators, digital twin) + TypeScript/Bun/Hono (BFF) + TanStack/Bun/React (Frontend) + PostgreSQL/PostGIS + NATS + Redis + Kubernetes (k8s) | `saved_for_nov_14_start` |

## 3. Active Hackathons & Grant Calls on `/Volumes/Dev` (Sorted by Days Remaining Ascending)

| Hackathon | Workspace Path | Deadline | Days Remaining | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NEAR Hackathon ($250,000 Prize Pool)** | `/Volumes/Dev/near-hackathon` | Nov 14, 2026 23:59 UTC (Nov 15, 6:59 AM ICT) | **0d 14h left** (~14h) | `active` |
| **NASA Space Apps Challenge 2026** | `/Volumes/Dev/nasa-space-apps-2026` | Nov 15, 2026 11:59 PM Local Time (Starts Nov 14, 09:00 AM ICT) | **1d 7h left** (~31h) | `active (Idea & AskTheGrid Ref Saved; Code Locked Until Nov 14)` |
| **Mezo Buildathon on AKINDO (Build with MUSD and MEZO)** | `/Volumes/Dev/mezo-buildathon` | Nov 15, 2026 23:59 UTC (Wave 2 Close; Winners Nov 23) | **1d 14h left** (~38h) | `active` |
| **Meta VR Start Developer Competition 2026** | `/Volumes/Dev/meta-vr-start-2026` | Nov 18, 2026 12:00 PM PST (Nov 19, 3:00 AM ICT) | **4d 10h left** (~106h) | `active` |
| **Mozilla Foundation Incubator: Human-Scale AI** | `/Volumes/Dev/mozilla-human-scale-ai-2026` | Nov 21, 2026 07:59 UTC (Nov 21, 2026 2:59 PM ICT; Info Session Nov 12, 17:00 UTC) | **6d 22h left** (~166h) | `active (Grant CFP; Portal Open; Due Nov 21 07:59 UTC)` |
| **Presage SmartSpectra SDK Challenge (DEV Challenge)** | `/Volumes/Dev/presage-smartspectra-2026` | Nov 22, 2026 11:59 PM PST (Nov 23, 2026 2:59 PM ICT; Solo Only) | **8d 22h left** (~214h) | `active (Solo DEV Challenge; Consent Gate; No Medical Claims)` |
| **Ought Epistemics Fund (Lightcone Commons)** | `/Volumes/Dev/ought-epistemics-fund-2026` | Nov 26, 2026 (Editable Draft; Safe Target Nov 24; + Lightcone Round) | **12d 14h left** (~302h) | `active ($500K-$5M Grant; Editable Doc; Safe Target Nov 24)` |
| **OpenSats General Fund and Nostr Fund** | `/Volumes/Dev/opensats-grant-2026` | Open through Nov 2026 (Closes Dec; No exact Nov 30 hour published, target by Nov 28) | 16 days left | `active (FOSS Grant; Target by Nov 28 before Dec close)` |
| **Anna AI App Builder Program** | `/Volumes/Dev/anna-ai-app-builder` | Nov 30, 2026 15:59 UTC (Nov 30, 2026 10:59 PM ICT; requires >= 200 MAU) | 17 days left | `active (Conditional Grant; Marketplace + >= 200 MAU)` |
| **Firebase #BuildHybridAI 2026** | `/Volumes/Dev/firebase-hybrid-ai-2026` | Nov 30, 2026 2:00 PM PST / 22:00 UTC (Dec 1, 2026 5:00 AM ICT) | 17 days left | `active (Awaiting Full Rules Nov 12 00:00 ICT)` |
| **Google: The Gemma 4 Developer Agent Competition & Paper Track** | `/Volumes/Dev/gemma-4-developer-agent` | Track 2 Entry/Merger: Nov 25, 2026; Final Agent: Dec 2, 2026 23:59 UTC (Track 1 Paper: Submitted & Completed) | 19 days left | `active (Track 2 $75K Agent Active; Track 1 Paper Completed)` |
| **Kiroween 2026: Kiro Annual Halloween Hackathon** | `/Volumes/Dev/kirohack` | Dec 4, 2026 2:00 PM PST (Dec 5, 5:00 AM ICT) | 21 days left | `active` |
| **Arbitrum Mentorship Program, Cohort 2** | `/Volumes/Dev/arbitrum-mentorship-c2` | Dec 6, 2026 (No exact cutoff hour published, ongoing review; safe target Dec 4) | 22 days left | `active (12-Wk Mentorship; Ongoing Review to Dec 6)` |
| **X Layer Build X: TapeOut Accelerate** | `/Volumes/Dev/xlayer-tapeout-accelerate` | Dec 7, 2026 23:59 UTC (Dec 8, 2026 6:59 AM ICT; Offline Demo Day Location TBD) | 24 days left | `active (TapeOut + X Layer; Offline Demo Day Location TBD)` |
| **Reddit's Game of the Day Hackathon 2026** | `/Volumes/Dev/reddit-daily-games-2026` | Dec 8, 2026 6:00 PM PST / Dec 9, 02:00 UTC (Dec 9, 2026 9:00 AM ICT) | 25 days left | `active (Devvit Web + labs.google/playground Ref Saved; Do Not Publish App)` |
| **Concordium Trusted Agents Hackathon** | `/Volumes/Dev/concordium-trusted-agents` | Dec 9, 2026 23:59 UTC (Dec 10, 2026 6:59 AM ICT; Grants Pathway) | 26 days left | `active (Encode Club Testnet + 75M CCD Grants Pathway)` |
| **Atlassian Codegeist 2026: Build with context. Ship with confidence.** | `/Volumes/Dev/codegeist-2026` | Dec 22, 2026 20:00 UTC / 12:00 PM PST (Dec 23, 3:00 AM ICT; Build Session Nov 17) | 39 days left | `active (Forge + Rovo/MCP/TWG; Build Session Nov 17)` |
| **Decentralize AI Hackathon by HackerNoon** | `/Volumes/Dev/decentralize-ai-hackathon` | Feb 27, 2027 23:59 UTC (Round 2 Final; Safe Target Feb 25, 2027) | 106 days left | `active (Round 2 Open; Nosana + Arweave + MEXC + HackerNoon)` |
| **Windup Builder Program ($25,000 HFT Mentorship & Launch Grant)** | `/Volumes/Dev/windup-builder-program` | Rolling Selection (5 Teams on Elysium / Windup) | NaN days left | `active` |
| **Claudestronomy: Macrogrants Public Sky Data Discovery Program** | `/Volumes/Dev/claudestronomy` | Rolling (Open Now; Email team@macrogrants.com or Text 415-516-3509) | Rolling (Open) | `active (Rolling Grant; Public Sky Data + AI Agents)` |
| **Base Builder Grant Program, Season 2** | `/Volumes/Dev/base-builder-grant-s2` | Rolling (No fixed cutoff published; Live Google Form Open) | Rolling (Open) | `active (Rolling Grant; Exclusive Base Live App)` |

## 4. Non-Destructive Preservation & Fair-Play Rule

Before November 14, 2026 at 09:00 AM local time, `projects/project_1/src/` remains strictly locked at `0` source files for dataset and architecture research only (`docs/IDEA_INFRASTRUCTURE_TWIN.md` and `reference-list/`). When there is no new operator update, all project folders across `/Volumes/Dev` remain untouched.
