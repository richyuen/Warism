import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { SIDE_SHIPS, type HistoryRow } from '../../src/shared/history';
import { t } from '../../src/ui/i18n';
import { historyText } from '../../src/ui/historyText';

// ROADMAP R55h (critic run 55, small): "lost 1 ships" and "United States's air force". A sea battle's ships are by
// count; a name ending in s takes a bare apostrophe where a message has {name}'s.

const row = (kind: number, a: number, b: number, an: string, bn: string): HistoryRow => ({ tick: 0, kind, a, b, x: null, y: null, an, bn, of: '' });

describe('history wording (ROADMAP R55h)', () => {
  it('a sea battle: "lost 1 ship", "3 ships"', () => {
    const r = row(EventKind.SeaBattle, 1 + SIDE_SHIPS, 2 + 3 * SIDE_SHIPS, 'nation.GER', 'nation.ENG');
    expect(historyText(r)).toBe('Germany and United Kingdom fought at sea: Germany lost 1 ship, United Kingdom 3 ships');
  });

  it('a name ending in s: "United States\' air force"; others keep \'s', () => {
    expect(t('history.AirRaids', { a: 'United States', b: 'Japan', nb: '5' })).toMatch(/^United States' air force struck Japan/);
    expect(t('history.AirRaids', { a: 'Germany', b: 'Poland', nb: '5' })).toMatch(/^Germany's air force struck Poland/);
    expect(t('history.CapitalCaptured', { a: 'Netherlands', b: 'Germany' })).toBe("Germany captured Netherlands' capital");
  });
});
