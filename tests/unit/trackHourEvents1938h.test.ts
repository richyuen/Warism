import { describe, expect, it } from 'vitest';
import { project } from '../../src/sim/data/projection';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { step } from '../../src/sim/tick';
import { Domain, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R238 (found by R237). The historical track keeps an hour's open stages (R66d, ADR-974) from the hour's first
// asking. An arrival of the timeline's asks while it is applied (`forces`, R82b: whether its cell is the land of a
// stage open for its side), so the hour's list was of the events and the men up to that arrival: a stage applied
// after it in the same hour stayed open for the hour, and the men who arrived after it were not counted (ADR-977:
// whether the taker's side is far outnumbered in the stage's area). The list is forgotten after each event the track
// applies (`Track.eventApplied`): the hour's systems go by a list of all the hour's events.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
type Event = TimelineFile['events'][number];
// Germany and Poland at war, their front held from the first hour; western Poland Germany's on 15 January 1938, its
// days of fighting from the 8th.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const WAR: Event = { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] };
const HOLD: Event = { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' };
const STAGE: Event = { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING };
/** Warsaw, east of the stage's area: where the arrival that asks is set down. */
const WARSAW: [number, number] = [21.0, 52.2];
/** Berlin, in the stage's area (its ring's box and 120 km): where the arrivals that bring men are set down. */
const BERLIN: [number, number] = [13.4, 52.5];
/** A German division at Warsaw: an arrival on land an enemy holds. */
const asks = (date: string): Event => ({ date, hour: 1, kind: 'forces', nation: 'GER', template: 'infantry_div', count: 1, at: WARSAW });

/** The world of `events` three hours in with its AI off (the armies stay where they stand), stepped on to `tick`. */
function still(events: Event[], tick: number): Sim {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, { events });
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

/**
 * Warsaw's cell made a third nation's land, held by Poland: an arrival of Germany's there, at peace with its owner,
 * asks whether it is the land of a stage open for its side (R82b: as Normandy was Vichy's, held by the Germans).
 * Returns how many times the track has been asked that since.
 */
function arrivalAsks(w: World): () => number {
  const { w: W, h: H } = w.cells;
  const [u, v] = project(...WARSAW);
  const [x, y] = w.standPoint(u * W, v * H);
  const at = Math.floor(y) * W + Math.floor(x);
  expect(w.cells.controller[at], "Warsaw's holder").toBe(id('POL'));
  w.setOwner(at, id('CZS'));
  const t = w.track!;
  const real = t.takeOpen.bind(t);
  let n = 0;
  t.takeOpen = (world: World, an: number, d: number, c: number): boolean => {
    n++;
    return real(world, an, d, c);
  };
  return () => n;
}

describe("the open stages an hour's systems go by are of all the hour's events (ROADMAP R238)", () => {
  it('a stage applied after an arrival that asked, in one hour: the hold stands on its land in that hour', () => {
    const [GER, POL] = [id('GER'), id('POL')];
    const HOUR = 14 * 24 + 1;
    const sim = still([WAR, HOLD, asks('1938-01-15'), STAGE], HOUR);
    const w = sim.world;
    const cell = ringCell(w);
    const asked = arrivalAsks(w);
    // The hour: the arrival (which asks, the stage not yet applied), the stage, then a system that asks.
    let byEvents = -1;
    let inTick: boolean | null = null;
    step(w, [
      (x) => {
        byEvents = asked();
        inTick = x.holdsLand(GER, POL, cell);
      },
    ]);
    expect(byEvents, 'the arrival asked while the events were applied').toBeGreaterThan(0);
    expect(w.cells.controller[cell], "the stage's land is Germany's").toBe(GER);
    expect(inTick, 'the hold stands on the land the stage gave, in the hour it gave it').toBe(true);
  }, 300_000);

  it("men who arrive after an arrival that asked, in one hour of a stage's days: they are counted, and the stage is open", () => {
    const [GER, POL] = [id('GER'), id('POL')];
    // 10 January, in the stage's days: a division at Warsaw, then forty at Berlin.
    const HOUR = 9 * 24 + 1;
    const men: Event = { date: '1938-01-10', hour: 1, kind: 'forces', nation: 'GER', template: 'infantry_div', count: 40, at: BERLIN };
    const sim = still([WAR, HOLD, asks('1938-01-10'), men, STAGE], HOUR);
    const w = sim.world;
    const c = w.formations.cols;
    const cell = ringCell(w);
    // Germany has a man a formation: far outnumbered in the stage's area, its days are shut (ADR-977).
    w.formations.forEach((f) => {
      if (c.nation[f] === GER && w.rules?.templates[c.template[f]!]?.domain === Domain.land) c.strength[f] = 1;
    });
    expect(w.holdsLand(GER, POL, cell), 'before the arrivals').toBe(true);
    const asked = arrivalAsks(w);
    // The hour: the arrival at Warsaw (which asks, Germany still outnumbered), the forty divisions, then a system.
    let byEvents = -1;
    let inTick: boolean | null = null;
    step(w, [
      (x) => {
        byEvents = asked();
        inTick = x.holdsLand(GER, POL, cell);
      },
    ]);
    expect(byEvents, 'the arrival asked while the events were applied').toBeGreaterThan(0);
    expect(inTick, "the stage's land may be taken: its days are open by the men of the hour").toBe(false);
  }, 300_000);
});
