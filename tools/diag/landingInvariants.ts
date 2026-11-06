/**
 * ROADMAP R33d (ADR-830): the rules of the player's landings (`tests/helpers/landingInvariants.ts`) on one 1938
 * run with random landing orders.
 *
 * Usage: npx tsx tools/diag/landingInvariants.ts <seed> [setup 3517|15101] [days] [orders seed] [probe days, e.g. 30,90] [groups kept]
 */
import { landingBreaks } from '../../tests/helpers/landingInvariants';

const a = process.argv.slice(2);
const seed = Number(a[0] ?? 3517);
const setup = Number(a[1] ?? 3517);
const days = Number(a[2] ?? 120);
const orders = Number(a[3] ?? seed);
const probeDays = (a[4] ?? '30,90').split(',').map(Number);
const groups = a[5] === undefined ? undefined : Number(a[5]);
const t = performance.now();
const lines = landingBreaks({ seed, setup, days, orders, probeDays, ...(groups === undefined ? {} : { groups }) });
for (const l of lines) console.log(l);
console.log(`seed ${seed} setup ${setup} orders ${orders}, ${days} days: ${lines.length} broken, ${Math.round((performance.now() - t) / 1000)} s`);
console.log('done:');
process.exitCode = lines.length > 0 ? 1 : 0;
