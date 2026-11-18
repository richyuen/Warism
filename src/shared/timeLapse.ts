/**
 * The borders' time-lapse (ROADMAP R143b) as the worker sends it: the owner map at the record's first cut, and for each
 * later step (each month's frame, and the changes since the last cut as the last, at the hour of now) the cells that
 * changed with their owner before and after, so the page plays it either way. Built from the record of R143a
 * (`src/worker/timeLapse.ts`); one buffer, transferred.
 */
export interface TimeLapse {
  w: number;
  h: number;
  /** The hour of the map at the start, then of each step's map. */
  ticks: Int32Array;
  /** The cells of step i are `cells[offsets[i]..offsets[i + 1]]`; `offsets` has a step's count + 1 entries. */
  offsets: Int32Array;
  cells: Int32Array;
  from: Uint16Array;
  to: Uint16Array;
  /** The owner map at `ticks[0]`, row-major. */
  start: Uint16Array;
  /** Each nation's own colour by id (0 for none), for the nations gone since. */
  colors: Uint32Array;
}

const HEAD = 5;

export function packTimeLapse(t: TimeLapse): Uint8Array {
  const steps = t.ticks.length - 1;
  const n = t.cells.length;
  const i32 = HEAD + t.ticks.length + t.offsets.length + n + t.colors.length;
  const u16 = t.start.length + 2 * n;
  const buf = new ArrayBuffer(i32 * 4 + u16 * 2);
  const a = new Int32Array(buf, 0, i32);
  a.set([t.w, t.h, steps, n, t.colors.length]);
  let at = HEAD;
  for (const part of [t.ticks, t.offsets, t.cells, t.colors]) {
    a.set(part, at);
    at += part.length;
  }
  const b = new Uint16Array(buf, i32 * 4, u16);
  b.set(t.start, 0);
  b.set(t.from, t.start.length);
  b.set(t.to, t.start.length + n);
  return new Uint8Array(buf);
}

export function unpackTimeLapse(bytes: Uint8Array): TimeLapse {
  const buf = bytes.byteOffset % 4 === 0 ? bytes.buffer : bytes.slice().buffer;
  const off = bytes.byteOffset % 4 === 0 ? bytes.byteOffset : 0;
  const head = new Int32Array(buf, off, HEAD);
  const [w, h, steps, n, colors] = [head[0]!, head[1]!, head[2]!, head[3]!, head[4]!];
  let at = off + HEAD * 4;
  const take = (len: number): Int32Array => {
    const v = new Int32Array(buf, at, len);
    at += len * 4;
    return v;
  };
  const ticks = take(steps + 1);
  const offsets = take(steps + 1);
  const cells = take(n);
  const cols = new Uint32Array(buf, at, colors);
  at += colors * 4;
  const b = new Uint16Array(buf, at, w * h + 2 * n);
  return { w, h, ticks, offsets, cells, colors: cols, start: b.subarray(0, w * h), from: b.subarray(w * h, w * h + n), to: b.subarray(w * h + n) };
}

/** A map played along a time-lapse: `seek` moves it to step i (0 the start), returning whether it changed. */
export class TimeLapsePlayer {
  readonly map: Uint16Array;
  private at = 0;
  constructor(readonly data: TimeLapse) {
    this.map = Uint16Array.from(data.start);
  }
  get step(): number {
    return this.at;
  }
  get steps(): number {
    return this.data.ticks.length - 1;
  }
  get tick(): number {
    return this.data.ticks[this.at]!;
  }
  seek(i: number): boolean {
    const to = Math.max(0, Math.min(this.steps, Math.round(i)));
    if (to === this.at) return false;
    const { offsets, cells, from, to: next } = this.data;
    while (this.at < to) {
      for (let k = offsets[this.at]!; k < offsets[this.at + 1]!; k++) this.map[cells[k]!] = next[k]!;
      this.at++;
    }
    while (this.at > to) {
      this.at--;
      for (let k = offsets[this.at]!; k < offsets[this.at + 1]!; k++) this.map[cells[k]!] = from[k]!;
    }
    return true;
  }
  /** The step whose map is that of `tick` (the last at or before it). */
  stepAt(tick: number): number {
    let i = 0;
    while (i < this.steps && this.data.ticks[i + 1]! <= tick) i++;
    return i;
  }
}
