import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportRoom, transportsPort } from '../../src/sim/systems/amphibious';
import { LandingState, landingOfDivision, READY_WAIT_HOURS } from '../../src/sim/systems/landings';
import { sailHours } from '../../src/sim/systems/sail';
import { navOf, portSeaOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R54a (critic run 55, R55-B1): a landing ready at its port and short of room called a group 273 hours off
// and stood waiting for it 11 days (24033: ready at Tokyo t2125, sailed t2393). A group is called only if it is there
// within READY_WAIT_HOURS of the hour the landing was ready, as a division marching is waited for (R44a); else those
// that fit sail and the rest are told they go on the next voyage (R17b, R37a). Britain played (seed 1), its three
// divisions nearest London sent to Belfast; one group (room for two) at Portsmouth, its other three far (Hong Kong)
// or near (Liverpool).

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');

function run(away: 'Hong Kong' | 'Liverpool'): { sailedAfterReady: number; aboard: number; told: number[]; bound: number[]; far: number; divs: number[] } {
  const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = s.world;
  w.settings.player = ENG;
  const c = w.formations.cols;
  const water = portSeaOf(w);
  const comp = navOf(w).grid.component;
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  const london = Math.floor(ly) * W + Math.floor(lx);
  const near: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] === ENG && !w.isFleet(id) && !w.offLand(id) && comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] === comp[london]) near.push([id, (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2]);
  });
  const divs = near.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 3).map(([id]) => id).sort((a, b) => a - b);
  const port = transportsPort(w, divs[0]!, false);
  expect(w.ports[port]!.name).toBe('Portsmouth');
  const groups: number[] = [];
  w.formations.forEach((o) => {
    if (w.isFleet(o) && c.nation[o] === ENG && transportRoom(w, o) > 0) groups.push(o);
  });
  groups.sort((a, b) => a - b);
  // One group with room for two of the three at Portsmouth, the rest away.
  expect(transportRoom(w, groups[0]!)).toBeGreaterThanOrEqual(2 * Math.max(...divs.map((d) => c.strength[d]!)));
  expect(transportRoom(w, groups[0]!)).toBeLessThan(divs.reduce((n, d) => n + c.strength[d]!, 0));
  const at = (o: number, i: number): void => void ([c.x[o], c.y[o]] = [(water[i]! % W) + 0.5, Math.floor(water[i]! / W) + 0.5]);
  at(groups[0]!, port);
  const awayPort = w.ports.findIndex((p) => p.name === away);
  for (const o of groups.slice(1)) at(o, awayPort);
  const k = water[port]!;
  const far = Math.min(...groups.slice(1).map((o) => sailHours(w, o, (k % W) + 0.5, Math.floor(k / W) + 0.5)));
  const belfast = cellOf(-5.93, 54.6, W, H) as [number, number];
  for (const id of divs) s.command({ kind: 'moveFormation', id, x: belfast[0], y: belfast[1], nation: ENG });
  const told: number[] = [];
  const bound = new Set<number>();
  let ready = -1;
  let sailed = -1;
  let aboard = 0;
  for (let h = 0; h < 24 * 30 && sailed < 0; h++) {
    s.step(1, (wo) => {
      const ev = wo.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.NextVoyage && divs.includes(ev[i + 2]!)) told.push(ev[i + 2]!);
      wo.out.events.length = 0;
      wo.out.fires.length = 0;
    });
    for (const d of divs) {
      const l = landingOfDivision(w, d);
      if (!l) continue;
      for (const o of l.fleets) bound.add(o);
      if (ready < 0 && l.ready >= 0) ready = l.ready;
      if (sailed < 0 && l.state === LandingState.sailing) {
        sailed = w.tick;
        aboard = divs.filter((x) => w.embarked.has(x)).length;      }
    }
  }
  expect(ready).toBeGreaterThanOrEqual(0);
  return { sailedAfterReady: sailed < 0 ? Infinity : sailed - ready, aboard, told, bound: [...bound].filter((o) => o !== groups[0]), far, divs };
}

describe('a landing short of room calls only a group there within its ready wait (ROADMAP R54a)', () => {
  it('the rest far off (Hong Kong): two sail within the ready wait, the third told it goes on the next voyage', () => {
    const r = run('Hong Kong');
    expect(r.far).toBeGreaterThan(READY_WAIT_HOURS);
    expect(r.sailedAfterReady).toBeLessThanOrEqual(READY_WAIT_HOURS);
    expect(r.bound).toEqual([]);
    expect(r.aboard).toBe(2);
    expect(r.told.length).toBe(1);
  });

  it('the rest near (Liverpool): one is called and the three sail together (R44-B1 kept)', () => {
    const r = run('Liverpool');
    expect(r.far).toBeLessThan(READY_WAIT_HOURS);
    expect(r.bound.length).toBe(1);
    expect(r.aboard).toBe(3);
    expect(r.told).toEqual([]);
  });
});
