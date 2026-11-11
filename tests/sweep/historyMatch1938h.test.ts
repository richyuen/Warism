import { expect, it } from 'vitest';
import { dayOfIso } from '../../src/shared/calendar';
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
  // After Japan's surrender (R62h3): its foes, and the nations living or not on 26 October 1945.
  const ASIA: [string, number][] = [['JAP', 1], ['MAN', 0], ['MEN', 0], ['MAL', 1], ['SAR', 1], ['DEI', 1]];
  let japFoes = -1;
  // 1946-49 (R62i1): the new states living, the old ones gone, and no war left on 1 January 1950.
  const NEW: [string, number][] = [['ISR', 1], ['PAL', 0], ['PAK', 1], ['KOR', 1], ['PRK', 1], ['FRG', 1], ['GDR', 1], ['IDN', 1], ['DEI', 1]];
  let born: number[] = [];
  let wars1950 = -1;
  // The civil war (R62i2): the seats at Beijing and Taipei on 1 June 1950, the fighting over, no Soviet pledge to the Republic.
  const seat = (lon: number, lat: number): [number, number] => {
    const [u, v] = project(lon, lat);
    return [u * SIZE_1938.w, v * SIZE_1938.h];
  };
  let seats: number[] = [];
  let china = '';
  // The Korean War's end (R62i3): on 28 July 1953, the day after the armistice and the track's end, no war; both Koreas.
  let end53 = '';
  // The war's loose ends (R62i0): the Axis pact gone, the surrendered fleets and wings not handed on.
  let axisPact = true;
  const fleets = new Map<string, number>();
  const fleetOf = (w: Parameters<NonNullable<Parameters<typeof runMatch>[3]>>[0], t: string): number => {
    let k = 0;
    w.formations.forEach((i) => {
      if (w.formations.cols.nation[i] === id(t) && w.rules?.templates[w.formations.cols.template[i]!]?.domain !== 0) k++;
    });
    return k;
  };
  let asia: number[] = [];
  const axis = new Set(['GER', 'FIN', 'ROM', 'HUN', 'ITA'].map(id));
  const [ru, rv] = project(24.1, 56.95);
  const riga = Math.floor(rv * SIZE_1938.h) * SIZE_1938.w + Math.floor(ru * SIZE_1938.w);
  const { maps, skipped, nukes } = runMatch(
    TIMELINE_1938H,
    (s) => log.push(s),
    '1953-07-29',
    (w, date) => {
      // The Soviet army rebuilt (R62h0): its land formations' men on 1 November 1942.
      if (date === '1942-11-01') w.formations.forEach((i) => {
        if (w.formations.cols.nation[i] === id('SOV') && w.rules?.templates[w.formations.cols.template[i]!]?.domain === 0) soviet += w.formations.cols.strength[i]!;
      });
      if (date === '1945-06-01') living = STATES.map(([t]) => w.nations.cols.living[id(t)]!);
      if (date === '1945-05-07' || date === '1945-05-09') fleets.set(`SOV ${date}`, fleetOf(w, 'SOV'));
      if (date === '1945-09-03') fleets.set('JAP', fleetOf(w, 'JAP'));
      if (date === '1953-07-28') end53 = `${w.wars.list.length} ${w.track?.ended} ${w.nations.cols.living[id('KOR')]} ${w.nations.cols.living[id('PRK')]}`;
      if (date === '1950-06-01') {
        const nc = w.nations.cols;
        const far = (t: string, lon: number, lat: number): number => {
          const [x, y] = seat(lon, lat);
          return Math.hypot(nc.capitalX[id(t)]! - x, nc.capitalY[id(t)]! - y);
        };
        seats = [far('CCP', 116.4, 39.9), far('CHI', 121.56, 25.04)];
        china = `${w.wars.atWar(id('CHI'), id('CCP'))} ${w.alliances.guarantees.some((g) => g.target === id('CHI'))}`;
      }
      if (date === '1950-01-01') {
        born = NEW.map(([t]) => w.nations.cols.living[id(t)]!);
        wars1950 = w.wars.list.length;
      }
      if (date === '1945-10-26') {
        axisPact = w.alliances.list.some((a) => a.nameKey === 'alliance.anti_comintern');
        asia = ASIA.map(([t]) => w.nations.cols.living[id(t)]!);
        japFoes = 0;
        w.nations.forEach((n) => {
          if (w.nations.cols.living[n] === 1 && w.wars.atWar(id('JAP'), n)) japFoes++;
        });
      }
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
  expect(maps.length).toBe(12);
  expect(end53).toBe('0 true 1 1');
  expect(asia).toEqual(ASIA.map((x) => x[1]));
  expect(japFoes).toBe(0);
  expect(axisPact).toBe(false);
  expect(born).toEqual(NEW.map((x) => x[1]));
  expect(wars1950).toBe(1);
  for (const d of seats) expect(d).toBeLessThan(4);
  expect(seats.length).toBe(2);
  expect(china).toBe('false false');
  expect(fleets.get('JAP')).toBe(0);
  expect(fleets.get('SOV 1945-05-09')).toBe(fleets.get('SOV 1945-05-07'));
  // The two scripted strikes, the only nuclear ones (R62h3): the United States', on their hours, where they were.
  const at = (lon: number, lat: number): [number, number] => {
    const [u, v] = project(lon, lat);
    return [u * SIZE_1938.w, v * SIZE_1938.h];
  };
  const hour = (iso: string, h: number): number => (dayOfIso(iso) - dayOfIso('1938-01-01')) * 24 + h;
  expect(nukes).toEqual([
    [hour('1945-08-06', 8), id('USA'), 1, ...at(132.46, 34.39)],
    [hour('1945-08-09', 11), id('USA'), 1, ...at(129.87, 32.75)],
  ]);
  expect(living).toEqual(STATES.map((x) => x[1]));
  for (const { date, cols } of maps) {
    expect(cols.whole, date).toBeGreaterThanOrEqual(0.95);
    expect(cols.movedRight, date).toBeGreaterThanOrEqual(0.95);
  }
  const named = (i: number): string => JSON.stringify(TIMELINE_1938H.events[i]);
  expect(skipped.map(named), 'passed over').toEqual([]);
  for (const { date, cols } of maps) expect(cols.strayShare, date).toBeLessThan(0.002);
  expect(maps.some((m) => m.control)).toBe(true);
  // Paris within 30 days of 14 June 1940, taken by the fighting: before the armistice's occupied zone (22 June). Re-scoped
  // to "by the armistice" in R62l (ADR-949); restored by R63 (ADR-951), the track's objectives taken as threatened.
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
}, 3_600_000);
