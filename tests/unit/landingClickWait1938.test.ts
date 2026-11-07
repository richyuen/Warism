import { describe, expect, it } from 'vitest';
import type { FormationDetail } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { LandingState, landingOfDivision, seaHint } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { sameText } from '../../src/ui/seaHintText';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R42a (critic run 49, R49-N5): Tokyo to Shanghai took 26 days, 21 of them at the port waiting for a division
// marching 22 cells, and the click did not say how long. Under the cursor after the click, the landing they already
// have says when it sails, in days; the one it waits for says its days to the port in its panel. R22c's case: Japan's
// four divisions nearest Tokyo to Shanghai by one click, the last walking from the north of Honshu for weeks.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

describe('a click says how long its landing waits (ROADMAP R42a)', () => {
  it("Japan's four to Shanghai: the hint's days till it sails from Tokyo, kept; the last one's panel its days", () => {
    const s = new SimServer(() => {});
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 1, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
    const sim = s.sim!;
    const w = sim.world;
    if (!w.wars.atWar(JAP, CHI)) sim.command({ kind: 'declareWar', attacker: JAP, defender: CHI });
    sim.step(1);
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    const four = all.sort((a, b) => a[1] - b[1]).slice(0, 4).map((d) => d[0]).sort((a, b) => a - b);
    const clear = (x: World): void => {
      x.out.events.length = 0;
      x.out.fires.length = 0;
    };
    // Before the click: no landing, no days.
    expect(seaHint(w, four, SHANGHAI[0], SHANGHAI[1]).sails).toBeUndefined();
    for (const id of four) sim.command({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP });
    sim.step(1, clear);
    const hint = seaHint(w, four, SHANGHAI[0], SHANGHAI[1]);
    expect(hint.how).toBe(1);
    expect(hint.same).toBe(true);
    expect(hint.sails, 'the days till it sails').toBeDefined();
    const l = landingOfDivision(w, four[0]!)!;
    expect(hint.sails!.port).toBe(w.ports[l.port]!.name);
    expect(hint.sails!.days, 'weeks').toBeGreaterThan(3);
    expect(sameText(hint)).toContain(`it sails from ${hint.sails!.port} in about ${hint.sails!.days} days`);
    // The one it waits for: its days to the port in its panel.
    const voyage = (id: number): FormationDetail['voyage'] => (s as unknown as { voyageOf(w: World, id: number): FormationDetail['voyage'] }).voyageOf(w, id);
    const marching = four.filter((id) => voyage(id)?.state === 'toPort' && (voyage(id)?.days ?? 0) > 1);
    expect(marching.length, 'one marching days off').toBeGreaterThan(0);
    expect(Math.max(...marching.map((id) => voyage(id)!.days!))).toBeLessThanOrEqual(hint.sails!.days);
    // It sails within the days said (a day's grace), and not long before.
    const said = hint.sails!.days;
    const from = w.tick;
    let sailed = -1;
    for (let h = 0; h < 24 * 80 && sailed < 0; h++) {
      sim.step(1, clear);
      const now = landingOfDivision(w, four[0]!);
      if (!now || now.state !== LandingState.gathering) sailed = w.tick;
    }
    expect(sailed, 'it sailed').toBeGreaterThan(0);
    const took = (sailed - from) / 24;
    process.stderr.write(`R42a: said ${said} days at hour ${from}; sailed after ${took.toFixed(1)} days\n`);
    expect(took).toBeLessThanOrEqual(said + 1);
    expect(took).toBeGreaterThan(said * 0.6);
  }, 300_000);
});
