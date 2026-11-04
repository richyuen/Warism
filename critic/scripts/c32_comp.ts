// Critic run 32: the land component (navOf(world).grid.component) of cells, and overSea between pairs.
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf } from '../../src/sim/world';
import { loadAssets1938 } from '../../tools/headless/assets';
const s = new Sim({ scenario: '1938', seed: 3517, assets: loadAssets1938(size1938().w) });
const g = navOf(s.world).grid, W = s.world.cells.w;
for (const a of process.argv.slice(2)) { const [x, y] = a.split(',').map(Number); console.log(a, 'comp', g.component[Math.floor(y!) * W + Math.floor(x!)]); }
