# Demo Video & Deck Verification Report

Verified on `2026-11-15` after executing `bun run submission:media` against `SubmissionStudio.tsx` (`mdxcn` components + `ascii.rest` backdrops) and the live production server build (`bun server.mjs` with `/proxy/*` and `/cradleflow/` enabled).

## 1. Demo Video Checks (`<= 30.0s` Cap for Official Field 3)

| Check Item | Measured Value | Limit / Criterion | Result |
| :--- | :--- | :--- | :--- |
| Primary 1080p Submission Cut | [dopaimint-demo-1080p-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4) (`15,700,428` bytes / `14.97 MiB`) | Public zero login `1920x1080` `h264` MP4 (`aac 48000Hz` stereo, `-17.1 LUFS`), `28.5010s` (`855` frames at `30 fps`) | `PASS` |
| Compact Submission Cut | [dopaimint-demo-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-28s.mp4) (`7,894,048` bytes / `7.53 MiB`) | Public zero login `1080x700` `h264` MP4 (`aac 48000Hz` stereo, `-17.1 LUFS`), `28.5010s` (`855` frames at `30 fps`) | `PASS` |
| Extended Launch Showcase (Non Field 3) | [dopaimint-cyberpunk-1080p.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-cyberpunk-1080p.mp4) (`21,837,341` bytes / `20.83 MiB`) | `1920x1080` `h264` MP4 (`aac 48000Hz` stereo, `-17.2 LUFS`), `54.0160s` (`1620` frames at `30 fps`); Field 5 / social showcase only (exceeds `30.0s` Field 3 limit) | `PASS` |
| Black Frame Audit | `ffmpeg blackdetect=d=0.4:pix_th=0.02` (`0` black segments) | Zero unintended dead black dropouts (`pix_th=0.05` falsely matches `#090c14` obsidian dark background luminance `~0.047`) | `PASS` |
| Contact Sheet Review | `verified-1080x700-sheet.png`, `verified-1080p-28s-sheet.png`, `verified-launch-1080p-sheet.png` | Zero text overlaps, high heading contrast (`CORRIDOR ENGINE`), unclipped card rails and channel threads across all 9 scenes | `PASS` |

## 2. Companion PDF Deck (`<= 7` Slides Cap)

| Check Item | Measured Value | Limit / Criterion | Result |
| :--- | :--- | :--- | :--- |
| Output File | [dopaimint-deck-7slides.pdf](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-deck-7slides.pdf) | Public zero login PDF | `PASS` |
| Page Count Audit | Exact `7` PDF page objects (`/Type /Page`) | Strictly `<= 7` slides including title | `PASS` |
| File Size | `4,065,824` bytes (`3.88 MiB`) | Lightweight instant browser open | `PASS` |
| Visual Contact Sheet | `submission-deck-7slides-sheet.png` (`7` `mdxcn` + `ascii.rest` tiles) | Every card, metric, and frame unclipped | `PASS` |

## 3. Inline Project Page PNG Figures (`< 10 MB` Cap Each)

| PNG Asset | Dimensions | File Size | Role in Project Page Editor |
| :--- | :--- | :--- | :--- |
| [01-architecture-pipeline.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/01-architecture-pipeline.png) | `1920x1080` | `202,837` bytes (`0.19 MB`) | `mdxcn` `GraphSpec` + `GraphStat` + `GraphFlow` + `GraphTable` architecture diagram over `ascii.rest` `earthrise` canvas |
| [02-overview-burning-calendar.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/02-overview-burning-calendar.png) | `1920x1080` | `727,770` bytes (`0.69 MB`) | Observatory flagship landing hero framed in `mdxcn` (`Graph`, `GraphStat`, `Callout`) over `ascii.rest` `earth` canvas |
| [03-orbital-provenance-map.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/03-orbital-provenance-map.png) | `1920x1080` | `372,319` bytes (`0.36 MB`) | Five layer orbital data fusion framed in `mdxcn` (`Graph`, `Endpoint`, `GraphCheck`) over `ascii.rest` `radar` canvas |
| [04-earth-grid-triage-phase1.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/04-earth-grid-triage-phase1.png) | `1920x1080` | `441,637` bytes (`0.42 MB`) | Phase 01 triage drill framed in `mdxcn` (`Graph`, `Steps`, `GraphKpi`) over `ascii.rest` `aurora` canvas |
| [05-cradleflow-habitat-phase2.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/05-cradleflow-habitat-phase2.png) | `1920x1080` | `411,239` bytes (`0.39 MB`) | Phase 02 embedded CradleFlow canvas framed in `mdxcn` (`Graph`, `GraphFlow`, `GraphSpec`) over `ascii.rest` `solar-system` canvas |
