// Critic run 75 (new): R125's far rule (from 1,200 m/px out) and R131's hero markers at T1: does a marker leap or pop
// while the wheel is turned through T1 (2,000 -> 700 m/px and back), and what do the frames cost about 1,200 m/px?
// Plain 1938 SEED with heroes, stepped to DAY, paused; the camera at CX,CY (cells). Every drawn frame
// (requestAnimationFrame): each shown marker's offset from its formation's place on the screen. A leap: the offset
// changed by over PX px (default 12) between two frames under 60 ms apart. A pop: its own opacity changed by over 0.6
// in one frame. Heroes: the markers wider than the commonest width.
// Then the same with the game running at the loaded speed for 15 s at 1,800 m/px and at 1,150 m/px, the camera still.
// Usage: BASE=... node critic/scripts/c80_markerPop.mjs <seed> <day> <tag> <cx,cy> [W H]
import { launch, open1938, shot, save, hours, lookAt } from './c80_lib.mjs';
const seed = Number(process.argv[2] ?? 56951), DAY = Number(process.argv[3] ?? 30), tag = process.argv[4] ?? 'head';
const [cx, cy] = (process.argv[5] ?? '1675,372').split(',').map(Number);
const W = Number(process.argv[6] ?? 1600), H = Number(process.argv[7] ?? 900);
const PX = Number(process.env.PX ?? 12);
const out = { seed, DAY, tag, cx, cy, W, H };
const { browser, page, errors } = await launch(W, H);
const startCapture = () => page.evaluate(() => {
  const v = window.__warsim.view; window.__c80f = []; window.__c80stop = false;
  const f = () => {
    const c = v.controller.cam; const o = {};
    const vw = window.innerWidth, vh = window.innerHeight;
    for (const r of v.markerRects) {
      if (r.x + r.w < 0 || r.y + r.h < 0 || r.x > vw || r.y > vh) continue;
      const ax = (r.wx - c.cx) * c.scale + vw / 2, ay = (r.wy - c.cy) * c.scale + vh / 2;
      const dx = r.x + r.w / 2 - ax, dy = r.y + r.h / 2 - ay;
      if (Math.abs(dx) > 200) continue; // another copy of the world
      o[r.id] = [Math.round(dx * 10) / 10, Math.round(dy * 10) / 10, Math.round(r.own * 100) / 100, Math.round(r.w), Math.round(r.alpha * 100) / 100];
    }
    window.__c80f.push({ t: performance.now(), mpp: v.metresPerPx, tick: v.lastTick, o });
    if (!window.__c80stop && window.__c80f.length < 20000) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
});
const stopCapture = () => page.evaluate(() => { window.__c80stop = true; return window.__c80f; });
const analyse = (fr) => {
  const widths = {}; for (const f of fr) for (const v of Object.values(f.o)) widths[v[3]] = (widths[v[3]] ?? 0) + 1;
  // Hero markers: wider than the regular box at the same frame (the commonest width of the frame).
  let leaps = 0, heroLeaps = 0, pops = 0, maxHero = 0, maxReg = 0; const at = []; const dts = []; let cross = [];
  for (let i = 1; i < fr.length; i++) {
    const a = fr[i - 1], b = fr[i]; const dt = b.t - a.t; dts.push(dt);
    if ((a.mpp - 1200) * (b.mpp - 1200) < 0) cross.push({ i, dt: Math.round(dt), from: Math.round(a.mpp), to: Math.round(b.mpp) });
    const cw = {}; for (const v of Object.values(b.o)) cw[v[3]] = (cw[v[3]] ?? 0) + 1;
    const common = Number(Object.entries(cw).sort((x, y) => y[1] - x[1])[0]?.[0] ?? 0);
    for (const k of Object.keys(b.o)) {
      const p = a.o[k], q = b.o[k]; if (!p || !q) continue;
      if (q[4] < 0.3 && p[4] < 0.3) continue;
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const hero = q[3] > common * 1.15;
      if (hero) maxHero = Math.max(maxHero, d); else maxReg = Math.max(maxReg, d);
      if (d > PX && dt < 60) { leaps++; if (hero) heroLeaps++; if (at.length < 14) at.push({ i, id: k, hero, px: Math.round(d), mpp: Math.round(b.mpp), from: [p[0], p[1]], to: [q[0], q[1]] }); }
      if (Math.abs(q[2] - p[2]) > 0.6 && dt < 60) pops++;
    }
  }
  // Markers that appear or vanish at full opacity from one frame to the next (not at the screen's edge: the offset filter keeps copies out only).
  dts.sort((x, y) => x - y);
  const q = (p) => Math.round(dts[Math.min(dts.length - 1, Math.floor(p * dts.length))] * 10) / 10;
  return { frames: fr.length, leaps, heroLeaps, pops, maxHero: Math.round(maxHero * 10) / 10, maxReg: Math.round(maxReg * 10) / 10, dt: { p50: q(0.5), p95: q(0.95), max: q(1) }, cross, at };
};
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAY * 24);
  await page.waitForTimeout(1500);
  await lookAt(page, cx, cy, 2000);
  await page.mouse.move(W / 2, H / 2);
  const mpp = () => page.evaluate(() => window.__warsim.view.metresPerPx);
  // (1) the wheel, in and out, a notch each 150 ms.
  await startCapture();
  let notches = 0; const m0 = await mpp();
  for (let i = 0; i < 60 && (await mpp()) > 700; i++) { await page.mouse.wheel(0, -100); notches++; await page.waitForTimeout(150); }
  await page.waitForTimeout(700);
  const mIn = await mpp();
  for (let i = 0; i < 60 && (await mpp()) < 1950; i++) { await page.mouse.wheel(0, 100); notches++; await page.waitForTimeout(150); }
  await page.waitForTimeout(700);
  let fr = await stopCapture();
  out.wheel = analyse(fr);
  console.log(`${tag} seed ${seed} day ${DAY} at ${cx},${cy} wheel ${m0.toFixed(0)} -> ${mIn.toFixed(0)} -> ${(await mpp()).toFixed(0)} m/px, ${notches} notches, ${out.wheel.frames} frames: leaps ${out.wheel.leaps} (heroes ${out.wheel.heroLeaps}), pops ${out.wheel.pops}, largest move a frame hero ${out.wheel.maxHero} px, other ${out.wheel.maxReg} px; frame ms p50 ${out.wheel.dt.p50} p95 ${out.wheel.dt.p95} max ${out.wheel.dt.max}; crossings of 1,200 ${JSON.stringify(out.wheel.cross)}`);
  console.log(`${tag} first leaps ${JSON.stringify(out.wheel.at)}`);
  // (2) a slow glide across 1,200: 1,300 -> 1,100 m/px in 90 set frames, a shot each side.
  await lookAt(page, cx, cy, 1300);
  await page.waitForTimeout(500);
  out.shotFar = await shot(page, `c80mp_${tag}_${seed}_d${DAY}_1300.png`);
  await startCapture();
  for (let i = 0; i <= 90; i++) { await page.evaluate(({ cx, cy, m }) => { const v = window.__warsim.view; v.controller.set({ cx, cy, scale: (v.metresPerPx * v.controller.cam.scale) / m }); }, { cx, cy, m: 1300 - (200 * i) / 90 }); await page.waitForTimeout(34); }
  await page.waitForTimeout(700);
  fr = await stopCapture();
  out.glide = analyse(fr);
  out.shotNear = await shot(page, `c80mp_${tag}_${seed}_d${DAY}_1100.png`);
  console.log(`${tag} glide 1,300 -> 1,100 m/px, ${out.glide.frames} frames: leaps ${out.glide.leaps} (heroes ${out.glide.heroLeaps}), pops ${out.glide.pops}, largest move a frame hero ${out.glide.maxHero} px, other ${out.glide.maxReg} px; frame ms p50 ${out.glide.dt.p50} p95 ${out.glide.dt.p95} max ${out.glide.dt.max}`);
  // (3) running, the camera still, 15 s each at 1,800 and 1,150 m/px.
  for (const m of [1800, 1150]) {
    await lookAt(page, cx, cy, m);
    await startCapture();
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    await page.waitForTimeout(15000);
    fr = await stopCapture();
    await page.getByRole('button', { name: 'Pause', exact: true }).click().catch(() => {});
    const a = analyse(fr);
    out[`live${m}`] = a; out[`liveDays${m}`] = (fr[fr.length - 1].tick - fr[0].tick) / 24;
    console.log(`${tag} running 15 s at ${m} m/px (${out[`liveDays${m}`].toFixed(1)} days), ${a.frames} frames: leaps ${a.leaps} (heroes ${a.heroLeaps}), pops ${a.pops}, largest move a frame hero ${a.maxHero} px, other ${a.maxReg} px; frame ms p50 ${a.dt.p50} p95 ${a.dt.p95} max ${a.dt.max}`);
    out[`shotLive${m}`] = await shot(page, `c80mp_${tag}_${seed}_d${DAY}_live_${m}.png`);
  }
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
save(`c80_mp_${tag}_${seed}_d${DAY}_${W}x${H}.json`, out);
await browser.close();
