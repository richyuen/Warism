import { describe, expect, it } from 'vitest';
import { MASS_DAYS, MASS_NEAR_CELLS, MASS_PROBE, MASS_SEEN, MASS_SHARE, beginMassing, massPoints, massStep } from '../../src/sim/ai/massing';
import { EventKind } from '../../src/shared/events';
import { TICKER_KINDS } from '../../src/shared/history';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import { navOf, type World } from '../../src/sim/world';
import { historyText } from '../../src/ui/historyText';
import { historyRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R103 (ADR-1093): a nation that sees an army gathered at its border brings its own there. The massing's
// step is driven by hand, the world's AI off, as in `massing1938.test.ts`: what moves is by this rule alone. The
// Soviet Union's massing on Romania (seed 1): 1 % of its men at that border as the game begins, half after a month;
// Romania's 8 %.

const W = SIZE_1938.w;
const [SOV, ROM, HUN, BUL, YUG, POL] = ['SOV', 'ROM', 'HUN', 'BUL', 'YUG', 'POL'].map(nationId) as [number, number, number, number, number, number];

function quiet(): Sim {
  const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  s.command({ kind: 'setSetting', key: 'aiEnabled', value: false });
  return s;
}

/** The share of `n`'s men on the border's land that stand within MASS_NEAR_CELLS of a point of its border with `t`. */
function shareAt(world: World, n: number, t: number): number {
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
  return near / Math.max(1, all);
}

/** The formations of `n` on the march, and of them those to a point of its border with `t`. */
function marching(world: World, n: number, t: number): [number, number] {
  const f = world.formations.cols;
  const points = new Set(massPoints(world, n, t));
  let [all, there] = [0, 0];
  world.formations.forEach((id) => {
    if (f.nation[id] !== n || f.moving[id] !== 1) return;
    all++;
    if (points.has(f.targetCell[id]!)) there++;
  });
  return [all, there];
}

/**
 * The Soviet Union's massing on Romania, a day at a time, until it is over (the war it would declare is given up: the
 * army's places are what is read): the days; Romania's share at that border after; and the most Romanian formations
 * on the march on a day before the Soviet army was seen.
 */
function massed(s: Sim, before: (w: World) => void = () => {}): { days: number; share: number; early: number; seenOn: number } {
  const w = s.world;
  before(w);
  expect(beginMassing(w, SOV, ROM, 0)).toBe(true);
  let [days, early, seenOn] = [0, 0, -1];
  for (; days < MASS_DAYS + 2 && w.massing.has(SOV); days++) {
    const seen = shareAt(w, SOV, ROM) >= MASS_SEEN;
    if (seen && seenOn < 0) seenOn = days;
    massStep(w, w.tick / 24, () => false);
    if (!seen) early = Math.max(early, marching(w, ROM, SOV)[0]);
    if (w.massing.has(SOV)) s.step(24);
  }
  return { days, share: shareAt(w, ROM, SOV), early, seenOn };
}

describe("a massing's target answers (ROADMAP R103)", () => {
  it('Romania brings its army to the border once the Soviet army is seen there, and not before', () => {
    const s = quiet();
    const at0 = shareAt(s.world, ROM, SOV);
    expect(shareAt(s.world, SOV, ROM), "the Soviet Union's share at the border as the game begins").toBeLessThan(MASS_SEEN);
    expect(at0, "Romania's share at the border as the game begins").toBeLessThan(0.2);
    const r = massed(s);
    process.stderr.write(`the Soviet Union on Romania: ${r.days} days, seen on day ${r.seenOn}; Romania at the border ${Math.round(100 * at0)} % -> ${Math.round(100 * r.share)} %\n`);
    expect(r.seenOn, 'the day the Soviet army is seen').toBeGreaterThan(2);
    expect(r.days).toBeGreaterThan(r.seenOn + 3);
    expect(r.early, 'Romanian formations on the march before it is seen').toBe(0);
    expect(r.share, "Romania's share at the border as the massing ends").toBeGreaterThan(0.5);
    expect(s.world.wars.atWar(SOV, ROM)).toBe(false);
    expect(s.world.massing.size).toBe(0);
  }, 240_000);

  it('with the probe off, as before: Romania does nothing', () => {
    const s = quiet();
    const at0 = shareAt(s.world, ROM, SOV);
    MASS_PROBE.noAnswer = true;
    try {
      const r = massed(s);
      expect(r.share).toBe(at0);
      expect(marching(s.world, ROM, SOV)[0]).toBe(0);
    } finally {
      delete MASS_PROBE.noAnswer;
    }
  }, 240_000);

  it('a target at war has its fronts: it does not answer', () => {
    const s = quiet();
    const at0 = shareAt(s.world, ROM, SOV);
    let most = 0;
    const w = s.world;
    declareWar(w, HUN, ROM);
    expect(beginMassing(w, SOV, ROM, 0)).toBe(true);
    for (let d = 0; d < 45 && w.massing.has(SOV); d++) {
      massStep(w, w.tick / 24, () => false);
      most = Math.max(most, marching(w, ROM, SOV)[1]);
      if (w.massing.has(SOV)) s.step(24);
    }
    expect(shareAt(w, SOV, ROM), 'the Soviet army seen by then').toBeGreaterThanOrEqual(MASS_SEEN);
    expect(most, 'Romanian formations ordered to the Soviet border').toBe(0);
    expect(shareAt(w, ROM, SOV)).toBeLessThanOrEqual(at0);
  }, 240_000);

  it('a target that prepares a war of its own, or whose army is not its AI\'s, does not answer', () => {
    // The Soviet army seen and Romania not yet moved (the probe); then one day's step with the rule on.
    const seenUnmoved = (): Sim => {
      const s = quiet();
      const w = s.world;
      MASS_PROBE.noAnswer = true;
      try {
        expect(beginMassing(w, SOV, ROM, 0)).toBe(true);
        for (let d = 0; d < 40 && shareAt(w, SOV, ROM) < MASS_SEEN; d++) {
          massStep(w, w.tick / 24, () => false);
          s.step(24);
        }
      } finally {
        delete MASS_PROBE.noAnswer;
      }
      expect(w.massing.has(SOV)).toBe(true);
      expect(shareAt(w, SOV, ROM)).toBeGreaterThanOrEqual(MASS_SEEN);
      expect(marching(w, ROM, SOV)[0]).toBe(0);
      return s;
    };
    const answered = (set: (w: World) => void): number => {
      const w = seenUnmoved().world;
      set(w);
      const massing = w.massing.has(ROM);
      massStep(w, w.tick / 24, () => false);
      expect(w.massing.has(ROM), 'its own massing goes on').toBe(massing);
      return marching(w, ROM, SOV)[1];
    };
    expect(answered(() => {}), 'ordered to the Soviet border on the day it is seen').toBeGreaterThan(3);
    // Its own massing begun that day, on a neighbour at whose border its army does not stand yet (so that it is not
    // over at once): its army goes to that border by its own plan.
    let own = 0;
    const prepared = answered((w) => {
      own = [BUL, HUN, YUG, POL].find((t) => massPoints(w, ROM, t).length > 0 && shareAt(w, ROM, t) < 0.4) ?? 0;
      expect(own, 'a neighbour Romania is not ready at').toBeGreaterThan(0);
      w.massing.set(ROM, { target: own, since: w.tick / 24 });
    });
    expect(prepared, 'preparing a war of its own').toBe(0);
    expect(answered((w) => void (w.nations.cols.aiOff[ROM] = 1)), 'its AI off').toBe(0);
  }, 480_000);

  it('the share it brings is the massing nation\'s own, MASS_SHARE of its formations', () => {
    const s = quiet();
    const w = s.world;
    const f = w.formations.cols;
    massed(s);
    const points = massPoints(w, ROM, SOV);
    const comp = navOf(w).grid.component;
    const lands = new Set(points.map((p) => comp[p]!));
    let [all, there] = [0, 0];
    w.formations.forEach((id) => {
      if (f.nation[id] !== ROM || w.isFleet(id) || w.isWing(id) || w.embarked.has(id)) return;
      if (!lands.has(comp[Math.floor(f.y[id]!) * W + Math.floor(f.x[id]!)]!)) return;
      all++;
      if (points.some((p) => Math.hypot((p % W) + 0.5 - f.x[id]!, Math.floor(p / W) + 0.5 - f.y[id]!) <= MASS_NEAR_CELLS) || (f.moving[id] === 1 && points.includes(f.targetCell[id]!))) there++;
    });
    expect(all).toBeGreaterThan(5);
    // No more than its share is ordered: the rest stay where they stood.
    expect(there).toBeLessThanOrEqual(Math.ceil(MASS_SHARE * all) + 1);
    expect(there).toBeGreaterThanOrEqual(Math.floor(MASS_SHARE * all) - 2);
  }, 240_000);

  // ROADMAP R122 (ADR-1107; critic run 73, R73-N2: "a massing is told nowhere"): once a massing, when it is seen.
  it('a massing seen is told of once, in the ticker and History, and not again after a load', () => {
    const s = quiet();
    const w = s.world;
    expect(beginMassing(w, SOV, ROM, 0)).toBe(true);
    const told: number[] = [];
    // ROADMAP R129 (critic run 74, R74-N2): told and given up, it is called off in a row of its own.
    const off: number[] = [];
    const read = (): void => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.MassingSeen) told.push(ev[i]! / 24, ev[i + 2]!, ev[i + 3]!);
        if (ev[i + 1] === EventKind.MassingCalledOff) off.push(ev[i + 2]!, ev[i + 3]!);
      }
      ev.length = 0;
    };
    let seenOn = -1;
    for (let d = 0; d < 20 && w.massing.has(SOV); d++) {
      if (seenOn < 0 && shareAt(w, SOV, ROM) >= MASS_SEEN) seenOn = d;
      massStep(w, w.tick / 24, () => false);
      read();
      if (d === 12) {
        // A save between: the massing told of is not told again.
        const u = quiet();
        u.load(s.save());
        expect([...u.world.massTold]).toEqual([SOV]);
        massStep(u.world, u.world.tick / 24, () => false);
        expect(u.world.out.events.filter((_, i) => i % 6 === 1).includes(EventKind.MassingSeen)).toBe(false);
      }
      s.step(24, read);
    }
    expect(seenOn).toBeGreaterThan(2);
    expect(told).toEqual([seenOn, SOV, ROM]);
    const rows = historyRows(w, (n) => `nation.${n === SOV ? 'SOV' : n === ROM ? 'ROM' : ''}`, () => '', () => '').filter((r) => r.kind === EventKind.MassingSeen);
    expect(rows).toHaveLength(1);
    expect(historyText(rows[0]!)).toBe('Soviet Union is massing its army on the border of Romania');
    expect(TICKER_KINDS.has(EventKind.MassingSeen)).toBe(true);
    // Over (given up here: the war it would declare is not declared): forgotten.
    for (let d = 0; d < 60 && w.massing.has(SOV); d++) {
      massStep(w, w.tick / 24, () => false);
      s.step(24, read);
    }
    massStep(w, w.tick / 24, () => false);
    read();
    expect(w.massTold.size).toBe(0);
    expect(w.massing.has(SOV)).toBe(false);
    expect(off).toEqual([SOV, ROM]);
    const called = historyRows(w, (n) => `nation.${n === SOV ? 'SOV' : n === ROM ? 'ROM' : ''}`, () => '', () => '').filter((r) => r.kind === EventKind.MassingCalledOff);
    expect(called).toHaveLength(1);
    expect(historyText(called[0]!)).toBe('Soviet Union has called off its massing on the border of Romania');
    expect(TICKER_KINDS.has(EventKind.MassingCalledOff)).toBe(true);
  }, 240_000);
});
