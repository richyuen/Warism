import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R3 (R27-N2): a declaration calls the defender's allies, guarantors and puppets; one of
// them at war with a nation of the side it is called to stays out, as one at war with the enemy
// does (ADR-230). Seed 1009, day 91: Italy on Turkey called Czechoslovakia, at war with Turkey and
// Iran, to Turkey's side as a guarantor, and the two sides of war 14 held nations at war.

describe('a nation called beside one it is at war with stays out (ROADMAP R3)', () => {
  it('Lithuania, at war with Poland and its guarantor, is not called to Poland’s side when Germany declares', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(SIZE_1938.w) });
    const w = s.world;
    const [GER, POL, LIT] = ['GER', 'POL', 'LIT'].map(nationId) as [number, number, number];
    for (const n of [GER, POL, LIT]) {
      w.alliances.leave(n);
      w.alliances.guarantees = w.alliances.guarantees.filter((g) => g.guarantor !== n && g.target !== n);
    }
    expect(declareWar(w, LIT, POL, true)).not.toBeNull();
    w.alliances.guarantees.push({ guarantor: LIT, target: POL });
    const war = declareWar(w, GER, POL)!;
    expect(war).not.toBeNull();
    expect(war.sides[1]).toContain(POL);
    expect(war.sides[1]).not.toContain(LIT);
    // No side of any war holds two nations at war with each other.
    for (const x of w.wars.list) for (const side of x.sides) for (const a of side) for (const b of side) if (a < b) expect(w.wars.atWar(a, b), `${a} and ${b}`).toBe(false);
    // Lithuania fights on in its own war.
    expect(w.wars.atWar(LIT, POL)).toBe(true);
  });
});
