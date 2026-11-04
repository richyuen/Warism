// Critic run 33: per 1938 nation at the start (seed <seed>): transport groups, other fleets, land formations.
import { size1938, NATIONS_1938, TEMPLATES_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const seed = Number(process.argv[2] ?? 3517);
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world, fc = w.formations.cols;
const r: Record<string, { tr: number; fl: number; land: number }> = {};
for (const f of w.formations.ids()) {
  const t = TEMPLATES_1938[fc.template[f]!]?.id ?? '?'; const tag = NATIONS_1938[fc.nation[f]! - 1]?.tag ?? '?';
  const e = (r[tag] ??= { tr: 0, fl: 0, land: 0 });
  if (t === 'transport_group') e.tr++; else if (w.afloat?.(f) ?? false) e.fl++; else if (/fleet|group|flotilla|squadron|carrier|battle|cruiser|destroyer|sub/i.test(t)) e.fl++; else e.land++;
}
console.log(JSON.stringify(r));
