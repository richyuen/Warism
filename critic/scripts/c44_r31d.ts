// Critic run 43: R31d (transports with no convoy and nobody aboard are the AI's again). The player (nation <tag>) orders
// an empty transport group <gid> to <x,y> (a port's water or open sea), as a fleet order by click. Traces it daily for
// <days>: place, moving, whether the player's order is still held, and its AI orders; logs MoveRejected of it.
// Usage: npx tsx critic/scripts/c44_r31d.ts <seed> <tag> <gid> <x,y> <days> <out.json> [war foe tag]
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, gidS, xyS, dS, outF, FOE] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(T!);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: N } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols;
if (FOE && !w.wars.atWar(N, tag(FOE))) { s.command({ kind: 'forceWar', attacker: N, defender: tag(FOE) } as never); s.step(1); }
const gid = Number(gidS);
const [x, y] = xyS!.split(',').map(Number);
const ev: string[] = [];
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) if (e[i + 2] === gid) ev.push(`t${e[i]} ${EV[e[i + 1]!]} b${e[i + 3]} ${(+e[i + 4]!).toFixed(1)},${(+e[i + 5]!).toFixed(1)}`);
  e.length = 0; wd.out.fires.length = 0;
};
const st = (): string => w.formations.has(gid) ? `${c().x[gid]!.toFixed(1)},${c().y[gid]!.toFixed(1)}${c().moving[gid] ? ' m->' + (c().targetCell[gid]! % w.cells.w) + ',' + Math.floor(c().targetCell[gid]! / w.cells.w) : ''}${w.playerOrders.has(gid) ? ' PLAYER' : ' ai'}${w.station.has(gid) ? ' st' : ''}` : 'gone';
const before = st();
const ok = s.command({ kind: 'moveFormation', id: gid, x, y, nation: N } as never);
s.applyNow(take as never);
const trace: string[] = [`t${w.tick} order ${ok} before ${before} after ${st()}`];
for (let h = 0; h < 24 * Number(dS); h++) {
  s.step(1, take as never);
  if (h % 12 === 11) trace.push(`t${w.tick} ${st()}`);
}
writeFileSync(outF!, JSON.stringify({ seed: Number(seedS), tag: T, gid, to: [x, y], trace, events: ev }, null, 1));
console.log(trace.join('\n')); console.log(ev.join('\n'));
