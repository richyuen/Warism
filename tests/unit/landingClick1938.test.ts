import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { groupStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R48f (critic run 51, the ADR-838 objection; Hearts of Iron's one plan): on 20861 one click sends Japan's three
// nearest Tokyo to Shanghai from three ports, three landings, and the bar showed three rows, a cancel ending one. The
// rows carry their click (`click`): the three share it; the bar's one row
// says where the click stands (`groupStatus`), and its cancel ends every landing of it. Two orders in an hour for two
// places are two clicks (15101, run 47's grid).

const JAP = nationId('JAP');
const CHI = nationId('CHI');

/** 20861 (or `seed`), at war, its three (or `n`) nearest Tokyo ordered to Shanghai; the run and the divisions. */
function shanghai(seed = 20861, n = 3): { r: RowRun; ids: number[] } {
  const r = new RowRun(seed, JAP);
  r.step();
  r.cmds([{ kind: 'declareWar', attacker: JAP, defender: CHI }]);
  r.step();
  const ids = nearestDivisions(r.world, JAP, [1818.5, 385.5], n);
  r.ids = ids;
  r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1715.5, y: 413.5, nation: JAP, escort: true })));
  return { r, ids };
}

describe("one click's landings, one row (ROADMAP R48f)", () => {
  it('20861: three ports, one click', { timeout: 300_000 }, () => {
    const { r } = shanghai();
    r.step();
    r.step();
    const first = r.rows.filter((x) => x.state !== 'over');
    expect(first.length, 'landings of the click').toBeGreaterThanOrEqual(2);
    expect(new Set(first.map((x) => x.port)).size, 'from several ports').toBe(first.length);
    expect(new Set(first.map((x) => x.click)), 'one click').toEqual(new Set([Math.min(...first.map((x) => x.id))]));
    expect(r.broken).toEqual([]);
  });

  it('15101: two orders in one hour for two places, two clicks', { timeout: 300_000 }, () => {
    // Run 47's grid's England (`GRID_SETUPS`): 270 to its `a`, 271 to its `b`, French coasts apart.
    const ENG = nationId('ENG');
    const r = new RowRun(15101, ENG, [270, 271]);
    r.step();
    r.cmds([{ kind: 'forceWar', attacker: ENG, defender: nationId('FRA') }]);
    r.step();
    r.cmds([
      { kind: 'moveFormation', id: 270, x: 1034.5, y: 279.5, nation: ENG, escort: true },
      { kind: 'moveFormation', id: 271, x: 1021.5, y: 291.5, nation: ENG, escort: true },
    ]);
    r.step();
    r.step();
    const of = (id: number): LandingRow | undefined => r.rows.find((x) => x.divisions.some((d) => d.id === id));
    expect(of(270), "270's landing").toBeDefined();
    expect(of(271), "271's landing").toBeDefined();
    expect(of(270)!.click, 'two clicks').not.toBe(of(271)!.click);
    expect(r.broken).toEqual([]);
  });

  it("20861: the click's cancel, a cancel of each of its landings, ends them all", { timeout: 300_000 }, () => {
    const { r } = shanghai();
    for (let h = 0; h < 3; h++) r.step();
    const live = r.rows.filter((x) => x.state === 'gathering' || x.state === 'sailing');
    expect(live.length).toBeGreaterThanOrEqual(2);
    for (const x of live) r.s.handle({ type: 'cancelLanding', id: x.id }, 0);
    // Each one's end as it comes (an over row is in the bar a day).
    const ends = new Map<number, LandingRow>();
    for (let h = 0; h < 72 && ends.size < live.length; h++) {
      r.step();
      for (const y of r.rows) if (y.state === 'over' && live.some((x) => x.id === y.id)) ends.set(y.id, y);
    }
    expect(ends.size, 'each landing of the click over').toBe(live.length);
    for (const e of ends.values()) expect(e.outcome?.kind, `landing ${e.id}`).toBe('cancelled');
    expect(groupStatus([...ends.values()]), 'the row').toMatch(/^cancelled: /);
  });
});

// ROADMAP R50b (critic run 52, R52-N2 and the ADR-862 objection): the click's row came apart as its landings ended
// (t129: "Tokyo, Ōsaka · over: 2 landed" beside "Hiroshima · at sea"; Ōsaka's dropped after its day; never "3 landed"),
// and a cancel made a row a port. Now each landing keeps its click to its end, and a part over stays while its click
// runs and a day after its last end.
describe("one click's row to its end (ROADMAP R50b)", () => {
  it('20861: one click every hour to the end, "over: 3 landed"', { timeout: 300_000 }, () => {
    const { r } = shanghai();
    let last = '';
    let ended = -1;
    for (let h = 0; h < 24 * 12 && (ended < 0 || h - ended < 12); h++) {
      r.step();
      if (r.rows.length === 0) continue;
      expect(new Set(r.rows.map((x) => x.click)).size, `t${r.world.tick}: ${r.rows.map((x) => `${x.port} ${x.state}`).join(', ')}`).toBe(1);
      last = groupStatus(r.rows);
      if (ended < 0 && r.rows.every((x) => x.state === 'over')) ended = h;
    }
    expect(ended, 'over').toBeGreaterThanOrEqual(0);
    expect(last).toBe('over: 3 landed');
    expect(r.broken).toEqual([]);
  });

  it("20661: the click's cancel at hour 26, both at sea, keeps one row, its parts turning back in it", { timeout: 300_000 }, () => {
    const { r } = shanghai(20661, 2);
    for (let h = 0; h < 26; h++) r.step();
    const live = r.rows.filter((y) => y.state === 'gathering' || y.state === 'sailing');
    expect(live.filter((y) => y.state === 'sailing').length, 'two at sea').toBe(2);
    for (const x of live) r.s.handle({ type: 'cancelLanding', id: x.id }, 0);
    let back = 0;
    for (let h = 0; h < 72; h++) {
      r.step();
      if (r.rows.some((x) => x.state === 'returning')) back++;
      // R52b (critic run 53, R53-N2): the row names each port turning back, not the first only.
      const backs = r.rows.filter((x) => x.state === 'returning');
      if (backs.length > 1) for (const b of backs) expect(groupStatus(r.rows), `t${r.world.tick}`).toContain(b.port);
      if (r.rows.length > 0) expect(new Set(r.rows.map((x) => x.click)).size, `t${r.world.tick}: ${r.rows.map((x) => `${x.port} ${x.state}`).join(', ')}`).toBe(1);
    }
    expect(back, 'hours turning back').toBeGreaterThan(0);
  });
});

describe("a click's row says where it stands (ROADMAP R48f)", () => {
  const row = (id: number, port: string, o: Partial<LandingRow>): LandingRow => ({ id, click: 1, state: 'gathering', port, target: '=Shanghai', land: [0, 0], to: [0, 0], portAt: [0, 0], divisions: [], ships: { need: 1, have: 1 }, sails: null, ...o }) as LandingRow;
  it('gathering, the last to sail; some at sea; all at sea, the last to land; over, summed', () => {
    expect(groupStatus([row(1, 'Tokyo', { sails: { days: 1 } }), row(2, 'Hiroshima', { sails: { days: 3 } })])).toBe('sails in about 3 days');
    expect(groupStatus([row(1, 'Tokyo', { state: 'sailing', lands: 4 }), row(2, 'Hiroshima', { sails: { days: 2 } })])).toBe('1 of 2 at sea; the last sails in about 2 days');
    expect(groupStatus([row(1, 'Tokyo', { state: 'sailing', lands: 4 }), row(2, 'Hiroshima', { state: 'sailing', lands: 5 })])).toBe('at sea: lands in about 5 days');
    // R52b: turning back from two ports, both named, the longer days; one ashore and the rest at sea, how many ashore.
    expect(groupStatus([row(1, 'Tokyo', { state: 'returning', back: 1 }), row(2, 'Ōsaka', { state: 'returning', back: 2 })])).toBe('turning back to Tokyo, Ōsaka: there in about 2 days');
    expect(groupStatus([row(1, 'Tokyo', { state: 'over', outcome: { kind: 'landed', tick: 9, landed: 1, lost: 0 } }), row(2, 'Ōsaka', { state: 'sailing', lands: 1 }), row(3, 'Hiroshima', { state: 'sailing', lands: 1 })])).toBe('1 of 3 ashore; at sea: lands in about a day');
    expect(groupStatus([row(1, 'Tokyo', { state: 'over', outcome: { kind: 'landed', tick: 9, landed: 2, lost: 0 } }), row(2, 'Hiroshima', { state: 'over', outcome: { kind: 'landed', tick: 9, landed: 1, lost: 0 } })])).toBe('over: 3 landed');
    expect(groupStatus([row(1, 'Tokyo', { state: 'over', outcome: { kind: 'cancelled', tick: 9, landed: 0, lost: 0, home: 2, stopped: 0 } }), row(2, 'Hiroshima', { state: 'over', outcome: { kind: 'cancelled', tick: 9, landed: 0, lost: 0, home: 0, stopped: 1 } })])).toBe('cancelled: 2 back at Tokyo, 1 stopped where they stood');
  });
});
