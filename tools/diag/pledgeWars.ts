/**
 * PLAN 7.188 (critic run 24's 9): a nation at war with one it guarantees. The 1938 world (the
 * scenario's diplomacy), each day to `days`: the guarantees whose guarantor and target are at war,
 * and the Soviet Union's wars on its first day at war.
 *
 * Usage: npx tsx tools/diag/pledgeWars.ts [seed] [days]
 */
import { SIZE_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 3739);
const days = Number(process.argv[3] ?? 30);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? String(n);
const SOV = NATIONS_1938.findIndex((n) => n.tag === 'SOV') + 1;
const odd = new Set<string>();
let sovWars = '';
for (let d = 1; d <= days; d++) {
  s.step(24, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  const w = s.world;
  for (const g of w.alliances.guarantees) if (w.wars.atWar(g.guarantor, g.target)) odd.add(`day ${d} ${tag(g.guarantor)} on ${tag(g.target)}`);
  if (!sovWars) {
    const mine = w.wars.list.filter((war) => war.sides[0].includes(SOV) || war.sides[1].includes(SOV));
    if (mine.length > 0) sovWars = `day ${d}: ${mine.map((war) => `${war.sides[0].map(tag).join(',')} v ${war.sides[1].map(tag).join(',')}`).join('; ')}`;
  }
}
const first = [...odd].slice(0, 3).join(', ');
console.log(`seed ${seed} to day ${days}: guarantor at war with its own ${odd.size}${first ? ` (${first})` : ''}; SOV ${sovWars || 'at peace'}`);
console.log('done:');
