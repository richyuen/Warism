import { expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { historyRows, tickerRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';

// ROADMAP R65c (critic run 63): on 18 August 1945 History had "Manchukuo was destroyed", "Mengjiang was destroyed" and
// "Manchukuo and Mengjiang dissolved: China in name". A transfer told by its note is told by the note alone: not again
// as the land handed over (its hour) or the nations' ends (the hour after). Another nation's end is told as before.
it("a transfer told by its note: not again as land handed over or a nation destroyed", () => {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
  const w = sim.world;
  const t = w.track!;
  const j = t.events.findIndex((e) => e.note?.startsWith('Manchukuo and Mengjiang dissolved'));
  expect(j).toBeGreaterThanOrEqual(0);
  const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
  const [chi, man, men, ger] = [id('CHI'), id('MAN'), id('MEN'), id('GER')];
  const at = t.ticks[j]!;
  w.history.rows.length = 0;
  w.history.record(at, EventKind.LandCeded, chi, man, 10, 10);
  w.history.record(at, EventKind.LandCeded, chi, men, 10, 10);
  w.history.record(at, EventKind.TrackEvent, j + 1, chi, 10, 10);
  w.history.record(at + 1, EventKind.NationEliminated, man, 0, NaN, NaN);
  w.history.record(at + 1, EventKind.NationEliminated, men, 0, NaN, NaN);
  w.history.record(at + 1, EventKind.NationEliminated, ger, 0, NaN, NaN);
  w.tick = at + 2;
  const name = (n: number): string => `nation.${TAGS_1938H[n - 1]}`;
  for (const rows of [historyRows(w, name, () => ''), tickerRows(w, name)]) {
    const kinds = rows.map((r) => [r.kind, r.a]);
    expect(kinds).toContainEqual([EventKind.TrackEvent, j + 1]);
    expect(kinds).toContainEqual([EventKind.NationEliminated, ger]);
    expect(kinds).not.toContainEqual([EventKind.NationEliminated, man]);
    expect(kinds).not.toContainEqual([EventKind.NationEliminated, men]);
    expect(rows.filter((r) => r.kind === EventKind.LandCeded)).toEqual([]);
  }
});

// ROADMAP R70a (critic run 64, R64-N3): only the told transfer's own land rows go. On 8 May 1945 Hungary's land went to
// the Soviet Union at 00:00 ("Carpatho-Ukraine…") and to Czechoslovakia, born, at 01:00; that row was hidden too.
it("a told transfer hides no other land row of its hour or the next", () => {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
  const w = sim.world;
  const t = w.track!;
  const j = t.events.findIndex((e) => e.note?.startsWith('Carpatho-Ukraine, Soviet in fact'));
  expect(j).toBeGreaterThanOrEqual(0);
  const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
  const [sov, hun, czs] = [id('SOV'), id('HUN'), id('CZS')];
  const at = t.ticks[j]!;
  w.history.rows.length = 0;
  w.history.record(at, EventKind.LandCeded, sov, hun, 10, 10);
  w.history.record(at, EventKind.TrackEvent, j + 1, sov, 10, 10);
  w.history.record(at, EventKind.LandCeded, czs, hun, 10, 10);
  w.history.record(at + 1, EventKind.LandCeded, czs, hun, 10, 10);
  w.tick = at + 2;
  const name = (n: number): string => `nation.${TAGS_1938H[n - 1]}`;
  // History's (land handed over is not a ticker row).
  const ceded = historyRows(w, name, () => '')
    .filter((r) => r.kind === EventKind.LandCeded)
    .map((r) => [r.tick, r.a, r.b]);
  expect(ceded).not.toContainEqual([at, sov, hun]);
  expect(ceded).toContainEqual([at, czs, hun]);
  expect(ceded).toContainEqual([at + 1, czs, hun]);
});
