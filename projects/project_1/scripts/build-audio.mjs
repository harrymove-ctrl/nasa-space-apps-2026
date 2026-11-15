import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.join(rootDir, 'public', 'audio');
const voCacheDir = path.join(rootDir, '.cache-vo');
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(voCacheDir, { recursive: true });

// Load .env.local silently if present (never log or expose secret values)
const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envLocalPath);
  } catch {
    // ignore malformed env file
  }
}

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
      'highpass=f=30,loudnorm=I=-16:TP=-1.5:LRA=11',
      '-c:a',
      'libmp3lame',
      '-b:a',
      '192k',
      mp3Path,
    ],
    { stdio: 'pipe' },
  );
  fs.rmSync(wavPath, { force: true });
}

function midiToHz(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function noiseAt(idx) {
  const x = Math.sin(idx * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function addWhoosh(left, right, centerSec, dur = 0.5, amp = 0.24) {
  const start = Math.max(0, Math.floor((centerSec - dur * 0.5) * SR));
  const len = Math.floor(dur * SR);
  let lp = 0;
  for (let i = 0; i < len && start + i < left.length; i++) {
    const u = i / len;
    const env = Math.sin(Math.PI * u) ** 1.8;
    const cutoff = 0.035 + 0.2 * Math.sin(Math.PI * u);
    lp = lp + cutoff * (noiseAt(start + i) - lp);
    const tone = Math.sin(2 * Math.PI * (130 + 220 * u) * (i / SR)) * 0.18;
    const val = (lp * 1.3 + tone) * env * amp;
    left[start + i] += val * (0.85 + 0.15 * Math.cos(u * 3));
    right[start + i] += val * (0.85 + 0.15 * Math.sin(u * 3));
  }
}

function addImpact(left, right, startSec, amp = 0.44) {
  const start = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(0.85 * SR);
  for (let i = 0; i < len && start + i < left.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 6.2);
    const freq = 46 + 96 * Math.exp(-t * 26);
    const punch = Math.sin(2 * Math.PI * freq * t);
    const click = t < 0.012 ? noiseAt(i * 3) * (1 - t / 0.012) * 0.35 : 0;
    const val = (punch * 0.88 + click) * env * amp;
    left[start + i] += val;
    right[start + i] += val;
  }
}

function addScannerSweep(left, right, startSec, dur = 0.95, amp = 0.19) {
  const start = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(dur * SR);
  for (let i = 0; i < len && start + i < left.length; i++) {
    const u = i / len;
    const env = Math.sin(Math.PI * u) * Math.exp(-u * 0.65);
    const f = 520 + 680 * u;
    const s =
      Math.sin(2 * Math.PI * f * (i / SR)) * 0.6 +
      Math.sin(2 * Math.PI * f * 1.5 * (i / SR)) * 0.3;
    left[start + i] += s * env * amp * (1.0 - 0.2 * u);
    right[start + i] += s * env * amp * (0.8 + 0.2 * u);
  }
}

function addPop(left, right, startSec, pitchHz = 760, amp = 0.18, pan = 0) {
  const start = Math.max(0, Math.floor(startSec * SR));
  const len = Math.floor(0.12 * SR);
  const panL = Math.cos(((pan + 1) * Math.PI) / 4);
  const panR = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len && start + i < left.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 36);
    const f = pitchHz * (1 + 0.35 * Math.exp(-t * 52));
    const sig = Math.sin(2 * Math.PI * f * t) * env * amp;
    left[start + i] += sig * panL;
    right[start + i] += sig * panR;
  }
}

function buildStandaloneSfx() {
  const specs = [
    { name: 'sfx-whoosh', dur: 0.7, fn: (l, r) => addWhoosh(l, r, 0.35, 0.62, 0.52) },
    { name: 'sfx-scanner', dur: 1.0, fn: (l, r) => addScannerSweep(l, r, 0.04, 0.9, 0.45) },
    { name: 'sfx-impact', dur: 0.95, fn: (l, r) => addImpact(l, r, 0.02, 0.68) },
    { name: 'sfx-pop', dur: 0.22, fn: (l, r) => addPop(l, r, 0.01, 780, 0.48, 0) },
    {
      name: 'sfx-blip',
      dur: 0.25,
      fn: (l, r) => {
        addPop(l, r, 0.01, 980, 0.36, -0.2);
        addPop(l, r, 0.08, 1240, 0.3, 0.2);
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
  }
}

async function synthesizeSpeechClip(text, tag) {
  const hasEleven = Boolean(process.env.ELEVENLABS_API_KEY);
  const engineKey = hasEleven ? 'elevenlabs-v2' : 'edge-christopher-neural';
  const hash = crypto
    .createHash('sha1')
    .update(`${engineKey}:${text}`)
    .digest('hex')
    .slice(0, 12);
  const cachedMp3 = path.join(voCacheDir, `${tag}-${hash}.mp3`);

  if (!fs.existsSync(cachedMp3)) {
    if (hasEleven) {
      const client = new ElevenLabsClient();
      const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
      const stream = await client.textToSpeech.convert(voiceId, {
        text,
        modelId: 'eleven_multilingual_v2',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.78,
          style: 0.22,
          useSpeakerBoost: true,
        },
      });
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      fs.writeFileSync(cachedMp3, Buffer.concat(chunks));
    } else {
      execFileSync(
        'uvx',
        [
          'edge-tts',
          '--voice',
          'en-US-ChristopherNeural',
          '--text',
          text,
          '--write-media',
          cachedMp3,
        ],
        { stdio: 'pipe' },
      );
    }
  }

  // Trim leading/trailing silence so cue placement is frame-accurate
  const trimmedWav = path.join(voCacheDir, `${tag}-${hash}-trim.wav`);
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      cachedMp3,
      '-af',
      'silenceremove=start_periods=1:start_silence=0.03:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse,aresample=48000',
      '-ac',
      '1',
      '-c:a',
      'pcm_s16le',
      trimmedWav,
    ],
    { stdio: 'pipe' },
  );

  const durSec = Number(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        trimmedWav,
      ],
      { encoding: 'utf8' },
    ).trim(),
  );

  // If a cue slightly exceeds its max window, apply gentle atempo (<= 1.18x) so zero overlap ever happens
  return { trimmedWav, durSec };
}

async function buildVoiceoverTimelineWav(outWavPath, durationSec, segments) {
  const prepared = [];
  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx];
    const nextStart = idx + 1 < segments.length ? segments[idx + 1].startSec : durationSec - 0.25;
    const maxAllowed = Math.max(1.0, nextStart - seg.startSec - 0.18);
    const { trimmedWav, durSec } = await synthesizeSpeechClip(seg.text, `${seg.id}`);

    let finalClipWav = trimmedWav;
    let finalDur = durSec;
    if (durSec > maxAllowed) {
      const tempo = Math.min(1.28, Math.max(1.02, durSec / maxAllowed));
      const fittedWav = trimmedWav.replace('-trim.wav', `-fit-${tempo.toFixed(2)}.wav`);
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          trimmedWav,
          '-af',
          `atempo=${tempo.toFixed(3)},aresample=48000`,
          '-ac',
          '1',
          '-c:a',
          'pcm_s16le',
          fittedWav,
        ],
        { stdio: 'pipe' },
      );
      finalClipWav = fittedWav;
      finalDur = durSec / tempo;
    }

    prepared.push({
      ...seg,
      wav: finalClipWav,
      durSec: Number(finalDur.toFixed(2)),
    });
  }

  // Assemble exact-length stereo voiceover WAV in Node PCM buffer (zero filtergraph complexity limits!)
  const totalSamples = Math.floor(durationSec * SR);
  const voLeft = new Float32Array(totalSamples);
  const voRight = new Float32Array(totalSamples);

  for (const item of prepared) {
    const buf = fs.readFileSync(item.wav);
    // Find 'data' chunk in 16-bit mono WAV
    let dataOffset = 44;
    for (let p = 12; p < Math.min(buf.length - 8, 256); p++) {
      if (
        buf[p] === 0x64 &&
        buf[p + 1] === 0x61 &&
        buf[p + 2] === 0x74 &&
        buf[p + 3] === 0x61
      ) {
        dataOffset = p + 8;
        break;
      }
    }
    const sampleCount = Math.floor((buf.length - dataOffset) / 2);
    const dstStart = Math.floor(item.startSec * SR);
    for (let s = 0; s < sampleCount && dstStart + s < totalSamples; s++) {
      const pcm = buf.readInt16LE(dataOffset + s * 2) / 32768;
      // Subtle fade-in/out 8ms to prevent clicks
      const edge = Math.min(1, s / (0.008 * SR), (sampleCount - s) / (0.012 * SR));
      const v = pcm * edge * 0.92;
      voLeft[dstStart + s] += v;
      voRight[dstStart + s] += v;
    }
  }

  writeWavStereo(outWavPath, voLeft, voRight);
  return prepared;
}

function synthesizeInstrumentalWav(outWavPath, durationSec, warmPaperStartSec, cues) {
  const totalSamples = Math.floor(durationSec * SR);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const bpm = 118;
  const beatSec = 60 / bpm;
  const stepSec = beatSec / 4;

  // Sleek modern product-launch progression: F#m9 -> Dmaj7 -> Eadd9 -> C#m7
  const roots = [42, 38, 40, 37];
  const chords = [
    [54, 57, 61, 64, 68],
    [50, 54, 57, 61, 66],
    [52, 56, 59, 64, 66],
    [49, 52, 56, 59, 64],
  ];
  const motifSteps = [0, 2, 4, 3, 1, 4, 2, 3];

  let subPhase = 0;
  const padPhases = [0, 0, 0, 0];
  let bellPhase = 0;

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
    const inWarmPaper = t >= warmPaperStartSec;

    // Dynamic energy curve: early motif hook -> tension build -> reveal groove -> warm minimal bridge -> clean final resolve
    let energy = 0.62;
    if (t < 3.0) energy = 0.66 + 0.12 * (t / 3.0);
    else if (!inWarmPaper) energy = 0.82;
    else energy = 0.48;

    // 1. Warm sine/triangle sub-bass
    subPhase += midiToHz(rootMidi) / SR;
    const subGate = inWarmPaper ? 0.72 : beatPos < 0.86 ? 1 - beatPos * 0.28 : 0.72;
    const subVal =
      (Math.sin(subPhase * Math.PI * 2) * 0.82 + Math.sin(subPhase * Math.PI * 4) * 0.18) *
      0.24 *
      subGate *
      energy;

    // 2. Rhodes-like warm electric piano / synth pad
    for (let k = 0; k < 4; k++) {
      const detune = k % 2 === 0 ? 1.0009 : 0.9991;
      padPhases[k] += (midiToHz(chord[k]) * detune) / SR;
    }
    const rhodesEnv = 0.74 + 0.26 * Math.exp(-beatPos * 2.8);
    const padL =
      (Math.sin(padPhases[0] * Math.PI * 2) * 0.44 +
        Math.sin(padPhases[1] * Math.PI * 2) * 0.34 +
        Math.sin(padPhases[3] * Math.PI * 2) * 0.22) *
      0.16 *
      rhodesEnv;
    const padR =
      (Math.sin(padPhases[0] * Math.PI * 2) * 0.42 +
        Math.sin(padPhases[2] * Math.PI * 2) * 0.36 +
        Math.sin(padPhases[3] * Math.PI * 2) * 0.24) *
      0.16 *
      rhodesEnv;

    // 3. Glassy harmonic pluck motif (gentler and octave-softer in Warm Paper section)
    const noteMidi = chord[motifSteps[stepIdx % motifSteps.length]] + (inWarmPaper ? 0 : 12);
    bellPhase += midiToHz(noteMidi) / SR;
    const pluckEnv = Math.exp(-stepPos * (inWarmPaper ? 6.5 : 4.8));
    const pluckAmp = inWarmPaper ? 0.055 : 0.105;
    const pluckVal =
      (Math.sin(bellPhase * Math.PI * 2) * 0.75 + Math.sin(bellPhase * Math.PI * 4) * 0.25) *
      pluckEnv *
      pluckAmp *
      energy;
    const pan = Math.sin(stepIdx * 0.65) * 0.38;

    // 4. Clean studio kick + subtle shaker (drops out in Warm Paper Demo-Day Pitch!)
    let kick = 0;
    if (!inWarmPaper && beatPos < 0.26) {
      const kt = beatPos * beatSec;
      const kf = 45 + 90 * Math.exp(-kt * 34);
      kick = Math.sin(2 * Math.PI * kf * kt) * Math.exp(-kt * 16) * 0.28 * energy;
    }
    let hat = 0;
    if (!inWarmPaper && t > 3.0 && stepIdx % 2 === 1 && stepPos < 0.14) {
      hat = (noiseAt(i) - noiseAt(i - 1)) * Math.exp(-stepPos * 38) * 0.042 * energy;
    }
    let rim = 0;
    if (!inWarmPaper && t > 7.0 && (beatInBar === 1 || beatInBar === 3) && beatPos < 0.16) {
      const rt = beatPos * beatSec;
      rim =
        (noiseAt(i * 2) * 0.55 + Math.sin(rt * 1450) * 0.45) *
        Math.exp(-rt * 28) *
        0.085 *
        energy;
    }

    // Final resolved cadence chord bloom & clean cutoff
    const tailFade =
      t > durationSec - 0.75 ? Math.max(0, (durationSec - t) / 0.75) : 1.0;

    left[i] = (subVal + padL + pluckVal * (1 - pan * 0.45) + kick + hat + rim) * tailFade;
    right[i] = (subVal + padR + pluckVal * (1 + pan * 0.45) + kick - hat * 0.65 + rim) * tailFade;
  }

  for (const cue of cues) {
    if (cue.type === 'scan') addScannerSweep(left, right, cue.t, cue.dur ?? 0.9, cue.amp ?? 0.18);
    if (cue.type === 'impact') addImpact(left, right, cue.t, cue.amp ?? 0.42);
    if (cue.type === 'whoosh') addWhoosh(left, right, cue.t, cue.dur ?? 0.48, cue.amp ?? 0.22);
    if (cue.type === 'pop') addPop(left, right, cue.t, cue.pitch ?? 780, cue.amp ?? 0.16, cue.pan ?? 0);
  }

  writeWavStereo(outWavPath, left, right);
}

function mixMusicUnderVoiceover({ musicWav, voWav, outMp3, durationSec }) {
  // Sidechain-duck the music bed cleanly underneath the narration so they never clash, then master to -16 LUFS
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i',
      musicWav,
      '-i',
      voWav,
      '-filter_complex',
      [
        `[0:a]highpass=f=30,volume=0.72[m]`,
        `[1:a]highpass=f=85,acompressor=threshold=-18dB:ratio=2.8:attack=8:release=120:makeup=2dB,volume=1.28[v]`,
        `[v]asplit=2[vsc][vmix]`,
        `[m][vsc]sidechaincompress=threshold=0.018:ratio=5.5:attack=18:release=290:knee=4[ducked]`,
        `[ducked][vmix]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=10[out]`,
      ].join(';'),
      '-map',
      '[out]',
      '-t',
      String(durationSec),
      '-c:a',
      'libmp3lame',
      '-b:a',
      '192k',
      outMp3,
    ],
    { stdio: 'pipe' },
  );
  fs.rmSync(musicWav, { force: true });
  fs.rmSync(voWav, { force: true });
}

const HACKATHON_28S_VO = [
  {
    id: 'h28-1-intro',
    startSec: 0.3,
    text: 'Meet DopaiMint: live orbital fire and solar risk telemetry for grid crews and space habitats.',
  },
  {
    id: 'h28-2-spec',
    startSec: 5.1,
    text: 'Eight keyless NASA streams, fused into one zero-login twin.',
  },
  {
    id: 'h28-3-walk',
    startSec: 8.15,
    text: 'Inspect deduplicated MODIS and VIIRS fire footprints, verify five provenance layers, and hand live proton flux into CradleFlow.',
  },
  {
    id: 'h28-4-hype',
    startSec: 17.15,
    text: 'Mobile dispatch seals habitat storm shields at Grade S.',
  },
  {
    id: 'h28-5-pitch',
    startSec: 21.2,
    text: 'Live IEEE seven-thirty-eight line limits and over one thousand OSDR studies, open in your browser today.',
  },
];

const LAUNCH_92S_VO = [
  {
    id: 'f92-01-intro',
    startSec: 0.4,
    text: 'When megafires and solar storms strike together, DopaiMint gives grid crews and space habitats one live digital twin, open with zero login.',
  },
  {
    id: 'f92-02-hello',
    startSec: 7.15,
    text: 'MODIS, VIIRS, DONKI, GOES, and OSDR, fused in real time.',
  },
  {
    id: 'f92-03-spec',
    startSec: 10.0,
    text: 'Eight keyless NASA feeds driving one unified Earth-to-orbit engine.',
  },
  {
    id: 'f92-04-carbon',
    startSec: 13.25,
    text: 'In forty-eight hours, we replaced siloed fire CSVs and static line ratings with elliptical H3 deduplication, IEEE seven-thirty-eight physics, and same-origin CradleFlow handoff.',
  },
  {
    id: 'f92-05-step1',
    startSec: 22.3,
    text: 'Step one: on page load, inspect Butte two-thirty kilovolt safe ampacity alongside live GOES-eighteen X-ray and proton flux.',
  },
  {
    id: 'f92-06-step2',
    startSec: 28.05,
    text: 'Step two: explore the twenty-six-year Burning Calendar, removing thirty-eight percent duplicate multi-satellite thermal footprints.',
  },
  {
    id: 'f92-07-step3',
    startSec: 33.8,
    text: 'Step three: verify every corridor alert on the five-layer provenance map, linked directly to FIRMS, EONET, GIBS, and Sentinel-one SAR.',
  },
  {
    id: 'f92-08-step4',
    startSec: 39.55,
    text: 'Step four: clear the three-wave grid triage drill and hand live solar flux into CradleFlow, wiring storm shields below twelve millisieverts.',
  },
  {
    id: 'f92-09-rail',
    startSec: 45.3,
    text: 'Six interactive stations span Earth corridor physics, space biology, and archival light mode.',
  },
  {
    id: 'f92-10-wall',
    startSec: 51.75,
    text: 'Every station adapts cleanly to mobile field viewports with zero clipped telemetry.',
  },
  {
    id: 'f92-11-hype',
    startSec: 57.2,
    text: 'Crew alerts and automated CradleFlow shelter gates respond in milliseconds.',
  },
  {
    id: 'f92-12-thread',
    startSec: 61.3,
    text: 'Flight directors and mission specialists track verified sensor handoffs in one quiet, synchronized transcript.',
  },
  {
    id: 'f92-13-problem',
    startSec: 68.4,
    text: 'The problem: wildfire plumes, conductor sag, and radiation alerts still sit on disconnected islands when minutes decide survival.',
  },
  {
    id: 'f92-14-numbers',
    startSec: 76.1,
    text: 'The numbers that move: eight keyless streams fused, four hundred twenty-five amps live safe rating, and over one thousand OSDR studies wired.',
  },
  {
    id: 'f92-15-ask',
    startSec: 84.1,
    text: 'Run the live observatory and three-wave mission drill in your browser today at dopaimint-production dot up dot railway dot app.',
  },
];

async function main() {
  buildStandaloneSfx();

  // 1. Build 28.50s Official NASA Space Apps Track (Music + SFX + Directed Voiceover)
  const h28MusicWav = path.join(audioDir, 'tmp-h28-music.wav');
  const h28VoWav = path.join(audioDir, 'tmp-h28-vo.wav');
  synthesizeInstrumentalWav(h28MusicWav, 28.5, 21.0, [
    { type: 'impact', t: 0.04, amp: 0.46 },
    { type: 'scan', t: 0.25, dur: 1.05, amp: 0.18 },
    { type: 'whoosh', t: 5.0, dur: 0.45, amp: 0.22 },
    { type: 'whoosh', t: 8.0, dur: 0.45, amp: 0.22 },
    { type: 'pop', t: 8.9, pitch: 820, amp: 0.15, pan: -0.2 },
    { type: 'whoosh', t: 11.0, dur: 0.4, amp: 0.18 },
    { type: 'pop', t: 11.9, pitch: 880, amp: 0.15, pan: 0.2 },
    { type: 'whoosh', t: 14.0, dur: 0.4, amp: 0.18 },
    { type: 'pop', t: 14.8, pitch: 940, amp: 0.15, pan: -0.15 },
    { type: 'impact', t: 17.0, amp: 0.4 },
    { type: 'pop', t: 18.2, pitch: 880, amp: 0.16, pan: -0.3 },
    { type: 'pop', t: 18.6, pitch: 1020, amp: 0.16, pan: 0.3 },
    { type: 'whoosh', t: 21.0, dur: 0.48, amp: 0.2 },
    { type: 'impact', t: 27.6, amp: 0.32 },
  ]);
  const h28Prepared = await buildVoiceoverTimelineWav(h28VoWav, 28.5, HACKATHON_28S_VO);
  const h28Out = path.join(audioDir, 'dopaimint-hackathon-28s.mp3');
  mixMusicUnderVoiceover({
    musicWav: h28MusicWav,
    voWav: h28VoWav,
    outMp3: h28Out,
    durationSec: 28.5,
  });

  // 2. Build 92.00s Flagship Full Product Demo Track (Music + SFX + Directed Voiceover)
  const f92MusicWav = path.join(audioDir, 'tmp-f92-music.wav');
  const f92VoWav = path.join(audioDir, 'tmp-f92-vo.wav');
  synthesizeInstrumentalWav(f92MusicWav, 92.0, 68.0, [
    { type: 'impact', t: 0.05, amp: 0.48 },
    { type: 'scan', t: 0.35, dur: 1.25, amp: 0.19 },
    { type: 'pop', t: 1.1, pitch: 760, amp: 0.15, pan: -0.2 },
    { type: 'pop', t: 1.5, pitch: 900, amp: 0.15, pan: 0.2 },
    { type: 'whoosh', t: 7.0, dur: 0.48, amp: 0.24 },
    { type: 'impact', t: 9.8, amp: 0.38 },
    { type: 'scan', t: 10.0, dur: 0.9, amp: 0.16 },
    { type: 'whoosh', t: 13.0, dur: 0.48, amp: 0.22 },
    { type: 'pop', t: 15.2, pitch: 820, amp: 0.14 },
    { type: 'pop', t: 17.4, pitch: 920, amp: 0.14 },
    { type: 'whoosh', t: 22.0, dur: 0.5, amp: 0.24 },
    { type: 'pop', t: 23.1, pitch: 840, amp: 0.15, pan: -0.2 },
    { type: 'whoosh', t: 27.73, dur: 0.45, amp: 0.2 },
    { type: 'pop', t: 28.9, pitch: 880, amp: 0.15, pan: 0.2 },
    { type: 'whoosh', t: 33.47, dur: 0.45, amp: 0.2 },
    { type: 'pop', t: 34.6, pitch: 920, amp: 0.15, pan: -0.2 },
    { type: 'whoosh', t: 39.2, dur: 0.45, amp: 0.2 },
    { type: 'pop', t: 40.3, pitch: 980, amp: 0.16, pan: 0.2 },
    { type: 'whoosh', t: 45.0, dur: 0.48, amp: 0.22 },
    { type: 'whoosh', t: 46.8, dur: 0.38, amp: 0.17 },
    { type: 'whoosh', t: 48.3, dur: 0.38, amp: 0.17 },
    { type: 'whoosh', t: 51.5, dur: 0.48, amp: 0.22 },
    { type: 'impact', t: 57.0, amp: 0.42 },
    { type: 'pop', t: 58.2, pitch: 880, amp: 0.16, pan: -0.35 },
    { type: 'pop', t: 58.8, pitch: 1040, amp: 0.16, pan: 0.35 },
    { type: 'whoosh', t: 61.0, dur: 0.45, amp: 0.2 },
    { type: 'pop', t: 62.6, pitch: 780, amp: 0.14 },
    { type: 'pop', t: 64.1, pitch: 860, amp: 0.14 },
    { type: 'pop', t: 65.6, pitch: 940, amp: 0.14 },
    { type: 'whoosh', t: 68.0, dur: 0.52, amp: 0.22 },
    { type: 'pop', t: 75.7, pitch: 840, amp: 0.14 },
    { type: 'pop', t: 83.7, pitch: 960, amp: 0.14 },
    { type: 'impact', t: 91.1, amp: 0.34 },
  ]);
  const f92Prepared = await buildVoiceoverTimelineWav(f92VoWav, 92.0, LAUNCH_92S_VO);
  const f92Out = path.join(audioDir, 'dopaimint-launch-1080p.mp3');
  mixMusicUnderVoiceover({
    musicWav: f92MusicWav,
    voWav: f92VoWav,
    outMp3: f92Out,
    durationSec: 92.0,
  });

  console.log(
    JSON.stringify(
      {
        status: 'PASS',
        voiceEngine: process.env.ELEVENLABS_API_KEY ? 'elevenlabs-multilingual-v2' : 'neural-studio-vo',
        hackathon28sCues: h28Prepared.length,
        launch92sCues: f92Prepared.length,
        outputs: [h28Out, f92Out],
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error('BUILD AUDIO FAILED:', err);
  process.exit(1);
});
