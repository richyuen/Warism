import { describe, expect, it } from 'vitest';
import { LABEL_STRIDE, LabelField } from '../../src/shared/nationLabels';
import { deriveNationLabels, MAX_BEND, MAX_TILT, STEEP_KEEP } from '../../src/worker/deriveLabels';

// PLAN 1.29: label curves derived from control (worker side, pure).

const W = 200;
const H = 100;

function grid(fill: (x: number, y: number) => number): Uint16Array {
  const g = new Uint16Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = fill(x, y);
  return g;
}

const field = (d: Float64Array, id: number, f: keyof typeof LabelField): number => {
  for (let i = 0; i < d.length; i += LABEL_STRIDE) if (d[i] === id) return d[i + LabelField[f]]!;
  return NaN;
};

describe('nation label curves (PLAN 1.29)', () => {
  it('follow an elongated territory along its long axis, left to right', () => {
    // A 60 × 8 band from (20, 40) rising 1 cell per 4 to the right.
    const g = grid((x, y) => (x >= 20 && x < 80 && Math.abs(y - (40 - (x - 20) / 4)) < 4 ? 1 : 0));
    const d = deriveNationLabels(g, W, H, false);
    expect(d.length).toBe(LABEL_STRIDE);
    const x0 = field(d, 1, 'x0');
    const x2 = field(d, 1, 'x2');
    const y0 = field(d, 1, 'y0');
    const y2 = field(d, 1, 'y2');
    expect(x2).toBeGreaterThan(x0 + 30); // reads left to right along the band
    expect(y2).toBeLessThan(y0); // and rises with it
    expect(field(d, 1, 'thickness')).toBeLessThan(6);
    expect(field(d, 1, 'length')).toBeGreaterThan(30);
  });

  it("labels the capital's component, not the largest one", () => {
    // Nation 2: a small home (25 × 6) and a big colony (60 × 30).
    const g = grid((x, y) => ((x >= 10 && x < 35 && y >= 10 && y < 16) || (x >= 100 && x < 160 && y >= 50 && y < 80) ? 2 : 0));
    const home = 12 * W + 20;
    const withCap = deriveNationLabels(g, W, H, false, new Map([[2, home]]));
    expect(field(withCap, 2, 'x0')).toBeLessThan(40);
    const without = deriveNationLabels(g, W, H, false);
    expect(field(without, 2, 'x0')).toBeGreaterThan(90);
  });

  it('keeps a component across the date line in one piece (x unwrapped)', () => {
    const g = grid((x, y) => ((x < 15 || x >= W - 15) && y >= 30 && y < 40 ? 3 : 0));
    const d = deriveNationLabels(g, W, H, true);
    const len = field(d, 3, 'length');
    expect(len).toBeGreaterThan(15); // spans ~30 cells across the seam, not two halves
    expect(field(d, 3, 'x2') - field(d, 3, 'x0')).toBeLessThan(40);
  });

  it('skips territories too small to name', () => {
    const g = grid((x, y) => (x < 4 && y < 4 ? 4 : 0));
    expect(deriveNationLabels(g, W, H, false).length).toBe(0);
  });
});

// ROADMAP R92b (ADR-1082): a name is turned at most MAX_TILT from level and bows at most MAX_BEND of its length,
// unless its land is too narrow for a name across it.
describe("a name's turn and bow (R92b)", () => {
  const tilt = (d: Float64Array, id: number): number => Math.atan2(field(d, id, 'y2') - field(d, id, 'y0'), field(d, id, 'x2') - field(d, id, 'x0'));
  /** A slab `long` × `wide` cells about (cx, cy), its long side at `deg` from level. */
  const slab = (cx: number, cy: number, long: number, wide: number, deg: number): Uint16Array => {
    const [c, s] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
    return grid((x, y) => {
      const [dx, dy] = [x + 0.5 - cx, y + 0.5 - cy];
      return Math.abs(dx * c + dy * s) <= long / 2 && Math.abs(-dx * s + dy * c) <= wide / 2 ? 1 : 0;
    });
  };

  it('a land lying up to MAX_TILT has its name along its long axis, as before', () => {
    for (const deg of [-30, -20, -5, 0, 12, 29]) {
      const d = deriveNationLabels(slab(100, 50, 60, 16, deg), W, H, false);
      expect((tilt(d, 1) * 180) / Math.PI, `a slab at ${deg}`).toBeCloseTo(deg, 0);
      expect(field(d, 1, 'length'), `a slab at ${deg}`).toBeGreaterThan(40);
    }
  });

  it('a broad land that lies steeper has its name at MAX_TILT, the way its axis leans, and inside the land', () => {
    for (const deg of [45, 60, 75, 89, -45, -60, -80]) {
      const g = slab(100, 50, 60, 36, deg);
      const d = deriveNationLabels(g, W, H, false);
      expect(d.length, `a slab at ${deg}`).toBe(LABEL_STRIDE);
      expect((tilt(d, 1) * 180) / Math.PI, `a slab at ${deg}`).toBeCloseTo(Math.sign(deg) * ((MAX_TILT * 180) / Math.PI), 0);
      // Both ends of the baseline on the land: the name is where the land is, not where its shadow on the line is.
      for (const [fx, fy] of [['x0', 'y0'], ['x2', 'y2']] as const) expect(g[Math.floor(field(d, 1, fy)) * W + Math.floor(field(d, 1, fx))], `a slab at ${deg}: the baseline's end on the land`).toBe(1);
      // No longer than the land is across at that angle (36 wide at the slab's angle less 30 degrees).
      const across = 36 / Math.abs(Math.sin(((Math.abs(deg) - 30) * Math.PI) / 180));
      expect(field(d, 1, 'length'), `a slab at ${deg}`).toBeLessThanOrEqual(Math.min(60, across) + 2);
      expect(field(d, 1, 'length'), `a slab at ${deg}`).toBeGreaterThan(14);
    }
  });

  it('a land too narrow for a name across it keeps the name along its axis, however steep (Chile, Norway)', () => {
    for (const deg of [70, 88, -75]) {
      const d = deriveNationLabels(slab(100, 50, 80, 7, deg), W, H, false);
      expect(Math.abs((tilt(d, 1) * 180) / Math.PI), `a strip at ${deg}`).toBeGreaterThan(60);
      expect(field(d, 1, 'length'), `a strip at ${deg}`).toBeGreaterThan(50);
    }
    // The bar between the two: across is kept from STEEP_KEEP of the length along.
    expect(STEEP_KEEP).toBeGreaterThan(0.2);
    expect(STEEP_KEEP).toBeLessThan(0.6);
  });

  it('a bent land: the baseline bows with it, at most MAX_BEND of its length', () => {
    // An arc of a ring: a boomerang 90 cells across, bent by far more than a name bows.
    const g = grid((x, y) => {
      const r = Math.hypot(x - 100, y - 95);
      return r >= 60 && r <= 72 && y < 60 ? 1 : 0;
    });
    const d = deriveNationLabels(g, W, H, false);
    const [x0, y0, cx, cy, x2, y2] = (['x0', 'y0', 'cx', 'cy', 'x2', 'y2'] as const).map((f) => field(d, 1, f));
    // The curve's middle against the chord's: a quarter of the way from the chord's middle to the control point.
    const bow = Math.hypot((cx! - (x0! + x2!) / 2) / 2, (cy! - (y0! + y2!) / 2) / 2);
    expect(bow).toBeGreaterThan(1);
    expect(bow).toBeLessThanOrEqual(MAX_BEND * field(d, 1, 'length') + 1e-9);
    // A straight slab does not bow.
    const flat = deriveNationLabels(slab(100, 50, 60, 16, 10), W, H, false);
    expect(Math.hypot(field(flat, 1, 'cx') - (field(flat, 1, 'x0') + field(flat, 1, 'x2')) / 2, field(flat, 1, 'cy') - (field(flat, 1, 'y0') + field(flat, 1, 'y2')) / 2)).toBeLessThan(1);
  });
});
