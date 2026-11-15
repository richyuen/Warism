// R84d (critic run 69, R69-B4): the colours of land neighbours in the replay. The pairs of nations that share a land
// border on the 1938 start, on each of the timeline's maps (laid over the start, as historyMatch1938h reads them) and
// on the world at the track's end (stepped from a save, the critic's way), each with its ΔE (CIE76) by the nations'
// colours in the data; and each nation the timeline gives birth to against the nations it is born from. Prints the
// pairs under the bar; `--json <file>` writes every pair, for a recolouring.
// Usage: npx tsx tools/diag/neighbourColours.ts [save.sav(.gz) | -] [bar = 30] [--json out.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import type { Admin1Meta } from '../../src/shared/admin1';
import { deltaE, parseHex } from '../../src/shared/color';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { NATIONS_1938H, SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { referenceOwners } from './historyMatch';
import { neighbourPairs } from '../../tests/helpers/neighbours';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const jsonOut = jsonAt >= 0 ? args[jsonAt + 1] : undefined;
const rest = args.filter((_, i) => jsonAt < 0 || (i !== jsonAt && i !== jsonAt + 1));
const save = rest[0] && rest[0] !== '-' ? rest[0] : undefined;
const bar = Number(rest[1] ?? 30);

const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const dE = (a: number, b: number): number => deltaE(parseHex(NATIONS_1938H[a - 1]!.color), parseHex(NATIONS_1938H[b - 1]!.color));

const assets = assets1938(SIZE_1938.w);
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets });
const { province, terrain, w, h } = sim.world.cells;
const start = sim.world.cells.owner.slice();
const meta = JSON.parse(new TextDecoder().decode(assets.admin1Meta)) as Admin1Meta[];
const maps = TIMELINE_1938H.maps ?? [];
const sets: { at: string; pairs: [number, number][] }[] = [{ at: '1938-01-01', pairs: neighbourPairs(start, w, h) }];
maps.forEach((m, k) => sets.push({ at: `map ${m.date}`, pairs: neighbourPairs(referenceOwners(start, province, terrain, meta, maps, k, TAGS_1938H, w, h), w, h) }));
if (save) {
  const raw = readFileSync(save);
  sim.load(new Uint8Array(save.endsWith('.sav') || raw[0] === 0x1f ? gunzipSync(raw) : raw));
  const quiet = (x: World): void => {
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  const end = sim.world.track!.endTick;
  if (sim.tick < end) sim.step(end - sim.tick, quiet);
  sets.push({ at: `world at the end (${save})`, pairs: neighbourPairs(sim.world.cells.owner, w, h) });
}
// A nation born of others against each of them (R80d's "colours distinct" from its parents).
const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const parents: [number, number][] = [];
for (const e of TIMELINE_1938H.events) if (e.kind === 'born') for (const f of e.from) if (id(f) !== id(e.nation)) parents.push([Math.min(id(f), id(e.nation)), Math.max(id(f), id(e.nation))]);
sets.push({ at: 'born from', pairs: [...new Map(parents.map((p) => [p[0] * 65536 + p[1], p])).values()] });

for (const s of sets) {
  const close = s.pairs.map(([a, b]) => ({ a, b, d: dE(a, b) })).filter((p) => p.d < bar).sort((x, y) => x.d - y.d);
  console.log(`${s.at}: ${s.pairs.length} pairs, ${close.length} under ΔE ${bar}${close.length ? `: ${close.map((p) => `${tag(p.a)}-${tag(p.b)} ${p.d.toFixed(1)}`).join(', ')}` : ''}`);
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(sets.map((s) => ({ at: s.at, pairs: s.pairs.map(([a, b]) => [tag(a), tag(b)]) })), null, 1));
console.log('done:');
