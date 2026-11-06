// Critic run 47: does landingInvariants' run (seed, setup) still reach a sinking at sea on HEAD (run 46's R46-B1 case,
// 19113/15101 t1463)? Hourly: the player's divisions aboard, and those gone in the hour whose group is gone too.
// Usage: npx tsx critic/scripts/c47_li_sunk.ts <seed> <setup> [days] [orders]
import { landingBreaks } from '../../tests/helpers/landingInvariants';

const [seed, setup, days, orders] = process.argv.slice(2).map(Number);
let prev = new Map<number, number>();
const lines: string[] = [];
const broken = landingBreaks({
  seed: seed!, setup: setup!, days: days || 120, orders: orders || seed!, probeDays: [30, 90],
  hour: (w) => {
    const now = new Map<number, number>();
    const n = w.settings.player;
    for (const [id, e] of w.embarked) if (w.formations.cols.nation[id] === n) now.set(id, e.fleet);
    for (const [id, fleet] of prev) if (!w.formations.has(id) && !w.formations.has(fleet)) lines.push(`t${w.tick} ${id} gone with its group ${fleet}`);
    prev = now;
  },
});
for (const l of lines) console.log(l);
for (const b of broken) console.log('BROKEN', b);
console.log(`seed ${seed} setup ${setup}: ${lines.length} lost at sea, ${broken.length} broken`);
console.log('done:');
