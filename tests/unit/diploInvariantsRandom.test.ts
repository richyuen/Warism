import { describe, expect, it } from 'vitest';
import { diploBreaks } from '../helpers/diploInvariants';

// ADR-803: as `diploInvariantsScenario`, with "Alliances and wars: random" (PLAN 7.182), where the
// scenario's wars are let go of at the start (R24-B1: Japan held China at peace, red on 82d428c1).
// A seed the critic named (8821) and one it did not.

describe('the rules of war and peace hold together: random diplomacy (ADR-803)', () => {
  for (const seed of [8821, 3739]) {
    it(`seed ${seed}: no land held at peace, no silent exit, no war in a realm, no bond's break refused`, () => {
      expect(diploBreaks({ seed, diplomacy: 'random', days: 180, probeDays: [30, 90, 150], perKind: 4 })).toEqual([]);
    }, 300_000);
  }
});
