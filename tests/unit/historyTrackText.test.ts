import { expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { HistoryRow } from '../../src/shared/history';
import { historyText } from '../../src/ui/historyText';

// ROADMAP R64d (critic run 62, R62-N4): an annexation the timeline tells by its note reads as the note alone; any other
// annexation reads as before.
const row = (extra: Partial<HistoryRow>): HistoryRow => ({ tick: 0, kind: EventKind.NationAnnexed, a: 1, b: 2, x: null, y: null, an: '=Germany', bn: '=Soviet Union', of: '', ...extra });

it("a timeline's annexation told by its note", () => {
  expect(historyText(row({ as: 'track', note: 'The Reich ends: the four zones, and the rest under Soviet rule to the Oder' }))).toBe(
    'The Reich ends: the four zones, and the rest under Soviet rule to the Oder',
  );
  expect(historyText(row({}))).toBe('Germany was annexed by Soviet Union');
});
