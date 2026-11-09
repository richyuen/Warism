// Critic run 55 (new): landingInvariants 24033 (3517 setup, orders 24033, groups 2) breaks `slowClick` on HEAD
// ("t2004's click of 367 not ashore after 17.1 days, its best way 10.1"), 0 broken on 8d7d02fe. Re-runs the same case
// with the checker's hook and logs division 367 every 6 hours from t1990: where it is, its landing (state, port, its
// groups and divisions), and each click that names it.
// Usage: npx tsx critic/scripts/c59_slow367.ts [div] [from] [to]
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { landingOfDivision } from '../../src/sim/systems/landings';

const div = Number(process.argv[2] ?? 367);
const from = Number(process.argv[3] ?? 1990);
const to = Number(process.argv[4] ?? 2430);
let last = '';
const lines = landingBreaks({
  seed: Number(process.env.SEED ?? 24033), setup: 3517, days: Math.ceil(to / 24) + 1, orders: Number(process.env.SEED ?? 24033), probeDays: [30, 90], groups: 2,
  onHour: (w, click) => {
    if (click && click.ids.includes(div)) console.log(`t${w.tick} CLICK ids=${click.ids.join(',')} to ${click.x},${click.y}`);
    if (w.tick < from || w.tick > to) return;
    const c = w.formations.cols;
    const l = landingOfDivision(w, div);
    const ws = w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(c.nation[div]!))).map((x) => x.sides.map((sd) => sd.join('+')).join(' vs ')).join('; ');
    const st = `alive ${c.alive?.[div] ?? '?'} at ${c.x[div]?.toFixed(1)},${c.y[div]?.toFixed(1)} | landing ${l ? `${l.id} state ${l.state} port ${l.port} target ${l.target % w.cells.w},${Math.floor(l.target / w.cells.w)} fleets ${l.fleets.join('+')} divs ${[...l.divisions.keys()].join('+')} ready ${l.ready}` : 'none'} | wars ${ws}`;
    if (st !== last || w.tick % 24 === 0) { console.log(`t${w.tick} ${st}`); last = st; }
  },
});
for (const l of lines) console.log('BROKEN', l);
console.log('done:');
