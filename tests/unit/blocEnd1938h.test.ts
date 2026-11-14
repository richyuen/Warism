import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { validateFile } from '../../src/sim/data/schemas';
import { blocAid, blocsOf, deterred, strengths } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { declareWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { blocBreaks, useTags } from '../helpers/diploInvariants';
import { assets1938 } from '../helpers/earth';

// ROADMAP R80b (ADR-1045; ADR-1031's answer 3, the user's): a bloc that ends. A test timeline dissolves the Comintern
// (the alliance the Soviet Union leads at 1938h's start, its stand-in for the Warsaw Pact) on its second day, and the
// track ends a day later. With the arsenals the blocs were two (the Anglo-French alliance and the Comintern, ADR-981);
// after the event they are one, the Anglo-French: a pact the Soviet Union founds after it (its CIS) is no bloc, so a
// war between the two is not deterred, no aid flows between them, and the CIS's members are called as any ally's.
// The control is the same timeline without the event: two blocs, as before.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
useTags((n) => TAGS_1938H[n - 1] ?? `#${n}`);
const END: TimelineFile = {
  end: '1938-01-03',
  events: [{ date: '1938-01-02', hour: 2, kind: 'allianceEnd', leader: 'SOV' }],
};
const PLAIN: TimelineFile = { end: '1938-01-03', events: [] };

/** 1938h on `timeline` to its end, the events of the run collected; with arsenals for Britain and the Soviet Union. */
function world(timeline: TimelineFile): { w: World; events: number[][] } {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);
  const events: number[][] = [];
  while (sim.tick < 3 * 24) {
    sim.step(1, (w) => {
      for (let i = 0; i < w.out.events.length; i += 6) events.push(w.out.events.slice(i, i + 6));
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
  }
  const w = sim.world;
  for (const t of ['ENG', 'SOV']) w.warheads.set(id(t), { stock: 200, paid: 0 });
  return { w, events };
}

describe('a bloc that ends (ROADMAP R80b)', () => {
  it('the event is valid in a timeline', () => {
    expect(validateFile('scenarios/1938h/timeline.json', END)).toEqual([]);
  });

  it('dissolves the leader’s alliance on its hour, every member out, told', () => {
    const before = world(PLAIN).w.alliances.allianceOf(id('SOV'));
    expect(before?.leader).toBe(id('SOV'));
    expect(before!.members.length).toBeGreaterThan(1);
    const { w, events } = world(END);
    expect(w.track!.ended).toBe(true);
    expect(w.alliances.allianceOf(id('SOV'))).toBeUndefined();
    for (const m of before!.members) expect(w.alliances.allianceOf(m)?.id === before!.id).toBe(false);
    const dissolved = events.filter((e) => e[1] === EventKind.AllianceDissolved && e[2] === before!.id);
    expect(dissolved).toHaveLength(1);
    expect(dissolved[0]![0]).toBe(24 + 2);
    expect(w.track!.blocsEnded()).toEqual(new Set([id('SOV')]));
  });

  it('after it the blocs are one; a pact the ended leader founds is outside deterrence, aid and the defensive pact', () => {
    // The control: two blocs.
    const plain = world(PLAIN).w;
    expect(blocsOf(plain, strengths(plain)).size).toBe(2);

    const { w } = world(END);
    const eng = w.alliances.allianceOf(id('ENG'))!;
    expect(blocsOf(w, strengths(w))).toEqual(new Set([eng.id]));
    // The Soviet Union founds a pact (the CIS) with Mongolia.
    w.alliances.create(id('SOV'), [id('MON')], 'alliance.defensive', 50);
    const cis = w.alliances.allianceOf(id('SOV'))!;
    expect(cis.members).toContain(id('MON'));
    const blocs = blocsOf(w, strengths(w));
    expect(blocs).toEqual(new Set([eng.id]));
    // The checker's `bloc` lines (ADR-804): none here; an aid row with one bloc is one.
    expect(blocBreaks(w, [])).toEqual([]);
    expect(blocBreaks(w, [w.tick, EventKind.BlocAid, id('ENG'), id('FRA'), 0, 0])).toHaveLength(1);
    // Deterrence needs two blocs: a war of Britain's on Mongolia, and of the Soviet Union's on France, is not deterred.
    expect(deterred(w, id('ENG'), id('MON'), blocs)).toBe(false);
    expect(deterred(w, id('SOV'), id('FRA'), blocs)).toBe(false);
    // In the control, with the Comintern a bloc, they are.
    const pb = blocsOf(plain, strengths(plain));
    expect(deterred(plain, id('SOV'), id('FRA'), pb)).toBe(true);
    // No aid: `blocAid` acts for two blocs only (the AI calls it so); with one it gives nothing.
    const gold = w.nations.cols.gold.slice();
    blocAid(w, blocs);
    expect([...w.nations.cols.gold]).toEqual([...gold]);
    // The CIS is an alliance as any: a war of its member's own making (Mongolia on Manchukuo) calls the Soviet Union.
    // In the control, Mongolia in the Comintern, still a bloc, makes the same war alone (ADR-1033).
    const war = declareWar(w, id('MON'), id('MAN'))!;
    expect(war.sides[0]).toContain(id('SOV'));
    plain.alliances.join(id('MON'), plain.alliances.allianceOf(id('SOV'))!);
    expect(blocsOf(plain, strengths(plain)).has(plain.alliances.allianceOf(id('MON'))!.id)).toBe(true);
    expect(declareWar(plain, id('MON'), id('MAN'))!.sides[0]).not.toContain(id('SOV'));
  });
});
