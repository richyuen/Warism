// Critic run 74: after c75_massSave: what a load keeps of `World.massTold` and `World.massing` (seed, day of the save).
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
const assets = assets1938(SIZE_1938.w);
const seed = Number(process.argv[2] ?? 57621);
const a = new Sim({ scenario: '1938', seed, assets });
const clear = (x: World): void => { x.out.events.length = 0; x.out.fires.length = 0; };
let d = 0;
while (a.world.massTold.size === 0 && d < 400) { a.step(24, clear); d++; }
const bytes = a.save();
const b = new Sim({ scenario: '1938', seed, assets });
b.load(bytes);
process.stdout.write(`day ${d}: A massing ${JSON.stringify([...a.world.massing])} told ${JSON.stringify([...a.world.massTold])}\n B massing ${JSON.stringify([...b.world.massing])} told ${JSON.stringify([...b.world.massTold])}; hashes ${a.hash()} ${b.hash()}\n`);
const b2 = new Sim({ scenario: '1938', seed, assets });
b2.load(b.save());
process.stdout.write(` B saved again and loaded: told ${JSON.stringify([...b2.world.massTold])}; bytes ${bytes.length} then ${b.save().length}\n`);
