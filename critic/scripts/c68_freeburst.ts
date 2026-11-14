// Critic run 65 (new): what a free game from a year of the replay does in its first year (R68b): the year's built start
// (critic/c68_starts/<year>.sav, `npm run saves`), the game's second seed set as the page sets it, `leaveTrack`, then
// 365 days. Wars declared by month, and how many at once in the first 30 days; wars between the blocs' leaders
// (USA, SOV) or members on opposite sides; nukes. A plain 1938 game's first year is the yardstick (year = 0).
// Usage: npx tsx critic/scripts/c68_freeburst.ts <year|0> <after seed> [days=365]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1975);
const after = Number(process.argv[3] ?? 4242) >>> 0;
const days = Number(process.argv[4] ?? 365);
const plain = year === 0;
const sim = plain
  ? new Sim({ scenario: '1938', seed: after, assets: assets1938(SIZE_1938.w) })
  : new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
const tags: readonly string[] = TAGS_1938H;
const tag = (n: number): string => tags[n - 1] ?? `#${n}`;
if (!plain) {
  if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c68_starts/${year}.sav`))));
  sim.world.track!.afterSeed = after;
  sim.command({ kind: 'leaveTrack' });
}
const w0 = sim.world;
const living0 = w0.nations.cols.living.reduce((a: number, b: number) => a + (b === 1 ? 1 : 0), 0);
const atWarAtStart = w0.wars.list.length;
const byMonth = new Array(Math.ceil(days / 30)).fill(0);
const first30: string[] = [];
const all: string[] = [];
let nukes = 0, peaces = 0, annexed = 0, eliminated = 0;
const t0 = sim.tick;
for (let d = 0; d < days; d++) {
  sim.step(24, (x: World) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const k = ev[i + 1];
      const day = Math.floor((ev[i]! - t0) / 24);
      if (k === EventKind.WarDeclared) {
        byMonth[Math.min(byMonth.length - 1, Math.floor(day / 30))]++;
        const s = `d${day} ${tag(ev[i + 2]!)}>${tag(ev[i + 3]!)}`;
        all.push(s);
        if (day < 30) first30.push(s);
      }
      if (k === EventKind.NukeDetonated) nukes++;
      if (k === EventKind.PeaceMade) peaces++;
      if (k === EventKind.NationEliminated) eliminated++;
    }
    ev.length = 0;
    x.out.fires.length = 0;
  });
}
const w = sim.world;
const id = (t: string): number => tags.indexOf(t) + 1;
const usa = id('USA'), sov = id('SOV');
const leadersAtWar = w.wars.atWar(usa, sov);
const living = w.nations.cols.living.reduce((a: number, b: number) => a + (b === 1 ? 1 : 0), 0);
console.log(`${plain ? `plain 1938 seed ${after}` : `1938h from ${year} free, after ${after}`}: living ${living0} -> ${living}; wars at start ${atWarAtStart}, at end ${w.wars.list.length}`);
console.log(`declared ${all.length} in ${days} days; by 30-day month: ${byMonth.join(' ')}; peaces ${peaces}; eliminated ${eliminated}; detonations ${nukes}; USA-SOV at war at end ${leadersAtWar}`);
console.log(`first 30 days (${first30.length}): ${first30.join(', ')}`);
console.log(`all: ${all.slice(0, 80).join(', ')}`);
void annexed;
