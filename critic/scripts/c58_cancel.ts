// Critic run 52 (new): R47c's cancel, headless, as the bar gives it (each division of the landing ordered to its port's
// cell, `moveFormation`, the player's nation). TAG at war with FOE; the N divisions nearest FROM sent to TO by sea; at
// hour CANCEL after the click, the landing of division ids[IDX] is cancelled. Then hourly: each division's place,
// aboard or not, its landing (id, state), the owner of its cell, its player order; events (landed, embarked, refused).
// Usage: TAG=JAP FOE=CHI FROM=139.69,35.69 TO=121.47,31.23 N=2 CANCEL=24 IDX=0 HOURS=240 npx tsx critic/scripts/c58_cancel.ts <seed> <out.json>
import { writeFileSync } from 'node:fs';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const seed = Number(process.argv[2] ?? 20661);
const outPath = process.argv[3] ?? 'critic/c58_cancel.json';
const env = process.env;
const N = Number(env.N ?? 2);
const CANCEL = Number(env.CANCEL ?? 24);
const IDX = Number(env.IDX ?? 0);
const HOURS = Number(env.HOURS ?? 240);
const { w: W, h: H } = SIZE_1938;
const NAT = nationId(env.TAG ?? 'JAP');
const FOE = nationId(env.FOE ?? 'CHI');
const ll = (s: string): [number, number] => { const [a, b] = s.split(',').map(Number); return cellOf(a!, b!, W, H) as [number, number]; };
const FROM = ll(env.FROM ?? '139.69,35.69');
const TO = ll(env.TO ?? '121.47,31.23');
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
const w = sim.world;
const ids: number[] = [];
const evs: string[] = [];
const quiet = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    const id = e[i + 2]!;
    if (!ids.includes(id)) continue;
    const name = Object.entries(EventKind).find(([, v]) => v === k)?.[0] ?? `kind${k}`;
    evs.push(`t${e[i]} ${name} ${id} b${e[i + 3]} ${Number(e[i + 4]).toFixed(1)},${Number(e[i + 5]).toFixed(1)}`);
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
for (const id of ids) sim.command({ kind: 'moveFormation', id, x: TO[0] + 0.5, y: TO[1] + 0.5, nation: NAT, escort: true } as Command);
sim.applyNow(quiet);
const t0 = w.tick;
const trace: string[] = [];
let cancelled: { tick: number; landing: number; port: string; portAt: [number, number]; divisions: number[] } | null = null;
const ownerName = (x: number, y: number): string => {
  const o = w.cells.owner[Math.floor(y) * W + Math.floor(x)]!;
  return o === 0 ? 'sea/none' : o === NAT ? 'own' : o === FOE ? 'FOE' : `n${o}`;
};
for (let h = 0; h < HOURS; h++) {
  if (h === CANCEL) {
    const l = landingOfDivision(w, ids[IDX]!);
    if (l) {
      const p = w.ports[l.port]!;
      const portAt: [number, number] = [(p.cell % W) + 0.5, Math.floor(p.cell / W) + 0.5];
      const divs = [...l.divisions.keys()].filter((d) => w.formations.has(d));
      cancelled = { tick: w.tick, landing: l.id, port: p.name, portAt, divisions: divs };
      for (const d of divs) sim.command({ kind: 'moveFormation', id: d, x: portAt[0], y: portAt[1], nation: NAT } as Command);
      sim.applyNow(quiet);
    } else cancelled = { tick: w.tick, landing: -1, port: '', portAt: [0, 0], divisions: [] };
  }
  if (h % 3 === 0)
    trace.push(
      `h${w.tick - t0} ` +
        ids
          .map((id) => {
            if (!w.formations.has(id)) return `${id}:gone`;
            const l = landingOfDivision(w, id);
            return `${id}@${c.x[id]!.toFixed(1)},${c.y[id]!.toFixed(1)}${w.embarked.has(id) ? ' aboard' : ''} ${ownerName(c.x[id]!, c.y[id]!)} L${l ? `${l.id}/s${l.state}` : '-'} m${c.moving[id]} po${JSON.stringify(w.playerOrders.get(id) ?? null)}`;
          })
          .join(' | '),
    );
  sim.step(1, quiet);
}
const res = { seed, ids, t0, cancelled, evs, trace };
writeFileSync(outPath, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ ids, cancelled, evs }, null, 1));
for (const t of trace.filter((_, i) => i % 4 === 0)) console.log(t);
console.log('done:');
