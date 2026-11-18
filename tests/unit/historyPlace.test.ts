import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { HISTORY_PLACED, HISTORY_UNPLACED, historyPlace, type HistoryRow } from '../../src/shared/history';
import { HISTORY_KINDS } from '../../src/sim/history';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { annexNation } from '../../src/sim/systems/puppets';
import type { World } from '../../src/sim/world';
import { historyRows } from '../../src/worker/historyRows';
import { at1938 } from '../helpers/checkpoint';
import { assets1938 } from '../helpers/earth';

// ROADMAP R141: a row of History with a place is a link to it, as the ticker's rows are; a row with none is not. Which
// kinds have a place is one list (`HISTORY_PLACED`); the log's x and y of the others are no place, or other numbers.

const row = (kind: number, x: number | null, y: number | null): HistoryRow => ({ tick: 1, kind, a: 1, b: 2, x, y, an: '', bn: '', of: '' });
const rowsOf = (w: World): HistoryRow[] => historyRows(w, (id) => `n${id}`, (c) => `c${c}`);

/** Every placed row of the world's History is a point of its map. */
function placesOnMap(w: World): Map<number, number> {
  const kinds = new Map<number, number>();
  for (const r of rowsOf(w)) {
    const p = historyPlace(r);
    if (!p) continue;
    const [x, y] = p;
    expect(x >= 0 && x <= w.cells.w && y >= 0 && y <= w.cells.h, `kind ${r.kind} at tick ${r.tick}: (${x}, ${y})`).toBe(true);
    kinds.set(r.kind, (kinds.get(r.kind) ?? 0) + 1);
  }
  return kinds;
}

describe("History's places (ROADMAP R141)", () => {
  it('each kind of the log is placed or not, never both', () => {
    for (const k of HISTORY_KINDS) expect(HISTORY_PLACED.has(k) !== HISTORY_UNPLACED.has(k), `kind ${k}`).toBe(true);
    for (const k of [...HISTORY_PLACED, ...HISTORY_UNPLACED]) expect(HISTORY_KINDS.has(k), `kind ${k}`).toBe(true);
  });

  it('a row whose numbers are no place is no link', () => {
    // The bonds a forced war broke, why a nation joined, why the track passed over an event, a peace at the track's end.
    expect(historyPlace(row(EventKind.BondsBroken, null, 5))).toBeNull();
    expect(historyPlace(row(EventKind.WarJoined, null, 1))).toBeNull();
    expect(historyPlace(row(EventKind.TrackSkipped, null, 3))).toBeNull();
    expect(historyPlace(row(EventKind.PeaceSigned, null, null))).toBeNull();
    expect(historyPlace(row(EventKind.WarDeclared, 10, 10))).toBeNull();
    // A placed kind without its numbers.
    expect(historyPlace(row(EventKind.CapitalCaptured, null, null))).toBeNull();
    expect(historyPlace(row(EventKind.SeaBattle, Number.NaN, 4))).toBeNull();
    expect(historyPlace(row(EventKind.MajorBattleStarted, 12.5, 40.5))).toEqual([12.5, 40.5]);
  });

  it("an annexation's place is its target's capital, as the ticker's", () => {
    const s = new Sim({ scenario: '1938', seed: 7, assets: assets1938(SIZE_1938.w) });
    const w = s.world;
    const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;
    const [GER, AUT] = [id('GER'), id('AUT')];
    expect(AUT).toBeGreaterThan(0);
    const at = [w.nations.cols.capitalX[AUT]!, w.nations.cols.capitalY[AUT]!];
    expect(annexNation(w, GER, AUT)).toBe(true);
    s.step(1);
    const r = rowsOf(w).find((x) => x.kind === EventKind.NationAnnexed && x.a === AUT)!;
    expect(r).toBeDefined();
    expect(historyPlace(r)).toEqual(at);
  });

  it('every placed row of a long 1938 game is on the map', () => {
    const kinds = placesOnMap(at1938(11, 24 * 365 * 3).world);
    // The kinds of a plain game's first years: battles, capitals taken, revolts, land that went over.
    for (const k of [EventKind.MajorBattleStarted, EventKind.CapitalCaptured, EventKind.LandCeded]) expect(kinds.get(k) ?? 0, `kind ${k}`).toBeGreaterThan(0);
  }, 600_000);

  it("every placed row of the historical track's first year is on the map", () => {
    const s = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    s.step(24 * 365, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
    const kinds = placesOnMap(s.world);
    // The track's 1938: the Anschluss, Munich's land, its events by their names.
    expect(kinds.get(EventKind.NationAnnexed) ?? 0).toBeGreaterThan(0);
  }, 600_000);
});
