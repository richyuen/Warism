import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { voyagesFor } from '../../src/sim/systems/landings';
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
//
// ROADMAP R56b (critic run 57, R57-N1): those four were not at Valletta: their transports broke off and put them ashore
// near Palermo, as their panels and the news said, while the row read "4 of 6 ashore". Now the row says where: "4 came
// ashore near Palermo, away from Valletta; sails in …"; "n of m ashore" is for those ashore at the target.

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

  it('27125: the six nearest Rome to Valletta; the next voyage says the four came ashore near Palermo, not "4 of 6 ashore"', () => {
    const r = new RowRun(27125, ITA);
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: ENG }]);
    r.step();
    const ids = nearestDivisions(r.world, ITA, [1095.5, 344.5], 6);
    r.ids = ids;
    for (const id of ids) r.cmds([{ kind: 'moveFormation', id, x: 1106.5, y: 383.5, nation: ITA }]);
    let ashoreSeen = '';
    let overSeen = '';
    let short: LandingRow['ships'] | null = null;
    for (let h = 0; h < 240 && !overSeen; h++) {
      r.step();
      const row = r.rows.find((x) => x.state === 'gathering' && x.divisions.some((d) => ids.includes(d.id)));
      if (!ashoreSeen && (row?.ashore || row?.away) && /sails in/.test(landingStatus(row!))) ashoreSeen = landingStatus(row!);
      if (!short && row && (row.ashore || row.away) && row.ships.have < row.ships.need) short = row.ships;
      const over = r.rows.find((x) => x.state === 'over' && x.outcome?.away);
      if (over) overSeen = landingStatus(over);
    }
    expect(ashoreSeen).toMatch(/^4 came ashore near Palermo, away from Valletta; sails in/);
    expect(ashoreSeen).not.toMatch(/of \d+ ashore/);
    // Its end names the place too, the four gone from its row before it (R56b).
    expect(overSeen).toMatch(/4 came ashore near Palermo, away from Valletta/);
    // The two left at Rome, short of room for both, go one a voyage: so counted, not short (R56e; critic run 57: "12
    // transports needed, 7 at hand" in red).
    expect(short, 'the next voyage short of room for both').not.toBeNull();
    expect(short!.voyages).toBe(2);
    expect(r.broken).toEqual([]);
  }, 300_000);
});

describe('the voyages a landing short of room makes (ROADMAP R56e)', () => {
  it('largest first, each into the first voyage with room left; 0 when one does not fit', () => {
    expect(voyagesFor([12460, 12460], 14000)).toBe(2);
    expect(voyagesFor([12000, 6000, 6000], 18000)).toBe(2);
    expect(voyagesFor([12000, 5000, 4000, 3000], 12000)).toBe(2);
    expect(voyagesFor([20000], 14000)).toBe(0);
  });
});

describe('a row with some ashore says where (ROADMAP R55b, R56b)', () => {
  const row = { id: 1, state: 'gathering', port: 'Rome', target: '=Valletta', land: [0, 0], to: [0, 0], portAt: [0, 0], divisions: [{ id: 5, voyage: null }, { id: 6, voyage: null }], ships: { need: 2, have: 2 }, sails: { days: 1 }, click: 1 } as unknown as LandingRow;
  it('at the target: "n of m ashore"', () => {
    expect(landingStatus({ ...row, ashore: 4 })).toBe('4 of 6 ashore; sails in about a day');
  });
  it('away from it: where, and those at the target first', () => {
    expect(landingStatus({ ...row, away: 4, awayAt: 'Palermo' })).toBe('4 came ashore near Palermo, away from Valletta; sails in about a day');
    expect(landingStatus({ ...row, ashore: 1, away: 3 })).toBe('1 of 6 ashore; 3 came ashore away from Valletta; sails in about a day');
  });
});
