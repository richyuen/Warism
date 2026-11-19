// Critic run 80 (new): R79-B1's discriminating check. The world of 64015 random --heroes is stepped to the hour before
// ARG's declaration on #105 (tick 33864); there, without stepping: seaLift(ARG), noLift, then declareWar(ARG, #105) by
// hand and seaLift(ARG) again. If the lift jumps from 16,294 to about 84,894 at the declaration itself, the jump the
// trace saw is an effect of the war (men freed by it), and the gate, asked before, said no: the door is unguarded.
// Usage: npx tsx critic/scripts/c85_liftJump.ts [seed=64015] [tick=33864] [A=ARG] [D=105]
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { noLift, seaLift } from '../../src/sim/ai/seaLift';
import { callSides, declareWar } from '../../src/sim/systems/war';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';

const seed = Number(process.argv[2] ?? 64015), tick = Number(process.argv[3] ?? 33864);
const A = TAGS_1938.indexOf(process.argv[4] ?? 'ARG') + 1, D = Number(process.argv[5] ?? 105);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { diplomacy: 'random', heroes: 'on' } });
s.step(tick, (x) => { x.out.events.length = 0; x.out.fires.length = 0; });
const w = s.world;
console.log(`tick ${w.tick}: seaLift ${JSON.stringify(seaLift(w, A))}; noLift ${noLift(w, A, callSides(w, A, D))}; at war ${w.wars.atWar(A, D)}`);
declareWar(w, A, D);
console.log(`after declareWar by hand (no step): at war ${w.wars.atWar(A, D)}; seaLift ${JSON.stringify(seaLift(w, A))}`);
console.log('done:');
