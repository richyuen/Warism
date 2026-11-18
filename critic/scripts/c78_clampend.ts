// Critic run 72 (new, R86b): `scoreFrom` is the war's score at the end, clamped to ±100, while the ground's score is now
// unclamped before scoreFrom is taken (war.ts). A war held at ±100 with a ground score past it would jump in hour 1.
// For each built year left free: every kept war's scoreFrom and its score after hour 1 and after 24 hours.
// Usage: npx tsx critic/scripts/c78_clampend.ts <year,year,...>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
for (const year of (process.argv[2] ?? '1942').split(',').map(Number)) {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: 77 } });
  if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c78_starts/${year}.sav`))));
  sim.world.track!.afterSeed = 77;
  const before = new Map(sim.world.wars.list.map((w) => [w, w.score]));
  sim.command({ kind: 'leaveTrack' } as never);
  sim.step(1, (x) => { x.out.events.length = 0; x.out.fires.length = 0; });
  const h1 = new Map(sim.world.wars.list.map((w) => [w, w.score]));
  sim.step(23, (x) => { x.out.events.length = 0; x.out.fires.length = 0; });
  for (const w of sim.world.wars.list) {
    if (w.scoreFrom === undefined) continue;
    console.log(`${year} ${w.sides[0].map(tag).join('+')} v ${w.sides[1].map(tag).join('+')}: before ${before.get(w)} scoreFrom ${w.scoreFrom} hour1 ${h1.get(w)} hour24 ${w.score}`.slice(0, 220));
  }
}
console.log('done:');
