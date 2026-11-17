import { describe, expect, it } from 'vitest';
import { HERO_LIFT_PX_MS, heroClear, HeroLifts, MARKER_H } from '../../src/render/units/markers';

// ROADMAP R131: a hero's marker at T1 chose its place anew in each frame against that frame's markers (R34g's
// `heroClear`). In R125's wheel run (seed 56951, day 30, 900 to 1,758 m/px and back) it leapt 30 px at a step, and
// for a frame to the other side of its unit (136 px) while the boxes about it eased. Now it keeps its side while
// it stands off and moves at HERO_LIFT_PX_MS.

const box = (x: number, y: number): { x: number; y: number; w: number; h: number; alpha: number } => ({ x, y, w: 26, h: MARKER_H, alpha: 1 });

describe("a hero's marker keeps its side and moves at a speed (ROADMAP R131)", () => {
  it('heroClear: on its place where it covers none; else above or below, and the side it had while it must stand off', () => {
    expect(heroClear([box(200, 200)], 100, 100, 2)).toBe(100);
    // A marker under its lower half, and three more below that: above covers less.
    const above = [box(90, 110), box(90, 150), box(60, 150), box(120, 150)];
    const up = heroClear(above, 100, 100, 2);
    expect(up).toBeLessThan(100);
    // The same with the markers over it: below.
    const below = [box(90, 70), box(90, 30), box(60, 30), box(120, 30)];
    const down = heroClear(below, 100, 100, 2);
    expect(down).toBeGreaterThan(100);
    // It stood below and the markers are now those that would send it above: it stays below, clear of what it covers.
    const kept = heroClear(above, 100, 100, 2, 1);
    expect(kept).toBeGreaterThan(100);
    expect(heroClear(below, 100, 100, 2, -1)).toBeLessThan(100);
    // Clear on its place, it goes back there whatever side it had.
    expect(heroClear([box(200, 200)], 100, 100, 2, 1)).toBe(100);
  });

  it('a marker new to the view stands where it should at once; then it moves 6 px a frame at most', () => {
    const lifts = new HeroLifts();
    lifts.begin();
    expect(lifts.side(7)).toBe(0);
    expect(lifts.lift(7, -32, 1000)).toBe(-32);
    lifts.end();
    expect(lifts.animating()).toBe(false);
    // The markers under it change: 60 px above now. A frame of 16 ms: 4.8 px of the way.
    lifts.begin();
    expect(lifts.side(7)).toBe(-1);
    expect(lifts.lift(7, -60, 1016)).toBeCloseTo(-32 - HERO_LIFT_PX_MS * 16, 9);
    lifts.end();
    expect(lifts.animating()).toBe(true);
    // A slow frame (400 ms: a scripted zoom's step) is no leap: 20 ms of the way.
    lifts.begin();
    const slow = lifts.lift(7, -60, 1416);
    lifts.end();
    expect(slow).toBeCloseTo(-32 - HERO_LIFT_PX_MS * 36, 9);
    // It comes to rest there, each frame no more than 6 px.
    let at = slow;
    let now = 1416;
    for (let i = 0; i < 40 && lifts.animating(); i++) {
      now += 16;
      lifts.begin();
      const next = lifts.lift(7, -60, now);
      lifts.end();
      expect(Math.abs(next - at)).toBeLessThanOrEqual(6 + 1e-9);
      at = next;
    }
    expect(at).toBe(-60);
    expect(lifts.animating()).toBe(false);
  });

  it('one not drawn for half a second, or after a clear, stands where it should at once', () => {
    const lifts = new HeroLifts();
    lifts.begin();
    lifts.lift(7, -32, 1000);
    lifts.end();
    lifts.begin();
    expect(lifts.lift(7, 40, 1600)).toBe(40);
    lifts.end();
    // Not in a frame: forgotten.
    lifts.begin();
    lifts.end();
    lifts.begin();
    expect(lifts.side(7)).toBe(0);
    expect(lifts.lift(7, -20, 1616)).toBe(-20);
    lifts.end();
    lifts.clear();
    lifts.begin();
    expect(lifts.lift(7, 50, 1632)).toBe(50);
    lifts.end();
  });

  it('through a change of the markers that would flip it for a frame it stays on its side', () => {
    const lifts = new HeroLifts();
    const frames = [
      [box(90, 110), box(90, 150), box(60, 150), box(120, 150)],
      [box(90, 110), box(90, 70), box(60, 30), box(120, 30), box(90, 30)],
      [box(90, 110), box(90, 150), box(60, 150), box(120, 150)],
    ];
    // By the frame's markers alone the middle frame is on the other side.
    expect(frames.map((f) => Math.sign(heroClear(f, 100, 100, 2) - 100))).toEqual([-1, 1, -1]);
    const sides: number[] = [];
    let last = 0;
    frames.forEach((f, i) => {
      lifts.begin();
      const lift = lifts.lift(7, heroClear(f, 100, 100, 2, lifts.side(7)) - 100, 1000 + i * 16);
      lifts.end();
      if (i > 0) expect(Math.abs(lift - last)).toBeLessThanOrEqual(6 + 1e-9);
      last = lift;
      sides.push(Math.sign(lift));
    });
    expect(sides).toEqual([-1, -1, -1]);
  });
});
