// Critic run 88 (new): the headless state hash of plain 1938 SEED (decimal, as the page's sim.hash() prints it), to
// compare with the page's (c88_sameWorld, c88_sameWorldMsgs, c88_playHash): every EVERY hours up to HOURS, and from
// hour FROM on (if given) every hour.
// Usage: npx tsx critic/scripts/c88_headHash.ts <seed> <hours> <every> [from]
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seed, hours, every, from = Infinity] = process.argv.slice(2).map(Number);
const s = new Sim({ scenario: '1938', seed: seed!, assets: loadAssets1938(SIZE_1938.w) });
const clear = (w: typeof s.world): void => { w.out.events.length = 0; w.out.fires.length = 0; };
console.log(0, s.hash());
for (let h = 1; h <= hours!; h++) { s.step(1, clear); if (h % every! === 0 || h >= from) console.log(h, s.hash()); }
