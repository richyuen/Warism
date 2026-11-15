/**
 * A game of the historical replay started from a year (ROADMAP R68b, ADR-983): the world of 1 January of that year,
 * built at deploy (`tools/data/replaySaves.ts`, `data/scenarios/1938h/start/<year>.sav` beside `years.json`), loaded
 * into the new world with the game's own second seed (the track's `after`), and for a free game the track left at
 * once (`leaveTrack`). A year not built, saved in another state format than this version reads, or not the world its
 * index says (its hash), is refused.
 */
import type { GameOptions } from '../shared/gameOptions';
import { sameStateFormat } from '../shared/saveFormat';
import { unpackSave } from '../shared/saveCodec';
import type { SimClient } from './simClient';

interface Built {
  year: number;
  hash: number;
  /** Its living nations (R74b; none in an index built before it). */
  nations?: number;
  /** Its great powers' tags, strongest first (R75b; none in an index built before it). */
  powers?: string[];
  /** Its wars the timeline holds past its end, as two leaders' tags (R86d; none in an index built before it). */
  whitePeace?: string[][];
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

/** A built year as the title's card reads it: its living nations (R74b) and great powers (R75b) where the index has them. */
export interface ReplayYear {
  year: number;
  nations?: number;
  powers?: string[];
  whitePeace?: string[][];
}

/** The years built for this site, with what the index has of each for the title's card (R74b, R75b). */
export async function replayYears(): Promise<ReplayYear[]> {
  return (await built()).map((y) => ({ year: y.year, ...(y.nations === undefined ? {} : { nations: y.nations }), ...(Array.isArray(y.powers) ? { powers: y.powers.filter((p) => typeof p === 'string') } : {}), ...(Array.isArray(y.whitePeace) ? { whitePeace: y.whitePeace.filter((p) => Array.isArray(p) && p.length === 2 && p.every((x) => typeof x === 'string')) } : {}) }));
}

/** The map of a year's start, built beside it (`tools/data/replaySaves.ts`, R74b). */
export function yearPreviewUrl(year: number): string {
  return new URL(`data/scenarios/1938h/start/${year}.png`, document.baseURI).href;
}

/**
 * Loads year `year`'s world into `sim` with second seed `after`; `free` leaves the track, with the new-game `options`
 * applied to the world as it does (ROADMAP R83b). 1938's is the new world itself: nothing loaded. Whether a world was
 * loaded; throws when it cannot be.
 */
/** Whether `o` asks for anything of the world (R83b): the second seed alone, or nothing, leaves the start as built. */
export function hasOptions(o: GameOptions): boolean {
  return Object.entries(o).some(([k, v]) => k !== 'after' && k !== 'size' && k !== 'nations' && v !== undefined && v !== 'scenario' && v !== 'off');
}

export async function startFromYear(sim: SimClient, year: number, after: number | undefined, free: boolean, options: GameOptions = {}): Promise<boolean> {
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
  if (free) sim.command(hasOptions(options) ? { kind: 'leaveTrack', options } : { kind: 'leaveTrack' }, true);
  return load;
}
