import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { PORT_SHUT } from '../../src/sim/systems/bombing';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { isBound, portOf } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R21b (critic run 33, R33-N2): a division whose order over the sea is refused at its own
// port, bombed shut, is told that the port is shut (`PortShut`), not "it stands at no port of its
// nation". Britain played, a division by London ordered to Belfast; its port shut while it marches.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const BELFAST = cellOf(-5.93, 54.6, W, H) as [number, number];

describe('a port bombed shut says so (ROADMAP R21b)', () => {
  it('the port of its convoy shut while it marches there: refused PortShut', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    w.settings.player = ENG;
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const [lx, ly] = cellOf(-0.12, 51.5, W, H);
    let div = 0;
    let best = Infinity;
    w.formations.forEach((id) => {
      if (c.nation[id] !== ENG || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== comp[Math.floor(ly) * W + Math.floor(lx)]) return;
      const d = (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2;
      if (d < best) [best, div] = [d, id];
    });
    s.command({ kind: 'moveFormation', id: div, x: BELFAST[0], y: BELFAST[1], nation: ENG });
    s.step(1);
    // ROADMAP R33b: bound for a landing, at its port.
    expect(isBound(w, div), 'bound for a landing').toBe(true);
    const port = portOf(w, div)!;
    let why: number | undefined;
    for (let h = 0; h < 24 * 20 && why === undefined && !w.embarked.has(div); h++) {
      w.portDamage.set(port, PORT_SHUT);
      s.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MoveRejected && ev[i + 2] === div) why = ev[i + 4]!;
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
    }
    expect(w.embarked.has(div), 'not aboard at a shut port').toBe(false);
    expect(why, `refused at ${w.ports[port]!.name}, shut`).toBe(RejectReason.PortShut);
  });
});
