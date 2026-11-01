import { describe, expect, it } from 'vitest';
import { Refusal } from '../../src/shared/commands';
import type { NationStat } from '../../src/shared/protocol';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar, makePeace, whyNotWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { standingOf, standingText, type Who } from '../../src/ui/standing';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// PLAN 7.175b: the menu's standing agrees with the sim. A bond is what `whyNotWar` refuses for
// (and `forceWar` breaks): the standing has `bond` exactly where the sim names one.

const [ENG, FRA, AOF, AEF, GER, ITA, POL, SWI] = ['ENG', 'FRA', 'AOF', 'AEF', 'GER', 'ITA', 'POL', 'SWI'].map(nationId) as number[] as [number, number, number, number, number, number, number, number];
const BONDS: readonly number[] = [Refusal.Truce, Refusal.Subject, Refusal.Allied, Refusal.SameOverlord, Refusal.AlliedRealm];

/** The world's nations as the statistics message has them (the fields a standing reads). */
function stats(w: World): Map<number, Who> {
  const out = new Map<number, Who>();
  w.nations.forEach((id) => {
    const al = w.alliances.allianceOf(id);
    out.set(id, {
      id,
      overlord: w.nations.cols.overlord[id]!,
      alliance: al ? ({ id: al.id, members: al.members } as NationStat['alliance']) : null,
      truces: w.wars.truces.filter((t) => t.untilTick > w.tick && (t.a === id || t.b === id)).map((t) => ({ with: t.a === id ? t.b : t.a, days: Math.ceil((t.untilTick - w.tick) / 24) })),
    });
  });
  return out;
}
const warsOf = (w: World) => w.wars.list.map((x) => ({ attackers: x.sides[0]!, defenders: x.sides[1]! }));

describe('a nation\'s standing with the played one (PLAN 7.175b)', () => {
  it('each kind, as the 1938 start and a truce have them', () => {
    const w = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) }).world;
    makePeace(w, declareWar(w, GER, POL)!);
    const s = stats(w);
    const of = (a: number, b: number) => standingOf(a, b, (id) => s.get(id), warsOf(w));
    expect(of(GER, ITA)).toEqual({ kind: 'allied', days: 0, bond: true });
    expect(of(FRA, AOF)).toMatchObject({ kind: 'puppet', bond: true });
    expect(of(AOF, FRA)).toMatchObject({ kind: 'overlord', bond: true });
    expect(of(AEF, AOF)).toMatchObject({ kind: 'realm', bond: true });
    expect(of(ENG, AOF)).toMatchObject({ kind: 'realm', bond: true });
    expect(of(GER, POL)).toMatchObject({ kind: 'truce', bond: true });
    expect(of(GER, POL).days).toBeGreaterThan(0);
    expect(of(GER, SWI)).toEqual({ kind: 'neutral', days: 0, bond: false });
    declareWar(w, GER, SWI);
    expect(standingOf(GER, SWI, (id) => s.get(id), warsOf(w))).toEqual({ kind: 'war', days: 0, bond: false });
  });

  it('agrees with whyNotWar: a bond where the sim names one, none elsewhere (every pair of 40 nations)', () => {
    const w = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) }).world;
    makePeace(w, declareWar(w, GER, POL)!);
    makePeace(w, declareWar(w, ITA, AOF)!);
    const s = stats(w);
    const ids = [...s.keys()].filter((n) => w.nations.cols.living[n] === 1).slice(0, 40);
    for (const n of [ENG, FRA, AOF, AEF, GER, ITA, POL]) if (!ids.includes(n)) ids.push(n);
    const wrong: string[] = [];
    for (const a of ids)
      for (const b of ids) {
        if (a === b) continue;
        const why = whyNotWar(w, a, b);
        if (why === Refusal.Overrun || why === Refusal.AtWar) continue;
        const st = standingOf(a, b, (id) => s.get(id), warsOf(w));
        if (st.bond !== BONDS.includes(why)) wrong.push(`${a}→${b}: ${st.kind} against refusal ${why}`);
      }
    expect(wrong).toEqual([]);
  });

  it('in words', () => {
    expect(standingText({ kind: 'truce', days: 12, bond: true })).toBe('Truce (12 days)');
    expect(standingText({ kind: 'truce', days: 1, bond: true })).toBe('Truce (1 day)');
    expect(standingText({ kind: 'allied', days: 0, bond: true })).toBe('Allied');
    expect(standingText({ kind: 'neutral', days: 0, bond: false })).toBe('Neutral');
  });
});
