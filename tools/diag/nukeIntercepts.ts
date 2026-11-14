// Each AI launch of plain 1938 over YEARS (R82g; critic run 68: 0 of 47 intercepted on 37501/3, 41501/3): missile or
// bomber, launcher, the target cell's holder, the interception chance (`interceptChance`) in its last hour in flight
// and the launcher's air superiority over the target's zone, and whether it burst or was stopped.
// Usage: npx tsx tools/diag/nukeIntercepts.ts <seed> <years>
import { airSuperiority } from '../../src/sim/systems/airSuperiority';
import { interceptChance } from '../../src/sim/systems/nuclear';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { airOf } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2]);
const years = Number(process.argv[3] ?? 22);
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
type Row = { id: number; nation: number; missile: number; launch: number; chance: number; sup: number; zone: number; holder: number; out: string };
const rows = new Map<number, Row>();
s.step(24 * 365 * years, (x) => {
  for (const l of x.nukeLaunches) {
    let r = rows.get(l.id);
    if (!r) {
      r = { id: l.id, nation: l.nation, missile: l.missile, launch: l.launch, chance: 0, sup: NaN, zone: 0, holder: 0, out: '?' };
      rows.set(l.id, r);
    }
    const cell = Math.min(x.cells.h - 1, Math.max(0, Math.floor(l.ty))) * x.cells.w + Math.floor(l.tx);
    const zone = airOf(x).zoneOf[cell] ?? 0;
    r.chance = interceptChance(x, l);
    r.zone = zone;
    r.sup = zone === 0 ? NaN : airSuperiority(x, l.nation, zone);
    r.holder = x.cells.controller[cell] ?? 0;
  }
  const ev = x.out.events;
  for (let i = 0; i < ev.length; i += 6) {
    const k = ev[i + 1]!;
    // A stop names its launch (its id third); a burst names its yield, so a launch gone from the list unstopped burst.
    if (k === EventKind.NukeIntercepted) {
      const r = rows.get(ev[i + 3]!);
      if (r && r.out === '?') r.out = 'STOPPED';
    }
  }
  const flying = new Set(x.nukeLaunches.map((l) => l.id));
  for (const r of rows.values()) if (r.out === '?' && !flying.has(r.id)) r.out = 'burst';
  x.out.events.length = 0;
  x.out.fires.length = 0;
});
let bombers = 0;
let stopped = 0;
let sum = 0;
for (const r of rows.values()) {
  if (r.missile === 0) {
    bombers++;
    sum += r.chance;
  }
  if (r.out === 'STOPPED') stopped++;
  console.log(`y${(r.launch / 8760 + 1938).toFixed(2)} ${tag(r.nation)} ${r.missile ? 'missile' : 'bomber '} on ${tag(r.holder)}-held zone ${r.zone} superiority ${Number.isNaN(r.sup) ? '-' : r.sup.toFixed(2)} chance ${r.chance.toFixed(2)} ${r.out}`);
}
console.log(`TOTAL seed ${seed} ${years}y launches ${rows.size} bombers ${bombers} stopped ${stopped} expected ${sum.toFixed(2)}`);
console.log('done:');
