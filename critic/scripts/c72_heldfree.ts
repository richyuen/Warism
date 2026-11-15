// Critic run 69 (new): land held at peace in a game played free from a built year (diploInvariants' `held`), at the
// start and after each of YEARS years: does it ever go back? Usage: npx tsx critic/scripts/c72_heldfree.ts <year> <after> [years=3]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { useTags, worldBreaks } from '../../tests/helpers/diploInvariants';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1946);
const after = Number(process.argv[3] ?? 51515) >>> 0;
const years = Number(process.argv[4] ?? 3);
useTags((n) => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c72_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
sim.command({ kind: 'leaveTrack' });
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
sim.step(1, quiet);
const show = (label: string): void => {
  const held = worldBreaks(sim.world).filter((l) => l.startsWith('held'));
  const cells = held.reduce((s, l) => s + Number(/(\d+) cells/.exec(l)?.[1] ?? 0), 0);
  process.stdout.write(`${label}: ${held.length} pairs, ${cells} cells held at peace${held.length ? `: ${held.join('; ')}` : ''}\n`);
};
show(`${year} free after ${after}, hour 1`);
for (let y = 1; y <= years; y++) {
  sim.step(24 * 365, quiet);
  show(`year ${y}`);
}
process.stdout.write('done:\n');
