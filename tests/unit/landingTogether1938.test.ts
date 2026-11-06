import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { FormationDetail } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { navOf, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { atItsPort } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R21e (critic run 32, R32-N1): the divisions of one click to one target land together. Japan
// at war with China, its two divisions nearest Tokyo ordered to Shanghai; each of Japan's transport
// groups has room for one. Before, one boarded at Tokyo and sailed at once (landed hour 123), the
// other marched to Matsuyama for another group (landed hour 510). Now the second group is called to
// the first's port, and the loaded convoy waits there for it, its division's panel saying so
// (`aboard`); they sail together and land within a day.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];

describe('one click lands together (ROADMAP R21e)', () => {
  it('Japan\'s two divisions to Shanghai, a group of room for one each: one port, one sailing, landed within a day', () => {
    const s = new SimServer(() => {});
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
    const sim = s.sim!;
    const w = sim.world;
    if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
    sim.step(1);
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const [lx, ly] = cellOf(139.69, 35.69, W, H);
    const honshu = comp[Math.floor(ly) * W + Math.floor(lx)];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2]);
    });
    const two = all.sort((a, b) => a[1] - b[1]).slice(0, 2).map((d) => d[0]);
    expect(two).toHaveLength(2);
    // Room for one division a group: no group takes both.
    w.formations.forEach((id) => {
      if (w.isFleet(id) && c.nation[id] === JAP && transportRoom(w, id) > 0) expect(transportRoom(w, id)).toBeLessThan(c.strength[two[0]!]! + c.strength[two[1]!]!);
    });
    for (const id of two) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP });
    sim.step(1);
    const voyage = (id: number): FormationDetail['voyage'] => (s as unknown as { voyageOf(w: World, id: number): FormationDetail['voyage'] }).voyageOf(w, id);
    const landed = new Map<number, number>();
    const states = new Set<string>();
    for (let h = 0; h < 24 * 60 && landed.size < 2; h++) {
      sim.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (two.includes(ev[i + 2]!)) expect(ev[i + 1], 'not refused').not.toBe(EventKind.MoveRejected);
          if (ev[i + 1] === EventKind.FormationLanded && two.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
        }
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
      // One at the port, its transports there, while the other is still to come: told it waits for the rest
      // (ROADMAP R33b: ashore, `gathering`; before, aboard).
      if (landed.size === 0) for (const id of two) if (atItsPort(w, id) && !two.every((d) => atItsPort(w, d)) && voyage(id)?.state !== 'waiting') states.add(voyage(id)?.state ?? 'none');
    }
    expect(landed.size, 'both landed').toBe(2);
    const [a, b] = [...landed.values()];
    expect(Math.abs(a! - b!), 'within a day').toBeLessThanOrEqual(24);
    expect([...states], 'at the port, waiting for the rest').toEqual(['gathering']);
  });
});
