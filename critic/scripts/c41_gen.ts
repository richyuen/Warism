// Critic run 41 (new seeds and a new coast): R29b off Japan. Nation <tag> at war with <foe>; the <n> divisions nearest
// <home> (lon,lat) sent by one click (applied together at once, as the page does) to <t1>; two hours after the first is
// aboard a convoy standing at its port, the fresh division nearest <freshAt> sent to <t2> by one click, then the n by the
// next click in the same hour. Traces each division and its transport group (aboard / bound, the group's place and
// convoy port), every MoveRejected/LeftLanding/FormationLanded/FormationDestroyed of theirs, and the groups' losses.
// Usage: npx tsx critic/scripts/c41_gen.ts <seed> <tag> <foe> <homeLon,Lat> <t1Lon,Lat> <t2Lon,Lat> <freshLon,Lat> <n> <days> <out>
import { writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { cellOf } from '../../src/sim/data/terrain';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, F, homeS, t1S, t2S, freshS, nS, dS, outF] = process.argv.slice(2);
const SZ = size1938();
const ll = (s: string): [number, number] => { const [lo, la] = s.split(',').map(Number); const [x, y] = cellOf(lo!, la!, SZ.w, SZ.h); return [Math.floor(x) + 0.5, Math.floor(y) + 0.5]; };
const home = ll(homeS!), t1 = ll(t1S!), t2 = ll(t2S!), freshAt = ll(freshS!);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(SZ.w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(T!), FOE = tag(F!);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
s.command({ kind: 'setPlayer', nation: N } as never);
if (process.env.PAGESEQ) s.applyNow((wd: any) => { wd.out.events.length = 0; wd.out.fires.length = 0; }); // PAGESEQ=1: each setup command applied at once, as the page's buttons do
const w = s.world, c = () => w.formations.cols;
if (!w.wars.atWar(N, FOE)) { s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); if (process.env.PAGESEQ) s.applyNow((wd: any) => { wd.out.events.length = 0; wd.out.fires.length = 0; }); s.step(1); }
const land: number[] = [];
w.formations.forEach((f) => { if (c().nation[f] === N && !w.isFleet(f) && !w.offLand(f)) land.push(f); });
const near = (p: [number, number], skip: number[]): number[] => land.filter((f) => !skip.includes(f)).sort((a, b) => Math.hypot(c().x[a]! - p[0], c().y[a]! - p[1]) - Math.hypot(c().x[b]! - p[0], c().y[b]! - p[1]));
const ids = process.env.PICK ? process.env.PICK.split(',').map(Number) : near(home, []).slice(0, Number(nS)); // PICK: the divisions by id
const fresh = near(freshAt, ids)[0]!;
const all = [...ids, fresh];
const ev: string[] = [];
const groups = new Set<number>();
const take = (wd: typeof w): void => {
  const e = wd.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const k = e[i + 1]!, a = e[i + 2]!;
    if ((all.includes(a) && [EventKind.LeftLanding, EventKind.MoveRejected, EventKind.FormationLanded, EventKind.FormationDestroyed].includes(k)) || (groups.has(a) && k === EventKind.FormationDestroyed)) ev.push(`t${e[i]} ${EV[k]} a${a} b${e[i + 3]} x${(+e[i + 4]!).toFixed(1)} y${(+e[i + 5]!).toFixed(1)}`);
  }
  e.length = 0; wd.out.fires.length = 0;
};
const click = (who: number[], p: [number, number]): boolean[] => { const r = who.map((id) => { const ok = s.command({ kind: 'moveFormation', id, x: p[0], y: p[1], nation: N, escort: true } as never); if (process.env.PER) s.applyNow(take as never); return ok; }); s.applyNow(take as never); return r; }; // PER=1: each order applied at once (the page before R29a)
const st = (id: number): string => {
  if (!w.formations.has(id)) return `${id}:dead`;
  const e = w.embarked.get(id); const g = e?.fleet ?? w.seaFetch.get(id);
  if (g !== undefined) groups.add(g);
  const gp = g !== undefined && w.formations.has(g) ? `[g${g}@${c().x[g]!.toFixed(1)},${c().y[g]!.toFixed(1)}${c().moving[g] ? 'm' : ''}${w.convoyPort.has(g) ? ' cp' + w.convoyPort.get(g) : ''} s${c().strength[g]!.toFixed(0)}]` : g !== undefined ? `[g${g} gone]` : '';
  return `${id}:${e ? 'aboard' + e.fleet : w.seaFetch.has(id) ? 'bound' + w.seaFetch.get(id) : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}${gp}`;
};
const out: Record<string, unknown> = { seed: Number(seedS), T, F, home, t1, t2, freshAt, ids, fresh };
out.first = click(ids, t1);
let aboard = -1, done = false;
const trace: string[] = []; const landed: Record<number, [number, number, number]> = {};
for (let h = 0; h < 24 * Number(dS); h++) {
  if (!done && aboard >= 0 && w.tick >= aboard + 2) {
    done = true;
    ev.push(`t${w.tick} before ${all.map(st).join(' | ')}`);
    out.freshOrder = click([fresh], t2);
    out.leaveOrder = process.env.ASC ? click([...ids].sort((a, b) => a - b), t2) : click(ids, t2); // ASC=1: the click's orders by ascending id, as player.ts sends them
    ev.push(`t${w.tick} after ${all.map(st).join(' | ')}`);
  }
  s.step(1, take as never);
  if (aboard < 0 && ids.some((id) => { const e = w.embarked.get(id); return e && !c().moving[e.fleet]; })) aboard = w.tick;
  for (const id of all) if (!landed[id] && ev.some((x) => x.includes(`FormationLanded a${id} `))) landed[id] = [w.tick, +c().x[id]!.toFixed(1), +c().y[id]!.toFixed(1)];
  if (h % 24 === 0 || h < 8 || (process.env.HOURLY && h < 90)) trace.push(`t${w.tick} ${all.map(st).join(' ')}`);
  if (done && all.every((id) => landed[id] || !w.formations.has(id))) break;
}
Object.assign(out, { aboard, landed, end: all.map(st), events: ev, trace });
writeFileSync(outF!, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ids, fresh, aboard, landed, end: out.end, events: ev.filter((e) => !e.includes(' before ') && !e.includes(' after ')) }));
