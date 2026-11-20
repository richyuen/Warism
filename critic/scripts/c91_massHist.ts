// Critic run 91 (new): a random world's history of massings (MassingSeen, MassingCalledOff) and wars over Y years, to see
// why a few-nation world's peace line said "for now" for years with no war (91415). Usage: npx tsx critic/scripts/c91_massHist.ts <N> <SEED> [Y=10]
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { HISTORY_STRIDE } from '../../src/sim/history';
import { loadAssets1938 } from '../../tools/headless/assets';
const [N, SEED, Y = 10] = process.argv.slice(2).map(Number);
const assets = loadAssets1938(SIZE_1938.w);
const sim = new Sim({ scenario: 'random', seed: SEED!, assets, options: { nations: N! } });
sim.step(Y! * 8760, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
const r = sim.world.history.rows;
const name: Record<number, string> = { [EventKind.MassingSeen]: 'massing seen', [EventKind.MassingCalledOff]: 'massing called off', [EventKind.WarDeclared]: 'war', [EventKind.PeaceHeld]: 'peace held' };
const counts: Record<string, number> = {};
for (let i = 0; i < r.length; i += HISTORY_STRIDE) {
  const k = name[r[i + 1]!];
  if (!k) continue;
  counts[k] = (counts[k] ?? 0) + 1;
  if ((counts[k] ?? 0) <= 6) console.log(`day ${Math.floor(r[i]! / 24)} ${k} ${r[i + 2]} -> ${r[i + 3]}`);
}
console.log(`seed ${SEED} n ${N} ${Y} years: ${JSON.stringify(counts)}`);
console.log('done:');
