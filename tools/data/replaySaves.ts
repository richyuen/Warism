/**
 * ROADMAP R68a (ADR-983, the user's decisions): the historical replay's yearly starts. 1938h's world (its own seed)
 * on 1 January of each year of the track, from 1938 to the year of its end, written gzipped
 * (`<out>/<year>.sav`, `Sim.save()` as `packSave` writes it) with `<out>/years.json`: the years, the state format,
 * and each save's tick, hash, living nations and great powers (R75b), beside each year's map (`<year>.png`, R74b). Built by the Pages
 * workflow on each push to `main` into the site, never committed; by hand for a local game
 * (`public/data/scenarios/1938h/start/`, gitignored). `npm run saves` runs it from a bundle (`saves.ts`, R72a): about
 * 6-7 minutes.
 *
 * Usage: npm run saves [-- <out dir> [last year]]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { STATE_FORMAT } from '../../src/shared/saveFormat';
import { strengths } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H, TIMELINE_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { encodePng } from './png';
import { PREVIEW_H, PREVIEW_W, previewOfWorld } from './preview';

/** What `years.json` holds. */
export interface ReplayYears {
  format: number;
  seed: number;
  /** Each year's start: its tick and hash, and its living nations (the title's card, R74b). */
  years: { year: number; tick: number; hash: number; nations: number; powers: string[] }[];
}

/** The nations living in a world (the title's "Nations", R74b). */
export function livingNations(w: World): number {
  let n = 0;
  w.nations.forEach((id) => {
    if (w.nations.cols.living[id] === 1) n++;
  });
  return n;
}

/** How many great powers a start's card names (R75b): 1938's seven. */
export const CARD_POWERS = 7;

/**
 * The great powers of a world for its start's card (R75b, as Paradox's bookmarks name a start's nations): the living
 * nations that are no puppet, by their share of the world's strength (`strengths`) plus their share of its income and
 * of its warheads, strongest first, CARD_POWERS of them, each by the tag it bears then (`identities`: Spain, the
 * People's Republic). Of the card alone: the sim's own great powers (`greatPowers`, by strength) are its rules'.
 */
export function cardPowers(w: World): string[] {
  const nc = w.nations.cols;
  const str = strengths(w);
  const live: number[] = [];
  w.nations.forEach((n) => {
    if (nc.living[n] === 1 && nc.overlord[n] === 0) live.push(n);
  });
  let s = 0;
  let inc = 0;
  let heads = 0;
  for (const n of live) {
    s += str[n]!;
    inc += Math.max(0, nc.income[n]!);
  }
  for (const [, v] of w.warheads) heads += v.stock;
  const score = (n: number): number => (s > 0 ? str[n]! / s : 0) + (inc > 0 ? Math.max(0, nc.income[n]!) / inc : 0) + (heads > 0 ? (w.warheads.get(n)?.stock ?? 0) / heads : 0);
  const scored = live.map((n) => ({ n, v: score(n) }));
  scored.sort((a, b) => b.v - a.v || a.n - b.n);
  return scored.slice(0, CARD_POWERS).map(({ n }) => w.identities.get(n) ?? (TAGS_1938H as readonly string[])[n - 1]!);
}

const quiet = (w: World): void => {
  w.out.events.length = 0;
  w.out.fires.length = 0;
};

/** The track's years: 1 January of each from its start to the year of its end (`last` caps it). */
export function replayYears(sim: Sim, last = Infinity): number[] {
  const t = sim.world.track!;
  const first = Number(t.events[0]!.date.slice(0, 4));
  const end = Math.min(last, Number((TIMELINE_1938H.end ?? t.events.at(-1)!.date).slice(0, 4)));
  const out: number[] = [];
  for (let y = Math.max(1938, first); y <= end; y++) out.push(y);
  return out;
}

/** Steps a fresh 1938h world through the years, handing each 1 January's world to `each`. */
export function buildReplaySaves(each: (year: number, sim: Sim) => void, last = Infinity): void {
  const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w) });
  const t = sim.world.track!;
  for (const year of replayYears(sim, last)) {
    const at = t.tickOf(`${year}-01-01`);
    if (at > sim.tick) sim.step(at - sim.tick, quiet);
    each(year, sim);
  }
}

// Run as a script: by `npm run saves` from its bundle (`saves.ts`, `.cache/saves/replaySaves.mjs`), or by tsx.
if (/replaySaves\.(ts|mjs)$/.test(process.argv[1] ?? '')) {
  const out = process.argv[2] ?? 'public/data/scenarios/1938h/start';
  const last = process.argv[3] ? Number(process.argv[3]) : Infinity;
  mkdirSync(out, { recursive: true });
  const index: ReplayYears = { format: STATE_FORMAT, seed: SEED_1938H, years: [] };
  const t0 = Date.now();
  buildReplaySaves((year, sim) => {
    const bytes = gzipSync(sim.save());
    writeFileSync(path.join(out, `${year}.sav`), bytes);
    // The year's map for the title's card (R74b), as the scenarios' previews are drawn.
    writeFileSync(path.join(out, `${year}.png`), encodePng(previewOfWorld(sim.world), PREVIEW_W, PREVIEW_H));
    index.years.push({ year, tick: sim.tick, hash: sim.hash(), nations: livingNations(sim.world), powers: cardPowers(sim.world) });
    process.stdout.write(`${year}: tick ${sim.tick}, ${Math.round(bytes.length / 1024)} KB, ${Math.round((Date.now() - t0) / 1000)} s\n`);
  }, last);
  writeFileSync(path.join(out, 'years.json'), JSON.stringify(index, null, 1) + '\n');
  process.stdout.write(`done: ${index.years.length} years → ${out}\n`);
}
