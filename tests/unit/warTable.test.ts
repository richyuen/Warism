import { describe, expect, it } from 'vitest';
import { FRONT_NATIONS, warTable } from '../../src/render/map/ground';

// ROADMAP R90a (ADR-1078): the map's pass asks this table whether the two nations either side of a border are at war.

describe('the war table of the fronts (R90a)', () => {
  const at = (t: Uint8Array, a: number, b: number): number => t[a * FRONT_NATIONS + b]!;

  it('each pair both ways, and no other', () => {
    const t = warTable([3, 7, 12, 3]);
    expect([at(t, 3, 7), at(t, 7, 3), at(t, 12, 3), at(t, 3, 12)]).toEqual([1, 1, 1, 1]);
    expect(t.reduce((n, v) => n + v, 0)).toBe(4);
    expect([at(t, 7, 12), at(t, 3, 3)]).toEqual([0, 0]);
  });

  it('no wars: an empty table of its full size', () => {
    const t = warTable([]);
    expect(t.length).toBe(FRONT_NATIONS * FRONT_NATIONS);
    expect(t.every((v) => v === 0)).toBe(true);
  });

  it('nation 0 (no one), an id beyond the table and an odd last id are left out', () => {
    const t = warTable([0, 5, 5, FRONT_NATIONS, FRONT_NATIONS - 1, 2, 9]);
    expect(t.reduce((n, v) => n + v, 0)).toBe(2);
    expect([at(t, FRONT_NATIONS - 1, 2), at(t, 2, FRONT_NATIONS - 1)]).toEqual([1, 1]);
  });
});
