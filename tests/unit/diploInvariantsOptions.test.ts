import { describe, expect, it } from 'vitest';
import { diploBreaks } from '../helpers/diploInvariants';

// ADR-804: the rules of war and peace (ADR-803) with the new-game options the other two files leave
// at their defaults, since a feature rides on all of them: the heroes on (PLAN 7.184) with random
// diplomacy, and the random world of 60 nations (ADR-108).

describe('the rules of war and peace hold together: the heroes and the random world (ADR-804)', () => {
  it('seed 8821, random diplomacy, heroes on: no land held at peace, no silent exit, no war in a realm, no bond refused', () => {
    expect(diploBreaks({ seed: 8821, diplomacy: 'random', heroes: true, days: 180, probeDays: [30, 90, 150], perKind: 4 })).toEqual([]);
  }, 300_000);

  it('the random world of 60, seed 7, random diplomacy: the same rules', () => {
    expect(diploBreaks({ seed: 7, diplomacy: 'random', world: 'random', nations: 60, days: 180, probeDays: [30, 90, 150], perKind: 4 })).toEqual([]);
  }, 300_000);
});
