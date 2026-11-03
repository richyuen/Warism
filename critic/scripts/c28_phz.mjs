// Critic run 28 (new), PHZ: every zoom tier on a phone (390x844, touch), a new seed, over the busiest land fight after
// `days` days; then a tap on the screen centre (what opens), the nation panel by a tap on land, and the war banners.
// Usage: node critic/scripts/c28_phz.mjs <seed> <days>
import { chromium } from '@playwright/test';
import { BASE, SHOTS, save, settle, lookAt, hours } from './c28_lib.mjs';
import path from 'node:path';
const seed = Number(process.argv[2] ?? 2671), days = Number(process.argv[3] ?? 40);
const out = { seed, days, tiers: [] };
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`error: ${m.text()}`.slice(0, 300)); });
const shot = async (n) => { await page.screenshot({ path: path.join(SHOTS, n) }); return `critic/shots/${n}`; };
try {
  await page.goto(`${BASE}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && window.__warsim.sim.mapLayers !== null, null, { timeout: 120_000 });
  await hours(page, days * 24);
  const at = await page.evaluate(async () => {
    const v = window.__warsim.view; const st = await window.__warsim.sim.inspect(true);
    const eng = st.formations.filter((f) => !v.formationAfloat(f.id) && v.formationEngaged(f.id)).map((f) => v.formationPos(f.id)).filter(Boolean);
    let best = null, bn = -1;
    for (const p of eng) { const n = eng.filter((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 3).length; if (n > bn) { bn = n; best = p; } }
    return { best, bn, engaged: eng.length };
  });
  out.fight = at;
  for (const m of [30000, 3500, 800, 250, 60, 25]) {
    await lookAt(page, at.best[0], at.best[1], m);
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      banners: [...document.querySelectorAll('[data-testid=war-banner]')].length,
      el: window.__warsim.view.elementCount ?? null,
    }));
    out.tiers.push({ m, ...info, shot: await shot(`c28phz_${seed}_${String(m).padStart(5, '0')}.png`) });
  }
  await lookAt(page, at.best[0], at.best[1], 800);
  await page.touchscreen.tap(195, 422);
  await page.waitForTimeout(900);
  out.tapCentre = await page.evaluate(() => {
    const f = document.querySelector('[data-testid=formation-panel]'); const n = document.querySelector('[data-testid=nation-panel]'); const m = document.querySelector('[data-testid=nation-menu]');
    return { formation: f?.innerText.slice(0, 300) ?? null, nation: n?.innerText.slice(0, 300) ?? null, menu: m?.innerText.slice(0, 200) ?? null };
  });
  out.tapShot = await shot(`c28phz_${seed}_tap.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c28_phz_${seed}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 3000));
