// Critic run 61 (new): the frame rate where the most individual figures are drawn (the goal: >= 30 fps at tactical zoom
// with 10,000+ sprites). As c68_z_zoom: 1938 SEED, Germany at war with Poland, 4 days, the camera on an engaged German
// infantry division; at each of 28, 18 and 12 m/px, running at speed x1 then at Max, 8 s of rAF frames each.
// Usage: node critic/scripts/c68_x_indfps.mjs <seed>
import { launch, open1938, lookAt, shot, save, hours, CELLS } from './c68_lib.mjs';
const seed = Number(process.argv[2] ?? 32111);
const T = CELLS.tags;
const out = { seed, rows: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T.GER, d: T.POL });
  await hours(page, 24 * 4);
  const f = await page.evaluate((n) => { const v = window.__warsim.view; return v.formationsOf(n).map((f) => ({ f, pos: v.formationPos(f), e: v.formationEngaged(f), t: v.formationTitle(f) })).filter((x) => x.e && /Infantry/.test(JSON.stringify(x.t)))[0]; }, T.GER);
  out.f = f;
  for (const m of [28, 18, 12]) {
    for (const lvl of [0, 99]) {
      await lookAt(page, f.pos[0], f.pos[1], m);
      await page.evaluate((lvl) => { const h = window.__warsim.hud; h.setSpeedLevel(lvl); if (h.paused.value) h.togglePause(); }, lvl);
      await page.waitForTimeout(1000);
      const r = await page.evaluate(async () => {
        const fr = []; let last = performance.now(); let maxInd = 0; let maxEl = 0;
        await new Promise((done) => { const t0 = performance.now(); const f = (t) => { fr.push(t - last); last = t; const v = window.__warsim.view; maxInd = Math.max(maxInd, v.individualCount); maxEl = Math.max(maxEl, v.elementCount); if (t - t0 < 8000) requestAnimationFrame(f); else done(); }; requestAnimationFrame(f); });
        fr.shift(); const s = [...fr].sort((a, b) => a - b);
        return { fps: +(1000 * fr.length / fr.reduce((a, b) => a + b, 0)).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), worst: +s.at(-1).toFixed(0), ind: maxInd, el: maxEl, mpp: Math.round(window.__warsim.view.metresPerPx) };
      });
      await page.evaluate(() => { const h = window.__warsim.hud; if (!h.paused.value) h.togglePause(); });
      r.speed = lvl === 0 ? 'x1' : 'Max';
      r.shot = await shot(page, `c68xi_${seed}_${m}m_${r.speed}.png`);
      out.rows.push(r); console.log(JSON.stringify(r));
    }
  }
} catch (e) { out.fail = String(e).slice(0, 400); console.log(out.fail); }
finally { out.errors = errors; save(`c68_xi_${seed}.json`, out); await browser.close(); }
