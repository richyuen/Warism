import { describe, expect, it } from 'vitest';
import { HOLD_STRIDE } from '../../src/shared/protocol';
import { heldBy } from '../../src/sim/systems/landings';
import type { World } from '../../src/sim/world';
import { RowRun, nearestDivisions } from '../helpers/landingRows';
import { nationId } from '../helpers/sim1938';

// ROADMAP R53e (critic run 54's objection to ADR-873): on 21105 a held landing's row named the United Kingdom, but the
// fight was 14–19 cells off and nothing on the map joined the transports to the fleet that held them. Now the
// snapshot's `holds` has, for each held group of the player's landings, the group's place, the fleet's (the one
// `heldBy` names) and the foe, and the map draws a mark between them.

const ITA = nationId('ITA');

describe("a held landing's transports are joined to the fleet that holds them (ROADMAP R53e)", () => {
  it('21105: a hold row each held hour, the fleet in the group’s sea battle and the nation named; none otherwise', { timeout: 600_000 }, () => {
    const r = new RowRun(21105, ITA);
    r.step();
    r.cmds([{ kind: 'declareWar', attacker: ITA, defender: nationId('ENG') }]);
    r.step();
    const ids = nearestDivisions(r.world, ITA, [1095.5, 344.5], 2);
    r.ids = ids;
    r.cmds(ids.map((id) => ({ kind: 'moveFormation' as const, id, x: 1106.5, y: 383.5, nation: ITA })));
    const w = r.world;
    const c = w.formations.cols;
    const holdsOf = (): number[] => (r.s as unknown as { holds(w: World): number[] }).holds(w);
    let held = 0;
    let free = 0;
    for (let h = 0; h < 24 * 8; h++) {
      r.step();
      const l = [...w.landings.values()].find((x) => x.nation === ITA);
      if (!l) continue;
      const rows: number[][] = [];
      const hs = holdsOf();
      for (let i = 0; i + HOLD_STRIDE <= hs.length; i += HOLD_STRIDE) rows.push(hs.slice(i, i + HOLD_STRIDE));
      const by = heldBy(w, l);
      if (by === 0) {
        expect(rows.filter((x) => x[5] === l.id), `t${w.tick}: not held`).toEqual([]);
        free++;
        continue;
      }
      held++;
      const mine = rows.filter((x) => x[5] === l.id);
      expect(mine.length, `t${w.tick}: one hold row`).toBe(1);
      const [gx, gy, fx, fy, foe] = mine[0]!;
      expect(foe, `t${w.tick}: the foe named`).toBe(by);
      const group = l.fleets.find((o) => w.formations.has(o) && Math.abs(c.x[o]! - gx!) < 1e-3 && Math.abs(c.y[o]! - gy!) < 1e-3);
      expect(group, `t${w.tick}: at a group of the landing`).toBeDefined();
      const battle = w.seaBattles.find((b) => b.fleets.includes(group!))!;
      expect(battle.fleets.some((f) => c.nation[f] === by && Math.abs(c.x[f]! - fx!) < 1e-3 && Math.abs(c.y[f]! - fy!) < 1e-3), `t${w.tick}: at a fleet of its sea battle`).toBe(true);
    }
    expect(held, 'hours held').toBeGreaterThan(24);
    expect(free, 'hours not held').toBeGreaterThan(0);
  });
});
