# DopaiMint and CradleFlow Sound Effects (SFX) Cue Sheet

This cue sheet defines the five standalone tactile SFX stems generated into `projects/project_1/public/audio/` by `scripts/build-audio.mjs` and their frame synchronized placement underneath the directed English voiceover in `dopaimint-hackathon-28s.mp3` (`28.50s`) and `dopaimint-launch-1080p.mp3` (`92.00s`).

## Standalone SFX Library

| Filename | Duration | Acoustic Design | Trigger Context |
| :--- | :--- | :--- | :--- |
| `public/audio/sfx-whoosh.mp3` | `0.700s` | Low pass swept noise burst paired with `140 Hz -> 400 Hz` upward sine glide | Scene transitions into `HelloZoom`, `SpecSweep`, `CarbonDiffScene`, `CardRail`, `ReelWall`, `ChannelThread` |
| `public/audio/sfx-scanner.mp3` | `1.000s` | Stereo panned `540 Hz -> 1320 Hz` harmonic telemetry sweep with exponential decay | Vertical `#5dff9a` scanner beam in `CyberpunkTechIntro` and charging bolt in `SpecSweep` |
| `public/audio/sfx-impact.mp3` | `0.950s` | Sub punch dropping `163 Hz -> 48 Hz` backed by crisp `15ms` transient click | Opening HUD lock, `HypeReelScene` `+999k` peak, and `WarmPaperPitchScene` reveal |
| `public/audio/sfx-pop.mp3` | `0.220s` | Short `780 Hz -> 1107 Hz` exponential transient pop | `@snapcn/cursor-track` clicks in `FeatureWalkthroughScene`, `CardRail` flicks, `HypeReelScene` reaction cards, and `ChannelThread` arrivals |
| `public/audio/sfx-blip.mp3` | `0.250s` | Dual harmonic UI blip (`980 Hz` left, `1240 Hz` right) | Bot avatar spring entry, `HelloZoom` word flickers, Carbon diff sweep, and telemetry confirmations |

## Frame Synchronized Cut Mapping

### Cut A: `DopaiMintFullLaunch1080p` (`92.00s` / `2760` Frames at `30 fps`)

| Timecode | Cue Type | Visual Sync Anchor |
| :--- | :--- | :--- |
| `0.06s` / `0.35s` | `impact` + `scan` | Opening reticle corner snap and full 1080p vertical `#5dff9a` laser sweep |
| `1.40s` / `2.40s` | `pop` + `blip` | `BotAvatarCell` crew spring arrival and telemetry HUD strip lock |
| `7.00s` / `8.10s` | `whoosh` + `blip` | Cut into `HelloZoom` (`f=210`) and kinetic letter dive |
| `9.80s` / `10.10s` | `impact` + `scan` | Cut into `SpecSweep` (`f=294`) and emerald charging bolt sweep |
| `13.00s` / `15.20s` / `18.00s` | `whoosh` + `pop` + `blip` | `CarbonDiffScene` (`f=390`), `v2.4` card lock, and green TypeScript diff highlight |
| `22.00s` / `24.00s` / `29.50s` / `35.00s` / `40.50s` | `whoosh` + `pop` | `FeatureWalkthroughScene` (`f=660`) and 4 `@snapcn/cursor-track` live browser zoom clicks |
| `45.00s` / `46.80s` / `48.30s` / `49.80s` | `whoosh` + `pop` | `CardRail` (`f=1350`) and 3 decelerating lateral card flicks |
| `51.50s` | `whoosh` | `ReelWall` (`f=1545`) curved 3D vertical reel carousel entry |
| `57.00s` / `58.20s..59.00s` / `59.80s` | `impact` + `pop` + `impact` | `HypeReelScene` (`f=1710`), 4 crew reaction card springs, and `+999k` peak lock |
| `61.00s` / `61.90s..66.80s` | `whoosh` + `pop` | `ChannelThread` (`f=1830`) and 5 NASA astronaut message arrivals |
| `68.00s` / `76.00s` / `84.00s` / `85.50s` | `impact` + `whoosh` + `blip` | `WarmPaperPitchScene` (`f=2040`) Problem, Numbers, and Ask boards |

### Cuts B and C: `NasaHackathon1080p` and `NasaHackathon1080x700` (`28.50s` / `855` Frames at `30 fps`)

| Timecode | Cue Type | Visual Sync Anchor |
| :--- | :--- | :--- |
| `0.05s` / `0.30s` / `1.20s` | `impact` + `scan` + `pop` | Frame 1 corner brackets, vertical green scanner sweep, and `BotAvatarCell` arrival |
| `5.00s` / `5.18s` | `whoosh` + `scan` | Cut into `SpecSweep` (`f=150`) and charging bolt highlight |
| `8.00s` / `9.80s` / `12.60s` / `15.20s` | `whoosh` + `pop` | `FeatureWalkthroughScene` (`f=240`) and 3 `@snapcn/cursor-track` browser zooms |
| `17.00s` / `18.20s` / `19.60s` | `impact` + `pop` + `impact` | `HypeReelScene` (`f=510`) unclipped mobile dispatch card and `+999k` peak |
| `21.00s` / `22.60s` | `impact` + `blip` | Shift to `#f5f2ea` `WarmPaperPitchScene` summary (`f=630`) and KPI lock |
