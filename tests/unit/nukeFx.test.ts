import { describe, expect, it } from 'vitest';
import { EVENT_STRIDE, EventKind } from '../../src/shared/events';
import { CLOUD_MS, FLASH_MS, MARK_MS, MIN_PX, NukeFx, SHOCK_MS } from '../../src/render/fx/nuke';
import { THERMO_YIELD } from '../../src/shared/nuclear';

// PLAN 6.6b: a burst's effects take the snapshot's `NukeDetonated` alone, are sized by the yield's
// blast radius at the camera's scale (at least MIN_PX), live MARK_MS (the cloud, then ground zero's mark; ROADMAP
// R81c), and can be held at an age. Two parts (R82i): the ground (mark, shockwave, the cloud's foot) under the units,
// the air (flash, the cloud's cap) over all, the cap above the struck stack's counter once the flash is over.

const ev = (kind: number, yieldN: number, x: number, y: number): number[] => {
  const r = new Array<number>(EVENT_STRIDE).fill(0);
  [r[2], r[4], r[5], r[6]] = [kind, yieldN, x, y];
  return r;
};

describe('a nuclear burst\'s effects (PLAN 6.6b)', () => {
  it('takes the bursts of a snapshot, no other event; lives MARK_MS; a hold stops the clock', () => {
    const fx = new NukeFx();
    fx.add(3, [...ev(EventKind.AirStrike, 1, 5, 5), ...ev(EventKind.NukeDetonated, 2, 10, 20), ...ev(EventKind.NukeCasualties, 1, 10, 20)], 1000);
    expect(fx.bursts).toEqual([{ x: 10, y: 20, yieldN: 2, born: 1000 }]);
    expect(fx.animating(1000 + MARK_MS - 1)).toBe(true);
    expect(fx.animating(1000 + MARK_MS)).toBe(false);
    fx.add(0, [], 1000 + MARK_MS);
    expect(fx.bursts).toEqual([]);
    fx.hold = 500;
    expect(fx.animating(0)).toBe(false);
  });

  it('a radius by the yield\'s cube root at the camera\'s scale, MIN_PX at least', () => {
    const geo = { w: 2048, h: 1024, wrapX: true } as unknown as Parameters<typeof NukeFx.radiusPx>[2];
    const at = (scale: number, yieldN: number): number => NukeFx.radiusPx({ x: 0, y: 0, yieldN, born: 0 }, { cx: 0, cy: 0, scale }, geo);
    expect(at(1, 1)).toBe(MIN_PX);
    const near = at(100, 1);
    expect(near).toBeCloseTo((25 / (40075 / 2048)) * 100, 9);
    // Class 2, a thermonuclear warhead: THERMO_YIELD fission ones (PLAN 7.20).
    expect(at(100, 2) / near).toBeCloseTo(Math.cbrt(THERMO_YIELD), 9);
  });

  it("draws the ground and the air apart; past the flash the air's paint stays over a blast radius above ground zero (R82i)", () => {
    // A context that keeps the lowest point of every shape filled.
    let lowest = -Infinity;
    const grad = { addColorStop: (): void => undefined };
    const ctx = new Proxy({} as Record<string | symbol, unknown>, {
      get: (_t, k) => {
        if (k === 'arc') return (_x: number, y: number, r: number): void => void (lowest = Math.max(lowest, y + r));
        if (k === 'ellipse') return (_x: number, y: number, _rx: number, ry: number): void => void (lowest = Math.max(lowest, y + ry));
        if (k === 'fillRect') return (): void => void (lowest = Infinity);
        if (k === 'moveTo' || k === 'lineTo') return (_x: number, y: number): void => void (lowest = Math.max(lowest, y));
        if (k === 'quadraticCurveTo') return (_a: number, b: number, _c: number, y: number): void => void (lowest = Math.max(lowest, b, y));
        if (k === 'createRadialGradient' || k === 'createLinearGradient') return (): typeof grad => grad;
        return (): void => undefined;
      },
      set: () => true,
    }) as unknown as CanvasRenderingContext2D;
    const geo = { w: 2048, h: 1024, wrapX: true } as unknown as Parameters<typeof NukeFx.radiusPx>[2];
    const [vw, vh] = [1600, 900];
    const cam = { cx: 100, cy: 100, scale: 1 };
    const fx = new NukeFx();
    fx.bursts = [{ x: 100, y: 100, yieldN: 1, born: 0 }];
    const r = NukeFx.radiusPx(fx.bursts[0]!, cam, geo);
    const gz = vh / 2;
    fx.hold = 300;
    fx.draw(ctx, cam, geo, vw, vh, 0);
    expect(fx.shown).toEqual([1, 1, 1, 1]);
    fx.draw(ctx, cam, geo, vw, vh, 0, 'ground');
    expect(fx.shown).toEqual([0, 1, 0, 1]);
    fx.draw(ctx, cam, geo, vw, vh, 0, 'air');
    expect(fx.shown).toEqual([1, 1, 1, 1]);
    for (let age = FLASH_MS; age < CLOUD_MS; age += 100) {
      fx.hold = age;
      lowest = -Infinity;
      fx.shown = [0, 0, 0, 0];
      fx.draw(ctx, cam, geo, vw, vh, 0, 'air');
      expect(fx.shown, `${age} ms`).toEqual([0, 0, 1, 0]);
      expect(lowest, `${age} ms`).toBeLessThan(gz - r);
    }
    fx.hold = SHOCK_MS + CLOUD_MS;
    fx.draw(ctx, cam, geo, vw, vh, 0, 'ground');
    expect(fx.shown).toEqual([0, 0, 0, 1]);
  });
});
