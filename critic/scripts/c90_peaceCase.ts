// Critic run 90 (new): one random world's peace line around a war's start: from day D0 to D1, each day the peace line's
// reading (peaceWhy), the truces with their days left, and the wars (attackers and defenders by id).
// Usage: npx tsx critic/scripts/c90_peaceCase.ts <seed> <nations> <d0> <d1>
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { peaceWhy } from '../../src/sim/ai/peaceWhy';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seed, N, d0, d1] = process.argv.slice(2).map(Number);
const s = new Sim({ scenario: 'random', seed: seed!, assets: loadAssets1938(SIZE_1938.w), options: { nations: N! } });
const clear = (w: Sim['world']): void => { w.out.events.length = 0; w.out.fires.length = 0; };
for (let d = 0; d <= d1!; d++) {
  if (d >= d0!) {
    const w = s.world, p = peaceWhy(w);
    const tr = w.wars.truces.filter((t) => t.untilTick > w.tick).map((t) => `${t.a}-${t.b}:${Math.ceil((t.untilTick - w.tick) / 24)}d`).join(' ');
    const wars = (w.wars.list as unknown as { attackers?: number[]; defenders?: number[]; a?: number[]; d?: number[] }[]).map((x) => JSON.stringify(x).slice(0, 120)).join(' | ');
    console.log(d, p ? `why=${p.why} [${p.rows.map((r) => `${r.n}:${r.reason}:${r.t}`).join(',')}]` : 'null', `truces ${tr || '-'}`, `wars ${w.wars.size} ${wars}`);
  }
  s.step(24, clear);
}
