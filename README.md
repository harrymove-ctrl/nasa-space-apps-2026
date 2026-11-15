# NASA Space Apps Challenge 2026

Workspace at `/Volumes/Dev/nasa-space-apps-2026` (`https://www.spaceappschallenge.org/2026/`).

## Projects

1. [Unified Flagship: TerraSpan + CradleFlow (`projects/project_1` + `/cradleflow/`)](projects/project_1/PROJECT.md): Unified orbital-to-outpost telemetry platform hosted at `https://terraspan-production.up.railway.app`. Combines TerraSpan (keyless 26-year MODIS C6.1 and VIIRS 375 m hotspot harmonization, NASA POWER IEEE 738 conductor derating, 5-layer Provenance Map, and Phase 01 Earth Grid Triage) directly with same-origin Phase 02 CradleFlow Habitat Automation (`/cradleflow/index.html`) inside a single workflow.
2. [Standalone Mirror: CradleFlow Junior Astronaut Trainer (`projects/project_2`)](projects/project_2/README.md): Direct standalone deployment at `https://cradleflow-production.up.railway.app` with an `Earth Twin` navigation link back to TerraSpan and full NASA DONKI, NOAA SWPC GOES-18, and NASA OSDR radiobiology simulation.

## Workspace Documentation

1. [Competition Rules, Dates and Global Awards](docs/COMPETITION.md)
2. [Candidate Concept: Physical Infrastructure Satellite and Sensor Digital Twin](docs/IDEA_INFRASTRUCTURE_TWIN.md)
3. [Pre-Event Challenge and NASA Open Dataset Research](docs/RESEARCH.md)
4. [Saved Pre-Event References](reference-list/README.md)
5. [Multi-Phase Roadmap and Schedule](docs/PLAN.md)
6. [Submission Checklist](docs/SUBMISSION.md)
7. [Twice-Daily Update Log](docs/DAILY_LOG.md)

## Quick Start & Public URLs

1. Live Unified Flagship Public URL (`TerraSpan + Phase 02 CradleFlow`): `https://terraspan-production.up.railway.app` (Guided Tour: `https://terraspan-production.up.railway.app/?tour=1`; Direct Phase 02 Canvas: `https://terraspan-production.up.railway.app/?view=game&stage=cradleflow`; Same-origin Fullscreen CradleFlow: `https://terraspan-production.up.railway.app/cradleflow/`)
2. Secondary Standalone CradleFlow Mirror (`projects/project_2`): `https://cradleflow-production.up.railway.app` (Guided Cadet Tour: `https://cradleflow-production.up.railway.app/?tour=1`)
3. Local Unified Build & Preview (`projects/project_1` on `http://127.0.0.1:5179`): `cd projects/project_1 && bun install && bun run build && bun run dev`
4. Local CradleFlow Standalone (`projects/project_2` on `http://127.0.0.1:5185`): `cd projects/project_2 && bun install && bun run test && bun run build && bun run dev`
