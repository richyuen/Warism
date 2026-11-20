/**
 * Why a world of few nations keeps the peace (ROADMAP R216, ADR-1145; critic run 89, R89-N1: three of six three-nation
 * random worlds had no war in ten years, and the page said nothing of it). ADR-1129 keeps the rules: two or three of
 * near-equal strength may keep the peace. This tells it, by the strategic AI's own terms (`strategicAi`), asked of each
 * realm with its restlessness at the cap (RESTLESS: ten years of peace), so that a reason given does not turn false as
 * the years pass. When one realm would declare even so (its target chosen and not refused, or a war it prepares, or a
 * target barred for a year that it would choose again), no reason is given: the peace is for now.
 *
 * A pure read: no state of the world is written (the bars of `World.massBarred` are read here, not through `unprepared`,
 * which forgets those past their day), and nothing is drawn. Asked by the worker for the page's stats only while the
 * world has no war and FEW_REALMS realms or fewer.
 */
import { Refusal } from '../../shared/commands';
import type { PeaceReason, PeaceWhy } from '../../shared/protocol';
import { whyNotWar } from '../systems/war';
import type { World } from '../world';
import { AiLayer, aiRuns } from './layers';
import {
  acrossSea, blocsOf, DECLARE_AT, deterred, firstNotOutnumbered, homeByLand, neighbourMap, outnumbered,
  PACIFIST_BELOW, RESTLESS, SEA_REACH_KM, seaPowers, seaTargetKm, sides, strengths, warTarget, warUtility,
} from './strategic';

/** A world of this many realms (living nations that are no puppet) or fewer is one of few nations (ADR-1129's two or three). */
export const FEW_REALMS = 3;

/** The peace of a world of few nations and why (`PeaceWhy`); null for a world at war or of more realms (or one). */
export function peaceWhy(world: World): PeaceWhy | null {
  if (world.wars.size > 0) return null;
  const nc = world.nations.cols;
  const realms: number[] = [];
  world.nations.forEach((n) => {
    if (nc.living[n] === 1 && nc.overlord[n] === 0) realms.push(n);
  });
  if (realms.length < 2 || realms.length > FEW_REALMS) return null;
  const day = Math.floor(world.tick / 24);
  const nb = neighbourMap(world);
  const str = strengths(world);
  const { withAllies, defence } = sides(world, str);
  const blocs = world.track?.ended && world.warheads.size > 0 ? blocsOf(world, str) : new Set<number>();
  const powers = seaPowers(world, str);
  const rows: PeaceWhy['rows'] = [];
  let why = true;
  const row = (n: number, reason: PeaceReason, t = 0): void => {
    rows.push({ n, reason, t });
  };
  for (const n of realms) {
    if (!world.settings.aiEnabled || !aiRuns(world, n, AiLayer.diplomacy)) {
      row(n, 'aiOff');
      continue;
    }
    // A war prepared (R97b): its own secret until seen (ADR-1107), and one it may yet declare.
    if (world.massing.has(n)) {
      why = false;
      continue;
    }
    if (nc.aggression[n]! < PACIFIST_BELOW) {
      row(n, 'pacifist');
      continue;
    }
    if (nc.gold[n]! < 0 || nc.bankrupt[n] === 1) {
      row(n, 'broke');
      continue;
    }
    const neighbours = [...(nb.get(n) ?? [])].sort((a, b) => a - b);
    const barred = new Set<number>();
    for (const t of neighbours) {
      const until = world.massBarred.get(n * 65536 + t);
      if (until !== undefined && day < until) barred.add(t);
    }
    const home = homeByLand(world, n);
    const atHome = (t: number): boolean => home === null || home.has(t);
    const attack = withAllies(n);
    const pick = (refused: ReadonlySet<number>): number => warTarget(world, n, neighbours, attack, defence, 0, RESTLESS, blocs, powers, new Set([...barred, ...refused]));
    const best = pick(new Set());
    if (best !== 0) {
      // Chosen: declared unless the pile of realms or the want of a lift refuses it and every one after it.
      const t = firstNotOutnumbered(world, n, (refused) => (refused.size === 0 ? best : pick(refused)), (x) => acrossSea(world, n, x, (d) => neighbours.includes(d), atHome));
      if (t !== 0) why = false;
      else row(n, outnumbered(world, n, best) ? 'outnumbered' : 'noLift', best);
      continue;
    }
    // None over the bar: of those it may weigh (its neighbours and those it could land on), the best by its utility.
    const reach = seaTargetKm(world, n, powers.has(n) ? Infinity : SEA_REACH_KM);
    const among = [...new Set([...neighbours, ...reach.keys()])].filter((t) => t !== n && nc.living[t] === 1).sort((a, b) => a - b);
    let [bestT, bestU, boundT, allied, mayYet] = [0, -Infinity, 0, false, false];
    for (const t of among) {
      const refusal = whyNotWar(world, n, t);
      if (refusal !== Refusal.None || deterred(world, n, t, blocs)) {
        boundT ||= t;
        allied ||= refusal === Refusal.Allied;
        continue;
      }
      const u = warUtility(world, n, t, attack, defence(t), 0, RESTLESS).u;
      // Barred for a year after a massing given up: chosen again once the bar is past.
      if (barred.has(t)) {
        mayYet ||= u > DECLARE_AT;
        continue;
      }
      if (u > bestU) [bestU, bestT] = [u, t];
    }
    if (mayYet) why = false;
    else if (bestT !== 0) row(n, bestU > DECLARE_AT ? 'far' : 'equal', bestT);
    else if (boundT !== 0) row(n, allied ? 'allied' : 'bound', boundT);
    else row(n, 'far');
  }
  return why ? { why, rows } : { why, rows: [] };
}
