// Critic run 34 (copy of run 33): why Britain's divisions at Portsmouth are refused NoPort at war with France (c39_pm_eng_*). Same
// orders as c39_pm.ts (3517, ENG on FRA, three divisions nearest London to Calais); at each MoveRejected of theirs, the
// ports within 4 cells of the division: name, holder, damage, shut.
// Usage: npx tsx critic/scripts/c39_ps.ts
import { EventKind } from '../../src/shared/events';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { portShut } from '../../src/sim/systems/bombing';
import { loadAssets1938 } from '../../tools/headless/assets';
const s = new Sim({ scenario: '1938', seed: 3517, assets: loadAssets1938(size1938().w) });
const tag = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const N = tag('ENG'), F = tag('FRA');
s.command({ kind: 'setPlayer', nation: N } as never); s.step(1);
s.command({ kind: 'forceWar', attacker: N, defender: F } as never); s.step(1);
const w = s.world, c = () => w.formations.cols;
const cand: [number, number][] = [];
w.formations.forEach((f) => { if (c().nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; cand.push([f, Math.hypot(c().x[f]! - 1023.5, c().y[f]! - 275.5)]); });
cand.sort((a, b) => a[1] - b[1]);
const ids = cand.slice(0, 3).map((x) => x[0]);
for (const id of ids) s.command({ kind: 'moveFormation', id, x: 1034.5, y: 279.5, nation: N, escort: true } as never);
const notes: string[] = [];
for (let h = 0; h < 100; h++) {
  s.step(1, ((wd: typeof w) => {
    const e = wd.out.events;
    for (let i = 0; i < e.length; i += 6) if (ids.includes(e[i + 2]!) && e[i + 1] === EventKind.MoveRejected) {
      const id = e[i + 2]!; const x = c().x[id]!, y = c().y[id]!;
      const near = wd.ports.map((p, k) => { const px = p.cell % wd.cells.w, py = Math.floor(p.cell / wd.cells.w); return { k, name: (p as { name?: string }).name, d: Math.hypot(px - x, py - y), holder: wd.cells.controller[p.cell], dmg: wd.portDamage.get(k) ?? 0, shut: portShut(wd, k) }; }).filter((p) => p.d < 4);
      notes.push(`t${wd.tick} reject ${id} reason ${e[i + 4]} at (${x.toFixed(1)},${y.toFixed(1)}) ports ${JSON.stringify(near)}`);
    }
    e.length = 0; wd.out.fires.length = 0;
  }) as never);
}
console.log(notes.join('\n'));
