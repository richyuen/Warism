// Critic run 67 (new): R76c's sea reach in effect. Plain 1938 on a seed for `years`: each landing (FormationLanded) with
// its nation and the sea km from the port it embarked at; per nation and year, landings and those over SEA_REACH_KM;
// and whether the nation was among `seaPowers` at the year's start. Usage: npx tsx critic/scripts/c67_farlands.ts <seed> [years=3]
import { EventKind } from '../../src/shared/events';
import { seaPowers, SEA_REACH_KM, strengths } from '../../src/sim/ai/strategic';
import { seaKm } from '../../src/sim/systems/navalCombat';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const seed = Number(process.argv[2] ?? 7019);
const years = Number(process.argv[3] ?? 3);
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const w = sim.world;
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? String(n);
const from = new Map<number, [number, number]>();
for (let y = 1; y <= years; y++) {
  const sp = [...seaPowers(w, strengths(w))].map(tag);
  const per = new Map<string, { n: number; far: number; max: number }>();
  for (let d = 0; d < 365; d++) {
    sim.step(24, (x: World) => {
      const ev = x.out.events;
      for (let i = 0; i < ev.length; i += 6) {
        const k = ev[i + 1]!, a = ev[i + 2]!, b = ev[i + 3]!, ex = ev[i + 4]!, ey = ev[i + 5]!;
        if (k === EventKind.FormationEmbarked) from.set(a, [ex, ey]);
        else if (k === EventKind.FormationLanded) {
          const p = from.get(a);
          const km = p ? seaKm(x, p[0], p[1], ex, ey) : NaN;
          const t = tag(b);
          const r = per.get(t) ?? { n: 0, far: 0, max: 0 };
          r.n++;
          if (km > SEA_REACH_KM) r.far++;
          if (km > r.max) r.max = km;
          per.set(t, r);
        }
      }
      x.out.events.length = 0;
      x.out.fires.length = 0;
    });
  }
  const rows = [...per].sort((a, b) => b[1].n - a[1].n).map(([t, r]) => `${t}${sp.includes(t) ? '*' : ''} ${r.n}/${r.far} max ${Math.round(r.max)}`);
  console.log(`seed ${seed} year ${y} | seaPowers ${sp.join(' ')} | landings/over ${SEA_REACH_KM} km (* a sea power): ${rows.join(', ')}`);
}
console.log('done:');
