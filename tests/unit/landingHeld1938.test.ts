import { describe, expect, it } from 'vitest';
import { heldBy } from '../../src/sim/systems/landings';
import { landingStatus } from '../../src/ui/landingStatus';
import { voyageText } from '../../src/ui/voyageText';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R50c (critic run 52, R52-N3): on 21105 (Italy's two nearest Rome to Valletta) the row read "at sea: lands in
// about a day" from t61 to t133 while transport group 1195 was in a fight, held at 1098, 376 (engaged t63–t147). Now a
// row whose landing has a group in a fight says "under attack, held up", and no days; each hour it reads as its groups
// stand, and a row's days, once it moves again, are kept (landed within them and a day, as ADR-860). R52c (critic run
// 53, R53-N3: nothing on the map, the panel silent): the row and the panels of those aboard name who holds it up, a
// British fleet 19 cells off in a fight with the group at its sight's range.

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
        expect(/^at sea: under attack( by .+)?, held up$/.test(said), `t${w.tick} row ${row.id}: "${said}", a group engaged ${engaged}`).toBe(engaged);
        // R52c (critic run 53, R53-N3): by whom, and the panels of those aboard say the same.
        if (engaged) {
          expect(said, `t${w.tick} row ${row.id}`).toBe('at sea: under attack by United Kingdom, held up');
          for (const d of row.divisions) if (d.voyage?.state === 'atSea') expect(voyageText(d.voyage), `t${w.tick} ${d.id}`).toBe('At sea, held up: its landing is under attack by United Kingdom');
        }
      }
    }
    expect(held, 'hours held').toBeGreaterThan(24);
    expect(r.broken).toEqual([]);
  });
});

describe('who holds a landing up is the fleet in its sea battle (ROADMAP R53b)', () => {
  it('21105: a division of a second foe in a fight beside the transports is not named; the British fleet is', { timeout: 600_000 }, () => {
    // Critic run 54, R54-N1: `heldBy` took the nearest formation in a fight at war with the lander, of any kind; with
    // two foes, an army fighting ashore nearer than the fleet shooting at the transports was named.
    const r = new RowRun(21105, ITA);
    r.step();
    const [ENG, FRA] = [nationId('ENG'), nationId('FRA')];
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: ENG }]);
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: FRA }]);
    r.step();
    const ids = nearestDivisions(r.world, ITA, [1095.5, 344.5], 2);
    r.ids = ids;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1106.5, y: 383.5, nation: ITA })));
    const w = r.world;
    const c = w.formations.cols;
    for (let h = 0; h < 24 * 10; h++) {
      r.step();
      const l = [...w.landings.values()].find((x) => x.nation === ITA);
      const group = l?.fleets.find((o) => w.formations.has(o) && c.engaged[o] === 1);
      if (!l || group === undefined || !w.seaBattles.some((b) => b.fleets.includes(group))) continue;
      expect(heldBy(w, l), `t${w.tick}`).toBe(ENG);
      // A French division in a fight, put on the transports' place: an army, not the fleet that holds them.
      let fr = 0;
      w.formations.forEach((f) => {
        if (fr === 0 && c.nation[f] === FRA && !w.isFleet(f) && !w.embarked.has(f)) fr = f;
      });
      expect(fr).toBeGreaterThan(0);
      c.x[fr] = c.x[group]!;
      c.y[fr] = c.y[group]!;
      c.engaged[fr] = 1;
      expect(heldBy(w, l), `t${w.tick}: French division ${fr} beside group ${group}`).toBe(ENG);
      return;
    }
    expect.fail('no hour with the landing in a sea battle');
  });
});
