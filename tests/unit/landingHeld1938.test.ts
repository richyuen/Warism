import { describe, expect, it } from 'vitest';
import { landingStatus } from '../../src/ui/landingStatus';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R50c (critic run 52, R52-N3): on 21105 (Italy's two nearest Rome to Valletta) the row read "at sea: lands in
// about a day" from t61 to t133 while transport group 1195 was in a fight, held at 1098, 376 (engaged t63–t147). Now a
// row whose landing has a group in a fight says "under attack, held up", and no days; each hour it reads as its groups
// stand, and a row's days, once it moves again, are kept (landed within them and a day, as ADR-860).

const ITA = nationId('ITA');

describe('a landing held in a fight at sea says so (ROADMAP R50c)', () => {
  it('21105: "under attack, held up" while a group of it is engaged, and only then', { timeout: 600_000 }, () => {
    const r = new RowRun(21105, ITA);
    r.step();
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: nationId('ENG') }]);
    r.step();
    const ids = nearestDivisions(r.world, ITA, [1095.5, 344.5], 2);
    r.ids = ids;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1106.5, y: 383.5, nation: ITA })));
    const w = r.world;
    let held = 0;
    for (let h = 0; h < 24 * 10; h++) {
      r.step();
      for (const row of r.rows) {
        if (row.state !== 'sailing') continue;
        const l = w.landings.get(row.id);
        const engaged = l !== undefined && l.fleets.some((o) => w.formations.has(o) && w.formations.cols.engaged[o] === 1);
        const said = landingStatus(row);
        if (engaged) held++;
        expect(said === 'at sea: under attack, held up', `t${w.tick} row ${row.id}: "${said}", a group engaged ${engaged}`).toBe(engaged);
      }
    }
    expect(held, 'hours held').toBeGreaterThan(24);
    expect(r.broken).toEqual([]);
  });
});
