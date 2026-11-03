// Critic run 24 (new): what a player sees the heroes do over a long run. The 1938 world, heroes on.
// Per hero (roster row), per year: days alive, days its nation is at war, days engaged (any hour), days it moved
// more than 1 cell, cells travelled, times lost, the share of days at war it stood still, health at year end.
// Usage: npx tsx critic/scripts/c27_heroes.ts <seed> <years> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { heroHealth } from '../../src/sim/systems/heroes';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 3739);
const years = Number(process.argv[3] ?? 10);
const out = process.argv[4] ?? `critic/c27_heroes_${seed}.json`;
const SZ = size1938();
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SZ.w), options: { heroes: 'on' } });
const w0 = s.world;
const rows = w0.heroRoster.length;
const label = (row: number): string => {
  const r = w0.heroRoster[row]!;
  return `${NATIONS_1938[r.nation - 1]?.tag ?? r.nation} ${TEMPLATES_1938[r.template]?.id ?? r.template}`;
};
type Y = { alive: number; war: number; engaged: number; moved: number; still: number; cells: number; lost: number; health: number; x: number; y: number; formation: number };
const res: { seed: number; years: number; heroes: { row: number; name: string; perYear: Y[] }[]; ms: number } = { seed, years, heroes: [], ms: 0 };
for (let r = 0; r < rows; r++) res.heroes.push({ row: r, name: label(r), perYear: [] });
const last = new Map<number, [number, number, number]>(); // row -> [formation, x, y]
const t0 = performance.now();
for (let y = 0; y < years; y++) {
  const acc: Y[] = Array.from({ length: rows }, () => ({ alive: 0, war: 0, engaged: 0, moved: 0, still: 0, cells: 0, lost: 0, health: 0, x: 0, y: 0, formation: 0 }));
  for (let d = 0; d < 365; d++) {
    const eng = new Set<number>();
    s.step(24, (w) => {
      w.out.events.length = 0;
      w.out.fires.length = 0;
      const fc = w.formations.cols;
      for (const [f, row] of w.heroes) if (fc.engaged[f] === 1) eng.add(row);
    });
    const w = s.world;
    const fc = w.formations.cols;
    const alive = new Map<number, number>();
    for (const [f, row] of w.heroes) alive.set(row, f);
    for (let row = 0; row < rows; row++) {
      const a = acc[row]!;
      const n = w.heroRoster[row]!.nation;
      const atWar = w.wars.list.some((war) => war.sides[0].includes(n) || war.sides[1].includes(n));
      const f = alive.get(row);
      const prev = last.get(row);
      if (f === undefined) {
        if (prev && prev[0] !== 0) a.lost++;
        last.set(row, [0, 0, 0]);
        continue;
      }
      a.alive++;
      if (atWar) a.war++;
      if (eng.has(row)) a.engaged++;
      const x = fc.x[f]!, yy = fc.y[f]!;
      if (prev && prev[0] === f) {
        const dist = Math.hypot(x - prev[1], yy - prev[2]);
        a.cells += dist;
        if (dist > 1) a.moved++;
        else if (atWar) a.still++;
      }
      last.set(row, [f, x, yy]);
      a.health = heroHealth(w, f);
      a.x = Math.round(x); a.y = Math.round(yy); a.formation = f;
    }
  }
  for (let row = 0; row < rows; row++) res.heroes[row]!.perYear.push({ ...acc[row]!, cells: Math.round(acc[row]!.cells), health: Math.round(acc[row]!.health * 100) / 100 });
  res.ms = Math.round(performance.now() - t0);
  writeFileSync(out, JSON.stringify(res, null, 1));
  process.stderr.write(`seed ${seed} year ${y + 1} ${res.ms} ms\n`);
}
console.log('done:');
