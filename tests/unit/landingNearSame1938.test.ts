import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision, sameLandingAs } from '../../src/sim/systems/landings';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort, landingId } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R24b (critic run 36, R36-B2): the one aboard clicked a cell off its landing (14 px at the
// default zoom; nothing on the screen tells the two apart) was a different landing: ashore, sent
// to Sasebo's transports, its partner landing alone at hour 633 and it at 1285. The critic's case:
// Japan at war with China, its two divisions nearest Tokyo to Shanghai (escort on); at hour 26 the
// one aboard re-clicked one cell east. Now a landing within two cells, of the same holder, is the
// same landing: it stays aboard and the two land together. Fuzhou is still another. So is a click
// within two cells of the clicked cell, whatever landing it resolves to (R25a).

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU = cellOf(119.3, 26.08, W, H) as [number, number];

function two(dx: number, dy: number): { landed: number[]; kept: boolean; far: boolean } {
  const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = sim.world;
  w.settings.player = JAP;
  if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
  sim.step(1);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  const pair = all.sort((a, b) => a[1] - b[1]).slice(0, 2).map((d) => d[0]);
  for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
  const landed = new Map<number, number>();
  const step = (): void =>
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.FormationLanded && pair.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
  while (w.tick < 26) step();
  // ROADMAP R33b: the one at its port (it waits there ashore; before, aboard) keeps its landing.
  const first = pair.find((id) => atItsPort(w, id))!;
  expect(first, 'one at its port').toBeDefined();
  const was = landingId(w, first);
  const far = sameLandingAs(w, landingOfDivision(w, first)!, FUZHOU[0], FUZHOU[1]);
  sim.command({ kind: 'moveFormation', id: first, x: SHANGHAI[0] + dx, y: SHANGHAI[1] + dy, nation: JAP, escort: true });
  step();
  const kept = landingId(w, first) === was;
  for (let h = 0; h < 24 * 80 && landed.size < 2; h++) step();
  return { landed: [...landed.values()], kept, far };
}

describe('a click a cell or two off the landing is the same landing (ROADMAP R24b)', () => {
  it.each([
    [1, 0],
    [0, 1],
    [2, 0],
    // R25a (critic run 37, R37-B1): two cells south, and two south-west, resolve to a landing four
    // cells off; the click is near the cell the landing was ordered for (red without: 633 / 1288).
    [0, 2],
    [-2, 2],
  ])("Japan's two to Shanghai, the one at its port re-clicked (%i, %i) cells off: its landing kept; the two land together", (dx, dy) => {
    const run = two(dx, dy);
    process.stderr.write(`R24b (${dx}, ${dy}): landed ${run.landed}\n`);
    expect(run.far, 'Fuzhou is another landing').toBe(false);
    expect(run.kept, 'its landing kept').toBe(true);
    expect(run.landed, 'both landed').toHaveLength(2);
    expect(Math.max(...run.landed) - Math.min(...run.landed), 'together').toBeLessThanOrEqual(24);
  });
});
