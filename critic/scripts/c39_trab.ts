// Critic run 34 (copy of run 33) (R16b, new): do the traits move a war the way their text says? 1938 seed <seed>: <ATT> forces war on
// <DEF> at hour 1; the variant sets traits first (God's setTraits). Records every 10 days: the defender's own cells it
// still controls, cells of it the attacker controls, both sides' men in formations, both treasuries, both unrest means.
// Usage: npx tsx critic/scripts/c39_trab.ts <seed> <ATT> <DEF> <variant> <days> <out.json>
//   variant: base | defFort (DEF + fortifier) | defNone (DEF no traits) | attNone (ATT no traits) | attMil (ATT militarist+armored only)
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { traitMask } from '../../src/shared/traits';
import { loadAssets1938 } from '../../tools/headless/assets';

const [seedS, ATT, DEF, variant, daysS, out] = process.argv.slice(2);
const seed = Number(seedS), days = Number(daysS);
const SZ = size1938();
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(SZ.w) });
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const A = id(ATT!), D = id(DEF!);
const w = () => s.world;
const nc = () => w().nations.cols;
const before = { att: nc().traits[A], def: nc().traits[D] };
if (variant === 'defFort') s.command({ kind: 'setTraits', nation: D, mask: nc().traits[D]! | traitMask(['fortifier']) } as never);
if (variant === 'defNone') s.command({ kind: 'setTraits', nation: D, mask: 0 } as never);
if (variant === 'attNone') s.command({ kind: 'setTraits', nation: A, mask: 0 } as never);
if (variant === 'attMil') s.command({ kind: 'setTraits', nation: A, mask: traitMask(['militarist', 'armored_doctrine']) } as never);
const clear = (wd: { out: { events: number[]; fires: number[] } }): void => { wd.out.events.length = 0; wd.out.fires.length = 0; };
s.step(1, clear as never);
s.command({ kind: 'forceWar', attacker: A, defender: D } as never);
s.step(1, clear as never);
const after = { att: nc().traits[A], def: nc().traits[D] };
const men = (n: number): number => { const fc = w().formations.cols; let m = 0; for (const f of w().formations.ids()) if (fc.nation[f] === n) m += fc.strength[f]!; return m; };
const cnt = (k: number, o: number): number => { const c = w().cells; let n = 0; for (let i = 0; i < c.owner.length; i++) if (c.owner[i] === o && c.controller[i] === k) n++; return n; };
const rows: unknown[] = [];
for (let d = 1; d <= days; d++) {
  s.step(24, clear as never);
  if (d % 10 === 0) rows.push({ d, defHolds: cnt(D, D), attTook: cnt(A, D), attMen: Math.round(men(A)), defMen: Math.round(men(D)), atWar: w().wars.list.some((x) => x.sides.some((sd) => sd.includes(A)) && x.sides.some((sd) => sd.includes(D))), defAlive: (nc().alive?.[D] ?? 1) });
}
writeFileSync(out!, JSON.stringify({ seed, ATT, DEF, variant, before, after, rows }, null, 1));
console.log(variant, JSON.stringify(rows.slice(-1)));
