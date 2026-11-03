import { hash2, pair } from '../render/hash';
import type { EdgeKind, RelationGraph } from './relationGraph';

/**
 * The relations graph's layout (ADR-806): a force layout with no random numbers. A node keeps its
 * last place; a new one starts at its neighbours' centre (or at a place hashed from its key), so
 * the same world draws the same graph and a change in it moves the picture a little. Pure: the
 * panel keeps the last positions and passes them back.
 */

export interface Pos {
  x: number;
  y: number;
}

export interface LayoutOptions {
  width: number;
  height: number;
  /** Steps of the force simulation: more for a first layout, fewer for an update. */
  steps: number;
}

/** The rest length of each kind's edges, in px: a bond holds closer than a truce. */
const REST: Record<EdgeKind, number> = { war: 70, alliance: 60, guarantee: 90, puppet: 45, truce: 110 };
const REPULSE = 2600;
const SPRING = 0.04;
const GRAVITY = 0.012;
const MAX_STEP = 12;

function keyHash(key: string): number {
  let h = key.length;
  for (let i = 0; i < key.length; i++) h = hash2(h, key.charCodeAt(i));
  return h;
}

/** Positions of `g`'s nodes inside `width × height`, starting from `prev`. */
export function layoutGraph(g: RelationGraph, prev: ReadonlyMap<string, Pos>, o: LayoutOptions): Map<string, Pos> {
  const keys = g.nodes.map((n) => n.key);
  const index = new Map(keys.map((k, i) => [k, i]));
  const n = keys.length;
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const cx = o.width / 2;
  const cy = o.height / 2;
  const neighbours: number[][] = keys.map(() => []);
  const links: { a: number; b: number; rest: number }[] = [];
  for (const e of g.edges) {
    const a = index.get(e.from);
    const b = index.get(e.to);
    if (a === undefined || b === undefined) continue;
    neighbours[a]!.push(b);
    neighbours[b]!.push(a);
    links.push({ a, b, rest: REST[e.kind] });
  }
  // Starting places: the last ones; then a new node at its placed neighbours' centre; else hashed.
  const placed = new Uint8Array(n);
  keys.forEach((k, i) => {
    const p = prev.get(k);
    if (p) {
      x[i] = p.x;
      y[i] = p.y;
      placed[i] = 1;
    }
  });
  for (let pass = 0; pass < 2; pass++) {
    keys.forEach((k, i) => {
      if (placed[i]) return;
      const near = neighbours[i]!.filter((j) => placed[j]);
      const [jx, jy] = pair(keyHash(k));
      if (near.length > 0) {
        x[i] = near.reduce((s, j) => s + x[j]!, 0) / near.length + jx * 30;
        y[i] = near.reduce((s, j) => s + y[j]!, 0) / near.length + jy * 30;
        placed[i] = 1;
      } else if (pass === 1) {
        x[i] = cx + jx * o.width * 0.4;
        y[i] = cy + jy * o.height * 0.4;
        placed[i] = 1;
      }
    });
  }
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  for (let s = 0; s < o.steps; s++) {
    // Cooling: the first steps move most.
    const cap = MAX_STEP * (1 - (0.8 * s) / Math.max(1, o.steps));
    fx.fill(0);
    fy.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = x[i]! - x[j]!;
        let dy = y[i]! - y[j]!;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) {
          // Two nodes on one spot: part them along a hashed direction.
          const [hx, hy] = pair(hash2(i, j));
          dx = hx;
          dy = hy;
          d2 = dx * dx + dy * dy + 1e-6;
        }
        const f = REPULSE / d2;
        const d = Math.sqrt(d2);
        fx[i] = fx[i]! + (dx / d) * f;
        fy[i] = fy[i]! + (dy / d) * f;
        fx[j] = fx[j]! - (dx / d) * f;
        fy[j] = fy[j]! - (dy / d) * f;
      }
    }
    for (const l of links) {
      const dx = x[l.b]! - x[l.a]!;
      const dy = y[l.b]! - y[l.a]!;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = SPRING * (d - l.rest);
      fx[l.a] = fx[l.a]! + (dx / d) * f;
      fy[l.a] = fy[l.a]! + (dy / d) * f;
      fx[l.b] = fx[l.b]! - (dx / d) * f;
      fy[l.b] = fy[l.b]! - (dy / d) * f;
    }
    for (let i = 0; i < n; i++) {
      fx[i] = fx[i]! + (cx - x[i]!) * GRAVITY;
      fy[i] = fy[i]! + (cy - y[i]!) * GRAVITY;
      const m = Math.hypot(fx[i]!, fy[i]!);
      const k = m > cap ? cap / m : 1;
      x[i] = Math.min(o.width - 16, Math.max(16, x[i]! + fx[i]! * k));
      y[i] = Math.min(o.height - 16, Math.max(16, y[i]! + fy[i]! * k));
    }
  }
  const out = new Map<string, Pos>();
  keys.forEach((k, i) => out.set(k, { x: x[i]!, y: y[i]! }));
  return out;
}
