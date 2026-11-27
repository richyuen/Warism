import { describe, expect, it } from 'vitest';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { kmPerCell, project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { marchTo } from '../../src/sim/systems/movement';
import { FIGHT_DAYS } from '../../src/sim/track';
import { Domain, type World } from '../../src/sim/world';
import { advancing } from '../../src/worker/advancing';
import { assets1938 } from '../helpers/earth';

// ROADMAP R235 (ADR-1162; the user: "the arrows are misleading here", the replay's 23 November 1939 at Strasbourg):
// a march is an advance, and its arrow bold, only onto land its nation may take today. Across a front the historical
// track holds no march is one; in the days before a stage, a march of the taker's side onto the stage's land is, and
// no other. Asked of the world by the worker (`advancing`), as the territory system asks it (`World.holdsLand`).

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
// Western Poland, taken by Germany on 15 January 1938, its window from the 8th; the front held from the 1st.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const WAR: TimelineFile['events'][number] = { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] };
const HELD: TimelineFile = {
  events: [WAR, { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' }, { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING }],
};
const STAGE = 14 * 24 + 1;
const OPEN = STAGE - FIGHT_DAYS * 24;

/** The world of `timeline` three hours in, its AI off: the marches of a test stay as it orders them. */
function world(timeline: TimelineFile): Sim {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);
  sim.step(3, quiet);
  sim.world.settings.aiEnabled = false;
  return sim;
}

/**
 * Three marches ordered now, each onto land a nation at war with its own holds, within an advance's reach: Germany's
 * onto the stage's land (`into`), Germany's onto Poland's land beside the ring, east of it (`beside`), and Poland's
 * onto Germany's (`back`). Their formations' ids.
 */
function marches(w: World): { into: number; beside: number; back: number } {
  const { w: W, h: H } = w.cells;
  const [GER, POL] = [id('GER'), id('POL')];
  const [u0, v0] = project(14.0, 54.5);
  const [u1, v1] = project(19.0, 50.0);
  const inRing = (x: number, y: number): boolean => x + 0.5 >= u0 * W && x + 0.5 <= u1 * W && y + 0.5 >= v0 * H && y + 0.5 <= v1 * H;
  const f = w.formations;
  /** A land formation of `nation` on land, and a cell `foe` holds 2.5 to 5 cells from it for which `ok`: the march ordered, its id. */
  const march = (nation: number, foe: number, ok: (x: number, y: number) => boolean, not: readonly number[] = []): number => {
    let found = 0;
    f.forEach((fid) => {
      if (found !== 0 || not.includes(fid) || f.cols.nation[fid] !== nation || w.rules?.templates[f.cols.template[fid]!]?.domain !== Domain.land || w.offLand(fid)) return;
      const [fx, fy] = [Math.floor(f.cols.x[fid]!), Math.floor(f.cols.y[fid]!)];
      for (let dy = -5; dy <= 5 && found === 0; dy++) {
        for (let dx = -5; dx <= 5 && found === 0; dx++) {
          const d = Math.hypot(dx, dy);
          const [x, y] = [fx + dx, fy + dy];
          if (d < 2.5 || d > 5 || w.cells.controller[y * W + x] !== foe || !ok(x, y)) continue;
          if (marchTo(w, fid, x + 0.5, y + 0.5)) found = fid;
        }
      }
    });
    expect(found, `a march of nation ${nation} onto nation ${foe}'s land`).toBeGreaterThan(0);
    return found;
  };
  const into = march(GER, POL, inRing);
  const beside = march(GER, POL, (x, y) => !inRing(x, y) && x + 0.5 > u1 * W + 3, [into]);
  const back = march(POL, GER, () => true);
  for (const m of [into, beside, back]) expect(f.cols.moving[m], `march ${m}`).toBe(1);
  return { into, beside, back };
}

/** Which of `ids` are on an advance, by their ways as the snapshot gives a march on land (from where it stands to its target's point). */
function onAdvance(w: World, ids: readonly number[]): number[] {
  const c = w.formations.cols;
  const got = advancing(w, ids, (i) => [c.x[ids[i]!]!, c.y[ids[i]!]!, ...w.cellPoint(c.targetCell[ids[i]!]!)], kmPerCell(w.cells.w));
  return ids.filter((x) => got.has(x));
}

describe('which marches are advances across a front the historical track holds (ROADMAP R235)', () => {
  it('none across a held front; in the days of a stage, the taker\'s onto the stage\'s land alone', () => {
    const sim = world(HELD);
    const w = sim.world;
    // The front held, no stage near: each march goes over land of a nation at war with its own, and none is an advance.
    expect(w.holds(id('GER'), id('POL'))).toBe(true);
    const first = marches(w);
    expect(onAdvance(w, [first.into, first.beside, first.back])).toEqual([]);
    // The stage's window opens. Marches ordered afresh, from where the formations are now: Germany's onto the stage's
    // land is an advance. Not Germany's onto Poland's land beside the ring, nor Poland's onto Germany's: the hold
    // stands there, whatever is fought for elsewhere (a hold asked of the two nations alone would give all three).
    while (sim.tick < OPEN + 1) sim.step(1, quiet);
    const then = marches(w);
    expect(onAdvance(w, [then.into, then.beside, then.back])).toEqual([then.into]);
  }, 300_000);

  it('the same marches with no hold between the two: each an advance, as in any war', () => {
    const w = world({ events: [WAR] }).world;
    expect(w.holds(id('GER'), id('POL'))).toBe(false);
    const m = marches(w);
    expect(onAdvance(w, [m.into, m.beside, m.back])).toEqual([m.into, m.beside, m.back]);
  }, 300_000);
});
