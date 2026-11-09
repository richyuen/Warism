// Critic run 55 (new): R53p, units glide at Max. A save loaded (or a fresh war), Max, camera on the busiest fight at M m/px.
// Each animation frame for ~4 s: the view's draws, the tick shown, and the drawn screen place of 40 elements
// (prev + (cur − prev) × tickProgress, as the view draws them). Per element the frame-to-frame steps in px: how many
// frames it stood still between moves, the largest step against its median moving step (a hop reads as a big step
// after still frames). Then a strip of 6 shots 50 ms apart.
// Usage: node critic/scripts/c58_glide.mjs <seed> <save.bin|-> <m> <label>
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, save, shot, lookAt, CELLS } from './c58_lib.mjs';
const [seedS, bin, mS, label] = process.argv.slice(2);
const seed = Number(seedS), M = Number(mS ?? 120);
const out = { seed, bin, M, label };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  if (bin && bin !== '-') {
    const bytes = readFileSync(path.resolve(bin));
    await page.route('**/__critic_ck.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
    await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_ck.bin')).arrayBuffer())));
    await page.waitForTimeout(3000);
  } else {
    await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: CELLS.tags.GER, d: CELLS.tags.POL });
  }
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} window.__warsim.hud.setSpeedLevel(99); if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
  await page.waitForTimeout(2500);
  const spot = await page.evaluate(() => {
    const v = window.__warsim.view; const pts = [];
    for (let n = 1; n < 400; n++) { let fs; try { fs = v.formationsOf(n); } catch { continue; } for (const f of fs) if (v.formationEngaged(f) || true) { const p = v.formationPos(f); if (p && v.formationEngaged(f)) pts.push(p); } }
    let best = null, bn = -1;
    for (const p of pts) { let k = 0; for (const q of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 6) k++; if (k > bn) { bn = k; best = p; } }
    return { best, bn, engaged: pts.length };
  });
  out.spot = spot;
  await lookAt(page, spot.best[0], spot.best[1], M, false);
  await page.waitForTimeout(1500);
  out.sample = await page.evaluate(async () => {
    const v = window.__warsim.view;
    const cam = v.controller.cam;
    const ids = [];
    for (let i = 0; i < v.elementCount && ids.length < 40; i++) {
      const sx = (v.elementX[i] - cam.cx) * cam.scale + innerWidth / 2, sy = (v.elementY[i] - cam.cy) * cam.scale + innerHeight / 2;
      if (sx > 0 && sy > 0 && sx < innerWidth && sy < innerHeight) ids.push(v.elementId[i]);
    }
    const tr = new Map(ids.map((id) => [id, []]));
    const frames = [];
    const t0 = performance.now();
    const f0 = v.frames;
    await new Promise((done) => {
      const tick = () => {
        const now = performance.now();
        const t = v.tickProgress(now);
        const idx = new Map();
        for (let i = 0; i < v.elementCount; i++) idx.set(v.elementId[i], i);
        for (const id of ids) {
          const i = idx.get(id);
          if (i === undefined) { tr.get(id).push(null); continue; }
          const x = v.elementPrevX[i] + (v.elementX[i] - v.elementPrevX[i]) * t, y = v.elementPrevY[i] + (v.elementY[i] - v.elementPrevY[i]) * t;
          tr.get(id).push([x * cam.scale, y * cam.scale]);
        }
        frames.push({ dt: now, tick: v.lastTick, t: +t.toFixed(3), draws: v.frames });
        if (now - t0 > 4000) done(); else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const per = [];
    for (const [id, ps] of tr) {
      const steps = [];
      for (let k = 1; k < ps.length; k++) if (ps[k] && ps[k - 1]) steps.push(Math.hypot(ps[k][0] - ps[k - 1][0], ps[k][1] - ps[k - 1][1]));
      const moving = steps.filter((s) => s > 0.05).sort((a, b) => a - b);
      if (moving.length < 3) continue;
      const still = steps.filter((s) => s <= 0.05).length;
      per.push({ id, frames: steps.length, still, moving: moving.length, median: +moving[Math.floor(moving.length / 2)].toFixed(2), max: +moving[moving.length - 1].toFixed(2), total: +steps.reduce((a, b) => a + b, 0).toFixed(1) });
    }
    const ticks = new Set(frames.map((f) => f.tick)).size;
    const gaps = frames.slice(1).map((f, k) => f.dt - frames[k].dt).sort((a, b) => a - b);
    return { rafs: frames.length, draws: v.frames - f0, ticksShown: ticks, gapP50: +gaps[Math.floor(gaps.length / 2)].toFixed(1), gapP95: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), tProgress: frames.slice(0, 30).map((f) => f.t), per };
  });
  const per = out.sample.per;
  out.summary = per.length ? {
    elementsMoving: per.length,
    stillShareMedian: +(per.map((p) => p.still / p.frames).sort((a, b) => a - b)[Math.floor(per.length / 2)]).toFixed(2),
    maxOverMedianMedian: +(per.map((p) => p.max / p.median).sort((a, b) => a - b)[Math.floor(per.length / 2)]).toFixed(2),
    maxOverMedianWorst: +Math.max(...per.map((p) => p.max / p.median)).toFixed(2),
  } : null;
  for (let k = 0; k < 6; k++) { await shot(page, `c58gl_${label}_${seed}_${M}m_${k}.png`); await page.waitForTimeout(50); }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c58_glide_${label}_${seed}_${M}.json`, out);
await browser.close();
console.log(JSON.stringify({ spot: out.spot, summary: out.summary, rafs: out.sample?.rafs, draws: out.sample?.draws, ticks: out.sample?.ticksShown, gap: [out.sample?.gapP50, out.sample?.gapP95], fatal: out.fatal, errors: out.errors }));
