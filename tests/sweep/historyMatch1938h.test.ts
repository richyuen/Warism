import { expect, it } from 'vitest';
import { project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { runMatch } from '../../tools/diag/historyMatch';

// ROADMAP R62f (SPEC §7.7, ADR-928): 1938h, its own seed, to 1 April 1940 against the timeline's maps of 1 October
// 1938, 1 April 1939 and 1 October 1939. Owned as history had it: ≥ 95 % of all land on each; of the land the maps moved
// since the start, ≥ 95 % moved so. Logged: the land the world moved and the maps did not, and the events passed over.
// With the China front held (R62f2, ADR-929): no event passed over, and under 0.2 % of land strayed. Where a map says who
// held what (R62g0, ADR-930): of the land whose holder it moved, ≥ 90 % held so, and under 0.5 % of land strayed.

it('1938-39: the land owned as history had it, and the events fire on their dates', () => {
  const log: string[] = [];
  const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
  const paris = (() => {
    const [u, v] = project(2.35, 48.86);
    return Math.floor(v * SIZE_1938.h) * SIZE_1938.w + Math.floor(u * SIZE_1938.w);
  })();
  // Paris (R62g1): who holds it each day from 14 June 1940, and whether the fighting took it before the timeline did.
  let parisFell = '';
  let taken = 0;
  const { maps, skipped, sim } = runMatch(
    TIMELINE_1938H,
    (s) => log.push(s),
    '1940-08-02',
    (w, date) => {
      if (parisFell === '' && date >= '1940-06-01' && w.cells.controller[paris] === id('GER')) parisFell = date;
      // The land of France Germany took by the fighting, on the armistice's day.
      if (date === '1940-06-22') for (let c = 0; c < w.cells.owner.length; c++) if (w.cells.owner[c] === id('FRA') && w.cells.controller[c] === id('GER')) taken++;
    },
  );
  log.push(`Paris held by Germany from ${parisFell}; French cells held by Germany on 22 June 1940: ${taken}`);
  process.stderr.write(`${log.join('\n')}\n`);
  expect(maps.length).toBe(5);
  for (const { date, cols } of maps) {
    expect(cols.whole, date).toBeGreaterThanOrEqual(0.95);
    expect(cols.movedRight, date).toBeGreaterThanOrEqual(0.95);
  }
  const named = (i: number): string => JSON.stringify(TIMELINE_1938H.events[i]);
  expect(skipped.map(named), 'passed over').toEqual([]);
  for (const { date, cols } of maps) expect(cols.strayShare, date).toBeLessThan(0.002);
  expect(maps.some((m) => m.control)).toBe(true);
  // Paris within 30 days of 14 June 1940, taken by the fighting: before the armistice's occupied zone (22 June).
  expect(parisFell).not.toBe('');
  expect(parisFell < '1940-06-22').toBe(true);
  // The robust measure (the date of Paris is chaotic; ADR-931): the offensive took ≥ 500 cells of France.
  expect(taken).toBeGreaterThanOrEqual(500);
  // Occupations at peace past a month's start (1 August 1940): the occupied zone and the Baltic states held.
  const w = sim.world;
  expect(w.cells.controller[paris]).toBe(id('GER'));
  expect(w.cells.owner[paris]).toBe(id('VIC'));
  const [ru, rv] = project(24.1, 56.95);
  const riga = Math.floor(rv * SIZE_1938.h) * SIZE_1938.w + Math.floor(ru * SIZE_1938.w);
  expect(w.cells.controller[riga]).toBe(id('SOV'));
  for (const { date, control } of maps) {
    if (!control) continue;
    expect(control.movedRight, date).toBeGreaterThanOrEqual(0.9);
    expect(control.strayShare, date).toBeLessThan(0.005);
  }
}, 1_800_000);
