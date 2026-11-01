import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BALL_R } from '../../src/render/units/ballShader';
import { Ball2dCache, drawBall2dCached, type Ball2d } from '../../src/render/units/ball2d';

// PLAN 7.181: a countryball on the overlay drawn once and copied. Node has no canvas: a stub
// OffscreenCanvas whose context takes every call and keeps its transform.

const made: { w: number; h: number; transform: number[] }[] = [];

function stubContext(into?: { transform: number[] }): Record<string, unknown> {
  const own: Record<string, unknown> = {
    setTransform: (...t: number[]) => {
      if (into) into.transform = t;
    },
  };
  return new Proxy(own, {
    get: (t, k) => (k in t ? t[k as string] : k === 'createRadialGradient' ? () => ({ addColorStop: () => {} }) : () => {}),
    set: (t, k, v) => ((t[k as string] = v), true),
  });
}

beforeEach(() => {
  made.length = 0;
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      private readonly rec: { w: number; h: number; transform: number[] };
      constructor(w: number, h: number) {
        this.rec = { w, h, transform: [] };
        made.push(this.rec);
      }
      getContext(): unknown {
        return stubContext(this.rec);
      }
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

const flagA = {} as CanvasImageSource;
const flagB = {} as CanvasImageSource;
const ball = (flag: CanvasImageSource | null): Ball2d => ({ flag, tint: '#123456', look: 1, prop: 'none' });

/** A context at `scale` device px a CSS px, translated by (e, f), that records its copies. */
function target(scale: number, e = 0, f = 0): { ctx: CanvasRenderingContext2D; draws: { x: number; y: number; t: number[] }[] } {
  const draws: { x: number; y: number; t: number[] }[] = [];
  let t = [scale, 0, 0, scale, e, f];
  const ctx = Object.assign(stubContext(), {
    getTransform: () => ({ a: t[0], b: t[1], c: t[2], d: t[3], e: t[4], f: t[5] }),
    setTransform: (...n: number[]) => (t = n),
    save: () => {},
    restore: () => (t = [scale, 0, 0, scale, e, f]),
    drawImage: (_: unknown, x: number, y: number) => draws.push({ x, y, t: [...t] }),
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, draws };
}

describe('Ball2dCache (PLAN 7.181)', () => {
  it('draws a look once, and anew for a new flag image, tint, look, size, scale or place off the pixel', () => {
    const c = new Ball2dCache();
    const a = c.get(8, ball(flagA), 1);
    expect(a).not.toBeNull();
    expect(c.get(8, ball(flagA), 1)).toBe(a);
    expect(c.get(8, ball(flagB), 1)).not.toBe(a);
    expect(c.get(8, { ...ball(flagA), tint: '#654321' }, 1)).not.toBe(a);
    expect(c.get(8, { ...ball(flagA), look: -1 }, 1)).not.toBe(a);
    expect(c.get(7, ball(flagA), 1)).not.toBe(a);
    expect(c.get(8, ball(flagA), 2)).not.toBe(a);
    expect(c.get(8, ball(flagA), 1, 0.25, 0)).not.toBe(a);
    expect(made.length).toBe(7);
  });

  it('holds a hull and the engaged ring, the ball at its middle and its place off the pixel', () => {
    const b = new Ball2dCache().get(8, { ...ball(null), prop: 'hull', engaged: true }, 2, 0.25, 0.5)!;
    // A hull reaches 1.7 ball units out, 1.7 / BALL_R radii; the ring r + 2 × its width.
    expect(b.half).toBeGreaterThanOrEqual(2 * (1.7 / BALL_R) * 8);
    expect(made[0]!.w).toBe(2 * b.half);
    expect(made[0]!.transform).toEqual([2, 0, 0, 2, b.half + 0.25, b.half + 0.5]);
  });

  it('copies onto the device pixels, the ball within a quarter pixel of where it would be drawn', () => {
    const c = new Ball2dCache();
    const { ctx, draws } = target(1.5, 3, 0);
    // Centre at device (1.5 × 10.3 + 3, 1.5 × 20.1) = (18.45, 30.15): pixel (18, 30), place (0.5, 0.25).
    drawBall2dCached(ctx, c, 10.3, 20.1, 1.3, ball(flagA));
    const half = (c.get(1.3, ball(flagA), 1.5, 0.5, 0.25) as { half: number }).half;
    expect(made.length).toBe(1);
    expect(draws[0]).toEqual({ x: 18 - half, y: 30 - half, t: [1, 0, 0, 1, 0, 0] });
    // A place of 0.9 rounds up to the next pixel's 0.
    drawBall2dCached(ctx, c, (19.9 - 3) / 1.5, 20, 1.3, ball(flagA));
    expect(draws[1]!.x).toBe(20 - half);
  });

  it('starts again past its most, so zooming does not keep every size', () => {
    const c = new Ball2dCache();
    const first = c.get(1, ball(flagA), 1);
    for (let i = 2; i <= 5000; i++) c.get(i / 8, ball(flagA), 1);
    expect(c.get(1, ball(flagA), 1)).not.toBe(first);
  });
});
