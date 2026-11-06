import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { RejectReason } from '../../src/shared/events';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { atItsPort, groupOf, hasLanding, landingId } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R31a (critic run 42, R42-N3): the player's order to the transports of a convoy still loading
// sent them off with the one aboard, which takes no order: ordered onto the Channel, group 1068 stood
// there with 270 aboard for weeks, its panel "At sea, bound for its landing", 271 waiting at the port.
// Now such an order is refused (`Convoy`), and the landing goes on. Britain at war with France (forced;
// they are allies), seed 15101: 270 and 271 sent to Calais by a click (escort on); the hour after 270
// boards at Portsmouth, its transports are ordered onto the Channel: refused, 270 aboard there.
// ROADMAP R33b: a landing's divisions wait at its port ashore and board at the sail hour (ADR-830): the hour
// after the first is at its port, its landing's transports are so ordered; refused, the landing goes on.

const { w: W } = SIZE_1938;
const ENG = nationId('ENG');
const FRA = nationId('FRA');
const CALAIS: [number, number] = [1034.5, 279.5];
const CHANNEL: [number, number] = [1025.5, 285.5];

describe("the player's order to a convoy's transports is refused (ROADMAP R31a)", () => {
  it('Britain 15101: 270 aboard at Portsmouth, its transports ordered onto the Channel: refused, still aboard at its port', () => {
    const news: OrderNews[] = [];
    const s = new SimServer((m: FromWorker) => {
      if (m.type === 'orderNews') news.push(m.news);
    });
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 15101, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: ENG } }, 1);
    const w = s.sim!.world;
    if (!w.wars.atWar(ENG, FRA)) s.handle({ type: 'cmd', cmd: { kind: 'forceWar', attacker: ENG, defender: FRA }, now: true }, 1);
    const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
    const pair = [270, 271];
    const step = (): void => s.sim!.step(1, drain);
    step();
    const cmds: Command[] = pair.map((id) => ({ kind: 'moveFormation', id, x: CALAIS[0], y: CALAIS[1], nation: ENG, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
    for (let h = 0; h < 24 * 10 && !pair.some((id) => atItsPort(w, id)); h++) step();
    expect(pair.some((id) => atItsPort(w, id)), 'the first at its port').toBe(true);
    step();
    const first = pair.find((id) => atItsPort(w, id))!;
    const fleet = groupOf(w, first)!;
    const landing = landingId(w, first);
    const [x0, y0] = [w.formations.cols.x[fleet]!, w.formations.cols.y[fleet]!];
    news.length = 0;
    s.handle({ type: 'cmds', cmds: [{ kind: 'moveFormation', id: fleet, x: CHANNEL[0], y: CHANNEL[1], nation: ENG }], now: true }, 3);
    const told = news.filter((n) => n.kind === 'refused' && n.id === fleet);
    expect(told.map((n) => n.reason), 'refused: it carries a landing (red: it sailed)').toEqual([RejectReason.Convoy]);
    step();
    expect(landingId(w, first), 'still in its landing').toBe(landing);
    expect(Math.hypot(w.formations.cols.x[fleet]! - x0, w.formations.cols.y[fleet]! - y0), 'still at its port').toBeLessThan(1);
    expect(hasLanding(w, fleet), 'its landing goes on').toBe(true);
    // (Portsmouth is then bombed shut before 271 is there: R31b's case, `convoyPortShut1938.test.ts`.)
  }, 300_000);
});
