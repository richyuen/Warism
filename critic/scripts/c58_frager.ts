// Critic run 55 (new): on 26309 played as France (setPlayer at the start, as the page's probe), day by day: whether
// France and Germany are at war, the wars that hold both, and every event naming both, with its kind.
// Usage: npx tsx critic/scripts/c58_frager.ts <seed> <A> <B> <days> [player]
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const seed = Number(process.argv[2] ?? 26309);
const A = nationId(process.argv[3] ?? 'FRA');
const B = nationId(process.argv[4] ?? 'GER');
const days = Number(process.argv[5] ?? 540);
const player = process.argv[6] ?? 'FRA';
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) } as never);
if (player !== '-') s.command({ kind: 'setPlayer', nation: nationId(player) } as never);
const name = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
let last = '';
const take = (w: World): void => {
  const e = w.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const a = e[i + 2]!, b = e[i + 3]!;
    const win = (process.env.WIN ?? '').split(',').filter(Boolean).map(Number);
    const inWin = win.some((d) => Math.abs(e[i]! / 24 - d) <= 1.5);
    if ((a === A && b === B) || (a === B && b === A) || (inWin && (a === A || b === A)) || (inWin && /War|Peace|Guarantee|Alliance|Pact|Bond|Puppet|Call/.test(name[e[i + 1]!] ?? ''))) console.log(`  t${e[i]} d${Math.floor(e[i]! / 24)} ${name[e[i + 1]!]} a=${tag(a)} b=${tag(b)} ${e[i + 4]} ${e[i + 5]}`);
  }
  e.length = 0;
  w.out.fires.length = 0;
};
for (let d = 0; d < days; d++) {
  s.step(24, take);
  const w = s.world;
  const both = w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(A)) && x.sides.some((sd) => sd.includes(B)));
  const st = `atWar ${w.wars.atWar(A, B)} | ${both.map((x) => x.sides.map((sd) => sd.map(tag).join('+')).join(' vs ')).join('; ')}`;
  if (st !== last) { console.log(`d${d + 1} ${st}`); last = st; }
}
console.log('done:');
