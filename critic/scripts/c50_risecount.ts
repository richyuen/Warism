// Critic run 50 (new): R40a's new branch, how often. A 1938 world (diplomacy random or scenario) for <days> days; at
// each hour, every PuppetRevolt and PuppetReleased with the subject's loyalty and autonomy the hour before: a release
// at loyalty < REVOLT_LOYALTY with a voice is R40a's "freed" (a rising refused); one above FREE_ABOVE autonomy is the
// peaceful release. For each "freed", why the war was refused (whyNotWar after the hour, from the overlord's land).
// Usage: npx tsx critic/scripts/c50_risecount.ts <seed> <random|scenario> <days>
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { FREE_ABOVE, PROTEST_FROM, REVOLT_LOYALTY } from '../../src/sim/systems/puppets';
import { whyNotWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 20681);
const diplo = process.argv[3] ?? 'random';
const days = Number(process.argv[4] ?? 3650);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: diplo === 'random' ? { diplomacy: 'random' } : {} } as never);
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const rows: string[] = [];
let ev: number[] = [];
const take = (w: World): void => {
  const e = w.out.events;
  for (let i = 0; i < e.length; i += 6) if (e[i + 1] === EventKind.PuppetRevolt || e[i + 1] === EventKind.PuppetReleased) ev.push(e[i + 1]!, e[i + 2]!, e[i + 3]!);
  e.length = 0;
  w.out.fires.length = 0;
};
const count = { revolt: 0, revoltWar: 0, freedRefused: 0, peaceful: 0, otherRelease: 0 };
for (let h = 0; h < days * 24; h++) {
  const w = s.world;
  const nc = w.nations.cols;
  const loy = Float64Array.from(nc.loyalty as ArrayLike<number>);
  const aut = Float64Array.from(nc.autonomy as ArrayLike<number>);
  ev = [];
  s.step(1, take);
  for (let i = 0; i < ev.length; i += 3) {
    const [k, p, o] = [ev[i]!, ev[i + 1]!, ev[i + 2]!];
    const d = `day ${Math.floor(w.tick / 24)} ${tag(p)} from ${tag(o)} loyalty ${loy[p]!.toFixed(1)} autonomy ${aut[p]!.toFixed(0)}`;
    if (k === EventKind.PuppetRevolt) {
      count.revolt++;
      const war = w.wars.atWar(p, o);
      if (war) count.revoltWar++;
      rows.push(`revolt ${d} war ${war}`);
    } else if (loy[p]! < REVOLT_LOYALTY && aut[p]! >= PROTEST_FROM) {
      count.freedRefused++;
      rows.push(`FREED (rising refused) ${d} why now ${whyNotWar(w, p, o)} living ${w.nations.cols.living[o]}`);
    } else if (aut[p]! > FREE_ABOVE - 1) {
      count.peaceful++;
      rows.push(`peaceful release ${d}`);
    } else {
      count.otherRelease++;
      rows.push(`other release ${d}`);
    }
  }
}
for (const r of rows) console.log(r);
console.log(JSON.stringify({ seed, diplo, days, ...count }));
console.log('done:');
