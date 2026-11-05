// Critic run 34 (copy of run 33): lon/lat pairs to 1938 cells (the real projection). Usage: npx tsx critic/scripts/c40_cells.ts lon,lat ...
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
for (const a of process.argv.slice(2)) { const [lo, la] = a.split(',').map(Number); const [x, y] = cellOf(lo!, la!, SIZE_1938.w, SIZE_1938.h); console.log(a, Math.floor(x) + 0.5, Math.floor(y) + 0.5); }
