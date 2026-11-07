/**
 * ROADMAP R33d (ADR-830; as `diploInvariants`, ADR-803): the rules of the player's landings, checked every hour
 * of a run with random landing orders. A nation at war (`GRID_SETUPS`' targets), the player; its six divisions
 * nearest its capital are the pool. Every 12 to 72 hours (an RNG of its own, not the sim's) one click: one, two,
 * three or all of the pool, to the landing's target or the other's (0–3 cells off), to the sea off the first's
 * beach (ROADMAP R36b), or home (a cancel); the farther of the pool make late orders, and re-sent ones make
 * recalls, redirects, re-clicks and part of a landing sent elsewhere (R36a) of every kind.
 *
 * Broken, each with its hour:
 * - `one`: a division or a group in two landings;
 * - `empty`: a landing with no division, or one whose division or group is gone or another nation's;
 * - `aboardGathering`: a division aboard standing transports two hours running while its landing gathers (they
 *   wait ashore and board at the sail hour; a landing at sea joined to one gathering sails to its port aboard);
 * - `aboardNoLanding`: a division aboard transports under the player's order (`playerOrders`), in no landing on
 *   them (bar God's `seaBound`; one whose order is over is the AI's to ship, ADR-759; one whose transports were
 *   sunk this hour, lost with them at the next, R38a);
 * - `idle`: a spell aboard a landing's transports over IDLE_HOURS, standing in no fight;
 * - `returning`: a landing returning with no march after it (`then`);
 * - `cancelWater`: a landing returning for a march onto water (critic run 44, R44-B2: an order to the sea was taken
 *   as a cancel, and refused a day later at its port);
 * - `leftBehind`: at the hour a landing sails, one of its divisions standing ashore (critic run 44, R44-B1: a part
 *   re-sent kept too few transports; the rest stood at the port, untold, and landed alone weeks later); bar one
 *   told `NextVoyage` that hour (R17b's next voyage, told; ROADMAP R38e, critic run 46, R46-N4);
 * - `escort`: an escort for no landing two hours running (one ending this hour is let go the next);
 * - `stuck`: a division in a gathering landing that has gained no ground for STUCK_DAYS: none of its divisions
 *   nearer its port, none of its groups nearer its port's water, by a cell (ADR-835, the user's decision; critic
 *   run 48 on R47-N4: "`stuck` is a wait limit... nothing it is told is false": 19206's 367 walked ~70 cells to
 *   Kure at ~1 a day, its click's landing, and was counted stuck). A wait at the port for a mate on the march is
 *   the landing's ground gained; a stand with no one nearing is a stall, however its landings are re-clicked;
 * - `farPort`: a division that makes a landing alone (new in the hour, it its only division) at a port whose
 *   whole way to the landing's water (the march, the voyage) is over FAR_PORT_DAYS longer than by its land's nearest
 *   port of its nation (the march there or an idle group of its nation with room called there, `callCandidates`,
 *   the later, then the voyage): R39d's rule as a checker, at any distance since R38d's gate went (ROADMAP R41,
 *   ADR-836) (ADR-835: R46-N3's class, a 40-day walk within Honshu to a far port's free group, kept caught once
 *   `stuck` counts the march as ground gained; a landing waiting for a sibling gains ground as the sibling does);
 * - `marchOn`: a division of a gathering landing, out of it with no order of the player's that hour, still marching
 *   to that landing's port (ROADMAP R43e; critic run 50, R50-N5: 20845's two told the landing was over walked on
 *   to Hamburg for six days);
 * - `save`: a save that does not load bit-identical (on the probe days).
 * Each kind is told once a division, group or landing (its first hour).
 *
 * Not broken but told (`notes`, ADR-835): each division's longest spell in a gathering landing, and how much of it
 * gained no ground, so a long march stays in view.
 */
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { isLand } from '../../src/shared/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { callCandidates, landingOf, transportRoom, transportsPort } from '../../src/sim/systems/amphibious';
import { destroyFormation } from '../../src/sim/systems/elements';
import { LandingState } from '../../src/sim/systems/landings';
import { octileKm } from '../../src/sim/nav/grid';
import { MARCH_DUTY } from '../../src/sim/systems/movement';
import { sailHours, sailHoursFrom } from '../../src/sim/systems/sail';
import { navOf, portSeaOf, type World } from '../../src/sim/world';
import { assets1938 } from './earth';
import { GRID_SETUPS, IDLE_HOURS, type GridSetup } from './landingGrid';
import { nationId } from './sim1938';

const { w: W } = SIZE_1938;
/** The longest a division may stand in a gathering landing, in days (R31f's late march is a week; the longest walk ~21 days). */
export const STUCK_DAYS = 45;
/** How many days longer a lone division's way by its port may be than by its land's nearest before `farPort` (a week). */
export const FAR_PORT_DAYS = 7;

/** The checker's memory between hours for `stuck`, `farPort` and the notes (ADR-835). */
interface Track {
  /** Per division or group, its landing and the nearest it has come to that landing's port (cells). */
  best: Map<number, { landing: number; port: number; d: number }>;
  /** Per division, the hour its landing last gained ground. */
  ground: Map<number, number>;
  /** Per division, the hour it entered gathering landings; its longest spell in them, and its longest with no ground. */
  spell: Map<number, number>;
  longest: Map<number, { hours: number; still: number }>;
  /** Per division, the landing it was in last hour. */
  landing: Map<number, number>;
  /** The landings of last hour (a landing not among them is new). */
  seen: Set<number>;
}

export interface LandingCase {
  /** The sim's seed. */
  seed: number;
  /** The setup (nation, targets, capital) by its seed in `GRID_SETUPS`. */
  setup: number;
  days: number;
  /** The order RNG's seed. */
  orders: number;
  /** Days on which a save is loaded and compared. */
  probeDays: number[];
  /** Keep only this many of the nation's transport groups, those nearest its capital (R38e: a pool short of room). */
  groups?: number;
  /** Called after each hour stepped (a diagnosis tool's trace). */
  hour?: (w: World) => void;
  /** Random orders only in the first this many days (a stall planted by `hour` then runs undisturbed); default all. */
  orderDays?: number;
  /** Filled with the notes (ADR-835): each division's longest gathering spell and its part with no ground gained. */
  notes?: string[];
  /** Each hour after the step, and each click (a tool's trace). */
  onHour?: (w: World, click?: { ids: number[]; x: number; y: number }) => void;
}

/** mulberry32: the fuzz's orders, apart from the sim's RNG. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRS: [number, number][] = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [-1, -1], [1, -1]];

/** The rules each hour on `w` for player `n`; `idle` and `since` carry spells between hours. */
function check(w: World, n: number, idle: Map<number, number>, track: Track, orphans: Set<number>, moored: Set<number>, was: Map<number, number>, told: Set<number>, clicked: ReadonlySet<number>, put: (key: string, line: string) => void): void {
  const t = `t${w.tick}`;
  const out = { push: (line: string): void => put(line.replace(/^t\d+ /, '').replace(/ (aboard|standing|for|in|,|has|gathering).*$/, ''), line) };
  const f = w.formations;
  const c = f.cols;
  const divs = new Map<number, number>();
  const aboardNow = new Set<number>();
  const groups = new Map<number, number>();
  for (const l of w.landings.values()) {
    if (l.divisions.size === 0) out.push(`${t} empty: landing ${l.id} has no division`);
    for (const id of l.divisions.keys()) {
      if (divs.has(id)) out.push(`${t} one: division ${id} in landings ${divs.get(id)} and ${l.id}`);
      divs.set(id, l.id);
      if (!f.has(id) || c.nation[id] !== l.nation) out.push(`${t} empty: landing ${l.id}'s division ${id} gone or another's`);
      const e = w.embarked.get(id);
      if (l.state === LandingState.gathering && e !== undefined && f.has(e.fleet) && c.moving[e.fleet] !== 1) {
        if (moored.has(id)) out.push(`${t} aboardGathering: ${id} aboard ${e.fleet} standing, landing ${l.id} gathering`);
        else moored.add(id);
        aboardNow.add(id);
      }
    }
    for (const o of l.fleets) {
      if (groups.has(o)) out.push(`${t} one: group ${o} in landings ${groups.get(o)} and ${l.id}`);
      groups.set(o, l.id);
      if (!f.has(o) || c.nation[o] !== l.nation) out.push(`${t} empty: landing ${l.id}'s group ${o} gone or another's`);
    }
    if (l.state === LandingState.returning && l.then < 0) out.push(`${t} returning: landing ${l.id} with no march after`);
    if (l.state === LandingState.returning && l.then >= 0 && !isLand(w.cells.terrain[l.then]!)) out.push(`${t} cancelWater: landing ${l.id} returning for a march onto water`);
    if (l.state === LandingState.sailing && was.get(l.id) === LandingState.gathering) {
      for (const id of l.divisions.keys()) if (f.has(id) && !w.embarked.has(id) && c.moving[id] !== 1 && !told.has(id)) out.push(`${t} leftBehind: ${id} ashore as landing ${l.id} sails`);
    }
  }
  was.clear();
  for (const l of w.landings.values()) was.set(l.id, l.state);
  // An escort let go is forgotten: "two hours running" is two hours in a row (20405 t1694: one orphaned an hour
  // twice, a month apart, was told).
  for (const o of [...orphans]) if (!w.escorts.has(o)) orphans.delete(o);
  for (const [o, e] of w.escorts) {
    if (w.landings.has(e.convoy)) orphans.delete(o);
    else if (orphans.has(o)) out.push(`${t} escort: ${o} for landing ${e.convoy}, none two hours on`);
    else orphans.add(o);
  }
  for (const [id, e] of w.embarked) {
    if (c.nation[id] !== n || w.seaBound.has(id)) continue;
    const l = divs.get(id);
    // Aboard transports sunk this hour: lost with them at the next (`amphibiousSystem`, told `LostAtSea`, R38a).
    if (!f.has(e.fleet)) continue;
    if (w.playerOrders.has(id) && (l === undefined || !w.landings.get(l)!.fleets.includes(e.fleet))) out.push(`${t} aboardNoLanding: ${id} aboard ${e.fleet}, landing ${l ?? 'none'}`);
    // Idle aboard: of a landing's (the AI's own shipping is its own).
    const standing = l !== undefined && f.has(e.fleet) && c.moving[e.fleet] !== 1 && c.engaged[e.fleet] !== 1;
    const s = standing ? (idle.get(id) ?? 0) + 1 : 0;
    idle.set(id, s);
    if (s === IDLE_HOURS + 1) out.push(`${t} idle: ${id} aboard ${e.fleet} standing ${IDLE_HOURS} h`);
  }
  for (const id of [...idle.keys()]) if (!w.embarked.has(id)) idle.delete(id);
  for (const id of [...moored]) if (!aboardNow.has(id)) moored.delete(id);
  // Ground gained (ADR-835): each gathering landing's divisions and groups against the nearest each has come to its
  // port (a group: its port's water), by straight cells; a cell nearer is ground. A new landing or port starts afresh.
  const W_ = w.cells.w;
  const cellsTo = (x: number, y: number, k: number): number => {
    let dx = Math.abs(x - ((k % W_) + 0.5));
    if (w.settings.loopingMap && dx > W_ / 2) dx = W_ - dx;
    return Math.hypot(dx, y - (Math.floor(k / W_) + 0.5));
  };
  const water = portSeaOf(w);
  const gained = new Set<number>();
  for (const l of w.landings.values()) {
    if (l.state !== LandingState.gathering) continue;
    const port = w.ports[l.port]!.cell;
    const near = (id: number, k: number): void => {
      if (!f.has(id) || k < 0) return;
      const d = cellsTo(c.x[id]!, c.y[id]!, k);
      const b = track.best.get(id);
      if (!b || b.landing !== l.id || b.port !== l.port) track.best.set(id, { landing: l.id, port: l.port, d });
      else if (d <= b.d - 1) {
        b.d = d;
        gained.add(l.id);
      }
    };
    for (const id of l.divisions.keys()) near(id, port);
    for (const o of l.fleets) near(o, water[l.port]!);
  }
  // A landing waiting at its port for another of its nation for the same water (a sibling of its click, R37c, waited
  // for up to a month, R41) gains ground as that one does.
  const place = (l: { nation: number; water: number }): string => `${l.nation}:${l.water}`;
  const placed = new Set([...gained].map((id) => place(w.landings.get(id)!)));
  for (const l of w.landings.values()) if (l.state === LandingState.gathering && placed.has(place(l))) gained.add(l.id);
  for (const [id, l] of divs) {
    const L = w.landings.get(l)!;
    if (L.state !== LandingState.gathering) {
      track.ground.delete(id);
      track.spell.delete(id);
      track.landing.delete(id);
      continue;
    }
    // `farPort`: one that makes a landing alone (new this hour, it its only division) at a port whose whole way
    // (march, voyage) is over FAR_PORT_DAYS longer than by its land's nearest port (march there or a group's sail
    // there, the later, then the voyage). A landing merged or redirected keeps its port: not made.
    if (!track.seen.has(l) && L.divisions.size === 1) {
      const nearest = transportsPort(w, id, false);
      const rule = w.rules?.templates[c.template[id]!];
      if (nearest >= 0 && nearest !== L.port && rule && rule.speedKmh > 0) {
        const grid = navOf(w).grid;
        const kmh = rule.speedKmh * MARCH_DUTY;
        const here = Math.floor(c.y[id]!) * W_ + Math.floor(c.x[id]!);
        const [lx, ly] = [(L.water % W_) + 0.5, Math.floor(L.water / W_) + 0.5];
        const k = water[nearest]!;
        const [kx, ky] = [(k % W_) + 0.5, Math.floor(k / W_) + 0.5];
        const far = L.fleets.find((o) => f.has(o));
        const byFar = octileKm(grid, here, w.ports[L.port]!.cell) / kmh + (far === undefined ? 0 : sailHoursFrom(w, far, water[L.port]!, lx, ly));
        // The groups a call to the nearer port tries (idle, with room: R39d's rule, `callCandidates`), with a way.
        let byNear = Infinity;
        for (const o of callCandidates(w, id, nearest)) {
          const come = sailHours(w, o, kx, ky);
          if (Number.isFinite(come)) byNear = Math.min(byNear, Math.max(octileKm(grid, here, w.ports[nearest]!.cell) / kmh, come) + sailHoursFrom(w, o, k, lx, ly));
        }
        if (byNear + FAR_PORT_DAYS * 24 < byFar) out.push(`${t} farPort: ${id} made landing ${l} at ${w.ports[L.port]!.name}, ${Math.round(byFar / 24)} days to its water; by ${w.ports[nearest]!.name} ${Math.round(byNear / 24)}`);
      }
    }
    track.landing.set(id, l);
    const s = track.spell.get(id) ?? w.tick;
    track.spell.set(id, s);
    if (gained.has(l) || !track.ground.has(id)) track.ground.set(id, w.tick);
    const g = track.ground.get(id)!;
    const most = track.longest.get(id) ?? { hours: 0, still: 0 };
    track.longest.set(id, { hours: Math.max(most.hours, w.tick - s), still: Math.max(most.still, w.tick - g) });
    if (w.tick - g === STUCK_DAYS * 24) out.push(`${t} stuck: ${id} in gathering landing ${l}, no ground gained for ${STUCK_DAYS} days`);
  }
  // `marchOn`: out of its gathering landing of last hour (`track.landing`) by no click, still marching to its port.
  for (const [id, l] of track.landing) {
    if (divs.has(id) || clicked.has(id) || !f.has(id) || w.embarked.has(id) || c.moving[id] !== 1) continue;
    const b = track.best.get(id);
    if (b && b.landing === l && c.targetCell[id] === w.ports[b.port]!.cell) out.push(`${t} marchOn: ${id} marches on to ${w.ports[b.port]!.name}, out of landing ${l}`);
  }
  for (const m of [track.ground, track.spell, track.landing]) for (const id of [...m.keys()]) if (!divs.has(id)) m.delete(id);
  track.seen = new Set(w.landings.keys());
}

/** The broken rules of one run, each a line (empty: none). */
export function landingBreaks(k: LandingCase): string[] {
  const setup: GridSetup = GRID_SETUPS.find((s) => s.seed === k.setup)!;
  const sim = new Sim({ scenario: '1938', seed: k.seed, assets: assets1938(W) });
  const w = sim.world;
  const [n, e] = [nationId(setup.nation), nationId(setup.enemy)];
  // Divisions told `NextVoyage` in the hour stepped (R38e).
  const voyageTold = new Set<number>();
  const quiet = (x: World): void => {
    for (let i = 0; i < x.out.events.length; i += 6) if (x.out.events[i + 1] === EventKind.NextVoyage) voyageTold.add(x.out.events[i + 2]!);
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  sim.command({ kind: 'setPlayer', nation: n });
  sim.step(1, quiet);
  if (!w.wars.atWar(n, e)) sim.command(setup.force ? { kind: 'forceWar', attacker: n, defender: e } : { kind: 'declareWar', attacker: n, defender: e });
  sim.step(1, quiet);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const at = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);
  const home = comp[at(setup.home[0], setup.home[1])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== n || w.isFleet(id) || w.offLand(id) || comp[at(c.x[id]!, c.y[id]!)] !== home) return;
    all.push([id, (c.x[id]! - setup.home[0]) ** 2 + (c.y[id]! - setup.home[1]) ** 2]);
  });
  const pool = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 6).map((d) => d[0]);
  // A pool short of room (R38e): only the `groups` transport groups nearest the capital kept.
  if (k.groups !== undefined) {
    const ships: [number, number][] = [];
    w.formations.forEach((o) => {
      if (c.nation[o] === n && w.isFleet(o) && transportRoom(w, o) > 0) ships.push([o, (c.x[o]! - setup.home[0]) ** 2 + (c.y[o]! - setup.home[1]) ** 2]);
    });
    for (const [o] of ships.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(k.groups)) destroyFormation(w, o);
  }
  const r = rng(k.orders);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;
  const out: string[] = [];
  const told = new Set<string>();
  const put = (key: string, line: string): void => {
    if (told.has(key)) return;
    told.add(key);
    out.push(line);
  };
  const orphans = new Set<number>();
  const moored = new Set<number>();
  const idle = new Map<number, number>();
  const track: Track = { best: new Map(), ground: new Map(), spell: new Map(), longest: new Map(), landing: new Map(), seen: new Set() };
  const was = new Map<number, number>();
  let next = w.tick;
  const clicked = new Set<number>();
  const end = w.tick + k.days * 24;
  const probes = new Set(k.probeDays.map((d) => w.tick + d * 24));
  while (w.tick < end) {
    if (w.tick >= next && (k.orderDays === undefined || w.tick < end - (k.days - k.orderDays) * 24)) {
      const live = pool.filter((id) => w.formations.has(id) && c.nation[id] === n);
      if (live.length > 0) {
        const size = pick([1, 1, 2, 3, live.length]);
        const sel = [...live].sort(() => r() - 0.5).slice(0, size).sort((a, b) => a - b);
        const where = pick(['a', 'a', 'b', 'sea', 'home'] as const);
        const [dx, dy] = pick(DIRS);
        const off = pick([0, 1, 2, 3]);
        // The sea: the water off the first target's beach, 0–3 cells further out (ROADMAP R36b).
        const sea = landingOf(w, Math.floor(setup.a[1]) * W + Math.floor(setup.a[0]))!.water;
        const [x, y] = where === 'home' ? setup.home : where === 'sea' ? [(sea % W) + 0.5 + dx * off, Math.floor(sea / W) + 0.5 + dy * off] : [(where === 'a' ? setup.a : setup.b)[0] + dx * off, (where === 'a' ? setup.a : setup.b)[1] + dy * off];
        for (const id of sel) sim.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true } as Command);
        for (const id of sel) clicked.add(id);
        k.onHour?.(w, { ids: sel, x, y });
      }
      next = w.tick + 12 + Math.floor(r() * 61);
    }
    voyageTold.clear();
    sim.step(1, quiet);
    check(w, n, idle, track, orphans, moored, was, voyageTold, clicked, put);
    clicked.clear();
    k.hour?.(w);
    k.onHour?.(w);
    if (probes.has(w.tick)) {
      const bytes = sim.save();
      const other = new Sim({ scenario: '1938', seed: k.seed, assets: assets1938(W) });
      other.load(bytes);
      const again = other.save();
      if (again.length !== bytes.length || again.some((b, i) => b !== bytes[i])) out.push(`t${w.tick} save: not bit-identical after a load`);
    }
    if (out.length > 200) break;
  }
  for (const [id, { hours, still }] of [...track.longest].sort((a, b) => a[0] - b[0])) k.notes?.push(`note: ${id} longest in a gathering landing ${(hours / 24).toFixed(1)} days, ${(still / 24).toFixed(1)} of them with no ground gained`);
  return out;
}
