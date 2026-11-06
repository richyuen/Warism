// Critic run 36 (copy of run 35; act allnear added) (R22b, new): ashore-then-refused. Copy of c44_wait.ts with acts seaopen / neutral / same / reorder.
// Critic run 34 (R21e, R21a, new): a division aboard a convoy that waits at its port for the rest of the click's
// landing. 1938 seed <seed>, <TAG> played (at war with <FOE>, God's war if not), <n> divisions nearest (sx,sy) to (dx,dy)
// with the escort. Once the first has been aboard a convoy standing at its port for <after> hours, <act>:
//   reorder  - a new order to the one aboard (back to where it started)
//   peace    - God's peace with FOE
//   cancel   - a new order to every division not aboard (back to where it started)
//   none     - nothing
// Then hourly for <days> days: every event of the ordered ids, embarked/convoy state, and the ordered fleets.
// Usage: npx tsx critic/scripts/c44_wait.ts <seed> <TAG> <FOE> <sx> <sy> <dx> <dy> <n> <after> <act> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { isLand } from '../../src/shared/terrain';
const [seedS, T, F, sx, sy, dx, dy, nS, afterS, act, dS, outF] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(T!), FOE = tag(F!);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: N } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols;
const out: Record<string, unknown> = { seed: Number(seedS), T, F, dst: [+dx!, +dy!], act, after: +afterS! };
if (!w.wars.atWar(N, FOE)) { out.forceWar = s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); s.step(1); }
out.atWarStart = w.wars.atWar(N, FOE);
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - +sx!, c().y[f]! - +sy!)]); });
cand.sort((a, b) => a[1] - b[1]);
const ids = cand.slice(0, Number(nS)).map((x) => x[0]);
const start = new Map(ids.map((id) => [id, [c().x[id]!, c().y[id]!]]));
out.ids = ids;
out.replies = ids.map((id) => s.command({ kind: 'moveFormation', id, x: +dx!, y: +dy!, nation: N, escort: true } as never));
const ev: string[] = [];
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    const a = e[i + 2]!;
    const fleets = new Set([...wd.convoyPort.keys(), ...[...wd.embarked.values()].map((x) => x.fleet), ...wd.escorts.keys()]);
    if (ids.includes(a) || (fleets.has(a) && k !== EventKind.StrikeHit)) ev.push(`t${wd.tick} ${EV[k]} a${a} b${e[i + 3]} x${(+e[i + 4]!).toFixed(1)} y${(+e[i + 5]!).toFixed?.(1)}`);
  }
  e.length = 0; wd.out.fires.length = 0;
};
let aboardSince = -1, acted = -1;
const trace: unknown[] = [];
const landedAt: Record<number, number> = {};
for (let h = 0; h < 24 * Number(dS); h++) {
  s.step(1, take as never);
  const st = ids.map((id) => {
    const alive = w.formations.has(id);
    const e = w.embarked.get(id);
    const port = e ? w.convoyPort.get(e.fleet) : undefined;
    return { id, alive, x: alive ? +c().x[id]!.toFixed(1) : null, y: alive ? +c().y[id]!.toFixed(1) : null, emb: e ? e.fleet : 0, fleetMoving: e ? c().moving[e.fleet] : null, convoyPort: port ?? null, bound: w.seaFetch.get(id) ?? null, seaBound: w.seaBound.has(id), moving: alive ? c().moving[id] : null };
  });
  for (const x of st) if (x.alive && landedAt[x.id] === undefined && !x.emb && Math.hypot(x.x! - +dx!, x.y! - +dy!) < 6 && aboardSince >= 0) landedAt[x.id] = w.tick;
  const waiting = st.find((x) => x.emb && x.fleetMoving === 0 && x.convoyPort !== null);
  if (waiting && aboardSince < 0) aboardSince = w.tick;
  if (acted < 0 && aboardSince >= 0 && w.tick >= aboardSince + Number(afterS)) {
    acted = w.tick;
    if (act === 'reorder' && waiting) {
      const p = start.get(waiting.id)!;
      out.actReply = s.command({ kind: 'moveFormation', id: waiting.id, x: p[0], y: p[1], nation: N, escort: true } as never);
      ev.push(`t${w.tick} ACT reorder ${waiting.id} -> ${JSON.stringify(out.actReply)}`);
    } else if ((act === 'seaopen' || act === 'neutral' || act === 'same' || act === 'far') && waiting) {
      let tx = +dx!, ty = +dy!;
      if (act === 'seaopen') { // the sea cell at least 12 cells from any land, nearest the port
        const W = w.cells.w, H = w.cells.h; let best = 1e9;
        for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
          if (isLand(w.cells.terrain[y * W + x]!)) continue;
          const d = Math.hypot(x - waiting.x!, y - waiting.y!); if (d >= best || d < 15) continue;
          let ok = true; for (let yy = y - 12; yy <= y + 12 && ok; yy += 3) for (let xx = x - 12; xx <= x + 12; xx += 3) { if (yy < 0 || yy >= H) continue; if (isLand(w.cells.terrain[yy * W + ((xx + W) % W)]!)) { ok = false; break; } }
          if (ok) { best = d; tx = x + 0.5; ty = y + 0.5; }
        }
      } else if (act === 'neutral' || act === 'far') { tx = +process.env.NX!; ty = +process.env.NY!; }
      const before = { emb: w.embarked.get(waiting.id)?.fleet ?? 0, x: c().x[waiting.id], y: c().y[waiting.id], seaBound: w.seaBound.get(waiting.id) ?? null };
      out.actReply = s.command({ kind: 'moveFormation', id: waiting.id, x: tx, y: ty, nation: N, escort: true } as never);
      const after = { emb: w.embarked.get(waiting.id)?.fleet ?? 0, x: c().x[waiting.id], y: c().y[waiting.id], seaBound: w.seaBound.get(waiting.id) ?? null, moving: c().moving[waiting.id], playerOrder: w.playerOrders.get(waiting.id) ?? null };
      out.actDetail = { id: waiting.id, target: [tx, ty], before, after };
      ev.push(`t${w.tick} ACT ${act} ${waiting.id} -> (${tx},${ty}) ${JSON.stringify(out.actReply)} before ${JSON.stringify(before)} after ${JSON.stringify(after)}`);
    } else if (act === 'extra') { // a fresh division (not of the click) nearest the port, ordered to the same landing
      const pool: [number, number][] = [];
      w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f) || ids.includes(f) || w.embarked.has(f)) return; pool.push([f, Math.hypot(c().x[f]! - waiting.x!, c().y[f]! - waiting.y!)]); });
      pool.sort((a, b) => a[1] - b[1]);
      const xid = pool[0]![0];
      ids.push(xid);
      out.extra = { id: xid, d: pool[0]![1] };
      out.actReply = s.command({ kind: 'moveFormation', id: xid, x: +dx!, y: +dy!, nation: N, escort: true } as never);
      ev.push(`t${w.tick} ACT extra ${xid} d${pool[0]![1].toFixed(1)} -> ${JSON.stringify(out.actReply)}`);
    } else if (act === 'allnear') { // every division of the click ordered to (NX, NY): a click a cell or two off the first
      out.actReply = ids.map((id) => s.command({ kind: 'moveFormation', id, x: +process.env.NX!, y: +process.env.NY!, nation: N, escort: true } as never));
      ev.push(`t${w.tick} ACT allnear ${JSON.stringify(out.actReply)}`);
    } else if (act === 'bound') { // the second division of the click (walking, bound) ordered to (NX, NY)
      const b = ids[1]!;
      const before = { bound: w.seaFetch.get(b) ?? null, seaBound: w.seaBound.get(b) ?? null, moving: c().moving[b] };
      out.actReply = s.command({ kind: 'moveFormation', id: b, x: +process.env.NX!, y: +process.env.NY!, nation: N, escort: true } as never);
      const after = { bound: w.seaFetch.get(b) ?? null, seaBound: w.seaBound.get(b) ?? null, moving: c().moving[b] };
      out.actDetail = { id: b, before, after };
      ev.push(`t${w.tick} ACT bound ${b} -> ${JSON.stringify(out.actReply)} before ${JSON.stringify(before)} after ${JSON.stringify(after)}`);
    } else if (act === 'all') { // every division of the click ordered to the same landing again
      out.actReply = ids.map((id) => s.command({ kind: 'moveFormation', id, x: +dx!, y: +dy!, nation: N, escort: true } as never));
      ev.push(`t${w.tick} ACT all ${JSON.stringify(out.actReply)}`);
    } else if (act === 'peace') {
      const war = w.wars.between(N, FOE)?.war;
      out.actReply = war ? s.command({ kind: 'forcePeace', war: war.id } as never) : 'no war';
      ev.push(`t${w.tick} ACT peace ${JSON.stringify(out.actReply)}`);
    } else if (act === 'cancel') {
      const r = st.filter((x) => x.alive && !x.emb).map((x) => { const p = start.get(x.id)!; return s.command({ kind: 'moveFormation', id: x.id, x: p[0], y: p[1], nation: N, escort: true } as never); });
      out.actReply = r;
      ev.push(`t${w.tick} ACT cancel ${JSON.stringify(r)}`);
    }
    out.stAtAct = st;
  }
  if (h % 6 === 0 || acted === w.tick) trace.push({ t: w.tick, st, convoys: [...w.convoyPort], escorts: [...w.escorts.keys()] });
}
const end = ids.map((id) => ({ id, alive: w.formations.has(id), emb: w.embarked.get(id)?.fleet ?? 0, x: w.formations.has(id) ? +c().x[id]!.toFixed(1) : null, y: w.formations.has(id) ? +c().y[id]!.toFixed(1) : null, holder: w.formations.has(id) ? w.cells.controller[Math.floor(c().y[id]!) * w.cells.w + Math.floor(c().x[id]!)] : null }));
Object.assign(out, { aboardSince, acted, landedAt, end, convoysEnd: [...w.convoyPort], escortsEnd: [...w.escorts.keys()], events: ev, trace });
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ replies: out.replies, atWarStart: out.atWarStart, aboardSince, acted, actReply: out.actReply, landedAt, end, convoysEnd: out.convoysEnd, escortsEnd: out.escortsEnd, events: ev.filter((x) => !x.includes('FormationArrived') || true).slice(0, 60) }));
