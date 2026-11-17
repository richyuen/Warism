// Critic run 71 (new, R85b): the long run of the wars the track's end lets go on. From a built year (critic/c75_starts/<year>.sav),
// a God act (god), Take control of Germany (take) or a free start (free); then each war that has `scoreFrom` is followed
// month by month: its score, scoreFrom, the raw score (score + scoreFrom, unclamped view), exhaustion, the cells each side
// holds of the other; and how it ends (the score at peace, the cells that changed owner, and those given back).
// Usage: npx tsx critic/scripts/c75_warlong.ts <year> <after> <god|take|free> <days>
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import type { War } from '../../src/sim/wars';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1942);
const after = Number(process.argv[3] ?? 53542) >>> 0;
const mode = process.argv[4] ?? 'god';
const days = Number(process.argv[5] ?? 730);
const tags = TAGS_1938H as readonly string[];
const tag = (n: number): string => tags[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c75_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
const w = sim.world;
const date = (t: number): string => new Date(Date.UTC(1938, 0, 1) + t * 3600e3).toISOString().slice(0, 13);
const label = (war: War): string => `${war.sides[0].map(tag).join('+')} v ${war.sides[1].map(tag).join('+')}`;
const held = (x: World, war: War): [number, number] => {
  const A = new Set(war.sides[0]), D = new Set(war.sides[1]);
  let ad = 0, da = 0;
  const { owner, controller } = x.cells;
  for (let c = 0; c < owner.length; c++) {
    const o = owner[c]!, k = controller[c]!;
    if (D.has(o) && A.has(k)) ad++;
    else if (A.has(o) && D.has(k)) da++;
  }
  return [ad, da];
};
/** Cells owned by side A's nations, by side D's: a peace's transfers are the change. */
const owned = (x: World, war: War): [number, number] => {
  const A = new Set(war.sides[0]), D = new Set(war.sides[1]);
  let a = 0, d = 0;
  for (const o of x.cells.owner) {
    if (A.has(o)) a++;
    else if (D.has(o)) d++;
  }
  return [a, d];
};
const KN = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k])) as Record<number, string>;
const log = (s: string): void => void process.stdout.write(`${s}\n`);
log(`${year} after ${after} ${mode}: start ${date(sim.tick)}; wars ${w.wars.list.length}`);
for (const war of w.wars.list) log(`  before: #${war.id} ${label(war)} score ${war.score} start ${date(war.startTick)} held ${held(w, war).join('/')}`);
const followed = new Map<number, { war: War; label: string; last: [number, number]; own: [number, number]; kept: [number, number] }>();
const lines: string[] = [];
const grab = (x: World): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1];
    if (k === EventKind.PeaceSigned || k === EventKind.NationAnnexed || k === EventKind.PuppetCreated) lines.push(`${date(e[i]!)} ${KN[k!]} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`);
  }
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
if (mode === 'god') sim.command({ kind: 'setUnrest', province: 5, value: 10 });
else if (mode === 'take') sim.command({ kind: 'setPlayer', nation: tags.indexOf('GER') + 1 });
else sim.command({ kind: 'leaveTrack' });
const pre = [...w.wars.list];
sim.step(1, grab);
for (const war of pre) if (!w.wars.list.includes(war)) log(`  ended in hour 1: #${war.id} ${label(war)}`);
for (const war of w.wars.list) if (!followed.has(war.id)) followed.set(war.id, { war, label: label(war), last: held(w, war), own: owned(w, war), kept: held(w, war) });
log(`after hour 1: wars ${w.wars.list.length}; with scoreFrom ${followed.size}; peaces ${lines.length}`);
for (const { war, label: l, last } of followed.values()) log(`  #${war.id} ${l} scoreFrom ${war.scoreFrom ?? '-'} score ${war.score} start ${date(war.startTick)} held A-of-D/D-of-A ${last.join('/')}`);
lines.length = 0;
for (let d = 1; d <= days; d++) {
  sim.step(24, grab);
  for (const [id, f] of followed) {
    const live = w.wars.list.includes(f.war);
    if (live) {
      const h = held(w, f.war);
      if (d % 30 === 0) log(`d${d} ${date(sim.tick)} #${id} ${f.label}: score ${f.war.score} (from ${f.war.scoreFrom}) exh ${f.war.exhaustion.map((v) => v.toFixed(0)).join('/')} held ${h.join('/')}`);
      f.last = h;
    } else {
      const h = held(w, f.war);
      const o = owned(w, f.war);
      log(`d${d} ${date(sim.tick)} #${id} ${f.label} ENDED: last score ${f.war.score} (from ${f.war.scoreFrom ?? '-'}), owned A/D ${f.own.join('/')} at the end of the track -> ${o.join('/')} (A gained ${o[0] - f.own[0]}; occupied at the track's end A-of-D/D-of-A ${f.kept.join('/')}), exh ${f.war.exhaustion.map((v) => v.toFixed(0)).join('/')}; held before ${f.last.join('/')} -> after ${h.join('/')}; ${lines.filter((x) => x.includes(f.label.split(' v ')[0]!.split('+')[0]!)).slice(-4).join('; ')}`);
      followed.delete(id);
    }
  }
  if (followed.size === 0) break;
}
log(`events (peace, annex, puppet), ${lines.length}:\n  ${lines.slice(0, 60).join('\n  ')}`);
log('done:');
