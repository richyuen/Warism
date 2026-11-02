import { describe, expect, it } from 'vitest';
import { HEROES_1938, NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { Refusal } from '../../src/shared/commands';
import { Domain, type World } from '../../src/sim/world';
import { isMonthStart } from '../../src/shared/calendar';
import { assets1938 } from '../helpers/earth';
import { elementIndex } from '../../src/sim/systems/elements';
import { HERO_RETURN_HOURS, heroHealth } from '../../src/sim/systems/heroes';
import { landFight, seaFight } from '../helpers/heroFight';
import { fleetPower } from '../../src/sim/systems/seaControl';
import { AT_PORT_CELLS } from '../../src/sim/systems/navalCombat';
import { orderSail } from '../../src/sim/systems/sail';
import { portSeaOf } from '../../src/sim/world';

// PLAN 7.184a1: heroes, a new-game option of the 1938 world. With it off the world is as before;
// on, 14 heroes at the start (sea at the water of its nation's first naval base, land at its
// capital), saved with the world, and never disbanded, laid up, folded or refilled by the AI.

const W = SIZE_1938.w;
const make = (heroes?: 'on' | 'off'): Sim => new Sim({ scenario: '1938', seed: 99, assets: assets1938(W), ...(heroes ? { options: { heroes } } : {}) });
const tagOf = (n: number): string => NATIONS_1938[n - 1]!.tag;
const heroIds = (w: World): number[] => [...w.heroes.keys()].sort((a, b) => a - b);

describe('heroes (PLAN 7.184a1)', () => {
  it('off: no hero, and the world is the one with no option', () => {
    const off = make('off');
    expect(off.world.heroes.size).toBe(0);
    expect(off.world.heroRoster.length).toBe(0);
    expect(off.hash()).toBe(make().hash());
  });

  it('on: 14 heroes at tick 0, sea at its port water, land at its capital; one each of land and sea for 7 nations', () => {
    const sim = make('on');
    const w = sim.world;
    const f = w.formations.cols;
    expect(w.heroRoster.length).toBe(14);
    expect(w.heroes.size).toBe(14);
    const seen = new Map<string, string[]>();
    for (const id of heroIds(w)) {
      const row = w.heroRoster[w.heroes.get(id)!]!;
      const def = HEROES_1938.find((h) => h.template === TEMPLATES_1938[row.template]!.id)!;
      expect(tagOf(f.nation[id]!), def.template).toBe(def.nation);
      expect(f.template[id]).toBe(row.template);
      expect(w.rules!.templates[row.template]!.hero, def.template).toBe(true);
      expect([f.x[id], f.y[id]]).toEqual([row.x, row.y]);
      // Whole: one element of one unit, its strength the template's men.
      expect(f.strength[id]!, def.template).toBeGreaterThan(0);
      seen.set(def.nation, [...(seen.get(def.nation) ?? []), def.domain]);
      if (def.domain === 'sea') {
        expect(w.isFleet(id), def.template).toBe(true);
        // At the water of its port, as the nation's fleets of the start that are based there.
        const port = w.ports.find((p) => p.name === def.port)!;
        expect(Math.hypot(f.x[id]! - port.x, f.y[id]! - port.y), `${def.template} from ${def.port}, cells`).toBeLessThan(6);
        expect(w.seaPoint(Math.floor(f.y[id]!) * w.cells.w + Math.floor(f.x[id]!)), `${def.template} on water`).not.toBeNull();
      } else {
        expect(w.rules!.templates[row.template]!.domain).toBe(Domain.land);
        const n = f.nation[id]!;
        const [cx, cy] = w.standPoint(w.nations.cols.capitalX[n]!, w.nations.cols.capitalY[n]!);
        expect(Math.hypot(f.x[id]! - cx, f.y[id]! - cy), `${def.template} at the capital`).toBeLessThan(0.01);
      }
    }
    expect([...seen.keys()].sort()).toEqual(['ENG', 'FRA', 'GER', 'ITA', 'JAP', 'SOV', 'USA']);
    for (const d of seen.values()) expect(d.sort()).toEqual(['land', 'sea']);
  });

  it('save and load keep the heroes, their rows and the hash', () => {
    const a = make('on');
    a.step(48);
    const b = make('off');
    b.load(a.save());
    expect(b.hash()).toBe(a.hash());
    expect([...b.world.heroes].sort((x, y) => x[0] - y[0])).toEqual([...a.world.heroes].sort((x, y) => x[0] - y[0]));
    expect(b.world.heroRoster).toEqual(a.world.heroRoster);
    // A world loaded from one with no heroes has none.
    b.load(make('off').save());
    expect(b.world.heroes.size).toBe(0);
    expect(b.world.heroRoster.length).toBe(0);
  });

  it('never built, queued or placed by God', () => {
    const sim = make('on');
    const hero = sim.world.rules!.templates.findIndex((t) => t.hero && t.domain === Domain.land);
    const sea = sim.world.rules!.templates.findIndex((t) => t.hero && t.domain === Domain.sea);
    const ger = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
    const refusals: number[] = [];
    const before = sim.world.formations.count;
    const queued = sim.world.production.count;
    const [x, y] = [sim.world.nations.cols.capitalX[ger]!, sim.world.nations.cols.capitalY[ger]!];
    sim.command({ kind: 'queueFormation', nation: ger, template: hero });
    sim.command({ kind: 'spawnFormation', nation: ger, x, y, strength: 0, template: hero });
    sim.command({ kind: 'spawnFleet', nation: ger, x, y, template: sea, free: true });
    sim.applyNow((w) => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.CommandRefused) refusals.push(ev[i + 3]!);
      ev.length = 0;
    });
    expect(sim.world.formations.count).toBe(before);
    expect(sim.world.production.count).toBe(queued);
    expect(refusals).toEqual([Refusal.NoSuch, Refusal.NoSuch, Refusal.NoSuch]);
  });

  it('a month of every nation 1,000 gold in debt disbands and lays up formations and fleets, but no hero', () => {
    const sim = make('on');
    const w = sim.world;
    const heroes = heroIds(w);
    w.nations.forEach((n) => {
      w.nations.cols.gold[n] = -1000;
    });
    let laid = 0;
    let cut = 0;
    const count = (x: World): void => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.FleetsLaidUp) laid += ev[i + 3]!;
        if (ev[i + 1] === EventKind.FormationsDisbanded) cut += ev[i + 3]!;
      }
      ev.length = 0;
      x.out.fires.length = 0;
    };
    // To the next month's start, then a day on: the economic AI's month is in it.
    sim.step(1, count);
    while (!isMonthStart(w.startDay, w.tick)) sim.step(1, count);
    sim.step(24, count);
    expect(laid, 'fleets laid up in the month').toBeGreaterThan(0);
    expect(cut, 'formations disbanded in the month').toBeGreaterThan(0);
    expect(heroIds(w)).toEqual(heroes);
    for (const id of heroes) expect(w.rules!.templates[w.formations.cols.template[id]!]!.hero).toBe(true);
  });
});

describe('heroes heal and come back (PLAN 7.184a2)', () => {
  const quiet = (x: World): void => {
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  const heroOf = (w: World, template: string): number => [...w.heroes].find(([, row]) => TEMPLATES_1938[w.heroRoster[row]!.template]!.id === template)?.[0] ?? 0;
  const rowOf = (w: World, template: string): number => w.heroRoster.findIndex((r) => TEMPLATES_1938[r.template]!.id === template);
  const hurt = (w: World, id: number, wound: number): void => {
    w.elements.cols.wound[elementIndex(w).get(id)![0]!] = wound;
  };

  it('a hero at half its health, out of battle, heals 5 % a day: whole in 10 days, and still whole at 20', () => {
    const sim = make('on');
    const w = sim.world;
    w.settings.aiEnabled = false;
    const hood = heroOf(w, 'hero_hood');
    hurt(w, hood, 0.5);
    expect(heroHealth(w, hood)).toBe(0.5);
    sim.step(24 * 5, quiet);
    expect(w.formations.cols.engaged[hood]).toBe(0);
    expect(heroHealth(w, hood)).toBeCloseTo(0.75, 9);
    sim.step(24 * 15, quiet);
    expect(heroHealth(w, hood)).toBe(1);
  });

  it('destroyed, a hero is back whole at its start 60 days later to the tick; save and load keep the day', () => {
    const sim = make('on');
    const w = sim.world;
    const maus = heroOf(w, 'hero_maus');
    const row = rowOf(w, 'hero_maus');
    hurt(w, maus, 0.3);
    sim.command({ kind: 'removeFormation', id: maus });
    sim.step(1, quiet);
    expect(heroOf(w, 'hero_maus')).toBe(0);
    const due = w.heroReturn.get(row)!;
    expect(due).toBe(w.tick - 1 + HERO_RETURN_HOURS);
    // A copy by save and load comes back at the same tick.
    const copy = make('off');
    copy.load(sim.save());
    expect(copy.world.heroReturn).toEqual(w.heroReturn);
    while (w.tick < due) sim.step(1, quiet);
    expect(heroOf(w, 'hero_maus'), 'not back before its hour').toBe(0);
    sim.step(1, quiet);
    const back = heroOf(w, 'hero_maus');
    expect(back, 'back at its hour').not.toBe(0);
    expect(w.heroReturn.has(row)).toBe(false);
    expect(heroHealth(w, back)).toBe(1);
    // Berlin held: at its start place.
    expect([w.formations.cols.x[back], w.formations.cols.y[back]]).toEqual([w.heroRoster[row]!.x, w.heroRoster[row]!.y]);
    while (copy.world.tick < w.tick) copy.step(1, quiet);
    expect(copy.hash()).toBe(sim.hash());
  });

  it("a dead nation's heroes do not come back until it is revived", () => {
    const sim = make('on');
    const w = sim.world;
    const ger = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
    sim.command({ kind: 'collapseNation', nation: ger });
    sim.step(1, quiet);
    expect(w.nations.cols.living[ger]).toBe(0);
    expect(heroOf(w, 'hero_maus')).toBe(0);
    expect(heroOf(w, 'hero_bismarck')).toBe(0);
    expect(w.heroReturn.has(rowOf(w, 'hero_maus'))).toBe(true);
    sim.step(HERO_RETURN_HOURS + 24, quiet);
    expect(heroOf(w, 'hero_maus'), 'none while Germany is dead').toBe(0);
    expect(heroOf(w, 'hero_bismarck')).toBe(0);
    // Revived (its cooldown waived): its heroes come back within the hour.
    w.nations.cols.revivalAt[ger] = w.tick;
    sim.command({ kind: 'reviveNation', nation: ger });
    sim.step(2, quiet);
    expect(w.nations.cols.living[ger]).toBe(1);
    expect(heroOf(w, 'hero_maus'), 'the Maus with the revival').not.toBe(0);
    expect(w.formations.cols.nation[heroOf(w, 'hero_maus')]).toBe(ger);
    // Never two of a row.
    const rows = [...w.heroes.values()];
    expect(new Set(rows).size).toBe(rows.length);
  });
});

describe('a hero against standard forces (PLAN 7.184a3; tests/helpers/heroFight.ts)', () => {
  it('the Bismarck beats one battle squadron (4 BB) with over half its health left, and is sunk by three', () => {
    const one = seaFight(1, 3);
    expect(one.lost, one.days.join('\n')).toBe(false);
    expect(one.least, one.days.join('\n')).toBeGreaterThan(0.5);
    // The squadron broke off with over half its ships lost.
    expect(one.fighting).toBe(0);
    expect(2 * one.end).toBeLessThan(one.start);
    const three = seaFight(3, 3);
    expect(three.lost, three.days.join('\n')).toBe(true);
  });

  it('the Maus beats one armoured division that attacks it with over half its health left, and is lost to three', () => {
    const one = landFight(1, 3);
    expect(one.lost, one.days.join('\n')).toBe(false);
    expect(one.least, one.days.join('\n')).toBeGreaterThan(0.5);
    // The division is out of the fight, on the retreat, with a third of its men lost.
    expect(one.fighting).toBe(0);
    expect(one.end).toBeLessThan((2 * one.start) / 3);
    const three = landFight(3, 3);
    expect(three.lost, three.days.join('\n')).toBe(true);
  });
});

// PLAN 7.184e: the AI uses its heroes. At war a sea hero goes with its nation's largest fleet,
// every day (ADR-793 a: the land hero's rule was dropped, PLAN 7.185).
describe('heroes in the AI (PLAN 7.184e)', () => {
  const nationOf = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
  const heroNamed = (w: World, id: string): number => heroIds(w).find((f) => TEMPLATES_1938[w.formations.cols.template[f]!]!.id === id)!;
  const day = (sim: Sim): void => {
    sim.step(24, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
  };

  it('at war the Bismarck goes with Germany’s largest fleet: sent to another port, the fleet has the Bismarck after it a day on', () => {
    const sim = make('on');
    const [GER, ENG] = [nationOf('GER'), nationOf('ENG')];
    sim.command({ kind: 'declareWar', attacker: GER, defender: ENG });
    const w = sim.world;
    const f = w.formations.cols;
    const W0 = w.cells.w;
    const bismarck = heroNamed(w, 'hero_bismarck');
    // Germany's largest fleet of power other than its hero, as the rule picks it.
    let big = 0;
    let bp = 0;
    w.formations.forEach((id) => {
      if (f.nation[id] !== GER || w.heroes.has(id) || !w.isFleet(id)) return;
      const p = fleetPower(w, id);
      if (p > bp || (p === bp && p > 0 && id < big)) [big, bp] = [id, p];
    });
    expect(big, 'Germany has a fleet of power').toBeGreaterThan(0);
    // Sent to the water of Germany's naval base farthest from it (Kiel ↔ Wilhelmshaven or Königsberg).
    const water = portSeaOf(w);
    let goal = -1;
    let far = 0;
    w.ports.forEach((p, i) => {
      if (p.navalBase < 1 || w.cells.controller[p.cell] !== GER || water[i]! < 0) return;
      const d = Math.hypot((water[i]! % W0) - f.x[big]!, Math.floor(water[i]! / W0) - f.y[big]!);
      if (d > far) [goal, far] = [water[i]!, d];
    });
    expect(far, 'cells to the farthest German base').toBeGreaterThan(3 * AT_PORT_CELLS);
    orderSail(w, big, (goal % W0) + 0.5, Math.floor(goal / W0) + 0.5);
    expect(f.moving[big]).toBe(1);
    day(sim);
    const target = f.targetCell[big]!;
    const near = (a: number, b: number): boolean => Math.abs((a % W0) - (b % W0)) <= w.atSize(AT_PORT_CELLS) && Math.abs(Math.floor(a / W0) - Math.floor(b / W0)) <= w.atSize(AT_PORT_CELLS);
    expect(f.moving[bismarck], 'the Bismarck under way').toBe(1);
    expect(near(f.targetCell[bismarck]!, target), 'the Bismarck sails for where the fleet sails').toBe(true);
  });
});
