/**
 * Nation label curves (SPEC §8, PLAN 1.29), derived from the controller layer (not sim state).
 *
 * Per nation, the 4-connected component holding its capital (when ≥ MIN_CELLS, else its largest;
 * x unwrapped across the date line during the flood) gives a principal axis (PCA, read left to right). Along it, the robust extent [5%, 95%]
 * of the projected cells has length L; the mean perpendicular offsets of the cells near 10%, 50%
 * and 90% of it give three mid-line points, and the quadratic Bézier through them (control
 * c = 2·p1 − (p0 + p2)/2) is the label's baseline. Half-thickness = 1.2 × the perpendicular
 * standard deviation. Components under MIN_CELLS get no label. Cost: one flood over all
 * controlled cells (~40 ms at M), so the worker recomputes at most every few seconds.
 */

export const MIN_CELLS = 24;

/**
 * The turn and the curve of a name (ROADMAP R92b, ADR-1082; the user: "white upright country names"; "POLAND" ran
 * at 60 degrees). A baseline is turned at most MAX_TILT from level: a land whose long axis is steeper has its name
 * along the axis at MAX_TILT through its middle, as long as the land is there (`fit` with a strip). Unless the land
 * is so narrow that such a name would be under STEEP_KEEP of the one along its axis (Chile, Norway): that land keeps
 * the name along its axis. And a baseline bows at most MAX_BEND of its length to either side.
 */
export const MAX_TILT = (30 * Math.PI) / 180;
export const STEEP_KEEP = 0.4;
export const MAX_BEND = 0.15;

export function deriveNationLabels(controller: Uint16Array, w: number, h: number, wrapX: boolean, capitals: ReadonlyMap<number, number> = new Map()): Float64Array {
  const n = w * h;
  const comp = new Int32Array(n).fill(-1);
  const ux = new Float64Array(n); // unwrapped x of each cell in its component
  // Per nation, the largest component: [nation] → {start, size}.
  const best = new Map<number, { start: number; size: number }>();
  const stack: number[] = [];
  let next = 0;
  for (let s = 0; s < n; s++) {
    const id = controller[s]!;
    if (id === 0 || comp[s] !== -1) continue;
    let size = 0;
    comp[s] = next;
    ux[s] = s % w;
    stack.push(s);
    while (stack.length) {
      const c = stack.pop()!;
      size++;
      const x = c % w;
      const y = (c - x) / w;
      const nb: [number, number][] = [];
      if (y > 0) nb.push([c - w, ux[c]!]);
      if (y < h - 1) nb.push([c + w, ux[c]!]);
      if (x > 0) nb.push([c - 1, ux[c]! - 1]);
      else if (wrapX) nb.push([c + w - 1, ux[c]! - 1]);
      if (x < w - 1) nb.push([c + 1, ux[c]! + 1]);
      else if (wrapX) nb.push([c - w + 1, ux[c]! + 1]);
      for (const [m, mx] of nb) {
        if (comp[m] !== -1 || controller[m] !== id) continue;
        comp[m] = next;
        ux[m] = mx;
        stack.push(m);
      }
    }
    const b = best.get(id);
    if (!b || size > b.size) best.set(id, { start: s, size });
    next++;
  }
  // The labelled component: the one holding the capital when it is big enough (France's name
  // belongs on France, not on Algeria), else the largest.
  const sizeOf = new Map<number, number>();
  for (let c = 0; c < n; c++) if (comp[c]! >= 0) sizeOf.set(comp[c]!, (sizeOf.get(comp[c]!) ?? 0) + 1);
  const bestComp = new Map<number, number>();
  for (const [id, { start, size }] of best) {
    const cap = capitals.get(id);
    const capComp = cap !== undefined && controller[cap] === id ? comp[cap]! : -1;
    if (capComp >= 0 && (sizeOf.get(capComp) ?? 0) >= MIN_CELLS) bestComp.set(id, capComp);
    else if (size >= MIN_CELLS) bestComp.set(id, comp[start]!);
  }
  // One pass: gather each nation's cells in its labelled component.
  const xs = new Map<number, number[]>();
  const ys = new Map<number, number[]>();
  for (let c = 0; c < n; c++) {
    const id = controller[c]!;
    if (id === 0 || bestComp.get(id) !== comp[c]) continue;
    let ax = xs.get(id);
    let ay = ys.get(id);
    if (!ax || !ay) {
      xs.set(id, (ax = []));
      ys.set(id, (ay = []));
    }
    ax.push(ux[c]! + 0.5);
    ay.push(Math.floor(c / w) + 0.5);
  }
  const out: number[] = [];
  for (const id of [...bestComp.keys()].sort((a, b) => a - b)) {
    const label = labelOf(xs.get(id)!, ys.get(id)!);
    if (label) out.push(id, ...label, xs.get(id)!.length);
  }
  return Float64Array.from(out);
}

/** [x0, y0, cx, cy, x2, y2, length, thickness] for a cell set, or null when degenerate. */
function labelOf(xs: number[], ys: number[]): number[] | null {
  const m = xs.length;
  let mx = 0;
  let my = 0;
  for (let i = 0; i < m; i++) {
    mx += xs[i]!;
    my += ys[i]!;
  }
  mx /= m;
  my /= m;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < m; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // The long axis, read left to right: its angle from level, within a quarter turn either way.
  let theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  if (Math.cos(theta) < 0) theta += Math.PI;
  theta = Math.atan2(Math.sin(theta), Math.cos(theta));
  const along = fit(xs, ys, mx, my, theta, false);
  if (Math.abs(theta) <= MAX_TILT) return along;
  // Steeper than a name is turned: across the land at MAX_TILT, through its middle.
  const level = fit(xs, ys, mx, my, Math.sign(theta) * MAX_TILT, true);
  if (!along) return level;
  return level && level[6]! >= STEEP_KEEP * along[6]! ? level : along;
}

/**
 * The baseline along the axis at `theta` through (mx, my). `strip`: the axis is not the land's long one, so the
 * name's reach is the land's along that line, not the whole land's shadow on it: only the cells within a strip
 * about the line count for its ends and its mid-line.
 */
function fit(xs: number[], ys: number[], mx: number, my: number, theta: number, strip: boolean): number[] | null {
  const m = xs.length;
  const ux = Math.cos(theta);
  const uy = Math.sin(theta);
  const vx = -uy;
  const vy = ux;
  const tAll = new Float64Array(m);
  const sAll = new Float64Array(m);
  let s2 = 0;
  for (let i = 0; i < m; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    tAll[i] = dx * ux + dy * uy;
    sAll[i] = dx * vx + dy * vy;
    s2 += sAll[i]! * sAll[i]!;
  }
  const spread = Math.sqrt(s2 / m);
  // The strip: half the land's spread across the line either side of it, two cells at least.
  const half = strip ? Math.max(2, 0.5 * spread) : Infinity;
  const keep: number[] = [];
  for (let i = 0; i < m; i++) if (Math.abs(sAll[i]!) <= half) keep.push(i);
  if (keep.length < 3) return null;
  const t = Float64Array.from(keep, (i) => tAll[i]!);
  const s = Float64Array.from(keep, (i) => sAll[i]!);
  const k = keep.length;
  const sorted = Float64Array.from(t).sort();
  const lo = sorted[Math.floor(0.05 * (k - 1))]!;
  const hi = sorted[Math.floor(0.95 * (k - 1))]!;
  const L = hi - lo;
  if (L < 3) return null;
  const thickness = 1.2 * spread;
  /** The land's middle across the line at `frac` of the reach: where along the line, and how far to its side. */
  const mid = (frac: number): [number, number] => {
    const ti = lo + frac * L;
    let sum = 0;
    let cnt = 0;
    for (let i = 0; i < k; i++) {
      if (Math.abs(t[i]! - ti) < L / 10) {
        sum += s[i]!;
        cnt++;
      }
    }
    return [ti, cnt > 0 ? sum / cnt : 0];
  };
  const point = ([ti, si]: [number, number]): [number, number] => [mx + ti * ux + si * vx, my + ti * uy + si * vy];
  const [m0, m1, m2] = [mid(0.1), mid(0.5), mid(0.9)];
  // Across a land at MAX_TILT the two ends stand as far to the line's side as each other: the chord is at MAX_TILT,
  // and no steeper for the land's lean (at 75 degrees a slab's name came out at 32).
  if (strip) m0[1] = m2[1] = (m0[1] + m2[1]) / 2;
  const p0 = point(m0);
  const p2 = point(m2);
  let p1 = point(m1);
  // The bow: the middle no further from the chord's middle than MAX_BEND of the length.
  const [bx, by] = [p1[0] - 0.5 * (p0[0] + p2[0]), p1[1] - 0.5 * (p0[1] + p2[1])];
  const bow = Math.hypot(bx, by);
  const most = MAX_BEND * 0.8 * L;
  if (bow > most) p1 = [0.5 * (p0[0] + p2[0]) + (bx * most) / bow, 0.5 * (p0[1] + p2[1]) + (by * most) / bow];
  const cx = 2 * p1[0] - 0.5 * (p0[0] + p2[0]);
  const cy = 2 * p1[1] - 0.5 * (p0[1] + p2[1]);
  return [p0[0], p0[1], cx, cy, p2[0], p2[1], 0.8 * L, thickness];
}
