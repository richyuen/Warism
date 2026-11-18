/**
 * The borders' record (ROADMAP R143a, ADR-1123): the cells that changed owner each month, kept backward from the map of
 * now. At each month's first hour, after the hour's systems (`cutBorders`, in `step`), the cells whose owner is not the
 * one of the month before become a frame: runs of a row with one old owner each. The map at a frame's hour is the map of
 * now with the open frame (the changes since the last cut) and every later frame undone (`ownerAt`); the save holds the
 * map of now, so no start map is kept.
 *
 * Encoded to be small (ADR-1123's table: 5.0 and 5.6 % of a packed 50-year save, the bar 7 %): six byte streams of
 * varints, the frame's header, the run's row, its column, the index of the run above it, its length or end, its old
 * owner. A run under one of the row above (a front running north-south) is told by its start and end against that run
 * and its owner as that run's; others by the gap from the run before in the row and their length.
 *
 * Saved as `borders.log` (the frames) and `borders.open` (the changes since the last cut, so a save made in mid-month
 * loads to the same month's start); both are absent at the start and load when absent, as `history.towns` (no
 * STATE_FORMAT raise; ADR-1123). The hash takes them.
 */
import type { Section } from './core/sections';
import type { Stateful } from './core/state';

/** A growable byte buffer of varints. */
class Bytes {
  data = new Uint8Array(256);
  length = 0;
  push(v: number): void {
    while (v >= 0x80) {
      this.byte((v & 0x7f) | 0x80);
      v = Math.floor(v / 128);
    }
    this.byte(v);
  }
  private byte(b: number): void {
    if (this.length === this.data.length) {
      const d = new Uint8Array(this.data.length * 2);
      d.set(this.data);
      this.data = d;
    }
    this.data[this.length++] = b;
  }
  view(): Uint8Array {
    return this.data.subarray(0, this.length);
  }
}

/** Reads varints from a byte array. */
class Reader {
  at = 0;
  constructor(private readonly data: Uint8Array) {}
  get done(): boolean {
    return this.at >= this.data.length;
  }
  next(): number {
    let v = 0;
    let mul = 1;
    for (;;) {
      if (this.at >= this.data.length) throw new Error('borders: a varint runs past its stream');
      const b = this.data[this.at++]!;
      v += (b & 0x7f) * mul;
      if (b < 0x80) return v;
      mul *= 128;
    }
  }
}

const zz = (v: number): number => (v < 0 ? -2 * v - 1 : 2 * v);
const unzz = (u: number): number => (u % 2 === 1 ? -(u + 1) / 2 : u / 2);

const STREAMS = 6;
const [HEAD, ROW, COL, ABOVE, LEN, OWNER] = [0, 1, 2, 3, 4, 5] as const;

/** A frame: its hour, and its runs as (start cell, length, old owner) triples in the order of the cells. */
export interface BorderFrame {
  tick: number;
  runs: Int32Array;
}

/** The runs of the cells where `now` is not `then`: a row's cells of one old owner, in the order of the cells. */
export function diffRuns(then: Uint16Array, now: Uint16Array, w: number): Int32Array {
  const out: number[] = [];
  const n = now.length;
  let c = 0;
  while (c < n) {
    if (now[c] === then[c]) {
      c++;
      continue;
    }
    const start = c;
    const old = then[c]!;
    c++;
    while (c < n && c % w !== 0 && now[c] !== then[c] && then[c] === old) c++;
    out.push(start, c - start, old);
  }
  return Int32Array.from(out);
}

/** Appends a frame of `runs` (from `diffRuns`, a map `w` cells wide) to `s`, its hour `tick - lastTick` after the one before. */
function encodeFrame(s: Bytes[], runs: Int32Array, w: number, tickDelta: number): void {
  s[HEAD]!.push(tickDelta);
  s[HEAD]!.push(runs.length / 3);
  const byRow = new Map<number, number[]>();
  let prevRow = -1;
  let prevOld = -1;
  let end = 0;
  for (let i = 0; i < runs.length; i += 3) {
    const [start, n, old] = [runs[i]!, runs[i + 1]!, runs[i + 2]!];
    const row = Math.floor(start / w);
    const col = start - row * w;
    s[ROW]!.push(prevRow < 0 ? row : row - prevRow);
    if (row !== prevRow) end = 0;
    const above = byRow.get(row - 1) ?? [];
    let t = -1;
    let k = 0;
    let ov = -1;
    for (let j = 0; j < above.length; j += 3) {
      const [ac, an] = [above[j]!, above[j + 1]!];
      if (ac + an <= end) continue;
      if (ac < col + n && col < ac + an) {
        t = k;
        ov = j;
        break;
      }
      k++;
    }
    let pred = prevOld;
    if (t >= 0) {
      const [ac, an, ao] = [above[ov]!, above[ov + 1]!, above[ov + 2]!];
      s[COL]!.push(zz(col - ac) * 2 + 1);
      s[ABOVE]!.push(t);
      s[LEN]!.push(zz(col + n - (ac + an)));
      pred = ao;
    } else {
      s[COL]!.push((col - end) * 2);
      s[LEN]!.push(n - 1);
    }
    s[OWNER]!.push(old === pred ? 0 : old + 1);
    const mine = byRow.get(row) ?? [];
    mine.push(col, n, old);
    byRow.set(row, mine);
    prevRow = row;
    prevOld = old;
    end = col + n;
  }
}

/** Reads the frames of `streams` (a map `w` cells wide), the hours counted from `base`. */
function decodeFrames(streams: Uint8Array[], w: number, base = 0): BorderFrame[] {
  const r = streams.map((d) => new Reader(d));
  const out: BorderFrame[] = [];
  let tick = base;
  while (!r[HEAD]!.done) {
    tick += r[HEAD]!.next();
    const count = r[HEAD]!.next();
    const runs = new Int32Array(count * 3);
    const byRow = new Map<number, number[]>();
    let prevRow = -1;
    let prevOld = -1;
    let end = 0;
    for (let i = 0; i < count; i++) {
      const dr = r[ROW]!.next();
      const row = prevRow < 0 ? dr : prevRow + dr;
      if (row !== prevRow) end = 0;
      const c = r[COL]!.next();
      let col: number;
      let n: number;
      let pred = prevOld;
      if (c % 2 === 1) {
        const t = r[ABOVE]!.next();
        const above = byRow.get(row - 1) ?? [];
        let k = 0;
        let ov = -1;
        for (let j = 0; j < above.length; j += 3) {
          if (above[j]! + above[j + 1]! <= end) continue;
          if (k === t) {
            ov = j;
            break;
          }
          k++;
        }
        if (ov < 0) throw new Error('borders: a run under no run above');
        const [ac, an, ao] = [above[ov]!, above[ov + 1]!, above[ov + 2]!];
        col = ac + unzz((c - 1) / 2);
        n = ac + an + unzz(r[LEN]!.next()) - col;
        pred = ao;
      } else {
        col = end + c / 2;
        n = r[LEN]!.next() + 1;
      }
      const o = r[OWNER]!.next();
      const old = o === 0 ? pred : o - 1;
      runs[i * 3] = row * w + col;
      runs[i * 3 + 1] = n;
      runs[i * 3 + 2] = old;
      const mine = byRow.get(row) ?? [];
      mine.push(col, n, old);
      byRow.set(row, mine);
      prevRow = row;
      prevOld = old;
      end = col + n;
    }
    out.push({ tick, runs });
  }
  return out;
}

/** The streams in one byte array: each one's length, then the streams. */
function pack(streams: Uint8Array[]): Uint8Array {
  const head = new Bytes();
  for (const s of streams) head.push(s.length);
  const out = new Uint8Array(head.length + streams.reduce((a, s) => a + s.length, 0));
  out.set(head.view());
  let at = head.length;
  for (const s of streams) {
    out.set(s, at);
    at += s.length;
  }
  return out;
}

function unpack(data: Uint8Array): Uint8Array[] {
  const r = new Reader(data);
  const lens = Array.from({ length: STREAMS }, () => r.next());
  const out: Uint8Array[] = [];
  let at = r.at;
  for (const n of lens) {
    out.push(data.subarray(at, at + n));
    at += n;
  }
  return out;
}

/** Encodes frames alone (the codec's round trip, the tests'). */
export function encodeBorderFrames(frames: readonly BorderFrame[], w: number): Uint8Array {
  const s = Array.from({ length: STREAMS }, () => new Bytes());
  let last = 0;
  for (const f of frames) {
    encodeFrame(s, f.runs, w, f.tick - last);
    last = f.tick;
  }
  return pack(s.map((b) => b.view()));
}

export function decodeBorderFrames(data: Uint8Array, w: number): BorderFrame[] {
  return data.length === 0 ? [] : decodeFrames(unpack(data), w);
}

/** Undoes `runs` on `owner` (in place): each run's cells back to its old owner. */
export function undoRuns(owner: Uint16Array, runs: Int32Array): void {
  for (let i = 0; i < runs.length; i += 3) owner.fill(runs[i + 2]!, runs[i]!, runs[i]! + runs[i + 1]!);
}

export class BorderLog implements Stateful {
  private streams = Array.from({ length: STREAMS }, () => new Bytes());
  private lastTick = 0;
  /** The hour of the first cut: the frames' hours are counted from it. */
  private firstTick = 0;
  /** The owners at the last cut; null before the first (the first cut only takes them). */
  private then: Uint16Array | null = null;

  constructor(
    private readonly owner: () => Uint16Array,
    private readonly width: () => number,
  ) {}

  /** At a month's first hour: the changes since the last cut become a frame (`tick` its hour). */
  cut(tick: number): void {
    const now = this.owner();
    if (this.then && this.then.length === now.length) {
      encodeFrame(this.streams, diffRuns(this.then, now, this.width()), this.width(), tick - this.lastTick);
      this.lastTick = tick;
      this.then.set(now);
    } else {
      this.then = Uint16Array.from(now);
      this.firstTick = tick;
      this.lastTick = tick;
    }
  }

  /** The frames so far, oldest first. */
  frames(): BorderFrame[] {
    return decodeFrames(
      this.streams.map((s) => s.view()),
      this.width(),
      this.firstTick,
    );
  }

  /** The changes since the last cut (none before the first). */
  open(): Int32Array {
    return this.then ? diffRuns(this.then, this.owner(), this.width()) : new Int32Array(0);
  }

  /** The hour of the first cut (0 before it). */
  get firstCut(): number {
    return this.firstTick;
  }

  /** The hour of the last cut (0 before the first). */
  get lastCut(): number {
    return this.lastTick;
  }

  /** The map as it was at the hour of the frame cut at `tick` (or the first cut's), the frames as they are now. */
  ownerAt(tick: number): Uint16Array {
    const out = Uint16Array.from(this.owner());
    undoRuns(out, this.open());
    const frames = this.frames();
    for (let i = frames.length - 1; i >= 0 && frames[i]!.tick > tick; i--) undoRuns(out, frames[i]!.runs);
    return out;
  }

  /** The record's bytes as saved (`borders.log`). */
  logBytes(): Uint8Array {
    return this.then ? this.logSection() : new Uint8Array(0);
  }

  private logSection(): Uint8Array {
    const head = new Bytes();
    head.push(this.firstTick);
    head.push(this.lastTick);
    const body = pack(this.streams.map((s) => s.view()));
    const out = new Uint8Array(head.length + body.length);
    out.set(head.view());
    out.set(body, head.length);
    return out;
  }

  /** Forgets the record (a scenario exported starts without one). */
  clear(): void {
    this.streams = Array.from({ length: STREAMS }, () => new Bytes());
    this.firstTick = 0;
    this.lastTick = 0;
    this.then = null;
  }

  serialize(): Section[] {
    if (!this.then) return [];
    const open = Array.from({ length: STREAMS }, () => new Bytes());
    encodeFrame(open, this.open(), this.width(), 0);
    return [
      { name: 'borders.log', dtype: 'u8', data: Uint8Array.from(this.logSection()) },
      { name: 'borders.open', dtype: 'u8', data: Uint8Array.from(pack(open.map((s) => s.view()))) },
    ];
  }

  deserialize(sections: readonly Section[]): void {
    const log = sections.find((s) => s.name === 'borders.log');
    const open = sections.find((s) => s.name === 'borders.open');
    this.clear();
    if (!log || !open) return;
    const data = log.data as Uint8Array;
    const r = new Reader(data);
    this.firstTick = r.next();
    this.lastTick = r.next();
    const streams = unpack(data.subarray(r.at));
    this.streams = streams.map((d) => {
      const b = new Bytes();
      b.data = Uint8Array.from(d.length > 0 ? d : [0]);
      b.length = d.length;
      return b;
    });
    const then = Uint16Array.from(this.owner());
    const [frame] = decodeFrames(unpack(open.data as Uint8Array), this.width());
    if (frame) undoRuns(then, frame.runs);
    this.then = then;
  }
}
