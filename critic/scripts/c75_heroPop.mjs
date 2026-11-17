// Critic run 74 (new): R124's step of a hero's counter, chosen anew each frame against the nations' counters: does a
// hero's counter jump while the game runs or the camera moves? Plain 1938 SEED with heroes, stepped to DAY; the camera
// over Europe (cell 1090,300).
//  (1) play: 6,000 m/px, the camera still, STEPS steps of 6 h: a jump = a hero's counter moved over 12 px between two
//      steps while its own place (world to screen) moved under 3 px.
//  (2) zoom: 9,000 -> 4,000 m/px in 120 frames, paused: the times a hero's offset from its place changed by over 12 px
//      from a frame to the next (the offset in px, the camera's own scaling taken out).
//  (3) pan: 6,000 m/px, 120 frames of 4 px east, paused: the same.
// Run on HEAD's build and run 73's (BASE). Usage: node critic/scripts/c75_heroPop.mjs <seed> <day> <tag> [STEPS=120]
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, open1938, shot, save, hours, lookAt, SHOTS } from './c75_lib.mjs';
const seed = Number(process.argv[2] ?? 56901), DAY = Number(process.argv[3] ?? 400), tag = process.argv[4] ?? 'head';
const STEPS = Number(process.argv[5] ?? 120);
const out = { seed, DAY, tag };
const { browser, page, errors } = await launch(1600, 900);
const heroes = () => page.evaluate(() => {
  const v = window.__warsim.view;
  v.draw(performance.now());
  return v.counters.drawn.filter((d) => String(d.key).startsWith('hero:')).map((d) => ({ key: d.key, text: d.text, x: d.x, y: d.y, wx: d.wx, wy: d.wy }));
});
const anchor = (list) => page.evaluate((list) => {
  const v = window.__warsim.view; const c = v.controller.cam;
  return list.map((h) => { const p = v.worldToScreen ? v.worldToScreen(h.wx, h.wy) : null; return p; });
}, list);
const count = (frames, moved) => {
  // frames: [{key -> {x, y, ax, ay}}]; a jump: the offset (x - ax, y - ay) changed by over 12 px.
  let jumps = 0; const by = {}; const at = [];
  for (let i = 1; i < frames.length; i++) {
    for (const k of Object.keys(frames[i])) {
      const a = frames[i - 1][k], b = frames[i][k];
      if (!a || !b) continue;
      const d = Math.hypot(b.x - b.ax - (a.x - a.ax), b.y - b.ay - (a.y - a.ay));
      if (d > 12 && moved(a, b)) { jumps++; by[k] = (by[k] ?? 0) + 1; at.push({ i, k, text: b.text, px: Math.round(d), from: [Math.round(a.x - a.ax), Math.round(a.y - a.ay)], to: [Math.round(b.x - b.ax), Math.round(b.y - b.ay)] }); }
    }
  }
  return { jumps, by, at };
};
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAY * 24);
  await page.waitForTimeout(1500);
  const frame = async () => {
    const hs = await heroes();
    const cam = await page.evaluate(() => { const c = window.__warsim.view.controller.cam; return { cx: c.cx, cy: c.cy, scale: c.scale }; });
    const f = {};
    // The hero's place on the screen by the camera: (wx - cx) * scale + vw / 2 (cells to px).
    for (const h of hs) f[h.key] = { x: h.x, y: h.y, ax: (h.wx - cam.cx) * cam.scale + 800, ay: (h.wy - cam.cy) * cam.scale + 450, text: h.text };
    return f;
  };
  // (5) WHEEL=1: only this. The zoom as a player makes it: the mouse over Europe, wheel notches in (9,000 m/px to
  // 4,000) and out again, a notch each 120 ms; every drawn frame's hero counters (requestAnimationFrame); a leap as in
  // (2), counted over the frames and per notch.
  if (process.env.WHEEL) {
    await lookAt(page, 1090, 300, 9000);
    await page.mouse.move(800, 450);
    await page.evaluate(() => {
      const v = window.__warsim.view; window.__c75f = []; window.__c75stop = false;
      const f = () => { const c = v.controller.cam; const o = {}; for (const d of v.counters.drawn) if (String(d.key).startsWith('hero:')) o[d.key] = { x: d.x, y: d.y, ax: (d.wx - c.cx) * c.scale + 800, ay: (d.wy - c.cy) * c.scale + 450, text: d.text }; window.__c75f.push({ mpp: v.metresPerPx, o }); if (!window.__c75stop) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    const mpp = () => page.evaluate(() => window.__warsim.view.metresPerPx);
    let notches = 0;
    const m0 = await mpp();
    for (let i = 0; i < 80 && (await mpp()) > 4000; i++) { await page.mouse.wheel(0, -100); notches++; await page.waitForTimeout(120); }
    await page.waitForTimeout(600);
    const mIn = await mpp();
    const inFrames = await page.evaluate(() => window.__c75f.length);
    for (let i = 0; i < 80 && (await mpp()) < 9000; i++) { await page.mouse.wheel(0, 100); notches++; await page.waitForTimeout(120); }
    await page.waitForTimeout(600);
    const fr = await page.evaluate(() => { window.__c75stop = true; return window.__c75f; });
    out.wheel = count(fr.map((f) => f.o), () => true);
    out.wheelNotches = notches; out.wheelFrames = fr.length;
    const names = {}; for (const j of out.wheel.at) names[j.text] = (names[j.text] ?? 0) + 1;
    console.log(`${tag} seed ${seed} day ${DAY} wheel: ${m0.toFixed(0)} -> ${mIn.toFixed(0)} -> ${(await mpp()).toFixed(0)} m/px in ${notches} notches, ${fr.length} frames (${inFrames} zooming in): leaps ${out.wheel.jumps} ${JSON.stringify(names)}; sizes px ${JSON.stringify(out.wheel.at.slice(0, 12).map((j) => j.px))}`);
    out.errors = errors;
    save(`c75_hpw_${tag}_${seed}_d${DAY}.json`, out);
    await browser.close();
    process.exit(0);
  }
  // (1) play
  await lookAt(page, 1090, 300, 6000);
  let frames = [await frame()];
  for (let i = 0; i < STEPS; i++) { await hours(page, 6); await page.waitForTimeout(120); frames.push(await frame()); }
  out.play = count(frames, (a, b) => Math.hypot(b.ax - a.ax, b.ay - a.ay) < 3);
  out.playNames = Object.fromEntries(Object.entries(out.play.by).map(([k, n]) => [frames[frames.length - 1][k]?.text ?? k, n]));
  console.log(`${tag} seed ${seed} day ${DAY} play ${STEPS} x 6 h at 6,000 m/px: heroes ${Object.keys(frames[0]).length}, jumps ${out.play.jumps} ${JSON.stringify(out.playNames)}`);
  out.shotPlay = await shot(page, `c75hp_${tag}_${seed}_d${DAY}_play_end.png`);
  // (2) zoom
  frames = [];
  const pics = [];
  for (let i = 0; i <= 120; i++) { await lookAt(page, 1090, 300, 9000 - (5000 * i) / 120, false).catch(() => {}); frames.push(await frame()); pics.push(await page.screenshot()); }
  out.zoom = count(frames, () => true);
  // The frames about the first three jumps, kept.
  for (const j of out.zoom.at.slice(0, 3)) { writeFileSync(path.join(SHOTS, `c75hp_${tag}_${seed}_zoom_f${j.i - 1}.png`), pics[j.i - 1]); writeFileSync(path.join(SHOTS, `c75hp_${tag}_${seed}_zoom_f${j.i}.png`), pics[j.i]); }
  console.log(`${tag} zoom jumps at ${JSON.stringify(out.zoom.at.slice(0, 12))}`);
  console.log(`${tag} zoom 9,000 -> 4,000 m/px in 120 frames: jumps ${out.zoom.jumps} ${JSON.stringify(out.zoom.by)}`);
  // (3) pan
  frames = [];
  for (let i = 0; i <= 120; i++) {
    await page.evaluate((i) => { const v = window.__warsim.view; const c = v.controller.cam; v.controller.set({ cx: 1070 + (i * 4) / c.scale, cy: 300, scale: c.scale }); }, i);
    frames.push(await frame());
  }
  out.pan = count(frames, () => true);
  console.log(`${tag} pan 480 px east at the last zoom in 120 frames: jumps ${out.pan.jumps} ${JSON.stringify(out.pan.by)}`);
  // (4) the game running as a player has it (Resume, the speed as loaded), the camera still at 6,000 m/px, 20 s:
  // each drawn frame's hero counters; a jump as in (1).
  await lookAt(page, 1090, 300, 6000);
  await page.evaluate(() => {
    const v = window.__warsim.view; window.__c75f = [];
    const f = () => { const c = v.controller.cam; const o = {}; for (const d of v.counters.drawn) if (String(d.key).startsWith('hero:')) o[d.key] = { x: d.x, y: d.y, ax: (d.wx - c.cx) * c.scale + 800, ay: (d.wy - c.cy) * c.scale + 450, text: d.text }; window.__c75f.push({ t: performance.now(), tick: v.lastTick, o }); if (window.__c75f.length < 100000 && !window.__c75stop) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  const speed = await page.getByTestId('speed-label').innerText().catch(() => null);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.waitForTimeout(20000);
  const live = await page.evaluate(() => { window.__c75stop = true; return window.__c75f; });
  await page.getByRole('button', { name: 'Pause', exact: true }).click().catch(() => {});
  out.live = count(live.map((f) => f.o), (a, b) => Math.hypot(b.ax - a.ax, b.ay - a.ay) < 3);
  out.liveFrames = live.length; out.liveDays = (live[live.length - 1].tick - live[0].tick) / 24;
  out.liveNames = {}; for (const j of out.live.at) out.liveNames[j.text] = (out.liveNames[j.text] ?? 0) + 1;
  console.log(`${tag} running 20 s (${speed}): ${live.length} frames, ${out.liveDays.toFixed(1)} days: jumps ${out.live.jumps} ${JSON.stringify(out.liveNames)}; sizes px ${JSON.stringify(out.live.at.slice(0, 10).map((j) => j.px))}`);
  out.shotLive = await shot(page, `c75hp_${tag}_${seed}_d${DAY}_live_end.png`);
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
save(`c75_hp_${tag}_${seed}_d${DAY}.json`, out);
await browser.close();
