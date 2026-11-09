// Critic run 56: a landingInvariants case with random orders only in the first ORDERDAYS days, so the last clicks run
// undisturbed (no re-click resets `slowClick`); prints the checker's lines, its notes, and division DIV's landing each
// day. Usage: SEED=24033 ORDERDAYS=8 DIV=367 DAYS=120 npx tsx critic/scripts/c58_orderdays.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { SlowClicks } from '../../tests/helpers/slowClick';
import { landingOfDivision } from '../../src/sim/systems/landings';
const seed = Number(process.env.SEED ?? 24033);
const div = Number(process.env.DIV ?? 367);
const notes: string[] = [];
const slow = new SlowClicks();
let last = '';
const lines = landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Number(process.env.DAYS ?? 120), orders: Number(process.env.ORDERS ?? seed), probeDays: [30, 90], groups: Number(process.env.GROUPS ?? 2), orderDays: Number(process.env.ORDERDAYS ?? 8), notes, slow,
  onHour: (w, click) => {
    if (click) console.log(`t${w.tick} CLICK ${click.ids.join(',')} -> ${click.x.toFixed(1)},${click.y.toFixed(1)}`);
    const c = w.formations.cols;
    const l = landingOfDivision(w, div);
    const st = l ? `L${l.id} st${l.state} port ${l.port} fleets ${l.fleets.join('+')} divs ${[...l.divisions.keys()].join('+')} ready ${l.ready}` : 'no landing';
    if (st !== last || w.tick % 72 === 0) { console.log(`t${w.tick} div ${div} @${c.x[div]!.toFixed(1)},${c.y[div]!.toFixed(1)} mv${c.moving[div]} emb${w.embarked.has(div) ? 1 : 0} eng${c.engaged[div]} tgt${c.targetCell[div]! % w.cells.w},${Math.floor(c.targetCell[div]! / w.cells.w)} own${w.cells.owner?.[c.targetCell[div]!]} nat${c.nation[div]} step${c.pathStep[div]} ${st}`); last = st; }
  },
});
for (const l of lines) console.log('BROKEN', l);
for (const n of notes) console.log('note', n);
console.log('done:');
