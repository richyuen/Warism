/**
 * PLAN 7.184a3: a hero against standard forces (`tests/helpers/heroFight.ts`): the Bismarck
 * against 1 and 3 British battle squadrons, the Maus against 1 and 3 French armoured divisions.
 * Prints a line a day of each. `npx tsx tools/diag/heroProbe.ts [--days 6]`.
 */
import { landFight, seaFight } from '../../tests/helpers/heroFight';

const i = process.argv.indexOf('--days');
const days = i >= 0 ? Number(process.argv[i + 1]) : 6;
for (const n of [1, 3]) process.stdout.write(`sea ×${n}\n  ${seaFight(n, days).days.join('\n  ')}\n`);
for (const n of [1, 3]) process.stdout.write(`land ×${n}\n  ${landFight(n, days).days.join('\n  ')}\n`);
