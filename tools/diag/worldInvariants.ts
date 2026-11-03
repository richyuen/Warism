/**
 * ROADMAP R4: the rules of the other systems (`tests/helpers/worldInvariants.ts`) on one run.
 *
 * Usage: npx tsx tools/diag/worldInvariants.ts <seed> [days] [--world random] [--diplomacy random] [--heroes] [--rules economy,...] [--bankrupt POL:-800,ROM:-300]
 */
import { RULE_SETS, worldBreaks, type RuleSet } from '../../tests/helpers/worldInvariants';

const args: string[] = [];
let heroes = false;
let world: '1938' | 'random' = '1938';
let diplomacy: 'scenario' | 'random' | undefined;
let rules: RuleSet[] = [...RULE_SETS];
let bankrupt: [string, number][] = [];
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--heroes') heroes = true;
  else if (argv[i] === '--world') world = argv[++i] as '1938' | 'random';
  else if (argv[i] === '--diplomacy') diplomacy = argv[++i] as 'scenario' | 'random';
  else if (argv[i] === '--rules') rules = argv[++i]!.split(',') as RuleSet[];
  else if (argv[i] === '--bankrupt') bankrupt = argv[++i]!.split(',').map((x) => [x.split(':')[0]!, Number(x.split(':')[1])] as [string, number]);
  else args.push(argv[i]!);
}
const seed = Number(args[0] ?? 7019);
const days = Number(args[1] ?? 180);
const t = performance.now();
const lines = worldBreaks({ seed, days, world, heroes, rules, bankrupt, ...(diplomacy ? { diplomacy } : {}) });
for (const l of lines) console.log(l);
console.log(`seed ${seed} ${world} ${rules.join(',')} to day ${days}: ${lines.length} broken, ${Math.round((performance.now() - t) / 1000)} s`);
console.log('done:');
// Red for CI: a broken rule fails the run.
process.exitCode = lines.length > 0 ? 1 : 0;
