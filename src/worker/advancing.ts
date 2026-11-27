/**
 * Which of a snapshot's formations are on an advance (ROADMAP R96, R235; ADR-1088, ADR-1162): the marches the view
 * draws as bold arrows, for every viewer (`FormationFlag.advancing`).
 *
 * Asked here, of the world, since R235. Whether land an enemy holds can be taken today is the sim's to say
 * (`World.holdsLand`, the territory system's own question): a front the historical track holds is taken by no one,
 * but in the days and on the land of one of its stages. The view, which knows only who is at war, drew an advance
 * over every held front its marches' lines clipped: five German divisions at Strasbourg on 23 November 1939, each
 * under a bold arrow over the Rhine for three weeks without a step.
 */
import { ADVANCE_REACH_KM, advances } from '../shared/advances';
import { Domain, type World } from '../sim/world';

/**
 * The formations of `ids` whose march is an advance: a land formation's, of a nation at war, moving and not on the
 * retreat, along its order's line as the view draws it (`wayOf` its way in the snapshot, cells by twos from where it
 * stands; with fewer than two points, straight to its target's cell, the copy nearest it on a world that wraps),
 * within ADVANCE_REACH_KM (`kmPerCell`: the map's, as the view's geometry has it) over land a nation at war with its
 * own holds and it may take there today.
 */
export function advancing(world: World, ids: readonly number[], wayOf: (index: number) => ArrayLike<number>, kmPerCell: number): Set<number> {
  const c = world.formations.cols;
  const w = world.cells.w;
  const fighting = new Set<number>();
  for (const war of world.wars.list) if (war.sides[0].length > 0 && war.sides[1].length > 0) for (const side of war.sides) for (const n of side) fighting.add(n);
  if (fighting.size === 0) return new Set();
  const marches: { id: number; nation: number; line: ArrayLike<number> }[] = [];
  for (let j = 0; j < ids.length; j++) {
    const id = ids[j]!;
    const nation = c.nation[id]!;
    if (c.moving[id] !== 1 || c.retreat[id]! > 0) continue;
    if (!fighting.has(nation) || world.rules?.templates[c.template[id]!]?.domain !== Domain.land) continue;
    let line = wayOf(j);
    if (line.length < 4) {
      const [x, y, target] = [c.x[id]!, c.y[id]!, c.targetCell[id]!];
      let tx = (target % w) + 0.5;
      if (world.settings.loopingMap && Math.abs(tx - x) > w / 2) tx += tx < x ? w : -w;
      line = [x, y, tx, Math.floor(target / w) + 0.5];
    }
    marches.push({ id, nation, line });
  }
  // A way over the map's seam has cells beyond its width: whose they are is read at the cell's own place.
  const cellAt = (x: number, y: number): number => Math.floor(y) * w + (((Math.floor(x) % w) + w) % w);
  return advances(
    marches,
    (x, y) => world.cells.controller[cellAt(x, y)] ?? 0,
    (a, b) => world.wars.atWar(a, b),
    ADVANCE_REACH_KM / kmPerCell,
    (nation, holder, x, y) => !world.holdsLand(nation, holder, cellAt(x, y)),
  );
}
