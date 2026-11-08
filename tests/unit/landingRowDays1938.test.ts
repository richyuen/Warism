import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { landingStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R48d (critic run 51, R51-N6): on 20861 Japan's three nearest Tokyo to Shanghai, three landings (Tokyo, Ōsaka,
// Hiroshima). Ōsaka's row said "waits for the landing from Hiroshima: about a day" and sailed a day before it: it waits
// to land with it, its voyage the longer. The row says what it does, "sails in about a day, to land within a day of the landing from
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
          expect(said, `t${t} row ${row.id}`).toContain(`to land within a day of the landing from ${row.sails.other}`);
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

// ROADMAP R50d (critic run 52, R52-N5): a cancelled row said "turning back to Tokyo" with no days (20661, cancelled at
// hour 26 with both at sea, h30–h45), where a row at sea gives them. Now each hour turning back gives its days to the
// port, and it is over within them and a day.
describe("a row turning back says when it is at its port (ROADMAP R50d)", () => {
  it('20661: cancelled at hour 26, both at sea: "there in about N days", over within them', { timeout: 300_000 }, () => {
    const r = new RowRun(20661, JAP);
    r.step();
    r.cmds([{ kind: 'declareWar', attacker: JAP, defender: CHI }]);
    r.step();
    const ids = nearestDivisions(r.world, JAP, [1818.5, 385.5], 2);
    r.ids = ids;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1715.5, y: 413.5, nation: JAP, escort: true })));
    for (let h = 0; h < 26; h++) r.step();
    for (const x of r.rows.filter((y) => y.state === 'gathering' || y.state === 'sailing')) r.s.handle({ type: 'cancelLanding', id: x.id }, 0);
    const first = new Map<number, { at: number; days: number }>();
    const ended = new Map<number, number>();
    for (let h = 0; h < 24 * 6; h++) {
      r.step();
      for (const row of r.rows) {
        if (row.state === 'returning') {
          expect(landingStatus(row), `t${r.world.tick} row ${row.id}`).toMatch(/^turning back to .+: there in about (a day|\d+ days)$/);
          if (!first.has(row.id)) first.set(row.id, { at: r.world.tick, days: row.back! });
        }
        if (row.state === 'over' && !ended.has(row.id)) ended.set(row.id, r.world.tick);
      }
    }
    expect(first.size, 'rows turning back').toBeGreaterThan(0);
    for (const [id, f] of first) expect(ended.get(id)! - f.at, `row ${id} at its port as said (${f.days} days)`).toBeLessThanOrEqual((f.days + 1) * 24);
    expect(r.broken).toEqual([]);
  });
});
