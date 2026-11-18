// Critic run 76: counts over a tools/diag/warOpening.ts JSON (run 75's measures): the wars that ran 30 days, those with
// no cell held by either side at day 30; of the wars with a border that ran 30 days, the attacker with no man near
// (nearFront[0] 0) and the defender ahead in land at day 30.
// Usage: node critic/scripts/c77_woCount.mjs <warOpening.json> [...]
import { readFileSync } from 'node:fs';
for (const f of process.argv.slice(2)) {
  const j = JSON.parse(readFileSync(f, 'utf8'));
  const wars = Array.isArray(j) ? j : j.wars;
  let ran = 0, none = 0, bran = 0, noMan = 0, defAhead = 0;
  for (const w of wars) {
    const d30 = w.days?.find((d) => d.day === 30);
    if (!d30) continue;
    ran++;
    if (d30.attHolds === 0 && d30.defHolds === 0) none++;
    if (w.border) {
      bran++;
      if ((w.nearFront?.[0] ?? 0) === 0) noMan++;
      if (d30.defHolds > d30.attHolds) defAhead++;
    }
  }
  console.log(`${f}: wars ${wars.length}, ran 30 days ${ran}, no cell held at day 30 ${none} (${((100 * none) / ran).toFixed(1)} %); with a border ${bran}: attacker no man near ${noMan} (${((100 * noMan) / bran).toFixed(1)} %), defender ahead ${defAhead} (${((100 * defAhead) / bran).toFixed(1)} %)`);
}
