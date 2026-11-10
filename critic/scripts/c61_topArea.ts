// Critic run 55 (new): R53k's bar by area (ADR-889, the user's (b)). Steps the 1938 world as `npm run sim` does, and per
// year logs the top 5 by owned area (landStandings, the game's ranking), then the longest run of years each top-5
// holder keeps a share within ±0.2 % (points) of the run's first share, and how often the first three change.
// Usage: npx tsx critic/scripts/c61_topArea.ts <seed> <years> <out.json>
import { writeFileSync } from 'node:fs';
import { loadAssets1938 } from '../../tools/headless/assets';
import { size1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landStandings } from '../../src/sim/landArea';

const seed = Number(process.argv[2]);
const years = Number(process.argv[3] ?? 25);
const outPath = process.argv[4] ?? `critic/c61_toparea_${seed}.json`;
const sim = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938(undefined as never).w) } as never);
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const rows: { year: number; hash: number; living: number; top: [string, number][] }[] = [];
for (let y = 1; y <= years; y++) {
  sim.step(8760, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
  const st = landStandings(sim.world);
  const top = st.ranked.slice(0, 5).map((n) => [tag(n), +(100 * st.area[n]! / st.owned).toFixed(2)] as [string, number]);
  rows.push({ year: y, hash: sim.hash() >>> 0, living: st.ranked.length, top });
  console.log(`y${y} hash ${(sim.hash() >>> 0).toString(16)} living ${st.ranked.length} | ${top.map(([t, s]) => `${t} ${s.toFixed(2)}%`).join(', ')}`);
}
// Longest still run: for each nation, consecutive years in the top 5 with share within ±0.2 of the run's start.
const still: Record<string, number> = {};
const shares = new Map<string, (number | null)[]>();
rows.forEach((r, i) => r.top.forEach(([t, s]) => { if (!shares.has(t)) shares.set(t, Array(rows.length).fill(null)); shares.get(t)![i] = s; }));
for (const [t, arr] of shares) {
  let best = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == null) continue;
    let j = i;
    while (j + 1 < arr.length && arr[j + 1] != null && Math.abs(arr[j + 1]! - arr[i]!) <= 0.2) j++;
    best = Math.max(best, j - i + 1);
  }
  still[t] = best;
}
const first3 = rows.map((r) => r.top.slice(0, 3).map(([t]) => t).join('>'));
const changes = first3.filter((x, i) => i > 0 && x !== first3[i - 1]).length;
const longest = Object.entries(still).sort((a, b) => b[1] - a[1]);
console.log(`longest still: ${longest.slice(0, 5).map(([t, n]) => `${t} ${n}`).join(', ')}`);
console.log(`first three changed ${changes} times; distinct orders ${new Set(first3).size}`);
writeFileSync(outPath, JSON.stringify({ seed, years, rows, still, first3Changes: changes, distinctFirst3: new Set(first3).size }, null, 2));
console.log('done:', outPath);
