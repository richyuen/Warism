import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { filterHistory, NO_FILTER, SIDE_SHIPS, type HistoryRow } from '../../src/shared/history';

// ROADMAP R53f (critic run 54's idea from Europa Universalis' message log: a "my wars only" filter). History's "My
// wars only" keeps the war rows that name the nation played: wars declared, joined, left and ended, peace, battles
// won, sea and air war, raids, nukes, captures; not its economy, alliances or revolts, and not others' wars.

const ME = 7;
const FOE = 9;
const OTHER = 11;
const row = (kind: number, a: number, b: number): HistoryRow => ({ tick: 100, kind, a, b, x: null, y: null, an: '', bn: '', of: '' });

describe('History: my wars only (ROADMAP R53f)', () => {
  const rows: HistoryRow[] = [
    row(EventKind.WarDeclared, ME, FOE),
    row(EventKind.WarDeclared, FOE, OTHER),
    row(EventKind.PeaceSigned, FOE, ME),
    row(EventKind.MajorBattleEnded, 3, ME),
    row(EventKind.MajorBattleEnded, 4, FOE),
    row(EventKind.SeaBattle, ME + SIDE_SHIPS * 2, FOE + SIDE_SHIPS * 5),
    row(EventKind.AirWar, OTHER, FOE),
    row(EventKind.CapitalCaptured, FOE, ME),
    row(EventKind.Bankruptcy, ME, 0),
    row(EventKind.AllianceJoined, ME, 1),
    row(EventKind.RevoltSpawned, OTHER, ME),
  ];

  it('keeps the war rows naming the nation played, and only those', () => {
    const kept = filterHistory(rows, { ...NO_FILTER, mine: ME }, 0);
    expect(kept.map((r) => [r.kind, r.a % SIDE_SHIPS, r.b % SIDE_SHIPS])).toEqual([
      [EventKind.WarDeclared, ME, FOE],
      [EventKind.PeaceSigned, FOE, ME],
      [EventKind.MajorBattleEnded, 3, ME],
      [EventKind.SeaBattle, ME, FOE],
      [EventKind.CapitalCaptured, FOE, ME],
    ]);
  });

  it('off, or with no nation played, keeps every row', () => {
    expect(filterHistory(rows, NO_FILTER, 0)).toHaveLength(rows.length);
    expect(filterHistory(rows, { ...NO_FILTER, mine: null }, 0)).toHaveLength(rows.length);
  });

  it('goes with the other filters: of its war rows, the kind asked', () => {
    expect(filterHistory(rows, { ...NO_FILTER, mine: ME, kind: EventKind.WarDeclared }, 0)).toHaveLength(1);
  });
});
