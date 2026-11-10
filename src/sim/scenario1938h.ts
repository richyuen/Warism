/**
 * The historical track's scenario (ROADMAP R62a, ADR-919, SPEC §7.7): the 1938 world from 1938's own files, with the
 * nations history made after it appended to its table (`data/scenarios/1938h/nations.json`), dormant until their date.
 * Every id of plain 1938 holds, so its state, its pin and its tables are untouched by this scenario's existence.
 */
import nations1938h from '../../data/scenarios/1938h/nations.json' with { type: 'json' };
import scenario1938h from '../../data/scenarios/1938h/scenario.json' with { type: 'json' };
import timeline1938h from '../../data/scenarios/1938h/timeline.json' with { type: 'json' };
import type { NationDef, TimelineFile } from './data/schemas';
import { NATIONS_1938, TEMPLATES_1938 } from './scenario1938';
import { traitMask } from '../shared/traits';
import { staticCe } from './systems/efficiency';
import { Track } from './track';
import type { World } from './world';

/** The nations it adds after 1938's, in their file's order: ids `NATIONS_1938.length + 1` on. */
export const ADDED_1938H = nations1938h.nations as unknown as NationDef[];

/** Its whole nation table, by id − 1: 1938's, then its own. */
export const NATIONS_1938H: readonly NationDef[] = [...NATIONS_1938, ...ADDED_1938H];

/** The tags of its table, by id − 1. */
export const TAGS_1938H: readonly string[] = NATIONS_1938H.map((n) => n.tag);

/** Its seed, the same every game (a replay): not offered on its form. */
export const SEED_1938H: number = scenario1938h.seed;

/** Its timeline (ROADMAP R62b): our own summary of public history, filled by period from R62f. */
export const TIMELINE_1938H = timeline1938h as unknown as TimelineFile;

/** "#rrggbb" as the nation table's packed colour. */
function colorOf(hex: string): number {
  return Number.parseInt(hex.slice(1), 16);
}

/**
 * Appends the scenario's own nations to a 1938 world, dead and with no core, land, gold or revival left: nothing in
 * the rules brings one back or founds it before the track gives it its land (R62d). Ids follow 1938's.
 */
export function addDormantNations1938h(world: World): void {
  const nt = world.nations;
  nt.reserve(ADDED_1938H.length);
  ADDED_1938H.forEach((def, i) => {
    const id = nt.create();
    if (id !== NATIONS_1938.length + i + 1) throw new Error(`1938h: nation ${def.tag} took id ${id}, not ${NATIONS_1938.length + i + 1}`);
    // The columns after the create: a growth moves the table to new arrays.
    const n = nt.cols;
    n.color[id] = colorOf(def.color);
    n.living[id] = 0;
    n.cells[id] = 0;
    n.incomeBonus[id] = def.incomeBonus;
    n.incomeMult[id] = 1;
    n.manpowerMult[id] = 1;
    n.traits[id] = traitMask(def.traits);
    n.fightToDeath[id] = def.fightToDeath ? 1 : 0;
    n.ceStatic[id] = staticCe(def.aggression);
    n.aggression[id] = def.aggression;
    n.efficiency[id] = 1;
    n.revivalsLeft[id] = 0;
  });
  // Named by its table, as 1938's are (a rename to '' restores the name).
  if (world.rules) world.rules = { ...world.rules, namedNations: NATIONS_1938H.length };
}

/**
 * The track of a 1938h world (ROADMAP R62b): its timeline (`file`, the scenario's unless a test gives one), its own
 * nations unborn.
 */
export function startTrack1938h(world: World, file: TimelineFile = TIMELINE_1938H, after = 0): void {
  const t = new Track(file, TAGS_1938H, scenario1938h.startDate);
  t.afterSeed = after >>> 0;
  for (let i = 0; i < ADDED_1938H.length; i++) t.unborn.add(NATIONS_1938.length + i + 1);
  t.capitals = NATIONS_1938H.map((n) => n.capital.lonLat as [number, number]);
  t.revivals = scenario1938h.settings.revival.maxPerNation;
  t.templates = new Map(TEMPLATES_1938.map((x, i) => [x.id, i]));
  world.track = t;
}
