// Critic run 71 (new, R85e): which nations of the replay's built years are R85e's landless sea powers (a sea power, no land
// neighbour, no pacifist): they order a transport group at peace, and their sea targets cost only the distance beyond the
// nearest. Usage: npx tsx critic/scripts/c77_landless.ts <year,year,...>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
import { landlessPowers } from '../../src/sim/ai/economic';
import { neighbourMap, seaPowers, strengths } from '../../src/sim/ai/strategic';

const tags = TAGS_1938H as readonly string[];
const years = (process.argv[2] ?? '1946,1950,1960,1970,1980,1991').split(',').map(Number);
for (const year of years) {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 1 } });
  if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c77_starts/${year}.sav`))));
  const w = sim.world;
  const ll = landlessPowers(w);
  const nb = neighbourMap(w);
  const sea = seaPowers(w, strengths(w));
  const noNb: string[] = [];
  w.nations.forEach((n) => { if (w.nations.cols.living[n] === 1 && (nb.get(n)?.size ?? 0) === 0) noNb.push(`${tags[n - 1]}${sea.has(n) ? '*' : ''}(a${w.nations.cols.aggression[n]})`); });
  process.stdout.write(`${year}: landless sea powers [${[...ll].map((n) => tags[n - 1]).join(', ')}]; sea powers ${sea.size}; no land neighbour (* sea power): ${noNb.join(' ')}\n`);
}
process.stdout.write('done:\n');
