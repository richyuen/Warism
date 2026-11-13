// Critic run 55 (new): R53l's bar headless. At DAY on each seed (1938, heroes on as the page's '&heroes=on', or off
// with --plain), every war with its two sides' nation counts, and the ones over 4 to 1.
// Usage: npx tsx critic/scripts/c67_piles.ts <day> [--plain] <seed>...
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const args = process.argv.slice(2);
const day = Number(args[0]);
const plain = args.includes('--plain');
const seeds = args.slice(1).filter((a) => a !== '--plain').map(Number);
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
for (const seed of seeds) {
  const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: plain ? {} : { heroes: 'on' } } as never);
  s.step(24 * day, (w) => { w.out.events.length = 0; w.out.fires.length = 0; });
  const wars = s.world.wars.list.map((x) => ({ a: x.sides[0]!.length, d: x.sides[1]!.length, lead: `${tag(x.sides[0]![0]!)} vs ${tag(x.sides[1]![0]!)}` }));
  const over = wars.filter((x) => Math.max(x.a, x.d) > 4 * Math.min(x.a, x.d));
  console.log(`seed ${seed}${plain ? ' plain' : ' heroes'} day ${day}: ${wars.length} wars; over 4:1: ${over.map((x) => `${x.lead} ${x.a}:${x.d}`).join(', ') || 'none'} | all: ${wars.map((x) => `${x.lead} ${x.a}:${x.d}`).join(', ')}`);
}
console.log('done:');
