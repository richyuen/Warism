import { afterEach, describe, expect, it } from 'vitest';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { formationPath, marchTo, waitsForFront } from '../../src/sim/systems/movement';
import { FIGHT_DAYS, TRACK_PROBE } from '../../src/sim/track';
import { Domain, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R236 (ADR-1163; found by R235, the user's arrows). Across a front the historical track holds no land is
// taken, and a march waits where its next step is onto an enemy's land until that land is taken (PLAN 1.14): a march
// whose way went over a held foe's land stood at the front for as long as the hold lasted. On 23 November 1939 of the
// replay 155 of the world's 269 land marches stood so, 151 of them in the same cell three weeks on. No way is made
// over the land of a foe whose front is held: a march goes round by its own side's land, or it is not ordered; one
// under way when the hold begins is made again at the front, or halts there.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
const WAR: TimelineFile['events'][number] = { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] };
const HOLD: TimelineFile['events'][number] = { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' };
// Western Poland, taken by Germany on 15 January 1938, its days of fighting from the 8th.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const STAGE: TimelineFile['events'][number] = { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING };
const OPEN = 14 * 24 + 1 - FIGHT_DAYS * 24;

afterEach(() => {
  TRACK_PROBE.holdsOff = false;
});

/** Germany and Poland at war, their front held from the first hour: three hours in, the AI off (a test's marches stay its own). */
function held(...more: TimelineFile['events']): Sim {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, { events: [WAR, HOLD, ...more] });
  sim.step(3, quiet);
  sim.world.settings.aiEnabled = false;
  return sim;
}

const cellOf = (w: World, f: number): number => Math.floor(w.formations.cols.y[f]!) * w.cells.w + Math.floor(w.formations.cols.x[f]!);
/** How many cells of `path` nation `n` holds. */
const over = (w: World, path: Int32Array | null, n: number): number => (path ? Array.from(path).filter((k) => w.cells.controller[k] === n).length : -1);

/**
 * A German land formation and a cell Germany holds, 8 cells or more apart, whose way with no hold goes over 4 cells of
 * Poland's or more, and for which `round` says whether the hold leaves a way (Silesia from Brandenburg: round by German
 * land) or none (East Prussia from Brandenburg: none but over Poland). The march is not ordered when this returns.
 */
function across(w: World, round: boolean): { f: number; x: number; y: number } {
  const c = w.formations.cols;
  const W = w.cells.w;
  const [GER, POL] = [id('GER'), id('POL')];
  let found: { f: number; x: number; y: number } | null = null;
  w.formations.forEach((f) => {
    if (found || c.nation[f] !== GER || w.rules?.templates[c.template[f]!]?.domain !== Domain.land || w.offLand(f) || c.x[f]! < 1095 || c.x[f]! > 1105 || c.y[f]! < 260 || c.y[f]! > 272) return;
    const [fx, fy] = [Math.floor(c.x[f]!), Math.floor(c.y[f]!)];
    for (let y = 250; y <= 290 && !found; y += 2) {
      for (let x = 1098; x <= 1140 && !found; x += 2) {
        if (w.cells.controller[y * W + x] !== GER || Math.hypot(x - fx, y - fy) < 8) continue;
        const way = (off: boolean): Int32Array | null => {
          TRACK_PROBE.holdsOff = off;
          const p = marchTo(w, f, x + 0.5, y + 0.5) ? formationPath(w, f) : null;
          TRACK_PROBE.holdsOff = false;
          c.moving[f] = 0;
          w.paths.delete(f);
          return p;
        };
        if (over(w, way(true), POL) >= 4 && (way(false) !== null) === round) found = { f, x, y };
      }
    }
  });
  expect(found, `a German march over Poland with ${round ? 'a' : 'no'} way round`).not.toBeNull();
  return found!;
}

/** Whether formation `f` waits at a front the timeline holds: its next step is the land of a foe held, no stage's days open. */
function waitsAtHeld(w: World, f: number): boolean {
  if (!waitsForFront(w, f)) return false;
  const c = w.formations.cols;
  return w.holdsPlan(c.nation[f]!, w.cells.controller[w.paths.get(f)![c.pathStep[f]! + 1]!]!);
}

describe('a march and a front the historical track holds (ROADMAP R236)', () => {
  it('ordered over the held foe\'s land to its own beyond: it goes round by its own side\'s land and arrives', () => {
    const sim = held();
    const w = sim.world;
    const [GER, POL] = [id('GER'), id('POL')];
    expect(w.holdsPlan(GER, POL)).toBe(true);
    const { f, x, y } = across(w, true);
    expect(marchTo(w, f, x + 0.5, y + 0.5)).toBe(true);
    expect(over(w, formationPath(w, f), POL), "cells of Poland's on the way").toBe(0);
    let days = 0;
    const c = w.formations.cols;
    for (; c.moving[f] === 1 && days < 30; days++) {
      for (let h = 0; h < 24 && c.moving[f] === 1; h++) {
        sim.step(1, quiet);
        expect(waitsAtHeld(w, f), `waits at the held front at hour ${w.tick}`).toBe(false);
      }
    }
    expect(cellOf(w, f), `where it stands after ${days} days`).toBe(y * w.cells.w + x);
  }, 300_000);

  it('ordered to land it reaches only over the held foe\'s: the order is refused, and it stands where it stood', () => {
    const w = held().world;
    const { f, x, y } = across(w, false);
    const at = cellOf(w, f);
    expect(marchTo(w, f, x + 0.5, y + 0.5)).toBe(false);
    expect(w.formations.cols.moving[f]).toBe(0);
    // And onto the held foe's land itself.
    const W = w.cells.w;
    const POL = id('POL');
    let foe = -1;
    for (let k = 0; k < w.cells.controller.length && foe < 0; k++) if (w.cells.controller[k] === POL && Math.hypot((k % W) - (at % W), Math.floor(k / W) - Math.floor(at / W)) < 20) foe = k;
    expect(foe).toBeGreaterThanOrEqual(0);
    expect(marchTo(w, f, (foe % W) + 0.5, Math.floor(foe / W) + 0.5)).toBe(false);
    expect(cellOf(w, f)).toBe(at);
  }, 300_000);

  it('under way over the foe\'s land when the hold begins: its way is made again round it, and it arrives; with no way round it halts', () => {
    const sim = held();
    const w = sim.world;
    const POL = id('POL');
    const c = w.formations.cols;
    for (const round of [true, false]) {
      const { f, x, y } = across(w, round);
      // Ordered as before the hold: the way over Poland's land.
      TRACK_PROBE.holdsOff = true;
      expect(marchTo(w, f, x + 0.5, y + 0.5)).toBe(true);
      expect(over(w, formationPath(w, f), POL)).toBeGreaterThanOrEqual(4);
      TRACK_PROBE.holdsOff = false;
      let days = 0;
      for (; c.moving[f] === 1 && days < 30; days++) {
        for (let h = 0; h < 24 && c.moving[f] === 1; h++) {
          sim.step(1, quiet);
          expect(waitsAtHeld(w, f), `${round ? 'a way round' : 'no way round'}: waits at the held front at hour ${w.tick}`).toBe(false);
        }
      }
      expect(c.moving[f], `${round ? 'a way round' : 'no way round'}: still on the march after 30 days`).toBe(0);
      // With a way round it stands where it was sent; with none, on Germany's land where the front stopped it.
      if (round) expect(cellOf(w, f)).toBe(y * w.cells.w + x);
      else expect(w.cells.controller[cellOf(w, f)]).toBe(id('GER'));
    }
  }, 300_000);

  it('in the days of a stage the taker\'s march onto the stage\'s land is ordered as in any war', () => {
    const sim = held(STAGE);
    const w = sim.world;
    const [GER, POL] = [id('GER'), id('POL')];
    while (sim.tick < OPEN + 1) sim.step(1, quiet);
    expect(w.holds(GER, POL)).toBe(true);
    expect(w.holdsPlan(GER, POL)).toBe(false);
    const c = w.formations.cols;
    const { w: W, h: H } = w.cells;
    const [u0, v0] = project(14.0, 54.5);
    const [u1, v1] = project(19.0, 50.0);
    let ordered = 0;
    w.formations.forEach((f) => {
      if (ordered !== 0 || c.nation[f] !== GER || w.rules?.templates[c.template[f]!]?.domain !== Domain.land || w.offLand(f)) return;
      const [fx, fy] = [Math.floor(c.x[f]!), Math.floor(c.y[f]!)];
      for (let dy = -5; dy <= 5 && ordered === 0; dy++) {
        for (let dx = -5; dx <= 5 && ordered === 0; dx++) {
          const [x, y] = [fx + dx, fy + dy];
          const inRing = x + 0.5 >= u0 * W && x + 0.5 <= u1 * W && y + 0.5 >= v0 * H && y + 0.5 <= v1 * H;
          if (Math.hypot(dx, dy) < 2.5 || w.cells.controller[y * W + x] !== POL || !inRing) continue;
          if (marchTo(w, f, x + 0.5, y + 0.5)) ordered = f;
        }
      }
    });
    expect(ordered, "a German march onto the stage's land").toBeGreaterThan(0);
    expect(over(w, formationPath(w, ordered), POL)).toBeGreaterThan(0);
  }, 300_000);
});
