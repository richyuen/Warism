// Critic run 45: lon,lat -> 1938 cell coords (and land/water). Usage: npx tsx critic/scripts/c45_ll2cell.ts lon,lat ...
import { cellOf } from '../../src/sim/data/terrain';
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { isLand } from '../../src/shared/terrain';
const { w: W, h: H } = size1938();
const s = new Sim({ scenario: '1938', seed: 1, assets: loadAssets1938(W) });
for (const a of process.argv.slice(2)) {
  const [lon, lat] = a.split(',').map(Number);
  const [x, y] = cellOf(lon!, lat!, W, H);
  const k = Math.floor(y) * W + Math.floor(x);
  console.log(a, `${Math.floor(x) + 0.5},${Math.floor(y) + 0.5}`, isLand(s.world.cells.terrain[k]!) ? 'land' : 'water');
}
