/**
 * PLAN 7.187 (R24-B1): land held at peace. The 1938 world with `--diplomacy` (scenario or random),
 * at each of the days given: the cells whose controller is neither their owner nor at war with it,
 * by holder and owner (the largest five).
 *
 * Usage: npx tsx tools/diag/peaceHeld.ts [seed] [random|scenario] [days, e.g. 0,30,180]
 */
import { SIZE_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 8821);
const diplomacy = (process.argv[3] ?? 'random') as 'random' | 'scenario';
const at = (process.argv[4] ?? '0,30,180').split(',').map(Number);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { diplomacy } });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? String(n);
let day = 0;
for (const d of at) {
  while (day < d) {
    s.step(24, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
    });
    day++;
  }
  const w = s.world;
  const { owner, controller } = w.cells;
  const pairs = new Map<string, number>();
  let n = 0;
  for (let c = 0; c < owner.length; c++) {
    const o = owner[c]!;
    const k = controller[c]!;
    if (o === 0 || k === 0 || k === o || w.wars.atWar(o, k)) continue;
    n++;
    const key = `${tag(k)} on ${tag(o)}`;
    pairs.set(key, (pairs.get(key) ?? 0) + 1);
  }
  const top = [...pairs].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k} ${v}`).join(', ');
  console.log(`seed ${seed} ${diplomacy} day ${d}: held at peace ${n}${top ? ` (${top})` : ''}`);
}
console.log('done:');
