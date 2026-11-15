# DopaiMint + CradleFlow Remotion Video Script

This document specifies the dual-cut Remotion production script and narration beats for **DopaiMint** (`projects/project_1`) and **CradleFlow** (`projects/project_2`). Both cuts eliminate closed-caption subtitle strips on screen so typography, UI proof, and narration stay crisp without clutter.

## Production Cuts

1. **NASA Space Apps 2026 Primary 1080p Cut (`NasaHackathon1080p`)**: `1920x1080` pixels at `30 fps`, `855` frames (`28.50 seconds`), exported to `projects/project_1/public/submission/dopaimint-demo-1080p-28s.mp4`. Satisfies the NASA Space Apps 30 second video limit with clean 1.50s margin.
2. **NASA Space Apps 2026 Compact Kinetic Cut (`NasaHackathon1080x700`)**: `1080x700` pixels at `30 fps`, `855` frames (`28.50 seconds`), exported to `projects/project_1/public/submission/dopaimint-demo-28s.mp4`.
3. **Full Cyberpunk Tech Product Film (`DopaiMintFullLaunch1080p`, Extended Showcase Only)**: `1920x1080` pixels at `30 fps`, `1620` frames (`54.02 seconds`), exported to `projects/project_1/public/submission/dopaimint-cyberpunk-1080p.mp4`. Never place this `54.02s` cut into Official Field 3 (`<= 30s` cap).

## Timeline and Narrative Beats

### Cuts A & B: NASA Hackathon (`1920x1080` & `1080x700`, `28.50s`)

| Chapter | Frames | Timecode | Visual Direction & Voiceover Intent |
| :--- | :--- | :--- | :--- |
| 01 Cyberpunk Intro + Bot Hook | 0 to 115 | 0.00s to 3.83s | Obsidian `#090c14` grid with spring corner reticle brackets, sweeping `#5dff9a` green laser azimuth scanner, geometric triangles and hexagons, and animated `bot-avatars` plush engineer introducing Phase 01 to Phase 02 handoff. |
| 02 Hello Zoom | 115 to 190 | 3.83s to 6.33s | `@snapcn/hello-zoom` kinetic flicker (`NASA`, `ORBIT`, `SHELTER`) typing `Powered by DopaiMint` and diving through the wordmark into `SHIP`. |
| 03 Spec Sweep | 190 to 265 | 6.33s to 8.83s | `@snapcn/spec-sweep` animated highlight bar (`8 NASA feeds` + charging icon + `1 unified habitat twin` + `· Zero login`). |
| 04 Carbon Hackathon Diff | 265 to 365 | 8.83s to 12.17s | Version delta (`v1.0 Siloed Feeds` to `v2.4 Unified Handoff`), Carbon window unified code diff (`dispatchCorridor`), and 3 card step highlight strip (`Overview`, `Triage`, `CradleFlow`). |
| 05 Card Rail | 365 to 465 | 12.17s to 15.50s | `@snapcn/card-rail` 3D tilted perspective cards showcasing the four harmonized DopaiMint and CradleFlow stations. |
| 06 Reel Wall | 465 to 535 | 15.50s to 17.83s | `@snapcn/reel-wall` dark curved carousel sweeping 6 vertical 432x768 live app video reels. |
| 07 Hype Reel (3.0s) | 535 to 625 | 17.83s to 20.83s | Frame measured macro zoom on racing `VIEWS` pill, snap pull back over CradleFlow Phase 02 card, radial adult NASA + Bot reactions springing in, locking at `999k VIEWS`. |
| 08 Channel Thread | 625 to 735 | 20.83s to 24.50s | `@snapcn/channel-thread` live flight comms featuring adult NASA astronaut portraits (`Christina Koch`, `Reid Wiseman`, `Sunita Williams`, `Jessica Meir`). |
| 09 Warm Paper Demo Pitch | 735 to 855 | 24.50s to 28.50s | Editorial warm paper `#f5f2ea` with muted slate teal `#1d6f8a` accent and zero captions: **The Problem**, **The Numbers That Move** (`8 -> 1`, `185 pfu`, `738 IEEE`, `0 gates`), and **The Ask** (`dopaimint-production.up.railway.app`). |

### Cut C: Full Product Launch (`1920x1080`, `54.02s` Extended Showcase)

| Chapter | Frames | Timecode | Visual Direction & Voiceover Intent |
| :--- | :--- | :--- | :--- |
| 01 Cyberpunk Intro + Bot Hook | 0 to 165 | 0.00s to 5.50s | Full widescreen tactical sweep across reticle corners, floating hexagon/triangle depth field, and Phase 01 to Phase 02 mission cards. |
| 02 Hello Zoom | 165 to 240 | 5.50s to 8.00s | Kinetic type tunnel transitioning from obsidian studio ink into high speed architectural telemetry. |
| 03 Spec Sweep | 240 to 320 | 8.00s to 10.67s | Widescreen specification banner lock in with emerald icon charge. |
| 04 Carbon Hackathon Diff | 320 to 495 | 10.67s to 16.50s | Full architectural diff, animated line by line code highlighter sweeping added telemetry functions, and extended 3 step live app feature tour. |
| 05 Card Rail | 495 to 645 | 16.50s to 21.50s | Multi flick perspective card showcase across all 4 stations. |
| 06 Reel Wall | 645 to 785 | 21.50s to 26.17s | Full orbital curved wall rotation across all 6 rendered vertical captures. |
| 07 Hype Reel | 785 to 895 | 26.17s to 29.83s | Viral view ramp to `999k` with full reaction choreography. |
| 08 Channel Thread | 895 to 1065 | 29.83s to 35.50s | Complete 5 speaker flight control comms log adding `Zena Cardman` (`OSDR-340 bio payload live.`). |
| 09 Warm Paper Demo Pitch | 1065 to 1620 | 35.50s to 54.02s | Unhurried editorial pitch cadence across Problem (`35.50s to 41.43s`), animated KPI Numbers (`41.43s to 48.10s`), and Ask + Bot Avatar seal (`48.10s to 54.02s`). |
