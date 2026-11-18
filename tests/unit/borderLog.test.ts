import { describe, expect, it } from 'vitest';
import { decodeBorderFrames, diffRuns, encodeBorderFrames, undoRuns, type BorderFrame } from '../../src/sim/borderLog';
import { decodeSections } from '../../src/sim/core/sections';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../helpers/earth';

// ROADMAP R143a (ADR-1123): the borders' record, the cells that changed owner each month, kept backward from the map of
// now. Its codec round-trips; the map it gives at each 1 January is the map of a run stopped there; a save made in
// mid-month loads to the same record and the same game; a start and an exported scenario carry none.

/** A deterministic random number in [0, 1). */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const sameMap = (a: Uint16Array, b: Uint16Array): number => {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
};

describe("the borders' record (ROADMAP R143a)", () => {
  it('its codec gives back the runs of maps that change by blobs and by single cells', () => {
    const [w, h] = [97, 41];
    const r = rng(11);
    let map = new Uint16Array(w * h).map(() => 1 + Math.floor(r() * 3));
    const maps = [map];
    const frames: BorderFrame[] = [];
    for (let m = 1; m <= 40; m++) {
      const next = Uint16Array.from(map);
      // A blob of one new owner (a front's advance), and a few single cells.
      const [cx, cy, rad, to] = [Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 9), Math.floor(r() * 400)];
      for (let y = Math.max(0, cy - rad); y < Math.min(h, cy + rad); y++) for (let x = Math.max(0, cx - rad); x < Math.min(w, cx + rad); x++) if ((x - cx) ** 2 + (y - cy) ** 2 < rad * rad) next[y * w + x] = to;
      for (let k = 0; k < 5; k++) next[Math.floor(r() * w * h)] = Math.floor(r() * 65535);
      frames.push({ tick: m * 720 + (m % 3), runs: diffRuns(map, next, w) });
      maps.push(next);
      map = next;
    }
    const back = decodeBorderFrames(encodeBorderFrames(frames, w), w);
    expect(back.map((f) => f.tick)).toEqual(frames.map((f) => f.tick));
    for (let i = 0; i < frames.length; i++) expect([...back[i]!.runs], `frame ${i}`).toEqual([...frames[i]!.runs]);
    // Undone from the last map back, each frame gives the map before it.
    const at = Uint16Array.from(map);
    for (let i = frames.length - 1; i >= 0; i--) {
      undoRuns(at, back[i]!.runs);
      expect(sameMap(at, maps[i]!), `map ${i}`).toBe(0);
    }
  });

  for (const seed of [7, 1938]) {
    it(`seed ${seed}: the map at each 1 January is the map of a run stopped there`, () => {
      const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
      // 1938 and 1939 have 365 days: 1 January 1939 and 1940 at these hours.
      const jan1 = [365 * 24, 730 * 24];
      const maps: Uint16Array[] = [];
      for (const t of jan1) {
        s.step(t + 1 - s.world.tick, (w) => {
          w.out.events.length = 0;
          w.out.fires.length = 0;
        });
        maps.push(Uint16Array.from(s.world.cells.owner));
      }
      s.step(24 * 100, (w) => {
        w.out.events.length = 0;
        w.out.fires.length = 0;
      });
      const b = s.world.borders;
      expect(b.firstCut).toBe(0);
      const ticks = b.frames().map((f) => f.tick);
      for (const t of jan1) expect(ticks).toContain(t);
      jan1.forEach((t, i) => expect(sameMap(b.ownerAt(t), maps[i]!), `cells unlike on 1 January ${1939 + i}`).toBe(0));
      // The world did change owners in the two years: the frames are not empty.
      expect(b.frames().reduce((n, f) => n + f.runs.length / 3, 0)).toBeGreaterThan(100);
    }, 600_000);
  }

  it('a save made in mid-month loads to the same record and the same game', () => {
    const a = new Sim({ scenario: '1938', seed: 7, assets: assets1938(SIZE_1938.w) });
    a.step(24 * 50 + 7);
    expect(a.world.borders.open().length).toBeGreaterThan(0);
    const b = new Sim({ scenario: '1938', seed: 7, assets: assets1938(SIZE_1938.w) });
    b.load(a.save());
    expect(b.hash()).toBe(a.hash());
    for (const s of [a, b]) s.step(24 * 70);
    expect(b.hash()).toBe(a.hash());
    expect([...b.world.borders.logBytes()]).toEqual([...a.world.borders.logBytes()]);
    expect(b.world.borders.frames().length).toBe(a.world.borders.frames().length);
  }, 600_000);

  it('a start and an exported scenario carry no record', () => {
    const s = new Sim({ scenario: '1938', seed: 7, assets: assets1938(SIZE_1938.w) });
    const names = (bytes: Uint8Array): string[] => decodeSections(bytes).map((x) => x.name);
    expect(names(s.save()).filter((n) => n.startsWith('borders.'))).toEqual([]);
    s.step(24 * 40);
    expect(names(s.save())).toContain('borders.log');
    expect(names(s.exportScenario().bytes).filter((n) => n.startsWith('borders.'))).toEqual([]);
    // The game itself keeps its record.
    expect(names(s.save())).toContain('borders.log');
  }, 120_000);
});
