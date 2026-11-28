import { describe, expect, it } from 'vitest';
import type { FromWorker, Snapshot } from '../../src/shared/protocol';
import { project } from '../../src/sim/data/projection';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { step } from '../../src/sim/tick';
import { FIGHT_DAYS } from '../../src/sim/track';
import { Domain, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';

// ROADMAP R237 (SPEC §2.6, I4: what a view asks leaves the hash unchanged). The historical track keeps the stages
// whose days of fighting are open in an hour (R66d, ADR-974): made at the hour's first asking, of the events applied
// by then and of the formations as they then stand (`outnumbered`, ADR-977). Asked between two ticks, the list was
// made before the hour's commands and events, and the hour's systems then went by it: at a stage's own hour its land
// was fought for an hour more. The worker asks at every picture since R235 (which marches are advances, ADR-1162:
// `World.holdsLand`), so the replay in the page went another way than the replay: on the scenario's own seed, by the
// worker's picture once a day, another hash from the first year on (day 300); by `holdsLand` alone once a day, from
// late September 1939. The list is a tick's own: forgotten when a tick begins (`Track.tickBegins`).
//
// The first two tests are the mechanism, red before. The four after them are I4 on a world with a track (the toy
// world's is `server.test.ts`): green before too, since in this small world no list kept from a question changed an
// outcome; the replay itself is read by the run above (PROGRESS, R237).

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
// Germany and Poland at war, their front held from the first hour; western Poland Germany's on 15 January 1938, its
// days of fighting from the 8th.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const TIMELINE: TimelineFile = {
  events: [
    { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
    { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' },
    { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING },
  ],
};
/** To the end of 16 January: the days before the stage's window, its days, its hour, and a day and a half after. */
const DAYS = 16;
/** The stage's hour, and the first hour of its days of fighting. */
const STAGE = 14 * 24 + 1;
const OPEN = STAGE - FIGHT_DAYS * 24;

const world = (seed: number): Sim => new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) }, TIMELINE);

/** The world three hours in with its AI off (the armies stay where they stand), stepped on to `tick`. */
function still(tick: number): Sim {
  const sim = world(SEED_1938H);
  sim.step(3, quiet);
  sim.world.settings.aiEnabled = false;
  sim.step(tick - 3, quiet);
  return sim;
}

/** A cell of the stage's land: in its ring, Poland's and held by Poland. */
function ringCell(w: World): number {
  const { w: W, h: H } = w.cells;
  const POL = id('POL');
  const [u0, v0] = project(14.0, 54.5);
  const [u1, v1] = project(19.0, 50.0);
  for (let y = Math.ceil(v0 * H); y < v1 * H; y++) {
    for (let x = Math.ceil(u0 * W); x < u1 * W; x++) if (w.cells.owner[y * W + x] === POL && w.cells.controller[y * W + x] === POL) return y * W + x;
  }
  throw new Error("no cell of Poland's in the ring");
}

/** The hash at each day's end of a run of DAYS, an hour a step, `between` called after every tick. */
function hashes(sim: Sim, tick: () => void, between: (w: World) => void): string[] {
  const out: string[] = [];
  for (let t = 1; t <= DAYS * 24; t++) {
    tick();
    between(sim.world);
    if (t % 24 === 0) out.push(`day ${t / 24}: ${sim.hash().toString(16)}`);
  }
  return out;
}

/** The run with nothing asked. */
function plain(seed: number): string[] {
  const sim = world(seed);
  return hashes(sim, () => sim.step(1, quiet), () => undefined);
}

/** How many times `World.holdsLand` is asked from now on. */
function countAsks(w: World): () => number {
  let n = 0;
  const real = w.holdsLand.bind(w);
  w.holdsLand = (an: number, d: number, c: number): boolean => {
    n++;
    return real(an, d, c);
  };
  return () => n;
}

describe('the open stages a tick goes by are of its own asking (ROADMAP R237)', () => {
  it("a stage's own hour: asked before the tick its land may be taken; in the tick, the stage applied, the hold stands", () => {
    const [GER, POL] = [id('GER'), id('POL')];
    const sim = still(STAGE);
    const w = sim.world;
    const cell = ringCell(w);
    // Between two ticks, the last hour of the stage's days: Germany may take the stage's land.
    expect(w.holdsLand(GER, POL, cell)).toBe(false);
    // The tick of the stage's hour: its event, then a system that asks the same.
    let inTick: boolean | null = null;
    step(w, [(x) => void (inTick = x.holdsLand(GER, POL, cell))]);
    expect(w.cells.controller[cell], "the stage's land is Germany's").toBe(GER);
    expect(inTick, 'the hold stands on the land the stage gave, in the hour it gave it').toBe(true);
  }, 300_000);

  it("in a stage's days: asked before the tick with the taker's men in its area; in the tick, they gone, the stage is shut", () => {
    const [GER, POL] = [id('GER'), id('POL')];
    const sim = still(OPEN + 24);
    const w = sim.world;
    const cell = ringCell(w);
    // Between two ticks, a day into the stage's days: its land may be taken.
    expect(w.holdsLand(GER, POL, cell)).toBe(false);
    // The tick: a system before the first asking leaves Germany a man a formation (far outnumbered in the stage's
    // area, ADR-977: its days are shut), then a system asks.
    let inTick: boolean | null = null;
    step(w, [
      (x) => x.formations.forEach((f) => void (x.formations.cols.nation[f] === GER && x.rules?.templates[x.formations.cols.template[f]!]?.domain === Domain.land && (x.formations.cols.strength[f] = 1))),
      (x) => void (inTick = x.holdsLand(GER, POL, cell)),
    ]);
    expect(inTick, 'the stage is shut by the men of the hour, not by those of the question before it').toBe(true);
    // And asked again between two ticks, of the men as they now stand: shut.
    expect(w.holdsLand(GER, POL, cell)).toBe(true);
  }, 300_000);
});

describe('a question asked of the historical track between two ticks changes nothing (ROADMAP R237; I4)', () => {
  for (const seed of [SEED_1938H, 7]) {
    it(`seed ${seed}: the three questions of a hold, asked after every tick`, () => {
      const [GER, POL] = [id('GER'), id('POL')];
      const sim = world(seed);
      let held = 0;
      const asked = hashes(
        sim,
        () => sim.step(1, quiet),
        (w) => {
          // Of two cells in the stage's ring's box, as combat, the planners and the territory system ask.
          const c = Math.floor(0.2 * w.cells.h) * w.cells.w + Math.floor(0.55 * w.cells.w);
          if (w.holdsAt(GER, POL, c, c)) held++;
          if (w.holdsPlan(GER, POL)) held++;
          if (w.holdsLand(GER, POL, c)) held++;
          // And by where two formations stand (ROADMAP R243), as combat and the checker ask.
          w.holdsHere(GER, POL, c, c);
        },
      );
      // The hold stood and was asked of (three questions an hour, each true outside the stage's days).
      expect(held).toBeGreaterThan(24 * 3);
      expect(asked).toEqual(plain(seed));
    }, 300_000);

    it(`seed ${seed}: the worker's picture after every tick, which asks which marches are advances`, () => {
      let last: Snapshot | null = null;
      const server = new SimServer((m: FromWorker) => {
        if (m.type === 'snapshot') last = m.snap;
      });
      const sim = world(seed);
      server.sim = sim;
      const asks = countAsks(sim.world);
      // The view's part: each picture is given back before the next is asked for.
      let given: Snapshot | null = null;
      const giveBack = (): void => {
        const s: Snapshot | null = last;
        if (s && s !== given) server.handle({ type: 'ack', seq: s.seq, buffers: s.buffers }, 0);
        given = s;
      };
      server.handle({ type: 'subscribe', sub: { bbox: [0, 0, Infinity, Infinity], z: 0, tier: 0, wantsElements: false } }, 0);
      giveBack();
      let pictures = 0;
      let reqId = 1;
      const served = hashes(
        sim,
        () => {
          const before: Snapshot | null = last;
          server.handle({ type: 'step', n: 1, reqId: reqId++ }, 0);
          if (last !== before) pictures++;
          giveBack();
        },
        () => undefined,
      );
      // A picture an hour, and the worker did ask of the land across the held front.
      expect(pictures).toBe(DAYS * 24);
      expect(asks()).toBeGreaterThan(0);
      expect(served).toEqual(plain(seed));
    }, 300_000);
  }
});
