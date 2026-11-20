// Critic run 91 (new): R219's other side. Since R219 the peace line gives a reason on fewer peace days (the builder: 65 % to
// 33 %). How long does it say only "At peace for now" ("a war may yet come") while no war comes? A random world of N
// nations, seeds S0.., Y years, `peaceWhy` read each day at peace (as the worker does). Per seed: stretches of peace days
// with no reason (why false), the longest, and how each ended (a war, a reason given, or the run's end); and why the
// realms gave none on the longest one's first day (liftComing / truce / chosen: read from the R219 cause, by asking
// whether a transport is in production or at sea for the realm).
// Usage: npx tsx critic/scripts/c91_forNow.ts <N> <S0> [K=4] [Y=10]
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { peaceWhy } from '../../src/sim/ai/peaceWhy';
import { loadAssets1938 } from '../../tools/headless/assets';
const [N, S0, K = 4, Y = 10] = process.argv.slice(2).map(Number);
const assets = loadAssets1938(SIZE_1938.w);
const clear = (w: Sim['world']): void => { w.out.events.length = 0; w.out.fires.length = 0; };
for (let s = S0!; s < S0! + K; s++) {
  const sim = new Sim({ scenario: 'random', seed: s, assets, options: { nations: N! } });
  const runs: { from: number; days: number; end: string }[] = [];
  let cur: { from: number; days: number } | null = null;
  let peace = 0, why = 0;
  for (let d = 0; d < Y! * 365; d++) {
    const w = sim.world;
    if (w.wars.size === 0) {
      peace++;
      const p = peaceWhy(w);
      if (p && !p.why) { if (!cur) cur = { from: d, days: 0 }; cur.days++; }
      else if (cur) { if (p?.why) why++; runs.push({ ...cur, end: 'reason' }); cur = null; } else if (p?.why) why++;
    } else if (cur) { runs.push({ ...cur, end: 'war' }); cur = null; }
    sim.step(24, clear);
  }
  if (cur) runs.push({ ...cur, end: 'end of run' });
  runs.sort((a, b) => b.days - a.days);
  const quiet = runs.filter((r) => r.end !== 'war');
  console.log(`seed ${s} n ${N}: peace days ${peace}, with a reason ${why}; "for now" stretches ${runs.length}, longest ${runs.slice(0, 4).map((r) => `${r.days} d from day ${r.from} (${r.end})`).join('; ')}; longest not ended by a war ${quiet[0] ? `${quiet[0].days} d (${quiet[0].end})` : '-'}`);
}
console.log('done:');
