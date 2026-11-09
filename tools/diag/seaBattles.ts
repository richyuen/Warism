/**
 * ROADMAP R46: the sea battles of one run, each with the camera to look at it (critic run 50's sea-balls probe looked
 * at seed 20885 where a battle of seed 7019 had been, and found no ship there).
 *
 * Usage: npx tsx tools/diag/seaBattles.ts <seed> [scenario|random] [--years N] [--world random] [--out file.json]
 *
 * Each battle (`world.seaBattles`, PLAN 4.3c), from its first hour to its `SeaBattle` row: its first and last tick
 * (and day), where it began (cell, sea zone and its sea's name), each side's first nation, its fleets with the ships
 * each came in with, and the ships each side lost. The camera to see it at its first hour: (cx, cy) the middle of its
 * fleets then (cells, as `view.controller` takes them), and a scale (m/px) that holds them all with room, 40 to 400
 * m/px. A battle begun and over in one hour (`oneHour`) is never in `world.seaBattles` at an hour's end: its fleets
 * are those of its sides' nations (or at war with them) within 16 cells of its place then. Each carrier sinking out
 * of a battle (`CarrierSunk`): its tick, place and ships. One line a battle on
 * stderr; the JSON to `--out` (default `.cache/seaBattles_<seed>.json`); then `done:`.
 */
import { writeFileSync } from 'node:fs';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { seaSide } from '../../src/shared/history';
import { kmPerCell } from '../../src/sim/data/projection';
import { seaOf, type SeaBattle, type World } from '../../src/sim/world';
import { TAGS_1938 } from '../../src/sim/scenario1938';
import { loadAssets1938 } from '../headless/assets';
import { SIZE_1938 } from '../../src/sim/scenario1938';

const argv = process.argv.slice(2);
const pos: string[] = [];
let years = 5;
let world: '1938' | 'random' = '1938';
let out: string | undefined;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--years') years = Number(argv[++i]);
  else if (argv[i] === '--world') world = argv[++i] as '1938' | 'random';
  else if (argv[i] === '--out') out = argv[++i];
  else pos.push(argv[i]!);
}
const seed = Number(pos[0] ?? 7019);
const diplomacy = (pos[1] ?? 'scenario') as 'scenario' | 'random';
out ??= `.cache/seaBattles_${seed}${world === 'random' ? 'w' : ''}${diplomacy === 'random' ? 'r' : ''}.json`;

const sim = new Sim({
  scenario: world,
  seed,
  assets: loadAssets1938(SIZE_1938.w),
  options: { diplomacy, ...(world === 'random' ? { nations: 60 } : {}) },
});
const tag = (n: number): string => (world === '1938' ? (TAGS_1938[n - 1] ?? `#${n}`) : `#${n}`);
const KM = kmPerCell(sim.world.cells.w);

interface Fleet {
  id: number;
  nation: string;
  /** Its side: `a`'s (its nation, or one at war with `b` and not `a`) or `b`'s (ROADMAP R56e: `seaBattlesLook` judges by side). */
  side: 'a' | 'b';
  ships: number;
  x: number;
  y: number;
}
interface Battle {
  start: number;
  end: number;
  day: number;
  at: [number, number];
  zone: number;
  sea: string;
  a: string;
  b: string;
  lostA: number;
  lostB: number;
  /** Begun and over in one hour: its fleets are those about its place as the hour ends (`ships` 0: not known). */
  oneHour: boolean;
  fleets: Fleet[];
  camera: { cx: number; cy: number; mpp: number };
}
interface Track {
  start: number;
  fleets: Map<number, Fleet>;
  camera: { cx: number; cy: number; mpp: number };
}

/** The middle of the fleets and a scale that holds them in about 700 px, 40 to 400 m/px. */
function camera(fleets: Fleet[]): { cx: number; cy: number; mpp: number } {
  const xs = fleets.map((f) => f.x);
  const ys = fleets.map((f) => f.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const spanKm = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * KM;
  const mpp = Math.round(Math.min(400, Math.max(40, (spanKm * 1000) / 700)));
  return { cx: Math.round(cx * 100) / 100, cy: Math.round(cy * 100) / 100, mpp };
}

/**
 * Cells about a one-hour battle's place in which its fleets are looked for, as its hour ends (about 260 km): a
 * carrier's wings fight from far (7019 t21185: Japan's carriers sank 6 Dutch ships from 14.5 cells).
 */
const NEAR_CELLS = 16;

/**
 * The fleets about (x, y) as an hour ends: a battle begun and over in one hour (its record made and dropped in the
 * tick) is never seen in `world.seaBattles`; its fleets are those of its sides' first nations `a` and `b`, or of a
 * nation at war with either, there (a side whose ships were all sunk leaves the other alone).
 */
function fleetsNear(w: World, x: number, y: number, a: number, b: number): Fleet[] {
  const c = w.formations.cols;
  const side = (n: number): boolean => n === a || n === b || w.wars.atWar(n, a) || w.wars.atWar(n, b);
  return w.formations
    .ids()
    .filter((id) => w.isFleet(id) && Math.hypot(c.x[id]! - x, c.y[id]! - y) <= NEAR_CELLS && side(c.nation[id]!))
    .map((id) => ({ id, nation: tag(c.nation[id]!), side: sideOf(w, c.nation[id]!, a, b), ships: 0, x: c.x[id]!, y: c.y[id]! }));
}

/** The side of a battle between `a` and `b` a fleet of nation `n` fights on. */
function sideOf(w: World, n: number, a: number, b: number): 'a' | 'b' {
  return n === a || (n !== b && w.wars.atWar(n, b) && !w.wars.atWar(n, a)) ? 'a' : 'b';
}

function fleetsOf(w: World, rec: SeaBattle): Fleet[] {
  const c = w.formations.cols;
  return rec.fleets.flatMap((id, k) => (w.formations.has(id) ? [{ id, nation: tag(c.nation[id]!), side: sideOf(w, c.nation[id]!, rec.a, rec.b), ships: rec.ships[k] ?? 0, x: c.x[id]!, y: c.y[id]! }] : []));
}

const tracks = new Map<SeaBattle, Track>();
const battles: Battle[] = [];
const sinkings: { tick: number; day: number; nation: string; ships: number; at: [number, number] }[] = [];
const hours = Math.round(years * 365 * 24);
const t0 = performance.now();
for (let h = 0; h < hours; h++) {
  sim.step(1, (w) => {
    for (const rec of w.seaBattles) {
      let tr = tracks.get(rec);
      const now = fleetsOf(w, rec);
      if (!tr) tracks.set(rec, (tr = { start: w.tick, fleets: new Map(), camera: camera(now.length > 0 ? now : [{ id: 0, nation: '', side: 'a' as const, ships: 0, x: rec.x, y: rec.y }]) }));
      for (const f of now) if (!tr.fleets.has(f.id)) tr.fleets.set(f.id, f);
    }
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const kind = ev[i + 1]!;
      const x = ev[i + 4]!;
      const y = ev[i + 5]!;
      if (kind === EventKind.SeaBattle) {
        // The record that ended: the one tracked at this place that is no longer in the world.
        const gone = [...tracks.keys()].filter((r) => !w.seaBattles.includes(r));
        const rec = gone.find((r) => r.x === x && r.y === y) ?? gone[0];
        const tr = rec ? tracks.get(rec)! : undefined;
        if (rec) tracks.delete(rec);
        const near = tr ? [] : fleetsNear(w, x, y, seaSide(ev[i + 2]!).nation, seaSide(ev[i + 3]!).nation);
        const A = seaSide(ev[i + 2]!);
        const B = seaSide(ev[i + 3]!);
        const sea = seaOf(w);
        const zone = sea.zoneOf[Math.floor(y) * w.cells.w + Math.floor(x)] ?? 0;
        const b: Battle = {
          start: tr?.start ?? w.tick,
          end: w.tick,
          day: Math.floor((tr?.start ?? w.tick) / 24),
          at: [Math.round(x * 10) / 10, Math.round(y * 10) / 10],
          zone,
          sea: zone > 0 ? (w.seaSeeds[sea.seed[zone]!]?.name ?? '') : '',
          a: tag(A.nation),
          b: tag(B.nation),
          lostA: A.ships,
          lostB: B.ships,
          oneHour: !tr,
          fleets: (tr ? [...tr.fleets.values()] : near).map((f) => ({ ...f, x: Math.round(f.x * 10) / 10, y: Math.round(f.y * 10) / 10 })),
          camera: tr?.camera ?? camera([...near, { id: 0, nation: '', side: 'a' as const, ships: 0, x, y }]),
        };
        battles.push(b);
        process.stderr.write(
          `t${b.start}-${b.end} day ${b.day} ${b.a} v ${b.b} at ${b.at} (${b.sea || `zone ${zone}`}): ships ${b.fleets.map((f) => `${f.nation}:${f.ships}`).join(' ')}, lost ${b.lostA}/${b.lostB}; camera ${b.camera.cx},${b.camera.cy} ${b.camera.mpp} m/px\n`,
        );
      } else if (kind === EventKind.CarrierSunk && w.seaBattles.length === 0) {
        sinkings.push({ tick: w.tick, day: Math.floor(w.tick / 24), nation: tag(ev[i + 2]!), ships: ev[i + 3]!, at: [Math.round(x * 10) / 10, Math.round(y * 10) / 10] });
      }
    }
    // Records merged into another this hour leave no row: let them go.
    for (const r of [...tracks.keys()]) if (!w.seaBattles.includes(r)) tracks.delete(r);
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
}
const report = { seed, diplomacy, world, years, battles, sinkings, wallS: Math.round((performance.now() - t0) / 1000) };
writeFileSync(out, JSON.stringify(report, null, 1));
process.stderr.write(`seed ${seed} ${world} ${diplomacy}, ${years} years: ${battles.length} sea battles, ${sinkings.length} sinkings out of battle; ${out}\n`);
process.stdout.write('done:\n');
