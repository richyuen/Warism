/**
 * A nation's traits (`data/traits/traits.json`, ROADMAP R16): kept as a bit mask in the nation
 * table's `traits` column, bit i the i-th trait of the file. The scenario sets them, or the
 * random traits option, or God Mode (`setTraits`); a rebel, a spawned nation and a reused id start
 * with none, a revived nation keeps its own.
 */
import traitsJson from '../../data/traits/traits.json' with { type: 'json' };

export interface TraitInfo {
  id: string;
  nameKey: string;
  descKey: string;
  modifiers: Readonly<Record<string, number>>;
  aggressionBias: number;
  excludes: readonly string[];
}

export const TRAITS: readonly TraitInfo[] = traitsJson.traits as unknown as TraitInfo[];
/** Every mask a nation may hold lies below this. */
export const TRAIT_MASK_END = 1 << TRAITS.length;

/** The mask of the traits named (an unknown id is ignored). */
export function traitMask(ids: readonly string[]): number {
  let m = 0;
  TRAITS.forEach((t, i) => {
    if (ids.includes(t.id)) m |= 1 << i;
  });
  return m;
}

/** The traits of a mask, in the file's order. */
export function traitsOf(mask: number): TraitInfo[] {
  return TRAITS.filter((_, i) => (mask & (1 << i)) !== 0);
}

/** Whether two traits of the mask exclude each other (militarist and pacifist). */
export function traitsClash(mask: number): boolean {
  const held = traitsOf(mask);
  return held.some((a) => held.some((b) => a !== b && a.excludes.includes(b.id)));
}

/** The sum of a modifier over the mask's traits, added in the order the traits are given. */
export function traitSum(traits: readonly TraitInfo[], key: string): number {
  return traits.reduce((s, t) => s + (t.modifiers[key] ?? 0), 0);
}

const sums = new Map<number, Readonly<Record<string, number>>>();

/** Every modifier of a mask summed (cached by mask; the traits are fixed data). */
export function traitMods(mask: number): Readonly<Record<string, number>> {
  let m = sums.get(mask);
  if (!m) {
    const held = traitsOf(mask);
    const out: Record<string, number> = {};
    for (const t of held) for (const k of Object.keys(t.modifiers)) out[k] = traitSum(held, k);
    sums.set(mask, (m = out));
  }
  return m;
}

/** What an order priced `gold` costs a nation of these traits: ÷ (1 + industry) (ROADMAP R16b). */
export function priceWith(mask: number, gold: number): number {
  return gold / Math.max(0.05, 1 + (traitMods(mask).industry ?? 0));
}

/** An order's training days for a nation of these traits: ÷ (1 + buildSpeed), at least a day (ROADMAP R16b). */
export function daysWith(mask: number, days: number): number {
  return Math.max(1, Math.ceil(days / Math.max(0.05, 1 + (traitMods(mask).buildSpeed ?? 0))));
}
