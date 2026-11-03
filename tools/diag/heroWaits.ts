/**
 * ROADMAP R10: how long the heroes wait past their 60 days, on one 1938 run with the heroes on,
 * and the checker's heroes rules (`heroBreaks`) every hour. Each row's days past its return,
 * split by why: its nation dead, no place (no port held, for a sea hero), or a place it had (none
 * by the rule).
 *
 * Usage: npx tsx tools/diag/heroWaits.ts <seed> [days]
 */
import { Sim } from '../../src/sim/sim';
import { SIZE_1938, TEMPLATES_1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { returnPlace } from '../../src/sim/systems/heroes';
import { assets1938 } from '../../tests/helpers/earth';
import { Breaks } from '../../tests/helpers/diploInvariants';
import { heroBreaks } from '../../tests/helpers/worldInvariants';

const seed = Number(process.argv[2] ?? 4253);
const days = Number(process.argv[3] ?? 7300);
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { heroes: 'on' } });
const w = s.world;
const rows = w.heroRoster.map((r) => ({ name: `${tag(r.nation)} ${TEMPLATES_1938[r.template]!.id}`, lost: 0, dead: 0, noPlace: 0, withPlace: 0 }));
let alive = new Set(w.heroes.values());
const breaks = new Breaks();
s.step(days * 24, (x) => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
  const now = new Set(x.heroes.values());
  for (const row of alive) if (!now.has(row)) rows[row]!.lost++;
  alive = now;
  for (const [row, at] of x.heroReturn) {
    if (at >= x.tick) continue;
    const r = rows[row]!;
    if (x.nations.cols.living[x.heroRoster[row]!.nation] !== 1) r.dead++;
    else if (returnPlace(x, row) === null) r.noPlace++;
    else r.withPlace++;
  }
  breaks.add(`${seed} day ${Math.floor((x.tick - 1) / 24)}`, heroBreaks(x, tag));
});
const d = (h: number): number => Math.round(h / 24);
for (const r of rows) console.log(`${r.name.padEnd(28)} lost ${String(r.lost).padStart(3)}  days past return: nation dead ${d(r.dead)}, no place ${d(r.noPlace)}, with a place ${d(r.withPlace)}`);
for (const l of breaks.lines) console.log(l);
console.log(`seed ${seed} to day ${days}: ${breaks.lines.length} broken`);
console.log('done:');
process.exitCode = breaks.lines.length > 0 ? 1 : 0;
