import { describe, expect, it } from 'vitest';
import type { Command } from '../../src/shared/commands';
import type { FromWorker } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H } from '../../src/sim/scenario1938h';
import type { Sim } from '../../src/sim/sim';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../helpers/earth';
import { worldBreaks as diploWorldBreaks } from '../helpers/diploInvariants';
import { nationId } from '../helpers/sim1938';
import { worldBreaks } from '../helpers/worldInvariants';

// ROADMAP R81b (ADR-1032's bars 4 and 5, ADR-1034): a one-step undo of a God Mode act. The worker saves the world
// before a new act's first command and holds that one save (never more); `undo` loads it. After an undo the world's
// hash is the one before the act, and the game goes on bit for bit as one never acted on. A dragged stroke is one act;
// an act refused whole keeps the act before it undoable; any other command drops the undo.

const assets = assets1938(SIZE_1938.w);
const WARSAW = cellOf(21.01, 52.23, SIZE_1938.w, SIZE_1938.h);
type Held = { bytes: Uint8Array; tick: number; act: number } | null;

function server(seed: number, scenario: '1938' | '1938h' = '1938'): { s: SimServer; posts: FromWorker[]; held: () => Held; step: (h: number) => void; hash: () => number } {
  const posts: FromWorker[] = [];
  const s = new SimServer((m) => posts.push(m));
  s.handle({ type: 'init', reqId: 1, init: { scenario, seed: scenario === '1938h' ? SEED_1938H : seed, assets } }, 0);
  return {
    s,
    posts,
    held: () => (s as unknown as { undoHeld: Held }).undoHeld,
    step: (h) => s.handle({ type: 'step', reqId: 2, n: h }, 0),
    hash: () => s.sim!.hash(),
  };
}

const act = (s: SimServer, cmd: Command, id: number): void => s.handle({ type: 'cmd', cmd, now: true, act: id }, 0);

describe('one-step undo of a God Mode act (ROADMAP R81b)', () => {
  for (const seed of [5, 7]) {
    it(`seed ${seed}: the world before the act, then 30 days on bit for bit as one never acted on`, () => {
      const a = server(seed);
      const twin = server(seed);
      a.step(48);
      twin.step(48);
      const before = a.hash();
      expect(before).toBe(twin.hash());
      act(a.s, { kind: 'godNuke', x: 700, y: 180, thermonuclear: true }, 1);
      expect(a.held()?.act).toBe(1);
      a.step(24);
      expect(a.hash()).not.toBe(twin.hash());
      a.s.handle({ type: 'undo', reqId: 3 }, 0);
      expect(a.hash()).toBe(before);
      expect(a.s.sim!.tick).toBe(twin.s.sim!.tick);
      expect(a.held()).toBeNull();
      a.step(30 * 24);
      twin.step(30 * 24);
      expect(a.hash()).toBe(twin.hash());
    });
  }

  it('one save held: a stroke of the brush is one act; a refused act keeps the one before; another command drops it', () => {
    const a = server(5);
    a.step(24);
    const ger = nationId('GER');
    act(a.s, { kind: 'editPaint', layer: 'nation', tool: 'brush', x: 600, y: 200, x2: 600, y2: 200, r: 2, value: ger, mask: null, stroke: 'start' }, 1);
    const first = a.held();
    expect(first?.act).toBe(1);
    act(a.s, { kind: 'editPaint', layer: 'nation', tool: 'line', x: 600, y: 200, x2: 604, y2: 201, r: 2, value: ger, mask: null, stroke: 'more' }, 1);
    expect(a.held()).toBe(first);
    // Reviving a living nation is refused: nothing changed, the stroke stays the act undone.
    act(a.s, { kind: 'reviveNation', nation: ger }, 2);
    expect(a.held()).toBe(first);
    // A new act replaces it; only one save is ever held.
    act(a.s, { kind: 'setEfficiency', nation: ger, value: 0.5 }, 3);
    expect(a.held()?.act).toBe(3);
    expect(Object.keys(a.s as object).filter((k) => k.startsWith('undo'))).toEqual(['undoHeld', 'undoNext']);
    // The stats say so.
    a.s.handle({ type: 'stats', reqId: 4 }, 0);
    const stats = a.posts.filter((m) => m.type === 'nationStats').at(-1) as Extract<FromWorker, { type: 'nationStats' }> | undefined;
    expect(stats?.godUndo).toBe(a.held()!.tick);
    // A command of no act (a player's order, an edit, a nation taken) drops it.
    a.s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: ger }, now: true }, 0);
    expect(a.held()).toBeNull();
    const h = a.hash();
    a.s.handle({ type: 'undo', reqId: 5 }, 0);
    expect(a.hash()).toBe(h);
  });

  for (const seed of [5, 7]) {
    it(`seed ${seed}: the world's and diplomacy's rules hold after an undo`, () => {
      // God's revolt in the province of Warsaw on day 10, undone on day 11 (the worker's undo loads the save made before
      // the act, as here); checked every hour to day 40, as the AI's acts are. (A God bomb is not a launch, so the
      // nukes' rules, which count launches against bursts, do not hold across one, undone or not.)
      let held: Uint8Array | null = null;
      const living = (x: Sim): number => x.world.nations.cols.living.reduce((k: number, v: number) => k + (v === 1 ? 1 : 0), 0);
      const alive: number[] = [];
      let after: Sim | null = null;
      const lines = worldBreaks({
        seed,
        days: 40,
        acts: [
          { day: 10, act: (x) => { held = x.save(); alive.push(living(x)); x.command({ kind: 'spawnRevolt', province: x.world.cells.province[Math.floor(WARSAW[1]) * SIZE_1938.w + Math.floor(WARSAW[0])]! }); } },
          { day: 11, act: (x) => { alive.push(living(x)); x.load(held!); alive.push(living(x)); after = x; } },
        ],
      });
      expect(lines).toEqual([]);
      // The revolt rose (a nation more), and the undo took it back.
      expect(alive[1]).toBeGreaterThan(alive[0]!);
      expect(alive[2]).toBe(alive[0]);
      expect(diploWorldBreaks((after as Sim | null)!.world)).toEqual([]);
    }, 300_000);
  }

  it('an act that ended the replay of history is undone with the replay running again', () => {
    const a = server(0, '1938h');
    a.step(24);
    const before = a.hash();
    expect(a.s.sim!.world.track!.ended).toBe(false);
    act(a.s, { kind: 'setEfficiency', nation: nationId('GER'), value: 0.5 }, 1);
    expect(a.s.sim!.world.track!.ended).toBe(true);
    a.s.handle({ type: 'undo', reqId: 2 }, 0);
    expect(a.s.sim!.world.track!.ended).toBe(false);
    expect(a.hash()).toBe(before);
  });
});
