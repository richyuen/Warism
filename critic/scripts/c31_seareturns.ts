// Critic run 31 (R10): every sea hero's return place in the c3X_ho_on_*.json runs (prefix arg), by the game's projection,
// with how often, and the late returns. Usage: npx tsx critic/scripts/c31_seareturns.ts <prefix e.g. c30> [glob-part ho_on]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { unproject } from '../../src/sim/data/projection';
const pre = process.argv[2] ?? 'c30', part = process.argv[3] ?? 'ho_on';
const SEA = ['yamato', 'iowa', 'sovetsky_soyuz', 'bismarck', 'hood', 'richelieu', 'roma'];
const places = new Map<string, { hero: string; lon: number; lat: number; n: number; late: number; seeds: Set<number> }>();
for (const f of readdirSync('critic').filter((x) => x.startsWith(`${pre}_${part}_`) && x.endsWith('.json'))) {
  const d = JSON.parse(readFileSync(`critic/${f}`, 'utf8'));
  for (const h of d.heroRows) {
    if (!SEA.some((s) => h.name.includes(s))) continue;
    for (const r of h.returns) {
      const [lon, lat] = unproject(r.x / 2048, r.y / 1024);
      const k = `${h.name} ${lon.toFixed(1)},${lat.toFixed(1)}`;
      const p = places.get(k) ?? { hero: h.name, lon: +lon.toFixed(1), lat: +lat.toFixed(1), n: 0, late: 0, seeds: new Set<number>() };
      p.n++; if (r.lateDays > 0) p.late++; p.seeds.add(d.seed);
      places.set(k, p);
    }
  }
}
const rows = [...places.values()].sort((a, b) => a.hero.localeCompare(b.hero) || b.n - a.n).map((p) => ({ ...p, seeds: [...p.seeds] }));
writeFileSync(`critic/${pre}_seareturns_${part}.json`, JSON.stringify(rows, null, 1));
for (const r of rows) console.log(r.hero.padEnd(24), String(r.lon).padStart(7), String(r.lat).padStart(6), 'n', r.n, 'late', r.late, 'seeds', r.seeds.join(','));
