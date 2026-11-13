// Critic run 65: who holds warheads in the built 1975 start, and each detonation (with its civilians and men) in the
// first DAYS of a free game from it (after seed as given). Usage: npx tsx critic/scripts/c66_nukes75.ts <after> [days=365] [year=1975]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const after = Number(process.argv[2] ?? 6161) >>> 0;
const days = Number(process.argv[3] ?? 365);
const year = Number(process.argv[4] ?? 1975);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c66_starts/${year}.sav`))));
const tag = (n: number): string => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`;
const w = sim.world;
console.log('warheads at start:', [...w.warheads.entries()].map(([n, s]) => `${tag(n)}:${(s as { stock: number }).stock}`).join(' '));
w.track!.afterSeed = after;
sim.command({ kind: 'leaveTrack' });
const t0 = sim.tick;
const date = (t: number): string => new Date(Date.UTC(1938, 0, 1) + t * 3600000).toISOString().slice(0, 10);
for (let d = 0; d < days; d++) {
  sim.step(24, (x: World) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      if (ev[i + 1] === EventKind.NukeDetonated || ev[i + 1] === EventKind.NukeLaunched || ev[i + 1] === EventKind.NukeIntercepted)
        console.log(date(ev[i]!), Object.entries(EventKind).find(([, v]) => v === ev[i + 1])?.[0], tag(ev[i + 2]!), tag(ev[i + 3]!), ev[i + 4], ev[i + 5]);
    }
    ev.length = 0;
    x.out.fires.length = 0;
  });
}
console.log('day', Math.floor((sim.tick - t0) / 24), 'warheads at end:', [...w.warheads.entries()].map(([n, s]) => `${tag(n)}:${(s as { stock: number }).stock}`).join(' '));
