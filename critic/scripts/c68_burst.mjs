// Critic run 68 (new, R81c): a burst at world zoom, at Speed x1 running (not stepped): God's H-bomb (or A-bomb) on a
// city, then shots at 937 and 3,000 m/px at 1, 5, 10, 15, 20 and 30 s of wall time, two pages (one per zoom) so each
// zoom is watched from the burst on. Usage: node critic/scripts/c68_burst.mjs <seed> <city> [h|a]
import { launch, BASE, save, CELLS } from './c68_lib.mjs';
import { chromium } from '@playwright/test';

const seed = Number(process.argv[2] ?? 41205);
const city = process.argv[3] ?? 'paris';
const size = process.argv[4] === 'a' ? 'fission' : 'thermonuclear';
const out = { seed, city, size, shots: [], dates: {} };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const [cx, cy] = CELLS[city];
for (const m of [937, 3000]) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
  await page.evaluate(({ x, y, m }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { x: cx, y: cy, m });
  await page.evaluate(() => window.__warsim.hud.setSpeedLevel(1));
  await page.getByTestId('god-btn').click();
  await page.getByTestId('god-tool-nuke').click();
  await page.getByTestId('god-nuke-size').selectOption(size);
  // Running at x1.
  await page.evaluate(() => (window.__warsim.hud.paused.value ? window.__warsim.hud.togglePause() : undefined));
  await page.waitForTimeout(500);
  await page.mouse.click(800, 450);
  const t0 = Date.now();
  // Close the alert so the map is seen (as a player would), after 1 s.
  for (const s of [1, 5, 10, 15, 20, 30]) {
    const wait = t0 + s * 1000 - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    const p = `critic/shots/c68b_${seed}_${city}_${m}m_${String(s).padStart(2, '0')}s.png`;
    await page.screenshot({ path: p });
    out.shots.push(p);
    out.dates[`${m}_${s}`] = await page.evaluate(() => document.body.innerText.match(/\d{1,2} \w+ 19\d\d/)?.[0] ?? '');
  }
  await page.close();
}
save(`c68_burst_${seed}_${city}.json`, out);
console.log(JSON.stringify(out.dates));
await browser.close();
