// Critic run 90 (new): the headless state hash of a random world of N nations, SEED, after HOURS (decimal, as the page's
// sim.step() prints it), to compare with c90_peace.mjs's end hash: the peace line's reads (peaceWhy, R216) must not move
// the world the page steps.
// Usage: npx tsx critic/scripts/c90_headHashR.ts <seed> <nations> <hours>
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seed, nations, hours] = process.argv.slice(2).map(Number);
const s = new Sim({ scenario: 'random', seed: seed!, assets: loadAssets1938(SIZE_1938.w), options: { nations: nations! } });
const clear = (w: typeof s.world): void => { w.out.events.length = 0; w.out.fires.length = 0; };
for (let h = 1; h <= hours!; h++) s.step(1, clear);
console.log(`${seed} ${nations} ${hours} ${s.hash()}`);
