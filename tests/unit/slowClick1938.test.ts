import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';
import { bestWayHours, clickBest, SLOW_CLICK_DAYS, SlowClicks } from '../helpers/slowClick';

// ROADMAP R44 (ADR-843, the user's decision): `slowClick`, the bound on a click's landing, on the critic's two cases:
// the divisions of Japan nearest Tokyo sent to Shanghai in one click (`critic/scripts/c47_far.ts`). R49-N5: 20661, two,
// 26.3 days for a 5-day crossing; R50-N1: 20841, three, 39.6 days for 4 (the landing waited 35 days at Tokyo for 366,
// walking from western Honshu). Both broken at `3fe138b1` (run 50's code), ashore within the bound since R43a.
const { w: W, h: H } = SIZE_1938;

function farClick(seed: number, n: number, days = 60): { lines: string[]; slow: SlowClicks } {
  const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
  const w = sim.world;
  const [jap, chi] = [nationId('JAP'), nationId('CHI')];
  const from = cellOf(139.69, 35.69, W, H);
  const to = cellOf(121.47, 31.23, W, H);
  const ashore = new Set<number>();
  const refused = new Set<number>();
  const quiet = (x: World): void => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      if (ev[i + 1] === EventKind.MoveRejected) refused.add(ev[i + 2]!);
      if (ev[i + 1] === EventKind.FormationLanded && x.cells.owner[Math.floor(ev[i + 5]!) * W + Math.floor(ev[i + 4]!)] !== jap) ashore.add(ev[i + 2]!);
    }
    ev.length = 0;
    x.out.fires.length = 0;
  };
  sim.command({ kind: 'setPlayer', nation: jap });
  sim.step(1, quiet);
  if (!w.wars.atWar(jap, chi)) sim.command({ kind: 'declareWar', attacker: jap, defender: chi } as Command);
  sim.step(1, quiet);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const land = comp[Math.floor(from[1]) * W + Math.floor(from[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== jap || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== land) return;
    all.push([id, (c.x[id]! - from[0]) ** 2 + (c.y[id]! - from[1]) ** 2]);
  });
  const ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, n).map((d) => d[0]);
  const lines: string[] = [];
  const slow = new SlowClicks((line) => lines.push(line));
  slow.click(w, ids, landingOf(w, Math.floor(to[1]) * W + Math.floor(to[0]))!.water);
  for (const id of ids) sim.command({ kind: 'moveFormation', id, x: to[0] + 0.5, y: to[1] + 0.5, nation: jap, escort: true } as Command);
  for (let h = 0; h < days * 24 && slow.ashore === 0 && lines.length === 0; h++) {
    ashore.clear();
    refused.clear();
    sim.step(1, quiet);
    slow.hour(w, ashore, refused);
  }
  return { lines, slow };
}

describe('a click\'s landing has a bound: `slowClick` (ROADMAP R44)', () => {
  for (const [seed, n] of [[20661, 2], [20841, 3]] as const) {
    it(`${seed}: ${n} of Japan's divisions from Tokyo to Shanghai, ashore within ${SLOW_CLICK_DAYS} days of its best way`, () => {
      const { lines, slow } = farClick(seed, n);
      process.stderr.write(`${seed}: ${slow.note()}\n`);
      expect(slow.reckoned, 'the click reckoned').toBe(1);
      expect(lines).toEqual([]);
      expect(slow.ashore, 'ashore').toBe(1);
    }, 300_000);
  }

  // ROADMAP R54a (critic run 55, 26045): three of a click already in China set its best way at 2.5 days, and the one
  // crossing from Honshu, whose own was 10.2, broke the bound while within its own. One on the landing's landmass walks
  // there and is not reckoned.
  it('a click\'s best way is that of its divisions that cross the sea, not of one on the target\'s land', () => {
    const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
    const w = sim.world;
    const jap = nationId('JAP');
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const to = cellOf(121.47, 31.23, W, H);
    const over = landingOf(w, Math.floor(to[1]) * W + Math.floor(to[0]))!;
    const tokyo = cellOf(139.69, 35.69, W, H);
    const compOf = (id: number): number => comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)]!;
    const nearest = (p: readonly number[], want: number): number => {
      let [best, bd] = [0, Infinity];
      w.formations.forEach((id) => {
        if (c.nation[id] !== jap || w.isFleet(id) || w.offLand(id) || compOf(id) !== want) return;
        const d = (c.x[id]! - p[0]!) ** 2 + (c.y[id]! - p[1]!) ** 2;
        if (d < bd) [best, bd] = [id, d];
      });
      return best;
    };
    const mainland = nearest(to, comp[over.land]!);
    const honshu = nearest(tokyo, comp[Math.floor(tokyo[1]) * W + Math.floor(tokyo[0])]!);
    expect(mainland, 'a Japanese division on the mainland').toBeGreaterThan(0);
    expect(honshu, 'one on Honshu').toBeGreaterThan(0);
    const own = bestWayHours(w, honshu, over.water);
    expect(Number.isFinite(own)).toBe(true);
    expect(clickBest(w, [mainland, honshu], over.water), 'the mainland one by sea is the sooner').toBeLessThan(own);
    expect(clickBest(w, [mainland, honshu], over.water, over.land)).toBe(own);
  });
});
