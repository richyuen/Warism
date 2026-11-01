/**
 * Whether a side's offer of peace is accepted (PLAN 1.33b; PLAN 7.175c, ADR-780): the rule of the
 * sim's `offerPeace` and of the right-click menu's "Offer peace", which is greyed out while the
 * enemy would refuse. One rule, so the menu and the sim cannot disagree.
 */

/** Player peace offers (PLAN 1.33b) are accepted when the offering side leads by this score… */
export const PEACE_ACCEPT_SCORE = 25;
/** …or the other side's exhaustion exceeds this (the AI's stalemate threshold). */
export const PEACE_ACCEPT_EXHAUSTION = 40;

export interface PeaceVerdict {
  accepted: boolean;
  /** Why not: the enemy fights to the death, or the lead is short and the enemy not worn out; '' when accepted. */
  why: '' | 'death' | 'lead';
  /** The offering side's lead in the war score (negative behind). */
  lead: number;
  /** The enemy's exhaustion. */
  exhaustion: number;
}

/**
 * The verdict on an offer of `side` (0 the attackers, 1 the defenders) in a war of `score` (the
 * attackers' lead), `exhaustion` and `toDeath` by side.
 */
export function peaceVerdict(score: number, exhaustion: readonly [number, number], toDeath: readonly [boolean, boolean], side: 0 | 1): PeaceVerdict {
  const other = 1 - side;
  const lead = side === 0 ? score : -score;
  const worn = exhaustion[other]!;
  if (toDeath[other]) return { accepted: false, why: 'death', lead, exhaustion: worn };
  if (lead < PEACE_ACCEPT_SCORE && worn <= PEACE_ACCEPT_EXHAUSTION) return { accepted: false, why: 'lead', lead, exhaustion: worn };
  return { accepted: true, why: '', lead, exhaustion: worn };
}
