import { describe, expect, it } from 'vitest';
import { groupStatus } from '../../src/ui/landingStatus';
import { voyageText } from '../../src/ui/voyageText';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R53a (critic run 54, R54-B1): Italy's two nearest Rome to Valletta, each ordered on its own as the page's
// clicks; on 23105 the British hold the sea there and the landing is thrown back (t157). For a day after, the bar read
// "at sea: lands in about a day" and the panels "At sea, bound for its landing" under "the landing was thrown back";
// the transports put in at Italy's nearest port, and the bar read "over: 2 thrown back" beside the ticker's two
// "landed away from its target"; 321 was never told "thrown back". Now one account in all three places.

describe('a thrown-back landing tells one story (ROADMAP R53a)', () => {
  it('23105, Rome to Valletta: thrown back, sailing home, then ashore there, in the bar, the panels and the news', { timeout: 600_000 }, () => {
    const [NAT, FOE] = [nationId('ITA'), nationId('ENG')];
    const r = new RowRun(23105, NAT);
    r.cmds([{ kind: 'declareWar', attacker: NAT, defender: FOE }]);
    r.step();
    const ids = nearestDivisions(r.world, NAT, [1095.5, 344.5], 2);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1106.5, y: 383.5, nation: NAT }]);
    let thrownAt = -1;
    let over = '';
    const said: string[] = [];
    for (let h = 0; h < 260 && over === ''; h++) {
      r.step();
      if (thrownAt < 0 && r.news.some((n) => n.kind === 'repulsed')) thrownAt = r.world.tick;
      const open = r.rows.filter((x) => x.state !== 'over');
      if (thrownAt >= 0 && open.length > 0) {
        said.push(`t${r.world.tick} ${groupStatus(r.rows)} | ${ids.map((id) => (r.panel(id) ? voyageText(r.panel(id)!) : '-')).join(' | ')}`);
      }
      if (r.rows.length > 0 && open.length === 0) over = groupStatus(r.rows);
    }
    expect(thrownAt, 'thrown back').toBeGreaterThan(0);
    // From the throw-back, the bar and both panels say so, with no voyage hours.
    expect(said.length).toBeGreaterThan(0);
    for (const s of said) expect(s).toMatch(/^t\d+ thrown back: sailing home to \S[^|]* \| At sea, thrown back: sailing home to \S[^|]* \| At sea, thrown back: sailing home to \S/);
    // The ticker: each division thrown back, then each ashore as thrown back, none "landed away".
    for (const id of ids) {
      expect(r.news.filter((n) => n.id === id).map((n) => n.kind), `news of ${id}`).toEqual(['repulsed', 'thrownAshore']);
    }
    const at = r.news.find((n) => n.kind === 'thrownAshore')!.at;
    expect(at).toBeTruthy();
    expect(over).toBe(`over: 2 thrown back; came ashore near ${at}`);
    expect(r.broken).toEqual([]);
  });
});
