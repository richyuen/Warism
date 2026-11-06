import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { PORT_SHUT } from '../../src/sim/systems/bombing';
import { navOf, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { isBound, portOf } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R22a (critic run 34, R34-B1): a division refused at the port it marched to arrives there
// and is refused there in one hour; the worker forgot the player's order at the arrival and the
// refusal reached no page. The R21b case through the worker: Britain played, the division nearest
// London ordered to Belfast, its convoy's port bombed shut while it marches.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const BELFAST = cellOf(-5.93, 54.6, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

describe('a refusal at the port a division marched to is told (ROADMAP R22a)', () => {
  it('the port shut while it marches: the page is told PortShut', () => {
    const news: OrderNews[] = [];
    const s = new SimServer((m: FromWorker) => {
      if (m.type === 'orderNews') news.push(m.news);
    });
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: ENG } }, 1);
    const w = s.sim!.world;
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
    s.handle({ type: 'cmd', cmd: { kind: 'moveFormation', id: div, x: BELFAST[0], y: BELFAST[1], nation: ENG } }, 1);
    let why: number | undefined;
    let at = -1;
    const drain = (x: World): void => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MoveRejected && ev[i + 2] === div) [why, at] = [ev[i + 4]!, ev[i]!];
      (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
    };
    s.sim!.step(1, drain);
    // ROADMAP R33b: bound for a landing, at its port.
    expect(isBound(w, div), 'bound for a landing').toBe(true);
    const port = portOf(w, div)!;
    for (let h = 0; h < 24 * 20 && why === undefined && !w.embarked.has(div); h++) {
      w.portDamage.set(port, PORT_SHUT);
      s.sim!.step(1, drain);
    }
    expect(why, `refused in the sim at ${w.ports[port]!.name}`).toBe(RejectReason.PortShut);
    const told = news.filter((n) => n.id === div && n.kind === 'refused');
    expect(told.map((n) => n.reason), 'the page is told').toEqual([RejectReason.PortShut]);
    expect(told[0]!.tick).toBe(at);
  });
});
