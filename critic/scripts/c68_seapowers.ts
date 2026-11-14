// Critic run 67 (new): R76c's sea reach keys on `seaPowers` (ADR-1017: the 7 world powers by the card's measure and the
// 7 largest navies). In plain 1938 on a seed, the set at the start and at the first day of each year to `years`, beside
// `greatPowers` (run 66's c66_greats.ts). Usage: npx tsx critic/scripts/c68_seapowers.ts <seed> [years=5]
import { greatPowers, seaPowers, strengths, worldPowers } from '../../src/sim/ai/strategic';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const seed = Number(process.argv[2] ?? 7019);
const years = Number(process.argv[3] ?? 5);
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const w = sim.world;
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? String(n);
const show = (label: string): void => {
  const str = strengths(w);
  const g = [...greatPowers(w, str)].map(tag);
  const wp = worldPowers(w, str).map(tag);
  const sp = [...seaPowers(w, str)].map(tag);
  console.log(`${label} | greatPowers ${g.join(' ')} | worldPowers ${wp.join(' ')} | seaPowers ${sp.join(' ')} | USA ${sp.includes('USA')} JAP ${sp.includes('JAP')} CHI ${sp.includes('CHI')}`);
};
show('day 0');
for (let y = 1; y <= years; y++) {
  for (let d = 0; d < 365; d++) sim.step(24, (x: World) => { x.out.events.length = 0; x.out.fires.length = 0; });
  show(`year ${y}`);
}
console.log('done:');
