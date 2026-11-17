import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { TICKER_KINDS, WAR_KINDS } from '../../src/shared/history';
import { cellOf } from '../../src/sim/data/terrain';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { historyText } from '../../src/ui/historyText';
import { historyRows, tickerRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R133 (critic run 75, R75-N2): a warhead's bomber stopped short of its target (`NukeIntercepted`) had no row
// in History or the ticker and no words. The United Kingdom at war with Germany (seed 1), a bomber's launch at Berlin
// whose wing is gone (lost on the way: `arrivals` stops it short, as `nukeGapShort1938`): a row that says who, where,
// and that the bomber was stopped; in the ticker; one of the war's rows.

const { w: W, h: H } = SIZE_1938;
const [ENG, GER] = ['ENG', 'GER'].map(nationId) as [number, number];
const berlin = cellOf(13.4, 52.52, W, H);
const name = (n: number): string => `nation.${NATIONS_1938[n - 1]!.tag}`;

describe("a warhead's bomber stopped short is told (ROADMAP R133)", () => {
  it('History and the ticker have its row: the nation, the city nearest the target, the bomber stopped', () => {
    const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = sim.world;
    w.wars.start([ENG], [GER], 0);
    w.nukeLaunches.push({ id: w.nextLaunchId++, nation: ENG, missile: 0, wing: 999_999, bx: 0, by: 0, tx: berlin[0], ty: berlin[1], launch: w.tick, arrive: w.tick + 1, yieldN: 1 });
    sim.step(2);
    const rows = historyRows(w, name, () => 'Berlin').filter((r) => r.kind === EventKind.NukeIntercepted);
    expect(rows).toHaveLength(1);
    const text = historyText(rows[0]!);
    expect(text).toBe("United Kingdom's bomber carrying a warhead was stopped short of its target near Berlin: no burst");
    expect(WAR_KINDS.has(EventKind.NukeIntercepted)).toBe(true);
    expect(TICKER_KINDS.has(EventKind.NukeIntercepted)).toBe(true);
    const ticker = tickerRows(w, name, () => 'Berlin').filter((r) => r.kind === EventKind.NukeIntercepted);
    expect(ticker).toHaveLength(1);
    expect(Math.hypot(ticker[0]!.x - berlin[0], ticker[0]!.y - berlin[1])).toBeLessThan(1);
    // No burst: none told.
    expect(historyRows(w, name, () => '').filter((r) => r.kind === EventKind.NukeCasualties)).toEqual([]);
  }, 300_000);
});
