/**
 * ADR-803: the rules of war and peace (`tests/helpers/diploInvariants.ts`) on one 1938 run.
 *
 * Usage: npx tsx tools/diag/diploInvariants.ts <seed> [scenario|random] [days] [probe days, e.g. 30,90,150] [per kind]
 */
import { diploBreaks } from '../../tests/helpers/diploInvariants';

const seed = Number(process.argv[2] ?? 7019);
const diplomacy = (process.argv[3] ?? 'scenario') as 'scenario' | 'random';
const days = Number(process.argv[4] ?? 180);
const probeDays = (process.argv[5] ?? '30,90,150').split(',').map(Number);
const perKind = Number(process.argv[6] ?? 4);
const t = performance.now();
const lines = diploBreaks({ seed, diplomacy, days, probeDays, perKind });
for (const l of lines) console.log(l);
console.log(`seed ${seed} ${diplomacy} to day ${days}: ${lines.length} broken, ${Math.round((performance.now() - t) / 1000)} s`);
console.log('done:');
