// Critic run 63 (new): c63_x_editor 32443's started file showed a grey map with no nations and a short bar. Load the
// exported scenario file from the title screen ("Start this scenario"), then every second for 60 s: stats present?
// nations in the stats, the owner under Paris, the bar's buttons; shots at 2 s, 10 s, 60 s.
// Usage: node critic/scripts/c63_x_loadfile.mjs <file> <label>
import { launch, shot, save, lookAt, screenOf, CELLS, BASE, buttons } from './c63_lib.mjs';
const file = process.argv[2] ?? 'critic/c63_paint_32443.warism-scenario', label = process.argv[3] ?? '32443';
const out = { file, samples: [] };
const { browser, page, errors } = await launch(1600, 900);
const paris = CELLS.paris ?? [1024, 300];
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-scenario-file').setInputFiles(file);
  await page.waitForTimeout(1500);
  out.titleShot = await shot(page, `c63xl_${label}_title.png`);
  const t0 = Date.now();
  await page.getByTestId('title-file-start').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 120000 });
  out.framesAtMs = Date.now() - t0;
  for (let k = 0; k <= 60; k++) {
    const s = await page.evaluate(() => ({
      stats: window.__warsim.hud.stats.value !== null,
      nations: window.__warsim.hud.stats.value?.nations?.length ?? null,
      tick: window.__warsim.hud.tick.value,
      layers: window.__warsim.sim.mapLayers !== null,
      url: location.href,
    }));
    s.ms = Date.now() - t0;
    if (k === 2 || k === 10 || k === 60) {
      await lookAt(page, paris[0], paris[1], 1500, false);
      s.owner = await page.evaluate(({ x, y }) => { const v = window.__warsim.view; const c = v.controller.cam; return v.nationAt((x - c.cx) * c.scale + innerWidth / 2, (y - c.cy) * c.scale + innerHeight / 2); }, { x: paris[0], y: paris[1] });
      s.buttons = await buttons(page);
      s.shot = await shot(page, `c63xl_${label}_${k}s.png`);
    }
    out.samples.push(s);
    if (k === 0 || k === 2 || k === 10 || k === 60) console.log(JSON.stringify(s).slice(0, 400));
    await page.waitForTimeout(1000);
  }
} catch (e) { out.fail = String(e?.stack ?? e).slice(0, 600); console.log(out.fail); }
out.errors = errors;
save(`c63_xl_${label}.json`, out);
await browser.close();
console.log('errors', errors.slice(0, 8));
