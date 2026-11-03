import { describe, expect, it } from 'vitest';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { closeOn } from '../../src/sim/systems/navalCombat';
import { orderSail } from '../../src/sim/systems/sail';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R15 (critic run 30, R30-B3): a fleet moved after the air system's hour left its carrier
// wings where it stood until the next: closing in a sea battle it came into and left in the hour
// (Japan's carrier group on 5591, heroes on), or set on its cell's water by a sail order (sea
// control sending Britain's home from a lost base on 3373). Each move now takes its wings with it.

const JAP = nationId('JAP');
const [SX, SY] = cellOf(-170, 20, SIZE_1938.w, SIZE_1938.h);
const tmpl = (w: World, id: number): string => TEMPLATES_1938[w.formations.cols.template[id]!]!.id;

/** A Japanese carrier group in the open Pacific, off its cell's centre, with its wings where it stood. */
function carrier(): { w: World; cv: number; wings: number[] } {
  const w = new Sim({ scenario: '1938', seed: 1, assets: assets1938(SIZE_1938.w) }).world;
  const c = w.formations.cols;
  const cv = [...w.formations.ids()].find((id) => w.isFleet(id) && c.nation[id] === JAP && tmpl(w, id) === 'carrier_group')!;
  const wings = [...w.wingBase].filter(([, b]) => b === -cv).map(([id]) => id);
  [c.x[cv], c.y[cv]] = [SX + 0.3, SY + 0.3];
  for (const id of wings) [c.x[id], c.y[id]] = [c.x[cv]!, c.y[cv]!];
  return { w, cv, wings };
}

describe('a carrier’s wings move with its fleet (ROADMAP R15)', () => {
  it('a sail order that sets the fleet on its cell’s water', () => {
    const { w, cv, wings } = carrier();
    const c = w.formations.cols;
    expect(wings.length, 'the carrier group has wings').toBeGreaterThan(0);
    expect(orderSail(w, cv, SX + 6.5, SY + 0.5)).toBe(true);
    expect([c.x[cv], c.y[cv]], 'set on its cell’s water').not.toEqual([SX + 0.3, SY + 0.3]);
    for (const id of wings) expect([c.x[id], c.y[id]], `wing ${id}`).toEqual([c.x[cv], c.y[cv]]);
  });

  it('closing in a sea battle', () => {
    const { w, cv, wings } = carrier();
    const c = w.formations.cols;
    const [x0, y0] = [c.x[cv]!, c.y[cv]!];
    closeOn(w, cv, SX + 6.5, SY + 0.5, 60);
    expect([c.x[cv], c.y[cv]], 'it closed').not.toEqual([x0, y0]);
    for (const id of wings) expect([c.x[id], c.y[id]], `wing ${id}`).toEqual([c.x[cv], c.y[cv]]);
  });
});
