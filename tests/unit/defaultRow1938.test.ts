import { describe, expect, it } from 'vitest';
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import { EventKind } from '../../src/shared/events';
import { HISTORY_STRIDE } from '../../src/sim/history';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { COLLAPSE_MONTHS, collapseNation } from '../../src/sim/systems/revival';
import type { World } from '../../src/sim/world';
import { historyText } from '../../src/ui/historyText';
import { historyRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R7: after COLLAPSE_MONTHS bankrupt months a nation with nothing to fragment had its debts
// voided with no row, and the history never said why its gold went to 0 (R4a's checker: Poland on
// 7019, day 151). The default is now a row of its own, with the debt voided.

const POL = nationId('POL');
const nationName = (n: number): string => `nation.${NATIONS_1938[n - 1]?.tag ?? ''}`;
const defName = (d: number): string => cities1938.cities[d]?.name ?? '';
const cityName = (w: World) => (v: number): string => defName(w.cities.cols.def[v]!) || (w.cityNames.get(v) ?? '');
const kindsOf = (w: World): number[] => {
  const out: number[] = [];
  for (let i = 0; i < w.history.rows.length; i += HISTORY_STRIDE) out.push(w.history.rows[i + 1]!);
  return out;
};

describe('a default says so (ROADMAP R7)', () => {
  it('a bankrupt nation with nothing to fragment defaults: its debts void, told by a row', () => {
    const s = new Sim({ scenario: '1938', seed: 99, assets: assets1938(SIZE_1938.w) });
    const w = s.world;
    const nc = w.nations.cols;
    nc.gold[POL] = -500.4;
    nc.bankrupt[POL] = 1;
    nc.brokeMonths[POL] = COLLAPSE_MONTHS;
    collapseNation(w, POL);
    s.step(1);
    expect(nc.living[POL], 'Poland lives').toBe(1);
    expect(nc.gold[POL], 'its debts void').toBeGreaterThanOrEqual(0);
    const kinds = kindsOf(w);
    expect(kinds, 'no collapse: nothing was fragmented').not.toContain(EventKind.NationCollapsed);
    const row = historyRows(w, nationName, cityName(w), defName).find((r) => r.kind === EventKind.NationDefaulted)!;
    expect(row, 'the default has a row').toBeDefined();
    expect([row.a, row.b]).toEqual([POL, 500]);
    expect(historyText(row)).toBe('Poland defaulted: its debts were voided');
  });
});
