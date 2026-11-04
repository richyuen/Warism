/**
 * Sets a nation's traits (ROADMAP R16; `src/shared/traits.ts`): the mask, and the income and
 * manpower multipliers that come of it. Aggression is left as it is: a scenario sets it with its
 * traits in mind, and God Mode has its own control of it (the random traits option alone adds the
 * traits' bias).
 */
import { traitMods, traitsOf, traitSum } from '../shared/traits';
import type { World } from './world';

export function applyTraits(world: World, n: number, mask: number): void {
  const nc = world.nations.cols;
  const held = traitsOf(mask);
  nc.traits[n] = mask;
  nc.incomeMult[n] = 1 + traitSum(held, 'income');
  nc.manpowerMult[n] = 1 + traitSum(held, 'manpower');
}

/** A modifier of nation `n`'s traits (0 when none has it; ROADMAP R16b). */
export function traitMod(world: World, n: number, key: TraitKey): number {
  return traitMods(world.nations.cols.traits[n] ?? 0)[key] ?? 0;
}

/** The modifiers that act (ADR-822): each read where its rule is. */
export type TraitKey =
  | 'landAttack'
  | 'landDefense'
  | 'armorAttack'
  | 'navalAttack'
  | 'airAttack'
  | 'airDefense'
  | 'warExhaustion'
  | 'stability'
  | 'revoltSuppression'
  | 'research'
  | 'buildSpeed'
  | 'org'
  | 'fortStrength'
  | 'industry';
