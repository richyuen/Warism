// Critic run 38 (copy of run 37) (new): at the view lwt2/lwt4 click from (showPlace Shanghai, 1600x900), which cell each pixel offset is,
// and whether a Japanese formation is within the 14 px pick there (a click on it selects instead of ordering).
// Usage: node critic/scripts/c38_cellprobe.mjs <seed> <hours>
import { launch, open1938, settle, hours, CELLS, save } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 3517), H = Number(process.argv[3] ?? 25);
const { browser, page, errors } = await launch(Number(process.argv[4] ?? 1600), Number(process.argv[5] ?? 900));
const out = { seed, H, rows: [] };
try {
  await open1938(page, seed);
  if (H > 0) await hours(page, H);
  await page.evaluate(() => window.__warsim.view.showPlace(1715.5, 413.5));
  await page.waitForTimeout(1500); await settle(page, 6000);
  const cb = await page.locator('canvas').first().boundingBox();
  const offs = [[0, 0], [8, 0], [14, 0], [21, 0], [0, 14], [0, 21], [0, 42], [-21, 21], [-42, 42], [-21, 42], [0, 63], [-42, 21]];
  for (const [dx, dy] of offs) {
    const sx = cb.width / 2 + dx, sy = cb.height / 2 + dy;
    const r = await page.evaluate(({ sx, sy, nat }) => { const v = window.__warsim.view; return { cell: v.cellAt(sx, sy), pick: v.formationAt(sx, sy, nat) }; }, { sx, sy, nat: CELLS.tags.JAP });
    out.rows.push({ dx, dy, ...r });
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c38_cellprobe_${process.argv[4] ?? 1600}.json`, out);
console.log(JSON.stringify(out));
await browser.close();
