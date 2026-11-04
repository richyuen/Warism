// Critic run 32: Sweden played (no transports), its division nearest Stockholm ordered to Copenhagen with the escort; the
// reply, the events, and whether stepping goes on (hours timed).
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, sx, sy, dx, dy] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const n = NATIONS_1938.findIndex((d) => d.tag === T) + 1;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: n } as never); s.step(1);
const w = s.world, c = w.formations.cols;
let best = 0, bd = 1e9; w.formations.forEach((id) => { if (c.nation[id] !== n || w.isFleet(id) || w.offLand(id)) return; const d = Math.hypot(c.x[id]! - +sx!, c.y[id]! - +sy!); if (d < bd) [bd, best] = [d, id]; });
const r = s.command({ kind: 'moveFormation', id: best, x: +dx!, y: +dy!, nation: n, escort: true } as never);
const ev: string[] = [];
for (let h = 0; h < 120; h++) { const t0 = performance.now(); s.step(1, (wd) => { const e = wd.out.events; for (let i = 0; i < e.length; i += 6) if (e[i + 2] === best || e[i + 3] === n && /Reject|Convoy/.test(EV[e[i + 1]!] ?? '')) ev.push(`t${wd.tick} ${EV[e[i + 1]!]} ${e[i + 2]} ${e[i + 3]} ${e[i + 4]}`); e.length = 0; wd.out.fires.length = 0; }); const dt = performance.now() - t0; if (dt > 2000) ev.push(`slow hour ${h}: ${dt.toFixed(0)} ms`); }
console.log(JSON.stringify({ div: best, r, ev, at: [c.x[best], c.y[best]], tick: w.tick }));
