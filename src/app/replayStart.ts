/**
 * A game of the historical replay started from a year (ROADMAP R68b, ADR-983): the world of 1 January of that year,
 * built at deploy (`tools/data/replaySaves.ts`, `data/scenarios/1938h/start/<year>.sav` beside `years.json`), loaded
 * into the new world with the game's own second seed (the track's `after`), and for a free game the track left at
 * once (`leaveTrack`). A year not built, saved in another state format than this version reads, or not the world its
 * index says (its hash), is refused.
 */
import { sameStateFormat } from '../shared/saveFormat';
import { unpackSave } from '../shared/saveCodec';
import type { SimClient } from './simClient';

interface Built {
  year: number;
  hash: number;
}

/** The starts built for this site (`years.json`), or none where it has none (a local game without `npm run saves`). */
async function built(): Promise<Built[]> {
  try {
    const res = await fetch(new URL('data/scenarios/1938h/start/years.json', document.baseURI));
    if (!res.ok) return [];
    const index = (await res.json()) as { format?: number; years?: Built[] };
    return sameStateFormat(index.format) ? (index.years ?? []) : [];
  } catch {
    return [];
  }
}

/** The years built for this site. */
export async function replayYears(): Promise<number[]> {
  return (await built()).map((y) => y.year);
}

/**
 * Loads year `year`'s world into `sim` with second seed `after`; `free` leaves the track. 1938's is the new world itself:
 * nothing loaded. Whether a world was loaded; throws when it cannot be.
 */
export async function startFromYear(sim: SimClient, year: number, after: number | undefined, free: boolean): Promise<boolean> {
  const load = year !== 1938;
  if (load) {
    const entry = (await built()).find((y) => y.year === year);
    if (!entry) throw new Error(`no start built for ${year}`);
    const res = await fetch(new URL(`data/scenarios/1938h/start/${year}.sav`, document.baseURI));
    if (!res.ok) throw new Error(`the start of ${year}: ${res.status}`);
    // The world as built: its hash before the game's second seed is set (the hash holds it).
    const { built: hash } = await sim.load(await unpackSave(new Uint8Array(await res.arrayBuffer())), false, after ?? 0);
    if (hash !== entry.hash) throw new Error(`the start of ${year} is not the world built (hash ${hash}, built ${entry.hash})`);
  }
  if (free) sim.command({ kind: 'leaveTrack' }, true);
  return load;
}
