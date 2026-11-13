// Critic run 66 (new): R74h's sea reach keys on the sim's `greatPowers` (ADR-1011). In plain 1938 on a seed, which
// nations it counts as great powers at the start and on the first day of each year to `years`: those outside it may land
// only within SEA_REACH_KM of their transports. Usage: npx tsx critic/scripts/c67_greats.ts <seed> [years=5]
import { greatPowers, rivalsPart, strengths } from '../../src/sim/ai/strategic';
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
  const g = [...greatPowers(w, str)];
  console.log(label, 'rivalsPart', rivalsPart(w), 'greatPowers', g.map((n) => `${n}:${tag(n)}`).join(' '));
};
show('day 0');
for (let y = 1; y <= years; y++) {
  for (let d = 0; d < 365; d++) sim.step(24, (x: World) => { x.out.events.length = 0; x.out.fires.length = 0; });
  show(`year ${y}`);
}
