import { describe, expect, it } from 'vitest';
import { LISTED_SCENARIOS, SCENARIO_INFO } from '../../src/shared/scenarios';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { ADDED_1938H, NATIONS_1938H, SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62a (ADR-919): the historical track's scenario, `1938h`: 1938's world from 1938's own files, its own nations
// appended after 1938's 103, dormant (dead, no land, no core, no revival); plain 1938 untouched; its seed its own.

const step = (sim: Sim, hours: number): void =>
  sim.step(hours, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });

describe("the historical track's scenario (ROADMAP R62a)", () => {
  it("is 1938 with its own nations after 1938's, dormant; plain 1938 keeps its 103", () => {
    const plain = new Sim({ scenario: '1938', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }).world;
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    const w = sim.world;
    expect(NATIONS_1938.length).toBe(103);
    expect(plain.nations.count).toBe(NATIONS_1938.length);
    expect(w.nations.count).toBe(NATIONS_1938.length + ADDED_1938H.length);
    expect(ADDED_1938H.length).toBeGreaterThan(0);
    // The ids of 1938 hold: the same nations, the same land.
    for (let id = 1; id <= NATIONS_1938.length; id++) {
      expect(w.nations.cols.living[id], NATIONS_1938[id - 1]!.tag).toBe(plain.nations.cols.living[id]);
      expect(w.nations.cols.cells[id]).toBe(plain.nations.cols.cells[id]);
    }
    expect(Array.from(w.cells.owner)).toEqual(Array.from(plain.cells.owner));
    // Its own: dead, with no land, core or revival, named by its table.
    for (const [i, def] of ADDED_1938H.entries()) {
      const id = NATIONS_1938.length + i + 1;
      expect(NATIONS_1938H[id - 1]!.tag).toBe(def.tag);
      expect(SCENARIO_INFO['1938h'].nationTags[id - 1]).toBe(def.tag);
      expect(w.nations.cols.living[id], def.tag).toBe(0);
      expect(w.nations.cols.revivalsLeft[id]).toBe(0);
      expect(w.nations.cols.color[id]).toBe(Number.parseInt(def.color.slice(1), 16));
    }
    for (let p = 1; p < w.provinces.count; p++) expect(w.provinces.coresOf(p).every((n) => n <= NATIONS_1938.length)).toBe(true);
    // A month on, none of its own has come to be by any rule.
    step(sim, 24 * 30);
    for (let id = NATIONS_1938.length + 1; id <= w.nations.count; id++) expect(w.nations.cols.living[id]).toBe(0);
  });

  it('a save loads bit-identical, and the run after it is the uninterrupted one', () => {
    const a = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    step(a, 48);
    const bytes = a.save();
    const b = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    b.load(bytes);
    expect(b.save()).toEqual(bytes);
    step(a, 24);
    step(b, 24);
    expect(b.save()).toEqual(a.save());
  });

  it('has a seed of its own and is offered with no seed or option; listed on the title screen (R62m)', () => {
    expect(SCENARIO_INFO['1938h'].fixedSeed).toBe(SEED_1938H);
    expect(SCENARIO_INFO['1938'].fixedSeed).toBeUndefined();
    expect(SCENARIO_INFO['1938h'].startDay).toBe(SCENARIO_INFO['1938'].startDay);
    expect(SCENARIO_INFO['1938h'].geometry).toEqual(SCENARIO_INFO['1938'].geometry);
    // Hidden until the track replayed its years (R62a); listed after 1938 since the track runs to 1953 (R62m, ADR-948).
    expect(SCENARIO_INFO['1938h'].hidden).toBe(false);
    expect(LISTED_SCENARIOS.slice(0, 2)).toEqual(['1938', '1938h']);
  });
});
