import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { homeNeighbours } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { capitalCells } from '../../src/sim/systems/capitals';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';

// ROADMAP R218 (found in R217): a shore capital's coordinates lie in a sea cell (13 of 1938's nations, Rio and Tallinn
// among them; 10 of seed 7's random 60; 2 of 89413's 3), and the readers that took the coordinates' cell found no land
// of the nation there: `homeNeighbours` no home (every neighbour taken as one), sea supply no capital's land in its
// bloc's home, the map's label no capital's piece. The capital is its city's cell (`capitalCell`, `capitalCells`).

const assets = assets1938(SIZE_1938.w);

describe("a capital's land is its city's cell (R218)", () => {
  const worlds: [string, () => Sim][] = [
    ['1938, seed 99', () => new Sim({ scenario: '1938', seed: 99, assets })],
    ['the random world of 60, seed 7', () => new Sim({ scenario: 'random', seed: 7, assets, options: { nations: 60 } })],
    ['the random world of 3, seed 89413', () => new Sim({ scenario: 'random', seed: 89413, assets, options: { nations: 3 } })],
  ];
  for (const [name, make] of worlds)
    it(`${name}: every living nation's capital cell is land of its own, and it has a home`, { timeout: 120_000 }, () => {
      const w = make().world;
      const nc = w.nations.cols;
      const nav = navOf(w);
      const caps = capitalCells(w);
      const off: string[] = [];
      let shore = 0;
      w.nations.forEach((n) => {
        if (nc.living[n] !== 1) return;
        const c = caps[n]!;
        if (c < 0 || w.cells.owner[c] !== n || nav.grid.component[c] === 0) off.push(`${n}: capital cell ${c}`);
        // No home only where the capital's province is another's by its centre (the coarse graph's owner: Danzig, the
        // Chinese Communists and Mengjiang in 1938), never for want of land at the capital.
        const node = nav.graph.nodeOf[c]!;
        const centre = nav.graph.centre[node] ?? -1;
        if (homeNeighbours(w, n) === null && node !== 0 && centre >= 0 && w.cells.owner[centre] === n) off.push(`${n}: no home`);
        const xy = Math.floor(nc.capitalY[n]!) * w.cells.w + Math.floor(nc.capitalX[n]!);
        if (w.cells.owner[xy] !== n || nav.grid.component[xy] === 0) shore++;
      });
      expect(off).toEqual([]);
      // The case is met: some capitals' coordinates are in the sea.
      expect(shore, 'capitals whose coordinates lie off their land').toBeGreaterThan(0);
    });

  it("no source of the sim, the worker or the shared code makes a cell of a capital's coordinates but `capitals.ts`", () => {
    const roots = ['src/sim', 'src/worker', 'src/shared'].map((r) => path.resolve(import.meta.dirname, '../..', r));
    const files: string[] = [];
    const walk = (d: string): void => {
      for (const e of readdirSync(d)) {
        const p = path.join(d, e);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.ts')) files.push(p);
      }
    };
    roots.forEach(walk);
    const cellOf = /Math\.floor\([^)]*capital[XY]\[[^\]]*\]!?\)+\s*\*/;
    const found = files.filter((f) => path.basename(f) !== 'capitals.ts' && cellOf.test(readFileSync(f, 'utf8'))).map((f) => path.relative(process.cwd(), f));
    expect(found).toEqual([]);
    expect(cellOf.test('const cap = Math.min(h - 1, Math.max(0, Math.floor(nc.capitalY[n]!))) * w'), 'the pattern finds the old reader').toBe(true);
  });
});
