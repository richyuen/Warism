// Critic run 61 (new): the editor by mouse: paint France's land around Paris as Germany with the brush (drag), undo,
// redo; export the scenario (download), load it from the title screen's file input, start it: is the paint there?
// Usage: node critic/scripts/c61_x_editor.mjs <seed>
import { launch, open1938, shot, save, lookAt, screenOf, CELLS, BASE } from './c61_lib.mjs';
import { readFileSync } from 'node:fs';
const seed = Number(process.argv[2] ?? 32441);
const out = { seed, steps: [] };
const { browser, page, errors } = await launch(1600, 900);
const step = (s, o = {}) => { out.steps.push({ s, ...o }); console.log(s, JSON.stringify(o).slice(0, 400)); };
const ownerAt = (x, y) => page.evaluate(async ({ x, y }) => { const v = window.__warsim.view; return v.nationAt(...(() => { const c = v.controller.cam; return [(x - c.cx) * c.scale + innerWidth / 2, (y - c.cy) * c.scale + innerHeight / 2]; })()); }, { x, y });
try {
  await open1938(page, seed);
  const paris = CELLS.paris;
  await lookAt(page, paris[0], paris[1], 1500);
  const pts = [[paris[0] - 3, paris[1]], [paris[0], paris[1] + 3], [paris[0] + 3, paris[1] - 2]];
  step('owners before', { o: await Promise.all(pts.map(([x, y]) => ownerAt(x, y))), ger: CELLS.tags.GER, fra: CELLS.tags.FRA });
  await page.getByTestId('editor-btn').click();
  await page.getByTestId('editor-panel').waitFor();
  await page.getByTestId('editor-nation-filter').fill('germ');
  await page.waitForTimeout(400);
  const nat = page.getByTestId('editor-nation');
  const tag = await nat.evaluate((e) => e.tagName);
  step('nation control', { tag, text: (await nat.innerText()).slice(0, 200) });
  if (tag === 'SELECT') await nat.selectOption({ label: 'Germany' }); else await page.getByTestId('editor-panel').getByText('Germany', { exact: true }).first().click();
  out.panelShot = await shot(page, `c61xe_${seed}_panel.png`);
  const [ax, ay] = await screenOf(page, pts[0][0], pts[0][1]);
  const [bx, by] = await screenOf(page, pts[2][0], pts[2][1]);
  const [cx, cy] = await screenOf(page, pts[1][0], pts[1][1]);
  await page.mouse.move(ax, ay); await page.mouse.down();
  await page.mouse.move(cx, cy, { steps: 12 }); await page.mouse.move(bx, by, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(1200);
  step('owners after paint', { o: await Promise.all(pts.map(([x, y]) => ownerAt(x, y))), undo: await page.getByTestId('editor-undo').innerText() });
  out.paintShot = await shot(page, `c61xe_${seed}_painted.png`);
  await page.getByTestId('editor-undo').click(); await page.waitForTimeout(1000);
  step('after undo', { o: await Promise.all(pts.map(([x, y]) => ownerAt(x, y))) });
  await page.getByTestId('editor-redo').click(); await page.waitForTimeout(1000);
  step('after redo', { o: await Promise.all(pts.map(([x, y]) => ownerAt(x, y))) });
  await page.getByTestId('scenario-name').fill('Critic 61 paint').catch(() => {});
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.getByTestId('scenario-export').click()]);
  const file = `critic/c61_paint_${seed}.warism-scenario`;
  await dl.saveAs(file);
  step('exported', { file, name: dl.suggestedFilename(), bytes: readFileSync(file).length });
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-scenario-file').setInputFiles(file);
  await page.waitForTimeout(1500);
  step('title after file', { detail: await page.getByTestId('title-detail').innerText().catch(() => null) });
  out.titleShot = await shot(page, `c61xe_${seed}_title.png`);
  await page.getByTestId(process.env.MAINSTART ? 'settings-new-game' : 'title-file-start').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120000 });
  await page.waitForTimeout(2000);
  await lookAt(page, paris[0], paris[1], 1500);
  step('loaded owners', { o: await Promise.all(pts.map(([x, y]) => ownerAt(x, y))) });
  out.loadedShot = await shot(page, `c61xe_${seed}_loaded.png`);
} catch (e) { out.fail = String(e).slice(0, 400); console.log(out.fail); }
finally { out.errors = errors; save(`c61_xe_${seed}.json`, out); await browser.close(); }
