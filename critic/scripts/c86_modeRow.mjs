// Critic run 86 (new, R197 off its case): R197 sizes the desk row by the band between the news and the legend; the legend
// is much wider (with a nudge, 1 px wider and back, and the route widened back to 1100; `under`: legend/ticker cells covered) in some map modes (sea control, air control, fallout). One desk window narrowed 1100 -> 600 px (STEP 20)
// in each map mode given: banners shown, "+n", the row's box, the legend's box, and a shot where none is shown.
// Usage: [BASE=...] node critic/scripts/c86_modeRow.mjs <seed> <days> <H> <modes,...>
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c85_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 84901), days = Number(process.argv[3] ?? 400), H = Number(process.argv[4] ?? 800);
const modes = (process.argv[5] ?? 'political,seaControl,airControl,fallout,puppets').split(',');
const TAG = process.env.TAG ?? '';
const L = `c86mr_${seed}_d${days}_h${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 1100, height: H } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(800);
const out = { seed, days, H, modes: {} };
for (const mode of modes) {
  await page.setViewportSize({ width: 1100, height: H });
  await page.evaluate((m) => window.__warsim.hud.setMapMode(m), mode);
  await page.waitForTimeout(500);
  const steps = [];
  const ws = [];
  for (let W = 1100; W >= 600; W -= 20) ws.push(W);
  for (let W = 620; W <= 1100; W += 20) ws.push(W);
  const geom = () => page.evaluate(() => {
      const row = document.querySelector('[data-testid=war-banners]');
      const rr = row.getBoundingClientRect();
      const lg = document.querySelector('[data-testid=map-legend]')?.getBoundingClientRect();
      const tk = [...document.querySelectorAll('.ticker')].map((e) => e.getBoundingClientRect()).filter((b) => b.width)[0];
      const under = [];
      for (const el of document.querySelectorAll('[data-testid=map-legend], .ticker .ticker-row, [data-testid=ticker-row]')) {
        const r = el.getBoundingClientRect();
        let hit = 0;
        for (let x = r.left + 1; x < r.right - 1; x += 2) for (let y = r.top + 1; y < r.bottom - 1; y += 2) { const t = document.elementFromPoint(x, y); if (t && row.contains(t)) hit++; }
        if (hit) under.push(`${el.getAttribute('data-testid') ?? 'ticker'}:${hit}`);
      }
      return { under, shown: row.querySelectorAll('[data-testid=war-banner]').length, more: row.querySelector('[data-testid=war-more]')?.textContent.trim() ?? null, row: [Math.round(rr.left), Math.round(rr.right)], legend: lg ? [Math.round(lg.left), Math.round(lg.top), Math.round(lg.right)] : null, ticker: tk ? [Math.round(tk.left), Math.round(tk.right)] : null, phone: matchMedia('(max-width: 600px), (max-height: 500px)').matches };
    });
  for (const W of ws) {
    await page.setViewportSize({ width: W, height: H });
    await page.waitForTimeout(600);
    const g = await geom();
    await page.setViewportSize({ width: W + 1, height: H });
    await page.waitForTimeout(300);
    await page.setViewportSize({ width: W, height: H });
    await page.waitForTimeout(600);
    const n = await geom();
    const st = { W, ...g, nudged: n.shown };
    if (!g.phone && g.shown === 0 && (W % 100 === 0 || W === 620 || W === 700)) {
      await page.screenshot({ path: path.join(SHOTS, `${L}_${mode}_${W}.png`), clip: { x: 0, y: H - 300, width: W, height: 300 } });
      st.shot = `critic/shots/${L}_${mode}_${W}.png`;
    }
    steps.push(st);
  }
  const desk = steps.filter((s) => !s.phone);
  out.modes[mode] = { fit0: desk.filter((s) => s.shown === 0).map((s) => s.W), stale: desk.filter((s) => s.nudged !== s.shown).map((s) => s.W), covering: desk.filter((s) => s.under.length).map((s) => `${s.W}:${s.under.join('+')}`), steps };
  console.log(mode, 'fit0', JSON.stringify(out.modes[mode].fit0), 'stale', JSON.stringify(out.modes[mode].stale), 'covering', JSON.stringify(out.modes[mode].covering));
}
out.errors = errors;
console.log('errors', errors.length);
save(`${L}.json`, out);
await browser.close();
