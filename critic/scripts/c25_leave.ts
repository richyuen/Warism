// Critic run 25 (new), LEAVE: PLAN 7.188's "an attacker on one side with a defender in an older war leaves that war".
// Hour by hour, the pairs of nations at war; a pair that stops being at war in an hour with a WarDeclared and with no
// PeaceSigned / annex / elimination / puppet event naming either is counted as "left on a declaration"; with the
// cells the one held of the other's before, and whether those cells went back to their owner. Same script runs on
// both commits (copied into the worktree).
// Usage: npx tsx critic/scripts/c25_leave.ts <seed> <days> <out.json> [random]
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';
import type { World } from '../../src/sim/world';

const seed = Number(process.argv[2] ?? 7019), days = Number(process.argv[3] ?? 365), out = process.argv[4]!;
const random = process.argv[5] === 'random';
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w), ...(random ? { options: { diplomacy: 'random' } } : {}) });
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const pairs = (w: World): Map<number, number> => {
  const m = new Map<number, number>();
  for (const war of w.wars.list) for (const a of war.sides[0]) for (const b of war.sides[1]) { m.set(a * 65536 + b, war.id); m.set(b * 65536 + a, war.id); }
  return m;
};
const held = (w: World, k: number, o: number): number => { const c = w.cells; let n = 0; for (let i = 0; i < c.owner.length; i++) if (c.owner[i] === o && c.controller[i] === k) n++; return n; };
const NORMAL = new Set<number>([EventKind.PeaceSigned, EventKind.NationAnnexed, EventKind.NationEliminated, EventKind.PuppetCreated, EventKind.PuppetReleased, EventKind.PuppetRevolt, EventKind.PuppetIntegrated, EventKind.NationCollapsed, EventKind.UnionFormed, EventKind.AllianceJoined, EventKind.BondsBroken]);
let prev = pairs(s.world);
const sides = new Map<number, [number[], number[]]>();
for (const war of s.world.wars.list) sides.set(war.id, [[...war.sides[0]], [...war.sides[1]]]);
let heldBefore = new Map<number, number>();
const found: unknown[] = [];
const decl: unknown[] = [];
let other = 0;
for (let h = 0; h < days * 24; h++) {
  // cells held before the hour, for the pairs at war (cheap enough: only pairs whose war has a declaration this hour are read after)
  const evs: number[][] = [];
  const snapCtrl = s.world.cells.controller.slice();
  s.step(1, (w) => { const e = w.out.events; for (let i = 0; i < e.length; i += 6) evs.push([e[i + 1]!, e[i + 2]!, e[i + 3]!]); w.out.events.length = 0; w.out.fires.length = 0; });
  const w = s.world;
  const now = pairs(w);
  const declared = evs.filter((e) => e[0] === EventKind.WarDeclared);
  const touched = new Set<number>();
  for (const e of evs) if (NORMAL.has(e[0]!)) { touched.add(e[1]!); touched.add(e[2]!); }
  for (const d of declared) {
    const war = w.wars.list.find((x) => x.sides[0].includes(d[1]!) && x.sides[1].includes(d[2]!) && x.startTick === w.tick) ?? w.wars.list.find((x) => x.sides[0].includes(d[1]!) && x.sides[1].includes(d[2]!));
    decl.push({ day: +(w.tick / 24).toFixed(2), by: tag(d[1]!), on: tag(d[2]!), a: war?.sides[0].map(tag), d: war?.sides[1].map(tag) });
  }
  for (const [k, id] of prev) {
    if (now.has(k)) continue;
    const a = Math.floor(k / 65536), b = k % 65536;
    if (a > b) continue;
    if (touched.has(a) || touched.has(b)) continue;
    if (declared.length === 0) { other++; continue; }
    // cells a held of b's before the hour, and now
    const c = w.cells;
    let ab0 = 0, ba0 = 0;
    for (let i = 0; i < c.owner.length; i++) { if (c.owner[i] === b && snapCtrl[i] === a) ab0++; if (c.owner[i] === a && snapCtrl[i] === b) ba0++; }
    const oldSides = sides.get(id);
    found.push({ day: +(w.tick / 24).toFixed(2), pair: `${tag(a)}-${tag(b)}`, oldWar: id, oldSides: oldSides?.map((x) => x.map(tag)), declared: declared.map((d) => `${tag(d[1]!)} on ${tag(d[2]!)}`), heldBefore: { [`${tag(a)} of ${tag(b)}`]: ab0, [`${tag(b)} of ${tag(a)}`]: ba0 }, heldAfter: { [`${tag(a)} of ${tag(b)}`]: held(w, a, b), [`${tag(b)} of ${tag(a)}`]: held(w, b, a) }, oldWarStillOn: w.wars.list.some((x) => x.id === id) });
  }
  prev = now;
  for (const war of w.wars.list) sides.set(war.id, [[...war.sides[0]], [...war.sides[1]]]);
  if (h % (24 * 30) === 0) writeFileSync(out, JSON.stringify({ seed, random, day: h / 24, leftOnDeclaration: found, otherEnds: other, declarations: decl.length }, null, 1));
}
writeFileSync(out, JSON.stringify({ seed, random, days, leftOnDeclaration: found, otherEnds: other, declarations: decl.length, decl }, null, 1));
process.stderr.write(`seed ${seed}: ${found.length} pairs left on a declaration, ${other} other ends without an event\n`);
console.log('done:');
