import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOfDivision, seaHint, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { sameText } from '../../src/ui/seaHintText';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R43a (critic run 50, R50-N1; the user's choice of 2026-11-06): one click's last division had no bound on
// its landing's wait (20841: three from Tokyo to Shanghai, 35 days at Tokyo for one walking 41 cells from western
// Honshu, landed after 39.6 days; 20661, two: 26 days). A division whose land's nearest port lands it a week sooner
// than the click's landing makes a landing of its own there, a sibling, and the two wait for each other to land
// together. The critic's cases: each port's landing; all land within a day; the last within a week of the click
// (a 4-day crossing); while one waits for a sibling over a day the hover over Shanghai names the sibling's port
// (R42a's `sails.other`) and the panel says `sibling`, and it sails within a day of the days said.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

describe("a click's division boards at its own port, a sibling landing (ROADMAP R43a)", () => {
  // 3517's four: one from Sapporo, days farther by sea, which the others wait for (the sibling's hover, R42a).
  for (const [seed, n, before, bar] of [[20841, 3, 39.6, 7], [20661, 2, 26.3, 7], [3517, 4, 52, 12]] as const) {
    it(`seed ${seed}: Japan's ${n} nearest Tokyo to Shanghai: two ports or more, landed together within ${bar} days (${before} before)`, () => {
      const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
      const w = sim.world;
      const landed = new Map<number, number>();
      let ids: number[] = [];
      const take = (x: World): void => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.FormationLanded && ids.includes(ev[i + 2]!) && !landed.has(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
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
      ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, n).map((d) => d[0]);
      for (const id of [...ids].sort((a, b) => a - b)) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP } as Command);
      sim.applyNow(take);
      const t0 = w.tick;
      const ports = new Set(ids.map((id) => landingOfDivision(w, id)?.port));
      expect(ports.size, `a landing a port: ${[...ports].map((p) => w.ports[p!]?.name)}`).toBeGreaterThan(1);
      let said: { id: number; days: number; at: number; other: string } | null = null;
      let sailed = -1;
      for (let h = 0; h < 24 * 60 && landed.size < n; h++) {
        sim.step(1, take);
        for (const id of ids) {
          const v = voyageOf(w, id);
          if (said === null && v?.state === 'sibling' && (v.days ?? 0) > 1) {
            const hint = seaHint(w, [id], ...SHANGHAI);
            expect(hint.sails?.other, 'the hover names the sibling').toBe(v.other);
            expect(sameText(hint)).toContain(`within a day of the landing from ${v.other}`);
            said = { id, days: hint.sails!.days, at: w.tick, other: v.other! };
          }
        }
        if (said !== null && sailed < 0) {
          const l = landingOfDivision(w, said.id);
          if (!l || l.state !== 0) sailed = w.tick;
        }
      }
      const at = [...landed.values()];
      process.stderr.write(`R43a ${seed}: ports ${[...ports].map((p) => w.ports[p!]?.name)}, landed ${[...landed]} (${((Math.max(...at) - t0) / 24).toFixed(1)} days), sibling said ${JSON.stringify(said)}, sailed ${sailed}\n`);
      expect(landed.size, 'all landed').toBe(n);
      expect(Math.max(...at) - Math.min(...at), 'together').toBeLessThanOrEqual(24);
      expect((Math.max(...at) - t0) / 24, `within ${bar} days (${before} before)`).toBeLessThanOrEqual(bar);
      if (seed === 3517) expect(said, 'a sibling waited for over a day, told').not.toBeNull();
      if (said !== null && sailed > 0) expect(Math.abs((sailed - said.at) / 24 - said.days), 'sailed on the day said').toBeLessThanOrEqual(1);
    }, 300_000);
  }
});
