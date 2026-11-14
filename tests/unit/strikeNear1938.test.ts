import { describe, expect, it } from 'vitest';
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import { project } from '../../src/sim/data/projection';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { nearestCity, strikeNear } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';

// ROADMAP R78e (critic run 67): the 1958 burst on Hokkaido was named for Nevelsk, a Soviet town across the strait on
// Sakhalin, the nearest city of any holder. A strike is named for the struck land's own city where one lies within
// NEAR_HOLDER_CELLS (12), else for the nearest of any holder.

const { w: W, h: H } = SIZE_1938;
const id = (tag: string): number => NATIONS_1938.findIndex((n) => n.tag === tag) + 1;

describe("a strike's city (PLAN 6.11c, R78e)", () => {
  it("names the struck land's own city before a nearer one across a strait", () => {
    const s = new Sim({ scenario: '1938', seed: 7, assets: assets1938(W) });
    const w = s.world;
    const cc = w.cities.cols;
    const name = (row: number): string => cities1938.cities[cc.def[row]!]?.name ?? '';
    const row = (city: string): number => {
      let r = 0;
      w.cities.forEach((i) => {
        if (name(i) === city) r = i;
      });
      return r;
    };
    const nevelsk = row('Nevelsk');
    const asahikawa = row('Asahikawa');
    expect(nevelsk).toBeGreaterThan(0);
    expect(asahikawa).toBeGreaterThan(0);
    // Sakhalin's south the Soviet Union's, as after 1945; Hokkaido Japan's.
    w.cells.controller[cc.cell[nevelsk]!] = id('SOV');
    // A burst on Hokkaido's north, nearer Nevelsk (about 1.2° of latitude) than Asahikawa (about 1.75°).
    const [u, v] = project(141.9, 45.5);
    const [x, y] = [u * W, v * H];
    expect(w.cells.controller[Math.floor(y) * W + Math.floor(x)]).toBe(id('JAP'));
    expect(nearestCity(w, x, y)).toBe(nevelsk);
    const named = strikeNear(w, x, y, name);
    expect(named).not.toBe('=Nevelsk');
    const r = row(named.slice(1));
    expect(w.cells.controller[cc.cell[r]!]).toBe(id('JAP'));
    // At sea, with no holder, the nearest of any.
    const [su, sv] = project(141.6, 46.0);
    const [sx, sy] = [su * W, sv * H];
    if (w.cells.controller[Math.floor(sy) * W + Math.floor(sx)] === 0) expect(strikeNear(w, sx, sy, name)).toBe(`=${name(nearestCity(w, sx, sy))}`);
  }, 120_000);
});
