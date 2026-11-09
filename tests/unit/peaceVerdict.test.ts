import { describe, expect, it } from 'vitest';
import { PEACE_ACCEPT_EXHAUSTION, PEACE_ACCEPT_SCORE, peaceVerdict } from '../../src/shared/peace';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar, offerPeace } from '../../src/sim/systems/war';
import { peaceWhy } from '../../src/ui/standing';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// PLAN 7.175c: the right-click menu's "Offer peace" is greyed out while the enemy would refuse. Its
// rule (`peaceVerdict`) is the sim's: on wars of each case, the verdict is what `offerPeace` does.

const [GER, POL] = ['GER', 'POL'].map(nationId) as [number, number];
const CASES: { score: number; exhaustion: [number, number]; toDeath: [boolean, boolean]; side: 0 | 1 }[] = [
  { score: 0, exhaustion: [0, 0], toDeath: [false, false], side: 0 },
  { score: PEACE_ACCEPT_SCORE - 1, exhaustion: [0, 0], toDeath: [false, false], side: 0 },
  { score: PEACE_ACCEPT_SCORE, exhaustion: [0, 0], toDeath: [false, false], side: 0 },
  { score: -PEACE_ACCEPT_SCORE, exhaustion: [0, 0], toDeath: [false, false], side: 1 },
  { score: 0, exhaustion: [0, PEACE_ACCEPT_EXHAUSTION], toDeath: [false, false], side: 0 },
  { score: 0, exhaustion: [0, PEACE_ACCEPT_EXHAUSTION + 1], toDeath: [false, false], side: 0 },
  { score: 80, exhaustion: [0, 90], toDeath: [false, true], side: 0 },
  { score: 80, exhaustion: [0, 0], toDeath: [true, false], side: 0 },
];

describe('the menu\'s peace verdict is the sim\'s (PLAN 7.175c)', () => {
  it('on wars of each case', () => {
    for (const c of CASES) {
      const w = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) }).world;
      const war = declareWar(w, GER, POL)!;
      [war.score, war.exhaustion, war.fightToDeath] = [c.score, [...c.exhaustion], [...c.toDeath]];
      const v = peaceVerdict(c.score, c.exhaustion, c.toDeath, c.side);
      expect(offerPeace(w, war.id, c.side === 0 ? GER : POL), JSON.stringify(c)).toBe(v.accepted);
    }
  });

  it('says why in words', () => {
    expect(peaceWhy(peaceVerdict(80, [0, 0], [false, true], 0))).toBe('They fight to the death: no peace while they do.');
    expect(peaceWhy(peaceVerdict(12, [0, 30.4], [false, false], 0))).toBe(`They refuse: lead the war score by ${PEACE_ACCEPT_SCORE} (now +12), or wear them out (war weariness 30, over ${PEACE_ACCEPT_EXHAUSTION} needed).`);
    expect(peaceWhy(peaceVerdict(-8, [0, 0], [false, false], 0))).toContain('(now -8)');
    expect(peaceWhy(peaceVerdict(30, [0, 0], [false, false], 0))).toBe('');
  });

  // ROADMAP R57e (critic run 58): 29401's offer refused at war weariness 39.97 read "40 of 40". The figures never read
  // as at the bar while the verdict is under it.
  it('its figures never round up to the bar it refuses under', () => {
    expect(peaceWhy(peaceVerdict(0, [0, 39.97], [false, false], 0))).toContain(`(war weariness 40, over ${PEACE_ACCEPT_EXHAUSTION} needed)`);
    expect(peaceWhy(peaceVerdict(PEACE_ACCEPT_SCORE - 0.4, [0, 0], [false, false], 0))).toContain(`(now +${PEACE_ACCEPT_SCORE - 1})`);
    expect(peaceWhy(peaceVerdict(-0.4, [0, 0], [false, false], 0))).toContain('(now +0)');
  });
});
