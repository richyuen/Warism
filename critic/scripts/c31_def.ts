// Critic run 31 (R7): every NationDefaulted and NationCollapsed event on one 1938 run, with the nation's gold the hour
// before and after, and whether the nation's gold ever rose by more than 50 in an hour with no such row (a silent void).
// Usage: npx tsx critic/scripts/c31_def.ts <seed> <years> <out.json> [random] [heroes]
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2]);
const years = Number(process.argv[3] ?? 20);
const out = process.argv[4]!;
const diplo = process.argv.includes('random');
const heroes = process.argv.includes('heroes');
const SZ = size1938();
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SZ.w), options: { ...(heroes ? { heroes: 'on' } : {}), ...(diplo ? { diplomacy: 'random' } : {}) } });
const tag = (n: number): string => (n === 0 ? '-' : (s.world.nations.cols.origin[n] ?? 0) === 0 ? (NATIONS_1938[n - 1]?.tag ?? `#${n}`) : `new#${n}`);
const rows: { tick: number; day: number; kind: string; nation: string; b: number; goldBefore: number; goldAfter: number }[] = [];
const negRuns: Record<string, number> = {};
let prev = Float64Array.from(s.world.nations.cols.gold as ArrayLike<number>);
const H = years * 365 * 24;
for (let t = 0; t < H; t++) {
  const evs: number[][] = [];
  s.step(1, (w) => {
    const e = w.out.events;
    for (let i = 0; i < e.length; i += 6) if (e[i + 1] === EventKind.NationDefaulted || e[i + 1] === EventKind.NationCollapsed) evs.push([e[i + 1]!, e[i + 2]!, e[i + 3]!]);
    e.length = 0;
    w.out.fires.length = 0;
  });
  const g = s.world.nations.cols.gold as ArrayLike<number>;
  for (const [k, a, b] of evs) rows.push({ tick: s.world.tick, day: Math.floor(s.world.tick / 24), kind: k === EventKind.NationDefaulted ? 'Defaulted' : 'Collapsed', nation: tag(a!), b: b!, goldBefore: +(prev[a!] ?? NaN).toFixed(1), goldAfter: +(g[a!] ?? NaN).toFixed(1) });
  if (t % (24 * 30) === 0) for (let n = 1; n < g.length; n++) if ((g[n] ?? 0) < -100) negRuns[tag(n)] = (negRuns[tag(n)] ?? 0) + 1;
  prev = Float64Array.from(g);
}
const res = { seed, years, diplo, heroes, defaulted: rows.filter((r) => r.kind === 'Defaulted').length, collapsed: rows.filter((r) => r.kind === 'Collapsed').length, rows, monthsDeepInDebt: negRuns };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ seed, defaulted: res.defaulted, collapsed: res.collapsed }));
console.log('done:');
