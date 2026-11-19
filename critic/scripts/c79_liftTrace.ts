// Critic run 79 (new): the `lift` break of diploInvariants 64015 random --heroes (day 1411, ARG on #105). Steps the run's
// main world (no probes: probes act on copies) to DAY-1, then hour by hour to DAY+1: for each WarDeclared by NATION, the
// events of that hour (kind names and fields), the declarer's seaLift at the hour before and at that hour, its transport
// groups at port, the war's sides, whether the sides touch, the defender's overlord and the alliances of both.
// Env D=<id>: each hour, whether NATION and D touch, D's wars, the sides declareWar would call (callSides), whether they touch, noLift.
// Usage: npx tsx critic/scripts/c79_liftTrace.ts <seed> <scenario|random> <day> <TAG> [--heroes]
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { homeNeighbours, neighbourMap } from '../../src/sim/ai/strategic';
import { seaLift, sidesTouch } from '../../src/sim/ai/seaLift';
import { transportGroupsAtPort } from '../../src/sim/systems/amphibious';
import { Sim } from '../../src/sim/sim';
import { callSides } from '../../src/sim/systems/war';
import { noLift } from '../../src/sim/ai/seaLift';
import { assets1938 } from '../../tests/helpers/earth';

const argv = process.argv.slice(2);
const heroes = argv.includes('--heroes');
const [seedS, dipl, dayS, TAG] = argv.filter((a) => !a.startsWith('--'));
const seed = Number(seedS), day = Number(dayS);
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const nat = TAGS_1938.indexOf(TAG!) + 1;
const kindName = (k: number): string => (EventKind as unknown as Record<number, string>)[k] ?? String(k);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { diplomacy: dipl as 'scenario' | 'random', ...(heroes ? { heroes: 'on' as const } : {}) } });
const clear = (x: { out: { events: number[]; fires: number[] } }): void => { x.out.events.length = 0; x.out.fires.length = 0; };
s.step(24 * (day - 1), clear);
let before = seaLift(s.world, nat);
for (let h = 0; h < 48; h++) {
  let hit: number[] = [];
  const D = Number(process.env.D ?? 0);
  if (D) { const w0 = s.world; const t = w0.wars.list.filter((x) => x.sides.some((sd) => sd.includes(D))).map((x) => x.sides.map((sd) => sd.map(tag).join('+')).join(' v ')); console.log(`tick ${w0.tick}: touch(${tag(nat)}, ${tag(D)}) ${sidesTouch(w0, [nat], [D])}; land nb ${neighbourMap(w0).get(nat)?.has(D)}; ${tag(D)} overlord ${tag(w0.nations.cols.overlord[D]!)}; wars of ${tag(D)}: ${t.join('; ')}; callSides ${JSON.stringify(callSides(w0, nat, D).map((sd) => sd.map(tag)))} touch ${sidesTouch(w0, ...callSides(w0, nat, D))} noLift ${noLift(w0, nat, callSides(w0, nat, D))}`); }
  s.step(1, (x) => { hit = [...x.out.events]; clear(x); });
  const w = s.world;
  for (let i = 0; i < hit.length; i += 6) {
    if (hit[i + 1] !== EventKind.WarDeclared || hit[i + 2] !== nat) continue;
    const d = hit[i + 3]!;
    const war = w.wars.list.find((x) => x.sides[0][0] === nat && x.sides[1][0] === d);
    const nc = w.nations.cols;
    console.log(`day ${(w.tick / 24).toFixed(2)} tick ${w.tick}: ${tag(nat)} declares on ${tag(d)}`);
    console.log(`  seaLift before ${JSON.stringify(before)} now ${JSON.stringify(seaLift(w, nat))}; groups at port ${transportGroupsAtPort(w, nat).length}`);
    console.log(`  war sides ${war ? JSON.stringify(war.sides.map((sd) => sd.map(tag))) : 'none'}; touch ${war ? sidesTouch(w, war.sides[0], war.sides[1]) : '-'}`);
    console.log(`  land neighbours ${neighbourMap(w).get(nat)?.has(d)}; home neighbours ${homeNeighbours(w, nat)?.has(d)}`);
    console.log(`  ${tag(d)}: living ${nc.living[d]} overlord ${tag(nc.overlord[d]!)} allied with ${tag(nat)} ${w.alliances.allied(nat, d)}; ${tag(nat)} overlord ${tag(nc.overlord[nat]!)}`);
    console.log(`  the hour's events:`);
    for (let j = 0; j < hit.length; j += 6) console.log(`    ${kindName(hit[j + 1]!)} ${tag(hit[j + 2]!)} ${tag(hit[j + 3]!)} ${hit[j + 4]} ${hit[j + 5]}`);
  }
  before = seaLift(s.world, nat);
}
console.log('done:');
