/**
 * Which of a snapshot's formations are on an advance (ROADMAP R96, R235, R241; ADR-1088, ADR-1162, ADR-1165): the
 * marches the view draws as bold arrows, for every viewer (`FormationFlag.advancing`), and the cell each presses on:
 * where its arrow ends.
 *
 * Asked here, of the world, since R235. Whether land an enemy holds can be taken today is the sim's to say
 * (`World.holdsLand`, the territory system's own question): a front the historical track holds is taken by no one,
 * but in the days and on the land of one of its stages. The view, which knows only who is at war, drew an advance
 * over every held front its marches' lines clipped: five German divisions at Strasbourg on 23 November 1939, each
 * under a bold arrow over the Rhine for three weeks without a step.
 *
 * By the march's route since R241 (the user, 2026-11-27: "the arrows in far zoom looked like they crossed far into
 * enemy territory, but at close zoom it looked like it was in held territory"). Until then by the line the view
 * draws, which for a march on land is straight from where it stands to its target: an arrow ran its 70 to 136 px
 * along that line at every zoom, 2 cells past the front at 1,000 m/px and 6 at 5,000 where it stayed in its own cell
 * at 60, and a march along a front that bends was an advance over land its route never entered. A march waits before
 * the first cell of its route that an enemy holds (PLAN 1.14): that cell is where it presses, and where its arrow
 * ends.
 */
import { ADVANCE_REACH_KM, pressesAt } from '../shared/advances';
import { Domain, type World } from '../sim/world';

/**
 * The formations of `ids` whose march is an advance, each with the cell it presses on: a land formation's, of a
 * nation at war, moving and not on the retreat, whose route within ADVANCE_REACH_KM (`kmPerCell`: the map's, as the
 * view's geometry has it) comes to a cell a nation at war with its own holds and it may take today (`pressesAt`). A
 * march whose route is not kept this hour (it is found again at its next step) is none.
 */
export function advancing(world: World, ids: readonly number[], kmPerCell: number): Map<number, number> {
  const c = world.formations.cols;
  const w = world.cells.w;
  const out = new Map<number, number>();
  const fighting = new Set<number>();
  for (const war of world.wars.list) if (war.sides[0].length > 0 && war.sides[1].length > 0) for (const side of war.sides) for (const n of side) fighting.add(n);
  if (fighting.size === 0) return out;
  const reach = ADVANCE_REACH_KM / kmPerCell;
  const holderOf = (cell: number): number => world.cells.controller[cell] ?? 0;
  const atWar = (a: number, b: number): boolean => world.wars.atWar(a, b);
  for (const id of ids) {
    const nation = c.nation[id]!;
    if (c.moving[id] !== 1 || c.retreat[id]! > 0) continue;
    if (!fighting.has(nation) || world.rules?.templates[c.template[id]!]?.domain !== Domain.land) continue;
    const path = world.paths.get(id);
    if (!path) continue;
    const k = pressesAt(path, c.pathStep[id]!, c.x[id]!, c.y[id]!, nation, w, reach, holderOf, atWar, (holder, cell) => !world.holdsLand(nation, holder, cell));
    if (k >= 0) out.set(id, path[k]!);
  }
  return out;
}
