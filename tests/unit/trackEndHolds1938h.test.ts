import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R84e (ADR-1063; critic run 69, R69-N1: Israel's 1982 war on Lebanon, held by the timeline to 2000, annexed
// Lebanon in the hour the track ended, on every seed, and on day 5 of a 1983 free game). A war a hold of the timeline's
// freezes as the track ends makes a white peace in that hour: no land changes hands by the score the hold kept. 1938's
// own: Japan's war on China, held to 1945, its score set to a conquest's.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe("the timeline's frozen wars as the track ends (ROADMAP R84e)", () => {
  it('a war a hold freezes makes a white peace in the hour the game is left free, the score it kept unspent', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 51283 } });
    sim.step(24, quiet);
    const w = sim.world;
    const [jap, chi] = [id('JAP'), id('CHI')];
    expect(w.holds(jap, chi)).toBe(true);
    const at = w.wars.between(jap, chi)!;
    // A score the attackers would conquer by.
    at.war.score = at.side === 0 ? 100 : -100;
    const chinaLand = w.landCounts().owned[chi]!;
    sim.command({ kind: 'leaveTrack' });
    const rows: number[][] = [];
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) rows.push([ev[i + 1]!, ev[i + 2]!, ev[i + 3]!]);
      quiet(x);
    });
    expect(w.track!.ended).toBe(true);
    expect(w.wars.atWar(jap, chi)).toBe(false);
    expect(rows.some(([k, a, b]) => k === EventKind.PeaceSigned && [a, b].sort().join() === [jap, chi].sort().join())).toBe(true);
    expect(rows.filter(([k, a]) => (k === EventKind.NationAnnexed || k === EventKind.PuppetCreated) && a === chi)).toEqual([]);
    expect(w.nations.cols.living[chi]).toBe(1);
    expect(w.landCounts().owned[chi]).toBe(chinaLand);
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
