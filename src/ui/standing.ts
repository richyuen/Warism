/**
 * A nation's standing with the played one (PLAN 7.175b, ADR-780): what the right-click menu and
 * the Actions tab say of it, and whether a war on it would break a bond (the button reads "Force
 * war"). Read from the statistics message as the sim's `whyNotWar` and `bond` read the world: at
 * war, one the other's puppet, allies, one overlord's puppets or allied realms, a truce. Fighting
 * on one side in a war (`beside`, PLAN 7.189) is no bond: no war on it, forced or not, unless a bond
 * ties the two too (PLAN 7.191): then the bond's standing, and Force war leaves the shared wars.
 */
import { PEACE_ACCEPT_EXHAUSTION, PEACE_ACCEPT_SCORE, type PeaceVerdict } from '../shared/peace';
import type { NationStat, WarStat } from '../shared/protocol';
import { t } from './i18n';

export type StandingKind = 'war' | 'beside' | 'puppet' | 'overlord' | 'allied' | 'realm' | 'truce' | 'neutral';

export interface Standing {
  kind: StandingKind;
  /** The days of the truce left (`truce`), else 0. */
  days: number;
  /** Whether a bond stands in a war's way: `forceWar` would break it. */
  bond: boolean;
  /** A bond's standing with a nation that also fights on one side with it in a war (PLAN 7.192): set, true. */
  beside?: true;
}

export type Who = Pick<NationStat, 'id' | 'overlord' | 'alliance' | 'truces'>;

/**
 * Why `a`'s alliance proposal to `b` would be turned down, in words; '' when it may be made (PLAN
 * 7.192, critic run 26's 3). As the sim's `proposeAlliance` judges it: no alliance with one's own
 * overlord, none with a puppet (its overlord makes its alliances), none with a nation in an alliance
 * (one's own: already allies). A war between them is the standing's (`war`).
 */
export function allyWhy(a: number, b: number, of: (id: number) => Who | undefined): string {
  const me = of(a);
  const them = of(b);
  if (!me || !them || a === b) return '';
  if (me.overlord === b) return t('alliance.why.overlord');
  if (them.overlord !== 0) return t('alliance.why.puppet');
  if (them.alliance) return t(them.alliance.id === me.alliance?.id ? 'refusal.allied' : 'refusal.inAlliance');
  return '';
}

/** The standing of `b` with `a` (ids); `of` a nation's stats by id, `wars` the world's. */
export function standingOf(a: number, b: number, of: (id: number) => Who | undefined, wars: readonly Pick<WarStat, 'attackers' | 'defenders'>[]): Standing {
  const side = (x: number, y: number): boolean => wars.some((w) => (w.attackers.includes(x) && w.attackers.includes(y)) || (w.defenders.includes(x) && w.defenders.includes(y)));
  const me = of(a);
  const them = of(b);
  // A bond's standing says too that the two fight on one side (PLAN 7.192, critic run 26's 2).
  const shared = !!me && !!them && (side(a, b) || (them.overlord !== 0 && side(a, them.overlord)));
  const at = (kind: StandingKind, bond: boolean, days = 0): Standing => (bond && kind !== 'truce' && shared ? { kind, days, bond, beside: true } : { kind, days, bond });
  if (!me || !them) return at('neutral', false);
  if (wars.some((w) => (w.attackers.includes(a) && w.defenders.includes(b)) || (w.defenders.includes(a) && w.attackers.includes(b)))) return at('war', false);
  if (them.overlord === a) return at('puppet', true);
  if (me.overlord === b) return at('overlord', true);
  const allied = (x: number, y: number): boolean => {
    const ax = of(x)?.alliance?.id;
    return ax !== undefined && ax === of(y)?.alliance?.id;
  };
  if (allied(a, b)) return at('allied', true);
  const [ra, rb] = [me.overlord || a, them.overlord || b];
  if (ra === rb || allied(ra, rb) || allied(a, rb) || allied(ra, b)) return at('realm', true);
  if (side(a, b) || (them.overlord !== 0 && side(a, them.overlord))) return at('beside', false);
  const truce = me.truces.find((t) => t.with === b || (them.overlord !== 0 && t.with === them.overlord));
  if (truce) return at('truce', true, truce.days);
  return at('neutral', false);
}

/** A standing in words: "Allied", "Truce (12 days)", "Allied · fights beside you". */
export function standingText(s: Standing): string {
  if (s.kind === 'truce') return t(s.days === 1 ? 'standing.truce.one' : 'standing.truce', { n: s.days });
  const text = t(`standing.${s.kind}`);
  return s.beside ? t('standing.andBeside', { s: text }) : text;
}

/** Why the enemy would refuse peace (PLAN 7.175c: the right-click menu's "Offer peace" title); '' when accepted. */
export function peaceWhy(v: PeaceVerdict): string {
  if (v.why === 'death') return t('peace.refused.death');
  if (v.why === 'lead') {
    // Never at the bar while under it (ROADMAP R57e; critic run 58: 39.97 read "40 of 40", refused): the lead shown
    // below the score needed; the weariness worded as over the bar needed, true at the bar too.
    const lead = Math.min(Math.round(v.lead), PEACE_ACCEPT_SCORE - 1) || 0;
    return t('peace.refused.lead', { need: PEACE_ACCEPT_SCORE, lead: `${lead >= 0 ? '+' : ''}${lead}`, worn: Math.round(v.exhaustion), bar: PEACE_ACCEPT_EXHAUSTION });
  }
  return '';
}
