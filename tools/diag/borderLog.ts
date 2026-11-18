/**
 * The borders' record measured (ROADMAP R143a, ADR-1123): a 1938 game of `--years` on `--seed`; at each 1 January the
 * owner map's hash, compared at the end with the map the record gives for that hour; the record's share of the packed
 * save (the packed save against the same save without the record's sections, the bar 7 %); the time of a month's cut.
 *
 *   npx tsx tools/diag/borderLog.ts --seed 99 --years 50
 */
import { packSave } from '../../src/shared/saveCodec';
import { civilFromDays } from '../../src/shared/calendar';
import { decodeSections, encodeSections } from '../../src/sim/core/sections';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../headless/assets';

const arg = (name: string, d: number): number => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? Number(process.argv[i + 1]) : d;
};
const seed = arg('seed', 99);
const years = arg('years', 50);

/** FNV-1a over the map. */
function hashOf(a: Uint16Array): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < a.length; i++) {
    h ^= a[i]!;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SIZE_1938.w) });
const w = s.world;
const jan1: { tick: number; hash: number }[] = [];
const cutMs: number[] = [];
const cut = w.borders.cut.bind(w.borders);
w.borders.cut = (tick: number) => {
  const t0 = performance.now();
  cut(tick);
  cutMs.push(performance.now() - t0);
};
const end = years * 365.25 * 24;
while (w.tick < end) {
  // To the next 1 January's hour, then one more: the map of a run stopped there.
  let day = Math.floor(w.tick / 24) + 1;
  while (civilFromDays(w.startDay + day).month !== 1 || civilFromDays(w.startDay + day).day !== 1) day++;
  const t = day * 24;
  if (t >= end) break;
  s.step(t + 1 - w.tick, (ww) => {
    ww.out.events.length = 0;
    ww.out.fires.length = 0;
  });
  jan1.push({ tick: t, hash: hashOf(w.cells.owner) });
}
let unlike = 0;
for (const j of jan1) if (hashOf(w.borders.ownerAt(j.tick)) !== j.hash) unlike++;
const bytes = s.save();
const without = encodeSections(decodeSections(bytes).filter((x) => !x.name.startsWith('borders.')));
const [packed, packedWithout] = [(await packSave(bytes)).length, (await packSave(without)).length];
const frames = w.borders.frames();
const runs = frames.reduce((n, f) => n + f.runs.length / 3, 0);
const share = (packed - packedWithout) / packedWithout;
cutMs.sort((a, b) => a - b);
console.log(
  `seed ${seed}, ${years} years: ${frames.length} frames, ${runs} runs; 1 January: ${jan1.length - unlike} of ${jan1.length} maps alike; ` +
    `record ${(w.borders.logBytes().length / 1e3).toFixed(0)} kB raw; save ${(packedWithout / 1e3).toFixed(0)} kB packed without it, ${(packed / 1e3).toFixed(0)} kB with it: ${(share * 100).toFixed(2)} % (bar 7 %); ` +
    `a cut ${cutMs[Math.floor(cutMs.length / 2)]!.toFixed(1)} ms median, ${cutMs[cutMs.length - 1]!.toFixed(1)} ms most`,
);
console.log('done:');
