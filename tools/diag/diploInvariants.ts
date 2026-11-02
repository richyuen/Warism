/**
 * ADR-803: the rules of war and peace (`tests/helpers/diploInvariants.ts`) on one 1938 run.
 *
 * Usage: npx tsx tools/diag/diploInvariants.ts <seed> [scenario|random] [days] [probe days, e.g. 30,90,150] [per kind] [--heroes] [--world random]
 */
import { diploBreaks } from '../../tests/helpers/diploInvariants';

const args: string[] = [];
let heroes = false;
let world: '1938' | 'random' = '1938';
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--heroes') heroes = true;
  else if (argv[i] === '--world') world = argv[++i] as '1938' | 'random';
  else args.push(argv[i]!);
}
const seed = Number(args[0] ?? 7019);
const diplomacy = (args[1] ?? 'scenario') as 'scenario' | 'random';
const days = Number(args[2] ?? 180);
const probeDays = (args[3] ?? '30,90,150').split(',').map(Number);
const perKind = Number(args[4] ?? 4);
const t = performance.now();
const lines = diploBreaks({ seed, diplomacy, days, probeDays, perKind, heroes, world });
for (const l of lines) console.log(l);
console.log(`seed ${seed} ${diplomacy} to day ${days}: ${lines.length} broken, ${Math.round((performance.now() - t) / 1000)} s`);
console.log('done:');
