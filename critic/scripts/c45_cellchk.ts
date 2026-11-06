// Critic run 45: is each given cell land? Usage: npx tsx critic/scripts/c45_cellchk.ts x,y x,y ...
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { isLand } from '../../src/shared/terrain';
const s = new Sim({ scenario: '1938', seed: 1, assets: loadAssets1938(size1938().w) });
const w = s.world;
for (const a of process.argv.slice(2)) {
  const [x, y] = a.split(',').map(Number);
  const k = Math.floor(y!) * w.cells.w + Math.floor(x!);
  console.log(a, isLand(w.cells.terrain[k]!) ? 'land' : 'water', 'owner', w.cells.owner?.[k]);
}
