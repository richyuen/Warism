// Critic run 36 (R23b, new): which cells near Shanghai give the same landing as the four's, and which a different one.
// 1938 seed <seed>, Japan played; the four nearest Tokyo ordered to Shanghai with the escort, 26 hours on. Every land
// cell within <r> of (cx, cy): its landing (water, land), whether it is the four's, neutral or not; one cell per landing.
// Usage: npx tsx critic/scripts/c36_lof.ts <seed> <cx> <cy> <r>
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { landingOf, neutralLanding } from '../../src/sim/systems/amphibious';
const [seedS, cxS, cyS, rS] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const JAP = NATIONS_1938.findIndex((d) => d.tag === 'JAP') + 1;
s.command({ kind: 'setPlayer', nation: JAP } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols;
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== JAP || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - 1818.5, c().y[f]! - 385.5)]); });
cand.sort((a, b) => a[1] - b[1]);
const ids = cand.slice(0, 4).map((x) => x[0]);
for (const id of ids) s.command({ kind: 'moveFormation', id, x: 1715.5, y: 413.5, nation: JAP, escort: true } as never);
s.step(25);
const W = w.cells.w;
const four = landingOf(w, 413 * W + 1715)!;
const e = [...w.embarked.entries()].filter(([id]) => ids.includes(id)).map(([id, v]) => ({ id, ...v }));
console.log('four', four, 'embarked', JSON.stringify(e));
const seen = new Map<string, { x: number; y: number; d: number; same: boolean; neutral: boolean; ctl: number }>();
const [cx, cy, r] = [+cxS!, +cyS!, +rS!];
for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
  const t = y * W + x;
  const l = landingOf(w, t);
  if (!l) continue;
  const k = `${l.water}/${l.land}`;
  const d = Math.hypot(x + 0.5 - 1715.5, y + 0.5 - 413.5);
  const prev = seen.get(k);
  if (!prev || d < prev.d) seen.set(k, { x: x + 0.5, y: y + 0.5, d: +d.toFixed(1), same: l.water === four.water && l.land === four.land, neutral: neutralLanding(w, JAP, t), ctl: w.cells.controller[t]! });
}
for (const [k, v] of [...seen].sort((a, b) => a[1].d - b[1].d)) console.log(k, JSON.stringify(v));
