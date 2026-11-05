import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import { isLand } from '../../src/shared/terrain';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R22g (critic run 34, R34-N4): Britain's division ordered onto the open sea off Bergen was told
// "there is no way by land that keeps off the ground of nations outside its wars", a march it was never
// asked for. Now it is told there is only sea there (`OpenSea`), whether the player gives the order or
// not. A target on Britain's own coast water still snaps to the land, and goes.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const OFF_BERGEN = [1048.5, 199.5] as const;

describe('an order to the open sea says so (ROADMAP R22g)', () => {
  it('Britain\'s division onto the water off Bergen: refused OpenSea, as the player and not', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    w.settings.player = ENG;
    expect(isLand(w.cells.terrain[Math.floor(OFF_BERGEN[1]) * W + Math.floor(OFF_BERGEN[0])]!), 'open sea').toBe(false);
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
    const why = (nation?: number): number[] => {
      s.command({ kind: 'moveFormation', id: div, x: OFF_BERGEN[0], y: OFF_BERGEN[1], ...(nation ? { nation } : {}) });
      const out: number[] = [];
      s.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MoveRejected && ev[i + 2] === div) out.push(ev[i + 4]!);
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
      return out;
    };
    expect(why(ENG), 'the player\'s order').toEqual([RejectReason.OpenSea]);
    expect(why(), 'an order of no player').toEqual([RejectReason.OpenSea]);
    // The Thames's water by London: snapped to the land, and it goes.
    const [tx, ty] = cellOf(0.6, 51.5, W, H);
    expect(isLand(w.cells.terrain[Math.floor(ty) * W + Math.floor(tx)]!), 'the estuary is water').toBe(false);
    s.command({ kind: 'moveFormation', id: div, x: Math.floor(tx) + 0.5, y: Math.floor(ty) + 0.5, nation: ENG });
    const refused: number[] = [];
    s.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MoveRejected && ev[i + 2] === div) refused.push(ev[i + 4]!);
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    expect(refused, 'coast water goes').toEqual([]);
  });
});
