import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62f (SPEC §7.7 "historical arrivals of forces and phase buffs"): a `buff` granted on its hour until its
// date; `forces` set down on their hour; a war's and a join's `without` leave those puppets neutral.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const TL: TimelineFile = {
  events: [
    { date: '1938-01-02', kind: 'buff', nation: 'GER', buff: 'attack', magnitude: 0.3, until: '1938-01-05' },
    { date: '1938-01-02', hour: 3, kind: 'forces', nation: 'GER', template: 'infantry_div', count: 3, at: [13.4, 52.5] },
    { date: '1938-01-03', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
    { date: '1938-01-03', hour: 1, kind: 'join', nation: 'ENG', beside: 'POL', against: 'GER', without: ['IRE', 'EGY'] },
  ],
};

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe("the historical track's levers (ROADMAP R62f)", () => {
  it('a buff on its hour until its date; forces set down on theirs; a join without the puppets it names', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TL);
    const w = sim.world;
    const GER = id('GER');
    sim.step(24, quiet);
    expect(w.buffs.sum('attack', 'nation', GER)).toBe(0);
    let skipped = 0;
    const count = (): number => {
      let n = 0;
      w.formations.forEach((f) => {
        if (w.formations.cols.nation[f] === GER) n++;
      });
      return n;
    };
    const before = count();
    sim.step(1, quiet);
    expect(w.buffs.sum('attack', 'nation', GER)).toBeCloseTo(0.3, 12);
    sim.step(3, quiet);
    expect(count()).toBe(before + 3);
    sim.step(48, (x) => {
      for (let i = 0; i < x.out.events.length; i += 6) if (x.out.events[i + 1] === EventKind.TrackSkipped) skipped++;
      quiet(x);
    });
    expect(skipped).toBe(0);
    const war = w.wars.between(GER, id('POL'))!.war;
    expect(war.sides[1]).toContain(id('ENG'));
    expect(war.sides[1]).toContain(id('AST'));
    expect(war.sides[1]).not.toContain(id('IRE'));
    expect(war.sides[1]).not.toContain(id('EGY'));
    // Its date: the buff is over.
    while (sim.tick <= 4 * 24) sim.step(1, quiet);
    expect(w.buffs.sum('attack', 'nation', GER)).toBe(0);
  });
});

describe("the historical track's hold (ROADMAP R62f2)", () => {
  it("a front held from its hour until its date, both ways, between its sides and their puppets only", () => {
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
        { date: '1938-01-02', hour: 1, kind: 'hold', sides: [['GER'], ['POL', 'ENG']], until: '1938-01-04' },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const [GER, POL, FRA] = [id('GER'), id('POL'), id('FRA')];
    sim.step(25, quiet);
    expect(w.holds(GER, POL)).toBe(false);
    sim.step(1, quiet);
    expect(w.holds(GER, POL)).toBe(true);
    expect(w.holds(POL, GER)).toBe(true);
    expect(w.holds(GER, FRA)).toBe(false);
    // A side's puppets with it (R62g0): Australia beside Britain.
    expect(w.holds(id('AST'), GER)).toBe(true);
    expect(w.holds(id('AST'), POL)).toBe(false);
    while (sim.tick < 3 * 24) sim.step(1, quiet);
    expect(w.holds(GER, POL)).toBe(false);
    expect(w.wars.atWar(GER, POL)).toBe(true);
  });
});

describe('a hold mid-run (ROADMAP R62g0)', () => {
  const tl: TimelineFile = {
    events: [
      { date: '1938-01-02', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
      { date: '1938-01-06', kind: 'hold', sides: [['GER'], ['POL']], until: '1938-01-09' },
    ],
  };
  const make = (): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
  /** Formations of Germany and Poland in combat this hour. */
  const engaged = (w: World): number => {
    let n = 0;
    const f = w.formations.cols;
    w.formations.forEach((i) => {
      if ((f.nation[i] === id('GER') || f.nation[i] === id('POL')) && f.engaged[i] === 1) n++;
    });
    return n;
  };
  const most = (sim: Sim, to: number): number => {
    let top = 0;
    while (sim.tick < to) {
      sim.step(1, quiet);
      top = Math.max(top, engaged(sim.world));
    }
    return top;
  };

  it('the fighting stops on its hour and resumes on its date; a save mid-hold replays the same', () => {
    const a = make();
    expect(most(a, 5 * 24)).toBeGreaterThan(0);
    // The hold's hour (tick 120): its fighting is over within it, then none to its date (tick 192).
    most(a, 5 * 24 + 1);
    expect(most(a, 6 * 24)).toBe(0);
    const bytes = a.save();
    const b = make();
    b.load(bytes);
    expect(most(a, 8 * 24)).toBe(0);
    expect(most(a, 10 * 24)).toBeGreaterThan(0);
    most(b, 10 * 24);
    expect(b.hash()).toBe(a.hash());
  });
});

describe('an armistice: leave (ROADMAP R62g1)', () => {
  it('nations leave the wars against a foe with their puppets; the war goes on without them', () => {
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
        { date: '1938-01-02', hour: 1, kind: 'join', nation: 'FRA', beside: 'POL', against: 'GER' },
        { date: '1938-01-03', kind: 'leave', nations: ['FRA'], against: 'GER' },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const [GER, POL, FRA, TUN] = [id('GER'), id('POL'), id('FRA'), id('TUN')];
    sim.step(26, quiet);
    expect(w.wars.atWar(FRA, GER)).toBe(true);
    expect(w.wars.atWar(TUN, GER)).toBe(true);
    sim.step(24, quiet);
    expect(w.wars.atWar(FRA, GER)).toBe(false);
    expect(w.wars.atWar(TUN, GER)).toBe(false);
    expect(w.wars.atWar(POL, GER)).toBe(true);
  });
});

describe('a redeployment (ROADMAP R62g1)', () => {
  it("the share of a nation's land formations in the ring march by player's orders; none else", () => {
    const ring: [number, number][] = [[10.0, 55.0], [16.0, 55.0], [16.0, 50.0], [10.0, 50.0]];
    const tl: TimelineFile = { events: [{ date: '1938-01-02', kind: 'redeploy', nation: 'GER', from: ring, to: [[7.0, 50.4]], share: 0.5 }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    sim.step(24, quiet);
    const ordered = (): number => [...w.playerOrders.keys()].filter((i) => w.formations.cols.nation[i] === id('GER')).length;
    expect(ordered()).toBe(0);
    sim.step(1, quiet);
    expect(ordered()).toBeGreaterThan(0);
    for (const i of w.playerOrders.keys()) expect(w.formations.cols.nation[i]).toBe(id('GER'));
  });
});

describe('an evacuation, a revival, land taken back (ROADMAP R62g2)', () => {
  it("withdraw sets a nation's land formations in the ring down on its land outside it (R66c); born brings back a dead nation; occupy by an owner takes its land back", () => {
    const ring: [number, number][] = [[10.0, 55.0], [16.0, 55.0], [16.0, 50.0], [10.0, 50.0]];
    const tl: TimelineFile = {
      events: [
        // Held off from Poland, on the ring's eastern edge (R66c: else an evacuation, as before).
        { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
        { date: '1938-01-01', kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' },
        { date: '1938-01-02', kind: 'withdraw', nation: 'GER', ring },
        { date: '1938-01-03', kind: 'occupy', by: 'POL', of: ['GER'], ring },
        { date: '1938-01-04', kind: 'occupy', by: 'GER', of: ['GER'], ring },
        { date: '1938-01-05', kind: 'born', nation: 'ETH', from: ['ITA'], ring: [[36.0, 12.0], [42.0, 12.0], [42.0, 6.0], [36.0, 6.0]] },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const GER = id('GER');
    const inRing = (): number => {
      let n = 0;
      w.formations.forEach((i) => {
        const f = w.formations.cols;
        if (f.nation[i] === GER && w.rules?.templates[f.template[i]!]?.domain === 0) {
          const [u0, v0] = project(10, 55);
          const [u1, v1] = project(16, 50);
          // By its cell's centre, as the ring takes a cell (R66c: one set down on the row past the ring's edge is out).
          const [x, y] = [Math.floor(f.x[i]!) + 0.5, Math.floor(f.y[i]!) + 0.5];
          if (x >= u0 * w.cells.w && x <= u1 * w.cells.w && y >= v0 * w.cells.h && y <= v1 * w.cells.h) n++;
        }
      });
      return n;
    };
    const land = (): number => {
      let n = 0;
      w.formations.forEach((i) => {
        if (w.formations.cols.nation[i] === GER && w.rules?.templates[w.formations.cols.template[i]!]?.domain === 0) n++;
      });
      return n;
    };
    sim.step(24, quiet);
    expect(w.holds(GER, id('POL'))).toBe(true);
    expect(inRing()).toBeGreaterThan(0);
    const pool = w.nations.cols.manpower[GER]!;
    const all = land();
    sim.step(1, quiet);
    // Out of the ring, on German land, every one of them: none sent home to the pool (R66c, ADR-968).
    expect(inRing()).toBe(0);
    expect(land()).toBe(all);
    expect(w.nations.cols.manpower[GER]!).toBe(pool);
    w.formations.forEach((i) => {
      const f = w.formations.cols;
      if (f.nation[i] === GER && w.rules?.templates[f.template[i]!]?.domain === 0 && !w.embarked.has(i)) expect(w.cells.controller[Math.floor(f.y[i]!) * w.cells.w + Math.floor(f.x[i]!)]).toBe(GER);
    });
    const [bu, bv] = project(13.4, 52.5);
    const berlin = Math.floor(bv * w.cells.h) * w.cells.w + Math.floor(bu * w.cells.w);
    sim.step(24, quiet);
    expect(w.cells.controller[berlin]).toBe(id('POL'));
    sim.step(24, quiet);
    expect(w.cells.controller[berlin]).toBe(GER);
    expect(w.nations.cols.living[id('ETH')]).toBe(0);
    sim.step(24, quiet);
    expect(w.nations.cols.living[id('ETH')]).toBe(1);
  });
});

describe('an evacuation; an occupation behind its line (ROADMAP R66c)', () => {
  const landOf = (w: World, n: number): number[] => {
    const out: number[] = [];
    w.formations.forEach((i) => {
      if (w.formations.cols.nation[i] === n && w.rules?.templates[w.formations.cols.template[i]!]?.domain === 0 && !w.embarked.has(i)) out.push(i);
    });
    return out;
  };
  const cellOf = (w: World, i: number): number => Math.floor(w.formations.cols.y[i]!) * w.cells.w + Math.floor(w.formations.cols.x[i]!);

  it('withdraw with no hold: home to the pool, as before R66c', () => {
    // All of Great Britain, at peace.
    const ring: [number, number][] = [[-6.4, 59.0], [2.0, 59.0], [2.0, 49.8], [-6.4, 49.8]];
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, { events: [{ date: '1938-01-02', kind: 'withdraw', nation: 'ENG', ring }] });
    const w = sim.world;
    const ENG = id('ENG');
    const [u0, v0] = project(-6.4, 59.0);
    const [u1, v1] = project(2.0, 49.8);
    const inside = (): number[] => landOf(w, ENG).filter((i) => w.formations.cols.x[i]! >= u0 * w.cells.w && w.formations.cols.x[i]! <= u1 * w.cells.w && w.formations.cols.y[i]! >= v0 * w.cells.h && w.formations.cols.y[i]! <= v1 * w.cells.h);
    sim.step(24, quiet);
    expect(inside().length).toBeGreaterThan(0);
    const pool = w.nations.cols.manpower[ENG]!;
    sim.step(1, quiet);
    expect(inside()).toEqual([]);
    expect(w.nations.cols.manpower[ENG]!).toBeGreaterThan(pool);
  });

  it('withdraw held, with none of its own land beyond the ring within reach over land: home to the pool', () => {
    // Italy out of Libya, held off from France (Tunisia beside it): Italy's other land is over the sea or far.
    const ring: [number, number][] = [[9.0, 33.5], [25.5, 33.5], [25.5, 19.0], [9.0, 19.0]];
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-01', kind: 'war', attackers: ['ITA'], defenders: ['FRA'] },
        { date: '1938-01-01', kind: 'hold', sides: [['ITA'], ['FRA']], until: '1939-01-01' },
        { date: '1938-01-02', kind: 'withdraw', nation: 'ITA', ring },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const ITA = id('ITA');
    const [u0, v0] = project(9.0, 33.5);
    const [u1, v1] = project(25.5, 19.0);
    const inside = (): number[] => landOf(w, ITA).filter((i) => w.formations.cols.x[i]! >= u0 * w.cells.w && w.formations.cols.x[i]! <= u1 * w.cells.w && w.formations.cols.y[i]! >= v0 * w.cells.h && w.formations.cols.y[i]! <= v1 * w.cells.h);
    sim.step(24, quiet);
    expect(w.holds(ITA, id('FRA'))).toBe(true);
    expect(inside().length).toBeGreaterThan(0);
    const pool = w.nations.cols.manpower[ITA]!;
    sim.step(1, quiet);
    expect(inside()).toEqual([]);
    expect(w.nations.cols.manpower[ITA]!).toBeGreaterThan(pool);
  });

  it("occupy: the formations of those who held the land taken are set down on their own land behind the new line, not left on it", () => {
    // Western Poland taken by Germany: the Polish formations there end on Polish land, as many as before.
    const ring: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, {
      events: [
        { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
        { date: '1938-01-01', kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' },
        { date: '1938-01-02', kind: 'occupy', by: 'GER', of: ['POL'], ring },
      ],
    });
    const w = sim.world;
    const POL = id('POL');
    sim.step(24, quiet);
    expect(w.holds(POL, id('GER'))).toBe(true);
    const before = landOf(w, POL);
    const [u0, v0] = project(14.0, 54.5);
    const [u1, v1] = project(19.0, 50.0);
    const there = before.filter((i) => w.formations.cols.x[i]! >= u0 * w.cells.w && w.formations.cols.x[i]! <= u1 * w.cells.w && w.formations.cols.y[i]! >= v0 * w.cells.h && w.formations.cols.y[i]! <= v1 * w.cells.h && w.cells.owner[cellOf(w, i)] === POL);
    expect(there.length).toBeGreaterThan(0);
    sim.step(1, quiet);
    expect(landOf(w, POL).length).toBe(before.length);
    for (const i of there) expect(w.cells.controller[cellOf(w, i)], `formation ${i}`).toBe(POL);
  });
});

describe('a pocket (ROADMAP R62g3)', () => {
  it('withdraw captured: the formations in the ring are gone and their men with them', () => {
    const ring: [number, number][] = [[10.0, 55.0], [16.0, 55.0], [16.0, 50.0], [10.0, 50.0]];
    const tl: TimelineFile = { events: [{ date: '1938-01-02', kind: 'withdraw', nation: 'GER', ring, captured: true }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const GER = id('GER');
    const land = (): number => {
      let n = 0;
      w.formations.forEach((i) => {
        if (w.formations.cols.nation[i] === GER && w.rules?.templates[w.formations.cols.template[i]!]?.domain === 0) n++;
      });
      return n;
    };
    sim.step(24, quiet);
    const [before, pool] = [land(), w.nations.cols.manpower[GER]!];
    sim.step(1, quiet);
    expect(land()).toBeLessThan(before);
    expect(w.nations.cols.manpower[GER]!).toBeLessThanOrEqual(pool + 1);
  });
});

describe('a scripted strike (ROADMAP R62h3)', () => {
  it('nuke: a fission warhead of the nation bursts at its place on its hour, no launch and no stockpile asked', () => {
    const TLN: TimelineFile = { events: [{ date: '1938-01-02', hour: 5, kind: 'nuke', nation: 'USA', at: [132.46, 34.39] }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TLN);
    const w = sim.world;
    const [u, v] = project(132.46, 34.39);
    const bursts: number[][] = [];
    let launches = 0;
    sim.step(24 + 6, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.NukeDetonated) bursts.push([ev[i]!, ev[i + 2]!, ev[i + 3]!, ev[i + 4]!, ev[i + 5]!]);
        if (ev[i + 1] === EventKind.NukeLaunched) launches++;
      }
      quiet(x);
    });
    expect(bursts).toEqual([[24 + 5, id('USA'), 1, u * w.cells.w, v * w.cells.h]]);
    expect(launches).toBe(0);
    expect(w.warheads.get(id('USA'))?.stock ?? 0).toBe(0);
  });
});

describe('a surrender (ROADMAP R62i0)', () => {
  it("withdraw with fleets: the nation's ships and air wings go wherever they are, its land formations only in the ring", () => {
    const BERLIN: [number, number][] = [[12.5, 53.2], [14.5, 53.2], [14.5, 51.8], [12.5, 51.8]];
    const TLF: TimelineFile = { events: [{ date: '1938-01-02', kind: 'withdraw', nation: 'GER', ring: BERLIN, captured: true, fleets: true }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TLF);
    const w = sim.world;
    const GER = id('GER');
    const count = (): [number, number] => {
      let land = 0;
      let other = 0;
      w.formations.forEach((i) => {
        if (w.formations.cols.nation[i] !== GER) return;
        if (w.rules?.templates[w.formations.cols.template[i]!]?.domain === 0) land++;
        else other++;
      });
      return [land, other];
    };
    sim.step(24, quiet);
    const [land0, other0] = count();
    expect(other0).toBeGreaterThan(0);
    sim.step(1, quiet);
    const [land1, other1] = count();
    expect(other1).toBe(0);
    expect(land1).toBeLessThan(land0);
    expect(land1).toBeGreaterThan(0);
  });
});

describe('a guarantee withdrawn (ROADMAP R62i2)', () => {
  it("guarantee with end: the scenario's pledge is gone on its hour; one not given is passed over", () => {
    const TLG: TimelineFile = {
      events: [
        { date: '1938-01-03', kind: 'guarantee', guarantor: 'SOV', target: 'CHI', end: true },
        { date: '1938-01-04', kind: 'guarantee', guarantor: 'SOV', target: 'CHI', end: true },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TLG);
    const w = sim.world;
    const pledged = (): boolean => w.alliances.guarantees.some((g) => g.guarantor === id('SOV') && g.target === id('CHI'));
    let skipped = 0;
    const step = (h: number): void =>
      sim.step(h, (x) => {
        for (let i = 0; i < x.out.events.length; i += 6) if (x.out.events[i + 1] === EventKind.TrackSkipped) skipped++;
        quiet(x);
      });
    step(25);
    expect(pledged()).toBe(true);
    step(24);
    expect(pledged()).toBe(false);
    expect(skipped).toBe(0);
    step(24);
    expect(skipped).toBe(1);
  });
});

describe('a seat moved (ROADMAP R62i2)', () => {
  it("capital: the nation's own city nearest the place is its one capital on the event's hour", () => {
    const TLC: TimelineFile = { events: [{ date: '1938-01-02', kind: 'capital', nation: 'CHI', at: [104.07, 30.67] }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TLC);
    const w = sim.world;
    const CHI = id('CHI');
    const seats = (): number[] => {
      const out: number[] = [];
      w.cities.forEach((ci) => {
        if (w.cities.cols.capitalOf[ci] === CHI) out.push(ci);
      });
      return out;
    };
    sim.step(24, quiet);
    const before = seats();
    expect(before.length).toBe(1);
    sim.step(1, quiet);
    const after = seats();
    expect(after.length).toBe(1);
    expect(after[0]).not.toBe(before[0]);
    const [u, v] = project(104.07, 30.67);
    expect(Math.abs(w.nations.cols.capitalX[CHI]! - u * w.cells.w)).toBeLessThan(4);
    expect(Math.abs(w.nations.cols.capitalY[CHI]! - v * w.cells.h)).toBeLessThan(4);
  });
});

describe('a new name and flag (ROADMAP R62i4)', () => {
  it('rename: the identity from its hour, kept in a save (the same hash after), and the worker names the nation by it', () => {
    const TLR: TimelineFile = { events: [{ date: '1938-01-02', kind: 'rename', nation: 'CCP', as: 'PRC' }] };
    const make = (): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TLR);
    const a = make();
    a.step(24, quiet);
    expect(a.world.identities.size).toBe(0);
    const names = a.world.namesVersion;
    const flags = a.world.flagsVersion;
    a.step(1, quiet);
    expect([...a.world.identities]).toEqual([[id('CCP'), 'PRC']]);
    expect(a.world.namesVersion).toBeGreaterThan(names);
    expect(a.world.flagsVersion).toBeGreaterThan(flags);
    const b = make();
    b.load(a.save());
    expect([...b.world.identities]).toEqual([[id('CCP'), 'PRC']]);
    a.step(24, quiet);
    b.step(24, quiet);
    expect(b.hash()).toBe(a.hash());
  });
});

describe('a frozen front (ROADMAP R66b, ADR-971)', () => {
  it("a hold on a war in progress is a frozen front; one whose war the timeline begins on its date is not", () => {
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
        { date: '1938-01-02', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' },
        { date: '1938-01-02', kind: 'war', attackers: ['ITA'], defenders: ['FRA'] },
        { date: '1938-01-03', kind: 'hold', sides: [['ITA'], ['FRA']], until: '1939-01-01' },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    sim.step(3 * 24, quiet);
    expect(w.holds(id('GER'), id('POL'))).toBe(true);
    expect(w.frozenFront(id('GER'), id('POL'))).toBe(false);
    expect(w.holds(id('ITA'), id('FRA'))).toBe(true);
    expect(w.frozenFront(id('ITA'), id('FRA'))).toBe(true);
    expect(w.frozenFront(id('GER'), id('FRA'))).toBe(false);
  });
});
