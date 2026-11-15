// Critic run 72 (new): how the two bloc leaders at the track's end (USA, SOV) come to be on opposite sides of a war after
// it (c72_afterTrack 55601: 417 days). From the afterTrack save, hour by hour until they are: the war, its sides, and the
// WarDeclared / WarJoined rows of that war's nations in the hours before. Usage: npx tsx critic/scripts/c72_leadersWar.ts <seed> [days]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { SIZE_1938 } from '../../src/sim/scenario1938';
import { SEED_1938H, TAGS_1938H } from '../../src/sim/scenario1938h';
import { Sim } from '../../src/sim/sim';
import { assets1938 } from '../../tests/helpers/earth';
const seed = Number(process.argv[2] ?? 55601);
const days = Number(process.argv[3] ?? 1200);
const tag = (n: number): string => TAGS_1938H[n - 1] ?? `#${n}`;
const sim = new Sim({ scenario: '1938h', seed: SEED_1938H, assets: assets1938(SIZE_1938.w), options: { after: seed } });
sim.load(new Uint8Array(gunzipSync(readFileSync(`critic/c72_atcache/afterTrack_${seed}.sav.gz`))));
const w = sim.world;
const USA = TAGS_1938H.indexOf('USA') + 1, SOV = TAGS_1938H.indexOf('SOV') + 1;
const dateOf = (tick: number): string => new Date(Date.UTC(1938, 0, 1) + tick * 3600000).toISOString().slice(0, 13);
const log: string[] = [];
let found = false;
for (let h = 0; h < days * 24 && !found; h++) {
  sim.step(1, (x) => {
    const ev = x.out.events;
    for (let i = 0; i < ev.length; i += 6) {
      const k = ev[i + 1]!;
      if (k === 12) log.push(`${dateOf(ev[i]!)} WarDeclared ${tag(ev[i + 2]!)} on ${tag(ev[i + 3]!)}`);
      if (k === 78) log.push(`${dateOf(ev[i]!)} WarJoined ${tag(ev[i + 2]!)} with ${tag(ev[i + 3]!)} by ${ev[i + 5]}`);
    }
    if (log.length > 400) log.splice(0, log.length - 400);
    x.out.events.length = 0; x.out.fires.length = 0;
  });
  const war = w.wars.list.find((x) => (x.sides[0].includes(USA) && x.sides[1].includes(SOV)) || (x.sides[1].includes(USA) && x.sides[0].includes(SOV)));
  if (war) {
    found = true;
    const names = new Set([...war.sides[0], ...war.sides[1]].map(tag));
    console.log(`${dateOf(w.tick)} USA and SOV opposed: ${war.sides[0].map(tag).join('+')} v ${war.sides[1].map(tag).join('+')} (began ${dateOf(war.startTick)})`);
    for (const l of log.filter((l) => [...names].some((n) => l.includes(` ${n} `) || l.endsWith(` ${n}`) || l.includes(` ${n} by`))).slice(-30)) console.log(`  ${l}`);
  }
}
if (!found) console.log('not opposed in the days run');
console.log('done:');
