/**
 * ROADMAP R80e's measure (ADR-1048): the techs of a year range (default 1975-91) each nation knows at the track's end.
 * From a yearly start of the replay (`public/data/scenarios/1938h/start/<from>.sav`, `npm run saves`) or from 1938 (`0`),
 * 1938h on its seed to the end; then, for each living nation that knows any, how many of the range's techs and which
 * it lacks, the great powers first; and the living that know none.
 *
 * Usage: npx tsx tools/diag/techsBy.ts [from year = 1975 | 0] [first tech year = 1975]
 */
import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { greatPowers, strengths } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { knowsTechs, techMask } from '../../src/sim/tech';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const from = Number(process.argv[2] ?? 1975);
const first = Number(process.argv[3] ?? 1975);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
const save = `public/data/scenarios/1938h/start/${from}.sav`;
if (from > 0) {
  if (!existsSync(save)) throw new Error(`${save}: run npm run saves`);
  const raw = readFileSync(save);
  sim.load(new Uint8Array(raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw));
}
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const t0 = Date.now();
const w = sim.world;
while (!w.track!.ended) sim.step(24, quiet);
const techs = w.rules!.techs.map((r, i) => ({ r, i })).filter(({ r }) => r.year >= first);
const greats = [...greatPowers(w, strengths(w))];
process.stdout.write(`seed ${SEED_1938H} from ${from || 1938}: the end at day ${sim.tick / 24} (${Math.round((Date.now() - t0) / 1000)} s); techs from ${first}: ${techs.map(({ r }) => `${r.id} ${r.year}`).join(', ')}\n`);
const rows: { n: number; k: number; lack: string[] }[] = [];
const none: string[] = [];
w.nations.forEach((n) => {
  if (w.nations.cols.living[n] !== 1) return;
  const known = techs.filter(({ i }) => knowsTechs(w, n, techMask([i])));
  if (known.length === 0) none.push(tag(n));
  else rows.push({ n, k: known.length, lack: techs.filter((x) => !known.includes(x)).map(({ r }) => r.id) });
});
rows.sort((a, b) => Number(greats.includes(b.n)) - Number(greats.includes(a.n)) || b.k - a.k || a.n - b.n);
for (const r of rows) process.stdout.write(`${greats.includes(r.n) ? 'GP ' : '   '}${tag(r.n)} ${r.k}/${techs.length}${r.lack.length ? ` lacks ${r.lack.join(' ')}` : ''}\n`);
process.stdout.write(`done: ${rows.length} living know some, ${none.length} none (${none.join(' ')})\n`);
