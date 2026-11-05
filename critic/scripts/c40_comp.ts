// Critic run 39 (new): which land components the cells around Shanghai's landing lie in, and the landing landingOf
// gives for the clicks around Shanghai. Usage: npx tsx critic/scripts/c40_comp.ts <seed> <x> <y> <r>
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { navOf } from '../../src/sim/world';
import { landingOf } from '../../src/sim/systems/amphibious';
const [seedS, xs, ys, rs] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
s.step(1);
const w = s.world;
const W = w.cells.w;
const comp = navOf(w).grid.component;
const X = Math.floor(+xs!), Y = Math.floor(+ys!), R = +rs!;
const rows: string[] = [];
for (let y = Y - R; y <= Y + R; y++) {
  let row = `${y}: `;
  for (let x = X - R; x <= X + R; x++) { const c = comp[y * W + x]!; row += (c === 0 ? '  .' : String(c % 1000).padStart(3)) + (x === X && y === Y ? '*' : ' '); }
  rows.push(row);
}
console.log(`x from ${X - R} to ${X + R}`);
console.log(rows.join('\n'));
for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
  const c = (Y + dy) * W + X + dx;
  const l = landingOf(w, c);
  console.log(`click ${X + dx},${Y + dy} comp ${comp[c]} -> ${l ? `water ${l.water % W},${Math.floor(l.water / W)} land ${l.land % W},${Math.floor(l.land / W)} comp ${comp[l.land]}` : 'none'}`);
}
