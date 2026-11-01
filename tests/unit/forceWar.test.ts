import { describe, expect, it } from 'vitest';
import { Refusal } from '../../src/shared/commands';
import { Bond, EventKind } from '../../src/shared/events';
import { TICKER_KINDS } from '../../src/shared/history';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { declareWar, forceWar, makePeace, whyNotWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { historyText } from '../../src/ui/historyText';
import { historyRows } from '../../src/worker/historyRows';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// PLAN 7.175a (ADR-780, the user's decision): the player's and God's war breaks the truce, alliance
// or puppet bond in its way instead of being refused; a war refused for anything else is refused as
// before, nothing broken. The 1938 world as it starts has each bond: Germany and Italy allied, the
// United Kingdom and France allied, French West and Equatorial Africa France's puppets.

const [ENG, FRA, AOF, AEF, GER, ITA, POL] = ['ENG', 'FRA', 'AOF', 'AEF', 'GER', 'ITA', 'POL'].map(nationId) as [number, number, number, number, number, number, number];
const world = (): World => new Sim({ scenario: '1938', seed: 5, assets: assets1938(SIZE_1938.w) }).world;

/** The events of `kind` emitted so far, as [a, b, x, y]. */
const emitted = (w: World, kind: number): number[][] => {
  const out: number[][] = [];
  const e = w.out.events;
  for (let i = 0; i + 6 <= e.length; i += 6) if (e[i + 1] === kind) out.push([e[i + 2]!, e[i + 3]!, e[i + 4]!, e[i + 5]!]);
  return out;
};
const atWar = (w: World, a: number, b: number): boolean => w.wars.atWar(a, b);

describe('forceWar: the bond in the way is broken (PLAN 7.175a)', () => {
  it('a truce ends', () => {
    const w = world();
    makePeace(w, declareWar(w, GER, POL)!);
    expect(whyNotWar(w, GER, POL)).toBe(Refusal.Truce);
    w.out.events.length = 0;
    expect(forceWar(w, GER, POL)).toBe(Refusal.None);
    expect(atWar(w, GER, POL)).toBe(true);
    expect(w.wars.inTruce(GER, POL, w.tick)).toBe(false);
    expect(emitted(w, EventKind.BondsBroken)).toEqual([[GER, POL, NaN, Bond.truce]]);
  });

  it('allies: the attacker leaves its alliance, which goes on without it', () => {
    const w = world();
    const pact = w.alliances.allianceOf(ENG)!;
    const others = pact.members.filter((m) => m !== ENG);
    expect(others).toContain(FRA);
    expect(whyNotWar(w, ENG, FRA)).toBe(Refusal.Allied);
    expect(forceWar(w, ENG, FRA)).toBe(Refusal.None);
    expect(atWar(w, ENG, FRA)).toBe(true);
    expect(w.alliances.allianceOf(ENG)).toBeUndefined();
    if (others.length >= 2) expect(w.alliances.allianceOf(FRA)?.members.sort()).toEqual(others.sort());
    expect(emitted(w, EventKind.BondsBroken)).toEqual([[ENG, FRA, NaN, Bond.alliance]]);
    expect(emitted(w, EventKind.AllianceLeft).map(([a]) => a)).toEqual([ENG]);
  });

  it("an ally's realm: the attacker leaves its alliance", () => {
    const w = world();
    expect(whyNotWar(w, ENG, AOF)).toBe(Refusal.AlliedRealm);
    expect(forceWar(w, ENG, AOF)).toBe(Refusal.None);
    expect(atWar(w, ENG, AOF)).toBe(true);
    expect(w.alliances.allianceOf(ENG)).toBeUndefined();
  });

  it("the attacker the defender's puppet, or the defender the attacker's: the puppet goes free", () => {
    for (const [a, d, freed] of [
      [AOF, FRA, AOF],
      [FRA, AOF, AOF],
    ] as const) {
      const w = world();
      expect(whyNotWar(w, a, d)).toBe(Refusal.Subject);
      expect(forceWar(w, a, d)).toBe(Refusal.None);
      expect(w.nations.cols.overlord[freed]).toBe(0);
      expect(atWar(w, a, d)).toBe(true);
      expect(emitted(w, EventKind.BondsBroken)).toEqual([[a, d, NaN, Bond.puppet]]);
      expect(emitted(w, EventKind.PuppetReleased).map(([s]) => s)).toEqual([freed]);
    }
  });

  it("one overlord's two puppets: the attacker goes free", () => {
    const w = world();
    expect(whyNotWar(w, AEF, AOF)).toBe(Refusal.SameOverlord);
    expect(forceWar(w, AEF, AOF)).toBe(Refusal.None);
    expect(w.nations.cols.overlord[AEF]).toBe(0);
    expect(w.nations.cols.overlord[AOF]).toBe(FRA);
    expect(atWar(w, AEF, AOF)).toBe(true);
  });

  it('a war refused for another reason: refused as before, nothing broken', () => {
    const w = world();
    // Already at war.
    declareWar(w, GER, POL);
    w.out.events.length = 0;
    expect(forceWar(w, GER, POL)).toBe(Refusal.AtWar);
    // The same nation, and none.
    expect(forceWar(w, GER, GER)).toBe(Refusal.SameNation);
    expect(forceWar(w, GER, 9999)).toBe(Refusal.NoNation);
    // Overrun: Italy's land all under German control; Germany, its ally, is refused and stays allied.
    const { owner } = w.cells;
    for (let c = 0; c < owner.length; c++) if (owner[c] === ITA) w.setController(c, POL);
    expect(forceWar(w, GER, ITA)).toBe(Refusal.Overrun);
    expect(w.alliances.allied(GER, ITA)).toBe(true);
    expect(atWar(w, GER, ITA)).toBe(false);
    expect(emitted(w, EventKind.BondsBroken)).toEqual([]);
    expect(emitted(w, EventKind.WarRejected).length).toBeGreaterThan(0);
  });

  it('the bonds broken are a history and ticker row: "the United Kingdom broke its alliance with France"', () => {
    const w = world();
    forceWar(w, ENG, FRA);
    const rows = historyRows(w, (n) => (n === ENG ? '=the United Kingdom' : n === FRA ? '=France' : `=n${n}`), () => '');
    const broke = rows.filter((r) => r.kind === EventKind.BondsBroken);
    expect(broke.map(historyText)).toEqual(['The United Kingdom broke its alliance with France']);
    expect(TICKER_KINDS.has(EventKind.BondsBroken)).toBe(true);
    expect(historyText({ ...broke[0]!, bonds: Bond.alliance | Bond.truce })).toBe('The United Kingdom broke its alliance and truce with France');
  });
});
