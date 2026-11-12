/**
 * ROADMAP R68a (ADR-983, the user's decisions): the historical replay's yearly starts. 1938h's world (its own seed)
 * on 1 January of each year of the track, from 1938 to the year of its last event, written gzipped
 * (`<out>/<year>.sav`, `Sim.save()` as `packSave` writes it) with `<out>/years.json`: the years, the state format,
 * and each save's tick and hash. Built by the Pages workflow on each push to `main` into the site, never committed;
 * by hand for a local game (`public/data/scenarios/1938h/start/`, gitignored). About 7-10 minutes.
 *
 * Usage: npm run saves [-- <out dir> [last year]]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { STATE_FORMAT } from '../../src/shared/saveFormat';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

/** What `years.json` holds. */
export interface ReplayYears {
  format: number;
  seed: number;
  years: { year: number; tick: number; hash: number }[];
}

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

/** The track's years: 1 January of each from its start to the year of its last event (`last` caps it). */
export function replayYears(sim: Sim, last = Infinity): number[] {
  const t = sim.world.track!;
  const first = Number(t.events[0]!.date.slice(0, 4));
  const end = Math.min(last, Number(t.events.at(-1)!.date.slice(0, 4)));
  const out: number[] = [];
  for (let y = Math.max(1938, first); y <= end; y++) out.push(y);
  return out;
}

/** Steps a fresh 1938h world through the years, handing each 1 January's world to `each`. */
export function buildReplaySaves(each: (year: number, sim: Sim) => void, last = Infinity): void {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
  const t = sim.world.track!;
  for (const year of replayYears(sim, last)) {
    const at = t.tickOf(`${year}-01-01`);
    if (at > sim.tick) sim.step(at - sim.tick, quiet);
    each(year, sim);
  }
}

if (process.argv[1]?.endsWith('replaySaves.ts')) {
  const out = process.argv[2] ?? 'public/data/scenarios/1938h/start';
  const last = process.argv[3] ? Number(process.argv[3]) : Infinity;
  mkdirSync(out, { recursive: true });
  const index: ReplayYears = { format: STATE_FORMAT, seed: SEED_1938H, years: [] };
  const t0 = Date.now();
  buildReplaySaves((year, sim) => {
    const bytes = gzipSync(sim.save());
    writeFileSync(path.join(out, `${year}.sav`), bytes);
    index.years.push({ year, tick: sim.tick, hash: sim.hash() });
    process.stdout.write(`${year}: tick ${sim.tick}, ${Math.round(bytes.length / 1024)} KB, ${Math.round((Date.now() - t0) / 1000)} s\n`);
  }, last);
  writeFileSync(path.join(out, 'years.json'), JSON.stringify(index, null, 1) + '\n');
  process.stdout.write(`done: ${index.years.length} years → ${out}\n`);
}
