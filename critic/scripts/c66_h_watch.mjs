// Critic run 62 (new): the historical track (1938h) as a player gets it: the title screen by mouse (its card, its form),
// Start, then the page at Max to the track's end and a little after. Every STEP_DAYS: the date, the "Next, ...: ..."
// line under it, the ticker's last rows, the war chips, frames and the longest gap; a world shot and a Europe shot.
// Usage: node critic/scripts/c66_h_watch.mjs [W] [H] [untilYear=1954] [stepDays=91] [tag]
import { launch, shot, save, lookAt, BASE, CELLS } from './c66_lib.mjs';
const W = Number(process.argv[2] ?? 1600), H = Number(process.argv[3] ?? 900);
const until = Number(process.argv[4] ?? 1954), stepDays = Number(process.argv[5] ?? 91), tag = process.argv[6] ?? `${W}x${H}`;
const out = { W, H, samples: [] };
const { browser, page, errors } = await launch(W, H);
const name = `c66_hw_${tag}.json`;
try {
  await page.goto(`${BASE}/`);
  await page.getByTestId('title-screen').waitFor();
  await page.getByTestId('title-scenario-1938').click(); await page.getByTestId('title-mode-replay').click();
  await page.waitForTimeout(800);
  out.titleText = (await page.evaluate(() => document.querySelector('[data-testid=title-screen]').innerText)).slice(0, 1200);
  out.titleShot = await shot(page, `c66hw_${tag}_title.png`);
  await page.getByTestId('settings-new-game').click();
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null, null, { timeout: 120_000 });
  out.url = page.url();
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  await page.waitForTimeout(1500);
  out.startShot = await shot(page, `c66hw_${tag}_start.png`);
  await page.evaluate(() => {
    window.__lw = { gaps: [], last: performance.now(), frames: 0 };
    const f = (t) => { const w = window.__lw; w.gaps.push(t - w.last); w.last = t; w.frames++; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    window.__warsim.hud.setSpeedLevel(99);
  });
  for (let k = 0; ; k++) {
    const tk = await page.evaluate(() => window.__warsim.hud.tick.value);
    await page.evaluate(() => { window.__lw.gaps = []; window.__lw.frames = 0; if (window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    const w0 = Date.now();
    await page.waitForFunction(({ t, d }) => window.__warsim.hud.tick.value >= t + 24 * d || window.__warsim.hud.paused.value, { t: tk, d: stepDays }, { timeout: 900_000, polling: 200 });
    const wall = (Date.now() - w0) / 1000;
    await page.evaluate(() => { if (!window.__warsim.hud.paused.value) window.__warsim.hud.togglePause(); });
    const s = await page.evaluate(() => {
      const g = window.__lw.gaps.slice().sort((a, b) => a - b);
      return {
        tick: window.__warsim.hud.tick.value,
        frames: window.__lw.frames,
        maxGap: Math.round(g[g.length - 1] ?? 0),
        over500: g.filter((x) => x > 500).length,
        date: document.querySelector('[data-testid=date-label]')?.innerText.replace(/\n/g, ' | ') ?? null,
        next: document.querySelector('[data-testid=track-next]')?.innerText ?? null,
        ticker: [...document.querySelectorAll('[data-testid=ticker] > *')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(-6),
        chips: [...document.querySelectorAll('[data-testid=war-banner]')].map((c) => c.innerText.replace(/\n/g, ' ')).slice(0, 12),
        nations: window.__warsim.hud.stats.value?.nations?.length ?? null,
      };
    });
    s.wallS = wall; s.fps = +(s.frames / wall).toFixed(1);
    const year = Number((s.date ?? '').match(/\d{4}/)?.[0] ?? 0);
    const label = String(k).padStart(2, '0');
    await lookAt(page, 1024, 420, 30000, false);
    s.world = await shot(page, `c66hw_${tag}_${label}_world.png`);
    await lookAt(page, CELLS.berlin[0], CELLS.berlin[1], 5000, false);
    s.europe = await shot(page, `c66hw_${tag}_${label}_europe.png`);
    out.samples.push(s);
    save(name, { ...out, errors });
    console.log(label, s.date, '|', s.next, '|', s.fps, s.maxGap, s.wallS);
    if (year >= until) break;
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(name, out);
await browser.close();
console.log(out.fatal ?? 'ok', errors.slice(0, 5));
