import { execFileSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'submission');
const IMG_DIR = path.join(OUT_DIR, 'images');
const DIST_SUBMISSION_DIR = path.join(PROJECT_ROOT, 'dist', 'submission');
const SCREENS_DIR = path.join(OUT_DIR, 'screens');
const DIST_SCREENS_DIR = path.join(DIST_SUBMISSION_DIR, 'screens');
const DIST_RAW_DIR = path.join(DIST_SUBMISSION_DIR, 'raw');

async function saveScreen(page, name) {
  const filename = `${name}.jpg`;
  const publicPath = path.join(SCREENS_DIR, filename);
  await page.screenshot({ path: publicPath, type: 'jpeg', quality: 92 });
  fs.copyFileSync(publicPath, path.join(DIST_SCREENS_DIR, filename));
}
const SCRATCH_ROOT =
  '/Users/harryphan/.gemini/antigravity/brain/3ccece75-188a-4c72-af68-df1fd73b80b6/scratch';
const FRAMES_DIR = path.join(SCRATCH_ROOT, 'video-frames');
const MOTION_SHEET_PATH = path.join(SCRATCH_ROOT, 'submission-motion-frames.png');
const DECK_SHEET_PATH = path.join(SCRATCH_ROOT, 'submission-deck-7slides-sheet.png');

const FPS = 30;
const DURATION_SEC = 28.5;
const TOTAL_FRAMES = Math.round(FPS * DURATION_SEC); // 855 frames = 28.50s

fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    '/Volumes/Dev/near-ai-chat/node_modules/playwright',
    '/Volumes/Dev/nimbus/node_modules/playwright',
  ];
  for (const modPath of candidates) {
    if (fs.existsSync(modPath)) {
      return require(modPath);
    }
  }
  throw new Error('Playwright not found in /Volumes/Dev/near-ai-chat or /Volumes/Dev/nimbus');
}

async function waitForHealth(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry until ready
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for server health at ${url}`);
}

function generateWavAudio(wavPath) {
  const sampleRate = 48000;
  const numChannels = 2;
  const totalSamples = Math.round(sampleRate * DURATION_SEC);
  const dataSize = totalSamples * numChannels * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28);
  buffer.writeUInt16LE(numChannels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  const chordA = [65.41, 130.81, 196.0, 293.66, 392.0];
  const chordB = [58.27, 116.54, 174.61, 261.63, 349.23];
  const chordC = [77.78, 155.56, 233.08, 349.23, 466.16];
  const cueTimes = [0.05, 4.5, 11.0, 17.0, 23.5];
  const cueFreqs = [587.33, 659.25, 783.99, 880.0, 1046.5];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    let freqs = chordA;
    if (t >= 11.0 && t < 17.0) freqs = chordB;
    else if (t >= 17.0) freqs = chordC;

    let env = 1.0;
    if (t < 0.5) env = t / 0.5;
    else if (t > DURATION_SEC - 0.9) env = Math.max(0, (DURATION_SEC - t) / 0.9);

    const beatPhase = (t * 2.0) % 1.0;
    const pulse = 0.78 + 0.22 * Math.exp(-beatPhase * 4.5);

    let padL = 0;
    let padR = 0;
    for (let k = 0; k < freqs.length; k++) {
      const f = freqs[k];
      const shimmer = 1.0 + 0.0018 * Math.sin(2 * Math.PI * (0.25 + k * 0.07) * t);
      const amp = (k === 0 ? 0.24 : 0.14 / (k * 0.65)) * pulse;
      padL += amp * Math.sin(2 * Math.PI * f * shimmer * t + k * 0.4);
      padR += amp * Math.sin(2 * Math.PI * f * (2.0 - shimmer) * t + k * 0.9);
    }

    let cueSig = 0;
    for (let c = 0; c < cueTimes.length; c++) {
      const dt = t - cueTimes[c];
      if (dt >= 0 && dt < 1.15) {
        const cf = cueFreqs[c];
        const bellEnv = Math.exp(-dt * 4.2) * Math.min(1, dt / 0.012);
        cueSig +=
          0.16 *
          bellEnv *
          (Math.sin(2 * Math.PI * cf * dt) + 0.35 * Math.sin(2 * Math.PI * cf * 2.0 * dt));
      }
    }

    const left = Math.max(-0.92, Math.min(0.92, (padL * 0.45 + cueSig * 0.55) * env));
    const right = Math.max(-0.92, Math.min(0.92, (padR * 0.45 + cueSig * 0.5) * env));

    const offset = 44 + i * 4;
    buffer.writeInt16LE(Math.round(left * 32767), offset);
    buffer.writeInt16LE(Math.round(right * 32767), offset + 2);
  }

  fs.writeFileSync(wavPath, buffer);
}

async function waitForStudioReady(page) {
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const imgsReady = imgs.every((img) => img.complete && img.naturalWidth > 0);
    const canvases = Array.from(document.querySelectorAll('[data-slot="ascii-rest-bg"] canvas'));
    const canvasesReady =
      canvases.length > 0 && canvases.every((c) => c.width > 0 && c.height > 0);
    const motionItems = Array.from(
      document.querySelectorAll('figure[data-frame] li, figure[data-frame] tbody tr, figure[data-frame] dl > div'),
    );
    const allVisible = motionItems.every((el) => Number.parseFloat(getComputedStyle(el).opacity) > 0.25);
    return imgsReady && canvasesReady && allVisible;
  });
}

async function verifyAsciiCanvasNonEmpty(page) {
  const active = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('[data-slot="ascii-rest-bg"] canvas'));
    return canvases.map((canvas) => {
      if (!(canvas instanceof HTMLCanvasElement) || canvas.width === 0 || canvas.height === 0) {
        return 0;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return 0;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const step = Math.max(1, Math.floor((canvas.width * canvas.height) / 12000));
      let count = 0;
      for (let p = 0; p < canvas.width * canvas.height; p += step) {
        const i = p * 4;
        if (data[i + 3] > 20 && (data[i] > 24 || data[i + 1] > 24 || data[i + 2] > 24)) {
          count++;
        }
      }
      return count;
    });
  });
  if (active.length === 0 || active.some((n) => n < 8)) {
    throw new Error(`ascii.rest canvas rendered too few active cells: ${JSON.stringify(active)}`);
  }
}

async function run() {
  // Remove stale static showcase HTML so /submission/ renders the React + mdxcn + ascii.rest studio
  const staleShowcase = path.join(OUT_DIR, 'index.html');
  if (fs.existsSync(staleShowcase)) {
    fs.rmSync(staleShowcase);
  }

  execFileSync('bun', ['run', 'build'], { cwd: PROJECT_ROOT, stdio: 'inherit' });

  fs.mkdirSync(SCREENS_DIR, { recursive: true });
  fs.mkdirSync(DIST_SCREENS_DIR, { recursive: true });
  fs.mkdirSync(DIST_RAW_DIR, { recursive: true });
  for (const staleName of ['terraspan-deck-7slides.pdf', 'terraspan-demo-28s.mp4']) {
    fs.rmSync(path.join(OUT_DIR, staleName), { force: true });
    fs.rmSync(path.join(DIST_SUBMISSION_DIR, staleName), { force: true });
  }

  const { chromium } = loadPlaywright();
  const port = 4189;
  const baseUrl = `http://127.0.0.1:${port}`;

  const server = spawn('bun', ['server.mjs'], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForHealth(`${baseUrl}/healthz`);
    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      // 1. Capture live product UI views into public/submission/screens/ and dist/submission/screens/ for mdxcn framing
      await page.goto(`${baseUrl}/?skipPreloader=1`, { waitUntil: 'load' });
      await page.waitForTimeout(2400);
      await saveScreen(page, 'overview');

      await page.locator('#telemetry').scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const el = document.querySelector('#telemetry');
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 68;
          window.scrollTo({ top, behavior: 'instant' });
        }
      });
      await page.waitForTimeout(900);
      await saveScreen(page, 'calendar');

      await page.goto(`${baseUrl}/?skipPreloader=1&view=map`, { waitUntil: 'load' });
      await page.getByTestId('knowledge-map-box').waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(2200);
      await saveScreen(page, 'map');

      await page.goto(`${baseUrl}/?skipPreloader=1&view=game`, { waitUntil: 'load' });
      await page.getByTestId('mission-game-box').waitFor({ state: 'visible', timeout: 8000 });
      await page.waitForTimeout(1600);
      await saveScreen(page, 'game');

      await page.goto(`${baseUrl}/?skipPreloader=1&view=game&stage=cradleflow`, {
        waitUntil: 'load',
      });
      await page.getByTestId('cradleflow-embed-frame').waitFor({ state: 'visible', timeout: 10000 });
      const cradleFrame = page.frameLocator('[data-testid="cradleflow-embed-frame"]');
      await cradleFrame
        .getByTestId('dopaimint-handoff-banner')
        .waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1800);
      await saveScreen(page, 'cradleflow');
      await context.close();

      // Studio context enforces prefers-reduced-motion: reduce so mdxcn motion rows stay at opacity 1
      const studioContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      const studioPage = await studioContext.newPage();

      // 2. Render 5 official PNG figures via React + mdxcn + ascii.rest
      const plateNames = [
        '01-architecture-pipeline.png',
        '02-overview-burning-calendar.png',
        '03-orbital-provenance-map.png',
        '04-earth-grid-triage-phase1.png',
        '05-cradleflow-habitat-phase2.png',
      ];
      const pngPaths = [];
      for (let idx = 1; idx <= 5; idx++) {
        await studioPage.goto(`${baseUrl}/?present=plate&plate=${idx}`, { waitUntil: 'load' });
        await waitForStudioReady(studioPage);
        await studioPage.waitForTimeout(150);
        await verifyAsciiCanvasNonEmpty(studioPage);

        const layoutCheck = await studioPage.evaluate(() => {
          const figures = Array.from(document.querySelectorAll('figure[data-frame]'));
          const maxRight = Math.max(...figures.map((f) => f.getBoundingClientRect().right), 0);
          const maxBottom = Math.max(...figures.map((f) => f.getBoundingClientRect().bottom), 0);
          return {
            scrollW: document.documentElement.scrollWidth,
            scrollH: document.documentElement.scrollHeight,
            maxRight: Math.round(maxRight),
            maxBottom: Math.round(maxBottom),
          };
        });
        if (
          layoutCheck.scrollW > 1920 ||
          layoutCheck.scrollH > 1080 ||
          layoutCheck.maxRight > 1920 ||
          layoutCheck.maxBottom > 1080
        ) {
          throw new Error(`Plate ${idx} overflow detected: ${JSON.stringify(layoutCheck)}`);
        }

        const outPath = path.join(IMG_DIR, plateNames[idx - 1]);
        await studioPage.screenshot({ path: outPath });
        const size = fs.statSync(outPath).size;
        if (size <= 0 || size >= 10 * 1024 * 1024) {
          throw new Error(`PNG size out of bounds for ${outPath}: ${size} bytes`);
        }
        pngPaths.push(outPath);
      }

      // 3. Export Exact 7-Slide PDF Deck (?present=deck)
      await studioPage.goto(`${baseUrl}/?present=deck`, { waitUntil: 'load' });
      await waitForStudioReady(studioPage);
      await studioPage.waitForTimeout(200);
      await verifyAsciiCanvasNonEmpty(studioPage);

      const slideChecks = await studioPage.evaluate(() => {
        const slides = Array.from(document.querySelectorAll('.deck-slide'));
        const details = slides.map((slide, idx) => {
          const rect = slide.getBoundingClientRect();
          const figs = Array.from(slide.querySelectorAll('figure[data-frame]'));
          const overflowFigs = figs.filter((f) => {
            const r = f.getBoundingClientRect();
            return r.right > rect.right + 1 || r.bottom > rect.bottom + 1;
          }).length;
          return {
            slide: idx + 1,
            scrollW: slide.scrollWidth,
            scrollH: slide.scrollHeight,
            overflowFigs,
          };
        });
        return {
          count: slides.length,
          overflowSlides: details.filter(
            (d) => d.scrollW > 1920 || d.scrollH > 1080 || d.overflowFigs > 0,
          ).length,
          details,
        };
      });
      if (slideChecks.count !== 7 || slideChecks.overflowSlides > 0) {
        throw new Error(`Slide deck layout validation failed: ${JSON.stringify(slideChecks)}`);
      }

      const slideLocators = studioPage.locator('.deck-slide');
      for (let i = 0; i < 7; i++) {
        await slideLocators.nth(i).screenshot({ path: path.join(FRAMES_DIR, `slide-${i + 1}.png`) });
      }

      const pdfPath = path.join(OUT_DIR, 'dopaimint-deck-7slides.pdf');
      await studioPage.pdf({
        path: pdfPath,
        width: '1920px',
        height: '1080px',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        preferCSSPageSize: true,
      });

      let pdfRaw = fs.readFileSync(pdfPath, 'latin1');
      let pageCount = (pdfRaw.match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
      if (pageCount !== 7) {
        await studioPage.addStyleTag({ content: '.deck-slide { height: 1079px !important; }' });
        await studioPage.pdf({
          path: pdfPath,
          width: '1920px',
          height: '1080px',
          printBackground: true,
          margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
          preferCSSPageSize: true,
        });
        pdfRaw = fs.readFileSync(pdfPath, 'latin1');
        pageCount = (pdfRaw.match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
      }
      if (pageCount !== 7) {
        throw new Error(`Expected exact 7 PDF pages, got ${pageCount}`);
      }

      // 4. Render Audio + Deterministic 855 Video Frames (?present=video)
      const audioPath = path.join(FRAMES_DIR, 'audio.wav');
      generateWavAudio(audioPath);

      await studioPage.goto(`${baseUrl}/?present=video`, { waitUntil: 'load' });
      await waitForStudioReady(studioPage);
      await verifyAsciiCanvasNonEmpty(studioPage);

      const beatBoundaryFrames = new Set([0, 135, 330, 510, 606, 705]);
      for (let f = 0; f < TOTAL_FRAMES; f++) {
        await studioPage.evaluate(async (idx) => {
          window.__setVideoFrame?.(idx);
          const imgs = Array.from(document.querySelectorAll('img'));
          await Promise.all(
            imgs.map((img) =>
              img.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                  }),
            ),
          );
        }, f);

        if (beatBoundaryFrames.has(f)) {
          await studioPage.waitForTimeout(80);
          const vCheck = await studioPage.evaluate(() => {
            const figs = Array.from(document.querySelectorAll('figure[data-frame]'));
            return {
              scrollW: document.documentElement.scrollWidth,
              scrollH: document.documentElement.scrollHeight,
              maxBottom: Math.max(...figs.map((el) => el.getBoundingClientRect().bottom), 0),
            };
          });
          if (vCheck.scrollW > 1920 || vCheck.scrollH > 1080 || vCheck.maxBottom > 1080) {
            throw new Error(`Video beat overflow at frame ${f}: ${JSON.stringify(vCheck)}`);
          }
        }

        const frameFile = path.join(FRAMES_DIR, `frame-${String(f).padStart(4, '0')}.jpg`);
        await studioPage.screenshot({ path: frameFile, type: 'jpeg', quality: 94 });
      }

      const mp4Path = path.join(OUT_DIR, 'dopaimint-demo-28s.mp4');
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-framerate',
          String(FPS),
          '-i',
          path.join(FRAMES_DIR, 'frame-%04d.jpg'),
          '-i',
          audioPath,
          '-c:v',
          'libx264',
          '-preset',
          'medium',
          '-crf',
          '22',
          '-pix_fmt',
          'yuv420p',
          '-r',
          String(FPS),
          '-af',
          'loudnorm=I=-16:TP=-1.5:LRA=11',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-movflags',
          '+faststart',
          '-t',
          DURATION_SEC.toFixed(2),
          mp4Path,
        ],
        { stdio: 'pipe' },
      );

      const probeJson = execFileSync(
        'ffprobe',
        ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', mp4Path],
        { encoding: 'utf8' },
      );
      const probe = JSON.parse(probeJson);
      const duration = Number(probe.format?.duration || 0);
      if (duration < 28.0 || duration > 29.0) {
        throw new Error(`Video duration out of safe window (must be <= 29.0s): ${duration}s`);
      }

      const blackRun = spawnSync(
        'ffmpeg',
        ['-i', mp4Path, '-vf', 'blackdetect=d=0.5:pix_th=0.05', '-f', 'null', '-'],
        { encoding: 'utf8' },
      );
      if (blackRun.status !== 0) {
        throw new Error(`ffmpeg blackdetect failed: ${blackRun.stderr}`);
      }
      const blackDetectOut = `${blackRun.stdout || ''}\n${blackRun.stderr || ''}`;

      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          mp4Path,
          '-vf',
          'fps=12/28.5,scale=480:270,tile=4x3',
          '-frames:v',
          '1',
          MOTION_SHEET_PATH,
        ],
        { stdio: 'pipe' },
      );

      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          path.join(FRAMES_DIR, 'slide-1.png'),
          '-i',
          path.join(FRAMES_DIR, 'slide-2.png'),
          '-i',
          path.join(FRAMES_DIR, 'slide-3.png'),
          '-i',
          path.join(FRAMES_DIR, 'slide-4.png'),
          '-i',
          path.join(FRAMES_DIR, 'slide-5.png'),
          '-i',
          path.join(FRAMES_DIR, 'slide-6.png'),
          '-i',
          path.join(FRAMES_DIR, 'slide-7.png'),
          '-f',
          'lavfi',
          '-t',
          '0.1',
          '-i',
          'color=c=#090c14:s=480x270',
          '-filter_complex',
          '[0:v]scale=480:270[s0];[1:v]scale=480:270[s1];[2:v]scale=480:270[s2];[3:v]scale=480:270[s3];[4:v]scale=480:270[s4];[5:v]scale=480:270[s5];[6:v]scale=480:270[s6];[s0][s1][s2][s3]hstack=inputs=4[top];[s4][s5][s6][7:v]hstack=inputs=4[bot];[top][bot]vstack=inputs=2[out]',
          '-map',
          '[out]',
          '-frames:v',
          '1',
          DECK_SHEET_PATH,
        ],
        { stdio: 'pipe' },
      );

      const stats = {
        status: 'PASS',
        videoDurationSec: Number(duration.toFixed(2)),
        videoBytes: fs.statSync(mp4Path).size,
        pdfPages: pageCount,
        pdfBytes: fs.statSync(pdfPath).size,
        blackSegmentsDetected: /black_start/.test(blackDetectOut),
        motionContactSheet: MOTION_SHEET_PATH,
        deckContactSheet: DECK_SHEET_PATH,
        images: pngPaths.map((p) => ({
          file: path.basename(p),
          bytes: fs.statSync(p).size,
          mb: Number((fs.statSync(p).size / (1024 * 1024)).toFixed(2)),
        })),
      };
      console.log(JSON.stringify(stats, null, 2));
    } finally {
      await browser.close();
      fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
      fs.rmSync(DIST_RAW_DIR, { recursive: true, force: true });
    }
  } finally {
    server.kill('SIGTERM');
  }

  // Final clean production build syncing regenerated public/submission/* without raw capture clutter
  execFileSync('bun', ['run', 'build'], { cwd: PROJECT_ROOT, stdio: 'inherit' });
}

run().catch((err) => {
  console.error('BUILD SUBMISSION MEDIA FAILED:', err);
  process.exit(1);
});
