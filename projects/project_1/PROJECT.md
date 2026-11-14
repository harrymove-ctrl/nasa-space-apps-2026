# TerraSpan Digital Twin (NASA Space Apps Challenge 2026)

1. Workspace path: `/Volumes/Dev/nasa-space-apps-2026/projects/project_1`
2. Target track: NASA International Space Apps Challenge 2026 (live build weekend November 14 to November 15, 2026)

## Architecture Overview

1. Live NASA and NOAA data layer ([nasaLiveClient.ts](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/data/nasaLiveClient.ts)): Queries NASA EONET v3 hazard events, NASA POWER meteorological grids (`T2M`, `WS10M`, `RH2M`), NOAA SWPC GOES-18 proton and X-ray flare streams, planetary Kp disturbance index, and NASA OSDR biological studies (`/proxy/osdr` on local Vite dev and preview), computing live IEEE 738 thermal ampacity derates with deterministic verified fallback snapshots when offline.
2. Preloader and Earthrise canvas ([PreloaderOverlay.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/PreloaderOverlay.tsx), [EarthriseBackground.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/EarthriseBackground.tsx)): Renders the animated `smear-type` `TERRASPAN / ORBIT TO GRID` WebGL card on initial boot over the `ascii.rest/pieces/earthrise` halftone background in warm archival light (`#f5f2ea`) and deep obsidian dark (`#090c14`) themes.
3. ObsidianUI gallery and telemetry blocks ([feature-docs-preview.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/obsidian/feature-docs-preview.tsx), [parallax-slider.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/obsidian/parallax-slider.tsx)): Presents `ParallaxSlider` across six halftone press orbital survey plates (`public/nasa-gallery/*.jpg`) with `portrait` (9:16) and `landscape` (16:9) aspect toggles, CSS variable band theming, keyboard Left and Right slide stepping, CLI command copy, and interactive `PropsTable` documentation alongside `StatusBars`, `SplitShowcase`, `DiscoverButton`, `InteractiveHoverButton`, and `FlipText`.
4. AI Canvas telemetry components ([WireframeGlobe.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/aicanvas/WireframeGlobe.tsx), [GlassDock.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/aicanvas/GlassDock.tsx), [SourceRail.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/aicanvas/SourceRail.tsx)): Combines an interactive rotating hero globe, magnetic corridor dock switcher (`Butte 230 kV`, `Maui West 69 kV`, `Okanogan 115 kV`, `Siskiyou Tie`), cited claim evidence rail with `[` and `]` keyboard claim stepping, single-box five-layer [KnowledgeMapBox.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/KnowledgeMapBox.tsx), and three-wave [MissionGameBox.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/MissionGameBox.tsx) linked to CradleFlow on `http://localhost:5185`.

## Verification Commands

1. Smear type contract audit: `node /Volumes/Dev/nasa-space-apps-2026/.agents/skills/smear-type/scripts/check.mjs /Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/smear-type`
2. Type check and production bundle: `bun run build`
3. Headless Playwright multi-viewport QA: `bun run qa`
