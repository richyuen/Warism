// Critic run 52 (copy of c52_rise.ts, stops on a revolt or a release). Critic run 52 (new): diploInvariants 20429 (1938, random diplomacy) broke `rise` on day 546: "DEI rose on NED and is
// not at war with it". Steps the same run to the hour of the revolt and logs every event naming DEI or NED that hour
// and the next 48, with the wars between them and their bond after each hour.
// Usage: npx tsx critic/scripts/c52_rise.ts [seed] [day]
import { EventKind } from '../../src/shared/events';
import { SIZE_1938, TAGS_1938 } from '../../src/sim/scenario1938';
import { Sim } from '../../src/sim/sim';
import type { World } from '../../src/sim/world';
import { assets1938 } from '../../tests/helpers/earth';
import { nationId } from '../../tests/helpers/sim1938';

const seed = Number(process.argv[2] ?? 20429);
const day = Number(process.argv[3] ?? 546);
const s = new Sim({ scenario: '1938', seed, assets: assets1938(SIZE_1938.w), options: { diplomacy: 'random' } } as never);
const DEI = nationId('DEI');
const NED = nationId('NED');
const name = Object.fromEntries(Object.entries(EventKind).map(([k, v]) => [v, k]));
const tag = (n: number): string => TAGS_1938[n - 1] ?? `#${n}`;
let log: string[] = [];
const take = (w: World): void => {
  const e = w.out.events;
  for (let i = 0; i < e.length; i += 6) {
    const a = e[i + 2]!, b = e[i + 3]!;
    if ([a, b].includes(DEI) || [a, b].includes(NED)) log.push(`t${e[i]} ${name[e[i + 1]!]} a=${tag(a)} b=${tag(b)} ${e[i + 4]} ${e[i + 5]}`);
  }
  e.length = 0;
  w.out.fires.length = 0;
};
s.step(24 * (day - 3), take);
log = [];
let seen = -1;
for (let h = 0; h < 24 * 6; h++) {
  s.step(1, take);
  const w = s.world;
  const nc = w.nations.cols;
  const st = `t${w.tick} DEI living ${nc.living[DEI]} overlord ${tag(nc.overlord[DEI]!)} | NED living ${nc.living[NED]} | atWar ${w.wars.atWar(DEI, NED)} | wars with DEI: ${w.wars.list.filter((x) => x.sides.some((sd) => sd.includes(DEI))).map((x) => x.sides.map((sd) => sd.map(tag).join('+')).join(' vs ')).join('; ')}`;
  if (log.some((l) => (l.includes('PuppetRevolt') || l.includes('PuppetReleased'))) && seen < 0) seen = w.tick;
  if (seen >= 0 || log.length) { console.log(log.join('\n')); console.log(st); }
  log = [];
  if (seen >= 0 && w.tick > seen + 48) break;
}
console.log('done:');
