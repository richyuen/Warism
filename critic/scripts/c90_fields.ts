// Critic run 90 (new): does plain 1938 SEED still send a capital to the field (CapitalMoved to no city: the move that
// runs enemyDistance's search) within HOURS? R89-N3's guard (R215) and R209's case rest on it for seed 88901.
// Usage: npx tsx critic/scripts/c90_fields.ts <seed> [hours=9600]
import { EventKind } from '../../src/shared/events';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { loadAssets1938 } from '../../tools/headless/assets';
const [seed, hours = 9600] = process.argv.slice(2).map(Number);
const sim = new Sim({ scenario: '1938', seed: seed!, assets: loadAssets1938(SIZE_1938.w) });
const fields: number[] = [];
for (let h = 0; h < hours!; h += 24) sim.step(24, (w) => { const ev = w.out.events; for (let i = 0; i < ev.length; i += 6) if (ev[i + 1] === EventKind.CapitalMoved && ev[i + 3] === 0) fields.push(Math.floor(w.tick / 24)); ev.length = 0; w.out.fires.length = 0; });
console.log(`seed ${seed} ${hours} h: ${fields.length} capitals to the field, days ${fields.join(',')}; hash ${sim.hash() >>> 0}`);
