// R84g (critic run 69, R69-N4): the Soviet successors' books at their first New Year. From the 1991 start (built by
// `npm run saves`), stepped to 1 January 1992: for each nation born from the Soviet Union in 1991, its land formations
// and their upkeep, its gross income and expenses (`monthlyAccounts`), its gold, and the formations it disbands for
// want of pay (`FormationsDisbanded`) in the hour of the month's books; then on to `--days` more, the rows counted.
// Usage: npx tsx tools/diag/successorPurse.ts [after = 999] [days = 365] [start = public/data/scenarios/1938h/start/1991.sav]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { ECONOMY_TABLES_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { monthlyAccounts } from '../../src/sim/systems/economy';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const after = Number(process.argv[2] ?? 999) >>> 0;
const days = Number(process.argv[3] ?? 365);
const file = process.argv[4] ?? 'public/data/scenarios/1938h/start/1991.sav';
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(file))));
sim.world.track!.afterSeed = after;
const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const heirs = TIMELINE_1938H.events.flatMap((e) => (e.kind === 'born' && e.date.startsWith('1991') && e.from.includes('SOV') ? [id(e.nation)] : []));
const disbanded = new Map<number, number[]>();
const watch = (w: World): void => {
  const ev = w.out.events;
  for (let i = 0; i < ev.length; i += 6) {
    if (ev[i + 1] === EventKind.FormationsDisbanded && heirs.includes(ev[i + 2]!)) {
      const d = new Date(Date.UTC(1938, 0, 1) + ev[i]! * 3600e3).toISOString().slice(0, 10);
      const list = disbanded.get(ev[i + 2]!) ?? [];
      list.push(ev[i + 3]!);
      disbanded.set(ev[i + 2]!, list);
      console.log(`${d} ${tag(ev[i + 2]!)} disbands ${ev[i + 3]}`);
    }
  }
  ev.length = 0;
  w.out.fires.length = 0;
};
const newYear = sim.world.track!.tickOf('1992-01-01');
sim.step(newYear - sim.tick, watch);
const w = sim.world;
const nc = w.nations.cols;
const acc = monthlyAccounts(w, ECONOMY_TABLES_1938);
const formations = (n: number): number => {
  let k = 0;
  w.formations.forEach((f) => {
    if (w.formations.cols.nation[f] === n) k++;
  });
  return k;
};
console.log('the hour before the books of 1 January 1992:');
for (const n of [id('SOV'), ...heirs]) console.log(`${tag(n)}: living ${nc.living[n]}, formations ${formations(n)}, gross ${acc.gross[n]!.toFixed(1)}, expenses ${acc.expenses[n]!.toFixed(1)} (upkeep ${acc.upkeep[n]!.toFixed(1)}), gold ${nc.gold[n]!.toFixed(1)}`);
sim.step(days * 24, watch);
console.log(`in ${days} days after: ${[...disbanded].map(([n, l]) => `${tag(n)} ${l.length} rows, ${l.reduce((a, b) => a + b, 0)} formations`).join('; ') || 'no successor disbanded'}`);
console.log('done:');
