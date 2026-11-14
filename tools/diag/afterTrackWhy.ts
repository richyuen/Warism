/**
 * ROADMAP R80j: why a bloc of the track's end loses a member, and the wars that set its leaders on opposite sides,
 * from `afterTrack.ts`'s saved world at the end (`.cache/afterTrack_<seed>.sav.gz`; run that tool first). Daily for
 * `years`: each member of an end bloc that leaves it (living or not, its alliance now, who holds its capital), and each
 * war with the two leaders on opposite sides (its sides, the day it began and ended).
 *
 * `WATCH=TUR,CUB`: each change of those nations' wars, with the sides and the strength of each (men), as it happens.
 *
 * Usage: npx tsx tools/diag/afterTrackWhy.ts [seed = 1] [years = 20]
 */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 1);
const years = Number(process.argv[3] ?? 20);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
sim.load(new Uint8Array(gunzipSync(readFileSync(`.cache/afterTrack_${seed}.sav.gz`))));
const w = sim.world;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const blocs = w.alliances.list.filter((a) => a.members.length >= 4).map((a) => ({ id: a.id, leader: a.leader, members: new Set(a.members) }));
const gone = new Set<number>();
const opposed = new Map<object, { from: number; to: number; text: string }>();
const day = (): number => Math.floor(w.tick / 24);
const watch = (process.env.WATCH ?? '').split(',').filter(Boolean).map((t) => TAGS_1938H.indexOf(t) + 1);
const seen = new Map<number, string>();
const men = (n: number): number => {
  let m = 0;
  w.formations.forEach((i) => {
    if (w.formations.cols.nation[i] === n) m += w.formations.cols.strength[i]!;
  });
  return Math.round(m / 1000);
};
const side = (ns: readonly number[]): string => ns.map(tag).join('+');
for (let d = 0; d < years * 365; d++) {
  sim.step(24, quiet);
  for (const n of watch) {
    const wars = w.wars.list.filter((x) => x.sides[0].includes(n) || x.sides[1].includes(n));
    const text = wars.map((x) => `${x.sides[0].map((m) => `${tag(m)}(${men(m)}k)`).join('+')} v ${x.sides[1].map((m) => `${tag(m)}(${men(m)}k)`).join('+')}`).join('; ');
    const key = wars.map((x) => `${side(x.sides[0])} v ${side(x.sides[1])}`).join('; ');
    if (seen.get(n) !== key) process.stdout.write(`day ${day()} ${tag(n)}: ${text || 'no war'}
`);
    seen.set(n, key);
  }
  for (const b of blocs) {
    const now = w.alliances.list.find((a) => a.id === b.id);
    for (const m of b.members) {
      if (gone.has(m) || now?.members.includes(m)) continue;
      gone.add(m);
      const nc = w.nations.cols;
      const cap = Math.floor(nc.capitalY[m]!) * w.cells.w + Math.floor(nc.capitalX[m]!);
      const holder = w.cells.controller[cap] ?? 0;
      const al = w.alliances.allianceOf(m);
      process.stdout.write(`day ${day()}: ${tag(m)} out of ${tag(b.leader)}'s bloc; living ${nc.living[m]}; alliance ${al ? `${al.nameKey} of ${tag(al.leader)}` : 'none'}; capital held by ${tag(holder)}; wars ${w.wars.list.filter((x) => x.sides[0].includes(m) || x.sides[1].includes(m)).map((x) => `${side(x.sides[0])} v ${side(x.sides[1])}`).join('; ') || 'none'}\n`);
    }
  }
  const live = new Set<object>();
  for (const war of w.wars.list) {
    const hit = blocs.some((a, i) => blocs.some((b, j) => j > i && ((war.sides[0].includes(a.leader) && war.sides[1].includes(b.leader)) || (war.sides[1].includes(a.leader) && war.sides[0].includes(b.leader)))));
    if (!hit) continue;
    live.add(war);
    const o = opposed.get(war);
    if (o) o.to = day();
    else opposed.set(war, { from: day(), to: day(), text: `${side(war.sides[0])} v ${side(war.sides[1])}` });
  }
}
for (const o of opposed.values()) process.stdout.write(`leaders opposed: days ${o.from}-${o.to} (${o.to - o.from + 1}): ${o.text}\n`);
process.stdout.write('done\n');
