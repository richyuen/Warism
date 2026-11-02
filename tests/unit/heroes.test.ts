import { describe, expect, it } from 'vitest';
import { HEROES_1938, NATIONS_1938, SIZE_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { Refusal } from '../../src/shared/commands';
import { Domain, type World } from '../../src/sim/world';
import { isMonthStart } from '../../src/shared/calendar';
import { assets1938 } from '../helpers/earth';

// PLAN 7.184a1: heroes, a new-game option of the 1938 world. With it off the world is as before;
// on, 14 heroes at the start (sea at the water of its nation's first naval base, land at its
// capital), saved with the world, and never disbanded, laid up, folded or refilled by the AI.

const W = SIZE_1938.w;
const make = (heroes?: 'on' | 'off'): Sim => new Sim({ scenario: '1938', seed: 99, assets: assets1938(W), ...(heroes ? { options: { heroes } } : {}) });
const tagOf = (n: number): string => NATIONS_1938[n - 1]!.tag;
const heroIds = (w: World): number[] => [...w.heroes.keys()].sort((a, b) => a - b);

describe('heroes (PLAN 7.184a1)', () => {
  it('off: no hero, and the world is the one with no option', () => {
    const off = make('off');
    expect(off.world.heroes.size).toBe(0);
    expect(off.world.heroRoster.length).toBe(0);
    expect(off.hash()).toBe(make().hash());
  });

  it('on: 14 heroes at tick 0, sea at its port water, land at its capital; one each of land and sea for 7 nations', () => {
    const sim = make('on');
    const w = sim.world;
    const f = w.formations.cols;
    expect(w.heroRoster.length).toBe(14);
    expect(w.heroes.size).toBe(14);
    const seen = new Map<string, string[]>();
    for (const id of heroIds(w)) {
      const row = w.heroRoster[w.heroes.get(id)!]!;
      const def = HEROES_1938.find((h) => h.template === TEMPLATES_1938[row.template]!.id)!;
      expect(tagOf(f.nation[id]!), def.template).toBe(def.nation);
      expect(f.template[id]).toBe(row.template);
      expect(w.rules!.templates[row.template]!.hero, def.template).toBe(true);
      expect([f.x[id], f.y[id]]).toEqual([row.x, row.y]);
      // Whole: one element of one unit, its strength the template's men.
      expect(f.strength[id]!, def.template).toBeGreaterThan(0);
      seen.set(def.nation, [...(seen.get(def.nation) ?? []), def.domain]);
      if (def.domain === 'sea') {
        expect(w.isFleet(id), def.template).toBe(true);
        // At the water of its port, as the nation's fleets of the start that are based there.
        const port = w.ports.find((p) => p.name === def.port)!;
        expect(Math.hypot(f.x[id]! - port.x, f.y[id]! - port.y), `${def.template} from ${def.port}, cells`).toBeLessThan(6);
        expect(w.seaPoint(Math.floor(f.y[id]!) * w.cells.w + Math.floor(f.x[id]!)), `${def.template} on water`).not.toBeNull();
      } else {
        expect(w.rules!.templates[row.template]!.domain).toBe(Domain.land);
        const n = f.nation[id]!;
        const [cx, cy] = w.standPoint(w.nations.cols.capitalX[n]!, w.nations.cols.capitalY[n]!);
        expect(Math.hypot(f.x[id]! - cx, f.y[id]! - cy), `${def.template} at the capital`).toBeLessThan(0.01);
      }
    }
    expect([...seen.keys()].sort()).toEqual(['ENG', 'FRA', 'GER', 'ITA', 'JAP', 'SOV', 'USA']);
    for (const d of seen.values()) expect(d.sort()).toEqual(['land', 'sea']);
  });

  it('save and load keep the heroes, their rows and the hash', () => {
    const a = make('on');
    a.step(48);
    const b = make('off');
    b.load(a.save());
    expect(b.hash()).toBe(a.hash());
    expect([...b.world.heroes].sort((x, y) => x[0] - y[0])).toEqual([...a.world.heroes].sort((x, y) => x[0] - y[0]));
    expect(b.world.heroRoster).toEqual(a.world.heroRoster);
    // A world loaded from one with no heroes has none.
    b.load(make('off').save());
    expect(b.world.heroes.size).toBe(0);
    expect(b.world.heroRoster.length).toBe(0);
  });

  it('never built, queued or placed by God', () => {
    const sim = make('on');
    const hero = sim.world.rules!.templates.findIndex((t) => t.hero && t.domain === Domain.land);
    const sea = sim.world.rules!.templates.findIndex((t) => t.hero && t.domain === Domain.sea);
    const ger = NATIONS_1938.findIndex((n) => n.tag === 'GER') + 1;
    const refusals: number[] = [];
    const before = sim.world.formations.count;
    const queued = sim.world.production.count;
    const [x, y] = [sim.world.nations.cols.capitalX[ger]!, sim.world.nations.cols.capitalY[ger]!];
    sim.command({ kind: 'queueFormation', nation: ger, template: hero });
    sim.command({ kind: 'spawnFormation', nation: ger, x, y, strength: 0, template: hero });
    sim.command({ kind: 'spawnFleet', nation: ger, x, y, template: sea, free: true });
    sim.applyNow((w) => {
      const ev = w.out.events;
      for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.CommandRefused) refusals.push(ev[i + 3]!);
      ev.length = 0;
    });
    expect(sim.world.formations.count).toBe(before);
    expect(sim.world.production.count).toBe(queued);
    expect(refusals).toEqual([Refusal.NoSuch, Refusal.NoSuch, Refusal.NoSuch]);
  });

  it('a month of every nation 1,000 gold in debt disbands and lays up formations and fleets, but no hero', () => {
    const sim = make('on');
    const w = sim.world;
    const heroes = heroIds(w);
    w.nations.forEach((n) => {
      w.nations.cols.gold[n] = -1000;
    });
    let laid = 0;
    let cut = 0;
    const count = (x: World): void => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        if (ev[i + 1] === EventKind.FleetsLaidUp) laid += ev[i + 3]!;
        if (ev[i + 1] === EventKind.FormationsDisbanded) cut += ev[i + 3]!;
      }
      ev.length = 0;
      x.out.fires.length = 0;
    };
    // To the next month's start, then a day on: the economic AI's month is in it.
    sim.step(1, count);
    while (!isMonthStart(w.startDay, w.tick)) sim.step(1, count);
    sim.step(24, count);
    expect(laid, 'fleets laid up in the month').toBeGreaterThan(0);
    expect(cut, 'formations disbanded in the month').toBeGreaterThan(0);
    expect(heroIds(w)).toEqual(heroes);
    for (const id of heroes) expect(w.rules!.templates[w.formations.cols.template[id]!]!.hero).toBe(true);
  });
});
