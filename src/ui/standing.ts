/**
 * A nation's standing with the played one (PLAN 7.175b, ADR-780): what the right-click menu and
 * the Actions tab say of it, and whether a war on it would break a bond (the button reads "Force
 * war"). Read from the statistics message as the sim's `whyNotWar` and `bond` read the world: at
 * war, one the other's puppet, allies, one overlord's puppets or allied realms, a truce.
 */
import type { NationStat, WarStat } from '../shared/protocol';
import { t } from './i18n';

export type StandingKind = 'war' | 'puppet' | 'overlord' | 'allied' | 'realm' | 'truce' | 'neutral';

export interface Standing {
  kind: StandingKind;
  /** The days of the truce left (`truce`), else 0. */
  days: number;
  /** Whether a bond stands in a war's way: `forceWar` would break it. */
  bond: boolean;
}

export type Who = Pick<NationStat, 'id' | 'overlord' | 'alliance' | 'truces'>;

/** The standing of `b` with `a` (ids); `of` a nation's stats by id, `wars` the world's. */
export function standingOf(a: number, b: number, of: (id: number) => Who | undefined, wars: readonly Pick<WarStat, 'attackers' | 'defenders'>[]): Standing {
  const at = (kind: StandingKind, bond: boolean, days = 0): Standing => ({ kind, days, bond });
  const me = of(a);
  const them = of(b);
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
  const truce = me.truces.find((t) => t.with === b || (them.overlord !== 0 && t.with === them.overlord));
  if (truce) return at('truce', true, truce.days);
  return at('neutral', false);
}

/** A standing in words: "Allied", "Truce (12 days)". */
export function standingText(s: Standing): string {
  if (s.kind === 'truce') return t(s.days === 1 ? 'standing.truce.one' : 'standing.truce', { n: s.days });
  return t(`standing.${s.kind}`);
}
