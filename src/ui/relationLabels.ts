/**
 * Where the relations graph names its nations (ROADMAP R34a; critic run 37, R37-N4: "AustraliaUnited Kingdom",
 * labels printed over each other, and on a phone too small to read). The labels are of one size on the screen,
 * whatever the zoom, and placed in order of importance: each at the first of four places about its node (below,
 * above, right, left) that overlaps no label placed before it and lies in the view; one with no such place is
 * not drawn (its node's title and a tap still name it, and zooming in makes room). Pure: sizes in the drawing's
 * units.
 */

export interface LabelItem {
  key: string;
  /** The node's centre and radius. */
  x: number;
  y: number;
  r: number;
  /** The text's width and height. */
  w: number;
  h: number;
}

export interface PlacedLabel {
  /** The text's anchor point (its baseline) and alignment. */
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The box of a label placed at `p` with size `w × h` (the baseline at `p.y`; a fifth of `h` below it). */
export function labelBox(p: PlacedLabel, w: number, h: number): Box {
  const x0 = p.anchor === 'start' ? p.x : p.anchor === 'end' ? p.x - w : p.x - w / 2;
  return { x0, y0: p.y - h * 0.8, x1: x0 + w, y1: p.y + h * 0.2 };
}

const overlaps = (a: Box, b: Box): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const inside = (a: Box, v: Box): boolean => a.x0 >= v.x0 && a.x1 <= v.x1 && a.y0 >= v.y0 && a.y1 <= v.y1;

/**
 * The labels of `items`, in their order of importance, each at its first free place inside `view` (a gap of
 * `gap` between labels and from the node); those with none are left out of the result.
 */
export function placeLabels(items: readonly LabelItem[], view: Box, gap: number): Map<string, PlacedLabel> {
  const out = new Map<string, PlacedLabel>();
  const taken: Box[] = [];
  for (const it of items) {
    const tries: PlacedLabel[] = [
      { x: it.x, y: it.y + it.r + gap + it.h * 0.8, anchor: 'middle' },
      { x: it.x, y: it.y - it.r - gap - it.h * 0.2, anchor: 'middle' },
      { x: it.x + it.r + gap, y: it.y + it.h * 0.3, anchor: 'start' },
      { x: it.x - it.r - gap, y: it.y + it.h * 0.3, anchor: 'end' },
    ];
    for (const p of tries) {
      const b = labelBox(p, it.w, it.h);
      const padded: Box = { x0: b.x0 - gap / 2, y0: b.y0 - gap / 2, x1: b.x1 + gap / 2, y1: b.y1 + gap / 2 };
      if (!inside(b, view) || taken.some((t) => overlaps(padded, t))) continue;
      taken.push(padded);
      out.set(it.key, p);
      break;
    }
  }
  return out;
}
