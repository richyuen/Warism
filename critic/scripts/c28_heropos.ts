// Critic run 24: where each hero is (and on what) after <days> days; seed <seed>, heroes on, diplomacy <diplo>.
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 6197), days = Number(process.argv[3] ?? 3667), diplo = process.argv[4] ?? 'random';
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { heroes: 'on', ...(diplo === 'random' ? { diplomacy: 'random' } : {}) } });
s.step(days * 24, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
const w = s.world; const fc = w.formations.cols; const c = w.cells;
for (const [f, row] of w.heroes) {
  const r = w.heroRoster[row]!; const x = fc.x[f]!, y = fc.y[f]!; const i = Math.floor(y) * c.w + Math.floor(x);
  const ctl = c.controller[i]!;
  console.log(`${NATIONS_1938[r.nation - 1]?.tag} ${TEMPLATES_1938[r.template]?.id} f${f} at ${x.toFixed(1)},${y.toFixed(1)} cell controller ${ctl ? NATIONS_1938[ctl - 1]?.tag ?? ctl : 'sea'} fleet ${w.isFleet(f)} engaged ${fc.engaged[f]}`);
}
console.log('tick', w.tick, 'done:');
