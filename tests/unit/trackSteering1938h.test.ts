import { afterEach, describe, expect, it } from 'vitest';
import { OP_PROBE, type SectorsSeen } from '../../src/sim/ai/operational';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { kmPerCell, project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { TRACK_PROBE } from '../../src/sim/track';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62e (SPEC §7.7): a war objective weights the operational AI's sectors. On a test war (Germany on Poland) with
// one objective (Warsaw), Germany's strength allotted to the sectors within it, from one save, with the objective and
// without (TRACK_PROBE.objectivesOff): at least twice. The diplomacy off while the track runs is the 2-year probe's.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const WARSAW: [number, number] = [21.01, 52.23];
const KM = 300;
const TL: TimelineFile = {
  events: [
    { date: '1938-01-02', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
    { date: '1938-01-02', kind: 'objective', nation: 'GER', at: WARSAW, km: KM, until: '1938-06-01' },
  ],
};

const make = (): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TL);
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

/** Germany's strength in its plans' sectors within the objective and in all, over `days` from the save. */
function allotted(bytes: Uint8Array, days: number, off: boolean): { near: number; all: number } {
  const sim = make();
  sim.load(bytes);
  const { w, h } = sim.world.cells;
  const [u, v] = project(WARSAW[0], WARSAW[1]);
  const r = KM / kmPerCell(w);
  const GER = id('GER');
  let near = 0;
  let all = 0;
  OP_PROBE.sectors = (s: SectorsSeen): void => {
    if (s.nation !== GER) return;
    for (const x of s.sectors) {
      all += x.strength;
      if ((x.cx - u * w) ** 2 + (x.cy - v * h) ** 2 <= r * r) near += x.strength;
    }
  };
  TRACK_PROBE.objectivesOff = off;
  sim.step(days * 24, quiet);
  return { near, all };
}

afterEach(() => {
  delete OP_PROBE.sectors;
  delete TRACK_PROBE.objectivesOff;
});

describe("the historical track's steering (ROADMAP R62e)", () => {
  it("an objective at least doubles the strength the attacker's plans put in the sectors within it (A/B from one save)", () => {
    const sim = make();
    sim.step(5 * 24, quiet);
    expect(sim.world.wars.atWar(id('GER'), id('POL'))).toBe(true);
    const bytes = sim.save();
    const on = allotted(bytes, 6, false);
    const off = allotted(bytes, 6, true);
    process.stderr.write(`objective: near ${Math.round(on.near)} of ${Math.round(on.all)} with it, ${Math.round(off.near)} of ${Math.round(off.all)} without\n`);
    expect(off.all).toBeGreaterThan(0);
    expect(on.near).toBeGreaterThanOrEqual(2 * off.near);
    expect(on.near).toBeGreaterThan(0);
  });

  it('the world is steered while the track runs, and free after its end', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, { end: '1938-01-02', events: [] });
    expect(sim.world.steered).toBe(true);
    sim.step(30, quiet);
    expect(sim.world.steered).toBe(false);
  });
});
