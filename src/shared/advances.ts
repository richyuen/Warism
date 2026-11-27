/**
 * Which marches are advances (ROADMAP R96, ADR-1088, the user's request: "only show arrows if a country is invading
 * another country or pushing through a front"): the movement arrows drawn bold, for every viewer
 * (`src/render/units/moveArrows.ts`).
 *
 * Judged by the worker since ROADMAP R235 (ADR-1162), which sets `FormationFlag.advancing` on the snapshot's
 * formations: whether land an enemy holds can be taken today is the sim's to say. In the historical replay a front
 * the track holds (`World.holdsLand`, by cell) is one no march pushes through, and the view, which knew only who is
 * at war, drew an advance for every march whose line clipped the foe's land there: on 23 November 1939 five German
 * divisions stood at Strasbourg for three weeks, each under a bold arrow over the Rhine.
 *
 * By the march's route since ROADMAP R241 (ADR-1165), and no longer by the line the view draws: the line of a march
 * on land is straight from where it stands to its target (PLAN 7.4g3). It clips land the route goes round (on 14 May
 * 1940 of the replay, 20 of Germany's 30 advances in the West by the line were marches along its own side of the
 * front, or not yet within reach of it), and it says nothing of where the march will wait.
 */

/** How far from where it stands a march's route is looked at for the enemy's land, km (ROADMAP R96): a day's march or two. */
export const ADVANCE_REACH_KM = 100;

/**
 * Where a march presses on a front (ROADMAP R241, ADR-1165): the index in `path` (its route's cells, row-major on a
 * map `w` cells wide; `step` the last of them it has reached) of the first cell after `step` that a nation at war
 * with `nation` holds, when the route comes to it before it first goes further than `reach` cells from where the
 * formation stands (`x`, `y` in cells; to the cell's middle as the crow flies, over the map's seam where that is
 * nearer) and the marcher may take it (`takes`: of that holder, that cell; always, where nothing says otherwise). -1
 * for none: no enemy's cell within reach, or the first of them one it may not take (the march waits before that
 * cell, or is made again round it). A march that has none ahead but has reached an enemy's land it may take presses
 * at its next cell (its last, where it has no next): it is over the front and goes on. Pure.
 */
export function pressesAt(
  path: ArrayLike<number>,
  step: number,
  x: number,
  y: number,
  nation: number,
  w: number,
  reach: number,
  holderOf: (cell: number) => number,
  atWar: (a: number, b: number) => boolean,
  takes: (holder: number, cell: number) => boolean = () => true,
): number {
  const foe = (cell: number): number => {
    const holder = holderOf(cell);
    return holder !== 0 && holder !== nation && atWar(nation, holder) ? holder : 0;
  };
  if (step < 0 || step >= path.length) return -1;
  for (let k = step + 1; k < path.length; k++) {
    const b = path[k]!;
    let dx = Math.abs((((x % w) + w) % w) - ((b % w) + 0.5));
    if (dx > w / 2) dx = w - dx;
    if (Math.hypot(dx, y - (Math.floor(b / w) + 0.5)) > reach) break;
    const holder = foe(b);
    if (holder !== 0) return takes(holder, b) ? k : -1;
  }
  const from = path[step]!;
  const here = foe(from);
  return here !== 0 && takes(here, from) ? Math.min(step + 1, path.length - 1) : -1;
}
