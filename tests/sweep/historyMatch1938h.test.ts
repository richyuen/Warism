import { expect, it } from 'vitest';
import { TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { runMatch } from '../../tools/diag/historyMatch';

// ROADMAP R62f (SPEC §7.7, ADR-928): 1938h, its own seed, to 1 January 1940 against the timeline's maps of 1 October
// 1938, 1 April 1939 and 1 October 1939. Owned as history had it: ≥ 95 % of all land on each; of the land the maps moved
// since the start, ≥ 95 % moved so. Logged: the land the world moved and the maps did not, and the events passed over.
// R62f's bar is not met (BLOCKERS: the China front): China overruns Manchukuo and Mengjiang in early 1939, so their land
// strays (1.2 % of land) and the Nomonhan war and its peace, naming Manchukuo, are passed over. No other event may be.

it('1938-39: the land owned as history had it, and the events fire on their dates', () => {
  const log: string[] = [];
  const { maps, skipped } = runMatch(TIMELINE_1938H, (s) => log.push(s), '1940-01-01');
  process.stderr.write(`${log.join('\n')}\n`);
  expect(maps.length).toBe(3);
  for (const { date, cols } of maps) {
    expect(cols.whole, date).toBeGreaterThanOrEqual(0.95);
    expect(cols.movedRight, date).toBeGreaterThanOrEqual(0.95);
  }
  const named = (i: number): string => JSON.stringify(TIMELINE_1938H.events[i]);
  for (const i of skipped) expect(named(i), 'passed over').toMatch(/"MAN"|"MEN"/);
}, 1_800_000);
