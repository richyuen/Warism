import { describe, expect, it } from 'vitest';
import { AIR_CONTESTED } from '../../src/shared/mapModes';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { airHolders } from '../../src/sim/systems/airSuperiority';
import { airOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// PLAN 7.8 (critic run 7, aircraft 5): on day 10 of Germany's war on Poland (seed 8217) the air
// mode had Poland, the Baltic states and Ukraine "held by Yugoslavia". Yugoslavia, on Poland's
// side in another war (against Austria, Denmark and Iceland), had its wings based in Poland's air
// zone patrolling over Austria; their climbs out made it the zone's top flyer. A zone's holder is
// now one fighting there: at war with a nation that flew in the zone or holds land in it.

const { w: W, h: H } = SIZE_1938;
const [GER, POL] = ['GER', 'POL'].map(nationId) as [number, number];

describe("an air zone's holder is one fighting there (PLAN 7.8)", () => {
  // Seed 4 on day 24 since ADR-1089 (ROADMAP R97b, the wars prepared): the wars of seed 8217's first ten days are
  // not begun so soon, and Yugoslavia flies over no one. The case is found by what it is, whoever's: on seed 4 Britain,
  // at war elsewhere, the top flyer of a zone over France's, Nationalist Spain's and Morocco's land (zone 136).
  const sim = new Sim({ scenario: '1938', seed: 4, assets: assets1938(W) });
  const world = sim.world;
  sim.command({ kind: 'declareWar', attacker: GER, defender: POL });
  // Day 40 since ROADMAP R98c (ADR-1090, the invaded front): the case is not on day 24 of that history; on day 40 of
  // seed 4, and on day 70 of seeds 1 and 7.
  sim.step(24 * 40);
  const air = airOf(world);
  const holders = airHolders(world, air.count);

  it("a zone of others' land where a nation at war elsewhere flew the most and fights no one: not its own; Warsaw's Poland's, Germany's or contested", () => {
    // Since PLAN 7.36b's smaller zones (ADR-560) Yugoslavia's climbs out are no longer in Warsaw's
    // zone but in one of Poland's land to its south (zone 63 on day 10): the case is found, not named.
    const land = new Map<number, Set<number>>();
    for (let c = 0; c < air.zoneOf.length; c++) {
      if (world.cells.controller[c] === 0) continue;
      let s = land.get(air.zoneOf[c]!);
      if (!s) land.set(air.zoneOf[c]!, (s = new Set()));
      s.add(world.cells.controller[c]!);
    }
    const cases = [...world.airPower].filter(([z, by]) => {
      const top = [...by].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0];
      const others = [...by.keys(), ...(land.get(z) ?? [])];
      const inWar = world.wars.list.some((x) => x.sides[0].includes(top) || x.sides[1].includes(top));
      return inWar && (land.get(z)?.size ?? 0) > 0 && !land.get(z)!.has(top) && !others.some((m) => world.wars.atWar(top, m));
    });
    expect(cases.length, "a zone of others' land where a nation at war elsewhere flew the most, at war with no one there").toBeGreaterThan(0);
    for (const [z, by] of cases) expect(holders[z], `zone ${z}`).not.toBe([...by].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0]);
    const [x, y] = cellOf(21.01, 52.23, W, H);
    const z = air.zoneOf[Math.floor(y) * W + Math.floor(x)]!;
    process.stderr.write(`Warsaw's zone ${z}: holder ${holders[z]} (Poland ${POL}, Germany ${GER}, contested ${AIR_CONTESTED})\n`);
    expect([POL, GER, AIR_CONTESTED]).toContain(holders[z]);
  });

  it('every holder is at war with a nation that flew in its zone or holds land there', () => {
    const land = new Map<number, Set<number>>();
    for (let c = 0; c < air.zoneOf.length; c++) {
      const z = air.zoneOf[c]!;
      if (holders[z] === 0 || world.cells.controller[c] === 0) continue;
      let s = land.get(z);
      if (!s) land.set(z, (s = new Set()));
      s.add(world.cells.controller[c]!);
    }
    let held = 0;
    for (let z = 1; z <= air.count; z++) {
      const h = holders[z]!;
      if (h === 0 || h === AIR_CONTESTED) continue;
      held++;
      const others = [...(world.airPower.get(z)?.keys() ?? []), ...(land.get(z) ?? [])];
      expect(others.some((m) => world.wars.atWar(h, m)), `zone ${z}'s holder ${h} fights there`).toBe(true);
    }
    expect(held).toBeGreaterThan(0);
  });
});
