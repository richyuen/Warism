// Critic run 63 (new): semantic zoom on the historical track's battles. 1938h stepped to a day, then the camera on a
// place at 6000, 1500, 600, 250, 120, 60, 30 and 12 m/px: element and individual counts, a shot each, the map's
// frames. Default: Stalingrad on 15 September 1942 and Normandy on 20 June 1944.
// Usage: node critic/scripts/c67_h_zoom.mjs
import { launch, save, shot, lookAt, hours, BASE, CELLS } from './c67_lib.mjs';
const out = { places: [] };
const { browser, page, errors } = await launch(1600, 900);
// The map's y by latitude from Berlin and Paris (the 1938 grid is not equirectangular in y).
const [bx, by] = CELLS.berlin, [px, py] = CELLS.paris;
const yOf = (lat) => py + ((lat - 48.857) * (by - py)) / (52.52 - 48.857);
const xOf = (lon) => ((lon + 180) / 360) * 2048;
const places = [
  { name: 'stalingrad', day: Date.UTC(1942, 8, 15), lon: 44.5, lat: 48.7 },
  { name: 'normandy', day: Date.UTC(1944, 5, 20), lon: -0.6, lat: 49.2 },
];
try {
  await page.goto(`${BASE}/?scenario=1938h&paused=1`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  for (const p of places) {
    const target = Math.round((p.day - Date.UTC(1938, 0, 1)) / 3600000);
    const now = await page.evaluate(() => window.__warsim.view.lastTick);
    let left = target - now;
    while (left > 0) { const n = Math.min(left, 24 * 60); await hours(page, n); left -= n; }
    await page.waitForTimeout(1500);
    const r = { name: p.name, date: await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ')), tiers: [] };
    for (const m of [6000, 1500, 600, 250, 120, 60, 30, 12]) {
      await lookAt(page, xOf(p.lon), yOf(p.lat), m);
      await page.waitForTimeout(500);
      const s = await page.evaluate(() => { const v = window.__warsim.view; return { mpp: Math.round(v.metresPerPx * v.controller.cam.scale * 10) / 10, el: v.elementCount, ind: v.individualCount }; });
      s.m = m; s.shot = await shot(page, `c67hz_${p.name}_${String(m).padStart(5, '0')}.png`);
      r.tiers.push(s);
      console.log(p.name, m, JSON.stringify(s));
    }
    out.places.push(r);
  }
} catch (e) { out.fatal = String(e?.stack ?? e); console.log(out.fatal); }
out.errors = errors;
save('c67_hz.json', out);
await browser.close();
