/**
 * Keeping a hero's counter clear of the panels over the map (ROADMAP R34e; critic run 31, R31-N1: Japan's two
 * hero counters under the Ranking at every desk start view, "Sovet…" cut by it, and a click on them opened a
 * ranking row). Screen px.
 */

export interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const overlaps = (a: ScreenRect, b: ScreenRect): boolean => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Where box `b` goes so that no rect of `covered` is over it: itself where none is; else, of the places beside
 * a rect over it left or right (`gap` apart), the nearest that is inside the view (`vw` × `vh`) and under none,
 * at its own height (ROADMAP R8: a hero's counter within a step of its place's height); none, below or above
 * the same way; else itself (nowhere clear: left where it was).
 */
export function clearOf(b: ScreenRect, covered: readonly ScreenRect[], vw: number, vh: number, gap = 2): { x: number; y: number } {
  const over = covered.filter((r) => overlaps(b, r));
  if (over.length === 0) return { x: b.x, y: b.y };
  const nearest = (places: (r: ScreenRect) => { x: number; y: number }[]): { x: number; y: number } | null => {
    let best: { x: number; y: number } | null = null;
    let bestD = Infinity;
    for (const r of over) {
      for (const p of places(r)) {
        const moved = { ...b, ...p };
        if (p.x < 0 || p.y < 0 || p.x + b.w > vw || p.y + b.h > vh || covered.some((c) => overlaps(moved, c))) continue;
        const d = Math.hypot(p.x - b.x, p.y - b.y);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
    }
    return best;
  };
  return (
    nearest((r) => [
      { x: r.x - b.w - gap, y: b.y },
      { x: r.x + r.w + gap, y: b.y },
    ]) ??
    nearest((r) => [
      { x: b.x, y: r.y + r.h + gap },
      { x: b.x, y: r.y - b.h - gap },
    ]) ?? { x: b.x, y: b.y }
  );
}
