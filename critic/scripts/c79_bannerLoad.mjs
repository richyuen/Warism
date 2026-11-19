// Critic run 78 (new): R161 after a page save and load. `lastBattle` lives in the worker's memory (WarsFought), and
// `heldRow` treats a war with none as still. Plain 1938 SEED (heroes on) to FROM days; the row read; then either a save
// and load (LOAD=1) or not; then 72 hours one at a time: the row's set each hour and its changes.
// Usage: [BASE=...] [LOAD=1] node critic/scripts/c79_bannerLoad.mjs <seed> <fromDay>
import { launch, open1938, save, hours, shot } from './c79_lib.mjs';
const seed = Number(process.argv[2] ?? 57901), FROM = Number(process.argv[3] ?? 120), LOAD = process.env.LOAD === '1';
const tag = `${seed}_${FROM}_${LOAD ? 'load' : 'noload'}`;
const out = { seed, FROM, LOAD, rows: [] };
const { browser, page, errors } = await launch(1600, 900);
const read = () => page.evaluate(() => ({ row: [...document.querySelectorAll('[data-testid=war-banner]')].map((b) => `${b.getAttribute('data-war')}${b.getAttribute('data-battle') === '1' ? '*' : ''}`), wars: (window.__warsim.hud.stats.value?.wars ?? []).map((w) => `${w.id}:${w.battle ? 'B' : ''}${w.lastBattle ?? '-'}`) }));
try {
  await open1938(page, seed, '&heroes=on');
  await hours(page, FROM * 24);
  await page.waitForTimeout(500);
  out.before = await read();
  if (LOAD) {
    out.load = await page.evaluate(async () => { const w = window.__warsim; const t = w.hud.tick.value; const bytes = await w.sim.save(); await w.sim.load(bytes); const t0 = performance.now(); while (w.hud.tick.value !== t && performance.now() - t0 < 30000) await new Promise((d) => setTimeout(d, 50)); return { t, after: w.hud.tick.value }; });
    await page.waitForTimeout(800);
  }
  out.after = await read();
  await shot(page, `c79bl_${tag}_0.png`);
  let changes = 0, prev = out.after.row.map((x) => x.replace('*', '')).sort().join(',');
  const set0 = out.before.row.map((x) => x.replace('*', '')).sort().join(',');
  out.changedAtLoad = prev !== set0;
  for (let h = 0; h < 72; h++) {
    await hours(page, 1);
    await page.waitForTimeout(60);
    const r = await read();
    const set = r.row.map((x) => x.replace('*', '')).sort().join(',');
    if (set !== prev) changes++;
    prev = set;
    out.rows.push(r.row.join(' '));
    if (h === 0) out.firstHourWars = r.wars;
  }
  out.sum = { changedAtLoad: out.changedAtLoad, changes72h: changes };
  console.log(`${tag}: row before ${out.before.row.join(' ')}; after ${out.after.row.join(' ')}; set changed at the load ${out.changedAtLoad}; changes in 72 h ${changes}; wars' lastBattle after 1 h ${out.firstHourWars.join(' ')}`);
  await shot(page, `c79bl_${tag}_72.png`);
} catch (e) {
  out.error = String(e?.stack ?? e).slice(0, 1200);
  console.log('ERROR', out.error);
}
out.errors = errors;
console.log(`page errors ${errors.length}`);
save(`c79_bl_${tag}.json`, out);
await browser.close();
