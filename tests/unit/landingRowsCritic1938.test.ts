import { describe, expect, it } from 'vitest';
import { FAR_CASES, farRows, GRID_SETUPS, gridRows } from '../helpers/landingRows';

// ROADMAP R47d: the landings bar's rows say, hour by hour, what their divisions' panels say, on the critic's landing
// cases (the whole set: `tools/diag/landingRows.ts`, 108 cases, 0 broken at R47d). Here a few: run 50's three-division
// click Tokyo → Shanghai (20841) and its far route USA → Britain, and of run 47's grid a recall and a cancel on each
// setup, each with both divisions.

describe("a landing's row against its divisions' panels on the critic's cases (ROADMAP R47d)", () => {
  for (const f of [FAR_CASES.find((c) => c.seed === 20841)!, FAR_CASES.find((c) => c.seed === 3517)!]) {
    it(`far: ${f.seed} ${f.tag}, ${f.n} to ${f.to}`, { timeout: 240_000 }, () => {
      const r = farRows(f);
      expect(r.hours).toBeGreaterThan(48);
      expect(r.broken).toEqual([]);
    });
  }
  for (const s of GRID_SETUPS)
    for (const [op, hour] of [['recall', 24], ['cancel', 6]] as const) {
      it(`grid: ${s.seed} ${op} at ${hour} h, both`, { timeout: 240_000 }, () => {
        const r = gridRows(s, op, hour, 'all')!;
        expect(r, 'a base').not.toBeNull();
        expect(r.broken).toEqual([]);
      });
    }
});
