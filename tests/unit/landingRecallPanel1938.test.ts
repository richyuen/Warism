import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision, seaHint, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R37b (critic run 44, R44-N1): recalled at sea to its landing gathering at Tokyo, the one sent alone to
// Fuzhou read "At sea, bound for its landing" for days while it sailed away from Shanghai back to Tokyo, and the
// recall's tooltip said only "they board transports at a port and land at the marked place". Seed 3517, Japan's
// two nearest Tokyo sent to Shanghai (escort on); two hours after the first is at its port it alone is sent to
// Fuzhou; `days` later, the recall: the hover over Shanghai says it turns back to Tokyo to join the landing there,
// and until it is ashore there its panel reads "Aboard, sailing back to Tokyo".

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const FUZHOU: [number, number] = [1703.5, 445.5];

describe('a recall at sea reads true (ROADMAP R37b)', () => {
  for (const days of [1, 3, 5]) {
    it(`recalled ${days} day(s) out: the hover says it turns back to Tokyo; the panel says it sails back there`, () => {
      const sim = new Sim({ scenario: '1938', seed: 3517, assets: assets1938(W) });
      const w = sim.world;
      const quiet = (x: World): void => {
        x.out.events.length = 0;
        x.out.fires.length = 0;
      };
      sim.command({ kind: 'setPlayer', nation: JAP });
      sim.step(1, quiet);
      if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
      sim.step(1, quiet);
      const c = w.formations.cols;
      const comp = navOf(w).grid.component;
      const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
      const all: [number, number][] = [];
      w.formations.forEach((id) => {
        if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
        all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
      });
      const ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
      const click = (sel: number[], [x, y]: [number, number]): void => {
        for (const id of [...sel].sort((a, b) => a - b)) sim.command({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true } as Command);
        sim.applyNow(quiet);
      };
      click(ids, SHANGHAI);
      for (let h = 0; h < 24 * 10 && !ids.some((id) => atItsPort(w, id)); h++) sim.step(1, quiet);
      sim.step(2, quiet);
      const first = ids.find((id) => atItsPort(w, id))!;
      click([first], FUZHOU);
      sim.step(24 * days, quiet);
      expect(w.embarked.has(first), 'at sea, for Fuzhou').toBe(true);
      const hint = seaHint(w, [first], ...SHANGHAI);
      expect(hint.rejoin, 'the hover: it turns back to Tokyo').toBe('Tokyo');
      click([first], SHANGHAI);
      const seen = new Set<string>();
      for (let h = 0; h < 24 * 10 && w.embarked.has(first); h++) {
        sim.step(1, quiet);
        if (w.embarked.has(first) && landingOfDivision(w, first)) seen.add(voyageOf(w, first)?.state ?? '-');
      }
      expect(w.embarked.has(first), 'ashore at Tokyo').toBe(false);
      expect([...seen], 'aboard, it sails back to Tokyo').toEqual(['toPortAboard']);
    }, 300_000);
  }
});
