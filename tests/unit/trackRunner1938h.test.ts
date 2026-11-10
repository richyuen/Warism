import { describe, expect, it } from 'vitest';
import { EventKind, JoinedBy, TrackEnd } from '../../src/shared/events';
import { Refusal } from '../../src/shared/commands';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { validateFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { timelineHash } from '../../src/sim/track';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62b (ADR-919, SPEC §7.7): the track's runner. A test timeline of every kind R62b applies fires each on its
// hour (none late); one that no longer applies is passed over with its row; a save mid-track loads bit-identical and
// the run after it is the uninterrupted one; a save of another timeline ends the track, told.

const TEST: TimelineFile = {
  events: [
    { date: '1938-01-02', hour: 3, kind: 'guarantee', guarantor: 'ENG', target: 'POL' },
    { date: '1938-01-02', hour: 5, kind: 'annex', annexer: 'GER', target: 'AUT' },
    { date: '1938-01-03', kind: 'war', attackers: ['GER'], defenders: ['POL'] },
    { date: '1938-01-03', hour: 2, kind: 'join', nation: 'FRA', beside: 'POL', against: 'GER' },
    { date: '1938-01-04', kind: 'allianceJoin', nation: 'HUN', leader: 'GER', nameKey: 'alliance.anti_comintern' },
    { date: '1938-01-04', hour: 1, kind: 'allianceJoin', nation: 'SWE', leader: 'NOR', nameKey: 'alliance.baltic_entente' },
    { date: '1938-01-05', kind: 'allianceLeave', nation: 'ROM' },
    { date: '1938-01-05', hour: 6, kind: 'puppet', overlord: 'ITA', subject: 'YEM', autonomy: 40 },
    { date: '1938-01-06', kind: 'release', subject: 'MON' },
    { date: '1938-01-07', kind: 'peace', a: 'GER', b: 'POL', terms: 'white' },
    // The same peace again: that war is over, so it is passed over.
    { date: '1938-01-07', kind: 'peace', a: 'GER', b: 'POL', terms: 'white' },
    { date: '1938-01-08', kind: 'peace', a: 'NSP', b: 'REP', terms: 'score' },
  ],
};
const DUE = TEST.events.map((e) => (Number(e.date.slice(8)) - 1) * 24 + (e.hour ?? 0));
const END = 9 * 24;

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const make = (timeline: TimelineFile = TEST): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, timeline);

/** Steps to `tick`; the events of the ticks run, as [tick, kind, a, b, x, y]; after each tick, `each`. */
function run(sim: Sim, tick: number, each: () => void = () => {}): number[][] {
  const out: number[][] = [];
  while (sim.tick < tick) {
    sim.step(1, (w) => {
      for (let i = 0; i < w.out.events.length; i += 6) out.push(w.out.events.slice(i, i + 6));
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
    each();
  }
  return out;
}

describe("the historical track's runner (ROADMAP R62b)", () => {
  it('the test timeline is valid, and the scenario has its own', () => {
    expect(validateFile('scenarios/1938h/timeline.json', TEST)).toEqual([]);
    expect(timelineHash(TEST)).not.toBe(timelineHash(TIMELINE_1938H));
  });

  it('fires each event on its hour, none late; one that no longer applies is passed over with its row', () => {
    const sim = make();
    const w = sim.world;
    const t = w.track!;
    const events = run(sim, END, () => {
      // After the tick just run, every event due by it, and none after.
      expect(t.next, `tick ${sim.tick - 1}`).toBe(DUE.filter((d) => d <= sim.tick - 1).length);
    });
    const at = (kind: number, a: number, b: number): number[] => events.filter((e) => e[1] === kind && e[2] === a && e[3] === b).map((e) => e[0]!);
    expect(at(EventKind.WarDeclared, id('GER'), id('POL'))).toEqual([DUE[2]]);
    const joined = events.filter((e) => e[1] === EventKind.WarJoined && e[2] === id('FRA'));
    expect(joined.map((e) => [e[0], e[3], e[5]])).toEqual([[DUE[3], id('POL'), JoinedBy.track]]);
    // Passed over: the second peace, alone.
    const skipped = events.filter((e) => e[1] === EventKind.TrackSkipped);
    expect(skipped.map((e) => [e[0], e[2], e[3], e[5]])).toEqual([[DUE[10], id('GER'), 11, Refusal.NoSuch]]);
    // What each did.
    const nc = w.nations.cols;
    const al = w.alliances;
    expect(al.guarantees).toContainEqual({ guarantor: id('ENG'), target: id('POL') });
    expect(nc.living[id('AUT')]).toBe(0);
    expect(al.allianceOf(id('HUN'))).toBe(al.allianceOf(id('GER')));
    expect(al.allianceOf(id('SWE'))).toBeDefined();
    expect(al.allianceOf(id('SWE'))).toBe(al.allianceOf(id('NOR')));
    expect(al.allianceOf(id('ROM'))).toBeUndefined();
    expect(nc.overlord[id('YEM')]).toBe(id('ITA'));
    expect(nc.overlord[id('MON')]).toBe(0);
    expect(w.wars.atWar(id('GER'), id('POL'))).toBe(false);
    expect(w.wars.atWar(id('GER'), id('FRA'))).toBe(false);
    expect(w.wars.atWar(id('NSP'), id('REP'))).toBe(false);
    expect(t.next).toBe(TEST.events.length);
    expect(t.ended).toBe(false);
    // The white peace: Poland and Germany keep their own.
    const { owner, controller } = w.cells;
    let held = 0;
    for (let c = 0; c < owner.length; c++) if ((owner[c] === id('POL') && controller[c] !== id('POL')) || (owner[c] === id('GER') && controller[c] === id('POL'))) held++;
    expect(held).toBe(0);
  });

  it('a save mid-track loads bit-identical, and the run after it is the uninterrupted one', () => {
    const a = make();
    run(a, DUE[4]! + 1);
    const bytes = a.save();
    const b = make();
    b.load(bytes);
    expect(b.world.track!.next).toBe(a.world.track!.next);
    expect(b.save()).toEqual(bytes);
    const ea = run(a, END);
    const eb = run(b, END);
    expect(eb).toEqual(ea);
    expect(b.save()).toEqual(a.save());
  });

  it('a save of another timeline ends the track at the next hour, told; no event of it is applied', () => {
    const a = make();
    run(a, DUE[1]! + 1);
    const other: TimelineFile = { events: TEST.events.slice(0, 5) };
    const b = make(other);
    b.load(a.save());
    expect(b.world.track!.ended).toBe(false);
    const events = run(b, END);
    expect(events.filter((e) => e[1] === EventKind.TrackEnded).map((e) => [e[0], e[3]])).toEqual([[DUE[1]! + 1, TrackEnd.timelineChanged]]);
    expect(b.world.track!.ended).toBe(true);
    expect(events.some((e) => e[1] === EventKind.WarDeclared && e[2] === id('GER') && e[3] === id('POL'))).toBe(false);
    // Ended is kept by a save.
    const c = make(other);
    c.load(b.save());
    expect(c.world.track!.ended).toBe(true);
  });
});
