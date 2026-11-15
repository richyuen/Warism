import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R84a (ADR-1060; critic run 69, R69-B1): the occupations the historical track excused go back to their owners
// as it ends, as a peace returns the land of the war it ends (`diploInvariants`' `held`). A game left free in 1946 kept
// Japan, Manchuria and Iran held at peace for years. Ended by an intervention, what that command changed stays: God's
// paint of one nation's control on a neighbour at peace is the act, not the track's.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

/** A world a day into the replay with `n` of Switzerland's cells held by Germany at peace, as an `occupy` leaves land. */
function occupied(n: number): { sim: Sim; cells: number[] } {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 51515 } });
  sim.step(24, quiet);
  const w = sim.world;
  const [deu, swi] = [id('GER'), id('SWI')];
  expect(w.wars.atWar(deu, swi)).toBe(false);
  const cells: number[] = [];
  for (let c = 0; c < w.cells.owner.length && cells.length < n; c++) if (w.cells.owner[c] === swi && w.cells.controller[c] === swi) cells.push(c);
  expect(cells.length).toBe(n);
  for (const c of cells) w.setController(c, deu);
  return { sim, cells };
}

/** Cells of the world held by a nation at peace with their owner. */
const heldAtPeace = (w: World): number => {
  let k = 0;
  const { owner, controller } = w.cells;
  for (let c = 0; c < owner.length; c++) if (owner[c] !== 0 && controller[c] !== 0 && controller[c] !== owner[c] && !w.wars.atWar(owner[c]!, controller[c]!)) k++;
  return k;
};

describe("the track's occupations as it ends (ROADMAP R84a)", () => {
  it('a game left free gives them back to their owners in that hour', () => {
    const { sim, cells } = occupied(40);
    expect(heldAtPeace(sim.world)).toBeGreaterThanOrEqual(40);
    sim.command({ kind: 'leaveTrack' });
    sim.step(1, quiet);
    expect(sim.world.track!.ended).toBe(true);
    expect(cells.filter((c) => sim.world.cells.controller[c] !== id('SWI'))).toEqual([]);
    expect(heldAtPeace(sim.world)).toBe(0);
  });

  it("with the new game's options too", () => {
    const { sim } = occupied(40);
    sim.command({ kind: 'leaveTrack', options: { diplomacy: 'random', heroes: 'on' } });
    sim.step(1, quiet);
    expect(heldAtPeace(sim.world)).toBe(0);
  });

  it('ended by an intervention, they go back but what the command painted stays', () => {
    const { sim, cells } = occupied(40);
    const w = sim.world;
    // God paints Germany's control over a patch of Belgium, at peace: the act that ends the track.
    const bel = id('BEL');
    let at = -1;
    for (let c = 0; c < w.cells.owner.length && at < 0; c++) if (w.cells.owner[c] === bel && w.cells.terrain[c] !== 0) at = c;
    const x = (at % w.cells.w) + 0.5;
    const y = Math.floor(at / w.cells.w) + 0.5;
    sim.command({ kind: 'paintControl', nation: id('GER'), x, y, r: 1 });
    sim.step(1, quiet);
    expect(w.track!.ended).toBe(true);
    expect(cells.filter((c) => w.cells.controller[c] !== id('SWI'))).toEqual([]);
    expect(w.cells.controller[at]).toBe(id('GER'));
    expect(heldAtPeace(w)).toBeGreaterThan(0);
  });

  it('a refused command leaves the track and its occupations as they were', () => {
    const { sim, cells } = occupied(40);
    sim.command({ kind: 'forcePeace', war: 987654 });
    sim.step(1, quiet);
    expect(sim.world.track!.ended).toBe(false);
    expect(cells.filter((c) => sim.world.cells.controller[c] !== id('GER'))).toEqual([]);
  });
});
