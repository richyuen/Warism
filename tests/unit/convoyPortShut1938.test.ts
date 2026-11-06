import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind, RejectReason } from '../../src/shared/events';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R31b (critic run 42, R42-N2): a port bombed shut while a division marched to its convoy there:
// the division was refused at the port (`PortShut`, R21b), and the convoy sailed with the one aboard
// alone, which landed and was lost. Now a convoy whose port is shut while it loads is over: those
// aboard go ashore at the port, and all are told. Britain at war with France (forced; they are allies),
// seed 15101: 270 and 271 sent to Calais by a click (escort on); 270 boards at Portsmouth, and
// Portsmouth is bombed shut before 271 is there.

const { w: W } = SIZE_1938;
const ENG = nationId('ENG');
const FRA = nationId('FRA');
const CALAIS: [number, number] = [1034.5, 279.5];

describe('a convoy whose port is bombed shut while it loads does not sail with the one aboard alone (ROADMAP R31b)', () => {
  it('Britain 15101: 270 aboard at Portsmouth, the port shut before 271 is there: neither lands alone; both told', () => {
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
    const landed = new Map<number, number>();
    const step = (): void =>
      s.sim!.step(1, (x) => {
        const ev = x.out.events;
        // Landed in France (near Calais), not put ashore at home.
        for (let i = 0; i < ev.length; i += 6) if (pair.includes(ev[i + 2]!) && ev[i + 1] === EventKind.FormationLanded && Math.hypot(ev[i + 4]! - CALAIS[0], ev[i + 5]! - CALAIS[1]) < 8) landed.set(ev[i + 2]!, x.tick);
        drain(x);
      });
    step();
    const cmds: Command[] = pair.map((id) => ({ kind: 'moveFormation', id, x: CALAIS[0], y: CALAIS[1], nation: ENG, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
    for (let h = 0; h < 24 * 20; h++) step();
    const shut = news.filter((n) => n.kind === 'refused' && n.reason === RejectReason.PortShut).map((n) => n.id);
    process.stderr.write(`R31b: landed ${[...landed]}, told shut ${shut}, aboard ${pair.filter((id) => w.embarked.has(id))}\n`);
    expect(landed.has(270) && !landed.has(271), 'the one aboard does not land alone (red: 270 at Calais h99, then lost)').toBe(false);
    // ROADMAP R33b (ADR-829: the case kept, judged by the landing's outcome): a landing's divisions wait at its
    // port ashore and board at the sail hour; on this seed the two now sail before the port is shut, and land
    // together. Shut first, both are told and neither is aboard (`landingPortShut1938.test.ts` drives that).
    if (landed.size === 2) expect(Math.abs(landed.get(270)! - landed.get(271)!), 'together').toBeLessThanOrEqual(24);
    else {
      expect(shut, '271 told its port is shut').toContain(271);
      expect(shut, 'the one at the port told too').toContain(270);
      expect(w.embarked.has(270), 'ashore at the port').toBe(false);
    }
  }, 300_000);
});
