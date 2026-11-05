// Critic run 40 (new): R28b's seaHint for a selection whose first (sorted) division does not go by sea.
// Japan, seed <seed>: a division on the mainland (west of x 1760) and the nearest Tokyo, both selected, the cursor at
// (x, y). Records seaHint for [mainland, tokyo], for [tokyo] alone, then gives both the order and steps <days>, logging
// where each goes (embarked / bound / landed). Usage: npx tsx critic/scripts/c40_hintmix.ts <seed> <x> <y> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { seaHint } from '../../src/sim/systems/amphibious';
const [seedS, xs, ys, dS, outF] = process.argv.slice(2);
const X = Number(xs), Y = Number(ys);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag('JAP'), FOE = tag('CHI');
s.command({ kind: 'setPlayer', nation: N } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols, W = w.cells.w;
if (!w.wars.atWar(N, FOE)) { s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); s.step(1); }
const land: number[] = [];
w.formations.forEach((f) => { if (c().nation[f] === N && !w.isFleet(f) && !w.offLand(f)) land.push(f); });
const tokyo = [...land].sort((a, b) => Math.hypot(c().x[a]! - 1818.5, c().y[a]! - 385.5) - Math.hypot(c().x[b]! - 1818.5, c().y[b]! - 385.5))[0]!;
const main = land.filter((f) => c().x[f]! < 1760).sort((a, b) => Math.hypot(c().x[a]! - X, c().y[a]! - Y) - Math.hypot(c().x[b]! - X, c().y[b]! - Y));
const fmt = (h: ReturnType<typeof seaHint>) => ({ how: h.how, marks: h.marks.map((m) => `w${m.water % W},${Math.floor(m.water / W)} l${m.land % W},${Math.floor(m.land / W)}${m.same ? ' same' : ''}`) });
const out: Record<string, unknown> = { seed: Number(seedS), target: [X, Y], tokyo, mainlandNearest: main.slice(0, 5).map((f) => [f, +c().x[f]!.toFixed(1), +c().y[f]!.toFixed(1)]) };
const lower = main.filter((f) => f < tokyo);
const higher = main.filter((f) => f > tokyo);
out.lowerCount = lower.length; out.higherCount = higher.length;
const m = lower[0] ?? main[0]!;
out.mainland = [m, +c().x[m]!.toFixed(1), +c().y[m]!.toFixed(1)];
out.hintBoth = fmt(seaHint(w, [m, tokyo].sort((a, b) => a - b), X, Y));
out.hintTokyo = fmt(seaHint(w, [tokyo], X, Y));
out.hintMain = fmt(seaHint(w, [m], X, Y));
out.orders = [m, tokyo].sort((a, b) => a - b).map((id) => s.command({ kind: 'moveFormation', id, x: X, y: Y, nation: N } as never));
const tr: string[] = [];
for (let h = 0; h < 24 * Number(dS); h++) {
  s.step(1, ((wd: typeof w) => { wd.out.events.length = 0; wd.out.fires.length = 0; }) as never);
  if (h % 24 === 0 || h < 3) tr.push(`t${w.tick} ` + [m, tokyo].map((id) => `${id}:${w.embarked.has(id) ? 'aboard' : w.seaFetch.has(id) ? 'bound' : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}`).join(' '));
}
out.trace = tr;
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, trace: tr.slice(0, 6) }));
