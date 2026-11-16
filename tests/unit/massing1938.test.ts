import { describe, expect, it } from 'vitest';
import { MASS_BAR_DAYS, MASS_DAYS, MASS_NEAR_CELLS, MASS_PROBE, MASS_READY, beginMassing, massPoints, massStep, unprepared } from '../../src/sim/ai/massing';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R97b (ADR-1089, the user's choice): a nation at peace brings its army to the border of the war it has
// chosen, and declares when it stands there. The step is driven here by hand, the world's AI off, so that what
// is read is the rule's and no other nation's war.

const W = SIZE_1938.w;
const [GER, POL, CZS, BRA] = ['GER', 'POL', 'CZS', 'BRA'].map(nationId) as [number, number, number, number];

function quiet(seed: number): Sim {
  const s = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
  s.command({ kind: 'setSetting', key: 'aiEnabled', value: false });
  return s;
}

/** [the men of `n`'s land formations on the border's land within MASS_NEAR_CELLS of a point, all of them there]. */
function atBorder(world: World, n: number, t: number): [number, number] {
  const f = world.formations.cols;
  const points = massPoints(world, n, t);
  const comp = navOf(world).grid.component;
  const lands = new Set(points.map((p) => comp[p]!));
  let [near, all] = [0, 0];
  world.formations.forEach((id) => {
    if (f.nation[id] !== n || world.isFleet(id) || world.isWing(id) || world.embarked.has(id)) return;
    if (!lands.has(comp[Math.floor(f.y[id]!) * W + Math.floor(f.x[id]!)]!)) return;
    all += f.strength[id]!;
    if (points.some((p) => Math.hypot((p % W) + 0.5 - f.x[id]!, Math.floor(p / W) + 0.5 - f.y[id]!) <= MASS_NEAR_CELLS)) near += f.strength[id]!;
  });
  return [near, all];
}

/** Steps a day at a time, the massing's step first, until `n` masses no more or `days` have passed; the days stepped. */
function mass(s: Sim, n: number, days: number, still: (n: number, t: number) => boolean = () => true): number {
  let d = 0;
  for (; d < days && s.world.massing.has(n); d++) {
    massStep(s.world, s.world.tick / 24, still);
    if (s.world.massing.has(n)) s.step(24);
  }
  return d;
}

describe('massing (ROADMAP R97b)', () => {
  it("the border's points are the nation's own cells beside the target's", () => {
    const w = quiet(1).world;
    const points = massPoints(w, GER, POL);
    expect(points.length).toBeGreaterThan(3);
    const ctl = w.cells.controller;
    for (const p of points) {
      expect(ctl[p]).toBe(GER);
      expect([p - W, p + W, p - 1, p + 1].some((c) => ctl[c] === POL), `cell ${p}`).toBe(true);
    }
    // None with a nation it has no border with.
    expect(BRA).toBeGreaterThan(0);
    expect(massPoints(w, GER, BRA)).toEqual([]);
  });

  it('the army comes to the border, and the war is declared when half of it stands there', () => {
    const s = quiet(1);
    const w = s.world;
    const [near0, all0] = atBorder(w, GER, POL);
    expect(near0 / all0, "Germany's share at the Polish border as the game begins").toBeLessThan(MASS_READY);
    expect(beginMassing(w, GER, POL, 0)).toBe(true);
    expect(w.wars.atWar(GER, POL)).toBe(false);
    const days = mass(s, GER, MASS_DAYS + 2);
    expect(w.wars.atWar(GER, POL), `after ${days} days`).toBe(true);
    expect(days).toBeGreaterThan(1);
    const [near, all] = atBorder(w, GER, POL);
    expect(near / all).toBeGreaterThanOrEqual(MASS_READY);
    expect(w.massing.size).toBe(0);
    expect(w.massBarred.size).toBe(0);
  }, 120_000);

  it('a war the strategic AI would no longer declare is given up as the army stands ready', () => {
    const s = quiet(1);
    const w = s.world;
    beginMassing(w, GER, POL, 0);
    mass(s, GER, MASS_DAYS + 2, () => false);
    expect(w.massing.has(GER)).toBe(false);
    expect(w.wars.atWar(GER, POL)).toBe(false);
    expect(w.massBarred.size).toBe(0);
  }, 120_000);

  it('a massing is saved, and goes on from the save as it would have', () => {
    const s = quiet(1);
    beginMassing(s.world, GER, POL, 0);
    mass(s, GER, 3);
    s.world.massBarred.set(POL * 65536 + GER, 400);
    const u = quiet(2);
    u.load(s.save());
    expect([...u.world.massing]).toEqual([[GER, { target: POL, since: 0 }]]);
    expect([...u.world.massBarred]).toEqual([[POL * 65536 + GER, 400]]);
    expect(u.hash()).toBe(s.hash());
    mass(s, GER, 4);
    mass(u, GER, 4);
    expect(u.hash()).toBe(s.hash());
  }, 120_000);

  it('a massing past its days is given up, and its target barred for a year', () => {
    const w = quiet(1).world;
    w.massing.set(GER, { target: POL, since: 0 });
    massStep(w, MASS_DAYS, () => true);
    expect(w.massing.has(GER)).toBe(true);
    // Its army ordered to the border, none there yet: not ready, and late the day after.
    massStep(w, MASS_DAYS + 1, () => true);
    expect(w.massing.has(GER)).toBe(false);
    expect(w.wars.atWar(GER, POL)).toBe(false);
    const until = MASS_DAYS + 1 + MASS_BAR_DAYS;
    expect(w.massBarred.get(GER * 65536 + POL)).toBe(until);
    expect(unprepared(w, GER, [POL], until - 1, 0).has(POL)).toBe(true);
    expect(unprepared(w, GER, [POL], until, 0).has(POL)).toBe(false);
    expect(w.massBarred.size).toBe(0);
  });

  it('a nation at war prepares none: it declares as before, and the probe switches the rule off', () => {
    const s = quiet(1);
    const w = s.world;
    declareWar(w, GER, CZS);
    expect(w.wars.atWar(GER, CZS)).toBe(true);
    expect(beginMassing(w, GER, POL, 0)).toBe(false);
    expect(w.massing.size).toBe(0);
    const v = quiet(1).world;
    MASS_PROBE.off = true;
    try {
      expect(beginMassing(v, GER, POL, 0)).toBe(false);
    } finally {
      MASS_PROBE.off = false;
    }
    // A massing is given up when its nation is at war.
    const x = quiet(1);
    beginMassing(x.world, GER, POL, 0);
    declareWar(x.world, GER, CZS);
    massStep(x.world, 1, () => true);
    expect(x.world.massing.size).toBe(0);
    expect(x.world.massBarred.size).toBe(0);
  });
});
