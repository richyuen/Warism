import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { spawnPoint } from '../../src/sim/systems/production';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { isBound } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R20 (critic run 32, R32-B1): a player's order over the sea onto the ground of a nation
// outside its wars is refused (`RejectReason.Neutral`), as a march by land there is; before, it
// sailed and landed, and the next day start set the division back at home across the sea, untold.
// Such a jump (a peace made while it was at sea) is now an event (`FormationSentHome`) the player
// is told. Britain played, a division by London: Calais (France's) at peace, and at war.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const FRA = nationId('FRA');
const GER = nationId('GER');

function britain(): { s: Sim; w: World; div: number } {
  const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = s.world;
  w.settings.player = ENG;
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  const london = Math.floor(ly) * W + Math.floor(lx);
  let div = 0;
  let best = Infinity;
  w.formations.forEach((id) => {
    if (c.nation[id] !== ENG || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== comp[london]) return;
    const d = (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2;
    if (d < best) [best, div] = [d, id];
  });
  expect(div).toBeGreaterThan(0);
  return { s, w, div };
}

/** `id`'s events of the next `hours`, as [kind, b, x] rows. */
function eventsOf(s: Sim, id: number, hours: number): number[][] {
  const out: number[][] = [];
  s.step(hours, (w) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 2] === id) out.push([ev[i + 1]!, ev[i + 3]!, ev[i + 4]!]);
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  return out;
}

const CALAIS = cellOf(1.86, 50.95, W, H) as [number, number];

describe('no landing on the ground of a nation outside the war (ROADMAP R20)', () => {
  it('Calais at peace: the order over the sea is refused, Neutral, and nothing sails', () => {
    const { s, w, div } = britain();
    expect(w.cells.controller[Math.floor(CALAIS[1]) * W + Math.floor(CALAIS[0])]).toBe(FRA);
    s.command({ kind: 'moveFormation', id: div, x: CALAIS[0], y: CALAIS[1], nation: ENG, escort: true });
    const ev = eventsOf(s, div, 1);
    expect(ev.find((e) => e[0] === EventKind.MoveRejected)?.[2], 'refused, Neutral').toBe(RejectReason.Neutral);
    expect(isBound(w, div)).toBe(false);
    expect(w.seaBound.has(div)).toBe(false);
    expect(w.escorts.size).toBe(0);
  });

  it('Calais held by an enemy: the same order goes by sea', () => {
    const { s, w, div } = britain();
    // Germany at war with Britain, France's coast about Calais Germany's.
    s.command({ kind: 'declareWar', attacker: GER, defender: ENG });
    s.step(1);
    expect(w.wars.atWar(ENG, GER)).toBe(true);
    for (let y = Math.floor(CALAIS[1]) - 6; y <= Math.floor(CALAIS[1]) + 6; y++)
      for (let x = Math.floor(CALAIS[0]) - 6; x <= Math.floor(CALAIS[0]) + 6; x++) if (w.cells.controller[y * W + x] === FRA) w.cells.controller[y * W + x] = GER;
    s.command({ kind: 'moveFormation', id: div, x: CALAIS[0], y: CALAIS[1], nation: ENG });
    const ev = eventsOf(s, div, 1);
    expect(ev.some((e) => e[0] === EventKind.MoveRejected), 'not refused').toBe(false);
    expect(isBound(w, div), 'by sea').toBe(true);
  });

  it('a division idle on such ground with no way home by land is sent home, and the jump is an event', () => {
    const { s, w, div } = britain();
    const c = w.formations.cols;
    [c.x[div], c.y[div]] = [Math.floor(CALAIS[0]) + 0.5, Math.floor(CALAIS[1]) + 0.5];
    c.moving[div] = 0;
    const ev = eventsOf(s, div, 25);
    const home = ev.find((e) => e[0] === EventKind.FormationSentHome);
    expect(home, 'sent home, told').toBeDefined();
    expect(home![1]).toBe(ENG);
    const at = spawnPoint(w, ENG)!;
    expect(Math.hypot(c.x[div]! - at[0], c.y[div]! - at[1]), 'at its spawn point, across the sea').toBeLessThan(1);
  });
});
