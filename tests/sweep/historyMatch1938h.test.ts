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
  let peace: number[] = [];
  let east = 0;
  // Pairs at war (true) or not at the end of 11 December 1941, as history had them.
  const WARS: [string, string, boolean][] = [
    ['JAP', 'USA', true], ['JAP', 'ENG', true], ['JAP', 'AST', true], ['JAP', 'DEI', true], ['JAP', 'CHI', true], ['PHI', 'JAP', true],
    ['GER', 'USA', true], ['ITA', 'USA', true], ['GER', 'SOV', true], ['GER', 'ENG', true],
    ['JAP', 'SOV', false], ['USA', 'SOV', false], ['IRE', 'JAP', false], ['DEN', 'USA', false], ['SIA', 'ENG', false],
  ];
  let at11: boolean[] = [];
  let soviet = 0;
  // The states of Europe after Germany's surrender (R62h2), living or not on 1 June 1945.
  const STATES: [string, number][] = [
    ['GER', 0], ['VIC', 0], ['RSI', 0], ['SLO', 0], ['CRO', 0],
    ['FRA', 1], ['POL', 1], ['CZS', 1], ['YUG', 1], ['AUT', 1], ['NOR', 1], ['NED', 1], ['BEL', 1], ['GRE', 1], ['ALB', 1], ['HUN', 1],
  ];
  let living: number[] = [];
  const axis = new Set(['GER', 'FIN', 'ROM', 'HUN', 'ITA'].map(id));
  const [ru, rv] = project(24.1, 56.95);
  const riga = Math.floor(rv * SIZE_1938.h) * SIZE_1938.w + Math.floor(ru * SIZE_1938.w);
  const { maps, skipped } = runMatch(
    TIMELINE_1938H,
    (s) => log.push(s),
    '1945-06-02',
    (w, date) => {
      // The Soviet army rebuilt (R62h0): its land formations' men on 1 November 1942.
      if (date === '1942-11-01') w.formations.forEach((i) => {
        if (w.formations.cols.nation[i] === id('SOV') && w.rules?.templates[w.formations.cols.template[i]!]?.domain === 0) soviet += w.formations.cols.strength[i]!;
      });
      if (date === '1945-06-01') living = STATES.map(([t]) => w.nations.cols.living[id(t)]!);
      // The belligerents at the end of 11 December 1941 (R62g4).
      if (date === '1941-12-12') at11 = WARS.map(([a, b]) => w.wars.atWar(id(a), id(b)));
      // Occupations at peace past a month's start (1 August 1940): the occupied zone and the Baltic states held.
      if (date === '1940-08-01') peace = [w.cells.controller[paris]!, w.cells.owner[paris]!, w.cells.controller[riga]!];
      if (date === '1941-12-02') for (let c = 0; c < w.cells.owner.length; c++) if (w.cells.owner[c] === id('SOV') && axis.has(w.cells.controller[c]!)) east++;
      if (parisFell === '' && date >= '1940-06-01' && w.cells.controller[paris] === id('GER')) parisFell = date;
      // The land of France Germany took by the fighting, on the armistice's day.
      if (date === '1940-06-22') for (let c = 0; c < w.cells.owner.length; c++) if (w.cells.owner[c] === id('FRA') && w.cells.controller[c] === id('GER')) taken++;
    },
  );
  log.push(`Paris held by Germany from ${parisFell}; French cells held by Germany on 22 June 1940: ${taken}`);
  process.stderr.write(`${log.join('\n')}\n`);
  expect(maps.length).toBe(9);
  expect(living).toEqual(STATES.map((x) => x[1]));
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
  expect(peace).toEqual([id('GER'), id('VIC'), id('SOV')]);
  // Barbarossa (R62g3): the Axis holds ≥ 6,000 Soviet cells after the stage of 1 December 1941.
  process.stderr.write(`Soviet cells held by the Axis after the stage of 1 December 1941: ${east}
`);
  expect(east).toBeGreaterThanOrEqual(6000);
  expect(at11).toEqual(WARS.map((x) => x[2]));
  process.stderr.write(`The Soviet army on 1 November 1942: ${Math.round(soviet / 1000)}k men
`);
  expect(soviet).toBeGreaterThanOrEqual(2_000_000);
  for (const { date, control } of maps) {
    if (!control) continue;
    expect(control.movedRight, date).toBeGreaterThanOrEqual(0.9);
    expect(control.strayShare, date).toBeLessThan(0.005);
  }
}, 1_800_000);
