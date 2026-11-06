// Critic run 41 (new): R29b's state through a save. Seed 3517, Japan at war with China; the two nearest Tokyo sent to
// Shanghai at tick 0 (escort); two hours after the first is aboard, one click sends a fresh division to Fuzhou and the next
// click the two (each click applied together at once, as the page does since R29a). At tick <at> the world is saved and
// loaded into a second Sim; both are stepped to <end>, comparing state hashes every 24 h and where the three land.
// Usage: npx tsx critic/scripts/c44_sl.ts <at> <end> <out.json>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [atS, endS, outF] = process.argv.slice(2);
const AT = Number(atS), END = Number(endS);
const assets = loadAssets1938(size1938().w);
const a = new Sim({ scenario: '1938', seed: 3517, assets });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag('JAP'), FOE = tag('CHI');
a.command({ kind: 'setPlayer', nation: N } as never);
const w = a.world, c = () => w.formations.cols;
if (!w.wars.atWar(N, FOE)) { a.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); a.step(1); }
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - 1818.5, c().y[f]! - 385.5)]); });
cand.sort((x, y) => x[1] - y[1]);
const ids = cand.slice(0, 3).map((x) => x[0]);
const clear = (wd: typeof w): void => { wd.out.events.length = 0; wd.out.fires.length = 0; };
for (const id of ids.slice(0, 2)) a.command({ kind: 'moveFormation', id, x: 1715.5, y: 413.5, nation: N, escort: true } as never);
a.applyNow(clear as never);
let aboard = -1;
while (aboard < 0 && w.tick < 96) { a.step(1, clear as never); if (ids.slice(0, 2).some((id) => { const e = w.embarked.get(id); return e && !c().moving[e.fleet]; })) aboard = w.tick; }
a.step(2, clear as never);
a.command({ kind: 'moveFormation', id: ids[2]!, x: 1703.5, y: 445.5, nation: N, escort: true } as never);
a.applyNow(clear as never);
for (const id of ids.slice(0, 2)) a.command({ kind: 'moveFormation', id, x: 1703.5, y: 445.5, nation: N, escort: true } as never);
a.applyNow(clear as never);
while (w.tick < AT) a.step(1, clear as never);
const bytes = a.save();
const b = new Sim({ scenario: '1938', seed: 3517, assets });
b.load(bytes);
const out: Record<string, unknown> = { ids, aboard, at: AT, hashA0: a.hash(), hashB0: b.hash(), size: bytes.length, rows: [] as string[] };
const landed: Record<string, Record<number, number>> = { a: {}, b: {} };
const watch = (k: 'a' | 'b') => (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) if (e[i + 1] === EventKind.FormationLanded && ids.includes(e[i + 2]!) && !landed[k]![e[i + 2]!]) landed[k]![e[i + 2]!] = e[i]!;
  clear(wd);
};
const where = (s: Sim, id: number): string => { const ww = s.world; const e = ww.embarked.get(id); return `${id}:${e ? 'aboard' + e.fleet : ww.seaFetch.has(id) ? 'bound' + ww.seaFetch.get(id) : 'land'}@${ww.formations.cols.x[id]!.toFixed(1)},${ww.formations.cols.y[id]!.toFixed(1)}`; };
while (a.world.tick < END) {
  a.step(1, watch('a') as never); b.step(1, watch('b') as never);
  if (a.world.tick % 24 === 0) (out.rows as string[]).push(`t${a.world.tick} ${a.hash() === b.hash() ? 'same' : 'DIFF'} A ${ids.map((id) => where(a, id)).join(' ')} | B ${ids.map((id) => where(b, id)).join(' ')}`);
}
Object.assign(out, { landed, hashA: a.hash(), hashB: b.hash() });
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ids, aboard, landed, hashA0: out.hashA0, hashB0: out.hashB0, hashA: out.hashA, hashB: out.hashB, diffs: (out.rows as string[]).filter((r) => r.includes('DIFF')).length }));
