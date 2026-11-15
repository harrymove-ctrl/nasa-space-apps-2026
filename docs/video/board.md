# TerraSpan x CradleFlow Look, Motion & Sound Board

1. **Generator Script**: [build-submission-media.mjs](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/scripts/build-submission-media.mjs) renders deterministic frame-by-frame captures via `window.__setFrame(frame)` and encodes H.264 `yuv420p` video plus normalized AAC audio with `ffmpeg`.
2. **Palette Inheritance**: Obsidian background `#090c14`, elevated cards `#101622`, archival cream typography `#f5f2ea`, orbital telemetry cyan `#38bdf8`, thermal fire alert amber `#f97316`, and verified green `#34d399` directly matching [index.css](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/index.css).

## Scene Architecture & Camera Rig

| Component Layer | Geometry & Motion Spec | Zero Overlap & Hygiene Rules |
| :--- | :--- | :--- |
| `#stage` & `.dot-grid` | `1920x1080` obsidian canvas with subtle `28px` radial dot matrix. | Never uses blue focus pull blur stock backgrounds. |
| `#hook-layer` & `#brand-lockup` | `66px` Manrope headline fading into `TERRASPAN` + `CRADLEFLOW` lockup chips. | Uses neutral viewer phrasing (`you`) with zero persona names or `"mock"` labels. |
| `#browser-rig` (`1376x814`) | Placed at `top: 48px` (`bottom: 862px`), tilting smoothly from `rotateX(9deg) rotateY(-6deg)` to `0deg`. | Shows live served app captures from `bun server.mjs` (`/proxy/*` HTTP 200 active). |
| `#callout-bar` (`bottom: 42px`, `height: 112px`) | Fixed bottom safe zone starting at `y = 926px`, preserving `>= 64px` vertical separation from the unrotated browser rig. | Bounded strictly to one chapter pill and two crisp lines (`Line 1` + `Line 2`). |
| `#finale-layer` | Four metric cards (`486 MW`, `17 min`, `18.4%`, `8 Feeds`) over zero login Railway URL lockup. | Every value matches verified platform telemetry in [terraspanData.ts](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/data/terraspanData.ts). |

## Synthesized Audio Bed (`audio.wav`, 48 kHz Stereo PCM)

1. **Pad Progression**: Continuous harmonic pad shifting smoothly across `C minor 9` (`0.00s to 11.00s`), `Bb sus` (`11.00s to 17.00s`), and `Eb maj9` (`17.00s to 28.50s`) modulated by a gentle `120 BPM` (`2.0 Hz`) pulse.
2. **Chapter Bell Transients**: Exponentially decaying bell tones (`587.33 Hz`, `659.25 Hz`, `783.99 Hz`, `880.00 Hz`, `1046.50 Hz`) aligned to the exact frame boundaries (`0.05s`, `4.50s`, `11.00s`, `17.00s`, `23.50s`) and normalized to `-16 LUFS` (`TP=-1.5`) via `ffmpeg`.
