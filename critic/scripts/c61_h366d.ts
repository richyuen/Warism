// Critic run 59 (new): hour by hour, a division's landing (landingOfDivision), aboard, place and cell owner in a
// landingInvariants run. Usage: SEED= SETUP= GROUPS= DIV= FROM= TO= npx tsx critic/scripts/c61_h366.ts
import { landingBreaks } from '../../tests/helpers/landingInvariants';
import { landingOfDivision } from '../../src/sim/systems/landings';
import { stateHash } from '../../src/sim/core/state';
const hs: string[] = [];
const seed = Number(process.env.SEED), div = Number(process.env.DIV), from = Number(process.env.FROM), to = Number(process.env.TO);
let last = '';
const br = landingBreaks({
  seed, setup: Number(process.env.SETUP ?? 3517), days: 120, orders: seed, probeDays: [30, 90], groups: Number(process.env.KEEPG ?? 2), notes: [],
  onHour: (w, click) => {
    if (!click && w.tick % 240 === 0) hs.push(`${w.tick}:${(stateHash(w.parts()) >>> 0).toString(16)}`);
    if (w.tick < from || w.tick > to) return;
    if (click) { console.log(`t${w.tick} CLICK ${click.ids.join(',')} -> ${click.x.toFixed(1)},${click.y.toFixed(1)}`); return; }
    const c = w.formations.cols;
    if (!w.formations.has(div)) { console.log(`t${w.tick} gone`); return; }
    const l = landingOfDivision(w, div);
    const cell = Math.floor(c.y[div]!) * w.cells.w + Math.floor(c.x[div]!);
    const mv = `mv${c.moving[div]} eng${c.engaged[div]} `;
    const s = mv + `L${l ? `${l.id}:st${l.state}:tgt${l.target % w.cells.w},${Math.floor(l.target / w.cells.w)}` : '-'} emb${w.embarked.has(div) ? 1 : 0} own${w.cells.owner[cell]} nat${c.nation[div]}`;
    if (s !== last || w.tick % 24 === 0) console.log(`t${w.tick} ${c.x[div]!.toFixed(1)},${c.y[div]!.toFixed(1)} ${s}`);
    last = s;
  },
});
console.log('broken', br.length, br.join(' | '));
console.log('hashes', hs.join(' '));
console.log('done:');
