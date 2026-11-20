// Critic run 87 (new, R200): a shot of the desk's legend opened in a map mode at W x H, before and after a resize round
// trip (1280 and back), with the row's banners, "+n" and how many sampled points of the row the legend covers.
// Usage: [BASE=...] [WAIT=ms] node critic/scripts/c87_legendShot.mjs <seed> <days> <W> <H> <mode>
import { chromium } from '@playwright/test';
import { BASE, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const [seed, days, W, H] = process.argv.slice(2, 6).map(Number);
const mode = process.argv[6] ?? 'fallout';
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
await hours(page, 24 * days);
await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
await page.waitForTimeout(600);
const g = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]'), lg = document.querySelector('[data-testid=map-legend]');
  const r = row.getBoundingClientRect(); let cov = 0;
  for (let x = r.left + 1; x < r.right - 1; x += 2) for (let y = r.top + 1; y < r.bottom - 1; y += 2) { const t = document.elementFromPoint(x, y); if (t && lg.contains(t)) cov++; }
  return { shown: row.querySelectorAll('[data-testid=war-banner]').length, more: row.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null, legendOverRow: cov, open: lg.getAttribute('data-open') };
});
await page.getByTestId('legend-toggle').click();
await page.waitForTimeout(Number(process.env.WAIT ?? 600)); // WAIT: ms after opening before the read
const a = await g();
await page.screenshot({ path: path.join(SHOTS, `c87ls_${seed}_${W}x${H}_${mode}_opened.png`), clip: { x: 0, y: H - 380, width: W, height: 380 } });
await page.setViewportSize({ width: 1280, height: H }); await page.waitForTimeout(600);
await page.setViewportSize({ width: W, height: H }); await page.waitForTimeout(800);
const b = await g();
await page.screenshot({ path: path.join(SHOTS, `c87ls_${seed}_${W}x${H}_${mode}_back.png`), clip: { x: 0, y: H - 380, width: W, height: 380 } });
console.log('opened', JSON.stringify(a), '| after 1280 and back', JSON.stringify(b));
await browser.close();
