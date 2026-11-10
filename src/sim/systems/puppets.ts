/**
 * Puppets with autonomy (SPEC §3.5, PLAN 1.18). A puppet has an overlord (`nations.overlord`),
 * autonomy 0..100, loyalty 0..100 and integration progress 0..100. Tiers by autonomy:
 * satellite < SATELLITE_BELOW ≤ puppet < VASSAL_FROM ≤ vassal.
 *
 * Monthly (00:00 of day 1), for every living puppet, in nation-id order:
 *  1. Leaves freely when autonomy > FREE_ABOVE (`PuppetReleased`).
 *  2. Revolts when loyalty < REVOLT_LOYALTY and autonomy ≥ PROTEST_FROM: the bond is cut, it
 *     leaves the wars it fought beside its overlord and, if it shares an alliance with its
 *     overlord's realm, that alliance; then it declares a war of independence on its overlord
 *     (`PuppetRevolt`).
 *  3. Pays tribute: TRIBUTE × (1 − autonomy/100) × last month's gross income, in gold.
 *  4. Integrates when autonomy < INTEGRATE_BELOW: progress += INTEGRATION_RATE ×
 *     (INTEGRATE_BELOW − autonomy)/INTEGRATE_BELOW; at 100 the overlord annexes all its land,
 *     takes its formations and cores, and the puppet ends (`PuppetIntegrated`).
 *  5. Autonomy drifts up by AUTONOMY_DRIFT (puppets drift toward independence), and loyalty
 *     relaxes by LOYALTY_PULL toward loyaltyTarget: LOYALTY_BASE + LOYALTY_PER_AUTONOMY ×
 *     autonomy (freer subjects are content), minus, while the overlord is losing a war (its
 *     side's score ≤ −LOSING_SCORE), LOSING_PENALTY + SIZE_PENALTY × min(1, the puppet's gross
 *     income ÷ its overlord's): a beaten master is despised most by the subjects as rich as
 *     itself (ROADMAP R2, ADR-807). Revolts therefore need a push: a losing overlord with a
 *     great subject, or God Mode. At peace the target is ADR-31's alone.
 */
import { isMonthStart } from '../../shared/calendar';
import { EventKind } from '../../shared/events';
import { FlipCause, type World } from '../world';
import { eliminateNation } from './capitals';
import { Refusal } from '../../shared/commands';
import { leaveAlliance } from './alliances';
import { declareWar, leaveBondedWars, leaveWarsBeside, whyNotWar } from './war';

export const SATELLITE_BELOW = 30;
export const VASSAL_FROM = 70;
export const FREE_ABOVE = 90;
export const PROTEST_FROM = 10;
export const REVOLT_LOYALTY = 20;
export const TRIBUTE = 0.25;
export const INTEGRATE_BELOW = 50;
export const INTEGRATION_RATE = 4;
export const AUTONOMY_DRIFT = 0.25;
export const LOYALTY_PULL = 0.2;
export const LOYALTY_BASE = 40;
export const LOYALTY_PER_AUTONOMY = 0.6;
export const LOSING_PENALTY = 25;
export const LOSING_SCORE = 30;
export const SIZE_PENALTY = 25;

/** Loyalty a puppet relaxes toward (see the module comment). */
export function loyaltyTarget(world: World, puppet: number): number {
  const nc = world.nations.cols;
  const o = nc.overlord[puppet]!;
  let losing = false;
  for (const war of world.wars.list) {
    const side = war.sides[0].includes(o) ? 1 : war.sides[1].includes(o) ? -1 : 0;
    if (side !== 0 && side * war.score <= -LOSING_SCORE) losing = true;
  }
  const base = LOYALTY_BASE + LOYALTY_PER_AUTONOMY * nc.autonomy[puppet]!;
  if (!losing) return base;
  // The subject's weight beside its master's, by last month's gross income (as tribute reads it).
  const size = Math.min(1, Math.max(0, nc.income[puppet]!) / Math.max(1, nc.income[o]!));
  return base - LOSING_PENALTY - SIZE_PENALTY * size;
}

export type PuppetTier = 'satellite' | 'puppet' | 'vassal';
export function puppetTier(autonomy: number): PuppetTier {
  return autonomy < SATELLITE_BELOW ? 'satellite' : autonomy < VASSAL_FROM ? 'puppet' : 'vassal';
}

/**
 * Makes `subject` a puppet of `overlord` (peace terms, God Mode). Returns false if invalid. A realm
 * has one head (ADR-810; the scenario refuses a puppet of a puppet, ADR-148): a puppet's peace makes
 * the loser its overlord's puppet, and the subject's own puppets pass to that overlord with it, as
 * an annexation's do. Before, Turkey made a Soviet puppet kept Bulgaria under it (seed 1009).
 */
export function makePuppet(world: World, overlord: number, subject: number, autonomy: number): boolean {
  const nc = world.nations.cols;
  if (overlord === subject || !world.nations.has(overlord) || !world.nations.has(subject)) return false;
  if (nc.living[overlord] !== 1 || nc.living[subject] !== 1 || nc.overlord[overlord] === subject) return false;
  overlord = nc.overlord[overlord] || overlord;
  const handed: number[] = [];
  world.nations.forEach((p) => {
    if (nc.overlord[p] === subject && p !== overlord) handed.push(p);
  });
  for (const p of handed) nc.overlord[p] = overlord;
  nc.overlord[subject] = overlord;
  nc.autonomy[subject] = Math.max(0, Math.min(100, autonomy));
  nc.loyalty[subject] = LOYALTY_BASE + LOYALTY_PER_AUTONOMY * nc.autonomy[subject]!;
  nc.integration[subject] = 0;
  world.supplyDirty = true;
  world.out.emit(world.tick, EventKind.PuppetCreated, subject, overlord, NaN, NaN);
  // It does not go on fighting its overlord's realm or allies in another war (PLAN 3.8d); nor do its puppets.
  leaveBondedWars(world, subject);
  for (const p of handed) if (nc.living[p] === 1) leaveBondedWars(world, p);
  return true;
}

/** Frees a puppet (release is free, as in AoC). */
export function releasePuppet(world: World, subject: number, revolt = false, tell = true): void {
  const nc = world.nations.cols;
  const overlord = nc.overlord[subject]!;
  if (overlord === 0) return;
  nc.overlord[subject] = 0;
  nc.integration[subject] = 0;
  world.supplyDirty = true;
  if (tell) world.out.emit(world.tick, revolt ? EventKind.PuppetRevolt : EventKind.PuppetReleased, subject, overlord, NaN, NaN);
}

/** The overlord absorbs the puppet: land, formations; the puppet nation ends. */
export function integratePuppet(world: World, subject: number): void {
  const nc = world.nations.cols;
  const overlord = nc.overlord[subject]!;
  if (overlord === 0) return;
  annexInto(world, overlord, subject);
  world.out.emit(world.tick, EventKind.PuppetIntegrated, subject, overlord, NaN, NaN);
  nc.overlord[subject] = 0;
  eliminateNation(world, subject);
}

/**
 * Annexation (PLAN 1.36 editor and God): `annexer` takes `target`'s land, formations and cores;
 * its puppets become the annexer's; the target is eliminated (`NationAnnexed`). A puppet handed
 * over leaves the wars it fights against the annexer, its realm and its allies (PLAN 3.8d2).
 */
export function annexNation(world: World, annexer: number, target: number): boolean {
  const nc = world.nations.cols;
  if (annexer === target || !world.nations.has(annexer) || !world.nations.has(target) || nc.living[annexer] !== 1 || nc.living[target] !== 1) return false;
  annexInto(world, annexer, target);
  // To the head of the annexer's realm (ADR-810): a puppet that annexes holds no puppets of its own.
  const head = nc.overlord[annexer] || annexer;
  const handed: number[] = [];
  world.nations.forEach((p) => {
    if (nc.overlord[p] !== target) return;
    nc.overlord[p] = p === head ? 0 : head;
    if (p !== head) handed.push(p);
  });
  if (nc.overlord[target] !== 0) nc.overlord[target] = 0;
  // The blocs changed with no cell of the puppets changed (PLAN 3.12Rl): their land bore the mark
  // of the target's bloc on, and a loaded save, which refreshes in full, went on otherwise.
  if (handed.length > 0) world.supplyDirty = true;
  world.out.emit(world.tick, EventKind.NationAnnexed, target, annexer, NaN, NaN);
  eliminateNation(world, target);
  // After the target has left its wars: what is left of them is the puppets' own.
  for (const p of handed) if (nc.living[p] === 1) leaveBondedWars(world, p);
  return true;
}

/**
 * Moves `from`'s cells, formations and cores to `to`. A cell of `from`'s that a third nation
 * holds is that nation's, as at a death (ADR-112, ADR-269): before, it was `to`'s and the third
 * held it on with no war with its owner (seed 7: Hungary annexed Austria, 18 cells Italy held).
 * A third nation's cell `from` held is `to`'s where `to` is at war with its owner, else its
 * owner's (PLAN 5.8w2: seed 7, a revolt's Soviet land annexed by a nation at peace with it).
 */
function annexInto(world: World, to: number, from: number): void {
  const overlord = to;
  const subject = from;
  const { owner, controller } = world.cells;
  for (let c = 0; c < owner.length; c++) {
    const held = controller[c]!;
    if (owner[c] === subject) world.setOwner(c, held !== 0 && held !== subject && held !== overlord ? held : overlord);
    // A third nation's cell it held is the annexer's only where the annexer is at war with its
    // owner; else its owner's again (PLAN 5.8w2, as a cell taken with no war is, ADR-147).
    if (controller[c] === subject) {
      const o = owner[c]!;
      world.setController(c, o === 0 || o === overlord || world.wars.atWar(overlord, o) ? overlord : o, false, FlipCause.puppet);
    }
  }
  // A hero is its roster nation's (ROADMAP R9, ADR-812): it is not handed over, and goes with its
  // nation (`eliminateNation`, next), its row waiting for a revival, as at a conquest.
  const f = world.formations.cols;
  world.formations.forEach((id) => {
    if (f.nation[id] === subject && !world.heroes.has(id)) f.nation[id] = overlord;
  });
  // Integration makes the land rightfully the overlord's: its cores pass on (PLAN 1.24 review:
  // otherwise whole integrated colonies turned non-core and revolted together).
  const pv = world.provinces;
  for (let p = 1; p < pv.count; p++) if (pv.core[p] === subject) pv.core[p] = overlord;
}

export function puppetSystem(world: World): void {
  // The historical track's puppets are its timeline's (ROADMAP R62e): no drift, release or revolt of their own.
  if (!isMonthStart(world.startDay, world.tick) || world.steered) return;
  const nc = world.nations.cols;
  world.nations.forEach((n) => {
    const o = nc.overlord[n]!;
    if (o === 0 || nc.living[n] !== 1) return;
    if (nc.living[o] !== 1) {
      releasePuppet(world, n); // the overlord is gone: an old save's (a death frees them, ADR-174)
      return;
    }
    if (nc.autonomy[n]! > FREE_ABOVE) {
      releasePuppet(world, n);
      return;
    }
    if (nc.loyalty[n]! < REVOLT_LOYALTY && nc.autonomy[n]! >= PROTEST_FROM) {
      // Cut loose, told once the war is known (ROADMAP R40a).
      releasePuppet(world, n, true, false);
      // It leaves the wars it fought beside its overlord in, then rises (PLAN 7.191, R26-B1).
      leaveWarsBeside(world, n, [o]);
      // A puppet in its overlord's alliance (Tannu Tuva in the Soviet one) leaves it too: else the
      // war was refused as between allies, and the rising only freed it (ROADMAP R2, ADR-807).
      const why = whyNotWar(world, n, o);
      if (why === Refusal.Allied || why === Refusal.AlliedRealm) leaveAlliance(world, n);
      // A war refused (an overlord overrun: it fights no war of independence, ADR-229's note): it broke free, told
      // as a release, not a rising with no war (ROADMAP R40a; critic run 48, R48-B1: "rose against" and no war).
      const free = whyNotWar(world, n, o) !== Refusal.None;
      world.out.emit(world.tick, free ? EventKind.PuppetReleased : EventKind.PuppetRevolt, n, o, NaN, NaN);
      if (!free) declareWar(world, n, o, true);
      return;
    }
    const tribute = Math.max(0, TRIBUTE * (1 - nc.autonomy[n]! / 100) * nc.income[n]!);
    nc.gold[n] = nc.gold[n]! - tribute;
    nc.gold[o] = nc.gold[o]! + tribute;
    if (nc.autonomy[n]! < INTEGRATE_BELOW) {
      nc.integration[n] = Math.min(100, nc.integration[n]! + (INTEGRATION_RATE * (INTEGRATE_BELOW - nc.autonomy[n]!)) / INTEGRATE_BELOW);
      if (nc.integration[n]! >= 100) {
        integratePuppet(world, n);
        return;
      }
    }
    nc.autonomy[n] = Math.min(100, nc.autonomy[n]! + AUTONOMY_DRIFT);
    nc.loyalty[n] = nc.loyalty[n]! + LOYALTY_PULL * (loyaltyTarget(world, n) - nc.loyalty[n]!);
  });
}
