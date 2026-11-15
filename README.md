# NASA Space Apps Challenge 2026

Workspace at `/Volumes/Dev/nasa-space-apps-2026` (`https://www.spaceappschallenge.org/2026/`).

## Projects

1. [Unified Flagship: DopaiMint + CradleFlow (`projects/project_1` + `/cradleflow/`)](projects/project_1/PROJECT.md): Unified orbital-to-outpost telemetry platform hosted at `https://dopaimint-production.up.railway.app`. Combines DopaiMint (keyless 26-year MODIS C6.1 and VIIRS 375 m hotspot harmonization, NASA POWER IEEE 738 conductor derating, 5-layer Provenance Map, and Phase 01 Earth Grid Triage) directly with same-origin Phase 02 CradleFlow Habitat Automation (`/cradleflow/index.html`) inside a single workflow.
2. [Standalone Mirror: CradleFlow Junior Astronaut Trainer (`projects/project_2`)](projects/project_2/README.md): Direct standalone deployment at `https://cradleflow-production.up.railway.app` with an `Earth Twin` navigation link back to DopaiMint and full NASA DONKI, NOAA SWPC GOES-18, and NASA OSDR radiobiology simulation.

## Workspace Documentation

1. [Competition Rules, Dates and Global Awards](docs/COMPETITION.md)
2. [Candidate Concept: Physical Infrastructure Satellite and Sensor Digital Twin](docs/IDEA_INFRASTRUCTURE_TWIN.md)
3. [Pre-Event Challenge and NASA Open Dataset Research](docs/RESEARCH.md)
4. [Saved Pre-Event References](reference-list/README.md)
5. [Multi-Phase Roadmap and Schedule](docs/PLAN.md)
6. [Submission Checklist](docs/SUBMISSION.md)
7. [Final Copy-Paste Portal Pack & Master Checklist](docs/FINAL_SUBMISSION_PACK.md)
8. [Twice-Daily Update Log](docs/DAILY_LOG.md)

## Quick Start & Public URLs

1. Live Unified Flagship Public Website (`DopaiMint + Phase 02 CradleFlow`): `https://dopaimint-production.up.railway.app` (Guided Tour: `https://dopaimint-production.up.railway.app/?tour=1`; 5-Layer Provenance Map: `https://dopaimint-production.up.railway.app/?view=map`; Phase 01 Triage Game: `https://dopaimint-production.up.railway.app/?view=game`; Direct Phase 02 Canvas: `https://dopaimint-production.up.railway.app/?view=game&stage=cradleflow`; Same-origin Fullscreen CradleFlow: `https://dopaimint-production.up.railway.app/cradleflow/`)
2. Official Submission Media, Product Video Studio & Interactive 7-Slide Viewer Hub: `https://dopaimint-production.up.railway.app/submission/` (Main Landing Demo Studio: `https://dopaimint-production.up.railway.app/#demo`, Fullscreen Video Studio: `https://dopaimint-production.up.railway.app/demo`, Interactive 7-Slide Deck: `https://dopaimint-production.up.railway.app/slides`, `28.50s` Official NASA `<=30s` HD MP4: `https://dopaimint-production.up.railway.app/submission/dopaimint-demo-1080p-28s.mp4`, `92.00s` Full Launch MP4: `https://dopaimint-production.up.railway.app/submission/dopaimint-cyberpunk-1080p.mp4`, `7-Slide PDF`: `https://dopaimint-production.up.railway.app/submission/dopaimint-deck-7slides.pdf`)
3. Secondary Standalone CradleFlow Mirror (`projects/project_2`): `https://cradleflow-production.up.railway.app` (Guided Cadet Tour: `https://cradleflow-production.up.railway.app/?tour=1`)
4. Local Unified Build & Preview (`projects/project_1` on `http://127.0.0.1:5179`): `cd projects/project_1 && bun install && bun run build && bun run dev`
5. Local CradleFlow Standalone (`projects/project_2` on `http://127.0.0.1:5185`): `cd projects/project_2 && bun install && bun run test && bun run build && bun run dev`
