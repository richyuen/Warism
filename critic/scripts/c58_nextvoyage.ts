// Critic run 56 (new, R54a): what becomes of the division left behind when a landing short of room no longer calls a
// far group. landingCallBound1938's setup (seed SEED, Britain played, three divisions nearest London clicked to
// Belfast, one group with room for two at Portsmouth, the others moved to AWAY), followed to DAYS: each division's
// landing (id, state, port, groups) when it changes, the events that name it (NextVoyage, LeftLanding, MoveRejected,
// landed), and the hour each is ashore on Ireland. Usage: SEED=1 AWAY="Hong Kong" DAYS=40 npx tsx critic/scripts/c58_nextvoyage.ts
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportRoom, transportsPort } from '../../src/sim/systems/amphibious';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { navOf, portSeaOf } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const seed = Number(process.env.SEED ?? 1);
const away = process.env.AWAY ?? 'Hong Kong';
const days = Number(process.env.DAYS ?? 40);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
const w = s.world;
w.settings.player = ENG;
const c = w.formations.cols;
const water = portSeaOf(w);
const comp = navOf(w).grid.component;
const [lx, ly] = cellOf(-0.12, 51.5, W, H);
const london = Math.floor(ly) * W + Math.floor(lx);
const near: [number, number][] = [];
w.formations.forEach((id) => {
  if (c.nation[id] === ENG && !w.isFleet(id) && !w.offLand(id) && comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] === comp[london]) near.push([id, (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2]);
});
const divs = near.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, Number(process.env.N ?? 3)).map(([id]) => id).sort((a, b) => a - b);
const port = transportsPort(w, divs[0]!, false);
const groups: number[] = [];
w.formations.forEach((o) => { if (w.isFleet(o) && c.nation[o] === ENG && transportRoom(w, o) > 0) groups.push(o); });
groups.sort((a, b) => a - b);
const at = (o: number, i: number): void => void ([c.x[o], c.y[o]] = [(water[i]! % W) + 0.5, Math.floor(water[i]! / W) + 0.5]);
at(groups[0]!, port);
const awayPort = w.ports.findIndex((p) => p.name === away);
for (const o of groups.slice(1)) at(o, awayPort);
console.log(`seed ${seed} port ${w.ports[port]!.name} divs ${divs.join(',')} strengths ${divs.map((d) => c.strength[d]).join(',')} group ${groups[0]} room ${transportRoom(w, groups[0]!)}; others at ${away}: ${groups.slice(1).join(',')}`);
const belfast = cellOf(-5.93, 54.6, W, H) as [number, number];
const ireland = comp[Math.floor(belfast[1]) * W + Math.floor(belfast[0])];
for (const id of divs) s.command({ kind: 'moveFormation', id, x: belfast[0], y: belfast[1], nation: ENG });
const last = new Map<number, string>();
const ashore = new Map<number, number>();
const names = Object.fromEntries(Object.entries(EventKind).filter(([, v]) => typeof v === 'number').map(([k, v]) => [v, k]));
for (let h = 0; h < 24 * days; h++) {
  s.step(1, (wo) => {
    const ev = wo.out.events;
    for (let i = 0; i < ev.length; i += 6) if (divs.includes(ev[i + 2]!)) console.log(`t${wo.tick} EVENT ${names[ev[i + 1]!] ?? ev[i + 1]} div ${ev[i + 2]} arg ${ev[i + 5]}`);
    wo.out.events.length = 0;
    wo.out.fires.length = 0;
  });
  for (const d of divs) {
    if (!w.formations.has(d)) { if (last.get(d) !== 'gone') { console.log(`t${w.tick} div ${d} gone`); last.set(d, 'gone'); } continue; }
    const l = landingOfDivision(w, d);
    const onIre = !w.embarked.has(d) && comp[Math.floor(c.y[d]!) * W + Math.floor(c.x[d]!)] === ireland;
    if (onIre && !ashore.has(d)) ashore.set(d, w.tick);
    const st = l ? `L${l.id} st${l.state} port ${w.ports[l.port]!.name} fleets ${l.fleets.join('+')} divs ${[...l.divisions.keys()].join('+')} ready ${l.ready}` : `no landing, ${onIre ? 'on Ireland' : 'not on Ireland'} emb${w.embarked.has(d) ? 1 : 0} mv${c.moving[d]}`;
    if (last.get(d) !== st) { console.log(`t${w.tick} div ${d} ${st} @${c.x[d]!.toFixed(1)},${c.y[d]!.toFixed(1)}`); last.set(d, st); }
  }
  if (divs.every((d) => ashore.has(d))) break;
}
console.log(`ashore on Ireland: ${divs.map((d) => `${d}@${ashore.get(d) ?? 'never'}`).join(' ')}`);
console.log('done:');
