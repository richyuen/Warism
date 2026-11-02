/**
 * PLAN 7.184e: whether the AI uses its heroes. The 1938 world with the heroes on, `years` long: for
 * each hero of the roster, the days its nation is at war while the hero lives, and of them the days
 * it is in battle (engaged at any hour of the day: a land fight, or a sea battle, ADR-712). Prints a
 * line a hero and the share; the AT's bar is 0.30 for each. Beside it, the ceiling: of the same days,
 * those on which any formation of the hero's nation in its domain (land, or fleets) is in battle.
 *
 * Usage: npx tsx tools/diag/heroBattle.ts [seed] [years]
 */
import { SIZE_1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 1461);
const years = Number(process.argv[3] ?? 3);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { heroes: 'on' } });
const rows = s.world.heroRoster.length;
const warDays = new Array<number>(rows).fill(0);
const battleDays = new Array<number>(rows).fill(0);
const goneDays = new Array<number>(rows).fill(0);
const today = new Array<boolean>(rows).fill(false);
const anyDays = new Array<number>(rows).fill(0);
// Nations with a formation of each domain in battle today: land (n) and sea (-n).
const fighting = new Set<number>();
const days = Math.round(years * 365);
for (let d = 0; d < days; d++) {
  today.fill(false);
  fighting.clear();
  s.step(24, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
    const fc = w.formations.cols;
    for (const [f, row] of w.heroes) if (fc.engaged[f] === 1) today[row] = true;
    w.formations.forEach((f) => {
      if (fc.engaged[f] !== 1 || w.isWing(f)) return;
      fighting.add(w.isFleet(f) ? -fc.nation[f]! : fc.nation[f]!);
    });
  });
  const w = s.world;
  const alive = new Set(w.heroes.values());
  for (let row = 0; row < rows; row++) {
    const n = w.heroRoster[row]!.nation;
    const atWar = w.wars.list.some((war) => war.sides[0].includes(n) || war.sides[1].includes(n));
    if (!atWar) continue;
    if (!alive.has(row)) {
      goneDays[row]!++;
      continue;
    }
    warDays[row]!++;
    if (today[row]) battleDays[row]!++;
    const sea = w.rules?.templates[w.heroRoster[row]!.template]?.domain === 1;
    if (fighting.has(sea ? -n : n)) anyDays[row]!++;
  }
  if ((d + 1) % 365 === 0) process.stderr.write(`seed ${seed} year ${(d + 1) / 365} done\n`);
}
for (let row = 0; row < rows; row++) {
  const r = s.world.heroRoster[row]!;
  const tag = NATIONS_1938[r.nation - 1]?.tag ?? String(r.nation);
  const name = TEMPLATES_1938[r.template]?.id ?? String(r.template);
  const share = warDays[row]! > 0 ? battleDays[row]! / warDays[row]! : NaN;
  console.log(`seed ${seed} ${tag} ${name}: at war alive ${warDays[row]} d, in battle ${battleDays[row]} d, share ${share.toFixed(3)}, ceiling ${(warDays[row]! > 0 ? anyDays[row]! / warDays[row]! : NaN).toFixed(3)}, gone at war ${goneDays[row]} d`);
}
console.log('done:');
