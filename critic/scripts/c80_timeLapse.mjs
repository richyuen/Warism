// Critic run 76 (new): R143b, the borders' time-lapse, as a player meets it. Plain 1938 SEED (heroes on), stepped DAYS;
// History -> Time-lapse. Read: the bar, its steps, the date at step 0 / middle / end; shots at each; the units and
// labels drawn or not; then the hostile acts:
//  (a) Space (the pause key) and the Resume button while it is open: does the game run under it, and what does the map show?
//  (b) a click on the map at step 0 on a cell whose owner then and now differ: which nation's panel opens?
//  (c) the map mode changed while it is open; (d) closed: the map the game's again (cells unlike ownerCopy vs the grid).
//  (e) played from 0: frames timed for 3 s; (f) opened twice; (g) a phone size (W H args).
// Usage: [BASE=...] node critic/scripts/c80_timeLapse.mjs <seed> <days> <tag> [W H]
import { launch, open1938, shot, save, hours } from './c80_lib.mjs';
const seed = Number(process.argv[2] ?? 59941), DAYS = Number(process.argv[3] ?? 400), tag = process.argv[4] ?? 'head';
const W = Number(process.argv[5] ?? 1600), H = Number(process.argv[6] ?? 900);
const out = { seed, DAYS, tag, W, H, notes: [] };
const { browser, page, errors } = await launch(W, H);
const P = `c80tl_${tag}_${seed}_${W}x${H}`;
const state = () => page.evaluate(() => {
  const w = window.__warsim, v = w.view, b = document.querySelector('[data-testid=time-lapse]');
  return { tick: w.hud.tick.value, lastTick: v.lastTick, paused: w.hud.paused.value, lapseOn: v.timeLapseOn, step: b?.getAttribute('data-step') ?? null, steps: b?.getAttribute('data-steps') ?? null, date: document.querySelector('[data-testid=time-lapse-date]')?.textContent ?? null, clock: document.querySelector('[data-testid=date-label]')?.textContent ?? document.querySelector('.clock')?.textContent ?? null, selected: v.selected, panel: document.querySelector('[data-testid=nation-panel] h2, [data-testid=nation-panel] .nation-name')?.textContent ?? null };
});
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, DAYS * 24);
  await page.waitForTimeout(800);
  out.before = await state();
  out.shotNow = await shot(page, `${P}_0now.png`);
  // History, then the time-lapse button.
  await page.evaluate(() => window.__warsim.hud.toggleHistory());
  await page.waitForTimeout(500);
  out.btn = await page.getByTestId('history-timelapse').count();
  out.btnText = out.btn ? await page.getByTestId('history-timelapse').innerText() : null;
  out.btnTitle = out.btn ? await page.getByTestId('history-timelapse').getAttribute('title') : null;
  const t0 = Date.now();
  await page.getByTestId('history-timelapse').click();
  await page.getByTestId('time-lapse').waitFor({ timeout: 30_000 });
  out.openMs = Date.now() - t0;
  await page.waitForTimeout(500);
  out.opened = await state();
  out.shotEnd = await shot(page, `${P}_1end.png`);
  // Step 0 and the middle.
  await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
  await page.waitForTimeout(500);
  out.at0 = await state();
  out.shot0 = await shot(page, `${P}_2step0.png`);
  // (b) a cell owned by another at step 0 than now: find one near the view's middle and click it.
  const diff = await page.evaluate(() => {
    const w = window.__warsim, v = w.view, p = w.hud.timeLapse.value, now = v.ownerCopy();
    const gw = v.geo.w; let best = null;
    for (let k = 0; k < now.length; k++) if (p.map[k] && now[k] && p.map[k] !== now[k]) { best = k; if (Math.random() < 0.001) break; }
    if (best === null) return null;
    const x = best % gw + 0.5, y = Math.floor(best / gw) + 0.5;
    let n = 0; for (let k = 0; k < now.length; k++) if (p.map[k] !== now[k]) n++;
    return { x, y, then: p.map[best], now: now[best], unlike: n };
  });
  out.diff = diff;
  if (diff) {
    await page.evaluate(({ x, y }) => { const v = window.__warsim.view; v.controller.set({ cx: x, cy: y, scale: v.controller.cam.scale }); }, diff);
    await page.waitForTimeout(800);
    out.shotDiff = await shot(page, `${P}_3diffcell.png`);
    await page.mouse.click(W / 2, H / 2);
    await page.waitForTimeout(800);
    out.afterClick = await state();
    out.afterClickNames = await page.evaluate(({ then, now }) => {
      const st = window.__warsim.hud.stats.value; const name = (id) => st?.nations?.find?.((n) => n.id === id)?.name ?? id;
      return { then: name(then), now: name(now), selected: name(window.__warsim.view.selected), panelText: (document.querySelector('[data-testid=nation-panel]')?.textContent ?? '').slice(0, 160) };
    }, diff);
    out.shotClick = await shot(page, `${P}_4click.png`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  // (a) Space while open.
  const tickA = (await state()).tick;
  await page.mouse.move(W / 2, H / 3);
  await page.keyboard.press('Space');
  await page.waitForTimeout(4000);
  out.afterSpace = await state();
  out.ranUnderLapse = out.afterSpace.tick - tickA;
  out.shotSpace = await shot(page, `${P}_5space.png`);
  if (!out.afterSpace.paused) await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  // (c) map mode while open.
  out.modes = await page.evaluate(() => [...(document.querySelectorAll('[data-testid=map-mode] option, select option') ?? [])].map((o) => o.value).slice(0, 12));
  const modeSel = page.locator('select').filter({ has: page.locator('option[value=diplomacy]') }).first();
  if (await modeSel.count()) {
    await modeSel.selectOption('diplomacy').catch((e) => out.notes.push(`mode: ${e.message.slice(0, 80)}`));
    await page.waitForTimeout(800);
    out.shotMode = await shot(page, `${P}_6mode.png`);
    await modeSel.selectOption('political').catch(() => {});
  }
  // (e) played from 0, frames timed.
  await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
  await page.getByTestId('time-lapse-play').click();
  out.play = await page.evaluate(async () => {
    const times = []; const t0 = performance.now();
    while (performance.now() - t0 < 3000) times.push(await new Promise((d) => requestAnimationFrame(d)));
    const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
    return { fps: (times.length - 1) / ((times.at(-1) - times[0]) / 1000), p95: gaps[Math.floor(gaps.length * 0.95)], max: gaps.at(-1), step: window.__warsim.hud.lapseStep.value };
  });
  out.shotPlay = await shot(page, `${P}_7playing.png`);
  // A mid step: half-way.
  await page.evaluate(() => { const h = window.__warsim.hud; h.seekTimeLapse(Math.floor(h.timeLapse.value.steps / 2)); });
  await page.waitForTimeout(500);
  out.mid = await state();
  out.shotMid = await shot(page, `${P}_8mid.png`);
  // (d) closed.
  await page.getByTestId('time-lapse-close').click();
  await page.waitForTimeout(1000);
  out.closed = await state();
  out.shotClosed = await shot(page, `${P}_9closed.png`);
  // (f) opened again, then closed by Escape?
  await page.evaluate(() => window.__warsim.hud.toggleHistory());
  await page.waitForTimeout(400);
  await page.getByTestId('history-timelapse').click();
  await page.getByTestId('time-lapse').waitFor({ timeout: 30_000 });
  out.reopened = await state();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  out.afterEscape = await state();
  await page.getByTestId('time-lapse-close').click().catch(() => {});
  await page.waitForTimeout(300);
  // The game runs on after it, 10 days.
  await hours(page, 240);
  out.after10 = await state();
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`c80_tl_${tag}_${seed}_${W}x${H}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
