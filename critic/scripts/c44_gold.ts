// Critic run 34 (copy of run 33): a nation's gold every 10 days after God sets it (seed, TAG, gold, days); NationDefaulted/Collapsed rows.
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, gS, dS] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const n = NATIONS_1938.findIndex((d) => d.tag === T) + 1;
s.command({ kind: 'setGold', nation: n, value: Number(gS) } as never);
const ev: string[] = [];
const rows: unknown[] = [];
for (let d = 1; d <= Number(dS); d++) {
  s.step(24, (w) => { const e = w.out.events; for (let i = 0; i < e.length; i += 6) if ((e[i + 1] === EventKind.NationDefaulted || e[i + 1] === EventKind.NationCollapsed) && e[i + 2] === n) ev.push(`d${d} kind${e[i + 1]}`); e.length = 0; w.out.fires.length = 0; });
  if (d % 10 === 0 || d === 1) rows.push([d, Math.round(s.world.nations.cols.gold[n]!)]);
}
console.log(JSON.stringify({ T, rows, ev }));
