import type { FormationDetail, OrderNews } from '../shared/protocol';
import { t, type MessageKey } from './i18n';

/** The words of what became of a player's order (PLAN 4.9c): `name` is the formation's. */
export function orderNewsText(n: OrderNews, name: string, count = 1): string {
  // Several in one hour, `name` all their names (ROADMAP R40c).
  if (count > 1 && n.kind === 'lostAtSea') return t('order.lostAtSeaMany', { count, name });
  if (count > 1 && n.kind === 'transportsSunk') return t(n.reason === 1 ? 'order.transportsSunkCalledMany' : 'order.transportsSunkMany', { count, name });
  if (n.kind === 'repulsed') return t('order.repulsed', { name });
  // Thrown back, ashore where its transports put in (ROADMAP R53a): not "landed away".
  if (n.kind === 'thrownAshore') return n.at ? t('order.thrownAshore', { name, at: n.at }) : t('order.thrownAshoreNoPlace', { name });
  if (n.kind === 'landedAway') return n.at ? t('order.landedAwayAt', { name, at: n.at }) : t('order.landedAway', { name });
  if (n.kind === 'unescorted') return t('order.unescorted', { name });
  // Left for a march, not another landing (reason 1; ROADMAP R55e, critic run 56: "for a new one" with none).
  if (n.kind === 'leftLanding') return t(n.reason === 1 ? 'order.leftLandingMarch' : 'order.leftLanding', { name });
  // With when (ROADMAP R58b): "in about N days".
  if (n.kind === 'nextVoyage') {
    const key = n.reason === 1 ? 'order.nextVoyageMarch' : 'order.nextVoyage';
    return n.days === undefined ? t(key, { name }) : t(n.days === 1 ? `${key}.one` : `${key}.days`, { name, days: n.days });
  }
  if (n.kind === 'sameLanding') return n.reason > 1 ? t('order.sameLandingMany', { name, more: n.reason - 1 }) : t('order.sameLanding', { name });
  if (n.kind === 'lostAtSea') return t('order.lostAtSea', { name });
  if (n.kind === 'transportsSunk') return t(n.reason === 1 ? 'order.transportsSunkCalled' : 'order.transportsSunk', { name });
  if (n.kind === 'sentHome') return n.reason > 1 ? t('order.sentHomeMany', { name, more: n.reason - 1 }) : t('order.sentHome', { name });
  return t('order.refused', { name, why: t(`order.why.${n.reason}` as MessageKey) });
}

/**
 * The words of an order's news for a row of one line beside a panel, its full words in the row's tooltip. A loss of
 * `count` divisions in one hour by its count (ROADMAP R42b; critic run 49, R49-N3: "2 divisions lost at sea with their
 * transports: Squar…"); one formation's by its number and the gist (R43b; critic run 50, R50-N2: "Square infantry
 * division 366: the transports of its…", "…: not done: there is o…"). `name` is the formation's, as `orderNewsText`'s.
 */
export function orderNewsBrief(n: OrderNews, count: number, name: string): string {
  if (count > 1 && n.kind === 'lostAtSea') return t('order.lostAtSeaBrief', { count });
  if (count > 1 && n.kind === 'transportsSunk') return t(n.reason === 1 ? 'order.transportsSunkCalledBrief' : 'order.transportsSunkBrief', { count });
  // A division is told by its number ("366"), as its counter on the map; a hero or a wing by its name.
  const tag = name.endsWith(` ${n.id}`) ? String(n.id) : name;
  if (n.kind === 'repulsed') return t('order.repulsedBrief', { name: tag });
  if (n.kind === 'thrownAshore') return n.at ? t('order.thrownAshoreBrief', { name: tag, at: n.at }) : t('order.thrownAshoreNoPlaceBrief', { name: tag });
  if (n.kind === 'landedAway') return n.at ? t('order.landedAwayAtBrief', { name: tag, at: n.at }) : t('order.landedAwayBrief', { name: tag });
  if (n.kind === 'unescorted') return t('order.unescortedBrief', { name: tag });
  if (n.kind === 'leftLanding') return t(n.reason === 1 ? 'order.leftLandingMarchBrief' : 'order.leftLandingBrief', { name: tag });
  if (n.kind === 'nextVoyage') return n.days === undefined ? t('order.nextVoyageBrief', { name: tag }) : t(n.days === 1 ? 'order.nextVoyageBrief.one' : 'order.nextVoyageBrief.days', { name: tag, days: n.days });
  if (n.kind === 'sameLanding') return n.reason > 1 ? t('order.sameLandingManyBrief', { name: tag, more: n.reason - 1 }) : t('order.sameLandingBrief', { name: tag });
  if (n.kind === 'lostAtSea') return t('order.lostAtSeaOneBrief', { name: tag });
  if (n.kind === 'transportsSunk') return t(n.reason === 1 ? 'order.transportsSunkCalledOneBrief' : 'order.transportsSunkOneBrief', { name: tag });
  if (n.kind === 'sentHome') return n.reason > 1 ? t('order.sentHomeManyBrief', { name: tag, more: n.reason - 1 }) : t('order.sentHomeBrief', { name: tag });
  return t('order.refusedBrief', { name: tag, why: t(`order.whyBrief.${n.reason}` as MessageKey) });
}

/** How many hours a panel's notice is news; after, it is drawn as history, muted (ROADMAP R58c): three days. */
export const NOTICE_OLD_HOURS = 72;

/** Whether a notice of news at hour `newsTick` is history at hour `now` (ROADMAP R58c). */
export const noticeOld = (now: number, newsTick: number): boolean => now - newsTick > NOTICE_OLD_HOURS;

/** What a formation is doing, as its panel's status says it: its voyage, march, fight and retreat. */
function stateOf(info: FormationDetail): string {
  return `${info.voyage?.state ?? '-'}|${info.moving ? (info.goal ?? 1) : '-'}|${info.engaged ? 1 : 0}|${info.retreat > 0 ? 1 : 0}`;
}

/**
 * Whether the panel's notice of news `n` (its `seq`) no longer holds (ROADMAP R22f, critic run 34,
 * R34-N3: a refusal stood for weeks under "At sea, bound for its landing"): the formation's state
 * when the panel first showed it after the news (kept in `seen`, by `seq`) has changed since, or the
 * place its march is for (a new order taken while it marched, ROADMAP R23c, R35-N1). A
 * refusal or a next voyage only (R37b; a landing left goes at the next order): the rest tell what became of
 * an order under way, or happened (thrown back, landed away, unescorted, sent home), and stay true.
 * `info` is the panel's detail; one of another formation or from before the news decides nothing.
 * `orderedAt`: the `seq` the next news was to take when the formation's last order was sent from
 * here (`Hud.orderedAt`); a refusal before it goes, whatever the state (ROADMAP R24c).
 */
export function staleNotice(seen: Map<number, string>, n: OrderNews & { seq: number }, info: FormationDetail | null, orderedAt?: number): boolean {
  // Left its landing: true until its next order (ROADMAP R37b; critic run 44, R44-N1: "it will not land with them"
  // stood 20 days after a recall that rejoined); its state changes with the order that told it, so not by state.
  // The same landing clicked again (R34j): true until the next order.
  if (n.kind === 'leftLanding' || n.kind === 'transportsSunk' || n.kind === 'sameLanding') return orderedAt !== undefined && n.seq < orderedAt;
  // The next voyage: true until it sails, or the next order (R37b).
  if (n.kind !== 'refused' && n.kind !== 'nextVoyage') return false;
  if (orderedAt !== undefined && n.seq < orderedAt) return true;
  if (!info || info.id !== n.id || info.tick < n.tick) return false;
  const now = stateOf(info);
  const was = seen.get(n.seq);
  if (was === undefined) {
    seen.set(n.seq, now);
    return false;
  }
  return was !== now;
}
