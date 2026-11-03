import type { NationStat, WarStat } from '../shared/protocol';

/**
 * The relations graph (ROADMAP R1, ADR-806): every war, alliance, guarantee, puppet bond and truce
 * of the statistics message as nodes and edges. It reads the message only; it decides nothing.
 */

export const EDGE_KINDS = ['war', 'alliance', 'guarantee', 'puppet', 'truce'] as const;
export type EdgeKind = (typeof EDGE_KINDS)[number];

/** The fields of a nation the graph reads. */
export type GraphNation = Pick<NationStat, 'id' | 'landShare' | 'alliance' | 'overlord' | 'guarantees' | 'truces'>;
/** The fields of a war the graph reads. */
export type GraphWar = Pick<WarStat, 'id' | 'attackers' | 'defenders'>;

export interface GraphNode {
  /** `n<id>` for a nation, `w<id>` for a war's hub. */
  key: string;
  kind: 'nation' | 'war';
  /** The nation's or the war's id. */
  id: number;
  /** A nation's land share (0..1); a war's members. */
  weight: number;
}

export interface GraphEdge {
  kind: EdgeKind;
  /** Node keys. Directed for a guarantee (guarantor → target) and a puppet bond (overlord → puppet). */
  from: string;
  to: string;
  /** A war's side: 0 the attackers, 1 the defenders (war edges only). */
  side?: 0 | 1;
}

export interface RelationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Living nations with no tie of the kinds shown, left out of `nodes`. */
  untied: number;
}

export const nationKey = (id: number): string => `n${id}`;
export const warKey = (id: number): string => `w${id}`;

/** The graph of `nations` (the living ones) and `wars`, with only the edge kinds in `kinds`. */
export function buildRelationGraph(nations: readonly GraphNation[], wars: readonly GraphWar[], kinds: ReadonlySet<EdgeKind> = new Set(EDGE_KINDS)): RelationGraph {
  const present = new Set(nations.map((n) => n.id));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const add = (kind: EdgeKind, a: number, b: number, directed: boolean): void => {
    if (a === b || !present.has(a) || !present.has(b)) return;
    const [x, y] = directed || a < b ? [a, b] : [b, a];
    const id = `${kind}:${x}:${y}`;
    if (seen.has(id)) return;
    seen.add(id);
    edges.push({ kind, from: nationKey(x), to: nationKey(y) });
  };
  const hubs: GraphNode[] = [];
  if (kinds.has('war')) {
    for (const w of [...wars].sort((a, b) => a.id - b.id)) {
      const sides = [w.attackers.filter((n) => present.has(n)), w.defenders.filter((n) => present.has(n))] as const;
      if (sides[0].length === 0 || sides[1].length === 0) continue;
      hubs.push({ key: warKey(w.id), kind: 'war', id: w.id, weight: sides[0].length + sides[1].length });
      sides.forEach((members, side) => {
        for (const n of members) edges.push({ kind: 'war', from: nationKey(n), to: warKey(w.id), side: side as 0 | 1 });
      });
    }
  }
  const sorted = [...nations].sort((a, b) => a.id - b.id);
  for (const n of sorted) {
    if (kinds.has('alliance') && n.alliance) {
      const leader = n.alliance.members[0] ?? n.alliance.leader;
      if (leader !== n.id) add('alliance', leader, n.id, true);
    }
    if (kinds.has('guarantee')) for (const t of n.guarantees) add('guarantee', n.id, t, true);
    if (kinds.has('puppet') && n.overlord !== 0) add('puppet', n.overlord, n.id, true);
    if (kinds.has('truce')) for (const t of n.truces) add('truce', n.id, t.with, false);
  }
  const tied = new Set<string>();
  for (const e of edges) {
    tied.add(e.from);
    tied.add(e.to);
  }
  const nodes: GraphNode[] = sorted.filter((n) => tied.has(nationKey(n.id))).map((n) => ({ key: nationKey(n.id), kind: 'nation', id: n.id, weight: n.landShare }));
  return { nodes: [...nodes, ...hubs], edges, untied: sorted.length - nodes.length };
}

/**
 * The relations a graph says hold, as `kind:a:b` strings: a war hub as every pair of its two
 * sides (`war:low:high`), an alliance as every pair of its members (`alliance:low:high`), a
 * guarantee `guarantee:guarantor:target`, a puppet bond `puppet:overlord:puppet`, a truce
 * `truce:low:high`. The unit test compares them with the world's own.
 */
export function relationPairs(g: RelationGraph): Set<string> {
  const out = new Set<string>();
  const idOf = (key: string): number => Number(key.slice(1));
  const pairKey = (kind: EdgeKind, a: number, b: number): string => `${kind}:${Math.min(a, b)}:${Math.max(a, b)}`;
  const warSides = new Map<string, [number[], number[]]>();
  const allianceOf = new Map<number, number[]>();
  for (const e of g.edges) {
    if (e.kind === 'war') {
      const sides = warSides.get(e.to) ?? [[], []];
      sides[e.side ?? 0].push(idOf(e.from));
      warSides.set(e.to, sides);
    } else if (e.kind === 'alliance') {
      const leader = idOf(e.from);
      allianceOf.set(leader, [...(allianceOf.get(leader) ?? [leader]), idOf(e.to)]);
    } else if (e.kind === 'truce') out.add(pairKey('truce', idOf(e.from), idOf(e.to)));
    else out.add(`${e.kind}:${idOf(e.from)}:${idOf(e.to)}`);
  }
  for (const [a, b] of warSides.values()) for (const x of a) for (const y of b) out.add(pairKey('war', x, y));
  for (const members of allianceOf.values()) for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) out.add(pairKey('alliance', members[i]!, members[j]!));
  return out;
}
