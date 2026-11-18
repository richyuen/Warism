import { describe, expect, it } from 'vitest';
import { MASS_BAR_DAYS, MASS_PROBE, massStep } from '../../src/sim/ai/massing';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R154 (critic run 76): seed 57613, Britain's massing on Mozambique was told on day 720, ended by a day's refusal
// (Overrun) on day 764 and told called off, then taken up and told again on day 814: a second false alarm within two
// months. A massing told and called off before its time now bars its target to that nation for MASS_BAR_DAYS, as one
// given up after MASS_DAYS does.

const { w: W } = SIZE_1938;
const [FRA, GER, ITA, POL, SWI] = ['FRA', 'GER', 'ITA', 'POL', 'SWI'].map(nationId) as [number, number, number, number, number];
const key = (n: number, t: number): number => n * 65536 + t;
const step = (w: World): void => massStep(w, 0, () => true, () => false);

describe('a massing told and called off bars its target as long as one given up (ROADMAP R154)', () => {
  it('barred when told and ended by a war elsewhere; not when untold, at war with its target, or by the probe', () => {
    const w = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) }).world;
    // France's told massing on Switzerland; France goes to war with Italy (and its allies): it is in a war, the massing ends.
    w.massing.set(FRA, { target: SWI, since: 0 });
    w.massTold.add(FRA);
    // Poland's on Switzerland, untold.
    w.massing.set(POL, { target: SWI, since: 0 });
    declareWar(w, FRA, ITA);
    declareWar(w, POL, ITA);
    step(w);
    expect(w.massing.has(FRA)).toBe(false);
    expect(w.wars.atWar(FRA, SWI)).toBe(false);
    expect(w.massBarred.get(key(FRA, SWI)), 'told and called off: barred').toBe(MASS_BAR_DAYS);
    expect(w.massBarred.has(key(POL, SWI)), 'never told: not barred').toBe(false);

    // Told, and at war with its target by then: no bar (the war is what it massed for).
    const v = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) }).world;
    v.massing.set(FRA, { target: GER, since: 0 });
    v.massTold.add(FRA);
    declareWar(v, FRA, GER);
    step(v);
    expect(v.massBarred.has(key(FRA, GER))).toBe(false);

    // The probe's switch: as before R154.
    const u = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) }).world;
    u.massing.set(FRA, { target: SWI, since: 0 });
    u.massTold.add(FRA);
    declareWar(u, FRA, ITA);
    MASS_PROBE.againOff = true;
    step(u);
    MASS_PROBE.againOff = false;
    expect(u.massBarred.has(key(FRA, SWI))).toBe(false);
  }, 300_000);
});
