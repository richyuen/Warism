// Critic run 65 (new): shots of places in a start from a year (replay), each with the tooltip of its centre.
// Usage: node critic/scripts/c65_x_places.mjs <year> <label:cx:cy:mpp> ...
import { launch, shot, save, lookAt, BASE } from './c65_lib.mjs';
const year = Number(process.argv[2]);
const out = { year, places: [] };
const { browser, page, errors } = await launch(1600, 900);
try {
  await page.goto(`${BASE}/?scenario=1938h&seed=1938&paused=1&year=${year}&mode=replay&after=1`);
  await page.waitForFunction(() => window.__warsim?.hud?.stats?.value != null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  await page.waitForTimeout(1500);
  for (const a of process.argv.slice(3)) {
    const [label, cx, cy, m] = a.split(':');
    await lookAt(page, Number(cx), Number(cy), Number(m), true);
    await page.mouse.move(800, 450);
    await page.waitForTimeout(700);
    const tip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip]')?.innerText ?? null);
    out.places.push({ label, tip, shot: await shot(page, `c65pl_${year}_${label}.png`) });
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c65_pl_${year}.json`, out);
await browser.close();
console.log(JSON.stringify(out));
