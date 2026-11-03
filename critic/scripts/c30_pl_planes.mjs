// Critic run 23, PL: planes in flight in the ball look (PLAN 7.180) against Classic and against run 22's build,
// the same moment: seed, war, hour, camera. At each zoom, the shots and every plane mark on screen with its nation.
// Usage: node critic/scripts/c30_pl_planes.mjs <seed> <A> <D> <port> [tag]
import { launch, lookAt, shot, save, hours, CELLS, settle } from './c30_lib.mjs';

const seed = Number(process.argv[2] ?? 7019);
const A = process.argv[3] ?? 'GER';
const D = process.argv[4] ?? 'POL';
const port = Number(process.argv[5] ?? 5299);
const tag = process.argv[6] ?? `c30pl_${seed}_${A}_${D}_${port}`;
const T = CELLS.tags;
const base = `http://127.0.0.1:${port}`;
const out = { seed, A, D, port, views: [] };
const { browser, page, errors } = await launch();
const setLook = (l) => page.evaluate((l) => { window.__warsim.view.unitLook = l; }, l);
try {
  await page.goto(`${base}/?scenario=1938&paused=1&seed=${seed}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T[A], d: T[D] });
  // Step a day at a time, then hours, until at least 6 planes are on a 1200 m/px screen around the front.
  const marks = () => page.evaluate(() => window.__warsim.view.sortieMarks.map((s) => ({ x: Math.round(s.x), y: Math.round(s.y), n: s.nation, planes: s.planes, role: s.role, span: +s.span.toFixed(1) })));
  let best = null;
  for (let h = 0; h < 24 * 6 && !best; h += 2) {
    await hours(page, 2);
    // Look at all sorties in the world: centre on their mean.
    const all = await page.evaluate(() => {
      const v = window.__warsim.view; const r = [];
      for (const s of v.sorties ? [] : []) r.push(s);
      return v.sortieMarks.length;
    });
    void all;
    // Find sortie world positions: centre the camera at the war and zoom to 1200.
    if (h % 12 === 0 || h > 30) {
      const cap = await page.evaluate((d) => { const v = window.__warsim.view; return v.capitals.get(d); }, T[D]);
      if (cap) await lookAt(page, cap[0] ?? cap.x, cap[1] ?? cap.y, 3000, false);
      await page.evaluate(() => window.__warsim.view.draw(performance.now()));
      const ms = await marks();
      if (ms.length >= 4) {
        // Centre on the mean of the marks.
        const mx = ms.reduce((a, s) => a + s.x, 0) / ms.length; const my = ms.reduce((a, s) => a + s.y, 0) / ms.length;
        await page.evaluate(({ mx, my }) => { const v = window.__warsim.view; const c = v.controller.cam; v.controller.set({ cx: c.cx + (mx - innerWidth / 2) / c.scale, cy: c.cy + (my - innerHeight / 2) / c.scale, scale: c.scale }); }, { mx, my });
        best = { hour: h + 2, n: ms.length };
      }
    }
  }
  out.found = best;
  const centre = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return [c.cx, c.cy]; });
  out.centre = centre;
  for (const m of [3000, 1200, 600, 250, 120, 60, 25]) {
    // Re-centre on the nearest plane at each step so the planes stay on screen.
    await lookAt(page, centre[0], centre[1], m, false);
    await page.evaluate(() => window.__warsim.view.draw(performance.now()));
    let ms = await marks();
    if (ms.length > 0 && m <= 600) {
      const p = ms.reduce((a, s) => (Math.hypot(s.x - 800, s.y - 450) < Math.hypot(a.x - 800, a.y - 450) ? s : a), ms[0]);
      await page.evaluate(({ x, y }) => { const v = window.__warsim.view; const c = v.controller.cam; v.controller.set({ cx: c.cx + (x - innerWidth / 2) / c.scale, cy: c.cy + (y - innerHeight / 2) / c.scale, scale: c.scale }); }, p);
      const c2 = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return [c.cx, c.cy]; });
      centre[0] = c2[0]; centre[1] = c2[1];
    }
    for (const l of ['balls', 'classic']) {
      await setLook(l);
      await settle(page, 5000);
      await page.waitForTimeout(250);
      await page.evaluate(() => window.__warsim.view.draw(performance.now()));
      ms = await marks();
      const el = await page.evaluate(() => ({ elementPx: window.__warsim.view.elementPx, mpp: Math.round(window.__warsim.view.metresPerPx) }));
      out.views.push({ m, look: l, ...el, marks: ms, shot: await shot(page, `${tag}_${String(m).padStart(4, '0')}m_${l}.png`) });
    }
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`${tag}.json`, out);
await browser.close();
console.log(JSON.stringify({ ...out, views: out.views.map((v) => `${v.m} ${v.look} marks ${v.marks.length} elPx ${v.elementPx}`) }, null, 1));
