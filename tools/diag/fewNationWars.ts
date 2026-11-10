/**
 * ROADMAP R60d (critic run 61, R61-N4: "small random worlds never go to war"): a random world of N nations on K seeds
 * from S0, Y years each: the day of its first war (−1: none), how many wars, how many nations living at the end.
 *
 * Usage: `npx tsx tools/diag/fewNationWars.ts <N> <S0> [K = 10] [Y = 10]`; one line a seed, then `done:`.
 * About 25 s a seed at N = 3 over 10 years.
 */
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../headless/assets';

const [nS, s0S, kS, yS] = process.argv.slice(2);
const N = Number(nS);
const S0 = Number(s0S);
const K = Number(kS ?? 10);
const Y = Number(yS ?? 10);
const assets = loadAssets1938(2048);
for (let s = S0; s < S0 + K; s++) {
  const sim = new Sim({ scenario: 'random', seed: s, assets, options: { nations: N } });
  const w = sim.world;
  let first = -1;
  const seen = new Set<number>();
  for (let d = 0; d < Y * 365; d++) {
    // The step's events are not read: emptied, or they grow for years (`World.out`).
    sim.step(24, (x) => {
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    for (const war of w.wars.list) seen.add(war.id * 1e7 + war.startTick);
    if (first < 0 && w.wars.size > 0) first = d;
  }
  let living = 0;
  w.nations.forEach((id) => {
    if (w.nations.cols.living[id] === 1) living++;
  });
  process.stdout.write(`N ${N} seed ${s}: first war day ${first}, wars ${seen.size}, living ${living}\n`);
}
process.stdout.write('done:\n');
