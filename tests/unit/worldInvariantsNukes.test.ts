import { describe, expect, it } from 'vitest';
import { TAGS_1938 } from '../../src/sim/scenario1938';
import type { Sim } from '../../src/sim/sim';
import { basePlace } from '../../src/sim/systems/air';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R4d: the nukes' rules (`tests/helpers/worldInvariants.ts`) on half a year of four 1938
// worlds and four random ones: a launch needs nukes allowed, a warhead and a means (a strategic
// bomber in range, or missiles); every launch that ends is told as a burst or an interception;
// a stockpile grows only by one built at the day's pass. In half a year no AI strikes, so on 7019
// God gives the Soviet Union three warheads on day 10 and it launches one by bomber near its base.
// Red with a launch that spends no warhead (the stockpile "grew by 1, 0 built") and with a missile
// launched without the tech.

const SOV = TAGS_1938.indexOf('SOV') + 1;

/** God's three warheads to the Soviet Union, and a launch by its first strategic bomber, 3 cells east of its base. */
function sovietStrike(s: Sim): void {
  const w = s.world;
  w.warheads.set(SOV, { stock: 3, paid: 0 });
  const rules = w.rules!;
  for (const [id, base] of [...w.wingBase].sort((a, b) => a[0] - b[0])) {
    const first = rules.templates[w.formations.cols.template[id]!]!.elements[0]!;
    if (w.formations.cols.nation[id] !== SOV || base <= 0 || rules.units[first.unit]!.cls !== 'bomber_str') continue;
    const [x, y] = basePlace(w, base)!;
    s.command({ kind: 'launchNuke', nation: SOV, x: x + 3, y, missile: false });
    return;
  }
  throw new Error('no Soviet strategic bomber at an airbase');
}

describe('the nukes’ rules (ROADMAP R4d)', () => {
  it('1938, seed 7019: God arms the Soviet Union, which strikes by bomber', () => {
    let after = -1;
    const lines = worldBreaks({ seed: 7019, days: 180, rules: ['nukes'], acts: [{ day: 10, act: sovietStrike }, { day: 11, act: (s) => (after = s.world.warheads.get(SOV)?.stock ?? -1) }] });
    expect(lines).toEqual([]);
    expect(after).toBe(2);
  });
  for (const seed of [2207, 3739, 1009]) {
    it(`1938, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, rules: ['nukes'] })).toEqual([]);
    });
  }
  for (const seed of [7, 11, 23, 8821]) {
    it(`the random world of 60, seed ${seed}`, () => {
      expect(worldBreaks({ seed, days: 180, world: 'random', nations: 60, rules: ['nukes'] })).toEqual([]);
    });
  }
});
