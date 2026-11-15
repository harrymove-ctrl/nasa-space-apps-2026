# DopaiMint + CradleFlow Storyboard & Component Spec

This storyboard documents the unified palette, typography, third-party `@snapcn/*` motion modules, visual asset provenance, and interactive `<Player>` mounting for `projects/project_1`.

## Shared Visual System

1. **Dark Technical Surfaces**: Matched across DopaiMint (`projects/project_1`) and harmonized CradleFlow (`projects/project_2`): canvas `#090c14`, cards `#101622`, elevated overlays `#161e2e`, cyan primary `#45b8d6`, coral alert `#ee6b47`, tactical scanner `#5dff9a`, ink `#f3efe6`, sans typography `Manrope`, monospace telemetry `JetBrains Mono`.
2. **Warm Paper Demo-Day Surface**: Archival paper `#f5f2ea`, warm inset cards `#ece8dd`, editorial ink `#0e141e`, muted low-saturation teal `#1d6f8a`, strictly zero closed captions.

## Component and Scene Map

| Composition / Scene | Source Path | Dimensions & Runtime | Primary Visual Elements |
| :--- | :--- | :--- | :--- |
| `DopaiMintVideo` | `projects/project_1/src/remotion/DopaiMintVideo.tsx` | Master timeline wrapper | Wraps `@snapcn/*` theme provider (`DOPAIMINT_SNAPCN_THEME`), `-16 LUFS` mastered audio track, and timed `<Sequence>` beats. |
| `CyberpunkTechIntro` | `projects/project_1/src/remotion/scenes/CyberpunkTechIntro.tsx` | Responsive (`u` scalar) | Spring corner brackets, vertical `#5dff9a` azimuth scanner beam, 18 deterministic hexagons/triangles, animated `bot-avatars` `work.png` card. |
| `HelloZoom` | `projects/project_1/src/components/snap-cn/hello-zoom/index.tsx` | 75f native sweep | Flicker word reveal + type-on line + scale-through letter dive. |
| `SpecSweep` | `projects/project_1/src/components/snap-cn/spec-sweep/index.tsx` | 75f to 80f | Word-by-word specification slide with charging icon and cyan accent band. |
| `CarbonDiffScene` | `projects/project_1/src/remotion/scenes/CarbonDiffScene.tsx` | 100f compact / 175f extended | Headline, `v1.0` vs `v2.4` version cards, macOS Carbon unified code diff (`+4 / -1`), 3-step live app feature showcase strip. |
| `CardRail` | `projects/project_1/src/components/snap-cn/card-rail.tsx` | 100f / 150f | Tilted perspective 4-station rail using harmonized screenshots from `public/video-assets/screens/`. |
| `ReelWall` | `projects/project_1/src/components/snap-cn/reel-wall.tsx` | 70f / 140f | Curved rotating wall driven by 6 vertical 432x768 H.264 `.mp4` clips under `public/video-assets/reels/`. |
| `HypeReelScene` | `projects/project_1/src/remotion/scenes/HypeReelScene.tsx` | 90f / 110f | 2.95x counter macro zoom -> snap pull-back -> 4 radial spring cards (`Christina Koch`, `Bot Engineer`, `Reid Wiseman`, `Jessica Meir`) -> `999k VIEWS` peak. |
| `ChannelThread` | `projects/project_1/src/components/snap-cn/channel-thread.tsx` | 110f / 170f | Self-typing flight crew transcript backed by verified 256x256 public-domain adult NASA portraits under `public/video-assets/people/avatars/`. |
| `WarmPaperPitchScene` | `projects/project_1/src/remotion/scenes/WarmPaperPitchScene.tsx` | 120f / 555f / 360f | 3 archival boards (`The Problem`, spring-counted `The Numbers That Move`, and `The Ask` featuring `bots/design.png` stamp). |

## Verified Media Provenance

1. **Bot Mascot Assets**: Downloaded locally from `https://bot-avatars.vercel.app/assets/` (`work.png`, `design.png`, `tools.png`, `search.png`, `ideas.png`, `review.png`, `files.png`) into `projects/project_1/public/video-assets/bots/`.
2. **NASA Crew Avatars**: Downloaded from NASA Images API (`images-api.nasa.gov`, public domain, 18+ adult NASA astronauts: Christina Koch, Reid Wiseman, Jessica Meir, Sunita Williams, Zena Cardman) and center-cropped to 256x256 square JPEGs under `projects/project_1/public/video-assets/people/avatars/`.
3. **Interactive App Player**: Mounted directly in `SubmissionStudio.tsx` (`RemotionVideoShowcase` using `@remotion/player`) on `/submission/` and `/?present=video`, exposing one click switching across `NasaHackathon1080p` (`1920x1080`, `28.5s`), `NasaHackathon1080x700` (`1080x700`, `28.5s`), `DopaiMintFullLaunch1080p`, `CyberpunkTechIntro1080p`, `HypeReelStandalone`, and `WarmPaperPitch1080p`.
