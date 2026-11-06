import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { NATIONS_1938, SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { eliminateNation } from '../../src/sim/systems/capitals';
import { annexNation, FREE_ABOVE, INTEGRATION_RATE, makePuppet, LOSING_PENALTY, LOYALTY_BASE, LOYALTY_PER_AUTONOMY, loyaltyTarget, puppetSystem, puppetTier, SIZE_PENALTY, TRIBUTE } from '../../src/sim/systems/puppets';
import { declareWar } from '../../src/sim/systems/war';
import { blocOf } from '../../src/sim/systems/supply';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { eventKinds as kinds, nationId, runEvents as run } from '../helpers/sim1938';

// PLAN 1.18: puppets with autonomy; create / release / integrate / revolt. AT: a test per
// transition.

const W = SIZE_1938.w;
const [GER, ITA, ALB, AUT, HUN] = ['GER', 'ITA', 'ALB', 'AUT', 'HUN'].map(nationId) as [number, number, number, number, number];
/** Ticks from tick 0 to 00:00 on day 1 of month m+1 (1938 is not a leap year). */
const MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const toMonth = (m: number): number => 24 * MONTHS.slice(0, m).reduce((a, b) => a + b, 0) + 1;


describe('puppets (PLAN 1.18)', () => {
  it('the 1938 puppets start with their autonomy; tiers follow autonomy', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const nc = s.world.nations.cols;
    expect(nc.overlord[ALB]).toBe(ITA);
    expect(nc.autonomy[ALB]).toBe(NATIONS_1938.find((n) => n.tag === 'ALB')!.overlord!.autonomy);
    expect([puppetTier(10), puppetTier(50), puppetTier(80)]).toEqual(['satellite', 'puppet', 'vassal']);
  });

  it('create: God Mode makes a puppet that pays tribute each month', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const nc = s.world.nations.cols;
    s.command({ kind: 'createPuppet', overlord: GER, subject: AUT, autonomy: 40 });
    const ev = run(s, 1); // tick 0 = 1 January: the monthly assessment runs after the command
    expect(kinds(ev, EventKind.PuppetCreated)).toEqual([[AUT, GER]]);
    expect(nc.overlord[AUT]).toBe(GER);
    // Tribute on 1 February: compare against a twin without the puppet.
    const twin = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    run(twin, 1);
    const [gA, gT] = [nc.gold[AUT]!, twin.world.nations.cols.gold[AUT]!];
    expect(gA).toBeLessThan(gT); // already paid on 1 January
    const income = nc.income[AUT]!;
    const before = nc.gold[GER]! - twin.world.nations.cols.gold[GER]!;
    expect(before).toBeCloseTo(TRIBUTE * (1 - 40 / 100) * income, 6);
  });

  it('release: freeing a puppet is immediate and free', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const twin = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) }); // ALB stays a puppet
    s.command({ kind: 'releasePuppet', subject: ALB });
    const ev = run(s, 1);
    run(twin, 1);
    expect(kinds(ev, EventKind.PuppetReleased)).toEqual([[ALB, ITA]]);
    expect(s.world.nations.cols.overlord[ALB]).toBe(0);
    // No fee; and the 1 January tribute the twin paid stays home.
    const autonomy0 = NATIONS_1938.find((n) => n.tag === 'ALB')!.overlord!.autonomy; // before the month's drift
    const tribute = TRIBUTE * (1 - autonomy0 / 100) * twin.world.nations.cols.income[ALB]!;
    expect(s.world.nations.cols.gold[ALB]! - twin.world.nations.cols.gold[ALB]!).toBeCloseTo(tribute, 6);
  });

  it('leaves freely above autonomy 90', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    s.command({ kind: 'setAutonomy', subject: ALB, value: FREE_ABOVE + 1 });
    const ev = run(s, 1);
    expect(kinds(ev, EventKind.PuppetReleased)).toContainEqual([ALB, ITA]);
    expect(s.world.nations.cols.overlord[ALB]).toBe(0);
  });

  it('integrate: a low-autonomy satellite is absorbed with its land and army', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    s.world.settings.aiEnabled = false; // isolate the mechanism from the AI (PLAN 1.24–1.26)
    const w = s.world;
    s.command({ kind: 'createPuppet', overlord: GER, subject: HUN, autonomy: 0 });
    const hunCells = w.cells.owner.reduce((n, o) => n + (o === HUN ? 1 : 0), 0);
    const gerCells = w.cells.owner.reduce((n, o) => n + (o === GER ? 1 : 0), 0);
    const hunDivs = w.formations.ids().filter((id) => w.formations.cols.nation[id] === HUN).length;
    expect(hunDivs).toBeGreaterThan(0);
    // 100 / (INTEGRATION_RATE × ~1) months at autonomy ≈ 0 (it drifts up 0.25 a month).
    const months = Math.ceil(100 / (INTEGRATION_RATE * 0.9));
    let ev: number[][] = [];
    for (let m = 0; m < months + 2 && w.nations.cols.living[HUN] === 1; m++) ev = ev.concat(run(s, 24 * 31));
    expect(kinds(ev, EventKind.PuppetIntegrated)).toEqual([[HUN, GER]]);
    expect(w.nations.cols.living[HUN]).toBe(0);
    expect(w.cells.owner.reduce((n, o) => n + (o === GER ? 1 : 0), 0)).toBe(gerCells + hunCells);
    expect(w.cells.controller.some((c) => c === HUN)).toBe(false);
    // Its divisions now serve the overlord (none destroyed by the integration itself).
    expect(w.formations.ids().filter((id) => w.formations.cols.nation[id] === HUN)).toEqual([]);
  }, 90_000); // ~25 simulated months (~18k ticks): close to the default 30 s under parallel load

  it('revolt: a disloyal puppet with a voice declares a war of independence', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    s.command({ kind: 'setPuppetLoyalty', subject: ALB, value: 5 });
    const ev = run(s, 1);
    expect(kinds(ev, EventKind.PuppetRevolt)).toEqual([[ALB, ITA]]);
    expect(kinds(ev, EventKind.WarDeclared)).toContainEqual([ALB, ITA]);
    expect(s.world.nations.cols.overlord[ALB]).toBe(0);
    expect(s.world.wars.atWar(ALB, ITA)).toBe(true);
  });

  // ROADMAP R40a (critic run 48, R48-B1): a rising on an overlord overrun was refused as a war (`Overrun`; an overrun
  // holder declares no war on its rebels) and the subject went free under "rose against", with no war. It is told
  // as what it is: it broke free (`PuppetReleased`), no `PuppetRevolt`.
  it('revolt on an overrun overlord: told as broken free, not a rising with no war', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    s.command({ kind: 'setPuppetLoyalty', subject: ALB, value: 5 });
    // Four in five of Italy's land held by France.
    const FRA = nationId('FRA');
    let k = 0;
    for (let c = 0; c < w.cells.owner.length; c++) if (w.cells.owner[c] === ITA && k++ % 5 !== 0) w.cells.controller[c] = FRA;
    w.dropLandCounts();
    const ev = run(s, 1);
    expect(kinds(ev, EventKind.PuppetRevolt), 'no rising told').toEqual([]);
    expect(kinds(ev, EventKind.PuppetReleased), 'broke free').toEqual([[ALB, ITA]]);
    expect(w.nations.cols.overlord[ALB]).toBe(0);
    expect(w.wars.atWar(ALB, ITA)).toBe(false);
  });

  it('a voiceless satellite (autonomy < 10) cannot revolt however disloyal', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    s.command({ kind: 'setAutonomy', subject: ALB, value: 5 });
    s.command({ kind: 'setPuppetLoyalty', subject: ALB, value: 0 });
    const ev = run(s, toMonth(1));
    expect(kinds(ev, EventKind.PuppetRevolt)).toEqual([]);
    expect(s.world.nations.cols.overlord[ALB]).toBe(ITA);
  });

  it('a crushing peace makes the loser a puppet', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    for (const n of [GER, AUT]) {
      w.alliances.leave(n);
      w.alliances.guarantees = w.alliances.guarantees.filter((g) => g.guarantor !== n && g.target !== n);
    }
    s.command({ kind: 'declareWar', attacker: GER, defender: AUT });
    run(s, 24); // occupy right before the 00:00 assessment at tick 24
    // Half of Austria (score 100), Vienna held, so Austria survives to sign.
    let vienna = -1;
    w.cities.forEach((id) => {
      if (w.cities.cols.capitalOf[id] === AUT) vienna = w.cities.cols.cell[id]!;
    });
    const aut: number[] = [];
    w.cells.owner.forEach((o, c) => o === AUT && c !== vienna && aut.push(c));
    for (const c of aut.slice(0, Math.ceil(aut.length / 2))) w.setController(c, GER);
    const ev = run(s, 1);
    expect(kinds(ev, EventKind.PuppetCreated)).toEqual([[AUT, GER]]);
    expect(w.nations.cols.overlord[AUT]).toBe(GER);
  });

  it('no revolt or release in the first months of 1938 except autonomy > 90 leavers', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const ev = run(s, toMonth(3));
    expect(kinds(ev, EventKind.PuppetRevolt)).toEqual([]);
    for (const [p] of kinds(ev, EventKind.PuppetReleased)) expect(NATIONS_1938[p! - 1]!.overlord!.autonomy).toBeGreaterThanOrEqual(FREE_ABOVE);
  });
});

// ROADMAP R2, ADR-807: a beaten overlord's great subjects turn on it. While the overlord is losing a
// war, the loyalty a puppet relaxes toward falls by LOSING_PENALTY and SIZE_PENALTY × min(1, the
// puppet's income ÷ its overlord's); at peace it is ADR-31's alone. The Dutch East Indies under
// the Netherlands, Germany at war with the Netherlands, its score set (`loyaltyTarget` reads it).
describe('a beaten overlord and a great subject (ROADMAP R2, ADR-807)', () => {
  const [NED, DEI] = ['NED', 'DEI'].map(nationId) as [number, number];
  /** The 1938 world at tick 0 (a month's start), Germany at war with the Netherlands alone. */
  function beaten(): { s: Sim; war: NonNullable<ReturnType<typeof declareWar>> } {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const war = declareWar(s.world, GER, NED, true)!;
    expect(war).not.toBeNull();
    expect(war.sides[1]).toContain(NED);
    return { s, war };
  }
  const base = (w: World, p: number): number => LOYALTY_BASE + LOYALTY_PER_AUTONOMY * w.nations.cols.autonomy[p]!;

  it('the target: ADR-31 at peace whatever the incomes; losing, 25 and 35 × the income share (at most 1) lower', () => {
    const { s, war } = beaten();
    const w = s.world;
    const nc = w.nations.cols;
    expect(nc.overlord[DEI]).toBe(NED);
    nc.income[NED] = 100;
    for (const [score, mine, want] of [
      [0, 100, base(w, DEI)], // at war, not losing
      [29, 100, base(w, DEI)], // the defenders' score −29: not yet losing
      [30, 0, base(w, DEI) - LOSING_PENALTY], // losing, a poor subject: ADR-31's push alone
      [30, 50, base(w, DEI) - LOSING_PENALTY - SIZE_PENALTY * 0.5],
      [60, 100, base(w, DEI) - LOSING_PENALTY - SIZE_PENALTY],
      [60, 400, base(w, DEI) - LOSING_PENALTY - SIZE_PENALTY], // richer than its master: as much as an equal
    ] as const) {
      war.score = score;
      nc.income[DEI] = mine;
      expect(loyaltyTarget(w, DEI), `score ${score}, income ${mine}`).toBeCloseTo(want, 9);
    }
    // The war over: ADR-31's target, rich or not.
    w.wars.end(war);
    nc.income[DEI] = 400;
    expect(loyaltyTarget(w, DEI)).toBeCloseTo(base(w, DEI), 9);
  });

  it('month by month: a subject as rich as its losing master rises within a year; a poor one, or one of a master at peace, never', () => {
    // The monthly pass run at tick 0 (a month's start) again and again, the war's score and the incomes held.
    const months = (rich: boolean, losing: boolean, n: number): { rose: number; at: number } => {
      const { s, war } = beaten();
      const w = s.world;
      const nc = w.nations.cols;
      for (let m = 1; m <= n; m++) {
        war.score = losing ? 60 : 0;
        nc.income[NED] = 100;
        nc.income[DEI] = rich ? 100 : 5;
        nc.integration[DEI] = 0; // held: at autonomy 27 its master would absorb it in some years
        w.out.events.length = 0;
        puppetSystem(w);
        const ev = kinds(runEventsOf(w), EventKind.PuppetRevolt);
        if (ev.length > 0) {
          expect(ev).toEqual([[DEI, NED]]);
          expect(nc.overlord[DEI]).toBe(0);
          expect(w.wars.atWar(DEI, NED)).toBe(true);
          return { rose: 1, at: m };
        }
        expect(nc.overlord[DEI]).toBe(NED);
      }
      return { rose: 0, at: 0 };
    };
    const rich = months(true, true, 12);
    expect(rich.rose).toBe(1);
    expect(rich.at).toBeGreaterThan(3); // not at once: loyalty falls a fifth of the way a month
    expect(months(false, true, 120).rose).toBe(0);
    expect(months(true, false, 120).rose).toBe(0);
  });

  it('a puppet in its overlord’s alliance leaves it to rise, and is at war with it (Tannu Tuva, the Soviet Union)', () => {
    // Before, the war was refused as between allies (`WarRejected`, `Allied`): the rising only freed it.
    const [SOV, TAN] = ['SOV', 'TAN'].map(nationId) as [number, number];
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const w = s.world;
    expect(w.nations.cols.overlord[TAN]).toBe(SOV);
    expect(w.alliances.allied(TAN, SOV)).toBe(true);
    s.command({ kind: 'setPuppetLoyalty', subject: TAN, value: 5 });
    const ev = run(s, 1);
    expect(kinds(ev, EventKind.PuppetRevolt)).toEqual([[TAN, SOV]]);
    expect(kinds(ev, EventKind.WarRejected)).toEqual([]);
    expect(kinds(ev, EventKind.WarDeclared)).toContainEqual([TAN, SOV]);
    expect(w.alliances.allied(TAN, SOV)).toBe(false);
    expect(w.wars.atWar(TAN, SOV)).toBe(true);
  });
});

// ADR-810: a realm has one head (the scenario refuses a puppet of a puppet, ADR-148). Seed 1009,
// day 235: Turkey, Bulgaria's overlord, made a Soviet puppet, kept Bulgaria under it.
describe('a realm has one head (ADR-810)', () => {
  const [JAP, MAN, SOV] = ['JAP', 'MAN', 'SOV'].map(nationId) as [number, number, number];
  it('an overlord made a puppet hands its puppets to its new overlord', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const nc = s.world.nations.cols;
    expect(nc.overlord[ALB]).toBe(ITA);
    expect(makePuppet(s.world, GER, ITA, 40)).toBe(true);
    expect([nc.overlord[ITA], nc.overlord[ALB]]).toEqual([GER, GER]);
  });
  it('a puppet’s puppet is its overlord’s', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const nc = s.world.nations.cols;
    expect(nc.overlord[MAN]).toBe(JAP);
    expect(makePuppet(s.world, MAN, SOV, 40)).toBe(true);
    expect([nc.overlord[SOV], nc.overlord[MAN]]).toEqual([JAP, JAP]);
  });
  it('a puppet that annexes hands the annexed nation’s puppets to its overlord', () => {
    const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
    const nc = s.world.nations.cols;
    expect(annexNation(s.world, MAN, ITA)).toBe(true);
    expect(nc.overlord[ALB]).toBe(JAP);
  });
});

/** The rows on the world's event list, as `runEvents` gives them. */
function runEventsOf(w: World): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < w.out.events.length; i += 6) out.push(w.out.events.slice(i, i + 6));
  return out;
}

// PLAN 3.4Rk (the seventh read, finding 5): `eliminateNation` left `overlord`, so a puppet that
// died was its overlord's again when it returned, and the war of independence of a revival on
// the overlord's land was refused (`Refusal.Subject`). The tie ends with the nation (ADR-148).
describe('a puppet that dies (PLAN 3.4Rk)', () => {
  /** Every dead nation that has an overlord. */
  const boundDead = (w: World): number[] => w.nations.ids().filter((n) => w.nations.cols.living[n] !== 1 && w.nations.cols.overlord[n] !== 0);

  it('by a Kill: it has no overlord from its death on, and returns free, in a supply bloc of its own', () => {
    const s = new Sim({ scenario: '1938', seed: 99, assets: assets1938(W) });
    const w = s.world;
    const nc = (): World['nations']['cols'] => w.nations.cols;
    expect(nc().overlord[ALB]).toBe(ITA);
    s.command({ kind: 'collapseNation', nation: ALB });
    const ev = run(s, 1);
    expect(nc().living[ALB]).toBe(0);
    expect(nc().overlord[ALB], 'the overlord of dead Albania').toBe(0);
    expect(kinds(ev, EventKind.PuppetReleased), 'a death is not a release').toEqual([]);
    // The overlord dies too: the returning nation is in no dead nation's bloc.
    s.command({ kind: 'collapseNation', nation: ITA });
    run(s, 1);
    expect(nc().living[ITA]).toBe(0);
    w.tick = nc().revivalAt[ALB]! + 24 * 3; // in mid-month: the monthly pass has not seen it
    s.command({ kind: 'reviveNation', nation: ALB });
    expect(kinds(run(s, 1), EventKind.NationRevived).map(([n]) => n)).toEqual([ALB]);
    expect([nc().living[ALB], nc().overlord[ALB], blocOf(w, ALB)]).toEqual([1, 0, ALB]);
    expect(boundDead(w)).toEqual([]);
  });

  it('by a revolt’s revival on its old overlord’s land: it returns free and at war with it', () => {
    const s = new Sim({ scenario: '1938', seed: 99, assets: assets1938(W) });
    const w = s.world;
    const nc = (): World['nations']['cols'] => w.nations.cols;
    const centre = navOf(w).graph.centre;
    const home = w.provinces.provincesOf(ALB).filter((p) => w.cells.owner[centre[p] ?? -1] === ALB);
    expect(home.length).toBeGreaterThan(0);
    // Dies with Italy holding its land (a lost war, shortened as in `revival.test.ts`).
    w.cells.owner.forEach((o, c) => {
      if (o !== ALB) return;
      w.setOwner(c, ITA);
      w.setController(c, ITA);
    });
    eliminateNation(w, ALB);
    expect(nc().overlord[ALB], 'the overlord of dead Albania').toBe(0);
    w.tick = nc().revivalAt[ALB]! + 24 * 3;
    s.command({ kind: 'spawnRevolt', province: home[0]! });
    const ev = run(s, 1);
    expect(kinds(ev, EventKind.NationRevived).map(([n]) => n)).toEqual([ALB]);
    expect(kinds(ev, EventKind.WarRejected), 'the war of independence, refused').toEqual([]);
    expect([nc().living[ALB], nc().overlord[ALB], blocOf(w, ALB)]).toEqual([1, 0, ALB]);
    expect(w.wars.atWar(ITA, ALB), 'at war with the nation it rose against').toBe(true);
  });

  it('no dead nation has an overlord after a Kill of every puppet of 1938', () => {
    const s = new Sim({ scenario: '1938', seed: 99, assets: assets1938(W) });
    const w = s.world;
    const puppets = w.nations.ids().filter((n) => w.nations.cols.living[n] === 1 && w.nations.cols.overlord[n] !== 0);
    expect(puppets.length).toBeGreaterThan(20);
    for (const n of puppets) s.command({ kind: 'collapseNation', nation: n });
    run(s, 1);
    expect(puppets.filter((n) => w.nations.cols.living[n] === 1), 'puppets that lived through their Kill').toEqual([]);
    expect(boundDead(w)).toEqual([]);
  });
});
