import { describe, expect, it } from 'vitest';
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import { TrackEnd } from '../../src/shared/events';
import { TimelineFile as TimelineSchema, type TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { endTrack } from '../../src/sim/track';
import { assets1938 } from '../helpers/earth';

// ROADMAP R74c (critic run 65, R65-N5: "Manchukuo" revived in a free world in 1979): when the track ends, a nation dead
// then that no later event of the timeline brings back (`born`) has no revivals left: history ended it. One the
// timeline brings back later (Poland, born again in 1945) keeps them, as does a living one; an unborn one is left as is.

const id = (tag: string): number => (TAGS_1938H as readonly string[]).indexOf(tag) + 1;

describe('revivals at the end of the historical track (R74c)', () => {
  it('a nation history ended comes back no more; one the timeline brings back later keeps its revivals', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    const w = sim.world;
    const nc = w.nations.cols;
    const [man, pol, ger] = [id('MAN'), id('POL'), id('GER')];
    const revivals = nc.revivalsLeft[man]!;
    expect(revivals).toBeGreaterThan(0);
    expect(nc.revivalsLeft[pol]).toBe(revivals);
    // Dead when the track ends (as after 1945 for Manchukuo; as in 1940 for Poland, born again in 1945).
    nc.living[man] = 0;
    nc.living[pol] = 0;
    const unborn = [...w.track!.unborn];
    expect(unborn.length).toBeGreaterThan(0);
    const unbornBefore = unborn.map((n) => nc.revivalsLeft[n]);
    endTrack(w, TrackEnd.intervention);
    expect(nc.revivalsLeft[man]).toBe(0);
    expect(nc.revivalsLeft[pol]).toBe(revivals);
    expect(nc.revivalsLeft[ger]).toBe(revivals);
    expect(unborn.map((n) => nc.revivalsLeft[n])).toEqual(unbornBefore);
  });
});

// R74c: a `capital` event with `city` founds that city when the nation has none of its own within CAPITAL_CITY_KM of the
// seat (Bonn, West Germany's, was labelled Gießen, the nearest city the map has); with one there, that one is the seat.
describe('a capital event founding its seat (R74c)', () => {
  it('founds the city named where the nation has none near, and takes the one there where it has', () => {
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', kind: 'capital', nation: 'GER', at: [7.1, 50.73], city: 'Bonn', note: 'Bonn' },
        { date: '1938-01-02', kind: 'capital', nation: 'FRA', at: [2.35, 48.86], city: 'Not Paris', note: 'Paris' },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TimelineSchema.parse(tl));
    const w = sim.world;
    const named = (): string[] => {
      const out: string[] = [];
      w.cities.forEach((c) => {
        if (w.cities.cols.capitalOf[c] === id('GER') || w.cities.cols.capitalOf[c] === id('FRA')) out.push(w.cityNames.get(c) ?? cities1938.cities[w.cities.cols.def[c]!]!.name);
      });
      return out.sort();
    };
    expect(named()).toEqual(['Berlin', 'Paris']);
    const before = w.cities.count;
    sim.step(48, (x) => {
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    expect(named()).toEqual(['Bonn', 'Paris']);
    expect(w.cities.count).toBe(before + 1);
  });
});
