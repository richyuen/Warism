import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R84e (ADR-1063; critic run 69, R69-N1: Israel's 1982 war on Lebanon, held by the timeline to 2000, annexed
// Lebanon in the hour the track ended, on every seed, and on day 5 of a 1983 free game) and R85b (ADR-1067; critic run
// 70's objection, the user's word: a God act in the 1942 replay ended the Second World War). As the track ends, a war a
// hold freezes past the timeline's end makes a white peace in that hour: no land changes hands by the score the hold
// kept. Any other held war goes on, its occupations kept, its score counted from the one it had and its clocks from
// the end. 1938's own: Japan's war on China, held to 1945.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe("the timeline's frozen wars as the track ends (ROADMAP R84e, R85b)", () => {
  it('a war a hold freezes past the timeline makes a white peace at its end, the score it kept unspent', () => {
    // A test timeline ending on 3 January, Japan's war on China held to 1945.
    const timeline: TimelineFile = { end: '1938-01-03', events: [{ date: '1938-01-01', hour: 1, kind: 'hold', sides: [['JAP'], ['CHI']], until: '1945-09-02' }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);
    sim.step(24, quiet);
    const w = sim.world;
    const [jap, chi] = [id('JAP'), id('CHI')];
    expect(w.holds(jap, chi)).toBe(true);
    const at = w.wars.between(jap, chi)!;
    const chinaLand = w.landCounts().owned[chi]!;
    const rows: number[][] = [];
    while (!w.track!.ended) {
      // A score the attackers would conquer by.
      at.war.score = at.side === 0 ? 100 : -100;
      sim.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) rows.push([ev[i + 1]!, ev[i + 2]!, ev[i + 3]!]);
        quiet(x);
      });
    }
    expect(w.wars.atWar(jap, chi)).toBe(false);
    expect(rows.some(([k, a, b]) => k === EventKind.PeaceSigned && [a, b].sort().join() === [jap, chi].sort().join())).toBe(true);
    expect(rows.filter(([k, a]) => (k === EventKind.NationAnnexed || k === EventKind.PuppetCreated) && a === chi)).toEqual([]);
    expect(w.nations.cols.living[chi]).toBe(1);
    expect(w.landCounts().owned[chi]).toBe(chinaLand);
  });

  it('a war held to a date within the timeline goes on as the game is left, counted from then', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 51283 } });
    sim.step(24, quiet);
    const w = sim.world;
    const [jap, chi] = [id('JAP'), id('CHI')];
    expect(w.holds(jap, chi)).toBe(true);
    const war = w.wars.between(jap, chi)!.war;
    const kept = war.score;
    sim.command({ kind: 'leaveTrack' });
    sim.step(1, quiet);
    expect(w.track!.ended).toBe(true);
    const left = w.tick - 1;
    expect(w.wars.list.includes(war)).toBe(true);
    expect(war.scoreFrom).toBe(kept);
    expect(war.startTick).toBe(left);
    // A day on: the score counts the ground won since, about none.
    sim.step(24, quiet);
    expect(w.wars.list.includes(war)).toBe(true);
    expect(Math.abs(war.score)).toBeLessThanOrEqual(5);
  });

  it('a war no hold freezes goes on', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 51283 } });
    sim.step(24, quiet);
    const w = sim.world;
    const spanish = w.wars.list.filter((war) => war.sides.flat().every((n) => !war.sides.flat().some((m) => w.holds(n, m))));
    expect(spanish.length).toBeGreaterThan(0);
    sim.command({ kind: 'leaveTrack' });
    sim.step(1, quiet);
    for (const war of spanish) expect(w.wars.list.includes(war)).toBe(true);
  });
});
