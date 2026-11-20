// Critic run 91 (new): R222's `PeaceHeld` rows (ADR-1149) in History, headless. A random world of N nations, K seeds from
// S0, Y years, stepped a day at a time. At the end the history log is read: each PeaceHeld row (day, reason code, realms
// sharing it), the wars declared (day), and for each PeaceHeld row the days to the next war declared. Counts: rows a
// seed, rows told while a war stood (should be 0), a row whose reason flips back to one told before since the last war
// (A, B, A: the log said "at peace: A" twice with no war between), rows within 30 days before a war.
// Usage: npx tsx critic/scripts/c91_peaceHist.ts <N> <S0> [K=6] [Y=10]
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { EventKind } from '../../src/shared/events';
import { PEACE_ORDER } from '../../src/shared/protocol';
import { HISTORY_STRIDE } from '../../src/sim/history';
import { loadAssets1938 } from '../../tools/headless/assets';
const [N, S0, K = 6, Y = 10] = process.argv.slice(2).map(Number);
const assets = loadAssets1938(SIZE_1938.w);
const clear = (w: Sim['world']): void => { w.out.events.length = 0; w.out.fires.length = 0; };
let tot = 0, inWar = 0, flipBack = 0, near30 = 0;
for (let s = S0!; s < S0! + K; s++) {
  const sim = new Sim({ scenario: 'random', seed: s, assets, options: { nations: N! } });
  const warDays = new Set<number>();
  for (let d = 0; d < Y! * 365; d++) {
    if (sim.world.wars.size > 0) warDays.add(d);
    sim.step(24, clear);
  }
  const rows = sim.world.history.rows;
  const peace: { day: number; code: number; n: number }[] = [];
  const wars: number[] = [];
  const told: number[] = [];
  let flips = 0;
  for (let i = 0; i < rows.length; i += HISTORY_STRIDE) {
    const day = Math.floor(rows[i]! / 24), kind = rows[i + 1];
    if (kind === EventKind.WarDeclared) { wars.push(day); told.length = 0; }
    if (kind === EventKind.PeaceHeld) {
      const code = rows[i + 2]!;
      if (told.includes(code) && told[told.length - 1] !== code) flips++;
      told.push(code);
      peace.push({ day, code, n: rows[i + 3]! });
    }
  }
  const lines = peace.map((p) => {
    const next = wars.find((w) => w >= p.day);
    const war = warDays.has(p.day) && warDays.has(p.day - 1);
    if (war) inWar++;
    if (next !== undefined && next - p.day <= 30) near30++;
    return `day ${p.day} ${PEACE_ORDER[p.code]} x${p.n}${next !== undefined ? ` next war in ${next - p.day} d` : ''}${war ? ' DURING A WAR' : ''}`;
  });
  tot += peace.length; flipBack += flips;
  console.log(`seed ${s} n ${N}: PeaceHeld rows ${peace.length}, wars declared ${wars.length} (first ${wars[0] ?? '-'}), flips back ${flips}, war days ${warDays.size}`);
  for (const l of lines.slice(0, 12)) console.log('  ' + l);
}
console.log(`total rows ${tot}, during a war ${inWar}, flips back ${flipBack}, within 30 days before a war ${near30}`);
console.log('done:');
