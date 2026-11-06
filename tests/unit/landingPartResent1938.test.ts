import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { LandingState, landingOfDivision, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { GRID_SETUPS } from '../helpers/landingGrid';
import { nationId } from '../helpers/sim1938';

// ROADMAP R36a (critic run 44, R44-B1): part of a gathering landing re-sent elsewhere by one click kept too few
// transports; at the sail hour it boarded what fit and sailed, and the rest stood at the port, untold, landing
// alone weeks later (3517, four to Shanghai, two re-sent to Fuzhou: 656 / 951; three re-sent: 975 / 1270 / 1565;
// the four re-sent one an hour: two never). A landing now sails with room for all at its port, a group called
// when short. The four nearest the capital sent to the first target by one click (escort on); two hours after the
// first stands at its port, `who` re-sent to the other by one click (or each an hour apart): every division of
// that click lands within a day of the others, or is told why.
// ROADMAP R37a (critic run 45, R45-B1): the same where the group the re-send freed was busy (seed 18705, three of
// four: 976/977/1272): the new landing takes the groups its click freed. R45-N1: the re-sent part landed 5.5 days
// later than at `813eb375` (3517, two re-sent: 788/789; `813eb375` 656/657): no more than a day later now.
// R37b (R45-N1): while all of the new landing stand at its port, its panel never says it waits for the rest.

const { w: W } = SIZE_1938;

interface Resent {
  landed: Map<number, number>;
  told: Set<number>;
  ids: number[];
  /** Panel states seen while all of the re-sent part's landing stood at its port, gathering. */
  allThere: Set<string>;
}

function resend(seed: number, who: number[], hourly = false, setupSeed = seed): Resent {
  const setup = GRID_SETUPS.find((s) => s.seed === setupSeed)!;
  const [n, e] = [nationId(setup.nation), nationId(setup.enemy)];
  const sim = new Sim({ scenario: '1938', seed, assets: assets1938(W) });
  const w = sim.world;
  const landed = new Map<number, number>();
  const told = new Set<number>();
  const allThere = new Set<string>();
  let ids: number[] = [];
  const take = (x: World): void => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const id = ev[i + 2]!;
      if (!ids.includes(id)) continue;
      if (ev[i + 1] === EventKind.FormationLanded && !landed.has(id)) landed.set(id, x.tick);
      if (ev[i + 1] === EventKind.MoveRejected) told.add(id);
    }
    ev.length = 0;
    x.out.fires.length = 0;
  };
  sim.command({ kind: 'setPlayer', nation: n });
  sim.step(1, take);
  if (!w.wars.atWar(n, e)) sim.command(setup.force ? { kind: 'forceWar', attacker: n, defender: e } : { kind: 'declareWar', attacker: n, defender: e });
  sim.step(1, take);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const at = (x: number, y: number): number => Math.floor(y) * W + Math.floor(x);
  const home = comp[at(setup.home[0], setup.home[1])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== n || w.isFleet(id) || w.offLand(id) || comp[at(c.x[id]!, c.y[id]!)] !== home) return;
    all.push([id, (c.x[id]! - setup.home[0]) ** 2 + (c.y[id]! - setup.home[1]) ** 2]);
  });
  ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 4).map((d) => d[0]);
  const click = (sel: number[], [x, y]: [number, number]): void => {
    for (const id of [...sel].sort((a, b) => a - b)) sim.command({ kind: 'moveFormation', id, x, y, nation: n, escort: true } as Command);
    sim.applyNow(take);
  };
  click(ids, setup.a);
  const atPort = (): boolean => ids.some((id) => landingOfDivision(w, id) !== undefined && c.moving[id] !== 1 && !w.embarked.has(id));
  for (let h = 0; h < 24 * 30 && !atPort(); h++) sim.step(1, take);
  expect(atPort(), 'one at its port').toBe(true);
  sim.step(2, take);
  const sent = who.map((i) => ids[i]!);
  if (hourly) {
    for (const id of sent) {
      click([id], setup.b);
      sim.step(1, take);
    }
  } else click(sent, setup.b);
  const watch = (): void => {
    const l = landingOfDivision(w, sent[0]!);
    if (!l || l.state !== LandingState.gathering) return;
    if ([...l.divisions.keys()].every((id) => c.moving[id] !== 1 && !w.embarked.has(id))) for (const id of l.divisions.keys()) allThere.add(voyageOf(w, id)?.state ?? '-');
  };
  for (let h = 0; h < 24 * 90 && sent.some((id) => w.formations.has(id) && !landed.has(id) && !told.has(id)); h++) {
    sim.step(1, take);
    watch();
  }
  return { landed, told, ids: sent, allThere };
}

function together(r: Resent): void {
  const untold = r.ids.filter((id) => !r.told.has(id));
  const at = untold.map((id) => r.landed.get(id));
  expect(at.every((t) => t !== undefined), `each landed or told: ${JSON.stringify([...r.landed])}`).toBe(true);
  if (at.length > 1) expect(Math.max(...(at as number[])) - Math.min(...(at as number[])), `within a day: ${JSON.stringify([...r.landed])}`).toBeLessThanOrEqual(24);
  expect([...r.allThere].filter((s) => s === 'gathering'), 'all at the port: not "waiting for the rest"').toEqual([]);
}

describe('part of a landing re-sent by one click keeps room for all of it (ROADMAP R36a, R37a)', () => {
  for (const seed of [3517, 15101]) {
    for (const who of [[0, 1], [0, 1, 2], [0, 3]]) {
      it(`seed ${seed}: four sent, ${who.join('/')} re-sent by one click: they land within a day, or are told`, () => {
        together(resend(seed, who));
      }, 300_000);
    }
  }
  it('seed 3517: the four re-sent one an hour: they land within a day, or are told', () => {
    together(resend(3517, [0, 1, 2, 3], true));
  }, 300_000);
  it('seed 18705 (Japan, R45-B1: the group freed was busy): 0/1/2 re-sent: they land within a day', () => {
    together(resend(18705, [0, 1, 2], false, 3517));
  }, 300_000);
  it('seed 3517: 0/1 re-sent: they land no later than a day after 813eb375 did (h656/657; R45-N1: h788/789)', () => {
    const r = resend(3517, [0, 1]);
    together(r);
    expect(Math.max(...r.landed.values()), 'the last landed by h681').toBeLessThanOrEqual(681);
  }, 300_000);
});
