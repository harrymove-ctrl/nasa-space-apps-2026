# DopaiMint + CradleFlow Audio & Music Architecture

This document records the music synthesis, ElevenLabs voiceover integration, and broadcast loudness normalization implemented for `NasaHackathon1080x700` and `DopaiMintFullLaunch1080p`.

## Mood, Progression, and Dynamic Envelope

1. **Tempo & Tonality**: `124 BPM` on a 16th-note pulse grid in F# minor / Dorian (`F#m -> D -> E -> C#m` chord progression), matching the high-energy cyberpunk-to-executive-briefing arc.
2. **Narrative Energy Envelope** (authored in `projects/project_1/scripts/build-audio.mjs`):
   1. `0% to 8%` (Early Hook): Opens immediately with punchy sub-bass and pad motif (`0.68 -> 0.82` intensity) to anchor the Cyberpunk Tech Intro and vertical scanner reveal.
   2. `8% to 35%` (Problem & Carbon Diff Build): Tightens percussive groove (`0.52 -> 0.76`) with driving 16th-note arpeggiator rising into the architecture and code diff reveal.
   3. `35% to 78%` (Reveal & Feature Peak): Full chorus energy (`0.88`) adding stereo shimmer pads, snare/clap accents on beats 1 and 3, and full arpeggio momentum through `CardRail`, `ReelWall`, `HypeReelScene`, and `ChannelThread`.
   4. `78% to 94%` (Warm-Paper Demo Pitch): Drops kick drum and heavy closed hats cleanly while pulling overall energy back to `0.44` so the warm paper Problem, Numbers, and Ask boards carry executive breathing room.
   5. `94% to 100%` (Final Landing): Smooth exponential tail fade over the final `0.60s` so `28.50s` and `54.00s` cuts land cleanly with zero click or abrupt cutoff.

## Loudness Mastering & Verification

All exported stereo MP3 tracks (`48,000 Hz`, `192 kbps`, high-pass filtered at `28 Hz`) are mastered via `ffmpeg` EBU R128 loudness normalization (`loudnorm=I=-16:TP=-1.5:LRA=11`).

| Output Asset | Runtime | Channels / Rate | Measured Mean / Max Peak | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `public/audio/dopaimint-hackathon-28s.mp3` | `28.500s` | Stereo / 48 kHz | `-17.4 dB` mean / `-2.5 dB` peak (`-18.1 dB` AAC muxed) | Primary audio bed + timed SFX for `NasaHackathon1080x700` |
| `public/audio/dopaimint-launch-1080p.mp3` | `54.000s` | Stereo / 48 kHz | `-17.3 dB` mean / `-1.9 dB` peak (`-18.1 dB` AAC muxed) | Primary audio bed + timed SFX for `DopaiMintFullLaunch1080p` |

## ElevenLabs CLI Onboarding & Voiceover Ducking Pipeline

1. **CLI Onboard**: Installed `@elevenlabs/elevenlabs-js` (`^2.78.0`) and verified workflow via `npx -y @elevenlabs/cli@latest onboard init` and `onboard check --env-path .env.local` in `projects/project_1`.
2. **Zero-Secret SDK Script**: `projects/project_1/scripts/generate-elevenlabs-audio.mjs` reads `ELEVENLABS_API_KEY` automatically via `new ElevenLabsClient()` without storing or echoing credentials in code or committing `.env.local`.
3. **Sidechain Narration Ducking**: When `ELEVENLABS_API_KEY` is authorized via `npx -y @elevenlabs/cli@latest onboard connect --env-path .env.local`, `generate-elevenlabs-audio.mjs` synthesizes narration (`eleven_multilingual_v2`, stability `0.48`, similarityBoost `0.78`, speaker boost enabled) and AI SFX stems, then mixes voiceover at `+1.15x` over the `-0.58` music bed using `ffmpeg sidechaincompress=threshold=0.025:ratio=4.5:attack=30:release=260` before mastering back to `-16 LUFS`.
