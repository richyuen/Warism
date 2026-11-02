/**
 * Heroes (PLAN 7.184, the user's request of 2026-11-01): on the new-game option `heroes`, each of
 * seven great powers of 1938 has a named land and sea unit, much stronger than any other: a
 * formation of one element of its own unit type (`TemplateRule.hero`), never built, queued or
 * placed by God.
 *
 * The roster (`World.heroRoster`) is the world's: each row a hero's nation, template and start
 * place (cells). `World.heroes` maps a hero's formation to its row. Both are state, saved while
 * there is one. A hero's formation is never disbanded, laid up, folded into another or refilled
 * by the economic AI, and its template has no upkeep.
 */
import { equipFormation } from './elements';
import type { World } from '../world';

/** A hero of the roster: its nation, its template (index of the rules) and its start place (cells). */
export interface HeroRow {
  nation: number;
  template: number;
  x: number;
  y: number;
}

/** Whether formation `id` is a hero's. */
export function isHero(world: World, id: number): boolean {
  return world.heroes.has(id);
}

/**
 * Sets the roster and raises each row's hero at its place, whole and in supply (the start's; a
 * land hero's place is on land, a sea hero's on water: the caller's). Returns the formations, in
 * the roster's order.
 */
export function placeHeroes(world: World, roster: readonly HeroRow[]): number[] {
  world.heroRoster = roster.map((r) => ({ ...r }));
  world.heroes = new Map();
  world.formations.reserve(world.formations.count + roster.length);
  const ids: number[] = [];
  roster.forEach((r, row) => ids.push(raiseHero(world, row, r.x, r.y)));
  return ids;
}

/** Raises the hero of roster row `row` at (x, y), whole and in supply. */
export function raiseHero(world: World, row: number, x: number, y: number): number {
  const r = world.heroRoster[row]!;
  const f = world.formations.cols;
  const id = world.formations.create();
  f.nation[id] = r.nation;
  f.x[id] = x;
  f.y[id] = y;
  f.facing[id] = 0;
  f.template[id] = r.template;
  f.supply[id] = 1;
  f.org[id] = 1;
  equipFormation(world, id, r.template); // sets strength from the element
  world.heroes.set(id, row);
  return id;
}
