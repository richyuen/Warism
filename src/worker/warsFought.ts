/**
 * Which wars have had a battle in the last days (ROADMAP R132; critic run 75, R75-N1): the banners' order. A war's
 * `battle` (`warsWithBattle`: formations of its two sides in contact) goes on and off by the hour, and R130's order by
 * it made the row change places every second or two at ×5. A war that fought within `FOUGHT_TICKS` keeps its place.
 *
 * Kept by the worker from the stats it builds, not by the sim: no state of the world, no part of a save. A load, a new
 * world or a tick that goes back starts it again (the first stats after it see only the battles of their hour).
 */
import type { World } from '../sim/world';

/** Ten days of hours: a war with a battle in them is a fought war on the banners (three left 57901's row changing 24 times a minute at ×5: its wars fight in bursts some days apart). */
export const FOUGHT_TICKS = 10 * 24;

export class WarsFought {
  private world: World | null = null;
  private tick = -1;
  /** The last tick each war was seen with a battle. */
  private readonly last = new Map<number, number>();

  /**
   * The wars of `world` (`ids`) with a battle now (`fighting`) or within `FOUGHT_TICKS` before `world.tick`. Wars
   * that are over are forgotten.
   */
  of(world: World, ids: readonly number[], fighting: ReadonlySet<number>): Set<number> {
    if (world !== this.world || world.tick < this.tick) {
      this.world = world;
      this.last.clear();
    }
    this.tick = world.tick;
    const live = new Set(ids);
    for (const id of [...this.last.keys()]) if (!live.has(id)) this.last.delete(id);
    const out = new Set<number>();
    for (const id of ids) {
      if (fighting.has(id)) this.last.set(id, world.tick);
      const at = this.last.get(id);
      if (at !== undefined && world.tick - at <= FOUGHT_TICKS) out.add(id);
    }
    return out;
  }
}
