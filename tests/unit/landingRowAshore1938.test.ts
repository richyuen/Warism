import { describe, expect, it } from 'vitest';
import { landingStatus } from '../../src/ui/landingStatus';
import { nearestDivisions, RowRun } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R55b (critic run 56, R56-N1): Britain (27123), the ten divisions nearest Portsmouth sent to Bremerhaven; eight
// join, seven sail at h90 while one is still days from the port. The row read "at sea: lands in about 3 days" for 54
// hours without moving (the voyage from the port of the group kept there for the next voyage, counted each hour), and
// after the seven landed only "sails in about 6 days". Now its days to land are those of the groups carrying it, and a
// row with some of it ashore says how many. Since R55f (ADR-898) 27123's late marcher gathers at Liverpool, its own
// port, and none waits for a next voyage there: the count is seen on Italy's six to Valletta (27125), four landed and two
// left at the port.

const ENG = nationId('ENG');
const GER = nationId('GER');
const ITA = nationId('ITA');

describe('a landing that sails without a marcher counts down, and says how many are ashore (ROADMAP R55b)', () => {
  it('27123: "lands in" never stands over a day at sea', () => {
    const r = new RowRun(27123, ENG);
    r.cmds([{ kind: 'declareWar', attacker: ENG, defender: GER }]);
    r.step();
    const ids = nearestDivisions(r.world, ENG, [1023.5, 275.5], 10);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: ENG }]);
    let same = { text: '', from: 0, longest: 0 };
    for (let h = 0; h < 360; h++) {
      r.step();
      const row = r.rows.find((x) => x.divisions.some((d) => ids.includes(d.id)));
      if (!row) continue;
      const text = landingStatus(row);
      if (row.state === 'sailing' && row.lands !== undefined) {
        if (text === same.text) same.longest = Math.max(same.longest, h - same.from);
        else same = { text, from: h, longest: same.longest };
      } else same = { text: '', from: h, longest: same.longest };
    }
    expect(same.longest, 'hours of one "lands in"').toBeLessThanOrEqual(24);
    expect(r.broken).toEqual([]);
  }, 300_000);

  it('27125: the six nearest Rome to Valletta; the next voyage reads "4 of 6 ashore"', () => {
    const r = new RowRun(27125, ITA);
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: ENG }]);
    r.step();
    const ids = nearestDivisions(r.world, ITA, [1095.5, 344.5], 6);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1106.5, y: 383.5, nation: ITA }]);
    let ashoreSeen = '';
    for (let h = 0; h < 240 && !ashoreSeen; h++) {
      r.step();
      const row = r.rows.find((x) => x.state === 'gathering' && x.divisions.some((d) => ids.includes(d.id)));
      if (row?.ashore && /sails in/.test(landingStatus(row))) ashoreSeen = landingStatus(row);
    }
    expect(ashoreSeen).toMatch(/^\d+ of \d+ ashore; sails in/);
    expect(r.broken).toEqual([]);
  }, 300_000);
});
