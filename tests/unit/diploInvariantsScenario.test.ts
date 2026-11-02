import { describe, expect, it } from 'vitest';
import { diploBreaks } from '../helpers/diploInvariants';

// ADR-803: the rules of war and peace that critic runs 24–26 each found broken by the fix before
// (R24-B1 land held at peace, R25-B1 a war left with no row, R26-B1 a bond's break refused for
// `Beside`), checked together on the scenario's diplomacy: half a year stepped, and on days 30, 90
// and 150 the wars a player or God could declare tried on copies. Red on e4386478 (R25-B1) and on
// 33c84306 (R26-B1). A seed the critic named (7019) and one it did not.

describe('the rules of war and peace hold together: the scenario diplomacy (ADR-803)', () => {
  for (const seed of [7019, 2207]) {
    it(`seed ${seed}: no land held at peace, no silent exit, no war in a realm, no bond's break refused`, () => {
      expect(diploBreaks({ seed, diplomacy: 'scenario', days: 180, probeDays: [30, 90, 150], perKind: 4 })).toEqual([]);
    }, 300_000);
  }
});
