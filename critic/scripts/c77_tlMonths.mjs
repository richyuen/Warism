// Critic run 76 (new): R143b's time-lapse at months other than 1 January (the builder's spec checks only those). Plain
// 1938 SEED: the page's own map an hour after the first of several months is kept; stepped on to END days; the
// time-lapse opened and each month's step compared with the kept map, cell for cell. Also a page save and load in
// mid-month before the end (the record must come back whole).
// Usage: [BASE=...] node critic/scripts/c77_tlMonths.mjs <seed> [endDays]
import { launch, open1938, save } from './c77_lib.mjs';
const seed = Number(process.argv[2] ?? 59947), END = Number(process.argv[3] ?? 500);
const out = { seed, END, months: [] };
const { browser, page, errors } = await launch(1600, 900);
// Day of year of the first of: Jul, Oct 1938; Mar, Aug 1939 (from 1 Jan 1938).
const firsts = [181, 273, 424, 577].filter((d) => d < END - 20);
const stepTo = (t) => page.evaluate(async (t) => { const w = window.__warsim; await w.sim.step(t - w.hud.tick.value); const t0 = performance.now(); while ((w.view.lastTick ?? -1) < t && performance.now() - t0 < 600000) await new Promise((d) => setTimeout(d, 20)); }, t);
try {
  await open1938(page, seed);
  for (const [i, d] of firsts.entries()) {
    await stepTo(d * 24 + 1);
    await page.evaluate((i) => ((window.__kept ??= [])[i] = window.__warsim.view.ownerCopy()), i);
  }
  // A save and a load in mid-month (the 15th after the last kept first).
  await stepTo((firsts.at(-1) + 14) * 24 + 7);
  out.saveLoad = await page.evaluate(async () => {
    const w = window.__warsim; const t = w.hud.tick.value;
    if (typeof w.sim.save !== 'function') return 'no sim.save';
    const bytes = await w.sim.save(); await w.sim.load(bytes);
    const t0 = performance.now(); while (w.hud.tick.value !== t && performance.now() - t0 < 30000) await new Promise((d) => setTimeout(d, 50));
    return { tick: t, after: w.hud.tick.value, bytes: bytes.length ?? bytes.byteLength };
  });
  await stepTo(END * 24);
  await page.waitForTimeout(800);
  await page.evaluate(() => window.__warsim.hud.toggleHistory());
  await page.getByTestId('history-timelapse').click();
  await page.getByTestId('time-lapse').waitFor({ timeout: 30_000 });
  for (const [i, d] of firsts.entries()) {
    const r = await page.evaluate(({ i, t }) => {
      const hud = window.__warsim.hud, p = hud.timeLapse.value;
      const s = p.stepAt(t); hud.seekTimeLapse(s);
      const then = window.__kept[i]; let n = 0; for (let k = 0; k < then.length; k++) if (then[k] !== p.map[k]) n++;
      return { day: t / 24, step: s, stepTick: p.tick, unlike: n, date: document.querySelector('[data-testid=time-lapse-date]')?.textContent };
    }, { i, t: d * 24 });
    out.months.push(r);
  }
} catch (e) { out.error = String(e).slice(0, 300); }
out.errors = errors;
save(`c77_tlMonths_${seed}.json`, out);
console.log(JSON.stringify(out, null, 1));
await browser.close();
