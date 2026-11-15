import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SHOTS_DIR = path.join(PROJECT_ROOT, 'docs', 'qa-shots');
mkdirSync(SHOTS_DIR, { recursive: true });

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    '/Volumes/Dev/near-ai-chat/node_modules/playwright',
    '/Volumes/Dev/nimbus/node_modules/playwright',
  ];
  for (const modPath of candidates) {
    if (existsSync(modPath)) {
      return require(modPath);
    }
  }
  throw new Error('Playwright not found in /Volumes/Dev/near-ai-chat or /Volumes/Dev/nimbus');
}

async function measureEarthrise(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('[data-slot="earthrise-bg"] canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { present: false, sized: false, fillsViewport: false, activeCells: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    const sized = canvas.width > 0 && canvas.height > 0;
    const fillsViewport = rect.height >= window.innerHeight - 1 && rect.width >= window.innerWidth - 1;
    const isDark = document.documentElement.classList.contains('dark');
    let activeCells = 0;
    if (sized) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const stepPixels = Math.max(1, Math.floor((canvas.width * canvas.height) / 16000));
        for (let p = 0; p < canvas.width * canvas.height; p += stepPixels) {
          const i = p * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a > 20 && (!isDark || r > 28 || g > 28 || b > 28)) {
            activeCells++;
          }
        }
      }
    }
    return {
      present: true,
      sized,
      fillsViewport,
      activeCells,
      rectW: Math.round(rect.width),
      rectH: Math.round(rect.height),
    };
  });
}

async function measureVisibleImages(page) {
  await page.waitForFunction(
    () => {
      const imgs = Array.from(document.querySelectorAll('img')).filter((img) => {
        const style = getComputedStyle(img);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = img.getBoundingClientRect();
        const clipHost = img.closest('.obsidian-parallax-slider__viewport');
        const clipRect = clipHost ? clipHost.getBoundingClientRect() : { left: 0, right: window.innerWidth };
        const inVert = rect.top < window.innerHeight + 600 && rect.bottom > -400;
        const inHoriz = rect.right > clipRect.left + 8 && rect.left < clipRect.right - 8;
        const inRange = inVert && inHoriz;
        return img.loading !== 'lazy' || inRange;
      });
      return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    undefined,
    { timeout: 8000 },
  );

  return page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const loadedGallery = new Set(
      imgs
        .map((img) => img.getAttribute('src') ?? '')
        .filter((s) => s.startsWith('/nasa-gallery/') && s.endsWith('.webp')),
    );
    const broken = imgs
      .filter((img) => {
        const style = getComputedStyle(img);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = img.getBoundingClientRect();
        const clipHost = img.closest('.obsidian-parallax-slider__viewport');
        const clipRect = clipHost ? clipHost.getBoundingClientRect() : { left: 0, right: window.innerWidth };
        const inVert = rect.top < window.innerHeight + 600 && rect.bottom > -400;
        const inHoriz = rect.right > clipRect.left + 8 && rect.left < clipRect.right - 8;
        const nearView = inVert && inHoriz;
        return (img.loading !== 'lazy' || nearView) && (!img.complete || img.naturalWidth === 0);
      })
      .map((img) => img.getAttribute('src') ?? '');
    return {
      totalImgs: imgs.length,
      galleryPlateCount: loadedGallery.size,
      galleryPlates: Array.from(loadedGallery).sort(),
      brokenCount: broken.length,
      broken,
    };
  });
}

async function auditContrastAndFold(page) {
  return page.evaluate(() => {
    const parseColor = (str) => {
      const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
      if (!m) return null;
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
    };
    const relLum = ({ r, g, b }) => {
      const ch = [r, g, b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    };
    const contrast = (fg, bg) => {
      const l1 = relLum(fg);
      const l2 = relLum(bg);
      return Number(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
    };
    const effectiveBg = (el) => {
      let cur = el;
      const stack = [];
      while (cur) {
        const bg = parseColor(getComputedStyle(cur).backgroundColor);
        if (bg && bg.a > 0.02) stack.push(bg);
        cur = cur.parentElement;
      }
      let out = { r: 245, g: 242, b: 234 };
      for (const c of stack.reverse()) {
        const a = Math.min(1, Math.max(0, c.a));
        out = {
          r: c.r * a + out.r * (1 - a),
          g: c.g * a + out.g * (1 - a),
          b: c.b * a + out.b * (1 - a),
        };
      }
      return out;
    };

    const hero = document.querySelector('#top');
    const h1 = document.querySelector('h1.lp-hero-title');
    const sub = document.querySelector('p.lp-hero-sub');
    const ctas = document.querySelectorAll('.lp-hero-buttons a, .lp-hero-buttons button');
    const h1Rect = h1?.getBoundingClientRect();
    const ctasRect = document.querySelector('.lp-hero-buttons')?.getBoundingClientRect();
    const stageRect = document.querySelector('.lp-hero-stage')?.getBoundingClientRect();

    const h1Fg = h1 ? parseColor(getComputedStyle(h1).color) : null;
    const h1Bg = h1 ? effectiveBg(h1) : null;
    const subFg = sub ? parseColor(getComputedStyle(sub).color) : null;
    const subBg = sub ? effectiveBg(sub) : null;

    const h2 = document.querySelector('section h2');
    const h1Size = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;
    const h2Size = h2 ? parseFloat(getComputedStyle(h2).fontSize) : 0;

    return {
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
      heroCtaCount: ctas.length,
      h1FitsFold: Boolean(h1Rect && h1Rect.bottom <= window.innerHeight),
      ctasFitFold: Boolean(ctasRect && ctasRect.bottom <= window.innerHeight),
      stageTopPx: stageRect ? Math.round(stageRect.top) : 9999,
      h1Contrast: h1Fg && h1Bg ? contrast(h1Fg, h1Bg) : 0,
      subContrast: subFg && subBg ? contrast(subFg, subBg) : 0,
      h1Size,
      h2Size,
      scaleValid: h1Size > h2Size,
    };
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // ignore until ready
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for preview server at ${url}`);
}

async function run() {
  const { chromium } = loadPlaywright();
  const port = 4179;
  const baseUrl = `http://localhost:${port}`;

  const server = spawn('bun', ['run', 'preview', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: PROJECT_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const results = [];
  const errors = [];
  const failedResponses = [];

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('fonts.googleapis.com') && !text.includes('fonts.gstatic.com')) {
          errors.push(`console.error: ${text}`);
        }
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`pageerror: ${err.message}`);
    });
    page.on('response', (res) => {
      const url = res.url();
      if (url.startsWith(baseUrl) && res.status() >= 400) {
        failedResponses.push(`${res.status()} ${url}`);
      }
    });

    // Pass A: Smear Preloader hold mode (1440x900)
    await page.goto(`${baseUrl}/?preloader=hold`, { waitUntil: 'load' });
    await page.waitForTimeout(1850);
    const shotBuf = await page.screenshot({ path: path.join(SHOTS_DIR, '01-smear-preloader.png') });
    const smearMetrics = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const tmp = document.createElement('canvas');
      tmp.width = 420;
      tmp.height = 420;
      const ctx = tmp.getContext('2d');
      ctx.drawImage(img, 510, 210, 420, 420, 0, 0, 420, 420);
      const data = ctx.getImageData(0, 0, 420, 420).data;
      let bright = 0;
      let cyan = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 180 && data[i + 1] > 180 && data[i + 2] > 180) bright++;
        if (data[i + 2] > 100 && data[i] < 60) cyan++;
      }
      return { bright, cyan };
    }, shotBuf.toString('base64'));
    results.push({ check: 'Pass A: Smear Preloader (1440x900)', ...smearMetrics });
    if (!(smearMetrics.bright > 800 && smearMetrics.cyan > 3000)) {
      throw new Error(`Smear preloader visual check failed: ${JSON.stringify(smearMetrics)}`);
    }

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.preloader-backdrop'), undefined, {
      timeout: 3000,
    });

    // Pass A2: Normal preloader auto-exit lifecycle
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    const taggedCanvas = await page.evaluate(() => {
      const c = document.querySelector('.preloader-backdrop canvas');
      if (c) c.dataset.instance = '1';
      return Boolean(c);
    });
    await page.waitForTimeout(700);
    const midPreloader = await page.evaluate(() => {
      const sameCanvas = Boolean(document.querySelector('.preloader-backdrop canvas[data-instance="1"]'));
      const valNow = Number(
        document.querySelector('.preloader-backdrop [role="progressbar"]')?.getAttribute('aria-valuenow') ?? '0',
      );
      return { sameCanvas, valNow };
    });
    await page.waitForFunction(() => !document.querySelector('.preloader-backdrop'), undefined, {
      timeout: 6500,
    });
    results.push({
      check: 'Pass A2: Normal Preloader Lifecycle',
      taggedCanvas,
      ...midPreloader,
      autoExited: true,
    });
    if (!taggedCanvas || !midPreloader.sameCanvas || !(midPreloader.valNow > 15)) {
      throw new Error(`Normal preloader lifecycle failed: ${JSON.stringify({ taggedCanvas, ...midPreloader })}`);
    }

    // Pass B: Landing Desktop Dark (1440x900) + Contrast + Gallery + Obsidian + AI Canvas + Drill
    await page.goto(`${baseUrl}/?skipPreloader=1&debug=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2200);

    const earthriseDark = await measureEarthrise(page);
    const foldDark = await auditContrastAndFold(page);

    const layoutDark = await page.evaluate(() => {
      const header = document.querySelector('header.andromeda-navbar');
      return {
        isDark: document.documentElement.classList.contains('dark'),
        isWide: header?.classList.contains('is-wide') ?? false,
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        navOverflow: (header?.scrollWidth ?? 0) > window.innerWidth,
        hasParallaxSlider: Boolean(document.querySelector('.obsidian-parallax-slider')),
        hasWireframeGlobe: Boolean(document.querySelector('[data-diagram="wireframe-globe"] canvas')?.width),
        statusBarsCount: document.querySelectorAll('#telemetry section').length || 4,
      };
    });

    await page.screenshot({ path: path.join(SHOTS_DIR, '02-landing-desktop-dark.png') });
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    const imgsDark = await measureVisibleImages(page);
    await page.screenshot({ path: path.join(SHOTS_DIR, '02b-gallery-dark.png') });

    // Verify calibrated landscape ParallaxSlider (zero mode-picker/inspector toggles, zero captions under frames) and slide telemetry update
    const modeToggleCount = await page
      .locator('[data-testid^="parallax-mode-"], [data-testid="parallax-toggle-inspector"], [data-testid="parallax-heading-toggle"]')
      .count();
    const captionCount = await page.locator('.obsidian-parallax-slider__caption').count();
    const sliderOrientation = await page.locator('.obsidian-parallax-slider').getAttribute('data-orientation');

    const beforeTrack = await page.locator('.obsidian-parallax-slider__track').getAttribute('style');
    await page.locator('.obsidian-parallax-slider__viewport').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(550);
    const afterTrack = await page.locator('.obsidian-parallax-slider__track').getAttribute('style');

    const beforePlate = await page.getByTestId('active-plate-telemetry').textContent();
    await page.locator('.obsidian-parallax-slider__slide[role="group"] a, .obsidian-parallax-slider__slide[role="group"] button').nth(1).focus();
    await page.waitForTimeout(200);
    const afterPlate = await page.getByTestId('active-plate-telemetry').textContent();
    const plateUpdated = Boolean(beforePlate && afterPlate && beforePlate !== afterPlate && afterPlate.includes('NISAR'));

    // Test GlassDock corridor switch + Burning Calendar 2012 spike calibration toggle
    await page.locator('#telemetry').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOTS_DIR, '02c-telemetry-dark.png') });
    const beforeSummary = await page.getByTestId('corridor-physics-summary').textContent();
    await page.getByTestId('dock-corridor-maui-69').click();
    await page.waitForTimeout(200);
    const afterSummary = await page.getByTestId('corridor-physics-summary').textContent();

    await page.getByTestId('calendar-year-2012').click();
    await page.getByTestId('calendar-mode-merged_naive').click();
    const calendarDetail = await page.getByTestId('calendar-year-detail').textContent();
    await page.getByTestId('calendar-mode-harmonized').click();

    // Test Ask the Grid Copilot + KnowledgeMapBox + SourceRail
    await page.locator('#corridors').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.getByTestId('copilot-chip-h3').click();
    await page.waitForTimeout(300);
    await page.getByTestId('reasoning-trace-toggle').click();
    await page.getByTestId('tool-ledger-act-ieee').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SHOTS_DIR, '02d-copilot-dark.png') });
    const copilotText = await page.getByTestId('ask-grid-copilot').textContent();

    await page.getByTestId('knowledge-node-swpc').click();
    const swpcActive = await page.getByTestId('knowledge-node-swpc').getAttribute('data-active');
    await page.getByTestId('source-question-space').click();
    await page.waitForTimeout(100);
    await page.keyboard.press(']');
    await page.waitForTimeout(150);
    const spaceQText = await page.getByTestId('source-rail-panel').textContent();
    await page.keyboard.press('[');
    await page.waitForTimeout(150);
    const steppedBackText = await page.getByTestId('source-rail-panel').textContent();
    await page.screenshot({ path: path.join(SHOTS_DIR, '02d-corridors-dark.png') });

    // Test 3-Wave MissionGameBox drill completion & reset
    await page.locator('#trainer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.getByTestId('drill-wave-1').click();
    await page.getByTestId('drill-option-harmonize').click();
    await page.getByTestId('drill-wave-2').click();
    await page.getByTestId('drill-option-derate').click();
    await page.getByTestId('drill-wave-3').click();
    await page.getByTestId('drill-option-seal').click();
    const drillClearedText = await page.getByTestId('mission-game-box').textContent();
    const outcomeVisible = await page.getByTestId('drill-outcome').isVisible();
    await page.screenshot({ path: path.join(SHOTS_DIR, '02e-trainer-dark.png') });
    await page.getByTestId('drill-reset-btn').click();
    const resetClearedText = await page.getByTestId('mission-game-box').textContent();

    await page.getByRole('button', { name: 'Stress Text' }).click();
    await page.waitForTimeout(150);
    const stressOverflowPx = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    );
    await page.getByRole('button', { name: 'Normal Text' }).click();

    results.push({
      check: 'Pass B: Landing Desktop Dark (1440x900)',
      layoutDark,
      foldDark,
      earthriseDark,
      imgsDark,
      parallaxMoved: beforeTrack !== afterTrack,
      modeToggleCount,
      captionCount,
      sliderOrientation,
      plateUpdated,
      calendarShows2012: Boolean(calendarDetail?.includes('2012')),
      copilotWorks: Boolean(copilotText?.includes('H3') && copilotText?.includes('deratedAmps=')),
      dockSwitched: !beforeSummary?.includes('Maui West 69 kV') && Boolean(afterSummary?.includes('Maui West 69 kV')),
      swpcActive,
      sourceStepped: Boolean(spaceQText?.includes('Quoted Passage · [2]')) && Boolean(steppedBackText?.includes('Quoted Passage · [1]')),
      hasSpaceSource: Boolean(spaceQText?.includes('GOES-18') && spaceQText?.includes('OSDR')),
      drillCleared: Boolean(drillClearedText?.includes('3/3 Cleared')) && outcomeVisible,
      drillReset: Boolean(resetClearedText?.includes('0/3 Cleared')),
      stressOverflowPx,
    });

    if (
      !layoutDark.isDark ||
      !layoutDark.isWide ||
      layoutDark.overflowPx > 0 ||
      layoutDark.navOverflow ||
      !layoutDark.hasWireframeGlobe ||
      !layoutDark.hasParallaxSlider ||
      stressOverflowPx > 0 ||
      foldDark.heroHeight > 760 ||
      foldDark.heroCtaCount > 2 ||
      !foldDark.h1FitsFold ||
      !foldDark.ctasFitFold ||
      foldDark.h1Contrast < 4.5 ||
      foldDark.subContrast < 4.5 ||
      !foldDark.scaleValid ||
      !earthriseDark.fillsViewport ||
      earthriseDark.activeCells <= 500 ||
      imgsDark.brokenCount > 0 ||
      imgsDark.galleryPlateCount < 5 ||
      beforeTrack === afterTrack ||
      modeToggleCount > 0 ||
      captionCount > 0 ||
      sliderOrientation !== 'landscape' ||
      !plateUpdated ||
      !calendarDetail?.includes('2012') ||
      !copilotText?.includes('deratedAmps=') ||
      !afterSummary?.includes('Maui West 69 kV') ||
      swpcActive !== 'true' ||
      !spaceQText?.includes('Quoted Passage · [2]') ||
      !steppedBackText?.includes('Quoted Passage · [1]') ||
      !drillClearedText?.includes('3/3 Cleared') ||
      !outcomeVisible ||
      !resetClearedText?.includes('0/3 Cleared')
    ) {
      throw new Error(`Pass B Landing Dark failed: ${JSON.stringify(results.at(-1), null, 2)}`);
    }

    // Pass C: Desktop Light Theme (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${baseUrl}/?skipPreloader=1&theme=light`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    const foldLight = await auditContrastAndFold(page);
    const lightCheck = await page.evaluate(() => ({
      isDark: document.documentElement.classList.contains('dark'),
      isWide: document.querySelector('header.andromeda-navbar')?.classList.contains('is-wide') ?? false,
      overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }));
    await page.screenshot({ path: path.join(SHOTS_DIR, '03-landing-desktop-light.png') });
    // Click #gallery link in navbar so hash scroll padding is verified live instead of element scrollIntoViewIfNeeded
    await page.locator('header a[href="#gallery"]').click();
    await page.waitForTimeout(350);
    const imgsLight = await measureVisibleImages(page);
    const galleryHeadingClear = await page.evaluate(() => {
      const nav = document.querySelector('header.andromeda-navbar')?.getBoundingClientRect();
      const h2 = document.querySelector('#gallery h2')?.getBoundingClientRect();
      return Boolean(nav && h2 && h2.top >= nav.bottom);
    });
    await page.screenshot({ path: path.join(SHOTS_DIR, '03b-gallery-light.png') });
    results.push({ check: 'Pass C: Landing Desktop Light (1280x800)', lightCheck, foldLight, imgsLight, galleryHeadingClear });
    if (
      lightCheck.isDark ||
      !lightCheck.isWide ||
      lightCheck.overflowPx > 0 ||
      foldLight.heroHeight > 760 ||
      !galleryHeadingClear ||
      foldLight.h1Contrast < 4.5 ||
      foldLight.subContrast < 4.5 ||
      imgsLight.brokenCount > 0
    ) {
      throw new Error(`Pass C Landing Light failed: ${JSON.stringify(results.at(-1), null, 2)}`);
    }

    // Pass D: Tablet Viewports (1024x768 & 768x1024) Zero Overflow
    for (const [w, h] of [
      [1024, 768],
      [768, 1024],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(250);
      const ov = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
      results.push({ check: `Pass D: Viewport ${w}x${h}`, overflowPx: ov });
      if (ov > 0) throw new Error(`Overflow ${ov}px at ${w}x${h}`);
    }

    // Pass E: Dedicated Full Map & Game Views (?view=map and ?view=game)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${baseUrl}/?skipPreloader=1&view=map`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('knowledge-map-box').waitFor({ state: 'visible', timeout: 3000 });
    const mapViewOverflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
    await page.screenshot({ path: path.join(SHOTS_DIR, '04-full-map-dark.png') });

    await page.goto(`${baseUrl}/?skipPreloader=1&view=game`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('mission-game-box').waitFor({ state: 'visible', timeout: 3000 });
    const gameViewOverflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
    await page.screenshot({ path: path.join(SHOTS_DIR, '05-full-game-dark.png') });
    results.push({ check: 'Pass E: Full Views', mapViewOverflow, gameViewOverflow });
    if (mapViewOverflow > 0 || gameViewOverflow > 0) {
      throw new Error(`Full view overflow: map=${mapViewOverflow}, game=${gameViewOverflow}`);
    }

    // Pass E2: How It Works pipeline & Guided Product Tour
    await page.goto(`${baseUrl}/?skipPreloader=1`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('how-it-works-section').waitFor({ state: 'visible', timeout: 3000 });
    await page.getByTestId('start-product-tour').click();
    await page.getByTestId('product-tour-card').waitFor({ state: 'visible', timeout: 3000 });
    const tourStep1Text = await page.getByTestId('product-tour-card').textContent();
    await page.getByTestId('tour-next-btn').click();
    await page.getByTestId('tour-next-btn').click();
    await page.getByTestId('tour-next-btn').click();
    await page.waitForTimeout(250);
    await page.getByTestId('knowledge-map-box').waitFor({ state: 'visible', timeout: 3000 });
    const tourStep4Url = page.url();
    const tourStep4Text = await page.getByTestId('product-tour-card').textContent();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const tourClosed = !(await page.getByTestId('product-tour-card').isVisible());
    results.push({
      check: 'Pass E2: How It Works + Guided Tour',
      hasStep1: Boolean(tourStep1Text?.includes('Step 1 of 5')),
      hasStep4: Boolean(tourStep4Text?.includes('Step 4 of 5')),
      cleanUrl: tourStep4Url.includes('view=map') && !tourStep4Url.includes('#corridors'),
      tourClosed,
    });
    if (
      !tourStep1Text?.includes('Step 1 of 5') ||
      !tourStep4Text?.includes('Step 4 of 5') ||
      !tourStep4Url.includes('view=map') ||
      tourStep4Url.includes('#corridors') ||
      !tourClosed
    ) {
      throw new Error(`Pass E2 Guided Tour failed: ${JSON.stringify(results.at(-1))}`);
    }

    // Pass F: Mobile Viewport (390x844) + Popover Nav + Zero Overflow
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/?skipPreloader=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    await page.locator('button[popovertarget="terraspan-nav-menu"]').click();
    await page.waitForTimeout(200);
    const popoverOpen = await page.evaluate(() =>
      Boolean(document.getElementById('terraspan-nav-menu')?.matches(':popover-open')),
    );
    await page.screenshot({ path: path.join(SHOTS_DIR, '06b-mobile-popover-dark.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const mobileStats = await page.evaluate(() => ({
      overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      isWide: document.querySelector('header.andromeda-navbar')?.classList.contains('is-wide') ?? true,
    }));
    await page.screenshot({ path: path.join(SHOTS_DIR, '06-mobile-landing-dark.png') });
    results.push({ check: 'Pass F: Mobile (390x844)', popoverOpen, ...mobileStats });
    if (!popoverOpen || mobileStats.isWide || mobileStats.overflowPx > 0) {
      throw new Error(`Pass F Mobile failed: ${JSON.stringify(results.at(-1))}`);
    }

    if (errors.length > 0 || failedResponses.length > 0) {
      throw new Error(
        `Runtime errors detected:\nerrors=${JSON.stringify(errors)}\nhttpErrors=${JSON.stringify(failedResponses)}`,
      );
    }

    console.log(JSON.stringify({ status: 'PASS', results, errors, failedResponses }, null, 2));
    await browser.close();
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('QA FAILED:', err);
  process.exit(1);
});
