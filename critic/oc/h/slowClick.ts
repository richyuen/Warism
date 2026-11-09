/**
 * ROADMAP R44 (ADR-843, the user's decision): `slowClick`, the bound on a click's landing. A click over the sea
 * (one order to one or more divisions) is broken when its first division ashore comes over SLOW_CLICK_DAYS later
 * than the click's best single-division way (`bestWayHours`: the march to its own nearest port or the sail there of
 * a group a call tries, the later, then the voyage; as `farPort` reckons it), and the player was not told why at the
 * click. Told why is a refusal in the click's hour (`MoveRejected`); a tooltip's day count is not (critic run 50:
 * R50-N1 was filed with "sails in about 35 days" on the screen).
 *
 * It is the bound every wait rule must keep together: a sibling landing's (R37c, ADR-836), the click's own last
 * division's (R43a), the late march (R31f). R49-N5 (20661, 26.3 days for a 5-day crossing) and R50-N1 (20841, 39.6
 * for 4) are its cases. Used by the fuzz (`landingBreaks`) and the grid (`gridCase`).
 */
import { callCandidates, transportRoom, transportsPort } from '../../../src/sim/systems/amphibious';
import { landingOfDivision } from '../../../src/sim/systems/landings';
import { octileKm } from '../../../src/sim/nav/grid';
import { MARCH_DUTY } from '../../../src/sim/systems/movement';
import { sailHours, sailHoursFrom, sailHoursLeft } from '../../../src/sim/systems/sail';
import { navOf, portSeaOf, type World } from '../../../src/sim/world';

/** How many days a click's first division ashore may come after its best single-division way (a week). */
export const SLOW_CLICK_DAYS = 7;

/**
 * The hours of division `id`'s best way alone to a landing on `water` (a cell), as `farPort` reckons it (R39d's rule):
 * the march to `port` (its land's nearest port of its nation by default) or the sail there of an idle group with
 * room that a call tries (`callCandidates`), the later, then that group's voyage from the port's water; the best of
 * the groups. Infinity for no group with a way, no port, or a division that does not march.
 */
export function bestWayHours(w: World, id: number, water: number, port = transportsPort(w, id, false)): number {
  const c = w.formations.cols;
  const rule = w.rules?.templates[c.template[id]!];
  if (port < 0 || !rule || rule.speedKmh <= 0) return Infinity;
  const W = w.cells.w;
  const march = octileKm(navOf(w).grid, Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!), w.ports[port]!.cell) / (rule.speedKmh * MARCH_DUTY);
  const [lx, ly] = [(water % W) + 0.5, Math.floor(water / W) + 0.5];
  const k = portSeaOf(w)[port]!;
  const [kx, ky] = [(k % W) + 0.5, Math.floor(k / W) + 0.5];
  let best = Infinity;
  const way = (o: number, busy = false): void => {
    // Busy: under way, not before its leg's end (26041 t151: 1136 81 hours from the port with 97 left on its leg).
    const come = Math.max(sailHours(w, o, kx, ky), busy && c.moving[o] === 1 ? sailHoursLeft(w, o) : 0);
    if (Number.isFinite(come)) best = Math.min(best, Math.max(march, come) + sailHoursFrom(w, o, k, lx, ly));
  };
  for (const o of callCandidates(w, id, port)) way(o);
  // None idle (ROADMAP R55d; critic run 56, R56-N3: such clicks went unreckoned, and R56-N2's 77 days with them): any
  // group of its nation with room, busy or another landing's, from where it is now or its leg's end (a bound below the
  // true way: a group carrying others lands them first).
  if (best === Infinity) {
    const men = c.strength[id]!;
    w.formations.forEach((o) => {
      if (w.isFleet(o) && c.nation[o] === c.nation[id] && transportRoom(w, o) >= men) way(o, true);
    });
  }
  return best;
}

/**
 * A click's best single-division way to `water`, hours: the best of its divisions'. With `land` (the landing's land
 * cell), a division on that land's own landmass walks there and is not reckoned (ROADMAP R54a; critic run 55, 26045:
 * three in China set a 2.5-day best for the one crossing from Honshu, whose own was 10.2).
 */
export function clickBest(w: World, ids: readonly number[], water: number, land = -1): number {
  const comp = navOf(w).grid.component;
  const c = w.formations.cols;
  const W = w.cells.w;
  let best = Infinity;
  for (const id of ids) {
    if (land >= 0 && comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] === comp[land]) continue;
    best = Math.min(best, bestWayHours(w, id, water));
  }
  return best;
}

interface Click {
  /** The hour of the click (the world before its step). */
  t0: number;
  /** Its divisions still its own: not re-clicked since, not refused at it, alive. */
  ids: Set<number>;
  /** Its best single-division way, hours. */
  best: number;
  /** Whether the first hour after the click has been read (its refusals). */
  read: boolean;
  /** Told broken already (once a click). */
  broke: boolean;
}

/** The clicks of one run and their bound; `out` gets each broken one once. */
export class SlowClicks {
  private open: Click[] = [];
  /** Clicks reckoned (a finite best way) and not (no way to reckon: not judged). */
  reckoned = 0;
  unreckoned = 0;
  /** Clicks that came ashore, and the latest of them past its best way: hours over, and its line. */
  ashore = 0;
  worst: { over: number; line: string } | null = null;

  constructor(private readonly out: (line: string) => void) {}

  /**
   * A click of `ids` (call before the step that applies it). `water` is its landing's water (`landingOf`), or -1
   * for an order that is no landing (home, a march): it only takes the divisions from earlier clicks. `land`, the
   * landing's land cell: those on its landmass walk and are not reckoned (`clickBest`).
   */
  click(w: World, ids: readonly number[], water: number, land = -1): void {
    for (const k of this.open) for (const id of ids) k.ids.delete(id);
    this.open = this.open.filter((k) => k.ids.size > 0);
    if (water < 0 || ids.length === 0) return;
    const best = clickBest(w, ids, water, land);
    if (!Number.isFinite(best)) {
      this.unreckoned++;
      return;
    }
    this.add(w.tick, ids, best);
  }

  /** A click made at `t0` whose best way was reckoned then (`clickBest`): a grid case's from its base's saved state. */
  add(t0: number, ids: readonly number[], best: number): void {
    this.reckoned++;
    this.open.push({ t0, ids: new Set(ids), best, read: false, broke: false });
  }

  /**
   * After each hour stepped: `landed`, the divisions ashore this hour on land not their nation's; `refused`, those
   * refused an order this hour.
   */
  hour(w: World, landed: ReadonlySet<number>, refused: ReadonlySet<number>): void {
    const f = w.formations;
    for (const k of this.open) {
      if (!k.read) {
        // Refused at the click: told why, and no landing of this click.
        for (const id of k.ids) if (refused.has(id)) k.ids.delete(id);
        k.read = true;
      }
      const first = [...k.ids].find((id) => landed.has(id));
      const over = w.tick - (k.t0 + k.best);
      const what = (verb: string): string => `t${w.tick} slowClick: t${k.t0}'s click of ${[...k.ids].join(',')} ${verb} ${((w.tick - k.t0) / 24).toFixed(1)} days, its best way ${(k.best / 24).toFixed(1)}`;
      if (first !== undefined) {
        this.ashore++;
        if (!this.worst || over > this.worst.over) this.worst = { over, line: what('ashore after') };
        if (over > SLOW_CLICK_DAYS * 24 && !k.broke) this.out(what('ashore after'));
        k.ids.clear();
        continue;
      }
      for (const id of [...k.ids]) if (!f.has(id) || landingOfDivision(w, id) === undefined) k.ids.delete(id);
      // Still on its way past the bound: broken now, not only when it lands (a run may end first).
      if (k.ids.size > 0 && over > SLOW_CLICK_DAYS * 24 && !k.broke) {
        k.broke = true;
        this.out(what('not ashore after'));
      }
    }
    this.open = this.open.filter((k) => k.ids.size > 0);
  }

  /** The figure for a report: clicks reckoned, ashore, and the worst's hours over its best way. */
  note(): string {
    return `slowClick: ${this.reckoned} clicks reckoned (${this.unreckoned} not), ${this.ashore} ashore; worst ${this.worst ? `${(this.worst.over / 24).toFixed(1)} days over its best way (${this.worst.line.replace(/^t\d+ slowClick: /, '')})` : 'none'}`;
  }
}
