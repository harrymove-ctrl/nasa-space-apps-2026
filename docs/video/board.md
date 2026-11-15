# TerraSpan x CradleFlow Look, Motion & Sound Board

1. **Generator Script**: [build-submission-media.mjs](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/scripts/build-submission-media.mjs) drives [SubmissionStudio.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/SubmissionStudio.tsx) inside headless Playwright with `reducedMotion: 'reduce'`, renders deterministic frame captures via `window.__setVideoFrame(frame)` (synchronous React `flushSync`), and encodes H.264 `yuv420p` video plus normalized AAC audio with `ffmpeg`.
2. **Palette & Component Inheritance**: Strictly built with vendored `mdxcn` (`src/registry/default/*`) `--graph-*` design tokens (`#090c14` obsidian ground, `#0b101b` `--graph-surface` backing, `#38bdf8` accent) matching [index.css](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/index.css), layered over animated [AsciiRestBackdrop.tsx](file:///Volumes/Dev/nasa-space-apps-2026/projects/project_1/src/components/AsciiRestBackdrop.tsx) canvases and live product captures.

## Scene Architecture & Camera Rig

| Component Layer | Geometry & Motion Spec | Zero Overlap & Hygiene Rules |
| :--- | :--- | :--- |
| `AsciiRestBackdrop` (`1920x1080`) | Steps `ascii.rest` pieces (`earthrise`, `earth`, `radar`, `solar-system`, `galaxy`) cleanly across Beats `01` through `05` via `fps: 0` frozen time mapping (`timeSec = frame / 30`). | Replaces all ad hoc HTML/SVG backdrops with crisp generative ASCII telemetry canvases at `scrimOpacity: 0.54`. |
| Top `GraphSpec` + `GraphStat` Row | Fixed `mdxcn` top telemetry bar (`TERRASPAN` chapter spec on left, `TIMECODE` seconds, `frame / 855`, and `8` NASA streams on right). | Every panel uses solid `--graph-surface` (`#0b101b`) backing so `mdxcn` `+` corners and `[ TITLE ]` cut the dashed frame cleanly. |
| Center `Graph` Frame & Side Stack | Beat `01` renders `GraphFlow` (`ARCHITECTURE`), `Callout` (`MISSION`), and `GraphStat` (`SCALE`). Beats `02` to `05` pair a live served `Graph` UI frame (`16:9`, `max-h-[540px]`) beside beat specific `mdxcn` modules (`GraphKpi` + `Callout`, `Endpoint` + `GraphCheck`, `GraphFlow` + `GraphSpec`, `GraphCheck` + `GraphSpec`). | Uses neutral viewer prose with zero persona names, zero homemade cards, and zero ungrounded metrics. |
| Bottom `GraphUptime` Strip | Full width `95` column `mdxcn` `GraphUptime` `[ TIMELINE ]` (`00.0s NASA INGEST` to `28.5s READY`) advancing frame by frame across `855` total frames. | Bounded inside the bottom flex slot with zero risk of vertical overlap against center UI captures. |

## Synthesized Audio Bed (`audio.wav`, 48 kHz Stereo PCM)

1. **Pad Progression**: Continuous harmonic pad shifting smoothly across `C minor 9` (`0.00s to 11.00s`), `Bb sus` (`11.00s to 17.00s`), and `Eb maj9` (`17.00s to 28.50s`) modulated by a gentle `120 BPM` (`2.0 Hz`) pulse.
2. **Chapter Bell Transients**: Exponentially decaying bell tones (`587.33 Hz`, `659.25 Hz`, `783.99 Hz`, `880.00 Hz`, `1046.50 Hz`) aligned to the exact frame boundaries (`0.05s`, `4.50s`, `11.00s`, `17.00s`, `23.50s`) and normalized to `-16 LUFS` (`TP=-1.5`) via `ffmpeg`.
