// Critic run 71 (new, R85b's `War.scoreFrom`, new in the wars' JSON): a game left at a built year (free, a God act or Take
// control), stepped H hours, saved; the same world and the save loaded into a new Sim, both stepped D days; the hashes and
// each war's score and scoreFrom compared.
// Usage: npx tsx critic/scripts/c80_saveload.ts <year> <after> <god|take|free> [H=24] [D=30]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const year = Number(process.argv[2] ?? 1942), after = Number(process.argv[3] ?? 53542) >>> 0, mode = process.argv[4] ?? 'god';
const H = Number(process.argv[5] ?? 24), D = Number(process.argv[6] ?? 30);
const tags = TAGS_1938H as readonly string[];
const assets = assets1938(SIZE_1938.w);
const make = (): Sim => new Sim({ scenario: '1938h', seed: SEED_1938H, assets, options: { after } });
const clear = (x: Sim['world']): void => { x.out.events.length = 0; x.out.fires.length = 0; };
const a = make();
a.load(new Uint8Array(gunzipSync(readFileSync(`critic/c80_starts/${year}.sav`))));
a.world.track!.afterSeed = after;
if (mode === 'god') a.command({ kind: 'setUnrest', province: 5, value: 10 });
else if (mode === 'take') a.command({ kind: 'setPlayer', nation: tags.indexOf('GER') + 1 });
else a.command({ kind: 'leaveTrack' });
a.step(H, clear);
const bytes = a.save();
const wars = (s: Sim): string => s.world.wars.list.map((w) => `#${w.id}:${w.score}/${w.scoreFrom ?? '-'}`).join(' ');
const b = make();
b.load(bytes);
const hx = (n: number): string => (n >>> 0).toString(16).padStart(8, '0');
process.stdout.write(`${year} ${mode} after ${after}: saved at tick ${a.tick} (${bytes.length} bytes)\n  at save: A ${hx(a.hash())} B ${hx(b.hash())}\n  A wars ${wars(a)}\n  B wars ${wars(b)}\n`);
for (let d = 1; d <= D; d++) {
  a.step(24, clear);
  b.step(24, clear);
  if (d === 1 || d % 10 === 0 || a.hash() !== b.hash()) {
    process.stdout.write(`  d${d}: A ${hx(a.hash())} B ${hx(b.hash())} ${a.hash() === b.hash() ? 'same' : 'DIFFER'}\n`);
    if (a.hash() !== b.hash()) { process.stdout.write(`  A wars ${wars(a)}\n  B wars ${wars(b)}\n`); break; }
  }
}
process.stdout.write('done:\n');
