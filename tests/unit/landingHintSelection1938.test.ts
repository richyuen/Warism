import { describe, expect, it } from 'vitest';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { landingOfDivision, seaHint } from '../../src/sim/systems/landings';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R28b (critic run 39, R39-N1): the map's mark and the tooltip spoke for the first selected
// division alone. The one aboard and a fresh division selected, the cursor two cells south of
// Shanghai: green, "they keep their transports", while the fresh one went to another landing four
// cells off and landed alone. The hint now marks each distinct landing of the selection (`seaHint`).
// Japan at war with China, its two divisions nearest Tokyo to Shanghai; at hour 26 the one aboard
// and the third nearest (never ordered) selected.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const cell = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);

describe('the mark speaks for the whole selection (ROADMAP R28b)', () => {
  it('the one aboard and a fresh one, two cells south of Shanghai: two landings, its own kept and the click\'s new', () => {
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
    const three = all.sort((a, b) => a[1] - b[1]).slice(0, 3).map((d) => d[0]);
    // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
    // of its own there, a sibling): this test's one landing at Tokyo.
    nearPort(w, three, portNamed(w, 'Tokyo'), [0, 4, 2]);
    const pair = three.slice(0, 2);
    const fresh = three[2]!;

    const before = seaHint(w, pair, SHANGHAI[0], SHANGHAI[1]);
    expect(before.marks, 'one click, one landing').toEqual([{ ...landingOf(w, cell(SHANGHAI[0], SHANGHAI[1]))!, same: false }]);

    for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
    while (w.tick < 26) sim.step(1);
    // ROADMAP R33b: the one at its port (it waits there ashore; before, aboard): its landing.
    const first = pair.find((id) => atItsPort(w, id))!;
    expect(first, 'one at its port').toBeDefined();
    const e = landingOfDivision(w, first)!;
    const [x, y] = [SHANGHAI[0], SHANGHAI[1] + 2];
    const click = landingOf(w, cell(x, y))!;

    const alone = seaHint(w, [first], x, y);
    expect(alone.marks, 'the one aboard alone: its own landing, kept').toEqual([{ water: e.water, land: e.land, same: true }]);

    const mixed = seaHint(w, [first, fresh].sort((a, b) => a - b), x, y);
    process.stderr.write(`R28b: ${JSON.stringify(mixed)}\n`);
    expect(mixed.how, 'by sea').toBe(1);
    expect(mixed.marks, "two landings: the one aboard's kept, the fresh one's new").toEqual(
      expect.arrayContaining([
        { water: e.water, land: e.land, same: true },
        { water: click.water, land: click.land, same: false },
      ]),
    );
    expect(mixed.marks.length).toBe(2);
  });
});
