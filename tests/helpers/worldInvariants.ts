import { isMonthStart } from '../../src/shared/calendar';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { DESERTION } from '../../src/sim/systems/economy';
import { elementIndex } from '../../src/sim/systems/elements';
import { TRIBUTE } from '../../src/sim/systems/puppets';
import { COLLAPSE_MONTHS } from '../../src/sim/systems/revival';
import type { World } from '../../src/sim/world';
import { Breaks } from './diploInvariants';
import { assets1938 } from './earth';

// ROADMAP R4 (ADR-804): the rules of the systems other than war and peace, checked together on
// every hour of a run, as `diploInvariants.ts` checks war and peace (ADR-803). One rule set a
// system:
//   economy  gold rises only at a month's start (the accounts, tribute), in the hour a nation is
//            founded or returns, or in the hour it collapses or defaults after COLLAPSE_MONTHS
//            bankrupt months (its debts void, PLAN 1.24); at a month's start by no more than the month's gross income and
//            the tribute its puppets owe; a nation bankrupt after a month's start has each of its
//            formations on land cut by the desertion share of its units (R4a).

export type RuleSet = 'economy';
export const RULE_SETS: readonly RuleSet[] = ['economy'];

export interface WorldCase {
  seed: number;
  /** The 1938 world (the default) or the random world of `nations` nations (ADR-108). */
  world?: '1938' | 'random';
  nations?: number;
  diplomacy?: 'scenario' | 'random';
  heroes?: boolean;
  days: number;
  rules?: readonly RuleSet[];
  /**
   * These nations (1938 tags) start in debt, as God's treasury would set it, so that the bankrupt
   * months are checked: a debt just past the line (Poland, 800), as a deep one has the AI disband
   * the whole army in the first hour.
   */
  bankrupt?: readonly (readonly [string, number])[];
}

/** A unit of slack for sums of gold and of units: rounding, never a month's income. */
const EPS = 1e-6;

/** What an hour starts from: the treasuries, and at a month's start the bonds and the formations on land. */
interface Before {
  living: number[];
  gold: number[];
  month: null | {
    overlord: number[];
    autonomy: number[];
    bankrupt: number[];
    /** Bankrupt months in a row (the collapse system's count). */
    broke: number[];
    /**
     * Each formation on land: its nation, its elements' units, and their units less the damage
     * they carry (desertion takes DESERTION of an element's units from the second, exactly: a
     * part of a unit is carried as damage, so the units themselves can lag).
     */
    land: Map<number, { nation: number; units: number; whole: number }>;
  };
}

/** The units of a formation's elements, and those units less the damage they carry. */
function unitsOf(w: World, els: number[] | undefined): { units: number; whole: number } {
  const ec = w.elements.cols;
  let units = 0;
  let whole = 0;
  for (const e of els ?? []) {
    units += ec.strength[e]!;
    whole += ec.strength[e]! - ec.wound[e]!;
  }
  return { units, whole };
}

function before(w: World): Before {
  const nc = w.nations.cols;
  const b: Before = { living: Array.from(nc.living), gold: Array.from(nc.gold), month: null };
  if (isMonthStart(w.startDay, w.tick)) {
    const land = new Map<number, { nation: number; units: number; whole: number }>();
    const fc = w.formations.cols;
    const idx = elementIndex(w);
    w.formations.forEach((id) => {
      if (!w.offLand(id)) land.set(id, { nation: fc.nation[id]!, ...unitsOf(w, idx.get(id)) });
    });
    b.month = { overlord: Array.from(nc.overlord), autonomy: Array.from(nc.autonomy), bankrupt: Array.from(nc.bankrupt), broke: Array.from(nc.brokeMonths), land };
  }
  return b;
}

/** The lines of `economy` the hour from `b` broke (the tick has moved on). */
function economyBreaks(w: World, b: Before, events: number[], tag: (n: number) => string): string[] {
  const out: string[] = [];
  const nc = w.nations.cols;
  const month = b.month;
  // A collapse voids the nation's debts (PLAN 1.24): its gold may rise to 0 in that hour.
  const collapsed = new Set<number>();
  for (let i = 0; i < events.length; i += 6) if (events[i + 1] === EventKind.NationCollapsed) collapsed.add(events[i + 2]!);
  for (let n = 1; n < b.gold.length; n++) {
    if (b.living[n] !== 1 || nc.living[n] !== 1) continue; // founded, returned or dead in the hour
    if (collapsed.has(n)) continue;
    // So does a default after COLLAPSE_MONTHS bankrupt months, with nothing to fragment and no row.
    if (month && month.bankrupt[n] === 1 && month.broke[n]! + 1 >= COLLAPSE_MONTHS && nc.gold[n]! === 0) continue;
    const rise = nc.gold[n]! - b.gold[n]!;
    if (rise <= EPS * Math.max(1, Math.abs(b.gold[n]!))) continue;
    if (!month) {
      out.push(`economy: ${tag(n)}'s gold rose ${rise.toFixed(2)} outside a month's start`);
      continue;
    }
    let owed = Math.max(0, nc.income[n]!);
    for (let p = 1; p < month.overlord.length; p++) if (month.overlord[p] === n) owed += TRIBUTE * (1 - month.autonomy[p]! / 100) * Math.max(0, nc.income[p]!);
    if (rise > owed + EPS * Math.max(1, owed)) out.push(`economy: ${tag(n)}'s gold rose ${rise.toFixed(2)} at a month's start, more than its income and tribute (${owed.toFixed(2)})`);
  }
  if (month) {
    const fc = w.formations.cols;
    const idx = elementIndex(w);
    for (const [id, was] of month.land) {
      if (was.units === 0 || nc.bankrupt[was.nation] !== 1 || !w.formations.has(id) || fc.nation[id] !== was.nation || w.offLand(id)) continue;
      const now = unitsOf(w, idx.get(id)).whole;
      const most = was.whole - DESERTION * was.units;
      if (now > most + EPS * was.units) out.push(`economy: ${tag(was.nation)} bankrupt and its formation ${id} kept ${now.toFixed(2)} of ${was.whole.toFixed(2)} units, more than ${most.toFixed(2)}`);
    }
  }
  return out;
}

/** The broken lines of one run of `c.days` days, each rule set's checked every hour. */
export function worldBreaks(c: WorldCase): string[] {
  const breaks = new Breaks();
  const scenario = c.world ?? '1938';
  const tag = scenario === '1938' ? (n: number): string => TAGS_1938[n - 1] ?? `#${n}` : (n: number): string => `#${n}`;
  const label = `${c.seed} ${scenario === '1938' ? '' : `random world ${c.nations ?? 60}, `}${c.diplomacy ?? 'scenario'}${c.heroes ? ', heroes' : ''}`;
  const rules = new Set(c.rules ?? RULE_SETS);
  const s = new Sim({
    scenario,
    seed: c.seed,
    assets: assets1938(SIZE_1938.w),
    options: { ...(c.diplomacy ? { diplomacy: c.diplomacy } : {}), ...(scenario === 'random' ? { nations: c.nations ?? 60 } : {}), ...(c.heroes ? { heroes: 'on' as const } : {}) },
  });
  for (const [t, gold] of c.bankrupt ?? []) {
    const n = TAGS_1938.indexOf(t) + 1;
    if (n > 0) s.world.nations.cols.gold[n] = gold;
  }
  let b = before(s.world);
  s.step(24 * c.days, (w) => {
    const where = `${label} day ${Math.floor((w.tick - 1) / 24)}`;
    if (rules.has('economy')) breaks.add(where, economyBreaks(w, b, w.out.events, tag));
    w.out.events.length = 0;
    w.out.fires.length = 0;
    b = before(w);
  });
  return breaks.lines;
}
