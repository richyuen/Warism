import { describe, expect, it } from 'vitest';
import { Refusal } from '../../src/shared/commands';
import { EventKind, TrackEnd } from '../../src/shared/events';
import { decodeSections } from '../../src/sim/core/sections';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { TRACK_SECTION } from '../../src/sim/track';
import { assets1938 } from '../helpers/earth';

// ROADMAP R62d (SPEC §7.7): a dormant nation born on its date with its land, cores and seat; the track's end on its
// last day, every stream of chance derived again from the second seed: two games of one seed and two second seeds are
// one world until the end and two after it.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
// A rough Slovakia: the east of Czechoslovakia.
const SLOVAKIA: [number, number][] = [[16.8, 48.6], [17.2, 49.0], [18.4, 49.6], [19.6, 49.5], [22.6, 49.2], [22.6, 48.3], [20.5, 47.9], [17.8, 47.7]];

function stepOne(sim: Sim): number[][] {
  const out: number[][] = [];
  sim.step(1, (w) => {
    for (let i = 0; i < w.out.events.length; i += 6) out.push(w.out.events.slice(i, i + 6));
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  return out;
}

const make = (timeline: TimelineFile, after = 0): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } }, timeline);

/** The sections of a save that differ from another's, by name; the track's own and the seed's left out. */
function differing(a: Uint8Array, b: Uint8Array): string[] {
  const sb = new Map(decodeSections(b).map((s) => [s.name, s]));
  const out: string[] = [];
  for (const s of decodeSections(a)) {
    if (s.name === TRACK_SECTION || s.name === 'world.meta' || s.name === 'world.rng') continue;
    const o = sb.get(s.name);
    if (!o || o.dtype !== s.dtype || Buffer.compare(Buffer.from(s.data.buffer, s.data.byteOffset, s.data.byteLength), Buffer.from(o.data.buffer, o.data.byteOffset, o.data.byteLength)) !== 0) out.push(s.name);
  }
  return out;
}

describe("the historical track's births and end (ROADMAP R62d)", () => {
  it('a dormant nation is born on its hour with its land, cores and seat; born again, it is passed over', () => {
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', hour: 6, kind: 'born', nation: 'SLO', from: ['CZS'], ring: SLOVAKIA },
        { date: '1938-01-03', kind: 'born', nation: 'SLO', from: ['CZS'], ring: SLOVAKIA },
      ],
    };
    const sim = make(tl);
    const w = sim.world;
    const [SLO, CZS] = [id('SLO'), id('CZS')];
    expect(w.track!.unborn.has(SLO)).toBe(true);
    while (sim.tick < 24 + 6) {
      stepOne(sim);
      expect(w.nations.cols.living[SLO]).toBe(0);
    }
    const events = stepOne(sim);
    const nc = w.nations.cols;
    expect(nc.living[SLO]).toBe(1);
    expect(nc.living[CZS]).toBe(1);
    expect(w.track!.unborn.has(SLO)).toBe(false);
    expect(nc.cells[SLO]).toBeGreaterThan(100);
    expect(nc.revivalsLeft[SLO]).toBeGreaterThan(0);
    // Its cores: provinces of its own; its seat: Bratislava's city, the nearest of its own to its table's capital.
    expect(w.provinces.provincesOf(SLO).length).toBeGreaterThan(0);
    for (const p of w.provinces.provincesOf(SLO)) expect(w.cells.province.includes(p)).toBe(true);
    const cc = w.cities.cols;
    let seat = 0;
    w.cities.forEach((ci) => {
      if (cc.capitalOf[ci] === SLO) seat = ci;
    });
    expect(seat).not.toBe(0);
    expect(w.cells.owner[cc.cell[seat]!]).toBe(SLO);
    expect(Math.abs(nc.capitalX[SLO]! - cc.x[seat]!)).toBeLessThan(1e-9);
    // Its rows: the land Czechoslovakia gave, then the birth.
    const kinds = events.map((e) => e[1]);
    expect(kinds.indexOf(EventKind.LandCeded)).toBeGreaterThanOrEqual(0);
    expect(kinds.indexOf(EventKind.NationBorn)).toBeGreaterThan(kinds.indexOf(EventKind.LandCeded));
    expect(events.filter((e) => e[1] === EventKind.NationBorn).map((e) => [e[2], e[3]])).toEqual([[SLO, CZS]]);
    // Born again: passed over, as one that lives.
    while (sim.tick < 2 * 24) stepOne(sim);
    const again = stepOne(sim);
    expect(again.filter((e) => e[1] === EventKind.TrackSkipped).map((e) => [e[2], e[5]])).toEqual([[SLO, Refusal.Alive]]);
  });

  it('two second seeds: one world until the end, then two', () => {
    const tl: TimelineFile = { end: '1938-01-04', events: [] };
    const END = 3 * 24;
    const a = make(tl, 111);
    const b = make(tl, 222);
    while (a.tick < END) {
      stepOne(a);
      stepOne(b);
    }
    // Up to the end's hour: every section but the track's own (its second seed) the same.
    expect(differing(a.save(), b.save())).toEqual([]);
    const ea = stepOne(a);
    stepOne(b);
    expect(ea.filter((e) => e[1] === EventKind.TrackEnded).map((e) => [e[0], e[3]])).toEqual([[END, TrackEnd.date]]);
    expect(a.world.track!.ended).toBe(true);
    expect(a.world.seed).toBe(111);
    expect(b.world.seed).toBe(222);
    // Then the worlds part, within a year.
    let at = -1;
    for (let d = 0; d < 365 && at < 0; d++) {
      for (let h = 0; h < 24; h++) {
        stepOne(a);
        stepOne(b);
      }
      if (differing(a.save(), b.save()).length > 0) at = d;
    }
    process.stderr.write(`second seeds parted on day ${at} after the end: ${differing(a.save(), b.save()).slice(0, 6).join(', ')}\n`);
    expect(at).toBeGreaterThanOrEqual(0);
    // A save after the end keeps the second seed in force.
    const c = make(tl, 999);
    c.load(a.save());
    expect(c.world.seed).toBe(111);
    expect(c.world.track!.ended).toBe(true);
  });

  it('with no second seed, the end keeps the seed', () => {
    const sim = make({ end: '1938-01-02', events: [] });
    while (sim.tick <= 24) stepOne(sim);
    expect(sim.world.track!.ended).toBe(true);
    expect(sim.world.seed).toBe(SEED_1938H);
  });
});
