import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { landlessPowers } from '../../src/sim/ai/economic';
import { neighbourMap } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportGroupsAtPort } from '../../src/sim/systems/amphibious';
import { assets1938 } from '../helpers/earth';

// ROADMAP R85e (ADR-1068; critic run 70, R70-N3): a three-nation world whose nations share no land border had no war in
// ten years. Their wars could only be across the sea, the strategic AI's sea targets need a transport group at port, and
// only a war ordered one. A sea power at peace with no land neighbour now orders one; and for a nation with no land
// neighbour each target across the sea costs only the distance beyond its nearest. Plain 1938 has no such power.

describe('the sea powers with no land neighbour (ROADMAP R85e)', () => {
  it("plain 1938 has none: its powers' rules as before", () => {
    const sim = new Sim({ scenario: '1938', seed: 99, assets: assets1938(SIZE_1938.w) });
    expect([...landlessPowers(sim.world)]).toEqual([]);
  });

  it('a three-nation world of separate lands: each is one, builds a transport group and goes to war across the sea', () => {
    const sim = new Sim({ scenario: 'random', seed: 53404, assets: assets1938(2048), options: { nations: 3 } });
    const w = sim.world;
    for (const n of [1, 2, 3]) expect(neighbourMap(w).get(n)?.size ?? 0).toBe(0);
    expect([...landlessPowers(w)].sort()).toEqual([1, 2, 3]);
    let war = -1;
    sim.step(240 * 24, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (war < 0 && ev[i + 1] === EventKind.WarDeclared) war = Math.floor(ev[i]! / 24);
      ev.length = 0;
      x.out.fires.length = 0;
    });
    expect([1, 2, 3].some((n) => transportGroupsAtPort(w, n).length > 0 || w.wars.list.some((x) => x.sides.flat().includes(n)))).toBe(true);
    expect(war).toBeGreaterThanOrEqual(0);
  });
});
