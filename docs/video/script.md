# DopaiMint and CradleFlow Remotion Video Script

This document specifies the dual cut Remotion production script, directed voiceover cues, and exact frame pacing for **DopaiMint** (`projects/project_1`) and **CradleFlow** (`projects/project_2`). Every scene matches the live DopaiMint web UI (`Andromeda` surfaces, official `mdxcn` dashed `[ TITLE ]` frames, deterministic `ascii.rest` canvas backdrops, `Manrope` sentence case headings, `JetBrains Mono` tabular telemetry, and unclipped `1920x1080` desktop plus `432x768` portrait captures) with strictly zero closed caption subtitle bars.

## Production Cuts

1. **Full Product Launch Demo (`DopaiMintFullLaunch1080p` and `DopaiMintFullLaunch1080x700`, Default Live Web Demo)**: `1920x1080` (and `1080x700`) pixels at `30 fps`, `2760` frames (`92.00 seconds` / `1:32`), exported to `projects/project_1/public/submission/dopaimint-cyberpunk-1080p.mp4` and embedded interactively on `/#demo`, `/demo`, and `/submission/`. Gives every feature natural human readable pacing with a 23 second step by step cursor walkthrough and 15 directed voiceover cues. Do not paste this `92.00s` cut into NASA Official Field 3 (`<= 30.0s` rule).
2. **NASA Space Apps 2026 Official Field 3 HD Cut (`NasaHackathon1080p`)**: `1920x1080` pixels at `30 fps`, `855` frames (`28.50 seconds`), exported to `projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4`. Purpose edited 5 beat trailer meeting the strict NASA Space Apps `<= 30.0s` cap with 1.50 seconds of safety margin.
3. **NASA Space Apps 2026 Compact Kinetic Cut (`NasaHackathon1080x700`)**: `1080x700` pixels at `30 fps`, `855` frames (`28.50 seconds`), exported to `projects/project_1/public/submission/dopaimint-demo-28s.mp4`.

## Timeline and Narrative Beats

### Cut A: Full Product Launch (`1920x1080`, `92.00s` / `2760` Frames at `30 fps`)

| Chapter | Frames | Timecode | Visual Direction and Directed Voiceover |
| :--- | :--- | :--- | :--- |
| 01 Cyberpunk Tech Intro and Bot Hook | 0 to 210 | 0.00s to 7.00s | DopaiMint `#090c14` obsidian HUD with `ascii.rest` `earthrise` backdrop, `mdxcn` `[ LIVE CORRIDOR READOUT ]` frame, `#5dff9a` vertical scanner line, animated corner brackets, floating geometric triangles and hexagons, and `bot-avatars` crew introducing Phase 01 to Phase 02. |
| 02 Hello Zoom (`@snapcn/hello-zoom`) | 210 to 294 | 7.00s to 9.80s | Kinetic word flicker (`MODIS`, `VIIRS`, `DONKI`, `GOES`, `OSDR`, `IEEE`) typing `Fuse DopaiMint` on `#090c14` and diving through the letters into `#f5f2ea` warm paper `8 -> 1`. |
| 03 Spec Sweep (`@snapcn/spec-sweep`) | 294 to 390 | 9.80s to 13.00s | Word by word specification slide (`8 keyless NASA feeds`, charging bolt icon, `1 live grid-to-habitat twin`, `Zero login`) over `ascii.rest` `earthrise` canvas and `DopaiMintHudBar`. |
| 04 Carbon Hackathon Diff | 390 to 660 | 13.00s to 22.00s | Shipping headline, `v1.0 Baseline` vs `v2.4 Unified Twin` `mdxcn` diff cards, and Carbon window TypeScript patch (`clusterHarmonizedFootprints`, `computeIeee738Physics`, `buildCradleFlowUrl`) with sweeping green line highlight. |
| 05 Step by Step Live Web Walkthrough | 660 to 1350 | 22.00s to 45.00s | `@snapcn/screen-recording` and `@snapcn/cursor-track` driving 4 live browser captures (`Butte 230 kV` observatory, `2000 to 2026` H3 Burning Calendar, 5 layer provenance map, and Phase 01 to Phase 02 `SYNCED FROM DOPAIMINT` CradleFlow canvas) with `mdxcn` callout plates. |
| 06 Card Rail (`@snapcn/card-rail`) | 1350 to 1545 | 45.00s to 51.50s | Tilted 3D perspective rail pushed 3 times (`flicks={3}`) across all 6 live desktop UI views with smooth spring deceleration. |
| 07 Reel Wall (`@snapcn/reel-wall`) | 1545 to 1710 | 51.50s to 57.00s | Curved 3D carousel rotating 6 unclipped `432x768` mobile portrait captures (`reel-1.mp4` to `reel-6.mp4`) in dark obsidian space. |
| 08 Hype Reel (`999k`) | 1710 to 1830 | 57.00s to 61.00s | Macro zoom on racing view counter over unclipped `9:16` `portrait-cradleflow.jpg`, spring pull out, and 4 `mdxcn` reaction cards (Christina Koch, Reid Wiseman, Jessica Meir, Bot Crew) peaking at `+999k`. |
| 09 NASA Crew Thread (`@snapcn/channel-thread`) | 1830 to 2040 | 61.00s to 68.00s | Flight ops transcript with verified adult NASA astronaut portraits, 3 typing dots holding each line before arrival, and rock still scroll between messages. |
| 10 Warm Paper Demo Day Pitch | 2040 to 2760 | 68.00s to 92.00s | DopaiMint Light Theme (`#f5f2ea` warm paper, light `ascii.rest` `earthrise`, `#1d6f8a` low saturation accent, zero captions) across **The Problem**, **The Numbers That Move** (`8 -> 1`, `38%`, `425 A`, `1,064`), and **The Ask** (`dopaimint-production.up.railway.app` with live light theme browser preview). |

### Cuts B and C: Official NASA Hackathon `<= 30s` Cut (`1920x1080` and `1080x700`, `28.50s` / `855` Frames)

| Beat | Frames | Timecode | Visual Direction and Directed Voiceover |
| :--- | :--- | :--- | :--- |
| 01 Cyberpunk Tech Intro and Bot Hook | 0 to 150 | 0.00s to 5.00s | Clean DopaiMint HUD hook, green vertical scanner, geometric triangles and hexagons, and `bot-avatars` mission crew introducing the unified Earth to Orbit digital twin. |
| 02 Spec Sweep Headline | 150 to 240 | 5.00s to 8.00s | `@snapcn/spec-sweep` locking `8 keyless NASA feeds` into `1 live grid-to-habitat twin` over `ascii.rest` `earthrise` backdrop. |
| 03 Live Web Feature Walkthrough | 240 to 510 | 8.00s to 17.00s | 9 full seconds of `@snapcn/screen-recording` and `@snapcn/cursor-track` stepping cleanly across `2000 to 2026` H3 Burning Calendar, 5 layer Provenance Map, and same origin Phase 02 CradleFlow shelter automation. |
| 04 Unclipped Mobile Hype Reel (`999k`) | 510 to 630 | 17.00s to 21.00s | Macro counter zoom to unclipped `9:16` `portrait-cradleflow.jpg` mobile dispatch card surrounded by 4 NASA crew and bot reaction cards peaking at `+999k`. |
| 05 Warm Paper Demo Day Summary | 630 to 855 | 21.00s to 28.50s | Unhurried `#f5f2ea` warm paper executive folio uniting **The Problem**, **The Numbers That Move** (`8 -> 1`, `38%`, `425 A`, `1,064`), and **The Ask** (`dopaimint-production.up.railway.app`) with zero captions. |
