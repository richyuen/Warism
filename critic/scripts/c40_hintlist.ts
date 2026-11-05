// Critic run 40 (new): Japan's land divisions by id, where each stands and seaHint alone to (x, y). Usage: npx tsx critic/scripts/c40_hintlist.ts <seed> <x> <y>
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { seaHint } from '../../src/sim/systems/amphibious';
const [seedS, xs, ys] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const N = NATIONS_1938.findIndex((d) => d.tag === 'JAP') + 1;
s.command({ kind: 'setPlayer', nation: N } as never); s.step(1);
const w = s.world, c = w.formations.cols;
const r: string[] = [];
w.formations.forEach((f) => { if (c.nation[f] !== N || w.isFleet(f) || w.offLand(f)) return; r.push(`${f}@${c.x[f]!.toFixed(0)},${c.y[f]!.toFixed(0)}:how${seaHint(w, [f], Number(xs), Number(ys)).how}`); });
console.log(r.join(' '));
