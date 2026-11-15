# DopaiMint and CradleFlow Storyboard and Component Spec

This storyboard documents the unified DopaiMint web design tokens, `@snapcn/*` Remotion primitives, unclipped capture pipeline, and live website `<Player>` integration in `projects/project_1`.

## Shared Web Matched Visual System

1. **Dark Observatory Surface (`#090c14`)**: Exact parity with `projects/project_1/src/index.css`: base `#090c14`, card `#101622`, elevated `#161e2e`, cyan `#45b8d6`, thermal fire `#ee6b47`, scanner green `#5dff9a`, ink `#f3efe6`, official `mdxcn` dashed `[ TITLE ]` `+` corner frames, `CornerMarkers` `4px` radius brackets, `Manrope` 600 sentence case headings, and `JetBrains Mono` tabular numerals.
2. **Warm Paper Light Surface (`#f5f2ea`)**: Exact parity with DopaiMint Light Theme (`?theme=light`): warm archival paper `#f5f2ea`, inset card `#ffffff` / `#ece8dd`, ink `#141923`, low saturation slate teal `#1d6f8a`, light `ascii.rest` `earthrise` canvas, and strictly zero closed captions.

## Component and Scene Map

| Composition or Scene | Source Path | Dimensions and Runtime | Primary Visual Elements |
| :--- | :--- | :--- | :--- |
| `DopaiMintVideo` | `projects/project_1/src/remotion/DopaiMintVideo.tsx` | `2760f` (`92.0s`) and `855f` (`28.5s`) | Wraps `DOPAIMINT_SNAPCN_THEME`, mastered `-16 LUFS` voiceover and score track, and timed `<Sequence>` chapters. |
| `primitives.tsx` | `projects/project_1/src/remotion/primitives.tsx` | Inline CSS web primitives | `RemotionAsciiBackdrop` (dark and light `ascii.rest`), `MdxcnFrame`, `AndromedaPanel`, `DopaiMintHudBar`, and `BotAvatarCell`. |
| `CyberpunkTechIntro` | `projects/project_1/src/remotion/scenes/CyberpunkTechIntro.tsx` | `210f` full / `150f` NASA | `DopaiMintHudBar`, animated corner brackets, vertical `#5dff9a` scanner beam, 18 floating triangles and hexagons, `BotAvatarCell` (`work.png`). |
| `HelloZoom` | `projects/project_1/src/components/snap-cn/hello-zoom/index.tsx` | `84f` (`2.8s`) | Flicker words (`MODIS`, `VIIRS`, `DONKI`, `GOES`, `OSDR`, `IEEE`), types `Fuse DopaiMint`, dives through letters into `#f5f2ea` `8 -> 1`. |
| `SpecSweep` | `projects/project_1/src/components/snap-cn/spec-sweep/index.tsx` | `96f` full / `90f` NASA | Word by word specification sweep (`8 keyless NASA feeds` -> `1 zero-login twin`) over `ascii.rest` `radar` canvas. |
| `CarbonDiffScene` | `projects/project_1/src/remotion/scenes/CarbonDiffScene.tsx` | `270f` (`9.0s`, full launch) | Shipping headline, `v1.0` vs `v2.4` `MdxcnFrame` version diff, and Carbon TypeScript patch (`+4 / -1`) with sweeping line highlight. |
| `FeatureWalkthroughScene` | `projects/project_1/src/remotion/scenes/FeatureWalkthroughScene.tsx` | `690f` full / `270f` NASA | `@snapcn/screen-recording` + `@snapcn/cursor-track` zooming into live `1920x1080` captures inside locked `16:9` frames with `MdxcnFrame` callout badges. |
| `CardRail` | `projects/project_1/src/components/snap-cn/card-rail.tsx` | `195f` (`6.5s`, `flicks={3}`) | Tilted 3D perspective rail flicking across 6 unclipped `1920x1080` live web captures (`step-1` through `step-6`). |
| `ReelWall` | `projects/project_1/src/components/snap-cn/reel-wall.tsx` | `165f` (`5.5s`) | Curved 3D carousel turning 6 unclipped `432x768` responsive mobile portrait video reels (`reel-1.mp4` to `reel-6.mp4`). |
| `HypeReelScene` | `projects/project_1/src/remotion/scenes/HypeReelScene.tsx` | `120f` (`4.0s`) | Macro zoom on `999k` counter over unclipped `9:16` `portrait-cradleflow.jpg`, spring pull out, and 4 non-overlapping `MdxcnFrame` crew and bot reaction cards. |
| `ChannelThread` | `projects/project_1/src/components/snap-cn/channel-thread.tsx` | `210f` (`7.0s`) | Self typing NASA crew transcript (`opens` + `at` 3 dot typing indicators, unclipped `<= 25` char telemetry dispatches, rock still scroll between arrivals). |
| `WarmPaperPitchScene` | `projects/project_1/src/remotion/scenes/WarmPaperPitchScene.tsx` | `720f` full (`540f` standalone) / `225f` NASA | Archival `#f5f2ea` light theme pitch (**The Problem**, **The Numbers That Move**, **The Ask**) with safe bottom clearance for `<Player controls>`, `step-6-light-paper.jpg`, and `BotAvatarCell` (`design.png`). |

## Verified Media Provenance and Live Website Mounting

1. **Unclipped Live Captures (`scripts/capture-video-assets.mjs`)**: Captures `1920x1080` desktop screenshots (`step-1` to `step-6`) and genuine `432x768` (@2x DPR `864x1536`) mobile portrait screenshots (`portrait-*.jpg`) plus 6 vertical scroll `.mp4` reels (`reel-1.mp4` to `reel-6.mp4`) directly from `bun server.mjs`.
2. **Bot Mascot Assets**: Downloaded from `https://bot-avatars.vercel.app/assets/` (`work.png`, `design.png`, `tools.png`, `search.png`, `ideas.png`, `review.png`, `files.png`) into `projects/project_1/public/video-assets/bots/`.
3. **NASA Crew Portraits**: Verified public domain adult NASA astronaut portraits from `images-api.nasa.gov` (Christina Koch, Reid Wiseman, Jessica Meir, Sunita Williams, Zena Cardman) cropped to `256x256` under `projects/project_1/public/video-assets/people/avatars/`.
4. **Live Website Demo Studio (`DemoShowcaseSection.tsx` and `SubmissionStudio.tsx`)**: Mounted directly on the main landing page (`/#demo`), clean top level routes `/demo` and `/slides`, and `/submission/`.
