import { describe, expect, it } from 'vitest';
import { voyageText } from '../../src/ui/voyageText';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R53c (critic run 54, small; unchanged since run 53): on 22105, England's three nearest Portsmouth ordered to
// Bremerhaven one by one, on day 2 two division lines read "Marching to Portsmouth to board transports" with no days
// while the third kept them: under a day from the port, its days were left out. Now every line on the march gives
// its days, "about a day" the last.

describe('a division marching to its port gives its days to the last (ROADMAP R53c)', () => {
  it('22105: each line on the march has its days, "about a day" within one', { timeout: 600_000 }, () => {
    const [NAT, FOE] = [nationId('ENG'), nationId('GER')];
    const r = new RowRun(22105, NAT);
    r.cmds([{ kind: 'declareWar', attacker: NAT, defender: FOE }]);
    r.step();
    const ids = nearestDivisions(r.world, NAT, [1023.5, 275.5], 3);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: NAT }]);
    let marching = 0;
    let oneDay = 0;
    for (let h = 0; h < 96; h++) {
      r.step();
      for (const row of r.rows) {
        for (const d of row.divisions) {
          if (d.voyage?.state !== 'toPort') continue;
          marching++;
          const said = voyageText(d.voyage);
          expect(said, `t${r.world.tick} ${d.id}`).toMatch(/^Marching to Portsmouth.*, about (a day|\d+ days)/);
          if (said.includes('about a day')) oneDay++;
        }
      }
    }
    expect(marching).toBeGreaterThan(0);
    expect(oneDay, 'hours said "about a day"').toBeGreaterThan(0);
    expect(r.broken).toEqual([]);
  });
});
