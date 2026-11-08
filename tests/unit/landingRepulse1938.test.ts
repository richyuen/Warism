import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { seaControlOf } from '../../src/sim/systems/seaControl';
import { seaOf } from '../../src/sim/world';
import { groupStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R52a (critic run 53, R53-N1, its staged cases `c53_repulse.ts`): a click's divisions to a target; from the
// hour the first lands, the foe holds every sea zone within 12 cells of the landing's water, so the later parts are
// thrown back.
// - 20861, Japan's three nearest Tokyo to Shanghai: the thrown back came ashore an hour after on the beachhead, and the
//   worker's end for them, overwritten, read "over: 3 landed" beside two "thrown back" news rows.
// - 23071, England's three nearest Portsmouth to Bremerhaven: 270 and 271 thrown back, ashore in Kent; the event names
//   270 alone (its group sails home with all aboard), and 271 read "came ashore away from Bremerhaven" (the replay at
//   585e20a8).
// Now a division thrown back stays so, all aboard its group with it, and `landingRows`' `outcome` reads a throw-back
// from the world (a place aboard with no water, and those on its group).

/** The staged case: the click's rows over, their status as one, the run. */
function staged(seed: number, tag: string, foe: string, from: [number, number], to: [number, number], n: number, hours: number): { r: RowRun; over: LandingRow[]; said: string } {
  const [NAT, FOE] = [nationId(tag), nationId(foe)];
  const r = new RowRun(seed, NAT);
  r.step();
  r.cmds([{ kind: 'declareWar', attacker: NAT, defender: FOE }]);
  r.step();
  const ids = nearestDivisions(r.world, NAT, from, n);
  r.ids = ids;
  r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: to[0], y: to[1], nation: NAT, escort: true })));
  const w = r.world;
  const W = w.cells.w;
  let water = -1;
  let landed = false;
  const afloat = (id: number): boolean => w.formations.has(id) && (w.embarked.has(id) || w.afloat(id));
  const over = new Map<number, LandingRow>();
  let said = '';
  for (let h = 0; h < hours; h++) {
    if (landed && water >= 0) {
      const sc = seaControlOf(w);
      const z = seaOf(w);
      const [wx, wy] = [water % W, Math.floor(water / W)];
      for (let y = wy - 12; y <= wy + 12; y++) {
        for (let x = wx - 12; x <= wx + 12; x++) {
          const k = z.zoneOf[y * W + x]!;
          if (k > 0) sc.holder[k] = FOE;
        }
      }
    }
    for (const l of w.landings.values()) if (l.nation === NAT && l.water >= 0) water = l.water;
    const was = new Set(ids.filter(afloat));
    r.step();
    if (ids.some((id) => was.has(id) && !afloat(id) && w.formations.has(id))) landed = true;
    for (const row of r.rows) if (row.state === 'over' && !over.has(row.id)) over.set(row.id, row);
    if (r.rows.length > 0 && r.rows.every((x) => x.state === 'over')) said = groupStatus(r.rows);
  }
  return { r, over: [...over.values()], said };
}

const thrown = (rows: LandingRow[]): number => rows.reduce((n, row) => n + (row.outcome?.repulsed ?? 0), 0);

describe('a division thrown back stays so in its row (ROADMAP R52a)', () => {
  it('20861, the sea held for China from the first landing: "thrown back", not "3 landed"', { timeout: 600_000 }, () => {
    const { r, over, said } = staged(20861, 'JAP', 'CHI', [1818.5, 385.5], [1715.5, 413.5], 3, 400);
    expect(thrown(over), `thrown back: ${over.map((row) => JSON.stringify(row.outcome)).join(' ')}`).toBeGreaterThan(0);
    expect(said).toMatch(/thrown back/);
    expect(r.broken).toEqual([]);
  });

  it('23071, the sea held for Germany: both of the group sent home are thrown back, not "came ashore away"', { timeout: 600_000 }, () => {
    const { r, over, said } = staged(23071, 'ENG', 'GER', [1023.5, 275.5], [1072.5, 259.5], 3, 500);
    expect(thrown(over), `thrown back: ${over.map((row) => JSON.stringify(row.outcome)).join(' ')}`).toBe(2);
    expect(said).toBe('over: 1 landed, 2 thrown back');
    expect(r.broken).toEqual([]);
  });
});
