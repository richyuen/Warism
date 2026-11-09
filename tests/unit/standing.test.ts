import { describe, expect, it } from 'vitest';
import { Refusal } from '../../src/shared/commands';
import type { NationStat } from '../../src/shared/protocol';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar, makePeace, whyNotWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { proposeAlliance } from '../../src/sim/systems/alliances';
import { allyWhy, standingOf, standingText, type Who } from '../../src/ui/standing';
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

  // PLAN 7.189 (R25-B1): a partner in a war is no bond (`forceWar` breaks nothing of it) and no war
  // is made on it; the standing names it where the sim refuses for it. A partner that is also an ally
  // or the overlord stands by the bond (PLAN 7.191, R26-B1): Force war breaks it.
  // And on Yugoslavia since ROADMAP R53l (ADR-887): on Poland Italy, out of reach, stays out; on Yugoslavia it fights beside.
  it("names a partner in a war where whyNotWar refuses for it (Germany's wars on Poland and Yugoslavia)", () => {
    const w = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) }).world;
    declareWar(w, GER, POL);
    declareWar(w, GER, nationId('YUG'));
    const s = stats(w);
    const of = (a: number, b: number) => standingOf(a, b, (id) => s.get(id), warsOf(w));
    expect(of(POL, FRA)).toEqual({ kind: 'beside', days: 0, bond: false });
    // The bond, and the war fought on one side (PLAN 7.192, critic run 26's 2).
    expect(of(GER, ITA)).toEqual({ kind: 'allied', days: 0, bond: true, beside: true });
    expect(standingText(of(GER, ITA))).toBe('Allied · fights beside you');
    const ids = [...new Set(w.wars.list.flatMap((x) => [...x.sides[0]!, ...x.sides[1]!]))].concat([ENG, SWI]);
    const wrong: string[] = [];
    for (const a of ids)
      for (const b of ids) {
        if (a === b) continue;
        const why = whyNotWar(w, a, b);
        if (why === Refusal.Overrun) continue;
        if ((of(a, b).kind === 'beside') !== (why === Refusal.Beside)) wrong.push(`${a}→${b}: ${of(a, b).kind} against refusal ${why}`);
      }
    expect(wrong).toEqual([]);
    expect(standingText(of(POL, FRA))).toBe('Fights beside you');
  });

  // PLAN 7.192 (critic run 26's 2): Manchukuo, beside Japan in its war on China, read "Fights beside
  // you" of its overlord; the bond and the shared war are both said.
  it("an overlord fought beside reads both: 'Your overlord · fights beside you'", () => {
    const w = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) }).world;
    const [MAN, JAP] = [nationId('MAN'), nationId('JAP')];
    const s = stats(w);
    const st = standingOf(MAN, JAP, (id) => s.get(id), warsOf(w));
    expect(st).toEqual({ kind: 'overlord', days: 0, bond: true, beside: true });
    expect(standingText(st)).toBe('Your overlord · fights beside you');
    expect(standingText(standingOf(JAP, MAN, (id) => s.get(id), warsOf(w)))).toBe('Your puppet · fights beside you');
    expect(standingText(standingOf(GER, ITA, (id) => s.get(id), warsOf(w)))).toBe('Allied');
  });

  // PLAN 7.192 (critic run 26's 3): "Propose alliance" was live to one's own overlord and to a partner
  // in an alliance, and the sim turned it down. Greyed with its reason exactly where the sim refuses.
  it('the alliance proposal greyed exactly where the sim turns it down, with its reason', () => {
    const tags = ['GER', 'ITA', 'JAP', 'MAN', 'POL', 'FRA', 'SWI', 'ALB', 'TIB'];
    const ids = tags.map(nationId);
    const base = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) });
    const bytes = base.save();
    const s = stats(base.world);
    const wrong: string[] = [];
    let greyed = 0;
    for (const a of ids)
      for (const b of ids) {
        if (a === b || base.world.wars.atWar(a, b)) continue;
        const why = allyWhy(a, b, (id) => s.get(id));
        const c = new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) });
        c.load(bytes);
        const made = proposeAlliance(c.world, a, b);
        if (made === (why !== '')) wrong.push(`${tags[ids.indexOf(a)]}→${tags[ids.indexOf(b)]}: ${made ? 'made' : 'turned down'}, why '${why}'`);
        if (why !== '') greyed++;
      }
    expect(wrong).toEqual([]);
    expect(greyed).toBeGreaterThan(0);
    const [MAN, JAP, POL, FRA] = ['MAN', 'JAP', 'POL', 'FRA'].map(nationId) as [number, number, number, number];
    expect(allyWhy(MAN, JAP, (id) => s.get(id))).toBe('It is your overlord: you are bound to it already.');
    expect(allyWhy(POL, FRA, (id) => s.get(id))).not.toBe('');
  });

  it('in words', () => {
    expect(standingText({ kind: 'truce', days: 12, bond: true })).toBe('Truce (12 days)');
    expect(standingText({ kind: 'truce', days: 1, bond: true })).toBe('Truce (1 day)');
    expect(standingText({ kind: 'allied', days: 0, bond: true })).toBe('Allied');
    expect(standingText({ kind: 'neutral', days: 0, bond: false })).toBe('Neutral');
  });
});
