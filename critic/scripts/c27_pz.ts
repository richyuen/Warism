// Critic run 26 (new), PZ: how often ADR-780's Force war (the user's "war can be declared no matter what": a puppet in
// the way goes free, an ally leaves its alliance) is now refused by PLAN 7.189's Refusal.Beside. The 1938 world, one
// seed, `days` days, AI on. Each day: for each living puppet and its overlord, and each pair of allies (both free), what
// whyNotWar says of the war the puppet (ally) would declare; counted by refusal. Per puppet, the share of days a war on
// its overlord is refused for Beside, and its longest run of such days.
// Usage: npx tsx critic/scripts/c27_pz.ts <seed> <days> <out.json>
import { writeFileSync } from 'node:fs';
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { whyNotWar } from '../../src/sim/systems/war';
import { Refusal } from '../../src/shared/commands';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2] ?? 7019), days = Number(process.argv[3] ?? 365), out = process.argv[4]!;
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const w = s.world;
const nc = w.nations.cols;
const tag = (n: number): string => NATIONS_1938[n - 1]?.tag ?? `#${n}`;
const RN: Record<number, string> = Object.fromEntries(Object.entries(Refusal).map(([k, v]) => [v, k]));
const pup: Record<string, { days: number; beside: number; run: number; longest: number; why: Record<string, number> }> = {};
const ally: Record<string, { days: number; beside: number }> = {};
const tot = { puppetDays: 0, puppetBeside: 0, allyDays: 0, allyBeside: 0 };
for (let d = 1; d <= days; d++) {
  s.step(24, (ww) => { ww.out.events.length = 0; ww.out.fires.length = 0; });
  w.nations.forEach((p) => {
    if (nc.living[p] !== 1) return;
    const o = nc.overlord[p]!;
    if (o === 0 || nc.living[o] !== 1) return;
    const k = `${tag(p)}>${tag(o)}`;
    const r = (pup[k] ??= { days: 0, beside: 0, run: 0, longest: 0, why: {} });
    const why = whyNotWar(w, p, o);
    r.days++; tot.puppetDays++;
    r.why[RN[why] ?? String(why)] = (r.why[RN[why] ?? String(why)] ?? 0) + 1;
    if (why === Refusal.Beside) { r.beside++; tot.puppetBeside++; r.run++; r.longest = Math.max(r.longest, r.run); } else r.run = 0;
  });
  const free: number[] = [];
  w.nations.forEach((n) => { if (nc.living[n] === 1 && nc.overlord[n] === 0) free.push(n); });
  for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
    const a = free[i]!, b = free[j]!;
    if (!w.alliances.allied(a, b)) continue;
    const k = `${tag(a)}&${tag(b)}`;
    const r = (ally[k] ??= { days: 0, beside: 0 });
    r.days++; tot.allyDays++;
    if (whyNotWar(w, a, b) === Refusal.Beside) { r.beside++; tot.allyBeside++; }
  }
}
const top = Object.entries(pup).sort((a, b) => b[1].beside - a[1].beside).slice(0, 15);
writeFileSync(out, JSON.stringify({ seed, days, tot, puppets: pup, topPuppets: top, allies: Object.entries(ally).sort((a, b) => b[1].beside - a[1].beside).slice(0, 15) }, null, 1));
console.log(JSON.stringify({ seed, tot, top: top.slice(0, 8).map(([k, v]) => `${k} ${v.beside}/${v.days} longest ${v.longest}`) }));
console.log('done:');
