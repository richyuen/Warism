import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { destroyFormation } from '../../src/sim/systems/elements';
import { LandingState, landingOfDivision, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { nationId } from '../helpers/sim1938';

// ROADMAP R38a (critic run 46, R46-B1): a landing's transports sunk at sea with its divisions aboard: in that hour
// the landing, with no groups, ended as "no transports", and the divisions, lost with them, were told "not done: no
// transports of its nation with room for it are at a port it can reach"; nothing said they were lost (Britain 19113,
// landingInvariants `aboardNoLanding`). Seed 3517, Japan's two nearest Tokyo sent to Shanghai (escort on); a day
// after it sails, its transport groups are destroyed: no refusal, each told it was lost at sea with them, the landing
// over, and no panel state for them in the hour.

const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const SHANGHAI = cellOf(121.47, 31.23, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];

describe("a landing's transports sunk at sea (ROADMAP R38a)", () => {
  it('its divisions are lost with them, told so, not refused; the landing is over', () => {
    const news: OrderNews[] = [];
    const s = new SimServer((m: FromWorker) => {
      if (m.type === 'orderNews') news.push(m.news);
    });
    s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed: 3517, assets: assets1938(W) } }, 0);
    s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
    const w = s.sim!.world;
    if (!w.wars.atWar(JAP, CHI)) s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: JAP, defender: CHI }, now: true }, 1);
    const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
    const step = (): void => s.sim!.step(1, drain);
    step();
    const c = w.formations.cols;
    const comp = navOf(w).grid.component;
    const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
    const all: [number, number][] = [];
    w.formations.forEach((id) => {
      if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
      all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
    });
    const pair = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, 2).map((d) => d[0]);
    const cmds: Command[] = pair.map((id) => ({ kind: 'moveFormation', id, x: SHANGHAI[0], y: SHANGHAI[1], nation: JAP, escort: true }));
    s.handle({ type: 'cmds', cmds, now: true }, 2);
    const sailing = (): boolean => pair.every((id) => w.embarked.has(id) && landingOfDivision(w, id)?.state === LandingState.sailing);
    for (let h = 0; h < 24 * 60 && !sailing(); h++) step();
    expect(sailing(), 'the two at sea').toBe(true);
    for (let h = 0; h < 24; h++) step();
    const l = landingOfDivision(w, pair[0]!)!;
    news.length = 0;
    for (const o of [...l.fleets]) destroyFormation(w, o);
    const states = pair.map((id) => voyageOf(w, id)?.state ?? null);
    step();
    expect(news.filter((n) => n.kind === 'refused'), 'none refused').toEqual([]);
    expect(news.filter((n) => n.kind === 'lostAtSea').map((n) => n.id).sort((a, b) => a - b), 'each told it was lost at sea').toEqual([...pair].sort((a, b) => a - b));
    expect(states.filter((v) => v === 'nextVoyage'), 'no "next voyage" for those whose transports are gone').toEqual([]);
    for (const id of pair) expect(w.formations.has(id), `${id} lost`).toBe(false);
    expect(w.landings.has(l.id), 'the landing is over').toBe(false);
  }, 300_000);
});
