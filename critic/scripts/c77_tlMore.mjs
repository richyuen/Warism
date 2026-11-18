// Critic run 76 (new): R143b's time-lapse, the cases the builder's spec does not take.
//  mode "cell <seed> <days>": plain 1938, stepped; time-lapse at step 0; the camera on a cell whose owner then and now
//    differ (the largest such region near Europe); the mouse rested on it (the tooltip) and clicked (the panel): are they
//    the month shown, or now?
//  mode "old <file.bin>": a save of run 75's build (no record) loaded in the page, a month run, then the time-lapse: its
//    first date, steps, and the map at step 0.
//  mode "replay <year>": the replay's start of YEAR (a 1938h game), 60 days run, then the time-lapse: its first date.
// Usage: [BASE=...] node critic/scripts/c77_tlMore.mjs <mode> <arg> [days]
import { readFileSync } from 'node:fs';
import { launch, open1938, shot, save, hours, screenOf, BASE } from './c77_lib.mjs';
const mode = process.argv[2] ?? 'cell', arg = process.argv[3] ?? '59943', DAYS = Number(process.argv[4] ?? 400);
const out = { mode, arg, DAYS, notes: [] };
const { browser, page, errors } = await launch(1600, 900);
const P = `c77tm_${mode}_${String(arg).replace(/[^0-9a-z]/gi, '')}`;
const lapse = () => page.evaluate(() => { const b = document.querySelector('[data-testid=time-lapse]'); return { step: b?.getAttribute('data-step'), steps: b?.getAttribute('data-steps'), date: document.querySelector('[data-testid=time-lapse-date]')?.textContent, clock: document.querySelector('[data-testid=clock], .clock')?.textContent ?? null, tick: window.__warsim.hud.tick.value, ticks0: window.__warsim.hud.timeLapse.value ? [...window.__warsim.hud.timeLapse.value.data.ticks.slice(0, 3)] : null }; });
async function openLapse() {
  await page.evaluate(() => { if (!window.__warsim.hud.showHistory.value) window.__warsim.hud.toggleHistory(); });
  await page.waitForTimeout(600);
  out.btn = await page.getByTestId('history-timelapse').count();
  if (!out.btn) return false;
  await page.getByTestId('history-timelapse').click();
  await page.getByTestId('time-lapse').waitFor({ timeout: 30_000 });
  await page.waitForTimeout(500);
  return true;
}
try {
  if (mode === 'cell') {
    await open1938(page, Number(arg), '&heroes=on');
    await hours(page, DAYS * 24);
    await page.waitForTimeout(800);
    await openLapse();
    await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
    await page.waitForTimeout(400);
    out.at0 = await lapse();
    // The changed cells; pick the one with most changed neighbours (a region's middle), names of then and now.
    const pick = await page.evaluate(() => {
      const w = window.__warsim, v = w.view, p = w.hud.timeLapse.value, now = v.ownerCopy(), gw = v.geo.w, gh = now.length / gw;
      let best = null, bestN = -1;
      for (let y = 4; y < gh - 4; y += 2) for (let x = 4; x < gw - 4; x += 2) {
        const k = y * gw + x; if (!(p.map[k] && now[k] && p.map[k] !== now[k])) continue;
        let n = 0; for (let dy = -4; dy <= 4; dy += 2) for (let dx = -4; dx <= 4; dx += 2) { const j = k + dy * gw + dx; if (p.map[j] === p.map[k] && now[j] === now[k]) n++; }
        if (n > bestN) { bestN = n; best = { x: x + 0.5, y: y + 0.5, then: p.map[k], now: now[k] }; }
      }
      const st = w.hud.stats.value; const nm = (id) => (st.nations.find((n) => n.id === id)?.name ?? `#${id}`);
      return best && { ...best, thenName: nm(best.then), nowName: nm(best.now), around: bestN };
    });
    out.pick = pick;
    if (pick) {
      await page.evaluate(({ x, y }) => { const v = window.__warsim.view; const c = v.controller.cam; v.controller.set({ cx: x, cy: y, scale: c.scale * 3 }); }, pick);
      await page.waitForTimeout(1200);
      const [sx, sy] = await screenOf(page, pick.x, pick.y);
      out.screen = [sx, sy];
      await page.mouse.move(sx, sy);
      await page.mouse.move(sx + 1, sy + 1);
      await page.waitForTimeout(1500);
      out.tooltip = await page.evaluate(() => [...document.querySelectorAll('[data-testid=map-tooltip], .map-tooltip, .tooltip')].map((e) => e.innerText).join(' | '));
      out.shotHover = await shot(page, `${P}_hover.png`);
      await page.mouse.click(sx, sy);
      await page.waitForTimeout(1000);
      out.selected = await page.evaluate(() => { const w = window.__warsim; const id = w.view.selected; return { id, name: w.hud.stats.value.nations.find((n) => n.id === id)?.name ?? null, panel: (document.querySelector('[data-testid=nation-panel]')?.innerText ?? '').slice(0, 120) }; });
      out.shotClick = await shot(page, `${P}_click.png`);
    }
  } else if (mode === 'old') {
    const bytes = readFileSync(arg);
    await page.route('**/__critic_old.bin', (r) => r.fulfill({ status: 200, body: bytes, contentType: 'application/octet-stream' }));
    await open1938(page, 7019);
    await page.evaluate(async () => window.__warsim.sim.load(new Uint8Array(await (await fetch('/__critic_old.bin')).arrayBuffer())));
    await page.waitForTimeout(3000);
    out.loadedTick = await page.evaluate(() => window.__warsim.hud.tick.value);
    await hours(page, 24 * DAYS);
    await openLapse();
    out.atEnd = await lapse();
    out.shotEnd = await shot(page, `${P}_end.png`);
    await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
    await page.waitForTimeout(500);
    out.at0 = await lapse();
    out.shot0 = await shot(page, `${P}_step0.png`);
    // Played from 0: the frames for 4 s; then the middle step's picture.
    await page.getByTestId('time-lapse-play').click();
    out.play = await page.evaluate(async () => {
      const times = []; const t0 = performance.now();
      while (performance.now() - t0 < 4000) times.push(await new Promise((d) => requestAnimationFrame(d)));
      const gaps = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
      return { fps: (times.length - 1) / ((times.at(-1) - times[0]) / 1000), p95: gaps[Math.floor(gaps.length * 0.95)], max: gaps.at(-1), step: window.__warsim.hud.lapseStep.value };
    });
    await page.getByTestId('time-lapse-play').click();
    for (const f of [0.25, 0.5, 0.75]) {
      await page.evaluate((f) => { const h = window.__warsim.hud; h.seekTimeLapse(Math.floor(h.timeLapse.value.steps * f)); }, f);
      await page.waitForTimeout(600);
      out[`at${f}`] = await lapse();
      out[`shot${f}`] = await shot(page, `${P}_at${Math.round(f * 100)}.png`);
    }
  } else if (mode === 'replay' || mode === 'random' || mode === 'toy') {
    await page.goto(mode === 'replay' ? `${BASE}/?scenario=1938h&seed=1938&paused=1&year=${arg}&mode=replay` : `${BASE}/?scenario=${mode}&seed=${arg}&paused=1`);
    await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0 && window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
    await page.waitForTimeout(1500);
    await hours(page, 24 * DAYS);
    await openLapse();
    out.atEnd = await lapse();
    await page.evaluate(() => window.__warsim.hud.seekTimeLapse(0));
    await page.waitForTimeout(500);
    out.at0 = await lapse();
    out.shot0 = await shot(page, `${P}_step0.png`);
  }
} catch (e) {
  out.error = String(e).slice(0, 400);
  await shot(page, `${P}_error.png`).catch(() => {});
}
out.errors = errors;
save(`${P}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
