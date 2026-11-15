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

  // ROADMAP R83b: a year played free with 1938's options. They are applied once as the track ends, drawn from the game's
  // second seed (so two seeds give two worlds); the options left at the scenario's leave the world as `leaveTrack` alone.
  it('applies the new-game options as it leaves, from the second seed; none changes nothing', () => {
    const free = (after: number, options?: Record<string, string>): Sim => {
      const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
      sim.step(24, quiet);
      sim.command(options ? { kind: 'leaveTrack', options } : { kind: 'leaveTrack' });
      sim.step(1, quiet);
      return sim;
    };
    const aggr = (sim: Sim): number[] => Array.from(sim.world.nations.cols.aggression.slice(1, 40));
    const plain = free(AFTER);
    const scenario = free(AFTER, { aggression: 'scenario', traits: 'scenario', gold: 'scenario', diplomacy: 'scenario', heroes: 'off' });
    // The world, not its log (which holds the command as given): as a scenario's export reads it.
    expect(scenario.exportScenario().hash).toBe(plain.exportScenario().hash);
    const a = free(AFTER, { aggression: 'random' });
    const b = free(AFTER + 1, { aggression: 'random' });
    expect(aggr(a)).not.toEqual(aggr(plain));
    expect(aggr(a)).not.toEqual(aggr(b));
    expect(a.world.commandLog.at(-1)?.cmd).toEqual({ kind: 'leaveTrack', options: { aggression: 'random' } });
    // Heroes on: the great powers of 1938 still living have theirs.
    const h = free(AFTER, { heroes: 'on' });
    expect(h.world.heroRoster.length).toBeGreaterThan(0);
    expect(plain.world.heroRoster.length).toBe(0);
  });
});
