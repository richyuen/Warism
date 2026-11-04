import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { Refusal } from '../../src/shared/commands';
import { TRAIT_MASK_END, traitMask, traitsClash, traitsOf } from '../../src/shared/traits';
import { assets1938 } from '../helpers/earth';
import { nationId, runEvents as run } from '../helpers/sim1938';

// ROADMAP R16: a nation's traits are state (`nations.traits`), set by the scenario, by the random
// traits option and by God Mode's `setTraits`; its income and manpower multipliers follow them.

const { w: W } = SIZE_1938;
const [GER, SOV, POL] = ['GER', 'SOV', 'POL'].map(nationId) as number[];
const refusals = (s: Sim): number[] => run(s, 1).filter((e) => e[1] === EventKind.CommandRefused).map((e) => e[3]!);

describe('nation traits (ROADMAP R16)', () => {
  it('the 1938 scenario sets each nation its traits from nations.json', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const nc = s.world.nations.cols;
    expect(traitsOf(nc.traits[GER!]!).map((t) => t.id)).toEqual(['militarist', 'industrial', 'armored_doctrine']);
    expect(nc.traits[SOV!]).toBe(traitMask(['mass_mobilisation', 'revolutionary', 'industrial']));
    expect(nc.manpowerMult[SOV!]).toBeCloseTo(1.35, 12);
  });

  it('setTraits sets the mask and the multipliers, and survives a save and a load', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const mask = traitMask(['mercantile', 'mass_mobilisation']);
    s.command({ kind: 'setTraits', nation: POL!, mask });
    expect(refusals(s)).toEqual([]);
    const nc = s.world.nations.cols;
    expect(nc.traits[POL!]).toBe(mask);
    expect(nc.incomeMult[POL!]).toBeCloseTo(1.15, 12);
    expect(nc.manpowerMult[POL!]).toBeCloseTo(1.25, 12);
    const t = new Sim({ scenario: '1938', seed: 2, assets: assets1938(W) });
    t.load(s.save());
    expect(t.world.nations.cols.traits[POL!]).toBe(mask);
    expect(t.hash()).toBe(s.hash());
    // None: back to 1.
    s.command({ kind: 'setTraits', nation: POL!, mask: 0 });
    expect(refusals(s)).toEqual([]);
    expect([nc.traits[POL!], nc.incomeMult[POL!], nc.manpowerMult[POL!]]).toEqual([0, 1, 1]);
  });

  it('refuses traits that exclude each other, a mask past the traits, and a nation not there', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const before = s.world.nations.cols.traits[GER!];
    expect(traitsClash(traitMask(['militarist', 'pacifist']))).toBe(true);
    s.command({ kind: 'setTraits', nation: GER!, mask: traitMask(['militarist', 'pacifist']) });
    expect(refusals(s)).toEqual([Refusal.TraitsClash]);
    s.command({ kind: 'setTraits', nation: GER!, mask: TRAIT_MASK_END });
    expect(refusals(s)).toEqual([Refusal.OutOfRange]);
    s.command({ kind: 'setTraits', nation: 9999, mask: 1 });
    expect(refusals(s)).toEqual([Refusal.NoNation]);
    expect(s.world.nations.cols.traits[GER!]).toBe(before);
  });

  it('random traits are kept as the mask they were drawn as, without a clash', () => {
    const s = new Sim({ scenario: '1938', seed: 5, assets: assets1938(W), options: { traits: 'random' } });
    const nc = s.world.nations.cols;
    let some = 0;
    s.world.nations.forEach((n) => {
      const m = nc.traits[n]!;
      if (m !== 0) some++;
      expect(traitsClash(m), `nation ${n}`).toBe(false);
      expect(nc.incomeMult[n]).toBeCloseTo(1 + traitsOf(m).reduce((a, t) => a + (t.modifiers.income ?? 0), 0), 12);
    });
    expect(some).toBeGreaterThan(50);
  });
});
