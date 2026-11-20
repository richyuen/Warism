import { describe, expect, it } from 'vitest';
import { peaceWhy } from '../../src/sim/ai/peaceWhy';
import { MASS_PROBE } from '../../src/sim/ai/massing';
import { EventKind } from '../../src/shared/events';
import { PEACE_ORDER } from '../../src/shared/protocol';
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

  // R219 (critic run 90, R90-B1): what holds a peace today and ends before the cap gives no reason. 90441: "no rival
  // within its reach" for both to day 90, their transports at port on day 91, war on day 98. 89401: a truce with 2 days
  // left read as a bond and the next rival named, war on the truce's party on day 1604.
  for (const [seed, nations, from, war] of [[90441, 2, 80, 98], [89401, 3, 1590, 1604]] as const)
    it(`${seed}: no reason given in the days before its war on day ${war} (a lift on its way, a truce near its end)`, { timeout: 180_000 }, () => {
      const sim = world(seed, nations);
      days(sim, from);
      const given: number[] = [];
      for (let d = from; d < war - 1; d++) {
        expect(sim.world.wars.size, `at peace on day ${d}`).toBe(0);
        if (read(sim)?.why) given.push(d);
        days(sim, 1);
      }
      expect(given).toEqual([]);
      days(sim, 2);
      expect(sim.world.wars.size, `at war by day ${war}`).toBeGreaterThan(0);
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

  // R222 (critic run 90, R90-N2): the peace's reason told to History (`PeaceHeld`), once while it holds, again when it
  // changes, and never in the days a war may yet come.
  const told = (sim: Sim): string[] => {
    const r = sim.world.history.rows;
    const out: string[] = [];
    for (let i = 0; i < r.length; i += 6) if (r[i + 1] === EventKind.PeaceHeld || r[i + 1] === EventKind.WarDeclared) out.push(r[i + 1] === EventKind.PeaceHeld ? `${PEACE_ORDER[r[i + 2]!]}x${r[i + 3]}` : 'war');
    return out;
  };
  it('History: 89403 told once "none outmatches another" in two years; 55404 "too far" from day 91', { timeout: 180_000 }, () => {
    const a = world(89403, 3);
    days(a, 730);
    expect(told(a)).toEqual(['equalx3']);
    const b = world(55404, 3);
    days(b, 365);
    expect(told(b)).toEqual(['farx2']);
  });

  it('History: 89401 and 90441 tell no peace before their first war', { timeout: 180_000 }, () => {
    for (const [seed, n, d] of [[89401, 3, 180], [90441, 2, 100]] as const) {
      const sim = world(seed, n);
      days(sim, d);
      expect(told(sim)[0], `${seed}`).toBe('war');
    }
  });

  // R224 (critic run 91, R91-N2): 91415's nation 3 massed on 1 eleven times in fifteen years and sent no formation,
  // each one's nearest border point over the water or in a pocket shut in by 1's land. A formation refused at its
  // nearest point is sent to one another reached: the war comes in its second massing.
  it('91415: a massing whose nearest points are refused sends its army by another; at war by day 600, none with the nearest alone', { timeout: 240_000 }, () => {
    const at = (nearestOnly: boolean): number => {
      MASS_PROBE.nearestOnly = nearestOnly;
      try {
        const sim = world(91415, 3);
        for (let d = 0; d < 600; d++) {
          if (sim.world.wars.size > 0) return d;
          days(sim, 1);
        }
        return -1;
      } finally {
        delete MASS_PROBE.nearestOnly;
      }
    };
    expect(at(true)).toBe(-1);
    const d = at(false);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(600);
  });
});
