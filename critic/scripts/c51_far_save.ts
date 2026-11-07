// Critic run 51 (new): R39a through a save. c47_far.ts's USA 3517 case (Chicago to Norwich, 1119 bombed at Norfolk).
// Each hour: Norfolk's port damage and shut, the landing's groups. The hour the landing's last group is gone while
// the landing still stands (destroyed after amphibiousSystem this hour; World.sunk set, not saved), SAVE=1 saves and
// loads the sim (as a player's save and load would) before the next hour. Logs the news of 615 for 30 days after.
// Usage: SAVE=0|1 npx tsx critic/scripts/c51_far_save.ts <out.json>
import { writeFileSync } from 'node:fs';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { portShut } from '../../src/sim/systems/bombing';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const outPath = process.argv[2] ?? 'critic/c51_far_save.json';
const SAVE = process.env.SAVE === '1';
const { w: W, h: H } = SIZE_1938;
const NAT = nationId('USA');
const FOE = nationId('ENG');
const ll = (a: number, b: number): [number, number] => cellOf(a, b, W, H) as [number, number];
const FROM = ll(-87.6, 41.9);
const TO = ll(1.3, 52.6);
let sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
let w = sim.world;
const ids: number[] = [];
const evs: string[] = [];
const quiet = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const id = e[i + 2]!;
    if (!ids.includes(id)) continue;
    evs.push(`t${e[i]} kind${e[i + 1]} ${id} b${e[i + 3]} ${Number(e[i + 4]).toFixed(1)}`);
  }
  e.length = 0;
  x.out.fires.length = 0;
};
sim.command({ kind: 'setPlayer', nation: NAT });
sim.step(1, quiet);
if (!w.wars.atWar(NAT, FOE)) sim.command({ kind: 'declareWar', attacker: NAT, defender: FOE } as Command);
sim.step(1, quiet);
const c = () => w.formations.cols;
const comp = navOf(w).grid.component;
const land = comp[Math.floor(FROM[1]) * W + Math.floor(FROM[0])];
const all: [number, number][] = [];
w.formations.forEach((id) => {
  const k = c();
  if (k.nation[id] !== NAT || w.isFleet(id) || w.offLand(id) || comp[Math.floor(k.y[id]!) * W + Math.floor(k.x[id]!)] !== land) return;
  all.push([id, (k.x[id]! - FROM[0]) ** 2 + (k.y[id]! - FROM[1]) ** 2]);
});
ids.push(all.sort((a, b) => a[1] - b[1] || a[0] - b[0])[0]![0]);
sim.command({ kind: 'moveFormation', id: ids[0]!, x: TO[0] + 0.5, y: TO[1] + 0.5, nation: NAT, escort: true } as Command);
sim.applyNow(quiet);
const L0 = landingOfDivision(w, ids[0]!)!;
const port = L0.port;
const pname = w.ports[port]?.name;
const trace: string[] = [];
let savedAt = -1;
let firstShut = -1;
for (let h = 0; h < 24 * 40; h++) {
  sim.step(1, quiet);
  w = sim.world;
  const L = landingOfDivision(w, ids[0]!);
  const shut = portShut(w, port);
  if (shut && firstShut < 0) firstShut = w.tick;
  if (h % 6 === 0 || (L && L.fleets.every((o) => !w.formations.has(o)))) trace.push(`t${w.tick} ${pname} dmg ${(w.portDamage.get(port) ?? 0).toFixed(2)} shut ${shut} L ${L ? `${L.id}/${L.state} fleets ${L.fleets.map((o) => `${o}${w.formations.has(o) ? '' : '(gone)'}`).join(',')}` : '-'} sunk ${[...w.sunk].join(',')}`);
  if (savedAt < 0 && L && L.fleets.length === 0 && w.sunk.size > 0) {
    evs.push(`t${w.tick} group(s) ${L.fleets.join(',')} gone, landing ${L.id} still listed; sunk=${[...w.sunk].join(',')}`);
    if (SAVE) {
      const bytes = sim.save();
      sim = new Sim({ scenario: "1938", seed: 3517, assets: assets1938(W) }); sim.load(bytes);
      w = sim.world;
      evs.push(`t${w.tick} saved and loaded; sunk now=${[...w.sunk].join(',')}`);
    }
    savedAt = w.tick;
  }
  if (savedAt >= 0 && w.tick > savedAt + 24 * 30) break;
}
const out = { SAVE, port: pname, firstShut, savedAt, evs, trace };
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, trace: trace.slice(-60) }, null, 1));
console.log('done:');
