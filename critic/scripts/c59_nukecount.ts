// Critic run 59 (new): nuclear strikes and landings over years on a 1938 seed, for an A/B of R57f's guard rule (ADR-913). Counts per
// year: embarkations (43), landings (44), repulsed (45), sea battles (41), transports sunk (76), lost at sea (75).
// Runs from critic/scripts (HEAD) or a copy in critic/old (ROOT './'). Usage: npx tsx c59_landcount.ts <seed> <years>
import { loadAssets1938 } from '../../tools/headless/assets';
import { size1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
const seed = Number(process.argv[2]);
const years = Number(process.argv[3] ?? 5);
const sim = new Sim({ scenario: '1938', seed, assets: loadAssets1938(size1938(undefined as never).w) } as never);
const K: Record<number, string> = { 53: 'launch', 54: 'icpt', 55: 'det', 44: 'land' };
const tot: Record<string, number> = { launch: 0, icpt: 0, det: 0, land: 0 };
for (let y = 1; y <= years; y++) {
  const yr: Record<string, number> = { launch: 0, icpt: 0, det: 0, land: 0 };
  sim.step(8760, (w) => {
    const ev = w.out.events;
    for (let i = 0; i < ev.length; i += 6) { const k = K[ev[i + 1]!]; if (k) yr[k]!++; }
    w.out.events.length = 0; w.out.fires.length = 0;
  });
  for (const k in yr) tot[k]! += yr[k]!;
  console.log(`y${y} hash ${(sim.hash() >>> 0).toString(16)} ${Object.entries(yr).map(([k, v]) => `${k} ${v}`).join(' ')}`);
}
console.log(`TOTAL seed ${seed} ${years}y ${Object.entries(tot).map(([k, v]) => `${k} ${v}`).join(' ')}`);
console.log('done:');
