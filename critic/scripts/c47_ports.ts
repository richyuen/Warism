// Critic run 47 (new): per nation in the 1938 start (seed <seed>), its ports and its transport groups (where, room), to find
// lands whose nearest port is far from (or on another sea than) the port of a free group (R38d's FAR_PORT_CELLS).
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { portSeaOf } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 3517);
const { w: W } = SIZE_1938;
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
const w = sim.world;
sim.step(1, (x) => { x.out.events.length = 0; x.out.fires.length = 0; });
const c = w.formations.cols;
const tags = w.nations.tags ?? [];
const water = portSeaOf(w);
const byNation = new Map<number, string[]>();
w.ports.forEach((p, i) => {
  const n = w.cells.controller[p.cell]!;
  if (!byNation.has(n)) byNation.set(n, []);
  byNation.get(n)!.push(`${p.name}@${p.cell % W},${Math.floor(p.cell / W)}${water[i]! < 0 ? '(nosea)' : ''}`);
});
const groups = new Map<number, string[]>();
w.formations.forEach((o) => {
  if (!w.isFleet(o) || transportRoom(w, o) <= 0) return;
  const n = c.nation[o]!;
  if (!groups.has(n)) groups.set(n, []);
  groups.get(n)!.push(`${o}@${c.x[o]!.toFixed(0)},${c.y[o]!.toFixed(0)} room ${transportRoom(w, o)}`);
});
for (const [n, gs] of groups) {
  console.log(`${n} ${(tags as string[])[n] ?? ''}: groups ${gs.join('; ')}`);
  console.log(`   ports ${(byNation.get(n) ?? []).join('; ')}`);
}
console.log('done:');
