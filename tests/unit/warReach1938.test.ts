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
const [ENG, BRA, ITA, EGY, RAJ, AST, CAN, FRA, GER, SUD] = ['ENG', 'BRA', 'ITA', 'EGY', 'RAJ', 'AST', 'CAN', 'FRA', 'GER', 'SUD'].map(nationId) as number[];

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

  // ROADMAP R53k (the user's choice a, 2026-11-08): reach is to any nation of the other side, not only its leader's
  // realm. By the leader's realm alone Australia and Canada fought no war in 20 years (20899, 24099): a colony beside an
  // enemy's ally stayed out. Germany and Italy allied, Germany on the United Kingdom: Italy joins (Libya is at Egypt),
  // and Egypt and Sudan, far from Germany, join against Italy beside them; Canada and Australia, far from both, do not.
  it("Germany, allied to Italy, on the United Kingdom: the colonies at Italy's border join, the far ones do not", () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    s.command({ kind: 'createAlliance', leader: GER!, members: [ITA!], nameKey: 'test' });
    s.step(1);
    const war = declareWar(s.world, GER!, ENG!)!;
    expect(war.sides[0], 'Italy, by its pact, near the United Kingdom’s Egypt').toContain(ITA);
    const d = war.sides[1];
    expect(d, 'Egypt, at Libya').toContain(EGY);
    expect(d, 'Sudan, at Italian East Africa').toContain(SUD);
    expect(d, 'Canada').not.toContain(CAN);
    expect(d, 'Australia').not.toContain(AST);
  });
});
