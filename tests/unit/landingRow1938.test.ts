import { describe, expect, it } from 'vitest';
import type { LandingRow } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { LandingState, landingOfDivision, seaHint, voyageOf } from '../../src/sim/systems/landings';
import { navOf } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nearPort, portNamed } from '../helpers/landings';
import { nationId } from '../helpers/sim1938';

// ROADMAP R47a (the critic's idea since run 32: "a landing as one row"): the worker sends the player's landings in rows,
// read from `world.landings`. R42a's case: Japan's four divisions nearest Tokyo to Shanghai by one click. Each hour the
// row has the four, each with what its panel says; gathering, it says when it sails as the click's hint does, and its
// transport ships needed and had; then it sails; once all are ashore it is over, "landed", 4 landed, kept a day.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

describe("the player's landings in rows (ROADMAP R47a)", () => {
  it("Japan's four to Shanghai: one row, its divisions' panels, its days and ships; over, landed, for a day", () => {
    let rows: LandingRow[] = [];
    let sent = 0;
    const s = new SimServer((msg) => {
      if (msg.type === 'landings') {
        rows = msg.rows;
        sent++;
      }
    });
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
    const sim = s.sim!;
    const w = sim.world;
    if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
    s.handle({ type: 'step', reqId: 2, n: 1 }, 2);
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    const four = all.sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]).sort((a, b) => a - b);
    nearPort(w, four, portNamed(w, 'Tokyo'), [0, 2, 5, 8]);
    expect(rows, 'no landing, no row').toEqual([]);
    s.handle({ type: 'cmds', cmds: four.map((id) => ({ kind: 'moveFormation' as const, id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP })) }, 3);
    s.handle({ type: 'step', reqId: 3, n: 1 }, 4);
    // Gathering: one row, the four, each as its panel; its days as the click's hint; ships needed and had.
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    const l = landingOfDivision(w, four[0]!)!;
    expect(row.id).toBe(l.id);
    expect(row.state).toBe('gathering');
    expect(row.port).toBe('Tokyo');
    expect(row.target, 'the city nearest its land').toMatch(/^=/);
    expect(row.divisions.map((d) => d.id)).toEqual(four);
    for (const d of row.divisions) expect(d.voyage).toEqual(voyageOf(w, d.id));
    const hint = seaHint(w, four, SHANGHAI[0], SHANGHAI[1]);
    expect(row.sails?.days, 'as the hint says').toBe(hint.sails!.days);
    expect(row.ships.need, "four divisions' men").toBeGreaterThan(0);
    // Hour by hour until it is over: each row's divisions as their panels; it sails before it is over.
    let sailed = false;
    let over: LandingRow | undefined;
    for (let h = 0; h < 24 * 60 && !over; h++) {
      s.handle({ type: 'step', reqId: 10 + h, n: 1 }, 10 + h);
      const r = rows.find((x) => x.id === row.id)!;
      expect(r, 'the row stays until a day after').toBeDefined();
      if (r.state === 'over') over = r;
      else for (const d of r.divisions) expect(d.voyage, `t${w.tick} ${d.id}`).toEqual(voyageOf(w, d.id));
      if (r.state === 'sailing') sailed = true;
    }
    expect(sailed, 'it sailed').toBe(true);
    expect(over?.outcome?.kind).toBe('landed');
    expect(over?.outcome?.landed).toBe(4);
    expect(over?.outcome?.lost).toBe(0);
    // Kept a day, then gone; nothing sent while nothing changes.
    s.handle({ type: 'step', reqId: 9000, n: 23 }, 9000);
    expect(rows.find((x) => x.id === row.id)?.state).toBe('over');
    s.handle({ type: 'step', reqId: 9001, n: 1 }, 9001);
    expect(rows.find((x) => x.id === row.id)).toBeUndefined();
    const before = sent;
    s.handle({ type: 'step', reqId: 9002, n: 24 }, 9002);
    expect(sent, 'the same rows are not sent again').toBe(before);
  });
});

/** R42a's case: Japan played, its four divisions nearest Tokyo, put by the port, ordered to Shanghai by one click. */
function fourToShanghai(): { s: SimServer; rows: () => LandingRow[]; four: number[] } {
  let rows: LandingRow[] = [];
  const s = new SimServer((msg) => {
    if (msg.type === 'landings') rows = msg.rows;
  });
  s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
  s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
  const w = s.sim!.world;
  if (!w.wars.atWar(JAP, CHI)) s.sim!.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
  s.handle({ type: 'step', reqId: 2, n: 1 }, 2);
  const c = w.formations.cols;
  const comp = navOf(w).grid.component;
  const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
  const all: [number, number][] = [];
  w.formations.forEach((id) => {
    if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
    all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
  });
  const four = all.sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]).sort((a, b) => a - b);
  nearPort(w, four, portNamed(w, 'Tokyo'), [0, 2, 5, 8]);
  s.handle({ type: 'cmds', cmds: four.map((id) => ({ kind: 'moveFormation' as const, id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP })) }, 3);
  s.handle({ type: 'step', reqId: 3, n: 1 }, 4);
  return { s, rows: () => rows, four };
}

/** The row's cancel (R47c, R48a): the worker gives its divisions the click's orders. */
function cancel(s: SimServer, r: LandingRow): void {
  s.handle({ type: 'cancelLanding', id: r.id }, 5);
}

const step = (s: SimServer, n = 1): void => s.handle({ type: 'step', reqId: 0, n }, 0);

describe("a landing's cancel from its row (ROADMAP R47c, R48a)", () => {
  // R48a (critic run 51, R51-N1): on 21107 a gathering landing's cancel marched its divisions a week on to Hamburg while
  // the row said "back at Hamburg". Those ashore stop where they stand; the row says so.
  it('gathering at Tokyo: its divisions leave it where they stand; over at once, "stopped where they stood"', () => {
    const { s, rows, four } = fourToShanghai();
    const w = s.sim!.world;
    const c = w.formations.cols;
    const row = rows()[0]!;
    expect(row.state).toBe('gathering');
    const at = new Map(four.map((id) => [id, [c.x[id]!, c.y[id]!] as const]));
    cancel(s, row);
    step(s);
    const over = rows().find((r) => r.id === row.id)!;
    expect(over.state, 'over in the hour').toBe('over');
    expect(over.outcome).toMatchObject({ kind: 'cancelled', landed: 0, lost: 0, home: 0, stopped: 4, ai: true });
    expect(over.divisions.map((d) => d.voyage), "over: no landing's words").toEqual(four.map(() => null));
    for (const id of four) {
      expect(w.embarked.has(id), `${id} ashore`).toBe(false);
      expect(landingOfDivision(w, id), `${id} in no landing`).toBeUndefined();
      expect(Math.hypot(c.x[id]! - at.get(id)![0], c.y[id]! - at.get(id)![1]), `${id} where it stood`).toBeLessThan(0.6);
    }
  });

  it('at sea: it turns back, its divisions go ashore at Tokyo; over, "back at Tokyo", none lost', () => {
    const { s, rows, four } = fourToShanghai();
    const w = s.sim!.world;
    const id = rows()[0]!.id;
    for (let h = 0; h < 24 * 60 && rows().find((r) => r.id === id)?.state !== 'sailing'; h++) step(s);
    const sailing = rows().find((r) => r.id === id)!;
    expect(sailing.state).toBe('sailing');
    // A few hours out of port.
    step(s, 3);
    cancel(s, rows().find((r) => r.id === id)!);
    step(s);
    expect(rows().find((r) => r.id === id)?.state, 'turned back').toBe('returning');
    for (let h = 0; h < 24 * 10 && rows().find((r) => r.id === id)?.state !== 'over'; h++) step(s);
    const over = rows().find((r) => r.id === id)!;
    expect(over.outcome).toMatchObject({ kind: 'cancelled', landed: 0, lost: 0, home: 4, stopped: 0 });
    const port = w.ports.find((p) => p.name === sailing.port)!.cell;
    for (const d of four) {
      expect(w.embarked.has(d), `${d} ashore`).toBe(false);
      const c = w.formations.cols;
      expect(Math.hypot(c.x[d]! - ((port % W) + 0.5), c.y[d]! - (Math.floor(port / W) + 0.5)), `${d} by Tokyo`).toBeLessThan(12);
    }
  });

  // R48a: one ashore, bound for its next voyage (put in the landing as one is), with those aboard at sea: the cancel
  // turns back those aboard and stops that one (before, the click was refused for those aboard: the landing sailed on).
  it('at sea with one ashore for the next voyage: those aboard turn back, that one stops; "4 back at Tokyo, 1 stopped"', () => {
    const { s, rows, four } = fourToShanghai();
    const w = s.sim!.world;
    const c = w.formations.cols;
    const id = rows()[0]!.id;
    for (let h = 0; h < 24 * 60 && rows().find((r) => r.id === id)?.state !== 'sailing'; h++) step(s);
    step(s, 3);
    let late = 0;
    w.formations.forEach((f) => {
      if (late === 0 && c.nation[f] === JAP && !w.isFleet(f) && !w.offLand(f) && !four.includes(f) && landingOfDivision(w, f) === undefined) late = f;
    });
    w.landings.get(id)!.divisions.set(late, w.tick);
    const at = [c.x[late]!, c.y[late]!];
    cancel(s, { ...rows().find((r) => r.id === id)!, divisions: [...four, late].map((d) => ({ id: d, voyage: null })) });
    step(s);
    expect(w.landings.get(id)?.state, 'turned back').toBe(LandingState.returning);
    expect(landingOfDivision(w, late), 'the one ashore left it').toBeUndefined();
    for (let h = 0; h < 24 * 10 && rows().find((r) => r.id === id)?.state !== 'over'; h++) step(s);
    const over = rows().find((r) => r.id === id)!;
    expect(over.outcome).toMatchObject({ kind: 'cancelled', home: 4, stopped: 1 });
    expect(Math.hypot(c.x[late]! - at[0]!, c.y[late]! - at[1]!), 'it stopped where it stood').toBeLessThan(0.6);
  });
});
