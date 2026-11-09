import { describe, expect, it } from 'vitest';
import { invasionAi, LANDING_PROBE, type LandingPlan } from '../../src/sim/ai/invasion';
import { STAGGER } from '../../src/sim/ai/strategic';
import { NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { placeFleet } from '../../src/sim/placeForces';
import { declareWar } from '../../src/sim/systems/war';
import { portSeaOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R57f (critic run 58, 28061): Japan, holding Constanța, landed at Sevastopol each week, and each week two Soviet
// submarine flotillas standing at its water sank the transports (4–6 ships, 0 Soviet losses, eight weeks running). Sea
// control leaves submarines out, so the sea read open. The landing AI now takes no enemy port whose water an enemy fleet
// that fights (warships or submarines) stands by. Japan at war with the United States in 1938 lands on Guam; with a US
// submarine flotilla at Guam's water, it lands elsewhere.

const { w: W } = SIZE_1938;
const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
const JAP = id('JAP');
const USA = id('USA');
const FLOTILLA = TEMPLATES_1938.findIndex((t) => t.id === 'submarine_flotilla');

/** Japan's landing plan on its invasion day, at war with the US, with `guard` (a US flotilla at Guam's water) or not. */
function japanPlan(guard: boolean): { plan: LandingPlan | undefined; guam: number } {
  const s = new Sim({ scenario: '1938', seed: 4601, assets: assets1938(W) });
  const w = s.world;
  s.command({ kind: 'setSetting', key: 'aiEnabled', value: false });
  s.step(1);
  declareWar(w, JAP, USA);
  s.step(24 - (w.tick % 24));
  while ((w.tick / 24 + JAP) % STAGGER !== 0) s.step(24);
  const k = w.ports.findIndex((p) => p.name === 'Guam');
  const sea = portSeaOf(w)[k]!;
  if (guard) expect(placeFleet(w, USA, FLOTILLA, (sea % W) + 0.5, Math.floor(sea / W) + 0.5)).toBe(0);
  const plans: LandingPlan[] = [];
  LANDING_PROBE.plan = (p) => plans.push(p);
  w.settings.aiEnabled = true;
  try {
    invasionAi(w);
  } finally {
    delete LANDING_PROBE.plan;
  }
  return { plan: plans.find((p) => p.nation === JAP && p.kind === 'landing'), guam: w.ports[k]!.cell };
}

describe('a landing takes no enemy port an enemy fleet stands by (ROADMAP R57f)', () => {
  it('Japan lands on Guam; with a US submarine flotilla at its water, elsewhere', () => {
    expect(FLOTILLA).toBeGreaterThanOrEqual(0);
    const open = japanPlan(false);
    expect(open.plan?.target).toBe(open.guam);
    const guarded = japanPlan(true);
    expect(guarded.plan).toBeDefined();
    expect(guarded.plan!.target).not.toBe(guarded.guam);
  }, 120_000);
});
