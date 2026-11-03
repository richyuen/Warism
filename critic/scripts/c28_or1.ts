// Critic run 27 (new), OR1: one bonded Force war from OR, traced. Day <day>, a Force-wars b; overlord of each and the
// wars between them right after the command is applied and each hour for <hours> hours; all events naming a or b.
// Usage: npx tsx critic/scripts/c28_or1.ts <seed> <day> <A> <B> <hours> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2]), day = Number(process.argv[3]);
const TA = process.argv[4]!, TB = process.argv[5]!, hours = Number(process.argv[6] ?? 24), out = process.argv[7]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const nc = w.nations.cols;
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const A = id(TA), B = id(TB);
const evs: string[] = [];
const take = (ww: typeof w) => { const e = ww.out.events; for (let i = 0; i < e.length; i += 6) { const a = e[i + 2]!, b = e[i + 3]!; const k = EV[e[i + 1]!]!; if ((a === A || b === A || a === B || b === B) && !/Strike|Flak|Air|Battle|Sortie|Cell|Shot/.test(k)) evs.push(`${(e[i]! / 24).toFixed(3)} ${k} ${tag(a)} ${tag(b)}`); } ww.out.events.length = 0; ww.out.fires.length = 0; };
s.step(day * 24, (ww) => { ww.out.events.length = 0; ww.out.fires.length = 0; });
const wdesc = (x: { id: number; sides: number[][] }) => `#${x.id} ${x.sides[0]!.map(tag).join('+')} v ${x.sides[1]!.map(tag).join('+')}`;
const st = (k: string) => ({ k, tick: w.tick, ovA: tag(nc.overlord[A]!), ovB: tag(nc.overlord[B]!), AvB: w.wars.atWar(A, B), wars: w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(A) || sd.includes(B))).map(wdesc) });
const log: unknown[] = [st('before')];
s.command({ kind: 'forceWar', attacker: A, defender: B } as never);
for (let h = 1; h <= hours; h++) {
  s.step(1, take);
  const x = st(`+${h}h`);
  const last = log[log.length - 1] as ReturnType<typeof st>;
  if (h <= 2 || x.ovA !== last.ovA || x.ovB !== last.ovB || x.AvB !== last.AvB || x.wars.join() !== last.wars.join()) log.push({ ...x, evs: evs.splice(0) });
}
log.push({ k: 'events left', evs });
writeFileSync(out, JSON.stringify(log, null, 1));
console.log(JSON.stringify(log, null, 1).slice(0, 6000));
console.log('done:');
