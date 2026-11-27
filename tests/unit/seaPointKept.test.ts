import { describe, expect, it } from 'vitest';
import { addIslet, maskField, waterPoint } from '../../src/shared/landMask';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R228: `World.seaPoint` searched the fine mask for a coastal cell's water point on every call (each pixel of
// the cell against the nine cells about it: 16 × 16 against 48 × 48 on the S map), and a fleet under way asks it each
// hour: 28 % of the S map's tick, which ran slower than M's. The point is kept by cell, for the mask as it is and the
// map's looping, as `cellPoint` keeps the land's.

const W = SIZE_1938.w;
const H = SIZE_1938.h;

/** What `seaPoint` is to give: the cell's middle on open water, else the mask's water point, read afresh. */
function direct(w: World, cell: number): [number, number] | null {
  const cx = cell % W;
  const cy = (cell - cx) / W;
  const mask = w.landMask!;
  const loop = w.settings.loopingMap;
  if (maskField(mask, W, H, cx + 0.5, cy + 0.5, loop) === 0) return [cx + 0.5, cy + 0.5];
  return waterPoint(mask, W, cx, cy, loop);
}

/** A 1938 world on a mask of its own (a mask is shared by the worlds of a process), and `n` cells of its coasts. */
function world(n: number): { w: World; cells: number[] } {
  const w = new Sim({ scenario: '1938', seed: 5, assets: assets1938(W) }).world;
  const m = w.landMask!;
  w.landMask = { w: m.w, h: m.h, bits: m.bits.slice() };
  const cells: number[] = [];
  // Cells whose middle is not open water: the ones `seaPoint` searches the mask for. Spread over the map.
  for (let c = 0; c < W * H && cells.length < n; c += 97) {
    const cx = c % W;
    if (maskField(w.landMask, W, H, cx + 0.5, (c - cx) / W + 0.5, w.settings.loopingMap) !== 0) cells.push(c);
  }
  expect(cells.length).toBe(n);
  return { w, cells };
}

describe("a coastal cell's water point is kept (R228)", () => {
  it('the point is the mask’s own, and is searched for once', () => {
    const { w, cells } = world(300);
    // (The world's making has asked for some already, of the mask it was made on: its fleets' places.)
    const made = w.seaPointSearches;
    const first = cells.map((c) => w.seaPoint(c));
    expect(first).toEqual(cells.map((c) => direct(w, c)));
    // Some have water and a point off the middle, some are all land: both kinds are kept.
    expect(first.some((p) => p === null)).toBe(true);
    expect(first.some((p, i) => p !== null && (p[0] !== (cells[i]! % W) + 0.5 || p[1] !== Math.floor(cells[i]! / W) + 0.5))).toBe(true);
    expect(w.seaPointSearches - made).toBe(cells.length);
    // Asked again: the same points, none searched for; a point given is the asker's own to change.
    for (const p of first) if (p) p[0] = -1;
    expect(cells.map((c) => w.seaPoint(c))).toEqual(cells.map((c) => direct(w, c)));
    expect(w.seaPointSearches - made).toBe(cells.length);
    // A cell of open water is its middle, with no search.
    const open = Array.from({ length: W * H }, (_, c) => c).find((c) => maskField(w.landMask!, W, H, (c % W) + 0.5, Math.floor(c / W) + 0.5, w.settings.loopingMap) === 0)!;
    expect(w.seaPoint(open)).toEqual([(open % W) + 0.5, Math.floor(open / W) + 0.5]);
    expect(w.seaPointSearches - made).toBe(cells.length);
  }, 120_000);

  it('the points go with a change of the mask, and of the map’s looping', () => {
    const { w, cells } = world(60);
    const made = w.seaPointSearches;
    for (const c of cells) w.seaPoint(c);
    expect(w.seaPointSearches - made).toBe(cells.length);
    // An islet in a cell of open sea beside a kept one: that cell's point is the mask's as it is now.
    const mask = w.landMask!;
    let islet = -1;
    for (const c of cells) {
      for (const d of [1, -1, W, -W]) {
        const o = c + d;
        if (o < 0 || o >= W * H || islet >= 0) continue;
        const copy = { w: mask.w, h: mask.h, bits: mask.bits.slice() };
        if (addIslet(copy, W, o % W, Math.floor(o / W))) islet = o;
      }
      if (islet >= 0) break;
    }
    expect(islet).toBeGreaterThanOrEqual(0);
    expect(addIslet(mask, W, islet % W, Math.floor(islet / W))).toBe(true);
    expect(cells.map((c) => w.seaPoint(c))).toEqual(cells.map((c) => direct(w, c)));
    expect(w.seaPointSearches - made).toBe(2 * cells.length);
    // The looping changed (a new game's option, a load): read again.
    w.settings.loopingMap = !w.settings.loopingMap;
    expect(cells.map((c) => w.seaPoint(c))).toEqual(cells.map((c) => direct(w, c)));
    expect(w.seaPointSearches - made).toBe(3 * cells.length);
  }, 120_000);
});
