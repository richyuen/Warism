import { describe, expect, it } from 'vitest';
import type { Admin1Meta } from '../../src/shared/admin1';
import { deltaE, parseHex } from '../../src/shared/color';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { NATIONS_1938H, SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { referenceOwners } from '../../tools/diag/historyMatch';
import { assets1938 } from '../helpers/earth';
import { neighbourPairs } from '../helpers/neighbours';

// ROADMAP R84d (critic run 69, R69-B4: Georgia drawn in Russia's red, ΔE 1.3; Kazakhstan and Uzbekistan 8.5, Ukraine
// and Moldova 10.2, Russia and Transnistria 14.3, against R80d's "colours distinct"). The colours of the replay's land
// neighbours, ΔE (CIE76) by the nations' colours in the data, on the timeline's maps (each laid over the start, as
// `historyMatch1938h` reads them): on the last, the track's end, every two at least END_DE, the bar the critic set; on
// the start and every earlier map at least 1938's bar (`nations.test`, 15); and every nation the timeline gives birth
// to END_DE from each it is born from, wherever their borders lie. The world's own map at the end: `historyTrack1938h`.

const END_DE = 30;
const EARLIER_DE = 15;
const tag = (n: number): string => TAGS_1938H[n - 1]!;
const dE = (a: number, b: number): number => deltaE(parseHex(NATIONS_1938H[a - 1]!.color), parseHex(NATIONS_1938H[b - 1]!.color));
const under = (pairs: readonly [number, number][], bar: number): string[] => pairs.filter(([a, b]) => dE(a, b) < bar).map(([a, b]) => `${tag(a)}-${tag(b)} ΔE ${dE(a, b).toFixed(1)}`);

describe('the colours of land neighbours in the replay (ROADMAP R84d)', () => {
  const assets = assets1938(SIZE_1938.w);
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
  const { province, terrain, owner: start, w, h } = sim.world.cells;
  const meta = JSON.parse(new TextDecoder().decode(assets.admin1Meta)) as Admin1Meta[];
  const maps = TIMELINE_1938H.maps!;
  const mapPairs = (k: number): [number, number][] => neighbourPairs(referenceOwners(start, province, terrain, meta, maps, k, TAGS_1938H, w, h), w, h);

  it(`on the map of the track's end every two land neighbours differ by ΔE ≥ ${END_DE}, Georgia and Russia first`, () => {
    const pairs = mapPairs(maps.length - 1);
    expect(pairs.length).toBeGreaterThan(300);
    const geo = TAGS_1938H.indexOf('GEO') + 1;
    const sov = TAGS_1938H.indexOf('SOV') + 1;
    expect(pairs.some(([a, b]) => a === sov && b === geo)).toBe(true);
    expect(dE(sov, geo)).toBeGreaterThanOrEqual(END_DE);
    expect(under(pairs, END_DE)).toEqual([]);
  });

  it(`on the start and every earlier map at least ${EARLIER_DE}`, () => {
    const out: string[] = [];
    for (const l of under(neighbourPairs(start, w, h), EARLIER_DE)) out.push(`1938-01-01 ${l}`);
    for (let k = 0; k < maps.length - 1; k++) for (const l of under(mapPairs(k), EARLIER_DE)) out.push(`${maps[k]!.date} ${l}`);
    expect(out).toEqual([]);
  }, 120_000);

  it(`a nation born of others is ΔE ≥ ${END_DE} from each of them`, () => {
    const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
    const pairs: [number, number][] = [];
    for (const e of TIMELINE_1938H.events) if (e.kind === 'born') for (const f of e.from) if (f !== e.nation) pairs.push([id(f), id(e.nation)]);
    expect(pairs.length).toBeGreaterThan(100);
    expect([...new Set(under(pairs, END_DE))]).toEqual([]);
  });
});
