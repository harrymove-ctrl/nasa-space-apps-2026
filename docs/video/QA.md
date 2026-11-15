# Demo Video & Deck Verification Report

Verified on `2026-11-15` after executing `bun run submission:media` against the live production server build (`bun server.mjs` with `/proxy/*` and `/cradleflow/` enabled).

## 1. Demo Video Checks (`<= 30.0s` Cap)

| Check Item | Measured Value | Limit / Criterion | Result |
| :--- | :--- | :--- | :--- |
| Output File | [terraspan-demo-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/terraspan-demo-28s.mp4) | Public zero login MP4 | `PASS` |
| Exact Runtime | `28.500000` seconds (`855` frames at `30 fps`) | Strictly `<= 29.5s` (`0:31` disqualifies) | `PASS` |
| File Size | `4,389,167` bytes (`4.19 MiB`) | Fast streaming over Railway | `PASS` |
| Video Codec & Geometry | `h264` High, `1920x1080`, `16:9` progressive, `1019.7 kbps` | Clean 1080p HD desktop playback | `PASS` |
| Audio Stream | `aac` LC stereo, `203.3 kbps`, normalized toward `-16 LUFS` | Clean instrumental bed & cues | `PASS` |
| Black Frame Audit | `ffmpeg blackdetect=d=0.5:pix_th=0.05` (`0` black segments) | Zero unintended blank dropouts | `PASS` |
| Contact Sheet Review | `submission-motion-frames.png` (`4x3` grid across 5 beats) | Zero text overlaps or clipped frames | `PASS` |

## 2. Companion PDF Deck (`<= 7` Slides Cap)

| Check Item | Measured Value | Limit / Criterion | Result |
| :--- | :--- | :--- | :--- |
| Output File | [terraspan-deck-7slides.pdf](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/terraspan-deck-7slides.pdf) | Public zero login PDF | `PASS` |
| Page Count Audit | Exact `7` PDF page objects (`/Type /Page`) | Strictly `<= 7` slides including title | `PASS` |
| File Size | `4,660,854` bytes (`4.45 MiB`) | Lightweight instant browser open | `PASS` |
| Visual Contact Sheet | `submission-deck-7slides-sheet.png` (`1920x1080` tiles) | Every card, metric, and frame unclipped | `PASS` |

## 3. Inline Project Page PNG Figures (`< 10 MB` Cap Each)

| PNG Asset | Dimensions | File Size | Role in Project Page Editor |
| :--- | :--- | :--- | :--- |
| [01-architecture-pipeline.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/01-architecture-pipeline.png) | `1920x1080` | `733,154` bytes (`0.70 MB`) | Four column NASA feed to harmonization and escalation diagram |
| [02-overview-burning-calendar.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/02-overview-burning-calendar.png) | `1920x1080` | `1,070,757` bytes (`1.02 MB`) | Observatory flagship landing hero & corridor readout |
| [03-orbital-provenance-map.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/03-orbital-provenance-map.png) | `1920x1080` | `517,288` bytes (`0.49 MB`) | Five layer orbital data fusion & NASA endpoint provenance map |
| [04-earth-grid-triage-phase1.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/04-earth-grid-triage-phase1.png) | `1920x1080` | `494,726` bytes (`0.47 MB`) | Phase 01 interactive three wave grid triage drill |
| [05-cradleflow-habitat-phase2.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/05-cradleflow-habitat-phase2.png) | `1920x1080` | `605,826` bytes (`0.58 MB`) | Phase 02 embedded CradleFlow node canvas synced from TerraSpan |
