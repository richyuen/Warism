/**
 * History log rows for the UI and exports (PLAN 1.34a): what `a` and `b` mean per event kind,
 * the i18n message per kind, and the row shape the worker sends (names already resolved to
 * i18n keys or '=' + literal). No row shows an id (PLAN 3.12a): an alliance has its name and
 * its founder's, dissolved or not, and a Major Battle the city it began near.
 */
import { dateOfTick } from './calendar';
import { EventKind } from './events';

/** 'town': a city founded or razed (PLAN 7.33b), named as the log keeps it, not as the city table has it now. */
export type HistoryRole = 'nation' | 'alliance' | 'battle' | 'city' | 'number' | 'side' | 'strike' | 'town' | 'hero';

/** A side of a sea battle in a row (PLAN 4.3c): its nation and the ships it lost, as nation + SIDE_SHIPS × ships. */
export const SIDE_SHIPS = 65536;
export function seaSide(v: number): { nation: number; ships: number } {
  return { nation: v % SIDE_SHIPS, ships: Math.floor(v / SIDE_SHIPS) };
}

/**
 * A month's raids on a bloc's convoys in a row (PLAN 7.33a, `ConvoyRaided`'s b): the bloc and the
 * gold taken in tenths, as bloc + SIDE_SHIPS × tenths. A row of a game saved before has the bloc
 * alone: gold 0.
 */
export function packConvoyTake(bloc: number, gold: number): number {
  return bloc + SIDE_SHIPS * Math.max(0, Math.round(10 * gold));
}
export function convoyTake(v: number): { nation: number; gold: number } {
  const s = seaSide(v);
  return { nation: s.nation, gold: s.ships / 10 };
}

/** A nuclear strike in a row (PLAN 6.5a): the nation struck (0 none), the yield (1 or 2) and the dead, as nation + SIDE_SHIPS × (yield + NUKE_YIELDS × dead). */
export const NUKE_YIELDS = 4;
export function packNukeStrike(nation: number, yieldN: number, dead: number): number {
  return nation + SIDE_SHIPS * (yieldN + NUKE_YIELDS * Math.round(dead));
}
export function nukeStrike(v: number): { nation: number; yieldN: number; dead: number } {
  const rest = Math.floor(v / SIDE_SHIPS);
  return { nation: v % SIDE_SHIPS, yieldN: rest % NUKE_YIELDS, dead: Math.floor(rest / NUKE_YIELDS) };
}

/**
 * What a burst destroyed of the forces there (PLAN 7.32b, `NukeToll`'s b): men (crews among them),
 * guns (artillery, anti-tank, anti-air) and tanks, as tanks + NUKE_PART × (guns + NUKE_PART × men).
 * Guns and tanks are held under NUKE_PART (a burst on a stacked theatre takes a few thousand);
 * men under 2^25, so the whole is under 2^53.
 */
export const NUKE_PART = 16384;
export interface NukeToll {
  men: number;
  guns: number;
  tanks: number;
}
export function packNukeToll(t: NukeToll): number {
  const part = (v: number): number => Math.min(NUKE_PART - 1, Math.max(0, Math.round(v)));
  return part(t.tanks) + NUKE_PART * (part(t.guns) + NUKE_PART * Math.max(0, Math.round(t.men)));
}
export function nukeToll(v: number): NukeToll {
  const rest = Math.floor(v / NUKE_PART);
  return { men: Math.floor(rest / NUKE_PART), guns: rest % NUKE_PART, tanks: v % NUKE_PART };
}

/** Roles of a and b per historic kind. */
export const HISTORY_ROLES: Readonly<Record<number, readonly [HistoryRole, HistoryRole]>> = {
  [EventKind.Bankruptcy]: ['nation', 'number'],
  [EventKind.CapitalCaptured]: ['nation', 'nation'],
  [EventKind.NationEliminated]: ['nation', 'number'],
  [EventKind.WarDeclared]: ['nation', 'nation'],
  [EventKind.PeaceSigned]: ['nation', 'nation'],
  [EventKind.AllianceLeft]: ['nation', 'alliance'],
  [EventKind.AllianceDissolved]: ['alliance', 'nation'],
  [EventKind.UnionFormed]: ['alliance', 'nation'],
  [EventKind.AllianceJoined]: ['nation', 'alliance'],
  [EventKind.PuppetCreated]: ['nation', 'nation'],
  [EventKind.PuppetReleased]: ['nation', 'nation'],
  [EventKind.PuppetRevolt]: ['nation', 'nation'],
  [EventKind.PuppetIntegrated]: ['nation', 'nation'],
  [EventKind.RevoltSpawned]: ['nation', 'nation'],
  [EventKind.NationRevived]: ['nation', 'number'],
  [EventKind.NationCollapsed]: ['nation', 'number'],
  [EventKind.MajorBattleStarted]: ['battle', 'city'],
  [EventKind.MajorBattleEnded]: ['battle', 'nation'],
  [EventKind.NationAnnexed]: ['nation', 'nation'],
  [EventKind.FormationsDisbanded]: ['nation', 'number'],
  [EventKind.LandCeded]: ['nation', 'nation'],
  [EventKind.WarEnded]: ['nation', 'nation'],
  [EventKind.SeaBattle]: ['side', 'side'],
  // The bloc raided and the gold taken (PLAN 7.33a).
  [EventKind.ConvoyRaided]: ['nation', 'side'],
  [EventKind.AirWar]: ['side', 'side'],
  [EventKind.AirRaids]: ['nation', 'side'],
  [EventKind.NukeCasualties]: ['nation', 'strike'],
  // An AI's decision to strike (PLAN 6.7): its utility × 1000, told in words (PLAN 7.25c).
  [EventKind.NukeDecided]: ['nation', 'number'],
  // A burst's forces destroyed (PLAN 7.32b): read into its strike's row, not a row of its own.
  [EventKind.NukeToll]: ['nation', 'number'],
  // God Mode's acts (PLAN 7.33b): a nation set down on another's land, a town founded or razed in it.
  [EventKind.NationSpawned]: ['nation', 'nation'],
  [EventKind.CitySpawned]: ['town', 'nation'],
  [EventKind.CityRazed]: ['town', 'nation'],
  // God Mode's Breakthrough at war (ROADMAP R49a): the nation, the city nearest its start.
  [EventKind.GodBreakthrough]: ['nation', 'city'],
  // A holder's last means of delivery lost (PLAN 7.37b3): the enemy that took its airbase, or none.
  [EventKind.NukeMeansLost]: ['nation', 'nation'],
  // A new nuclear power (PLAN 7.37i): its income's rank that day, told in words.
  [EventKind.NuclearPower]: ['nation', 'number'],
  // A forced war's bonds broken (PLAN 7.175a): the attacker, the nation war was declared on.
  [EventKind.BondsBroken]: ['nation', 'nation'],
  // A guarantee lapsed at a war between its two (PLAN 7.190): the guarantor, the target.
  [EventKind.GuaranteeLapsed]: ['nation', 'nation'],
  // A nation called into a war by a bond (ROADMAP R55i): it, the one it stands beside.
  [EventKind.WarJoined]: ['nation', 'nation'],
  // A nation out of a war that goes on (PLAN 7.190): it, the enemy's leader.
  [EventKind.WarLeft]: ['nation', 'nation'],
  // A hero lost and back (ROADMAP R12): its nation, its roster row (named by its template).
  [EventKind.HeroLost]: ['nation', 'hero'],
  [EventKind.HeroReturned]: ['nation', 'hero'],
  // A default with nothing to fragment (ROADMAP R7): the nation, the debt voided.
  [EventKind.NationDefaulted]: ['nation', 'number'],
  // The player's formations sent home (ROADMAP R21d): the nation, how many.
  [EventKind.FormationsSentHome]: ['nation', 'number'],
};

/** Stable English type name of a kind (filters, CSV/JSON `type`). */
export function kindName(kind: number): string {
  for (const [k, v] of Object.entries(EventKind)) if (v === kind) return k;
  return `Kind${kind}`;
}

/** A history row as sent by the worker: names of a and b resolved (i18n key or '=' + literal; '' if none). */
export interface HistoryRow {
  tick: number;
  kind: number;
  a: number;
  b: number;
  x: number | null;
  y: number | null;
  an: string;
  bn: string;
  /** The founder of the row's alliance, as a name ('' when the row has no alliance or it is not known). */
  of: string;
  /**
   * What the row is of, where its kind has more than one sentence (PLAN 3.12b; absent: the
   * kind's own). A `RevoltSpawned` is 'revived' when its a is a dead nation that returned in that
   * hour, and 'joined' when a was a nation of rebels already and the land rose to it. A
   * `LandCeded` is 'left' when its b died in that hour (PLAN 3.12b2); its own sentence is of
   * land that rose and went back to its core nation. An `AllianceJoined` is 'founded' when it is
   * the founder's at the founding (PLAN 3.12Rg1): the first row that names the alliance. A
   * `WarEnded` is 'puppet' when the log tells whose puppet its b became in that hour (PLAN
   * 3.12Rn): `cn` names the overlord.
   */
  as?: HistoryAs;
  /** A third nation's name, where the row's sentence has one ({c}): the new overlord of a `WarEnded` that is 'puppet'. */
  cn?: string;
  /** The city nearest a nuclear strike or a decision to strike, as a name ('=' + literal; PLAN 6.11c, 7.25c), where the log knows one. */
  near?: string;
  /**
   * What a nuclear strike destroyed of the forces there (PLAN 7.32b): its `NukeToll`, the row after
   * it in the log. Absent in a game saved before: its sentence then has the dead alone.
   */
  toll?: NukeToll;
  /** The bonds a forced war broke (`BondsBroken`, PLAN 7.175a): a sum of `Bond`'s bits, the log's y. */
  bonds?: number;
}

export type HistoryAs = 'revived' | 'joined' | 'left' | 'founded' | 'puppet' | 'alliance' | 'guarantee';

/** The major events, which the ticker tells as they happen (PLAN 3.12c): war, peace, a capital taken, a nation's death or return. */
export const TICKER_KINDS: ReadonlySet<number> = new Set<number>([
  EventKind.WarDeclared,
  EventKind.PeaceSigned,
  EventKind.WarEnded,
  EventKind.CapitalCaptured,
  EventKind.NationEliminated,
  EventKind.NationCollapsed,
  EventKind.NationAnnexed,
  EventKind.NationRevived,
  // A nuclear strike (PLAN 6.5a).
  EventKind.NukeCasualties,
  // The month's air war (PLAN 5.11a): its largest row of each kind (`tickerRows`).
  EventKind.AirWar,
  EventKind.AirRaids,
  // God Mode's acts (PLAN 7.33b).
  EventKind.NationSpawned,
  EventKind.CitySpawned,
  EventKind.CityRazed,
  EventKind.GodBreakthrough,
  // A holder's last means of delivery lost (PLAN 7.37b3).
  EventKind.NukeMeansLost,
  // A new nuclear power (PLAN 7.37i).
  EventKind.NuclearPower,
  // The bonds a forced war broke (PLAN 7.175a), told before its declaration.
  EventKind.BondsBroken,
  // A war a nation left while it goes on, and a puppet's revolt (PLAN 7.192, critic run 26's 1).
  EventKind.WarLeft,
  EventKind.PuppetRevolt,
  // A puppet freed, or broken free of an overlord overrun: the cause of its "left its war" rows (ROADMAP R42d,
  // critic run 49, R49-N2).
  EventKind.PuppetReleased,
  // A hero lost and back (ROADMAP R12).
  EventKind.HeroLost,
  EventKind.HeroReturned,
]);
/** Kinds of which the ticker takes one row an hour, the last logged: a month's air rows, logged the largest last. */
export const TICKER_ONE_AN_HOUR: ReadonlySet<number> = new Set<number>([EventKind.AirWar, EventKind.AirRaids]);
/** The ticker holds this many rows at most, */
export const TICKER_ROWS = 5;
/** and none older than this many hours of the game (30 days). */
export const TICKER_HOURS = 24 * 30;

/** A row of the ticker: a history row with its number in the log and a place, always. */
export interface TickerRow extends HistoryRow {
  /** The row's number in the log: a row is known by it. */
  i: number;
  x: number;
  y: number;
}

export interface HistoryFilter {
  /** Event kind (null = all). */
  kind: number | null;
  /** Nation id appearing as a or b in a nation role (null = all). */
  nation: number | null;
  /** Inclusive year range (null = open). */
  fromYear: number | null;
  toYear: number | null;
  /** "My wars only" (ROADMAP R53f): the nation played, whose war rows (`WAR_KINDS`) naming it are kept; null = all. */
  mine: number | null;
}

/**
 * The kinds of a war's rows (ROADMAP R53f; critic run 54's idea from Europa Universalis: "my wars only"): wars declared,
 * left and ended, peace, captures and annexations, land ceded, battles won (a major battle's row names its winner
 * alone), sea and air war, raids, nuclear strikes and their means, God's breakthroughs, forced bonds and guarantees
 * broken, a nation's end, heroes lost; not its economy, alliances, puppets' politics or revolts.
 */
export const WAR_KINDS: ReadonlySet<number> = new Set([
  EventKind.WarDeclared,
  EventKind.PeaceSigned,
  EventKind.WarEnded,
  EventKind.WarLeft,
  EventKind.CapitalCaptured,
  EventKind.NationAnnexed,
  EventKind.NationEliminated,
  EventKind.LandCeded,
  EventKind.MajorBattleEnded,
  EventKind.SeaBattle,
  EventKind.ConvoyRaided,
  EventKind.AirWar,
  EventKind.AirRaids,
  EventKind.NukeCasualties,
  EventKind.NukeDecided,
  EventKind.NukeMeansLost,
  EventKind.GodBreakthrough,
  EventKind.BondsBroken,
  EventKind.GuaranteeLapsed,
  EventKind.HeroLost,
  EventKind.WarJoined,
]);

export const NO_FILTER: HistoryFilter = { kind: null, nation: null, fromYear: null, toYear: null, mine: null };

/** The nation a row's a or b names in its role (a side's or a strike's too: PLAN 7.33a), 0 when it names none. */
export function roleNation(role: HistoryRole, v: number): number {
  return role === 'nation' ? v : role === 'side' ? seaSide(v).nation : role === 'strike' ? nukeStrike(v).nation : 0;
}

/** Rows matching `f`; `startDay` dates the ticks. Order is kept. */
/**
 * Rows oldest first, as History shows them: the newest hour first, each hour's rows in the order they were logged
 * (ROADMAP R49b; critic run 51, R51-N5: every row reversed, a release stood under the "left its war" rows it caused,
 * which the ticker, R43d, tells after it). One hour reads as the ticker reads it.
 */
export function newestHourFirst<T extends { tick: number }>(rows: readonly T[]): T[] {
  const out: T[] = [];
  let end = rows.length;
  while (end > 0) {
    let start = end - 1;
    while (start > 0 && rows[start - 1]!.tick === rows[end - 1]!.tick) start--;
    for (let i = start; i < end; i++) out.push(rows[i]!);
    end = start;
  }
  return out;
}

export function filterHistory(rows: readonly HistoryRow[], f: HistoryFilter, startDay: number): HistoryRow[] {
  const joined = f.mine !== null ? joinedWarRows(rows, f.mine) : new Set<HistoryRow>();
  return rows.filter((r) => {
    if (f.kind !== null && r.kind !== f.kind) return false;
    if (f.nation !== null) {
      const [ra, rb] = HISTORY_ROLES[r.kind] ?? ['number', 'number'];
      if (roleNation(ra, r.a) !== f.nation && roleNation(rb, r.b) !== f.nation) return false;
    }
    if (f.mine !== null) {
      if (!WAR_KINDS.has(r.kind)) return false;
      const [ra, rb] = HISTORY_ROLES[r.kind] ?? ['number', 'number'];
      if (roleNation(ra, r.a) !== f.mine && roleNation(rb, r.b) !== f.mine && !joined.has(r)) return false;
    }
    if (f.fromYear !== null || f.toYear !== null) {
      const y = dateOfTick(startDay, r.tick).year;
      if (f.fromYear !== null && y < f.fromYear) return false;
      if (f.toYear !== null && y > f.toYear) return false;
    }
    return true;
  });
}

/**
 * The declaration and the peace of each war nation `n` was called into (`WarJoined`; ROADMAP R55i, critic run 55,
 * R55-N1: "My wars only" kept France's battles of Germany's war on Poland but not the war, nor its end, as neither names
 * France): the `WarDeclared` logged before the join in its hour, and the first `PeaceSigned` of the same two after it.
 */
function joinedWarRows(rows: readonly HistoryRow[], n: number): Set<HistoryRow> {
  const out = new Set<HistoryRow>();
  const open = new Map<string, number>();
  const pair = (a: number, b: number): string => (a < b ? `${a}:${b}` : `${b}:${a}`);
  let declared: HistoryRow | null = null;
  for (const r of rows) {
    if (r.kind === EventKind.WarDeclared) declared = r;
    else if (r.kind === EventKind.WarJoined && r.a === n && declared && declared.tick === r.tick) {
      out.add(declared);
      open.set(pair(declared.a, declared.b), r.tick);
    } else if (r.kind === EventKind.PeaceSigned && open.has(pair(r.a, r.b))) {
      out.add(r);
      open.delete(pair(r.a, r.b));
    }
  }
  return out;
}

/** ISO date (YYYY-MM-DD) of a tick. */
export function isoDate(startDay: number, tick: number): string {
  const d = dateOfTick(startDay, tick);
  const p = (n: number, w: number): string => String(n).padStart(w, '0');
  return `${p(d.year, 4)}-${p(d.month, 2)}-${p(d.day, 2)}`;
}

/** Export record: date, tick, type name, a/b ids and display names, and the rendered text. */
export interface HistoryExport {
  date: string;
  tick: number;
  type: string;
  a: number;
  aName: string;
  b: number;
  bName: string;
  text: string;
}

/**
 * The id an export gives a side of a row (PLAN 7.166): a side (a sea or air battle's, a raid's)
 * and a strike are a nation packed with a count, which the export's `a` and `b` gave raw
 * ("458771" for France and its 7 ships lost); the nation's id is what the column means. The count
 * is in the row's text.
 */
function exportId(role: HistoryRole | undefined, v: number): number {
  return role === 'side' || role === 'strike' ? roleNation(role, v) : v;
}

export function toExport(rows: readonly HistoryRow[], startDay: number, display: (key: string) => string, text: (r: HistoryRow) => string): HistoryExport[] {
  return rows.map((r) => {
    const [ra, rb] = HISTORY_ROLES[r.kind] ?? [undefined, undefined];
    return { date: isoDate(startDay, r.tick), tick: r.tick, type: kindName(r.kind), a: exportId(ra, r.a), aName: r.an ? display(r.an) : '', b: exportId(rb, r.b), bName: r.bn ? display(r.bn) : '', text: text(r) };
  });
}

const CSV_COLUMNS = ['date', 'tick', 'type', 'a', 'aName', 'b', 'bName', 'text'] as const;

/** RFC 4180 CSV with a header row (fields quoted when they contain `"`, `,` or a newline). */
export function toCsv(records: readonly HistoryExport[]): string {
  const q = (v: string | number): string => {
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [CSV_COLUMNS.join(','), ...records.map((r) => CSV_COLUMNS.map((c) => q(r[c])).join(','))].join('\r\n') + '\r\n';
}
