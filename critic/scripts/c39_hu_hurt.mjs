// Critic run 22, HU: the countryballs' losses (PLAN 7.178) at a real front. German-Polish war, day N: every element's
// share of men (elementStrength / elementSize) and so its expected hurt level (0 > 3/4, 1 <= 3/4, 2 <= 1/2,
// 3 <= 1/4); the camera at 8 m/px over the most hurt living element; balls and Classic shots for the eye.
// Usage: node critic/scripts/c39_hu_hurt.mjs <seed> <days>
import { launch, open1938, lookAt, shot, save, hours, CELLS, settle } from './c31_lib.mjs';
const seed = Number(process.argv[2] ?? 7019);
const days = Number(process.argv[3] ?? 10);
const T = CELLS.tags;
const out = { seed, days };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T.GER, d: T.POL });
  await hours(page, 24 * days);
  // Elements are in view only near the camera: look at the front at 250 m/px first.
  const f = await page.evaluate((n) => { const v = window.__warsim.view; return v.formationsOf(n).map((f) => ({ f, pos: v.formationPos(f), e: v.formationEngaged(f) })).filter((x) => x.e)[0]; }, T.GER);
  out.f = f;
  await lookAt(page, f.pos[0], f.pos[1], 250);
  const stat = await page.evaluate(() => {
    const v = window.__warsim.view; const lv = [0, 0, 0, 0]; let worst = null;
    for (let i = 0; i < v.elementCount; i++) {
      const s = v.elementStrength[i], z = v.elementSize[i]; if (!z || s <= 0) continue;
      const q = s / z; const l = q <= 0.25 ? 3 : q <= 0.5 ? 2 : q <= 0.75 ? 1 : 0; lv[l]++;
      if (!worst || q < worst.q) worst = { i, q, x: v.elementX[i], y: v.elementY[i], n: v.elementNation[i] };
    }
    return { count: v.elementCount, levels: lv, worst };
  });
  out.stat = stat;
  if (stat.worst) {
    for (const m of [8, 20]) {
      await lookAt(page, stat.worst.x, stat.worst.y, m);
      for (const l of ['balls', 'classic']) {
        await page.evaluate((l) => { window.__warsim.view.unitLook = l; }, l);
        await settle(page); await page.waitForTimeout(300);
        out[`shot_${m}_${l}`] = await shot(page, `c39hu_${seed}_d${days}_${m}m_${l}.png`);
      }
      await page.evaluate(() => { window.__warsim.view.unitLook = 'balls'; });
    }
  }
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c39_hu_${seed}_d${days}.json`, out);
await browser.close();
console.log(JSON.stringify(out, null, 1));
