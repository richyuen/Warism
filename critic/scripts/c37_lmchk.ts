// Critic run 34 (copy of run 33): after GER-POL peace (c37_pm_gerpol_land), is Poland's ground foreign to Germany while the German
// divisions ordered at war march on into it? Same orders as c37_pm.ts (3517, two divisions nearest Berlin to Warsaw,
// peace at t30). Each 12 h: foreignTo(GER, POL), atWar, sameSide, overlords, alliances, each division's holder/moving.
// Usage: npx tsx critic/scripts/c37_lmchk.ts
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { foreignTo } from '../../src/sim/systems/movement';
import { loadAssets1938 } from '../../tools/headless/assets';
const s = new Sim({ scenario: '1938', seed: 3517, assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag('GER'), F = tag('POL');
s.command({ kind: 'setPlayer', nation: N } as never); s.step(1);
if (!s.world.wars.atWar(N, F)) { s.command({ kind: 'forceWar', attacker: N, defender: F } as never); s.step(1); }
const w = s.world, c = () => w.formations.cols;
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - 1100.5, c().y[f]! - 267.5)]); });
cand.sort((a, b) => a[1] - b[1]);
const ids = cand.slice(0, 2).map((x) => x[0]);
for (const id of ids) s.command({ kind: 'moveFormation', id, x: 1143.5, y: 269.5, nation: N } as never);
const al = (n: number): unknown => (w.alliances as unknown as { allianceOf(n: number): unknown }).allianceOf(n);
for (let h = 0; h < 240; h++) {
  s.step(1, ((wd: typeof w) => { wd.out.events.length = 0; wd.out.fires.length = 0; }) as never);
  if (w.tick === 30) { const war = w.wars.between(N, F)?.war; console.log('peace', war ? s.command({ kind: 'forcePeace', war: war.id } as never) : 'none'); }
  if (w.tick % 12 === 0) {
    const st = ids.map((id) => { const cell = Math.floor(c().y[id]!) * w.cells.w + Math.floor(c().x[id]!); const hd = w.cells.controller[cell]!; return `${id}@(${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}) h${hd} foreign${foreignTo(w, N, hd) ? 1 : 0} mv${c().moving[id]} po${w.playerOrders.has(id) ? 1 : 0}`; });
    console.log(`t${w.tick} foreignTo(GER,POL)=${foreignTo(w, N, F)} atWar=${w.wars.atWar(N, F)} same=${w.wars.sameSide(N, F)} ovGER=${w.nations.cols.overlord[N]} ovPOL=${w.nations.cols.overlord[F]} alGER=${JSON.stringify(al(N))?.slice(0, 40)} alPOL=${JSON.stringify(al(F))?.slice(0, 40)} | ${st.join(' | ')}`);
  }
}
