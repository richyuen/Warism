import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { destroyFormation } from '../../src/sim/systems/elements';
import { navOf, portSeaOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R17a: a player's order over the sea from a land whose ports have no transports calls
// them. Britain played, its transport groups all at Gibraltar, a division by London ordered to
// Belfast (Ulster, another land): the nearest group sails to an English port under the player's
// order, the division marches there and waits, boards that group and lands in Ulster. With no
// transports anywhere the order is refused as before; an order that is not a player's calls none.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');

interface Case {
  s: Sim;
  w: World;
  div: number;
  transports: number[];
  belfast: [number, number];
}

function britain(): Case {
  const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = s.world;
  w.settings.player = ENG;
  const c = w.formations.cols;
  const water = portSeaOf(w);
  const gib = w.ports.findIndex((p) => p.name === 'Gibraltar');
  expect(w.cells.controller[w.ports[gib]!.cell]).toBe(ENG);
  const transports: number[] = [];
  w.formations.forEach((id) => {
    if (w.isFleet(id) && c.nation[id] === ENG && transportRoom(w, id) > 0) transports.push(id);
  });
  expect(transports.length).toBeGreaterThan(0);
  for (const id of transports) [c.x[id], c.y[id]] = [(water[gib]! % W) + 0.5, Math.floor(water[gib]! / W) + 0.5];
  const comp = navOf(w).grid.component;
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  const belfast = cellOf(-5.93, 54.6, W, H) as [number, number];
  const london = Math.floor(ly) * W + Math.floor(lx);
  expect(comp[Math.floor(belfast[1]) * W + Math.floor(belfast[0])]).not.toBe(comp[london]);
  let div = 0;
  let best = Infinity;
  w.formations.forEach((id) => {
    if (c.nation[id] !== ENG || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== comp[london]) return;
    const d = (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2;
    if (d < best) [best, div] = [d, id];
  });
  expect(div).toBeGreaterThan(0);
  return { s, w, div, transports, belfast };
}

/** Steps an hour at a time until `until` holds or `hours` pass; the events of `id` seen, by kind, with their day. */
function run(s: Sim, id: number, hours: number, until: () => boolean): Map<number, number> {
  const seen = new Map<number, number>();
  for (let h = 0; h < hours && !until(); h++) {
    s.step(1, (w) => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 2] === id && !seen.has(ev[i + 1]!)) seen.set(ev[i + 1]!, w.tick / 24);
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
  }
  return seen;
}

describe('transports called to a landing (ROADMAP R17a)', () => {
  it('called from Gibraltar to an English port, the division waits for them, boards and lands in Ulster', () => {
    const { s, w, div, transports, belfast } = britain();
    s.command({ kind: 'moveFormation', id: div, x: belfast[0], y: belfast[1], nation: ENG });
    s.step(1);
    const called = w.seaFetch.get(div);
    expect(called, 'a transport group called').toBeDefined();
    expect(transports).toContain(called);
    expect(w.playerOrders.has(called!), "under the player's order").toBe(true);
    expect(w.formations.cols.moving[called!]).toBe(1);
    expect(w.seaBound.has(div)).toBe(true);
    // A save while it waits keeps the call.
    const t = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    t.load(s.save());
    expect(t.world.seaFetch.get(div)).toBe(called);
    const comp = navOf(w).grid.component;
    const ulster = comp[Math.floor(belfast[1]) * W + Math.floor(belfast[0])];
    let fleet = 0;
    const seen = run(s, div, 24 * 30, () => {
      fleet ||= w.embarked.get(div)?.fleet ?? 0;
      return w.seaFetch.size === 0 && !w.embarked.has(div) && !w.seaBound.has(div);
    });
    expect(seen.has(EventKind.MoveRejected), 'not refused').toBe(false);
    expect(fleet, 'aboard the called group').toBe(called);
    const embarked = seen.get(EventKind.FormationEmbarked);
    const landed = seen.get(EventKind.FormationLanded);
    expect(embarked).toBeDefined();
    expect(landed).toBeGreaterThan(embarked!);
    const c = w.formations.cols;
    expect(comp[Math.floor(c.y[div]!) * W + Math.floor(c.x[div]!)]).toBe(ulster);
  });

  it('with no transports anywhere the order is refused, no transports to call', () => {
    const { s, w, div, transports, belfast } = britain();
    for (const id of transports) destroyFormation(w, id);
    s.command({ kind: 'moveFormation', id: div, x: belfast[0], y: belfast[1], nation: ENG });
    const seen = new Map<number, number>();
    s.step(1, (wd) => {
      const ev = wd.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 2] === div && ev[i + 1] === EventKind.MoveRejected) seen.set(ev[i + 3]!, ev[i + 4]!);
      wd.out.events.length = 0;
    });
    expect([...seen.values()]).toContain(RejectReason.NoTransports);
    expect(w.seaFetch.size).toBe(0);
    expect(w.seaBound.has(div)).toBe(false);
  });

  it('an order that is not a player\'s (God Mode, no nation named) calls no transports', () => {
    const { s, w, div, belfast } = britain();
    s.command({ kind: 'moveFormation', id: div, x: belfast[0], y: belfast[1] });
    s.step(1);
    expect(w.seaFetch.size).toBe(0);
  });
});
