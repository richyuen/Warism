/**
 * ROADMAP R81a (critic run 67's design objection): the capitals a free game from a year of the replay sees taken in its
 * first days, and how far each lies from the taker's own capital. The year's built start
 * (`public/data/scenarios/1938h/start/<year>.sav`, `npm run saves`), the game's second seed set as the page sets it,
 * `leaveTrack`, then `days` days, as `critic/scripts/c66_freeburst.ts`. Year 0: plain 1938 on the seed, the yardstick.
 *
 * Usage: npx tsx tools/diag/farConquests.ts <year|0> <after seed,...> [days = 730] [km = 500]
 * A capital counts once for each taker and loser (a capital that moves and falls again is the same conquest). It is far
 * when the taker's realm (it and its puppets) held no land within `km` of it at the start: the critic's Poland taking
 * Algiers, not a great country's march to its neighbour's capital. Each far one says whether the taker led its side of
 * the war (`own`) or fought in another's (`joined`). One line a seed, then the means a seed and per 100 nations alive at
 * the start. Also the wars declared in the first 30 days (ADR-1015's bar: per nation at most 1.2 × plain 1938's).
 */
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { EventKind } from '../../src/shared/events';
import { unproject } from '../../src/sim/data/projection';
import { greatCircleKm } from '../../src/sim/nav/lanes';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { loadAssets1938 } from '../headless/assets';

const year = Number(process.argv[2] ?? 1975);
const seeds = (process.argv[3] ?? '6161').split(',').map((s) => Number(s) >>> 0);
const days = Number(process.argv[4] ?? 730);
const farKm = Number(process.argv[5] ?? 500);
const plain = year === 0;
const assets = loadAssets1938(SIZE_1938.w);
const start = plain ? null : new Uint8Array(gunzipSync(readFileSync(`public/data/scenarios/1938h/start/${year}.sav`)));
const tags: readonly string[] = plain ? TAGS_1938 : TAGS_1938H;
const tag = (n: number): string => tags[n - 1] ?? `#${n}`;

let allTaken = 0;
let allFar = 0;
let allOwn = 0;
let allLiving = 0;
for (const after of seeds) {
  const sim = plain
    ? new Sim({ scenario: '1938', seed: after, assets })
    : new Sim({ scenario: '1938h', seed: SEED_1938H, assets, options: { after } });
  if (!plain) {
    if (year !== 1938) sim.load(start!);
    sim.world.track!.afterSeed = after;
    sim.command({ kind: 'leaveTrack' });
  }
  const w0 = sim.world;
  const { w, h } = w0.cells;
  const lonLat = (x: number, y: number): [number, number] => unproject(x / w, y / h);
  // Each realm's land at the start, by cell, sampled every few cells (enough for 500 km).
  const nc0 = w0.nations.cols;
  const realm = (n: number): number => (nc0.overlord[n]! !== 0 ? nc0.overlord[n]! : n);
  const owner0 = Uint16Array.from(w0.cells.owner, (o) => (o === 0 ? 0 : realm(o)));
  const living = nc0.living.reduce((a: number, b: number) => a + (b === 1 ? 1 : 0), 0);
  const stepCells = 4;
  const heldNear = (r: number, x: number, y: number): boolean => {
    const [lon, lat] = lonLat(x, y);
    const span = Math.ceil((farKm / 20_000) * w * 1.6 / Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
    for (let cy = Math.max(0, Math.floor(y) - span); cy <= Math.min(h - 1, Math.floor(y) + span); cy += stepCells)
      for (let dx = -span; dx <= span; dx += stepCells) {
        const cx = (((Math.floor(x) + dx) % w) + w) % w;
        if (owner0[cy * w + cx] === r && greatCircleKm([lon, lat], lonLat(cx + 0.5, cy + 0.5)) <= farKm) return true;
      }
    return false;
  };
  const t0 = sim.tick;
  const seen = new Set<number>();
  let taken = 0;
  let own = 0;
  let declared30 = 0;
  const far: string[] = [];
  for (let d = 0; d < days; d++) {
    sim.step(24, (x: World) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.WarDeclared && ev[i]! - t0 < 30 * 24) declared30++;
        if (ev[i + 1] !== EventKind.CapitalCaptured) continue;
        const [loser, taker] = [ev[i + 2]!, ev[i + 3]!];
        const key = taker * 65536 + loser;
        if (seen.has(key)) continue;
        seen.add(key);
        taken++;
        if (heldNear(realm(taker), ev[i + 4]!, ev[i + 5]!)) continue;
        const war = x.wars.list.find((v) => (v.sides[0].includes(taker) && v.sides[1].includes(loser)) || (v.sides[1].includes(taker) && v.sides[0].includes(loser)));
        const led = war !== undefined && (war.sides[0][0] === taker || war.sides[1][0] === taker);
        if (led) own++;
        // Joined: by a pact with its side's leader (its name), a guarantee of one of its side, a puppet's overlord, or none.
        let via = '';
        if (!led && war !== undefined) {
          const side = war.sides[0].includes(taker) ? war.sides[0] : war.sides[1];
          const pact = x.alliances.allied(taker, side[0]!) ? x.alliances.allianceOf(taker)!.nameKey : '';
          const g = x.alliances.guarantees.some((q) => q.guarantor === taker && side.includes(q.target));
          via = pact ? ` via ${pact}` : g ? ' via a guarantee' : x.nations.cols.overlord[taker] === side[0] ? ' as a puppet' : ' via none';
          via += ` on ${war.sides[0] === side ? 'the attackers' : 'the defenders'} of ${tag(side[0]!)} against ${tag((war.sides[0] === side ? war.sides[1] : war.sides[0])[0]!)}, day ${Math.floor((war.startTick - t0) / 24)}`;
        }
        const nc = x.nations.cols;
        const km = greatCircleKm(lonLat(nc.capitalX[taker]!, nc.capitalY[taker]!), lonLat(ev[i + 4]!, ev[i + 5]!));
        far.push(`d${Math.floor((ev[i]! - t0) / 24)} ${tag(taker)} took ${tag(loser)}'s (${led ? 'own' : `joined${via}`}, ${Math.round(km)} km from its capital)`);
      }
      ev.length = 0;
      x.out.fires.length = 0;
    });
  }
  allTaken += taken;
  allFar += far.length;
  allOwn += own;
  allLiving += living;
  console.log(`${plain ? `plain 1938 seed ${after}` : `1938h from ${year} free, after ${after}`}: ${living} nations alive; ${declared30} wars declared in the first 30 days; ${taken} capitals taken in ${days} days (once a pair), ${far.length} far (no land of the taker's realm within ${farKm} km at the start; ${own} in its own war)${far.length ? `: ${far.join('; ')}` : ''}`);
}
const n = seeds.length;
console.log(`mean a seed: ${(allTaken / n).toFixed(1)} taken, ${(allFar / n).toFixed(1)} far (${(allOwn / n).toFixed(1)} own); per 100 nations alive: ${((100 * allTaken) / allLiving).toFixed(1)} taken, ${((100 * allFar) / allLiving).toFixed(1)} far`);
