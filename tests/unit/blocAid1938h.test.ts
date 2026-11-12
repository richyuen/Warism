import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { AID_SHARE, blocAid } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import { assets1938 } from '../helpers/earth';

// ROADMAP R67e (ADR-990): a bloc's leader aids a nation of neither bloc at war with a member of the other: gold
// (AID_SHARE of its income) and, while the aided side is losing, a division of volunteers of its men and gold queued
// for the aided; a `BlocAid` row. None to a nation it is at war with. The 1938 world's Entente and Comintern stand in
// for the two blocs; Italy (in neither) at war with Britain.

const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;

function setup(): { sim: Sim; blocs: Set<number> } {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
  const w = sim.world;
  const blocs = new Set([w.alliances.allianceOf(id('ENG'))!.id, w.alliances.allianceOf(id('SOV'))!.id]);
  declareWar(w, id('ENG'), id('ITA'));
  w.out.events.length = 0;
  return { sim, blocs };
}

const rows = (sim: Sim): number[][] => {
  const ev = sim.world.out.events;
  const out: number[][] = [];
  for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.BlocAid) out.push([ev[i + 2]!, ev[i + 3]!]);
  return out;
};

describe('aid to the other side (ROADMAP R67e)', () => {
  it("the other bloc's leader gives gold to the nation at war with a bloc's member, told by a row", () => {
    const { sim, blocs } = setup();
    const w = sim.world;
    const nc = w.nations.cols;
    const war = w.wars.between(id('ENG'), id('ITA'))!.war;
    war.score = 0;
    const [sov, ita] = [nc.gold[id('SOV')]!, nc.gold[id('ITA')]!];
    const queued = w.production.ids().length;
    blocAid(w, blocs);
    const gift = AID_SHARE * nc.income[id('SOV')]!;
    expect(gift).toBeGreaterThan(0);
    expect(nc.gold[id('SOV')]).toBeCloseTo(sov - gift, 6);
    expect(nc.gold[id('ITA')]).toBeCloseTo(ita + gift, 6);
    expect(rows(sim)).toEqual([[id('SOV'), id('ITA')]]);
    // Not losing: no volunteers.
    expect(w.production.ids().length).toBe(queued);
  });

  it('while the aided side is losing, a division of volunteers is queued for it, its men the giver’s', () => {
    const { sim, blocs } = setup();
    const w = sim.world;
    const nc = w.nations.cols;
    const war = w.wars.between(id('ENG'), id('ITA'))!.war;
    // Italy defends; the attackers (Britain) winning.
    war.score = 40;
    const men = nc.manpower[id('SOV')]!;
    const itaMen = nc.manpower[id('ITA')]!;
    const before = new Set(w.production.ids());
    blocAid(w, blocs);
    const added = w.production.ids().filter((p) => !before.has(p));
    expect(added.length).toBe(1);
    expect(w.production.cols.nation[added[0]!]).toBe(id('ITA'));
    expect(nc.manpower[id('SOV')]).toBeLessThan(men);
    expect(nc.manpower[id('ITA')]).toBe(itaMen);
  });

  it('nothing to a nation the giver is at war with, nor with fewer than two blocs', () => {
    const { sim, blocs } = setup();
    const w = sim.world;
    declareWar(w, id('SOV'), id('ITA'));
    w.out.events.length = 0;
    const sov = w.nations.cols.gold[id('SOV')]!;
    blocAid(w, blocs);
    expect(rows(sim)).toEqual([]);
    expect(w.nations.cols.gold[id('SOV')]).toBe(sov);
    // One bloc only: none to aid against it.
    const other = setup();
    blocAid(other.sim.world, new Set([[...other.blocs][0]!]));
    expect(rows(other.sim)).toEqual([]);
  });
});
