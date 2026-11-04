// Critic run 22, CB2: does a helmeted countryball still show its nation? On the German-Polish front, at close zoom,
// every element on screen with its nation (view.elementNation) and screen position, for an annotated screenshot.
// Usage: node critic/scripts/c32_cb2_helmet.mjs <seed> <m/px> [attTag] [defTag]
import { launch, open1938, lookAt, shot, save, hours, CELLS, settle } from './c31_lib.mjs';

const seed = Number(process.argv[2] ?? 7019);
const m = Number(process.argv[3] ?? 8);
const A = process.argv[4] ?? 'GER';
const D = process.argv[5] ?? 'POL';
const T = CELLS.tags;
const tag = `c32cb2_${seed}_${A}_${D}_${m}`;
const out = { seed, m, A, D, shots: [] };
const { browser, page, errors } = await launch();
try {
  await open1938(page, seed);
  await page.evaluate(({ a, d }) => window.__warsim.sim.command({ kind: 'declareWar', attacker: a, defender: d }), { a: T[A], d: T[D] });
  let eng = [];
  for (let d = 0; d < 20 && eng.length < 1; d++) {
    await hours(page, 24);
    eng = await page.evaluate((n) => { const v = window.__warsim.view; return v.formationsOf(n).map((f) => ({ f, t: v.formationTitle(f), pos: v.formationPos(f), e: v.formationEngaged(f) })).filter((x) => x.e && /Infantry/.test(JSON.stringify(x.t))); }, T[A]);
    out.day = d + 1;
  }
  out.pick = eng[0] ?? null;
  for (const [k, p] of eng.slice(0, 3).entries()) {
    await lookAt(page, p.pos[0], p.pos[1], m);
    await settle(page);
    const els = await page.evaluate(() => {
      const v = window.__warsim.view; const c = v.controller.cam; const r = [];
      for (let i = 0; i < v.elementCount; i++) {
        const sx = (v.elementX[i] - c.cx) * c.scale + innerWidth / 2; const sy = (v.elementY[i] - c.cy) * c.scale + innerHeight / 2;
        if (sx < 0 || sy < 0 || sx > innerWidth || sy > innerHeight) continue;
        const t = v.formationTitle(v.elementFormation[i]);
        r.push({ sx: Math.round(sx), sy: Math.round(sy), n: v.elementNation[i], kind: t?.kind ?? '' });
      }
      return r;
    });
    const s = await shot(page, `${tag}_${k}.png`);
    out.shots.push({ k, f: p.f, shot: s, els });
  }
  out.nations = await page.evaluate(({ a, d }) => ({ a, d }), { a: T[A], d: T[D] });
} catch (e) { out.fatal = String(e?.stack ?? e); }
out.errors = errors;
save(`c32_cb2_${seed}_${A}_${D}_${m}.json`, out);
await browser.close();
console.log(JSON.stringify({ ...out, shots: out.shots.map((s) => ({ ...s, els: s.els.length })) }));
