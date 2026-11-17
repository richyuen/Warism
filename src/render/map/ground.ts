/**
 * What the ground of each terrain class looks like at T2 and T3 (PLAN 2.8b, ADR-78): how the map
 * pass's noise is laid on the land: how rough each class is. Its colour is the terrain's too
 * since PLAN 2.14d (the casts below): until then the fill kept its colour, and the ground of
 * Berlin was Germany's grey.
 */
import { Terrain } from '../../shared/terrain';

export interface Ground {
  /** How high its small relief stands in the shading: 1 for mountains. */
  bump: number;
  /** How much its brightness varies from place to place, as a share of the fill. */
  grain: number;
  /** Its brightness against the fill's: woods are darker, sand and ice lighter. */
  shade: number;
}

export const GROUND: Record<number, Ground> = {
  // Water inside a land cell's blend (a coast, a lake shore): level, as the sea is for the hillshade.
  [Terrain.Water]: { bump: 0.1, grain: 0.03, shade: 1 },
  [Terrain.Crossing]: { bump: 0.1, grain: 0.03, shade: 1 },
  [Terrain.Plains]: { bump: 0.14, grain: 0.05, shade: 1 },
  [Terrain.Grassland]: { bump: 0.16, grain: 0.06, shade: 1 },
  [Terrain.Forest]: { bump: 0.34, grain: 0.12, shade: 0.93 },
  [Terrain.Hills]: { bump: 0.55, grain: 0.07, shade: 1 },
  [Terrain.Mountains]: { bump: 1, grain: 0.08, shade: 1 },
  [Terrain.Desert]: { bump: 0.28, grain: 0.04, shade: 1.03 },
  [Terrain.Tundra]: { bump: 0.22, grain: 0.07, shade: 1 },
  [Terrain.Marsh]: { bump: 0.1, grain: 0.1, shade: 0.96 },
  [Terrain.Urban]: { bump: 0.12, grain: 0.05, shade: 0.97 },
  [Terrain.Ice]: { bump: 0.18, grain: 0.02, shade: 1.04 },
};

/** How many classes the shader's table holds. */
export const GROUND_CLASSES = 12;

/** The table as the shader takes it: (bump, grain, shade) for each class in the order of its number. */
export function groundUniform(): Float32Array {
  const out = new Float32Array(GROUND_CLASSES * 3);
  for (let t = 0; t < GROUND_CLASSES; t++) {
    const g = GROUND[t];
    if (!g) throw new Error(`no ground for terrain class ${t}`);
    out.set([g.bump, g.grain, g.shade], t * 3);
  }
  return out;
}

/** The ground of T2 and T3 is all there from this zoom in (T2's edge, `T1_MIN_M`), m/px. */
export const GROUND_FULL_M = 300;
/** And none of it from this zoom out (PLAN 7.34a, ADR-532): 1.32 octaves beyond `GROUND_FULL_M`. */
export const GROUND_NONE_M = 750;

/**
 * How much of the ground of T2 and T3, and of what stands on it, a zoom shows: none at
 * `GROUND_NONE_M` m/px and beyond, all of it at `GROUND_FULL_M` and nearer, linear in the
 * zoom's log between; the same on the way in and out (PLAN 7.34a, ADR-532).
 *
 * The map's T1 → T2 change is a blend by the zoom, not a state: a step of the wheel of 1.5625×
 * (the critic's sheet) changes it by 0.49 at most, and the ground is all there before the
 * element sprites come in at 300 m/px. Until PLAN 7.34a it came in with the sprites' share of
 * the handover, by the clock, so a step from 412 to 264 m/px went from none to all of it; and
 * beyond T2 it went with the zoom too, 345 to 690 m/px (PLAN 2.11l: the ground's pass and the
 * scatter are made for the zooms of T2, and at 5000 m/px a tree would stand on every fourth
 * pixel). The unit layers' change stays the handover's.
 */
export function groundShareAt(mPerPx: number): number {
  return Math.min(1, Math.max(0, Math.log2(GROUND_NONE_M / mPerPx) / Math.log2(GROUND_NONE_M / GROUND_FULL_M)));
}

/**
 * How much of the hatching of occupied land stays where the ground of T2 and T3 is in full
 * (PLAN 2.11f). The hatching is the picture of T0 and T1. With the ground it would lie over
 * the hillshade and the texture across the whole view: it gives way, to a weave no stronger
 * than the ground's own variation on a plain, and occupied land is told by its tint.
 */
export const HATCH_AT_GROUND = 0.12;

/**
 * The ground of T2 and T3 has the terrain's colour, and the fill (the nation's colour, or the
 * map mode's) is a cast on it (PLAN 2.14d, ADR-90): the share of the fill in the ground's
 * colour away from every border, at a border, and on occupied land; and how far from a border
 * the stronger cast reaches, as the difference of the two strongest ids' weights (0 on the
 * border, about 0.5 half a cell from it, 1 two cells inland).
 */
export const GROUND_CAST = 0.14;
export const BORDER_CAST = 0.62;
/** 0.42 until PLAN 7.4f14 (ADR-449): French-held Germany was a blue field that read as a lake. */
export const OCCUPIED_CAST = 0.3;
export const BORDER_BAND = 0.6;
/**
 * Occupied land on the ground of T2 and T3 (ROADMAP R107, ADR-1097): broad bands of the occupier's cast, where it was
 * one even cast (`OCCUPIED_CAST`) that read as a haze over the terrain; and a dashed dark line where the occupier's
 * own land ends and what it occupies begins, the border as it was. `OCCUPIED_BAND_PX`: a band and the gap after it,
 * CSS px along the diagonal; `OCCUPIED_BAND_DUTY`: the band's share of that; the fill's share of the ground's colour
 * on a band and between two (their mean about `OCCUPIED_CAST`, so the land is no more of the occupier's colour than
 * it was: ADR-449's lake). `OLD_BORDER`: the line's share of the pixel, its dashes `OLD_BORDER_DASH_PX` long.
 */
export const OCCUPIED_BAND_PX = 34;
export const OCCUPIED_BAND_DUTY = 0.4;
export const OCCUPIED_BAND_CAST = 0.5;
export const OCCUPIED_GAP_CAST = 0.18;
export const OLD_BORDER = 0.6;
export const OLD_BORDER_PX = 1.2;
export const OLD_BORDER_DASH_PX = 9;

/**
 * The sea at T2 and T3 by its depth (PLAN 4.7f): the elevation's sea floor (to 10 m) lightens
 * the sea's colour over shallows and darkens it over the deep, by the log of the depth up to
 * SEA_DEPTH_FULL metres; at T0 and T1 the sea is one colour (the ground's share is 0).
 */
export const SEA_SHALLOW = 1.32;
export const SEA_DEEP = 0.72;
export const SEA_DEPTH_FULL = 6000;
/** The depth, m, at which the log ramp has gone a fifth of the way: shelves read, ocean basins are even. */
export const SEA_DEPTH_KNEE = 60;

/** The sea's brightness against its colour at `depth` metres (the shader's ramp, for tests). */
export function seaShade(depth: number): number {
  const t = Math.min(1, Math.log(1 + Math.max(0, depth) / SEA_DEPTH_KNEE) / Math.log(1 + SEA_DEPTH_FULL / SEA_DEPTH_KNEE));
  return SEA_SHALLOW + (SEA_DEEP - SEA_SHALLOW) * t;
}

/**
 * A front (ROADMAP R90a, ADR-1078; brighter since R99, ADR-1091, the user's request): the border between the
 * land two nations at war hold is a line of fire, at every zoom (on the ground of T2 and T3 too: whose the land
 * is, is the front). From the outside in, each a half width in CSS px either side of the border: a red glow
 * (`FRONT_GLOW_RGB`, `FRONT_GLOW` of the pixel on the line, falling off over `FRONT_GLOW_PX`); a dark casing
 * (`FRONT_CASE_RGB`, `FRONT_CASE` of the pixel, to `FRONT_CASE_PX`), so that the line is told on a light fill; a
 * band of orange red (`FRONT_BAND_RGB`, to `FRONT_BAND_PX`); and the core, near white (`FRONT_CORE_RGB`, to
 * `FRONT_CORE_PX`, the border's own half width where that is more), told on a red fill and a dark one.
 * `FRONT_NATIONS`: the war table's side (nations of an id under it; a border of one above it is drawn as at
 * peace). The colours as 0..1 RGB.
 */
export const FRONT_NATIONS = 512;
export const FRONT_CORE_PX = 1.5;
export const FRONT_BAND_PX = 3.2;
export const FRONT_CASE_PX = 4.4;
export const FRONT_CASE = 0.7;
export const FRONT_GLOW_PX = 12;
export const FRONT_GLOW = 0.6;
export const FRONT_CORE_RGB: readonly [number, number, number] = [1, 0.95, 0.62];
export const FRONT_BAND_RGB: readonly [number, number, number] = [1, 0.22, 0.08];
export const FRONT_CASE_RGB: readonly [number, number, number] = [0.16, 0.02, 0.02];
export const FRONT_GLOW_RGB: readonly [number, number, number] = [1, 0.14, 0.07];

/** The war table for the map's pass: FRONT_NATIONS squared, 1 where the two nations are at war. `pairs`: `a0, b0, a1, b1, …`. */
export function warTable(pairs: ArrayLike<number>): Uint8Array {
  const t = new Uint8Array(FRONT_NATIONS * FRONT_NATIONS);
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const [a, b] = [pairs[i]!, pairs[i + 1]!];
    if (a === 0 || b === 0 || a >= FRONT_NATIONS || b >= FRONT_NATIONS) continue;
    t[a * FRONT_NATIONS + b] = 1;
    t[b * FRONT_NATIONS + a] = 1;
  }
  return t;
}

/**
 * The ground of T0 and T1 (ROADMAP R91, ADR-1080): until R91 the sea was one colour and a nation
 * one fill. Three shades on the fills, each a factor of the colour, by the share the ground of T2
 * and T3 leaves them (that ground has its own depth and relief):
 * - the sea by its depth, `FAR_SEA_SHALLOW` over the shelves to `FAR_SEA_DEEP` over the basins
 *   (`seaDepthShare`, the log ramp of `seaShade`);
 * - the land by its relief, lit from the north-west, at most `FAR_RELIEF` lighter or darker;
 * - a nation's land toward its border and its coast, `FAR_EDGE` of its colour on the border and
 *   whole from `FAR_EDGE_BAND` inland (the difference of the two strongest holders' weights, as
 *   `BORDER_BAND`).
 * The first two are read from one texture made once from the elevation (`farShade`), one bilinear
 * lookup a pixel: the pass of T0 and T1 has no loop over the heights (it cost half as much again
 * when it had, PLAN 2.8a).
 */
export const FAR_SEA_SHALLOW = 1.2;
export const FAR_SEA_DEEP = 0.8;
export const FAR_RELIEF = 0.12;
export const FAR_EDGE = 0.84;
export const FAR_EDGE_BAND = 1;
/** How much steeper than it is the land is lit at T0 and T1, and how soon a slope's light is at its most. */
export const FAR_RELIEF_SCALE = 12;
export const FAR_RELIEF_GAIN = 2.2;

/** How far down the sea's ramp a depth is, 0 (the shore) to 1 (SEA_DEPTH_FULL metres and deeper). */
export function seaDepthShare(depth: number): number {
  return Math.min(1, Math.log(1 + Math.max(0, depth) / SEA_DEPTH_KNEE) / Math.log(1 + SEA_DEPTH_FULL / SEA_DEPTH_KNEE));
}

/** The least and the most a fill's colour is multiplied by at T0 and T1: the land's, and the sea's. */
export const FAR_LAND_RANGE: readonly [number, number] = [FAR_EDGE * (1 - FAR_RELIEF), 1 + FAR_RELIEF];
export const FAR_SEA_RANGE: readonly [number, number] = [FAR_SEA_DEEP, FAR_SEA_SHALLOW];

/**
 * The shades of T0 and T1 from the elevation (`elev`: metres, `w` × `h`, one a cell, the sea below
 * 0; `cellM` metres to a cell): two bytes a cell. The first: the land's light, 128 on level ground
 * and at sea, more where it faces the north-west; the mean of the cell and the eight about it (one
 * height in 20 km is a facet a cell without). The second: the sea's depth share, 0 on land and at
 * the shore to 255 at SEA_DEPTH_FULL. `wrapX`: the map goes round, west of the first column is
 * the last.
 */
export function farShade(w: number, h: number, elev: ArrayLike<number>, cellM: number, wrapX: boolean): Uint8Array {
  const light = new Float32Array(w * h);
  const at = (x: number, y: number): number => {
    const cx = wrapX ? (x + w) % w : Math.min(w - 1, Math.max(0, x));
    return Math.max(0, elev[Math.min(h - 1, Math.max(0, y)) * w + cx]!);
  };
  // The light: north-west and above, as the ground of T2 and T3 has it.
  const [lx, ly, lz] = [-0.5, -0.5, Math.SQRT1_2];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (elev[y * w + x]! <= 0) continue;
      const sx = ((at(x + 1, y) - at(x - 1, y)) / (2 * cellM)) * FAR_RELIEF_SCALE;
      const sy = ((at(x, y + 1) - at(x, y - 1)) / (2 * cellM)) * FAR_RELIEF_SCALE;
      const lit = (-sx * lx - sy * ly + lz) / Math.hypot(sx, sy, 1) / lz - 1;
      light[y * w + x] = Math.tanh(lit * FAR_RELIEF_GAIN);
    }
  }
  const out = new Uint8Array(w * h * 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = Math.min(h - 1, Math.max(0, y + dy));
        for (let dx = -1; dx <= 1; dx++) sum += light[yy * w + (wrapX ? (x + dx + w) % w : Math.min(w - 1, Math.max(0, x + dx)))]!;
      }
      const e = elev[y * w + x]!;
      out[(y * w + x) * 2] = e > 0 ? Math.round(128 + 127 * (sum / 9)) : 128;
      out[(y * w + x) * 2 + 1] = Math.round(255 * seaDepthShare(-e));
    }
  }
  return out;
}
