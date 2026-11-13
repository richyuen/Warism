// Critic run 66 (new): R74h's air hold (ADR-1011) on the replay from the built 1969 start (critic/c66_starts/1969.sav),
// the track running: by month of 1969, the AirWar rows (each pair and the aircraft each side lost) and the AirRaids
// rows (striker > struck, men, guns and vehicles), so the Sino-Soviet pair (held, `air`) and the others (Vietnam: not
// held) can be read side by side. Also the CCP-SOV war's state each month. Usage: npx tsx critic/scripts/c66_air69.ts [days=365] [year=1969]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIDE_SHIPS } from '../../src/shared/history';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const days = Number(process.argv[2] ?? 365);
const year = Number(process.argv[3] ?? 1969);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c66_starts/${year}.sav`))));
const tag = (n: number): string => (TAGS_1938H as readonly string[])[n - 1] ?? `#${n}`;
const id = (t: string): number => (TAGS_1938H as readonly string[]).indexOf(t) + 1;
const date = (t: number): string => new Date(Date.UTC(1938, 0, 1) + t * 3600000).toISOString().slice(0, 10);
const w = sim.world;
const ccp = id('CCP'), sov = id('SOV');
let battlesCS = 0;
for (let d = 0; d < days; d++) {
  sim.step(24, (x: World) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const k = ev[i + 1];
      if (k === EventKind.AirWar) {
        const a = ev[i + 2]!, b = ev[i + 3]!;
        console.log(date(ev[i]!), 'AirWar', tag(a % SIDE_SHIPS), Math.floor(a / SIDE_SHIPS), tag(b % SIDE_SHIPS), Math.floor(b / SIDE_SHIPS));
      } else if (k === EventKind.AirRaids) {
        const b = ev[i + 3]!;
        console.log(date(ev[i]!), 'AirRaids', tag(ev[i + 2]!), '>', tag(b % SIDE_SHIPS), Math.floor(b / SIDE_SHIPS));
      } else if (k === EventKind.WarDeclared || k === EventKind.PeaceMade) {
        const a = ev[i + 2]!, b = ev[i + 3]!;
        if ([a, b].includes(ccp) || [a, b].includes(sov)) console.log(date(ev[i]!), k === EventKind.WarDeclared ? 'WarDeclared' : 'PeaceMade', tag(a), tag(b));
      }
    }
    ev.length = 0;
    x.out.fires.length = 0;
  });
  // Sorties of either side over the other's held front: count wings of CCP/SOV aloft.
  if (w.wars.atWar(ccp, sov)) {
    let c = 0, s = 0;
    for (const [wid] of w.sorties) { const n = w.formations.cols.nation[wid]; if (n === ccp) c++; if (n === sov) s++; }
    if (d % 30 === 0) console.log(date(sim.tick), `CCP-SOV at war; sorties aloft CCP ${c} SOV ${s}`);
    battlesCS++;
  }
}
console.log(`days CCP-SOV at war: ${battlesCS}; track ended: ${w.track?.ended}`);
