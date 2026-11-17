// Critic run 71 (new, R85e): why a world of N random nations has no war. At day 0 and at day D: each nation's land
// neighbours, whether it is a sea power, landless (R85e), its aggression, gold, income, formations, transport groups,
// its war target (strategic warTarget with its neighbours).
// Usage: npx tsx critic/scripts/c74_fewwhy.ts <N> <seed> [days=1000]
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { neighbourMap, seaPowers, strengths } from '../../src/sim/ai/strategic';
import { landlessPowers } from '../../src/sim/ai/economic';

const N = Number(process.argv[2] ?? 2), seed = Number(process.argv[3] ?? 54421), days = Number(process.argv[4] ?? 1000);
const sim = new Sim({ scenario: 'random', seed, assets: assets1938(SIZE_1938.w), options: { nations: N } });
const w = sim.world;
const nc = w.nations.cols;
const show = (when: string): void => {
  const nb = neighbourMap(w);
  const str = strengths(w);
  const sea = seaPowers(w, str);
  const ll = landlessPowers(w);
  process.stdout.write(`${when} (wars ${w.wars.list.length}, truces ${w.wars.truces.length})\n`);
  w.nations.forEach((n) => {
    if (nc.living[n] !== 1) return;
    let forms = 0;
    for (let id = 1; id < w.formations.alive.length; id++) if (w.formations.alive[id] === 1 && w.formations.cols.nation[id] === n) forms++;
    let cells = 0;
    for (let c = 0; c < w.cells.owner.length; c++) if (w.cells.owner[c] === n) cells++;
    process.stdout.write(`  #${n} cells ${cells} nb [${[...(nb.get(n) ?? [])].join(',')}] seaPower ${sea.has(n)} landless ${ll.has(n)} aggr ${nc.aggression[n]} gold ${nc.gold[n]!.toFixed(0)} str ${str[n]!.toFixed(0)} forms ${forms}\n`);
  });
};
show('day 0');
sim.step(24 * days, (x) => { x.out.events.length = 0; x.out.fires.length = 0; });
show(`day ${days}`);
process.stdout.write('done:\n');
