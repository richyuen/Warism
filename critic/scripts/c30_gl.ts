// Critic run 26 (new), GL: each guarantee that ends on <seed> to <days>: the day, both nations' state (living, overlord), and whether a GuaranteeLapsed row came.
// Usage: npx tsx critic/scripts/c30_gl.ts <seed> <days>
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 7019), days = Number(process.argv[3] ?? 365);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world; const nc = w.nations.cols;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const key = (g: { guarantor: number; target: number }) => `${g.guarantor}:${g.target}`;
let held = new Set(w.alliances.guarantees.map(key)); const rows = new Set<string>(); const evs: string[] = [];
for (let d = 1; d <= days; d++) {
  s.step(24, (ww) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) { if (e[i + 1] === EventKind.GuaranteeLapsed) rows.add(`${e[i + 2]}:${e[i + 3]}`); } e.length = 0; ww.out.fires.length = 0; });
  const now = new Set(w.alliances.guarantees.map(key));
  for (const k of held) if (!now.has(k)) { const [g, t] = k.split(':').map(Number) as [number, number]; evs.push(`day ${d} ${tag(g)} of ${tag(t)}: living ${nc.living[g]}/${nc.living[t]} overlord ${tag(nc.overlord[g]!)}/${tag(nc.overlord[t]!)} row ${rows.has(k)}`); }
  held = now;
}
console.log(JSON.stringify({ seed, evs }));
console.log('done:');
