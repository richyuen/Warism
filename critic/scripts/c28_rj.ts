// Critic run 27 (new), RJ: why a bonded Force war from OR was refused. Day <day>: whyNotWar, bond, beside, the overrun
// state of both, and what forceWar returns (the refusal the God tab and the menu would report).
// Usage: npx tsx critic/scripts/c28_rj.ts <seed> <day> <A> <B>[,<A> <B>...]
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { whyNotWar, bond, beside, forceWar, overrun } from '../../src/sim/systems/war';
import { Refusal } from '../../src/shared/commands';
import { loadAssets1938 } from '../../tools/headless/assets';

const seed = Number(process.argv[2]), day = Number(process.argv[3]);
const pairs = process.argv.slice(4).join(' ').split(',').map((p) => p.trim().split(/\s+/));
const s = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938().w) });
const id = (t: string): number => NATIONS_1938.findIndex((d) => d.tag === t) + 1;
const RN: Record<number, string> = Object.fromEntries(Object.entries(Refusal).map(([k, v]) => [v, k]));
s.step(day * 24, (ww) => { ww.out.events.length = 0; ww.out.fires.length = 0; });
const snap = s.save();
for (const [ta, tb] of pairs) {
  s.load(snap);
  const w = s.world;
  const a = id(ta!), b = id(tb!);
  const land = w.landCounts();
  const o = w.nations.cols.overlord[b]!;
  const info = { pair: `${ta}>${tb}`, whyNotWar: RN[whyNotWar(w, a, b)], bond: RN[bond(w, a, b)], beside: beside(w, a, b), overlordOfB: o, overrunA: overrun(land, a), overrunB: overrun(land, o || b), owned: [land.owned[a], land.owned[o || b]], lost: [land.lost[a], land.lost[o || b]], forceWar: RN[forceWar(w, a, b)] };
  console.log(JSON.stringify(info));
}
s.load(snap);
console.log('done:');
