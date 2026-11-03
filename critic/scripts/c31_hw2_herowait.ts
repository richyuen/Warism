// Critic run 29 (R5a, heroes), HWAIT: why a sea hero "waits to return" for years while its nation lives.
// 1938, heroes on, seed, to tick <at> (+48): the hero's row in heroReturn; its nation's ports: navalBase, cell
// controller/owner, the port's water (portWater) and its seaPoint; the nation's living, land share, capital.
// Usage: npx tsx critic/scripts/c31_hw2_herowait.ts <seed> <tick> <TAG> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { portWater } from '../../src/sim/data/ports';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2]), at = Number(process.argv[3]), TAG = process.argv[4]!, out = process.argv[5]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on' } });
const n = NATIONS_1938.findIndex((d) => d.tag === TAG) + 1;
s.step(at + 48 - s.world.tick, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
const w = s.world, c = w.cells;
const tag = (k: number): string => (k === 0 ? '-' : NATIONS_1938[k - 1]?.tag ?? `#${k}`);
const rows = w.heroRoster.map((r, row) => ({ row, nation: tag(r.nation), t: TEMPLATES_1938[r.template]?.id, start: [r.x, r.y], alive: [...w.heroes.values()].includes(row), returnAt: w.heroReturn.get(row) ?? null })).filter((r) => r.nation === TAG);
const ports = w.ports.map((p, i) => ({ i, cell: p.cell, x: p.x, y: p.y, navalBase: p.navalBase, controller: tag(c.controller[p.cell]!), owner: tag(c.owner[p.cell]!), water: portWater(p, c.terrain, c.w, c.h, w.portReach, w.settings.loopingMap) }))
  .filter((p) => p.controller === TAG || p.owner === TAG)
  .map((p) => ({ ...p, seaPoint: p.water >= 0 ? w.seaPoint(p.water) : null }));
let cells = 0; for (let i = 0; i < c.controller.length; i++) if (c.controller[i] === n) cells++;
const res = { seed, tick: w.tick, TAG, living: w.nations.cols.living[n], cells, rows, portsHeldOrOwned: ports.length, navalBasesHeld: ports.filter((p) => p.navalBase >= 1 && p.controller === TAG), portsHeldNoBase: ports.filter((p) => p.navalBase < 1 && p.controller === TAG).length, basesOwnedLost: ports.filter((p) => p.navalBase >= 1 && p.controller !== TAG) };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ living: res.living, cells, rows, held: res.navalBasesHeld.length, heldNoBase: res.portsHeldNoBase, lost: res.basesOwnedLost.map((p) => [p.controller, p.navalBase]) }));
console.log('done:');
