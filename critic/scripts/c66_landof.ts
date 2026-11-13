// Critic run 65: cells owned and controlled, and the overlord's tag, of some nations in a built start of the replay.
// Usage: npx tsx critic/scripts/c66_landof.ts <year> TAG...
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
const year = Number(process.argv[2]);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c66_starts/${year}.sav`))));
const tags = TAGS_1938H as readonly string[];
const w = sim.world;
const c = w.nations.cols as unknown as { overlord: ArrayLike<number> };
for (const t of process.argv.slice(3)) {
  const n = tags.indexOf(t) + 1;
  let own = 0, ctl = 0;
  for (let i = 0; i < w.cells.owner.length; i++) { if (w.cells.owner[i] === n) own++; if (w.cells.controller[i] === n) ctl++; }
  console.log(year, t, `owner ${own} controller ${ctl} overlord ${tags[c.overlord[n]! - 1] ?? '-'}`);
}
