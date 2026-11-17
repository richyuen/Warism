import { describe, expect, it } from 'vitest';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { AiLayer, PLAYER_AI_DEFAULT } from '../../src/sim/ai/layers';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { waitsForFront } from '../../src/sim/systems/movement';
import { HERO_PRESSURE_MEN, HERO_PRESSURE_PROBE } from '../../src/sim/systems/territory';
import type { World } from '../../src/sim/world';
import { SimServer, WAIT_TOLD_HOURS } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';
import { orderNewsBrief, orderNewsText } from '../../src/ui/orderNewsText';

// ROADMAP R104 (ADR-1095, the user's decisions; found as the user played France against the two Spains): the Char 2C,
// ordered over the border of Nationalist Spain, stood before it "on the march" for days with no word why. No formation
// walks onto an enemy's ground (PLAN 1.14): a cell is taken by the pressure of men, and a hero is one tank.
// (a) A land hero presses as a division's men: alone it takes the ground it is ordered onto.
// (b) A march of the player's that has waited before an enemy's cell a day is told of, once an order.
// The scene: France the player's with its army's AI off (no other French formation comes), at war with Nationalist
// Spain, the Char 2C ordered from Lorraine to a cell three cells inside Spain.

const { w: W } = SIZE_1938;
const [FRA, NSP] = ['FRA', 'NSP'].map(nationId) as [number, number];
const TARGET: [number, number] = [1021.5, 340.5];

interface Run { waited: number; waitedHours: number; taken: number; onSpain: boolean; news: OrderNews[]; toldAfter: number }

/** The scene, `days` days on from the hour the Char 2C first waits before Spain's ground. */
function run(days: number): Run {
  const news: OrderNews[] = [];
  const s = new SimServer((m: FromWorker) => {
    if (m.type === 'orderNews') news.push(m.news);
  });
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 7, assets: assets1938(W), options: { heroes: 'on' } } }, 0);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: FRA } }, 1);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayerAi', layers: PLAYER_AI_DEFAULT & ~AiLayer.army }, now: true }, 1);
  const w = s.sim!.world;
  const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
  const step = (): void => s.sim!.step(1, drain);
  step();
  s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: FRA, defender: NSP }, now: true }, 2);
  const f = w.formations.cols;
  let hero = 0;
  for (const id of w.heroes.keys()) if (f.nation[id] === FRA && !w.isFleet(id)) hero = id;
  expect(hero, 'the Char 2C').toBeGreaterThan(0);
  expect(f.strength[hero]!, 'its men').toBeLessThan(HERO_PRESSURE_MEN / 10);
  s.handle({ type: 'cmds', cmds: [{ kind: 'moveFormation', id: hero, x: TARGET[0], y: TARGET[1], nation: FRA }], now: true }, 3);
  // To the border: until it first waits.
  let waited = -1;
  for (let h = 0; h < 24 * 30 && waited < 0; h++) {
    step();
    if (waitsForFront(w, hero)) waited = w.tick;
  }
  expect(waited, 'it comes to the border and waits before it').toBeGreaterThan(0);
  expect(news.filter((n) => n.kind === 'refused'), 'the order was taken').toEqual([]);
  let [waitedHours, onSpain, toldAfter] = [0, false, -1];
  for (let h = 0; h < 24 * days; h++) {
    step();
    if (waitsForFront(w, hero)) waitedHours++;
    if (w.cells.owner[Math.floor(f.y[hero]!) * W + Math.floor(f.x[hero]!)] === NSP) onSpain = true;
    if (toldAfter < 0 && news.some((n) => n.kind === 'waitsFront' && n.id === hero)) toldAfter = w.tick - waited;
  }
  let taken = 0;
  for (let c = 0; c < w.cells.owner.length; c++) if (w.cells.owner[c] === NSP && w.cells.controller[c] === FRA) taken++;
  return { waited, waitedHours, taken, onSpain, news, toldAfter };
}

describe('a hero at an enemy\'s border (ROADMAP R104)', () => {
  it('before: the Char 2C alone takes no ground in ten days, and the player is told after a day that it waits', () => {
    HERO_PRESSURE_PROBE.off = true;
    try {
      const r = run(10);
      process.stderr.write(`its men only: waited ${r.waitedHours} of 240 hours, France holds ${r.taken} cells of Spain's, told after ${r.toldAfter} hours\n`);
      expect(r.taken, "cells of Spain's France holds").toBe(0);
      expect(r.onSpain).toBe(false);
      expect(r.waitedHours).toBeGreaterThanOrEqual(239);
      // (b) Told once, a day after it began to wait.
      const told = r.news.filter((n) => n.kind === 'waitsFront');
      expect(told).toHaveLength(1);
      expect(told[0]!.nation).toBe(FRA);
      expect(orderNewsBrief(told[0]!, 1, 'Char 2C')).toBe('Char 2C: waits for the ground ahead to be taken');
      expect(orderNewsText(told[0]!, 'Char 2C')).toContain('it waits at the front');
      expect(r.toldAfter).toBeGreaterThanOrEqual(WAIT_TOLD_HOURS);
      expect(r.toldAfter).toBeLessThanOrEqual(WAIT_TOLD_HOURS + 1);
    } finally {
      delete HERO_PRESSURE_PROBE.off;
    }
  }, 600_000);

  it('now: it takes the ground ahead and stands on Spain\'s land within ten days', () => {
    const r = run(10);
    process.stderr.write(`as a division's men: waited ${r.waitedHours} of 240 hours, France holds ${r.taken} cells of Spain's\n`);
    expect(r.taken, "cells of Spain's France holds").toBeGreaterThan(0);
    expect(r.onSpain, "it stood on Spain's land").toBe(true);
    expect(r.waitedHours).toBeLessThan(200);
  }, 600_000);
});
