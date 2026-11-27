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
 */

/** How far along its way a march is looked at for the enemy's land, km (ROADMAP R96): a day's march or two. */
export const ADVANCE_REACH_KM = 100;

/** How far apart the points of a way are looked at for whose land they are on, cells (`advances`). */
export const ADVANCE_STEP = 0.5;

/**
 * The marches that are advances: of a nation at war, whose way within its next `reach` (the way's own units, cells)
 * is on land an enemy holds (`holderAt` a point, `atWar` with the marcher) that the marcher may take (`takes`: of
 * that holder, at that point; always, where nothing says otherwise): it crosses the front, or is over it and goes
 * on. Looked at every ADVANCE_STEP of the way and at its end. The rest are marches behind the lines, reinforcements
 * on their way to a front among them: until R96 a march that ended within 100 km of an enemy's formation was an
 * advance too (R89b, ADR-1075), and a front had an arrow for each division coming up behind it. Pure.
 */
export function advances(
  marches: readonly { id: number; nation: number; line: ArrayLike<number> }[],
  holderAt: (x: number, y: number) => number,
  atWar: (a: number, b: number) => boolean,
  reach: number,
  takes: (nation: number, holder: number, x: number, y: number) => boolean = () => true,
): Set<number> {
  const out = new Set<number>();
  for (const m of marches) {
    const enemy = (x: number, y: number): boolean => {
      const holder = holderAt(x, y);
      return holder !== 0 && holder !== m.nation && atWar(m.nation, holder) && takes(m.nation, holder, x, y);
    };
    const l = m.line;
    let left = reach;
    let found = l.length >= 2 && enemy(l[0]!, l[1]!);
    for (let i = 2; i < l.length && !found && left > 0; i += 2) {
      const [ax, ay, bx, by] = [l[i - 2]!, l[i - 1]!, l[i]!, l[i + 1]!];
      const seg = Math.hypot(bx - ax, by - ay);
      const far = Math.min(seg, left);
      for (let d = Math.min(ADVANCE_STEP, far); !found; d = Math.min(d + ADVANCE_STEP, far)) {
        found = seg > 0 && enemy(ax + ((bx - ax) * d) / seg, ay + ((by - ay) * d) / seg);
        if (d >= far) break;
      }
      left -= seg;
    }
    if (found) out.add(m.id);
  }
  return out;
}
