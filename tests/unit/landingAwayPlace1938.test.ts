import { describe, expect, it } from 'vitest';
import { landingStatus } from '../../src/ui/landingStatus';
import { orderNewsText } from '../../src/ui/orderNewsText';
import { nearestDivisions, RowRun } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R55h (critic run 55, small): Italy (21105), the two divisions nearest Rome sent to Valletta; their transports
// break off and they come ashore in Sicily. The row ended "over: its transports broke off; 2 came ashore away from
// Valletta", not saying where, as a landing thrown back says "came ashore near Catania". Now it names the place, and
// so does each division's news.

const ITA = nationId('ITA');
const ENG = nationId('ENG');

describe('a landing ashore away from its target says where (ROADMAP R55h)', () => {
  it('21105: "came ashore near <place>, away from Valletta", in the row and the news', () => {
    const r = new RowRun(21105, ITA);
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: ENG }]);
    r.step();
    const ids = nearestDivisions(r.world, ITA, [1095.5, 344.5], 2);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1106.5, y: 383.5, nation: ITA }]);
    let end = '';
    for (let h = 0; h < 260 && !end; h++) {
      r.step();
      const row = r.rows.find((x) => x.state === 'over' && x.outcome?.kind === 'away');
      if (row) end = landingStatus(row);
    }
    process.stderr.write(`${end}
`);
    expect(end).toMatch(/^over: its transports broke off; 2 came ashore near \S.*, away from Valletta$/);
    const news = r.news.filter((n) => n.kind === 'landedAway' && ids.includes(n.id));
    expect(news.length).toBe(2);
    for (const n of news) expect(orderNewsText(n, `Inf ${n.id}`)).toMatch(/came ashore near \S.*, away from its target\.$/);
    expect(r.broken).toEqual([]);
  }, 300_000);
});
