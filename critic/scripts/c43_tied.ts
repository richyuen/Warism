// Critic run 39 (new): what becomes of a landing's own transports when every division of it is sent elsewhere.
// Japan, seed <seed>, the <n> nearest Tokyo to Shanghai (escort); 2 h after the first is aboard a convoy at its port,
// all <n> to (x, y). Every 24 h: each id's state, and for every fleet that was a convoy or bound-for at the order:
// convoyPort, its position, moving, who is aboard. Usage: npx tsx critic/scripts/c43_tied.ts <seed> <n> <x> <y> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, nS, xs, ys, dS, outF] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag('JAP'), FOE = tag('CHI');
s.command({ kind: 'setPlayer', nation: N } as never);
s.step(1);
const w = s.world, c = () => w.formations.cols;
if (!w.wars.atWar(N, FOE)) { s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); s.step(1); }
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - 1818.5, c().y[f]! - 385.5)]); });
cand.sort((a, b) => a[1] - b[1]);
const ids = cand.slice(0, Number(nS)).map((x) => x[0]);
for (const id of ids) s.command({ kind: 'moveFormation', id, x: 1715.5, y: 413.5, nation: N, escort: true } as never);
const clear = (wd: typeof w): void => { wd.out.events.length = 0; wd.out.fires.length = 0; };
const fleets = new Set<number>();
const fl = (f: number): string => {
  if (!w.formations.has(f)) return `${f}:gone`;
  const aboard = [...w.embarked].filter(([, e]) => e.fleet === f).map(([id]) => id);
  const bound = [...w.seaFetch].filter(([, x]) => x === f).map(([id]) => id);
  return `${f}:port${w.convoyPort.get(f) ?? '-'}@${c().x[f]!.toFixed(1)},${c().y[f]!.toFixed(1)}${c().moving[f] ? 'm' : ''} aboard[${aboard}] bound[${bound}]`;
};
const st = (id: number): string => { const e = w.embarked.get(id); return `${id}:${e ? `aboard${e.fleet}` : w.seaFetch.has(id) ? `bound${w.seaFetch.get(id)}` : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}`; };
let aboardAt = -1, ordered = -1;
const trace: string[] = [];
const out: Record<string, unknown> = { seed: +seedS!, ids, target: [+xs!, +ys!] };
for (let h = 0; h < 24 * +dS!; h++) {
  s.step(1, clear as never);
  if (aboardAt < 0 && ids.some((id) => { const e = w.embarked.get(id); return e && !c().moving[e.fleet]; })) aboardAt = w.tick;
  if (ordered < 0 && aboardAt >= 0 && w.tick >= aboardAt + 2) {
    for (const id of ids) { const e = w.embarked.get(id); if (e) fleets.add(e.fleet); const b = w.seaFetch.get(id); if (b !== undefined) fleets.add(b); }
    out.before = { ids: ids.map(st), fleets: [...fleets].map(fl) };
    out.replies = ids.map((id) => s.command({ kind: 'moveFormation', id, x: +xs!, y: +ys!, nation: N, escort: true } as never));
    ordered = w.tick;
    out.after = { ids: ids.map(st), fleets: [...fleets].map(fl) };
    for (const id of ids) { const b = w.seaFetch.get(id) ?? w.embarked.get(id)?.fleet; if (b !== undefined) fleets.add(b); }
  }
  if (ordered >= 0 && (w.tick - ordered) % 24 === 1) trace.push(`t${w.tick} ${ids.map(st).join(' ')} || ${[...fleets].map(fl).join(' || ')}`);
}
out.trace = trace;
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ before: out.before, replies: out.replies, after: out.after, trace: trace.slice(0, 8) }, null, 1));
