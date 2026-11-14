/**
 * ROADMAP R80b's measure (ADR-1045; ADR-1031's answer 3): a bloc that ends, then ten years after the track. The 1938h
 * timeline with one event added on its last day, the Soviet Union's alliance dissolved (`allianceEnd`, the Warsaw
 * Pact's end of 1 July 1991 before the track reaches it), run from 1938 to the end and `years` on. Monthly: the blocs
 * (`blocsOf`) and their leaders; the alliance the Soviet Union leads, if any, and whether it is a bloc; the wars between
 * the lasting bloc's members and the Soviet Union's side (deterrence no longer holds them back); `BlocAid` rows; and
 * the checker's `bloc`, `held` and `realm` lines every day (`tests/helpers/diploInvariants.ts`).
 *
 * The world at the track's end is saved to .cache/blocEnd_<seed>.sav.gz and loaded from there on a later run (valid
 * only for the code that wrote it).
 *
 * Usage: npx tsx tools/diag/blocEnd.ts [seed = SEED_1938H] [years = 10]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { blocsOf, strengths } from '../../src/sim/ai/strategic';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { blocBreaks, Breaks, useTags, worldBreaks } from '../../tests/helpers/diploInvariants';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? SEED_1938H);
const years = Number(process.argv[3] ?? 10);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
useTags(tag);
const SOV = TAGS_1938H.indexOf('SOV') + 1;
const last = TIMELINE_1938H.events.at(-1)!.date;
const timeline: TimelineFile = { ...TIMELINE_1938H, events: [...TIMELINE_1938H.events, { date: last, hour: 23, kind: 'allianceEnd', leader: 'SOV' }] };
const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) }, timeline);
const w = sim.world;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const save = `.cache/blocEnd_${seed}.sav.gz`;
if (existsSync(save)) sim.load(new Uint8Array(gunzipSync(readFileSync(save))));
else {
  while (!w.track!.ended) sim.step(24, quiet);
  writeFileSync(save, gzipSync(sim.save()));
}
const end = sim.tick;
const alliance = (n: number): string => {
  const a = w.alliances.allianceOf(n);
  return a ? `${a.id} (${a.members.length})` : 'none';
};
process.stdout.write(`seed ${seed}: track ended at day ${Math.floor(end / 24)}; ended blocs: ${[...w.track!.blocsEnded()].map(tag).join(' ')}; SOV's alliance ${alliance(SOV)}\n`);
const breaks = new Breaks();
let aid = 0;
let crossWars = 0;
let maxBlocs = 0;
let sovBloc = 0;
const counted = new Set<number>();
for (let d = 1; d <= years * 365; d++) {
  sim.step(24, (x) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.BlocAid) aid++;
    breaks.add(`day ${d}`, [...blocBreaks(x, ev), ...worldBreaks(x)]);
    quiet(x);
  });
  const blocs = blocsOf(w, strengths(w));
  maxBlocs = Math.max(maxBlocs, blocs.size);
  const sovA = w.alliances.allianceOf(SOV);
  if (sovA && blocs.has(sovA.id)) sovBloc++;
  // Wars between the lasting bloc's members and the Soviet Union's side.
  const lasting = [...blocs].map((id) => w.alliances.list.find((a) => a.id === id)!)[0];
  for (const war of w.wars.list) {
    if (counted.has(war.id) || !lasting) continue;
    for (const [s, o] of [[0, 1], [1, 0]] as const)
      if (war.sides[s].some((m) => lasting.members.includes(m)) && war.sides[o].some((m) => m === SOV || (sovA?.members.includes(m) ?? false))) {
        counted.add(war.id);
        crossWars++;
        process.stdout.write(`  day ${d}: war ${war.id} ${war.sides[0].map(tag).join(' ')} vs ${war.sides[1].map(tag).join(' ')}\n`);
        break;
      }
  }
  if (d % 365 === 0) {
    const names = [...blocs].map((id) => {
      const a = w.alliances.list.find((x) => x.id === id)!;
      return `${tag(a.leader)} (${a.members.length})`;
    });
    process.stdout.write(`year ${d / 365}: blocs ${names.join(' ') || 'none'}; SOV's alliance ${alliance(SOV)}; wars ${w.wars.list.length}\n`);
  }
}
const lines = breaks.lines;
for (const l of lines) process.stdout.write(`BREAK ${l}\n`);
process.stdout.write(`done: seed ${seed}, ${years} years: at most ${maxBlocs} bloc(s); days SOV's alliance a bloc ${sovBloc}; aid rows ${aid}; wars between the lasting bloc and the Soviet side ${crossWars}; broken lines ${lines.length}\n`);
