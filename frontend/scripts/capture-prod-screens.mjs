/**
 * Capture baseline PNGs from https://gymerviet.com for UI review.
 * Run from repo root: node frontend/scripts/capture-prod-screens.mjs
 * Or from frontend/: node scripts/capture-prod-screens.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/ui-review-prod');
const BASE = 'https://gymerviet.com';

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/gyms', name: 'gyms' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/coaches', name: 'coaches' },
  { path: '/news', name: 'news' },
  { path: '/marketplace', name: 'marketplace' },
  { path: '/pricing', name: 'pricing' },
];

const VIEWPORTS = [
  { id: 'mobile', width: 390, height: 844 },
  { id: 'desktop', width: 1280, height: 900 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const { path, name } of ROUTES) {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        ignoreHTTPSErrors: true,
      });
      const page = await ctx.newPage();
      const url = `${BASE}${path}`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        await new Promise((r) => setTimeout(r, 2000));
        const file = join(OUT, `${name}--${vp.id}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log('wrote', file);
      } catch (e) {
        console.error('fail', url, vp.id, e.message);
      }
      await ctx.close();
    }
  }

  await browser.close();
  const note = join(OUT, 'CAPTURED_AT.txt');
  await writeFile(note, new Date().toISOString() + '\n' + BASE + '\n', 'utf8');
  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
