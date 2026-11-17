// Critic run 69 (new): the economy lines of c73_free.ts on a free game from a built year: at each month's start hour
// of the first DAYS, every nation whose gold rose more than its income and tribute, beside the `BlocAid` rows of that
// hour (giver > aided). Usage: npx tsx critic/scripts/c73_aidcheck.ts <year> <after> [days=120]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1975);
const after = Number(process.argv[3] ?? 51501) >>> 0;
const days = Number(process.argv[4] ?? 120);
const tag = (n: number): string => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c73_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
sim.command({ kind: 'leaveTrack' });
const w = sim.world;
const nc = w.nations.cols;
const date = (t: number): string => new Date(Date.UTC(1938, 0, 1) + t * 3600000).toISOString().slice(0, 13);
let jumps = 0;
let explained = 0;
for (let h = 0; h < days * 24; h++) {
  const gold = Float64Array.from(nc.gold);
  const income = Float64Array.from(nc.income);
  const aid: string[] = [];
  const aided = new Set<number>();
  sim.step(1, (x: World) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6)
      if (ev[i + 1] === EventKind.BlocAid) {
        aid.push(`${tag(ev[i + 2]!)}>${tag(ev[i + 3]!)}`);
        aided.add(ev[i + 3]!);
      }
    ev.length = 0;
    x.out.fires.length = 0;
  });
  const rose: string[] = [];
  for (let n = 1; n < gold.length; n++) {
    if (nc.living[n] !== 1) continue;
    const r = nc.gold[n]! - gold[n]!;
    if (r > Math.max(0, income[n]!) * 1.5 + 50) {
      jumps++;
      if (aided.has(n)) explained++;
      rose.push(`${tag(n)} +${r.toFixed(1)} (income ${income[n]!.toFixed(1)}${aided.has(n) ? ', aided' : ''})`);
    }
  }
  if (rose.length > 0 || aid.length > 0) process.stdout.write(`${date(w.tick)} rose: ${rose.join('; ') || '-'} | aid: ${aid.join(' ') || '-'}\n`);
}
process.stdout.write(`done: ${year} after ${after}, ${days} days: ${jumps} rises over 1.5 x income + 50, ${explained} of them aided that hour\n`);
