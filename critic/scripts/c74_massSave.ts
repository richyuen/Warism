// Critic run 74 (new): R122's `World.massTold` over a save. Plain 1938 SEED stepped until a massing is told and still in
// course (massTold not empty), saved; the unbroken game and the save loaded into a new Sim, both stepped D days: the
// hashes, and the MassingSeen rows of each (a row told again after the load would show as one more, and a hash apart).
// Also the save's bytes with `world.massTold` cut out are not made here: an old save is c74_loadold's case.
// Usage: npx tsx critic/scripts/c74_massSave.ts <D> <seed>...
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const D = Number(process.argv[2] ?? 120);
const assets = assets1938(SIZE_1938.w);
const hx = (n: number): string => (n >>> 0).toString(16).padStart(8, '0');
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? String(n);
for (const seed of process.argv.slice(3).map(Number)) {
  const a = new Sim({ scenario: '1938', seed, assets });
  const clear = (x: World): void => { x.out.events.length = 0; x.out.fires.length = 0; };
  let d = 0;
  while (a.world.massTold.size === 0 && d < 400) { a.step(24, clear); d++; }
  const told = [...a.world.massTold].map((n) => `${tag(n)}>${tag(a.world.massing.get(n)?.target ?? 0)}`);
  const bytes = a.save();
  const b = new Sim({ scenario: '1938', seed, assets });
  b.load(bytes);
  const rows = (s: Sim): string[] => {
    const r: string[] = [];
    for (let k = 0; k < D; k++) s.step(24, (x: World) => { const ev = x.out.events; for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MassingSeen) r.push(`d${d + k} ${tag(ev[i + 2]!)}>${tag(ev[i + 3]!)}`); clear(x); });
    return r;
  };
  const ra = rows(a), rb = rows(b);
  process.stdout.write(`seed ${seed}: saved day ${d} with told [${told.join(', ')}] (${bytes.length} bytes); massTold after D days ${b.world.massTold.size}; after ${D} days: unbroken ${hx(a.hash())}, loaded ${hx(b.hash())} ${a.hash() === b.hash() ? 'same' : 'DIFFER'}; rows unbroken ${ra.length}, loaded ${rb.length}; first rows ${ra.slice(0, 3).join(', ')} | ${rb.slice(0, 3).join(', ')}\n`);
}
process.stdout.write('done:\n');
