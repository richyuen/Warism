import { gunzipSync, gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { buildReplaySaves, replayYears } from '../../tools/data/replaySaves';
import { assets1938 } from '../helpers/earth';

// ROADMAP R68a (ADR-983): the replay's yearly starts. One a year from 1938 to the track's last event; a year's save,
// gzipped as the site serves it, loaded into a fresh world, plays on as the unbroken run.

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe("the replay's yearly starts (ROADMAP R68a)", () => {
  it('one a year from 1938 to the year of the track\'s last event', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    const years = replayYears(sim);
    expect(years[0]).toBe(1938);
    expect(years.at(-1)).toBe(Number(sim.world.track!.events.at(-1)!.date.slice(0, 4)));
    expect(years.every((y, i) => i === 0 || y === years[i - 1]! + 1)).toBe(true);
  });

  it("1939's save, loaded into a fresh world, plays 30 days to the unbroken run's hash", () => {
    const assets = assets1938(SIZE_1938.w);
    const saves = new Map<number, { bytes: Buffer; sim: Sim; tick: number }>();
    buildReplaySaves((year, sim) => saves.set(year, { bytes: gzipSync(sim.save()), sim, tick: sim.tick }), 1939);
    expect([...saves.keys()]).toEqual([1938, 1939]);
    const { bytes, sim, tick } = saves.get(1939)!;
    expect(tick).toBe(sim.world.track!.tickOf('1939-01-01'));
    const twin = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
    twin.load(new Uint8Array(gunzipSync(bytes)));
    expect(twin.tick).toBe(tick);
    sim.step(30 * 24, quiet);
    twin.step(30 * 24, quiet);
    expect(twin.hash()).toBe(sim.hash());
  });
});
