import { describe, expect, it } from 'vitest';
import type { FromWorker } from '../../src/shared/protocol';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import type { World } from '../../src/sim/world';
import { buildRelationGraph, EDGE_KINDS, nationKey, relationPairs, warKey, type GraphNation } from '../../src/ui/relationGraph';
import { layoutGraph } from '../../src/ui/relationLayout';
import { SimServer } from '../../src/worker/server';
import { at1938 } from '../helpers/checkpoint';
import { assets1938 } from '../helpers/earth';

// ROADMAP R1, ADR-806: the relations graph agrees with the sim. The graph is built from the
// worker's own statistics message; the relations it says hold are compared with those read from
// the world directly, on every pair of living nations.

type Stats = Extract<FromWorker, { type: 'nationStats' }>;

/** The world's relations among its living nations, as `relationPairs` writes them. */
function worldPairs(w: World): Set<string> {
  const nc = w.nations.cols;
  const living = (id: number): boolean => nc.living[id] === 1;
  const out = new Set<string>();
  const pairKey = (kind: string, a: number, b: number): string => `${kind}:${Math.min(a, b)}:${Math.max(a, b)}`;
  for (const war of w.wars.list) {
    const [a, b] = war.sides.map((s) => s.filter(living));
    for (const x of a!) for (const y of b!) out.add(pairKey('war', x, y));
  }
  w.nations.forEach((id) => {
    if (!living(id)) return;
    const o = nc.overlord[id]!;
    if (o !== 0 && living(o)) out.add(`puppet:${o}:${id}`);
    const al = w.alliances.allianceOf(id);
    if (al) for (const m of al.members) if (m !== id && living(m)) out.add(pairKey('alliance', id, m));
  });
  for (const g of w.alliances.guarantees) if (living(g.guarantor) && living(g.target) && g.guarantor !== g.target) out.add(`guarantee:${g.guarantor}:${g.target}`);
  for (const t of w.wars.truces) if (t.untilTick > w.tick && living(t.a) && living(t.b)) out.add(pairKey('truce', t.a, t.b));
  return out;
}

/** The worker's statistics message on the 1938 world of `seed` at `day`, and the world it came from. */
function statsAt(seed: number, day: number): { stats: Stats; world: World } {
  const got: FromWorker[] = [];
  const server = new SimServer((m) => got.push(m));
  server.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed, assets: assets1938(SIZE_1938.w) } }, 0);
  server.handle({ type: 'load', reqId: 2, bytes: at1938(seed, day * 24).save() }, 1);
  server.handle({ type: 'step', reqId: 3, n: 1 }, 5000);
  const stats = got.filter((m): m is Stats => m.type === 'nationStats').at(-1)!;
  expect(stats.tick).toBe(day * 24 + 1);
  return { stats, world: server.sim!.world };
}

const diff = (a: Set<string>, b: Set<string>): string[] => [...a].filter((k) => !b.has(k)).sort();

describe('the relations graph (ROADMAP R1, ADR-806)', () => {
  for (const seed of [7019, 2207, 3739]) {
    it(`agrees with the sim on every pair of living nations: seed ${seed}, days 1, 60, 365`, () => {
      for (const day of [1, 60, 365]) {
        const { stats, world } = statsAt(seed, day);
        const graph = buildRelationGraph(stats.nations, stats.wars);
        const fromGraph = relationPairs(graph);
        const fromWorld = worldPairs(world);
        expect(diff(fromWorld, fromGraph), `day ${day}: in the world, not in the graph`).toEqual([]);
        expect(diff(fromGraph, fromWorld), `day ${day}: in the graph, not in the world`).toEqual([]);
        // Every kind the world has shows: the 1938 start has alliances, guarantees, puppets and wars.
        const kinds = new Set([...fromWorld].map((k) => k.split(':')[0]));
        for (const k of ['war', 'alliance', 'guarantee', 'puppet']) if (day === 1) expect(kinds.has(k), `${k} on day 1`).toBe(true);
        // Nodes: each tied living nation once, each war's hub once; the untied counted.
        expect(graph.nodes.filter((n) => n.kind === 'nation').length + graph.untied).toBe(stats.nations.length);
        expect(new Set(graph.nodes.map((n) => n.key)).size).toBe(graph.nodes.length);
      }
    }, 240_000);
  }
});

describe('the graph\'s pieces', () => {
  const nation = (id: number, over: Partial<GraphNation> = {}): GraphNation => ({ id, landShare: 0.01, alliance: null, overlord: 0, guarantees: [], truces: [], ...over });
  const alliance = (leader: number, members: number[]): GraphNation['alliance'] => ({ id: 1, name: 'a', leader, founder: leader, unity: 50, loyalty: 50, members });

  it('a war is a hub with an edge to each member, by side; an alliance a star from its leader', () => {
    const nations = [nation(1, { alliance: alliance(1, [1, 2, 3]) }), nation(2, { alliance: alliance(1, [1, 2, 3]) }), nation(3, { alliance: alliance(1, [1, 2, 3]) }), nation(4), nation(5)];
    const g = buildRelationGraph(nations, [{ id: 9, attackers: [1, 2], defenders: [4] }]);
    expect(g.nodes.map((n) => n.key)).toEqual(['n1', 'n2', 'n3', 'n4', 'w9']);
    expect(g.untied).toBe(1);
    expect(g.edges.filter((e) => e.kind === 'war')).toEqual([
      { kind: 'war', from: 'n1', to: 'w9', side: 0 },
      { kind: 'war', from: 'n2', to: 'w9', side: 0 },
      { kind: 'war', from: 'n4', to: 'w9', side: 1 },
    ]);
    expect(g.edges.filter((e) => e.kind === 'alliance').map((e) => `${e.from}>${e.to}`)).toEqual(['n1>n2', 'n1>n3']);
    expect([...relationPairs(g)].sort()).toEqual(['alliance:1:2', 'alliance:1:3', 'alliance:2:3', 'war:1:4', 'war:2:4']);
  });

  it('a guarantee and a puppet bond are directed; a truce is one edge from either side; kinds can be left out', () => {
    const nations = [nation(1, { guarantees: [2], truces: [{ with: 3, days: 10 }] }), nation(2, { overlord: 1 }), nation(3, { truces: [{ with: 1, days: 10 }] })];
    const g = buildRelationGraph(nations, []);
    expect(g.edges.map((e) => `${e.kind}:${e.from}>${e.to}`)).toEqual(['guarantee:n1>n2', 'truce:n1>n3', 'puppet:n1>n2']);
    const only = buildRelationGraph(nations, [], new Set(['truce'] as const));
    expect(only.edges.map((e) => e.kind)).toEqual(['truce']);
    expect(only.nodes.map((n) => n.key)).toEqual([nationKey(1), nationKey(3)]);
    expect(only.untied).toBe(1);
    expect(EDGE_KINDS).toHaveLength(5);
  });

  it('a war with a side gone (all dead) draws no hub', () => {
    const g = buildRelationGraph([nation(1)], [{ id: 3, attackers: [1], defenders: [7] }]);
    expect(g.nodes.find((n) => n.key === warKey(3))).toBeUndefined();
    expect(g.edges).toEqual([]);
  });

  it('the layout: the same graph gives the same places; an update moves a node little; places stay inside', () => {
    const nations = [1, 2, 3, 4, 5, 6].map((id) => nation(id, { guarantees: id < 6 ? [id + 1] : [] }));
    const g = buildRelationGraph(nations, [{ id: 1, attackers: [1], defenders: [6] }]);
    const o = { width: 600, height: 400, steps: 200 };
    const a = layoutGraph(g, new Map(), o);
    expect(layoutGraph(g, new Map(), o)).toEqual(a);
    for (const p of a.values()) {
      expect(p.x).toBeGreaterThanOrEqual(16);
      expect(p.x).toBeLessThanOrEqual(584);
      expect(p.y).toBeGreaterThanOrEqual(16);
      expect(p.y).toBeLessThanOrEqual(384);
    }
    // Linked nodes end nearer than the graph's width; an update from the last places moves little.
    const d = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);
    expect(d(a.get('n1')!, a.get('n2')!)).toBeLessThan(200);
    const b = layoutGraph(g, a, { ...o, steps: 30 });
    for (const [k, p] of a) expect(d(p, b.get(k)!), k).toBeLessThan(40);
    // A new node starts beside its neighbour.
    const g2 = buildRelationGraph([...nations, nation(7, { overlord: 3 })], [{ id: 1, attackers: [1], defenders: [6] }]);
    const c = layoutGraph(g2, a, { ...o, steps: 0 });
    expect(d(c.get('n7')!, a.get('n3')!)).toBeLessThan(50);
  });
});
