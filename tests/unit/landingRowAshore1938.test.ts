import { describe, expect, it } from 'vitest';
import { landingStatus } from '../../src/ui/landingStatus';
import { nearestDivisions, RowRun } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R55b (critic run 56, R56-N1): Britain (27123), the ten divisions nearest Portsmouth sent to Bremerhaven; eight
// join, seven sail at h90 while one is still days from the port. The row read "at sea: lands in about 3 days" for 54
// hours without moving (the voyage from the port of the group kept there for the next voyage, counted each hour), and
// after the seven landed only "sails in about 6 days". Now its days to land are those of the groups carrying it, and a
// row with some of it ashore says how many.

const ENG = nationId('ENG');
const GER = nationId('GER');

describe('a landing that sails without a marcher counts down, and says how many are ashore (ROADMAP R55b)', () => {
  it('27123: "lands in" never stands over a day at sea; the next voyage reads "7 of 8 ashore"', () => {
    const r = new RowRun(27123, ENG);
    r.cmds([{ kind: 'declareWar', attacker: ENG, defender: GER }]);
    r.step();
    const ids = nearestDivisions(r.world, ENG, [1023.5, 275.5], 10);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1072.5, y: 259.5, nation: ENG }]);
    let same = { text: '', from: 0, longest: 0 };
    let ashoreSeen = '';
    for (let h = 0; h < 360; h++) {
      r.step();
      const row = r.rows.find((x) => x.divisions.some((d) => ids.includes(d.id)));
      if (!row) continue;
      const text = landingStatus(row);
      if (row.state === 'sailing' && row.lands !== undefined) {
        if (text === same.text) same.longest = Math.max(same.longest, h - same.from);
        else same = { text, from: h, longest: same.longest };
      } else same = { text: '', from: h, longest: same.longest };
      if (row.state === 'gathering' && row.ashore && /sails in/.test(text) && !ashoreSeen) ashoreSeen = text;
    }
    expect(same.longest, 'hours of one "lands in"').toBeLessThanOrEqual(24);
    expect(ashoreSeen).toMatch(/^\d+ of \d+ ashore; sails in/);
    expect(r.broken).toEqual([]);
  }, 300_000);
});
