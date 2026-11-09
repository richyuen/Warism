import { describe, expect, it } from 'vitest';
import type { World } from '../../src/sim/world';
import { LandingState } from '../../src/sim/systems/landings';
import { EventKind } from '../../src/shared/events';
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

// ROADMAP R55d (critic run 56, R56-N3): orders only in the first 8 days, so the last clicks run undisturbed and are
// judged (the fuzz re-clicks too often for most to be); a click with no idle group is reckoned by the nation's other
// groups. 24033 two groups is R56-N2's case (367's 77 days, broken before R55c). R55f (ADR-898): 26035, 26039, 26041
// and 27045 broke before it (clicks walking to a far port up to 88.5 days; 26041's L3 waiting 29 days for a sibling).
// R55g (ADR-899): 26039 Britain, 273 stood 45 days at its port by a group too small for it.
describe('the rules hold with orders that stop early (ROADMAP R55d)', () => {
  for (const [seed, setup, groups] of [[24033, 3517, 2], [26045, 3517, 2], [27031, 15101, 2], [26035, 3517, 2], [26039, 3517, 2], [26041, 3517, 2], [27045, 3517, 2], [26039, 15101, 2]] as const) {
    it(`seed ${seed} (${setup === 3517 ? 'Japan' : 'Britain'}, ${groups} groups), orders for 8 days: 120 days, none broken`, () => {
      expect(landingBreaks({ seed, setup, days: 120, orders: seed, probeDays: [], groups, orderDays: 8 })).toEqual([]);
    }, 300_000);
  }
});

// ROADMAP R56a (critic run 57, R57-B1). 28037, two groups, orders for 8 days: t179's click of 365 (at Hiroshima's port)
// and 366 (a week's march off) sailed when 366 walked in, five days after its groups were there: ashore 14.2 days after
// the click, its best way 6.7. Now a landing waits for a marcher only while it can still sail inside the click's week
// (`Landing.due`). 28039, one group: t853's click of four, 365 and 367 clicked again onto the same landing and ashore
// 11.0 days after it (best 10.7), was judged by 366 alone, left for the group's second voyage (`slowClick` keeps a click
// whose divisions are clicked again onto the same landing).
describe('a click lands within its week (ROADMAP R56a)', () => {
  it('seed 28037 (Japan, 2 groups), orders for 8 days: 120 days, none broken', () => {
    expect(landingBreaks({ seed: 28037, setup: 3517, days: 120, orders: 28037, probeDays: [], groups: 2, orderDays: 8 })).toEqual([]);
  }, 300_000);
  it('seed 28039 (Japan, 1 group): 120 days, none broken', () => {
    expect(landingBreaks({ seed: 28039, setup: 3517, days: 120, orders: 28039, probeDays: [], groups: 1 })).toEqual([]);
  }, 300_000);
});

// ROADMAP R57a (critic run 58, R58-B1). 29043, the UK at 15101: t1068's click of 270–274 sailed with 271 and 272 and
// left 273 for the second voyage; at t1195 271 and 272, aboard, were clicked onto the open sea beside their landing,
// refused (`OpenSea`) and kept in it, ashore 6.6 days after t1068's click (best 3.4). `slowClick` took them from the
// click before it read the refusal and judged it by 273 alone: 11.3 days. A refused order takes no one from a click.
// ROADMAP R57b (critic run 58, R58-N1). 28037, two groups, orders for 8 days: t179's landing sailed at t274 with 365
// (R56a's due) while 366 still marched, untold; 366 reached Hiroshima's port at t397 beside 1144, an empty group of the
// landing kept there with room for it, and waited five days for 1136 to come back from the first voyage: ashore at
// t645, 19.4 days after the click (run 57's sim: both at 14.2). Now one left marching is told at the sail hour, and a
// next voyage sails with the groups at its port when they have room for all there.
describe('a division a landing sails without is told and not kept waiting (ROADMAP R57b)', () => {
  it('seed 28037 (Japan, 2 groups), orders for 8 days: 366 told as it sails, ashore within 16 days of the click', () => {
    let told = -1;
    let ashore = -1;
    const breaks = landingBreaks({
      seed: 28037, setup: 3517, days: 120, orders: 28037, probeDays: [], groups: 2, orderDays: 8,
      events: (w, ev) => {
        for (let i = 0; i < ev.length; i += 6) {
          if (ev[i + 2] !== 366) continue;
          if (ev[i + 1] === EventKind.NextVoyage && told < 0 && w.formations.cols.moving[366] === 1) told = ev[i]!;
          if (ev[i + 1] === EventKind.FormationLanded && ashore < 0 && ev[i]! > 179) ashore = ev[i]!;
        }
      },
    });
    expect(breaks).toEqual([]);
    expect(told, '366 told the hour its landing sailed without it').toBeGreaterThan(179);
    expect(told).toBeLessThan(300);
    expect(ashore, '366 ashore').toBeGreaterThan(0);
    expect((ashore - 179) / 24).toBeLessThan(16);
  }, 300_000);
});

describe('a refused click takes no one from a click (ROADMAP R57a)', () => {
  it('seed 29043 (the UK, 2 groups): 120 days, none broken', () => {
    expect(landingBreaks({ seed: 29043, setup: 15101, days: 120, orders: 29043, probeDays: [30, 90], groups: 2 })).toEqual([]);
  }, 300_000);
  it('seed 29043 (the UK): 120 days, none broken', () => {
    expect(landingBreaks({ seed: 29043, setup: 15101, days: 120, orders: 29043, probeDays: [30, 90] })).toEqual([]);
  }, 300_000);
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
