import { describe, expect, it } from 'vitest';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { landingOf } from '../../src/sim/systems/amphibious';
import { AT_PORT_CELLS } from '../../src/sim/systems/navalCombat';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { landingId, nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R22d (critic run 34, R34-N1): the escort of a convoy is not sent weeks ahead. The critic's
// case: Japan at war with China, its four divisions nearest Tokyo to Shanghai by one click, the
// escort asked for; the first boards at Tokyo at once and waits weeks for the last (R21e). Before,
// the escorts sailed at the click and stood at Shanghai's water from hour 23 to the landing. Now
// each is kept where it stands and sails once its voyage would take as long as the wait left: at
// the landing's water no more than a day before the last is aboard, there before its transports,
// and the four land together, no later than the same click without the escort.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const ENG = nationId('ENG');
const LONDON = cellOf(-0.12, 51.5, W, H) as [number, number];
const BELFAST = cellOf(-5.93, 54.6, W, H) as [number, number];

const at = (w: World, id: number): number => Math.floor(w.formations.cols.y[id]!) * W + Math.floor(w.formations.cols.x[id]!);
const near = (a: number, b: number, r: number): boolean => Math.abs((a % W) - (b % W)) <= r && Math.abs(Math.floor(a / W) - Math.floor(b / W)) <= r;

interface Run {
  landed: number[];
  unescorted: number;
  escorts: number;
  ready: number;
  firstEscort: number;
  escortThere: Map<number, number>;
  transportsThere: Map<number, number>;
}

function shanghai(escort: boolean): Run {
  const sim = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = sim.world;
  w.settings.player = JAP;
  if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
  sim.step(1);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[at(w, id)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  const four = all.sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]);
  // ROADMAP R43a: placed so that Tokyo is each one's own port (else one whose own port is a week sooner makes a landing
  // of its own there, a sibling): this test's one landing at Tokyo.
  nearPort(w, four, portNamed(w, 'Tokyo'), [0, 2, 4, 6]);
  for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort });
  const water = landingOf(w, Math.floor(SHANGHAI[1]) * W + Math.floor(SHANGHAI[0]))!.water;
  const r = w.atSize(AT_PORT_CELLS);
  const landed = new Map<number, number>();
  const run: Run = { landed: [], unescorted: 0, escorts: 0, ready: -1, firstEscort: -1, escortThere: new Map(), transportsThere: new Map() };
  const seen = new Set<number>();
  for (let h = 0; h < 24 * 80 && landed.size < 4; h++) {
    sim.step(1, (x) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.FormationLanded && four.includes(ev[i + 2]!)) landed.set(ev[i + 2]!, x.tick);
        if (ev[i + 1] === EventKind.ConvoyUnescorted && four.includes(ev[i + 2]!)) run.unescorted++;
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
    for (const [o, e] of w.escorts) {
      seen.add(o);
      if (!near(at(w, o), water, r)) continue;
      if (!run.escortThere.has(e.convoy)) run.escortThere.set(e.convoy, w.tick);
      if (run.firstEscort < 0) run.firstEscort = w.tick;
    }
    // By landing (ROADMAP R33b: an escort is its landing's, `e.convoy` its id).
    for (const [id, e] of w.embarked) {
      const l = landingId(w, id);
      if (four.includes(id) && l !== undefined && near(at(w, e.fleet), water, r) && !run.transportsThere.has(l)) run.transportsThere.set(l, w.tick);
    }
    if (run.ready < 0 && four.every((id) => w.embarked.has(id))) run.ready = w.tick;
  }
  run.landed = [...landed.values()];
  run.escorts = seen.size;
  return run;
}

describe('the escort is not sent weeks ahead (ROADMAP R22d)', () => {
  it("Japan's four to Shanghai: the escort there within a day of the last aboard, before the transports; landed together, no later than unescorted", () => {
    const plain = shanghai(false);
    const run = shanghai(true);
    process.stderr.write(`R22d: unescorted landed ${plain.landed}; escorted: ${run.escorts} escorts, all aboard ${run.ready}, escorts there ${[...run.escortThere.values()]}, transports there ${[...run.transportsThere.values()]}, landed ${run.landed}
`);
    expect(plain.landed.length).toBe(4);
    expect(run.landed.length, 'all four landed').toBe(4);
    expect(run.unescorted, 'not told it sails alone').toBe(0);
    expect(run.escorts, 'escorted').toBeGreaterThan(0);
    expect(run.ready, 'all four aboard').toBeGreaterThan(0);
    expect(run.firstEscort, 'no escort at the landing water more than a day before the last is aboard').toBeGreaterThanOrEqual(run.ready - 24);
    for (const [g, t] of run.transportsThere) {
      expect(run.escortThere.get(g), `landing ${g}'s escort there`).toBeDefined();
      expect(run.escortThere.get(g)!, `landing ${g}'s escort there first`).toBeLessThanOrEqual(t);
    }
    expect(Math.max(...run.landed) - Math.min(...run.landed), 'landed together').toBeLessThanOrEqual(24);
    expect(Math.max(...run.landed), 'no later than without the escort, a day of grace').toBeLessThanOrEqual(Math.max(...plain.landed) + 24);
  });

  // R17d's own case, one division: its escort sails at the click (its voyage is longer than the march).
  // ROADMAP R23d (critic run 35, R35-N3): the critic's own, the fourth nearest London, which stands at
  // the port and boards at once; the nearest warfleet by straight cells had a coast to go round, and
  // the loaded transports waited for it (landed 73 against 59).
  it.each([
    { nth: 0, label: 'the nearest' },
    { nth: 3, label: 'the fourth nearest' },
  ])("Britain's division to Belfast ($label London): landed no later with the escort than without", ({ nth }) => {
    const hour = (escort: boolean): number => {
      const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
      const w = s.world;
      w.settings.player = ENG;
      const c = w.formations.cols;
      const comp = navOf(w).grid.component;
      const london = Math.floor(LONDON[1]) * W + Math.floor(LONDON[0]);
      const near: [number, number][] = [];
      w.formations.forEach((id) => {
        if (c.nation[id] !== ENG || w.isFleet(id) || w.offLand(id) || comp[at(w, id)] !== comp[london]) return;
        near.push([id, (c.x[id]! - LONDON[0]) ** 2 + (c.y[id]! - LONDON[1]) ** 2]);
      });
      const div = near.sort((a, b) => a[1] - b[1] || a[0] - b[0])[nth]![0];
      s.command({ kind: 'moveFormation', id: div, x: BELFAST[0], y: BELFAST[1], nation: ENG, escort });
      let landed = -1;
      for (let h = 0; h < 24 * 30 && landed < 0; h++) {
        s.step(1, (x) => {
          const ev = x.out.events;
          for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.FormationLanded && ev[i + 2] === div) landed = x.tick;
          x.out.events.length = 0;
          x.out.fires.length = 0;
        });
      }
      return landed;
    };
    const [plain, escorted] = [hour(false), hour(true)];
    process.stderr.write(`R22d/R23d: Belfast (${nth}) landed ${plain} unescorted, ${escorted} escorted
`);
    expect(plain).toBeGreaterThan(0);
    expect(escorted, 'landed').toBeGreaterThan(0);
    expect(escorted, 'no later with the escort').toBeLessThanOrEqual(plain);
  });
});
