/**
 * ROADMAP R33b: the landing tests' reads of the player's landings (`src/sim/systems/landings.ts`), for what
 * they read before from per-division maps (`seaFetch`: the group a division was bound for; `convoyPort`: a
 * group's convoy and its port). A division's "transports" are now its landing: one it keeps is the same
 * landing (`landingId`).
 */
import { LandingState, landingOfDivision, landingOfFleet } from '../../src/sim/systems/landings';
import type { World } from '../../src/sim/world';

/** The id of the landing division `id` is in; undefined for none. */
export const landingId = (w: World, id: number): number | undefined => landingOfDivision(w, id)?.id;

/** Whether division `id` is in a landing and not aboard (marching to its port, or waiting there). */
export const isBound = (w: World, id: number): boolean => landingOfDivision(w, id) !== undefined && !w.embarked.has(id);

/** The first transport group of division `id`'s landing; undefined for none. */
export const groupOf = (w: World, id: number): number | undefined => landingOfDivision(w, id)?.fleets[0];

/** The port (index in `ports`) of division `id`'s landing; undefined for none. */
export const portOf = (w: World, id: number): number | undefined => landingOfDivision(w, id)?.port;

/** Whether transport group `fleet` is a landing's. */
export const hasLanding = (w: World, fleet: number): boolean => landingOfFleet(w, fleet) !== undefined;

/** Whether division `id` stands at its landing's port (ashore, or aboard while it gathers): R33b's "at the port", before, "aboard". */
export function atItsPort(w: World, id: number): boolean {
  const l = landingOfDivision(w, id);
  return l !== undefined && l.state === LandingState.gathering && w.formations.cols.moving[id] !== 1;
}

/** Whether division `id` is aboard its landing's transports at sea (the landing sailed). */
export function atSea(w: World, id: number): boolean {
  const l = landingOfDivision(w, id);
  return l !== undefined && l.state !== LandingState.gathering && w.embarked.has(id);
}
