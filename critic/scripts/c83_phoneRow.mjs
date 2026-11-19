// Critic run 83 (new, R183 and its follow-up off their cases): the phone's closed war row is now sized by script
// (`sizeRow`, every render) and shows "the banners that fit" (`fit`), which only falls, and is reset by a window resize,
// a change of the row's own width, or a change in the number of wars. Running the 1938 world at Max on a phone, every
// SAMPLE ms: the banners shown, the wars, each shown long name's drawn letters (characters whose box ends inside the
// name's box less the ellipsis), the row's overflow; then a 1 px resize and back (which resets `fit`), and the banners
// shown again. A sample where the resize shows more banners than before is a stale fit (the row said less than it had
// room for). Also the page's layout and style costs over the run (CDP Performance metrics) and the frames' gaps.
// Usage: [BASE=...] [TAG=] node critic/scripts/c83_phoneRow.mjs <seed> <days> <W> <H> [secs] [speed level, default 4]
import { chromium } from '@playwright/test';
import { BASE, save, SHOTS, hours } from './c81_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 83901), days = Number(process.argv[3] ?? 200), W = Number(process.argv[4] ?? 375), H = Number(process.argv[5] ?? 667);
const SECS = Number(process.argv[6] ?? 60), LVL = Number(process.argv[7] ?? 4), SAMPLE = 3000;
const TAG = process.env.TAG ?? '';
const L = `c83pr_${seed}_d${days}_${W}x${H}${TAG}`;
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: W < 600 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
if (days) await hours(page, 24 * days);
await page.waitForTimeout(800);
const read = () => page.evaluate(() => {
  const row = document.querySelector('[data-testid=war-banners]');
  const wars = window.__warsim.hud.stats.value.wars.length;
  if (!row) return { wars, shown: 0 };
  const names = [];
  for (const el of row.querySelectorAll('[data-testid=war-name]')) {
    const t = el.firstChild;
    const full = el.textContent;
    if (!t) continue;
    const box = el.getBoundingClientRect();
    const cut = el.scrollWidth > el.clientWidth + 0.5;
    let n = 0;
    if (!cut) n = [...full].length;
    else {
      const g = document.createElement('canvas').getContext('2d');
      g.font = getComputedStyle(el).font;
      const ell = g.measureText('…').width;
      for (let i = 1; i <= full.length; i++) {
        const r = document.createRange();
        r.setStart(t, 0); r.setEnd(t, i);
        if (r.getBoundingClientRect().right <= box.right - ell + 0.5) n = i; else break;
      }
    }
    names.push({ name: full, letters: n, cut, short: el.classList.contains('war-name-short') });
  }
  const rr = row.getBoundingClientRect();
  const more = row.querySelector('[data-testid=war-more]');
  const mr = more?.getBoundingClientRect();
  return { wars, shown: row.querySelectorAll('[data-testid=war-banner]').length, more: more?.textContent.trim() ?? null, moreInView: mr ? mr.right <= innerWidth + 0.5 && mr.left >= 0 : null, overflow: Math.round(row.scrollWidth - row.clientWidth), rowR: Math.round(rr.right), names, tight: row.querySelectorAll('.war-tight').length };
});
const cdp = await ctx.newCDPSession(page);
await cdp.send('Performance.enable');
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
await page.evaluate(() => {
  window.__gaps = [];
  let last = performance.now();
  const f = (t) => { window.__gaps.push(t - last); last = t; requestAnimationFrame(f); };
  requestAnimationFrame(f);
});
const m0 = await metrics();
await page.evaluate((lvl) => { const h = window.__warsim.hud; h.setSpeedLevel(lvl); if (h.paused.value) h.togglePause(); }, LVL);
const out = { seed, days, W, H, secs: SECS, samples: [], stale: 0, under5: [], overflowSamples: 0, moreOut: 0 };
const t0 = Date.now();
let k = 0;
while (Date.now() - t0 < SECS * 1000) {
  await page.waitForTimeout(SAMPLE);
  const before = await read();
  await page.setViewportSize({ width: W + 1, height: H });
  await page.waitForTimeout(150);
  await page.setViewportSize({ width: W, height: H });
  await page.waitForTimeout(250);
  const after = await read();
  const s = { t: Math.round((Date.now() - t0) / 1000), tick: await page.evaluate(() => window.__warsim.hud.tick.value), before, afterShown: after.shown, afterMore: after.more };
  // A stale fit only when the same wars are shown (both reads in the same snapshot's world is not guaranteed at Max).
  if (after.shown > before.shown && after.wars === before.wars) { out.stale++; s.stale = true; s.shot = `critic/shots/${L}_stale_${k}.png`; await page.screenshot({ path: path.join(SHOTS, `${L}_stale_${k}.png`), clip: { x: 0, y: 0, width: W, height: 90 } }); }
  for (const r of [before, after]) {
    if (r.overflow > 1) out.overflowSamples++;
    if (r.moreInView === false) out.moreOut++;
    for (const n of r.names ?? []) if (!n.short && n.cut && n.letters < 5) out.under5.push({ t: s.t, ...n });
  }
  out.samples.push(s);
  console.log(JSON.stringify({ t: s.t, tick: s.tick, wars: before.wars, shown: before.shown, after: after.shown, ov: before.overflow, names: (before.names ?? []).map((n) => `${n.name}:${n.letters}${n.cut ? '…' : ''}`).join(' | ') }));
  k++;
}
await page.evaluate(() => { const h = window.__warsim.hud; if (!h.paused.value) h.togglePause(); });
const m1 = await metrics();
const gaps = await page.evaluate(() => window.__gaps.slice(5).sort((a, b) => a - b));
const q = (p) => Math.round(gaps[Math.min(gaps.length - 1, Math.floor(p * gaps.length))] * 10) / 10;
out.cost = {
  layoutCount: m1.LayoutCount - m0.LayoutCount,
  layoutMs: Math.round((m1.LayoutDuration - m0.LayoutDuration) * 1000),
  styleMs: Math.round((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000),
  scriptMs: Math.round((m1.ScriptDuration - m0.ScriptDuration) * 1000),
  taskMs: Math.round((m1.TaskDuration - m0.TaskDuration) * 1000),
  frames: gaps.length, gapP50: q(0.5), gapP95: q(0.95), gapMax: q(1),
};
await page.screenshot({ path: path.join(SHOTS, `${L}_end.png`) });
out.errors = errors;
console.log(JSON.stringify({ stale: out.stale, overflowSamples: out.overflowSamples, moreOut: out.moreOut, under5: out.under5.length, cost: out.cost, errors: errors.length }));
save(`${L}.json`, out);
await browser.close();
