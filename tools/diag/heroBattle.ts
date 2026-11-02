/**
 * PLAN 7.184e: whether the AI uses its heroes. The 1938 world with the heroes on, `years` long. For
 * each hero of the roster, of the days its nation is at war while it lives:
 * - `share`: the days it is in battle (engaged at any hour: a land fight, or a sea battle, ADR-712);
 * - `ceiling`: the days any formation of its nation in its domain (land formations, or fleets) is in
 *   battle — the most a hero that joins every fight could reach (ADR-792);
 * - land, `ofArmy`: share / ceiling, the AT's ≥ 0.5 where the ceiling is ≥ 0.10;
 * - sea, `with`: the days it ends in the sea zone of its nation's largest other fleet (most
 *   `fleetPower`) or within `SORTIE_KM` of it, the AT's ≥ 0.5; `ofFleet`: of the days that fleet is
 *   in battle, those the hero is too, the AT's ≥ 0.5.
 *
 * Usage: npx tsx tools/diag/heroBattle.ts [seed] [years]
 */
import { SIZE_1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { fleetPower } from '../../src/sim/systems/seaControl';
import { seaKm } from '../../src/sim/systems/navalCombat';
import { SORTIE_KM } from '../../src/sim/ai/naval';
import { seaOf, type World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 1461);
const years = Number(process.argv[3] ?? 3);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { heroes: 'on' } });
const rows = s.world.heroRoster.length;
const zero = (): number[] => new Array<number>(rows).fill(0);
const warDays = zero();
const battleDays = zero();
const goneDays = zero();
const anyDays = zero();
const withDays = zero();
const bigDays = zero();
const bothDays = zero();
const today = new Array<boolean>(rows).fill(false);
const bigToday = new Array<boolean>(rows).fill(false);
// Nations with a formation of each domain in battle today: land (n) and sea (-n).
const fighting = new Set<number>();
const sea = (w: World, row: number): boolean => w.rules?.templates[w.heroRoster[row]!.template]?.domain === 1;

/** The largest fleet of power of nation n other than its hero, or 0 (as `followFleets` picks). */
function largest(w: World, n: number): number {
  let best = 0;
  let bp = 0;
  w.formations.forEach((id) => {
    if (w.formations.cols.nation[id] !== n || w.heroes.has(id) || !w.isFleet(id)) return;
    const p = fleetPower(w, id);
    if (p > bp || (p === bp && p > 0 && id < best)) [best, bp] = [id, p];
  });
  return bp > 0 ? best : 0;
}

const days = Math.round(years * 365);
for (let d = 0; d < days; d++) {
  today.fill(false);
  bigToday.fill(false);
  fighting.clear();
  // The largest fleet of each sea hero's nation, at the day's start.
  const big = new Array<number>(rows).fill(0);
  for (let row = 0; row < rows; row++) if (sea(s.world, row)) big[row] = largest(s.world, s.world.heroRoster[row]!.nation);
  s.step(24, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
    const fc = w.formations.cols;
    for (const [f, row] of w.heroes) if (fc.engaged[f] === 1) today[row] = true;
    for (let row = 0; row < rows; row++) if (big[row]! > 0 && w.formations.has(big[row]!) && fc.engaged[big[row]!] === 1) bigToday[row] = true;
    w.formations.forEach((f) => {
      if (fc.engaged[f] !== 1 || w.isWing(f)) return;
      fighting.add(w.isFleet(f) ? -fc.nation[f]! : fc.nation[f]!);
    });
  });
  const w = s.world;
  const fc = w.formations.cols;
  const heroOf = new Map<number, number>();
  for (const [f, row] of w.heroes) heroOf.set(row, f);
  const z = seaOf(w);
  for (let row = 0; row < rows; row++) {
    const n = w.heroRoster[row]!.nation;
    const atWar = w.wars.list.some((war) => war.sides[0].includes(n) || war.sides[1].includes(n));
    if (!atWar) continue;
    const id = heroOf.get(row);
    if (id === undefined) {
      goneDays[row]!++;
      continue;
    }
    warDays[row]!++;
    if (today[row]) battleDays[row]!++;
    const isSea = sea(w, row);
    if (fighting.has(isSea ? -n : n)) anyDays[row]!++;
    if (!isSea) continue;
    const b = largest(w, n);
    if (b > 0) {
      const zoneOf = (f: number): number => z.zoneOf[Math.floor(fc.y[f]!) * w.cells.w + Math.floor(fc.x[f]!)]!;
      const zh = zoneOf(id);
      if ((zh !== 0 && zh === zoneOf(b)) || seaKm(w, fc.x[id]!, fc.y[id]!, fc.x[b]!, fc.y[b]!) <= SORTIE_KM) withDays[row]!++;
    }
    if (bigToday[row]) {
      bigDays[row]!++;
      if (today[row]) bothDays[row]!++;
    }
  }
  if ((d + 1) % 365 === 0) process.stderr.write(`seed ${seed} year ${(d + 1) / 365} done\n`);
}
const f3 = (a: number, b: number): string => (b > 0 ? (a / b).toFixed(3) : 'n/a');
for (let row = 0; row < rows; row++) {
  const r = s.world.heroRoster[row]!;
  const tag = NATIONS_1938[r.nation - 1]?.tag ?? String(r.nation);
  const name = TEMPLATES_1938[r.template]?.id ?? String(r.template);
  const base = `seed ${seed} ${tag} ${name}: at war alive ${warDays[row]} d, in battle ${battleDays[row]} d, share ${f3(battleDays[row]!, warDays[row]!)}, ceiling ${f3(anyDays[row]!, warDays[row]!)}, gone at war ${goneDays[row]} d`;
  const more = sea(s.world, row) ? `with ${f3(withDays[row]!, warDays[row]!)}, ofFleet ${f3(bothDays[row]!, bigDays[row]!)} (${bigDays[row]} d)` : `ofArmy ${f3(battleDays[row]!, anyDays[row]!)}`;
  console.log(`${base}; ${more}`);
}
console.log('done:');
