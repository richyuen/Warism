import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landedAway, landingHeld, landingOf, seaOrderLanding } from '../../src/sim/systems/amphibious';
import { navOf } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R27c (ADR-827): a fuzz of re-clicks about a landing, the class critic runs 33–38 found
// one case at a time (R21–R26). Japan at war with China, its two or four divisions nearest Tokyo
// sent to Shanghai by one click (escort on); at hour 26 or 200 the one aboard (else the first
// bound), one walking to its port, or all of them, clicked again one, two or three cells off
// Shanghai in each of eight directions. From one saved state a case. For each division clicked
// again:
// - an order the map marks as its own landing (`same`) is taken, and it keeps its transports;
// - an order taken lands where the map marks: its landing after the order is the marked one, so
//   the worker's news, judged against the marked land (`landedAway`), tells no false failure;
// - a division taken off its transports, aboard or bound, is told it leaves its landing
//   (`LeftLanding`; on its own transports too, R28a) exactly when another still has that landing (on its transports, or a second
//   group sailing with them): a split landing is told, and a whole click sent elsewhere is not
//   told it lands without the rest (the first version of R25b told the one aboard so, the fuzz's
//   first find; a version judging by transports missed the second group);
// - the whole click re-clicked is refused nothing, and those of it bound for one landing load at one
//   port, to sail together (R28a, critic run 39, R39-B1: each division's order found the landing's
//   transports held by the rest, so all four were refused "no transports", or went one by one);
// - every player's convoy is for one landing: those aboard it and bound for it have one target.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const cell = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);
const DIRS: [number, number][] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

interface Base { sim: Sim; saved: Uint8Array; ids: number[] }

function base(n: number, hour: number): Base {
  const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = sim.world;
  w.settings.player = JAP;
  if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
  sim.step(1);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[cell(TOKYO[0], TOKYO[1])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[cell(c.x[id]!, c.y[id]!)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  const ids = all.sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  for (const id of ids) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true });
  const quiet = (x: Sim['world']): void => {
    x.out.events.length = 0;
    x.out.fires.length = 0;
  };
  while (w.tick < hour) sim.step(1, quiet);
  return { sim, saved: sim.save(), ids };
}

/** The violations of one case: the base's state, `again` clicked to Shanghai + (`dx`, `dy`). */
function reclick(b: Base, who: 'aboard' | 'walker' | 'all', dx: number, dy: number): string[] {
  const { sim, ids } = b;
  sim.load(b.saved);
  const w = sim.world;
  w.settings.player = JAP;
  const place = (id: number): number | undefined => w.embarked.get(id)?.fleet ?? w.seaFetch.get(id);
  const placed = ids.filter((id) => place(id) !== undefined);
  if (placed.length === 0) return [];
  const walker = placed.find((id) => !w.embarked.has(id));
  if (who === 'walker' && walker === undefined) return [];
  const again = who === 'all' ? placed : who === 'walker' ? [walker!] : [placed.find((id) => w.embarked.has(id)) ?? placed[0]!];
  const [x, y] = [SHANGHAI[0] + dx, SHANGHAI[1] + dy];
  const before = new Map(again.map((id) => [id, { place: place(id), held: landingHeld(w, id), aboard: w.embarked.has(id), mark: seaOrderLanding(w, id, x, y) }]));
  for (const id of again) sim.command({ kind: 'moveFormation', id, x, y, nation: JAP, escort: true });
  const refused = new Set<number>();
  const left = new Set<number>();
  sim.step(1, (s) => {
    const ev = s.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      if (ev[i + 1] === EventKind.MoveRejected) refused.add(ev[i + 2]!);
      if (ev[i + 1] === EventKind.LeftLanding) left.add(ev[i + 2]!);
    }
    s.out.events.length = 0;
    s.out.fires.length = 0;
  });
  const bad: string[] = [];
  const tag = `${who} (${dx},${dy}) ${ids.length}@${w.tick - 1}`;
  for (const id of again) {
    const was = before.get(id)!;
    const now = place(id);
    if (was.mark?.same) {
      if (refused.has(id)) bad.push(`${tag}: ${id} marked its own landing, refused`);
      if (now !== was.place) bad.push(`${tag}: ${id} marked its own landing, transports ${was.place} -> ${now}`);
    }
    if (!refused.has(id) && was.mark) {
      const e = w.embarked.get(id);
      const bound = w.seaBound.get(id);
      const l = e ? { water: e.water, land: e.land } : bound !== undefined ? landingOf(w, bound) : null;
      if (!l || l.land !== was.mark.land || l.water !== was.mark.water) bad.push(`${tag}: ${id} lands at ${l?.water}/${l?.land}, marked ${was.mark.water}/${was.mark.land}`);
      else if (landedAway(w, was.mark.land, (l.land % W) + 0.5, Math.floor(l.land / W) + 0.5)) bad.push(`${tag}: ${id} would be told it landed away`);
    }
    // Taken to another landing: on other transports, or on its own where they carry no one else (R28a).
    const same = (l: { water: number; land: number } | null): boolean => l !== null && was.held !== null && l.water === was.held.water && l.land === was.held.land;
    const held = landingHeld(w, id);
    const moved = was.held !== null && held !== null && !same(held) && !refused.has(id);
    const stays = moved && ids.some((o) => o !== id && same(landingHeld(w, o)));
    if (moved && stays && !left.has(id)) bad.push(`${tag}: ${id} ${was.aboard ? 'aboard' : 'bound'}, transports ${was.place} -> ${now}, others stay, untold`);
    if (left.has(id) && !stays) bad.push(`${tag}: ${id} told it leaves its landing, none stays`);
  }
  if (who === 'all') {
    const no = again.filter((id) => refused.has(id) && before.get(id)!.mark);
    if (no.length > 0) bad.push(`${tag}: the whole click refused ${no}`);
    const ports = new Map<string, Set<number | undefined>>();
    for (const id of again) {
      const l = landingHeld(w, id);
      const f = place(id);
      if (!l || f === undefined || w.embarked.has(id)) continue;
      const k = `${l.water}/${l.land}`;
      ports.set(k, (ports.get(k) ?? new Set()).add(w.convoyPort.get(f)));
    }
    for (const [k, p] of ports) if (p.size > 1) bad.push(`${tag}: one landing ${k} loads at ports ${[...p]}`);
  }
  for (const g of w.convoyPort.keys()) {
    const targets = new Set<number>();
    for (const [id, f] of w.seaFetch) if (f === g) targets.add(w.seaBound.get(id)!);
    for (const e of w.embarked.values()) if (e.fleet === g) targets.add(e.target);
    if (targets.size > 1) bad.push(`${tag}: convoy ${g} for ${targets.size} landings`);
  }
  return bad;
}

describe('a fuzz of re-clicks about a landing (ROADMAP R27c)', () => {
  for (const n of [2, 4]) {
    for (const hour of [26, 200]) {
      it(`${n} divisions to Shanghai, clicked again at hour ${hour} one to three cells off in eight directions: no violation`, () => {
        const b = base(n, hour);
        const bad: string[] = [];
        let cases = 0;
        for (const r of [1, 2, 3]) {
          for (const [ux, uy] of DIRS) {
            for (const who of ['aboard', 'walker', 'all'] as const) {
              bad.push(...reclick(b, who, ux * r, uy * r));
              cases++;
            }
          }
        }
        process.stderr.write(`R27c ${n}@${hour}: ${cases} cases, ${bad.length} violations\n${bad.join('\n')}\n`);
        expect(bad).toEqual([]);
      }, 600_000);
    }
  }
});
