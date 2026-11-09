// Critic run 52 (new): a sea battle as the player finds it. 1938, seed <seed>, run at speed until the ticker shows a
// sea-battle row (data-testid sea-battle-row), pause, click it, shot; then the camera at 600, 150 and 40 m/px on where
// it went, a shot each, with the elements and fleets drawn. Usage: node critic/scripts/c57_seaclick.mjs <seed> [maxDays]
import { launch, open1938, shot, save, hours, settle } from './c57_lib.mjs';

const seed = Number(process.argv[2] ?? 20481);
const maxDays = Number(process.argv[3] ?? 60);
const out = { seed, shots: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  let found = null;
  for (let d = 0; d < maxDays && !found; d++) {
    await hours(page, 24);
    found = await page.evaluate(() => { const b = document.querySelector('[data-testid=sea-battle-row]'); return b ? b.innerText : null; });
    out.day = d + 1;
  }
  out.row = found;
  if (found) {
    await page.click('[data-testid=sea-battle-row]');
    await page.waitForTimeout(1500);
    await settle(page);
    out.shots.push(await shot(page, `c57sc_${seed}_click.png`));
    const cam = await page.evaluate(() => { const v = window.__warsim.view; return { ...v.controller.cam, mpp: v.metresPerPx }; });
    out.cam = cam;
    for (const m of [600, 150, 40]) {
      await page.evaluate(({ m }) => { const v = window.__warsim.view; const c = v.controller.cam; v.controller.set({ cx: c.cx, cy: c.cy, scale: (v.metresPerPx * c.scale) / m }); }, { m });
      await settle(page);
      await hours(page, 1);
      await settle(page);
      out.shots.push(await shot(page, `c57sc_${seed}_${m}m.png`));
    }
  }
} finally {
  out.errors = errors;
  save(`c57_sc_${seed}.json`, out);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
