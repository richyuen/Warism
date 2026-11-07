import { describe, expect, it } from 'vitest';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { LandingState } from '../../src/sim/systems/landings';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R33b (ADR-830): the player's landings are state (`world.landings`, saved only while there is one).
// A save while a landing gathers, and one while it sails, load bit-identical (goal 4), and the loaded run goes
// on as the one it was saved from: the same hash a day later, an order given to both after the load too.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

describe("a save with the player's landings round-trips (ROADMAP R33b)", () => {
  it('Japan two to Shanghai: saved gathering and sailing, loaded bit-identical, the same a day on', () => {
    const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
    const w = sim.world;
    sim.command({ kind: 'setPlayer', nation: JAP });
    sim.step(1);
    if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
    sim.step(1);
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    const pair = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
    // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
    // of its own there, a sibling): this test's one landing at Tokyo.
    nearPort(w, pair, portNamed(w, 'Tokyo'), [0, 4]);
    for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
    // After the load, the same order to both (a landing's merge picks by id, not by the map's order).
    const check = (what: string, order?: [number, number]): void => {
      const bytes = sim.save();
      const other = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
      other.load(bytes);
      expect(other.save(), `${what}: loaded bit-identical`).toEqual(bytes);
      if (order) for (const s of [sim, other]) for (const id of pair) s.command({ kind: 'moveFormation', id, x: order[0], y: order[1], nation: JAP, escort: true });
      sim.step(24);
      other.step(24);
      expect(other.hash(), `${what}: the same a day on`).toBe(sim.hash());
    };
    sim.step(4);
    expect([...w.landings.values()].map((l) => l.state), 'one landing, gathering').toEqual([LandingState.gathering]);
    check('gathering');
    check('gathering, redirected after the load', FUZHOU);
    check('gathering, sent back after the load', SHANGHAI);
    for (let h = 0; h < 24 * 60 && ![...w.landings.values()].some((l) => l.state === LandingState.sailing); h++) sim.step(1);
    expect([...w.landings.values()].some((l) => l.state === LandingState.sailing), 'it sails').toBe(true);
    check('sailing', SHANGHAI);
  }, 300_000);
});
