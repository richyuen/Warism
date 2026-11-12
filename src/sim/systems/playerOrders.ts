/**
 * The player's direct orders (ADR-759, `World.playerOrders`): what the AI leaves alone, and when
 * that ends. Hourly, after the fights are found (`combatSystem` sets `engaged`), before the next
 * hour's AI and march:
 * - gone, or on the retreat (its march is the retreat's now): the order is over;
 * - a march (a formation's, a fleet's): over when it no longer marches, sails, waits to sail or is
 *   aboard: it has arrived, or its march ended. In a fight it was not given in, it is cancelled:
 *   the formation stops and fights (a march of the AI's only pauses). Given in a fight, it goes
 *   on through it (`through`, `movementSystem`) until the formation is first out of contact;
 * - a wing's rebase: over when the wing is at its new base (no ferry flight);
 * - a wing's mission: over after PLAYER_MISSION_HOURS, or when the mission is;
 * - the historical track's arrival kept for its stage (R66d): over at its stage (the AI has it from the opening of
 *   the stage's window of fighting, `playerHeld`; nobody disbands it before, R66e).
 * The AI has the formation back from the next hour, and may undo the order at once.
 * Nothing to do while there is no order: a world with no player is as it was.
 */
import { EventKind, RejectReason } from '../../shared/events';
import { PlayerOrderKind, type World } from '../world';
import { carrying } from './amphibious';
import { inLanding, landingOfDivision, leaveLanding } from './landings';

/** How long the AI leaves a wing's mission given by the player (hours). */
export const PLAYER_MISSION_HOURS = 24;

export function playerOrderSystem(world: World): void {
  if (world.playerOrders.size === 0) return;
  const c = world.formations.cols;
  for (const [id, o] of [...world.playerOrders].sort((a, b) => a[0] - b[0])) {
    if (!world.formations.has(id) || c.retreat[id]! > 0) {
      world.playerOrders.delete(id);
      continue;
    }
    if (o.kind === PlayerOrderKind.mission) {
      if (world.tick >= o.until || !world.wingMission.has(id)) world.playerOrders.delete(id);
      continue;
    }
    // The historical track's arrivals, kept for their stage (R66d, ADR-976): the order over at the stage.
    if (o.kind === PlayerOrderKind.kept) {
      if (world.tick >= o.until) world.playerOrders.delete(id);
      continue;
    }
    if (o.kind === PlayerOrderKind.rebase) {
      if (!world.wingFerry.has(id)) world.playerOrders.delete(id);
      continue;
    }
    // A division of a landing is the player's while it is (ROADMAP R33b): waiting at its port, the AI leaves it be.
    if (c.moving[id] !== 1 && !world.embarked.has(id) && !world.seaBound.has(id) && !world.afloat(id) && landingOfDivision(world, id) === undefined) {
      world.playerOrders.delete(id);
      continue;
    }
    // Transports a landing called or held, standing with no landing and nobody aboard (ROADMAP R31d; critic run
    // 41, R41-N1: called for a division that then went to another port's, they stood empty at Tokyo for a month):
    // the AI's again. A fleet the player ordered keeps its order while afloat, that is always (R33d; critic run
    // 43, R43-N1: transports clicked onto the Channel were the AI's the hour they came).
    if (o.kind === PlayerOrderKind.called && c.moving[id] !== 1 && !inLanding(world, id) && !carrying(world, id)) {
      world.playerOrders.delete(id);
      continue;
    }
    if (c.engaged[id] !== 1) {
      o.through = false;
    } else if (!o.through) {
      // Waiting at its landing's port: it keeps its landing, which waits for it (ROADMAP R33b).
      const l = landingOfDivision(world, id);
      if (l && c.moving[id] !== 1) continue;
      // Contact on the way: the order is cancelled, and the formation stands and fights; the
      // player is told (`MoveRejected`, as a refused order).
      c.moving[id] = 0;
      c.home[id] = 0;
      world.paths.delete(id);
      world.seaBound.delete(id);
      if (l) leaveLanding(world, id);
      world.playerOrders.delete(id);
      world.out.emit(world.tick, EventKind.MoveRejected, id, c.nation[id]!, RejectReason.Contact, NaN);
    }
  }
}
