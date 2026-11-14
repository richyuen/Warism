// Critic run 63 (new): whose land formations stand where on the historical track's great days (R63-N2's check).
// 1938h on its own seed via the builder's checker run (tests/helpers/historyTrack.ts); at the first hour of each day
// listed, per box (lon/lat), the land formations' men by nation and how many are engaged.
// Usage: npx tsx critic/scripts/c68_census.ts [seed=1938]
import { TAGS_1938H } from '../../src/sim/scenario1938h';
import type { World } from '../../src/sim/world';
import { historyTrack } from '../../tests/helpers/historyTrack';

const seed = Number(process.argv[2] ?? 1938);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const day = (y: number, m: number, d: number): number => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1938, 0, 1)) / 3600000);
const checks = [
  { at: day(1942, 9, 15), name: '1942-09-15', boxes: { stalingrad: [42, 47, 47.5, 50.5], donBend: [38, 47, 46.5, 51.5] } },
  { at: day(1944, 6, 20), name: '1944-06-20', boxes: { normandy: [-2.0, 0.6, 48.6, 49.8], france: [-5, 8, 42.5, 51], lowCountries: [2.5, 7.2, 50.7, 53.6] } },
  { at: day(1944, 8, 26), name: '1944-08-26', boxes: { france: [-5, 8, 42.5, 51], lowCountries: [2.5, 7.2, 50.7, 53.6] } },
];
// The cell of a lon/lat: x equirectangular; y by the 1938 grid's rows of Berlin (52.52) and Paris (48.857) at 2048 wide.
const xOf = (lon: number, w: World): number => ((lon + 180) / 360) * w.cells.w;
const yOf = (lat: number, w: World): number => (294.8377 + ((lat - 48.857) * (267.4273 - 294.8377)) / (52.52 - 48.857)) * (w.cells.h / 1024);
const out: Record<string, unknown> = {};
let i = 0;
historyTrack(seed, checks.at(-1)!.at + 1, (w) => {
  const c = checks[i];
  if (!c || w.tick !== c.at) return;
  const res: Record<string, Record<string, { men: number; n: number; engaged: number }>> = {};
  const f = w.formations.cols;
  for (const [name, [lo0, lo1, la0, la1]] of Object.entries(c.boxes)) {
    const x0 = xOf(lo0!, w), x1 = xOf(lo1!, w), y0 = yOf(la1!, w), y1 = yOf(la0!, w);
    const by: Record<string, { men: number; n: number; engaged: number }> = {};
    w.formations.forEach((id) => {
      if (w.isFleet(id)) return;
      const x = f.x[id]!, y = f.y[id]!;
      if (x < x0 || x > x1 || y < y0 || y > y1) return;
      const t = tag(f.nation[id]!);
      const e = (by[t] ??= { men: 0, n: 0, engaged: 0 });
      e.men += f.strength[id]!; e.n++; if (f.engaged[id] === 1) e.engaged++;
    });
    res[name] = by;
  }
  out[c.name] = res;
  console.log(c.name, JSON.stringify(res));
  i++;
});
console.log('done:');
