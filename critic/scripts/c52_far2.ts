// Critic run 47 (new): R38d (FAR_PORT_CELLS: a free group's port over 20 cells farther than the land's nearest port, a
// group called to the nearer) on other nations and seas. Nation TAG at war with FOE; the N divisions nearest FROM
// (lon,lat) on its land sent in one click to TO (lon,lat), escort on. Logs the landing's port and groups, where each
// group is per day, and the hour each lands (or is refused), up to DAYS.
// Usage: TAG=SOV FOE=TUR FROM=30.3,59.9 TO=36.3,41.3 N=1 DAYS=200 npx tsx critic/scripts/c47_far.ts <seed> <out.json>
import { writeFileSync } from 'node:fs';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const seed = Number(process.argv[2] ?? 3517);
const outPath = process.argv[3] ?? 'critic/c47_far.json';
const env = process.env; const G = Number(process.env.G ?? 1119);
const N = Number(env.N ?? 1);
const DAYS = Number(env.DAYS ?? 200);
const { w: W, h: H } = SIZE_1938;
const NAT = nationId(env.TAG ?? 'SOV');
const FOE = nationId(env.FOE ?? 'TUR');
const ll = (s: string): [number, number] => { const [a, b] = s.split(',').map(Number); return cellOf(a!, b!, W, H) as [number, number]; };
const FROM = ll(env.FROM ?? '30.3,59.9');
const TO = ll(env.TO ?? '36.3,41.3');
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
const w = sim.world;
const evs: string[] = [];
let landedAll = false;
const ids: number[] = [];
const landed: Record<number, number> = {};
const quiet = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    const id = e[i + 2]!;
    if (!ids.includes(id) && !(process.env.WATCH ?? "").split(",").map(Number).includes(id)) continue;
    if (k === EventKind.FormationLanded) { landed[id] = e[i]!; evs.push(`t${e[i]} landed ${id} @${e[i + 4]!.toFixed(1)},${e[i + 5]!.toFixed(1)}`); }
    else if (k === EventKind.MoveRejected) evs.push(`t${e[i]} refused ${id} reason ${e[i + 4]}`);
    else if (k === EventKind.FormationEmbarked) evs.push(`t${e[i]} embarked ${id}`);
    else if (k === EventKind.FormationDestroyed) evs.push(`t${e[i]} destroyed ${id}`);
    else if ((EventKind as Record<string, number>).LostAtSea === k) evs.push(`t${e[i]} lostAtSea ${id}`);
    else evs.push(`t${e[i]} kind${k} ${id} b${e[i + 3]} ${Number(e[i + 4]).toFixed(1)},${Number(e[i + 5]).toFixed(1)}`);
  }
  e.length = 0;
  x.out.fires.length = 0;
};
sim.command({ kind: 'setPlayer', nation: NAT });
sim.step(1, quiet);
if (!w.wars.atWar(NAT, FOE)) sim.command({ kind: 'declareWar', attacker: NAT, defender: FOE } as Command);
sim.step(1, quiet);
const c = w.formations.cols;
const comp = navOf(w).grid.component;
const land = comp[Math.floor(FROM[1]) * W + Math.floor(FROM[0])];
const all: [number, number][] = [];
w.formations.forEach((id) => {
  if (c.nation[id] !== NAT || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== land) return;
  all.push([id, (c.x[id]! - FROM[0]) ** 2 + (c.y[id]! - FROM[1]) ** 2]);
});
ids.push(...all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, N).map((d) => d[0]));
const start = ids.map((id) => `${id}@${c.x[id]!.toFixed(1)},${c.y[id]!.toFixed(1)}`);
for (const id of ids) sim.command({ kind: 'moveFormation', id, x: TO[0] + 0.5, y: TO[1] + 0.5, nation: NAT, escort: true } as Command);
sim.applyNow(quiet);
const t0 = w.tick;
const trace: string[] = [];
let firstL = '';
for (let d = 0; d < DAYS && !landedAll; d++) {
  for (let h = 0; h < 24; h++) {
    if (process.env.HOURLY && d >= Number(process.env.HFROM ?? 0) && d < Number(process.env.HTO ?? 8)) { const o = w.formations.cols; trace.push(`h${w.tick} ` + ids.map((id) => `${id}@${o.x[id]!.toFixed(1)},${o.y[id]!.toFixed(1)}${w.embarked.has(id) ? "a" : ""}m${o.moving[id]}e${o.engaged[id]}`).join(" ") + " | G@" + (w.formations.has(G) ? `${o.x[G]!.toFixed(1)},${o.y[G]!.toFixed(1)}m${o.moving[G]}e${o.engaged[G]} po${JSON.stringify(w.playerOrders.get(G) ?? null)}` : "gone")); }
    sim.step(1, quiet);
    // RECLICK=<tick>: at that tick (a refusal just told), the same order clicked again; logs the nation's transport groups then.
    if (env.RECLICK && w.tick === Number(env.RECLICK)) {
      const g: string[] = [];
      w.formations.forEach((o) => { if (w.isFleet(o) && c.nation[o] === NAT && transportRoom(w, o) > 0) g.push(`${o}@${c.x[o]!.toFixed(1)},${c.y[o]!.toFixed(1)}m${c.moving[o]}e${c.engaged[o]} room${transportRoom(w, o)} po${JSON.stringify(w.playerOrders.get(o) ?? null)}`); });
      evs.push(`t${w.tick} groups: ${g.join('; ')}`);
      for (const id of ids) sim.command({ kind: 'moveFormation', id, x: TO[0] + 0.5, y: TO[1] + 0.5, nation: NAT, escort: true } as Command);
      sim.applyNow(quiet);
      const L = landingOfDivision(w, ids[0]!);
      evs.push(`t${w.tick} reclicked: landing ${L ? `${L.id} port ${w.ports[L.port]?.name} fleets ${L.fleets.join(',')}` : 'none'}`);
    }
    if (ids.every((id) => landed[id] !== undefined || !w.formations.has(id))) { landedAll = true; break; }
  }
  const l = landingOfDivision(w, ids[0]!);
  if (l && !firstL) firstL = `landing ${l.id} port ${w.ports[l.port]?.name} fleets ${l.fleets.join(",")} water ${l.water % W},${Math.floor(l.water / W)} land ${l.land % W},${Math.floor(l.land / W)} TO ${TO.join(",")}`;
  trace.push(`t${w.tick} ` + ids.map((id) => {
    if (!w.formations.has(id)) return `${id}:gone`;
    const L = landingOfDivision(w, id);
    return `${id}@${c.x[id]!.toFixed(0)},${c.y[id]!.toFixed(0)}${w.embarked.has(id) ? '(aboard)' : ''} L${L ? `${L.id}/${L.state}/${w.ports[L.port]?.name}/` + L.fleets.map((o) => `${o}@${c.x[o]!.toFixed(0)},${c.y[o]!.toFixed(0)}${c.moving[o] === 1 ? 'm' : ''}`).join(',') : '-'}`;
  }).join(' | '));
}
const out = { seed, tag: env.TAG, from: env.FROM, to: env.TO, ids, start, t0, firstL, landed, landedAfterDays: Object.fromEntries(Object.entries(landed).map(([k, v]) => [k, +((v - t0) / 24).toFixed(1)])), evs, trace };
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, trace: trace.filter((_, i) => i % 5 === 0) }, null, 1));
console.log('done:');
