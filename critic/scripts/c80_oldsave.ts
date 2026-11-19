// Critic run 72 (new): a replay save of the last build (critic/c71_starts/<year>.sav, df93b4c2's timeline, before R86e's 57
// cityName events) loaded on HEAD, against HEAD's own start of the year: does the replay go on, end, or misstep? Steps
// DAYS days; prints the track's state (ended, endedAt, next event), the city names known, the TrackEvent rows.
// Usage: npx tsx critic/scripts/c80_oldsave.ts <year> <days> <dir>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1975);
const days = Number(process.argv[3] ?? 30);
const dir = process.argv[4] ?? 'critic/c71_starts';
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 999 } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`${dir}/${year}.sav`))));
const w = sim.world;
const t = w.track!;
const dateOf = (tick: number): string => new Date(Date.UTC(1938, 0, 1) + tick * 3600000).toISOString().slice(0, 13);
console.log(`${dir}/${year}.sav at ${dateOf(w.tick)}: ended ${t.ended} changed ${(t as unknown as { changed: boolean }).changed} next ${t.next} cityNames ${w.cityNames.size}`);
let notes = 0;
for (let d = 0; d < days; d++) {
  sim.step(24, (x) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      if (ev[i + 1] === EventKind.TrackEvent) { notes++; if (notes <= 12) console.log(`  ${dateOf(ev[i]!)} track event ${ev[i + 2]}: ${t.events[ev[i + 2]! - 1]?.note ?? ''}`.slice(0, 160)); }
      if (ev[i + 1] === EventKind.TrackEnded) console.log(`  ${dateOf(ev[i]!)} TrackEnded`);
    }
    x.out.events.length = 0;
    x.out.fires.length = 0;
  });
}
console.log(`after ${days} days ${dateOf(w.tick)}: ended ${t.ended} endedAt ${t.endedAt} next ${t.next} cityNames ${w.cityNames.size} notes ${notes} hash ${(sim.hash() >>> 0).toString(16)}`);
console.log('done:');
