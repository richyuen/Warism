// Critic run 52 (new): save and load inside the page, on a busy world. 1938 <seed> (extra URL flags), stepped D days;
// sim.save(); stepped D more, hash A and inspect summary; sim.load(saved); stepped D more, hash B. A == B is a load that
// resumes the same world. Also a second load of the same bytes, then a pause/resume at the UI, then D more: hash C.
// Usage: node critic/scripts/c58_saveload_page.mjs <seed> <days> [extra] [label]
import { launch, open1938, shot, save, hours } from './c58_lib.mjs';
const seed = Number(process.argv[2] ?? 20901);
const D = Number(process.argv[3] ?? 200);
const extra = process.argv[4] ?? '';
const label = process.argv[5] ?? 'plain';
const out = { seed, D, extra };
const { browser, page, errors } = await launch();
const hash = () => page.evaluate(async () => { const s = await window.__warsim.sim.hash(); return { tick: s.tick, hash: s.hash ?? s.stateHash ?? JSON.stringify(s).slice(0, 200) }; });
try {
  await open1938(page, seed, extra);
  await hours(page, D * 24);
  out.atSave = await hash();
  await page.evaluate(async () => { window.__c55save = await window.__warsim.sim.save(); });
  out.saveBytes = await page.evaluate(() => window.__c55save.length);
  await hours(page, D * 24);
  out.A = await hash();
  out.shotA = await shot(page, `c58sl_${label}_${seed}_A.png`);
  await page.evaluate(async () => { await window.__warsim.sim.load(window.__c55save); });
  await page.waitForTimeout(1500);
  out.afterLoad = await hash();
  await hours(page, D * 24);
  out.B = await hash();
  out.shotB = await shot(page, `c58sl_${label}_${seed}_B.png`);
  out.same = out.A.hash === out.B.hash && out.A.tick === out.B.tick;
  // Loaded again; the game run at the UI for a few seconds and paused, then stepped to the same tick.
  await page.evaluate(async () => { await window.__warsim.sim.load(window.__c55save); });
  await page.waitForTimeout(1000);
  out.afterLoad2 = await hash();
  await hours(page, D * 24);
  out.C = await hash();
  out.same2 = out.A.hash === out.C.hash;
  out.date = await page.evaluate(() => document.querySelector('.bar-date, [data-testid=date]')?.textContent ?? null);
} finally {
  out.errors = errors;
  save(`c58_sl_${label}_${seed}.json`, out);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
}
