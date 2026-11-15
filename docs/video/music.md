# DopaiMint and CradleFlow Audio and Music Architecture

This document records the launch music synthesis, directed English narration, ElevenLabs CLI/SDK pipeline, sidechain ducking, and broadcast loudness normalization implemented for `DopaiMintFullLaunch1080p` (`92.00s`) and `NasaHackathon1080p` / `NasaHackathon1080x700` (`28.50s`).

## Mood, Progression, and Dynamic Envelope

1. **Tempo and Tonality**: `124 BPM` on a 16th note pulse grid in F# minor / Dorian (`F#m -> D -> E -> C#m` progression), tailored to open with crisp telemetry tension, drive momentum through the live browser walkthrough, and settle into an understated warm paper executive finish.
2. **Narrative Energy Envelope** (`projects/project_1/scripts/build-audio.mjs`):
   1. `0% to 8%` (Opening Hook): Opens with sub bass pulse and pad motif (`0.68 to 0.82` intensity) locked to the vertical `#5dff9a` scanner sweep and `bot-avatars` crew reveal.
   2. `8% to 35%` (Thesis and Carbon Diff Build): Tightens percussive groove (`0.52 to 0.76`) with rising 16th note arpeggiator across `HelloZoom`, `SpecSweep`, and `CarbonDiffScene`.
   3. `35% to 74%` (Walkthrough and Showcase Peak): Full chorus energy (`0.88`) driving `@snapcn/screen-recording` cursor clicks, `CardRail` perspective flicks, `ReelWall`, `HypeReelScene` (`+999k`), and `ChannelThread`.
   4. `74% to 94%` (Warm Paper Demo Pitch): Drops heavy percussion and pulls music intensity down to `0.42` so the `#f5f2ea` Problem, Numbers, and Ask boards carry calm Demo Day clarity underneath the voiceover.
   5. `94% to 100%` (Clean Final Landing): Smooth exponential tail fade over the final `0.85s` so both `28.50s` and `92.00s` cuts land cleanly on the final frame with zero abrupt cutoff.

## Directed Voiceover and Sidechain Ducking

1. **Narration Direction**: `scripts/build-audio.mjs` synthesizes 5 timed English cues for the `28.50s` NASA cut and 15 timed English cues for the `92.00s` Full Product Demo, trimming leading/trailing silence (`silenceremove`) and fitting each cue inside its exact chapter window with zero overlap.
2. **ElevenLabs CLI and Neural Studio Fallback**:
   1. `@elevenlabs/elevenlabs-js` is installed in `projects/project_1`, and `scripts/generate-elevenlabs-audio.mjs` automatically reads `ELEVENLABS_API_KEY` from `.env.local` (`eleven_multilingual_v2`, stability `0.50`, similarityBoost `0.78`, speaker boost enabled).
   2. When `ELEVENLABS_API_KEY` is not set in the local environment, `build-audio.mjs` synthesizes studio English narration via `uvx edge-tts` (`en-US-ChristopherNeural`), guaranteeing every rendered MP4 ships with crisp, audible English voiceover out of the box.
3. **Sidechain Compression**: The music + tactile SFX bed is sidechain ducked underneath the narration via `ffmpeg sidechaincompress=threshold=0.022:ratio=4.8:attack=24:release=290` so the score breathes between sentences and never clashes with speech.

## Loudness Mastering and Verification

All exported stereo MP3 tracks (`48,000 Hz`, `192 kbps`, high pass filtered at `30 Hz`) are mastered via `ffmpeg loudnorm=I=-16:TP=-1.5:LRA=11`.

| Output Asset | Runtime | Channels / Rate | Muxed MP4 Mean / Peak | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `public/audio/dopaimint-hackathon-28s.mp3` | `28.500s` | Stereo / 48 kHz | `-19.7 dB` mean / `-2.8 dB` peak | Directed 5 cue VO + ducked launch score + SFX for `NasaHackathon1080p` and `NasaHackathon1080x700` |
| `public/audio/dopaimint-launch-1080p.mp3` | `92.000s` | Stereo / 48 kHz | `-19.6 dB` mean / `-2.2 dB` peak | Directed 15 cue VO + ducked launch score + SFX for `DopaiMintFullLaunch1080p` |
