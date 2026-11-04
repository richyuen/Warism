// Critic run 33 (R17, new, headless): the player's landings as the sim keeps them. 1938 seed <seed>, Britain played.
// Two orders with the escort: the division nearest London to Calais, the next nearest to Belfast. Hourly: each
// division's place (afloat or not), the escorts, the British groups under the player's order. A save in the first hour a
// division is afloat; 200 h on, the hash; the save loaded in a new Sim and 200 h on, the hash (must agree).
// Then the player releases Britain (setPlayer 0) once both are ashore: for <after> days, which British transport and
// war groups are still under the player's order (ROADMAP R17 "Also": a called group stays the player's while it lives),
// and whether Britain's AI moves them.
// Usage: npx tsx critic/scripts/c33_lh.ts <seed> <after days> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { transportRoom } from '../../src/sim/systems/amphibious';
import { navOf } from '../../src/sim/world';
import { loadAssets1938 } from '../../tools/headless/assets';

const [seedS, afterS, outF] = process.argv.slice(2);
const seed = Number(seedS), after = Number(afterS);
const SZ = size1938(); const W = SZ.w;
const assets = loadAssets1938(W);
const s = new Sim({ scenario: '1938', seed, assets });
const ENG = NATIONS_1938.findIndex((d) => d.tag === 'ENG') + 1;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const out: Record<string, unknown> = { seed };
s.command({ kind: 'setPlayer', nation: ENG } as never); s.step(1);
const w0 = s.world, fc = () => s.world.formations.cols;
const comp = navOf(w0).grid.component;
const LONDON = 275 * W + 1023, CALAIS: [number, number] = [1034.5, 279.5], BELFAST: [number, number] = [990.5, 251.5];
const divs: number[] = [];
w0.formations.forEach((id) => { if (fc().nation[id] === ENG && !w0.isFleet(id) && !w0.offLand(id) && comp[Math.floor(fc().y[id]!) * W + Math.floor(fc().x[id]!)] === comp[LONDON]) divs.push(id); });
divs.sort((a, b) => Math.hypot(fc().x[a]! - 1023, fc().y[a]! - 275) - Math.hypot(fc().x[b]! - 1023, fc().y[b]! - 275));
const [d1, d2, d3, d4] = divs;
const D = [d1!, d2!, d3!, d4!];
const groups = (): { id: number; tr: boolean; player: boolean; x: number; y: number }[] => { const r: { id: number; tr: boolean; player: boolean; x: number; y: number }[] = []; s.world.formations.forEach((id) => { if (fc().nation[id] === ENG && s.world.isFleet(id)) r.push({ id, tr: transportRoom(s.world, id) > 0 || TEMPLATES_1938[fc().template[id]!]?.id === 'transport_group', player: s.world.playerOrders.has(id), x: +fc().x[id]!.toFixed(1), y: +fc().y[id]!.toFixed(1) }); }); return r; };
out.start = { divs: [d1, d2], groups: groups() };
out.r1 = [d1, d2, d3].map((d) => s.command({ kind: 'moveFormation', id: d!, x: CALAIS[0], y: CALAIS[1], nation: ENG, escort: true } as never));
out.r2 = s.command({ kind: 'moveFormation', id: d4!, x: BELFAST[0], y: BELFAST[1], nation: ENG, escort: true } as never);
const evs: string[] = [];
const take = (w: typeof w0): void => { const e = w.out.events; for (let i = 0; i < e.length; i += 6) if (D.includes(e[i + 2]!) || e[i + 3] === ENG && /Convoy|Landing|Reject|Escort/.test(EV[e[i + 1]!] ?? '')) evs.push(`t${w.tick} ${EV[e[i + 1]!]} ${e[i + 2]} ${e[i + 3]} ${e[i + 4]}`); e.length = 0; w.out.fires.length = 0; };
const trace: unknown[] = [];
let saved: Uint8Array | null = null, savedTick = 0;
let landedAt = 0;
for (let h = 0; h < 24 * 60; h++) {
  s.step(1, take as never);
  const w = s.world;
  const st = D.map((d) => ({ d, alive: w.formations.has(d), afloat: w.formations.has(d) ? w.afloat(d) : null, x: w.formations.has(d) ? +fc().x[d]!.toFixed(1) : null, y: w.formations.has(d) ? +fc().y[d]!.toFixed(1) : null, fetch: w.seaFetch?.get?.(d) ?? null, emb: w.embarked?.get?.(d)?.fleet ?? null }));
  if (h % 3 === 0) trace.push({ t: w.tick, st, escorts: [...w.escorts.entries()].map(([k, v]) => [k, JSON.stringify(v)]) });
  if (!saved && st.some((x) => x.afloat)) { saved = s.save(); savedTick = w.tick; }
  if (h > 24 && st.every((x) => x.afloat === false && Math.hypot((x.x ?? 0) - 1023, (x.y ?? 0) - 275) > 8)) { landedAt = w.tick; break; }
}
out.trace = trace; out.events = evs; out.landedAt = landedAt;
out.endPlaces = D.map((d) => [d, fc().x[d], fc().y[d]]);
// determinism across a save mid-voyage
if (saved) {
  const a = new Sim({ scenario: '1938', seed, assets }); a.load(saved); a.step(200, take as never); const ha = a.hash();
  const b = new Sim({ scenario: '1938', seed, assets }); b.load(saved); b.step(200, take as never); const hb = b.hash();
  out.saveMid = { savedTick, ha, hb, same: ha === hb };
}
out.groupsLanded = groups();
s.command({ kind: 'setPlayer', nation: 0 } as never);
const rel: unknown[] = [];
for (let d = 1; d <= after; d++) { s.step(24, take as never); if (d % 30 === 0) rel.push({ d, groups: groups() }); }
out.released = rel;
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ r1: out.r1, r2: out.r2, landedAt, saveMid: out.saveMid, events: evs.slice(0, 30), playerGroupsLanded: (out.groupsLanded as { player: boolean }[]).filter((g) => g.player).length, playerGroupsLast: rel.length ? ((rel[rel.length - 1] as { groups: { player: boolean }[] }).groups.filter((g) => g.player)) : null }));
