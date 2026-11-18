/**
 * The borders' time-lapse built from the world's record (ROADMAP R143b, R143a's `BorderLog`): walked back from the map of
 * now, each frame's cells with their owner after (the map at its hour) and before (its old owner), the changes since
 * the last cut as the last step at the hour of now.
 */
import type { TimeLapse } from '../shared/timeLapse';
import type { World } from '../sim/world';

export function timeLapseOf(world: World): TimeLapse {
  const { w, h } = world.cells;
  const b = world.borders;
  const map = Uint16Array.from(world.cells.owner);
  const frames = b.frames();
  // Steps oldest first: each frame, then the open changes (when the record has begun).
  const steps = [...frames.map((f) => ({ tick: f.tick, runs: f.runs })), ...(b.begun ? [{ tick: world.tick, runs: b.open() }] : [])];
  const cells: Int32Array[] = [];
  const from: Uint16Array[] = [];
  const to: Uint16Array[] = [];
  for (let i = steps.length - 1; i >= 0; i--) {
    const runs = steps[i]!.runs;
    let n = 0;
    for (let k = 1; k < runs.length; k += 3) n += runs[k]!;
    const c = new Int32Array(n);
    const f = new Uint16Array(n);
    const t = new Uint16Array(n);
    let j = 0;
    for (let k = 0; k < runs.length; k += 3) {
      for (let x = runs[k]!; x < runs[k]! + runs[k + 1]!; x++) {
        c[j] = x;
        t[j] = map[x]!;
        f[j] = runs[k + 2]!;
        map[x] = runs[k + 2]!;
        j++;
      }
    }
    cells[i] = c;
    from[i] = f;
    to[i] = t;
  }
  const offsets = new Int32Array(steps.length + 1);
  for (let i = 0; i < steps.length; i++) offsets[i + 1] = offsets[i]! + cells[i]!.length;
  const join = <T extends Int32Array | Uint16Array>(parts: T[], make: (n: number) => T): T => {
    const out = make(offsets[steps.length]!);
    let at = 0;
    for (const p of parts) {
      out.set(p as never, at);
      at += p.length;
    }
    return out;
  };
  const nc = world.nations.cols;
  const colors = new Uint32Array(world.nations.highWater);
  for (let id = 1; id < colors.length; id++) colors[id] = nc.color[id] ?? 0;
  return {
    w,
    h,
    ticks: Int32Array.from([b.firstCut, ...steps.map((s) => s.tick)]),
    offsets,
    cells: join(cells, (n) => new Int32Array(n)),
    from: join(from, (n) => new Uint16Array(n)),
    to: join(to, (n) => new Uint16Array(n)),
    start: map,
    colors,
  };
}
