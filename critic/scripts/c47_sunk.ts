// Critic run 47 (new): R38a beyond its own unit case. Japan (seed <seed>), the N divisions nearest Tokyo sent to
// Shanghai in one click; only KEEP transport groups of Japan kept (the nearest Tokyo; KEEP=0 keeps all), so some
// may be left for the next voyage. SINK hours after the landing sails, its groups are destroyed (as a sinking:
// destroyFormation sets the aboard's fleet to -1, as navalCombat's end of a group does). Logs every order news
// and the panel state (voyageOf) of each id per hour for 72 h after, and the landings.
// Usage: N=3 KEEP=1 SINK=24 npx tsx critic/scripts/c47_sunk.ts <seed> <out.json>
import { writeFileSync } from 'node:fs';
import type { Command } from '../../src/shared/commands';
import type { FromWorker, OrderNews } from '../../src/shared/protocol';
import { cellOf } from '../../src/sim/data/terrain';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { destroyFormation } from '../../src/sim/systems/elements';
import { landingOfDivision, voyageOf } from '../../src/sim/systems/landings';
import { navOf, type World } from '../../src/sim/world';
import { SimServer } from '../../src/worker/server';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const seed = Number(process.argv[2] ?? 3517);
const outPath = process.argv[3] ?? 'critic/c47_sunk.json';
const N = Number(process.env.N ?? 3);
const KEEP = Number(process.env.KEEP ?? 1);
const SINK = Number(process.env.SINK ?? 24);
const TGT = (process.env.TGT ?? '121.47,31.23').split(',').map(Number);
const { w: W, h: H } = SIZE_1938;
const JAP = nationId('JAP');
const CHI = nationId('CHI');
const TARGET = cellOf(TGT[0]!, TGT[1]!, W, H) as [number, number];
const TOKYO = cellOf(139.69, 35.69, W, H) as [number, number];
const news: (OrderNews & { at: number })[] = [];
const s = new SimServer((m: FromWorker) => {
  if (m.type === 'orderNews') news.push({ ...m.news, at: s.sim?.world.tick ?? -1 });
});
s.handle({ type: 'init', reqId: 1, init: { scenario: '1938', seed, assets: assets1938(W) } }, 0);
s.handle({ type: 'cmd', cmd: { kind: 'setPlayer', nation: JAP } }, 1);
const w = s.sim!.world;
if (!w.wars.atWar(JAP, CHI)) s.handle({ type: 'cmd', cmd: { kind: 'declareWar', attacker: JAP, defender: CHI }, now: true }, 1);
const drain = (x: World): void => (s as unknown as { drainEvents(w: World): void }).drainEvents(x);
const step = (): void => s.sim!.step(1, drain);
step();
const c = w.formations.cols;
if (KEEP > 0) {
  const ships: [number, number][] = [];
  w.formations.forEach((o) => {
    if (c.nation[o] === JAP && w.isFleet(o) && transportRoom(w, o) > 0) ships.push([o, (c.x[o]! - TOKYO[0]) ** 2 + (c.y[o]! - TOKYO[1]) ** 2]);
  });
  for (const [o] of ships.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(KEEP)) destroyFormation(w, o);
}
const comp = navOf(w).grid.component;
const honshu = comp[Math.floor(TOKYO[1]) * W + Math.floor(TOKYO[0])];
const all: [number, number][] = [];
w.formations.forEach((id) => {
  if (c.nation[id] !== JAP || w.isFleet(id) || w.offLand(id) || comp[Math.floor(c.y[id]!) * W + Math.floor(c.x[id]!)] !== honshu) return;
  all.push([id, (c.x[id]! - TOKYO[0]) ** 2 + (c.y[id]! - TOKYO[1]) ** 2]);
});
const ids = all.sort((a, b) => a[1] - b[1] || a[0] - b[0]).slice(0, N).map((d) => d[0]);
const cmds: Command[] = ids.map((id) => ({ kind: 'moveFormation', id, x: TARGET[0] + 0.5, y: TARGET[1] + 0.5, nation: JAP, escort: true }));
s.handle({ type: 'cmds', cmds, now: true }, 2);
const trace: string[] = [];
const row = (tag: string): void => {
  trace.push(`t${w.tick} ${tag} ` + ids.map((id) => {
    if (!w.formations.has(id)) return `${id}:gone`;
    const l = landingOfDivision(w, id);
    const v = voyageOf(w, id);
    return `${id}:${w.embarked.has(id) ? 'aboard' : 'ashore'} L${l ? `${l.id}/${l.state}/f${l.fleets.join(',')}` : '-'} ${v ? v.state : '-'}`;
  }).join(' | '));
};
let sailedAt = -1;
for (let h = 0; h < 24 * 80; h++) {
  step();
  if (h % 24 === 0) row('day');
  const aboard = ids.filter((id) => w.embarked.has(id) && landingOfDivision(w, id)?.state === 1);
  if (aboard.length > 0) {
    sailedAt = w.tick;
    break;
  }
}
row('sailed');
let sunkAt = -1;
let sunkFleets: number[] = [];
for (let h = 0; h < SINK; h++) step();
const aboardNow = ids.filter((id) => w.embarked.has(id));
const l0 = aboardNow.length > 0 ? landingOfDivision(w, aboardNow[0]!) : undefined;
if (l0) {
  // PART=1: only the first of its groups (a partial sinking).
  sunkFleets = process.env.PART === '1' ? l0.fleets.slice(0, 1) : [...l0.fleets];
  row('before sink');
  for (const o of sunkFleets) destroyFormation(w, o);
  sunkAt = w.tick;
  row('sunk (same hour, panel)');
}
const AFTER = Number(process.env.AFTER ?? 72);
const landedAt: Record<number, number> = {};
for (let h = 0; h < AFTER; h++) {
  step();
  for (const id of ids) if (landedAt[id] === undefined && w.formations.has(id) && !w.embarked.has(id) && !landingOfDivision(w, id) && Math.hypot(c.x[id]! - TARGET[0], c.y[id]! - TARGET[1]) < 8) landedAt[id] = w.tick;
  if (h < 3 || h % 24 === 0) row('after');
}
row('end');
(globalThis as { landedAt?: unknown }).landedAt = landedAt;
const out = { seed, N, KEEP, SINK, ids, sailedAt, sunkAt, sunkFleets, landedAt, news: news.map((n) => `${n.at} ${n.kind} ${n.id} reason ${n.reason}`), trace };
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
console.log('done:');
