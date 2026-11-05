// Critic run 34 (copy of run 33) (R18, new): the scene R18 names, as a player sees it. 1938 seed <seed>: the Soviet Union forces war on
// Poland at hour 1 (God); <days> days on, the engaged Soviet formations nearest each other; the camera on the closest
// pairs at <m> m/px (T3), screenshots. Also two other engaged pairs elsewhere.
// Usage: node critic/scripts/c39_sk_stacks.mjs <seed> <days> <m> <tag>
import { launch, open1938, shot, save, hours, lookAt, CELLS } from './c31_lib.mjs';
const [seedS, daysS, mS, tag] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS), m = Number(mS);
const out = { seed, days, m, views: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.getByTestId('god-btn').click();
  await page.evaluate(({ a, b }) => window.__warsim.hud.command({ kind: 'forceWar', attacker: a, defender: b }), { a: CELLS.tags.SOV, b: CELLS.tags.POL });
  await page.getByTestId('god-btn').click();
  await hours(page, 24 * days);
  const pairs = await page.evaluate((sov) => {
    const v = window.__warsim.view;
    const ids = v.formationsOf(sov).filter((id) => v.formationEngaged(id) && !v.formationAfloat(id));
    const r = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { const a = v.formationPos(ids[i]), b = v.formationPos(ids[j]); r.push([ids[i], ids[j], Math.hypot(a[0] - b[0], a[1] - b[1]), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); }
    return r.sort((x, y) => x[2] - y[2]).slice(0, 6);
  }, CELLS.tags.SOV);
  out.pairs = pairs;
  let k = 0;
  for (const p of pairs.slice(0, 4)) {
    await lookAt(page, p[3], p[4], m);
    out.views.push({ pair: p, mpp: await page.evaluate(() => window.__warsim.view.metresPerPx), shot: await shot(page, `c39sk_${tag}_${k++}.png`) });
  }
} catch (e) { out.fatal = String(e?.stack ?? e).slice(0, 600); }
out.errors = errors;
save(`c39_sk_${tag}.json`, out);
await browser.close();
console.log(JSON.stringify(out).slice(0, 2500));
