// Critic run 27 (new), OR2: one Force war from OR whose result broke the war lists, followed. Day <day>, a Force-wars b;
// then each day for <days> days: the integrity breaks (a pair on one side of a war and enemies in another; a puppet at war
// with its overlord), the wars of the pairs named, and a hash of the world; ends with whether the sim stepped on.
// Usage: npx tsx critic/scripts/c27_or2.ts <seed> <day> <A> <B> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2]), day = Number(process.argv[3]);
const TA = process.argv[4]!, TB = process.argv[5]!, days = Number(process.argv[6] ?? 60), out = process.argv[7]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const A = id(TA), B = id(TB);
const wdesc = (x: { id: number; sides: number[][] }) => `#${x.id} ${x.sides[0]!.map(tag).join('+')} v ${x.sides[1]!.map(tag).join('+')}`;
function breaks(): string[] {
  const nc = w.nations.cols;
  const f: string[] = [];
  for (const war of w.wars.list) for (const side of war.sides) for (let i = 0; i < side.length; i++) for (let j = i + 1; j < side.length; j++) {
    const a = side[i]!, b = side[j]!;
    if (w.wars.atWar(a, b)) f.push(`both ${tag(a)}/${tag(b)} in #${war.id}, enemies in ${w.wars.list.filter((x) => (x.sides[0].includes(a) && x.sides[1].includes(b)) || (x.sides[1].includes(a) && x.sides[0].includes(b))).map((x) => '#' + x.id).join(',')}`);
  }
  w.nations.forEach((n) => { const o = nc.overlord[n]!; if (nc.living[n] === 1 && o !== 0 && w.wars.atWar(n, o)) f.push(`pvo ${tag(n)}/${tag(o)}`); });
  return f;
}
const evs: string[] = [];
const take = (ww: typeof w) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) { const k = EV[e[i + 1]!]!; if (/War|Peace|Bond|Puppet|Alliance|Annex|Capital|Eliminat/.test(k)) evs.push(`${(e[i]! / 24).toFixed(2)} ${k} ${tag(e[i + 2]!)} ${tag(e[i + 3]!)}`); } ww.out.events.length = 0; ww.out.fires.length = 0; };
s.step(day * 24, (ww) => { ww.out.events.length = 0; ww.out.fires.length = 0; });
const log: unknown[] = [{ k: 'before', breaks: breaks(), wars: w.wars.list.map(wdesc) }];
s.command({ kind: 'forceWar', attacker: A, defender: B } as never);
s.step(1, take);
log.push({ k: '+1h', breaks: breaks(), wars: w.wars.list.map(wdesc), evs: evs.splice(0) });
let lastBreak = 0;
for (let d = 1; d <= days; d++) {
  s.step(24, take);
  const b = breaks();
  if (b.length) lastBreak = d;
  if (d % 5 === 0 || d <= 2) log.push({ k: `+${d}d`, breaks: b, evs: evs.splice(0) });
}
const res = { seed, day, A: TA, B: TB, lastBreakDay: lastBreak, hash: s.hash(), log };
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ lastBreakDay: lastBreak, first: log[1] }, null, 1).slice(0, 4000));
console.log('done:');
