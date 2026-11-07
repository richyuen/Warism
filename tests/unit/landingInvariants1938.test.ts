import { describe, expect, it } from 'vitest';
import type { World } from '../../src/sim/world';
import { LandingState } from '../../src/sim/systems/landings';
import { landingBreaks } from '../helpers/landingInvariants';

// ROADMAP R33d (ADR-830; as ADR-803's `diploInvariants`): the rules of the player's landings checked each hour
// of 60 days of random landing orders (re-clicks, redirects, recalls, cancels, late orders from the farther
// divisions; `tests/helpers/landingInvariants.ts`), a save loaded on day 30. Japan at war with China (Shanghai,
// Fuzhou) and Britain with France (Calais, Caen; Portsmouth bombed shut at times). Red on 2a8ac19d: seed 17203,
// a sunk group still listed in its landing (`empty`, t472). The 120-day run on any seed is
// `tools/diag/landingInvariants.ts`.

describe("the rules of the player's landings hold under random orders (ROADMAP R33d)", () => {
  for (const [seed, setup] of [[3517, 3517], [17203, 15101]] as const) {
    it(`seed ${seed} (${setup === 3517 ? 'Japan' : 'Britain'}): 60 days, none broken`, () => {
      expect(landingBreaks({ seed, setup, days: 60, orders: seed, probeDays: [30] })).toEqual([]);
    }, 300_000);
  }
  // ROADMAP R38 (critic run 46): 19113 Britain, a landing's transports sunk at t1463 (`aboardNoLanding`, R46-B1);
  // 18705 Japan, a 40-day walk to Sasebo (`stuck`, R46-N3); a pool short of room, two groups (R38e).
  // ROADMAP R44a (ADR-846): 20827 Britain, Newcastle the only open port; t708's click waited there 8 days past ready
  // for divisions walking from London (`slowClick`).
  for (const [seed, setup, days, groups] of [[19113, 15101, 70, undefined], [18705, 3517, 120, undefined], [3517, 3517, 60, 2], [15101, 15101, 60, 2], [20827, 15101, 45, undefined]] as const) {
    it(`seed ${seed} (${setup === 3517 ? 'Japan' : 'Britain'}${groups ? `, ${groups} groups` : ''}): ${days} days, none broken`, () => {
      expect(landingBreaks({ seed, setup, days, orders: seed, probeDays: [30], ...(groups === undefined ? {} : { groups }) })).toEqual([]);
    }, 300_000);
  }
});

// ADR-835 (the user's decision; critic run 48 on R47-N4): `stuck` counts a landing's days with no ground gained, not
// its days gathering (19206's 367 marched ~70 cells to its click's landing at Kure and was counted stuck). The rule
// is not blind: stalls planted by hand are still caught. Japan 3517, 60 days, the orders of seed 2 on the first day
// only (two divisions bound for a landing): each hour, every division and group of a gathering landing is stopped
// and put back where it was first seen in it (frozen), or its divisions set on a circle of 2 cells about that place
// (walking in circles: never a cell nearer); the same orders unplanted sail, none stuck. And 19206 (R47-N4's seed):
// none broken (367 gathered 46 days before R41, 28 after, 4 since R43a); 19207: none broken
// (its 24-day walk to a freed group, fixed by R40e).
describe('`stuck` is a stall, not a march (ADR-835)', () => {
  const plant = (how: 'frozen' | 'circling') => {
    const at = new Map<number, [number, number]>();
    return (w: World): void => {
      const c = w.formations.cols;
      for (const l of w.landings.values()) {
        if (l.state !== LandingState.gathering) continue;
        for (const id of [...l.divisions.keys(), ...l.fleets]) {
          if (!w.formations.has(id) || w.embarked.has(id)) continue;
          if (!at.has(id)) at.set(id, [c.x[id]!, c.y[id]!]);
          const [x, y] = at.get(id)!;
          const a = how === 'circling' && !w.isFleet(id) ? (w.tick / 24) * Math.PI : 0;
          const r = how === 'circling' && !w.isFleet(id) ? 2 : 0;
          c.x[id] = x + r * Math.cos(a);
          c.y[id] = y + r * Math.sin(a);
          c.moving[id] = 0;
          w.paths.delete(id);
        }
      }
    };
  };
  for (const how of ['frozen', 'circling'] as const) {
    it(`a stall planted (${how}): told \`stuck\``, () => {
      const out = landingBreaks({ seed: 3517, setup: 3517, days: 60, orders: 2, probeDays: [], orderDays: 1, hour: plant(how) });
      expect(out.filter((l) => / stuck: /.test(l)).length, out.join('\n')).toBeGreaterThan(0);
    }, 300_000);
  }
  it('the same orders, nothing planted: none `stuck` (the landing sails)', () => {
    const out = landingBreaks({ seed: 3517, setup: 3517, days: 60, orders: 2, probeDays: [], orderDays: 1 });
    expect(out.filter((l) => / stuck: /.test(l)), out.join('\n')).toEqual([]);
  }, 300_000);
  // ROADMAP R43a: 367 marched to its click's port 46 days (run 49) and 28 (R41); it now boards at its own port as a
  // sibling landing. The long march gone, `stuck`'s march-is-not-a-stall claim is the planted cases' above.
  it('seed 19206 (Japan): 120 days, none broken; no division gathers two weeks (R43a: 367 46 → 28 → 4 days)', () => {
    const notes: string[] = [];
    expect(landingBreaks({ seed: 19206, setup: 3517, days: 120, orders: 19206, probeDays: [30], notes })).toEqual([]);
    const longest = notes.map((n) => Number(/landing ([\d.]+) days/.exec(n)?.[1] ?? 0));
    expect(longest.length, 'the notes').toBeGreaterThan(0);
    expect(Math.max(...longest), notes.join('\n')).toBeLessThan(14);
  }, 300_000);
  it('seed 19207 (Japan): 120 days, none broken (R40e: 366 re-sent walked 24 days to the group it freed)', () => {
    expect(landingBreaks({ seed: 19207, setup: 3517, days: 120, orders: 19207, probeDays: [30] })).toEqual([]);
  }, 300_000);
});
