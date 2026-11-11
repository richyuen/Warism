/**
 * Worker-side sim host (SPEC §2.3/§2.4): scheduler (speed/pause), request handling and
 * rAF-acked snapshots with a recycled buffer pool. Environment-agnostic: the worker entry
 * supplies `post` and drives `pump(nowMs)` from a timer; tests drive it directly in Node.
 *
 * Subscriptions only change what is *sent*; the sim never sees them (invariant I4).
 */
import { LABEL_STRIDE } from '../shared/nationLabels';
import { ECONOMY_TABLES_1938, TEMPLATES_1938, UNIT_IDS_1938 } from '../sim/scenario1938';
import { NATIONS_1938H } from '../sim/scenario1938h';
import { STEERING_KINDS } from '../sim/track';
import { deriveNationLabels } from './deriveLabels';
import terrainJson from '../../data/terrain.json' with { type: 'json' };
import cities1938 from '../../data/scenarios/1938/cities.json' with { type: 'json' };
import { buildLandCoverage } from '../shared/landCoverage';
import { decodeElevation } from '../shared/elevation';
import type { LandMask } from '../shared/landMask';
import { EVENT_STRIDE, EventKind, FIRE_STRIDE, FireField } from '../shared/events';
import { frameOf, symbolOf, Weapon, weaponOf, wreckOf } from '../shared/unitLooks';
import { Terrain, TERRAIN_IDS } from '../shared/terrain';
import { wayLine } from '../shared/wayLine';
import { encodeRuns } from '../shared/mapImport';
import { historyRows, nearestCity, strikeRows, struckSince, tickerNews, tickerRows } from './historyRows';
import { Lives } from './lives';
import { fileOffsets } from './files';
import { economyBreakdown } from '../sim/systems/economy';
import { largestBattle, warsWithBattle } from '../sim/systems/warBattle';
import { DAYS_PER_MONTH } from '../sim/systems/research';
import { shipyard } from '../sim/systems/production';
import { heroHealth, heroWaits } from '../sim/systems/heroes';
import { AiLayer, aiRuns, playerHeld } from '../sim/ai/layers';
import { carrierStrikes, inShipReach, nearestOwnPort, strikeTarget } from '../sim/systems/navalCombat';
import { landedAway } from '../sim/systems/amphibious';
import { CORRIDOR_HALF_WIDTH, CORRIDOR_LEN } from '../sim/systems/majorBattles';
import { heldBy, heldByFleet, LandingState, landingOfDivision, landingRows, nextVoyageHours, seaHint, seaOrderLanding, voyageOf } from '../sim/systems/landings';
import { marchHoursLeft } from '../sim/systems/movement';
import { isLand } from '../shared/terrain';
import { chartRows } from '../sim/stats';
import { aircraftOf } from '../sim/systems/airCombat';
import { isTransport, liveCarriers, wingAircraft } from '../sim/systems/air';
import { airbaseRoom } from '../sim/data/airbases';
import { nearestWingBase } from '../sim/placeForces';
import { Refusal, type Command } from '../shared/commands';
import { sortieAt, sortieEnd } from '../shared/sorties';
import { carrierRaids } from './carrierRaids';
import {
  BLOCK_STRIDE, NO_HEALTH,
  FormationFlag,
  MAX_SNAPSHOT_ELEMENTS,
  type SnapshotElements,
  NATION_STRIDE,
  NationField,
  SortieRole,
  type FromWorker,
  type SeaHint,
  type SimStatus,
  type Snapshot,
  type Speed,
  type Subscription,
  type SimInit,
  type ToWorker,
  type HeroStat,
  type NationStat,
  type FormationDetail,
  type LandingRow,
  type Inspection,
  type WarBattle,
  type WarStat,
  type OrderNews,
  type PlayerWing,
  type TrackNext,
  TRACK_AHEAD,
  VoyageState,
} from '../shared/protocol';
import { geometryOf, SCENARIO_INFO } from '../shared/scenarios';
import { decodeAdmin1, type Admin1Meta } from '../shared/admin1';
import { foundedName, foundedNth, provinceLabel } from '../shared/nationNames';
import { xxhash32View } from '../sim/core/hash';
import { buildProvinceRaster } from '../sim/data/provinces';
import { loadTerrain, type StraitDef } from '../sim/data/terrain';
import earthStraits from '../../data/maps/earth/straits.json' with { type: 'json' };
import { buildPoliticalMap } from '../sim/data/politicalMap';
import { politicalMapInput1938, TAGS_1938 } from '../sim/scenario1938';
import { landStandings } from '../sim/landArea';
import { Sim } from '../sim/sim';
import { CONTACT_CELLS, cellDist, contactsOf, deployOf, elementFacing, elementIndex, slotCount, slotPlace, wrapDx } from '../sim/systems/elements';
import { blockReach, SLOT_SPACING } from '../sim/core/pose';
import { upgradeState } from '../sim/core/upgrade';
import { AssetStore } from './assets';
import { airOf, buildMapCaches, Domain, portSeaOf, seaOf, TILE, type World } from '../sim/world';
import { airHolders } from '../sim/systems/airSuperiority';
import type { AirZones } from '../sim/nav/airZones';
import { BufferPool } from './pool';
import { canDeliver, dayIndustry, deliveryMeans, restraintOf, warheadsOf } from '../sim/systems/nuclear';

export type Post = (msg: FromWorker, transfer: Transferable[]) => void;

/** Max wall-clock ms spent ticking per pump at 'max' speed, so messages stay responsive. */
const MAX_SLICE_MS = 12;
/** Hard cap on queued (unsent) events; beyond it the oldest are dropped and counted. */
const EVENT_QUEUE_CAP = 1 << 20;
/** Hard cap on queued (unsent) fire events in view; beyond it the oldest are dropped and counted. */
export const FIRE_QUEUE_CAP = 1 << 13;
const NO_FIRES = new Float64Array(0);
/** Never schedule more than this many ticks in one pump at a fixed speed (avoid spirals). */
const MAX_TICKS_PER_PUMP = 2000;

const DEFAULT_SUB: Subscription = { bbox: [0, 0, Infinity, Infinity], z: 0, tier: 0, wantsElements: false };

/** Minimum wall time between label derivations (PLAN 1.29). */
const LABEL_INTERVAL_MS = 2000;
const STATS_INTERVAL_MS = 1000;

const EMPTY_ELEMENTS: SnapshotElements = {
  count: 0,
  id: new Uint32Array(0),
  formation: new Uint32Array(0),
  nation: new Uint16Array(0),
  frame: new Uint8Array(0),
  strength: new Uint16Array(0),
  size: new Uint16Array(0),
  x: new Float64Array(0),
  y: new Float64Array(0),
  prevX: new Float64Array(0),
  prevY: new Float64Array(0),
  facing: new Float32Array(0),
  flags: new Uint8Array(0),
  hit: new Uint8Array(0),
  truncated: false,
};

/**
 * Whether formation `id` is refused later in the same drain (`ev` from record `i`, 6 a record):
 * a division that marched to its port arrives there and is refused there in one hour (ROADMAP
 * R22a, critic run 34, R34-B1), and the arrival must not forget the order the refusal tells of.
 */
function refusedLater(ev: number[], i: number, id: number): boolean {
  for (let j = i + 6; j < ev.length; j += 6) if (ev[j + 1] === EventKind.MoveRejected && ev[j + 2] === id) return true;
  return false;
}

/** The cells of nation `n`'s land under fallout (PLAN 7.12: its panel). */
function falloutOf(world: World, n: number): number {
  let k = 0;
  for (const c of world.fallout.keys()) if (world.cells.owner[c] === n) k++;
  return k;
}

/** Nation `n`'s means of delivery as its panel and the editor read them (PLAN 7.37b2): the kept bomber's airbase by name. */
function meansOf(world: World, n: number): { bombers: number; base: string | null; missiles: boolean } {
  const m = deliveryMeans(world, n);
  return { bombers: m.bombers, base: m.base >= 0 ? world.airbases[m.base]!.name : null, missiles: m.missiles };
}

export class SimServer {
  sim: Sim | null = null;
  readonly pool = new BufferPool();
  speed: Speed = 24;
  paused = true;
  sub: Subscription = DEFAULT_SUB;

  /** Snapshot sequence of the last snapshot sent; awaiting its ack while `inFlight`. */
  private seq = 0;
  private inFlight = false;
  /** Tick of the last snapshot sent (a new snapshot is due when the tick moves on). */
  private sentTick = -1;
  private forceSend = true;
  /** Unsent events, flat [seq, tick, kind, a, b, x, y]. */
  private eventQueue: number[] = [];
  private nextEventSeq = 1;
  private droppedEvents = 0;
  /** Unsent fire events of the subscribed bbox, flat FIRE_STRIDE records (PLAN 2.4). */
  private fireQueue: number[] = [];
  private droppedFires = 0;
  /**
   * The elements fired at since the last snapshot, wherever they stand (PLAN 3.6e5): the view
   * holds elements whose shots it does not get (`SnapshotElements.hit`).
   */
  private firedAt = new Set<number>();
  /** Positions one tick before the current tick, indexed by formation id. */
  private prevX = new Float64Array(0);
  private prevY = new Float64Array(0);
  private prevAlive = new Uint8Array(0);
  private prevGeneration = new Uint32Array(0);
  /** Fractional ticks owed at fixed speed. */
  private owed = 0;
  private lastPump = -1;

  constructor(private readonly post: Post) {}

  /** Label derivation state (PLAN 1.29; not sim state). */
  private provinceNames: string[] | null = null;
  private labelVersion = -1;
  private lastLabelMs = -1;
  private unrestVersion = -1;
  /** The fallout last sent (PLAN 6.3c): its day and how many cells, -1 for none sent. */
  private falloutSent = { day: -1, cells: -1 };
  /** The ruins last sent (PLAN 7.11b): their day and how many bursts, -1 for none sent. */
  private ruinsSent = { day: -1, count: -1 };
  /** The sea control last sent (PLAN 4.7a): the zones' object and the holders, as a key. */
  private seaZonesSent: unknown = null;
  private seaHoldersSent = '';
  /** Whether the page was last sent a zone held by someone: kept over a load, which it outlives. */
  private seaShown = false;
  /** The air zones and holders last sent (PLAN 5.7c), and whether the page was shown a holder. */
  private airZonesSent: AirZones | null = null;
  private airHoldersSent = '';
  private airShown = false;
  /** The day the air control was last looked at (PLAN 5.8n): a pump that steps past a day's first hour sends the day's at its first look. */
  private airDay = -1;
  /**
   * The formations a player ordered, to the cell of the order (PLAN 4.9c): what becomes of it is
   * told. `before`: the order it replaced, which stands again if this one is refused.
   */
  private ordered = new Map<number, { target: number; before: number | undefined; once?: number }>();
  /** The played nation's fleets that have been on a player's order since the game was opened or loaded (ROADMAP R35d). */
  private playerFleets = new Set<number>();
  /**
   * The player's landings as last sent (ROADMAP R47a): by id; each one's division to landing; what became of each
   * one's divisions so far (landed, thrown back, lost at sea); those over, kept a day with their outcome.
   */
  private landingsLast = new Map<number, LandingRow>();
  private landingOfDiv = new Map<number, number>();
  /** Where each division of a landing of the player's ended, by landing (ROADMAP R50a: not a count of events). */
  private landingEnds = new Map<number, Map<number, 'landed' | 'away' | 'repulsed' | 'lost' | 'stayed'>>();
  private landingsOver = new Map<number, LandingRow>();
  /**
   * The player's divisions thrown back (ROADMAP R53a; critic run 54, R54-B1): the port their transports sail home to,
   * and where each came ashore after, a city's name; kept to its landing's end.
   */
  private thrownHome = new Map<number, string>();
  private thrownAshore = new Map<number, string>();
  /** Where each division of a landing came ashore away from its target (ROADMAP R55h; critic run 55: "away from Valletta" said not where). */
  private awayAshore = new Map<number, string>();
  /**
   * Each landing's click as first seen (ROADMAP R50b; critic run 52, R52-N2: once its siblings were over, gone from the
   * world, a part was a click of its own, and one turning back is no sibling): kept to its end.
   */
  private landingClick = new Map<number, number>();
  private landingsSent = '';
  /**
   * The player's landings cancelled (ROADMAP R47c, R48a): by their row's cancel, how many were sent back aboard and how
   * many stopped ashore; by a click that sent all of one to its port, all back. Told `cancelled` once over.
   */
  private landingsCancelled = new Map<number, { home: number; stopped: number }>();
  /** When a formation of a player's order last landed (ROADMAP R17c: its panel says so for a day). */
  private landedAt = new Map<number, number>();
  private labelNames = -1;
  private terrainSent = -1;
  private citiesSent = -1;
  private flagsSent = -1;
  /** Land (1) / water (0) per cell at init, for `terrainLayer.landChanged`. */
  private startLand: Uint8Array | null = null;
  private statsTick = -1;
  /** Counts the worlds this worker has had (a new game, a load): the view tells a loaded world's past from news by it (PLAN 3.12d). */
  private worldNo = 0;
  /** Each nation's life from the history (PLAN 7.4f28): the ranking's lists of a life. */
  private readonly lives = new Lives();
  private lastStatsMs = -1;
  /** The log's length at the last statistics message: the next one's news begins there (PLAN 3.12Rh2). Below 0: a world's first message, whose log is its past. */
  private newsFrom = -1;
  /** Whether the game pauses at the tick of a nuclear strike (PLAN 7.109a): the host's setting, kept here so the pause is not a statistics message late. */
  private nukePause = false;

  /** Takes a command for the next tick boundary and notes a player's order to tell what becomes of it; false when refused. */
  private take(cmd: Command): boolean {
    const sim = this.requireSim();
    // A command of a kind the sim does not know is refused and nothing follows (PLAN 2.12b).
    if (!sim.command(cmd)) {
      console.warn(`sim worker: refused a command of an unknown kind: ${JSON.stringify(cmd)?.slice(0, 120)}`);
      return false;
    }
    // A player's order of a formation (it names its nation): what becomes of it is told (PLAN 4.9c).
    // An order over the sea is judged against the land of the landing it is for (`seaOrderLanding`:
    // the one it has when kept), not the click, which may resolve to a landing cells off (ROADMAP
    // R26a, R27c; critic run 38, R38-B1: a click two cells south of Shanghai, four from the
    // landing's land, was told "came ashore away" for a landing as ordered).
    if (cmd.kind === 'moveFormation' && cmd.nation !== undefined) {
      const w = sim.world;
      const l = seaOrderLanding(w, cmd.id, cmd.x, cmd.y);
      this.ordered.set(cmd.id, { target: l ? l.land : Math.floor(cmd.y) * w.cells.w + Math.floor(cmd.x), before: this.ordered.get(cmd.id)?.target });
    }
    // A wing's order and a paradrop (PLAN 5.8v3): told if refused, as a march is; given or
    // refused in the hour it is applied (`once`, the tick it is applied at), so forgotten after it.
    if ((cmd.kind === 'wingMission' || cmd.kind === 'wingRebase' || cmd.kind === 'paradrop') && cmd.nation !== undefined) {
      this.ordered.set(cmd.id, { target: Math.floor(cmd.y) * sim.world.cells.w + Math.floor(cmd.x), before: this.ordered.get(cmd.id)?.target, once: sim.world.tick });
    }
    return true;
  }

  /**
   * `now` (God Mode UI): applies the commands taken at once, between ticks, with the tick stamp the
   * next step would give (PLAN 1.32b); the snapshot and stats follow. Plain commands stay pending.
   */
  private applyNow(): void {
    this.requireSim().applyNow((w) => this.drainEvents(w));
    this.forceSend = true;
    // God actions skip the (cheap) stats throttle, so panels update on the click. Labels
    // keep theirs (~40 ms a derivation; brush strokes come in bursts) and follow within
    // LABEL_INTERVAL_MS through the paused flush pump.
    this.statsTick = -1;
    this.lastStatsMs = -1;
    this.maybeSend();
  }

  handle(msg: ToWorker, nowMs: number): void {
    try {
      this.handleInner(msg, nowMs);
      this.maybeLabels(nowMs);
      this.maybeStats(nowMs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.post({ type: 'error', reqId: 'reqId' in msg ? msg.reqId : -1, message: error.message, stack: error.stack ?? '' }, []);
    }
  }

  private requireSim(): Sim {
    if (!this.sim) throw new Error('sim not initialised');
    return this.sim;
  }

  /**
   * Replies with the status. `withHash` false (read-only queries: inspect, history, stats) skips
   * the 12 ms state hash on the 1938 map and reports NaN (review after PLAN 1.39a).
   */
  private reply(reqId: number, bytes?: Uint8Array, withHash = true): void {
    const s = this.requireSim();
    const status: SimStatus = { tick: s.tick, hash: withHash ? s.hash() : NaN };
    if (bytes) this.post({ type: 'reply', reqId, status, bytes }, [bytes.buffer]);
    else this.post({ type: 'reply', reqId, status }, []);
  }

  private handleInner(msg: ToWorker, nowMs: number): void {
    switch (msg.type) {
      case 'init':
        if (msg.init.scenario !== 'toy' && !msg.init.assets) {
          void this.initWithAssets(msg);
          break;
        }
        this.startSim(msg.init, msg.reqId);
        break;
      case 'step':
        this.advance(msg.n);
        this.reply(msg.reqId);
        break;
      case 'cmd':
        if (this.take(msg.cmd) && msg.now) this.applyNow();
        break;
      case 'cancelLanding': {
        if (!this.sim) break;
        const cmds = this.cancelOrders(this.sim.world, msg.id);
        for (const cmd of cmds) this.take(cmd);
        break;
      }
      case 'cmds': {
        // One click's commands (ROADMAP R29a; critic run 40, R40-B2): all taken, then applied
        // together, so the sim judges them as one hour's orders, not one division at a time.
        let any = false;
        if (this.sim) this.noteCancels(this.sim.world, msg.cmds);
        for (const cmd of msg.cmds) any = this.take(cmd) || any;
        if (any && msg.now) this.applyNow();
        break;
      }
      case 'hash':
        this.reply(msg.reqId);
        break;
      case 'inspect':
        this.reply(msg.reqId, this.inspect(msg.full === true), false);
        break;
      case 'history':
        this.reply(msg.reqId, this.historyRows(), false);
        break;
      case 'formation':
        this.reply(msg.reqId, new TextEncoder().encode(JSON.stringify(this.formationInfo(msg.id, msg.generation))), false);
        break;
      case 'overSea': {
        // ROADMAP R17c: the cursor's hint for the player's selection: 0 not over the sea, 1 by
        // sea, 2 by sea onto the ground of a nation outside its wars, refused (ROADMAP R21c).
        // By sea, the landings the orders are for, from what the order uses (`seaHint`, ADR-827, R27a,
        // R28b): each distinct one of the selection.
        const hint: SeaHint = seaHint(this.requireSim().world, msg.ids, msg.x, msg.y);
        this.reply(msg.reqId, new TextEncoder().encode(JSON.stringify(hint)), false);
        break;
      }
      case 'economy': {
        // A nation's month in parts (PLAN 7.4f34): read off the state now, as the month's tick would.
        const world = this.requireSim().world;
        const b = world.rules && world.nations.has(msg.nation) ? economyBreakdown(world, ECONOMY_TABLES_1938, msg.nation) : null;
        this.reply(msg.reqId, new TextEncoder().encode(JSON.stringify(b)), false);
        break;
      }
      case 'warBattle': {
        const world = this.requireSim().world;
        const site = Number.isInteger(msg.war) ? largestBattle(world, msg.war) : null;
        const battle: WarBattle | null = site ? { ...site, tick: world.tick } : null;
        this.reply(msg.reqId, new TextEncoder().encode(JSON.stringify(battle)), false);
        break;
      }
      case 'stats': {
        // With the air's numbers (PLAN 5.11c): CHART_STRIDE records.
        const rows = chartRows(this.requireSim().world.stats);
        this.reply(msg.reqId, new Uint8Array(rows.buffer), false);
        break;
      }
      case 'exportScenario': {
        const sim = this.requireSim();
        const { bytes, hash } = sim.exportScenario();
        this.post({ type: 'reply', reqId: msg.reqId, status: { tick: sim.tick, hash: sim.hash() }, bytes, scenarioHash: hash }, [bytes.buffer]);
        break;
      }
      case 'save':
        this.reply(msg.reqId, this.requireSim().save());
        break;
      case 'load': {
        // A scenario file of an older version: the parts it lacks that this one can add (ROADMAP R53i).
        const up = msg.upgrade ? upgradeState(msg.bytes) : null;
        this.requireSim().load(up ? up.bytes : msg.bytes);
        this.worldNo++;
        this.newsFrom = -1;
        this.labelVersion = -1; // the controller layer was replaced wholesale
        this.unrestVersion = -1;
        this.falloutSent = { day: -1, cells: -1 };
        this.ruinsSent = { day: -1, count: -1 };
        this.seaZonesSent = null;
        this.seaHoldersSent = '';
        // The loaded game's holders, at once (PLAN 5.8n); `airShown` outlives it, as `seaShown`.
        this.airZonesSent = null;
        this.airHoldersSent = '';
        this.airDay = -1;
        this.ordered.clear();
        this.playerFleets.clear();
        this.clearLandingRows();
        this.statsTick = -1;
        this.lastStatsMs = -1;
        this.resetStreams();
        if (up) {
          const s = this.requireSim();
          this.post({ type: 'reply', reqId: msg.reqId, status: { tick: s.tick, hash: s.hash(), upgraded: { fileHash: up.fileHash, added: up.added } } }, []);
        } else this.reply(msg.reqId);
        this.warmLanes();
        break;
      }
      case 'speed':
        this.speed = msg.speed;
        this.owed = 0;
        this.lastPump = nowMs;
        this.forceSend = true;
        break;
      case 'pause':
        this.paused = msg.paused;
        this.owed = 0;
        this.lastPump = nowMs;
        this.forceSend = true;
        break;
      case 'nukePause':
        this.nukePause = msg.on;
        break;
      case 'subscribe':
        this.sub = msg.sub;
        this.forceSend = true;
        break;
      case 'ack':
        if (msg.seq !== this.seq) throw new Error(`ack for snapshot ${msg.seq}, expected ${this.seq}`);
        for (const b of msg.buffers) this.pool.release(b);
        this.inFlight = false; // an owed snapshot goes at the end of handleInner
        break;
      case 'buildProvinces':
        void this.buildProvinces(msg);
        break;
      case 'buildTerrain':
        void this.buildTerrain(msg);
        break;
      case 'buildPolitical':
        void this.buildPolitical(msg);
        break;
    }
    this.maybeSend();
  }

  private async buildProvinces(msg: Extract<ToWorker, { type: 'buildProvinces' }>): Promise<void> {
    try {
      const t0 = performance.now();
      const store = new AssetStore(msg.assetBase);
      const geoAsset = await store.load('admin1-geometry');
      const metaAsset = await store.load('admin1-meta');
      const t1 = performance.now();
      const geo = decodeAdmin1(geoAsset.bytes);
      const meta = JSON.parse(new TextDecoder().decode(metaAsset.bytes)) as Admin1Meta[];
      const t2 = performance.now();
      const r = buildProvinceRaster(geo, meta, msg.w, msg.h);
      const t3 = performance.now();
      let present = 0;
      for (let i = 1; i < r.cells.length; i++) if (r.cells[i]! > 0) present++;
      const result = {
        w: msg.w,
        h: msg.h,
        provinces: meta.length,
        present,
        forced: r.forced.length,
        missing: r.missing.length,
        landCells: msg.w * msg.h - r.cells[0]!,
        hash: xxhash32View(r.ids),
        ms: { fetch: geoAsset.fetchMs + metaAsset.fetchMs, decode: t2 - t1 + geoAsset.decodeMs + metaAsset.decodeMs, raster: t3 - t2, total: t3 - t0 },
        ...(msg.withIds ? { ids: r.ids } : {}),
      };
      this.post({ type: 'provinces', reqId: msg.reqId, result }, msg.withIds ? [r.ids.buffer] : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.post({ type: 'error', reqId: msg.reqId, message: error.message, stack: error.stack ?? '' }, []);
    }
  }

  /** A fresh sim always starts paused; the host unpauses explicitly. */
  private startSim(init: SimInit, reqId: number): void {
    this.sim = new Sim(init);
    this.worldNo++;
    this.newsFrom = -1;
    // Real-map scenarios get nation labels; province names name spawned nations.
    this.provinceNames = init.assets ? (JSON.parse(new TextDecoder().decode(init.assets.admin1Meta)) as Admin1Meta[]).map(provinceLabel) : null;
    this.labelVersion = -1;
    this.lastLabelMs = -1;
    this.unrestVersion = -1;
    this.falloutSent = { day: -1, cells: -1 };
    this.ruinsSent = { day: -1, count: -1 };
    this.seaZonesSent = null;
    this.seaHoldersSent = '';
    this.airZonesSent = null;
    this.airHoldersSent = '';
    this.airDay = -1;
    this.ordered.clear();
    this.playerFleets.clear();
    this.clearLandingRows();
    this.statsTick = -1;
    this.lastStatsMs = -1;
    this.flagsSent = -1;
    this.citiesSent = -1;
    this.terrainSent = -1;
    this.paused = true;
    this.owed = 0;
    this.resetStreams();
    this.reply(reqId);
    this.warmLanes();
  }

  /**
   * The lane graph built now (PLAN 4.8e): a game builds it at its first sail, 2 s in one tick of a
   * game under way (the naval AI's at hour 48 of 1938). After the reply, before any tick: the page
   * has its game, paused, and a derived cache changes no state. With it the map's other static
   * caches, the air zones' first among them (PLAN 7.125: 25 ms of a first tick; `buildMapCaches`).
   */
  private warmLanes(): void {
    setTimeout(() => {
      const world = this.sim?.world;
      if (world && world.ports.length > 0 && world.seaSeeds.length > 0) buildMapCaches(world);
    }, 0);
  }

  /** Real-map scenarios: fetch and verify the map assets, then build the world (PLAN 1.9a). */
  private async initWithAssets(msg: Extract<ToWorker, { type: 'init' }>): Promise<void> {
    try {
      if (!msg.assetBase) throw new Error(`scenario '${msg.init.scenario}' needs assetBase`);
      const store = new AssetStore(msg.assetBase);
      const { w } = geometryOf(msg.init.scenario, msg.init.options?.size);
      // The fine land mask with the rest: the world is built on it (PLAN 2.9a).
      const [geo, meta, terrain, mask] = await Promise.all([store.load('admin1-geometry'), store.load('admin1-meta'), store.load('terrain', w), store.load('landmask')]);
      const landMask: LandMask = { w: mask.asset.width, h: mask.asset.height ?? mask.asset.width / 2, bits: mask.bytes };
      this.startSim({ ...msg.init, assets: { admin1Geometry: geo.bytes, admin1Meta: meta.bytes, terrain: terrain.bytes, landMask } }, msg.reqId);
      void this.sendMapLayers(store, landMask);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.post({ type: 'error', reqId: msg.reqId, message: error.message, stack: error.stack ?? '' }, []);
    }
  }

  /** Builds and sends the renderer's static layers (fine land coverage, terrain) once. */
  private async sendMapLayers(store: AssetStore, mask: LandMask): Promise<void> {
    try {
      const world = this.requireSim().world;
      const factor = Math.max(1, Math.round(mask.w / (2 * world.cells.w)));
      const land = buildLandCoverage(mask.bits, mask.w, mask.h, factor);
      const terrain = { w: world.cells.w, h: world.cells.h, data: world.cells.terrain.slice() };
      const terrainColors = terrainJson.terrain.map((t) => parseInt(t.color.slice(1), 16));
      const cities = this.cityList(world).map((c) => ({ id: c.id, name: c.name, x: c.x, y: c.y, size: c.size, capital: c.capitalOf !== 0 }));
      this.citiesSent = world.citiesVersion;
      this.startLand = Uint8Array.from(world.cells.terrain, (t) => (t >= Terrain.Plains ? 1 : 0));
      const province = world.cells.province.slice();
      const rules = world.rules?.templates ?? [];
      // Every template of the rules, by its index, the fleets' with the land's (PLAN 4.2b): a formation is named and drawn by it.
      const templates = TEMPLATES_1938.slice(0, rules.length).map((t, i) => ({ nameKey: `template.${t.id}`, gold: rules[i]!.gold, manpower: rules[i]!.manpower, days: rules[i]!.days, men: ECONOMY_TABLES_1938.templateStrength[i] ?? 0, symbol: rules[i]!.domain === Domain.sea ? ('fleet' as const) : symbolOf(t), domain: rules[i]!.domain, aircraft: rules[i]!.domain === Domain.air ? wingAircraft(world, i) : 0, techs: rules[i]!.techs, parts: rules[i]!.elements.map((e) => ({ frame: frameOf(world.rules?.units[e.unit]?.cls ?? 'inf'), count: e.count })), ...(rules[i]!.hero ? { hero: true } : {}) }));
      const techs = (world.rules?.techs ?? []).map((t) => ({ nameKey: `tech.${t.id}`, gold: t.gold, days: t.days }));
      this.post({ type: 'mapLayers', land, terrain, terrainColors, cities, province, templates, techs }, [land.data.buffer, terrain.data.buffer, province.buffer]);
    } catch {
      /* the cell-resolution coast stays: no fine layers */
    }
    // A copy for the page (the worker's own is the world's): 17 MB, once.
    const bits = mask.bits.slice();
    this.post({ type: 'landMask', mask: { w: mask.w, h: mask.h, bits } }, [bits.buffer]);
    await this.sendElevation(store);
  }

  /** The elevation level of the map's size, for the hillshade (PLAN 2.8a). After the map layers: the map does not wait for it. */
  private async sendElevation(store: AssetStore): Promise<void> {
    try {
      const { w, h } = this.requireSim().world.cells;
      const { bytes } = await store.load('elevation', w);
      const data = decodeElevation(bytes, w, h);
      this.post({ type: 'elevation', w, h, data }, [data.buffer]);
    } catch {
      /* no level of this size: the land is drawn flat */
    }
  }

  private async buildTerrain(msg: Extract<ToWorker, { type: 'buildTerrain' }>): Promise<void> {
    try {
      const t0 = performance.now();
      const asset = await new AssetStore(msg.assetBase).load('terrain', msg.w);
      const { terrain, crossings } = loadTerrain(asset.bytes, msg.w, msg.h, earthStraits.straits as unknown as StraitDef[]);
      const counts: number[] = [];
      for (const v of terrain) counts[v] = (counts[v] ?? 0) + 1;
      for (let k = 0; k < counts.length; k++) counts[k] ??= 0;
      const result = {
        w: msg.w,
        h: msg.h,
        counts,
        crossings,
        hash: xxhash32View(terrain),
        ms: { fetch: asset.fetchMs, decode: asset.decodeMs, total: performance.now() - t0 },
        terrain,
      };
      this.post({ type: 'terrain', reqId: msg.reqId, result }, [terrain.buffer]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.post({ type: 'error', reqId: msg.reqId, message: error.message, stack: error.stack ?? '' }, []);
    }
  }

  private async buildPolitical(msg: Extract<ToWorker, { type: 'buildPolitical' }>): Promise<void> {
    try {
      const t0 = performance.now();
      const store = new AssetStore(msg.assetBase);
      const [geoAsset, metaAsset, terrainAsset] = await Promise.all([store.load('admin1-geometry'), store.load('admin1-meta'), store.load('terrain', msg.w)]);
      const tags = TAGS_1938;
      const r = buildPoliticalMap(
        politicalMapInput1938({ admin1Geometry: geoAsset.bytes, admin1Meta: metaAsset.bytes, terrain: terrainAsset.bytes }, msg.w, msg.h),
      );
      const cells = new Array<number>(tags.length + 1).fill(0);
      for (const v of r.owner) cells[v]!++;
      const cities = r.cities.map((c) => ({
        name: c.name,
        x: c.x,
        y: c.y,
        size: c.size,
        owner: c.owner,
        capitalOf: c.capitalOf,
      }));
      const result = {
        w: msg.w,
        h: msg.h,
        cells,
        ownerHash: xxhash32View(r.owner),
        controllerHash: xxhash32View(r.controller),
        ms: { total: performance.now() - t0 },
        owner: r.owner,
        controller: r.controller,
        cities,
        formations: r.formations.map((f) => ({ x: f.x, y: f.y, nation: f.nation, template: f.template })),
      };
      this.post({ type: 'political', reqId: msg.reqId, result }, [r.owner.buffer, r.controller.buffer]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.post({ type: 'error', reqId: msg.reqId, message: error.message, stack: error.stack ?? '' }, []);
    }
  }

  /** New sim state: drop queued events, resend every tile. */
  private resetStreams(): void {
    this.eventQueue = [];
    this.fireQueue = [];
    this.firedAt.clear();
    this.sim!.world.out.markAllDirty();
    this.sim!.world.out.events.length = 0;
    this.sim!.world.out.fires.length = 0;
    this.snapshotPrev(this.sim!.world);
    this.forceSend = true;
  }

  /** Whether the scheduler wants `pump` to be called again soon. */
  get running(): boolean {
    return this.sim !== null && (!this.paused || this.derivedPending);
  }

  /** Whether ticks are advancing (not just flushing derived messages). */
  get ticking(): boolean {
    return this.sim !== null && !this.paused;
  }

  /**
   * A throttled derived message (labels, stats) still owes the UI an update: while paused the
   * host keeps pumping until it is sent (e.g. after a single step), without advancing ticks.
   */
  private get derivedPending(): boolean {
    const sim = this.sim;
    if (!sim || !this.provinceNames) return false;
    return sim.world.tick !== this.statsTick || sim.world.controlChanges !== this.labelVersion || sim.world.namesVersion !== this.labelNames;
  }

  /**
   * Called by the host timer: runs the ticks owed since the last pump, then maybe sends.
   * `clock` is read during 'max' speed to bound the slice to MAX_SLICE_MS of wall time.
   */
  pump(nowMs: number, clock: () => number): void {
    if (!this.running) {
      this.lastPump = nowMs;
      return;
    }
    if (this.paused) {
      // Only flushing derived messages (see derivedPending).
      this.lastPump = nowMs;
      this.maybeLabels(nowMs);
      this.maybeStats(nowMs);
      return;
    }
    if (this.lastPump < 0) this.lastPump = nowMs;
    if (this.speed === 'max') {
      const start = clock();
      do if (this.advance(1, true) < 0) break;
      while (clock() - start < MAX_SLICE_MS);
    } else {
      this.owed += ((nowMs - this.lastPump) * this.speed) / 1000;
      const n = Math.min(MAX_TICKS_PER_PUMP, Math.floor(this.owed));
      this.owed -= n;
      // The ticks a strike stopped short of are owed still, unless it paused the game.
      const done = n > 0 ? this.advance(n, true) : 0;
      if (done < 0 && !this.paused) this.owed += n + done;
    }
    this.lastPump = nowMs;
    this.maybeSend();
    this.maybeLabels(nowMs);
    this.maybeStats(nowMs);
  }

  /**
   * Nation panel and war banner data (PLAN 1.31): when the tick moved (or after init/load), at
   * most every STATS_INTERVAL_MS. Real-map scenarios only (the toy world has no panels).
   */
  private maybeStats(nowMs: number): void {
    const sim = this.sim;
    if (!sim || !this.provinceNames) return;
    const world = sim.world;
    if (world.tick === this.statsTick || (this.lastStatsMs >= 0 && nowMs - this.lastStatsMs < STATS_INTERVAL_MS)) return;
    this.statsTick = world.tick;
    this.lastStatsMs = nowMs;
    const { nations, wars } = this.buildStats(world, false);
    const dead: { id: number; name: string; color: number }[] = [];
    world.nations.forEach((id) => {
      // Not one the historical track has yet to bring into being (ROADMAP R62b): it never lived.
      if (world.nations.cols.living[id] !== 1 && !world.track?.unborn.has(id)) dead.push({ id, name: this.nameOf(id), color: world.nations.cols.color[id]! });
    });
    const news = this.newsFrom < 0 ? [] : tickerNews(world, this.newsFrom);
    const strikes = this.newsFrom < 0 ? [] : strikeRows(world, this.newsFrom, (id) => this.nameOf(id), (v) => this.cityName(v), (d) => cities1938.cities[d]?.name ?? '');
    this.newsFrom = world.history.length;
    this.post({ type: 'nationStats', tick: world.tick, nations, wars, dead, lives: this.lives.of(world), aiEnabled: world.settings.aiEnabled, nukesEnabled: world.settings.nukesEnabled, rules: { winnerTakesAll: world.settings.winnerTakesAll, revoltMode: world.settings.revoltMode, ceMode: world.settings.ceMode }, player: world.settings.player, playerAi: world.playerAi, edits: { undo: world.edits.undo.length, redo: world.edits.redo.length }, ticker: tickerRows(world, (id) => this.nameOf(id), (v) => this.cityName(v), (d) => cities1938.cities[d]?.name ?? ''), news, strikes, world: this.worldNo, wings: playerWings(world), ...trackNext(world) }, []);
  }

  /**
   * Nation label curves (PLAN 1.29): re-derived when control changed, at most every
   * LABEL_INTERVAL_MS (a ~40 ms flood at M), and once after init or load. Real-map scenarios only.
   */
  private maybeLabels(nowMs: number): void {
    const sim = this.sim;
    if (!sim || !this.provinceNames) return;
    const world = sim.world;
    // Custom flags (PLAN 1.37b), after init/load and when changed.
    if (world.flagsVersion !== this.flagsSent) {
      this.flagsSent = world.flagsVersion;
      const custom = [...world.flags].sort((x, y) => x[0] - y[0]).map(([n, px]) => [n, encodeRuns(px)] as [number, number[]]);
      // The identities taken on the historical track (R62i4): whose flag a nation bears.
      const identities = [...world.identities].sort((x, y) => x[0] - y[0]);
      this.post({ type: 'flags', custom, identities }, []);
    }
    // Cities after editor edits (PLAN 1.36): dots and names follow.
    if (this.citiesSent >= 0 && world.citiesVersion !== this.citiesSent) {
      this.citiesSent = world.citiesVersion;
      const cities = this.cityList(world).map((c) => ({ id: c.id, name: c.name, x: c.x, y: c.y, size: c.size, capital: c.capitalOf !== 0 }));
      this.post({ type: 'cityLayer', cities }, []);
    }
    // Terrain after editor edits (PLAN 1.35): the renderer's terrain layer follows.
    if (world.terrainVersion !== this.terrainSent) {
      if (this.terrainSent >= 0) {
        const data = world.cells.terrain.slice();
        // The fine coastline comes from the original land mask: once land and water differ
        // from the start (map import, PLAN 1.37a) the renderer falls back to cell coasts.
        let landChanged = false;
        const start = this.startLand;
        if (start) for (let c = 0; c < data.length && !landChanged; c++) if ((data[c]! >= Terrain.Plains ? 1 : 0) !== start[c]) landChanged = true;
        this.post({ type: 'terrainLayer', data, landChanged }, [data.buffer]);
      }
      this.terrainSent = world.terrainVersion;
    }
    // Fallout for its map mode (PLAN 6.3c): when it changed (a burst, a day's decay, the last clean).
    const foDay = Math.floor(world.tick / 24);
    if ((world.fallout.size > 0 || this.falloutSent.cells > 0) && (foDay !== this.falloutSent.day || world.fallout.size !== this.falloutSent.cells)) {
      const sorted = [...world.fallout].sort((a, b) => a[0] - b[0]);
      const cells = Uint32Array.from(sorted.map(([c]) => c));
      const levels = Uint8Array.from(sorted.map(([, f]) => Math.max(1, Math.round(f * 255))));
      this.falloutSent = { day: foDay, cells: world.fallout.size };
      this.post({ type: 'fallout', cells, levels }, [cells.buffer, levels.buffer]);
    }
    // The bursts the sim remembers, a struck city's ruin (PLAN 7.11b): when a day passed or their count changed.
    if ((world.nukeBursts.length > 0 || this.ruinsSent.count > 0) && (foDay !== this.ruinsSent.day || world.nukeBursts.length !== this.ruinsSent.count)) {
      const bursts = Float32Array.from(world.nukeBursts.flatMap((b) => [b.x, b.y, (world.tick - b.tick) / 24, b.yieldN]));
      this.ruinsSent = { day: foDay, count: world.nukeBursts.length };
      this.post({ type: 'ruins', bursts }, [bursts.buffer]);
    }
    // Province unrest for the revolts map mode (cheap: a byte per province), when it changed.
    if (world.provinces.version !== this.unrestVersion && world.provinces.count > 0) {
      this.unrestVersion = world.provinces.version;
      const unrest = new Uint8Array(world.provinces.count);
      for (let p = 0; p < unrest.length; p++) unrest[p] = Math.round(world.provinces.unrest[p]!);
      this.post({ type: 'provinceStats', unrest }, [unrest.buffer]);
    }
    // Sea control for its map mode (PLAN 4.7a): the holders when they changed (daily at most),
    // and the zones of the cells with the first, or when the zones were made again. A world with
    // none (a load of a save in which no zone is held) is sent all held by none once, where the
    // page was shown holders (PLAN 4.8p).
    if (world.seaControl || this.seaShown) {
      const zones = seaOf(world);
      const holders = world.seaControl?.holder ?? new Uint16Array(zones.count + 1);
      const key = holders.join(',');
      if (zones !== this.seaZonesSent || key !== this.seaHoldersSent) {
        const holder = holders.slice();
        this.seaShown = holder.some((h) => h !== 0);
        const fresh = zones !== this.seaZonesSent ? zones.zoneOf.slice() : undefined;
        // With the zones, each one's sea by name (PLAN 4.10c): the legend names the zone under the cursor.
        const names = fresh ? Array.from({ length: zones.count + 1 }, (_, k) => (k === 0 ? '' : (world.seaSeeds[zones.seed[k]!]?.name ?? ''))) : undefined;
        if (fresh) this.post({ type: 'seaControl', holder, zones: fresh, names: names! }, [holder.buffer, fresh.buffer]);
        else this.post({ type: 'seaControl', holder }, [holder.buffer]);
        this.seaZonesSent = zones;
        this.seaHoldersSent = key;
      }
    }
    // Who holds the air of each air zone, for its map mode (PLAN 5.7c): at a day's first hour, or
    // the first look of a day a pump stepped past it in (PLAN 5.8n), when it changed, with the
    // zones of the cells the first time and after a load; once more all none where the page was
    // shown holders and none fly now.
    const day = Math.floor(world.tick / 24);
    const newDay = day !== this.airDay;
    this.airDay = day;
    if ((world.airPower.size > 0 || this.airShown) && (world.tick % 24 === 0 || newDay || this.airZonesSent === null)) {
      const zones = airOf(world);
      const holder = airHolders(world, zones.count);
      const key = holder.join(',');
      if (zones !== this.airZonesSent || key !== this.airHoldersSent) {
        this.airShown = holder.some((h) => h !== 0);
        const fresh = zones !== this.airZonesSent ? zones.zoneOf.slice() : undefined;
        if (fresh) this.post({ type: 'airControl', holder, zones: fresh }, [holder.buffer, fresh.buffer]);
        else this.post({ type: 'airControl', holder }, [holder.buffer]);
        this.airZonesSent = zones;
        this.airHoldersSent = key;
      }
    }
    const changed = world.controlChanges !== this.labelVersion || world.namesVersion !== this.labelNames;
    if (!changed || (this.lastLabelMs >= 0 && nowMs - this.lastLabelMs < LABEL_INTERVAL_MS)) return;
    this.lastLabelMs = nowMs;
    this.labelVersion = world.controlChanges;
    this.labelNames = world.namesVersion;
    const capitals = new Map<number, number>();
    const nc = world.nations.cols;
    world.nations.forEach((id) => {
      if (nc.living[id] === 1) capitals.set(id, Math.floor(nc.capitalY[id]!) * world.cells.w + Math.floor(nc.capitalX[id]!));
    });
    const data = deriveNationLabels(world.cells.controller, world.cells.w, world.cells.h, true, capitals);
    const names: string[] = [];
    for (let i = 0; i < data.length; i += LABEL_STRIDE) names.push(this.nameOf(data[i]!));
    this.post({ type: 'labels', data, names }, [data.buffer]);
  }

  /** Per-nation panel data and active wars (PLAN 1.31); `withDead` adds dead nations (inspect). */
  private buildStats(world: World, withDead: boolean): { nations: (NationStat & { living: boolean })[]; wars: WarStat[] } {
    const nc = world.nations.cols;
    const men = new Map<number, number>();
    const count = new Map<number, number>();
    const fc = world.formations.cols;
    world.formations.forEach((f) => {
      const n = fc.nation[f]!;
      men.set(n, (men.get(n) ?? 0) + fc.strength[f]!);
      count.set(n, (count.get(n) ?? 0) + 1);
    });
    // Each nation's air force (PLAN 5.11b): its wings and their aircraft.
    const aircraft = new Map<number, number>();
    const wings = new Map<number, number>();
    for (const [o] of world.wingBase) {
      if (!world.formations.has(o)) continue;
      const n = fc.nation[o]!;
      aircraft.set(n, (aircraft.get(n) ?? 0) + aircraftOf(world, o));
      wings.set(n, (wings.get(n) ?? 0) + 1);
    }
    // The most room for aircraft at an airbase each nation holds (PLAN 5.8v4), as `airfield` reckons it.
    const used = new Map<number, number>();
    for (const [o, b] of world.wingBase) if (b > 0 && world.formations.has(o)) used.set(b, (used.get(b) ?? 0) + wingAircraft(world, fc.template[o]!));
    const airRoom = new Map<number, number>();
    world.airbases.forEach((b, i) => {
      const n = world.cells.controller[b.cell]!;
      if (n !== 0) airRoom.set(n, Math.max(airRoom.get(n) ?? 0, airbaseRoom(b) - (used.get(i + 1) ?? 0)));
    });
    const queues = new Map<number, { template: number; readyDay: number }[]>();
    const pc = world.production.cols;
    world.production.forEach((p) => {
      const n = pc.nation[p]!;
      const q = queues.get(n) ?? [];
      q.push({ template: pc.template[p]!, readyDay: pc.readyDay[p]! });
      queues.set(n, q);
    });
    const lines = new Map<number, { tech: number; paid: number }[]>();
    const rc = world.research.cols;
    for (const r of world.research.ids()) {
      const n = rc.nation[r]!;
      const l = lines.get(n) ?? [];
      l.push({ tech: rc.tech[r]!, paid: rc.paid[r]! });
      lines.set(n, l);
    }
    const puppets = new Map<number, number[]>();
    const enemies = new Map<number, Set<number>>();
    const wars: WarStat[] = [];
    const fighting = warsWithBattle(world);
    for (const war of world.wars.list) {
      wars.push({ id: war.id, attackers: [...war.sides[0]], defenders: [...war.sides[1]], score: war.score, startTick: war.startTick, battle: fighting.has(war.id), toDeath: [war.fightToDeath[0], war.fightToDeath[1]], exhaustion: [war.exhaustion[0], war.exhaustion[1]] });
      for (const [a, b] of [[war.sides[0], war.sides[1]], [war.sides[1], war.sides[0]]] as const) {
        for (const x of a) {
          const set = enemies.get(x) ?? new Set<number>();
          for (const y of b) set.add(y);
          enemies.set(x, set);
        }
      }
    }
    world.nations.forEach((id) => {
      const o = nc.overlord[id]!;
      if (nc.living[id] === 1 && o !== 0) puppets.set(o, [...(puppets.get(o) ?? []), id]);
    });
    const land = landStandings(world);
    // Why each holder of warheads at war does not strike (PLAN 7.37f): its war whose best place weighs most.
    const industry = dayIndustry(world);
    const restraint = (id: number): NationStat['restraint'] => {
      if (nc.living[id] !== 1 || warheadsOf(world, id) < 1) return null;
      let best: { r: ReturnType<typeof restraintOf>; war: number } | null = null;
      for (const war of world.wars.list) {
        const side = war.sides[0].includes(id) ? 0 : war.sides[1].includes(id) ? 1 : -1;
        if (side < 0) continue;
        const r = restraintOf(world, id, war, side, industry);
        if (r.reason !== 'none' && (!best || r.u > best.r.u)) best = { r, war: war.id };
      }
      return best && best.r.reason !== 'none' ? { reason: best.r.reason, by: best.r.by, war: best.war } : null;
    };
    // The heroes (PLAN 7.184c): each row of the roster under its nation, alive (its formation) or gone (its return).
    const heroes = new Map<number, HeroStat[]>();
    if (world.heroRoster.length > 0) {
      const alive = new Map<number, number>();
      for (const [f, row] of world.heroes) alive.set(row, f);
      world.heroRoster.forEach((r, row) => {
        const f = alive.get(row) ?? 0;
        const back = world.heroReturn.get(row);
        const t = TEMPLATES_1938[r.template];
        const list = heroes.get(r.nation) ?? [];
        list.push({
          formation: f,
          nameKey: t ? `template.${t.id}` : '',
          sea: world.rules?.templates[r.template]?.domain === Domain.sea,
          health: f !== 0 ? heroHealth(world, f) : 0,
          returnDays: f !== 0 ? null : back === undefined ? 0 : Math.max(0, Math.ceil((back - world.tick) / 24)),
          ...(f === 0 && heroWaits(world, row) ? { waits: heroWaits(world, row)! } : {}),
        });
        heroes.set(r.nation, list);
      });
    }
    const nations: (NationStat & { living: boolean })[] = [];
    world.nations.forEach((id) => {
      if (!withDead && nc.living[id] !== 1) return;
      const al = world.alliances.allianceOf(id);
      const k = al ? al.members.indexOf(id) : -1;
      nations.push({
        id,
        name: this.nameOf(id),
        color: nc.color[id]!,
        cells: nc.cells[id]!,
        area: land.area[id]!,
        landShare: nc.living[id] === 1 && land.owned > 0 ? land.area[id]! / land.owned : 0,
        gold: nc.gold[id]!,
        income: nc.income[id]!,
        expenses: nc.expenses[id]!,
        incomeBonus: nc.incomeBonus[id]!,
        traits: nc.traits[id]!,
        bankrupt: nc.bankrupt[id] === 1,
        manpower: nc.manpower[id]!,
        men: men.get(id) ?? 0,
        formations: count.get(id) ?? 0,
        aircraft: aircraft.get(id) ?? 0,
        wings: wings.get(id) ?? 0,
        airLost: world.airTotals.get(id)?.lost ?? 0,
        bombed: world.airTotals.get(id)?.bombed ?? 0,
        nukeDead: world.nukeDead.get(id) ?? 0,
        fallout: falloutOf(world, id),
        efficiency: nc.efficiency[id]!,
        ceLocked: nc.ceLocked[id] === 1,
        alliance: al ? { id: al.id, name: al.nameKey, leader: al.leader, founder: al.founder, unity: al.unity, loyalty: al.loyalty[k] ?? 0, members: [al.leader, ...al.members.filter((m) => m !== al.leader)] } : null,
        overlord: nc.overlord[id]!,
        autonomy: nc.autonomy[id]!,
        loyalty: nc.loyalty[id]!,
        integration: nc.integration[id]!,
        puppets: puppets.get(id) ?? [],
        enemies: [...(enemies.get(id) ?? [])],
        truces: world.wars.truces.filter((t) => t.untilTick > world.tick && (t.a === id || t.b === id)).map((t) => ({ with: t.a === id ? t.b : t.a, days: Math.ceil((t.untilTick - world.tick) / 24) })),
        guarantees: world.alliances.guarantees.filter((g) => g.guarantor === id).map((g) => g.target),
        guarantors: world.alliances.guarantorsOf(id),
        aiOff: nc.aiOff[id] === 1,
        nukesAllowed: !world.nukesBanned.has(id),
        warheads: warheadsOf(world, id),
        canDeliver: canDeliver(world, id),
        means: warheadsOf(world, id) > 0 ? meansOf(world, id) : null,
        restraint: restraint(id),
        aggression: nc.aggression[id]!,
        incomeMult: nc.incomeMult[id]!,
        living: nc.living[id] === 1,
        queue: (queues.get(id) ?? []).sort((x, y) => x.readyDay - y.readyDay),
        techs: [nc.tech0[id]!, nc.tech1[id]!],
        shipyard: nc.living[id] === 1 && shipyard(world, id) >= 0,
        airRoom: nc.living[id] === 1 ? (airRoom.get(id) ?? 0) : 0,
        research: nc.research[id]! * DAYS_PER_MONTH,
        lines: lines.get(id) ?? [],
        ...(heroes.has(id) ? { heroes: heroes.get(id)! } : {}),
      });
    });
    return { nations, wars };
  }

  private terrainCounts(world: World): number[] {
    const counts = new Array<number>(TERRAIN_IDS.length).fill(0);
    const t = world.cells.terrain;
    for (let c = 0; c < t.length; c++) counts[t[c]!]!++;
    return counts;
  }

  /** Per formation: its strength and the men summed directly over its elements (PLAN 2.1 AT). */
  private formationMen(world: World): Inspection['formations'] {
    const men = new Map<number, number>();
    const count = new Map<number, number>();
    const ec = world.elements.cols;
    const units = world.rules?.units ?? [];
    world.elements.forEach((e) => count.set(ec.formation[e]!, (count.get(ec.formation[e]!) ?? 0) + 1));
    world.elements.forEach((e) => men.set(ec.formation[e]!, (men.get(ec.formation[e]!) ?? 0) + ec.strength[e]! * (units[ec.unit[e]!]?.menPerUnit ?? 0)));
    const out: Inspection['formations'] = [];
    const fc = world.formations.cols;
    world.formations.forEach((f) => out.push({ id: f, nation: fc.nation[f]!, strength: fc.strength[f]!, elementMen: Math.round(men.get(f) ?? 0), elements: count.get(f) ?? 0, x: fc.x[f]!, y: fc.y[f]!, wing: world.isWing(f) }));
    return out;
  }

  /** Every city with its display name: the scenario's, or the editor's (PLAN 1.36). */
  private cityList(world: World): { id: number; name: string; x: number; y: number; size: number; capitalOf: number }[] {
    const cc = world.cities.cols;
    const out: { id: number; name: string; x: number; y: number; size: number; capitalOf: number }[] = [];
    world.cities.forEach((id) => {
      const name = cities1938.cities[cc.def[id]!]?.name ?? world.cityNames.get(id);
      if (name !== undefined) out.push({ id, name, x: cc.x[id]!, y: cc.y[id]!, size: cc.size[id]!, capitalOf: cc.capitalOf[id]! });
    });
    return out;
  }

  /** The history log with a/b names resolved (PLAN 1.34a), as JSON `HistoryRow[]`. */
  private historyRows(): Uint8Array {
    const world = this.requireSim().world;
    return new TextEncoder().encode(JSON.stringify(historyRows(world, (id) => this.nameOf(id), (v) => this.cityName(v), (d) => cities1938.cities[d]?.name ?? '')));
  }

  /** A city row's plain name, '' when it has none. */
  private cityName(v: number): string {
    const world = this.requireSim().world;
    return cities1938.cities[world.cities.cols.def[v]!]?.name ?? world.cityNames.get(v) ?? '';
  }

  /** The name of the city nearest (x, y), '' with none. */
  private placeName(world: World, x: number, y: number): string {
    const city = nearestCity(world, x, y);
    return city !== 0 ? this.cityName(city) : '';
  }

  /**
   * Division `id`, thrown back, and those of its landing aboard its group (R52d: the group sails home with all aboard),
   * by id; none told so before (R53a).
   */
  private thrownWith(world: World, id: number): number[] {
    const l = this.landingOfDiv.get(id);
    if (l === undefined) return [];
    const fleet = world.embarked.get(id)?.fleet;
    const out = [id];
    if (fleet !== undefined) for (const [d, e] of world.embarked) if (d !== id && e.fleet === fleet && this.landingOfDiv.get(d) === l) out.push(d);
    return out.filter((d) => !this.thrownHome.has(d)).sort((a, b) => a - b);
  }

  /**
   * One formation for its panel (PLAN 2.14b), or null when there is none of that id. Asked with
   * a `generation`, null also when the id is another formation's by now (PLAN 2.16Ri).
   */
  private formationInfo(id: number, generation?: number): FormationDetail | null {
    const world = this.requireSim().world;
    if (!Number.isInteger(id) || id <= 0 || !world.formations.has(id)) return null;
    if (generation !== undefined && world.formations.generation[id] !== generation) return null;
    const fc = world.formations.cols;
    const ec = world.elements.cols;
    const template = fc.template[id]!;
    const rules = world.rules;
    // By unit type, in the order the type first has an element (the slots follow the template).
    const units = new Map<number, { nameKey: string; cls: string; elements: number; strength: number; size: number }>();
    for (const e of elementIndex(world).get(id) ?? []) {
      const u = ec.unit[e]!;
      let row = units.get(u);
      if (!row) {
        row = { nameKey: `unit.${UNIT_IDS_1938[u] ?? 'unknown'}`, cls: rules?.units[u]?.cls ?? '', elements: 0, strength: 0, size: 0 };
        units.set(u, row);
      }
      row.elements++;
      row.strength += ec.strength[e]!;
      row.size += rules?.units[u]?.size ?? 0;
    }
    // Where its block stands, as the snapshot has it (PLAN 3.11a).
    const pose = this.blockPose(world, id);
    const place = { x: pose.x, y: pose.y };
    // Where it fights: half way to the block of the enemy it faces (PLAN 3.11b); a fleet's, the
    // box of its ships and those of the enemy fleet it fights (PLAN 7.126).
    const fleet = world.isFleet(id);
    const enemy = fleet ? this.seaEnemyOf(world, id) : this.enemyOf(world, id);
    let fight: FormationDetail['fight'] = null;
    if (enemy > 0 && fleet) fight = this.seaFight(world, id, enemy);
    else if (enemy > 0) {
      const theirs = this.blockPose(world, enemy);
      const w = world.cells.w;
      // Brought back onto a map that loops, where a block may stand over the seam with its x unfolded (`slotPlace`).
      const dx = wrapDx(world, pose.x, theirs.x);
      fight = { x: (((pose.x + dx / 2) % w) + w) % w, y: (pose.y + theirs.y) / 2, enemy, span: [Math.abs(dx), Math.abs(theirs.y - pose.y)], sea: false };
    }
    return {
      id,
      generation: world.formations.generation[id]!,
      tick: world.tick,
      nation: fc.nation[id]!,
      template,
      full: rules?.templates[template] ? (ECONOMY_TABLES_1938.templateStrength[template] ?? 0) : 0,
      strength: fc.strength[id]!,
      ...(world.heroes.has(id) ? { health: heroHealth(world, id) } : {}),
      supply: fc.supply[id]!,
      org: fc.org[id]!,
      fuel: rules?.templates[template]?.fuel ?? 0,
      engaged: fc.engaged[id] === 1,
      moving: fc.moving[id] === 1,
      ...(fc.moving[id] === 1 ? { goal: fc.targetCell[id]! } : {}),
      retreat: fc.retreat[id]!,
      ...place,
      fight,
      units: [...units.values()],
      deck: fleet ? this.deckOf(world, id) : null,
      voyage: this.voyageOf(world, id),
      // The played nation's fleet on no order of the player's, its navy the AI's (ROADMAP R35d).
      ...(fleet && this.playerFleets.has(id) && fc.nation[id] === world.settings.player && aiRuns(world, fc.nation[id]!, AiLayer.navy) && !playerHeld(world, id) ? { aiRun: true as const } : {}),
    };
  }

  /** Forgets the player's landings as sent (a game opened or loaded; ROADMAP R47a). */
  private clearLandingRows(): void {
    this.landingsLast.clear();
    this.landingOfDiv.clear();
    this.landingEnds.clear();
    this.landingsOver.clear();
    this.landingClick.clear();
    this.landingsSent = '';
    this.landingsCancelled.clear();
  }

  /**
   * A click's orders that send all of a landing of the player's to its port's cell (ROADMAP R47c: its row's cancel, or
   * the same by hand): that landing, once over with none landed or lost, is told cancelled. The orders are the sim's
   * to judge as any click's (a landing at sea turns back; those gathering leave it).
   */
  private noteCancels(world: World, cmds: readonly Command[]): void {
    const w = world.cells.w;
    const to = new Map<number, number>();
    for (const c of cmds) if (c.kind === 'moveFormation') to.set(c.id, Math.floor(c.y) * w + Math.floor(c.x));
    if (to.size === 0) return;
    for (const l of world.landings.values()) {
      if (l.nation !== world.settings.player) continue;
      const port = world.ports[l.port]?.cell;
      const ids = [...l.divisions.keys()].filter((d) => world.formations.has(d));
      if (port !== undefined && ids.length > 0 && ids.every((d) => to.get(d) === port)) this.landingsCancelled.set(l.id, { home: ids.length, stopped: 0 });
    }
  }

  /**
   * A landing's cancel as the click a player could give (ROADMAP R48a; critic run 51, R51-N1 and the ADR-855 objection:
   * those ashore marched a week on to a port they never reached while the row said "back at Hamburg"): each division
   * aboard ordered to its port's cell, so the landing turns back; each ashore to where it stands, so it leaves the
   * landing and stops. The orders are the sim's to judge (`landingOrders`); noted for the row's outcome.
   */
  private cancelOrders(world: World, id: number): Command[] {
    const l = world.landings.get(id);
    const player = world.settings.player;
    if (!l || l.nation !== player) return [];
    const port = world.ports[l.port]!.cell;
    const w = world.cells.w;
    const c = world.formations.cols;
    const cmds: Command[] = [];
    let home = 0;
    let stopped = 0;
    for (const d of [...l.divisions.keys()].sort((a, b) => a - b)) {
      if (!world.formations.has(d)) continue;
      if (world.embarked.has(d)) {
        home++;
        cmds.push({ kind: 'moveFormation', id: d, x: (port % w) + 0.5, y: Math.floor(port / w) + 0.5, nation: player });
      } else {
        stopped++;
        cmds.push({ kind: 'moveFormation', id: d, x: c.x[d]!, y: c.y[d]!, nation: player });
      }
    }
    this.landingsCancelled.set(id, { home, stopped });
    return cmds;
  }

  /** Landing `id`'s click: as first seen, or the least of that and `now` (two clicks found one, R48f's siblings taken through). */
  private clickOf(id: number, now: number): number {
    const was = this.landingClick.get(id);
    const click = was === undefined ? now : Math.min(was, now);
    this.landingClick.set(id, click);
    return click;
  }

  /**
   * Where a division of a landing of the player's ended, from an event (ROADMAP R47a; R50a, critic run 52, R52-B1: a
   * sinking before it boarded was "lost at sea", a landing away from the target "landed"): ashore at its landing's
   * land (`landedAway` as the order news judges it) or away from it, thrown back, lost at sea with its transports, or
   * left ashore by the sinking of its landing's last transports (`TransportsSunk` with none to come: the landing over).
   */
  private endLanding(world: World, ev: ArrayLike<number>, i: number): void {
    const kind = ev[i + 1]!;
    const id = ev[i + 2]!;
    const l = this.landingOfDiv.get(id);
    if (l === undefined) return;
    const ends = this.landingEnds.get(l) ?? new Map<number, 'landed' | 'away' | 'repulsed' | 'lost' | 'stayed'>();
    if (kind === EventKind.FormationLanded) {
      // Thrown back, it stays so wherever it comes ashore after (ROADMAP R52a; critic run 53, R53-N1: the later landing
      // overwrote it, "over: 3 landed" beside two "thrown back").
      if (ends.get(id) === 'repulsed') {
        this.thrownAshore.set(id, this.placeName(world, ev[i + 4]!, ev[i + 5]!));
        return;
      }
      const [lx, ly] = this.landingsLast.get(l)?.land ?? [ev[i + 4]!, ev[i + 5]!];
      const away = landedAway(world, Math.floor(ly) * world.cells.w + Math.floor(lx), ev[i + 4]!, ev[i + 5]!);
      ends.set(id, away ? 'away' : 'landed');
      if (away) this.awayAshore.set(id, this.placeName(world, ev[i + 4]!, ev[i + 5]!));
    } else if (kind === EventKind.LandingRepulsed) {
      // Its group sails home with all aboard (`sailHome`): those of its landing on it are thrown back too, though the
      // event names one (critic run 53's replay on 23071: 271, aboard with 270, read "came ashore away").
      const fleet = world.embarked.get(id)?.fleet;
      // The port its transports sail home to (`sailHome`), for its row and panels until it is ashore (R53a).
      const port = fleet === undefined ? -1 : nearestOwnPort(world, fleet);
      const w = world.cells.w;
      const home = port < 0 ? '' : this.placeName(world, (port % w) + 0.5, Math.floor(port / w) + 0.5);
      ends.set(id, 'repulsed');
      for (const d of this.thrownWith(world, id)) {
        ends.set(d, 'repulsed');
        this.thrownHome.set(d, home);
      }
    }
    else if (kind === EventKind.LostAtSea) ends.set(id, 'lost');
    else if (kind === EventKind.TransportsSunk && ev[i + 4] === 0 && ends.get(id) !== 'lost') ends.set(id, 'stayed');
    else return;
    this.landingEnds.set(l, ends);
  }

  /**
   * The player's landings in rows (ROADMAP R47a; `LandingRow`), sent when they change: each from `landingRows`, its
   * divisions with what their panels say; one gone since the last hour is over, told how for a day.
   */
  private sendLandingRows(world: World): void {
    const player = world.settings.player;
    if (player === 0 && this.landingsLast.size === 0 && this.landingsOver.size === 0) return;
    const w = world.cells.w;
    const cell = (k: number): [number, number] => [(k % w) + 0.5, Math.floor(k / w) + 0.5];
    const rows: LandingRow[] = (player === 0 ? [] : landingRows(world, player)).map((r) => {
      const [lx, ly] = cell(r.land);
      const city = nearestCity(world, lx, ly);
      const name = city !== 0 ? this.cityName(city) : '';
      // Thrown back (R53a): how many, and home to where; all of it so, no days to land and no hold.
      const thrown = r.divisions.filter((id) => this.thrownHome.has(id));
      const all = thrown.length > 0 && thrown.length === r.divisions.length;
      // Already ashore from it (R55b): the next voyage's row says so; at its target, or away from it and where (R56b;
      // critic run 57, R57-N1: "4 of 6 ashore" for four thrown ashore near Palermo).
      const ended = [...(this.landingEnds.get(r.id)?.entries() ?? [])].filter(([d]) => !r.divisions.includes(d));
      const ashore = ended.filter(([, k]) => k === 'landed').length;
      const awayIds = ended.filter(([, k]) => k === 'away').map(([d]) => d);
      const awayPlaces = new Set(awayIds.map((d) => this.awayAshore.get(d) ?? ''));
      const awayAt = awayIds.length > 0 && awayPlaces.size === 1 && !awayPlaces.has('') ? { awayAt: [...awayPlaces][0]! } : {};
      return {
        id: r.id,
        state: r.state === LandingState.gathering ? 'gathering' : r.state === LandingState.sailing ? 'sailing' : 'returning',
        port: world.ports[r.port]?.name ?? '',
        target: name ? `=${name}` : '',
        land: [lx, ly],
        to: cell(r.target),
        portAt: cell(world.ports[r.port]?.cell ?? r.land),
        divisions: r.divisions.map((id) => ({ id, voyage: this.voyageOf(world, id) })),
        ships: { need: r.need, have: r.have, ...(r.voyages !== undefined ? { voyages: r.voyages } : {}) },
        sails: r.sailsIn ? { days: Math.max(1, Math.ceil(r.sailsIn.hours / 24)), ...(r.sailsIn.other !== undefined ? { other: world.ports[r.sailsIn.other]?.name ?? '' } : {}) } : null,
        ...(r.landsIn !== null && !all ? { lands: Math.max(1, Math.ceil(r.landsIn / 24)) } : {}),
        ...(thrown.length > 0 ? { thrown: { n: thrown.length, home: this.thrownHome.get(thrown[0]!)! } } : {}),
        ...(r.held && !all ? { held: true as const, ...(r.heldBy !== 0 ? { heldBy: this.nameOf(r.heldBy) } : {}) } : {}),
        ...(r.backIn !== null ? { back: Math.max(1, Math.ceil(r.backIn / 24)) } : {}),
        ...(ashore > 0 ? { ashore } : {}),
        ...(awayIds.length > 0 ? { away: awayIds.length, ...awayAt } : {}),
        click: this.clickOf(r.id, r.click),
      };
    });
    const now = new Set(rows.map((r) => r.id));
    for (const [id, last] of this.landingsLast) {
      if (now.has(id)) continue;
      const ends = [...(this.landingEnds.get(id)?.values() ?? [])];
      const n = (e: string): number => ends.filter((x) => x === e).length;
      const t = { landed: n('landed'), away: n('away'), repulsed: n('repulsed'), lost: n('lost'), stayed: n('stayed') };
      const cancel = this.landingsCancelled.get(id);
      const kind = t.landed > 0 ? 'landed' : t.away > 0 ? 'away' : t.repulsed > 0 ? 'repulsed' : t.lost > 0 ? 'lost' : t.stayed > 0 ? 'sunk' : last.state === 'returning' || cancel ? 'cancelled' : 'over';
      this.landingsCancelled.delete(id);
      // A turn back by a click of the player's own: all back (no row's cancel to count them).
      const how = kind === 'cancelled' ? { ...(cancel ?? { home: last.divisions.length, stopped: 0 }), ...(aiRuns(world, world.settings.player, AiLayer.army) ? { ai: true as const } : {}) } : null;
      // The thrown back all ashore at one place: named (R53a).
      const thrown = last.divisions.map((d) => d.id).filter((d) => this.landingEnds.get(id)?.get(d) === 'repulsed');
      const places = new Set(thrown.map((d) => this.thrownAshore.get(d) ?? ''));
      const ashore = places.size === 1 && !places.has('') ? { ashore: [...places][0]! } : {};
      // Those ashore away from the target all at one place: named too (R55h); those that left its row ashore with them
      // (R56b; critic run 57, 27125: "4 came ashore away from Valletta", the four gone from its row before its end).
      const endedIds = [...(this.landingEnds.get(id)?.keys() ?? [])];
      const awayPlaces = new Set(endedIds.filter((d) => this.landingEnds.get(id)?.get(d) === 'away').map((d) => this.awayAshore.get(d) ?? ''));
      const awayAt = t.away > 0 && awayPlaces.size === 1 && !awayPlaces.has('') ? { awayAt: [...awayPlaces][0]! } : {};
      for (const d of last.divisions) {
        this.thrownHome.delete(d.id);
        this.thrownAshore.delete(d.id);
        this.awayAshore.delete(d.id);
      }
      for (const d of endedIds) this.awayAshore.delete(d);
      // Its divisions' voyages were the landing's: over, they say nothing of it (their panels say where they are now).
      this.landingsOver.set(id, { ...last, state: 'over', sails: null, divisions: last.divisions.map((d) => ({ id: d.id, voyage: null })), outcome: { kind, tick: world.tick, landed: t.landed, lost: t.lost, ...(t.away > 0 ? { away: t.away } : {}), ...(t.repulsed > 0 ? { repulsed: t.repulsed } : {}), ...(t.stayed > 0 ? { stayed: t.stayed } : {}), ...(t.repulsed > 0 ? ashore : {}), ...awayAt, ...(how ?? {}) } });
      this.landingEnds.delete(id);
    }
    // An over part stays while its click has a part under way, and a day from its click's last end (R50b).
    const live = new Set(rows.map((r) => r.click));
    const lastEnd = new Map<number, number>();
    for (const r of this.landingsOver.values()) lastEnd.set(r.click, Math.max(lastEnd.get(r.click) ?? 0, r.outcome!.tick));
    for (const [id, r] of this.landingsOver) {
      if (live.has(r.click) || world.tick - lastEnd.get(r.click)! < 24) continue;
      this.landingsOver.delete(id);
      this.landingClick.delete(id);
    }
    this.landingsLast = new Map(rows.map((r) => [r.id, r]));
    this.landingOfDiv = new Map(rows.flatMap((r) => r.divisions.map((d) => [d.id, r.id] as [number, number])));
    const all = [...rows, ...this.landingsOver.values()].sort((a, b) => a.id - b.id);
    const key = JSON.stringify(all);
    if (key === this.landingsSent) return;
    this.landingsSent = key;
    this.post({ type: 'landings', rows: all }, []);
  }

  /** Formation `id`'s voyage for its panel (ROADMAP R17c, R33b: read from its landing; `FormationDetail.voyage`). */
  private voyageOf(world: World, id: number): FormationDetail['voyage'] {
    const v = voyageOf(world, id);
    // Thrown back: sailing home, to where (R53a; critic run 54, R54-B1: "At sea, bound for its landing").
    const home = this.thrownHome.get(id);
    if (v?.state === 'atSea' && home !== undefined) return { ...v, thrownTo: home };
    if (v?.state === 'atSea') {
      // Its landing held at sea: by whom, as its row says (R52c).
      const l = landingOfDivision(world, id);
      const by = l ? heldBy(world, l) : 0;
      if (by !== 0) return { ...v, heldBy: this.nameOf(by) };
    }
    if (v) return v;
    // In no landing of the player's: the AI's own voyage, its nation's AI (ROADMAP R48b; critic run 51, R51-N2: a
    // cancelled division the AI shipped off read "bound for its landing", and no row stood for it). Said so for the
    // played nation's; another nation's is its AI's in any case.
    const ai = world.formations.cols.nation[id] === world.settings.player && world.settings.player !== 0 ? { ai: true as const } : {};
    if (world.embarked.has(id)) return { state: 'atSea', port: null, ...ai };
    if (world.seaBound.has(id)) return { state: world.formations.cols.moving[id] === 1 ? 'toPort' : 'waiting', port: null, ...ai };
    const at = this.landedAt.get(id);
    return at !== undefined && world.tick - at < 24 ? { state: 'landed', port: null } : null;
  }

  /**
   * The snapshot's holds (ROADMAP R53e; `Snapshot.holds`): each landing of the player's at sea with a group held, the
   * group's place and the foe fleet's that holds it (`heldByFleet`, the one its row names), HOLD_STRIDE each.
   */
  private holds(world: World): number[] {
    const out: number[] = [];
    const player = world.settings.player;
    if (player === 0) return out;
    const c = world.formations.cols;
    for (const l of [...world.landings.values()].sort((a, b) => a.id - b.id)) {
      if (l.nation !== player || l.state !== LandingState.sailing) continue;
      const h = heldByFleet(world, l);
      if (h !== 0) out.push(c.x[h.group]!, c.y[h.group]!, c.x[h.fleet]!, c.y[h.fleet]!, c.nation[h.fleet]!, l.id);
    }
    return out;
  }

  /**
   * The snapshot's corridors (ROADMAP R53e; `Snapshot.corridors`): each breakthrough corridor in force, its start, way,
   * length and half width (`atSize`), nation and days left, CORRIDOR_STRIDE each.
   */
  private corridors(world: World): number[] {
    const out: number[] = [];
    for (const c of world.battles.corridors) {
      if (c.untilTick <= world.tick) continue;
      out.push(c.x, c.y, c.dx, c.dy, world.atSize(CORRIDOR_LEN), world.atSize(CORRIDOR_HALF_WIDTH), c.nation, (c.untilTick - world.tick) / 24);
    }
    return out;
  }

  /** The snapshot's voyages (ROADMAP R17c; `Snapshot.voyages`): the player's landings' divisions marching to their port or waiting there, and those at sea. */
  private voyages(world: World): number[] {
    const out: number[] = [];
    const w = world.cells.w;
    const c = world.formations.cols;
    const water = portSeaOf(world);
    const at = (k: number): [number, number] => [(k % w) + 0.5, Math.floor(k / w) + 0.5];
    for (const l of [...world.landings.values()].sort((a, b) => a.id - b.id)) {
      if (water[l.port]! < 0) continue;
      for (const id of [...l.divisions.keys()].sort((a, b) => a - b)) {
        if (!world.formations.has(id) || world.embarked.has(id) || l.state !== LandingState.gathering) continue;
        out.push(id, c.moving[id] === 1 ? VoyageState.toPort : VoyageState.waiting, ...at(water[l.port]!), ...at(l.water), ...at(l.land));
      }
    }
    for (const [id, e] of [...world.embarked].sort((a, b) => a[0] - b[0])) {
      if (e.water < 0 || !world.formations.has(e.fleet)) continue;
      out.push(id, VoyageState.atSea, c.x[e.fleet]!, c.y[e.fleet]!, ...at(e.water), ...at(e.land));
    }
    return out;
  }

  /** A fleet's carriers afloat and the wings based on them (PLAN 7.151; `FormationDetail.deck`), null with none. */
  private deckOf(world: World, fleet: number): FormationDetail['deck'] {
    const carriers = liveCarriers(world, fleet);
    if (carriers === 0) return null;
    const ec = world.elements.cols;
    const els = elementIndex(world);
    const wings = [...world.wingBase]
      .filter(([w, b]) => b === -fleet && world.formations.has(w))
      .map(([w]) => w)
      .sort((a, b) => a - b)
      .map((w) => {
        const mine = els.get(w) ?? [];
        const first = mine.find((e) => ec.strength[e]! > 0) ?? mine[0];
        return {
          id: w,
          nameKey: `unit.${(first === undefined ? undefined : UNIT_IDS_1938[ec.unit[first]!]) ?? 'unknown'}`,
          aircraft: mine.reduce((t, e) => t + ec.strength[e]!, 0),
          mission: world.wingMission.get(w)?.kind ?? null,
          flying: world.sorties.has(w),
        };
      });
    return { carriers, wings };
  }

  /** JSON summary of the world for tests and the critic (PLAN 1.32). */
  /** `full` adds the bulky parts (cities, cores, unrest: ~600 KB on the 1938 map). */
  private inspect(full = false): Uint8Array {
    const world = this.requireSim().world;
    const { nations, wars } = this.buildStats(world, true);
    const out: Inspection = {
      tick: world.tick,
      seed: world.seed,
      settings: { ...world.settings },
      playerAi: world.playerAi,
      playerOrders: [...world.playerOrders.keys()].sort((a, b) => a - b),
      nations,
      wars,
      alliances: world.alliances.list.map((a) => ({ id: a.id, name: a.nameKey, leader: a.leader, members: [...a.members], unity: a.unity })),
      buffs: world.buffs.list.map((b) => ({ id: b.id, kind: b.kind, targetKind: b.targetKind, target: b.target, magnitude: b.magnitude, until: b.expiresTick })),
      majors: world.battles.majors.map((m) => ({ id: m.id, camps: [[...m.camps[0]], [...m.camps[1]]] })),
      corridors: world.battles.corridors.length,
      unrest: full ? Array.from(world.provinces.unrest, (u) => Math.round(u * 100) / 100) : [],
      terrainCounts: this.terrainCounts(world),
      rasters: { owner: xxhash32View(world.cells.owner), controller: xxhash32View(world.cells.controller), terrain: xxhash32View(world.cells.terrain) },
      edits: { undo: world.edits.undo.length, redo: world.edits.redo.length },
      cities: full ? this.cityList(world) : [],
      formations: full ? this.formationMen(world) : [],
      cores: !full ? [] : Array.from({ length: Math.max(0, world.provinces.count - 1) }, (_, i) => ({ province: i + 1, nations: world.provinces.coresOf(i + 1) })).filter((c) => c.nations.length > 0),
    };
    return new TextEncoder().encode(JSON.stringify(out));
  }

  /**
   * i18n key of a nation of the scenario's table, or a literal ('=…') name: of a nation founded
   * in the game, or of one whose scenario has no table (PLAN 2.16b; their names are in
   * `world.names` from the start).
   */
  private nameOf(id: number): string {
    const sim = this.requireSim();
    const custom = sim.world.names.get(id);
    if (custom !== undefined) return `=${custom}`; // God Mode rename (PLAN 1.32)
    // A name taken on the historical track (R62i4).
    const as = sim.world.identities.get(id);
    if (as !== undefined) return `nation.${as}`;
    // The tables there are, 1938's and the historical track's (1938's and its own after them, R62a), name the nations
    // of the scenarios with their tags.
    const def = SCENARIO_INFO[sim.scenario].nationTags[id - 1] !== undefined ? NATIONS_1938H[id - 1] : undefined;
    if (def) return def.nameKey;
    const origins = sim.world.nations.cols.origin;
    return `=${foundedName(id, origins[id] ?? 0, this.provinceNames, foundedNth(id, origins, this.provinceNames))}`;
  }

  /**
   * Steps `n` ticks; with `atStrike`, stops after a tick that logged a nuclear strike (PLAN
   * 7.109a): the statistics with its alert go at once, not up to a second later (155 game hours at
   * Max, the critic's run 13), and with the setting on the game pauses on that tick. Returns `n`,
   * or minus the ticks stepped when a strike stopped it.
   */
  private advance(n: number, atStrike = false): number {
    const sim = this.requireSim();
    for (let i = 0; i < n; i++) {
      this.snapshotPrev(sim.world);
      const from = sim.world.history.length;
      sim.step(1, (w) => this.drainEvents(w));
      if (atStrike && struckSince(sim.world, from)) {
        if (this.nukePause) this.paused = true;
        this.statsTick = -1;
        this.lastStatsMs = -1;
        this.forceSend = true;
        return -(i + 1);
      }
    }
    return n;
  }

  private snapshotPrev(world: World): void {
    const f = world.formations;
    if (this.prevX.length < f.capacity) {
      this.prevX = new Float64Array(f.capacity);
      this.prevY = new Float64Array(f.capacity);
      this.prevAlive = new Uint8Array(f.capacity);
      this.prevGeneration = new Uint32Array(f.capacity);
    }
    this.prevX.set(f.cols.x.subarray(0, f.highWater));
    this.prevY.set(f.cols.y.subarray(0, f.highWater));
    this.prevAlive.set(f.alive.subarray(0, f.highWater));
    this.prevGeneration.set(f.generation.subarray(0, f.highWater));
  }

  /**
   * Whether formation `id` has no place of a tick ago: it was created during the last tick. By
   * the id alone that cannot be told (PLAN 2.7o): freed ids are given out again, the last freed
   * first, so a formation made in the step in which another died has that one's id, and was
   * sent with that one's place as the place it came from.
   */
  private born(world: World, id: number): boolean {
    return id >= this.prevAlive.length || this.prevAlive[id] !== 1 || this.prevGeneration[id] !== world.formations.generation[id];
  }

  /**
   * The enemy a formation in contact faces, for its panel's fight and the snapshot (PLAN 3.11b,
   * 7.34d): the one combat paired it with this hour (`contactsOf`); when that one is gone since
   * (died later in the hour), the nearest live enemy on land within `CONTACT_CELLS`, the one the
   * next hour pairs it with (the lower id on a tie). 0 when none is in reach, or not in contact.
   */
  private enemyOf(world: World, id: number): number {
    const fc = world.formations.cols;
    if (fc.engaged[id] !== 1) return 0;
    const held = contactsOf(world).get(id);
    if (held !== undefined && world.formations.has(held)) return held;
    const reach = world.atSize(CONTACT_CELLS);
    let best = 0;
    let bestD = Infinity;
    world.formations.forEach((o) => {
      if (o === id || world.offLand(o) || world.isWing(o) || world.isFleet(o) || !world.wars.atWar(fc.nation[id]!, fc.nation[o]!)) return;
      const d = cellDist(world, fc.x[id]!, fc.y[id]!, fc.x[o]!, fc.y[o]!);
      if (d <= reach && (d < bestD || (d === bestD && o < best))) {
        best = o;
        bestD = d;
      }
    });
    return best;
  }

  /**
   * The enemy fleet a fleet in a sea battle fights, for its panel's fight (PLAN 7.126): of the
   * fleets of its battle's record (`world.seaBattles`) at war with it, the nearest (the lower id
   * on a tie). 0 when it is not in contact or its battle has none left. `enemyOf` pairs land
   * formations alone (`contactsOf`, ADR-337), and a fleet's panel had no way to its battle.
   */
  private seaEnemyOf(world: World, id: number): number {
    const fc = world.formations.cols;
    if (fc.engaged[id] !== 1) return 0;
    const rec = world.seaBattles.find((b) => b.fleets.includes(id));
    if (!rec) return 0;
    let best = 0;
    let bestD = Infinity;
    for (const o of rec.fleets) {
      if (o === id || !world.formations.has(o) || !world.isFleet(o) || !world.wars.atWar(fc.nation[id]!, fc.nation[o]!)) continue;
      const d = cellDist(world, fc.x[id]!, fc.y[id]!, fc.x[o]!, fc.y[o]!);
      if (d < bestD || (d === bestD && o < best)) {
        best = o;
        bestD = d;
      }
    }
    return best;
  }

  /**
   * A fleet's fight (PLAN 7.126): the box of the ships of fleet `id` and of `enemy`, where the
   * view draws them (`elementSection`: each on its slot about its block), its middle and its
   * cells across, east-west and north-south; the panel's way to it frames the box as a sea
   * battle's row does (`MapView.showSeaBattle`).
   */
  private seaFight(world: World, id: number, enemy: number): NonNullable<FormationDetail['fight']> {
    const pose = this.blockPose(world, id);
    let [x0, x1, y0, y1] = [0, 0, 0, 0];
    const idx = elementIndex(world);
    for (const f of [id, enemy]) {
      const list = idx.get(f) ?? [];
      const at = this.blockPose(world, f);
      const slots = slotCount(world, f, list.length);
      const places: [number, number][] = [[at.x, at.y]];
      for (const e of list) places.push(slotPlace(world, at.x, at.y, at.facing, world.elements.cols.slot[e]!, slots, at.deployed ? e : undefined));
      for (const [px, py] of places) {
        const dx = wrapDx(world, pose.x, px);
        const dy = py - pose.y;
        [x0, x1, y0, y1] = [Math.min(x0, dx), Math.max(x1, dx), Math.min(y0, dy), Math.max(y1, dy)];
      }
    }
    const w = world.cells.w;
    return { x: (((pose.x + (x0 + x1) / 2) % w) + w) % w, y: pose.y + (y0 + y1) / 2, enemy, span: [x1 - x0, y1 - y0], sea: true };
  }

  /**
   * Where the block of formation `f` stands now and where it stood an hour ago, and what it
   * faced (PLAN 2.14c1, 3.11a): the one place of a formation's block for everything the view
   * is sent, the formation section and the panel as well as the elements. A formation in contact holds its place
   * in the rules, and its block is deployed against the enemy (`deployOf`), up to
   * `DEPLOY_REACH` from there: in the hour the contact begins the block goes from the
   * formation's place to the line, when the enemy it faces changes it goes to the new line,
   * and when the contact ends it comes back: each in the one hour's move the view draws. The
   * sim keeps the deployments of the hour before (`deployedBefore`); where it has none (a
   * load, a command) nothing moves.
   */
  private blockPose(world: World, f: number): { x: number; y: number; facing: number; prevX: number; prevY: number; prevFacing: number; deployed: boolean; prevDeployed: boolean } {
    const c = world.formations.cols;
    const fx = c.x[f]!;
    const fy = c.y[f]!;
    const born = this.born(world, f);
    const at = c.engaged[f] === 1 ? deployOf(world, f, slotCount(world, f, elementIndex(world).get(f)?.length ?? 0)) : null;
    const before = world.deployedBefore ? (world.deployedBefore.get(f) ?? null) : at;
    // Not in contact: on its place, or a block's width to the side of one of its nation that
    // stands there (PLAN 7.4f38, `fileOffsets`); as it stood at the snapshot before, an hour ago.
    const { now: files, before: filesBefore } = this.filesOf(world);
    const off = at ? undefined : files.get(f);
    const offBefore = filesBefore.get(f) ?? off;
    const x = at ? at.x : fx + (off?.[0] ?? 0);
    const y = at ? at.y : fy + (off?.[1] ?? 0);
    const facing = at ? at.facing : c.facing[f]!;
    // Whether the block is deployed, now and an hour ago: its elements then stand off their slots (PLAN 3.11c4).
    const deployed = at !== null;
    if (before && !born) return { x, y, facing, prevX: before.x, prevY: before.y, prevFacing: before.facing, deployed, prevDeployed: true };
    // A formation created during the last tick has no place of a tick ago: the one of now.
    return { x, y, facing, prevX: born ? x : this.prevX[f]! + (offBefore?.[0] ?? 0), prevY: born ? y : this.prevY[f]! + (offBefore?.[1] ?? 0), prevFacing: facing, deployed, prevDeployed: born && deployed };
  }

  /** The file offsets of the world's tick (`fileOffsets`), computed once a tick, and those of the tick before that had them. */
  private files: { world: World; tick: number; now: Map<number, [number, number]>; before: Map<number, [number, number]> } | null = null;
  private filesOf(world: World): { now: Map<number, [number, number]>; before: Map<number, [number, number]> } {
    const f = this.files;
    if (f && f.world === world && f.tick === world.tick) return f;
    const before = f && f.world === world && f.tick === world.tick - 1 ? f.now : new Map<number, [number, number]>();
    this.files = { world, tick: world.tick, now: fileOffsets(world), before };
    return this.files;
  }

  /**
   * For an editor's wing refused for want of an airbase (PLAN 7.24b): the nearest of its nation's
   * with room for it, by name, and its km from the click; null where it holds none, undefined for
   * any other refusal. Read from the command log by the command's `seq`; it changes nothing.
   */
  private baseFor(world: World, seq: number, why: number): { name: string; km: number } | null | undefined {
    if (why !== Refusal.NoAirbase) return undefined;
    const log = world.commandLog;
    for (let k = log.length - 1; k >= 0; k--) {
      const cmd = log[k]!.cmd;
      if (log[k]!.seq !== seq) continue;
      if (cmd.kind !== 'spawnWing') return undefined;
      const near = nearestWingBase(world, cmd.nation, cmd.template, cmd.x, cmd.y);
      return near ? { name: world.airbases[near.base]!.name, km: Math.round(near.km) } : null;
    }
    return undefined;
  }

  private drainEvents(world: World): void {
    // The fleets on a player's order this hour, remembered (ROADMAP R35d): one released later is told back with the AI.
    for (const id of world.playerOrders.keys()) if (world.isFleet(id)) this.playerFleets.add(id);
    const ev = world.out.events;
    let sentFirst = -1;
    for (let i = 0; i < ev.length; i += 6) {
      let b = ev[i + 3]!;
      // A refusal goes to the page at once and whatever it looks at: the panel that sent the
      // command says why (PLAN 2.17a).
      if (ev[i + 1] === EventKind.CommandRefused) this.post({ type: 'refused', reason: b, base: this.baseFor(world, ev[i + 2]!, b) }, []);
      if (this.ordered.size > 0) this.orderNews(world, ev, i);
      if (this.landingOfDiv.size > 0) this.endLanding(world, ev, i);
      // The player's formations set home across the sea (ROADMAP R20, R21d): told, ordered or not,
      // by one row for the day start's all (`FormationsSentHome` follows theirs), naming the first.
      if (ev[i + 1] === EventKind.FormationSentHome && b !== 0 && b === world.settings.player && sentFirst < 0) sentFirst = ev[i + 2]!;
      if (ev[i + 1] === EventKind.FormationsSentHome && sentFirst >= 0) {
        const c = world.formations.cols;
        this.post({ type: 'orderNews', news: { kind: 'sentHome', id: sentFirst, nation: ev[i + 2]!, reason: b, x: c.x[sentFirst]!, y: c.y[sentFirst]!, tick: ev[i]! } }, []);
        sentFirst = -1;
      }
      if (ev[i + 1] === EventKind.ElementDestroyed) {
        // The end of an element is for a view that draws elements (PLAN 2.4b); it gets what the
        // unit leaves behind in place of the unit.
        if (!this.drawsElements()) continue;
        b = wreckOf(world.rules?.units[b]?.cls ?? 'inf');
      }
      this.eventQueue.push(this.nextEventSeq++, ev[i]!, ev[i + 1]!, ev[i + 2]!, b, ev[i + 4]!, ev[i + 5]!);
    }
    ev.length = 0;
    // A wing's order or a paradrop told nothing of in its hour was given (PLAN 5.8v3): what the
    // formation was ordered before stands again, as after a refusal.
    for (const [id, o] of this.ordered) {
      if (o.once === undefined || o.once >= world.tick) continue;
      if (o.before === undefined) this.ordered.delete(id);
      else this.ordered.set(id, { target: o.before, before: undefined });
    }
    this.drainFires(world);
    this.sendLandingRows(world);
    const over = this.eventQueue.length / EVENT_STRIDE - EVENT_QUEUE_CAP;
    if (over > 0) {
      this.eventQueue.splice(0, over * EVENT_STRIDE);
      this.droppedEvents += over;
    }
  }

  /**
   * What became of a player's order (PLAN 4.9c), told at once: a refusal with its reason, a
   * landing thrown back, troops ashore more than `AT_PORT_CELLS` from the order's cell. A refused
   * order leaves the one before it standing (the sim changes nothing then: a division aboard keeps
   * its voyage), and that one is told on; the order is forgotten at a landing, at an arrival on
   * land (not one refused in its hour: at the port it marched to, ROADMAP R22a) and at the
   * formation's end.
   */
  private orderNews(world: World, ev: number[], i: number): void {
    const kind = ev[i + 1]!;
    const id = ev[i + 2]!;
    const kept = this.ordered.get(id);
    if (kept === undefined) return;
    const target = kept.target;
    const c = world.formations.cols;
    const tell = (k: OrderNews['kind'], reason: number, of = id, more: Partial<OrderNews> = {}): void => {
      const has = world.formations.has(of);
      this.post({ type: 'orderNews', news: { kind: k, id: of, nation: has ? c.nation[of]! : ev[i + 3]!, reason, x: has ? c.x[of]! : ev[i + 4]!, y: has ? c.y[of]! : ev[i + 5]!, tick: ev[i]!, ...more } }, []);
    };
    if (kind === EventKind.MoveRejected) {
      tell('refused', ev[i + 4]!);
      if (kept.before === undefined) this.ordered.delete(id);
      else this.ordered.set(id, { target: kept.before, before: undefined });
    } else if (kind === EventKind.LandingRepulsed) {
      // Each of its landing aboard the group sent home, not only the one the event names (R53a; critic run 54, R54-B1:
      // 321 was never told).
      const all = this.landingOfDiv.has(id) ? this.thrownWith(world, id) : [id];
      for (const d of all) tell('repulsed', 0, d);
    } else if (kind === EventKind.ConvoyUnescorted) {
      tell('unescorted', 0);
    } else if (kind === EventKind.LeftLanding) {
      // For another landing, or for a march (reason 1: no landing of its own now; ROADMAP R55e).
      tell('leftLanding', world.formations.has(id) && landingOfDivision(world, id) === undefined ? 1 : 0);
    } else if (kind === EventKind.NextVoyage) {
      // Still marching as its landing sailed: 1 (ROADMAP R57b), else at the port with no room: 0. When: the later of
      // its march and its landing's groups back at the port (ROADMAP R58b; critic run 59, R59-N1: no figure).
      const marching = world.formations.has(id) && c.moving[id] === 1;
      const l = world.formations.has(id) ? landingOfDivision(world, id) : undefined;
      const hours = l ? Math.max(nextVoyageHours(world, l), marching ? marchHoursLeft(world, id) : 0) : Infinity;
      tell('nextVoyage', marching ? 1 : 0, id, Number.isFinite(hours) ? { days: Math.max(1, Math.ceil(hours / 24)) } : {});
    } else if (kind === EventKind.LostAtSea) {
      tell('lostAtSea', 0);
    } else if (kind === EventKind.TransportsSunk) {
      tell('transportsSunk', ev[i + 4]!);
    } else if (kind === EventKind.FormationLanded) {
      this.landedAt.set(id, ev[i]!);
      // Thrown back, ashore where its transports put in: so told, not "landed away" (R53a).
      if (this.thrownHome.has(id)) tell('thrownAshore', 0, id, { at: this.placeName(world, ev[i + 4]!, ev[i + 5]!) });
      else if (landedAway(world, target, ev[i + 4]!, ev[i + 5]!)) tell('landedAway', 0, id, { at: this.placeName(world, ev[i + 4]!, ev[i + 5]!) });
      this.ordered.delete(id);
    } else if (kind === EventKind.FormationDestroyed || (kind === EventKind.FormationArrived && !world.seaBound.has(id) && landingOfDivision(world, id) === undefined && !world.afloat(id) && !refusedLater(ev, i, id))) {
      this.ordered.delete(id);
    }
  }

  /**
   * Whether the subscription draws elements, and with them their fire and their ends (PLAN 2.3,
   * 2.4): from tier 1.5, where the sprites come in.
   */
  private drawsElements(): boolean {
    return this.sub.wantsElements && this.sub.tier >= 1.5;
  }

  /**
   * Whether the subscription is sent elements (PLAN 7.21c1): from T1, where a formation's marker
   * shows its elements (ADR-498). Their fire is for a view that draws them (`drawsElements`).
   */
  private sendsElements(): boolean {
    return this.sub.wantsElements && this.sub.tier >= 1;
  }

  /**
   * Fire events (PLAN 2.4) for a view that draws elements: those with an end inside the
   * subscribed bbox when they happen, the shooter's weapon in place of its unit. Any other view
   * gets none and none are kept, so a strategic zoom pays nothing. Read-only on the sim (I4).
   *
   * The target of every shot is kept for such a view, in the box or not (PLAN 3.6e5): a
   * formation is sent whole, and an element of it outside the box is fired at from outside it.
   */
  private drainFires(world: World): void {
    const fires = world.out.fires.data;
    const units = world.rules?.units;
    if (units && this.drawsElements()) {
      const q = this.fireQueue;
      for (let i = 0; i < world.out.fires.length; i += FIRE_STRIDE) {
        this.firedAt.add(fires[i + FireField.target]!);
        const from = this.inBbox(fires[i + FireField.x0]!, fires[i + FireField.y0]!, world);
        if (!from && !this.inBbox(fires[i + FireField.x1]!, fires[i + FireField.y1]!, world)) continue;
        // A torpedo's record has −1 − its unit type (PLAN 4.7c).
        for (let c = 0; c < FIRE_STRIDE; c++) q.push(c === FireField.weapon ? (fires[i + c]! < 0 ? Weapon.torpedo : weaponOf(units[fires[i + c]!]?.cls ?? 'inf')) : fires[i + c]!);
      }
      const over = q.length / FIRE_STRIDE - FIRE_QUEUE_CAP;
      if (over > 0) {
        q.splice(0, over * FIRE_STRIDE);
        this.droppedFires += over;
      }
    }
    world.out.fires.length = 0;
  }

  /**
   * Elements of the formations whose block reaches into the subscribed bbox (PLAN 2.3): only
   * when the subscription wants them at tier ≥ 1 (PLAN 7.21c1; ≥ 1.5 before). Read-only: never
   * touches sim state (I4).
   *
   * By the block and not by the formation's centre (PLAN 2.7n1): at the closest zooms the box
   * is smaller than a division, and a view on a division's flank got nothing of it. A formation
   * is sent whole or not at all.
   */
  private elementSection(world: World, buffers: ArrayBuffer[]): SnapshotElements {
    const ft = world.formations;
    const picked: number[] = [];
    let total = 0;
    let truncated = false;
    const idx = this.sendsElements() && world.rules ? elementIndex(world) : null;
    if (idx) {
      ft.forEach((f) => {
        if (truncated || world.isWing(f)) return; // an air wing is not drawn yet (PLAN 5.1d)
        const list = idx.get(f);
        if (!list) return;
        // By where its block stands: at the formation's place, or deployed against the enemy (PLAN 2.14c1).
        const slots = slotCount(world, f, list.length);
        const at = deployOf(world, f, slots);
        if (!this.inBbox(at ? at.x : ft.cols.x[f]!, at ? at.y : ft.cols.y[f]!, world, blockReach(slots, world.atSize(SLOT_SPACING)))) return;
        if (total + list.length > MAX_SNAPSHOT_ELEMENTS) {
          truncated = true;
          return;
        }
        picked.push(f);
        total += list.length;
      });
    }
    // Nothing to send (T0, or no formations in view): empty arrays, no pooled buffers.
    if (total === 0) return { ...EMPTY_ELEMENTS, truncated };
    const id = this.view(Uint32Array, total, buffers);
    const formation = this.view(Uint32Array, total, buffers);
    const nation = this.view(Uint16Array, total, buffers);
    const frame = this.view(Uint8Array, total, buffers);
    const strength = this.view(Uint16Array, total, buffers);
    const size = this.view(Uint16Array, total, buffers);
    const x = this.view(Float64Array, total, buffers);
    const y = this.view(Float64Array, total, buffers);
    const prevX = this.view(Float64Array, total, buffers);
    const prevY = this.view(Float64Array, total, buffers);
    const facing = this.view(Float32Array, total, buffers);
    const flags = this.view(Uint8Array, total, buffers);
    const hit = this.view(Uint8Array, total, buffers);
    const ec = world.elements.cols;
    const units = world.rules?.units ?? [];
    let j = 0;
    for (const f of picked) {
      const list = idx!.get(f)!;
      const fl = (ft.cols.moving[f] === 1 ? FormationFlag.moving : 0) | (ft.cols.engaged[f] === 1 ? FormationFlag.engaged : 0);
      // The block as the template made it: an element keeps its slot when others die (PLAN 2.7a).
      const slots = slotCount(world, f, list.length);
      // Where the block stands now and where it stood an hour ago (`blockPose`).
      const { x: bx, y: by, facing: fa, prevX: qcx, prevY: qcy, prevFacing: qfa, deployed, prevDeployed } = this.blockPose(world, f);
      for (const e of list) {
        const slot = ec.slot[e]!;
        // In a deployed block an element stands off its slot and is turned off the block's facing, by its id (PLAN 3.11c4).
        const [cx, cy] = slotPlace(world, bx, by, fa, slot, slots, deployed ? e : undefined);
        const [qx, qy] = slotPlace(world, qcx, qcy, qfa, slot, slots, prevDeployed ? e : undefined);
        id[j] = e;
        formation[j] = f;
        nation[j] = ft.cols.nation[f]!;
        frame[j] = frameOf(units[ec.unit[e]!]?.cls ?? 'inf');
        strength[j] = ec.strength[e]!;
        size[j] = units[ec.unit[e]!]?.size ?? ec.strength[e]!;
        x[j] = cx;
        y[j] = cy;
        prevX[j] = qx;
        prevY[j] = qy;
        facing[j] = elementFacing(fa, deployed, e);
        flags[j] = fl;
        hit[j] = this.firedAt.has(e) ? 1 : 0;
        j++;
      }
    }
    return { count: total, id, formation, nation, frame, strength, size, x, y, prevX, prevY, facing, flags, hit, truncated };
  }

  /**
   * Whether (x, y) is in the subscribed bbox, or within `reach` cells of it: over the seam of a
   * map that loops, where x may be a place left unfolded too (`slotPlace`); on a map with edges
   * as the numbers stand (PLAN 3.12Rse3: a view at one edge was sent the formations within
   * `reach` of the other).
   */
  private inBbox(x: number, y: number, world: World, reach = 0): boolean {
    const [x0, y0, x1, y1] = this.sub.bbox;
    if (y < y0 - reach || y > y1 + reach) return false;
    if (!world.settings.loopingMap) return x >= x0 - reach && x <= x1 + reach;
    const w = world.cells.w;
    const span = x1 - x0 + 2 * reach;
    if (span >= w) return true;
    const dx = (((x - (x0 - reach)) % w) + w) % w;
    return dx <= span;
  }

  private maybeSend(): void {
    if (!this.sim || this.inFlight) return;
    const world = this.sim.world;
    const due = this.forceSend || world.tick !== this.sentTick || this.eventQueue.length > 0;
    if (!due) return;
    const { snap, transfer } = this.build(world);
    this.inFlight = true;
    this.forceSend = false;
    this.sentTick = world.tick;
    this.post({ type: 'snapshot', snap }, transfer);
  }

  private view<T extends Float64Array | Uint32Array | Uint16Array | Float32Array | Uint8Array>(
    ctor: { new (buf: ArrayBuffer, off: number, len: number): T; BYTES_PER_ELEMENT: number },
    length: number,
    buffers: ArrayBuffer[],
  ): T {
    const buf = this.pool.acquire(Math.max(1, length) * ctor.BYTES_PER_ELEMENT);
    buffers.push(buf);
    return new ctor(buf, 0, length);
  }

  private build(world: World): { snap: Snapshot; transfer: ArrayBuffer[] } {
    const buffers: ArrayBuffer[] = [];
    const out = world.out;
    const { w, h } = world.cells;

    // Dirty tiles (coalesced since the last snapshot).
    let tileCount = 0;
    for (let i = 0; i < out.dirtyTiles.length; i++) if (out.dirtyTiles[i] === 1) tileCount++;
    const ids = this.view(Uint32Array, tileCount, buffers);
    const owner = this.view(Uint16Array, tileCount * TILE * TILE, buffers);
    const controller = this.view(Uint16Array, tileCount * TILE * TILE, buffers);
    owner.fill(0);
    controller.fill(0);
    let k = 0;
    for (let t = 0; t < out.dirtyTiles.length; t++) {
      if (out.dirtyTiles[t] !== 1) continue;
      out.dirtyTiles[t] = 0;
      ids[k] = t;
      const tx = t % out.tilesX;
      const ty = (t - tx) / out.tilesX;
      const x0 = tx * TILE;
      const rowLen = Math.min(TILE, w - x0);
      for (let r = 0; r < TILE; r++) {
        const y = ty * TILE + r;
        if (y >= h) break;
        const src = y * w + x0;
        const dst = (k * TILE + r) * TILE;
        owner.set(world.cells.owner.subarray(src, src + rowLen), dst);
        controller.set(world.cells.controller.subarray(src, src + rowLen), dst);
      }
      k++;
    }

    // Nations.
    const nt = world.nations;
    const nations = this.view(Float64Array, nt.count * NATION_STRIDE, buffers);
    let n = 0;
    nt.forEach((id) => {
      const o = n * NATION_STRIDE;
      nations[o + NationField.id] = id;
      nations[o + NationField.color] = nt.cols.color[id]!;
      nations[o + NationField.cells] = nt.cols.cells[id]!;
      nations[o + NationField.capitalX] = nt.cols.capitalX[id]!;
      nations[o + NationField.capitalY] = nt.cols.capitalY[id]!;
      nations[o + NationField.alliance] = world.alliances.allianceOf(id)?.leader ?? 0;
      nations[o + NationField.overlord] = nt.cols.living[id] === 1 ? nt.cols.overlord[id]! : 0;
      nations[o + NationField.income] = nt.cols.income[id]!;
      nations[o + NationField.living] = nt.cols.living[id] === 1 ? 1 : 0;
      // Founded in the game (it has an origin): no scenario gives it a flag (PLAN 2.15c).
      nations[o + NationField.founded] = nt.cols.origin[id] !== 0 ? 1 : 0;
      n++;
    });
    const warPairs: number[] = [];
    for (const war of world.wars.list) for (const a of war.sides[0]) for (const b of war.sides[1]) warPairs.push(a, b);
    const wars = Uint16Array.from(warPairs);

    // Formations (all but the air wings, which nothing draws yet: PLAN 5.1d, until the air's
    // visuals of PLAN 5.7; elements arrive with Phase 2 when the subscription asks for them).
    const ft = world.formations;
    const shown: number[] = [];
    ft.forEach((id) => {
      if (!world.isWing(id)) shown.push(id);
    });
    const fc = shown.length;
    const fid = this.view(Uint32Array, fc, buffers);
    const fgen = this.view(Uint32Array, fc, buffers);
    const fnat = this.view(Uint16Array, fc, buffers);
    const fx = this.view(Float64Array, fc, buffers);
    const fy = this.view(Float64Array, fc, buffers);
    const fpx = this.view(Float64Array, fc, buffers);
    const fpy = this.view(Float64Array, fc, buffers);
    const fblock = this.view(Float64Array, fc * BLOCK_STRIDE, buffers);
    const ffacing = this.view(Float32Array, fc, buffers);
    const fstr = this.view(Uint32Array, fc, buffers);
    const ftpl = this.view(Uint16Array, fc, buffers);
    const fflags = this.view(Uint8Array, fc, buffers);
    const ftarget = this.view(Uint32Array, fc, buffers);
    const fenemy = this.view(Uint32Array, fc, buffers);
    const fhealth = this.view(Uint8Array, fc, buffers);
    // The ways left of the fleets under way (PLAN 4.7d): the points their order lines turn at.
    const ways: number[][] = [];
    const fwayStart = this.view(Uint32Array, fc + 1, buffers);
    fwayStart[0] = 0; // (a pooled buffer)
    let j = 0;
    for (const id of shown) {
      fid[j] = id;
      fgen[j] = ft.generation[id]!;
      fnat[j] = ft.cols.nation[id]!;
      fx[j] = ft.cols.x[id]!;
      fy[j] = ft.cols.y[id]!;
      // A formation created during the last tick has no previous position: use the current one.
      const born = this.born(world, id);
      fpx[j] = born ? fx[j]! : this.prevX[id]!;
      fpy[j] = born ? fy[j]! : this.prevY[id]!;
      // Where its block stands (PLAN 3.11a): the close tiers, the click and the camera find
      // the formation where its elements are drawn, also when they are deployed against an enemy.
      const pose = this.blockPose(world, id);
      fblock[j * BLOCK_STRIDE] = pose.x;
      fblock[j * BLOCK_STRIDE + 1] = pose.y;
      fblock[j * BLOCK_STRIDE + 2] = pose.prevX;
      fblock[j * BLOCK_STRIDE + 3] = pose.prevY;
      ffacing[j] = pose.facing;
      fstr[j] = ft.cols.strength[id]!;
      ftpl[j] = ft.cols.template[id]!;
      const moving = ft.cols.moving[id] === 1;
      fflags[j] = (moving ? FormationFlag.moving : 0) | (ft.cols.engaged[id] === 1 ? FormationFlag.engaged : 0) | (ft.cols.retreat[id]! > 0 ? FormationFlag.retreating : 0);
      ftarget[j] = moving ? ft.cols.targetCell[id]! : 0;
      // The enemy it is in contact with (PLAN 7.34d), as the panel's fight has it (`enemyOf`).
      fenemy[j] = this.enemyOf(world, id);
      fhealth[j] = world.heroes.has(id) ? Math.round(heroHealth(world, id) * 100) : NO_HEALTH;
      const path = moving && world.afloat(id) ? world.paths.get(id) : undefined;
      let way: number[] = path ? wayLine(fx[j]!, fy[j]!, path, ft.cols.pathStep[id]!, world.cells.w, world.settings.loopingMap) : [];
      // A march on land (PLAN 7.4g3): from its place to where it will stand, the target cell's
      // point (`cellPoint`: its middle on land, else its land point, up to 0.6 cells off on a
      // coast). The T1 arrow ended at the cell's middle. Its x next to the formation's on a
      // looping map.
      if (moving && !path && !world.offLand(id)) {
        const [tx, ty] = world.cellPoint(ft.cols.targetCell[id]!);
        const w = world.cells.w;
        way = [fx[j]!, fy[j]!, world.settings.loopingMap ? tx + w * Math.round((fx[j]! - tx) / w) : tx, ty];
      }
      ways.push(way);
      fwayStart[j + 1] = fwayStart[j]! + way.length;
      j++;
    }
    const fway = this.view(Float32Array, fwayStart[fc]!, buffers);
    for (let i = 0; i < fc; i++) fway.set(ways[i]!, fwayStart[i]!);
    const majors = Float32Array.from(world.battles.majors.flatMap((m) => [m.x, m.y]));
    // The sea battles (PLAN 4.10b): the place, the cells to the furthest fleet, the two sides;
    // the middle and the size of the box of its fleets (PLAN 4.12a).
    const fc0 = world.formations.cols;
    const seas = Float32Array.from(
      world.seaBattles.flatMap((b) => {
        let r = 0;
        let [x0, x1, y0, y1] = [0, 0, 0, 0];
        for (const f of b.fleets) {
          if (!world.formations.has(f)) continue;
          const dx = wrapDx(world, b.x, fc0.x[f]!);
          const dy = fc0.y[f]! - b.y;
          r = Math.max(r, Math.hypot(dx, dy));
          [x0, x1, y0, y1] = [Math.min(x0, dx), Math.max(x1, dx), Math.min(y0, dy), Math.max(y1, dy)];
        }
        const w = world.cells.w;
        const mx = (((b.x + (x0 + x1) / 2) % w) + w) % w;
        const my = b.y + (y0 + y1) / 2;
        // Its nearest two fleets at war with each other (PLAN 7.10b) within reach of a ship's weapon
        // of either (PLAN 7.19b): the pair that fights. None (a carrier's wings alone reach): a
        // width of -1, and the ticker lists no row for it. Its middle on the water: the point of
        // the line between the two nearest the middle whose cell is no land (PLAN 7.19b).
        let pair: [number, number, number, number] = [mx, my, -1, -1];
        let best = Infinity;
        // Its nearest two fleets at war whatever their distance (PLAN 7.41a): where no weapon
        // reaches yet (the fleets closing), its row frames them.
        let near: [number, number, number, number] = [mx, my, -1, -1];
        let nearBest = Infinity;
        const live = b.fleets.filter((f) => world.formations.has(f));
        for (let i = 0; i < live.length; i++) {
          for (let j = i + 1; j < live.length; j++) {
            const [f, g] = [live[i]!, live[j]!];
            if (!world.wars.atWar(fc0.nation[f]!, fc0.nation[g]!)) continue;
            const dx = wrapDx(world, fc0.x[f]!, fc0.x[g]!);
            const dy = fc0.y[g]! - fc0.y[f]!;
            const d = Math.hypot(dx, dy);
            if (d < nearBest) {
              nearBest = d;
              near = [(((fc0.x[f]! + dx / 2) % w) + w) % w, fc0.y[f]! + dy / 2, Math.abs(dx), Math.abs(dy)];
            }
            if (!inShipReach(world, f, g)) continue;
            if (d >= best) continue;
            best = d;
            let at = 0.5;
            for (const t of [0.5, 0.4, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.9, 0, 1]) {
              const cx = ((Math.floor(fc0.x[f]! + dx * t) % w) + w) % w;
              const cy = Math.min(world.cells.h - 1, Math.max(0, Math.floor(fc0.y[f]! + dy * t)));
              if (!isLand(world.cells.terrain[cy * w + cx]!)) {
                at = t;
                break;
              }
            }
            pair = [(((fc0.x[f]! + dx * at) % w) + w) % w, fc0.y[f]! + dy * at, Math.abs(dx), Math.abs(dy)];
          }
        }
        // With no such pair, the fleet its carriers' wings strike (PLAN 7.35a): a row of its own.
        const hit = pair[2] < 0 ? strikeTarget(world, live) : null;
        const strike = hit ? [fc0.x[hit.target]!, fc0.y[hit.target]!, fc0.nation[hit.carrier]!] : [0, 0, 0];
        // The carrier's fleet and the fleet it strikes (PLAN 7.84a): their middle and the cells
        // between them, the row's frame; the struck fleet alone left the carrier up to 250 km off.
        let both: [number, number, number, number] = [0, 0, -1, -1];
        if (hit) {
          const [kx, ky, tx, ty] = [fc0.x[hit.carrier]!, fc0.y[hit.carrier]!, fc0.x[hit.target]!, fc0.y[hit.target]!];
          const dx = wrapDx(world, kx, tx);
          both = [(((kx + dx / 2) % w) + w) % w, ky + (ty - ky) / 2, Math.abs(dx), Math.abs(ty - ky)];
        }
        return [b.x, b.y, r, b.a, b.b, mx, my, x1 - x0, y1 - y0, ...pair, ...strike, ...near, ...both];
      }),
    );
    // The sorties in the air (PLAN 5.7a): what `sortieAt` needs, the launch from this tick.
    const sorties = sortieSection(world);
    const elements = this.elementSection(world, buffers);

    // Events: global ones always, spatial ones only inside the subscribed bbox.
    const q = this.eventQueue;
    let ec = 0;
    for (let i = 0; i < q.length; i += EVENT_STRIDE) {
      const x = q[i + 5]!;
      if (x !== x || this.inBbox(x, q[i + 6]!, world)) ec++;
    }
    const events = this.view(Float64Array, ec * EVENT_STRIDE, buffers);
    let e = 0;
    for (let i = 0; i < q.length; i += EVENT_STRIDE) {
      const x = q[i + 5]!;
      if (x !== x || this.inBbox(x, q[i + 6]!, world)) {
        for (let c = 0; c < EVENT_STRIDE; c++) events[e * EVENT_STRIDE + c] = q[i + c]!;
        e++;
      }
    }
    this.eventQueue = [];

    // Fires: what was queued while the view drew elements; a view that left that tier gets none.
    const fq = this.drawsElements() ? this.fireQueue : [];
    const fires = fq.length > 0 ? this.view(Float64Array, fq.length, buffers) : NO_FIRES;
    fires.set(fq);
    this.fireQueue = [];
    this.firedAt.clear();

    const snap: Snapshot = {
      seq: ++this.seq,
      tick: world.tick,
      speed: this.speed,
      paused: this.paused,
      tickMs: this.paused || this.speed === 'max' ? 0 : 1000 / this.speed,
      tiles: { size: TILE, tilesX: out.tilesX, tilesY: out.tilesY, count: tileCount, ids, owner, controller },
      nations: { count: n, data: nations },
      wars,
      formations: { count: fc, id: fid, generation: fgen, nation: fnat, x: fx, y: fy, prevX: fpx, prevY: fpy, block: fblock, facing: ffacing, strength: fstr, template: ftpl, flags: fflags, target: ftarget, enemy: fenemy, health: fhealth, wayStart: fwayStart, way: fway },
      majors,
      voyages: Float32Array.from(this.voyages(world)),
      seas,
      holds: Float32Array.from(this.holds(world)),
      corridors: Float32Array.from(this.corridors(world)),
      raids: Float32Array.from(carrierRaids(world)),
      sorties,
      elements,
      events: { count: ec, data: events, dropped: this.droppedEvents },
      fires: { count: fq.length / FIRE_STRIDE, data: fires, dropped: this.droppedFires },
      buffers,
    };
    return { snap, transfer: buffers };
  }
}

/** A wing's role by its aircraft's class (`SortieRole`). */
const ROLE_OF_CLASS: Record<string, number> = { fighter: SortieRole.fighter, cas: SortieRole.closeSupport, bomber_tac: SortieRole.bomber, bomber_str: SortieRole.heavyBomber, naval_bomber: SortieRole.navalBomber, transport_air: SortieRole.transport };

/** The snapshot's sorties (PLAN 5.7a): those in the air in the hour before the tick (the hour the page plays) or at it, by wing id. */
export function sortieSection(world: World): Float32Array {
  const rows: number[] = [];
  if (!world.rules) return new Float32Array(0);
  const c = world.formations.cols;
  for (const [id, s] of [...world.sorties].sort((a, b) => a[0] - b[0])) {
    if (!world.formations.has(id) || sortieEnd(s) <= world.tick - 1 || s.launch > world.tick) continue;
    const first = world.rules.templates[c.template[id]!]?.elements[0];
    const role = first ? (ROLE_OF_CLASS[world.rules.units[first.unit]!.cls] ?? SortieRole.fighter) : SortieRole.fighter;
    rows.push(s.bx, s.by, s.tx, s.ty, s.launch - world.tick, s.kmh, s.km, s.over, c.nation[id]!, aircraftOf(world, id), role);
  }
  // A carrier's strikes in its sea battle (PLAN 4.12b): their flights, as sorties of naval bombers.
  for (const { wing, nation, sortie: s } of carrierStrikes(world)) rows.push(s.bx, s.by, s.tx, s.ty, s.launch - world.tick, s.kmh, s.km, s.over, nation, aircraftOf(world, wing), SortieRole.navalBomber);
  return Float32Array.from(rows);
}

/** The whole days, rounded up, until wing `id` at sea reaches its new base (PLAN 7.142); 0 when it is not at sea. */
export function ferryDays(world: World, id: number): number {
  const due = world.wingFerry.get(id);
  return due === undefined ? 0 : Math.max(1, Math.ceil((due - world.tick) / 24));
}

/** The player's wings (PLAN 5.8v1), by ascending id; none without a player. */
function playerWings(world: World): PlayerWing[] {
  const n = world.settings.player;
  if (n === 0 || world.wingBase.size === 0) return [];
  const c = world.formations.cols;
  const out: PlayerWing[] = [];
  for (const [id, base] of [...world.wingBase].sort((a, b) => a[0] - b[0])) {
    if (!world.formations.has(id) || c.nation[id] !== n) continue;
    const s = world.sorties.get(id);
    const up = s !== undefined && s.launch <= world.tick && world.tick < sortieEnd(s);
    const lw = world.settings.loopingMap ? world.cells.w : 0;
    const at = up ? sortieAt(s, world.tick, lw) : { x: c.x[id]!, y: c.y[id]! };
    const x = lw > 0 ? ((at.x % lw) + lw) % lw : at.x;
    const fleet = base < 0 && world.formations.has(-base) ? -base : 0;
    out.push({ id, template: c.template[id]!, transport: isTransport(world, id), carrier: base < 0, base: base > 0 ? (world.airbases[base - 1]?.name ?? '') : '', fleet, fleetTemplate: fleet !== 0 ? c.template[fleet]! : 0, mission: world.wingMission.get(id)?.kind ?? null, flying: world.sorties.has(id), ferryDays: ferryDays(world, id), x, y: at.y });
  }
  return out;
}

/** The historical track's next event that has a name, while it runs (ROADMAP R62j1): the line under the date. */
function trackNext(world: World): { trackNext?: TrackNext } {
  const t = world.track;
  if (!t || t.ended) return {};
  const named: { note: string; tick: number }[] = [];
  for (let i = t.next; i < t.events.length && named.length <= TRACK_AHEAD; i++) {
    const { note, kind } = t.events[i]!;
    // Not the steering's (R64b): its notes are the builder's.
    if (note !== undefined && !STEERING_KINDS.has(kind)) named.push({ note, tick: t.ticks[i]! });
  }
  const [first, ...ahead] = named;
  return first ? { trackNext: { ...first, ahead } } : {};
}
