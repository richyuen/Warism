import { describe, expect, it } from 'vitest';
import { MASS_BAR_DAYS, MASS_DAYS, MASS_NEAR_CELLS, MASS_PROBE, MASS_READY, MASS_SECOND, beginMassing, massPoints, massStep, unprepared } from '../../src/sim/ai/massing';
import { homeNeighbours, neighbourMap, outnumbered, PILE_PROBE, stillDeclares } from '../../src/sim/ai/strategic';
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

  // ROADMAP R123 (ADR-1106, the user's decision; critic run 73, R73-N3): barred from its one neighbour a nation had no
  // war at all. With no other neighbour its massing past its days is a declaration, if it still would declare.
  it('a massing past its days of a nation with no other neighbour is a war, not a bar', () => {
    const late = (alone: boolean, still: boolean): World => {
      const w = quiet(1).world;
      w.massing.set(GER, { target: POL, since: 0 });
      massStep(w, MASS_DAYS + 1, () => still, () => alone);
      expect(w.massing.has(GER)).toBe(false);
      return w;
    };
    const war = late(true, true);
    expect(war.wars.atWar(GER, POL)).toBe(true);
    expect(war.massBarred.size).toBe(0);
    // With another neighbour to turn to, as before: barred for a year, no war.
    const barred = late(false, true);
    expect(barred.wars.atWar(GER, POL)).toBe(false);
    expect(barred.massBarred.get(GER * 65536 + POL)).toBe(MASS_DAYS + 1 + MASS_BAR_DAYS);
    // Alone, and it would no longer declare (its gold, the blocs): barred too.
    const unwilling = late(true, false);
    expect(unwilling.wars.atWar(GER, POL)).toBe(false);
    expect(unwilling.massBarred.size).toBe(1);
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

  it('a nation at war declares a second war only where MASS_SECOND of its men stand at that border', () => {
    const w = quiet(1).world;
    const neighbours = [...neighbourMap(w).get(GER)!].filter((t) => massPoints(w, GER, t).length > 0).sort((a, b) => a - b);
    expect(neighbours.length).toBeGreaterThan(3);
    // At peace none is refused for it.
    expect(unprepared(w, GER, neighbours, 0, 0).size).toBe(0);
    const never = unprepared(w, GER, neighbours, 0, 1);
    for (const t of neighbours) {
      const [near, all] = atBorder(w, GER, t);
      expect(never.has(t), `neighbour ${t}: ${near} of ${all} men at its border`).toBe(near < MASS_SECOND * all);
    }
    // Germany's army as 1938 begins: at some borders and not at others.
    expect(never.size).toBeGreaterThan(0);
    expect(never.size).toBeLessThan(neighbours.length);
    // A neighbour by a colony only is the landings', whatever stands there.
    expect(unprepared(w, GER, neighbours, 0, 1, () => false).size).toBe(0);
  });

  it('a neighbour by a colony only is declared on at once: Britain and the Netherlands, on Borneo', () => {
    const w = quiet(1).world;
    const [ENG, NED] = ['ENG', 'NED'].map(nationId) as [number, number];
    expect(massPoints(w, ENG, NED).length).toBeGreaterThan(0);
    const home = homeNeighbours(w, ENG);
    expect(home !== null && !home.has(NED)).toBe(true);
    expect(beginMassing(w, ENG, NED, 0, false)).toBe(false);
    expect(w.massing.size).toBe(0);
  });

  it('the delayed declaration asks the rules of the choice again: gold, bankruptcy, the pile of realms', () => {
    const w = quiet(1).world;
    const nc = w.nations.cols;
    const none = new Set<number>();
    expect(stillDeclares(w, GER, CZS, none)).toBe(!outnumbered(w, GER, CZS));
    expect(stillDeclares(w, GER, POL, none)).toBe(!outnumbered(w, GER, POL));
    PILE_PROBE.off = true;
    try {
      expect(stillDeclares(w, GER, POL, none)).toBe(true);
      const gold = nc.gold[GER]!;
      nc.gold[GER] = -1;
      expect(stillDeclares(w, GER, POL, none)).toBe(false);
      nc.gold[GER] = gold;
      nc.bankrupt[GER] = 1;
      expect(stillDeclares(w, GER, POL, none)).toBe(false);
      nc.bankrupt[GER] = 0;
      expect(stillDeclares(w, GER, POL, none)).toBe(true);
    } finally {
      delete PILE_PROBE.off;
    }
  });

  it("the strategic AI's own war (seed 99): prepared, then declared with its army at the border", () => {
    const s = new Sim({ scenario: '1938', seed: 99, assets: assets1938(W) });
    const w = s.world;
    let prepared: { n: number; t: number; share: number } | null = null;
    let begun = 0;
    for (let d = 0; d < 120 && !prepared; d++) {
      const was = new Map([...w.massing].map(([n, m]) => [n, m.target]));
      s.step(24, (x) => {
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
      for (const [n] of w.massing) if (!was.has(n)) begun++;
      // No nation that prepares a war chose it while at war.
      for (const [n, t] of was) {
        if (w.massing.has(n) || !w.wars.atWar(n, t) || massPoints(w, n, t).length === 0) continue;
        const [near, all] = atBorder(w, n, t);
        prepared = { n, t, share: near / all };
      }
    }
    expect(begun, 'massings begun in 120 days').toBeGreaterThan(0);
    expect(prepared, 'a war declared from a massing in 120 days').not.toBeNull();
    // A day of the war has passed since the declaration at MASS_READY: its army is still there.
    expect(prepared!.share).toBeGreaterThan(MASS_READY - 0.1);
  }, 240_000);
});
