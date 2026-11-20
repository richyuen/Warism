import { describe, expect, it } from 'vitest';
import { peaceWhy } from '../../src/sim/ai/peaceWhy';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R216 (critic run 89, R89-N1; ADR-1145): a world of few nations at peace says why, by the strategic AI's own
// terms at its most restless. ADR-1129's traced worlds give its reasons: 54425 near-equals, 55404 its rivals too dear
// across the sea, 59423 the one that would fight refused for want of a lift. A read leaves the world as it was (its save
// the same bytes), and a reason given holds: no war comes within the month after a day it was given (89401, whose first
// war is on day 894).

const assets = assets1938(2048);
const world = (seed: number, nations: number): Sim => new Sim({ scenario: 'random', seed, assets, options: { nations } });
const days = (sim: Sim, n: number): void => {
  for (let d = 0; d < n; d++)
    sim.step(24, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
};
/** `peaceWhy` read, and the save's bytes before and after the read the same. */
const read = (sim: Sim): ReturnType<typeof peaceWhy> => {
  const before = sim.save();
  const p = peaceWhy(sim.world);
  expect(Buffer.compare(Buffer.from(before), Buffer.from(sim.save())), 'the read leaves the world as it was').toBe(0);
  return p;
};
const reasons = (p: ReturnType<typeof peaceWhy>): string => (p?.rows ?? []).map((r) => `${r.n}:${r.reason}>${r.t}`).join(' ');

describe('a world of few nations at peace and why (R216)', () => {
  it('54425: two of near-equal strength, neither outmatching the other', () => {
    const sim = world(54425, 2);
    days(sim, 365);
    const p = read(sim);
    expect(p?.why).toBe(true);
    expect(reasons(p)).toBe('1:equal>2 2:equal>1');
  });

  it('55404: two would fight the third, too dear across the sea; the third outmatches neither', () => {
    const sim = world(55404, 3);
    days(sim, 365);
    expect(reasons(read(sim))).toBe('1:far>3 2:far>3 3:equal>2');
  });

  it('59423: the stronger chooses the other and is refused for want of a lift', () => {
    const sim = world(59423, 2);
    days(sim, 365);
    expect(reasons(read(sim))).toBe('1:equal>2 2:noLift>1');
  });

  // 89404 was this case until R217: its massings were begun on a land none of its men stood on (ADR-1145's trace).
  it('89418: a war prepared, or one barred a year that it would choose again: no reason given (at peace for now)', () => {
    const sim = world(89418, 3);
    days(sim, 60);
    expect(sim.world.massing.size, 'a massing on day 60').toBeGreaterThan(0);
    expect(read(sim)).toEqual({ why: false, rows: [] });
    days(sim, 70);
    expect(sim.world.wars.size, 'at peace on day 130').toBe(0);
    expect(sim.world.massing.size, 'none on day 130').toBe(0);
    expect(sim.world.massBarred.size, 'its target barred').toBeGreaterThan(0);
    expect(read(sim)).toEqual({ why: false, rows: [] });
  });

  // R217: nation 2's army stands on another land than its borders: a war across the sea, its transports on order.
  it('89404 (R217): a lift on order is a war to come, no reason given; the war comes', { timeout: 120_000 }, () => {
    const sim = world(89404, 3);
    days(sim, 60);
    expect(read(sim)).toEqual({ why: false, rows: [] });
    days(sim, 90);
    expect(sim.world.wars.size, 'at war by day 150').toBeGreaterThan(0);
  });

  it('none for a world at war, or of more than three realms', () => {
    expect(read(new Sim({ scenario: '1938', seed: 99, assets: assets1938(SIZE_1938.w) }))).toBeNull();
    const many = world(7, 24);
    expect(many.world.wars.size).toBe(0);
    expect(read(many)).toBeNull();
  });

  // 89414 (R217): its nation 1 was told refused for want of a lift to day 90, its transports on order, and at war on day 98.
  for (const seed of [89401, 89414])
    it(`a reason given holds: ${seed} gives none in the month before its first war`, { timeout: 120_000 }, () => {
      const sim = world(seed, 3);
      const given: number[] = [];
      let first = -1;
      for (let d = 0; d < 1000 && first < 0; d++) {
        if (d % 5 === 0 && read(sim)?.why) given.push(d);
        days(sim, 1);
        if (sim.world.wars.size > 0) first = d + 1;
      }
      expect(first, 'its first war').toBeGreaterThan(0);
      expect(given.filter((d) => d > first - 30), `days a reason was given (first war on day ${first})`).toEqual([]);
    });
});
