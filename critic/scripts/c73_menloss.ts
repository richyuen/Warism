// Critic run 71 (new, R85b): the men of each side of the wars the track's end lets go on, day by day for the first 40 days
// (startMen is reset at the end, and a side's exhaustion is 80 x its share of men lost since). Formation counts and men by
// nation for GER, SOV, ITA, ENG, USA, JAP, CHI.
// Usage: npx tsx critic/scripts/c73_menloss.ts <year> <after> <god|take|free> [days=40]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1943);
const after = Number(process.argv[3] ?? 53543) >>> 0;
const mode = process.argv[4] ?? 'free';
const days = Number(process.argv[5] ?? 40);
const tags = TAGS_1938H as readonly string[];
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c73_starts/${year}.sav`))));
sim.world.track!.afterSeed = after;
const w = sim.world;
const watch = ['GER', 'SOV', 'ITA', 'ENG', 'USA', 'JAP', 'CHI'];
const men = (): string => {
  const f = w.formations.cols as unknown as { nation: Uint16Array; strength: Uint32Array };
  const alive = w.formations.alive;
  const m = new Map<string, [number, number]>();
  for (let id = 1; id < alive.length; id++) {
    if (alive[id] !== 1) continue;
    const t = tags[f.nation[id]! - 1] ?? '?';
    if (!watch.includes(t)) continue;
    const v = m.get(t) ?? [0, 0];
    v[0]++;
    v[1] += f.strength[id]!;
    m.set(t, v);
  }
  return watch.map((t) => `${t} ${m.get(t)?.[0] ?? 0}/${((m.get(t)?.[1] ?? 0) / 1000).toFixed(0)}k`).join(' ');
};
const lost = new Map<string, number>();
const where = (): string => {
  const f = w.formations.cols as unknown as { nation: Uint16Array; x: Float64Array; y: Float64Array; strength: Uint32Array };
  const alive = w.formations.alive;
  const g = tags.indexOf('GER') + 1;
  const m = new Map<string, number>();
  for (let id = 1; id < alive.length; id++) {
    if (alive[id] !== 1 || f.nation[id] !== g) continue;
    const c = Math.floor(f.y[id]!) * w.cells.w + Math.floor(f.x[id]!);
    const o = w.cells.owner[c]!, k = w.cells.controller[c]!;
    const key = o === 0 ? 'sea/none' : k === g ? (o === g ? 'own' : `held ${tags[o - 1]}`) : w.wars.atWar(g, k) ? `enemy ${tags[k - 1]}` : `peace ${tags[k - 1]}`;
    m.set(key, (m.get(key) ?? 0) + f.strength[id]!);
  }
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${(v / 1000).toFixed(0)}k`).join(', ');
};
const clear = (x: typeof w): void => {
  const e = x.out.events;
  for (let i = 0; i < e.length; i += 6) {
    if (e[i + 1] === 2) { const t = tags[e[i + 3]! - 1] ?? '?'; lost.set(t, (lost.get(t) ?? 0) + 1); }
    if (e[i + 1] === 35) { const t = `disband ${tags[e[i + 2]! - 1]}`; lost.set(t, (lost.get(t) ?? 0) + e[i + 3]!); }
    if (e[i + 1] === 4) { const t = `bankrupt ${tags[e[i + 2]! - 1]}=${e[i + 3]}`; lost.set(t, (lost.get(t) ?? 0) + 1); }
  }
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
process.stdout.write(`${year} ${mode} after ${after}\nh0: ${men()}\n`);
if (mode === 'god') sim.command({ kind: 'setUnrest', province: 5, value: 10 });
else if (mode === 'take') sim.command({ kind: 'setPlayer', nation: tags.indexOf('GER') + 1 });
else if (mode === 'free') sim.command({ kind: 'leaveTrack' });
sim.step(1, clear);
process.stdout.write(`h1: ${men()}
  GER where: ${where()}; GER gold ${w.nations.cols.gold[tags.indexOf('GER') + 1]!.toFixed(0)}
`);
for (let d = 1; d <= days; d++) {
  sim.step(24, clear);
  if (d <= 5 || d % 5 === 0) {
    const wars = w.wars.list.filter((x) => x.scoreFrom !== undefined).map((x) => `#${x.id} ${tags[x.sides[0][0]! - 1]}-${tags[x.sides[1][0]! - 1]} men0 ${x.startMen.map((v) => (v / 1000).toFixed(0)).join('/')}k exh ${x.exhaustion.map((v) => v.toFixed(0)).join('/')}`);
    process.stdout.write(`d${d}: ${men()} | ${wars.join('; ')}
  GER where: ${where()}
  lost: ${[...lost].filter(([k]) => /GER|ITA|SOV|bankrupt/.test(k)).map(([k, v]) => `${k} ${v}`).join(', ')}; GER gold ${w.nations.cols.gold[tags.indexOf('GER') + 1]!.toFixed(0)}
`);
  }
}
process.stdout.write('done:\n');
