// Critic run 72 (new): in a built year's start, every living nation whose capital is not the capital its data names
// (cities.json capitalOf, for 1938's nations) while it owns that city: the seat the replay moved by a capture and never
// moved back. Prints nation, its capital city, its own capital city's owner. Usage: npx tsx critic/scripts/c80_capsurvey.ts <year> [dir]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
import cities from '../../data/scenarios/1938/cities.json' with { type: 'json' };
const year = Number(process.argv[2] ?? 1975);
const dir = process.argv[3] ?? 'critic/c80_starts';
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 1 } });
if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`${dir}/${year}.sav`))));
const w = sim.world; const nc = w.nations.cols; const cc = w.cities.cols;
const defs = (cities as { cities: { name: string; capitalOf?: string }[] }).cities;
const name = (ci: number): string => w.cityNames.get(ci) ?? defs[cc.def[ci]!]?.name ?? `city${ci}`;
const own = new Map<string, number>(); // tag -> city row of its data capital
w.cities.forEach((ci) => { const t = defs[cc.def[ci]!]?.capitalOf; if (t) own.set(t, ci); });
let n = 0, off = 0;
for (let id = 1; id < w.nations.count; id++) {
  if (nc.living[id] !== 1) continue;
  n++;
  const x = nc.capitalX[id]!, y = nc.capitalY[id]!;
  let seat = 0, bd = 1e9; w.cities.forEach((ci) => { const d = Math.hypot(cc.x[ci]! - x, cc.y[ci]! - y); if (d < bd) [seat, bd] = [ci, d]; });
  const home = own.get(tag(id));
  if (home === undefined || home === seat) continue;
  const hc = cc.cell[home]!;
  const ownsHome = w.cells.owner[hc] === id;
  if (!ownsHome) continue;
  off++;
  console.log(`${year} ${tag(id)} seat ${bd < 1 ? name(seat) : `field (${x.toFixed(0)},${y.toFixed(0)}) near ${name(seat)}`} — its own capital ${name(home)} owned by ${tag(w.cells.owner[hc]!)} held by ${tag(w.cells.controller[hc]!)}`);
}
console.log(`${year}: ${off} of ${n} living nations seated away from their own capital, which they own`);
