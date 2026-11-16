import { describe, expect, it } from 'vitest';
import { changedCells, ControlFlashes, FLASH_ALPHA, FLASH_MAX_CELLS, FLASH_MS, flashAlpha } from '../../src/render/fx/flashes';

// ROADMAP R90b (ADR-1079): land that changes hands flashes once.

describe('the flash of land that changed hands (R90b)', () => {
  it('its opacity: FLASH_ALPHA as it begins, never rising, nothing from FLASH_MS on or before it began', () => {
    expect(flashAlpha(0)).toBe(FLASH_ALPHA);
    let last = FLASH_ALPHA;
    for (let age = 0; age < FLASH_MS; age += 7) {
      const a = flashAlpha(age);
      expect(a).toBeLessThanOrEqual(last);
      expect(a).toBeGreaterThan(0);
      last = a;
    }
    expect(flashAlpha(FLASH_MS)).toBe(0);
    expect(flashAlpha(FLASH_MS * 10)).toBe(0);
    expect(flashAlpha(-1)).toBe(0);
  });

  it('the cells that changed hands: another holder than before; not the sea, not land no one held, not land left to no one', () => {
    const out: number[] = [];
    //            same  taken  from none  to none  taken  sea
    changedCells([5, 5, 0, 7, 7, 0], [5, 6, 6, 0, 9, 0], 6, 100, 40, out);
    expect(out).toEqual([101, 40, 104, 40]);
    // Only the first `n` of the row.
    const few: number[] = [];
    changedCells([1, 1, 1], [2, 2, 2], 2, 0, 3, few);
    expect(few).toEqual([0, 3, 1, 3]);
  });

  it('flashing for FLASH_MS, then none; the view is told to keep drawing meanwhile', () => {
    const f = new ControlFlashes();
    expect(f.animating(0)).toBe(false);
    f.add([1, 1, 2, 1], 1000);
    f.add([], 1100);
    f.add([9, 9], 1400);
    for (const [now, n] of [[1000, 2], [1399, 2], [1400, 3], [1000 + FLASH_MS - 1, 3], [1000 + FLASH_MS, 1], [1400 + FLASH_MS - 1, 1], [1400 + FLASH_MS, 0]] as const) {
      expect(f.count(now), `at ${now}`).toBe(n);
      expect(f.animating(now), `at ${now}`).toBe(n > 0);
    }
  });

  it('the newest FLASH_MAX_CELLS at most; a start or a load clears them', () => {
    const f = new ControlFlashes();
    const cells = (n: number): number[] => Array.from({ length: 2 * n }, (_, i) => i);
    f.add(cells(FLASH_MAX_CELLS - 10), 0);
    f.add(cells(20), 10);
    // The older batch went: the newest 20 are left.
    expect(f.count(20)).toBe(20);
    f.add(cells(FLASH_MAX_CELLS + 500), 30);
    expect(f.count(40)).toBe(FLASH_MAX_CELLS);
    f.clear();
    expect(f.count(40)).toBe(0);
    expect(f.animating(40)).toBe(false);
  });
});
