import { describe, expect, it } from 'vitest';
import { clearOf, type ScreenRect } from '../../src/render/units/clearOf';

// ROADMAP R34e (critic run 31, R31-N1): a hero's counter under a panel over the map is drawn beside it.

const over = (a: ScreenRect, b: ScreenRect): boolean => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const ranking: ScreenRect = { x: 1330, y: 8, w: 262, h: 395 };

describe('a hero counter kept clear of the panels (ROADMAP R34e)', () => {
  it('none over it: where it was', () => {
    expect(clearOf({ x: 100, y: 100, w: 80, h: 18 }, [ranking], 1600, 900)).toEqual({ x: 100, y: 100 });
  });
  it('under the Ranking near its left edge: just left of it, the same height', () => {
    const b = { x: 1360, y: 200, w: 90, h: 18 };
    const at = clearOf(b, [ranking], 1600, 900);
    expect(at.y).toBe(200);
    expect(at.x + b.w).toBeLessThanOrEqual(ranking.x);
    expect(over({ ...b, ...at }, ranking)).toBe(false);
  });
  it('near its bottom: beside it at its own height, not below (R8: within a step of its height)', () => {
    const b = { x: 1480, y: 395, w: 90, h: 18 };
    const at = clearOf(b, [ranking], 1600, 900);
    expect(at).toEqual({ x: ranking.x - 90 - 2, y: 395 });
  });
  it('never into another panel or off the view; nowhere clear, where it was', () => {
    const top: ScreenRect = { x: 0, y: 0, w: 1600, h: 40 };
    const left: ScreenRect = { x: 1200, y: 0, w: 130, h: 900 };
    const b = { x: 1360, y: 200, w: 90, h: 18 };
    const at = clearOf(b, [ranking, top, left], 1600, 900);
    expect(at).toEqual({ x: 1360, y: ranking.y + ranking.h + 2 });
    const all: ScreenRect = { x: 0, y: 0, w: 1600, h: 900 };
    expect(clearOf(b, [all], 1600, 900)).toEqual({ x: 1360, y: 200 });
  });
});
