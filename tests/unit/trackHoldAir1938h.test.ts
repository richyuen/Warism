import { describe, expect, it } from 'vitest';
import { TimelineFile as TimelineSchema, type TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R74h (critic run 65: the Sino-Soviet clash of 1969 a months-long air war, 27 Soviet aircraft lost in July):
// a hold with `air` holds its sides' aircraft too (`World.airFoes`); one without it holds the land alone, as before.

const id = (tag: string): number => (TAGS_1938H as readonly string[]).indexOf(tag) + 1;

describe('a hold of the air (R74h)', () => {
  it('its sides at war are no foes in the air while it stands; without `air`, they are', () => {
    for (const air of [true, false]) {
      const tl: TimelineFile = {
        events: [
          { date: '1938-01-02', kind: 'war', attackers: ['GER'], defenders: ['POL'], note: 'A war' },
          { date: '1938-01-02', hour: 1, kind: 'hold', sides: [['GER'], ['POL']], until: '1938-01-10', ...(air ? { air: true } : {}) },
        ],
      };
      const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) }, TimelineSchema.parse(tl));
      const w = sim.world;
      const quiet = (x: typeof w): void => {
        x.out.events.length = 0;
        x.out.fires.length = 0;
      };
      sim.step(24 + 3, quiet);
      expect(w.wars.atWar(id('GER'), id('POL'))).toBe(true);
      expect(w.holds(id('GER'), id('POL'))).toBe(true);
      expect(w.airFoes(id('GER'), id('POL'))).toBe(!air);
      expect(w.airFoes(id('POL'), id('GER'))).toBe(!air);
      // The hold over: foes in the air again.
      sim.step(w.track!.tickOf('1938-01-11') - w.tick, quiet);
      expect(w.wars.atWar(id('GER'), id('POL'))).toBe(true);
      expect(w.airFoes(id('GER'), id('POL'))).toBe(true);
    }
  });
});
