import type { NationStat, WarStat } from '../shared/protocol';

/**
 * The order of the war banners (ROADMAP R121, R130, R132): the played nation's own wars first, then those fought in
 * the last days (`WarStat.fought`; R130 had the hour's `battle`, and the row changed places by the second, critic run
 * 75's R75-N1), then the largest by the men of the two sides, then the newest.
 */
export function bannerOrder(wars: readonly WarStat[], byId: ReadonlyMap<number, NationStat>, player: number): WarStat[] {
  const size = new Map(wars.map((w) => [w.id, [...w.attackers, ...w.defenders].reduce((sum, n) => sum + (byId.get(n)?.men ?? 0), 0)]));
  return [...wars].sort((a, b) => isMine(b, player) - isMine(a, player) || Number(b.fought) - Number(a.fought) || size.get(b.id)! - size.get(a.id)! || b.startTick - a.startTick || b.id - a.id);
}

const isMine = (w: WarStat, player: number): number => (player !== 0 && (w.attackers.includes(player) || w.defenders.includes(player)) ? 1 : 0);

/**
 * Twenty days of hours: a war that takes a place on the row from another keeps it that long, though another comes to
 * outrank it (ROADMAP R132; at ×5, twenty seconds). By the order alone, critic run 75's 57901 changed its row 12 times a
 * minute and the banner under a resting cursor 6 times: wars in bursts of battles some days apart, entering and leaving
 * the fought ones (held ten days and kept in their slots, 9 and 3; twenty, 6 and 1).
 */
export const HOLD_TICKS = 20 * 24;

/**
 * Three days of hours: a war on the row with no battle in them, not the played nation's, gives its place to a war with a
 * battle now behind "+n", held or not (R161, critic run 77: on 57901 33–51 banner-days of wars fought in their ten days
 * but still for days, while one fighting waited).
 */
export const STILL_TICKS = 3 * 24;

/** A war on the row, and the tick it took its place; `contested` while there were more wars than the row shows. */
export interface Held {
  id: number;
  since: number;
  contested: boolean;
}

/**
 * The row of `shown` banners at `tick` from the order (`bannerOrder`) and the row before (`prev`). Every war on it while
 * they are no more than `shown`: by the order. Else those of the order's first `shown`; but a war that took its place
 * while there were more (`contested`) less than HOLD_TICKS ago keeps it, unless the played nation's wars need it (they
 * are first at once, ROADMAP R121), or it has gone quiet while a war fought waits for a place (R148). A war over leaves at once. On the row: the played nation's wars, then each war in
 * the slot it had while contested, a newcomer in a slot one left (by the order), the rest after: re-sorted by the order,
 * a war that fell behind slid down the row and the banner under a resting cursor became another's. A place taken while
 * all were on the row is neither held nor kept in its slot (R121: a great war declared on a row with room is first).
 * `prev` from another player, or from a later tick (a load), is not held to.
 */
export function heldRow(ranked: readonly WarStat[], shown: number, tick: number, prev: readonly Held[], player: number): Held[] {
  if (ranked.length <= shown) return ranked.map((w) => ({ id: w.id, since: tick, contested: false }));
  const rank = new Map(ranked.map((w, i) => [w.id, i]));
  const want = ranked.slice(0, shown);
  // The slots of the row before, a war over among them (its slot is a newcomer's); the live ones are held.
  const before = prev.every((h) => h.contested && h.since <= tick) ? prev : [];
  const since = new Map(before.filter((h) => rank.has(h.id)).map((h) => [h.id, h.since]));
  const row = new Set<number>();
  for (const w of want) if (isMine(w, player)) row.add(w.id);
  // On the row before: those the order still wants, then those that took their place lately.
  for (const w of want) if (since.has(w.id) && row.size < shown) row.add(w.id);
  // A held war gone quiet (no battle in its days, `fought` false) does not keep its place from a war fought that the
  // order wants (R148, critic run 76: on HEAD's 57901, 48-63 banner-days of quiet wars on the row while a war with
  // battles stood behind "+n"). The hold is against a war that outranks by size, not by its battles.
  const foughtWaits = want.some((w) => w.fought && !row.has(w.id));
  const young = [...since].filter(([id, at]) => !row.has(id) && tick - at < HOLD_TICKS && (!foughtWaits || ranked[rank.get(id)!]!.fought)).sort((a, b) => rank.get(a[0])! - rank.get(b[0])!);
  for (const [id] of young) if (row.size < shown) row.add(id);
  for (const w of ranked) if (row.size < shown) row.add(w.id);
  // A still war gives way to one fighting now (R161): the lowest of the still first, the waiting by the order.
  const waiting = ranked.filter((w) => w.battle && !row.has(w.id));
  const isStill = (w: WarStat): boolean => !w.battle && !isMine(w, player) && (w.lastBattle === undefined || tick - w.lastBattle > STILL_TICKS);
  const still = [...row].filter((id) => isStill(ranked[rank.get(id)!]!)).sort((x, y) => rank.get(y)! - rank.get(x)!);
  for (const id of still) {
    const w = waiting.shift();
    if (!w) break;
    row.delete(id);
    row.add(w.id);
  }
  const byRank = (x: number, y: number): number => rank.get(x)! - rank.get(y)!;
  const mine = [...row].filter((id) => isMine(ranked[rank.get(id)!]!, player)).sort(byRank);
  const fresh = [...row].filter((id) => !mine.includes(id) && !since.has(id)).sort(byRank);
  const placed: number[] = [...mine];
  for (const h of before) {
    if (mine.includes(h.id)) continue;
    if (since.has(h.id) && row.has(h.id)) placed.push(h.id);
    else if (fresh.length > 0) placed.push(fresh.shift()!);
  }
  placed.push(...fresh);
  return placed.map((id) => ({ id, since: since.get(id) ?? tick, contested: true }));
}

/** Where a desk's closed row stands: on the bar's centre, or in the middle of the band free beside it (R202). */
export type RowSide = 'centre' | 'band';
/**
 * The side a row took, with what it was chosen for: the free band (its width and middle, px) and the banners shown.
 * `outgrown`: the number of banners with which the row outgrew the centre in this band, 0 for never.
 */
export interface RowStand {
  side: RowSide;
  width: number;
  mid: number;
  banners: number;
  outgrown: number;
}
/** The band's edges may move this many px (a legend's row a letter longer) and the row's side is still held. */
export const STAND_SLACK = 2;
/**
 * The side of a desk's closed row (R204, critic run 87, R87-N2; ADR-1142): chosen when the band or the number of banners
 * changes, on the centre if the banners fit there, and held until one of them changes again. R202 chose it at every
 * draw from the banners' widths, and the row jumped 24 to 44 px when a war on it gave its place to one with longer or
 * shorter names. Held on the centre, a row that has outgrown it gives a banner behind "+n" (`drop`) and stays; with one
 * banner it goes to the band (a war is shown at every desk, R197). When that many banners come back in the same band
 * they stand in the band, where they fit whatever their names: once, not a banner gone and back at each long name.
 */
export function rowStand(held: RowStand | null, band: { width: number; mid: number }, banners: number, fitsCentre: boolean): { stand: RowStand; drop: boolean } {
  const sameBand = held !== null && Math.abs(held.width - band.width) <= STAND_SLACK && Math.abs(held.mid - band.mid) <= STAND_SLACK;
  if (held === null || !sameBand) return { stand: { side: fitsCentre ? 'centre' : 'band', width: band.width, mid: band.mid, banners, outgrown: 0 }, drop: false };
  if (held.banners !== banners) {
    const tight = held.outgrown > 0 && banners >= held.outgrown;
    return { stand: { ...held, side: fitsCentre && !tight ? 'centre' : 'band', banners }, drop: false };
  }
  if (held.side === 'band' || fitsCentre) return { stand: held, drop: false };
  if (banners > 1) return { stand: { ...held, outgrown: banners }, drop: true };
  return { stand: { ...held, side: 'band' }, drop: false };
}
