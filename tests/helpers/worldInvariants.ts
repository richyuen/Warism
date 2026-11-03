import { heroBasin, returnPlace } from '../../src/sim/systems/heroes';
import { isMonthStart } from '../../src/shared/calendar';
import { EventKind } from '../../src/shared/events';
import { isLand } from '../../src/shared/terrain';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { basePlace, inSeaBattle, kmFromBase, ofSide, wingRange } from '../../src/sim/systems/air';
import { DESERTION } from '../../src/sim/systems/economy';
import { largestYield, MISSILE_KM, nukesAllowed, WARHEAD_MAX } from '../../src/sim/systems/nuclear';
import { seaKm } from '../../src/sim/systems/navalCombat';
import { knowsTechs, techMask } from '../../src/sim/tech';
import { isDayStart } from '../../src/shared/calendar';
import type { NukeLaunch } from '../../src/sim/world';
import { elementIndex } from '../../src/sim/systems/elements';
import { TRIBUTE } from '../../src/sim/systems/puppets';
import { COLLAPSE_MONTHS } from '../../src/sim/systems/revival';
import { Domain, type World } from '../../src/sim/world';
import { Breaks } from './diploInvariants';
import { assets1938 } from './earth';

// ROADMAP R4 (ADR-804): the rules of the systems other than war and peace, checked together on
// every hour of a run, as `diploInvariants.ts` checks war and peace (ADR-803). One rule set a
// system:
//   economy  gold rises only at a month's start (the accounts, tribute), in the hour a nation is
//            founded or returns, or in the hour it collapses or defaults after COLLAPSE_MONTHS
//            bankrupt months (its debts void, PLAN 1.24); at a month's start by no more than the month's gross income and
//            the tribute its puppets owe; a nation bankrupt after a month's start has each of its
//            formations on land cut by the desertion share of its units (R4a);
//   navy     a fleet not under way stands on water (a passage's hours are drawn over land); a land
//            formation aboard (`World.embarked`) rides a fleet of its own nation that is there, and
//            stands where it stands, or, its transports sunk (`fleet` −1), is lost with them by the
//            next hour; no fleet is a dead nation's (R4b);
//   air      every wing has a base: an airbase its side holds (one taken is left by the next hour),
//            or a fleet of its nation's (one sunk, base 0, is lost with it by the next hour); a wing
//            not ferrying stands at its base (a carrier's, at its fleet as the air system left it: a
//            fleet in a sea battle this hour or the last moves after it); a sortie flies to a place within the wing's range of
//            where it took off, and an airbase's wing's mission is within its range (a carrier's
//            waits while its fleet is out of range) (R4c);
//   nukes    a launch needs nukes allowed, a warhead the hour before and a means: a strategic bomber
//            of its nation's at its airbase with the target in range, or missiles known and the
//            target within MISSILE_KM of where it rose; its yield at most what the nation builds;
//            each launch that ends has its burst or its interception, and no burst or interception
//            comes without one; a stockpile grows only by one built at the day's pass (what was paid
//            toward it starts anew), holds WARHEAD_MAX at most,
//            and is no dead nation's after the day's pass (R4d);
//   bonds    an overlord is a living nation other than its puppet and no puppet itself; a dead
//            nation has none; a puppet and its overlord are never at war; autonomy, loyalty and
//            integration within 0..100; an alliance has two living members or more, a leader among
//            them, unity within 0..100, a loyalty per member; a nation in one alliance at most; a
//            guarantee binds two living nations, not at war with each other (R4e).

export type RuleSet = 'economy' | 'navy' | 'air' | 'nukes' | 'bonds' | 'heroes';
export const RULE_SETS: readonly RuleSet[] = ['economy', 'navy', 'air', 'nukes', 'bonds', 'heroes'];

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
  /** What a player or God does, at the start of a day (commands queue for the next hour): checked as the AI's acts are. */
  acts?: readonly { day: number; act: (s: Sim) => void }[];
}

/** A unit of slack for sums of gold and of units: rounding, never a month's income. */
const EPS = 1e-6;

/** What an hour starts from: the treasuries, and at a month's start the bonds and the formations on land. */
interface Before {
  living: number[];
  gold: number[];
  /** The warheads each nation held, what it had paid toward the next, and the launches in flight, by id. */
  stock: Map<number, number>;
  paid: Map<number, number>;
  launches: Map<number, NukeLaunch>;
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
  const b: Before = {
    living: Array.from(nc.living),
    gold: Array.from(nc.gold),
    stock: new Map([...w.warheads].map(([n, h]) => [n, h.stock])),
    paid: new Map([...w.warheads].map(([n, h]) => [n, h.paid])),
    launches: new Map(w.nukeLaunches.map((l) => [l.id, { ...l }])),
    month: null,
  };
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

/**
 * The lines of `navy` the world breaks now (the hour's systems have run). `sunk`: the formations
 * aboard transports sunk an hour before; it is refilled with this hour's.
 */
function navyBreaks(w: World, sunk: Set<number>, tag: (n: number) => string): string[] {
  const out: string[] = [];
  const fc = w.formations.cols;
  const nc = w.nations.cols;
  const { w: W, h: H, terrain } = w.cells;
  w.formations.forEach((id) => {
    if (!w.isFleet(id)) return;
    const n = fc.nation[id]!;
    if (!w.nations.has(n) || nc.living[n] !== 1) out.push(`navy: fleet ${id} of ${tag(n)}, a dead nation`);
    const x = Math.floor(fc.x[id]!);
    const y = Math.floor(fc.y[id]!);
    const cell = Math.min(H - 1, Math.max(0, y)) * W + ((x % W) + W) % W;
    if (fc.moving[id] !== 1 && isLand(terrain[cell]!)) out.push(`navy: fleet ${id} of ${tag(n)} stands on land at (${x}, ${y}), not under way`);
  });
  const was = new Set(sunk);
  sunk.clear();
  for (const [id, e] of w.embarked) {
    const n = fc.nation[id]!;
    if (!w.formations.has(id)) {
      out.push(`navy: a formation aboard (${id}) that is no more`);
      continue;
    }
    // Its transports sunk in the hour (`destroyFormation`): the amphibious system loses it at its next hour.
    if (e.fleet === -1) {
      if (was.has(id)) out.push(`navy: ${tag(n)}'s formation ${id} aboard transports sunk an hour ago, still afloat`);
      sunk.add(id);
      continue;
    }
    if (!w.formations.has(e.fleet) || !w.isFleet(e.fleet)) out.push(`navy: ${tag(n)}'s formation ${id} aboard fleet ${e.fleet}, which is no fleet`);
    else if (fc.nation[e.fleet] !== n) out.push(`navy: ${tag(n)}'s formation ${id} aboard ${tag(fc.nation[e.fleet]!)}'s fleet ${e.fleet}`);
    else if (fc.x[id] !== fc.x[e.fleet] || fc.y[id] !== fc.y[e.fleet]) out.push(`navy: ${tag(n)}'s formation ${id} aboard fleet ${e.fleet} and not where it is`);
  }
  return out;
}

/**
 * The lines of `air` the world breaks now. `late`: the wings whose base was lost (taken, or its
 * carrier sunk) an hour before; refilled with this hour's.
 */
function airBreaks(w: World, late: Set<number>, fought: Set<number>, tag: (n: number) => string): string[] {
  const out: string[] = [];
  const fc = w.formations.cols;
  const was = new Set(late);
  late.clear();
  // The fleets in a sea battle this hour or the last (one that ended this hour moved in it, PLAN 4.3).
  const battling = new Set([...fought, ...inSeaBattle(w)]);
  fought.clear();
  for (const f of inSeaBattle(w)) fought.add(f);
  w.formations.forEach((id) => {
    if (w.isWing(id) && !w.wingBase.has(id)) out.push(`air: ${tag(fc.nation[id]!)}'s wing ${id} has no base`);
  });
  for (const [id, base] of w.wingBase) {
    if (!w.formations.has(id)) continue; // the air system forgets it at its hour
    const n = fc.nation[id]!;
    let lost = false;
    if (base === 0) lost = true;
    else if (base > 0) {
      const ab = w.airbases[base - 1];
      if (!ab) out.push(`air: ${tag(n)}'s wing ${id} at airbase ${base}, which is none`);
      else if (!ofSide(w, n, w.cells.controller[ab.cell]!)) lost = true;
    } else if (!w.formations.has(-base) || !w.isFleet(-base)) lost = true;
    else if (fc.nation[-base] !== n) out.push(`air: ${tag(n)}'s wing ${id} on ${tag(fc.nation[-base]!)}'s fleet ${-base}`);
    if (lost) {
      if (was.has(id)) out.push(`air: ${tag(n)}'s wing ${id} kept a base lost an hour ago (${base})`);
      late.add(id);
      continue;
    }
    const at = basePlace(w, base);
    if (at && !w.wingFerry.has(id) && (fc.x[id] !== at[0] || fc.y[id] !== at[1]) && !(base < 0 && battling.has(-base))) out.push(`air: ${tag(n)}'s wing ${id} not at its base (${base})`);
    const sortie = w.sorties.get(id);
    if (sortie && sortie.km > wingRange(w, id) * (1 + 1e-9)) out.push(`air: ${tag(n)}'s wing ${id} flies ${sortie.km.toFixed(0)} km out, range ${wingRange(w, id).toFixed(0)}`);
    const m = base > 0 ? w.wingMission.get(id) : undefined;
    if (m) {
      const km = kmFromBase(w, id, m.x, m.y);
      const range = wingRange(w, id);
      if (km > range * (1 + 1e-9)) out.push(`air: ${tag(n)}'s wing ${id} on a ${m.kind} ${km.toFixed(0)} km from its base, range ${range.toFixed(0)}`);
    }
  }
  return out;
}

const knows = (w: World, n: number, id: string): boolean => {
  const i = w.rules?.techs.findIndex((t) => t.id === id) ?? -1;
  return i >= 0 && knowsTechs(w, n, techMask([i]));
};

/** The lines of `nukes` the hour from `b` broke. */
function nukeBreaks(w: World, b: Before, events: number[], tag: (n: number) => string): string[] {
  const out: string[] = [];
  const fc = w.formations.cols;
  const nc = w.nations.cols;
  const rules = w.rules!;
  // Launched in the hour, by nation: by the rows, as a missile may burst within the hour it rose.
  const launched = new Map<number, number>();
  let rows = 0;
  for (let i = 0; i < events.length; i += 6) {
    if (events[i + 1] !== EventKind.NukeLaunched) continue;
    rows++;
    launched.set(events[i + 2]!, (launched.get(events[i + 2]!) ?? 0) + 1);
  }
  let fresh = 0;
  for (const l of w.nukeLaunches) {
    if (b.launches.has(l.id)) continue;
    fresh++;
    const n = l.nation;
    if (!nukesAllowed(w, n)) out.push(`nukes: ${tag(n)} launched with nukes barred`);
    if (l.yieldN > largestYield(w, n)) out.push(`nukes: ${tag(n)} launched a warhead of class ${l.yieldN}, beyond what it builds`);
    const km = seaKm(w, l.bx, l.by, l.tx, l.ty);
    if (l.missile === 1) {
      if (!knows(w, n, 'ballistic_missiles')) out.push(`nukes: ${tag(n)} launched a missile without the tech`);
      if (km > MISSILE_KM * (1 + 1e-9)) out.push(`nukes: ${tag(n)}'s missile flies ${km.toFixed(0)} km, beyond ${MISSILE_KM}`);
    } else {
      const wing = l.wing;
      const first = w.formations.has(wing) ? rules.templates[fc.template[wing]!]?.elements[0] : undefined;
      if (!w.formations.has(wing) || !w.isWing(wing) || fc.nation[wing] !== n) out.push(`nukes: ${tag(n)}'s bomber ${wing} is no wing of its own`);
      else if (!first || rules.units[first.unit]!.cls !== 'bomber_str') out.push(`nukes: ${tag(n)}'s warhead on wing ${wing}, no strategic bomber`);
      else if ((w.wingBase.get(wing) ?? 0) <= 0) out.push(`nukes: ${tag(n)}'s bomber ${wing} at no airbase`);
      else if (km > wingRange(w, wing) * (1 + 1e-9)) out.push(`nukes: ${tag(n)}'s bomber ${wing} flies ${km.toFixed(0)} km, range ${wingRange(w, wing).toFixed(0)}`);
    }
  }
  for (const [n, k] of launched) if ((b.stock.get(n) ?? 0) < k) out.push(`nukes: ${tag(n)} launched ${k} with ${b.stock.get(n) ?? 0} warheads`);
  // Ended launches and the rows that end them.
  const now = new Set(w.nukeLaunches.map((l) => l.id));
  let ended = 0;
  for (const id of b.launches.keys()) if (!now.has(id)) ended++;
  let told = 0;
  for (let i = 0; i < events.length; i += 6) if (events[i + 1] === EventKind.NukeDetonated || events[i + 1] === EventKind.NukeIntercepted) told++;
  // A launch made and ended in the same hour was in flight neither before nor after.
  const madeAndEnded = rows - fresh;
  if (fresh > rows) out.push(`nukes: ${fresh - rows} launches in flight with no row`);
  if (told !== ended + madeAndEnded) out.push(`nukes: ${ended + madeAndEnded} launches ended and ${told} bursts or interceptions told`);
  // The stockpiles.
  const day = isDayStart(w.tick - 1);
  for (const [n, h] of w.warheads) {
    if (h.stock > WARHEAD_MAX) out.push(`nukes: ${tag(n)} holds ${h.stock} warheads, over ${WARHEAD_MAX}`);
    if (h.stock < 0) out.push(`nukes: ${tag(n)} holds ${h.stock} warheads`);
    // One is built at the day's pass when its price is paid: what was paid toward it starts anew.
    const grew = h.stock + (launched.get(n) ?? 0) - (b.stock.get(n) ?? 0);
    const built = day && (b.paid.get(n) ?? 0) > 0 && h.paid < (b.paid.get(n) ?? 0) ? 1 : 0;
    if (grew > built) out.push(`nukes: ${tag(n)}'s stockpile grew by ${grew}, ${built} built`);
    if (day && (!w.nations.has(n) || nc.living[n] !== 1) && h.stock > 0) out.push(`nukes: ${tag(n)}, dead, holds ${h.stock} warheads after the day's pass`);
  }
  return out;
}

/** The lines of `bonds` the world breaks now. */
function bondBreaks(w: World, tag: (n: number) => string): string[] {
  const out: string[] = [];
  const nc = w.nations.cols;
  const alive = (n: number): boolean => n > 0 && w.nations.has(n) && nc.living[n] === 1;
  const inRange = (v: number): boolean => v >= 0 && v <= 100;
  w.nations.forEach((n) => {
    const o = nc.overlord[n]!;
    if (o === 0) return;
    if (!alive(n)) {
      out.push(`bonds: ${tag(n)}, dead, has an overlord (${tag(o)})`);
      return;
    }
    if (o === n || !alive(o)) out.push(`bonds: ${tag(n)}'s overlord ${tag(o)} is ${o === n ? 'itself' : 'dead'}`);
    else if (nc.overlord[o] !== 0) out.push(`bonds: ${tag(n)} is a puppet of ${tag(o)}, a puppet of ${tag(nc.overlord[o]!)}`);
    if (w.wars.atWar(n, o)) out.push(`bonds: ${tag(n)} at war with its overlord ${tag(o)}`);
    for (const [k, v] of [['autonomy', nc.autonomy[n]!], ['loyalty', nc.loyalty[n]!], ['integration', nc.integration[n]!]] as const) if (!inRange(v)) out.push(`bonds: ${tag(n)}'s ${k} ${v}`);
  });
  const seen = new Map<number, number>();
  for (const a of w.alliances.list) {
    const living = a.members.filter(alive);
    if (living.length !== a.members.length) out.push(`bonds: alliance ${a.id} has dead members (${a.members.filter((m) => !alive(m)).map(tag).join(' ')})`);
    if (a.members.length < 2) out.push(`bonds: alliance ${a.id} of ${a.members.length}`);
    if (!a.members.includes(a.leader)) out.push(`bonds: alliance ${a.id}'s leader ${tag(a.leader)} not a member`);
    if (a.loyalty.length !== a.members.length) out.push(`bonds: alliance ${a.id} has ${a.loyalty.length} loyalties for ${a.members.length} members`);
    if (!inRange(a.unity)) out.push(`bonds: alliance ${a.id}'s unity ${a.unity}`);
    for (const m of a.members) {
      if (seen.has(m)) out.push(`bonds: ${tag(m)} in alliances ${seen.get(m)} and ${a.id}`);
      seen.set(m, a.id);
    }
  }
  for (const g of w.alliances.guarantees) {
    if (!alive(g.guarantor) || !alive(g.target) || g.guarantor === g.target) out.push(`bonds: a guarantee of ${tag(g.guarantor)} to ${tag(g.target)}, not two living nations`);
    else if (w.wars.atWar(g.guarantor, g.target)) out.push(`bonds: ${tag(g.guarantor)} guarantees ${tag(g.target)} and is at war with it`);
  }
  return out;
}

/**
 * The heroes' rules (ROADMAP R9, ADR-812), each hour: a hero's formation is its roster row's
 * nation's, a living formation; no row has two; a row with no hero waits to return
 * (`heroReturn`), else it is lost for good.
 */
export function heroBreaks(w: World, tag: (n: number) => string): string[] {
  const out: string[] = [];
  if (w.heroRoster.length === 0) return out;
  const f = w.formations.cols;
  const rows = new Map<number, number>();
  for (const [id, row] of w.heroes) {
    const r = w.heroRoster[row];
    if (!r) {
      out.push(`heroes: formation ${id} of no row (${row})`);
      continue;
    }
    if (!w.formations.has(id)) out.push(`heroes: row ${row} (${tag(r.nation)}) on formation ${id}, which is gone`);
    else if (f.nation[id] !== r.nation) out.push(`heroes: row ${row}'s hero (${tag(r.nation)}) is ${tag(f.nation[id]!)}'s`);
    if (rows.has(row)) out.push(`heroes: row ${row} (${tag(r.nation)}) on formations ${rows.get(row)} and ${id}`);
    rows.set(row, id);
    // A sea hero on water is on water it can sail out of (ROADMAP R13): its start's basin, not the
    // Caspian or a lake (basin 0: no zone). On land it is on a passage (Suez), sailing through.
    if (w.formations.has(id) && w.rules?.templates[r.template]?.domain === Domain.sea) {
      const x = f.x[id]!;
      const y = f.y[id]!;
      const cell = Math.floor(y) * w.cells.w + (((Math.floor(x) % w.cells.w) + w.cells.w) % w.cells.w);
      const here = heroBasin(w, x, y);
      if (!isLand(w.cells.terrain[cell]!) && here !== heroBasin(w, r.x, r.y)) out.push(`heroes: row ${row}'s hero (${tag(r.nation)}) in basin ${here}, not its start's`);
    }
  }
  w.heroRoster.forEach((r, row) => {
    if (!rows.has(row) && !w.heroReturn.has(row)) out.push(`heroes: row ${row} (${tag(r.nation)}) has no hero and no return`);
    // Back within its hour (ROADMAP R10): past its days, its nation living and a place for it, it is
    // raised in the hour (the systems ran at tick − 1; an hour of slack for a place just taken).
    const at = w.heroReturn.get(row);
    if (at !== undefined && at < w.tick - 1 && w.nations.cols.living[r.nation] === 1 && returnPlace(w, row) !== null) {
      out.push(`heroes: row ${row} (${tag(r.nation)}) ${Math.floor((w.tick - at) / 24)} days past its return with a place`);
    }
    if (rows.has(row) && w.heroReturn.has(row)) out.push(`heroes: row ${row} (${tag(r.nation)}) has a hero and a return`);
  });
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
  const sunk = new Set<number>();
  const late = new Set<number>();
  const fought = new Set<number>();
  const check = (w: World): void => {
    const where = `${label} day ${Math.floor((w.tick - 1) / 24)}`;
    if (rules.has('economy')) breaks.add(where, economyBreaks(w, b, w.out.events, tag));
    if (rules.has('navy')) breaks.add(where, navyBreaks(w, sunk, tag));
    if (rules.has('air')) breaks.add(where, airBreaks(w, late, fought, tag));
    if (rules.has('nukes')) breaks.add(where, nukeBreaks(w, b, w.out.events, tag));
    if (rules.has('bonds')) breaks.add(where, bondBreaks(w, tag));
    if (rules.has('heroes')) breaks.add(where, heroBreaks(w, tag));
    w.out.events.length = 0;
    w.out.fires.length = 0;
    b = before(w);
  };
  let day = 0;
  for (const { day: at, act } of [...(c.acts ?? [])].sort((p, q) => p.day - q.day)) {
    if (at > c.days) break;
    s.step(24 * (at - day), check);
    day = at;
    act(s);
    b = before(s.world);
  }
  s.step(24 * (c.days - day), check);
  return breaks.lines;
}
