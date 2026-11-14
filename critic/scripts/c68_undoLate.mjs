// Critic run 68 (new, R81b's bars on the late world): 7019's year-20 world loaded, running at x5; five times: an
// A-bomb by God on a city far from the last, then Undo. Per act: the longest frame gap (rAF) in the 2 s after the
// click, the time from the click to the strike's alert, the time from Undo's click to the button gone and the hash back.
// Run alone (the perf chain). Usage: node critic/scripts/c68_undoLate.mjs <save.bin>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, save, CELLS } from './c68_lib.mjs';

const bin = process.argv[2] ?? 'critic/c68_seed7019_y20.bin';
const out = { bin, acts: [] };
const { browser, page, errors } = await launch();
const bytes = readFileSync(path.resolve(bin));
await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
await open1938(page, 7019);
await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
await page.waitForTimeout(3000);
await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
await page.getByTestId('god-btn').click();
const cities = ['paris', 'moscow', 'rome', 'london', 'tokyo'];
for (const c of cities) {
  const [x, y] = CELLS[c];
  await page.evaluate(({ x, y }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / 937 }); }, { x, y });
  await page.evaluate(() => { const h = window.__warsim.hud; h.setSpeedLevel(3); if (h.paused.value) h.togglePause(); });
  await page.waitForTimeout(1500);
  const h0 = await page.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
  await page.getByTestId('god-tool-nuke').click();
  await page.getByTestId('god-nuke-size').selectOption('fission');
  // Frame gaps over 2.5 s from the click.
  await page.evaluate(() => { window.__gaps = []; let last = performance.now(); const t0 = last; const f = () => { const n = performance.now(); window.__gaps.push(n - last); last = n; if (n - t0 < 2500) requestAnimationFrame(f); }; requestAnimationFrame(f); window.__clickAt = performance.now(); });
  await page.mouse.click(800, 450);
  const alertMs = await page.waitForFunction(() => document.querySelector('[data-testid=god-undo]') ? performance.now() - window.__clickAt : false, null, { timeout: 20_000, polling: 'raf' }).then((h) => h.jsonValue()).catch(() => null);
  await page.waitForTimeout(2600);
  const gaps = await page.evaluate(() => window.__gaps.slice().sort((a, b) => b - a).slice(0, 3).map((g) => Math.round(g)));
  await page.evaluate(() => { const h = window.__warsim.hud; if (!h.paused.value) h.togglePause(); });
  const tU = Date.now();
  await page.getByTestId('god-undo').click();
  await page.waitForFunction(() => !document.querySelector('[data-testid=god-undo]'), null, { timeout: 20_000 }).catch(() => {});
  const undoMs = Date.now() - tU;
  const h2 = await page.evaluate(() => window.__warsim.sim.hash().then((s) => s.hash));
  const back = await page.evaluate(() => document.querySelector('[data-testid=god-undone]')?.innerText ?? null);
  out.acts.push({ city: c, offeredMs: alertMs && Math.round(alertMs), worstGaps: gaps, undoMs, h0, h2, undone: back });
  await page.keyboard.press('Escape');
  for (let i = 0; i < 3; i++) if (await page.getByTestId('nuke-close').count()) await page.getByTestId('nuke-close').first().click().catch(() => {});
}
out.errors = errors;
save('c68_undoLate.json', out);
console.log(JSON.stringify(out.acts));
await browser.close();
