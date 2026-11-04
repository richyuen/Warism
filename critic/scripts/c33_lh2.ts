// Critic run 33 (R17): one division of <TAG> (played) nearest (sx,sy) ordered over the sea to (dx,dy) with the escort;
// hourly place; the hour it lands, its place each 12 h after, and any jump over 3 cells in an hour.
// Usage: npx tsx critic/scripts/c33_lh2.ts <seed> <TAG> <sx> <sy> <dx> <dy> <days>
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, sx, sy, dx, dy, dS] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const n = NATIONS_1938.findIndex((d) => d.tag === T) + 1;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: n } as never); s.step(1);
const w = s.world, c = () => w.formations.cols;
let id = 0, bd = 1e9; w.formations.forEach((f) => { if (c().nation[f] !== n || w.isFleet(f) || w.offLand(f)) return; const d = Math.hypot(c().x[f]! - +sx!, c().y[f]! - +sy!); if (d < bd) [bd, id] = [d, f]; });
const r = s.command({ kind: 'moveFormation', id, x: +dx!, y: +dy!, nation: n, escort: true } as never);
const ev: string[] = []; const jumps: string[] = []; const after: string[] = [];
let landed = 0; let px = c().x[id]!, py = c().y[id]!;
for (let h = 0; h < 24 * Number(dS); h++) {
  s.step(1, (wd) => { const e = wd.out.events; for (let i = 0; i < e.length; i += 6) if (e[i + 2] === id) ev.push(`t${wd.tick} ${EV[e[i + 1]!]} ${e[i + 4]}`); e.length = 0; wd.out.fires.length = 0; });
  if (!w.formations.has(id)) { ev.push(`gone t${w.tick}`); break; }
  const x = c().x[id]!, y = c().y[id]!;
  if (Math.hypot(x - px, y - py) > 3 && !w.afloat(id)) jumps.push(`t${w.tick} (${px.toFixed(1)},${py.toFixed(1)}) -> (${x.toFixed(1)},${y.toFixed(1)}) afloat=${w.afloat(id)}`);
  px = x; py = y;
  if (!landed && ev.some((e) => e.includes('FormationLanded'))) landed = w.tick;
  if (landed && (w.tick - landed) % 12 === 0 && after.length < 12) after.push(`t${w.tick} (${x.toFixed(1)},${y.toFixed(1)}) holder=${NATIONS_1938[w.cells.controller[Math.floor(y) * w.cells.w + Math.floor(x)]! - 1]?.tag}`);
}
console.log(JSON.stringify({ T, id, r, landed, ev: ev.slice(0, 12), jumps, after }));
