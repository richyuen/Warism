import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import type { FromWorker } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { LandingState, landingOfDivision } from '../../src/sim/systems/landings';
import type { World } from '../../src/sim/world';
import { navOf } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { atItsPort, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R31e (critic run 40, R40-N1): the one aboard sent alone to another landing takes its own
// transports (R28a) and they sail at once; recalled a day later, it was refused at sea ("aboard") and
// landed alone at Fuzhou h150, while before R28a it rejoined its landing (631/632). Now the player's
// transports at sea with it alone turn back for the nearest port, and it takes the order as there.
// Seed 3517, Japan at war with China: the two nearest Tokyo sent to Shanghai by a click (escort on);
// two hours after the first boards, it alone is sent to Fuzhou; a day later, back to Shanghai.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

// ROADMAP R32a (critic run 43, R43-B1): R31e turned the transports for the nearest port; recalled after the
// first day, the one aboard was put ashore there and walked weeks to its landing's port while its partner
// landed alone (2 days: 16 days apart; 3 days: still marching on day 60; 5 days: alone, before it). Now they
// turn back only for the port where its landing loads, and it rejoins it there; recalled at 1, 2, 3 and 5
// days, the two land within a day, or the recall is refused (told) and it never walks.
// ROADMAP R43a: the partner placed within Tokyo's reach (8 cells) is at the port in days: by a 5-day recall its
// landing has sailed for Shanghai, and there is none to rejoin (R32a turns back only for the port where its landing
// loads): the recall sails it on for Shanghai, both land there, and it never walks. The 1-day recall is a rejoin.
describe('the one re-sent alone, at sea, can be recalled (ROADMAP R31e, R32a)', () => {
  for (const days of [1, 2, 3, 5]) it(`sent alone to Fuzhou, recalled to Shanghai ${days} day(s) later: the two land at Shanghai within a day, or it is refused and never walks`, () => {
    const refused: number[] = [];
    const s = new SimServer((m: FromWorker) => {
      if (m.type === 'orderNews' && m.news.kind === 'refused') refused.push(m.news.id);
    });
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 3517, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
    const w = s.sim!.world;
    if (!w.wars.atWar(JAP, CHI)) s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: JAP, defender: CHI }, now: true }, 1);
    const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
    const landed = new Map<number, number>();
    let ids: number[] = [];
    const step = (): void =>
      s.sim!.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (!ids.includes(ev[i + 2]!)) continue;
          if (ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
        }
        drain(x);
      });
    step();
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    ids = all.sort((a, b) => a[1] - b[1]).slice(0, 2).map((d) => d[0]);
    // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
    // of its own there, a sibling): this test's one landing at Tokyo.
    nearPort(w, ids, portNamed(w, 'Tokyo'), [0, 8]);
    const click = (sel: number[], x: number, y: number): void => {
      const cmds: Command[] = [...sel].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true }));
      s.handle({ type: 'cmds', cmds, now: true }, 2);
    };
    click(ids, ...SHANGHAI);
    for (let h = 0; h < 24 * 10 && !ids.some((id) => atItsPort(w, id)); h++) step();
    // ROADMAP R33b: a landing's divisions wait at its port ashore (ADR-830): the first at its port.
  expect(ids.some((id) => atItsPort(w, id)), 'the first at its port').toBe(true);
    step();
    step();
    const first = ids.find((id) => atItsPort(w, id))!;
    click([first], ...FUZHOU);
    for (let h = 0; h < 24 * days; h++) step();
    const ship = w.embarked.get(first)?.fleet ?? 0;
    expect(c.moving[ship], 'its transports at sea, for Fuzhou').toBe(1);
    const other = ids.find((id) => id !== first)!;
    const gathers = landingOfDivision(w, other)?.state === LandingState.gathering;
    if (days === 1) expect(gathers, "a day out, its partner's landing gathers").toBe(true);
    click([first], ...SHANGHAI);
    let walked = false;
    for (let h = 0; h < 24 * 90 && ids.some((id) => !landed.has(id)); h++) {
      if (!landed.has(first) && !w.embarked.has(first) && c.moving[first] === 1) walked = true;
      step();
    }
    process.stderr.write(`R32a ${days} d: first ${first}, refused ${refused}, walked ${walked}, landed ${[...landed]}, at ${ids.map((id) => `${c.x[id]!.toFixed(0)},${c.y[id]!.toFixed(0)}`)}\n`);
    expect(walked, 'the one at sea never marches before it lands (red: put ashore, walked weeks)').toBe(false);
    expect(landed.size, 'both landed').toBe(2);
    if (refused.length > 0) {
      // Refused: told, and it goes on to the landing it was sent to.
      expect(refused, 'the one at sea, told').toEqual([first]);
      return;
    }
    const at = [...landed.values()];
    if (gathers) expect(Math.max(...at) - Math.min(...at), 'together (red: 16 days apart, or alone)').toBeLessThanOrEqual(24);
    for (const id of ids) expect(Math.hypot(c.x[id]! - SHANGHAI[0], c.y[id]! - SHANGHAI[1]), `${id} at Shanghai`).toBeLessThan(15);
  }, 300_000);
});
