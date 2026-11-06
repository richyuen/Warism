// Critic run 34 (copy of run 33) (R20, new): a landing ordered at war whose war ends on the way, or just after.
// 1938 seed <seed>, <TAG> played (at war with <FOE>, or God makes it so), <n> divisions nearest (sx,sy) ordered over the
// sea to (dx,dy) with the escort. At <when> (sea: 12 h after the first is afloat; landed: 24 h after the first is ashore)
// God makes peace between them. Then every event of the ordered ids, their place hourly, any jump > 3 cells in an hour,
// for <days> days. Also: how many of TAG's formations FormationSentHome hits at the peace.
// Usage: npx tsx critic/scripts/c43_pm.ts <seed> <TAG> <FOE> <sx> <sy> <dx> <dy> <n> <sea|landed> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';

const [seedS, T, F, sx, sy, dx, dy, nS, when, dS, outF] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(T!), FOE = tag(F!);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: N } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols;
const out: Record<string, unknown> = { seed: Number(seedS), T, F, when };
if (!w.wars.atWar(N, FOE)) { out.forceWar = s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); s.step(1); }
out.atWarStart = w.wars.atWar(N, FOE);
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - +sx!, c().y[f]! - +sy!)]); });
cand.sort((a, b) => a[1] - b[1]);
const ids = cand.slice(0, Number(nS)).map((x) => x[0]);
out.ids = ids;
out.replies = ids.map((id) => s.command({ kind: 'moveFormation', id, x: +dx!, y: +dy!, nation: N, escort: true } as never));
const ev: string[] = [];
let sentHomeAll = 0; const sentHomeIds: number[] = [];
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    if (k === EventKind.FormationSentHome && e[i + 3] === N) { sentHomeAll++; sentHomeIds.push(e[i + 2]!); }
    if (ids.includes(e[i + 2]!)) ev.push(`t${wd.tick} ${EV[k]} a${e[i + 2]} b${e[i + 3]} x${(+e[i + 4]!).toFixed?.(1) ?? e[i + 4]} y${e[i + 5]}`);
  }
  e.length = 0; wd.out.fires.length = 0;
};
const prev = new Map(ids.map((id) => [id, [c().x[id]!, c().y[id]!]]));
const jumps: string[] = []; const trace: unknown[] = [];
let firstAfloat = -1, firstLanded = -1, peaceAt = -1;
for (let h = 0; h < 24 * Number(dS); h++) {
  s.step(1, take as never);
  const st = ids.map((id) => ({ id, alive: w.formations.has(id), afloat: w.formations.has(id) ? w.afloat(id) : null, x: w.formations.has(id) ? +c().x[id]!.toFixed(1) : null, y: w.formations.has(id) ? +c().y[id]!.toFixed(1) : null, holder: w.formations.has(id) ? w.cells.controller[Math.floor(c().y[id]!) * w.cells.w + Math.floor(c().x[id]!)] : null }));
  for (const x of st) {
    if (!x.alive) continue;
    const p = prev.get(x.id)!; const d = Math.hypot(x.x! - p[0]!, x.y! - p[1]!);
    if (d > 3) jumps.push(`t${w.tick} ${x.id} (${p[0]!.toFixed(1)},${p[1]!.toFixed(1)}) -> (${x.x},${x.y}) afloat ${x.afloat}`);
    prev.set(x.id, [x.x!, x.y!]);
  }
  if (firstAfloat < 0 && st.some((x) => x.afloat)) firstAfloat = w.tick;
  if (firstLanded < 0 && firstAfloat >= 0 && st.some((x) => x.alive && !x.afloat && Math.hypot(x.x! - +dx!, x.y! - +dy!) < 12)) firstLanded = w.tick;
  const due = peaceAt < 0 && ((when === 'sea' && firstAfloat >= 0 && w.tick >= firstAfloat + 12) || (when === 'landed' && firstLanded >= 0 && w.tick >= firstLanded + 24) || (when!.startsWith('h') && w.tick >= Number(when!.slice(1))));
  if (due) {
    const war = w.wars.between(N, FOE)?.war;
    out.peaceReply = war ? s.command({ kind: 'forcePeace', war: war.id } as never) : 'no war';
    peaceAt = w.tick; ev.push(`t${w.tick} PEACE ${JSON.stringify(out.peaceReply)}`);
    out.atSeaAtPeace = st.filter((x) => x.afloat).map((x) => x.id);
  }
  if (h % 6 === 0 || due) trace.push({ t: w.tick, st });
}
Object.assign(out, { firstAfloat, firstLanded, peaceAt, events: ev, jumps, sentHomeAll, sentHomeIds: sentHomeIds.slice(0, 200), trace });
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ replies: out.replies, atWarStart: out.atWarStart, firstAfloat, firstLanded, peaceAt, atSeaAtPeace: out.atSeaAtPeace, events: ev.slice(0, 40), jumps, sentHomeAll }));
