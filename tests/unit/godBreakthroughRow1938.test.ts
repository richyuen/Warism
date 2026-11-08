import { describe, expect, it } from 'vitest';
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import { EventKind } from '../../src/shared/events';
import { filterHistory, kindName, NO_FILTER, TICKER_KINDS } from '../../src/shared/history';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import en from '../../src/ui/i18n/en.json' with { type: 'json' };
import { historyText } from '../../src/ui/historyText';
import { historyRows, tickerRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R49a (critic run 51, R51-N4): God Mode's Breakthrough at war (21151, Germany at war with Poland, from Berlin
// to Warsaw) was taken in silence: no mark, no ticker row. Now it is told: a `GodBreakthrough` row in the ticker and
// History, "God opened a breakthrough for Germany near …", at its start, in the type filter. At peace it is refused, and
// no row.

const { w: W, h: H } = SIZE_1938;
const GER = nationId('GER');
const POL = nationId('POL');
const nationName = (n: number): string => `nation.${NATIONS_1938[n - 1]?.tag ?? ''}`;
const defName = (d: number): string => cities1938.cities[d]?.name ?? '';
const cityName = (w: World) => (v: number): string => defName(w.cities.cols.def[v]!) || (w.cityNames.get(v) ?? '');

describe("God Mode's Breakthrough is told (ROADMAP R49a)", () => {
  it('21151: Germany at war with Poland, Berlin to Warsaw: a row in the ticker and History', () => {
    const s = new Sim({ scenario: '1938', seed: 21151, assets: assets1938(W) });
    s.step(1);
    s.command({ kind: 'declareWar', attacker: GER, defender: POL });
    s.step(1);
    const [bx, by] = cellOf(13.4, 52.52, W, H);
    const [wx, wy] = cellOf(21.01, 52.23, W, H);
    s.command({ kind: 'forceBreakthrough', nation: GER, x: bx, y: by, toX: wx, toY: wy });
    s.step(1);
    const w = s.world;
    const rows = historyRows(w, nationName, cityName(w), defName).filter((r) => r.kind === EventKind.GodBreakthrough);
    expect(rows, 'its History row').toHaveLength(1);
    const text = historyText(rows[0]!);
    expect(text).toMatch(/^God opened a breakthrough for Germany near .+$/);
    expect(TICKER_KINDS.has(EventKind.GodBreakthrough)).toBe(true);
    const tick = tickerRows(w, nationName, cityName(w), defName).find((r) => r.kind === EventKind.GodBreakthrough);
    expect(tick, 'its ticker row').toBeDefined();
    expect(Math.hypot(tick!.x - bx, tick!.y - by), 'at its start').toBeLessThan(1);
    // The ticker names the place as History does (ROADMAP R51a; critic run 52, R52-N4: "God opened a breakthrough for
    // Germany", no place, for a click 3 cells from Berlin).
    expect(historyText(tick!), 'the ticker row').toBe(text);
    expect(`history.type.${kindName(EventKind.GodBreakthrough)}` in en).toBe(true);
    expect(filterHistory(rows, { ...NO_FILTER, kind: EventKind.GodBreakthrough }, w.startDay)).toHaveLength(1);
  });

  it('at peace: refused, no row', () => {
    const s = new Sim({ scenario: '1938', seed: 21151, assets: assets1938(W) });
    s.step(1);
    const [bx, by] = cellOf(13.4, 52.52, W, H);
    s.command({ kind: 'forceBreakthrough', nation: nationId('SWI'), x: bx, y: by, toX: bx + 5, toY: by });
    s.step(1);
    expect(historyRows(s.world, nationName, cityName(s.world), defName).some((r) => r.kind === EventKind.GodBreakthrough)).toBe(false);
  });
});
