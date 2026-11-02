import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { neighbourMap } from '../../src/sim/ai/strategic';
import type { GameOptions } from '../../src/shared/gameOptions';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// PLAN 1.39b1 (unit part): new-game options are deterministic per seed and have their effect.

const W = SIZE_1938.w;
const make = (seed: number, options?: GameOptions): Sim => new Sim({ scenario: '1938', seed, assets: assets1938(W), ...(options ? { options } : {}) });
const col = (s: Sim, k: 'aggression' | 'incomeMult' | 'gold'): number[] => {
  const out: number[] = [];
  s.world.nations.forEach((n) => {
    if (s.world.nations.cols.living[n] === 1) out.push(s.world.nations.cols[k][n]!);
  });
  return out;
};

describe('new-game options (PLAN 1.39b1)', () => {
  const base = make(5);

  it('random aggression: 0..100, differs from the scenario, same per seed', () => {
    const a = make(5, { aggression: 'random' });
    const b = make(5, { aggression: 'random' });
    const v = col(a, 'aggression');
    expect(v.every((x) => x >= 0 && x <= 100)).toBe(true);
    expect(v).not.toEqual(col(base, 'aggression'));
    expect(a.hash()).toBe(b.hash());
    expect(make(6, { aggression: 'random' }).hash()).not.toBe(a.hash());
  });

  it('random traits change income multipliers within the trait range', () => {
    const v = col(make(5, { traits: 'random' }), 'incomeMult');
    expect(v).not.toEqual(col(base, 'incomeMult'));
    expect(new Set(v).size).toBeGreaterThan(2);
    expect(v.every((x) => x > 0.5 && x < 1.6)).toBe(true);
  }, 120_000);

  it('gold: equal for all living nations, or 0.25–2× the scenario', () => {
    const eq = col(make(5, { gold: 'equal' }), 'gold');
    expect(new Set(eq).size).toBe(1);
    const g0 = col(base, 'gold');
    const r = col(make(5, { gold: 'random' }), 'gold');
    r.forEach((g, i) => {
      expect(g).toBeGreaterThanOrEqual(g0[i]! * 0.25 - 1e-9);
      expect(g).toBeLessThanOrEqual(g0[i]! * 2 + 1e-9);
    });
    expect(r).not.toEqual(g0);
  }, 120_000);

  it('no looping map: pathing does not wrap, and the setting is saved; CE mode applies', () => {
    const s = make(5, { loopingMap: false, ceMode: 'static' });
    expect(s.world.settings.loopingMap).toBe(false);
    expect(s.world.settings.ceMode).toBe('static');
    expect(navOf(s.world).grid.wrapX).toBe(false);
    expect(navOf(base.world).grid.wrapX).toBe(true);
    const t = make(1);
    t.load(s.save());
    expect(t.world.settings.loopingMap).toBe(false);
    expect(t.hash()).toBe(s.hash());
    s.step(48);
    t.step(48);
    expect(t.hash()).toBe(s.hash());
  }, 120_000);

  // PLAN 7.182: the start's alliances, guarantees and wars drawn by the seed; puppets the scenario's.
  it('random diplomacy: as many alliances (same sizes and unity), guarantees and wars, new ones, the same per seed', () => {
    const a = make(5, { diplomacy: 'random' });
    const al0 = base.world.alliances;
    const al = a.world.alliances;
    const nc = a.world.nations.cols;
    const shape = (l: typeof al.list): string[] => l.map((x) => `${x.members.length}/${x.unity}`).sort();
    expect(shape(al.list)).toEqual(shape(al0.list));
    expect(al.guarantees.length).toBe(al0.guarantees.length);
    expect(a.world.wars.list.length).toBe(base.world.wars.list.length);
    // Nothing of the scenario's left in the history: no alliance of it dissolved.
    expect(al.past).toEqual([]);
    // New members, every one an independent nation in one alliance only, led by its largest.
    const sets = (l: typeof al.list): string[] => l.map((x) => [...x.members].sort((p, q) => p - q).join(',')).sort();
    expect(sets(al.list)).not.toEqual(sets(al0.list));
    const land = a.world.landCounts().owned;
    const seen = new Set<number>();
    for (const x of al.list) {
      expect(x.nameKey).toBe('alliance.defensive');
      for (const m of x.members) {
        expect(seen.has(m)).toBe(false);
        seen.add(m);
        expect(nc.overlord[m]).toBe(0);
        expect(land[m]!).toBeLessThanOrEqual(land[x.leader]!);
      }
    }
    const free: number[] = [];
    a.world.nations.forEach((n) => {
      if (nc.living[n] === 1 && nc.overlord[n] === 0) free.push(n);
    });
    const half = [...free].sort((p, q) => land[q]! - land[p]! || p - q).slice(0, Math.ceil(free.length / 2));
    for (const g of al.guarantees) {
      expect(half).toContain(g.guarantor);
      expect(g.guarantor).not.toBe(g.target);
      expect(al.allied(g.guarantor, g.target)).toBe(false);
      expect(nc.overlord[g.guarantor]).toBe(0);
      expect(nc.overlord[g.target]).toBe(0);
    }
    // Wars between land neighbours; no allies on opposite sides.
    const nb = neighbourMap(a.world);
    for (const w of a.world.wars.list) {
      const [att, def] = w.sides;
      expect(nb.get(att[0]!)?.has(def[0]!)).toBe(true);
      for (const x of att) for (const y of def) expect(al.allied(x, y)).toBe(false);
    }
    // Puppets as in the scenario.
    base.world.nations.forEach((n) => expect(nc.overlord[n]).toBe(base.world.nations.cols.overlord[n]));
    expect(make(5, { diplomacy: 'random' }).hash()).toBe(a.hash());
    expect(make(6, { diplomacy: 'random' }).hash()).not.toBe(a.hash());
  }, 120_000);

  // PLAN 7.187 (R24-B1): the scenario's wars end as a white peace would. The critic's seeds kept
  // Japan on 1,345 cells of China at peace from the first day.
  it('random diplomacy: no land held by a nation at peace with its owner', () => {
    const peaceHeld = (s: Sim): number => {
      const { owner, controller } = s.world.cells;
      let n = 0;
      for (let c = 0; c < owner.length; c++) {
        const o = owner[c]!;
        const k = controller[c]!;
        if (o !== 0 && k !== 0 && k !== o && !s.world.wars.atWar(o, k)) n++;
      }
      return n;
    };
    const held = (s: Sim, a: string, b: string): number => {
      const { owner, controller } = s.world.cells;
      let n = 0;
      for (let c = 0; c < owner.length; c++) if (owner[c] === nationId(b) && controller[c] === nationId(a)) n++;
      return n;
    };
    expect(held(base, 'JAP', 'CHI'), 'the scenario: Japan holds Chinese land').toBeGreaterThan(0);
    for (const seed of [1517, 3739, 8821]) expect(peaceHeld(make(seed, { diplomacy: 'random' })), `seed ${seed}`).toBe(0);
  }, 120_000);

  // PLAN 7.184d: the heroes, off unless asked for; on, the 14 of the roster, the same per seed.
  it('heroes: none by default or off, the 14 when on', () => {
    expect(base.world.heroes.size).toBe(0);
    expect(make(5, { heroes: 'off' }).hash()).toBe(base.hash());
    const on = make(5, { heroes: 'on' });
    expect(on.world.heroes.size).toBe(14);
    expect(on.hash()).not.toBe(base.hash());
    expect(make(5, { heroes: 'on' }).hash()).toBe(on.hash());
  });
});
