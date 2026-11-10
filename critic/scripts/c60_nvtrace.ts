// Critic run 60 (new): hour by hour, a division's landing while its panel says "the next voyage": the landing's state,
// nextVoyageHours, the panel's days, and each transport group's place, moving flag and embarked count.
// Usage: SEED= SETUP= KEEPG= DIV= FROM= TO= npx tsx critic/scripts/c60_nvtrace.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { landingOfDivision, nextVoyageHours, voyageOf } from '../../src/sim/systems/landings';

const seed = Number(process.env.SEED), div = Number(process.env.DIV), from = Number(process.env.FROM), to = Number(process.env.TO);
landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: Math.ceil(to / 24) + 1, orders: seed, probeDays: [30, 90],
  groups: Number(process.env.KEEPG ?? 2), notes: [],
  onHour: (w, click) => {
    if (w.tick < from || w.tick > to) return;
    if (click) { if (click.ids.includes(div)) console.log(`t${w.tick} CLICK ${click.ids.join(',')} -> ${click.x.toFixed(1)},${click.y.toFixed(1)}`); return; }
    if (!w.formations.has(div)) { console.log(`t${w.tick} gone`); return; }
    const c = w.formations.cols;
    const l = landingOfDivision(w, div);
    const v = voyageOf(w, div);
    const fl = l ? l.fleets.map((o) => (w.formations.has(o) ? `${o}@${c.x[o]!.toFixed(1)},${c.y[o]!.toFixed(1)} mv${c.moving[o]} eng${c.engaged[o]}` : `${o}:gone`)).join(' ; ') : '-';
    console.log(`t${w.tick} div ${c.x[div]!.toFixed(1)},${c.y[div]!.toFixed(1)} emb${w.embarked.has(div) ? 1 : 0} | L${l ? `${l.id} st${l.state} port${l.port}` : '-'} nvh ${l ? nextVoyageHours(w, l).toFixed(1) : '-'} | panel ${v?.state ?? '-'} ${v?.days ?? ''} | ${fl}`);
  },
});
console.log('done:');
