// Critic run 55 (new): the frame rate on a heavy fight, not a late world's quiet one. Germany on Poland, 5 days, camera
// on the German formation with most engaged within 6 cells; Max, then x1; at 900, 250, 120, 30 m/px, both looks: the
// browser's frames a second over 4 s (rAF), the view's draws, the p95 gap and the elements in view.
// Usage: node critic/scripts/c55_heavyfps.mjs <seed> <label>
import { launch, open1938, save, shot, lookAt, hours, CELLS } from './c55_lib.mjs';
const [seedS, label] = process.argv.slice(2);
const out = { seed: Number(seedS), label, rows: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, Number(seedS));
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: CELLS.tags.GER, d: CELLS.tags.POL });
  await hours(page, 24 * 5);
  const spot = await page.evaluate(() => {
    const v = window.__warsim.view; const pts = [];
    for (let n = 1; n < 400; n++) { let fs; try { fs = v.formationsOf(n); } catch { continue; } for (const f of fs) if (v.formationEngaged(f)) { const p = v.formationPos(f); if (p) pts.push(p); } }
    let best = null, bn = -1;
    for (const p of pts) { let k = 0; for (const q of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 6) k++; if (k > bn) { bn = k; best = p; } }
    return { best, bn, engaged: pts.length };
  });
  out.spot = spot;
  const measure = () => page.evaluate(async () => {
    const v = window.__warsim.view; const f0 = v.frames; const t0 = performance.now(); let n = 0; let last = t0; const gaps = [];
    await new Promise((done) => { const tick = () => { const now = performance.now(); gaps.push(now - last); last = now; n++; if (now - t0 > 4000) done(); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    gaps.sort((a, b) => a - b);
    const s = (performance.now() - t0) / 1000;
    return { raf: +(n / s).toFixed(1), draws: +((v.frames - f0) / s).toFixed(1), p95: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), worst: Math.round(gaps.at(-1)), el: v.elementCount, ind: v.individualCount };
  });
  for (const speed of [99, 0]) {
    await page.evaluate((sp) => { try { window.__warsim.settings.nukePause.value = false; } catch {} window.__warsim.hud.setSpeedLevel(sp); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); }, speed);
    for (const m of [900, 250, 120, 30]) {
      await lookAt(page, spot.best[0], spot.best[1], m, false);
      await page.waitForTimeout(1200);
      for (const look of ['balls', 'classic']) {
        await page.evaluate((l) => { window.__warsim.view.unitLook = l; }, look);
        await page.waitForTimeout(400);
        out.rows.push({ speed: speed === 99 ? 'max' : 'x1', m, look, ...(await measure()) });
      }
      if (speed === 99) await shot(page, `c55hf_${label}_${seedS}_${m}m.png`);
    }
    await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c55_heavyfps_${label}_${seedS}.json`, out);
await browser.close();
for (const r of out.rows) console.log(JSON.stringify(r));
console.log(JSON.stringify({ spot: out.spot, fatal: out.fatal, errors: out.errors }));
