// Critic run 90 (new): does R216's peace line (ADR-1145) hold what it says? A random world of N nations, K seeds from S0,
// Y years, stepped a day at a time; each day with no war `peaceWhy` is read (as the worker does, once a day). The line
// says "Even after ten years of peace these would not [start a war]" while `why` is true. For each war declared: the
// last reading before it (why, the reasons) and how many days before. Also a second arm of the same seed with no read:
// the end hashes must be equal (the read is pure).
// Usage: npx tsx critic/scripts/c90_peaceTruth.ts <N> <S0> [K=6] [Y=10]
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { peaceWhy } from '../../src/sim/ai/peaceWhy';
import { loadAssets1938 } from '../../tools/headless/assets';
const [N, S0, K = 6, Y = 10] = process.argv.slice(2).map(Number);
const assets = loadAssets1938(SIZE_1938.w);
const clear = (w: Sim['world']): void => { w.out.events.length = 0; w.out.fires.length = 0; };
for (let s = S0!; s < S0! + K; s++) {
  const a = new Sim({ scenario: 'random', seed: s, assets, options: { nations: N! } });
  const b = new Sim({ scenario: 'random', seed: s, assets, options: { nations: N! } });
  let last: { day: number; why: boolean; rows: string } | null = null;
  let lastWhy: { day: number; rows: string } | null = null;
  let firstWhyDay = -1, whyDays = 0, peaceDays = 0, readDays = 0;
  const reasons = new Map<string, number>();
  const wars: string[] = [];
  let hadWar = false;
  for (let d = 0; d < Y! * 365; d++) {
    const w = a.world;
    if (w.wars.size === 0) {
      peaceDays++;
      const p = peaceWhy(w);
      if (p) {
        readDays++;
        const rows = p.rows.map((r) => `${r.n}:${r.reason}:${r.t}`).join(',');
        if (p.why) {
          whyDays++;
          if (firstWhyDay < 0) firstWhyDay = d;
          lastWhy = { day: d, rows };
          for (const r of p.rows) reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);
        }
        last = { day: d, why: p.why, rows };
      }
      hadWar = false;
    } else if (!hadWar) {
      hadWar = true;
      wars.push(last ? `war day ${d}: last read day ${last.day} (${d - last.day} before) why=${last.why} [${last.rows}]` : `war day ${d}: no read before`);
      if (lastWhy) wars[wars.length - 1] += `; last reason given day ${lastWhy.day} (${d - lastWhy.day} before) [${lastWhy.rows}]`;
      last = null;
      lastWhy = null;
    }
    a.step(24, clear);
    b.step(24, clear);
  }
  const ha = a.hash(), hb = b.hash();
  console.log(`seed ${s} n ${N}: peace days ${peaceDays}, read ${readDays}, why ${whyDays} (first day ${firstWhyDay}), reasons ${JSON.stringify(Object.fromEntries(reasons))}, wars begun ${wars.length}; hash read ${ha} plain ${hb} ${ha === hb ? 'same' : 'DIFFER'}`);
  for (const x of wars.slice(0, 8)) console.log('  ' + x);
}
console.log('done:');
