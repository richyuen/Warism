// Critic run 72 (new): in a built year's start, the 1938 great powers' capitals (place, the city there, the cell's owner) and
// who holds Paris, Moscow, Rome, London, Berlin, Tokyo, Washington. Usage: npx tsx critic/scripts/c72_capitals.ts <year>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
const year = Number(process.argv[2] ?? 1975);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 1 } });
if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c72_starts/${year}.sav`))));
const w = sim.world; const nc = w.nations.cols; const cc = w.cities.cols;
for (const t of ['USA', 'SOV', 'GER', 'ENG', 'FRA', 'ITA', 'JAP']) {
  const n = TAGS_1938H.indexOf(t) + 1;
  const x = nc.capitalX[n]!, y = nc.capitalY[n]!;
  const cell = Math.floor(y) * w.cells.w + Math.floor(x);
  let city = '';
  w.cities.forEach((ci) => { if (Math.hypot(cc.x[ci]! - x, cc.y[ci]! - y) < 1) city = `${w.cityNames.get(ci) ?? cc.def[ci]} capOf ${tag(cc.capitalOf[ci]!)}`; });
  console.log(`${year} ${t} id ${n} living ${nc.living[n]} capital (${x.toFixed(1)},${y.toFixed(1)}) city ${city} owner ${tag(w.cells.owner[cell]!)} holder ${tag(w.cells.controller[cell]!)}`);
}
const at: Record<string, [number, number]> = { paris: [1037.4, 294.8], moscow: [1237.9, 242.2], rome: [1095.1, 344.0], london: [1023.3, 275.2], berlin: [1100.2, 267.4], tokyo: [1818.7, 385.2] };
for (const [k, [x, y]] of Object.entries(at)) { const cell = Math.floor(y) * w.cells.w + Math.floor(x); console.log(`  ${k}: owner ${tag(w.cells.owner[cell]!)} holder ${tag(w.cells.controller[cell]!)}`); }
