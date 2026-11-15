# Demo Video and Deck Verification Report

Verified on `2026-11-15` after rendering all Remotion compositions (`NasaHackathon1080p`, `NasaHackathon1080x700`, and `DopaiMintFullLaunch1080p`), building directed English voiceover plus sidechain ducked launch score (`build-audio.mjs`), and executing automated Playwright QA (`bun run qa`) against the live production build (`bun server.mjs`).

## 1. Demo Video Checks (`<= 30.0s` Cap for Official Field 3 plus `92.00s` Full Web Demo)

| Check Item | Measured Value | Limit or Criterion | Result |
| :--- | :--- | :--- | :--- |
| Full Product Launch Demo (Default on Website `/#demo` and `/demo`) | [dopaimint-cyberpunk-1080p.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-cyberpunk-1080p.mp4) (`43,345,767` bytes / `41.34 MiB`) | `1920x1080` `h264` MP4 (`aac 48000Hz` stereo, `-19.6 dB` mean / `-2.2 dB` peak, 15 directed VO cues), `92.0110s` (`2760` frames at `30 fps`); live web showcase and Field 5 only | `PASS` |
| Official Field 3 Primary 1080p Cut | [dopaimint-demo-1080p-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4) (`14,309,095` bytes / `13.65 MiB`) | Public zero login `1920x1080` `h264` MP4 (`aac 48000Hz` stereo, `-19.7 dB` mean / `-2.8 dB` peak, 5 directed VO cues), `28.5010s` (`855` frames at `30 fps`, strictly `<= 30.0s`) | `PASS` |
| Official Field 3 Compact Cut | [dopaimint-demo-28s.mp4](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-demo-28s.mp4) (`8,309,449` bytes / `7.92 MiB`) | Public zero login `1080x700` `h264` MP4 (`aac 48000Hz` stereo, `-19.7 dB` mean / `-2.8 dB` peak, 5 directed VO cues), `28.5010s` (`855` frames at `30 fps`, strictly `<= 30.0s`) | `PASS` |
| Black Frame Audit | `ffmpeg blackdetect=d=0.4:pix_th=0.02` (`0` black segments across all 3 MP4s) | Zero unintended black dropouts across all rendered scenes | `PASS` |
| Visual Contact Sheet Audit | `final-launch-sheet.png`, `submission-hd28-sheet.png`, `submission-motion-frames.png` | 100% web UI/UX match (`Andromeda` + `mdxcn` + `ascii.rest`), unclipped `432x768` mobile captures in `ReelWall` and `HypeReelScene`, unclipped `960px` `ChannelThread` lines, zero captions on `#f5f2ea` warm paper pitch | `PASS` |

## 2. Companion PDF Deck (`<= 7` Slides Cap)

| Check Item | Measured Value | Limit or Criterion | Result |
| :--- | :--- | :--- | :--- |
| Output File | [dopaimint-deck-7slides.pdf](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/dopaimint-deck-7slides.pdf) | Public zero login PDF (`https://dopaimint-production.up.railway.app/submission/dopaimint-deck-7slides.pdf`) | `PASS` |
| Page Count Audit | Exact `7` PDF page objects (`/Type /Page`) | Strictly `<= 7` slides including title | `PASS` |
| File Size | `4,109,866` bytes (`3.92 MiB`) | Lightweight instant browser open | `PASS` |
| Interactive Web Route | `https://dopaimint-production.up.railway.app/slides` and `/submission/#slides` | Clickable 7 slide presentation viewer with `0 px` overflow | `PASS` |

## 3. Inline Project Page PNG Figures (`< 10 MB` Cap Each)

| PNG Asset | Dimensions | File Size | Role in Project Page Editor |
| :--- | :--- | :--- | :--- |
| [01-architecture-pipeline.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/01-architecture-pipeline.png) | `1920x1080` | `202,837` bytes (`0.19 MB`) | `mdxcn` `GraphSpec` + `GraphStat` + `GraphFlow` + `GraphTable` architecture diagram over `ascii.rest` `earthrise` canvas |
| [02-overview-burning-calendar.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/02-overview-burning-calendar.png) | `1920x1080` | `763,582` bytes (`0.73 MB`) | Observatory flagship landing hero framed in `mdxcn` (`Graph`, `GraphStat`, `Callout`) over `ascii.rest` `earth` canvas |
| [03-orbital-provenance-map.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/03-orbital-provenance-map.png) | `1920x1080` | `372,833` bytes (`0.36 MB`) | Five layer orbital data fusion framed in `mdxcn` (`Graph`, `Endpoint`, `GraphCheck`) over `ascii.rest` `radar` canvas |
| [04-earth-grid-triage-phase1.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/04-earth-grid-triage-phase1.png) | `1920x1080` | `441,657` bytes (`0.42 MB`) | Phase 01 triage drill framed in `mdxcn` (`Graph`, `Steps`, `GraphKpi`) over `ascii.rest` `aurora` canvas |
| [05-cradleflow-habitat-phase2.png](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/public/submission/images/05-cradleflow-habitat-phase2.png) | `1920x1080` | `468,583` bytes (`0.45 MB`) | Phase 02 embedded CradleFlow canvas framed in `mdxcn` (`Graph`, `GraphFlow`, `GraphSpec`) over `ascii.rest` `solar-system` canvas |
