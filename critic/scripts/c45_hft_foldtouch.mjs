// Critic run 31 (focused, ROADMAP R8): a folded hero counter on a phone, by touch, as a player meets it.
// 1938 ?heroes=on seed <seed>, start view, 390 x 844 touch. For each folded hero counter ("X +N"): tap it; the panel that
// opens and whether it covers the counter; then three ways on: (a) tap the counter again at once, (b) close the panel
// with its x and tap again, (c) Escape and tap again; each N+1 times. Which heroes are reached each way?
// Usage: node critic/scripts/c45_hft_foldtouch.mjs <seed>
import { chromium } from '@playwright/test';
import { BASE, shot, save, settle } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 5521);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
const out = { seed, counters: [] };
const counters = () => page.evaluate(() => window.__warsim.view.counters.drawn.filter((d) => d.hero !== undefined).map((d) => ({ key: d.key, text: d.text, box: [d.x, d.y, d.w, d.h], n: (d.heroes ?? [d.hero]).length, ids: d.heroes ?? [d.hero] })));
const state = () => page.evaluate(() => {
  const p = [...document.querySelectorAll('aside, .panel')].find((e) => e.offsetParent !== null && /Kind|Overview/.test(e.innerText));
  const r = p?.getBoundingClientRect();
  return { picked: window.__warsim.view.picked, title: p ? p.innerText.split('\n')[0] : null, panel: r ? [r.x, r.y, r.width, r.height].map(Math.round) : null };
});
const covers = (p, b) => p && !(b[0] + b[2] / 2 < p[0] || b[0] + b[2] / 2 > p[0] + p[2] || b[1] + b[3] / 2 < p[1] || b[1] + b[3] / 2 > p[1] + p[3]);
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}&heroes=on`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
  await page.waitForFunction(() => window.__warsim.view.counters.drawn.some((d) => d.hero !== undefined), null, { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500); await settle(page);
  out.all = await counters();
  const cam = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return { cx: c.cx, cy: c.cy, scale: c.scale }; });
  const home = async () => { await page.evaluate((c) => window.__warsim.view.controller.set(c), cam); await settle(page); };
  const tapCounter = async (key) => { const c = (await counters()).find((x) => x.key === key); if (!c) return null; const [x, y, w, h] = c.box; await page.touchscreen.tap(x + w / 2, y + h / 2); await page.waitForTimeout(600); return [Math.round(x + w / 2), Math.round(y + h / 2)]; };
  for (const c of (await counters()).filter((x) => x.n > 1)) {
    const rec = { text: c.text, ids: c.ids, ways: {} };
    for (const way of ['again', 'close', 'escape']) {
      const seen = [];
      await page.keyboard.press('Escape'); await page.waitForTimeout(300); await home();
      for (let k = 0; k < c.n + 1; k++) {
        if (k > 0 && way === 'close') { await page.locator('aside button:has-text("×"), .panel button:has-text("×")').first().tap().catch(() => {}); await page.waitForTimeout(300); }
        if (k > 0 && way === 'escape') { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
        await home();
        const at = await tapCounter(c.key);
        const s = await state();
        seen.push({ k, at, ...s, panelCoversCounter: covers(s.panel, c.box) });
      }
      rec.ways[way] = { seen, reached: c.ids.map((id) => seen.some((s) => s.picked === id)) };
    }
    rec.shot = await shot(page, `c45hft_${seed}_${c.text.replace(/\W/g, '')}.png`);
    out.counters.push(rec);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c45_hft_${seed}.json`, out);
await browser.close();
for (const c of out.counters) for (const [w, r] of Object.entries(c.ways)) console.log(c.text, w, JSON.stringify(r.reached), JSON.stringify(r.seen.map((s) => [s.title, s.panelCoversCounter])));
console.log(out.fatal ?? '', errors.length);
