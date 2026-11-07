import { describe, expect, it } from 'vitest';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { voyageText } from '../../src/ui/voyageText';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R48e (critic run 51, R51-N7): 365's panel on 20661 said "they land together" and its landings came ashore
// at t117 and t129; on 20841 at t119, t129, t131. The rule (R37c, `siblingWait`) lands them within a day; the words say
// so ("within a day of the landing from …"), and on both cases each landing a division was told that of lands within
// a day of it.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');

describe("siblings' words and landings (ROADMAP R48e)", () => {
  for (const [seed, n] of [[20661, 2], [20841, 3]] as const) {
    it(`${seed}: ${n} nearest Tokyo to Shanghai; "within a day", and so they land`, { timeout: 300_000 }, () => {
      const r = new RowRun(seed, JAP);
      r.step();
      r.cmds([{ kind: 'declareWar', attacker: JAP, defender: CHI }]);
      r.step();
      const ids = nearestDivisions(r.world, JAP, cellOf(139.69, 35.69, W, H) as [number, number], n);
      r.ids = ids;
      const to = cellOf(121.47, 31.23, W, H);
      r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: Math.floor(to[0]) + 0.5, y: Math.floor(to[1]) + 0.5, nation: JAP, escort: true })));
      /** Each division's landing row, and the port names it was told it lands with. */
      const rowOf = new Map<number, number>();
      const toldOf = new Map<number, Set<string>>();
      const landedAt = new Map<number, number>();
      const portOf = new Map<number, string>();
      let told = 0;
      for (let h = 0; h < 24 * 20; h++) {
        r.step();
        for (const row of r.rows) {
          if (row.state !== 'over') portOf.set(row.id, row.port);
          if (row.state === 'over' && row.outcome?.kind === 'landed' && !landedAt.has(row.id)) landedAt.set(row.id, row.outcome.tick);
          for (const d of row.divisions) {
            if (row.state !== 'over') rowOf.set(d.id, row.id);
            if (d.voyage?.state === 'sibling') {
              told++;
              expect(voyageText(d.voyage), `t${r.world.tick} ${d.id}`).toContain('within a day of the landing from');
              expect(voyageText(d.voyage)).not.toMatch(/together/);
              const s = toldOf.get(row.id) ?? new Set<string>();
              s.add(d.voyage.other!);
              toldOf.set(row.id, s);
            }
          }
        }
      }
      expect(told, 'a division told of a sibling').toBeGreaterThan(0);
      for (const [row, others] of toldOf) {
        for (const other of others) {
          const sib = [...portOf].find(([id, p]) => p === other && id !== row)?.[0];
          expect(sib, `row ${row}'s sibling from ${other}`).toBeDefined();
          expect(landedAt.has(row) && landedAt.has(sib!), `rows ${row} and ${sib} landed`).toBe(true);
          expect(Math.abs(landedAt.get(row)! - landedAt.get(sib!)!), `rows ${row} (${landedAt.get(row)}) and ${sib} (${landedAt.get(sib!)})`).toBeLessThanOrEqual(24);
        }
      }
      expect(r.broken).toEqual([]);
    });
  }
});
