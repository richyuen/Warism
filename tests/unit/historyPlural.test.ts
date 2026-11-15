import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { HistoryRow } from '../../src/shared/history';
import { historyText } from '../../src/ui/historyText';

// ROADMAP R84j (critic run 69): "Contras was annexed by Nicaragua", "FMLN was annexed by Honduras". A name that takes a
// plural verb (`nation.plural`) is told with the message's `.plural`; any other name as before.
const row = (kind: number, an: string, bn: string): HistoryRow => ({ tick: 0, kind, a: 1, b: 2, x: null, y: null, an, bn, of: '' });

describe('a plural name in the history (ROADMAP R84j)', () => {
  it('takes "were"', () => {
    expect(historyText(row(EventKind.NationAnnexed, 'nation.CTR', 'nation.NIC'))).toBe('Contras were annexed by Nicaragua');
    expect(historyText(row(EventKind.NationAnnexed, 'nation.FMN', 'nation.HON'))).toBe('FMLN were annexed by Honduras');
    expect(historyText(row(EventKind.NationEliminated, 'nation.LTE', ''))).toBe('Tamil Tigers were destroyed');
  });
  it('any other name, "was"', () => {
    expect(historyText(row(EventKind.NationAnnexed, 'nation.LEB', 'nation.ISR'))).toBe('Lebanon was annexed by Israel');
    expect(historyText(row(EventKind.NationAnnexed, 'nation.USA', 'nation.MEX'))).toBe('United States was annexed by Mexico');
  });
});
