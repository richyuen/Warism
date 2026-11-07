import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { seaHint, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R37c (critic run 44, R44-N2): two clicks for one place in one hour made two landings from two ports, and
// the one from the nearer port sailed first and landed alone, a week early (3517: the fresh one h500, the two
// h682). Japan's three nearest Tokyo: the first two sent to Shanghai (escort on); two hours after the first is at
// its port, in one hour, the third clicked onto Fuzhou, then the two. Each landing for that place now waits while
// the other would land more than a day after it: the three land within a day, or are told.
// ROADMAP R38b (critic run 46, R46-N1): while the fresh one's landing waits for the other its panel read "ready"
// for days: it now says it waits for the landing from the other port (`sibling`), "ready" a day at most.
// ROADMAP R42a: the cursor on Fuzhou with the fresh one selected says so too: when it sails, waiting for which.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

describe('two clicks for one place in one hour, from two ports: they land together (ROADMAP R37c)', () => {
  for (const seed of [3517, 14003, 14011]) {
    it(`seed ${seed}: the fresh one, then the two, onto Fuzhou: the three land within a day, or are told`, () => {
      const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
      const w = sim.world;
      const landed = new Map<number, number>();
      const told = new Set<number>();
      let ids: number[] = [];
      const take = (x: World): void => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (!ids.includes(ev[i + 2]!)) continue;
          if (ev[i + 1] === EventKind.FormationLanded && !landed.has(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
          if (ev[i + 1] === EventKind.MoveRejected) told.add(ev[i + 2]!);
        }
        ev.length = 0;
        x.out.fires.length = 0;
      };
      sim.command({ kind: 'setPlayer', nation: JAP });
      sim.step(1, take);
      if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
      sim.step(1, take);
      const c = w.formations.cols;
      const comp = navOf(w).grid.component;
      const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
      const all: [number, number][] = [];
      w.formations.forEach((id) => {
        if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
        all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
      });
      ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 3).map((d) => d[0]);
      const [pair, fresh] = [ids.slice(0, 2), ids[2]!];
      const click = (sel: number[], [x, y]: [number, number]): void => {
        for (const id of [...sel].sort((a, b) => a - b)) sim.command({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true } as Command);
        sim.applyNow(take);
      };
      click(pair, SHANGHAI);
      for (let h = 0; h < 24 * 10 && !pair.some((id) => atItsPort(w, id)); h++) sim.step(1, take);
      sim.step(2, take);
      click([fresh], FUZHOU);
      click(pair, FUZHOU);
      const states = new Map<string, number>();
      let hinted: string | null = null;
      for (let h = 0; h < 24 * 90 && ids.some((id) => w.formations.has(id) && !landed.has(id) && !told.has(id)); h++) {
        sim.step(1, take);
        const voyage = voyageOf(w, fresh);
        const v = voyage?.state;
        if (v) states.set(v, (states.get(v) ?? 0) + 1);
        if (v === 'sibling' && hinted === null && voyage!.days! > 1) {
          const sails = seaHint(w, [fresh], FUZHOU[0], FUZHOU[1]).sails;
          expect(sails, 'the hint: when it sails').toBeDefined();
          expect(sails!.other, 'waiting for the other landing').toBe(voyage!.other);
          expect(sails!.port).toBe(voyage!.port);
          expect(Math.abs(sails!.days - voyage!.days!), `${sails!.days} days against the panel's ${voyage!.days}`).toBeLessThanOrEqual(1);
          hinted = sails!.other!;
        }
      }
      expect(hinted, 'the hint asked while it waited for its sibling').not.toBeNull();
      expect(states.get('sibling') ?? 0, `the fresh one's panel says it waits for the other landing: ${JSON.stringify([...states])}`).toBeGreaterThan(0);
      expect(states.get('ready') ?? 0, 'ready a day at most').toBeLessThanOrEqual(24);
      const at = ids.filter((id) => !told.has(id)).map((id) => landed.get(id));
      expect(at.every((t) => t !== undefined), `each landed or told: ${JSON.stringify([...landed])}`).toBe(true);
      if (at.length > 1) expect(Math.max(...(at as number[])) - Math.min(...(at as number[])), `within a day: ${JSON.stringify([...landed])}`).toBeLessThanOrEqual(24);
    }, 300_000);
  }
});
