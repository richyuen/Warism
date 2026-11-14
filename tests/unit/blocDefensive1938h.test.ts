import { describe, expect, it } from 'vitest';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { blocsOf, strengths } from '../../src/sim/ai/strategic';
import { blocLeader } from '../../src/sim/systems/nuclear';
import { declareWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R81a (ADR-1033; critic run 67's design objection: the free world after 1975 taking capitals far afield):
// where the blocs are (a game of the historical track once it has ended, ADR-981), a bloc is a defensive pact. None
// of it is called to a member's war of its own making; to a member's defence its leader comes at any distance and the
// other members within reach, as an attacker's ally does (R53l). The control is the same world with no arsenal, so no
// blocs: there every ally is called as before. With arsenals Britain and the Soviet Union lead the two blocs.

const assets = assets1938(SIZE_1938.w);
const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};
const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;

/** 1938h left on its first day; with `arsenals`, Britain and the Soviet Union hold 200 warheads each. */
function world(arsenals: boolean): World {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
  sim.command({ kind: 'leaveTrack' });
  sim.step(1, quiet);
  const w = sim.world;
  if (arsenals) for (const t of ['ENG', 'SOV']) w.warheads.set(id(t), { stock: 200, paid: 0 });
  return w;
}

describe('a bloc is a defensive pact (ROADMAP R81a)', () => {
  it('the blocs are the Anglo-French alliance and the Comintern with the arsenals, none without', () => {
    const w = world(true);
    expect(w.track!.ended).toBe(true);
    expect(blocLeader(w, id('ENG')) && blocLeader(w, id('SOV'))).toBe(true);
    expect(blocsOf(w, strengths(w))).toEqual(new Set([w.alliances.allianceOf(id('ENG'))!.id, w.alliances.allianceOf(id('SOV'))!.id]));
    expect(world(false).warheads.size).toBe(0);
  });

  it("none of a bloc is called to a member's war of its own making", () => {
    expect(declareWar(world(false), id('FRA'), id('ITA'))!.sides[0]).toContain(id('ENG'));
    const war = declareWar(world(true), id('FRA'), id('ITA'))!;
    expect(war.sides[0]).toContain(id('FRA'));
    expect(war.sides[0]).not.toContain(id('ENG'));
  });

  it("to a member's defence the leader comes, and the members far from the attackers do not", () => {
    // Chile on Britain: France, a member with no land near Chile's side, is called with no blocs and stays out with
    // them. Saudi Arabia on Britain: France, by Djibouti within reach, comes in both.
    expect(declareWar(world(false), id('CHL'), id('ENG'))!.sides[1]).toEqual(expect.arrayContaining([id('ENG'), id('FRA')]));
    const far = declareWar(world(true), id('CHL'), id('ENG'))!;
    expect(far.sides[1]).toContain(id('ENG'));
    expect(far.sides[1]).not.toContain(id('FRA'));
    expect(declareWar(world(true), id('SAU'), id('ENG'))!.sides[1]).toEqual(expect.arrayContaining([id('ENG'), id('FRA')]));
    // Chile on France: Britain, the bloc's leader, comes to its member's defence at any distance.
    expect(declareWar(world(true), id('CHL'), id('FRA'))!.sides[1]).toEqual(expect.arrayContaining([id('FRA'), id('ENG')]));
  });
});
