import type { FormationDetail, OrderNews } from '../shared/protocol';
import { t, type MessageKey } from './i18n';

/** The words of what became of a player's order (PLAN 4.9c): `name` is the formation's. */
export function orderNewsText(n: OrderNews, name: string): string {
  if (n.kind === 'repulsed') return t('order.repulsed', { name });
  if (n.kind === 'landedAway') return t('order.landedAway', { name });
  if (n.kind === 'unescorted') return t('order.unescorted', { name });
  if (n.kind === 'sentHome') return n.reason > 1 ? t('order.sentHomeMany', { name, more: n.reason - 1 }) : t('order.sentHome', { name });
  return t('order.refused', { name, why: t(`order.why.${n.reason}` as MessageKey) });
}

/** What a formation is doing, as its panel's status says it: its voyage, march, fight and retreat. */
function stateOf(info: FormationDetail): string {
  return `${info.voyage?.state ?? '-'}|${info.moving ? (info.goal ?? 1) : '-'}|${info.engaged ? 1 : 0}|${info.retreat > 0 ? 1 : 0}`;
}

/**
 * Whether the panel's notice of news `n` (its `seq`) no longer holds (ROADMAP R22f, critic run 34,
 * R34-N3: a refusal stood for weeks under "At sea, bound for its landing"): the formation's state
 * when the panel first showed it after the news (kept in `seen`, by `seq`) has changed since, or the
 * place its march is for (a new order taken while it marched, ROADMAP R23c, R35-N1). A
 * refusal only: the rest tell what became of an order under way, or happened (thrown back, landed
 * away, unescorted, sent home), and stay true.
 * `info` is the panel's detail; one of another formation or from before the news decides nothing.
 */
export function staleNotice(seen: Map<number, string>, n: OrderNews & { seq: number }, info: FormationDetail | null): boolean {
  if (n.kind !== 'refused' || !info || info.id !== n.id || info.tick < n.tick) return false;
  const now = stateOf(info);
  const was = seen.get(n.seq);
  if (was === undefined) {
    seen.set(n.seq, now);
    return false;
  }
  return was !== now;
}
