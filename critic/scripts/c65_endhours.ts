// Critic run 65: the hours around the replay's end (31 December 1975) from the built 1975 start, after seed as given:
// each war declared, alliance joined or founded, and the track's end, with its hour. Usage: npx tsx critic/scripts/c65_endhours.ts [after=999]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const after = Number(process.argv[2] ?? 999) >>> 0;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync('critic/c65_starts/1975.sav'))));
sim.world.track!.afterSeed = after;
const tag = (n: number): string => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`;
const KN = Object.fromEntries(Object.entries(EventKind).filter(([, v]) => typeof v === 'number').map(([k, v]) => [v as number, k]));
const want = new Set(['WarDeclared', 'AllianceJoined', 'AllianceFounded', 'TrackEnded', 'JoinedWar', 'WarJoined', 'AllianceLeft']);
const date = (t: number): string => new Date(Date.UTC(1938, 0, 1) + t * 3600000).toISOString().slice(0, 13);
const stop = sim.world.track!.tickOf('1976-01-03');
const from = sim.world.track!.tickOf('1975-12-29');
while (sim.tick < stop) {
  sim.step(1, (w: World) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const k = KN[ev[i + 1]!] ?? String(ev[i + 1]);
      if (ev[i]! >= from && (want.has(k) || /Alliance|Track|War(Declared|Joined)|Joined/.test(k))) console.log(date(ev[i]!), k, tag(ev[i + 2]!), tag(ev[i + 3]!));
    }
    ev.length = 0;
    w.out.fires.length = 0;
  });
}
console.log('ended', sim.world.track!.ended);
