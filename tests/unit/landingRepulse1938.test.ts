import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { seaControlOf } from '../../src/sim/systems/seaControl';
import { seaOf } from '../../src/sim/world';
import { groupStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R52a (critic run 53, R53-N1, its staged case `c53_repulse.ts 20861 … 3 … 400 12`): Japan's three nearest
// Tokyo to Shanghai; from the hour the first lands, China holds every sea zone within 12 cells of the landing's water,
// so the later parts are thrown back. They came ashore an hour after on the beachhead, and the worker's end for them,
// overwritten, read "over: 3 landed" beside two "thrown back" news rows. Now a division thrown back stays so, and
// `landingRows`' `outcome` reads a throw-back from the world (its place aboard with no water).

const JAP = nationId('JAP');
const CHI = nationId('CHI');

describe('a division thrown back stays so in its row (ROADMAP R52a)', () => {
  it('20861, the sea held for China from the first landing: "thrown back", not "3 landed"', { timeout: 600_000 }, () => {
    const r = new RowRun(20861, JAP);
    r.step();
    r.cmds([{ kind: 'declareWar', attacker: JAP, defender: CHI }]);
    r.step();
    const ids = nearestDivisions(r.world, JAP, [1818.5, 385.5], 3);
    r.ids = ids;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1715.5, y: 413.5, nation: JAP, escort: true })));
    const w = r.world;
    const W = w.cells.w;
    let water = -1;
    let landed = false;
    const afloat = (id: number): boolean => w.formations.has(id) && (w.embarked.has(id) || w.afloat(id));
    const over = new Map<number, LandingRow>();
    let rows: LandingRow[] = [];
    for (let h = 0; h < 400; h++) {
      if (landed && water >= 0) {
        const sc = seaControlOf(w);
        const z = seaOf(w);
        const [wx, wy] = [water % W, Math.floor(water / W)];
        for (let y = wy - 12; y <= wy + 12; y++) {
          for (let x = wx - 12; x <= wx + 12; x++) {
            const k = z.zoneOf[y * W + x]!;
            if (k > 0) sc.holder[k] = CHI;
          }
        }
      }
      for (const l of w.landings.values()) if (l.nation === JAP && l.water >= 0) water = l.water;
      const was = new Set(ids.filter(afloat));
      r.step();
      if (ids.some((id) => was.has(id) && !afloat(id) && w.formations.has(id))) landed = true;
      for (const row of r.rows) if (row.state === 'over' && !over.has(row.id)) over.set(row.id, row);
      if (r.rows.length > 0) rows = r.rows;
    }
    const ends = [...over.values()];
    const thrown = ends.reduce((n, row) => n + (row.outcome?.repulsed ?? 0), 0);
    expect(thrown, `thrown back: ${ends.map((row) => JSON.stringify(row.outcome)).join(' ')}`).toBeGreaterThan(0);
    expect(groupStatus(rows.length > 0 && rows.every((x) => x.state === 'over') ? rows : ends)).toMatch(/thrown back/);
    expect(r.broken).toEqual([]);
  });
});
