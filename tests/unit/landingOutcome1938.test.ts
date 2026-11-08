import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { landingStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R50a (critic run 52, R52-B1, blocking): the landings bar's outcome came from R47a's tally (a sinking counted
// as lost, any landing as landed) and contradicted the order news beside it:
// - 22103, Germany's two nearest Berlin to Norwich: their transports sunk at t90 while they marched to Hamburg; the row
//   said "over: lost at sea", both alive inland;
// - 21105, Italy's two nearest Rome to Valletta: the transports broke off, the two came ashore on Sicily; "over: 2
//   landed";
// - 3517, Japan with all but two transport groups removed, three nearest Tokyo to Shanghai, the sailing groups removed
//   a day out (run 50's case): "2 landed, 1 lost at sea" with 366 on land.
// Now each division counts by where it ended, and `landingRows`' `outcome` reads that from the world hour by hour.

/** The case's divisions (the `n` nearest `from`) ordered to `to` as the page orders them, one command each. */
function run(seed: number, tag: string, foe: string, from: [number, number], to: [number, number], n: number, before?: (r: RowRun) => void): RowRun {
  const nation = nationId(tag);
  const r = new RowRun(seed, nation);
  r.step();
  r.cmds([{ kind: 'declareWar', attacker: nation, defender: nationId(foe) }]);
  r.step();
  before?.(r);
  const ids = nearestDivisions(r.world, nation, from, n);
  r.ids = ids;
  r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: to[0], y: to[1], nation })));
  return r;
}

/** Steps until the case's rows are all over (and a day more), or `hours`; the rows over, by id. */
function toEnd(r: RowRun, hours: number, each?: (h: number) => void): Map<number, LandingRow> {
  const over = new Map<number, LandingRow>();
  let lastOver = -1;
  for (let h = 0; h < hours; h++) {
    each?.(h);
    r.step();
    for (const row of r.rows) {
      if (row.state !== 'over' || over.has(row.id)) continue;
      over.set(row.id, row);
      lastOver = h;
    }
    if (lastOver >= 0 && h - lastOver > 24 && r.settled()) break;
  }
  return over;
}

describe("a landing's outcome is where its divisions ended (ROADMAP R50a)", () => {
  it('22103: transports sunk before they sailed: not "lost at sea"; never sailed, both alive', { timeout: 600_000 }, () => {
    const r = run(22103, 'GER', 'ENG', [1100.5, 267.5], [1031.5, 266.5], 2);
    const over = [...toEnd(r, 24 * 20).values()];
    expect(over.length, 'its landing over').toBeGreaterThan(0);
    for (const row of over) {
      expect(landingStatus(row), `row ${row.id}`).not.toMatch(/lost at sea/);
      expect(row.outcome!.lost, `row ${row.id}`).toBe(0);
    }
    expect(over.some((row) => row.outcome!.kind === 'sunk' && /never sailed/.test(landingStatus(row))), 'one sunk before sailing').toBe(true);
    for (const id of r.ids) expect(r.world.formations.has(id), `${id} alive`).toBe(true);
    expect(r.broken).toEqual([]);
  });

  it('21105: the transports broke off, ashore away from Valletta: not "landed"', { timeout: 600_000 }, () => {
    const r = run(21105, 'ITA', 'ENG', [1095.5, 344.5], [1106.5, 383.5], 2);
    const over = [...toEnd(r, 24 * 20).values()];
    expect(over.length, 'its landing over').toBeGreaterThan(0);
    const away = over.find((row) => row.outcome!.kind === 'away');
    expect(away, `broke off: ${over.map((row) => landingStatus(row)).join(' | ')}`).toBeDefined();
    expect(landingStatus(away!)).toMatch(/^over: its transports broke off; \d came ashore away from Valletta/);
    expect(away!.outcome!.landed).toBe(0);
    expect(r.broken).toEqual([]);
  });

  it('3517: the sailing groups lost a day out, one left at Tokyo: no "lost at sea" for the one on land', { timeout: 600_000 }, () => {
    const r = run(3517, 'JAP', 'CHI', [1818.5, 385.5], [1715.5, 413.5], 3, (r) => r.cmds([1151, 1152].map((id) => ({ kind: 'removeFormation' as const, id }))));
    let sailedAt = -1;
    const over = toEnd(r, 24 * 40, (h) => {
      if (sailedAt < 0 && r.rows.some((row) => row.state === 'sailing')) sailedAt = h;
      if (sailedAt >= 0 && h === sailedAt + 24) r.cmds([1136, 1144].map((id) => ({ kind: 'removeFormation' as const, id })));
    });
    expect(sailedAt, 'sailed').toBeGreaterThanOrEqual(0);
    const ashore = r.ids.filter((id) => r.world.formations.has(id) && !r.world.afloat(id));
    for (const row of over.values()) {
      const lostSaid = row.outcome!.lost;
      const gone = row.divisions.filter((d) => !r.world.formations.has(d.id)).length;
      expect(lostSaid, `row ${row.id} "${landingStatus(row)}": lost said, gone`).toBeLessThanOrEqual(gone);
    }
    expect(ashore.length, 'one on land').toBeGreaterThan(0);
    expect(r.broken).toEqual([]);
  });
});
