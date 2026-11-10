import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { Terrain } from '../../src/shared/terrain';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62c (SPEC §7.7): the track's transfers and occupations by lon/lat rings, set at the event's hour as a cession
// is. Each sets exactly the cells its ring holds of the nations it may take from, counted here by a point-in-polygon
// of this test's own on the cell centres.

type Ring = [number, number][];
// A rough Sudetenland (the west of Bohemia; Germany's land inside it is not Czechoslovakia's, and stays).
const SUDETEN: Ring = [[12.0, 50.4], [13.0, 50.9], [14.6, 51.1], [15.4, 50.7], [14.2, 49.9], [13.6, 49.2], [12.6, 49.4]];
// A block of western Poland.
const WEST_POLAND: Ring = [[16.2, 52.6], [18.6, 52.6], [18.6, 51.0], [16.2, 51.0]];

const TEST: TimelineFile = {
  events: [
    { date: '1938-01-02', hour: 4, kind: 'transfer', to: 'GER', from: ['CZS'], ring: SUDETEN },
    { date: '1938-01-03', hour: 7, kind: 'occupy', by: 'GER', of: ['POL'], ring: WEST_POLAND },
  ],
};

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;

/** The land cells whose centre is inside `ring` (even-odd), by this test's own count. */
function inside(ring: Ring, w: number, h: number, terrain: Uint8Array): Set<number> {
  const pts = ring.map(([lon, lat]) => {
    const [u, v] = project(lon, lat);
    return [u * w, v * h] as const;
  });
  const out = new Set<number>();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      let in_ = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i]!;
        const [xj, yj] = pts[j]!;
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) in_ = !in_;
      }
      if (in_ && terrain[y * w + x]! >= Terrain.Plains) out.add(y * w + x);
    }
  }
  return out;
}

/** Steps one tick; its events as [tick, kind, a, b, x, y]. */
function stepOne(sim: Sim): number[][] {
  const out: number[][] = [];
  sim.step(1, (w) => {
    for (let i = 0; i < w.out.events.length; i += 6) out.push(w.out.events.slice(i, i + 6));
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  return out;
}

describe("the historical track's territory (ROADMAP R62c)", () => {
  it('a transfer and an occupation set exactly the cells of their rings, at their hour', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TEST);
    const w = sim.world;
    const { owner, controller, terrain } = w.cells;
    const W = w.cells.w;
    const H = w.cells.h;
    const [GER, CZS, POL] = [id('GER'), id('CZS'), id('POL')];
    while (sim.tick < 24 + 4) stepOne(sim);
    // The transfer's hour.
    const ownerBefore = owner.slice();
    const ceded = [...inside(SUDETEN, W, H, terrain)].filter((c) => ownerBefore[c] === CZS);
    expect(ceded.length).toBeGreaterThan(50);
    const events = stepOne(sim);
    for (const c of ceded) {
      expect(owner[c], `cell ${c}`).toBe(GER);
      expect(controller[c]).toBe(GER);
    }
    // Nothing else of Czechoslovakia's or Germany's changed hands.
    const set = new Set(ceded);
    let others = 0;
    for (let c = 0; c < owner.length; c++) if (!set.has(c) && (ownerBefore[c] === CZS || ownerBefore[c] === GER) && owner[c] !== ownerBefore[c]) others++;
    expect(others).toBe(0);
    const rows = events.filter((e) => e[1] === EventKind.LandCeded);
    expect(rows.map((e) => [e[0], e[2], e[3]])).toEqual([[24 + 4, GER, CZS]]);
    // Its capital is not in it: Prague stays Czechoslovakia's.
    expect(w.nations.cols.living[CZS]).toBe(1);

    while (sim.tick < 2 * 24 + 7) stepOne(sim);
    const ownerB = owner.slice();
    const ctrlB = controller.slice();
    const held = [...inside(WEST_POLAND, W, H, terrain)].filter((c) => ownerB[c] === POL && ctrlB[c] !== GER);
    expect(held.length).toBeGreaterThan(50);
    stepOne(sim);
    for (const c of held) {
      expect(controller[c], `cell ${c}`).toBe(GER);
      expect(owner[c]).toBe(POL);
    }
    const heldSet = new Set(held);
    let more = 0;
    for (let c = 0; c < owner.length; c++) if (!heldSet.has(c) && ownerB[c] === POL && controller[c] !== ctrlB[c]) more++;
    expect(more).toBe(0);
    expect(w.track!.next).toBe(2);
  });
});
