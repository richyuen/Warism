import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { landingStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R48d (critic run 51, R51-N6): on 20861 Japan's three nearest Tokyo to Shanghai, three landings (Tokyo, Ōsaka,
// Hiroshima). Ōsaka's row said "waits for the landing from Hiroshima: about a day" and sailed a day before it: it waits
// to land with it, its voyage the longer. The row says what it does, "sails in about a day, to land with the landing from
// Hiroshima", never "waits for"; and at sea its days to land, which it keeps: landed within them and a day.

const JAP = nationId('JAP');
const CHI = nationId('CHI');

describe("a landing's row says when it sails and lands (ROADMAP R48d)", () => {
  it('20861: three landings for Shanghai; each row as it does', { timeout: 300_000 }, () => {
    const r = new RowRun(20861, JAP);
    r.step();
    r.cmds([{ kind: 'declareWar', attacker: JAP, defender: CHI }]);
    r.step();
    const ids = nearestDivisions(r.world, JAP, [1818.5, 385.5], 3);
    r.ids = ids;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1715.5, y: 413.5, nation: JAP, escort: true })));
    /** Each row's first word of sailing and of landing: the hour said and the days. */
    const sails = new Map<number, { at: number; days: number }>();
    const lands = new Map<number, { at: number; days: number }>();
    const sailed = new Map<number, number>();
    const over = new Map<number, LandingRow>();
    let sibling = 0;
    for (let h = 0; h < 24 * 20; h++) {
      r.step();
      const t = r.world.tick;
      for (const row of r.rows) {
        const said = landingStatus(row);
        expect(said, `t${t} row ${row.id}`).not.toMatch(/waits for/);
        if (row.state === 'gathering' && row.sails && !sails.has(row.id)) sails.set(row.id, { at: t, days: row.sails.days });
        if (row.sails?.other) {
          sibling++;
          expect(said, `t${t} row ${row.id}`).toContain(`to land with the landing from ${row.sails.other}`);
        }
        if (row.state === 'sailing') {
          if (!sailed.has(row.id)) sailed.set(row.id, t);
          expect(row.lands, `t${t} row ${row.id}: days to land`).toBeGreaterThan(0);
          expect(said).toMatch(/^at sea: lands in about/);
          if (!lands.has(row.id)) lands.set(row.id, { at: t, days: row.lands! });
        }
        if (row.state === 'over' && row.outcome) over.set(row.id, row);
      }
    }
    expect(sibling, 'a row timed to land with another').toBeGreaterThan(0);
    expect(over.size, 'the landings over').toBe(3);
    for (const [id, s] of sails) expect(sailed.get(id)! - s.at, `row ${id} sails as said (${s.days} days)`).toBeLessThanOrEqual((s.days + 1) * 24);
    for (const [id, l] of lands) {
      const o = over.get(id)!.outcome!;
      expect(o.kind, `row ${id}`).toBe('landed');
      expect(o.tick - l.at, `row ${id} lands as said (${l.days} days)`).toBeLessThanOrEqual((l.days + 1) * 24);
    }
    expect(r.broken).toEqual([]);
  });
});
