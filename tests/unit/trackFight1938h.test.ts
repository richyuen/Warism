import { describe, expect, it } from 'vitest';
import { playerHeld } from '../../src/sim/ai/layers';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { kmPerCell, project } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { FIGHT_BAND_KM, FIGHT_DAYS, FIGHT_OUTNUMBERED } from '../../src/sim/track';
import { Domain, PlayerOrderKind, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R66d (ADR-974): for FIGHT_DAYS before an `occupy` stage its area's hold is lifted for its taker's side and
// their foes; land goes only to the taker's side and only of the stage's land; nothing fights outside the area or after
// the stage applies; a save loaded within the window plays on as the run it came from.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
// Western Poland, taken by Germany on 15 January 1938, its window from the 8th; the front held from the 1st.
const RING: [number, number][] = [[14.0, 54.5], [19.0, 54.5], [19.0, 50.0], [14.0, 50.0]];
const TL: TimelineFile = {
  events: [
    { date: '1938-01-01', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
    { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1939-01-01' },
    { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'GER', of: ['POL'], ring: RING },
  ],
};
const STAGE = 14 * 24 + 1;
const OPEN = STAGE - FIGHT_DAYS * 24;

describe('a window of fighting before a stage (ROADMAP R66d)', () => {
  it('land to the taker only and only of its land; no fighting outside its area, before the window or after the stage', () => {
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TL);
    const w = sim.world;
    const { w: W, h: H } = w.cells;
    const [GER, POL] = [id('GER'), id('POL')];
    const band = FIGHT_BAND_KM / kmPerCell(W);
    const [u0, v0] = project(14.0, 54.5);
    const [u1, v1] = project(19.0, 50.0);
    const inArea = (x: number, y: number): boolean => x >= u0 * W - band && x <= u1 * W + band && y >= v0 * H - band && y <= v1 * H + band;
    const inRing = (c: number): boolean => {
      const [x, y] = [(c % W) + 0.5, Math.floor(c / W) + 0.5];
      return x >= u0 * W && x <= u1 * W && y >= v0 * H && y <= v1 * H;
    };
    const f = w.formations.cols;
    let fought = 0;
    let before = w.cells.controller.slice();
    while (sim.tick < STAGE + 3 * 24) {
      sim.step(1, quiet);
      const ctl = w.cells.controller;
      for (let c = 0; c < ctl.length; c++) {
        if (ctl[c] === before[c]) continue;
        // Across the hold: only to Germany, and only in the ring, and only in the window (the stage's own flip aside).
        if (before[c] === GER) expect(ctl[c], `cell ${c} lost by Germany at hour ${sim.tick}`).not.toBe(POL);
        if (before[c] === POL && ctl[c] === GER) {
          expect(inRing(c), `cell ${c} taken outside the ring at hour ${sim.tick}`).toBe(true);
          expect(sim.tick > OPEN && sim.tick <= STAGE + 1, `cell ${c} taken at hour ${sim.tick}`).toBe(true);
        }
      }
      before = ctl.slice();
      w.formations.forEach((i) => {
        if (f.engaged[i] !== 1 || (f.nation[i] !== GER && f.nation[i] !== POL)) return;
        // A German or Polish formation fights only in the area, in the window.
        expect(inArea(f.x[i]!, f.y[i]!), `formation ${i} engaged outside the area at hour ${sim.tick}`).toBe(true);
        expect(sim.tick > OPEN && sim.tick <= STAGE + 1, `formation ${i} engaged at hour ${sim.tick}`).toBe(true);
        fought++;
      });
    }
    // The window fought.
    expect(fought).toBeGreaterThan(0);
  });

  it("the timeline's arrivals on an enemy's land: a beachhead, kept from the AI until the window opens, on an order to the stage", () => {
    // Twelve German divisions put down at Łódź, in Poland's land, on 2 January for the stage of the 15th.
    const at: [number, number] = [19.46, 51.76];
    const tl: TimelineFile = { events: [...TL.events.slice(0, 2), { date: '1938-01-02', kind: 'forces', nation: 'GER', template: 'infantry_div', count: 12, at, kept: '1938-01-15' }, ...TL.events.slice(2)] };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const GER = id('GER');
    sim.step(24 + 2, quiet);
    const f = w.formations.cols;
    const [u, v] = project(...at);
    const [sx, sy] = w.standPoint(u * w.cells.w, v * w.cells.h);
    expect(w.cells.controller[Math.floor(sy) * w.cells.w + Math.floor(sx)]).toBe(GER);
    const kept = [...w.playerOrders].filter(([i, o]) => o.kind === PlayerOrderKind.kept && f.nation[i] === GER).map(([i]) => i);
    expect(kept.length).toBe(12);
    const start = kept.map((i) => [f.x[i]!, f.y[i]!] as const);
    // The AI leaves them where they are until the window opens; then they are its own again.
    sim.step(OPEN - 1 - sim.tick, quiet);
    kept.forEach((i, k) => {
      if (!w.formations.has(i)) return;
      expect(f.moving[i], `formation ${i} ordered before the window`).toBe(0);
      expect(Math.hypot(f.x[i]! - start[k]![0], f.y[i]! - start[k]![1])).toBeLessThan(1.5);
    });
    sim.step(2, quiet);
    // The AI's from the window's opening; the order, which keeps them from the budget's disbanding, over at the stage.
    for (const i of kept) expect(playerHeld(w, i)).toBe(false);
    for (const i of kept) if (w.formations.has(i)) expect(w.playerOrders.has(i)).toBe(true);
    sim.step(STAGE + 1 - sim.tick, quiet);
    for (const i of kept) expect(w.playerOrders.has(i)).toBe(false);
  });

  it('no window while its taker is far outnumbered in the area (ADR-977)', () => {
    // Luxembourg to take the German land by Trier on the 15th, the front held: far fewer Luxembourgers than Germans there.
    const ring: [number, number][] = [[6.4, 50.3], [7.2, 50.3], [7.2, 49.4], [6.4, 49.4]];
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-01', kind: 'war', attackers: ['LUX'], defenders: ['GER'] },
        { date: '1938-01-01', hour: 1, kind: 'hold', sides: [['LUX'], ['GER']], until: '1939-01-01' },
        { date: '1938-01-15', hour: 1, kind: 'occupy', by: 'LUX', of: ['GER'], ring },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, tl);
    const w = sim.world;
    const f = w.formations.cols;
    const [LUX, GER] = [id('LUX'), id('GER')];
    sim.step(OPEN + 1, quiet);
    // The area: the ring's box grown by FIGHT_BAND_KM.
    const band = FIGHT_BAND_KM / kmPerCell(w.cells.w);
    const [u0, v0] = project(6.4, 50.3);
    const [u1, v1] = project(7.2, 49.4);
    const inArea = (i: number): boolean =>
      f.x[i]! >= u0 * w.cells.w - band && f.x[i]! <= u1 * w.cells.w + band && f.y[i]! >= v0 * w.cells.h - band && f.y[i]! <= v1 * w.cells.h + band;
    const men = (n: number): number => {
      let m = 0;
      w.formations.forEach((i) => {
        if (f.nation[i] === n && w.rules?.templates[f.template[i]!]?.domain === Domain.land && inArea(i)) m += f.strength[i]!;
      });
      return m;
    };
    // The Luxembourgers in the area are under a third of the Germans there.
    expect(men(LUX)).toBeLessThan(men(GER) * FIGHT_OUTNUMBERED);
    expect(w.holdsAt(LUX, GER, 0, 0)).toBe(true);
    while (sim.tick < STAGE) {
      sim.step(1, quiet);
      w.formations.forEach((i) => {
        if (f.nation[i] === LUX) expect(f.engaged[i], `formation ${i} of Luxembourg fought at hour ${sim.tick}`).toBe(0);
      });
    }
  });

  it('a save within the window plays on as the run it came from', () => {
    const assets = assets1938(SIZE_1938.w);
    const a = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, TL);
    a.step(OPEN + 3 * 24, quiet);
    const b = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, TL);
    b.load(a.save());
    a.step(6 * 24, quiet);
    b.step(6 * 24, quiet);
    expect(b.hash()).toBe(a.hash());
  });
});
