// Critic run 44: R33b's migration of an older save. MODE=make (run in a worktree at 813eb375): Japan 3517, the two
// nearest Tokyo sent to Shanghai (escort) at t1 as the page does, and the 3 nearest Britain's London to Calais on 15101;
// saves at the given hours. MODE=load (HEAD): loads each save, steps <days>, logs the divisions' landings, rejections,
// whether they land together and where. Usage: MODE=make npx tsx c45_mig.ts <seed> <TAG> <FOE> <x,y target> <n> <hours,..> <prefix>
//                                             MODE=load npx tsx c45_mig.ts <seed> <TAG> <FOE> <x,y target> <n> <hours,..> <prefix> <days> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seedS, T, F, xyS, nS, hoursS, prefix, dS, outF] = process.argv.slice(2);
const [tx, ty] = xyS!.split(',').map(Number);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag(T!), FOE = tag(F!);
const EV: Record<number, string> = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const w0 = s.world;
const quiet = (wd: typeof w0): void => { wd.out.events.length = 0; wd.out.fires.length = 0; };
const hours = hoursS!.split(',').map(Number);
if (process.env.MODE === 'make') {
  s.command({ kind: 'setPlayer', nation: N } as never);
  const w = s.world, c = () => w.formations.cols;
  if (!w.wars.atWar(N, FOE)) { s.command({ kind: 'forceWar', attacker: N, defender: FOE } as never); s.step(1, quiet as never); }
  const cand: [number, number][] = [];
  w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - Number(process.env.HX ?? 1818.5), c().y[f]! - Number(process.env.HY ?? 385.5))]); });
  cand.sort((a, b) => a[1] - b[1]);
  const ids = cand.slice(0, Number(nS)).map((x) => x[0]).sort((a, b) => a - b);
  for (const id of ids) s.command({ kind: 'moveFormation', id, x: tx, y: ty, nation: N, escort: true } as never);
  s.applyNow(quiet as never);
  const st: string[] = [];
  for (const h of hours) {
    while (w.tick < h) s.step(1, quiet as never);
    writeFileSync(`${prefix}_t${h}.bin`, s.save());
    st.push(`t${w.tick} ${ids.map((id) => `${id}:${w.embarked.has(id) ? 'aboard' + w.embarked.get(id)!.fleet + (c().moving[w.embarked.get(id)!.fleet] ? 'm' : '') : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}`).join(' ')}`);
  }
  writeFileSync(`${prefix}_ids.json`, JSON.stringify({ ids, st }));
  console.log(JSON.stringify({ ids, st }));
} else {
  const meta = JSON.parse(readFileSync(`${prefix}_ids.json`, 'utf8')) as { ids: number[]; st: string[] };
  const ids = meta.ids;
  const res: Record<string, unknown> = { made: meta.st };
  for (const h of hours) {
    const sim = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
    const r: Record<string, unknown> = {};
    try {
      sim.load(new Uint8Array(readFileSync(`${prefix}_t${h}.bin`)));
      const w = sim.world, c = () => w.formations.cols;
      const ev: string[] = []; const landed: Record<number, [number, number, number]> = {};
      const take = (wd: typeof w): void => { const e = wd.out.events; for (let i = 0; i < e.length; i += 6) { const k = e[i + 1]!, a = e[i + 2]!; if (ids.includes(a) && [EventKind.LeftLanding, EventKind.MoveRejected, EventKind.FormationLanded, EventKind.FormationDestroyed].includes(k)) { ev.push(`t${e[i]} ${EV[k]} a${a} b${e[i + 3]} ${(+e[i + 4]!).toFixed(1)},${(+e[i + 5]!).toFixed(1)}`); if (k === EventKind.FormationLanded && !landed[a]) landed[a] = [e[i]!, +(+e[i + 4]!).toFixed(1), +(+e[i + 5]!).toFixed(1)]; } } e.length = 0; wd.out.fires.length = 0; };
      const st = (): string => ids.map((id) => !w.formations.has(id) ? `${id}:dead` : `${id}:${w.embarked.has(id) ? 'aboard' + w.embarked.get(id)!.fleet + (c().moving[w.embarked.get(id)!.fleet] ? 'm' : '') : c().moving[id] ? 'march' : 'still'}@${c().x[id]!.toFixed(1)},${c().y[id]!.toFixed(1)}`).join(' ');
      r.loadedAt = w.tick; r.atLoad = st(); r.landingsAtLoad = w.landings.size; r.legacy = w.legacyConvoys !== null;
      const tr: string[] = [];
      sim.step(1, take as never);
      r.landingsAfter1 = [...w.landings.values()].map((l) => ({ id: l.id, state: l.state, port: w.ports[l.port]?.name, fleets: l.fleets, divisions: [...l.divisions.keys()] }));
      // re-save and reload: bit-identical?
      const a = sim.save(); const s2 = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) }); s2.load(a); r.resaveIdentical = Buffer.compare(Buffer.from(a), Buffer.from(s2.save())) === 0;
      for (let k = 0; k < 24 * Number(dS); k++) { sim.step(1, take as never); if (k % 24 === 0) tr.push(`t${w.tick} ${st()}`); if (ids.every((id) => landed[id] || !w.formations.has(id))) break; }
      Object.assign(r, { landed, end: st(), events: ev, trace: tr, endTick: w.tick });
    } catch (e) { r.error = String((e as Error).stack ?? e).slice(0, 600); }
    res[`t${h}`] = r;
  }
  writeFileSync(outF!, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, k === 'made' ? v : { landed: (v as Record<string, unknown>).landed, error: (v as Record<string, unknown>).error, legacy: (v as Record<string, unknown>).legacy, after1: (v as Record<string, unknown>).landingsAfter1, resave: (v as Record<string, unknown>).resaveIdentical }]))));
}
