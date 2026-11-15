# Demo Video & Deck Verification Report

Verified on `2026-11-15` after executing `bun run submission:media` against `SubmissionStudio.tsx` (`mdxcn` components + `ascii.rest` backdrops) and the live production server build (`bun server.mjs` with `/proxy/*` and `/cradleflow/` enabled).

## 1. Demo Video Checks (`<= 30.0s` Cap)

| Check Item | Measured Value | Limit / Criterion | Result |
| :--- | :--- | :--- | :--- |
| Output File | [dopaimint-demo-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-28s.mp4) | Public zero login MP4 | `PASS` |
| Exact Runtime | `28.500000` seconds (`855` frames at `30 fps`) | Strictly `<= 29.5s` (`0:31` disqualifies) | `PASS` |
| File Size | `2,636,623` bytes (`2.51 MiB`) | Fast streaming over Railway | `PASS` |
| Video Codec & Geometry | `h264` High, `1920x1080`, `16:9` progressive | Clean 1080p HD desktop playback | `PASS` |
| Audio Stream | `aac` LC stereo (`audio.wav` 48 kHz source), normalized toward `-16 LUFS` | Clean instrumental bed & cues | `PASS` |
| Black Frame Audit | `ffmpeg blackdetect=d=0.5:pix_th=0.05` (`0` black segments) | Zero unintended blank dropouts | `PASS` |
| Contact Sheet Review | `submission-motion-frames.png` (`4x3` grid across 5 beats) | Zero text overlaps or clipped frames | `PASS` |

## 2. Companion PDF Deck (`<= 7` Slides Cap)

| Check Item | Measured Value | Limit / Criterion | Result |
| :--- | :--- | :--- | :--- |
| Output File | [dopaimint-deck-7slides.pdf](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-deck-7slides.pdf) | Public zero login PDF | `PASS` |
| Page Count Audit | Exact `7` PDF page objects (`/Type /Page`) | Strictly `<= 7` slides including title | `PASS` |
| File Size | `4,376,830` bytes (`4.17 MiB`) | Lightweight instant browser open | `PASS` |
| Visual Contact Sheet | `submission-deck-7slides-sheet.png` (`7` `mdxcn` + `ascii.rest` tiles) | Every card, metric, and frame unclipped | `PASS` |

## 3. Inline Project Page PNG Figures (`< 10 MB` Cap Each)

| PNG Asset | Dimensions | File Size | Role in Project Page Editor |
| :--- | :--- | :--- | :--- |
| [01-architecture-pipeline.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/01-architecture-pipeline.png) | `1920x1080` | `203,090` bytes (`0.19 MB`) | `mdxcn` `GraphSpec` + `GraphStat` + `GraphFlow` + `GraphTable` architecture diagram over `ascii.rest` `earthrise` canvas |
| [02-overview-burning-calendar.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/02-overview-burning-calendar.png) | `1920x1080` | `752,657` bytes (`0.72 MB`) | Observatory flagship landing hero framed in `mdxcn` (`Graph`, `GraphStat`, `Callout`) over `ascii.rest` `earth` canvas |
| [03-orbital-provenance-map.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/03-orbital-provenance-map.png) | `1920x1080` | `528,101` bytes (`0.50 MB`) | Five layer orbital data fusion framed in `mdxcn` (`Graph`, `Endpoint`, `GraphCheck`) over `ascii.rest` `radar` canvas |
| [04-earth-grid-triage-phase1.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/04-earth-grid-triage-phase1.png) | `1920x1080` | `493,496` bytes (`0.47 MB`) | Phase 01 triage drill framed in `mdxcn` (`Graph`, `Steps`, `GraphKpi`) over `ascii.rest` `aurora` canvas |
| [05-cradleflow-habitat-phase2.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/05-cradleflow-habitat-phase2.png) | `1920x1080` | `545,127` bytes (`0.52 MB`) | Phase 02 embedded CradleFlow canvas framed in `mdxcn` (`Graph`, `GraphFlow`, `GraphSpec`) over `ascii.rest` `solar-system` canvas |
