import { afterEach, describe, expect, it } from 'vitest';
import { firstNotOutnumbered, outnumbered, PILE_PROBE, PILE_REALMS, warTarget } from '../../src/sim/ai/strategic';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { callSides, declareWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R82f (critic run 68's R68-N5; ADR-1042, the user's choice (a)): the AI declares no war in which the side
// `declareWar` would call against it has over PILE_REALMS realms (nations that are no puppet) for each of its own. The
// critic's case, 41141 day 299: Nationalist Spain alone on France, with Britain, the Netherlands, Switzerland and
// Belgium beside it (1:5 by realm, 1:9 by nations), its utility 0.62 (France at war 0.30, a claim 0.30).
const id = (t: string): number => TAGS_1938.indexOf(t) + 1;
const world = (): World => {
  const w = new Sim({ scenario: '1938', seed: 41141, assets: assets1938(SIZE_1938.w) }).world;
  const al = w.alliances;
  for (const t of ['NED', 'SWI', 'BEL']) {
    al.leave(id(t));
    expect(al.join(id(t), al.allianceOf(id('FRA'))!), t).toBe(true);
  }
  return w;
};
const realms = (w: World, side: readonly number[]): number => side.filter((x) => w.nations.cols.overlord[x] === 0).length;

describe('no AI war outnumbered over 4 realms to 1 (ROADMAP R82f)', () => {
  afterEach(() => {
    PILE_PROBE.off = false;
  });

  it("Nationalist Spain on France's alliance: outnumbered, by the sides declareWar calls", () => {
    const w = world();
    const [a, d] = callSides(w, id('NSP'), id('FRA'));
    expect(realms(w, a)).toBe(1);
    expect(realms(w, d)).toBeGreaterThan(PILE_REALMS);
    expect(outnumbered(w, id('NSP'), id('FRA'))).toBe(true);
    // The sides asked are the sides the war has.
    const war = declareWar(w, id('NSP'), id('FRA'))!;
    expect(war.sides).toEqual([a, d]);
  });

  it('the AI does not declare on it, however it scores, and takes its next best; with the rule off it does', () => {
    const w = world();
    const pick = (among: number[]) => (refused: ReadonlySet<number>): number => warTarget(w, id('NSP'), among, 1e9, (t) => (t === id('FRA') ? 1 : 2), 0, 0.3, new Set(), undefined, refused);
    expect(firstNotOutnumbered(w, id('NSP'), pick([id('FRA')]))).toBe(0);
    // Portugal (alone) scores below France and is taken in its stead.
    expect(firstNotOutnumbered(w, id('NSP'), pick([id('FRA'), id('POR')]))).toBe(id('POR'));
    PILE_PROBE.off = true;
    expect(firstNotOutnumbered(w, id('NSP'), pick([id('FRA'), id('POR')]))).toBe(id('FRA'));
  });

  it('a side of equal realms, or a lone target, is not outnumbered', () => {
    const w = world();
    expect(outnumbered(w, id('FRA'), id('NSP'))).toBe(false);
    expect(outnumbered(w, id('HUN'), id('AUT'))).toBe(false);
  });
});
