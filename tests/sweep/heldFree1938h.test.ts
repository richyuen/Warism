import { expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { useTags, worldBreaks } from '../helpers/diploInvariants';
import { assets1938 } from '../helpers/earth';

// ROADMAP R84a (ADR-1060; critic run 69, R69-B1): a game played free from a year of the replay holds no land at peace.
// The track stepped once to 1 January 1946 and 1954 (the starts the critic found 12 and 5 pairs held on, 21,338 and
// 393 cells, Japan's and Okinawa's for three years); from each, left free on two seeds with the scenario's options and
// with random diplomacy and heroes on: `held` (diploInvariants) none at hour 1 and on each day of 60.

const YEARS = ['1946-01-01', '1954-01-01'];
const GAMES: { after: number; options?: Record<string, string> }[] = [
  { after: 51515 },
  { after: 51525, options: { diplomacy: 'random', heroes: 'on' } },
];
const DAYS = 60;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

it('a year played free holds no land at peace, from 1946 and 1954, on two seeds', () => {
  useTags((n) => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`);
  const assets = assets1938(SIZE_1938.w);
  const run = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, TIMELINE_1938H);
  const out: string[] = [];
  for (const date of YEARS) {
    run.step(run.world.track!.tickOf(date) - run.tick, quiet);
    expect(run.world.track?.ended, date).toBe(false);
    const bytes = run.save();
    for (const g of GAMES) {
      const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets, options: { after: g.after } }, TIMELINE_1938H);
      sim.load(bytes);
      sim.world.track!.afterSeed = g.after;
      sim.command(g.options ? { kind: 'leaveTrack', options: g.options } : { kind: 'leaveTrack' });
      sim.step(1, quiet);
      const label = `${date} after ${g.after}`;
      expect(sim.world.track!.ended, label).toBe(true);
      const held = (when: string): void => {
        for (const l of worldBreaks(sim.world)) if (l.startsWith('held')) out.push(`${label} ${when}: ${l}`);
      };
      held('hour 1');
      for (let d = 1; d <= DAYS; d++) {
        sim.step(24, quiet);
        held(`day ${d}`);
      }
    }
  }
  expect(out).toEqual([]);
}, 1_800_000);
