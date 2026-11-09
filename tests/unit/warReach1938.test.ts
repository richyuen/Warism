import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R53l (critic run 54: year-one wars are dogpiles; on 21129 at day 365 "United Kingdom +35 ⚔ Brazil", 31 of
// the 35 puppets, colonies an ocean from Brazil): a puppet of either side, and an ally of the attacker, join a war
// only within WAR_REACH_KM of the other leader's realm (ADR-887). The defender's allies keep their pact wherever they
// are. Declared at the 1938 start, so no game's history is in it.

const W = SIZE_1938.w;
const [ENG, BRA, ITA, EGY, RAJ, AST, CAN, FRA] = ['ENG', 'BRA', 'ITA', 'EGY', 'RAJ', 'AST', 'CAN', 'FRA'].map(nationId) as number[];

describe('who joins a war: within reach (R53l)', () => {
  it("the United Kingdom on Brazil: none of its colonies an ocean away", () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    for (const p of [RAJ!, AST!, CAN!]) expect(w.nations.cols.overlord[p], `${p} is a British puppet in 1938`).toBe(ENG);
    const war = declareWar(w, ENG!, BRA!)!;
    expect(war).not.toBeNull();
    const [a, d] = war.sides;
    for (const p of [RAJ!, AST!, CAN!]) expect(a, `puppet ${p}`).not.toContain(p);
    expect(a.length, `attackers ${a.join(',')}`).toBeLessThanOrEqual(4 * d.length);
    // Those at peace stay so.
    expect(w.wars.atWar(RAJ!, BRA!)).toBe(false);
  });

  it('Italy on the United Kingdom: a colony at its border joins, its ally by pact, not one an ocean away', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    expect(w.alliances.allianceOf(ENG!)?.members ?? [], 'France is the United Kingdom’s ally in 1938').toContain(FRA);
    const war = declareWar(w, ITA!, ENG!)!;
    const d = war.sides[1];
    expect(d, 'Egypt, at Libya').toContain(EGY);
    expect(d, 'France, by its pact').toContain(FRA);
    expect(d, 'Australia').not.toContain(AST);
  });
});
