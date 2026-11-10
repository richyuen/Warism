import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind, TrackEnd } from '../../src/shared/events';
import { project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62j0 (SPEC §7.7, ADR-945): the first intervention ends the historical track at its hour and reseeds the
// world from the seed for after it; no event of the timeline fires after. Each kind listed here, given 6 hours, 1, 30
// and 365 days in, ends it. Every command is an intervention (a God Mode act, an editor edit, the taking of a nation);
// one refused changes nothing and ends nothing.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const at = (lon: number, lat: number): { x: number; y: number } => {
  const [u, v] = project(lon, lat);
  return { x: u * SIZE_1938.w, y: v * SIZE_1938.h };
};

/** One command of each kind listed: God Mode, the editor, the taking of a nation. */
const LISTED: Command[] = [
  { kind: 'setPlayer', nation: id('GER') },
  { kind: 'renameNation', nation: id('FRA'), name: 'Gaul' },
  { kind: 'recolorNation', nation: id('ITA'), color: 0x123456 },
  { kind: 'setGold', nation: id('ENG'), value: 5000 },
  { kind: 'setAi', nation: id('SOV'), enabled: false },
  { kind: 'setNukes', nation: id('USA'), allowed: false },
  { kind: 'setSetting', key: 'winnerTakesAll', value: true },
  { kind: 'spawnFormation', nation: id('GER'), ...at(13.4, 52.5), strength: 1000 },
  { kind: 'godNuke', ...at(10, 25), thermonuclear: false },
  { kind: 'forceWar', attacker: id('SWE'), defender: id('SWI') },
  { kind: 'collapseNation', nation: id('LUX') },
  { kind: 'editPaint', layer: 'nation', tool: 'brush', ...at(2.35, 48.86), x2: 0, y2: 0, r: 1, value: id('GER'), mask: null },
  { kind: 'spawnCity', ...at(20, 25), name: 'Testville', size: 1 },
];
const HOURS = [6, 24, 30 * 24, 365 * 24];
const AFTER = 4242;

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

describe("the historical track's end at the first intervention (ROADMAP R62j0)", () => {
  const make = (): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
  const saves: Uint8Array[] = [];
  const base = make();
  base.world.track!.afterSeed = AFTER;
  for (const h of HOURS) {
    base.step(h - base.tick, quiet);
    saves.push(base.save());
  }

  HOURS.forEach((h, k) => {
    it(`each listed kind, given ${h} hours in, ends the track that hour and reseeds; no event fires after`, () => {
      for (const [j, cmd] of LISTED.entries()) {
        const sim = make();
        sim.load(saves[k]!);
        const t = sim.world.track!;
        expect(t.ended, cmd.kind).toBe(false);
        const next = t.next;
        sim.command(cmd);
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
        expect(refused, cmd.kind).toBe(0);
        expect(ends, cmd.kind).toEqual([TrackEnd.intervention]);
        expect(t.ended, cmd.kind).toBe(true);
        expect(sim.world.seed, cmd.kind).toBe(AFTER);
        expect(t.next, cmd.kind).toBe(next);
        // To past the hour the next event was due, once at each time (an ended track's step is the same whatever ended
        // it): a track still running would have applied it.
        if (j > 0) continue;
        const due = t.ticks[next]!;
        expect(due, cmd.kind).toBeGreaterThan(h);
        let fired = 0;
        sim.step(due - sim.tick + 1, (w) => {
          const ev = w.out.events;
          for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.TrackSkipped || ev[i + 1] === EventKind.NationBorn || ev[i + 1] === EventKind.TrackEnded) fired++;
          quiet(w);
        });
        expect(fired, cmd.kind).toBe(0);
        expect(t.next, cmd.kind).toBe(next);
      }
    });
  });

  it('a command refused ends nothing', () => {
    const sim = make();
    sim.load(saves[0]!);
    sim.command({ kind: 'setGold', nation: 9999, value: 1 });
    sim.step(1, quiet);
    expect(sim.world.track!.ended).toBe(false);
  });
});
