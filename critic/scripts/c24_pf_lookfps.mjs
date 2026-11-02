// Critic run 22, PF: frame rate of the countryballs against Classic, alternating, on a busy late world (7019 y20 save
// made on HEAD), running at Max, at 3000, 1200, 600, 120 and 30 m/px over the busiest land fight. Three pairs per
// zoom, 4 s each, look order alternated so drift falls on both.
// Usage: node critic/scripts/c24_pf_lookfps.mjs <seed> <save.bin>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, save, shot, lookAt } from './c24_lib.mjs';
const [seedS, bin] = process.argv.slice(2);
const out = { seed: Number(seedS), bin, rows: [] };
const { browser, page, errors } = await launch();
try {
  const bytes = readFileSync(path.resolve(bin));
  await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
  await open1938(page, Number(seedS));
  await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
  await page.waitForTimeout(3000);
  // busiest fight: the engaged formation with most engaged neighbours
  const spot = await page.evaluate(() => {
    const v = window.__warsim.view; const pts = [];
    for (let n = 1; n < 400; n++) { let fs; try { fs = v.formationsOf(n); } catch { continue; } for (const f of fs) if (v.formationEngaged(f)) { const p = v.formationPos(f); if (p) pts.push(p); } }
    let best = null, bn = -1;
    for (const p of pts) { let k = 0; for (const q of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 6) k++; if (k > bn) { bn = k; best = p; } }
    return { best, bn, engaged: pts.length };
  });
  out.spot = spot;
  await page.evaluate(() => { window.__warsim.hud.setSpeedLevel(99); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  const measure = () => page.evaluate(async () => {
    const v = window.__warsim.view; const f0 = v.frames; const t0 = performance.now(); let worst = 0; let last = t0; const gaps = [];
    await new Promise((done) => { const tick = () => { const n = performance.now(); const g = n - last; gaps.push(g); worst = Math.max(worst, g); last = n; if (n - t0 > 4000) done(); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    gaps.sort((a, b) => a - b);
    return { fps: +(((v.frames - f0) * 1000) / (performance.now() - t0)).toFixed(1), p95: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), worst: Math.round(worst), el: v.elementCount };
  });
  for (const m of [3000, 1200, 600, 120, 30]) {
    await lookAt(page, spot.best[0], spot.best[1], m, false);
    await page.waitForTimeout(1500);
    for (let k = 0; k < 3; k++) {
      for (const l of k % 2 ? ['classic', 'balls'] : ['balls', 'classic']) {
        await page.evaluate((l) => { window.__warsim.view.unitLook = l; }, l);
        await page.waitForTimeout(500);
        out.rows.push({ m, look: l, k, ...(await measure()) });
      }
    }
    await shot(page, `c24pf_${seedS}_${m}m.png`);
  }
  await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); window.__warsim.view.unitLook = 'balls'; });
  const agg = {};
  for (const r of out.rows) { const a = (agg[`${r.m}_${r.look}`] ??= { fps: [], p95: [], worst: [] }); a.fps.push(r.fps); a.p95.push(r.p95); a.worst.push(r.worst); }
  out.agg = Object.fromEntries(Object.entries(agg).map(([k, a]) => [k, { fps: a.fps, meanFps: +(a.fps.reduce((s, x) => s + x, 0) / a.fps.length).toFixed(1), p95: a.p95, worst: Math.max(...a.worst) }]));
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c24_pf_${seedS}.json`, out);
await browser.close();
console.log(JSON.stringify({ spot: out.spot, agg: out.agg, fatal: out.fatal, errors: out.errors }, null, 1));
