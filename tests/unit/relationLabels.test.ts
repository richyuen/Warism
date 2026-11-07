import { describe, expect, it } from 'vitest';
import { labelBox, placeLabels, type Box, type LabelItem } from '../../src/ui/relationLabels';

// ROADMAP R34a (critic run 37, R37-N4: "AustraliaUnited Kingdom"): the relations graph's labels never print over
// each other, stay in the view, and the most important is always named.

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const overlap = (a: Box, b: Box): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

describe('the relations graph\'s labels (ROADMAP R34a)', () => {
  for (const [seed, n, h] of [[1, 40, 10], [2, 120, 10], [3, 120, 18], [4, 200, 6]] as const) {
    it(`seed ${seed}: ${n} nodes, labels ${h} high: none overlaps, all in view, the first named`, () => {
      const r = rng(seed);
      const view: Box = { x0: 0, y0: 0, x1: 640, y1: 440 };
      const items: LabelItem[] = Array.from({ length: n }, (_, i) => ({ key: `n${i}`, x: 20 + r() * 600, y: 20 + r() * 400, r: 5 + r() * 15, w: h * (3 + r() * 9), h }));
      const out = placeLabels(items, view, 2);
      const boxes = [...out].map(([key, p]) => {
        const it = items.find((x) => x.key === key)!;
        return labelBox(p, it.w, it.h);
      });
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i]!;
        expect(b.x0 >= 0 && b.y0 >= 0 && b.x1 <= 640 && b.y1 <= 440, `label ${i} in view`).toBe(true);
        for (let j = i + 1; j < boxes.length; j++) expect(overlap(b, boxes[j]!), `labels ${i} and ${j}`).toBe(false);
      }
      expect(out.has('n0') || labelBox({ x: items[0]!.x, y: items[0]!.y + items[0]!.r + 2 + h * 0.8, anchor: 'middle' }, items[0]!.w, h).x0 < 0, 'the first named where it fits').toBe(true);
      expect(out.size, 'some named').toBeGreaterThan(Math.min(10, n / 10));
    });
  }

  it('two nodes side by side: the second label moves aside rather than print over the first', () => {
    const items: LabelItem[] = [
      { key: 'a', x: 100, y: 100, r: 8, w: 60, h: 10 },
      { key: 'b', x: 120, y: 100, r: 8, w: 70, h: 10 },
    ];
    const out = placeLabels(items, { x0: 0, y0: 0, x1: 640, y1: 440 }, 2);
    expect(out.get('a')!.anchor).toBe('middle');
    expect(out.get('a')!.y).toBeGreaterThan(100);
    expect(out.get('b'), 'b placed elsewhere').toBeDefined();
    expect(overlap(labelBox(out.get('a')!, 60, 10), labelBox(out.get('b')!, 70, 10))).toBe(false);
  });
});
