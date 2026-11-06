import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import type { FromWorker } from '../../src/shared/protocol';
import { EventKind } from '../../src/shared/events';
import type { World } from '../../src/sim/world';
import { cellOf } from '../../src/sim/data/terrain';
import { SimServer } from '../../src/worker/server';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { assets1938 } from '../helpers/earth';
import { atItsPort } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R30a (critic run 41, R41-B1): R29b's transports, sailing with the one aboard to the port where
// a convoy for its new landing loads, were not that convoy's mate: it sailed as soon as its own were
// aboard. Britain at war with France: divisions 270 and 271 sent to Calais by a click (escort on); the
// hour after 270 boards at Portsmouth, the fresh tank brigade 276 by Plymouth sent to Caen, then the
// two. 276 boarded at Plymouth and sailed at once, landed alone at h84 and was destroyed at h233; the
// two landed at h289 (on 76b88197 the three at h290/291). Now a group under way to its convoy's port
// is still to load (`stillLoading`), and the convoys at that port for that landing wait for it.
// Driven as the page drives the worker (`cmds`, ids ascending, applied at once).
// ROADMAP R33b (ADR-830): a landing's divisions wait at its port ashore and board at the sail hour: the hour
// after the first is at its port. R31c's case (270 aboard its transports sailing to Plymouth, R29b's) has no
// such state now: the two clicked onto the Midlands two hours on march there; neither lands in France.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const FRA = nationId('FRA');
const CALAIS: [number, number] = [1034.5, 279.5];
const CAEN: [number, number] = [1021.5, 291.5];
/** The English Midlands (Birmingham), by land from the south coast. */
const MIDLANDS = cellOf(-1.9, 52.48, W, H).map((v) => Math.floor(v) + 0.5) as [number, number];

function run(seed: number, inland = false): { landed: Map<number, number>; refused: number[]; aboard: boolean } {
  // Refusals as the page is told them (`orderNews`): at the click, applied at once, as well as later.
  const refused: number[] = [];
  const s = new SimServer((m: FromWorker) => {
    if (m.type === 'orderNews' && m.news.kind === 'refused') refused.push(m.news.id);
  });
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed, assets: assets1938(W) } }, 0);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: ENG } }, 1);
  const w = s.sim!.world;
  if (!w.wars.atWar(ENG, FRA)) s.handle({ type: 'cmd', cmd: { kind: 'forceWar', attacker: ENG, defender: FRA }, now: true }, 1);
  expect(w.wars.atWar(ENG, FRA), 'at war').toBe(true);
  const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
  const [pair, fresh] = [[270, 271], 276];
  const ids = [...pair, fresh];
  for (const id of ids) expect(w.formations.cols.nation[id], `${id} British`).toBe(ENG);
  const landed = new Map<number, number>();
  const step = (): void =>
    s.sim!.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (!ids.includes(ev[i + 2]!)) continue;
        if (ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
      }
      drain(x);
    });
  const click = (sel: number[], x: number, y: number): void => {
    const cmds: Command[] = [...sel].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x, y, nation: ENG, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
  };
  step();
  click(pair, ...CALAIS);
  for (let h = 0; h < 24 * 10 && !pair.some((id) => atItsPort(w, id)); h++) step();
  expect(pair.some((id) => atItsPort(w, id)), 'the first at its port').toBe(true);
  step();
  click([fresh], ...CAEN);
  click(pair, ...CAEN);
  // ROADMAP R31c (critic run 42, R42-N1): two hours on, while 270's transports sail it to Plymouth, the two
  // clicked onto the Midlands: 270 was refused "aboard", and landed at Caen with 276.
  if (inland) {
    step();
    step();
    click(pair, ...MIDLANDS);
  }
  const aboard = w.embarked.has(270);
  for (let h = 0; h < 24 * 40 && (inland ? h < 24 * 20 : ids.some((id) => !landed.has(id))); h++) step();
  process.stderr.write(`R30a ${seed} ${inland}: refused ${refused}, landed ${[...landed]}\n`);
  return { landed, refused, aboard };
}

describe('the one aboard on its own transports to a port where a convoy for its landing loads: they sail together (ROADMAP R30a)', () => {
  for (const seed of [15101, 7019]) {
    it(`Britain, seed ${seed}: 276 to Caen, then 270 and 271: the three land within a day, 276 never alone`, () => {
      const r = run(seed);
      expect(r.refused, 'none refused').toEqual([]);
      expect(r.landed.size, 'all three landed').toBe(3);
      const at = [...r.landed.values()];
      expect(Math.max(...at) - Math.min(...at), 'together (red: 276 at h84, the two at h289)').toBeLessThanOrEqual(24);
    }, 300_000);
  }

  it('Britain 15101: the two clicked onto the Midlands two hours on: none refused, 270 not aboard; neither lands in France', () => {
    const r = run(15101, true);
    expect(r.refused, 'none refused (red: 270, "aboard")').toEqual([]);
    expect(r.aboard, '270 ashore').toBe(false);
    expect(r.landed.has(270) || r.landed.has(271), 'neither lands in France (red: 270 at Caen)').toBe(false);
  }, 300_000);
});
