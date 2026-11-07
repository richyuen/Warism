import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort, groupOf, hasLanding, nearPort, portNamed, portOf } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R22b (critic run 34, R34-N1): a division aboard a player's convoy still loading at its port
// takes an order. The critic's case: Japan at war with China, its four divisions nearest Tokyo sent
// to Shanghai by one click; the first boards at Tokyo and waits there for the rest (R21e, weeks). A
// recall of it then was refused ("aboard transports, takes no order until it lands"). Now it goes
// ashore at the port and marches; the convoy waits on and the other three land at Shanghai.
// ROADMAP R33b (ADR-830): a landing's divisions wait at its port ashore and board at the sail hour: the first
// at the port, recalled, marches; its landing waits on for the rest.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

describe('the wait aboard has a way out (ROADMAP R22b)', () => {
  it('the first of four aboard at Tokyo, recalled inland: ashore and marching, not refused; the rest land', () => {
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
    const four = all.sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
    // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
    // of its own there, a sibling): this test's one landing at Tokyo.
    nearPort(w, four, portNamed(w, 'Tokyo'), [0, 2, 4, 6]);
    expect(four).toHaveLength(4);
    for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP });
    const refused: number[] = [];
    const landed = new Map<number, number>();
    const step = (): void =>
      sim.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (ev[i + 1] === EventKind.MoveRejected && four.includes(ev[i + 2]!)) refused.push(ev[i + 2]!, ev[i + 4]!);
          if (ev[i + 1] === EventKind.FormationLanded && four.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
        }
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
    // Until one is at its port while another is still to come.
    let first = 0;
    for (let h = 0; h < 24 * 10 && first === 0; h++) {
      step();
      first = four.find((id) => atItsPort(w, id)) ?? 0;
    }
    expect(first, 'one at its port').not.toBe(0);
    const fleet = groupOf(w, first)!;
    expect(hasLanding(w, fleet), 'its landing gathering at the port').toBe(true);
    expect(four.some((id) => !atItsPort(w, id)), 'another still to come').toBe(true);
    const port = w.ports[portOf(w, first)!]!;

    // Recalled to a cell inland, a day's march from the port.
    const inland = cellOf(139.4, 35.9, W, H) as [number, number];
    sim.command({ kind: 'moveFormation', id: first, x: inland[0], y: inland[1], nation: JAP });
    step();
    expect(refused, 'not refused').toEqual([]);
    expect(w.embarked.has(first), 'ashore').toBe(false);
    expect(c.moving[first], 'marching').toBe(1);
    expect(Math.floor(c.targetCell[first]! / W)).toBe(Math.floor(inland[1]));
    const at = Math.floor(c.y[first]!) * W + Math.floor(c.x[first]!);
    expect(Math.abs((at % W) - (port.cell % W)) + Math.abs(Math.floor(at / W) - Math.floor(port.cell / W)), 'by the port').toBeLessThanOrEqual(2);

    // The convoy waits on for the rest, and they land together at Shanghai. (The one recalled is the AI's
    // once its march is over, ADR-759, and may be shipped elsewhere by it on transports the convoys freed,
    // R31d: on this seed on the group it left, freed, to China at h183, weeks before them.)
    const rest = four.filter((id) => id !== first);
    for (let h = 0; h < 24 * 70 && rest.some((id) => !landed.has(id)); h++) step();
    expect(rest.filter((id) => landed.has(id)), 'the other three landed').toEqual(rest);
    expect(refused, 'none refused').toEqual([]);
    const when = rest.map((id) => landed.get(id)!);
    expect(Math.max(...when) - Math.min(...when), 'together').toBeLessThanOrEqual(24);
  });
});
