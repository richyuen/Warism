// Critic run 75 (new): wars that stand at a score of +-100 and go on. Plain 1938 SEED (heroes on with `on`), YEARS
// years, a day at a time: each war's score; per war the days it stood at |score| >= 100 in one run, how it ended
// (PeaceSigned, NationAnnexed, or still on), its exhaustion at the end of the run, and the cells each side holds of
// the other. Lists the wars with a run of over 60 days at +-100.
// Usage: npx tsx critic/scripts/c77_warAt100.ts <seed> <years> [on|off]
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 58201), years = Number(process.argv[3] ?? 3), heroes = (process.argv[4] ?? 'on') === 'on';
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), ...(heroes ? { options: { heroes: 'on' } } : {}) } as never);
const w = sim.world;
const clear = (x: World): void => { x.out.events.length = 0; x.out.fires.length = 0; };
interface Row { label: string; start: number; run: number; longest: number; longestFrom: number; days100: number; last: number; lastDay: number; first100: number }
const rows = new Map<number, Row>();
let warDays = 0, warDays100 = 0;
for (let d = 0; d < years * 365; d++) {
  sim.step(24, clear);
  for (const war of w.wars.list) {
    let r = rows.get(war.id);
    if (!r) rows.set(war.id, (r = { label: `${war.sides[0].map(tag).join('+')} v ${war.sides[1].map(tag).join('+')}`.slice(0, 70), start: d, run: 0, longest: 0, longestFrom: -1, days100: 0, last: 0, lastDay: d, first100: -1 }));
    r.last = war.score; r.lastDay = d; warDays++;
    if (Math.abs(war.score) >= 100) { r.run++; r.days100++; warDays100++; if (r.first100 < 0) r.first100 = d; if (r.run > r.longest) { r.longest = r.run; r.longestFrom = d - r.run + 1; } } else r.run = 0;
  }
}
const live = new Set(w.wars.list.map((x) => x.id));
const long = [...rows.entries()].filter(([, r]) => r.longest > 60).sort((a, b) => b[1].longest - a[1].longest);
process.stdout.write(`seed ${seed} heroes ${heroes} ${years} y: wars ${rows.size}, war-days ${warDays}, of them at +-100: ${warDays100} (${((100 * warDays100) / Math.max(1, warDays)).toFixed(1)} %); wars over 60 days on end at +-100: ${long.length}\n`);
for (const [id, r] of long.slice(0, 12)) process.stdout.write(`  #${id} ${r.label}: began d${r.start}, at +-100 from d${r.longestFrom} for ${r.longest} days on end (${r.days100} in all), last score ${r.last} on d${r.lastDay}, ${live.has(id) ? 'still on' : 'ended'}\n`);
process.stdout.write('done:\n');
