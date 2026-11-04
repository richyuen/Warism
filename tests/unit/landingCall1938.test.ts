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

describe('landings together (ROADMAP R17b)', () => {
  it('three divisions in one click, room for two: two board, sail and land together; the group comes back for the third', () => {
    const { s, w, transports, belfast } = britain();
    const c = w.formations.cols;
    // One group left, at Portsmouth (a port of their land): room for two full infantry divisions.
    const keep = transports[0]!;
    for (const id of transports.slice(1)) destroyFormation(w, id);
    const water = portSeaOf(w);
    const ports = w.ports.findIndex((p) => p.name === 'Portsmouth');
    [c.x[keep], c.y[keep]] = [(water[ports]! % W) + 0.5, Math.floor(water[ports]! / W) + 0.5];
    const room = transportRoom(w, keep);
    // Three full divisions of England's, nearest London.
    const comp = navOf(w).grid.component;
    const [lx, ly] = cellOf(-0.12, 51.5, W, H);
    const england = comp[Math.floor(ly) * W + Math.floor(lx)];
    const divs: number[] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] === ENG && !w.offLand(id) && comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] === england && c.strength[id] === 12460) divs.push(id);
    });
    divs.sort((a, b) => (c.x[a]! - lx) ** 2 + (c.y[a]! - ly) ** 2 - ((c.x[b]! - lx) ** 2 + (c.y[b]! - ly) ** 2) || a - b);
    const three = divs.slice(0, 3);
    expect(three).toHaveLength(3);
    expect(2 * 12460).toBeLessThanOrEqual(room);
    expect(3 * 12460).toBeGreaterThan(room);
    for (const id of three) s.command({ kind: 'moveFormation', id, x: belfast[0], y: belfast[1], nation: ENG });
    s.step(1);
    for (const id of three) expect(w.seaFetch.get(id), `division ${id} bound for the group`).toBe(keep);
    // Each division's boardings and landings, by the hour.
    const embarked = new Map<number, number[]>();
    const landed = new Map<number, number[]>();
    const ulster = comp[Math.floor(belfast[1]) * W + Math.floor(belfast[0])];
    const done = (): boolean => three.every((id) => (landed.get(id)?.length ?? 0) > 0 && !w.embarked.has(id) && comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] === ulster);
    for (let h = 0; h < 24 * 60 && !done(); h++) {
      s.step(1, (wd) => {
        const ev = wd.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          const id = ev[i + 2]!;
          if (!three.includes(id)) continue;
          expect(ev[i + 1], `division ${id} refused`).not.toBe(EventKind.MoveRejected);
          if (ev[i + 1] === EventKind.FormationEmbarked) embarked.set(id, [...(embarked.get(id) ?? []), wd.tick]);
          if (ev[i + 1] === EventKind.FormationLanded) landed.set(id, [...(landed.get(id) ?? []), wd.tick]);
        }
        for (const [id, e] of wd.embarked) if (three.includes(id)) expect(e.fleet).toBe(keep);
        wd.out.events.length = 0;
        wd.out.fires.length = 0;
      });
    }
    expect(done(), 'all three in Ulster').toBe(true);
    const at = three.map((id) => landed.get(id)![0]!).sort((a, b) => a - b);
    // Two together, the third after the voyage back.
    expect(at[1]).toBe(at[0]);
    expect(at[2]).toBeGreaterThan(at[1]! + 24);
    const third = three.find((id) => landed.get(id)![0] === at[2])!;
    const second = three.find((id) => id !== third && landed.get(id)![0] === at[0])!;
    expect(embarked.get(third)![0]!).toBeGreaterThan(landed.get(second)![0]!);
    expect(w.convoyPort.size).toBe(0);
    expect(w.seaFetch.size).toBe(0);
  });
});
