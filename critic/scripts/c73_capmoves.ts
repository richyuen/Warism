// Critic run 72 (new): every capital move (CapitalMoved, 10) and capital capture (CapitalCaptured, 9) of the 1938 great powers
// in the replay's history to a built year, with the city of each new seat. Usage: npx tsx critic/scripts/c73_capmoves.ts <year>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
import cities from '../../data/scenarios/1938/cities.json' with { type: 'json' };
const year = Number(process.argv[2] ?? 1975);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 1 } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`${process.env.DIR ?? "critic/c73_starts"}/${year}.sav`))));
const w = sim.world; const cc = w.cities.cols;
const name = (ci: number): string => (w.cities.has(ci) ? w.cityNames.get(ci) ?? (cities as { cities: { name: string }[] }).cities[cc.def[ci]!]?.name ?? `city${ci}` : `gone${ci}`);
const dateOf = (tick: number): string => new Date(Date.UTC(1938, 0, 1) + tick * 3600000).toISOString().slice(0, 13);
const rows = w.history.rows; const S = rows.length / Math.max(1, w.history.rows.length) ;
const stride = 6;
const want = new Set(['USA', 'SOV', 'GER', 'ENG', 'FRA', 'ITA', 'JAP', 'CHI']);
for (let i = 0; i < rows.length; i += stride) {
  const k = rows[i + 1]!;
  if (k !== 10 && k !== 9) continue;
  const a = rows[i + 2]!, b = rows[i + 3]!;
  if (!want.has(tag(a)) && !want.has(tag(b))) continue;
  console.log(`${dateOf(rows[i]!)} ${k === 10 ? 'CapitalMoved' : 'CapitalCaptured'} a ${tag(a)} b ${k === 10 ? name(b) : tag(b)} x ${rows[i + 4]?.toFixed?.(1)} y ${rows[i + 5]?.toFixed?.(1)}`);
}
for (const ci of [143, 480, 214]) console.log(`city ${ci}: ${name(ci)} at (${cc.x[ci]?.toFixed(1)},${cc.y[ci]?.toFixed(1)})`);
const nc = w.nations.cols;
for (const t of ['SOV', 'FRA', 'ITA', 'GER']) {
  const n = TAGS_1938H.indexOf(t) + 1; const x = nc.capitalX[n]!, y = nc.capitalY[n]!;
  let best = 0, bd = 1e9; w.cities.forEach((ci) => { const d = Math.hypot(cc.x[ci]! - x, cc.y[ci]! - y); if (d < bd) [best, bd] = [ci, d]; });
  console.log(`${year} ${t} capital (${x.toFixed(1)},${y.toFixed(1)}) nearest city ${name(best)} ${bd.toFixed(2)} cells, its capitalOf ${tag(cc.capitalOf[best]!)}`);
}
