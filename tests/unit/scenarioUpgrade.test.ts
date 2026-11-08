import { describe, expect, it } from 'vitest';
import { missingSections, scenarioGaps } from '../../src/shared/stateCheck';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { decodeSections, encodeSections, hashSections } from '../../src/sim/core/sections';
import { upgradeState } from '../../src/sim/core/upgrade';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R53i (critic run 54, carried: the run-26 scenario file "made by an older version of Warism, and this one
// cannot start it"; it lacks `nations.traits` alone, ADR-822's): a scenario file that lacks only parts this version
// can add starts, with them added and said; one that lacks another part is refused as before.

const W = SIZE_1938.w;

describe('a scenario file of an older version (R53i)', () => {
  const s = new Sim({ scenario: '1938', seed: 3, assets: assets1938(W) });
  const { bytes } = s.exportScenario();
  const without = (b: Uint8Array, ...names: string[]): Uint8Array => encodeSections(decodeSections(b).filter((x) => !names.includes(x.name)));

  it('lacking nation traits: offered, and loaded with none', () => {
    expect([...s.world.nations.ids()].some((n) => s.world.nations.cols.traits[n] !== 0), 'the 1938 world has traits').toBe(true);
    const old = without(bytes, 'nations.traits');
    expect(missingSections(old)).toEqual(['nations.traits:u16']);
    expect(scenarioGaps(old)).toEqual({ missing: [], upgraded: ['traits'] });
    // Red before: the sim refused it.
    expect(() => new Sim({ scenario: '1938', seed: 9, assets: assets1938(W) }).load(old)).toThrow(/nations\.traits/);
    const up = upgradeState(old);
    expect(up.added).toEqual(['nations.traits:u16']);
    // The file's hash is of its sections as written (what the old version's `Sim.hash` gave).
    expect(up.fileHash).toBe(hashSections(decodeSections(old)) >>> 0);
    const t = new Sim({ scenario: '1938', seed: 9, assets: assets1938(W) });
    t.load(up.bytes);
    expect(missingSections(up.bytes)).toEqual([]);
    expect([...t.world.nations.ids()].every((n) => t.world.nations.cols.traits[n] === 0)).toBe(true);
    expect(t.tick).toBe(s.tick);
    t.step(48);
    expect(t.tick).toBe(s.tick + 48);
  });

  it('whole: nothing added, its hash its own', () => {
    expect(scenarioGaps(bytes)).toEqual({ missing: [], upgraded: [] });
    const up = upgradeState(bytes);
    expect(up.added).toEqual([]);
    expect(up.bytes).toBe(bytes);
    expect(up.fileHash).toBe(s.exportScenario().hash >>> 0);
  });

  it('lacking another part too: refused as before', () => {
    const old = without(bytes, 'nations.traits', 'formations.struck');
    const gaps = scenarioGaps(old);
    expect(gaps.missing.some((x) => x.startsWith('formations.struck:')), gaps.missing.join(', ')).toBe(true);
    expect(gaps.upgraded).toEqual(['traits']);
  });
});
