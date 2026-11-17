/**
 * Movement arrows (ROADMAP R89a, ADR-1073, ADR-1074; the user: "thick arrows … thicker the more
 * troops that are moving"): a land formation's march drawn as a filled, tapered arrow from where
 * it stands along the first stretch of its way, in a pale tint of its nation's colour with a dark
 * rim, as wide as its men are many. Marches of one nation that start near each other and head the
 * same way are one arrow of their men together.
 *
 * Until R89a a march was a dashed yellow line of 1.5 px to its end, one a formation
 * (`drawOrderArrows`, which the fleets keep, and the formations picked or selected: the whole way
 * of what is looked at): with a nation at war selected its front was some 40 lines across one
 * another. The arrow is the way a force is going, not the whole of its way: drawn to their ends,
 * 99 marches on the Fujian front of seed 99 were 38 thick arrows from beyond the screen with 131
 * crossings among them (ADR-1074).
 *
 * Pure but for `drawMoveArrows`: the same marches give the same arrows.
 */

/** A land formation's march: who, how many, and its way in cells (`x, y` by twos, the first where it stands, unwrapped). */
export interface March {
  id: number;
  nation: number;
  men: number;
  line: ArrayLike<number>;
  /** A march behind the lines (ROADMAP R89b): thin and faint, and never one arrow with an advance. */
  faint?: boolean;
}

/** An arrow: the marches it stands for, its lead's first, their men together, along the start of the lead's way. */
export interface MoveArrow {
  nation: number;
  men: number;
  ids: number[];
  line: ArrayLike<number>;
  faint?: boolean;
}

/** The least and the most width of an arrow's body at its neck, CSS px (before the unit size). */
export const ARROW_MIN_PX = 5;
export const ARROW_MAX_PX = 22;
/** The men at which an arrow is the least and the most wide; between them by the logarithm. */
export const ARROW_MIN_MEN = 2_000;
export const ARROW_MAX_MEN = 400_000;
/** The tail's width as a share of the neck's. */
export const ARROW_TAIL = 0.4;
/** The head's width and length, in body widths; the head never longer than HEAD_SHARE of the arrow. */
export const HEAD_WIDE = 2.1;
export const HEAD_LONG = 1.7;
export const HEAD_SHARE = 0.6;
/** An arrow shorter than this on the screen is not drawn, CSS px: its formation's marker covers it. */
export const ARROW_SHORTEST_PX = 10;
/**
 * How much of the way an arrow is drawn along, CSS px (before the unit size): ARROW_LONG_PX and
 * ARROW_LONG_WIDTHS of its own widths more (a wide arrow as short as a thin one is all head).
 */
export const ARROW_LONG_PX = 70;
export const ARROW_LONG_WIDTHS = 3;
/** How far apart two marches of a nation start and still are one arrow, CSS px (about a marker and a half). */
export const GROUP_START_PX = 44;
/** How far apart their headings are, radians (40°): the heading is from the start to the way's point ARROW_LONG_PX on. */
export const GROUP_TURN = (40 * Math.PI) / 180;
/** The radius a turn of the way is rounded with, CSS px, and the points a rounded turn is drawn with. */
export const TURN_RADIUS_PX = 28;
const TURN_STEPS = 6;

/** A faint arrow's width as a share of a bold one's of its men, and its opacity (ROADMAP R89b). */
export const FAINT_WIDE = 0.6;
export const FAINT_ALPHA = 0.5;
/**
 * The least length of a bold arrow, CSS px (before the unit size): an advance whose way is shorter on the screen (at
 * the world's zoom most are: 100 km is 5 px at 20,000 m/px) is drawn this long along its heading, as a sign of where
 * it goes.
 */
export const ARROW_LEAST_PX = 26;

/** How far apart the points of a way are looked at for whose land they are on, cells (`advances`). */
export const ADVANCE_STEP = 0.5;

/**
 * The marches that are advances (ROADMAP R96, ADR-1088, the user's request: "only show arrows if a country is
 * invading another country or pushing through a front"): of a nation at war, whose way within its next `reach` (the
 * way's own units, cells) is on land an enemy holds (`holderAt` a point, `atWar` with the marcher): it crosses the
 * front, or is over it and goes on. Looked at every ADVANCE_STEP of the way and at its end. The rest are marches
 * behind the lines, reinforcements on their way to a front among them: until R96 a march that ended within 100 km of
 * an enemy's formation was an advance too (R89b, ADR-1075), and a front had an arrow for each division coming up
 * behind it. Pure.
 */
export function advances(
  marches: readonly { id: number; nation: number; line: ArrayLike<number> }[],
  holderAt: (x: number, y: number) => number,
  atWar: (a: number, b: number) => boolean,
  reach: number,
): Set<number> {
  const out = new Set<number>();
  for (const m of marches) {
    const enemy = (x: number, y: number): boolean => {
      const holder = holderAt(x, y);
      return holder !== 0 && holder !== m.nation && atWar(m.nation, holder);
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

/**
 * How far toward white an arrow's fill is from its nation's colour: on its own land the colour itself is not seen.
 * 0.3 since ROADMAP R106 (ADR-1097; 0.5 before): at 0.5 two nations' arrows side by side were two pale greys, told
 * by where they pointed.
 */
export const ARROW_PALE = 0.3;
/**
 * With a nation looked at or played (`own` of `drawMoveArrows`), the width of another nation's arrow as a share of
 * one of its men (ROADMAP R106): one's own marches read first.
 */
export const OTHER_WIDE = 0.7;

/** The fill of an arrow of the nation whose colour is `own` (0xRRGGBB), as CSS. */
export function arrowFill(own: number): string {
  const pale = (c: number): number => Math.round(c + (255 - c) * ARROW_PALE);
  return `rgb(${pale((own >> 16) & 255)}, ${pale((own >> 8) & 255)}, ${pale(own & 255)})`;
}

/** The width of the arrow of `men`, CSS px: never narrower for more men. */
export function arrowWidth(men: number): number {
  const t = (Math.log(Math.max(men, 1)) - Math.log(ARROW_MIN_MEN)) / (Math.log(ARROW_MAX_MEN) - Math.log(ARROW_MIN_MEN));
  return ARROW_MIN_PX + (ARROW_MAX_PX - ARROW_MIN_PX) * Math.min(1, Math.max(0, t));
}

/** The length of a way, cells. */
function lengthOf(line: ArrayLike<number>): number {
  let l = 0;
  for (let i = 2; i < line.length; i += 2) l += Math.hypot(line[i]! - line[i - 2]!, line[i + 1]! - line[i - 1]!);
  return l;
}

/** The first `long` of a way (`x, y` by twos, in its own units), or all of it where it is shorter. */
export function wayStart(line: ArrayLike<number>, long: number): number[] {
  const out: number[] = [line[0]!, line[1]!];
  let left = long;
  for (let i = 2; i < line.length; i += 2) {
    const seg = Math.hypot(line[i]! - line[i - 2]!, line[i + 1]! - line[i - 1]!);
    if (seg >= left) {
      if (seg > 0) out.push(line[i - 2]! + ((line[i]! - line[i - 2]!) * left) / seg, line[i - 1]! + ((line[i + 1]! - line[i - 1]!) * left) / seg);
      return out;
    }
    out.push(line[i]!, line[i + 1]!);
    left -= seg;
  }
  return out;
}

/** The heading of a way, radians: from its start to its point `long` along it (`wayStart`'s last, with nothing made). */
function heading(line: ArrayLike<number>, long: number): number {
  let left = long;
  let [x, y] = [line[0]!, line[1]!];
  for (let i = 2; i < line.length; i += 2) {
    const seg = Math.hypot(line[i]! - x, line[i + 1]! - y);
    if (seg >= left) {
      if (seg > 0) [x, y] = [x + ((line[i]! - x) * left) / seg, y + ((line[i + 1]! - y) * left) / seg];
      break;
    }
    [x, y] = [line[i]!, line[i + 1]!];
    left -= seg;
  }
  return Math.atan2(y - line[1]!, x - line[0]!);
}

/**
 * The arrows of `marches`, `scale` px a cell. The marches by their men, the most first (then by
 * id): each joins the first arrow of its nation whose lead starts within GROUP_START_PX of it and
 * heads within GROUP_TURN of its heading, and is faint or bold as it is, or leads an arrow of its
 * own. Every march is in one arrow; a march with no way (fewer than two points) is in none.
 */
export function groupMarches(marches: readonly March[], scale: number): MoveArrow[] {
  const order = marches.filter((m) => m.line.length >= 4).sort((a, b) => b.men - a.men || a.id - b.id);
  const arrows: (MoveArrow & { heading: number })[] = [];
  const reach = GROUP_START_PX / scale;
  const long = ARROW_LONG_PX / scale;
  // The arrows by the square of `reach` their lead starts in: a march looks at the nine about its own.
  const squares = new Map<number, number[]>();
  const square = (sx: number, sy: number): number => sx * 65536 + sy;
  for (const m of order) {
    const l = m.line;
    const h = heading(l, long);
    const [sx, sy] = [Math.floor(l[0]! / reach), Math.floor(l[1]! / reach)];
    let home = -1;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const list = squares.get(square(sx + dx, sy + dy));
        if (!list) continue;
        for (const k of list) {
          // The first made of those it may join: the one of the most men.
          if (home >= 0 && k > home) break;
          const a = arrows[k]!;
          if (a.nation !== m.nation || Boolean(a.faint) !== Boolean(m.faint) || Math.hypot(a.line[0]! - l[0]!, a.line[1]! - l[1]!) > reach) continue;
          const turn = Math.abs(a.heading - h);
          if (Math.min(turn, 2 * Math.PI - turn) > GROUP_TURN) continue;
          home = k;
          break;
        }
      }
    }
    if (home >= 0) {
      arrows[home]!.men += m.men;
      arrows[home]!.ids.push(m.id);
    } else {
      const key = square(sx, sy);
      const list = squares.get(key);
      if (list) list.push(arrows.length);
      else squares.set(key, [arrows.length]);
      arrows.push({ nation: m.nation, men: m.men, ids: [m.id], line: l, heading: h, ...(m.faint ? { faint: true } : {}) });
    }
  }
  return arrows.map(({ heading: _, ...a }) => a);
}

/** The way with its turns rounded (each by a curve of at most `radius`, and of half its shorter leg): `x, y` by twos. */
export function roundedWay(pts: ArrayLike<number>, radius: number): number[] {
  const n = pts.length / 2;
  const out: number[] = [pts[0]!, pts[1]!];
  for (let i = 1; i < n - 1; i++) {
    const [px, py, x, y, nx, ny] = [pts[2 * i - 2]!, pts[2 * i - 1]!, pts[2 * i]!, pts[2 * i + 1]!, pts[2 * i + 2]!, pts[2 * i + 3]!];
    const la = Math.hypot(x - px, y - py);
    const lb = Math.hypot(nx - x, ny - y);
    const r = Math.min(radius, la / 2, lb / 2);
    if (r < 0.5) {
      out.push(x, y);
      continue;
    }
    const [ax, ay] = [x + ((px - x) * r) / la, y + ((py - y) * r) / la];
    const [bx, by] = [x + ((nx - x) * r) / lb, y + ((ny - y) * r) / lb];
    for (let k = 0; k <= TURN_STEPS; k++) {
      const t = k / TURN_STEPS;
      const u = 1 - t;
      out.push(u * u * ax + 2 * u * t * x + t * t * bx, u * u * ay + 2 * u * t * y + t * t * by);
    }
  }
  out.push(pts[2 * n - 2]!, pts[2 * n - 1]!);
  return out;
}

/**
 * The outline of an arrow `width` wide at its neck along `pts` (px, `x, y` by twos): up its left
 * side from the tail (ARROW_TAIL of the width) to the neck, the head's left corner, its tip (the
 * way's end), and back down the right. Null for a way shorter than ARROW_SHORTEST_PX.
 */
export function arrowOutline(pts: ArrayLike<number>, width: number): number[] | null {
  const c = roundedWay(pts, TURN_RADIUS_PX);
  const n = c.length / 2;
  const at: number[] = [0];
  for (let i = 1; i < n; i++) at.push(at[i - 1]! + Math.hypot(c[2 * i]! - c[2 * i - 2]!, c[2 * i + 1]! - c[2 * i - 1]!));
  const total = at[n - 1]!;
  if (!(total >= ARROW_SHORTEST_PX)) return null;
  const head = Math.min(HEAD_LONG * width, HEAD_SHARE * total);
  const neck = total - head;
  const left: number[] = [];
  const right: number[] = [];
  /** A point of each side at `s` along the way, in the segment from point `i`. */
  const sides = (i: number, s: number, half: number): void => {
    const seg = at[i + 1]! - at[i]!;
    const [dx, dy] = [(c[2 * i + 2]! - c[2 * i]!) / seg, (c[2 * i + 3]! - c[2 * i + 1]!) / seg];
    const [x, y] = [c[2 * i]! + dx * (s - at[i]!), c[2 * i + 1]! + dy * (s - at[i]!)];
    left.push(x + dy * half, y - dx * half);
    right.push(x - dy * half, y + dx * half);
  };
  const halfAt = (s: number): number => (width / 2) * (ARROW_TAIL + (1 - ARROW_TAIL) * (neck > 0 ? s / neck : 1));
  // Each point of the way before the neck; the neck is in the last of those segments.
  let k = 0;
  for (let i = 0; i < n - 1; i++) {
    if (at[i + 1]! === at[i]!) continue;
    if (at[i]! >= neck) break;
    sides(i, at[i]!, halfAt(at[i]!));
    k = i;
  }
  // The neck, and the head's corners there.
  sides(k, neck, width / 2);
  sides(k, neck, (HEAD_WIDE * width) / 2);
  const out = [...left, c[2 * n - 2]!, c[2 * n - 1]!];
  for (let i = right.length - 2; i >= 0; i -= 2) out.push(right[i]!, right[i + 1]!);
  return out;
}

/** The box of a way: `x0, y0, x1, y1`. */
export function boxOf(way: ArrayLike<number>): [number, number, number, number] {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (let i = 0; i < way.length; i += 2) [x0, y0, x1, y1] = [Math.min(x0, way[i]!), Math.min(y0, way[i + 1]!), Math.max(x1, way[i]!), Math.max(y1, way[i + 1]!)];
  return [x0, y0, x1, y1];
}

/** The gap an arrow cut short keeps from the side of the one it would cross, CSS px. */
export const CROSS_GAP_PX = 4;

/**
 * `way` (px) cut short where it would first cross one of `others` (each its way and its width):
 * it ends CROSS_GAP_PX before that one's side, measured along itself. Two arrows of a nation do
 * not lie across each other; the one of fewer men, drawn after, stops before the other. A way that
 * crosses none is given back as it is; one that would stop at its own start is empty of length.
 */
export function cutAtCrossing(way: ArrayLike<number>, others: readonly { way: ArrayLike<number>; width: number; box?: readonly number[] }[]): number[] {
  // Those whose box (`x0, y0, x1, y1`, when given) the way's own does not touch cannot cross it.
  const [x0, y0, x1, y1] = boxOf(way);
  others = others.filter((o) => !o.box || (o.box[0]! <= x1 && o.box[2]! >= x0 && o.box[1]! <= y1 && o.box[3]! >= y0));
  if (others.length === 0) return Array.from(way);
  let at = 0;
  let best = Infinity;
  for (let i = 2; i < way.length; i += 2) {
    const [ax, ay, bx, by] = [way[i - 2]!, way[i - 1]!, way[i]!, way[i + 1]!];
    const seg = Math.hypot(bx - ax, by - ay);
    for (const o of others) {
      for (let k = 2; k < o.way.length; k += 2) {
        const [cx, cy, dx, dy] = [o.way[k - 2]!, o.way[k - 1]!, o.way[k]!, o.way[k + 1]!];
        const den = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
        if (den === 0) continue;
        const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / den;
        const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / den;
        if (t < 0 || t > 1 || u < 0 || u > 1) continue;
        // Back from the crossing by the other's half width and the gap, the more the flatter the two cross.
        const sin = Math.abs(den) / (seg * Math.hypot(dx - cx, dy - cy));
        best = Math.min(best, at + t * seg - (o.width / 2 + CROSS_GAP_PX) / Math.max(sin, 0.3));
      }
    }
    at += seg;
  }
  return best === Infinity ? Array.from(way) : wayStart(way, Math.max(best, 0));
}

/** An arrow as it was drawn: whose, its marches, its width and the middle of its body, CSS px (tests, and what keeps clear of it). */
export interface DrawnArrow {
  nation: number;
  men: number;
  ids: number[];
  faint: boolean;
  width: number;
  /** A point a third along it: inside the body. */
  x: number;
  y: number;
  /** The stretch of its way it is drawn along, on the screen, `x, y` by twos. */
  way: number[];
}

/**
 * Draws `arrows` (already in the CSS-px transform of `ctx`, at its alpha): each along the start
 * of its way, filled in `colorOf` its nation with a dark rim (a nation's in one path, the nations
 * in the order of their strongest arrows); the most men first, one of fewer
 * cut short before one of its nation it would cross (`cutAtCrossing`); a faint one thinner and
 * at FAINT_ALPHA, a bold one never shorter than ARROW_LEAST_PX. `project` gives a cell's place on the screen
 * for each copy of the world in `offs`. `own`: the nation looked at or played, whose arrows are whole where the
 * others' are OTHER_WIDE of their width (0: every nation's whole). Returns what it drew.
 */
export function drawMoveArrows(
  ctx: CanvasRenderingContext2D,
  arrows: readonly MoveArrow[],
  project: (x: number, y: number) => [number, number],
  offs: readonly number[],
  vw: number,
  vh: number,
  colorOf: (nation: number) => string,
  size = 1,
  own = 0,
): DrawnArrow[] {
  const drawn: DrawnArrow[] = [];
  ctx.save();
  ctx.lineJoin = 'round';
  // The bold before the faint (ROADMAP R96): an advance is never cut short for a march behind the lines, whatever
  // their men (with a nation looked at, one of its advances was: 10 bold arrows where 11 were without it).
  const order = [...arrows].sort((a, b) => Number(Boolean(a.faint)) - Number(Boolean(b.faint)) || b.men - a.men || a.ids[0]! - b.ids[0]!);
  // By nation and copy of the world: the arrows drawn so far.
  const before = new Map<string, { way: number[]; width: number; box: number[] }[]>();
  // The outlines by nation, faint or bold: one path, one rim and one fill each (those of a nation do not cross).
  const paths = new Map<string, { nation: number; faint: boolean; outlines: number[][] }>();
  for (const a of order) {
    const width = arrowWidth(a.men) * size * (a.faint ? FAINT_WIDE : 1);
    // Another nation's is drawn thinner (ROADMAP R106) along the same stretch: where it is cut, and whether it is drawn,
    // is by its whole width, so that looking at a nation hides no advance (R96).
    const thin = own !== 0 && a.nation !== own ? OTHER_WIDE : 1;
    for (const off of offs) {
      const way: number[] = [];
      let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
      for (let i = 0; i < a.line.length; i += 2) {
        const p = project(a.line[i]! + off, a.line[i + 1]!);
        way.push(p[0], p[1]);
        [x0, x1, y0, y1] = [Math.min(x0, p[0]), Math.max(x1, p[0]), Math.min(y0, p[1]), Math.max(y1, p[1])];
      }
      if (x1 < 0 || x0 > vw || y1 < 0 || y0 > vh) continue;
      const key = `${a.nation}/${off}`;
      const earlier = before.get(key) ?? [];
      let start = wayStart(way, (ARROW_LONG_PX + ARROW_LONG_WIDTHS * arrowWidth(a.men)) * size);
      if (!a.faint) {
        // A bold arrow of a short way: straight along its heading, ARROW_LEAST_PX long.
        const [ex, ey] = [start[start.length - 2]! - start[0]!, start[start.length - 1]! - start[1]!];
        const far = Math.hypot(ex, ey);
        const least = ARROW_LEAST_PX * size;
        if (far < least && far > 0) start = [start[0]!, start[1]!, start[0]! + (ex * least) / far, start[1]! + (ey * least) / far];
      }
      // Its stretch off the screen (the way may go on across it): not drawn.
      const edge = width * HEAD_WIDE;
      const box = boxOf(start);
      if (box[2] < -edge || box[0] > vw + edge || box[3] < -edge || box[1] > vh + edge) continue;
      const stub = cutAtCrossing(start, earlier);
      const whole = arrowOutline(stub, width);
      if (!whole) continue;
      const o = thin === 1 ? whole : (arrowOutline(stub, width * thin) ?? whole);
      earlier.push({ way: stub, width, box: boxOf(stub) });
      before.set(key, earlier);
      const pk = `${a.nation}/${a.faint ? 1 : 0}`;
      const path = paths.get(pk);
      if (path) path.outlines.push(o);
      else paths.set(pk, { nation: a.nation, faint: Boolean(a.faint), outlines: [o] });
      const [mx, my] = alongWay(stub, 1 / 3);
      drawn.push({ nation: a.nation, men: a.men, ids: a.ids, faint: Boolean(a.faint), width: width * thin, x: mx, y: my, way: stub });
    }
  }
  const alpha = ctx.globalAlpha;
  ctx.strokeStyle = 'rgba(12, 14, 20, 0.9)';
  ctx.lineWidth = 3;
  for (const p of paths.values()) {
    ctx.globalAlpha = p.faint ? alpha * FAINT_ALPHA : alpha;
    ctx.beginPath();
    for (const o of p.outlines) {
      ctx.moveTo(o[0]!, o[1]!);
      for (let i = 2; i < o.length; i += 2) ctx.lineTo(o[i]!, o[i + 1]!);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.fillStyle = colorOf(p.nation);
    ctx.fill();
  }
  ctx.restore();
  return drawn;
}

/** The point at share `t` of the way's length. */
export function alongWay(way: ArrayLike<number>, t: number): [number, number] {
  let left = lengthOf(way) * t;
  for (let i = 2; i < way.length; i += 2) {
    const seg = Math.hypot(way[i]! - way[i - 2]!, way[i + 1]! - way[i - 1]!);
    if (left <= seg && seg > 0) return [way[i - 2]! + ((way[i]! - way[i - 2]!) * left) / seg, way[i - 1]! + ((way[i + 1]! - way[i - 1]!) * left) / seg];
    left -= seg;
  }
  return [way[way.length - 2]!, way[way.length - 1]!];
}
