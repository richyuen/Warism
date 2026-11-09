// Critic run 58: the landing water of two click points on the 1938 map (landingOf), at the start of seed 29043.
import { Sim } from '../src/sim/sim';
import { SIZE_1938 } from '../src/sim/scenario1938';
import { loadAssets1938 } from '../tools/headless/assets';
import { landingOf } from '../src/sim/systems/amphibious';
const s = new Sim({ scenario: '1938', seed: 29043, assets: loadAssets1938(SIZE_1938.w) });
const w = s.world; const W = w.cells.w;
for (const [x, y] of [[1034.5, 279.5], [1034.5, 277.5], [1034.5, 278.5]]) {
  const o = landingOf(w, Math.floor(y) * W + Math.floor(x));
  console.log(x, y, o ? `water ${o.water % W},${Math.floor(o.water / W)} land ${o.land % W},${Math.floor(o.land / W)}` : 'none');
}
