// Critic run 65: the aggression and traits columns of some nations in a built start of the replay (critic/c65_starts).
// Usage: npx tsx critic/scripts/c65_traits.ts <year> TAG...
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
const year = Number(process.argv[2]);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c65_starts/${year}.sav`))));
const c = sim.world.nations.cols as unknown as Record<string, ArrayLike<number>>;
const keys = Object.keys(c).filter((k) => /aggress|trait|milit|expans|govern|living|overlord/i.test(k));
for (const t of process.argv.slice(3)) {
  const n = (TAGS_1938H as readonly string[]).indexOf(t) + 1;
  console.log(year, t, keys.map((k) => `${k}=${c[k]![n]}`).join(' '));
}
