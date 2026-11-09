// Critic run 56: why a gathering landing stays unready (ready -1) for days. Logs division DIV and its landing's groups
// every STEP hours from FROM to TO: places, moving/engaged, the port's cell, the landing's state.
// Usage: SEED=24033 SETUP=3517 GROUPS=2 DIV=367 FROM=180 TO=780 STEP=12 npx tsx critic/scripts/c59_l1trace.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { landingOfDivision } from '../../src/sim/systems/landings';

const seed = Number(process.env.SEED ?? 24033);
const div = Number(process.env.DIV ?? 367);
const from = Number(process.env.FROM ?? 180);
const to = Number(process.env.TO ?? 780);
const step = Number(process.env.STEP ?? 12);
const lines = landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Math.ceil(to / 24) + 1, orders: Number(process.env.ORDERS ?? seed), probeDays: [30, 90], groups: Number(process.env.GROUPS ?? 2),
  onHour: (w, click) => {
    if (click && click.ids.includes(div)) console.log(`t${w.tick} CLICK ${click.ids.join(',')} -> ${click.x.toFixed(1)},${click.y.toFixed(1)}`);
    if (w.tick < from || w.tick > to || w.tick % step !== 0) return;
    const c = w.formations.cols;
    const W = w.cells.w;
    const l = landingOfDivision(w, div);
    const d = `div ${div} ${c.x[div]!.toFixed(1)},${c.y[div]!.toFixed(1)} mv${c.moving[div]} eng${c.engaged[div]} emb${w.embarked.has(div) ? 1 : 0} ctl${w.cells.controller[Math.floor(c.y[div]!) * W + Math.floor(c.x[div]!)]}`;
    if (!l) { console.log(`t${w.tick} ${d} | no landing`); return; }
    const pc = w.ports[l.port]!.cell;
    const g = l.fleets.map((o: number) => `g${o} ${c.x[o]!.toFixed(1)},${c.y[o]!.toFixed(1)} mv${c.moving[o]} eng${c.engaged[o]}`).join(' ; ');
    console.log(`t${w.tick} ${d} | L${l.id} st${l.state} ready ${l.ready} port ${l.port} at ${pc % W},${Math.floor(pc / W)} ctl${w.cells.controller[pc]} divs ${[...l.divisions.keys()].join('+')} | ${g}`);
  },
});
for (const l of lines) console.log('BROKEN', l);
console.log('done:');
