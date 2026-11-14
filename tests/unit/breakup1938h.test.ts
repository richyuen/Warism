import { describe, expect, it } from 'vitest';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { validateFile } from '../../src/sim/data/schemas';
import { unproject } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R80c (ADR-1046; ADR-1031's answer 2, the user's): a great power's breakup and two unions. Test timelines on
// 1938h's start, as the 1990-91 events will be (R80i): a nation born from the Soviet Union with `forces` (TCY, a
// dormant tag, standing in for Ukraine until R80d adds it) on a box of Ukraine and the Crimea takes the Soviet land
// formations there, the Black Sea fleets (their nearest port Sevastopol) and the wings at Kiev's airbase; the Soviet
// warheads stay Soviet. Without `forces`, a birth as before: the forces stay. The unions by the existing `annex`: West
// Germany takes East Germany's land and forces (both born from the Reich first), North Yemen South Yemen's; the
// annexed is dead and no formation of a dead nation is left.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const UKRAINE: [number, number][] = [[22, 44], [40, 44], [40, 52.3], [22, 52.3]];
const lonLat = (w: World, i: number): [number, number] => unproject(w.formations.cols.x[i]! / w.cells.w, w.formations.cols.y[i]! / w.cells.h) as [number, number];
const inBox = ([lon, lat]: [number, number]): boolean => lon > 22 && lon < 40 && lat > 44 && lat < 52.3;

function run(timeline: TimelineFile, after?: (w: World) => void): World {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);
  const quiet = (w: World): void => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  };
  sim.step(24, quiet);
  after?.(sim.world);
  while (!sim.world.track!.ended) sim.step(1, quiet);
  return sim.world;
}

const born = (forces: boolean): TimelineFile => ({
  end: '1938-01-03',
  events: [{ date: '1938-01-02', kind: 'born', nation: 'TCY', from: ['SOV'], ring: UKRAINE, ...(forces ? { forces: true } : {}) }],
});

describe('a breakup and two unions (ROADMAP R80c)', () => {
  it('the events are valid in a timeline', () => {
    expect(validateFile('scenarios/1938h/timeline.json', born(true))).toEqual([]);
  });

  it("a nation born with `forces` takes the giver's army, navy and air on its land; the warheads stay", () => {
    const SOV = id('SOV');
    let before: { land: number[]; fleets: number[]; wings: number[] } = { land: [], fleets: [], wings: [] };
    const w = run(born(true), (w) => {
      w.warheads.set(SOV, { stock: 50, paid: 0 });
      const f = w.formations.cols;
      const land: number[] = [];
      const fleets: number[] = [];
      const wings: number[] = [];
      w.formations.forEach((i) => {
        if (f.nation[i] !== SOV || w.heroes.has(i)) return;
        if (w.isWing(i)) {
          const b = w.wingBase.get(i) ?? 0;
          if (b > 0 && inBox(unproject((w.airbases[b - 1]!.cell % w.cells.w + 0.5) / w.cells.w, (Math.floor(w.airbases[b - 1]!.cell / w.cells.w) + 0.5) / w.cells.h) as [number, number])) wings.push(i);
        } else if (w.isFleet(i)) {
          const [lon, lat] = lonLat(w, i);
          if (lon > 30 && lon < 40 && lat > 43 && lat < 47) fleets.push(i);
        } else if (!w.offLand(i) && inBox(lonLat(w, i))) land.push(i);
      });
      before = { land, fleets, wings };
    });
    const T = id('TCY');
    const f = w.formations.cols;
    expect(w.nations.cols.living[T]).toBe(1);
    expect(before.land.length).toBeGreaterThan(10);
    expect(before.fleets.length).toBeGreaterThanOrEqual(4);
    expect(before.wings.length).toBeGreaterThanOrEqual(3);
    // Every one of them now the new nation's (a land formation on land the box gave it).
    const own = (i: number): boolean => f.nation[i] === T;
    expect(before.fleets.filter(own)).toEqual(before.fleets);
    expect(before.wings.filter(own)).toEqual(before.wings);
    const onItsLand = before.land.filter((i) => w.cells.owner[Math.floor(f.y[i]!) * w.cells.w + Math.floor(f.x[i]!)] === T);
    expect(onItsLand.length).toBeGreaterThan(10);
    expect(onItsLand.filter(own)).toEqual(onItsLand);
    // None of the Soviet Union's elsewhere moved: its Baltic and Pacific fleets and Moscow's wings stay.
    let sovFleets = 0;
    w.formations.forEach((i) => {
      if (f.nation[i] === SOV && w.isFleet(i)) sovFleets++;
      if (f.nation[i] === T) expect(w.cells.owner[Math.floor(f.y[i]!) * w.cells.w + Math.floor(f.x[i]!)] === T || w.offLand(i), `formation ${i} of the new nation off its land`).toBe(true);
    });
    expect(sovFleets).toBeGreaterThanOrEqual(5);
    // The arsenal: the Soviet Union's alone.
    expect(w.warheads.get(SOV)?.stock).toBe(50);
    expect(w.warheads.has(T)).toBe(false);
  });

  it('without `forces` a birth leaves the forces where they were', () => {
    const w = run(born(false));
    const T = id('TCY');
    let mine = 0;
    w.formations.forEach((i) => {
      if (w.formations.cols.nation[i] === T) mine++;
    });
    expect(w.nations.cols.living[T]).toBe(1);
    expect(mine).toBe(0);
  });

  it("the unions: the annexed dead, its land and forces the annexer's, no formation of a dead nation", () => {
    const w = run({
      end: '1938-01-03',
      events: [
        { date: '1938-01-02', kind: 'born', nation: 'FRG', from: ['GER'], ring: [[5.8, 47.2], [10.6, 47.2], [10.6, 55.2], [5.8, 55.2]], forces: true },
        { date: '1938-01-02', kind: 'born', nation: 'GDR', from: ['GER'], ring: [[10.6, 50.1], [15.2, 50.1], [15.2, 54.8], [10.6, 54.8]], forces: true },
        { date: '1938-01-02', kind: 'born', nation: 'SYE', from: ['ENG'], ring: [[43.5, 12], [53, 12], [53, 17.5], [43.5, 17.5]], forces: true },
        { date: '1938-01-02', hour: 2, kind: 'annex', annexer: 'FRG', target: 'GDR' },
        { date: '1938-01-02', hour: 2, kind: 'annex', annexer: 'YEM', target: 'SYE' },
      ],
    });
    const nc = w.nations.cols;
    for (const [a, t] of [['FRG', 'GDR'], ['YEM', 'SYE']] as const) {
      expect(nc.living[id(a)], a).toBe(1);
      expect(nc.living[id(t)], t).toBe(0);
      expect(w.cells.owner.includes(id(t)), `${t} owns land`).toBe(false);
    }
    // East Germany's land: West Germany's (Berlin's cell).
    const [bx, by] = [13.4, 52.5];
    let berlin = -1;
    w.cities.forEach((ci) => {
      const [lon, lat] = unproject(w.cities.cols.x[ci]! / w.cells.w, w.cities.cols.y[ci]! / w.cells.h);
      if (berlin < 0 && Math.abs(lon - bx) < 0.4 && Math.abs(lat - by) < 0.3) berlin = w.cities.cols.cell[ci]!;
    });
    expect(berlin).toBeGreaterThanOrEqual(0);
    expect(w.cells.owner[berlin]).toBe(id('FRG'));
    let frg = 0;
    w.formations.forEach((i) => {
      const n = w.formations.cols.nation[i]!;
      expect(nc.living[n], `formation ${i} of ${TAGS_1938H[n - 1]}, dead`).toBe(1);
      if (n === id('FRG') && inGermanyEast(lonLat(w, i))) frg++;
    });
    // The Reich's formations in the east, handed to East Germany at its birth, are West Germany's now.
    expect(frg).toBeGreaterThan(0);
  });
});

function inGermanyEast([lon, lat]: [number, number]): boolean {
  return lon > 10.6 && lon < 15.2 && lat > 50.1 && lat < 54.8;
}
