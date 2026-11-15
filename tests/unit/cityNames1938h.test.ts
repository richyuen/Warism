import { describe, expect, it } from 'vitest';
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { formerName } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';

// ROADMAP R86e (critic run 71, R71-N5): the cities kept their 1938 names to 1991 ("Keijō, South Korea", "Peiping",
// "Léopoldville" on 31 December 1975). The timeline renames them on the day (`cityName`), and the name is the world's,
// so a game played free from a later year has it.

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
const lonLatOf = (name: string): [number, number] => cities1938.cities.find((c) => c.name === name)!.lonLat as [number, number];
/** The world's city of the 1938 list named `name`, 0 for none. */
const cityOf = (w: World, name: string): number => {
  const def = cities1938.cities.findIndex((c) => c.name === name);
  let out = 0;
  w.cities.forEach((id) => {
    if (w.cities.cols.def[id] === def) out = id;
  });
  return out;
};

describe('the cities renamed by the timeline (ROADMAP R86e)', () => {
  it('a city bears its new name from the day, and keeps it through a save', () => {
    const timeline: TimelineFile = { end: '1938-01-05', events: [{ date: '1938-01-02', kind: 'cityName', at: lonLatOf('Keijō'), as: 'Seoul' }] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);
    const keijo = cityOf(sim.world, 'Keijō');
    expect(keijo).toBeGreaterThan(0);
    sim.step(24, quiet);
    expect(sim.world.cityNames.get(keijo)).toBeUndefined();
    const v = sim.world.citiesVersion;
    sim.step(24, quiet);
    expect(sim.world.cityNames.get(keijo)).toBe('Seoul');
    expect(sim.world.citiesVersion).toBeGreaterThan(v);
    const other = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);
    other.load(sim.save());
    expect(other.world.cityNames.get(keijo)).toBe('Seoul');
    // R87b (critic run 72, R72-N2: "29 October 1941 … near Tver"): History names a row's city as of the row's hour.
    const defName = (d: number): string => cities1938.cities[d]?.name ?? '';
    for (const w of [sim.world, other.world]) {
      expect(formerName(w, keijo, 0, defName)).toBe('Keijō');
      expect(formerName(w, keijo, w.tick, defName)).toBeUndefined();
    }
  });

  it("every rename of the replay's timeline finds its city on the 1938 map, the one it names", () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
    const renames = TIMELINE_1938H.events.flatMap((e) => (e.kind === 'cityName' ? [e] : []));
    expect(renames.length).toBeGreaterThan(40);
    for (const e of renames) {
      const named = cities1938.cities.find((c) => c.lonLat[0] === e.at[0] && c.lonLat[1] === e.at[1]);
      expect(named, `${e.as}: a city of the 1938 list at ${e.at.join(',')}`).toBeDefined();
      expect(cityOf(sim.world, named!.name), `${named!.name} on the map`).toBeGreaterThan(0);
    }
    // Seoul, Beijing and Kinshasa, the critic's three, by 1979.
    const by1979 = new Set(renames.filter((e) => e.date <= '1979-01-01').map((e) => e.as));
    for (const n of ['Seoul', 'Beijing', 'Kinshasa']) expect(by1979.has(n)).toBe(true);
    // R87c (critic run 72, R72-N3): the five it found under their 1938 names on 31 December 1991.
    const all = new Set(renames.map((e) => e.as));
    for (const n of ['Harare', 'Antananarivo', 'Banjul', 'Dhaka', 'Guangzhou']) expect(all.has(n)).toBe(true);
  });
});
