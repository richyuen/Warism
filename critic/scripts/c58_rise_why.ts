// Critic run 52 (new): why the rising of DEI on NED (seed 20429, 1938, random diplomacy, t13104) was refused. Steps
// to the hour before, then does what puppets.ts does at the rising (release, leave the wars beside, alliance check)
// and prints whyNotWar's refusal, with the alliances and wars of both.
import { Refusal } from '../../src/shared/commands';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import { releasePuppet } from '../../src/sim/systems/puppets';
import { leaveWarsBeside, whyNotWar } from '../../src/sim/systems/war';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const s = new Sim({ scenario: '1938', seed: 20429, assets: assets1938(SIZE_1938.w), options: { diplomacy: 'random' } } as never);
const clear = (w: World): void => { w.out.events.length = 0; w.out.fires.length = 0; };
s.step(13103, clear);
const w = s.world;
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
const DEI = nationId('DEI'), NED = nationId('NED');
const nc = w.nations.cols;
const R = Object.fromEntries(Object.entries(Refusal).map(([k, v]) => [v, k]));
console.log('tick', w.tick, 'DEI loyalty', nc.loyalty[DEI], 'autonomy', nc.autonomy[DEI], 'overlord', tag(nc.overlord[DEI]!));
console.log('allied DEI-NED', w.alliances.allied(DEI, NED));
console.log('alliances', JSON.stringify((w.alliances as unknown as { list?: unknown }).list ?? null)?.slice(0, 600));
console.log('before: whyNotWar', R[whyNotWar(w, DEI, NED)]);
releasePuppet(w, DEI, true);
leaveWarsBeside(w, DEI, [NED]);
console.log('after release+leave: whyNotWar', R[whyNotWar(w, DEI, NED)], 'wars of DEI', w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(DEI))).length);
console.log('wars of NED', w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(NED))).map((x) => x.sides.map((sd) => sd.map(tag).join('+')).join(' vs ')).join(' ; '));
console.log('done:');
