/**
 * PLAN 7.190 (critic run 25's 9): every guarantee that ends while both its nations live has its
 * history row (`GuaranteeLapsed`). The 1938 world each day to `days`: the pledges gone since the day
 * before with both nations alive, and those of them with a row of their own (a pledge of a nation
 * that dies goes with it, told by the death).
 *
 * Usage: npx tsx tools/diag/pledgeRows.ts [seed] [days]
 */
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 1522);
const days = Number(process.argv[3] ?? 60);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? String(n);
const key = (g: { guarantor: number; target: number }): string => `${g.guarantor}:${g.target}`;
let held = new Set(s.world.alliances.guarantees.map(key));
const rows = new Set<string>();
let gone = 0;
let told = 0;
const untold: string[] = [];
for (let d = 1; d <= days; d++) {
  s.step(24, (w) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.GuaranteeLapsed) rows.add(`${ev[i + 2]}:${ev[i + 3]}`);
    ev.length = 0;
    w.out.fires.length = 0;
  });
  const w = s.world;
  const now = new Set(w.alliances.guarantees.map(key));
  for (const k of held) {
    if (now.has(k)) continue;
    const [g, t] = k.split(':').map(Number) as [number, number];
    if (w.nations.cols.living[g] !== 1 || w.nations.cols.living[t] !== 1) continue;
    gone++;
    if (rows.has(k)) told++;
    else untold.push(`day ${d} ${tag(g)} of ${tag(t)}`);
  }
  held = now;
}
console.log(`seed ${seed} to day ${days}: ${gone} guarantees gone with both alive, ${told} with their row${untold.length > 0 ? `; untold: ${untold.join(', ')}` : ''}`);
console.log('done:');
