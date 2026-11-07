import { describe, expect, it } from 'vitest';
import type { FormationDetail } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { navOf, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { atItsPort, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R22c (critic run 34, R34-N1): the division aboard at its port, waiting for the rest of its
// landing, is told how many are aboard and how far off the last is. The critic's case: Japan at war
// with China, its four divisions nearest Tokyo to Shanghai by one click; the first boards at Tokyo
// at once, the last walks from the north of Honshu for weeks.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

describe('the wait aboard is accounted for (ROADMAP R22c)', () => {
  it('Japan\'s four to Shanghai: "1 of 4 aboard" and the last one\'s days, which it keeps', () => {
    const s = new SimServer(() => {});
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
    const sim = s.sim!;
    const w = sim.world;
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
    nearPort(w, four, portNamed(w, 'Tokyo'), [0, 2, 5, 8]);
    for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP });
    const voyage = (id: number): FormationDetail['voyage'] => (s as unknown as { voyageOf(w: World, id: number): FormationDetail['voyage'] }).voyageOf(w, id);
    const clear = (x: World): void => {
      x.out.events.length = 0;
      x.out.fires.length = 0;
    };
    let first = 0;
    for (let h = 0; h < 24 * 10 && first === 0; h++) {
      sim.step(1, clear);
      first = four.find((id) => atItsPort(w, id) && voyage(id)?.state === 'gathering') ?? 0;
    }
    // ROADMAP R33b: at its port with its transports (it waits there ashore; before, aboard).
    expect(first, 'one at its port').not.toBe(0);
    const v = voyage(first)!;
    expect(v.state).toBe('gathering');
    expect(v.wait, 'the account').toBeDefined();
    expect(v.wait!.of).toBe(4);
    expect(v.wait!.aboard).toBe(four.filter((id) => atItsPort(w, id)).length);
    expect(v.wait!.days, 'the last is days away').toBeGreaterThan(1);
    const said = v.wait!.days!;
    const from = w.tick;
    // The last to reach the port does so within the days said (a day's grace for the hour it boards).
    let lastAt = -1;
    const there = new Set<number>(four.filter((id) => atItsPort(w, id)));
    for (let h = 0; h < 24 * 80 && there.size < 4; h++) {
      sim.step(1, clear);
      for (const id of four) if (!there.has(id) && (w.embarked.has(id) || atItsPort(w, id))) there.add(id);
      if (there.size === 4) lastAt = w.tick;
      // The account counts up as they come.
      if (voyage(first)?.state === 'gathering') expect(voyage(first)!.wait!.of).toBe(4);
    }
    expect(lastAt, 'all four at the port').toBeGreaterThan(0);
    const took = (lastAt - from) / 24;
    process.stderr.write(`R22c: said ${said} days at hour ${from}; the last at the port after ${took.toFixed(1)} days\n`);
    expect(took).toBeLessThanOrEqual(said + 1);
    expect(took).toBeGreaterThan(said * 0.6);
  });
});
