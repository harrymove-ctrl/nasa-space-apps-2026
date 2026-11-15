import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.join(rootDir, 'public', 'audio');
fs.mkdirSync(audioDir, { recursive: true });

// Client reads ELEVENLABS_API_KEY automatically from environment (e.g. `node --env-file=.env.local`).
if (!process.env.ELEVENLABS_API_KEY) {
  console.log(
    'ElevenLabs API key not active in environment yet. Run `npx -y @elevenlabs/cli@latest onboard connect --env-path .env.local` in interactive browser mode first, or run `node scripts/build-audio.mjs` for offline mastered audio.'
  );
  process.exit(0);
}

const client = new ElevenLabsClient();

const NARRATION_BEATS = [
  {
    id: 'hackathon-28s',
    text:
      'Eight siloed NASA feeds cost crews precious minutes when megafires and solar storms hit together. DopaiMint tracks active hotspots at three hundred seventy five meters, runs real IEEE seven thirty eight thermal limits, and hands live proton flux into CradleFlow so operators wire habitat shielding before dose climbs. Open source, live on NASA data, built for Space Apps.',
  },
  {
    id: 'launch-54s',
    text:
      'Orbit to outpost in one live twin. While megafires and coronal mass ejections collide across critical grids and lunar bases, legacy tools leave telemetry scattered across eight disconnected NASA portals. DopaiMint unifies MODIS, VIIRS, GIBS, POWER, ASF SAR, DONKI, and OSDR into a zero-login orbital command desk. See our code diff in elliptic hotspot deduplication, launch CradleFlow autonomous shielding drills, and test every physical model live in your browser today.',
  },
];

async function writeStreamToFile(stream, outPath) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  fs.writeFileSync(outPath, Buffer.concat(chunks));
}

async function main() {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';

  for (const beat of NARRATION_BEATS) {
    const voiceRaw = path.join(audioDir, `eleven-vo-${beat.id}.mp3`);
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: beat.text,
      modelId: 'eleven_multilingual_v2',
      voiceSettings: {
        stability: 0.48,
        similarityBoost: 0.78,
        style: 0.25,
        useSpeakerBoost: true,
      },
    });
    await writeStreamToFile(audioStream, voiceRaw);
    console.log('Generated ElevenLabs voiceover:', voiceRaw);
  }

  const sfxPrompts = [
    { file: 'sfx-whoosh.mp3', prompt: 'Clean modern aerospace UI camera swipe whoosh, crisp studio finish', duration: 0.9 },
    { file: 'sfx-scanner.mp3', prompt: 'High tech green radar scanner beam telemetry lock blip', duration: 1.2 },
    { file: 'sfx-impact.mp3', prompt: 'Tight cinematic sub bass reveal hit with warm metallic shimmer', duration: 1.4 },
    { file: 'sfx-pop.mp3', prompt: 'Crisp gentle modern software notification pop sound', duration: 0.5 },
  ];

  for (const item of sfxPrompts) {
    const outPath = path.join(audioDir, item.file);
    const stream = await client.textToSoundEffects.convert({
      text: item.prompt,
      durationSeconds: item.duration,
      promptInfluence: 0.45,
    });
    await writeStreamToFile(stream, outPath);
    console.log('Generated ElevenLabs SFX:', outPath);
  }

  // Mix generated narration cleanly over the local instrumental bed using sidechain ducking + -16 LUFS normalization.
  const targets = [
    { vo: 'eleven-vo-hackathon-28s.mp3', music: 'dopaimint-hackathon-28s.mp3', out: 'dopaimint-hackathon-28s-mix.mp3', sec: '28.5' },
    { vo: 'eleven-vo-launch-54s.mp3', music: 'dopaimint-launch-1080p.mp3', out: 'dopaimint-launch-1080p-mix.mp3', sec: '54.0' },
  ];

  for (const t of targets) {
    const voPath = path.join(audioDir, t.vo);
    const musicPath = path.join(audioDir, t.music);
    const outPath = path.join(audioDir, t.out);
    if (!fs.existsSync(voPath) || !fs.existsSync(musicPath)) continue;
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        musicPath,
        '-i',
        voPath,
        '-filter_complex',
        `[0:a]volume=0.58[m];[1:a]aresample=48000,apad=whole_dur=${t.sec},volume=1.15[v];[m][v]sidechaincompress=threshold=0.025:ratio=4.5:attack=30:release=260[ducked];[ducked][v]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[out]`,
        '-map',
        '[out]',
        '-t',
        t.sec,
        '-c:a',
        'libmp3lame',
        '-b:a',
        '192k',
        outPath,
      ],
      { stdio: 'pipe' }
    );
    console.log('Mixed ducked ElevenLabs track:', outPath);
  }
}

main().catch((err) => {
  console.error('ElevenLabs generation failed:', err?.message || err);
  process.exit(1);
});
