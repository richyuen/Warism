// Critic run 70 (new, R84a/R84e): what leaving the track does to the wars standing at that hour. A game from a built year
// (critic/c75_starts/<year>.sav) is left free (leaveTrack) or ended by a God act (a revolt, MODE=god): the wars before,
// the wars after the hour, the peaces of that hour, and the land held by the sides of the wars that ended.
// Usage: npx tsx critic/scripts/c75_freewar.ts <year> <after> [free|god|take] [days to watch = 30]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1943);
const after = Number(process.argv[3] ?? 53543) >>> 0;
const mode = process.argv[4] ?? 'free';
const days = Number(process.argv[5] ?? 30);
const tags = TAGS_1938H as readonly string[];
const tag = (n: number): string => tags[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c75_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
const w = sim.world;
const wars = (x: World): string[] => x.wars.list.map((war) => `${war.sides[0].map(tag).join('+')} v ${war.sides[1].map(tag).join('+')}`);
const heldCells = (x: World): Map<string, number> => {
  const m = new Map<string, number>();
  const { owner, controller } = x.cells;
  for (let c = 0; c < owner.length; c++) {
    const o = owner[c]!, k = controller[c]!;
    if (o && k && o !== k) m.set(`${tag(k)} on ${tag(o)}`, (m.get(`${tag(k)} on ${tag(o)}`) ?? 0) + 1);
  }
  return m;
};
const before = wars(w);
const held0 = heldCells(w);
const totalHeld = (m: Map<string, number>): number => [...m.values()].reduce((s, v) => s + v, 0);
process.stdout.write(`${year} after ${after} ${mode}: tick ${sim.tick}, steered ${w.steered}\n`);
process.stdout.write(`wars before: ${before.length}\n  ${before.join('\n  ')}\n`);
process.stdout.write(`occupied cells before: ${totalHeld(held0)} (${[...held0].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(', ')})\n`);
const peaces: string[] = [];
const grab = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    if (e[i + 1] === EventKind.PeaceSigned) peaces.push(`t${sim.tick} PeaceSigned ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`);
    if (e[i + 1] === EventKind.NationAnnexed) peaces.push(`t${sim.tick} NationAnnexed ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`);
  }
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
if (mode === 'god') {
  // The smallest God act: a province's unrest set (God's slider), province 5, to 10.
  sim.command({ kind: 'setUnrest', province: 5, value: 10 });
} else if (mode === 'take') {
  // Take control of Germany (the scenario form's or the nation panel's "Take control").
  sim.command({ kind: 'setPlayer', nation: tags.indexOf('GER') + 1 });
} else sim.command({ kind: 'leaveTrack' });
sim.step(1, grab);
const after1 = wars(w);
const held1 = heldCells(w);
process.stdout.write(`steered after: ${w.steered}\n`);
process.stdout.write(`peaces in the first hour: ${peaces.length}\n  ${peaces.slice(0, 40).join('\n  ')}\n`);
process.stdout.write(`wars after hour 1: ${after1.length}\n  ${after1.join('\n  ')}\n`);
process.stdout.write(`occupied cells after hour 1: ${totalHeld(held1)} (${[...held1].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(', ')})\n`);
// The formations of each nation standing on land another nation owns, at peace with it (after hour 1).
{
  const f = w.formations.cols as unknown as { nation: Uint16Array; x: Float64Array; y: Float64Array };
  const alive = w.formations.alive;
  const W = (w.cells as unknown as { w: number }).w ?? 2048;
  const m = new Map<string, [number, number]>();
  for (let id = 1; id < alive.length; id++) {
    if (alive[id] !== 1) continue;
    const n = f.nation[id]!;
    const c = Math.floor(f.y[id]!) * W + Math.floor(f.x[id]!);
    const o = w.cells.owner[c] ?? 0;
    if (!o || o === n || w.wars.atWar(n, o)) continue;
    const k = `${tag(n)} in ${tag(o)}`;
    const v = m.get(k) ?? [0, 0];
    v[0]++;
    v[1] += (w.formations.cols as unknown as { strength: Uint32Array }).strength[id]!;
    m.set(k, v);
  }
  process.stdout.write(`formations on land of a nation at peace with them, after hour 1: ${[...m].sort((a, b) => b[1][1] - a[1][1]).slice(0, 8).map(([k, v]) => `${k} ${v[0]} (${v[1]} men)`).join(', ')}
`);
}
const gone = before.filter((x) => !after1.includes(x));
process.stdout.write(`wars ended at once: ${gone.length}\n  ${gone.join('\n  ')}\n`);
peaces.length = 0;
sim.step(24 * days, grab);
process.stdout.write(`day ${days}: wars ${wars(w).length}; peaces/annexations ${peaces.length}; occupied ${totalHeld(heldCells(w))}\n  ${wars(w).join('\n  ')}\n`);
process.stdout.write('done:\n');
