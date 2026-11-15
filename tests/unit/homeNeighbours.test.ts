import { describe, expect, it } from 'vitest';
import { HOME_KM2, homeNeighbours, neighbourMap } from '../../src/sim/ai/strategic';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R82d (ADR-1041) and R84h (ADR-1065): a nation's home, the land whose borders cost no war across the sea. Its
// capital's land, joined over its own; and since R84h each other piece of its own of HOME_KM2 or more. French Guiana
// (84,000 km²) is a colony: Brazil is France's land neighbour, not its home's. A three-nation random world's nations hold
// land on several continents in pieces of hundreds of thousands of km²: critic run 69's R69-N5, 51401's second nation
// bordering the third only by a piece of 585,000 km², every war it could make priced as one across the sea.

const id = (t: string): number => TAGS_1938.indexOf(t) + 1;

describe("a nation's home (ROADMAP R82d, R84h)", () => {
  it("1938: Brazil borders France by French Guiana, not France's home", () => {
    const sim = new Sim({ scenario: '1938', seed: 99, assets: assets1938(SIZE_1938.w) });
    const [fra, bra, bel] = [id('FRA'), id('BRA'), id('BEL')];
    expect(neighbourMap(sim.world).get(fra)?.has(bra)).toBe(true);
    const home = homeNeighbours(sim.world, fra)!;
    expect(home.has(bra)).toBe(false);
    expect(home.has(bel)).toBe(true);
  });

  it(`a random world's piece of ${HOME_KM2.toLocaleString('en')} km² or more is home: 51401's second nation borders the third`, () => {
    const sim = new Sim({ scenario: 'random', seed: 51401, assets: assets1938(2048), options: { nations: 3 } });
    expect(neighbourMap(sim.world).get(2)?.has(3)).toBe(true);
    expect(homeNeighbours(sim.world, 2)?.has(3)).toBe(true);
  });
});
