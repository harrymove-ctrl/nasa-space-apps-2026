import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.join(rootDir, 'public', 'audio');
fs.mkdirSync(audioDir, { recursive: true });

const SR = 48000;

function writeWavStereo(outPath, left, right) {
  const frames = left.length;
  const buffer = Buffer.alloc(44 + frames * 4);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + frames * 4, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 4, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(frames * 4, 40);

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    const l = Math.max(-0.98, Math.min(0.98, left[i]));
    const r = Math.max(-0.98, Math.min(0.98, right[i]));
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }
  fs.writeFileSync(outPath, buffer);
}

function encodeNormalizedMp3(wavPath, mp3Path) {
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      wavPath,
      '-af',
      'highpass=f=28,loudnorm=I=-16:TP=-1.5:LRA=11',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '192k',
      mp3Path,
    ],
    { stdio: 'pipe' }
  );
  fs.unlinkSync(wavPath);
}

function midiToHz(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function detunedSaw(phase) {
  const f = phase - Math.floor(phase);
  return (f * 2 - 1) * 0.6 + Math.sin(phase * Math.PI * 2) * 0.4;
}

function noiseAt(idx) {
  // Deterministic PRNG hash
  const x = Math.sin(idx * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function addWhoosh(left, right, centerSec, dur = 0.55, amp = 0.28) {
  const start = Math.max(0, Math.floor((centerSec - dur * 0.55) * SR));
  const len = Math.floor(dur * SR);
  let lp = 0;
  for (let i = 0; i < len && start + i < left.length; i++) {
    const u = i / len;
    const env = Math.sin(Math.PI * u) ** 1.7;
    const cutoff = 0.04 + 0.24 * Math.sin(Math.PI * u);
    lp = lp + cutoff * (noiseAt(start + i) - lp);
    const tone = Math.sin(2 * Math.PI * (140 + 260 * u) * (i / SR)) * 0.22;
    const val = (lp * 1.4 + tone) * env * amp;
    left[start + i] += val * (0.85 + 0.15 * Math.cos(u * 3));
    right[start + i] += val * (0.85 + 0.15 * Math.sin(u * 3));
  }
}

function addImpact(left, right, startSec, amp = 0.52) {
  const start = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(0.85 * SR);
  for (let i = 0; i < len && start + i < left.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 6.5);
    const freq = 48 + 115 * Math.exp(-t * 28);
    const punch = Math.sin(2 * Math.PI * freq * t);
    const click = t < 0.015 ? noiseAt(i * 3) * (1 - t / 0.015) * 0.45 : 0;
    const val = (punch * 0.85 + click) * env * amp;
    left[start + i] += val;
    right[start + i] += val;
  }
}

function addScannerSweep(left, right, startSec, dur = 0.9, amp = 0.24) {
  const start = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len && start + i < left.length; i++) {
    const u = i / len;
    const env = Math.sin(Math.PI * u) * Math.exp(-u * 0.7);
    const f = 540 + 780 * u;
    const s =
      Math.sin(2 * Math.PI * f * (i / SR)) * 0.6 +
      Math.sin(2 * Math.PI * f * 1.5 * (i / SR)) * 0.35;
    left[start + i] += s * env * amp * (1.0 - 0.2 * u);
    right[start + i] += s * env * amp * (0.8 + 0.2 * u);
  }
}

function addPop(left, right, startSec, pitchHz = 740, amp = 0.22, pan = 0) {
  const start = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(0.14 * SR);
  const panL = Math.cos(((pan + 1) * Math.PI) / 4);
  const panR = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len && start + i < left.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 32);
    const f = pitchHz * (1 + 0.42 * Math.exp(-t * 48));
    const sig = Math.sin(2 * Math.PI * f * t) * env * amp;
    left[start + i] += sig * panL;
    right[start + i] += sig * panR;
  }
}

function buildStandaloneSfx() {
  const specs = [
    { name: 'sfx-whoosh', dur: 0.7, fn: (l, r) => addWhoosh(l, r, 0.35, 0.65, 0.55) },
    { name: 'sfx-scanner', dur: 1.0, fn: (l, r) => addScannerSweep(l, r, 0.04, 0.9, 0.48) },
    { name: 'sfx-impact', dur: 0.95, fn: (l, r) => addImpact(l, r, 0.02, 0.72) },
    { name: 'sfx-pop', dur: 0.22, fn: (l, r) => addPop(l, r, 0.01, 780, 0.52, 0) },
    {
      name: 'sfx-blip',
      dur: 0.25,
      fn: (l, r) => {
        addPop(l, r, 0.01, 980, 0.38, -0.2);
        addPop(l, r, 0.08, 1240, 0.32, 0.2);
      },
    },
  ];

  for (const s of specs) {
    const n = Math.floor(s.dur * SR);
    const l = new Float32Array(n);
    const r = new Float32Array(n);
    s.fn(l, r);
    const wav = path.join(audioDir, `${s.name}.wav`);
    const mp3 = path.join(audioDir, `${s.name}.mp3`);
    writeWavStereo(wav, l, r);
    encodeNormalizedMp3(wav, mp3);
    console.log('Built SFX:', mp3);
  }
}

function buildScoreTrack({ outName, durationSec, cues }) {
  const totalSamples = Math.floor(durationSec * SR);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const bpm = 124;
  const beatSec = 60 / bpm;
  const stepSec = beatSec / 4; // 16th-note pulse grid

  // Chord progression in F# minor / Dorian cyberpunk-corporate mood: F#m -> D -> E -> C#m
  const roots = [42, 38, 40, 37];
  const chords = [
    [54, 57, 61, 66],
    [50, 54, 57, 62],
    [52, 56, 59, 64],
    [49, 52, 56, 61],
  ];
  const arpPattern = [0, 1, 2, 3, 2, 1, 3, 2];

  // Phase trackers for smooth phase continuity
  let subPhase = 0;
  let padPhase0 = 0;
  let padPhase1 = 0;
  let padPhase2 = 0;
  let arpPhase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SR;
    const stepIdx = Math.floor(t / stepSec);
    const stepPos = (t % stepSec) / stepSec;
    const barIdx = Math.floor(t / (beatSec * 4));
    const beatInBar = Math.floor(t / beatSec) % 4;
    const beatPos = (t % beatSec) / beatSec;

    const progIdx = barIdx % chords.length;
    const rootMidi = roots[progIdx];
    const chord = chords[progIdx];

    // Narrative intensity envelope:
    // Hook early (0-2.5s), tighten during problem/diff (35%), punchy reveal & main energy (45%-78%), warm open space for pitch cards, clean final tail.
    const progress = t / durationSec;
    let energy = 0.58;
    if (progress < 0.08) energy = 0.68 + 0.14 * (progress / 0.08);
    else if (progress < 0.35) energy = 0.52 + 0.24 * ((progress - 0.08) / 0.27);
    else if (progress < 0.78) energy = 0.88;
    else if (progress < 0.94) energy = 0.44;
    else energy = Math.max(0.0, (1.0 - progress) / 0.06) * 0.55;

    // 1. Sub bass anchored cleanly at root MIDI + octave glide
    const bassFreq = midiToHz(rootMidi);
    subPhase += bassFreq / SR;
    const subEnv = beatPos < 0.85 ? 1 - beatPos * 0.35 : 0.65;
    const subVal = Math.sin(subPhase * Math.PI * 2) * 0.28 * subEnv * energy;

    // 2. Warm analog pad triad (subtle stereo shimmer)
    padPhase0 += midiToHz(chord[0]) / SR;
    padPhase1 += midiToHz(chord[1] * 1.0018) / SR;
    padPhase2 += midiToHz(chord[2] * 0.9982) / SR;
    const padL =
      (Math.sin(padPhase0 * Math.PI * 2) * 0.5 +
        Math.sin(padPhase1 * Math.PI * 2) * 0.38) *
      0.16;
    const padR =
      (Math.sin(padPhase0 * Math.PI * 2) * 0.5 +
        Math.sin(padPhase2 * Math.PI * 2) * 0.38) *
      0.16;

    // 3. Driving 16th arpeggio during high-energy build & feature sections
    const arpNote = chord[arpPattern[stepIdx % arpPattern.length]] + 12;
    arpPhase += midiToHz(arpNote) / SR;
    const arpGate = Math.exp(-stepPos * 5.2);
    const arpWeight = progress > 0.78 ? 0.14 : progress > 0.34 ? 0.85 : 0.45;
    const arpVal = detunedSaw(arpPhase) * arpGate * 0.14 * arpWeight * energy;
    const pan = Math.sin(stepIdx * 0.7) * 0.45;

    // 4. Clean kick + crisp closed hat pulse (quiet on Warm-Paper Pitch beat)
    let kick = 0;
    if (progress < 0.82 && beatPos < 0.28) {
      const kt = beatPos * beatSec;
      const kf = 46 + 98 * Math.exp(-kt * 32);
      kick = Math.sin(2 * Math.PI * kf * kt) * Math.exp(-kt * 16) * 0.32 * energy;
    }
    let hat = 0;
    if (progress > 0.16 && progress < 0.82 && stepIdx % 2 === 1 && stepPos < 0.15) {
      hat = (noiseAt(i) - noiseAt(i - 1)) * Math.exp(-stepPos * 35) * 0.055 * energy;
    }
    // Snare clap on beats 1 and 3 in peak chorus
    let clap = 0;
    if (progress > 0.34 && progress < 0.78 && (beatInBar === 1 || beatInBar === 3) && beatPos < 0.22) {
      const ct = beatPos * beatSec;
      clap = (noiseAt(i * 2) * 0.75 + Math.sin(ct * 1100) * 0.25) * Math.exp(-ct * 22) * 0.12 * energy;
    }

    const tailFade = t > durationSec - 0.6 ? Math.max(0, (durationSec - t) / 0.6) : 1.0;

    left[i] = (subVal + padL + arpVal * (1 - pan * 0.5) + kick + hat + clap) * tailFade;
    right[i] = (subVal + padR + arpVal * (1 + pan * 0.5) + kick - hat * 0.7 + clap) * tailFade;
  }

  // Mix tactile UI & transition SFX cues frame-accurately onto the music bed
  for (const cue of cues) {
    if (cue.type === 'scan') addScannerSweep(left, right, cue.t, cue.dur ?? 0.9, cue.amp ?? 0.22);
    if (cue.type === 'impact') addImpact(left, right, cue.t, cue.amp ?? 0.48);
    if (cue.type === 'whoosh') addWhoosh(left, right, cue.t, cue.dur ?? 0.5, cue.amp ?? 0.26);
    if (cue.type === 'pop') addPop(left, right, cue.t, cue.pitch ?? 760, cue.amp ?? 0.2, cue.pan ?? 0);
  }

  const wavPath = path.join(audioDir, `${outName}.wav`);
  const mp3Path = path.join(audioDir, `${outName}.mp3`);
  writeWavStereo(wavPath, left, right);
  encodeNormalizedMp3(wavPath, mp3Path);
  console.log('Built Master Score:', mp3Path);
}

buildStandaloneSfx();

// 28.50s (855 frames @ 30fps) NASA Hackathon master track synchronized to exact NasaHackathon1080x700 scene cuts
buildScoreTrack({
  outName: 'dopaimint-hackathon-28s',
  durationSec: 28.5,
  cues: [
    { type: 'impact', t: 0.04, amp: 0.56 },
    { type: 'scan', t: 0.25, dur: 1.15, amp: 0.24 },
    { type: 'pop', t: 1.25, pitch: 720, amp: 0.2 },
    { type: 'pop', t: 1.85, pitch: 880, amp: 0.22 },
    { type: 'whoosh', t: 3.83, dur: 0.48, amp: 0.28 },
    { type: 'impact', t: 6.33, amp: 0.45 },
    { type: 'scan', t: 6.45, dur: 0.85, amp: 0.2 },
    { type: 'whoosh', t: 8.83, dur: 0.48, amp: 0.28 },
    { type: 'pop', t: 10.4, pitch: 740, amp: 0.18, pan: -0.25 },
    { type: 'whoosh', t: 12.17, dur: 0.48, amp: 0.28 },
    { type: 'pop', t: 13.0, pitch: 820, amp: 0.18, pan: 0.25 },
    { type: 'whoosh', t: 15.5, dur: 0.48, amp: 0.26 },
    { type: 'impact', t: 17.83, amp: 0.52 },
    { type: 'pop', t: 18.97, pitch: 840, amp: 0.2, pan: -0.35 },
    { type: 'pop', t: 19.23, pitch: 960, amp: 0.2, pan: 0.35 },
    { type: 'pop', t: 19.5, pitch: 1080, amp: 0.22, pan: -0.35 },
    { type: 'impact', t: 20.37, amp: 0.48 },
    { type: 'whoosh', t: 20.83, dur: 0.45, amp: 0.25 },
    { type: 'pop', t: 21.63, pitch: 760, amp: 0.18 },
    { type: 'pop', t: 22.43, pitch: 880, amp: 0.18 },
    { type: 'pop', t: 23.3, pitch: 960, amp: 0.18 },
    { type: 'impact', t: 24.5, amp: 0.44 },
    { type: 'pop', t: 27.22, pitch: 1046, amp: 0.24 },
  ],
});

// 54.00s (1620 frames @ 30fps) Full Launch Film master track synchronized to exact DopaiMintFullLaunch1080p scene cuts
buildScoreTrack({
  outName: 'dopaimint-launch-1080p',
  durationSec: 54.0,
  cues: [
    { type: 'impact', t: 0.05, amp: 0.58 },
    { type: 'scan', t: 0.3, dur: 1.4, amp: 0.24 },
    { type: 'pop', t: 1.7, pitch: 740, amp: 0.2 },
    { type: 'pop', t: 2.6, pitch: 920, amp: 0.2 },
    { type: 'whoosh', t: 5.5, dur: 0.52, amp: 0.3 },
    { type: 'impact', t: 8.0, amp: 0.5 },
    { type: 'scan', t: 8.15, dur: 1.0, amp: 0.22 },
    { type: 'whoosh', t: 10.67, dur: 0.5, amp: 0.28 },
    { type: 'pop', t: 13.73, pitch: 840, amp: 0.2 },
    { type: 'whoosh', t: 16.5, dur: 0.5, amp: 0.28 },
    { type: 'whoosh', t: 17.97, dur: 0.45, amp: 0.25 },
    { type: 'whoosh', t: 19.17, dur: 0.45, amp: 0.25 },
    { type: 'whoosh', t: 21.5, dur: 0.5, amp: 0.28 },
    { type: 'impact', t: 26.17, amp: 0.55 },
    { type: 'pop', t: 27.3, pitch: 780, amp: 0.22, pan: -0.4 },
    { type: 'pop', t: 27.83, pitch: 980, amp: 0.22, pan: 0.4 },
    { type: 'pop', t: 28.4, pitch: 1180, amp: 0.24 },
    { type: 'whoosh', t: 29.83, dur: 0.5, amp: 0.26 },
    { type: 'pop', t: 30.97, pitch: 760, amp: 0.2 },
    { type: 'pop', t: 32.1, pitch: 880, amp: 0.2 },
    { type: 'pop', t: 33.23, pitch: 960, amp: 0.2 },
    { type: 'pop', t: 34.3, pitch: 1046, amp: 0.2 },
    { type: 'impact', t: 35.5, amp: 0.46 },
    { type: 'pop', t: 48.1, pitch: 1046, amp: 0.24 },
  ],
});
