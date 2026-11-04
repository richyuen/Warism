import { describe, expect, it } from 'vitest';
import { EventKind, RejectReason } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { navOf, type World } from '../../src/sim/world';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R21a (critic run 33, R33-N1): a player's order over the sea given at war, whose landing
// a peace makes the ground of a nation outside its wars before the division sails, is stopped and
// told (`Neutral`), as a march is stopped at the border; before, the division boarded weeks after
// the peace, landed on the former enemy's coast and was set home across the sea. Britain played,
// at war with Germany, the coast about Calais Germany's; divisions by London ordered there.

const { w: W, h: H } = SIZE_1938;
const ENG = nationId('ENG');
const FRA = nationId('FRA');
const GER = nationId('GER');
const CALAIS = cellOf(1.86, 50.95, W, H) as [number, number];
const CALAIS_CELL = Math.floor(CALAIS[1]) * W + Math.floor(CALAIS[0]);

/** Britain at war with Germany, Germany holding France's coast about Calais; Britain's `n` land divisions nearest London. */
function atWar(n: number): { s: Sim; w: World; divs: number[] } {
  const s = new Sim({ scenario: '1938', seed: 1, assets: assets1938(W) });
  const w = s.world;
  w.settings.player = ENG;
  s.command({ kind: 'declareWar', attacker: GER, defender: ENG });
  s.step(1);
  expect(w.wars.atWar(ENG, GER)).toBe(true);
  for (let y = Math.floor(CALAIS[1]) - 6; y <= Math.floor(CALAIS[1]) + 6; y++)
    for (let x = Math.floor(CALAIS[0]) - 6; x <= Math.floor(CALAIS[0]) + 6; x++) if (w.cells.controller[y * W + x] === FRA) w.cells.controller[y * W + x] = GER;
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const [lx, ly] = cellOf(-0.12, 51.5, W, H);
  const london = comp[Math.floor(ly) * W + Math.floor(lx)];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== ENG || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== london) return;
    all.push([id, (c.x[id]! - lx) ** 2 + (c.y[id]! - ly) ** 2]);
  });
  const divs = all.sort((a, b) => a[1] - b[1]).slice(0, n).map((d) => d[0]);
  expect(divs.length).toBe(n);
  return { s, w, divs };
}

/** Steps an hour; the MoveRejected reasons of `ids` in it, by formation. */
function hour(s: Sim, ids: number[]): Map<number, number> {
  const out = new Map<number, number>();
  s.step(1, (w) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.MoveRejected && ids.includes(ev[i + 2]!)) out.set(ev[i + 2]!, ev[i + 4]!);
    w.out.events.length = 0;
    w.out.fires.length = 0;
  });
  return out;
}

const peace = (s: Sim, w: World): void => {
  const war = w.wars.between(ENG, GER)!.war;
  s.command({ kind: 'forcePeace', war: war.id });
};

describe('a sea order does not outlive the peace (ROADMAP R21a)', () => {
  it('bound for its transports at the peace: stopped and told Neutral, never boards', () => {
    const { s, w, divs } = atWar(1);
    const [div] = divs as [number];
    s.command({ kind: 'moveFormation', id: div, x: CALAIS[0], y: CALAIS[1], nation: ENG });
    expect(hour(s, divs).has(div), 'the order at war goes').toBe(false);
    expect(w.seaFetch.has(div), 'bound for its transports').toBe(true);
    peace(s, w);
    const told = hour(s, divs);
    expect(w.wars.atWar(ENG, GER)).toBe(false);
    expect(told.get(div), 'told Neutral').toBe(RejectReason.Neutral);
    expect(w.seaFetch.has(div)).toBe(false);
    expect(w.seaBound.has(div)).toBe(false);
    // (Britain's AI may send it elsewhere by sea: not for Calais.)
    for (let h = 0; h < 24 * 30; h++) {
      hour(s, divs);
      expect(w.embarked.get(div)?.target, 'never boards for Calais').not.toBe(CALAIS_CELL);
    }
  });

  it('aboard a convoy still loading at the peace: it does not sail, and those aboard go ashore, told', () => {
    const { s, w, divs } = atWar(3);
    for (const id of divs) s.command({ kind: 'moveFormation', id, x: CALAIS[0], y: CALAIS[1], nation: ENG });
    // Until one is aboard a convoy that still loads for the others.
    let fleet = -1;
    for (let h = 0; h < 24 * 20 && fleet < 0; h++) {
      hour(s, divs);
      for (const id of divs) {
        const e = w.embarked.get(id);
        if (e && w.convoyPort.has(e.fleet) && w.formations.cols.moving[e.fleet] === 0 && [...w.seaFetch.values()].includes(e.fleet)) fleet = e.fleet;
      }
    }
    expect(fleet, 'a convoy loading with someone aboard').toBeGreaterThan(0);
    const aboard = divs.filter((id) => w.embarked.get(id)?.fleet === fleet);
    peace(s, w);
    const told = new Map<number, number>();
    for (let h = 0; h < 3; h++) for (const [id, r] of hour(s, divs)) told.set(id, r);
    for (const id of aboard) {
      expect(told.get(id), `${id} told`).toBe(RejectReason.Neutral);
      expect(w.embarked.has(id), `${id} ashore`).toBe(false);
    }
    expect(w.convoyPort.has(fleet), 'the convoy is over').toBe(false);
    for (let h = 0; h < 24 * 30; h++) {
      hour(s, divs);
      for (const id of divs) expect(w.embarked.get(id)?.target, `${id} never sails for Calais`).not.toBe(CALAIS_CELL);
    }
  });
});
