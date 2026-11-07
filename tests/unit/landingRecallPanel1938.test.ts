import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { LandingState, landingOfDivision, seaHint, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { atItsPort, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R37b (critic run 44, R44-N1): recalled at sea to its landing gathering at Tokyo, the one sent alone to
// Fuzhou read "At sea, bound for its landing" for days while it sailed away from Shanghai back to Tokyo, and the
// recall's tooltip said only "they board transports at a port and land at the marked place". Seed 3517, Japan's
// two nearest Tokyo sent to Shanghai (escort on); two hours after the first is at its port it alone is sent to
// Fuzhou; `days` later, the recall: the hover over Shanghai says it turns back to Tokyo to join the landing there,
// and until it is ashore there its panel reads "Aboard, sailing back to Tokyo".
// ROADMAP R43a: the partner placed within Tokyo's reach (8 cells, the farthest Tokyo is its own port) is at the port
// in days, not weeks: by a 5-day recall its landing has sailed, and there is none to turn back to (R37b's rejoin is
// for a landing gathering): the hover says no turning back and the recall sails it on for Shanghai. Back at Tokyo
// with the rest there, the landing sails at once: "At sea" is then true. The 1-day recall is the turning back.

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
      // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
      // of its own there, a sibling): this test's one landing at Tokyo.
      nearPort(w, ids, portNamed(w, 'Tokyo'), [0, 8]);
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
      const other = ids.find((id) => id !== first)!;
      const gathers = landingOfDivision(w, other)?.state === LandingState.gathering;
      if (days === 1) expect(gathers, "a day out, its partner's landing gathers at Tokyo").toBe(true);
      if (!gathers) {
        expect(hint.rejoin, 'none gathers: no turning back').toBeUndefined();
        return;
      }
      expect(hint.rejoin, 'the hover: it turns back to Tokyo').toBe('Tokyo');
      click([first], SHANGHAI);
      const seen: string[] = [];
      const tokyo = w.ports[portNamed(w, 'Tokyo')]!.cell;
      let back = false;
      for (let h = 0; h < 24 * 10 && w.embarked.has(first); h++) {
        sim.step(1, quiet);
        const l = landingOfDivision(w, first);
        if (l && l.port === portNamed(w, 'Tokyo') && l.state === LandingState.gathering) back = true;
        const v = w.embarked.has(first) && l ? voyageOf(w, first)?.state ?? '-' : null;
        if (v && seen.at(-1) !== v) seen.push(v);
      }
      expect(back, `back in the landing at Tokyo (${tokyo})`).toBe(true);
      // Aboard sailing back to Tokyo; then ashore there, or aboard as its landing sails at once with the rest there.
      expect(seen[0], 'aboard, it sails back to Tokyo').toBe('toPortAboard');
      expect(seen.slice(1).every((v) => v === 'atSea'), seen.join(',')).toBe(true);
    }, 300_000);
  }
});
