import { describe, expect, it } from 'vitest';
import { Director, DIRECTOR_GAP_MS, DIRECTOR_HOLD_MS, DIRECTOR_STALE_MS, shotKey } from '../../src/app/director';
import { EventKind } from '../../src/shared/events';
import type { TickerRow } from '../../src/shared/history';

// ROADMAP R142: the director's rules, by its hooks: a cut no sooner than DIRECTOR_GAP_MS after the last and
// DIRECTOR_HOLD_MS after the camera stood; a strike before what waits; what stands in a close view is seen without a
// flight; old news passed over; the player's hand turns it off.

const row = (tick: number, kind: number, x: number): TickerRow => ({ i: tick, tick, kind, a: 1, b: 2, x, y: 10, an: '', bn: '', of: '' });

/** A director whose camera is at `at.x`, a flight taking `flightMs`, the view `at.km` across and 20 cells wide. */
function rig(flightMs = 1000) {
  const d = new Director();
  const at = { x: -100, until: 0, km: 1500, now: 0 };
  const flown: number[] = [];
  d.go = (x) => {
    flown.push(x);
    at.x = x;
    at.until = at.now + flightMs;
  };
  d.moving = () => at.now < at.until;
  d.inView = (x) => Math.abs(x - at.x) < 10;
  d.kmAcross = () => at.km;
  const run = (ms: number): void => {
    for (let t = 0; t < ms; t += 16) {
      at.now += 16;
      d.update(at.now);
    }
  };
  return { d, at, flown, run };
}

describe('the director (ROADMAP R142)', () => {
  it('cuts no sooner than its gap and its hold, and sees what stands in the view', () => {
    const { d, at, flown, run } = rig();
    d.toggle([], 0);
    d.add([row(1, EventKind.WarDeclared, 100), row(2, EventKind.MajorBattleStarted, 200), row(3, EventKind.CapitalCaptured, 205), row(4, EventKind.WarDeclared, 300)], 0);
    run(20_000);
    // 205 stands in the view of 200: seen there, never flown to.
    expect(flown).toEqual([100, 200, 300]);
    expect(d.seen.map((s) => s.key)).toEqual([shotKey(row(1, EventKind.WarDeclared, 100)), shotKey(row(2, EventKind.MajorBattleStarted, 200)), shotKey(row(3, EventKind.CapitalCaptured, 205)), shotKey(row(4, EventKind.WarDeclared, 300))]);
    const gaps = d.cuts.slice(1).map((c, i) => c - d.cuts[i]!);
    for (const g of gaps) expect(g).toBeGreaterThanOrEqual(Math.max(DIRECTOR_GAP_MS, 1000 + DIRECTOR_HOLD_MS));
    expect(at.x).toBe(300);
  });

  it('a strike goes before what waits', () => {
    const { d, flown, run } = rig();
    d.toggle([], 0);
    d.add([row(1, EventKind.WarDeclared, 100), row(2, EventKind.WarDeclared, 200)], 0);
    run(100);
    d.add([row(3, EventKind.NukeCasualties, 900)], 100);
    run(12_000);
    expect(flown).toEqual([100, 900, 200]);
  });

  it('a far view sees nothing: it flies there', () => {
    const { d, at, flown, run } = rig();
    at.x = 100;
    at.km = 20_000;
    d.toggle([], 0);
    d.add([row(1, EventKind.WarDeclared, 100)], 0);
    run(100);
    expect(flown).toEqual([100]);
  });

  it('old news is passed over', () => {
    // The first flight outlasts the second's time to wait.
    const late = rig(DIRECTOR_STALE_MS * 2);
    late.d.toggle([], 0);
    late.d.add([row(1, EventKind.WarDeclared, 100), row(2, EventKind.WarDeclared, 200)], 0);
    late.run(DIRECTOR_STALE_MS * 2 + 5000);
    // The second waited out its time behind a flight that did not end: passed over.
    expect(late.flown).toEqual([100]);
  });

  it("the player's hand turns it off; off, it takes no rows", () => {
    const { d, flown, run } = rig();
    d.toggle([], 0);
    d.add([row(1, EventKind.WarDeclared, 100), row(2, EventKind.WarDeclared, 200)], 0);
    run(100);
    d.stop();
    expect(d.on.value).toBe(false);
    run(20_000);
    expect(flown).toEqual([100]);
    d.add([row(3, EventKind.WarDeclared, 300)], 0);
    d.toggle([], 0);
    run(20_000);
    expect(flown).toEqual([100]);
  });

  it('on, it starts at the newest row of the ticker of its kinds', () => {
    const { d, flown, run } = rig();
    d.toggle([row(1, EventKind.WarDeclared, 100), row(2, EventKind.CapitalCaptured, 200), row(3, EventKind.PeaceSigned, 300)], 0);
    run(100);
    expect(flown).toEqual([200]);
  });
});
