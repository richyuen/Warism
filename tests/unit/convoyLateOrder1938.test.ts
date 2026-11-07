import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { transportsPort } from '../../src/sim/systems/amphibious';
import { marchHoursLeft } from '../../src/sim/systems/movement';
import type { World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R31f (critic run 37, R37-N2; named again in runs 40-42): a landing already loading waited for
// any later order to the same coast, however far: two aboard at a port sat 45 days for a third ordered
// ten days later from 48 days away. Now a convoy waits for those of its own click (bound within a day of
// its first) however far, and for a later order only when its march left is a week or less; the rest go
// on its next voyage. Seed 3517, Japan at war with China: of the divisions whose land's nearest port is
// Tientsin, the two nearest it sent to Tokyo by a click (escort off); three days later, the farthest
// (over two weeks' march) sent there too. Not Honshu's farthest to Shanghai, as before ROADMAP R43a: that
// one now boards at its own nearer port (ADR-838), and Honshu's ports are a few days' walk apart; north
// China's hinterland of one port still makes the case.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

function run(late: boolean): { landed: Map<number, number>; ids: number[]; far: number; march: number } {
  const s = new SimServer(() => {});
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 3517, assets: assets1938(W) } }, 0);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
  const w = s.sim!.world;
  if (!w.wars.atWar(JAP, CHI)) s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: JAP, defender: CHI }, now: true }, 1);
  const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
  const landed = new Map<number, number>();
  let watch: number[] = [];
  const step = (): void =>
    s.sim!.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (watch.includes(ev[i + 2]!) && ev[i + 1] === EventKind.FormationLanded) landed.set(ev[i + 2]!, x.tick);
      drain(x);
    });
  step();
  const c = w.formations.cols;
  const port = portNamed(w, 'Tientsin');
  const [px, py] = [w.ports[port]!.cell % W, Math.floor(w.ports[port]!.cell / W)];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || transportsPort(w, id, false) !== port) return;
    all.push([id, (c.x[id]! - px) ** 2 + (c.y[id]! - py) ** 2]);
  });
  all.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const ids = all.slice(0, 2).map((d) => d[0]);
  const far = all[all.length - 1]![0];
  watch = [...ids, far];
  const click = (sel: number[]): void => {
    const cmds: Command[] = [...sel].sort((a, b) => a - b).map((id) => ({ kind: 'moveFormation', id, x: TOKYO[0], y: TOKYO[1], nation: JAP, escort: false }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
  };
  click(ids);
  for (let h = 0; h < 72; h++) step();
  let march = 0;
  if (late) {
    click([far]);
    march = marchHoursLeft(w, far);
  }
  for (let h = 0; h < 24 * 120 && (ids.some((id) => !landed.has(id)) || (late && !landed.has(far))); h++) step();
  process.stderr.write(`R31f late ${late}: far ${far} march ${march.toFixed(0)} h, landed ${[...landed]}\n`);
  return { landed, ids, far, march };
}

describe('a convoy does not wait for a later order from far (ROADMAP R31f)', () => {
  it("Tientsin's two to Tokyo, its port's farthest sent there three days later: the two land as without it", () => {
    const alone = run(false);
    const late = run(true);
    expect(late.march, 'the late one more than a week from the port').toBeGreaterThan(24 * 7);
    for (const id of late.ids) expect(late.landed.has(id), `${id} landed`).toBe(true);
    const at = (r: typeof late): number => Math.max(...r.ids.map((id) => r.landed.get(id)!));
    expect(at(late), 'the two land as without the late one (red: they wait for its march)').toBeLessThanOrEqual(at(alone) + 24);
    expect(Math.abs(late.landed.get(late.ids[0]!)! - late.landed.get(late.ids[1]!)!), 'the two together').toBeLessThanOrEqual(24);
    expect(late.landed.has(late.far), 'the late one lands too, by the next voyage').toBe(true);
  }, 600_000);
});
