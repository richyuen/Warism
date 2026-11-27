import { describe, expect, it } from 'vitest';
import { FIRE_STRIDE, type FireLog } from '../../src/shared/events';
import type { FromWorker, Snapshot, Subscription } from '../../src/shared/protocol';
import type { Sim } from '../../src/sim/sim';
import { SimServer } from '../../src/worker/server';
import { at1938 } from '../helpers/checkpoint';

// ROADMAP R227 (ADR-1158): a fire record is read only by a view that draws elements. Combat worked out each shot's
// two element places and its record every hour all the same, for the worker to throw away at a world zoom and a
// headless run always. `FireLog.wanted`, set by the reader: false, no record is made, and the world is the same.

const SEED = 99;
/** Twenty days in: the first wars of seed 99 are fought, with land fire every hour. */
const START = 24 * 20;
const HOURS = 48;

/** Counts the records written from now on (the calls of `push`). */
function countPushes(fires: FireLog): () => number {
  const push = fires.push.bind(fires);
  let n = 0;
  fires.push = (...rec: Parameters<FireLog['push']>): void => {
    n++;
    push(...rec);
  };
  return () => n;
}

/** `HOURS` hours of the world with a reader of its outputs: the records taken, and the state after. */
function withReader(s: Sim): { records: number; hash: number } {
  let records = 0;
  s.step(HOURS, (w) => {
    records += w.out.fires.length / FIRE_STRIDE;
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  return { records, hash: s.hash() };
}

describe('fire records only for a reader (R227)', () => {
  it('with a reader the hours are recorded; with none no record is made, and the world is the same', () => {
    const read = withReader(at1938(SEED, START));
    expect(read.records).toBeGreaterThan(1000);
    const s = at1938(SEED, START);
    s.world.out.fires.wanted = false;
    const pushes = countPushes(s.world.out.fires);
    const unread = withReader(s);
    expect(pushes()).toBe(0);
    expect(unread.records).toBe(0);
    expect(unread.hash).toBe(read.hash);
  }, 300_000);

  it('a step whose outputs nobody takes makes no record, and leaves the switch as it was', () => {
    const read = withReader(at1938(SEED, START));
    const s = at1938(SEED, START);
    const fires = s.world.out.fires;
    const pushes = countPushes(fires);
    s.step(HOURS);
    expect(pushes()).toBe(0);
    expect(fires.wanted).toBe(true);
    expect(s.hash()).toBe(read.hash);
    // And with its outputs taken again, the records are made again.
    s.step(1, (w) => {
      w.out.events.length = 0;
    });
    expect(pushes()).toBeGreaterThan(0);
  }, 300_000);

  it('the worker asks for the records while its view draws elements, and for none at a world zoom', () => {
    let last: Snapshot | null = null;
    const server = new SimServer((m: FromWorker) => {
      if (m.type === 'snapshot') last = m.snap;
    });
    const sim = at1938(SEED, START);
    server.sim = sim;
    const fires = sim.world.out.fires;
    const pushes = countPushes(fires);
    const all: Subscription['bbox'] = [0, 0, Infinity, Infinity];
    const step = (sub: Subscription): Snapshot => {
      server.handle({ type: 'subscribe', sub }, 0);
      const before: Snapshot | null = last;
      if (before) server.handle({ type: 'ack', seq: before.seq, buffers: before.buffers }, 0);
      server.handle({ type: 'step', n: 2, reqId: 1 }, 0);
      const now: Snapshot | null = last;
      if (now && now !== before) server.handle({ type: 'ack', seq: now.seq, buffers: now.buffers }, 0);
      return last!;
    };
    // The world's whole map at T0: no element drawn, no record asked for or made.
    step({ bbox: all, z: 0, tier: 0, wantsElements: false });
    expect(fires.wanted).toBe(false);
    expect(pushes()).toBe(0);
    // T1 has the elements in its markers but draws no fire (ADR-498): none either.
    step({ bbox: all, z: 0, tier: 1, wantsElements: true });
    expect(fires.wanted).toBe(false);
    expect(pushes()).toBe(0);
    // T2 draws them: the records are made and sent.
    const close = step({ bbox: all, z: 0, tier: 2, wantsElements: true });
    expect(fires.wanted).toBe(true);
    expect(pushes()).toBeGreaterThan(0);
    expect(close.fires.count).toBeGreaterThan(0);
    // Back out: none again.
    const made = pushes();
    step({ bbox: all, z: 0, tier: 0, wantsElements: false });
    expect(fires.wanted).toBe(false);
    expect(pushes()).toBe(made);
  }, 300_000);
});
