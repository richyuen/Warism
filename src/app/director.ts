import { signal } from '@preact/signals';
import { EventKind } from '../shared/events';
import { DIRECTOR_KINDS, type TickerRow } from '../shared/history';

/**
 * The director (ROADMAP R142, goal 1): a switch of the bottom bar, and the camera goes by itself to what happens: a new
 * war (the ticker's place, the capital of the nation it was declared on), a Major Battle, a capital taken, a nuclear
 * strike (the worker's `director` rows). It holds each some seconds and goes on; a strike goes before what waits, the
 * rest in their order. A shot that waits and is in the view when the camera stands is seen there and not flown to.
 * The player's wheel, press on the map or camera key (`CameraController.onTaken`) hands the camera back: the switch
 * goes off. The page's alone: no sim rule.
 */

/** No cut within this of the last (the AT's 4 s, and a margin for the frame's step). */
export const DIRECTOR_GAP_MS = 4500;
/** Held at least this long once the camera stands there. */
export const DIRECTOR_HOLD_MS = 2500;
/** A shot older than this when its turn comes is passed over: old news. */
export const DIRECTOR_STALE_MS = 45_000;
/** The shots that wait, at most (the oldest go first). */
export const DIRECTOR_QUEUE = 60;
/** Inside the view's edges by this many CSS px, the view this many km across at most (twice the ticker's flight): seen. */
export const DIRECTOR_INSET_PX = 40;
export const DIRECTOR_SEEN_KM = 3000;

export interface DirectorShot {
  key: string;
  kind: number;
  x: number;
  y: number;
  /** The page's clock when it came (ms). */
  came: number;
}

/** A row's key: the same in History's rows and the ticker's (the test's measure). */
export const shotKey = (r: { tick: number; kind: number; a: number; b: number }): string => `${r.tick}:${r.kind}:${r.a}:${r.b}`;

export class Director {
  readonly on = signal(false);
  /** Flies the camera to a place (`MapView.showPlace`). */
  go: (x: number, y: number) => void = () => {};
  /** Whether a place is in the view, `inset` px inside it (`MapView.inView`). */
  inView: (x: number, y: number, inset: number) => boolean = () => false;
  /** Whether the camera is still under way. */
  moving: () => boolean = () => false;
  /** The km across the view. */
  kmAcross: () => number = () => Number.POSITIVE_INFINITY;
  private queue: DirectorShot[] = [];
  private lastCut = Number.NEGATIVE_INFINITY;
  private stoodAt = Number.NEGATIVE_INFINITY;
  private wasMoving = false;
  /** What it showed, and when it cut (the page's clock): the test's record, the last 2000. */
  readonly seen: { key: string; at: number }[] = [];
  readonly cuts: number[] = [];

  /** On or off; on, the newest shot of `latest` (the ticker's rows) first. */
  toggle(latest: readonly TickerRow[] = [], now = performance.now()): void {
    this.queue = [];
    this.lastCut = Number.NEGATIVE_INFINITY;
    this.on.value = !this.on.value;
    if (this.on.value) this.add(latest.filter((r) => DIRECTOR_KINDS.has(r.kind)).slice(-1), now);
  }

  /** The player took the camera: off. */
  stop(): void {
    if (!this.on.value) return;
    this.on.value = false;
    this.queue = [];
  }

  /** New rows of the worker's (`nationStats.director`). */
  add(rows: readonly TickerRow[], now = performance.now()): void {
    if (!this.on.value) return;
    for (const r of rows) {
      const shot = { key: shotKey(r), kind: r.kind, x: r.x, y: r.y, came: now };
      if (r.kind === EventKind.NukeCasualties) this.queue.unshift(shot);
      else this.queue.push(shot);
    }
    if (this.queue.length > DIRECTOR_QUEUE) this.queue.splice(0, this.queue.length - DIRECTOR_QUEUE);
  }

  /** Each frame: what stands in the view is seen; the next cut when its time has come. */
  update(now: number): void {
    if (!this.on.value) return;
    const moving = this.moving();
    if (this.wasMoving && !moving) this.stoodAt = now;
    this.wasMoving = moving;
    if (!moving && this.kmAcross() <= DIRECTOR_SEEN_KM) {
      this.queue = this.queue.filter((s) => {
        if (!this.inView(s.x, s.y, DIRECTOR_INSET_PX)) return true;
        this.record(this.seen, { key: s.key, at: now });
        return false;
      });
    }
    this.queue = this.queue.filter((s) => now - s.came <= DIRECTOR_STALE_MS);
    if (this.queue.length === 0 || moving || now - this.lastCut < DIRECTOR_GAP_MS || now - this.stoodAt < DIRECTOR_HOLD_MS) return;
    const next = this.queue.shift()!;
    this.lastCut = now;
    this.record(this.cuts, now);
    this.wasMoving = true;
    this.go(next.x, next.y);
    // The shot flown to is seen when the camera stands (it is then in the view): it waits as the others do.
    this.queue.unshift(next);
  }

  private record<T>(list: T[], v: T): void {
    list.push(v);
    if (list.length > 2000) list.shift();
  }
}
