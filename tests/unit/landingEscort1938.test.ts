import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf, transportRoom } from '../../src/sim/systems/amphibious';
import { AT_PORT_CELLS } from '../../src/sim/systems/navalCombat';
import { navOf, PlayerOrderKind, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { groupOf, isBound, landingId } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R17d: a player's order over the sea with the escort asked for (the panel's box, ticked by
// default) sends the nearest idle warfleet of the nation to the landing's water ahead of the
// transports, under the player's order; once the divisions are ashore it is the AI's again and sails
// back where it came from. With none free the transports sail alone and the order is told so
// (`ConvoyUnescorted`). Britain played, a division by London ordered to Belfast (Ulster, another land).

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');

interface Case {
  s: Sim;
  w: World;
  div: number;
  belfast: [number, number];
  warfleets: number[];
}

function britain(): Case {
  const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = s.world;
  w.settings.player = ENG;
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  const belfast = cellOf(-5.93, 54.6, W, H) as [number, number];
  const london = Math.floor(ly) * W + Math.floor(lx);
  let div = 0;
  let best = Infinity;
  const warfleets: number[] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== ENG) return;
    if (w.isFleet(id)) {
      if (transportRoom(w, id) === 0) warfleets.push(id);
      return;
    }
    if (w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== comp[london]) return;
    const d = (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2;
    if (d < best) [best, div] = [d, id];
  });
  expect(div).toBeGreaterThan(0);
  expect(warfleets.length, "Britain's warfleets").toBeGreaterThan(0);
  return { s, w, div, belfast, warfleets };
}

const cellAt = (w: World, id: number): number => Math.floor(w.formations.cols.y[id]!) * W + Math.floor(w.formations.cols.x[id]!);
const near = (a: number, b: number, r: number): boolean => Math.abs((a % W) - (b % W)) <= r && Math.abs(Math.floor(a / W) - Math.floor(b / W)) <= r;

/** Steps an hour at a time until `until` holds or `hours` pass, calling `each` after each hour; `id`'s events by kind, with their hour. */
function run(s: Sim, id: number, hours: number, until: () => boolean, each: () => void = () => {}): Map<number, number> {
  const seen = new Map<number, number>();
  for (let h = 0; h < hours && !until(); h++) {
    s.step(1, (w) => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 2] === id && !seen.has(ev[i + 1]!)) seen.set(ev[i + 1]!, w.tick);
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
    each();
  }
  return seen;
}

describe('an escort for a landing (ROADMAP R17d)', () => {
  it('a free warfleet sails to the landing water before the transports, stays until the division is ashore, then goes back', () => {
    const { s, w, div, belfast, warfleets } = britain();
    s.command({ kind: 'moveFormation', id: div, x: belfast[0], y: belfast[1], nation: ENG, escort: true });
    s.step(1);
    expect(w.escorts.size, 'one escort').toBe(1);
    const [escort, e] = [...w.escorts][0]!;
    expect(warfleets).toContain(escort);
    // The escort is its landing's (ROADMAP R33b), the transports its landing's group.
    const convoy = groupOf(w, div)!;
    expect(e.convoy).toBe(landingId(w, div));
    expect(w.playerOrders.get(escort)?.kind, "under the player's order").toBe(PlayerOrderKind.march);
    // Under way, or kept where it stood until its voyage would take as long as the wait (ADR-826, R22d:
    // it no longer sails at the order; R23d's escort, the one there soonest, is near enough to wait).
    if (w.formations.cols.moving[escort] !== 1) expect(cellAt(w, escort), 'kept where it stood').toBe(e.from);
    // A save on the way keeps the escort.
    const t = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    t.load(s.save());
    expect([...t.world.escorts]).toEqual([...w.escorts]);
    const water = landingOf(w, Math.floor(belfast[1]) * W + Math.floor(belfast[0]))!.water;
    const r = w.atSize(AT_PORT_CELLS);
    let escortThere = -1;
    let transportsThere = -1;
    let heldUntilAshore = true;
    const seen = run(
      s,
      div,
      24 * 30,
      () => !w.embarked.has(div) && !isBound(w, div) && w.escorts.size === 0,
      () => {
        if (escortThere < 0 && w.formations.has(escort) && near(cellAt(w, escort), water, r)) escortThere = w.tick;
        if (transportsThere < 0 && w.formations.has(convoy) && near(cellAt(w, convoy), water, r)) transportsThere = w.tick;
        if ((w.embarked.has(div) || isBound(w, div)) && !w.escorts.has(escort)) heldUntilAshore = false;
      },
    );
    expect(seen.has(EventKind.MoveRejected), 'not refused').toBe(false);
    expect(seen.has(EventKind.ConvoyUnescorted), 'not told it is alone').toBe(false);
    const landed = seen.get(EventKind.FormationLanded);
    expect(landed, 'landed').toBeDefined();
    expect(escortThere, 'the escort at the landing water').toBeGreaterThan(0);
    expect(transportsThere, 'the transports at the landing water').toBeGreaterThan(0);
    expect(escortThere, 'the escort there first').toBeLessThanOrEqual(transportsThere);
    expect(heldUntilAshore, 'the escort held while the division was bound or aboard').toBe(true);
    // Ashore: the escort is the AI's again and sails back where it came from.
    expect(w.escorts.size).toBe(0);
    expect(w.playerOrders.has(escort)).toBe(false);
    expect(w.formations.cols.moving[escort]).toBe(1);
  });

  it('with no warfleet free the transports sail alone, and the order is told', () => {
    const { s, w, div, belfast, warfleets } = britain();
    // Every warfleet under the player's own order: none to take.
    for (const o of warfleets) w.playerOrders.set(o, { kind: PlayerOrderKind.march, until: 0, through: false });
    s.command({ kind: 'moveFormation', id: div, x: belfast[0], y: belfast[1], nation: ENG, escort: true });
    const seen = run(s, div, 24 * 30, () => w.formations.cols.moving[div] === 0 && !w.embarked.has(div) && !isBound(w, div) && w.tick > 2);
    expect(seen.has(EventKind.ConvoyUnescorted), 'told it sails alone').toBe(true);
    expect(seen.has(EventKind.MoveRejected), 'not refused').toBe(false);
    expect(seen.get(EventKind.FormationLanded), 'landed all the same').toBeDefined();
    expect(w.escorts.size).toBe(0);
  });

  it('an order without the escort takes none and tells nothing', () => {
    const { s, w, div, belfast } = britain();
    s.command({ kind: 'moveFormation', id: div, x: belfast[0], y: belfast[1], nation: ENG });
    const seen = run(s, div, 2, () => false);
    expect(isBound(w, div), 'by sea').toBe(true);
    expect(w.escorts.size).toBe(0);
    expect(seen.has(EventKind.ConvoyUnescorted)).toBe(false);
  });
});
