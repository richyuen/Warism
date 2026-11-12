/**
 * zod schemas for every JSON file under `data/` (PLAN 1.1, SPEC §3).
 *
 * - Objects are strict: an unknown key (usually a typo) is an error, not silently ignored.
 * - `DATA_FILES` maps each `data/` path to its schema. A file that matches no pattern is an error,
 *   so new data cannot skip validation.
 * - `validateDataSet` runs the per-file schemas, then the cross-file checks that a single schema
 *   cannot express: unique ids, references (techReq, prereqs, map, size), the tech graph being
 *   acyclic, and the terrain table being in enum order.
 * - Errors read `<file>: <path>: <message>`, e.g. `units/land.json: types[2].stats.speed_kmh:
 *   Invalid input: expected number, received string`.
 */
import { z } from 'zod';
import type { FlagLayer as FlagLayerT, FlagSpec } from '../../shared/flags';
import { TERRAIN_IDS } from '../../shared/terrain';

// ── shared vocab ─────────────────────────────────────────────────────────────

/** Terrain classes in cell-layer enum order (SPEC §3.2): the array index is the u8 value. */
export { TERRAIN_IDS, type TerrainId } from '../../shared/terrain';

export const LAND_CLASSES = ['inf', 'art', 'at', 'aa', 'armor_l', 'armor_m', 'armor_h', 'mech', 'mot'] as const;
export const SEA_CLASSES = ['dd', 'cl', 'ca', 'bb', 'cv', 'ss', 'tp'] as const;
export const AIR_CLASSES = ['fighter', 'bomber_tac', 'bomber_str', 'cas', 'naval_bomber', 'transport_air', 'nuke_missile'] as const;
export const UNIT_CLASSES = [...LAND_CLASSES, ...SEA_CLASSES, ...AIR_CLASSES] as const;

export const MOBILITIES = ['foot', 'motor', 'tracked', 'ship', 'air'] as const;

/** Nation-level modifiers shared by traits, techs and buildings (fractions: 0.1 = +10%). */
export const MODIFIER_KEYS = [
  'income', 'industry', 'manpower', 'research', 'buildSpeed', 'supply', 'org', 'stability',
  'warExhaustion', 'revoltSuppression', 'landAttack', 'landDefense', 'armorAttack', 'navalAttack',
  'airAttack', 'airDefense', 'fortStrength', 'aaStrength',
] as const;

export const BUILDING_IDS = ['industry', 'fort', 'airbase', 'port', 'navalBase', 'aa'] as const;
export const BUILDING_EFFECT_KEYS = [
  'industryOutput', 'defense', 'airCapacity', 'supplyThroughput', 'shipCapacity', 'shipRepair', 'aaStrength',
] as const;

export const COMBAT_EFFICIENCY_MODES = ['dynamic', 'progressive', 'static', 'locked', 'random'] as const;
export const GOVERNMENTS = ['democracy', 'fascism', 'communism', 'monarchy', 'authoritarian', 'colonial'] as const;
export const TECH_CATEGORIES = ['industry', 'land', 'armor', 'naval', 'air', 'electronics', 'nuclear'] as const;

const id = z.string().regex(/^[a-z][a-z0-9_]*$/, 'ids are lower snake_case');
const key = z.string().regex(/^[a-z][a-zA-Z0-9_]*(\.[a-zA-Z0-9_]+)+$/, 'i18n keys are dotted, e.g. unit.inf');
const color = z.string().regex(/^#[0-9a-f]{6}$/, 'colours are #rrggbb (lower case)');
const nonNeg = z.number().finite().nonnegative();
const mult = z.number().finite().positive().max(10);
const date = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'dates are YYYY-MM-DD');

function partialRecord<K extends readonly [string, ...string[]], V extends z.ZodType>(keys: K, value: V) {
  return z.partialRecord(z.enum(keys), value);
}

// ── terrain (data/terrain.json) ──────────────────────────────────────────────

/** Move cost multiplier per mobility class; null = impassable. */
const moveCost = z.strictObject({ foot: mult.nullable(), motor: mult.nullable(), tracked: mult.nullable() });

export const TerrainDef = z.strictObject({
  id: z.enum(TERRAIN_IDS),
  nameKey: key,
  color,
  moveCost,
  /** Defender multiplier. */
  defense: mult,
  /** Attacker multiplier per unit class (absent = 1). */
  attack: partialRecord(UNIT_CLASSES, mult),
  /** Fraction of strength lost per day out of supply on this terrain. */
  supplyAttrition: z.number().min(0).max(1),
  /** Economic weight of one cell (plains = 1). */
  econWeight: nonNeg.max(10),
});
export const TerrainFile = z.strictObject({ terrain: z.array(TerrainDef) });

// ── combat (data/combat.json) ────────────────────────────────────────────────

const arm = z.array(z.enum(LAND_CLASSES)).min(1);
export const CombatFile = z.strictObject({
  /** PLAN 5.4a: a formation's fire × (1 + `superiority` × (2s − 1)), s its nation's air superiority in its zone. */
  air: z.strictObject({ comment: z.string().optional(), superiority: z.number().min(0).max(1) }),
  /** PLAN 3.4a: a side of a battle with all three arms alive in it fires × `bonus`. */
  combinedArms: z.strictObject({
    /** The unit classes of each arm. */
    arms: z.strictObject({ infantry: arm, artillery: arm, armour: arm }),
    bonus: mult,
  }),
  /** PLAN 3.4b: armour on one of `terrain` whose side has no infantry alive in the battle takes × `taken`. */
  screen: z.strictObject({ terrain: z.array(z.enum(TERRAIN_IDS)).min(1), taken: mult }),
  /** PLAN 3.4c: a unit of one of the classes `shooter` whose enemy has artillery alive in the battle fires × `fire`. */
  gunsOnGuns: z.strictObject({ shooter: arm, fire: mult }),
  /**
   * PLAN 3.4d: armour's fire at a target with no armour on one of `terrain` is × `fire`, unless the
   * target's side has a unit of `gunsOnGuns.shooter` alive in the battle.
   */
  open: z.strictObject({ terrain: z.array(z.enum(TERRAIN_IDS)).min(1), fire: mult }),
  /**
   * PLAN 3.5a: a formation loses all its org to a battle that takes the share `lossToBreak` of
   * its strength. In contact with org under `below` it breaks off for `hours`: to the ground of
   * its side nearest the point `cells` away from its nearest enemy, within `snap` cells of it,
   * or with none there to the ground of its side nearest itself within `reach` cells.
   * One that finds none tries again every `retryHours`.
   */
  retreat: z.strictObject({
    lossToBreak: z.number().positive().max(1),
    below: z.number().positive().max(1),
    hours: z.number().int().positive().max(255),
    cells: z.number().positive(),
    snap: z.number().int().nonnegative(),
    reach: z.number().int().nonnegative(),
    retryHours: z.number().int().positive(),
  }),
});

// ── unit types (data/units/*.json) ───────────────────────────────────────────

export const UnitStats = z.strictObject({
  soft: nonNeg, hard: nonNeg, defense: nonNeg, breakthrough: nonNeg, armor: nonNeg, piercing: nonNeg,
  aa: nonNeg, range_km: nonNeg, speed_kmh: z.number().finite().positive(), org: nonNeg,
  hpPerUnit: z.number().finite().positive(), detection: nonNeg, stealth: nonNeg,
  fuelPerHour: nonNeg, supplyPerHour: nonNeg,
  /** A ship's torpedoes (PLAN 4.3b): their damage an hour and their reach, km; its depth charges' damage at a submarine. 0 when left out. */
  torpedo: nonNeg.optional(), torpedo_km: nonNeg.optional(), asw: nonNeg.optional(),
  /** An aircraft's bomb load, tons (PLAN 5.5a): what a strike drops on industry. 0 when left out. */
  bomb_t: nonNeg.optional(),
});

export const UnitTypeDef = z
  .strictObject({
    id,
    nameKey: key,
    class: z.enum(UNIT_CLASSES),
    domain: z.enum(['land', 'sea', 'air']),
    /** Men / vehicles / ships / planes per element (SPEC §3.6). */
    elementSize: z.number().int().min(1).max(1000),
    mobility: z.enum(MOBILITIES),
    stats: UnitStats,
    cost: z.strictObject({ gold: nonNeg, industry: nonNeg, manpower: nonNeg, days: z.number().int().min(1) }),
    upkeep: z.strictObject({ gold: nonNeg, supply: nonNeg }),
    terrainMods: partialRecord(TERRAIN_IDS, z.strictObject({ atk: mult, def: mult, speed: mult })),
    techReq: id.optional(),
    /** A hero (PLAN 7.184): never built, queued or placed by God; one formation a nation, on the new-game option. */
    hero: z.literal(true).optional(),
  })
  .superRefine((u, ctx) => {
    const domain = (LAND_CLASSES as readonly string[]).includes(u.class) ? 'land' : (SEA_CLASSES as readonly string[]).includes(u.class) ? 'sea' : 'air';
    if (u.domain !== domain) ctx.addIssue({ code: 'custom', path: ['domain'], message: `class ${u.class} is a ${domain} class` });
    const okMobility = domain === 'land' ? ['foot', 'motor', 'tracked'] : domain === 'sea' ? ['ship'] : ['air'];
    if (!okMobility.includes(u.mobility)) {
      ctx.addIssue({ code: 'custom', path: ['mobility'], message: `${domain} units move by ${okMobility.join('|')}` });
    }
  });
export const UnitsFile = z.strictObject({ comment: z.string().optional(), types: z.array(UnitTypeDef).min(1) });

// ── tech (data/tech/*.json) ──────────────────────────────────────────────────

export const TechDef = z.strictObject({
  id,
  nameKey: key,
  category: z.enum(TECH_CATEGORIES),
  /** The year from which it can be researched: a floor, nobody is ahead of it (PLAN 3.1b, ADR-128). */
  year: z.number().int().min(1900).max(2100),
  cost: z.strictObject({ gold: nonNeg, industry: nonNeg, days: z.number().int().min(1) }),
  prereqs: z.array(id),
  modifiers: partialRecord(MODIFIER_KEYS, z.number().finite().min(-1).max(5)),
});
export const TechFile = z.strictObject({ techs: z.array(TechDef).min(1) });

// ── traits (data/traits/*.json) ──────────────────────────────────────────────

export const TraitDef = z.strictObject({
  id,
  nameKey: key,
  descKey: key,
  modifiers: partialRecord(MODIFIER_KEYS, z.number().finite().min(-1).max(5)),
  /** Added to the nation's aggression (0..100) by the AI. */
  aggressionBias: z.number().int().min(-50).max(50),
  /** Traits that cannot be combined with this one (checked both ways). */
  excludes: z.array(id),
});
export const TraitsFile = z.strictObject({ traits: z.array(TraitDef).min(1) });

// ── buildings (data/buildings/*.json) ────────────────────────────────────────

export const BuildingDef = z.strictObject({
  id: z.enum(BUILDING_IDS),
  nameKey: key,
  maxLevel: z.number().int().min(1).max(20),
  /** Per level built. */
  cost: z.strictObject({ gold: nonNeg, industry: nonNeg, days: z.number().int().min(1) }),
  upkeep: z.strictObject({ gold: nonNeg }),
  coastalOnly: z.boolean(),
  /** Effect per level. */
  perLevel: partialRecord(BUILDING_EFFECT_KEYS, z.number().finite().positive()),
});
export const BuildingsFile = z.strictObject({ buildings: z.array(BuildingDef).min(1) });

// ── formation templates (data/templates/*.json) ──────────────────────────────

/** A land formation template (PLAN 1.7): elements of unit types (SPEC §3.6). */
export const TemplateDef = z.strictObject({
  id,
  nameKey: key,
  elements: z.array(z.strictObject({ type: id, count: z.number().int().min(1).max(200) })).min(1),
});
export const TemplatesFile = z.strictObject({ comment: z.string().optional(), templates: z.array(TemplateDef).min(1) });

// ── maps (data/maps/<id>/map.json) ───────────────────────────────────────────

const Projection = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('miller'), latTopDeg: z.number().min(0).max(90), latBottomDeg: z.number().min(-90).max(0) }),
  /** Synthetic flat grid (toy world): square cells, no latitude scaling. */
  z.strictObject({ type: z.literal('flat') }),
]);

export const MapMeta = z
  .strictObject({
    id,
    nameKey: key,
    projection: Projection,
    /** Width of the full map at the equator, km (Earth: 40 075). */
    widthKm: z.number().positive(),
    sizes: z
      .array(z.strictObject({ id: z.string().regex(/^[A-Z]+$/), w: z.number().int().min(16), h: z.number().int().min(8) }))
      .min(1),
    defaultSize: z.string(),
    wrapX: z.boolean(),
    /** Path (relative to the site root) of the asset manifest, for maps with generated assets. */
    assets: z.string().optional(),
  })
  .superRefine((m, ctx) => {
    if (!m.sizes.some((s) => s.id === m.defaultSize)) {
      ctx.addIssue({ code: 'custom', path: ['defaultSize'], message: `'${m.defaultSize}' is not one of sizes[].id` });
    }
    m.sizes.forEach((s, i) => {
      if (s.w !== 2 * s.h) ctx.addIssue({ code: 'custom', path: ['sizes', i], message: `${s.w}×${s.h} is not 2:1 (square cells)` });
    });
  });

// ── straits (data/maps/<id>/straits.json) ────────────────────────────────────

const lonLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

/** AoC-style walkable crossings: water cells on the segment a→b become Terrain.Crossing (PLAN 1.2). */
export const StraitDef = z.strictObject({ id, nameKey: key, a: lonLat, b: lonLat });
export const StraitsFile = z.strictObject({ straits: z.array(StraitDef) });

// ── seas (data/maps/<id>/seas.json) ──────────────────────────────────────────

/** A seed of a sea zone (PLAN 4.1a): `part` is 0 for a sea of one zone, else 1…k. */
export const SeaSeedDef = z.strictObject({ name: z.string().min(1), part: z.number().int().min(0), lonLat });
export const SeasFile = z.strictObject({ comment: z.string().optional(), seas: z.array(SeaSeedDef) });

// ── ice (data/maps/<id>/ice.json) ────────────────────────────────────────────

/** The seas of the map's `seas.json`, by name, that ice closes to a fleet (PLAN 4.2d). */
export const IceFile = z.strictObject({ comment: z.string().optional(), closed: z.array(z.string().min(1)) });

// ── passages (data/maps/<id>/passages.json) ──────────────────────────────────

/** Water a ship passes that the cell grid closes or has as land (PLAN 4.1b): `a` and `b` are the water at each end. */
export const SeaPassageDef = z.strictObject({ id, name: z.string().min(1), a: lonLat, b: lonLat });
export const PassagesFile = z.strictObject({ comment: z.string().optional(), passages: z.array(SeaPassageDef) });

// ── ports (data/scenarios/<id>/ports.json) ───────────────────────────────────

/** Ports and naval bases (PLAN 4.1c, `src/sim/data/ports.ts`): the rule for the cities' ports, and the list by hand. */
const buildingLevel = z.number().int().min(1).max(5);
export const PortDef = z.strictObject({
  name: z.string().min(1),
  lonLat,
  water: lonLat.optional(),
  nation: z.string().regex(/^[A-Z]{3}$/).optional(),
  port: buildingLevel.optional(),
  navalBase: z.number().int().min(0).max(5),
});
export const PortsFile = z.strictObject({
  comment: z.string().optional(),
  minCitySize: z.number().int().min(1).max(5),
  reachCells: z.number().int().min(1).max(4),
  levelBySize: z.array(buildingLevel).min(1).max(5),
  ports: z.array(PortDef),
});

// ── airbases (data/scenarios/<id>/airbases.json) ─────────────────────────────

/** Airbases (PLAN 5.1c, `src/sim/data/airbases.ts`): the rule for the cities' bases, and the list by hand. */
export const AirbaseDef = z.strictObject({
  name: z.string().min(1),
  lonLat,
  nation: z.string().regex(/^[A-Z]{3}$/).optional(),
  level: buildingLevel,
});
export const AirbasesFile = z.strictObject({
  comment: z.string().optional(),
  capitalLevel: buildingLevel,
  minCitySize: z.number().int().min(1).max(5),
  sizeLevel: buildingLevel,
  bases: z.array(AirbaseDef),
});

// ── air forces (data/scenarios/<id>/air.json) ────────────────────────────────

/** The air forces of the start (PLAN 5.1d, `src/sim/data/wings.ts`): each nation's wings by template. */
export const AirFile = z.strictObject({
  comment: z.string().optional(),
  groups: z.array(z.strictObject({ nation: z.string().regex(/^[A-Z]{3}$/), template: id, count: z.number().int().min(1).max(100) })),
});

// ── scenarios (data/scenarios/<id>/scenario.json) ────────────────────────────

export const ScenarioSettings = z.strictObject({
  combatEfficiency: z.enum(COMBAT_EFFICIENCY_MODES),
  winnerTakesAll: z.boolean(),
  loopingMap: z.boolean(),
  /** Revolts take one province, or a restless region of up to 8 and of 1,000,000 km² (PLAN 1.19; PLAN 1.40 tuning; PLAN 3.9). */
  revoltMode: z.enum(['province', 'region']),
  nukesEnabled: z.boolean(),
  aiEnabled: z.boolean(),
  revival: z.strictObject({ maxPerNation: z.number().int().min(0).max(20), cooldownDays: z.number().int().min(0) }),
});

export const ScenarioMeta = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  nameKey: key,
  descKey: key,
  /** A test world: not offered on the title screen, opened by `?scenario=<id>` only (PLAN 1.43). */
  hidden: z.boolean().optional(),
  map: id,
  /** Map size id; absent = the map's default size. */
  size: z.string().optional(),
  startDate: date,
  /**
   * A scenario built from another's files (ROADMAP R62a, ADR-919: the historical track, `1938h`, from 1938's), with
   * only what it adds in its own directory.
   */
  base: z.string().regex(/^[a-z0-9_]+$/).optional(),
  /** A seed of its own, the same every game, not offered on its form (the historical track: a replay). */
  seed: z.number().int().min(0).max(0xffffffff).optional(),
  settings: ScenarioSettings,
});

// ── scenario nations + ownership (data/scenarios/<id>/{nations,ownership}.json) ─

const tag = z.string().regex(/^[A-Z]{3}$/, 'nation tags are three upper-case letters');

/** Scenario nation (PLAN 1.3/1.4, SPEC §3.4). Nation id = index + 1. */
export const NationDef = z.strictObject({
  tag,
  nameKey: key,
  adjectiveKey: key,
  color,
  government: z.enum(GOVERNMENTS),
  traits: z.array(id).max(4),
  /** 0 = never starts wars … 100 = attacks at any chance (AI, SPEC §7). */
  aggression: z.number().int().min(0).max(100),
  /** AoC-style income bonus, percent. */
  incomeBonus: z.number().int().min(-100).max(100),
  fightToDeath: z.boolean(),
  /** Seat of government; PLAN 1.5 binds it to the nearest city. */
  capital: z.strictObject({ name: z.string().min(1), lonLat }),
  /** Puppet relation (SPEC §3.5). */
  overlord: z.strictObject({ tag, autonomy: z.number().int().min(0).max(100) }).optional(),
  /** Cores beyond the territory the nation owns at start (admin-0 / admin-1 codes). */
  extraCores: z
    .strictObject({ countries: z.array(z.string().regex(/^[A-Z0-9]{3}$/)).optional(), provinces: z.array(z.string()).optional() })
    .optional(),
  /** false = a dead nation that exists only through its cores (revivable, PLAN 1.20). */
  alive: z.boolean().optional(),
  /** Techs it knows at the start beyond those every nation knows and those of its order of battle (PLAN 3.1a). */
  techs: z.array(id).min(1).optional(),
});
export const NationsFile = z.strictObject({ nations: z.array(NationDef).min(1).max(65535) });

const ring = z.array(lonLat).min(3);

/** Starting diplomacy (PLAN 1.4, SPEC §3.5): one alliance per nation, guarantees, wars in progress. */
export const DiplomacyFile = z.strictObject({
  comment: z.string().optional(),
  alliances: z.array(
    z.strictObject({ id, nameKey: key, leader: tag, members: z.array(tag).min(2), unity: z.number().int().min(0).max(100) }),
  ),
  guarantees: z.array(z.strictObject({ guarantor: tag, target: tag, note: z.string().optional() })),
  wars: z.array(z.strictObject({ id, nameKey: key, attackers: z.array(tag).min(1), defenders: z.array(tag).min(1), startDate: date })),
});

// ── flags (data/flags/presets.json, data/scenarios/<id>/flags.json) ──────────

const flagColor = z.string().regex(/^(#[0-9a-f]{6}|\$[1-9])$/, "flag colours are #rrggbb or a preset parameter '$1'..'$9'");
const frac = z.number().min(-0.5).max(1.5);
const pos = z.number().positive().max(2);
/** Recursive (cantons nest layers); typed loosely here, `FlagLayer` in shared/flags.ts is the code type. */
export const FlagLayer: z.ZodType = z.lazy(() =>
  z.discriminatedUnion('t', [
    z.strictObject({ t: z.literal('stripes'), dir: z.enum(['h', 'v']), colors: z.array(flagColor).min(1).max(20), weights: z.array(z.number().positive().max(100)).optional() }),
    z.strictObject({ t: z.literal('rect'), x: frac, y: frac, w: pos, h: pos, color: flagColor }),
    z.strictObject({ t: z.literal('cross'), color: flagColor, width: pos, cx: frac.optional(), cy: frac.optional(), length: pos.optional() }),
    z.strictObject({ t: z.literal('saltire'), color: flagColor, width: pos }),
    z.strictObject({ t: z.literal('triangle'), color: flagColor, depth: pos }),
    z.strictObject({ t: z.literal('disc'), cx: frac, cy: frac, r: pos, color: flagColor }),
    z.strictObject({
      t: z.literal('star'), cx: frac, cy: frac, r: pos, color: flagColor,
      points: z.number().int().min(3).max(24).optional(), inner: z.number().positive().max(1).optional(), rotation: z.number().optional(),
    }),
    z.strictObject({ t: z.literal('crescent'), cx: frac, cy: frac, r: pos, color: flagColor, cut: flagColor, offset: z.number().min(-1).max(1), cutR: pos.optional() }),
    z.strictObject({ t: z.literal('poly'), points: z.array(z.tuple([frac, frac])).min(3), color: flagColor }),
    z.strictObject({ t: z.literal('canton'), x: frac, y: frac, w: pos, h: pos, layers: z.array(FlagLayer).min(1) }),
    z.strictObject({ t: z.literal('preset'), name: id, colors: z.array(flagColor).optional() }),
  ]),
);
export const FlagSpecSchema = z.strictObject({ aspect: z.number().min(0.5).max(3), layers: z.array(FlagLayer).min(1) });
export const FlagPresetsFile = z.strictObject({ comment: z.string().optional(), presets: z.record(id, z.array(FlagLayer).min(1)) });
export const FlagsFile = z.strictObject({ comment: z.string().optional(), flags: z.record(tag, FlagSpecSchema) });

/** 1938 economy calibration (PLAN 1.9): GDP (bn 1990 $) and GDP per head per NE admin-0 unit. */
const adm0 = z.string().regex(/^[A-Z0-9]{3}$/);
export const EconomyFile = z.strictObject({
  comment: z.string().optional(),
  defaultPerCapita: z.number().positive(),
  usPerCapita: z.number().positive(),
  gdp: z.record(adm0, z.number().positive().max(5000)),
  perCapita: z.record(adm0, z.number().positive().max(20000)),
});

/** Starting land order of battle (PLAN 1.7). */
export const OobFile = z.strictObject({
  comment: z.string().optional(),
  groups: z.array(
    z.strictObject({ nation: tag, template: id, count: z.number().int().min(1).max(100), at: lonLat, note: z.string().optional() }),
  ),
});

/** Starting fleets (PLAN 4.2b, `src/sim/data/fleets.ts`): each group at a naval base of ports.json, by its name. */
export const FleetsFile = z.strictObject({
  comment: z.string().optional(),
  groups: z.array(
    z.strictObject({ nation: tag, template: id, count: z.number().int().min(1).max(100), port: z.string().min(1), note: z.string().optional() }),
  ),
});

/**
 * The heroes of a start (PLAN 7.184, `addHeroes1938`), on the option `heroes`: each a hero
 * template of a living nation, of the land or the sea; a sea hero at a naval base of ports.json
 * that its nation holds, by its name; a land hero at its nation's capital.
 */
export const HeroesFile = z.strictObject({
  comment: z.string().optional(),
  heroes: z.array(z.strictObject({ nation: tag, template: id, domain: z.enum(['land', 'sea']), port: z.string().min(1).optional() })),
});

/** City-list inputs (PLAN 1.5): keys are 'NE NAME|ADM0_A3'; read by tools/data/cities.ts. */
const placeKey = z.string().regex(/^[^|]+\|[A-Z0-9]{3}$/, "place keys are 'NAME|ADM0'");
export const CityRulesFile = z.strictObject({
  comment: z.string().optional(),
  maxScalerank: z.number().int().min(0).max(10),
  minSpacingCells: z.number().positive().max(20),
  include: z.array(placeKey),
  renames: z.record(placeKey, z.string().min(1)),
  exclude: z.array(placeKey),
});

/** Generated city list (PLAN 1.5): one capital city per living nation. */
export const CitiesFile = z.strictObject({
  comment: z.string().optional(),
  cities: z.array(z.strictObject({ name: z.string().min(1), lonLat, size: z.number().int().min(1).max(5), capitalOf: tag.optional() })).min(1),
});

/** 1938 ownership rules (PLAN 1.3): country → tag, province overrides, polygon regions, occupation. */
export const OwnershipFile = z.strictObject({
  comment: z.string().optional(),
  /** adm0_a3 → owner tag (null = unowned). Every adm0 in the admin-1 data must be listed. */
  byCountry: z.record(z.string().regex(/^[A-Z0-9]{3}$/), tag.nullable()),
  /** adm1_code → owner tag. */
  byProvince: z.record(z.string(), tag),
  /** Applied in order to land cells currently owned by one of `onlyFrom`. */
  regions: z.array(z.strictObject({ id, owner: tag, onlyFrom: z.array(tag).min(1), note: z.string().optional(), ring })),
  /** Sets the controller of `owner`'s cells inside the ring (occupation). */
  occupation: z.array(z.strictObject({ id, controller: tag, owner: tag, note: z.string().optional(), ring })),
});

export type TerrainDef = z.infer<typeof TerrainDef>;
export type UnitTypeDef = z.infer<typeof UnitTypeDef>;
export type TechDef = z.infer<typeof TechDef>;
export type TraitDef = z.infer<typeof TraitDef>;
export type BuildingDef = z.infer<typeof BuildingDef>;
export type MapMeta = z.infer<typeof MapMeta>;
export type ScenarioMeta = z.infer<typeof ScenarioMeta>;
export type NationDef = z.infer<typeof NationDef>;
export type OwnershipFile = z.infer<typeof OwnershipFile>;
export type DiplomacyFile = z.infer<typeof DiplomacyFile>;
export type CitiesFile = z.infer<typeof CitiesFile>;
export type FlagsFile = { flags: Record<string, FlagSpec> };

// ── file table + validation ──────────────────────────────────────────────────

// ── the historical track's timeline (data/scenarios/<id>/timeline.json, ROADMAP R62b, ADR-919) ──

/** An event's when: its day, and the hour of that day (0 when not given); a note of what it is, for readers. */
const when = { date, hour: z.number().int().min(0).max(23).optional(), note: z.string().optional() };
const tags = z.array(tag).min(1);
/**
 * Land named by the map's codes (R69b, ADR-985): whole countries (admin-1 `adm0`) and provinces (`adm1`), beside or in
 * place of a ring; a cell is in when its province is.
 */
const byCode = { countries: z.array(z.string().regex(/^[A-Z0-9]{3}$/)).min(1).optional(), provinces: z.array(z.string().min(1)).min(1).optional() };

/**
 * One event of the timeline (SPEC §7.7), its parties by tag. The kinds of R62b; territory, births, strikes and
 * objectives come with R62c-e.
 */
export const TimelineEvent = z.discriminatedUnion('kind', [
  /**
   * A war of these sides alone (each leader first, its puppets with it but those `without`, which stay neutral, R62f):
   * the sim's calls of allies do not apply.
   */
  z.strictObject({ ...when, kind: z.literal('war'), attackers: tags, defenders: tags, without: tags.optional() }),
  /** `nation` (with its puppets but those `without`) joins the war between `beside` and `against`, on `beside`'s side. */
  z.strictObject({ ...when, kind: z.literal('join'), nation: tag, beside: tag, against: tag, without: tags.optional() }),
  /** The war between `a` and `b` ends: white (each keeps its own) or on its score, as the sim's peace (its terms). */
  z.strictObject({ ...when, kind: z.literal('peace'), a: tag, b: tag, terms: z.enum(['white', 'score']) }),
  /**
   * `target` annexed by `annexer`. `tell: 'note'` (R64d): its row is told by the note alone, where "{a} was annexed by
   * {b}" would mislead (the Reich's remnant after the zones: not the Soviet Union taking Germany).
   */
  z.strictObject({ ...when, kind: z.literal('annex'), annexer: tag, target: tag, tell: z.literal('note').optional() }),
  z.strictObject({ ...when, kind: z.literal('puppet'), overlord: tag, subject: tag, autonomy: z.number().int().min(0).max(100) }),
  z.strictObject({ ...when, kind: z.literal('release'), subject: tag }),
  /** `nation` joins `leader`'s alliance; one is made, named `nameKey`, when the leader has none. */
  z.strictObject({ ...when, kind: z.literal('allianceJoin'), nation: tag, leader: tag, nameKey: key }),
  z.strictObject({ ...when, kind: z.literal('allianceLeave'), nation: tag }),
  /** A guarantee given, or with `end` (R62i2) withdrawn. */
  z.strictObject({ ...when, kind: z.literal('guarantee'), guarantor: tag, target: tag, end: z.boolean().optional(), note: z.string().optional() }),
  /**
   * The land inside `ring` that one of `from` owns becomes `to`'s, owned and held (a treaty's cession, R62c). The ring
   * as `ownership.json`'s regions: lon/lat, a cell taken when its centre is inside. Or the land of `countries` and
   * `provinces` (R69b): a handover, with no window of fighting.
   */
  z.strictObject({ ...when, kind: z.literal('transfer'), to: tag, from: tags, ring: ring.optional(), ...byCode, note: z.string().optional() }),
  /**
   * The land inside `ring` that one of `of` owns is held by `by`, its owner unchanged (an occupation, R62c); `by` among
   * `of` takes its own back (R62g2). The land formations there of those who held it, held off from `by` (a hold), are
   * set down on their own nearest land behind the new line (R66c).
   */
  z.strictObject({ ...when, kind: z.literal('occupy'), by: tag, of: tags, ring, note: z.string().optional() }),
  /**
   * A nation of the scenario dormant until now is born (R62d) on the land in `ring` that one of `from` owns: owned
   * and held, its cores, its capital the city of its own nearest its table's capital. Its land by `countries` and
   * `provinces` (R69b) beside or in place of the ring.
   */
  z.strictObject({ ...when, kind: z.literal('born'), nation: tag, from: tags, ring: ring.optional(), ...byCode, note: z.string().optional() }),
  /**
   * A war's objective (R62e): until `until`, `nation`'s operational AI weights the front sectors within `km` of `at`,
   * and its invasion AI the cities there it may land by, OBJECTIVE_WEIGHT times.
   */
  z.strictObject({ ...when, kind: z.literal('objective'), nation: tag, at: lonLat, km: z.number().positive().max(3000), until: date, note: z.string().optional() }),
  /**
   * A phase's buff (R62f, SPEC §7.7 "phase buffs"): `nation`'s attack, defence, manpower, income or speed + `magnitude`
   * until `until`, granted as God Mode's are (`grantBuff`, named "History's course").
   */
  z.strictObject({ ...when, kind: z.literal('buff'), nation: tag, buff: z.enum(['attack', 'defense', 'manpower', 'income', 'speed']), magnitude: z.number().min(-0.9).max(3), until: date }),
  /**
   * Forces arriving (R62f, SPEC §7.7 "historical arrivals of forces"): `count` formations of land template `template`
   * set down for `nation` at `at` (its land point), as God Mode's spawn places one.
   */
  z.strictObject({ ...when, kind: z.literal('forces'), nation: tag, template: id, count: z.number().int().min(1).max(60), at: lonLat, kept: date.optional() }),
  /**
   * A front held (R62f2): until `until` the nations of `sides[0]` and of `sides[1]`, and their puppets, stay at war but
   * do not fight on land: no land combat between them, no land taken by either from the other, no plan of attack on
   * the other. Ships and aircraft fight on.
   */
  z.strictObject({ ...when, kind: z.literal('hold'), sides: z.tuple([tags, tags]), until: date }),
  /**
   * Each of `nations` (with its puppets of its side) leaves every war `against` fights on the other side (R62g1: an
   * armistice); the land each side held of the other goes back, as at a white peace.
   */
  z.strictObject({ ...when, kind: z.literal('leave'), nations: tags, against: tag }),
  /**
   * A front moved by rail (R62g1): of `nation`'s land formations in `from`, the `share` first by id march to the places
   * of `to` in turn, as a player's orders (the AI leaves each alone until it is there).
   */
  /**
   * An evacuation (R62g2): `nation`'s land formations in `ring` leave the theatre, their men back to its pool; held off
   * from a foe beside the ring (a hold, R66c), set down on its nearest land outside it where it has any within reach
   * over land. Or a pocket (`captured`, R62g3): they are taken, their men lost. With `fleets` (a surrender, R62i0) its ships and air
   * wings go too, wherever they are.
   */
  z.strictObject({ ...when, kind: z.literal('withdraw'), nation: tag, ring, captured: z.boolean().optional(), fleets: z.boolean().optional(), note: z.string().optional() }),
  z.strictObject({ ...when, kind: z.literal('redeploy'), nation: tag, from: ring, to: z.array(lonLat).min(1), share: z.number().gt(0).max(1) }),
  /**
   * A nuclear strike of the timeline's (R62h3: Hiroshima, Nagasaki): a fission warhead of `nation`'s bursts at `at`,
   * its effects a launch's, with no stockpile, bomber or toggle asked. The AI strikes nothing while the track steers.
   */
  z.strictObject({ ...when, kind: z.literal('nuke'), nation: tag, at: lonLat, note: z.string().optional() }),
  /**
   * A nation's atomic bomb (R69f, ADR-989): its test. It knows the bomb from now and may build warheads; while the
   * track steers, no nation it has not named may go for the bomb; after it, the usual rules.
   */
  z.strictObject({ ...when, kind: z.literal('bomb'), nation: tag }),
  /**
   * A regime change (R71a, ADR-992): a coup or a revolution. The nation's aggression (and its static command
   * efficiency, as at the start) becomes `aggression`; told by its note. A nation's government drives no rule, so it is
   * not set; its alignment is the `allianceJoin`, `allianceLeave` or `guarantee` of the same day.
   */
  z.strictObject({ ...when, kind: z.literal('regime'), nation: tag, aggression: z.number().int().min(0).max(100), note: z.string() }),
  /**
   * A new name and flag (R62i4): from now on the nation bears the identity `as` (`nation.<as>` and its flag), as Siam
   * Thailand, British India India, Communist China the People's Republic.
   */
  z.strictObject({ ...when, kind: z.literal('rename'), nation: tag, as: z.string().regex(/^[A-Z]{3}$/), note: z.string().optional() }),
  /** A seat moved (R62i2: Beijing, Taipei): the nation's own city nearest `at` becomes its capital. */
  z.strictObject({ ...when, kind: z.literal('capital'), nation: tag, at: lonLat, note: z.string().optional() }),
]);
export type TimelineEvent = z.infer<typeof TimelineEvent>;
export const TimelineFile = z.strictObject({
  comment: z.string().optional(),
  /** The day the track ends, after that day's first hour's events (R62d; absent: it runs until an intervention). */
  end: date.optional(),
  events: z.array(TimelineEvent).superRefine((events, ctx) => {
    // A transfer or a birth names its land (R69b): a ring, countries or provinces.
    events.forEach((e, i) => {
      if ((e.kind === 'transfer' || e.kind === 'born') && !e.ring && !e.countries && !e.provinces) ctx.addIssue({ code: 'custom', path: [i], message: `a ${e.kind} names its land: a ring, countries or provinces` });
    });
  }),
  /**
   * The land as history had it on dates (R62f), each the one before it with its own changes, over the start's owners:
   * whole countries and provinces by admin code, then rings where a border cuts one (`onlyFrom` as `ownership.json`'s).
   * Drawn on their own, not from the events' rings: `tools/diag/historyMatch` measures the track against them.
   */
  maps: z
    .array(
      z.strictObject({
        date,
        note: z.string().optional(),
        byCountry: z.record(z.string().regex(/^[A-Z0-9]{3}$/), tag).optional(),
        byProvince: z.record(z.string(), tag).optional(),
        regions: z.array(z.strictObject({ owner: tag, onlyFrom: tags, ring })).optional(),
        /**
         * Who held what on the date, where it was not its owner (R62g0): the land of `of` in these countries,
         * provinces and rings held by `by`. Each map's own, not laid over the map before it.
         */
        occupied: z
          .array(
            z.strictObject({
              by: tag,
              of: tags,
              countries: z.array(z.string().regex(/^[A-Z0-9]{3}$/)).optional(),
              provinces: z.array(z.string()).optional(),
              rings: z.array(ring).optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});
export type TimelineFile = z.infer<typeof TimelineFile>;

/** The tags an event names. */
export function timelineTags(e: TimelineEvent): string[] {
  switch (e.kind) {
    case 'war':
      return [...e.attackers, ...e.defenders, ...(e.without ?? [])];
    case 'join':
      return [e.nation, e.beside, e.against, ...(e.without ?? [])];
    case 'peace':
      return [e.a, e.b];
    case 'annex':
      return [e.annexer, e.target];
    case 'puppet':
      return [e.overlord, e.subject];
    case 'release':
      return [e.subject];
    case 'allianceJoin':
      return [e.nation, e.leader];
    case 'allianceLeave':
      return [e.nation];
    case 'guarantee':
      return [e.guarantor, e.target];
    case 'transfer':
      return [e.to, ...e.from];
    case 'occupy':
      return [e.by, ...e.of];
    case 'born':
      return [e.nation, ...e.from];
    case 'objective':
    case 'buff':
    case 'forces':
    case 'redeploy':
    case 'withdraw':
    case 'nuke':
    case 'bomb':
    case 'regime':
    case 'capital':
    case 'rename':
      return [e.nation];
    case 'hold':
      return [...e.sides[0], ...e.sides[1]];
    case 'leave':
      return [...e.nations, e.against];
  }
}

/** Paths are relative to `data/`, with `/` separators. */
export const DATA_FILES: readonly { pattern: RegExp; schema: z.ZodType }[] = [
  { pattern: /^terrain\.json$/, schema: TerrainFile },
  { pattern: /^combat\.json$/, schema: CombatFile },
  { pattern: /^units\/[a-z0-9_]+\.json$/, schema: UnitsFile },
  { pattern: /^tech\/[a-z0-9_]+\.json$/, schema: TechFile },
  { pattern: /^traits\/[a-z0-9_]+\.json$/, schema: TraitsFile },
  { pattern: /^buildings\/[a-z0-9_]+\.json$/, schema: BuildingsFile },
  { pattern: /^templates\/[a-z0-9_]+\.json$/, schema: TemplatesFile },
  { pattern: /^maps\/[a-z0-9_]+\/map\.json$/, schema: MapMeta },
  { pattern: /^maps\/[a-z0-9_]+\/straits\.json$/, schema: StraitsFile },
  { pattern: /^maps\/[a-z0-9_]+\/seas\.json$/, schema: SeasFile },
  { pattern: /^maps\/[a-z0-9_]+\/ice\.json$/, schema: IceFile },
  { pattern: /^maps\/[a-z0-9_]+\/passages\.json$/, schema: PassagesFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/scenario\.json$/, schema: ScenarioMeta },
  { pattern: /^scenarios\/[a-z0-9_]+\/nations\.json$/, schema: NationsFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/timeline\.json$/, schema: TimelineFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/ownership\.json$/, schema: OwnershipFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/diplomacy\.json$/, schema: DiplomacyFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/city-rules\.json$/, schema: CityRulesFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/flags\.json$/, schema: FlagsFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/oob\.json$/, schema: OobFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/economy\.json$/, schema: EconomyFile },
  { pattern: /^flags\/presets\.json$/, schema: FlagPresetsFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/cities\.json$/, schema: CitiesFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/ports\.json$/, schema: PortsFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/airbases\.json$/, schema: AirbasesFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/air\.json$/, schema: AirFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/fleets\.json$/, schema: FleetsFile },
  { pattern: /^scenarios\/[a-z0-9_]+\/heroes\.json$/, schema: HeroesFile },
];

export function schemaFor(file: string): z.ZodType | undefined {
  return DATA_FILES.find((d) => d.pattern.test(file))?.schema;
}

/** `types[2].stats.speed_kmh` from a zod issue path. */
export function formatPath(path: readonly PropertyKey[]): string {
  let out = '';
  for (const p of path) out += typeof p === 'number' ? `[${p}]` : out === '' ? String(p) : `.${String(p)}`;
  return out === '' ? '(root)' : out;
}

/** Validates one file against its schema; returns readable errors (empty = valid). */
export function validateFile(file: string, json: unknown): string[] {
  const schema = schemaFor(file);
  if (!schema) return [`${file}: no schema matches this path (add it to DATA_FILES in src/sim/data/schemas.ts)`];
  const r = schema.safeParse(json);
  return r.success ? [] : r.error.issues.map((i) => `${file}: ${formatPath(i.path)}: ${i.message}`);
}

/** Every i18n key a data set references (for the catalog check, which lives outside the sim). */
export function collectKeys(files: Readonly<Record<string, unknown>>): string[] {
  const keys: string[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v !== null && typeof v === 'object') {
      for (const k of Object.keys(v).sort()) {
        const x = (v as Record<string, unknown>)[k];
        if ((k === 'nameKey' || k === 'descKey') && typeof x === 'string') keys.push(x);
        else walk(x);
      }
    }
  };
  for (const f of Object.keys(files).sort()) walk(files[f]);
  return keys;
}

/**
 * Validates a whole data set (`files`: path relative to data/ → parsed JSON). Runs every file's
 * schema, then the cross-file checks (only on files that passed their schema).
 */
export function validateDataSet(files: Readonly<Record<string, unknown>>): string[] {
  const errors: string[] = [];
  const ok: Record<string, unknown> = {};
  for (const f of Object.keys(files).sort()) {
    const e = validateFile(f, files[f]);
    if (e.length) errors.push(...e);
    else ok[f] = files[f];
  }
  const of = <T>(re: RegExp): [string, T][] =>
    Object.keys(ok).filter((f) => re.test(f)).map((f) => [f, ok[f] as T]);

  // Unique ids across all files of a kind.
  const unique = <T extends { id: string }>(kind: string, entries: [string, T[]][]): Map<string, T> => {
    const seen = new Map<string, T>();
    const where = new Map<string, string>();
    for (const [f, list] of entries) {
      list.forEach((x, i) => {
        if (seen.has(x.id)) errors.push(`${f}: ${kind}[${i}].id: duplicate id '${x.id}' (also in ${where.get(x.id)})`);
        seen.set(x.id, x);
        where.set(x.id, f);
      });
    }
    return seen;
  };

  const terrainFiles = of<z.infer<typeof TerrainFile>>(/^terrain\.json$/);
  for (const [f, t] of terrainFiles) {
    const got = t.terrain.map((x) => x.id).join(',');
    if (got !== TERRAIN_IDS.join(',')) errors.push(`${f}: terrain: must list every class once, in enum order: ${TERRAIN_IDS.join(', ')}`);
  }

  const techs = unique('techs', of<z.infer<typeof TechFile>>(/^tech\//).map(([f, x]) => [f, x.techs]));
  for (const [f, x] of of<z.infer<typeof TechFile>>(/^tech\//)) {
    x.techs.forEach((t, i) =>
      t.prereqs.forEach((p, j) => {
        const pre = techs.get(p);
        if (!pre) errors.push(`${f}: techs[${i}].prereqs[${j}]: unknown tech '${p}'`);
        else if (pre.year > t.year) errors.push(`${f}: techs[${i}].prereqs[${j}]: '${p}' (${pre.year}) is later than '${t.id}' (${t.year})`);
      }),
    );
  }
  // Acyclic: depth-first search with colours, ids visited in sorted order for stable messages.
  const state = new Map<string, 1 | 2>();
  const visit = (tid: string, stack: string[]): void => {
    const s = state.get(tid);
    if (s === 2) return;
    if (s === 1) {
      errors.push(`tech: prerequisite cycle ${[...stack.slice(stack.indexOf(tid)), tid].join(' → ')}`);
      return;
    }
    state.set(tid, 1);
    for (const p of techs.get(tid)?.prereqs ?? []) if (techs.has(p)) visit(p, [...stack, tid]);
    state.set(tid, 2);
  };
  for (const tid of [...techs.keys()].sort()) visit(tid, []);

  const unitFiles = of<z.infer<typeof UnitsFile>>(/^units\//);
  unique('types', unitFiles.map(([f, x]) => [f, x.types]));
  for (const [f, x] of unitFiles) {
    x.types.forEach((u, i) => {
      if (u.techReq !== undefined && !techs.has(u.techReq)) errors.push(`${f}: types[${i}].techReq: unknown tech '${u.techReq}'`);
    });
  }

  const traitFiles = of<z.infer<typeof TraitsFile>>(/^traits\//);
  const traits = unique('traits', traitFiles.map(([f, x]) => [f, x.traits]));
  for (const [f, x] of traitFiles) {
    x.traits.forEach((t, i) =>
      t.excludes.forEach((e, j) => {
        const other = traits.get(e);
        if (!other) errors.push(`${f}: traits[${i}].excludes[${j}]: unknown trait '${e}'`);
        else if (!other.excludes.includes(t.id)) errors.push(`${f}: traits[${i}].excludes[${j}]: '${e}' does not exclude '${t.id}' back`);
        if (e === t.id) errors.push(`${f}: traits[${i}].excludes[${j}]: a trait cannot exclude itself`);
      }),
    );
  }

  unique('buildings', of<z.infer<typeof BuildingsFile>>(/^buildings\//).map(([f, x]) => [f, x.buildings]));

  const unitDomain = new Map(unitFiles.flatMap(([, x]) => x.types.map((u) => [u.id, u.domain] as const)));
  const unitIds = new Set(unitDomain.keys());
  /** The heroes' unit types (PLAN 7.184), and the templates of one. */
  const heroUnits = new Set(unitFiles.flatMap(([, x]) => x.types.filter((u) => u.hero === true).map((u) => u.id)));
  const heroTemplates = new Set<string>();
  /** A template's domain (PLAN 4.2a): that of its first element's unit type. */
  const templateDomain = new Map<string, string>();
  const templateFiles = of<z.infer<typeof TemplatesFile>>(/^templates\//);
  const templates = unique('templates', templateFiles.map(([f, x]) => [f, x.templates]));
  for (const [f, x] of templateFiles) {
    x.templates.forEach((t, i) =>
      t.elements.forEach((e, j) => {
        if (!unitIds.has(e.type)) errors.push(`${f}: templates[${i}].elements[${j}].type: unknown unit type '${e.type}'`);
        if (heroUnits.has(e.type)) heroTemplates.add(t.id);
        const domain = unitDomain.get(e.type);
        if (domain === undefined) return;
        const first = templateDomain.get(t.id) ?? domain;
        templateDomain.set(t.id, first);
        if (domain !== first) errors.push(`${f}: templates[${i}].elements[${j}].type: '${e.type}' is a ${domain} unit in a ${first} template`);
      }),
    );
  }

  const maps = new Map<string, MapMeta>();
  for (const [f, m] of of<MapMeta>(/^maps\/[a-z0-9_]+\/map\.json$/)) {
    const dir = f.split('/')[1];
    if (m.id !== dir) errors.push(`${f}: id: '${m.id}' must match its directory '${dir}'`);
    maps.set(m.id, m);
  }
  for (const [f, st] of of<z.infer<typeof StraitsFile>>(/^maps\/[a-z0-9_]+\/straits\.json$/)) {
    const dir = f.split('/')[1]!;
    if (!(`maps/${dir}/map.json` in files)) errors.push(`${f}: no map.json next to this file`);
    unique('straits', [[f, st.straits]]);
  }
  for (const [f, ice] of of<z.infer<typeof IceFile>>(/^maps\/[a-z0-9_]+\/ice\.json$/)) {
    const dir = f.split('/')[1]!;
    const seas = ok[`maps/${dir}/seas.json`] as z.infer<typeof SeasFile> | undefined;
    if (!seas) {
      errors.push(`${f}: no seas.json next to this file`);
      continue;
    }
    const names = new Set(seas.seas.map((s) => s.name));
    const seen = new Set<string>();
    ice.closed.forEach((name, i) => {
      if (!names.has(name)) errors.push(`${f}: closed[${i}]: '${name}' is no sea of maps/${dir}/seas.json`);
      if (seen.has(name)) errors.push(`${f}: closed[${i}]: '${name}' twice`);
      seen.add(name);
    });
  }
  for (const [f, nf] of of<z.infer<typeof NationsFile>>(/^scenarios\/[a-z0-9_]+\/nations\.json$/)) {
    const tags = new Map<string, number>();
    nf.nations.forEach((n, i) => {
      if (tags.has(n.tag)) errors.push(`${f}: nations[${i}].tag: duplicate tag '${n.tag}' (also nations[${tags.get(n.tag)}])`);
      tags.set(n.tag, i);
    });
    // Traits exist and are compatible; puppet relations are one level deep and point at the living.
    const byTag = new Map(nf.nations.map((n) => [n.tag, n]));
    nf.nations.forEach((n, i) => {
      n.traits.forEach((t, j) => {
        const def = traits.get(t);
        if (!def) errors.push(`${f}: nations[${i}].traits[${j}]: unknown trait '${t}'`);
        else for (const e of def.excludes) if (n.traits.includes(e)) errors.push(`${f}: nations[${i}].traits: '${t}' excludes '${e}'`);
      });
      n.techs?.forEach((t, j) => {
        if (!techs.has(t)) errors.push(`${f}: nations[${i}].techs[${j}]: unknown tech '${t}'`);
      });
      if (n.overlord) {
        const o = byTag.get(n.overlord.tag);
        if (!o) errors.push(`${f}: nations[${i}].overlord.tag: unknown nation '${n.overlord.tag}'`);
        else if (o.tag === n.tag) errors.push(`${f}: nations[${i}].overlord.tag: a nation cannot be its own overlord`);
        else if (o.overlord) errors.push(`${f}: nations[${i}].overlord.tag: '${o.tag}' is itself a puppet`);
        else if (o.alive === false || n.alive === false) errors.push(`${f}: nations[${i}].overlord: dead nations have no puppet relations`);
      }
    });
    const dipF = f.replace(/nations\.json$/, 'diplomacy.json');
    const dip = ok[dipF] as DiplomacyFile | undefined;
    if (dip) {
      const living = (t: string, where: string): void => {
        const n = byTag.get(t);
        if (!n) errors.push(`${dipF}: ${where}: unknown nation '${t}'`);
        else if (n.alive === false) errors.push(`${dipF}: ${where}: '${t}' is not alive`);
      };
      const inAlliance = new Map<string, string>();
      dip.alliances.forEach((a, i) => {
        living(a.leader, `alliances[${i}].leader`);
        if (!a.members.includes(a.leader)) errors.push(`${dipF}: alliances[${i}].leader: '${a.leader}' is not a member`);
        a.members.forEach((m, j) => {
          living(m, `alliances[${i}].members[${j}]`);
          if (inAlliance.has(m)) errors.push(`${dipF}: alliances[${i}].members[${j}]: '${m}' is already in '${inAlliance.get(m)}'`);
          inAlliance.set(m, a.id);
        });
      });
      dip.guarantees.forEach((g, i) => {
        living(g.guarantor, `guarantees[${i}].guarantor`);
        living(g.target, `guarantees[${i}].target`);
        if (g.guarantor === g.target) errors.push(`${dipF}: guarantees[${i}]: a nation cannot guarantee itself`);
      });
      dip.wars.forEach((war, i) => {
        war.attackers.forEach((t, j) => living(t, `wars[${i}].attackers[${j}]`));
        war.defenders.forEach((t, j) => {
          living(t, `wars[${i}].defenders[${j}]`);
          if (war.attackers.includes(t)) errors.push(`${dipF}: wars[${i}].defenders[${j}]: '${t}' is on both sides`);
        });
      });
    }
    const citF = f.replace(/nations\.json$/, 'cities.json');
    const cit = ok[citF] as CitiesFile | undefined;
    if (cit) {
      const capitalOf = new Map<string, number>();
      cit.cities.forEach((c, i) => {
        if (c.capitalOf === undefined) return;
        const n = byTag.get(c.capitalOf);
        if (!n || n.alive === false) errors.push(`${citF}: cities[${i}].capitalOf: '${c.capitalOf}' is not a living nation`);
        else if (n.capital.name !== c.name) errors.push(`${citF}: cities[${i}].name: '${c.name}' is not ${n.tag}'s capital '${n.capital.name}'`);
        if (capitalOf.has(c.capitalOf)) errors.push(`${citF}: cities[${i}].capitalOf: '${c.capitalOf}' already has a capital (cities[${capitalOf.get(c.capitalOf)}])`);
        capitalOf.set(c.capitalOf, i);
      });
      nf.nations.forEach((n, i) => {
        if (n.alive !== false && !capitalOf.has(n.tag)) errors.push(`${citF}: no capital city for nations[${i}] '${n.tag}'`);
      });
    }
    const flF = f.replace(/nations\.json$/, 'flags.json');
    const fl = ok[flF] as FlagsFile | undefined;
    if (fl) {
      nf.nations.forEach((n, i) => {
        if (!fl.flags[n.tag]) errors.push(`${flF}: flags: no flag for nations[${i}] '${n.tag}'`);
      });
      // The identities its timeline gives (R62i4, `rename`) have their flags here too.
      const tl = ok[f.replace(/nations\.json$/, 'timeline.json')] as TimelineFile | undefined;
      const identities = new Set((tl?.events ?? []).flatMap((e) => (e.kind === 'rename' ? [e.as] : [])));
      for (const t of Object.keys(fl.flags).sort()) if (!byTag.has(t) && !identities.has(t)) errors.push(`${flF}: flags.${t}: unknown nation`);
      for (const t of [...identities].sort()) if (!fl.flags[t]) errors.push(`${flF}: flags: no flag for the identity '${t}' its timeline gives`);
      const presets = (ok['flags/presets.json'] as { presets: Record<string, unknown> } | undefined)?.presets ?? {};
      const walk = (layers: readonly FlagLayerT[], where: string): void => {
        layers.forEach((l, i) => {
          if (l.t === 'preset' && !(l.name in presets)) errors.push(`${flF}: ${where}[${i}].name: unknown flag preset '${l.name}'`);
          if (l.t === 'canton') walk(l.layers, `${where}[${i}].layers`);
        });
      };
      for (const t of Object.keys(fl.flags).sort()) walk(fl.flags[t]!.layers, `flags.${t}.layers`);
    }
    const oobF = f.replace(/nations\.json$/, 'oob.json');
    const oob = ok[oobF] as z.infer<typeof OobFile> | undefined;
    if (oob) {
      oob.groups.forEach((g, i) => {
        const n = byTag.get(g.nation);
        if (!n || n.alive === false) errors.push(`${oobF}: groups[${i}].nation: '${g.nation}' is not a living nation`);
        if (!templates.has(g.template)) errors.push(`${oobF}: groups[${i}].template: unknown template '${g.template}'`);
        else if ((templateDomain.get(g.template) ?? 'land') !== 'land') errors.push(`${oobF}: groups[${i}].template: '${g.template}' is no land template: the groups of this file are placed on land`);
      });
    }
    // The fleets (PLAN 4.2b): of the sea, each at a naval base that its nation or a puppet of it holds.
    const fleetsF = f.replace(/nations\.json$/, 'fleets.json');
    const fleets = ok[fleetsF] as z.infer<typeof FleetsFile> | undefined;
    if (fleets) {
      const portsF = f.replace(/nations\.json$/, 'ports.json');
      const ports = (ok[portsF] as z.infer<typeof PortsFile> | undefined)?.ports;
      if (!ports) errors.push(`${fleetsF}: no valid ports.json next to this file`);
      fleets.groups.forEach((g, i) => {
        const n = byTag.get(g.nation);
        if (!n || n.alive === false) errors.push(`${fleetsF}: groups[${i}].nation: '${g.nation}' is not a living nation`);
        if (!templates.has(g.template)) errors.push(`${fleetsF}: groups[${i}].template: unknown template '${g.template}'`);
        else if (templateDomain.get(g.template) !== 'sea') errors.push(`${fleetsF}: groups[${i}].template: '${g.template}' is no sea template: the groups of this file are placed on water`);
        if (!ports) return;
        const rows = ports.filter((p) => p.name === g.port);
        if (rows.length !== 1) errors.push(`${fleetsF}: groups[${i}].port: ${rows.length === 0 ? `no port '${g.port}'` : `${rows.length} ports named '${g.port}'`} in ${portsF}`);
        else if (rows[0]!.navalBase < 1) errors.push(`${fleetsF}: groups[${i}].port: '${g.port}' is no naval base`);
        else if (rows[0]!.nation !== g.nation && (rows[0]!.nation === undefined || byTag.get(rows[0]!.nation)?.overlord?.tag !== g.nation))
          errors.push(`${fleetsF}: groups[${i}].port: '${g.port}' is held by '${rows[0]!.nation ?? 'no nation'}', neither '${g.nation}' nor a puppet of it`);
      });
    }
    // The heroes (PLAN 7.184): a hero template of its domain, of a living nation; one of each domain a nation; a sea hero at its nation's naval base.
    const heroesF = f.replace(/nations\.json$/, 'heroes.json');
    const heroes = ok[heroesF] as z.infer<typeof HeroesFile> | undefined;
    if (heroes) {
      const ports = (ok[f.replace(/nations\.json$/, 'ports.json')] as z.infer<typeof PortsFile> | undefined)?.ports ?? [];
      const seen = new Set<string>();
      heroes.heroes.forEach((h, i) => {
        const n = byTag.get(h.nation);
        if (!n || n.alive === false) errors.push(`${heroesF}: heroes[${i}].nation: '${h.nation}' is not a living nation`);
        if (seen.has(`${h.nation} ${h.domain}`)) errors.push(`${heroesF}: heroes[${i}]: a second ${h.domain} hero of '${h.nation}'`);
        seen.add(`${h.nation} ${h.domain}`);
        if (!templates.has(h.template)) errors.push(`${heroesF}: heroes[${i}].template: unknown template '${h.template}'`);
        else if (!heroTemplates.has(h.template)) errors.push(`${heroesF}: heroes[${i}].template: '${h.template}' is no hero's`);
        else if (templateDomain.get(h.template) !== h.domain) errors.push(`${heroesF}: heroes[${i}].template: '${h.template}' is no ${h.domain} template`);
        if (h.domain === 'land') {
          if (h.port !== undefined) errors.push(`${heroesF}: heroes[${i}].port: a land hero starts at its capital`);
          return;
        }
        const rows = ports.filter((q) => q.name === h.port);
        if (rows.length !== 1) errors.push(`${heroesF}: heroes[${i}].port: ${rows.length === 0 ? `no port '${h.port ?? ''}'` : `${rows.length} ports named '${h.port ?? ''}'`}`);
        else if (rows[0]!.navalBase < 1 || rows[0]!.nation !== h.nation) errors.push(`${heroesF}: heroes[${i}].port: '${h.port ?? ''}' is no naval base of '${h.nation}'`);
      });
    }
    const own = ok[f.replace(/nations\.json$/, 'ownership.json')] as OwnershipFile | undefined;
    if (!own) continue;
    const of2 = f.replace(/nations\.json$/, 'ownership.json');
    const check = (t: string | null, where: string): void => {
      if (t !== null && !tags.has(t)) errors.push(`${of2}: ${where}: unknown nation '${t}'`);
    };
    for (const k of Object.keys(own.byCountry).sort()) check(own.byCountry[k]!, `byCountry.${k}`);
    for (const k of Object.keys(own.byProvince).sort()) check(own.byProvince[k]!, `byProvince.${k}`);
    own.regions.forEach((r, i) => {
      check(r.owner, `regions[${i}].owner`);
      r.onlyFrom.forEach((t, j) => check(t, `regions[${i}].onlyFrom[${j}]`));
    });
    own.occupation.forEach((o, i) => {
      check(o.controller, `occupation[${i}].controller`);
      check(o.owner, `occupation[${i}].owner`);
    });
  }
  for (const [f] of of<unknown>(/^scenarios\/[a-z0-9_]+\/(ownership|diplomacy|cities|flags|oob|fleets|heroes)\.json$/)) {
    if (!(f.replace(/(ownership|diplomacy|cities|flags|oob|fleets|heroes)\.json$/, 'nations.json') in ok)) errors.push(`${f}: no valid nations.json next to this file`);
  }
  for (const [f, s] of of<ScenarioMeta>(/^scenarios\/[a-z0-9_]+\/scenario\.json$/)) {
    const dir = f.split('/')[1];
    if (s.id !== dir) errors.push(`${f}: id: '${s.id}' must match its directory '${dir}'`);
    const m = maps.get(s.map);
    if (!m) errors.push(`${f}: map: unknown map '${s.map}'`);
    else if (s.size !== undefined && !m.sizes.some((z) => z.id === s.size)) errors.push(`${f}: size: map '${s.map}' has no size '${s.size}'`);
    if (m && s.settings.loopingMap && !m.wrapX) errors.push(`${f}: settings.loopingMap: map '${s.map}' does not wrap`);
    if (s.base !== undefined && !(`scenarios/${s.base}/scenario.json` in ok)) errors.push(`${f}: base: no scenario '${s.base}'`);
  }
  // A timeline (ROADMAP R62b): its events in date order, naming the nations of its scenario's table (its base's, then
  // its own).
  for (const [f, t] of of<TimelineFile>(/^scenarios\/[a-z0-9_]+\/timeline\.json$/)) {
    const dir = f.split('/')[1]!;
    const meta = ok[`scenarios/${dir}/scenario.json`] as ScenarioMeta | undefined;
    const tables = [meta?.base, dir].flatMap((d) => (d === undefined ? [] : [ok[`scenarios/${d}/nations.json`] as z.infer<typeof NationsFile> | undefined]));
    const known = new Set(tables.flatMap((n) => n?.nations.map((x) => x.tag) ?? []));
    if (known.size === 0) errors.push(`${f}: no valid nations.json for its scenario`);
    let last = '';
    t.events.forEach((e, i) => {
      const at = `${e.date} ${String(e.hour ?? 0).padStart(2, '0')}`;
      if (at < last) errors.push(`${f}: events[${i}]: ${e.date} is before the event above it`);
      last = at;
      if (meta && e.date < meta.startDate) errors.push(`${f}: events[${i}]: ${e.date} is before the scenario's start`);
      for (const x of timelineTags(e)) if (known.size > 0 && !known.has(x)) errors.push(`${f}: events[${i}]: unknown nation '${x}'`);
      if (t.end !== undefined && e.date > t.end) errors.push(`${f}: events[${i}]: ${e.date} is after the track's end`);
    });
    let lastMap = '';
    (t.maps ?? []).forEach((m, i) => {
      if (m.date <= lastMap) errors.push(`${f}: maps[${i}]: ${m.date} is not after the map above it`);
      lastMap = m.date;
      const named = [
        ...Object.values(m.byCountry ?? {}),
        ...Object.values(m.byProvince ?? {}),
        ...(m.regions ?? []).flatMap((r) => [r.owner, ...r.onlyFrom]),
        ...(m.occupied ?? []).flatMap((o) => [o.by, ...o.of]),
      ];
      for (const x of named) if (known.size > 0 && !known.has(x)) errors.push(`${f}: maps[${i}]: unknown nation '${x}'`);
    });
  }
  return errors;
}
