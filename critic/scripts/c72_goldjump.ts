// Critic run 69 (new): worldInvariants' economy break on 37009 (FRA's gold rose 644.68 at day 1430's month start, its
// income and tribute 182.25). Steps plain 1938 to the hour before, then one hour, and prints the nation's gold, income,
// its puppets (autonomy, income) and every event of the hour that names it.
// Usage: npx tsx critic/scripts/c72_goldjump.ts <seed> <day> <TAG>
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 37009);
const day = Number(process.argv[3] ?? 1430);
const t = process.argv[4] ?? 'FRA';
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const n = TAGS_1938.indexOf(t as (typeof TAGS_1938)[number]) + 1;
const KN = Object.fromEntries(Object.entries(EventKind).filter(([, v]) => typeof v === 'number').map(([k, v]) => [v as number, k]));
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const target = day * 24 - 1;
while (sim.tick + 240 <= target) sim.step(240, quiet);
sim.step(target - sim.tick, quiet);
const w = sim.world;
const nc = w.nations.cols;
const show = (when: string): void => {
  const subs: string[] = [];
  w.nations.forEach((p) => {
    if (nc.overlord[p] === n) subs.push(`${tag(p)}(aut ${nc.autonomy[p]!.toFixed(0)} inc ${nc.income[p]!.toFixed(1)} gold ${nc.gold[p]!.toFixed(1)} living ${nc.living[p]})`);
  });
  process.stdout.write(`${when} tick ${w.tick}: ${t} gold ${nc.gold[n]!.toFixed(2)} income ${nc.income[n]!.toFixed(2)} bankrupt ${nc.bankrupt[n]}; puppets ${subs.join(' ')}\n`);
};
show('before');
for (let h = 0; h < 26; h++) {
  const g = nc.gold[n]!;
  sim.step(1, (x) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 2] === n || ev[i + 3] === n) process.stdout.write(`  event ${KN[ev[i + 1]!]} ${tag(ev[i + 2]!)} ${tag(ev[i + 3]!)} ${ev[i + 4]} ${ev[i + 5]}\n`);
    quiet(x);
  });
  if (nc.gold[n] !== g) show(`changed ${(nc.gold[n]! - g).toFixed(2)}`);
}
show('after');
process.stdout.write('done:\n');
