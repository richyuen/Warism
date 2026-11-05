// Critic run 35 (R22f, new): does a refusal notice go when the order changes? 1938 seed <seed>, <TAG> played; its division
// nearest (sx, sy) selected; real clicks: (ax, ay) an accepted march; after 3 hours (rx, ry), a refused one; after 2 hours
// (bx, by), another accepted march while still marching. The panel's status and notice every hour, crops at each step.
// Usage: node critic/scripts/c35_sn_stale.mjs <seed> <TAG> <sx> <sy> <ax> <ay> <rx> <ry> <bx> <by> <tag>
import { launch, open1938, shot, save, hours, CELLS, settle } from './c31_lib.mjs';
const [seedS, TAG, sx, sy, ax, ay, rx, ry, bx, by, tag] = process.argv.slice(2);
const nat = CELLS.tags[TAG];
const out = { TAG, steps: [], trace: [] };
const { browser, page, errors } = await launch(1600, 900);
const panel = async () => ({
  status: await page.getByTestId('formation-status').innerText({ timeout: 300 }).catch(() => null),
  notice: await page.getByTestId('formation-notice').innerText({ timeout: 300 }).catch(() => null),
});
async function clickAt(x, y) {
  await page.evaluate(({ x, y }) => window.__warsim.view.showPlace(x, y), { x, y });
  await page.waitForTimeout(1500); await settle(page, 6000);
  const cb = await page.locator('canvas').first().boundingBox();
  const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  await page.mouse.move(cx + 4, cy + 4); await page.mouse.move(cx, cy); await page.waitForTimeout(600);
  const tip = await page.evaluate(() => document.querySelector('[data-testid=map-tooltip], .map-tooltip')?.innerText ?? null);
  await page.mouse.click(cx, cy);
  return tip;
}
try {
  await open1938(page, Number(seedS));
  await page.evaluate((n) => window.__warsim.view.select(n), nat);
  await page.waitForTimeout(500);
  await page.getByTestId('take-control').click();
  await page.waitForSelector('[data-testid=release-control]', { timeout: 10_000 });
  const id = await page.evaluate(({ nat, x, y }) => {
    const v = window.__warsim.view;
    return v.formationsOf(nat).filter((id) => !v.formationAfloat(id)).map((id) => [id, Math.hypot(v.formationPos(id)[0] - x, v.formationPos(id)[1] - y)]).sort((a, b) => a[1] - b[1])[0][0];
  }, { nat, x: +sx, y: +sy });
  out.id = id;
  await page.evaluate(() => { window.__news = []; window.__warsim.sim.onOrderNews((m) => window.__news.push(m)); });
  const sel = () => page.evaluate((id) => { const v = window.__warsim.view; v.selectedFormations.clear(); v.selectedFormations.add(id); window.__warsim.hud.selectFormation(id); }, id);
  await sel(); await page.waitForSelector('[data-testid=formation-panel]', { timeout: 10_000 });
  const step = async (name, x, y, after) => {
    await sel();
    const tip = await clickAt(x, y);
    for (let h = 1; h <= after; h++) {
      await hours(page, 1);
      await sel(); await page.waitForTimeout(250);
      out.trace.push({ name, h, ...(await panel()) });
    }
    const crop = `critic/shots/c35sn_${tag}_${name}.png`;
    await page.getByTestId('formation-panel').screenshot({ path: crop }).catch(() => {});
    out.steps.push({ name, tip, panel: await panel(), crop });
  };
  await step('a_march', +ax, +ay, 3);
  await step('r_refused', +rx, +ry, 2);
  await step('b_march', +bx, +by, 6);
  out.news = await page.evaluate(() => window.__news);
  out.shot = await shot(page, `c35sn_${tag}_end.png`);
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 800); }
out.errors = errors;
save(`c35_sn_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 5000));
