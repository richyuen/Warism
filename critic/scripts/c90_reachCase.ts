// Critic run 90 (new): R90-B1's 90441 (two nations): what changes on the day the peace line's "no rival within its
// reach" turns "for now". Each day D0..D1: per nation, sea power or not, transport groups at port, the targets
// seaTargetKm gives (with the reach peaceWhy uses) and the massing. Usage: npx tsx critic/scripts/c90_reachCase.ts <seed> <N> <d0> <d1>
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { seaPowers, seaTargetKm, strengths, SEA_REACH_KM } from '../../src/sim/ai/strategic';
import { transportGroupsAtPort } from '../../src/sim/systems/amphibious';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seed, N, d0, d1] = process.argv.slice(2).map(Number);
const s = new Sim({ scenario: 'random', seed: seed!, assets: loadAssets1938(SIZE_1938.w), options: { nations: N! } });
const clear = (w: Sim['world']): void => { w.out.events.length = 0; w.out.fires.length = 0; };
for (let d = 0; d <= d1!; d++) {
  if (d >= d0!) {
    const w = s.world, powers = seaPowers(w, strengths(w));
    const parts: string[] = [];
    w.nations.forEach((n) => { if (w.nations.cols.living[n] !== 1) return; const reach = seaTargetKm(w, n, powers.has(n) ? Infinity : SEA_REACH_KM); parts.push(`${n}: power ${powers.has(n) ? 1 : 0} tg ${transportGroupsAtPort(w, n).length} reach [${[...reach].map(([t, k]) => `${t}@${Math.round(k)}`).join(' ')}] mass ${w.massing.has(n) ? 1 : 0}`); });
    console.log(d, parts.join(' | '));
  }
  s.step(24, clear);
}
