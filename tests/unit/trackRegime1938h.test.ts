import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { TimelineFile as TimelineSchema, type TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { staticCe } from '../../src/sim/systems/efficiency';
import { assets1938 } from '../helpers/earth';

// ROADMAP R71a (ADR-992): a regime change (a coup, a revolution) sets the nation's aggression and its static command
// efficiency, as the start does from the scenario, and is told by its note. A nation not living is refused; the event
// needs a note.

const id = (tag: string): number => TAGS_1938H.indexOf(tag) + 1;
const assets = assets1938(SIZE_1938.w);

describe('a regime change (ROADMAP R71a)', () => {
  it("sets the nation's aggression and command efficiency, told by its note; none for a nation not living", () => {
    const tl: TimelineFile = {
      events: [
        { date: '1938-01-02', kind: 'regime', nation: 'CUB', aggression: 50, note: 'The Cuban Revolution' },
        { date: '1938-01-02', kind: 'regime', nation: 'LAO', aggression: 70, note: 'Not yet a nation' },
      ],
    };
    const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, tl);
    const w = sim.world;
    const nc = w.nations.cols;
    expect(nc.aggression[id('CUB')]).not.toBe(50);
    const laos = nc.aggression[id('LAO')]!;
    const told: number[] = [];
    sim.step(25, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.TrackEvent) told.push(ev[i + 3]!);
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    expect(nc.aggression[id('CUB')]).toBe(50);
    expect(nc.ceStatic[id('CUB')]).toBeCloseTo(staticCe(50), 6);
    expect(told).toContain(id('CUB'));
    expect(nc.living[id('LAO')]).not.toBe(1);
    expect(nc.aggression[id('LAO')]).toBe(laos);
    expect(told).not.toContain(id('LAO'));
  });

  it('a regime change without a note is refused by the schema', () => {
    expect(TimelineSchema.safeParse({ events: [{ date: '1938-01-02', kind: 'regime', nation: 'CUB', aggression: 50 }] }).success).toBe(false);
    expect(TimelineSchema.safeParse({ events: [{ date: '1938-01-02', kind: 'regime', nation: 'CUB', aggression: 50, note: 'x' }] }).success).toBe(true);
  });
});
