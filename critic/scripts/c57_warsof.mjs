// Critic run 55 (new): play TAG for DAYS, then the wars the page knows (hud.stats.value), and the played nation's panel text.
// Usage: node critic/scripts/c57_warsof.mjs <seed> <TAG> <days>
import { launch, open1938, save, hours, CELLS, shot } from './c57_lib.mjs';
const [seedS, TAG, daysS] = process.argv.slice(2);
const out = { seed: Number(seedS), TAG };
const { browser, page, errors } = await launch(1600, 900);
try {
  await open1938(page, Number(seedS));
  const me = CELLS.tags[TAG];
  await page.evaluate((g) => window.__warsim.hud.command({ kind: 'setPlayer', nation: g }), me);
  for (let d = 0; d < Number(daysS); d += 30) await hours(page, 24 * Math.min(30, Number(daysS) - d));
  out.statsKeys = await page.evaluate(() => Object.keys(window.__warsim.hud.stats.value ?? {}));
  out.wars = await page.evaluate(() => JSON.stringify(window.__warsim.hud.stats.value?.wars ?? null).slice(0, 4000));
  await page.evaluate((n) => window.__warsim.view.select(n), me);
  await page.waitForTimeout(800);
  out.panel = await page.evaluate(() => document.querySelector('[data-testid=nation-panel]')?.innerText ?? null);
  await shot(page, `c57wo_${seedS}_${TAG}_panel.png`);
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c57_warsof_${seedS}_${TAG}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1).slice(0, 5000));
