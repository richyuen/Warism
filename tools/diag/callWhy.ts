/**
 * ROADMAP R80j: why a nation is not called to a war's side. From `afterTrack.ts`'s saved world at the track's end, steps
 * to the day before `day`, then each hour to the first declaration of `attacker` on `target`; just before it, asks of
 * `who`: its alliance and the blocs, a truce with the attacker, its wars, and `callSides`' sides.
 *
 * The world just before the declaration is saved to .cache/callWhy_<seed>_<day>.sav.gz and loaded from there later.
 *
 * Usage: npx tsx tools/diag/callWhy.ts <seed> <day> <attacker> <target> <who>
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { blocsOf, strengths } from '../../src/sim/ai/strategic';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { callSides } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';

const [seed, day, at, tt, wt] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]!, process.argv[5]!, process.argv[6]!];
const id = (t: string): number => TAGS_1938H.indexOf(t) + 1;
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const [a, t, who] = [id(at), id(tt), id(wt)];
const sim = new Sim({ scenario: '1938h', seed, assets: assets1938(SIZE_1938.w) });
const at0 = `.cache/callWhy_${seed}_${day}.sav.gz`;
sim.load(new Uint8Array(gunzipSync(readFileSync(existsSync(at0) ? at0 : `.cache/afterTrack_${seed}.sav.gz`))));
const w = sim.world;
const quiet = (x: World): void => {
  x.out.events.length = 0;
  x.out.fires.length = 0;
};
while (Math.floor(w.tick / 24) < day - 1) sim.step(24, quiet);
const atWar = (): boolean => w.wars.atWar(a, t);
let before = sim.save();
for (let h = 0; h < 24 * 4 && !atWar(); h++) {
  before = sim.save();
  sim.step(1, quiet);
}
if (!atWar()) throw new Error(`no war of ${at} on ${tt} by day ${day + 3}`);
sim.load(before);
if (!existsSync(at0)) writeFileSync(at0, gzipSync(before));
const al = w.alliances;
const mine = al.allianceOf(who);
const blocs = blocsOf(w, strengths(w));
process.stdout.write(`day ${Math.floor(w.tick / 24)} hour ${w.tick % 24}: ${wt} alliance ${mine ? `${mine.id} ${mine.nameKey} of ${tag(mine.leader)}` : 'none'}; blocs ${[...blocs].join(',')}; ${tt}'s ${al.allianceOf(t)?.id ?? 'none'}\n`);
process.stdout.write(`truce ${wt}-${at} ${w.wars.inTruce(who, a, w.tick)}; at war ${wt}-${at} ${w.wars.atWar(who, a)}; ended ${w.track?.ended}; warheads ${w.warheads.size}\n`);
for (const war of w.wars.list) if (war.sides[0].includes(who) || war.sides[1].includes(who)) process.stdout.write(`  war ${war.sides[0].map(tag).join('+')} v ${war.sides[1].map(tag).join('+')}\n`);
for (const g of al.guarantees) if ([who, a, t].includes(g.guarantor) || [who, a, t].includes(g.target)) process.stdout.write(`  guarantee ${tag(g.guarantor)} of ${tag(g.target)}
`);
// A puppet's rising on its overlord is its own (PLAN 3.8f): its overlord's allies have a bond with it (`bond`).
process.stdout.write(`allied ${wt}-${at} ${al.allied(who, a)}; overlords ${tag(w.nations.cols.overlord[who]!)} ${tag(w.nations.cols.overlord[a]!)}
`);
const [x, y] = callSides(w, a, t);
process.stdout.write(`callSides: ${x.map(tag).join('+')} v ${y.map(tag).join('+')}\n`);
