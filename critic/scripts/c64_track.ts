// Critic run 62: the historical track (1938h) checked by the builder's own checker (tests/helpers/historyTrack.ts) on
// a seed, with a daily sample of a few dated claims (Paris's holder in May-July 1940, the births, wars at war), then
// the world after the track for FREE_DAYS: its wars declared and its nukes, to see the world freed.
// Usage: npx tsx critic/scripts/c64_track.ts <seed> [freeDays=730]
import { EventKind } from '../../src/shared/events';
import { TAGS_1938H } from '../../src/sim/scenario1938h';
import { capitalCell } from '../../src/sim/systems/capitals';
import type { World } from '../../src/sim/world';
import { historyTrack } from '../../tests/helpers/historyTrack';

const seed = Number(process.argv[2] ?? 1938);
const freeDays = Number(process.argv[3] ?? 730);
const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const t0 = Date.now();
let paris = -1;
const parisHolders: string[] = [];
let lastParis = -1;
const born = new Map<string, number>();
const watch = ['SLO', 'CRO', 'VIC', 'RSI', 'FRG', 'GDR', 'KOR', 'PRK', 'ISR', 'PAK', 'IDN', 'VIE'];
const startDay = (w: World): number => w.startDay;
const dateOf = (w: World, tick: number): string => new Date(Date.UTC(1938, 0, 1) + (tick / 24) * 86400000).toISOString().slice(0, 10);
const run = historyTrack(seed, Infinity, (w) => {
  if (paris < 0) paris = capitalCell(w, id('FRA'));
  if (w.tick % 24 !== 0) return;
  const h = w.cells.controller[paris]!;
  if (h !== lastParis) {
    parisHolders.push(`${dateOf(w, w.tick)} ${tag(h)}`);
    lastParis = h;
  }
  for (const t of watch) if (!born.has(t) && w.nations.has(id(t)) && w.nations.cols.living[id(t)] === 1) born.set(t, w.tick);
  void startDay;
});
const w = run.sim.world;
console.log(`seed ${seed}: track ended ${w.track!.ended} at ${dateOf(w, run.end)} (t${run.end}), ${Math.round((Date.now() - t0) / 1000)} s`);
console.log(`broken lines: ${run.lines.length}`);
for (const l of run.lines) console.log(`  ${l}`);
console.log(`skipped: ${run.skipped.length} ${JSON.stringify(run.skipped.slice(0, 20))}`);
console.log(`Paris's holders: ${parisHolders.join('; ')}`);
console.log(`born: ${[...born].map(([t, k]) => `${t} ${dateOf(w, k)}`).join('; ')}; never: ${watch.filter((t) => !born.has(t)).join(' ')}`);
console.log(`at the end: ${w.nations.cols.living.reduce((a, b) => a + (b === 1 ? 1 : 0), 0)} living, ${w.wars.list.length} wars`);
// The world after: free.
let wars = 0;
let nukes = 0;
const firstWars: string[] = [];
for (let d = 0; d < freeDays; d++) {
  run.sim.step(24, (x: World) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      if (ev[i + 1] === EventKind.WarDeclared) {
        wars++;
        if (firstWars.length < 8) firstWars.push(`${dateOf(x, ev[i]!)} ${tag(ev[i + 2]!)} on ${tag(ev[i + 3]!)}`);
      }
      if (ev[i + 1] === EventKind.NukeDetonated) nukes++;
    }
    ev.length = 0;
    x.out.fires.length = 0;
  });
}
console.log(`after the track, ${freeDays} days: ${wars} wars declared, ${nukes} detonations; first: ${firstWars.join('; ')}`);
console.log(`hash ${(run.sim.hash?.() ?? 'n/a').toString(16)}; ${Math.round((Date.now() - t0) / 1000)} s`);
console.log('done:');
