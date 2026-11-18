import { describe, expect, it } from 'vitest';
import type { NationStat, WarStat } from '../../src/shared/protocol';
import { bannerOrder, heldRow, HOLD_TICKS } from '../../src/ui/bannerOrder';
import type { World } from '../../src/sim/world';
import { FOUGHT_TICKS, WarsFought } from '../../src/worker/warsFought';

// ROADMAP R132 (critic run 75, R75-N1): R130 ordered the banners by `battle`, which goes on and off by the hour, and
// the row changed places 41 times in a minute at ×5. A war fought in the last FOUGHT_TICKS keeps its place.

const world = (tick: number): World => ({ tick }) as unknown as World;

describe('WarsFought: a battle of the last days, not of the hour (ROADMAP R132)', () => {
  it('a war stays fought for FOUGHT_TICKS after its last battle, then not', () => {
    const f = new WarsFought();
    const w = world(100);
    expect([...f.of(w, [1, 2], new Set([1]))]).toEqual([1]);
    for (const t of [101, 130, 100 + FOUGHT_TICKS]) {
      (w as { tick: number }).tick = t;
      expect(f.of(w, [1, 2], new Set()).has(1), `tick ${t}`).toBe(true);
    }
    (w as { tick: number }).tick = 101 + FOUGHT_TICKS;
    expect(f.of(w, [1, 2], new Set()).has(1)).toBe(false);
    // A battle again: fought at once.
    expect(f.of(w, [1, 2], new Set([2])).has(2)).toBe(true);
  });

  it('a war ended is forgotten; a new world or a tick back starts again', () => {
    const f = new WarsFought();
    const w = world(10);
    f.of(w, [1], new Set([1]));
    (w as { tick: number }).tick = 11;
    expect(f.of(w, [], new Set()).size).toBe(0);
    expect(f.of(w, [1], new Set()).has(1), 'an id seen again after it ended is a new war').toBe(false);
    f.of(w, [1], new Set([1]));
    (w as { tick: number }).tick = 5;
    expect(f.of(w, [1], new Set()).has(1), 'a load to an earlier tick').toBe(false);
    f.of(w, [1], new Set([1]));
    expect(f.of(world(6), [1], new Set()).has(1), 'another world').toBe(false);
  });
});

describe('bannerOrder (ROADMAP R121, R130, R132)', () => {
  const nation = (id: number, men: number): NationStat => ({ id, men }) as unknown as NationStat;
  const byId = new Map([nation(1, 900), nation(2, 100), nation(3, 50), nation(4, 40), nation(5, 30), nation(6, 20)].map((n) => [n.id, n]));
  const war = (id: number, a: number, d: number, battle: boolean, fought: boolean): WarStat => ({ id, attackers: [a], defenders: [d], score: 0, startTick: id, battle, fought, toDeath: [false, false], exhaustion: [0, 0] });

  it('a war fought in the last days keeps its place among the large ones while its battle comes and goes by the hour', () => {
    const big = war(1, 1, 2, true, true);
    const small = war(2, 3, 4, true, true);
    const quiet = war(3, 5, 6, false, false);
    const order = (b1: boolean, b2: boolean): number[] => bannerOrder([quiet, { ...small, battle: b2 }, { ...big, battle: b1 }], byId, 0).map((w) => w.id);
    for (const [b1, b2] of [[true, true], [false, true], [true, false], [false, false]] as const) expect(order(b1, b2)).toEqual([1, 2, 3]);
  });

  it('a fought war before a larger quiet one (R130); the played nation\'s own first (R121)', () => {
    const giant = war(1, 1, 2, false, false);
    const fought = war(2, 5, 6, false, true);
    expect(bannerOrder([giant, fought], byId, 0).map((w) => w.id)).toEqual([2, 1]);
    expect(bannerOrder([giant, fought], byId, 2).map((w) => w.id)).toEqual([1, 2]);
  });
});

describe('heldRow: a place kept for some days once taken (ROADMAP R132)', () => {
  const war = (id: number, mine = false): WarStat => ({ id, attackers: [mine ? 99 : id * 10], defenders: [id * 10 + 1], score: 0, startTick: 0, battle: true, fought: true, toDeath: [false, false], exhaustion: [0, 0] });
  const ids = (row: { id: number }[]): number[] => row.map((h) => h.id);
  const [a, b, c, d, e] = [war(1), war(2), war(3), war(4), war(5)];

  it('a war that took its place keeps it HOLD_TICKS though another outranks it; then gives it up', () => {
    let row = heldRow([a, b, c, d], 3, 0, [], 0);
    expect(ids(row)).toEqual([1, 2, 3]);
    row = heldRow([a, b, d, c], 3, 10, row, 0);
    expect(ids(row), 'c held against d').toEqual([1, 2, 3]);
    row = heldRow([a, b, d, c], 3, HOLD_TICKS, row, 0);
    expect(ids(row), 'c held its place HOLD_TICKS: d takes it').toEqual([1, 2, 4]);
    expect(row.find((h) => h.id === 4)!.since).toBe(HOLD_TICKS);
    // d is young now: c back above it does not take its place at once.
    expect(ids(heldRow([a, b, c, d], 3, HOLD_TICKS + 1, row, 0))).toEqual([1, 2, 4]);
  });

  it('a held war gone quiet gives its place to a fought war at once, in its slot; held against a quiet one (R148)', () => {
    let row = heldRow([a, b, c, d], 3, 0, [], 0);
    const quietC = { ...c, battle: false, fought: false };
    const quietD = { ...d, battle: false, fought: false };
    // c gone quiet, d fought: d takes c's slot at once.
    expect(ids(heldRow([a, b, d, quietC], 3, 10, row, 0)), 'd fought, c quiet').toEqual([1, 2, 4]);
    // Both quiet, d larger: c held, as R132.
    row = heldRow([a, b, quietD, quietC], 3, 10, row, 0);
    expect(ids(row), 'both quiet: c held').toEqual([1, 2, 3]);
  });

  it("each war in the slot it had (the banner under a resting cursor stays its war's); a newcomer in a slot one left", () => {
    const row = heldRow([a, b, c, d], 3, 0, [], 0);
    expect(ids(heldRow([c, b, a, d], 3, 3 * HOLD_TICKS, row, 0))).toEqual([1, 2, 3]);
    expect(ids(heldRow([b, d, c], 3, 3 * HOLD_TICKS, heldRow([a, b, c, d, e], 3, 1, row, 0), 0)), 'a over: all on the row, by the order').toEqual([2, 4, 3]);
    expect(ids(heldRow([b, d, c, e], 3, 3 * HOLD_TICKS, row, 0)), 'a over: d in its slot').toEqual([4, 2, 3]);
  });

  it('a place taken while all were on the row is neither held nor kept in its slot (R121: the largest first)', () => {
    const all = heldRow([b, c], 3, 0, [], 0);
    expect(all.every((h) => !h.contested)).toBe(true);
    expect(ids(heldRow([a, b, c], 3, 1, all, 0)), 'a great war on a row with room: first').toEqual([1, 2, 3]);
    expect(ids(heldRow([a, d, e, b, c], 3, 2, heldRow([a, b, c], 3, 1, all, 0), 0)), 'more wars than the row: the order').toEqual([1, 4, 5]);
  });

  it("a war over leaves at once; the played nation's wars take a place at once; a load back is not held to", () => {
    const row = heldRow([a, b, c, d, e], 3, 0, [], 0);
    expect(ids(heldRow([a, b, d, e], 3, 1, row, 0)), 'c over: d in').toEqual([1, 2, 4]);
    const m = war(6, true);
    expect(ids(heldRow([m, a, b, c, d], 3, 1, row, 99)), "the played nation's war first").toEqual([6, 1, 2]);
    const later = heldRow([a, b, c, d], 3, 100, [], 0);
    expect(ids(heldRow([a, b, d, c], 3, 50, later, 0)), 'a tick before the holders took their places').toEqual([1, 2, 4]);
  });

  it('opened and closed: the row of the count shown', () => {
    const row = heldRow([a, b, c, d, e, war(6), war(7)], 3, 0, [], 0);
    const opened = heldRow([a, b, d, c, e, war(6), war(7)], 6, 1, row, 0);
    expect(ids(opened)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ids(heldRow([a, b, d, c, e, war(6), war(7)], 3, 2, opened, 0)), 'closed: the young holders by the order').toEqual([1, 2, 4]);
  });
});
