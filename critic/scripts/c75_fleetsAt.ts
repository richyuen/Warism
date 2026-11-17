// Critic run 75 (new): the fleets about a place before and after one hour (a sea battle begun and over in that hour
// that `seaBattlesLook` reports "NOT SEEN": was the side not seen sunk whole, or there and not drawn?).
// Plain 1938 SEED stepped to TICK - 1: every fleet within R cells of X,Y (id, nation, place, distance); then one hour
// more: the same list, and which fleets of the first list are gone.
// Usage: npx tsx critic/scripts/c75_fleetsAt.ts <seed> <tick> <x,y> [R=16]
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2]), tick = Number(process.argv[3]);
const [X, Y] = (process.argv[4] ?? '0,0').split(',').map(Number) as [number, number];
const R = Number(process.argv[5] ?? 16);
const tag = (n: number): string => (TAGS_1938 as readonly string[])[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w) });
const w = sim.world;
const clear = (x: World): void => { x.out.events.length = 0; x.out.fires.length = 0; };
const list = (): Map<number, string> => {
  const c = w.formations.cols;
  const m = new Map<number, string>();
  for (const id of w.formations.ids()) {
    if (!w.isFleet(id)) continue;
    const d = Math.hypot(c.x[id]! - X, c.y[id]! - Y);
    if (d <= R) m.set(id, `${id} ${tag(c.nation[id]!)} at ${c.x[id]!.toFixed(1)},${c.y[id]!.toFixed(1)} (${d.toFixed(1)} cells away)`);
  }
  return m;
};
sim.step(tick - 1 - sim.tick, clear);
const before = list();
process.stdout.write(`seed ${seed} tick ${sim.tick}: fleets within ${R} cells of ${X},${Y}:\n${[...before.values()].map((s) => `  ${s}`).join('\n')}\n`);
sim.step(1, clear);
const after = list();
process.stdout.write(`tick ${sim.tick}:\n${[...after.values()].map((s) => `  ${s}`).join('\n')}\n`);
process.stdout.write(`gone in the hour: ${[...before.entries()].filter(([id]) => !w.formations.has(id)).map(([, s]) => s).join('; ') || 'none'}\ndone:\n`);
