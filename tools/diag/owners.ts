/**
 * Who owns and who holds the land of countries (`adm0`) at a yearly start of the replay (`npm run saves`), for writing
 * the timeline's next events: per country its owners' and holders' tags with their cells; with `-p` each province's
 * (its `adm1` code and name). Also the living nations among `tags` given after `--`, and their alliances and wars.
 *
 * Usage: npx tsx tools/diag/owners.ts <year> AGO,ETH [-p] [-- ANG UNT CUB]
 */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import type { Admin1Meta } from '../../src/shared/admin1';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938, earthAsset } from '../../tests/helpers/earth';

const args = process.argv.slice(2);
const year = Number(args[0]);
const of = new Set((args[1] ?? '').split(',').filter(Boolean));
const byProvince = args.includes('-p');
const dash = args.indexOf('--');
const tags = dash >= 0 ? args.slice(dash + 1) : [];
const tag = (n: number): string => (n === 0 ? '-' : (TAGS_1938H[n - 1] ?? `#${n}`));
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
const raw = readFileSync(`public/data/scenarios/1938h/start/${year}.sav`);
sim.load(new Uint8Array(raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw));
const w = sim.world;
const meta = JSON.parse(earthAsset('admin1-meta').toString('utf8')) as Admin1Meta[];
const { owner, controller, province } = w.cells;
const count = (m: Map<string, number>, k: string): void => void m.set(k, (m.get(k) ?? 0) + 1);
const country = new Map<string, { own: Map<string, number>; held: Map<string, number> }>();
const prov = new Map<number, { own: Map<string, number>; held: Map<string, number> }>();
for (let c = 0; c < owner.length; c++) {
  const p = province[c]!;
  if (p === 0 || owner[c] === 0) continue;
  const m = meta[p - 1];
  if (!m || !of.has(m.adm0)) continue;
  const a = country.get(m.adm0) ?? { own: new Map(), held: new Map() };
  count(a.own, tag(owner[c]!));
  count(a.held, tag(controller[c]!));
  country.set(m.adm0, a);
  const b = prov.get(p) ?? { own: new Map(), held: new Map() };
  count(b.own, tag(owner[c]!));
  count(b.held, tag(controller[c]!));
  prov.set(p, b);
}
const show = (m: Map<string, number>): string => [...m].sort((x, y) => y[1] - x[1]).map(([t, k]) => `${t} ${k}`).join(', ');
process.stdout.write(`${year}.sav, tick ${sim.tick}\n`);
for (const [k, a] of country) process.stdout.write(`${k}: owned ${show(a.own)}; held ${show(a.held)}\n`);
if (byProvince)
  for (const [p, b] of [...prov].sort((x, y) => meta[x[0] - 1]!.adm0.localeCompare(meta[y[0] - 1]!.adm0) || x[0] - y[0]))
    process.stdout.write(`  ${meta[p - 1]!.adm1} ${meta[p - 1]!.name}: ${show(b.own)}${show(b.held) !== show(b.own) ? `; held ${show(b.held)}` : ''}\n`);
for (const t of tags) {
  const n = TAGS_1938H.indexOf(t) + 1;
  if (n === 0) continue;
  const nc = w.nations.cols;
  const a = w.alliances.allianceOf(n);
  const wars = w.wars.list.filter((x) => x.sides[0].includes(n) || x.sides[1].includes(n)).map((x) => `${x.sides[0].map(tag).join('+')} v ${x.sides[1].map(tag).join('+')}`);
  process.stdout.write(`${t}: ${nc.living[n] ? 'living' : 'dead'}${nc.overlord[n] ? `, puppet of ${tag(nc.overlord[n]!)}` : ''}${a ? `, alliance of ${tag(a.leader)}` : ''}; wars ${wars.join('; ') || 'none'}\n`);
}
