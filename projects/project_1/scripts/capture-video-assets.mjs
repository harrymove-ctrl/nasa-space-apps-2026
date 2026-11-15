import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCREENS_DIR = path.join(PROJECT_ROOT, 'public', 'video-assets', 'screens');
const REELS_DIR = path.join(PROJECT_ROOT, 'public', 'video-assets', 'reels');
const TMP_DIR = path.join(PROJECT_ROOT, '.cache-video-capture');

fs.mkdirSync(SCREENS_DIR, { recursive: true });
fs.mkdirSync(REELS_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

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
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

/**
 * Save screenshot via PNG -> ffmpeg baseline JPEG so HTMLImageElement.decode() never stalls.
 */
async function saveBaselineJpg(page, outPath, clip) {
  const tmpPng = path.join(TMP_DIR, `${path.basename(outPath, '.jpg')}-${Date.now()}.png`);
  await page.screenshot({ path: tmpPng, type: 'png', ...(clip ? { clip } : {}) });
  execFileSync(
    'ffmpeg',
    ['-y', '-i', tmpPng, '-frames:v', '1', '-q:v', '2', '-pix_fmt', 'yuvj420p', outPath],
    { stdio: 'pipe' },
  );
  fs.rmSync(tmpPng, { force: true });
}

/**
 * Encode a sequence of 864x1536 Retina frames captured at 12fps into an exact 8.00s (240 frames)
 * 30fps 432x768 H.264 MP4 matching <ReelWall>'s 12fps onTwos cadence with zero edge clipping.
 */
function encodeMobileReelFromFrames(framesDir, outMp4Path) {
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      '12',
      '-i',
      path.join(framesDir, 'frame_%04d.png'),
      '-vf',
      'scale=432:768:flags=lanczos,fps=30,format=yuv420p',
      '-t',
      '8.0',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '18',
      '-movflags',
      '+faststart',
      '-an',
      outMp4Path,
    ],
    { stdio: 'pipe' },
  );
}

async function smoothScrollTo(page, fromY, toY, steps, recordFrame) {
  for (let s = 1; s <= steps; s++) {
    const t = 0.5 - 0.5 * Math.cos((Math.PI * s) / steps);
    const y = Math.round(fromY + (toY - fromY) * t);
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'instant' }), y);
    await page.waitForTimeout(16);
    await recordFrame();
  }
}

async function run() {
  const onlyArg = process.argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length) ?? null;
  if (!onlyArg) {
    execFileSync('bun', ['run', 'build'], { cwd: PROJECT_ROOT, stdio: 'inherit' });
  }

  const { chromium } = loadPlaywright();
  const port = 4193;
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
      // =========================================================================
      // 1. Desktop 1920x1080 Live Step-by-Step UI Captures
      // =========================================================================
      if (!onlyArg || onlyArg === 'desktop') {
        const desktop = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      });
      const page = await desktop.newPage();

      // Step 1: Observatory Hero (Dark)
      await page.goto(`${baseUrl}/?skipPreloader=1&theme=dark`, { waitUntil: 'load' });
      await page.waitForTimeout(2200);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'step-1-observatory.jpg'));
      fs.copyFileSync(
        path.join(SCREENS_DIR, 'step-1-observatory.jpg'),
        path.join(SCREENS_DIR, 'overview-hero.jpg'),
      );

      // Step 2: Real-Time Telemetry + 26-Year Burning Calendar
      await page.evaluate(() => {
        const el = document.querySelector('#telemetry');
        if (el) {
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'instant' });
        }
      });
      await page.waitForTimeout(1000);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'step-2-calendar.jpg'));
      fs.copyFileSync(
        path.join(SCREENS_DIR, 'step-2-calendar.jpg'),
        path.join(SCREENS_DIR, 'telemetry.jpg'),
      );

      // Step 3: Ask the Grid Copilot + 5-Layer Orbital Provenance Map
      await page.goto(`${baseUrl}/?skipPreloader=1&view=map&theme=dark`, { waitUntil: 'load' });
      await page.getByTestId('knowledge-map-box').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2200);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'step-3-map.jpg'));
      fs.copyFileSync(
        path.join(SCREENS_DIR, 'step-3-map.jpg'),
        path.join(SCREENS_DIR, 'knowledge-map.jpg'),
      );

      // Step 4: Phase 01 Earth Grid Triage 3-Wave Drill
      await page.goto(`${baseUrl}/?skipPreloader=1&view=game&theme=dark`, { waitUntil: 'load' });
      await page.getByTestId('mission-game-box').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1800);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'step-4-triage.jpg'));
      fs.copyFileSync(
        path.join(SCREENS_DIR, 'step-4-triage.jpg'),
        path.join(SCREENS_DIR, 'triage-game.jpg'),
      );

      // Step 5: Phase 02 CradleFlow Habitat Automation (Unified Handoff)
      await page.goto(`${baseUrl}/?skipPreloader=1&view=game&stage=cradleflow&theme=dark`, {
        waitUntil: 'load',
      });
      await page.getByTestId('cradleflow-embed-frame').waitFor({ state: 'visible', timeout: 10000 });
      const cradleEmbed = page.frameLocator('[data-testid="cradleflow-embed-frame"]');
      await cradleEmbed.getByTestId('dopaimint-handoff-banner').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(2000);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'step-5-cradleflow.jpg'));
      fs.copyFileSync(
        path.join(SCREENS_DIR, 'step-5-cradleflow.jpg'),
        path.join(SCREENS_DIR, 'cradleflow-unified.jpg'),
      );

      // Standalone CradleFlow Canvas at 1920x1080
      await page.goto(
        `${baseUrl}/cradleflow/?embed=dopaimint&corridor=butte-230kv&protonFluxPfu=185&kpIndex=6.3&xrayClass=M4.2`,
        { waitUntil: 'load' },
      );
      await page.getByTestId('dopaimint-handoff-banner').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1800);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'cradleflow-live.jpg'));

      // Step 6: Light-Mode Archival Paper Observatory
      await page.goto(`${baseUrl}/?skipPreloader=1&theme=light`, { waitUntil: 'load' });
      await page.waitForTimeout(1800);
      await saveBaselineJpg(page, path.join(SCREENS_DIR, 'step-6-light-paper.jpg'));

      await desktop.close();
      }

      // =========================================================================
      // 2. Genuine Responsive Vertical Mobile Reels (432x768 @ 2x DPR -> 8.0s 30fps MP4)
      // =========================================================================
      const mobile = await browser.newContext({
        viewport: { width: 432, height: 768 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const mPage = await mobile.newPage();

      async function captureMobileReel({ name, reel, url, poster, choreography }) {
        if (onlyArg && onlyArg !== 'reels' && onlyArg !== reel && onlyArg !== name) {
          return;
        }
        const frameDir = path.join(TMP_DIR, name);
        fs.rmSync(frameDir, { recursive: true, force: true });
        fs.mkdirSync(frameDir, { recursive: true });

        await mPage.goto(url, { waitUntil: 'load' });
        await mPage.waitForTimeout(2000);

        const maxScrollY = await mPage.evaluate(() =>
          Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
        );
        const overflowPx = await mPage.evaluate(() =>
          Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        );
        if (overflowPx > 0) {
          throw new Error(`Mobile capture ${name} has ${overflowPx}px horizontal overflow!`);
        }

        let frameIdx = 0;
        const recordFrame = async () => {
          if (frameIdx >= 96) return;
          const file = path.join(frameDir, `frame_${String(frameIdx).padStart(4, '0')}.png`);
          await mPage.screenshot({ path: file, type: 'png' });
          frameIdx++;
        };

        await choreography({
          page: mPage,
          maxScrollY,
          recordFrame,
          holdFrames: async (count) => {
            for (let i = 0; i < count && frameIdx < 96; i++) {
              await mPage.waitForTimeout(35);
              await recordFrame();
            }
          },
          savePoster: async () => {
            if (poster) {
              await saveBaselineJpg(mPage, path.join(SCREENS_DIR, `${poster}.jpg`));
            }
          },
        });

        while (frameIdx < 96) {
          await mPage.waitForTimeout(30);
          await recordFrame();
        }

        encodeMobileReelFromFrames(frameDir, path.join(REELS_DIR, reel));
        fs.rmSync(frameDir, { recursive: true, force: true });
      }

      // Reel 1: Overview Hero (/?skipPreloader=1)
      await captureMobileReel({
        name: 'reel-1-overview',
        reel: 'reel-1.mp4',
        poster: 'portrait-observatory',
        url: `${baseUrl}/?skipPreloader=1&theme=dark`,
        choreography: async ({ page: p, maxScrollY, recordFrame, holdFrames, savePoster }) => {
          await savePoster();
          await holdFrames(18);
          const targetY = Math.min(maxScrollY, 360);
          await smoothScrollTo(p, 0, targetY, 24, recordFrame);
          await holdFrames(30);
          await smoothScrollTo(p, targetY, 0, 22, recordFrame);
        },
      });

      // Reel 2: Burning Calendar & Telemetry (/?skipPreloader=1#telemetry)
      await captureMobileReel({
        name: 'reel-2-telemetry',
        reel: 'reel-2.mp4',
        poster: 'portrait-telemetry',
        url: `${baseUrl}/?skipPreloader=1&theme=dark`,
        choreography: async ({ page: p, maxScrollY, recordFrame, holdFrames, savePoster }) => {
          const baseY = await p.evaluate(() => {
            const el = document.querySelector('#telemetry');
            return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 68)) : 0;
          });
          await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), baseY);
          await p.waitForTimeout(700);
          await savePoster();
          await holdFrames(18);

          const mauiBtn = p.getByRole('button', { name: /Maui West/i }).first();
          if (await mauiBtn.isVisible().catch(() => false)) {
            await mauiBtn.click().catch(() => {});
            await p.waitForTimeout(250);
          }
          await holdFrames(12);

          const calY = Math.min(maxScrollY, baseY + 420);
          await smoothScrollTo(p, baseY, calY, 24, recordFrame);
          await holdFrames(24);
          await smoothScrollTo(p, calY, baseY, 18, recordFrame);
        },
      });

      // Reel 3: 5-Layer Knowledge Map (/?skipPreloader=1&view=map)
      await captureMobileReel({
        name: 'reel-3-map',
        reel: 'reel-3.mp4',
        poster: 'portrait-map',
        url: `${baseUrl}/?skipPreloader=1&view=map&theme=dark`,
        choreography: async ({ page: p, maxScrollY, recordFrame, holdFrames, savePoster }) => {
          await p.getByTestId('knowledge-map-box').waitFor({ state: 'visible', timeout: 10000 });
          await p.waitForTimeout(500);
          await savePoster();
          await holdFrames(16);

          const mauiBtn = p.getByRole('button', { name: /Maui West/i }).first();
          if (await mauiBtn.isVisible().catch(() => false)) {
            await mauiBtn.click().catch(() => {});
            await p.waitForTimeout(250);
          }
          await holdFrames(10);

          const mapY = Math.min(maxScrollY, 440);
          await smoothScrollTo(p, 0, mapY, 24, recordFrame);
          await holdFrames(28);
          await smoothScrollTo(p, mapY, 0, 18, recordFrame);
        },
      });

      // Reel 4: Phase 01 Triage Drill (/?skipPreloader=1&view=game)
      await captureMobileReel({
        name: 'reel-4-triage',
        reel: 'reel-4.mp4',
        poster: 'portrait-triage',
        url: `${baseUrl}/?skipPreloader=1&view=game&theme=dark`,
        choreography: async ({ page: p, maxScrollY, recordFrame, holdFrames, savePoster }) => {
          await p.getByTestId('mission-game-box').waitFor({ state: 'visible', timeout: 10000 });
          await p.waitForTimeout(500);
          await savePoster();
          await holdFrames(16);

          const corrBtn = p.getByRole('button', { name: /Okanogan/i }).first();
          if (await corrBtn.isVisible().catch(() => false)) {
            await corrBtn.click().catch(() => {});
            await p.waitForTimeout(250);
          }
          await holdFrames(10);

          const drillY = Math.min(maxScrollY, 460);
          await smoothScrollTo(p, 0, drillY, 24, recordFrame);
          await holdFrames(28);
          await smoothScrollTo(p, drillY, 0, 18, recordFrame);
        },
      });

      // Reel 5: Phase 02 CradleFlow Habitat HUD (/?skipPreloader=1&view=game&stage=cradleflow)
      await captureMobileReel({
        name: 'reel-5-cradleflow',
        reel: 'reel-5.mp4',
        poster: 'portrait-cradleflow',
        url: `${baseUrl}/?skipPreloader=1&view=game&stage=cradleflow&theme=dark`,
        choreography: async ({ page: p, maxScrollY, recordFrame, holdFrames, savePoster }) => {
          await p.getByTestId('cradleflow-embed-frame').waitFor({ state: 'visible', timeout: 10000 });
          const cradle = p.frameLocator('[data-testid="cradleflow-embed-frame"]');
          await cradle.getByTestId('dopaimint-handoff-banner').waitFor({ state: 'visible', timeout: 10000 });
          await p.waitForTimeout(600);
          await savePoster();
          await holdFrames(16);

          const hudY = Math.min(maxScrollY, 260);
          await smoothScrollTo(p, 0, hudY, 20, recordFrame);
          const runBtn = cradle.getByRole('button', { name: /RUN/i }).first();
          if (await runBtn.isVisible().catch(() => false)) {
            await runBtn.click().catch(() => {});
          }
          await holdFrames(36);
          await smoothScrollTo(p, hudY, 0, 20, recordFrame);
        },
      });

      // Reel 6: /submission/ Interactive Slides & Pipeline
      await captureMobileReel({
        name: 'reel-6-submission',
        reel: 'reel-6.mp4',
        poster: 'portrait-light',
        url: `${baseUrl}/submission/`,
        choreography: async ({ page: p, maxScrollY, recordFrame, holdFrames, savePoster }) => {
          await p.getByTestId('interactive-slide-stage').waitFor({ state: 'visible', timeout: 10000 });
          const slidesTop = await p.evaluate(() => {
            const el = document.querySelector('#slides');
            return el ? Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 12)) : 0;
          });
          await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), slidesTop);
          await p.waitForTimeout(450);
          await savePoster();
          await holdFrames(16);

          await p.getByTestId('deck-slide-btn-2').click().catch(() => {});
          await p.waitForFunction(() => {
            const imgs = Array.from(document.querySelectorAll('[data-testid="interactive-slide-stage"] img'));
            return imgs.every((img) => img.complete && img.naturalWidth > 0);
          });
          await p.waitForTimeout(250);
          await holdFrames(14);

          await p.getByTestId('deck-slide-btn-3').click().catch(() => {});
          await p.waitForFunction(() => {
            const imgs = Array.from(document.querySelectorAll('[data-testid="interactive-slide-stage"] img'));
            return imgs.every((img) => img.complete && img.naturalWidth > 0);
          });
          await p.waitForTimeout(250);
          await holdFrames(12);

          const pipelineY = await p.evaluate(() => {
            const headings = Array.from(document.querySelectorAll('figcaption')).find((el) =>
              el.textContent?.replace(/\s+/g, ' ').includes('PIPELINE'),
            );
            return headings
              ? Math.max(0, Math.round(headings.getBoundingClientRect().top + window.scrollY - 24))
              : 0;
          });
          const targetY = Math.min(maxScrollY, pipelineY > 0 ? pipelineY : slidesTop + 620);
          await smoothScrollTo(p, slidesTop, targetY, 22, recordFrame);
          await holdFrames(18);
          await smoothScrollTo(p, targetY, slidesTop, 14, recordFrame);
        },
      });

      await mobile.close();
      console.log('Captured all desktop 1920x1080 and true responsive mobile 432x768 (8.0s 30fps) video assets cleanly.');
    } finally {
      await browser.close();
    }
  } finally {
    server.kill('SIGTERM');
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

run().catch((err) => {
  console.error('CAPTURE VIDEO ASSETS FAILED:', err);
  process.exit(1);
});
