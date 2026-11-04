// Critic run 33: who holds a cell at the 1938 start, and whether Britain is "foreign" to it (repatriation's test).
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { foreignTo } from '../../src/sim/systems/movement';
import { blocOf } from '../../src/sim/systems/supply';
import { loadAssets1938 } from '../../tools/headless/assets';
const s = new Sim({ scenario: '1938', seed: Number(process.argv[2]), assets: loadAssets1938(size1938().w) });
const w = s.world; const W = w.cells.w;
const tag = (n: number) => NATIONS_1938[n - 1]?.tag ?? n;
for (const a of process.argv.slice(3)) { const [x, y] = a.split(',').map(Number); const c = Math.floor(y!) * W + Math.floor(x!); const h = w.cells.controller[c]!; console.log(a, 'holder', tag(h), 'blocHolder', blocOf(w, h), 'blocENG', blocOf(w, 20), 'foreign(ENG)', foreignTo(w, 20, h)); }
