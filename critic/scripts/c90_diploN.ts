// Critic run 90 (new): the rules of war and peace (tests/helpers/diploInvariants.ts, with R217's `mass` rule) on a random
// world of N nations, which tools/diag/diploInvariants.ts cannot ask for (it passes no `nations`; R217's case is a
// three-nation world). Usage: npx tsx critic/scripts/c90_diploN.ts <seed> <nations> [days=1826]
import { diploBreaks } from '../../tests/helpers/diploInvariants';
const [seed, nations, days = 1826] = process.argv.slice(2).map(Number);
const t = performance.now();
const lines = diploBreaks({ seed: seed!, diplomacy: 'scenario', days: days!, probeDays: [30, 90, 150], perKind: 4, heroes: false, world: 'random', nations: nations! } as never);
for (const l of lines) console.log(l);
console.log(`seed ${seed} random ${nations} to day ${days}: ${lines.length} broken, ${Math.round((performance.now() - t) / 1000)} s`);
console.log('done:');
