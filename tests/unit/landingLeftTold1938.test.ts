import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { landingHeld } from '../../src/sim/systems/landings';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort, groupOf, landingId, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R25b (critic run 37, R37-B1): the one aboard a convoy still loading, sent to another
// landing while other transports had room, went ashore and was put on them in silence: no refusal,
// no row, its panel naming a port at the far end of Japan, and its landing split for weeks. It is
// now told it leaves its landing (`LeftLanding`, a notice and a row). The case: Japan at war with
// China, its two divisions nearest Tokyo to Shanghai (escort on); at hour 26 the one aboard sent to
// Fuzhou. Since R28a its own transports, which carry no one else, go with it (they were held by its
// landing, and it went to others); it is still told.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU = cellOf(119.3, 26.08, W, H) as [number, number];

describe('a division aboard never leaves its transports untold (ROADMAP R25b)', () => {
  it("Japan's two to Shanghai, the one aboard sent to Fuzhou with other transports free: taken, and told it leaves its landing", () => {
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
    // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
    // of its own there, a sibling): this test's one landing at Tokyo.
    nearPort(w, pair, portNamed(w, 'Tokyo'), [0, 4]);
    for (const id of pair) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
    const told: number[] = [];
    const refused: number[] = [];
    const step = (): void =>
      sim.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (ev[i + 1] === EventKind.LeftLanding) told.push(ev[i + 2]!);
          if (ev[i + 1] === EventKind.MoveRejected) refused.push(ev[i + 2]!);
        }
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
    while (w.tick < 26) step();
    // ROADMAP R33b: the one at its port (it waits there ashore; before, aboard).
    const first = pair.find((id) => atItsPort(w, id))!;
    expect(first, 'one at its port').toBeDefined();
    const fleet = landingId(w, first);
    sim.command({ kind: 'moveFormation', id: first, x: FUZHOU[0], y: FUZHOU[1], nation: JAP, escort: true });
    step();
    const now = groupOf(w, first) ?? w.embarked.get(first)?.fleet;
    process.stderr.write(`R25b: fleet ${fleet} -> ${now}, told ${told}, refused ${refused}\n`);
    expect(refused, 'taken, not refused').not.toContain(first);
    expect(now, 'transports for it').toBeDefined();
    const fuzhou = landingOf(w, Math.floor(FUZHOU[1]) * W + Math.floor(FUZHOU[0]));
    expect(landingHeld(w, first), "Fuzhou's landing, not Shanghai's").toEqual(fuzhou);
    expect(told, 'told it leaves its landing').toEqual([first]);
  });
});
