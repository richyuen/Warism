// Critic run 67 (new): plain 1938's first DAYS on seeds: every war declared, with the great-circle km between the two
// capitals; flags those over 6,000 km (a war across an ocean). Usage: npx tsx critic/scripts/c67_firstdecl.ts <days> <seed>...
import { EventKind } from '../../src/shared/events';
import { capitalCell } from '../../src/sim/systems/capitals';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const days = Number(process.argv[2] ?? 60);
const seeds = process.argv.slice(3).map(Number);
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? String(n);
const lonLat = (w: World, c: number): [number, number] => {
  const x = c % w.cells.w, y = Math.floor(c / w.cells.w);
  return [((x + 0.5) / w.cells.w) * 360 - 180, 90 - ((y + 0.5) / w.cells.h) * 180];
};
const km = (a: [number, number], b: [number, number]): number => {
  const r = Math.PI / 180;
  const d = Math.sin(((b[1] - a[1]) * r) / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(((b[0] - a[0]) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(d));
};
let all = 0, far = 0;
for (const seed of seeds) {
  const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
  const rows: string[] = [];
  for (let d = 0; d < days; d++) {
    sim.step(24, (x: World) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] !== EventKind.WarDeclared) continue;
        const a = ev[i + 2]!, b = ev[i + 3]!;
        const k = Math.round(km(lonLat(x, capitalCell(x, a)), lonLat(x, capitalCell(x, b))));
        all++;
        if (k > 6000) far++;
        rows.push(`d${Math.floor(ev[i]! / 24)} ${tag(a)}>${tag(b)} ${k}km${k > 6000 ? ' FAR' : ''}`);
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
  }
  console.log(`seed ${seed}: ${rows.join(', ')}`);
}
console.log(`total ${all}, over 6000 km ${far}`);
console.log('done:');
