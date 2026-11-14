/**
 * ROADMAP R80c's measure (ADR-1046): a great power's breakup and two unions on the track's end hour. The 1938h
 * timeline with three events added on its last day (the 1990-91 ones come with R80d-i): East Germany annexed by West
 * Germany and South Yemen by North Yemen (`annex`), and MPL, the one nation still dormant at the 1975 end, born from
 * the Soviet Union on a box of Ukraine and the Crimea with `forces` (Ukraine's stand-in). From the last day's start
 * to `days` after the end, every hour: `worldInvariants`' rule sets (economy, navy, air, nukes, bonds, heroes) and no
 * formation of a dead nation. Reports what changed hands: the formations, fleets and wings handed over, and the
 * Soviet warheads before and after.
 *
 * The world at the last day's start is saved to .cache/breakup_<seed>.sav.gz and loaded from there on a later run
 * (valid only for the code that wrote it).
 *
 * Usage: npx tsx tools/diag/breakup.ts [seed = SEED_1938H] [days = 30]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { dayOfIso } from '../../src/shared/calendar';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { Breaks } from '../../tests/helpers/diploInvariants';
import { assets1938 } from '../../tests/helpers/earth';
import { hourChecks, RULE_SETS } from '../../tests/helpers/worldInvariants';

const seed = Number(process.argv[2] ?? SEED_1938H);
const days = Number(process.argv[3] ?? 30);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const last = TIMELINE_1938H.events.at(-1)!.date;
const timeline: TimelineFile = {
  ...TIMELINE_1938H,
  events: [
    ...TIMELINE_1938H.events,
    { date: last, hour: 20, kind: 'annex', annexer: 'FRG', target: 'GDR' },
    { date: last, hour: 20, kind: 'annex', annexer: 'YEM', target: 'SYE' },
    { date: last, hour: 21, kind: 'born', nation: 'MPL', from: ['SOV'], ring: [[22, 44], [40, 44], [40, 52.3], [22, 52.3]], forces: true },
  ],
};
const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) }, timeline);
const w = sim.world;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const eve = (dayOfIso(last) - dayOfIso('1938-01-01')) * 24;
const save = `.cache/breakup_${seed}.sav.gz`;
if (existsSync(save)) sim.load(new Uint8Array(gunzipSync(readFileSync(save))));
else {
  while (sim.tick + 24 <= eve) sim.step(24, quiet);
  if (sim.tick < eve) sim.step(eve - sim.tick, quiet);
  writeFileSync(save, gzipSync(sim.save()));
}
const f = w.formations.cols;
const count = (n: number): { land: number; fleets: number; wings: number } => {
  const c = { land: 0, fleets: 0, wings: 0 };
  w.formations.forEach((i) => {
    if (f.nation[i] !== n) return;
    if (w.isFleet(i)) c.fleets++;
    else if (w.isWing(i)) c.wings++;
    else c.land++;
  });
  return c;
};
const show = (t: string): string => {
  const c = count(id(t));
  return `${t} ${w.nations.cols.living[id(t)] ? 'living' : 'dead'} land ${c.land} fleets ${c.fleets} wings ${c.wings}`;
};
const watch = ['SOV', 'MPL', 'FRG', 'GDR', 'YEM', 'SYE'];
process.stdout.write(`seed ${seed}, day ${sim.tick / 24}: ${watch.map(show).join('; ')}; SOV warheads ${w.warheads.get(id('SOV'))?.stock ?? 0}\n`);
const breaks = new Breaks();
const h = hourChecks(w, new Set(RULE_SETS), tag, `seed ${seed}`, breaks);
const check = (x: World): void => {
  const dead = new Map<number, number>();
  x.formations.forEach((i) => {
    const n = x.formations.cols.nation[i]!;
    if (x.nations.cols.living[n] !== 1) dead.set(n, (dead.get(n) ?? 0) + 1);
  });
  breaks.add(`seed ${seed} day ${Math.floor((x.tick - 1) / 24)}`, [...dead].map(([n, k]) => `dead: ${k} formations of ${tag(n)}, dead`));
  h.check(x);
};
while (!w.track!.ended) sim.step(1, check);
process.stdout.write(`track ended at day ${sim.tick / 24}: ${watch.map(show).join('; ')}; SOV warheads ${w.warheads.get(id('SOV'))?.stock ?? 0}, MPL's ${w.warheads.get(id('MPL'))?.stock ?? 0}\n`);
sim.step(24 * days, check);
process.stdout.write(`${days} days on: ${watch.map(show).join('; ')}\n`);
const lines = breaks.lines;
for (const l of lines) process.stdout.write(`BREAK ${l}\n`);
process.stdout.write(`done: seed ${seed}, broken lines ${lines.length}\n`);
