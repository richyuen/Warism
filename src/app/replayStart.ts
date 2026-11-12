/**
 * A game of the historical replay started from a year (ROADMAP R68b, ADR-983): the world of 1 January of that year,
 * built at deploy (`tools/data/replaySaves.ts`, `data/scenarios/1938h/start/<year>.sav` beside `years.json`), loaded
 * into the new world with the game's own second seed (the track's `after`), and for a free game the track left at
 * once (`leaveTrack`). A year not built, or saved in another state format than this version reads, is refused.
 */
import { sameStateFormat } from '../shared/saveFormat';
import { unpackSave } from '../shared/saveCodec';
import type { SimClient } from './simClient';

/** The years built for this site (`years.json`), or none where it has none (a local game without `npm run saves`). */
export async function replayYears(): Promise<number[]> {
  try {
    const res = await fetch(new URL('data/scenarios/1938h/start/years.json', document.baseURI));
    if (!res.ok) return [];
    const index = (await res.json()) as { format?: number; years?: { year: number }[] };
    return sameStateFormat(index.format) ? (index.years ?? []).map((y) => y.year) : [];
  } catch {
    return [];
  }
}

/**
 * Loads year `year`'s world into `sim` with second seed `after`; `free` leaves the track. 1938's is the new world itself:
 * nothing loaded. Whether a world was loaded; throws when it cannot be.
 */
export async function startFromYear(sim: SimClient, year: number, after: number | undefined, free: boolean): Promise<boolean> {
  const load = year !== 1938;
  if (load) {
    if (!(await replayYears()).includes(year)) throw new Error(`no start built for ${year}`);
    const res = await fetch(new URL(`data/scenarios/1938h/start/${year}.sav`, document.baseURI));
    if (!res.ok) throw new Error(`the start of ${year}: ${res.status}`);
    await sim.load(await unpackSave(new Uint8Array(await res.arrayBuffer())), false, after);
  }
  if (free) sim.command({ kind: 'leaveTrack' }, true);
  return load;
}
