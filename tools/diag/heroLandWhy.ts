/**
 * PLAN 7.185: why a land hero of the AI is in few of its army's battles. The 1938 world with the
 * heroes on, `years` long; at each day's end, for each land hero alive of a nation at war whose army
 * fights that day (any land formation of the nation engaged at any hour), what it is doing:
 * - `fight`: engaged at some hour of the day;
 * - else `march`: on the march (to a cell of its own side, an enemy's, or a neutral's);
 * - else `stand`;
 * and, of those not in a fight, its distance (cells) to the nearest formation of its nation engaged
 * at the day's end (none: `-`), its days in the reserve (standing still a week or more), out of
 * supply (`supply` < 0.5), on the retreat or home-bound, and refused orders (`World.out` events of
 * the hero, if any). Prints the counts per hero and a histogram of the distances.
 *
 * Usage: npx tsx tools/diag/heroLandWhy.ts [seed] [years]
 */
import { SIZE_1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { wrapDx } from '../../src/sim/systems/elements';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 1461);
const years = Number(process.argv[3] ?? 1);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { heroes: 'on' } });
const w0 = s.world;
const rows = w0.heroRoster.length;
const land = (row: number): boolean => w0.rules?.templates[w0.heroRoster[row]!.template]?.domain === 0;
type Count = Record<string, number>;
const counts: Count[] = Array.from({ length: rows }, () => ({}));
const bump = (row: number, k: string): void => {
  counts[row]![k] = (counts[row]![k] ?? 0) + 1;
};
const BINS = [2, 5, 10, 20, 40, 80, Infinity];
const binOf = (d: number): string => {
  const b = BINS.find((x) => d <= x)!;
  return b === Infinity ? '>80' : `<=${b}`;
};
const stillSince = new Map<number, number>();
const days = Math.round(years * 365);
for (let d = 0; d < days; d++) {
  const fought = new Set<number>();
  const armies = new Set<number>();
  s.step(24, (w) => {
    w.out.events.length = 0;
    w.out.fires.length = 0;
    const fc = w.formations.cols;
    for (const [f] of w.heroes) if (fc.engaged[f] === 1) fought.add(f);
    w.formations.forEach((f) => {
      if (fc.engaged[f] === 1 && !w.isFleet(f) && !w.isWing(f)) armies.add(fc.nation[f]!);
    });
  });
  const w = s.world;
  const fc = w.formations.cols;
  const { w: W, controller } = w.cells;
  for (const [f, row] of w.heroes) {
    if (!land(row)) continue;
    const n = fc.nation[f]!;
    const moved = fc.moving[f] === 1;
    if (moved) stillSince.delete(f);
    else if (!stillSince.has(f)) stillSince.set(f, d);
    if (!w.wars.list.some((war) => war.sides[0].includes(n) || war.sides[1].includes(n))) continue;
    if (!armies.has(n)) continue;
    bump(row, 'days');
    if (fought.has(f)) {
      bump(row, 'fight');
      continue;
    }
    if (moved) {
      const to = controller[fc.targetCell[f]!]!;
      bump(row, to === n || w.wars.sameSide(to, n) ? 'march own' : w.wars.atWar(n, to) ? 'march enemy' : 'march other');
    } else bump(row, 'stand');
    if (!moved && d - (stillSince.get(f) ?? d) >= 7) bump(row, 'still 7d+');
    if (fc.supply[f]! < 0.5) bump(row, 'supply<0.5');
    if (fc.retreat[f] !== 0) bump(row, 'retreat');
    if (fc.home[f] !== 0) bump(row, 'home');
    let near = Infinity;
    w.formations.forEach((g) => {
      if (g === f || fc.nation[g] !== n || fc.engaged[g] !== 1 || w.isFleet(g) || w.isWing(g)) return;
      near = Math.min(near, Math.hypot(wrapDx(w, fc.x[f]!, fc.x[g]!), fc.y[g]! - fc.y[f]!));
    });
    bump(row, near === Infinity ? 'near -' : `near ${binOf(near)}`);
  }
  if ((d + 1) % 365 === 0) process.stderr.write(`seed ${seed} year ${(d + 1) / 365} done\n`);
  void W;
}
for (let row = 0; row < rows; row++) {
  if (!land(row)) continue;
  const r = w0.heroRoster[row]!;
  const tag = NATIONS_1938[r.nation - 1]?.tag ?? String(r.nation);
  const name = TEMPLATES_1938[r.template]?.id ?? String(r.template);
  const c = counts[row]!;
  const keys = ['days', 'fight', 'march enemy', 'march own', 'march other', 'stand', 'still 7d+', 'supply<0.5', 'retreat', 'home', ...BINS.map((b) => (b === Infinity ? 'near >80' : `near <=${b}`)), 'near -'];
  console.log(`seed ${seed} ${tag} ${name}: ${keys.map((k) => `${k} ${c[k] ?? 0}`).join(', ')}`);
}
console.log('done:');
