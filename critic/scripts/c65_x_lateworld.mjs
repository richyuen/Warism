// Critic run 65 (new): a game started from a later year of the replay (R68b), by its URL as the card makes it
// (`?scenario=1938h&year=Y&mode=replay|free`), then run at Max for UNTIL years. Every STEP_DAYS: date, "Next" line,
// ticker, war chips, living nations, fps and the longest frame gap; shots of the world, Europe, South-East Asia and
// the Middle East. What does the world of 1960-75 look like, and does it play?
// Usage: node critic/scripts/c65_x_lateworld.mjs <year> <replay|free> <untilYear> [stepDays=91] [W H] [seed]
import { launch, shot, save, lookAt, BASE, CELLS, cellOf } from './c65_lib.mjs';
const year = Number(process.argv[2] ?? 1965), mode = process.argv[3] ?? 'free', until = Number(process.argv[4] ?? year + 2);
const stepDays = Number(process.argv[5] ?? 91), W = Number(process.argv[6] ?? 1600), H = Number(process.argv[7] ?? 900);
const seed = Number(process.argv[8] ?? 4242);
const tag = `${year}${mode}_${seed}`;
const out = { year, mode, until, seed, samples: [] };
const { browser, page, errors } = await launch(W, H);
const name = `c65_lw_${tag}.json`;
try {
  const t0 = Date.now();
  await page.goto(`${BASE}/?scenario=1938h&seed=${seed}&paused=1&year=${year}&mode=${mode}`);
  await page.waitForFunction(() => (window.__warsim?.view?.frames ?? 0) > 0, null, { timeout: 180_000 });
  await page.waitForFunction(() => window.__warsim.hud.stats.value !== null && !document.querySelector('[data-testid=world-building]'), null, { timeout: 180_000 });
  out.msReady = Date.now() - t0;
  await page.waitForTimeout(1500);
  out.url = page.url();
  out.date0 = await page.evaluate(() => document.querySelector('[data-testid=date-label]')?.innerText ?? null);
  await page.evaluate(() => { try { window.__warsim.settings.nukePause.value = false; } catch {} });
  const sea = [1631.0, 525.8];
  const mide = [1251.6, 421.4];
  const shots = async (label) => {
    const r = {};
    await lookAt(page, 1024, 420, 30000, false); r.world = await shot(page, `c65lw_${tag}_${label}_world.png`);
    await lookAt(page, CELLS.berlin[0], CELLS.berlin[1], 5000, false); r.europe = await shot(page, `c65lw_${tag}_${label}_europe.png`);
    await lookAt(page, sea[0], sea[1], 4000, false); r.sea = await shot(page, `c65lw_${tag}_${label}_seasia.png`);
    await lookAt(page, mide[0], mide[1], 4000, false); r.mideast = await shot(page, `c65lw_${tag}_${label}_mideast.png`);
    return r;
  };
  out.start = await shots('s');
  out.start.chips = await page.evaluate(() => [...document.querySelectorAll('[data-testid=war-banner]')].map((c) => c.innerText.replace(/\n/g, ' ')));
  out.start.nations = await page.evaluate(() => window.__warsim.hud.stats.value?.nations?.length ?? null);
  await page.evaluate(() => {
    window.__lw = { gaps: [], last: performance.now(), frames: 0 };
    const f = (t) => { const w = window.__lw; w.gaps.push(t - w.last); w.last = t; w.frames++; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    window.__warsim.hud.setSpeedLevel(99);
  });
  await lookAt(page, 1024, 420, 30000, false);
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
        ticker: [...document.querySelectorAll('[data-testid=ticker-row]')].map((e) => e.innerText.replace(/\n/g, ' ')).slice(0, 8),
        chips: [...document.querySelectorAll('[data-testid=war-banner]')].map((c) => c.innerText.replace(/\n/g, ' ')).slice(0, 12),
        nations: window.__warsim.hud.stats.value?.nations?.length ?? null,
      };
    });
    s.wallS = wall; s.fps = +(s.frames / wall).toFixed(1);
    const y = Number((s.date ?? '').match(/\d{4}/)?.[0] ?? 0);
    const label = String(k).padStart(2, '0');
    if (k % 4 === 3 || y >= until) Object.assign(s, await shots(label));
    await lookAt(page, 1024, 420, 30000, false);
    out.samples.push(s);
    save(name, { ...out, errors });
    console.log(label, s.date, '|', s.fps, s.maxGap, s.wallS, '|', s.chips.slice(0, 4).join(' / '));
    if (y >= until) break;
  }
} catch (e) { out.fatal = String(e?.stack ?? e); out.fatalShot = await shot(page, `c65lw_${tag}_fatal.png`).catch(() => null); out.urlNow = page.url(); }
out.errors = errors;
save(name, out);
await browser.close();
console.log(out.fatal ?? 'ok', errors.slice(0, 5));
