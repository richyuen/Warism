// Critic run 70 (new, R84k): the played nation's hero opened from its Overview row, then ordered by a real mouse click
// on the map (not player.click), the world run a few hours: does the hero march? Each hero row of the nation in turn.
// Usage: BASE=... node critic/scripts/c73_heroorder.mjs <seed> <TAG>
import { readFileSync } from 'node:fs';
import { launch, shot, save, settle } from './c73_lib.mjs';

const seed = Number(process.argv[2] ?? 53184);
const tag = process.argv[3] ?? 'GER';
const out = { seed, tag, rows: [] };
const { browser, page, errors } = await launch(1600, 900);
await page.goto(`${process.env.BASE}/?scenario=1938&paused=1&seed=${seed}&heroes=on`);
await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 90_000 });
const NATIONS = JSON.parse(readFileSync('data/scenarios/1938/nations.json', 'utf8'));
const nid = (NATIONS.nations ?? NATIONS).findIndex((x) => x.tag === tag) + 1;
out.nid = nid;
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nid);
await page.waitForTimeout(800);
out.takeOffered = await page.getByTestId('take-control').count();
if (out.takeOffered) await page.getByTestId('take-control').click();
await page.waitForTimeout(800);
await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nid);
await page.waitForTimeout(800);
const rows = page.getByTestId('hero-row');
const n = await rows.count();
out.count = n;
for (let i = Number(process.env.ROW ?? 0); i < n; i++) {
  await page.evaluate((n) => window.__warsim.hud.onSelectNation(n), nid);
  await page.waitForTimeout(600);
  if ((await rows.count()) <= i) {
    // The Overview tab may not be the one open after a formation panel: open it.
    if (await page.getByTestId('tab-overview').count()) await page.getByTestId('tab-overview').click().catch(() => {});
    await page.waitForTimeout(600);
  }
  if ((await rows.count()) <= i) { out.rows.push({ i, missing: true, shot: await shot(page, `c73ho_${seed}_${tag}_${i}_missing.png`) }); continue; }
  const text = (await rows.nth(i).innerText()).replace(/\n/g, ' ');
  await rows.nth(i).click();
  await page.waitForTimeout(1500);
  const sel = await page.evaluate(() => ({ info: window.__warsim.hud.formationInfo.value?.id ?? 0, sel: [...window.__warsim.view.selectedFormations] }));
  const id = sel.info;
  // Close in at 600 m/px on the hero.
  await page.evaluate(({ id }) => { const v = window.__warsim.view; const [x, y] = v.formationPos(id); v.controller.set({ cx: x, cy: y, scale: (v.metresPerPx * v.controller.cam.scale) / 600 }); }, { id });
  await settle(page, 8000);
  await page.waitForTimeout(600);
  const p0 = await page.evaluate((id) => window.__warsim.view.formationPos(id), id);
  const s0 = await shot(page, `c73ho_${seed}_${tag}_${i}_0sel.png`);
  // A real click 140 px west-south-west of the screen centre (the hero is at the centre), on land.
  await page.mouse.click(800 - 140, 450 + 40);
  await page.waitForTimeout(700);
  const s1 = await shot(page, `c73ho_${seed}_${tag}_${i}_1clicked.png`);
  await page.evaluate(() => window.__warsim.sim.step(48));
  await page.waitForTimeout(2500);
  const p1 = await page.evaluate((id) => window.__warsim.view.formationPos(id), id);
  const s2 = await shot(page, `c73ho_${seed}_${tag}_${i}_2later.png`);
  const moved = p0 && p1 ? Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) : null;
  out.rows.push({ i, text, sel, p0, p1, moved, s0, s1, s2 });
  await page.keyboard.press('Escape');
}
out.errors = errors;
save(`c73_ho_${seed}_${tag}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
