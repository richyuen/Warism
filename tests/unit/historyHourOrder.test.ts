import { describe, expect, it } from 'vitest';
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import { EventKind } from '../../src/shared/events';
import { newestHourFirst, type HistoryRow } from '../../src/shared/history';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { historyRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';

// ROADMAP R49b (critic run 51, R51-N5): History showed every row reversed, newest first, so within an hour a puppet's
// release stood under the "left its war" rows it caused; the ticker (R43d) tells the release first. History now shows
// the newest hour first and each hour's rows in their logged order: on 20429 (the critic's case, random diplomacy, the Dutch East Indies
// freed in July 1939) the release above its wars left. Since ADR-883 (R53g, a Major Battle through a lull of a day)
// 20429 has no release in the hour of a war left in three years, nor 20431–20439 and 20443–20451; 20441 has one on
// day 517 (the six seeds' wars, peaces, puppets and releases summed the same on both rules: a coincidence of an hour).

const { w: W } = SIZE_1938;
const nationName = (n: number): string => `nation.${NATIONS_1938[n - 1]?.tag ?? ''}`;
const defName = (d: number): string => cities1938.cities[d]?.name ?? '';
const cityName = (w: World) => (v: number): string => defName(w.cities.cols.def[v]!) || (w.cityNames.get(v) ?? '');

describe('History: the newest hour first, each hour as logged (ROADMAP R49b)', () => {
  it('orders by hour, keeping the order within an hour', () => {
    const r = (tick: number, kind: number): { tick: number; kind: number } => ({ tick, kind });
    const rows = [r(1, 1), r(2, 10), r(2, 11), r(2, 12), r(3, 5), r(5, 7), r(5, 8)];
    expect(newestHourFirst(rows).map((x) => `${x.tick}:${x.kind}`)).toEqual(['5:7', '5:8', '3:5', '2:10', '2:11', '2:12', '1:1']);
    expect(newestHourFirst([])).toEqual([]);
  });

  // Since ADR-887 (R53l: a puppet joins a war only within reach) none of 20429–20441 (odd) has a release in the hour of a
  // war left in three years: the case is made, not found. The United Kingdom declares on Italy at the 1938 start
  // (Egypt, at Libya, joins it); a day later Egypt forces war on the United Kingdom: it goes free and leaves the war it
  // fought beside it in, in the hour (PLAN 7.191, as the critic's puppets did).
  it("a release's hour shows the release above the wars it left", { timeout: 600_000 }, () => {
    const s = new Sim({ scenario: '1938', seed: 20441, assets: assets1938(W) });
    const id = (t: string): number => NATIONS_1938.findIndex((n) => n.tag === t) + 1;
    const [ENG, ITA, EGY] = [id('ENG'), id('ITA'), id('EGY')];
    s.command({ kind: 'declareWar', attacker: ENG, defender: ITA });
    s.step(24);
    expect(s.world.wars.atWar(EGY, ITA), 'Egypt in the war').toBe(true);
    s.command({ kind: 'forceWar', attacker: EGY, defender: ENG });
    s.step(1);
    const rows: HistoryRow[] = historyRows(s.world, nationName, cityName(s.world), defName);
    const found = rows.find((x) => x.kind === EventKind.PuppetReleased && rows.some((y) => y.tick === x.tick && y.kind === EventKind.WarLeft && y.a === x.a));
    expect(found, 'a release with its wars left').toBeDefined();
    const shown = newestHourFirst(rows).filter((x) => x.tick === found!.tick && x.a === found!.a && (x.kind === EventKind.PuppetReleased || x.kind === EventKind.WarLeft));
    expect(shown[0]!.kind, 'the release first in its hour').toBe(EventKind.PuppetReleased);
    expect(shown.filter((x) => x.kind === EventKind.WarLeft).length).toBeGreaterThan(0);
    // As before the change, every row reversed: the release last.
    const reversed = [...rows].reverse().filter((x) => shown.includes(x));
    expect(reversed[reversed.length - 1]!.kind, 'reversed, it stood last').toBe(EventKind.PuppetReleased);
  });
});
