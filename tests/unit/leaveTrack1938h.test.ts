import { describe, expect, it } from 'vitest';
import { EventKind, TrackEnd } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R68b (ADR-983): a game started from a year to play free leaves the historical track by a command of its own
// (`leaveTrack`, logged): the track ends that hour for that reason (`TrackEnd.free`, not an intervention) and the world
// is reseeded from the game's second seed; none runs after, so a second one changes nothing.

const AFTER = 424242;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe('leaving the historical track (ROADMAP R68b)', () => {
  it('ends it for a free game, reseeds, and is logged; a second is refused as having no effect', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: AFTER } });
    sim.step(24, quiet);
    const t = sim.world.track!;
    expect(t.ended).toBe(false);
    sim.command({ kind: 'leaveTrack' });
    const ends: number[] = [];
    let refused = 0;
    sim.step(1, (w) => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.TrackEnded) ends.push(ev[i + 3]!);
        if (ev[i + 1] === EventKind.CommandRefused) refused++;
      }
      quiet(w);
    });
    expect(ends).toEqual([TrackEnd.free]);
    expect(refused).toBe(0);
    expect(t.ended).toBe(true);
    expect(sim.world.seed).toBe(AFTER);
    expect(sim.world.commandLog.at(-1)?.cmd).toEqual({ kind: 'leaveTrack' });
    sim.command({ kind: 'leaveTrack' });
    sim.step(1, (w) => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.CommandRefused) refused++;
      quiet(w);
    });
    expect(refused).toBe(1);
  });
});
