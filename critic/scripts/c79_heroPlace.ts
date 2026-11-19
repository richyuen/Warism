// Critic run 72 (new): where a year played free with heroes on (the title's default, ADR-1070) places 1938's heroes.
// Each hero: its nation, template, place, the cell's owner and holder there, its nation's capital, the distance (km).
// Usage: npx tsx critic/scripts/c79_heroPlace.ts <year> [after] [days]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1975);
const after = Number(process.argv[3] ?? 55205);
const days = Number(process.argv[4] ?? 0);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
if (year !== 1938) sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c79_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
sim.command({ kind: 'leaveTrack', options: { heroes: 'on' } } as never);
sim.step(1 + days * 24, (x) => { x.out.events.length = 0; x.out.fires.length = 0; });
const w = sim.world;
const nc = w.nations.cols;
const f = w.formations.cols as unknown as Record<string, Float32Array | Int32Array>;
const kmPerCell = 40075 / w.cells.w;
console.log(`${year} free after ${after} day ${days}: roster ${w.heroRoster.length} alive ${w.heroes.size}`);
for (const [fid, row] of w.heroes) {
  const r = w.heroRoster[row]!;
  const x = f.x![fid]!, y = f.y![fid]!;
  const cell = Math.floor(y) * w.cells.w + Math.floor(x);
  const cx = nc.capitalX[r.nation]!, cy = nc.capitalY[r.nation]!;
  const d = Math.hypot(x - cx, y - cy) * kmPerCell;
  console.log(`  ${tag(r.nation)} ${TEMPLATES_1938[r.template]?.id} at (${x.toFixed(1)},${y.toFixed(1)}) roster (${r.x.toFixed(1)},${r.y.toFixed(1)}) owner ${tag(w.cells.owner[cell]!)} holder ${tag(w.cells.controller[cell]!)} capital (${cx.toFixed(1)},${cy.toFixed(1)}) ${d.toFixed(0)} km`);
}
console.log('done:');
