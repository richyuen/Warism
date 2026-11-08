// Critic run 52: lon,lat pairs to 1938 cells (prints JSON). Usage: npx tsx critic/scripts/c52_ll.ts lon,lat ...
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
console.log(JSON.stringify(process.argv.slice(2).map((s) => { const [a, b] = s.split(',').map(Number); return cellOf(a!, b!, SIZE_1938.w, SIZE_1938.h).map((v) => Math.floor(v) + 0.5); })));
