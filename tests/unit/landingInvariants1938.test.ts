import { describe, expect, it } from 'vitest';
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
});
