import { afterEach, expect, it } from 'vitest';
import { dayOfIso } from '../../src/shared/calendar';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { TRACK_PROBE } from '../../src/sim/track';
import type { World } from '../../src/sim/world';
import { loadAssets1938 } from '../../tools/headless/assets';

// ROADMAP R62f2 (ADR-929), R62g0 (ADR-930): the China front held. From one save on 1 November 1938, 12 months with the
// holds and without (TRACK_PROBE.holdsOff): with them, Japan's share of China within 5 points of its start and at least
// 15 % (its occupation of 1938, by stages), China's army not under half of it, the Communists and Manchukuo living.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const [JAP, MAN, MEN, CHI, CCP] = ['JAP', 'MAN', 'MEN', 'CHI', 'CCP'].map(id) as [number, number, number, number, number];
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

function front(w: World): { share: number; army: number; ccp: boolean; man: boolean } {
  const { owner, controller } = w.cells;
  let china = 0;
  let held = 0;
  for (let c = 0; c < owner.length; c++) {
    if (owner[c] !== CHI && owner[c] !== CCP) continue;
    china++;
    if (controller[c] === JAP || controller[c] === MAN || controller[c] === MEN) held++;
  }
  let army = 0;
  w.formations.forEach((f) => {
    if (w.formations.cols.nation[f] === CHI) army += w.formations.cols.strength[f]!;
  });
  return { share: held / china, army, ccp: w.nations.cols.living[CCP] === 1, man: w.nations.cols.living[MAN] === 1 };
}

afterEach(() => {
  delete TRACK_PROBE.holdsOff;
});

it('the China front holds a year from November 1938, and does not without the hold', () => {
  const assets = loadAssets1938(SIZE_1938.w);
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
  sim.step((dayOfIso('1938-11-01') - dayOfIso('1938-01-01')) * 24 + 1, quiet);
  const bytes = sim.save();
  const start = front(sim.world);
  const year = (off: boolean): ReturnType<typeof front> => {
    const s = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
    s.load(bytes);
    TRACK_PROBE.holdsOff = off;
    s.step(365 * 24, quiet);
    return front(s.world);
  };
  const held = year(false);
  const loose = year(true);
  const say = (f: ReturnType<typeof front>): string => `Japan holds ${(100 * f.share).toFixed(1)} % of China, China's army ${Math.round(f.army / 1000)}k, Communists ${f.ccp ? 'living' : 'dead'}, Manchukuo ${f.man ? 'living' : 'dead'}`;
  process.stderr.write(`1 Nov 1938: ${say(start)}\na year held: ${say(held)}\na year without: ${say(loose)}\n`);
  expect(Math.abs(held.share - start.share)).toBeLessThanOrEqual(0.05);
  expect(held.share).toBeGreaterThanOrEqual(0.15);
  expect(held.army).toBeGreaterThanOrEqual(start.army / 2);
  expect(held.ccp).toBe(true);
  expect(held.man).toBe(true);
}, 1_800_000);
