/**
 * Why a world of few nations keeps the peace (ROADMAP R216, ADR-1145; critic run 89, R89-N1: three of six three-nation
 * random worlds had no war in ten years, and the page said nothing of it). ADR-1129 keeps the rules: two or three of
 * near-equal strength may keep the peace. This tells it, by the strategic AI's own terms (`strategicAi`), asked of each
 * realm with its restlessness at the cap (RESTLESS: ten years of peace), so that a reason given does not turn false as
 * the years pass. When one realm would declare even so (its target chosen and not refused, or a war it prepares, or a
 * target barred for a year that it would choose again), no reason is given: the peace is for now. So too, in every
 * branch (R219, critic run 90's R90-B1), when what holds it today ends before the cap: a lift on its way (no transport
 * group at a port, and one in training, at sea, or one it orders at peace, `landlessPowers`: its reach grows; 90441 told
 * "no rival within its reach" to day 90, its transports at port on day 91, war on day 98), or a truce (TRUCE_TICKS, two
 * years) with a rival it would fight once the truce is out (89401: the truce with 2 days left read as a bond and the
 * next rival named, war on the truce's party 7 days on).
 *
 * A pure read: no state of the world is written (the bars of `World.massBarred` are read here, not through `unprepared`,
 * which forgets those past their day), and nothing is drawn. Asked by the worker for the page's stats only while the
 * world has no war and FEW_REALMS realms or fewer.
 */
import { Refusal } from '../../shared/commands';
import { EventKind } from '../../shared/events';
import { isDayStart } from '../../shared/calendar';
import { PEACE_ORDER, peaceHeadline, type PeaceReason, type PeaceWhy } from '../../shared/protocol';
import { HISTORY_STRIDE } from '../history';
import { bond, whyNotWar } from '../systems/war';
import type { World } from '../world';
import { transportGroupsAtPort, transportRoom } from '../systems/amphibious';
import { landlessPowers } from './economic';
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
  let landless: Set<number> | undefined;
  const row = (n: number, reason: PeaceReason, t = 0): void => {
    rows.push({ n, reason, t });
  };
  /**
   * Whether `n`'s lift is on its way (R219; R217 for `noLift` alone): no transport group of its at a port, and one in
   * training, one at sea (a fleet with room), or a sea power that orders one at peace (`landlessPowers`, R85e: 89414's
   * nation 1 told "no lift" to day 90, at war on day 98).
   */
  const liftComing = (n: number): boolean => {
    if (transportGroupsAtPort(world, n).length > 0) return false;
    if ((landless ??= landlessPowers(world)).has(n)) return true;
    const rules = world.rules;
    let coming = false;
    world.production.forEach((id) => {
      if (coming || world.production.cols.nation[id] !== n) return;
      coming = rules?.templates[world.production.cols.template[id]!]?.elements.some((e) => rules.units[e.unit]?.cls === 'tp') === true;
    });
    if (!coming)
      world.formations.forEach((id) => {
        if (!coming && world.formations.cols.nation[id] === n && world.isFleet(id) && transportRoom(world, id) > 0) coming = true;
      });
    return coming;
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
    // A lift on its way (R219): its reach, and every reason read from it, is about to change.
    if (liftComing(n)) {
      why = false;
      continue;
    }
    const neighbours = [...(nb.get(n) ?? [])].sort((a, b) => a - b);
    const reach = seaTargetKm(world, n, powers.has(n) ? Infinity : SEA_REACH_KM);
    // A rival held off only by a truce (R219): out within two years, before the cap; one it would fight then is a war to come.
    const truced = [...new Set([...neighbours, ...reach.keys()])].some(
      (t) => t !== n && nc.living[t] === 1 && whyNotWar(world, n, t) === Refusal.Truce && bond(world, n, t) === Refusal.None && !deterred(world, n, t, blocs) && warUtility(world, n, t, withAllies(n), defence(t), 0, RESTLESS).u > DECLARE_AT,
    );
    if (truced) {
      why = false;
      continue;
    }
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

/**
 * A world of few nations at peace gives its reason to History (ROADMAP R222, ADR-1149; critic run 90's R90-N2: a world
 * kept at peace ten years held two events, its reasons only in the line): `PeaceHeld` on a day start when the peace
 * line's headline (`peaceHeadline` of `peaceWhy`) is given and is not the one last told since the world's last war.
 * Nothing in a world at war or of more than FEW_REALMS realms (`peaceWhy` null: 1938 never). Run after the strategic AI
 * in the same system (`sim.ts`): a war it declares that hour is told, not a peace.
 */
export function notePeace(world: World): void {
  // The strategic AI's day (`strategicAi`): its reasons are that AI's.
  if (!world.settings.aiEnabled || !isDayStart(world.tick) || world.steered || world.wars.size > 0) return;
  const top = peaceHeadline(peaceWhy(world));
  if (!top) return;
  const code = PEACE_ORDER.indexOf(top.reason);
  const rows = world.history.rows;
  for (let i = rows.length - HISTORY_STRIDE; i >= 0; i -= HISTORY_STRIDE) {
    const kind = rows[i + 1];
    if (kind === EventKind.WarDeclared) break;
    if (kind === EventKind.PeaceHeld) {
      if (rows[i + 2] === code) return;
      break;
    }
  }
  world.out.emit(world.tick, EventKind.PeaceHeld, code, top.count, NaN, NaN);
}
