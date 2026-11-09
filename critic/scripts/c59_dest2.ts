// Critic run 54 (copy of c59_dest, plus each hour's sea battle with the landing's groups, its ships and losses, and foe fleets within 30 cells):
// Critic run 52 (new): where a player's landing comes ashore, against the place clicked. TAG at war with FOE; the N
// divisions nearest cell FROM sent in one batch to cell TO (as the page's click: cell coords, escort on). Hourly to
// HOURS: each division's place, aboard or not, its landing's state and target cell; every FormationLanded with the
// owner and controller of the cell it lands on, and the target's owner. Usage:
// TAG=ITA FOE=ENG FROM=1095.5,344.5 TO=1106.5,383.5 N=2 HOURS=260 npx tsx critic/scripts/c59_dest.ts <seed> <out.json>
import { writeFileSync } from 'node:fs';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';


const seed = Number(process.argv[2] ?? 21105);
const outPath = process.argv[3] ?? 'critic/c59_dest.json';
const env = process.env;
const N = Number(env.N ?? 2);
const HOURS = Number(env.HOURS ?? 260);
const { w: W, h: H } = SIZE_1938;
const NAT = nationId(env.TAG ?? 'ITA');
const FOE = nationId(env.FOE ?? 'ENG');
const xy = (s: string): [number, number] => s.split(',').map(Number) as [number, number];
const FROM = xy(env.FROM ?? '1095.5,344.5');
const TO = xy(env.TO ?? '1106.5,383.5');
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
const w = sim.world;
const tag = (n: number): string => (n === 0 ? '-' : (NATIONS_1938[n - 1]?.tag ?? String(n)));
const ids: number[] = [];
const evs: string[] = [];
const quiet = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    const id = e[i + 2]!;
    if (!ids.includes(id)) continue;
    const cx = Math.floor(e[i + 4]!), cy = Math.floor(e[i + 5]!);
    const cell = cy * W + cx;
    const where = Number.isFinite(cx) && cx >= 0 ? ` owner ${tag(x.cells.owner[cell]!)} ctrl ${tag(x.cells.controller[cell]!)}` : '';
    const name = Object.entries(EventKind).find(([, v]) => v === k)?.[0] ?? `kind${k}`;
    evs.push(`t${e[i]} ${name} ${id} b${e[i + 3]} @${Number(e[i + 4]).toFixed(1)},${Number(e[i + 5]).toFixed(1)}${where}`);
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
const toCell = Math.floor(TO[1]) * W + Math.floor(TO[0]);
const target = { cell: TO, owner: tag(w.cells.owner[toCell]!), ctrl: tag(w.cells.controller[toCell]!) };
for (const id of ids) sim.command({ kind: 'moveFormation', id, x: TO[0], y: TO[1], nation: NAT, escort: true } as Command);
sim.applyNow(quiet);
const t0 = w.tick;
const trace: string[] = [];
for (let h = 0; h < HOURS; h++) {
  sim.step(1, quiet);
  if (h % (Number(env.EVERY ?? 3)) !== 0) continue;
  trace.push(`t${w.tick} ` + ids.map((id) => {
    if (!w.formations.has(id)) return `${id}:gone`;
    const L = landingOfDivision(w, id);
    const cell = Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!);
    return `${id}@${c.x[id]!.toFixed(1)},${c.y[id]!.toFixed(1)}${w.embarked.has(id) ? '(aboard)' : ` on ${tag(w.cells.owner[cell]!)}`} m${c.moving[id]} e${c.engaged[id]} ${L ? `L${L.id}/${L.state}/tgt ${L.target % W},${Math.floor(L.target / W)} land ${L.land % W},${Math.floor(L.land / W)}` : 'L-'}`;
  }).join(' | ') + (() => {
    const L = landingOfDivision(w, ids[0]!);
    if (!L) return '';
    const f = L.fleets.map((o) => `${o}@${c.x[o]!.toFixed(1)},${c.y[o]!.toFixed(1)}m${c.moving[o]}e${c.engaged[o]}`).join(',');
    const [fx, fy] = L.fleets.length ? [c.x[L.fleets[0]!]!, c.y[L.fleets[0]!]!] : [0, 0];
    const near: string[] = [];
    w.formations.forEach((o) => { if (w.isFleet(o) && c.nation[o] === FOE && Math.hypot(c.x[o]! - fx, c.y[o]! - fy) < 30) near.push(`${o}d${Math.hypot(c.x[o]! - fx, c.y[o]! - fy).toFixed(1)}@${c.x[o]!.toFixed(1)},${c.y[o]!.toFixed(1)}m${c.moving[o]}e${c.engaged[o]}`); });
    const esc: string[] = [];
    w.formations.forEach((o) => { if (w.isFleet(o) && c.nation[o] === NAT && !L.fleets.includes(o) && Math.hypot(c.x[o]! - fx, c.y[o]! - fy) < 6) esc.push(`${o}@${c.x[o]!.toFixed(1)},${c.y[o]!.toFixed(1)}m${c.moving[o]}e${c.engaged[o]}`); });
    const sb = w.seaBattles.filter((b) => b.fleets.some((x) => L.fleets.includes(x))).map((b) => `battle[${b.fleets.map((x, i) => `${x}:${tag(c.nation[x] ?? 0)}:${b.ships[i]}`).join(' ')}] range ${b.range} lost ${b.lostA}/${b.lostB} @${b.x.toFixed(1)},${b.y.toFixed(1)}`);
    return ` || ${sb.join(';') || 'no battle'} || fleets ${f} || foe<30: ${near.join(',') || '-'} || own<6: ${esc.join(',') || '-'}`;
  })());
}
const out = { seed, tag: env.TAG, FROM, TO, target, ids, t0, evs, trace };
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ target, ids, evs }, null, 1));
console.log('done:');
