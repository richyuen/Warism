// Critic run 46: c45_ll6 plus NextVoyage events, the panel voyage state (voyageOf) in the trace, and hours per voyage state per id (voy).
// Critic run 45: c45_ll5 with TAG, FOE, HOME_XY (pick the n nearest) and TGT (the first click's target) from the env.
// Critic run 44: c43_ll4 on R33's world.landings (AT0=port: 'aboard' means the first standing at its landing's port, ashore; else the first embarked).
// Critic run 41: c40_ll3 with NOW=click (each ORDERS entry is one click: its orders taken, then applied together at once, as hud.commands -> worker 'cmds' now does).
// Critic run 40 (new): (NOW=1 applies each order at once, as the game's UI does) c40_ll2 whose trace also gives where each id's transport group is (and whether under way); c40_ll with EXTRA fresh divisions (ids n..n+EXTRA-1, not sent to Shanghai) and the
// seaHint marks of each order (before it is given) recorded, to compare the mark with where each lands.
// 1938 seed <seed>, Japan (war with China), the <n> divisions nearest Tokyo sent to Shanghai (escort).
// ORDERS (env, JSON): [{ "at": "aboard"|number, "plus": hours, "who": [indices into ids], "x": , "y": }]
//   at "aboard": hours after the first is aboard a convoy standing at its port; a number: absolute hour.
// Logs per id: LeftLanding, MoveRejected (+reason), FormationLanded (where, when), embark/bound changes, and the end.
// Usage: ORDERS='[...]' npx tsx critic/scripts/c40_ll.ts <seed> <n> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { landingHeld, seaHint, landingOfDivision, voyageOf } from '../../src/sim/systems/landings';
const [seedS, nS, dS, outF] = process.argv.slice(2);
const ORD: { at: 'aboard' | number; plus?: number; who: number[]; x: number; y: number; escort?: boolean; done?: boolean }[] = JSON.parse((process.env.ORDERS ?? '[]').replace(/([{,]\s*)([a-z]+)\s*:/g, '$1"$2":').replace(/:\s*([a-z]+)/g, ':"$1"'));
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(process.env.TAG ?? 'JAP'), FOE = tag(process.env.FOE ?? 'CHI'); const [HX, HY] = (process.env.HOME_XY ?? '1818.5,385.5').split(',').map(Number); const [TX, TY] = (process.env.TGT ?? '1715.5,413.5').split(',').map(Number);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: N } as never);
if (!process.env.T0) s.step(1); // T0=1: the first orders at tick 0, as the page gives them
const w = s.world, c = () => w.formations.cols;
const W = w.cells.w;
if (!w.wars.atWar(N, FOE)) { s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); s.step(1); }
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - HX!, c().y[f]! - HY!)]); });
cand.sort((a, b) => a[1] - b[1]);
const EXTRA = Number(process.env.EXTRA ?? 0);
const ids = cand.slice(0, Number(nS) + EXTRA).map((x) => x[0]);
const out: Record<string, unknown> = { seed: Number(seedS), ids, orders: ORD };
out.first = ids.slice(0, Number(nS)).map((id) => s.command({ kind: 'moveFormation', id, x: TX!, y: TY!, nation: N, escort: true } as never));
const ev: string[] = [];
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!;
    const a = e[i + 2]!;
    if (ids.includes(a) && [EventKind.LeftLanding, EventKind.NextVoyage, EventKind.MoveRejected, EventKind.FormationLanded, EventKind.FormationDestroyed].includes(k)) ev.push(`t${e[i]} ${EV[k]} a${a} b${e[i + 3]} x${(+e[i + 4]!).toFixed(1)} y${(+e[i + 5]!).toFixed(1)}`);
  }
  e.length = 0; wd.out.fires.length = 0;
};
const held = (id: number): string => { const l = w.formations.has(id) ? landingHeld(w, id) : null; return l ? `${l.land % W},${Math.floor(l.land / W)}` : '-'; };
const LS = ['gath', 'sail', 'ret'];
const state = (id: number): string => {
  if (!w.formations.has(id)) return `${id}:dead`;
  const e = w.embarked.get(id);
  const l = landingOfDivision(w, id);
  const lp = l ? `[L${l.id}${LS[l.state]} p${w.ports[l.port]?.name ?? l.port} f${l.fleets.join('/')} d${[...l.divisions.keys()].join('/')}${l.fleets.length && w.formations.has(l.fleets[0]!) ? ` g@${c().x[l.fleets[0]!]!.toFixed(1)},${c().y[l.fleets[0]!]!.toFixed(1)}${c().moving[l.fleets[0]!] ? 'm' : ''}` : ''}]` : '';
  const vo = w.formations.has(id) ? voyageOf(w, id) : null; return `${id}:${vo ? vo.state[0]+vo.state.slice(-2) + (vo.wait ? vo.wait.aboard + "/" + vo.wait.of : "") + ":" : ""}${e ? `aboard${e.fleet}${c().moving[e.fleet] ? 'm' : ''}` : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)} L${held(id)}${lp}`;
};
const VOY: Record<number, Record<string, number>> = {};
let aboardSince = -1;
const trace: string[] = [];
const landed: Record<number, [number, number, number]> = {};
for (let h = 0; h < 24 * Number(dS); h++) {
  for (const o of ORD) {
    if (o.done) continue;
    const due = o.at === 'aboard' ? aboardSince >= 0 && w.tick >= aboardSince + (o.plus ?? 0) : w.tick >= o.at;
    if (!due) continue;
    o.done = true;
    const before = o.who.map((i) => state(ids[i]!));
    const hint = seaHint(w, o.who.map((i) => ids[i]!).sort((a, b) => a - b), o.x, o.y);
    ev.push(`t${w.tick} HINT how${hint.how} marks ${hint.marks.map((m) => `w${m.water % W},${Math.floor(m.water / W)} l${m.land % W},${Math.floor(m.land / W)}${m.same ? ' same' : ''}`).join(' ; ')}`);
    const r = o.who.map((i) => { const ok = s.command({ kind: 'moveFormation', id: ids[i]!, x: o.x, y: o.y, nation: N, escort: !(o.escort === false || (o.escort as unknown) === "false") } as never); if (process.env.NOW === '1') s.applyNow(take as never); return ok; }); if (process.env.NOW === 'click') s.applyNow(take as never); // NOW=click: one click's orders applied together at once, as the page's hud.commands does since R29a // NOW=1: each order applied at once, as the page's hud.command does (now: true)
    ev.push(`t${w.tick} ORDER ${o.who.map((i) => ids[i]).join(',')} -> ${o.x},${o.y} ${JSON.stringify(r)} before ${before.join(' | ')} after ${o.who.map((i) => state(ids[i]!)).join(' | ')}`);
  }
  s.step(1, take as never);
  for (const id of ids) { if (!w.formations.has(id)) continue; const vo = voyageOf(w, id); const k = vo ? vo.state : 'none'; (VOY[id] ??= {})[k] = (VOY[id]![k] ?? 0) + 1; }
  if (aboardSince < 0 && ids.some((id) => (process.env.AT0 === 'port' ? (() => { const l = landingOfDivision(w, id); return !!l && !c().moving[id] && !w.embarked.has(id); })() : w.embarked.has(id)))) aboardSince = w.tick;
  for (const id of ids) if (w.formations.has(id) && !landed[id] && !w.embarked.has(id) && ev.some((x) => x.includes(`FormationLanded a${id} `))) landed[id] = [w.tick, +c().x[id]!.toFixed(1), +c().y[id]!.toFixed(1)];
  const TG = (process.env.TRACEG ?? '').split(',').filter(Boolean).map(Number);
  const gs = TG.map((g) => w.formations.has(g) ? `G${g}@${c().x[g]!.toFixed(1)},${c().y[g]!.toFixed(1)}${c().moving[g] ? 'm' : ''}n${[...w.embarked].filter(([, e]) => e.fleet === g).length}` : `G${g}:gone`).join(' ');
  if (h % 24 === 0 || h < 12 || (process.env.HFROM && h >= +process.env.HFROM && h <= +process.env.HTO)) trace.push(`t${w.tick} ${ids.map(state).join(' ')} ${gs}`);
  if (ids.every((id) => landed[id] || !w.formations.has(id)) && ORD.every((o) => o.done)) break;
}
Object.assign(out, { voy: VOY, aboardSince, landed, end: ids.map(state), events: ev, trace });
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ids, aboardSince, landed, end: out.end, events: ev }));
