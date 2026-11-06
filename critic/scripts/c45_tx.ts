// Critic run 45 (new): the transport groups of a nation on a 1938 seed (room, where, station, moving), and its divisions' strengths.
// Usage: npx tsx critic/scripts/c45_tx.ts <seed> <TAG>
import { size1938, NATIONS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
import { transportRoom } from '../../src/sim/systems/amphibious';
const [seedS, T] = process.argv.slice(2);
const s = new Sim({ scenario: '1938', seed: Number(seedS), assets: loadAssets1938(size1938().w) });
const N = NATIONS_1938.findIndex((d) => d.tag === T) + 1;
s.step(1);
const w = s.world, c = w.formations.cols;
const fleets: string[] = [];
const divs: number[] = [];
w.formations.forEach((f) => {
  if (c.nation[f] !== N) return;
  if (w.isFleet(f)) { const r = transportRoom(w, f); if (r > 0) fleets.push(`${f}:room${r}@${c.x[f]!.toFixed(1)},${c.y[f]!.toFixed(1)}${c.moving[f] ? 'm' : ''}${w.station.has(f) ? ' st' : ''}`); }
  else if (!w.offLand(f)) divs.push(c.strength[f]!);
});
divs.sort((a, b) => a - b);
console.log(JSON.stringify({ seed: Number(seedS), T, N, transports: fleets.length, fleets, divisions: divs.length, strengthMin: divs[0], strengthMed: divs[divs.length >> 1], strengthMax: divs[divs.length - 1] }, null, 1));
