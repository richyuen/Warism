/**
 * The ten-year runs' fleet guard (PLAN 4.2b, ADR-633): the fleets of the start that stand through
 * the first year, month by month, by what became of the rest (sailed, fought, carried, laid up,
 * gone), and the wars declared in the year.
 *
 * Usage: npx tsx tools/diag/fleetYear.ts [seed] [days]
 */
import { isDayStart } from '../../src/shared/calendar';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
import { fleetsStand } from '../../tests/helpers/fleetsStand';

const seed = Number(process.argv[2] ?? 1);
const days = Number(process.argv[3] ?? 365);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? String(n);
const fleets = fleetsStand(s.world);
const wars: string[] = [];
const start = new Map<number, string>();
s.world.formations.forEach((id) => {
  if (s.world.isFleet(id)) start.set(id, `${s.world.formations.cols.x[id]},${s.world.formations.cols.y[id]}`);
});
/** Per nation, the fleets of the start at their start cells. */
const atHome = (): string => {
  const by = new Map<string, number>();
  const f = s.world.formations;
  for (const [id, at] of start) if (f.has(id) && `${f.cols.x[id]},${f.cols.y[id]}` === at) by.set(tag(f.cols.nation[id]!), (by.get(tag(f.cols.nation[id]!)) ?? 0) + 1);
  return [...by].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ${n}`).join(', ');
};
for (let d = 1; d <= days; d++) {
  s.step(24, (w) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.WarDeclared) wars.push(`day ${d} ${tag(ev[i + 2]!)} on ${tag(ev[i + 3]!)}`);
      else if (process.env.ENDS && [EventKind.PeaceSigned, EventKind.WarEnded, EventKind.PuppetCreated, EventKind.PuppetReleased, EventKind.NationAnnexed].includes(ev[i + 1]! as never)) console.log(`day ${d} event ${ev[i + 1]} ${tag(ev[i + 2]!)} ${tag(ev[i + 3]!)}`);
    fleets.hour(w);
    ev.length = 0;
    w.out.fires.length = 0;
    if (isDayStart(w.tick)) fleets.day(w);
  });
  if (process.env.SIDES?.split(',').includes(String(d))) console.log(`day ${d} sides: ${s.world.wars.list.map((w) => `${w.sides[0].map(tag).join(',')} v ${w.sides[1].map(tag).join(',')}`).join(' | ')}`);
  if (d % 30 === 0 || d === days) {
    const st = fleets.start - fleets.gone - fleets.sailed - fleets.fought - fleets.carried - fleets.laid;
    if (process.env.HOME_AT) console.log(`day ${d} at home: ${atHome()}`);
    console.log(`day ${d}: standing ${st} (sailed ${fleets.sailed}, fought ${fleets.fought}, carried ${fleets.carried}, laid ${fleets.laid}, gone ${fleets.gone})`);
  }
}
console.log(`wars: ${wars.join('; ')}`);
console.log('done:');
