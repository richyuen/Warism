// Critic run 90 (new): R89-N2 (R214): past the map's north and south edges at world zoom on the 1440p desk (2560 x 1305),
// one flat sea colour? 1938 SEED opened paused at the start camera, then zoomed out to the least scale and panned north
// and south; at each a shot and the screen rows of the map's north (y = 0) and south (y = map height) edges, for
// c90_edge.py to measure the colour spread across x of each band. Usage: node critic/scripts/c90_edge.mjs <seed> [WxH]
import { launch, open1938, shot, save } from './c85_lib.mjs';
const seed = process.argv[2] ?? '89943';
const [W, H] = (process.argv[3] ?? '2560x1305').split('x').map(Number);
const { browser, page, errors } = await launch(W, H);
const out = { seed, size: `${W}x${H}`, views: [] };
try {
  await open1938(page, seed);
  await page.waitForTimeout(1500);
  const view = async (name) => {
    await page.waitForTimeout(800);
    const v = await page.evaluate(() => {
      const w = window.__warsim, c = w.view.controller.cam, mh = w.sim.mapLayers?.height ?? w.view.mapH ?? null;
      return { cx: c.cx, cy: c.cy, scale: c.scale, mapH: mh, north: (0 - c.cy) * c.scale + innerHeight / 2, south: mh === null ? null : (mh - c.cy) * c.scale + innerHeight / 2 };
    });
    v.name = name; v.shot = await shot(page, `c90edge_${seed}_${W}x${H}_${name}.png`);
    out.views.push(v); console.log(JSON.stringify(v));
  };
  await view('start');
  await page.evaluate(() => { const v = window.__warsim.view; v.controller.set({ scale: 0.0001 }); });
  await view('min');
  await page.evaluate(() => { const v = window.__warsim.view, c = v.controller.cam; v.controller.set({ cy: c.cy - 400 / c.scale }); });
  await view('min_north');
  await page.evaluate(() => { const v = window.__warsim.view, c = v.controller.cam; v.controller.set({ cy: c.cy + 1200 / c.scale }); });
  await view('min_south');
} catch (e) { out.fail = String(e).slice(0, 300); }
finally { out.errors = errors; save(`c90_edge_${seed}_${W}x${H}.json`, out); await browser.close(); console.log(JSON.stringify({ errors, fail: out.fail })); }
