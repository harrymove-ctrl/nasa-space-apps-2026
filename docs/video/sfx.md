# DopaiMint + CradleFlow Sound Effects (SFX) Cue Sheet

This cue sheet defines the five standalone tactile SFX stems generated into `projects/project_1/public/audio/` and their exact frame-synchronized mix placement inside `dopaimint-hackathon-28s.mp3` and `dopaimint-launch-1080p.mp3`.

## Standalone SFX Library

| Filename | Measured Duration | Bitrate | Acoustic Design | Trigger Context |
| :--- | :--- | :--- | :--- | :--- |
| `public/audio/sfx-whoosh.mp3` | `0.700s` | 211 kbps | Low-pass swept noise burst paired with `140 Hz -> 400 Hz` upward sine glide | Scene cuts into `HelloZoom`, `CarbonDiffScene`, `CardRail`, `ReelWall`, `ChannelThread` |
| `public/audio/sfx-scanner.mp3` | `1.000s` | 203 kbps | Stereo-panned `540 Hz -> 1320 Hz` harmonic telemetry sweep with exponential decay | Vertical green laser azimuth sweep in `CyberpunkTechIntro` and `SpecSweep` entry |
| `public/audio/sfx-impact.mp3` | `0.950s` | 204 kbps | Sub punch dropping `163 Hz -> 48 Hz` backed by crisp `15ms` metallic transient click | Opening hook (`0.04s`), `HypeReelScene` viral zoom, `999k` peak, and `WarmPaperPitchScene` transition |
| `public/audio/sfx-pop.mp3` | `0.220s` | 253 kbps | Short `780 Hz -> 1107 Hz` exponential transient pop | Radial spring cards in `HypeReelScene`, chat arrivals in `ChannelThread`, code diff cursor locks |
| `public/audio/sfx-blip.mp3` | `0.250s` | 241 kbps | Dual-harmonic UI blip (`980 Hz` left, `1240 Hz` right) | Micro UI telemetry confirmations and card hover snaps |

## Frame-Synchronized Cut Mapping

### NasaHackathon1080x700 (`28.50s` / `855 frames @ 30 fps`)

| Timecode | Cue Type | Visual Sync Anchor |
| :--- | :--- | :--- |
| `0.04s` | `impact` | Frame 1 reticle corner lock + DopaiMint title pop-in |
| `0.25s` | `scan` | Green vertical scanner beam sweeping left to right |
| `1.25s` / `1.85s` | `pop` | Bot-Avatar (`work.png`) container bounce + Phase 01 to 02 pill arrival |
| `3.83s` | `whoosh` | Cut into `HelloZoom` (`f=115`) |
| `6.33s` / `6.45s` | `impact` + `scan` | Cut into `SpecSweep` (`f=190`) + lightning charge sweep |
| `8.83s` / `10.40s` | `whoosh` + `pop` | Cut into `CarbonDiffScene` (`f=265`) + code highlight arrival |
| `12.17s` / `13.00s` | `whoosh` + `pop` | Cut into `CardRail` (`f=365`) + first lateral perspective flick |
| `15.50s` | `whoosh` | Cut into `ReelWall` curved carousel (`f=465`) |
| `17.83s` | `impact` | Cut into `HypeReelScene` 2.95x macro view counter (`f=535`) |
| `18.97s` / `19.23s` / `19.50s` | `pop` | Alternating left/right stereo pops for Christina, Bot Engineer, Reid spring cards |
| `20.37s` | `impact` | Counter peak at `999k VIEWS` (`HypeReelScene` local `f=76`) |
| `20.83s` .. `23.30s` | `whoosh` + `pop` | `ChannelThread` entry (`f=625`) + 4 astronaut comms arrivals |
| `24.50s` / `27.22s` | `impact` + `pop` | Shift to archival `WarmPaperPitchScene` (`f=735`) + `The Ask` reveal |

### DopaiMintFullLaunch1080p (`54.00s` / `1620 frames @ 30 fps`)

| Timecode | Cue Type | Visual Sync Anchor |
| :--- | :--- | :--- |
| `0.05s` / `0.30s` | `impact` + `scan` | Opening reticle snap + full 1080p vertical laser sweep |
| `1.70s` / `2.60s` | `pop` | Bot-Avatar game intro hook + HUD metric chips |
| `5.50s` | `whoosh` | Cut into `HelloZoom` (`f=165`) |
| `8.00s` / `8.15s` | `impact` + `scan` | Cut into `SpecSweep` (`f=240`) |
| `10.67s` / `13.73s` | `whoosh` + `pop` | `CarbonDiffScene` entry (`f=320`) + step-by-step live feature grid flip (`f=412`) |
| `16.50s` / `17.97s` / `19.17s` | `whoosh` | `CardRail` entry (`f=495`) + timed lateral card flicks |
| `21.50s` | `whoosh` | `ReelWall` entry (`f=645`) |
| `26.17s` / `27.30s..28.40s` | `impact` + `pop` | `HypeReelScene` (`f=785`) + stereo spring reaction accents |
| `29.83s` .. `34.30s` | `whoosh` + `pop` | `ChannelThread` (`f=895`) + all 5 adult NASA crew messages |
| `35.50s` / `48.10s` | `impact` + `pop` | Archival `WarmPaperPitchScene` entry (`f=1065`) + `The Ask` CTA lock |
