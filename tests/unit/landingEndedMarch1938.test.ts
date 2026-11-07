import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { destroyFormation } from '../../src/sim/systems/elements';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { LandingState, landingOfDivision } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R43e (critic run 50, R50-N5): 20845, Germany's two nearest Berlin sent to Norwich; the transport group sailing
// to Hamburg was sunk at t89, both were told the landing was over (`TransportsSunk`, 0), and both marched on to
// Hamburg, there at t222 and t242. A landing that ends stops its divisions' march to its port, however it ends: its
// groups sunk with none to come, or its port lost. Each case: the hour it ends, those marching stand; a week on, none
// has reached the port, and none marches there.

const { w: W, h: H } = SIZE_1938;
const GER = nationId('GER');
const ENG = nationId('ENG');
const BERLIN = cellOf(13.4, 52.5, W, H) as [number, number];
const NORWICH = cellOf(1.3, 52.6, W, H) as [number, number];

const run = (end: 'sunk' | 'portLost'): void => {
  const sim = new Sim({ scenario: '1938', seed: 20845, assets: assets1938(W) });
  const w = sim.world;
  const told: [number, number, number][] = [];
  const quiet = (x: World): void => {
    for (let i = 0; i < x.out.events.length; i += 6) {
      const k = x.out.events[i + 1]!;
      if (k === EventKind.TransportsSunk || k === EventKind.MoveRejected) told.push([k, x.out.events[i + 2]!, x.out.events[i + 4]!]);
    }
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  sim.command({ kind: 'setPlayer', nation: GER });
  sim.step(1, quiet);
  if (!w.wars.atWar(GER, ENG)) sim.command({ kind: 'forceWar', attacker: GER, defender: ENG });
  sim.step(1, quiet);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const home = comp[Math.floor(BERLIN[1]) * W + Math.floor(BERLIN[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== GER || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== home) return;
    all.push([id, (c.x[id]! - BERLIN[0]) ** 2 + (c.y[id]! - BERLIN[1]) ** 2]);
  });
  const pair = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
  for (const id of pair) sim.command({ kind: 'moveFormation', id, x: NORWICH[0], y: NORWICH[1], nation: GER, escort: true } as Command);
  sim.step(1, quiet);
  const l = landingOfDivision(w, pair[0]!)!;
  expect(l?.state, 'a landing gathering').toBe(LandingState.gathering);
  const marching = pair.filter((id) => c.moving[id] === 1 && !w.embarked.has(id));
  expect(marching.length, 'one at least marching to its port').toBeGreaterThan(0);
  const port = w.ports[l.port]!.cell;
  for (const id of marching) expect(c.targetCell[id], `${id} bound for ${w.ports[l.port]!.name}`).toBe(port);
  told.length = 0;
  if (end === 'sunk') {
    // Every transport group of Germany gone: none can be called.
    w.formations.forEach((o) => {
      if (c.nation[o] === GER && w.isFleet(o) && transportRoom(w, o) > 0) destroyFormation(w, o);
    });
  } else {
    w.cells.controller[port] = ENG;
  }
  sim.step(1, quiet);
  expect(w.landings.has(l.id), 'the landing is over').toBe(false);
  if (end === 'sunk') expect(told.filter(([k, , x]) => k === EventKind.TransportsSunk && x === 0).map(([, id]) => id).sort(), 'told the landing is over').toEqual([...pair].sort());
  else expect(told.filter(([k, , x]) => k === EventKind.MoveRejected && x !== 0).length, 'told why').toBeGreaterThan(0);
  for (const id of marching) expect(c.moving[id] === 1 && c.targetCell[id] === port, `${id} stops its march to the port`).toBe(false);
  for (let h = 0; h < 24 * 7; h++) {
    sim.step(1, quiet);
    for (const id of marching) {
      if (!w.formations.has(id)) continue;
      expect(c.moving[id] === 1 && c.targetCell[id] === port, `${id} at t${w.tick} marching to the ended landing's port`).toBe(false);
      expect(Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!) === port && end === 'sunk', `${id} at the port at t${w.tick}`).toBe(false);
    }
  }
};

describe("a landing that ends stops its divisions' march to its port (ROADMAP R43e)", () => {
  it('its groups sunk with none to come (20845, Berlin to Norwich)', () => run('sunk'), 300_000);
  it('its port lost', () => run('portLost'), 300_000);
});
