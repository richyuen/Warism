import { describe, expect, it } from 'vitest';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { landingFor, landingOfDivision } from '../../src/sim/systems/landings';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R27a (ADR-827): the landing an order over the sea is for, as the order resolves it, for
// the map to mark while the order is chosen. Japan at war with China, its two divisions nearest
// Tokyo: before any order, Shanghai is `landingOf` Shanghai; ordered there, at hour 26 the one
// aboard, pointed two cells south, has its own landing (`same`), which that cell's `landingOf` is
// not; Fuzhou is Fuzhou's.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU = cellOf(119.3, 26.08, W, H) as [number, number];
const cell = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);

describe('the landing an order over the sea is for (ROADMAP R27a)', () => {
  it("Japan's two to Shanghai: the click's landing before; the one aboard's own after, two cells off", () => {
    const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = sim.world;
    w.settings.player = JAP;
    if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
    sim.step(1);
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[cell(TOKYO[0], TOKYO[1])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[cell(c.x[id]!, c.y[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    const pair = all.sort((a, b) => a[1] - b[1]).slice(0, 2).map((d) => d[0]);

    const before = landingFor(w, pair[0]!, SHANGHAI[0], SHANGHAI[1]);
    expect(before, 'the click').toEqual({ ...landingOf(w, cell(SHANGHAI[0], SHANGHAI[1]))!, same: false, goal: cell(SHANGHAI[0], SHANGHAI[1]) });

    for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
    while (w.tick < 26) sim.step(1);
    // ROADMAP R33b: the one at its port (it waits there ashore; before, aboard): its landing.
    const first = pair.find((id) => atItsPort(w, id))!;
    expect(first, 'one at its port').toBeDefined();
    const e = landingOfDivision(w, first)!;
    const south = landingFor(w, first, SHANGHAI[0], SHANGHAI[1] + 2);
    expect(south, 'its own landing').toEqual({ water: e.water, land: e.land, same: true, goal: e.target });
    const click = landingOf(w, cell(SHANGHAI[0], SHANGHAI[1] + 2))!;
    expect(click.land === e.land && click.water === e.water, "the click's own landing is another").toBe(false);
    const fuzhou = landingFor(w, first, FUZHOU[0], FUZHOU[1]);
    expect(fuzhou, 'Fuzhou is Fuzhou').toEqual({ ...landingOf(w, cell(FUZHOU[0], FUZHOU[1]))!, same: false, goal: cell(FUZHOU[0], FUZHOU[1]) });
  });
});
