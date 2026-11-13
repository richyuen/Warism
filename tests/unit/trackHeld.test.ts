import { describe, expect, it } from 'vitest';
import scenario1938h from '../../data/scenarios/1938h/scenario.json' with { type: 'json' };
import { TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Track } from '../../src/sim/track';

// ROADMAP R72b: `Track.held` and `Track.frozen` find the holds standing once a tick, not each of the track's holds for
// every pair. Against the loop they had before, over the whole track by day, every pair of the holds' nations, with
// puppets, and with the events applied moving within a tick.
type Hold = { i: number; until: number; a: ReadonlySet<number>; b: ReadonlySet<number>; frozen: boolean };

/** The loop of `held`/`frozen` before R72b: the first hold begun and not ended with `a` and `b` on its two sides. */
function before(holds: readonly Hold[], next: number, a: number, b: number, tick: number, overlord: ArrayLike<number>): Hold | null {
  const oa = overlord[a] ?? 0;
  const ob = overlord[b] ?? 0;
  const on = (s: ReadonlySet<number>, n: number, o: number): boolean => s.has(n) || (o !== 0 && s.has(o));
  for (const h of holds) {
    if (h.i >= next || tick >= h.until) continue;
    if ((on(h.a, a, oa) && on(h.b, b, ob)) || (on(h.a, b, ob) && on(h.b, a, oa))) return h;
  }
  return null;
}

describe('the holds standing found once a tick (R72b)', () => {
  const t = new Track(TIMELINE_1938H, TAGS_1938H, scenario1938h.startDate);
  const holds = (t as unknown as { holdAt: readonly Hold[] }).holdAt;
  const nations = [...new Set(holds.flatMap((h) => [...h.a, ...h.b]))].sort((p, q) => p - q);
  // Each fourth nation of the holds a puppet of the next, and one nation in no hold a puppet of the first.
  const overlord = new Float64Array(TAGS_1938H.length + 1);
  for (let k = 0; k + 1 < nations.length; k += 4) overlord[nations[k]!] = nations[k + 1]!;
  const outside = TAGS_1938H.findIndex((_, i) => !nations.includes(i + 1)) + 1;
  overlord[outside] = nations[0]!;
  const asked = [...nations, outside];
  const last = t.ticks.at(-1)! + 24 * 30;

  it('has holds to test, standing and not', () => {
    expect(holds.length).toBeGreaterThan(20);
    expect(asked.length).toBeGreaterThan(20);
  });

  // The hours where a hold can begin or end (each event's, each hold's last and its end), and each 30th day between.
  const hours = new Set<number>();
  for (const at of t.ticks) hours.add(at);
  for (const h of holds) for (const at of [h.until - 1, h.until]) hours.add(at);
  for (let tick = 0; tick <= last; tick += 24 * 30) hours.add(tick);

  it('agrees with the loop before it at each hour a hold begins or ends and each month, every pair, both orders', () => {
    let standing = 0;
    let checked = 0;
    let wrong = 0;
    for (const tick of [...hours].sort((p, q) => p - q)) {
      let next = 0;
      while (next < t.ticks.length && t.ticks[next]! <= tick) next++;
      // The tick's first hour with one event fewer applied, then all of them: the list follows `next` within a tick.
      for (const n of next > 0 ? [next - 1, next] : [next]) {
        t.next = n;
        for (const a of asked) {
          for (const b of asked) {
            const want = before(holds, n, a, b, tick, overlord);
            if (t.held(a, b, tick, overlord) !== (want !== null) || t.frozen(a, b, tick, overlord) !== (want?.frozen ?? false)) wrong++;
            if (want) standing++;
            checked++;
          }
        }
      }
    }
    expect(wrong).toBe(0);
    expect(standing).toBeGreaterThan(1000);
    expect(checked).toBeGreaterThan(standing);
  });

  it('none once the track has ended', () => {
    t.next = t.ticks.length;
    t.ended = true;
    for (const a of asked) for (const b of asked) expect(t.held(a, b, 0, overlord)).toBe(false);
  });
});
