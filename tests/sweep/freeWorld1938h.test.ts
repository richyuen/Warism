import { expect, it } from 'vitest';
import { dayOfIso } from '../../src/shared/calendar';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62i5 (ADR-944): the world free after the Korean armistice. The track's world on 26 July 1953, loaded
// with ten seeds for after it, left on 27 July (since R69a the track runs to 1962, ADR-984: left as a free start from
// a year leaves it, `leaveTrack`, and draws its chance from that seed, as a game of each seed does): a war of the AI's
// own, declared after the end, within 5 years on most of them. The world after 1962: R69e.

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const YEARS = 5;

it('after 27 July 1953 the AI makes wars of its own on most of ten seeds', () => {
  // Stepped, not run by `runMatch`: that runs to each map's date first, and the last is the track's end.
  const run = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TIMELINE_1938H);
  run.step((dayOfIso('1953-07-26') - dayOfIso('1938-01-01')) * 24, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  expect(run.world.track?.ended).toBe(false);
  const bytes = run.save();
  const firstWar: number[] = [];
  for (const seed of SEEDS) {
    const sim = new Sim({ scenario: '1938h', seed: 1938, assets: assets1938(SIZE_1938.w) }, TIMELINE_1938H);
    sim.load(bytes);
    sim.world.track!.afterSeed = seed;
    sim.step(24, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
    sim.command({ kind: 'leaveTrack' });
    let end = -1;
    let war = -1;
    for (let day = 0; day < YEARS * 365 && war < 0; day++) {
      sim.step(24, (w) => {
        const ev = w.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (ev[i + 1] === EventKind.TrackEnded && end < 0) end = ev[i]!;
          if (ev[i + 1] === EventKind.WarDeclared && end >= 0 && war < 0) war = ev[i]!;
        }
        ev.length = 0;
        w.out.fires.length = 0;
      });
    }
    expect(end, `seed ${seed}: the track ends`).toBeGreaterThanOrEqual(0);
    firstWar.push(war < 0 ? -1 : (war - end) / 24);
  }
  process.stderr.write(`days from the end to the AI's first war, by seed: ${firstWar.map((d) => (d < 0 ? 'none' : d.toFixed(1))).join(', ')}\n`);
  expect(firstWar.filter((d) => d >= 0).length).toBeGreaterThan(SEEDS.length / 2);
}, 3_600_000);
