/**
 * Where the relations graph names its nations (ROADMAP R34a; critic run 37, R37-N4: "AustraliaUnited Kingdom",
 * labels printed over each other, and on a phone too small to read). The labels are of one size on the screen,
 * whatever the zoom, and placed in order of importance: each at the first of the places about its node (below,
 * above, right, left, then the four corners, then the eight between; at the node's rim, then up to seven labels' heights further out, ROADMAP
 * R81e) that overlaps no label placed before it and lies in the view; one with no such place is not drawn (its
 * node's title and a tap still name it, and zooming in makes room). A label off its node's rim has a leader to it
 * (`far`). Pure: sizes in the drawing's units.
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
  /** Set off its node's rim: a leader drawn from the node to it. */
  far?: boolean;
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

/** The distances tried about a node: at its rim, then one to seven label heights further. */
const RINGS = 8;

const overlaps = (a: Box, b: Box): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const inside = (a: Box, v: Box): boolean => a.x0 >= v.x0 && a.x1 <= v.x1 && a.y0 >= v.y0 && a.y1 <= v.y1;

/**
 * The labels of `items`, in their order of importance, each at its first free place inside `view` (a gap of
 * `gap` between labels and from the node); those with none are left out of the result. `nodes`: the graph's nodes
 * (by key), none of which a label covers but its own (R81e: a label over a nation hid it).
 */
export function placeLabels(items: readonly LabelItem[], view: Box, gap: number, nodes: readonly { key: string; box: Box }[] = []): Map<string, PlacedLabel> {
  const out = new Map<string, PlacedLabel>();
  const taken: Box[] = [];
  for (const it of items) {
    const tries: PlacedLabel[] = [];
    for (let ring = 0; ring < RINGS; ring++) {
      const g = gap + ring * it.h;
      const c = (it.r + g) * Math.SQRT1_2;
      const far = ring > 0 ? { far: true } : {};
      tries.push(
        { x: it.x, y: it.y + it.r + g + it.h * 0.8, anchor: 'middle', ...far },
        { x: it.x, y: it.y - it.r - g - it.h * 0.2, anchor: 'middle', ...far },
        { x: it.x + it.r + g, y: it.y + it.h * 0.3, anchor: 'start', ...far },
        { x: it.x - it.r - g, y: it.y + it.h * 0.3, anchor: 'end', ...far },
        { x: it.x + c, y: it.y + c + it.h * 0.8, anchor: 'start', ...far },
        { x: it.x - c, y: it.y + c + it.h * 0.8, anchor: 'end', ...far },
        { x: it.x + c, y: it.y - c - it.h * 0.2, anchor: 'start', ...far },
        { x: it.x - c, y: it.y - c - it.h * 0.2, anchor: 'end', ...far },
      );
    }
    // Then the directions between those, at every distance (R81e: a crowded graph on a phone).
    for (let ring = 0; ring < RINGS; ring++) {
      const g = gap + ring * it.h;
      for (const a of [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]) {
        const [cs, sn] = [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
        const x = it.x + cs * (it.r + g);
        const y = it.y + sn * (it.r + g);
        tries.push({ x, y: sn >= 0 ? y + it.h * 0.8 : y - it.h * 0.2, anchor: cs >= 0 ? 'start' : 'end', ...(ring > 0 ? { far: true } : {}) });
      }
    }
    for (const p of tries) {
      const b = labelBox(p, it.w, it.h);
      const padded: Box = { x0: b.x0 - gap / 2, y0: b.y0 - gap / 2, x1: b.x1 + gap / 2, y1: b.y1 + gap / 2 };
      if (!inside(b, view) || taken.some((t) => overlaps(padded, t)) || nodes.some((n) => n.key !== it.key && overlaps(b, n.box))) continue;
      taken.push(padded);
      out.set(it.key, p);
      break;
    }
  }
  return out;
}
