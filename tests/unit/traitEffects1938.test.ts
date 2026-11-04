import { describe, expect, it } from 'vitest';
import { Terrain } from '../../src/shared/terrain';
import { traitMask, traitMods } from '../../src/shared/traits';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938, TEMPLATES_1938, TEMPLATES_LAND } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { aircraftOf, airCombat } from '../../src/sim/systems/airCombat';
import { combatSystem } from '../../src/sim/systems/combat';
import { equipFormation } from '../../src/sim/systems/elements';
import { navOf } from '../../src/sim/world';
import { queueFormation } from '../../src/sim/systems/production';
import { researchSystem } from '../../src/sim/systems/research';
import { revoltSystem } from '../../src/sim/systems/revolts';
import { holdHours, territorySystem } from '../../src/sim/systems/territory';
import { declareWar } from '../../src/sim/systems/war';
import { Leg, sortieAt } from '../../src/sim/systems/sorties';
import { FIRE_STRIDE, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { addDivision, battlefield, FIELD_X as X0, FIELD_Y as Y0, nationId } from '../helpers/sim1938';

// ROADMAP R16b (ADR-822): each trait modifier acts where its rule is. Every case runs the same
// state twice, the nation's traits none and the trait, and reads the rule's own figure: a volley,
// a loss, a price, a day, an org, an exhaustion, an unrest, a cell held.

const { w: W, h: H } = SIZE_1938;
const [GER, POL, FRA, SOV] = ['GER', 'POL', 'FRA', 'SOV'].map(nationId) as number[];
const land = (id: string): number => TEMPLATES_LAND.findIndex((t) => t.id === id);
const mod = (trait: string, key: string): number => traitMods(traitMask([trait]))[key]!;
const setTraits = (w: World, n: number, traits: string[]): void => {
  w.nations.cols.traits[n] = traitMask(traits);
};

/** One hour of land combat on the plain of `battlefield`: shooter element → damage of its volley. */
function landVolleys(traits: { ger?: string[]; pol?: string[] }, germans = 'panzer_div'): { ger: Map<number, number>; armour: Set<number> } {
  const world = battlefield(Terrain.Plains, [[GER!, POL!]]);
  setTraits(world, GER!, traits.ger ?? []);
  setTraits(world, POL!, traits.pol ?? []);
  const g = addDivision(world, GER!, X0 + 0.5, Y0 + 0.5, land(germans));
  addDivision(world, POL!, X0 + 1.5, Y0 + 0.5, land('infantry_div'));
  world.out.fires.length = 0;
  combatSystem(world);
  const ger = new Map<number, number>();
  const armour = new Set<number>();
  const fr = world.out.fires.slice();
  for (let i = 0; i < fr.length; i += FIRE_STRIDE) {
    const s = fr[i + 2]!;
    if (world.elements.cols.formation[s] !== g) continue;
    ger.set(s, fr[i + 5]!);
    const u = world.rules!.units[world.elements.cols.unit[s]!]!;
    if (u.cls.startsWith('armor')) armour.add(s);
  }
  return { ger, armour };
}

/** Every volley of `b` is `a`'s of the same element × `factor` (× `armour` for armour's). */
function expectScaled(a: Map<number, number>, b: Map<number, number>, factor: number, armour?: { ids: Set<number>; factor: number }): void {
  expect(b.size).toBe(a.size);
  expect(b.size).toBeGreaterThan(10);
  for (const [s, dmg] of b) expect(dmg / a.get(s)!, `element ${s}`).toBeCloseTo(factor * (armour?.ids.has(s) ? armour.factor : 1), 10);
}

describe('trait modifiers act (ROADMAP R16b)', () => {
  it('landAttack: a militarist land formation fires × (1 + landAttack)', () => {
    const base = landVolleys({}, 'infantry_div');
    const mil = landVolleys({ ger: ['militarist'] }, 'infantry_div');
    expectScaled(base.ger, mil.ger, 1 + mod('militarist', 'landAttack'));
  });

  it('armorAttack: armoured doctrine raises its tanks\' fire, not the rest of the division\'s', () => {
    const base = landVolleys({});
    const doc = landVolleys({ ger: ['armored_doctrine'] });
    expect(base.armour.size).toBeGreaterThan(0);
    expectScaled(base.ger, doc.ger, 1, { ids: base.armour, factor: 1 + mod('armored_doctrine', 'armorAttack') });
  });

  it('landDefense: fire on an isolationist\'s land formation ÷ (1 + landDefense)', () => {
    const base = landVolleys({}, 'infantry_div');
    const iso = landVolleys({ pol: ['isolationist'] }, 'infantry_div');
    expectScaled(base.ger, iso.ger, 1 / (1 + mod('isolationist', 'landDefense')));
  });

  it('airAttack and airDefense: an air-minded wing fires × (1 + airAttack), and takes ÷ (1 + airDefense)', () => {
    const lost = (ger: string[], fra: string[]): [number, number] => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      const w = s.world;
      w.settings.aiEnabled = false;
      w.wars.start([GER!], [FRA!], 0);
      setTraits(w, GER!, ger);
      setTraits(w, FRA!, fra);
      const wingOf = (n: number, t: string): number => [...w.wingBase].filter(([id, b]) => w.formations.cols.nation[id] === n && b > 0 && TEMPLATES_1938[w.formations.cols.template[id]!]!.id === t)[0]![0];
      const [x, y] = cellOf(7.75, 48.58, W, H);
      const f = wingOf(GER!, 'fighter_group');
      const b = wingOf(FRA!, 'tactical_bomber_group');
      for (const id of [f, b]) {
        w.sorties.set(id, { bx: w.formations.cols.x[id]!, by: w.formations.cols.y[id]!, tx: x, ty: y, launch: w.tick - 1, kmh: 400, km: 400, over: 100 });
        expect(sortieAt(w.sorties.get(id)!, w.tick, w.cells.w).leg).toBe(Leg.Over);
      }
      const left = (id: number): number => {
        let n = 0;
        w.elements.forEach((e) => {
          if (w.elements.cols.formation[e] === id) n += w.elements.cols.strength[e]! - w.elements.cols.wound[e]!;
        });
        return n;
      };
      const [f0, b0] = [aircraftOf(w, f), aircraftOf(w, b)];
      airCombat(w, new Map([[7, [f, b]]]));
      return [f0 - left(f), b0 - left(b)];
    };
    const [, base] = lost([], []);
    const [, att] = lost(['air_minded'], []);
    const [fDef, def] = lost([], ['air_minded']);
    expect(base).toBeGreaterThan(0);
    expect(att / base).toBeCloseTo(1 + mod('air_minded', 'airAttack'), 10);
    expect(def / base).toBeCloseTo(1 / (1 + mod('air_minded', 'airDefense')), 10);
    expect(fDef).toBeGreaterThan(0);
  });

  it('navalAttack: a fleet of a naval tradition fires × (1 + navalAttack)', () => {
    // A German battle squadron and a British cruiser squadron 10 km apart in the North Atlantic.
    const volleys = (traits: string[]): Map<number, number> => {
      const sim = new Sim({ scenario: '1938', seed: 4302, assets: assets1938(W) });
      const w = sim.world;
      w.settings.aiEnabled = false;
      const ENG = nationId('ENG');
      expect(declareWar(w, GER!, ENG, true)).not.toBeNull();
      setTraits(w, GER!, traits);
      const [cx, cy] = cellOf(-32, 47, W, H).map(Math.floor) as [number, number];
      const kx = navOf(w).grid.kx[cy]!;
      const fleet = (n: number, t: string, x: number): number => {
        const id = w.formations.create();
        const c = w.formations.cols;
        c.nation[id] = n;
        c.x[id] = x;
        c.y[id] = cy + 0.5;
        c.template[id] = TEMPLATES_1938.findIndex((x) => x.id === t);
        c.supply[id] = 1;
        c.org[id] = 1;
        equipFormation(w, id, c.template[id]!);
        return id;
      };
      const g = fleet(GER!, 'battle_squadron', cx + 0.5);
      fleet(ENG, 'cruiser_squadron', cx + 0.5 + 10 / kx);
      const out = new Map<number, number>();
      sim.step(1, (ww) => {
        const fr = ww.out.fires.slice();
        for (let i = 0; i < fr.length; i += FIRE_STRIDE) if (ww.elements.cols.formation[fr[i + 2]!] === g) out.set(fr[i + 2]!, (out.get(fr[i + 2]!) ?? 0) + fr[i + 5]!);
        ww.out.fires.length = 0;
        ww.out.events.length = 0;
      });
      return out;
    };
    const base = volleys([]);
    const nav = volleys(['naval_tradition']);
    expect(base.size).toBeGreaterThan(0);
    expect(nav.size).toBe(base.size);
    for (const [e, d] of nav) expect(d / base.get(e)!, `element ${e}`).toBeCloseTo(1 + mod('naval_tradition', 'navalAttack'), 10);
  });

  it('warExhaustion: a pacifist leader\'s side tires × (1 + warExhaustion)', () => {
    const tired = (traits: string[]): [number, number] => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      s.world.settings.aiEnabled = false;
      setTraits(s.world, GER!, traits);
      const war = declareWar(s.world, GER!, POL!, true)!;
      expect(war).not.toBeNull();
      s.step(24 * 30, (w) => {
        w.out.events.length = 0;
        w.out.fires.length = 0;
      });
      return [war.exhaustion[0]!, war.exhaustion[1]!];
    };
    const [a0, d0] = tired([]);
    const [a1, d1] = tired(['pacifist']);
    expect(a0).toBeGreaterThan(0);
    expect(a1 / a0).toBeCloseTo(1 + mod('pacifist', 'warExhaustion'), 6);
    expect(d1).toBe(d0);
  });

  it('stability and revoltSuppression: a month\'s unrest − 10 × stability on core land, suppression × (1 + revoltSuppression)', () => {
    // `taken`: that many of GER's core provinces made another's core, so GER holds them as conquests.
    const unrest = (traits: string[], suppression: number, taken = 0): number[] => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      const w = s.world;
      setTraits(w, GER!, traits);
      w.nations.cols.suppression[GER!] = suppression;
      const pv = w.provinces;
      const mine: number[] = [];
      for (let p = 0; p < pv.count; p++) if (pv.core[p] === GER) mine.push(p);
      for (const p of mine.slice(0, taken)) pv.core[p] = POL!;
      for (const p of mine) pv.unrest[p] = 30;
      revoltSystem(w);
      return mine.map((p) => pv.unrest[p]!);
    };
    const base = unrest([], 0);
    expect(base.length).toBeGreaterThan(5);
    const dem = unrest(['democratic'], 0);
    dem.forEach((u, i) => expect(u - base[i]!).toBeCloseTo(-10 * mod('democratic', 'stability'), 9));
    // Conquered land (not the holder's core) breeds unrest whatever the holder's stability.
    const taken = unrest([], 0, 3);
    const demTaken = unrest(['democratic'], 0, 3);
    for (let i = 0; i < 3; i++) expect(demTaken[i]).toBe(taken[i]);
    for (let i = 3; i < taken.length; i++) expect(demTaken[i]! - taken[i]!).toBeCloseTo(-10 * mod('democratic', 'stability'), 9);
    const supp0 = unrest([], 1);
    const auth = unrest(['authoritarian'], 1);
    // SUPPRESS (5) × 1 × revoltSuppression more taken off.
    auth.forEach((u, i) => expect(u - supp0[i]!).toBeCloseTo(-5 * mod('authoritarian', 'revoltSuppression'), 9));
  });

  it('research: each gold a democratic nation pays counts 1 + research towards its tech', () => {
    const paid = (traits: string[]): { gold: number; paid: number } => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      const w = s.world;
      setTraits(w, FRA!, traits);
      w.nations.cols.research[FRA!] = 1;
      const gold = w.nations.cols.gold[FRA!]!;
      researchSystem(w);
      let sum = 0;
      for (const id of w.research.ids()) if (w.research.cols.nation[id] === FRA) sum += w.research.cols.paid[id]!;
      return { gold: gold - w.nations.cols.gold[FRA!]!, paid: sum };
    };
    const base = paid([]);
    const dem = paid(['democratic']);
    expect(base.gold).toBeGreaterThan(0);
    expect(dem.gold).toBeCloseTo(base.gold, 9);
    expect(dem.paid / base.paid).toBeCloseTo(1 + mod('democratic', 'research'), 9);
  });

  it('industry and buildSpeed: an industrial nation\'s order costs ÷ (1 + industry) and trains in ÷ (1 + buildSpeed) days', () => {
    const order = (traits: string[]): { gold: number; days: number } => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      const w = s.world;
      setTraits(w, FRA!, traits);
      const gold = w.nations.cols.gold[FRA!]!;
      const id = queueFormation(w, FRA!, land('infantry_div'));
      expect(id).not.toBe(0);
      return { gold: gold - w.nations.cols.gold[FRA!]!, days: w.production.cols.readyDay[id]! - Math.floor(w.tick / 24) };
    };
    const base = order([]);
    const ind = order(['industrial']);
    expect(ind.gold).toBeCloseTo(base.gold / (1 + mod('industrial', 'industry')), 9);
    expect(ind.days).toBe(Math.ceil(base.days / (1 + mod('industrial', 'buildSpeed'))));
    expect(ind.days).toBeLessThan(base.days);
  });

  it('org: a militarist\'s formation, fed and out of contact, gets its org back × (1 + org)', () => {
    const regained = (traits: string[]): number => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      const w = s.world;
      w.settings.aiEnabled = false;
      setTraits(w, FRA!, traits);
      const f = w.formations.ids().find((id) => w.formations.cols.nation[id] === FRA && !w.isWing(id) && !w.afloat(id))!;
      w.formations.cols.org[f] = 0.5;
      w.formations.cols.supply[f] = 1;
      s.step(1);
      return w.formations.cols.org[f]! - 0.5;
    };
    const base = regained([]);
    expect(base).toBeGreaterThan(0);
    expect(regained(['militarist']) / base).toBeCloseTo(1 + mod('militarist', 'org'), 9);
  });

  it('fortStrength: a cell a fortifier holds needs × (1 + fortStrength) of the pressure to fall', () => {
    // A German formation a cell west of a Soviet cell no Soviet formation guards: its pressure
    // there, strength ÷ 1000 × (1 − 1 ÷ 3), is 1.1, over the garrison's 1 and under 1.25.
    const held = (traits: string[]): boolean => {
      const world = battlefield(Terrain.Plains, [[GER!, SOV!]]);
      setTraits(world, SOV!, traits);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= -1; dx++) world.setController((Y0 + dy) * W + X0 + dx, GER!);
      world.frontier = null;
      const g = addDivision(world, GER!, X0 - 0.5, Y0 + 0.5, land('infantry_div'));
      world.formations.cols.strength[g] = 1650;
      for (let h = 0; h <= holdHours(world); h++) {
        world.formations.cols.strength[g] = 1650;
        territorySystem(world);
      }
      return world.cells.controller[Y0 * W + X0] === SOV;
    };
    expect(held([])).toBe(false);
    expect(held(['fortifier'])).toBe(true);
  });
});
