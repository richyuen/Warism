// Critic run 24: how long Japan's hold on Chinese land at peace lasts with ?diplo=random (cells held by JAP, owned by CHI, the two at peace), every 90 days for <years>.
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 8821), years = Number(process.argv[3] ?? 5);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), options: { diplomacy: 'random' } });
const JAP = 75, CHI = 69;
const atWar = (a: number, b: number): boolean => s.world.wars.list.some((x) => (x.sides[0].includes(a) && x.sides[1].includes(b)) || (x.sides[1].includes(a) && x.sides[0].includes(b)));
const rows: string[] = [];
for (let d = 0; d <= years * 365; d += 90) {
  if (d > 0) s.step(90 * 24, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
  const c = s.world.cells; let held = 0;
  for (let i = 0; i < c.owner.length; i++) if (c.owner[i] === CHI && c.controller[i] === JAP) held++;
  rows.push(`day ${d}: JAP holds ${held} CHI cells; at war ${atWar(JAP, CHI)}`);
  console.log(rows[rows.length - 1]);
}
console.log('done:');
