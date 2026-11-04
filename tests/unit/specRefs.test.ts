import { describe, expect, it } from 'vitest';
import { judge, loadCorpus, specMisses } from '../../tools/spec/refs';

/**
 * ROADMAP R6, ADR-821: a section of SPEC.md rewritten as the game is names only files, code and
 * scripts that exist. Each part of R6 adds its section here.
 */
const REWRITTEN = ['1', '2', '3', '4', '5', '6', '10'];

describe('SPEC.md names what exists', () => {
  const corpus = loadCorpus();

  it('the checker tells a stale name from a live one', () => {
    expect(judge('tools/gate/check.ts', corpus)).toBeNull();
    expect(judge('systems/air.ts', corpus)).toBeNull();
    expect(judge('data/scenarios/<id>/scenario.json', corpus)).toBeNull();
    expect(judge('World.cellPoint', corpus)).toBeNull();
    expect(judge('npm run check:review', corpus)).toBeNull();
    expect(judge('tools/gate/criticDue.ts', corpus)).not.toBeNull();
    expect(judge('npm run parity', corpus)).not.toBeNull();
    expect(judge('isCapitalOfNowhere', corpus)).not.toBeNull();
  });

  for (const s of REWRITTEN) {
    it(`§${s}: every path, name and script it cites exists`, () => {
      expect(specMisses(s, corpus).map((m) => `${m.line}: ${m.span} (${m.why})`)).toEqual([]);
    });
  }
});
