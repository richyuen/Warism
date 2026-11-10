/**
 * ROADMAP R62f (SPEC §7.7, ADR-928): how the historical track's land matches history. The timeline's `maps` (the land
 * as history had it on a date, drawn on their own from admin codes and a few rings) are laid over the start's owners;
 * the world on each map's day at noon is set against them. Three columns: the share of all land owned as on the map;
 * of the land the map changed since the start, the share the world has so (did the timeline move it right); and the
 * land the world changed that the map did not, as a share of all land (did anything else move it).
 *
 * R62g0: the same three columns for control, where a map says who held what (`occupied`): the reference's holders are
 * its owners but where `occupied` puts another, set against the start's holders.
 *
 * Usage: `npx tsx tools/diag/historyMatch.ts [until YYYY-MM-DD]`; one line a map and a line of what differs most, the
 * events passed over, then `done:`. About two minutes a simulated year.
 */
import { pathToFileURL } from 'node:url';
import type { Admin1Meta } from '../../src/shared/admin1';
import { dayOfIso } from '../../src/shared/calendar';
import { EventKind } from '../../src/shared/events';
import { Terrain } from '../../src/shared/terrain';
import { forEachCellInRing } from '../../src/sim/data/ownership';
import type { TimelineFile } from '../../src/sim/data/schemas';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../headless/assets';

type HistoryMap = NonNullable<TimelineFile['maps']>[number];

/** The owners of map `k` and those before it, laid over `start` (land cells only). */
export function referenceOwners(start: Uint16Array, province: Uint16Array, terrain: Uint8Array, meta: readonly Admin1Meta[], maps: readonly HistoryMap[], k: number, tags: readonly string[], w: number, h: number): Uint16Array {
  const id = (t: string): number => tags.indexOf(t) + 1;
  const out = start.slice();
  const land = (c: number): boolean => terrain[c]! >= Terrain.Plains;
  for (let m = 0; m <= k; m++) {
    const map = maps[m]!;
    const byCountry = new Map(Object.entries(map.byCountry ?? {}).map(([a, t]) => [a, id(t)]));
    const byProvince = new Map(Object.entries(map.byProvince ?? {}).map(([a, t]) => [a, id(t)]));
    for (let c = 0; c < out.length; c++) {
      const p = province[c]!;
      if (p === 0 || !land(c)) continue;
      const pm = meta[p - 1]!;
      const to = byProvince.get(pm.adm1) ?? byCountry.get(pm.adm0);
      if (to !== undefined) out[c] = to;
    }
    for (const r of map.regions ?? []) {
      const from = new Set(r.onlyFrom.map(id));
      const to = id(r.owner);
      forEachCellInRing(r.ring, w, h, (c) => {
        if (land(c) && from.has(out[c]!)) out[c] = to;
      });
    }
  }
  return out;
}

/** The holders of map `k`: its owners (`ref`), but where its `occupied` puts another. */
export function referenceHolders(ref: Uint16Array, province: Uint16Array, terrain: Uint8Array, meta: readonly Admin1Meta[], map: HistoryMap, tags: readonly string[], w: number, h: number): Uint16Array {
  const id = (t: string): number => tags.indexOf(t) + 1;
  const out = ref.slice();
  const land = (c: number): boolean => terrain[c]! >= Terrain.Plains;
  for (const o of map.occupied ?? []) {
    const by = id(o.by);
    const of = new Set(o.of.map(id));
    const countries = new Set(o.countries ?? []);
    const provinces = new Set(o.provinces ?? []);
    if (countries.size + provinces.size > 0) {
      for (let c = 0; c < out.length; c++) {
        const p = province[c]!;
        if (p === 0 || !land(c) || !of.has(ref[c]!)) continue;
        const pm = meta[p - 1]!;
        if (provinces.has(pm.adm1) || countries.has(pm.adm0)) out[c] = by;
      }
    }
    for (const r of o.rings ?? []) {
      forEachCellInRing(r, w, h, (c) => {
        if (land(c) && of.has(ref[c]!)) out[c] = by;
      });
    }
  }
  return out;
}

export interface MatchColumns {
  /** Land cells. */
  land: number;
  /** Of all land, the share owned as on the map. */
  whole: number;
  /** Land the map changed since the start, and of it the share the world owns so. */
  moved: number;
  movedRight: number;
  /** Land the world changed since the start that the map did not, as a share of all land. */
  strayShare: number;
  /** What differs most: [world's owner, map's owner, cells], the largest first. */
  worst: [number, number, number][];
}

export function matchColumns(world: Uint16Array, ref: Uint16Array, start: Uint16Array, terrain: Uint8Array): MatchColumns {
  let land = 0;
  let same = 0;
  let moved = 0;
  let movedRight = 0;
  let stray = 0;
  const diff = new Map<number, number>();
  for (let c = 0; c < world.length; c++) {
    if (terrain[c]! < Terrain.Plains || start[c] === 0) continue;
    land++;
    if (world[c] === ref[c]) same++;
    else diff.set(world[c]! * 65536 + ref[c]!, (diff.get(world[c]! * 65536 + ref[c]!) ?? 0) + 1);
    if (ref[c] !== start[c]) {
      moved++;
      if (world[c] === ref[c]) movedRight++;
    } else if (world[c] !== start[c]) stray++;
  }
  const worst = [...diff].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 6).map(([k, n]) => [Math.floor(k / 65536), k % 65536, n] as [number, number, number]);
  return { land, whole: same / land, moved, movedRight: moved > 0 ? movedRight / moved : 1, strayShare: stray / land, worst };
}

/** Runs 1938h (its own seed) through each map's day at noon, then to `until` (a date); the columns of each, and the events passed over. */
export function runMatch(
  timeline: TimelineFile = TIMELINE_1938H,
  log: (s: string) => void = () => {},
  until?: string,
  daily?: (w: Sim['world'], date: string) => void,
): { maps: { date: string; cols: MatchColumns; control?: MatchColumns }[]; skipped: number[]; nukes: number[][]; sim: Sim } {
  const assets = loadAssets1938(SIZE_1938.w);
  const meta = JSON.parse(new TextDecoder().decode(assets.admin1Meta)) as Admin1Meta[];
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets }, timeline);
  const w = sim.world;
  const start = w.cells.owner.slice();
  const startHeld = w.cells.controller.slice();
  const day0 = dayOfIso('1938-01-01');
  const out: { date: string; cols: MatchColumns; control?: MatchColumns }[] = [];
  const skipped: number[] = [];
  // Each warhead that burst (R62h3): [tick, nation, yield, x, y].
  const nukes: number[][] = [];
  const to = (tick: number): void => {
    while (sim.tick < tick) {
      if (daily && sim.tick % 24 === 0) daily(sim.world, new Date((day0 + sim.tick / 24) * 864e5).toISOString().slice(0, 10));
      sim.step(1, (x) => {
        const ev = x.out.events;
        for (let i = 0; i < ev.length; i += 6) {
          if (ev[i + 1] === EventKind.TrackSkipped) skipped.push(ev[i + 3]! - 1);
          if (ev[i + 1] === EventKind.NukeDetonated) nukes.push([ev[i]!, ev[i + 2]!, ev[i + 3]!, ev[i + 4]!, ev[i + 5]!]);
        }
        x.out.events.length = 0;
        x.out.fires.length = 0;
      });
    }
  };
  (timeline.maps ?? []).forEach((m, k) => {
    to((dayOfIso(m.date) - day0) * 24 + 12);
    const ref = referenceOwners(start, w.cells.province, w.cells.terrain, meta, timeline.maps!, k, TAGS_1938H, w.cells.w, w.cells.h);
    const cols = matchColumns(w.cells.owner, ref, start, w.cells.terrain);
    const tag = (n: number): string => TAGS_1938H[n - 1] ?? (n === 0 ? '-' : String(n));
    const say = (what: string, c: MatchColumns): void => {
      log(`${m.date} ${what}: whole ${(100 * c.whole).toFixed(2)} %, moved ${c.moved} cells, ${(100 * c.movedRight).toFixed(1)} % right; stray ${(100 * c.strayShare).toFixed(2)} % of land`);
      log(`  differs: ${c.worst.map(([a, b, n]) => `${tag(a)} for ${tag(b)} ${n}`).join(', ')}`);
    };
    say('owners', cols);
    let control: MatchColumns | undefined;
    if (m.occupied) {
      const held = referenceHolders(ref, w.cells.province, w.cells.terrain, meta, m, TAGS_1938H, w.cells.w, w.cells.h);
      control = matchColumns(w.cells.controller, held, startHeld, w.cells.terrain);
      say('control', control);
    }
    out.push(control ? { date: m.date, cols, control } : { date: m.date, cols });
  });
  if (until !== undefined) to((dayOfIso(until) - day0) * 24);
  log(`events passed over: ${skipped.length === 0 ? 'none' : skipped.map((i) => `${i + 1} (${timeline.events[i]!.date} ${timeline.events[i]!.kind})`).join(', ')}`);
  return { maps: out, skipped, nukes, sim };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runMatch(TIMELINE_1938H, (s) => process.stdout.write(`${s}\n`), process.argv[2]);
  process.stdout.write('done:\n');
}
