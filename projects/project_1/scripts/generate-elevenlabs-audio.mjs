import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envLocalPath = path.join(rootDir, '.env.local');

if (fs.existsSync(envLocalPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envLocalPath);
  } catch {
    // ignore
  }
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.log(
    'ELEVENLABS_API_KEY not found in .env.local; delegating to scripts/build-audio.mjs neural studio voiceover + sidechain-ducked score.',
  );
} else {
  console.log('ELEVENLABS_API_KEY detected; building ElevenLabs multilingual_v2 voiceover + ducked score.');
}

execFileSync('node', [path.join(__dirname, 'build-audio.mjs')], {
  cwd: rootDir,
  stdio: 'inherit',
});
