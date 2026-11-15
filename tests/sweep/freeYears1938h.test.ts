import { expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { Breaks, useTags, worldBreaks } from '../helpers/diploInvariants';
import { assets1938 } from '../helpers/earth';
import { hourChecks, RULE_SETS } from '../helpers/worldInvariants';

// Games played free from a year of the replay, checked as the critic checked them (critic run 69). The track stepped
// once to 1 January of 1946, 1954, 1962 and 1975; from each, left free on two seeds, with the scenario's options and
// with random diplomacy and heroes on, for 120 days (four month starts):
// - ROADMAP R84a (ADR-1060, R69-B1): `held` (diploInvariants) none at hour 1 and on each day. Before, 12 pairs and
//   21,338 cells from 1946, Okinawa's 6 cells from 1954 and 1962.
// - ROADMAP R84b (R69-B2): every rule set of `worldInvariants` each hour. Before, bloc aid broke `economy` in every free
//   game from a Cold War year with the scenario's diplomacy (two blocs).

const YEARS = ['1946-01-01', '1954-01-01', '1962-01-01', '1975-01-01'];
const GAMES: { after: number; options?: Record<string, string> }[] = [
  { after: 51515 },
  { after: 51525, options: { diplomacy: 'random', heroes: 'on' } },
];
const DAYS = 120;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

it('a year played free holds no land at peace and keeps the world rules, from four years, on two seeds', () => {
  const tag = (n: number): string => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`;
  useTags(tag);
  const assets = assets1938(SIZE_1938.w);
  const run = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, TIMELINE_1938H);
  const held: string[] = [];
  const breaks = new Breaks();
  /** `BlocAid` rows by game: the economy rule is read on aid given (R84b), not only on months without it. */
  const aided = new Map<string, number>();
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
      const look = (when: string): void => {
        for (const l of worldBreaks(sim.world)) if (l.startsWith('held')) held.push(`${label} ${when}: ${l}`);
      };
      look('hour 1');
      const h = hourChecks(sim.world, new Set(RULE_SETS), tag, label, breaks);
      const check = (w: World): void => {
        const ev = w.out.events;
        for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.BlocAid) aided.set(label, (aided.get(label) ?? 0) + 1);
        h.check(w);
      };
      for (let d = 1; d <= DAYS; d++) {
        sim.step(24, check);
        look(`day ${d}`);
      }
    }
  }
  expect(held).toEqual([]);
  expect(breaks.lines).toEqual([]);
  // With the scenario's diplomacy (two blocs) from 1962 and 1975, aid was given.
  for (const date of ['1962-01-01', '1975-01-01']) expect(aided.get(`${date} after ${GAMES[0]!.after}`) ?? 0, date).toBeGreaterThan(0);
}, 3_600_000);
