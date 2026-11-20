import { describe, expect, it } from 'vitest';
import { diploBreaks } from '../helpers/diploInvariants';

// ADR-804: the rules of war and peace (ADR-803) with the new-game options the other two files leave
// at their defaults, since a feature rides on all of them: the heroes on (PLAN 7.184) with random
// diplomacy, and the random world of 60 nations (ADR-108) and of three (R217).

describe('the rules of war and peace hold together: the heroes and the random world (ADR-804)', () => {
  it('seed 8821, random diplomacy, heroes on: no land held at peace, no silent exit, no war in a realm, no bond refused', () => {
    expect(diploBreaks({ seed: 8821, diplomacy: 'random', heroes: true, days: 180, probeDays: [30, 90, 150], perKind: 4 })).toEqual([]);
  }, 300_000);

  it('the random world of 60, seed 7, random diplomacy: the same rules', () => {
    expect(diploBreaks({ seed: 7, diplomacy: 'random', world: 'random', nations: 60, days: 180, probeDays: [30, 90, 150], perKind: 4 })).toEqual([]);
  }, 300_000);

  // ROADMAP R217: a random world of three whose nation 2 has its whole army on its capital's continent and its borders on
  // another land (red before: its massing on 3 begun on day 5 with no man there; and seed 7's 60 on day 131, 58 on 28).
  it('the random world of 3, seed 89404: the same rules, no massing begun with no man on its border', () => {
    expect(diploBreaks({ seed: 89404, diplomacy: 'scenario', world: 'random', nations: 3, days: 180, probeDays: [60, 150], perKind: 4 })).toEqual([]);
  }, 300_000);
});
