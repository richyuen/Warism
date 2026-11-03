// Critic run 31 (R13): each sea hero's start basin (heroBasin), and its nation's ports at the start: how many have lane
// water, how many are on the start's basin, and the basins of the rest (with the port's lon/lat).
// Usage: npx tsx critic/scripts/c31_basins.ts [seed]
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { heroBasin, returnPlace } from '../../src/sim/systems/heroes';
import { basinOf, Domain, portSeaOf, seaOf } from '../../src/sim/world';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 4637);
const SZ = size1938();
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SZ.w), options: { heroes: 'on' } });
const w = s.world;
const sea = portSeaOf(w);
const { zoneOf } = seaOf(w);
const { basin, ocean } = basinOf(w);
const ll = (x: number, y: number): [number, number] => [+(x / w.cells.w * 360 - 180).toFixed(1), +(90 - y / w.cells.h * 180).toFixed(1)];
const basinCount = new Map<number, number>();
w.ports.forEach((p, i) => { const b = sea[i]! < 0 ? -1 : basin[zoneOf[sea[i]!]!]!; basinCount.set(b, (basinCount.get(b) ?? 0) + 1); });
console.log('ocean key', ocean, 'ports by basin (-1 = no lane water):', JSON.stringify([...basinCount].sort((a, b) => b[1] - a[1])));
w.heroRoster.forEach((r, row) => {
  const t = w.rules!.templates[r.template]!;
  if (t.domain !== Domain.sea) return;
  const home = heroBasin(w, r.x, r.y);
  const mine = w.ports.map((p, i) => ({ p, i })).filter(({ p }) => w.cells.controller[p.cell] === r.nation);
  const onHome = mine.filter(({ i }) => sea[i]! >= 0 && basin[zoneOf[sea[i]!]!] === home);
  const off = mine.filter(({ i }) => !(sea[i]! >= 0 && basin[zoneOf[sea[i]!]!] === home)).map(({ p, i }) => `${ll(p.x, p.y)} b${sea[i]! < 0 ? 'none' : basin[zoneOf[sea[i]!]!]}`);
  console.log(`${NATIONS_1938[r.nation - 1]?.tag} ${TEMPLATES_1938[r.template]?.id} start ${ll(r.x, r.y)} basin ${home}; ports held ${mine.length}, on its basin ${onHome.length}; others: ${off.join('; ')}; returnPlace ${JSON.stringify(returnPlace(w, row))}`);
});
console.log('done:');
