import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { nationId } from '../helpers/sim1938';
import { assets1938 } from '../helpers/earth';

// ROADMAP R33d (critic run 43, R43-N1): Britain, seed 15101, its empty transports 1072 clicked onto the Channel
// (1010.5, 288.5) at war with Germany. Red: they arrive at t12 and are the AI's at once (R31d's "transports with
// no landing and nobody aboard are the AI's"): back towards Plymouth by t26, sailed off at t362. Now a fleet the
// player ordered keeps its order, as warships do; only transports a landing called are handed back
// (`PlayerOrderKind.called`; `landingJoinsAboard1938`'s idle check).

const { w: W } = SIZE_1938;
const ENG = nationId('ENG');
const GER = nationId('GER');
const TO: [number, number] = [1010.5, 288.5];

describe("a player's order to empty transports is kept (ROADMAP R33d, R43-N1)", () => {
  it('Britain 15101, transports 1072 onto the Channel: there and still the player\'s 20 days on', () => {
    const sim = new Sim({ scenario: '1938', seed: 15101, assets: assets1938(W) });
    const w = sim.world;
    sim.command({ kind: 'setPlayer', nation: ENG });
    sim.step(1);
    if (!w.wars.atWar(ENG, GER)) sim.command({ kind: 'declareWar', attacker: ENG, defender: GER });
    sim.step(1);
    const g = 1072;
    expect(w.isFleet(g) && w.formations.cols.nation[g] === ENG && transportRoom(w, g) > 0, 'British transports').toBe(true);
    sim.command({ kind: 'moveFormation', id: g, x: TO[0], y: TO[1], nation: ENG });
    const c = w.formations.cols;
    const off = (): number => Math.hypot(c.x[g]! - TO[0], c.y[g]! - TO[1]);
    let arrived = -1;
    for (let h = 0; h < 24 * 20; h++) {
      sim.step(1);
      if (!w.formations.has(g)) break;
      if (arrived < 0 && off() < 1.5) arrived = w.tick;
      if (arrived >= 0) expect(off(), `t${w.tick}: still where it was ordered`).toBeLessThan(1.5);
    }
    expect(arrived, 'arrived').toBeGreaterThan(0);
    expect(w.formations.has(g) ? w.playerOrders.has(g) : true, "still the player's").toBe(true);
  }, 300_000);
});
