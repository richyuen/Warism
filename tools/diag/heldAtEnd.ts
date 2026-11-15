/**
 * ROADMAP R80l: the land held at peace on the track's end hour (`worldBreaks`' `held` lines, `tests/helpers/
 * diploInvariants.ts`), with each pair's cells by province code (adm1) and, of the timeline's `occupy` events, the
 * last that named the holder and the owner. Seed 1938 starts from the yearly start of the end's year where it is built
 * (`npm run saves`) under this timeline (`FRESH=1`: stepped from 1938, as any other seed, after a timeline change).
 *
 * Usage: npx tsx tools/diag/heldAtEnd.ts [seed = SEED_1938H]
 */
import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { unproject } from '../../src/sim/data/projection';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { useTags, worldBreaks } from '../../tests/helpers/diploInvariants';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? SEED_1938H);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
useTags(tag);
const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
const w = sim.world;
const t = w.track!;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
const start = `public/data/scenarios/1938h/start/${(TIMELINE_1938H.end ?? '').slice(0, 4)}.sav`;
if (seed === SEED_1938H && existsSync(start) && process.env.FRESH !== '1') {
  const b = readFileSync(start);
  sim.load(new Uint8Array(b[0] === 0x1f ? gunzipSync(b) : b));
}
const from = w.tick;
while (!t.ended) sim.step(1, quiet);
if (from > 0 && w.tick - from < 24) throw new Error(`${start} was built under another timeline: run with FRESH=1 or after npm run saves`);
process.stdout.write(`seed ${seed}: the track ended at tick ${w.tick}\n`);
const lines = worldBreaks(w).filter((l) => l.startsWith('held'));
const { owner, controller, province } = w.cells;
for (const l of lines) {
  const [, k, o] = /held: (\S+) on (\S+),/.exec(l)!;
  const [ki, oi] = [TAGS_1938H.indexOf(k!) + 1, TAGS_1938H.indexOf(o!) + 1];
  const by = new Map<string, number>();
  for (let c = 0; c < owner.length; c++) {
    if (owner[c] !== oi || controller[c] !== ki) continue;
    const p = province[c]!;
    const [lon, lat] = unproject(((c % w.cells.w) + 0.5) / w.cells.w, (Math.floor(c / w.cells.w) + 0.5) / w.cells.h);
    const code = p > 0 ? (t.codes[p - 1]?.adm1 ?? `#${p}`) : `- (${lon.toFixed(2)}, ${lat.toFixed(2)})`;
    by.set(code, (by.get(code) ?? 0) + 1);
  }
  const last = TIMELINE_1938H.events.filter((e) => e.kind === 'occupy' && e.by === k && e.of.includes(o!)).at(-1);
  process.stdout.write(`${l}: ${[...by].map(([c, n]) => `${c} ${n}`).join(', ')}; last occupy ${last ? `${last.date} ${(last as { note?: string }).note ?? ''}` : 'none'}\n`);
}
process.stdout.write(`${lines.length} held lines\ndone:\n`);
